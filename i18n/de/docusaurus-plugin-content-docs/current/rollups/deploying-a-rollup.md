---
slug: /rollups/deploying-a-rollup
title: Ein Rollup bereitstellen
sidebar_label: Ein Rollup bereitstellen
sidebar_position: 3
---

# Ein Rollup bereitstellen

Sie können ein anwendungsspezifisches Rollup auf drei Arten bereitstellen: über das **Dashboard** (ein geführter No-Code-Assistent), über die Chain-**CLI** (`qorechaind`, volle Kontrolle über die On-Chain-Transaktion) oder programmatisch mit dem **TypeScript-RDK** (`@qorechain/rdk` plus dem `create-qorechain-rollup`-Scaffolder). Diese Seite behandelt alle drei Wege sowie den Betreiber-Lebenszyklus und die Batch-Befehle.

:::note
Die folgenden Befehle zielen auf das **`qorechain-diana`**-Testnet ab. Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit der Chain-Version **v3.1.82** — ersetzen Sie die Mainnet-Chain-ID und -Endpunkte, wenn Sie auf dem Mainnet bereitstellen. Validieren Sie jede Bereitstellung zuerst auf dem Testnet.
:::

---

## Anforderungen

| Anforderung | Details |
| ----------- | ------- |
| **Mindest-Stake** | Beim Erstellen des Rollups wird ein Stake-Bond in QOR hinterlegt |
| **Erstellungs-Burn** | Ein Bruchteil des gestakten Betrags wird bei der Erstellung dauerhaft verbrannt; der Rest wird treuhänderisch gehalten und zurückgegeben, wenn das Rollup gestoppt wird |
| **Konto** | Ein finanziertes QoreChain-Konto mit ausreichendem Guthaben für den Stake plus Transaktionsgebühren |

Fragen Sie die Live-Modulparameter für den aktuellen Mindest-Stake und die Burn-Rate ab, bevor Sie bereitstellen:

```bash
qorechaind query rdk config
```

---

## Bereitstellung über das Dashboard (Tools → Rollups)

Das Dashboard bietet unter **Tools → Rollups** einen geführten **Deploy a Rollup**-Assistenten. Es ist der schnellste Weg, um ein anwendungsspezifisches Rollup zu starten, ohne eine Transaktion von Hand zusammenzustellen.

### Schritte

1. **Anmelden.** Der Assistent erfordert eine authentifizierte Sitzung, um bereitzustellen und Ihre bestehenden Bereitstellungen aufzulisten.
2. **Benennen Sie Ihr Rollup.** Geben Sie einen Rollup-Namen ein (2–41 Zeichen: Buchstaben, Zahlen, Leerzeichen, Bindestriche oder Unterstriche).
3. **Wählen Sie eine virtuelle Maschine.** QoreChain ist eine Triple-VM-Chain, sodass Ihr Rollup eine der folgenden ausführen kann:
   * **EVM** — Solidity-/Vyper-Verträge mit vollständigem Ethereum-Tooling (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — Rust-Smart-Contracts auf der Cosmos-SDK-Laufzeitumgebung, mit nativem IBC
   * **SVM** — die Solana Virtual Machine, für Apps mit paralleler Ausführung und hohem Durchsatz
4. **Wählen Sie eine Datenverfügbarkeits-Schicht.** Wo Ihr Rollup Transaktionsdaten veröffentlicht, sodass jeder den Zustand rekonstruieren kann: **QoreChain DA**, **Celestia** oder **EigenDA**. Beachten Sie, dass EigenDA eine Option auf Dashboard-Ebene ist, während die On-Chain-`x/rdk`-DA-Backends native, Celestia oder both sind — siehe [Datenverfügbarkeit](/rollups/data-availability).
5. **Legen Sie ein Gas-Token fest.** Das Token, das zur Bezahlung der Ausführung auf Ihrem Rollup verwendet wird. Standardmäßig **QOR**; geben Sie ein benutzerdefiniertes Symbol ein, um Ihr eigenes natives Token zu verwenden.
6. **Wählen Sie einen Sequencer.** Wer Transaktionen vor dem Settlement ordnet: **Shared sequencer** (das gemeinsame QoreChain-Set), **Dedicated (single)** (betreiben Sie Ihren eigenen einzelnen Sequencer) oder **Decentralized** (ein berechtigungsfreies Sequencer-Set).
7. **Wählen Sie ein Settlement-Ziel.** Wo das Rollup seine State-Roots und Validitätsbeweise verankert: **QoreChain mainnet** oder **Ethereum**.
8. **Bereitstellen.** Senden Sie den Assistenten ab. Die Bereitstellung wird von **The Qore Trust** überprüft, bevor das Rollup live geht, sodass ein frisch eingereichtes Rollup mit dem Status **provisioning** erscheint, bis die Überprüfung abgeschlossen ist.

Ihre eingereichten Rollups erscheinen in der Liste **Your rollups** mit ihrer VM, DA-Schicht, ihrem Gas-Token, Sequencer, Settlement-Ziel und aktuellen Status.

:::note
Der Dashboard-Assistent präsentiert benutzerfreundliche Auswahlmöglichkeiten auf Produktebene und leitet die Bereitstellung durch eine überprüfte Pipeline. Die CLI unten arbeitet direkt gegen die On-Chain-Message-Schnittstelle des `x/rdk`-Moduls. Beide teilen sich dieselben zugrundeliegenden Konzepte (VM, DA, Sequencer, Settlement), legen sie aber auf unterschiedlichen Ebenen offen.
:::

---

## Bereitstellung über die CLI

Die CLI erstellt das Rollup direkt on-chain. `create-rollup` nimmt drei positionsbezogene Argumente entgegen — die Rollup-ID, ein Profil und den Stake-Betrag (in `uqor`) — plus ein optionales `--vm`-Flag.

:::tip
Ab der Chain-Version **v3.1.74** **wendet `create-rollup` das Preset des gewählten Profils automatisch an** — Settlement-Modus, Sequencer, DA, Gas-Modell und VM werden alle aus dem Preset übernommen. Sie müssen sie nicht mehr von Hand setzen (zuvor hat die Message eine sovereign-Konfiguration fest kodiert). Das `--vm`-Flag ist jetzt **standardmäßig leer**, sodass die VM des Profils gilt, sofern Sie sie nicht ausdrücklich überschreiben.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel** — ein Rollup aus dem `defi`-Preset erstellen (Settlement, Sequencer, DA und VM stammen alle aus dem Preset; `defi` löst sich zu zk-Settlement auf der EVM auf):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flags:**

| Flag | Standard | Beschreibung |
| ---- | ------- | ----------- |
| `--vm` | *(leer — verwendet die VM des Profils)* | Überschreiben Sie den Rollup-VM-Typ: `evm`, `cosmwasm`, `svm` oder `custom`. Nicht setzen, um die VM des Presets anzuwenden. |

Das `[profile]`-Argument wählt eine Preset-Konfiguration aus, die automatisch angewendet wird — siehe **[Preset-Profile](/rollups/preset-profiles)**. Der `[stake-amount]` ist der Bond in `uqor`.

### Überprüfen, was Sie bereitgestellt haben

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Bereitstellung mit dem TypeScript-RDK (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Das Rollup Development Kit wird als zwei öffentliche npm-Pakete ausgeliefert, die dasselbe On-Chain-`x/rdk`-Modul wie die CLI ansteuern, über öffentliches RPC/REST/gRPC/JSON-RPC und jeden cosmjs-`OfflineSigner`:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — das TypeScript-SDK: ein Config-Builder mit Preset-Profilen, Transaktions-Helfer für die Rollup- und Settlement-Batch-Lebenszyklen, native DA, typisierte Lese-Clients und die v0.4-Ergänzungen — quantensichere Settlement-Quittungen, der QCAI Rollup Copilot, Cross-VM-Calldata-Helfer und der Watchtower.
* **`create-qorechain-rollup`** (`v0.4.0`) — ein Scaffolder, der pro Profil eine lauffähige Starter-Vorlage klont (einschließlich der `multivm-rollup`-Vorlage).

Diese sind auf npm veröffentlicht. Das Repo liefert auch eine veröffentlichte Betreiber-CLI aus, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), mit den Befehlen `doctor`, `create`, `status`, `watch`, `params`, `suggest`, Lebenszyklus (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` und `faucet` sowie den v0.4-Befehlen `receipt`, `advise` und `watchtower`.

#### Python-, Go-, Rust- und Java-Clients

Neben dem TypeScript-Paket stellt das RDK vollständige **Python**-, **Go**-, **Rust**- und **Java**-Clients bereit, die die TypeScript-Schnittstelle spiegeln: der Config-Builder mit Validierung, die fünf Preset-Profile, Denom-/Economics-/bech32-Hilfsfunktionen, Binary-Merkle- und Withdrawal-Proof-Helfer, Rollup-Manifeste, REST- und `qor_`-JSON-RPC-Lese-Clients, Preflight-/Health-Checks, Konten (Mnemonic → `qor`-Adresse) und **Transaktionssignierung + Broadcast** (`SIGN_MODE_DIRECT`). Alle sind gegen gemeinsame sprachübergreifende Golden Vectors verifiziert und in ihren Registries **veröffentlicht**:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Aktuell veröffentlichte Versionen: Python `qorechain-rdk` **0.4.0** (PyPI, Import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), Go-Modul `github.com/qorechain/qorechain-rdk/packages/go` und Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). Live-Broadcast erfordert einen Node-Endpunkt.

:::note
Das TypeScript-RDK und seine Vorlagen zielen auf das **`qorechain-diana`**-Testnet ab und sind für vollständige End-to-End-Abläufe als **coming soon** markiert. Pinnen Sie Versionen und validieren Sie auf dem Testnet.
:::

### Ein Projekt mit `create-qorechain-rollup` scaffolden {#scaffold-a-project-with-create-qorechain-rollup}

Jedes Profil hat eine passende Starter-Vorlage (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Scaffolden Sie eine mit einer der beiden Formen:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Für die nicht-interaktive / CI-Nutzung übergeben Sie die Vorlage und das Netzwerk explizit:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Der Scaffolder gibt die dokumentierten Stake- und Erstellungs-Burn-Kosten sowie die nächsten Schritte aus, um Ihr Rollup zu erstellen und seinen Status zu lesen.

### Ein Rollup aus Code erstellen

Erstellen Sie eine Config aus einem Preset, lesen Sie den Live-Stake und die Burn-Rate von der Chain und erstellen Sie dann das Rollup mit einem Signing-Client. Der Config-Builder erzwingt bei `validate()` / `build()` die Settlement → Proof-Kompatibilitätsmatrix.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Nicht sicher, welches Profil passt? `rdk.suggestProfile("a lending protocol with predictable fees")` gibt eine QCAI-gestützte Empfehlung zurück (mit einem dokumentierten Fallback).

### Den Lebenszyklus verwalten und Zustand aus Code lesen

Der Signing-Client legt den vollständigen Lebenszyklus offen — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` und `executeWithdrawal`. Die Lebenszyklus-Übergänge können durch Übergeben von `currentStatus` abgesichert werden.

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

Ein Rollup durchläuft die Zustände `pending`, `active`, `paused` und `stopped`. Der Ersteller verwaltet die Übergänge mit den folgenden Befehlen.

### Pause

Halten Sie das Rollup vorübergehend an. Der Zustand bleibt erhalten und das Rollup kann fortgesetzt werden. Eine Grundangabe (reason) ist erforderlich.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Resume

Setzen Sie ein zuvor pausiertes Rollup fort.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stop

Setzen Sie das Rollup dauerhaft außer Betrieb und geben Sie seinen Stake frei. Das gestakte QOR — abzüglich des einmaligen Erstellungs-Burns — wird an den Ersteller zurückgegeben.

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

## Betreiber-Befehle: Batches und Challenges

Rollup-Betreiber reichen Settlement-Batches ein, und Challenger können optimistische Batches anfechten. Diese Befehle untermauern die Settlement-Schicht, die in **[Rollups – Übersicht](/rollups/overview)** und **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** beschrieben wird.

### Einen Batch einreichen

Reichen Sie einen Settlement-Batch für ein Rollup ein. Nimmt die Rollup-ID, einen Batch-Index und eine hex-codierte State-Root entgegen.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Einen Batch anfechten

Fechten Sie einen eingereichten Batch an (für optimistische Rollups). Nimmt die Rollup-ID und den Batch-Index entgegen; übergeben Sie den Fraud-Proof mit `--proof`. Ab der Chain-Version **v3.1.74** ist der optimistische Pfad **submit-batch → challenge-batch** live und funktioniert end-to-end.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Beschreibung |
| ---- | ----------- |
| `--proof` | Hex-codierter Fraud-Proof |

### Batches überprüfen

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
| `qorechaind query rdk suggest-profile [use-case]` | Ein Preset für einen Anwendungsfall empfehlen |

---

## Nächste Schritte

* **[Datenverfügbarkeit](/rollups/data-availability)** — native, Celestia und redundante DA-Backends.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — Proof-Verifizierung und der L2 → L1-Withdrawal-Ablauf über `execute-withdrawal`.
