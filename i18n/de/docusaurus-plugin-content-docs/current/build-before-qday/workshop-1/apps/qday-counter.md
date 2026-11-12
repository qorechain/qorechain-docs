---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Der Q-Day Counter ist das kleinste nützliche QoreChain-EVM-Projekt. Er besteht aus einem Solidity-Contract, der eine Zahl speichert, einem Hardhat-Projekt, das ihn im Testnet `qorechain-diana` bereitstellt, und einem kurzen Skript, das die Zahl liest und um eins erhöht.

Dieser Leitfaden ist für Einsteiger geschrieben. Sie müssen weder Solidity noch Blockchain-Werkzeuge kennen. Jeder Befehl wird erklärt, und jeder Schritt endet damit, was Sie sehen sollten.

**Wie lange das dauert:** beim ersten Mal etwa 25 Minuten, die meiste Zeit davon für die Installation der Werkzeuge und das Warten auf den Faucet.

## Was er zeigt {#shows}

- **Hybride Signierung gehört zum Deploy-Pfad.** Vor jeder EVM-Transaktion, auch vor einem Contract-Deploy, braucht das Konto einen registrierten Post-Quanten-Schlüssel (ML-DSA-87) und ein aktives EVM-Autorisierungsfenster. Das Fenster wird durch eine Transaktion geöffnet, die zweifach signiert ist: mit dem klassischen Schlüssel (secp256k1) und mit dem Post-Quanten-Schlüssel. Das ist eine hybride Signatur. Die Chain prüft beide.
- **Eine hybrid signierte Transaktion, die Sie verifizieren können.** Der Schritt `pnpm window open` sendet diese Transaktion. Sie können sie im Explorer nachschlagen und das eigene Urteil der Chain sehen.
- **Ihre gewohnten EVM-Werkzeuge funktionieren weiter.** Hardhat und viem senden gewöhnliche Ethereum-Transaktionen. Der Post-Quanten-Schutz sitzt im Fenster, sodass ein gestohlener secp256k1-Schlüssel allein nicht vom Konto ausgeben kann.

Ein Quantencomputer, der groß genug ist, um secp256k1 zu brechen, könnte klassische Signaturen fälschen. QoreChain verlangt eine zweite Signatur (ML-DSA-87, Standard FIPS 204), die ein solcher Computer nicht fälschen kann. Der Counter zeigt den gesamten Entwicklungsablauf mit eingeschalteter Regel: Schlüssel registrieren, Fenster öffnen, bereitstellen, aufrufen, lesen.

## Bevor Sie beginnen {#prerequisites}

Dieser Leitfaden verwendet ein Wegwerf-Konto im Testnet. Verwenden Sie niemals eine echte Wallet oder echtes Geld. Test-QOR hat keinen Wert.

Sie brauchen ein Terminal. Unter macOS öffnen Sie **Terminal**. Unter Windows öffnen Sie **PowerShell** (oder **Git Bash**, das mit Git mitgeliefert wird). Unter Linux öffnen Sie ein beliebiges Terminal. Installieren Sie dann diese drei Werkzeuge. Wenn der Prüfbefehl bereits eine passende Version ausgibt, überspringen Sie die Installation.

### Node.js 22 oder neuer

Node.js führt JavaScript auf Ihrem Computer aus. Hardhat 3 braucht Node.js 22 oder neuer.

| System | Installation | Prüfung |
| --- | --- | --- |
| macOS | `brew install node` (braucht [Homebrew](https://brew.sh)), oder Download von https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, oder Download von https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, ein neues Terminal öffnen, dann `nvm install 22` | `node --version` |

Was Sie sehen sollten: eine Zahl, die mit `v22` oder höher beginnt, etwa `v22.12.0`. Schließen Sie unter Windows PowerShell nach der Installation und öffnen Sie es neu.

### pnpm

pnpm lädt die Bibliotheken herunter, die ein Projekt braucht. Es wird mit keiner Node.js-Installation mitgeliefert, Sie fügen es also selbst hinzu, auf jedem System.

```sh
npm install -g pnpm
```

| Teil | Bedeutung |
| --- | --- |
| `npm` | Das Werkzeug, das mit Node.js mitkommt. Es installiert andere Werkzeuge. |
| `install` | Herunterladen und installieren. |
| `-g` | Global: für den ganzen Computer installieren, nicht nur für einen Ordner. |
| `pnpm` | Das Werkzeug, das installiert werden soll. |

Prüfen Sie es mit `pnpm --version`. Sie sollten eine Zahl wie `9.12.0` sehen (9 oder höher). Wenn Sie jemals `pnpm: command not found` sehen, haben Sie diesen Schritt übersprungen: Führen Sie den obigen Installationsbefehl aus und öffnen Sie dann ein neues Terminal.

Wenn Linux oder macOS `EACCES: permission denied` meldet, führen Sie stattdessen `sudo npm install -g pnpm` aus.

### Git

Git lädt das Projekt von GitHub herunter.

| System | Installation | Prüfung |
| --- | --- | --- |
| macOS | `xcode-select --install` oder `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, oder Download von https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) oder `sudo dnf install git` (Fedora) | `git --version` |

Was Sie sehen sollten: `git version 2.` und eine Zahl.

## Eine Testnet-Wallet {#wallet}

Sie brauchen ein Testnet-Konto mit etwas QOR darauf. Dieser Leitfaden erstellt es in den nächsten Schritten für Sie (eine Schlüsseldatei). Für den Counter brauchen Sie QoreX nicht. Wenn Sie dasselbe Konto später in einer Wallet sehen möchten, verwenden Sie [QoreX](/qorex/overview) im Testnet:

- **QoreX-App:** Einstellungen, dann **Use testnet (developers)**.
- **QoreX-Browser-Erweiterung:** Entsperren Sie sie, tippen Sie 7 Mal auf die Versionsnummer ganz unten und wählen Sie dann **Switch to testnet (diana)**.
- Für die EVM-Lane wählen Sie **Add an Ethereum account (coin 60)**.

Der Faucet gibt kostenloses Test-QOR aus: https://dashboard.qorechain.io/faucet. Sie melden sich an, fügen eine Adresse ein und fordern an. Sie erhalten 100 QOR pro 24 Stunden und Konto.

**Zu den Beträgen.** QOR ist der Coin. `uqor` ist sein kleinster Teil: 1 QOR = 1.000.000 uqor. Gebühren auf der Chain werden in `uqor` angezeigt. Die erste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel, was einmalig eine Gebühr von etwa 0,09 QOR kostet.

## Schritt für Schritt {#steps}

### 1. Den Code holen {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**Was es tut**

- `git clone <address>` lädt eine Kopie des Projekts von GitHub in einen neuen Ordner namens `build-before-qday` herunter.
- `cd <folder>` setzt Ihr Terminal in den Projektordner des Counters. Jeder spätere Befehl läuft von hier aus.

**Was Sie sehen sollten:** `Cloning into 'build-before-qday'...` und dann Ihre Eingabeaufforderung im neuen Ordner. **Wie lange:** ein paar Sekunden.

Optional: Wenn Sie das Projekt lieber von Grund auf bauen möchten, wie im Live-Workshop, lesen Sie am Ende der Schritte [Dasselbe Projekt von Grund auf bauen](#scaffold).

### 2. Die Bibliotheken installieren {#step-install}

```sh
pnpm install
```

**Was es tut**

- `pnpm install` liest die Liste der Bibliotheken in `package.json` und lädt sie in einen Ordner `node_modules` herunter (Hardhat, das QoreChain SDK und mehr).

**Was Sie sehen sollten:** eine Liste von Paketen mit `+`-Zeichen und `Done in` einige Sekunden. **Wie lange:** unter einer Minute.

### 3. Tests und Build ausführen {#step-test}

```sh
pnpm test
```

**Was es tut**

- `pnpm test` führt die Prüfungen des Projekts auf einer Schein-Chain in Ihrem Computer aus. Es braucht keinen Schlüssel, kein Netzwerk und kein QOR. Beim ersten Lauf wird auch der Solidity-Compiler heruntergeladen, deshalb braucht es Internet.

**Was Sie sehen sollten:** `Counter`, zwei Zeilen mit Haken (`starts at the constructor value`, `increments and emits CountChanged`) und `2 passing`.

```sh
pnpm build
```

**Was es tut**

- `pnpm build` wandelt den Solidity-Contract in Maschinencode um (kompiliert ihn). Nach `pnpm test` erscheint `No contracts to compile`, was in Ordnung ist: Der Test hat ihn bereits kompiliert.

### 4. Die Einstellungsdatei erstellen {#step-account}

Das Projekt liest Ihre Geheimnisse aus einer Datei namens `.env`. Erstellen Sie sie aus der Vorlage.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Was es tut**

- `cp` (oder `copy`) kopiert die Vorlagendatei `.env.example` in eine neue Datei `.env`.

Die Datei `.env` ist Ihre **Schlüsseldatei**. Sie liegt nur in diesem Projektordner. Sie enthält einen Wegwerf-Schlüssel. **Geben Sie sie niemals weiter, committen Sie sie niemals in Git und verwenden Sie diese Schlüssel niemals für eine echte Wallet.** Das Projekt ignoriert `.env` in Git bereits. Öffnen Sie sie in einem beliebigen Texteditor (`open -e .env` unter macOS, `notepad .env` unter Windows, `nano .env` unter Linux). Sie tragen zwei Werte ein.

**a. Ein privater Wegwerf-Schlüssel.** Erzeugen Sie einen zufälligen:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Was es tut**

- `node -e "..."` führt eine Zeile JavaScript aus.
- Die Zeile erzeugt 32 zufällige Bytes und gibt sie hexadezimal mit vorangestelltem `0x` aus. Das ist ein privater Schlüssel.

**Was Sie sehen sollten:** eine Zeile, `0x` gefolgt von 64 Buchstaben und Ziffern. Kopieren Sie sie als `PRIVATE_KEY=0x...` in `.env` und ersetzen Sie dabei den Platzhalter aus lauter Nullen.

**b. Ein Post-Quanten-Wiederherstellungscode.** Der ML-DSA-87-Schlüssel des Kontos wird aus einem zweiten Geheimnis erzeugt, dem Wiederherstellungscode.

```sh
pnpm window recovery-code
```

**Was es tut**

- `pnpm window` startet das Helferskript `scripts/window.ts`. Das Wort danach ist der Befehl.
- `recovery-code` gibt einen neuen zufälligen Wiederherstellungscode aus.

**Was Sie sehen sollten:** eine Zeile, die mit `QRC1-` beginnt, dann ein kurzer Hinweis. Kopieren Sie die Zeile `QRC1-...` als `QORE_PQC_RECOVERY_CODE=QRC1-...` in `.env`. Behalten Sie für dieses Konto denselben Code: Ein neuer Code ergibt einen anderen Post-Quanten-Schlüssel.

Lassen Sie `QORE_MNEMONIC` leer. (Eine Mnemonic ist eine Phrase aus 12 oder 24 Wörtern, die die beiden obigen Werte ersetzen kann. Verwenden Sie das eine oder das andere, nicht beides.) Behalten Sie `QORE_NETWORK=testnet`, womit der Helfer angewiesen wird, mit dem Testnetzwerk zu sprechen. Ihre `.env` sieht so aus, mit Platzhaltern:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Speichern Sie die Datei.

### 5. Ihre Kontoadresse anzeigen {#step-address}

```sh
pnpm window status
```

**Was es tut**

- `status` zeigt Ihr Konto, ob dessen Post-Quanten-Schlüssel registriert ist und ob Sie ein EVM-Fenster haben.

**Was Sie sehen sollten:** drei Zeilen. Die erste lautet `account:  0x...  (qor1...)`. Ihr Konto hat zwei Adressen: `0x...` für die EVM und `qor1...` für die Native-Lane. Sie gehören zum selben Konto. Die anderen beiden Zeilen lauten `PQC key:  not registered` und `window:   none`. Das ist normal: Das Konto ist neu. Kopieren Sie die Adresse `qor1...` aus der ersten Zeile.

### 6. Test-QOR vom Faucet holen {#step-faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Stellen Sie sicher, dass die Seite auf **Testnet** steht.
3. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie das QOR an. Sie erhalten 100 QOR einmal alle 24 Stunden pro Konto.
4. Warten Sie etwa 10 Sekunden und führen Sie dann `pnpm window status` erneut aus.

**Was Sie sehen sollten:** dieselben drei Zeilen wie zuvor: Der Schlüssel ist weiterhin `not registered`, und es gibt kein Fenster. Das Konto enthält jetzt QOR. Wenn Sie einen Beleg möchten, öffnen Sie https://explore.qore.network (Testnet) und suchen Sie nach Ihrer Adresse `qor1...`.

### 7. Den Schlüssel registrieren und das Fenster öffnen {#step-window}

```sh
pnpm window register
```

**Was es tut**

- `register` sendet den öffentlichen ML-DSA-87-Schlüssel des Kontos an die Chain. Das tun Sie einmal pro Konto. Es ist die eine Nachricht, die die Chain ohne Post-Quanten-Signatur akzeptiert, weil auf der Chain noch kein Schlüssel zum Abgleichen liegt. Sie kostet etwa 0,09 QOR.

**Was Sie sehen sollten:** `registered: ` gefolgt von einem Transaktions-Hash (64 Zeichen).

```sh
pnpm window open
```

**Was es tut**

- `open` sendet eine Transaktion, signiert mit beiden Schlüsseln (hybrid), die ein EVM-Autorisierungsfenster öffnet. Solange das Fenster aktiv ist, sind Ihre gewöhnlichen EVM-Transaktionen erlaubt. Standardmäßig dauert es 600 Blöcke und erlaubt 5 Transaktionen. Das können Sie mit `QORE_WINDOW_BLOCKS` und `QORE_WINDOW_TXS` in `.env` ändern.

**Was Sie sehen sollten:** `opened: ` gefolgt von einem Transaktions-Hash, dann `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Kopieren Sie diesen Hash.** Sie prüfen ihn in Schritt 10.

Warten Sie nun etwa 10 Sekunden. Das Öffnen des Fensters ändert den Transaktionszähler des Kontos, und der nächste Befehl muss den neuen Wert sehen.

```sh
sleep 10
pnpm window status
```

**Was es tut**

- `sleep 10` wartet 10 Sekunden (funktioniert auch in PowerShell und Git Bash).
- `status` zeigt das Ergebnis.

**Was Sie sehen sollten:** `PQC key:  registered` und `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Den Contract bereitstellen {#step-deploy}

```sh
pnpm deploy:testnet
```

**Was es tut**

- Es führt Hardhat Ignition aus, das Werkzeug, das Contracts bereitstellt, mit dem Modul `Counter` im Netzwerk `qorechainTestnet` (Chain-ID 9800, das QoreChain-Testnet).
- Es bittet Sie um Bestätigung. Geben Sie `y` ein und drücken Sie die Eingabetaste.

**Was Sie sehen sollten:** eine Bestätigungsfrage zum Bereitstellen auf `qorechainTestnet` (9800), dann nach Ihrem `y` eine Zeile, die mit `CounterModule#Counter` und Ihrer Contract-Adresse `0x...` endet. Das ist die Adresse Ihres Contracts. **Wie lange:** etwa 30 Sekunden.

### 9. Lesen und erhöhen {#step-interact}

```sh
pnpm interact
```

**Was es tut**

- Liest die gespeicherte Zahl, ruft `increment()` auf (addiert eins) und liest sie dann erneut. Der Aufruf verbraucht eine der 5 Transaktionen Ihres Fensters.

**Was Sie sehen sollten:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1` und einen Explorer-Link.

```sh
pnpm interact --read
```

**Was es tut**

- `--read` bedeutet nur lesen: Es zeigt die Zahl und sendet nichts.

**Was Sie sehen sollten:** die Counter-Adresse und `count: 1`.

### 10. Die hybride Transaktion verifizieren {#step-explorer}

Die Transaktion von `pnpm window open` ist Ihr Beleg dafür, dass die Chain eine Post-Quanten-Signatur geprüft hat. Prüfen Sie sie auf zwei Arten.

**a. Mit der einfachen Webanfrage.** Ersetzen Sie `<HASH>` durch den Hash aus Schritt 7. Entfernen Sie `<` und `>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Was es tut**

- `curl <address>` fragt einen öffentlichen QoreChain-Server nach dem Datensatz dieser Transaktion und gibt ihn aus. Geben Sie in Windows PowerShell `curl.exe` statt `curl` ein.
- `api-testnet.qore.host` ist der öffentliche Testnet-Server. `<HASH>` ist die Transaktion, die Sie möchten.

**Was Sie in der langen Antwort sehen sollten:**

- `"code": 0`, was bedeutet, dass die Transaktion erfolgreich war.
- Eine Erweiterung vom Typ `PQCHybridSignature`, die die ML-DSA-87-Signatur enthält, 4.627 Bytes lang.
- Ein Ereignis `pqc_hybrid_verify` mit dem Attribut `status` auf `verified`.

**b. Mit dem Explorer.**

1. Öffnen Sie https://explore.qore.network und schalten Sie die Netzwerkauswahl auf **Testnet**.
2. Suchen Sie nach dem Hash von `pnpm window open`. Die Seite zeigt eine Post-Quanten-Signatur, die die Chain verifiziert hat.
3. Suchen Sie nach dem Hash `increment tx` aus Schritt 9 oder nach Ihrer Counter-Adresse, um den Contract-Aufruf zu sehen.

Der [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) zeigt dieselbe Art von Beleg Byte für Byte.

## Dasselbe Projekt von Grund auf bauen {#scaffold}

Der Live-Workshop beginnt mit einem leeren Ordner. Dieser Befehl erzeugt dasselbe Hardhat-Projekt (ohne das Skript `interact`, das nur die heruntergeladene Kopie hat). Führen Sie ihn statt Schritt 1 in einem Ordner aus, in dem Sie Projekte ablegen.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Teil | Bedeutung |
| --- | --- |
| `npx` | Führt ein Werkzeug direkt aus dem Internet aus, ohne es zu installieren. |
| `create-qorechain-dapp@latest` | Der QoreChain-Projektersteller, neueste Version. |
| `qday-demo` | Der Name des neuen Ordners. |
| `-t hardhat` | Welche Projektvorlage verwendet wird: ein Hardhat-3-Projekt mit Contract, Tests und dem Fenster-Helfer. |
| `--network testnet` | Mit welchem QoreChain-Netzwerk das Projekt spricht: dem Testnetzwerk, nicht dem echten. |
| `--package-manager pnpm` | Welches Werkzeug die Bibliotheken installiert. |

**Was Sie sehen sollten:** eine Liste installierter Pakete, dann `Done! Created qday-demo`. Die Bibliotheken sind bereits installiert, und eine Datei `.env` existiert bereits, Sie können also Schritt 2 und das Kopieren in Schritt 4 überspringen. Machen Sie weiter mit `pnpm test` (Schritt 3), dann 4a und 4b (die `.env` füllen) und den Schritten 5 bis 8. **Wie lange:** etwa 30 Sekunden.

## Was Sie am Ende sehen sollten {#result}

- `pnpm test` gibt `2 passing` aus.
- `pnpm window status` gibt `PQC key:  registered` und `window:   live` mit den verbleibenden Blöcken, Transaktionen und dem verbleibenden Wert aus.
- `pnpm deploy:testnet` gibt die Adresse des bereitgestellten `Counter` aus (`0x...`).
- `pnpm interact` zeigt `count` von 0 auf 1, `status: success` und einen Explorer-Link.
- Die Prüfung mit `curl` zeigt `"code": 0`, die Erweiterung `PQCHybridSignature` und das Ereignis `pqc_hybrid_verify` mit `status` `verified`. Der Explorer (Testnet) markiert dieselbe Transaktion als verifiziert.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `pnpm: command not found` | pnpm ist nicht installiert. Node.js enthält es nicht. | Führen Sie `npm install -g pnpm` aus und öffnen Sie dann ein neues Terminal. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js ist zu alt. | Installieren Sie Node.js 22 oder neuer und prüfen Sie `node --version`. |
| `node: .env: not found` | In diesem Ordner gibt es keine Datei `.env`. | Führen Sie Schritt 4 aus, und führen Sie den Befehl im Projektordner aus. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | Die Datei `.env` fehlt, oder `PRIVATE_KEY` ist noch der Platzhalter oder hat einen Tippfehler. | Führen Sie Schritt 4 noch einmal aus. Speichern Sie die Datei. Führen Sie den Befehl im Projektordner aus. |
| `Set QORE_PQC_RECOVERY_CODE in .env` oder `not a valid QRC1 recovery code` | Der Wiederherstellungscode ist leer oder hat einen Tippfehler. | Führen Sie `pnpm window recovery-code` aus und fügen Sie die ganze Zeile `QRC1-...` ein. |
| `... does not exist on chain yet: send it some QOR first` (bei `register` oder `open`) | Das Konto hat noch kein QOR. | Fordern Sie QOR vom Faucet an (Schritt 6) und warten Sie 10 Sekunden. |
| Der Faucet meldet, dass Sie das Limit erreicht haben | Eine Anfrage pro 24 Stunden pro Konto. | Warten Sie und versuchen Sie es dann erneut. Oder verwenden Sie ein zweites Wegwerf-Konto. |
| `account has no PQC key and classical fallback is disabled` | Sie haben eine Transaktion gesendet, bevor Sie den Schlüssel registriert haben. | Führen Sie `pnpm window register` aus, dann `pnpm window open`. |
| `EVM authorisation window exhausted` (oder der Hinweis `open an EVM window first`) | Dem Fenster sind die Blöcke oder Transaktionen ausgegangen, oder es wurde nie geöffnet. | Führen Sie `pnpm window open` aus, warten Sie 10 Sekunden und versuchen Sie es erneut. |
| `HHE10402` nach dem Öffnen des Fensters | Das Deploy lief, bevor der Transaktionszähler des Kontos aktualisiert war. | Warten Sie 10 Sekunden und führen Sie `pnpm deploy:testnet` erneut aus. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` findet den Contract nicht. | Schließen Sie Schritt 8 in diesem Ordner ab. |
| `PQC key: registered, but NOT this key` | Der Wiederherstellungscode in `.env` weicht von dem bei der Registrierung verwendeten ab. | Tragen Sie den ursprünglichen Wiederherstellungscode wieder ein. Ein anderer Code ergibt einen anderen Schlüssel. |
| CORS-Fehler in einer Browser-App | Der öffentliche REST-Server sendet keine CORS-Header, daher blockiert ihn ein Browser. | Verwenden Sie den `/lcd`-Proxy der Vorlage, wie es die [Guestbook-Webseite](/build-before-qday/workshop-1/apps/qday-guestbook) tut. |

## Der Code {#code}

Der Contract (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

Der hybrid signierte Teil von `scripts/window.ts` (die Fensternachricht und der Signer):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` ist das Konto, das aus Ihrem Schlüsselmaterial erzeugt wird, und `net` ist der Netzwerkeintrag für `QORE_NETWORK` (Standard `testnet`, Chain-ID `qorechain-diana`). Die vom Skript verwendete Gebühr beträgt 100000 `uqor` (0,1 QOR) bei einem Gas-Limit von 800000, weil hybride Transaktionen groß sind.

## Verwendete Pakete {#packages}

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hybride Signierung, Registrierung des PQC-Schlüssels, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM-Fenster-Helfer (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Senden der Transaktion der Native-Lane |
| `hardhat` | ^3.21.1 | Kompilieren, Testen, Ignition-Deploy |
| `viem` | ^2.47.6 | Lesen und Schreiben des Contracts |
| `tsx` | ^4.19.0 | Ausführen der TypeScript-Skripte |
| `typescript` | ^5.6.3 | Typprüfung |

Siehe [Scaffolder und CLI](/developer-tools/scaffolders-and-cli) und [Das SDK installieren](/sdk/install).

## Netzwerkdaten {#networks}

| Eintrag | Wert |
| --- | --- |
| Netzwerk | Testnet `qorechain-diana` |
| EVM-Chain-ID | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM-RPC | `https://evm-testnet.qore.host` |

Quelle: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
