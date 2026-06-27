---
slug: /appendix/networks
title: Redes
sidebar_label: Redes
sidebar_position: 4
---

# Redes

Una referencia consolidada de las redes de QoreChain: identificadores de cadena, EVM chain ID, denominación del token, prefijos de dirección y puertos de servicio estándar. Para los detalles completos de conexión de nodos (endpoints públicos, semillas y génesis), sigue las guías de conexión enlazadas abajo; los operadores obtienen los endpoints públicos, semillas y génesis actuales de la versión oficial.

## Redes de un vistazo

| | Mainnet | Testnet |
|---|---|---|
| **Estado** | En funcionamiento | Testnet activa |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **En funcionamiento desde** | 7 de junio de 2026, 23:59 UTC | — |
| **Versión de la cadena** | v3.1.77 | v3.1.77 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Guía de conexión** | [Conectarse a la mainnet](/getting-started/connecting-to-mainnet) | [Conectarse a la testnet](/getting-started/connecting-to-testnet) |

## Token y direcciones

| Elemento | Valor |
|---|---|
| **Denominación de visualización** | QOR |
| **Denominación base** | uqor (1 QOR = 10⁶ uqor) |
| **Prefijo Bech32 de cuenta** | `qor` (p. ej. `qor1...`) |
| **Prefijo Bech32 de validador** | `qorvaloper` (p. ej. `qorvaloper1...`) |

## Puertos estándar

Estos son los puertos de servicio estándar expuestos por un nodo de QoreChain. Los nombres de host de los endpoints públicos reales se publican con la versión oficial; consulta las guías de conexión anteriores.

| Servicio | Puerto |
|---|---|
| RPC de Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (compatible con Solana) JSON-RPC | 8899 |
| Métricas de Prometheus | 26660 |

## Endpoints y acceso

QoreChain no publica nombres de host fijos de RPC/REST/EVM públicos en esta referencia. En su lugar:

- Para la conexión de nodos, semillas y génesis, sigue [Conectarse a la mainnet](/getting-started/connecting-to-mainnet) o [Conectarse a la testnet](/getting-started/connecting-to-testnet). Los operadores obtienen los endpoints públicos, semillas y génesis actuales de la versión oficial.
- Para el acceso programático desde una aplicación, usa el [QoreChain SDK](/sdk/overview), que resuelve la configuración de red por ti.
- El **Explorador** en cadena está disponible a través del Dashboard en [dashboard.qorechain.io](https://dashboard.qorechain.io), y el **Faucet** de testnet también es accesible allí (consulta [Faucet del Dashboard](/dashboard/faucet)).
- Estos documentos se publican en [docs.qorechain.io](https://docs.qorechain.io).

## Añadir a MetaMask

Para añadir una red de QoreChain a una billetera EVM como MetaMask, usa los EVM chain ID anteriores — **9801** para mainnet y **9800** para testnet — junto con el endpoint EVM JSON-RPC de la red a la que te conectas. Consulta [Configuración de la billetera](/getting-started/wallet-setup) para el recorrido paso a paso.

## Relacionado

* [Conectarse a la mainnet](/getting-started/connecting-to-mainnet) — únete a la red `qorechain-vladi` en funcionamiento.
* [Conectarse a la testnet](/getting-started/connecting-to-testnet) — únete a la testnet Diana.
* [Parámetros de la cadena](/appendix/chain-parameters) — configuración canónica de la cadena.
* [Visión general del SDK](/sdk/overview) — resuelve la configuración de red desde el código.
