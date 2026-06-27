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
| Chain id | `qorechain-vladi` (live) |
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
| Token afișat | `QOR` |
| Denominare de bază | `uqor` |
| Unități de bază per QOR | `10^6` |
| Prefix bech32 cont | `qor` |
| Prefix bech32 validator | `qorvaloper` |

## Porturi implicite

`createClient()` folosește implicit aceste porturi localhost. Suprascrie
`endpoints` pentru a indica spre un nod real.

| Endpoint | Port | Scop |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | solduri bank, info cont, interogări de modul |
| gRPC | `9090` | interogări gRPC |
| Consensus RPC | `26657` | semnare/difuzare tx native, citiri CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, precompilate |
| EVM JSON-RPC (WS) | `8546` | abonamente WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibil cu Solana |

Exemplu cu endpoint-uri explicite:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

SDK-ul expune presetări de rețea și helperi de căutare (exportați din modulul
networks), astfel încât să poți lista și rezolva rețele programatic. În
Python/Go/Rust echivalentele sunt `create_client` / `CreateClient` /
`ClientBuilder` plus modulul `networks`.

## Țintirea mainnet-ului

Ambele presetări livrează aceleași valori implicite localhost; selectează
`mainnet` și suprascrie endpoint-urile cu URL-urile nodului tău:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
