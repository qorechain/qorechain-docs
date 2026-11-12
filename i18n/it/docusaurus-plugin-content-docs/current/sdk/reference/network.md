---
slug: /sdk/reference/network
title: Rete ed endpoint
sidebar_label: Rete ed endpoint
sidebar_position: 1
---

# Riferimento rete ed endpoint

## Mainnet

| Campo | Valore |
| --- | --- |
| Preset di rete | `mainnet` |
| Chain id | `qorechain-vladi` (attiva dal 7 giugno 2026) |
| Versione della chain (12 novembre 2026) | v3.2.7 (dall'altezza 4.164.600, 12 novembre 2026, proposta di governance 16; la v3.2.6 è stata applicata all'altezza 4.020.000 il 4 novembre, la v3.2.5 all'altezza 3.906.833 il 29 ottobre e la v3.2.4 all'altezza 3.742.566 il 23 ottobre). L'SDK 0.12.0 è il client per la v3.2.5 e funziona sulla v3.2.6 e sulla v3.2.7 (il formato di firma non è cambiato); la 0.10.0 era il client per la v3.2.4 |
| EVM chain ID | `9801` |
| Token visualizzato | `QOR` |
| Denominazione base | `uqor` |
| Unità base per QOR | `10^6` |
| Prefisso bech32 account | `qor` |
| Prefisso bech32 validatore | `qorvaloper` |

## Testnet

| Campo | Valore |
| --- | --- |
| Preset di rete | `testnet` |
| Chain id | `qorechain-diana` (attiva) |
| Versione della chain | v3.2.8 (dall'altezza 9.929.500, 12 novembre 2026, applicata dalla governance; la mainnet non l'ha applicata. La v3.2.7 è stata applicata all'altezza 9.594.600 il 6 novembre; la v3.2.6 è stata applicata all'altezza 8.970.638 il 27 ottobre; la v3.2.5 è stata applicata all'altezza 8.890.800 il 26 ottobre e la v3.2.4 all'altezza 8.337.253 il 19 ottobre) |
| EVM chain ID | `9800` |
| Token visualizzato | `QOR` |
| Denominazione base | `uqor` |
| Unità base per QOR | `10^6` |
| Prefisso bech32 account | `qor` |
| Prefisso bech32 validatore | `qorvaloper` |

## Endpoint pubblici {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (sola lettura) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Gli endpoint EVM servono `eth_`, `net_`, `web3_` e `txpool_`; il namespace
`qor_` non è abilitato. Vedi anche [Reti](/appendix/networks#public-endpoints).

Dall'SDK 0.12.0 i preset `mainnet` e `testnet` usano per default questi URL REST, RPC di consenso e
JSON-RPC EVM (e il WebSocket EVM della testnet). I preset **non** impostano alcun
endpoint gRPC e **nessun** endpoint SVM, anche se gli URL SVM di sola lettura qui sopra esistono
(le transazioni SVM non sono aperte): il codice che ne ha bisogno fallisce con un errore che
nomina l'endpoint da passare. Gli endpoint della testnet hanno un limite di richieste per IP; esegui o
usa un tuo nodo per il traffico di produzione. Prima della 0.12.0 ogni preset usava per default
localhost.

### Differenze solo testnet che contano per un client {#testnet-only}

La testnet è una rete di staging e gira in anticipo rispetto alla mainnet, quindi alcune
cose che si possono leggere lì non sono sulla mainnet (verificato il 27 ottobre 2026; l'elenco completo è in
[Differenze tra testnet e mainnet](/appendix/chain-parameters#testnet-differences)):

* **Route REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` e `GET /qorechain/crossvm/v1/params` rispondono sulla testnet. La mainnet rispondeva HTTP 501 per esse fino alla chain v3.2.6; da quando ha applicato la v3.2.6 (4 novembre 2026) tutte quelle route rispondevano HTTP 200 sulla mainnet quando sono state verificate quel giorno. Le route dell'AMM sotto `/qorechain/amm/v1/` (`pools`, `params`) rispondono su entrambe le reti.
* **Route della chain v3.2.7.** Il 7 novembre 2026 la testnet ha risposto HTTP 200 a `GET /qorechain/pqc/v1/multisig/{address}` (`{"found":false,"multisig":null}` per un indirizzo che non ne ha), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` e `GET /qorechain/svm/v1/cluster_info`; la mainnet ha risposto HTTP 501 per tutte tranne `/qorechain/stakingtier/v1/pool` (200) quel giorno, prima di applicare la v3.2.7. Da quando la mainnet ha applicato la v3.2.7 (12 novembre 2026) queste route rispondono anche lì: il 12 novembre 2026 `GET /qorechain/pqc/v1/multisig/{address}`, `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` e `GET /qorechain/svm/v1/cluster_info` hanno risposto HTTP 200 sulla mainnet (la route multisig ha restituito `{"found":false,"multisig":null}` per un indirizzo che non ne ha; `cluster_info` riporta `execution_enabled` false, perché la lane SVM è ancora disattivata). La query del documento di firma textual è una route POST: `GET /qorechain/pqc/v1/textual_sign_doc` risponde 501, e una POST con corpo vuoto ha risposto 400 ("tx_bytes or tx_json is required") sulla mainnet, quindi la route è instradata. Le route `GET /qorechain/pqc/v1/evm_limits` e `GET /qorechain/svm/v1/params` (v3.2.8) hanno risposto 501 sulla mainnet. L'SDK 0.12.0 non ha alcun builder né client tipizzato per nessuna delle route della v3.2.7.
* **Token di test.** Tre token senza valore esistono solo sulla testnet, come denominazioni bank chiamate `erc20:<EIP-55 contract address>` (sensibili alle maiuscole): fUSD (6 decimali), fETH (18) e fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` li elenca. L'unica denominazione bank della mainnet è `uqor`. Vedi [Token di test della testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Moduli attivati.** Il modulo `abstractaccount` è abilitato sulla testnet e disattivato sulla mainnet, i precompilati EVM sono attivi sulla testnet (tre il 27 ottobre, quattro il 4 novembre) e nessuno sulla mainnet, e l'istanziazione di QoreChain Native è aperta sulla testnet.

## Porte predefinite (il preset `localnet`) {#default-ports}

Il preset `localnet` (chain id `qorechain-devnet`, nessun EVM chain id impostato) usa queste
porte localhost, per un nodo sulla tua macchina. Prima dell'SDK 0.12.0 ogni preset le usava
per default; dalla 0.12.0 lo fa solo `localnet`. Sovrascrivi `endpoints` per puntare a
un altro nodo.

| Endpoint | Porta | Scopo |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldi bank, info account, query dei moduli |
| gRPC | `9090` | query gRPC |
| Consensus RPC | `26657` | firma/trasmissione tx native, letture QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (e `qor_*` / precompile sui nodi che li abilitano) |
| EVM JSON-RPC (WS) | `8546` | sottoscrizioni WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibile con Solana |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

Esempio con endpoint espliciti:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

L'SDK espone preset di rete e helper di lookup (esportati dal modulo networks) così da
poter elencare e risolvere le reti in modo programmatico. In Python/Go/Rust gli
equivalenti sono `create_client` / `CreateClient` / `ClientBuilder` più il modulo
`networks`.

## Puntare alla mainnet

Seleziona `mainnet` per puntare ad essa. Dall'SDK 0.12.0 il preset porta già gli URL
pubblici, quindi gli endpoint qui sotto sono i valori predefiniti; passa `endpoints` solo per il tuo nodo
(un SDK precedente alla 0.12.0 usa per default localhost e ne ha bisogno):

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
