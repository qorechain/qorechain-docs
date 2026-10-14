---
slug: /dashboard/staking-and-validators
title: Staking și Validatori
sidebar_label: Staking și Validatori
sidebar_position: 8
---

# Staking și Validatori

Pagina **Validatori** (`/validators`) îți permite să analizezi validatorii rețelei — este un instrument de vizualizare, fără conectare la portofel și fără buton de delegare pe ea. Acțiunile efective de staking (delegare, anulare delegare, revendicare) se află pe pagina **Portofel**, în tab-urile **Stake / Delegate** și **Rewards**, odată ce portofelul tău QoreX este conectat acolo. Delegarea ajută la securizarea rețelei și aduce recompense de staking. Pentru conceptele din spatele delegării și recompenselor, vezi [Staking și Delegare](/user-guide/staking-and-delegation).

Staking-ul QoreChain este semnat post-cuantic, așa că dashboard-ul nu deține niciodată o cheie care ar putea semna o delegare. Fiecare acțiune de staking de mai jos funcționează la fel: compui cererea pe dashboard (ce validator, cât de mult), apoi aprobi și semnezi **în portofelul QoreX conectat** — aplicația sau extensia de browser (vezi [ce versiune rulează unde](/qorex/overview#platform-availability)) — exact ca în [fluxul de trimitere](/dashboard/wallet#mainnet). Dashboard-ul trimite doar parametrii printr-un link `qorex://tx?...`; QoreX reconstruiește, semnează și transmite el însuși tranzacția efectivă. Conectează-ți întâi portofelul — vezi [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet).

Staking-ul, delegarea și validarea au loc exclusiv pe lane-ul nativ (Cosmos), folosind semnătura hibridă post-cuantică — niciodată printr-un precompile EVM. Aceasta este o proprietate de securitate permanentă, nu un gol temporar: lane-ul EVM rulează un singur decorator ante, astfel încât verificările de licență de validator, auto-garanție minimă și PQC care există în ante-ul lane-ului nativ ar fi toate ocolite dacă staking-ul ar fi expus acolo. O adresă conectată prin MetaMask poate primi QOR și, cu o fereastră EVM deschisă, îl poate trimite (vezi [Trimiterea cu MetaMask](/dashboard/wallet#send-metamask)), dar nu poate face staking — doar o adresă conectată prin QoreX poate.

## Analizează validatorii

:::caution Pe mainnet, această pagină arată în prezent setul de validatori de testnet
Pagina **Validatori** (`/validators`) afișează setul de validatori de **testnet** cât timp Dashboard-ul este pe mainnet — este o problemă de date pe partea de backend, nu ceva greșit legat de conexiunea sau contul tău. Cifrele de pe cardurile sumar (validatori activi, QOR blocat, înălțimea blocului) sunt și ele cele ale testnet-ului. Nu folosi această pagină pentru a decide cine sunt validatorii mainnet-ului; folosește în schimb [explorerul de blocuri](https://explore.qore.network) sau o interogare directă a lanțului (`qorechaind query staking validators`). Totuși, este vorba doar de o discrepanță informativă: selectorul de validatori din panoul **Delegate** de pe [tab-ul Stake al paginii Portofel](/dashboard/wallet#mainnet) citește o rută diferită, corectă, direct din lanț, așa că nu poți alege sau delega efectiv la un validator care nu există pe mainnet — vei vedea pur și simplu o listă diferită (și corectă) odată ajuns acolo.
:::

Pagina se deschide cu carduri sumar pentru numărul de validatori activi, totalul QOR blocat, comisionul mediu și uptime-ul mediu. Sub acestea se află lista de validatori. Fiecare rând de validator arată:

- Un **rang** și **moniker-ul** (numele) validatorului, cu adresa sa și un buton de copiere.
- **Putere de vot** — stake-ul blocat al validatorului și cota sa din total.
- **Comision** — procentul pe care validatorul îl reține din recompense.
- **APY** — afișat ca o linie orizontală (—): Dashboard-ul nu publică un randament de staking calculat, așa că tratează orice procent citat în altă parte ca fiind neverificat.
- **Status** — de exemplu activ sau întemnițat (jailed).
- Detalii operaționale: regiune, uptime, blocuri propuse, versiune software și ultima activitate.

O casetă de căutare filtrează lista după numele sau adresa validatorului.

Această pagină servește doar pentru compararea validatorilor. Pentru a delega efectiv la unul, mergi la pagina **Portofel** — vezi mai jos.

## Alege un validator

Când alegi un validator la care să delegi, ia în considerare:

- **Comisionul** — o rată mai mică lasă mai multe recompense pentru tine, dar operatorii sustenabili au nevoie de o cotă rezonabilă.
- **Uptime și status** — preferă validatorii activi cu uptime solid; un validator întemnițat (jailed) nu produce recompense. Un validator este întemnițat atunci când semnează mai puțin de 5% din blocurile dintr-o fereastră de 10.000 de blocuri — cu alte cuvinte, a ratat mai mult de 95% dintre ele, ceea ce înseamnă aproximativ 8,5 ore offline pe mainnet (circa 3,2 secunde per bloc; timpii de bloc diferă pe testnet) — nu câștigă nimic, nici pentru tine, nici pentru el, până când iese din întemnițare. O întemnițare pentru downtime durează un interval fix de **600 de secunde (10 minute)** și îl costă pe validator **1% din stake-ul său**; dublarea semnăturii (double-signing) este o abatere separată, mai gravă, care taie **5%**. Aceste cifre sunt parametrii live, actuali ai lanțului — tratează orice cifră mai veche pe care o vezi altundeva ca fiind depășită.
- **Puterea de vot** — distribuirea stake-ului între mai mulți validatori susține descentralizarea. În panoul Delegate, primul loc se rotește între jumătatea mai mică a validatorilor — cel mai mare nu îl poate ocupa niciodată — iar restul sunt listați de la cel mai mic, exact din acest motiv.

## Delegă, redelegă, anulează delegarea și revendică recompense

Toate cele patru acțiuni se află pe pagina **Portofel** (`/wallet`), nu pe pagina Validatori. Deschide portofelul, conectează QoreX dacă nu ai făcut-o deja (vezi [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet)), apoi folosește tab-ul **Stake / Delegate** pentru delegare și anularea delegării, și tab-ul **Rewards** pentru revendicare.

### Delegă {#delegate}

1. Pe pagina **Portofel**, selectează tab-ul **Stake / Delegate**.
2. În panoul **Delegate QOR**, verifică caseta de informații din partea de sus — aceasta arată totalul tău blocat curent față de pragul de stake pentru light node și dacă îl atingi deja. Acest prag este verificat pe baza **stake-ului tău total delegat, cumulat pe toți validatorii**, nu per validator, deci un deficit poate fi acoperit prin delegare la mai mulți — nu există o modalitate de a „delega direct la un light node", deoarece delegarea vizează întotdeauna un validator, iar eligibilitatea pentru light node este o verificare separată asupra totalului tău.
3. Deschide dropdown-ul **Validator** și alege unul. Prima intrare este aleasă aleatoriu din jumătatea mai mică a validatorilor și se poate schimba la reîncărcarea paginii; restul sunt listați de la cel mai mic stake la cel mai mare. Validatorii întemnițați (jailed) nu sunt oferiți.
4. Introdu o **Sumă (QOR)**.
5. Citește nota de sub câmpul sumei: eliberarea (unbonding) durează 21 de zile, iar odată blocat, QOR-ul nu poate fi mutat sau vândut până când nu trece această perioadă.
6. Dacă panoul afișează un avertisment că această adresă nu are suficient QOR disponibil pentru a acoperi comisionul, trimite-i mai întâi puțin QOR disponibil — monedele în vesting sau blocate nu pot plăti comisionul. Butonul **Continue in QoreX** rămâne dezactivat până la rezolvarea acestei situații.
7. Apasă **Continue in QoreX** (afișează **Preparing…** cât timp cererea este creată).
8. Panoul arată acum **Approve it in QoreX**, cu un link **Open QoreX** și un ID de cerere. QoreX îți va arăta validatorul și suma înainte de semnare — nimic nu este trimis până când nu aprobi acolo. Dacă extensia de browser QoreX este detectată, este oferit și un buton **Approve in the browser extension**.
9. Deschide QoreX (link-ul/deeplink-ul face asta) și aprobă delegarea. QoreX construiește, semnează și transmite tranzacția; dashboard-ul nu vede niciodată cheia ta.

### Redelegă {#redelegate}

Dashboard-ul în sine nu are un panou dedicat de Redelegare — dar nu mai ai nevoie de unul. **QoreX poate acum muta el însuși stake-ul între validatori direct** (aplicația 1.0.8+ și extensia 0.2.6+): fără cele 21 de zile de așteptare pentru eliberare, fără recompense pierdute, și poate chiar împărți o mutare către mai mulți validatori destinație într-o singură tranzacție. Deschide **Stake** în QoreX, atinge validatorul pe care vrei să-l părăsești și alege unde ar trebui să meargă stake-ul — vezi [Mută stake-ul între validatori](/qorex/portfolio-and-staking#move-stake) pentru ghidul complet. Acesta este un răspuns mai bun decât orice ar putea oferi contractul propriu de cerere al dashboard-ului, așa că folosește QoreX direct pentru asta, în loc de soluția temporară de mai jos.

Dacă folosești o versiune mai veche de QoreX, fără această funcție încă, mută un stake la un alt validator în doi pași, folosind fluxurile de pe această pagină:

1. **[Anulează delegarea](#undelegate)** sumei de la validatorul pe care vrei să-l părăsești.
2. Așteaptă perioada de eliberare (unbonding) arătată în acel flux — QOR-ul nu este mobil și nu produce recompense în acest timp.
3. Odată ce QOR-ul eliberat devine din nou disponibil, **[delegă-l](#delegate)** la noul validator.

Această soluție temporară costă 21 de zile de recompense pierdute și mai mult în comisioane decât o mutare directă, așa că actualizează QoreX în loc să te bazezi pe ea, dacă poți.

### Anulează delegarea {#undelegate}

Ieșirea dintr-o delegare este acum disponibilă pe dashboard — pentru o vreme a fost posibil să delegi, dar nu și să anulezi delegarea de aici, așa că, dacă îți amintești că lipsea, acesta este motivul.

:::caution Perioadă de eliberare de 21 de zile
QOR-ul cu delegarea anulată nu ajunge la tine astăzi. Acesta trece mai întâi printr-o **perioadă de eliberare (unbonding) de 21 de zile**, timp în care nu produce recompense și nu poate fi mutat sau vândut. Panoul afișează acest lucru de două ori, intenționat — o dată ca subtitlu, o dată din nou chiar deasupra butonului de confirmare — pentru că cineva care ajunge în grabă la acest ecran (o piață în cădere, un validator întemnițat) este exact persoana care are cea mai mare nevoie să vadă asta înainte de a semna.
:::

1. Pe pagina **Portofel**, selectează tab-ul **Stake / Delegate** și derulează la panoul **Unbond QOR**, aflat sub Delegate. Subtitlul său reia deja avertismentul de 21 de zile de mai sus.
2. Dacă nu ai delegări active de la această adresă, panoul îți spune asta și se oprește aici.
3. Deschide dropdown-ul **Unbond from** și alege delegarea pe care vrei să o reduci — acesta listează doar validatorii la care ești efectiv delegat, fiecare cu suma blocată afișată.
4. Introdu o **Sumă (QOR)** de eliberat sau apasă **Unbond all `<amount>` QOR** pentru a completa automat suma totală blocată la acel validator.
5. Dacă introduci mai mult decât este blocat la acel validator, panoul te anunță și blochează trimiterea.
6. Chiar deasupra butonului de confirmare, avertismentul apare a doua oară: QOR-ul ajunge în 21 de zile, nu astăzi, și nu produce nimic până atunci. Aceasta este o repetiție deliberată, nu o greșeală de redactare — citește-o din nou înainte de a continua.
7. Dacă adresa nu poate acoperi comisionul (monedele blocate nu îl pot plăti — ai nevoie mai întâi de puțin QOR disponibil aici), panoul te avertizează și dezactivează butonul.
8. Apasă **Continue in QoreX** (**Preparing…** cât timp cererea este creată).
9. Panoul arată **Approve it in QoreX**, cu un link **Open QoreX** și un ID de cerere — QoreX afișează validatorul și suma înainte să semnezi. Dacă extensia de browser QoreX este detectată, este oferit și un buton **Approve in the browser extension**.
10. Deschide QoreX și aprobă. Acesta semnează și transmite anularea delegării; QOR-ul devine din nou disponibil abia după ce se încheie perioada de eliberare de 21 de zile.

### Revendică recompense {#claim}

1. Pe pagina **Portofel**, selectează tab-ul **Rewards**.
2. Panoul **Staking rewards** citește recompensele acumulate de la fiecare validator la care ești delegat. Dacă nu ai nimic în stake de la această adresă, îți spune asta și nu ai nimic de revendicat.
3. În caz contrar, arată totalul care așteaptă să fie revendicat, plus câte o linie per validator cu suma acumulată acolo. Recompensele se acumulează continuu și nu se pierd niciodată prin așteptare — nu există termen limită.
4. Apasă **Claim in QoreX**. Aceasta este o revendicare-totală: revendică recompensele acumulate de la toți validatorii afișați, într-o singură cerere — nu există un buton de revendicare per validator.
5. Aprobă revendicarea în QoreX (prin link-ul **Open QoreX**) pentru a o semna și transmite. Dacă extensia de browser QoreX este detectată, este oferit și un buton **Approve in the browser extension**.

:::note Perioadă de eliberare
QOR-ul cu delegarea anulată trece printr-o perioadă de eliberare de 21 de zile înainte de a deveni din nou disponibil, timp în care nu produce recompense. Vezi [Staking și Delegare](/user-guide/staking-and-delegation) pentru detalii.
:::

## Legături conexe

- [Staking și Delegare](/user-guide/staking-and-delegation) — concepte complete de staking.
- [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet) — conectează QoreX înainte de a face staking.
- [Explorer Validatori](/dashboard/explorer#validators) — răsfoiește validatorii fără portofel.
- [Tools Hub](/dashboard/tools-hub) — aplică pentru a rula propriul validator.
