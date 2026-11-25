---
slug: /qorex/browser-extension
title: Extensia de Browser QoreX
sidebar_label: Extensie de Browser
sidebar_position: 2
---

# Extensia de Browser QoreX

**Extensia de browser** QoreX este portofelul QoreChain pentru desktop. Este un **portofel de sine stătător** (creezi sau imporți un portofel, deții, trimiți și pui în stake QOR și te conectezi la dApp-uri) și este elementul care permite oricărui site web să descopere QoreX și să transforme fiecare cerere într-o aprobare explicită și decodată. Este pentru oricine folosește QoreChain dintr-un browser de desktop și pentru dezvoltatorii care vor ca aplicația lor web să funcționeze cu un portofel QoreChain.

Este **live și public** pe trei magazine (Chrome, Firefox și Safari), toate purtând extensia 0.4.5. Vezi [ce versiune este live unde](#versions).

## Inovații {#innovations}

- **`signAndBroadcast`.** Un dApp trimite mesajele; portofelul arată fiecare mesaj decodat și comisionul, apoi adaugă stratul ML-DSA-87 pe care doar portofelul îl poate face și transmite tranzacția. O pagină nu deține niciodată cheia ML-DSA-87.
- **`signDirect` verifică stratul față de cheia înregistrată.** Dacă un dApp atașează singur un strat ML-DSA-87, QoreX îl verifică față de cheia înregistrată on-chain pentru cont, înainte să se deschidă orice fereastră de aprobare. Dacă tranzacția nu poartă niciun strat, QoreX îl adaugă. `signAndBroadcast` rămâne calea cea mai simplă (vezi [Trimiterea unei tranzacții QoreChain](#sign-and-broadcast)).
- **O suprafață mică de permisiuni.** Extensia declară `storage`, plus (în Chrome și Firefox) `nativeMessaging` pentru unealta opțională Agenți AI din modul dezvoltator. Nu există permisiuni de gazdă și nu există cod de analiză, de raportare a erorilor sau de urmărire. Vezi [Ce permisiuni cere QoreX](#permissions).
- **Seif sigilat.** Seiful este criptat cu AES-256-GCM sub o cheie derivată din parolă (Argon2id). Acolo unde browserul expune WebAuthn PRF (Chrome și Edge), poți debloca cu un passkey în loc de parolă; parola rămâne întotdeauna o soluție de rezervă.
- **Descoperire fără preluare.** QoreX se anunță prin EIP-6963 (`rdns` `network.qore.qorex`) și Solana Wallet Standard. Nu suprascrie niciodată `window.ethereum` sau `window.keplr`.
- **Aprobări per origine, identificate de browser.** Site-ul este originea pe care browserul însuși o atestă, niciodată ceea ce pretinde cererea. O cerere care repetă un câmp pentru a putea fi citită în două moduri este refuzată.
- **Un portofel blocat îți cere parola, nu o reîncercare.** O cerere de semnare a unui site făcută cât timp QoreX este blocat deschide ecranul de parolă și numește site-ul; după ce deblochezi, cererea își afișează propria aprobare. Nu se semnează nimic fără parolă.
- **O verificare înaintea fiecărui transfer.** Formularul de trimitere duce la un ecran de verificare cu destinatarul complet, comisioanele și avertismentele, și abia apoi la semnare.
- **Istoric cu export CSV**, per cont, cu fiecare tranzacție în așteptare, confirmată sau eșuată, așa cum raportează lanțul.
- **Cereri de plată, contacte, Protecția banilor mei și Asistență** în popup. Vezi [Cereri de plată](#pay-requests), [Contacte](#contacts) și [Protecția banilor mei](#protection).
- **Modul dezvoltator cu 17 unelte.** Un singur buton **Unelte pentru dezvoltatori** le deschide pe toate pe propria lor pagină. Vezi [Modul dezvoltator](/qorex/developer-mode).

## Cum se folosește {#how-to-use}

1. Instalează extensia (vezi [Cum accesezi](#how-to-access)) și deschide popup-ul.
2. Alege **Creează un portofel nou** (o parolă, apoi 24 de cuvinte afișate o singură dată) sau **Importă o frază de recuperare**. Vezi [Creează sau restaurează un portofel](#wallet). Apoi alege **Ce vrei să faci mai întâi?** sau sari peste.
3. Folosește **Send**, **Receive**, **Staking QOR**, **Istoric** și **Monede și tokenuri** în popup. Vezi [Trimite QOR](#send), [Istoric](#history), [Fă staking din extensie](#stake) și [Trimiterea pe rețele externe](#send-external).
4. Deschide un dApp. Prima conexiune afișează o aprobare cu originea site-ului; aprobarea dezvăluie doar adresa ta publică. Revocă orice site la [Site-uri conectate](#connected-sites).
5. Ca dezvoltator, detectează QoreX cu EIP-6963 și trimite o tranzacție cu `signAndBroadcast`. Vezi [Conectează un dApp la QoreX](#connect) și [Trimiterea unei tranzacții QoreChain dintr-un dApp](#sign-and-broadcast).

## Cum accesezi {#how-to-access}

Ai nevoie de un browser de desktop și de nimic altceva: fără cont, fără înregistrare și fără aplicație mobilă. Se aplică comisioane de rețea când trimiți sau pui în stake (pragul rețelei este 0.1 uqor per gaz). Extensia urmează rețeaua pe care este setată; mainnet `qorechain-vladi` este cea implicită.

### Instalare {#install}

| Browser | Instalare |
|---|---|
| **Chrome și browsere bazate pe Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 sau mai recent) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 sau mai recent)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Instalează întotdeauna din una dintre aceste listări.

### Ce versiune este live unde {#versions}

:::note
Versiuni verificate pe 25 noiembrie 2026. Aplicația 1.2.5, extensia 0.4.5 și Safari 1.8.2 trec acum prin verificarea magazinelor: funcțiile pe care acest manual le descrie pentru ele ajung la tine când magazinul tău oferă actualizarea. Firefox oferă deja 0.4.4, care are toate aceste funcții; 0.4.5 aduce doar corecții mici. Pagina web a linkurilor de plată distribuite intră online odată cu 1.2.5.
:::

Versiunea curentă din fiecare magazin:

| Magazin | Versiunea curentă |
|---|---|
| Chrome Web Store | 0.4.3 |
| Firefox Add-ons | 0.4.4 |
| Safari (Mac App Store, aplicația macOS **QoreX Wallet**) | 1.8.1, care conține extensia 0.4.3 (Mac App Store folosește propria numerotare `1.x`) |

Recenziile magazinelor ajung în momente diferite, astfel încât un magazin poate servi un build mai vechi decât altul; listarea din magazin arată mereu versiunea sa curentă. Vezi și [Ce versiune este live unde](/qorex/overview#versions).

Extensia 0.4.x adaugă [blocarea automată](#unlock), o [verificare înaintea fiecărui transfer](#send), [Istoricul cu export CSV](#history), [cererile de plată](#pay-requests), [contactele](#contacts), [Protecția banilor mei](#protection), [repararea, rotirea și multisig-ul cheii post-cuantice](#pqc-care), [ecrane de staking](#stake) separate, un [ecran Primește care începe cu moneda](#receive), [semnarea EVM pentru dApp-uri](#standards), [ferestre de acces EVM mai sigure](#evm-window) și [Uneltele pentru dezvoltatori](#developer-tools). Lista completă pe versiuni este în [Ce adaugă versiunile 1.2.5 / 0.4.5](/qorex/overview#whats-new-125) și în listele care urmează.

De la 0.2.6, extensia a primit și: [mai multe portofele cu o singură parolă](#wallets), un [cont în stil Ethereum pe care îl adaugi manual](#coin60), [Revendică și restachează](#stake), o listă **Retrageri din staking în curs**, [adăugarea unui token prin contract](#custom-tokens), [Primește pe orice rețea](#receive), [Site-uri conectate cu Revocă](#connected-sites), [fereastra de acces EVM](#evm-window), [`signAndBroadcast` pentru dApp-uri](#sign-and-broadcast) și ecrane de aprobare care arată fiecare mesaj, comision și expirare.

**Suprafața de permisiuni nu s-a schimbat din versiunea 0.1.3.** Vezi [Ce permisiuni cere QoreX](#permissions).

:::note
Pe Safari, aprobările se deschid într-o filă de browser, nu într-o fereastră popup. Extensia este împachetată cu wrapper-ul Apple pentru extensii web Safari, pornind de la aceeași bază de cod. Unealta **Agenți AI** din modul dezvoltator nu este disponibilă în Safari.
:::

## Creează sau restaurează un portofel {#wallet}

Deschide popup-ul și alege:

- **Create a new wallet** - alege o parolă (cel puțin 8 caractere); QoreX generează pe dispozitivul tău o frază de recuperare nouă din 24 de cuvinte (entropie de 256 de biți), derivă identitatea ta QoreChain și o sigilează în seif sub acea parolă (și, opțional, un passkey - vezi [Securitate](#security)). Cele 24 de cuvinte sunt afișate **o singură dată** - notează-le, bifează *I have saved my recovery phrase somewhere safe*, apoi continuă. Le poți afișa din nou mai târziu cu **Reveal recovery phrase** în popup (necesită parola).
- **Verifică-ți backupul** - imediat după ce confirmi că ai salvat fraza, QoreX îți cere să scrii trei dintre cuvintele ei, de pe poziții aleatorii, așa cum le-ai notat. Dacă unul nu se potrivește, uită-te pe foaie și încearcă din nou. Poți alege **Verific mai târziu**; mai târziu, **Verifică-mi backupul** îți cere parola și nu arată fraza, pentru că scopul este să verifici copia ta scrisă.
- **Import a recovery phrase** - restaurează dintr-o frază existentă. O frază de mai puțin de 24 de cuvinte îți restaurează fondurile normal, dar QoreX te avertizează că cheia ta ML-DSA-87 are atunci doar puterea frazei; pentru putere completă, creează un portofel nou cu 24 de cuvinte și mută-ți fondurile acolo.

:::danger Notează fraza înainte de a continua
Seiful extensiei există doar în acest browser. **Eliminarea extensiei, ștergerea datelor ei sau resetarea browserului îți șterge cheile**, iar nimeni - inclusiv QoreChain Association - nu le poate restaura. Fără cele 24 de cuvinte notate, fondurile tale sunt pierdute definitiv. Vezi [Fă backup acum](/qorex/security-and-recovery#back-up-now).
:::

După creare sau import, QoreX întreabă o dată **Ce vrei să faci mai întâi?**. În extensie, **Vreau să primesc bani** te trece prin monedă, adresa ei și un link de plată; **Vreau să trimit bani** prin alimentarea portofelului, nota despre @handle (handle-urile se revendică în aplicație) și prima ta plată, cu comisionul explicat; **Vreau să-mi păstrez criptomonedele în siguranță** arată adresa ta de depunere și verificarea backupului. Atinge **Sari peste deocamdată** ca să treci mai departe; **Ce vrei să faci?** de pe ecranul principal al popupului îl redeschide.

Extensia deține propriile chei; nu necesită aplicația mobilă. Cheile nu părăsesc niciodată dispozitivul.

## Deblocare și blocare automată {#unlock}

- **Deblocare** - scrie parola și apasă **Enter** sau atinge **Deblochează**. Butonul arată că lucrează (cheia seifului este intenționat lentă de derivat). **Parolă greșită.** apare doar pentru o parolă greșită; orice altă eroare este numită. Acolo unde [deblocarea cu passkey](#security) este activată, poți folosi **Deblochează cu passkey**.
- **Blocare automată** - pe ecranul principal al popupului, **Blochează automat după** stabilește cât rămâne QoreX deschis fără utilizare: 1, 5, 15, 30, 60 sau 240 de minute (afișate ca minute sau ore). Implicit sunt 15 minute.
- **Blochează** - butonul **Blochează** de pe ecranul principal al popupului blochează imediat; ecranul următor îți cere parola.
- **Un site cere ceva cât ești blocat** - o cerere de semnare de la un site (nativă, EVM sau Solana) deschide QoreX pe ecranul de parolă, numind site-ul. După ce deblochezi, fereastra aceea se închide, iar cererea își afișează propria aprobare. Dacă închizi în schimb fereastra, cererea este refuzată și nu se semnează nimic.

## Mai multe portofele și conturi {#wallets}

- **Portofele** (din 0.3.3) - ecranul **Wallets** al popup-ului ("Wallets in this browser") listează fiecare portofel din acest browser. Fiecare are propria frază de recuperare; **o singură parolă** le deblochează pe toate, iar comutarea schimbă portofelul pe care QoreX îl afișează și cu care semnează (nimic nu se mută pe lanț). **Adaugă** un portofel creând unul nou (fraza lui este afișată o singură dată) sau restaurând unul; parola ți se cere o dată pentru a re-sigila seiful. Adăugarea sau eliminarea unui portofel dezactivează **deblocarea cu passkey** - reactiveaz-o din ecranul principal. Pentru a elimina unul, atinge *Remove from this browser* și introdu parola; ultimul portofel nu poate fi eliminat din acest ecran. Eliminarea șterge acea cheie din browser - doar fraza ei de recuperare o aduce înapoi.
- **Conturi** (din 0.2.2) - **Your accounts** creează și comută între mai multe conturi din aceeași frază (până la 20 per portofel; sunt numerotate și nu pot fi redenumite). Restaurarea frazei pe care ai notat-o readuce **Account 1**; adaugă-le din nou pe celelalte cu **Add an account**. Comutarea mută totul odată cu ea: trimiterea, staking-ul, primirea și @handle-ul tău urmează contul activ.

### Cont în stil Ethereum {#coin60}

Din 0.3.2, **Adaugă un cont Ethereum (coin 60)** (pe ecranul **Conturile tale**) adaugă contul pentru o frază folosită prima dată în MetaMask sau pe Dashboard; vezi [Restaurează o frază din MetaMask sau din Dashboard](/qorex/getting-started#restore-dashboard). Adresa lui 0x este cea pe care MetaMask o arată pentru aceleași cuvinte. Handle-urile nu sunt oferite pe el. Începând cu extensia 0.3.9 poți face staking din acest cont în extensie.

Portfolio, Q-Day Scanner, recuperarea socială, Legacy Protocol, autentificarea contului și asocierea dispozitivelor rămân disponibile doar pe mobil - vezi [QoreX Wallet](/qorex/overview#platform-availability).

## Contul, soldul și @handle-ul tău {#account}

Ecranul de repaus al popup-ului afișează adresa ta `qor1…` (atinge pentru a copia) și soldul tău live de QOR, astfel încât nu trebuie să deschizi un explorator de blocuri pentru a le verifica.

### Solduri blocate (vesting) {#vesting}

Dacă contul tău deține QOR aflat în vesting (de exemplu, o alocare TGE nedeblocată încă), soldul se împarte în **disponibil acum** și **încă blocat**, iar o trimitere care depășește suma disponibilă este refuzată înainte de a ajunge la rețea, în loc să eșueze on-chain după ce a perceput deja un comision. QoreX în mod deliberat **nu** afișează aici o "dată a următoarei deblocări": un program de vesting poate fi modificat prin guvernanță, astfel încât o dată afișată pe cardul de sold ar fi citită ca o promisiune pe care QoreX nu o poate garanta. Împărțirea disponibil-vs-blocat este ceea ce rămâne mereu exact.

### Revendică un @handle

Revendicarea unui **@handle** unic (de exemplu `@liviu`) necesită un **cont autentificat** și are loc **în aplicația mobilă**; extensia te trimite acolo și nu revendică ea însăși handle-uri. Odată revendicat, handle-ul se leagă de acea adresă, astfel încât extensia îl rezolvă atunci când îl plătești, iar ceilalți te pot plăti după nume. Vezi [@handle](/qorex/account-and-dashboard#handle) pentru modul în care handle-urile sunt legate de adrese (nu de un portofel ca întreg).

## Trimite QOR {#send}

1. Deschide popupul și atinge **Send**.
2. Introdu destinatarul (adresa `qor1…` sau @handle), suma și un memo opțional. [Favoritele](#contacts) apar pe formular ca chip-uri de o singură atingere.
3. **Verifică transferul.** Ecranul de verificare arată destinatarul complet (și numele contactului, dacă este un contact salvat), suma și memo-ul. Dacă este prima tranzacție a contului, arată și comisionul unic de înregistrare a cheii ML-DSA-87 și totalul.
4. Citește orice avertisment. QoreX îți spune când este prima plată către acea adresă din acest portofel, când adresa doar **seamănă** cu una pe care ai plătit-o sau ai salvat-o (compară fiecare caracter; ai nevoie de o a doua apăsare, **Apasă din nou ca să trimiți totuși la această adresă**) și când comisionul de rețea este mai mare decât suma pe care o trimiți.
5. Atinge **Confirmă și trimite**. QoreX semnează cu semnătura hibridă și trimite.

Disponibil pe mainnet și testnet. O tranzacție peste limita de gaz per tranzacție a rețelei este refuzată înainte să se semneze ceva.

## Trimite către un @handle {#handle-send}

Începând cu 0.1.9 poți plăti direct un @handle înregistrat, în loc să cauți o adresă (căutările au fost întrerupte de o eroare în versiunile până la 0.3.6 și funcționează din nou începând cu 0.3.7):

1. Deschide popup-ul și atinge **Send**.
2. În câmpul destinatarului, scrie `@` urmat de handle (de exemplu `@liviu`) în loc de o adresă `qor1…`.
3. QoreX rezolvă handle-ul și îți arată **adresa rezolvată** înainte să semnezi orice - verifică mereu aceasta față de ce te aștepți.
4. Introdu suma, verifică [ecranul de verificare](#send) și confirmă.

Rezolvarea este verificată în două moduri înainte ca QoreX să o folosească: o atestare de registru verificată față de o cheie de încredere integrată în extensie, și semnătura proprie a proprietarului handle-ului peste revendicare. Un răspuns care eșuează la oricare dintre verificări este respins categoric - QoreX nu recurge la afișarea unei adrese neverificate. Prima dată când plătești un anumit handle, QoreX reține (fixează) adresa la care s-a rezolvat; dacă acel handle se rezolvă ulterior la o adresă **diferită**, QoreX se oprește și îți arată integral atât adresa veche, cât și cea nouă, ca să poți decide dacă vrei să continui. Această memorare există **per browser** - plătirea aceluiași handle pentru prima dată dintr-un alt browser sau computer îl arată ca nou și acolo. Este comportamentul așteptat, nu o eroare.

## Receive {#receive}

Atinge **Receive** în popup. **Începe cu moneda**:

1. **Alege moneda pe care vrei să o primești** - o listă cu căutare (**Caută monedă sau rețea**), cu QOR primul, apoi moneda proprie a fiecărei rețele și tokenurile incluse, fiecare cu imaginea ei și a rețelei sale. Sunt listate și tokenurile pe care le-ai [adăugat prin contract](#custom-tokens). Imaginile vin în interiorul portofelului, așa că nu se descarcă nimic de la un terț ca să fie afișate.
2. QoreX arată adresa pentru rețeaua acelei monede sub formă de cod QR cu buton de copiere și un avertisment care numește moneda: trimite la această adresă doar acea monedă, pe acea rețea. Acolo unde o adresă funcționează pe mai multe rețele (rețelele EVM), spune pe care.
3. **Alege altă monedă** te duce înapoi la listă.

Rețelele acceptate sunt QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis și Celestia. O adresă pentru altă rețea este derivată din fraza ta de recuperare, așa că poate avea nevoie de o confirmare ca să fie afișată. Pentru Cosmos Hub, Osmosis și Celestia, QoreX arată adresa cu care semnează trimiterile tale de pe acele rețele.

## Istoric {#history}

Atinge **Istoric** pe ecranul principal al popupului ca să vezi ce s-a întâmplat în cont:

- **Fiecare tip de tranzacție QoreChain**, nu doar trimiterile: trimise, primite, puse în staking, retrase din staking, stake mutat, recompense revendicate, blocări de staking, fereastra EVM și modificări de chei, cu suma și comisionul. O tranzacție EVM arată și cât a luat din [fereastra de acces EVM](#evm-window).
- **Stare citită din lanț.** Un transfer trimis de pe acest dispozitiv pe care istoricul lanțului nu îl arată încă este listat ca **În așteptare: rețeaua nu a confirmat încă**. Dacă rețeaua nu îl găsește, QoreX spune că poate a eșuat, așa că verifică-l înainte să trimiți din nou (poți apăsa **Închide** pe rând). O tranzacție eșuată este marcată, cu comisionul totuși plătit.
- **Per cont** - cu mai multe conturi, alege contul sus.
- **Repetă plata** - completează din nou formularul de trimitere pornind de la o plată anterioară. Tot tu o verifici și o confirmi.
- **Exportă CSV** - fișierul se creează pe dispozitivul tău, conține doar istoricul tău (nicio frază, nicio cheie) și este făcut sigur de deschis într-o foaie de calcul.

Dacă rețeaua nu poate fi accesată, QoreX spune că nu a putut încărca istoricul; nu arată niciodată asta ca "nicio tranzacție". Istoricul acoperă deocamdată doar QoreChain. Este disponibil pe mainnet și testnet.

## Cereri de plată {#pay-requests}

Cere cuiva o sumă de QOR cu un link care nu poate fi modificat fără să se vadă.

**Cere o plată:**

1. Deschide **Cereri de plată** pe ecranul principal al popupului și creează o **Cerere nouă**: suma în QOR, o notă opțională (până la 140 de caractere) și, dacă ai unul, dacă să arăți @handle-ul.
2. Atinge **Creează linkul**. QoreX semnează cererea cu cheia contului tău. Copiază linkul cu **Copiază linkul** și trimite-l celui care trebuie să plătească.
3. **Cererile mele** le listează. **Verifică starea** citește lanțul și arată **Plătită** sau **Neplătită încă** (ori că rețeaua nu a răspuns). **Refolosește luna viitoare** creează o cerere nouă dintr-una veche.

**Plătește o cerere:**

1. Deschide **Plătește o cerere**, lipește linkul și atinge **Deschide**.
2. QoreX verifică semnătura, că semnatarul deține adresa de primire, rețeaua exactă și orice @handle din cerere. Un link modificat, un semnatar greșit, o rețea necunoscută sau altă monedă decât QOR este refuzată. Dacă cererea este pentru cealaltă rețea, comută tu; QoreX nu o va face.
3. Atinge **Pay**. Primești [ecranul de verificare](#send) obișnuit înainte să se trimită ceva. Plata poartă eticheta cererii în memo, și așa o găsește pe lanț QoreX-ul solicitantului.

O cerere semnată nu are nevoie de cont și nici de autentificare. O cerere de testnet spune acest lucru: QOR de testnet nu are valoare. Formatele de link pentru dezvoltatori sunt în [Integrare dApp](/qorex/dapp-integration).

## Contacte și favorite {#contacts}

**Contacte** de pe ecranul principal al popupului păstrează nume pentru adresele pe care le plătești, **doar pe acest dispozitiv**.

- **Adaugă contact** - un nume și cel puțin o adresă: QoreChain (`qor1…`), EVM (`0x…`), Solana sau Cosmos și un @handle opțional. Marchează-l **Favorit** ca să îl vezi ca chip de o singură atingere pe formularul de trimitere. **Plătește-i lui &#123;name&#125;** deschide formularul completat. Ștergerea cere două apăsări. Lista conține până la 200 de contacte.
- **Contactele cu @handle** arată dacă handle-ul indică aceeași adresă ca la ultima ta plată și te avertizează dacă adresa lui s-a **schimbat**.
- **Adrese asemănătoare** - o adresă care doar seamănă cu una pe care o cunoști deja este semnalată, cu ambele afișate ca să poți compara fiecare caracter.

Un contact nu este o verificare de siguranță: fiecare plată arată în continuare adresa completă pentru verificare.

## Protecția banilor mei {#protection}

**Protecția banilor mei** de pe ecranul principal al popupului este un singur ecran în care fiecare rând este verificat când îl deschizi, pe dispozitivul tău și în rețea. O verificare care nu poate fi citită spune acest lucru; nu contează niciodată ca "în regulă" sau "niciuna".

- **Copia de siguranță verificată** și **Recuperarea testată** - data sau **Încă nu**. **Testează fraza de recuperare** cere trei cuvinte din frază. Sunt comparate pe dispozitivul tău; nimic din ce scrii nu este păstrat sau trimis.
- **Aplicații cu permisiuni** - site-urile care îți pot vedea adresa și îți pot cere să semnezi, cu **Revocă**.
- **Permisiuni acordate în rețea** - granturi care lasă alt cont să trimită în numele tău (authz) sau să îți cheltuie QOR pe comisioane de rețea (granturi de comisioane), cele nelimitate primele, cu **Revocă**. La revocare vezi ce urmează să semnezi și comisionul, apoi confirmi.
- **Aprobări de tokeni pe EVM-ul QoreChain** - atinge **Verifică aprobările de tokeni** (citirea lor cere o dată fraza ta). QoreX spune cât de departe a verificat; deschide din nou ecranul ca să continue. **Revocă** trimite `approve(spender, 0)` după deschiderea unei ferestre EVM pentru o singură tranzacție, limitată la contractul tokenului. Doar un cont în stil Ethereum (coin 60) poate revoca aici.
- **Protecția post-cuantică, pe fiecare canal** - în cuvinte simple: tranzacțiile native QoreChain poartă două semnături (ML-DSA-87 și clasică); tranzacțiile EVM sunt semnate clasic și admise doar într-o fereastră pe care ai deschis-o cu semnătura ta post-cuantică; alte rețele acceptă doar semnături clasice.

Gardienii și recuperarea socială sunt în aplicația mobilă. Vezi [Securitate și recuperare](/qorex/security-and-recovery).

## Asistență și starea rețelei {#help-and-status}

- **Asistență** de pe ecranul principal al popupului listează singurele canale oficiale: [comunitatea Telegram](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), [pagina de ajutor](https://qorechain.io/help/qorex), e-mail la team@qorechain.io și **Raportează o vulnerabilitate**. Personalul QoreChain nu îți cere niciodată fraza de recuperare, parola sau cheile. **Arată rezumatul** oferă un rezumat de diagnostic opțional (versiunea aplicației, rețeaua și coduri de eroare, fără frază, chei, adrese sau solduri), de copiat doar dacă îl cere asistența.
- **Banner de stare a rețelei** - QoreX citește ora ultimului bloc din lanț. Dacă este mai vechi de un minut, un banner spune că rețeaua este lentă și cât de vechi este blocul; dacă rețeaua nu poate fi accesată, spune că soldurile pot fi neactualizate. Nu arată nimic cât timp rețeaua este în regulă.
- **Ultimele valori cunoscute** - când rețeaua nu răspunde, popupul arată ultimul sold și ultimele delegări citite și spune de când sunt.

## Fă staking din extensie {#stake}

Începând cu **0.2.2**, popupul are propriul ecran de staking - un portofel creat doar în extensie nu mai are nevoie de aplicația mobilă ca să câștige recompense din staking. Deschide **Staking QOR** pe ecranul principal al popupului. Se deschide un **meniu** cu un rând de explicație pentru fiecare acțiune; fiecare acțiune deschide propriul ecran, cu propriul rând de eroare, iar **Înapoi la staking** revine la meniu.

| Ecran | Ce face |
|---|---|
| **Staking QOR** | Alegi un validator și o sumă. Validatorii activi sunt listați cu comisionul lor; cei **întemnițați (jailed)** sunt excluși. În timp ce scrii, QoreX te avertizează dacă suma ar lăsa mai puțin decât comisionul unei tranzacții (nu ai mai putea face unstake sau claim până când contul nu deține din nou QOR). |
| **Retrage din staking** | Pornește unbonding-ul. Timpul până când QOR redevine al tău de mutat este **citit din rețea**, iar suma apare sub **Retrageri din staking în curs** cu timpul rămas. |
| **Mută stake-ul** | Redelegare fără așteptare de unbonding, în trei pași: (1) validatorul **de pe care** muți (cei de pe care nu poți muta încă sunt estompați, cu data), (2) validatorii **către care** muți, (3) **cât**, cu **Max** și ruta și împărțirea afișate înainte să semnezi. O mutare pe care rețeaua ar refuza-o este prinsă din timp. Vezi [Mută stake-ul între validatori](/qorex/portfolio-and-staking#move-stake). |
| **Revendică** | Colectează recompensele. Dacă comisionul este mai mare decât recompensele, prima apăsare te avertizează. |
| **Revendică și restachează** | Reinvestește recompensele la validatorii care le-au câștigat, într-o singură tranzacție (până la 127 de validatori). QoreX verifică mai întâi că QOR-ul tău **deblocat** poate plăti comisionul, care se plătește înainte să sosească recompensele. |
| **Blochează pentru bonus** | Blochează o parte din stake pentru 3, 6 sau 12 luni. Vezi [blocările de staking](/qorex/portfolio-and-staking#staking-locks). |
| **Recompensele merg în** | Trimite recompensele viitoare din staking în **alt cont al aceluiași portofel** și la nicio altă adresă. Arată unde ajung recompensele acum, numește noul cont complet la prima apăsare și semnează la a doua. Stake-ul tău nu se mută. |

Sub meniu, un card **Staking-ul, pe scurt** prezintă recompensele câștigate până acum, cât costă staking-ul (comisionul validatorului și comisioanele de rețea) și când sosește QOR retras. Cu mai multe conturi, alege contul care face staking din selectorul de conturi. Fiecare acțiune este semnată cu semnătura hibridă obligatorie (secp256k1 și ML-DSA-87), la fel ca la un Send, iar ecranul spune când prima ta tranzacție îți înregistrează și cheia. Rata anuală se citește din cifra proprie a lanțului. Staking-ul, delegarea și recompensele au loc exclusiv pe lane-ul **Native**, niciodată printr-un precompile EVM - vezi [Staking & Delegation](/user-guide/staking-and-delegation).

### Aprobarea unei cereri de staking din Dashboard {#stake-dashboard}

[Dashboard-ul](/dashboard/staking-and-validators) QoreChain compune cererile de staking, dar nu le poate semna - cheia ta nu părăsește niciodată seiful extensiei. Când apeși **Continue in QoreX** pe Dashboard, cererea se deschide în extensie pentru ca tu să o verifici (validator și sumă) și să o aprobi, exact ca la un Send.

:::note Dacă o tranzacție apare ca „retrogradată" (downgraded) în loc de reușită
Dashboard-ul afișează ocazional o tranzacție ca **downgraded**, în loc de un succes curat. Asta înseamnă că fondurile tale s-au mutat, dar stratul de semnătură ML-DSA-87 nu a fost găsit on-chain pentru acea tranzacție - nu este ceva ce ai făcut greșit și nu este ceva ce poți repara din partea ta. Este o eroare de partea noastră; te rugăm să o raportezi echipei de suport ca să putem investiga. Mesajul rămâne deliberat pe ecran, în loc să dispară, ca să ai timp să-l citești și să-l raportezi.
:::

### Trimiterea pe rețele externe {#send-external}

Pe lângă QOR pe lane-ul Native, ecranul **Trimite pe rețele externe** al popupului trimite active pe alte rețele, toate derivate din aceeași frază de recuperare. Toate rețelele de mai jos pot trimite și primi:

| Tip | Rețele | Token-uri incluse |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Intrări ERC-20 (USDC și USDT pe toate lanțurile EVM, DAI pe Ethereum) |
| SVM | Solana | Intrări SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC prin IBC; câmp opțional de memo |

1. Alege moneda sau tokenul, apoi introdu destinatarul și suma (și, pe rețelele Cosmos, un memo opțional).
2. Bifează confirmarea. În engleză sună astfel: **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** Lanțurile externe nu pot purta o semnătură ML-DSA-87, iar QoreX nu ascunde niciodată acest lucru.
3. Pe rețelele EVM, prima apăsare cotează **comisionul maxim de rețea** ("Network fee: at most …"); a doua trimite exact cu acea cotație. Orice editare anulează cotația. Dacă comisionul, plătit în moneda pe care o trimiți, este mai mare decât suma, ești avertizat.
4. Un destinatar care doar seamănă cu o adresă pe care ai plătit-o deja pe acea rețea este afișat complet și cere încă o apăsare.

## Standarde de portofel acceptate {#standards}

QoreX expune trei interfețe, toate injectate în pagină ca `window.qorex` (`{ evm, native, svm }`) și descoperite prin EIP-6963 și Solana Wallet Standard. Într-o aplicație web, [adaptorul de portofel](/developer-tools/wallet-adapter) învelește această detecție.

| Standard | Ce este | Ce înseamnă pentru tine ca dezvoltator |
|---|---|---|
| **EIP-1193** | API-ul JavaScript al furnizorului Ethereum (`request(...)`, evenimente). | Pe lângă interogările despre cont și rețea (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`), QoreX semnează `personal_sign`, `eth_signTypedData_v4` și `eth_sendTransaction` pe lane-ul EVM al QoreChain (chain id 9801, testnet 9800) și pe Ethereum. Fiecare aprobare spune, decodificat pe dispozitivul tău, ce se autorizează și simulează mai întâi tranzacția acolo unde poate. Pe QoreChain, doar conturile în stil Ethereum (coin 60) pot trimite, iar o tranzacție are nevoie de o [fereastră de acces EVM](#evm-window). Vezi [Integrare dApp](/qorex/dapp-integration). |
| **EIP-6963** | Descoperirea furnizorilor de portofele multiple (evenimente announce / request). | QoreX se anunță alături de fiecare alt portofel - **nu suprascrie niciodată `window.ethereum`** - astfel încât utilizatorul alege QoreX per site, fără conflicte. |
| **Furnizor Native (în stil Keplr)** | `window.qorex.native`: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (pentru cosmjs, cosmos-kit și Interchain Kit), `signArbitrary` / `verifyArbitrary`, plus o listă `capabilities`. **Nu** este un înlocuitor complet pentru Keplr: QoreX nu creează alias pentru `window.keplr`, iar semnarea Amino și `sendTx` nu sunt disponibile. | Cea mai simplă cale de a trimite o tranzacție QoreChain este **`signAndBroadcast`** (vezi [Trimiterea unei tranzacții QoreChain](#sign-and-broadcast)): QoreX arată mesajele decodificate și comisionul, adaugă stratul ML-DSA-87 pe care doar portofelul îl poate face și transmite tranzacția. Cu `signDirect` sau `getOfflineSigner`, QoreX verifică un strat atașat de pagina ta față de cheia înregistrată a contului sau adaugă el însuși stratul când nu există. Vezi [Integrare dApp](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(de la 0.1.5)* | Descoperire nativă de portofel pentru dApp-urile Solana (`wallet-standard:register-wallet` / `app-ready`). | dApp-urile Solana **detectează automat QoreX** - fără integrare personalizată. Funcții: `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction`; lanțul `solana:mainnet`; tranzacții atât `legacy`, cât și `v0`. |

:::note Accesarea directă a lane-ului SVM
Aceeași interfață este disponibilă și pe `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). Descoperirea automată Wallet-Standard și lane-ul SVM complet implementat au fost livrate în **0.1.5** și sunt live atât pe Chrome, cât și pe Firefox (vezi [ce versiune este live unde](#versions)).

Aprobările Solana afișează **o linie pe instrucțiune**, decodată acolo unde QoreX poate: transferuri de SOL (destinatar și lamport), transferuri de token-uri SPL, **"ALLOW SPENDING of your tokens"** (approve), **"HAND OVER control of the account"** (set authority) și închiderea unui cont de token - și spun "instruction QoreX cannot read" pentru orice altceva, împreună cu programul. O cerere care include o instrucțiune approve sau set-authority are titlul "wants authority over your Solana tokens - read every line below". Tranzacțiile care nu listează portofelul tău ca semnatar sunt respinse, `signMessage` nu va semna octeți care sunt de fapt o tranzacție, iar semnătura este marcată drept **clasică**. Vezi [Semnarea hibridă](#pqc).
:::

## Monede și token-uri {#custom-tokens}

Ecranul **Monede și tokenuri** al popupului îți permite să adaugi un **token ERC-20 prin contractul său**: alege rețeaua, lipește adresa contractului, **Verifică contractul**. QoreX citește numele și zecimalele tokenului din contractul însuși - și le citește din nou în fundal când îl adaugi, în loc să aibă încredere în popup - apoi le afișează cu un memento că oricine poate crea un token cu orice nume. Tokenul apare apoi în **Trimite pe rețele externe** și pe [Primește](#receive). Refuză tokenurile incluse, duplicatele, rețelele non-EVM, adresele greșite, contractele ilizibile și contractele care împrumută numele unui token inclus.

## Site-uri conectate {#connected-sites}

**Connected sites** în popup listează fiecare site pe care acest portofel l-a aprobat - un site poate vedea adresa acestui portofel și îți poate cere să semnezi. Atinge **Revoke** pentru a elimina unul. Aprobările sunt păstrate **per portofel**: un site aprobat pentru un portofel nu poate citi adresa altui portofel după ce comuți.

## Fereastra de acces EVM {#evm-window}

Ecranul **Fereastră de acces EVM** al popupului deschide și închide fereastra care permite unui cont în stil Ethereum (coin 60) să trimită pe lane-ul EVM al QoreChain (v3.2.0 și ulterior), cu aceleași limite ca în aplicație: până la 17,280 de blocuri și 1,000 de tranzacții și un plafon de cheltuieli în QOR care numără tot QOR care părăsește contul, plus fiecare comision maxim. Tokenii nu sunt numărați în plafon.

1. Alege durata (în blocuri), numărul de tranzacții și plafonul de cheltuieli.
2. Alege **Ce admite fereastra**:
   - **Doar transferuri de QOR (recomandat)**, implicit: fără apeluri de contracte, fără contracte noi și fără destinatar care este contract;
   - **Orice contract**: poate fi apelat orice contract, iar ecranul avertizează că tokenii, NFT-urile și aprobările mutate de un contract nu sunt limitate de fereastră. Dacă rețeaua nu poate limita o fereastră la transferuri de QOR, QoreX te întreabă înainte să deschidă una pentru orice contract; dacă refuzi, nu se deschide nimic.
3. Atinge **Deschide fereastra**. Fereastra deschisă spune exact ce admite. **Închide fereastra** o încheie.

O fereastră pe care ai deschis-o cu **doar transferuri de QOR** nu permite unui site să apeleze un contract. Pentru tranzacția proprie a unui site, QoreX poate deschide din aprobarea ei o fereastră exact pentru acea tranzacție, care numește fiecare contract pe care fereastra l-ar admite și spune că înlocuiește orice fereastră deschisă.

Un cont coin-118 nu poate folosi lane-ul EVM; ecranul listează cei trei pași de urmat și are un buton către **Conturile tale**. Doar ecranele proprii ale portofelului pot deschide, închide sau șterge o fereastră; un site nu poate. Vezi [Fereastra de acces EVM](/qorex/security-and-recovery#evm-window).

## Îngrijirea cheii post-cuantice și multisig {#pqc-care}

**Înregistrează din nou cheia (reparare).** Dacă înregistrarea cheii post-cuantice a contului în rețea nu mai poate semna (este goală, doar clasică sau altfel inutilizabilă), ecranul principal al popupului arată un card. Atingând **Înregistrează din nou cheia** vezi comisionul de rețea; atinge din nou pentru înregistrare. QoreX nu face asta niciodată de la sine. Dacă contul are o fereastră EVM, rețeaua o închide, așa că deschide una nouă după aceea.

**Rotește cheia post-cuantică.** Butonul **Rotește cheia post-cuantică** înlocuiește cheia ML-DSA-87 a contului din rețea cu următoarea cheie derivată din fraza ta de recuperare. Apasă de două ori; comisionul este arătat în rezultat. Rotirea te protejează dacă a fost expusă doar cheia post-cuantică; **nu** ajută dacă a fost expusă fraza de recuperare. După aceea, alte portofele care folosesc aceeași frază nu pot semna pentru acest cont până când nu acceptă chei rotite, iar rețeaua închide fereastra EVM a contului. QoreX găsește cheia corectă când restaurezi din frază.

**Conturi multisig.** **Conturi multisig** gestionează conturi care au nevoie de semnătura mai multor membri, cu o semnătură post-cuantică de la fiecare membru, pe lângă una clasică. QoreX folosește aceleași fișiere ca linia de comandă QoreChain, așa că fiecare membru poate semna în QoreX sau în linia de comandă.

1. **Creează un multisig** din adresele membrilor (fiecare trebuie să fi trimis cel puțin o tranzacție), numărul de semnături necesare și un nume opțional, sau **Adaugă un multisig existent** lipindu-i cheia.
2. Ecranul arată soldul și starea cheii fiecărui membru. Mai întâi **Pregătește înregistrarea** setului de membri post-cuantic; până când nu este înregistrat, contul nu poate trimite. Apoi **Pregătește o trimitere**.
3. În extensie, fișierele se descarcă și se deschid. **Runda 1:** membrii adaugă semnăturile post-cuantice; combină-le. **Runda 2:** membrii conveniți semnează clasic. Apoi **Trimite în rețea**.
4. Semnarea cere două apăsări, iar tu verifici mai întâi ce semnezi. QoreX te avertizează dacă tranzacția înregistrează un autentificator, pentru că un autentificator poate muta fondurile multisig-ului fără semnăturile celorlalți membri.

## Unelte pentru dezvoltatori {#developer-tools}

Modul dezvoltator este dezactivat implicit. Ca să îl activezi în extensie, atinge de șapte ori **numărul versiunii** din partea de jos a popupului. În partea de jos a ecranului principal al popupului apare o secțiune pentru dezvoltatori cu **Unelte pentru dezvoltatori** (butonul `</>`), **Comută pe testnet (diana)** (sau **Revino pe mainnet**) și **Oprește modul dezvoltator**.

**Unelte pentru dezvoltatori** deschide o singură pagină cu uneltele grupate în **Inspectare**, **Tranzacții**, **Contracte și rollup-uri**, **Alte mașini virtuale** și **Semnare și agenți**. Sunt 17 unelte, aceleași ca în aplicație; pe testnet, printre ele apare și **Solana pe QoreChain**. Modul dezvoltator nu schimbă nicio regulă de semnare: orice semnează arată în continuare ce semnează și așteaptă aprobarea ta. Fiecare unealtă este descrisă în [Modul dezvoltator](/qorex/developer-mode).

Unealta **Agenți AI** îi permite unui asistent AI de pe computerul tău să citească ce permiți și să **propună** o tranzacție. QoreX verifică și simulează fiecare propunere, iar tu o aprobi sau o respingi în fereastra normală de aprobare; niciun agent nu poate semna. În extensie are nevoie de un program companion pe computer care **nu este încă publicat** și nu este disponibilă în Safari.

Doar pe **testnet**, ecranul principal al popupului oferă și trimiterea pe alt lanț prin IBC și ecranul QoreChain Bridge; niciuna nu este oferită pe mainnet. Vezi [Funcții de testnet](/qorex/testnet-features).

## Limbă {#language}

Extensia vorbește aceleași zece limbi ca aplicația mobilă, dashboard-ul și site-ul: engleză, română, germană, spaniolă, franceză, italiană, turcă, arabă, japoneză și coreeană. Aceasta urmează implicit limba **browserului** tău (revenind la engleză pentru orice altceva) - reține că aceasta este o sursă diferită față de aplicația mobilă, care urmează limba **telefonului**, astfel încât cele două pot afișa limbi diferite dacă telefonul și browserul tău sunt setate diferit. Un selector pe ecranul de repaus al popup-ului îți permite să suprascrii oricând limba detectată; comutarea la arabă întoarce imediat popup-ul de la dreapta la stânga, nu doar textul.

## Securitate și permisiuni {#security}

QoreX este construit pentru a fi verificabil, nu doar de încredere:

- **Seif (Vault)** - cheile tale sunt sigilate cu **AES-256-GCM**. Calea prin parolă își derivă cheia cu **Argon2id** (RFC 9106, memory-hard: 64 MiB, t=3, p=1), astfel încât un bloc de seif copiat este lent de spart prin forță brută pe hardware GPU sau ASIC. (Blocurile legacy PBKDF2 rămân deschidibile și se re-sigilează în Argon2id la următoarea deblocare.)
- **Deblocare cu passkey (opțională, din 0.1.5)** - acolo unde autentificatorul tău acceptă extensia **WebAuthn PRF**, QoreX poate debloca seiful din ieșirea PRF de 32 de octeți a passkey-ului, în loc de o parolă tastată. Parola ta rămâne întotdeauna o soluție de rezervă.

  :::note Unde apare deblocarea cu passkey
  QoreX detectează automat WebAuthn și afișează **Enable passkey unlock** doar acolo unde browserul îl expune paginilor de extensie - adică **Chrome și Edge**. Pe **Firefox** opțiunea este ascunsă, pentru că Firefox nu expune WebAuthn paginilor de extensie. Acest lucru este așteptat, nu un bug.
  :::
- **Blocare automată** - QoreX se blochează singur după un timp fără utilizare (implicit 15 minute) și are un buton **Blochează**. Vezi [Deblocare și blocare automată](#unlock).
- **Manifest V3 + CSP strict** - `script-src 'self'; object-src 'self'; base-uri 'self'`. Nu există **nicio încărcare de cod la distanță** după instalare și niciun `wasm-unsafe-eval`.
- **Fără analiză, fără raportare de erori, fără SDK de urmărire, fără înregistrare** - extensia nu are nevoie de un cont pentru a deține, trimite sau pune în stake QOR. Cheile tale, fraza de recuperare, seiful și aprobările nu părăsesc niciodată browserul. Ea face totuși cereri de rețea: către endpoint-urile publice QoreChain pentru solduri, istoric și transmitere (acestea poartă adresa ta publică `qor1…`), o căutare de preț (fără adresă), serviciile publice ale oricărei rețele externe pe care o deții sau o vizualizezi (adresa ta publică pe acea rețea) și registrul de @handle (handle-ul sau o adresă publică). Doar dacă folosești [asocierea cu Dashboard](#dashboard-bridge) trimite o dovadă semnată că deții adresa. Vezi [Ce trimite QoreX prin rețea](/qorex/overview#data-and-privacy).

### Ce permisiuni cere QoreX și de ce {#permissions}

Această secțiune există pentru că listarea de pe Firefox afișează permisiunea **"Access your data for all websites"**, care poate părea în contradicție cu un portofel care declară că nu are permisiuni de gazdă. Iată adevărul exact, neschimbat, din manifest.

`manifest.json` al extensiei declară:

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - stochează seiful criptat, aprobările tale de conexiune per origine și setările și listele proprii ale portofelului (cum ar fi contactele) **local**, în stocarea extensiei.
- **`nativeMessaging`** - nouă în 0.4.5, folosită doar de unealta [Agenți AI](#developer-tools) din modul dezvoltator, pentru a comunica cu un program companion de pe propriul tău computer (încă nepublicat). QoreX deschide acea conexiune doar după ce activezi **Permite conexiuni de la agenți AI pe acest computer** în unealta respectivă. Pachetul pentru **Safari** nu declară această permisiune.
- **`host_permissions: []`** - QoreX nu declară **nicio** permisiune de gazdă. Nu cere capacitatea de a face cereri de rețea cross-origin către site-uri arbitrare în numele tău.
- **`web_accessible_resources`** - permite paginilor să încarce propriul `inpage.js` al QoreX, micul script care expune furnizorul. `use_dynamic_url` îi dă o adresă per sesiune, astfel încât site-urile nu pot identifica extensia prin amprentare, sondând-o.
- **`content_scripts` cu potriviri `<all_urls>`** - acesta este motivul onest pentru care Firefox afișează *"Access your data for all websites."* QoreX injectează un mic script furnizor (`content.js` → `inpage.js`) în **fiecare pagină**. Un content script care rulează pe toate site-urile *poate* tehnic citi pagina, iar browserele descriu această capacitate cu exact această formulare - indiferent dacă provine din `host_permissions` sau dintr-o potrivire de content script.

**De ce content script-ul rulează peste tot.** Pentru ca **orice** dApp să poată descoperi portofelul prin EIP-6963 fără să trebuiască să acorzi mai întâi acces per site. Așa funcționează MetaMask, Keplr, Phantom și orice alt portofel injectat: furnizorul injectat trebuie să fie prezent înainte ca scripturile paginii să ruleze (`document_start`), pe orice site vizitezi.

**Ce face - și ce nu face - acest script.** El doar face legătura mesajelor de portofel (anunță furnizorul, transmite cererile de conectare/semnare către service worker, returnează rezultatul). Nu citește conținutul paginii dincolo de acele cereri de portofel, nu trimite nimic către un server și nu încarcă cod la distanță - și nu poate prelua date cross-origin arbitrare pentru că nu există permisiuni de gazdă. Toate acestea sunt verificabile: extensia este blocată prin CSP, nu include analiză, iar manifestul ei (de mai sus) poate fi citit în pachetul instalat.

## Conectează un dApp la QoreX {#connect}

Un dApp descoperă QoreX prin **EIP-6963** (anunță cererea, alege portofelul al cărui `rdns` este `network.qore.qorex`) și apoi folosește furnizorul EIP-1193 returnat; pentru lane-ul **Native** al QoreChain folosește `window.qorex.native` și citește `capabilities` ca să vadă ce acceptă acest build. QoreX nu setează niciodată `window.ethereum` sau `window.keplr`. Ghidul complet pentru dezvoltatori, cu cod, este pe propria pagină: [Integrează un dApp cu QoreX](/qorex/dapp-integration) (vezi [Detectează QoreX](/qorex/dapp-integration#detection) și [Conectare](/qorex/dapp-integration#connect)). Într-o aplicație web, [adaptorul de portofel](/developer-tools/wallet-adapter) învelește pentru tine această detecție, iar [kitul de dezvoltare QoreX](/developer-tools/qorex-integrations) acoperă integrarea de partea aplicației. (`@qorechain/connect` este depreciat; nu începe lucrări noi pe el.)

Aprobările sunt **per origine**: prima conexiune la un site deschide un popup de aprobare care arată originea, aprobarea dezvăluie doar adresa ta publică, iar aprobarea unui site nu acordă nimic altui site. Aprobările sunt păstrate per portofel, persistă până când le revoci la **Site-uri conectate**, iar un site poate avea o cerere în așteptare (trei în total); comutarea portofelului sau blocarea răspunde cererilor în așteptare cu "nu". Începând cu 0.4.5, o cerere de semnare a unui site făcută cât timp QoreX este blocat deschide ecranul de parolă, numind site-ul, și își afișează aprobarea după ce deblochezi; închiderea ferestrei o refuză. Vezi [Ce arată fereastra de aprobare](/qorex/security-and-recovery#approvals).

### Puntea către Dashboard (v0.1.5, extinsă în v0.2.2) {#dashboard-bridge}

Versiunea 0.1.5 adaugă o punte limitată strict la **`dashboard.qorechain.io`**: `window.qorex.native.connectProof(sessionId)` semnează dovada de asociere *Connect with QoreX* (back-end-ul re-verifică semnătura), iar `executeTransfer({ to, amountUqor, memo })` aprobă și transmite un transfer de QOR propus de Dashboard, returnând `txHash`. Aceste metode sunt refuzate pe orice altă origine.

**0.2.2** adaugă `native:executeRequest`, care acceptă o cerere întreagă propusă de Dashboard - inclusiv [staking](#stake-dashboard) - validată față de același parser comun pe care QoreX îl folosește peste tot: refuzată la o nepotrivire de rețea, o origine străină, o adresă care nu este a ta, un tip de cerere necunoscut sau o cerere de staking care conține un `toAddress` (cererile de staking nu au unul). Tipurile de cerere sunt send, delegate, undelegate, redelegate și claim; o cerere Connect îți permite să alegi care dintre conturile tale să fie asociat, iar `listAccounts()` returnează conturile tale (doar citire).

Deoarece o adresă `qor1…` este la fel de validă atât pe mainnet, cât și pe testnet, o cerere propusă de Dashboard specifică rețeaua vizată, iar QoreX refuză să acționeze asupra ei dacă aceasta nu se potrivește cu rețeaua la care extensia este conectată în prezent - nu va comuta niciodată rețele în numele unei cereri.

## Trimiterea unei tranzacții QoreChain dintr-un dApp: `signAndBroadcast` {#sign-and-broadcast}

Fiecare tranzacție QoreChain pe lane-ul nativ dintr-un cont cu o cheie ML-DSA-87 înregistrată are nevoie de o semnătură hibridă - secp256k1 **și** ML-DSA-87 - iar doar portofelul deține cheia ML-DSA, deci o pagină nu o poate construi. Un dApp trimite mesajele cu `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })`; QoreX arată mesajele decodificate și comisionul, construiește tranzacția pentru contul pe care l-ai selectat, adaugă semnătura hibridă (înregistrând mai întâi cheia ML-DSA-87 a contului dacă este prima lui tranzacție), o transmite și se rezolvă cu `{ txHash, code, height?, shield }`. Disponibil din extensia **0.3.5**.

- Lanțul trebuie să fie rețeaua activă a portofelului (`qorechain-vladi` pe mainnet). Un dApp nu poate comuta rețeaua; doar tu poți.
- 1-32 de mesaje per apel; comisionul este arătat înainte de aprobare; mesajele rezervate portofelului, cum ar fi gestionarea cheii ML-DSA-87, sunt refuzate.
- cosmjs, cosmos-kit și Interchain Kit funcționează prin `getOfflineSigner` (de la 0.4.0), unde QoreX adaugă stratul ML-DSA-87 și comisionul aferent.
- `signArbitrary` semnează un mesaj cu cheia clasică a contului și cu ML-DSA-87 (de la 0.4.0).

Regulile, gazul, erorile și exemplele complete de cod sunt în [Integrează un dApp cu QoreX](/qorex/dapp-integration#sign-and-broadcast).

## Semnarea hibridă {#pqc}

Fiecare transfer nativ de QOR pe care QoreX îl inițiază singur este semnat de două ori: cu o cheie clasică secp256k1 și cu **ML-DSA-87** (FIPS 204), folosind pipeline-ul hibrid din `@qorechain/sdk`. **Nu există comutator**: QoreChain o impune, iar QoreX nu trimite niciodată un transfer de QOR pe lane-ul Native fără ea.

- **Semnarea Native inițiată de dApp** - folosește [`signAndBroadcast`](#sign-and-broadcast): QoreX decodifică fiecare mesaj, arată comisionul și adaugă singur stratul ML-DSA-87. `signDirect` și semnatarii cosmjs (`getOfflineSigner`) semnează o tranzacție construită de pagină; când nu poartă niciun strat ML-DSA-87, QoreX adaugă unul, iar un strat atașat de pagină este verificat față de cheia înregistrată a contului înainte de orice fereastră de aprobare (conturile importate din MetaMask folosesc `signAndBroadcast`). QoreX nu semnează niciodată orb: o cerere pe care nu o poate decodifica este refuzată și nu semnează niciodată o tranzacție QoreChain exclusiv clasică. Vezi [Integrează un dApp cu QoreX](/qorex/dapp-integration#cosmjs).
- **Semnăturile clasice sunt mereu etichetate** - transferurile pe rețele externe (ETH, BNB, Solana, …) nu pot purta o semnătură ML-DSA-87; QoreX te pune să bifezi o confirmare explicită și le marchează drept clasice, în loc să retrogradeze silențios.

**Ce înseamnă asta pentru dimensiunea tranzacției.** ML-DSA-87 este o semnătură mare: semnătura are **4,627 de octeți**, iar cheia publică **2,592 de octeți** (fixate de FIPS-204). O tranzacție hibridă QoreChain este, prin urmare, cu câțiva kiloocteți mai mare decât una pur clasică. Dacă îți construiești și transmiți singur tranzacțiile, dimensionează-ți buffer-ele și estimările de comision pentru octeții suplimentari; contabilizarea gazului din QoreChain îi așteaptă deja. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing) (ghidul dezvoltatorului) pentru primitive și cerința de semnare deterministă.

## Unde este publicată {#where-published}

| Magazin | Listare | Versiunea curentă | Link |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.5 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.5 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, aplicația 1.8.2 | extensia 0.4.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

Codul sursă QoreX nu este public. Listările din magazine arată mereu versiunea curentă.

## Limite și probleme cunoscute {#limits}

- **Semnarea EVM are limite.** Furnizorul semnează `personal_sign`, `eth_signTypedData_v4` și `eth_sendTransaction` (QoreChain și Ethereum, per site) și refuză alte metode de semnare. Pe QoreChain pot trimite doar conturile importate din MetaMask, o tranzacție EVM are nevoie de o fereastră de autorizare (aprobarea deschide una pentru acea tranzacție) și poartă doar o semnătură secp256k1. Vezi [Integrează un dApp cu QoreX](/qorex/dapp-integration#evm).
- **`window.qorex.native` este în stil Keplr, nu un înlocuitor complet pentru Keplr.** Nu există alias `window.keplr`. `signAmino` și `sendTx` lipsesc: Amino este refuzat cu codul `4200`. `getOfflineSigner` și `signDirect` funcționează, iar QoreX adaugă stratul ML-DSA-87 când pagina nu aduce niciunul. `signArbitrary` și `verifyArbitrary` (semnarea de mesaje) funcționează de la 0.4.0. Un dApp nu poate comuta rețeaua, iar mesajele rezervate portofelului (gestionarea cheilor, regulile de cheltuieli, ferestrele EVM, anumite granturi) sunt refuzate de pe orice site.
- **Doar pe mobil:** Portfolio, Q-Day Scanner, recuperarea socială, Legacy, autentificarea, asocierea dispozitivelor și revendicarea unui @handle.
- **Fără ecran Swap** în extensie.
- **Deblocarea cu passkey** este oferită doar acolo unde browserul expune WebAuthn paginilor de extensie (Chrome și Edge); pe Firefox este ascunsă.
- **Safari** deschide aprobările într-o filă de browser, nu într-un popup.
- **Rețelele externe** acceptă doar semnături clasice; QoreX te pune să confirmi acest lucru înainte de fiecare transfer.
- **Doar testnet:** trimiterea pe alt lanț prin IBC, ecranul QoreChain Bridge și Solana pe QoreChain. Vezi [Funcții de testnet](/qorex/testnet-features).
- **Agenții AI** au nevoie de un program companion care nu este încă publicat și nu sunt disponibili în Safari.
- **Istoricul** acoperă deocamdată doar QoreChain.
- Seiful extensiei există doar în acest browser. Eliminarea extensiei, ștergerea datelor ei sau resetarea browserului îți șterge cheile; doar cele 24 de cuvinte notate de tine le restaurează.
