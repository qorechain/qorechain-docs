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
| Versione della chain (27 ottobre 2026) | v3.2.4 (dall'altezza 3.742.566, 23 ottobre 2026, proposta di governance 13). La proposta di governance 14 applicherebbe la v3.2.5 all'altezza 3.906.833 ed era nel suo periodo di votazione al momento della stesura; ciò che la v3.2.5 aggiunge sarà documentato il giorno in cui la mainnet la applica |
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
| Versione della chain (27 ottobre 2026) | v3.2.6 (dall'altezza 8.970.638, 27 ottobre 2026; la v3.2.5 è stata applicata all'altezza 8.890.800 il 26 ottobre e la v3.2.4 all'altezza 8.337.253 il 19 ottobre) |
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

### Differenze solo testnet che contano per un client {#testnet-only}

La testnet è una rete di staging e gira in anticipo rispetto alla mainnet, quindi alcune
cose che si possono leggere lì non sono sulla mainnet (verificato il 27 ottobre 2026; l'elenco completo è in
[Differenze tra testnet e mainnet](/appendix/chain-parameters#testnet-differences)):

* **Route REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` e `GET /qorechain/crossvm/v1/params` rispondono sulla testnet; la mainnet risponde HTTP 501 per esse. Le route dell'AMM sotto `/qorechain/amm/v1/` (`pools`, `params`) rispondono su entrambe le reti.
* **Token di test.** Tre token senza valore esistono solo sulla testnet, come denominazioni bank chiamate `erc20:<EIP-55 contract address>` (sensibili alle maiuscole): fUSD (6 decimali), fETH (18) e fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` li elenca. L'unica denominazione bank della mainnet è `uqor`. Vedi [Token di test della testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Moduli attivati.** Il modulo `abstractaccount` è abilitato sulla testnet e disattivato sulla mainnet, tre precompilati EVM sono attivi sulla testnet e nessuno sulla mainnet, e l'istanziazione di QoreChain Native è aperta sulla testnet.

## Porte predefinite

`createClient()` usa per impostazione predefinita queste porte localhost. Sovrascrivi
`endpoints` per puntare a un nodo reale.

| Endpoint | Porta | Scopo |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldi bank, info account, query dei moduli |
| gRPC | `9090` | query gRPC |
| Consensus RPC | `26657` | firma/trasmissione tx native, letture QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (e `qor_*` / precompile sui nodi che li abilitano) |
| EVM JSON-RPC (WS) | `8546` | sottoscrizioni WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibile con Solana |

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

Entrambi i preset includono gli stessi valori predefiniti localhost; seleziona `mainnet`
e sovrascrivi gli endpoint con gli URL pubblici (o con quelli del tuo nodo):

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
