---
slug: /appendix/networks
title: Redes
sidebar_label: Redes
sidebar_position: 4
---

# Redes

Una referencia consolidada de las redes de QoreChain: identificadores de cadena, IDs de cadena EVM, denominación del token, prefijos de direcciones, endpoints públicos y puertos de servicio estándar.

## Las redes de un vistazo

| | Mainnet | Testnet |
|---|---|---|
| **Estado** | En producción | Testnet activa |
| **Chain ID de Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **Chain ID de EVM (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **En producción desde** | 7 de junio de 2026, 23:59 UTC | — |
| **Versión de la cadena** | v3.1.82 | v3.1.82 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Precio mínimo de gas** | `0.1uqor` | `0.1uqor` |
| **Guía de conexión** | [Conexión a Mainnet](/getting-started/connecting-to-mainnet) | [Conexión a Testnet](/getting-started/connecting-to-testnet) |

## Endpoints públicos {#public-endpoints}

Todos los endpoints públicos se sirven a través de HTTPS.

| Servicio | Mainnet | Testnet |
|---|---|---|
| RPC de consenso | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket de consenso | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| REST de Cosmos (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| JSON-RPC de EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| WebSocket de EVM | — | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC de SVM (compatible con Solana, solo lectura) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Explorador de bloques | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (cambie a Testnet) |
| Descargas (binario / génesis / snapshot) | [download.qore.host](https://download.qore.host) | — |

:::note
Los endpoints públicos de SVM son de **solo lectura** (el envío de transacciones está deshabilitado en el borde); ejecute su propio nodo para escrituras SVM. Para cargas de trabajo intensivas o de producción, ejecute su propio nodo — consulte [Ejecutar un nodo](/developer-guide/running-a-node).
:::

## Token y direcciones

| Elemento | Valor |
|---|---|
| **Denominación de visualización** | QOR |
| **Denominación base** | uqor (1 QOR = 10⁶ uqor) |
| **Decimales por interfaz** | Cosmos **6** (`uqor`) · EVM **18** (estilo wei; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1,000 lamports) |
| **Tipo de moneda HD (BIP-44)** | `118` |
| **Prefijo Bech32 de cuentas** | `qor` (p. ej. `qor1...`) |
| **Prefijo Bech32 de validadores** | `qorvaloper` (p. ej. `qorvaloper1...`) |

Las tres interfaces exponen **un único saldo nativo de QOR unificado**: la misma clave controla los mismos fondos bajo sus formas de dirección `qor1...` (Cosmos), `0x...` (EVM) y base58 (SVM).

## Puertos estándar

Estos son los puertos de servicio estándar que expone un nodo QoreChain que usted mismo ejecuta.

| Servicio | Puerto |
|---|---|
| RPC de Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| JSON-RPC de EVM | 8545 |
| JSON-RPC de EVM (WebSocket) | 8546 |
| JSON-RPC de SVM (compatible con Solana) | 8899 |
| Métricas de Prometheus | 26660 |

## Endpoints y acceso

- Para la conexión de nodos, peers, génesis y snapshots, siga [Conexión a Mainnet](/getting-started/connecting-to-mainnet) o [Conexión a Testnet](/getting-started/connecting-to-testnet).
- Para el acceso programático desde una aplicación, utilice el [SDK de QoreChain](/sdk/overview), que resuelve la configuración de red por usted.
- El **explorador de bloques** público está en [explore.qore.network](https://explore.qore.network); el Dashboard en [dashboard.qorechain.io](https://dashboard.qorechain.io) incluye su propia vista de explorador, y el **Faucet** de testnet es accesible desde allí (consulte [Faucet del Dashboard](/dashboard/faucet)).
- Esta documentación se publica en [docs.qorechain.io](https://docs.qorechain.io).

## Añadir a MetaMask

Para añadir una red QoreChain a una billetera EVM como MetaMask, utilice los IDs de cadena EVM indicados arriba — **9801** para mainnet con `https://evm.qore.host`, y **9800** para testnet con `https://evm-testnet.qore.host` — con `https://explore.qore.network` como URL del explorador de bloques. Consulte [Configuración de la billetera](/getting-started/wallet-setup) para la guía paso a paso.

## Relacionado

* [Conexión a Mainnet](/getting-started/connecting-to-mainnet) — únase a la red en producción `qorechain-vladi`.
* [Conexión a Testnet](/getting-started/connecting-to-testnet) — únase a la testnet Diana.
* [Guía para exchanges e integradores](/developer-guide/exchange-integration) — depósitos, retiros y operaciones de nodos para integradores.
* [Parámetros de la cadena](/appendix/chain-parameters) — configuración canónica de la cadena.
* [Descripción general del SDK](/sdk/overview) — resuelva la configuración de red desde el código.
