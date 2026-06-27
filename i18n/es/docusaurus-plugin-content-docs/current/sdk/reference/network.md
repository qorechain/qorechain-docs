---
slug: /sdk/reference/network
title: Red y endpoints
sidebar_label: Red y endpoints
sidebar_position: 1
---

# Referencia de red y endpoints

## Mainnet

| Campo | Valor |
| --- | --- |
| Preajuste de red | `mainnet` |
| Chain id | `qorechain-vladi` (activa) |
| Token de visualización | `QOR` |
| Denominación base | `uqor` |
| Unidades base por QOR | `10^6` |
| Prefijo bech32 de cuenta | `qor` |
| Prefijo bech32 de validador | `qorvaloper` |

## Testnet

| Campo | Valor |
| --- | --- |
| Preajuste de red | `testnet` |
| Chain id | `qorechain-diana` (activa) |
| Token de visualización | `QOR` |
| Denominación base | `uqor` |
| Unidades base por QOR | `10^6` |
| Prefijo bech32 de cuenta | `qor` |
| Prefijo bech32 de validador | `qorvaloper` |

## Puertos por defecto

`createClient()` usa estos puertos de localhost por defecto. Sobrescribe `endpoints` para
apuntar a un nodo real.

| Endpoint | Puerto | Propósito |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldos de bank, información de cuenta, consultas de módulo |
| gRPC | `9090` | consultas gRPC |
| Consensus RPC | `26657` | firma/difusión de txs native, lecturas de CosmWasm |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, precompilados |
| EVM JSON-RPC (WS) | `8546` | suscripciones WebSocket de EVM |
| SVM JSON-RPC | `8899` | RPC compatible con Solana |

Ejemplo con endpoints explícitos:

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

El SDK expone preajustes de red y helpers de búsqueda (exportados desde el módulo
networks) para que puedas listar y resolver redes de forma programática. En Python/Go/Rust
los equivalentes son `create_client` / `CreateClient` / `ClientBuilder` más el
módulo `networks`.

## Apuntar a mainnet

Ambos preajustes incluyen los mismos valores por defecto de localhost; selecciona `mainnet` y sobrescribe los
endpoints con las URL de tu nodo:

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
