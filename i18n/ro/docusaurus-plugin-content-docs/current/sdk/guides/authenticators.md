---
slug: /sdk/guides/authenticators
title: Autentificatori și cheltuieli delegate
sidebar_label: Autentificatori
sidebar_position: 8
---

# Autentificatori și cheltuieli delegate

**Benzile de autentificatori** (SDK 0.7.0, chain **v3.1.85**) permit unei chei
externe conectate — o cheie Phantom **ed25519** sau o cheie MetaMask / EVM
**secp256k1** — să cheltuiască din contul canonic UNIC cu **PQC obligatoriu**,
în condiții de privilegii minime, cu limite de cheltuieli și revocabile,
**fără ca cheia externă să producă vreodată o co-semnătură ML-DSA**.

Aceasta este contrapartea din SDK a modulului de
[abstractizare a conturilor](/developer-guide/account-abstraction) de pe chain.

:::danger Indisponibil pe mainnet
Modulul `x/abstractaccount` este **dezactivat** pe `qorechain-vladi` (mainnet):
`GET /qorechain/abstractaccount/v1/config` returnează `"enabled": false`. Începând cu
chain v3.2.0, acest indicator este aplicat pe fiecare cale (crearea unui cont abstract,
conectarea unui autentificator și atât `MsgExecuteEVM`, cât și `MsgExecuteCosmos`), iar
chain-ul le refuză cu `abstract account module is disabled` (cod 9). Nicio tranzacție
nu îl poate activa. Pe testnet-ul `qorechain-diana`, aceeași rută a returnat
`"enabled": true` pe 27 octombrie 2026, deci fluxurile de mai jos pot fi încercate
acolo. Nu construiți un flux cu cheie conectată sau cu cheltuieli delegate pentru
mainnet până când modulul nu este activat acolo și verificați indicatorul pe rețeaua
țintă înainte de a oferi un astfel de flux.
:::

## Modelul cu relayer

Un **relayer** trimite tranzacția și plătește comisioanele. Semnătura hibridă
proprie a relayer-ului (clasică + ML-DSA-87) satisface ante handler-ul pe
anvelopă, astfel încât semnătura PQC a contului canonic **nu** este necesară
on-chain. Autorizarea este, în schimb, semnătura cheii conectate peste un
digest **sign-bytes** separat pe domenii și protejat împotriva reluării
(replay-bound).

```text
 Phantom / MetaMask key            Relayer (pays fees)             Chain
 ─────────────────────            ───────────────────            ─────
 sign(authSignBytes)  ──────────▶ wrap in Msg, sign envelope ──▶ verify authenticator sig
                                                                  check permission + rule
                                                                  spend FROM canonical account
```

Relayer-ul este un cont **diferit** de cel al proprietarului. Nonce-ul pe care îl
semnează autentificatorul este propria secvență a cheii conectate, ținută de
chain (vezi [Nonces](#nonces)), nu nonce-ul EVM al contului.

## Cele trei benzi

| Bandă | Mesaj | Sign-bytes | Cheltuiește |
| --- | --- | --- | --- |
| EVM | `MsgExecuteEVM` | `evmAuthSignBytes` | QOR nativ / apel EVM de la adresa `0x` a contului |
| Nativă | `MsgExecuteCosmos` | `cosmosAuthSignBytes` | QOR nativ prin `x/bank` din cont |
| Rotația cheii | `MsgRotatePQCKey` | `rotationSignBytes` | (rotește cheia PQC a contului) |

URL-urile de tip ale mesajelor sunt `/qorechain.abstractaccount.v1.MsgExecuteEVM`,
`/qorechain.abstractaccount.v1.MsgExecuteCosmos` și
`/qorechain.pqc.v1.MsgRotatePQCKey`.

## Înregistrarea unui autentificator Phantom

Conectarea unei chei este **semnată de proprietar** (o tranzacție hibridă
normală a contului canonic): `MsgRegisterAuthenticator` specifică cheia
(schemă + octeții bruți ai cheii publice), permisiunile acordate
(`permissions`) și un termen de sesiune `expiryUnix`. Limitele de cheltuieli
se atașează printr-un `SpendingRule` prin `MsgUpdateSpendingRules`:

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

:::caution O regulă limitează o cheie doar dacă există una
Chain-ul rezolvă limita în această ordine: regula proprie a autentificatorului,
dacă este setată și `enabled`; altfel prima regulă `enabled` de pe cont; altfel
**niciuna, iar atunci nu există nicio limită**. O regulă stocată cu
`enabled: false` înseamnă lipsa limitei, nu o limită zero.
`MsgRegisterAuthenticator` nu poartă nicio regulă, deci o cheie conectată doar
prin acel mesaj este limitată numai de o regulă la nivel de cont. Setați o regulă
în mod deliberat prin `MsgUpdateSpendingRules` și înregistrați doar permisiunile
de care cheia are nevoie. O limită restrânge paguba pe care o poate face o cheie
conectată; nu înlocuiește revocarea cheii.
:::

Pentru a dezactiva instantaneu o cheie, proprietarul difuzează
`msg.abstractaccount.revokeAuthenticator({ owner, accountAddress, scheme,
pubkey })`.

## Cheltuieli din Phantom (banda Nativă, printr-un relayer)

Odată ce cheia este conectată, browserul construiește un `MsgExecuteCosmos`
gata pentru relayer: `buildPhantomExecuteCosmos` reconstruiește digestul
separat pe domenii, îl pune la semnat în Phantom (`signMessage`) și returnează
mesajul `{ typeUrl, value }`.

**Browser (utilizatorul Phantom):**

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

**Server (relayer-ul):** semnează anvelopa cu **propriul** său cont, folosind
calea hibridă (`signAndBroadcastHybrid`, transmițând `rest`), și plătește
comisioanele. Cheia ML-DSA-87 a relayer-ului trebuie să fie înregistrată, ca a
oricărui cont. Semnătura autentificatorului din interiorul mesajului este
autorizarea de a cheltui din contul proprietarului.

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

// The relayer's OWN account: a different account than the owner.
const mnemonic = process.env.RELAYER_MNEMONIC!;
const relayer = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(relayer.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(relayer.address, mnemonic);

const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(relayer.address);

// `msgExecute` is the message decoded from the request. The relayer pays fees.
const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [msgExecute],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,
  transport,
});
console.log(result.transactionHash);
```

O versiune completă, rulabilă cap-coadă (cu o cheie ed25519 locală în locul
Phantom), este exemplul
[`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).

## Cheltuieli din MetaMask (banda EVM)

O cheie MetaMask se conectează prin **adresa sa ETH de 20 de octeți** (schema
`secp256k1`) cu `registerEthAuthenticatorMsg` și autorizează cheltuielile
printr-o semnătură `personal_sign` EIP-191 de 65 de octeți peste același tip
de digest.

**1) Proprietarul conectează adresa MetaMask** (semnat de proprietar, hibrid):

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

**2) MetaMask autorizează un transfer EVM** — `buildMetaMaskExecuteEvm`
construiește digestul, solicită `personal_sign` (EIP-191) de la provider și
returnează un `MsgExecuteEVM` gata pentru relayer:

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
  nonce: authSequence,         // the linked key's authenticator sequence (see Nonces) — NOT the EVM nonce
  digestVersion: "v2",         // from chain v3.2.3 (see "Sign-bytes"); use resolveEvmAuthDigestVersion
});
// hand `msgExecute` to the relayer, exactly as in the Phantom flow
```

`buildMetaMaskExecuteCosmos` funcționează la fel pentru banda Nativă
(`to: "qor1…"`, `amount: "100uqor"`, `nonce` = secvența per-autentificator).
Există și compozitori de nivel jos corespunzători — `executeEvmMsg`,
`executeCosmosMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`,
`rotatePqcKeyMsg` — dacă vă gestionați singuri cheile și semnăturile.

## Sign-bytes (exact la nivel de octet)

Doi ajutători pentru octeți: `BE64(n)` este un întreg big-endian pe 8 octeți;
`LP(bytes)` este `BE64(len) ‖ bytes` (cu prefix de lungime).

**Banda EVM** — `evmAuthSignBytes({ chainId, account, pubkey, to, value, data, nonce })`
returnează un digest de 32 de octeți:

```text
sha256( "qorechain-evm-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) )
```

`to` este destinatarul în format hex `0x`, `value` este șirul zecimal în wei,
`data` este calldata brută.

**Banda EVM, v2 (chain v3.2.3)** — `evmAuthSignBytesV2({ …, gasLimit })` adaugă
limita de gaz a apelului, astfel încât un relayer să nu poată relua o semnătură
validă cu o altă limită. Chain-ul verifică exact o singură formă pe bloc: v1 sub
upgrade-ul v3.2.3, v2 de la acesta încolo. `resolveEvmAuthDigestVersion({ rest })`
returnează `"v2"` după ce rețeaua a aplicat v3.2.3 și `"v1"` înainte, iar
`buildPhantomExecuteEvm` / `buildMetaMaskExecuteEvm` primesc `digestVersion`
(implicit `"v1"`, deci transmiteți `"v2"` pe o rețea cu v3.2.3 sau mai nou).
`gasLimit` trebuie să fie nenul.

```text
sha256( "qorechain-evm-auth-v2"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(value) ‖ LP(data) ‖ BE64(nonce) ‖ BE64(gasLimit) )
```

**Banda Nativă** — `cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce })`
returnează un digest de 32 de octeți:

```text
sha256( "qorechain-cosmos-auth-v1"
        ‖ LP(chainId) ‖ LP(account) ‖ LP(pubkey)
        ‖ LP(to) ‖ LP(amount) ‖ BE64(nonce) )
```

`amount` este șirul canonic cu o singură monedă (de ex. `100uqor`).

**Rotație** — `rotationSignBytes(chainId, algorithmId, account, oldPub, newPub)`
returnează șirul pe care îl semnează ambele chei (UTF-8 al acestuia):

```text
qorechain-pqc-rotate-v1|<chainId>|<algorithmId>|<account>|<oldHex>|<newHex>
```

## Nonces {#nonces}

Ambele benzi folosesc **secvența per-autentificator** pentru `(account, pubkey)`:
un contor pe care chain-ul îl ține pentru fiecare cheie conectată, începând de
la 0 și incrementat la fiecare execuție reușită.

- `MsgExecuteEVM.nonce` este acest contor, **nu** nonce-ul EVM al contului
  (`eth_getTransactionCount`).
- `MsgExecuteCosmos.nonce` este același tip de contor.

Începând cu chain v3.2.4 (ambele rețele servesc ruta) și SDK 0.10.0 puteți citi
contorul în loc să îl urmăriți: `fetchAuthNonce({ rest, address, pubkey })` apelează
`GET /qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` și returnează
`{ nonce, linked }`. O cheie care nu a executat niciodată nimic citește 0, iar
contorul este păstrat chiar și pentru o cheie care nu mai este conectată (`linked`
spune care este cazul). Trimiterea unei valori care nu este contorul curent al
chain-ului este o respingere pentru reluare (replay) (`abstractaccount` cod 11, vezi
mai jos). Cu un SDK sau un chain mai vechi, urmăriți-l pentru fiecare cheie
conectată: 0 pentru o cheie nou conectată, +1 după fiecare execuție acceptată de
chain.

## Schema de permisiuni

Chain-ul publică taxonomia canonică a permisiunilor de autentificator, astfel
încât clienții să valideze scope-urile fără a codifica șiruri în mod fix și să
detecteze derapajele prin `schema_version`:

```ts
// REST (LCD):
const schema = await client.rest.getPermissionSchema();

schema.schema_version;      // bumps on any taxonomy/mapping change
schema.permissions;         // ["send", "evm", "svm", "all", ...]
schema.msg_permissions;     // { "/qorechain.abstractaccount.v1.MsgExecuteEVM": "evm", ... }
schema.key_management_msgs; // typeURLs NEVER delegable to a linked key
```

Ruta REST este `GET /qorechain/abstractaccount/v1/permission_schema`; clientul
tipizat de interogare gRPC expune aceleași date ca
`clients.abstractaccount.permissionSchema()`. Modulul mai servește și
`/config`, `/accounts` și `/accounts/{address}`.

## Coduri de eroare

Eșecurile se decodează prin `decodeTxError`, cu un `kind` prietenos:

| Codespace | Cod | Kind |
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

`hybrid_verify_failed` înseamnă că semnătura ML-DSA-87 nu s-a verificat. Semnarea
hedged nu este cauza (chain-ul acceptă la fel semnăturile ML-DSA-87 hedged și
deterministe); vezi
[Depanarea codului 21](/developer-guide/post-quantum-signing#code-21). Este, de
asemenea, ceea ce vedeți dacă un SDK anterior versiunii 0.6.1 a codificat în JSON
extensia hibridă (faceți upgrade - vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc#hybrid-signing)).

## Rotația cheii {#key-rotation}

Rotiți cheia ML-DSA-87 a unui cont către o cheie nouă a **aceluiași**
algoritm — de exemplu, migrarea unei chei legacy derivate prin chain-bridge
(`shake256(mnemonic)`) către cheia canonică legată de adresă
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

`derivePqcLegacy(mnemonic)` reproduce de una singură perechea de chei legacy
atunci când aveți nevoie de ea (de ex. pentru a continua semnarea până când
rotația este confirmată on-chain).

## Pașii următori

- [Conturi și semnare PQC](/sdk/concepts/accounts-pqc) — conturi unificate și
  semnare hibridă.
- [Abstractizarea conturilor](/developer-guide/account-abstraction) — modulul
  de pe partea de chain.
- Exemplu rulabil:
  [`authenticator-spend`](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend).
