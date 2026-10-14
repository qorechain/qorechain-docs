---
slug: /cli-reference/transaction-commands
title: Transaktionsbefehle
sidebar_label: Transaktionsbefehle
sidebar_position: 2
---

# Transaktionsbefehle

Alle Transaktionsbefehle folgen dem Muster:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Setzen Sie `--chain-id qorechain-vladi`, um gegen das Live-Mainnet zu broadcasten, oder `--chain-id qorechain-diana` für das Testnet. Beide Netzwerke laufen auf der v3.2-Linie (Node-Release des Mainnets **v3.2.1**, Testnet **v3.2.2**; das aktuelle Release finden Sie in `latest.json` unter [download.qore.host](https://download.qore.host)). Wird `--chain-id` weggelassen, verwendet der Client die `chain-id` aus Ihrer lokalen Client-Konfiguration.
:::

Die folgenden allgemeinen Flags gelten für jeden `tx`-Unterbefehl:

| Flag                | Typ    | Beschreibung                                                   |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Name oder Adresse des Signaturschlüssels                       |
| `--chain-id`        | string | Chain-Kennung (Standard: aus der Client-Konfiguration)         |
| `--fees`            | string | Transaktionsgebühr, z. B. `40000uqor`                          |
| `--gas-prices`      | string | Gaspreis anstelle von `--fees`, z. B. `0.1uqor`                |
| `--gas`             | string | Gas-Limit oder `auto` zur Schätzung (Standard `200000`)        |
| `--gas-adjustment`  | float  | Multiplikator, der auf die `auto`-Schätzung angewendet wird (Standard `1`) |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` oder `memory`          |
| `--node`            | string | RPC-Endpunkt (Standard `tcp://localhost:26657`)                |
| `--broadcast-mode`  | string | `sync` oder `async`                                            |
| `--generate-only`   | bool   | Die unsignierte Transaktion ausgeben, statt sie zu signieren   |
| `-y`                | bool   | Bestätigungsabfrage überspringen                               |

---

## Gebühren und Gas {#fees-and-gas}

Die Netzwerk-Gebührenuntergrenze beträgt **0.1 uqor pro Gas-Einheit** (`query feemarket params` zeigt `min_gas_price`; die aktuelle Basisgebühr kann unter Last über die Untergrenze steigen, siehe `query feemarket base-fee`). Eine Transaktion wird abgelehnt, sofern nicht `fee >= gas limit x gas price` gilt; `--fees 500uqor` funktioniert daher nur bei einem Gas-Limit von höchstens 5,000 und schlägt bei jeder realen Transaktion fehl.

| Transaktion                                   | Empfohlenes `--gas` | Passendes `--fees` |
| --------------------------------------------- | ------------------- | ------------------ |
| Hybrid signierte Überweisung, Delegation, Abstimmung, Claim | `400000`            | `40000uqor`        |
| Registrierung eines PQC-Schlüssels            | `600000`            | `60000uqor`        |
| `lightnode register`                          | `300000`            | `30000uqor`        |

Eine hybride Signatur fügt einer Transaktion etwa 4.7 KB hinzu, die mit 10 Gas pro Byte berechnet werden; das Standard-`--gas 200000` reicht daher nicht immer aus: Hybrid signierte Überweisungen im Mainnet haben zwischen etwa 160,000 und 240,000 Gas verbraucht. Setzen Sie `--gas` stets explizit zusammen mit `--fees` (oder `--gas-prices`).

---

## Hybride Signatur ist auf dem Cosmos-Pfad erforderlich {#hybrid-signing}

`hybrid_signature_mode` steht in beiden Netzwerken auf `required` (`qorechaind query pqc hybrid-mode`). Jede Transaktion auf dem Cosmos-Pfad muss neben der secp256k1-Signatur eine ML-DSA-87-Signatur (Dilithium-5) tragen; ein einfaches `tx bank send ... -y` wird abgelehnt. Die einzigen Ausnahmen sind die Registrierung und Migration von PQC-Schlüsseln (damit ein neues Konto seinen ersten Schlüssel registrieren kann) sowie `tx slashing unjail` für ein Konto ohne registrierten PQC-Schlüssel.

Jeder Befehl auf dieser Seite außer `pqc register-key`, `pqc register-key-v2` und `pqc migrate-key` wird deshalb in zwei Schritten ausgeführt: Erstellen Sie die Transaktion mit `--generate-only` und signieren und broadcasten Sie sie dann mit `tx pqc cosign`:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Der Schlüsselname `mypqc` steht für einen mit `tx pqc gen-key` erzeugten Schlüssel, der für das Konto registriert ist (siehe [pqc](#pqc)). Verwenden Sie dafür das offizielle Release-Binary von [download.qore.host](https://download.qore.host): Ein aus dem öffentlichen Quellbaum gebautes Binary kann keine Dilithium-Signatur erzeugen oder anwenden (`gen-key` und `cosign` melden, dass sie den vollständigen Build benötigen). [QoreX](/qorex/overview) und die SDKs übernehmen dieselbe Signierung für Sie.

---

## bank

### send

Token von einem Konto auf ein anderes übertragen.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Beispiel: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, anschließend `tx pqc cosign` wie oben gezeigt. 1 QOR = 1,000,000 uqor.

---

## staking

### create-validator

Einen Validator aus einer JSON-Datei erstellen (die Flag-basierte Form wurde entfernt). Im Mainnet sind zusätzlich eine aktive `validator_operator`-Lizenz und ein registrierter PQC-Schlüssel erforderlich; siehe [Running a Validator](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Beschreibung oder Provision eines bestehenden Validators bearbeiten.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Flags: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Weggelassene Felder bleiben unverändert.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Einen laufenden Unbonding-Eintrag abbrechen.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Einen inhaftierten (jailed) Validator nach Ablauf der Jail-Dauer in das aktive Set zurückführen.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Alle ausstehenden Staking-Belohnungen abheben.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Belohnungen von einem Validator abheben.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Typ  | Beschreibung                                             |
| -------------- | ---- | -------------------------------------------------------- |
| `--commission` | bool | Zusätzlich die Provision abheben (Operator-Adressen von Validatoren) |

---

## gov

### submit-proposal

Einen Governance-Vorschlag aus einer JSON-Datei mit `messages`, `metadata`, `deposit`, `title`, `summary` und optional `expedited` einreichen. Ein Grundgerüst erzeugen Sie mit `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Abstimmungsoptionen: `yes`, `no`, `abstain`, `no_with_veto`. Mit `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` lässt sich eine Stimme aufteilen.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Einen Dilithium-5-Schlüssel (ML-DSA-87) erzeugen und unter `<home>/pqc/<name>.dilithium` speichern (Modus `0600`, **nicht verschlüsselt**). Der öffentliche Schlüssel wird als Hex ausgegeben.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

Einen öffentlichen PQC-Schlüssel für Ihr Konto registrieren (Legacy-Befehl: der Algorithmus ist Dilithium-5). Wird nur mit dem klassischen Schlüssel signiert; dies ist die Bootstrap-Ausnahme.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` ist `hybrid` (empfohlen), `pqc_only` oder `classical_only`. Der 2,592 Byte große öffentliche Schlüssel macht die Registrierung teurer als eine Überweisung; deshalb ist das höhere Gas-Limit nötig.

### register-key-v2

Einen Schlüssel mit expliziter Algorithmusauswahl registrieren.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` ist `dilithium5` (oder `1`) oder `mlkem1024` (oder `2`).

### cosign

Eine unsignierte Transaktion mit dem PQC-Schlüssel und dem klassischen Schlüssel des Kontos signieren und anschließend broadcasten.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Flag           | Beschreibung                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Name des mit `gen-key` oder `recover-key` erzeugten Schlüssels                                    |
| `--sign-bytes` | `auto` (Standard: fragt die Chain, welche Sign-Bytes-Form gilt), `v1` oder `v2`                   |
| `--generate-only` / `--offline` | Die signierte Transaktion als JSON ausgeben, statt sie zu broadcasten; später mit `tx broadcast` absenden; `--offline` benötigt zusätzlich `--account-number`, `--sequence` und `--sign-bytes v1\|v2` |
| `--dry-run`    | Simulieren und die Gas-Schätzung ausgeben                                                         |

Beide Netzwerke haben das Upgrade eingespielt, das die hybride Verifikation auf die v2-Sign-Bytes umgestellt hat; die v1-Form wird abgelehnt.

### migrate-key

Den PQC-Schlüssel Ihres Kontos von einem Algorithmus auf einen anderen migrieren. Für Ihren aktuellen Algorithmus muss eine Migration aktiv sein (von der Governance gestartet); beide Schlüssel signieren die Migrations-Bytes.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

Den ML-DSA-87-Schlüssel des Kontos aus seiner BIP-39-Mnemonic rekonstruieren (von stdin gelesen) und lokal speichern. Verwendet `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Typ    | Beschreibung                                                               |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (kanonisch, Standard) oder `bridge` (Legacy: `SHAKE-256(mnemonic)`) |

### rotate-key

Den ML-DSA-87-Schlüssel des Kontos innerhalb desselben Algorithmus rotieren. Liest die Mnemonic von stdin, signiert doppelt mit dem alten und dem neuen Schlüssel, cosigniert mit dem alten Schlüssel und broadcastet.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Flag               | Typ    | Beschreibung                                                                         |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Ableitung des derzeit registrierten Schlüssels: `bridge` (Standard) oder `adapter`   |
| `--new-derivation` | string | Ableitung des neuen Schlüssels: `adapter` (Standard) oder `bridge`                   |
| `--new-random`     | bool   | Auf einen frischen Zufallsschlüssel rotieren; erfordert `--new-key-out`              |
| `--new-key-out`    | string | Den neuen privaten Schlüssel als `<home>/pqc/<name>.dilithium` speichern, bevor etwas gesendet wird |
| `--sign-bytes`     | string | `auto` (Standard), `v1` oder `v2`                                                    |

### open-evm-window

Der EVM-Pfad lässt eine Transaktion nur von einem Konto zu, das einen registrierten PQC-Schlüssel besitzt **und** ein offenes Autorisierungsfenster hat. Ein Fenster wird mit einer Nachricht auf dem Cosmos-Pfad geöffnet und trägt damit die PQC-Signatur, die eine Ethereum-Wallet nicht liefern kann. Innerhalb des Fensters funktionieren gewöhnliche MetaMask-Transaktionen unverändert.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Grenze               | Bedeutung                                                                                     |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 bis 17,280         | Wie lange das Fenster offen bleibt, gerechnet ab dem Block, der es öffnet                     |
| `max-txs`   | 1 bis 1,000          | Wie viele EVM-Transaktionen es zulässt                                                        |
| `max-value` | positiv              | Zulässige Gesamtsumme, bestehend aus dem übertragenen Wert **und** der maximalen Gebühr, die jede Transaktion zahlen könnte; `uqor` oder `qor`, z. B. `1000qor` |

Das Öffnen eines Fensters ersetzt ein eventuell bestehendes. Prüfen Sie es mit `qorechaind query pqc evm-window <address>`.

### close-evm-window

Ihr Fenster sofort schließen, zum Beispiel wenn Sie vermuten, dass der klassische Schlüssel kompromittiert ist.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` ist `sx` oder `ux`. Die Registrierung erfordert eine aktive `lightnode_operator`-Lizenz, und die Registrierung für das Light-Node-Belohnungsprogramm ist **noch nicht geöffnet**. Weitere Befehle: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. Siehe [Light Node](/light-node/overview).

---

## bridge

Die Bridge ist nicht in Produktion: In beiden Netzwerken befindet sich jede konfigurierte Chain im Status `pending`, und es sind keine Bridge-Validatoren registriert (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Von einer Quell-Chain per Bridge hereingeholte Assets gutschreiben. Trägt Validator-Signaturen (`--validator-sigs`, `--pqc-commitment`); es ist eine Nachricht für Bridge-Operatoren und nicht der Weg, auf dem ein Endnutzer eine Einzahlung startet.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

Administrativ (`bridge_admin`- oder `qcb_bridge`-Lizenz).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Das erste `transfer` ist der Unterbefehl, das zweite der Quell-Port. Zum Zeitpunkt der Erstellung sind in keinem der beiden Netzwerke IBC-Kanäle geöffnet (`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` ist `defi`, `gaming`, `nft`, `enterprise` oder `custom`; `stake_amount` wird in uqor angegeben (das aktuelle Minimum steht in `query rdk config`). Die Voreinstellung des Profils liefert Settlement, Sequencer, DA und Gas-Modell; nur die VM lässt sich auf der Kommandozeile überschreiben. Einen Befehl `finalize-batch` gibt es nicht.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` ist `proposed`, `active`, `suspended` oder `decommissioned`. `update-layer-status` ist im Mainnet durch den Circuit Breaker deaktiviert (siehe unten).

---

## Derzeit deaktivierte oder nicht verfügbare Nachrichten {#disabled-messages}

Einige Befehle existieren im Binary, können in den Live-Netzwerken aber nicht erfolgreich sein:

| Befehl                                                    | Grund                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Die Berechtigung zum Hochladen und Instanziieren ist in beiden Netzwerken `Nobody`, und die Nachrichtentypen stehen zudem auf der Circuit-Breaker-Liste |
| `tx crossvm call`                                         | Im Mainnet durch den Circuit Breaker deaktiviert                                               |
| `tx svm deploy-program`, `execute`, `create-account`      | Der SVM-Transaktionspfad ist netzwerkweit deaktiviert                                          |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Das Abstract-Account-Modul ist abgeschaltet (`query abstractaccount config` zeigt `enabled: false`) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Nachrichten der Governance-Autorität; stehen ebenfalls auf der Circuit-Breaker-Liste des Mainnets |
| `tx license *`                                            | Nur für die Autorität (Lizenzen werden von der Lizenzautorität des Netzwerks vergeben)         |

Die aktuelle Liste liefert `qorechaind query circuit disabled-list`.
