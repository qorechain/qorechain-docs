---
slug: /dashboard/tools-hub
title: Hub de Instrumente
sidebar_label: Hub de Instrumente
sidebar_position: 11
---

# Hub de Instrumente

Pagina **Tools** adună într-un singur loc uneltele QoreChain pentru operatori și dezvoltatori, organizate în șapte file (tab-uri), în această ordine: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** și **SDK**. Fila **Information** este o prezentare generală, doar pentru citire, a programelor pentru validatori și light node — cele trei moduri de a participa (validator de geneză, light node, delegator), nivelurile de licență, noțiunile de bază despre staking și slashing, cerințele hardware, cine operează programul și un FAQ. Celelalte file sunt rezumate mai jos, împreună cu linkul către documentația completă. Pagina Tools urmează comutatorul de rețea din antet, deoarece versiunile publicate pot diferi între rețele.

Autentificați-vă pentru a folosi uneltele care înregistrează înscrieri sau trimit aplicații — vezi [Autentificare](/dashboard/overview#sign-in).

## Light Node

Rularea unui light node și înscrierea în programul său de recompense sunt două lucruri diferite, iar fila **Light Node** le păstrează separate, în loc să prezinte un singur flux de înscriere:

1. **Obțineți software-ul — funcționează de azi.** Nu este nevoie de licență, de verificare on-chain sau de aprobare; acest pas este afișat primul, indiferent de statusul licenței dumneavoastră. Fila citește manifestul live al rețelei și vă oferă comenzi gata de copiat pentru un nod QoreChain complet (descărcarea și verificarea binarului, inițializarea nodului cu genesis, îndreptarea lui către peer-ii rețelei și state-sync în loc de sincronizare de la genesis). Un light node în sine are nevoie doar de binarul `lightnode-sx` sau `lightnode-ux` — vezi [Prezentare generală Light Node](/light-node/overview). Sub comenzi, **Download the light node** listează versiunile publicate împreună cu sumele lor de control sha256 — o **Desktop edition** (include tabloul de bord web) și o **Server edition** (fără interfață grafică, linie de comandă) pe șase platforme; verificați fișierul față de suma sa de control înainte de a-l rula. Dacă nu este publicată nicio versiune pentru rețeaua selectată, panoul spune acest lucru.
2. **Verificați cerințele lanțului — Light node status.** Acest panou citește parametrii live ai lanțului (sunt parametri de guvernanță și se pot schimba fără ca această pagină să fie editată): miza delegată necesară — totalul dumneavoastră pe toți validatorii cărora le delegați, nu per validator (în prezent 1.000 QOR) — taxa de înregistrare (în prezent 1 QOR), timpul de funcționare necesar pentru recompense, cât de des este așteptat un heartbeat (și toleranța permisă) și numărul maxim de light node-uri. Opțional, puteți introduce o adresă de operator pentru a vedea dacă un light node este înregistrat pe ea, dacă raportează la timp și care sunt recompensele sale acumulate.
3. **Înscrierea la recompense nu este încă deschisă.** Participarea la cota de recompense pentru light node necesită o licență `lightnode_operator` activă, acordată on-chain, miza delegată minimă și taxa de înregistrare. Înscrierea în sine nu este deschisă (vezi [Starea programului de recompense](/light-node/overview#reward-program-status)), iar cumpărarea unei licențe nu o deschide mai devreme, deci nu există nimic la care să vă înscrieți azi; între timp, rulați și sincronizați-vă nodul. Timpul de funcționare este numărat de la blocul în care nodul dumneavoastră se înregistrează on-chain, nu mai devreme.
4. **Înregistrarea în evidență.** Dacă contul dumneavoastră deține o licență înregistrată ca activă, această filă afișează și un scurt formular — adresa de operator (`qor1…`), moniker, URL-ul endpoint-ului public și o confirmare a angajamentului de stake — apoi un sumar a ceea ce ați trimis. Acel formular înregistrează cererea dumneavoastră de înregistrare la The Qore Trust în Dashboard; **nu** trimite tranzacția de înregistrare on-chain și nu verifică lanțul. Înregistrarea on-chain se face de pe nodul însuși cu `lightnode-sx register` (vezi [Înregistrare și Licențiere](/light-node/registration-and-licensing)) și reușește doar după ce lanțul arată o acordare activă, stake-ul este deja blocat (bonded) de la adresa dumneavoastră de operator, iar înscrierea este deschisă.

Pentru imaginea completă, vezi [Prezentare generală Light Node](/light-node/overview) și [Înregistrare și Licențiere](/light-node/registration-and-licensing).

## Node Registration

Fila **Node Registration** înregistrează o înscriere de validator la The Qore Trust în Dashboard. Ea nu creează în sine validatorul on-chain; acest lucru se face de pe propriul nod (pașii 1 și 5 de mai jos). Cerințe preliminare și pași:

1. **Înregistrați-vă mai întâi cheia PQC — din CLI, pe propriul nod de validator.** Un validator trebuie să efectueze el însuși înregistrarea cheii PQC — aceasta nu se face automat — înainte de a aplica pentru sau de a folosi o licență și înainte de a crea validatorul. Vezi [Rularea unui Validator](/developer-guide/running-a-validator#pqc-key-registration) pentru comanda CLI.
2. **Confirmați că sunteți licențiat.** Formularul necesită o licență de validator înregistrată ca activă în contul dumneavoastră. **Lanțul** este cel care decide dacă `create-validator` este acceptat și necesită acordarea de operator on-chain: o licență achiziționată prin **Buy License** este înregistrată la noi, iar acordarea on-chain este un pas separat, manual, care urmează. Verificați **Validator Readiness** (în fila Validator Application) pentru a vedea ce recunoaște lanțul în prezent. Dacă nu sunteți încă licențiat, această filă face trimitere către **Buy License** — licențele de validator necesită în prealabil o [Aplicație de Validator](#validator-application) aprobată.
3. **Completați formularul de înregistrare.** Furnizați adresa validatorului sau cheia publică de consens, un moniker, o rată de comision (în intervalul permis de licența dumneavoastră) și, opțional, un endpoint public. Dacă licențele dumneavoastră includ lanțuri cross-network, selectați pentru care dintre ele va oferi servicii acest validator.
4. **Confirmați cerința de self-stake.** Pragul minim de self-stake al validatorului este fix, de 100.000 QOR — o constantă la nivel de protocol, nu o setare ajustabilă — supus unei perioade de unbonding, cu penalizări (slashing) pentru downtime sau double-signing. Confirmați, apoi trimiteți pentru a vă înregistra.
5. **Sincronizați și creați validatorul.** Înregistrarea aici vă înregistrează validatorul; tot dumneavoastră trebuie să vă aduceți nodul la vârful curent al lanțului și să trimiteți `create-validator`, semnat hibrid PQC ca orice tranzacție QoreChain — cheia de la pasul 1 este cea care face semnătura validă.
6. **Confirmați și blocați (bond) stake-ul.** Un panou de sumar arată înregistrarea (moniker, adresă de validator, comision, intenția de self-stake, lanțuri cross-network, status) și vă solicită să blocați self-stake-ul pentru a intra în setul activ de validatori. Blocarea în sine are loc pe nodul dumneavoastră, cu tranzacția co-semnată post-cuantic, nu în Dashboard.

Staking-ul și crearea validatorului au loc doar pe lane-ul nativ de tranzacții al QoreChain — nu există nicio cale de a înregistra sau bloca un validator printr-un portofel EVM conectat, precum MetaMask.

Vezi [Rularea unui Validator](/developer-guide/running-a-validator) și [Staking și Validatori](/dashboard/staking-and-validators).

## Rollups

Solicitați un rollup alimentat de QoreChain. Formularul vă permite să denumiți rollup-ul și să indicați mașina virtuală (EVM, CosmWasm sau SVM), stratul de disponibilitate a datelor, tokenul de gas, modelul de sequencer și ținta de settlement dorite. Trimiterea înregistrează o cerere de provizionare pe care The Qore Trust o revizuiește; nu creează rollup-ul on-chain. Opțiunile sunt mai largi decât ceea ce modulul de rollup on-chain acceptă în prezent. Pentru a înregistra singur un rollup on-chain, vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup); pentru concepte, vezi [Prezentare generală Rollups](/rollups/overview).

## SDK

Un ghid rapid și un hub de referință pentru dezvoltarea pe QoreChain prin cod. Secțiunea prezintă pașii de instalare și fragmente de cod gata de copiat pentru conectare, derivarea conturilor pe cele trei runtime-uri, citirea stării, trimiterea transferurilor și semnarea quantum-safe, plus un tabel cu pachetele pe limbaje și linkuri către repository, exemple și explorer. Vezi [Prezentare generală QoreChain SDK](/sdk/overview) și [Instalare](/sdk/install).

## Validator Application {#validator-application}

Aplicați pentru a deveni Genesis Validator:

1. **Introduceți detaliile entității.** Denumirea legală a entității, țara/jurisdicția și o adresă de email de contact.
2. **Alegeți tier-ul dorit.** Selectați din catalogul de tier-uri de validator (fiecare tier listează numărul de sloturi și setul de funcționalități) — acesta este tier-ul pe care intenționați să-l licențiați odată aprobat, nu este încă o achiziție.
3. **Descrieți infrastructura dumneavoastră.** Regiunea infrastructurii și detalii despre hardware/datacenter.
4. **Explicați motivația.** O scurtă declarație despre experiența echipei dumneavoastră cu validatori/infrastructură și de ce doriți să rulați un Genesis Validator QoreChain.
5. **Confirmați conformitatea și trimiteți.** Confirmați că verificarea KYC/AML a entității solicitante și a beneficiarilor reali este necesară înainte ca o licență să fie acordată, apoi trimiteți.
6. **Urmăriți statusul.** Fila afișează aplicația dumneavoastră ca fiind în curs de revizuire, aprobată sau neaprobată cu un motiv (cu opțiunea de a o revizui și retrimite). Odată ce aplicația este în așteptare sau aprobată, un panou live **Validator Readiness** verifică trei lucruri direct în raport cu lanțul, nu cu ce ați achiziționat: înregistrarea cheii dumneavoastră PQC, self-bond-ul (fix, 100.000 QOR — doar sold disponibil pentru cheltuire, fondurile în vesting nu contează) și dacă licența dumneavoastră de operator a fost efectiv acordată on-chain și este în prezent valabilă (nu este suspendată și nu a depășit data de expirare — licențele expiră la o înălțime de bloc, iar dacă vârful lanțului nu poate fi citit, o licență care expiră este raportată ca *nu s-a putut verifica*, nu ca valabilă). Fiecare verificare raportează una din trei stări — îndeplinit, neîndeplinit încă, sau *nu s-a putut verifica* atunci când lanțul nu poate fi accesat — iar o citire eșuată nu este afișată niciodată ca „nu aveți acest lucru”, deoarece asta v-ar trimite să refaceți ceva ce dețineți deja. Odată aprobată, puteți continua către **Buy License** pentru a achiziționa o licență de validator.

Vezi [Rularea unui Validator](/developer-guide/running-a-validator).

## Buy License

Achiziționați licențele necesare pentru a rula infrastructură de rețea:

1. **Introduceți adresa care va fi licențiată.** Câmpul **QoreChain address** din partea de sus este obligatoriu pentru fiecare achiziție: introduceți adresa `qor1…` căreia licența ar trebui să-i fie acordată on-chain. Folosiți o adresă pe care o controlați și o veți păstra — acordarea se leagă de ea, iar schimbarea ulterioară necesită suportul. O licență nu poate fi comandată fără una.
2. **Alegeți o rețea de plată.** Sub **Pay with USDT on:** selectați ERC-20, BEP-20 sau TRC-20.
3. **Alegeți ce cumpărați.** O licență de light node este disponibilă pentru oricine. Licențele de validator (din catalogul de tier-uri) se deblochează doar după ce [Aplicația de Validator](#validator-application) vă este aprobată. Add-on-urile cross-network extind o licență de validator la lanțuri suplimentare, cu preț per lanț pe an — selectați lanțurile dorite, apoi cumpărați.
4. **Finalizați plata.** Fiecare achiziție vă duce la un pas de plată care confirmă suma și rețeaua și verifică plata on-chain înainte ca licența să fie înregistrată ca plătită.
5. **Așteptați acordarea on-chain, apoi înregistrați-vă.** După plată, licența afișează **Paid — awaiting on-chain grant**. Acordările sunt emise manual, în loturi, deci nu sunt instantanee. Statusul se schimbă în **Active** doar după ce lanțul însuși confirmă acordarea. Înregistrarea pe lanț verifică lanțul, nu evidențele noastre, deci o înregistrare încercată înainte ca acordarea să aibă loc va fi refuzată. Odată ce insigna afișează **Active**, reveniți la **Light Node** sau **Node Registration** pentru înregistrarea corespunzătoare.

:::note Licențe cumpărate înainte ca adresa să devină obligatorie
Dacă ați cumpărat o licență înainte ca adresa să fie colectată, fila Buy License se deschide cu **This licence needs a QoreChain address** — introduceți adresa și selectați **Save address**. Până când este salvată, licența nu poate fi acordată.
:::

Pentru modul în care funcționează licențierea în rețea, vezi [Licențiere Chain](/architecture/chain-licensing).
