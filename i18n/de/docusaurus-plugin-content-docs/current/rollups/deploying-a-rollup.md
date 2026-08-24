---
slug: /rollups/deploying-a-rollup
title: Einen Rollup bereitstellen
sidebar_label: Einen Rollup bereitstellen
sidebar_position: 3
---

# Einen Rollup bereitstellen

Sie können einen anwendungsspezifischen Rollup auf drei Arten bereitstellen: über das **Dashboard** (ein geführter No-Code-Assistent), über die Chain-**CLI** (`qorechaind`, volle Kontrolle über die On-Chain-Transaktion) oder programmgesteuert mit dem **TypeScript-RDK** (`@qorechain/rdk` plus dem `create-qorechain-rollup`-Scaffolder). Diese Seite behandelt alle drei Wege sowie den Betreiber-Lebenszyklus und die Batch-Befehle.

:::note
Die folgenden Befehle richten sich an das **`qorechain-diana`**-Testnet. Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 live mit Chain-Version **v3.1.92** — ersetzen Sie beim Deployment auf dem Mainnet die Chain-ID und die Endpunkte entsprechend. Validieren Sie jedes Deployment zuerst auf dem Testnet.
:::

---

## Voraussetzungen

| Voraussetzung | Details |
| ----------- | ------- |
| **Mindesteinsatz (Stake)** | Beim Erstellen des Rollups wird ein Stake-Bond in QOR hinterlegt |
| **Erstellungs-Burn** | Ein Teil des eingesetzten Betrags wird bei der Erstellung dauerhaft verbrannt; der Rest bleibt hinterlegt und wird beim Stoppen des Rollups zurückerstattet |
| **Konto** | Ein finanziertes QoreChain-Konto mit ausreichendem Guthaben für den Stake plus Transaktionsgebühren |

Fragen Sie die aktuellen Modulparameter für den aktuellen Mindesteinsatz und die Burn-Rate ab, bevor Sie deployen:

```bash
qorechaind query rdk config
```

---

## Deployment über das Dashboard (Tools → Rollups)

Das Dashboard bietet einen geführten **Rollup bereitstellen**-Assistenten unter **Tools → Rollups**. Dies ist der schnellste Weg, um einen App-spezifischen Rollup zu starten, ohne eine Transaktion manuell zusammenzustellen.

### Schritte

1. **Anmelden.** Der Assistent benötigt eine authentifizierte Sitzung, um zu deployen und Ihre bestehenden Deployments aufzulisten.
2. **Rollup benennen.** Geben Sie einen Rollup-Namen ein (2–41 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestriche oder Unterstriche).
3. **Virtuelle Maschine wählen.** QoreChain ist eine Triple-VM-Chain, Ihr Rollup kann also mit einer der folgenden laufen:
   * **EVM** — Solidity-/Vyper-Contracts mit vollständigem Ethereum-Tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust-Smart-Contracts auf der Cosmos-SDK-Laufzeitumgebung, mit nativem IBC
   * **SVM** — die Solana Virtual Machine, für parallel ausführende Anwendungen mit hohem Durchsatz
4. **Data-Availability-Layer wählen.** Wo Ihr Rollup Transaktionsdaten veröffentlicht, damit jeder den Zustand rekonstruieren kann: **QoreChain DA**, **Celestia** oder **EigenDA**. Beachten Sie, dass EigenDA eine Option auf Dashboard-Ebene ist, während die On-Chain-DA-Backends des `x/rdk`-Moduls nativ, Celestia oder beides sind — siehe [Data Availability](/rollups/data-availability).
5. **Gas-Token festlegen.** Das Token, mit dem Ausführung auf Ihrem Rollup bezahlt wird. Standardmäßig **QOR**; geben Sie ein eigenes Symbol ein, um Ihr eigenes natives Token zu verwenden.
6. **Sequencer wählen.** Wer Transaktionen vor der Abwicklung ordnet: **Shared Sequencer** (das gemeinsame QoreChain-Set), **Dedicated (single)** (eigenen Einzel-Sequencer betreiben) oder **Decentralized** (ein permissionless Sequencer-Set).
7. **Settlement-Ziel wählen.** Wo der Rollup seine State-Roots und Validity-Proofs verankert: **QoreChain-Mainnet** oder **Ethereum**.
8. **Bereitstellen.** Den Assistenten abschicken. Die Bereitstellung wird von **The Qore Trust** geprüft, bevor der Rollup live geht, sodass ein frisch eingereichter Rollup zunächst mit dem Status **provisioning** erscheint, bis die Prüfung abgeschlossen ist.

Ihre eingereichten Rollups erscheinen in der Liste **Your rollups** mit ihrer VM, dem DA-Layer, dem Gas-Token, dem Sequencer, dem Settlement-Ziel und dem aktuellen Status.

:::note
Der Dashboard-Assistent präsentiert freundliche Entscheidungen auf Produktebene und leitet die Bereitstellung durch eine geprüfte Pipeline. Die CLI unten arbeitet direkt gegen die On-Chain-Nachrichtenoberfläche des `x/rdk`-Moduls. Beide teilen dieselben zugrunde liegenden Konzepte (VM, DA, Sequencer, Settlement), stellen sie jedoch auf unterschiedlichen Abstraktionsebenen dar.
:::

---

## Deployment über die CLI

Die CLI erstellt den Rollup direkt On-Chain. `create-rollup` nimmt drei Positionsargumente entgegen — die Rollup-ID, ein Profil und den Stake-Betrag (in `uqor`) — sowie ein optionales `--vm`-Flag.

:::tip
Ab Chain-Version **v3.1.74** **wendet `create-rollup` das Preset des gewählten Profils automatisch an** — Settlement-Modus, Sequencer, DA, Gas-Modell und VM stammen alle aus dem Preset. Sie müssen diese nicht mehr manuell setzen (zuvor hatte die Nachricht eine souveräne Konfiguration fest codiert). Das `--vm`-Flag ist jetzt **standardmäßig leer**, sodass die VM des Profils angewendet wird, sofern Sie sie nicht ausdrücklich überschreiben.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel** — einen Rollup aus dem `defi`-Preset erstellen (Settlement, Sequencer, DA und VM stammen alle aus dem Preset; `defi` löst sich zu zk-Settlement auf der EVM auf):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Standard | Beschreibung |
| ---- | ------- | ----------- |
| `--vm` | *(leer — verwendet die VM des Profils)* | Überschreibt den Rollup-VM-Typ: `evm`, `cosmwasm`, `svm` oder `custom`. Nicht setzen, um die VM des Presets zu verwenden. (In den RDK-Clients ist die Wasm-Laufzeitumgebung der **`native`**-VM-Typ — QoreChain Native — wobei `cosmwasm` als Legacy-Alias erhalten bleibt; `cosmwasm` ist der On-Wire-Wert, den dieses Chain-Level-Flag entgegennimmt.) |

Das Argument `[profile]` wählt eine Preset-Konfiguration, die automatisch angewendet wird — siehe **[Preset Profiles](/rollups/preset-profiles)**. Der `[stake-amount]` ist der Bond in `uqor`.

### Überprüfen, was deployt wurde

```bash
# Einen bestimmten Rollup anhand der ID abfragen
qorechaind query rdk rollup my-defi-rollup

# Alle registrierten Rollups auflisten
qorechaind query rdk list-rollups
```

---

## Deployment mit dem TypeScript-RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Das Rollup Development Kit wird als zwei öffentliche npm-Pakete ausgeliefert, die dasselbe On-Chain-Modul `x/rdk` wie die CLI ansteuern, über öffentliche RPC-/REST-/gRPC-/JSON-RPC-Endpunkte und jeden cosmjs-`OfflineSigner`:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — das TypeScript-SDK: ein Config-Builder mit Preset-Profilen, Transaktionshelfer für die Lebenszyklen von Rollup und Settlement-Batch, natives DA, typisierte Lese-Clients sowie die v0.4-Ergänzungen — quantensichere Settlement-Belege, der QCAI Rollup Copilot, Cross-VM-Calldata-Helfer und der Watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — ein Scaffolder, der pro Profil eine lauffähige Starter-Vorlage klont (einschließlich der Vorlage `multivm-rollup`).

Diese sind auf npm veröffentlicht. Das Repo liefert außerdem eine veröffentlichte Betreiber-CLI, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), mit den Befehlen `doctor`, `create`, `status`, `watch`, `params`, `suggest`, Lebenszyklus (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` und `faucet`, sowie den v0.4-Befehlen `receipt`, `advise` und `watchtower`.

Highlights seit dem ersten v0.4.0-Release:

* **v0.4.2 — funktioniert von Anfang an gegen das Live-Netzwerk.** Die Presets `mainnet` und `testnet` liefern jetzt die öffentlichen `qore.host`-Endpunkte (REST unter `api.qore.host` / `api-testnet.qore.host`), sodass `createRdkClient({ network })` die Chain ohne manuelle `endpoints`-Angabe erreicht — überschreiben Sie diese nur, um Ihren eigenen Node anzusprechen. Dasselbe Release benannte den Wasm-Rollup-VM-Identifikator in **`native`** um (QoreChain Native); `cosmwasm` bleibt als Legacy-Alias akzeptiert, und beide werden On-Wire auf `cosmwasm` abgebildet — Chain, Explorer und Dashboard bleiben unverändert.
* **v0.4.3 — Fix für die Hybrid-Signatur-Kodierung** im TypeScript-Signierpfad (siehe die Warnung unten).
* **v0.4.4 — folgt `@qorechain/sdk` `^0.7.0`**, dem SDK-Release für die Authenticator-Lanes der Chain-Version **v3.1.85**, sodass diese Fähigkeiten den TypeScript-Nutzern des RDK direkt über das SDK zur Verfügung stehen. Keine Änderung an der RDK-API.

:::caution
**TypeScript-Nutzer müssen mindestens RDK 0.4.3 verwenden.** Frühere Releases kodierten die Hybrid-PQC-Transaktionserweiterung fehlerhaft, wodurch die Chain jede hybrid-signierte Transaktion ablehnte. v0.4.3 (über `@qorechain/sdk` ≥ 0.6.1) behebt die Kodierung. Nur der TypeScript-Hybrid-Signierpfad war betroffen — die Python-, Go-, Rust- und Java-Clients signieren rein klassisch und waren nie betroffen.
:::

#### Python-, Go-, Rust- und Java-Clients

Neben dem TypeScript-Paket bietet das RDK vollständige **Python-**, **Go-**, **Rust-** und **Java-**Clients, die die TypeScript-Oberfläche spiegeln: den Config-Builder mit Validierung, die fünf Preset-Profile, Denom-/Economics-/Bech32-Hilfsfunktionen, Binary-Merkle- und Withdrawal-Proof-Helfer, Rollup-Manifeste, REST- und `qor_`-JSON-RPC-Lese-Clients, Preflight-/Health-Checks, Konten (Mnemonic → `qor`-Adresse) sowie **Transaktionssignierung + Broadcast** (`SIGN_MODE_DIRECT`). Alle sind gegen gemeinsame sprachübergreifende Golden-Vektoren verifiziert und in ihren jeweiligen Registries **veröffentlicht**:

```bash
# Python — installiert als qorechain-rdk, importiert als qorrdk
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

Aktuell veröffentlichte Versionen: Python `qorechain-rdk` **0.4.4** (PyPI, Import `qorrdk`), Rust `qorechain-rdk` (crates.io — installieren Sie das zuletzt veröffentlichte Release, oder bauen Sie aus dem Repo), Go-Modul `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) und Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Für Live-Broadcast ist ein Node-Endpunkt erforderlich.

:::note
Das TypeScript-RDK und seine Vorlagen verwenden standardmäßig das **`qorechain-diana`**-Testnet, und seit v0.4.2 erreichen die Presets die öffentlichen Live-Endpunkte ohne weitere Konfiguration. Pinnen Sie Versionen und validieren Sie auf dem Testnet, bevor Sie ins Mainnet gehen.
:::

### Ein Projekt mit `create-qorechain-rollup` scaffolden {#scaffold-a-project-with-create-qorechain-rollup}

Jedes Profil hat eine passende Starter-Vorlage (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Erstellen Sie eine mit einer der beiden Formen:

```bash
npm create qorechain-rollup my-rollup
# oder
npx create-qorechain-rollup my-rollup
```

Für nicht-interaktive Nutzung / CI übergeben Sie Vorlage und Netzwerk explizit:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Der Scaffolder gibt die dokumentierten Kosten für Stake und Erstellungs-Burn sowie die nächsten Schritte zum Erstellen Ihres Rollups und zum Abfragen seines Status aus.

### Einen Rollup per Code erstellen

Erstellen Sie eine Konfiguration aus einem Preset, lesen Sie den aktuellen Stake und die Burn-Rate von der Chain und erstellen Sie dann den Rollup mit einem signierenden Client. Der Config-Builder erzwingt die Kompatibilitätsmatrix zwischen Settlement und Proof bei `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// Ein Config-Builder, vorbefüllt mit den Standardwerten des defi-Presets; überschreiben via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// Die öffentlichen qore.host-Endpunkte sind in die Presets eingebacken (RDK ≥ 0.4.2) —
// keine manuelle `endpoints`-Konfiguration nötig; überschreiben, um Ihren eigenen Node anzusprechen.
const rdk = createRdkClient({ network: "testnet" });

// Die aktuellen Modulparameter abfragen — Stake oder Burn-Rate niemals hardcoden.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Einen signierenden Client mit einem beliebigen cosmjs OfflineSigner verbinden.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // die Chain erzwingt eine Gebührenuntergrenze von 0,1uqor/Gas
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Nicht sicher, welches Profil passt? `rdk.suggestProfile("a lending protocol with predictable fees")` liefert eine QCAI-gestützte Empfehlung (mit einem dokumentierten Fallback).

### Lebenszyklus verwalten und Zustand per Code lesen

Der signierende Client stellt den vollständigen Lebenszyklus bereit — `pauseRollup`, `resumeRollup`, `stopRollup`, sowie `submitBatch`, `challengeBatch`, `resolveChallenge` und `executeWithdrawal`. Die Lebenszyklus-Übergänge können durch Übergabe von `currentStatus` abgesichert werden.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Zustand mit dem typisierten REST-Client lesen (kein Signer erforderlich):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Lebenszyklusverwaltung

Ein Rollup durchläuft die Zustände `pending`, `active`, `paused` und `stopped`. Der Ersteller steuert die Übergänge mit den folgenden Befehlen.

### Pausieren

Den Rollup vorübergehend anhalten. Der Zustand bleibt erhalten und der Rollup kann wieder aufgenommen werden. Ein Grund-String ist erforderlich.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Fortsetzen

Einen zuvor pausierten Rollup fortsetzen.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stoppen

Den Rollup dauerhaft stilllegen und seinen Stake freigeben. Das eingesetzte QOR — abzüglich des einmaligen Erstellungs-Burns — wird an den Ersteller zurückerstattet.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Das Stoppen eines Rollups ist endgültig. Der Rollup kann nach dem Stoppen nicht neu gestartet werden.
:::

---

## Betreiberbefehle: Batches und Challenges

Rollup-Betreiber reichen Settlement-Batches ein, und Challenger können optimistische Batches anfechten. Diese Befehle bilden die Grundlage der Settlement-Schicht, die in **[Rollups Overview](/rollups/overview)** und **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** beschrieben wird.

### Einen Batch einreichen

Einen Settlement-Batch für einen Rollup einreichen. Nimmt die Rollup-ID, einen Batch-Index und einen hex-kodierten State-Root entgegen.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Einen Batch anfechten

Einen eingereichten Batch anfechten (für optimistische Rollups). Nimmt die Rollup-ID und den Batch-Index entgegen; übergeben Sie den Fraud-Proof mit `--proof`. Ab Chain-Version **v3.1.74** ist der optimistische Pfad **submit-batch → challenge-batch** live und funktioniert durchgängig.

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
# Neuester Batch für einen Rollup
qorechaind query rdk batch [rollup-id]

# Ein bestimmter Batch anhand des Index
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
| `qorechaind query rdk suggest-profile [use-case]` | Ein Preset für einen Anwendungsfall empfehlen |

---

## Nächste Schritte

* **[Data Availability](/rollups/data-availability)** — native, Celestia- und redundante DA-Backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — Proof-Verifizierung und der L2 → L1 Withdrawal-Flow via `execute-withdrawal`.
