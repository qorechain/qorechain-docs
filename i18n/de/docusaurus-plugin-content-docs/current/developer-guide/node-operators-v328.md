---
slug: /developer-guide/node-operators-v328
title: "Node-Betreiber: Checkliste für v3.2.8"
sidebar_label: Node-Betreiber v3.2.8
sidebar_position: 11
---

# Node-Betreiber: Checkliste für v3.2.8

Das Release **v3.2.8** läuft seit dem 12. November 2026 (Höhe 9,929,500) im Testnet `qorechain-diana`. Das Mainnet `qorechain-vladi` läuft seit dem 12. November 2026 mit v3.2.7 (Höhe 4,164,600, Governance-Vorschlag 16) und hat v3.2.8 nicht angewendet, sodass nichts auf dieser Seite heute für einen Mainnet-Node gilt.

Diese Seite ist die kurze Liste dessen, was ein Node-Betreiber für v3.2.8 prüft und ändert: die gemeinsam genutzten Bibliotheken im Bundle, die Einstellungen der Contract-Laufzeitumgebung, die neuen `app.toml`-Standardwerte, eine neue REST-Route und die Schritte, um einen Node zu aktualisieren, der noch auf v3.2.7 läuft. Den vollständigen Node-Leitfaden finden Sie unter [Einen Node betreiben](/developer-guide/running-a-node).

**Warum das wichtig ist.** v3.2.8 führt Smart Contracts in einer neuen Contract-Laufzeitbibliothek aus und berechnet den Speicher und das Code-Laden, die ein Contract-Aufruf nutzt. Ein Node, der den alten Bibliotheksordner behält oder mit zu wenig Contract-Speicher läuft, startet nicht oder fällt zurück. Der Rest der Checkliste ist kleine Konfigurationsarbeit.

## 1. Den ganzen Ordner `lib/` kopieren {#lib-folder}

Das Release-Bundle enthält `qorechaind` und einen Ordner `lib/` mit vier gemeinsam genutzten Bibliotheken:

| Bibliothek | Rolle |
| --- | --- |
| `libqorepqc.so` | Verifikation von Post-Quanten-Signaturen |
| `libqoresvm.so` | SVM-Laufzeitumgebung |
| `libwasmvm.x86_64.so` | Contract-Laufzeitbibliothek (Upstream) |
| `libwasmvmqore_v1.x86_64.so` | Neu in v3.2.8: die Contract-Laufzeitbibliothek von QoreChain |

Kopieren Sie den **ganzen Ordner**, nicht einzelne Dateien. Eine Zeile `COPY lib/ ...` in einem Dockerfile oder ein `cp -r lib/* ...` auf einem Bare-Metal-Host funktioniert weiter, wenn ein späteres Release eine Bibliothek hinzufügt; eine Liste benannter Dateien nicht.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Richten Sie den Loader auf den Ordner, in den Sie kopiert haben (den Eintrag `LD_LIBRARY_PATH` oder `ld.so.conf.d`, den Sie bereits verwenden), und starten Sie neu. Die obigen Befehle sind ein Muster; verwenden Sie die Pfade Ihrer eigenen Installation.

## 2. Contract-Speichercache: mindestens 256 MiB {#memory-cache}

Die Contract-Laufzeitumgebung hält kompilierte Contracts im Speicher. In der `app.toml` muss die Einstellung `memory_cache_size` im Abschnitt `[wasm]` **256 MiB oder mehr** betragen:

```toml
[wasm]
memory_cache_size = 256
```

Ein Wert unter 256 wird beim Start des Nodes auf 256 angehoben, und der Node protokolliert eine Warnung. Planen Sie auf kleinen Maschinen den zusätzlichen Speicher ein.

## 3. Das Contract-Verzeichnis ist jetzt `<home>/wasm` {#wasm-directory}

Kompilierter Contract-Code liegt jetzt in `<home>/wasm`, wobei `<home>` das Verzeichnis ist, mit dem Sie den Node starten (`--home`). Ein Node, dessen Contract-Code noch am alten Ort liegt, verwendet ihn weiter und protokolliert eine Warnung. Sie können den Ordner verschieben, wenn es passt; stoppen Sie den Node zuvor.

## 4. Neue `app.toml`-Standardwerte {#app-toml-defaults}

Ein mit v3.2.8 initialisierter Node schreibt diese Standardwerte. Bestehende `app.toml`-Dateien werden **nicht neu geschrieben**; ein aktualisierter Node behält also seine alten Werte, bis Sie sie ändern.

| Einstellung | Neuer Standard | Was sie bewirkt |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Gaslimit für simulierte Transaktionen auf diesem Node. Wallets und SDKs simulieren vor dem Senden, und das hohe Limit erlaubt es, große Contract-Aufrufe zu simulieren |
| JSON-RPC-Namespaces in `api` | `eth,net,web3` | Der Namespace `txpool` wird standardmäßig nicht bereitgestellt, weil er die ausstehenden Transaktionen des Nodes veröffentlicht. Fügen Sie `txpool` nur hinzu, wenn Sie es brauchen |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Gaslimit für Abfragen {#query-gas-limit}

Contract-Abfragen laufen unter einem node-lokalen Gaslimit, das der Abschnitt `[wasm]` der `app.toml` steuert. Das Chain-Team empfiehlt, es auf Validatoren auf `0` (kein Limit) zu setzen:

```toml
[wasm]
query_gas_limit = 0
```

Diese Einstellung ändert nur, was Ihr eigener Node auf Contract-Abfragen antwortet; sie ändert nicht, was ein Block enthalten muss. Es ist die Empfehlung des Chain-Teams für Validatoren; ein Node, der öffentliche Abfragen bedient, bevorzugt vielleicht ein endliches Limit.

## 6. Neue Route: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8 fügt eine schreibgeschützte Route für die Parameter des SVM-Moduls hinzu. Sie wird von Nodes mit v3.2.8 (Testnet) bedient und antwortet im Mainnet, wo das Release nicht angewendet ist, mit HTTP `501`.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Antwort aus dem Testnet vom 12. November 2026:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Feld | Bedeutung |
| --- | --- |
| `enabled` | Ob die SVM-Transaktions-Lane offen ist. Seit dem Upgrade im Testnet `false`, SVM-Schreibzugriffe werden also abgelehnt, bis die Governance sie wieder öffnet |
| `max_program_size`, `max_account_data_size` | Größengrenzen in Bytes (jeweils 10,485,760) |
| `compute_budget_max` | Größtes Compute-Budget, das eine Transaktion anfordern kann (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Eingangsgrößen des Speicherpreises |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Versatz der Slot-Nummerierung, Standard-Signaturschema und die Grenze der Aufruftiefe zwischen Programmen |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Grenzen für das native QOR, das ein SVM-Konto halten kann, in uqor |

Lesen Sie `enabled`, bevor Sie eine SVM-Senden-Schaltfläche anzeigen; siehe [SVM-Entwicklung](/developer-guide/svm-development). Die Route `GET /qorechain/svm/v1/cluster_info` ist eine eigene Route, die die Cluster-Identität liefert.

## 7. Das Manifest prüfen {#manifest}

Das Manifest ist die maßgebliche Quelle dafür, welche Binärdatei zu installieren ist:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

Am 12. November 2026 antwortete es mit `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` und der Binärdatei `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Prüfen Sie, dass `version` gleich `minCompatible` ist, bevor Sie `binary.url` vertrauen, und verifizieren Sie das Archiv anhand des `sha256` in derselben Datei. Das Mainnet-Manifest liegt unter `https://download.qore.host/mainnet/latest.json` und nennt v3.2.6, bis ein Mainnet-Upgrade angekündigt wird.

## 8. Einen Node aktualisieren, der noch auf v3.2.7 läuft {#upgrade-from-v327}

Die Upgrade-Höhe des Testnets ist überschritten, ein Node auf v3.2.7 hält daher bei Höhe 9,929,500 mit `UPGRADE "v3.2.8" NEEDED` an. Sein Zustand bleibt erhalten, und er muss nicht neu synchronisieren.

1. Laden Sie das im Manifest genannte Archiv herunter und verifizieren Sie dessen SHA-256.
2. Stoppen Sie den Node.
3. Ersetzen Sie `qorechaind` und kopieren Sie den ganzen Ordner `lib/` ([Schritt 1](#lib-folder)).
4. Prüfen Sie `[wasm] memory_cache_size` ([Schritt 2](#memory-cache)) und entscheiden Sie über `simulation_gas_limit`, die JSON-RPC-Namespaces und `query_gas_limit` ([Schritte 4 und 5](#app-toml-defaults)).
5. Starten Sie den Node und beobachten Sie das Log. Eine Warnung zum Contract-Verzeichnis oder zum Speichercache ist zu erwarten, wenn Sie sie noch nicht geändert haben.
6. Bestätigen Sie, dass er der Chain folgt:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Ein neuer Node, der dem Testnet beitritt, startet direkt mit der v3.2.8-Binärdatei; siehe [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet) für State Sync und Peers und [Einen Node betreiben](/developer-guide/running-a-node#upgrades) für die Upgrade-Historie.

## Grenzen und Fehler

| Was Sie sehen | Bedeutung | Was zu tun ist |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` und der Node hält bei Höhe 9,929,500 an | Der Node läuft noch mit der Binärdatei v3.2.7 | Abschnitt 8 |
| Startfehler wegen einer fehlenden gemeinsam genutzten Bibliothek | `lib/` wurde nicht vollständig kopiert, oder der Loader zeigt nicht darauf | Abschnitt 1 |
| Warnung, dass `memory_cache_size` angehoben wurde | Der konfigurierte Wert liegt unter 256 MiB | 256 oder mehr setzen |
| Warnung zum Contract-Verzeichnis | Der Contract-Code liegt noch am alten Ort | Bei Gelegenheit nach `<home>/wasm` verschieben |
| `501` von `/qorechain/svm/v1/params` | Der Node läuft nicht mit v3.2.8 (das Mainnet läuft mit v3.2.7) | Im Mainnet erwartet |

## Verwandte Seiten

* [Einen Node betreiben](/developer-guide/running-a-node), einschließlich [Contract-Laufzeitumgebung in v3.2.8](/developer-guide/running-a-node#v328-node)
* [Einen Validator betreiben](/developer-guide/running-a-validator)
* [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet)
* [REST- und gRPC-Endpunkte](/api-reference/rest-grpc-endpoints)
