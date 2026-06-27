---
slug: /architecture/ai-engine
title: Motor AI
sidebar_label: Motor AI
sidebar_position: 4
---

# Motor AI

QoreChain integrează capabilități AI la mai multe niveluri ale stivei de protocol prin modulul `x/ai`. Stratul on-chain oferă analiză deterministă bazată pe euristici, potrivită pentru operațiuni critice pentru consens, în timp ce un sidecar off-chain extinde capabilitățile cu modele de învățare profundă pentru consiliere și instrumente pentru dezvoltatori.

## Arhitectură pe trei straturi

Motorul QCAI (QoreChain AI) operează pe trei straturi:

| Strat                 | Domeniu                                                  | Execuție                | Determinist |
| --------------------- | ------------------------------------------------------ | ------------------------ | ------------- |
| **Nivel consens**   | Producția de blocuri, ajustarea parametrilor                     | On-chain (x/rlconsensus) | Da           |
| **Nivel rețea**     | Rutarea tranzacțiilor, detectarea fraudei, optimizarea taxelor | On-chain (x/ai)          | Da           |
| **Nivel aplicație** | Generarea de contracte, auditarea, analiza profundă            | Off-chain (sidecar)      | Nu            |

Nivelul de consens este documentat separat în [Motorul de consens PRISM](/architecture/prism-consensus-engine). Această pagină acoperă nivelurile de rețea și de aplicație.

## Router de tranzacții

Routerul îmbunătățit cu AI selectează validatorii și rutele optime pentru fiecare tranzacție folosind scorare multi-factor ponderată.

### Formula de optimizare

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Pondere   | Simbol | Implicit | Descriere                                                                      |
| -------- | ------ | ------- | -------------------------------------------------------------------------------- |
| Latență  | alpha  | 0.4     | Timp de răspuns normalizat (0=cel mai bun, 1=cel mai prost). 0ms se mapează la 0.0, 1000ms se mapează la 1.0. |
| Cost     | beta   | 0.3     | Procentul de încărcare curentă ca proxy pentru cost.                                     |
| Securitate | gamma  | 0.3     | Inversul scorului de reputație. O reputație mai mare produce un scor mai mic (mai bun).    |

Routerul menține un **cache de metrici** (TTL implicit: 30 de secunde) cu date de performanță per validator, incluzând latența medie, procentul de uptime, procentul de încărcare și scorul de reputație. Când metricile din cache nu sunt disponibile, sistemul revine la routerul euristic.

### Încrederea în rutare

Încrederea scalează cu numărul de validatori care au metrici disponibile:

| Validatori cu metrici | Încredere |
| ----------------------- | ---------- |
| >= 10                   | 0.95       |
| >= 5                    | 0.85       |
| >= 2                    | 0.75       |
| 1                       | 0.60       |

## Detectarea fraudei

Detectorul de fraudă implementează o **pipeline de detectare pe șase straturi** care analizează fiecare tranzacție comparativ cu istoricul recent folosind metode statistice.

### Straturi de detectare

| Strat | Detector                | Metodă                                                                | Prag de declanșare                                          |
| ----- | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1     | **Isolation Forest**    | Z-score statistic pe caracteristicile de sumă, gaz și frecvență a expeditorului | Scor de anomalie > 0.7                                        |
| 2     | **Sequence Analyzer**   | Detectează tipare alternante de trimitere/primire (wash trading)              | > 3 transferuri alternante între aceeași pereche                |
| 3     | **Sybil Detector**      | Urmărește noile adrese unice; semnalează vârfuri de expeditori noi               | > 30% din tranzacțiile recente provenind de la adrese noi            |
| 4     | **DDoS Detector**       | Monitorizează frecvența tranzacțiilor per expeditor                             | > 100 de tranzacții pe minut de la un singur expeditor         |
| 5     | **Flash Loan Detector** | Identifică tipare împrumut-manipulare-rambursare în cadrul unui singur bloc     | >= 3 tranzacții în același bloc cu variație a sumei > 10x |
| 6     | **Exploit Detector**    | Semnalează consum anormal de gaz în apelurile de contract                       | > de 5x gazul mediu pentru același tip de tranzacție         |

### Clasificarea amenințărilor

| Interval de încredere | Nivel de amenințare |
| ---------------- | ------------ |
| >= 0.9           | Critic     |
| >= 0.7           | Ridicat         |
| >= 0.5           | Mediu       |
| >= 0.3           | Scăzut          |
| &lt; 0.3         | Niciunul         |

### Acțiuni de răspuns

| Nivel de amenințare | Încredere | Acțiune                                                       |
| ------------ | ---------- | ------------------------------------------------------------ |
| Critic     | > 0.8      | `circuit_break` — Suspendă execuții specifice de contracte         |
| Critic     | &lt;= 0.8  | `rate_limit` — Reduce temporar acceptarea TX de la sursă  |
| Ridicat         | > 0.7      | `rate_limit`                                                 |
| Ridicat         | &lt;= 0.7  | `alert` — Emite un eveniment pentru validatori și operatori            |
| Mediu       | Oricare        | `alert`                                                      |
| Scăzut / Niciunul   | Oricare        | `allow`                                                      |

Când este declanșată o acțiune diferită de `allow`, se creează o înregistrare de investigație a fraudei cu un ID unic (format: `INV-{timestamp}-{txhash_prefix}`).

## Optimizator de taxe

Optimizatorul de taxe prezice congestia rețelei și sugerează taxe optime pentru timpii de confirmare doriți, folosind urmărirea congestiei prin medie mobilă exponențială (EMA).

### Predicția congestiei

* **Factor de netezire EMA (alpha)**: 0.2
* **Fereastră de istoric**: 100 de blocuri
* **Analiză de tendință**: Compară cele mai recente 5 blocuri cu cele 5 blocuri anterioare pentru a detecta tendințe de congestie, apoi proiectează înainte cu o amortizare de 50%.

### Niveluri de urgență

| Urgență  | Multiplicator de bază | Confirmare estimată |
| -------- | --------------- | ---------------------- |
| `fast`   | 2.0x            | 1-2 blocuri             |
| `normal` | 1.0x            | 3-5 blocuri             |
| `slow`   | 0.5x            | 6-10 blocuri            |

Taxa finală încorporează un **multiplicator de congestie** (1.0x la 0% congestie, până la 5.0x la 100% congestie) și o **primă de tendință** atunci când congestia prezisă depășește congestia curentă. Pragul minim al taxei este de 500 uqor (0.0005 QOR).

## Optimizator de rețea

Optimizatorul de rețea monitorizează continuu metricile de performanță și generează recomandări de parametri de guvernanță folosind o funcție de recompensă multi-obiectiv.

### Funcția de recompensă

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Pondere | Valoare | Obiectiv               |
| ------ | ----- | ----------------------- |
| alpha  | 0.35  | Îmbunătățirea performanței |
| beta   | 0.30  | Reducerea latenței       |
| gamma  | 0.15  | Economii de energie/resurse |
| delta  | 0.20  | Păstrarea stabilității  |

### Tipuri de recomandări

Optimizatorul generează recomandări pentru:

* **Limita de gaz pe bloc**: Crește când utilizarea > 80%, scade când &lt; 20%
* **Rata minimă de comision**: Scade când numărul de validatori este sub 5
* **Numărul maxim de validatori**: Crește când timpii de bloc sunt sănătoși și >= 10 validatori sunt activi
* **Ținta timpului de bloc**: Alertează când timpul mediu de bloc depășește 8 secunde

Fiecare recomandare include valoarea curentă, valoarea sugerată, impactul așteptat, scorul de încredere și raționamentul.

## Sidecar AI

Sidecar-ul QCAI extinde AI-ul on-chain cu modele de învățare profundă off-chain susținute de QCAI Backend. Sidecar-ul este opțional și nu este critic pentru consens și este accesat printr-o interfață gRPC internă.

### Capabilități

| Capabilitate              | Descriere                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Generarea de contracte** | Generează contracte inteligente din specificații în limbaj natural pe 17 platforme  |
| **Auditarea contractelor**   | Analiză profundă de securitate a codului contractelor inteligente                                       |
| **Analiză profundă a fraudei** | Investigație extinsă a fraudei folosind modele antrenate (suplimentează euristicile on-chain) |
| **Consiliere de rețea**      | Recomandări avansate de optimizare a parametrilor                                     |

### Modele

| Nume model    | Caz de utilizare                                             |
| ------------- | ---------------------------------------------------- |
| QCAI Fast     | Răspunsuri cu latență scăzută pentru estimarea taxelor și rutare |
| QCAI Balanced | Analiză mai profundă pentru auditare și investigarea fraudei |

Sidecar-ul rulează ca un serviciu off-chain independent, astfel încât sarcinile de învățare profundă să nu blocheze sau să influențeze niciodată execuția critică pentru consens.

## Precompilate EVM

Două contracte precompilate expun capabilitățile AI on-chain către contractele inteligente EVM:

| Precompilat       | Adresă  | Descriere                                                           |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Returnează un scor de risc (0-100) pentru o adresă sau un hash de tranzacție dat  |
| `aiAnomalyCheck` | `0x0B02` | Returnează un indicator boolean de anomalie și un scor de încredere pentru o tranzacție |

**Important**: Precompilatele EVM folosesc **doar motorul euristic determinist**. Ele nu apelează niciodată sidecar-ul, asigurând că întreaga execuție EVM rămâne complet deterministă și reproductibilă.

## Atestare TEE

Modulul AI definește interfețe pentru atestarea în **Mediu de Execuție de Încredere** (Trusted Execution Environment), permițând în viitor execuția verificabilă a modelelor AI în interiorul unor enclave hardware sigure.

### Platforme suportate

| Platformă    | Identificator | Descriere                                            |
| ----------- | ---------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`      | Software Guard Extensions                              |
| Intel TDX   | `tdx`      | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`  | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`  | Confidential Compute Architecture                      |

### Fluxul de atestare

1. **Încarcă ponderile modelului** — Sidecar-ul încarcă ponderile modelului AI într-o enclavă TEE.
2. **Rulează inferența în interiorul enclavei** — Inferența rulează în memoria protejată a enclavei.
3. **Produce raportul de atestare** — Enclava produce un raport de atestare care leagă hash-ul modelului, hash-ul de intrare și hash-ul de ieșire.
4. **Verifică atestarea on-chain** — Validatorii verifică atestarea on-chain înainte de a accepta rezultatele inferenței.

Atestarea TEE se află în prezent în stadiul de specificație a interfeței. Implementarea este planificată pentru o versiune viitoare.

## Învățare federată

Modulul AI definește interfețe pentru coordonarea **învățării federate on-chain**, în care nodurile validatoare antrenează modele locale și trimit actualizări de gradient care sunt agregate într-un model global fără a partaja datele brute de antrenament.

### Metode de agregare

| Metodă     | Descriere                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — media ponderată a gradienților după numărul de eșantioane     |
| `fedprox`  | Federated Proximal — adaugă un termen proximal pentru a gestiona date eterogene  |
| `scaffold` | SCAFFOLD — folosește variabile de control pentru a corecta deriva clienților            |

### Ciclul de viață al rundei

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Fiecare rundă este configurată cu participanți minimi/maximi, timeout, rată de învățare, normă de clipping a gradientului și un multiplicator opțional de zgomot pentru confidențialitate diferențială. Toate trimiterile de gradient sunt semnate cu semnături PQC (Dilithium-5).

Învățarea federată se află în prezent în stadiul de specificație a interfeței. Implementarea este planificată pentru o versiune viitoare.

## Endpoint-uri REST

| Endpoint                         | Descriere                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| `/ai/v1/fee-estimate`            | Returnează estimări de taxe pentru nivelurile de urgență fast, normal și slow |
| `/ai/v1/fraud/investigations`    | Listează investigațiile de fraudă active și rezolvate                 |
| `/ai/v1/network/recommendations` | Returnează recomandările curente de optimizare a parametrilor de rețea |
| `/ai/v1/circuit-breakers`        | Listează stările active ale întrerupătoarelor de circuit pentru contracte              |

## Conexe

* [Motorul de consens PRISM](/architecture/prism-consensus-engine) — stratul AI care conduce optimizarea consensului.
* [Creator de contracte inteligente](/dashboard/smart-contract-creator) — generarea de contracte asistată de AI în Dashboard.
* [Auditor de contracte](/dashboard/contract-auditor) — revizuirea securității contractelor asistată de AI.
