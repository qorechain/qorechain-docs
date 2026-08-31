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
| RPC       | `26657`       | HTTP + WS | RPC al QoreChain Consensus Engine  |

Toate punctele finale REST returnează JSON. Punctele finale gRPC folosesc Protocol Buffers și pot fi consumate cu orice client gRPC. Interfața RPC oferă interogări la nivel de consens și difuzarea tranzacțiilor.

:::note
Aceste interfețe sunt disponibile atât pe mainnet-ul **`qorechain-vladi`** (live din 7 iunie 2026, pe versiunea de chain **v3.1.95**), cât și pe testnet-ul **`qorechain-diana`**. URL-urile de bază de mai jos presupun un nod care rulează local; punctele finale publice găzduite (`rpc/api/evm/svm.qore.host` și variantele lor `-testnet`) sunt listate în [Rețele](/appendix/networks#public-endpoints).
:::

## URL-uri de bază

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Modulul AI

| Metodă | Punct final                        | Descriere                                                  |
| ------ | ---------------------------------- | ----------------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Returnează configurația curentă a modulului AI               |
| GET    | `/ai/v1/stats`                     | Statistici agregate de procesare AI                          |
| GET    | `/ai/v1/fee-estimate`              | Estimare a taxei de gas asistată de AI pentru o tranzacție   |
| GET    | `/ai/v1/fraud/investigations`      | Listează toate investigațiile de fraudă active               |
| GET    | `/ai/v1/fraud/investigations/{id}` | Returnează detaliile unei investigații de fraudă specifice   |
| GET    | `/ai/v1/network/recommendations`   | Recomandări de optimizare a rețelei generate de AI           |
| GET    | `/ai/v1/circuit-breakers`          | Stările și pragurile curente ale circuit breaker-elor        |

## Modulul Bridge {#bridge-module}

Începând cu versiunea de chain **v3.1.77**, starea read-only a modulului bridge este expusă prin REST via grpc-gateway sub prefixul `/qorechain/bridge/v1/...` (anterior doar gRPC). Aceste puncte finale servesc JSON on-chain real prin HTTP pentru exploratoare și telemetria nodurilor light. `config`-ul bridge-ului raportează de ex. `min_validators=10` și `threshold=7`.

| Metodă | Punct final                                 | Descriere                                             |
| ------ | ------------------------------------------- | ------------------------------------------------------ |
| GET    | `/qorechain/bridge/v1/config`               | Configurația curentă a modulului bridge                |
| GET    | `/qorechain/bridge/v1/chains`               | Listează toate chain-urile bridge înregistrate         |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`    | Detalii pentru un anumit chain conectat prin bridge    |
| GET    | `/qorechain/bridge/v1/validators`           | Listează validatorii bridge înregistrați               |
| GET    | `/qorechain/bridge/v1/validators/{address}` | Detalii pentru un anumit validator bridge              |
| GET    | `/qorechain/bridge/v1/operations`           | Listează operațiunile bridge                           |
| GET    | `/qorechain/bridge/v1/operations/{id}`      | Detalii pentru o anumită operațiune bridge             |

Următoarele puncte finale cu cale mai scurtă rămân disponibile:

| Metodă | Punct final                         | Descriere                                                      |
| ------ | ----------------------------------- | --------------------------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Listează toate chain-urile bridge înregistrate                  |
| GET    | `/bridge/v1/chains/{id}`            | Detalii pentru un anumit chain conectat prin bridge             |
| GET    | `/bridge/v1/validators`             | Listează validatorii bridge activi                              |
| GET    | `/bridge/v1/operations`             | Listează operațiunile bridge recente                            |
| GET    | `/bridge/v1/operations/{id}`        | Detalii pentru o anumită operațiune bridge                      |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valoarea totală blocată pentru o pereche chain/activ            |
| GET    | `/bridge/v1/limits/{chain}`         | Limite de rată și praguri pentru un chain conectat prin bridge  |
| GET    | `/bridge/v1/estimate`               | Estimează taxa de bridge și timpul de transfer                  |

## Modulul PQC

| Metodă | Punct final                  | Descriere                                              |
| ------ | ---------------------------- | ------------------------------------------------------ |
| GET    | `/pqc/v1/params`             | Parametrii curenți ai modulului PQC                    |
| GET    | `/pqc/v1/accounts/{address}` | Starea cheii PQC pentru un anumit cont                 |
| GET    | `/pqc/v1/stats`              | Statistici agregate de înregistrare și migrare PQC     |

## Modulul Reputation

| Metodă | Punct final                           | Descriere                                        |
| ------ | ------------------------------------- | ------------------------------------------------ |
| GET    | `/reputation/v1/validators`           | Scorurile de reputație pentru toți validatorii   |
| GET    | `/reputation/v1/validators/{address}` | Scorul de reputație pentru un anumit validator   |

## Modulul Cross-VM

| Metodă | Punct final                | Descriere                                          |
| ------ | -------------------------- | --------------------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Preia un mesaj cross-VM după ID                     |
| GET    | `/crossvm/v1/pending`      | Listează mesajele cross-VM în așteptare din coadă   |
| GET    | `/crossvm/v1/params`       | Parametrii curenți ai modulului Cross-VM            |

## Modulul Multilayer {#multilayer-module}

Începând cu versiunea de chain **v3.1.80**, serviciul complet de interogare al modulului multilayer este expus prin REST via grpc-gateway sub prefixul `/qorechain/multilayer/v1/...` (anterior doar gRPC), incluzând două **interogări de citire a ancorelor de stare**: `anchor/{layer_id}` returnează cea mai recentă ancoră de decontare pentru un layer, iar `anchors/{layer_id}` returnează istoricul ancorelor acestuia. Fiecare ancoră poartă o semnătură **ML-DSA-87 (Dilithium-5)** peste câmpurile sale canonice, astfel încât un client poate prelua o ancoră și o poate verifica independent — baza on-chain pentru [chitanțele de decontare](/rollups/settlement-receipts) ale Rollup Development Kit-ului.

| Metodă | Punct final                                     | Descriere                                          |
| ------ | ----------------------------------------------- | --------------------------------------------------- |
| GET    | `/qorechain/multilayer/v1/params`               | Parametrii curenți ai modulului Multilayer          |
| GET    | `/qorechain/multilayer/v1/layers`               | Listează toate layer-ele înregistrate               |
| GET    | `/qorechain/multilayer/v1/layers/{layer_id}`    | Detalii pentru un anumit layer                      |
| GET    | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Cea mai recentă ancoră de stare pentru un layer     |
| GET    | `/qorechain/multilayer/v1/anchors/{layer_id}`   | Istoricul ancorelor de stare pentru un layer        |
| GET    | `/qorechain/multilayer/v1/routing-stats`        | Statistici de rutare a tranzacțiilor între layere   |

Un `StateAnchorView` conține `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` și `compressed_state_proof`. Mesajul canonic semnat este `layer_id || layer_height || state_root || validator_set_hash`, verificat față de cheia PQC înregistrată a creatorului layer-ului.

Următoarele puncte finale cu cale mai scurtă rămân disponibile:

| Metodă | Punct final                    | Descriere                                            |
| ------ | ------------------------------ | ----------------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Detalii pentru un anumit layer                        |
| GET    | `/multilayer/v1/layers`        | Listează toate layer-ele înregistrate                 |
| GET    | `/multilayer/v1/anchor/{id}`   | Detalii pentru o anumită înregistrare de ancoră       |
| GET    | `/multilayer/v1/anchors`       | Listează trimiterile recente de ancore                |
| GET    | `/multilayer/v1/routing-stats` | Statistici de rutare a tranzacțiilor între layere     |
| GET    | `/multilayer/v1/params`        | Parametrii curenți ai modulului Multilayer            |

## Modulul SVM

| Metodă | Punct final                 | Descriere                                                              |
| ------ | --------------------------- | ----------------------------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parametrii curenți ai modulului SVM                                     |
| GET    | `/svm/v1/account/{address}` | Informații despre contul SVM pentru o adresă dată                       |
| GET    | `/svm/v1/program/{address}` | Informații despre programul implementat pentru o adresă de program dată |

## Modulul RL Consensus

Parametrii de reglare PRISM și starea agentului de reinforcement learning sunt expuși prin acest modul.

| Metodă | Punct final                   | Descriere                                        |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/rlconsensus/v1/agent`       | Starea și modul curent al agentului PRISM        |
| GET    | `/rlconsensus/v1/observation` | Cel mai recent vector de observație              |
| GET    | `/rlconsensus/v1/rewards`     | Metrici de recompensă cumulative                 |
| GET    | `/rlconsensus/v1/params`      | Parametrii curenți ai modulului PRISM Consensus  |
| GET    | `/rlconsensus/v1/policy`      | Configurația și ponderile politicii active       |

## Modulul Burn

Începând cu versiunea de chain **v3.1.77**, starea read-only a modulului burn este expusă prin REST via grpc-gateway sub prefixul `/qorechain/burn/v1/...` (anterior doar gRPC). Aceste puncte finale servesc JSON on-chain real prin HTTP pentru exploratoare și telemetria nodurilor light. `stats`-urile de burn includ de ex. `gas_burn_rate=0.30`.

| Metodă | Punct final                    | Descriere                                 |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Parametrii curenți ai modulului Burn       |
| GET    | `/qorechain/burn/v1/stats`     | Statistici de burn pe toate canalele       |
| GET    | `/qorechain/burn/v1/records`   | Listează înregistrările de burn            |
| GET    | `/qorechain/burn/v1/milestone` | Progresul milestone-ului de burn           |

Următoarele puncte finale cu cale mai scurtă rămân disponibile:

| Metodă | Punct final       | Descriere                            |
| ------ | ----------------- | ------------------------------------ |
| GET    | `/burn/v1/stats`  | Statistici de burn pe toate canalele |
| GET    | `/burn/v1/params` | Parametrii curenți ai modulului Burn |

## Modulul xQORE

| Metodă | Punct final                    | Descriere                                         |
| ------ | ------------------------------ | -------------------------------------------------- |
| GET    | `/xqore/v1/position/{address}` | Poziția de staking xQORE pentru o adresă dată      |
| GET    | `/xqore/v1/params`             | Parametrii curenți ai modulului xQORE              |

## Modulul Inflation

| Metodă | Punct final            | Descriere                                     |
| ------ | ---------------------- | ---------------------------------------------- |
| GET    | `/inflation/v1/rate`   | Rata anualizată curentă a inflației            |
| GET    | `/inflation/v1/epoch`  | Numărul epocii curente și progresul acesteia   |
| GET    | `/inflation/v1/params` | Parametrii curenți ai modulului Inflation      |

## Modulul RDK

| Metodă | Punct final                  | Descriere                                     |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Detalii pentru un anumit rollup                |
| GET    | `/rdk/v1/rollups`            | Listează toate rollup-urile înregistrate       |
| GET    | `/rdk/v1/batch/{id}/{index}` | Preia un anumit batch de decontare             |
| GET    | `/rdk/v1/batches/{id}`       | Listează batch-urile pentru un anumit rollup   |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Preia un anumit blob DA                        |
| GET    | `/rdk/v1/params`             | Parametrii curenți ai modulului RDK            |

## Modulul Babylon

| Metodă | Punct final                      | Descriere                                       |
| ------ | -------------------------------- | ------------------------------------------------ |
| GET    | `/babylon/v1/staking/{address}`  | Poziția de staking BTC pentru o adresă dată      |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Datele checkpoint-ului BTC pentru o epocă dată   |
| GET    | `/babylon/v1/params`             | Parametrii curenți ai modulului Babylon          |

## Modulul Abstract Account

Începând cu versiunea de chain **v3.1.85**, serviciul de interogare abstract-account este expus prin REST via grpc-gateway sub prefixul `/qorechain/abstractaccount/v1/...`, incluzând **schema de permisiuni** folosită pentru a valida scopurile [autentificatorilor](/developer-guide/account-abstraction#authenticators) fără hardcodare.

| Metodă | Punct final                                           | Descriere                                                             |
| ------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/qorechain/abstractaccount/v1/config`                | Configurația modulului (feature-probe: `enabled`)                       |
| GET    | `/qorechain/abstractaccount/v1/accounts`              | Listează conturile abstracte                                            |
| GET    | `/qorechain/abstractaccount/v1/accounts/{address}`    | Starea contului abstract pentru o adresă                                |
| GET    | `/qorechain/abstractaccount/v1/permission_schema`     | Taxonomia permisiunilor, maparea msg→permisiune, msg-uri nedelegabile   |

Următoarele puncte finale cu cale mai scurtă rămân disponibile:

| Metodă | Punct final                             | Descriere                                          |
| ------ | --------------------------------------- | --------------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Detaliile contului abstract pentru o adresă dată    |
| GET    | `/abstractaccount/v1/params`            | Parametrii curenți ai modulului Abstract Account    |

## Modulul FairBlock

| Metodă | Punct final            | Descriere                                    |
| ------ | ---------------------- | --------------------------------------------- |
| GET    | `/fairblock/v1/config` | Configurația curentă de criptare FairBlock    |
| GET    | `/fairblock/v1/params` | Parametrii curenți ai modulului FairBlock     |

## Modulul Gas Abstraction

| Metodă | Punct final                          | Descriere                                          |
| ------ | ------------------------------------ | --------------------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Listează tokenii acceptați pentru plata gas-ului    |
| GET    | `/gasabstraction/v1/params`          | Parametrii curenți ai modulului Gas Abstraction     |

## Reflecție gRPC

Reflecția serverului gRPC este activată implicit, permițând unor unelte precum `grpcurl` să descopere serviciile disponibile:

```bash
grpcurl -plaintext localhost:9090 list
```

Pentru a interoga un anumit serviciu:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autentificare

Toate punctele finale REST și gRPC sunt neautentificate implicit. Pentru implementările de producție, plasați un reverse proxy (de ex. Nginx sau Caddy) în fața nodului pentru a gestiona terminarea TLS și controlul accesului.
