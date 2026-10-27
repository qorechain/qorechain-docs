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
saldo, e l'unica chiave è il firmatario su ogni lane (sulla lane EVM entro una
[finestra di autorizzazione](/sdk/guides/evm#evm-window); la lane delle
transazioni SVM è attualmente disattivata su tutta la rete, quindi SVM oggi è
di sola lettura):

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
mnemonico è `"seed:" + hex(seed32)`.) Dalla SDK 0.8.3
`derivePqcCanonical(account, mnemonic)` riconduce prima `account` alla sua
forma `qor1…` in minuscolo (`canonicalAccount`), quindi un bech32 in maiuscolo
o la forma `0x` dello stesso account producono la stessa chiave.
Ogni linguaggio ha la stessa funzione (Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical`; vedi la
[tabella nella guida Quantum-safe](/sdk/guides/quantum-safe#canonical-derivation)),
e lo stesso `{ address, mnemonic }` produce la stessa chiave in tutti (verificato
per TypeScript, Python, Go e Rust a ottobre 2026).

### Invio sulla Native lane con la chiave eth

Un account unificato firma le transazioni sul percorso Native con lo schema
`eth_secp256k1`: la firma classica è secp256k1 su **keccak256** dei byte del
SignDoc (non sha256), e la chiave pubblica in `SignerInfo` usa il type URL
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Il percorso ibrido
(`signHybridEth`, oppure `EthNativeSigner` con il suo `signMode: "hybrid"`
predefinito) allega inoltre l'estensione `PQCHybridSignature` ML-DSA-87, che è
obbligatoria sulle reti live.

Prima del primo invio ibrido servono due cose. Primo, la chiave ML-DSA-87
dell'account deve essere **registrata** (una sola volta). La registrazione è
l'unica transazione firmata in modo classico ed esente dalla regola ibrida:
firmala con `signMode: "classical"`. La `publicKey` dell'account è una stringa
esadecimale `0x`, quindi decodificala in byte per `ecdsaPubkey`. Secondo,
passa `rest` al firmatario in modo che possa chiedere alla rete quale
[forma dei sign-bytes](#sign-bytes-versions) verifica (su `qorechain-vladi` e
`qorechain-diana` genera un errore invece di tirare a indovinare). Richiede
SDK 0.8.1 o successivo (0.9.0 per gli helper della prova di possesso) e
`npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

Per un controllo di livello più basso, `signHybridEth(params)` /
`signClassicalEth(params)` restituiscono i byte `TxRaw` assemblati e gli
artefatti di firma, e `accountAuthInfo(baseAccount)` legge
`account_number` / `sequence` da un `BaseAccount` protobuf il cui pubkey
on-chain usa il type URL `eth_secp256k1` (un account in JSON REST richiede
prima la mappatura dei campi, come fa `authInfo` qui sopra).

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

### Phantom e altri wallet esterni {#phantom}

:::danger Rimosso nell'SDK 0.8.0
Gli SDK dalla 0.6.0 alla 0.7.0 includevano `connectPhantomUnified()` e `unifiedAccountFromPhantomSignature()` (rimosse nella 0.8.0; Python e Rust: `unified_account_from_phantom_signature`, Go: `unified.UnifiedAccountFromPhantomSignature`, Java: `UnifiedAccounts.unifiedAccountFromPhantomSignature`), che derivavano la chiave di spesa di un account da una firma Phantom sul messaggio fisso `QoreChain unified account derivation v1` seguito dalla chiave pubblica base58 del wallet.
Una firma ed25519 è deterministica e qualsiasi sito web può chiedere al wallet di firmare lo stesso messaggio, quindi chiunque abbia mai ottenuto la firma può ricostruire le chiavi secp256k1 e ML-DSA dell'account. Entrambe le funzioni ora lanciano un errore.

Se hai creato un account in questo modo, consideralo compromesso da subito: crea un nuovo account da un mnemonic, sposta i fondi lì e poi collega Phantom al nuovo account come authenticator (vedi sotto). Il vecchio account non si può riparare, perché il suo indirizzo è legato alla chiave esposta e una rotazione della chiave PQC sostituisce solo la metà post-quantistica. Usa l'SDK 0.8.2 o successivo.
:::

Per far spendere una chiave Phantom (o MetaMask) da un account, usa le **corsie authenticator**: registra la chiave del wallet con `MsgRegisterAuthenticator`, poi spendi dall'account PQC canonico tramite `MsgExecuteCosmos` / `MsgExecuteEVM` entro un permesso e una `SpendingRule`. L'account mantiene le proprie chiavi derivate dal mnemonic e la chiave del wallet può essere revocata in qualsiasi momento. Vedi [Authenticator e spesa delegata](/sdk/guides/authenticators). Nota che il modulo `abstractaccount` che fornisce queste corsie è disattivato sulla mainnet (`GET /qorechain/abstractaccount/v1/config` mostra `enabled: false`; sulla testnet è attivo), quindi sulla mainnet una chiave del wallet non può ancora essere collegata; fino ad allora usa direttamente il nuovo account da mnemonic.

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
implementazioni `PqcSigner` e `HybridSigner`, e un tipo `SignatureMode`
(`"classical" | "pqc" | "hybrid"`). Usali quando vuoi inserire la firma PQC nel
tuo flusso invece di chiamare direttamente le primitive.

## Firma ibrida {#hybrid-signing}

Una transazione **ibrida** porta sia una firma classica secp256k1 sia una
firma ML-DSA-87, così rimane valida sotto verifica classica pur ottenendo
protezione post-quantistica. La parte post-quantistica viaggia come
estensione `PQCHybridSignature` sulla transazione.

:::caution La firma ibrida è obbligatoria sul percorso Native
A partire dalla versione **v3.2.0** della chain (la mainnet esegue la v3.2.4, la testnet la v3.2.6), il valore predefinito di rete è
`hybrid_signature_mode = required` con `allow_classical_fallback = false`. La
firma ibrida tramite `buildHybridTx` / `signAndBroadcastHybrid` (passa `rest`),
oppure `signHybridEth` / `EthNativeSigner` per gli account unificati
eth-native, è **obbligatoria** per le transazioni sul percorso Native; le
transazioni Native solo-classiche vengono rifiutate on-chain. Le transazioni
EVM sono una lane separata, ma dalla v3.2.0 sono ammesse solo da un account con
una chiave ML-DSA-87 registrata e una
[finestra di autorizzazione](/sdk/guides/evm#evm-window) aperta.
:::

:::caution Le transazioni ibride con SDK ≤ 0.6.0 vengono rifiutate
La release 0.6.1 ha corretto la codifica dell'estensione
`PQCHybridSignature` (JSON → protobuf, critico per il consenso). Le
transazioni ibride costruite con SDK 0.6.0 o precedente falliscono a CheckTx
con un errore di parsing della tx — aggiorna a 0.6.1+.
:::

Il costruttore end-to-end per un account con coin type 118 è
`signAndBroadcastHybrid` (oppure `buildHybridTx` per costruire senza
trasmettere). Richiede il firmatario classico, la coppia di chiavi ML-DSA-87
dell'account, il numero di account e la sequence, e `rest`.
Per un account con coin type 118 in TypeScript il percorso più breve è il
`TxClient` ibrido (SDK 0.9.0): passa la coppia di chiavi quando ti connetti e
ogni transazione viene firmata in modalità ibrida, con `fee: "auto"` che
simula la transazione ibrida stessa (la sola registrazione resta classica):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

Con controllo esplicito su fee, numero di account e sequence usa
`signAndBroadcastHybrid` (SDK 0.8.1 o successivo, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### Prerequisito on-chain

Prima che una transazione ibrida possa essere verificata PQC, la chiave
pubblica PQC del firmatario deve essere **registrata** con
`MsgRegisterPQCKeyV2` (firmata in modo classico, esente dalla regola ibrida per
un account che non ha ancora alcuna chiave).
Se ne occupano `ensurePqcRegistered` / `buildRegisterPqcKeyMsg` dell'SDK,
`qorechaind tx pqc register-key` o un wallet QoreChain. `includePqcPublicKey:
true` si limita a incorporare la chiave nell'estensione; **non** la registra, e
la chain non registra una chiave al primo utilizzo. Dalla v3.2.3 la chain
rifiuta chiavi deboli, degeneri e riutilizzate e accetta una prova di possesso
facoltativa (vedi
[Regole di integrità delle chiavi](/architecture/post-quantum-security#key-integrity)).
Nell'SDK 0.9.0 `ensurePqcRegistered` allega la prova da sé una volta che la rete
ha applicato la v3.2.3, e `signProofOfPossession` / `verifyProofOfPossession`
sono esportate per le registrazioni costruite a mano; i builder 0.8.x
registrano senza prova, il che è consentito.

### Quale forma dei sign-bytes? {#sign-bytes-versions}

La metà ML-DSA-87 di una transazione ibrida è firmata su una di due forme di
byte, e a ogni altezza una rete ne verifica esattamente una:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` è il corpo della transazione senza l'estensione PQC e `A` i byte di
`AuthInfo`. `qorechain-vladi` e `qorechain-diana` verificano entrambe la forma
**v2**. Il passaggio è stato registrato con il nome di upgrade `v3.2.0` sulla
mainnet e con `v3.1.98` (poi `v3.2.0`) sulla testnet, quindi un client deve
interrogare `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` per **entrambi**
i nomi e usare v2 se una delle due altezze è maggiore di zero. L'SDK lo fa per
te: ogni builder ibrido accetta `signBytesVersion` (`"auto"` per impostazione
predefinita, oppure `"v1"` / `"v2"`), e `"auto"` richiede l'URL REST della rete
(`rest`) su queste due chain: genera un errore invece di tirare a indovinare. I
percorsi di alto livello rieseguono la risoluzione e ritentano una volta
quando la chain rifiuta la firma con il codice `pqc` 21. Nei test unitari passa
`signBytesVersion` esplicitamente, così il test non dipende da un nodo live.
Vedi anche [Risoluzione dei problemi del codice 21](/developer-guide/post-quantum-signing#code-21).

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
