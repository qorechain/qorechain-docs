---
slug: /sdk/concepts/accounts-pqc
title: Account e firma PQC
sidebar_label: Account e PQC
sidebar_position: 2
---

# Account e firma PQC

Gli account QoreChain sono derivati da un'unica frase mnemonica BIP-39. Esistono
due modelli di account, entrambi pienamente supportati:

- **Derivazione HD per corsia (legacy/predefinita)** — la stessa frase mnemonica
  produce un account native (coin type 118), un account EVM (coin type 60) e un
  account SVM (coin type 501) tramite percorsi di derivazione indipendenti. Tre
  chiavi, tre indirizzi.
- **Account unificati eth-native** (SDK 0.6.0, chain v3.1.83) — UNA chiave
  `eth_secp256k1` è UN'identità di 20 byte resa in tutte e tre le codifiche di
  indirizzo, con un unico saldo condiviso. Vedi
  [Account unificati](#unified-accounts).

## Derivazione HD (legacy/predefinita, coin type 118)

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

La frase mnemonica viene validata (parole **e** checksum) prima che qualsiasi
chiave venga derivata, quindi un errore di battitura solleva un'eccezione invece
di produrre silenziosamente un account sbagliato. Puoi eseguire la validazione
esplicitamente con `validateMnemonic(mnemonic)`.

### Schemi di derivazione

| Tipo | Curva | Percorso | Indirizzo |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` di `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 della chiave pubblica di 32 byte |

Passa un indice di account per derivare account aggiuntivi. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust l'indice è un argomento posizionale
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Nota sui known-answer test

Gli schemi di derivazione sono deterministici e coperti da known-answer test in
tutti e quattro gli SDK, quindi la stessa frase mnemonica produce indirizzi
identici in TypeScript, Python, Go e Rust. Questo ti permette di derivare in un
linguaggio e verificare in un altro.

> Questa derivazione per corsia (`deriveNativeAccount` con coin type 118, più
> `deriveEvmAccount` / `deriveSvmAccount`) è il modello **legacy/predefinito** e
> rimane supportata e invariata. Gli account unificati descritti sotto sono un
> modello di identità aggiuntivo e opzionale (opt-in).

## Account unificati (eth-native) {#unified-accounts}

A partire dall'SDK **0.6.0** (chain v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
deriva UNA chiave `eth_secp256k1` sul percorso HD di Ethereum `m/44'/60'/0'/0/{index}`
i cui 20 byte di indirizzo (`keccak256(pubkey)[12:]`) sono la STESSA identità
resa in tre modi:

| Corsia | Codifica |
| --- | --- |
| Native | bech32 con il prefisso `qor` (`qor1…`) |
| EVM | `0x` + esadecimale con checksum a maiuscole/minuscole miste EIP-55 |
| SVM | base58 dei 20 byte completati a destra con 12 byte zero (32 byte) |

Un deposito verso **uno qualsiasi** dei tre finisce in **un unico** saldo, e la
chiave può spendere su ogni corsia:

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
secp256k1 grezza di 32 byte.

### La derivazione del seed PQC

La coppia di chiavi ML-DSA-87 dell'account è derivata in modo deterministico ed
è **vincolata all'indirizzo**:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

quindi è recuperabile da `{ address, mnemonic }` ed è identica in tutti gli SDK
di linguaggio di QoreChain. (Per `unifiedAccountFromSeed`, lo slot della frase
mnemonica è `"seed:" + hex(seed32)`.)

### Inviare sulla corsia Native con la chiave eth

Un account unificato firma le transazioni del percorso Native con lo schema
`eth_secp256k1`: la firma classica è secp256k1 su **keccak256** dei byte del
SignDoc (non sha256), e la chiave pubblica del `SignerInfo` usa il type URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Il percorso ibrido
(`signHybridEth`) allega inoltre l'estensione `PQCHybridSignature` ML-DSA-87 —
obbligatoria sulle reti live:

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

Per un controllo di più basso livello, `signHybridEth(params)` /
`signClassicalEth(params)` restituiscono i byte `TxRaw` assemblati e gli
artefatti di firma, e `accountAuthInfo(baseAccount)` legge `account_number` /
`sequence` da un account la cui pubkey on-chain usa il type URL
`eth_secp256k1`. Il percorso solo-classico serve per il messaggio una tantum,
esente dal bootstrap, `MsgRegisterPQCKeyV2`; usa l'ibrido per tutto il resto.

:::caution Aggiorna all'SDK 0.6.1+ per le transazioni ibride
L'SDK **0.6.1** ha corretto un bug di codifica critico per il consenso:
l'estensione del tx-body `/qorechain.pqc.v1.PQCHybridSignature` veniva
serializzata in JSON dentro `Any.value`, e la chain **rifiutava quelle
transazioni a CheckTx** (un errore di parsing della tx). Ora è codificata in
protobuf (il valore dell'estensione inizia con `0x08`) in tutti e cinque i
linguaggi. Qualsiasi transazione ibrida — inclusa la corsia eth-native —
costruita con SDK ≤ 0.6.0 viene rifiutata on-chain: aggiorna alla 0.6.1 o
successiva.
:::

### Phantom (P1a): un account unificato senza esportare una chiave

`connectPhantomUnified()` (TypeScript) deriva un account unificato canonico e
**non-custodial** da una firma Phantom deterministica: l'utente firma un
messaggio fisso e separato per dominio con la chiave ed25519 di Phantom, e
`shake256(signature, 32)` fa da seed all'account.

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
Phantom — Phantom non vede mai i segreti secp256k1/PQC derivati. Per consentire
alla chiave Phantom stessa di spendere dall'account entro determinati limiti,
vedi [Authenticator e spesa delegata](/sdk/guides/authenticators).

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

> Sotto il cofano, le primitive PQC provengono da [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la libreria open source, basata esclusivamente su standard, che incapsula implementazioni FIPS-204/203/202 sottoposte ad audit dietro un'unica API coerente in sei linguaggi (JavaScript/TypeScript, Rust, Go, C, Python, Java). Usala direttamente quando ti servono le primitive grezze o il framing `hybridSignBytes` al di fuori dell'SDK.

### Signer componibili

Per la composizione, l'SDK fornisce un'astrazione `Signer` più le
implementazioni `PqcSigner` e `HybridSigner`, e un enum `SignatureMode`. Usali
quando vuoi integrare la firma PQC nel tuo flusso invece di chiamare
direttamente le primitive.

## Firma ibrida {#hybrid-signing}

Una transazione **ibrida** trasporta sia una firma classica secp256k1 sia una
firma ML-DSA-87, quindi rimane valida sotto la verifica classica pur ottenendo
protezione post-quantistica. La parte post-quantistica viaggia come estensione
`PQCHybridSignature` sulla transazione.

:::caution La firma ibrida è obbligatoria sul percorso Native
A partire dalla versione corrente della chain (**v3.1.85**), il valore
predefinito della rete è `hybrid_signature_mode = required` con
`allow_classical_fallback = false`. La firma ibrida tramite `buildHybridTx`
(con `includePqcPublicKey`) — oppure `signHybridEth` per gli account unificati
eth-native — è **obbligatoria** per le transazioni del percorso Native; le
transazioni Native solo-classiche vengono rifiutate on-chain. Le transazioni
EVM usano un percorso `eth_secp256k1` separato e non sono interessate.
:::

:::caution Le transazioni ibride con SDK ≤ 0.6.0 vengono rifiutate
La release 0.6.1 ha corretto la codifica dell'estensione `PQCHybridSignature`
(JSON → protobuf, critica per il consenso). Le transazioni ibride costruite con
SDK 0.6.0 o precedente falliscono a CheckTx con un errore di parsing della tx —
aggiorna alla 0.6.1+.
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

Prima che una transazione ibrida superi la verifica PQC on-chain, la chiave
pubblica PQC del firmatario deve essere **registrata** tramite il messaggio
`MsgRegisterPQCKey` della chain — *a meno che* tu non imposti
`includePqcPublicKey: true`, che incorpora la chiave nell'estensione così che
la chain possa registrarla automaticamente al primo utilizzo.

### Contratto della tx ibrida (ad alto livello)

La transazione è firmata classicamente sui sign bytes standard (che
**escludono** l'estensione PQC), e la firma ML-DSA-87 viene calcolata e allegata
come estensione `PQCHybridSignature`. Poiché i sign bytes classici escludono
l'estensione, la firma classica resta valida indipendentemente dal fatto che un
verificatore comprenda o meno la parte PQC. Gli helper di più basso livello
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) e i builder end-to-end
(`buildHybridTx`, `signAndBroadcastHybrid`) sono esportati per usi avanzati.

> L'invio di transazioni ibride è il percorso obbligatorio sulla rete live per
> le transazioni cosmos. Le primitive locali di firma/verifica e gli helper di
> costruzione delle tx sono disponibili oggi.

## Rotazione della chiave PQC

A partire dall'SDK 0.7.0 un account può ruotare la sua chiave ML-DSA-87 verso
una nuova chiave dello **stesso algoritmo** — migrando canonicamente una chiave
legacy `shake256(mnemonic)` verso la chiave vincolata all'indirizzo
`shake256("qorechain:pqc:v1|addr|mnemonic")` — tramite
`rotatePqcKeyMsgFromMnemonic` (entrambe le chiavi firmano congiuntamente i byte
di rotazione). Vedi [Rotazione delle chiavi](/sdk/guides/authenticators#key-rotation)
nella guida sugli Authenticator per un esempio completo.

## Identificatori di algoritmo

L'SDK esporta gli ID di algoritmo e gli helper per il lavoro a livello di
protocollo: `AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` e `isSignatureAlgorithm(id)`.
