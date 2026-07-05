---
slug: /sdk/concepts/accounts-pqc
title: Konten & PQC-Signierung
sidebar_label: Konten & PQC
sidebar_position: 2
---

# Konten & PQC-Signierung

QoreChain-Konten werden aus einer einzigen BIP-39-Mnemonic abgeleitet. Es gibt
zwei Kontenmodelle, die beide vollständig unterstützt werden:

- **HD-Ableitung pro Lane (Legacy/Standard)** — dieselbe Mnemonic liefert über
  unabhängige Ableitungspfade ein natives Konto (Coin-Type 118), ein EVM-Konto
  (Coin-Type 60) und ein SVM-Konto (Coin-Type 501). Drei Schlüssel, drei
  Adressen.
- **Vereinheitlichte eth-native Konten** (SDK 0.6.0, Chain v3.1.83) — EIN
  `eth_secp256k1`-Schlüssel ist EINE 20-Byte-Identität, dargestellt in allen
  drei Adress-Kodierungen, mit einem gemeinsamen Guthaben. Siehe
  [Vereinheitlichte Konten](#unified-accounts).

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

Die Mnemonic wird validiert (Wörter **und** Prüfsumme), bevor ein Schlüssel
abgeleitet wird — ein Tippfehler löst also einen Fehler aus, statt stillschweigend
ein falsches Konto zu erzeugen. Mit `validateMnemonic(mnemonic)` können Sie
explizit validieren.

### Ableitungsschemata

| Typ | Kurve | Pfad | Adresse |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` von `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 des 32-Byte-Public-Keys |

Übergeben Sie einen Kontenindex, um weitere Konten abzuleiten. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust ist der Index ein positionales Argument
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Hinweis zu Known-Answer-Tests

Die Ableitungsschemata sind deterministisch und durch Known-Answer-Tests in
allen vier SDKs abgedeckt, sodass dieselbe Mnemonic in TypeScript, Python, Go
und Rust identische Adressen erzeugt. Sie können also in einer Sprache ableiten
und in einer anderen verifizieren.

> Diese Ableitung pro Lane (`deriveNativeAccount` mit Coin-Type 118, plus
> `deriveEvmAccount` / `deriveSvmAccount`) ist das **Legacy-/Standard**-Modell
> und bleibt unterstützt und unverändert. Die vereinheitlichten Konten unten
> sind ein zusätzliches, optionales Identitätsmodell.

## Vereinheitlichte Konten (eth-native) {#unified-accounts}

Seit SDK **0.6.0** (Chain v3.1.83) leitet `deriveUnifiedAccount(mnemonic, index = 0)`
EINEN `eth_secp256k1`-Schlüssel auf dem Ethereum-HD-Pfad `m/44'/60'/0'/0/{index}`
ab, dessen 20 Adress-Bytes (`keccak256(pubkey)[12:]`) DIESELBE Identität in drei
Darstellungen sind:

| Lane | Kodierung |
| --- | --- |
| Native | bech32 mit dem Präfix `qor` (`qor1…`) |
| EVM | `0x` + EIP-55 Mixed-Case-Prüfsummen-Hex |
| SVM | base58 der 20 Bytes, rechts mit 12 Null-Bytes aufgefüllt (32 Bytes) |

Eine Einzahlung an **eine beliebige** der drei landet in **einem** Guthaben,
und der Schlüssel kann auf jeder Lane ausgeben:

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

`unifiedAccountFromSeed(seed32)` leistet dasselbe ausgehend von einem rohen
32-Byte-secp256k1-Privatschlüssel.

### Die PQC-Seed-Ableitung

Das ML-DSA-87-Schlüsselpaar des Kontos wird deterministisch und
**adressgebunden** abgeleitet:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

Es ist somit aus `{ address, mnemonic }` wiederherstellbar und in allen
Sprach-SDKs von QoreChain identisch. (Bei `unifiedAccountFromSeed` ist der
Mnemonic-Platzhalter `"seed:" + hex(seed32)`.)

### Senden auf der Native-Lane mit dem eth-Schlüssel

Ein vereinheitlichtes Konto signiert Transaktionen auf dem Native-Pfad mit dem
`eth_secp256k1`-Schema: Die klassische Signatur ist secp256k1 über **keccak256**
der SignDoc-Bytes (nicht sha256), und der Public Key in `SignerInfo` verwendet
die Typ-URL `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Der Hybrid-Pfad
(`signHybridEth`) hängt zusätzlich die ML-DSA-87-`PQCHybridSignature`-Extension
an — auf den Live-Netzwerken erforderlich:

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
Signatur-Artefakte, und `accountAuthInfo(baseAccount)` liest `account_number` /
`sequence` aus einem Konto, dessen On-Chain-Pubkey die
`eth_secp256k1`-Typ-URL verwendet. Der rein klassische Pfad ist für die
einmalige, vom Bootstrap ausgenommene `MsgRegisterPQCKeyV2` gedacht; verwenden
Sie für alles andere Hybrid.

:::caution Für Hybrid-Transaktionen auf SDK 0.6.1+ upgraden
SDK **0.6.1** hat einen konsenskritischen Kodierungsfehler behoben: Die
Tx-Body-Extension `/qorechain.pqc.v1.PQCHybridSignature` wurde als JSON in
`Any.value` serialisiert, und die Chain **lehnte diese Transaktionen bei
CheckTx ab** (ein Tx-Parse-Fehler). Sie wird nun in allen fünf Sprachen als
Protobuf kodiert (der Extension-Wert beginnt mit `0x08`). Jede
Hybrid-Transaktion — einschließlich der eth-nativen Lane —, die mit SDK ≤ 0.6.0
gebaut wurde, wird on-chain abgelehnt: Upgraden Sie auf 0.6.1 oder neuer.
:::

### Phantom (P1a): ein vereinheitlichtes Konto ohne Schlüssel-Export

`connectPhantomUnified()` (TypeScript) leitet ein kanonisches,
**non-custodial** vereinheitlichtes Konto aus einer deterministischen
Phantom-Signatur ab: Der Nutzer signiert eine feste, domänen-separierte
Nachricht mit dem ed25519-Schlüssel von Phantom, und
`shake256(signature, 32)` dient als Seed für das Konto.

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

Das abgeleitete Konto ist ein eigener kanonischer Schlüssel, getrennt vom
ed25519-Schlüssel von Phantom — Phantom sieht die abgeleiteten
secp256k1-/PQC-Geheimnisse nie. Wie der Phantom-Schlüssel selbst innerhalb von
Limits aus dem Konto ausgeben kann, erfahren Sie unter
[Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators).

## Post-Quanten-Kryptographie (PQC)

QoreChain unterstützt **ML-DSA-87**-Signaturen (Dilithium-5, FIPS 204). Das SDK
stellt die Primitive direkt bereit.

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

Die exportierten Längenkonstanten (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) ermöglichen die Validierung von Puffergrößen.

> Unter der Haube stammen die PQC-Primitive aus [**qorechain-pqc**](/developer-guide/post-quantum-signing) — der quelloffenen, rein standardbasierten Bibliothek, die auditierte FIPS-204/203/202-Implementierungen hinter einer konsistenten API in sechs Sprachen kapselt (JavaScript/TypeScript, Rust, Go, C, Python, Java). Greifen Sie direkt darauf zurück, wenn Sie die rohen Primitive oder das `hybridSignBytes`-Framing außerhalb des SDK benötigen.

### Steckbare Signer

Für die Komposition stellt das SDK eine `Signer`-Abstraktion samt den
Implementierungen `PqcSigner` und `HybridSigner` sowie ein
`SignatureMode`-Enum bereit. Verwenden Sie diese, wenn Sie PQC-Signierung in
Ihren eigenen Ablauf einbinden möchten, statt die Primitive direkt aufzurufen.

## Hybrid-Signierung {#hybrid-signing}

Eine **Hybrid**-Transaktion trägt sowohl eine klassische secp256k1-Signatur als
auch eine ML-DSA-87-Signatur; sie bleibt damit unter klassischer Verifikation
gültig und erhält zugleich Post-Quanten-Schutz. Der Post-Quanten-Teil reist als
`PQCHybridSignature`-Extension in der Transaktion mit.

:::caution Hybrid-Signierung ist auf dem Native-Pfad erforderlich
Ab der aktuellen Chain-Version (**v3.1.85**) ist der Netzwerk-Standard
`hybrid_signature_mode = required` mit `allow_classical_fallback = false`.
Hybrid-Signierung über `buildHybridTx` (mit `includePqcPublicKey`) — oder
`signHybridEth` für vereinheitlichte eth-native Konten — ist für
Transaktionen auf dem Native-Pfad **verpflichtend**; rein klassische
Native-Transaktionen werden on-chain abgelehnt. EVM-Transaktionen nutzen einen
separaten `eth_secp256k1`-Pfad und sind nicht betroffen.
:::

:::caution Hybrid-Transaktionen mit SDK ≤ 0.6.0 werden abgelehnt
Das Release 0.6.1 hat die Kodierung der `PQCHybridSignature`-Extension
korrigiert (JSON → Protobuf, konsenskritisch). Hybrid-Transaktionen, die mit
SDK 0.6.0 oder früher gebaut wurden, scheitern bei CheckTx mit einem
Tx-Parse-Fehler — upgraden Sie auf 0.6.1+.
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

Bevor eine Hybrid-Transaktion on-chain PQC-verifiziert wird, muss der
PQC-Public-Key des Signierers über das `MsgRegisterPQCKey` der Chain
**registriert** sein — *es sei denn*, Sie setzen `includePqcPublicKey: true`;
dann wird der Schlüssel in die Extension eingebettet, sodass die Chain ihn bei
der ersten Verwendung automatisch registrieren kann.

### Hybrid-Tx-Vertrag (auf hoher Ebene)

Die Transaktion wird klassisch über die Standard-Sign-Bytes signiert (die die
PQC-Extension **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und
als `PQCHybridSignature`-Extension angehängt. Da die klassischen Sign-Bytes die
Extension ausschließen, bleibt die klassische Signatur gültig — unabhängig
davon, ob ein Verifizierer den PQC-Teil versteht. Die Low-Level-Helfer
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) und die
End-to-End-Builder (`buildHybridTx`, `signAndBroadcastHybrid`) werden für
fortgeschrittene Anwendungsfälle exportiert.

> Die Einreichung von Hybrid-Transaktionen ist im Live-Netzwerk der
> erforderliche Pfad für Cosmos-Transaktionen. Die lokalen
> Sign-/Verify-Primitive und Tx-Building-Helfer sind heute verfügbar.

## PQC-Schlüsselrotation

Seit SDK 0.7.0 kann ein Konto seinen ML-DSA-87-Schlüssel zu einem neuen
Schlüssel des **gleichen Algorithmus** rotieren — kanonisch die Migration eines
Legacy-`shake256(mnemonic)`-Schlüssels zum adressgebundenen
`shake256("qorechain:pqc:v1|addr|mnemonic")`-Schlüssel — über
`rotatePqcKeyMsgFromMnemonic` (beide Schlüssel signieren die Rotations-Bytes
gemeinsam). Ein vollständiges Beispiel finden Sie unter
[Schlüsselrotation](/sdk/guides/authenticators#key-rotation) im
Authenticators-Guide.

## Algorithmus-Identifikatoren

Das SDK exportiert Algorithmus-IDs und Helfer für Arbeit auf Protokollebene:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` und `isSignatureAlgorithm(id)`.
