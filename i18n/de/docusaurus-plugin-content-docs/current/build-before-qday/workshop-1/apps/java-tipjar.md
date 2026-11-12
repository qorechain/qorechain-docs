---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java-App, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java-App: Q-Day Tip Jar

Der **Q-Day Tip Jar** ist ein kleines Java-Programm für das QoreChain-Testnet (`qorechain-diana`, EVM-Chain-ID 9800). Er sendet Trinkgelder mit einer **hybriden Signatur**: einer klassischen secp256k1-Signatur plus einer Post-Quanten-Signatur ML-DSA-87 (FIPS 204). Er kann außerdem eine "Spendendose" (Jar) als Adresse beobachten, wie das Backend eines Shops, und quantensichere Trinkgelder von klassischen unterscheiden.

**Wie lange das dauert:** beim ersten Mal etwa 20 Minuten (10 Minuten Werkzeuge installieren, 5 Minuten Einrichtung, 5 Minuten Senden und Prüfen).

Sie müssen kein Java können. Sie tippen nur die folgenden Befehle nacheinander ein und vergleichen das Ergebnis mit "Was Sie sehen sollten".

## Was er zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1** aus Java mit einem einzigen Aufruf im SDK.
- **Eine hybrid signierte Transaktion, on-chain verifiziert**: Die Chain zeichnet ein Ereignis `pqc_hybrid_verify` mit `status=verified` auf, und die Transaktion trägt eine 4.627 Bytes große ML-DSA-87-Signatur.
- **Ein Backend, das quantensichere Trinkgelder von klassischen unterscheidet**: `watch` beschriftet jede eingehende Überweisung mit `QUANTUM-SAFE` oder `classical only`.

Warum das wichtig ist: Man erwartet, dass eine rein klassische Signatur von einem künftigen Quantencomputer gebrochen werden kann. Ein Dienst, der den eigenen Verifikationsnachweis der Chain prüft, kann entscheiden, wie sehr er jeder Zahlung vertraut. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

:::warning Nur Testnet
Verwenden Sie ausschließlich ein Wegwerf-Konto im Testnet. Testnet-QOR hat keinen Wert. Verwenden Sie in diesem Tutorial niemals Ihre echte Wallet, Ihre echte Wiederherstellungsphrase oder echtes Geld.
:::

## Begriffe, die Ihnen begegnen {#words}

| Begriff | Bedeutung |
| --- | --- |
| Testnet | Eine Übungskopie von QoreChain. Die Coins darauf sind kostenlos und wertlos. |
| QOR und uqor | Zwei Namen für dieselbe Münze. 1 QOR = 1.000.000 uqor. Die App fragt nach QOR. Gebühren werden in uqor angezeigt. |
| Memo | Ein kurzer Text, der an eine Transaktion angehängt wird, wie ein Verwendungszweck bei einer Überweisung. |
| Adresse | Ihre öffentliche Kontonummer. Bei QoreChain beginnt sie mit `qor1`. Sie darf weitergegeben werden. |
| Schlüsseldatei | Eine Datei mit Ihrer geheimen Wiederherstellungsphrase. Geben Sie sie niemals weiter. |
| Faucet | Eine Webseite, die kostenlose Testnet-QOR verteilt. |
| Hash | Die eindeutige ID einer Transaktion. Damit schlagen Sie die Transaktion nach. |

## Bevor Sie beginnen {#before}

Sie brauchen drei Werkzeuge: **Git** (lädt den Code herunter), **Java 21 oder neuer** (führt die App aus) und **Maven** (baut die App). Schließen Sie nach jeder Installation **das Terminal und öffnen Sie ein neues**, und führen Sie dann den Prüfbefehl aus.

| Werkzeug | macOS | Windows | Linux (Debian oder Ubuntu) | Prüfen |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew von https://brew.sh) | https://git-scm.com/download/win (damit erhalten Sie auch "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (wählen Sie Temurin 21, den .msi-Installer) | `sudo apt install openjdk-21-jdk` | `java -version` muss 21 oder höher anzeigen |
| Maven | `brew install maven` | Laden Sie das Zip von https://maven.apache.org/download.cgi herunter und folgen Sie https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

Verwenden Sie unter Windows für dieses Tutorial **Git Bash** (wird mit Git installiert) als Terminal, weil der Starter `tipjar` ein Shell-Skript ist. Unter macOS verwenden Sie Terminal. Unter Linux ein beliebiges Terminal. Wenn Sie lieber reine PowerShell nutzen, lesen Sie den Hinweis in Schritt 3.

**Unter macOS mit Homebrew:** `brew install openjdk@21` fordert Sie unter Umständen auf, es zu verlinken. Zeigt `java -version` weiterhin eine alte Version an, führen Sie aus, was Homebrew unter "For the system Java wrappers to find this JDK" ausgibt, und öffnen Sie dann ein neues Terminal.

## Testnet-Wallet und kostenlose QOR besorgen {#wallet}

Die App erzeugt ihren eigenen Wegwerf-Schlüssel (Schritt 4 unten), Sie brauchen für dieses Tutorial also nicht zwingend eine Wallet-App. Sie brauchen aber einen Ort, an dem Sie Testnet-QOR erhalten. Wenn Sie Ihr Konto zusätzlich in QoreX sehen möchten:

1. **QoreX-App:** Öffnen Sie die Einstellungen und aktivieren Sie **Use testnet (developers)**.
2. **QoreX-Browser-Erweiterung:** Entsperren Sie sie, tippen Sie unten 7 Mal auf die Versionsnummer und wählen Sie dann **Switch to testnet (diana)**.

Die kostenlosen QOR kommen vom Faucet unter https://dashboard.qorechain.io/faucet. Sie melden sich an, fügen die Adresse ein und fordern an. Er gibt **100 QOR pro 24 Stunden und Konto** aus.

Die allererste Transaktion eines neuen Kontos registriert dessen Post-Quanten-Schlüssel ML-DSA-87 auf der Chain. Das ist ein einmaliger Schritt mit einer Gebühr von etwa 0,09 QOR. Die App erledigt ihn für Sie mit dem Befehl `register`.

## Schritt für Schritt {#run}

### 1. Den Code herunterladen {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Was es tut**

- `git clone <address>`: kopiert das Projekt von GitHub in einen neuen Ordner namens `build-before-qday` auf Ihrem Computer.
- `cd <folder>`: wechselt Ihr Terminal in den Ordner der Java-App. Jeder spätere Befehl muss aus diesem Ordner ausgeführt werden.

**Was Sie sehen sollten:** Zeilen wie `Cloning into 'build-before-qday'...` und dann Ihre Eingabeaufforderung im neuen Ordner.

### 2. Die App bauen {#build}

```bash
mvn -q package
```

**Was es tut:** Maven lädt das QoreChain-SDK von Maven Central herunter und packt die App in eine einzige ausführbare Datei, `target/tipjar.jar`.

| Teil | Bedeutung |
| --- | --- |
| `mvn` | Das Build-Werkzeug Maven. |
| `package` | Den Code kompilieren und in eine `.jar`-Datei packen. |
| `-q` | Stiller Modus: nur Probleme ausgeben. |

**Was Sie sehen sollten:** einige Sekunden lang nichts (beim ersten Mal etwa 10 Sekunden, bei langsamer Verbindung etwas länger), dann kehrt Ihre Eingabeaufforderung zurück. Prüfen Sie, ob die Datei existiert:

```bash
ls target/tipjar.jar
```

**Was Sie sehen sollten:** `target/tipjar.jar`.

### 3. Den Starter ausführbar machen und testen {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Was es tut**

| Teil | Bedeutung |
| --- | --- |
| `chmod +x tipjar` | Erlaubt, die Datei `tipjar` als Programm auszuführen. Ein frischer Download hat diese Berechtigung nicht. |
| `./tipjar` | Führt den Starter in diesem Ordner aus. Er startet `java -jar target/tipjar.jar`. Ohne Befehl gibt er die Hilfe aus. |

**Was Sie sehen sollten:** eine Liste von Befehlen: `new`, `status`, `register`, `tip`, `watch`.

:::note Reine PowerShell unter Windows
Überspringen Sie `chmod`. Ersetzen Sie in jedem Befehl unten `./tipjar` durch `java -jar target/tipjar.jar`.
:::

### 4. Ihr Wegwerf-Testnet-Konto anlegen {#key}

```bash
./tipjar new
```

**Was es tut:** legt ein frisches Konto an. Es schreibt eine geheime Wiederherstellungsphrase in die Schlüsseldatei `~/.config/qday/java.env` (in Ihrem Home-Ordner, nur für Sie lesbar) und gibt nur die öffentliche Adresse aus.

| Teil | Bedeutung |
| --- | --- |
| `new` | Eine neue Schlüsseldatei anlegen und ihre Adresse ausgeben. |
| `new --force` | Eine vorhandene Schlüsseldatei ersetzen. Der alte Schlüssel geht verloren. |

**Was Sie sehen sollten:** `new jar key`, den Pfad der Schlüsseldatei und eine `address`, die mit `qor1...` beginnt. Die Wiederherstellungsphrase wird nie ausgegeben.

**Kopieren Sie die `qor1...`-Adresse.** Wenn Sie sie verlieren, gibt `./tipjar status` sie erneut aus. Geben Sie die Schlüsseldatei niemals weiter, committen Sie sie niemals in Git und verwenden Sie sie niemals im Mainnet. Um den Schlüssel an einem anderen Ort zu halten, setzen Sie zuerst `TIPJAR_KEY`: `TIPJAR_KEY=/path/to/file ./tipjar status` (in PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Testnet-QOR vom Faucet holen {#faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre `qor1...`-Adresse ein und klicken Sie auf die Anfrage-Schaltfläche.
3. Warten Sie einige Sekunden und führen Sie dann aus:

```bash
./tipjar status
```

**Was es tut:** fragt das Testnet nach Ihrem Guthaben und danach, ob Ihr Post-Quanten-Schlüssel registriert ist.

**Was Sie sehen sollten:** `balance   100 QOR` (oder den Betrag des Faucets) und eine Zeile, die sagt, dass der ML-DSA-87-Schlüssel noch nicht registriert ist. Ist das Guthaben 0, warten Sie 10 Sekunden und führen Sie den Befehl erneut aus.

### 6. Ihren Post-Quanten-Schlüssel registrieren {#register}

```bash
./tipjar register
```

**Was es tut:** hinterlegt Ihren ML-DSA-87-Schlüssel einmalig auf der Chain. Der Befehl kann gefahrlos erneut ausgeführt werden. Diese erste Transaktion wird nur mit dem klassischen Schlüssel signiert, weil auf der Chain noch kein Post-Quanten-Schlüssel zum Signieren vorhanden ist. Sie kostet etwa 0,09 QOR. Jede Transaktion danach wird hybrid signiert.

**Was Sie sehen sollten:** einen Transaktions-Hash und eine Meldung, dass der Schlüssel registriert ist. Führen Sie `./tipjar status` erneut aus, es sollte den Schlüssel jetzt als registriert zeigen.

**Wie lange:** einige Sekunden (ein Block).

### 7. Eine zweite Adresse zum Empfangen von Trinkgeld anlegen {#jar}

Ein Trinkgeld braucht jemanden, der es empfängt. Legen Sie ein zweites Wegwerf-Konto an, die "Spendendose" (Jar), mit eigener Schlüsseldatei:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Was es tut:** Der Teil vor `./tipjar` setzt die Schlüsseldatei nur für diesen einen Befehl (`TIPJAR_KEY`), damit das neue Konto Ihr erstes nicht überschreibt. In Windows PowerShell führen Sie zuerst `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"` aus, dann `java -jar target/tipjar.jar new`, und setzen es danach mit `Remove-Item Env:TIPJAR_KEY` zurück.

**Was Sie sehen sollten:** eine neue `qor1...`-Adresse. Kopieren Sie sie. Das ist Ihre **Jar-Adresse**. Die Spendendose braucht keine QOR, um Trinkgelder zu empfangen.

### 8. Ein hybrid signiertes Trinkgeld senden {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Ersetzen Sie `qor1...JAR_ADDRESS` durch die Jar-Adresse aus Schritt 7.

| Teil | Bedeutung |
| --- | --- |
| `tip` | Ein Trinkgeld senden. |
| `qor1...JAR_ADDRESS` | Wer das Trinkgeld erhält. |
| `1` | Der Betrag in QOR (also 1 QOR = 1.000.000 uqor). |
| `"my first quantum-safe tip"` | Das Memo, ein kurzer Text, der an die Transaktion angehängt wird. Optional. Behalten Sie die Anführungszeichen bei, wenn er Leerzeichen enthält. |

**Was es tut:** Die App fragt die Chain, wie viel Gas die Transaktion braucht (ein Testlauf), addiert 30 Prozent als Sicherheitsaufschlag, signiert mit beiden Schlüsseln, sendet sie, wartet auf den Block und prüft dann den eigenen Nachweis der Chain.

**Was Sie sehen sollten:** den Transaktions-Hash, die Blockhöhe und das Ergebnis `QUANTUM-SAFE`. Sehen Sie `CHECK FAILED`, lesen Sie die Fehlerbehebung. Kopieren Sie den Hash.

**Wie lange:** etwa 10 Sekunden.

### 9. Die Spendendose beobachten, wie es ein Shop-Backend täte {#watch}

Öffnen Sie ein **zweites Terminal**, wechseln Sie in denselben Ordner und starten Sie den Beobachter:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Gehen Sie nun zurück zum ersten Terminal und senden Sie ein weiteres Trinkgeld (Schritt 8, mit einem neuen Memo).

**Was es tut:** `watch` fragt die Chain alle 3 Sekunden nach neuen Überweisungen an die Spendendose und beschriftet jede davon. `NO_COLOR=1 ./tipjar watch ...` schaltet die Farben aus. Mit Strg+C beenden Sie es.

**Was Sie sehen sollten:** jedes Trinkgeld aufgelistet mit der Markierung `QUANTUM-SAFE`. Ein Trinkgeld ohne verifizierte hybride Signatur würde `classical only` zeigen.

## Die Transaktion selbst verifizieren {#verify}

Sie müssen der App nicht vertrauen. Fragen Sie die Chain direkt.

**Weg 1, im Browser.** Öffnen Sie `https://explore.qore.network/tx/<HASH>` (setzen Sie Ihren Hash anstelle von `<HASH>` ein) und schalten Sie den Explorer dann auf **Testnet**. Sie sollten eine erfolgreiche Transaktion sehen.

**Weg 2, ein Befehl.** Setzen Sie Ihren Hash anstelle von `<HASH>` ein:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Teil | Bedeutung |
| --- | --- |
| `curl` | Ein Werkzeug, das eine Webadresse herunterlädt. In macOS, Windows 10+ und den meisten Linux-Systemen enthalten. |
| `-s` | Still: den Fortschrittsbalken ausblenden. |
| die Adresse | Die öffentliche Testnet-REST-API. Sie liefert den vollständigen Transaktionsdatensatz als JSON. |

**Was Sie sehen sollten** in der langen Ausgabe (verwenden Sie einen JSON-Viewer oder hängen Sie `| jq .` an, wenn Sie jq installiert haben):

- `"code": 0` bedeutet, dass die Transaktion erfolgreich war.
- Eine `PQCHybridSignature`-Erweiterung mit einer `pqc_signature` von **4.627 Bytes** (das ist die ML-DSA-87-Signatur).
- Ein Ereignis `pqc_hybrid_verify` mit `status` auf `verified` für Ihre Adresse.

## Wie der Nachweis funktioniert {#proof}

Die App liest denselben Datensatz von `GET /cosmos/tx/v1beta1/txs/{hash}` und sucht das Ereignis `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) sowie die Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` mit einer 4.627 Bytes großen Signatur. Der Beobachter tut dasselbe für jede eingehende Überweisung.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum | Was zu tun ist |
| --- | --- | --- |
| `./tipjar: Permission denied` | Ein frischer Download ist nicht als ausführbar markiert. | Führen Sie `chmod +x tipjar` aus. |
| `build first: (cd ... && mvn -q package)` | Die Jar-Datei fehlt. | Führen Sie `mvn -q package` in diesem Ordner aus (Schritt 2). |
| `mvn: command not found` oder `java: command not found` | Werkzeug nicht installiert, oder das Terminal wurde nicht neu geöffnet. | Installieren Sie es (siehe Bevor Sie beginnen), öffnen Sie ein neues Terminal und prüfen Sie die Version. |
| Java meldet Version 17 oder niedriger | Ein älteres Java steht in Ihrem Pfad an erster Stelle. | Installieren Sie Java 21, öffnen Sie ein neues Terminal und führen Sie `java -version` erneut aus. |
| `no key file at ..., run new first` | Sie haben Schritt 4 übersprungen, oder `TIPJAR_KEY` zeigt woanders hin. | Führen Sie `./tipjar new` aus. |
| `key file already exists` | Sie haben bereits einen Schlüssel angelegt. | Behalten Sie ihn, oder ersetzen Sie ihn mit `./tipjar new --force` (der alte Schlüssel geht verloren). |
| `account has no PQC key and classical fallback is disabled` | Der Post-Quanten-Schlüssel ist noch nicht registriert. | Führen Sie zuerst `./tipjar register` aus. |
| `EVM authorisation window exhausted` | Diese Meldung gehört zu den EVM-Apps (Counter, Guestbook). Der Tip Jar verwendet sie nicht. | Öffnen Sie in den EVM-Apps mit `pnpm window open` ein neues Fenster. |
| `HHE10402`, nachdem das Fenster geöffnet wurde | Nur Hardhat-Apps: Das Fenster war noch nicht aktiv. | Führen Sie in den Hardhat-Apps das Deploy erneut aus. |
| Guthaben ist 0 oder `not on chain yet` | Die Faucet-Token sind noch nicht angekommen. | Warten Sie 10 Sekunden und führen Sie `./tipjar status` aus. Prüfen Sie, ob Sie die richtige Adresse eingefügt haben. |
| Der Faucet meldet ein Ratenlimit | Eine Anfrage pro 24 Stunden und Konto. | Warten Sie, oder verwenden Sie ein zweites Wegwerf-Konto. |
| `chain refused the tx` oder `poll failed` | Das Testnet ist ausgelastet oder wird gerade aktualisiert, oder der öffentliche Endpunkt begrenzt Anfragen pro IP-Adresse. | Warten Sie eine Minute und führen Sie den Befehl erneut aus. |
| `recipient must be a qor1... address` | Die Adresse ist falsch oder enthält Leerzeichen. | Kopieren Sie die vollständige `qor1...`-Adresse erneut. |
| `CORS`-Fehler in einem Browser | Nur, wenn eine Webseite die Chain direkt aufruft. Diese App tut das nicht. | Verwenden Sie in einer Browser-App den `/lcd`-Proxy der Vorlage. |
| `pnpm: command not found` | pnpm ist nicht installiert. Hier nicht nötig. | Nur für das Hardhat-Tutorial: Führen Sie `npm install -g pnpm` aus. |

## Der SDK-Code, auf den es ankommt {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

Das Gas ist nie fest: Jede Transaktion wird zuerst simuliert und erhält das simulierte Gas mal 1,3, bepreist mit 0,15 uqor pro Gas.

Das Konto ist ein klassisches QoreChain-Konto mit Coin 118 (`m/44'/118'/0'/0/0`). Der ML-DSA-87-Schlüssel wird aus derselben Wiederherstellungsphrase abgeleitet und mit `Authenticator.derivePqcCanonical` an die Adresse gebunden. Wenn Sie Ihre eigene App stattdessen auf den seedbasierten Helfern aufbauen, braucht SDK 0.13.0 einen Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis; siehe [SDK-Installation](/sdk/install#whats-new-0130). Geben Sie niemals einen Wiederherstellungscode aus.

## Verwendete Pakete {#packages}

| Element | Version |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

Siehe [SDK-Installation](/sdk/install) für die Release-Tabelle aller Sprachen.

## Wo Sie etwas nachschlagen {#access}

| Was | Wo |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
