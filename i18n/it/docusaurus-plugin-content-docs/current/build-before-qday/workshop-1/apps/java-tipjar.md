---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: App Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# App Java: Q-Day Tip Jar

Il **Q-Day Tip Jar** è un piccolo programma Java per la testnet di QoreChain (`qorechain-diana`, EVM chain ID 9800). Invia mance con una **firma ibrida**: una firma classica secp256k1 più una firma post-quantistica ML-DSA-87 (FIPS 204). Può anche osservare un indirizzo "salvadanaio", come farebbe il backend di un negozio, e distinguere le mance a prova di quantistico da quelle solo classiche.

**Quanto ci vuole:** circa 20 minuti la prima volta (10 minuti per installare gli strumenti, 5 di configurazione, 5 per inviare e controllare).

Non serve conoscere Java. Basta digitare i comandi qui sotto, uno alla volta, e confrontare il risultato con "Cosa dovresti vedere".

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1** da Java con una sola chiamata dell'SDK.
- **Una transazione firmata in modo ibrido e verificata on chain**: la catena registra un evento `pqc_hybrid_verify` con `status=verified`, e la transazione contiene una firma ML-DSA-87 di 4.627 byte.
- **Un backend che distingue le mance a prova di quantistico da quelle classiche**: `watch` etichetta ogni trasferimento in arrivo come `QUANTUM-SAFE` o `classical only`.

Perché è importante: si prevede che una firma solo classica possa essere violata da un futuro computer quantistico. Un servizio che controlla il registro di verifica della catena stessa può decidere quanto fidarsi di ogni pagamento. Vedi [Transazioni a prova di quantistico](/sdk/guides/quantum-safe).

:::warning Solo testnet
Usa solo un account di testnet usa e getta. Il QOR di testnet non ha alcun valore. Non usare mai in questo tutorial il tuo wallet reale, la tua vera frase di recupero o fondi reali.
:::

## Parole che incontrerai {#words}

| Parola | Significato |
| --- | --- |
| Testnet | Una copia di prova di QoreChain. Le monete al suo interno sono gratuite e non valgono nulla. |
| QOR e uqor | Due nomi per la stessa moneta. 1 QOR = 1.000.000 uqor. L'app chiede QOR. Le commissioni sono mostrate in uqor. |
| Memo | Un breve testo allegato a una transazione, come la causale di un bonifico. |
| Indirizzo | Il tuo numero di conto pubblico. Su QoreChain inizia con `qor1`. Si può condividere senza problemi. |
| File della chiave | Un file con la tua frase di recupero segreta. Non condividerlo mai. |
| Faucet | Un sito web che regala QOR di testnet gratuiti. |
| Hash | L'ID univoco di una transazione. Serve per cercare la transazione. |

## Prima di iniziare {#before}

Servono tre strumenti: **Git** (scarica il codice), **Java 21 o successivo** (esegue l'app) e **Maven** (compila l'app). Dopo ogni installazione, **chiudi il terminale e aprine uno nuovo**, poi esegui il comando di verifica.

| Strumento | macOS | Windows | Linux (Debian o Ubuntu) | Verifica |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew da https://brew.sh) | https://git-scm.com/download/win (include anche "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (scegli Temurin 21, l'installer .msi) | `sudo apt install openjdk-21-jdk` | `java -version` deve indicare 21 o superiore |
| Maven | `brew install maven` | Scarica lo zip da https://maven.apache.org/download.cgi e segui https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

Su Windows, per questo tutorial usa **Git Bash** (installato con Git) come terminale, perché il launcher `tipjar` è uno script di shell. Su macOS usa Terminale. Su Linux va bene qualsiasi terminale. Se preferisci PowerShell semplice, vedi la nota nel passaggio 3.

**Su macOS con Homebrew:** `brew install openjdk@21` potrebbe dirti di collegarlo. Se `java -version` mostra ancora una versione vecchia, esegui ciò che Homebrew stampa sotto "For the system Java wrappers to find this JDK", poi apri un nuovo terminale.

## Ottieni un wallet di testnet e QOR gratuiti {#wallet}

L'app crea da sola la propria chiave usa e getta (passaggio 4 qui sotto), quindi per questo tutorial non ti serve per forza un'app wallet. Ti serve però un posto dove ottenere QOR di testnet. Se vuoi anche vedere il tuo account in QoreX:

1. **App QoreX:** apri Impostazioni, poi attiva **Use testnet (developers)**.
2. **Estensione del browser QoreX:** sbloccala, tocca 7 volte il numero di versione in basso, poi scegli **Switch to testnet (diana)**.

I QOR gratuiti arrivano dal faucet su https://dashboard.qorechain.io/faucet. Accedi, incolla l'indirizzo e fai la richiesta. Eroga **100 QOR ogni 24 ore per account**.

La primissima transazione di un nuovo account registra sulla catena la sua chiave post-quantistica ML-DSA-87. È un passaggio una tantum con una commissione di circa 0,09 QOR. L'app lo fa per te con il comando `register`.

## Passo dopo passo {#run}

### 1. Scarica il codice {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Cosa fa**

- `git clone <indirizzo>`: copia il progetto da GitHub in una nuova cartella chiamata `build-before-qday` sul tuo computer.
- `cd <cartella>`: sposta il terminale nella cartella dell'app Java. Ogni comando successivo deve essere eseguito da questa cartella.

**Cosa dovresti vedere:** righe come `Cloning into 'build-before-qday'...` e poi il prompt nella nuova cartella.

### 2. Compila l'app {#build}

```bash
mvn -q package
```

**Cosa fa:** Maven scarica l'SDK di QoreChain da Maven Central e impacchetta l'app in un unico file eseguibile, `target/tipjar.jar`.

| Parte | Significato |
| --- | --- |
| `mvn` | Lo strumento di compilazione Maven. |
| `package` | Compila il codice e lo impacchetta in un file `.jar`. |
| `-q` | Modalità silenziosa: stampa solo i problemi. |

**Cosa dovresti vedere:** niente per qualche secondo (circa 10 secondi la prima volta, un po' di più con una connessione lenta), poi il prompt ritorna. Controlla che il file esista:

```bash
ls target/tipjar.jar
```

**Cosa dovresti vedere:** `target/tipjar.jar`.

### 3. Rendi eseguibile il launcher e provalo {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Cosa fa**

| Parte | Significato |
| --- | --- |
| `chmod +x tipjar` | Permette al file `tipjar` di essere eseguito come programma. Un download appena fatto non ha questo permesso. |
| `./tipjar` | Esegue il launcher in questa cartella. Avvia `java -jar target/tipjar.jar`. Senza alcun comando stampa la guida. |

**Cosa dovresti vedere:** un elenco di comandi: `new`, `status`, `register`, `tip`, `watch`.

:::note PowerShell semplice su Windows
Salta `chmod`. In ogni comando qui sotto sostituisci `./tipjar` con `java -jar target/tipjar.jar`.
:::

### 4. Crea il tuo account di testnet usa e getta {#key}

```bash
./tipjar new
```

**Cosa fa:** crea un account nuovo. Scrive una frase di recupero segreta nel file della chiave `~/.config/qday/java.env` (nella tua cartella home, leggibile solo da te) e stampa solo l'indirizzo pubblico.

| Parte | Significato |
| --- | --- |
| `new` | Crea un nuovo file della chiave e stampa il suo indirizzo. |
| `new --force` | Sostituisce un file della chiave esistente. La vecchia chiave è persa. |

**Cosa dovresti vedere:** `new jar key`, il percorso del file della chiave e un `address` che inizia con `qor1...`. La frase di recupero non viene mai stampata.

**Copia l'indirizzo `qor1...`.** Se lo perdi, `./tipjar status` lo stampa di nuovo. Non condividere mai il file della chiave, non farne mai il commit su Git e non riutilizzarlo mai sulla mainnet. Per tenere la chiave in un altro posto, imposta prima `TIPJAR_KEY`: `TIPJAR_KEY=/path/to/file ./tipjar status` (in PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Ottieni QOR di testnet dal faucet {#faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e premi il pulsante di richiesta.
3. Aspetta qualche secondo, poi esegui:

```bash
./tipjar status
```

**Cosa fa:** chiede alla testnet il tuo saldo e se la tua chiave post-quantistica è registrata.

**Cosa dovresti vedere:** `balance   100 QOR` (oppure l'importo del faucet) e una riga che dice che la chiave ML-DSA-87 non è ancora registrata. Se il saldo è 0, aspetta 10 secondi ed eseguilo di nuovo.

### 6. Registra la tua chiave post-quantistica {#register}

```bash
./tipjar register
```

**Cosa fa:** registra sulla catena la tua chiave ML-DSA-87, una sola volta. Si può rieseguire senza rischi. Questa prima transazione è firmata solo con la chiave classica, perché sulla catena non c'è ancora una chiave post-quantistica con cui firmare. Costa circa 0,09 QOR. Ogni transazione successiva è firmata in modo ibrido.

**Cosa dovresti vedere:** un hash di transazione e un messaggio che dice che la chiave è registrata. Esegui di nuovo `./tipjar status` e ora dovrebbe mostrare la chiave come registrata.

**Quanto ci vuole:** qualche secondo (un blocco).

### 7. Crea un secondo indirizzo per ricevere le mance {#jar}

Una mancia ha bisogno di qualcuno che la riceva. Crea un secondo account usa e getta, il "salvadanaio", con il suo file della chiave:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Cosa fa:** la parte prima di `./tipjar` imposta il file della chiave solo per questo comando (`TIPJAR_KEY`), così il nuovo account non sovrascrive il primo. Su PowerShell di Windows esegui prima `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`, poi `java -jar target/tipjar.jar new`, e al termine ripristina con `Remove-Item Env:TIPJAR_KEY`.

**Cosa dovresti vedere:** un nuovo indirizzo `qor1...`. Copialo. Questo è l'**indirizzo del salvadanaio**. Il salvadanaio non ha bisogno di QOR per ricevere mance.

### 8. Invia una mancia firmata in modo ibrido {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Sostituisci `qor1...JAR_ADDRESS` con l'indirizzo del salvadanaio del passaggio 7.

| Parte | Significato |
| --- | --- |
| `tip` | Invia una mancia. |
| `qor1...JAR_ADDRESS` | Chi riceve la mancia. |
| `1` | L'importo in QOR (quindi 1 QOR = 1.000.000 uqor). |
| `"my first quantum-safe tip"` | Il memo, un breve testo allegato alla transazione. Facoltativo. Tieni le virgolette se contiene spazi. |

**Cosa fa:** l'app chiede alla catena quanto gas serve alla transazione (una prova), aggiunge il 30 per cento come margine di sicurezza, firma con entrambe le chiavi, la invia, aspetta il blocco e poi controlla il registro della catena stessa.

**Cosa dovresti vedere:** l'hash della transazione, l'altezza del blocco e il risultato `QUANTUM-SAFE`. Se vedi `CHECK FAILED`, consulta la Risoluzione dei problemi. Copia l'hash.

**Quanto ci vuole:** circa 10 secondi.

### 9. Osserva il salvadanaio, come farebbe il backend di un negozio {#watch}

Apri un **secondo terminale**, vai nella stessa cartella e avvia l'osservatore:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Ora torna al primo terminale e invia un'altra mancia (passaggio 8, con un nuovo memo).

**Cosa fa:** `watch` chiede alla catena ogni 3 secondi i nuovi trasferimenti verso il salvadanaio ed etichetta ciascuno. `NO_COLOR=1 ./tipjar watch ...` disattiva i colori. Fermalo con Ctrl+C.

**Cosa dovresti vedere:** ogni mancia elencata con l'etichetta `QUANTUM-SAFE`. Una mancia inviata senza una firma ibrida verificata apparirebbe come `classical only`.

## Verifica tu stesso la transazione {#verify}

Non devi fidarti dell'app. Chiedi direttamente alla catena.

**Modo 1, nel browser.** Apri `https://explore.qore.network/tx/<HASH>` (al posto di `<HASH>` metti il tuo hash), poi passa l'explorer a **Testnet**. Dovresti vedere una transazione riuscita.

**Modo 2, un solo comando.** Al posto di `<HASH>` metti il tuo hash:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Significato |
| --- | --- |
| `curl` | Uno strumento che scarica un indirizzo web. Incluso in macOS, Windows 10+ e nella maggior parte di Linux. |
| `-s` | Silenzioso: nasconde la barra di avanzamento. |
| l'indirizzo | L'API REST pubblica della testnet. Restituisce il registro completo della transazione in JSON. |

**Cosa dovresti vedere** nel lungo output (usa un visualizzatore JSON oppure aggiungi `| jq .` se hai installato jq):

- `"code": 0` significa che la transazione è riuscita.
- Un'estensione `PQCHybridSignature` che contiene una `pqc_signature` di **4.627 byte** (è la firma ML-DSA-87).
- Un evento `pqc_hybrid_verify` con `status` impostato su `verified` per il tuo indirizzo.

## Come funziona la prova {#proof}

L'app legge lo stesso registro da `GET /cosmos/tx/v1beta1/txs/{hash}` e cerca l'evento `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) e l'estensione `/qorechain.pqc.v1.PQCHybridSignature` con una firma di 4.627 byte. L'osservatore fa lo stesso per ogni trasferimento in arrivo.

## Risoluzione dei problemi {#troubleshooting}

| Cosa vedi | Perché | Cosa fare |
| --- | --- | --- |
| `./tipjar: Permission denied` | Un download appena fatto non è marcato come eseguibile. | Esegui `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | Manca il file jar. | Esegui `mvn -q package` in questa cartella (passaggio 2). |
| `mvn: command not found` o `java: command not found` | Strumento non installato, oppure il terminale non è stato riaperto. | Installalo (vedi Prima di iniziare), apri un nuovo terminale, controlla la versione. |
| Java dice versione 17 o inferiore | Una versione di Java più vecchia è la prima nel tuo percorso. | Installa Java 21, apri un nuovo terminale, esegui di nuovo `java -version`. |
| `no key file at ..., run new first` | Hai saltato il passaggio 4, oppure `TIPJAR_KEY` punta altrove. | Esegui `./tipjar new`. |
| `key file already exists` | Hai già creato una chiave. | Tienila, oppure sostituiscila con `./tipjar new --force` (la vecchia chiave è persa). |
| `account has no PQC key and classical fallback is disabled` | La chiave post-quantistica non è ancora registrata. | Esegui prima `./tipjar register`. |
| `EVM authorisation window exhausted` | Questo messaggio riguarda le app EVM (counter, guestbook). Non è usato dal Tip Jar. | Nelle app EVM, apri una nuova finestra con `pnpm window open`. |
| `HHE10402` dopo l'apertura della finestra | Solo app Hardhat: la finestra non era ancora attiva. | Nelle app Hardhat, esegui di nuovo il deploy. |
| Il saldo è 0 oppure `not on chain yet` | I token del faucet non sono ancora arrivati. | Aspetta 10 secondi, esegui `./tipjar status`. Controlla di aver incollato l'indirizzo giusto. |
| Il faucet dice che hai raggiunto il limite di richieste | Una richiesta ogni 24 ore per account. | Aspetta, oppure usa un secondo account usa e getta. |
| `chain refused the tx` o `poll failed` | La testnet è occupata o in aggiornamento, oppure l'endpoint pubblico limita le richieste per indirizzo IP. | Aspetta un minuto ed esegui di nuovo il comando. |
| `recipient must be a qor1... address` | L'indirizzo è sbagliato o contiene spazi. | Copia di nuovo l'indirizzo `qor1...` completo. |
| Errori `CORS` in un browser | Solo quando una pagina web chiama direttamente la catena. Questa app non lo fa. | In un'app del browser, usa il proxy `/lcd` del template. |
| `pnpm: command not found` | pnpm non è installato. Qui non serve. | Solo per il tutorial Hardhat: esegui `npm install -g pnpm`. |

## Il codice dell'SDK che conta {#code}

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

Il gas non è mai fisso: ogni transazione viene prima simulata e riceve il gas simulato moltiplicato per 1,3, con un prezzo di 0,15 uqor per unità di gas.

L'account è un classico account QoreChain coin-118 (`m/44'/118'/0'/0/0`). La chiave ML-DSA-87 deriva dalla stessa frase di recupero ed è legata all'indirizzo con `Authenticator.derivePqcCanonical`. Se costruisci una tua app sugli helper basati sul seed, l'SDK 0.13.0 richiede un codice di recupero oppure un segreto PQC indipendente di 32 byte; vedi [Installazione dell'SDK](/sdk/install#whats-new-0130). Non stampare mai un codice di recupero.

## Pacchetti usati {#packages}

| Elemento | Versione |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

Vedi [Installazione dell'SDK](/sdk/install) per la tabella delle versioni di tutti i linguaggi.

## Dove cercare le cose {#access}

| Cosa | Dove |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Codice | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
