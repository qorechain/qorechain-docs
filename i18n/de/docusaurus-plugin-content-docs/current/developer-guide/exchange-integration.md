---
slug: /developer-guide/exchange-integration
title: Exchange- & Integrator-Leitfaden
sidebar_label: Exchange-Integration
sidebar_position: 11
---

# Exchange- & Integrator-Leitfaden

Alles, was eine Börse, ein Verwahrer oder ein Zahlungsintegrator benötigt, um QOR zu listen und Einzahlungen sowie Auszahlungen zu verarbeiten: die Wahl einer Schnittstelle, das sichere Erkennen von Einzahlungen und das Signieren von Auszahlungen.

:::note
Dieser Leitfaden richtet sich an das **`qorechain-vladi`**-Mainnet (Chain-Version **v3.1.95**). Üben Sie den gesamten Ablauf zunächst im **`qorechain-diana`**-Testnet — die Endpunkte für beide Netzwerke finden Sie unter [Networks](/appendix/networks#public-endpoints). Wenn Sie einen eigenen Full Node betreiben, halten Sie ihn auf der aktuellen Chain-Version — ein veralteter Node kann neuere Transaktionstypen nicht dekodieren und stoppt die Synchronisierung.
:::

## Wahl des Integrationspfads {#choosing-a-path}

QoreChain ist eine einzige Chain mit **einem einheitlichen nativen QOR-Guthaben**, das über drei Schnittstellen zugänglich ist. **Derselbe private Schlüssel kontrolliert dieselben Mittel** unter einer Cosmos-Adresse (`qor1...`), einer EVM-Adresse (`0x...`) und einer SVM-Adresse (base58) — wählen Sie die Schnittstelle, die zu Ihrem Stack passt.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (gleicher Schlüssel) |
| Dezimalstellen (natives QOR) | **6** (`uqor`) | **18** (im Wei-Stil) | **9** (Lamports; 1 uqor = 1,000 Lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard-Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Auszahlungssignierung | **Hybrid-PQC erforderlich** (ML-DSA-87 + secp256k1) | **Standard-secp256k1 / EIP-155 — kein PQC** | über Cosmos-Tx oder On-Node-Einreichung |
| Memo-/Tag-Unterstützung | **Ja** (gemeinsame Adresse + Memo) | Nein (eine Adresse pro Nutzer) | Nein (eine Adresse pro Nutzer) |
| Einzahlungserkennung | `MsgSend`-Events scannen | Blöcke per `eth_getBlockByNumber` scannen | `getBalance` / `getSignaturesForAddress` |
| Am besten geeignet für | Cosmos-native Plattformen | **Plattformen mit bestehender EVM-Integration** | Plattformen mit Solana-Tooling |

**Empfehlung:** Wenn Sie bereits EVM-Chains unterstützen, ist **Pfad B (EVM)** die Integration mit dem geringsten Aufwand — Standard-Ethereum-Tooling, und **Auszahlungen erfordern keine Post-Quanten-Signierung** (der EVM-Ante-Pfad ist davon ausgenommen). Pfad A (Cosmos) ist der native Weg mit memo-basierten gemeinsamen Einzahlungsadressen. Pfad C (SVM) ist auf dem Papier eine vollständige native-QOR-Schnittstelle, aber **seine Transaktions-Lane ist derzeit netzwerkweit deaktiviert** (siehe [Path C](#path-c-svm)) — verwenden Sie bis zur Wiedereröffnung Pfad A oder Pfad B.

Die drei Schnittstellen schließen sich **nicht gegenseitig aus** — Mittel, die an die `0x`-, `qor1`- oder SVM-Form desselben Schlüssels gesendet werden, sind dasselbe Guthaben.

## Betrieb des eigenen Node {#node}

Produktions-Integrationen sollten Einzahlungen gegen ihren **eigenen synchronisierten Node** verifizieren, nicht gegen einen Drittanbieter-Endpunkt. Folgen Sie [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — dort werden das vorgefertigte Binary-Bundle (mit SHA-256-Prüfsummen), das Genesis, die öffentlichen Peers, die Gebührenuntergrenze (`0.1uqor`) und ein schneller Bootstrap über den veröffentlichten Chain-Data-Snapshot behandelt. Für den Betrieb eines nicht validierenden Full Node ist keine Lizenz erforderlich.

Da QoreChain **sofortige Finalität** besitzt (keine Reorgs), ist **1 Bestätigung final**; das Abwarten von 1–2 Blöcken bietet einen komfortablen operativen Spielraum.

## Pfad A — Cosmos (nativ) {#path-a-cosmos}

Basis-REST-URL: `https://api.qore.host` (oder `http://localhost:1317` auf Ihrem Node).

### Einzahlungen überwachen

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checkliste gegen gefälschte Einzahlungen {#anti-fake-deposit}

Buchen Sie eine Einzahlung **nur** gut, wenn **alle** der folgenden Bedingungen erfüllt sind:

1. **`tx_response.code == 0`** — die Transaktion war erfolgreich; buchen Sie niemals eine fehlgeschlagene Tx gut.
2. Die Message ist **`/cosmos.bank.v1beta1.MsgSend`** (oder ein `MsgMultiSend`-Output) — kein Contract-Aufruf und kein anderes Modul.
3. Die **`to_address`** entspricht Ihrer Einzahlungsadresse, und (beim Modell der gemeinsamen Adresse) stimmt das **`memo`** mit dem Nutzer überein.
4. Das **`denom == "uqor"`** und der `amount` ist der gutgeschriebene Wert (uqor → ÷ 10⁶ für QOR). Lehnen Sie jede andere Denom ab.
5. Die Tx befindet sich in einem **committeten Block** (`height` vorhanden und ≤ der aktuellsten committeten Höhe). Die Finalität ist sofort — 1 Bestätigung ist final; warten Sie 1–2 Blöcke für zusätzlichen Spielraum.
6. Berechnen Sie den Betrag anhand der **Transfer-Events** (`coin_received` / `coin_spent`) neu und gleichen Sie ihn mit dem Message-Betrag ab — verlassen Sie sich niemals allein auf ein einzelnes Feld oder das Memo.
7. Überprüfen Sie über `GET /cosmos/tx/v1beta1/txs/{hash}` gegen Ihren **eigenen** synchronisierten Node, dass der Tx-Hash existiert.

### Auszahlungen — Hybrid-PQC-Signierung {#cosmos-withdrawals}

Das Mainnet erzwingt **Post-Quanten-Signaturen** bei Cosmos-Transaktionen (`allow_classical_fallback = false`): Jede Auszahlung benötigt eine **Hybrid-Signatur** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Einzahlungen benötigen dies **nicht** (Sie beobachten die Chain nur).

Die Signierbibliothek ist [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), die für die FIPS-204-Primitive `@qorechain/pqc` einbindet:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Die Signierung erfolgt in einem **zweistufigen** Ablauf (analog zu `qorechaind tx pqc cosign`):

**Schritt 1 — einmalig pro Hot Wallet: den ML-DSA-87-Schlüssel registrieren.** Diese einzelne Registrierungstransaktion wird **klassisch signiert** (Bootstrap-Ausnahme): Message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` mit `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Leiten Sie den ML-DSA-Schlüssel deterministisch ab, damit er aus Ihrem vorhandenen Secret wiederherstellbar ist — z. B. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, dann `mldsa.keygen(seed)` — und speichern Sie den Seed zusammen mit Ihrem Hot-Wallet-Schlüssel.

**Schritt 2 — bei jeder weiteren Auszahlung: die `MsgSend` hybrid signieren.** Der Adapter bettet die ML-DSA-87-Signatur *vor* dem normalen secp256k1-`signDirect` in eine Tx-Body-Extension ein, sodass Ihr vorhandener Signer unverändert bleibt:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Übertragen Sie die signierten Bytes:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Fragen Sie anschließend per Polling `GET /cosmos/tx/v1beta1/txs/{hash}` ab, bis sie mit `code == 0` in einem Block erscheint.

Für ein HSM oder einen eigenen Signer in einer anderen Sprache verwenden Sie die eigenständigen [**`qorechain-pqc`**](/developer-guide/post-quantum-signing)-FIPS-204-Bibliotheken (npm, PyPI, crates.io, Maven Central, Go) und bauen Sie dieselbe Extension zusammen. Die ML-DSA-Signatur **muss deterministisch sein** (FIPS-204 §3.4) — siehe [Deterministic signing](/developer-guide/post-quantum-signing#deterministic-signing); die Chain lehnt gehedgte Signaturen ab.

### Serverseitige Alternative: `@qorechain/chain-bridge` {#chain-bridge}

Für einen vollständig serverseitigen Hot-Wallet-Worker (ohne Browser-Wallet) fasst **`@qorechain/chain-bridge`** (npm) den gesamten Ablauf — Schlüsselableitung, automatische PQC-Registrierung bei der ersten Nutzung, Hybrid-Signierung und Broadcast — in einem einzigen Aufruf zusammen. Es ist reines JavaScript (keine nativen Addons) und eignet sich für serverlose Worker:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1) verwendet dieselbe kanonische, adressgebundene PQC-Ableitung wie der Rest des Stacks — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — sodass der Schlüssel mit `qorechaind tx pqc recover-key` aus der Mnemonic wiederhergestellt werden kann. Konten, die mit älterem Tooling registriert wurden, werden automatisch behandelt (Legacy-Key-Fallback) und können einmalig mit [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) auf den kanonischen Schlüssel migriert werden.

## Pfad B — EVM {#path-b-evm}

Standard-Ethereum-Integration gegen `https://evm.qore.host` (Chain-ID **9801**) oder den Port 8545 Ihres eigenen Node.

* **Dezimalstellen:** Natives QOR hat auf der EVM-Schiene **18 Dezimalstellen** (1 uqor = 10¹² Wei). Ein Fehler hier führt zu einer um den Faktor 10¹² falschen Gutschrift von Einzahlungen.
* **Einzahlungen:** Scannen Sie Blöcke mit `eth_getBlockByNumber` nach nativen Transfers an Ihre Adressen; bestätigen Sie mit `eth_getTransactionReceipt` (`status == 0x1`).
* **Auszahlungen:** Standard-secp256k1-/EIP-155-Signierung — auf dem EVM-Ante-Pfad ist **kein PQC erforderlich**. Jeder Ethereum-Signing-Stack funktioniert unverändert.
* **Schutz vor gefälschten Einzahlungen:** Überprüfen Sie den Receipt-Status, dass es sich beim übertragenen Wert um einen **nativen** Transfer handelt (nicht um ein ERC-20-Event, das Sie nicht indexieren), und bestätigen Sie dies gegen Ihren eigenen Node.
* **Adresszuordnung:** Die `0x`-Adresse und die `qor1`-Adresse sind zwei Kodierungen desselben Kontos — die Mittel werden gemeinsam genutzt. Siehe [EVM Development](/developer-guide/evm-development).

## Pfad C — SVM (Solana-kompatibel) {#path-c-svm}

:::caution SVM-Lane derzeit deaktiviert
Die SVM-Ausführungs-Lane ist **derzeit netzwerkweit für die Transaktionseinreichung deaktiviert**, seit Chain-Version v3.1.89 (22. August) — jede Transaktion dorthin liefert `code 11, "SVM module is disabled"` zurück. Bauen Sie **keine** Einzahlungs-/Auszahlungsschiene auf Pfad C auf, bevor die Lane wieder geöffnet wird — dies ist eine zur Kompilierzeit festgelegte Deaktivierung, kein Laufzeitparameter, sie kann also nicht per Governance-Abstimmung wieder aktiviert werden; es wird erwartet, dass sie deaktiviert bleibt, bis ein externes Audit sie freigibt. Verwenden Sie stattdessen **Pfad A (Cosmos)** oder **Pfad B (EVM)**. Lesende Endpunkte (z. B. `getBalance`) antworten unter Umständen weiterhin, aber bauen Sie keine Einzahlungserkennung oder Auszahlungsabläufe gegen SVM, solange die Transaktionseinreichung deaktiviert ist.
:::

Seit v3.1.82 stellt die SVM-Schnittstelle **natives QOR** bereit (siehe [Native QOR on the SVM Interface](/developer-guide/svm-development#native-qor)):

* **Guthaben:** `getBalance` liefert Lamports zurück (÷ 10⁹ für QOR; 1 uqor = 1,000 Lamports).
* **Einzahlungen:** `getSignaturesForAddress` liefert die Transaktionshistorie für eine Adresse; System-Program-Transfers bewegen natives QOR.
* Öffentliche Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **nur lesend**; reichen Sie Transaktionen über Ihren eigenen Node ein.

## Ablaufübersicht {#flow-summary}

| Vorgang | Pfad | Signierung erforderlich? |
|---|---|---|
| **Einzahlung** (Nutzer → Plattform) | Beobachten Sie Ihren synchronisierten Node auf Transfers an Ihre Adresse (+ Memo bei Cosmos) | Nein — nur Überwachung |
| **Auszahlung** (Plattform → Nutzer) | Transfer erstellen, offline signieren, übertragen | Cosmos: Hybrid-PQC · EVM: Standard-secp256k1 |
| **Guthaben / Sweep** | REST-/EVM-/SVM-Guthabenabfrage + Transfer | Nur für den Sweep signieren |

## Weiterführende Links

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Node-Setup, Downloads, Snapshot
* [Running a Node](/developer-guide/running-a-node) — Deployment, Pruning, Indexing
* [Post-Quantum Signing](/developer-guide/post-quantum-signing) — die FIPS-204-Bibliotheken hinter Hybrid-Auszahlungen
* [Networks](/appendix/networks) — Chain-IDs, Endpunkte, Dezimalstellen pro Schnittstelle
