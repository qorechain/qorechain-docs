---
slug: /dashboard/tools-hub
title: Noduri și validatori
sidebar_label: Noduri și validatori
sidebar_position: 11
---

# Noduri și validatori

Pagina **Nodes & Validators** (grupul **Build** din bara laterală, adresa `/tools`; se numea Tools și Tools Hub înainte de 27 octombrie 2026) este pagina pentru operatori a Dashboard-ului. Are cinci tab-uri, în această ordine: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** și **Rollups**. Este destinată celor care vor să ruleze un validator sau un light node ori să ceară un rollup de aplicație. Tab-ul SDK s-a mutat pe pagina publică [Developers](/dashboard/developers), care conține și uneltele pentru constructori (starea cheii PQC, simulatorul, signing playground, QoreX test wallet).

## Inovații {#innovations}

- **Verificările pe lanț vin din lanț.** Panoul **Validator Readiness** verifică patru lucruri în rețeaua selectată: o cheie ML-DSA-87 înregistrată, QOR disponibili pentru self-stake (vesting-ul exclus), acordarea de operator on-chain și dacă validatorul este blocat (bonded). Panoul **Light node status** citește cerințele în vigoare (taxa de înregistrare, miza delegată, timpul de funcționare, fereastra de heartbeat, numărul maxim de light node-uri) și starea de înregistrare și de heartbeat a adresei.
- **„Plătit” și „acordat on-chain” sunt fapte separate.** O licență plătită afișează **Paid, awaiting on-chain grant** până când lanțul confirmă acordarea, apoi **Active on chain**. Tab-ul nu afișează niciodată o licență ca activă înainte ca lanțul să aibă acordarea.
- **Regulile de protocol și regulile programului sunt etichetate separat.** Fiecare rând de parametru spune dacă provine din protocol (citit din lanț) sau din program (aplicat de Association).
- **O licență de light node de testnet, self-service.** Introduceți o adresă `qor1...` la **Free testnet licence** și selectați **Request licence**; acordarea este semnată automat, de obicei în câteva minute. Acordările pe mainnet rămân manuale.
- **Pașii pentru nod urmează manifestul de release al rețelei.** Descărcările (server edition `lightnode-sx`, desktop edition `lightnode-ux`, pe platformă, cu sume de control SHA-256), dacă înregistrarea este deschisă și dacă pașii sunt actuali provin toate din manifest.

## Cum se folosește {#how-to-use}

Condiție pentru fiecare tab: autentificați-vă. Tab-urile urmează comutatorul de rețea din antet (verificările pe lanț, descărcările și statusul nodurilor sunt citite din rețeaua selectată). Dacă nu sunteți autentificat, pagina afișează „Authentication Required”. Vezi [Autentificare](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

O prezentare generală, doar pentru citire, a **QoreChain Validator Program**, modul în care validatorii intră în rețea: ce oferă programul (acordarea de operator on-chain, delegare din stake controlat de Association și o bursă în QOR pentru operatorii independenți care respectă nivelurile de serviciu), ce cere, procesul de selecție și un FAQ. Are butoanele **Apply** și **Ask a question**. Parametrii de protocol (timpul de unbonding, slashing-ul, numărul maxim de validatori) sunt citiți live din lanț; regulile programului (self-stake-ul de 100.000 QOR, intervalul de comision, bursa) aparțin Association și sunt marcate ca atare. Validatorii nu cumpără un pachet: aplică și plătesc o **taxă de program de $1,000** doar după ce sunt selectați. Pentru sumele bursei vedeți tab-ul în sine.

### Validator Application {#validator-application}

1. **Completați aplicația.** Numele entității, jurisdicția și adresa de email de contact; **adresa de operator** (`qor1...`, contul din care veți rula `create-validator`; acordarea de operator on-chain este emisă către această adresă); furnizorul de hosting, regiunea și tipul; rețelele pe care le operați deja; opțional, adresa validatorului dumneavoastră de testnet (`qorvaloper1...`) și infrastructura publică pe care o oferiți (RPC public, snapshot-uri, arhivă); traseul (Standard sau Global pentru locurile rezervate); și acceptarea termenilor programului. Selectați **Submit application**. Aplicarea este gratuită.
2. **Revizuire și perioadă de probă pe testnet.** Aplicația apare ca **Application submitted**, apoi, pentru aplicațiile care merg mai departe, **Testnet trial** (o probă de 14 zile în care rulați un validator pe `qorechain-diana`). O aplicație respinsă afișează **Not selected**, cu **Apply again**.
3. **Selecția și taxa de program.** O aplicație selectată afișează **Selected** cu un buton **Pay the $1,000 programme fee**. Alegeți rețeaua (USDT pe ERC-20, BEP-20 sau TRC-20), plătiți suma exactă afișată, lipiți hash-ul tranzacției și selectați **Verify payment**; plata este verificată on-chain. Taxa este legată de adresa de operator din aplicația dumneavoastră și nu poate fi plătită pentru altă adresă. Aprobarea și plata sunt afișate separat: o aplicație poate fi selectată și încă neplătită. După plată, cardul afișează „Programme fee paid”.
4. **Acordarea de operator on-chain.** După plată, Association emite on-chain acordarea `validator_operator` către adresa dumneavoastră de operator. Acordările pe mainnet sunt semnate manual, în loturi, deci nu sunt instantanee. Tab-ul afișează **Operator grant on chain** imediat ce lanțul o are și **In the active set** după ce validatorul dumneavoastră este blocat (bonded).
5. **Readiness.** Pentru aplicațiile trimise, aflate în perioada de probă, selectate și cu acordare emisă, panoul **Validator Readiness** (cu un câmp de adresă) verifică lanțul pentru adresa de operator. Rulați din timp [înregistrarea cheii PQC](/developer-guide/running-a-validator#pqc-key-registration) pe propriul nod: nimeni nu înregistrează acea cheie în locul dumneavoastră.

Aplicațiile aprobate în cadrul ofertei anterioare pentru validatori (înainte de octombrie 2026) apar ca **Earlier application**; Association îi contactează direct pe acei aplicanți.

### Light Node {#light-node}

Tot ce îi trebuie unui operator de light node, de la licență până la un nod înregistrat.

1. **Cumpărați licența (mainnet).** O licență de light node costă **$50**, plătită în USDT pe ERC-20, BEP-20 sau TRC-20 și verificată on-chain. Introduceți adresa `qor1...` căreia trebuie să-i fie acordată licența, alegeți rețeaua USDT și selectați **Buy for $50**; folosiți un cont ale cărui cuvinte de recuperare le dețineți (propriile cuvinte, Keplr sau `qorechaind`), ideal unul folosit doar pentru nod. După plată, cardul afișează **Payment received**, iar acordarea on-chain urmează. **Your past orders** sunt listate mai jos.
2. **Așteptați acordarea on-chain.** Licența afișează **Paid, awaiting on-chain grant**, apoi **Active on chain** când lanțul confirmă acordarea `lightnode_operator`. Acordările pe mainnet sunt semnate manual, în loturi.
3. **Instalați și înregistrați nodul.** Tab-ul listează versiunile publicate pentru rețeaua dumneavoastră cu sumele lor de control și pașii pentru versiunea curentă: setați o parolă (passphrase) pentru keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (adaugă contul pentru care este licența), `lightnode-sx register` (atașează cheia post-cuantică a nodului și îl înregistrează; adăugați `--delegate-to <qorvaloper...>` dacă adresei îi lipsește stake-ul necesar), apoi `lightnode-sx start` și `lightnode-sx status`. Pașii sunt afișați ca actuali doar când manifestul de release al rețelei publică o versiune care îi suportă, iar tab-ul spune dacă înregistrarea este deschisă.
4. **Notificări pentru adresa dumneavoastră.** Tab-ul avertizează când adresa licenței este unul dintre propriile portofele custodiale din Dashboard („This address cannot run a node”: Dashboard-ul deține acea cheie) și semnalează când adresa are deja o cheie post-cuantică on-chain (nodul o refolosește dacă a fost derivată din cuvintele dumneavoastră de recuperare, altfel refuză și recomandă un cont dedicat).
5. **Status.** Un panou arată cerințele în vigoare și dacă un light node este înregistrat și raportează la timp. Stările includ „Registered, waiting for its first heartbeat”, „Rewards accrued” și o notificare când nodul a fost marcat inactiv.

#### Licență gratuită de testnet {#testnet-licence}

Pe testnet (`qorechain-diana`) nu se vinde nimic („Nothing is sold on testnet”), iar o licență de light node este gratuită și self-service:

1. Setați antetul pe **Testnet** și deschideți tab-ul **Light Node**.
2. La **Free testnet licence**, introduceți adresa `qor1...` și selectați **Request licence**.
3. Cererea apare ca „Requested for ...”, apoi „Granted to ... You can register your node now.” Dacă acordarea nu a putut fi semnată, tab-ul spune acest lucru și puteți face din nou cererea.

Acordările sunt semnate automat, de obicei în câteva minute. Există o singură cerere per cont și una per adresă. **Exemplu minimal:** Testnet, **Light Node**, **Request licence**, așteptați „Granted to ...”, apoi rulați `lightnode-sx onboard` până la `register`.

Vezi [Prezentare generală Light Node](/light-node/overview) și [Înregistrare și Licențiere](/light-node/registration-and-licensing).

:::note Licențe cumpărate înainte ca adresa să devină obligatorie
Dacă ați cumpărat o licență înainte ca adresa să fie colectată, tab-ul se deschide cu **This licence needs a QoreChain address**: introduceți adresa și selectați **Save address**. Până când este salvată, licența nu poate fi acordată.
:::

### Node Registration {#node-registration}

Înregistrează detaliile validatorului dumneavoastră la Association. Nu creează validatorul on-chain; acest lucru îl faceți de pe propriul nod cu `create-validator`. Tab-ul este blocat până când acordarea este on-chain.

Formularul se deschide după ce lanțul arată o acordare `validator_operator` activă pentru adresa dumneavoastră de operator și dețineți o aplicație selectată în Validator Program (sau o licență de validator de dinaintea programului). Furnizați adresa de operator, un **Moniker**, un **Commission** între 5% și 20% și, opțional, un endpoint, bifați confirmarea (self-stake-ul de 100.000 QOR, perioada de unbonding de 21 de zile și slashing-ul) și selectați **Register validator**.

Pașii on-chain sunt descriși în [Rularea unui Validator](/developer-guide/running-a-validator): înregistrați-vă cheia PQC, apoi trimiteți `create-validator` cu cel puțin 100.000 QOR self-stake, co-semnat PQC ca orice tranzacție QoreChain. Staking-ul și crearea validatorului au loc doar pe lane-ul nativ de tranzacții; nu există nicio cale de a înregistra sau bloca un validator printr-un portofel EVM conectat, precum MetaMask. Sub formular, tab-ul listează ce îi trebuie unui nod complet (binarul de release, genesis, peer-i) din manifestul de release și poate afișa un banner „Joining is temporarily suspended” când rețeaua nu acceptă validatori noi. Vezi [Staking și Validatori](/dashboard/staking-and-validators).

### Rollups {#rollups}

Tab-ul se numește **Request a Rollup**. Completați formularul: un nume, mașina virtuală (EVM, QoreChain Native sau SVM), stratul de disponibilitate a datelor (QoreChain DA, Celestia sau EigenDA), tokenul de gas, sequencer-ul (Shared sequencer, Dedicated (single) sau Decentralized) și ținta de settlement (QoreChain mainnet sau Ethereum), apoi selectați **Request deployment**. Aceasta înregistrează doar o cerere, listată sub formular împreună cu statusul ei; la acest pas nu se creează nimic on-chain. Opțiunile sunt mai largi decât ceea ce modulul de rollup on-chain acceptă în prezent. Pentru a înregistra singur un rollup on-chain, vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup); pentru concepte, vezi [Prezentare generală Rollups](/rollups/overview).

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools) sau **Nodes & Validators** în grupul **Build** din bara laterală.
- **Autentificare:** necesară pentru întreaga pagină, pe ambele rețele.
- **Rețea:** urmează antetul. Cumpărarea licenței de $50 este doar pe mainnet; licența gratuită este doar pe testnet.
- **Costuri:** aplicarea este gratuită; taxa programului de validatori este de $1,000 și se plătește doar după selecție; o licență de light node pe mainnet costă $50; licența de testnet este gratuită.
- **Portofel:** un cont ale cărui cuvinte de recuperare le dețineți, pentru nod; nu este nevoie de portofel pentru a citi tab-urile.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet și testnet, comutator în antet |
| Descărcări de noduri și sume de control | Tab-ul Light Node | Manifest de release pe rețea |
| SDK și unelte pentru constructori | [Developers](/dashboard/developers) | Ambele |

## Limite și probleme cunoscute {#limits}

- **Acordările pe mainnet sunt manuale,** semnate în loturi, deci o licență plătită așteaptă în „Paid, awaiting on-chain grant”. Acordările pe testnet sunt automate.
- **O singură cerere gratuită de testnet** per cont și per adresă.
- **Rollups este un formular de cerere pe ambele rețele;** nu creează nimic on-chain.
- **Aderarea ca validator poate fi întreruptă** (bannerul „Joining is temporarily suspended”).
- **Datele de primire USDT și eventualele sume ale bursei** sunt afișate doar în interiorul tab-urilor, la momentul plății sau al aplicării.

Pentru modul în care funcționează licențierea în rețea, vezi [Licențiere Chain](/architecture/chain-licensing).
