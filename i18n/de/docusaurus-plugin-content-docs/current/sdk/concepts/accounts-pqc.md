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
Guthaben, und der eine Schlüssel ist auf jeder Lane der Signer (auf der
EVM-Lane innerhalb eines [Autorisierungsfensters](/sdk/guides/evm#evm-window);
die SVM-Transaktions-Lane ist derzeit netzwerkweit deaktiviert, SVM ist heute
also nur lesbar):

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
der Mnemonic-Slot `"seed:" + hex(seed32)`.) Seit SDK 0.8.3 löst
`derivePqcCanonical(account, mnemonic)` `account` zuerst in seine kleingeschriebene
`qor1…`-Form auf (`canonicalAccount`), sodass eine großgeschriebene bech32-Adresse
oder die `0x`-Form desselben Kontos denselben Schlüssel ergibt.

### Senden auf der Native-Lane mit dem Eth-Key

Ein Unified Account signiert Transaktionen auf dem Native-Pfad mit dem
`eth_secp256k1`-Schema: Die klassische Signatur ist secp256k1 über
**keccak256** der SignDoc-Bytes (nicht sha256), und der `SignerInfo`-Public-Key
verwendet die Type-URL `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Der
Hybrid-Pfad (`signHybridEth` oder `EthNativeSigner` mit seinem Standard
`signMode: "hybrid"`) hängt zusätzlich die ML-DSA-87-`PQCHybridSignature`-
Erweiterung an, die auf den Live-Netzwerken erforderlich ist.

Vor dem ersten Hybrid-Versand sind zwei Dinge nötig. Erstens muss der
ML-DSA-87-Schlüssel des Kontos (einmalig) **registriert** werden. Die
Registrierung ist die eine klassisch signierte, vom Hybrid ausgenommene
Transaktion: Signieren Sie sie mit `signMode: "classical"`. Der `publicKey`
des Kontos ist ein `0x`-Hex-String, decodieren Sie ihn daher für `ecdsaPubkey`
zu Bytes. Zweitens übergeben Sie `rest` an den Signer, damit dieser das
Netzwerk fragen kann, welche [Sign-Bytes-Form](#sign-bytes-versions) es
verifiziert (auf `qorechain-vladi` und `qorechain-diana` wirft er einen
Fehler, statt zu raten). Erfordert SDK 0.8.1 oder neuer und
`npm i @cosmjs/stargate`:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
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

Für Kontrolle auf niedrigerer Ebene liefern `signHybridEth(params)` /
`signClassicalEth(params)` die zusammengesetzten `TxRaw`-Bytes und die
Signier-Artefakte, und `accountAuthInfo(baseAccount)` liest `account_number` /
`sequence` aus einem protobuf-`BaseAccount`, dessen On-Chain-Pubkey die
Type-URL `eth_secp256k1` verwendet (ein REST-JSON-Konto muss zuerst auf diese
Felder abgebildet werden, wie `authInfo` oben es tut).

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

### Phantom und andere externe Wallets {#phantom}

:::danger Entfernt in SDK 0.8.0
SDK 0.6.0 bis 0.7.0 enthielten `connectPhantomUnified()` und `unifiedAccountFromPhantomSignature()` (in 0.8.0 entfernt; Python und Rust: `unified_account_from_phantom_signature`, Go: `unified.UnifiedAccountFromPhantomSignature`, Java: `UnifiedAccounts.unifiedAccountFromPhantomSignature`), die den Ausgabeschlüssel eines Kontos aus einer Phantom-Signatur über die feste Nachricht `QoreChain unified account derivation v1` plus den base58-Public-Key der Wallet ableiteten.
Eine ed25519-Signatur ist deterministisch, und jede Website kann die Wallet bitten, genau diese Nachricht zu signieren. Wer die Signatur je erhalten hat, kann daher die secp256k1- und ML-DSA-Schlüssel des Kontos rekonstruieren. Beide Funktionen werfen jetzt einen Fehler.

Wenn Sie ein Konto auf diese Weise erstellt haben, behandeln Sie es ab sofort als kompromittiert: Erstellen Sie ein neues Konto aus einer Mnemonic, verschieben Sie die Mittel dorthin und verknüpfen Sie Phantom anschließend als Authenticator mit dem neuen Konto (siehe unten). Das alte Konto lässt sich nicht reparieren, weil seine Adresse an den offengelegten Schlüssel gebunden ist und eine PQC-Schlüsselrotation nur die Post-Quanten-Hälfte ersetzt. Verwenden Sie SDK 0.8.2 oder neuer.
:::

Damit ein Phantom- (oder MetaMask-)Schlüssel von einem Konto ausgeben kann, nutzen Sie die **Authenticator-Lanes**: Registrieren Sie den Wallet-Schlüssel mit `MsgRegisterAuthenticator` und geben Sie dann vom kanonischen PQC-Konto über `MsgExecuteCosmos` / `MsgExecuteEVM` unter einer Berechtigung und einer `SpendingRule` aus. Das Konto behält seine eigenen, aus der Mnemonic abgeleiteten Schlüssel, und der Wallet-Schlüssel kann jederzeit widerrufen werden. Siehe [Authenticators & delegiertes Ausgeben](/sdk/guides/authenticators). Beachten Sie, dass das `abstractaccount`-Modul hinter diesen Lanes derzeit in beiden Netzwerken abgeschaltet ist (`GET /qorechain/abstractaccount/v1/config` zeigt `enabled: false`); ein Wallet-Schlüssel kann also noch nicht verknüpft werden. Bis dahin verwenden Sie das neue Mnemonic-Konto direkt.

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
Implementierungen `PqcSigner` und `HybridSigner` und einen `SignatureMode`-Typ
(`"classical" | "pqc" | "hybrid"`) bereit. Verwenden Sie diese, wenn Sie
PQC-Signierung in Ihren eigenen Ablauf einklinken möchten, statt die
Primitiven direkt aufzurufen.

## Hybrid-Signierung {#hybrid-signing}

Eine **Hybrid**-Transaktion trägt sowohl eine klassische secp256k1-Signatur
als auch eine ML-DSA-87-Signatur, sodass sie unter klassischer Verifikation
gültig bleibt und gleichzeitig Post-Quanten-Schutz erhält. Der Post-Quanten-
Teil wird als `PQCHybridSignature`-Erweiterung an der Transaktion mitgeführt.

:::caution Hybrid-Signierung ist auf dem Native-Pfad erforderlich
Ab Chain-Version **v3.2.0** (der Version, die beide Netzwerke betreiben) ist die
Netzwerk-Voreinstellung `hybrid_signature_mode = required` mit
`allow_classical_fallback = false`. Hybrid-Signierung über `buildHybridTx` /
`signAndBroadcastHybrid` (übergeben Sie `rest`) oder `signHybridEth` /
`EthNativeSigner` für Unified-Eth-native-Konten ist für Transaktionen auf dem
Native-Pfad **zwingend erforderlich**; rein klassische Native-Transaktionen
werden On-Chain abgelehnt. EVM-Transaktionen sind eine separate Lane, werden
aber seit v3.2.0 nur noch von einem Konto mit registriertem ML-DSA-87-Schlüssel
und einem offenen [Autorisierungsfenster](/sdk/guides/evm#evm-window)
zugelassen.
:::

:::caution Hybrid-Transaktionen mit SDK ≤ 0.6.0 werden abgelehnt
Das Release 0.6.1 hat die Kodierung der `PQCHybridSignature`-Erweiterung
korrigiert (JSON → protobuf, konsenskritisch). Mit SDK 0.6.0 oder älter
erstellte Hybrid-Transaktionen scheitern bei CheckTx mit einem
Tx-Parse-Fehler — aktualisieren Sie auf 0.6.1+.
:::

Der End-to-End-Builder für ein Konto mit Coin-Type 118 ist
`signAndBroadcastHybrid` (oder `buildHybridTx`, um ohne Broadcast zu bauen). Er
benötigt den klassischen Signer, das ML-DSA-87-Schlüsselpaar des Kontos,
Kontonummer und Sequenz sowie `rest`. SDK 0.8.3 oder neuer,
`npm i @cosmjs/stargate`:

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

### On-Chain-Voraussetzung

Damit eine Hybrid-Transaktion PQC-verifiziert wird, muss der PQC-Public-Key des
Signers mit `MsgRegisterPQCKeyV2` **registriert** sein (klassisch signiert,
vom Hybrid ausgenommen). Das erledigen `ensurePqcRegistered` /
`buildRegisterPqcKeyMsg` des SDK, `qorechaind tx pqc
register-key` oder eine QoreChain-Wallet. `includePqcPublicKey: true` bettet
den Schlüssel nur in die Erweiterung ein; es registriert ihn **nicht**, und die
Chain registriert einen Schlüssel nicht bei der ersten Verwendung.

### Welche Sign-Bytes-Form? {#sign-bytes-versions}

Die ML-DSA-87-Hälfte einer Hybrid-Transaktion wird über eine von zwei
Byte-Formen signiert, und ein Netzwerk verifiziert bei jeder Höhe genau eine:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` ist der Transaktions-Body ohne die PQC-Erweiterung und `A` die
`AuthInfo`-Bytes. `qorechain-vladi` und `qorechain-diana` verifizieren beide
**v2**. Der Wechsel wurde im Mainnet unter dem Upgrade-Namen `v3.2.0` und im
Testnet unter `v3.1.98` (dann `v3.2.0`) festgehalten. Ein Client muss daher
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` für **beide** Namen abfragen
und v2 verwenden, wenn eine der Höhen größer als null ist. Das SDK erledigt
das für Sie: Jeder Hybrid-Builder akzeptiert `signBytesVersion` (standardmäßig
`"auto"`, oder `"v1"` / `"v2"`), und `"auto"` benötigt auf diesen beiden Chains
die REST-URL des Netzwerks (`rest`): Es wirft einen Fehler, statt zu raten. Die
High-Level-Pfade lösen erneut auf und wiederholen einmal, wenn die Chain die
Signatur mit `pqc`-Code 21 verweigert. Übergeben Sie in Unit-Tests
`signBytesVersion` explizit, damit der Test nicht von einem Live-Node abhängt.
Siehe auch
[Fehlerbehebung Code 21](/developer-guide/post-quantum-signing#code-21).

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
