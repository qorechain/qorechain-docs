---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Java-App, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Java-App: Q-Day Tip Jar

Der **Q-Day Tip Jar** ist ein kleines Java-Backend für das QoreChain-Testnet (`qorechain-diana`, EVM-Chain-ID 9800). Er sendet Trinkgelder mit einer **hybriden Signatur** (klassisch secp256k1 plus Post-Quanten-ML-DSA-87, FIPS 204). Als Beispiel für ein Shop-Backend kann er außerdem eine Jar-Adresse beobachten und nur die Trinkgelder akzeptieren, deren Absendersignatur die Chain als hybrid verifiziert hat.

## Was es zeigt {#what-it-shows}

- **Hybride Signierung mit ML-DSA-87 + secp256k1** aus Java mit einem einzigen Aufrufpfad im SDK.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert**: Die Chain gibt für den Signer ein Ereignis `pqc_hybrid_verify` mit `status=verified` aus, und die Transaktion trägt eine 4627 Bytes lange ML-DSA-87-Signatur.
- **Ein Backend, das quantensichere von klassischen Trinkgeldern unterscheidet**: `watch` kennzeichnet jede eingehende Überweisung mit `QUANTUM-SAFE` oder `classical only`.

Warum das wichtig ist: Eine rein klassische Signatur wird voraussichtlich von einem künftigen Quantencomputer gebrochen werden können. Ein Dienst, der den eigenen Verifizierungsnachweis der Chain prüft, kann entscheiden, wie sehr er jeder Zahlung vertraut. Siehe [Quantum-Safe Transactions](/sdk/guides/quantum-safe).

## Schritt für Schritt {#run}

Alles Folgende läuft in Ihrem eigenen Terminal (macOS, Linux oder Windows mit WSL). Sie verwenden nur ein Wegwerf-Testnet-Konto. Test-QOR hat keinen Wert, und Sie verwenden hier nie eine echte Wallet.

### 1. Die Werkzeuge installieren {#install}

Sie brauchen Git, ein JDK 21 oder neuer und Maven. Prüfen Sie, was Sie haben:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

Wenn `java` oder `mvn` fehlt oder zu alt ist, installieren Sie sie zuerst, zum Beispiel mit [Temurin JDK 21](https://adoptium.net) und [Apache Maven](https://maven.apache.org/install.html) oder mit Ihrem Paketmanager (`brew install openjdk@21 maven` auf macOS, `sudo apt install openjdk-21-jdk maven` auf Debian oder Ubuntu). Öffnen Sie ein neues Terminal und führen Sie die drei Prüfungen erneut aus.

### 2. Den Code holen {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Die App bauen {#build}

```bash
mvn -q package
```

Maven lädt das SDK von Maven Central herunter und baut eine lauffähige Datei, `target/tipjar.jar`. Der erste Build dauert weniger als eine Minute. Machen Sie dann den Launcher ausführbar und prüfen Sie, dass er läuft:

```bash
chmod +x tipjar
./tipjar
```

Sie sollten die Liste der Befehle sehen (`new`, `status`, `register`, `tip`, `watch`).

### 4. Ihr Wegwerf-Testnet-Konto erstellen {#key}

```bash
./tipjar new
```

Das erzeugt eine neue Wiederherstellungsphrase, schreibt sie in die Schlüsseldatei `~/.config/qday/java.env` (nur für Sie lesbar, Modus 0600) und gibt nur die Kontoadresse aus, die mit `qor1...` beginnt. Die Phrase wird nie ausgegeben. Geben Sie diese Datei nicht weiter, committen Sie sie nicht und verwenden Sie sie nicht im Mainnet. Um den Schlüssel an einem anderen Ort zu halten, setzen Sie vor jedem Befehl `TIPJAR_KEY=/path/to/file`.

Kopieren Sie die Adresse `qor1...` aus der Ausgabe. Wenn Sie sie verlieren, gibt `./tipjar status` sie erneut aus.

### 5. Test-QOR vom Faucet holen {#faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie Token an. Der Faucet gibt 100 QOR pro 24 Stunden aus.
3. Prüfen Sie, ob sie angekommen sind:

```bash
./tipjar status
```

Das Guthaben sollte Ihr Test-QOR zeigen, und der Post-Quanten-Schlüssel sollte noch als nicht registriert erscheinen.

### 6. Ihren Post-Quanten-Schlüssel registrieren {#register}

```bash
./tipjar register
```

Das registriert Ihren ML-DSA-87-Schlüssel einmalig on-chain. Ein erneuter Aufruf ist unbedenklich. Die Registrierungsnachricht selbst wird absichtlich klassisch signiert, weil es noch keinen Post-Quanten-Schlüssel zum Signieren gibt; sie enthält einen Nachweis, dass Sie den neuen Schlüssel besitzen. Jede Transaktion danach ist hybrid signiert.

### 7. Eine zweite Adresse zum Empfangen von Trinkgeldern erstellen {#jar}

Ein Trinkgeld braucht einen Empfänger. Erstellen Sie ein zweites Wegwerf-Konto für das Jar, mit eigener Schlüsseldatei:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Kopieren Sie seine Adresse `qor1...`. Das ist Ihre Jar-Adresse.

### 8. Ein hybrid signiertes Trinkgeld senden {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Ersetzen Sie `qor1...JAR_ADDRESS` durch die Jar-Adresse aus Schritt 7. `1` ist der Betrag in QOR. Das Memo ist optional. Die App simuliert die Transaktion, um das Gas festzulegen, signiert sie mit beiden Schlüsseln, sendet sie, wartet auf den Block und prüft den Verifizierungsnachweis der Chain.

### 9. Das Jar beobachten, wie es ein Shop-Backend täte {#watch}

Öffnen Sie ein zweites Terminal im selben Ordner. Starten Sie den Watcher auf der Jar-Adresse und senden Sie dann aus dem ersten Terminal ein weiteres Trinkgeld:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

Der Watcher prüft alle 3 Sekunden und kennzeichnet jedes eingehende Trinkgeld. Beenden Sie ihn mit Strg+C. Setzen Sie `NO_COLOR=1`, um Farben abzuschalten. Die öffentlichen Testnet-Endpunkte haben ein Ratenlimit pro IP. Wenn ein Aufruf fehlschlägt, warten Sie eine Minute und versuchen Sie es erneut.

## Was Sie sehen sollten {#output}

- Nach `tip` gibt das Terminal den Transaktions-Hash und die Blockhöhe aus, danach das Verifizierungsergebnis: `QUANTUM-SAFE`, wenn die Chain die hybride Signatur verifiziert hat, sonst `CHECK FAILED`.
- In `watch` wird jedes Trinkgeld mit dem Etikett `QUANTUM-SAFE` aufgelistet, wenn die Chain eine hybride Signatur verifiziert hat, oder mit `classical only`, wenn nicht.
- Im Explorer: Öffnen Sie `https://explore.qore.network/tx/<HASH>` (mit dem Hash aus dem Terminal) und schalten Sie den Explorer auf **Testnet**. Die Transaktion wird als erfolgreich angezeigt.

## Wie der Nachweis funktioniert {#proof}

Die App liest die Transaktion vom Testnet-REST-Endpunkt (`GET /cosmos/tx/v1beta1/txs/{hash}`) und sucht nach:

- einem Ereignis `pqc_hybrid_verify` mit `address=<signer>` und `status=verified`;
- der Erweiterung `/qorechain.pqc.v1.PQCHybridSignature` mit einer 4627 Bytes langen `pqc_signature`.

Der Watcher liest genau das für jede eingehende Überweisung.

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

Das Gas ist nie fest vorgegeben: Jede Transaktion wird zuerst simuliert und erhält das simulierte Gas mal 1,3, bepreist mit 0,15 uqor pro Gas.

Das Konto ist ein klassisches Coin-118-QoreChain-Konto (`m/44'/118'/0'/0/0`). Der ML-DSA-87-Schlüssel wird aus derselben Wiederherstellungsphrase abgeleitet und mit `Authenticator.derivePqcCanonical` an die Adresse gebunden. Wenn Sie stattdessen Ihre eigene App auf den Seed-basierten Helfern aufbauen, braucht SDK 0.13.0 einen Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis; siehe [SDK installieren](/sdk/install#whats-new-0130). Geben Sie einen Wiederherstellungscode niemals aus.

## Verwendete Pakete {#packages}

| Eintrag | Version |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

Die Release-Tabelle aller Sprachen finden Sie unter [SDK installieren](/sdk/install).

## Wo Sie nachschlagen {#access}

| Was | Wo |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (auf Testnet umschalten) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Code | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
