---
slug: /qorex/security-and-recovery
title: Securitate și recuperare
sidebar_label: Securitate și recuperare
sidebar_position: 5
---

# Securitate și recuperare

Această pagină explică modul în care QoreX îți protejează cheile și cum îți recuperezi un portofel: verificarea protecției pe un singur ecran, cheia ML-DSA-87 și îngrijirea ei, conturile multisig, recuperarea socială, Legacy, conectarea dispozitivelor, fereastra de acces EVM, ce arată aprobările, blocarea automată, Q-Day Scanner și unde găsești ajutor. Este pentru orice utilizator QoreX; majoritatea instrumentelor de recuperare se află în aplicația mobilă, iar textul spune unde ceva diferă în extensia de browser sau Safari.

## Inovații {#innovations}

- **Protecția banilor mei.** Un singur ecran care verifică, în timp real, backupul, site-urile conectate, permisiunile pe care le-ai dat on-chain și aprobările de tokeni și îți permite să le revoci. Vezi [Protecția banilor mei](#protection).
- **Îngrijirea cheii post-cuantice.** Rotește cheia ML-DSA-87 din fraza de recuperare, repară o înregistrare care nu mai poate semna și operează un multisig post-cuantic. Vezi [Rotește cheia](#pqc-rotation), [Repară](#pqc-repair) și [Conturi multisig](#multisig).
- **Recuperare socială cu fragmente criptate și un kit de recovery.** Gardienii dețin fragmente sigilate cu ML-KEM, împărțite 2 din 3, și au nevoie de kitul tău de recovery ca să restaureze portofelul. O recuperare rulează un timelock de 48 de ore și te alertează; poți anula, iar o anulare poate doar să amâne, niciodată să mute fonduri.
- **Legacy.** Un dead-man's switch peste gardienii tăi, pentru un beneficiar pe care îl alegi.
- **Conectarea dispozitivelor.** Un cod unic și un QR, niciodată pe același ecran. QR-ul singur este text cifrat protejat printr-o derivare a cheii dificilă din punct de vedere al memoriei.
- **Cheie ML-DSA-87 deterministă.** Derivată din fraza ta de recuperare (prima cheie este `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, iar cheile rotite sunt derivate din aceeași frază), deci cheia nu are nevoie de un backup separat. Vezi [QoreSign](/qoresign/overview).
- **Acces EVM delimitat.** O tranzacție EVM este admisă doar cât timp o fereastră de acces este deschisă, limitată după numărul de tranzacții, valoare și expirare, iar o fereastră pe care o deschizi tu admite doar transferuri de QOR dacă nu alegi altceva.
- **Aprobări care refuză ceea ce nu pot citi.** Vezi [Ce arată fereastra de aprobare](#approvals).
- **Q-Day Scanner.** Un raport de expunere pentru orice adresă Bitcoin sau Ethereum.

## Cum se folosește și unde se găsește {#how-to-use}

Cele mai multe dintre cele de mai jos se află în **Setări → Securitate** în aplicația mobilă; **Protecția banilor mei** și **Asistență** sunt în **Setări**. În extensiile de browser și Safari, ecranul principal al popupului are butoane pentru fereastra de acces EVM, Site-uri conectate, Reveal recovery phrase, Rotește cheia post-cuantică, Conturi multisig, Protecția banilor mei și Asistență, plus setarea de blocare automată. Recuperarea socială, Legacy, conectarea dispozitivelor și Q-Day Scanner sunt doar pe mobil. QoreX este gratuit și nu are nevoie de niciun cont pentru nimic din acestea; vezi [prezentarea generală](/qorex/overview#how-to-access) pentru linkurile către magazine.

Tab-ul Home afișează și un card **Backup health**, care continuă să avertizeze până când configurezi recuperarea socială. Cardul urmărește doar recuperarea socială: nu poate ști dacă ți-ai notat fraza de recuperare, așa că fă asta singur (vezi mai jos).

## Protecția banilor mei {#protection}

Un singur ecran care răspunde la întrebarea "sunt banii mei în siguranță și cine poate acționa în numele meu?". Aplicație: **Setări → Protecția banilor mei**. Extensie și Safari: **Protecția banilor mei** pe ecranul principal al popupului. Fiecare rând este verificat când îl deschizi, pe acest dispozitiv și în rețea; nimic nu este presupus. Când ceva nu poate fi citit, QoreX spune *"Nu a putut fi citit acum. Asta nu înseamnă că nu există."*

| Rând | Ce verifică | Ce poți face |
|---|---|---|
| **Copia de siguranță verificată** și **Recuperarea testată** | dacă ai dovedit că deții fraza de recuperare și când | **Testează fraza de recuperare**: scrie trei cuvinte din frază. Este o probă: sunt comparate pe acest dispozitiv, nimic din ce scrii nu este păstrat sau trimis și nu se restaurează și nu se schimbă nimic. Cuvintele greșite nu înregistrează nimic |
| **Gardieni (recuperare socială)** | dacă sunt configurați gardieni, câți și câți sunt necesari | îi configurezi în [Recuperare socială](#social-recovery) |
| **Aplicații cu permisiuni** | site-urile care îți pot vedea adresa și îți pot cere să semnezi (în aplicație, site-urile din browserul dApp integrat; în extensie, site-urile conectate) | **Revocă** orice site |
| **Permisiuni acordate în rețea** | **granturile authz** și **granturile de comisioane** permanente pe care contul tău le-a dat altora, citite din lanț, cele nelimitate primele, cu datele de expirare | **Revocă**: QoreX arată o verificare cu comisionul de rețea, apoi semnează eliminarea cu semnătura ta hibridă |
| **Aprobări de tokeni ERC-20** | cei autorizați să îți mute tokenii pe **EVM-ul QoreChain** | **Revocă**, care trimite `approve(spender, 0)` |

**Despre aprobările de tokeni.** În aplicație, atinge **Verifică aprobările de tokeni**; citirea lor folosește adresa Ethereum a acestui portofel, ceea ce are nevoie o singură dată de fraza ta. Sunt citite în intervale pe care nodul le acceptă, așa că ecranul poate spune *"Aprobările de tokeni sunt verificate până la blocul \{from\}. Pot exista unele mai vechi: deschide din nou ecranul ca să continue verificarea."* Pentru revocare, QoreX deschide mai întâi o **fereastră EVM pentru o singură tranzacție**, semnată cu cheia ta post-cuantică și limitată la contractul tokenului, apoi trimite tranzacția EVM, care este semnată cu cheia ta clasică. Doar un cont în stil Ethereum (coin 60) poate trimite pe EVM-ul QoreChain, așa că un cont coin-118 nu poate revoca aici o aprobare EVM, iar QoreX spune acest lucru.

**Protecția post-cuantică, pe fiecare canal.** Ecranul explică simplu ce semnături protejează ce:

- **QoreChain (nativ):** fiecare tranzacție poartă două semnături, una post-cuantică (ML-DSA-87) și una clasică, iar rețeaua le verifică pe amândouă.
- **QoreChain EVM:** tranzacțiile EVM sunt semnate clasic, ca în orice portofel EVM. Rețeaua le admite doar în interiorul unei [ferestre](#evm-window) pe care ai deschis-o cu semnătura ta post-cuantică, în limitele pe care le-ai ales.
- **Alte rețele (Ethereum, Solana, Cosmos):** acceptă doar semnături clasice. QoreX nu poate adăuga protecție post-cuantică acolo.

## Fă backup acum - nimeni nu îți poate recupera un portofel pierdut {#back-up-now}

:::danger Citește asta înainte să alimentezi portofelul
QoreX este **non-custodial**: cheile tale există doar pe propriul dispozitiv, iar QoreChain Association nu deține nicio copie a lor, nicio cheie master și nicio modalitate de a reseta sau restaura portofelul tău. **Nu există un flux „am uitat parola", niciun tichet de suport și nicio intervenție din partea serviciului clienți** - dacă pierzi accesul la chei fără să ai un backup pregătit, fondurile sunt pierdute, permanent și ireversibil. Acest lucru este valabil pentru orice portofel non-custodial, nu e o limitare specifică QoreX, dar merită spus clar.

**Fă cel puțin unul dintre următoarele - imediat după ce îți creezi portofelul, nu mai târziu:**

1. **Notează-ți fraza de recuperare din 24 de cuvinte** și păstreaz-o undeva offline și durabil (nu o captură de ecran, nu o notiță sincronizată în cloud, nu un mesaj trimis ție însuți). Este singurul lucru care îți poate restaura portofelul pe orice dispozitiv, oricând - pe mobil, o afișezi din **Settings → Security → Reveal recovery phrase** (aplicația **nu** o arată în timp ce creează portofelul, deci trebuie să te duci tu să o iei - fă asta imediat); în extensie, este afișată o singură dată când creezi portofelul, iar oricând după aceea din **Reveal recovery phrase** în popup. Vezi [Restaurează un portofel existent](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configurează [recuperarea socială](#social-recovery)** cu gardieni în care ai încredere. Astfel îți poți recupera portofelul chiar dacă pierzi fraza, fără ca vreun gardian, singur, să poată accesa vreodată fondurile tale.

Cel mai sigur este să faci ambele - fraza te acoperă dacă schimbi dispozitivul sau aplicația este indisponibilă; gardienii te acoperă dacă pierzi chiar fraza.

**Dezinstalarea aplicației îți șterge cheile de pe acel dispozitiv.** Seiful aplicației mobile și seiful extensiei de browser există fiecare doar pe dispozitivul care l-a creat. Dezinstalarea aplicației, resetarea telefonului sau eliminarea/ștergerea extensiei șterge acea copie - fără backup și fără un dispozitiv conectat, portofelul tău nu mai poate fi recuperat de nimeni, inclusiv de QoreChain. **Eliminarea unui portofel de pe un telefon sau dintr-un browser** (Settings → Wallets → *Remove from this phone*, sau *Remove from this browser* în extensie) șterge în același mod cheia acelui portofel de pe dispozitiv - fondurile rămân pe lanț, dar doar fraza sa de recuperare îl poate readuce.
:::

## Cheia ML-DSA-87 {#pqc-key}

Ecranul Security afișează starea live, on-chain, a cheii tale ML-DSA-87: **„Se înregistrează la primul transfer"** → **„Înregistrată on-chain ✓"**. Algoritmul este **ML-DSA-87** (determinist, hibrid cu secp256k1).

Site-urile web nu pot cere QoreX să îți înregistreze, să îți migreze sau să îți rotească cheia ML-DSA-87. Înregistrarea se face de la sine la primul tău transfer și nu necesită nimic din partea ta - începând cu v3.2.3, lanțul acceptă și o *dovadă de posesie* opțională la înregistrare, pe care QoreX o gestionează invizibil în versiunile curente din magazine. Poți, de asemenea, să [rotești cheia](#pqc-rotation) chiar tu sau să [repari](#pqc-repair) o înregistrare care nu mai poate semna. Vezi [Rotația cheii](/developer-guide/post-quantum-signing#key-rotation) pentru mecanismul care stă la bază.

### Repară o cheie care nu mai poate semna {#pqc-repair}

În cazuri rare, înregistrarea de cheie pe care rețeaua o ține pentru contul tău este **goală, doar clasică sau degenerată**, așa că din cont nu se poate trimite nimic. QoreX deosebește cele două cazuri: o cheie înregistrată de **alt portofel** este raportată ca atare, în timp ce o înregistrare care **nu mai poate semna** primește un card de reparare pe ecranul **Acasă** (aplicație) sau pe ecranul principal al popupului (extensie și Safari).

1. Citește cardul: *"Cheia post-cuantică a acestui cont din rețea nu mai poate semna, așa că din el nu se poate trimite nimic. Înregistrarea din nou a cheii rezolvă problema."* Arată comisionul de rețea, **0,09 QOR**, și spune că, dacă contul are o fereastră EVM, rețeaua o închide (deschide una nouă după aceea).
2. Atinge **Înregistrează din nou cheia**.
3. Atinge din nou (*Apasă din nou ca să înregistrezi (taxă 0,09 QOR)*). În aplicație, confirmă cu biometria.

Repararea **nu este niciodată automată**: sunt necesare întotdeauna două apăsări. Trimite doar înregistrarea cheii, semnată cu cheia ta clasică. După aceea QoreX spune *"Cheia este înregistrată din nou. Din acest cont se poate trimite din nou."*

### Rotește cheia post-cuantică {#pqc-rotation}

**Rotește cheia post-cuantică** înlocuiește cheia ML-DSA-87 a contului din rețea cu **următoarea cheie derivată din fraza ta de recuperare**. Aplicație: **Setări → Securitate → Rotește cheia post-cuantică**. Extensie și Safari: butonul **Rotește cheia post-cuantică** de pe ecranul principal al popupului. Atinge, apoi atinge din nou pentru a confirma (*Apasă din nou ca să rotești cheia*); aplicația cere și biometria. Tranzacția este semnată atât de cheia curentă, cât și de cea nouă, iar comisionul de rețea, luat dintr-o simulare, este arătat în rezultat.

- **Protejează împotriva** unei chei post-cuantice scurse.
- **Nu protejează împotriva** unei fraze de recuperare scurse. Cine are fraza ta poate deriva fiecare dintre aceste chei. În acest caz, mută-ți fondurile într-un portofel nou cu o frază nouă.
- **Alte portofele care folosesc aceeași frază** nu pot semna pentru acest cont până când nu acceptă chei rotite.
- **Rețeaua închide fereastra EVM a contului.** Deschide una nouă dacă ai nevoie.
- **Restaurarea funcționează în continuare.** QoreX caută printre cheile pe care fraza ta le poate deriva pe cea ținută de rețea, așa că un portofel restaurat semnează cu cheia rotită.

Rotirea nu este niciodată automată, iar site-urile web nu o pot cere.

## Conturi multisig {#multisig}

Un **cont multisig** are nevoie de semnătura mai multor membri. QoreX acceptă multisig-ul post-cuantic pe mainnet și testnet, folosind **aceleași fișiere ca linia de comandă QoreChain**, așa că fiecare membru poate semna în QoreX sau în unealta de linie de comandă. Aplicație: **Setări → Securitate → Conturi multisig**. Extensie și Safari: **Conturi multisig** pe ecranul principal al popupului.

**Creează sau adaugă unul**

1. **Creează un multisig:** introdu adresele membrilor (`qor1...`), câte una pe rând, numărul de semnături necesare (pragul) și un nume opțional, apoi **Salvează**. Fiecare membru trebuie să fi trimis cel puțin o tranzacție.
2. Sau **Adaugă un multisig existent:** lipește cheia multisig (rezultatul comenzii `keys show <name> -p` din linia de comandă ori o cheie partajată din QoreX). **Partajează cheia multisig** o trimite celorlalți membri.

**Verifică-i starea.** Ecranul contului arată soldul, dacă **setul de membri post-cuantic** este înregistrat (și versiunea lui), dacă contul în uz este membru și, pentru fiecare membru, dacă cheia lui este pregătită, lipsește, nu mai poate semna, este înregistrată fără dovadă sau nu a putut fi verificată. Până când setul de membri nu este înregistrat, contul nu poate trimite.

**Semnează în două runde**

1. **Pregătește înregistrarea** (prima dată, o singură dată) sau **Pregătește o trimitere**. QoreX ia gazul dintr-o simulare și creează un fișier. În extensie și Safari fișierul este **descărcat**; în aplicație este **partajat ca text**. Trimite-l celorlalți membri.
2. **Runda 1.** Fiecare membru post-cuantic deschide fișierul (**Deschide fișiere de la membri**), îl verifică și alege **Semnează ca membru post-cuantic**. În aplicație, membrii **lipesc** textul primit; în extensie deschid fișierul.
3. **Combină** semnăturile membrilor.
4. **Runda 2.** Se aleg membrii care semnează clasic (exact numărul pragului, aceeași alegere pentru toți), iar fiecare verifică și alege **Semnează clasic**. Combină din nou.
5. **Trimite în rețea.**

Fiecare pas de semnare arată mai întâi ce semnezi și cere **două apăsări**; aplicația cere și biometria. Dacă o tranzacție ar înregistra un **autentificator**, QoreX te avertizează: un autentificator poate muta fondurile multisig-ului fără semnăturile celorlalți membri. Pentru a semna offline, dintr-un fișier, alte tipuri de tranzacții, vezi spațiul de lucru offline și multisig din [Modul dezvoltator](/qorex/developer-mode).

## Recuperare socială {#social-recovery}

Recuperarea socială le permite unor **gardieni** de încredere să te ajute să îți restaurezi portofelul fără să vadă vreodată fraza ta de recuperare.

- Seed-ul tău este împărțit în **fragmente criptate** (sigilate cu ML-KEM): implicit trei, dintre care oricare **două** te pot ajuta să recuperezi portofelul (o schemă de prag 2-din-3); unul singur nu poate.
- Fiecare gardian primește o acreditare.
- **Kitul de recovery.** Copia criptată a seed-ului tău este **kitul tău de recovery** (începe cu `qorexkit1:`), pe care îl păstrezi tu. Gardienii singuri nu pot restaura portofelul: au nevoie și de acest kit, iar kitul singur este inutil fără ei. Configurările noi trimit serviciului de recuperare doar numărul de gardieni și pragul. Vezi [Kitul de recovery](#recovery-kit).
- O recuperare necesită aprobarea pragului de gardieni, apoi rulează un **timelock de 48 de ore** și îți trimite o **alertă de anulare**, astfel încât o încercare rău-intenționată poate fi oprită.

**Configurare:** Home → **Configurează recuperarea** (sau Setări → Securitate → Social recovery) → **Creează credențiale pentru garanți**. QoreX creează trei acreditări - *Guardian 1*, *Guardian 2* și un *Printable backup* - iar oricare **2 din cele 3** te pot ajuta să recuperezi portofelul. Dă câte una fiecărei persoane sau fiecărui dispozitiv de încredere și păstrează copia de rezervă imprimabilă într-un loc sigur. Apoi salvează kitul de recovery, așa cum se descrie mai jos. Avertismentul Starea copiei de siguranță dispare după ce configurarea este finalizată.

### Kitul de recovery {#recovery-kit}

La finalul configurării, QoreX îți arată **kitul de recovery**. Folosește **Copiază kitul de recovery** sau **Distribuie sau salvează** și păstrează o copie într-un loc pe care îl controlezi și **nu doar pe acest telefon** (un manager de parole, o notiță, o foaie tipărită). Trebuie să bifezi *Am salvat kitul de recovery în afara acestui telefon* înainte să funcționeze **Gata**. Pentru recuperare, lipește **ID-ul de recovery sau kitul de recovery**.

Dacă ai configurat recuperarea socială cu o versiune anterioară, QoreX îți poate spune că o copie criptată a kitului tău se află încă pe serviciul de recuperare. Salvează kitul, apoi alege **Șterge copia de pe releu**. Acreditările gardienilor tăi continuă să funcționeze. După eliminare, doar tu deții kitul.

**Aprobă recuperarea altcuiva:** dacă ești gardian pentru cineva, folosește **Help recover** din tab-ul Home pentru a-i aproba cererea.

## Legacy Protocol {#legacy}

**Legacy Protocol** este un dead-man's switch peste gardienii tăi: activele tale pot trece la beneficiarul ales de tine dacă devii inaccesibil. Este opțional și se configurează din Settings → Security.

## Conectează un dispozitiv nou {#link-device}

Mută-ți portofelul pe un al doilea telefon sau tabletă **fără server și fără a tasta** cele 24 de cuvinte:

1. **Dispozitivul nou** → onboarding → **Link from another device**. Acesta afișează un cod unic de **10 caractere** și deschide camera.
2. **Dispozitivul vechi** → Settings → Security → **Link a new device** → tastează acel cod → confirmă cu biometria. Apare un **cod QR** (seed-ul tău sigilat cu o cheie derivată din cod: scrypt N=2¹⁷ → AES-256-GCM).
3. **Dispozitivul nou** scanează codul QR → îl decriptează local → același portofel, aceleași adrese.

**De ce nu este suficientă o fotografie a codului QR:** codul și codul QR nu apar niciodată pe același ecran. O fotografie doar a codului QR este text cifrat protejat printr-o funcție de derivare a cheii dificilă din punct de vedere al memoriei, iar ambele elemente sunt unice și dispar odată cu ecranele. Un cod greșit produce o eroare clară - pur și simplu reîncearcă.

:::note
Conectarea dispozitivelor este o **facilitate**, nu o metodă de recuperare. Fraza ta din 24 de cuvinte și recuperarea socială sunt adevăratele tale plase de siguranță.
:::

## Fereastra de acces EVM {#evm-window}

Începând cu lanțul **v3.2.0**, o tranzacție pe **lane-ul EVM** - de exemplu una pe care o semnezi în MetaMask pe rețeaua EVM a QoreChain - este admisă doar de la un cont care are o **cheie ML-DSA-87 înregistrată** *și* o **fereastră de autorizare deschisă** (un `MsgOpenEVMWindow` semnat hibrid). Tranzacția EVM în sine poartă doar o semnătură secp256k1. Explorerul etichetează o astfel de tranzacție „Authorised by a PQC window". Deschiderea unei ferestre este un mesaj pe lane-ul Native al QoreChain pe care MetaMask nu îl poate produce, deci QoreX este locul unde o deschizi. Trimiterile proprii ale QoreX folosesc lane-ul Native și nu au nevoie niciodată de o fereastră.

**Cine are nevoie de ea.** O fereastră este pentru **conturile în stil Ethereum (coin 60)** - conturile pe care le adaugi cu *Add an Ethereum account (coin 60)* pentru o frază folosită prima dată în MetaMask (vezi [Restaurarea unei fraze din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask semnează cu o cheie Ethereum, care este cheia unui cont coin-60; nicio cheie MetaMask nu poate trimite de pe un cont obișnuit coin-118 `qor1…`, așa că o fereastră deschisă pe unul nu realizează nimic și costă doar comisionul.

Dacă ești pe un cont care nu poate folosi o fereastră, ecranul listează pașii de urmat și are un buton către **Conturile tale**.

O fereastră se deschide în două feluri: **o deschizi tu** (mai jos) sau [QoreX deschide una pentru o singură tranzacție](#per-transaction-windows) când un site îți cere să o aprobi.

O deschizi în aplicație la **Setări → Securitate → EVM access window**, sau cu butonul **Fereastră de acces EVM** din popupul extensiei. Mai întâi alegi **ce admite fereastra**:

- **Doar transferuri de QOR** (implicit, recomandat): fără apeluri de contracte, fără contracte noi, fără destinatar care este contract.
- **Orice contract:** o alegere separată, cu un avertisment: *"Poate fi apelat orice contract. Plafonul numără doar QOR: tokenii, NFT-urile și aprobările mutate de un contract nu sunt limitate de fereastră."*

Dacă rețeaua nu poate limita o fereastră la transferuri de QOR, QoreX spune acest lucru și întreabă dacă să o deschidă în schimb pentru orice contract. Nu se deschide nimic până nu spui da exact la asta.

Apoi alegi:

| Câmp | Semnificație | Limită |
|---|---|---|
| **Cât timp (blocuri, max 17280)** | cât timp rămâne deschisă fereastra | până la 17.280 de blocuri (aproximativ 15 ore pe mainnet) |
| **Câte tranzacții (max 1000)** | câte tranzacții EVM admite | până la 1.000 |
| **Plafon de cheltuieli, QOR** | cel mai mult QOR pe care îl lasă să plece | numără **tot QOR care părăsește acest cont, plus fiecare comision maxim**; tokenii nu sunt numărați |

Pe acest ecran nu poți numi contracte anume; ferestrele limitate la contracte specifice sunt deschise de QoreX pentru o singură tranzacție (mai jos). Valorile implicite sunt 300 de blocuri (aproximativ 16 minute pe mainnet), 5 tranzacții și 1 QOR. Deschiderea costă un comision de rețea normal și este semnată cu semnătura hibridă obișnuită (secp256k1 și ML-DSA-87), iar o fereastră nouă o **înlocuiește** pe cea deja deschisă. Deschiderea avansează și nonce-ul contului tău, așa că deschide fereastra **mai întâi**, apoi trimite din MetaMask - o tranzacție pregătită mai devreme va fi refuzată cu "nonce too low". **Închide fereastra** este oferit doar cât timp o fereastră este activă.

**O fereastră deschisă spune exact ce admite:** *Admite: doar transferuri QOR*, *Admite: orice contract (tokenii nu intră în plafon)* sau *Admite: doar \{targets\}*. În ultimul caz, QoreX adaugă că **un contract listat poate totuși acționa pentru cont**, inclusiv să mute tokeni pe care contul îi deține sau i-a aprobat lui, iar limita de QOR nu acoperă asta.

Ecranul afișează una dintre patru stări: *Deschisă încă \{blocks\} blocuri · \{txs\} tranzacții · \{value\} QOR rămași*; *Nicio fereastră nu este deschisă. Tranzacțiile MetaMask de la acest cont sunt refuzate.*; *Fereastra respectivă a expirat sau a fost epuizată*; sau *QoreX nu a putut citi fereastra din rețea* - ceea ce înseamnă că QoreX nu știe, **nu** că nu ai niciuna. Dacă contul tău nu are încă o cheie ML-DSA-87, înregistrează mai întâi una (primul tău transfer QoreX o face); o fereastră nu te ajută înainte de asta.

:::caution Păstreaz-o mică și scurtă
O fereastră permite tranzacțiilor obișnuite MetaMask să îți mute QOR **doar cu o semnătură secp256k1**. Păstrează limitele mici - un plafon de cheltuieli mic, puține tranzacții, un timp scurt - alege **doar transferuri de QOR** dacă nu ai nevoie de un contract și închide fereastra când ai terminat. Plafonul acoperă tot QOR care părăsește contul, inclusiv comisionul maxim, așa că o tranzacție care ar depăși plafonul este refuzată. Nu acoperă tokenii.
:::

### Ferestre pentru o singură tranzacție {#per-transaction-windows}

Când un site îi cere QoreX să trimită o tranzacție EVM pe QoreChain și nicio fereastră deschisă nu o acoperă, aprobarea deschide una **exact pentru acea tranzacție**, semnată cu cheia ta hibridă ML-DSA-87:

- o tranzacție, până la valoare **plus comisionul maxim**, pentru aproximativ zece minute;
- limitată la contractele pe care le apelează, acolo unde rețeaua acceptă acest lucru;
- aprobarea **numește fiecare contract** pe care fereastra l-ar admite (inclusiv contractele care ți-au cerut recent să semnezi un permit) și spune că **înlocuiește orice fereastră pe care o ai deschisă**;
- limita de QOR acoperă tot QOR care părăsește contul, inclusiv comisionul maxim, iar un contract listat poate totuși acționa pentru cont (poate muta tokeni pe care contul îi deține sau i-a aprobat, ori QOR deținut de alte contracte);
- dacă rețeaua nu acceptă o fereastră limitată la contracte, QoreX **întreabă a doua oară** înainte de a deschide una fără acea limită. Dacă refuzi, nu se deschide și nu se trimite nimic.

O semnătură de date tipizate pe care un contract de pe QoreChain o verifică (un permit) deschide în mod similar o fereastră scurtă care listează acel contract. În istoricul tranzacțiilor, o tranzacție EVM arată cât a folosit din fereastră. Vezi [Integrare dApp](/qorex/dapp-integration) pentru perspectiva dezvoltatorului. Dacă folosești MetaMask sau alt portofel EVM cu o aplicație care apelează contracte, alege **Orice contract** când deschizi fereastra singur. O aplicație care își trimite tranzacțiile prin QoreX nu are nevoie de nicio fereastră deschisă în avans. Ca și fereastra manuală, aceasta se aplică conturilor în stil Ethereum (coin 60).

(Trimiterea de ETH, BNB și alte active pe *alte* rețele din QoreX este altceva - vezi [Rețele și tokenuri externe](/qorex/send-and-receive#external-networks-tokens).)

## Ce arată fereastra de aprobare {#approvals}

Fiecare semnătură produsă de QoreX este aprobată de tine, iar aprobarea listează exact ce semnezi. QoreX afișează:

- un titlu și câmpuri etichetate pentru **fiecare mesaj** din cerere, inclusiv mesajele imbricate într-un authz **MsgExec** și termenii acordărilor de permisiuni - și **refuză** orice nu poate afișa („QoreX cannot read this message … Approve only if you trust this site completely");
- **comisionul** (*Fee: \{amount\} · gas \{gas\}*), cine îl plătește și orice fee grant - dacă comisionul nu poate fi citit, QoreX spune asta și îți cere să nu aprobi;
- **limita, acțiunea permisă și expirarea** alocațiilor de cheltuieli și ale acordărilor authz, cu *UNLIMITED* și *NEVER* scrise explicit; o expirare este afișată la secundă (`YYYY-MM-DD HH:MM:SS UTC`). Citește cu atenție acțiunea permisă: o alocație de taxe ale cărei mesaje permise includ `MsgExec` (un `AllowedMsgAllowance`) acoperă orice mesaj pe care beneficiarul îl poate executa prin ea, iar o acordare authz generică acoperă orice tip de mesaj pe care îl numește. Un vot de guvernanță este decodat, ca să vezi pentru ce votezi. Orice este ilizibil, nelimitat sau fără sfârșit necesită o **a doua atingere** pe Approve (*Tap again to approve*);
- contul care semnează (*Signed by …*) când ai mai multe;
- pentru o cerere cu un număr foarte mare de mesaje, primele 50 și numărul celorlalte.

Pentru cererile **EVM**, QoreX decodifică tranzacția sau datele tipizate (transfer, aprobare cu *UNLIMITED* scris în clar, permit și altele) și tratează apelurile și tipurile necunoscute ca risc ridicat, cu o a doua apăsare. Simulează acolo unde rețeaua permite. Nodul EVM al QoreChain poate verifica doar că un apel cu date nu ar eșua, așa că aprobarea spune atunci *"What it does to your tokens was not checked. Approve only if you trust this site."* și cere o a doua apăsare. O tranzacție care ar eșua sau care nu poate fi simulată cere, de asemenea, o a doua apăsare. Cererile native care apelează un contract sunt simulate înainte de aprobare, iar un apel pe care contractul l-ar refuza este refuzat cu motivul lanțului. Ecranele de aprobare arată memo-ul și îți permit să deschizi mesajul complet.

QoreX **refuză** și o cerere ai cărei octeți pot fi citiți în două moduri (începând cu 1.1.7 / 0.3.7). O cerere care repetă un câmp ce ar trebui să apară o singură dată - de exemplu un comision sau o sumă dublate - ar putea fi afișată într-un fel și executată în altul, așa că QoreX nu o va afișa deloc spre aprobare. Pentru site-uri web, QoreX identifică site-ul care face cererea prin originea pe care o atestă browserul însuși, niciodată prin ceea ce afirmă cererea despre sine.

O schimbare de portofel sau de cont, ori blocarea portofelului, răspunde „nu" cererilor aflate în așteptare; un site poate avea o singură cerere în așteptare, iar în total pot aștepta trei. Numele câmpurilor din ferestrele de aprobare sunt afișate în engleză în unele build-uri.

### Ce nu poate cere niciodată un site {#never-requested}

Aceste acțiuni sunt disponibile **doar de pe ecranele proprii ale QoreX**. QoreX le refuză de pe orice site web, orice ar spune site-ul:

- gestionarea cheii post-cuantice (înregistrare, migrare, rotire);
- autentificatorii (semnatarii conectați) și regulile de cheltuieli;
- deschiderea, închiderea sau ștergerea unei ferestre de acces EVM;
- mesajele de fereastră și de releu pentru Solana pe QoreChain;
- o permisiune (authz) care ar lăsa pe cineva să **acorde** alte permisiuni sau să **execute** mesaje ca contul tău. Un astfel de grant i-ar permite destinatarului să acționeze ca tine. QoreX o refuză direct, împachetată în `MsgExec` la orice adâncime sau ca grant generic.

## Adrese asemănătoare {#look-alike}

Escrocii trimit sume minuscule de pe adrese care încep și se termină ca una pe care o folosești, sperând că o vei copia pe cea greșită. QoreX compară destinatarul cu adresele pe care le cunoști (contacte salvate, conturile tale și adresele pe care le-ai plătit), pe QoreChain și pe rețelele externe, și semnalează înainte să trimiți o adresă care doar **seamănă** cu una dintre ele. Spamul probabil cu un link în memo este ascuns și din Istoric. Vezi [Contacte și favorite](/qorex/send-and-receive#contacts) și [Istoric](/qorex/send-and-receive#history).

## Blocare automată {#auto-lock}

QoreX se blochează singur după un timp fără utilizare. Alege **1, 5, 15, 30, 60 de minute sau 4 ore** la **Blochează automat după**; implicit sunt **15 minute**. Aplicație: Setări → Securitate; după interval QoreX cere din nou biometria înainte să arate ceva. Extensie și Safari: setarea este pe ecranul principal al popupului, lângă un buton **Blochează**; după interval introduci din nou parola.

## Fraza ta de recuperare și instrumentele de accesibilitate {#phrase-privacy}

Ecranul frazei de recuperare cere de fiecare dată o nouă confirmare biometrică sau un PIN al dispozitivului, afișează cuvintele ca o grilă numerotată, doar pentru citire, **fără buton de copiere**, este blocat pentru capturi de ecran pe Android și este ascuns din comutatorul de aplicații. Pe **Android 14 și ulterior**, cuvintele sunt de asemenea ascunse de serviciile de accesibilitate care nu sunt instrumente de accesibilitate autentice (TalkBack și alte cititoare de ecran reale le pot citi în continuare). Pe versiunile mai vechi de Android și pe iOS, cuvintele sunt ascunse implicit de cititoarele de ecran; dacă te bazezi pe un cititor de ecran, atinge notificarea de pe acel ecran pentru a-l lăsa să le citească. Afișează fraza doar când nimeni nu îți poate vedea ecranul.

## dApp-uri conectate {#connected-dapps}

Conexiunile la dApp-uri sunt **per-origine** și durează până când le elimini. În aplicație sunt salvate **pe acest dispozitiv, per portofel** (doar adresa site-ului); le vezi și le revoci în [Protecția banilor mei](#protection). În extensia de browser și în Safari, deschide **Site-uri conectate** în popup pentru a vedea fiecare site aprobat de acest portofel și **Revocă** pe oricare dintre ele.

## Semnatari conectați și limite de cheltuieli {#linked-signers}

Conectarea unei chei externe (Phantom sau MetaMask) ca **semnatar conectat** cu propriile limite de cheltuieli **nu este încă disponibilă în QoreX** - Settings → Security afișează cardul, cu acțiunea marcată *coming*. Nimic nu este conectat la portofelul tău decât dacă ai făcut-o tu însuți în afara QoreX. Gestionarea cheilor nu poate fi niciodată delegată către o cheie conectată. Vezi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) pentru modelul on-chain.

## Q-Day Scanner {#q-day-scanner}

**Q-Day Scanner** îți permite să introduci orice adresă - a ta sau a altcuiva - și să obții un raport de expunere pentru orice adresă Bitcoin sau Ethereum. Îl găsești din butoanele rapide ale tab-ului Home. Pentru a verifica o adresă **Bitcoin**, QoreX trebuie să întrebe blockstream.info, un serviciu operat de altcineva, care vede adresa și adresa ta IP. Scanerul îl numește și scanează doar după ce accepți.

## Ajutor și asistență {#support}

Aplicație: **Setări → Asistență**. Extensie și Safari: **Asistență** pe ecranul principal al popupului. Ecranul listează **singurele canale oficiale**, cu fiecare adresă completă afișată, ca să o poți compara:

- Comunitatea Telegram: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Pagina de ajutor: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- E-mail: team@qorechain.io
- Raportează o vulnerabilitate: [https://qorechain.io/security](https://qorechain.io/security)

:::danger Personalul QoreX nu îți cere niciodată fraza de recuperare
*"Echipa QoreChain nu îți va cere NICIODATĂ fraza de recuperare, parola sau cheile. Oricine o face este un escroc."* Acest lucru acoperă și asistența QoreX.
:::

Același ecran are un **rezumat de diagnostic** opțional, de copiat **doar dacă îl cere asistența**. Conține versiunea aplicației, rețeaua și coduri de eroare: nicio frază, nicio cheie, adresă sau sold.

## Modelul de securitate, pe scurt

1. **Non-custodial** - cheile sunt generate pe dispozitiv, trăiesc în seifuri protejate hardware (mobil) sau într-un seif criptat (extensie), și nu părăsesc niciodată dispozitivul.
2. **Nimic fără consimțământ** - fiecare conexiune este per-origine, fiecare semnătură este aprobată individual (biometric pe mobil), iar payload-urile sunt decodificate înainte de semnare. Ce nu poate citi QoreX este refuzat sau marcat clar și ținut în spatele unei a doua apăsări.
3. **Lane nativ semnat hibrid.** Fiecare transfer QOR nativ este semnat de două ori: cu o cheie clasică și cu ML-DSA-87 (FIPS 204). Orice este clasic (rețele externe, EVM) este etichetat, niciodată tăcut.
4. **Fără analytics, fără raportare de erori, fără SDK de urmărire.** Cheile, fraza de recuperare, seiful și aprobările nu părăsesc niciodată dispozitivul. Autentificarea opțională, notificările push și recuperarea socială folosesc un server doar când le activezi; lista completă a ceea ce trimite QoreX se află în [Ce trimite QoreX prin rețea](/qorex/overview#data-and-privacy) și este acoperită de [politica de confidențialitate QoreChain](https://qorechain.io/privacy).
5. **Căi de recuperare** - fraza din 24 de cuvinte (întotdeauna), recuperare socială cu gardieni + timelock de 48h (opțional), moștenire Legacy (opțional), conectarea dispozitivelor (facilitate).

## Limite și probleme cunoscute {#limits}

- Recuperarea socială, Legacy, conectarea dispozitivelor și Q-Day Scanner sunt doar pe mobil.
- Rotirea cheii post-cuantice protejează împotriva unei chei post-cuantice scurse, nu a unei fraze de recuperare scurse. Alte portofele cu aceeași frază nu pot semna pentru un cont rotit până când nu acceptă chei rotite.
- Semnatarii conectați cu limite de cheltuieli nu sunt încă disponibili în QoreX.
- Ecranul manual pentru fereastra EVM oferă doar "doar transferuri de QOR" sau "Orice contract". Plafonul de QOR al unei ferestre nu limitează niciodată tokenii.
- Aprobările de tokeni sunt verificate doar pe EVM-ul QoreChain, iar revocarea lor necesită un cont coin-60.
- Conectarea dispozitivelor este o facilitate, nu o metodă de recuperare. Un portofel pierdut, fără frază notată și fără recuperare socială, nu poate fi recuperat de nimeni.
- Fereastra de aprobare afișează unele nume de câmpuri în engleză în unele build-uri.
