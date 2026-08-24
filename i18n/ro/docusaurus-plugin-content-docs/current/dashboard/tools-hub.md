---
slug: /dashboard/tools-hub
title: Hub de Instrumente
sidebar_label: Hub de Instrumente
sidebar_position: 11
---

# Hub de Instrumente

Pagina **Tools** adună într-un singur loc uneltele QoreChain pentru operatori și dezvoltatori, organizate pe file (tab-uri). De aici puteți înregistra infrastructură, implementa un rollup, ajunge la SDK, aplica pentru a deveni validator și achiziționa licențele necesare pentru aceste roluri. Fiecare secțiune este rezumată mai jos, împreună cu linkul către documentația completă.

Conectați-vă portofelul pentru a folosi uneltele care înregistrează infrastructură sau trimit aplicații — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet).

## Light Node

Rularea unui light node și înscrierea în programul său de recompense sunt două lucruri diferite, iar fila **Light Node** le păstrează separate, în loc să prezinte un singur flux de înscriere:

1. **Porniți-vă nodul — funcționează de azi.** Nu este nevoie de licență, de verificare on-chain sau de aprobare; acest pas este afișat primul, indiferent de statusul licenței dumneavoastră. Citește manifestul live al rețelei și vă oferă comenzi gata de copiat pentru a descărca și verifica binarul, a inițializa nodul cu genesis, a-l îndrepta către peer-ii rețelei și a face state-sync în loc de sincronizare de la genesis.
2. **Verificați statusul programului de recompense.** Înscrierea în cota de recompense pentru light node este un pas separat, condiționat on-chain: o licență `lightnode_operator` activă, acordată on-chain, o cantitate minimă de QOR delegat — totalul dumneavoastră pe toți validatorii cărora le delegați, nu per validator, citit live din staking — și o mică taxă de înregistrare on-chain. **Înscrierea nu este încă deschisă**, iar cumpărarea unei licențe nu o deschide mai devreme, deci nu există nimic de completat azi; această filă afișează cerința ca un status de verificat, nu ca un formular de trimis, până când se deschide.
3. **Înregistrați-vă odată ce licența este acordată on-chain.** O licență achiziționată prin **Buy License** este înregistrată mai întâi la noi — acordarea on-chain este un pas separat, iar înregistrarea este refuzată până când acea acordare are loc (vezi nota despre Buy License mai jos). Odată ce s-a produs, această filă înlocuiește panoul de status cu un formular de înregistrare: adresa dumneavoastră de operator (`qor1…`), un moniker și un URL de endpoint public, plus o confirmare a angajamentului de stake.
4. **Confirmați și blocați (bond) stake-ul.** După trimitere, un panou de sumar confirmă înregistrarea (moniker, adresă de operator, endpoint, intenția de stake, status) și vă solicită să blocați stake-ul confirmat de la adresa dumneavoastră de operator, odată ce eligibilitatea se deschide.

Pentru imaginea completă, vezi [Prezentare generală Light Node](/light-node/overview) și [Înregistrare și Licențiere](/light-node/registration-and-licensing).

## Node Registration

Fila **Node Registration** înregistrează un nod de validator on-chain:

1. **Înregistrați-vă mai întâi cheia PQC — din CLI, pe propriul nod de validator.** Acest lucru nu este automat, așa cum se întâmplă la prima tranzacție a unui cont obișnuit: un validator trebuie să efectueze el însuși înregistrarea cheii PQC, înainte de a aplica pentru sau de a folosi o licență și înainte de a crea validatorul. Vezi [Rularea unui Validator](/developer-guide/running-a-validator#pqc-key-registration) pentru comanda CLI.
2. **Confirmați că sunteți licențiat.** Este necesară o licență de validator activă înainte de a vă putea înregistra aici. O licență achiziționată prin **Buy License** este înregistrată la noi; acordarea on-chain este un pas separat, iar înregistrarea este refuzată până când acea acordare are loc. Dacă nu sunteți încă licențiat, această filă face trimitere către **Buy License** — licențele de validator necesită în prealabil o [Aplicație de Validator](#validator-application) aprobată.
3. **Completați formularul de înregistrare.** Furnizați adresa validatorului sau cheia publică de consens, un moniker, o rată de comision (în intervalul permis de licența dumneavoastră) și, opțional, un endpoint public. Dacă licențele dumneavoastră includ lanțuri cross-network, selectați pentru care dintre ele va oferi servicii acest validator.
4. **Confirmați cerința de self-stake.** Pragul minim de self-stake al validatorului este fix, de 100.000 QOR — o constantă la nivel de protocol, nu o setare ajustabilă — supus unei perioade de unbonding, cu penalizări (slashing) pentru downtime sau double-signing. Confirmați, apoi trimiteți pentru a vă înregistra.
5. **Sincronizați și creați validatorul.** Înregistrarea aici vă înregistrează validatorul; tot dumneavoastră trebuie să vă aduceți nodul la vârful curent al lanțului și să trimiteți `create-validator`, semnat hibrid PQC ca orice tranzacție QoreChain — cheia de la pasul 1 este cea care face semnătura validă.
6. **Confirmați și blocați (bond) stake-ul.** Un panou de sumar arată înregistrarea (moniker, adresă de validator, comision, intenția de self-stake, lanțuri cross-network, status) și vă solicită să blocați self-stake-ul pentru a intra în setul activ de validatori.

Staking-ul și crearea validatorului au loc doar pe lane-ul nativ de tranzacții al QoreChain — nu există nicio cale de a înregistra sau bloca un validator printr-un portofel EVM conectat, precum MetaMask.

Vezi [Rularea unui Validator](/developer-guide/running-a-validator) și [Staking și Validatori](/dashboard/staking-and-validators).

## Rollups

Implementați propriul rollup pe infrastructura QoreChain. Formularul de configurare vă permite să denumiți rollup-ul și să alegeți mașina sa virtuală (EVM, CosmWasm sau SVM), stratul de disponibilitate a datelor, tokenul de gas, modelul de sequencer și ținta de settlement. După ce trimiteți, rollup-ul este provizionat în urma unei revizuiri, înainte de a deveni live. Vezi [Prezentare generală Rollups](/rollups/overview) și [Implementarea unui Rollup](/rollups/deploying-a-rollup).

## SDK

Un ghid rapid și un hub de referință pentru dezvoltarea pe QoreChain prin cod. Secțiunea prezintă pașii de instalare și fragmente de cod gata de copiat pentru conectare, derivarea conturilor pe cele trei runtime-uri, citirea stării, trimiterea transferurilor și semnarea quantum-safe, plus un tabel cu pachetele pe limbaje și linkuri către repository, exemple și explorer. Vezi [Prezentare generală QoreChain SDK](/sdk/overview) și [Instalare](/sdk/install).

## Validator Application {#validator-application}

Aplicați pentru a deveni Genesis Validator:

1. **Introduceți detaliile entității.** Denumirea legală a entității, țara/jurisdicția și o adresă de email de contact.
2. **Alegeți tier-ul dorit.** Selectați din catalogul de tier-uri de validator (fiecare tier listează numărul de sloturi și setul de funcționalități) — acesta este tier-ul pe care intenționați să-l licențiați odată aprobat, nu este încă o achiziție.
3. **Descrieți infrastructura dumneavoastră.** Regiunea infrastructurii și detalii despre hardware/datacenter.
4. **Explicați motivația.** O scurtă declarație despre experiența echipei dumneavoastră cu validatori/infrastructură și de ce doriți să rulați un Genesis Validator QoreChain.
5. **Confirmați conformitatea și trimiteți.** Confirmați că verificarea KYC/AML a entității solicitante și a beneficiarilor reali este necesară înainte ca o licență să fie acordată, apoi trimiteți.
6. **Urmăriți statusul.** Fila afișează aplicația dumneavoastră ca fiind în curs de revizuire, aprobată sau neaprobată cu un motiv (cu opțiunea de a o revizui și retrimite). Odată ce aplicația este în așteptare sau aprobată, un panou live **Validator Readiness** verifică trei lucruri direct în raport cu lanțul, nu cu ce ați achiziționat: înregistrarea cheii dumneavoastră PQC, self-bond-ul (fix, 100.000 QOR — doar sold disponibil pentru cheltuire, fondurile în vesting nu contează) și dacă licența dumneavoastră de operator a fost efectiv acordată on-chain. Fiecare verificare raportează una din trei stări — îndeplinit, neîndeplinit încă, sau *nu s-a putut verifica* atunci când lanțul nu poate fi accesat — iar o citire eșuată nu este afișată niciodată ca „nu aveți acest lucru”, deoarece asta v-ar trimite să refaceți ceva ce dețineți deja. Odată aprobată, puteți continua către **Buy License** pentru a achiziționa o licență de validator.

Vezi [Rularea unui Validator](/developer-guide/running-a-validator).

## Buy License

Achiziționați licențele necesare pentru a rula infrastructură de rețea:

1. **Introduceți adresa care va fi licențiată.** Furnizați adresa `qor1…` căreia licența ar trebui să-i fie acordată on-chain — folosiți adresa cu care veți opera efectiv nodul, deoarece aceasta este cea pe care o verifică rețeaua.
2. **Alegeți o rețea de plată.** Selectați USDT pe ERC-20, BEP-20 sau TRC-20.
3. **Alegeți ce cumpărați.** O licență de light node este disponibilă pentru oricine. Licențele de validator (din catalogul de tier-uri) se deblochează doar după ce [Aplicația de Validator](#validator-application) vă este aprobată. Add-on-urile cross-network extind o licență de validator la lanțuri suplimentare, cu preț per lanț pe an — selectați lanțurile dorite, apoi cumpărați.
4. **Finalizați plata.** Fiecare achiziție vă duce la un pas de plată care confirmă suma și rețeaua și verifică plata on-chain înainte ca licența să fie marcată activă în evidențele noastre.
5. **Așteptați acordarea on-chain, apoi înregistrați-vă.** O licență afișată aici ca activă a fost înregistrată la noi — acordarea care o face recunoscută on-chain este un pas separat. Înregistrarea verifică lanțul, nu evidențele noastre, deci o înregistrare încercată înainte ca acordarea să aibă loc va fi refuzată. Odată ce acordarea este confirmată, reveniți la **Light Node** sau **Node Registration** pentru a finaliza înregistrarea on-chain corespunzătoare.

Pentru modul în care funcționează licențierea în rețea, vezi [Licențiere Chain](/architecture/chain-licensing).
