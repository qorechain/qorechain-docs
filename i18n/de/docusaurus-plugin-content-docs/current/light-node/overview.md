---
slug: /light-node/overview
title: Light-Node-Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# Light-Node-Überblick

Die **QoreChain Light Node** ist ein leichtgewichtiger Client, der dem QoreChain-Netzwerk folgt, ohne einen vollständigen Validator- oder Archivknoten zu betreiben. Anstatt jede Transaktion erneut abzuspielen, gleicht sie Block-Header über mehrere RPC-Endpunkte hinweg ab, spiegelt die Delegationen und Belohnungen des Operator-Kontos von der Chain und streamt Live-Netzwerk-Telemetrie — alles aus einer kleinen, eigenständigen Binärdatei.

Der Betrieb einer Light Node ermöglicht es Ihnen, den Zustand des Netzwerks zu beobachten, ohne die Speicher-, Bandbreiten- und Betriebskosten eines vollständigen Knotens. Die Teilnahme am Light-Node-Belohnungsanteil ist ein separater, lizenzpflichtiger Schritt; die Registrierung ist auf beiden Netzwerken offen — siehe [Status des Belohnungsprogramms](#reward-program-status).

## Eine eigene Versionslinie

Die Light Node wird in ihrer **eigenen Versionslinie — derzeit 3.1.9** — ausgeliefert, die sich von der **Chain-Release-Version unterscheidet** (das Mainnet läuft mit Chain `v3.2.3`). Binärdateien für jedes Netzwerk werden mit einem **SHA-256-Checksum-Manifest** unter `https://download.qore.host/<net>/lightnode/latest.json` veröffentlicht (`<net>` ist `mainnet` oder `testnet`). Beide Channels führen denselben 3.1.9-Build, und beide Manifeste setzen `minCompatible` auf `3.1.9`, ältere Light-Node-Builds sollten also ersetzt werden. Das Release umfasst 12 Binärdateien — SX und UX für Linux, macOS und Windows, jeweils für amd64 und arm64 — sowie eine `SHA256SUMS`-Datei. Siehe [SX-Edition](/light-node/sx-edition#install) für die Download- und Verifizierungsschritte und [Docker](/light-node/sx-edition#docker) für den Bau eines Images aus dem Source-Tag `v3.1.9`.

Ein Android-Build ist dem GitHub-Release nur als **Vorschau** beigefügt: Er folgt der Chain und verifiziert sie, registriert sich aber nicht und verdient nichts.

Wenn Sie Dokumentation oder Release-Notes lesen, behandeln Sie die Version der Light Node (3.1.9) und die Version der Chain (v3.2.3) als zwei separate Zahlen, die zufällig eine Hauptserie teilen.

## Warum eine Light Node betreiben {#why-run-a-light-node}

- **Nehmen Sie am Light-Node-Belohnungsanteil teil.** Registrierte, aktive Light Nodes, die die Stake- und Uptime-Regeln erfüllen, sind für die unten beschriebene **3%-Light-Node-Zuweisung** berechtigt. Die Registrierung erfordert eine `lightnode_operator`-Lizenz — siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing). Das Betreiben und Synchronisieren eines Knotens braucht keine Lizenz.
- **Überprüfen Sie den Chain-Zustand, der Ihnen angezeigt wird.** Der Knoten ruft die neueste Höhe parallel von seinem primären RPC-Endpunkt und von jedem konfigurierten Witness-Endpunkt ab und speichert einen Header nur, wenn diese sich über den Block-Hash einig sind — das erhöht die Hürde vom Vertrauen in einen einzelnen Endpunkt hin zur Notwendigkeit, dass alle konfigurierten Endpunkte gleichzeitig kompromittiert sein müssten. Dies ist ein Abgleich über unabhängige Quellen, **keine vollständige kryptografische Konsensverifizierung** (keine Prüfung von Validatoren-Set oder Commit-Signaturen). Ihr Knoten hält fest, in welchem Modus er läuft, als `assurance`-Wert in jeder `synced header`-Zeile seines Debug-Logs (setzen Sie `log_level = "debug"`); er wird weder im Dashboard des Knotens noch in `status` angezeigt, und kein zentraler QoreChain-Dienst kann ihn sehen, da die RPC-Auswahl Ihres Knotens lokal zu Ihrer Einrichtung gehört. **`trusted-single-source`** erhalten Sie, wenn keine Witnesses konfiguriert sind — der Knoten protokolliert beim Start eine entsprechende Warnung, weil ein ehrlich betriebener einzelner Endpunkt denselben Wert meldet wie ein kompromittierter. Fügen Sie einen unabhängig betriebenen Witness hinzu, um zu `corroborated-across-sources` zu wechseln.
- **Behalten Sie Ihren Stake im Blick.** Der Knoten spiegelt die Delegationen des Operator-Kontos von der Chain und warnt, wenn ein Validator, an den Sie delegieren, unter einen konfigurierbaren Reputationswert fällt. Er bewegt selbst nie Stake — Delegationsänderungen werden von Ihrer eigenen Wallet aus vorgenommen.
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

## Der 3%-Light-Node-Belohnungsanteil {#the-3-light-node-reward-share}

Die Gebührenverteilung von QoreChain weist Light Nodes einen festen **3%-Anteil** zu (der Parameter `reward_share`, `0.03`). Siehe [Tokenomics](/architecture/tokenomics) für die vollständige Aufschlüsselung 37 % / 30 % / 20 % / 10 % / 3 % (Validatoren, verbrannt, Treasury, Staker, Light Nodes).

Diese 3 % sind das, was in das Light-Node-Modulkonto eingezahlt wird; es ist kein Anspruch pro Knoten. Alle 100 Blöcke schreibt die Chain jedem berechtigten Knoten seinen stake-gewichteten Anteil an dem gut, was seit der vorherigen Abrechnung aufgelaufen ist, **pro Knoten begrenzt**. Seit Chain v3.2.3 liegt die Grenze bei **2.000 QOR pro Knoten pro 30 Tage** (`max_reward_per_month_per_node`, `2000000000` uqor), anteilig über die seit der vorherigen Abrechnung verstrichene Blockzeit berechnet und mit der Uptime des Knotens skaliert; das ist die Regel `lightnode-monthly-cap`. Vor v3.2.3 war die Grenze pro Block angegeben (`max_reward_per_block_per_node`, `1713` uqor), was die Reward-Pool-Abfrage weiterhin meldet. Die Grenze ist eine Obergrenze, kein zugesicherter Betrag. Alles, was nicht verdient wird, wird in eine Reserve verschoben, die nur eine Governance-Abstimmung freigeben kann, sodass sich kein Topf für denjenigen aufbaut, der sich zuerst registriert. Die aktuelle Aufteilung können Sie mit `GET /qorechain/lightnode/v1/reward_pool` einsehen.

Um für Belohnungen berechtigt zu sein, muss eine Light Node **on-chain registriert und aktiv** sein (Liveness per Heartbeats nachweisen), mindestens den minimalen gebundenen Stake halten und ihre Uptime auf oder über dem Minimum halten. Registrierung und Lizenzierung werden unter [Registrierung und Lizenzierung](/light-node/registration-and-licensing) behandelt; wie Belohnungen gutgeschrieben, beansprucht und überwacht werden, wird unter [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) behandelt.

## Status des Belohnungsprogramms {#reward-program-status}

:::note Die Registrierung ist offen
Die Registrierung ist im Mainnet (`qorechain-vladi`, Chain v3.2.3) und im Testnet (`qorechain-diana`) offen. Stand Oktober 2026 wurden im Mainnet sechs `lightnode_operator`-Lizenzen erteilt, und es hat sich noch keine Light Node registriert. Die Belohnungsabrechnung ist seit dem Upgrade auf v3.2.0 auf beiden Netzwerken live. Das Betreiben und Synchronisieren eines Knotens braucht keine Lizenz, doch die Uptime wird **ab dem Block gezählt, in dem Ihr Knoten registriert wird**, sodass ein vorheriger Betrieb keine Gutschrift bringt.

Das Release-Manifest (`https://download.qore.host/<net>/lightnode/latest.json`) trägt das offizielle Signal im Feld `registration.open`. Für den aktuellen Stand fragen Sie `GET /qorechain/license/v1/holders/lightnode_operator` und `GET /qorechain/lightnode/v1/stats` auf `https://api.qore.host` (Mainnet) oder `https://api-testnet.qore.host` (Testnet) ab.
:::

## Kernfunktionen auf einen Blick

- **Header-Abgleich aus mehreren Quellen** — überprüft den neuesten Block-Hash gegen jeden konfigurierten Witness-Endpunkt, bevor er vertraut wird, ohne vollständige Blöcke herunterzuladen, und synchronisiert sich schnell, selbst aus einem Cold Start.
- **Delegations-Tracking** — spiegelt die Delegationen des Operator-Kontos von der Chain (nur lesend).
- **Optionaler Auto-Claim** — beansprucht aufgelaufene Light-Node-Belohnungen in einem konfigurierbaren Intervall auf das Operator-Konto. Standardmäßig aus; er delegiert nie neu.
- **Reputationswarnungen** — warnen, wenn ein Validator, an den Sie delegieren, unter einen konfigurierbaren Reputationswert fällt; er bewegt keinen Stake.
- **Echtzeit-Telemetrie** — Validatoren, Konsens, Bridge und Tokenomics, aktualisiert in unabhängigen Intervallen.
- **On-Chain-Registrierung** — mit Heartbeat-Liveness-Proofs, die den Knoten für Belohnungen berechtigt halten. Die Registrierung ist lizenzpflichtig. Der Knoten signiert seine eigenen Transaktionen unter Linux, macOS und Windows; weitere Software wird nicht benötigt.
- **Post-Quanten-Kryptografie** — Dilithium-5-(ML-DSA-87-)Schlüssel und -Signaturen durchgängig.
- **Local-Only-Modus** — testen Sie den vollständigen PQC-Stack und betreiben Sie den Knoten eigenständig, bevor Sie ihn auf eine live laufende Chain ausrichten.

Die Light Node wird unter der **Apache-2.0**-Lizenz veröffentlicht.

## Wohin als Nächstes

- [SX-Edition](/light-node/sx-edition) — installieren, konfigurieren und betreiben Sie den Server-Daemon.
- [UX-Edition](/light-node/ux-edition) — betreiben Sie die Web-Dashboard-Edition.
- [Registrierung und Lizenzierung](/light-node/registration-and-licensing) — erhalten Sie eine Lizenz und registrieren Sie sich on-chain.
- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) — wie der 3%-Anteil gutgeschrieben und beansprucht wird und wie Sie den Knoten gesund halten.
- [Tokenomics](/architecture/tokenomics) — wie der Light-Node-Belohnungsanteil in die größere Ökonomie passt.
