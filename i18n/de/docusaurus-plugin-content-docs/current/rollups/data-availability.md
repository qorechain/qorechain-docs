---
slug: /rollups/data-availability
title: Datenverfügbarkeit
sidebar_label: Datenverfügbarkeit
sidebar_position: 4
---

# Datenverfügbarkeit

Datenverfügbarkeit (Data Availability, DA) ist die Garantie, dass die Transaktionsdaten hinter dem Zustand eines Rollups irgendwo veröffentlicht werden, wo jeder sie lesen kann — sodass jeder den Zustand des Rollups unabhängig rekonstruieren und verifizieren kann. Das RDK unterstützt drei DA-Backends.

| Backend | Was es ist |
| ------- | ---------- |
| **`native`** | On-Chain-Blob-Speicher innerhalb von QoreChain selbst |
| **`celestia`** | Datenverfügbarkeit über IBC zu Celestia, einer dedizierten modularen DA-Schicht |
| **`both`** | Native und Celestia zusammen, zur Redundanz |

:::caution
Datenverfügbarkeits-Backends sind Teil des sich aktiv weiterentwickelnden RDK. Behandeln Sie die folgenden Reifegrad-Hinweise als Designabsicht und validieren Sie sie auf dem **`qorechain-diana`**-Testnet, bevor Sie sich in der Produktion auf ein Backend verlassen.
:::

---

## Native DA (On-Chain-Blob-Speicher)

Native DA speichert Rollup-Transaktionsdaten als **Blobs** direkt auf QoreChain. Jeder Blob wird committet und ist adressierbar, sodass die Daten hinter einem Settlement-Batch on-chain abgerufen und verifiziert werden können.

Schlüsselkonzepte:

* **Blobs.** Rollup-Transaktionsdaten werden als Datenverfügbarkeits-Blobs veröffentlicht, jeder zugeordnet zu einer Rollup-ID und einem Blob-Index.
* **Commitments.** Jeder Blob trägt ein Commitment (einen Hash der Blob-Daten), sodass ein Blob gegen das verifiziert werden kann, was committet wurde, ohne dem Speichernden vertrauen zu müssen.
* **Namespaces.** Blobs können einen rollup-spezifischen Namespace tragen, wodurch die Daten jedes Rollups innerhalb des gemeinsam genutzten Speichers logisch getrennt bleiben.
* **Aufbewahrung und Pruning.** Native Blobs werden für ein begrenztes Zeitfenster aufbewahrt und dann geprunt, um den On-Chain-Speicher nachhaltig zu halten. Nach dem Pruning werden die rohen Blob-Daten entfernt, während die Commitment-Metadaten erhalten bleiben, sodass das historische Commitment verifizierbar bleibt, auch wenn die Bytes nicht mehr on-chain gespeichert sind.

Die genaue maximale Blob-Größe und das Aufbewahrungsfenster werden durch die Live-Modulparameter geregelt. Fragen Sie sie ab, bevor Sie um ein bestimmtes Limit herum planen:

```bash
qorechaind query rdk config
```

Native DA ist die einfachste Option — sie hält alles innerhalb von QoreChain und erbt die Sicherheit und die post-quanten Kryptografie der Host-Chain, allerdings auf Kosten des Verbrauchs von Host-Chain-Speicher.

---

## Celestia DA (IBC zu Celestia)

Das `celestia`-Backend veröffentlicht Datenverfügbarkeit über IBC zu **Celestia**, einem dedizierten modularen DA-Netzwerk. Dies lagert die Blob-Speicherung von QoreChain auf eine speziell dafür entwickelte DA-Schicht aus, während das Settlement weiterhin auf QoreChain verankert wird.

:::note
Celestia DA ist eine reifende Integration. Im aktuellen Release sollte sie als noch nicht produktionsreif behandelt werden — validieren Sie das Verhalten auf dem Testnet und bevorzugen Sie `native` oder `both`, wo Sie heute eine gesicherte Garantie benötigen.
:::

---

## Both (Redundanz)

Das `both`-Backend schreibt **gleichzeitig in native und Celestia** und bietet damit Redundanz über einen On-Chain-Speicher und eine externe modulare DA-Schicht hinweg. Wählen Sie `both`, wenn Sie die breiteste Verfügbarkeitsfläche wünschen und bereit sind, für die Speicherung der Daten an zwei Orten zu bezahlen.

Da der Celestia-Pfad noch reift, behandeln Sie `both` als native-mit-Redundanz-in-Arbeit und nicht als Garantie dafür, dass heute zwei vollständig unabhängige Kopien gesettelt sind. Bestätigen Sie das aktuelle Verhalten auf dem Testnet.

---

## Ein Backend wählen

| Wenn Sie ... wünschen | Wählen Sie |
| -------------- | ------ |
| Die einfachste, vollständig On-Chain-Option, die die Sicherheit von QoreChain erbt | **`native`** |
| DA auf eine dedizierte modulare Schicht auszulagern (reifend) | **`celestia`** |
| Maximale Verfügbarkeitsfläche mit Redundanz (reifend) | **`both`** |

Wie DA in das umfassendere Settlement-Bild passt, erfahren Sie unter **[Rollups – Übersicht](/rollups/overview)**. Für die Referenz auf niedrigerer Modulebene siehe die Seite **[Rollup Development Kit](/architecture/rollup-development-kit)**.
