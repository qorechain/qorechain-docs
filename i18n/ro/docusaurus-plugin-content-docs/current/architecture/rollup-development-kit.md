---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Modulul `x/rdk` oferă un Rollup Development Kit (RDK) cuprinzător, care permite dezvoltatorilor să implementeze rollup-uri specifice aplicațiilor pe QoreChain. Suportă patru paradigme de decontare, mai multe moduri de secvențiere, backend-uri de disponibilitate a datelor conectabile și optimizare a configurației asistată de AI.

:::caution Capabilitate în stadiu incipient
Modulul este implementat pe mainnet (versiunea de lanț **v3.2.5** din 29 octombrie 2026) și pe testnet (**v3.2.6** din 27 octombrie 2026), dar **niciun rollup nu a fost creat încă pe niciuna dintre rețele** (verificat la 30 octombrie 2026: `GET /qorechain/rdk/v1/rollups` returnează o listă goală pe ambele). Mai multe capabilități descrise mai jos nu pot fi folosite în prezent de la un capăt la altul; starea este indicată acolo unde fiecare este descrisă. Pentru ghidul practic destinat dezvoltatorilor, consultați [Prezentare generală a rollup-urilor](/rollups/overview).
:::

---

## Paradigme de decontare

QoreChain RDK suportă patru moduri distincte de decontare — **optimistic**, **zk**, **based** și **sovereign** — fiecare cu ipoteze de încredere, caracteristici de finalitate și cerințe de demonstrație diferite.

### Decontare optimistă {#optimistic-settlement}

Rollup-urile optimiste presupun că tranzacțiile sunt valide în mod implicit și se bazează pe demonstrații de fraudă pentru rezolvarea disputelor.

* **Sistem de demonstrare**: Demonstrații de fraudă interactive
* **Fereastră de contestare**: 604,800 de secunde (implicit, 7 zile). **Înainte de v3.2.4:** lanțul o convertește în blocuri la un raport fix de 6 secunde per bloc, **100,800 de blocuri**, deci timpul real scurs depinde de timpul efectiv al blocurilor (aproximativ 3,7 zile la blocurile actuale de ≈3.1 s de pe mainnet); planificați în blocuri, nu în zile. **De la v3.2.4:** pentru un lot trimis începând cu înălțimea upgrade-ului, fereastra este măsurată în secunde de timp de bloc (7 zile întregi). Un lot trimis mai devreme păstrează regula numărului de blocuri. Testnet-ul a aplicat v3.2.4 la înălțimea 8,337,253 (19 octombrie 2026); mainnet-ul a aplicat-o la înălțimea 3,742,566 (23 octombrie 2026, propunerea de guvernanță 13). Valoarea implicită configurată pe testnet este mai scurtă, 3,600 de secunde (1 oră), așa că un rollup de pe testnet se finalizează mai repede decât cele 7 zile descrise aici.
* **Garanție de contestare**: 1,000 QOR (1,000,000,000 uqor) — necesară pentru a depune o contestare prin demonstrație de fraudă (profilurile `nft` și `custom`; profilurile `defi`, `gaming` și `enterprise` nu setează nicio garanție deoarece nu au fereastră de contestare)
* **Finalitate**: Întârziată până la expirarea ferestrei de contestare fără o contestare validă
* **Auto-finalizare**: `EndBlocker` finalizează automat loturile odată ce fereastra de contestare a trecut fără dispută. Un lot contestat nu este niciodată finalizat automat: trebuie rezolvat mai întâi, de orice cont (de la v3.2.5, pe mainnet din 29 octombrie 2026 și pe testnet din 26 octombrie; înainte de v3.2.5 doar creatorul rollup-ului putea) (vezi [Implementarea unui rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Ciclul de viață al lotului**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Decontare ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Rollup-urile ZK oferă demonstrații criptografice de validitate care garantează corectitudinea tranziției de stare.

* **Sistem de demonstrare**: SNARK (Groth16 peste BLS12-381) sau STARK (transparent, fără setup de încredere)
* **Finalitate**: Instantanee la verificarea demonstrației — nu este necesară o fereastră de contestare
* **Dimensiune maximă a demonstrației**: 1 MB (1,048,576 octeți)
* **Adâncime de recursivitate**: Adâncime configurabilă a agregării demonstrațiilor (implicit: 1)
* **Maturitate**: Loturile SNARK sunt verificate on-chain (Groth16 peste BLS12-381) față de o cheie de verificare stocată împreună cu rollup-ul. **Decontarea ZK nu poate fi încă folosită pe niciuna dintre rețele:** lanțul nu are nicio modalitate de a înregistra o cheie de verificare pentru un rollup, deci fiecare lot ZK este refuzat după ce taxa a fost plătită. Înregistrarea cheilor este planificată pentru versiunea de lanț v3.2.7. Verificarea STARK este experimentală: este opt-in și verifică un circuit de demonstrație, nu propria tranziție de stare a rollup-ului dumneavoastră. Tratați decontarea ZK ca nefiind pregătită pentru producție.

**Ciclul de viață al lotului**:

```
Submitted + valid proof → Finalized (instant)
```

### Decontare based

Rollup-urile based deleagă secvențierea tranzacțiilor către proponenții L1 (QoreChain), moștenind garanțiile de disponibilitate (liveness) și rezistență la cenzură ale lanțului gazdă.

* **Sistem de demonstrare**: Niciunul necesar — proponenții L1 sunt sursa de adevăr
* **Secvențiator**: Trebuie să utilizeze modul de secvențiator `based` (impus prin validare)
* **Finalitate**: Confirmare la 2 blocuri pe QoreChain
* **Întârziere de includere**: Blocuri configurabile înainte de includerea forțată a tranzacțiilor rollup
* **Partajarea taxei de prioritate**: Procent configurabil din taxele de prioritate plătite proponenților L1

**Ciclul de viață al lotului**:

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Decontare sovereign

Rollup-urile sovereign operează cu un consens independent și își secvențiază singure tranzacțiile. Ele ancorează starea la QoreChain pentru verificabilitate, dar nu depind de lanțul gazdă pentru finalitate.

* **Sistem de demonstrare**: Niciunul
* **Finalitate**: Independentă — determinată de propriul consens al rollup-ului
* **Ancorarea stării**: Rădăcinile de stare sunt publicate pe QoreChain pentru transparență și verificabilitate, dar nu sunt impuse
* **Auto-finalizare**: Niciuna — rollup-urile sovereign își gestionează propria finalitate

---

## Compatibilitatea sistemelor de demonstrare

| Mod de decontare | Demonstrații de fraudă |     SNARK |     STARK |     Niciunul |
| --------------- | -----------: | --------: | --------: | -------: |
| **Optimistic**  |     Necesare |        -- |        -- |       -- |
| **ZK**          |           -- | Suportat | Suportat |       -- |
| **Based**       |           -- |        -- |        -- | Necesar |
| **Sovereign**   |           -- |        -- |        -- | Necesar |

Verificarea STARK este experimentală, iar decontarea ZK nu este pregătită pentru producție; vezi nota de maturitate [Decontare ZK](#zk-zero-knowledge-settlement) de mai sus.

---

## Profiluri prestabilite

RDK include **cinci profiluri prestabilite** care oferă configurații de rollup gata de utilizare, optimizate pentru cazuri de utilizare comune. Fiecare profil prestabilit grupează o paradigmă de decontare, un mod de secvențiator, un backend de disponibilitate a datelor, un model de gas și o VM ajustate pentru domeniul său țintă:

| Profil          | Decontare (demonstrație)       | Secvențiator | DA              | Model de gas    | VM      | Caz de utilizare țintă |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Aplicații de tranzacționare, creditare și de tip AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Stare de joc și economii în joc cu debit ridicat și latență scăzută |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planificat) | standard | QoreChain Native | Emitere NFT, marketplace-uri și obiecte de colecție digitale |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Implementări cu permisiuni și de consorțiu cu taxe sponsorizate |
| **`custom`**     | complet parametrizat      | complet parametrizat | complet parametrizat | complet parametrizat | complet parametrizat | Fiecare câmp este definit de utilizator |

Profilul `custom` lasă fiecare câmp la latitudinea ta. Valorile exacte grupate în fiecare profil prestabilit pot evolua pe măsură ce RDK se maturizează; interoghează configurația live cu `qorechaind query rdk config` (sau `RdkClient.params()` din `@qorechain/rdk`) pentru parametrii oficiali per profil prestabilit și reține că decontarea `based` se asociază întotdeauna cu modul de secvențiator `based`.

---

## Moduri de secvențiator

Secvențiatorul determină cine ordonează tranzacțiile în cadrul unui bloc de rollup.

:::note Ce este impus în prezent
On-chain, un lot poate fi trimis doar de adresa de secvențiator configurată a rollup-ului sau, când nu este setată niciuna (cazul tuturor profilurilor prestabilite), de creatorul acestuia. Modurile `shared` și `based` sunt înregistrate în configurația rollup-ului, dar QoreChain nu admite încă o listă de secvențiatori partajați sau proponenți L1 ca trimițători de loturi; aceste moduri descriu designul intenționat.
:::

### Secvențiator dedicat

Un singur operator secvențiază toate tranzacțiile rollup-ului.

* **Operator**: Adresă unică desemnată
* **Latență**: Cea mai mică posibilă — ordonare de către o singură parte
* **Încredere**: Necesită încredere în operatorul secvențiatorului pentru disponibilitate și ordonare echitabilă

### Secvențiator partajat

Un set de secvențiatori ordonează colectiv tranzacțiile.

* **Stare**: o etichetă în prezent — lista nu este încă admisă on-chain (vezi nota de mai sus)
* **Dimensiunea minimă a setului**: Configurabilă (implicit: 1)
* **Latență**: Ușor mai mare din cauza coordonării între mai multe părți
* **Încredere**: Distribuită în cadrul setului de secvențiatori

### Secvențiator based

Proponenții L1 QoreChain secvențiază tranzacțiile rollup-ului.

* **Stare**: o etichetă în prezent — proponenții L1 nu sunt încă admiși ca trimițători de loturi (vezi nota de mai sus)
* **Întârziere de includere**: Blocuri configurabile înainte de includerea forțată (implicit: 10)
* **Cotă din taxa de prioritate**: Procent configurabil din taxele de prioritate plătite proponenților L1
* **Încredere**: Moștenește securitatea setului de validatori al QoreChain și rezistența la cenzură
* **Cerință**: Modul de decontare based necesită secvențiatorul based (impus la validare)

---

## Backend-uri de disponibilitate a datelor

### DA nativ

Stocare de blob-uri în KV-store on-chain în interiorul QoreChain.

:::caution Încă nu există o modalitate publică de a publica un blob
Modulul definește stocarea, păstrarea și curățarea blob-urilor, dar în versiunile actuale nu există niciun mesaj de tranzacție pentru publicarea unui blob. Un lot care indică un hash de date pe un rollup `native` sau `both` este refuzat deoarece nu poate fi stocat niciun blob corespunzător. Vezi [Disponibilitatea datelor](/rollups/data-availability). Pe disponibilitatea nativă a datelor, un lot trebuie deci să lase `data_hash` gol; clientul RDK (0.7.0) face acest lucru, iar lanțul refuză un lot care pretinde unul.
:::

| Parametru            | Valoare                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Dimensiune maximă a blob-ului**    | 2 MB (2,097,152 octeți)                                                                              |
| **Perioadă de păstrare** | 432,000 de blocuri (aproximativ 16 zile la blocurile actuale de ≈3.1 s de pe mainnet; cifra se modifică odată cu timpul blocurilor) |
| **Auto-curățare (pruning)**     | Blob-urile expirate sunt curățate în `EndBlocker` — datele sunt eliminate, dar metadatele de commitment sunt păstrate  |
| **Commitment**       | Hash SHAKE-256 (32 de octeți) al datelor blob-ului                                                  |

### Celestia DA

Disponibilitate a datelor bazată pe IBC folosind stratul DA dedicat al Celestia.

* **Stare**: Stub în versiunea curentă — returnează o eroare dacă este selectat ca backend unic
* **Suport pentru namespace-uri**: Namespace-urile specifice rollup-ului sunt suportate în schema de blob-uri
* **Planificat**: Integrare IBC completă cu trimiterea și verificarea blob-urilor Celestia

### Both (Redundant)

Stochează blob-urile simultan pe ambele backend-uri, Native și Celestia.

* În versiunea curentă, doar blob-ul nativ este efectiv stocat; un avertisment este înregistrat pentru componenta Celestia.

---

## Ciclul de viață al rollup-ului

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| Stare       | Descriere                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup înregistrat, dar încă neactivat                      |
| **Active**  | Rollup-ul este live și procesează loturi                        |
| **Paused**  | Oprit temporar de creator (poate fi reluat)                   |
| **Stopped** | Dezafectat permanent — ce rămâne din escrow-ul creatorului este returnat (vezi [Registrul de escrow](#escrow-ledger))  |

La creare, starea rollup-ului este setată la `Active` imediat după ce escrow-ul de stake și arderea la creare au reușit (înregistrarea stratului este încercată, dar nu este fatală). Doar creatorul poate pune în pauză, relua sau opri un rollup (impus începând cu versiunea de lanț v3.2.0).

---

## Ciclul de viață al lotului

Loturile de decontare urmăresc progresia stării rădăcinilor de stare ale rollup-ului:

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| Stare          | Descriere                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Lot publicat pe QoreChain, în așteptarea finalizării  |
| **Challenged** | Contestare prin demonstrație de fraudă depusă (doar optimistic) |
| **Finalized**  | Lot acceptat ca fiind canonic                       |
| **Rejected**   | Lot invalidat printr-o contestare reușită         |

Comportamentul RDK 0.6.1 și ulterior (0.7.0 este versiunea curentă): pentru un rollup optimistic, clientul construiește un lot a cărui rădăcină de stare este rădăcina canonică de tranziție a lanțului (`batchTransitionRoot` în RDK), nu o valoare liberă proprie.

### Reguli de auto-finalizare

| Mod de decontare | Declanșator de finalizare                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100,800 de blocuri după trimitere (fereastra implicită) fără contestare; pentru loturile trimise începând cu v3.2.4 (testnet de la înălțimea 8,337,253; mainnet de la înălțimea 3,742,566, 23 octombrie 2026), 604,800 de secunde de timp de bloc |
| **ZK**          | Instantaneu la depunerea unei demonstrații valide                           |
| **Based**       | 2 blocuri L1 după trimitere                                |
| **Sovereign**   | Niciunul — gestionat de propriul consens al rollup-ului                |

Auto-finalizarea este executată în `EndBlocker` pentru rollup-urile optimistic și based. Loturile ZK sunt finalizate inline în timpul trimiterii lotului.

---

## Parametrii modulului

| Parametru                   |                          Implicit | Descriere                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 (testnet: 200) | Numărul maxim de rollup-uri care pot fi înregistrate |
| `min_stake_for_rollup`      | 10,000,000,000 uqor (10,000 QOR) | Stake minim necesar pentru a crea un rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fracțiunea din stake-ul de creare ars prin `x/burn`   |
| `default_challenge_window`  | 604,800 s (testnet: 3,600 s) | Fereastra implicită de contestare optimistă; înainte de v3.2.4 lanțul o convertea în 100,800 de blocuri |
| `max_da_blob_size`          |           2,097,152 octeți (2 MB) | Dimensiunea maximă a blob-ului de disponibilitate a datelor              |
| `blob_retention_blocks`     |                   432,000 de blocuri | Blocuri înainte ca blob-urile DA să fie curățate                |
| `max_batches_per_block`     |                               10 | Numărul maxim de loturi de decontare procesate per bloc   |

---

## Integrarea Multilayer

Modulul RDK se integrează cu `x/multilayer` pentru gestionarea stării între straturi:

### Înregistrarea stratului {#layer-registration}

Când un rollup este creat, modulul înregistrează un strat pentru acesta prin `RegisterSidechain`, deci on-chain tipul stratului este **`sidechain`**, începe în starea `proposed`, se numără în limita de sidechain-uri multilayer (`max_sidechains`, implicit **10**) și blochează `min_sidechain_stake` al creatorului (1,000 QOR). Înregistrarea include:

* ID-ul stratului (corespunde ID-ului rollup-ului)
* Timpul țintă al blocului și numărul maxim de tranzacții per bloc
* Tipurile de VM și domeniile suportate
* Intervalul de decontare

Înregistrarea este **non-fatală**: dacă eșuează (sold insuficient sau limită atinsă), rollup-ul este totuși creat, dar nu are strat și nu poate fi ancorat. O ancoră de decontare nu necesită ca stratul să fie `active`: stratul pe care îl înregistrează un rollup RDK rămâne `proposed` și poate fi totuși ancorat de creatorul său (vezi [Trimiterea ancorei](/architecture/multilayer-architecture#anchor-submission)).

### Ancorarea stării {#state-anchoring}

Un lot de decontare poate fi ancorat la `x/multilayer`, care înregistrează ID-ul stratului, înălțimea stratului (indexul lotului), rădăcina de stare, hash-ul setului de validatori și numărul de tranzacții sub o semnătură post-cuantică a creatorului rollup-ului.

* **Începând cu v3.2.2 (live pe mainnet și testnet):** `MsgSubmitBatch` are două câmpuri opționale. `anchor_signature` este semnătura ML-DSA-87 a creatorului peste **octeții de semnare v2 ai ancorei** lotului (vezi [Citirea ancorelor](/architecture/multilayer-architecture#reading-anchors)); când este prezentă, lotul este ancorat în `x/multilayer` în **aceeași tranzacție**, iar o ancoră refuzată refuză lotul. `validator_set_hash` este angajamentul setului de validatori al rollup-ului, purtat în ancoră și acoperit de semnătură. În CLI: `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` afișează octeții de semnat (`<layer-id>` este id-ul de strat al rollup-ului, care este egal cu id-ul rollup-ului pentru rollup-urile create prin RDK), iar `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` îi trimite.
* **Fără semnătură**, lotul se decontează neancorat, exact ca înainte. Un client care nu trimite câmpul produce loturi neancorate, așa că verificați dacă toolkit-ul pe care îl folosiți îl suportă: `@qorechain/rdk` 0.6.0 în TypeScript semnează ancora atunci când clientul său semnează hibrid și este creatorul rollup-ului (altfel trimite lotul neancorat), în timp ce clienții Python, Go, Rust și Java nu construiesc câmpul. Niciun rollup, strat sau ancoră nu există încă pe niciuna dintre rețele, deci nu a fost scrisă nicio ancoră, iar acea cale nu a fost testată live.

Vezi [Chitanțe de decontare](/rollups/settlement-receipts) pentru ce dovedește și ce nu dovedește o ancoră.

---

## Registrul de escrow și retragerile {#escrow-ledger}

Escrow-ul tuturor rollup-urilor se află într-un singur sold de modul comun. Începând cu **v3.2.3** (înălțimea mainnet 3,662,051, 20 octombrie 2026), un **registru de escrow** per rollup este evidența unică a ceea ce deține fiecare rollup în acel pool:

* `create-rollup` creditează registrul cu escrow-ul pe care rollup-ul îl păstrează efectiv: stake-ul minus arderea de 1% la creare.
* O retragere (`tx rdk execute-withdrawal`) și o recompensă pentru demonstrație de fraudă sunt plătite din registru și debitate din acesta. O retragere mai mare decât ce deține încă rollup-ul este refuzată cu o eroare de escrow insuficient.
* `stop-rollup` returnează doar ce a rămas în registru și îl aduce la zero. Un rollup oprit nu mai plătește alte retrageri.
* `RollupView`, în regim doar-citire, returnat de interogările rollup-ului, poartă `escrow_balance`: uqor încă deținuți pentru acel rollup.

Înainte de v3.2.3, registrul era creditat cu zero, deci fiecare retragere eșua în siguranță (fail closed); `execute-withdrawal` poate deci reuși pe mainnet doar începând cu v3.2.3. Verificările pe care un client ar trebui să le facă înainte de a plăti o taxă: denom-ul trebuie să fie exact `uqor`, suma trebuie să fie pozitivă, dovada Merkle are cel mult 64 de niveluri, fiecare frate având exact 32 de octeți, iar expeditorul și destinatarul trebuie să fie adrese `qor1…` valide. O retragere necesită și un lot finalizat care a angajat un `withdrawals_root`, iar fiecare frunză de retragere poate fi plătită o singură dată.

## Citirea stării RDK {#reading-state}

Interogările RDK sunt servite prin REST pe mainnet și testnet sub `/qorechain/rdk/v1/`:

| Rută | Returnează |
| --- | --- |
| `/params` | Parametrii modulului (tabelul de mai sus) |
| `/rollups` și `/rollup/{rollup_id}` | Înregistrările rollup-urilor, inclusiv `escrow_balance` |
| `/batches/{rollup_id}` | Loturi, paginate (`start_index`, `limit` implicit 50, cel mult 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` și `/latest_batch/{rollup_id}` | Un lot sau cel mai recent |
| `/blob/{rollup_id}/{blob_index}` | Metadatele blob-ului, inclusiv `expires_at_height` (octeții blob-ului nu sunt returnați) |

`qorechaind query rdk config` afișează parametrii modulului (ruta este `/params`; nu există o rută `/config`). Id-urile de rollup și de strat trebuie să respecte gramatica id-urilor din [Id-urile straturilor și ale rollup-urilor](/architecture/multilayer-architecture#id-grammar), impusă începând cu v3.2.2.

---

## Integrarea Burn

La crearea unui rollup, **1% din suma de stake** este ars prin modulul `x/burn` prin canalul de ardere `rollup_create`. De exemplu, crearea unui rollup cu stake-ul minim de 10,000 QOR arde permanent 100 QOR. Restul de 9,900 QOR este păstrat în escrow și, când rollup-ul este oprit, ce rămâne din el este returnat creatorului (retragerile și recompensele pentru demonstrații de fraudă plătite din escrow reduc rambursarea). Arderea la creare este impusă începând cu versiunea de lanț v3.2.0; versiunile anterioare nu o aplicau.
