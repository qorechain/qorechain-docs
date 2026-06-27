---
slug: /architecture/mev-protection-fairblock
title: MEV-Schutz (FairBlock)
sidebar_label: MEV-Schutz (FairBlock)
sidebar_position: 10
---

# MEV-Schutz (FairBlock)

Das Modul `x/fairblock` implementiert die Verteidigung von QoreChain gegen Maximal-Extractable-Value-(MEV-)Angriffe mithilfe von Threshold-Identity-Based-Encryption. In Kombination mit einem 5-Lane-System zur Transaktionspriorisierung entsteht eine umfassende Anti-MEV-Architektur, die Nutzer vor Front-Running, Sandwich-Angriffen und anderen Formen der mempool-basierten Wertabschöpfung schützt.

## Das MEV-Problem

MEV entsteht, wenn Block-Proposer oder Beobachter die **Informationsasymmetrie** im Transaktions-Mempool ausnutzen. Da ausstehende Transaktionen vor der Aufnahme sichtbar sind, können Angreifer:

* **Front-Running**: Eine Transaktion vor einem erkannten profitablen Handel platzieren
* **Sandwich-Angriff**: Transaktionen vor und nach dem Handel eines Opfers platzieren, um Wert aus dem Preis-Slippage abzuschöpfen
* **Back-Running**: Eine Transaktion unmittelbar nach einer erkannten Gelegenheit platzieren

Diese Angriffe schöpfen Wert von gewöhnlichen Nutzern ab und untergraben die Fairness in DeFi, Token-Swaps und beim NFT-Minting.

## FairBlock-tIBE-Framework

QoreChain begegnet MEV durch **Threshold Identity-Based Encryption (tIBE)**, ein kryptografisches Verfahren, bei dem:

1. **Verschlüsselung**: Nutzer verschlüsseln ihre Transaktionen vor der Übertragung. Verschlüsselte Transaktionen sind **undurchsichtig** — Proposer, Validatoren und Mempool-Beobachter können den Inhalt der Transaktionen nicht lesen.
2. **Aufnahme**: Proposer nehmen verschlüsselte Transaktionen in Blöcke auf, ohne deren Inhalt zu kennen. Da die Daten nicht lesbar sind, wird die Informationsasymmetrie beseitigt.
3. **Entschlüsselung**: Nachdem eine Transaktion in einen Block übernommen wurde, steuert eine Schwellenanzahl von Validatoren Entschlüsselungsanteile bei. Sobald die Schwelle erreicht ist, wird die Transaktion entschlüsselt und ausgeführt.

Dieser Ansatz stellt sicher, dass keine einzelne Partei eine Transaktion entschlüsseln kann, bevor sie unwiderruflich übernommen wurde, und eliminiert den MEV-Angriffsvektor an der Wurzel.

### Struktur einer verschlüsselten Transaktion

Jede verschlüsselte Transaktion enthält:

| Feld            | Beschreibung                                      |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | tIBE-verschlüsselte Transaktions-Payload               |
| `sender`         | Absenderadresse der Transaktion (für Routing sichtbar) |
| `target_height`  | Blockhöhe, bei der die Entschlüsselung erfolgen soll    |
| `submitted_at`   | Zeitstempel der Verschlüsselung                          |

### Entschlüsselungsanteile

Validatoren steuern Entschlüsselungsanteile für übernommene Transaktionen bei:

| Feld        | Beschreibung                           |
| ------------ | ------------------------------------- |
| `validator`  | Adresse des beitragenden Validators |
| `tx_id`      | ID der verschlüsselten Transaktion       |
| `share_data` | Der Entschlüsselungsschlüssel-Anteil des Validators  |
| `height`     | Blockhöhe der Anteilsübermittlung  |

## Implementierungsstatus

Im aktuellen Testnet-Release ist das FairBlock-Modul eine **Stub-Implementierung**:

* Der Ante-Handler `FairBlockDecorator` ist in die Transaktionsverarbeitungs-Pipeline eingebunden, **leitet** jedoch alle Transaktionen ohne Änderung **durch**.
* Wenn `enabled` auf `false` gesetzt ist (der Standard), delegiert der Decorator sofort an den nächsten Handler in der Kette.
* Die vollständige tIBE-Aktivierung ist für ein zukünftiges Release geplant und steht noch aus, bis eine Validator-Schlüsselzeremonie die Threshold-Verschlüsselungsparameter festlegt.

### FairBlock-Konfiguration

| Parameter            | Standard      | Beschreibung                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| `enabled`            | `false`      | Hauptschalter für die tIBE-Verschlüsselung                |
| `tibe_threshold`     | 5            | Anzahl der erforderlichen Validator-Entschlüsselungsanteile   |
| `decryption_delay`   | 3 blocks     | Blöcke nach der Aufnahme, bevor die Entschlüsselung beginnt  |
| `max_encrypted_size` | 65,536 bytes | Maximale Größe einer verschlüsselten Transaktions-Payload |

## 5-Lane-Transaktionspriorisierung

QoreChain implementiert eine 5-Lane-Mempool-Architektur, die Transaktionen nach Typ kategorisiert und jeder Lane eine Prioritätsstufe sowie einen Blockraum-Anteil zuweist.

### Lane-Konfiguration

| Lane        |      Priorität | Blockraum | Transaktionstyp                                 |
| ----------- | ------------: | ----------: | ------------------------------------------------ |
| **PQC**     | 100 (höchste) |         15% | Transaktionen mit Post-Quantum-Hybridsignaturen |
| **MEV**     |            90 |         20% | FairBlock-tIBE-verschlüsselte Transaktionen            |
| **AI**      |            80 |         15% | KI-bewertete und gebührenoptimierte Transaktionen         |
| **Default** |            50 |         40% | Standardtransaktionen                            |
| **Free**    |   10 (niedrigste) |         10% | Gas-abstrahierte und gesponserte Transaktionen        |

### Lane-Beschreibungen

**PQC-Lane** (Priorität 100, 15% Blockraum)\
Transaktionen, die mit hybriden Post-Quantum-Kryptografiesignaturen signiert sind, erhalten die höchste Priorität. Dies fördert die Einführung quantensicherer Transaktionssignierung und stellt sicher, dass PQC-geschützte Operationen bei Überlastung niemals verdrängt werden.

**MEV-Lane** (Priorität 90, 20% Blockraum)\
tIBE-verschlüsselte Transaktionen erhalten die zweithöchste Priorität und den größten reservierten Anteil. Dies stellt sicher, dass Nutzer, die sich für MEV-Schutz entscheiden, garantierten Blockraum erhalten, und fördert die breite Einführung des Verschlüsselungsverfahrens.

**AI-Lane** (Priorität 80, 15% Blockraum)\
Transaktionen, die vom KI-Anomalieerkennungssystem bewertet oder optimiert wurden, erhalten erhöhte Priorität. Dazu gehören Transaktionen, die als hochwertige legitime Operationen gekennzeichnet sind, oder solche mit KI-optimierten Gebührenstrukturen.

**Default-Lane** (Priorität 50, 40% Blockraum)\
Standardtransaktionen ohne besondere Klassifizierung. Diese Lane erhält den größten absoluten Blockraum-Anteil, um den normalen Netzwerkverkehr zu bewältigen.

**Free-Lane** (Priorität 10, 10% Blockraum)\
Gas-abstrahierte und gesponserte Transaktionen. Diese Lane ermöglicht gebührenfreie Nutzererlebnisse, bei denen ein Dritter (Anwendung, Protokoll oder Relayer) die Gas-Kosten übernimmt. Die niedrige Priorität und der begrenzte Blockraum verhindern Missbrauch und unterstützen gleichzeitig Anwendungsfälle der Gas-Abstraktion.

### Implementierungsstatus

Die Lane-Konfiguration ist im aktuellen Testnet-Release **nur datenbasiert**. Die Lane-Definitionen (Priorität, Blockraum-Anteil) werden bei der Anwendungsinitialisierung registriert, aber die tatsächliche Mempool-Umordnung über `PrepareProposal` und `ProcessProposal` ist ein zukünftiger Meilenstein. Derzeit werden alle Transaktionen unabhängig von der Lane-Zuweisung in Standardreihenfolge verarbeitet.

## Kombinierter Anti-MEV-Effekt

1. **Schicht 1: Verschlüsselung (tIBE)** — Transaktionen werden verschlüsselt, bevor sie in den Mempool gelangen. Proposer können den Inhalt nicht lesen, sodass es keine Information zum Abschöpfen gibt.
2. **Schicht 2: Priorisierung (Lanes)** — Verschlüsselte MEV-Lane-Transaktionen erhalten 20% reservierten Blockraum. Priorität 90 stellt die Aufnahme selbst bei Überlastung sicher.
3. **Schicht 3: Threshold-Entschlüsselung** — Erst nach der Block-Übernahme geben Validatoren Entschlüsselungsanteile preis. Die Schwellenanforderung verhindert, dass ein einzelner Validator frühzeitig entschlüsselt.

Ergebnis: Die Informationsasymmetrie wird in jeder Phase des Transaktionslebenszyklus eliminiert, von der Übertragung bis zur Ausführung.

Dieser Ansatz ist zeitverzögerter Entschlüsselung oder Commit-Reveal-Verfahren mit einer einzelnen Partei strikt überlegen, da die Schwellenanforderung das Vertrauen auf die gesamte Validatorenmenge verteilt.
