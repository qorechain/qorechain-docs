---
slug: /cli-reference/query-commands
title: Comandi di query
sidebar_label: Comandi di query
sidebar_position: 3
---

# Comandi di query

Tutti i comandi di query seguono il modello:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Le query vengono eseguite sul nodo indicato da `--node`. Usa un endpoint RPC mainnet **`qorechain-vladi`** per i dati live (ad esempio `--node https://rpc.qore.host:443`), oppure un endpoint testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) per i test. Il valore predefinito `tcp://localhost:26657` punta a un nodo eseguito da te. La mainnet esegue la release del nodo v3.2.1 e la testnet la v3.2.2; la testnet può servire alcune route aggiuntive che la mainnet non ha ancora, quindi una query che funziona lì può restituire `Not Implemented` sulla mainnet.
:::

Flag comuni si applicano a ogni sottocomando `query`:

| Flag       | Tipo   | Descrizione                                          |
| ---------- | ------ | ---------------------------------------------------- |
| `--node`   | string | Endpoint RPC (predefinito: `tcp://localhost:26657`)  |
| `--output` | string | Formato di output: `json` o `text`                   |
| `--height` | int    | Interroga lo stato a una specifica altezza di blocco |

Non tutti i moduli hanno una query CLI. Dove manca un comando, usa l'endpoint REST (`https://api.qore.host/...`); vedi [API REST](/api-reference/rest-grpc-endpoints).

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(Non esiste `query bank total`.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` accetta il nome completo dell'enum: `BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` o `BOND_STATUS_UNBONDED` (`--status bonded` viene rifiutato).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` accetta `deposit-period`, `voting-period`, `passed`, `rejected` o `failed`. Altri filtri: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
```

- `algorithm` accetta il nome di un algoritmo (`dilithium5`, `mlkem1024`) o un ID numerico.
- `migration` accetta un **ID di algoritmo** (ad esempio `1`), non un indirizzo, e riporta `No active migration` quando nessuna è in corso.
- `evm-window` mostra se l'indirizzo ha una finestra di autorizzazione aperta sul lane EVM e quanti blocchi, transazioni e valore restano (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

---

## burn

Il modulo burn non ha una query CLI. Usa REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` riporta la quota degli staker che è stata depositata nel modulo di distribuzione senza coprire alcuna richiesta, come registrato all'upgrade v3.2.0 (`reserved`, `released`, `snapshot_height`). Può essere rilasciata solo con un voto di governance.

---

## mint e inflation

`qorechaind query mint params|inflation|annual-provisions` legge il modulo mint standard, il cui tasso è `0` su entrambe le reti; **non** riporta il piano di emissione del protocollo. Non esiste un comando `query inflation`.

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation e qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

Non esistono query di reputazione per singolo validatore né di classificazione dei pool.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` mostra come il saldo delle ricompense del modulo si suddivide in `reserved`, `outstanding`, `payable` e `distributable`.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` restituisce un errore `NotFound` quando il beneficiario non detiene alcuna licenza per la funzionalità.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

`config` mostra i parametri del modulo (stake minimo, tasso di burn alla creazione, finestra di contestazione, limiti DA). `suggest-profile <use_case>` non interroga la chain; stampa soltanto un riferimento a un metodo JSON-RPC che gli endpoint pubblici non servono, quindi scegli un profilo da [Profili predefiniti](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

Il modulo di account astratti è attualmente disattivato su entrambe le reti (`config.enabled` è `false`), quindi queste query non restituiscono alcun account.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` e `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` costruiscono le firme dell'autenticatore offline. Il seed dell'autenticatore non è mai un argomento: viene letto da `--seed-file <file>` (o `-` per stdin), dalla variabile d'ambiente `QORE_AUTH_SEED` oppure da un prompt senza eco, e `auth-keygen` lo scrive in un nuovo file `0600` (`--out`) invece di stamparlo.

---

## gasabstraction

La mainnet non serve ancora query di gas abstraction (`qorechaind query gasabstraction ...` stampa il proprio testo di aiuto e la route REST restituisce `Not Implemented`). Le commissioni si pagano solo in `uqor`; vedi [Gas Abstraction](/user-guide/gas-abstraction).

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

---

## evm, erc20, wasm

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

---

## Moduli senza CLI

`xqore`, `babylon` e `fairblock` non hanno comandi di transazione né di query. Al momento non sono utilizzabili dalla CLI né da alcuna API pubblica.
