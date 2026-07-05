---
slug: /rollups/deploying-a-rollup
title: Ein Rollup bereitstellen
sidebar_label: Ein Rollup bereitstellen
sidebar_position: 3
---

# Ein Rollup bereitstellen

Sie können ein anwendungsspezifisches Rollup auf drei Arten bereitstellen: über das **Dashboard** (ein geführter No-Code-Assistent), über die Chain-**CLI** (`qorechaind`, volle Kontrolle über die On-Chain-Transaktion) oder programmatisch mit dem **TypeScript-RDK** (`@qorechain/rdk` plus dem Scaffolder `create-qorechain-rollup`). Diese Seite behandelt alle drei Wege sowie den Operator-Lebenszyklus und die Batch-Befehle.

:::note
Die folgenden Befehle richten sich an das **`qorechain-diana`**-Testnet. Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit Chain-Version **v3.1.85** — ersetzen Sie beim Bereitstellen auf dem Mainnet die Chain-ID und die Endpunkte entsprechend. Validieren Sie jede Bereitstellung zuerst im Testnet.
:::

---

## Voraussetzungen

| Voraussetzung | Details |
| ----------- | ------- |
| **Mindest-Stake** | Beim Erstellen des Rollups wird ein Stake-Bond in QOR hinterlegt (Escrow) |
| **Erstellungs-Burn** | Ein Bruchteil des gestakten Betrags wird bei der Erstellung dauerhaft verbrannt; der Rest bleibt im Escrow und wird zurückgegeben, wenn das Rollup gestoppt wird |
| **Konto** | Ein finanziertes QoreChain-Konto mit ausreichendem Guthaben für den Stake plus Transaktionsgebühren |

Fragen Sie vor der Bereitstellung die aktuellen Modulparameter für den derzeitigen Mindest-Stake und die Burn-Rate ab:

```bash
qorechaind query rdk config
```

---

## Bereitstellung über das Dashboard (Tools → Rollups)

Das Dashboard bietet unter **Tools → Rollups** einen geführten Assistenten **Deploy a Rollup**. Er ist der schnellste Weg, ein app-spezifisches Rollup zu starten, ohne eine Transaktion von Hand zusammenzubauen.

### Schritte

1. **Anmelden.** Der Assistent erfordert eine authentifizierte Sitzung, um bereitzustellen und Ihre bestehenden Bereitstellungen aufzulisten.
2. **Rollup benennen.** Geben Sie einen Rollup-Namen ein (2–41 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestriche oder Unterstriche).
3. **Virtuelle Maschine wählen.** QoreChain ist eine Triple-VM-Chain, Ihr Rollup kann daher auf einer der folgenden laufen:
   * **EVM** — Solidity-/Vyper-Verträge mit vollem Ethereum-Tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust-Smart-Contracts auf der Cosmos SDK-Laufzeit, mit nativem IBC
   * **SVM** — die Solana Virtual Machine, für parallel ausführende Apps mit hohem Durchsatz
4. **Data-Availability-Layer wählen.** Wo Ihr Rollup Transaktionsdaten veröffentlicht, damit jeder den Zustand rekonstruieren kann: **QoreChain DA**, **Celestia** oder **EigenDA**. Beachten Sie, dass EigenDA eine Option auf Dashboard-Ebene ist, während die On-Chain-DA-Backends von `x/rdk` native, Celestia oder beides sind — siehe [Data Availability](/rollups/data-availability).
5. **Gas-Token festlegen.** Das Token, mit dem die Ausführung auf Ihrem Rollup bezahlt wird. Standard ist **QOR**; geben Sie ein eigenes Symbol ein, um Ihr eigenes natives Token zu verwenden.
6. **Sequencer wählen.** Wer Transaktionen vor dem Settlement ordnet: **Shared sequencer** (das gemeinsame QoreChain-Set), **Dedicated (single)** (Sie betreiben einen eigenen einzelnen Sequencer) oder **Decentralized** (ein permissionless Sequencer-Set).
7. **Settlement-Ziel wählen.** Wo das Rollup seine State-Roots und Validitätsbeweise verankert: **QoreChain-Mainnet** oder **Ethereum**.
8. **Bereitstellen.** Senden Sie den Assistenten ab. Die Bereitstellung wird von **The Qore Trust** geprüft, bevor das Rollup live geht — ein frisch eingereichtes Rollup erscheint daher mit dem Status **provisioning**, bis die Prüfung abgeschlossen ist.

Ihre eingereichten Rollups erscheinen in der Liste **Your rollups** mit ihrer VM, dem DA-Layer, dem Gas-Token, dem Sequencer, dem Settlement-Ziel und dem aktuellen Status.

:::note
Der Dashboard-Assistent präsentiert benutzerfreundliche Auswahlmöglichkeiten auf Produktebene und leitet die Bereitstellung durch eine geprüfte Pipeline. Die CLI unten arbeitet direkt gegen die On-Chain-Message-Oberfläche des `x/rdk`-Moduls. Beide teilen dieselben zugrunde liegenden Konzepte (VM, DA, Sequencer, Settlement), stellen sie aber auf unterschiedlichen Abstraktionsebenen bereit.
:::

---

## Bereitstellung über die CLI

Die CLI erstellt das Rollup direkt on-chain. `create-rollup` nimmt drei Positionsargumente entgegen — die Rollup-ID, ein Profil und den Stake-Betrag (in `uqor`) — plus ein optionales `--vm`-Flag.

:::tip
Seit Chain-Version **v3.1.74** wendet `create-rollup` **das Preset des gewählten Profils automatisch an** — Settlement-Modus, Sequencer, DA, Gas-Modell und VM werden alle aus dem Preset übernommen. Sie müssen sie nicht mehr von Hand setzen (zuvor kodierte die Message eine Sovereign-Konfiguration fest). Das `--vm`-Flag ist jetzt **standardmäßig leer**, sodass die VM des Profils gilt, sofern Sie sie nicht explizit überschreiben.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel** — Erstellen eines Rollups aus dem `defi`-Preset (Settlement, Sequencer, DA und VM kommen alle aus dem Preset; `defi` löst sich zu zk-Settlement auf der EVM auf):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Standard | Beschreibung |
| ---- | ------- | ----------- |
| `--vm` | *(leer — die VM des Profils wird verwendet)* | Überschreibt den Rollup-VM-Typ: `evm`, `cosmwasm`, `svm` oder `custom`. Nicht setzen, um die VM des Presets anzuwenden. (In den RDK-Clients ist die Wasm-Laufzeit der VM-Typ **`native`** — QoreChain Native — mit `cosmwasm` als beibehaltenem Legacy-Alias; `cosmwasm` ist der On-Wire-Wert, den dieses Chain-Level-Flag entgegennimmt.) |

Das Argument `[profile]` wählt eine Preset-Konfiguration aus, die automatisch angewendet wird — siehe **[Preset-Profile](/rollups/preset-profiles)**. Das `[stake-amount]` ist der Bond in `uqor`.

### Prüfen, was Sie bereitgestellt haben

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Bereitstellung mit dem TypeScript-RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Das Rollup Development Kit wird als zwei öffentliche npm-Pakete ausgeliefert, die dasselbe On-Chain-Modul `x/rdk` ansteuern wie die CLI — über öffentliches RPC/REST/gRPC/JSON-RPC und jeden cosmjs-`OfflineSigner`:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — das TypeScript-SDK: ein Config-Builder mit Preset-Profilen, Transaktions-Helfer für die Rollup- und Settlement-Batch-Lebenszyklen, native DA, typisierte Read-Clients und die v0.4-Neuerungen — quantensichere Settlement-Receipts, der QCAI Rollup Copilot, Cross-VM-Calldata-Helfer und der Watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — ein Scaffolder, der pro Profil ein lauffähiges Starter-Template klont (einschließlich des Templates `multivm-rollup`).

Diese sind auf npm veröffentlicht. Das Repository liefert außerdem eine veröffentlichte Operator-CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), mit den Befehlen `doctor`, `create`, `status`, `watch`, `params`, `suggest`, Lifecycle (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` und `faucet`, plus den v0.4-Befehlen `receipt`, `advise` und `watchtower`.

Highlights seit dem initialen v0.4.0-Release:

* **v0.4.2 — funktioniert out of the box gegen das Live-Netzwerk.** Die Presets `mainnet` und `testnet` liefern jetzt die öffentlichen `qore.host`-Endpunkte mit (REST unter `api.qore.host` / `api-testnet.qore.host`), sodass `createRdkClient({ network })` die Chain ohne manuelle `endpoints` erreicht — überschreiben Sie sie nur, um Ihren eigenen Node anzusteuern. Dasselbe Release benannte den Wasm-Rollup-VM-Bezeichner in **`native`** (QoreChain Native) um; `cosmwasm` bleibt ein akzeptierter Legacy-Alias, und beide werden on-wire auf `cosmwasm` abgebildet — Chain, Explorer und Dashboard sind unverändert.
* **v0.4.3 — Fix der Hybrid-Signatur-Kodierung** für den TypeScript-Signierpfad (siehe die Warnung unten).
* **v0.4.4 — folgt `@qorechain/sdk` `^0.7.0`**, dem SDK-Release für die Authenticator-Lanes der Chain **v3.1.85**, sodass diese Fähigkeiten die TypeScript-Nutzer des RDK direkt über das SDK erreichen. Keine RDK-API-Änderung.

:::caution
**TypeScript-Nutzer müssen RDK ≥ 0.4.3 verwenden.** Frühere Releases kodierten die hybride PQC-Transaktionserweiterung fehlerhaft, sodass die Chain jede hybrid-signierte Transaktion ablehnte. v0.4.3 (über `@qorechain/sdk` ≥ 0.6.1) behebt die Kodierung. Nur der TypeScript-Hybrid-Signierpfad war betroffen — die Python-, Go-, Rust- und Java-Clients signieren rein klassisch und waren nie betroffen.
:::

#### Python-, Go-, Rust- und Java-Clients

Neben dem TypeScript-Paket stellt das RDK vollständige **Python**-, **Go**-, **Rust**- und **Java**-Clients bereit, die die TypeScript-Oberfläche spiegeln: den Config-Builder mit Validierung, die fünf Preset-Profile, Denom-/Ökonomie-/Bech32-Utilities, Binary-Merkle- und Withdrawal-Proof-Helfer, Rollup-Manifeste, REST- und `qor_`-JSON-RPC-Read-Clients, Preflight-/Health-Checks, Konten (Mnemonic → `qor`-Adresse) sowie **Transaktionssignierung + Broadcast** (`SIGN_MODE_DIRECT`). Alle sind gegen gemeinsame sprachübergreifende Golden Vectors verifiziert und in ihren Registries **veröffentlicht**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Aktuell veröffentlichte Versionen: Python `qorechain-rdk` **0.4.4** (PyPI, Import `qorrdk`), Rust `qorechain-rdk` (crates.io — installieren Sie das neueste veröffentlichte Release oder bauen Sie aus dem Repo), Go-Modul `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) und Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Live-Broadcast erfordert einen Node-Endpunkt.

:::note
Das TypeScript-RDK und seine Templates verwenden standardmäßig das **`qorechain-diana`**-Testnet, und seit v0.4.2 erreichen die Presets die öffentlichen Live-Endpunkte out of the box. Pinnen Sie Versionen und validieren Sie im Testnet, bevor Sie auf das Mainnet gehen.
:::

### Ein Projekt mit `create-qorechain-rollup` scaffolden {#scaffold-a-project-with-create-qorechain-rollup}

Jedes Profil hat ein passendes Starter-Template (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffolden Sie eines mit einer der beiden Formen:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Für nicht-interaktive Nutzung / CI übergeben Sie Template und Netzwerk explizit:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Der Scaffolder gibt die dokumentierten Kosten für Stake und Erstellungs-Burn sowie die nächsten Schritte aus, um Ihr Rollup zu erstellen und dessen Status auszulesen.

### Ein Rollup aus Code erstellen

Bauen Sie eine Config aus einem Preset, lesen Sie den aktuellen Stake und die Burn-Rate von der Chain und erstellen Sie das Rollup dann mit einem Signing-Client. Der Config-Builder erzwingt die Kompatibilitätsmatrix Settlement → Proof bei `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Unsicher, welches Profil passt? `rdk.suggestProfile("a lending protocol with predictable fees")` liefert eine QCAI-gestützte Empfehlung (mit dokumentiertem Fallback).

### Lebenszyklus verwalten und Zustand aus Code lesen

Der Signing-Client stellt den vollständigen Lebenszyklus bereit — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` und `executeWithdrawal`. Die Lebenszyklus-Übergänge können durch Übergabe von `currentStatus` abgesichert werden.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Lesen Sie den Zustand mit dem typisierten REST-Client (kein Signer erforderlich):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Lebenszyklus-Verwaltung

Ein Rollup durchläuft die Zustände `pending`, `active`, `paused` und `stopped`. Der Ersteller steuert die Übergänge mit den folgenden Befehlen.

### Pausieren

Hält das Rollup vorübergehend an. Der Zustand bleibt erhalten und das Rollup kann fortgesetzt werden. Eine Begründung (Reason-String) ist erforderlich.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Fortsetzen

Setzt ein zuvor pausiertes Rollup fort.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stoppen

Legt das Rollup dauerhaft still und gibt seinen Stake frei. Das gestakte QOR — abzüglich des einmaligen Erstellungs-Burns — wird an den Ersteller zurückgegeben.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Das Stoppen eines Rollups ist endgültig. Das Rollup kann nach dem Stoppen nicht neu gestartet werden.
:::

---

## Operator-Befehle: Batches und Challenges

Rollup-Operatoren reichen Settlement-Batches ein, und Challenger können optimistische Batches anfechten. Diese Befehle bilden die Grundlage des Settlement-Layers, der in **[Rollups-Überblick](/rollups/overview)** und **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** beschrieben wird.

### Einen Batch einreichen

Reicht einen Settlement-Batch für ein Rollup ein. Nimmt die Rollup-ID, einen Batch-Index und eine hex-kodierte State-Root entgegen.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Einen Batch anfechten

Fechtet einen eingereichten Batch an (für optimistische Rollups). Nimmt die Rollup-ID und den Batch-Index entgegen; übergeben Sie den Fraud-Proof mit `--proof`. Seit Chain-Version **v3.1.74** ist der optimistische Pfad **submit-batch → challenge-batch** live und funktioniert Ende-zu-Ende.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Beschreibung |
| ---- | ----------- |
| `--proof` | Hex-kodierter Fraud-Proof |

### Batches inspizieren

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Abfragen

| Befehl | Zweck |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Details eines bestimmten Rollups |
| `qorechaind query rdk list-rollups` | Alle registrierten Rollups |
| `qorechaind query rdk batch [rollup-id]` | Neuester Settlement-Batch (oder `--index`) |
| `qorechaind query rdk config` | RDK-Modulparameter |
| `qorechaind query rdk suggest-profile [use-case]` | Preset-Empfehlung für einen Anwendungsfall |

---

## Nächste Schritte

* **[Data Availability](/rollups/data-availability)** — native, Celestia- und redundante DA-Backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — Proof-Verifikation und der L2 → L1-Withdrawal-Flow via `execute-withdrawal`.
