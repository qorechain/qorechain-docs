---
slug: /api-reference/rest-grpc-endpoints
title: Puncte finale REST / gRPC
sidebar_label: Puncte finale REST / gRPC
sidebar_position: 1
---

# Puncte finale REST / gRPC

QoreChain expune trei interfețe principale pentru acces programatic:

| Interfață | Port implicit | Protocol  | Descriere                          |
| --------- | ------------- | --------- | ---------------------------------- |
| REST      | `1317`        | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC      | `9090`        | HTTP/2    | Serviciu gRPC codificat Protobuf   |
| RPC       | `26657`       | HTTP + WS | RPC al motorului de consens QoreChain |

Toate punctele finale REST returnează JSON. Punctele finale gRPC folosesc Protocol Buffers și pot fi consumate cu orice client gRPC. Interfața RPC oferă interogări la nivel de consens și difuzarea tranzacțiilor.

:::note
Aceste interfețe sunt disponibile atât pe rețeaua principală **`qorechain-vladi`** (activă din 7 iunie 2026 pe versiunea de lanț **v3.1.80**), cât și pe rețeaua de test **`qorechain-diana`**. URL-urile de bază de mai jos presupun un nod care rulează local; înlocuiește gazda de rețea principală sau de test a furnizorului tău pentru acces de la distanță.
:::

## URL-uri de bază

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Modulul AI

| Metodă | Punct final                        | Descriere                                          |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Returnează configurația curentă a modulului AI     |
| GET    | `/ai/v1/stats`                     | Statistici agregate de procesare AI                |
| GET    | `/ai/v1/fee-estimate`              | Estimare a taxei de gaz asistată de AI pentru o tranzacție |
| GET    | `/ai/v1/fraud/investigations`      | Listează toate investigațiile active de fraudă     |
| GET    | `/ai/v1/fraud/investigations/{id}` | Returnează detalii pentru o anumită investigație de fraudă |
| GET    | `/ai/v1/network/recommendations`   | Recomandări de optimizare a rețelei generate de AI |
| GET    | `/ai/v1/circuit-breakers`          | Stările și pragurile curente ale întrerupătoarelor de circuit |

## Modulul Bridge {#bridge-module}

Începând cu versiunea de lanț **v3.1.77**, starea în regim doar-citire a modulului bridge este expusă prin REST via grpc-gateway sub prefixul `/qorechain/bridge/v1/...` (anterior disponibilă doar prin gRPC). Aceste puncte finale servesc JSON real de pe lanț prin HTTP pentru exploratoare și telemetria nodurilor ușoare. Configurația `config` a bridge-ului raportează, de exemplu, `min_validators=10` și `threshold=7`.

| Metodă | Punct final                                | Descriere                                |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configurația curentă a modulului bridge  |
| GET    | `/qorechain/bridge/v1/chains`              | Listează toate lanțurile bridge înregistrate |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Detalii pentru un anumit lanț punte      |
| GET    | `/qorechain/bridge/v1/validators`          | Listează validatorii bridge înregistrați |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Detalii pentru un anumit validator bridge |
| GET    | `/qorechain/bridge/v1/operations`          | Listează operațiunile bridge             |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Detalii pentru o anumită operațiune bridge |

Următoarele puncte finale cu cale scurtă rămân disponibile:

| Metodă | Punct final                         | Descriere                                      |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Listează toate lanțurile bridge înregistrate   |
| GET    | `/bridge/v1/chains/{id}`            | Detalii pentru un anumit lanț punte            |
| GET    | `/bridge/v1/validators`             | Listează validatorii bridge activi             |
| GET    | `/bridge/v1/operations`             | Listează operațiunile bridge recente           |
| GET    | `/bridge/v1/operations/{id}`        | Detalii pentru o anumită operațiune bridge     |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valoarea totală blocată pentru o pereche lanț/activ |
| GET    | `/bridge/v1/limits/{chain}`         | Limite de rată și praguri pentru un lanț punte |
| GET    | `/bridge/v1/estimate`               | Estimează taxa și timpul de transfer al bridge-ului |

## Modulul PQC

| Metodă | Punct final                  | Descriere                                      |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Parametrii curenți ai modulului PQC            |
| GET    | `/pqc/v1/accounts/{address}` | Starea cheii PQC pentru un anumit cont         |
| GET    | `/pqc/v1/stats`              | Statistici agregate de înregistrare și migrare PQC |

## Modulul Reputation

| Metodă | Punct final                           | Descriere                                 |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Scoruri de reputație pentru toți validatorii |
| GET    | `/reputation/v1/validators/{address}` | Scor de reputație pentru un anumit validator |

## Modulul Cross-VM

| Metodă | Punct final                | Descriere                                |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Recuperează un mesaj cross-VM după ID    |
| GET    | `/crossvm/v1/pending`      | Listează mesajele cross-VM în așteptare din coadă |
| GET    | `/crossvm/v1/params`       | Parametrii curenți ai modulului Cross-VM |

## Modulul Multilayer {#multilayer-module}

Începând cu versiunea de lanț **v3.1.80**, serviciul complet de interogare al modulului multilayer este expus prin REST via grpc-gateway sub prefixul `/qorechain/multilayer/v1/...` (anterior disponibil doar prin gRPC), inclusiv două **interogări de citire a ancorelor de stare**: `anchor/{layer_id}` returnează cea mai recentă ancoră de decontare pentru un layer, iar `anchors/{layer_id}` returnează istoricul ancorelor acestuia. Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, astfel încât un client poate prelua o ancoră și o poate verifica independent — baza de pe lanț pentru [chitanțele de decontare](/rollups/settlement-receipts) ale Rollup Development Kit.

| Metodă | Punct final                                     | Descriere                                         |
| ------ | ----------------------------------------------- | ------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Parametrii curenți ai modulului Multilayer        |
| GET    | `/qorechain/multilayer/v1/layers`               | Listează toate layerele înregistrate              |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Detalii pentru un anumit layer                    |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Cea mai recentă ancoră de stare pentru un layer   |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Istoricul ancorelor de stare pentru un layer      |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistici de rutare a tranzacțiilor între layere |

O `StateAnchorView` conține `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` și `compressed_state_proof`. Mesajul canonic semnat este `layer_id || layer_height || state_root || validator_set_hash`, verificat față de cheia PQC înregistrată a creatorului layerului.

Următoarele puncte finale cu cale scurtă rămân disponibile:

| Metodă | Punct final                    | Descriere                                    |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Detalii pentru un anumit layer               |
| GET    | `/multilayer/v1/layers`        | Listează toate layerele înregistrate         |
| GET    | `/multilayer/v1/anchor/{id}`   | Detalii pentru o anumită înregistrare de ancoră |
| GET    | `/multilayer/v1/anchors`       | Listează trimiterile recente de ancore       |
| GET    | `/multilayer/v1/routing-stats` | Statistici de rutare a tranzacțiilor între layere |
| GET    | `/multilayer/v1/params`        | Parametrii curenți ai modulului Multilayer   |

## Modulul SVM

| Metodă | Punct final                 | Descriere                                         |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parametrii curenți ai modulului SVM               |
| GET    | `/svm/v1/account/{address}` | Informații despre contul SVM pentru o adresă dată |
| GET    | `/svm/v1/program/{address}` | Informații despre programul implementat pentru o adresă de program dată |

## Modulul RL Consensus

Parametrii de reglare PRISM și starea agentului de învățare prin întărire sunt expuse prin acest modul.

| Metodă | Punct final                   | Descriere                               |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Starea și modul curent al agentului PRISM |
| GET    | `/rlconsensus/v1/observation` | Cel mai recent vector de observație     |
| GET    | `/rlconsensus/v1/rewards`     | Metrici cumulate de recompensă          |
| GET    | `/rlconsensus/v1/params`      | Parametrii curenți ai modulului PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configurația și ponderile politicii active |

## Modulul Burn

Începând cu versiunea de lanț **v3.1.77**, starea în regim doar-citire a modulului burn este expusă prin REST via grpc-gateway sub prefixul `/qorechain/burn/v1/...` (anterior disponibilă doar prin gRPC). Aceste puncte finale servesc JSON real de pe lanț prin HTTP pentru exploratoare și telemetria nodurilor ușoare. Statisticile `stats` ale burn-ului includ, de exemplu, `gas_burn_rate=0.30`.

| Metodă | Punct final                    | Descriere                            |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Parametrii curenți ai modulului Burn |
| GET    | `/qorechain/burn/v1/stats`     | Statistici de burn pe toate canalele |
| GET    | `/qorechain/burn/v1/records`   | Listează înregistrările de burn      |
| GET    | `/qorechain/burn/v1/milestone` | Progresul jaloanelor de burn         |

Următoarele puncte finale cu cale scurtă rămân disponibile:

| Metodă | Punct final       | Descriere                            |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | Statistici de burn pe toate canalele |
| GET    | `/burn/v1/params` | Parametrii curenți ai modulului Burn |

## Modulul xQORE

| Metodă | Punct final                    | Descriere                                  |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Poziția de staking xQORE pentru o adresă dată |
| GET    | `/xqore/v1/params`             | Parametrii curenți ai modulului xQORE      |

## Modulul Inflation

| Metodă | Punct final            | Descriere                           |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Rata anualizată curentă a inflației |
| GET    | `/inflation/v1/epoch`  | Numărul și progresul epocii curente |
| GET    | `/inflation/v1/params` | Parametrii curenți ai modulului Inflation |

## Modulul RDK

| Metodă | Punct final                  | Descriere                             |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Detalii pentru un anumit rollup       |
| GET    | `/rdk/v1/rollups`            | Listează toate rollupurile înregistrate |
| GET    | `/rdk/v1/batch/{id}/{index}` | Recuperează un anumit lot de decontare |
| GET    | `/rdk/v1/batches/{id}`       | Listează loturile pentru un anumit rollup |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Recuperează un anumit blob DA         |
| GET    | `/rdk/v1/params`             | Parametrii curenți ai modulului RDK   |

## Modulul Babylon

| Metodă | Punct final                      | Descriere                                |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Poziția de staking BTC pentru o adresă dată |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Date de checkpoint BTC pentru o epocă dată |
| GET    | `/babylon/v1/params`             | Parametrii curenți ai modulului Babylon  |

## Modulul Abstract Account

| Metodă | Punct final                             | Descriere                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Detalii ale contului abstract pentru o adresă dată |
| GET    | `/abstractaccount/v1/params`            | Parametrii curenți ai modulului Abstract Account |

## Modulul FairBlock

| Metodă | Punct final            | Descriere                                  |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Configurația curentă de criptare FairBlock |
| GET    | `/fairblock/v1/params` | Parametrii curenți ai modulului FairBlock  |

## Modulul Gas Abstraction

| Metodă | Punct final                          | Descriere                                 |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Listează tokenurile acceptate pentru plata gazului |
| GET    | `/gasabstraction/v1/params`          | Parametrii curenți ai modulului Gas Abstraction |

## Reflexie gRPC

Reflexia serverului gRPC este activată implicit, permițând unor instrumente precum `grpcurl` să descopere serviciile disponibile:

```bash
grpcurl -plaintext localhost:9090 list
```

Pentru a interoga un anumit serviciu:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autentificare

Toate punctele finale REST și gRPC sunt neautentificate implicit. Pentru implementări în producție, plasează un proxy invers (de exemplu, Nginx sau Caddy) în fața nodului pentru a gestiona terminarea TLS și controlul accesului.
