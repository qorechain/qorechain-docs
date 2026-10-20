---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Das `x/rdk`-Modul stellt ein umfassendes Rollup Development Kit (RDK) bereit, mit dem Entwickler anwendungsspezifische Rollups auf QoreChain bereitstellen können. Es unterstützt vier Settlement-Paradigmen, mehrere Sequencer-Modi, austauschbare Datenverfügbarkeits-Backends und KI-gestützte Konfigurationsoptimierung.

:::caution Frühphasige Funktion
Das Modul ist auf Mainnet (Chain-Version **v3.2.3**) und Testnet (**v3.2.4**) bereitgestellt, aber **auf keinem der beiden Netzwerke wurde bisher ein Rollup erstellt** (geprüft am 20. Oktober 2026: `GET /qorechain/rdk/v1/rollups` liefert auf beiden eine leere Liste). Mehrere der unten beschriebenen Funktionen sind heute nicht Ende-zu-Ende nutzbar; der jeweilige Status ist dort angegeben, wo die Funktion beschrieben wird. Die Anleitung für Entwickler finden Sie unter [Rollups Overview](/rollups/overview).
:::

---

## Settlement-Paradigmen

QoreChain RDK unterstützt vier unterschiedliche Settlement-Modi — **optimistic**, **zk**, **based** und **sovereign** — jeweils mit unterschiedlichen Vertrauensannahmen, Finalitätseigenschaften und Beweisanforderungen.

### Optimistic Settlement {#optimistic-settlement}

Optimistic Rollups gehen standardmäßig davon aus, dass Transaktionen gültig sind, und verlassen sich für die Streitbeilegung auf Betrugsbeweise (Fraud Proofs).

* **Beweissystem**: Interaktive Betrugsbeweise
* **Challenge-Fenster**: 604.800 Sekunden (Standard, 7 Tage). **Mainnet (v3.2.3):** Die Chain rechnet dies mit festen 6 Sekunden pro Block in Blöcke um, **100.800 Blöcke**, sodass die tatsächlich verstreichende Zeit von der realen Blockzeit abhängt (etwa 3,7 Tage bei den aktuellen ≈3,2-s-Blöcken des Mainnets); planen Sie daher in Blöcken, nicht in Tagen. **Nur Testnet (v3.2.4, angewendet auf Höhe 8.337.253):** Für einen Batch, der ab dieser Höhe eingereicht wird, wird das Fenster in Sekunden der Blockzeit gemessen (volle 7 Tage). Ein früher eingereichter Batch behält die Regel nach Blockanzahl. Im Mainnet würde diese Änderung erst mit v3.2.4 wirksam (der Governance-Vorschlag 13 würde sie bei Höhe 3,742,566 anwenden).
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
| **Stopped** | Dauerhaft außer Betrieb genommen — was vom Escrow des Erstellers übrig ist, wird zurückgegeben (siehe [Escrow-Ledger](#escrow-ledger))  |

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
| **Optimistic**  | 100.800 Blöcke nach der Übermittlung (Standardfenster) ohne Anfechtung; im Testnet bei Batches, die seit v3.2.4 eingereicht wurden, 604.800 Sekunden Blockzeit |
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

Die Registrierung ist **nicht fatal**: Schlägt sie fehl (unzureichendes Guthaben oder Limit erreicht), wird das Rollup dennoch erstellt, hat aber keine Schicht und kann nicht verankert werden. Ein Settlement-Anchor setzt nicht voraus, dass die Schicht `active` ist: Die Schicht, die ein RDK-Rollup registriert, bleibt `proposed` und kann von ihrem Ersteller trotzdem verankert werden (siehe [Übermittlung von Anchors](/architecture/multilayer-architecture#anchor-submission)).

### State-Anchoring {#state-anchoring}

Ein Settlement-Batch kann in `x/multilayer` verankert werden, das Layer-ID, Schichthöhe (den Batch-Index), State-Root, Hash des Validator-Sets und Transaktionsanzahl unter einer Post-Quantum-Signatur des Rollup-Erstellers erfasst.

* **Seit v3.2.2 (live auf Mainnet und Testnet):** `MsgSubmitBatch` hat zwei optionale Felder. `anchor_signature` ist die ML-DSA-87-Signatur des Erstellers über die **v2-Anchor-Sign-Bytes** des Batches (siehe [Lesen von Anchors](/architecture/multilayer-architecture#reading-anchors)); ist sie vorhanden, wird der Batch in **derselben Transaktion** in `x/multilayer` verankert, und ein abgelehnter Anchor lehnt den Batch ab. `validator_set_hash` ist das Commitment des Validator-Sets des Rollups, das im Anchor mitgeführt und von der Signatur abgedeckt wird. In der CLI: `qorechaind query rdk anchor-sign-bytes <rollup-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` gibt die zu signierenden Bytes aus, und `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` übermittelt sie.
* **Ohne die Signatur** wird der Batch unverankert abgewickelt, genau wie zuvor. Ein Client, der das Feld nicht sendet, erzeugt unverankerte Batches; prüfen Sie daher, ob das von Ihnen verwendete Toolkit es unterstützt. In keinem der beiden Netzwerke existiert bisher ein Rollup, eine Schicht oder ein Anchor, daher wurde noch kein Anchor geschrieben.

Siehe [Settlement Receipts](/rollups/settlement-receipts), was ein Anchor beweist und was nicht.

---

## Escrow-Ledger und Auszahlungen {#escrow-ledger}

Das Escrow aller Rollups liegt in einem gemeinsamen Modulguthaben. Seit **v3.2.3** (Mainnet-Höhe 3.662.051, 20. Oktober 2026) ist ein **Escrow-Ledger** pro Rollup die einzige Buchführung darüber, was jedes Rollup in diesem Pool hält:

* `create-rollup` schreibt dem Ledger das Escrow gut, das das Rollup tatsächlich behält: den Stake abzüglich des 1-%-Erstellungs-Burns.
* Eine Auszahlung (`tx rdk execute-withdrawal`) und eine Betrugsbeweis-Belohnung werden aus dem Ledger gezahlt und davon abgebucht. Eine Auszahlung, die größer ist als das, was das Rollup noch hält, wird mit einem Insufficient-Escrow-Fehler abgelehnt.
* `stop-rollup` erstattet nur, was im Ledger übrig ist, und setzt es auf null. Ein gestopptes Rollup zahlt keine weiteren Auszahlungen.
* Die schreibgeschützte `RollupView`, die von den Rollup-Queries zurückgegeben wird, trägt `escrow_balance`: das für dieses Rollup noch gehaltene uqor.

Vor v3.2.3 wurde dem Ledger null gutgeschrieben, sodass jede Auszahlung geschlossen fehlschlug (fail closed); `execute-withdrawal` kann im Mainnet daher erst ab v3.2.3 erfolgreich sein. Die Prüfungen, die ein Client vor dem Bezahlen einer Gebühr ausführen sollte: Der Denom muss genau `uqor` sein, der Betrag muss positiv sein, der Merkle-Proof hat höchstens 64 Ebenen, wobei jedes Geschwister genau 32 Bytes umfasst, und Einreicher und Empfänger müssen gültige `qor1…`-Adressen sein. Eine Auszahlung braucht außerdem einen finalisierten Batch, der eine `withdrawals_root` committet hat, und jedes Auszahlungs-Blatt kann nur einmal bezahlt werden.

## RDK-State lesen {#reading-state}

Die RDK-Queries werden im Mainnet und im Testnet per REST unter `/qorechain/rdk/v1/` bereitgestellt:

| Route | Liefert |
| --- | --- |
| `/params` | Modulparameter (die Tabelle oben) |
| `/rollups` und `/rollup/{rollup_id}` | Rollup-Datensätze, einschließlich `escrow_balance` |
| `/batches/{rollup_id}` | Batches, seitenweise (`start_index`, `limit` Standard 50, höchstens 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` und `/latest_batch/{rollup_id}` | Ein Batch oder der neueste |
| `/blob/{rollup_id}/{blob_index}` | Blob-Metadaten, einschließlich `expires_at_height` (die Blob-Bytes werden nicht zurückgegeben) |

`qorechaind query rdk config` gibt die Modulparameter aus (die Route ist `/params`; eine Route `/config` gibt es nicht). Rollup- und Schicht-IDs müssen der ID-Grammatik unter [Schicht- und Rollup-IDs](/architecture/multilayer-architecture#id-grammar) entsprechen, durchgesetzt seit v3.2.2.

---

## Burn-Integration

Bei der Rollup-Erstellung werden **1 % des Stake-Betrags** über das `x/burn`-Modul über den `rollup_create`-Burn-Kanal verbrannt. Beispiel: Das Erstellen eines Rollups mit dem Mindest-Stake von 10.000 QOR verbrennt 100 QOR dauerhaft. Die verbleibenden 9.900 QOR werden im Escrow gehalten, und wenn das Rollup gestoppt wird, wird das, was davon übrig ist, an den Ersteller zurückgegeben (Auszahlungen und Betrugsbeweis-Belohnungen, die aus dem Escrow gezahlt werden, verringern die Erstattung). Der Erstellungs-Burn wird seit Chain-Version v3.2.0 erzwungen; frühere Releases wendeten ihn nicht an.
