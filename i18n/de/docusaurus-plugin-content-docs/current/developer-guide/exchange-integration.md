---
slug: /developer-guide/exchange-integration
title: Leitfaden für Börsen & Integratoren
sidebar_label: Börsen-Integration
sidebar_position: 11
---

# Leitfaden für Börsen & Integratoren

Alles, was eine Börse, ein Verwahrer oder ein Zahlungsintegrator benötigt, um QOR zu listen und Einzahlungen sowie Auszahlungen abzuwickeln: die Wahl einer Schnittstelle, das sichere Erkennen von Einzahlungen und das Signieren von Auszahlungen.

:::note
Dieser Leitfaden richtet sich an das **`qorechain-vladi`**-Mainnet (Chain-Version **v3.1.85**). Proben Sie den vollständigen Ablauf zuerst im **`qorechain-diana`**-Testnet — die Endpunkte beider Netzwerke finden Sie unter [Netzwerke](/appendix/networks#public-endpoints). Wenn Sie einen eigenen Full Node betreiben, halten Sie ihn auf der aktuellen Chain-Version — ein veralteter Node kann neuere Transaktionstypen nicht dekodieren und stoppt die Synchronisation.
:::

## Wahl des Integrationspfads {#choosing-a-path}

QoreChain ist eine einzelne Chain mit **einem einheitlichen nativen QOR-Guthaben**, das über drei Schnittstellen zugänglich ist. Der **gleiche private Schlüssel kontrolliert dieselben Gelder** unter einer Cosmos- (`qor1...`), einer EVM- (`0x...`) und einer SVM-Adresse (base58) — wählen Sie die Schnittstelle, die zu Ihrem Stack passt.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (gleicher Schlüssel) |
| Dezimalstellen (natives QOR) | **6** (`uqor`) | **18** (wei-artig) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard-Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Auszahlungs-Signierung | **Hybrides PQC erforderlich** (ML-DSA-87 + secp256k1) | **Standard secp256k1 / EIP-155 — kein PQC** | über Cosmos-Tx oder Einreichung am eigenen Node |
| Memo-/Tag-Unterstützung | **Ja** (gemeinsame Adresse + Memo) | Nein (eine Adresse pro Nutzer) | Nein (eine Adresse pro Nutzer) |
| Einzahlungserkennung | `MsgSend`-Events scannen | Blöcke via `eth_getBlockByNumber` scannen | `getBalance` / `getSignaturesForAddress` |
| Am besten geeignet für | Cosmos-native Plattformen | **Plattformen mit bestehender EVM-Integration** | Plattformen mit Solana-Tooling |

**Empfehlung:** Wenn Sie bereits EVM-Chains unterstützen, ist **Pfad B (EVM)** die Integration mit dem geringsten Aufwand — Standard-Ethereum-Tooling, und **Auszahlungen erfordern keine Post-Quanten-Signierung** (der EVM-Ante-Pfad ist ausgenommen). Pfad A (Cosmos) ist der native Weg mit memo-basierten gemeinsamen Einzahlungsadressen. Pfad C (SVM) ist ebenfalls eine vollwertige native QOR-Schnittstelle — wählen Sie ihn, wenn Sie gezielt Solana-Tooling bevorzugen.

Die drei Schnittstellen schließen sich **nicht gegenseitig aus** — Gelder, die an die `0x`-, `qor1`- oder SVM-Form desselben Schlüssels gesendet werden, sind dasselbe Guthaben.

## Betrieb Ihres Nodes {#node}

Produktive Integrationen sollten Einzahlungen gegen ihren **eigenen synchronisierten Node** verifizieren, nicht gegen einen Drittanbieter-Endpunkt. Folgen Sie [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — dort werden das vorgefertigte Binary-Bundle (mit SHA-256-Prüfsummen), die Genesis, öffentliche Peers, die Gebührenuntergrenze (`0.1uqor`) und ein schnelles Bootstrapping über den veröffentlichten Chain-Daten-Snapshot behandelt. Für den Betrieb eines nicht-validierenden Full Nodes ist keine Lizenz erforderlich.

Da QoreChain **sofortige Finalität** besitzt (keine Reorgs), ist **1 Bestätigung final**; das Abwarten von 1–2 Blöcken bietet eine komfortable operative Sicherheitsmarge.

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

Schreiben Sie eine Einzahlung **nur** gut, wenn **alle** der folgenden Bedingungen erfüllt sind:

1. **`tx_response.code == 0`** — die Transaktion war erfolgreich; schreiben Sie niemals eine fehlgeschlagene Tx gut.
2. Die Nachricht ist **`/cosmos.bank.v1beta1.MsgSend`** (oder ein `MsgMultiSend`-Output) — kein Contract-Aufruf und kein anderes Modul.
3. Die **`to_address`** entspricht Ihrer Einzahlungsadresse, und (beim Modell mit gemeinsamer Adresse) das **`memo`** passt zum Nutzer.
4. Das **`denom == "uqor"`** und der `amount` ist der gutzuschreibende Wert (uqor → ÷ 10⁶ für QOR). Lehnen Sie jedes andere denom ab.
5. Die Tx befindet sich in einem **committeten Block** (`height` vorhanden und ≤ der zuletzt committeten Höhe). Die Finalität ist sofortig — 1 Bestätigung ist final; warten Sie zur Sicherheit 1–2 Blöcke.
6. Berechnen Sie den Betrag aus den **Transfer-Events** (`coin_received` / `coin_spent`) neu und gleichen Sie ihn mit dem Betrag in der Nachricht ab — vertrauen Sie niemals einem einzelnen Feld oder allein dem Memo.
7. Verifizieren Sie, dass der Tx-Hash über `GET /cosmos/tx/v1beta1/txs/{hash}` gegen Ihren **eigenen** synchronisierten Node existiert.

### Auszahlungen — hybride PQC-Signierung {#cosmos-withdrawals}

Das Mainnet erzwingt **Post-Quanten-Signaturen** auf Cosmos-Transaktionen (`allow_classical_fallback = false`): Jede Auszahlung benötigt eine **hybride Signatur** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Einzahlungen benötigen dies **nicht** (Sie beobachten die Chain nur).

Die Signierbibliothek ist [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), die `@qorechain/pqc` für die FIPS-204-Primitiven einbindet:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Die Signierung ist ein **zweistufiger** Ablauf (analog zu `qorechaind tx pqc cosign`):

**Schritt 1 — einmalig pro Hot Wallet: den ML-DSA-87-Schlüssel registrieren.** Diese einmalige Registrierungstransaktion wird **klassisch signiert** (Bootstrap-Ausnahme): Nachricht `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` mit `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Leiten Sie den ML-DSA-Schlüssel deterministisch ab, damit er aus Ihrem bestehenden Secret wiederherstellbar ist — z. B. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, dann `mldsa.keygen(seed)` — und speichern Sie den Seed zusammen mit Ihrem Hot-Wallet-Schlüssel.

**Schritt 2 — jede weitere Auszahlung: das `MsgSend` hybrid signieren.** Der Adapter bettet die ML-DSA-87-Signatur *vor* dem normalen secp256k1-`signDirect` in eine Tx-Body-Extension ein, sodass Ihr bestehender Signer unverändert bleibt:

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

Senden Sie die signierten Bytes:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Fragen Sie anschließend `GET /cosmos/tx/v1beta1/txs/{hash}` per Polling ab, bis die Transaktion mit `code == 0` in einem Block erscheint.

Für ein HSM oder einen eigenen Signer in einer anderen Sprache verwenden Sie die eigenständigen [**`qorechain-pqc`**](/developer-guide/post-quantum-signing)-FIPS-204-Bibliotheken (npm, PyPI, crates.io, Maven Central, Go) und bauen dieselbe Extension zusammen. Die ML-DSA-Signatur **muss deterministisch sein** (FIPS-204 §3.4) — siehe [Deterministisches Signieren](/developer-guide/post-quantum-signing#deterministic-signing); die Chain lehnt hedged Signaturen ab.

### Serverseitige Alternative: `@qorechain/chain-bridge` {#chain-bridge}

Für einen vollständig serverseitigen Hot-Wallet-Worker (ohne Browser-Wallet) kapselt **`@qorechain/chain-bridge`** (npm) den gesamten Ablauf — Schlüsselableitung, automatische PQC-Registrierung bei der ersten Nutzung, hybride Signierung und Broadcast — in einem einzigen Aufruf. Das Paket ist reines JavaScript (keine nativen Addons) und eignet sich für Serverless-Worker:

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

`chain-bridge` (≥0.1.1) verwendet dieselbe kanonische adressgebundene PQC-Ableitung wie der Rest des Stacks — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — sodass der Schlüssel mit `qorechaind tx pqc recover-key` aus der Mnemonic wiederherstellbar ist. Konten, die mit älterem Tooling registriert wurden, werden automatisch behandelt (Legacy-Key-Fallback) und können einmalig mit [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) auf den kanonischen Schlüssel migriert werden.

## Pfad B — EVM {#path-b-evm}

Standard-Ethereum-Integration gegen `https://evm.qore.host` (Chain-ID **9801**) oder Port 8545 Ihres eigenen Nodes.

* **Dezimalstellen:** Natives QOR hat auf der EVM-Schiene **18 Dezimalstellen** (1 uqor = 10¹² wei). Ein Fehler hier führt zu falsch gutgeschriebenen Einzahlungen um den Faktor 10¹².
* **Einzahlungen:** Scannen Sie Blöcke mit `eth_getBlockByNumber` nach nativen Transfers an Ihre Adressen; bestätigen Sie mit `eth_getTransactionReceipt` (`status == 0x1`).
* **Auszahlungen:** Standard-Signierung mit secp256k1 / EIP-155 — **kein PQC erforderlich** auf dem EVM-Ante-Pfad. Jeder Ethereum-Signing-Stack funktioniert unverändert.
* **Schutz vor gefälschten Einzahlungen:** Verifizieren Sie den Receipt-Status, dass der bewegte Wert ein **nativer** Transfer ist (kein ERC-20-Event, das Sie nicht indexieren), und bestätigen Sie gegen Ihren eigenen Node.
* **Adress-Mapping:** Die `0x`-Adresse und die `qor1`-Adresse sind zwei Kodierungen desselben Kontos — die Gelder werden geteilt. Siehe [EVM-Entwicklung](/developer-guide/evm-development).

## Pfad C — SVM (Solana-kompatibel) {#path-c-svm}

Seit v3.1.82 bedient die SVM-Schnittstelle **natives QOR** (siehe [Natives QOR auf der SVM-Schnittstelle](/developer-guide/svm-development#native-qor)):

* **Guthaben:** `getBalance` liefert lamports (÷ 10⁹ für QOR; 1 uqor = 1.000 lamports).
* **Einzahlungen:** `getSignaturesForAddress` liefert die Transaktionshistorie einer Adresse; System-Program-Transfers bewegen natives QOR.
* Die öffentlichen Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **schreibgeschützt**; reichen Sie Transaktionen über Ihren eigenen Node ein.

## Ablauf-Zusammenfassung {#flow-summary}

| Vorgang | Pfad | Signierung nötig? |
|---|---|---|
| **Einzahlung** (Nutzer → Plattform) | Beobachten Sie Ihren synchronisierten Node auf Transfers an Ihre Adresse (+ Memo bei Cosmos) | Nein — nur Überwachung |
| **Auszahlung** (Plattform → Nutzer) | Transfer erstellen, offline signieren, broadcasten | Cosmos: hybrides PQC · EVM: Standard secp256k1 |
| **Guthaben / Sweep** | REST-/EVM-/SVM-Guthabenabfrage + Transfer | Signieren nur für den Sweep |

## Verwandte Themen

* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — Node-Einrichtung, Downloads, Snapshot
* [Betrieb eines Nodes](/developer-guide/running-a-node) — Deployment, Pruning, Indexierung
* [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) — die FIPS-204-Bibliotheken hinter hybriden Auszahlungen
* [Netzwerke](/appendix/networks) — Chain-IDs, Endpunkte, Dezimalstellen pro Schnittstelle
