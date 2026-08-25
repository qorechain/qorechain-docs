---
slug: /dashboard/staking-and-validators
title: Staking și Validatori
sidebar_label: Staking și Validatori
sidebar_position: 8
---

# Staking și Validatori

Pagina **Validatori** (`/validators`) îți permite să analizezi validatorii rețelei — este un instrument de vizualizare, fără conectare la portofel și fără buton de delegare pe ea. Acțiunile efective de staking (delegare, anulare delegare, revendicare) se află pe pagina **Portofel**, în tab-urile **Stake / Delegate** și **Rewards**, odată ce portofelul tău QoreX este conectat acolo. Delegarea ajută la securizarea rețelei și aduce recompense de staking. Pentru conceptele din spatele delegării și recompenselor, vezi [Staking și Delegare](/user-guide/staking-and-delegation).

Staking-ul QoreChain este semnat post-cuantic, așa că dashboard-ul nu deține niciodată o cheie care ar putea semna o delegare. Fiecare acțiune de staking de mai jos funcționează la fel: compui cererea pe dashboard (ce validator, cât de mult), apoi aprobi și semnezi **în portofelul QoreX conectat** — aplicația, sau extensia de browser pe **versiunea 0.2.2 sau ulterioară** (vezi [ce versiune rulează unde](/qorex/overview#platform-availability); pe o versiune mai veche a extensiei, Dashboard-ul îți va cere să actualizezi în loc să eșueze silențios) — exact ca în [fluxul de trimitere](/dashboard/wallet#mainnet). Dashboard-ul trimite doar parametrii printr-un link `qorex://tx?...`; QoreX reconstruiește, semnează și transmite el însuși tranzacția efectivă. Conectează-ți întâi portofelul — vezi [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet).

Staking-ul, delegarea și validarea au loc exclusiv pe lane-ul nativ (Cosmos), folosind semnătura hibridă post-cuantică — niciodată printr-un precompile EVM. Aceasta este o proprietate de securitate permanentă, nu un gol temporar: lane-ul EVM rulează un singur decorator ante, astfel încât verificările de licență de validator, auto-garanție minimă și PQC care există în ante-ul lane-ului nativ ar fi toate ocolite dacă staking-ul ar fi expus acolo. O adresă conectată prin MetaMask poate trimite și primi QOR (vezi [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet)), dar nu poate face staking — doar o adresă conectată prin QoreX poate.

## Analizează validatorii

Pagina se deschide cu carduri sumar pentru numărul de validatori activi, totalul QOR blocat, comisionul mediu și uptime-ul mediu. Sub acestea se află lista de validatori. Fiecare rând de validator arată:

- Un **rang** și **moniker-ul** (numele) validatorului, cu adresa sa și un buton de copiere.
- **Putere de vot** — stake-ul blocat al validatorului și cota sa din total.
- **Comision** — procentul pe care validatorul îl reține din recompense.
- **APY** — estimarea randamentului anual pentru delegare.
- **Status** — de exemplu activ sau întemnițat (jailed).
- Detalii operaționale: regiune, uptime, blocuri propuse, versiune software și ultima activitate.

O casetă de căutare filtrează lista după numele sau adresa validatorului.

Această pagină servește doar pentru compararea validatorilor. Pentru a delega efectiv la unul, mergi la pagina **Portofel** — vezi mai jos.

## Alege un validator

Când alegi un validator la care să delegi, ia în considerare:

- **Comisionul** — o rată mai mică lasă mai multe recompense pentru tine, dar operatorii sustenabili au nevoie de o cotă rezonabilă.
- **Uptime și status** — preferă validatorii activi cu uptime solid; un validator întemnițat (jailed) nu produce recompense. Un validator este întemnițat atunci când ratează semnarea a peste 5% din blocuri într-o fereastră de 10.000 de blocuri (aproximativ șase ore) — nu câștigă nimic, nici pentru tine, nici pentru el, până când rezolvă problema și iese din întemnițare.
- **Puterea de vot** — distribuirea stake-ului între mai mulți validatori susține descentralizarea. În panoul Delegate, validatorii sunt listați de la cel mai mic la cel mai mare, exact din acest motiv.

## Delegă, redelegă, anulează delegarea și revendică recompense

Toate cele patru acțiuni se află pe pagina **Portofel** (`/dashboard/wallet`), nu pe pagina Validatori. Deschide portofelul, conectează QoreX dacă nu ai făcut-o deja (vezi [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet)), apoi folosește tab-ul **Stake / Delegate** pentru delegare și anularea delegării, și tab-ul **Rewards** pentru revendicare.

### Delegă {#delegate}

1. Pe pagina **Portofel**, selectează tab-ul **Stake / Delegate**.
2. În panoul **Delegate QOR**, verifică caseta de informații din partea de sus — aceasta arată totalul tău blocat curent față de pragul de stake pentru light node și dacă îl atingi deja. Acest prag este verificat pe baza **stake-ului tău total delegat, cumulat pe toți validatorii**, nu per validator, deci un deficit poate fi acoperit prin delegare la mai mulți — nu există o modalitate de a „delega direct la un light node", deoarece delegarea vizează întotdeauna un validator, iar eligibilitatea pentru light node este o verificare separată asupra totalului tău.
3. Deschide dropdown-ul **Validator** și alege unul. Validatorii sunt listați de la cel mai mic stake la cel mai mare.
4. Introdu o **Sumă (QOR)**.
5. Citește nota de sub câmpul sumei: eliberarea (unbonding) durează 21 de zile, iar odată blocat, QOR-ul nu poate fi mutat sau vândut până când nu trece această perioadă.
6. Dacă panoul afișează un avertisment că această adresă nu are suficient QOR disponibil pentru a acoperi comisionul, trimite-i mai întâi puțin QOR disponibil — monedele în vesting sau blocate nu pot plăti comisionul. Butonul **Continue in QoreX** rămâne dezactivat până la rezolvarea acestei situații.
7. Apasă **Continue in QoreX** (afișează **Preparing…** cât timp cererea este creată).
8. Panoul arată acum **Approve it in QoreX**, cu un link **Open QoreX** și un ID de cerere. QoreX îți va arăta validatorul și suma înainte de semnare — nimic nu este trimis până când nu aprobi acolo.
9. Deschide QoreX (link-ul/deeplink-ul face asta) și aprobă delegarea. QoreX construiește, semnează și transmite tranzacția; dashboard-ul nu vede niciodată cheia ta.

### Redelegă {#redelegate}

Contractul de cerere de bază acceptă deja mutarea directă a unei legături (bond) de la un validator la altul (`redelegate`, cu un validator sursă și unul destinație, care trebuie să fie diferiți) — același model non-custodial, semnat prin QoreX, ca la delegare și anularea delegării. La momentul redactării acestui text, dashboard-ul nu expune încă un panou dedicat de Redelegare sau un buton pentru asta.

Până când acel panou va fi lansat, mută un stake la un alt validator în doi pași, folosind fluxurile de pe această pagină:

1. **[Anulează delegarea](#undelegate)** sumei de la validatorul pe care vrei să-l părăsești.
2. Așteaptă perioada de eliberare (unbonding) arătată în acel flux — QOR-ul nu este mobil și nu produce recompense în acest timp.
3. Odată ce QOR-ul eliberat devine din nou disponibil, **[deleg-ă-l](#delegate)** la noul validator.

Aceasta durează mai mult decât ar dura o redelegare directă (fără recompense de blocare în timpul ferestrei de eliberare de 21 de zile), așa că tratează-o ca pe o soluție temporară, nu ca pe cea intenționată. Merită menționat, din punctul de vedere al comisioanelor, că o redelegare directă este de regulă cea mai scumpă dintre aceste operațiuni de staking, iar pasul de anulare a delegării din această soluție temporară costă deja vizibil mai mult decât o simplă delegare de una singură — rețeaua măsoară gazul pe operațiune, nu percepe un comision fix, iar scrierea unei intrări în coada de eliberare este muncă suplimentară reală. Delegarea simplă rămâne cea mai ieftină dintre cele trei.

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
9. Panoul arată **Approve it in QoreX**, cu un link **Open QoreX** și un ID de cerere — QoreX afișează validatorul și suma înainte să semnezi.
10. Deschide QoreX și aprobă. Acesta semnează și transmite anularea delegării; QOR-ul devine din nou disponibil abia după ce se încheie perioada de eliberare de 21 de zile.

### Revendică recompense {#claim}

1. Pe pagina **Portofel**, selectează tab-ul **Rewards**.
2. Panoul **Staking rewards** citește recompensele acumulate de la fiecare validator la care ești delegat. Dacă nu ai nimic în stake de la această adresă, îți spune asta și nu ai nimic de revendicat.
3. În caz contrar, arată totalul care așteaptă să fie revendicat, plus câte o linie per validator cu suma acumulată acolo. Recompensele se acumulează continuu și nu se pierd niciodată prin așteptare — nu există termen limită.
4. Apasă **Claim in QoreX**. Aceasta este o revendicare-totală: revendică recompensele acumulate de la toți validatorii afișați, într-o singură cerere — nu există un buton de revendicare per validator.
5. Aprobă revendicarea în QoreX (prin link-ul **Open QoreX**) pentru a o semna și transmite.

:::note Perioadă de eliberare
QOR-ul cu delegarea anulată trece printr-o perioadă de eliberare de 21 de zile înainte de a deveni din nou disponibil, timp în care nu produce recompense. Vezi [Staking și Delegare](/user-guide/staking-and-delegation) pentru detalii.
:::

## Legături conexe

- [Staking și Delegare](/user-guide/staking-and-delegation) — concepte complete de staking.
- [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet) — conectează QoreX înainte de a face staking.
- [Explorer Validatori](/dashboard/explorer#validators) — răsfoiește validatorii fără portofel.
- [Tools Hub](/dashboard/tools-hub) — aplică pentru a rula propriul validator.
