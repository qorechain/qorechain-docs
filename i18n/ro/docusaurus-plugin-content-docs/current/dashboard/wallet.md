---
slug: /dashboard/wallet
title: Portofel
sidebar_label: Portofel
sidebar_position: 3
---

# Portofel

Pagina **Wallet** este locul unde îți vezi soldul și istoricul tranzacțiilor, primești QOR și (pe mainnet) compui trimiteri și acțiuni de staking. Este pentru oricine deține QOR și vrea un singur loc în care să vadă un cont pe toate cele trei trasee. Modul în care funcționează depinde de rețea:

- **Mainnet este non-custodial.** Dashboard-ul nu deține chei de mainnet. Îți conectezi propriul portofel (**QoreX**, **Keplr** sau **MetaMask**), iar pagina citește soldul și istoricul real direct din blockchain. Trimiterile și staking-ul pe traseul Native sunt compuse pe pagină și semnate în **QoreX**, deoarece conturile QoreChain semnează cu o semnătură hibridă post-cuantică pe care o produce QoreX. Keplr se conectează pentru vizualizare și primire. MetaMask se conectează pe traseul EVM; trimiterea de acolo necesită o cheie post-cuantică înregistrată și o fereastră de autorizare EVM deschisă, din QoreX (vezi [Trimiterea cu MetaMask](#send-metamask)).
- **Testnet este custodial.** Dashboard-ul creează și deține portofele de test pentru contul tău, astfel încât poți trimite și primi QOR de test fără nicio instalare. Pentru portofelele de testnet nu există un ecran de staking.

## Inovații {#innovations}

- **Un singur cont, trei codificări.** Pagina derivă formele `qor1...`, `0x...` și SVM base58 ale aceluiași cont și citește soldul și istoricul o singură dată, prin `qor1...`. Rândurile din istoric poartă o insignă Native, EVM sau SVM.
- **Dashboard-ul nu semnează niciodată pe mainnet.** Pentru o trimitere, o delegare, o retragere din delegare sau o revendicare, îi transmite lui QoreX doar parametrii și rețeaua, niciodată o tranzacție pregătită. QoreX reconstruiește tranzacția, o afișează integral, o semnează cu semnătura hibridă ML-DSA-87 și o transmite în rețea. Dashboard-ul află doar hash-ul tranzacției.
- **Fixarea @handle-ului.** Adresa unui handle rezolvat este reținută în acest browser doar după ce o confirmi. Dacă handle-ul se rezolvă ulterior către o altă adresă, fluxul se oprește și afișează ambele adrese complete.
- **Verificarea comisionului înainte de staking.** Pagina citește din blockchain QOR-ul cheltuibil (fără vesting) și starea cheii ML-DSA-87 a contului, și păstrează Submit dezactivat dacă comisionul nu poate fi plătit.
- **Avertismentul pentru adresa de test este exact unde copiezi.** „Test address, never send real QOR here." apare lângă adresă, în My Wallets și pe Receive, deoarece adresele de testnet și de mainnet arată identic.
- **Exportul frazei de recuperare, cu verificare.** Pe testnet, dezvăluirea unei fraze necesită o autentificare proaspătă, cele 24 de cuvinte sunt afișate timp de 60 de secunde, iar copia de rezervă este considerată confirmată abia după ce tastezi cuvintele 3, 5 și 9.

## Cum se utilizează {#how-to-use}

### Un singur cont, trei codificări {#one-account-three-encodings}

Un cont QoreChain este o identitate unică scrisă în trei moduri, câte unul pentru fiecare traseu de execuție:

| Traseu | Codificare | Arată astfel |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | de exemplu, `5Gv7...` |

Toate cele trei indică spre **același cont și același sold**. Fondurile primite pe orice traseu ajung într-un singur sold, iar Dashboard-ul indexează soldul și istoricul prin codificarea `qor1`, astfel încât activitatea de pe fiecare traseu apare împreună.

### Utilizează Portofelul pe mainnet {#mainnet}

Condiții prealabile: ești autentificat, antetul este pe **Mainnet**, [confirmarea unică](/dashboard/overview#risk-acknowledgement) este acceptată, iar pentru trimitere sau staking ai aplicația sau extensia QoreX.

1. Deschide **Wallet**. Dacă nu este conectat încă niciun portofel, un card „Connect your wallet" afișează cardul **QoreX wallet** cu **Connect with QoreX** și, sub el, la „or connect another wallet", **Connect Keplr** și **Connect MetaMask**.
2. Conectează un portofel (pașii de mai jos). Phantom nu poate fi conectat aici; vezi [Semnatari legați](#linked-signers).
3. Pagina îți încarcă soldul real și istoricul tranzacțiilor din blockchain.

Odată conectat, pagina are șase file: **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** și **Connect Wallets**.

- **Wallet:** un rând **Viewing** de chip-uri de portofel (doar când este atașat mai mult de un portofel), **Total Balance**, **Receive** și **Assets & Activity** cu ultimele 10 tranzacții.
- **Send from QoreX, Stake / Delegate, Rewards:** acestea funcționează prin QoreX chiar dacă este conectat și Keplr sau MetaMask. Pașii de staking se găsesc la [Staking și validatori](/dashboard/staking-and-validators).
- **Details:** adresele tale Native, EVM și SVM, plus **Linked addresses** (redenumește, marchează ca implicită, controlabilă în QoreX sau doar de urmărit).
- **Connect Wallets:** portofelele conectate (dă clic pe unul pentru a-l vedea, pe X pentru a-l detașa), conturile QoreX nelegate cu **Link this account**, **+ QoreX**, **+ Keplr**, **+ MetaMask** și panoul [Adaugă QoreChain în portofelul tău](#add-network).

Dacă portofelul tău nu are încă QoreChain configurat, adaugă-l mai întâi, vezi [Adaugă QoreChain în portofelul tău](#add-network).

#### Conectează-te cu QoreX, extensie de browser {#connect-qorex-extension}

1. În pagina Portofel, găsește cardul **QoreX wallet** și selectează **Connect with QoreX**.
2. Deoarece extensia QoreX este detectată, Dashboard-ul te întreabă cum vrei să te conectezi. Selectează **Browser extension**.
3. Extensia deschide un popup de aprobare care arată `dashboard.qorechain.io` ca site solicitant.
4. Aprobă-l. Aceasta semnează o dovadă unică că deții adresa ta `qor1...`; nu se mută niciun fond și nu este acordată nicio altă permisiune.
5. Popup-ul se închide, iar Dashboard-ul afișează **Connected: qor1...**. Alegerea este reținută, astfel încât următoarea conectare din acest browser o refolosește fără să mai întrebe. Un link **Use a different method** apare doar cât timp o asociere este în așteptare.

Poți lega mai mult de o adresă QoreX la același cont Dashboard (de exemplu una dintr-o extensie Firefox și una din Chrome, sau un telefon și un laptop). Selectează **Add another wallet** pentru a repeta fluxul; fiecărei adrese legate i se poate da o etichetă, iar una este marcată drept implicită pentru trimitere, ambele din fila **Connect Wallets**.

**Comutarea între portofele în fila Wallet.** Cu mai mult de un portofel atașat, rândul **Viewing** de chip-uri îți permite să schimbi al cărui sold și istoric îl vezi fără să părăsești fila. Rândul este ascuns când este atașat un singur portofel.

**Conturi din extensia ta QoreX care nu sunt încă legate.** O singură frază de recuperare poate deriva mai multe conturi, iar crearea unuia în QoreX nu anunță Dashboard-ul. Când extensia își poate lista conturile, filele **Wallet**, **Details** și **Connect Wallets** afișează un card de tipul „2 accounts in your QoreX extension are not linked here", cu soldul fiecărui cont (și cât din el este în staking, ceea ce nu poate fi trimis). Selectează **Link this account** pentru a-l asocia; legarea nu acordă niciun control asupra cheilor tale. Dacă versiunea ta de QoreX nu poate alege ce cont să dovedească, de aici poate fi legat doar contul activ.

#### Conectează-te cu QoreX, aplicația mobilă {#connect-qorex-app}

1. În pagina Portofel, selectează **Connect with QoreX** pe cardul **QoreX wallet**.
2. Dacă apare selectorul, alege **QoreX app** (dacă nu este detectată nicio extensie, Dashboard-ul trece direct la acest flux).
3. Dashboard-ul afișează un cod QR și **Open QoreX**, și verifică periodic aprobarea („Waiting for approval in QoreX...").
4. Pe telefonul tău, scanează codul QR în QoreX sau atinge **Open QoreX** dacă navighezi de pe același telefon (aplicația se deschide prin link-ul său `qorex://connect`).
5. QoreX afișează cererea de asociere împreună cu originea Dashboard-ului. Aprobă cu Face ID, Touch ID sau PIN.
6. În câteva secunde, Dashboard-ul afișează **Connected: qor1...**.

#### Conectează-te cu Keplr {#connect-keplr}

Keplr se conectează pentru a-ți vizualiza soldul și istoricul pe traseul Native și pentru a primi fonduri. Trimiterea și staking-ul folosesc QoreX.

1. În pagina Portofel, selectează **Connect Keplr**.
2. Dacă QoreChain nu este configurat în Keplr, Dashboard-ul declanșează promptul `suggestChain` al Keplr. Verifică chain ID-ul și endpoint-urile și selectează **Approve**.
3. Alege contul și aprobă conexiunea.
4. Dashboard-ul citește adresa ta `qor1...` și îți încarcă soldul și istoricul.

Phantom nu poate fi conectat ca portofel în pagina Portofel de pe mainnet. Adresele Phantom legate anterior apar în continuare în **Connected wallets**; pentru legarea unei chei Phantom ca semnatar, vezi [Semnatari legați (Phantom)](#linked-signers).

#### Conectează-te cu MetaMask {#connect-metamask}

1. În pagina Portofel, selectează **Connect MetaMask**.
2. Dacă rețeaua EVM QoreChain nu este încă adăugată, MetaMask afișează promptul său **Add network** (EIP-3085) cu chain ID-ul, URL-ul RPC și simbolul completate. Selectează **Approve**, apoi **Switch network**.
3. Selectează contul și **Connect**.
4. Dashboard-ul citește adresa ta `0x...` și îți încarcă soldul și istoricul.

### Trimite pe mainnet {#send-mainnet}

Fiecare trimitere este compusă pe Dashboard, dar finalizată în propriul tău portofel. Pe **traseul Native**, acel portofel este întotdeauna **QoreX**. Pe **traseul EVM**, MetaMask semnează, cu condiția ca contul să aibă deja o cheie post-cuantică și o fereastră EVM deschisă (vezi [Trimiterea cu MetaMask](#send-metamask)).

:::caution Fonduri reale, transferuri ireversibile
Tranzacțiile de pe mainnet sunt ireversibile. Verifică încă o dată destinatarul înainte de a aproba.
:::

:::note Solduri în vesting
Dacă o parte din soldul tău este încă în vesting, aceasta contează pentru ceea ce poți delega, dar nu poate plăti o taxă de tranzacție. Pentru asta ai nevoie de QOR cheltuibil separat, inclusiv pentru a înregistra o cheie post-cuantică. Un portofel alimentat doar cu suma sa în vesting poate delega, dar nu poate trimite.
:::

#### Trimite cu QoreX, pas cu pas

1. În cardul **Send from QoreX**, alege opțional **Send from** (când ai legat mai mult de un portofel QoreX), apoi introdu destinatarul (o adresă `qor1...` sau un `@handle`), **Amount (QOR)** și, opțional, un **Memo**.
2. Selectează **Continue in QoreX**.
3. Aprobă, fie:
   - **Extensie de browser:** selectează **Approve in browser extension**. Popup-ul extensiei afișează transferul decodat complet (destinatar și sumă). Aprobă cu propria deblocare a extensiei. Extensia semnează cu semnătura hibridă post-cuantică și transmite direct în blockchain.
   - **Aplicația mobilă:** scanează codul QR cu QoreX sau selectează **Open in QoreX** (o cerere `qorex://tx`) pe același telefon. QoreX decodează cererea, afișează destinatarul și suma, iar tu aprobi cu biometria. QoreX semnează și transmite.
4. Pagina afișează „Transfer confirmed" cu hash-ul tranzacției (deschide-l în [Explorer](/dashboard/explorer)), apoi **New transfer**. Pe calea aplicației, Dashboard-ul verifică periodic rezultatul.

**Exemplu minimal:** Connect with QoreX (aplicația, scanează codul QR), apoi Send from QoreX cu un destinatar `qor1...` și suma 1, selectează **Continue in QoreX** și aprobă în QoreX.

#### Trimiterea către un @handle

Câmpul destinatar acceptă și un `@handle`. Ce se întâmplă în continuare depinde de dacă ai mai plătit acel handle din acest browser înainte:

- **Prima dată:** adresa rezolvată este afișată complet cu „First time sending to @handle from this browser. Check the address before you continue:", iar tu trebuie să o confirmi înainte ca aceasta să fie folosită. Adresa este fixată abia după ce ai confirmat.
- **Aceeași adresă ca înainte:** trece cu o confirmare ușoară.
- **O adresă diferită față de înainte:** fluxul se oprește. Atât adresa anterioară, cât și cea nouă sunt afișate complet, cu un avertisment explicit că adresa s-a schimbat și un buton stilizat ca secundar pentru a continua oricum.

Fixarea există doar în browserul tău, deci un alt calculator sau un browser golit de date arată din nou „prima dată". Handle-urile au între 3 și 20 de caractere (`a-z`, `0-9`, `_`) și aparțin unei singure adrese. Dacă căutarea handle-urilor este temporar indisponibilă, câmpul spune acest lucru și poți totuși trimite către o adresă `qor1...`.

#### Trimite cu MetaMask {#send-metamask}

:::caution Începând cu v3.2.0 al lanțului, MetaMask singur nu poate trimite pe mainnet
Traseul EVM admite o tranzacție doar de la un cont care deține o cheie post-cuantică înregistrată și are o **fereastră de autorizare EVM deschisă**: o permisiune limitată ca timp, număr și valoare, deschisă cu un mesaj care poartă o semnătură hibridă ML-DSA-87 (FIPS 204). MetaMask nu poate produce acel mesaj. Fără o fereastră, lanțul refuză tranzacția (erori tipice: fără fereastră, fereastră epuizată, fără cheie post-cuantică).
:::

1. În **QoreX**, înregistrează cheia post-cuantică a contului dacă nu are una (primul tău transfer QoreX de pe acel cont o face), apoi deschide o fereastră de autorizare EVM, vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window). Aceasta este pentru **contul în stil Ethereum (coin 60)** care împarte cheia cu MetaMask: adaugă-l în QoreX cu **Add an Ethereum account (coin 60)**, folosind aceeași frază de recuperare ([cum](/qorex/getting-started#restore-dashboard)). Nicio cheie MetaMask nu poate trimite de pe un cont obișnuit coin-118 `qor1...`.
2. O fereastră este limitată de blocuri (cel mult 17,280, aproximativ 15 ore pe mainnet), de numărul de tranzacții (cel mult 1,000) și de un plafon de cheltuire în QOR care numără fiecare sumă **plus** comisionul său maxim. Păstrează limitele mici: cât timp o fereastră este deschisă, tranzacțiile MetaMask mută QOR fără o semnătură post-cuantică. Deschiderea unei ferestre noi o înlocuiește pe cea anterioară și avansează nonce-ul contului, așa că deschide-o **înainte** de a trimite din MetaMask (o tranzacție pregătită mai devreme eșuează cu „nonce too low"). Începând cu v3.2.3, lanțul acceptă și ferestre mai înguste, cu domeniu restrâns; QoreX nu oferă încă un ecran pentru ele.
3. Deschide MetaMask și confirmă că este setat pe rețeaua EVM QoreChain.
4. Selectează **Send** în interiorul MetaMask, introdu adresa `0x...` a destinatarului și suma, verifică taxa de gas și confirmă.
5. Înapoi în Dashboard, tranzacția apare în istoricul tău de îndată ce este pe blockchain (dă refresh dacă este nevoie).

Fiecare tranzacție consumă o parte din fereastră; când se atinge limita de timp, de număr de tranzacții sau de valoare, deschide una nouă în QoreX și închide fereastra când ai terminat.

### Primește {#receive-mainnet}

1. Selectează **Receive**.
2. Alege un traseu cu selectorul: **Native QOR**, **EVM** sau **SVM**.
3. Fereastra modală îți afișează adresa în acea codificare, cu un cod QR și un buton de copiere.
4. Doar pe traseul Native, **Payment Request Options** (sumă, memo) construiesc un link `qorechain:` pe care îl poți copia.

Indiferent ce traseu folosește expeditorul, fondurile ajung în același cont.

### Consultă istoricul tranzacțiilor {#history}

Pe mainnet, lista **Assets & Activity** afișează **ultimele 10** tranzacții. Fiecare rând are:

- o **insignă de traseu** (Native, EVM sau SVM);
- **Sent** sau **Received** pentru transferurile obișnuite și o etichetă descriptivă pentru alte activități (de exemplu *PQC key registration* sau o acțiune de contract);
- suma, ora, o stare **Confirmed** sau **Failed** și un hash pe care îl poți deschide în [Explorer](/dashboard/explorer). Pentru activitate mai veche, deschide adresa ta în Explorer.

### Utilizează Portofelul pe testnet {#testnet}

Pe testnet (`qorechain-diana`), Dashboard-ul gestionează portofelele de test pentru tine. Testnet-ul nu are conectare QoreX și nici ecran de staking.

**Prima vizită:** creează un portofel sau importă o frază de 24 de cuvinte.

**Cardul principal:** eticheta portofelului, adresa cu un buton de copiere, **Total Balance**, **Send**, **Receive** și **My Wallets**, un indicator al ultimei actualizări cu reîmprospătare și **Assets & Activity** cu o filă **Transaction history** și o filă **Tokens**.

Fila **Tokens** listează doar tokenii emiși prin deploy-uri din Dashboard. Tokenii de test din fest din [Faucet](/dashboard/faucet#fest-tokens) nu apar niciodată acolo; verifică-i cu o interogare a soldului bank sau în [Explorer](/dashboard/explorer).

:::caution Adresele de testnet arată exact ca adresele de mainnet
Testnet-ul și mainnet-ul folosesc același format `qor1...`, astfel încât o adresă de testnet poate fi lipită într-un formular de retragere sau în alt portofel fără niciun avertisment, iar QOR real trimis către ea ajunge pe **mainnet**, la acea adresă, unde această pagină de testnet nu îl poate afișa. Nu trimite niciodată QOR real către o adresă de testnet. Dashboard-ul repetă avertismentul lângă adresă în pagina Portofel, în **My Wallets** și pe **Receive**. Dacă ai trimis deja QOR real către o adresă de testnet, contactează suportul și nu încerca să-l muți singur.
:::

#### Trimite QOR (testnet)

1. Selectează **Send**.
2. Alege un **Asset** (QOR sau un token emis prin Dashboard).
3. Introdu **Recipient Address** (contactele salvate și adresele recente sunt sugerate pe măsură ce tastezi) și **Amount** (sau **MAX**), plus un **Memo** opțional.
4. Selectează **Review Transaction**, verifică detaliile și taxa estimată, apoi **Confirm & Send**.
5. Primești o confirmare cu hash-ul, iar „Save this address?" îți este oferit pentru a păstra destinatarul ca contact.

**Exemplu minimal:** comută pe Testnet, creează un portofel, revendică din [Faucet](/dashboard/faucet), apoi trimite 1 QOR către o altă adresă.

#### Primește QOR (testnet)

1. Selectează **Receive**.
2. Partajează adresa sau codul QR, sau copiază adresa.
3. Opțional, completează **Payment Request Options** (sumă, memo) pentru a genera un link de plată; folosește **Copy Link** sau **Save Image**.

#### Gestionează-ți portofelele de test

**My Wallets** deschide lista ta de adrese: comută între portofele, creează, importă sau elimină unul. Portofelul activ este cel folosit pentru acțiunile semnate pe testnet în întregul Dashboard.

#### Fă o copie de rezervă sau exportă fraza de recuperare a unui portofel de test {#reveal-recovery-phrase}

Pe testnet, Dashboard-ul îți gestionează portofelele, dar poți exporta fraza de recuperare de 24 de cuvinte a unui portofel pentru a o importa într-un portofel self-custody precum QoreX.

1. În pagina **Wallet** de testnet, găsește cardul **Recovery phrase**. Acesta listează portofelele tale gestionate de Dashboard, cu soldul lor de **mainnet** (portofelele alimentate primele), astfel încât să poți alege portofelul care deține tokenii tăi.
2. Selectează **Reveal**, citește avertismentul („Reveal the phrase for ...?") și selectează **Continue**.
3. Autentifică-te din nou când ți se cere (este necesară o nouă verificare a parolei; Dashboard-ul nu îți vede niciodată parola). Revii automat la portofel.
4. Cele 24 de cuvinte sunt afișate timp de 60 de secunde, cu un buton **Copy phrase**. Notează-le și păstrează-le offline. Numărătoarea inversă se oprește cât timp bifezi caseta de confirmare sau tastezi în câmpurile de verificare.
5. Bifează **I have written down my recovery phrase and stored it somewhere safe**, tastează cuvintele **3**, **5** și **9** (marcate *Required*) și selectează **Confirm backup**. Vezi „Recovery phrase saved".
6. Dacă ieși cu **Hide without confirming** (sau expiră temporizatorul), cardul afișează „Backup not confirmed" și oferă **Reveal again and confirm**.

Oricine deține aceste 24 de cuvinte controlează portofelul. QoreChain nu le poate recupera sau reseta niciodată pentru tine, iar suportul nu ți le va cere niciodată.

### Adaugă QoreChain în portofelul tău {#add-network}

Panoul **Add QoreChain to your wallet** (pe mainnet se află în fila **Connect Wallets** și sub butoanele de conectare până când este conectat un portofel; pe testnet, în partea de jos a paginii) are patru carduri:

| Card | Ce îți oferă | Butoane |
| --- | --- | --- |
| **Native (Cosmos) wallets** | Endpoint-uri RPC și REST și chain ID-ul, fiecare cu buton de copiere. | **Add to Keplr**, **Add to Cosmostation** (eticheta urmează portofelul detectat) |
| **EVM wallets** | Parametri de rețea EIP-3085. | **Add to EVM wallet** (sau **Add to MetaMask / Rabby**, în funcție de portofelele detectate) |
| **SVM wallets** | URL-ul RPC pentru SVM, pentru setările de RPC personalizat. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | O asociere WalletConnect v2. | **Create pairing QR** |

1. Găsește panoul și alege cardul care corespunde traseului portofelului tău.
2. Selectează butonul de adăugare sau copiază endpoint-urile și chain ID-ul în formularul de adăugare a rețelei din portofelul tău.
3. Aprobă noua rețea în portofelul tău.

Endpoint-urile publice sunt `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (EVM JSON-RPC) și `svm.qore.host` (RPC SVM), cu variante `*-testnet` (de exemplu, `rpc-testnet.qore.host`). Chain ID-uri: mainnet `qorechain-vladi` (EVM chain ID `9801`), testnet `qorechain-diana` (EVM chain ID `9800`).

### Semnatari legați (Phantom) {#linked-signers}

Cardul **SVM wallets** îți permite și să legi o cheie Phantom la contul tău ca **semnatar legat**: un autentificator limitat în timp (30 de zile) și revocabil, nu un portofel primar separat. Selectează **Connect Phantom**, apoi **Register authenticator**. Înregistrarea trebuie semnată de **Keplr** (Dashboard-ul are nevoie ca Keplr să fie conectat pentru asta), iar Phantom nu devine niciodată propria sa identitate.

:::caution Disponibilitatea înregistrării diferă în funcție de rețea
Funcțiile de cont inteligent și de portofele legate ale lanțului sunt activate pe testnet și dezactivate pe mainnet (`GET /qorechain/abstractaccount/v1/config` returnează `enabled: true` pe testnet și `enabled: false` pe mainnet, verificat la 27 octombrie 2026). Pe mainnet, lanțul refuză noile înregistrări de semnatari legați; tratează acolo cardul ca pe o previzualizare.
:::

:::caution Un semnatar legat este autoritate reală asupra contului
Permisiunea pe care o acorzi decide pe ce cale poate acționa cheia, nu cât poate muta, iar o înregistrare rămâne valabilă 30 de zile. Leagă doar o cheie în care ai încredere la fel de mult ca în cont și revocă-o când nu mai ai nevoie de ea.
:::

Pentru modelul de permisiuni și limite de cheltuire, vezi [Semnatari legați și limite de cheltuire](/qorex/security-and-recovery#linked-signers) în documentația QoreX.

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Autentificarea este necesară: dacă nu ești autentificat, pagina te redirecționează la autentificare.
- **Rețea:** comutatorul din antet decide ce vizualizare primești (mainnet non-custodial, testnet custodial). Pe mainnet, acceptă mai întâi confirmarea unică.
- **Portofele:** nu este nevoie de niciunul pe testnet. Pe mainnet folosește QoreX (aplicația sau extensia) pentru trimitere și staking; Keplr sau MetaMask pentru vizualizare și primire.
- **Costuri:** niciunul din partea Dashboard-ului. Tranzacțiile on-chain plătesc taxa de rețea (minim 0.1 uqor per gas).
- **Fonduri:** QOR de testnet din [Faucet](/dashboard/faucet). QOR-ul de mainnet trebuie să fie deja în contul tău.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele | Note |
| --- | --- | --- | --- |
| Pagina Wallet | `dashboard.qorechain.io/wallet` | Mainnet (non-custodial) și testnet (custodial) | Autentificare necesară |
| Conectare și trimitere QoreX | Aplicația și extensia QoreX (vezi [QoreX](/qorex/overview)) | Doar mainnet | Fluxurile QoreX ale Dashboard-ului sunt fixate pe mainnet |
| Panoul de adăugare a rețelei | În pagina Wallet | Ambele | Și în prezentarea generală a [Explorer](/dashboard/explorer) |

## Limite și probleme cunoscute {#limits}

- **Testnet-ul nu are interfață de staking și nici conectare QoreX.** Staking-ul și fila Rewards există doar pe mainnet.
- **Istoricul de pe mainnet este format din ultimele 10 tranzacții.** Deschide adresa în Explorer pentru mai multe.
- **Keplr și MetaMask:** Keplr poate vizualiza și primi; MetaMask poate vizualiza și primi și trimite din interiorul MetaMask odată ce o fereastră EVM este deschisă. Niciunul nu trimite și nu face staking pe traseul Native din Dashboard.
- **Phantom** nu poate fi conectat; adresele Phantom legate anterior sunt în continuare listate.
- **Înregistrarea semnatarilor legați** funcționează pe testnet și este dezactivată pe mainnet; are nevoie ca Keplr să semneze.
- **Nu există în Dashboard:** redelegarea (fă-o în QoreX), un ecran de staking cu blocare în timp și o listă de tokeni pe mainnet.
- **Fila Tokens de pe testnet** afișează doar tokenii emiși prin Dashboard, nu și tokenii din fest.

## Vezi și

- [Token Operations](/user-guide/token-operations) - conceptele din spatele transferurilor și denominărilor QOR.
- [Staking și validatori](/dashboard/staking-and-validators) - delegă, retrage din delegare și revendică din pagina Wallet.
- [Trade](/dashboard/trade) - ecranul de swap pentru tokeni de test.
