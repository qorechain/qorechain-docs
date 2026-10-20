---
slug: /light-node/sx-edition
title: SX-Edition (Server-Daemon)
sidebar_label: SX-Edition
sidebar_position: 2
---

# SX-Edition — Server-Daemon

Die **SX-Edition (Server eXperience)** ist der headless Light Node: ein Daemon plus eine vollständige Management-CLI, gebaut für Server und Automatisierung. Die Binärdatei ist `lightnode-sx`. Diese Seite beschreibt Light Node **3.1.10** (Quell-Tag `v3.1.10`), der seine eigene Versionslinie hat, getrennt von der Chain-Version.

## Installation {#install}

Vorgefertigte Binärdateien sind der einfachste Weg — der Light-Node-Client läuft nativ auf **sechs Plattformen ohne native Abhängigkeiten**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) und Windows (amd64, arm64) — insgesamt 12 Binärdateien über die SX- und UX-Editionen hinweg. Jede Binärdatei ist etwa 13 MB groß — herunterladen und ausführen, keine separaten Bibliotheken zu installieren. Der Node signiert seine eigenen Transaktionen auf jeder dieser Plattformen, sodass nichts weiter (insbesondere kein `qorechaind`) nötig ist, um einen Node zu registrieren und zu betreiben.

**Prüfe die Prüfsumme, bevor du sie ausführst.** Das Release-Manifest unter `https://download.qore.host/<net>/lightnode/latest.json` enthält einen `sha256`-Wert für jede Binärdatei, ein `checksums.url`, das auf eine `SHA256SUMS`-Datei über das gesamte Release verweist, sowie das eigene `checksums.sha256` dieser Datei. Verifiziere, was du heruntergeladen hast — das ist keine Randnotiz, sondern der Unterschied zwischen dem Ausführen der tatsächlich gebauten Binärdatei und dem Ausführen von irgendetwas, das an dieser URL gelandet ist:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v3.1.10/$F   # or the artifacts[].url from latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Vergleiche unter Windows die Ausgabe von `certutil -hashfile lightnode-sx-<platform>.exe SHA256` mit dem Manifestwert. Beide Netzwerke liefern denselben 3.1.10-Build aus; die Manifeste akzeptieren weiterhin 3.1.9 (`minCompatible: 3.1.9`). Seit 3.1.10 liegen die Binärdateien jedes Releases unter einem versionierten Pfad, `https://download.qore.host/<net>/lightnode/v<version>/<file>`, auf den `artifacts[].url` im Manifest verweist; verwende ihn statt der unversionierten Kopie, die einige Stunden hinterherhinken kann. Der Quellcode ist öffentlich unter `github.com/qorechain/qorechain-lightnode` (Apache 2.0). Ein Android-Build ist dem GitHub-Release als Vorschau beigefügt; er registriert sich nicht und verdient nichts.

Du kannst die Binärdatei auch aus dem Quellcode bauen oder sie mit Docker ausführen.

### Aus dem Quellcode bauen

Der Light Node benötigt **Go 1.26.1**. Seine Post-Quantum-Kryptografie ist eine reine Go-Implementierung (kein CGO, keine native Bibliothek), sodass das Cross-Compiling für jede der sechs unterstützten Plattformen genauso funktioniert wie bei jeder anderen Go-Binärdatei:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Baue aus dem Release-Tag (`git checkout v3.1.10`). Dies erzeugt `build/lightnode-sx`. Führe es direkt aus oder kopiere es in deinen `PATH`. Prüfe vor der Registrierung den Post-Quantum-Signatur-Stack mit [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Es gibt kein vorgefertigtes Registry-Image; du baust es aus dem Quell-Tag. Verwende Tag **`v3.1.10`**. Um eine bestehende Installation zu aktualisieren, baue aus dem neuen Tag neu (`git fetch --tags && git checkout v3.1.10 && docker compose build --no-cache lightnode-sx`); ein einfaches `docker compose up` oder `restart` verwendet das alte Image weiter. Schlüssel, Konfiguration und das Daten-Volume bleiben erhalten.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.10

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Halte `QORECHAIN_RPC_ADDR` bei jedem `docker compose`-Befehl exportiert: Es überschreibt `rpc_addr` aus der Konfiguration, und der Compose-Standard zeigt auf `host.docker.internal:26657`. Der SX-Container speichert seine Daten, einschließlich des Keyrings, dauerhaft in einem benannten Volume, das unter `/root/.qorechain-lightnode` eingehängt ist.

Der Node signiert nativ im Container, daher wird nichts weiter benötigt. Das SX-Image enthält außerdem weiterhin ein veröffentlichtes `qorechaind` (v3.2.0, nur linux/amd64, gegen einen fest hinterlegten Digest geprüft) für den [`qorechaind`-Fallback](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline): `docker-compose.yml` bindet `~/.qorechaind` (oder `QORECHAIND_HOME`) unter `/root/.qorechaind` ein und übergibt `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` für diesen Weg. Ein Node, dessen Operator-Schlüssel in seinem eigenen Keyring liegt, verwendet keines von beiden.

## Konfiguration {#configure}

Der Light Node liest eine TOML-Konfigurationsdatei. Standardmäßig sucht er nach `config.toml` im Home-Verzeichnis (`~/.qorechain-lightnode/config.toml`). Normalerweise schreibst du diese Datei nicht von Hand — der [`onboard`-Assistent](#first-run-onboard) erstellt sie für dich — aber es ist nützlich, die Optionen zu verstehen.

Zwei persistente Flags gelten für jeden Befehl:

- `--config <path>` — auf eine Konfigurationsdatei an einem nicht standardmäßigen Ort zeigen.
- `--home <dir>` — das für Daten und Schlüssel verwendete Home-Verzeichnis überschreiben (Standard ist `~/.qorechain-lightnode`).

Die relevantesten Konfigurationsoptionen auf Nutzungsebene:

| Option | Was sie steuert |
| --- | --- |
| `chain_id` | Der Netzwerk-Identifikator (`qorechain-vladi` im Mainnet, `qorechain-diana` im Testnet). `onboard` liest ihn vom RPC-Endpunkt; war der Endpunkt während `onboard` nicht erreichbar, bleibt der Standard `qorechain-diana` stehen, und du musst ihn selbst setzen. Transaktionen werden für diese Chain signiert. |
| `rpc_addr` | Der Chain-RPC-Endpunkt, mit dem sich der Daemon verbindet. Leer lassen, um im **Local-only-Modus** zu laufen. |
| `primary_addr` / `witness_addrs` | Der primäre RPC-Endpunkt und die Witness-Endpunkte, gegen die sein gemeldeter Header abgeglichen wird — siehe [Warum einen Light Node betreiben](/light-node/overview#why-run-a-light-node). Mindestens ein eigenständiger, erreichbarer Witness bewirkt, dass der Wert `assurance` (auf Debug-Level protokolliert) von `trusted-single-source` zu `corroborated-across-sources` wechselt. |
| `trust_period` / `max_clock_drift` | Aus Kompatibilitätsgründen akzeptiert, aber derzeit ungenutzt. Das Header-Vertrauen stammt aus dem oben beschriebenen Abgleich von Primary und Witnesses. |
| `data_dir` | Wo der Node seine Datenbank und Header speichert. |
| `keyring_backend` / `key_name` | Keyring-Backend (`file`, `os` oder `test`, nur für lokale Devnets) und der Name des Post-Quantum-Schlüssels, mit dem der Node signiert. `onboard` setzt `key_name` auf den Schlüssel, den es erstellt (`validator`); `keys add-operator` ändert ihn auf `operator-pqc`, wenn es den Schlüssel aus den Wörtern des Kontos ableitet oder wiederherstellt. Das `file`-Backend erfordert `QORE_LIGHTNODE_KEYRING_PASSPHRASE` in der Umgebung. |
| `operator_address` | Das Konto, zu dem dieser Node gehört (`qor1...`); wird beim Laden validiert. `keys add-operator` trägt es ein. Erforderlich für `register`, `status` und Heartbeats. Siehe [Die Operator-Wallet](#operator-wallet). |
| `api_addr` | Der REST-Endpunkt. Wird bei leerem Wert aus `rpc_addr` abgeleitet (Port 26657 wird zu 1317; `rpc.`-Hosts werden zu `api.`), ist also nur für Endpunkte nötig, die keiner der beiden Konventionen folgen. |
| `[heartbeat]` | Standardmäßig aktiv (`enabled`). `interval_blocks` (an das `heartbeat_interval` der Chain angleichen, 1000), `check_interval` (Standard `60s`) und `gas` (Standard `300000`; beim nativen Signieren beträgt die Gebühr 0,25 uqor pro Gas-Einheit, also 75.000 uqor). Nur vom `qorechaind`-Fallback verwendet: `fees` (Standard `50000uqor`), `qorechaind_path` (leer bedeutet `qorechaind` im `PATH`), `qorechaind_home` (leer bedeutet `~/.qorechaind`), `keyring_backend` und `key_name` (der `qorechaind`-Schlüssel, der das Operator-Konto hält; Standard ist der `key_name` der obersten Ebene). |
| `[delegation]` | `auto_claim` (standardmäßig aus: fordert aufgelaufene Light-Node-Belohnungen über den Signierer auf das Operator-Konto ein; der Node delegiert vom Server aus nie neu), das Prüfintervall, die Mindestbelohnung für das Einfordern, `rebalance_enabled` und `min_reputation` (nur Reputationsalarme — der Node verschiebt nie Stake). `validators` und `split_weights` werden akzeptiert, derzeit aber nicht ausgewertet. |
| `[telemetry]` | Ob Telemetrie aktiviert ist und die Aktualisierungsintervalle für Validatoren, Netzwerk, Bridge und Tokenomics. |
| `[dashboard]` | Die lokale Dashboard-API. Die UX-Edition stellt sie immer bereit; die SX-Edition nur mit `enabled = true`. `bind_addr` (Standard `127.0.0.1:8420`) und `token` (wenn gesetzt, verlangen jede `/api`-Route und `/ws` den Header `Authorization: Bearer <token>`). Siehe [UX-Edition](/light-node/ux-edition). |
| `log_level` / `log_format` | Logging-Ausführlichkeit (`debug`, `info`, `warn`, `error`) und Format (`text` oder `json`). Schlüssel der obersten Ebene: Setze sie vor die erste `[table]`. |

### Umgebungsvariablen {#environment-variables}

| Variable | Verwendet für |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase des Node-Keyrings (`keyring_backend = "file"`), der den Post-Quantum-Schlüssel des Nodes und den Schlüssel des Operator-Kontos enthält. Erforderlich für jeden Befehl, der den Keyring öffnet, und für `start`; der Node lehnt eine leere ab. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Nur für den `qorechaind`-Fallback: Passphrase des `qorechaind`-Keyrings mit dem Operator-Schlüssel; wird `qorechaind` über stdin übergeben, nie in einer Kommandozeile. |
| `QORECHAIN_RPC_ADDR` | Überschreibt `rpc_addr` (und `primary_addr`, wenn es `rpc_addr` entsprach). Wird von `docker-compose.yml` gesetzt. |

:::note Witness-Endpunkte werden beim Start validiert
Ein Witness auf demselben Host wie der Primary wird abgelehnt — ein kompromittierter Endpunkt würde sich einfach selbst bestätigen und damit nichts korroborieren. Ein Klartext-`http://`-Witness auf einem entfernten Host wird ebenfalls abgelehnt, da ein Angreifer, der diese Verbindung umschreiben kann, als jeder Witness gleichzeitig antworten könnte; Loopback-`http://` ist unbedenklich. Richte Witnesses auf RPC-Endpunkte, denen du aus unabhängigen Gründen vertraust.
:::

Die Delegations-Standardwerte aktivieren reputationsbewusste Rebalancing-Alarme und lassen `auto_claim` aus — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, was diese bewirken.

## Erster Start: `onboard` {#first-run-onboard}

Beim ersten Start stoppt `start` und verweist dich auf den Onboarding-Assistenten, falls noch keine Konfigurationsdatei existiert. Setze zuerst die Keyring-Passphrase — `onboard` startet ohne sie nicht, damit es nie einen Schlüssel erzeugt, den es nicht speichern kann — und führe dann den Assistenten aus:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` führt dich in vier Schritten durch die Einrichtung:

1. **PQC-Selbsttest** — führt den vollständigen Dilithium-5-Roundtrip aus (dieselben Prüfungen wie [`selftest`](#verify-the-pqc-stack-selftest)). Wenn der PQC-Stack fehlschlägt, verweigert der Assistent das Fortfahren.
2. **Chain-RPC-Endpunkt** — füge deine QoreChain-RPC-URL ein (Mainnet `https://rpc.qore.host`, Testnet `https://rpc-testnet.qore.host`) oder lasse sie leer, um im **Local-only-Modus** zu laufen. Wenn du eine URL angibst, testet der Assistent sie live und liest die Chain-ID daraus.
3. **Node-Schlüssel** — der Assistent nennt ihn „privater Validator-Schlüssel“, aber es ist der eigene Dilithium-5-Schlüssel des Light Nodes, kein Validator-Schlüssel. Füge einen hex-kodierten privaten Dilithium-5-Schlüssel ein oder tippe `g` (oder `generate`), um auf diesem Node ein frisches Schlüsselpaar zu erzeugen.
4. **Speichern** — schreibt `config.toml` (mit dem Endpunkt und der Chain-ID) und legt den Schlüssel unter dem Namen `validator` im Keyring ab (oder `validator-<hex>`, falls dieser Name vergeben ist), wobei `key_name` darauf gesetzt wird.

:::note Local-only-Modus
Wenn du den Endpunkt leer lässt, startet der Daemon im Local-only-Modus: Der PQC-Stack wird vollständig durchlaufen, aber der Node synchronisiert keine Chain. Führe `onboard` erneut aus, sobald dein Chain-Endpunkt bereit ist, um den Node darauf zu verweisen.
:::

`onboard` überschreibt immer die aktive Konfiguration. Verwende `--config`, um an einen nicht standardmäßigen Pfad zu schreiben, oder `--non-interactive`, um schnell fehlzuschlagen statt nachzufragen (nützlich in CI).

:::caution Als Nächstes: das Operator-Konto
`onboard` weiß nicht, welches Konto dir gehört. Bevor du `register` ausführst, füge das Operator-Konto mit [`keys add-operator`](#operator-wallet) hinzu. Es trägt `operator_address` für dich ein. War der Endpunkt während `onboard` nicht erreichbar, prüfe außerdem, ob `chain_id` in `config.toml` `qorechain-vladi` (Mainnet) oder `qorechain-diana` (Testnet) ist.
:::

## Ausführen: `start`

Sobald das Onboarding eine Konfiguration geschrieben hat, starte den Daemon:

```bash
build/lightnode-sx start
```

Der Daemon synchronisiert Header, verfolgt Delegationen und stellt Telemetrie bereit, bis er unterbrochen wird. Wenn du absichtlich ohne Konfigurationsdatei starten möchtest (Local-only, kein Chain-RPC), übergib `--skip-onboarding-check`.

## Den PQC-Stack verifizieren: `selftest` {#verify-the-pqc-stack-selftest}

Du kannst jederzeit bestätigen, dass der Post-Quantum-Stack funktionsfähig ist:

```bash
lightnode-sx selftest
```

`selftest` führt fünf Prüfungen gegen Dilithium-5 (ML-DSA-87) aus und schließt in unter einer Sekunde ab:

1. **Keygen** — ein frisches Schlüsselpaar erzeugen.
2. **Sign** — eine Testnachricht signieren.
3. **Verify (gültige Signatur)** — bestätigen, dass die Signatur mit dem passenden öffentlichen Schlüssel verifiziert.
4. **Manipulierte Signatur ablehnen** — ein Byte der Signatur umdrehen; die Verifizierung muss es ablehnen.
5. **Manipulierte Nachricht ablehnen** — ein Byte der Nachricht umdrehen; die Verifizierung muss es ablehnen.

Wenn eine Prüfung fehlschlägt, beendet sich die Binärdatei mit einem Exit-Code ungleich null und Diagnoseausgabe. Dies ist derselbe Test, den der Onboarding-Assistent als ersten Schritt ausführt, und er ist praktisch für die Verifizierung vor dem Deployment und für Support-Diagnosen.

## Die Operator-Wallet {#operator-wallet}

Der Dilithium-5-Schlüssel des Nodes ist **keine** Wallet. Auf QoreChain wird ein Post-Quantum-Schlüssel an ein Konto angehängt; er erzeugt keines. Deshalb zeigt `keys list` dafür keine Adresse an. Deine **Operator-Adresse** ist ein gewöhnliches `qor1…`-Konto, das die Lizenz und den Stake hält, die Gebühren zahlt und die Light-Node-Belohnungen erhält. Es muss ein Konto sein, dessen Wiederherstellungswörter du besitzt (deine eigenen Wörter, Keplr oder `qorechaind`); ein eigenes Konto ist am besten. Eine Custodial-Wallet im Dashboard kann keinen Node betreiben, es sei denn, du exportierst ihren Seed. Siehe [Das Operator-Konto](/light-node/registration-and-licensing#operator-account).

Lege den Schlüssel des Operator-Kontos im Keyring des Nodes ab:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- leitet den Kontoschlüssel aus den Wörtern genau so ab wie `qorechaind` und Keplr (`m/44'/118'/0'/0/0`), legt ihn im Keyring als `operator` ab und schreibt das Konto in `operator_address` in `config.toml`. Ist `operator_address` bereits auf ein anderes Konto gesetzt, verweigert es die Ausführung;
- wählt den Post-Quantum-Schlüssel, mit dem der Node signiert, legt ihn als `operator-pqc` ab und setzt `key_name` darauf. Hat das Konto bereits einen Post-Quantum-Schlüssel — meist von einer Wallet aus denselben Wörtern registriert —, wird dieser Schlüssel aus den Wörtern rekonstruiert (die Ableitungen von wallet-adapter und Dashboard, dieselbe wie `qorechaind tx pqc recover-key`). Hat das Konto keinen, wird ein Schlüssel aus den Wörtern abgeleitet, sodass die Wörter auch den Schlüssel des Nodes wiederherstellen. Ist der registrierte Schlüssel des Kontos bereits der aktuelle Schlüssel des Nodes, wird dieser beibehalten. Lässt sich der Schlüssel des Kontos nicht aus den Wörtern reproduzieren, verweigert der Befehl die Ausführung und empfiehlt ein eigenes Konto;
- erstellt ohne `--recover` ein neues Konto und zeigt dessen 24 Wörter einmal an. Schreibe sie auf; sie sind die einzige Sicherung. Finanziere das Konto und kaufe die Lizenz für seine Adresse, bevor du dich registrierst.

Die Keyring-Passphrase (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) schützt diesen Schlüssel ebenso wie den Node-Schlüssel. Registriere dich dann:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` prüft die Lizenz, hängt den Post-Quantum-Schlüssel an, sofern das Konto ihn nicht bereits hat, delegiert den fehlenden Stake nur, wenn du mit `--delegate-to` einen Validator angibst, und registriert den Node; jeder Schritt wird in einem Block bestätigt, bevor der nächste folgt. Siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing) für die Details und für den Fallback `register --print` für Betreiber, die den Kontoschlüssel in einem `qorechaind`-Keyring aufbewahren.

## Management-Befehle

Die SX-CLI enthält Befehle zum Einsehen des Node-Zustands und zur Schlüsselverwaltung. Seit 3.1.7 hat die UX-Binärdatei (`lightnode-ux`) dieselben Befehle.

| Befehl | Zweck |
| --- | --- |
| `onboard` | Interaktiver Assistent für den ersten Start. |
| `start` | Den Daemon ausführen. |
| `selftest` | Den PQC-Selbsttest ausführen. |
| `status` | Node- und Light-Client-Sync-Status anzeigen (Chain-ID, neueste Höhe, Aufhol-Status) sowie die Zeilen `Signer` (nativ oder `qorechaind`), `Operator`, `Licence` und `Registration`. |
| `keys create <name>` | Einen neuen Dilithium-5-Node-Schlüssel erstellen und seinen öffentlichen Schlüssel ausgeben. |
| `keys list` | Schlüssel im Keyring auflisten (Name, Typ, ggf. Adresse, öffentlicher Schlüssel). |
| `keys show <name>` | Typ und vollständigen öffentlichen Schlüssel eines Schlüssels ausgeben. |
| `keys import <name> <hex-privkey>` | Einen hex-kodierten privaten Schlüssel importieren. |
| `keys export <name> [--out <file>]` | Einen privaten Schlüssel im Hex-Format exportieren. `--out` schreibt die Datei, die `qorechaind --pqc-key` liest (ohne abschließenden Zeilenumbruch, Modus 0600). |
| `keys add-operator [--recover]` | Den Schlüssel des Operator-Kontos ablegen (neu oder aus seinen Wörtern über die Standardeingabe wiederhergestellt) und den Post-Quantum-Schlüssel wählen; trägt `operator_address` ein. Siehe [Die Operator-Wallet](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Den Node on-chain registrieren: Post-Quantum-Schlüssel, fehlender Stake, Registrierung, jeweils in einem Block bestätigt. `--print` gibt stattdessen die `qorechaind`-Befehle aus — siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing). |
| `validators` | Gebundene (bonded) Validatoren auflisten. |
| `delegation` | Die Delegationen des Operator-Kontos anzeigen, wie sie vom laufenden Daemon in die lokale Datenbank gespiegelt wurden. |
| `rewards` | Die ausstehenden Staking-Belohnungen des Operator-Kontos anzeigen (nicht die Light-Node-Belohnungen; siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Netzwerk-Telemetrie (kürzlich synchronisierte Header) aus der lokalen Datenbank anzeigen. |
| `version` | Die Version der Binärdatei ausgeben. |

Für Details zu Staking, Belohnungen und Überwachung siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring). Zum On-Chain-Registrieren siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing).
