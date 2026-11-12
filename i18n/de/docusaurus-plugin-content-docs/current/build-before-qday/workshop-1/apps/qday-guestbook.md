---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Das Q-Day Guestbook ist ein Gästebuch auf der Chain im QoreChain-EVM-Testnet. Jeder kann es einmal pro Adresse mit einer Nachricht von bis zu 140 Zeichen signieren. Es hat zwei Teile:

- **`contracts-app/`**: ein Solidity-Contract und ein Hardhat-Projekt. Sie stellen es bereit und können vom Terminal aus signieren.
- **`web/`**: eine Webseite, die sich in Ihrem Browser öffnet, die QoreX-Wallet verbindet, das EVM-Fenster des Kontos anzeigt und die neuesten Signaturen live auflistet.

Dieser Leitfaden ist für Einsteiger geschrieben. Jeder Befehl wird erklärt, und jeder Schritt endet damit, was Sie sehen sollten.

**Wie lange das dauert:** beim ersten Mal etwa 35 Minuten: 20 für den Contract-Teil, 15 für die Webseite.

## Was es zeigt {#shows}

- **Eine Browser-dApp, die hybrid signiert, ohne es zu wissen.** Die Seite ist eine gewöhnliche wagmi- und RainbowKit-App. QoreX ergänzt die Post-Quanten-Hälfte (ML-DSA-87) der Signatur, sodass dieselbe Transaktion durch den klassischen Schlüssel (secp256k1) und durch einen Post-Quanten-Schlüssel geschützt ist.
- **Das EVM-Fenster ist in der Oberfläche sichtbar.** Die Seite liest das Fenster des Kontos von der Chain und zeigt, ob es aktiv ist und wie viele Blöcke und Transaktionen übrig sind.
- **Lesbare Ablehnungen.** Wenn die Chain einen Schreibzugriff ablehnt, ordnet die Seite den Fehler einer von vier Ursachen zu (kein registrierter Schlüssel, kein Fenster, Fenster aufgebraucht, ungültige Parameter) und zeigt die Lösung.
- **Hybride Signaturen, auf der Chain verifiziert.** Jede Signatur, die Sie schreiben, ist eine Transaktion, die die Chain erst akzeptiert hat, nachdem sie beide Signaturen geprüft hatte.

## Bevor Sie beginnen {#prerequisites}

Dieser Leitfaden verwendet für den Terminal-Teil ein Wegwerf-Konto im Testnet. Verwenden Sie niemals eine echte Wallet oder echtes Geld. Test-QOR hat keinen Wert.

Sie brauchen ein Terminal. Unter macOS öffnen Sie **Terminal**. Unter Windows öffnen Sie **PowerShell** (oder **Git Bash**, das mit Git mitgeliefert wird). Unter Linux öffnen Sie ein beliebiges Terminal. Installieren Sie diese drei Werkzeuge. Wenn der Prüfbefehl bereits eine passende Version ausgibt, überspringen Sie die Installation.

### Node.js 22 oder neuer

Node.js führt JavaScript auf Ihrem Computer aus. Hardhat 3 braucht Node.js 22 oder neuer.

| System | Installation | Prüfung |
| --- | --- | --- |
| macOS | `brew install node` (braucht [Homebrew](https://brew.sh)), oder Download von https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, oder Download von https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, ein neues Terminal öffnen, dann `nvm install 22` | `node --version` |

Was Sie sehen sollten: eine Zahl, die mit `v22` oder höher beginnt. Schließen Sie unter Windows PowerShell nach der Installation und öffnen Sie es neu.

### pnpm

pnpm lädt die Bibliotheken herunter, die ein Projekt braucht. Node.js enthält es nicht, installieren Sie es also selbst, auf jedem System.

```sh
npm install -g pnpm
```

| Teil | Bedeutung |
| --- | --- |
| `npm` | Das Werkzeug, das mit Node.js mitkommt. Es installiert andere Werkzeuge. |
| `install` | Herunterladen und installieren. |
| `-g` | Global: für den ganzen Computer installieren, nicht nur für einen Ordner. |
| `pnpm` | Das Werkzeug, das installiert werden soll. |

Prüfen Sie es mit `pnpm --version`. Sie sollten eine Zahl wie `9.12.0` sehen (9 oder höher). Wenn Sie jemals `pnpm: command not found` sehen, führen Sie den obigen Installationsbefehl aus und öffnen Sie ein neues Terminal. Wenn macOS oder Linux `EACCES: permission denied` meldet, verwenden Sie `sudo npm install -g pnpm`.

### Git

| System | Installation | Prüfung |
| --- | --- | --- |
| macOS | `xcode-select --install` oder `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, oder Download von https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) oder `sudo dnf install git` (Fedora) | `git --version` |

Was Sie sehen sollten: `git version 2.` und eine Zahl.

## Testnet-Wallets {#wallet}

Dieser Leitfaden verwendet zwei Konten, und sie sind absichtlich verschieden:

1. **Ein Schlüsseldatei-Konto** für den Terminal-Teil (Schritte 3 bis 6). Der Leitfaden erstellt es für Sie. Es stellt den Contract bereit.
2. **Ein QoreX-Konto** für die Webseite (Schritte 8 und 9). Die Webseite signiert damit.

**QoreX im Testnet.** [QoreX](/qorex/overview) ist die QoreChain-Wallet. Für die Webseite verwenden Sie die Browser-Erweiterung (siehe [QoreX-Integrationen](/developer-tools/qorex-integrations)). Installieren Sie sie in dem Browser, den Sie verwenden werden, und dann:

- **QoreX-Browser-Erweiterung:** Entsperren Sie sie, tippen Sie 7 Mal auf die Versionsnummer ganz unten und wählen Sie dann **Switch to testnet (diana)**.
- **QoreX-App auf Ihrem Telefon:** Einstellungen, dann **Use testnet (developers)**.
- Für die EVM-Lane wählen Sie **Add an Ethereum account (coin 60)**. Die Webseite braucht ein Konto mit Coin 60.

**Der Faucet** gibt kostenloses Test-QOR aus: https://dashboard.qorechain.io/faucet. Melden Sie sich an, fügen Sie eine Adresse ein und fordern Sie an. Sie erhalten 100 QOR pro 24 Stunden und Konto.

**Zu den Beträgen.** QOR ist der Coin. `uqor` ist sein kleinster Teil: 1 QOR = 1.000.000 uqor. Die erste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel, eine einmalige Gebühr von etwa 0,09 QOR.

## Teil 1: der Contract {#contract}

### 1. Den Code holen {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Was es tut**

- `git clone <address>` lädt das Projekt von GitHub in einen neuen Ordner `build-before-qday` herunter.
- `cd <folder>` setzt Ihr Terminal in das Guestbook-Projekt. Es hat zwei Ordner, `contracts-app` und `web`, die Sie getrennt einrichten.

**Was Sie sehen sollten:** `Cloning into 'build-before-qday'...`. **Wie lange:** ein paar Sekunden.

### 2. Die Bibliotheken installieren und testen {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Was es tut**

- `cd contracts-app` wechselt in den Contract-Ordner.
- `pnpm install` lädt die in `package.json` aufgeführten Bibliotheken herunter (Hardhat und das QoreChain SDK).
- `pnpm test` führt die Prüfungen des Contracts auf einer Schein-Chain in Ihrem Computer aus. Es braucht keinen Schlüssel und kein Netzwerkkonto. Beim ersten Lauf wird der Solidity-Compiler heruntergeladen.

**Was Sie sehen sollten:** eine Liste von Paketen, `Done in` einige Sekunden, dann `QDayGuestbook` mit drei Haken und `3 passing`. **Wie lange:** etwa eine Minute.

### 3. Die Schlüsseldatei erstellen {#step-account}

Das Projekt liest seine Geheimnisse aus einer Datei namens `.env`. Erstellen Sie sie aus der Vorlage.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Was es tut**

- `cp` (oder `copy`) kopiert die Vorlage `.env.example` in eine neue Datei `.env`.

Die Datei `.env` ist Ihre **Schlüsseldatei**. Sie liegt nur im Ordner `contracts-app`. **Geben Sie sie niemals weiter, committen Sie sie niemals in Git und verwenden Sie diese Schlüssel niemals für eine echte Wallet.** Das Projekt ignoriert `.env` in Git bereits. Öffnen Sie sie in einem beliebigen Texteditor (`open -e .env` unter macOS, `notepad .env` unter Windows, `nano .env` unter Linux) und tragen Sie zwei Werte ein.

**a. Ein privater Wegwerf-Schlüssel.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Was es tut**

- `node -e "..."` führt eine Zeile JavaScript aus. Die Zeile erzeugt 32 zufällige Bytes und gibt sie hexadezimal mit vorangestelltem `0x` aus. Das ist ein privater Schlüssel.

**Was Sie sehen sollten:** eine Zeile, `0x` und danach 64 Buchstaben und Ziffern. Kopieren Sie sie als `PRIVATE_KEY=0x...` in `.env` und ersetzen Sie dabei den Platzhalter aus lauter Nullen.

**b. Ein Post-Quanten-Wiederherstellungscode.**

```sh
pnpm window recovery-code
```

**Was es tut**

- `pnpm window` startet das Helferskript `scripts/window.ts`. Das Wort danach ist der Befehl.
- `recovery-code` gibt einen neuen zufälligen Code aus, aus dem der ML-DSA-87-Schlüssel des Kontos erzeugt wird.

**Was Sie sehen sollten:** eine Zeile, die mit `QRC1-` beginnt. Kopieren Sie sie als `QORE_PQC_RECOVERY_CODE=QRC1-...` in `.env`. Behalten Sie für dieses Konto denselben Code: Ein neuer Code ergibt einen anderen Post-Quanten-Schlüssel.

Lassen Sie `QORE_MNEMONIC` leer (eine Mnemonic ist eine Phrase aus 12 oder 24 Wörtern, die die beiden obigen Werte ersetzen kann; verwenden Sie das eine oder das andere, nicht beides) und behalten Sie `QORE_NETWORK=testnet`, womit der Helfer angewiesen wird, das Testnetzwerk zu verwenden. Ihre `.env` sieht so aus (Platzhalter gezeigt):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Speichern Sie die Datei.

### 4. Das Konto aufladen {#step-faucet}

```sh
pnpm window status
```

**Was es tut**

- Zeigt Ihr Konto, ob dessen Post-Quanten-Schlüssel registriert ist und ob es ein EVM-Fenster hat.

**Was Sie sehen sollten:** `account:  0x...  (qor1...)`, dann `PQC key:  not registered` und `window:   none`. Kopieren Sie die Adresse `qor1...`. Danach:

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Stellen Sie sicher, dass die Seite auf **Testnet** steht.
3. Fügen Sie die Adresse `qor1...` ein und fordern Sie das QOR an (100 QOR einmal alle 24 Stunden pro Konto).
4. Warten Sie etwa 10 Sekunden. Wenn Sie Ihre Adresse auf https://explore.qore.network (Testnet) suchen, sehen Sie das Guthaben.

### 5. Schlüssel registrieren, Fenster öffnen, bereitstellen {#step-window}

```sh
pnpm window register
```

**Was es tut**

- Sendet Ihren öffentlichen ML-DSA-87-Schlüssel einmal pro Konto an die Chain. Es ist die eine Nachricht, die die Chain ohne Post-Quanten-Signatur akzeptiert, weil auf der Chain noch kein Schlüssel zum Abgleichen liegt. Sie kostet etwa 0,09 QOR.

**Was Sie sehen sollten:** `registered: ` und einen Transaktions-Hash.

```sh
pnpm window open
```

**Was es tut**

- Sendet eine Transaktion, signiert mit beiden Schlüsseln (hybrid), die ein EVM-Autorisierungsfenster öffnet. Solange es aktiv ist, sind Ihre gewöhnlichen EVM-Transaktionen erlaubt. Standardmäßig dauert es 600 Blöcke und erlaubt 5 Transaktionen.

**Was Sie sehen sollten:** `opened: ` und einen Transaktions-Hash, dann `window: 600 blocks, 5 txs, ...`. **Kopieren Sie diesen Hash** für den letzten Schritt.

```sh
sleep 10
```

**Was es tut**

- Wartet 10 Sekunden (funktioniert auch in PowerShell und Git Bash). Das Öffnen des Fensters ändert den Transaktionszähler des Kontos, und der nächste Befehl muss den neuen Wert sehen.

```sh
pnpm deploy:testnet
```

**Was es tut**

- Führt Hardhat Ignition aus, das Werkzeug, das Contracts bereitstellt, mit dem Modul `QDayGuestbook` im Netzwerk `qorechainTestnet` (Chain-ID 9800, das QoreChain-Testnet).
- Es bittet Sie um Bestätigung. Geben Sie `y` ein und drücken Sie die Eingabetaste.

**Was Sie sehen sollten:** eine Zeile, die mit `QDayGuestbookModule#QDayGuestbook` und Ihrer Contract-Adresse `0x...` endet. **Kopieren Sie diese Adresse**: Die Webseite braucht sie. **Wie lange:** etwa 30 Sekunden.

### 6. Vom Terminal aus signieren {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Was es tut**

- `pnpm sign "<message>"` schreibt einen Eintrag ins Gästebuch. Der Text in Anführungszeichen ist Ihre Nachricht, bis zu 140 Zeichen.
- `pnpm sign --read` liest nur: Es listet die neuesten Einträge auf und sendet nichts.

**Was Sie sehen sollten:** nach dem ersten Befehl `tx: 0x...` und `status: success in block ...`. Nach dem zweiten `guestbook 0x...: 1 signatures` und Ihre Nachricht mit der Zeit und Ihrer Adresse.

Jede Adresse kann einmal signieren. Ein zweites `pnpm sign` vom selben Konto wird vom Contract mit `AlreadySigned` abgelehnt.

## Teil 2: die Webseite {#web}

### 7. Die Seite installieren und konfigurieren {#step-web}

Öffnen Sie ein zweites Terminalfenster im selben Projektordner, oder gehen Sie mit `cd ..` zurück. Dann:

```sh
cd web
pnpm install
```

**Was es tut**

- Wechselt in den Web-Ordner und lädt dessen Bibliotheken herunter (React, wagmi, RainbowKit, Vite).

**Was Sie sehen sollten:** eine Liste von Paketen und `Done in` einige Sekunden.

Erstellen Sie die Einstellungsdatei der Seite. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. Öffnen Sie `web/.env` in einem Editor und setzen Sie die Contract-Adresse, die Sie in Schritt 5 kopiert haben:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Lassen Sie `VITE_WALLETCONNECT_PROJECT_ID` leer. Sie wird nur gebraucht, wenn Sie in `src/wagmi.ts` eine WalletConnect-Wallet hinzufügen.

### 8. Die Seite starten und QoreX verbinden {#step-run}

```sh
pnpm dev
```

**Was es tut**

- Startet einen kleinen Webserver auf Ihrem eigenen Computer (Vite). Die Seite liegt unter `http://localhost:5174`. Der Server leitet außerdem Anfragen, die mit `/lcd` beginnen, an den öffentlichen Testnet-REST-Server weiter. Der Browser kann diesen Server nicht direkt aufrufen (er sendet keine CORS-Header), deshalb übernimmt dieser Proxy das für die Seite.
- Der Befehl läuft weiter. Lassen Sie dieses Terminal geöffnet. Drücken Sie später `Ctrl+C`, um ihn zu beenden. Wenn Sie `web/.env` ändern, beenden Sie ihn und starten Sie ihn neu.

**Was Sie sehen sollten:** `VITE ... ready` und `Local: http://localhost:5174/`.

Nun, in dem Browser, in dem QoreX installiert ist:

1. Öffnen Sie http://localhost:5174 .
2. Stellen Sie sicher, dass QoreX entsperrt und auf Testnet umgeschaltet ist (siehe „Testnet-Wallets“ oben), mit einem Konto mit Coin 60, das QOR vom Faucet hat. Verwenden Sie auf der Faucet-Seite die Form `qor1...` seiner Adresse, falls QoreX beide Formen anzeigt.
3. Wählen Sie auf der Seite in Karte 1 **Connect QoreX** (die Schaltfläche zum Verbinden). Wenn QoreX nicht zuerst aufgeführt ist, wählen Sie es aus der Liste der Wallets.
4. QoreX öffnet ein Fenster, das um die Verbindung bittet. Bestätigen Sie es.

**Was Sie sehen sollten:** Karte 1 zeigt Ihr Konto `0x...`, die Chain `qorechain-diana EVM (9800)`, Ihr Guthaben und das EVM-Fenster: `no window open` bei einem neuen Konto. Karte 3 zeigt `On chain now: 1 signatures` und den Eintrag, den Sie in Schritt 6 geschrieben haben. Wenn die Chain-Zeile `wrong chain` zeigt, schalten Sie QoreX auf Testnet um.

### 9. Mit QoreX signieren {#step-sign}

1. Geben Sie in Karte 2 eine Nachricht ein (bis zu 140 Zeichen). Die Seite zeigt, wie viele Sie verbraucht haben.
2. Wählen Sie **Sign**.
3. QoreX öffnet seine Freigabe. Wenn Ihr Konto noch keinen Post-Quanten-Schlüssel oder kein Fenster hat, bietet QoreX an, den Schlüssel zu registrieren (einmalige Gebühr von etwa 0,09 QOR) und das EVM-Fenster in derselben Freigabe zu öffnen. Wählen Sie, es zu tun.
4. Bestätigen Sie in QoreX. Die Schaltfläche zeigt `Approve in QoreX...`, solange sie wartet.

**Was Sie sehen sollten:** eine Zeile `tx 0x...` mit einem Link zum Explorer, zuerst `waiting for the block...`, dann `success in block ...`. Karte 1 zeigt das EVM-Fenster jetzt als `live` mit verbleibenden Blöcken und Transaktionen. Karte 3 fügt Ihre Nachricht oben hinzu, die neueste zuerst. Sie listet bis zu 20 Einträge auf und aktualisiert sich alle paar Sekunden. Wenn Sie es von derselben Adresse noch einmal versuchen, steht in Karte 2 `This address has already signed.`

### 10. Auf der Chain verifizieren {#step-explorer}

Verwenden Sie den Hash von `pnpm window open` (Schritt 5). Für die Seite öffnet QoreX das Fenster auch in einer eigenen Transaktion: Fragen Sie QoreX nach seinem Verlauf oder suchen Sie Ihre Adresse im Explorer.

**a. Mit der einfachen Webanfrage.** Ersetzen Sie `<HASH>` durch den Hash (entfernen Sie `<` und `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Was es tut**

- `curl <address>` fragt einen öffentlichen QoreChain-Server nach dem Datensatz dieser Transaktion und gibt ihn aus. Geben Sie in Windows PowerShell `curl.exe` statt `curl` ein.

**Was Sie in der langen Antwort sehen sollten:**

- `"code": 0`, was bedeutet, dass die Transaktion erfolgreich war.
- Eine Erweiterung vom Typ `PQCHybridSignature` mit der ML-DSA-87-Signatur, 4.627 Bytes lang.
- Ein Ereignis `pqc_hybrid_verify` mit `status` auf `verified`.

**b. Mit dem Explorer.** Öffnen Sie https://explore.qore.network, schalten Sie die Netzwerkauswahl auf **Testnet** und suchen Sie nach dem Transaktions-Hash (aus Schritt 5, 6 oder 9), Ihrer Kontoadresse oder der Adresse von `QDayGuestbook`. Die Fenstertransaktion zeigt eine Post-Quanten-Signatur, die die Chain verifiziert hat.

## Was Sie am Ende sehen sollten {#result}

- `pnpm test` in `contracts-app` gibt `3 passing` aus.
- `pnpm window status` gibt `PQC key:  registered` und `window:   live` mit den verbleibenden Blöcken, Transaktionen und dem verbleibenden Wert aus.
- `pnpm deploy:testnet` gibt die Adresse von `QDayGuestbook` aus (`0x...`).
- `pnpm sign "..."` gibt den Transaktions-Hash und `status: success in block ...` aus.
- Die Seite zeigt Ihr Konto, `qorechain-diana EVM (9800)`, Ihr Guthaben und das Fenster als `live`. Nach **Sign** und Ihrer Freigabe sehen Sie einen Transaktionslink und `success in block ...`.
- Die Liste unten zeigt die Anzahl der Signaturen und die neuesten Einträge, die neuesten zuerst.
- Die Prüfung mit `curl` zeigt `"code": 0`, die Erweiterung `PQCHybridSignature` und `pqc_hybrid_verify` mit `status` `verified`.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `pnpm: command not found` | pnpm ist nicht installiert. Node.js enthält es nicht. | Führen Sie `npm install -g pnpm` aus und öffnen Sie dann ein neues Terminal. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js ist zu alt. | Installieren Sie Node.js 22 oder neuer. |
| `node: .env: not found` | In diesem Ordner gibt es keine Datei `.env`. | Führen Sie Schritt 3 in `contracts-app` aus, und führen Sie die Befehle in diesem Ordner aus. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` oder `Set QORE_PQC_RECOVERY_CODE ...` | Ein Wert in `.env` ist leer, ein Platzhalter oder hat einen Tippfehler. | Füllen Sie beide Werte wie in Schritt 3 und speichern Sie. |
| `... does not exist on chain yet: send it some QOR first` | Das Konto hat noch kein QOR. | Verwenden Sie den Faucet (Schritt 4) und warten Sie 10 Sekunden. |
| Der Faucet meldet, dass Sie das Limit erreicht haben | Eine Anfrage pro 24 Stunden pro Konto. | Warten Sie und versuchen Sie es dann erneut. |
| `account has no PQC key and classical fallback is disabled` | Eine Transaktion wurde gesendet, bevor der Schlüssel registriert war. | Führen Sie `pnpm window register` aus, dann `pnpm window open`. Bestätigen Sie in QoreX die Registrierung, die bei Ihrem ersten Senden angeboten wird. |
| `EVM authorisation window exhausted` oder `open an EVM window first` | Dem Fenster sind die Blöcke oder Transaktionen ausgegangen, oder es wurde nie geöffnet. | Führen Sie `pnpm window open` aus (Terminal) und warten Sie 10 Sekunden. Bestätigen Sie auf der Seite das neue Fenster, wenn QoreX es anbietet. |
| `HHE10402` nach dem Öffnen des Fensters | Das Deploy lief, bevor der Transaktionszähler des Kontos aktualisiert war. | Warten Sie 10 Sekunden und führen Sie `pnpm deploy:testnet` erneut aus. |
| `refused: ... (AlreadySigned)` | Diese Adresse hat schon signiert. | Jede Adresse signiert einmal. Verwenden Sie ein anderes Konto. |
| `refused: ... (BadLength)` | Die Nachricht ist leer oder länger als 140 Zeichen. | Verwenden Sie 1 bis 140 Zeichen. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` findet den Contract nicht. | Schließen Sie Schritt 5 in `contracts-app` ab. |
| Die Seite zeigt keine Einträge, und die Schaltfläche **Sign** ist grau | `VITE_GUESTBOOK_ADDRESS` ist in `web/.env` leer. | Fügen Sie die Adresse aus Schritt 5 ein, beenden Sie dann `pnpm dev` (`Ctrl+C`) und starten Sie es neu. |
| Die Seite meldet `wrong chain` | QoreX ist nicht im Testnet. | Schalten Sie QoreX auf Testnet (diana) um, siehe „Testnet-Wallets“. |
| QoreX wird beim Verbinden nicht angeboten | Die Seite wurde in einem Browser ohne die QoreX-Erweiterung geöffnet, oder die Erweiterung ist gesperrt. | Öffnen Sie http://localhost:5174 in dem Browser mit QoreX und entsperren Sie es. |
| Port 5174 wird bereits verwendet | Ein anderes Programm belegt ihn. | Schließen Sie es, oder verwenden Sie die andere Adresse, die Vite ausgibt. |
| `could not read` neben dem EVM-Fenster, oder CORS-Fehler in der Browser-Konsole | Die Seite hat den REST-Server direkt aufgerufen, und dieser sendet keine CORS-Header. | Rufen Sie REST nur über den `/lcd`-Proxy des Entwicklungsservers auf, wie dieses Projekt es tut. Starten Sie die Seite mit `pnpm dev`. |

## Der Code {#code}

Der Contract speichert Einträge in einem Array und erlaubt eine Signatur pro Adresse:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX ist die erste Wallet in der Connector-Liste (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Die Seite zeigt das Fenster und erklärt Ablehnungen (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Verwendete Pakete {#packages}

Contracts (`contracts-app/`):

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Fenster-Helferskript, hybride Signierung |
| `@qorechain/evm` | ^0.13.0 | Chain-Definitionen, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Senden der Fensternachricht |
| `hardhat` | ^3.21.1 | Kompilieren, Testen, Ignition-Deploy |
| `viem` | ^2.47.6 | Ethereum-Client |
| `tsx` | ^4.19.0 | Ausführen der TypeScript-Skripte |
| `typescript` | ^5.6.3 | Typprüfung |

Webseite (`web/`):

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Chain-Definitionen, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX als RainbowKit-Wallet |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Verbinden-Schaltfläche |
| `wagmi` | ^2.19.5 | React-Hooks für Lese- und Schreibzugriffe |
| `viem` | ^2.53.1 | Ethereum-Client |
| `@tanstack/react-query` | ^5.59.0 | Datenabruf für das Fenster und Chain-Lesezugriffe |
| `react`, `react-dom` | ^18.3.1 | Oberfläche |
| `vite` | ^5.4.0 | Entwicklungsserver |
| `@vitejs/plugin-react` | ^4.3.0 | React-Unterstützung für Vite |
| `typescript` | ^5.6.3 | Typprüfung |

Quelle: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
