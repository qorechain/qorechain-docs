---
slug: /sdk/concepts/accounts-pqc
title: Konten & PQC-Signierung
sidebar_label: Konten & PQC
sidebar_position: 2
---

# Konten & PQC-Signierung

QoreChain-Konten werden aus einer einzigen BIP-39-Mnemonic abgeleitet. Dieselbe
Mnemonic ergibt über unabhängige Ableitungspfade ein natives, ein EVM- und ein
SVM-Konto.

## HD-Ableitung

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

Die Mnemonic wird (Wörter **und** Prüfsumme) validiert, bevor ein Schlüssel
abgeleitet wird, sodass ein Tippfehler einen Fehler auslöst, statt stillschweigend
ein falsches Konto zu erzeugen. Du kannst explizit mit
`validateMnemonic(mnemonic)` validieren.

### Ableitungsschemata

| Typ | Kurve | Pfad | Adresse |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` von `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 des 32-Byte-Public-Keys |

Übergib einen Konto-Index, um zusätzliche Konten abzuleiten. In TypeScript:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

In Python/Go/Rust ist der Index ein Positionsargument
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Hinweis zu Known-Answer-Tests

Die Ableitungsschemata sind deterministisch und durch Known-Answer-Tests über
alle vier SDKs hinweg abgedeckt, sodass dieselbe Mnemonic in TypeScript, Python,
Go und Rust identische Adressen erzeugt. So kannst du in einer Sprache ableiten
und in einer anderen verifizieren.

## Post-Quantum-Kryptografie (PQC)

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
`ML_DSA_87_SEED_LENGTH`) erlauben dir, Puffergrößen zu validieren.

> Im Unterbau stammen die PQC-Primitive aus [**qorechain-pqc**](/developer-guide/post-quantum-signing) — der quelloffenen, ausschließlich standardbasierten Bibliothek, die auditierte FIPS-204/203/202-Implementierungen hinter einer konsistenten API in sechs Sprachen (JavaScript/TypeScript, Rust, Go, C, Python, Java) kapselt. Greife direkt darauf zurück, wenn du die rohen Primitive oder das `hybridSignBytes`-Framing außerhalb des SDK brauchst.

### Einsteckbare Signierer

Für Komposition stellt das SDK eine `Signer`-Abstraktion plus `PqcSigner`- und
`HybridSigner`-Implementierungen sowie ein `SignatureMode`-Enum bereit. Nutze
diese, wenn du PQC-Signierung in deinen eigenen Ablauf einstecken willst, statt
die Primitive direkt aufzurufen.

## Hybride Signierung

Eine **hybride** Transaktion trägt sowohl eine klassische secp256k1-Signatur als
auch eine ML-DSA-87-Signatur, sodass sie unter klassischer Verifikation gültig
bleibt und zugleich Post-Quantum-Schutz gewinnt. Der Post-Quantum-Teil reist als
`PQCHybridSignature`-Erweiterung auf der Transaktion mit.

:::caution Hybride Signierung ist auf dem Cosmos-Pfad erforderlich
Ab der aktuellen Chain-Version (**v3.1.77**) ist die Netzwerk-Vorgabe
`hybrid_signature_mode = required` mit `allow_classical_fallback = false`.
Hybride Signierung über `buildHybridTx` (mit `includePqcPublicKey`) ist für
Cosmos-Pfad-Transaktionen **verpflichtend** — rein klassische
Cosmos-Transaktionen werden on-chain abgelehnt. EVM-Transaktionen nutzen einen
separaten `eth_secp256k1`-Pfad und sind davon nicht betroffen.
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

Bevor eine hybride Transaktion on-chain PQC-verifiziert, muss der öffentliche
PQC-Schlüssel des Signierers über das `MsgRegisterPQCKey` der Chain
**registriert** sein — *es sei denn*, du setzt `includePqcPublicKey: true`, was
den Schlüssel in die Erweiterung einbettet, sodass die Chain ihn bei der ersten
Verwendung automatisch registrieren kann.

### Hybrid-Tx-Vertrag (Überblick)

Die Transaktion wird klassisch über die Standard-Sign-Bytes signiert (die die
PQC-Erweiterung **ausschließen**), und die ML-DSA-87-Signatur wird berechnet und
als `PQCHybridSignature`-Erweiterung angehängt. Weil die klassischen Sign-Bytes
die Erweiterung ausschließen, bleibt die klassische Signatur gültig, ob ein
Verifizierer den PQC-Teil versteht oder nicht. Die Helfer auf niedrigerer Ebene
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) und die
End-to-End-Builder (`buildHybridTx`, `signAndBroadcastHybrid`) werden für den
fortgeschrittenen Gebrauch exportiert.

> Die Einreichung hybrider Transaktionen ist im Live-Netzwerk der erforderliche
> Pfad für Cosmos-Transaktionen. Die lokalen Sign-/Verify-Primitive und die
> Tx-Building-Helfer sind heute verfügbar.

## Algorithmus-Identifikatoren

Das SDK exportiert Algorithmus-IDs und Helfer für die Arbeit auf Protokollebene:
`AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` und `isSignatureAlgorithm(id)`.
