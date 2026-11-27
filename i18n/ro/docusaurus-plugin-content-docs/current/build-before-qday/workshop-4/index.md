---
slug: /build-before-qday/workshop-4
title: "Workshop 4: Rollup-uri, IBC și QoreX pentru dezvoltatori"
sidebar_label: "Workshop 4"
sidebar_position: 5
date: 2026-11-27
---

# Workshop 4: Rollup-uri, IBC și QoreX pentru dezvoltatori

Workshop 4 coboară sub nivelul aplicației. Mai întâi, rulezi un **rollup** care se decontează pe QoreChain: îl creezi, retragi din el, dovedești ce a făcut, apoi trișezi intenționat și vezi cum este prinsă înșelătoria. Apoi, trimiți **QOR către testnet-ul Cosmos Hub și înapoi** prin IBC. În al treilea rând, vezi ce îți oferă **portofelul QoreX** în timp ce construiești un dApp.

Fiecare comandă de mai jos spune ce face și ce ar trebui să vezi. Codul este public: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), folderul `workshop-4`. Totul de aici rulează doar pe testnet-uri. Tokenii de test nu au valoare.

**Cât durează:** circa 45 de minute de pași. Rollup-ul are în plus o fereastră de contestare de o oră, în care aștepți. Cele trei părți sunt independente: cât aștepți în Partea 1, poți face Partea 2 sau Partea 3.

## Ce construim {#what-we-built}

| Parte | Aplicație | Ce demonstrează |
| --- | --- | --- |
| 1 | **Un rollup** (Node.js, `@qorechain/rdk`) | Batch-uri a căror ancoră este semnată cu ML-DSA-87, o retragere plătită cu o dovadă Merkle, o chitanță de decontare pe care o poate verifica oricine, o fraudă dovedită de un watchtower și o garanție tăiată. |
| 2 | **IBC dus-întors** (Node.js, `@qorechain/qoresign`, cosmjs) | QOR merge pe testnet-ul Cosmos Hub și se întoarce, transportat de QORel, relayer-ul QoreChain. |
| 3 | **QoreX pentru dezvoltatori** (un ghid, fără cod nou) | Providerii cu care vorbește un dApp, pachetele de integrare, modul dezvoltator, jurnalul de cereri și inspectorul de tranzacții. |

Inovațiile din spatele lor:

- **Un rollup cu decontare semnată post-cuantic.** Creatorul semnează rădăcina de stare a fiecărui batch onest cu ML-DSA-87 (NIST FIPS 204), iar lanțul o păstrează.
- **Dovezi de fraudă pe care lanțul le verifică singur.** Cu registrul `qledger-v1`, QoreChain reexecută un batch disputat. Nu trebuie să ai încredere în nimeni ca să afli cine a avut dreptate.
- **Ordinea luată din QoreChain.** Cu secvențierea based, tranzacțiile rollup-ului sunt postate într-un inbox pe QoreChain, deci operatorul nu le poate reordona și nu poate omite ce a fost postat.
- **IBC cu semnătură hibridă pe partea QoreChain.** Transferul care pleacă din QoreChain este semnat atât cu secp256k1, cât și cu ML-DSA-87.
- **Un portofel care își arată munca.** QoreX înregistrează ce a cerut fiecare site și te lasă să inspectezi ce a păstrat lanțul.

## Cuvinte folosite în acest ghid {#words}

| Cuvânt | Sens simplu |
| --- | --- |
| Rollup | Un sistem care își rulează propriile tranzacții în afara lanțului principal și îi trimite acestuia din când în când un scurt rezumat |
| Batch | Un astfel de rezumat: noua stare a rollup-ului și retragerile pe care le cere |
| Rădăcină de stare | O amprentă scurtă a tuturor soldurilor din rollup |
| Rollup optimist | Batch-urile sunt acceptate imediat și devin finale doar dacă nimeni nu dovedește în fereastra de contestare că sunt greșite |
| Fereastră de contestare | Timpul pe care îl are oricine ca să dovedească faptul că un batch este greșit. Pe testnet este de o oră |
| Garanție (bond) | Bani pe care operatorul îi blochează și îi pierde dacă minte |
| Watchtower | Un cont care reia tranzacțiile rollup-ului și raportează un batch greșit |
| `qledger-v1` | Un registru simplu pe care lanțul însuși știe să îl reexecute. Conturile din el semnează cu ML-DSA-44 |
| Secvențiere based | Ordinea tranzacțiilor rollup-ului vine din inbox-ul de pe QoreChain, nu de la operator |
| Ancoră | Rădăcina de stare a batch-ului, semnată de creatorul rollup-ului cu ML-DSA-87 și păstrată pe lanț |
| Dovadă Merkle | Câteva hashuri care dovedesc că un element se află într-un set mai mare, fără să trimiți tot setul |
| IBC | Modul în care lanțurile Cosmos mută tokeni între ele fără un custode: fiecare lanț rulează un light client al celuilalt și verifică dovezi |
| Canal | Un lane între două lanțuri |
| Voucher | Tokenul pe care îl creează celălalt lanț cât timp QOR-ul tău rămâne blocat pe QoreChain |
| Escrow | Contul de pe QoreChain în care QOR-ul trimis așteaptă până se întoarce voucherul |
| Relayer | Un program care transportă pachete și dovezi între două lanțuri |

:::caution Doar conturi testnet de unică folosință
Scripturile creează conturi noi pentru tine. Păstrează lucrurile așa. Nu pune niciodată cuvintele secrete sau cheia unui cont care conține bani reali într-un fișier sau într-o comandă.
:::

## Înainte să începi {#prerequisites}

Ai nevoie de un terminal, de **Node.js 20 sau mai nou** și de **Git**: vezi [Înainte de a începe](/build-before-qday/prerequisites). Partea 3 mai are nevoie de **pnpm** și de portofelul QoreX. Verifică Node.js:

```bash
node -v
```

Trebuie să afișeze `v20` sau mai mare. Obține codul de exemplu:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

Prima linie descarcă exemplele într-un folder numit `build-before-qday`. A doua intră în folderul `workshop-4`.

Fiecare parte are nevoie de o cantitate diferită de QOR de test:

| Parte | De ce ai nevoie | De unde vine |
| --- | --- | --- |
| 1, contul operatorului | Circa 12,010 QOR de test: 10,000 stake pentru rollup, 1,000 pentru slotul de sidechain, 1,000 garanție de submitter și câțiva pentru depozite și comisioane | Faucetul dă 100 QOR pe zi, ceea ce nu ajunge. Cere echipei festivalului, pe canalele [build.qorechain.io](https://build.qorechain.io), o alocare mai mare de testnet |
| 1, contul de watchtower | Câțiva QOR de test pentru comisioane | [Faucetul](/dashboard/faucet) |
| 2 | Circa 2 QOR de test, plus puțin ATOM de test | [Faucetul](/dashboard/faucet). Scriptul cere ATOM de la faucetul testnet-ului Cosmos Hub |
| 3 | Puțin QOR de test în contul tău de testnet din QoreX | [Faucetul](/dashboard/faucet) |

:::tip Nu ai o alocare mare? Poți urma totuși Partea 1
`node rollup.mjs rollups` nu are nevoie de cont, iar pașii de mai jos arată ce face fiecare comandă.
:::

## Partea 1: un rollup care se decontează pe QoreChain {#part-1}

Cod: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Pachet: `@qorechain/rdk`, Rollup Development Kit.

Vei parcurge toată viața unui mic rollup optimist: îl creezi, blochezi un stake, depui garanția operatorului, depui fonduri, trimiți un batch, aștepți, retragi, construiești o chitanță, trișezi și prinzi înșelătoria. Vezi [Rollup-uri](/rollups/overview) ca să afli cum funcționează.

### Pasul 1: instalare {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Parte | Ce face |
| --- | --- |
| `cd 01-rollup` | Intră în folderul aplicației de rollup. |
| `npm install` | Descarcă pachetele folosite de aplicație. Versiunile sunt fixate de `package.json` și `package-lock.json`. |
| `node rollup.mjs help` | Rulează scriptul și listează toate comenzile. |

**Ce ar trebui să vezi:** lista de comenzi: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### Pasul 2: uită-te la rollup-urile de pe testnet {#r2}

```bash
node rollup.mjs rollups
```

Citește lanțul. Nu este nevoie de cont.

**Ce ar trebui să vezi:** o primă linie cu numărul de rollup-uri și cu stake-ul și garanția pe care le cere lanțul astăzi (10,000 QOR și 1,000 QOR la momentul scrierii acestui ghid), apoi câte o linie pentru fiecare rollup: id-ul, dacă este activ, cum se decontează (`optimistic` sau `zk`), tipul de VM și blocul în care a fost creat.

**De ce:** arată că sumele pe care le vei plăti vin din lanț, nu din script.

### Pasul 3: creează două conturi {#r3}

```bash
node rollup.mjs init
```

Creează două conturi, **operatorul** și **watchtower-ul**. Cuvintele lor secrete sunt salvate în `~/.config/qday-w4/operator.json` și `watcher.json`, lizibile doar de tine, și nu sunt afișate niciodată. Fișierul operatorului conține și două seed-uri aleatorii pentru cheile de rollup a doi utilizatori, Ana și Ben. Ca să păstrezi fișierele în altă parte, setează variabila de mediu `QDAY_DIR`.

**Ce ar trebui să vezi:** două adrese `qor1...`. Alimentează-le pe amândouă, ca în [Înainte să începi](#prerequisites).

**De ce două conturi:** cel care raportează un batch greșit nu ar trebui să fie cel care l-a publicat.

### Pasul 4: creează rollup-ul și trimite batch-ul 0 {#r4}

```bash
node rollup.mjs prepare
```

Această singură comandă face toată pregătirea. Ține minte ce a făcut deja în `~/.config/qday-w4/rollup-state.json`, așa că o poți rula din nou dacă ceva se oprește la jumătate.

| Ce trimite | Ce face |
| --- | --- |
| `createRollup` | Creează rollup-ul tău cu execuție `qledger-v1` și secvențiere based și blochează stake-ul. |
| `bondRollupSubmitter` | Blochează garanția de 1,000 QOR. |
| Două depozite | 3 QOR pentru Ana și 1 QOR pentru Ben intră în rollup. |
| Trei tranzacții de rollup | Ana îi plătește lui Ben 0.5 QOR, Ana retrage 0.3 QOR, Ben retrage 0.2 QOR. Fiecare este semnată cu cheia ML-DSA-44 a expeditorului și postată în inbox-ul de pe QoreChain. |
| `submitBatch` | Scriptul citește înapoi inbox-ul, îl reexecută ca să obțină noua rădăcină de stare și rădăcina retragerilor și trimite batch-ul 0. RDK-ul îi semnează ancora cu ML-DSA-87. |

**Ce ar trebui să vezi:** câte o linie `ok` pentru fiecare tranzacție, cu blocul și un link către explorer. Apoi starea rollup-ului tău, cu batch-ul 0 afișat ca `submitted`.

### Pasul 5: așteaptă o oră, apoi verifică {#r5}

```bash
node rollup.mjs status
```

**Ce ar trebui să vezi:** rollup-ul, stake-ul operatorului, fondul de retrageri, garanția și fiecare batch. După fereastra de contestare de o oră, batch-ul 0 apare ca `finalized`.

**De ce așteptarea:** un rollup optimist este sigur pentru că există timp să dovedești că un batch este greșit înainte să plece banii.

### Pasul 6: retrage pe QoreChain {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

Retragerea `0` este cei 0.3 QOR ai Anei, iar retragerea `1` cei 0.2 QOR ai lui Ben. În această demonstrație ambele sunt plătite către contul operatorului. Scriptul construiește o dovadă Merkle că retragerea se află în rădăcina retragerilor din batch-ul 0, iar lanțul o verifică față de rădăcina pe care a păstrat-o înainte să plătească. Apoi scriptul trimite aceeași retragere a doua oară.

**Ce ar trebui să vezi:** numărul de hashuri din dovadă, o linie `ok`, soldul destinatarului înainte și după (același cont a plătit comisionul), apoi a doua încercare marcată `REFUSED`. O retragere se plătește o singură dată.

Dacă batch-ul 0 nu este încă final, comanda se oprește și spune că retragerile se plătesc doar după fereastra de contestare.

### Pasul 7: o chitanță de decontare {#r7}

```bash
node rollup.mjs receipt 0
```

Construiește un mic fișier JSON care descrie batch-ul 0 și îl salvează lângă cheile tale. Oricine îl poate verifica: verificarea citește totul din nou de pe QoreChain și nu se bazează pe fișier.

| Verificare | Ce demonstrează |
| --- | --- |
| `rollupLayerBinding` | Rollup-ul aparține stratului numit în chitanță |
| `batchStateRoot` | Batch-ul de pe lanț poartă exact această rădăcină de stare |
| `anchorOnChain` | Pe lanț există o ancoră cu fiecare câmp din chitanță |
| `creatorAuthority` | Cheia de semnare a fost citită de pe lanț, nu din chitanță |
| `pqcSignature` | Semnătura ML-DSA-87 peste ancoră este validă |
| `chainBinding` | Chitanța aparține acestui lanț și nu este o copie din altă parte |

**Ce ar trebui să vezi:** `VALID` cu o bifă lângă fiecare dintre cele șase verificări. Apoi scriptul schimbă o cifră hexazecimală din rădăcina de stare și verifică din nou: `NOT VALID`.

**De ce este util:** un exchange, un auditor sau alt sistem poate verifica starea unui rollup fără să aibă încredere în cel care a trimis fișierul.

### Pasul 8: un operator necinstit {#r8}

```bash
node rollup.mjs cheat
```

Ben îi plătește Anei 0.1 QOR în interiorul rollup-ului, apoi operatorul trimite batch-ul 1 cu un bit din rădăcina de stare inversat, intenționat.

**Ce ar trebui să vezi:** două linii `ok`. A doua spune că batch-ul a fost publicat cu o **rădăcină de stare greșită**. Lanțul îl acceptă deocamdată: există o oră în care se poate dovedi că este greșit, iar garanția operatorului este în joc.

### Pasul 9: watchtower-ul îl prinde {#r9}

```bash
node rollup.mjs watchtower
```

Această comandă folosește contul de watchtower, nu operatorul.

| Pas | Ce se întâmplă |
| --- | --- |
| 1 | Citește batch-ul 1 de pe lanț. |
| 2 | Citește exact partea din inbox folosită de batch-ul 1 și o reia pornind de la starea de după batch-ul 0. Asta dă rădăcina onestă. |
| 3 | Construiește dovada de fraudă și o verifică pe calculatorul tău. |
| 4 | Trimite `challengeBatch`. Lanțul reexecută singur batch-ul, îl respinge și taie garanția: jumătate este arsă, iar jumătate merge la watchtower. |

**Ce ar trebui să vezi:** rădăcina greșită și rădăcina onestă, rezultatul verificării locale, o linie `ok` pentru contestare, batch-ul marcat ca respins și soldul watchtower-ului înainte și după.

:::note Altcineva poate fi mai rapid decât tine
Testnet-ul are deja watchtower-uri independente. Dacă unul dintre ele dovedește primul frauda, ceea ce poate dura un singur bloc, scriptul tău spune că batch-ul este deja respins și rulează doar verificarea locală. Oricum ar fi, operatorul pierde garanția.
:::

Ca să trișezi din nou, completează mai întâi la loc garanția:

```bash
node rollup.mjs bond
```

### Cum este organizat codul {#r-code}

Totul se află într-un singur fișier, `rollup.mjs`. Fiecare comandă este o funcție din obiectul `cmds`, în ordinea pașilor de mai sus. Funcția `connect()` transformă un fișier de cont într-un client de tranzacții RDK care semnează fiecare tranzacție QoreChain cu ambele chei, secp256k1 și ML-DSA-87.

## Partea 2: QOR către Cosmos Hub și înapoi {#part-2}

Cod: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Pachete: `@qorechain/qoresign` și cosmjs. Rețele: testnet-ul QoreChain `qorechain-diana` și testnet-ul Cosmos Hub `provider`.

Aplicația trimite 0.5 QOR de pe testnet-ul QoreChain pe testnet-ul Cosmos Hub și îi aduce înapoi. [QORel](https://github.com/qorechain/QORel), relayer-ul QoreChain, transportă pachetele între cele două lanțuri. La momentul scrierii acestui ghid, testnet-ul QoreChain avea zece canale IBC: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora și ixo. IBC rulează doar pe testnet: nu este activ pe mainnet.

Cum funcționează:

1. O singură cheie îți dă două adrese: `qor1...` pe QoreChain și `cosmos1...` pe Hub.
2. **Dus:** transferul este semnat pe QoreChain cu ambele chei, iar lanțul le verifică pe amândouă. QORel duce pachetul și o dovadă pe Hub. Light client-ul QoreChain de pe Hub verifică dovada și creează un voucher pentru QOR.
3. **Întors:** pe Hub, transferul este semnat în felul obișnuit al Hub-ului. Light client-ul Hub-ului de pe QoreChain verifică dovada. Voucherul este ars, iar QOR-ul original este eliberat.

:::info Două limite pe care merită să le știi
`channel-0` de pe QoreChain este `channel-600` de pe Hub. Numele voucherului pe Hub este `ibc/` urmat de SHA-256 al `transfer/channel-600/uqor`. Pe fiecare canal QOR de pe testnet, cel mult 1% din oferta de QOR poate traversa în 24 de ore, ca frână de siguranță.
:::

### Pasul 1: instalare {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

Prima linie trece din `01-rollup` în `02-ibc`. Dacă ești în folderul `workshop-4`, folosește `cd 02-ibc`.

**Ce ar trebui să vezi:** lista de comenzi: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### Pasul 2: o cheie, două lanțuri {#i2}

```bash
node ibc.mjs init
```

Creează un cont și îi salvează cuvintele secrete în `~/.config/qday-w4/traveler.json`, lizibil doar de tine. Nu sunt afișate niciodată. `QDAY_DIR` schimbă folderul.

**Ce ar trebui să vezi:** adresa QoreChain a contului și adresa lui de pe Cosmos Hub. Lipește adresa `qor1...` în [faucet](/dashboard/faucet).

### Pasul 3: listează canalele {#i3}

```bash
node ibc.mjs channels
```

Citește toate canalele IBC de pe testnet-ul QoreChain și lanțul de la celălalt capăt. Nu este nevoie de cont.

**Ce ar trebui să vezi:** câte o linie pentru fiecare canal, cu starea lui (`OPEN`), id-ul celuilalt lanț și numele canalului de pe acea parte. Ultima linie arată că mainnet-ul nu are încă niciun canal.

### Pasul 4: înregistrează cheia post-cuantică și obține ATOM {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Comandă | Ce face |
| --- | --- |
| `register` | Pune cheia ta publică ML-DSA-87 pe lanț, o singură dată. Tranzacțiile QoreChain ulterioare sunt verificate față de ea. |
| `hub-faucet` | Cere ATOM de la faucetul public al testnet-ului Cosmos Hub, care plătește comisioanele la întoarcere. |
| `status` | Arată QOR-ul tău pe QoreChain, voucherul și ATOM-ul de pe Hub și dacă cheia ta este pe lanț. |

**Ce ar trebui să vezi:** după `status`, soldul tău de QOR, `ML-DSA-87 key on chain: yes` și ceva ATOM. Dacă un sold este încă zero, așteaptă un minut și rulează din nou `status`.

### Pasul 5: dus {#i5}

```bash
node ibc.mjs send 0.5
```

Construiește un mesaj de transfer de tokeni (`MsgTransfer`, standardul ICS-20) pe `channel-0`, îl semnează cu ambele chei prin QoreSign, apoi așteaptă până când voucherul apare pe Hub.

**Ce ar trebui să vezi:** trei linii numerotate: tranzacția semnată, cu numărul pachetului, blocul și linkul către explorer; QORel care duce pachetul; și voucherul care ajunge pe Hub, cu numărul de secunde cât a durat. Fiecare direcție durează de obicei câteva secunde. La tine timpul poate fi diferit.

### Pasul 6: și înapoi {#i6}

```bash
node ibc.mjs back
```

Trimite fiecare voucher acasă prin `channel-600`. Tranzacția de pe Hub este semnată cu un client cosmjs obișnuit, la prețul curent al gazului pe Hub. Apoi scriptul așteaptă întoarcerea QOR-ului.

**Ce ar trebui să vezi:** tranzacția de pe Hub, apoi voucherul ars pe Hub și QOR simplu eliberat pe QoreChain.

### Cum este organizat codul {#i-code}

Totul se află într-un singur fișier, `ibc.mjs`. `sendTx()` construiește și semnează o tranzacție QoreChain hibridă cu QoreSign. `hubWallet()` transformă aceleași cuvinte secrete într-un portofel de Hub cu prefixul `cosmos`. Fiecare comandă este o funcție din obiectul `cmds`.

## Partea 3: QoreX pentru dezvoltatori {#part-3}

Ghid: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). Nu există cod nou: folosești [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) din Workshop 1.

Pașii de mai jos folosesc **extensia de browser QoreX 0.4.5** pe Chrome sau Firefox. Extensia de Safari este o versiune mai veche. Aplicația QoreX (1.2.5, iPhone și Android) are și ea modul dezvoltator: îl activezi în **Setări**, așa cum se explică în [Modul dezvoltator](/qorex/developer-mode).

### Cu ce vorbește un dApp {#providers}

QoreX adaugă trei provideri în paginile web:

| Provider | Pentru | Standard |
| --- | --- | --- |
| `window.ethereum` | dApp-uri EVM. QoreX se anunță și prin EIP-6963 | EIP-1193 |
| `window.qorex.native` | Tranzacții native QoreChain, semnate cu secp256k1 și ML-DSA-87 | API QoreX |
| `window.qorex.svm` | Lane-ul SVM | API QoreX |

Aceste pachete de pe npm conectează QoreX la unelte uzuale:

| Pachet | Utilizare |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | QoreX în RainbowKit (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | QoreX în Cosmos Kit și Interchain Kit |
| `@qorechain/qorex-types` | Tipuri TypeScript pentru `window.qorex` |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | Testează-ți dApp-ul cu QoreX în teste automate |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Construiește și trimite tranzacții cu semnătură hibridă |

Vezi [Integrează un dApp cu QoreX](/qorex/dapp-integration) pentru detalii.

### Pasul 1: activează modul dezvoltator {#x1}

În popup-ul extensiei, dă clic de **șapte ori** pe numărul versiunii din partea de jos a ecranului principal. Apare o secțiune **Mod dezvoltator**, cu **Unelte pentru dezvoltatori**, **Comută pe testnet (diana)** și **Oprește modul dezvoltator**. Dă clic pe **Comută pe testnet (diana)**.

**De ce mai întâi:** jurnalul de cereri înregistrează cereri doar cât timp modul dezvoltator este activ.

### Pasul 2: pornește Hybrid Inspector {#x2}

Din folderul `workshop-4`:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

Prima linie trece la aplicația din Workshop 1, `pnpm install` îi descarcă pachetele, iar `pnpm dev` pornește o pagină web locală. Deschide adresa pe care o afișează (de obicei `http://localhost:5173`) și conectează QoreX.

### Pasul 3: trimite o cerere cu portofelul blocat {#x3}

Dă clic pe **Blochează** în QoreX. În Inspector, trimite 0.001 QOR către propria ta adresă, cu memo-ul `Workshop 4`.

**Ce ar trebui să vezi:** QoreX îți cere parola și **numește site-ul** care face cererea. După ce deblochezi, aprobarea arată suma, destinatarul și memo-ul. Aprob-o: tranzacția este semnată cu ambele chei. Dacă în schimb închizi fereastra, cererea este refuzată.

**De ce contează:** nimic nu se semnează fără parola ta și știi ce site cere.

### Pasul 4: deschide uneltele pentru dezvoltatori {#x4}

Deschide **Unelte pentru dezvoltatori** și uită-te la **Tranzacții**:

- **Jurnal de cereri:** ce a cerut fiecare site de la QoreX, cu metoda, parametrii și ce ai răspuns.
- **Inspector de tranzacții:** lipește un hash de tranzacție sau o cerere în **Hash or request** și dă clic pe **Inspectare**. Cu un hash, vezi ce a înregistrat lanțul, fără să ieși din portofel.

Sunt în total 17 unelte pentru dezvoltatori. [Modul dezvoltator](/qorex/developer-mode) o explică pe fiecare.

### Tot nou în QoreX 1.2.5 {#also-new}

- **O fereastră EVM manuală permite implicit doar transferuri de QOR.** Poți alege un domeniu mai larg și vezi ce acorzi.
- **Multisig PQC:** un cont partajat în care fiecare membru semnează post-cuantic.
- **Rotirea și repararea cheii:** înlocuiește sau repară cheia ta ML-DSA-87 pe lanț fără să îți schimbi adresa.

## Depanare {#troubleshooting}

| Ce vezi | Ce faci |
| --- | --- |
| `no operator account yet` | Rulează mai întâi `node rollup.mjs init`. |
| `no rollup yet` | Rulează mai întâi `node rollup.mjs prepare`. |
| `createRollup` este refuzat din lipsă de fonduri | Contul operatorului are nevoie de circa 12,010 QOR de test. Vezi [Înainte să începi](#prerequisites). |
| `prepare` se oprește la jumătate | Rulează-l din nou. Continuă de la ce a făcut deja. |
| `withdrawals are paid only after the challenge window` | Batch-ul 0 nu este încă final. Verifică cu `node rollup.mjs status` și încearcă din nou mai târziu. |
| `nothing to challenge` | Rulează mai întâi `node rollup.mjs cheat`. |
| Batch-ul este deja respins când rulezi `watchtower` | Alt watchtower de pe testnet a fost mai rapid. Este normal. |
| `no account "traveler"` | Rulează mai întâi `node ibc.mjs init`. |
| `does not exist on chain yet` | Ia QOR de test de la faucet pentru adresa respectivă, apoi încearcă din nou. |
| `nothing after 120 s` | Relayer-ul poate fi ocupat. Așteaptă un minut și rulează `node ibc.mjs status`. |
| Jurnalul de cereri este gol | Activează modul dezvoltator înainte să folosești dApp-ul. |

## Mai multe informații {#learn-more}

- Festivalul, nivelurile și traseele lui: [build.qorechain.io](https://build.qorechain.io).
- [Rollup-uri](/rollups/overview) și RDK-ul. RDK-ul este disponibil pentru TypeScript, Python, Rust, Go și Java, cu un instrument de linie de comandă, `qorollup`, și un șablon de proiect.
- Ca să urmărești batch-urile noi pe măsură ce sosesc, uită-te la `watchBatches` din RDK: un punct de plecare pentru un watchtower care rulează toată ziua.
- [QORel](https://github.com/qorechain/QORel) este open source. Instalează-l cu `brew install qorechain/tap/qorel` sau folosește containerul `ghcr.io/qorechain/qorel`. Rulează-l doar cu propriile tale chei.
- Ca să încerci alt canal în Partea 2, schimbă `CHANNEL`, `HUB_CHANNEL` și endpoint-urile celuilalt lanț în `ibc.mjs`. `node ibc.mjs channels` le listează.
- [Modul dezvoltator](/qorex/developer-mode) și [integrarea dApp](/qorex/dapp-integration) în QoreX.
- [Workshop 3, QoreSeal](/build-before-qday/workshop-3#part-1), dacă rollup-ul tău trebuie să păstreze private datele pe care le postează.
