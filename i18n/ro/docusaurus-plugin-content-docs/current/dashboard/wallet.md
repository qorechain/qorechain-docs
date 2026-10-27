---
slug: /dashboard/wallet
title: Portofel
sidebar_label: Portofel
sidebar_position: 3
---

# Portofel

Pagina **Wallet** este locul unde îți vezi soldul și istoricul tranzacțiilor, primești QOR și îl trimiți. Modul în care funcționează pagina depinde de rețea:

- **Mainnet — non-custodial.** Dashboard-ul nu deține chei de mainnet. Îți conectezi propriul portofel — **QoreX** (portofelul oficial QoreChain, extensie sau aplicație), **Keplr** sau **MetaMask** — soldul și istoricul tău real sunt citite direct din blockchain, și poți primi fonduri pe orice traseu. Trimiterea și staking-ul pe **traseul Native necesită QoreX**: conturile QoreChain semnează cu o semnătură hibridă post-cuantică, iar QoreX este portofelul care o produce, astfel încât filele Send și Stake ale Dashboard-ului funcționează prin QoreX indiferent ce alt portofel mai ai conectat. Keplr poate fi în continuare conectat pentru a-ți vizualiza soldul pe traseul Native (`qor1...`) și pentru a primi fonduri pe el. **MetaMask** se conectează pe **traseul EVM** (`0x...`) și semnează el însuși tranzacțiile EVM, dar începând cu versiunea v3.2.0 a lanțului, calea EVM admite o tranzacție doar de la un cont care are o cheie post-cuantică înregistrată **și** o fereastră de autorizare EVM deschisă. MetaMask nu poate înregistra acea cheie și nici deschide o fereastră; QoreX poate. Vezi [Trimiterea cu MetaMask](#send-metamask).
- **Testnet — custodial.** Dashboard-ul gestionează un portofel de test pentru tine, astfel încât poți încerca transferuri, swap-uri și staking fără nicio configurare. Alimentează-l din [Faucet](/dashboard/faucet).

Conturile sunt protejate cu criptografie rezistentă cuantic, iar codificarea Native a fiecărei adrese folosește prefixul bech32 `qor` (`qor1...`).

## Un singur cont, trei codificări {#one-account-three-encodings}

Un cont QoreChain este o identitate unică ce poate fi scrisă în trei moduri — câte unul pentru fiecare traseu de execuție:

| Traseu | Codificare | Arată astfel |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | de exemplu, `5Gv7...` |

Toate cele trei codificări indică spre **același cont și același sold**. Fondurile primite pe orice traseu ajung în soldul tău unic, iar Dashboard-ul indexează soldul și istoricul prin codificarea `qor1` (Native), astfel încât activitatea de pe fiecare traseu apare împreună.

## Utilizează Portofelul pe mainnet {#mainnet}

1. Comută antetul Dashboard-ului pe **Mainnet**.
2. Dacă ți se cere, acceptă [confirmarea unică a riscului](/dashboard/overview#risk-acknowledgement) — mainnet-ul mută fonduri reale, Dashboard-ul este non-custodial, iar tranzacțiile sunt ireversibile.
3. Pe ecranul de conectare alege un portofel — **Connect with QoreX** (recomandat, portofelul oficial QoreChain — obligatoriu pentru trimitere și staking pe traseul Native), **Connect Keplr** (pentru vizualizare/primire pe traseul Native) sau **Connect MetaMask** (pentru conectare și primire pe traseul EVM; trimiterea necesită o fereastră EVM deschisă, vezi [Trimiterea cu MetaMask](#send-metamask)). Vezi mai jos pașii detaliați pentru fiecare. Phantom nu poate fi conectat aici ca portofel; vezi nota de la [Conectează-te cu Keplr](#connect-keplr).
4. Pagina îți încarcă soldul real și istoricul tranzacțiilor direct din blockchain.

Odată conectat, pagina Portofel organizează totul în șase file: **Wallet** (soldul și rezumatul contului), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (adresele tale `qor1...` / `0x...` / SVM) și **Connect Wallets** (fiecare portofel pe care l-ai atașat și locul de unde conectezi altele). Filele Send, Stake și Rewards funcționează prin QoreX — acest lucru este valabil chiar dacă ai și Keplr sau MetaMask conectate, pentru că tranzacțiile pe traseul Native necesită semnătura hibridă post-cuantică pe care o produce QoreX.

Dacă portofelul tău nu are încă QoreChain configurat, adaugă-l mai întâi — vezi [Adaugă QoreChain în portofelul tău](#add-network).

### Conectează-te cu QoreX — extensie de browser {#connect-qorex-extension}

1. În pagina Portofel, găsește cardul **QoreX wallet** și selectează **Connect with QoreX**.
2. Deoarece extensia QoreX este detectată în acest browser, Dashboard-ul te întreabă cum vrei să te conectezi. Selectează **Browser extension**.
3. Extensia QoreX își deschide propriul popup de aprobare, arătând `dashboard.qorechain.io` ca site-ul care solicită conexiunea.
4. Verifică cererea din popup și aprob-o — aceasta semnează o dovadă unică că deții adresa ta `qor1...`; nu se mută niciun fond și nu este acordată nicio altă permisiune.
5. Popup-ul se închide, iar Dashboard-ul afișează **Connected: qor1...** pe cardul QoreX, adresa ta deblocând restul paginii Portofel. Alegerea extensie/aplicație este reținută, astfel încât data următoare când selectezi **Connect with QoreX** în acest browser te reconectezi în același mod, fără să ți se mai ceară — folosește **Use a different method** pe cardul de conectare dacă vrei vreodată să schimbi metoda.

Poți lega mai mult de o adresă QoreX la același cont Dashboard — de exemplu una dintr-o extensie Firefox și una din Chrome, sau un telefon și un laptop. Selectează **Add another wallet** pentru a repeta fluxul cu o a doua adresă; fiecărei adrese legate i se poate atribui propria etichetă, iar una este marcată drept implicită pentru trimitere, ambele din fila **Connect Wallets**.

**Comutarea între portofele în fila Wallet.** Odată ce este atașat mai mult de un portofel — QoreX și MetaMask, sau două adrese QoreX — în partea de sus a filei **Wallet** apare un rând de chip-uri de portofel introdus de **Viewing**, câte unul pentru fiecare portofel atașat, cu cel activ marcat. Dă clic pe un chip pentru a schimba al cărui portofel sold și istoric te uiți, fără a părăsi fila sau a merge la **Connect Wallets**. Rândul este ascuns când este atașat un singur portofel, deoarece un selector nu ar avea ce să facă.

**Conturi din extensia ta QoreX care nu sunt încă legate.** O singură frază de recuperare poate deriva mai multe conturi, iar crearea unuia în QoreX nu anunță Dashboard-ul — legarea este un pas separat, semnat. Când extensia QoreX își poate lista conturile, filele **Wallet**, **Details** și **Connect Wallets** afișează un card de tipul „2 accounts in your QoreX extension are not linked here", cu soldul fiecărui cont (și cât din el este în staking, ceea ce nu poate fi trimis). Selectează **Link this account** pentru a-l asocia; legarea permite Dashboard-ului să afișeze soldul și istoricul acestuia și nu acordă niciun control asupra cheilor tale. Dacă versiunea ta de QoreX nu poate alege ce cont să dovedească, de aici poate fi legat doar contul activ — cardul îți spune să comuți mai întâi la acel cont în QoreX.

În fila **Details**, **Linked addresses** listează fiecare adresă atașată contului tău împreună cu portofelul de origine; poți redenumi o adresă, poți marca una ca implicită pentru trimitere și poți vedea dacă este controlabilă în QoreX sau doar de urmărit (lacăt).

### Conectează-te cu QoreX — aplicația mobilă {#connect-qorex-app}

1. În pagina Portofel, găsește cardul **QoreX wallet** și selectează **Connect with QoreX**.
2. Dacă apare selectorul de extensie, alege **QoreX app** (dacă nu este detectată nicio extensie în acest browser, Dashboard-ul trece direct la acest flux).
3. Dashboard-ul afișează un cod QR și un link **Open QoreX**.
4. Pe telefonul tău, deschide aplicația QoreX și scanează codul QR cu ea — sau, dacă navighezi de pe același telefon, atinge **Open QoreX** pentru a lansa direct aplicația prin link-ul `qorex://connect`.
5. QoreX afișează cererea de asociere împreună cu originea Dashboard-ului. Verific-o și aprob-o cu confirmarea biometrică (Face ID / Touch ID / PIN).
6. Dashboard-ul verifică periodic aprobarea în fundal; în câteva secunde afișează **Connected: qor1...** pe cardul QoreX, iar adresa ta deblochează restul paginii Portofel.

### Conectează-te cu Keplr {#connect-keplr}

Keplr se conectează pentru a-ți vizualiza soldul, istoricul și adresa de primire pe traseul Native. Trimiterea și staking-ul pe traseul Native folosesc QoreX (vezi mai jos) — conturile QoreChain semnează cu o semnătură hibridă post-cuantică, motiv pentru care filele Send și Stake ale Dashboard-ului funcționează prin QoreX, și nu prin portofelul pe care l-ai conectat aici.

1. În pagina Portofel, selectează **Connect Keplr**.
2. Dacă QoreChain nu este încă configurat în Keplr, Dashboard-ul declanșează promptul `suggestChain` al Keplr — verifică detaliile rețelei (chain ID, endpoint-uri RPC/REST) în popup-ul Keplr și selectează **Approve** pentru a o adăuga.
3. Keplr îți cere apoi să selectezi contul de conectat și să aprobi conexiunea — selectează **Approve**.
4. Dashboard-ul citește adresa ta `qor1...` și îți încarcă soldul și istoricul.

Phantom nu poate fi conectat ca portofel în pagina Portofel de pe mainnet. Adresele Phantom legate anterior apar în continuare în **Connected wallets**; pentru legarea unei chei Phantom ca semnatar, vezi [Semnatari legați (Phantom)](#linked-signers).

### Conectează-te cu MetaMask {#connect-metamask}

1. În pagina Portofel, selectează **Connect MetaMask**.
2. Dacă rețeaua EVM QoreChain nu este încă adăugată, MetaMask afișează promptul său **Add network** (EIP-3085) cu chain ID, URL-ul RPC și simbolul monedei pre-completate — verifică-l și selectează **Approve**, apoi **Switch network**.
3. MetaMask te întreabă ce cont să conecteze — selectează contul și confirmă **Connect**.
4. Dashboard-ul citește adresa ta `0x...` și îți încarcă soldul și istoricul.

### Trimite pe mainnet {#send-mainnet}

Deoarece Dashboard-ul nu deține niciodată cheile tale de mainnet, fiecare trimitere este compusă pe Dashboard, dar finalizată în propriul tău portofel. Pe **traseul Native**, acel portofel este întotdeauna **QoreX** — filele Send și Stake funcționează prin el indiferent ce alt portofel mai ai conectat, pentru că conturile QoreChain semnează cu o semnătură hibridă post-cuantică. Pe **traseul EVM**, MetaMask semnează tranzacția, cu condiția ca contul să aibă deja o cheie post-cuantică și o fereastră EVM deschisă (vezi [Trimiterea cu MetaMask](#send-metamask)).

:::caution Fonduri reale, transferuri ireversibile
Tranzacțiile de pe mainnet sunt ireversibile. Verifică întotdeauna de două ori adresa destinatarului înainte de a aproba.
:::

:::note Solduri în vesting
Dacă o parte din soldul tău este încă în vesting, aceasta contează pentru ceea ce poți delega la staking, dar nu poate plăti o taxă de tranzacție — pentru asta ai nevoie de QOR cheltuibil separat, inclusiv pentru înregistrarea unei chei PQC. Un portofel alimentat doar cu suma sa în vesting poate delega, dar nu poate trimite.
:::

#### Trimite cu QoreX — extensie de browser

1. În pagina Portofel, în cardul **Send from QoreX**, introdu destinatarul (o adresă `qor1...` sau un `@handle`), suma în QOR și, opțional, un memo. Dacă ai legat mai mult de un portofel QoreX, alege care dintre ele plătește în **Send from**.
2. Selectează **Continue in QoreX**.
3. Dashboard-ul afișează un buton **Approve in browser extension** — selectează-l.
4. Extensia QoreX își deschide popup-ul de aprobare cu transferul decodat complet — destinatar și sumă. Verifică-l și aprobă folosind securitatea proprie a extensiei (deblocare biometrică sau prin parolă).
5. Extensia semnează transferul cu o semnătură hibridă PQC și îl transmite direct în blockchain — Dashboard-ul află doar hash-ul tranzacției rezultate.
6. Pagina Portofel afișează **Transfer confirmed** cu hash-ul tranzacției, pe care îl poți deschide în [Explorer](/dashboard/explorer).

#### Trimite cu QoreX — aplicația mobilă

1. În pagina Portofel, în cardul **Send from QoreX**, introdu destinatarul (o adresă `qor1...` sau un `@handle`), suma în QOR și, opțional, un memo. Dacă ai legat mai mult de un portofel QoreX, alege care dintre ele plătește în **Send from**.
2. Selectează **Continue in QoreX**.
3. Dashboard-ul afișează un cod QR și un link **Open in QoreX** care poartă o cerere `qorex://tx`.
4. Scanează codul QR cu aplicația QoreX, sau atinge **Open in QoreX** dacă ești pe același telefon.
5. QoreX decodează cererea și afișează complet destinatarul și suma. Verific-o și aprob-o cu confirmarea biometrică.
6. QoreX semnează transferul cu o semnătură hibridă PQC și îl transmite.
7. Dashboard-ul verifică periodic rezultatul și afișează **Transfer confirmed** cu hash-ul tranzacției de îndată ce aceasta ajunge pe blockchain, hash pe care îl poți deschide în [Explorer](/dashboard/explorer).

#### Trimiterea către un @handle

Câmpul destinatar din cardul **Send from QoreX** acceptă și un `@handle` în loc de o adresă `qor1...`. Ce se întâmplă în continuare depinde de dacă ai mai plătit acel handle din acest browser înainte:

- **Prima dată**: adresa rezolvată este afișată complet, cu textul „First time sending to @handle from this browser. Check the address before you continue:", iar tu trebuie să selectezi **This address is right — continue** înainte ca aceasta să poată fi folosită — adresa este reținută (fixată) abia după ce ai confirmat-o, nu în momentul în care este rezolvată.
- **Aceeași adresă ca înainte**: trece cu o confirmare ușoară — nu este nevoie să retastezi nimic.
- **O adresă diferită față de înainte**: fluxul se oprește ferm. Atât adresa anterioară, cât și cea nouă sunt afișate complet — niciodată trunchiate, deoarece trunchierea ascunde exact caracterele din mijloc pe care un atacator ar încerca să le facă să pară similare — cu un avertisment explicit că adresa s-a schimbat și un buton **I trust this change — continue**, stilizat în mod deliberat ca secundar, pentru a continua oricum.

Această fixare este stocată doar în propriul tău browser, nu pe niciun server, astfel încât un alt calculator sau un browser golit de date arată din nou „prima dată" — acest lucru este intenționat. Handle-urile au 3–20 de caractere (`a-z`, `0-9`, `_`) și aparțin unei adrese specifice, astfel încât cineva cu mai multe adrese poate folosi un handle diferit pe fiecare. Dacă căutarea handle-urilor este temporar indisponibilă, câmpul spune acest lucru și poți totuși trimite către o adresă `qor1...`.

#### Trimite cu MetaMask {#send-metamask}

:::caution Începând cu v3.2.0 al lanțului, MetaMask singur nu poate trimite pe mainnet
Calea EVM admite o tranzacție doar de la un cont care deține o cheie post-cuantică înregistrată și are o **fereastră de autorizare EVM deschisă**: o permisiune limitată ca timp, număr și valoare, pe care contul o deschide cu un mesaj semnat post-cuantic. MetaMask nu poate produce acel mesaj. Dacă trimiți fără o fereastră, lanțul refuză tranzacția (erori tipice: fără fereastră, fereastră epuizată, fără cheie post-cuantică).
:::

1. În **QoreX** (portofelul propriu al contului), înregistrează cheia post-cuantică a contului dacă nu are una (primul tău transfer QoreX de pe acel cont o face), apoi deschide o fereastră de autorizare EVM — vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window). Aceasta este pentru **contul în stil Ethereum (coin 60)** care împarte cheia cu MetaMask — adaugă-l în QoreX cu **Add an Ethereum account (coin 60)**, folosind aceeași frază de recuperare ([cum](/qorex/getting-started#restore-dashboard)); nicio cheie MetaMask nu poate trimite de pe un cont obișnuit coin-118 `qor1…`. O fereastră este limitată de blocuri (cel mult 17,280, aproximativ 15 ore pe mainnet), de numărul de tranzacții (cel mult 1,000) și de un plafon de cheltuire în QOR care numără fiecare sumă **plus** comisionul său maxim. Alege limite cu care te simți confortabil și păstrează-le mici: cât timp o fereastră este deschisă, tranzacțiile MetaMask mută QOR fără o semnătură post-cuantică. Deschiderea unei ferestre noi o înlocuiește pe cea anterioară și avansează nonce-ul contului, așa că deschide-o **înainte** de a trimite din MetaMask (o tranzacție pregătită mai devreme eșuează cu „nonce too low"). Începând cu v3.2.3, lanțul acceptă și ferestre mai înguste, cu domeniu restrâns; QoreX nu oferă încă un ecran pentru ele.
2. Deschide MetaMask și confirmă că este setat pe rețeaua EVM QoreChain.
3. Selectează **Send** în interiorul MetaMask, introdu adresa `0x...` a destinatarului și suma, verifică taxa de gas și confirmă.
4. Înapoi în pagina Portofel a Dashboard-ului, tranzacția apare în istoricul tău de îndată ce este pe blockchain (dă refresh dacă nu a apărut încă).

Fiecare tranzacție consumă o parte din fereastră; când se atinge limita de timp, de număr de tranzacții sau de valoare, deschide una nouă în QoreX. Închide fereastra din QoreX când ai terminat.

### Primește pe un traseu specific {#receive-mainnet}

1. Selectează **Receive**.
2. În fereastra modală de primire, alege un traseu cu selectorul: **Native QOR**, **EVM** sau **SVM**.
3. Fereastra modală îți afișează adresa în codificarea acelui traseu (`qor1...`, `0x...` sau base58), împreună cu un cod QR și un buton de copiere.
4. Copiază adresa sau lasă-l pe expeditor să scaneze codul QR.

Indiferent ce traseu folosește expeditorul, fondurile ajung în același cont — un singur cont, trei codificări, un singur sold.

### Consultă istoricul tranzacțiilor {#history}

Pe mainnet, fiecare rând din istoricul tău arată:

- O **etichetă de traseu** — Native, EVM sau SVM — care îți spune ce traseu a folosit tranzacția.
- **Sent** sau **Received** pentru transferurile obișnuite și o etichetă descriptivă de tip pentru alte activități (de exemplu *PQC key registration* sau o acțiune de contract).
- Suma, ora și o stare **Confirmed** / **Failed**, împreună cu hash-ul tranzacției pe care îl poți deschide în [Explorer](/dashboard/explorer).

## Utilizează Portofelul pe testnet {#testnet}

Pe testnet (`qorechain-diana`), Dashboard-ul gestionează un portofel de test pentru tine, astfel încât poți testa fluxurile de la un capăt la altul fără să conectezi nimic.

### Ce afișează pagina

- Eticheta portofelului tău și adresa activă, în formă prescurtată, cu un buton de copiere dintr-un clic.
- **Soldul total** în QOR.
- Un panou de securitate care indică criptarea rezistentă cuantic și rețeaua conectată.
- Un indicator al ultimei actualizări, cu o comandă de reîmprospătare.
- O secțiune **Assets & Activity** cu o filă **Transaction history** și o filă **Tokens**.

Folosește comanda de reîmprospătare oricând pentru a extrage soldul curent și activitatea cea mai recentă din blockchain.

:::caution Adresele de testnet arată exact ca adresele de mainnet
Testnet-ul și mainnet-ul folosesc același format `qor1...`, astfel încât o adresă de testnet poate fi lipită într-o retragere de la un exchange sau în alt portofel fără niciun avertisment — iar QOR real trimis către ea ajunge pe **mainnet**, la acea adresă, unde această pagină de testnet nu îl poate afișa. Nu trimite niciodată QOR real către o adresă de testnet. Dashboard-ul repetă acest avertisment lângă adresă în pagina Portofel, în lista **My Wallets** și pe ecranul **Receive**. Pentru QOR real, comută pe Mainnet și folosește adresa afișată acolo; dacă ai trimis deja QOR real către o adresă de testnet, contactează suportul — nu încerca să-l muți singur.
:::

### Trimite QOR (testnet)

1. Selectează **Send**.
2. Introdu **Recipient Address** (`qor1...`).
3. Introdu **Amount** (sau **MAX**) și, opțional, un **Memo**.
4. Selectează **Review Transaction**, verifică detaliile și taxa de rețea estimată, apoi selectează **Confirm & Send**.

Pe măsură ce tastezi un destinatar, îți sunt sugerate contactele salvate și adresele recente, pentru a te ajuta să eviți greșelile. După ce transferul este trimis, primești o confirmare cu hash-ul tranzacției, pe care îl poți deschide în [Explorer](/dashboard/explorer).

### Primește QOR (testnet)

1. Selectează **Receive**.
2. Partajează adresa ta sau codul ei QR cu expeditorul, sau copiază adresa dintr-un clic.
3. Opțional, introdu o sumă solicitată și un memo pentru a genera un link de plată și un cod QR descărcabil.

### Gestionează-ți portofelele de test

Selectează **My Wallets** pentru a-ți deschide lista de adrese. De acolo poți comuta între portofele, poți crea un portofel nou, poți importa unul existent sau poți elimina un portofel de care nu mai ai nevoie. Portofelul activ este cel folosit pentru trimitere, swap, staking și alte acțiuni semnate în întregul Dashboard, pe testnet.

### Fă o copie de rezervă sau exportă fraza de recuperare a unui portofel de test {#reveal-recovery-phrase}

Pe testnet, Dashboard-ul îți gestionează portofelele, dar poți exporta fraza de recuperare de 24 de cuvinte a unui portofel pentru a o importa într-un portofel self-custody precum QoreX.

1. În pagina **Wallet** de testnet, găsește cardul **Recovery phrase**. Acesta listează fiecare dintre portofelele tale gestionate de Dashboard, cu soldul său de **mainnet** (portofelele alimentate primele), astfel încât să poți alege portofelul care deține efectiv tokenii tăi.
2. Selectează **Reveal** lângă portofel, citește avertismentul („Reveal the phrase for …?") și selectează **Continue**.
3. Ești trimis să te autentifici din nou pe pagina de autentificare a contului (este necesară o nouă verificare a parolei; Dashboard-ul nu îți vede niciodată parola) și revii automat la portofel.
4. Cele 24 de cuvinte sunt afișate timp de 60 de secunde. Notează-le și păstrează-le offline. Numărătoarea inversă se oprește cât timp bifezi caseta de confirmare sau tastezi în câmpurile de verificare.
5. Bifează **I have written down my recovery phrase and stored it somewhere safe**, tastează cuvintele **3**, **5** și **9** din copia ta scrisă (marcate *Required*) și selectează **Confirm backup**. Vezi „Recovery phrase saved".
6. Dacă ieși cu **Hide without confirming** (sau expiră temporizatorul), cardul afișează „Backup not confirmed" — nimic nu înregistrează faptul că ai notat fraza — și oferă **Reveal again and confirm**.

Oricine deține aceste 24 de cuvinte controlează portofelul. QoreChain nu le poate recupera sau reseta niciodată pentru tine, iar suportul nu ți le va cere niciodată.

## Adaugă QoreChain în portofelul tău {#add-network}

Panoul **Add QoreChain to your wallet** din pagina Wallet (pe mainnet se află în fila **Connect Wallets** și sub butoanele de conectare până când este conectat un portofel; pe testnet se află în partea de jos a paginii) afișează patru carduri alăturate — unul pentru fiecare mod de conectare — astfel încât poți adăuga QoreChain în propriul portofel dintr-un clic:

| Card | Ce îți oferă |
| --- | --- |
| **Native (Cosmos) wallets** | Endpoint-uri RPC și REST, plus chain ID, fiecare cu buton de copiere — pentru Keplr și alte portofele de pe traseul Native. |
| **EVM wallets** | Parametri de rețea EIP-3085 gata pregătiți — un singur clic adaugă QoreChain în MetaMask și în alte portofele EVM. |
| **SVM wallets** | URL-ul RPC pentru SVM, pentru portofele și instrumente compatibile SVM. |
| **Mobile wallets (WalletConnect)** | Un cod QR de asociere WalletConnect v2 pentru versiunile mobile ale portofelelor compatibile. |

Pentru a adăuga QoreChain:

1. Deschide pagina **Wallet** și găsește **Add QoreChain to your wallet**.
2. Alege cardul care corespunde traseului portofelului tău.
3. Selectează butonul de adăugare (**Add to Keplr** / **Add to Cosmostation**, **Add to MetaMask** sau alt portofel EVM, ori asocierea WalletConnect), sau copiază endpoint-urile și chain ID-ul în formularul de adăugare a rețelei din portofelul tău (cardul SVM oferă URL-ul RPC pentru SVM, de lipit într-o setare de RPC personalizat).
4. Aprobă noua rețea în portofelul tău.

Endpoint-urile publice sunt `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) și `svm.qore.host` (RPC SVM), cu variante `*-testnet` (de exemplu, `rpc-testnet.qore.host`) pentru testnet. Chain ID-uri: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Semnatari legați (Phantom) {#linked-signers}

Cardul **SVM wallets** îți permite și să legi o cheie Phantom la contul tău ca **semnatar legat** — un autentificator limitat în timp (30 de zile) și revocabil, nu o conexiune de portofel primară separată precum QoreX, Keplr sau MetaMask. Selectează **Connect Phantom**, apoi **Register authenticator**; portofelul tău existent semnează înregistrarea, iar Phantom nu devine niciodată propria sa identitate.

:::caution Înregistrarea semnatarilor legați este momentan dezactivată pe lanț
Funcțiile de cont inteligent și de portofele legate ale lanțului sunt implementate, dar dezactivate pe mainnet și activate pe testnet (`abstractaccount.enabled` este `false` pe mainnet; verifică `GET /qorechain/abstractaccount/v1/config`), iar lanțul mainnet refuză noile înregistrări de semnatari legați cât timp este așa. Pe mainnet, tratează deocamdată cardul ca pe o previzualizare și nu te aștepta ca o înregistrare să reușească.
:::

:::caution Un semnatar legat este autoritate reală asupra contului
Când funcția este activată, permisiunea pe care o acorzi decide pe ce cale poate acționa cheia, nu cât poate muta, iar o înregistrare rămâne valabilă 30 de zile. Leagă doar o cheie Phantom în care ai încredere la fel de mult ca în cont și revocă-o când nu mai ai nevoie de ea.
:::

Pentru modelul de permisiuni și limite de cheltuire on-chain, vezi [Semnatari legați și limite de cheltuire](/qorex/security-and-recovery#linked-signers) în documentația QoreX.

## Vezi și

- [Token Operations](/user-guide/token-operations) — conceptele din spatele transferurilor și denominărilor QOR.
- [Trade](/dashboard/trade) — schimbă tokenii (momentan tokeni de test).
