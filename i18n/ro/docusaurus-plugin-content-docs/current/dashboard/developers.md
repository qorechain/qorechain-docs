---
slug: /dashboard/developers
title: Dezvoltatori
sidebar_label: Dezvoltatori
sidebar_position: 13
---

# Dezvoltatori

Pagina **Developers** (`/developers`, bara laterală **Build**, intrarea **Developers**) este o pagină publică cu unelte pentru cei care construiesc pe QoreChain. Nu necesită cont. Are șase tab-uri: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** și **AI agents (MCP)**. Împreună îți permit să găsești și să instalezi pachetul potrivit, să verifici ce cheie post-cuantică are înregistrată un cont și dacă fereastra sa de autorizare EVM este deschisă, să rulezi în simulare (dry-run) o tranzacție semnată, să exersezi semnarea hibridă cu o cheie de unică folosință și să testezi o aplicație dApp cu un portofel QoreX simulat (mock), totul în browser. Este destinată dezvoltatorilor de dApp-uri, de portofele și de backend. Un **Transaction inspector** este planificat și încă nu este activ (vezi [Limite](#limits)). Pentru bibliotecile în sine vezi [Pachete pentru dezvoltatori](/developer-tools/overview), [Prezentare generală SDK](/sdk/overview) și [Instalare](/sdk/install).

## Inovații {#innovations}

- **Un gateway doar pentru citire către lanț.** Uneltele citesc date publice ale lanțului și simulează o tranzacție printr-un gateway doar pentru citire, pe căile de interogare `cosmos/`, `cosmwasm/` și `qorechain/`, plus apelul de simulare. Nimic de pe pagină nu poate transmite o tranzacție. Gateway-ul există pentru că endpoint-urile REST ale lanțului nu trimit anteturi CORS pentru browser.
- **Chei care nu părăsesc niciodată browserul.** Cheile pentru signing playground și pentru portofelul de test sunt generate în browserul tău și păstrate doar în memorie. Nu sunt niciodată salvate sau trimise și dispar la reîncărcare. Cele două tab-uri sunt doar pentru testnet și refuză mainnet-ul.
- **Biblioteca de semnare din producție, nu o demonstrație.** Playground-ul folosește [QoreSign](/qoresign/overview), aceeași bibliotecă open-source ca integrările din producție. Produce și verifică semnături hibride: o semnătură secp256k1 plus o semnătură ML-DSA-87 peste același mesaj.
- **Un hub de pachete generat din date testate.** Tab-ul **SDKs** listează aproximativ 40 de pachete dintr-un singur manifest. Versiunile sunt citite live din fiecare registru (reîmprospătate la fiecare 10 minute, cu ultima versiune verificată și data ei afișate dacă un registru nu poate fi contactat), iar fiecare ghid rapid (quickstart) a fost rulat de echipa SDK pe registrele publice, cu rezultatul observat afișat alături.
- **Răspunsuri din lanț, nu presupuneri.** **PQ key status** citește cheia ML-DSA-87 înregistrată și starea ferestrei EVM din rutele de interogare proprii ale nodului, astfel încât poți vedea de ce o tranzacție EVM ar fi refuzată înainte de a o trimite.

## Cum se folosește {#how-to-use}

Deschide [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Pagina se deschide pe **SDKs**. Tab-urile **PQ key status** și **Simulator** afișează un comutator **Network** (Testnet sau Mainnet) local paginii, care are ca **valoare implicită Testnet**, indiferent ce arată antetul. Este local paginii intenționat: comutatorul din antet reîncarcă pagina, ceea ce ar șterge cheile din memorie și portofelul de test.

### SDKs {#sdks}

**Ce face.** Listează fiecare bibliotecă QoreChain, grupată pe produs. Manifestul conține aproximativ 40 de pachete în TypeScript, Python, Go, Rust, Java, Kotlin și Swift. Cele mai multe sunt stabile; unul este depreciat, iar un pachet care nu este încă în registrul său este marcat ca atare. Produsele, în ordinea afișată, sunt: QoreChain SDK (core, hook-uri React, EVM, SVM, starterul dApp și portările Python, Rust, Go și Java), QoreSign, RDK (kitul de dezvoltare pentru rollup-uri, instrumentul său în linie de comandă, starterul de rollup și portările Python, Rust, Go și Java), biblioteca PQC, wallet adapter, chain bridge, Handles, integrările QoreX, precum și MCP și CLI-ul `qore`.

**Cum funcționează.** Fiecare produs este o cartelă. Dacă produsul apare în mai multe limbaje, un selector de limbaj (pastile) schimbă pachetul afișat. Fiecare pachet arată:

- o pastilă de stare (**Stable**, **Not published yet** sau **Deprecated**);
- **ultima versiune**, citită live din registrul său (npm, PyPI, crates.io, proxy-ul Go, Maven Central sau GitHub releases) și reîmprospătată la fiecare 10 minute. Dacă un registru nu poate fi contactat, se afișează ultima versiune verificată, cu data ei, și o notă că versiunile live nu au putut fi citite;
- **Registry**, **Source** (depozitul) și **License** (Apache-2.0), precum și cerințele de runtime;
- comanda **Install** și linia **Import**, fiecare cu buton de copiere, plus dependențe peer, exporturi pe subcăi, transporturi și un endpoint găzduit acolo unde pachetul le are (Maven afișează un bloc `pom.xml`);
- **Quickstart**: o pastilă cu textul **Tested** și data, **Failed in testing** sau **Not tested**, numele fișierului, codul cu buton de copiere, **Observed output** și **How it was tested**. Un quickstart care a eșuat este ascuns sub **Show the quickstart**, cu un avertisment să citești mai întâi problemele cunoscute;
- **Known issues** și note, cuvânt cu cuvânt de la echipa SDK.

Un pachet care nu este publicat afișează „This package is not on its registry yet, so there is no install command." și nicio linie de instalare. Pachetul depreciat (`@qorechain/connect`) este strâns în partea de jos, sub **Deprecated packages**, cu înlocuitorii săi (pachetele `@qorechain/qorex-*`).

**Pași.**

1. Scrie în caseta de filtrare („Filter by name or language”) pentru a restrânge lista; **Clear filter** o resetează. Când se potrivesc mai multe produse, un rând **Jump to** trimite la fiecare.
2. Alege produsul, apoi pastila de limbaj.
3. Verifică linia de versiune („latest on npm” sau „checked” cu o dată), apoi copiază comanda **Install**.
4. Copiază linia **Import**, apoi quickstart-ul în fișierul denumit sub **File name**, și rulează-l.
5. Deschide **Network endpoints** pentru a copia id-urile de chain și endpoint-urile publice pentru testnet și mainnet. Nota de sub el explică convențiile quickstart-urilor: exemplele doar citesc și semnează cu fraza publică de test, așa că nu alimenta niciodată un cont derivat din ea.

**Exemplu minimal.** Scrie `python` în filtru, deschide **QoreChain SDK**, alege pastila **Python**, copiază comanda de instalare din **Install**, apoi copiază quickstart-ul și rulează-l.

**Rețea.** Listă statică plus citiri live din registre; nu se aplică nicio alegere de rețea.

### PQ key status {#pq-status}

**Ce face.** Arată cheia ML-DSA-87 pe care un cont a înregistrat-o în lanț și starea ferestrei sale de autorizare EVM, pe mainnet sau testnet.

**Cum funcționează.** Pagina parsează intrarea ta, o convertește într-un cont `qor1...` și pune nodului două interogări: cheia PQC înregistrată (prin [QoreSign](/qoresign/overview)) și fereastra EVM a contului (`GET /qorechain/pqc/v1/evm_window/{address}`). O adresă `0x...` reprezintă aceiași 20 de octeți ca forma sa `qor1...`, iar o adresă `qorvaloper1...` este căutată ca propriul cont al operatorului. Rezultatele aparțin unei singure rețele: schimbarea comutatorului le șterge.

**Pași.**

1. Deschide tab-ul **PQ key status** și alege rețeaua.
2. Introdu o **Account address** (`qor1...`, `0x...` sau `qorvaloper1...`). Pagina verifică formatul și suma de control și raportează o greșeală de tastare.
3. Selectează **Check**.
4. Citește **Registered PQC key**: dacă o cheie este înregistrată, **Algorithm** (ML-DSA-87), **Key type** (hybrid), **Proof of possession** (cu nota că lanțul o tratează ca opțională) și **Public key** (2592 de octeți, trunchiată, cu buton de copiere). Un cont fără cheie afișează „This account has no PQC key registered on this network.”
5. Citește **EVM authorisation window**: **State** (**Open** sau **Closed**), **Blocks left**, **Transactions used** (în stilul „3 of 20”), **Value used**, **Opened / expiry height** și dacă fereastra permite **Native QOR transfers only**, cu eventualele ținte permise. Un cont care nu a deschis niciodată una afișează „No EVM authorisation window has been opened for this account.”

Fereastra se deschide pe lane-ul nativ cu cheia ML-DSA-87 a contului și se închide când este atinsă limita de blocuri sau limita de tranzacții; vezi [Fereastra de autorizare EVM](/developer-guide/evm-development#evm-window).

**Exemplu minimal.** Alege Testnet, lipește forma `0x...` a unei adrese pe care o folosești cu MetaMask și selectează **Check**: dacă fereastra este **Closed** sau lipsește, o tranzacție EVM de la acel cont ar fi refuzată.

### Simulator {#simulator}

**Ce face.** Rulează în simulare (dry-run) o tranzacție semnată față de lanț și raportează ce ar costa și ce ar modifica. Nu se transmite nimic.

**Cum funcționează.** Pagina decodează intrarea ta (base64 sau hex, până la aproximativ 180 KB), îi numără semnăturile și o trimite la ruta de simulare a nodului. Apelul de simulare este singura rută de scriere pe care o permite gateway-ul.

**Pași.**

1. Deschide **Simulator** și alege rețeaua.
2. Lipește tranzacția semnată (un `TxRaw`, base64 sau hex) în **Signed TxRaw**. Pagina arată dimensiunea decodată și numărul de semnături și avertizează dacă nu există niciuna (lanțul va refuza cel mai probabil să simuleze o tranzacție nesemnată).
3. Selectează **Simulate**.
4. Citește **Gas used**, **Suggested gas limit**, **Balance changes** (adresă, denominație, modificare) și **Events** în lista pliabilă.
5. Dacă lanțul refuză, pagina afișează **Code**, **Codespace** și **Log** sub „The chain refused the simulation”.

Ai nevoie mai întâi de octeți semnați: construiește și semnează cu un SDK sau cu `qorechaind` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)). **Exemplu minimal:** semnează un transfer mic cu SDK-ul pe testnet, lipește `TxRaw` în base64, selectează **Simulate** și verifică limita de gas sugerată înainte de a transmite.

### Signing playground (doar testnet) {#signing-playground}

**Ce face.** Îți permite să generezi o cheie hibridă de unică folosință și să semnezi și să verifici în browser mesaje și cereri Sign In With QoreChain.

**Cum funcționează.** O frază de 24 de cuvinte este generată în pagină și păstrată doar în memorie. [QoreSign](/qoresign/overview) derivă din ea o cheie secp256k1 și o cheie ML-DSA-87. Semnăturile acoperă același mesaj cu ambele chei, pentru lanțul `qorechain-diana`. Deoarece o cheie de unică folosință nu este înregistrată în lanț, verificarea folosește cheia publică ML-DSA-87 a acestei sesiuni.

**Pași.**

1. Deschide **Signing playground**. Acesta avertizează „Throwaway testnet key: never use it for real funds.”
2. Selectează **Generate throwaway key**. Pagina afișează adresa `qor1...`, cheia publică secp256k1 (33 de octeți) și cheia ML-DSA-87 (cheie publică de 2592 de octeți, cheie secretă de 4896 de octeți). **New key** o înlocuiește.
3. **Message:** introdu text, selectează **Sign**; rezultatul este o semnătură hibridă ca JSON. Selectează **Verify**: pagina afișează „Valid signature” sau „Invalid signature” cu codul de eroare.
4. **Sign In With QoreChain:** selectează **Build message** (un mesaj de autentificare pentru acest site, cu domeniul, adresa, id-ul de chain, un nonce aleatoriu și momentele emiterii și expirării), apoi **Sign**, apoi **Verify**. Verify îl verifică așa cum ar face un server și listează câmpurile parsate. Vezi [specificația SIWQ](/qoresign/spec/siwq-v1) și [ghidul de autentificare](/qoresign/guides/sign-in).

**Exemplu minimal.** **Generate throwaway key**, scrie `hello`, **Sign**, **Verify**: pagina afișează „Valid signature”.

**Rețea.** Doar testnet; cheia nu poate fi folosită pe mainnet și se pierde la reîncărcare.

### QoreX test wallet (doar testnet) {#test-wallet}

**Ce face.** Instalează un mock al portofelului QoreX în tab-ul curent, ca să poți încerca fluxurile de conectare și semnare ale unui dApp fără un portofel real.

**Cum funcționează.** **Start test wallet** creează un portofel de test cu o cheie de unică folosință (pachetul publicat `@qorechain/qorex-wallet-mock`) și îl anunță dApp-urilor din pagină drept „QoreX (mock)”, prin descoperirea standard a portofelelor pentru browser (EIP-6963); expune și `window.qorex`. Nimic nu este aprobat automat. Nu transmite tranzacții. Dacă în tab există o extensie QoreX reală, mock-ul o înlocuiește până la reîncărcare.

**Pași.**

1. Deschide **QoreX test wallet** și citește avertismentul: fiecare pornire generează în memorie o cheie de testnet de unică folosință; nu trimite niciodată fonduri reale către ea.
2. Selectează **Start test wallet**. Cartela **Addresses** listează adresele QoreChain Native, EVM și SVM.
3. Conectează-te dintr-un dApp care rulează în acest tab sau apelează `window.qorex` din consola browserului.
4. Fiecare cerere apare la **Waiting for approval**; selectează **Approve** sau **Reject**. Lista **Requests** înregistrează fiecare cerere cu starea de aprobare și rezultatul.
5. Selectează **Stop (reloads the page)** pentru a elimina mock-ul.

**Exemplu minimal.** Pornește portofelul de test, deschide un dApp în același tab, alege „QoreX (mock)” în dialogul său de conectare și **Approve** conexiunea.

**Rețea.** Doar testnet.

### AI agents (MCP) {#mcp}

**Ce face.** Arată starea serverului MCP QoreChain (un server Model Context Protocol care permite unui client MCP să citească date din lanțul QoreChain și să folosească uneltele pentru dezvoltatori) și cum îl configurezi într-un client MCP.

**Cum funcționează.** Când deschizi tab-ul, pagina interoghează live registrul de pachete și afișează starea (**Published**) cu versiunea curentă (`@qorechain/mcp`, 0.1.0 la momentul scrierii, care se găsește și pe PyPI ca `qorechain-mcp`). Apoi afișează configurarea pentru un client MCP, ca blocuri de copiat:

- **Local (stdio), opțiunea principală.** Adaugă `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` în configurația de servere a clientului tău MCP. Nu necesită nicio cheie.
- **Auto-găzduit (Streamable HTTP).** Rulează `qorechain-mcp serve --port 8787` și îndreaptă clientul către `http://localhost:8787/mcp`.
- **Endpoint găzduit.** `https://mcp.qorechain.io/mcp` servește implicit testnet-ul. Fiecare cerere are nevoie de o cheie API, trimisă ca antet `Authorization: Bearer`; cheile se emit la cerere. Pentru majoritatea utilizărilor, configurarea locală nu necesită nicio cheie.

**Pași.** Deschide tab-ul, copiază configurația locală în clientul tău MCP, repornește-l și cere-i să citească un bloc sau un cont. Pentru detalii despre unelte și opțiuni vezi [Serverul MCP QoreChain](/developer-tools/mcp). **Exemplu minimal:** lipește blocul stdio în clientul tău, repornește-l și cere-i ultimul bloc.

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) sau **Developers** în grupul **Build** din bara laterală (și în meniul mobil).
- **Autentificare:** niciuna. Pagina este deschisă tuturor.
- **Rețea:** **PQ key status** și **Simulator** funcționează pe mainnet sau testnet prin comutatorul din tab (implicit testnet). **Signing playground** și **QoreX test wallet** sunt doar pe testnet. **SDKs** și **AI agents (MCP)** nu depind de o rețea.
- **Portofel:** niciunul. Uneltele își generează propriile chei de unică folosință.
- **Cost:** gratuit. Nu se trimite nimic către lanț în afară de interogări de citire și apeluri de simulare.
- **Confidențialitate:** cheile de unică folosință există doar în memoria paginii. Nu lipi o frază de recuperare reală în nicio unealtă.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele |
| --- | --- | --- |
| Pagina Developers | `dashboard.qorechain.io/developers` | Unelte de citire pe mainnet și testnet; unelte de semnare doar pe testnet |
| Biblioteca de semnare | npm `@qorechain/qoresign`, sursa `github.com/qorechain/qoresign`, vezi [QoreSign](/qoresign/overview) | n/a |
| Pachetul de portofel de test | npm `@qorechain/qorex-wallet-mock`, sursa `github.com/qorechain/qorex-integrations` | Testnet |
| Indexul de pachete | [Pachete pentru dezvoltatori](/developer-tools/overview) | n/a |
| Server MCP | npm `@qorechain/mcp` 0.1.0 și `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0; ghid: [Serverul MCP QoreChain](/developer-tools/mcp) | Implicit testnet |

Versiunile pachetelor se schimbă; citește-le pe cele curente în tab-ul **SDKs** sau în registre.

## Limite și probleme cunoscute {#limits}

- **Transaction inspector: în curând, încă nu este activ.** Planificat: lipești un hash și vezi fiecare mesaj, semnatarul, comisionul, dacă semnătura post-cuantică se verifică în raport cu cheia înregistrată a semnatarului și nivelul de securitate. Apare odată cu următoarea versiune QoreSign.
- **Endpoint-ul MCP găzduit are nevoie de o cheie API,** emisă la cerere; configurarea locală nu are nevoie de niciuna. Folosește configurarea locală pentru majoritatea lucrărilor.
- **Două quickstart-uri sunt marcate „Not tested”:** QoreSign pentru Android (același cod a fost rulat doar pe artefactul JVM, nu pe un dispozitiv) și QoreSign pentru Python. Celelalte 32 de intrări quickstart au rulat și au trecut.
- **Simulatorul are nevoie de octeți semnați.** Nu poate semna în locul tău și nu transmite niciodată.
- **Playground-ul și portofelul de test sunt doar pe testnet,** folosesc chei de unică folosință care dispar la reîncărcare și nu pot deține sau muta fonduri reale.
- **O extensie QoreX reală din același tab este înlocuită** de portofelul de test până când reîncarci pagina.
- **Citirile trec prin gateway-ul Dashboard-ului.** Din propriul cod, apelează direct endpoint-urile publice: `api.qore.host` și `api-testnet.qore.host`.
