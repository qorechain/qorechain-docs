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
| **En producción desde** | 29 de junio de 2026, 17:03 UTC (bloque génesis) | 1 de julio de 2026 (continua desde entonces; sin reinicio) |
| **Versión de la cadena** | v3.2.1 (reglas de consenso de v3.2.0) | v3.2.2 |
| **Tiempo de bloque (promedio medido)** | unos 3,2 s | unos 1,0 s |
| **Manifiesto de versión** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Precio mínimo de gas** | `0.1uqor` | `0.1uqor` |
| **Guía de conexión** | [Conexión a Mainnet](/getting-started/connecting-to-mainnet) | [Conexión a Testnet](/getting-started/connecting-to-testnet) |

Ambos manifiestos son la fuente de verdad de la versión que debe ejecutar un nodo nuevo. El manifiesto de testnet (v3.2.2) incluye una altura de actualización porque la testnet recibe actualizaciones coordinadas mediante gobernanza, mientras que la v3.2.1 de mainnet es una versión progresiva, local al nodo, sobre las reglas de consenso de v3.2.0.

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
| Descargas (binario / génesis / snapshot) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Los endpoints públicos de SVM son de **solo lectura** (el envío de transacciones está deshabilitado en el borde); ejecute su propio nodo para escrituras SVM. Para cargas de trabajo intensivas o de producción, ejecute su propio nodo — consulte [Ejecutar un nodo](/developer-guide/running-a-node). No hay un endpoint gRPC público ni un WebSocket de EVM público en mainnet. En los endpoints públicos de EVM, `eth_getLogs` acepta como máximo 10,000 bloques por consulta y `txpool_content` está deshabilitado (un nodo autoalojado sirve el namespace completo); consulte [Namespace eth_](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Si un script recibe `403 Forbidden` de un endpoint público, establezca una cabecera `User-Agent` explícita (el agente predeterminado de `urllib` de Python está bloqueado; los clientes `requests`, `curl`, Node y Go funcionan tal cual).
:::

:::caution El lane de transacciones SVM está deshabilitado actualmente
Más allá de que los endpoints públicos son de solo lectura, el lane de ejecución SVM está **actualmente deshabilitado en toda la red para el envío de transacciones** (desde la versión de cadena v3.1.89, 22 de agosto) — esto incluye el envío a través de su propio nodo, no solo los endpoints públicos `svm.qore.host` / `svm-testnet.qore.host`. Consulte [Desarrollo SVM](/developer-guide/svm-development) para más detalles. Use las interfaces de Cosmos o EVM hasta que el lane vuelva a abrirse.
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
