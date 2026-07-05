---
slug: /sdk/guides/authenticators
title: Authenticatoren & delegiertes Ausgeben
sidebar_label: Authenticatoren
sidebar_position: 8
---

# Authenticatoren & delegiertes Ausgeben

**Authenticator-Lanes** (SDK 0.7.0, Chain **v3.1.85**) erlauben es einem
verknüpften externen Schlüssel — einem Phantom-**ed25519**-Schlüssel oder einem
MetaMask-/EVM-**secp256k1**-Schlüssel — vom EINEN kanonischen
**PQC-pflichtigen** Konto auszugeben: nach dem Prinzip der geringsten
Berechtigung, mit Ausgabenlimits und jederzeit widerrufbar, **ohne dass der
externe Schlüssel jemals eine ML-DSA-Co-Signatur erzeugt**.

Dies ist das SDK-Gegenstück zum
[Account-Abstraction](/developer-guide/account-abstraction)-Modul der Chain.

## Das Relayer-Modell

Ein **Relayer** reicht die Transaktion ein und bezahlt die Gebühren. Die eigene
hybride Signatur des Relayers (klassisch + ML-DSA-87) erfüllt den Ante-Handler
auf dem Envelope, sodass die PQC-Signatur des kanonischen Kontos on-chain
**nicht** benötigt wird. Die Autorisierung ist stattdessen die Signatur des
verknüpften Schlüssels über einen domänen-separierten, replay-gebundenen
**Sign-Bytes**-Digest.

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

Der Relayer ist ein **anderes** Konto als der Eigentümer und erhöht daher die
EVM-Nonce des Kontos nicht.

## Die drei Lanes

| Lane | Message | Sign-Bytes | Gibt aus |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | natives QOR / EVM-Call von der `0x`-Adresse des Kontos |
| Native | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | natives QOR über `x/bank` vom Konto |
| Schlüsselrotation | `MsgRotatePQCKey` | `rotationSignBytes` | (rotiert den PQC-Schlüssel des Kontos) |

Die Message-Typ-URLs sind `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` und
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Einen Phantom-Authenticator registrieren

Das Verknüpfen eines Schlüssels ist **owner-signiert** (eine normale hybride
Transaktion des kanonischen Kontos): `MsgRegisterAuthenticator` benennt den
Schlüssel (Schema + rohe Pubkey-Bytes), die gewährten `permissions` und eine
`expiryUnix`-Sitzungsfrist. Ausgabenlimits werden mit einer `SpendingRule` über
`MsgUpdateSpendingRules` angehängt:

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

Um einen Schlüssel sofort zu deaktivieren, broadcastet der Eigentümer
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Von Phantom ausgeben (Native-Lane, über einen Relayer)

Sobald der Schlüssel verknüpft ist, baut der Browser eine relayer-fertige
`MsgExecuteCosmos`: `buildPhantomExecuteCosmos` rekonstruiert den
domänen-separierten Digest, lässt ihn von Phantom signieren (`signMessage`)
und liefert die `{ typeUrl, value }`-Message zurück.

**Browser (der Phantom-Nutzer):**

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

**Server (der Relayer):** signiert den Envelope mit seinem **eigenen** Konto
(hybrid, wie auf dem Native-Pfad üblich) und bezahlt die Gebühren. Die Signatur
des Authenticators innerhalb der Message ist die Autorisierung, vom Konto des
Eigentümers auszugeben.

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

Eine lauffähige End-to-End-Version (mit einem lokalen ed25519-Schlüssel als
Stellvertreter für Phantom) ist das Beispiel
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## Von MetaMask ausgeben (EVM-Lane)

Ein MetaMask-Schlüssel wird über seine **20-Byte-ETH-Adresse** (Schema
`secp256k1`) mit `registerEthAuthenticatorMsg` verknüpft und autorisiert
Ausgaben mit einer 65-Byte-EIP-191-`personal_sign`-Signatur über dieselbe Art
von Digest.

**1) Der Eigentümer verknüpft die MetaMask-Adresse** (owner-signiert, hybrid):

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

**2) MetaMask autorisiert einen EVM-Transfer** — `buildMetaMaskExecuteEvm`
baut den Digest, fordert `personal_sign` (EIP-191) vom Provider an und liefert
eine relayer-fertige `MsgExecuteEVM` zurück:

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

`buildMetaMaskExecuteCosmos` funktioniert auf dieselbe Weise für die
Native-Lane (`to: "qor1…"`, `amount: "100uqor"`, `nonce` = die
Sequenz pro Authenticator). Es gibt passende Low-Level-Composer —
`executeEvmMsg`, `executeCosmosMsg`, `registerEthAuthenticatorMsg`,
`revokeAuthenticatorMsg`, `rotatePqcKeyMsg` — falls Sie Schlüssel und
Signaturen selbst verwalten.

## Sign-Bytes (byte-exakt)

Zwei Byte-Helfer: `BE64(n)` ist eine 8-Byte-Big-Endian-Ganzzahl; `LP(bytes)`
ist `BE64(len) ‖ bytes` (längenpräfixiert).

**EVM-Lane** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
liefert einen 32-Byte-Digest zurück:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` ist der `0x`-Hex-Empfänger, `value` der dezimale wei-String, `data` die
rohen Calldata.

**Native-Lane** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
liefert einen 32-Byte-Digest zurück:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` ist der kanonische Single-Coin-String (z. B. `100uqor`).

**Rotation** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
liefert den String zurück, den beide Schlüssel signieren (dessen UTF-8):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces

- `MsgExecuteEVM.nonce` = die **aktuelle EVM-Nonce** des Kontos (der Relayer
  ist ein anderes Konto und erhöht die Nonce des Eigentümers nicht — also
  **nicht** 1 addieren).
- `MsgExecuteCosmos.nonce` = die **Sequenz pro Authenticator** für
  `(account, pubkey)` — ein Store-Zähler, getrennt von der eigenen Sequenz des
  Kontos, der bei jeder erfolgreichen Native-Lane-Ausgabe inkrementiert wird.

Eine falsche Nonce führt zu einer Replay-Ablehnung
(`abstractaccount` Code 11, siehe unten).

```ts
// EVM lane: the account's current nonce, straight from the EVM JSON-RPC.
const evmNonce = await client.evm.call<string>("eth_getTransactionCount", [
  account0x,
  "latest",
]);
```

## Das Permission-Schema

Die Chain veröffentlicht die kanonische Authenticator-Permission-Taxonomie,
damit Clients Scopes validieren können, ohne Strings zu hartkodieren, und
Abweichungen über `schema_version` erkennen:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

Die REST-Route ist `GET /qorechain/abstractaccount/v1/permission_schema`; der
typisierte gRPC-Query-Client stellt dieselben Daten als
`clients.abstractaccount.permissionSchema()` bereit. Das Modul bedient
außerdem `/config`, `/accounts` und `/accounts/{address}`.

## Fehlercodes

Fehlschläge werden über `decodeTxError` mit einem verständlichen `kind`
dekodiert:

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

`hybrid_verify_failed` bedeutet meist eine **hedged**
(nicht-deterministische) ML-DSA-87-Signatur — die Chain akzeptiert nur
deterministische Signaturen. Derselbe Fehler tritt auch auf, wenn ein SDK vor
0.6.1 die Hybrid-Extension JSON-kodiert hat (bitte upgraden — siehe
[Accounts & PQC-Signierung](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Schlüsselrotation {#key-rotation}

Rotieren Sie den ML-DSA-87-Schlüssel eines Kontos zu einem neuen Schlüssel
**desselben** Algorithmus — zum Beispiel bei der Migration eines
Legacy-Schlüssels aus der Chain-Bridge-Ableitung (`shake256(mnemonic)`) zum
kanonischen adressgebundenen Schlüssel
(`shake256("qorechain:pqc:v1|addr|mnemonic")`):

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

`derivePqcLegacy(mnemonic)` reproduziert das Legacy-Schlüsselpaar eigenständig,
wenn Sie es benötigen (z. B. um bis zum Abschluss der Rotation weiter zu
signieren).

## Weiter

- [Accounts & PQC-Signierung](/sdk/concepts/accounts-pqc) — vereinheitlichte
  Konten und hybride Signierung.
- [Account Abstraction](/developer-guide/account-abstraction) — das
  chain-seitige Modul.
- Lauffähiges Beispiel:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
