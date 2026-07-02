---
slug: /api-reference/rest-grpc-endpoints
title: REST-/gRPC-Endpunkte
sidebar_label: REST-/gRPC-Endpunkte
sidebar_position: 1
---

# REST-/gRPC-Endpunkte

QoreChain stellt drei primäre Schnittstellen für den programmatischen Zugriff bereit:

| Schnittstelle | Standard-Port | Protokoll | Beschreibung                        |
| ------------- | ------------- | --------- | ----------------------------------- |
| REST          | `1317`        | HTTP/1.1  | LCD-REST-API (Light Client Daemon)  |
| gRPC          | `9090`        | HTTP/2    | Protobuf-codierter gRPC-Dienst      |
| RPC           | `26657`       | HTTP + WS | QoreChain Consensus Engine RPC      |

Alle REST-Endpunkte liefern JSON zurück. gRPC-Endpunkte verwenden Protocol Buffers und können mit jedem gRPC-Client genutzt werden. Die RPC-Schnittstelle bietet Abfragen auf Konsensebene sowie das Broadcasting von Transaktionen.

:::note
Diese Schnittstellen sind sowohl im **`qorechain-vladi`**-Mainnet (live seit dem 7. Juni 2026 auf Chain-Version **v3.1.82**) als auch im **`qorechain-diana`**-Testnet verfügbar. Die untenstehenden Basis-URLs setzen einen lokal laufenden Node voraus; die öffentlich gehosteten Endpunkte (`rpc/api/evm/svm.qore.host` und ihre `-testnet`-Varianten) sind unter [Netzwerke](/appendix/networks#public-endpoints) aufgeführt.
:::

## Basis-URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI-Modul

| Methode | Endpunkt                           | Beschreibung                                             |
| ------- | ---------------------------------- | -------------------------------------------------------- |
| GET     | `/ai/v1/config`                    | Liefert die aktuelle Konfiguration des AI-Moduls          |
| GET     | `/ai/v1/stats`                     | Aggregierte AI-Verarbeitungsstatistiken                   |
| GET     | `/ai/v1/fee-estimate`              | AI-gestützte Gasgebühren-Schätzung für eine Transaktion   |
| GET     | `/ai/v1/fraud/investigations`      | Listet alle aktiven Betrugsuntersuchungen auf             |
| GET     | `/ai/v1/fraud/investigations/{id}` | Liefert Details zu einer bestimmten Betrugsuntersuchung   |
| GET     | `/ai/v1/network/recommendations`   | AI-generierte Empfehlungen zur Netzwerkoptimierung        |
| GET     | `/ai/v1/circuit-breakers`          | Aktuelle Circuit-Breaker-Zustände und Schwellenwerte      |

## Bridge-Modul {#bridge-module}

Seit Chain-Version **v3.1.77** wird der schreibgeschützte Zustand des Bridge-Moduls über grpc-gateway unter dem Präfix `/qorechain/bridge/v1/...` per REST bereitgestellt (zuvor nur über gRPC). Diese Endpunkte liefern echtes On-Chain-JSON über HTTP für Explorer und Light-Node-Telemetrie. Die Bridge-`config` meldet z. B. `min_validators=10` und `threshold=7`.

| Methode | Endpunkt                                    | Beschreibung                                  |
| ------- | ------------------------------------------- | ---------------------------------------------- |
| GET     | `/qorechain/bridge/v1/config`               | Aktuelle Konfiguration des Bridge-Moduls       |
| GET     | `/qorechain/bridge/v1/chains`               | Listet alle registrierten Bridge-Chains auf    |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`    | Details zu einer bestimmten Bridge-Chain       |
| GET     | `/qorechain/bridge/v1/validators`           | Listet registrierte Bridge-Validatoren auf     |
| GET     | `/qorechain/bridge/v1/validators/{address}` | Details zu einem bestimmten Bridge-Validator   |
| GET     | `/qorechain/bridge/v1/operations`           | Listet Bridge-Operationen auf                  |
| GET     | `/qorechain/bridge/v1/operations/{id}`      | Details zu einer bestimmten Bridge-Operation   |

Die folgenden Endpunkte mit kürzeren Pfaden bleiben weiterhin verfügbar:

| Methode | Endpunkt                            | Beschreibung                                          |
| ------- | ----------------------------------- | ----------------------------------------------------- |
| GET     | `/bridge/v1/chains`                 | Listet alle registrierten Bridge-Chains auf           |
| GET     | `/bridge/v1/chains/{id}`            | Details zu einer bestimmten Bridge-Chain              |
| GET     | `/bridge/v1/validators`             | Listet aktive Bridge-Validatoren auf                  |
| GET     | `/bridge/v1/operations`             | Listet aktuelle Bridge-Operationen auf                |
| GET     | `/bridge/v1/operations/{id}`        | Details zu einer bestimmten Bridge-Operation          |
| GET     | `/bridge/v1/locked/{chain}/{asset}` | Gesamter gesperrter Wert für ein Chain/Asset-Paar     |
| GET     | `/bridge/v1/limits/{chain}`         | Rate-Limits und Schwellenwerte für eine Bridge-Chain  |
| GET     | `/bridge/v1/estimate`               | Schätzt Bridge-Gebühr und Transferdauer               |

## PQC-Modul

| Methode | Endpunkt                     | Beschreibung                                              |
| ------- | ---------------------------- | ---------------------------------------------------------- |
| GET     | `/pqc/v1/params`             | Aktuelle Parameter des PQC-Moduls                          |
| GET     | `/pqc/v1/accounts/{address}` | PQC-Schlüsselstatus für ein bestimmtes Konto               |
| GET     | `/pqc/v1/stats`              | Aggregierte PQC-Registrierungs- und Migrationsstatistiken  |

## Reputation-Modul

| Methode | Endpunkt                              | Beschreibung                                    |
| ------- | ------------------------------------- | ------------------------------------------------ |
| GET     | `/reputation/v1/validators`           | Reputationswerte für alle Validatoren            |
| GET     | `/reputation/v1/validators/{address}` | Reputationswert für einen bestimmten Validator   |

## Cross-VM-Modul

| Methode | Endpunkt                   | Beschreibung                                                      |
| ------- | -------------------------- | ------------------------------------------------------------------ |
| GET     | `/crossvm/v1/message/{id}` | Ruft eine Cross-VM-Nachricht anhand der ID ab                       |
| GET     | `/crossvm/v1/pending`      | Listet ausstehende Cross-VM-Nachrichten in der Warteschlange auf    |
| GET     | `/crossvm/v1/params`       | Aktuelle Parameter des Cross-VM-Moduls                              |

## Multilayer-Modul {#multilayer-module}

Seit Chain-Version **v3.1.80** wird der vollständige Query-Service des Multilayer-Moduls über grpc-gateway unter dem Präfix `/qorechain/multilayer/v1/...` per REST bereitgestellt (zuvor nur über gRPC), einschließlich zweier **State-Anchor-Leseabfragen**: `anchor/{layer_id}` liefert den neuesten Settlement-Anchor eines Layers, und `anchors/{layer_id}` liefert dessen Anchor-Historie. Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder, sodass ein Client einen Anchor abrufen und unabhängig verifizieren kann — die On-Chain-Grundlage für die [Settlement-Receipts](/rollups/settlement-receipts) des Rollup Development Kit.

| Methode | Endpunkt                                       | Beschreibung                                         |
| ------- | ---------------------------------------------- | ----------------------------------------------------- |
| GET     | `/qorechain/multilayer/v1/params`              | Aktuelle Parameter des Multilayer-Moduls              |
| GET     | `/qorechain/multilayer/v1/layers`              | Listet alle registrierten Layer auf                   |
| GET     | `/qorechain/multilayer/v1/layers/{layer_id}`   | Details zu einem bestimmten Layer                     |
| GET     | `/qorechain/multilayer/v1/anchor/{layer_id}`   | Neuester State-Anchor für einen Layer                 |
| GET     | `/qorechain/multilayer/v1/anchors/{layer_id}`  | State-Anchor-Historie für einen Layer                 |
| GET     | `/qorechain/multilayer/v1/routing-stats`       | Transaktions-Routing-Statistiken über alle Layer      |

Eine `StateAnchorView` enthält `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` und `compressed_state_proof`. Die signierte kanonische Nachricht ist `layer_id || layer_height || state_root || validator_set_hash`, verifiziert gegen den registrierten PQC-Schlüssel des Layer-Erstellers.

Die folgenden Endpunkte mit kürzeren Pfaden bleiben weiterhin verfügbar:

| Methode | Endpunkt                       | Beschreibung                                        |
| ------- | ------------------------------ | ---------------------------------------------------- |
| GET     | `/multilayer/v1/layer/{id}`    | Details zu einem bestimmten Layer                    |
| GET     | `/multilayer/v1/layers`        | Listet alle registrierten Layer auf                  |
| GET     | `/multilayer/v1/anchor/{id}`   | Details zu einem bestimmten Anchor-Eintrag           |
| GET     | `/multilayer/v1/anchors`       | Listet aktuelle Anchor-Einreichungen auf             |
| GET     | `/multilayer/v1/routing-stats` | Transaktions-Routing-Statistiken über alle Layer     |
| GET     | `/multilayer/v1/params`        | Aktuelle Parameter des Multilayer-Moduls             |

## SVM-Modul

| Methode | Endpunkt                    | Beschreibung                                                                    |
| ------- | --------------------------- | -------------------------------------------------------------------------------- |
| GET     | `/svm/v1/params`            | Aktuelle Parameter des SVM-Moduls                                                 |
| GET     | `/svm/v1/account/{address}` | SVM-Kontoinformationen für eine bestimmte Adresse                                 |
| GET     | `/svm/v1/program/{address}` | Informationen zum bereitgestellten Programm für eine bestimmte Programmadresse    |

## RL-Konsensus-Modul

PRISM-Tuning-Parameter und der Zustand des Reinforcement-Learning-Agenten werden über dieses Modul bereitgestellt.

| Methode | Endpunkt                      | Beschreibung                                    |
| ------- | ----------------------------- | ------------------------------------------------ |
| GET     | `/rlconsensus/v1/agent`       | Aktueller Status und Modus des PRISM-Agenten     |
| GET     | `/rlconsensus/v1/observation` | Neuester Beobachtungsvektor                      |
| GET     | `/rlconsensus/v1/rewards`     | Kumulative Reward-Metriken                       |
| GET     | `/rlconsensus/v1/params`      | Aktuelle Parameter des PRISM-Konsensus-Moduls    |
| GET     | `/rlconsensus/v1/policy`      | Aktive Policy-Konfiguration und -Gewichte        |

## Burn-Modul

Seit Chain-Version **v3.1.77** wird der schreibgeschützte Zustand des Burn-Moduls über grpc-gateway unter dem Präfix `/qorechain/burn/v1/...` per REST bereitgestellt (zuvor nur über gRPC). Diese Endpunkte liefern echtes On-Chain-JSON über HTTP für Explorer und Light-Node-Telemetrie. Die Burn-`stats` enthalten z. B. `gas_burn_rate=0.30`.

| Methode | Endpunkt                       | Beschreibung                              |
| ------- | ------------------------------ | ------------------------------------------ |
| GET     | `/qorechain/burn/v1/params`    | Aktuelle Parameter des Burn-Moduls         |
| GET     | `/qorechain/burn/v1/stats`     | Burn-Statistiken über alle Kanäle          |
| GET     | `/qorechain/burn/v1/records`   | Listet Burn-Einträge auf                   |
| GET     | `/qorechain/burn/v1/milestone` | Fortschritt der Burn-Meilensteine          |

Die folgenden Endpunkte mit kürzeren Pfaden bleiben weiterhin verfügbar:

| Methode | Endpunkt          | Beschreibung                        |
| ------- | ----------------- | ------------------------------------ |
| GET     | `/burn/v1/stats`  | Burn-Statistiken über alle Kanäle    |
| GET     | `/burn/v1/params` | Aktuelle Parameter des Burn-Moduls   |

## xQORE-Modul

| Methode | Endpunkt                       | Beschreibung                                        |
| ------- | ------------------------------ | ---------------------------------------------------- |
| GET     | `/xqore/v1/position/{address}` | xQORE-Staking-Position für eine bestimmte Adresse    |
| GET     | `/xqore/v1/params`             | Aktuelle Parameter des xQORE-Moduls                  |

## Inflation-Modul

| Methode | Endpunkt               | Beschreibung                                 |
| ------- | ---------------------- | --------------------------------------------- |
| GET     | `/inflation/v1/rate`   | Aktuelle annualisierte Inflationsrate         |
| GET     | `/inflation/v1/epoch`  | Aktuelle Epochennummer und Fortschritt        |
| GET     | `/inflation/v1/params` | Aktuelle Parameter des Inflation-Moduls       |

## RDK-Modul

| Methode | Endpunkt                     | Beschreibung                                 |
| ------- | ---------------------------- | --------------------------------------------- |
| GET     | `/rdk/v1/rollup/{id}`        | Details zu einem bestimmten Rollup            |
| GET     | `/rdk/v1/rollups`            | Listet alle registrierten Rollups auf         |
| GET     | `/rdk/v1/batch/{id}/{index}` | Ruft einen bestimmten Settlement-Batch ab     |
| GET     | `/rdk/v1/batches/{id}`       | Listet Batches für ein bestimmtes Rollup auf  |
| GET     | `/rdk/v1/blob/{id}/{index}`  | Ruft einen bestimmten DA-Blob ab              |
| GET     | `/rdk/v1/params`             | Aktuelle Parameter des RDK-Moduls             |

## Babylon-Modul

| Methode | Endpunkt                         | Beschreibung                                        |
| ------- | -------------------------------- | ---------------------------------------------------- |
| GET     | `/babylon/v1/staking/{address}`  | BTC-Staking-Position für eine bestimmte Adresse      |
| GET     | `/babylon/v1/checkpoint/{epoch}` | BTC-Checkpoint-Daten für eine bestimmte Epoche       |
| GET     | `/babylon/v1/params`             | Aktuelle Parameter des Babylon-Moduls                |

## Abstract-Account-Modul

| Methode | Endpunkt                                | Beschreibung                                         |
| ------- | --------------------------------------- | ----------------------------------------------------- |
| GET     | `/abstractaccount/v1/account/{address}` | Abstract-Account-Details für eine bestimmte Adresse   |
| GET     | `/abstractaccount/v1/params`            | Aktuelle Parameter des Abstract-Account-Moduls        |

## FairBlock-Modul

| Methode | Endpunkt               | Beschreibung                                       |
| ------- | ---------------------- | --------------------------------------------------- |
| GET     | `/fairblock/v1/config` | Aktuelle FairBlock-Verschlüsselungskonfiguration    |
| GET     | `/fairblock/v1/params` | Aktuelle Parameter des FairBlock-Moduls             |

## Gas-Abstraction-Modul

| Methode | Endpunkt                             | Beschreibung                                       |
| ------- | ------------------------------------ | --------------------------------------------------- |
| GET     | `/gasabstraction/v1/accepted-tokens` | Listet für Gaszahlungen akzeptierte Tokens auf      |
| GET     | `/gasabstraction/v1/params`          | Aktuelle Parameter des Gas-Abstraction-Moduls       |

## gRPC-Reflection

Die gRPC-Server-Reflection ist standardmäßig aktiviert, sodass Tools wie `grpcurl` verfügbare Dienste erkennen können:

```bash
grpcurl -plaintext localhost:9090 list
```

So fragen Sie einen bestimmten Dienst ab:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Authentifizierung

Alle REST- und gRPC-Endpunkte sind standardmäßig nicht authentifiziert. Für Produktionsumgebungen sollte ein Reverse-Proxy (z. B. Nginx oder Caddy) vor dem Node platziert werden, der TLS-Terminierung und Zugriffskontrolle übernimmt.
