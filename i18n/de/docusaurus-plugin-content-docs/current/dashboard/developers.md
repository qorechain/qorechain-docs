---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

Die Seite **Developers** (`/developers`, Seitenleiste **Build**, Eintrag **Developers**) ist eine öffentliche Werkzeugkiste für alle, die auf QoreChain bauen. Sie hat sechs Tabs: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** und **AI agents (MCP)**. Du kannst prüfen, welchen Post-Quantum-Schlüssel ein Konto registriert hat und ob sein EVM-Autorisierungsfenster offen ist, eine signierte Transaktion trocken durchlaufen lassen, das hybride Signieren mit einem Wegwerfschlüssel üben und eine dApp gegen eine Mock-QoreX-Wallet testen, alles im Browser und ohne Konto. Sie richtet sich an dApp-, Wallet- und Backend-Entwickler. Für die SDKs selbst siehe [SDK Overview](/sdk/overview) und [Install](/sdk/install).

## Innovationen {#innovations}

- **Einen PQC-Schlüssel und ein EVM-Fenster von der Chain lesen, für jede Adresse.** Der Tab PQ key status schlägt den ML-DSA-87-Schlüssel, den ein Konto registriert hat, und sein EVM-Autorisierungsfenster über die eigenen Abfrage-Routen der Chain nach, im Mainnet oder Testnet. Er akzeptiert Adressen der Form `qor1...`, `0x...` und `qorvaloper1...`.
- **Ein Trockenlauf, der nichts sendet.** Der Simulator schickt eine signierte Transaktion an die Simulate-Route der Chain und meldet das verbrauchte Gas, ein vorgeschlagenes Gas-Limit sowie die Guthabenänderungen und Events, die die Transaktion erzeugen würde. Die einzige Schreibroute, die das Dashboard dafür bereitstellt, ist Simulate.
- **Hybrides Signieren im Browser, mit einem Schlüssel, der ihn nie verlässt.** Der Signing playground erzeugt im Browser eine 24-Wörter-Wegwerfphrase, leitet daraus einen secp256k1-Schlüssel und einen ML-DSA-87-Schlüssel ab und signiert und verifiziert Nachrichten und Sign-In-With-QoreChain-Anfragen mit der [QoreSign](/qoresign/overview)-Bibliothek. Der Schlüssel liegt nur im Arbeitsspeicher und verschwindet beim Neuladen.
- **Ein Mock-QoreX zum Testen von dApps.** Die QoreX test wallet installiert `window.qorex` und meldet sich im aktuellen Tab über EIP-6963 als „QoreX (mock)“ an, mit echtem hybridem Signieren im Testnet und einer manuellen Genehmigung oder Ablehnung für jede Anfrage.
- **Konstruktionsbedingt nur Testnet.** Der Signing playground und die Test-Wallet lehnen das Mainnet ab: Sie signieren nur für `qorechain-diana`. Die beiden schreibgeschützten Tabs können auf eines der beiden Netzwerke zeigen.

## Anleitung {#how-to-use}

Die Seite öffnet sich auf dem Tab **SDKs**. Die Tabs **PQ key status** und **Simulator** zeigen einen **Network**-Schalter, der nur für die Seite gilt und **standardmäßig auf Testnet steht**, was auch immer die Kopfzeile sagt. (Ein seitenweiter Schalter wird verwendet, damit ein Netzwerkwechsel die Seite nicht neu lädt und deine Schlüssel und die Test-Wallet im Arbeitsspeicher nicht löscht.)

### PQ key status {#pq-status}

1. Öffne den Tab **PQ key status** und wähle das Netzwerk.
2. Gib eine **Account address** ein (`qor1...`, `0x...` oder `qorvaloper1...`). Eine `0x`-Adresse sind dieselben 20 Bytes wie ihre `qor1`-Form; eine `qorvaloper`-Adresse wird als das eigene Konto des Betreibers nachgeschlagen. Die Seite prüft das Format und die Prüfsumme.
3. Wähle **Check**.
4. **Registered PQC key** zeigt, ob ein Schlüssel registriert ist, seinen Algorithmus (ML-DSA-87), den Schlüsseltyp, den **Proof of possession** (die Chain behandelt ihn als optional) und den öffentlichen Schlüssel. Ist keiner registriert, sagt sie das.
5. **EVM authorisation window** zeigt den Zustand (**Open** oder **Closed**), **Blocks left**, **Transactions used** (zum Beispiel „3 of 20“), **Value used**, die Öffnungs- und Ablaufhöhen, ob das Fenster **Native QOR transfers only** ist, und alle erlaubten Ziele. Hat das Konto nie eines geöffnet, steht dort „No EVM authorisation window has been opened for this account.“

Das Fenster wird von der nativen Lane mit dem ML-DSA-87-Schlüssel des Kontos geöffnet und schließt sich, wenn sein Block- oder Transaktionslimit erreicht ist; siehe [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window). Dieser Tab beantwortet die häufige Frage „Warum wurde meine EVM-Transaktion abgelehnt?“ ohne Kommandozeile.

### Simulator {#simulator}

1. Öffne den Tab **Simulator** und wähle das Netzwerk.
2. Füge eine **Signed TxRaw** (Base64 oder Hex) in das Feld ein. Die Seite nennt dir die dekodierte Größe und die Anzahl der Signaturen und warnt, falls es keine gibt (die Chain wird sich höchstwahrscheinlich weigern, eine unsignierte Transaktion zu simulieren).
3. Wähle **Simulate**. Das Ergebnis zeigt **Gas used**, das **Suggested gas limit**, **Balance changes** (Adresse, Denomination, Änderung) und die **Events**.
4. Lehnt die Chain ab, zeigt die Seite ihren Code, Codespace und das Log.

Es wird nichts gesendet. Es braucht signierte Transaktions-Bytes: Erstelle und signiere sie zuerst mit einem SDK oder `qorechaind` (siehe [Post-Quantum Signing](/developer-guide/post-quantum-signing)). Die Eingabe ist auf etwa 180 KB begrenzt.

### Signing playground (nur Testnet) {#signing-playground}

1. Öffne den Tab **Signing playground**. Er warnt: "Throwaway testnet key: never use it for real funds."
2. Wähle **Generate throwaway key**. Die Seite zeigt die Adresse, die Größe des öffentlichen secp256k1-Schlüssels und die Größen der ML-DSA-87-Schlüssel. Wähle **New key** für einen weiteren.
3. **Message:** Gib Text ein und wähle **Sign**. Der Text wird mit beiden Schlüsseln für die Chain `qorechain-diana` signiert; die Signatur erscheint als JSON.
4. **Verify:** Füge eine Signatur und die Signer-Adresse ein und wähle **Verify**. Es meldet "Valid signature" oder "Invalid signature". Da ein Wegwerfschlüssel nicht on-chain registriert ist, prüft es gegen die Signer-Adresse und den öffentlichen ML-DSA-87-Schlüssel dieser Sitzung.
5. **Sign In With QoreChain:** Wähle **Build message**, um eine Anmeldenachricht für diese Website mit einer zufälligen Nonce zu erstellen, und signiere und verifiziere sie dann so, wie es ein Server täte. Die geparsten Felder werden angezeigt. Siehe die [SIWQ-Spezifikation](/qoresign/spec/siwq-v1) und den [Anmelde-Leitfaden](/qoresign/guides/sign-in).

Der Schlüssel wird im Browser erzeugt, nie gespeichert oder gesendet und kann nicht wiederhergestellt werden. Zu den Formaten siehe [QoreSign](/qoresign/overview) und [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1).

### QoreX test wallet (nur Testnet) {#test-wallet}

1. Öffne den Tab **QoreX test wallet** und lies die Warnung: Jeder Start erzeugt einen Wegwerf-Testnet-Schlüssel im Arbeitsspeicher; sende niemals echte Mittel dorthin.
2. Wähle **Start test wallet**. Sie verwendet das veröffentlichte Paket `@qorechain/qorex-wallet-mock`, installiert den Mock in **diesem Tab** (und ersetzt dort bis zum Neuladen eine echte QoreX-Erweiterung) und listet die **Addresses** auf, die sie hält: QoreChain Native, EVM und SVM.
3. Verbinde dich aus einer dApp, die im selben Tab läuft, oder rufe `window.qorex` aus der Browser-Konsole auf.
4. Jede Anfrage wartet unter **Waiting for approval** auf dich: Wähle **Approve** oder **Reject**. Die Liste **Requests** protokolliert jede mit ihrem Genehmigungsstatus und Ergebnis.
5. Wähle **Stop (reloads the page)**, um den Mock zu entfernen.

Sie signiert nur für das Testnet und nie für das Mainnet. Nutze sie, um den Verbindungsablauf einer dApp auszuprobieren, bevor du die dApp auf ein echtes QoreX richtest.

### SDKs und AI agents (MCP)

- **SDKs:** Der Tab zeigt derzeit einen kurzen statischen Quickstart und eine Paketetabelle. **Er ist veraltet** (er beschreibt noch Version 0.1.0 und sagt, die Pakete seien nicht in Registries, was nicht mehr stimmt). Nutze [SDK Install](/sdk/install) für die aktuellen Pakete und Versionen. Ein neu gebauter SDKs-Tab, erzeugt aus der getesteten Paketliste mit Installationsbefehlen, Quickstarts und Live-Registry-Versionen, ist **in Planung und noch nicht live**.
- **AI agents (MCP):** Der Tab prüft die npm-Registry auf den QoreChain-MCP-Server und sagt, solange das Paket nicht veröffentlicht ist, **"The QoreChain MCP server is not published yet."** Es gibt noch keinen Installationsbefehl. Sobald das Paket veröffentlicht ist, zeigt der Tab die Client-Konfiguration, um ihn lokal über stdio oder selbst gehostet über Streamable HTTP auszuführen.
- **Transaction inspector:** Ein Werkzeug zum Dekodieren und Erklären jeder Transaktion ist **in Planung und noch nicht live**.

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), oder **Developers** in der Seitenleistengruppe **Build** (und im mobilen Menü).
- **Anmeldung:** keine. Die Seite steht allen offen.
- **Netzwerk:** PQ key status und Simulator: Mainnet oder Testnet, über den Schalter auf dem Tab (Standard Testnet). Signing playground und QoreX test wallet: nur Testnet.
- **Wallet:** keine. Die Tools erzeugen ihre eigenen Wegwerfschlüssel.
- **Kosten:** kostenlos. Es wird nichts an die Chain gesendet außer Leseabfragen und Simulate-Aufrufen.
- **Datenschutz:** Wegwerfschlüssel existieren nur im Arbeitsspeicher der Seite. Füge keine echte Wiederherstellungsphrase in ein Tool ein.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerke |
| --- | --- | --- |
| Developers-Seite | `dashboard.qorechain.io/developers` | Lese-Tools für Mainnet und Testnet; Signier-Tools nur Testnet |
| Signier-Bibliothek | npm `@qorechain/qoresign` 0.1.0, Quelle `github.com/qorechain/qoresign`, siehe [QoreSign](/qoresign/overview) | n/a |
| Test-Wallet-Paket | npm `@qorechain/qorex-wallet-mock` 0.1.0, Quelle `github.com/qorechain/qorex-integrations` | Testnet |
| MCP-Server | `@qorechain/mcp`: noch nicht veröffentlicht | n/a |

Die Versionen wurden am 27. Oktober 2026 in der npm-Registry geprüft.

## Grenzen und bekannte Probleme {#limits}

- **Noch nicht live:** der neu gebaute SDKs-Tab und der Transaction inspector. Der MCP-Server ist nicht veröffentlicht, es gibt also nichts zu installieren.
- **Der aktuelle SDKs-Tab ist veraltet;** nutze stattdessen die [SDK-Seiten](/sdk/overview).
- **Der Simulator braucht eine signierte Transaktion.** Er kann nicht für dich signieren und sendet nichts.
- **Der Playground und die Test-Wallet sind nur für das Testnet** und verwenden Wegwerfschlüssel, die beim Neuladen verschwinden. Sie können keine echten Mittel halten oder bewegen.
- **Eine echte QoreX-Erweiterung im selben Tab wird ersetzt,** durch die Test-Wallet, bis du die Seite neu lädst.
- **Lesezugriffe laufen über einen schreibgeschützten Proxy.** Die REST-Endpunkte der Chain senden keine Browser-CORS-Header, daher leitet das Dashboard schreibgeschützte Anfragen unter den Pfaden `cosmos/`, `cosmwasm/` und `qorechain/` sowie den Simulate-Aufruf weiter. Rufe aus deinem eigenen Code die öffentlichen Endpunkte direkt auf: `api.qore.host` und `api-testnet.qore.host`.
