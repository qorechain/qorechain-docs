---
slug: /api-reference/rest-grpc-endpoints
title: REST-/gRPC-Endpunkte
sidebar_label: REST-/gRPC-Endpunkte
sidebar_position: 1
---

# REST-/gRPC-Endpunkte

QoreChain stellt drei primäre Schnittstellen für den programmatischen Zugriff bereit:

| Schnittstelle | Standardport | Protokoll | Beschreibung                       |
| -------------- | ------------ | --------- | ----------------------------------- |
| REST      | `1317`       | HTTP/1.1  | LCD (Light Client Daemon) REST-API |
| gRPC      | `9090`       | HTTP/2    | Protobuf-codierter gRPC-Dienst     |
| RPC       | `26657`      | HTTP + WS | QoreChain-Consensus-Engine-RPC     |

Alle REST-Endpunkte liefern JSON zurück. gRPC-Endpunkte verwenden Protocol Buffers und können mit jedem gRPC-Client genutzt werden. Die RPC-Schnittstelle stellt Abfragen auf Konsensebene sowie das Broadcasten von Transaktionen bereit.

:::note
Diese Schnittstellen sind sowohl im **`qorechain-vladi`**-Mainnet (live seit 7. Juni 2026 unter Chain-Version **v3.1.92**) als auch im **`qorechain-diana`**-Testnet verfügbar. Die unten angegebenen Basis-URLs gehen von einem lokal laufenden Node aus; die öffentlich gehosteten Endpunkte (`rpc/api/evm/svm.qore.host` und ihre `-testnet`-Varianten) sind unter [Networks](/appendix/networks#public-endpoints) aufgeführt.
:::

## Basis-URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## AI-Modul

| Methode | Endpunkt                           | Beschreibung                                        |
| ------- | ----------------------------------- | ---------------------------------------------------- |
| GET     | `/ai/v1/config`                    | Gibt die aktuelle Konfiguration des AI-Moduls zurück |
| GET     | `/ai/v1/stats`                     | Aggregierte Statistiken zur AI-Verarbeitung          |
| GET     | `/ai/v1/fee-estimate`              | KI-gestützte Gasgebührenschätzung für eine Transaktion |
| GET     | `/ai/v1/fraud/investigations`      | Listet alle aktiven Betrugsermittlungen auf          |
| GET     | `/ai/v1/fraud/investigations/{id}` | Gibt Details zu einer bestimmten Betrugsermittlung zurück |
| GET     | `/ai/v1/network/recommendations`   | KI-generierte Empfehlungen zur Netzwerkoptimierung   |
| GET     | `/ai/v1/circuit-breakers`          | Aktuelle Zustände und Schwellenwerte der Circuit Breaker |

## Bridge-Modul {#bridge-module}

Seit Chain-Version **v3.1.77** wird der schreibgeschützte Zustand des Bridge-Moduls über REST via grpc-gateway unter dem Präfix `/qorechain/bridge/v1/...` bereitgestellt (zuvor nur über gRPC). Diese Endpunkte liefern echte On-Chain-JSON-Daten über HTTP für Explorer und Light-Node-Telemetrie. Die Bridge-`config` meldet z. B. `min_validators=10` und `threshold=7`.

| Methode | Endpunkt                                    | Beschreibung                              |
| ------- | -------------------------------------------- | ------------------------------------------ |
| GET     | `/qorechain/bridge/v1/config`              | Aktuelle Konfiguration des Bridge-Moduls  |
| GET     | `/qorechain/bridge/v1/chains`              | Listet alle registrierten Bridge-Chains auf |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`   | Details zu einer bestimmten verbrückten Chain |
| GET     | `/qorechain/bridge/v1/validators`          | Listet registrierte Bridge-Validatoren auf |
| GET     | `/qorechain/bridge/v1/validators/{address}`| Details zu einem bestimmten Bridge-Validator |
| GET     | `/qorechain/bridge/v1/operations`          | Listet Bridge-Operationen auf              |
| GET     | `/qorechain/bridge/v1/operations/{id}`     | Details zu einer bestimmten Bridge-Operation |

Die folgenden kürzeren Pfad-Endpunkte bleiben weiterhin verfügbar:

| Methode | Endpunkt                            | Beschreibung                                    |
| ------- | ------------------------------------ | ------------------------------------------------- |
| GET     | `/bridge/v1/chains`                 | Listet alle registrierten Bridge-Chains auf       |
| GET     | `/bridge/v1/chains/{id}`            | Details zu einer bestimmten verbrückten Chain     |
| GET     | `/bridge/v1/validators`             | Listet aktive Bridge-Validatoren auf              |
| GET     | `/bridge/v1/operations`             | Listet aktuelle Bridge-Operationen auf            |
| GET     | `/bridge/v1/operations/{id}`        | Details zu einer bestimmten Bridge-Operation      |
| GET     | `/bridge/v1/locked/{chain}/{asset}` | Gesamter gesperrter Wert für ein Chain-/Asset-Paar |
| GET     | `/bridge/v1/limits/{chain}`         | Ratenlimits und Schwellenwerte für eine verbrückte Chain |
| GET     | `/bridge/v1/estimate`               | Schätzt Bridge-Gebühr und Übertragungsdauer       |

## PQC-Modul

| Methode | Endpunkt                     | Beschreibung                                       |
| ------- | ----------------------------- | ---------------------------------------------------- |
| GET     | `/pqc/v1/params`             | Aktuelle Parameter des PQC-Moduls                    |
| GET     | `/pqc/v1/accounts/{address}` | PQC-Schlüsselstatus für ein bestimmtes Konto         |
| GET     | `/pqc/v1/stats`              | Aggregierte Statistiken zu PQC-Registrierung und -Migration |

## Reputation-Modul

| Methode | Endpunkt                              | Beschreibung                                   |
| ------- | --------------------------------------- | ------------------------------------------------- |
| GET     | `/reputation/v1/validators`           | Reputationswerte für alle Validatoren            |
| GET     | `/reputation/v1/validators/{address}` | Reputationswert für einen bestimmten Validator   |

## Cross-VM-Modul

| Methode | Endpunkt                   | Beschreibung                                |
| ------- | ---------------------------- | ---------------------------------------------- |
| GET     | `/crossvm/v1/message/{id}` | Ruft eine Cross-VM-Nachricht anhand der ID ab |
| GET     | `/crossvm/v1/pending`      | Listet ausstehende Cross-VM-Nachrichten in der Warteschlange auf |
| GET     | `/crossvm/v1/params`       | Aktuelle Parameter des Cross-VM-Moduls        |

## Multilayer-Modul {#multilayer-module}

Seit Chain-Version **v3.1.80** wird der vollständige Abfragedienst des Multilayer-Moduls über REST via grpc-gateway unter dem Präfix `/qorechain/multilayer/v1/...` bereitgestellt (zuvor nur über gRPC), einschließlich zweier **State-Anchor-Leseabfragen**: `anchor/{layer_id}` liefert den neuesten Settlement-Anchor für eine Layer, und `anchors/{layer_id}` liefert deren Anchor-Verlauf. Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder, sodass ein Client einen Anchor abrufen und unabhängig verifizieren kann — die On-Chain-Grundlage für die [Settlement Receipts](/rollups/settlement-receipts) des Rollup Development Kit.

| Methode | Endpunkt                                        | Beschreibung                                       |
| ------- | -------------------------------------------------- | ------------------------------------------------------ |
| GET     | `/qorechain/multilayer/v1/params`               | Aktuelle Parameter des Multilayer-Moduls              |
| GET     | `/qorechain/multilayer/v1/layers`               | Listet alle registrierten Layer auf                   |
| GET     | `/qorechain/multilayer/v1/layers/{layer_id}`    | Details zu einer bestimmten Layer                     |
| GET     | `/qorechain/multilayer/v1/anchor/{layer_id}`    | Neuester State-Anchor für eine Layer                  |
| GET     | `/qorechain/multilayer/v1/anchors/{layer_id}`   | State-Anchor-Verlauf für eine Layer                   |
| GET     | `/qorechain/multilayer/v1/routing-stats`        | Statistiken zum Transaktionsrouting über alle Layer hinweg |

Eine `StateAnchorView` enthält `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` und `compressed_state_proof`. Die signierte kanonische Nachricht lautet `layer_id || layer_height || state_root || validator_set_hash` und wird gegen den registrierten PQC-Schlüssel des Layer-Erstellers verifiziert.

Die folgenden kürzeren Pfad-Endpunkte bleiben weiterhin verfügbar:

| Methode | Endpunkt                        | Beschreibung                                     |
| ------- | ---------------------------------- | ---------------------------------------------------- |
| GET     | `/multilayer/v1/layer/{id}`    | Details zu einer bestimmten Layer                    |
| GET     | `/multilayer/v1/layers`        | Listet alle registrierten Layer auf                  |
| GET     | `/multilayer/v1/anchor/{id}`   | Details zu einem bestimmten Anchor-Datensatz         |
| GET     | `/multilayer/v1/anchors`       | Listet aktuelle Anchor-Einreichungen auf             |
| GET     | `/multilayer/v1/routing-stats` | Statistiken zum Transaktionsrouting über alle Layer hinweg |
| GET     | `/multilayer/v1/params`        | Aktuelle Parameter des Multilayer-Moduls             |

## SVM-Modul

| Methode | Endpunkt                    | Beschreibung                                       |
| ------- | ----------------------------- | ------------------------------------------------------ |
| GET     | `/svm/v1/params`            | Aktuelle Parameter des SVM-Moduls                     |
| GET     | `/svm/v1/account/{address}` | SVM-Kontoinformationen für eine bestimmte Adresse     |
| GET     | `/svm/v1/program/{address}` | Informationen zu einem bereitgestellten Programm für eine bestimmte Programmadresse |

## RL-Consensus-Modul

Über dieses Modul werden PRISM-Tuning-Parameter und der Zustand des Reinforcement-Learning-Agenten bereitgestellt.

| Methode | Endpunkt                      | Beschreibung                              |
| ------- | ------------------------------- | --------------------------------------------- |
| GET     | `/rlconsensus/v1/agent`       | Aktueller Status und Modus des PRISM-Agenten |
| GET     | `/rlconsensus/v1/observation` | Neuester Beobachtungsvektor                  |
| GET     | `/rlconsensus/v1/rewards`     | Kumulative Reward-Metriken                   |
| GET     | `/rlconsensus/v1/params`      | Aktuelle Parameter des PRISM-Consensus-Moduls |
| GET     | `/rlconsensus/v1/policy`      | Aktive Policy-Konfiguration und Gewichte     |

## Burn-Modul

Seit Chain-Version **v3.1.77** wird der schreibgeschützte Zustand des Burn-Moduls über REST via grpc-gateway unter dem Präfix `/qorechain/burn/v1/...` bereitgestellt (zuvor nur über gRPC). Diese Endpunkte liefern echte On-Chain-JSON-Daten über HTTP für Explorer und Light-Node-Telemetrie. Die Burn-`stats` enthalten z. B. `gas_burn_rate=0.30`.

| Methode | Endpunkt                       | Beschreibung                          |
| ------- | --------------------------------- | ----------------------------------------- |
| GET     | `/qorechain/burn/v1/params`    | Aktuelle Parameter des Burn-Moduls        |
| GET     | `/qorechain/burn/v1/stats`     | Burn-Statistiken über alle Kanäle hinweg  |
| GET     | `/qorechain/burn/v1/records`   | Listet Burn-Datensätze auf                |
| GET     | `/qorechain/burn/v1/milestone` | Fortschritt der Burn-Meilensteine         |

Die folgenden kürzeren Pfad-Endpunkte bleiben weiterhin verfügbar:

| Methode | Endpunkt          | Beschreibung                          |
| ------- | ------------------- | ------------------------------------------ |
| GET     | `/burn/v1/stats`  | Burn-Statistiken über alle Kanäle hinweg  |
| GET     | `/burn/v1/params` | Aktuelle Parameter des Burn-Moduls        |

## xQORE-Modul

| Methode | Endpunkt                       | Beschreibung                                    |
| ------- | --------------------------------- | --------------------------------------------------- |
| GET     | `/xqore/v1/position/{address}` | xQORE-Staking-Position für eine bestimmte Adresse  |
| GET     | `/xqore/v1/params`             | Aktuelle Parameter des xQORE-Moduls                |

## Inflation-Modul

| Methode | Endpunkt               | Beschreibung                          |
| ------- | ------------------------- | ---------------------------------------- |
| GET     | `/inflation/v1/rate`   | Aktuelle annualisierte Inflationsrate    |
| GET     | `/inflation/v1/epoch`  | Aktuelle Epochennummer und Fortschritt   |
| GET     | `/inflation/v1/params` | Aktuelle Parameter des Inflation-Moduls  |

## RDK-Modul

| Methode | Endpunkt                     | Beschreibung                            |
| ------- | ------------------------------- | ------------------------------------------ |
| GET     | `/rdk/v1/rollup/{id}`        | Details zu einem bestimmten Rollup        |
| GET     | `/rdk/v1/rollups`            | Listet alle registrierten Rollups auf     |
| GET     | `/rdk/v1/batch/{id}/{index}` | Ruft einen bestimmten Settlement-Batch ab |
| GET     | `/rdk/v1/batches/{id}`       | Listet Batches für ein bestimmtes Rollup auf |
| GET     | `/rdk/v1/blob/{id}/{index}`  | Ruft einen bestimmten DA-Blob ab          |
| GET     | `/rdk/v1/params`             | Aktuelle Parameter des RDK-Moduls         |

## Babylon-Modul

| Methode | Endpunkt                         | Beschreibung                                |
| ------- | ----------------------------------- | ----------------------------------------------- |
| GET     | `/babylon/v1/staking/{address}`  | BTC-Staking-Position für eine bestimmte Adresse |
| GET     | `/babylon/v1/checkpoint/{epoch}` | BTC-Checkpoint-Daten für eine bestimmte Epoche  |
| GET     | `/babylon/v1/params`             | Aktuelle Parameter des Babylon-Moduls           |

## Abstract-Account-Modul

Seit Chain-Version **v3.1.85** wird der Abfragedienst für Abstract Accounts über REST via grpc-gateway unter dem Präfix `/qorechain/abstractaccount/v1/...` bereitgestellt, einschließlich des **Permission Schema**, das zur Validierung von [Authenticator](/developer-guide/account-abstraction#authenticators)-Scopes ohne Hardcoding verwendet wird.

| Methode | Endpunkt                                              | Beschreibung                                                 |
| ------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`                | Modulkonfiguration (Feature-Probe: `enabled`)                    |
| GET     | `/qorechain/abstractaccount/v1/accounts`              | Listet Abstract Accounts auf                                     |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}`    | Abstract-Account-Zustand für eine Adresse                        |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`     | Permission-Taxonomie, Msg-zu-Permission-Zuordnung, nicht delegierbare Msgs |

Die folgenden kürzeren Pfad-Endpunkte bleiben weiterhin verfügbar:

| Methode | Endpunkt                                | Beschreibung                                     |
| ------- | ------------------------------------------ | ---------------------------------------------------- |
| GET     | `/abstractaccount/v1/account/{address}` | Details zum Abstract Account für eine bestimmte Adresse |
| GET     | `/abstractaccount/v1/params`            | Aktuelle Parameter des Abstract-Account-Moduls       |

## FairBlock-Modul

| Methode | Endpunkt               | Beschreibung                                  |
| ------- | ------------------------- | ------------------------------------------------- |
| GET     | `/fairblock/v1/config` | Aktuelle FairBlock-Verschlüsselungskonfiguration  |
| GET     | `/fairblock/v1/params` | Aktuelle Parameter des FairBlock-Moduls           |

## Gas-Abstraction-Modul

| Methode | Endpunkt                             | Beschreibung                                  |
| ------- | --------------------------------------- | ------------------------------------------------- |
| GET     | `/gasabstraction/v1/accepted-tokens` | Listet für Gaszahlungen akzeptierte Token auf     |
| GET     | `/gasabstraction/v1/params`          | Aktuelle Parameter des Gas-Abstraction-Moduls     |

## gRPC-Reflection

gRPC-Server-Reflection ist standardmäßig aktiviert und ermöglicht es Tools wie `grpcurl`, verfügbare Dienste zu entdecken:

```bash
grpcurl -plaintext localhost:9090 list
```

Um einen bestimmten Dienst abzufragen:

```bash
grpcurl -plaintext localhost:9090 qorechain.pqc.v1.Query/Params
```

## Authentifizierung

Alle REST- und gRPC-Endpunkte sind standardmäßig unauthentifiziert. Für Produktivumgebungen sollte ein Reverse-Proxy (z. B. Nginx oder Caddy) vor dem Node platziert werden, um TLS-Terminierung und Zugriffskontrolle zu übernehmen.
