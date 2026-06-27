---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Das `x/rdk`-Modul stellt ein umfassendes Rollup Development Kit (RDK) bereit, mit dem Entwickler anwendungsspezifische Rollups auf QoreChain bereitstellen können. Es unterstützt vier Settlement-Paradigmen, mehrere Sequencer-Modi, austauschbare Datenverfügbarkeits-Backends und KI-gestützte Konfigurationsoptimierung.

---

## Settlement-Paradigmen

QoreChain RDK unterstützt vier unterschiedliche Settlement-Modi — **optimistic**, **zk**, **based** und **sovereign** — jeweils mit unterschiedlichen Vertrauensannahmen, Finalitätseigenschaften und Beweisanforderungen.

### Optimistic Settlement

Optimistic Rollups gehen standardmäßig davon aus, dass Transaktionen gültig sind, und verlassen sich für die Streitbeilegung auf Betrugsbeweise (Fraud Proofs).

* **Beweissystem**: Interaktive Betrugsbeweise
* **Challenge-Fenster**: 7 Tage (604.800 Sekunden), pro Rollup konfigurierbar
* **Challenge-Bond**: 1.000 QOR (1.000.000.000 uqor) — erforderlich, um eine Betrugsbeweis-Anfechtung einzureichen
* **Finalität**: Verzögert, bis das Challenge-Fenster ohne gültige Anfechtung abläuft
* **Auto-Finalisierung**: Der `EndBlocker` finalisiert Batches automatisch, sobald das Challenge-Fenster ohne Streitfall abgelaufen ist

**Batch-Lebenszyklus**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### ZK (Zero-Knowledge) Settlement {#zk-zero-knowledge-settlement}

ZK Rollups liefern kryptografische Gültigkeitsbeweise, die die Korrektheit des Zustandsübergangs garantieren.

* **Beweissystem**: SNARK (Groth16, PLONK) oder STARK (transparent, kein Trusted Setup)
* **Finalität**: Sofort bei Beweisverifikation — kein Challenge-Fenster erforderlich
* **Maximale Beweisgröße**: 1 MB (1.048.576 Bytes)
* **Rekursionstiefe**: Konfigurierbare Beweisaggregationstiefe (Standard: 1)
* **Reifegrad**: Im aktuellen Release verwendet ZK Settlement eine Stub-Verifikation, die jeden nicht leeren Beweis akzeptiert. Die vollständige SNARK/STARK-Beweisverifikation ist ein geplantes Upgrade und sollte als noch nicht produktionsreif betrachtet werden.

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

STARK- und vollständige ZK-Beweisverifikation befinden sich noch in der Reifung; siehe den [ZK Settlement](#zk-zero-knowledge-settlement)-Reifegradhinweis oben.

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

### Dedicated Sequencer

Ein einzelner Operator sequenziert alle Rollup-Transaktionen.

* **Operator**: Einzelne festgelegte Adresse
* **Latenz**: Niedrigstmöglich — Einzelpartei-Ordnung
* **Vertrauen**: Erfordert Vertrauen in den Sequencer-Operator für Liveness und faire Ordnung

### Shared Sequencer

Eine Gruppe von Sequencern ordnet Transaktionen gemeinsam.

* **Minimale Set-Größe**: Konfigurierbar (Standard: 1)
* **Latenz**: Etwas höher aufgrund der Koordination mehrerer Parteien
* **Vertrauen**: Verteilt über das Sequencer-Set

### Based Sequencer

QoreChain-L1-Proposer sequenzieren Rollup-Transaktionen.

* **Inclusion-Delay**: Konfigurierbare Anzahl Blöcke vor erzwungener Aufnahme (Standard: 10)
* **Priority-Fee-Share**: Konfigurierbarer Prozentsatz der Priority-Fees, die an L1-Proposer gezahlt werden
* **Vertrauen**: Erbt die Sicherheit und Zensurresistenz des Validator-Sets von QoreChain
* **Anforderung**: Der Based-Settlement-Modus erfordert den Based-Sequencer (bei der Validierung erzwungen)

---

## Datenverfügbarkeits-Backends

### Native DA

On-Chain-KV-Store-Blob-Speicherung innerhalb von QoreChain selbst.

| Parameter            | Wert                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Maximale Blob-Größe**    | 2 MB (2.097.152 Bytes)                                                                              |
| **Aufbewahrungszeitraum** | 432.000 Blöcke (\~30 Tage bei 6-Sekunden-Blöcken)                                                       |
| **Auto-Pruning**     | Abgelaufene Blobs werden im `EndBlocker` entfernt — die Daten werden gelöscht, die Commitment-Metadaten jedoch beibehalten  |
| **Commitment**       | SHA-256-Hash der Blob-Daten                                                                           |

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

Bei der Erstellung wird der Rollup-Status unmittelbar nach erfolgreichem Stake-Escrow und der Schichtregistrierung auf `Active` gesetzt.

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
| **Optimistic**  | Challenge-Fenster läuft ab (\~7 Tage) ohne gültige Anfechtung |
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
| `default_challenge_window`  |         604.800 Sekunden (7 Tage) | Standardmäßiges optimistic Challenge-Fenster              |
| `max_da_blob_size`          |           2.097.152 Bytes (2 MB) | Maximale Datenverfügbarkeits-Blob-Größe              |
| `blob_retention_blocks`     |              432.000 (\~30 Tage) | Blöcke, bevor DA-Blobs entfernt werden                  |
| `max_batches_per_block`     |                               10 | Maximale Anzahl pro Block verarbeiteter Settlement-Batches   |

---

## Multilayer-Integration

Das RDK-Modul integriert sich mit `x/multilayer` für das schichtenübergreifende Zustandsmanagement:

### Schichtregistrierung

Wenn ein Rollup erstellt wird, wird es über `RegisterSidechain` automatisch als Sidechain-Schicht registriert. Die Registrierung umfasst:

* Layer-ID (entspricht der Rollup-ID)
* Ziel-Blockzeit und maximale Transaktionen pro Block
* Unterstützte VM-Typen und Domänen
* Settlement-Intervall

Die Registrierung ist **nicht fatal**: Schlägt die Registrierung bei `x/multilayer` fehl, wird der Rollup dennoch erstellt und eine Warnung protokolliert.

### State-Anchoring

Jeder an das RDK übermittelte Settlement-Batch wird über `AnchorState` in `x/multilayer` verankert. Dabei werden erfasst:

* Layer-ID und Schichthöhe (Batch-Index)
* State-Root
* Transaktionsanzahl

Das Anchoring ist **nicht fatal**: Fehler werden protokolliert, verhindern aber nicht die Batch-Verarbeitung.

---

## Burn-Integration

Bei der Rollup-Erstellung wird **1 % des Stake-Betrags** über das `x/burn`-Modul über den `rollup_create`-Burn-Kanal verbrannt. Beispiel: Das Erstellen eines Rollups mit dem Mindest-Stake von 10.000 QOR verbrennt 100 QOR dauerhaft. Die verbleibenden 9.900 QOR werden im Escrow gehalten und bei Beendigung des Rollups zurückgegeben.
