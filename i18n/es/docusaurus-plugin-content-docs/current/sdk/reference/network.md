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
| Chain id | `qorechain-vladi` (activa desde el 7 de junio de 2026) |
| Versión de la cadena (23 de octubre de 2026) | v3.2.4 (desde la altura 3,742,566, 23 de octubre de 2026, propuesta de gobernanza 13) |
| Chain ID de EVM | `9801` |
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
| Versión de la cadena (23 de octubre de 2026) | v3.2.4 (desde la altura 8,337,253, 19 de octubre de 2026) |
| Chain ID de EVM | `9800` |
| Token de visualización | `QOR` |
| Denominación base | `uqor` |
| Unidades base por QOR | `10^6` |
| Prefijo bech32 de cuenta | `qor` |
| Prefijo bech32 de validador | `qorvaloper` |

## Endpoints públicos {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (solo lectura) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Los endpoints de EVM sirven `eth_`, `net_`, `web3_` y `txpool_`; el namespace `qor_`
no está habilitado. Consulta también [Redes](/appendix/networks#public-endpoints).

## Puertos por defecto

`createClient()` usa estos puertos de localhost por defecto. Sobrescribe `endpoints` para
apuntar a un nodo real.

| Endpoint | Puerto | Propósito |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldos de bank, información de cuenta, consultas de módulo |
| gRPC | `9090` | consultas gRPC |
| Consensus RPC | `26657` | firma/difusión de txs native, lecturas de QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (y `qor_*` / precompilados en los nodos que los habilitan) |
| EVM JSON-RPC (WS) | `8546` | suscripciones WebSocket de EVM |
| SVM JSON-RPC | `8899` | RPC compatible con Solana |

Ejemplo con endpoints explícitos:

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

El SDK expone preajustes de red y helpers de búsqueda (exportados desde el módulo
networks) para que puedas listar y resolver redes de forma programática. En Python/Go/Rust
los equivalentes son `create_client` / `CreateClient` / `ClientBuilder` más el
módulo `networks`.

## Apuntar a mainnet

Ambos preajustes incluyen los mismos valores por defecto de localhost; selecciona `mainnet` y sobrescribe los
endpoints con las URL públicas (o con tu propio nodo):

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
