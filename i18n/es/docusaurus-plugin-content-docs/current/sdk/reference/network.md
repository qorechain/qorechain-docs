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
| Versión de la cadena (4 de noviembre de 2026) | v3.2.6 (desde la altura 4,020,000, 4 de noviembre de 2026, propuesta de gobernanza 15; la v3.2.5 se aplicó en la altura 3,906,833 el 29 de octubre y la v3.2.4 en la altura 3,742,566 el 23 de octubre). El SDK 0.12.0 es el cliente para v3.2.5 y funciona en v3.2.6 (el formato de firma no cambió); la 0.10.0 fue el cliente para v3.2.4 |
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
| Versión de la cadena (27 de octubre de 2026) | v3.2.6 (desde la altura 8,970,638, 27 de octubre de 2026; v3.2.5 se aplicó en la altura 8,890,800 el 26 de octubre y v3.2.4 en la altura 8,337,253 el 19 de octubre) |
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

Desde el SDK 0.12.0 los preajustes `mainnet` y `testnet` usan por defecto estas URL de REST, RPC de consenso y
JSON-RPC de EVM (y el WebSocket de EVM de la testnet). Los preajustes **no** definen ningún endpoint
de gRPC ni **ningún** endpoint de SVM, aunque existan las URL de SVM de solo lectura de arriba
(las transacciones SVM no están abiertas): el código que necesite alguno de ellos falla con un error que
nombra el endpoint que hay que pasar. Los endpoints de la testnet tienen un límite de peticiones por IP; ejecuta o
usa tu propio nodo para el tráfico de producción. Antes de la 0.12.0 todos los preajustes usaban localhost
por defecto.

### Diferencias exclusivas de la testnet que importan a un cliente {#testnet-only}

La testnet es una red de preproducción y va por delante de mainnet, por lo que algunas
cosas que se pueden leer allí no están en mainnet (comprobado el 27 de octubre de 2026;
la lista completa está en
[Diferencias entre testnet y mainnet](/appendix/chain-parameters#testnet-differences)):

* **Rutas REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` y `GET /qorechain/crossvm/v1/params` responden en la testnet. La mainnet respondía HTTP 501 para ellas hasta la cadena v3.2.6; desde que aplicó la v3.2.6 (4 de noviembre de 2026), todas esas rutas respondieron HTTP 200 en la mainnet al comprobarlas ese día. Las rutas del AMM bajo `/qorechain/amm/v1/` (`pools`, `params`) responden en ambas redes.
* **Tokens de prueba.** Tres tokens sin valor existen solo en la testnet, como denominaciones de bank llamadas `erc20:<EIP-55 contract address>` (sensibles a mayúsculas): fUSD (6 decimales), fETH (18) y fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` los lista. La única denominación de bank de mainnet es `uqor`. Consulta [Tokens de prueba de testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Módulos activados.** El módulo `abstractaccount` está habilitado en la testnet y desactivado en mainnet, hay precompilados de EVM activos en la testnet (tres el 27 de octubre, cuatro el 4 de noviembre) y ninguno en mainnet, y la instanciación de QoreChain Native está abierta en la testnet.

## Puertos por defecto (el preajuste `localnet`) {#default-ports}

El preajuste `localnet` (chain id `qorechain-devnet`, sin chain id de EVM definido) usa estos
puertos de localhost, para un nodo en tu propia máquina. Antes del SDK 0.12.0 todos los preajustes los usaban
por defecto; desde la 0.12.0 solo lo hace `localnet`. Sobrescribe `endpoints` para apuntar a
otro nodo.

| Endpoint | Puerto | Propósito |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | saldos de bank, información de cuenta, consultas de módulo |
| gRPC | `9090` | consultas gRPC |
| Consensus RPC | `26657` | firma/difusión de txs native, lecturas de QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (y `qor_*` / precompilados en los nodos que los habilitan) |
| EVM JSON-RPC (WS) | `8546` | suscripciones WebSocket de EVM |
| SVM JSON-RPC | `8899` | RPC compatible con Solana |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

Selecciona `mainnet` para apuntar a ella. Desde el SDK 0.12.0 el preajuste ya incluye las URL
públicas, así que los endpoints de abajo son los valores por defecto; pasa `endpoints` solo para tu propio nodo
(un SDK anterior a la 0.12.0 usa localhost por defecto y los necesita):

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
