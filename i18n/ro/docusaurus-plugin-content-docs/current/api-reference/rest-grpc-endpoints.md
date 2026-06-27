---
slug: /api-reference/rest-grpc-endpoints
title: Endpoint-uri REST / gRPC
sidebar_label: Endpoint-uri REST / gRPC
sidebar_position: 1
---

# Endpoint-uri REST / gRPC

QoreChain expune trei interfețe principale pentru acces programatic:

| Interfață | Port implicit | Protocol  | Descriere                          |
| --------- | ------------- | --------- | ---------------------------------- |
| REST      | `1317`        | HTTP/1.1  | API REST LCD (Light Client Daemon) |
| gRPC      | `9090`        | HTTP/2    | Serviciu gRPC codat în Protobuf    |
| RPC       | `26657`       | HTTP + WS | RPC al motorului de consens QoreChain |

Toate endpoint-urile REST returnează JSON. Endpoint-urile gRPC folosesc Protocol Buffers și pot fi consumate cu orice client gRPC. Interfața RPC oferă interogări la nivel de consens și difuzarea tranzacțiilor.

:::note
Aceste interfețe sunt disponibile atât pe mainnet-ul **`qorechain-vladi`** (activ de pe 7 iunie 2026 pe versiunea de lanț **v3.1.77**), cât și pe testnet-ul **`qorechain-diana`**. URL-urile de bază de mai jos presupun un nod care rulează local; înlocuiește cu host-ul de mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

## URL-uri de bază

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Modulul AI

| Metodă | Endpoint                           | Descriere                                          |
| ------ | ---------------------------------- | -------------------------------------------------- |
| GET    | `/ai/v1/config`                    | Returnează configurația curentă a modulului AI     |
| GET    | `/ai/v1/stats`                     | Statistici agregate de procesare AI                |
| GET    | `/ai/v1/fee-estimate`              | Estimarea taxei de gas asistată de AI pentru o tranzacție |
| GET    | `/ai/v1/fraud/investigations`      | Listează toate investigațiile de fraudă active     |
| GET    | `/ai/v1/fraud/investigations/{id}` | Returnează detaliile pentru o investigație de fraudă specifică |
| GET    | `/ai/v1/network/recommendations`   | Recomandări de optimizare a rețelei generate de AI |
| GET    | `/ai/v1/circuit-breakers`          | Stările și pragurile curente ale circuit breaker-elor |

## Modulul Bridge {#bridge-module}

Începând cu versiunea de lanț **v3.1.77**, starea read-only a modulului bridge este expusă prin REST via grpc-gateway sub prefixul `/qorechain/bridge/v1/...` (anterior doar gRPC). Aceste endpoint-uri servesc JSON real on-chain prin HTTP pentru exploratoare și telemetria nodurilor light. `config`-ul bridge-ului raportează, de exemplu, `min_validators=10` și `threshold=7`.

| Metodă | Endpoint                                   | Descriere                                |
| ------ | ------------------------------------------ | ---------------------------------------- |
| GET    | `/qorechain/bridge/v1/config`              | Configurația curentă a modulului bridge  |
| GET    | `/qorechain/bridge/v1/chains`              | Listează toate lanțurile bridge înregistrate |
| GET    | `/qorechain/bridge/v1/chains/{chain_id}`   | Detalii pentru un lanț pontat specific    |
| GET    | `/qorechain/bridge/v1/validators`          | Listează validatorii bridge înregistrați  |
| GET    | `/qorechain/bridge/v1/validators/{address}`| Detalii pentru un validator bridge specific |
| GET    | `/qorechain/bridge/v1/operations`          | Listează operațiunile bridge             |
| GET    | `/qorechain/bridge/v1/operations/{id}`     | Detalii pentru o operațiune bridge specifică |

Următoarele endpoint-uri cu cale mai scurtă rămân disponibile:

| Metodă | Endpoint                            | Descriere                                      |
| ------ | ----------------------------------- | ---------------------------------------------- |
| GET    | `/bridge/v1/chains`                 | Listează toate lanțurile bridge înregistrate   |
| GET    | `/bridge/v1/chains/{id}`            | Detalii pentru un lanț pontat specific          |
| GET    | `/bridge/v1/validators`             | Listează validatorii bridge activi             |
| GET    | `/bridge/v1/operations`             | Listează operațiunile bridge recente           |
| GET    | `/bridge/v1/operations/{id}`        | Detalii pentru o operațiune bridge specifică   |
| GET    | `/bridge/v1/locked/{chain}/{asset}` | Valoarea totală blocată pentru o pereche lanț/activ |
| GET    | `/bridge/v1/limits/{chain}`         | Limite de rată și praguri pentru un lanț pontat |
| GET    | `/bridge/v1/estimate`               | Estimează taxa de bridge și timpul de transfer |

## Modulul PQC

| Metodă | Endpoint                     | Descriere                                      |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | `/pqc/v1/params`             | Parametrii curenți ai modulului PQC            |
| GET    | `/pqc/v1/accounts/{address}` | Starea cheii PQC pentru un cont specific       |
| GET    | `/pqc/v1/stats`              | Statistici agregate de înregistrare și migrare PQC |

## Modulul Reputation

| Metodă | Endpoint                              | Descriere                                 |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/reputation/v1/validators`           | Scoruri de reputație pentru toți validatorii |
| GET    | `/reputation/v1/validators/{address}` | Scor de reputație pentru un validator specific |

## Modulul Cross-VM

| Metodă | Endpoint                   | Descriere                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/crossvm/v1/message/{id}` | Recuperează un mesaj cross-VM după ID    |
| GET    | `/crossvm/v1/pending`      | Listează mesajele cross-VM în așteptare din coadă |
| GET    | `/crossvm/v1/params`       | Parametrii curenți ai modulului Cross-VM |

## Modulul Multilayer

| Metodă | Endpoint                       | Descriere                                  |
| ------ | ------------------------------ | -------------------------------------------- |
| GET    | `/multilayer/v1/layer/{id}`    | Detalii pentru un strat specific             |
| GET    | `/multilayer/v1/layers`        | Listează toate straturile înregistrate       |
| GET    | `/multilayer/v1/anchor/{id}`   | Detalii pentru o înregistrare de ancoră specifică |
| GET    | `/multilayer/v1/anchors`       | Listează trimiterile recente de ancore       |
| GET    | `/multilayer/v1/routing-stats` | Statistici de rutare a tranzacțiilor între straturi |
| GET    | `/multilayer/v1/params`        | Parametrii curenți ai modulului Multilayer   |

## Modulul SVM

| Metodă | Endpoint                    | Descriere                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/svm/v1/params`            | Parametrii curenți ai modulului SVM               |
| GET    | `/svm/v1/account/{address}` | Informații despre contul SVM pentru o adresă dată |
| GET    | `/svm/v1/program/{address}` | Informații despre programul implementat pentru o adresă de program dată |

## Modulul RL Consensus

Parametrii de reglaj PRISM și starea agentului de învățare prin întărire sunt expuse prin acest modul.

| Metodă | Endpoint                      | Descriere                               |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/rlconsensus/v1/agent`       | Starea și modul curent al agentului PRISM |
| GET    | `/rlconsensus/v1/observation` | Cel mai recent vector de observație      |
| GET    | `/rlconsensus/v1/rewards`     | Metrici cumulative de recompensă         |
| GET    | `/rlconsensus/v1/params`      | Parametrii curenți ai modulului PRISM Consensus |
| GET    | `/rlconsensus/v1/policy`      | Configurația și ponderile politicii active |

## Modulul Burn

Începând cu versiunea de lanț **v3.1.77**, starea read-only a modulului burn este expusă prin REST via grpc-gateway sub prefixul `/qorechain/burn/v1/...` (anterior doar gRPC). Aceste endpoint-uri servesc JSON real on-chain prin HTTP pentru exploratoare și telemetria nodurilor light. `stats`-ul de ardere include, de exemplu, `gas_burn_rate=0.30`.

| Metodă | Endpoint                       | Descriere                            |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/qorechain/burn/v1/params`    | Parametrii curenți ai modulului Burn |
| GET    | `/qorechain/burn/v1/stats`     | Statistici de ardere pe toate canalele |
| GET    | `/qorechain/burn/v1/records`   | Listează înregistrările de ardere    |
| GET    | `/qorechain/burn/v1/milestone` | Progresul reperelor de ardere        |

Următoarele endpoint-uri cu cale mai scurtă rămân disponibile:

| Metodă | Endpoint          | Descriere                           |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/burn/v1/stats`  | Statistici de ardere pe toate canalele |
| GET    | `/burn/v1/params` | Parametrii curenți ai modulului Burn |

## Modulul xQORE

| Metodă | Endpoint                       | Descriere                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/xqore/v1/position/{address}` | Poziția de staking xQORE pentru o adresă dată |
| GET    | `/xqore/v1/params`             | Parametrii curenți ai modulului xQORE    |

## Modulul Inflation

| Metodă | Endpoint               | Descriere                           |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/inflation/v1/rate`   | Rata de inflație curentă anualizată |
| GET    | `/inflation/v1/epoch`  | Numărul epocii curente și progresul |
| GET    | `/inflation/v1/params` | Parametrii curenți ai modulului Inflation |

## Modulul RDK

| Metodă | Endpoint                     | Descriere                             |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/rdk/v1/rollup/{id}`        | Detalii pentru un rollup specific     |
| GET    | `/rdk/v1/rollups`            | Listează toate rollup-urile înregistrate |
| GET    | `/rdk/v1/batch/{id}/{index}` | Recuperează un lot de decontare specific |
| GET    | `/rdk/v1/batches/{id}`       | Listează loturile pentru un rollup specific |
| GET    | `/rdk/v1/blob/{id}/{index}`  | Recuperează un blob DA specific       |
| GET    | `/rdk/v1/params`             | Parametrii curenți ai modulului RDK   |

## Modulul Babylon

| Metodă | Endpoint                         | Descriere                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Poziția de staking BTC pentru o adresă dată |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Date despre checkpoint-ul BTC pentru o epocă dată |
| GET    | `/babylon/v1/params`             | Parametrii curenți ai modulului Babylon  |

## Modulul Abstract Account

| Metodă | Endpoint                                | Descriere                                  |
| ------ | --------------------------------------- | -------------------------------------------- |
| GET    | `/abstractaccount/v1/account/{address}` | Detaliile contului abstract pentru o adresă dată |
| GET    | `/abstractaccount/v1/params`            | Parametrii curenți ai modulului Abstract Account |

## Modulul FairBlock

| Metodă | Endpoint               | Descriere                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/fairblock/v1/config` | Configurația curentă a criptării FairBlock |
| GET    | `/fairblock/v1/params` | Parametrii curenți ai modulului FairBlock  |

## Modulul Gas Abstraction

| Metodă | Endpoint                             | Descriere                               |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/gasabstraction/v1/accepted-tokens` | Listează tokenurile acceptate pentru plata gas-ului |
| GET    | `/gasabstraction/v1/params`          | Parametrii curenți ai modulului Gas Abstraction |

## Reflexie gRPC

Reflexia serverului gRPC este activată implicit, permițând instrumentelor precum `grpcurl` să descopere serviciile disponibile:

```bash
grpcurl -plaintext localhost:9090 list
```

Pentru a interoga un serviciu specific:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Autentificare

Toate endpoint-urile REST și gRPC sunt neautentificate implicit. Pentru implementări în producție, plasează un reverse proxy (de exemplu, Nginx sau Caddy) în fața nodului pentru a gestiona terminarea TLS și controlul accesului.
