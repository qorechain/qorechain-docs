---
slug: /build-before-qday/prerequisites
title: "Bevor Sie beginnen: Werkzeuge und eine Testnet-Wallet"
sidebar_label: "Bevor Sie beginnen"
sidebar_position: 2
---

# Bevor Sie beginnen: Werkzeuge und eine Testnet-Wallet

Jedes Tutorial in diesem Bereich beginnt auf einem Computer, auf dem nichts installiert ist. Diese Seite ist der eine Ort, an dem Sie das einrichten. Machen Sie es einmal und öffnen Sie dann ein beliebiges Tutorial. Jedes Tutorial verweist hierher zurück und wiederholt nur die kurzen Prüfbefehle, die es braucht.

**Wie lange das dauert:** beim ersten Mal etwa 20 bis 40 Minuten, vor allem Downloads. Sie installieren nur die Werkzeuge für das Tutorial, dem Sie folgen möchten.

:::caution Nur ein Wegwerf-Testnet-Konto
Alles hier läuft auf dem QoreChain-**Testnet**, wo QOR keinen Wert hat. Verwenden Sie in keinem Tutorial Ihre echte Wallet, eine echte Wiederherstellungsphrase oder echtes Guthaben. Sie legen ein neues Konto nur für diese Übung an.
:::

## Welche Werkzeuge braucht jedes Tutorial? {#which-tools}

Installieren Sie nur die Zeilen, die Sie brauchen. Git, ein Terminal und ein Webbrowser werden von allen benötigt.

| Tutorial | Sprache | Zu installierende Werkzeuge | QoreX-Wallet |
| --- | --- | --- | --- |
| [Workshop-1-Anleitung](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (optional) | Nicht nötig |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Nicht nötig |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Nötig, mit einem Ethereum-Konto (Coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Nötig |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Nicht nötig |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Nicht nötig |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 oder neuer | Nicht nötig |

## Ein Terminal öffnen {#terminal}

Ein Terminal ist ein Fenster, in dem Sie Befehle eingeben. Sie fügen die Befehle von diesen Seiten einzeln dort ein.

| System | So öffnen Sie es |
| --- | --- |
| macOS | Drücken Sie Command und Leertaste, tippen Sie `Terminal` und drücken Sie die Eingabetaste. |
| Windows | Öffnen Sie das Startmenü, tippen Sie `PowerShell` und öffnen Sie **Windows PowerShell**. Für das Java-Tutorial brauchen Sie außerdem **Git Bash** (es wird mit Git installiert, siehe unten) oder WSL. |
| Linux | Drücken Sie Strg, Alt und T, oder suchen Sie in Ihren Anwendungen nach `Terminal`. |

Nachdem Sie ein Werkzeug installiert haben, **schließen Sie das Terminal und öffnen Sie ein neues**. Ein Terminal, das während der Installation offen war, kennt das neue Werkzeug noch nicht.

## Die Werkzeuge installieren {#install}

Für jedes Werkzeug gibt es den Installationsbefehl oder Download-Link und danach den **Prüfbefehl**. Ein Prüfbefehl fragt das Werkzeug nach seiner Version. Gibt er eine Versionsnummer aus, die der geforderten entspricht oder höher ist, funktioniert das Werkzeug.

### Paketmanager (optionale Helfer) {#package-managers}

Ein Paketmanager installiert andere Programme mit einem einzigen Befehl. Sie können jedes Werkzeug auch von Hand von seiner Website herunterladen. Die Befehle unten verwenden den Helfer, der zu Ihrem System passt.

| System | Helfer | So erhalten Sie ihn |
| --- | --- | --- |
| macOS | Homebrew | Fügen Sie diese eine Zeile in das Terminal ein und folgen Sie dann dem, was ausgegeben wird: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | In Windows 10 und 11 bereits enthalten. Prüfen mit `winget --version`. |
| Linux | apt | Unter Ubuntu und Debian bereits enthalten. Andere Systeme: Verwenden Sie Ihren eigenen Paketmanager (`dnf`, `pacman`). |

### Git {#git}

Git lädt den Beispielcode von GitHub herunter.

| System | Installation |
| --- | --- |
| macOS | `xcode-select --install` (ein Fenster öffnet sich, wählen Sie **Installieren**), oder `brew install git` |
| Windows | `winget install --id Git.Git -e`, oder Download von [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Prüfen Sie es:

```bash
git --version
```

Sie sollten eine Zeile wie `git version 2.40.0` sehen. Jede Version funktioniert.

### Node.js 22.13 oder neuer {#node}

Node.js führt die TypeScript-Projekte aus. Hardhat 3, das hier verwendete Contract-Werkzeug, startet bei allem, was älter als Node.js 22.13 ist, nicht.

| System | Installation |
| --- | --- |
| macOS | `brew install node`, oder laden Sie den LTS-Installer von [nodejs.org](https://nodejs.org) herunter |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, oder laden Sie den LTS-Installer von [nodejs.org](https://nodejs.org) herunter |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` dann `sudo apt install -y nodejs` |

:::note Linux: das Standard-apt-Paket nicht verwenden
Unter Ubuntu und Debian liefert `sudo apt install nodejs` eine alte Version, die zu niedrig ist. Verwenden Sie die NodeSource-Zeile oben.
:::

Prüfen Sie es:

```bash
node -v
```

Sie sollten `v22.13.0` oder höher sehen, zum Beispiel `v22.20.0` oder `v24.1.0`. Sehen Sie eine niedrigere Nummer, installieren Sie erneut und öffnen Sie ein neues Terminal.

### pnpm 9 oder neuer {#pnpm}

pnpm installiert die Bibliotheken, die ein TypeScript-Projekt braucht. Es erledigt dieselbe Aufgabe wie `npm`, nur schneller.

Installieren Sie es auf jedem System mit dem eigenen Installationswerkzeug von Node.js, `npm`:

```bash
npm install -g pnpm
```

| Teil | Was er tut |
| --- | --- |
| `npm install` | Lädt ein Programm herunter und installiert es. |
| `-g` | Kurz für „global“: installiert es für Ihren ganzen Computer, nicht nur für einen Ordner. |
| `pnpm` | Das Programm, das installiert werden soll. |

Endet das unter macOS und Linux mit `EACCES` oder „permission denied“, führen Sie es erneut als `sudo npm install -g pnpm` aus.

:::caution Node.js von Homebrew enthält kein pnpm
Wenn ein Tutorial `pnpm: command not found` (oder `zsh: command not found: pnpm`) meldet, haben Sie pnpm noch nicht installiert. Führen Sie `npm install -g pnpm` aus, öffnen Sie ein neues Terminal und versuchen Sie es erneut.
:::

Prüfen Sie es:

```bash
pnpm -v
```

Sie sollten `9.0.0` oder höher sehen, zum Beispiel `10.4.1`.

### curl und jq (nur Workshop-1-Anleitung) {#curl-jq}

`curl` lädt eine Webadresse aus dem Terminal herunter. Damit lesen Sie Ihre Transaktion vom öffentlichen REST-Endpunkt. `jq` filtert die lange Antwort, sodass Sie nur den gewünschten Teil sehen. `jq` ist optional.

| System | curl | jq |
| --- | --- | --- |
| macOS | Enthalten. | `brew install jq` |
| Windows | In Windows 10 und 11 als `curl.exe` enthalten. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl`, falls es fehlt | `sudo apt install -y jq` |

Prüfen Sie beide:

```bash
curl --version
jq --version
```

Sie sollten für jedes eine Versionszeile sehen, zum Beispiel `jq-1.7`.

:::note Windows PowerShell: curl.exe eintippen
In PowerShell ist das kurze Wort `curl` ein anderer eingebauter Befehl. Tippen Sie in jedem Befehl auf diesen Seiten `curl.exe` statt `curl`. Wenn Sie Git Bash verwenden, funktioniert das einfache `curl`.
:::

### Rust 1.88 oder neuer (nur Rust-Tutorial) {#rust}

Rust kompiliert die Kommandozeilen-App `qday-pay`. Sie installieren es mit `rustup`, dem offiziellen Rust-Installer. Er installiert auch `cargo`, das Rust-Build-Werkzeug.

| System | Installation |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (drücken Sie die Eingabetaste, um die Voreinstellung zu übernehmen). Die Compiler-Werkzeuge kommen mit `xcode-select --install`. |
| Windows | Laden Sie `rustup-init.exe` von [rustup.rs](https://rustup.rs) herunter und führen Sie es aus, oder `winget install --id Rustlang.Rustup -e`. Wenn nach den Visual Studio C++ Build Tools gefragt wird, stimmen Sie zu: Rust braucht sie, um Programme unter Windows zu bauen. |
| Linux | `sudo apt install -y build-essential curl` dann `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (drücken Sie die Eingabetaste, um die Voreinstellung zu übernehmen) |

Prüfen Sie es:

```bash
rustc --version
cargo --version
```

Sie sollten `rustc 1.88.0` oder höher und eine `cargo`-Versionszeile sehen. Wenn Sie Rust schon haben, bringt `rustup update` es auf den neuesten Stand.

### Java 21 und Maven (nur Java-Tutorial) {#java}

Die Tip-Jar-App braucht ein JDK ab Java 21 (die Werkzeuge zum Bauen und Ausführen von Java) und Maven, das Build-Werkzeug, das Java-Bibliotheken herunterlädt.

| System | Installation |
| --- | --- |
| macOS | `brew install --cask temurin@21` dann `brew install maven` (oder verwenden Sie den Installer von [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, laden Sie dann Maven von [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi) herunter, entpacken Sie es und fügen Sie seinen Ordner `bin` zum `PATH` hinzu. Einfacherer Weg: Installieren Sie WSL (siehe unten) und folgen Sie der Linux-Zeile. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Prüfen Sie beide:

```bash
java -version
mvn -version
```

Sie sollten `openjdk version "21` (oder eine höhere Zahl wie 25) und `Apache Maven 3.` gefolgt von einer Version sehen. Zeigt `java -version` 17 oder niedriger, installieren Sie Java 21 und öffnen Sie ein neues Terminal.

### Python 3.10 oder neuer mit venv (nur Python-Tutorial) {#python}

Python führt die Airdrop-App aus. `venv` legt einen privaten Ordner für ihre Bibliotheken an, sodass sonst nichts auf Ihrem Computer angetastet wird.

| System | Installation |
| --- | --- |
| macOS | `brew install python`, oder Download von [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, oder Download von [python.org](https://www.python.org/downloads/) und im Installer **Add python.exe to PATH** ankreuzen |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Prüfen Sie es:

```bash
python3 --version
```

Sie sollten `Python 3.10.0` oder höher sehen. Tippen Sie unter Windows stattdessen `python --version` (der Befehl heißt `python`, nicht `python3`).

### Windows und die Linux-Befehle: WSL {#wsl}

Die meisten Befehle in den Tutorials sind auf jedem System gleich. Einige verwenden Linux-Shell-Funktionen: `source`, `chmod`, `./tipjar` und `sleep`. Unter Windows haben Sie zwei Möglichkeiten:

1. **Natives Windows.** Verwenden Sie PowerShell für die TypeScript-, Rust- und Python-Tutorials. Die Tutorials nennen die Windows-Variante dort, wo sie sich unterscheidet, zum Beispiel `.venv\Scripts\activate`. Für das Java-Tutorial verwenden Sie **Git Bash** (wird mit Git installiert).
2. **WSL.** Das Windows-Subsystem für Linux gibt Ihnen ein echtes Linux innerhalb von Windows. Öffnen Sie PowerShell als Administrator, führen Sie den Befehl unten aus, starten Sie neu und folgen Sie dann den **Linux**-Zeilen auf dieser Seite im Ubuntu-Fenster.

```powershell
wsl --install
```

| Teil | Was er tut |
| --- | --- |
| `wsl` | Das Werkzeug für das Windows-Subsystem für Linux. |
| `--install` | Installiert WSL und das Linux-System Ubuntu in einem Schritt. |

## Alles auf einmal prüfen {#check-all}

Führen Sie die Befehle für die Werkzeuge aus, die Sie installiert haben. Jeder muss eine Version ausgeben.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Prüfung | Gute Antwort |
| --- | --- |
| `node -v` | `v22.13.0` oder höher |
| `pnpm -v` | `9.0.0` oder höher |
| `rustc --version` | `rustc 1.88.0` oder höher |
| `java -version` | `21` oder höher |
| `mvn -version` | `Apache Maven 3.` und eine Version |
| `python3 --version` | `Python 3.10.0` oder höher |

## Eine Testnet-Wallet besorgen {#wallet}

Sie brauchen einen Ort, an dem Sie Test-QOR halten. Manche Tutorials legen für Sie ein Wegwerf-Konto in einer Datei an. Andere verwenden die **QoreX**-Wallet, die offizielle Wallet von QoreChain, auf das Testnet umgestellt. Die Tabelle unter [Welche Werkzeuge braucht jedes Tutorial?](#which-tools) sagt, welche.

### QoreX auf dem Testnet {#qorex}

1. Installieren Sie QoreX aus dem offiziellen Angebot: [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) für das iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) für Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) für Chrome, Brave, Edge, Arc und Opera, oder [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). Die vollständige Liste steht in der [QoreX-Übersicht](/qorex/overview).
2. Erstellen Sie eine **neue** Wallet und schreiben Sie die Wiederherstellungsphrase auf Papier. Importieren Sie keine Phrase, die echtes Guthaben hält.
3. Stellen Sie die Wallet auf das Testnet um:
   - **Handy-App:** Öffnen Sie **Einstellungen** und schalten Sie dann **Use testnet (developers)** ein.
   - **Browser-Erweiterung:** Entsperren Sie sie und tippen Sie dann 7-mal auf die **Versionsnummer ganz unten**. Eine Entwickleroption erscheint. Wählen Sie **Switch to testnet (diana)**.
4. Prüfen Sie, dass das Testnet-Abzeichen angezeigt wird. Das Testnet heißt `qorechain-diana`.

**Was Sie sehen sollten:** ein Testnet-Abzeichen in der Wallet und eine `qor1...`-Adresse auf dem Startbildschirm. Testnet-Guthaben zeigen keinen Dollarwert, und das ist richtig so.

### Ein Ethereum-Konto hinzufügen (Coin 60) {#coin-60}

Das Guestbook-Tutorial verwendet die EVM-Lane, deshalb braucht die Wallet ein Konto im Ethereum-Stil.

1. Öffnen Sie in QoreX die Kontoliste und wählen Sie **Add an Ethereum account (coin 60)**.
2. Legen Sie ein neues an. Stellen Sie keine Phrase wieder her, die echtes Guthaben hält.
3. Wählen Sie dieses Konto aus. Es zeigt eine `0x...`-Adresse.

**Was Sie sehen sollten:** ein Konto mit der Bezeichnung *Ethereum, coin 60* und einer Adresse, die mit `0x` beginnt. Dasselbe Konto hat außerdem eine `qor1...`-Adresse.

Mehr zu Konten: [QoreX-Konto und Dashboard](/qorex/account-and-dashboard) und [Erste Schritte mit QoreX](/qorex/getting-started).

## Test-QOR vom Faucet holen {#faucet}

Der Faucet gibt kostenlose Test-QOR an eine Testnet-Adresse. Ein neues Konto muss zuerst welche erhalten, bevor es etwas tun kann, denn jede Transaktion zahlt eine kleine Netzwerkgebühr.

1. Öffnen Sie [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) in Ihrem Browser.
2. Melden Sie sich im QoreChain Dashboard an.
3. Fügen Sie Ihre `qor1...`-Adresse in das Adressfeld ein.
4. Wählen Sie **Request Tokens**.
5. Warten Sie auf **Tokens Sent!**.

**Was Sie sehen sollten:** die Karte **Tokens Sent!** mit 100 QOR und einem Link **View on Explorer**.

Der Faucet zahlt **100 QOR einmal alle 24 Stunden pro Konto** und pro Adresse. Fragen Sie zu früh erneut an, zeigt er **Rate Limit Reached**. Warten Sie, bis die 24 Stunden vorbei sind. Eine Anfrage genügt für jedes Tutorial auf dieser Seite.

### Ihre erste Transaktion registriert Ihren Post-Quanten-Schlüssel {#first-tx}

Jedes QoreChain-Konto hat zwei Schlüssel: einen klassischen Schlüssel und einen Post-Quanten-Schlüssel (ML-DSA-87). Die allererste Transaktion eines neuen Kontos **registriert den ML-DSA-87-Schlüssel on-chain**. Das geschieht nur einmal pro Konto und kostet etwa **0,09 QOR**. Danach wird jede Transaktion mit beiden Schlüsseln signiert.

Die Tutorials führen diesen Schritt mit einem Befehl namens `register` für Sie aus. Sie müssen jetzt nichts tun. Die 100 QOR vom Faucet reichen dafür viele Male.

## QOR und uqor {#units}

Sie werden zwei Namen für dieselbe Münze sehen. **QOR** ist die ganze Münze. **uqor** ist das kleinste Stück.

**1 QOR = 1.000.000 uqor.**

| Sie sehen | Es bedeutet |
| --- | --- |
| `1` QOR | 1.000.000 uqor |
| `0.1` QOR | 100.000 uqor |
| `0.09` QOR | 90.000 uqor |
| `0.15uqor` | Ein Preis von 0,15 uqor pro Gas-Einheit, der beim Bezahlen einer Gebühr verwendet wird |

Wallets und die meisten Befehle verwenden QOR. Die Chain selbst rechnet in uqor. Ein **Memo** ist ein kurzer Text, den Sie an eine Transaktion anhängen, etwa `Hello from the workshop`. Jeder kann es on-chain lesen, schreiben Sie also nie ein Geheimnis in ein Memo.

**Gas** ist das Maß für die Arbeit, die eine Transaktion vom Netzwerk verlangt. Die Gebühr ist das verbrauchte Gas mal dem Gaspreis. Die Werkzeuge in diesem Bereich schätzen das Gas für Sie, Sie müssen also nichts berechnen.

## Ihre Wegwerf-Schlüssel sicher aufbewahren {#key-hygiene}

Ein Tutorial erzeugt ein Geheimnis für Ihr Testnet-Konto und speichert es auf Ihrem Computer. Gehen Sie sorgfältig damit um, auch wenn Test-QOR keinen Wert hat, damit Sie sich die Gewohnheit vor dem Mainnet aneignen.

1. **Wo es liegt.** In den TypeScript-Tutorials stehen die Geheimnisse in einer Datei namens `.env` im Projektordner. Die Rust-, Java- und Python-Apps schreiben mit dem Befehl `new` eine Schlüsseldatei in einen versteckten Ordner namens `.config/qday` in Ihrem Home-Ordner. Das Tutorial nennt die genaue Datei.
2. **Niemals teilen.** Fügen Sie es nicht in einen Chat, eine E-Mail, einen Screenshot oder ein Video ein. Verbergen Sie die Datei, wenn Sie Ihren Bildschirm teilen.
3. **Niemals committen.** Fügen Sie `.env` oder eine Schlüsseldatei nie zu Git hinzu und pushen Sie sie nie zu GitHub. Tragen Sie `.env` in `.gitignore` ein, falls ein Projekt sie nicht schon ignoriert.
4. **Nur Testnet.** Verwenden Sie einen Testnet-Schlüssel, eine Wiederherstellungsphrase oder einen Wiederherstellungscode nie auf dem Mainnet wieder.
5. **Löschen, wenn Sie fertig sind.** Wenn Sie ein Tutorial beendet haben, löschen Sie die Schlüsseldatei oder `.env`. Ein neues Konto ist in einer Minute angelegt.

:::danger Echtes Guthaben
Geben Sie niemals den Schlüssel, die Mnemonic (Wiederherstellungsphrase) oder den Wiederherstellungscode eines Kontos mit echtem Guthaben in eine `.env`-Datei, eine Schlüsseldatei oder einen Befehl in diesem Bereich ein.
:::

## Das Netzwerk und die öffentlichen Endpunkte {#network}

| Dienst | Wert |
| --- | --- |
| Testnet-Name | `qorechain-diana` |
| EVM-Chain-ID | 9800 |
| REST (Daten über das Web lesen) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM-JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | [explore.qore.network](https://explore.qore.network), dann zu **Testnet** wechseln |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `pnpm: command not found` | pnpm ist nicht installiert. Node.js enthält es nicht, auch nicht bei einer Installation mit Homebrew. | Führen Sie `npm install -g pnpm` aus, öffnen Sie ein neues Terminal und führen Sie `pnpm -v` aus. |
| `node: command not found`, oder nach der Installation eine alte Version | Das Terminal war während der Installation offen, oder die alte Version hat Vorrang. | Schließen Sie das Terminal, öffnen Sie ein neues, führen Sie `node -v` aus. Verwenden Sie unter Linux die NodeSource-Zeile, nicht das Standard-apt-Paket. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js ist älter als 22.13. | Installieren Sie Node.js 22.13 oder neuer und führen Sie dann `pnpm install` erneut im Projekt aus. |
| `EACCES` oder permission denied bei `npm install -g pnpm` | Ihr Benutzer darf nicht in den globalen Ordner schreiben. | Führen Sie unter macOS und Linux `sudo npm install -g pnpm` aus. |
| `rustc: command not found` nach der Rust-Installation | Das Terminal kennt den neuen `PATH` noch nicht. | Öffnen Sie ein neues Terminal. Schlägt es weiter fehl, führen Sie `source "$HOME/.cargo/env"` aus. |
| `linker 'cc' not found` oder `link.exe not found` beim Bauen von Rust | Die C-Compiler-Werkzeuge fehlen. | macOS: `xcode-select --install`. Linux: `sudo apt install -y build-essential`. Windows: Installieren Sie die Visual Studio C++ Build Tools. |
| `java -version` zeigt 17 oder niedriger | Ein älteres Java hat Vorrang. | Installieren Sie Java 21, öffnen Sie ein neues Terminal und prüfen Sie erneut. |
| PowerShell meldet, dass das Ausführen von Skripten deaktiviert ist, wenn Sie das Python-venv aktivieren | Windows blockiert Skripte standardmäßig. | Führen Sie `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` aus, antworten Sie mit `Y` und aktivieren Sie dann erneut. |
| `Rate Limit Reached` beim Faucet | Der Faucet zahlt einmal alle 24 Stunden pro Konto und pro Adresse. | Warten Sie, bis die 24 Stunden vorbei sind. Eine Anfrage genügt für jedes Tutorial. |
| Die Wallet zeigt kein Testnet-Abzeichen | Die Wallet steht noch auf dem Mainnet. | Handy-App: Einstellungen, dann **Use testnet (developers)**. Erweiterung: 7-mal auf die Versionsnummer tippen, dann **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | Das neue Konto hat seinen ML-DSA-87-Schlüssel nicht registriert. | Führen Sie zuerst den Schritt `register` des Tutorials aus (er ist die erste Transaktion des Kontos). |
| CORS-Fehler in der Browser-Konsole | Der öffentliche REST-Endpunkt sendet keine CORS-Header, deshalb kann eine Webseite ihn nicht direkt aufrufen. | Rufen Sie den Endpunkt über den `/lcd`-Proxy des Projekts auf, wie es die Vorlage tut. |

## Nächster Schritt {#next}

Wählen Sie ein Tutorial aus der [Übersicht](/build-before-qday/overview#choose) und folgen Sie ihm ab dem ersten Befehl.
