---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`, Befehl `qore`)

`qore` liest QoreChain im Terminal. Es richtet sich an Entwickler, Betreiber und Skripte, die eine Transaktion nachschlagen, prüfen wollen, ob ihre Post-Quanten-Signatur verifiziert, ein Konto oder die Validatorenmenge lesen, eine Transaktion simulieren oder eine unsignierte Überweisung vorbereiten möchten, ohne Code zu schreiben. Jeder Befehl führt ein Tool des [QoreChain MCP-Servers](/developer-tools/mcp) aus, und `--json` gibt genau das JSON aus, das das Tool zurückgibt, sodass ein Skript und ein KI-Agent dieselben Daten sehen.

Nichts wird je signiert oder gesendet, und die CLI hält keine Schlüssel. Version **0.1.0**, veröffentlicht am 27. Oktober 2026, Apache-2.0, Node.js 20 oder neuer.

## Innovationen {#innovations}

- **JSON identisch mit der Ausgabe des MCP-Tools.** `qore <command> --json` gibt dasselbe Objekt mit denselben Feldnamen aus, das das passende MCP-Tool zurückgibt. Ohne `--json` wird dasselbe Objekt als lesbarer Text ausgegeben. Ein Skript, das gegen das eine geschrieben wurde, funktioniert auch gegen das andere.
- **Post-Quanten-Status aus dem Terminal.** `qore pq status <txhash>` meldet, ob die Transaktion genau eine hybride Schicht trägt und ob die ML-DSA-87-Signatur (FIPS 204) gegen den Schlüssel verifiziert, den der Signierer on-chain registriert hat, für Sign-Bytes v1 und v2. `qore pq status <address>` meldet den registrierten Schlüssel, seinen Typ, den Besitznachweis und das EVM-Autorisierungsfenster.
- **Eine Pipeline für eine Überweisung, die keinen Schlüssel braucht.** `prepare-transfer --json` schreibt eine unsignierte Überweisung, und `simulate` akzeptiert diese Datei, sodass Sie eine Überweisung aus einem Shell-Skript bauen, prüfen und bepreisen können. Der Signierschritt bleibt in Ihrer Wallet oder in [QoreSign](/qoresign/overview).
- **Stabile Exit-Codes.** 0 ist Erfolg, 1 ist ein Tool-Fehler mit einem stabilen Code wie `NOT_FOUND` oder `INVALID_INPUT`, und 2 ist ein Aufrufsfehler, sodass ein Skript anhand des Ergebnisses verzweigen kann.

## Wofür es verwendet wird {#use-cases}

1. **Prüfen, dass eine Transaktion die hybride Signatur trug.** Direkt nach dem Senden meldet `qore pq status <hash>` die Signaturstufe und ob die ML-DSA-87-Schicht gegen den registrierten Schlüssel des Signierers verifiziert.
2. **Chain-Zustand im Terminal nachschlagen.** `qore block`, `qore account <address>`, `qore validators` und `qore search <query>` beantworten eine kurze Frage, ohne einen Explorer zu öffnen oder Code zu schreiben.
3. **Eine Überweisung bepreisen und prüfen, bevor Sie sie signieren.** `prepare-transfer` schreibt eine unsignierte Überweisung, `simulate` zeigt das Gas, die Saldoänderungen und eine etwaige dekodierte Ablehnung, und `estimate-fee` liefert die vorgeschlagene Gebühr. Sie signieren in Ihrer eigenen Wallet oder mit [QoreSign](/qoresign/overview).
4. **Contracts aus einem Skript oder einem CI-Job lesen.** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` prüft einen Token-Saldo oder eine Contract-View und parst das Ergebnis.
5. **Shell-Skripte und Monitoring.** Die `--json`-Ausgabe und stabile Exit-Codes (0, 1, 2) lassen ein Skript anhand des Ergebnisses verzweigen. Dasselbe JSON liefert der [MCP-Server](/developer-tools/mcp), sodass ein KI-Client und ein Skript dieselben Daten sehen.

## Wie es funktioniert {#how-it-works}

Jeder `qore`-Befehl führt ein Tool des gemeinsamen Kerns des MCP-Servers aus, in Ihrem Prozess, gegen die öffentlichen REST-, RPC- und EVM-JSON-RPC-Endpunkte des gewählten Netzwerks. Antworten werden Feld für Feld aus der Antwort der Chain aufgebaut, Fehlertext des Upstreams wird nie ausgegeben, und ein Fehler wird auf einen von sieben stabilen Fehlercodes abgebildet (`NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED`, `INTERNAL_ERROR`). Jede Upstream-Anfrage hat ein Timeout von 10 Sekunden (`--timeout` ändert es), ein Antwortlimit von 4 MiB und keine Wiederholungen. Hybride Signaturprüfungen laufen lokal mit [QoreSign](/qoresign/overview). Nichts wird signiert oder gesendet. Details zu jedem Tool stehen auf der [Seite zum MCP-Server](/developer-tools/mcp#how-it-works).

## Anwendung {#how-to-use}

Führen Sie es ohne Installation aus oder installieren Sie es einmal:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Die Befehle sind schreibgeschützt und verwenden standardmäßig das Testnet:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Beträge sind `1.5` oder `1.5 QOR` (QOR, bis zu 6 Dezimalstellen) oder `1500000uqor`. Adressen können `qor1...` oder `0x...` sein.

### Ein Skript, das ein Konto und eine Transaktion prüft {#script}

Das Repository enthält ein vollständiges Skript (`examples/cli/pq-check.sh`), das dies tut. Sein Kern:

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

Ein Beispiel für `qore block --network mainnet --json` (27. Oktober 2026):

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### Befehle {#commands}

| Befehl | MCP-Tool | Was er tut |
|---|---|---|
| `chain`, `features` | `get_chain_info` | Chain-IDs, neuester Block, minimaler Gaspreis, Sign-Bytes-Version, Protokoll-Funktionsschalter, aktive EVM-Precompiles |
| `block [height]` | `get_block` | ein Block, standardmäßig der neueste |
| `tx get <hash>` | `get_transaction` | eine Transaktion über nativen oder EVM-Hash: Status, Gebühr, Nachrichten, Signierer, Signaturstufe |
| `account <address>` | `get_address_info` | Salden, Kontostatus, gestakter Betrag, beide Adressformen |
| `pq status <address\|txhash>` | `get_pq_status` | Status des ML-DSA-87-Schlüssels für eine Adresse oder Prüfung der hybriden Schicht für eine Transaktion |
| `validators [--status S] [--limit N]` | `get_validators` | Validatoren nach Stake; der Status ist `bonded` (Standard), `unbonding`, `unbonded` oder `all`; Limit bis 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | Parameter und Pool der Staking-Stufen sowie die Sperren eines Inhabers (Chain v3.2.4 und neuer) |
| `search <query>` | `search` | erkennt eine Höhe, einen Hash, eine Adresse oder einen Validator und liest sie |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | nur ein EVM-`eth_call`, mit optionaler Kodierung und Dekodierung |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | Gas, Saldoänderungen und eine dekodierte Ablehnung für eine kodierte Transaktion |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | vorgeschlagenes Gas-Limit und Gebühr, einschließlich der ML-DSA-87-Schicht |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | eine unsignierte Überweisung, die Ihre Wallet signiert |

Globale Optionen: `--network testnet|mainnet` (Standard `testnet`), `--json`, `--timeout <ms>` (Upstream-Timeout, Standard 10000), `--help` und `--version`. Die Tool-Schemas stehen in der [MCP-Tools-Referenz](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### Was ausgeführt wurde {#what-was-run}

Am 27. Oktober 2026 wurden `@qorechain/qore-cli` 0.1.0 und `@qorechain/mcp` 0.1.0 aus npm in ein leeres Projekt installiert, und diese schreibgeschützten Befehle wurden gegen die öffentlichen Endpunkte ausgeführt:

- `qore --version` gab `0.1.0` aus, und `qore --help` listete die oben genannten Befehle auf.
- `qore chain` (Testnet) gab die Chain `qorechain-diana`, EVM-Chain-ID 9800, minimalen Gaspreis 0.1 und Sign-Bytes `v2` aus; `qore chain --network mainnet` gab die Chain `qorechain-vladi`, EVM-Chain-ID 9801 und Sign-Bytes `v2` aus.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` und `qore read-contract --to 0x...0a02 --function "x()"` lieferten ihre Daten.
- `qore pq status F642F59F...2152` gab die Stufe `pqc`, `has_exactly_one_pqc_layer: true` und `verified: true` mit Sign-Bytes `v2` aus.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` schrieb eine unsignierte Überweisung (Gas-Limit 171698, Gebühr 17170 uqor), `qore simulate` auf dieser Datei lieferte `ok: true`, und `qore estimate-fee` lieferte eine passende Gebühr. Absender und Empfänger waren dieselbe Adresse, daher fügte das Tool eine Warnung hinzu, und nichts wurde signiert oder gesendet.
- `qore tx get zzz` gab `error [INVALID_INPUT]` aus und beendete sich mit 1; `qore bogus` beendete sich mit 2.

## So erhalten Sie Zugang {#how-to-access}

- **Netzwerke.** Testnet `qorechain-diana` (der Standard) und Mainnet `qorechain-vladi` mit `--network mainnet`.
- **Endpunkte.** Die CLI liest die öffentlichen REST-, RPC- und EVM-JSON-RPC-Endpunkte: `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` und `https://evm-testnet.qore.host` im Testnet sowie `https://api.qore.host`, `https://rpc.qore.host` und `https://evm.qore.host` im Mainnet.
- **Konto und Schlüssel.** Keine. Es gibt keine Anmeldung, keinen API-Schlüssel und keine Konfigurationsdatei; der Schlüssel des gehosteten MCP-Endpunkts gilt nicht für die CLI.
- **Voraussetzungen.** Node.js 20 oder neuer und ausgehendes HTTPS.
- **Kosten.** Kostenlos. Um die vorbereitete Überweisung zu senden, zahlen Sie die Netzwerkgebühr (Untergrenze 0.1 uqor pro Gas) aus Ihrer eigenen Wallet; die CLI führt diesen Schritt nicht aus.

## Sicherheitshinweise {#security}

* **Es gibt keinen Signierpfad.** Die CLI hält keine Schlüssel, signiert nichts und sendet nichts; `prepare-transfer` liefert ein unsigniertes Dokument.
* **Geheimnisse werden abgelehnt.** Eingaben, die wie eine Wiederherstellungsphrase (12 oder mehr aufeinanderfolgende BIP-39-Wörter) oder ein nackter 32-Byte-Private-Key aussehen, werden mit `INVALID_INPUT` abgewiesen, bevor eine Anfrage gestellt wird. Legen Sie trotzdem keine in einer Kommandozeile ab: Ihre Shell-Historie behält sie, und der Fehler weist Sie an, dieses Geheimnis als offengelegt zu behandeln.
* **Nur öffentliche Daten verlassen Ihren Rechner:** Adressen, Hashes und kodierte Transaktionen, die Sie übergeben, gesendet an die öffentlichen QoreChain-Endpunkte.
* **Mainnet ist ausdrücklich.** Aufrufe gehen ins Testnet, sofern Sie nicht `--network mainnet` übergeben, und eine für Mainnet vorbereitete Überweisung trägt eine Warnung.
* **Memos sind öffentlich und dauerhaft.** Legen Sie niemals ein Geheimnis in einem `--memo` ab.
* Melden Sie Sicherheitslücken vertraulich an security@qore.network, nie in einem öffentlichen Issue.

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Installation | Hinweise |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 oder neuer |

Quelle: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), Ordner `packages/cli` (öffentlich, Apache-2.0, geprüft am 27. Oktober 2026). Es gibt keinen Python- oder Rust-Build der CLI; der Server selbst ist ebenfalls auf PyPI als [`qorechain-mcp`](/developer-tools/mcp#where-published) verfügbar.

## Einschränkungen und bekannte Probleme {#limits}

- **Nur lesend.** Kein Befehl signiert oder sendet. `prepare-transfer` baut nur ein `MsgSend` von uqor auf der nativen Lane; es bereitet keine EVM-, SVM-, Staking-, Governance- oder Contract-Transaktionen vor. `simulate` und `estimate-fee` akzeptieren jede kodierte Transaktion der nativen Lane.
- **Kein Faucet und keine Token-Inhaberliste.** Für diese beiden MCP-Tools gibt es keinen CLI-Befehl. Test-QOR kommt vom [Faucet](/dashboard/faucet).
- **Die Testnet-Historie wird bereinigt.** Ein alter Testnet-Block oder eine alte Transaktion liefert `NOT_FOUND` mit der niedrigsten verfügbaren Höhe; Mainnet lieferte bei der Prüfung ab Höhe 1.
- **Gaswerte folgen der Chain-Version.** Beide Netzwerke haben v3.2.5 angewendet, daher enthält die Simulation die Kosten der ML-DSA-87-Verifikation; gegenüber einem älteren Node trägt das vorgeschlagene Gas-Limit einen Spielraum.
- **Ausgabelimits.** Höchstens 100 Transaktions-Hashes pro Block, 50 Nachrichten pro Transaktion, 100 Salden pro Konto, 200 Validatoren pro Aufruf. Jede Anfrage hat ein Standard-Timeout von 10 Sekunden, ein Antwortlimit von 4 MiB und keine Wiederholungen.
- **Geheimnisse werden abgelehnt.** Eingaben, die wie eine Wiederherstellungsphrase oder ein nackter Private Key aussehen, werden mit `INVALID_INPUT` abgewiesen. Legen Sie keine in einer Kommandozeile ab: Die Shell-Historie behält sie.
- **EVM-Post-Quanten-Precompiles** `0x...0A01` und `0x...0A02` sind nur im Testnet aktiv.
- **Erste Version.** 0.1.0: Befehlsnamen und Optionen können sich in späteren Versionen ändern. Verwenden Sie für Skripte `--json` und die Exit-Codes und pinnen Sie die Version.

## Verwandte Seiten {#related}

* [QoreChain MCP-Server](/developer-tools/mcp): dieselben Tools für KI-Clients, mit einem gehosteten Endpunkt.
* [QoreSign](/qoresign/overview): die Überweisung signieren, die `prepare-transfer` schreibt.
* [SDK-CLI-Referenz](/sdk/reference/cli): die eigene Kommandozeile des SDK.
* [Faucet](/dashboard/faucet): Test-QOR.
* [Überblick über die Entwickler-Pakete](/developer-tools/overview).
