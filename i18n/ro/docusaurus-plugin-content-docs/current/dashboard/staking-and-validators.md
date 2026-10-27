---
slug: /dashboard/staking-and-validators
title: Staking și Validatori
sidebar_label: Staking și Validatori
sidebar_position: 8
---

# Staking și Validatori

Această pagină descrie staking-ul din Dashboard: delegarea QOR-ului tău către un validator, eliberarea lui (unbonding) și revendicarea recompenselor. Acțiunile se află pe pagina **Wallet** (tab-urile **Stake / Delegate** și **Rewards**) pe **mainnet**, cu portofelul tău QoreX conectat. Pentru a compara mai întâi validatorii, folosește pagina doar pentru citire [Validators](/dashboard/validators). Pentru conceptele din spatele delegării și recompenselor, vezi [Staking și Delegare](/user-guide/staking-and-delegation).

## Inovații {#innovations}

- **Dashboard-ul nu deține niciodată o cheie de staking.** Compui cererea (ce validator, cât de mult) pe Dashboard, iar QoreX o reconstruiește, o afișează, o semnează cu semnătura hibridă ML-DSA-87 și o transmite. Dashboard-ul trimite doar parametri printr-un link `qorex://tx?...` și află doar hash-ul tranzacției. Fluxul este același ca [fluxul de trimitere](/dashboard/wallet#send-mainnet).
- **Doar lane-ul nativ, permanent.** Staking-ul, delegarea și operațiunile de validator au loc exclusiv pe lane-ul nativ (Cosmos), cu semnătura hibridă post-cuantică, niciodată printr-un precompile EVM. O adresă conectată prin MetaMask poate primi și, cu o fereastră EVM deschisă, poate trimite QOR, dar nu poate face staking. Doar o adresă conectată prin QoreX poate.
- **Ordinea validatorilor răspândește stake-ul.** Sunt listați doar validatorii bonded, fără jail, cei mai mici primii. Primul loc este tras aleatoriu pe server din jumătatea mai mică, astfel încât cel mai mare validator nu este niciodată implicit.
- **Pragul pentru light node este un total unic.** „Currently bonded" este afișat față de pragul de stake pentru light node, calculat cumulat pe toți validatorii tăi, astfel încât un deficit poate fi împărțit între validatori.
- **Timpul de unbonding este afișat acolo unde contează.** Perioada de unbonding de 21 de zile este citită din lanț și afișată o dată la Delegate și de două ori la Unbond, intenționat, pentru că acolo au oamenii nevoie de ea.
- **Verificarea comisionului înainte de semnare.** Panoul citește QOR-ul tău disponibil (fără monedele în vesting și cele bonded) și păstrează **Continue in QoreX** dezactivat până când comisionul poate fi plătit.

## Cum se folosește {#how-to-use}

Condiții prealabile: autentificat, antetul pe **Mainnet**, [confirmarea](/dashboard/overview#risk-acknowledgement) acceptată și un portofel QoreX conectat, așa cum este descris în [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet).

### Alege un validator

Deschide [Validators](/dashboard/validators) pentru a compara comisionul, puterea de vot și statusul. Pagina se află la `/validators` pe Dashboard: necesită să fii autentificat, nu are link în bara laterală (scrie adresa sau urmează link-ul de aici) și urmează rețeaua selectată în antet. Coloana sa APY este citită din lanț și poartă nota „variable, not guaranteed, lock bonuses not included" (sau afișează „From fees"); nicio cifră nu este promisă. Când alegi unul, ia în considerare:

- **Comisionul:** o rată mai mică lasă mai multe recompense pentru tine, dar operatorii sustenabili au nevoie de o cotă rezonabilă.
- **Statusul:** un validator este în jail atunci când semnează mai puțin de 5% din blocurile dintr-o fereastră de 10.000 de blocuri, adică aproximativ 8,3 ore de blocuri ratate pe mainnet la circa 3,1 secunde per bloc. O întemnițare (jailing) pentru downtime durează un interval fix de **600 de secunde** și îl costă pe validator **1% din stake-ul său**; dublarea semnăturii (double-signing) este o abatere separată, mai gravă, care taie **5%**. Aceștia sunt parametrii live ai lanțului (verificați la 27 octombrie 2026).
- **Puterea de vot:** distribuirea stake-ului între mai mulți validatori susține descentralizarea. Ordinea din panoul Delegate ajută în acest sens.

### Delegă {#delegate}

1. Pe **Wallet**, deschide tab-ul **Stake / Delegate** și găsește panoul **Delegate QOR**.
2. Citește caseta de informații: **Currently bonded** față de **Light-node threshold** și dacă îl atingi. Pragul este verificat pe baza stake-ului tău total delegat, cumulat pe toți validatorii. Nu există o modalitate de a „delega direct la un light node": delegarea vizează întotdeauna un validator, iar eligibilitatea pentru light node este o verificare separată asupra totalului tău.
3. Deschide dropdown-ul **Validator** și alege unul. Prima intrare este trasă aleatoriu din jumătatea mai mică a validatorilor și se poate schimba la reîncărcarea paginii; restul sunt listați de la cel mai mic stake la cel mai mare. Validatorii în jail nu sunt oferiți.
4. Introdu o **Amount (QOR)**.
5. Citește nota de sub sumă: eliberarea (unbonding) durează 21 de zile, iar QOR-ul blocat nu poate fi mutat sau vândut până când trece această perioadă.
6. Dacă panoul avertizează că adresa nu are suficient QOR disponibil pentru comision, trimite-i mai întâi puțin QOR disponibil. **Continue in QoreX** rămâne dezactivat până la rezolvarea acestei situații.
7. Selectează **Continue in QoreX** (afișează **Preparing...** cât timp cererea este creată).
8. Panoul arată „Approve it in QoreX" cu **Open QoreX**, ID-ul cererii și **Approve in the browser extension** atunci când extensia este detectată. QoreX afișează validatorul și suma înainte de semnare; nimic nu este trimis până când nu aprobi.
9. Aprobă în QoreX. Acesta construiește, semnează și transmite delegarea.

**Exemplu minimal:** deleagă 10 QOR primului validator din listă și aprobă în QoreX.

:::note Staking-ul cu blocare în timp nu face parte din Dashboard
Versiunea v3.2.4 adaugă un modul opțional de staking cu blocare în timp (pe mainnet din 23 octombrie 2026, pe testnet din 19 octombrie 2026); vezi [Staking cu blocare în timp](/user-guide/staking-and-delegation#time-locked-staking). Nici Dashboard-ul, nici QoreX nu au un ecran pentru el. Delegările făcute aici sunt delegări obișnuite, fără blocare; singura așteptare este eliberarea (unbonding) de 21 de zile la ieșire.
:::

### Redelegă {#redelegate}

Dashboard-ul nu are un panou Redelegate. **QoreX mută stake-ul între validatori direct** (aplicația 1.0.8+ și extensia 0.2.6+): fără așteptarea de 21 de zile pentru eliberare, fără recompense pierdute, și poate împărți o mutare către mai mulți validatori destinație într-o singură tranzacție. Deschide **Stake** în QoreX, atinge validatorul pe care vrei să-l părăsești și alege unde ar trebui să meargă stake-ul; vezi [Mută stake-ul între validatori](/qorex/portfolio-and-staking#move-stake).

Pe o versiune mai veche de QoreX, fără această funcție, mută stake-ul în doi pași: [anulează delegarea](#undelegate), așteaptă să treacă perioada de unbonding (QOR-ul nu poate fi mutat și nu produce recompense în acest timp), apoi [deleagă](#delegate) către noul validator. Această soluție temporară costă 21 de zile de recompense și mai multe comisioane, așa că actualizează QoreX dacă poți.

### Anulează delegarea {#undelegate}

:::caution Perioadă de eliberare de 21 de zile
QOR-ul cu delegarea anulată nu ajunge la tine astăzi. Intră mai întâi într-o **perioadă de eliberare (unbonding) de 21 de zile**, timp în care nu produce recompense și nu poate fi mutat sau vândut. Panoul afișează acest lucru de două ori, intenționat, o dată ca subtitlu și încă o dată chiar deasupra butonului de confirmare.
:::

1. Pe **Wallet**, deschide **Stake / Delegate** și derulează la panoul **Unbond QOR**, sub Delegate.
2. Dacă nu ai delegări active de la această adresă, panoul îți spune asta și se oprește aici.
3. Deschide **Unbond from** și alege delegarea pe care vrei să o reduci. Acesta listează doar validatorii la care ești delegat, cu suma blocată.
4. Introdu o sumă sau selectează **Unbond all X QOR** pentru a completa suma totală blocată.
5. Introducerea unei sume mai mari decât cea blocată blochează trimiterea.
6. Citește al doilea avertisment de deasupra butonului de confirmare: QOR-ul ajunge în 21 de zile, nu astăzi.
7. Dacă adresa nu poate acoperi comisionul (monedele bonded nu îl pot plăti), panoul avertizează și dezactivează butonul.
8. Selectează **Continue in QoreX** (**Preparing...** cât timp cererea este creată), apoi aprobă în QoreX prin **Open QoreX** sau **Approve in the browser extension**.

QOR-ul devine din nou disponibil pentru cheltuire abia după ce se încheie perioada de unbonding de 21 de zile.

### Revendică recompense {#claim}

1. Pe **Wallet**, deschide tab-ul **Rewards**.
2. Panoul **Staking rewards** citește recompensele tale acumulate la fiecare validator la care ești delegat. Dacă nu ai nimic la staking de la această adresă, îți spune asta.
3. În caz contrar, arată totalul care așteaptă, plus câte o linie per validator. Recompensele se acumulează continuu și nu se pierd prin așteptare.
4. Selectează **Claim in QoreX**. Aceasta revendică de la **toți** validatorii deodată; nu există o revendicare per validator.
5. Aprobă revendicarea în QoreX (**Open QoreX** sau **Approve in the browser extension**).

## Cum se accesează {#how-to-access}

- **Unde:** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet), tab-urile **Stake / Delegate** și **Rewards**. Este necesară autentificarea.
- **Rețea:** doar mainnet, cu un portofel QoreX asociat. Portofelele de testnet nu au un ecran de staking.
- **Portofel:** QoreX (aplicația sau extensia). Keplr și MetaMask nu pot face staking din Dashboard.
- **Costuri:** comisionul de rețea, plătit din QOR disponibil (prag minim 0.1 uqor per gas). Dashboard-ul nu percepe nimic.
- **Fonduri:** soldurile în vesting se iau în calcul pentru ceea ce poți delega, dar nu pot plăti comisionul.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețea |
| --- | --- | --- |
| Delegate, Unbond, Rewards | `dashboard.qorechain.io/wallet` | Mainnet |
| Compară validatorii | `dashboard.qorechain.io/validators`, vezi [Validators](/dashboard/validators) | Urmează rețeaua din antet |
| Mută stake-ul între validatori | QoreX, vezi [Portofoliu și Staking](/qorex/portfolio-and-staking#move-stake) | Mainnet |

## Limite și probleme cunoscute {#limits}

- **Nu este în Dashboard:** redelegarea (folosește QoreX) și staking-ul cu blocare în timp.
- **Fără staking pe portofelele de testnet** în Dashboard.
- **Estimările sunt aproximative:** estimarea comisionului și pragul pentru light node afișate în panou sunt valori încorporate în Dashboard, nu citite din lanț în acel moment. QoreX afișează comisionul exact înainte de semnare.
- **Unbonding-ul durează 21 de zile** și nu poate fi scurtat.
- **Revendicarea este pentru toți validatorii deodată.**

## Legături conexe

- [Validators](/dashboard/validators) - compară validatorii, comisionul și randamentul variabil.
- [Staking și Delegare](/user-guide/staking-and-delegation) - concepte complete de staking.
- [Folosește portofelul pe mainnet](/dashboard/wallet#mainnet) - conectează QoreX înainte de a face staking.
- [Explorer Validatori](/dashboard/explorer#validators) - răsfoiește validatorii fără portofel.
- [Nodes & Validators](/dashboard/tools-hub) - aplică pentru a rula propriul validator.
