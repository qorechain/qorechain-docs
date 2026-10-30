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
Le query vengono eseguite sul nodo indicato da `--node`. Usa un endpoint RPC mainnet **`qorechain-vladi`** per i dati live (ad esempio `--node https://rpc.qore.host:443`), oppure un endpoint testnet **`qorechain-diana`** (`--node https://rpc-testnet.qore.host:443`) per i test. Il valore predefinito `tcp://localhost:26657` punta a un nodo eseguito da te. La mainnet esegue la release del nodo v3.2.5 dal 29 ottobre 2026 (applicata all'altezza 3.906.833 dalla proposta di governance 14; la v3.2.4 era stata applicata all'altezza 3.742.566 il 23 ottobre 2026); la testnet esegue la v3.2.6 (v3.2.4 dal 19 ottobre 2026, v3.2.5 dal 26 ottobre, v3.2.6 dal 27 ottobre). La release v3.2.4 aggiunge alcune route e comandi (contrassegnati come **v3.2.4** più sotto): funzionano su entrambe le reti, mentre un nodo ancora su una release precedente risponde con `Not Implemented`. La release v3.2.6 aggiunge due comandi (contrassegnati come **v3.2.6**, solo testnet finché la mainnet non la applica). I comandi di questa pagina sono stati verificati con il binario della release v3.2.3, eseguito su `https://rpc.qore.host:443`; le route v3.2.4 sono state verificate tramite REST il 23 ottobre 2026 e i comandi v3.2.6 rispetto al sorgente v3.2.6.
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
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` accetta il nome di un algoritmo (`dilithium5`, `mlkem1024`) o un ID numerico.
- `migration` accetta un **ID di algoritmo** (ad esempio `1`), non un indirizzo, e riporta `No active migration` quando nessuna è in corso.
- `account` riporta la chiave registrata. Oltre alla chiave, a `key_type` e ad `algorithm_name`, il record contiene `classical_key_source` (`stored`, `auth_account` o `none`: da dove proviene la chiave pubblica classica). Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) contiene anche `possession_proven`, che vale `true` quando la chiave è stata registrata con una prova di possesso verificata.
- `evm-window` mostra se l'indirizzo ha una finestra di autorizzazione aperta sulla lane EVM e quanti blocchi, transazioni e valore restano (`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`), più l'ambito della finestra (`native_only`, `allowed_targets`; dalla v3.2.3 della mainnet). REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent` mostra il consenso alla delega EIP-7702 dell'indirizzo (`found`, `live`, `delegate`, `granted_height`, `expiry_height`), la sua delega attuale e il suo nonce EVM. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params` e `hybrid-mode` riportano `hybrid_signature_mode` (`2` = obbligatoria su entrambe le reti) e `allow_classical_fallback` (`false`).

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

`stranded_rewards` riporta la quota degli staker che è stata depositata nel modulo di distribuzione senza coprire alcuna richiesta (`reserved`, `released`, `snapshot_height`). Può essere rilasciata solo con un voto di governance. La riserva è stata registrata per la prima volta all'upgrade v3.2.0 e ricalcolata all'altezza dell'upgrade v3.2.3, quindi leggi i valori live anziché una cifra citata altrove.

`stats` suddivide il burn cumulativo per origine, incluso `failed_tx`, diverso da zero dall'upgrade v3.2.2.

---

## mint e inflation

`qorechaind query mint params|inflation|annual-provisions` legge il modulo mint standard, il cui tasso è `0` su entrambe le reti; **non** riporta il piano di emissione del protocollo. Non esiste un comando CLI `query inflation`. Le impostazioni di emissione proprie del protocollo e il relativo avanzamento sono serviti via REST dalla v3.2.2:

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

Sulla mainnet queste riportano `emission_mode: "fixed"`, un'emissione fissa di 86.000 QOR per epoca di 43.200 blocchi e un tetto cumulativo di 590.000.000 QOR (proposta di governance 10, approvata il 19 ottobre 2026; la prima epoca con il nuovo importo inizia al blocco 3.672.000). Gli importi sono in `uqor`. La testnet riporta valori propri, diversi: è passata all'ulteriore modalità di emissione aggiunta dalla v3.2.4 (`target_apy`) tramite la propria governance (proposta 14, approvata il 20 ottobre 2026). Una rete cambia modalità solo con un proprio voto di governance, quindi la mainnet mantiene `fixed` finché un tale voto non viene approvato (verificato il 27 ottobre 2026).

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

`query reputation params` (REST `GET /qorechain/reputation/v1/params`) risponde solo sulla testnet. Sulla mainnet la route risponde `Not Implemented` (verificato il 30 ottobre 2026, dopo la v3.2.5), quindi parte sulla mainnet con una release di chain successiva.

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

`reward-pool` mostra come il saldo delle ricompense del modulo si suddivide in `reserved`, `outstanding`, `payable` e `distributable`, e i limiti per nodo: `max_reward_per_block_per_node` e, dalla v3.2.3, `max_reward_per_month_per_node` (2.000 QOR, proporzionati al tempo di blocco e all'uptime). Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) riporta anche `monthly_cap_active`, `last_distribution_time` e `last_distribution_height`.

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

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` mostra i parametri del modulo (stake minimo, tasso di burn alla creazione, finestra di contestazione, limiti DA). `anchor-sign-bytes` stampa, in esadecimale, i sign bytes v2 dell'ancora che il creatore di un rollup firma per `tx rdk submit-batch --anchor-signature`. Le stesse query sono servite via REST sotto `/qorechain/rdk/v1/...` dalla v3.2.2 (vedi [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#rdk-module)). `suggest-profile <use_case>` non interroga la chain; stampa soltanto un riferimento a un metodo JSON-RPC che gli endpoint pubblici non servono, quindi scegli un profilo da [Profili predefiniti](/rollups/preset-profiles).

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status` riporta la modalità, l'epoca e il numero di passi dell'agente; `policy` riporta l'epoca e il numero di pesi della policy memorizzata (non i pesi). **v3.2.6 (solo testnet finché la mainnet non applica quella release):** `applied-params` stampa i valori che l'agente tiene come applicati (tempo di blocco, floor del prezzo del gas, pesi dei pool) e `last-action` l'azione che ha proposto nel suo ultimo passo, registrata in ogni modalità, compresa quella shadow, in cui nulla viene applicato. Tutti questi sono serviti anche via REST sulla testnet (vedi [Modulo RL Consensus](/api-reference/rest-grpc-endpoints#rlconsensus-module)); su un nodo mainnet i due nuovi comandi rispondono `Not Implemented` finché la mainnet non applica quella release.

---

## abstractaccount

Il modulo di account astratti è disattivato sulla mainnet (`config.enabled` è `false`, quindi lì queste query non restituiscono alcun account) e attivato sulla testnet dalla governance (`config.enabled` è `true`; verificato il 27 ottobre 2026).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>` e `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` costruiscono le firme dell'autenticatore offline. Il seed dell'autenticatore non è mai un argomento: viene letto da `--seed-file <file>` (o `-` per stdin), dalla variabile d'ambiente `QORE_AUTH_SEED` oppure da un prompt senza eco, e `auth-keygen` lo scrive in un nuovo file `0600` (`--out`) invece di stamparlo.

---

## gasabstraction

Le query di gas abstraction sono servite su entrambe le reti dalla v3.2.2:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

L'elenco dei token accettati contiene solo `uqor` nativo su entrambe le reti, quindi le commissioni si pagano in `uqor` e non avviene alcuna conversione; la governance decide quali altri token sono accettati. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. Vedi [Gas Abstraction](/user-guide/gas-abstraction).

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

Al momento della stesura non esiste alcun pool su nessuna delle due reti. Sulla testnet i tre token di test Fest sono disponibili come seconda denominazione di un pool (vedi [Token di test della testnet](/api-reference/rest-grpc-endpoints#fest-tokens)).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

Il modulo dei tier di staking fa parte della release **v3.2.4**: gira sulla testnet dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026 (altezza 3.742.566, proposta di governance 13). Un nodo su una release precedente risponde a queste query con `Not Implemented`. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. Vedi [Comandi di transazione](/cli-reference/transaction-commands#stakingtier).

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

`query upgrade applied <name>` è il modo per leggere quando un upgrade è entrato in vigore: sulla mainnet `v3.2.2` è stato applicato all'altezza 3.556.788, `v3.2.3` all'altezza 3.662.051 e `v3.2.4` all'altezza 3.742.566 e `v3.2.5` all'altezza 3.906.833; sulla testnet `v3.2.2` a 6.905.034, `v3.2.3` a 8.003.746, `v3.2.4` a 8.337.253, `v3.2.5` a 8.890.800 e `v3.2.6` a 8.970.638 (`0` significa non applicato; sulla mainnet `v3.2.6` è `0` al momento della stesura). L'elenco del circuit breaker della mainnet (`disabled-list`) contiene attualmente i messaggi di creazione degli account in vesting, lo store e l'istanziazione di QoreChain Native, la pausa e la ripresa dei pool AMM, la chiamata cross-VM, l'aggiornamento dello stato dei layer multilayer, la deprecazione e la disabilitazione degli algoritmi PQC e i messaggi di governance del consenso PRISM; quello della testnet contiene solo il messaggio QoreChain Native `MsgStoreCode` (verificato il 27 ottobre 2026; l'istanziazione è stata consentita dalla governance della testnet).

---

## evm, erc20, wasm

I comandi `wasm` leggono QoreChain Native, il nome che QoreChain dà al proprio runtime di smart contract CosmWasm; i nomi dei comandi e dei moduli mantengono la grafia `wasm`.

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

`query erc20 token-pairs` è vuoto sulla mainnet; sulla testnet elenca i tre token di test Fest (fUSD, fETH, fBTC) e un token IBC. Le loro denominazioni bank sono `erc20:` seguito dall'indirizzo del contratto EIP-55 e sono sensibili alle maiuscole; vedi [Token di test Fest della testnet](/developer-guide/evm-development#fest-tokens). Sulla testnet, `query wasm params` mostra `code_upload_access` `Nobody` e `instantiate_default_permission` `Everybody`; sulla mainnet entrambi sono `Nobody` (vedi [Sviluppo con QoreChain Native](/developer-guide/cosmwasm-development)).

---

## Moduli senza CLI

`xqore`, `babylon` e `fairblock` non hanno comandi di transazione né di query. Al momento non sono utilizzabili dalla CLI né da alcuna API pubblica.
