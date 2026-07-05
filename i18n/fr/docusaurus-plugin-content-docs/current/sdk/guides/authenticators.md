---
slug: /sdk/guides/authenticators
title: Authentificateurs et dépenses déléguées
sidebar_label: Authentificateurs
sidebar_position: 8
---

# Authentificateurs et dépenses déléguées

Les **voies d'authentificateur** (SDK 0.7.0, chaîne **v3.1.85**) permettent à une
clé externe liée — une clé **ed25519** Phantom, ou une clé **secp256k1**
MetaMask / EVM — de dépenser depuis LE compte canonique unique **à PQC
obligatoire**, selon des conditions de moindre privilège, plafonnées en dépenses
et révocables, **sans que la clé externe ne produise jamais de co-signature
ML-DSA**.

C'est le pendant côté SDK du module
[d'abstraction de compte](/developer-guide/account-abstraction) de la chaîne.

## Le modèle du relayeur

Un **relayeur** soumet la transaction et paie les frais. La signature hybride
(classique + ML-DSA-87) propre au relayeur satisfait le ante handler sur
l'enveloppe, si bien que la signature PQC du compte canonique n'est **pas**
requise on-chain. L'autorisation est à la place la signature de la clé liée sur
un condensat de **sign-bytes** à séparation de domaine et protégé contre le
rejeu.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

Le relayeur étant un compte **différent** de celui du propriétaire, il
n'incrémente pas le nonce EVM du compte.

## Les trois voies

| Voie | Message | Sign-bytes | Dépense |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | QOR natif / appel EVM depuis l'adresse `0x` du compte |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | QOR natif via `x/bank` depuis le compte |
| Rotation de clé | `MsgRotatePQCKey` | `rotationSignBytes` | (fait tourner la clé PQC du compte) |

Les URL de type des messages sont `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` et
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Enregistrer un authentificateur Phantom

La liaison d'une clé est **signée par le propriétaire** (une transaction hybride
normale du compte canonique) : `MsgRegisterAuthenticator` désigne la clé
(schéma + octets bruts de la clé publique), les `permissions` accordées et une
échéance de session `expiryUnix`. Les plafonds de dépense sont attachés avec une
`SpendingRule` via `MsgUpdateSpendingRules` :

```ts
import { msg } from "@qorechain/sdk";

// The Phantom wallet in the browser:
const phantomPubkey = window.solana.publicKey.toBytes(); // 32-byte ed25519

// 1) Link the key: least privilege ("send" only) + a session expiry.
const register = msg.abstractaccount.registerAuthenticator({
  owner: canonicalAccount,          // the PQC-required account ("qor1…")
  accountAddress: canonicalAccount, // the account the key may act for
  scheme: "ed25519",                // Phantom keys are ed25519
  pubkey: phantomPubkey,
  permissions: ["send"],            // e.g. "send", "evm", "svm" — never "all" for a hot key
  expiryUnix: String(Math.floor(Date.now() / 1000) + 7 * 24 * 3600), // 7 days
  label: "phantom",
});

// 2) Bound what it can move: per-tx and daily limits, uqor only.
const limits = msg.abstractaccount.updateSpendingRules({
  owner: canonicalAccount,
  accountAddress: canonicalAccount,
  rules: [
    {
      id: "phantom-hot",
      perTxLimit: "1000000",    // ≤ 1 QOR per spend
      dailyLimit: "10000000",   // ≤ 10 QOR per day
      allowedDenoms: ["uqor"],
      enabled: true,
    },
  ],
});

// Broadcast BOTH owner-signed (hybrid) — e.g. via the hybrid tx path:
// await signAndBroadcastHybrid({ ..., messages: [register, limits] });
```

Pour désactiver instantanément une clé, le propriétaire diffuse
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Dépenser depuis Phantom (voie Native, via un relayeur)

Une fois la clé liée, le navigateur construit un `MsgExecuteCosmos` prêt pour
le relayeur : `buildPhantomExecuteCosmos` reconstruit le condensat à séparation
de domaine, le fait signer par Phantom (`signMessage`) et renvoie le message
`{ typeUrl, value }`.

**Navigateur (l'utilisateur Phantom) :**

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// window.solana is a Phantom-style wallet: { publicKey, signMessage }.
const msgExecute = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,       // who will submit + pay fees
  chainId: "qorechain-vladi",
  account: canonicalAccount,     // the PQC-required owner
  to: recipient,                 // "qor1…"
  amount: "100uqor",             // single-coin amount string
  nonce,                         // the per-authenticator sequence for (account, pubkey)
});

// Ship `msgExecute` to your relayer service (it is already signed by Phantom):
await fetch("/api/relay", {
  method: "POST",
  body: JSON.stringify({
    typeUrl: msgExecute.typeUrl,
    value: {
      ...msgExecute.value,
      pubkey: Buffer.from(msgExecute.value.pubkey).toString("base64"),
      signature: Buffer.from(msgExecute.value.signature).toString("base64"),
      nonce: msgExecute.value.nonce.toString(),
    },
  }),
});
```

**Serveur (le relayeur) :** signe l'enveloppe avec son **propre** compte
(hybride, comme d'habitude sur la voie Native) et paie les frais. La signature
de l'authentificateur contenue dans le message constitue l'autorisation de
dépenser depuis le compte du propriétaire.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rpc: "https://rpc.qore.host",
    rest: "https://api.qore.host",
  },
});

// The relayer's OWN account — a different account than the owner.
const relayer = await deriveNativeAccount(process.env.RELAYER_MNEMONIC!);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const tx = await client.connectTx(signer);

// Decode the message from the request, then broadcast it (relayer pays fees).
const result = await tx.signAndBroadcast([msgExecute], { fee });
console.log(result.transactionHash);
```

Une version exécutable de bout en bout (avec une clé ed25519 locale tenant le
rôle de Phantom) est l'exemple
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## Dépenser depuis MetaMask (voie EVM)

Une clé MetaMask est liée par son **adresse ETH de 20 octets** (schéma
`secp256k1`) avec `registerEthAuthenticatorMsg`, et autorise les dépenses avec
une signature `personal_sign` EIP-191 de 65 octets sur le même type de
condensat.

**1) Le propriétaire lie l'adresse MetaMask** (signé par le propriétaire,
hybride) :

```ts
import { registerEthAuthenticatorMsg } from "@qorechain/sdk";

const [ethAddress] = await window.ethereum.request({
  method: "eth_requestAccounts",
  params: [],
});

const register = registerEthAuthenticatorMsg({
  owner: canonicalAccount,
  ethAddress,                 // 0x-hex 20-byte address = the authenticator pubkey
  permissions: ["evm"],       // EVM lane only
  expiryUnix: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 h session
  label: "metamask",
});
// broadcast owner-signed (hybrid), like any other message
```

**2) MetaMask autorise un transfert EVM** — `buildMetaMaskExecuteEvm` construit
le condensat, demande `personal_sign` (EIP-191) au fournisseur et renvoie un
`MsgExecuteEVM` prêt pour le relayeur :

```ts
import { buildMetaMaskExecuteEvm } from "@qorechain/sdk";

const msgExecute = await buildMetaMaskExecuteEvm({
  provider: window.ethereum,   // any EIP-1193 provider
  address: ethAddress,         // the linked 20-byte address (0x-hex)
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount,   // the PQC-required owner
  to: "0xRecipient…",          // 0x-hex recipient
  value: "1000000000000000000",// decimal wei string (EVM lane: 18 decimals)
  gasLimit: 100000,
  nonce: evmNonce,             // the account's CURRENT EVM nonce — do NOT +1
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` fonctionne de la même manière pour la voie Native
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = la séquence par
authentificateur). Il existe des composeurs bas niveau correspondants —
`executeEvmMsg`, `executeCosmosMsg`, `registerEthAuthenticatorMsg`,
`revokeAuthenticatorMsg`, `rotatePqcKeyMsg` — si vous gérez vous-même les clés
et les signatures.

## Sign-bytes (à l'octet près)

Deux fonctions utilitaires d'octets : `BE64(n)` est un entier big-endian de
8 octets ; `LP(bytes)` est `BE64(len) ‖ bytes` (préfixé par la longueur).

**Voie EVM** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
renvoie un condensat de 32 octets :

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` est le destinataire en hexadécimal `0x`, `value` la chaîne décimale en
wei, `data` le calldata brut.

**Voie Native** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
renvoie un condensat de 32 octets :

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` est la chaîne canonique à une seule pièce (par ex. `100uqor`).

**Rotation** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
renvoie la chaîne que les deux clés signent (son encodage UTF-8) :

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces

- `MsgExecuteEVM.nonce` = le **nonce EVM actuel** du compte (le relayeur est un
  compte différent et n'incrémente pas le nonce du propriétaire, donc
  n'ajoutez **pas** 1).
- `MsgExecuteCosmos.nonce` = la **séquence par authentificateur** pour
  `(account, pubkey)` — un compteur du store distinct de la séquence propre au
  compte, incrémenté à chaque dépense réussie sur la voie Native.

Se tromper de nonce provoque un rejet pour rejeu
(code 11 de `abstractaccount`, voir ci-dessous).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## Le schéma de permissions

La chaîne publie la taxonomie canonique des permissions d'authentificateur afin
que les clients valident les portées sans coder les chaînes en dur, et
détectent toute dérive via `schema_version` :

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

La route REST est `GET /qorechain/abstractaccount/v1/permission_schema` ; le
client de requêtes gRPC typé expose les mêmes données via
`clients.abstractaccount.permissionSchema()`. Le module sert également
`/config`, `/accounts` et `/accounts/{address}`.

## Codes d'erreur

Les échecs se décodent via `decodeTxError` avec un `kind` lisible :

| Codespace | Code | Kind |
| --- | --- | --- |
| `abstractaccount` | 5 | `spending_limit_exceeded` |
| `abstractaccount` | 6 | `session_key_expired` |
| `abstractaccount` | 10 | `permission_denied` |
| `abstractaccount` | 11 | `authenticator_replay` |
| `pqc` | 21 | `hybrid_verify_failed` |

```ts
import { decodeTxError } from "@qorechain/sdk";

const decoded = decodeTxError({
  code: result.code,
  codespace: result.codespace,
  rawLog: result.rawLog,
});

switch (decoded.kind) {
  case "spending_limit_exceeded": // over the per-tx or daily SpendingRule
    break;
  case "session_key_expired":     // expiryUnix passed — re-register the key
    break;
  case "permission_denied":       // scope missing — check the permission_schema
    break;
  case "authenticator_replay":    // wrong nonce — refetch and re-sign
    break;
  case "hybrid_verify_failed":    // ML-DSA sig did not verify (see note below)
    break;
}
```

`hybrid_verify_failed` signifie le plus souvent une signature ML-DSA-87
**hedged** (non déterministe) — la chaîne n'accepte que les signatures
déterministes. C'est aussi ce que vous voyez si un SDK antérieur à 0.6.1 a
encodé l'extension hybride en JSON (mettez à niveau — voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Rotation de clé {#key-rotation}

Faites tourner la clé ML-DSA-87 d'un compte vers une nouvelle clé du **même**
algorithme — par exemple pour migrer une clé héritée dérivée du chain-bridge
(`shake256(mnemonic)`) vers la clé canonique liée à l'adresse
(`shake256("qorechain:pqc:v1|addr|mnemonic")`) :

```ts
import { rotatePqcKeyMsgFromMnemonic, derivePqcLegacy } from "@qorechain/sdk";

const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account,
  mnemonic,
  chainId: "qorechain-vladi",
  // oldDerivation: "bridge" (legacy), newDerivation: "adapter" (canonical) by default
});
// broadcast `msg` BY the account, cosigned (hybrid) with the OLD key —
// both keys dual-sign the rotation bytes (old proves ownership, new proves control).
```

`derivePqcLegacy(mnemonic)` reproduit à elle seule la paire de clés héritée
quand vous en avez besoin (par ex. pour continuer à signer jusqu'à ce que la
rotation soit effective).

## Et ensuite

- [Comptes et signature PQC](/sdk/concepts/accounts-pqc) — comptes unifiés et
  signature hybride.
- [Abstraction de compte](/developer-guide/account-abstraction) — le module
  côté chaîne.
- Exemple exécutable :
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
