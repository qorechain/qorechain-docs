---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

Die Seite **Developers** (`/developers`, Seitenleiste **Build**, Eintrag **Developers**) ist eine öffentliche Seite mit Werkzeugen zum Bauen auf QoreChain. Sie braucht kein Konto. Sie hat sechs Tabs: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** und **AI agents (MCP)**. Zusammen erlauben sie dir, das passende Paket zu finden und zu installieren, zu prüfen, welchen Post-Quantum-Schlüssel ein Konto registriert hat und ob sein EVM-Autorisierungsfenster offen ist, eine signierte Transaktion trocken durchlaufen zu lassen, das hybride Signieren mit einem Wegwerfschlüssel zu üben und eine dApp gegen eine Mock-QoreX-Wallet zu testen, alles im Browser. Sie richtet sich an dApp-, Wallet- und Backend-Entwickler. Ein **Transaction inspector** ist geplant und noch nicht live (siehe [Grenzen](#limits)). Für die Bibliotheken selbst siehe [Developer Packages](/developer-tools/overview), die [SDK Overview](/sdk/overview) und [Install](/sdk/install).

## Innovationen {#innovations}

- **Ein schreibgeschütztes Gateway zur Chain.** Die Tools lesen öffentliche Chain-Daten und simulieren eine Transaktion über ein schreibgeschütztes Gateway unter den Abfragepfaden `cosmos/`, `cosmwasm/` und `qorechain/` sowie dem Simulate-Aufruf. Nichts auf der Seite kann eine Transaktion senden. Das Gateway gibt es, weil die REST-Endpunkte der Chain keine Browser-CORS-Header senden.
- **Schlüssel, die den Browser nie verlassen.** Die Schlüssel für den Signing playground und die Test-Wallet werden in deinem Browser erzeugt und nur im Arbeitsspeicher gehalten. Sie werden nie gespeichert oder gesendet und verschwinden beim Neuladen. Diese beiden Tabs gelten nur für das Testnet und lehnen das Mainnet ab.
- **Die Signierbibliothek aus der Produktion, keine Demo.** Der Playground verwendet [QoreSign](/qoresign/overview), dieselbe Open-Source-Bibliothek wie Produktionsintegrationen. Sie erzeugt und verifiziert hybride Signaturen: eine secp256k1-Signatur plus eine ML-DSA-87-Signatur über dieselbe Nachricht.
- **Ein Paket-Hub aus getesteten Daten.** Der Tab **SDKs** listet etwa 40 Pakete aus einem einzigen Manifest. Die Versionen werden live aus jeder Registry gelesen (alle 10 Minuten aktualisiert; ist eine Registry nicht erreichbar, werden die zuletzt geprüfte Version und ihr Datum angezeigt), und jeder Quickstart wurde vom SDK-Team gegen die öffentlichen Registries ausgeführt, mit der beobachteten Ausgabe daneben.
- **Antworten der Chain, keine Vermutungen.** **PQ key status** liest den registrierten ML-DSA-87-Schlüssel und den Zustand des EVM-Fensters aus den eigenen Abfrage-Routen des Knotens, sodass du siehst, warum eine EVM-Transaktion abgelehnt würde, bevor du sie sendest.

## Anleitung {#how-to-use}

Öffne [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Die Seite öffnet sich auf dem Tab **SDKs**. Die Tabs **PQ key status** und **Simulator** zeigen einen **Network**-Schalter (Testnet oder Mainnet), der nur für die Seite gilt und **standardmäßig auf Testnet steht**, was auch immer die Kopfzeile sagt. Er gilt absichtlich nur für die Seite: Der Schalter der Kopfzeile lädt die Seite neu, was die Schlüssel und die Test-Wallet im Arbeitsspeicher löschen würde.

### SDKs {#sdks}

**Was es tut.** Listet jede QoreChain-Bibliothek, nach Produkt gruppiert. Das Manifest enthält etwa 40 Pakete in TypeScript, Python, Go, Rust, Java, Kotlin und Swift. Die meisten sind stabil, eines ist veraltet, und ein Paket, das noch nicht in seiner Registry liegt, ist entsprechend gekennzeichnet. Die Produkte in der angezeigten Reihenfolge sind: QoreChain SDK (Core, React-Hooks, EVM, SVM, der dApp-Starter und die Ports für Python, Rust, Go und Java), QoreSign, RDK (das Rollup Development Kit, sein Kommandozeilenwerkzeug, der Rollup-Starter und die Ports für Python, Rust, Go und Java), die PQC-Bibliothek, der Wallet-Adapter, die Chain-Bridge, Handles, QoreX-Integrationen sowie MCP und die `qore`-CLI.

**Wie es funktioniert.** Jedes Produkt ist eine Karte. Wenn das Produkt in mehreren Sprachen erscheint, schaltet eine Sprachauswahl (Pills) das angezeigte Paket um. Jedes Paket zeigt:

- eine Status-Pill (**Stable**, **Not published yet** oder **Deprecated**);
- die **neueste Version**, live aus ihrer Registry gelesen (npm, PyPI, crates.io, der Go-Proxy, Maven Central oder GitHub Releases) und alle 10 Minuten aktualisiert. Ist eine Registry nicht erreichbar, wird die zuletzt geprüfte Version mit ihrem Datum angezeigt, dazu ein Hinweis, dass die Live-Versionen nicht gelesen werden konnten;
- **Registry**, **Source** (Repository) und **License** (Apache-2.0) sowie die Laufzeitanforderungen;
- den **Install**-Befehl und die **Import**-Zeile, jeweils mit Kopierknopf, dazu Peer-Abhängigkeiten, Subpath-Exports, Transporte und einen gehosteten Endpunkt, sofern das Paket sie hat (bei Maven erscheint ein `pom.xml`-Block);
- den **Quickstart**: eine Pill mit **Tested** und dem Datum, **Failed in testing** oder **Not tested**, den Dateinamen, den Code mit Kopierknopf, die **Observed output** und **How it was tested**. Ein fehlgeschlagener Quickstart ist hinter **Show the quickstart** versteckt, mit einer Warnung, zuerst die bekannten Probleme zu lesen;
- **Known issues** und Hinweise, wörtlich vom SDK-Team.

Ein nicht veröffentlichtes Paket zeigt „This package is not on its registry yet, so there is no install command." und keine Installationszeile. Das veraltete Paket (`@qorechain/connect`) ist unten unter **Deprecated packages** eingeklappt, mit seinen Ersatzpaketen (den `@qorechain/qorex-*`-Paketen).

**Schritte.**

1. Tippe in das Filterfeld („Filter by name or language"), um die Liste einzugrenzen; **Clear filter** setzt es zurück. Passen mehrere Produkte, verlinkt eine **Jump to**-Zeile auf jedes davon.
2. Wähle das Produkt, dann die Sprach-Pill.
3. Prüfe die Versionszeile („latest on npm" oder „checked" mit einem Datum) und kopiere dann den **Install**-Befehl.
4. Kopiere die **Import**-Zeile, dann den Quickstart in die unter **File name** genannte Datei, und führe ihn aus.
5. Öffne **Network endpoints**, um die Chain-IDs und öffentlichen Endpunkte für Testnet und Mainnet zu kopieren. Der Hinweis darunter erklärt die Quickstart-Konventionen: Die Beispiele lesen nur und signieren mit der öffentlichen Testphrase, also finanziere niemals ein daraus abgeleitetes Konto.

**Minimales Beispiel.** Tippe `python` in den Filter, öffne **QoreChain SDK**, wähle die Pill **Python**, kopiere den Installationsbefehl unter **Install**, kopiere dann den Quickstart und führe ihn aus.

**Netzwerk.** Statische Liste plus Live-Registry-Abfragen; es gibt keine Netzwerkauswahl.

### PQ key status {#pq-status}

**Was es tut.** Zeigt den ML-DSA-87-Schlüssel, den ein Konto on-chain registriert hat, und den Zustand seines EVM-Autorisierungsfensters, im Mainnet oder Testnet.

**Wie es funktioniert.** Die Seite parst deine Eingabe, wandelt sie in ein `qor1...`-Konto um und stellt dem Knoten zwei Abfragen: den registrierten PQC-Schlüssel (über [QoreSign](/qoresign/overview)) und das EVM-Fenster des Kontos (`GET /qorechain/pqc/v1/evm_window/{address}`). Eine `0x...`-Adresse sind dieselben 20 Bytes wie ihre `qor1...`-Form, und eine `qorvaloper1...`-Adresse wird als das eigene Konto des Betreibers nachgeschlagen. Ergebnisse gehören zu einem Netzwerk: Ein Umschalten löscht sie.

**Schritte.**

1. Öffne den Tab **PQ key status** und wähle das Netzwerk.
2. Gib eine **Account address** ein (`qor1...`, `0x...` oder `qorvaloper1...`). Die Seite prüft das Format und die Prüfsumme und meldet einen Tippfehler.
3. Wähle **Check**.
4. Lies **Registered PQC key**: ob ein Schlüssel registriert ist, den **Algorithm** (ML-DSA-87), den **Key type** (hybrid), **Proof of possession** (mit dem Hinweis, dass die Chain ihn als optional behandelt) und den **Public key** (2592 Bytes, gekürzt, mit Kopierknopf). Ein Konto ohne Schlüssel zeigt „This account has no PQC key registered on this network."
5. Lies **EVM authorisation window**: **State** (**Open** oder **Closed**), **Blocks left**, **Transactions used** (im Stil „3 of 20"), **Value used**, **Opened / expiry height** und ob das Fenster **Native QOR transfers only** erlaubt, mit allen erlaubten Zielen. Ein Konto, das nie eines geöffnet hat, zeigt „No EVM authorisation window has been opened for this account."

Das Fenster wird auf der nativen Lane mit dem ML-DSA-87-Schlüssel des Kontos geöffnet und schließt sich, wenn sein Block- oder Transaktionslimit erreicht ist; siehe [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window).

**Minimales Beispiel.** Wähle Testnet, füge die `0x...`-Form einer Adresse ein, die du mit MetaMask verwendest, und wähle **Check**: Ist das Fenster **Closed** oder nicht vorhanden, würde eine EVM-Transaktion dieses Kontos abgelehnt.

### Simulator {#simulator}

**Was es tut.** Lässt eine signierte Transaktion gegen die Chain trocken durchlaufen und meldet, was sie kosten und ändern würde. Es wird nichts gesendet.

**Wie es funktioniert.** Die Seite dekodiert deine Eingabe (Base64 oder Hex, bis etwa 180 KB), zählt ihre Signaturen und sendet sie an die Simulate-Route des Knotens. Der Simulate-Aufruf ist die einzige Schreibroute, die das Gateway erlaubt.

**Schritte.**

1. Öffne **Simulator** und wähle das Netzwerk.
2. Füge die signierte Transaktion (ein `TxRaw`, Base64 oder Hex) in **Signed TxRaw** ein. Die Seite zeigt die dekodierte Größe und die Anzahl der Signaturen und warnt, falls es keine gibt (die Chain wird sich höchstwahrscheinlich weigern, eine unsignierte Transaktion zu simulieren).
3. Wähle **Simulate**.
4. Lies **Gas used**, das **Suggested gas limit**, **Balance changes** (Adresse, Denomination, Änderung) und die **Events** in der einklappbaren Liste.
5. Lehnt die Chain ab, zeigt die Seite ihren **Code**, **Codespace** und das **Log** unter „The chain refused the simulation".

Du brauchst zuerst signierte Bytes: Erstelle und signiere sie mit einem SDK oder `qorechaind` (siehe [Post-Quantum Signing](/developer-guide/post-quantum-signing)). **Minimales Beispiel:** Signiere mit dem SDK im Testnet eine kleine Überweisung, füge das Base64-`TxRaw` ein, wähle **Simulate** und prüfe das vorgeschlagene Gas-Limit, bevor du sendest.

### Signing playground (nur Testnet) {#signing-playground}

**Was es tut.** Lässt dich einen hybriden Wegwerfschlüssel erzeugen und im Browser Nachrichten und Sign-In-With-QoreChain-Anfragen signieren und verifizieren.

**Wie es funktioniert.** Eine 24-Wörter-Phrase wird in der Seite erzeugt und nur im Arbeitsspeicher gehalten. [QoreSign](/qoresign/overview) leitet daraus einen secp256k1-Schlüssel und einen ML-DSA-87-Schlüssel ab. Die Signaturen decken dieselbe Nachricht mit beiden Schlüsseln ab, für die Chain `qorechain-diana`. Da ein Wegwerfschlüssel nicht on-chain registriert ist, verwendet die Verifikation den öffentlichen ML-DSA-87-Schlüssel dieser Sitzung.

**Schritte.**

1. Öffne **Signing playground**. Er warnt „Throwaway testnet key: never use it for real funds."
2. Wähle **Generate throwaway key**. Die Seite zeigt die `qor1...`-Adresse, den öffentlichen secp256k1-Schlüssel (33 Bytes) und den ML-DSA-87-Schlüssel (öffentlicher Schlüssel 2592 Bytes, geheimer Schlüssel 4896 Bytes). **New key** ersetzt ihn.
3. **Message:** Gib Text ein und wähle **Sign**; das Ergebnis ist eine hybride Signatur als JSON. Wähle **Verify**: Die Seite zeigt „Valid signature" oder „Invalid signature" mit dem Fehlercode.
4. **Sign In With QoreChain:** Wähle **Build message** (eine Anmeldenachricht für diese Website mit Domain, Adresse, Chain-ID, einer zufälligen Nonce sowie Ausstellungs- und Ablaufzeit), dann **Sign**, dann **Verify**. Verify prüft sie so, wie es ein Server täte, und listet die geparsten Felder auf. Siehe die [SIWQ-Spezifikation](/qoresign/spec/siwq-v1) und den [Anmelde-Leitfaden](/qoresign/guides/sign-in).

**Minimales Beispiel.** **Generate throwaway key**, tippe `hello`, **Sign**, **Verify**: Die Seite zeigt „Valid signature".

**Netzwerk.** Nur Testnet; der Schlüssel kann nicht für das Mainnet verwendet werden und geht beim Neuladen verloren.

### QoreX test wallet (nur Testnet) {#test-wallet}

**Was es tut.** Installiert im aktuellen Tab einen Mock der QoreX-Wallet, damit du die Verbindungs- und Signierabläufe einer dApp ohne echte Wallet ausprobieren kannst.

**Wie es funktioniert.** **Start test wallet** erzeugt eine Test-Wallet mit einem Wegwerfschlüssel (das veröffentlichte Paket `@qorechain/qorex-wallet-mock`) und meldet sie den dApps auf der Seite als „QoreX (mock)" an, über die Standard-Wallet-Erkennung für Browser-Wallets (EIP-6963); sie stellt außerdem `window.qorex` bereit. Nichts wird automatisch genehmigt. Sie sendet keine Transaktionen. Ist im Tab eine echte QoreX-Erweiterung vorhanden, ersetzt der Mock sie bis zum Neuladen.

**Schritte.**

1. Öffne **QoreX test wallet** und lies die Warnung: Jeder Start erzeugt einen Wegwerf-Testnet-Schlüssel im Arbeitsspeicher; sende niemals echte Mittel dorthin.
2. Wähle **Start test wallet**. Die Karte **Addresses** listet die Adressen für QoreChain Native, EVM und SVM auf.
3. Verbinde dich aus einer dApp, die in diesem Tab läuft, oder rufe `window.qorex` aus der Browser-Konsole auf.
4. Jede Anfrage erscheint unter **Waiting for approval**; wähle **Approve** oder **Reject**. Die Liste **Requests** protokolliert jede Anfrage mit ihrem Genehmigungsstatus und Ergebnis.
5. Wähle **Stop (reloads the page)**, um den Mock zu entfernen.

**Minimales Beispiel.** Starte die Test-Wallet, öffne eine dApp im selben Tab, wähle „QoreX (mock)" in ihrem Verbindungsdialog und **Approve** die Verbindung.

**Netzwerk.** Nur Testnet.

### AI agents (MCP) {#mcp}

**Was es tut.** Zeigt den Status des QoreChain-MCP-Servers (ein Model-Context-Protocol-Server, mit dem ein MCP-Client QoreChain-Chain-Daten lesen und die Entwicklerwerkzeuge nutzen kann) und wie du ihn in einem MCP-Client einrichtest.

**Wie es funktioniert.** Beim Öffnen des Tabs fragt die Seite die Paket-Registry live ab und zeigt den Status (**Published**) mit der aktuellen Version (`@qorechain/mcp`, zum Zeitpunkt des Schreibens 0.1.0, das auch auf PyPI als `qorechain-mcp` liegt). Danach zeigt sie die Einrichtung für einen MCP-Client als kopierbare Blöcke:

- **Lokal (stdio), die Hauptoption.** Füge `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` in die Server-Konfiguration deines MCP-Clients ein. Es braucht keinen Schlüssel.
- **Selbst gehostet (Streamable HTTP).** Führe `qorechain-mcp serve --port 8787` aus und richte den Client auf `http://localhost:8787/mcp`.
- **Gehosteter Endpunkt.** `https://mcp.qorechain.io/mcp` bedient standardmäßig das Testnet. Jede Anfrage braucht einen API-Schlüssel, der als `Authorization: Bearer <key>`-Header gesendet wird. Fordere einen in deinem Dashboard an (siehe den Ablauf unten). Für die meisten Anwendungen braucht die lokale Einrichtung keinen Schlüssel.

**API-Schlüssel für den gehosteten Endpunkt.** Melde dich an und gehe dann im Tab zum Abschnitt **API key**:

1. Fülle Name oder Organisation, einen Kontakt, den Verwendungszweck und das erwartete Volumen aus und drücke dann **Request API key**. Der Status lautet „waiting for approval".
2. Das QoreChain-Team genehmigt oder lehnt die Anfrage ab. Bei einer Ablehnung wird deren Hinweis angezeigt, und du kannst erneut anfragen.
3. Drücke nach der Genehmigung **Generate key**. Der Schlüssel wird einmalig angezeigt, mit einer Kopierschaltfläche und einem fertigen Konfigurationsausschnitt, und wird innerhalb von ein bis zwei Minuten aktiv. QoreChain behält keine Kopie des Schlüssels, nur einen Fingerabdruck (einen Hash), sodass ein verlorener Schlüssel nicht erneut angezeigt werden kann: Widerrufe ihn und fordere einen neuen an.
4. **Revoke key** ist jederzeit verfügbar und wirkt nach etwa einer Minute.

Grenzen: ein aktiver Schlüssel pro Konto, 10 Anfragen pro Sekunde (Burst 20) und 100.000 Anfragen pro Tag.

**Schritte.** Öffne den Tab, kopiere die lokale Konfiguration in deinen MCP-Client, starte ihn neu und bitte ihn, einen Block oder ein Konto zu lesen. Details zu den Tools und Optionen findest du unter [QoreChain-MCP-Server](/developer-tools/mcp). **Minimales Beispiel:** Füge den stdio-Block in deinen Client ein, starte ihn neu und bitte ihn um den neuesten Block.

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), oder **Developers** in der Seitenleistengruppe **Build** (und im mobilen Menü).
- **Anmeldung:** keine für die Seite und ihre Tools. Für die Anfrage eines API-Schlüssels für den gehosteten MCP-Endpunkt ist eine Anmeldung nötig.
- **Netzwerk:** **PQ key status** und **Simulator** funktionieren im Mainnet oder Testnet über den Schalter auf dem Tab (Standard Testnet). **Signing playground** und **QoreX test wallet** gelten nur für das Testnet. **SDKs** und **AI agents (MCP)** hängen von keinem Netzwerk ab.
- **Wallet:** keine. Die Tools erzeugen ihre eigenen Wegwerfschlüssel.
- **Kosten:** kostenlos. Es wird nichts an die Chain gesendet außer Leseabfragen und Simulate-Aufrufen.
- **Datenschutz:** Wegwerfschlüssel existieren nur im Arbeitsspeicher der Seite. Füge keine echte Wiederherstellungsphrase in ein Tool ein.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerke |
| --- | --- | --- |
| Developers-Seite | `dashboard.qorechain.io/developers` | Lese-Tools für Mainnet und Testnet; Signier-Tools nur Testnet |
| Signier-Bibliothek | npm `@qorechain/qoresign`, Quelle `github.com/qorechain/qoresign`, siehe [QoreSign](/qoresign/overview) | n/a |
| Test-Wallet-Paket | npm `@qorechain/qorex-wallet-mock`, Quelle `github.com/qorechain/qorex-integrations` | Testnet |
| Paketindex | [Developer Packages](/developer-tools/overview) | n/a |
| MCP-Server | npm `@qorechain/mcp` 0.1.0 und `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0; Anleitung: [QoreChain-MCP-Server](/developer-tools/mcp) | Standardmäßig Testnet |

Paketversionen ändern sich; lies die aktuellen im Tab **SDKs** oder in den Registries.

## Grenzen und bekannte Probleme {#limits}

- **Transaction inspector: in Planung, nicht live.** Geplant: einen Hash einfügen und jede Nachricht, den Signer, die Gebühr, ob die Post-Quantum-Signatur gegen den registrierten Schlüssel des Signers verifiziert, und die Sicherheitsstufe sehen. Er kommt mit dem nächsten QoreSign-Release.
- **Der gehostete MCP-Endpunkt braucht einen API-Schlüssel.** Fordere einen in deinem Dashboard an (ein aktiver Schlüssel pro Konto, 10 Anfragen pro Sekunde, 100.000 pro Tag); die lokale Einrichtung braucht keinen. Nutze für die meiste Arbeit die lokale Einrichtung.
- **Zwei Quickstarts sind als „Not tested" markiert:** QoreSign für Android (derselbe Code wurde nur auf dem JVM-Artefakt ausgeführt, nicht auf einem Gerät) und QoreSign für Python. Die anderen 32 Quickstart-Einträge liefen und bestanden.
- **Der Simulator braucht signierte Bytes.** Er kann nicht für dich signieren und sendet nie.
- **Der Playground und die Test-Wallet gelten nur für das Testnet,** verwenden Wegwerfschlüssel, die beim Neuladen verschwinden, und können keine echten Mittel halten oder bewegen.
- **Eine echte QoreX-Erweiterung im selben Tab wird ersetzt,** durch die Test-Wallet, bis du die Seite neu lädst.
- **Lesezugriffe laufen über das Gateway des Dashboards.** Rufe aus deinem eigenen Code die öffentlichen Endpunkte direkt auf: `api.qore.host` und `api-testnet.qore.host`.
