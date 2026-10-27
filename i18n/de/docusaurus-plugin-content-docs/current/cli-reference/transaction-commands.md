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
Setzen Sie `--chain-id qorechain-vladi`, um gegen das Live-Mainnet zu broadcasten, oder `--chain-id qorechain-diana` für das Testnet. Beide Netzwerke laufen auf der v3.2-Linie: Node-Release des Mainnets **v3.2.4** (angewendet bei Höhe 3.742.566 am 23. Oktober 2026 durch Governance-Vorschlag 13; v3.2.3 wurde bei Höhe 3.662.051 am 20. Oktober 2026 angewendet; der Governance-Vorschlag 14 würde v3.2.5 bei Höhe 3.906.833 anwenden und befindet sich zum Zeitpunkt der Erstellung in seiner Abstimmungsphase), Testnet **v3.2.6** (angewendet bei Höhe 8.970.638 am 27. Oktober 2026, nach v3.2.5 bei Höhe 8.890.800 am 26. Oktober und v3.2.4 bei Höhe 8.337.253 am 19. Oktober). Das aktuelle Release finden Sie in `latest.json` unter [download.qore.host](https://download.qore.host). Wird `--chain-id` weggelassen, verwendet der Client die `chain-id` aus Ihrer lokalen Client-Konfiguration.

Die Befehle und Flags auf dieser Seite wurden gegen die Release-Binary v3.2.3 sowie die Ergänzungen von v3.2.4 geprüft. Alles, was erst ab v3.2.4 existiert (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026), ist entsprechend gekennzeichnet. Die Quelle von v3.2.6 fügt keinen neuen `tx`-Befehl hinzu; sie ändert den Zustand des Testnets (Testtoken, ein aktiviertes Abstract-Account-Modul, offene Instanziierung von QoreChain Native), was die folgenden Abschnitte dort erwähnen, wo es relevant ist.
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

Die Netzwerk-Gebührenuntergrenze beträgt **0.1 uqor pro Gas-Einheit** (`query feemarket params` zeigt `min_gas_price`; die aktuelle Basisgebühr kann unter Last über die Untergrenze steigen, siehe `query feemarket base-fee`). Eine Transaktion wird abgelehnt, sofern nicht `fee >= gas limit x gas price` gilt; `--fees 500uqor` funktioniert daher nur bei einem Gas-Limit von höchstens 5.000 und schlägt bei jeder realen Transaktion fehl.

| Transaktion                                   | Empfohlenes `--gas` | Passendes `--fees` |
| --------------------------------------------- | ------------------- | ------------------ |
| Hybrid signierte Überweisung, Delegation, Abstimmung, Claim | `400000`            | `40000uqor`        |
| Registrierung eines PQC-Schlüssels            | `600000`            | `60000uqor`        |
| `lightnode register`                          | `300000`            | `30000uqor`        |

Eine hybride Signatur fügt einer Transaktion etwa 4,7 KB hinzu, die mit 10 Gas pro Byte berechnet werden; das Standard-`--gas 200000` reicht daher nicht immer aus: Hybrid signierte Überweisungen im Mainnet haben zwischen etwa 160.000 und 240.000 Gas verbraucht. Setzen Sie `--gas` stets explizit zusammen mit `--fees` (oder `--gas-prices`).

---

## Hybride Signatur ist auf dem Cosmos-Pfad erforderlich {#hybrid-signing}

`hybrid_signature_mode` steht in beiden Netzwerken auf `required` (`qorechaind query pqc hybrid-mode`). Jede Transaktion auf dem Cosmos-Pfad muss neben der secp256k1-Signatur eine ML-DSA-87-Signatur (Dilithium-5) tragen; ein einfaches `tx bank send ... -y` wird abgelehnt (Codespace `pqc`, Code 20). Die einzigen Ausnahmen sind seit Mainnet v3.2.3:

- die **erste** Registrierung eines PQC-Schlüssels für ein Konto, das noch keinen Schlüssel hat (`register-key` oder `register-key-v2`), damit ein neues Konto sich selbst einrichten kann;
- die Reparatur eines Kontodatensatzes, der keinen nutzbaren Schlüssel enthält, mit `register-key-v2`;
- `tx slashing unjail` für ein Konto ohne registrierten PQC-Schlüssel.

Ein Konto, das bereits einen PQC-Schlüssel besitzt, muss alles hybrid signieren, **einschließlich** `register-key-v2` und `migrate-key` (ein Versuch nur mit klassischer Signatur wird mit Code 234 abgelehnt). Ein Konto ohne Schlüssel kann ebenfalls keine hybride Signatur anfügen: Es hat nichts, wogegen verifiziert werden könnte, daher registriert es zuerst.

Jeder Befehl auf dieser Seite außer der ersten Registrierung (`pqc register-key` / `pqc register-key-v2` bei einem Konto ohne Schlüssel) wird deshalb in zwei Schritten ausgeführt: Erstellen Sie die Transaktion mit `--generate-only` und signieren und broadcasten Sie sie dann mit `tx pqc cosign`. `pqc rotate-key` übernimmt Cosignierung und Broadcast selbst; `pqc gen-key` und `pqc recover-key` erzeugen nur lokal eine Schlüsseldatei:

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

Beispiel: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, anschließend `tx pqc cosign` wie oben gezeigt. 1 QOR = 1.000.000 uqor.

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

`gen-key` und `recover-key` weigern sich, eine vorhandene Schlüsseldatei dieses Namens zu überschreiben; `--force` ersetzt sie und behält die alte Datei als `<name>.dilithium.bak-<unix-time>`.

### register-key

Einen öffentlichen PQC-Schlüssel für Ihr Konto registrieren (Legacy-Befehl: der Algorithmus ist Dilithium-5). Eine Erstregistrierung wird nur mit dem klassischen Schlüssel signiert; dies ist die Bootstrap-Ausnahme. Ein Konto, das bereits einen Schlüssel hat, muss sie hybrid signieren (`--generate-only`, dann `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` ist `hybrid` (empfohlen) oder `pqc_only`. `classical_only` wird abgelehnt (Code 230): Es registriert keinen Post-Quanten-Schlüssel, sodass das Konto nie wieder signieren könnte. Der 2.592 Byte große öffentliche Schlüssel macht die Registrierung teurer als eine Überweisung; deshalb ist das höhere Gas-Limit nötig.

Die Chain lehnt außerdem einen Schlüssel ab, der keinen Post-Quanten-Schutz bietet (Code 230), sowie einen Schlüssel, den dieses Konto bereits früher verwendet hat (Code 232). Sie lehnt eine Registrierung ab, deren klassischer Schlüssel nicht der eigene des Signierenden ist (Code 45).

### register-key-v2

Einen Schlüssel mit expliziter Algorithmusauswahl registrieren und optional nachweisen, dass Sie das Geheimnis des Schlüssels besitzen.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` ist `dilithium5` (oder `1`) oder `mlkem1024` (oder `2`); `key_type` ist `hybrid` oder `pqc_only`.

**Besitznachweis (optional).** Mit `--pqc-key <name>` (ein mit `gen-key` oder `recover-key` erzeugter Schlüssel) fügt der Befehl einen Besitznachweis (Proof of Possession) an: die eigene Signatur des neuen Schlüssels über `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. Die Chain verifiziert ihn, wenn er vorhanden ist, und lehnt die Registrierung ab, wenn er nicht verifiziert werden kann (Code 231); eine Registrierung ohne ihn wird weiterhin akzeptiert. Der Nachweis benennt die Chain, den Algorithmus, das Konto und den Schlüssel, beweist also nichts für ein anderes Konto oder Netzwerk. Er fügt der Transaktion eine 4.627 Byte große Signatur hinzu, behalten Sie das Gas-Limit daher bei `600000`. Der Nachweis wird im Feld `proof_of_possession` der Nachricht übertragen. Das TypeScript-SDK 0.9.0 fügt über `ensurePqcRegistered` selbst einen an, sobald das Netzwerk v3.2.3 angewendet hat; frühere SDK-Releases und `@qorechain/wallet-adapter` tun das nicht, sodass eine damit vorgenommene Registrierung keinen Nachweis trägt (wird weiterhin akzeptiert).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) meldet der Kontodatensatz außerdem, ob ein Nachweis verifiziert wurde, als `possession_proven` (siehe [REST- / gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#pqc-module)).

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

Beide Netzwerke haben das Upgrade eingespielt, das die hybride Verifikation auf die v2-Sign-Bytes umgestellt hat; die v1-Form wird abgelehnt. Eine Transaktion darf nur eine hybride Signaturerweiterung tragen (mehr als eine wird seit v3.2.3 abgelehnt).

### migrate-key

Den PQC-Schlüssel Ihres Kontos von einem Algorithmus auf einen anderen migrieren. Für Ihren aktuellen Algorithmus muss eine Migration aktiv sein (von der Governance gestartet); beide Schlüssel signieren die Migrations-Bytes, und die Transaktion selbst benötigt Ihre hybride Signatur (`--generate-only`, dann `tx pqc cosign`). Ein Schlüssel, den das Konto bereits früher verwendet hat, wird abgelehnt (Code 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

Seit v3.2.3 lehnt eine Rotation einen neuen Schlüssel ab, der keinen Post-Quanten-Schutz bietet (Code 230), sowie einen Schlüssel, den das Konto bereits früher verwendet hat (Code 232); das Konto merkt sich die Schlüssel, von denen es weg rotiert hat, sodass eine Rotation nicht wiederholt werden kann, um zu einem alten Schlüssel zurückzukehren.

### open-evm-window

Der EVM-Pfad lässt eine Transaktion nur von einem Konto zu, das einen registrierten PQC-Schlüssel besitzt **und** ein offenes Autorisierungsfenster hat. Ein Fenster wird mit einer Nachricht auf dem Cosmos-Pfad geöffnet und trägt damit die PQC-Signatur, die eine Ethereum-Wallet nicht liefern kann. Innerhalb des Fensters funktionieren gewöhnliche MetaMask-Transaktionen unverändert.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Grenze               | Bedeutung                                                                                     |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 bis 17.280         | Wie lange das Fenster offen bleibt, gerechnet ab dem Block, der es öffnet                     |
| `max-txs`   | 1 bis 1.000          | Wie viele EVM-Transaktionen es zulässt                                                        |
| `max-value` | positiv              | Zulässige Gesamtsumme, bestehend aus dem übertragenen Wert **und** der maximalen Gebühr, die jede Transaktion zahlen könnte; `uqor` oder `qor`, z. B. `1000qor` |

Das Öffnen eines Fensters ersetzt ein eventuell bestehendes. Prüfen Sie es mit `qorechaind query pqc evm-window <address>`.

**Fenster mit eingeschränktem Umfang (Mainnet v3.2.3 und später).** Die Wertgrenze zählt nur natives QOR: Eine Token-Überweisung, eine Genehmigung (Approval) oder jeder andere Contract-Aufruf trägt den Wert null und wird nicht darauf angerechnet. Zwei optionale Flags schränken ein, was das Fenster zulässt:

| Flag                | Wirkung                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | Nur einfache QOR-Überweisungen zulassen: keine Calldata, keine Contract-Erstellung, kein Empfänger mit Code, keine EIP-7702-Autorisierung |
| `--allowed-targets` | Nur diese Empfänger zulassen (kommagetrennte `0x`-Adressen); Contract-Erstellung wird abgelehnt                             |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

Ein Fenster, das ohne eines der beiden Flags geöffnet wird, lässt zu, was es schon immer zugelassen hat. Der Umfang wird von der Fensterabfrage als `native_only` und `allowed_targets` gemeldet.

### close-evm-window

Ihr Fenster sofort schließen, zum Beispiel wenn Sie vermuten, dass der klassische Schlüssel kompromittiert ist. Es widerruft außerdem eine ausstehende EIP-7702-Delegationszustimmung.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation und clear-evm-delegation

Eine EIP-7702-Delegation Ihres Kontos wird nur mit Ihrer eigenen Post-Quanten-Zustimmung wirksam (Mainnet seit v3.2.2). `authorize-evm-delegation` hält diese Zustimmung für eine Delegate-Adresse fest; sie ist einmalig verwendbar, läuft nach der angegebenen Anzahl von Blöcken ab und wird durch `close-evm-window` widerrufen. `clear-evm-delegation` entfernt eine bereits gesetzte Delegation. Beides sind hybrid signierte Nachrichten auf dem Cosmos-Pfad (`--generate-only`, dann `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

Die Nulladresse als `delegate` stimmt dem Löschen der Delegation zu. Den Zustand prüfen Sie mit `qorechaind query pqc evm-delegation-consent <address>`.

Keine der PQC-Schlüsselnachrichten (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) kann im Auftrag eines Kontos über `authz` gesendet werden (Mainnet v3.2.3 und später).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` ist `sx` oder `ux`. Die Registrierung erfordert eine aktive `lightnode_operator`-Lizenz, die von der Lizenzautorität des Netzwerks vergeben wird; den aktuellen Status des Programms finden Sie unter [Light Node](/light-node/overview). Weitere Befehle: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

Seit v3.2.3 ist die Belohnung, die ein Node ansammeln kann, **pro Monat** begrenzt (`max_reward_per_month_per_node` in `GET /qorechain/lightnode/v1/reward_pool`, 2.000 QOR pro 30 Tage), anteilig nach Blockzeit und Uptime, sodass die Grenze nicht mehr davon abhängt, wie schnell Blöcke erzeugt werden. Eine Grenze ist eine Obergrenze, kein zugesagter Betrag. Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) beginnt die Grenze eines Nodes mit seiner eigenen Registrierung statt mit der vorherigen Abrechnung.

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

### register-validator / attest

Nachrichten für Bridge-Validatoren. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` registriert einen Validator für die Attestierungsaufgabe, und `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` reicht eine Attestierung ein. In keinem der beiden Netzwerke ist ein Bridge-Validator registriert. Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) benötigt die Registrierung eines Bridge-Validators außerdem einen Besitznachweis und einen Schlüssel, den kein anderer Bridge-Validator verwendet.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Administrativ (`bridge_admin`- oder `qcb_bridge`-Lizenz; die Circuit-Breaker-Limits können auch per Governance gesetzt werden).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

Limits werden in Basiseinheiten angegeben, und `0` bedeutet unbegrenzt. Nur eine Route, deren Status genau `active` ist, bewegt Werte.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Das erste `transfer` ist der Unterbefehl, das zweite der Quell-Port. Zum Zeitpunkt der Erstellung ist im Mainnet kein IBC-Kanal geöffnet; das Testnet hat einen offenen Transferkanal (`channel-0`), geprüft am 27. Oktober 2026 mit `query ibc channel channels`.

---

## amm

Native AMM-Nachrichten. Zum Zeitpunkt der Erstellung existiert in keinem der beiden Netzwerke ein Pool, daher haben diese Befehle noch nichts, worauf sie wirken könnten.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

Seit v3.2.2 muss ein Swap beide Denominationen des Pools nennen, `max_swap_impact_bps` wird durchgesetzt und die Protokollgebühr wird über das Burn-Modul geleitet.

Im Testnet kann ein Pool `uqor` mit einem der drei Fest-Testtoken (ohne Wert; nur Testnet) paaren. Die Einlage und die Swap-Beträge verwenden die Bank-Denomination `erc20:<EIP-55 0x address>`, bei der die Groß-/Kleinschreibung beachtet wird, zum Beispiel `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (danach `tx pqc cosign`). Ein auf der EVM-Seite gehaltener Token muss zuerst mit `MsgConvertERC20` in eine Bank-Coin umgewandelt werden, deren Sender eine `qor1`-Adresse ist; der CLI-Befehl `qorechaind tx erc20 convert-erc20` des Node-Releases v3.2.6 schreibt den Sender als `0x`-Adresse, und die Chain lehnt ihn ab (`decoding bech32 failed`); bauen Sie diese Nachricht daher stattdessen mit dem `qor1`-Sender. Details: [Fest-Testtoken im Testnet](/developer-guide/evm-development#fest-tokens). Das Erstellen eines Pools kostet zusätzlich zu den Einlagen die Pool-Erstellungsgebühr (`pool_creation_fee` in `query amm params`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Überträgt native Token (zum Beispiel `1000000uqor`) in den Gebührenumrechnungs-Float, die QOR-Reserve, mit der das Modul Validatoren bezahlt, wenn eine Gebühr in einem anderen akzeptierten Token entrichtet wird. Die Governance entscheidet, welche Token akzeptiert werden. In beiden Netzwerken akzeptiert die Konfiguration nur natives `uqor`, daher findet keine Umrechnung statt; prüfen Sie dies mit `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` ist im Mainnet durch den Circuit Breaker abgeschaltet (siehe [unten](#disabled-messages)) und funktioniert im Testnet nur dort, wo der Ziel-Pfad verfügbar ist. Ein eingereihter Aufruf (`--async`), der fehlschlägt, hinterlässt keine Nebeneffekte, nur seinen `Failed`-Datensatz (seit v3.2.3), und ein Aufruf, dessen abgeleiteter Quell-Pfad dem Ziel-Pfad entspricht, wird abgelehnt. Siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note Ab v3.2.4 verfügbar
Das Staking-Tiers-Modul kam mit dem Release **v3.2.4**: Es läuft seit dem 19. Oktober 2026 im `qorechain-diana`-Testnet und seit dem 23. Oktober 2026 im Mainnet (Höhe 3.742.566, Governance-Vorschlag 13). Ein Node mit einem älteren Release hat das Modul nicht, und diese Befehle werden abgelehnt; prüfen Sie zuerst `GET /qorechain/stakingtier/v1/params` auf dem Node, den Sie ansprechen.
:::

Optionale zeitgesperrte Delegationen: Ein Delegator kann einen Teil einer bestehenden Delegation für 3, 6 oder 12 Monate sperren (die Mindestsperre beträgt 10 QOR) und später den Bonus abrufen, den das Modul dafür gutschreibt. Eine Sperre ist ein Datensatz zusätzlich zur Delegation: Die delegierten Mittel bleiben beim Validator.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

Die Sperre wird vom Staking-Message-Server durchgesetzt und erfasst daher auch das Undelegieren über `authz`, eine Gruppe oder einen Contract. Eine vorzeitig beendete Sperre verwirkt ihren nicht ausgezahlten Bonus und verbrennt eine Strafe; der Mindestsperrbetrag und die übrigen Parameter stehen in `GET /qorechain/stakingtier/v1/params`. Wie jede Transaktion auf dem Cosmos-Pfad benötigen diese die hybride Cosignierung (`--generate-only`, dann `tx pqc cosign`) und ein großzügiges Gas-Limit (zum Beispiel `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` ist `defi`, `gaming`, `nft`, `enterprise` oder `custom`; `stake_amount` wird in uqor angegeben (das aktuelle Minimum steht in `query rdk config`). Die Voreinstellung des Profils liefert Settlement, Sequencer, DA und Gas-Modell; nur die VM lässt sich auf der Kommandozeile überschreiben. Einen Befehl `finalize-batch` gibt es nicht.

Bei einem Rollup, dessen Data Availability `native` (oder `both`) ist, lassen Sie `--data-hash` leer: Keine Transaktion veröffentlicht einen Data-Availability-Blob, und die Chain lehnt einen Batch ab, der für ein solches Rollup einen Datenhash angibt (so verhält sich das Node-Release v3.2.4, das zum Zeitpunkt der Erstellung aktuelle Mainnet-Release). Für ein optimistisches Rollup setzt der Client `@qorechain/rdk` (0.7.0) den State Root eines Batches auf den kanonischen Übergangs-Root der Chain (`batchTransitionRoot` im RDK); siehe [Rollups](/rollups/overview).

`--anchor-signature` ist die ML-DSA-Signatur des Rollup-Erstellers über die **v2-Anchor-Sign-Bytes**; damit wird der Batch zusätzlich im Multilayer-Modul verankert. Die genauen zu signierenden Bytes gibt `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>` aus; die Werte müssen mit den Flags von `submit-batch` übereinstimmen. Seit v3.2.3 führt das Modul ein **Escrow-Hauptbuch pro Rollup**: Eine Auszahlung wird nur aus dem bezahlt, was das Hauptbuch dieses Rollups enthält, und sie wird auf Denomination, einen positiven Betrag, Beweistiefe und Geschwistergröße geprüft; das Stoppen eines Rollups erstattet nur, was in seinem Hauptbuch übrig ist, und ein gestopptes Rollup zahlt keine weiteren Auszahlungen. Zum Zeitpunkt der Erstellung existiert in keinem der beiden Netzwerke ein Rollup.

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
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Mainnet: Die Berechtigung zum Hochladen und Instanziieren ist `Nobody`, und die drei Nachrichtentypen stehen auf der Circuit-Breaker-Liste. Testnet: Das Hochladen ist `Nobody` und `MsgStoreCode` steht auf der Liste (die Governance speichert Code), während die Instanziierung offen ist (`Everybody`) und nicht auf der Liste steht |
| `tx crossvm call`                                         | Im Mainnet durch den Circuit Breaker deaktiviert; im Testnet aktiviert                         |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | Auf der Circuit-Breaker-Liste des Mainnets; seit v3.2.3 kann ein Vesting-Konto ohnehin nur für den Signierenden selbst erstellt werden |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Nachrichten für Governance-Vorschläge (kein CLI-Befehl), auf der Circuit-Breaker-Liste des Mainnets; seit v3.2.3 kann die Governance außerdem den letzten aktiven Signaturalgorithmus nicht entfernen |
| `tx svm deploy-program`, `execute`, `create-account`      | Der SVM-Transaktionspfad ist netzwerkweit deaktiviert                                          |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Mainnet: Das Abstract-Account-Modul ist abgeschaltet (`query abstractaccount config` zeigt `enabled: false`). Testnet: per Governance eingeschaltet (`enabled: true`, geprüft am 27. Oktober 2026) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Nachrichten der Governance-Autorität; stehen ebenfalls auf der Circuit-Breaker-Liste des Mainnets |
| `tx license *`                                            | Nur für die Autorität (Lizenzen werden von der Lizenzautorität des Netzwerks vergeben; seit v3.2.3 kann die Governance diese Autorität mit `MsgUpdateAuthority` ersetzen) |

Die aktuelle Liste liefert `qorechaind query circuit disabled-list`.
