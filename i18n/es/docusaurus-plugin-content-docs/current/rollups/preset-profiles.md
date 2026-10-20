---
slug: /rollups/preset-profiles
title: Perfiles predefinidos
sidebar_label: Perfiles predefinidos
sidebar_position: 2
---

# Perfiles predefinidos

El RDK incluye **perfiles predefinidos** que ofrecen configuraciones de rollup listas para usar, ajustadas a categorías de aplicaciones comunes. Un preset agrupa un modo de liquidación (settlement), un modo de secuenciador, un backend de disponibilidad de datos y parámetros de ejecución, de modo que puedes lanzar un rollup sin tener que elegir cada opción a mano.

El perfil se pasa de forma posicional a `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Los valores por preset que se muestran a continuación coinciden con los valores predeterminados de perfil incluidos en **`@qorechain/rdk`**, que reflejan la tabla de perfiles publicada de la red. Todavía no se ha creado ningún rollup en ninguna de las dos redes. Consulta los parámetros del módulo en vivo con `qorechaind query rdk config` (o `rdk.params()` desde `@qorechain/rdk`, que lee `GET /qorechain/rdk/v1/params`, servido en ambas redes) para obtener la configuración autoritativa, y valida en la testnet **`qorechain-diana`** antes de mainnet.
:::

---

## Los perfiles predefinidos

Cada preset agrupa un paradigma de liquidación (y el sistema de pruebas que dicha liquidación requiere), un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una VM:

| Perfil | Liquidación (prueba) | Secuenciador | DA | Modelo de gas | VM | Caso de uso previsto |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicado | nativo | EIP-1559 | EVM | Aplicaciones DeFi y de tipo AMM — mercados de préstamos, DEXs y derivados donde importan la finalidad rápida y las comisiones predecibles |
| **`gaming`** | based | based | nativo | plano | personalizada | Estado de juego de alto rendimiento y baja latencia y economías dentro del juego |
| **`nft`** | optimista (fraud) | dedicado | nativo (Celestia DA previsto) | estándar | QoreChain Native (`native`) | Acuñación de NFT, marketplaces y coleccionables digitales |
| **`enterprise`** | based | based | nativo | subvencionado | EVM | Despliegues permisionados y de consorcio con comisiones patrocinadas (subvencionadas) |
| **`custom`** | totalmente parametrizado (valores predeterminados: optimista / fraud) | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado (predeterminado: EVM) | Cada campo lo define el usuario — parte desde cero y configura cada opción tú mismo |

Algunas restricciones se derivan de la [matriz liquidación → prueba](/rollups/overview): la liquidación `optimistic` usa pruebas `fraud`, `zk` usa `snark` (o `stark`), y `based` y `sovereign` no llevan prueba. La liquidación `based` siempre se empareja con el modo de secuenciador `based`. El preset `nft` liquida de forma nativa hoy, con **Celestia DA previsto**.

A partir de RDK v0.4.2, la opción de VM Wasm (el runtime que ejecuta contratos QoreChain Native) se llama **`native`** — QoreChain Native. `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` en el protocolo (on the wire), por lo que la cadena, el explorador y el Dashboard no cambian.

:::note
La configuración por preset se verificó con la tabla de perfiles de la cadena en el código fuente de la v3.2.3 (mainnet ejecuta la v3.2.3 hasta la altura 3,742,566 y la v3.2.4 desde ese bloque; la testnet ejecuta la v3.2.4), donde `create-rollup` aplica automáticamente el preset del perfil: **`defi` = zk + EVM, `gaming` = based + VM personalizada, `nft` = optimista + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimista + EVM (valores predeterminados)**. El preset `custom` deja todos los campos abiertos — los valores mostrados son sus valores predeterminados de partida.
:::

Trata los cuatro presets de dominio como puntos de partida razonables y el perfil **`custom`** como la opción totalmente abierta. Los parámetros exactos incluidos pueden cambiar entre versiones — consulta `rdk config` (más abajo) para obtener los valores autoritativos, y luego parte del preset más cercano y afínalo.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) genera el andamiaje de un proyecto inicial ejecutable — una plantilla por perfil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — para que puedas pasar de un perfil a código de creación/consulta funcional con un solo comando.

---

## Qué lleva un preset on-chain {#what-a-preset-carries}

Algunos detalles se dan fácilmente por supuestos y conviene conocerlos antes de elegir un perfil:

* **`defi` no tiene clave de verificación.** Los lotes ZK necesitan una, y un rollup creado mediante `create-rollup` no la incluye, por lo que la liquidación ZK no puede finalizarse de extremo a extremo hoy (consulta [ZK / STARK y retiros](/rollups/zk-stark-withdrawals)).
* **`nft` y `custom`** liquidan de forma optimista con una fianza de desafío de 1,000 QOR y una ventana de desafío de 100,800 bloques en mainnet antes de la altura 3,742,566 (los 604,800 "segundos" predeterminados convertidos a 6 segundos fijos por bloque; unos 3.7 días con los bloques actuales de ≈3.2 s de mainnet). Desde la v3.2.4, un lote obtiene en cambio una ventana medida en segundos de tiempo de bloque: en la testnet desde la altura 8,337,253, en mainnet desde la altura 3,742,566.
* **`gaming` y `enterprise`** usan secuenciación `based`, lo que hoy significa que el creador del rollup envía los lotes.
* **El tiempo de bloque y los límites de transacción** (por ejemplo `defi` 500 ms, `gaming` 200 ms, `nft` 2,000 ms, `enterprise` y `custom` 1,000 ms) se almacenan en el registro on-chain. Describen la cadena propia del rollup y la cadena anfitriona no los hace cumplir.

---

## Elegir un perfil {#getting-a-recommendation}

La consulta `suggest-profile` y el helper `suggestProfile()` del RDK están pensados para recomendar un preset a partir de una descripción en lenguaje natural. Dependen del método JSON-RPC `qor_suggestRollupProfile`, que los endpoints públicos no sirven, por lo que `suggestProfile()` devuelve actualmente siempre `defi` como **alternativa de respaldo**, y `qorechaind query rdk suggest-profile` solo imprime una referencia a ese RPC. En su lugar, elige un perfil a partir de la tabla anterior y revísalo frente a tus requisitos (garantías de liquidación, modelo de confianza del secuenciador, necesidades de disponibilidad de datos y VM).

---

## Inspeccionar la configuración de un preset on-chain

Dado que los detalles de los presets se resuelven on-chain, la forma autoritativa de ver a qué se resuelve un perfil es consultar el módulo y el rollup creado:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Este patrón — consultar `config` antes de desplegar y luego consultar `rollup` después — te permite confirmar exactamente qué produjo el preset elegido, en lugar de depender de valores documentados que pueden evolucionar.

---

## Próximos pasos

* **[Desplegar un Rollup](/rollups/deploying-a-rollup)** — crea un rollup a partir de un preset mediante el Dashboard o la CLI, y luego gestiona su ciclo de vida.
* **[Visión general de Rollups](/rollups/overview)** — los paradigmas de liquidación y los modos de secuenciador que agrupa un preset.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — la referencia del módulo de bajo nivel.
