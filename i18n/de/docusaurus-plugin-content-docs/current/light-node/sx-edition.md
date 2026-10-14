---
slug: /light-node/sx-edition
title: SX-Edition (Server-Daemon)
sidebar_label: SX-Edition
sidebar_position: 2
---

# SX-Edition — Server-Daemon

Die **SX-Edition (Server eXperience)** ist der headless Light Node: ein Daemon plus eine vollständige Management-CLI, gebaut für Server und Automatisierung. Die Binärdatei ist `lightnode-sx`. Dies ist die **v3.1.3**-Linie des Light Nodes für die vorgefertigten Binärdateien (Quell-Tag `v3.1.4` für Docker-Builds) — seine eigene Version, getrennt von der Chain-Version.

## Installation {#install}

Vorgefertigte Binärdateien sind der einfachste Weg — der Light-Node-Client läuft nativ auf **sechs Plattformen ohne native Abhängigkeiten**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) und Windows (amd64, arm64) — insgesamt 12 Binärdateien über die SX- und UX-Editionen hinweg. Jede Binärdatei ist etwa 11–12 MB groß — herunterladen und ausführen, keine separaten Bibliotheken zu installieren.

**Prüfe die Prüfsumme, bevor du sie ausführst.** Das Release-Manifest unter `https://download.qore.host/<net>/lightnode/latest.json` enthält einen `sha256`-Wert für jede Binärdatei, ein `checksums.url`, das auf eine `SHA256SUMS`-Datei über das gesamte Release verweist, sowie das eigene `checksums.sha256` dieser Datei. Verifiziere, was du heruntergeladen hast — das ist keine Randnotiz, sondern der Unterschied zwischen dem Ausführen der tatsächlich gebauten Binärdatei und dem Ausführen von irgendetwas, das an dieser URL gelandet ist:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Vergleiche unter Windows die Ausgabe von `certutil -hashfile lightnode-sx-<platform>.exe SHA256` mit dem Manifestwert. Beide Netzwerke liefern derzeit denselben v3.1.3-Build aus. Der Quellcode ist öffentlich unter `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

Du kannst die Binärdatei auch aus dem Quellcode bauen oder sie mit Docker ausführen.

### Aus dem Quellcode bauen

Der Light Node benötigt **Go 1.26.1**. Seine Post-Quantum-Kryptografie ist eine reine Go-Implementierung (kein CGO, keine native Bibliothek), sodass das Cross-Compiling für jede der sechs unterstützten Plattformen genauso funktioniert wie bei jeder anderen Go-Binärdatei:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Dies erzeugt `build/lightnode-sx`. Führe es direkt aus oder kopiere es in deinen `PATH`. Prüfe vor der Registrierung den Post-Quantum-Signatur-Stack mit [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Es gibt kein vorgefertigtes Registry-Image; du baust es aus dem Quell-Tag. Verwende Tag **`v3.1.4` oder neuer**: Das aus `v3.1.3` gebaute Image enthält einen älteren `qorechaind`-Signer, den die Chain inzwischen ablehnt, sodass seine Heartbeats und Belohnungsanforderungen fehlschlagen. Um eine bestehende Installation zu aktualisieren, baue aus dem neuen Tag neu (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); ein Pull bewirkt nichts.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Halte `QORECHAIN_RPC_ADDR` bei jedem `docker compose`-Befehl exportiert: Es überschreibt `rpc_addr` aus der Konfiguration, und der Compose-Standard zeigt auf `host.docker.internal:26657`. Der SX-Container speichert seine Daten dauerhaft in einem benannten Volume, das unter `/root/.qorechain-lightnode` eingehängt ist.

Das Image enthält außerdem ein veröffentlichtes `qorechaind` (v3.2.0, linux/amd64, beim Build aus dem Release-Kanal heruntergeladen und gegen einen fest hinterlegten Digest geprüft). Der Daemon steuert es, um Heartbeats und Belohnungsanforderungen zu signieren, sodass ein Container-Node ohne zweite Installation auf der Chain aktiv bleiben kann. Aktualisiert ein Netzwerk später auf eine Version, die den mitgelieferten Signer ablehnt, verweise `[heartbeat] qorechaind_path` auf das neuere `qorechaind`, das im Manifest dieses Netzwerks aufgeführt ist (`https://download.qore.host/<net>/latest.json`). Auf einem arm64-Host (zum Beispiel Apple Silicon) enthält der Build keinen Signer; baue mit `DOCKER_DEFAULT_PLATFORM=linux/amd64`, falls du einen benötigst. Der Signer braucht die Operator-Wallet: Binde dein `qorechaind`-Home (den Keyring mit dem Operator-Schlüssel sowie den exportierten Node-Schlüssel unter `pqc/<key_name>.dilithium`) unter `/root/.qorechaind` ein; `docker-compose.yml` bindet standardmäßig `~/.qorechaind` ein, oder setze `QORECHAIND_HOME`. Die beiden Passphrasen sind die des Node-Keyrings und die des `qorechaind`-Keyrings; die zweite wird `qorechaind` über stdin übergeben und erscheint nie in einer Kommandozeile. Siehe [Die Operator-Wallet](#operator-wallet).

## Konfiguration

Der Light Node liest eine TOML-Konfigurationsdatei. Standardmäßig sucht er nach `config.toml` im Home-Verzeichnis (`~/.qorechain-lightnode/config.toml`). Normalerweise schreibst du diese Datei nicht von Hand — der [`onboard`-Assistent](#first-run-onboard) erstellt sie für dich — aber es ist nützlich, die Optionen zu verstehen.

Zwei persistente Flags gelten für jeden Befehl:

- `--config <path>` — auf eine Konfigurationsdatei an einem nicht standardmäßigen Ort zeigen.
- `--home <dir>` — das für Daten und Schlüssel verwendete Home-Verzeichnis überschreiben (Standard ist `~/.qorechain-lightnode`).

Die relevantesten Konfigurationsoptionen auf Nutzungsebene:

| Option | Was sie steuert |
| --- | --- |
| `chain_id` | Der Netzwerk-Identifikator (zum Beispiel `qorechain-diana` im Testnet, `qorechain-vladi` im Mainnet). Setze ihn nach `onboard` selbst, das `qorechain-diana` stehen lässt; der Signer verwendet ihn. |
| `rpc_addr` | Der Chain-RPC-Endpunkt, mit dem sich der Daemon verbindet. Leer lassen, um im **Local-only-Modus** zu laufen. |
| `primary_addr` / `witness_addrs` | Der primäre RPC-Endpunkt und die Witness-Endpunkte, gegen die sein gemeldeter Header abgeglichen wird — siehe [Warum einen Light Node betreiben](/light-node/overview#why-run-a-light-node). Mindestens ein eigenständiger, erreichbarer Witness bewirkt, dass der Wert `assurance` (auf Debug-Level protokolliert) von `trusted-single-source` zu `corroborated-across-sources` wechselt. |
| `trust_period` / `max_clock_drift` | Aus Kompatibilitätsgründen akzeptiert, aber derzeit ungenutzt. Das Header-Vertrauen stammt aus dem oben beschriebenen Abgleich von Primary und Witnesses. |
| `data_dir` | Wo der Node seine Datenbank und Header speichert. |
| `keyring_backend` / `key_name` | Keyring-Backend (`file`, `os` oder `test`, nur für lokale Devnets) und der Name des Post-Quantum-Schlüssels des Nodes. Das `file`-Backend erfordert `QORE_LIGHTNODE_KEYRING_PASSPHRASE` in der Umgebung. |
| `operator_address` | Das Konto, zu dem dieser Node gehört (`qor1...`); wird beim Laden validiert. Erforderlich für `register`, `status` und Heartbeats. Siehe [Die Operator-Wallet](#operator-wallet). |
| `api_addr` | Der REST-Endpunkt. Wird bei leerem Wert aus `rpc_addr` abgeleitet (Port 26657 wird zu 1317; `rpc.`-Hosts werden zu `api.`), ist also nur für Endpunkte nötig, die keiner der beiden Konventionen folgen. |
| `[heartbeat]` | Standardmäßig aktiv. `qorechaind_path` (leer bedeutet `qorechaind` im `PATH`; das Docker-Image liefert es mit), `qorechaind_home` (leer bedeutet `~/.qorechaind`), `key_name` (der `qorechaind`-Kontoschlüssel; Standard ist der `key_name` der obersten Ebene), `interval_blocks` (an das `heartbeat_interval` der Chain angleichen, 1000), `check_interval` (Standard `60s`), `fees` (Standard `50000uqor`) und `gas` (Standard `300000`). |
| `[delegation]` | `auto_claim` (standardmäßig aus: fordert aufgelaufene Light-Node-Belohnungen über den Signer an die Operator-Wallet an; der Node delegiert vom Server aus nie neu), das Prüfintervall, die Mindestbelohnung für das Einfordern, `rebalance_enabled` und `min_reputation` (nur Reputationsalarme — der Node verschiebt nie Stake). `validators` und `split_weights` werden akzeptiert, derzeit aber nicht ausgewertet. |
| `[telemetry]` | Ob Telemetrie aktiviert ist und die Aktualisierungsintervalle für Validatoren, Netzwerk, Bridge und Tokenomics. |
| `log_level` / `log_format` | Logging-Ausführlichkeit (`debug`, `info`, `warn`, `error`) und Format (`text` oder `json`). |

### Umgebungsvariablen {#environment-variables}

| Variable | Verwendet für |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Passphrase des Node-Keyrings (`keyring_backend = "file"`). Erforderlich; der Node lehnt eine leere ab. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Passphrase des `qorechaind`-Keyrings mit dem Operator-Schlüssel; wird `qorechaind` über stdin übergeben, nie in einer Kommandozeile. |
| `QORECHAIN_RPC_ADDR` | Überschreibt `rpc_addr` (und `primary_addr`, wenn es `rpc_addr` entsprach). Wird von `docker-compose.yml` gesetzt. |

:::note Witness-Endpunkte werden beim Start validiert
Ein Witness auf demselben Host wie der Primary wird abgelehnt — ein kompromittierter Endpunkt würde sich einfach selbst bestätigen und damit nichts korroborieren. Ein Klartext-`http://`-Witness auf einem entfernten Host wird ebenfalls abgelehnt, da ein Angreifer, der diese Verbindung umschreiben kann, als jeder Witness gleichzeitig antworten könnte; Loopback-`http://` ist unbedenklich. Richte Witnesses auf RPC-Endpunkte, denen du aus unabhängigen Gründen vertraust.
:::

Die Delegations-Standardwerte aktivieren reputationsbewusste Rebalancing-Alarme und lassen `auto_claim` aus — siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring) dazu, was diese bewirken.

## Erster Start: `onboard` {#first-run-onboard}

Beim ersten Start stoppt `start` und verweist dich auf den Onboarding-Assistenten, falls noch keine Konfigurationsdatei existiert. Führe den Assistenten aus:

```bash
build/lightnode-sx onboard
```

`onboard` führt dich in vier Schritten durch die Einrichtung:

1. **PQC-Selbsttest** — führt den vollständigen Dilithium-5-Roundtrip aus (dieselben Prüfungen wie [`selftest`](#verify-the-pqc-stack-selftest)). Wenn der PQC-Stack fehlschlägt, verweigert der Assistent das Fortfahren.
2. **Chain-RPC-Endpunkt** — füge deine QoreChain-RPC-URL ein oder lasse sie leer, um im **Local-only-Modus** zu laufen, solange keine Chain-Verbindung benötigt wird. Wenn du eine URL angibst, testet der Assistent die Erreichbarkeit live.
3. **Node-Schlüssel** — der Assistent nennt ihn „privater Validator-Schlüssel“, aber es ist der eigene Dilithium-5-Schlüssel des Light Nodes, kein Validator-Schlüssel. Füge einen hex-kodierten privaten Dilithium-5-Schlüssel ein oder tippe `g` (oder `generate`), um auf diesem Node ein frisches Schlüsselpaar zu erzeugen.
4. **Speichern** — schreibt `config.toml` und legt den Schlüssel unter dem Namen `validator` im Keyring ab (oder `validator-<hex>`, falls dieser Name vergeben ist). Der File-Keyring benötigt dafür und für jeden späteren Befehl, der ihn öffnet, `QORE_LIGHTNODE_KEYRING_PASSPHRASE` in der Umgebung.

:::note Local-only-Modus
Wenn du den Endpunkt leer lässt, startet der Daemon im Local-only-Modus: Der PQC-Stack wird vollständig durchlaufen, aber der Node synchronisiert keine Chain. Führe `onboard` erneut aus, sobald dein Chain-Endpunkt bereit ist, um den Node darauf zu verweisen.
:::

`onboard` überschreibt immer die aktive Konfiguration. Verwende `--config`, um an einen nicht standardmäßigen Pfad zu schreiben, oder `--non-interactive`, um schnell fehlzuschlagen statt nachzufragen (nützlich in CI).

:::caution Konfiguration nach dem Onboarding fertigstellen
`onboard` weiß nicht, welchem Netzwerk du beitrittst oder welches Konto dir gehört. Bearbeite `config.toml`, bevor du `register` ausführst oder dich auf Heartbeats verlässt:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` auf oberster Ebene ist der Post-Quantum-Schlüssel des Nodes (seine Datei ist `pqc/<key_name>.dilithium` im `qorechaind`-Home); `[heartbeat] key_name` ist der `qorechaind`-Kontoschlüssel, der die Gebühr zahlt. Wenn du `key_name = "operator"` stehen lässt, während der Schlüssel `validator` heißt, bricht `register` mit `node key "operator" not found` ab.
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

Der Dilithium-5-Schlüssel des Nodes ist **keine** Wallet. Auf QoreChain wird ein Post-Quantum-Schlüssel an ein Konto angehängt; er erzeugt keines. Deshalb zeigt `keys list` dafür keine Adresse an. Deine **Operator-Adresse** ist ein gewöhnliches, finanziertes `qor1…`-Konto, das mit `qorechaind` erstellt wird, von dem aus der Node registriert wird und das die Light-Node-Belohnungen erhält. Der Node-Schlüssel wird zum Post-Quantum-Schlüssel dieses Kontos.

Richte sie einmalig ein:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` gibt, mit deinen Werten ausgefüllt, Folgendes aus: den Befehl `qorechaind tx pqc register-key-v2 dilithium5 … hybrid`, der den Node-Schlüssel an das Konto anhängt (einmalig), sowie das Paar `tx lightnode register … --generate-only` und `tx pqc cosign`, das den Node registriert. Die Chain verlangt bei jeder Transaktion die Post-Quantum-Mitsignatur, weshalb die Registrierung aus zwei Befehlen statt einem besteht. Die Registrierung erfordert außerdem eine aktive `lightnode_operator`-Lizenz auf der Operator-Adresse; ohne sie lehnt die Chain die Transaktion ab. Die Registrierung ist noch nicht offen: siehe [Status des Belohnungsprogramms](/light-node/overview#reward-program-status).

## Management-Befehle

Die SX-CLI enthält Befehle zum Einsehen des Node-Zustands und zur Schlüsselverwaltung:

| Befehl | Zweck |
| --- | --- |
| `onboard` | Interaktiver Assistent für den ersten Start. |
| `start` | Den Daemon ausführen. |
| `selftest` | Den PQC-Selbsttest ausführen. |
| `status` | Node- und Light-Client-Sync-Status anzeigen (Chain-ID, neueste Höhe, Aufhol-Status) sowie die Zeilen `Signer`, `Operator`, `Licence` und `Registration`. |
| `keys create <name>` | Einen neuen Dilithium-5-Node-Schlüssel erstellen und seinen öffentlichen Schlüssel ausgeben. |
| `keys list` | Schlüssel im Keyring auflisten (Name, Typ, ggf. Adresse, öffentlicher Schlüssel). |
| `keys show <name>` | Typ und vollständigen öffentlichen Schlüssel eines Schlüssels ausgeben. |
| `keys import <name> <hex-privkey>` | Einen hex-kodierten privaten Schlüssel importieren. |
| `keys export <name>` | Einen privaten Schlüssel im Hex-Format exportieren (dasselbe Format, das `qorechaind` aus `~/.qorechaind/pqc/` liest). |
| `register` | Die Chain-Befehle ausgeben, die den Node-Schlüssel an dein Operator-Konto anhängen und den Node registrieren — siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing). |
| `validators` | Gebundene (bonded) Validatoren auflisten. |
| `delegation` | Aktuelle Delegationen aus der lokalen Datenbank anzeigen (siehe die bekannte Einschränkung in [Belohnungen und Überwachung](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Ausstehende Staking-Belohnungen anzeigen (dieselbe Einschränkung). |
| `network` | Netzwerk-Telemetrie (kürzlich synchronisierte Header) aus der lokalen Datenbank anzeigen. |
| `version` | Die Version der Binärdatei ausgeben. |

Für Details zu Staking, Belohnungen und Überwachung siehe [Belohnungen und Überwachung](/light-node/rewards-and-monitoring). Zum On-Chain-Registrieren siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing).
