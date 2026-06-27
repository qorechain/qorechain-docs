---
slug: /sdk/concepts/accounts-pqc
title: Account & Firma PQC
sidebar_label: Account & PQC
sidebar_position: 2
---

# Account & firma PQC

Gli account QoreChain sono derivati da un'unica mnemonica BIP-39. La stessa mnemonica
produce un account nativo, uno EVM e uno SVM tramite percorsi di derivazione indipendenti.

## Derivazione HD

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

La mnemonica è validata (parole **e** checksum) prima che venga derivata qualsiasi chiave, così
un errore di battitura solleva un'eccezione invece di produrre silenziosamente un account errato. Puoi validarla
esplicitamente con `validateMnemonic(mnemonic)`.

### Schemi di derivazione

| Tipo | Curva | Percorso | Indirizzo |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` di `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 della chiave pubblica a 32 byte |

Passa un indice di account per derivare account aggiuntivi. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust l'indice è un argomento posizionale
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Nota sui known-answer test

Gli schemi di derivazione sono deterministici e coperti da known-answer test
in tutti e quattro gli SDK, quindi la stessa mnemonica produce indirizzi identici in
TypeScript, Python, Go e Rust. Questo ti permette di derivare in un linguaggio e verificare
in un altro.

## Crittografia post-quantum (PQC)

QoreChain supporta firme **ML-DSA-87** (Dilithium-5, FIPS 204). L'SDK
espone direttamente le primitive.

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

Le costanti di lunghezza esportate (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) ti permettono di validare le dimensioni dei buffer.

> Sotto il cofano, le primitive PQC provengono da [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la libreria open-source, solo-standard, che incapsula implementazioni FIPS-204/203/202 sottoposte ad audit dietro un'unica API coerente in sei linguaggi (JavaScript/TypeScript, Rust, Go, C, Python, Java). Usala direttamente quando ti servono le primitive grezze o il framing `hybridSignBytes` al di fuori dell'SDK.

### Signer plug-in

Per la composizione, l'SDK fornisce un'astrazione `Signer` più le implementazioni `PqcSigner` e
`HybridSigner`, e un enum `SignatureMode`. Usali quando
vuoi integrare la firma PQC nel tuo flusso invece di chiamare direttamente le primitive.

## Firma ibrida

Una transazione **ibrida** trasporta sia una firma classica secp256k1 sia una
firma ML-DSA-87, così rimane valida con la verifica classica
acquisendo al contempo protezione post-quantum. La parte post-quantum viaggia come
estensione `PQCHybridSignature` sulla transazione.

:::caution La firma ibrida è obbligatoria sul percorso cosmos
A partire dalla versione corrente della chain (**v3.1.77**), il default di rete è
`hybrid_signature_mode = required` con `allow_classical_fallback = false`.
La firma ibrida tramite `buildHybridTx` (con `includePqcPublicKey`) è **obbligatoria**
per le transazioni sul percorso cosmos — le transazioni cosmos solo-classiche vengono rifiutate
on-chain. Le transazioni EVM usano un percorso `eth_secp256k1` separato e non
sono interessate.
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

### Prerequisito on-chain

Prima che una transazione ibrida possa essere verificata PQC on-chain, la chiave pubblica PQC del signer
deve essere **registrata** tramite il `MsgRegisterPQCKey` della chain — *a meno che* tu non imposti
`includePqcPublicKey: true`, che incorpora la chiave nell'estensione così la chain
può auto-registrarla al primo utilizzo.

### Contratto della tx ibrida (panoramica)

La transazione è firmata in modo classico sui sign byte standard (che
**escludono** l'estensione PQC), e la firma ML-DSA-87 è calcolata e
allegata come estensione `PQCHybridSignature`. Poiché i sign byte classici
escludono l'estensione, la firma classica rimane valida indipendentemente dal fatto che un
verificatore comprenda o meno la parte PQC. Gli helper di livello più basso
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) e i
builder end-to-end (`buildHybridTx`, `signAndBroadcastHybrid`) sono esportati per un uso
avanzato.

> La sottomissione di transazioni ibride è il percorso obbligatorio sulla rete attiva per
> le transazioni cosmos. Le primitive locali di firma/verifica e gli helper per la costruzione delle tx
> sono già disponibili oggi.

## Identificatori di algoritmo

L'SDK esporta ID di algoritmo e helper per il lavoro a livello di protocollo:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` e `isSignatureAlgorithm(id)`.
