---
slug: /sdk/concepts/accounts-pqc
title: Conturi și semnare PQC
sidebar_label: Conturi și PQC
sidebar_position: 2
---

# Conturi și semnare PQC

Conturile QoreChain sunt derivate dintr-o singură frază mnemonică BIP-39. Aceeași
frază mnemonică produce un cont nativ, unul EVM și unul SVM prin căi de derivare
independente.

## Derivare HD

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

Fraza mnemonică este validată (atât cuvintele, **cât și** suma de control) înainte
de a fi derivată orice cheie, astfel încât o greșeală de tastare provoacă o eroare
în loc să producă în tăcere un cont greșit. Poți valida explicit cu
`validateMnemonic(mnemonic)`.

### Scheme de derivare

| Tip | Curbă | Cale | Adresă |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` al `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 al cheii publice de 32 de octeți |

Transmite un index de cont pentru a deriva conturi suplimentare. În TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

În Python/Go/Rust indexul este un argument pozițional
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Notă despre testele cu răspuns cunoscut

Schemele de derivare sunt deterministe și acoperite de teste cu răspuns cunoscut
în toate cele patru SDK-uri, astfel încât aceeași frază mnemonică produce adrese
identice în TypeScript, Python, Go și Rust. Acest lucru îți permite să derivezi
într-un limbaj și să verifici în altul.

## Criptografie post-cuantică (PQC)

QoreChain suportă semnături **ML-DSA-87** (Dilithium-5, FIPS 204). SDK-ul expune
primitivele direct.

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

> Dedesubt, primitivele PQC provin din [**qorechain-pqc**](/developer-guide/post-quantum-signing) — biblioteca open-source, exclusiv standarde, care încapsulează implementări FIPS-204/203/202 auditate în spatele unui singur API consecvent în șase limbaje (JavaScript/TypeScript, Rust, Go, C, Python, Java). Folosește-o direct atunci când ai nevoie de primitivele brute sau de încadrarea `hybridSignBytes` în afara SDK-ului.

### Semnatari interschimbabili (pluggable)

Pentru compunere, SDK-ul oferă o abstractizare `Signer` plus implementările
`PqcSigner` și `HybridSigner`, precum și un enum `SignatureMode`. Folosește-le
atunci când vrei să integrezi semnarea PQC în propriul flux, în loc să apelezi
direct primitivele.

## Semnare hibridă

O tranzacție **hibridă** transportă atât o semnătură clasică secp256k1, cât și o
semnătură ML-DSA-87, astfel încât rămâne validă sub verificarea clasică, câștigând
totodată protecție post-cuantică. Partea post-cuantică călătorește ca o extensie
`PQCHybridSignature` pe tranzacție.

:::caution Semnarea hibridă este necesară pe calea cosmos
Începând cu versiunea actuală a lanțului (**v3.1.80**), valoarea implicită a
rețelei este `hybrid_signature_mode = required` cu `allow_classical_fallback = false`.
Semnarea hibridă prin `buildHybridTx` (cu `includePqcPublicKey`) este
**obligatorie** pentru tranzacțiile pe calea cosmos — tranzacțiile cosmos exclusiv
clasice sunt respinse on-chain. Tranzacțiile EVM folosesc o cale separată
`eth_secp256k1` și nu sunt afectate.
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

### Precondiție on-chain

Înainte ca o tranzacție hibridă să fie verificată PQC on-chain, cheia publică PQC
a semnatarului trebuie să fie **înregistrată** prin `MsgRegisterPQCKey` al
lanțului — *cu excepția cazului* în care setezi `includePqcPublicKey: true`, ceea
ce înglobează cheia în extensie, astfel încât lanțul o poate înregistra automat la
prima utilizare.

### Contractul tranzacției hibride (la nivel înalt)

Tranzacția este semnată clasic peste octeții standard de semnare (care
**exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată ca
extensia `PQCHybridSignature`. Deoarece octeții clasici de semnare exclud
extensia, semnătura clasică rămâne validă indiferent dacă un verificator înțelege
sau nu partea PQC. Funcțiile ajutătoare de nivel inferior
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) și constructorii de la cap
la cap (`buildHybridTx`, `signAndBroadcastHybrid`) sunt exportate pentru utilizare
avansată.

> Trimiterea tranzacțiilor hibride este calea obligatorie pe rețeaua live pentru
> tranzacțiile cosmos. Primitivele locale de semnare/verificare și funcțiile
> ajutătoare de construire a tranzacțiilor sunt disponibile astăzi.

## Identificatori de algoritmi

SDK-ul exportă ID-uri de algoritmi și funcții ajutătoare pentru lucrul la nivel de
protocol: `AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` și `isSignatureAlgorithm(id)`.
