---
slug: /sdk/reference/network
title: Rețea și endpoint-uri
sidebar_label: Rețea și endpoint-uri
sidebar_position: 1
---

# Referință rețea și endpoint-uri

## Mainnet

| Câmp | Valoare |
| --- | --- |
| Presetare de rețea | `mainnet` |
| Chain id | `qorechain-vladi` (live din 7 iunie 2026) |
| Versiune lanț (27 octombrie 2026) | v3.2.4 (de la înălțimea 3,742,566, 23 octombrie 2026, propunerea de guvernanță 13). Propunerea de guvernanță 14 ar aplica v3.2.5 la înălțimea 3,906,833 și se afla în perioada de votare la momentul redactării; ce adaugă v3.2.5 este documentat în ziua în care mainnet-ul o aplică |
| ID lanț EVM | `9801` |
| Token afișat | `QOR` |
| Denominare de bază | `uqor` |
| Unități de bază per QOR | `10^6` |
| Prefix bech32 cont | `qor` |
| Prefix bech32 validator | `qorvaloper` |

## Testnet

| Câmp | Valoare |
| --- | --- |
| Presetare de rețea | `testnet` |
| Chain id | `qorechain-diana` (live) |
| Versiune lanț (27 octombrie 2026) | v3.2.6 (de la înălțimea 8,970,638, 27 octombrie 2026; v3.2.5 a fost aplicată la înălțimea 8,890,800 pe 26 octombrie, iar v3.2.4 la înălțimea 8,337,253 pe 19 octombrie) |
| ID lanț EVM | `9800` |
| Token afișat | `QOR` |
| Denominare de bază | `uqor` |
| Unități de bază per QOR | `10^6` |
| Prefix bech32 cont | `qor` |
| Prefix bech32 validator | `qorvaloper` |

## Endpoint-uri publice {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (ID lanț 9801) | `https://evm-testnet.qore.host` (ID lanț 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (doar citire) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Endpoint-urile EVM servesc `eth_`, `net_`, `web3_` și `txpool_`; namespace-ul
`qor_` nu este activat. Vezi și [Rețele](/appendix/networks#public-endpoints).

### Diferențe doar de testnet care contează pentru un client {#testnet-only}

Testnet-ul este o rețea de staging și rulează înaintea mainnet-ului, deci câteva lucruri
pe care le puteți citi acolo nu există pe mainnet (verificat la 27 octombrie 2026; lista
completă se află în
[Diferențe între testnet și mainnet](/appendix/chain-parameters#testnet-differences)):

* **Rute REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` și `GET /qorechain/crossvm/v1/params` răspund pe testnet; mainnet-ul răspunde cu HTTP 501 pentru ele. Rutele AMM de sub `/qorechain/amm/v1/` (`pools`, `params`) răspund pe ambele rețele.
* **Tokenuri de test.** Trei tokenuri fără valoare există doar pe testnet, ca denominații bank numite `erc20:<EIP-55 contract address>` (sensibile la majuscule): fUSD (6 zecimale), fETH (18) și fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` le listează. Singura denominație bank a mainnet-ului este `uqor`. Vezi [Tokenuri de test pe testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Module pornite.** Modulul `abstractaccount` este activat pe testnet și oprit pe mainnet, trei precompilate EVM sunt active pe testnet și niciunul pe mainnet, iar instanțierea QoreChain Native este deschisă pe testnet.

## Porturi implicite

`createClient()` folosește implicit aceste porturi localhost. Suprascrie
`endpoints` pentru a indica spre un nod real.

| Endpoint | Port | Scop |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | solduri bank, info cont, interogări de modul |
| gRPC | `9090` | interogări gRPC |
| Consensus RPC | `26657` | semnare/difuzare tx native, citiri QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (și `qor_*` / precompilate pe nodurile care le activează) |
| EVM JSON-RPC (WS) | `8546` | abonamente WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibil cu Solana |

Exemplu cu endpoint-uri explicite:

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

SDK-ul expune presetări de rețea și helperi de căutare (exportați din modulul
networks), astfel încât să poți lista și rezolva rețele programatic. În
Python/Go/Rust echivalentele sunt `create_client` / `CreateClient` /
`ClientBuilder` plus modulul `networks`.

## Țintirea mainnet-ului

Ambele presetări livrează aceleași valori implicite localhost; selectează
`mainnet` și suprascrie endpoint-urile cu URL-urile publice (sau cu nodul tău):

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
