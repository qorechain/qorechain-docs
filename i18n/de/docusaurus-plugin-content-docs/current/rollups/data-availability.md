---
slug: /rollups/data-availability
title: Datenverfügbarkeit
sidebar_label: Datenverfügbarkeit
sidebar_position: 4
---

# Datenverfügbarkeit

Datenverfügbarkeit (Data Availability, DA) ist die Garantie, dass die Transaktionsdaten hinter dem Zustand eines Rollups irgendwo veröffentlicht werden, wo jeder sie lesen kann — sodass jeder den Zustand des Rollups unabhängig rekonstruieren und verifizieren kann. Das RDK definiert drei DA-Backends; heute ist nur `native` implementiert.

| Backend | Was es ist | Status |
| ------- | ---------- | ------ |
| **`native`** | On-Chain-Blob-Speicher innerhalb von QoreChain selbst | Im Modul implementiert; noch keine öffentliche Möglichkeit, einen Blob zu senden (siehe unten) |
| **`celestia`** | Datenverfügbarkeit über IBC zu Celestia, einer dedizierten modularen DA-Schicht | Nicht implementiert |
| **`both`** | Native und Celestia zusammen, zur Redundanz | Verhält sich heute exakt wie `native` |

:::caution Fähigkeit im frühen Stadium
Auf keinem der beiden Netzwerke wurde bisher ein Rollup erstellt, und die DA-Backends sind nur teilweise implementiert. Der Status jedes Backends ist unten angegeben; validieren Sie auf dem **`qorechain-diana`**-Testnet, bevor Sie sich auf eines davon verlassen.
:::

---

## Native DA (On-Chain-Blob-Speicher)

Native DA ist der On-Chain-Blob-Speicher innerhalb von `x/rdk`: Jeder Blob wird über Rollup-ID und Blob-Index adressiert, trägt ein **SHAKE-256-Commitment** seiner Bytes und wird nach dem Aufbewahrungsfenster geprunt, während sein Commitment erhalten bleibt.

:::caution Noch keine öffentliche Möglichkeit, einen Blob zu senden
Das Modul definiert Blob-Speicherung, Aufbewahrung und Pruning, doch in den aktuellen Releases gibt es **keine Transaktionsnachricht zum Senden eines Blobs**. Solange keine Submit-Nachricht ausgeliefert wird, muss ein Settlement-Batch `data_hash` leer lassen — ein Batch, der auf einem `native`- oder `both`-Rollup einen Datenhash nennt, wird abgelehnt, weil kein passender Blob gespeichert werden kann.
:::

Schlüsselkonzepte:

* **Blobs.** Ein Blob ist einer Rollup-ID und einem Blob-Index zugeordnet.
* **Commitments.** Jeder Blob trägt ein 32-Byte-SHAKE-256-Commitment seiner Daten, sodass ein Blob gegen das verifiziert werden kann, was committet wurde, ohne dem Speichernden vertrauen zu müssen. (Der TypeScript-Helfer `buildDaBlob()` hasht derzeit mit SHA-256, sodass sein `dataHash` nicht mit dem Commitment der Chain übereinstimmt.)
* **Namespaces.** Blobs können einen rollup-spezifischen Namespace tragen, wodurch die Daten jedes Rollups innerhalb des gemeinsam genutzten Speichers logisch getrennt bleiben.
* **Aufbewahrung und Pruning.** Native Blobs werden für `blob_retention_blocks` aufbewahrt (432,000 Blöcke — etwa 16 Tage bei der aktuellen Blockzeit des Mainnets von ≈3.2 s; der Wert ändert sich mit der Blockzeit) und dann geprunt, um den On-Chain-Speicher nachhaltig zu halten. Nach dem Pruning werden die rohen Blob-Daten entfernt, während die Commitment-Metadaten erhalten bleiben, sodass das historische Commitment verifizierbar bleibt, auch wenn die Bytes nicht mehr on-chain gespeichert sind.

Die maximale Blob-Größe und das Aufbewahrungsfenster werden durch die Live-Modulparameter geregelt. Fragen Sie sie ab, bevor Sie um ein bestimmtes Limit herum planen:

```bash
qorechaind query rdk config
```

---

## Celestia DA (IBC zu Celestia)

Celestia DA ist **nicht implementiert**. Ein Rollup, dessen DA-Backend `celestia` ist, kann keine Daten senden (das Modul gibt einen Fehler zurück). Das geplante Design veröffentlicht Datenverfügbarkeit über IBC zu **Celestia**, einem dedizierten modularen DA-Netzwerk, und verankert das Settlement weiterhin auf QoreChain; auf keinem der beiden Netzwerke existiert heute ein IBC-Kanal (siehe [Bridge-Architektur](/architecture/bridge-architecture)). Verwenden Sie `native`.

---

## Both (Redundanz)

Das `both`-Backend ist dafür gedacht, **gleichzeitig in native und Celestia** zu schreiben. Heute verhält sich `both` exakt wie `native`: Nur die native Kopie wird gespeichert, und die Celestia-Hälfte wird mit einer protokollierten Warnung übersprungen. Behandeln Sie es nicht als zwei unabhängige Kopien.

---

## Ein Backend wählen

| Wenn Sie ... wünschen | Wählen Sie |
| -------------- | ------ |
| Die einfachste, vollständig On-Chain-Option, die die Sicherheit von QoreChain erbt | **`native`** |
| DA auf eine dedizierte modulare Schicht auszulagern | **`celestia`** — nicht implementiert |
| Redundanz über zwei Speicher | **`both`** — heute wie `native` |

Wie DA in das umfassendere Settlement-Bild passt, erfahren Sie unter **[Rollups – Übersicht](/rollups/overview)**. Für die Referenz auf niedrigerer Modulebene siehe die Seite **[Rollup Development Kit](/architecture/rollup-development-kit)**.
