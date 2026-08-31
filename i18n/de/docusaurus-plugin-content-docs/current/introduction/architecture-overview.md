---
slug: /introduction/architecture-overview
title: Architektur-Überblick
sidebar_label: Architektur-Überblick
sidebar_position: 2
---

# Architektur-Überblick

QoreChain ist ein modularer Blockchain-Node, der aus drei primären Prozessen besteht — dem Chain-Node, dem AI-Sidecar und dem Block-Indexer — abgesichert durch eine Postgres-Datenbank und überwacht mittels Prometheus und Grafana. Das Mainnet (`qorechain-vladi`, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 live, auf Chain-Version **v3.1.95**, mit einem parallelen Testnet (`qorechain-diana`, EVM-Chain-ID **9800**). Die Chain basiert auf dem Cosmos SDK v0.53. Das folgende Diagramm zeigt den Aufbau der Komponenten auf hoher Ebene.

Der nachfolgende Transaktions-Lebenszyklus fasst zusammen, wie eine übermittelte Transaktion durch den Node läuft — von der AnteHandler-Decorator-Kette (Sicherheits- und Gebührenprüfungen) über die VM-Ausführung bis zur On-Chain-Abwicklung:

```mermaid
flowchart LR
    Tx[Submitted transaction] --> Ante[AnteHandler chain]
    Ante --> PQC[PQC signature verify]
    PQC --> AI[AI anomaly detection]
    AI --> Fair[FairBlock MEV protection]
    Fair --> Fee[Fee deduction & gas abstraction]
    Fee --> Router{VM router}
    Router -->|Solidity| EVM[EVM]
    Router -->|Wasm| Wasm[CosmWasm]
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
│  │  │  EVM  │    │ CosmWasm │    │  SVM  │                   │           │
│  │  │(Sol.) │◄──►│ (Wasm)   │◄──►│ (BPF) │                   │           │
│  │  └───┬───┘    └────┬─────┘    └───┬───┘                   │           │
│  │      └─────────┬───┘──────────────┘                       │           │
│  │           x/crossvm (bridge)                               │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌────────────────────── Tokenomics ─────────────────────────┐           │
│  │  ┌──────┐   ┌───────┐   ┌───────────┐                    │           │
│  │  │x/burn│   │x/xqore│   │x/inflation│                    │           │
│  │  │10 ch.│   │lock/  │   │finite     │                    │           │
│  │  │37/30/│   │unlock │   │emission   │                    │           │
│  │  │20/10/│   │PvP    │   │590M       │                    │           │
│  │  │3     │   │       │   │budget     │                    │           │
│  │  └──────┘   └───────┘   └───────────┘                    │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────── IBC / Bridges ────────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │x/bridge  │  │x/babylon │  │x/abstract │  │x/gas     │ │           │
│  │  │37 QCB +  │  │BTC re-   │  │ account   │  │abstract. │ │           │
│  │  │8 IBC     │  │staking   │  │session key│  │multi-tok │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  QCB Bridge     Babylon IBC   ERC-4337-like   ibc/USDC    │           │
│  │  PQC-signed     BTC finality  social recov.   ibc/ATOM    │           │
│  │  36 ext chains  checkpoint    spending rules  fee convert  │           │
│  │  ┌──────────┐                                              │           │
│  │  │x/fair    │  5-Lane Prioritization: PQC|MEV|AI|Def|Free │           │
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
│  │  Bank escrow    Auto-finalize  SHA-256 commit  AI-assisted │           │
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

## Node-Komponenten

QoreChain läuft als drei zusammenarbeitende Prozesse, jeder mit eigenem Go-Modul und eigener Binary:

| Komponente          | Beschreibung                                                                                                                                                                                                                                                                                          | Ort                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **qorechain-node** | Der zentrale Blockchain-Node. Betreibt die QoreChain Consensus Engine, führt alle Custom-Module aus, verwaltet alle drei VM-Laufzeiten und stellt RPC-, REST-, gRPC- und JSON-RPC-Endpunkte bereit.                                                                                                                      | `qorechain-core/`         |
| **ai-sidecar**     | Ein gRPC-Dienst, der erweiterte KI-Inferenz-Fähigkeiten bereitstellt, gestützt durch das QCAI-Backend. Der Sidecar behandelt Inferenz-Anfragen, die über den Umfang des On-Chain-RL-Agenten hinausgehen, etwa Analyse natürlicher Sprache und komplexe Mustererkennung. Kommuniziert mit dem Node per gRPC auf Port 50051. | `qorechain-core/sidecar/` |
| **block-indexer**  | Ein WebSocket-Listener, der neue Blöcke und Transaktionen vom RPC-Endpunkt des Nodes abonniert, Events parst und strukturierte Daten in eine Postgres-Datenbank schreibt, für schnelle Abfragen durch Explorer und APIs.                                                                                                          | `qorechain-core/indexer/` |

## Ports

| Port  | Protokoll       | Dienst                                                                           |
| ----- | -------------- | --------------------------------------------------------------------------------- |
| 26657 | HTTP/WebSocket | QoreChain Consensus Engine RPC (Blöcke, Transaktionen, Konsensstatus)            |
| 1317  | HTTP           | REST-API (Abfrage-Endpunkte, Transaktions-Broadcast)                                 |
| 9090  | gRPC           | gRPC-Abfrage- und Transaktions-Endpunkte                                              |
| 8545  | HTTP           | EVM JSON-RPC (`eth_`, `web3_`, `net_`, `txpool_`, `qor_` Namespaces)              |
| 8546  | WebSocket      | EVM JSON-RPC (WebSocket-Subscriptions)                                            |
| 8899  | HTTP           | SVM JSON-RPC (Solana-kompatibel: `getAccountInfo`, `getBalance`, `getSlot`, usw.) |
| 50051 | gRPC           | AI-Sidecar (Inferenz-Anfragen vom Node)                                     |
| 5432  | TCP            | Postgres (Speicher des Block-Indexers)                                                  |
| 9091  | HTTP           | Prometheus-Metriken                                                                |
| 3000  | HTTP           | Grafana-Dashboards                                                                |

## Modul-Übersicht

QoreChain registriert **45+ Genesis-Module, davon 20+ Custom-Module**, gruppiert nach Funktion:

**Sicherheit**

* `x/pqc` — Post-Quanten-Kryptografie: Dilithium-5, ML-KEM-1024, hybrides secp256k1 (ECDSA) + ML-DSA-87, SHAKE-256, Algorithmus-Agilität

**KI und Machine Learning**

* `x/ai` — Transaktions-Routing, Anomalieerkennung, Betrugserkennung, Gebührenoptimierung, TEE-Attestierung, föderiertes Lernen
* `x/reputation` — Multi-Faktor-Reputationsbewertung für Validatoren mit zeitlichem Abklingen
* `x/rlconsensus` — On-Chain-RL-Agent (PPO MLP), dynamische Konsens-Feinabstimmung, Circuit Breaker, Rollup-Beratung — die PRISM-Optimierungsschicht

**Konsens**

* `x/qca` — Triple-Pool Composite PoS (RPoS/DPoS/PoS) auf der QoreChain Consensus Engine, eigene Bonding-Curve, progressives Slashing, QDRW-Governance

**Virtuelle Maschinen**

* `x/vm` — VM-Routing und Lifecycle-Management
* `x/svm` — SVM-Laufzeit: BPF-Deployment/-Ausführung, Rent-Erhebung, Solana-kompatible RPC
* `x/crossvm` — Cross-VM-Kommunikation: EVM-CosmWasm-Precompile + asynchrone SVM-Events

**Tokenomics und Liquidität**

* `x/burn` — 10 Burn-Kanäle, EndBlocker-Gebührenverteilung (37/30/20/10/3-Split)
* `x/xqore` — Governance-verstärktes Staking: Lock/Unlock, gestaffelte Ausstiegsstrafen, PvP-Rebase
* `x/inflation` — Fixe Emission mit begrenztem Angebot aus einem endlichen Staking-Reward-Budget über einen Mehrjahresplan
* `x/amm` — On-Chain-Liquidität / automatisierter Market Maker

**Bridges und Interoperabilität**

* `x/bridge` — 37 QCB-Konfigurationen (36 externe Chains + QoreChain-Loopback) über jeden wichtigen Chain-Typ hinweg, PQC-signierte Attestierungen, Circuit Breaker
* `x/babylon` — BTC-Restaking über Babylon Protocol, Epochen-Checkpoints
* `x/multilayer` — Verwaltung der Sidechain-/Paychain-/Rollup-Schicht, State-Anchoring

**Governance- und Lizenz-Erweiterungen**

* `x/abstractaccount` — Smart Accounts: Multisig, Social Recovery, Session Keys, Spending Rules
* `x/fairblock` — MEV-Schutz: Threshold-IBE-verschlüsseltes Mempool-Framework
* `x/gasabstraction` — Gebührenzahlung mit mehreren Token: ibc/USDC-, ibc/ATOM-Gebührenkonvertierung
* `x/license` — Chain-Lizenzierung

**Rollups**

* `x/rdk` — Rollup Development Kit: 4 Settlement-Modi (optimistic, zk, based, sovereign), vorgefertigte Profile, native DA, Bank-Escrow

## AnteHandler-Kette

Jede Transaktion durchläuft vor der Ausführung die folgende Decorator-Kette. Die Decorators laufen der Reihe nach; jeder Decorator kann die Transaktion ablehnen.

```
SetUpContext
  → CircuitBreaker
    → PQCVerify
      → PQCHybridVerify
        → AIAnomaly
          → FairBlock
            → SVMComputeBudget
              → SVMDeductFee
                → Extension
                  → ValidateBasic
                    → TxTimeout
                      → Memo
                        → MinGasPrice
                          → ConsumeTxSize
                            → GasAbstraction
                              → DeductFee
                                → SetPubKey
                                  → ValidateSigCount
                                    → SigGasConsume
                                      → SigVerify
                                        → IncrementSequence
```

Die wichtigsten Decorators laufen in folgender Reihenfolge (jeder Decorator läuft der Reihe nach und kann eine Transaktion ablehnen):

1. **PQCVerify** — Modul `x/pqc`. Verifiziert Dilithium-5-Signaturen bei PQC-gekennzeichneten Transaktionen.
2. **PQCHybridVerify** — Modul `x/pqc`. Verifiziert duale secp256k1 (ECDSA) + ML-DSA-87 Hybrid-Signaturen.
3. **AIAnomaly** — Modul `x/ai`. Führt Isolation-Forest-Anomalieerkennung und Risikobewertung durch.
4. **FairBlock** — Modul `x/fairblock`. Verarbeitet tIBE-verschlüsselte Transaktionen zum MEV-Schutz.
5. **SVMComputeBudget** — Modul `x/svm`. Validiert und reserviert Compute-Units für SVM-Programme.
6. **SVMDeductFee** — Modul `x/svm`. Zieht SVM-spezifische Ausführungsgebühren ab.
7. **GasAbstraction** — Modul `x/gasabstraction`. Konvertiert nicht-native Gebühren-Token (USDC, ATOM) vor dem Abzug.

## Docker-Compose-Stack

Der vollständige Entwicklungs-Stack läuft als sechs-teiliges Docker-Compose-Deployment auf einem gemeinsamen Bridge-Netzwerk (`qorechain-net`):

| Dienst          | Image                      | Zweck                                             |
| ---------------- | -------------------------- | --------------------------------------------------- |
| `qorechain-node` | `qorechain-core:latest`    | Chain-Node mit allen Modulen, VMs und RPC-Endpunkten |
| `ai-sidecar`     | `qorechain-sidecar:latest` | KI-Inferenzdienst (gRPC + QCAI-Backend)          |
| `block-indexer`  | `qorechain-indexer:latest` | Block-/Transaktions-Indexer (WebSocket + Postgres)    |
| `postgres`       | `postgres:16-alpine`       | Datenbank für den Block-Indexer                      |
| `prometheus`     | `prom/prometheus:latest`   | Metrikerfassung und -speicherung                      |
| `grafana`        | `grafana/grafana:latest`   | Monitoring-Dashboards und Alerting                  |

Den vollständigen Stack starten:

```bash
docker compose up -d
```

Alle persistenten Daten werden in benannten Docker-Volumes gespeichert: `node-data`, `postgres-data`, `prometheus-data` und `grafana-data`.

## Siehe auch

* [Multilayer-Architektur](/architecture/multilayer-architecture) — Sidechain-Registrierung und State-Anchoring.
* [Konsensmechanismus](/architecture/consensus-mechanism) — Blockproduktion, Finalität und Slashing.
* [PRISM Consensus Engine](/architecture/prism-consensus-engine) — KI-gesteuerte Parameteroptimierung.
* [Post-Quanten-Sicherheit](/architecture/post-quantum-security) — Dilithium-5-Signaturen im gesamten Stack.
