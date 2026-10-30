---
slug: /qorel/configuration
title: QORel Konfiguration
sidebar_label: Konfiguration
sidebar_position: 5
---

# Konfiguration

QORel liest eine TOML-Datei (standardmäßig `~/.hermes/config.toml` oder den mit `--config` angegebenen Pfad). Für jede Chain, die auf die übliche Weise signiert, entspricht die Datei genau der Hermes-Konfiguration; der [Hermes-Leitfaden](https://hermes.informal.systems) beschreibt jede Einstellung. Diese Seite behandelt, was QORel hinzufügt: den QoreChain-Chain-Eintrag, die Post-Quanten-Schlüssel, die Gas-Einstellungen und die Prüfungen, die vor dem Senden einer Transaktion laufen. Sie richtet sich an Betreiber, die eine QORel-Konfiguration schreiben oder prüfen.

## Innovationen {#innovations}

- **`signing` pro Chain.** `'qorechain-hybrid'` fügt jeder Transaktion, die QORel an diese Chain sendet, die ML-DSA-87-Signatur hinzu; `'standard'` (Standardwert) ist Byte für Byte Hermes. Gemischte Konfigurationen funktionieren: ein Prozess, je eine Chain von jeder Art.
- **Sign-Bytes-Version von der Chain gelesen.** Mit `pqc.sign_bytes = 'auto'` liest QORel die angewendeten Upgrade-Einträge der Chain, signiert die passende Form, liest sie jede Minute und nach jeder Ablehnung neu und erfindet nie eine Version.
- **Gaspreis aus dem Fee-Market.** `dynamic_gas_price` mit `backend = 'cosmos-evm-feemarket'` folgt der Basisgebühr von QoreChain (Untergrenze 0,1 uqor pro Gas).
- **Eine Konfiguration, die unsichere Kombinationen ablehnt.** Statische `extension_options` zusammen mit hybridem Signieren werden beim Laden abgelehnt, weil die Post-Quanten-Signatur die einzige kritische Erweiterungsoption sein muss.

## Verwendung {#how-to-use}

### Der QoreChain-Chain-Eintrag {#chain-entry}

Dies ist der Testnet-Eintrag aus der Beispielkonfiguration. Ersetzen Sie die Node-Adressen durch Ihren eigenen Testnet-Node:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

Die QoreChain-spezifischen Einstellungen:

| Einstellung | Wert | Wirkung |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Fügt jeder an diese Chain gesendeten Transaktion die ML-DSA-87-Signatur (FIPS 204) hinzu. Lassen Sie sie weg oder verwenden Sie `'standard'` für jede andere Chain. |
| `account_prefix` | `'qor'` | Das Adresspräfix von QoreChain-Konten. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | Die Gebühren-Untergrenze beträgt 0,1 uqor pro Gas. |
| `gas_multiplier` | `1.1` | Multipliziert das simulierte Gas zum Gaslimit. Siehe [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Liest die Basisgebühr des Fee-Markets der Chain, statt nur `gas_price` zu verwenden. |
| `pqc.sign_bytes` | `'auto'` (Standardwert), `'v1'` oder `'v2'` | `auto` liest die Sign-Bytes-Version von der Chain; `v1` und `v2` erzwingen eine Form. Belassen Sie es bei `auto`. |
| `pqc.sign_mode` | `'hedged'` (Standardwert) oder `'deterministic'` | Randomisiertes oder deterministisches ML-DSA-Signieren. Die Chain akzeptiert beides. |
| `pqc.include_public_key` | `false` (Standardwert) | Ob der öffentliche Schlüssel in jede Signaturerweiterung eingebettet wird. Das registriert den Schlüssel nicht; das tut nur `keys register-pqc`. |

Die öffentlichen Lese-Endpunkte des QoreChain-Testnets sind unter [Verbindung zum Testnet](/getting-started/connecting-to-testnet) aufgeführt. Ein Relayer braucht außerdem gRPC, das nicht öffentlich ist, betreiben Sie daher für die QoreChain-Seite Ihren eigenen Node.

### Jede andere Cosmos-SDK-Chain {#other-chains}

Schreiben Sie den Eintrag wie für Hermes und lassen Sie `signing` weg. Dies ist der Eintrag für das öffentliche Testnet des Cosmos Hub aus der Beispielkonfiguration:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Diese Endpunkte gehören einem Dritten, sind öffentlich und können ratenbegrenzt sein. Verwenden Sie für dauerhaftes Relaying Ihre eigenen Nodes.

### Globale Einstellungen {#global}

Die Beispielkonfiguration verwendet diese Einstellungen, die von Hermes stammen:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` hält die Light-Clients aktuell und beobachtet Fehlverhalten; `mode.packets` relayt Pakete und räumt ausstehende alle `clear_interval` Blöcke und beim Start ab. Die Handshakes für Verbindungen und Kanäle bleiben den `create`-Befehlen überlassen. Der Telemetrie-Port ist unter [Monitoring](/qorel/monitoring) beschrieben.

### Schlüssel {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (oder `--key-file` mit einer Schlüsseldatei, die die Mnemonic enthält) speichert den secp256k1-Schlüssel wie Hermes und leitet auf einer Hybrid-Chain den ML-DSA-87-Schlüssel mit der QoreChain-Wallet-Ableitung aus derselben Mnemonic und demselben Konto ab. Nur dessen 32-Byte-Seed wird neben dem Schlüssel als `<key name>.pqc` gespeichert. Es wird nichts Geheimes ausgegeben. Die Ableitung beschreibt [Schlüsselableitung](/qoresign/guides/key-derivation).
- `keys register-pqc` sendet einmalig `MsgRegisterPQCKeyV2`. Es ist die einzige Transaktion, die QoreChain allein mit der klassischen Signatur akzeptiert, und sie trägt auf Netzwerken ab v3.2.3 einen Besitznachweis (Proof of Possession). Sie ist idempotent und sendet nicht, wenn das Konto bereits einen anderen Schlüssel hat. Was die Chain prüft, steht unter [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration).
- `keys pqc-status` zeigt, ob der Schlüssel registriert ist, mit dem lokalen Schlüssel übereinstimmt, durch einen Besitznachweis belegt wurde und welche Sign-Bytes die Chain prüft. `ready_to_relay` muss `true` sein.
- Verwenden Sie ein eigenes Relayer-Konto mit kleinem Guthaben, nie den Operator-Schlüssel eines Validators.
- Schlüsseldateien (`<key name>.json` und `<key name>.pqc`) werden nur für den Besitzer lesbar (0600) geschrieben. Das ursprüngliche Hermes verwendete die Standard-umask; mit einem älteren Hermes hinzugefügte Schlüssel behalten ihren alten Modus, prüfen Sie sie daher mit `ls -l`.

### Gas {#gas}

QoreChain berechnet die gesamte Gebühr (Gaslimit mal Preis) ohne Rückerstattung, halten Sie den Multiplikator daher knapp.

- Auf Chain v3.2.5 und später (die folgende Messung wurde im Testnet mit v3.2.6 vorgenommen; das Mainnet hat v3.2.5 am 29. Oktober 2026 angewendet, aber QORel hat dort noch nicht relayt) stimmt die Simulation mit der Ausführung bis auf wenige hundert Gas überein. Der lokale End-to-End-Test auf einem Build dieser Linie besteht mit `1.05` (jede Relay-Transaktion verbrauchte 95 % ihres Limits).
- Frühere Builds melden etwa 8 bis 10 % zu wenig (gemessen auf einem Pre-Release-Devnet, wo `1.15` 4 bis 7 % Spielraum ließ). Verwenden Sie `1.15`, bis Sie Ihre eigenen Nodes gemessen haben.
- `health-check` meldet jeden Multiplikator unter `1.1` bei einem QoreChain-Eintrag als mögliche Fehlkonfiguration. Das ist eine Warnung, und das Relaying funktioniert weiter. `1.1`, der Wert in der Beispielkonfiguration, hält die Meldung für etwa 5 % mehr Gebühr als `1.05` sauber.
- Die einmalige Transaktion `keys register-pqc` verwendet mindestens `1.1`, was auch immer die Konfiguration sagt.
- Jede Hybridsignatur fügt der Transaktion etwa 4,7 KB und für die Prüfung 2.000 Gas hinzu; die Simulation berücksichtigt beides.

### Sicherheitsprüfungen vor jedem Senden {#safety-checks}

Vor jeder Transaktion an eine Hybrid-Chain prüft QORel, dass der Post-Quanten-Schlüssel geladen, on-chain registriert und mit dem lokalen identisch ist und dass die Sign-Bytes-Version bekannt ist. Schlägt eine Prüfung fehl, sendet es nichts (es fällt keine Gebühr an) und `health-check` meldet den Grund. Eine Ablehnung durch die Chain mit Codespace `pqc` Code 21 veranlasst QORel, vor der nächsten Transaktion die Version und die Registrierung neu zu lesen.

### Hinweise für ibc-go-v10-Chains {#ibc-go-v10}

- Die ICS-29-Fee-Middleware gibt es in ibc-go v10 nicht mehr; Gebühren sind der Gaspreis, ein Fee-Granter und die dynamische Basisgebühr.
- ibc-go v10 legt den Header nicht mehr in `update_client`-Events ab. QORel liest ihn stattdessen aus der `MsgUpdateClient`-Transaktion, sodass die Erkennung von Fehlverhalten weiter funktioniert (das Standard-Hermes 1.13 schaltet sie auf diesen Chains ab).

### Ratenbegrenzte Endpunkte {#rate-limits}

Öffentliche Endpunkte beantworten Lastspitzen oft mit `429 Too Many Requests`, zum Beispiel direkt nach dem Start des Relayers. Hermes behandelt diese als wiederholbar, doch seine Paket-Worker beenden sich auch nach `clear_interval x 5` Blöcken ohne neue IBC-Events, selbst wenn die letzte Clearing-Runde fehlgeschlagen ist; ein Paket, das in diesem Moment ausstehend war, wartete bis zum nächsten Paket auf dem Kanal oder bis zu einem Neustart. QORel hält die Paket-Worker eines Kanals aktiv, solange ein Relay- oder Clearing-Versuch fehlgeschlagen ist, und versucht es bei jedem Clear-Intervall erneut. Sie beenden sich wegen Leerlaufs erst, nachdem eine Clearing-Runde erfolgreich war. Bevorzugen Sie für produktives Relaying Ihre eigenen Nodes oder einen kostenpflichtigen Endpunkt und richten Sie Alarme auf ausstehende Pakete ein ([Monitoring](/qorel/monitoring)).

## Zugang {#how-to-access}

- **Wo die Datei liegt.** `~/.hermes/config.toml` bei einer Tarball- oder Homebrew-Installation, `/etc/qorel/config.toml` bei `.deb` und `.rpm` und das eingebundene Verzeichnis beim Container. Überschreiben Sie dies mit `--config <path>`.
- **Schlüsselspeicher.** `key_store_folder` legt fest, wo Schlüssel liegen; der Standard ist `~/.hermes/keys`, die Pakete verwenden `/var/lib/qorel/keys`.
- **Voraussetzungen.** RPC-, gRPC- und WebSocket-Endpunkte für jede Chain und ein mit Guthaben ausgestattetes Relayer-Konto auf jeder.
- **Konfiguration prüfen.** `qorel health-check` lädt die Datei und testet jede Chain.

## Wo es veröffentlicht ist {#where-published}

| Was | Wo |
|---|---|
| Beispielkonfiguration (Testnet, QoreChain und öffentliches Testnet des Cosmos Hub) | `packaging/config.example.toml` in [qorechain/QORel](https://github.com/qorechain/QORel); von den Paketen unter `/etc/qorel/config.example.toml` installiert |
| Hermes-Konfigurationsreferenz | [hermes.informal.systems](https://hermes.informal.systems) |

## Grenzen und bekannte Probleme {#limits}

- **Statische `extension_options` werden abgelehnt** bei einer Chain mit `signing = 'qorechain-hybrid'`.
- **Belassen Sie `pqc.sign_bytes` bei `auto`.** Ein festes `v1` oder `v2`, das nicht dem entspricht, was die Chain prüft, führt dazu, dass die Chain jede Transaktion ablehnt.
- **Schlüsselmodus bei älteren Schlüsseln.** Von einem älteren Hermes geschriebene Dateien behalten ihre alten Berechtigungen.
- **Endpunkte von Dritten.** Die Endpunkte der Hub-Seite in der Beispielkonfiguration werden nicht von QoreChain betrieben und können sich ändern oder ratenbegrenzt sein.
- **Nur Testnet-Eintrag.** Der QoreChain-Eintrag hier gilt für `qorechain-diana`. Das Mainnet ist für IBC nicht geöffnet.
