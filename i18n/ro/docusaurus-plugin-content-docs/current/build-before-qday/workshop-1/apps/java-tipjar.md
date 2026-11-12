---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Aplicație Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Aplicație Java: Q-Day Tip Jar

**Q-Day Tip Jar** este un mic backend Java pentru testnetul QoreChain (`qorechain-diana`, EVM chain ID 9800). Trimite bacșișuri cu o **semnătură hibridă** (secp256k1 clasic plus ML-DSA-87 post-cuantic, FIPS 204). Ca exemplu de backend pentru un magazin, poate și să supravegheze o adresă de "borcan" și să accepte doar bacșișurile a căror semnătură a expeditorului a fost verificată de lanț ca hibridă.

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1** din Java, cu o singură cale de apel în SDK.
- **O tranzacție semnată hibrid, verificată pe lanț**: lanțul emite un eveniment `pqc_hybrid_verify` cu `status=verified` pentru semnatar, iar tranzacția poartă o semnătură ML-DSA-87 de 4627 de octeți.
- **Un backend care deosebește bacșișurile rezistente cuantic de cele clasice**: `watch` etichetează fiecare transfer primit `QUANTUM-SAFE` sau `classical only`.

De ce contează: se așteaptă ca o semnătură doar clasică să poată fi spartă de un viitor calculator cuantic. Un serviciu care verifică înregistrarea de verificare a lanțului poate decide cât de mult să aibă încredere în fiecare plată. Vezi [Tranzacții rezistente cuantic](/sdk/guides/quantum-safe).

## Pas cu pas {#run}

Tot ce urmează rulează în propriul tău terminal (macOS, Linux sau Windows cu WSL). Folosești doar un cont de testnet de unică folosință. QOR de testnet nu are valoare, iar aici nu folosești niciodată un portofel real.

### 1. Instalează instrumentele {#install}

Ai nevoie de Git, de un JDK 21 sau mai nou și de Maven. Verifică ce ai:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

Dacă `java` sau `mvn` lipsește sau este prea vechi, instalează-le mai întâi, de exemplu cu [Temurin JDK 21](https://adoptium.net) și [Apache Maven](https://maven.apache.org/install.html), sau cu managerul tău de pachete (`brew install openjdk@21 maven` pe macOS, `sudo apt install openjdk-21-jdk maven` pe Debian sau Ubuntu). Deschide un terminal nou și rulează din nou cele trei verificări.

### 2. Obține codul {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Compilează aplicația {#build}

```bash
mvn -q package
```

Maven descarcă SDK-ul de pe Maven Central și construiește un singur fișier rulabil, `target/tipjar.jar`. Prima compilare durează sub un minut. Apoi fă launcherul executabil și verifică dacă rulează:

```bash
chmod +x tipjar
./tipjar
```

Ar trebui să vezi lista de comenzi (`new`, `status`, `register`, `tip`, `watch`).

### 4. Creează-ți contul de testnet de unică folosință {#key}

```bash
./tipjar new
```

Comanda generează o frază de recuperare nouă, o scrie în fișierul de chei `~/.config/qday/java.env` (care poate fi citit doar de tine, modul 0600) și afișează doar adresa contului, care începe cu `qor1...`. Fraza nu este afișată niciodată. Nu partaja acest fișier, nu-l comite și nu-l reutiliza pe mainnet. Ca să păstrezi cheia în altă parte, setează `TIPJAR_KEY=/path/to/file` înainte de fiecare comandă.

Copiază adresa `qor1...` din ieșire. Dacă o pierzi, `./tipjar status` o afișează din nou.

### 5. Primește QOR de testnet de la faucet {#faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și cere tokenuri. Faucetul dă 100 QOR la 24 de ore.
3. Verifică dacă au ajuns:

```bash
./tipjar status
```

Soldul ar trebui să arate QOR-ul tău de testnet, iar cheia post-cuantică ar trebui să apară ca încă neînregistrată.

### 6. Înregistrează-ți cheia post-cuantică {#register}

```bash
./tipjar register
```

Comanda înregistrează cheia ta ML-DSA-87 pe lanț, o singură dată. Poate fi rulată din nou fără risc. Mesajul de înregistrare este în sine semnat clasic, intenționat, deoarece nu există încă o cheie post-cuantică cu care să semneze; el poartă o dovadă că deții noua cheie. Fiecare tranzacție de după el este semnată hibrid.

### 7. Creează o a doua adresă care să primească bacșișuri {#jar}

Un bacșiș are nevoie de un destinatar. Creează pentru borcan un al doilea cont de unică folosință, cu propriul fișier de chei:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Copiază adresa lui `qor1...`. Aceasta este adresa borcanului tău.

### 8. Trimite un bacșiș semnat hibrid {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Înlocuiește `qor1...JAR_ADDRESS` cu adresa borcanului de la pasul 7. `1` este suma în QOR. Memoul este opțional. Aplicația simulează tranzacția ca să stabilească gazul, o semnează cu ambele chei, o transmite, așteaptă blocul și verifică înregistrarea de verificare a lanțului.

### 9. Supraveghează borcanul, ca un backend de magazin {#watch}

Deschide un al doilea terminal în același folder. Pornește supraveghetorul pe adresa borcanului, apoi trimite încă un bacșiș din primul terminal:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

Supraveghetorul verifică la fiecare 3 secunde și etichetează fiecare bacșiș primit. Oprește-l cu Ctrl+C. Setează `NO_COLOR=1` ca să dezactivezi culorile. Punctele finale publice de testnet au o limită de cereri pe IP, deci dacă un apel eșuează, așteaptă un minut și încearcă din nou.

## Ce ar trebui să vezi {#output}

- După `tip`, terminalul afișează hashul tranzacției și înălțimea blocului, apoi rezultatul verificării: `QUANTUM-SAFE` când lanțul a verificat semnătura hibridă, altfel `CHECK FAILED`.
- În `watch`, fiecare bacșiș este listat cu eticheta `QUANTUM-SAFE` când lanțul a verificat o semnătură hibridă, sau `classical only` când nu a făcut-o.
- În explorer: deschide `https://explore.qore.network/tx/<HASH>` (folosește hashul din terminal) și comută explorerul pe **Testnet**. Tranzacția apare ca reușită.

## Cum funcționează dovada {#proof}

Aplicația citește tranzacția de la punctul final REST de testnet (`GET /cosmos/tx/v1beta1/txs/{hash}`) și caută:

- un eveniment `pqc_hybrid_verify` cu `address=<signer>` și `status=verified`;
- extensia `/qorechain.pqc.v1.PQCHybridSignature` cu un `pqc_signature` de 4627 de octeți.

Supraveghetorul citește exact acest lucru pentru fiecare transfer primit.

## Codul SDK care contează {#code}

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

Gazul nu este niciodată fix: fiecare tranzacție este simulată mai întâi și primește gazul simulat înmulțit cu 1.3, la prețul de 0.15 uqor pe unitate de gaz.

Contul este un cont QoreChain clasic coin-118 (`m/44'/118'/0'/0/0`). Cheia ML-DSA-87 este derivată din aceeași frază de recuperare și legată de adresă cu `Authenticator.derivePqcCanonical`. Dacă îți construiești propria aplicație pe ajutoarele bazate pe seed, SDK 0.13.0 cere un cod de recuperare sau un secret PQC independent de 32 de octeți; vezi [instalarea SDK-ului](/sdk/install#whats-new-0130). Nu afișa niciodată un cod de recuperare.

## Pachete folosite {#packages}

| Element | Versiune |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Aplicația `demo:tipjar` | 1.0.0 |

Vezi [instalarea SDK-ului](/sdk/install) pentru tabelul de lansări în toate limbajele.

## Unde cauți informații {#access}

| Ce | Unde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Cod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
