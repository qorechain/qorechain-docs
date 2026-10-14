---
slug: /api-reference/rest-grpc-endpoints
title: REST-/gRPC-Endpunkte
sidebar_label: REST-/gRPC-Endpunkte
sidebar_position: 1
---

# REST-/gRPC-Endpunkte

QoreChain stellt drei primäre Schnittstellen für den programmatischen Zugriff bereit:

| Schnittstelle | Standardport | Protokoll | Beschreibung                         |
| ------------- | ------------ | --------- | ------------------------------------ |
| REST          | `1317`       | HTTP/1.1  | REST-Gateway (Cosmos-SDK-API-Server) |
| gRPC          | `9090`       | HTTP/2    | Protobuf-codierter gRPC-Dienst       |
| RPC           | `26657`      | HTTP + WS | QoreChain-Consensus-Engine-RPC       |

Alle REST-Endpunkte liefern JSON zurück. gRPC-Endpunkte verwenden Protocol Buffers und können mit jedem gRPC-Client genutzt werden. Die RPC-Schnittstelle stellt Abfragen auf Konsensebene sowie das Broadcasten von Transaktionen bereit.

:::note
Diese Schnittstellen sind sowohl im **`qorechain-vladi`**-Mainnet (live seit 29. Juni 2026) als auch im **`qorechain-diana`**-Testnet verfügbar. Die unten angegebenen Basis-URLs gehen von einem lokal laufenden Node aus. Die öffentlich gehosteten Endpunkte sind `https://api.qore.host` / `https://api-testnet.qore.host` (REST) und `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC); sie sind unter [Netzwerke](/appendix/networks#public-endpoints) aufgeführt. **Es gibt keinen öffentlichen gRPC-Endpunkt**: Die Hostnamen `grpc.qore.host` und `grpc-testnet.qore.host` existieren nicht, betreiben Sie daher einen eigenen Node, wenn Sie gRPC benötigen.
:::

## Basis-URLs

```
REST:  http://localhost:1317
gRPC:  localhost:9090
RPC:   http://localhost:26657
```

## Welche Routen es gibt {#which-routes-exist}

QoreChain-spezifische Module werden über REST unter dem Präfix `/qorechain/<module>/v1/...` bereitgestellt, und nur die unten aufgeführten Module haben REST-Routen. Die übrigen Module sind **ausschließlich über gRPC** erreichbar (siehe [Nur-gRPC-Module](#grpc-only-modules)). Standardrouten für Cosmos SDK, EVM und CosmWasm sind unter [Standardrouten](#standard-routes) aufgeführt.

Eine Route, die nicht existiert, antwortet mit HTTP `501` und `{"code":12,"message":"Not Implemented"}`. Das bedeutet, dass die Route nicht bereitgestellt wird, nicht, dass die Abfrage ein leeres Ergebnis geliefert hat. Verkürzte Pfade ohne das Präfix `/qorechain/` (zum Beispiel `/bridge/v1/chains` oder `/pqc/v1/params`) werden **nicht** bereitgestellt. Ein unbekannter Datensatz auf einer Route, die existiert, liefert HTTP `404` mit `{"code":5,"message":"... not found"}`.

Die folgenden Beispiele verwenden den öffentlichen Mainnet-Host; ersetzen Sie ihn für das Testnet durch `https://api-testnet.qore.host`.

## PQC-Modul {#pqc-module}

| Methode | Endpunkt                                 | Beschreibung                                                                          |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/qorechain/pqc/v1/account/{address}`    | Registrierung des Post-Quanten-Schlüssels für ein Konto (`found`, Schlüsseltyp, Algorithmus) |
| GET     | `/qorechain/pqc/v1/evm_window/{address}` | Das Autorisierungsfenster der EVM-Lane des Kontos und was davon übrig ist             |

Beachten Sie, dass das Pfadsegment die Singularform `account` ist. Eine Route `/qorechain/pqc/v1/params` oder `/stats` gibt es nicht.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/account/qor1...
```

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": null,
    "key_type": "hybrid",
    "created_at_height": "209015",
    "migration_public_key": null,
    "migration_algorithm_id": 0
  }
}
```

Ein Konto ohne registrierten Schlüssel liefert `{"found": false, "account": null}`. Verwenden Sie `found`, um zu entscheiden, ob ein Konto einen Schlüssel registrieren muss, bevor es senden kann.

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_window/qor1...
```

```json
{
  "found": false,
  "live": false,
  "opened_height": "0",
  "expiry_height": "0",
  "max_txs": "0",
  "used_txs": "0",
  "max_value": "",
  "used_value": "",
  "remaining_blocks": "0",
  "remaining_txs": "0",
  "remaining_value": ""
}
```

Diese Route schlägt für eine Adresse ohne Fenster nie fehl; sie liefert `found: false`. Seit v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten PQC-Schlüssel **und** ein offenes Fenster hat. `live` ist `true`, solange das Fenster bei der aktuellen Blockhöhe mindestens eine weitere Transaktion zulässt. `remaining_blocks`, `remaining_txs` und `remaining_value` zeigen, welche Grenze am ehesten erschöpft ist; Werte sind `uqor`-Ganzzahlen, die als Strings zurückgegeben werden. Wie die EVM-Lane funktioniert, steht unter [EVM-Entwicklung](/developer-guide/evm-development).

## Bridge-Modul {#bridge-module}

Der schreibgeschützte Zustand des Bridge-Moduls wird über REST unter `/qorechain/bridge/v1/...` bereitgestellt (mit echten On-Chain-JSON-Daten seit Chain-Version **v3.1.77**). Die Bridge-`config` meldet z. B. `min_validators=10` und `attestation_threshold=7`.

| Methode | Endpunkt                                    | Beschreibung                                  |
| ------- | ------------------------------------------- | --------------------------------------------- |
| GET     | `/qorechain/bridge/v1/config`               | Aktuelle Konfiguration des Bridge-Moduls      |
| GET     | `/qorechain/bridge/v1/chains`               | Listet alle registrierten Bridge-Chains auf   |
| GET     | `/qorechain/bridge/v1/chains/{chain_id}`    | Details zu einer bestimmten verbrückten Chain |
| GET     | `/qorechain/bridge/v1/validators`           | Listet registrierte Bridge-Validatoren auf    |
| GET     | `/qorechain/bridge/v1/validators/{address}` | Details zu einem bestimmten Bridge-Validator  |
| GET     | `/qorechain/bridge/v1/operations`           | Listet Bridge-Operationen auf                 |
| GET     | `/qorechain/bridge/v1/operations/{id}`      | Details zu einer bestimmten Bridge-Operation  |

```bash
curl -s https://api.qore.host/qorechain/bridge/v1/config
```

```json
{
  "config": {
    "min_validators": 10,
    "attestation_threshold": 7,
    "challenge_period_secs": "86400",
    "large_transfer_threshold": "100000000000",
    "enabled": true
  }
}
```

`chains/{chain_id}` liefert einen Eintrag wie `{"chain": {"chain_id": "ethereum", "name": "Ethereum", "chain_type": "evm", "bridge_contract": "0x000…0", "status": "pending", "min_confirmations": 12, ...}}`.

:::caution Die Bridge ist noch nicht live
Alle 37 konfigurierten Bridge-Chains melden in beiden Netzwerken `"status": "pending"`, und `validators` und `operations` sind leere Listen. Diese Routen zeigen die Konfiguration des Moduls; sie bedeuten nicht, dass heute Assets verbrückt werden können. Siehe [Bridge-Architektur](/architecture/bridge-architecture).
:::

## Multilayer-Modul {#multilayer-module}

Der vollständige Abfragedienst des Multilayer-Moduls wird über REST unter `/qorechain/multilayer/v1/...` bereitgestellt (seit Chain-Version **v3.1.80**), einschließlich zweier **State-Anchor-Leseabfragen**: `anchor/{layer_id}` liefert den neuesten Settlement-Anchor für eine Layer, und `anchors/{layer_id}` liefert deren Anchor-Verlauf. Jeder Anchor trägt eine **ML-DSA-87 (Dilithium-5)**-Signatur über seine kanonischen Felder, sodass ein Client einen Anchor abrufen und unabhängig verifizieren kann — die On-Chain-Grundlage für die [Settlement Receipts](/rollups/settlement-receipts) des Rollup Development Kit.

| Methode | Endpunkt                                      | Beschreibung                                               |
| ------- | --------------------------------------------- | ---------------------------------------------------------- |
| GET     | `/qorechain/multilayer/v1/params`             | Aktuelle Parameter des Multilayer-Moduls                   |
| GET     | `/qorechain/multilayer/v1/layers`             | Listet alle registrierten Layer auf                        |
| GET     | `/qorechain/multilayer/v1/layers/{layer_id}`  | Details zu einer bestimmten Layer                          |
| GET     | `/qorechain/multilayer/v1/anchor/{layer_id}`  | Neuester State-Anchor für eine Layer                       |
| GET     | `/qorechain/multilayer/v1/anchors/{layer_id}` | State-Anchor-Verlauf für eine Layer                        |
| GET     | `/qorechain/multilayer/v1/routing-stats`      | Statistiken zum Transaktionsrouting über alle Layer hinweg |

Eine `StateAnchorView` enthält `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` und `compressed_state_proof`. Die signierte kanonische Nachricht lautet `layer_id || layer_height || state_root || validator_set_hash` und wird gegen den registrierten PQC-Schlüssel des Layer-Erstellers verifiziert. Eine Layer ohne Anchor liefert von `anchor/{layer_id}` HTTP `404` (`no anchor for layer ...`) und von `anchors/{layer_id}` eine leere Liste (`{"anchors": []}`).

```bash
curl -s https://api.qore.host/qorechain/multilayer/v1/params
```

```json
{
  "params": {
    "max_sidechains": "10",
    "max_paychains": "50",
    "min_anchor_interval": "100",
    "max_anchor_interval": "1000",
    "default_challenge_period": "86400",
    "min_sidechain_stake": "1000000000",
    "min_paychain_stake": "100000000",
    "routing_enabled": true,
    "routing_confidence_threshold": "0.6",
    "cross_layer_fee_bundling": true
  }
}
```

Zum Zeitpunkt der Erstellung ist `layers` in beiden Netzwerken eine leere Liste.

## Burn-Modul {#burn-module}

Der schreibgeschützte Zustand des Burn-Moduls wird über REST unter `/qorechain/burn/v1/...` bereitgestellt. Die Burn-`params` enthalten z. B. `gas_burn_rate=0.30`.

| Methode | Endpunkt                              | Beschreibung                                                                        |
| ------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| GET     | `/qorechain/burn/v1/params`           | Aktuelle Parameter des Burn-Moduls                                                  |
| GET     | `/qorechain/burn/v1/stats`            | Kumulierte Burn-Summe, aufgeschlüsselt nach Quelle                                  |
| GET     | `/qorechain/burn/v1/records`          | Listet aktuelle Burn-Datensätze auf                                                 |
| GET     | `/qorechain/burn/v1/milestone`        | Fortschritt des Burn-Meilensteins (kumulierte Transaktionszahl)                     |
| GET     | `/qorechain/burn/v1/stranded_rewards` | Vom Upgrade v3.2.0 beiseitegelegter und noch nicht freigegebener Staker-Anteil      |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31560093291491",
    "burns_by_source": {
      "gas_fee": "31560093291491",
      "failed_tx": "0",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3506945"
  }
}
```

Die echte Antwort listet jede Burn-Quelle auf (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); das Beispiel ist gekürzt. Beträge sind in `uqor` angegeben.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "6693045921330", "released": "0", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` ist der Betrag, der noch freizugeben ist, `released` ist, wie viel die Governance bereits herausbewegt hat, und `snapshot_height` ist die Höhe des Upgrades v3.2.0, das die Reserve erfasst hat. Siehe [Tokenomics](/architecture/tokenomics).

## Abstract-Account-Modul {#abstract-account-module}

Der Abfragedienst für Abstract Accounts wird über REST unter `/qorechain/abstractaccount/v1/...` bereitgestellt (seit Chain-Version **v3.1.85**), einschließlich des **Permission Schema**, das zur Validierung von [Authenticator](/developer-guide/account-abstraction#authenticators)-Scopes ohne Hardcoding verwendet wird.

| Methode | Endpunkt                                           | Beschreibung                                                                |
| ------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`             | Modulkonfiguration (Feature-Probe: `enabled`)                               |
| GET     | `/qorechain/abstractaccount/v1/accounts`           | Listet Abstract Accounts auf                                                |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}` | Abstract-Account-Zustand für eine Adresse (`404`, falls keiner existiert)   |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`   |

```bash
curl -s https://api.qore.host/qorechain/abstractaccount/v1/config
```

```json
{ "config": { "enabled": false, "max_session_keys": 10, "max_spending_rules": 5, "default_session_ttl": "86400" } }
```

:::note In beiden Netzwerken deaktiviert
`enabled` ist heute im Mainnet und im Testnet `false`, sodass Abstract-Account-Funktionen wie das Ausgeben über verknüpfte Wallets nicht verfügbar sind. Verwenden Sie `config.enabled` als Feature-Probe, bevor Sie sich auf dieses Modul verlassen. Siehe [Account Abstraction](/developer-guide/account-abstraction).
:::

## AMM-Modul {#amm-module}

| Methode | Endpunkt                                                            | Beschreibung                                                 |
| ------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| GET     | `/qorechain/amm/v1/params`                                          | Aktuelle AMM-Parameter (Gebühren in Basispunkten, Limits)    |
| GET     | `/qorechain/amm/v1/pools`                                           | Listet Pools auf                                             |
| GET     | `/qorechain/amm/v1/pools/{pool_id}`                                 | Ein Pool (`404`, falls unbekannt)                            |
| GET     | `/qorechain/amm/v1/pools/{pool_id}/lp/{address}`                    | LP-Token-Guthaben einer Adresse in einem Pool                |
| GET     | `/qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=`                | Findet den Pool für ein Denom-Paar (`404`, falls keiner existiert) |
| GET     | `/qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=`    | Quote: Output für einen exakten Input                        |
| GET     | `/qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Quote: benötigter Input für einen exakten Output             |

```bash
curl -s https://api.qore.host/qorechain/amm/v1/params
```

```json
{
  "params": {
    "swap_fee_bps": 30,
    "protocol_fee_bps": 10,
    "min_liquidity": "1000",
    "max_pools_per_creator": 50,
    "lp_token_decimals": 6,
    "pool_creation_fee": "100000000",
    "max_swap_impact_bps": 500,
    "enabled": true
  }
}
```

Zum Zeitpunkt der Erstellung gibt es in keinem der beiden Netzwerke Pools (`{"pools": []}`), und eine Quote für einen unbekannten Pool liefert HTTP `400` mit `{"code":3,"message":"pool not found"}`.

## Lizenz-Modul {#licence-module}

| Methode | Endpunkt                                             | Beschreibung                                                                          |
| ------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/qorechain/license/v1/check/{grantee}/{feature_id}` | Ob `grantee` eine aktive Berechtigung für das Feature hält (`404`, falls keine)       |
| GET     | `/qorechain/license/v1/holders/{feature_id}`         | Alle Berechtigungen für ein Feature                                                   |
| GET     | `/qorechain/license/v1/list/{grantee}`               | Alle von einer Adresse gehaltenen Berechtigungen                                      |

Eine Berechtigung (`LicenseView`) hat `grantee`, `feature_id`, `expires_at`, `granted_at`, `granted_by`, `suspended` und `metadata`. `check` liefert zusätzlich `active`. Eine Listen- oder Holders-Abfrage ohne Treffer liefert `{"licenses": []}`; `check` für eine Adresse ohne Berechtigung liefert HTTP `404` mit `{"code":5,"message":"no license for <grantee>/<feature_id>"}`.

```bash
curl -s https://api.qore.host/qorechain/license/v1/holders/lightnode_operator
```

```json
{ "licenses": [] }
```

## Light-Node-Modul {#light-node-module}

| Methode | Endpunkt                                    | Beschreibung                                                                  |
| ------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| GET     | `/qorechain/lightnode/v1/params`            | Parameter für Registrierung, Heartbeat und Belohnungen                        |
| GET     | `/qorechain/lightnode/v1/stats`             | `total_registered`, `total_active`, `total_rewards`, `last_reward_height`     |
| GET     | `/qorechain/lightnode/v1/nodes`             | Listet registrierte Light Nodes auf                                           |
| GET     | `/qorechain/lightnode/v1/node/{address}`    | Ein Node (`{"node": null, "found": false}`, falls nicht registriert)          |
| GET     | `/qorechain/lightnode/v1/rewards/{address}` | Für eine Operator-Adresse angesammelte Belohnungen (`accumulated_rewards`)    |
| GET     | `/qorechain/lightnode/v1/reward_pool`       | Abrechnung des Belohnungspools (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `initialized`) |

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/params
```

```json
{
  "registration_fee": "1000000",
  "heartbeat_interval": "1000",
  "min_delegated_stake": "1000000000",
  "reward_share": "0.030000000000000000",
  "min_uptime_for_rewards": "0.800000000000000000",
  "max_light_nodes": "10000",
  "heartbeat_grace_period": "100"
}
```

```bash
curl -s https://api.qore.host/qorechain/lightnode/v1/reward_pool
```

```json
{
  "balance": "<uqor>",
  "reserved": "<uqor>",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true
}
```

`reserved` ist der Teil des Pools, der zurückgehalten wird und nur per Governance-Abstimmung bewegt werden kann, und `max_reward_per_block_per_node` (in `uqor`) ist die Obergrenze pro Node und Block für das, was die Chain gutschreibt. Eine Obergrenze ist kein zugesicherter Betrag. `balance` und `reserved` sind hier als Platzhalter dargestellt.

:::note Die Registrierung ist nicht geöffnet
`stats` meldet `"total_registered": "0"`, und `nodes` ist in beiden Netzwerken leer; die Chain lehnt eine Light-Node-Registrierung ohne eine `lightnode_operator`-Lizenzberechtigung ab. Den Programmstatus finden Sie unter [Light Nodes](/light-node/overview).
:::

## Nur-gRPC-Module {#grpc-only-modules}

Diese Module haben einen gRPC-`Query`-Dienst, aber **keine REST-Route**. Die Dienstnamen folgen dem Muster `qorechain.<module>.v1.Query`.

| Modul         | gRPC-Abfragemethoden (Chain-Version v3.2.0)                |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `rdk`         | `Params`, `Rollup`, `Rollups`, `Batch`, `LatestBatch`      |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

Verwenden Sie `grpcurl` gegen Ihren eigenen Node oder die [CLI-Abfragebefehle](/cli-reference/query-commands). Insbesondere die `rdk`-Abfragen sind im Mainnet **nicht** über REST verfügbar (`/qorechain/rdk/v1/...` antwortet mit `501`), sodass REST-basierte Rollup-Reader heute nicht gegen das Mainnet funktionieren können.

Die Module xQORE, Inflation, BTC-Restaking (Babylon), FairBlock und Gas Abstraction haben im aktuellen Mainnet-Release überhaupt keinen Abfragedienst, weder über REST noch über gRPC.

## Standardrouten {#standard-routes}

Die standardmäßigen REST-Routen von Cosmos SDK, IBC, EVM und CosmWasm werden ebenfalls bereitgestellt. In beiden Netzwerken verifizierte Beispiele:

| Endpunkt                                                       | Beschreibung                                           |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `/cosmos/bank/v1beta1/supply`                                  | Gesamtangebot                                          |
| `/cosmos/bank/v1beta1/balances/{address}`                      | Kontostände                                            |
| `/cosmos/staking/v1beta1/validators`                           | Validatoren                                            |
| `/cosmos/staking/v1beta1/params`                               | Staking-Parameter                                      |
| `/cosmos/distribution/v1beta1/params`                          | Distributionsparameter                                 |
| `/cosmos/gov/v1/params/voting`                                 | Governance-Parameter                                   |
| `/cosmos/slashing/v1beta1/params`                              | Slashing-Parameter                                     |
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Ausstehende / angewendete Upgrades                     |
| `/cosmos/base/node/v1beta1/config`                             | Minimaler Gaspreis des Nodes (`0.1uqor` in beiden Netzwerken) |
| `/cosmos/base/tendermint/v1beta1/blocks/latest`                | Neuester Block                                         |
| `/cosmos/tx/v1beta1/txs`, `/txs/{hash}`, `/txs/block/{height}` | Transaktionssuche / -abruf / nach Block                |
| `/cosmos/evm/vm/v1/params`                                     | Parameter des EVM-Moduls                               |
| `/cosmos/evm/feemarket/v1/params`                              | Parameter des EVM-Gebührenmarkts                       |
| `/cosmwasm/wasm/v1/codes/params`                               | CosmWasm-Upload-/Instanziierungsberechtigungen         |
| `/ibc/apps/transfer/v1/params`                                 | IBC-Transferparameter                                  |

Das CosmWasm-Präfix lautet `/cosmwasm/wasm/v1/...`; `/cosmos/wasm/v1/...` wird nicht bereitgestellt.

## gRPC-Reflection

Ein selbst betriebener Node stellt gRPC auf Port `9090` bereit. Wo Server-Reflection aktiviert ist, können Tools wie `grpcurl` die verfügbaren Dienste entdecken:

```bash
grpcurl -plaintext localhost:9090 list
```

Um einen bestimmten Dienst abzufragen:

```bash
grpcurl -plaintext -d '{"address":"qor1..."}' localhost:9090 qorechain.pqc.v1.Query/Account
```

`qorechain.pqc.v1.Query` hat zwei Methoden, `Account` und `EVMWindow`. Eine Methode `Params` gibt es nicht.

## Authentifizierung

Alle REST- und gRPC-Endpunkte sind standardmäßig unauthentifiziert. Für Produktivumgebungen sollte ein Reverse-Proxy (z. B. Nginx oder Caddy) vor dem Node platziert werden, um TLS-Terminierung und Zugriffskontrolle zu übernehmen.
