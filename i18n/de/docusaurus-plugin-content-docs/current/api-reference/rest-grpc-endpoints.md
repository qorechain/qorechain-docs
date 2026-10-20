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
Diese Schnittstellen sind sowohl im **`qorechain-vladi`**-Mainnet (live seit 7. Juni 2026; Node-Release **v3.2.3**) als auch im **`qorechain-diana`**-Testnet (Node-Release **v3.2.4**) verfügbar. Die unten angegebenen Basis-URLs gehen von einem lokal laufenden Node aus. Die öffentlich gehosteten Endpunkte sind `https://api.qore.host` / `https://api-testnet.qore.host` (REST) und `https://rpc.qore.host` / `https://rpc-testnet.qore.host` (RPC); sie sind unter [Netzwerke](/appendix/networks#public-endpoints) aufgeführt. **Es gibt keinen öffentlichen gRPC-Endpunkt**: Die Hostnamen `grpc.qore.host` und `grpc-testnet.qore.host` existieren nicht, betreiben Sie daher einen eigenen Node, wenn Sie gRPC benötigen.
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

Die folgenden Beispiele verwenden den öffentlichen Mainnet-Host; ersetzen Sie ihn für das Testnet durch `https://api-testnet.qore.host`. Die Werte in den Beispielen wurden um den 20. Oktober 2026 von den Live-Netzwerken gelesen (Mainnet v3.2.3, Testnet v3.2.4) und ändern sich im Lauf der Zeit; nutzen Sie sie für die Form einer Antwort. Das Testnet läuft mit dem neueren Release v3.2.4 und stellt daher einige Routen und Felder bereit, die das Mainnet nicht hat; sie sind unten mit **nur Testnet** gekennzeichnet und antworten im Mainnet mit `501`.

## PQC-Modul {#pqc-module}

| Methode | Endpunkt                                 | Beschreibung                                                                          |
| ------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| GET     | `/qorechain/pqc/v1/account/{address}`    | Registrierung des Post-Quanten-Schlüssels für ein Konto (`found`, Schlüsseltyp, Algorithmus) |
| GET     | `/qorechain/pqc/v1/evm_window/{address}` | Das Autorisierungsfenster der EVM-Lane des Kontos und was davon übrig ist             |
| GET     | `/qorechain/pqc/v1/evm_delegation_consent/{address}` | Die EIP-7702-Delegationseinwilligung des Kontos, die aktuelle Delegation und die EVM-Nonce (seit v3.2.2) |
| GET     | `/qorechain/pqc/v1/protocol_features`    | **Nur Testnet (v3.2.4).** Jedes Protokoll-Feature, das das Binary kennt, mit den Flags `enabled`, `known` und `staged` |

Beachten Sie, dass das Pfadsegment die Singularform `account` ist. Eine Route `/qorechain/pqc/v1/params` oder `/stats` gibt es nicht (nutzen Sie dafür `qorechaind query pqc params` und `stats`).

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
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account"
  }
}
```

`classical_key_source` gibt an, woher `ecdsa_pubkey` stammt: `stored` (der bei der Registrierung angegebene Schlüssel), `auth_account` (es wurde nichts gespeichert, daher ist es der eigene On-Chain-Public-Key des Kontos) oder `none`. Im Testnet (v3.2.4, **nur Testnet**) trägt der Datensatz außerdem `"possession_proven": false`; das Feld ist `true`, sobald ein Schlüssel mit einem verifizierten [Besitznachweis](/developer-guide/post-quantum-signing#proof-of-possession) registriert wurde; das Mainnet meldet das Feld noch nicht.

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
  "remaining_value": "",
  "native_only": false,
  "allowed_targets": []
}
```

Diese Route schlägt für eine Adresse ohne Fenster nie fehl; sie liefert `found: false`. Seit v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen registrierten PQC-Schlüssel **und** ein offenes Fenster hat. `live` ist `true`, solange das Fenster bei der aktuellen Blockhöhe mindestens eine weitere Transaktion zulässt. `remaining_blocks`, `remaining_txs` und `remaining_value` zeigen, welche Grenze am ehesten erschöpft ist; Werte sind `uqor`-Ganzzahlen, die als Strings zurückgegeben werden. Seit v3.2.3 kann ein Fenster einen Scope tragen: `native_only` (nur einfache QOR-Transfers) und `allowed_targets` (nur aufgelistete Empfänger). Wie die EVM-Lane funktioniert, steht unter [EVM-Entwicklung](/developer-guide/evm-development#evm-window).

```bash
curl -s https://api.qore.host/qorechain/pqc/v1/evm_delegation_consent/qor1...
```

```json
{
  "found": false,
  "live": false,
  "delegate": "",
  "granted_height": "0",
  "expiry_height": "0",
  "current_delegate": "",
  "nonce": "0"
}
```

Eine EIP-7702-Delegation eines Kontos wird nur mit der eigenen Post-Quanten-Einwilligung des Kontos wirksam (`MsgAuthorizeEVMDelegation`). `found` und `live` melden eine aufgezeichnete, noch verwendbare Einwilligung für `delegate`; `current_delegate` ist die Delegation, die das Konto aktuell gesetzt hat, und `nonce` ist seine EVM-Nonce.

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

Eine `StateAnchorView` enthält `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, `main_chain_height`, `anchored_at`, `pqc_aggregate_signature`, `transaction_count` und `compressed_state_proof`. Seit v3.2.2 ist die signierte Nachricht die **v2-Anchor-Nachricht**: das Domain-Tag `qorechain-multilayer-anchor-v2`, dann Chain-ID, Layer-ID, Layer-Höhe, State Root, Validator-Set-Hash, Transaktionszahl und komprimierter State Proof, wobei jedem Feld variabler Länge seine 8-Byte-Länge im Big-Endian-Format vorangestellt ist (die frühere v1-Nachricht hatte keine Chain-ID und keine Längenpräfixe, sodass eine Signatur auf jeder Chain gültig war). Sie wird gegen den registrierten PQC-Schlüssel des Layer-Erstellers verifiziert. `qorechaind query rdk anchor-sign-bytes` gibt die Bytes für einen Rollup-Batch aus. Eine Layer ohne Anchor liefert von `anchor/{layer_id}` HTTP `404` (`no anchor for layer ...`) und von `anchors/{layer_id}` eine leere Liste (`{"anchors": []}`).

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
| GET     | `/qorechain/burn/v1/stranded_rewards` | Beiseitegelegter und von der Governance noch nicht freigegebener Staker-Anteil      |

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

```json
{
  "stats": {
    "total_burned": "31574710367921",
    "burns_by_source": {
      "gas_fee": "31574710282421",
      "failed_tx": "85500",
      "milestone": "0",
      "amm": "0",
      "xqore_penalty": "0"
    },
    "last_burn_height": "3666968"
  }
}
```

Die echte Antwort listet jede Burn-Quelle auf (`ai_service`, `amm`, `auto_buyback`, `bridge_fee`, `contract_create`, `failed_tx`, `gas_fee`, `milestone`, `rollup_create`, `tge`, `treasury_buyback`, `xqore_penalty`); das Beispiel ist gekürzt. Beträge sind in `uqor` angegeben. `failed_tx` ist seit dem Upgrade v3.2.2 ungleich null, als der Burn für fehlgeschlagene Transaktionen begann, auf die tatsächlich berechnete Gebühr angewendet zu werden. Seit v3.2.3 werden alte `records` einzelner Burns bereinigt, sodass `records` ein aktuelles Fenster ist und nicht den vollständigen Verlauf zeigt; die Summen in `stats` sind kumuliert.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

```json
{ "reserved": "3807496785528", "released": "6693045921330", "initialized": true, "snapshot_height": "2981742" }
```

`reserved` ist der Betrag, der noch freizugeben ist, `released` ist, wie viel die Governance bereits herausbewegt hat, und `snapshot_height` ist die Höhe des Upgrades v3.2.0, das die Reserve erfasst hat. Die obigen Werte sind die zum Zeitpunkt der Erstellung: Die Governance hat den ersten Betrag (6.693.045,921330 QOR) am 19. Oktober 2026 freigegeben, und das Upgrade v3.2.3 hat die verbleibende Reserve auf seiner eigenen Höhe neu berechnet (3.807.496,785528 QOR). Ein weiterer Governance-Vorschlag, diesen neu berechneten Betrag freizugeben, befand sich zum Zeitpunkt der Erstellung noch in der Abstimmungsphase; lesen Sie daher die Live-Werte. Siehe [Tokenomics](/architecture/tokenomics).

## Abstract-Account-Modul {#abstract-account-module}

Der Abfragedienst für Abstract Accounts wird über REST unter `/qorechain/abstractaccount/v1/...` bereitgestellt (seit Chain-Version **v3.1.85**), einschließlich des **Permission Schema**, das zur Validierung von [Authenticator](/developer-guide/account-abstraction#authenticators)-Scopes ohne Hardcoding verwendet wird.

| Methode | Endpunkt                                           | Beschreibung                                                                |
| ------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/abstractaccount/v1/config`             | Modulkonfiguration (Feature-Probe: `enabled`)                               |
| GET     | `/qorechain/abstractaccount/v1/accounts`           | Listet Abstract Accounts auf                                                |
| GET     | `/qorechain/abstractaccount/v1/accounts/{address}` | Abstract-Account-Zustand für eine Adresse (`404`, falls keiner existiert)   |
| GET     | `/qorechain/abstractaccount/v1/permission_schema`  | `schema_version`, `permissions`, `msg_permissions`, `key_management_msgs`, `lane_rules` |
| GET     | `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` | **Nur Testnet (v3.2.4).** Die Sequenz, die ein verknüpfter Authenticator-Schlüssel als Nächstes signieren muss (`nonce`, `linked`) |

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
{
  "licenses": [
    {
      "grantee": "qor1...",
      "feature_id": "lightnode_operator",
      "expires_at": "0",
      "granted_at": "3536305",
      "granted_by": "qor1...",
      "suspended": false,
      "metadata": "",
      "active": true
    }
  ]
}
```

`expires_at: "0"` bedeutet, dass die Berechtigung nicht abläuft. Seit v3.2.3 kann die Governance die Lizenzautorität ersetzen, die diese Lizenzen erteilt (`MsgUpdateAuthority`); bereits erteilte Berechtigungen bleiben bestehen.

## Light-Node-Modul {#light-node-module}

| Methode | Endpunkt                                    | Beschreibung                                                                  |
| ------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| GET     | `/qorechain/lightnode/v1/params`            | Parameter für Registrierung, Heartbeat und Belohnungen                        |
| GET     | `/qorechain/lightnode/v1/stats`             | `total_registered`, `total_active`, `total_rewards`, `last_reward_height`     |
| GET     | `/qorechain/lightnode/v1/nodes`             | Listet registrierte Light Nodes auf                                           |
| GET     | `/qorechain/lightnode/v1/node/{address}`    | Ein Node (`{"node": null, "found": false}`, falls nicht registriert)          |
| GET     | `/qorechain/lightnode/v1/rewards/{address}` | Für eine Operator-Adresse angesammelte Belohnungen (`accumulated_rewards`)    |
| GET     | `/qorechain/lightnode/v1/reward_pool`       | Abrechnung des Belohnungspools (`balance`, `reserved`, `outstanding`, `payable`, `distributable`, `max_reward_per_block_per_node`, `max_reward_per_month_per_node`, `initialized`) |

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
  "balance": "487231800",
  "reserved": "487231800",
  "outstanding": "0",
  "payable": "0",
  "max_reward_per_block_per_node": "1713",
  "distributable": "0",
  "initialized": true,
  "max_reward_per_month_per_node": "2000000000"
}
```

`reserved` ist der Teil des Pools, der zurückgehalten wird und nur per Governance-Abstimmung bewegt werden kann. Die Grenzen pro Node sind in `uqor` angegeben: `max_reward_per_block_per_node` ist die Obergrenze pro Block, und seit v3.2.3 ist `max_reward_per_month_per_node` (`2000000000` uqor = 2.000 QOR pro 30 Tage) die Monatsobergrenze, anteilig nach Blockzeit und Uptime berechnet, sodass sie nicht mehr davon abhängt, wie schnell Blöcke kommen. Eine Obergrenze ist kein zugesicherter Betrag. Das Beispiel ist die Live-Antwort des Mainnets zum Zeitpunkt der Erstellung, nachdem die Governance die frühere Reserve freigegeben hatte (Vorschlag 8, 19. Oktober 2026). Im Testnet (v3.2.4, **nur Testnet**) enthält die Antwort zusätzlich `monthly_cap_active`, `last_distribution_time` und `last_distribution_height`, und die Grenze eines Nodes beginnt mit seiner eigenen Registrierung.

:::note Die Registrierung erfordert eine Lizenz
Die Chain lehnt eine Light-Node-Registrierung ohne eine aktive `lightnode_operator`-Lizenzberechtigung ab (`holders/lightnode_operator` listet die Berechtigungen auf). Zum Zeitpunkt der Erstellung meldet `stats` im Mainnet `"total_registered": "0"` und im Testnet einen registrierten Node. Den Programmstatus finden Sie unter [Light Nodes](/light-node/overview).
:::

## RDK-Modul {#rdk-module}

Der Abfragedienst des Rollup Development Kit wird über REST unter `/qorechain/rdk/v1/...` bereitgestellt (seit Chain-Version **v3.2.2**; in v3.2.0 und v3.2.1 war er ausschließlich über gRPC erreichbar).

| Methode | Endpunkt                                              | Beschreibung                                         |
| ------- | ----------------------------------------------------- | ---------------------------------------------------- |
| GET     | `/qorechain/rdk/v1/params`                            | Modulparameter                                       |
| GET     | `/qorechain/rdk/v1/rollups`                           | Listet Rollups auf                                   |
| GET     | `/qorechain/rdk/v1/rollup/{rollup_id}`                | Ein Rollup (`404`, falls unbekannt)                  |
| GET     | `/qorechain/rdk/v1/latest_batch/{rollup_id}`          | Der neueste Settlement-Batch des Rollups             |
| GET     | `/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`   | Ein Settlement-Batch                                 |
| GET     | `/qorechain/rdk/v1/batches/{rollup_id}`               | Die Batches des Rollups in Indexreihenfolge (paginiert) |
| GET     | `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`     | Ein Datensatz eines Data-Availability-Blobs          |

```bash
curl -s https://api.qore.host/qorechain/rdk/v1/params
```

```json
{
  "params": {
    "max_rollups": 100,
    "min_stake_for_rollup": "10000000000",
    "rollup_creation_burn_rate": "0.01",
    "default_challenge_window": "604800",
    "max_da_blob_size": "2097152",
    "blob_retention_blocks": "432000",
    "max_batches_per_block": 10
  }
}
```

Zum Zeitpunkt der Erstellung ist `rollups` in beiden Netzwerken eine leere Liste, sodass die Routen pro Rollup mit `404` antworten (zum Beispiel `{"code":5,"message":"rollup foo not found"}`). `default_challenge_window` wird in Sekunden angegeben (`604800`). Im Testnet (v3.2.4, **nur Testnet**) wird das optimistische Challenge-Fenster in Blockzeit gemessen.

## Inflationsmodul {#inflation-module}

Die Emissionseinstellungen und der Fortschritt werden über REST unter `/qorechain/inflation/v1/...` bereitgestellt (seit Chain-Version **v3.2.2**). Sie sind über keinen CLI-Befehl verfügbar.

| Methode | Endpunkt                              | Beschreibung                                                                |
| ------- | ------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/inflation/v1/params`      | Emissionsparameter: `emission_mode`, `fixed_epoch_emission`, `max_total_emission`, `epoch_length`, `enabled` |
| GET     | `/qorechain/inflation/v1/epoch_info`  | Fortschritt: `current_epoch`, `block_start`, `next_epoch_height`, `total_minted`, `max_total_emission`, `remaining_emission` |

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info
```

Im Mainnet ist `emission_mode` `"fixed"`, `fixed_epoch_emission` ist `"86000000000"` (86.000 QOR pro Epoche), `epoch_length` ist `"43200"` Blöcke und `max_total_emission` ist `"590000000000000"` (590.000.000 QOR, die kumulative Obergrenze). Diese Werte wurden durch Governance-Vorschlag 10 festgelegt (angenommen am 19. Oktober 2026); die erste Epoche, die den neuen festen Betrag verwendet, beginnt bei Block 3.672.000, und `epoch_info` zeigt die laufende Epoche und den bisher geminteten Betrag. Die Liste `schedule` in der Antwort gehört zum ursprünglichen Modus `schedule`; sie beschreibt nicht, was eine Epoche im Modus fixed mintet. Alle Beträge sind `uqor`. Das Testnet meldet eigene, abweichende Werte. Nur im Testnet (v3.2.4, **nur Testnet**) gibt es einen dritten Modus, `target_apy`, mit einem Feld `target_apy_bps`, der vom Bonus des Staking-Tiers-Moduls verwendet wird; das Mainnet hat keinen solchen Modus.

## Gas-Abstraction-Modul {#gas-abstraction-module}

| Methode | Endpunkt                                              | Beschreibung                                                                |
| ------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| GET     | `/qorechain/gasabstraction/v1/config`                 | Akzeptierte Gebührentoken, Aufschlag, Konvertierungslimit pro Block         |
| GET     | `/qorechain/gasabstraction/v1/conversion_rate?denom=` | Was eine Einheit eines Gebührentokens in `uqor` wert ist und ob es `usable` ist |
| GET     | `/qorechain/gasabstraction/v1/float`                  | Adresse, Guthaben und Nutzung des Konvertierungs-Floats in diesem Block     |

```bash
curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
```

```json
{
  "config": {
    "enabled": true,
    "native_denom": "uqor",
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0", "price_source": "", "rate_expiry_height": "0",
        "pool_id": "0", "min_liquidity": "", "max_deviation_bps": 0 }
    ],
    "premium_bps": 300,
    "max_tip_multiplier": 3,
    "float_min": "0",
    "block_conversion_cap": "0"
  }
}
```

Die Liste der akzeptierten Token enthält in beiden Netzwerken nur natives `uqor`, sodass Gebühren in `uqor` bezahlt werden und keine Konvertierung stattfindet. Die Governance fügt ein Token hinzu (mit einem Pool, einer Mindestliquidität und einer maximalen Abweichung zwischen zeitgewichtetem und Spot-Preis); eine in einem solchen Token bezahlte Gebühr wird über einen QOR-Float konvertiert und über einen AMM-Pool wieder aufgefüllt. `conversion_rate` ohne `?denom=` antwortet mit `500` (`denom is required`).

## Staking-Tiers-Modul (nur Testnet) {#stakingtier-module}

:::note Nur Testnet
Das Staking-Tiers-Modul ist Teil von **v3.2.4**, das nur im Testnet läuft. Im Mainnet antworten diese Routen mit `501`, und ein Mainnet-Upgrade auf v3.2.4 ist bisher nur vorgeschlagen (Governance-Vorschlag 13, bei Höhe 3.742.566).
:::

| Methode | Endpunkt                                  | Beschreibung                                                       |
| ------- | ----------------------------------------- | ------------------------------------------------------------------ |
| GET     | `/qorechain/stakingtier/v1/params`        | Lock-Stufen, der Mindestbetrag für einen Lock, die Strafe bei vorzeitiger Freigabe |
| GET     | `/qorechain/stakingtier/v1/locks/{holder}` | Die Locks eines Inhabers, was jeder aktuell ansammelt und was beansprucht werden kann |
| GET     | `/qorechain/stakingtier/v1/pool`          | Der Bonuspool: Guthaben, ausstehender Betrag, Überschuss und die letzte Abrechnung |

`params` listet die drei Lock-Laufzeiten (3, 6 und 12 Monate) mit ihren Parametern und `min_lock_amount` (`"10000000"` uqor, 10 QOR). Locks werden mit `tx stakingtier lock` erstellt (siehe [Transaktionsbefehle](/cli-reference/transaction-commands#stakingtier)).

## Nur-gRPC-Module {#grpc-only-modules}

Diese Module haben einen gRPC-`Query`-Dienst, aber **keine REST-Route**. Die Dienstnamen folgen dem Muster `qorechain.<module>.v1.Query`.

| Modul         | gRPC-Abfragemethoden (Chain-Version v3.2.3)                |
| ------------- | ---------------------------------------------------------- |
| `ai`          | `Config`, `Stats`                                          |
| `crossvm`     | `Params`, `PendingMessages`, `Message`                     |
| `reputation`  | `Params`                                                   |
| `rlconsensus` | `AgentStatus`, `Params`, `Observation`, `Reward`, `Policy` |
| `svm`         | `Slot`, `Account`, `Program`                               |
| `qca`         | `Config`                                                   |

Verwenden Sie `grpcurl` gegen Ihren eigenen Node oder die [CLI-Abfragebefehle](/cli-reference/query-commands). Die `rdk`-Abfragen sind ebenfalls über REST verfügbar (siehe [RDK-Modul](#rdk-module)); vor v3.2.2 waren sie ausschließlich über gRPC erreichbar.

Die Module xQORE, BTC-Restaking (Babylon) und FairBlock haben im aktuellen Release überhaupt keinen Abfragedienst, weder über REST noch über gRPC. Die Module Inflation und Gas Abstraction, die vor v3.2.2 keinen hatten, werden über REST bereitgestellt (siehe [Inflationsmodul](#inflation-module) und [Gas-Abstraction-Modul](#gas-abstraction-module)).

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
| `/cosmos/upgrade/v1beta1/current_plan`, `/applied_plan/{name}` | Ausstehende / angewendete Upgrades (`applied_plan/v3.2.3` liefert im Mainnet `{"height":"3662051"}`) |
| `/cosmos/circuit/v1/disable_list`                              | Netzwerkweit abgeschaltete Nachrichtentypen            |
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

`qorechain.pqc.v1.Query` hat im Mainnet drei Methoden, `Account`, `EVMWindow` und `EVMDelegationConsent`, und nur im Testnet (v3.2.4) eine vierte, `ProtocolFeatures`. Eine Methode `Params` gibt es nicht.

## Authentifizierung

Alle REST- und gRPC-Endpunkte sind standardmäßig unauthentifiziert. Für Produktivumgebungen sollte ein Reverse-Proxy (z. B. Nginx oder Caddy) vor dem Node platziert werden, um TLS-Terminierung und Zugriffskontrolle zu übernehmen.
