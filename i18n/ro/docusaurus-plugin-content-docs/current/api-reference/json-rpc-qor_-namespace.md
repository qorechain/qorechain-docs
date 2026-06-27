---
slug: /api-reference/json-rpc-qor_-namespace
title: JSON-RPC — Spațiul de nume qor_
sidebar_label: JSON-RPC — Spațiul de nume qor_
sidebar_position: 2
---

# JSON-RPC — Spațiul de nume qor_

Spațiul de nume `qor_` oferă metode JSON-RPC specifice QoreChain pentru interogarea stării criptografiei post-cuantice, a analizei AI, a mesageriei cross-VM, a stării pe mai multe straturi, a operațiunilor de bridge, a tokenomics-ului, a infrastructurii de rollup și a stării consensului PRISM.

## Conexiune

| Transport | Adresă implicită        |
| --------- | ----------------------- |
| HTTP      | `http://localhost:8545` |
| WebSocket | `ws://localhost:8546`   |

Spațiul de nume `qor_` este servit alături de `eth_`, `web3_`, `net_` și `txpool_` pe aceleași porturi. Activează-l în `app.toml`:

```toml
[json-rpc]
api = "eth,web3,net,txpool,qor"
```

:::note
Spațiul de nume `qor_` este disponibil pe mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**, activ pe versiunea de lanț **v3.1.77**) și pe testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Exemplele de mai jos presupun un nod local; înlocuiește cu endpoint-ul de mainnet sau testnet al furnizorului tău pentru acces la distanță.
:::

---

## Metode

| Metodă                        | Parametri                               | Descriere                                               |
| ----------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `qor_getPQCKeyStatus`         | `address` (string)                      | Returnează starea înregistrării cheii PQC pentru un cont |
| `qor_getHybridSignatureMode`  | niciunul                                | Returnează modul curent de aplicare a semnăturii hibride |
| `qor_getAIStats`              | niciunul                                | Returnează statistici agregate de procesare ale modulului AI |
| `qor_getCrossVMMessage`       | `messageId` (string)                    | Recuperează un mesaj cross-VM după ID-ul său             |
| `qor_getReputationScore`      | `validator` (string)                    | Returnează scorul de reputație pentru o adresă de validator |
| `qor_getLayerInfo`            | `layerId` (string)                      | Returnează metadatele și starea unui strat înregistrat   |
| `qor_getBridgeStatus`         | `chainId` (string)                      | Returnează starea bridge-ului și totalurile blocate pentru un lanț |
| `qor_getRLAgentStatus`        | niciunul                                | Returnează modul curent al agentului PRISM și starea operațională |
| `qor_getRLObservation`        | niciunul                                | Returnează cel mai recent vector de observație PRISM     |
| `qor_getRLReward`             | niciunul                                | Returnează metricile cumulative de recompensă PRISM      |
| `qor_getPoolClassification`   | `validator` (string)                    | Returnează clasificarea pool-ului CPoS pentru un validator |
| `qor_getBurnStats`            | niciunul                                | Returnează statistici de ardere pe toate canalele        |
| `qor_getXQOREPosition`        | `address` (string)                      | Returnează poziția de staking xQORE pentru o adresă      |
| `qor_getInflationRate`        | niciunul                                | Returnează rata de inflație curentă anualizată           |
| `qor_getTokenomicsOverview`   | niciunul                                | Returnează o privire de ansamblu combinată asupra arderii, inflației și ofertei |
| `qor_getRollupStatus`         | `rollupId` (string)                     | Returnează starea și configurația unui rollup specific   |
| `qor_listRollups`             | niciunul                                | Returnează o listă cu toate rollup-urile înregistrate    |
| `qor_getSettlementBatch`      | `rollupId` (string), `batchIndex` (int) | Returnează un lot de decontare specific pentru un rollup |
| `qor_suggestRollupProfile`    | `useCase` (string)                      | Recomandare de profil de rollup asistată de AI pentru un caz de utilizare |
| `qor_getDABlobStatus`         | `rollupId` (string), `blobIndex` (int)  | Returnează starea unui blob DA specific                  |
| `qor_getBTCStakingPosition`   | `address` (string)                      | Returnează poziția de staking BTC prin modulul Babylon   |
| `qor_getAbstractAccount`      | `address` (string)                      | Returnează detaliile contului abstract și regulile de cheltuire |
| `qor_getFairBlockStatus`      | niciunul                                | Returnează starea și configurația criptării FairBlock    |
| `qor_getGasAbstractionConfig` | niciunul                                | Returnează tokenurile acceptate și parametrii de abstractizare a gas-ului |
| `qor_getLaneConfiguration`    | niciunul                                | Returnează configurația de prioritizare a TX pe 5 benzi  |

---

## Exemple

### qor_getBurnStats

**Cerere:**

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

**Răspuns:**

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

**Cerere:**

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

**Răspuns:**

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

**Cerere:**

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

**Răspuns:**

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

## Coduri de eroare

| Cod    | Mesaj            | Descriere                             |
| ------ | ---------------- | ------------------------------------- |
| -32600 | Invalid Request  | Cerere JSON-RPC malformată            |
| -32601 | Method not found | Metoda nu există                      |
| -32602 | Invalid params   | Parametri lipsă sau invalizi          |
| -32603 | Internal error   | Eroare de procesare pe partea serverului |
| -32000 | Module disabled  | Modulul interogat nu este activat     |
| -32001 | Entity not found | Resursa solicitată nu există          |
