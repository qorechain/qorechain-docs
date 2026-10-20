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
| Versiune lanț (20 octombrie 2026) | v3.2.3 |
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
| Versiune lanț (20 octombrie 2026) | v3.2.4 (deocamdată doar testnet; propunerea 13 de pe mainnet ar aplica-o la înălțimea 3,742,566) |
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

## Porturi implicite

`createClient()` folosește implicit aceste porturi localhost. Suprascrie
`endpoints` pentru a indica spre un nod real.

| Endpoint | Port | Scop |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | solduri bank, info cont, interogări de modul |
| gRPC | `9090` | interogări gRPC |
| Consensus RPC | `26657` | semnare/difuzare tx native, citiri CosmWasm |
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
