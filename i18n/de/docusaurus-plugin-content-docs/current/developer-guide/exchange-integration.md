---
slug: /developer-guide/exchange-integration
title: Leitfaden für Börsen & Integratoren
sidebar_label: Börsen-Integration
sidebar_position: 11
---

# Leitfaden für Börsen & Integratoren

Alles, was eine Börse, ein Verwahrer oder ein Zahlungsintegrator benötigt, um QOR zu listen und Ein- und Auszahlungen zu verarbeiten: die Wahl einer Schnittstelle, das sichere Erkennen von Einzahlungen und das Signieren von Auszahlungen.

:::note
Dieser Leitfaden richtet sich an das **`qorechain-vladi`**-Mainnet (Chain-Version **v3.1.82**). Proben Sie den vollständigen Ablauf zuerst auf dem **`qorechain-diana`**-Testnet — die Endpunkte für beide Netzwerke finden Sie unter [Netzwerke](/appendix/networks#public-endpoints).
:::

## Wahl des Integrationspfads {#choosing-a-path}

QoreChain ist eine einzelne Chain mit **einem einheitlichen nativen QOR-Guthaben**, das über drei Schnittstellen bereitgestellt wird. Der **gleiche private Schlüssel kontrolliert dieselben Mittel** unter einer Cosmos- (`qor1...`), einer EVM- (`0x...`) und einer SVM-Adresse (base58) — wählen Sie die Schnittstelle, die am besten zu Ihrem Stack passt.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (gleicher Schlüssel) |
| Dezimalstellen (natives QOR) | **6** (`uqor`) | **18** (Wei-Stil) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard-Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Auszahlungs-Signierung | **Hybrides PQC erforderlich** (ML-DSA-87 + secp256k1) | **Standard secp256k1 / EIP-155 — kein PQC** | über Cosmos-Tx oder Einreichung am eigenen Node |
| Memo-/Tag-Unterstützung | **Ja** (gemeinsame Adresse + Memo) | Nein (eine Adresse pro Nutzer) | Nein (eine Adresse pro Nutzer) |
| Einzahlungserkennung | `MsgSend`-Events scannen | Blöcke via `eth_getBlockByNumber` scannen | `getBalance` / `getSignaturesForAddress` |
| Am besten für | Cosmos-native Plattformen | **Plattformen mit bestehender EVM-Integration** | Plattformen mit Solana-Tooling |

**Empfehlung:** Wenn Sie bereits EVM-Chains unterstützen, ist **Pfad B (EVM)** die Integration mit dem geringsten Aufwand — Standard-Ethereum-Tooling, und **Auszahlungen erfordern keine Post-Quanten-Signierung** (der EVM-Ante-Pfad ist ausgenommen). Pfad A (Cosmos) ist die native Route mit memo-basierten, gemeinsam genutzten Einzahlungsadressen. Pfad C (SVM) ist ebenfalls eine vollwertige native QOR-Schnittstelle — wählen Sie ihn, wenn Sie gezielt Solana-Tooling bevorzugen.

Die drei Schnittstellen schließen sich **nicht gegenseitig aus** — Mittel, die an die `0x`-, `qor1`- oder SVM-Form desselben Schlüssels gesendet werden, sind dasselbe Guthaben.

## Betrieb Ihres Nodes {#node}

Produktionsintegrationen sollten Einzahlungen gegen ihren **eigenen synchronisierten Node** verifizieren, nicht gegen einen Drittanbieter-Endpunkt. Folgen Sie [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — dort werden das vorgefertigte Binary-Bundle (mit SHA-256-Prüfsummen), die Genesis, öffentliche Peers, die Gebührenuntergrenze (`0.1uqor`) und ein schneller Bootstrap über den veröffentlichten Chain-Daten-Snapshot behandelt. Für den Betrieb eines nicht-validierenden Full Nodes ist keine Lizenz erforderlich.

Da QoreChain **sofortige Finalität** hat (keine Reorgs), ist **1 Bestätigung final**; das Abwarten von 1–2 Blöcken bietet eine komfortable operative Sicherheitsmarge.

## Pfad A — Cosmos (nativ) {#path-a-cosmos}

REST-Basis-URL: `https://api.qore.host` (oder `http://localhost:1317` auf Ihrem Node).

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

Schreiben Sie eine Einzahlung **nur** dann gut, wenn **alle** der folgenden Bedingungen erfüllt sind:

1. **`tx_response.code == 0`** — die Transaktion war erfolgreich; schreiben Sie niemals eine fehlgeschlagene Tx gut.
2. Die Nachricht ist **`/cosmos.bank.v1beta1.MsgSend`** (oder ein `MsgMultiSend`-Output) — kein Contract-Aufruf und kein anderes Modul.
3. Die **`to_address`** entspricht Ihrer Einzahlungsadresse, und (beim Modell mit gemeinsamer Adresse) das **`memo`** entspricht dem Nutzer.
4. Der **`denom == "uqor"`** und der `amount` ist der gutzuschreibende Wert (uqor → ÷ 10⁶ für QOR). Weisen Sie jeden anderen Denom zurück.
5. Die Tx befindet sich in einem **committeten Block** (`height` vorhanden und ≤ der letzten committeten Höhe). Die Finalität ist sofort — 1 Bestätigung ist final; warten Sie 1–2 Blöcke als Sicherheitsmarge.
6. Berechnen Sie den Betrag aus den **Transfer-Events** (`coin_received` / `coin_spent`) nach und gleichen Sie ihn mit dem Nachrichtenbetrag ab — vertrauen Sie niemals einem einzelnen Feld oder allein dem Memo.
7. Verifizieren Sie, dass der Tx-Hash über `GET /cosmos/tx/v1beta1/txs/{hash}` gegen Ihren **eigenen** synchronisierten Node existiert.

### Auszahlungen — hybrides PQC-Signieren {#cosmos-withdrawals}

Das Mainnet erzwingt **Post-Quanten-Signaturen** bei Cosmos-Transaktionen (`allow_classical_fallback = false`): Jede Auszahlung benötigt eine **hybride Signatur** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Einzahlungen benötigen dies **nicht** (Sie beobachten nur die Chain).

Die Signierbibliothek ist [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), die `@qorechain/pqc` für die FIPS-204-Primitiven einbindet:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Das Signieren ist ein **zweistufiger** Ablauf (analog zu `qorechaind tx pqc cosign`):

**Schritt 1 — einmalig pro Hot Wallet: den ML-DSA-87-Schlüssel registrieren.** Diese einmalige Registrierungstransaktion wird **klassisch signiert** (Bootstrap-Ausnahme): Nachricht `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` mit `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Leiten Sie den ML-DSA-Schlüssel deterministisch ab, damit er aus Ihrem bestehenden Secret wiederherstellbar ist — z. B. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, dann `mldsa.keygen(seed)` — und speichern Sie den Seed zusammen mit Ihrem Hot-Wallet-Schlüssel.

**Schritt 2 — jede weitere Auszahlung: die `MsgSend` hybrid signieren.** Der Adapter bettet die ML-DSA-87-Signatur *vor* dem normalen secp256k1-`signDirect` in eine Tx-Body-Extension ein, sodass Ihr bestehender Signer unverändert bleibt:

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

Fragen Sie anschließend `GET /cosmos/tx/v1beta1/txs/{hash}` regelmäßig ab, bis die Transaktion mit `code == 0` in einem Block erscheint.

Für ein HSM oder einen eigenen Signer in einer anderen Sprache verwenden Sie die eigenständigen [**`qorechain-pqc`**](/developer-guide/post-quantum-signing)-FIPS-204-Bibliotheken (npm, PyPI, crates.io, Maven Central, Go) und bauen dieselbe Extension zusammen. Die ML-DSA-Signatur **muss deterministisch sein** (FIPS-204 §3.4) — siehe [Deterministisches Signieren](/developer-guide/post-quantum-signing#deterministic-signing); die Chain weist hedged Signaturen zurück.

## Pfad B — EVM {#path-b-evm}

Standard-Ethereum-Integration gegen `https://evm.qore.host` (Chain-ID **9801**) oder Port 8545 Ihres eigenen Nodes.

* **Dezimalstellen:** Natives QOR hat auf der EVM-Schiene **18 Dezimalstellen** (1 uqor = 10¹² wei). Ein Fehler hierbei führt zu falsch gutgeschriebenen Einzahlungen um den Faktor 10¹².
* **Einzahlungen:** Scannen Sie Blöcke mit `eth_getBlockByNumber` nach nativen Transfers an Ihre Adressen; bestätigen Sie mit `eth_getTransactionReceipt` (`status == 0x1`).
* **Auszahlungen:** Standard-Signierung mit secp256k1 / EIP-155 — **kein PQC erforderlich** auf dem EVM-Ante-Pfad. Jeder Ethereum-Signing-Stack funktioniert unverändert.
* **Schutz vor gefälschten Einzahlungen:** Verifizieren Sie den Receipt-Status, dass der bewegte Wert ein **nativer** Transfer ist (kein ERC-20-Event, das Sie nicht indexieren), und bestätigen Sie gegen Ihren eigenen Node.
* **Adress-Mapping:** Die `0x`-Adresse und die `qor1`-Adresse sind zwei Kodierungen desselben Kontos — die Mittel werden geteilt. Siehe [EVM-Entwicklung](/developer-guide/evm-development).

## Pfad C — SVM (Solana-kompatibel) {#path-c-svm}

Seit v3.1.82 bedient die SVM-Schnittstelle **natives QOR** (siehe [Natives QOR auf der SVM-Schnittstelle](/developer-guide/svm-development#native-qor)):

* **Guthaben:** `getBalance` liefert lamports (÷ 10⁹ für QOR; 1 uqor = 1.000 lamports).
* **Einzahlungen:** `getSignaturesForAddress` liefert die Transaktionshistorie einer Adresse; System-Program-Transfers bewegen natives QOR.
* Die öffentlichen Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **schreibgeschützt**; reichen Sie Transaktionen über Ihren eigenen Node ein.

## Zusammenfassung der Abläufe {#flow-summary}

| Vorgang | Pfad | Signierung erforderlich? |
|---|---|---|
| **Einzahlung** (Nutzer → Plattform) | Überwachen Sie Ihren synchronisierten Node auf Transfers an Ihre Adresse (+ Memo bei Cosmos) | Nein — nur Beobachtung |
| **Auszahlung** (Plattform → Nutzer) | Transfer erstellen, offline signieren, senden | Cosmos: hybrides PQC · EVM: Standard secp256k1 |
| **Guthaben / Sweep** | REST- / EVM- / SVM-Guthabenabfrage + Transfer | Signierung nur für den Sweep |

## Verwandte Themen

* [Verbindung zum Mainnet](/getting-started/connecting-to-mainnet) — Node-Einrichtung, Downloads, Snapshot
* [Betrieb eines Nodes](/developer-guide/running-a-node) — Deployment, Pruning, Indexierung
* [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) — die FIPS-204-Bibliotheken hinter hybriden Auszahlungen
* [Netzwerke](/appendix/networks) — Chain-IDs, Endpunkte, Dezimalstellen pro Schnittstelle
