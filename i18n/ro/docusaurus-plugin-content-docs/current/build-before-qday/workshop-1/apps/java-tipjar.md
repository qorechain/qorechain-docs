---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Aplicație Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Aplicație Java: Q-Day Tip Jar

**Q-Day Tip Jar** este un mic program Java pentru testnet-ul QoreChain (`qorechain-diana`, ID de lanț EVM 9800). Trimite bacșișuri (tips) cu o **semnătură hibridă**: o semnătură clasică secp256k1 plus o semnătură post-cuantică ML-DSA-87 (FIPS 204). Poate de asemenea să urmărească o adresă "jar" (pușculița), ca backend-ul unui magazin, și să distingă bacșișurile rezistente la calculatoare cuantice de cele clasice.

**Cât durează:** aproximativ 20 de minute prima dată (10 minute de instalat unelte, 5 minute de configurare, 5 minute de trimis și verificat).

Nu trebuie să știi Java. Scrii doar comenzile de mai jos, una câte una, și compari rezultatul cu "Ce ar trebui să vezi".

## Ce demonstrează {#what-it-shows}

- **Semnare hibridă ML-DSA-87 + secp256k1** din Java, cu un singur apel în SDK.
- **O tranzacție semnată hibrid, verificată pe lanț**: lanțul înregistrează un eveniment `pqc_hybrid_verify` cu `status=verified`, iar tranzacția poartă o semnătură ML-DSA-87 de 4.627 de octeți.
- **Un backend care distinge bacșișurile rezistente cuantic de cele clasice**: `watch` etichetează fiecare transfer primit cu `QUANTUM-SAFE` sau `classical only`.

De ce contează: o semnătură clasică singură se așteaptă să poată fi spartă de un viitor calculator cuantic. Un serviciu care verifică înregistrarea de verificare a lanțului poate decide cât să aibă încredere în fiecare plată. Vezi [Tranzacții rezistente la calculatoare cuantice](/sdk/guides/quantum-safe).

:::warning Doar testnet
Folosește doar un cont de testnet de unică folosință. QOR de testnet nu are valoare. Nu folosi niciodată în acest tutorial portofelul tău real, fraza ta reală de recuperare sau fonduri reale.
:::

## Cuvinte pe care le vei întâlni {#words}

| Cuvânt | Ce înseamnă |
| --- | --- |
| Testnet | O copie de exercițiu a QoreChain. Monedele de pe ea sunt gratuite și nu valorează nimic. |
| QOR și uqor | Două nume pentru aceeași monedă. 1 QOR = 1.000.000 uqor. Aplicația cere QOR. Taxele sunt afișate în uqor. |
| Memo | Un text scurt atașat unei tranzacții, ca o mențiune la un transfer bancar. |
| Adresă | Numărul tău public de cont. Pe QoreChain începe cu `qor1`. Poate fi partajată în siguranță. |
| Fișier de chei | Un fișier cu fraza ta secretă de recuperare. Nu-l partaja niciodată. |
| Faucet | Un site care oferă QOR de testnet gratuit. |
| Hash | ID-ul unic al unei tranzacții. Îl folosești ca să cauți tranzacția. |

## Înainte să începi {#before}

Ai nevoie de trei unelte: **Git** (descarcă codul), **Java 21 sau mai nou** (rulează aplicația) și **Maven** (construiește aplicația). După fiecare instalare, **închide terminalul și deschide unul nou**, apoi rulează comanda de verificare.

| Unealtă | macOS | Windows | Linux (Debian sau Ubuntu) | Verifică |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew de la https://brew.sh) | https://git-scm.com/download/win (îți oferă și "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (alege Temurin 21, instalatorul .msi) | `sudo apt install openjdk-21-jdk` | `java -version` trebuie să spună 21 sau mai mare |
| Maven | `brew install maven` | Descarcă arhiva zip de la https://maven.apache.org/download.cgi și urmează https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

Pe Windows, folosește **Git Bash** (instalat odată cu Git) ca terminal pentru acest tutorial, deoarece lansatorul `tipjar` este un script shell. Pe macOS folosește Terminal. Pe Linux folosește orice terminal. Dacă preferi PowerShell simplu, vezi nota de la pasul 3.

**Pe macOS cu Homebrew:** `brew install openjdk@21` poate să-ți spună să-l legi. Dacă `java -version` arată în continuare o versiune veche, rulează ce afișează Homebrew sub "For the system Java wrappers to find this JDK", apoi deschide un terminal nou.

## Ia un portofel de testnet și QOR gratuit {#wallet}

Aplicația își face propria cheie de unică folosință (pasul 4 de mai jos), deci nu ai neapărat nevoie de o aplicație de portofel pentru acest tutorial. Ai nevoie însă de un loc de unde să iei QOR de testnet. Dacă vrei să-ți vezi contul și în QoreX:

1. **Aplicația QoreX:** deschide Setări, apoi activează **Use testnet (developers)**.
2. **Extensia de browser QoreX:** deblocheaz-o, atinge de 7 ori numărul versiunii din partea de jos, apoi alege **Switch to testnet (diana)**.

QOR-ul gratuit vine de la faucet, la https://dashboard.qorechain.io/faucet. Te autentifici, lipești adresa și ceri fonduri. Faucet-ul oferă **100 QOR la fiecare 24 de ore pentru fiecare cont**.

Prima tranzacție a unui cont nou înregistrează pe lanț cheia sa post-cuantică ML-DSA-87. Este un pas unic, cu o taxă de aproximativ 0,09 QOR. Aplicația îl face pentru tine cu comanda `register`.

## Pas cu pas {#run}

### 1. Descarcă codul {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Ce face**

- `git clone <adresă>`: copiază proiectul de pe GitHub într-un folder nou numit `build-before-qday` pe calculatorul tău.
- `cd <folder>`: mută terminalul în folderul aplicației Java. Fiecare comandă următoare trebuie rulată din acest folder.

**Ce ar trebui să vezi:** linii precum `Cloning into 'build-before-qday'...`, apoi promptul tău în folderul nou.

### 2. Construiește aplicația {#build}

```bash
mvn -q package
```

**Ce face:** Maven descarcă SDK-ul QoreChain de pe Maven Central și împachetează aplicația într-un singur fișier rulabil, `target/tipjar.jar`.

| Parte | Ce înseamnă |
| --- | --- |
| `mvn` | Unealta de construire Maven. |
| `package` | Compilează codul și îl împachetează într-un fișier `.jar`. |
| `-q` | Mod silențios: afișează doar problemele. |

**Ce ar trebui să vezi:** nimic timp de câteva secunde (aproximativ 10 secunde prima dată, puțin mai mult la o conexiune lentă), apoi promptul revine. Verifică dacă fișierul există:

```bash
ls target/tipjar.jar
```

**Ce ar trebui să vezi:** `target/tipjar.jar`.

### 3. Fă lansatorul rulabil și testează-l {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Ce face**

| Parte | Ce înseamnă |
| --- | --- |
| `chmod +x tipjar` | Permite rularea fișierului `tipjar` ca program. Un fișier proaspăt descărcat nu are această permisiune. |
| `./tipjar` | Rulează lansatorul din acest folder. Acesta pornește `java -jar target/tipjar.jar`. Fără nicio comandă, afișează ajutorul. |

**Ce ar trebui să vezi:** o listă de comenzi: `new`, `status`, `register`, `tip`, `watch`.

:::note PowerShell simplu pe Windows
Sari peste `chmod`. Înlocuiește `./tipjar` cu `java -jar target/tipjar.jar` în fiecare comandă de mai jos.
:::

### 4. Creează-ți contul de testnet de unică folosință {#key}

```bash
./tipjar new
```

**Ce face:** creează un cont nou. Scrie o frază secretă de recuperare în fișierul de chei `~/.config/qday/java.env` (în folderul tău personal, care poate fi citit doar de tine) și afișează doar adresa publică.

| Parte | Ce înseamnă |
| --- | --- |
| `new` | Creează un fișier de chei nou și afișează adresa lui. |
| `new --force` | Înlocuiește un fișier de chei existent. Cheia veche se pierde. |

**Ce ar trebui să vezi:** `new jar key`, calea fișierului de chei și o `address` care începe cu `qor1...`. Fraza de recuperare nu este niciodată afișată.

**Copiază adresa `qor1...`.** Dacă o pierzi, `./tipjar status` o afișează din nou. Nu partaja niciodată fișierul de chei, nu-l adăuga în Git și nu-l reutiliza pe mainnet. Ca să ții cheia în alt loc, setează întâi `TIPJAR_KEY`: `TIPJAR_KEY=/path/to/file ./tipjar status` (în PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Ia QOR de testnet de la faucet {#faucet}

1. Deschide https://dashboard.qorechain.io/faucet și autentifică-te.
2. Lipește adresa ta `qor1...` și apasă butonul de cerere.
3. Așteaptă câteva secunde, apoi rulează:

```bash
./tipjar status
```

**Ce face:** întreabă testnet-ul care este soldul tău și dacă cheia ta post-cuantică este înregistrată.

**Ce ar trebui să vezi:** `balance   100 QOR` (sau suma oferită de faucet) și o linie care spune că cheia ML-DSA-87 nu este încă înregistrată. Dacă soldul este 0, așteaptă 10 secunde și rulează din nou.

### 6. Înregistrează-ți cheia post-cuantică {#register}

```bash
./tipjar register
```

**Ce face:** înregistrează o singură dată cheia ta ML-DSA-87 pe lanț. Poate fi rulat din nou în siguranță. Această primă tranzacție este semnată doar cu cheia clasică, deoarece nu există încă pe lanț nicio cheie post-cuantică cu care să semneze. Costă aproximativ 0,09 QOR. Fiecare tranzacție de după ea este semnată hibrid.

**Ce ar trebui să vezi:** un hash de tranzacție și un mesaj că cheia este înregistrată. Rulează din nou `./tipjar status` și ar trebui să arate acum cheia ca înregistrată.

**Cât durează:** câteva secunde (un bloc).

### 7. Creează o a doua adresă pentru a primi bacșișuri {#jar}

Un bacșiș are nevoie de cineva care să-l primească. Fă un al doilea cont de unică folosință, "jar", cu propriul fișier de chei:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Ce face:** partea dinaintea lui `./tipjar` setează fișierul de chei doar pentru această comandă (`TIPJAR_KEY`), deci noul cont nu îl suprascrie pe primul. În Windows PowerShell rulează întâi `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`, apoi `java -jar target/tipjar.jar new`, iar la final resetează cu `Remove-Item Env:TIPJAR_KEY`.

**Ce ar trebui să vezi:** o adresă nouă `qor1...`. Copiaz-o. Aceasta este **adresa jar**. Jar-ul nu are nevoie de niciun QOR ca să primească bacșișuri.

### 8. Trimite un bacșiș semnat hibrid {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Înlocuiește `qor1...JAR_ADDRESS` cu adresa jar de la pasul 7.

| Parte | Ce înseamnă |
| --- | --- |
| `tip` | Trimite un bacșiș. |
| `qor1...JAR_ADDRESS` | Cine primește bacșișul. |
| `1` | Suma în QOR (deci 1 QOR = 1.000.000 uqor). |
| `"my first quantum-safe tip"` | Memo-ul, un text scurt atașat tranzacției. Opțional. Păstrează ghilimelele dacă are spații. |

**Ce face:** aplicația întreabă lanțul de câtă gas are nevoie tranzacția (o rulare de test), adaugă 30 la sută ca marjă de siguranță, semnează cu ambele chei, o trimite, așteaptă blocul și apoi verifică înregistrarea lanțului însuși.

**Ce ar trebui să vezi:** hash-ul tranzacției, înălțimea blocului și rezultatul `QUANTUM-SAFE`. Dacă vezi `CHECK FAILED`, consultă secțiunea Depanare. Copiază hash-ul.

**Cât durează:** aproximativ 10 secunde.

### 9. Urmărește jar-ul, ca un backend de magazin {#watch}

Deschide un **al doilea terminal**, mergi în același folder și pornește observatorul:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Acum întoarce-te la primul terminal și trimite încă un bacșiș (pasul 8, cu un memo nou).

**Ce face:** `watch` întreabă lanțul la fiecare 3 secunde dacă există transferuri noi către jar și le etichetează pe fiecare. `NO_COLOR=1 ./tipjar watch ...` oprește culorile. Oprește-l cu Ctrl+C.

**Ce ar trebui să vezi:** fiecare bacșiș listat cu eticheta `QUANTUM-SAFE`. Un bacșiș trimis fără o semnătură hibridă verificată ar apărea cu `classical only`.

## Verifică tranzacția singur {#verify}

Nu trebuie să ai încredere în aplicație. Întreabă direct lanțul.

**Modul 1, în browser.** Deschide `https://explore.qore.network/tx/<HASH>` (pune hash-ul tău în locul lui `<HASH>`), apoi comută explorerul pe **Testnet**. Ar trebui să vezi o tranzacție reușită.

**Modul 2, o singură comandă.** Pune hash-ul tău în locul lui `<HASH>`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Ce înseamnă |
| --- | --- |
| `curl` | O unealtă care descarcă o adresă web. Inclusă în macOS, Windows 10+ și majoritatea sistemelor Linux. |
| `-s` | Silențios: ascunde bara de progres. |
| adresa | API-ul REST public de testnet. Returnează înregistrarea completă a tranzacției, în format JSON. |

**Ce ar trebui să vezi** în rezultatul lung (folosește un vizualizator JSON sau adaugă `| jq .` dacă ai instalat jq):

- `"code": 0` înseamnă că tranzacția a reușit.
- O extensie `PQCHybridSignature` care conține un `pqc_signature` de **4.627 de octeți** (aceasta este semnătura ML-DSA-87).
- Un eveniment `pqc_hybrid_verify` cu `status` setat la `verified` pentru adresa ta.

## Cum funcționează dovada {#proof}

Aplicația citește aceeași înregistrare de la `GET /cosmos/tx/v1beta1/txs/{hash}` și caută evenimentul `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) și extensia `/qorechain.pqc.v1.PQCHybridSignature` cu o semnătură de 4.627 de octeți. Observatorul face același lucru pentru fiecare transfer primit.

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `./tipjar: Permission denied` | Un fișier proaspăt descărcat nu este marcat ca rulabil. | Rulează `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | Fișierul jar lipsește. | Rulează `mvn -q package` în acest folder (pasul 2). |
| `mvn: command not found` sau `java: command not found` | Unealta nu este instalată sau terminalul nu a fost redeschis. | Instaleaz-o (vezi Înainte să începi), deschide un terminal nou, verifică versiunea. |
| Java spune versiunea 17 sau mai mică | O versiune Java mai veche este prima pe calea de căutare. | Instalează Java 21, deschide un terminal nou, rulează din nou `java -version`. |
| `no key file at ..., run new first` | Ai sărit peste pasul 4 sau `TIPJAR_KEY` arată în alt loc. | Rulează `./tipjar new`. |
| `key file already exists` | Ai făcut deja o cheie. | Păstreaz-o sau înlocuiește-o cu `./tipjar new --force` (cheia veche se pierde). |
| `account has no PQC key and classical fallback is disabled` | Cheia post-cuantică nu este încă înregistrată. | Rulează mai întâi `./tipjar register`. |
| `EVM authorisation window exhausted` | Acest mesaj aparține aplicațiilor EVM (counter, guestbook). Nu este folosit de Tip Jar. | În aplicațiile EVM, deschide o fereastră nouă cu `pnpm window open`. |
| `HHE10402` după deschiderea ferestrei | Doar pentru aplicațiile Hardhat: fereastra nu era încă activă. | În aplicațiile Hardhat, rulează din nou deploy-ul. |
| Soldul este 0 sau `not on chain yet` | Fondurile de la faucet nu au ajuns încă. | Așteaptă 10 secunde, rulează `./tipjar status`. Verifică dacă ai lipit adresa corectă. |
| Faucet-ul spune că ai atins o limită de cereri | O cerere la 24 de ore pentru fiecare cont. | Așteaptă sau folosește un al doilea cont de unică folosință. |
| `chain refused the tx` sau `poll failed` | Testnet-ul este ocupat sau se actualizează, ori punctul public limitează cererile per adresă IP. | Așteaptă un minut și rulează comanda din nou. |
| `recipient must be a qor1... address` | Adresa este greșită sau are spații. | Copiază din nou adresa completă `qor1...`. |
| Erori `CORS` într-un browser | Doar când o pagină web apelează direct lanțul. Această aplicație nu o face. | Într-o aplicație din browser, folosește proxy-ul `/lcd` al șablonului. |
| `pnpm: command not found` | pnpm nu este instalat. Nu este necesar aici. | Doar pentru tutorialul Hardhat: rulează `npm install -g pnpm`. |

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

Gas-ul nu este niciodată fix: fiecare tranzacție este simulată mai întâi și primește gas-ul simulat înmulțit cu 1,3, evaluat la 0,15 uqor pentru fiecare unitate de gas.

Contul este un cont QoreChain clasic cu coin 118 (`m/44'/118'/0'/0/0`). Cheia ML-DSA-87 este derivată din aceeași frază de recuperare și legată de adresă cu `Authenticator.derivePqcCanonical`. Dacă îți construiești propria aplicație pe ajutoarele bazate pe seed, SDK 0.13.0 are nevoie de un cod de recuperare sau de un secret PQC independent de 32 de octeți; vezi [Instalarea SDK](/sdk/install#whats-new-0130). Nu afișa niciodată un cod de recuperare.

## Pachete folosite {#packages}

| Element | Versiune |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Aplicația `demo:tipjar` | 1.0.0 |

Vezi [Instalarea SDK](/sdk/install) pentru tabelul de versiuni al tuturor limbajelor.

## Unde cauți informații {#access}

| Ce | Unde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (comută pe Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Cod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
