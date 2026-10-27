---
slug: /qorex/security-and-recovery
title: Securitate și recuperare
sidebar_label: Securitate și recuperare
sidebar_position: 5
---

# Securitate și recuperare

Această pagină explică modul în care QoreX îți protejează cheile și cum îți recuperezi un portofel: cheia ML-DSA-87, recuperarea socială, Legacy, conectarea dispozitivelor, fereastra de acces EVM, ce arată aprobările și Q-Day Scanner. Este pentru orice utilizator QoreX; majoritatea instrumentelor de recuperare se află în aplicația mobilă.

## Inovații {#innovations}

- **Recuperare socială cu fragmente criptate.** Gardienii dețin fragmente criptate din seed-ul tău, sigilate cu ML-KEM, împărțite 2 din 3. O recuperare rulează un timelock de 48 de ore și te alertează; poți anula, iar o anulare poate doar să amâne, niciodată să mute fonduri. Releul stochează doar plicuri opace.
- **Legacy.** Un dead-man's switch peste gardienii tăi, pentru un beneficiar pe care îl alegi.
- **Conectarea dispozitivelor.** Un cod unic și un QR, niciodată pe același ecran. QR-ul singur este text cifrat protejat printr-o derivare a cheii dificilă din punct de vedere al memoriei.
- **Cheie ML-DSA-87 deterministă.** Derivată din aceleași 24 de cuvinte (`SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`), deci cheia nu are nevoie de un backup separat. Vezi [QoreSign](/qoresign/overview).
- **Acces EVM delimitat.** O tranzacție EVM este admisă doar cât timp o fereastră de acces este deschisă, limitată după numărul de tranzacții, valoare și expirare.
- **Aprobări care refuză ceea ce nu pot citi.** Vezi [Ce arată fereastra de aprobare](#approvals).
- **Q-Day Scanner.** Un raport de expunere pentru orice adresă Bitcoin sau Ethereum.

## Cum se folosește și unde se găsește {#how-to-use}

Tot ce urmează se află în **Settings → Security** în aplicația mobilă. Extensia de browser are fereastra de acces EVM, Connected sites și aprobările; recuperarea socială, Legacy, conectarea dispozitivelor și Q-Day Scanner sunt doar pe mobil. QoreX este gratuit și nu are nevoie de niciun cont pentru nimic din acestea; vezi [prezentarea generală](/qorex/overview#how-to-access) pentru linkurile către magazine.

Tab-ul Home afișează și un card **Backup health**, care continuă să avertizeze până când configurezi recuperarea socială. Cardul urmărește doar recuperarea socială: nu poate ști dacă ți-ai notat fraza de recuperare, așa că fă asta singur (vezi mai jos).

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

**Rotația cheii** - rotirea cheii tale ML-DSA-87 (o operațiune on-chain `MsgRotatePQCKey`) **nu este încă disponibilă în QoreX**; va sosi odată cu o actualizare ulterioară de gestionare a cheilor, va necesita o nouă confirmare biometrică și **nu este niciodată automatizată**. Site-urile web nu pot cere QoreX să îți înregistreze, să îți migreze sau să îți rotească cheia ML-DSA-87. Înregistrarea se face de la sine la primul tău transfer și nu necesită nimic din partea ta - începând cu v3.2.3, lanțul acceptă și o *dovadă de posesie* opțională la înregistrare, pe care QoreX o gestionează invizibil în versiunile curente din magazine. Vezi [Rotația cheii](/developer-guide/post-quantum-signing#key-rotation) pentru mecanismul care stă la bază.

## Recuperare socială {#social-recovery}

Recuperarea socială le permite unor **gardieni** de încredere să te ajute să îți restaurezi portofelul fără să vadă vreodată fraza ta de recuperare.

- Seed-ul tău este împărțit în **fragmente criptate** (sigilate cu ML-KEM): implicit trei, dintre care oricare **două** te pot ajuta să recuperezi portofelul (o schemă de prag 2-din-3); unul singur nu poate.
- Fiecare gardian primește o acreditare. Configurarea nu scrie nimic lizibil pe releu - doar plicuri opace, sigilate.
- O recuperare necesită aprobarea pragului de gardieni, apoi rulează un **timelock de 48 de ore** și îți trimite o **alertă de anulare**, astfel încât o încercare rău-intenționată poate fi oprită.

**Configurare:** Home → **Set up recovery** (sau Settings → Security → Social recovery) → **Create guardian credentials**. QoreX creează trei acreditări - *Guardian 1*, *Guardian 2* și un *Printable backup* - iar oricare **2 din cele 3** te pot ajuta să recuperezi portofelul. Dă câte una fiecărei persoane sau fiecărui dispozitiv de încredere și păstrează copia de rezervă imprimabilă într-un loc sigur. Avertismentul Backup health dispare odată ce ai făcut asta.

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

O deschizi în aplicație la **Settings → Security → EVM access window**, sau cu butonul **EVM access window** din popup-ul extensiei. Alegi:

| Câmp | Semnificație | Limită |
|---|---|---|
| **Cât timp (blocuri, max 17280)** | cât timp rămâne deschisă fereastra | până la 17.280 de blocuri (aproximativ 15 ore pe mainnet) |
| **Câte tranzacții (max 1000)** | câte tranzacții EVM admite | până la 1.000 |
| **Plafon de cheltuieli, QOR - acoperă fiecare sumă trimisă PLUS comisionul ei maxim** | cât permite să treacă, cel mult | numără valoarea **plus** comisionul maxim al fiecărei tranzacții |

Începând cu v3.2.3, lanțul acceptă și ferestre mai înguste, cu *domeniu restrâns*; QoreX nu oferă un ecran pentru acestea. Valorile implicite sunt 300 de blocuri (aproximativ 16 minute pe mainnet), 5 tranzacții și 1 QOR. Deschiderea costă un comision de rețea normal și este semnată cu semnătura hibridă obișnuită (secp256k1 și ML-DSA-87), iar o fereastră nouă o **înlocuiește** pe cea deja deschisă. Deschiderea avansează și nonce-ul contului tău, așa că deschide fereastra **mai întâi**, apoi trimite din MetaMask - o tranzacție pregătită mai devreme va fi refuzată cu „nonce too low". **Close the window** este oferit doar cât timp o fereastră este activă.

Ecranul afișează una dintre patru stări: *Deschisă încă \{blocks\} blocuri · \{txs\} tranzacții · \{value\} QOR rămași*; *Nicio fereastră nu este deschisă. Tranzacțiile MetaMask de la acest cont sunt refuzate.*; *Fereastra respectivă a expirat sau a fost epuizată*; sau *QoreX nu a putut citi fereastra din rețea* - ceea ce înseamnă că QoreX nu știe, **nu** că nu ai niciuna. Dacă contul tău nu are încă o cheie ML-DSA-87, înregistrează mai întâi una (primul tău transfer QoreX o face); o fereastră nu te ajută înainte de asta.

:::caution Păstreaz-o mică și scurtă
O fereastră permite tranzacțiilor obișnuite MetaMask să îți mute QOR **doar cu o semnătură secp256k1**. Păstrează limitele mici - un plafon de cheltuieli mic, puține tranzacții, un timp scurt - și închide fereastra când ai terminat. Deschiderea unei ferestre noi o înlocuiește pe cea veche, iar plafonul numără fiecare sumă pe care o trimiți **plus** comisionul ei maxim, așa că o tranzacție care ar depăși plafonul este refuzată.
:::

QoreX însuși nu trimite niciodată pe lane-ul EVM al QoreChain; folosește MetaMask sau un alt portofel EVM pentru asta, într-o fereastră deschisă. (Trimiterea de ETH, BNB și alte active pe *alte* rețele din QoreX este altceva - vezi [Rețele și token-uri externe](/qorex/send-and-receive#external-networks-tokens).)

## Ce arată fereastra de aprobare {#approvals}

Fiecare semnătură produsă de QoreX este aprobată de tine, iar aprobarea listează exact ce semnezi. QoreX afișează:

- un titlu și câmpuri etichetate pentru **fiecare mesaj** din cerere, inclusiv mesajele imbricate într-un authz **MsgExec** și termenii acordărilor de permisiuni - și **refuză** orice nu poate afișa („QoreX cannot read this message … Approve only if you trust this site completely");
- **comisionul** (*Fee: \{amount\} · gas \{gas\}*), cine îl plătește și orice fee grant - dacă comisionul nu poate fi citit, QoreX spune asta și îți cere să nu aprobi;
- **limita, acțiunea permisă și expirarea** alocațiilor de cheltuieli și ale acordărilor authz, cu *UNLIMITED* și *NEVER* scrise explicit; o expirare este afișată la secundă (`YYYY-MM-DD HH:MM:SS UTC`), iar un vot de guvernanță este decodat, ca să vezi pentru ce votezi. Orice este ilizibil, nelimitat sau fără sfârșit necesită o **a doua atingere** pe Approve (*Tap again to approve*);
- contul care semnează (*Signed by …*) când ai mai multe;
- pentru o cerere cu un număr foarte mare de mesaje, primele 50 și numărul celorlalte.

QoreX **refuză** și o cerere ai cărei octeți pot fi citiți în două moduri (începând cu 1.1.7 / 0.3.7). O cerere care repetă un câmp ce ar trebui să apară o singură dată - de exemplu un comision sau o sumă dublate - ar putea fi afișată într-un fel și executată în altul, așa că QoreX nu o va afișa deloc spre aprobare. Pentru site-uri web, QoreX identifică site-ul care face cererea prin originea pe care o atestă browserul însuși, niciodată prin ceea ce afirmă cererea despre sine.

O schimbare de portofel sau de cont, ori blocarea portofelului, răspunde „nu" cererilor aflate în așteptare; un site poate avea o singură cerere în așteptare, iar în total pot aștepta trei. Numele câmpurilor din ferestrele de aprobare sunt afișate în engleză în unele build-uri.

## Fraza ta de recuperare și instrumentele de accesibilitate {#phrase-privacy}

Ecranul frazei de recuperare cere de fiecare dată o nouă confirmare biometrică sau un PIN al dispozitivului, afișează cuvintele ca o grilă numerotată, doar pentru citire, **fără buton de copiere**, este blocat pentru capturi de ecran pe Android și este ascuns din comutatorul de aplicații. Pe **Android 14 și ulterior**, cuvintele sunt de asemenea ascunse de serviciile de accesibilitate care nu sunt instrumente de accesibilitate autentice (TalkBack și alte cititoare de ecran reale le pot citi în continuare). Pe versiunile mai vechi de Android și pe iOS, cuvintele sunt ascunse implicit de cititoarele de ecran; dacă te bazezi pe un cititor de ecran, atinge notificarea de pe acel ecran pentru a-l lăsa să le citească. Afișează fraza doar când nimeni nu îți poate vedea ecranul.

## dApp-uri conectate {#connected-dapps}

Conexiunile la dApp-uri sunt **per-origine**. În aplicație sunt și **limitate la sesiune**: închiderea browserului dApp din aplicație revocă toate conexiunile, deci nimic nu rămâne conectat în fundal (cardul **Connected dApps** din Settings → Security spune doar asta). În extensia de browser, conexiunile persistă până când le elimini - deschide **Connected sites** în popup pentru a vedea fiecare site aprobat de acest portofel și **Revoke** pe oricare dintre ele.

## Semnatari conectați și limite de cheltuieli {#linked-signers}

Conectarea unei chei externe (Phantom sau MetaMask) ca **semnatar conectat** cu propriile limite de cheltuieli **nu este încă disponibilă în QoreX** - Settings → Security afișează cardul, cu acțiunea marcată *coming*. Nimic nu este conectat la portofelul tău decât dacă ai făcut-o tu însuți în afara QoreX. Gestionarea cheilor nu poate fi niciodată delegată către o cheie conectată. Vezi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators) pentru modelul on-chain.

## Q-Day Scanner {#q-day-scanner}

**Q-Day Scanner** îți permite să introduci orice adresă - a ta sau a altcuiva - și să obții un raport de expunere pentru orice adresă Bitcoin sau Ethereum. Îl găsești din butoanele rapide ale tab-ului Home.

## Modelul de securitate, pe scurt

1. **Non-custodial** - cheile sunt generate pe dispozitiv, trăiesc în seifuri protejate hardware (mobil) sau într-un seif criptat (extensie), și nu părăsesc niciodată dispozitivul.
2. **Nimic fără consimțământ** - fiecare conexiune este per-origine, fiecare semnătură este aprobată individual (biometric pe mobil), iar payload-urile sunt întotdeauna decodate înainte de semnare - ce nu poate decoda QoreX, refuză.
3. **Lane nativ semnat hibrid.** Fiecare transfer QOR nativ este semnat de două ori: cu o cheie clasică și cu ML-DSA-87 (FIPS 204). Orice este clasic (rețele externe, EVM) este etichetat, niciodată tăcut.
4. **Fără analytics, fără raportare de erori, fără SDK de urmărire.** Cheile, fraza de recuperare, seiful și aprobările nu părăsesc niciodată dispozitivul. Autentificarea opțională, notificările push și recuperarea socială folosesc un server doar când le activezi; lista completă a ceea ce trimite QoreX se află în [Ce trimite QoreX prin rețea](/qorex/overview#data-and-privacy) și este acoperită de [politica de confidențialitate QoreChain](https://qorechain.io/privacy).
5. **Căi de recuperare** - fraza din 24 de cuvinte (întotdeauna), recuperare socială cu gardieni + timelock de 48h (opțional), moștenire Legacy (opțional), conectarea dispozitivelor (facilitate).

## Limite și probleme cunoscute {#limits}

- Recuperarea socială, Legacy, conectarea dispozitivelor și Q-Day Scanner sunt doar pe mobil.
- Rotația cheii tale ML-DSA-87 nu este încă disponibilă în QoreX.
- Semnatarii conectați cu limite de cheltuieli nu sunt încă disponibili în QoreX.
- QoreX nu oferă un ecran pentru ferestre EVM cu domeniu restrâns (lanțul le acceptă începând cu v3.2.3).
- Conectarea dispozitivelor este o facilitate, nu o metodă de recuperare. Un portofel pierdut, fără frază notată și fără recuperare socială, nu poate fi recuperat de nimeni.
- Fereastra de aprobare afișează unele nume de câmpuri în engleză în unele build-uri.
