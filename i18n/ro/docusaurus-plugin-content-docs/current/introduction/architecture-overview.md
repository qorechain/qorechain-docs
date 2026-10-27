---
slug: /introduction/architecture-overview
title: Prezentare generală a arhitecturii
sidebar_label: Prezentare generală a arhitecturii
sidebar_position: 2
---

# Prezentare generală a arhitecturii

QoreChain este un nod blockchain modular compus din trei procese principale — nodul de chain, sidecar-ul AI și indexerul de blocuri — susținute de o bază de date Postgres și monitorizate prin Prometheus și Grafana. Mainnet-ul (`qorechain-vladi`, EVM chain ID **9801**) rulează live din 7 iunie 2026 pe versiunea **v3.2.4** (aplicată la înălțimea 3.742.566, pe 23 octombrie 2026), alături de un testnet paralel (`qorechain-diana`, EVM chain ID **9800**, care rulează v3.2.6 din 27 octombrie 2026). Chain-ul este construit pe Cosmos SDK v0.53. Diagrama de mai jos arată dispunerea componentelor la nivel înalt.

Ciclul de viață al tranzacției de mai jos rezumă modul în care o tranzacție trimisă traversează nodul — de la lanțul de decoratori AnteHandler (verificări de securitate și taxe) până la execuția în VM și decontarea on-chain:

```mermaid
flowchart LR
    Tx[Submitted transaction] --> Lane{Lane}
    Lane -->|Cosmos lane| Ante[AnteHandler chain]
    Lane -->|EVM lane| EAnte[EVM checks]
    EAnte --> Win[Registered PQC key +<br/>EVM authorisation window]
    Win --> Router
    Ante --> PQC[PQC signature verify]
    PQC --> AI[AI anomaly detection]
    AI --> Fair[FairBlock MEV protection]
    Fair --> Fee[Fee deduction & gas abstraction]
    Fee --> Router{VM router}
    Router -->|Solidity| EVM[EVM]
    Router -->|Wasm| Wasm[QoreChain Native]
    Router -->|BPF| SVM[SVM]
    EVM --> Commit[Block commit & indexing]
    Wasm --> Commit
    SVM --> Commit
```

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            QoreChain Node                                  │
│                                                                            │
│  ┌──────────────────── Virtual Machines ──────────────────────┐           │
│  │  ┌───────┐    ┌──────────┐    ┌───────┐                   │           │
│  │  │  EVM  │    │QoreChain │    │  SVM  │                   │           │
│  │  │(Sol.) │◄──►│ Native   │◄──►│ (BPF) │                   │           │
│  │  └───┬───┘    └────┬─────┘    └───┬───┘                   │           │
│  │      └─────────┬───┘──────────────┘                       │           │
│  │           x/crossvm (bridge)                               │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌────────────────────── Tokenomics ─────────────────────────┐           │
│  │  ┌──────┐   ┌───────┐   ┌───────────┐                    │           │
│  │  │x/burn│   │x/xqore│   │x/inflation│                    │           │
│  │  │12 src│   │lock/  │   │capped     │                    │           │
│  │  │37/30/│   │unlock │   │emission   │                    │           │
│  │  │20/10/│   │PvP    │   │emission   │                    │           │
│  │  │3     │   │       │   │590M cap   │                    │           │
│  │  └──────┘   └───────┘   └───────────┘                    │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────── IBC / Bridges ────────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │x/bridge  │  │x/babylon │  │x/abstract │  │x/gas     │ │           │
│  │  │37 QCB    │  │BTC re-   │  │ account   │  │abstract. │ │           │
│  │  │configs   │  │staking   │  │session key│  │multi-tok │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  QCB Bridge     Babylon IBC   ERC-4337-like   ibc/USDC    │           │
│  │  PQC-signed     BTC finality  social recov.   ibc/ATOM    │           │
│  │  36 ext chains  checkpoint    spending rules  fee convert  │           │
│  │  ┌──────────┐                                              │           │
│  │  │x/fair    │  Lane config (not enforced): PQC|MEV|AI|... │           │
│  │  │ block    │  tIBE encrypted mempool framework           │           │
│  │  └──────────┘                                              │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──── Rollup Development Kit ───────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │ x/rdk    │  │Settlement│  │ DA Router │  │ Profiles │ │           │
│  │  │ 4 modes: │  │Optimistic│  │ Native    │  │ defi     │ │           │
│  │  │ opt/zk/  │  │ZK/Based/ │  │ Celestia* │  │ gaming   │ │           │
│  │  │ based/   │  │Sovereign │  │ Both      │  │ nft      │ │           │
│  │  │ sovereign│  │          │  │           │  │ social/  │ │           │
│  │  │          │  │          │  │           │  │ general  │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  Bank escrow    Auto-finalize  SHAKE-256 commit AI-assisted │           │
│  │  Burn on create EndBlocker     Blob pruning    PRISM sugg. │           │
│  │  → x/multilayer (RegisterSidechain + AnchorState)          │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────────┐ ┌──────┐ ┌────────────┐ ┌─────┐                       │
│  │x/rlconsensus │ │ x/ai │ │x/reputation│ │x/qca│                       │
│  │  PRISM (RL)  │ │      │ │            │ │     │                       │
│  └──────┬───────┘ └──┬───┘ └────┬──────┘ └──┬──┘                       │
│   PPO MLP         AI Engine   Scoring    CPoS Pools                      │
│   Obs/Action      Fraud Det.  Decay      Bonding                         │
│   Circuit Brk     Fee Opt.    Sigmoid    Slashing                        │
│   Rollup Adv.     TEE/FL                 QDRW Gov                        │
│                                                                            │
│  ┌──────┐ ┌──────────┐                                                   │
│  │x/pqc │ │ x/multi  │                                                   │
│  └──┬───┘ └────┬─────┘                                                   │
│  Dilithium    Layer Router                                                │
│  ML-KEM       Sidechains                                                  │
│  Hybrid Sig   + Rollups                                                   │
│  SHAKE-256                                                                │
│                                                                            │
│  ┌──────┐ ┌───────┐                                                      │
│  │x/svm │ │x/cross│                                                      │
│  └──┬───┘ └───┬───┘                                                      │
│  BPF Exec   CrossVM Msg                                                   │
└────────┬──────┬───────────────────────────────────────┬───────────────────┘
         │      │                                       │
   ┌─────┴─────┐│                              ┌───────┴──────┐
   │libqorepqc ││                              │  Indexer     │
   │(Rust PQC) ││                              │  (Postgres)  │
   └───────────┘│                              └──────────────┘
   ┌───────────┐│  ┌──────────┐
   │libqoresvm ││  │AI Sidecar│
   │(Rust BPF) │└──│ (gRPC)   │
   └───────────┘   └──────────┘
```

## Componentele nodului

QoreChain rulează sub forma a trei procese care cooperează, fiecare cu propriul modul Go și binar propriu:

| Componentă          | Descriere                                                                                                                                                                                                                                                                                          | Locație                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **qorechain-node** | Nodul central al blockchain-ului. Rulează motorul de consens QoreChain, execută toate modulele custom, gestionează toate cele trei runtime-uri de VM și expune endpoint-uri RPC, REST, gRPC și JSON-RPC.                                                                                                                      | `qorechain-core/`         |
| **ai-sidecar**     | Un serviciu gRPC care oferă capabilități avansate de inferență AI, susținute de QCAI Backend. Sidecar-ul gestionează cererile de inferență care depășesc scopul agentului RL de pe chain, cum ar fi analiza limbajului natural și recunoașterea de tipare complexe. Comunică cu nodul prin gRPC pe portul 50051. | `qorechain-core/sidecar/` |
| **block-indexer**  | Un listener WebSocket care se abonează la blocurile și tranzacțiile noi de la endpoint-ul RPC al nodului, parsează evenimentele și scrie date structurate într-o bază de date Postgres pentru interogare rapidă de către explorere și API-uri.                                                                                                          | `qorechain-core/indexer/` |

## Porturi

| Port  | Protocol       | Serviciu                                                                           |
| ----- | -------------- | --------------------------------------------------------------------------------- |
| 26657 | HTTP/WebSocket | RPC-ul motorului de consens QoreChain (blocuri, tranzacții, stare consens)            |
| 1317  | HTTP           | API REST (endpoint-uri de interogare, broadcast tranzacții)                                 |
| 9090  | gRPC           | Endpoint-uri gRPC pentru interogări și tranzacții                                              |
| 8545  | HTTP           | EVM JSON-RPC (namespace-uri `eth_`, `web3_`, `net_`, `txpool_`)              |
| 8546  | WebSocket      | EVM JSON-RPC (subscripții WebSocket)                                            |
| 8899  | HTTP           | SVM JSON-RPC (compatibil Solana: `getAccountInfo`, `getBalance`, `getSlot` etc.) |
| 50051 | gRPC           | Sidecar AI (cereri de inferență de la nod)                                     |
| 5432  | TCP            | Postgres (stocare pentru indexerul de blocuri)                                                  |
| 26660 | HTTP           | Endpoint de metrici Prometheus al nodului                                         |
| 9091  | HTTP           | Server Prometheus (port de host în stack-ul Docker Compose)                       |
| 3001  | HTTP           | Dashboard-uri Grafana (port de host în stack-ul Docker Compose; port de container 3000) |

## Harta modulelor

QoreChain înregistrează **48 de module la genesis, dintre care 20 sunt specifice QoreChain**, grupate după funcție:

**Securitate**

* `x/pqc` — Criptografie post-cuantică: Dilithium-5, ML-KEM-1024, hibrid secp256k1 (ECDSA) + ML-DSA-87, SHAKE-256, agilitate a algoritmilor

**AI și Machine Learning**

* `x/ai` — Rutare tranzacții, detecție anomalii, detecție fraudă, optimizare taxe, atestare TEE, învățare federată
* `x/reputation` — Scoring de reputație a validatorilor pe bază de factori multipli, cu decădere temporală
* `x/rlconsensus` — Agent RL on-chain (PPO MLP), design pentru ajustarea consensului, circuit breaker, consultanță pentru rollup-uri — stratul de optimizare PRISM (doar observare pe rețelele live: nu este încărcată nicio politică)

**Consens**

* `x/qca` — Design Composite PoS cu trei pool-uri (RPoS/DPoS/PoS), curbă de bonding custom, slashing progresiv, guvernanță QDRW — implementat, dar încă neconectat la producția de blocuri, recompense, slashing sau la tallying-ul de guvernanță

**Mașini virtuale**

* `x/vm` — Rutare și gestionare a ciclului de viață al VM-urilor
* `x/svm` — Runtime SVM: deployment/execuție BPF, colectare de rent, RPC compatibil Solana
* `x/crossvm` — Comunicare cross-VM: precompile EVM-QoreChain Native + evenimente asincrone SVM

**Tokenomics și lichiditate**

* `x/burn` — 12 surse de burn (13 din v3.2.4), distribuție a taxelor în EndBlocker (împărțire 37/30/20/10/3)
* `x/xqore` — Design de staking cu bonus de guvernanță: lock/unlock, penalități de ieșire graduale, rebase PvP (doar contabilitate; tranzacțiile de lock și unlock nu sunt încă conectate pe rețelele live)
* `x/inflation` — Emisiune plafonată: o sumă fixă emisă la fiecare epocă până la atingerea unui plafon cumulativ strict (590.000.000 QOR)
* `x/amm` — Lichiditate on-chain / automated market maker

**Punți și interoperabilitate**

* `x/bridge` — 37 de configurații de chain-uri (36 de chain-uri externe plus Injective prin IBC) acoperind fiecare tip major de chain, atestări semnate PQC, circuit breaker-e (toate configurațiile sunt `pending`; nu sunt live)
* `x/babylon` — Restaking BTC prin Babylon Protocol, checkpoint-uri de epocă (stadiu de design; nicio tranzacție activată)
* `x/multilayer` — Gestionare a stratului de sidechain/paychain/rollup, ancorare de stare

**Guvernanță și extensii de licențiere**

* `x/abstractaccount` — Conturi inteligente: multisig, recuperare socială, chei de sesiune, reguli de cheltuire (oprit pe mainnet, `enabled = false`; activat pe testnet)
* `x/fairblock` — Protecție MEV: framework de mempool criptat prin IBE cu prag (dezactivat pe ambele rețele)
* `x/gasabstraction` — Design de plată de gas cu token multiplu: conversie taxe ibc/USDC, ibc/ATOM (nu este încă acceptat niciun token de taxă IBC, deci taxele se plătesc în QOR)
* `x/license` — Licențiere chain

**Rollup-uri**

* `x/rdk` — Rollup Development Kit: 4 moduri de decontare (optimistic, zk, based, sovereign), profile presetate, DA nativ, escrow în bank

## Lanțul AnteHandler

Fiecare tranzacție trece printr-un lanț de decoratori înainte de execuție; oricare dintre decoratori o poate respinge. Există două lanțuri.

**Lane-ul Cosmos** (în ordine): `RejectMessages` (fără `MsgEthereumTx` pe acest lane) → `AuthzLimiter` (fără mesaje EVM sau de creare a vesting-ului în interiorul authz și, din v3.2.3, fără mesaje de management al cheilor post-cuantice) → `SetUpContext` → gărzi pentru mempool și adâncimea multisig → decoratori QoreChain Native pentru gazul de simulare, contorul de tranzacții, registrul de gaz și contracte → `CircuitBreaker` → verificarea opțiunii de extensie → `ValidateBasic` → `TxTimeout` → `Memo` → poarta de licență a validatorului (`MsgCreateValidator`) → `PQCVerify` → `PQCHybridVerify` → `PQCReplayGuard` → `AIAnomaly` (include limita de rată per expeditor) → `FairBlock` → `SVMComputeBudget` → `SVMDeductFee` → `MinGasPrice` → `ConsumeTxSize` → `GasAbstraction` → `DeductFee` → `SetPubKey` → `ValidateSigCount` → `SigGasConsume` → `SigVerify` → `IncrementSequence` → contorul tranzacțiilor de burn → verificarea relay-ului IBC redundant → urmărirea gazului solicitat.

**Lane-ul EVM** (tranzacții care poartă opțiunea de extensie Ethereum): `CircuitBreaker` → decoratorul mono EVM (verificări de semnătură, nonce, taxe și sold) → `EVMWindowDecorator` (cheie post-cuantică înregistrată și o fereastră de autorizare activă; vezi [Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window)).

Decoratorii cheie de pe lane-ul Cosmos:

1. **PQCVerify** — Modulul `x/pqc`. Verifică semnăturile Dilithium-5 pe tranzacțiile marcate PQC.
2. **PQCHybridVerify** — Modulul `x/pqc`. Verifică semnăturile hibride duale secp256k1 (ECDSA) + ML-DSA-87.
3. **AIAnomaly** — Modulul `x/ai`. Rulează detecția de anomalii prin isolation forest și scoring de risc și impune limita de tranzacții per expeditor.
4. **FairBlock** — Modulul `x/fairblock`. Procesează tranzacțiile criptate tIBE pentru protecție MEV (dezactivat pe rețelele live).
5. **SVMComputeBudget** — Modulul `x/svm`. Validează și alocă unități de calcul pentru programele SVM.
6. **SVMDeductFee** — Modulul `x/svm`. Deduce taxele de execuție specifice SVM.
7. **GasAbstraction** — Modulul `x/gasabstraction`. Convertește token-urile de taxă non-native înainte de deducere (taxele se plătesc în prezent în QOR).

## Stack-ul Docker Compose

Stack-ul complet de dezvoltare rulează ca un deployment Docker Compose cu șase servicii, pe o rețea bridge partajată (`qorechain-net`):

| Serviciu          | Imagine                      | Scop                                             |
| ---------------- | -------------------------- | --------------------------------------------------- |
| `qorechain-node` | `qorechain-core:latest` (construită local din Dockerfile; nu există o imagine de nod publicată) | Nodul de chain cu toate modulele, VM-urile și endpoint-urile RPC |
| `ai-sidecar`     | `ghcr.io/qorechain/ai-sidecar:latest` | Serviciu de inferență AI (gRPC + QCAI Backend)          |
| `block-indexer`  | `ghcr.io/qorechain/block-indexer:latest` | Indexer de blocuri/tranzacții (WebSocket + Postgres)    |
| `postgres`       | `postgres:16-alpine`       | Baza de date pentru indexerul de blocuri                      |
| `prometheus`     | `prom/prometheus:v3.10.0`  | Colectare și stocare de metrici                       |
| `grafana`        | `grafana/grafana:12.4.1`   | Dashboard-uri de monitorizare și alertare               |

Pornește stack-ul complet:

```bash
docker compose up -d
```

Înainte de prima pornire, copiază `.env.example` în `.env` și `.env.sidecar.example` în `.env.sidecar`, apoi setează `GRAFANA_PASSWORD` (Compose refuză să pornească fără ea).

Toate datele persistente sunt stocate în volume Docker denumite: `node-data`, `postgres-data`, `prometheus-data` și `grafana-data`.

## Legături

* [Arhitectură multilayer](/architecture/multilayer-architecture) — înregistrarea sidechain-urilor și ancorarea stării.
* [Mecanism de consens](/architecture/consensus-mechanism) — producția de blocuri, finalitatea și slashing-ul.
* [Motorul de consens PRISM](/architecture/prism-consensus-engine) — optimizarea parametrilor asistată de AI.
* [Securitate post-cuantică](/architecture/post-quantum-security) — semnături Dilithium-5 pe tot stack-ul.
