---
slug: /sdk/concepts/accounts-pqc
title: Conturi și semnare PQC
sidebar_label: Conturi și PQC
sidebar_position: 2
---

# Conturi și semnare PQC

Conturile QoreChain sunt derivate dintr-o singură frază mnemonică BIP-39. Există
două modele de conturi, ambele complet suportate:

- **Derivare HD per-lane (legacy/implicit)** — aceeași frază mnemonică produce un
  cont nativ (coin type 118), unul EVM (coin type 60) și unul SVM (coin type 501)
  prin căi de derivare independente. Trei chei, trei adrese.
- **Conturi unificate eth-native** (SDK 0.6.0, chain v3.1.83) — O SINGURĂ cheie
  `eth_secp256k1` este O SINGURĂ identitate de 20 de octeți redată ca toate cele
  trei codificări de adresă, cu un singur sold partajat. Vezi
  [Conturi unificate](#unified-accounts).

## Derivare HD (legacy/implicit, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

Fraza mnemonică este validată (cuvintele **și** suma de control) înainte ca vreo
cheie să fie derivată, astfel încât o greșeală de tastare ridică o eroare în loc
să producă în tăcere un cont greșit. Poți valida explicit cu
`validateMnemonic(mnemonic)`.

### Scheme de derivare

| Tip | Curbă | Cale | Adresă |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` din `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 al cheii publice de 32 de octeți |

Transmite un index de cont pentru a deriva conturi suplimentare. În TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

În Python/Go/Rust indexul este un argument pozițional
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Notă despre testele known-answer

Schemele de derivare sunt deterministe și acoperite de teste known-answer în
toate cele patru SDK-uri, astfel încât aceeași frază mnemonică produce adrese
identice în TypeScript, Python, Go și Rust. Acest lucru îți permite să derivezi
într-un limbaj și să verifici în altul.

> Această derivare per-lane (`deriveNativeAccount` la coin type 118, plus
> `deriveEvmAccount` / `deriveSvmAccount`) este modelul **legacy/implicit** și
> rămâne suportată și neschimbată. Conturile unificate de mai jos sunt un model
> de identitate suplimentar, opt-in.

## Conturi unificate (eth-native) {#unified-accounts}

Începând cu SDK **0.6.0** (chain v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
derivă O SINGURĂ cheie `eth_secp256k1` pe calea HD Ethereum `m/44'/60'/0'/0/{index}`,
ai cărei 20 de octeți de adresă (`keccak256(pubkey)[12:]`) sunt ACEEAȘI identitate
redată în trei moduri:

| Lane | Codificare |
| --- | --- |
| Native | bech32 cu prefixul `qor` (`qor1…`) |
| EVM | `0x` + hex cu sumă de control EIP-55 (litere mixte) |
| SVM | base58 al celor 20 de octeți completați la dreapta cu 12 octeți zero (32 de octeți) |

O depunere către **oricare** dintre cele trei ajunge într-un **singur** sold, iar
cheia poate cheltui pe fiecare lane:

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` face același lucru pornind de la o cheie privată
secp256k1 brută de 32 de octeți.

### Derivarea seed-ului PQC

Perechea de chei ML-DSA-87 a contului este derivată determinist și este
**legată de adresă**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

astfel încât este recuperabilă din `{ address, mnemonic }` și identică în toate
SDK-urile de limbaj ale QoreChain. (Pentru `unifiedAccountFromSeed`, locul frazei
mnemonice este ocupat de `"seed:" + hex(seed32)`.)

### Trimiterea pe lane-ul Native cu cheia eth

Un cont unificat semnează tranzacțiile pe calea Native cu schema
`eth_secp256k1`: semnătura clasică este secp256k1 peste **keccak256** al
octeților SignDoc (nu sha256), iar cheia publică din `SignerInfo` folosește
type URL-ul `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Calea hibridă
(`signHybridEth`) atașează suplimentar extensia ML-DSA-87
`PQCHybridSignature` — obligatorie pe rețelele live:

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

Pentru control la nivel mai jos, `signHybridEth(params)` / `signClassicalEth(params)`
returnează octeții `TxRaw` asamblați și artefactele de semnare, iar
`accountAuthInfo(baseAccount)` citește `account_number` / `sequence` dintr-un
cont a cărui cheie publică on-chain folosește type URL-ul `eth_secp256k1`. Calea
exclusiv clasică este destinată mesajului unic, exceptat la bootstrap,
`MsgRegisterPQCKeyV2`; folosește hibrid pentru orice altceva.

:::caution Actualizează la SDK 0.6.1+ pentru tranzacții hibride
SDK **0.6.1** a corectat un bug de codificare critic pentru consens: extensia
tx-body `/qorechain.pqc.v1.PQCHybridSignature` era serializată ca JSON în
`Any.value`, iar lanțul **respingea acele tranzacții la CheckTx**
(o eroare de parsare a tranzacției). Acum este codificată protobuf (valoarea
extensiei începe cu `0x08`) în toate cele cinci limbaje. Orice tranzacție
hibridă — inclusiv pe lane-ul eth-native — construită cu SDK ≤ 0.6.0 este
respinsă on-chain: actualizează la 0.6.1 sau mai nou.
:::

### Phantom (P1a): un cont unificat fără a exporta o cheie

`connectPhantomUnified()` (TypeScript) derivă un cont unificat canonic,
**non-custodial**, dintr-o semnătură Phantom deterministă: utilizatorul semnează
un mesaj fix, separat pe domeniu, cu cheia ed25519 a Phantom, iar
`shake256(signature, 32)` servește drept seed pentru cont.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

Contul derivat este o cheie canonică separată de cheia ed25519 a Phantom —
Phantom nu vede niciodată secretele derivate secp256k1/PQC. Pentru a permite
cheii Phantom în sine să cheltuiască din cont sub limite, vezi
[Authenticators și cheltuieli delegate](/sdk/guides/authenticators).

## Criptografie post-cuantică (PQC)

QoreChain suportă semnături **ML-DSA-87** (Dilithium-5, FIPS 204). SDK-ul
expune primitivele direct.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Constantele de lungime exportate (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) îți permit să validezi dimensiunile bufferelor.

> La bază, primitivele PQC provin din [**qorechain-pqc**](/developer-guide/post-quantum-signing) — biblioteca open-source, bazată exclusiv pe standarde, care încapsulează implementări auditate FIPS-204/203/202 în spatele unui API consecvent în șase limbaje (JavaScript/TypeScript, Rust, Go, C, Python, Java). Apelează la ea direct atunci când ai nevoie de primitivele brute sau de framing-ul `hybridSignBytes` în afara SDK-ului.

### Semnatari interschimbabili

Pentru compoziție, SDK-ul oferă o abstracție `Signer` plus implementările
`PqcSigner` și `HybridSigner`, precum și un enum `SignatureMode`. Folosește-le
atunci când vrei să integrezi semnarea PQC în propriul tău flux, în loc să
apelezi primitivele direct.

## Semnare hibridă {#hybrid-signing}

O tranzacție **hibridă** poartă atât o semnătură clasică secp256k1, cât și o
semnătură ML-DSA-87, astfel încât rămâne validă sub verificarea clasică în timp
ce câștigă protecție post-cuantică. Partea post-cuantică circulă ca o extensie
`PQCHybridSignature` pe tranzacție.

:::caution Semnarea hibridă este obligatorie pe calea Native
Începând cu versiunea curentă a lanțului (**v3.1.85**), setarea implicită a
rețelei este `hybrid_signature_mode = required` cu
`allow_classical_fallback = false`. Semnarea hibridă prin `buildHybridTx`
(cu `includePqcPublicKey`) — sau `signHybridEth` pentru conturile unificate
eth-native — este **obligatorie** pentru tranzacțiile pe calea Native;
tranzacțiile Native exclusiv clasice sunt respinse on-chain. Tranzacțiile EVM
folosesc o cale `eth_secp256k1` separată și nu sunt afectate.
:::

:::caution Tranzacțiile hibride cu SDK ≤ 0.6.0 sunt respinse
Versiunea 0.6.1 a corectat codificarea extensiei `PQCHybridSignature`
(JSON → protobuf, critic pentru consens). Tranzacțiile hibride construite cu
SDK 0.6.0 sau mai vechi eșuează la CheckTx cu o eroare de parsare a
tranzacției — actualizează la 0.6.1+.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### Condiție prealabilă on-chain

Înainte ca o tranzacție hibridă să treacă verificarea PQC on-chain, cheia
publică PQC a semnatarului trebuie să fie **înregistrată** prin
`MsgRegisterPQCKey` al lanțului — *cu excepția* cazului în care setezi
`includePqcPublicKey: true`, care încorporează cheia în extensie, astfel încât
lanțul o poate auto-înregistra la prima utilizare.

### Contractul tranzacției hibride (nivel înalt)

Tranzacția este semnată clasic peste octeții de semnare standard (care
**exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată ca
extensia `PQCHybridSignature`. Deoarece octeții de semnare clasici exclud
extensia, semnătura clasică rămâne validă indiferent dacă un verificator
înțelege sau nu partea PQC. Helper-ele de nivel mai jos
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) și constructorii
end-to-end (`buildHybridTx`, `signAndBroadcastHybrid`) sunt exportați pentru
utilizare avansată.

> Trimiterea tranzacțiilor hibride este calea obligatorie pe rețeaua live
> pentru tranzacțiile cosmos. Primitivele locale de semnare/verificare și
> helper-ele de construire a tranzacțiilor sunt disponibile astăzi.

## Rotația cheii PQC

Începând cu SDK 0.7.0, un cont își poate roti cheia ML-DSA-87 către o cheie nouă
de **același algoritm** — migrând canonic o cheie legacy `shake256(mnemonic)`
către cheia legată de adresă `shake256("qorechain:pqc:v1|addr|mnemonic")` — prin
`rotatePqcKeyMsgFromMnemonic` (ambele chei semnează dual octeții de rotație).
Vezi [Rotația cheii](/sdk/guides/authenticators#key-rotation) în ghidul
Authenticators pentru un exemplu complet.

## Identificatori de algoritm

SDK-ul exportă ID-uri de algoritm și helpere pentru lucrul la nivel de protocol:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` și `isSignatureAlgorithm(id)`.
