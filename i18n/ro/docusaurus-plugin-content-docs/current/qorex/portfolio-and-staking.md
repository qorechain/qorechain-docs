---
slug: /qorex/portfolio-and-staking
title: Portofoliu și Staking
sidebar_label: Portofoliu și Staking
sidebar_position: 4
---

# Portofoliu și Staking

Această pagină descrie vizualizarea Portfolio și staking-ul în QoreX: delegarea QOR către validatori, revendicarea recompenselor, mutarea stake-ului, retragerea din staking și staking-ul cu blocare în timp. Este pentru oricine deține QOR în aplicația mobilă, în extensia de browser sau în extensia Safari.

## Inovații {#innovations}

- **Cifre din lanț.** Perioada de unbonding și randamentul de bază se citesc din rețea, nu sunt fixate în portofel.
- **Mutările pe care rețeaua le-ar refuza sunt prinse din timp.** Mutarea stake-ului estompează ce nu poate fi mutat și spune de ce, înainte să se cheltuie un comision.
- **Recompensele pot merge în alt cont al aceluiași portofel,** și numai acolo.
- **Fără zerouri inventate.** Când rețeaua nu răspunde, QoreX arată ultimele valori primite, cu ora lor, sau o liniuță.

## Portofoliu

Vizualizarea **Portfolio** (protejată biometric prima dată când o deschizi în fiecare sesiune) afișează un **inel de alocare** - QOR-ul tău unificat pe cele trei benzi ale sale (Native, EVM, SVM) - cu o legendă sub inel, plus câte un rând pentru fiecare activ. Procentele apar odată ce fluxul de prețuri este activ, iar fiecare sold afișează valoarea sa estimată în USD alături de suma în QOR. Pe **testnet**, QOR este afișat **fără valoare în USD** - tokenurile de test nu au niciuna.

Folosește **+ Coin or token** pentru a adăuga monede și tokenuri înainte de a deține vreunul și **Receive** pentru a le obține adresele - vezi [Monede și tokenuri](/qorex/send-and-receive#coins-and-tokens).

**De unde vine prețul.** QoreX îl citește de la `GET https://api.qore.network/v1/price/{symbol}` - un endpoint public al nostru, nu un apel direct către vreun exchange. Nimic de pe dispozitivul tău nu comunică cu o sursă de preț din afara infrastructurii proprii QoreChain, așa că adresa ta IP nu este niciodată expusă unei asemenea surse. Dacă un preț cu adevărat justificabil nu este disponibil, endpoint-ul răspunde cu o eroare în loc să ghicească - QoreX afișează prețul ca indisponibil, nu va afișa niciodată un zero fabricat sau o cifră veche ca și cum ar fi actuală.

Atinge orice activ pentru a deschide **Asset detail**, care afișează:

- **Balance history** - o tendință reală construită din transferurile tale on-chain.
- **Recent activity** - rânduri de tranzacții cu căutare inversă **@handle**, astfel încât contrapărțile apar după nume acolo unde este posibil. Atinge orice rând pentru a deschide detaliul complet: sumă, contraparte, bloc, hash de tranzacție și semnătură.

Pagina **QOR** listează fiecare tranzacție a contului, primită sau trimisă, cu **Arată mai multe** în partea de jos. Pentru toate tipurile de tranzacții, stările în așteptare și eșuate și exportul CSV, vezi [Istoric](/qorex/send-and-receive#history). Pe testnet, QOR nu are valoare în dolari pe Acasă sau în Portfolio.

## Când rețeaua este lentă sau nu răspunde {#network-status}

- **Bannerul de stare a rețelei.** QoreX verifică ora ultimului bloc din lanț. Dacă este mai vechi de un minut, un banner spune *"Rețeaua merge încet: cel mai recent bloc are \{seconds\} secunde. Tranzacțiile pot dura mai mult."* Dacă niciun nod nu răspunde, spune *"Rețeaua nu poate fi contactată acum. Soldurile pot fi neactualizate."* Este ora de bloc a lanțului însuși, nu o pagină de stare.
- **Ultimele valori cunoscute.** Când rețeaua nu răspunde (de exemplu în timp ce un nod se reindexează sau după o actualizare), cardul de cont din extensie și ecranele Acasă și Staking din aplicație continuă să arate ultimul sold și ultimele delegări date de rețea pentru acel cont și spun acest lucru: *"Rețeaua nu răspunde. Acestea sunt ultimele valori cunoscute, din \{time\}."* Nu se pune nicio valoare în dolari pe un sold vechi.
- **Recompensele care nu au putut fi citite** apar ca o liniuță, nu ca 0 QOR, iar pentru ele nu se oferă **Revendică**.

## Staking și Earn {#staking}

Punerea la staking a QOR ajută la securizarea QoreChain și îți aduce recompense, care nu sunt garantate. Toate operațiunile de staking sunt tranzacții reale on-chain pe lane-ul nativ cu semnătură hibridă: fiecare este semnată de două ori, cu o cheie clasică și cu ML-DSA-87 (FIPS 204). Staking-ul nu trece niciodată printr-un precompile EVM.

### Unde se află staking-ul {#staking-screens}

- **Aplicație:** ecranul **Stake** arată totalul tău, recompensele cu **Revendică** și, dedesubt, validatorii. Comenzile suplimentare, cum ar fi claim și restake, adresa pentru recompense și blocările, derulează împreună cu lista. Tabelul nivelurilor de staking este pliat într-un singur rând: atinge-l pentru a-l deschide.
- **Extensie și Safari:** **Staking** este un meniu, iar fiecare acțiune deschide propriul ecran, cu o explicație de un rând, propriile mesaje de eroare și **Înapoi la staking**: **Staking QOR**, **Retrage din staking**, **Mută stake-ul**, **Revendică**, **Revendică și restachează**, **Blochează pentru bonus** și **Recompensele merg în**. **Revendică** este mereu listată. Când ai mai multe conturi apare un selector de cont.

### Pune în staking cu un validator

1. Deschide **Stake**.
2. Alege un validator din listă (încărcată live din lanț, cu cel mai mic stake afișat primul, iar orice validator aflat în prezent în jail este exclus - delegarea către unul dintre aceștia nu este niciodată ce îți dorești). Validatorii la care ai deja QOR poartă o insignă *staked*.
3. Introdu o sumă. Cât timp scrii, QoreX te avertizează dacă ceea ce ar rămâne nu ar acoperi următorul comision de rețea: *„Aceasta lasă \{remaining\} QOR - mai puțin decât cei \{fee\} QOR pe care îi costă o tranzacție. Nu vei putea retrage din staking sau revendica recompense până când acest cont nu deține din nou QOR pentru comision."* Este un avertisment, nu o blocare - sunt banii tăi - dar atât retragerea din staking, cât și revendicarea costă un comision din soldul tău **lichid**, deci punerea la staking până aproape de zero blochează stake-ul până când cineva trimite QOR.
4. **Confirmă** (biometrie pe mobil). Poți pune la staking QOR aflat în vesting, până la totalul tău, dar comisionul de rețea trebuie să provină din QOR-ul tău **deblocat** - QOR-ul aflat în vesting nu poate plăti comisioane.
5. Revendică recompensele ori de câte ori se acumulează - vezi mai jos.

La prima tranzacție dintr-un cont, ecranele de staking spun că aceasta înregistrează și cheia ML-DSA-87 a contului (un comision de rețea plătit o singură dată).

:::note O delegare obișnuită nu are perioadă de blocare; așteptarea este doar la ieșire
O delegare obișnuită nu are un termen fix: rămâne activă, cu recompense care curg din blocul următor, până când ceri să anulezi delegarea. Nu există o expirare de reînnoit și nicio durată minimă de staking. Singura perioadă de așteptare este la ieșire: odată ce anulezi delegarea, acel QOR intră într-o **perioadă de unbonding**, timp în care nu produce recompense și nu poate fi mutat, înainte de a reveni în soldul tău disponibil. QoreX citește durata acestei perioade din rețea și o arată înainte să confirmi (21 de zile pe QoreChain la momentul scrierii; dacă nu poate fi citită, QoreX spune *perioada stabilită de rețea*). Mutarea unei delegări către un alt validator (redelegare) evită complet această așteptare. Staking-ul cu blocare în timp este opțional, vezi [Blocări de staking](#staking-locks) mai jos. Vezi și [Există o perioadă de blocare?](/user-guide/staking-and-delegation#lock-in-period).
:::


### Blocări de staking {#staking-locks}

Blocările de staking sunt în aplicație și în extensii, inclusiv Safari. O blocare este opțională. Ea angajează o parte din stake-ul tău pentru 3, 6 sau 12 luni în schimbul unui bonus.

- **Bonusul afișat este cel pe care îl câștigă blocarea astăzi**, sub plafonul stabilit de rețea. Se poate schimba odată cu condițiile rețelei și nu este garantat.
- **Tabelul nivelurilor este etichetat „up to"**, cu cifra de astăzi afișată alături.
- **Deblocarea anticipată** se află în spatele unei a doua confirmări care numește costul înainte să semnezi.
- **Unstake și Move stake sunt limitate la partea deblocată** a stake-ului tău.

Pentru modul în care funcționează modulul on-chain, vezi [Staking cu blocare în timp](/user-guide/staking-and-delegation#time-locked-staking).

### Mută stake-ul între validatori (redelegare) {#move-stake}

Mută QOR pe care îl ai deja la staking către un alt validator - sau împarte-l între mai mulți - fără să treci deloc prin coada de unbonding. Stake-ul continuă să producă recompense pe tot parcursul mutării.

**Extensia și Safari** (Stake → **Mută stake-ul**) te ghidează în trei pași:

1. **Muți de pe.** Alege validatorul de pe care pleacă stake-ul tău. Fiecare arată *În staking \{held\} QOR · poți muta \{free\} QOR* (și orice sumă blocată). Un validator de pe care nu poți muta încă este estompat, cu data: *"Poți muta de aici din nou după \{date\}: stake-urile mutate aici trebuie întâi să ajungă."*
2. **Muți pe.** Alege una sau mai multe destinații. O pereche care are deja numărul maxim de mutări în curs este dezactivată (*"\{n\} mutări în curs, lanțul permite \{max\}"*).
3. **Cât.** Introdu suma sau atinge **Max** (suma liberă, neblocată, de pe sursă). Ruta (*De pe ... pe ...*) și, pentru mai multe destinații, împărțirea (*\{amount\} QOR către fiecare din \{n\} validatori*) sunt afișate înaintea butonului. Orice eroare și răspunsul rețelei apar lângă buton.

**Aplicație:** deschide **Stake**, atinge validatorul la care se află QOR-ul tău și alege **Mută stake-ul**. Aceleași verificări rulează pe validatorul pe care îl deschizi. Alege una sau mai multe destinații, introdu suma (are propriul câmp și **Max**), verifică împărțirea și confirmă cu biometria.

Împărțirea între mai mulți validatori divide suma în mod egal, iar toate destinațiile se mută într-o **singură tranzacție** - un singur comision, iar mutarea ajunge fie în întregime, fie deloc.

Aceasta este mutarea de făcut atunci când un validator la care ai delegat ajunge în jail sau își crește comisionul: mutarea nu costă nicio așteptare și nicio recompensă pierdută.

:::caution Reguli ale lanțului care pot refuza o mutare
- **7 mutări în curs per pereche.** Lanțul permite cel mult 7 redelegări în desfășurare simultan pentru aceeași pereche (sursă, destinație) de validatori.
- **Stake-ul mutat nu poate fi mutat mai departe imediat.** Stake-ul pe care tocmai l-ai mutat **către** un validator nu poate fi mutat **mai departe** de la acel validator până când mutarea care l-a adus acolo nu s-a finalizat (perioada de unbonding a rețelei). Îl poți totuși retrage din staking, sau poți muta stake-ul care se afla deja la acel validator.

QoreX verifică ambele înainte să semnezi. Dacă rețeaua refuză totuși o mutare, QoreX spune de ce în cuvinte, nu printr-un cod; o mutare refuzată on-chain a plătit oricum comisionul de rețea, așa că nu o reîncerca fără să aștepți.
:::

### Revendicare și Revendicare și re-stake {#claim}

- **Claim** colectează recompensele în soldul tău. QoreX revendică doar de la validatorii care au efectiv recompense în așteptare.
- **Revendicarea care costă mai mult decât aduce.** Dacă comisionul de revendicare este mai mare decât recompensele, prima apăsare te avertizează, iar butonul devine **Revendică oricum**. Recompensele continuă să crească dacă aștepți.
- **Revendică și restachează** (buton *Claim & restake*: "Pune la loc \{amount\} QOR pe aceiași validatori, într-o singură tranzacție.") revendică și deleagă recompensele direct înapoi către validatorii care le-au generat - o tranzacție, un comision. Este oferit doar atunci când QoreX poate citi detalierea pe validatori. O tranzacție poate acoperi **cel mult 127 de validatori**; dacă sunt mai mulți, QoreX spune acest lucru și nu semnează nimic.
- **Verificarea comisionului.** Comisionul se plătește *înainte* de sosirea recompenselor. Dacă QOR-ul tău deblocat nu îl poate acoperi, QoreX se oprește înainte să semnezi și îți spune cât este necesar („Revendicarea necesită aproximativ \{fee\} QOR deblocați pentru comisionul de rețea - acesta se plătește înainte de sosirea recompenselor."); trimite puțin QOR către acea adresă și încearcă din nou. QOR-ul aflat în vesting nu poate plăti comisioane.

### Alege unde ajung recompensele {#rewards-address}

Implicit, recompensele ajung în contul care le-a produs. Poți trimite recompensele **viitoare** în **alt cont al aceluiași portofel**, și numai acolo.

1. Aplicație: pe **Stake**, deschide **Recompensele merg în**. Extensie și Safari: **Staking → Recompensele merg în**. Vezi unde ajung recompensele acum.
2. Alege **Schimbă unde merg recompensele** și selectează unul dintre conturile tale.
3. Prima apăsare numește contul complet (*"Recompensele viitoare merg în \{name\}. Atinge din nou ca să semnezi."*); a doua semnează (semnătură hibridă, comision normal de rețea; biometrie în aplicație).

Stake-ul tău nu se mută. QoreX calculează adresele tale proprii din fraza de recuperare, așa că nu poate fi îndreptat către o adresă din afara portofelului, iar site-urile web nu pot cere această schimbare. Dacă recompensele ajung deja la o adresă din afara portofelului tău, QoreX semnalează acest lucru și îți propune să le trimită în unul dintre conturile tale.

### Prețul gazului și dimensiunea tranzacției {#gas}

QoreX citește prețul minim curent al gazului din rețea. Dacă rețeaua îl ridică, QoreX plătește peste noul minim; prețurile incluse în portofel rămân pragul de jos. Comisionul afișat la verificare este comisionul care se semnează. QoreChain acceptă cel mult **50.000.000 gas** într-o singură tranzacție: una mai mare este refuzată înainte să se semneze ceva și nu se percepe niciun comision, așa că împarte-o în bucăți mai mici (de exemplu, revendică de la mai puțini validatori odată).

### Anulează delegarea

1. Deschide **Stake** și atinge validatorul. Dacă ai QOR la el, panoul oferă **Unstake** (și **Move stake**).
2. Introdu suma. Panoul arată cât ai la acel validator și, deasupra butonului **Retrage din staking**, cât durează retragerea (*"Retragerea din staking durează \{days\} până când QOR devin ai tăi de mutat."*, cu perioada citită din rețea) - vezi așteptarea înainte de a confirma.
3. Confirmă cu aprobare biometrică. QOR-ul încetează imediat să producă recompense și devine din nou disponibil pentru cheltuire după finalizarea perioadei de unbonding.

### Unstaking în curs {#unbonding}

QOR-ul retras din staking părăsește atât delegarea ta, cât și soldul tău disponibil pe durata perioadei de unbonding a rețelei. QoreX îl listează la **Retrageri din staking în curs** - *"\{amount\} QOR în retragere"*, fiecare intrare cu timpul rămas (*Mai sunt \{days\}z \{hours\}h \{minutes\}m*, sau *Mai puțin de un minut*, sau *Așteptarea s-a încheiat. Ar trebui să fie înapoi în sold.*). Dacă QoreX nu poate citi când se încheie o intrare, spune acest lucru și păstrează suma în total. Dacă nodul tău nu poate fi contactat, lista rămâne așa cum era - nu apare niciodată ca "nimic în curs de retragere".

:::note Retragerea din staking când rulezi un validator
Dacă portofelul tău aparține unui operator de validator, retragerea din staking este refuzată atunci când ar coborî auto-garanția (self-bond) sub 100.000 QOR necesari: *„Retragerea unei sume atât de mari ar coborî auto-garanția validatorului tău sub cei 100.000 QOR necesari. Pragul se aplică cât timp validatorul este în funcțiune."*
:::

### Earn

Vizualizarea **Câștigă** rezumă staking-ul tău într-un singur loc: QOR-ul tău aflat la staking, recompensele revendicabile, la câți validatori ești și ponderea din tot QOR-ul care este la staking la nivelul întregii rețele.

**Randament.** Rata anuală de bază provine din **cifra proprie a lanțului**. Este afișată *înainte de comisionul validatorului* și este **variabilă și negarantată**. Dacă lanțul raportează că recompensele vin acum doar din taxe, QoreX spune *recompense din taxe* în loc de un procent. Dacă cifra nu poate fi citită, QoreX arată *Indisponibilă* în loc de un număr pe care nu îl poate susține. Bonusul unei blocări în timp este o cifră separată, vezi [Blocări de staking](#staking-locks).

Extensia și Safari au componentele de staking pe ecrane separate, vezi [Unde se află staking-ul](#staking-screens).

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) - mută QOR și active externe.
- [Securitate și Recuperare](/qorex/security-and-recovery) - gardieni, moștenire Legacy și asocierea dispozitivelor.

## Limite și probleme cunoscute {#limits}

- Recompensele nu sunt garantate, iar randamentul afișat este variabil și înainte de comision.
- QOR-ul retras din staking revine doar după perioada de unbonding a rețelei (21 de zile la momentul scrierii); mutarea stake-ului între validatori nu are așteptare, dar este limitată la 7 mutări în curs pentru aceeași pereche de validatori, iar stake-ul mutat nu poate fi mutat mai departe până când mutarea ei nu se finalizează.
- Recompensele pot fi redirecționate doar către alt cont al aceluiași portofel.
- Revendică și restachează acoperă cel mult 127 de validatori într-o singură tranzacție, iar nicio tranzacție nu poate depăși 50.000.000 gas.
- QOR-ul aflat în vesting poate fi pus la staking, dar nu poate plăti comisioane; comisionul trebuie să provină din QOR deblocat.
- Portfolio este doar pe mobil. Pe testnet, QOR nu afișează valoare în USD.
