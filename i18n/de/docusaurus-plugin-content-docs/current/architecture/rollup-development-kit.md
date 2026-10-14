---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Das `x/rdk`-Modul stellt ein umfassendes Rollup Development Kit (RDK) bereit, mit dem Entwickler anwendungsspezifische Rollups auf QoreChain bereitstellen können. Es unterstützt vier Settlement-Paradigmen, mehrere Sequencer-Modi, austauschbare Datenverfügbarkeits-Backends und KI-gestützte Konfigurationsoptimierung.

:::caution Frühphasige Funktion
Das Modul ist auf Mainnet (Chain-Version **v3.2.1**) und Testnet bereitgestellt, aber **auf keinem der beiden Netzwerke wurde bisher ein Rollup erstellt**. Mehrere der unten beschriebenen Funktionen sind heute nicht Ende-zu-Ende nutzbar; der jeweilige Status ist dort angegeben, wo die Funktion beschrieben wird. Die Anleitung für Entwickler finden Sie unter [Rollups Overview](/rollups/overview).
:::

---

## Settlement-Paradigmen

QoreChain RDK unterstützt vier unterschiedliche Settlement-Modi — **optimistic**, **zk**, **based** und **sovereign** — jeweils mit unterschiedlichen Vertrauensannahmen, Finalitätseigenschaften und Beweisanforderungen.

### Optimistic Settlement

Optimistic Rollups gehen standardmäßig davon aus, dass Transaktionen gültig sind, und verlassen sich für die Streitbeilegung auf Betrugsbeweise (Fraud Proofs).

* **Beweissystem**: Interaktive Betrugsbeweise
* **Challenge-Fenster**: 604.800 „Sekunden“ (Standard), von der Chain mit festen 6 Sekunden pro Block in Blöcke umgerechnet — **100.800 Blöcke**. Die tatsächlich verstreichende Zeit hängt von der realen Blockzeit ab (etwa 3,7 Tage bei den aktuellen ≈3,2-s-Blöcken des Mainnets), planen Sie daher in Blöcken, nicht in Tagen.
* **Challenge-Bond**: 1.000 QOR (1.000.000.000 uqor) — erforderlich, um eine Betrugsbeweis-Anfechtung einzureichen (Presets `nft` und `custom`; die Presets `defi`, `gaming` und `enterprise` setzen keinen Bond, da sie kein Challenge-Fenster haben)
* **Finalität**: Verzögert, bis das Challenge-Fenster ohne gültige Anfechtung abläuft
* **Auto-Finalisierung**: Der `EndBlocker` finalisiert Batches automatisch, sobald das Challenge-Fenster ohne Streitfall abgelaufen ist. Ein angefochtener Batch wird nie automatisch finalisiert: Der Ersteller des Rollups löst die Anfechtung zuerst auf (siehe [Deploying a Rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Batch-Lebenszyklus**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### ZK (Zero-Knowledge) Settlement {#zk-zero-knowledge-settlement}

ZK Rollups liefern kryptografische Gültigkeitsbeweise, die die Korrektheit des Zustandsübergangs garantieren.

* **Beweissystem**: SNARK (Groth16 über BLS12-381) oder STARK (transparent, kein Trusted Setup)
* **Finalität**: Sofort bei Beweisverifikation — kein Challenge-Fenster erforderlich
* **Maximale Beweisgröße**: 1 MB (1.048.576 Bytes)
* **Rekursionstiefe**: Konfigurierbare Beweisaggregationstiefe (Standard: 1)
* **Reifegrad**: SNARK-Batches werden On-Chain (Groth16 über BLS12-381) gegen einen Verifying Key verifiziert, der beim Rollup gespeichert ist. Ein über `create-rollup` erstelltes Rollup trägt derzeit keinen Verifying Key, sodass ZK-Batches noch nicht Ende-zu-Ende finalisiert werden können. Die STARK-Verifikation ist experimentell: Sie ist Opt-in und prüft eine Demonstrationsschaltung, nicht den Zustandsübergang Ihres eigenen Rollups. Betrachten Sie ZK Settlement als nicht produktionsreif.

**Batch-Lebenszyklus**:

```
Submitted + valid proof → Finalized (instant)
```

### Based Settlement

Based Rollups delegieren die Transaktionssequenzierung an L1-Proposer (QoreChain) und erben dadurch die Liveness- und Zensurresistenz-Garantien der Host-Chain.

* **Beweissystem**: Keines erforderlich — L1-Proposer sind die Quelle der Wahrheit
* **Sequencer**: Muss den `based`-Sequencer-Modus verwenden (durch Validierung erzwungen)
* **Finalität**: 2-Block-Bestätigung auf QoreChain
* **Inclusion-Delay**: Konfigurierbare Anzahl Blöcke vor der erzwungenen Aufnahme von Rollup-Transaktionen
* **Priority-Fee-Sharing**: Konfigurierbarer Prozentsatz der Priority-Fees, die an L1-Proposer gezahlt werden

**Batch-Lebenszyklus**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Sovereign Settlement

Sovereign Rollups arbeiten mit unabhängigem Konsens und sequenzieren ihre Transaktionen selbst. Sie verankern den Zustand zur Überprüfbarkeit auf QoreChain, sind für die Finalität aber nicht von der Host-Chain abhängig.

* **Beweissystem**: Keines
* **Finalität**: Unabhängig — bestimmt durch den eigenen Konsens des Rollups
* **State-Anchoring**: State-Roots werden zur Transparenz und Überprüfbarkeit auf QoreChain veröffentlicht, jedoch nicht erzwungen
* **Auto-Finalisierung**: Keine — Sovereign Rollups verwalten ihre eigene Finalität

---

## Kompatibilität der Beweissysteme

| Settlement-Modus | Fraud Proofs |     SNARK |     STARK |     None |
| --------------- | -----------: | --------: | --------: | -------: |
| **Optimistic**  |   Erforderlich |        -- |        -- |       -- |
| **ZK**          |           -- | Unterstützt | Unterstützt |       -- |
| **Based**       |           -- |        -- |        -- | Erforderlich |
| **Sovereign**   |           -- |        -- |        -- | Erforderlich |

Die STARK-Verifikation ist experimentell und ZK Settlement nicht produktionsreif; siehe den [ZK Settlement](#zk-zero-knowledge-settlement)-Reifegradhinweis oben.

---

## Preset-Profile

Das RDK liefert **fünf Preset-Profile**, die schlüsselfertige Rollup-Konfigurationen für gängige Anwendungsfälle bereitstellen. Jedes Preset bündelt ein Settlement-Paradigma, einen Sequencer-Modus, ein Datenverfügbarkeits-Backend, ein Gas-Modell und eine VM, abgestimmt auf seine Zieldomäne:

| Profil          | Settlement (Beweis)       | Sequencer | DA              | Gas-Modell    | VM      | Ziel-Anwendungsfall |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Trading, Lending und AMM-artige Anwendungen |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Spielzustände und In-Game-Ökonomien mit hohem Durchsatz und niedriger Latenz |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA geplant) | standard | CosmWasm | NFT-Minting, Marktplätze und digitale Sammlerstücke |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Berechtigungsbasierte und Konsortium-Deployments mit gesponserten Gebühren |
| **`custom`**     | vollständig parametrisiert      | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | vollständig parametrisiert | Jedes Feld ist benutzerdefiniert |

Das `custom`-Profil überlässt Ihnen die Einstellung jedes Felds. Die genauen Werte, die in jedem Preset gebündelt sind, können sich mit der Reifung des RDK ändern; fragen Sie die Live-Konfiguration mit `qorechaind query rdk config` (oder `RdkClient.params()` aus `@qorechain/rdk`) ab, um die maßgeblichen Per-Preset-Parameter zu erhalten, und beachten Sie, dass `based` Settlement immer mit dem `based`-Sequencer-Modus gepaart ist.

---

## Sequencer-Modi

Der Sequencer bestimmt, wer Transaktionen innerhalb eines Rollup-Blocks ordnet.

:::note Was heute erzwungen wird
On-Chain darf ein Batch nur von der konfigurierten Sequencer-Adresse des Rollups eingereicht werden oder, wenn keine gesetzt ist (bei jedem Preset), von dessen Ersteller. Die Modi `shared` und `based` werden in der Rollup-Konfiguration festgehalten, aber QoreChain lässt noch kein gemeinsames Sequencer-Roster und keine L1-Proposer als Batch-Einreicher zu; diese Modi beschreiben das beabsichtigte Design.
:::

### Dedicated Sequencer

Ein einzelner Operator sequenziert alle Rollup-Transaktionen.

* **Operator**: Einzelne festgelegte Adresse
* **Latenz**: Niedrigstmöglich — Einzelpartei-Ordnung
* **Vertrauen**: Erfordert Vertrauen in den Sequencer-Operator für Liveness und faire Ordnung

### Shared Sequencer

Eine Gruppe von Sequencern ordnet Transaktionen gemeinsam.

* **Status**: derzeit nur ein Label — das Roster wird On-Chain noch nicht zugelassen (siehe den Hinweis oben)
* **Minimale Set-Größe**: Konfigurierbar (Standard: 1)
* **Latenz**: Etwas höher aufgrund der Koordination mehrerer Parteien
* **Vertrauen**: Verteilt über das Sequencer-Set

### Based Sequencer

QoreChain-L1-Proposer sequenzieren Rollup-Transaktionen.

* **Status**: derzeit nur ein Label — L1-Proposer werden noch nicht als Batch-Einreicher zugelassen (siehe den Hinweis oben)
* **Inclusion-Delay**: Konfigurierbare Anzahl Blöcke vor erzwungener Aufnahme (Standard: 10)
* **Priority-Fee-Share**: Konfigurierbarer Prozentsatz der Priority-Fees, die an L1-Proposer gezahlt werden
* **Vertrauen**: Erbt die Sicherheit und Zensurresistenz des Validator-Sets von QoreChain
* **Anforderung**: Der Based-Settlement-Modus erfordert den Based-Sequencer (bei der Validierung erzwungen)

---

## Datenverfügbarkeits-Backends

### Native DA

On-Chain-KV-Store-Blob-Speicherung innerhalb von QoreChain selbst.

:::caution Noch kein öffentlicher Weg, einen Blob zu veröffentlichen
Das Modul definiert Blob-Speicherung, Aufbewahrung und Pruning, aber es gibt in den aktuellen Releases keine Transaktionsnachricht zum Veröffentlichen eines Blobs. Ein Batch, der bei einem `native`- oder `both`-Rollup einen Daten-Hash nennt, wird abgelehnt, weil kein passender Blob gespeichert werden kann. Siehe [Data Availability](/rollups/data-availability).
:::

| Parameter            | Wert                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Maximale Blob-Größe**    | 2 MB (2.097.152 Bytes)                                                                              |
| **Aufbewahrungszeitraum** | 432.000 Blöcke (etwa 16 Tage bei den aktuellen ≈3,2-s-Blöcken des Mainnets; der Wert verschiebt sich mit der Blockzeit) |
| **Auto-Pruning**     | Abgelaufene Blobs werden im `EndBlocker` entfernt — die Daten werden gelöscht, die Commitment-Metadaten jedoch beibehalten  |
| **Commitment**       | SHAKE-256-Hash (32 Bytes) der Blob-Daten                                                                           |

### Celestia DA

IBC-basierte Datenverfügbarkeit unter Nutzung der dedizierten DA-Schicht von Celestia.

* **Status**: Im aktuellen Release als Stub angelegt — gibt einen Fehler zurück, wenn als alleiniges Backend ausgewählt
* **Namespace-Unterstützung**: Rollup-spezifische Namespaces werden im Blob-Schema unterstützt
* **Geplant**: Vollständige IBC-Integration mit der Blob-Übermittlung und -Verifikation von Celestia

### Both (Redundant)

Speichert Blobs gleichzeitig auf beiden Backends, Native und Celestia.

* Im aktuellen Release wird tatsächlich nur der native Blob gespeichert; für die Celestia-Komponente wird eine Warnung protokolliert.

---

## Rollup-Lebenszyklus

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| Zustand       | Beschreibung                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup registriert, aber noch nicht aktiviert                      |
| **Active**  | Rollup ist live und verarbeitet Batches                        |
| **Paused**  | Vom Ersteller vorübergehend angehalten (kann fortgesetzt werden)                   |
| **Stopped** | Dauerhaft außer Betrieb genommen — Stake-Bond an den Ersteller zurückgegeben  |

Bei der Erstellung wird der Rollup-Status unmittelbar nach erfolgreichem Stake-Escrow und erfolgreichem Erstellungs-Burn auf `Active` gesetzt (die Schichtregistrierung wird versucht, ist aber nicht fatal). Nur der Ersteller kann ein Rollup pausieren, fortsetzen oder stoppen (erzwungen seit Chain-Version v3.2.0).

---

## Batch-Lebenszyklus

Settlement-Batches verfolgen den Zustandsfortschritt der Rollup-State-Roots:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Zustand          | Beschreibung                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Batch an QoreChain übermittelt, wartet auf Finalisierung  |
| **Challenged** | Betrugsbeweis-Anfechtung eingereicht (nur optimistic) |
| **Finalized**  | Batch als kanonisch akzeptiert                       |
| **Rejected**   | Batch durch erfolgreiche Anfechtung für ungültig erklärt         |

### Regeln zur Auto-Finalisierung

| Settlement-Modus | Finalisierungs-Trigger                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100.800 Blöcke nach der Übermittlung (Standardfenster) ohne Anfechtung |
| **ZK**          | Sofort bei Übermittlung eines gültigen Beweises                           |
| **Based**       | 2 L1-Blöcke nach Übermittlung                                |
| **Sovereign**   | Keine — verwaltet durch den eigenen Konsens des Rollups                |

Die Auto-Finalisierung wird im `EndBlocker` für optimistic und based Rollups ausgeführt. ZK-Batches werden inline während der Batch-Übermittlung finalisiert.

---

## Modulparameter

| Parameter                   |                          Standard | Beschreibung                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Maximale Anzahl registrierbarer Rollups |
| `min_stake_for_rollup`      | 10.000.000.000 uqor (10.000 QOR) | Mindest-Stake zum Erstellen eines Rollups        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Anteil des Erstellungs-Stakes, der über `x/burn` verbrannt wird   |
| `default_challenge_window`  | 604.800 (umgerechnet in 100.800 Blöcke) | Standardmäßiges optimistic Challenge-Fenster              |
| `max_da_blob_size`          |           2.097.152 Bytes (2 MB) | Maximale Datenverfügbarkeits-Blob-Größe              |
| `blob_retention_blocks`     |                   432.000 Blöcke | Blöcke, bevor DA-Blobs entfernt werden                  |
| `max_batches_per_block`     |                               10 | Maximale Anzahl pro Block verarbeiteter Settlement-Batches   |

---

## Multilayer-Integration

Das RDK-Modul integriert sich mit `x/multilayer` für das schichtenübergreifende Zustandsmanagement:

### Schichtregistrierung {#layer-registration}

Wenn ein Rollup erstellt wird, registriert das Modul dafür über `RegisterSidechain` eine Schicht, sodass der Schichttyp On-Chain **`sidechain`** ist, sie im Status `proposed` startet, auf das Sidechain-Limit von Multilayer (`max_sidechains`, Standard **10**) angerechnet wird und den `min_sidechain_stake` des Erstellers (1.000 QOR) sperrt. Die Registrierung umfasst:

* Layer-ID (entspricht der Rollup-ID)
* Ziel-Blockzeit und maximale Transaktionen pro Block
* Unterstützte VM-Typen und Domänen
* Settlement-Intervall

Die Registrierung ist **nicht fatal**: Schlägt sie fehl (unzureichendes Guthaben oder Limit erreicht), wird der Rollup dennoch erstellt, hat aber keine Schicht und kann nicht verankert werden.

### State-Anchoring {#state-anchoring}

Ein Settlement-Batch kann in `x/multilayer` verankert werden, das Layer-ID, Schichthöhe (den Batch-Index), State-Root, Hash des Validator-Sets und Transaktionsanzahl unter einer Post-Quanten-Signatur des Rollup-Erstellers erfasst.

* **Heute auf Mainnet:** Batches werden abgewickelt, aber **nicht** verankert — das RDK liefert die vom Anker geforderte Signatur des Erstellers nicht, daher gelingt der Anchoring-Schritt nicht und es wurde noch kein Anker geschrieben. Das Anchoring ist nicht fatal: Es verhindert nie die Batch-Verarbeitung.

Siehe [Settlement Receipts](/rollups/settlement-receipts), was ein Anker beweist und was nicht.

---

## Burn-Integration

Bei der Rollup-Erstellung wird **1 % des Stake-Betrags** über das `x/burn`-Modul über den `rollup_create`-Burn-Kanal verbrannt. Beispiel: Das Erstellen eines Rollups mit dem Mindest-Stake von 10.000 QOR verbrennt 100 QOR dauerhaft. Die verbleibenden 9.900 QOR werden im Escrow gehalten und bei Beendigung des Rollups zurückgegeben. Der Erstellungs-Burn wird seit Chain-Version v3.2.0 erzwungen; frühere Releases wendeten ihn nicht an.
