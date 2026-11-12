---
slug: /build-before-qday/workshop-1
title: "Workshop 1: Ihre erste hybrid signierte Transaktion"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: Ihre erste hybrid signierte Transaktion

Dieser Leitfaden führt Sie von einem Computer ohne installierte Werkzeuge bis zu einer Transaktion, die gleichzeitig mit zwei Schlüsseln signiert und vom QoreChain-Testnet verifiziert wird. Sie müssen kein Entwickler sein. Jeder Befehl wird in einfachen Worten erklärt, und jeder Schritt endet damit, was Sie auf Ihrem Bildschirm sehen sollten.

**Wie lange das dauert:** beim ersten Mal etwa 30 Minuten, einschließlich der Installation der Werkzeuge. Etwa 10 Minuten, wenn die Werkzeuge schon installiert sind.

## Was wir bauen {#what-we-built}

Ein vollständiges Solidity-Projekt (ein kleiner Smart Contract), das mit einem einzigen Befehl erzeugt, getestet und im QoreChain-Testnet bereitgestellt wird. Danach folgt eine Transaktion, die **gleichzeitig mit zwei Schlüsseln** signiert und von der Chain geprüft wird.

Was es zeigt:

- **Hybride Signierung.** Die Transaktion trägt eine klassische secp256k1-Signatur und eine Post-Quanten-Signatur mit ML-DSA-87 (NIST FIPS 204). Beide müssen gültig sein.
- **Eine hybrid signierte Transaktion, auf der Chain verifiziert.** Die Validatoren prüfen beide Signaturen. Den Beleg lesen Sie am öffentlichen REST-Endpunkt (die Erweiterung `PQCHybridSignature` und das Ereignis `pqc_hybrid_verify`) und im Explorer.
- **Das EVM-Autorisierungsfenster.** Eine Ethereum-Transaktion kann keine Post-Quanten-Signatur tragen. Deshalb registrieren Sie auf QoreChain einmalig Ihren ML-DSA-87-Schlüssel und öffnen mit einer hybrid signierten Nachricht ein kurzes Fenster, in dem Ihre normalen EVM-Transaktionen zugelassen werden. Die Idee im Detail finden Sie unter [Deploy in 5 Minutes](/getting-started/deploy-in-5-minutes).

Genau das verlangt die Stufe Quantum Pass.

## Begriffe in diesem Leitfaden {#words}

| Begriff | Einfache Bedeutung |
| --- | --- |
| Terminal | Das Fenster, in dem Sie Befehle eingeben. Terminal unter macOS und Linux, PowerShell unter Windows |
| Testnet | Eine Übungskopie von QoreChain. Ihre Coins haben keinen Wert |
| QOR und uqor | QOR ist der Coin. uqor ist seine kleinste Einheit. 1 QOR = 1.000.000 uqor |
| Transaktion | Eine signierte Anweisung, die an die Chain gesendet wird |
| Memo | Ein kurzer Text, der an eine Transaktion angehängt wird |
| Privater Schlüssel | Ein Geheimnis, das für Ihr Konto signiert. Wer es besitzt, kontrolliert das Konto |
| Wiederherstellungscode | Ein zweites Geheimnis (beginnt mit `QRC1`), aus dem Ihr Post-Quanten-Schlüssel erzeugt wird |
| Hash | Die eindeutige ID einer Transaktion. Damit schlagen Sie die Transaktion nach |
| Gas und Gebühr | Der kleine Preis in QOR, den die Chain für die Verarbeitung einer Transaktion verlangt |

:::caution Nur ein Wegwerf-Konto im Testnet
Verwenden Sie einen Schlüssel, der nur für diese Übung erzeugt wurde und nur Test-QOR enthält. Verwenden Sie niemals eine echte Wallet oder echtes Geld. Tragen Sie niemals den Schlüssel oder Wiederherstellungscode eines Kontos mit echtem Geld in die Datei `.env` ein, und geben Sie `.env` niemals weiter und committen Sie sie nicht.
:::

## Bevor Sie beginnen {#prerequisites}

Sie brauchen einen Computer mit macOS, Windows oder Linux, ein Terminal und einen Webbrowser. Für dieses Tutorial installieren Sie zwei Werkzeuge: **Node.js 22 oder neuer** (Hardhat 3, das hier verwendete Projektwerkzeug, braucht Version 22) und **pnpm** (das Werkzeug, das die Bibliotheken des Projekts herunterlädt). Ein optionales Werkzeug, **jq**, macht nur die Ausgabe einer Verifizierung leichter lesbar.

Öffnen Sie zuerst ein Terminal. Unter macOS öffnen Sie **Terminal**. Unter Windows öffnen Sie **PowerShell**. Unter Linux öffnen Sie Ihre Terminal-App.

### Node.js 22 oder neuer {#install-node}

1. Prüfen Sie, ob Sie es schon haben:

```bash
node -v
```

Es muss `v22` oder eine höhere Zahl ausgeben. Wenn `command not found` oder eine ältere Version erscheint, installieren Sie Node.js wie unten beschrieben.

2. Installieren Sie es für Ihr System:

| System | So installieren Sie es |
| --- | --- |
| macOS | Laden Sie den Installer von [nodejs.org/en/download](https://nodejs.org/en/download) herunter, oder führen Sie `brew install node@22` aus, wenn Sie Homebrew verwenden |
| Windows | Führen Sie `winget install OpenJS.NodeJS.LTS` in PowerShell aus, oder laden Sie den Installer von [nodejs.org/en/download](https://nodejs.org/en/download) herunter |
| Linux | Führen Sie `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash` aus, schließen Sie das Terminal und öffnen Sie es neu, und führen Sie dann `nvm install 22` aus |

3. Schließen Sie das Terminal, öffnen Sie ein neues und führen Sie `node -v` erneut aus.

**Was Sie sehen sollten:** eine Zahl, die mit `v22` oder höher beginnt, zum Beispiel `v22.12.0`.

### pnpm {#install-pnpm}

1. Prüfen Sie, ob Sie es schon haben:

```bash
pnpm -v
```

2. Wenn `command not found` (oder `pnpm: command not found`) erscheint, installieren Sie es:

```bash
npm install -g pnpm
```

| Teil | Bedeutung |
| --- | --- |
| `npm` | Das Paketwerkzeug, das mit Node.js mitgeliefert wird |
| `install` | Ein Programm herunterladen und installieren |
| `-g` | Global: für Ihren ganzen Computer installieren, nicht nur für einen Ordner |
| `pnpm` | Das Programm, das installiert werden soll |

Mit Homebrew installiertes Node.js enthält pnpm nicht. Deshalb ist `pnpm: command not found` unter macOS häufig: Der obige Befehl behebt es. Wenn Sie unter Linux oder macOS einen Berechtigungsfehler sehen, führen Sie stattdessen `corepack enable` aus und danach erneut `pnpm -v`.

3. Prüfen Sie noch einmal mit `pnpm -v`.

**Was Sie sehen sollten:** eine Versionsnummer, zum Beispiel `9.12.0` oder höher.

### jq (optional) {#install-jq}

`jq` gibt eine lange Antwort in kurzer, lesbarer Form aus. Es wird nur einmal verwendet, in Schritt 8.

| System | Installation | Prüfung |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian und Ubuntu) | `jq --version` |

`curl`, das in Schritt 8 verwendet wird, ist unter macOS, Linux und Windows 10 oder neuer bereits vorhanden. Geben Sie in Windows PowerShell `curl.exe` statt `curl` ein.

## Ihre Testnet-Wallet und der Faucet {#wallet}

Das Projekt erzeugt in Schritt 3 sein eigenes Wegwerf-Konto, Sie brauchen also keine Wallet, um diesen Leitfaden abzuschließen. Sie brauchen aber Test-QOR auf diesem Konto, und Sie können außerdem die QoreX-Wallet im Testnet einrichten, um sie mit den Beispiel-Apps zu verwenden.

**QoreX im Testnet (hier optional, für die Browser-Beispiel-Apps nötig):**

1. In der **QoreX-App**: Öffnen Sie **Einstellungen** und aktivieren Sie **Use testnet (developers)**.
2. In der **QoreX-Browser-Erweiterung**: Entsperren Sie sie, tippen Sie 7 Mal auf die Versionsnummer ganz unten und wählen Sie dann **Switch to testnet (diana)**.
3. Für alles auf der Ethereum-Seite (EVM) wählen Sie zusätzlich **Add an Ethereum account (coin 60)**. Damit erhalten Sie ein Konto mit einer `0x...`-Adresse, das mit Ethereum-Werkzeugen funktioniert.

**Der Faucet** ist ein kostenloser Automat, der Test-QOR ausgibt. Sie verwenden ihn in Schritt 4:

- Adresse: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Sie melden sich zuerst an.
- Menge: 100 QOR, einmal alle 24 Stunden pro Konto.
- Die allererste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel ML-DSA-87. Das kostet einmalig eine Gebühr von etwa 0,09 QOR, 100 QOR reichen also mehr als aus.

Die in diesem Leitfaden verwendeten Netzwerkdaten:

| Dienst | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM-Chain-ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | `https://dashboard.qorechain.io/faucet` (Anmeldung erforderlich) |

## Schritte {#steps}

### Schritt 1: Werkzeuge prüfen {#step-1}

**Wie lange das dauert:** 1 Minute.

```bash
node -v
```

| Teil | Bedeutung |
| --- | --- |
| `node` | Das Programm Node.js |
| `-v` | Die Version ausgeben und beenden |

```bash
pnpm -v
```

| Teil | Bedeutung |
| --- | --- |
| `pnpm` | Das Paketwerkzeug |
| `-v` | Die Version ausgeben und beenden |

**Was Sie sehen sollten:** `v22` oder höher bei Node.js und eine Versionsnummer bei pnpm. Wenn nicht, gehen Sie zurück zu „Bevor Sie beginnen“.

### Schritt 2: Projekt erzeugen und Tests ausführen {#step-2}

**Wie lange das dauert:** etwa 1 Minute. Sie brauchen Internetzugang.

1. Erzeugen Sie das Projekt in einem neuen Ordner. Wechseln Sie in Ihrem Terminal in einen Ordner, in dem Sie Projekte ablegen (zum Beispiel Ihren Ordner „Dokumente“), und führen Sie dann aus:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Was es tut: lädt den QoreChain-Projektersteller herunter und baut ein fertiges Projekt namens `qday-demo` in einem neuen Ordner.

Parameter:

- `npx`: führt ein Programm aus dem Internet aus, ohne es dauerhaft zu installieren.
- `create-qorechain-dapp@latest`: der QoreChain-Projektersteller. `@latest` bedeutet, die neueste Version zu verwenden (dieser Leitfaden wurde mit 0.14.0 geprüft).
- `qday-demo`: der Name des neuen Ordners und Projekts. Sie können einen anderen Namen wählen.
- `-t hardhat`: `-t` steht für Vorlage (template). Damit wählen Sie die Hardhat-Vorlage: ein Solidity-Contract-Projekt mit Tests.
- `--network testnet`: mit welchem QoreChain-Netzwerk das Projekt spricht. `testnet` ist das Übungsnetzwerk.
- `--package-manager pnpm`: welches Werkzeug die vom Projekt benötigten Bibliotheken installiert.

**Was Sie sehen sollten:** eine Liste installierter Pakete und dann `Done! Created qday-demo`. Wenn nachgefragt wird, ob `create-qorechain-dapp` installiert werden soll, antworten Sie mit `y`.

2. Wechseln Sie in den Projektordner:

```bash
cd qday-demo
```

Was es tut: setzt Ihr Terminal in den neuen Ordner. Alle folgenden Befehle laufen von hier aus.

Parameter:

- `cd`: Verzeichnis wechseln (change directory).
- `qday-demo`: der Ordner, in den Sie wechseln.

3. Führen Sie die Tests aus:

```bash
pnpm test
```

Was es tut: kompiliert den Contract und prüft, ob er funktioniert, auf einer kleinen simulierten Chain in Ihrem Computer. Es sendet nichts an das echte Testnet.

Parameter:

- `pnpm`: das Paketwerkzeug.
- `test`: der Name des auszuführenden Skripts (aufgelistet in `package.json`; es führt `hardhat test` aus).

**Was Sie sehen sollten:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Sehen Sie sich an, was Sie bekommen haben (optional):

| Datei | Was sie ist |
| --- | --- |
| `contracts/Counter.sol` | Der Smart Contract: Er speichert eine Zahl und kann 1 addieren |
| `ignition/modules/Counter.ts` | Das Rezept, das den Contract bereitstellt |
| `scripts/window.ts` | Der Helfer hinter `pnpm window`: Ihren Schlüssel registrieren und das Autorisierungsfenster öffnen |
| `hardhat.config.ts` | Einstellungen, einschließlich des Netzwerks `qorechainTestnet` (Chain-ID 9800) |
| `.env` | Ihre geheime Einstellungsdatei. Sie füllen sie in Schritt 3 aus. Geben Sie sie niemals weiter |

Mehr zu den Vorlagen: [Scaffolder und CLI](/developer-tools/scaffolders-and-cli) und [Chain Developer Kit](/developer-tools/chain-dev-sdk).

### Schritt 3: Ein Wegwerf-Konto im Testnet erstellen {#step-3}

**Wie lange das dauert:** 3 Minuten.

Das Konto braucht zwei Geheimnisse: einen **privaten Schlüssel** im Ethereum-Stil und einen **Wiederherstellungscode** (beginnt mit `QRC1`), aus dem der Post-Quanten-Schlüssel ML-DSA-87 erzeugt wird. Beide kommen in die Datei `.env` in Ihrem Projektordner. Die Datei bleibt privat auf Ihrem Computer.

1. Erzeugen Sie einen neuen privaten Schlüssel. Legen Sie dazu zuerst im Ordner `qday-demo` eine kleine Datei namens `make-key.mjs` mit diesem Inhalt an (verwenden Sie einen beliebigen Texteditor, zum Beispiel Notepad, TextEdit im Nur-Text-Modus oder nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Was diese Datei tut: erzeugt einen zufälligen privaten Schlüssel und schreibt ihn in Ihre Datei `.env`, sodass er nie auf dem Bildschirm angezeigt oder von Hand kopiert wird.

2. Führen Sie sie aus:

```bash
node make-key.mjs
```

Was es tut: führt die kleine Datei mit Node.js aus.

Parameter:

- `node`: das Programm Node.js.
- `make-key.mjs`: die Datei, die ausgeführt wird.

**Was Sie sehen sollten:** `New private key saved in .env`. Führen Sie es nur einmal aus: Ein zweiter Lauf erzeugt ein anderes Konto.

3. Erzeugen Sie einen Wiederherstellungscode:

```bash
pnpm window recovery-code
```

Was es tut: erstellt einen neuen Wiederherstellungscode und gibt ihn aus.

Parameter:

- `pnpm window`: startet den Fenster-Helfer des Projekts (`scripts/window.ts`).
- `recovery-code`: die Aktion: einen neuen Wiederherstellungscode ausgeben.

**Was Sie sehen sollten:** eine lange Zeile, die mit `QRC1` beginnt, und danach einen Hinweis zur Aufbewahrung. Kopieren Sie die ganze `QRC1...`-Zeile.

4. Tragen Sie den Code in `.env` ein. Öffnen Sie die Datei in einem Editor:

| System | Befehl |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Suchen Sie die Zeile `QORE_PQC_RECOVERY_CODE=` und fügen Sie den Code direkt hinter dem Gleichheitszeichen ein, ohne Leerzeichen und ohne Anführungszeichen. Speichern Sie die Datei. Das Ergebnis sieht so aus (Platzhalter gezeigt, Ihre sind echt):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Was jede Zeile bedeutet:

- `PRIVATE_KEY`: das Geheimnis, das für die klassische Hälfte (secp256k1) Ihres Kontos signiert.
- `QORE_PQC_RECOVERY_CODE`: das Geheimnis, aus dem die Post-Quanten-Hälfte (ML-DSA-87) erzeugt wird.
- `QORE_NETWORK`: mit welchem Netzwerk der Helfer spricht. `testnet` ist das Übungsnetzwerk.

Lassen Sie `.env` genau so, wie sie ist. Derselbe Schlüssel und derselbe Code ergeben jedes Mal dasselbe Konto. Wenn Sie die Datei verlieren, beginnen Sie mit einem neuen Konto von vorn. Geben Sie sie niemals weiter und committen Sie sie niemals in Git.

Möchten Sie lieber eine Mnemonic (zwölf Wörter) verwenden? Tragen Sie dann statt des Schlüssels und des Codes `QORE_MNEMONIC="your twelve words"` in `.env` ein. Beide Schlüssel entstehen aus derselben Phrase, und ein Wiederherstellungscode ist nicht nötig. Verwenden Sie eine Phrase, die nur für diese Übung erzeugt wurde.

5. Fragen Sie das Projekt nach der Adresse Ihres neuen Kontos:

```bash
pnpm window status
```

Was es tut: liest die öffentliche Chain und zeigt Ihr Konto, Ihren Post-Quanten-Schlüssel und Ihr Fenster an. Es ändert nichts.

Parameter:

- `pnpm window`: startet den Fenster-Helfer.
- `status`: die Aktion: den aktuellen Zustand anzeigen.

**Was Sie sehen sollten:** drei Zeilen (bei Ihnen mit echten Adressen):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Kopieren Sie die Adresse `qor1...`. Diese geben Sie dem Faucet. Beide Adressen gehören zum selben Konto: `0x...` ist die Ethereum-Form und `qor1...` die QoreChain-Form.

### Schritt 4: Test-QOR vom Faucet holen {#step-4}

**Wie lange das dauert:** 2 Minuten.

1. Öffnen Sie den [Faucet](https://dashboard.qorechain.io/faucet) in Ihrem Browser und melden Sie sich an.
2. Stellen Sie sicher, dass das Dashboard auf **Testnet** steht.
3. Fügen Sie Ihre Adresse `qor1...` ein.
4. Wählen Sie **Request Tokens**.

**Was Sie sehen sollten:** eine Karte mit **Tokens Sent!** und 100 QOR (plus einigen Fest-Testtoken) sowie einen Link **View on Explorer**.

Der Faucet zahlt einmal alle 24 Stunden pro Konto aus. Die genauen Mengen stehen unter [Faucet](/dashboard/faucet). Prüfen Sie nun von Ihrem Terminal aus:

```bash
pnpm window status
```

**Was Sie sehen sollten:** dieselben drei Zeilen wie zuvor. Ihr Konto existiert jetzt auf der Chain und kann Gebühren zahlen. Es steht weiterhin dort, dass der Schlüssel nicht registriert ist. Das kommt als Nächstes.

### Schritt 5: Schlüssel registrieren und das Fenster öffnen {#step-5}

**Wie lange das dauert:** etwa 2 Minuten.

1. Registrieren Sie Ihren ML-DSA-87-Schlüssel. Das ist ein einmaliger Schritt pro Konto:

```bash
pnpm window register
```

Was es tut: sendet eine Transaktion, die der Chain mitteilt, welcher Post-Quanten-Schlüssel zu Ihrem Konto gehört. Sie kostet einmalig eine Gebühr von etwa 0,09 QOR. Die Chain akzeptiert diese eine Nachricht nur mit dem klassischen Schlüssel signiert, weil noch kein Post-Quanten-Schlüssel hinterlegt ist.

Parameter:

- `pnpm window`: startet den Fenster-Helfer.
- `register`: die Aktion: den Schlüssel registrieren.

**Was Sie sehen sollten:** `registered: <HASH>`. Wenn dort `The account already has a PQC key; nothing to do.` steht, ist das in Ordnung: Machen Sie weiter.

2. Öffnen Sie das Autorisierungsfenster:

```bash
pnpm window open
```

Was es tut: sendet eine **hybrid signierte** Transaktion (beide Schlüssel), die ein kurzes Fenster öffnet, in dem Ihre normalen Transaktionen im Ethereum-Stil, etwa ein Contract-Deploy, zugelassen werden.

Parameter:

- `pnpm window`: startet den Fenster-Helfer.
- `open`: die Aktion: ein Fenster öffnen. Standardmäßig dauert es 600 Blöcke und erlaubt 5 Transaktionen. Das können Sie mit `QORE_WINDOW_BLOCKS` und `QORE_WINDOW_TXS` in `.env` ändern.

**Was Sie sehen sollten:** `opened: <HASH>`, dann eine Zeile wie `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Die letzte Zahl ist die Ausgabengrenze des Fensters in uqor (3,75 QOR). Notieren Sie sich den Hash bei `opened:`: Sie verifizieren ihn in Schritt 8.

3. Warten Sie etwa 10 Sekunden. Das Öffnen des Fensters hat den Zähler Ihres Kontos (die Nonce) erhöht, und Hardhat wartet, bis sich die Chain beruhigt hat.

### Schritt 6: Den Contract bauen {#step-6}

**Wie lange das dauert:** ein paar Sekunden.

```bash
pnpm build
```

Was es tut: wandelt den Solidity-Contract in die Form um, die die Chain ausführt.

Parameter:

- `pnpm`: das Paketwerkzeug.
- `build`: das auszuführende Skript (es führt `hardhat build` aus).

**Was Sie sehen sollten:** `Compiled 1 Solidity file` oder `No contracts to compile`. Beides ist in Ordnung: Der Test in Schritt 2 hat ihn bereits kompiliert.

### Schritt 7: Den Contract im Testnet bereitstellen {#step-7}

**Wie lange das dauert:** etwa 30 Sekunden.

```bash
pnpm deploy:testnet
```

Was es tut: sendet den Contract mit Hardhat Ignition an das QoreChain-Testnet und nutzt dabei das Fenster, das Sie geöffnet haben. Das ist eine normale EVM-Transaktion.

Parameter:

- `pnpm`: das Paketwerkzeug.
- `deploy:testnet`: das auszuführende Skript. Es führt `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet` aus: das Rezept `Counter.ts` im Netzwerk namens `qorechainTestnet` (Chain-ID 9800) bereitstellen.

Wenn Hardhat `Confirm deploy to network qorechainTestnet (9800)?` fragt, geben Sie `y` ein und drücken Sie die Eingabetaste.

**Was Sie sehen sollten:** `[ CounterModule ] successfully deployed` und eine Zeile `CounterModule#Counter - 0x...`. Die `0x...` ist die Adresse Ihres Contracts. Wenn Sie `HHE10402` sehen, führen Sie denselben Befehl noch einmal aus (siehe Fehlerbehebung).

### Schritt 8: Die hybride Signatur auf der Chain verifizieren {#step-6-verify}

**Wie lange das dauert:** 3 Minuten.

Die Transaktion `opened:` aus Schritt 5 wurde mit beiden Schlüsseln signiert. Jeder kann sie am öffentlichen REST-Endpunkt prüfen.

1. Ersetzen Sie `<HASH>` durch diesen Hash (ohne `<` und `>`) und führen Sie aus:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Was es tut: fragt den öffentlichen Testnet-Server nach dem vollständigen Datensatz Ihrer Transaktion.

Parameter:

- `curl`: ein Programm, das eine Webadresse abruft.
- `-s`: still (silent), es blendet die Fortschrittsanzeige aus und zeigt nur die Antwort.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: die REST-Adresse des Testnets, gefolgt von Ihrem Transaktions-Hash.

**Was Sie sehen sollten:** einen langen Textblock. Achten Sie auf drei Dinge:

1. `"code": 0` innerhalb von `tx_response`. Code 0 bedeutet Erfolg.
2. Die Erweiterung `PQCHybridSignature`, die die ML-DSA-87-Signatur enthält: **4.627 Bytes**, neben der 64 Byte langen secp256k1-Signatur.
3. In `events` ein Ereignis vom Typ `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`.

2. Um nur dieses Ereignis auszugeben (braucht `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Was es tut: ruft denselben Datensatz ab und leitet ihn durch `jq`, das nur das Verifizierungsereignis behält.

Parameter:

- `|`: leitet die Ausgabe des ersten Befehls an den zweiten weiter.
- `jq`: das Filterprogramm.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: geht die Liste der Ereignisse durch und behält diejenigen, deren Typ `pqc_hybrid_verify` ist.

**Was Sie sehen sollten:** einen kleinen Textblock mit `"status"` auf `"verified"`.

3. Sehen Sie es sich im Explorer an:
   1. Öffnen Sie [explore.qore.network](https://explore.qore.network).
   2. Schalten Sie die Netzwerkauswahl auf **Testnet**.
   3. Suchen Sie nach dem Hash.

**Was Sie sehen sollten:** Die Transaktionsseite zeigt die Signatursicherheit als quantensicher, auf der Chain verifiziert, mit dem Algorithmus ML-DSA-87 (FIPS 204).

Das ist der Beweis: Die Validatoren haben beide Signaturen geprüft. Das ist Ihre Quantum-Pass-Transaktion.

## Was Sie sehen sollten, im Überblick {#what-you-should-see}

| Wo | Was |
| --- | --- |
| Nach Schritt 2 | `Done! Created qday-demo` und `2 passing` |
| Nach Schritt 3 | Eine Adresse `qor1...` und eine Adresse `0x...` aus `pnpm window status`, mit nicht registriertem Schlüssel |
| Nach Schritt 4 | **Tokens Sent!** auf dem Faucet |
| Nach Schritt 5 | `registered: <HASH>`, dann `opened: <HASH>` und die Fensterzeile |
| Nach Schritt 7 | `CounterModule#Counter - 0x...` |
| Nach Schritt 8 | `code` 0, eine 4.627 Byte lange ML-DSA-87-Signatur und `pqc_hybrid_verify` mit `status` `verified`, in der REST-Ausgabe und im Explorer im Testnet |

## Verwendete Pakete {#published}

Deklariert in der erzeugten `package.json`:

| Paket | Registry | Version |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

Der Scaffolder installiert außerdem die Hardhat-Toolbox sowie die Ignition- und Keystore-Plugins, die in der erzeugten `package.json` aufgeführt sind.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `HHE10402` oder „wait for confirmations“ direkt nach dem Öffnen des Fensters | Das Öffnen des Fensters hat die Nonce des Kontos erhöht | Führen Sie `pnpm deploy:testnet` noch einmal aus |
| „EVM authorisation window exhausted“ oder „no window“ | Dem Fenster sind die Transaktionen oder Blöcke ausgegangen, oder es gilt für einen anderen Contract (ein Fenster, das auf einen anderen Contract begrenzt ist, blockiert ein Deploy) | Führen Sie `pnpm window open` aus, um ein neues Fenster zu öffnen, warten Sie etwa 10 Sekunden und stellen Sie dann erneut bereit |
| „account has no PQC key and classical fallback is disabled“ | Das Konto hat noch keinen ML-DSA-87-Schlüssel registriert | Führen Sie zuerst `pnpm window register` aus und dann `pnpm window open` |
| „does not exist on chain yet“ | Das Konto hat noch kein QOR | Holen Sie QOR vom Faucet (Schritt 4) |
| „Rate Limit Reached“ auf dem Faucet, oder nach 30 Sekunden keine Token | Eine Anforderung pro 24 Stunden pro Konto und pro Adresse, und Anfragen werden nacheinander bearbeitet | Warten Sie ein paar Sekunden und versuchen Sie es erneut, oder warten Sie, bis die 24 Stunden vergangen sind. Nur eine Anfrage pro 24 Stunden |
| `pnpm: command not found` | pnpm ist nicht installiert. Mit Homebrew installiertes Node.js enthält es nicht | Führen Sie `npm install -g pnpm` aus und öffnen Sie dann ein neues Terminal |
| `pnpm window` bricht mit einer Meldung über einen fehlenden Wiederherstellungscode ab | `.env` hat `PRIVATE_KEY` ohne `QORE_PQC_RECOVERY_CODE` | Führen Sie `pnpm window recovery-code` aus und fügen Sie den Code in `.env` ein (Schritt 3), oder verwenden Sie `QORE_MNEMONIC` |
| „QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code“ | Ein Tippfehler, ein Leerzeichen oder ein Anführungszeichen beim Einfügen | Fügen Sie den Code noch einmal ohne Leerzeichen und Anführungszeichen ein |
| „registered, but NOT this key“ in `pnpm window status` | Für dieses Konto wurde früher ein anderer Wiederherstellungscode verwendet | Tragen Sie den ursprünglichen Wiederherstellungscode wieder in `.env` ein, oder beginnen Sie mit einem neuen Konto von vorn |
| CORS-Fehler in einer Browser-App | Ein Browser blockiert Aufrufe an eine Chain-Adresse, die Ihre Seite nicht zulässt | Verwenden Sie für REST-Aufrufe aus dem Browser den `/lcd`-Proxy-Pfad der Vorlage, statt die Chain-Adresse direkt aufzurufen |
| Hardhat startet nicht | Node.js ist älter als 22 | Installieren Sie Node.js 22 oder neuer (siehe „Bevor Sie beginnen“) und führen Sie `pnpm install` erneut aus |
| `curl` zeigt direkt nach dem Schritt `tx not found` | Der Block ist noch nicht final | Warten Sie 10 Sekunden und führen Sie den Befehl erneut aus |
| `curl` funktioniert in Windows PowerShell nicht | `curl` ist dort ein anderer Befehl | Geben Sie `curl.exe` statt `curl` ein |

## Die Beispiel-Apps {#example-apps}

Derselbe Ablauf, aus mehreren Sprachen und Frontends. Jede signiert hybrid. Alle befinden sich im öffentlichen Repository [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), Ordner `workshop-1`. Um sie zu erhalten, brauchen Sie Git (prüfen Sie mit `git --version`; Installation von [git-scm.com](https://git-scm.com/downloads)). Führen Sie dann aus:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Was es tut: lädt eine Kopie aller Beispiel-Apps herunter und wechselt in den Ordner `workshop-1`.

Parameter:

- `git clone <address>`: ein Projekt aus dem Internet auf Ihren Computer kopieren.
- `cd build-before-qday/workshop-1`: den Ordner betreten, der die sechs Apps enthält.

Jede App-Seite ist ein eigener vollständiger Leitfaden von Anfang bis Ende, mit dem, was Sie installieren müssen, und dem, was Sie erwarten können.

| App | Sprache | Seite |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Die Kits hinter diesen Apps stehen unter [Kits](/build-before-qday/workshop-1/kits). Wie Sie die QoreX-Wallet mit einer Browser-dApp verwenden, lesen Sie unter [QoreX](/qorex/overview).
