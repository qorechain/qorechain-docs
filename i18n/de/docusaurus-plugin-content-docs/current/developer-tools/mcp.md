---
slug: /developer-tools/mcp
title: QoreChain MCP-Server
sidebar_label: MCP-Server
sidebar_position: 23
---

# QoreChain MCP-Server (`@qorechain/mcp`)

Der QoreChain MCP-Server gibt KI-Agenten und Entwickler-Tools über das [Model Context Protocol](https://modelcontextprotocol.io) Lesezugriff auf QoreChain: Blöcke, Transaktionen, Konten, Validatoren, Staking-Stufen, den Status der hybriden Signatur aus secp256k1 plus ML-DSA-87 (FIPS 204), EVM-Contract-Lesezugriffe, Simulation und Gebührenschätzungen sowie unsignierte Überweisungen, die der Kontoinhaber in seiner eigenen Wallet signiert. Er richtet sich an Entwickler, die einen MCP-fähigen Client oder Agenten mit QoreChain verbinden, und an Teams, die eine skriptfähige, schreibgeschützte Sicht auf die Chain mit stabiler Ausgabe wünschen.

Der Server signiert nie, hält nie Schlüssel und sendet nie eine Transaktion. Er läuft auf Ihrem Rechner über stdio oder als Streamable-HTTP-Server, den Sie selbst oder QoreChain betreibt. Version **0.1.0**, veröffentlicht am 27. Oktober 2026, Apache-2.0. Ein Kommandozeilen-Zwilling, [`qore`](/developer-tools/qore-cli), führt dieselben Tools in einem Terminal aus.

## Innovationen {#innovations}

- **Hybride Signaturprüfung, nicht nur ein Etikett.** `get_pq_status` nimmt einen Transaktions-Hash, bestätigt, dass der Body genau eine `/qorechain.pqc.v1.PQCHybridSignature`-Schicht trägt, und verifiziert diese ML-DSA-87-Schicht lokal mit [QoreSign](/qoresign/overview) gegen den Schlüssel, den der Signierer on-chain registriert hat, wobei Sign-Bytes v1 und v2 probiert werden. Die Antwort lautet `verified: true` oder `false` mit Begründung, keine Vermutung anhand des Transaktionstyps.
- **Unsignierte Überweisungen, die die echte Gebühr tragen.** `prepare_transfer` liest Kontonummer, Sequenz und öffentlichen Schlüssel des Absenders, simuliert die Überweisung mit einer ML-DSA-87-Platzhalterschicht der richtigen Größe, sodass das Gas die Schicht enthält, die die Wallet beim Signieren hinzufügt, und liefert das SignDoc, eine lesbare Zusammenfassung und Prüfungen. Es fehlt nur die Signatur des Inhabers.
- **Simulation mit dekodierten Ablehnungen.** `simulate_tx` und `estimate_fee` liefern verbrauchtes Gas, ein vorgeschlagenes Gas-Limit, die Saldoänderung pro Adresse und, wenn das Netzwerk die Transaktion ablehnen würde, eine dekodierte Ablehnung statt einer rohen Fehlerzeichenkette.
- **Ein Schema für Server und CLI.** Jeder `qore`-Befehl führt ein MCP-Tool aus, und `qore --json` gibt genau das JSON aus, das das Tool zurückgibt. Das Python-Paket stellt dieselben Tool-Namen, Eingabe- und Ausgabeschemas und Fehlercodes bereit; beide werden gegen dieselben aufgezeichneten Chain-Antworten getestet.
- **Geheimnisse werden abgelehnt, bevor etwas den Rechner verlässt.** Eingaben, die wie eine Wiederherstellungsphrase (12 oder mehr aufeinanderfolgende BIP-39-Wörter) oder ein nackter 32-Byte-Private-Key aussehen, werden mit `INVALID_INPUT` abgewiesen, bevor eine Anfrage gestellt wird, und der Fehler weist den Nutzer an, dieses Geheimnis als offengelegt zu behandeln.
- **Antworten, die Feld für Feld aufgebaut werden.** Jede Ausgabe wird aus benannten Feldern der Chain-Antwort zusammengesetzt. Fehlerinhalte und Stacktraces des Upstreams erreichen den Client nie; Fehler werden auf sieben stabile Fehlercodes abgebildet.

## Wofür es verwendet wird {#use-cases}

1. **Einen Coding-Assistenten nach dem Chain-Zustand fragen.** Ein Entwickler fügt den Server einem MCP-kompatiblen Editor hinzu und fragt "what is the latest block on mainnet?" oder "show the balances of qor1... on testnet". `get_block` und `get_address_info` antworten von den öffentlichen Endpunkten, mit Explorer-Links.
2. **Prüfen, dass eine Transaktion die hybride Signatur trug.** Ein Wallet- oder SDK-Entwickler hat gerade eine Transaktion gesendet und möchte bestätigen, dass sie genau eine ML-DSA-87-Schicht trägt und dass die Schicht gegen den registrierten Schlüssel verifiziert. `get_pq_status` (oder `qore pq status <hash>`) meldet die Signaturstufe und das Ergebnis der lokalen Verifikation.
3. **Eine Überweisung zum Signieren durch den Nutzer vorbereiten.** Ein auf QoreChain aufbauender Assistent soll einem Nutzer helfen, QOR zu senden, ohne Schlüssel anzufassen. `prepare_transfer` liefert ein unsigniertes SignDoc mit lesbarer Zusammenfassung, Prüfungen und Warnungen (darunter eine für Mainnet), und `estimate_fee` liefert die Gebühr. Der Nutzer signiert in seiner eigenen Wallet.
4. **Eine abgelehnte Transaktion debuggen.** Ein Backend-Team hat eine kodierte Transaktion, die das Netzwerk ablehnt. `simulate_tx` liefert das Gas, die Saldoänderungen pro Adresse und eine dekodierte Ablehnung und sendet nichts.
5. **Contracts aus einem Skript oder einem CI-Job lesen.** Ein dApp-Team prüft einen Token-Saldo oder eine Contract-View mit `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json` und parst das JSON mit `jq`.
6. **Validatoren- und Staking-Dashboards.** Ein Analyst listet gebondete Validatoren mit ihrem Anteil an der Stimmkraft und ihrer Kommission auf (`get_validators`) und liest die Parameter der Staking-Stufen sowie die Sperren eines Inhabers (`get_staking_tiers`).
7. **Einen Team-Endpunkt betreiben.** Ein Unternehmen betreibt `qorechain-mcp serve` hinter seinem eigenen Reverse-Proxy, mit API-Schlüsseln und Ratenlimits, sodass mehrere interne Tools einen MCP-Endpunkt teilen, der auf die eigenen Nodes zeigt.

## Wie es funktioniert {#how-it-works}

* Der Server ist ein dünner, zustandsloser Leser über den öffentlichen QoreChain-Endpunkten (REST, Konsens-RPC und EVM-JSON-RPC). Jeder Upstream-Aufruf ist eine Anfrage mit einem Timeout von 10 Sekunden, einem Antwortlimit von 4 MiB und ohne Wiederholungen.
* Antworten werden Feld für Feld aus der Antwort der Chain aufgebaut. Fehlerinhalte, Stacktraces und Bibliotheksmeldungen des Upstreams erreichen den Client nie; ein unerwarteter Fehler wird zu `INTERNAL_ERROR`. Fehler kommen als Tool-Ergebnis mit `isError: true` und einem JSON-Body zurück.
* Hybride Signaturprüfungen laufen lokal mit [QoreSign](/qoresign/overview): Der Server holt die Transaktion und den registrierten ML-DSA-87-Schlüssel des Signierers, baut die Sign-Bytes (v1 oder v2) neu auf und verifiziert.
* Simulation: Auf einer Chain ab v3.2.5 enthält die Simulation bereits die Kosten der ML-DSA-87-Verifikation (`exact_gas_simulation: true` in `get_chain_info`), das vorgeschlagene Gas-Limit ist also exakt; auf einer älteren Chain wird ein Spielraum aufgeschlagen. Hat ein Body keine ML-DSA-87-Schicht, fügt `simulate_tx` eine Platzhalterschicht der richtigen Größe hinzu (wird nie gesendet), damit das Gas zu der Transaktion passt, die die Wallet signieren wird (`assume_pqc_layer`, Standard true). Der Server erkennt die Version der Chain selbstständig.
* Die EVM-Precompiles `0x...0A01` (ML-DSA-87 verify) und `0x...0A02` (Schlüsselstatus) sind nur im Testnet aktiv; im Mainnet liefert ein Aufruf leere Daten.
* Maschinenlesbare Tool-Schemas liegen im Repository als `spec/tools.json`, erzeugt aus der eigenen `tools/list`-Antwort des Servers. Die menschenlesbare Referenz ist `docs/tools.md`.

## Anwendung {#how-to-use}

Sie benötigen Node.js 20 oder neuer für das npm-Paket oder Python 3.10 oder neuer für das Python-Paket.

### Lokal mit npx ausführen {#run-npx}

Prüfen Sie, dass der Server startet, und fügen Sie ihn dann Ihrem MCP-Client hinzu. Die meisten Clients, die lokale Server starten, lesen eine JSON-Datei mit einem `mcpServers`-Objekt (Dateiname und Schlüsselnamen für HTTP-Server unterscheiden sich je nach Client; siehe die Dokumentation Ihres Clients):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Starten Sie den Client neu. Er listet 14 Tools auf. Der Server spricht stdio mit dem Client. Fragen Sie dann zum Beispiel:

- "What is the latest block on QoreChain mainnet?" (`get_block`)
- "Does testnet transaction F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 carry a valid ML-DSA-87 layer?" (`get_pq_status`)
- "Prepare a 1.5 QOR testnet transfer from my address to qor1... and estimate the fee." (`prepare_transfer`, `estimate_fee`)

### Lokal mit pip oder uvx ausführen {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Das Python-Paket bedient nur stdio. Für Streamable HTTP, API-Schlüssel und Ratenlimits verwenden Sie das npm-Paket (unten). Das Paket hat außerdem einen Bibliothekseinstieg, `run_tool`.

### Als HTTP-Server ausführen {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

Der HTTP-Transport ist zustandslos und antwortet mit JSON: `POST /mcp` für MCP-Anfragen, `GET /healthz` für `{"status":"ok"}`. Optionen:

| Option | Standard | Bedeutung |
|---|---|---|
| `--port` | 8787 | TCP-Port |
| `--host` | 127.0.0.1 | Bind-Adresse; `0.0.0.0` lauscht auf jeder Schnittstelle |
| `--api-keys-file` | keiner | Datei mit SHA-256-Hashes akzeptierter Schlüssel; wenn gesetzt, benötigen Anfragen `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | Anfragen pro Minute je API-Schlüssel und je Client-IP; `0` schaltet es ab |
| `--allowed-origin` | keiner | Browser-Origin, die den Endpunkt aufrufen darf (wiederholbar); andere Origins erhalten HTTP 403 |
| `--trust-proxy` | aus | übernimmt die Client-IP aus `X-Forwarded-For`; nur hinter einem Proxy, den Sie kontrollieren |
| `--network` | testnet | Netzwerk für Aufrufe, die keines nennen |

Um Ihren eigenen Endpunkt zu schützen, erzeugen Sie einen Schlüssel, speichern nur dessen Hash und geben den Schlüssel dem Client:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` enthält einen 64-stelligen Hex-Hash pro Zeile (ein optionales Präfix `sha256:` wird akzeptiert, `#` beginnt einen Kommentar). Ein fehlender oder unbekannter Schlüssel erhält HTTP 401 mit einer Fehlermeldung, die mit `UNAUTHORIZED` beginnt; über dem Ratenlimit antwortet der Server mit HTTP 429 und `Retry-After`. Setzen Sie TLS vor jeden Server, der von außerhalb Ihres Rechners erreichbar ist.

Das Paket exportiert außerdem `createServer`, `createHttpHandler` und `startNodeServer` zum Einbetten in Ihre eigene Laufzeitumgebung. Alle Details: [Self-Hosting](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) im Quell-Repository.

### Konfiguration {#configuration}

| Einstellung | Wie | Wirkung |
|---|---|---|
| Netzwerk pro Aufruf | das Argument `network` bei jedem Tool: `testnet` oder `mainnet` | Wählt die Chain für diesen Aufruf |
| Standardnetzwerk | `--network testnet` oder `--network mainnet` im Server-Befehl | Das Netzwerk, das verwendet wird, wenn ein Aufruf keines nennt. Standard `testnet` |
| HTTP-Port, Host, Schlüssel, Limits | die `serve`-Optionen oben | nur im HTTP-Modus |
| Upstream-Timeout | fest auf 10 Sekunden pro Anfrage, 4 MiB Antwortlimit, keine Wiederholungen | Langsame Endpunkte führen zu `UPSTREAM_UNAVAILABLE` |

Mainnet ist `qorechain-vladi` (EVM-Chain-ID 9801) und Testnet ist `qorechain-diana` (EVM-Chain-ID 9800). Eine für Mainnet vorbereitete Überweisung trägt eine zusätzliche Warnung. Für das Netzwerk gibt es keine Umgebungsvariablen: Es ist das Kommandozeilen-Flag oder das Argument pro Aufruf. So machen Sie Mainnet zum Standard für einen Client:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Tools {#tools}

Alle 14 Tools sind schreibgeschützt und nehmen ein optionales `network`. Ihre Ein- und Ausgaben werden aus den eigenen Schemas des Servers erzeugt; die [Tools-Referenz](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) listet jedes Feld auf.

| Tool | Was es zurückgibt |
|---|---|
| `get_chain_info` | Chain-IDs, neuester Block, minimaler Gaspreis, Sign-Bytes-Version, Protokoll-Funktionsschalter, ein anstehendes Upgrade, falls eines geplant ist, aktive EVM-Precompiles |
| `get_block` | ein Block (oder der neueste): Hash, Zeit, Proposer, Transaktionsanzahl und bis zu 100 Transaktions-Hashes |
| `get_transaction` | eine Transaktion über nativen Hash oder EVM-Hash (Präfix `0x`): Status, Gebühr, Memo, Gas, bis zu 50 Nachrichten, Signierer und die Signaturstufe (`pqc`, `enrollment`, `shake` oder `classical`) |
| `get_address_info` | beide Adressformen (`qor1...` und `0x...`), Kontostatus, bis zu 100 Salden, gestakter Betrag, ob ein ML-DSA-87-Schlüssel registriert ist, ob Bytecode deployt ist |
| `get_pq_status` | für eine Adresse: registrierter Schlüssel, Algorithmus, Besitznachweis, EVM-Autorisierungsfenster. Für eine Transaktion: ob sie genau eine hybride Schicht hat und ob sie verifiziert |
| `get_validators` | Validatoren nach Stake (Standard bonded, höchstens 50, Limit bis 200): Status, Jailed-Flag, Stake, Anteil an der Stimmkraft, Kommission |
| `get_staking_tiers` | das Staking-Stufen-Modul: Sperrbedingungen und Boni, Strafe bei vorzeitiger Entsperrung, der Bonus-Pool und optional die Sperren eines Inhabers. Chain v3.2.4 und neuer |
| `search` | erkennt aus einer Zeichenkette eine Blockhöhe, einen Transaktions-Hash, eine Adresse oder einen Validator, liest sie und nennt das Tool, das dieselben Daten liefert |
| `read_contract` | nur ein EVM-`eth_call`, mit optionaler ABI-Kodierung einer Funktionssignatur und Dekodierung des Ergebnisses |
| `estimate_fee` | simuliertes Gas, vorgeschlagenes Gas-Limit und Gebühr (Gas-Limit mal minimaler Gaspreis), einschließlich der ML-DSA-87-Schicht |
| `simulate_tx` | verbrauchtes Gas, vorgeschlagenes Gas-Limit, Saldoänderung pro Adresse und eine dekodierte Ablehnung für eine kodierte Transaktion |
| `prepare_transfer` | ein unsigniertes `MsgSend` von uqor: SignDoc, lesbare Zusammenfassung, Prüfungen und Warnungen |
| `get_token_holders` | immer `NOT_AVAILABLE_ON_CHAIN`: Das Auflisten von Inhabern benötigt einen Indexer, den die öffentlichen Endpunkte nicht bieten |
| `request_faucet` | immer `NOT_AVAILABLE_ON_CHAIN`: Test-QOR kommt vom [Faucet](/dashboard/faucet) im Dashboard |

Fehler sind Tool-Ergebnisse mit `isError: true` und einem JSON-Body `{"error": {"code", "message", "details?"}}`. Die Codes sind `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` und `INTERNAL_ERROR`.

### Als Bibliothek verwenden {#library}

Das npm-Paket exportiert `createServer({ defaultNetwork })` (eine MCP-Server-Instanz für jeden MCP-Transport), `createHttpHandler({ apiKeyHashes, rateLimitPerMinute })` (einen Fetch-API-Handler, `(Request) => Promise<Response>`) und `startNodeServer(...)` (den Node-HTTP-Server, den `serve` verwendet). Gemeinsame Optionen sind `defaultNetwork`, `endpoints` (ein Netzwerk auf Ihre eigenen Nodes zeigen lassen), `upstream` (`timeoutMs`, `maxResponseBytes`, `fetch`) und `onToolCall` (erhält Tool-Namen, Status und Latenz).

Das Python-Paket lässt sich über `run_tool` auf dieselbe Weise verwenden:

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### Den gehosteten Endpunkt im Terminal testen {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Ohne gültigen Schlüssel antwortet der Endpunkt mit HTTP 401 und einem JSON-RPC-Fehler, dessen Meldung mit `UNAUTHORIZED` beginnt.

### Fehlerbehebung {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: Der öffentliche Endpunkt hat nicht innerhalb von 10 Sekunden geantwortet. Versuchen Sie es erneut.
* `NOT_FOUND` bei einem alten Testnet-Block: Testnet-Nodes bereinigen die Historie, und der Fehler nennt die niedrigste verfügbare Höhe. `get_chain_info` meldet `earliest_available_height`.
* Keine Tools im Client aufgelistet: Führen Sie `npx -y @qorechain/mcp --help` in einem Terminal aus, um zu prüfen, dass Node und npm funktionieren, und lesen Sie dann das MCP-Log des Clients.
* `UNAUTHORIZED` beim gehosteten Endpunkt: Der Schlüssel fehlt, ist falsch, widerrufen oder noch nicht aktiv (ein neuer Schlüssel kann ein bis zwei Minuten brauchen).

### Was ausgeführt wurde {#what-was-run}

Am 27. Oktober 2026 wurden die veröffentlichten Pakete aus den Registries installiert und gegen die öffentlichen Testnet- und Mainnet-Endpunkte ausgeführt:

- `qorechain-mcp --version` gab `0.1.0` aus; über stdio lieferte `initialize` den Servernamen `qorechain-mcp`, und `tools/list` lieferte die 14 oben genannten Tool-Namen; `pip install qorechain-mcp==0.1.0` wurde installiert, und sein `--version` gab `0.1.0` aus.
- `qorechain-mcp serve --port 18787` beantwortete `GET /healthz` mit `{"status":"ok"}` und einen `tools/call` für `get_chain_info` über `POST /mcp`.
- `get_chain_info` lieferte im Testnet die Chain `qorechain-diana`, EVM-Chain-ID 9800, minimalen Gaspreis 0.1 uqor und Sign-Bytes `v2`, und im Mainnet die Chain `qorechain-vladi`, EVM-Chain-ID 9801 und Sign-Bytes `v2`.
- `get_pq_status` auf der oben genannten Testnet-Transaktion lieferte die Stufe `pqc`, genau eine hybride Schicht und `verified: true` mit Sign-Bytes `v2`.
- `prepare_transfer` für 1.5 QOR im Testnet lieferte ein SignDoc mit Gas-Limit 171698 und Gebühr 17170 uqor (0.01717 QOR), und `simulate_tx` auf der unsignierten Transaktion lieferte `ok: true`, wobei die Gebühr vom Absender abgebucht wurde. Nichts wurde signiert oder gesendet.

## Zugang {#how-to-access}

- **Lokal (primäre Option).** stdio über `npx -y @qorechain/mcp` oder `uvx qorechain-mcp`. Es braucht kein Konto und keinen API-Schlüssel. Es liest die öffentlichen QoreChain-Endpunkte und benötigt daher ausgehendes HTTPS.
- **Ihr eigener HTTP-Server.** `qorechain-mcp serve`, wie oben, mit API-Schlüsseln und Ratenlimits, die Sie konfigurieren.
- **Gehosteter Endpunkt.** `https://mcp.qorechain.io/mcp` bedient den Streamable-HTTP-Transport. Er verwendet Testnet, sofern ein Aufruf nicht `"network": "mainnet"` nennt. Jede Anfrage braucht einen API-Schlüssel, der als `Authorization: Bearer <key>` gesendet wird; fordern Sie einen in Ihrem Dashboard an (unten). Ohne Schlüssel antwortet der Endpunkt mit HTTP 401 (`UNAUTHORIZED`), was am 27. Oktober 2026 die Antwort war. Es gibt einen aktiven Schlüssel pro Konto, und jeder Schlüssel ist auf 10 Anfragen pro Sekunde (Burst 20) und 100.000 Anfragen pro Tag begrenzt. Für die meisten Zwecke braucht das lokale Setup keinen Schlüssel und ist die einfachere Wahl.

  Um einen Schlüssel zu erhalten, melden Sie sich unter [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) an, öffnen den Tab **AI agents (MCP)** und füllen das Formular **API key** aus (Name oder Organisation, ein Kontakt, Verwendungszweck, erwartetes Volumen); drücken Sie dann **Request API key**. Das QoreChain-Team genehmigt oder lehnt die Anfrage ab; bei einer Ablehnung wird deren Hinweis angezeigt, und Sie können erneut anfragen. Drücken Sie nach der Genehmigung **Generate key**: Der Schlüssel wird einmalig angezeigt, mit einer Kopierschaltfläche und einem fertigen Konfigurationsausschnitt, und wird innerhalb von ein bis zwei Minuten aktiv. QoreChain behält nur einen Fingerabdruck (einen Hash), sodass ein verlorener Schlüssel nicht erneut angezeigt werden kann; widerrufen Sie ihn (wirkt nach etwa einer Minute) und fordern Sie einen neuen an. Siehe [Developers-Seite](/dashboard/developers#mcp).

HTTP-Client-Konfiguration für einen Server, der einen Schlüssel benötigt (die genauen Schlüsselnamen unterscheiden sich je nach Client):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Legen Sie niemals eine Wiederherstellungsphrase oder einen Private Key in einer Client-Konfiguration ab: Kein QoreChain-Tool benötigt einen.

Der Server liest von diesen öffentlichen Endpunkten:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Konsens-RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM-JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Kosten: Der Server ist kostenlos. Lesezugriffe kosten nichts. Wenn Sie eine Transaktion senden, die `prepare_transfer` gebaut hat, fällt die Netzwerkgebühr an (die Gebührenuntergrenze beträgt 0.1 uqor pro Gas).

## Sicherheitshinweise {#security}

* **Es gibt keinen Signierpfad** im Server oder in der CLI. Nichts wird signiert, kein Schlüssel wird gespeichert und nichts wird gesendet.
* **Geheimnisse werden abgelehnt.** Eingaben, die wie eine Wiederherstellungsphrase (12 oder mehr aufeinanderfolgende BIP-39-Wörter) oder ein nackter 32-Byte-Hex-Private-Key aussehen, werden mit `INVALID_INPUT` abgewiesen, bevor eine Anfrage gestellt wird, und der Fehler weist den Nutzer an, dieses Geheimnis als offengelegt zu behandeln. Legen Sie niemals eine Wiederherstellungsphrase oder einen Private Key in einer Client-Konfiguration ab; kein QoreChain-Tool benötigt einen.
* **Fehlertext des Upstreams wird nie weitergeleitet**; Antworten werden Feld für Feld aufgebaut.
* **Logs.** HTTP-Logs enthalten die JSON-RPC-Methode, den Tool-Namen, den Status und die Latenz. Eingaben, Ausgaben, Schlüssel und Client-Adressen werden nicht protokolliert.
* **API-Schlüssel** eines selbst betriebenen Servers werden als SHA-256-Hashes gespeichert, nie im Klartext. CORS ist standardmäßig geschlossen, was auch einen an localhost gebundenen Server vor DNS-Rebinding schützt.
* **Mainnet muss ausdrücklich genannt werden**, und `prepare_transfer` fügt für Mainnet-Überweisungen eine Warnung hinzu.
* **Memos sind öffentlich und dauerhaft.** Legen Sie niemals ein Geheimnis in einem Memo ab.
* **Behandeln Sie einen gehosteten API-Schlüssel wie ein Passwort.** Bewahren Sie ihn in einer Umgebungsvariable oder einem Secret Store auf und widerrufen Sie ihn im Dashboard, falls er offengelegt wird.
* Melden Sie Sicherheitslücken vertraulich an security@qore.network, nie in einem öffentlichen Issue.

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Ausführen | Hinweise |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio und Streamable HTTP. Node.js 20 oder neuer |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` oder `uvx qorechain-mcp` | nur stdio. Python 3.10 oder neuer |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Der Befehl `qore`. Siehe [QoreChain CLI](/developer-tools/qore-cli) |

Quelle: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (öffentlich, Apache-2.0, geprüft am 27. Oktober 2026). Das Repository enthält den Server, die CLI, das Python-Paket, die Tools-Referenz, Self-Hosting-Hinweise, Beispiel-Client-Konfigurationen und drei Agent-Skill-Dateien. Ein Container-Image wird nicht veröffentlicht; verwenden Sie `npx` oder `pip`.

## Einschränkungen und bekannte Probleme {#limits}

- **Nur lesend.** Es gibt keinen Signierpfad, keine Schlüsselspeicherung und kein Senden. `prepare_transfer` liefert ein unsigniertes Dokument. Um eine Überweisung abzuschließen, signieren Sie sie mit [QoreSign](/qoresign/overview) oder der QoreX-Wallet und senden sie selbst; lesen Sie das Ergebnis dann mit `get_transaction`. `read_contract` verwendet nur `eth_call` und kann den Zustand nicht ändern.
- **Ein Transaktionstyp wird vorbereitet.** `prepare_transfer` baut ein `MsgSend` von uqor auf der nativen Lane. Es baut keine EVM-, SVM-, Staking-, Governance- oder Contract-Transaktionen. `estimate_fee` und `simulate_tx` akzeptieren jede kodierte Transaktion der nativen Lane.
- **Gaswerte unterscheiden sich je Netzwerk.** Die Simulation im Testnet (v3.2.6) enthält bereits die Kosten der ML-DSA-87-Verifikation, das Gas ist also exakt. Die Simulation im Mainnet (v3.2.4) enthält sie nicht, daher trägt das vorgeschlagene Gas-Limit einen Spielraum (`exact_gas_simulation` ist im Mainnet false).
- **Die Testnet-Historie wird bereinigt.** Ein alter Testnet-Block liefert `NOT_FOUND`, und der Fehler nennt die niedrigste verfügbare Höhe (8,790,799 im Testnet bei der Prüfung; Mainnet lieferte ab Höhe 1). `get_pq_status` prüft eine Schicht gegen den aktuell registrierten Schlüssel, daher passen ältere Transaktionen nach einer Schlüsselrotation nicht mehr.
- **EVM-Post-Quanten-Precompiles.** `0x...0A01` (ML-DSA-87 verify) und `0x...0A02` (Schlüsselstatus) sind nur im Testnet aktiv; im Mainnet liefert ein Aufruf leere Daten.
- **Limits.** Jede Upstream-Anfrage hat ein Timeout von 10 Sekunden und ein Antwortlimit von 4 MiB, ohne Wiederholungen. Blöcke listen höchstens 100 Transaktions-Hashes, Transaktionen höchstens 50 Nachrichten, Konten höchstens 100 Salden. HTTP-Request-Bodys sind auf 512 KiB begrenzt. Ein Memo hat höchstens 256 Zeichen und ist öffentlich und dauerhaft, legen Sie also niemals ein Geheimnis darin ab. Das Ratenlimit eines selbst betriebenen Servers gilt pro Instanz und liegt im Arbeitsspeicher; hinter einem Load Balancer zählt jede Instanz für sich.
- **Nicht verfügbar:** `get_token_holders` (kein Indexer an den öffentlichen Endpunkten) und `request_faucet` (verwenden Sie den Dashboard-Faucet, der eine Anmeldung erfordert). Der gehostete Endpunkt benötigt einen API-Schlüssel, der in Ihrem Dashboard angefordert wird; das lokale Setup nicht.
- **Mainnet ist explizit.** Aufrufe gehen ins Testnet, sofern sie nicht `"network": "mainnet"` nennen oder der Server mit `--network mainnet` gestartet wurde.
- **Es wird kein Container-Image veröffentlicht.** Führen Sie den Server mit `npx` oder `pip` aus.
- **Version.** 0.1.0 ist die erste Version; Tool-Namen und Schemas können sich in späteren Versionen ändern, und die erzeugte Datei `spec/tools.json` im Repository ist die Referenz für die installierte Version.

## Verwandte Seiten {#related}

* [QoreChain CLI](/developer-tools/qore-cli): dieselben Tools im Terminal.
* [QoreSign](/qoresign/overview): der hybride Verifizierer, den `get_pq_status` verwendet.
* [QoreChain SDK](/sdk/overview): die Transaktionen bauen und signieren, die dieser Server liest und simuliert.
* [QoreX-Integrationen](/developer-tools/qorex-integrations): die Wallet, die signiert, was `prepare_transfer` vorbereitet.
* [Custody-Kit](/developer-tools/custody-kit): Einzahlungserkennung und Auszahlungsprüfung für Verwahrer.
* [Faucet](/dashboard/faucet) und die [Developers-Seite im Dashboard](/dashboard/developers#mcp): Test-QOR und MCP-API-Schlüssel.
* [Überblick über die Entwickler-Pakete](/developer-tools/overview).
