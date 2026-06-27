---
slug: /light-node/overview
title: Light-Node-Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# Light-Node-Überblick

Die **QoreChain Light Node** ist ein leichtgewichtiger Client, der dem QoreChain-Netzwerk folgt, ohne einen vollständigen Validator- oder Archivknoten zu betreiben. Anstatt jede Transaktion erneut abzuspielen, verifiziert sie Block-Header kryptografisch, verfolgt Delegationen und Belohnungen und streamt Live-Netzwerk-Telemetrie — alles aus einer kleinen, eigenständigen Binärdatei.

Der Betrieb einer Light Node ermöglicht es Ihnen, an der Ökonomie des Netzwerks teilzunehmen und seinen Zustand zu beobachten, ohne die Speicher-, Bandbreiten- und Betriebskosten eines vollständigen Knotens.

## Eine eigene Versionslinie

Die Light Node wird in ihrer **eigenen Versionslinie — derzeit v3.1.1** — ausgeliefert, die sich von der **Chain-Release-Version unterscheidet** (die Chain befindet sich auf einem separaten `v3.x`-Track). Die v3.1.1-Linie der Light Node ist mit `qorechain-core` abgestimmt: Sie fügt eine Regressionssuite für Post-Quanten-Kryptografie (PQC) hinzu (Keygen, Sign, Verify und Tamper-Detection), die das Signaturverifizierungsverhalten des Cores absichert und in Continuous Integration ausführt.

Wenn Sie Dokumentation oder Release-Notes lesen, behandeln Sie die Version der Light Node (v3.1.1) und die Version der Chain als zwei separate Zahlen, die zufällig eine Hauptserie teilen.

## Warum eine Light Node betreiben

- **Verdienen Sie einen Anteil an den Block-Belohnungen.** Aktive, registrierte Light Nodes sind für den unten beschriebenen **3%-Light-Node-Belohnungsanteil** berechtigt.
- **Verifizieren Sie die Chain selbst.** Der Knoten führt eine Header-Verifizierung mit einem Skipping-Light-Client durch, sodass Sie eine kryptografische Zusicherung des Chain-Zustands erhalten, ohne einer entfernten API zu vertrauen.
- **Delegieren und automatisch verzinsen.** Verwalten Sie delegierten Stake über mehrere Validatoren hinweg, aufgeteilt nach Gewichtung, und verzinsen Sie Belohnungen automatisch.
- **Beobachten Sie das Netzwerk live.** Echtzeit-Telemetrie deckt Validatoren, Konsens, die Bridge und Tokenomics ab.
- **Post-Quanten ab dem ersten Tag.** Schlüssel und Signaturen verwenden Dilithium-5 (ML-DSA-87).

## Zwei Editionen: SX und UX

Die Light Node ist in zwei Editionen verfügbar, die aus derselben Codebasis erstellt werden. Wählen Sie diejenige, die zu der Art und Weise passt, wie Sie den Knoten betreiben möchten.

| Edition | Binärdatei | Gebaut für | Schnittstelle |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Headless-Server-Bereitstellungen | Vollständige CLI (Daemon + Verwaltungsbefehle) |
| **UX — User eXperience** | `lightnode-ux` | Desktop- und Betreibernutzung | Eingebettetes Web-Dashboard |

- Die **SX-Edition** ist ein Headless-Daemon mit einer vollständigen Verwaltungs-CLI. Sie ist die richtige Wahl für Server, Automatisierung und Betreiber, die auf der Kommandozeile leben. Siehe [SX-Edition](/light-node/sx-edition).
- Die **UX-Edition** führt denselben Daemon aus, fügt jedoch ein eingebettetes Web-Dashboard hinzu, sodass Sie Telemetrie, Delegationen und Belohnungen in einem Browser beobachten können. Siehe [UX-Edition](/light-node/ux-edition).

Beide Editionen lesen dieselbe `config.toml`, speichern Daten im selben Home-Verzeichnis (standardmäßig `~/.qorechain-lightnode`) und verwenden denselben Dilithium-5-Keyring.

## Der 3%-Light-Node-Belohnungsanteil

Die Gebührenverteilung von QoreChain weist Light Nodes einen festen **3%-Anteil** für die Bereitstellung von Netzwerkdaten zu. Dies wird on-chain als Teil der Belohnungsaufteilung des Protokolls durchgesetzt und ist derselbe Kanal, der in der Ökonomie des Projekts dokumentiert ist — siehe [Tokenomics](/architecture/tokenomics) für die vollständige Aufschlüsselung 37 % / 30 % / 20 % / 10 % / 3 % (Validatoren, verbrannt, Treasury, Staker, Light Nodes).

Um für diesen Anteil berechtigt zu sein, muss eine Light Node **on-chain registriert sein und aktiv ihre Liveness nachweisen** über Heartbeat-Proofs. Registrierung und Lizenzierung werden unter [Registrierung und Lizenzierung](/light-node/registration-and-licensing) behandelt; wie der Anteil verdient, verzinst und überwacht wird, wird unter [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) behandelt.

## Kernfunktionen auf einen Blick

- **Skipping-Light-Client** — verifiziert Header, ohne vollständige Blöcke herunterzuladen, und synchronisiert sich schnell, selbst aus einem Cold Start.
- **Delegiertes Staking** — staken Sie über mehrere Validatoren hinweg mit konfigurierbaren Aufteilungsgewichten.
- **Auto-Compound-Belohnungen** — beanspruchen und re-delegieren Sie Belohnungen in einem konfigurierbaren Intervall.
- **Reputationsbewusstes Rebalancing** — verschieben Sie die Delegation automatisch hin zu Validatoren mit höherer Reputation.
- **Echtzeit-Telemetrie** — Validatoren, Konsens, Bridge und Tokenomics, aktualisiert in unabhängigen Intervallen.
- **On-Chain-Registrierung** — mit Heartbeat-Liveness-Proofs, die den Knoten für Belohnungen berechtigt halten.
- **Post-Quanten-Kryptografie** — Dilithium-5-(ML-DSA-87-)Schlüssel und -Signaturen durchgängig.
- **Local-Only-Modus** — testen Sie den vollständigen PQC-Stack und betreiben Sie den Knoten eigenständig, bevor Sie ihn auf eine live laufende Chain ausrichten.

Die Light Node wird unter der **Apache-2.0**-Lizenz veröffentlicht.

## Wohin als Nächstes

- [SX-Edition](/light-node/sx-edition) — installieren, konfigurieren und betreiben Sie den Server-Daemon.
- [UX-Edition](/light-node/ux-edition) — betreiben Sie die Web-Dashboard-Edition.
- [Registrierung und Lizenzierung](/light-node/registration-and-licensing) — registrieren Sie sich on-chain und erhalten Sie eine Lizenz.
- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — verdienen Sie den 3%-Anteil und halten Sie den Knoten gesund.
- [SX-Edition](/light-node/sx-edition) und [UX-Edition](/light-node/ux-edition) sind die zwei Möglichkeiten, eine Light Node zu betreiben.
- [Tokenomics](/architecture/tokenomics) — wie der Light-Node-Belohnungsanteil in die größere Ökonomie passt.
