---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — qor_-Namespace
sidebar_label: JSON-RPC — qor_-Namespace
sidebar_position: 2
---

# JSON-RPC — qor_-Namespace

Der `qor_`-Namespace stellt QoreChain-spezifische JSON-RPC-Methoden bereit, um den Status der Post-Quanten-Kryptografie, KI-Analysen, VM-übergreifendes Messaging, mehrschichtigen State, Bridge-Operationen, Tokenomics, Rollup-Infrastruktur und PRISM-Konsensstatus abzufragen.

## Verbindung

| Transport | Standardadresse         |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

Der `qor_`-Namespace wird zusammen mit `eth_`, `web3_`, `net_` und `txpool_` auf denselben Ports bereitgestellt. Aktivieren Sie ihn in `app.toml`:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
Der `qor_`-Namespace ist im **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**, live auf Chain-Version **v3.1.82**) und im **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) verfügbar. Die untenstehenden Beispiele gehen von einem lokalen Node aus; ersetzen Sie für den Fernzugriff den Mainnet- oder Testnet-Endpunkt Ihres Anbieters.
:::

---

## Methoden

| Methode                       | Parameter                               | Beschreibung                                                       |
| ----------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | Gibt den PQC-Schlüsselregistrierungsstatus eines Kontos zurück    |
| `qor_getHybridSignatureMode`  | keine                                   | Gibt den aktuellen Durchsetzungsmodus für Hybridsignaturen zurück |
| `qor_getAIStats`              | keine                                   | Gibt aggregierte Verarbeitungsstatistiken des KI-Moduls zurück    |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | Ruft eine VM-übergreifende Nachricht anhand ihrer ID ab           |
| `qor_getReputationScore`      | `validator` (string)                    | Gibt den Reputationswert für eine Validator-Adresse zurück        |
| `qor_getLayerInfo`            | `layerId` (string)                      | Gibt Metadaten und Status einer registrierten Layer zurück        |
| `qor_getBridgeStatus`         | `chainId` (string)                      | Gibt Bridge-Status und gesperrte Gesamtbeträge einer Chain zurück |
| `qor_getRLAgentStatus`        | keine                                   | Gibt den aktuellen PRISM-Agentenmodus und Betriebsstatus zurück   |
| `qor_getRLObservation`        | keine                                   | Gibt den neuesten PRISM-Beobachtungsvektor zurück                 |
| `qor_getRLReward`             | keine                                   | Gibt kumulierte PRISM-Reward-Metriken zurück                      |
| `qor_getPoolClassification`   | `validator` (string)                    | Gibt die CPoS-Pool-Klassifizierung für einen Validator zurück     |
| `qor_getBurnStats`            | keine                                   | Gibt Burn-Statistiken über alle Kanäle hinweg zurück              |
| `qor_getXQOREPosition`        | `address` (string)                      | Gibt die xQORE-Staking-Position für eine Adresse zurück           |
| `qor_getInflationRate`        | keine                                   | Gibt die aktuelle annualisierte Inflationsrate zurück             |
| `qor_getTokenomicsOverview`   | keine                                   | Gibt eine kombinierte Übersicht zu Burn, Inflation und Supply zurück |
| `qor_getRollupStatus`         | `rollupId` (string)                     | Gibt Status und Konfiguration eines bestimmten Rollups zurück     |
| `qor_listRollups`             | keine                                   | Gibt eine Liste aller registrierten Rollups zurück                |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | Gibt einen bestimmten Settlement-Batch eines Rollups zurück       |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | KI-gestützte Rollup-Profil-Empfehlung für einen Anwendungsfall    |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | Gibt den Status eines bestimmten DA-Blobs zurück                  |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Gibt die BTC-Staking-Position über das Babylon-Modul zurück       |
| `qor_getAbstractAccount`      | `address` (string)                      | Gibt Details und Ausgaberegeln eines Abstract Accounts zurück     |
| `qor_getFairBlockStatus`      | keine                                   | Gibt den FairBlock-Verschlüsselungsstatus und die Konfiguration zurück |
| `qor_getGasAbstractionConfig` | keine                                   | Gibt akzeptierte Token und Gas-Abstraction-Parameter zurück       |
| `qor_getLaneConfiguration`    | keine                                   | Gibt die 5-Lane-TX-Priorisierungskonfiguration zurück             |

---

## Beispiele

### qor_getBurnStats

**Anfrage:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getBurnStats",
    "params": [],
    "id": 1
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "total_burned": "1250000000",
    "total_distributed": "4750000000",
    "channels": {
      "validator_share": "0.40",
      "burn_share": "0.30",
      "treasury_share": "0.20",
      "staker_share": "0.10"
    },
    "last_block_burned": "342891"
  }
}
```

### qor_getRLAgentStatus

**Anfrage:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRLAgentStatus",
    "params": [],
    "id": 2
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "agent_mode": "observe",
    "observation_interval": 10,
    "circuit_breaker": {
      "active": false,
      "max_param_change": "0.10",
      "cooldown_blocks": 100
    },
    "last_observation_block": "342885",
    "cumulative_reward": "18.742"
  }
}
```

### qor_getRollupStatus

**Anfrage:**

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getRollupStatus",
    "params": ["rollup-001"],
    "id": 3
  }'
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "rollup_id": "rollup-001",
    "status": "active",
    "settlement_type": "optimistic",
    "operator": "qor1abc123...",
    "total_batches": 147,
    "last_finalized_batch": 145,
    "pending_batches": 2,
    "stake": "10000000000uqor",
    "created_at_height": 100230
  }
}
```

---

## Fehlercodes

| Code   | Meldung          | Beschreibung                              |
| ------ | ---------------- | ----------------------------------------- |
| -32600 | Invalid Request  | Fehlerhaft formatierte JSON-RPC-Anfrage   |
| -32601 | Method not found | Die Methode existiert nicht               |
| -32602 | Invalid params   | Fehlende oder ungültige Parameter         |
| -32603 | Internal error   | Serverseitiger Verarbeitungsfehler        |
| -32000 | Module disabled  | Das abgefragte Modul ist nicht aktiviert  |
| -32001 | Entity not found | Die angeforderte Ressource existiert nicht |
