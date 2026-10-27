---
slug: /light-node/overview
title: Light-Node-Überblick
sidebar_label: Überblick
sidebar_position: 1
---

# Light-Node-Überblick

Die **QoreChain Light Node** ist ein kleiner Client, der einem QoreChain-Netzwerk folgt, ohne einen vollständigen Node zu betreiben, und der sich on-chain als Light Node registrieren kann, um am **3%-Light-Node-Belohnungsanteil** teilzunehmen. Sie richtet sich an Betreiber, die eine kostengünstige Möglichkeit suchen, der Chain zu folgen und aus diesem Anteil zu verdienen, sowie an Menschen, die einfach eine zweite Meinung zum neuesten Block-Hash der Chain haben möchten, ohne einem einzelnen RPC-Server zu vertrauen. Sie ist eine einzelne, eigenständige Binärdatei in zwei Editionen, die aus demselben Code gebaut werden: **SX** (`lightnode-sx`, ein Headless-Daemon mit Kommandozeile, für Server) und **UX** (`lightnode-ux`, derselbe Daemon plus ein lokales Web-Dashboard auf `127.0.0.1:8420`). Sie wird unter der Apache-2.0-Lizenz veröffentlicht, und der Quellcode ist öffentlich unter `github.com/qorechain/qorechain-lightnode`.

Der Betrieb und die Synchronisierung eines Knotens braucht keine Lizenz. Die Teilnahme am Belohnungsanteil ist ein separater Schritt: Sie erfordert eine `lightnode_operator`-Lizenz, an gebondete Validatoren delegierten Stake und eine On-Chain-Registrierung (siehe [So erhalten Sie Zugang](#how-to-access)).

Die Light Node hat eine **eigene Versionslinie**, getrennt vom Chain-Release. Zum Zeitpunkt der Erstellung (27. Oktober 2026) führen die Release-Channels beider Netzwerke die Light Node **3.1.12** (Chain `v3.2.4` im Mainnet, `v3.2.6` im Testnet). Behandeln Sie die beiden Nummern als voneinander unabhängig.

## Innovationen {#innovations}

Jeder der folgenden Punkte ist ein Mechanismus, den Sie im Quellcode oder durch den Betrieb des Knotens prüfen können.

- **Native hybride Signierung, keine weitere Software.** Der Knoten baut und signiert seine eigenen Transaktionen in reinem Go (kein CGO, keine nativen Bibliotheken, kein `qorechaind`). Jede Transaktion trägt eine ML-DSA-87-Signatur (FIPS 204) über den Body ohne die PQC-Erweiterung sowie eine secp256k1-Signatur über das SignDoc, dessen Body diese Erweiterung trägt. Die Version des Signaturformats wird aus den angewendeten Upgrade-Plänen der Chain gelesen. Builds für Linux, macOS und Windows gibt es für amd64 und arm64 (seit 3.1.8).
- **Ein Satz Wiederherstellungswörter ergibt beide Schlüssel.** `keys add-operator --recover` leitet den Kontoschlüssel unter `m/44'/118'/0'/0/0` ab, demselben Pfad, den `qorechaind` und Keplr verwenden. Für den Post-Quanten-Schlüssel baut es entweder den Schlüssel, den eine Wallet bereits für dieses Konto registriert hat, aus denselben Wörtern neu auf (die Ableitungen des Wallet-Adapters und des Dashboards, dieselben wie bei `qorechaind tx pqc recover-key`) oder leitet einen neuen ab, sodass die Wörter auch den Schlüssel des Knotens wiederherstellen (seit 3.1.9).
- **Die Registrierung ist ein einziger Befehl, Schritt für Schritt geprüft.** `register` prüft die Lizenz, hängt den Post-Quanten-Schlüssel an (mit einem Besitznachweis, wo die Chain ihn unterstützt), delegiert nur den fehlenden Stake, wenn Sie `--delegate-to` übergeben, und registriert dann. Jeder Schritt muss in einem Block stehen, bevor der nächste gesendet wird. Stake wird nur bei gebondeten Validatoren gezählt, so wie die Chain ihn zählt (seit 3.1.10).
- **Heartbeats werden anhand der eigenen Aufzeichnung der Chain getaktet.** Der Daemon sendet einen Heartbeat, sobald seit dem `last_heartbeat` der Chain für den Knoten 1.000 Blöcke vergangen sind, prüft alle 60 Sekunden und meldet einen Heartbeat erst, wenn er in einem Block steht. Ein Neustart sendet weder ein Duplikat noch wartet er ein ganzes Intervall.
- **Header-Abgleich über mehrere Endpunkte.** Der Knoten ruft dieselbe Höhe von seinem primären Endpunkt und von jedem konfigurierten Witness-Endpunkt ab und speichert den Header nur, wenn alle denselben Hash zurückgeben. Ein Witness auf demselben Host wie der primäre Endpunkt oder unter einer entfernten Klartext-Adresse `http://` wird abgelehnt. Der Modus wird pro Header auf Debug-Ebene als `assurance` protokolliert (`trusted-single-source` oder `corroborated-across-sources`). Dies ist **keine** Konsensverifizierung: siehe [Grenzen](#limits).
- **Signiertes Self-Update.** Ab Light Node 3.1.11 liest der Daemon alle 6 Stunden die `latest.json` seines Netzwerks. Er installiert ein neues Release nur, wenn `v<version>/SHA256SUMS.sig` als Ed25519-Signatur eines in die Binärdatei eingebauten Release-Schlüssels verifiziert wird (die Signatur bindet das Netzwerk, die Version und den Inhalt von `SHA256SUMS`), die heruntergeladene Binärdatei zu ihrer signierten Prüfsumme passt und die neue Binärdatei läuft und genau `v<version>` meldet. Die vorherige Binärdatei bleibt als `<name>.old` erhalten, und der Knoten startet an Ort und Stelle neu (derselbe Prozess unter Linux und macOS; unter Windows startet die neue Binärdatei, und die alte beendet sich). `[update] mode` ist `auto` (Standard), `notify` oder `off`; `lightnode-sx update --check` und `lightnode-sx update` tun dasselbe von Hand. In einem Container oder wenn der Ordner der Binärdatei nicht beschreibbar ist, kündigt der Knoten ein Release nur an (Logzeile, `GET /api/update` an der lokalen API und ein Banner im UX-Dashboard).
- **Warnungen, die dem entsprechen, was die Chain tut.** Mit `[delegation] rebalance_enabled` an (der Standard) warnt der Knoten, wenn ein Validator, an den Sie delegieren, inhaftiert (jailed) ist, wenn er nicht im aktiven Set ist und wenn Ihr gebondeter Stake unter `min_delegated_stake` (1.000 QOR) fällt. In allen drei Fällen schreibt die Chain dem Knoten ohne jede Meldung nichts mehr gut. Eine Warnung wird protokolliert, wenn sie erscheint, stündlich, solange sie besteht, und einmal, wenn sie verschwindet. Eine vierte Warnung, der Reputationswert eines delegierten Validators unter `min_reputation` (Standard `0.5`), liest `GET /qorechain/reputation/v1/validator/<valoper>`: Sie ist jetzt im **Testnet** live und erreicht das Mainnet erst mit einem Chain-Release nach v3.2.5; solange die Route nicht bereitgestellt wird, vermerkt der Knoten das einmal und fragt alle 6 Stunden erneut nach.

### Warum eine Light Node betreiben, und wie man den Abgleich liest {#why-run-a-light-node}

- **Nehmen Sie am Belohnungsanteil teil.** Registrierte, aktive Light Nodes, die die Stake- und Uptime-Regeln erfüllen, werden aus dem [unten](#the-3-light-node-reward-share) beschriebenen 3%-Anteil bezahlt.
- **Gleichen Sie den Chain-Zustand ab, der Ihnen angezeigt wird.** Ohne konfigurierten Witness protokolliert der Knoten beim Start eine Warnung und meldet `trusted-single-source`: Ein ehrlich betriebener einzelner Endpunkt meldet denselben Wert wie ein kompromittierter. Fügen Sie einen unabhängig betriebenen Witness hinzu, um zu `corroborated-across-sources` zu wechseln; dort müssten alle konfigurierten Endpunkte gleichzeitig kompromittiert sein, damit der Knoten getäuscht wird. Der Wert erscheint in den `synced header`-Zeilen des Debug-Logs (setzen Sie `log_level = "debug"`); er wird weder in `status` noch im Dashboard angezeigt, und nichts Zentrales kann ihn sehen, da die RPC-Auswahl lokal zu Ihrer Einrichtung gehört.
- **Beobachten Sie das Netzwerk.** Die Telemetrie deckt Validatoren, Konsens, die Bridge und Tokenomics ab, aktualisiert in unabhängigen Intervallen.

## So nutzen Sie sie {#how-to-use}

Wählen Sie eine Edition. Beide lesen dieselbe `config.toml`, speichern Daten im selben Home-Verzeichnis (`~/.qorechain-lightnode`) und verwenden denselben Keyring.

| Edition | Binärdatei | Gebaut für | Schnittstelle |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Headless-Server, Automatisierung | Daemon plus vollständige Kommandozeile. Siehe [SX-Edition](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Desktop- und Betreibernutzung | Dieselben Befehle plus ein lokales Web-Dashboard. Siehe [UX-Edition](/light-node/ux-edition). |

**1. Herunterladen und verifizieren** (Linux amd64 gezeigt; `jq` dient zum Lesen des Manifests). Nehmen Sie die Version aus dem Manifest des Netzwerks, auf das Sie zielen:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Vergleichen Sie unter Windows `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` mit dem Wert aus dem Manifest. Die versionsspezifische `SHA256SUMS` muss zur versionsspezifischen Binärdatei passen, nehmen Sie also beide aus dem Pfad `v$V`.

**2. Einrichten und registrieren.** Die folgende Abfolge ist diejenige, die das Dashboard zeigt; sie wurde auf einem Devnet, im Testnet (Probelauf am 18. Oktober 2026) und für den ersten Mainnet-Knoten (20. Oktober 2026) ausgeführt.

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

Der Chain-RPC für `onboard` ist `https://rpc.qore.host` (Mainnet) oder `https://rpc-testnet.qore.host` (Testnet). Verwenden Sie für die UX-Edition `lightnode-ux` mit denselben Befehlen und öffnen Sie `http://127.0.0.1:8420`. Details zu jedem Schritt: [SX-Edition](/light-node/sx-edition) und [Registrierung und Lizenzierung](/light-node/registration-and-licensing).

**3. Aktuell halten.** Light Node 3.1.11 und neuer aktualisieren sich außerhalb von Containern selbst (siehe den Punkt zum Self-Update oben). Ein Knoten mit 3.1.10 oder früher muss 3.1.12 einmal von Hand installieren: Laden Sie die versionierte Binärdatei wie oben herunter und ersetzen Sie die Datei. Bei Docker bauen Sie aus dem neuen Source-Tag neu. Siehe [SX-Edition: Aktualisieren](/light-node/sx-edition#updating).

## So erhalten Sie Zugang {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Chain | `qorechain-vladi` (Chain `v3.2.4`) | `qorechain-diana` (Chain `v3.2.6`) |
| RPC für den Knoten | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST für Abfragen | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Light-Node-Release | 3.1.12 | 3.1.12 |
| Lizenz | $50, im Dashboard gekauft; die Vergabe wird in Stapeln von Hand signiert | Kostenlos, Self-Service: **Nodes & Validators > Light Node**, **Request licence**; automatisch signiert, in der Regel innerhalb weniger Minuten |

**Was Sie für die Registrierung brauchen**

- Ein Konto, dessen Wiederherstellungswörter Sie besitzen (Ihre eigenen Wörter, Keplr oder ein `qorechaind`-Schlüssel), vorzugsweise ausschließlich für den Knoten bestimmt. Eine verwahrende Dashboard-Wallet kann keinen Knoten betreiben, sofern Sie nicht ihren Seed exportieren.
- Eine aktive `lightnode_operator`-Lizenz auf dieser Adresse (siehe unten).
- Mindestens **1.000 QOR**, die von dieser Adresse an **gebondete** Validatoren delegiert sind, als Summe gezählt.
- QOR im Konto für die Registrierungsgebühr von **1 QOR** und die Transaktionsgebühren. Ein Heartbeat kostet 0.25 uqor pro Gas beim Standardlimit von 300.000 Gas, das sind 0,075 QOR als Obergrenze (gemessener Gasverbrauch: etwa 165.000).
- Ein Computer, der eingeschaltet bleibt: Der Knoten muss alle 1.000 Blöcke einen Heartbeat senden und mindestens 80 % Uptime halten, um bezahlt zu werden.

**Eine Lizenz erhalten.** Öffnen Sie im Dashboard **Nodes & Validators** (der Sidebar-Eintrag, der früher **Tools** hieß; die Seite liegt weiterhin unter `/tools`), wählen Sie den Tab **Light Node** und wählen Sie im Header das Netzwerk. Das Dashboard erfordert eine Anmeldung.

- *Mainnet:* Geben Sie zuerst die Adresse `qor1...` ein, wählen Sie das USDT-Netzwerk und zahlen Sie $50. Der Tab zeigt **Paid, awaiting on-chain grant**, bis die Chain die Vergabe bestätigt.
- *Testnet:* Es wird nichts verkauft. Geben Sie Ihre Adresse `qor1...` unter **Free testnet licence** ein und wählen Sie **Request licence**. Es gibt eine Anfrage pro Konto und eine pro Adresse. Der Tab zeigt „Granted to ...“, wenn die Lizenz eingetroffen ist, oder meldet, dass die Vergabe nicht signiert werden konnte, und lässt Sie erneut anfragen.

Sie können eine Lizenz auch direkt prüfen: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Status des Belohnungsprogramms {#reward-program-status}

:::note Die Registrierung ist offen
Die Registrierung ist im Mainnet (`qorechain-vladi`, Chain v3.2.4) und im Testnet (`qorechain-diana`, Chain v3.2.6) offen. Am 27. Oktober 2026 waren im Mainnet sieben `lightnode_operator`-Lizenzen vergeben, und in jedem Netzwerk war eine Light Node registriert (`total_registered` ist in `GET /qorechain/lightnode/v1/stats` bei beiden `1`). Die Belohnungsabrechnung ist seit dem Upgrade auf v3.2.0 auf beiden Netzwerken live. Die Uptime wird **ab dem Block gezählt, in dem Ihr Knoten registriert wird**, sodass ein vorheriger Betrieb keine Gutschrift bringt. Seit Chain v3.2.4 beginnt auch die Grenze pro Knoten mit der eigenen Registrierung des Knotens: Die erste Abrechnung nach der Registrierung schreibt nur gut, was seitdem angefallen ist.

Das Release-Manifest (`https://download.qore.host/<net>/lightnode/latest.json`) trägt das offizielle Signal im Feld `registration.open`. Für den aktuellen Stand fragen Sie `GET /qorechain/license/v1/holders/lightnode_operator` und `GET /qorechain/lightnode/v1/stats` auf `https://api.qore.host` (Mainnet) oder `https://api-testnet.qore.host` (Testnet) ab.
:::

## Der 3%-Light-Node-Belohnungsanteil {#the-3-light-node-reward-share}

Die Gebührenverteilung von QoreChain weist Light Nodes einen festen **3%-Anteil** zu (der Parameter `reward_share`, `0.03`). Siehe [Tokenomics](/architecture/tokenomics) für die vollständige Aufschlüsselung 37 % / 30 % / 20 % / 10 % / 3 % (Validatoren, verbrannt, Treasury, Staker, Light Nodes).

Diese 3 % sind das, was in das Light-Node-Modulkonto eingezahlt wird; es ist kein Anspruch pro Knoten. Alle 100 Blöcke schreibt die Chain jedem berechtigten Knoten seinen stake-gewichteten Anteil an dem gut, was seit der vorherigen Abrechnung aufgelaufen ist, **pro Knoten begrenzt**. Seit Chain v3.2.3 liegt die Grenze bei **2.000 QOR pro Knoten pro 30 Tage** (`max_reward_per_month_per_node`, `2000000000` uqor), anteilig über die seit der vorherigen Abrechnung verstrichene Blockzeit berechnet und mit der Uptime des Knotens skaliert; das ist die Regel `lightnode-monthly-cap`. Vor v3.2.3 war die Grenze pro Block angegeben (`max_reward_per_block_per_node`, `1713` uqor), was die Reward-Pool-Abfrage weiterhin meldet. Die Grenze ist eine Obergrenze, kein zugesicherter Betrag. Alles, was nicht verdient wird, wird in eine Reserve verschoben, die nur eine Governance-Abstimmung freigeben kann, sodass sich kein Topf für denjenigen aufbaut, der sich zuerst registriert. Die aktuelle Aufteilung können Sie mit `GET /qorechain/lightnode/v1/reward_pool` einsehen.

Um für Belohnungen berechtigt zu sein, muss eine Light Node **on-chain registriert und aktiv** sein (Liveness per Heartbeats nachweisen), mindestens den minimalen gebondeten Stake halten und ihre Uptime auf oder über dem Minimum halten. Registrierung und Lizenzierung werden unter [Registrierung und Lizenzierung](/light-node/registration-and-licensing) behandelt; wie Belohnungen gutgeschrieben, beansprucht und überwacht werden, wird unter [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) behandelt.

## Wo sie veröffentlicht ist {#where-published}

| Was | Wo | Aktuelle Version |
| --- | --- | --- |
| Release-Manifest, Mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, Registrierung offen) |
| Release-Manifest, Testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, Registrierung offen) |
| Binärdateien | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 Dateien pro Release (SX und UX, Linux, macOS und Windows, amd64 und arm64) plus `SHA256SUMS` |
| Quellcode und Releases | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Release `v3.1.12` (aktuell) und frühere Tags; jedes enthält die 12 Binärdateien, `SHA256SUMS`, `lightnode-build.json` und eine Android-Vorschau-APK |
| Android | Nur dem GitHub-Release beigefügt | Vorschau: folgt der Chain, registriert sich nicht, verdient nichts |
| Docker | Aus dem Source-Tag gebaut (siehe [SX-Edition: Docker](/light-node/sx-edition#docker)) | Es wird kein Registry-Image für anonyme Pulls veröffentlicht |

Prüfen Sie die `version` im Manifest Ihres Netzwerks, bevor Sie herunterladen, anstatt sich auf diese Tabelle zu verlassen. Der Release-Signaturschlüssel ist in die Binärdatei eingebaut; Sie müssen nichts installieren.

## Grenzen und bekannte Probleme {#limits}

- **Kein Protokoll-Light-Client.** Der Knoten gleicht Block-Hashes über Endpunkte hinweg ab. Er prüft weder Commit-Signaturen noch Änderungen des Validator-Sets oder eine Trust-Period, verifiziert also nicht den Konsens der Chain. `trust_period` und `max_clock_drift` in der Konfiguration werden akzeptiert, aber nicht verwendet.
- **Belohnungen sind eine Obergrenze.** Die Grenze pro Knoten (2.000 QOR pro 30 Tage) ist ein Maximum, und der Knoten wird nur für das bezahlt, was dem Pool zufließt, und nur, solange er berechtigt ist.
- **Ein Heartbeat ist eine Liveness-Signatur.** Er belegt, dass der Operator-Schlüssel rechtzeitig signiert hat, nicht, dass die vollständige Software durchgehend lief.
- **Reputationswarnungen gibt es vorerst nur im Testnet.** Das Mainnet stellt noch keine Reputationswerte pro Validator bereit, daher läuft diese eine Prüfung im Mainnet nicht, und der Knoten sagt das in seinem Log. Die Warnungen zu inhaftiert (jailed), nicht im aktiven Set und zu niedrigem Stake hängen nicht davon ab. Knotenversionen vor 3.1.11 protokollierten alle fünf Minuten eine fehlgeschlagene Reputationsprüfung und warnten nie vor irgendetwas.
- **Das Self-Update beginnt bei 3.1.11.** Ein Knoten mit 3.1.10 oder früher aktualisiert sich nicht selbst und braucht eine manuelle Installation von 3.1.12. In einem Container oder einem nicht beschreibbaren Ordner kündigt der Knoten neue Releases nur an.
- **Kein Docker-Image zum Pullen.** Bauen Sie aus dem Source-Tag; die veröffentlichten Container-Pakete sind noch nicht öffentlich. Docker-Knoten aktualisieren sich nie selbst.
- **Android ist eine Vorschau** und registriert sich nicht und verdient nichts.
- **Lizenzen.** Mainnet-Vergaben werden in Stapeln von Hand signiert, es gibt also eine Wartezeit zwischen Zahlung und Registrierung. Die Testnet-Lizenz ist auf eine pro Konto und eine pro Adresse begrenzt.
- **Eine im Dashboard erstellte Wallet kann keinen Knoten betreiben**, sofern Sie nicht ihren Seed exportieren, da der Knoten mit Schlüsseln signieren muss, die Sie besitzen.

## Wohin als Nächstes

- [SX-Edition](/light-node/sx-edition): installieren, konfigurieren und betreiben Sie den Server-Daemon.
- [UX-Edition](/light-node/ux-edition): betreiben Sie die Web-Dashboard-Edition.
- [Registrierung und Lizenzierung](/light-node/registration-and-licensing): erhalten Sie eine Lizenz und registrieren Sie sich on-chain.
- [Belohnungen und Überwachung](/light-node/rewards-and-monitoring): wie der 3%-Anteil gutgeschrieben und beansprucht wird und wie Sie den Knoten gesund halten.
- [Tokenomics](/architecture/tokenomics): wie der Light-Node-Belohnungsanteil in die größere Ökonomie passt.
