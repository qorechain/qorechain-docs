---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: App Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# App Java: Q-Day Tip Jar

Il **Q-Day Tip Jar** è un piccolo backend Java per la testnet di QoreChain (`qorechain-diana`, EVM chain ID 9800). Invia mance con una **firma ibrida** (secp256k1 classica più ML-DSA-87 post-quantistica, FIPS 204). Come esempio di backend per un negozio, può anche osservare l'indirizzo di un barattolo e accettare solo le mance la cui firma del mittente la catena ha verificato come ibrida.

## Cosa mostra {#what-it-shows}

- **Firma ibrida ML-DSA-87 + secp256k1** da Java con un solo percorso di chiamata nell'SDK.
- **Una transazione firmata in modo ibrido e verificata on chain**: la catena emette un evento `pqc_hybrid_verify` con `status=verified` per il firmatario, e la transazione porta una firma ML-DSA-87 da 4627 byte.
- **Un backend che distingue le mance quantum-safe da quelle classiche**: `watch` etichetta ogni trasferimento in entrata come `QUANTUM-SAFE` o `classical only`.

Perché è importante: ci si aspetta che una firma solo classica sia violabile da un futuro computer quantistico. Un servizio che controlla il registro di verifica della catena può decidere quanta fiducia dare a ogni pagamento. Vedi [Transazioni quantum-safe](/sdk/guides/quantum-safe).

## Passo dopo passo {#run}

Tutto ciò che segue gira nel tuo terminale (macOS, Linux oppure Windows con WSL). Usi solo un account testnet usa e getta. I QOR di testnet non hanno alcun valore e qui non usi mai un wallet reale.

### 1. Installa gli strumenti {#install}

Ti servono Git, un JDK 21 o successivo e Maven. Controlla cosa hai:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

Se `java` o `mvn` mancano o sono troppo vecchi, installali prima, per esempio con [Temurin JDK 21](https://adoptium.net) e [Apache Maven](https://maven.apache.org/install.html), oppure con il tuo gestore di pacchetti (`brew install openjdk@21 maven` su macOS, `sudo apt install openjdk-21-jdk maven` su Debian o Ubuntu). Apri un nuovo terminale ed esegui di nuovo i tre controlli.

### 2. Ottieni il codice {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Compila l'app {#build}

```bash
mvn -q package
```

Maven scarica l'SDK da Maven Central e costruisce un unico file eseguibile, `target/tipjar.jar`. La prima compilazione richiede meno di un minuto. Poi rendi eseguibile il launcher e controlla che parta:

```bash
chmod +x tipjar
./tipjar
```

Dovresti vedere l'elenco dei comandi (`new`, `status`, `register`, `tip`, `watch`).

### 4. Crea il tuo account testnet usa e getta {#key}

```bash
./tipjar new
```

Genera una nuova frase di recupero, la scrive nel file di chiavi `~/.config/qday/java.env` (leggibile solo da te, modalità 0600) e stampa solo l'indirizzo dell'account, che inizia con `qor1...`. La frase non viene mai stampata. Non condividere questo file, non farne il commit e non riutilizzarlo sulla mainnet. Per tenere la chiave altrove, imposta `TIPJAR_KEY=/path/to/file` prima di ogni comando.

Copia dall'output l'indirizzo `qor1...`. Se lo perdi, `./tipjar status` lo stampa di nuovo.

### 5. Ricevi QOR di testnet dal faucet {#faucet}

1. Apri https://dashboard.qorechain.io/faucet e accedi.
2. Incolla il tuo indirizzo `qor1...` e richiedi i token. Il faucet eroga 100 QOR ogni 24 ore.
3. Controlla che siano arrivati:

```bash
./tipjar status
```

Il saldo dovrebbe mostrare i tuoi QOR di testnet, e la chiave post-quantistica dovrebbe risultare non ancora registrata.

### 6. Registra la tua chiave post-quantistica {#register}

```bash
./tipjar register
```

Registra una sola volta la tua chiave ML-DSA-87 on chain. Si può rieseguire senza problemi. Il messaggio di registrazione è firmato in modo classico per progetto, perché non c'è ancora una chiave post-quantistica con cui firmare; porta una prova che possiedi la nuova chiave. Ogni transazione successiva è firmata in modo ibrido.

### 7. Crea un secondo indirizzo per ricevere le mance {#jar}

Una mancia ha bisogno di un destinatario. Crea un secondo account usa e getta per il barattolo, con il suo file di chiavi:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Copia il suo indirizzo `qor1...`. È l'indirizzo del tuo barattolo.

### 8. Invia una mancia firmata in modo ibrido {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Sostituisci `qor1...JAR_ADDRESS` con l'indirizzo del barattolo del passo 7. `1` è l'importo in QOR. Il memo è facoltativo. L'app simula la transazione per stabilire il gas, la firma con entrambe le chiavi, la trasmette, attende il blocco e controlla il registro di verifica della catena.

### 9. Osserva il barattolo, come farebbe il backend di un negozio {#watch}

Apri un secondo terminale nella stessa cartella. Avvia l'osservatore sull'indirizzo del barattolo, poi invia un'altra mancia dal primo terminale:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

L'osservatore controlla ogni 3 secondi ed etichetta ogni mancia in entrata. Fermalo con Ctrl+C. Imposta `NO_COLOR=1` per disattivare i colori. Gli endpoint pubblici della testnet hanno un limite di frequenza per IP, quindi se una chiamata fallisce, attendi un minuto e riprova.

## Cosa dovresti vedere {#output}

- Dopo `tip`, il terminale stampa l'hash della transazione e l'altezza del blocco, poi il risultato della verifica: `QUANTUM-SAFE` quando la catena ha verificato la firma ibrida, `CHECK FAILED` altrimenti.
- In `watch`, ogni mancia è elencata con l'etichetta `QUANTUM-SAFE` quando la catena ha verificato una firma ibrida, oppure `classical only` quando non l'ha fatto.
- Nell'explorer: apri `https://explore.qore.network/tx/<HASH>` (usa l'hash dal terminale) e imposta l'explorer su **Testnet**. La transazione risulta riuscita.

## Come funziona la prova {#proof}

L'app legge la transazione dall'endpoint REST della testnet (`GET /cosmos/tx/v1beta1/txs/{hash}`) e cerca:

- un evento `pqc_hybrid_verify` con `address=<signer>` e `status=verified`;
- l'estensione `/qorechain.pqc.v1.PQCHybridSignature` con una `pqc_signature` da 4627 byte.

L'osservatore legge esattamente questo per ogni trasferimento in entrata.

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

Il gas non è mai fisso: ogni transazione viene prima simulata e riceve il gas simulato per 1,3, con un prezzo di 0,15 uqor per unità di gas.

L'account è un classico account QoreChain coin-118 (`m/44'/118'/0'/0/0`). La chiave ML-DSA-87 è derivata dalla stessa frase di recupero e legata all'indirizzo con `Authenticator.derivePqcCanonical`. Se invece costruisci la tua app sugli helper basati su seed, l'SDK 0.13.0 richiede un codice di recupero o un segreto PQC indipendente da 32 byte; vedi [Installare l'SDK](/sdk/install#whats-new-0130). Non stampare mai un codice di recupero.

## Pacchetti usati {#packages}

| Voce | Versione |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

Vedi [Installare l'SDK](/sdk/install) per la tabella delle versioni in tutti i linguaggi.

## Dove cercare le cose {#access}

| Cosa | Dove |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (passa a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Codice | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
