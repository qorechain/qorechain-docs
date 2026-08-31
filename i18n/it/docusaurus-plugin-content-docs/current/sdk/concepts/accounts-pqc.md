---
slug: /sdk/concepts/accounts-pqc
title: Account e firma PQC
sidebar_label: Account e PQC
sidebar_position: 2
---

# Account e firma PQC

Gli account QoreChain derivano da un singolo mnemonico BIP-39. Esistono due
modelli di account, entrambi pienamente supportati:

- **Derivazione HD per lane (legacy/predefinito)** — lo stesso mnemonico
  produce un account nativo (coin type 118), un account EVM (coin type 60) e
  un account SVM (coin type 501) tramite percorsi di derivazione
  indipendenti. Tre chiavi, tre indirizzi.
- **Account unificati eth-native** (SDK 0.6.0, chain v3.1.83) — UNA sola
  chiave `eth_secp256k1` è UN'unica identità a 20 byte rappresentata come
  tutte e tre le codifiche di indirizzo, con un unico saldo condiviso. Vedi
  [Account unificati](#unified-accounts).

## Derivazione HD (legacy/predefinito, coin type 118)

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

Il mnemonico viene validato (parole **e** checksum) prima che venga derivata
qualsiasi chiave, così un errore di battitura genera un'eccezione invece di
produrre silenziosamente un account errato. Puoi validarlo esplicitamente con
`validateMnemonic(mnemonic)`.

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
in tutti e quattro gli SDK, quindi lo stesso mnemonico produce indirizzi
identici in TypeScript, Python, Go e Rust. Questo ti permette di derivare in
un linguaggio e verificare in un altro.

> Questa derivazione per lane (`deriveNativeAccount` al coin type 118, più
> `deriveEvmAccount` / `deriveSvmAccount`) è il modello **legacy/predefinito**
> e rimane supportata e invariata. Gli account unificati qui sotto sono un
> modello di identità aggiuntivo, opzionale.

## Account unificati (eth-native) {#unified-accounts}

Dalla SDK **0.6.0** (chain v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
deriva UNA sola chiave `eth_secp256k1` sul percorso HD Ethereum
`m/44'/60'/0'/0/{index}` i cui 20 byte di indirizzo
(`keccak256(pubkey)[12:]`) sono la STESSA identità rappresentata in tre modi:

| Lane | Codifica |
| --- | --- |
| Native | bech32 con prefisso `qor` (`qor1…`) |
| EVM | `0x` + checksum esadecimale misto EIP-55 |
| SVM | base58 dei 20 byte con padding a destra di 12 byte zero (32 byte) |

Un deposito su **una qualsiasi** delle tre lane confluisce in **un unico**
saldo, e la chiave spende su ogni lane:

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

`unifiedAccountFromSeed(seed32)` fa lo stesso a partire da una chiave privata
secp256k1 grezza a 32 byte.

### La derivazione del seed PQC

La coppia di chiavi ML-DSA-87 dell'account è derivata in modo deterministico
e **legata all'indirizzo**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

quindi è recuperabile da `{ address, mnemonic }` ed è identica in tutti gli
SDK di linguaggio di QoreChain. (Per `unifiedAccountFromSeed`, lo slot del
mnemonico è `"seed:" + hex(seed32)`.)

### Invio sulla Native lane con la chiave eth

Un account unificato firma le transazioni sul percorso Native con lo schema
`eth_secp256k1`: la firma classica è secp256k1 su **keccak256** dei byte del
SignDoc (non sha256), e la chiave pubblica in `SignerInfo` usa il type URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Il percorso ibrido
(`signHybridEth`) allega inoltre l'estensione `PQCHybridSignature`
ML-DSA-87 — obbligatoria sulle reti live:

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

Per un controllo di livello più basso, `signHybridEth(params)` /
`signClassicalEth(params)` restituiscono i byte `TxRaw` assemblati e gli
artefatti di firma, e `accountAuthInfo(baseAccount)` legge
`account_number` / `sequence` da un account il cui pubkey on-chain usa il
type URL `eth_secp256k1`. Il percorso solo-classico è riservato al
`MsgRegisterPQCKeyV2`, esente una tantum dal bootstrap; usa l'ibrido per
tutto il resto.

:::caution Aggiorna a SDK 0.6.1+ per le transazioni ibride
SDK **0.6.1** ha corretto un bug di codifica critico per il consenso:
l'estensione tx-body `/qorechain.pqc.v1.PQCHybridSignature` veniva
serializzata in JSON dentro `Any.value`, e la chain **rifiutava quelle
transazioni già a CheckTx** (un errore di parsing della tx). Ora è codificata
in protobuf (il valore dell'estensione inizia con `0x08`) in tutti e cinque i
linguaggi. Qualsiasi transazione ibrida — inclusa la lane eth-native —
costruita con SDK ≤ 0.6.0 viene rifiutata on-chain: aggiorna a 0.6.1 o
successivo.
:::

### Phantom (P1a): un account unificato senza esportare una chiave

`connectPhantomUnified()` (TypeScript) deriva un account unificato canonico e
**non-custodial** da una firma Phantom deterministica: l'utente firma un
messaggio fisso e domain-separated con la chiave ed25519 di Phantom, e
`shake256(signature, 32)` costituisce il seed dell'account.

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

L'account derivato è una chiave canonica separata dalla chiave ed25519 di
Phantom — Phantom non vede mai i segreti secp256k1/PQC derivati. Per
permettere alla chiave Phantom stessa di spendere dall'account entro dei
limiti, vedi
[Autenticatori e spesa delegata](/sdk/guides/authenticators).

## Crittografia post-quantistica (PQC)

QoreChain supporta firme **ML-DSA-87** (Dilithium-5, FIPS 204). L'SDK espone
direttamente le primitive.

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

> Alla base, le primitive PQC provengono da
> [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la libreria
> open-source basata solo su standard che avvolge implementazioni FIPS-204/203/202
> sottoposte ad audit dietro un'unica API coerente in sei linguaggi
> (JavaScript/TypeScript, Rust, Go, C, Python, Java). Usala direttamente
> quando ti servono le primitive grezze o il framing `hybridSignBytes` al di
> fuori dell'SDK.

### Firmatari collegabili (pluggable)

Per la composizione, l'SDK fornisce un'astrazione `Signer` più le
implementazioni `PqcSigner` e `HybridSigner`, e un enum `SignatureMode`.
Usali quando vuoi inserire la firma PQC nel tuo flusso invece di chiamare
direttamente le primitive.

## Firma ibrida {#hybrid-signing}

Una transazione **ibrida** porta sia una firma classica secp256k1 sia una
firma ML-DSA-87, così rimane valida sotto verifica classica pur ottenendo
protezione post-quantistica. La parte post-quantistica viaggia come
estensione `PQCHybridSignature` sulla transazione.

:::caution La firma ibrida è obbligatoria sul percorso Native
A partire dalla versione corrente della chain (**v3.1.95**), il valore
predefinito di rete è `hybrid_signature_mode = required` con
`allow_classical_fallback = false`. La firma ibrida tramite `buildHybridTx`
(con `includePqcPublicKey`) — o `signHybridEth` per gli account unificati
eth-native — è **obbligatoria** per le transazioni sul percorso Native; le
transazioni Native solo-classiche vengono rifiutate on-chain. Le transazioni
EVM usano un percorso `eth_secp256k1` separato e non sono interessate.
:::

:::caution Le transazioni ibride con SDK ≤ 0.6.0 vengono rifiutate
La release 0.6.1 ha corretto la codifica dell'estensione
`PQCHybridSignature` (JSON → protobuf, critico per il consenso). Le
transazioni ibride costruite con SDK 0.6.0 o precedente falliscono a CheckTx
con un errore di parsing della tx — aggiorna a 0.6.1+.
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

Prima che una transazione ibrida possa essere verificata PQC on-chain, la
chiave pubblica PQC del firmatario deve essere **registrata** tramite
`MsgRegisterPQCKey` della chain — *a meno che* tu non imposti
`includePqcPublicKey: true`, che incorpora la chiave nell'estensione così la
chain può auto-registrarla al primo utilizzo.

### Contratto della tx ibrida (panoramica)

La transazione viene firmata classicamente sui byte di firma standard (che
**escludono** l'estensione PQC), e la firma ML-DSA-87 viene calcolata e
allegata come estensione `PQCHybridSignature`. Poiché i byte di firma
classici escludono l'estensione, la firma classica resta valida sia che un
verificatore comprenda la parte PQC sia che non la comprenda. Gli helper di
livello più basso (`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) e i costruttori
end-to-end (`buildHybridTx`, `signAndBroadcastHybrid`) sono esportati per usi
avanzati.

> L'invio di transazioni ibride è il percorso obbligatorio sulla rete live
> per le transazioni cosmos. Le primitive locali di firma/verifica e gli
> helper di costruzione tx sono disponibili già oggi.

## Rotazione della chiave PQC

Dalla SDK 0.7.0 un account può ruotare la propria chiave ML-DSA-87 verso una
nuova chiave dello **stesso algoritmo** — migrando canonicamente una chiave
legacy `shake256(mnemonic)` verso la chiave legata all'indirizzo
`shake256("qorechain:pqc:v1|addr|mnemonic")` — tramite
`rotatePqcKeyMsgFromMnemonic` (entrambe le chiavi firmano congiuntamente i
byte della rotazione). Vedi
[Rotazione della chiave](/sdk/guides/authenticators#key-rotation) nella guida
Autenticatori per un esempio completo.

## Identificatori di algoritmo

L'SDK esporta ID di algoritmo e helper per lavoro a livello di protocollo:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)`, e `isSignatureAlgorithm(id)`.
