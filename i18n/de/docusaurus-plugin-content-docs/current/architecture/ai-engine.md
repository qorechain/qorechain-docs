---
slug: /architecture/ai-engine
title: KI-Engine
sidebar_label: KI-Engine
sidebar_position: 4
---

# KI-Engine

QoreChain integriert KI-Funktionen auf mehreren Ebenen des Protokoll-Stacks über das `x/ai`-Modul. Die On-Chain-Schicht bietet deterministische, heuristikbasierte Analysen, die für konsenskritische Operationen geeignet sind, während ein Off-Chain-Sidecar die Funktionen mit Deep-Learning-Modellen für Beratungs- und Entwickler-Tooling erweitert.

## Drei-Schichten-Architektur

Die QCAI-Engine (QoreChain AI) arbeitet über drei Schichten hinweg:

| Schicht               | Geltungsbereich                                            | Ausführung               | Deterministisch |
| --------------------- | --------------------------------------------------------- | ------------------------ | --------------- |
| **Konsensebene**      | Blockproduktion, Parameterabstimmung                      | On-Chain (x/rlconsensus) — derzeit nur Beobachtung | Ja              |
| **Netzwerkebene**     | Transaktions-Routing, Betrugserkennung, Gebührenoptimierung | On-Chain (x/ai)          | Ja              |
| **Anwendungsebene**   | Vertragsgenerierung, Auditing, Tiefenanalyse              | Off-Chain (Sidecar)      | Nein            |

Die Konsensebene wird separat in der [PRISM Consensus Engine](/architecture/prism-consensus-engine) dokumentiert. Diese Seite behandelt die Netzwerk- und Anwendungsebene.

:::note Was in den Live-Netzwerken durchgesetzt wird (geprüft am 23. Oktober 2026, Mainnet und Testnet liefen damals beide mit v3.2.4; das Testnet ist inzwischen auf v3.2.6 und das Mainnet auf v3.2.5 weitergezogen)
Zwei Teile von `x/ai` wirken heute auf Transaktionen, sowohl auf der Cosmos-Lane als auch auf der EVM-Lane:

* Ein **Ratenlimit pro Sender**. Das aktuell gültige Limit beträgt **600 Transaktionen pro Minute und Sender** (`max_tx_per_minute`; die EVM-Lane hat ein eigenes optionales Limit, das nicht gesetzt ist, daher gilt derselbe Wert). Die „Minute" wird über ein festes Fenster von Blöcken gezählt, nicht in Echtzeit, weil die Blockhöhe die einzige Uhr ist, die alle Validatoren teilen. Bei einem Sender am Limit werden weitere Transaktionen abgelehnt, bis ältere das Fenster verlassen. Das Limit wird auf der Cosmos-Lane seit v3.2.0 und auf beiden Lanes seit v3.2.2 durchgesetzt.
* Ein **Anomalie-Score** für jede Transaktion. Die aktuelle `anomaly_action` ist `flag`: Ein hoher Score löst ein `ai_anomaly_check`-Ereignis aus und zählt die Transaktion als markiert, lehnt sie aber nicht ab. Die Ablehnung auf Basis des Scores ist eine Governance-Einstellung, die nicht aktiviert ist.

Alles andere auf dieser Seite (der Router, die sechsschichtige Betrugspipeline, der Gebührenoptimierer, der Netzwerkoptimierer, das Sidecar) beschreibt Analyse und Beratung: Nichts davon ändert, welche Transaktionen die Chain akzeptiert, und die sechsschichtige Pipeline wird nicht aus dem Transaktionspfad aufgerufen. Die aktuellen Einstellungen lesen Sie mit `qorechaind query ai config`, die Zähler mit `qorechaind query ai stats`.
:::

## Transaktions-Router

Der KI-gestützte Router wählt mithilfe gewichteter Multifaktor-Bewertung für jede Transaktion optimale Validatoren und Routen aus.

### Optimierungsformel

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Gewicht    | Symbol | Standard | Beschreibung                                                                            |
| ---------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| Latenz     | alpha  | 0.4      | Normalisierte Antwortzeit (0=bester, 1=schlechtester Wert). 0ms entspricht 0.0, 1000ms entspricht 1.0. |
| Kosten     | beta   | 0.3      | Aktuelle Auslastung in Prozent als Näherungswert für Kosten.                            |
| Sicherheit | gamma  | 0.3      | Kehrwert des Reputationsscores. Höhere Reputation ergibt einen niedrigeren (besseren) Wert. |

Der Router unterhält einen **Metrik-Cache** (Standard-TTL: 30 Sekunden) mit Leistungsdaten je Validator, darunter durchschnittliche Latenz, Verfügbarkeit in Prozent, Auslastung in Prozent und Reputationsscore. Sind zwischengespeicherte Metriken nicht verfügbar, greift das System auf den heuristischen Router zurück.

### Routing-Konfidenz

Die Konfidenz skaliert mit der Anzahl der Validatoren, für die Metriken verfügbar sind:

| Validatoren mit Metriken | Konfidenz |
| ------------------------ | --------- |
| >= 10                    | 0.95      |
| >= 5                     | 0.85      |
| >= 2                     | 0.75      |
| 1                        | 0.60      |

## Betrugserkennung

Der Betrugsdetektor implementiert eine **sechsschichtige Erkennungspipeline**, die jede Transaktion mit statistischen Methoden gegen den jüngsten Verlauf analysiert.

### Erkennungsschichten

| Schicht | Detektor                | Methode                                                                          | Auslöseschwelle                                              |
| ------- | ----------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1       | **Isolation Forest**    | Statistischer Z-Score über die Merkmale Betrag, Gas und Senderhäufigkeit         | Anomalie-Score > 0.7                                         |
| 2       | **Sequence Analyzer**   | Erkennt abwechselnde Sende-/Empfangsmuster (Wash Trading)                        | > 3 abwechselnde Transfers zwischen demselben Paar          |
| 3       | **Sybil Detector**      | Verfolgt neue eindeutige Adressen; markiert Spitzen bei neuen Sendern            | > 30 % der jüngsten Transaktionen von neuen Adressen        |
| 4       | **DDoS Detector**       | Überwacht die Transaktionshäufigkeit je Sender                                   | > 100 Transaktionen pro Minute von einem einzelnen Sender   |
| 5       | **Flash Loan Detector** | Identifiziert Borrow-Manipulate-Repay-Muster innerhalb eines einzelnen Blocks    | >= 3 Transaktionen im selben Block mit > 10-facher Betragsvarianz |
| 6       | **Exploit Detector**    | Markiert ungewöhnlichen Gasverbrauch bei Vertragsaufrufen                        | > 5-faches durchschnittliches Gas für denselben Transaktionstyp |

### Bedrohungsklassifizierung

| Konfidenzbereich | Bedrohungsstufe |
| ---------------- | --------------- |
| >= 0.9           | Kritisch        |
| >= 0.7           | Hoch            |
| >= 0.5           | Mittel          |
| >= 0.3           | Niedrig         |
| &lt; 0.3         | Keine           |

### Reaktionsmaßnahmen

| Bedrohungsstufe | Konfidenz  | Maßnahme                                                       |
| --------------- | ---------- | ------------------------------------------------------------- |
| Kritisch        | > 0.8      | `circuit_break` — Bestimmte Vertragsausführungen pausieren     |
| Kritisch        | &lt;= 0.8  | `rate_limit` — TX-Annahme von der Quelle vorübergehend reduzieren |
| Hoch            | > 0.7      | `rate_limit`                                                  |
| Hoch            | &lt;= 0.7  | `alert` — Ereignis für Validatoren und Betreiber auslösen      |
| Mittel          | Beliebig   | `alert`                                                       |
| Niedrig / Keine | Beliebig   | `allow`                                                       |

Wird eine andere Maßnahme als `allow` ausgelöst, erstellt die Pipeline einen Betrugsuntersuchungsdatensatz mit einer eindeutigen ID (Format: `INV-{block_height}-{txhash}`, auf 48 Zeichen gekürzt). In den Live-Netzwerken wird die Pipeline nicht aus dem Transaktionspfad aufgerufen (siehe den Hinweis am Anfang dieser Seite), daher entstehen heute keine Untersuchungsdatensätze, und es wird dadurch kein Contract-Circuit-Breaker gesetzt.

## Gebührenoptimierer

Der Gebührenoptimierer prognostiziert die Netzwerküberlastung und schlägt mithilfe von Überlastungsverfolgung per exponentiell gleitendem Mittelwert (EMA) optimale Gebühren für gewünschte Bestätigungszeiten vor.

### Überlastungsprognose

* **EMA-Glättungsfaktor (alpha)**: 0.2
* **Verlaufsfenster**: 100 Blöcke
* **Trendanalyse**: Vergleicht die jüngsten 5 Blöcke mit den vorherigen 5 Blöcken, um Überlastungstrends zu erkennen, und projiziert dann mit 50 % Dämpfung in die Zukunft.

### Dringlichkeitsstufen

| Dringlichkeit | Basismultiplikator | Geschätzte Bestätigung |
| ------------- | ------------------ | ---------------------- |
| `fast`        | 2.0x               | 1-2 Blöcke             |
| `normal`      | 1.0x               | 3-5 Blöcke             |
| `slow`        | 0.5x               | 6-10 Blöcke            |

Die endgültige Gebühr berücksichtigt einen **Überlastungsmultiplikator** (1.0x bei 0 % Überlastung, bis zu 5.0x bei 100 % Überlastung) sowie einen **Trendaufschlag**, wenn die prognostizierte Überlastung die aktuelle Überlastung übersteigt. Die Mindestgebühr des Schätzers ist eine veraltete Konstante von 500 uqor; sie wird in den Live-Netzwerken nicht ausgespielt, und die Gebühr, die eine Transaktion tatsächlich zahlen muss, wird durch die Netzwerk-Untergrenze von 0.1 uqor pro Gaseinheit festgelegt (siehe [Erste Transaktion](/getting-started/first-transaction#send-qor)).

## Netzwerkoptimierer

Der Netzwerkoptimierer überwacht kontinuierlich Leistungsmetriken und generiert mithilfe einer Mehrziel-Belohnungsfunktion Empfehlungen für Governance-Parameter.

### Belohnungsfunktion

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Gewicht | Wert  | Ziel                       |
| ------- | ----- | -------------------------- |
| alpha   | 0.35  | Leistungsverbesserung      |
| beta    | 0.30  | Latenzreduktion            |
| gamma   | 0.15  | Energie-/Ressourceneinsparung |
| delta   | 0.20  | Stabilitätserhaltung       |

### Empfehlungstypen

Der Optimierer generiert Empfehlungen für:

* **Block-Gas-Limit**: Erhöhen bei Auslastung > 80 %, verringern bei &lt; 20 %
* **Mindestprovisionssatz**: Senken, wenn die Validatorenanzahl unter 5 liegt
* **Maximale Validatorenanzahl**: Erhöhen, wenn die Blockzeiten gesund sind und >= 10 Validatoren aktiv sind
* **Blockzeit-Zielwert**: Warnen, wenn die durchschnittliche Blockzeit 8 Sekunden überschreitet

Jede Empfehlung umfasst den aktuellen Wert, den vorgeschlagenen Wert, die erwartete Auswirkung, den Konfidenzscore und die Begründung.

## KI-Sidecar

Das QCAI-Sidecar erweitert die On-Chain-KI mit Off-Chain-Deep-Learning-Modellen, die vom QCAI-Backend gestützt werden. Das Sidecar ist optional und nicht konsenskritisch und wird über eine interne gRPC-Schnittstelle erreicht.

### Funktionen

| Funktion                  | Beschreibung                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Vertragsgenerierung**   | Generiert Smart Contracts aus natürlichsprachigen Spezifikationen über 17 Plattformen hinweg |
| **Vertrags-Auditing**     | Tiefgehende Sicherheitsanalyse von Smart-Contract-Code                               |
| **Tiefe Betrugsanalyse**  | Erweiterte Betrugsuntersuchung mit trainierten Modellen (ergänzt On-Chain-Heuristiken) |
| **Netzwerkberatung**      | Fortgeschrittene Empfehlungen zur Parameteroptimierung                               |

### Modelle

| Modellname    | Anwendungsfall                                              |
| ------------- | ---------------------------------------------------------- |
| QCAI Fast     | Antworten mit geringer Latenz für Gebührenschätzung und Routing |
| QCAI Balanced | Tiefere Analyse für Auditing und Betrugsuntersuchung      |

Das Sidecar läuft als unabhängiger Off-Chain-Dienst, sodass Deep-Learning-Workloads die konsenskritische Ausführung niemals blockieren oder beeinflussen.

## EVM-Precompiles

Zwei vorkompilierte Verträge stellen EVM-Smart-Contracts On-Chain-KI-Funktionen bereit:

| Precompile       | Adresse  | Beschreibung                                                                |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Gibt einen Risikoscore (0-100) für eine bestimmte Adresse oder einen Transaktions-Hash zurück |
| `aiAnomalyCheck` | `0x0B02` | Gibt ein boolesches Anomalie-Flag und einen Konfidenzscore für eine Transaktion zurück |

:::warning Noch nicht aktiv
Diese beiden Precompiles sind im Mainnet (`qorechain-vladi`) und im Testnet (`qorechain-diana`) **nicht aktiv** (geprüft am 27. Oktober 2026); ein Aufruf liefert leere Daten. (Drei weitere QoreChain-Precompiles, das PQC-Paar und die PRISM-Parameter, sind nur im Testnet aktiv.) Sie werden erst aktiviert, nachdem sie einen schreibgeschützten Scoring-Pfad mit Festkommaarithmetik erhalten haben. Siehe [EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).
:::

**Wichtig**: EVM-Precompiles verwenden **ausschließlich die deterministische heuristische Engine**. Sie rufen niemals das Sidecar auf und stellen so sicher, dass die gesamte EVM-Ausführung vollständig deterministisch und reproduzierbar bleibt. Seit v3.2.3 analysiert der Anomaly-Check-Precompile eine Transaktion, ohne State zu schreiben; die übrige Härtung der Precompiles in dieser Version (die CrossVM-Bridge lehnt `STATICCALL` ab, rechnet ihren verschachtelten Aufruf auf das Gas des aufrufenden Frames an und erreicht nur QoreChain Native-Ziele auf der Allowlist) greift, sobald der CrossVM-Precompile aktiviert wird. Stand 27. Oktober 2026 ist die Liste `active_static_precompiles` im Mainnet leer; im Testnet enthält sie drei Einträge (PQC Verify `0x…0A01`, PQC Key Status `0x…0A02` und PRISM Consensus Params `0x…0C01`), von denen keiner ein KI-Precompile ist.

## TEE-Attestierung

Das KI-Modul definiert Schnittstellen für die Attestierung einer **Trusted Execution Environment**, was eine zukünftige verifizierbare Ausführung von KI-Modellen innerhalb sicherer Hardware-Enklaven ermöglicht.

### Unterstützte Plattformen

| Plattform   | Bezeichner | Beschreibung                                           |
| ----------- | ---------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`      | Software Guard Extensions                              |
| Intel TDX   | `tdx`      | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`  | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`  | Confidential Compute Architecture                      |

### Attestierungsablauf

1. **Modellgewichte laden** — Das Sidecar lädt KI-Modellgewichte in eine TEE-Enklave.
2. **Inferenz innerhalb der Enklave ausführen** — Die Inferenz läuft im geschützten Speicher der Enklave.
3. **Attestierungsbericht erstellen** — Die Enklave erstellt einen Attestierungsbericht, der den Modell-Hash, den Eingabe-Hash und den Ausgabe-Hash bindet.
4. **Attestierung On-Chain verifizieren** — Validatoren verifizieren die Attestierung On-Chain, bevor sie Inferenzergebnisse akzeptieren.

Die TEE-Attestierung befindet sich derzeit im Stadium der Schnittstellenspezifikation. Die Implementierung ist für eine zukünftige Version geplant.

## Föderiertes Lernen

Das KI-Modul definiert Schnittstellen für die Koordination von **On-Chain-föderiertem Lernen**, bei dem Validator-Knoten lokale Modelle trainieren und Gradientenaktualisierungen einreichen, die in ein globales Modell aggregiert werden, ohne dass Rohdaten für das Training geteilt werden.

### Aggregationsmethoden

| Methode    | Beschreibung                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `fedavg`   | Federated Averaging — gewichteter Durchschnitt der Gradienten nach Stichprobenanzahl |
| `fedprox`  | Federated Proximal — fügt einen Proximalterm zur Behandlung heterogener Daten hinzu |
| `scaffold` | SCAFFOLD — verwendet Kontrollvariate zur Korrektur von Client-Drift       |

### Lebenszyklus einer Runde

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Jede Runde wird mit minimaler/maximaler Teilnehmerzahl, Timeout, Lernrate, Gradient-Clipping-Norm und einem optionalen Rauschmultiplikator für Differential Privacy konfiguriert. Alle Gradienteneinreichungen werden mit PQC-Signaturen (Dilithium-5) signiert.

Das föderierte Lernen befindet sich derzeit im Stadium der Schnittstellenspezifikation. Die Implementierung ist für eine zukünftige Version geplant.

## Abfragen

`qorechaind query ai config` und `qorechaind query ai stats` (gRPC) sind die Abfragen des Moduls. Das Modul hat derzeit keine REST-Routen: Die `/ai/v1/...`-Routen für Gebührenschätzung, Betrugsuntersuchungen, Netzwerkempfehlungen und Circuit Breaker werden weder im Mainnet noch im Testnet bereitgestellt.

## Verwandte Themen

* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — die für die Konsensoptimierung vorgesehene KI-Schicht (derzeit nur Beobachtung).
* [Smart Contract Creator](/dashboard/smart-contract-creator) — KI-gestützte Vertragsgenerierung im Dashboard.
* [Contract Auditor](/dashboard/contract-auditor) — KI-gestützte Sicherheitsprüfung von Verträgen.
