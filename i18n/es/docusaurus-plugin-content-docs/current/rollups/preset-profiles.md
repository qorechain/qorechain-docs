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
Los valores por preset que se muestran a continuación coinciden con los valores predeterminados de perfil incluidos en **`@qorechain/rdk`**, que reflejan la tabla de perfiles publicada de la red. Aun así pueden evolucionar a medida que el RDK madura: consulta los parámetros del módulo en vivo con `qorechaind query rdk config` (o `RdkClient.params()` desde el SDK) para obtener la configuración autoritativa, y valida en la testnet **`qorechain-diana`** antes de mainnet.
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

A partir de RDK v0.4.2, la opción de VM Wasm (el runtime que ejecuta contratos CosmWasm) se llama **`native`** — QoreChain Native. `cosmwasm` sigue siendo un alias heredado aceptado, y ambos se mapean a `cosmwasm` en el protocolo (on the wire), por lo que la cadena, el explorador y el Dashboard no cambian.

:::note
La configuración por preset se verificó en vivo en la versión de cadena **v3.1.74**, donde `create-rollup` aplica automáticamente el preset del perfil: **`defi` = zk + EVM, `gaming` = based + VM personalizada, `nft` = optimista + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimista + EVM (valores predeterminados)**. El preset `custom` deja todos los campos abiertos — los valores mostrados son sus valores predeterminados de partida.
:::

Trata los cuatro presets de dominio como puntos de partida razonables y el perfil **`custom`** como la opción totalmente abierta. Los parámetros exactos incluidos pueden cambiar entre versiones — consulta `rdk config` (más abajo) para obtener los valores autoritativos, y luego parte del preset más cercano y afínalo.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) genera el andamiaje de un proyecto inicial ejecutable — una plantilla por perfil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — para que puedas pasar de un perfil a código de creación/consulta funcional con un solo comando.

---

## Obtener una recomendación: `suggest-profile`

Si no estás seguro de qué preset encaja, la consulta `suggest-profile` recibe una descripción en lenguaje natural de tu caso de uso y devuelve un perfil recomendado.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Ejemplo:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

La sugerencia es un punto de partida útil — revisa la recomendación frente a tus requisitos específicos (garantías de liquidación, modelo de confianza del secuenciador, necesidades de disponibilidad de datos y VM) antes de comprometerte con una configuración.

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
