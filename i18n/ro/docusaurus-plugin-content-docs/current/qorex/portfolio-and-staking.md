---
slug: /qorex/portfolio-and-staking
title: Portofoliu și Staking
sidebar_label: Portofoliu și Staking
sidebar_position: 4
---

# Portofoliu și Staking

## Portofoliu

Vizualizarea **Portfolio** (protejată biometric prima dată când o deschizi în fiecare sesiune) afișează un **inel de alocare** — QOR-ul tău unificat pe cele trei benzi ale sale (Native, EVM, SVM) — cu o legendă sub inel, plus câte un rând pentru fiecare activ. Procentele apar odată ce fluxul de prețuri este activ, iar fiecare sold afișează valoarea sa estimată în USD alături de suma în QOR. Pe **testnet**, QOR este afișat **fără valoare în USD** — tokenurile de test nu au niciuna.

Folosește **+ Coin or token** pentru a adăuga monede și tokenuri înainte de a deține vreunul și **Receive** pentru a le obține adresele — vezi [Monede și tokenuri](/qorex/send-and-receive#coins-and-tokens).

**De unde vine prețul.** QoreX îl citește de la `GET https://api.qore.network/v1/price/{symbol}` — un endpoint public al nostru, nu un apel direct către vreun exchange. Nimic de pe dispozitivul tău nu comunică cu o sursă de preț din afara infrastructurii proprii QoreChain, așa că adresa ta IP nu este niciodată expusă unei asemenea surse. Dacă un preț cu adevărat justificabil nu este disponibil, endpoint-ul răspunde cu o eroare în loc să ghicească — QoreX afișează prețul ca indisponibil, nu va afișa niciodată un zero fabricat sau o cifră veche ca și cum ar fi actuală.

Atinge orice activ pentru a deschide **Asset detail**, care afișează:

- **Balance history** — o tendință reală construită din transferurile tale on-chain.
- **Recent activity** — rânduri de tranzacții cu căutare inversă **@handle**, astfel încât contrapărțile apar după nume acolo unde este posibil. Atinge orice rând pentru a deschide detaliul complet: sumă, contraparte, bloc, hash de tranzacție și semnătură.

## Staking și Earn

Punerea la staking a QOR ajută la securizarea QoreChain și îți aduce recompense, care nu sunt garantate. Toate operațiunile de staking sunt tranzacții reale on-chain care poartă semnătura ta post-cuantică.

### Pune la staking cu un validator

1. Deschide **Stake**.
2. Alege un validator din listă (încărcată live din lanț, cu cel mai mic stake afișat primul, iar orice validator aflat în prezent în jail este exclus — delegarea către unul dintre aceștia nu este niciodată ce îți dorești). Validatorii la care ai deja QOR poartă o insignă *staked*.
3. Introdu o sumă. Cât timp scrii, QoreX te avertizează dacă ceea ce ar rămâne nu ar acoperi următorul comision de rețea: *„Aceasta lasă \{remaining\} QOR — mai puțin decât cei \{fee\} QOR pe care îi costă o tranzacție. Nu vei putea retrage din staking sau revendica recompense până când acest cont nu deține din nou QOR pentru comision."* Este un avertisment, nu o blocare — sunt banii tăi — dar atât retragerea din staking, cât și revendicarea costă un comision din soldul tău **lichid**, deci punerea la staking până aproape de zero blochează stake-ul până când cineva trimite QOR.
4. **Confirmă** (biometrie pe mobil). Poți pune la staking QOR aflat în vesting, până la totalul tău, dar comisionul de rețea trebuie să provină din QOR-ul tău **deblocat** — QOR-ul aflat în vesting nu poate plăti comisioane.
5. Revendică recompensele din același ecran ori de câte ori se acumulează — vezi mai jos.

:::note Nicio perioadă de blocare astăzi — așteptarea este doar la ieșire
Nu există un termen fix de ales, pentru că momentan nu există unul: delegarea rămâne activă, cu recompense care curg din blocul următor, până când ceri să anulezi delegarea — nu există o expirare de reînnoit și nicio durată minimă de staking. Singura perioadă de așteptare este la ieșire: odată ce anulezi delegarea, acel QOR intră într-o perioadă de unbonding de 21 de zile, timp în care nu produce recompense și nu poate fi mutat, înainte de a reveni în soldul tău disponibil. Mutarea unei delegări către un alt validator (redelegare) evită complet această așteptare. Versiunea de lanț v3.2.4 (pe mainnet din 23 octombrie 2026) adaugă un modul opțional de staking cu blocare în timp (vezi [Staking cu blocare în timp](/user-guide/staking-and-delegation#time-locked-staking)), dar QoreX nu are un ecran pentru el: fiecare delegare pe care o faci în QoreX este una obișnuită, fără blocare. Aceasta descrie comportamentul QoreX, nu o garanție permanentă — vezi [Există o perioadă de blocare?](/user-guide/staking-and-delegation#lock-in-period) pentru mai multe detalii.
:::

### Mută stake-ul între validatori (redelegare) {#move-stake}

Mută QOR pe care îl ai deja la staking către un alt validator — sau împarte-l între mai mulți — fără să atingi deloc coada de unbonding de 21 de zile. Stake-ul continuă să producă recompense pe tot parcursul mutării.

1. Deschide **Stake** și atinge validatorul la care se află în prezent QOR-ul tău; panoul oferă **Move stake**.
2. Alege unde ar trebui să meargă — alege o singură destinație sau mai multe deodată. Împărțirea între mai mulți validatori divide suma în mod egal, iar cifra exactă care merge către fiecare validator este afișată înainte de confirmare.
3. Confirmă cu aprobare biometrică. Fiecare destinație se mută într-o **singură tranzacție** — un singur comision, iar mutarea ajunge fie în întregime, fie deloc.

Aceasta este mutarea de făcut atunci când un validator la care ai delegat ajunge în jail sau își crește comisionul — înainte ca aceasta să existe, singura cale de ieșire era să anulezi staking-ul și să aștepți 21 de zile fără recompense; mutarea în schimb nu costă nicio așteptare și nicio recompensă pierdută.

:::caution Există o limită per pereche, iar comisionul se plătește chiar dacă o atingi
Lanțul permite cel mult **7 redelegări în desfășurare simultan pentru aceeași pereche (sursă, destinație) de validatori** — utilizarea normală nu se apropie nici pe departe de acest prag, dar QoreX verifică această limită înainte să semnezi și te avertizează dacă ai atins-o. Peste această limită, tranzacția eșuează on-chain, iar comisionul de rețea este oricum plătit, așa că nu reîncerca o mutare care a fost deja respinsă din acest motiv fără să aștepți întâi ca una existentă să se elibereze.

Încă o regulă a lanțului: stake-ul pe care tocmai l-ai mutat **către** un validator nu poate fi mutat **mai departe** de la acel validator până când mutarea care l-a adus acolo nu s-a finalizat (21 de zile) — QoreX îți spune când o mutare este refuzată din acest motiv. Îl poți totuși retrage din staking sau poți muta stake-ul care se afla deja la acel validator.
:::

### Revendicare și Revendicare și re-stake {#claim}

- **Claim** colectează recompensele în soldul tău. QoreX revendică doar de la validatorii care au efectiv recompense în așteptare.
- **Claim & restake** (buton *Claim & restake*: „Reinvestește \{amount\} QOR înapoi la aceiași validatori, într-o singură tranzacție.") revendică și deleagă recompensele direct înapoi către validatorii care le-au generat — o tranzacție, un comision. Este oferit doar atunci când QoreX poate citi detalierea pe validatori.
- **Verificarea comisionului.** Comisionul se plătește *înainte* de sosirea recompenselor. Dacă QOR-ul tău deblocat nu îl poate acoperi, QoreX se oprește înainte să semnezi și îți spune cât este necesar („Revendicarea necesită aproximativ \{fee\} QOR deblocați pentru comisionul de rețea — acesta se plătește înainte de sosirea recompenselor."); trimite puțin QOR către acea adresă și încearcă din nou. QOR-ul aflat în vesting nu poate plăti comisioane.

### Anulează delegarea

1. Deschide **Stake** și atinge validatorul. Dacă ai QOR la el, panoul oferă **Unstake** (și **Move stake**).
2. Introdu suma. Panoul arată cât ai la acel validator și, deasupra butonului **Unstake**, „Retragerea din staking durează 21 de zile până când QOR-ul poate fi mutat de tine" — vezi așteptarea de 21 de zile înainte de a confirma.
3. Confirmă cu aprobare biometrică. QOR-ul încetează imediat să producă recompense și devine din nou disponibil pentru cheltuire după finalizarea perioadei de unbonding.

### Unstaking în curs {#unbonding}

QOR-ul retras din staking părăsește atât delegarea ta, cât și soldul tău disponibil timp de 21 de zile. QoreX îl listează la **Unstaking in progress** — *„\{amount\} QOR în curs de retragere"*, fiecare intrare cu timpul rămas (*\{days\}z \{hours\}h \{minutes\}m rămase*, sau *Mai puțin de un minut rămas*, sau *Așteptarea s-a încheiat — acesta ar trebui să revină în soldul tău.*). Dacă QoreX nu poate citi când se încheie o intrare, spune acest lucru și păstrează suma în total. Dacă nodul tău nu poate fi contactat, lista rămâne așa cum era — nu apare niciodată ca „nimic în curs de retragere".

:::note Retragerea din staking când rulezi un validator
Dacă portofelul tău aparține unui operator de validator, retragerea din staking este refuzată atunci când ar coborî auto-garanția (self-bond) sub 100.000 QOR necesari: *„Retragerea unei sume atât de mari ar coborî auto-garanția validatorului tău sub cei 100.000 QOR necesari. Pragul se aplică cât timp validatorul este în funcțiune."*
:::

### Earn

Vizualizarea **Earn** rezumă stakingul tău într-un singur loc: QOR-ul tău aflat la staking, recompensele revendicabile, la câți validatori ești și ponderea din tot QOR-ul care este la staking la nivelul întregii rețele. Nu afișează nicio rată de staking — lanțul nu publică o cifră de emisie din care să se poată deriva o rată, așa că QoreX afișează *Not available* în loc de un număr pe care nu îl poate susține.

În extensie, ecranul Stake are aceleași componente (total la staking, recompense, **Claim**, **Claim & restake**, **Unstake**, **Move stake**, un selector de cont când ai mai multe conturi și avertismentul de retragere din staking).

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — mută QOR și active externe.
- [Securitate și Recuperare](/qorex/security-and-recovery) — gardieni, moștenire Legacy și asocierea dispozitivelor.
