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
| Chain id | `qorechain-vladi` (attiva) |
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
| Token visualizzato | `QOR` |
| Denominazione base | `uqor` |
| Unità base per QOR | `10^6` |
| Prefisso bech32 account | `qor` |
| Prefisso bech32 validatore | `qorvaloper` |

## Porte predefinite

`createClient()` usa per impostazione predefinita queste porte localhost. Sovrascrivi
`endpoints` per puntare a un nodo reale.

| Endpoint | Porta | Scopo |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldi bank, info account, query dei moduli |
| gRPC | `9090` | query gRPC |
| Consensus RPC | `26657` | firma/trasmissione tx native, letture CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, precompile |
| EVM JSON-RPC (WS) | `8546` | sottoscrizioni WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibile con Solana |

Esempio con endpoint espliciti:

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

L'SDK espone preset di rete e helper di lookup (esportati dal modulo networks) così da
poter elencare e risolvere le reti in modo programmatico. In Python/Go/Rust gli
equivalenti sono `create_client` / `CreateClient` / `ClientBuilder` più il modulo
`networks`.

## Puntare alla mainnet

Entrambi i preset includono gli stessi valori predefiniti localhost; seleziona `mainnet`
e sovrascrivi gli endpoint con gli URL del tuo nodo:

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
