---
slug: /dashboard/tools-hub
title: Hub de Instrumente
sidebar_label: Hub de Instrumente
sidebar_position: 11
---

# Hub de Instrumente

Pagina **Tools** adună într-un singur loc uneltele QoreChain pentru operatori și dezvoltatori, în șase file (tab-uri), în această ordine: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** și **SDK**. Pagina urmează comutatorul de rețea din antet: verificările pe lanț, descărcările și statusul nodurilor sunt citite din rețeaua pe care ați selectat-o. Licențele se vând **doar pe mainnet** (vezi [Light Node](#light-node)).

Autentificați-vă pentru a folosi uneltele care înregistrează înscrieri, trimit aplicații sau preiau plăți; vezi [Autentificare](/dashboard/overview#sign-in).

## Validator Program

O prezentare generală, doar pentru citire, a **QoreChain Validator Program**, modul în care validatorii intră în rețea: ce oferă programul (acordarea de operator on-chain, delegare din stake controlat de Association și o bursă în QOR pentru operatorii independenți care respectă nivelurile de serviciu), ce cere, procesul de selecție și un FAQ. Parametrii de protocol din această filă (timpul de unbonding, slashing-ul, numărul maxim de validatori) sunt citiți live din lanț; regulile programului (self-stake-ul de 100.000 QOR, intervalul de comision, bursa) aparțin Association și sunt marcate ca atare. Validatorii nu cumpără un pachet: aplică și plătesc o **taxă de program de $1,000** doar după ce sunt selectați.

## Validator Application {#validator-application}

Aplicați la Validator Program:

1. **Completați aplicația.** Numele entității, jurisdicția și adresa de email de contact; **adresa de operator** (`qor1…`, contul din care veți rula `create-validator`: acordarea de operator on-chain este emisă către această adresă); furnizorul de hosting, regiunea și tipul; rețelele pe care le operați deja; opțional, adresa validatorului dumneavoastră de testnet și infrastructura publică pe care o oferiți (RPC public, snapshot-uri, arhivă); traseul (standard, sau global pentru locurile rezervate); și acceptarea termenilor programului. Aplicarea este gratuită.
2. **Revizuire și perioadă de probă pe testnet.** Aplicația apare ca **Submitted** cât timp este revizuită. Aplicațiile care merg mai departe rulează un validator pe testnet-ul diana pentru o perioadă de probă de 14 zile, afișată ca **Testnet trial**.
3. **Selecția și taxa de program.** O aplicație selectată afișează **Selected** cu un buton **Pay $1,000**. Pasul de plată funcționează ca pentru o licență de light node (USDT pe ERC-20, BEP-20 sau TRC-20, verificat on-chain). Taxa este legată de adresa de operator din aplicația dumneavoastră; nu poate fi plătită pentru altă adresă. Aprobarea și plata sunt întotdeauna afișate separat: o aplicație poate fi selectată și încă neplătită.
4. **Acordarea de operator on-chain.** După plată, Association emite on-chain acordarea `validator_operator` către adresa dumneavoastră de operator. Acordările sunt semnate manual, în loturi, deci nu sunt instantanee. Fila afișează **Operator grant on chain** imediat ce lanțul o are și **In the active set** după ce validatorul dumneavoastră este blocat (bonded).

Din momentul în care aplicația este trimisă, un panou **Validator Readiness** verifică direct în lanț, pentru adresa de operator: o cheie post-cuantică înregistrată, suficienți QOR disponibili pentru self-stake, acordarea de operator și dacă validatorul este blocat (bonded). Rulați din timp [înregistrarea cheii PQC](/developer-guide/running-a-validator#pqc-key-registration) pe propriul nod: nimeni nu înregistrează acea cheie în locul dumneavoastră.

Aplicațiile aprobate în cadrul ofertei anterioare pentru validatori (înainte de octombrie 2026) apar ca **Earlier application**; Association îi contactează direct pe acei aplicanți.

## Light Node {#light-node}

Tot ce îi trebuie unui operator de light node, de la licență până la un nod înregistrat on-chain.

1. **Cumpărați licența (mainnet).** O licență de light node costă **$50**, plătită în USDT pe ERC-20, BEP-20 sau TRC-20 și verificată on-chain. Înainte de plată, introduceți adresa `qor1…` căreia trebuie să-i fie acordată licența; folosiți un cont ale cărui cuvinte de recuperare le dețineți (propriile cuvinte, Keplr sau `qorechaind`), ideal unul folosit doar pentru nod. Cu antetul setat pe **testnet**, nu se vinde nimic: licențele de light node pe testnet sunt gratuite și acordate de echipa QoreChain.
2. **Așteptați acordarea on-chain.** După plată, licența afișează **Paid, awaiting on-chain grant**; se schimbă în **Active on chain** doar când lanțul confirmă acordarea `lightnode_operator`. Acordările sunt semnate manual, în loturi.
3. **Instalați și înregistrați nodul.** Fila listează versiunile publicate pentru rețeaua dumneavoastră împreună cu sumele lor de control (server edition `lightnode-sx`, desktop edition `lightnode-ux`, pe Linux, macOS și Windows) și pașii pentru versiunea curentă: setați o parolă (passphrase) pentru keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (adaugă contul pentru care este licența), `lightnode-sx register` (atașează cheia post-cuantică a nodului și îl înregistrează, adăugând `--delegate-to <qorvaloper…>` dacă adresei îi lipsește stake-ul necesar), apoi `lightnode-sx start` și `lightnode-sx status`. Pașii sunt afișați ca actuali doar când manifestul de release al rețelei publică o versiune care îi suportă, iar fila spune dacă înregistrarea este deschisă în acea rețea.
4. **Notificări pentru adresa dumneavoastră.** Fila avertizează când adresa licenței este unul dintre propriile portofele custodiale din Dashboard (Dashboard-ul deține acea cheie, deci un nod nu poate semna cu ea) și semnalează când adresa are deja o cheie post-cuantică on-chain (nodul o refolosește dacă a fost derivată din cuvintele dumneavoastră de recuperare, altfel refuză și recomandă un cont dedicat).
5. **Status.** Un panou citește lanțul: cerințele în vigoare (taxa de înregistrare, miza delegată, timpul de funcționare, fereastra de heartbeat, numărul maxim de light node-uri) și, pentru o adresă, dacă un light node este înregistrat pe ea și dacă raportează la timp.

Vezi [Prezentare generală Light Node](/light-node/overview) și [Înregistrare și Licențiere](/light-node/registration-and-licensing).

:::note Licențe cumpărate înainte ca adresa să devină obligatorie
Dacă ați cumpărat o licență înainte ca adresa să fie colectată, fila se deschide cu **This licence needs a QoreChain address**: introduceți adresa și selectați **Save address**. Până când este salvată, licența nu poate fi acordată.
:::

## Node Registration

Înregistrează detaliile validatorului dumneavoastră la Association. Nu creează validatorul on-chain; acest lucru îl faceți de pe propriul nod cu `create-validator`.

Formularul se deschide după ce lanțul arată o acordare `validator_operator` activă pentru adresa dumneavoastră de operator și dețineți o aplicație selectată în Validator Program (sau o licență de validator de dinaintea programului). Furnizați adresa de operator a validatorului, un moniker, o rată de comision între 5% și 20% și, opțional, un endpoint public, apoi confirmați self-stake-ul de 100.000 QOR, perioada de unbonding de 21 de zile și slashing-ul.

Pașii on-chain sunt descriși în [Rularea unui Validator](/developer-guide/running-a-validator): înregistrați-vă cheia PQC, apoi trimiteți `create-validator` cu cel puțin 100.000 QOR self-stake, co-semnat PQC ca orice tranzacție QoreChain. Staking-ul și crearea validatorului au loc doar pe lane-ul nativ de tranzacții al QoreChain; nu există nicio cale de a înregistra sau bloca un validator printr-un portofel EVM conectat, precum MetaMask. Sub formular, fila listează și ce îi trebuie unui nod complet (binarul de release, genesis, peer-i) din manifestul de release al rețelei.

Vezi [Staking și Validatori](/dashboard/staking-and-validators).

## Rollups

Solicitați un rollup alimentat de QoreChain. Formularul vă permite să denumiți rollup-ul și să indicați mașina virtuală (EVM, CosmWasm sau SVM), stratul de disponibilitate a datelor, tokenul de gas, modelul de sequencer și ținta de settlement dorite. Trimiterea înregistrează o cerere de provizionare care este revizuită; nu creează rollup-ul on-chain. Opțiunile sunt mai largi decât ceea ce modulul de rollup on-chain acceptă în prezent. Pentru a înregistra singur un rollup on-chain, vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup); pentru concepte, vezi [Prezentare generală Rollups](/rollups/overview).

## SDK

Un ghid rapid și un hub de referință pentru dezvoltarea pe QoreChain prin cod. Secțiunea prezintă pașii de instalare și fragmente de cod gata de copiat pentru conectare, derivarea conturilor pe cele trei runtime-uri, citirea stării, trimiterea transferurilor și semnarea quantum-safe, plus un tabel cu pachetele pe limbaje și linkuri către repository, exemple și explorer. Vezi [Prezentare generală QoreChain SDK](/sdk/overview) și [Instalare](/sdk/install).

Pentru modul în care funcționează licențierea în rețea, vezi [Licențiere Chain](/architecture/chain-licensing).
