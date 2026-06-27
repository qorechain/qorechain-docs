---
slug: /architecture/rollup-development-kit
title: Rollup Development Kit
sidebar_label: Rollup Development Kit
sidebar_position: 12
---

# Rollup Development Kit

Modulul `x/rdk` oferă un Rollup Development Kit (RDK) cuprinzător, care permite dezvoltatorilor să implementeze rollup-uri specifice aplicațiilor pe QoreChain. Suportă patru paradigme de decontare, mai multe moduri de secvențiere, backend-uri de disponibilitate a datelor conectabile și optimizare a configurației asistată de AI.

---

## Paradigme de decontare

QoreChain RDK suportă patru moduri distincte de decontare — **optimistic**, **zk**, **based** și **sovereign** — fiecare cu ipoteze de încredere, caracteristici de finalitate și cerințe de demonstrație diferite.

### Decontare optimistă

Rollup-urile optimiste presupun că tranzacțiile sunt valide în mod implicit și se bazează pe demonstrații de fraudă pentru rezolvarea disputelor.

* **Sistem de demonstrare**: Demonstrații de fraudă interactive
* **Fereastră de contestare**: 7 zile (604.800 secunde), configurabilă per rollup
* **Garanție de contestare**: 1.000 QOR (1.000.000.000 uqor) — necesară pentru a depune o contestare prin demonstrație de fraudă
* **Finalitate**: Întârziată până la expirarea ferestrei de contestare fără o contestare validă
* **Auto-finalizare**: `EndBlocker` finalizează automat loturile odată ce fereastra de contestare a trecut fără dispută

**Ciclul de viață al lotului**:

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Decontare ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Rollup-urile ZK oferă demonstrații criptografice de validitate care garantează corectitudinea tranziției de stare.

* **Sistem de demonstrare**: SNARK (Groth16, PLONK) sau STARK (transparent, fără setup de încredere)
* **Finalitate**: Instantanee la verificarea demonstrației — nu este necesară o fereastră de contestare
* **Dimensiune maximă a demonstrației**: 1 MB (1.048.576 octeți)
* **Adâncime de recursivitate**: Adâncime configurabilă a agregării demonstrațiilor (implicit: 1)
* **Maturitate**: În versiunea curentă, decontarea ZK folosește o verificare stub care acceptă orice demonstrație ne-goală. Verificarea completă a demonstrațiilor SNARK/STARK este o îmbunătățire planificată și ar trebui tratată ca nefiind încă pregătită pentru producție.

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

Verificarea completă a demonstrațiilor STARK și ZK este încă în curs de maturizare; vezi nota de maturitate [Decontare ZK](#zk-zero-knowledge-settlement) de mai sus.

---

## Profiluri prestabilite

RDK include **cinci profiluri prestabilite** care oferă configurații de rollup gata de utilizare, optimizate pentru cazuri de utilizare comune. Fiecare profil prestabilit grupează o paradigmă de decontare, un mod de secvențiator, un backend de disponibilitate a datelor, un model de gas și o VM ajustate pentru domeniul său țintă:

| Profil          | Decontare (demonstrație)       | Secvențiator | DA              | Model de gas    | VM      | Caz de utilizare țintă |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Aplicații de tranzacționare, creditare și de tip AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | Stare de joc și economii în joc cu debit ridicat și latență scăzută |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA planificat) | standard | CosmWasm | Emitere NFT, marketplace-uri și obiecte de colecție digitale |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Implementări cu permisiuni și de consorțiu cu taxe sponsorizate |
| **`custom`**     | complet parametrizat      | complet parametrizat | complet parametrizat | complet parametrizat | complet parametrizat | Fiecare câmp este definit de utilizator |

Profilul `custom` lasă fiecare câmp la latitudinea ta. Valorile exacte grupate în fiecare profil prestabilit pot evolua pe măsură ce RDK se maturizează; interoghează configurația live cu `qorechaind query rdk config` (sau `RdkClient.params()` din `@qorechain/rdk`) pentru parametrii oficiali per profil prestabilit și reține că decontarea `based` se asociază întotdeauna cu modul de secvențiator `based`.

---

## Moduri de secvențiator

Secvențiatorul determină cine ordonează tranzacțiile în cadrul unui bloc de rollup.

### Secvențiator dedicat

Un singur operator secvențiază toate tranzacțiile rollup-ului.

* **Operator**: Adresă unică desemnată
* **Latență**: Cea mai mică posibilă — ordonare de către o singură parte
* **Încredere**: Necesită încredere în operatorul secvențiatorului pentru disponibilitate și ordonare echitabilă

### Secvențiator partajat

Un set de secvențiatori ordonează colectiv tranzacțiile.

* **Dimensiunea minimă a setului**: Configurabilă (implicit: 1)
* **Latență**: Ușor mai mare din cauza coordonării între mai multe părți
* **Încredere**: Distribuită în cadrul setului de secvențiatori

### Secvențiator based

Proponenții L1 QoreChain secvențiază tranzacțiile rollup-ului.

* **Întârziere de includere**: Blocuri configurabile înainte de includerea forțată (implicit: 10)
* **Cotă din taxa de prioritate**: Procent configurabil din taxele de prioritate plătite proponenților L1
* **Încredere**: Moștenește securitatea setului de validatori al QoreChain și rezistența la cenzură
* **Cerință**: Modul de decontare based necesită secvențiatorul based (impus la validare)

---

## Backend-uri de disponibilitate a datelor

### DA nativ

Stocare de blob-uri în KV-store on-chain în interiorul QoreChain.

| Parametru            | Valoare                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Dimensiune maximă a blob-ului**    | 2 MB (2.097.152 octeți)                                                                              |
| **Perioadă de păstrare** | 432.000 blocuri (\~30 de zile la blocuri de 6 secunde)                                                       |
| **Auto-curățare (pruning)**     | Blob-urile expirate sunt curățate în `EndBlocker` — datele sunt eliminate, dar metadatele de commitment sunt păstrate  |
| **Commitment**       | Hash SHA-256 al datelor blob-ului                                                                           |

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
| **Stopped** | Dezafectat permanent — garanția de stake returnată creatorului  |

La creare, starea rollup-ului este setată la `Active` imediat după ce escrow-ul de stake și înregistrarea stratului au reușit.

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

### Reguli de auto-finalizare

| Mod de decontare | Declanșator de finalizare                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | Fereastra de contestare expiră (\~7 zile) fără o contestare validă |
| **ZK**          | Instantaneu la depunerea unei demonstrații valide                           |
| **Based**       | 2 blocuri L1 după trimitere                                |
| **Sovereign**   | Niciunul — gestionat de propriul consens al rollup-ului                |

Auto-finalizarea este executată în `EndBlocker` pentru rollup-urile optimistic și based. Loturile ZK sunt finalizate inline în timpul trimiterii lotului.

---

## Parametrii modulului

| Parametru                   |                          Implicit | Descriere                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Numărul maxim de rollup-uri care pot fi înregistrate |
| `min_stake_for_rollup`      | 10.000.000.000 uqor (10.000 QOR) | Stake minim necesar pentru a crea un rollup        |
| `rollup_creation_burn_rate` |                        0,01 (1%) | Fracțiunea din stake-ul de creare ars prin `x/burn`   |
| `default_challenge_window`  |         604.800 secunde (7 zile) | Fereastra implicită de contestare optimistă              |
| `max_da_blob_size`          |           2.097.152 octeți (2 MB) | Dimensiunea maximă a blob-ului de disponibilitate a datelor              |
| `blob_retention_blocks`     |              432.000 (\~30 de zile) | Blocuri înainte ca blob-urile DA să fie curățate                |
| `max_batches_per_block`     |                               10 | Numărul maxim de loturi de decontare procesate per bloc   |

---

## Integrarea Multilayer

Modulul RDK se integrează cu `x/multilayer` pentru gestionarea stării între straturi:

### Înregistrarea stratului

Când un rollup este creat, acesta este înregistrat automat ca strat de sidechain prin `RegisterSidechain`. Înregistrarea include:

* ID-ul stratului (corespunde ID-ului rollup-ului)
* Timpul țintă al blocului și numărul maxim de tranzacții per bloc
* Tipurile de VM și domeniile suportate
* Intervalul de decontare

Înregistrarea este **non-fatală**: dacă înregistrarea `x/multilayer` eșuează, rollup-ul este totuși creat și un avertisment este înregistrat.

### Ancorarea stării

Fiecare lot de decontare trimis către RDK este ancorat la `x/multilayer` prin `AnchorState`. Acest lucru înregistrează:

* ID-ul stratului și înălțimea stratului (indexul lotului)
* Rădăcina de stare
* Numărul de tranzacții

Ancorarea este **non-fatală**: eșecurile sunt înregistrate, dar nu împiedică procesarea lotului.

---

## Integrarea Burn

La crearea unui rollup, **1% din suma de stake** este ars prin modulul `x/burn` prin canalul de ardere `rollup_create`. De exemplu, crearea unui rollup cu stake-ul minim de 10.000 QOR arde permanent 100 QOR. Restul de 9.900 QOR este păstrat în escrow și returnat când rollup-ul este oprit.
