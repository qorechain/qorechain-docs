---
slug: /sdk/concepts/accounts-pqc
title: Konten & PQC-Signierung
sidebar_label: Konten & PQC
sidebar_position: 2
---

# Konten & PQC-Signierung

QoreChain-Konten werden aus einer einzigen BIP-39-Mnemonic abgeleitet. Es gibt
zwei Kontomodelle, die beide vollständig unterstützt werden:

- **Pro-Lane-HD-Ableitung (Legacy/Standard)** — dieselbe Mnemonic erzeugt über
  unabhängige Ableitungspfade ein Native-Konto (Coin-Type 118), ein
  EVM-Konto (Coin-Type 60) und ein SVM-Konto (Coin-Type 501). Drei Schlüssel,
  drei Adressen.
- **Unified Eth-native-Konten** (SDK 0.6.0, Chain v3.1.83) — EIN
  `eth_secp256k1`-Schlüssel ist EINE 20-Byte-Identität, die als alle drei
  Adresscodierungen dargestellt wird, mit einem gemeinsamen Guthaben. Siehe
  [Unified Accounts](#unified-accounts).

## HD-Ableitung (Legacy/Standard, Coin-Type 118)

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

Die Mnemonic wird (Wörter **und** Prüfsumme) validiert, bevor irgendein
Schlüssel abgeleitet wird, sodass ein Tippfehler einen Fehler auslöst, statt
stillschweigend ein falsches Konto zu erzeugen. Sie können explizit mit
`validateMnemonic(mnemonic)` validieren.

### Ableitungsschemata

| Typ | Kurve | Pfad | Adresse |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` von `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 des 32-Byte-Public-Keys |

Übergeben Sie einen Kontoindex, um weitere Konten abzuleiten. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust ist der Index ein Positionsargument
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Hinweis zu Known-Answer-Tests

Die Ableitungsschemata sind deterministisch und werden in allen vier SDKs
durch Known-Answer-Tests abgedeckt, sodass dieselbe Mnemonic in TypeScript,
Python, Go und Rust identische Adressen erzeugt. Dadurch können Sie in einer
Sprache ableiten und in einer anderen verifizieren.

> Diese Pro-Lane-Ableitung (`deriveNativeAccount` mit Coin-Type 118, plus
> `deriveEvmAccount` / `deriveSvmAccount`) ist das **Legacy-/Standard**-Modell
> und bleibt unverändert unterstützt. Die Unified Accounts weiter unten sind
> ein zusätzliches, optionales Identitätsmodell.

## Unified Accounts (Eth-native) {#unified-accounts}

Seit SDK **0.6.0** (Chain v3.1.83) leitet `deriveUnifiedAccount(mnemonic, index = 0)`
EINEN `eth_secp256k1`-Schlüssel auf dem Ethereum-HD-Pfad `m/44'/60'/0'/0/{index}`
ab, dessen 20 Adressbytes (`keccak256(pubkey)[12:]`) DIESELBE Identität sind,
die auf drei Arten dargestellt wird:

| Lane | Codierung |
| --- | --- |
| Native | bech32 mit dem `qor`-Präfix (`qor1…`) |
| EVM | `0x` + EIP-55-Mixed-Case-Prüfsummen-Hex |
| SVM | base58 der 20 Bytes, rechts aufgefüllt mit 12 Null-Bytes (32 Bytes) |

Eine Einzahlung auf **eine beliebige** der drei Lanes landet in **einem**
Guthaben, und der Schlüssel gibt auf jeder Lane aus:

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

`unifiedAccountFromSeed(seed32)` macht dasselbe ausgehend von einem rohen
32-Byte-secp256k1-Private-Key.

### Die PQC-Seed-Ableitung

Das ML-DSA-87-Schlüsselpaar des Kontos wird deterministisch und
**adressgebunden** abgeleitet:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

sodass es aus `{ address, mnemonic }` wiederherstellbar und über alle
Sprach-SDKs von QoreChain identisch ist. (Bei `unifiedAccountFromSeed` lautet
der Mnemonic-Slot `"seed:" + hex(seed32)`.)

### Senden auf der Native-Lane mit dem Eth-Key

Ein Unified Account signiert Transaktionen auf dem Native-Pfad mit dem
`eth_secp256k1`-Schema: Die klassische Signatur ist secp256k1 über
**keccak256** der SignDoc-Bytes (nicht sha256), und der `SignerInfo`-Public-Key
verwendet die Type-URL `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Der
Hybrid-Pfad (`signHybridEth`) hängt zusätzlich die ML-DSA-87-`PQCHybridSignature`-
Erweiterung an — auf den Live-Netzwerken erforderlich:

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

Für Kontrolle auf niedrigerer Ebene liefern `signHybridEth(params)` /
`signClassicalEth(params)` die zusammengesetzten `TxRaw`-Bytes und die
Signier-Artefakte, und `accountAuthInfo(baseAccount)` liest `account_number` /
`sequence` aus einem Konto, dessen On-Chain-Pubkey die Type-URL
`eth_secp256k1` verwendet. Der rein klassische Pfad ist für die einmalige, vom
Bootstrap ausgenommene `MsgRegisterPQCKeyV2` gedacht; verwenden Sie für alles
andere Hybrid.

:::caution Auf SDK 0.6.1+ aktualisieren für Hybrid-Transaktionen
SDK **0.6.1** hat einen konsenskritischen Kodierungsfehler behoben: Die
Tx-Body-Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` wurde
JSON-serialisiert in `Any.value` abgelegt, und die Chain **lehnte diese
Transaktionen bei CheckTx ab** (ein Tx-Parse-Fehler). Sie ist jetzt in allen
fünf Sprachen protobuf-kodiert (der Erweiterungswert beginnt mit `0x08`). Jede
mit SDK ≤ 0.6.0 erstellte Hybrid-Transaktion — einschließlich der
Eth-native-Lane — wird On-Chain abgelehnt: aktualisieren Sie auf 0.6.1 oder
neuer.
:::

### Phantom (P1a): ein Unified Account ohne Export eines Schlüssels

`connectPhantomUnified()` (TypeScript) leitet aus einer deterministischen
Phantom-Signatur einen kanonischen, **non-custodial** Unified Account ab: Der
Nutzer signiert eine feste, domänengetrennte Nachricht mit dem
ed25519-Schlüssel von Phantom, und `shake256(signature, 32)` erzeugt den Seed
für das Konto.

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

Das abgeleitete Konto ist ein eigenständiger kanonischer Schlüssel, getrennt
vom ed25519-Schlüssel von Phantom — Phantom bekommt die abgeleiteten
secp256k1/PQC-Geheimnisse nie zu sehen. Damit der Phantom-Schlüssel selbst
unter Limits vom Konto ausgeben kann, siehe
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

## Post-Quanten-Kryptografie (PQC)

QoreChain unterstützt **ML-DSA-87**-Signaturen (Dilithium-5, FIPS 204). Das
SDK stellt die Primitiven direkt bereit.

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

Mit den exportierten Längenkonstanten (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) können Sie Puffergrößen validieren.

> Darunter stammen die PQC-Primitiven aus [**qorechain-pqc**](/developer-guide/post-quantum-signing) — der Open-Source-Bibliothek, die ausschließlich auf Standards setzt und geprüfte FIPS-204/203/202-Implementierungen hinter einer einheitlichen API in sechs Sprachen (JavaScript/TypeScript, Rust, Go, C, Python, Java) kapselt. Greifen Sie direkt darauf zu, wenn Sie die rohen Primitiven oder das `hybridSignBytes`-Framing außerhalb des SDK benötigen.

### Austauschbare Signer (Pluggable Signers)

Zur Komposition stellt das SDK eine `Signer`-Abstraktion sowie die
Implementierungen `PqcSigner` und `HybridSigner` und ein `SignatureMode`-Enum
bereit. Verwenden Sie diese, wenn Sie PQC-Signierung in Ihren eigenen Ablauf
einklinken möchten, statt die Primitiven direkt aufzurufen.

## Hybrid-Signierung {#hybrid-signing}

Eine **Hybrid**-Transaktion trägt sowohl eine klassische secp256k1-Signatur
als auch eine ML-DSA-87-Signatur, sodass sie unter klassischer Verifikation
gültig bleibt und gleichzeitig Post-Quanten-Schutz erhält. Der Post-Quanten-
Teil wird als `PQCHybridSignature`-Erweiterung an der Transaktion mitgeführt.

:::caution Hybrid-Signierung ist auf dem Native-Pfad erforderlich
Stand der aktuellen Chain-Version (**v3.1.92**) ist die Netzwerk-Voreinstellung
`hybrid_signature_mode = required` mit `allow_classical_fallback = false`.
Hybrid-Signierung über `buildHybridTx` (mit `includePqcPublicKey`) — oder
`signHybridEth` für Unified-Eth-native-Konten — ist für Transaktionen auf dem
Native-Pfad **zwingend erforderlich**; rein klassische Native-Transaktionen
werden On-Chain abgelehnt. EVM-Transaktionen verwenden einen separaten
`eth_secp256k1`-Pfad und sind davon nicht betroffen.
:::

:::caution Hybrid-Transaktionen mit SDK ≤ 0.6.0 werden abgelehnt
Das Release 0.6.1 hat die Kodierung der `PQCHybridSignature`-Erweiterung
korrigiert (JSON → protobuf, konsenskritisch). Mit SDK 0.6.0 oder älter
erstellte Hybrid-Transaktionen scheitern bei CheckTx mit einem
Tx-Parse-Fehler — aktualisieren Sie auf 0.6.1+.
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

### On-Chain-Voraussetzung

Damit eine Hybrid-Transaktion On-Chain PQC-verifiziert werden kann, muss der
PQC-Public-Key des Signers über die `MsgRegisterPQCKey` der Chain
**registriert** sein — *es sei denn*, Sie setzen `includePqcPublicKey: true`,
wodurch der Schlüssel in die Erweiterung eingebettet wird, sodass die Chain
ihn bei der ersten Verwendung automatisch registrieren kann.

### Hybrid-Tx-Vertrag (auf hoher Ebene)

Die Transaktion wird klassisch über die Standard-Sign-Bytes signiert (die die
PQC-Erweiterung **ausschließen**), und die ML-DSA-87-Signatur wird berechnet
und als `PQCHybridSignature`-Erweiterung angehängt. Da die klassischen
Sign-Bytes die Erweiterung ausschließen, bleibt die klassische Signatur
gültig, unabhängig davon, ob ein Verifizierer den PQC-Teil versteht. Die
Low-Level-Hilfsfunktionen (`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) sowie die
End-to-End-Builder (`buildHybridTx`, `signAndBroadcastHybrid`) sind für
fortgeschrittene Anwendungsfälle exportiert.

> Die Übermittlung von Hybrid-Transaktionen ist der erforderliche Pfad im
> Live-Netzwerk für Cosmos-Transaktionen. Die lokalen Sign-/Verify-Primitiven
> und Tx-Building-Hilfsfunktionen stehen bereits heute zur Verfügung.

## PQC-Schlüsselrotation

Seit SDK 0.7.0 kann ein Konto seinen ML-DSA-87-Schlüssel auf einen neuen
Schlüssel **desselben Algorithmus** rotieren — dies migriert kanonisch einen
alten `shake256(mnemonic)`-Schlüssel auf den adressgebundenen
`shake256("qorechain:pqc:v1|addr|mnemonic")`-Schlüssel — über
`rotatePqcKeyMsgFromMnemonic` (beide Schlüssel signieren die Rotationsbytes
gemeinsam). Ein vollständiges Beispiel finden Sie unter
[Schlüsselrotation](/sdk/guides/authenticators#key-rotation) im
Authenticators-Guide.

## Algorithmus-Identifikatoren

Das SDK exportiert Algorithmus-IDs und Hilfsfunktionen für die Arbeit auf
Protokollebene: `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)` und `isSignatureAlgorithm(id)`.
