---
slug: /rollups/preset-profiles
title: Perfiles Preset
sidebar_label: Perfiles Preset
sidebar_position: 2
---

# Perfiles Preset

El RDK incluye **perfiles preset** que proporcionan configuraciones de rollup llave en mano ajustadas para categorías de aplicación comunes. Un preset agrupa un modo de liquidación, un modo de secuenciador, un backend de disponibilidad de datos y parámetros de ejecución, de modo que puedes lanzar un rollup sin elegir manualmente cada opción.

Un perfil se pasa de forma posicional a `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Los valores por preset que aparecen a continuación coinciden con los valores predeterminados de los perfiles de **`@qorechain/rdk`** distribuidos, que reflejan la tabla de perfiles publicada de la red. Aún pueden evolucionar a medida que el RDK madura — consulta los parámetros del módulo en vivo con `qorechaind query rdk config` (o `RdkClient.params()` desde el SDK) para obtener la configuración autoritativa, y valida en la testnet **`qorechain-diana`** antes de mainnet.
:::

---

## Los perfiles preset

Cada preset agrupa un paradigma de liquidación (y el sistema de prueba que requiere su liquidación), un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una VM:

| Perfil | Liquidación (prueba) | Secuenciador | DA | Modelo de gas | VM | Caso de uso previsto |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Aplicaciones DeFi y de estilo AMM — mercados de préstamo, DEX y derivados donde importan la finalidad rápida y las comisiones predecibles |
| **`gaming`** | based | based | native | flat | custom | Estado de juego y economías dentro del juego de alto rendimiento y baja latencia |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planeado) | standard | CosmWasm | Acuñación de NFT, mercados y coleccionables digitales |
| **`enterprise`** | based | based | native | subsidized | EVM | Despliegues con permisos y de consorcio con comisiones patrocinadas (subsidiadas) |
| **`custom`** | totalmente parametrizado (predeterminados: optimistic / fraud) | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado | totalmente parametrizado (predeterminado: EVM) | Cada campo lo define el usuario — empieza desde cero y establece cada opción por ti mismo |

Algunas restricciones se derivan de la [matriz liquidación → prueba](/rollups/overview): la liquidación `optimistic` usa pruebas `fraud`, `zk` usa `snark` (o `stark`), y `based` y `sovereign` no llevan prueba. La liquidación `based` siempre se empareja con el modo de secuenciador `based`. El preset `nft` liquida de forma nativa hoy, con **Celestia DA planeado**.

:::note
La configuración por preset se verificó en vivo en cadena en la versión de cadena **v3.1.74**, donde `create-rollup` aplica automáticamente el preset del perfil: **`defi` = zk + EVM, `gaming` = based + VM custom, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (predeterminados)**. El preset `custom` deja cada campo abierto — los valores mostrados son sus predeterminados de partida.
:::

Trata los cuatro presets de dominio como puntos de partida sensatos y el perfil **`custom`** como la opción totalmente abierta. Los parámetros agrupados exactos pueden cambiar entre versiones — consulta `rdk config` (más abajo) para los valores autoritativos, luego parte del preset más cercano y refínalo.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) genera el andamiaje de un proyecto inicial ejecutable — una plantilla por perfil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — para que puedas pasar de un perfil a código funcional de creación/consulta en un solo comando.

---

## Obtener una recomendación: `suggest-profile`

Si no estás seguro de qué preset encaja, la consulta `suggest-profile` toma una descripción en lenguaje sencillo de tu caso de uso y devuelve un perfil recomendado.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Ejemplo:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

La sugerencia es un punto de partida útil — revisa la recomendación frente a tus requisitos específicos (garantías de liquidación, modelo de confianza del secuenciador, necesidades de disponibilidad de datos y VM) antes de comprometerte con una configuración.

---

## Inspeccionar la configuración del preset en cadena

Como los detalles del preset se resuelven en cadena, la forma autoritativa de ver a qué se resuelve un perfil es consultar el módulo y el rollup creado:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Este patrón — consultar `config` antes de desplegar, luego consultar `rollup` después — te permite confirmar exactamente qué produjo el preset que elegiste, en lugar de depender de valores documentados que pueden evolucionar.

---

## Próximos pasos

* **[Desplegar un Rollup](/rollups/deploying-a-rollup)** — crea un rollup desde un preset a través del Dashboard o la CLI, luego gestiona su ciclo de vida.
* **[Visión general de los Rollups](/rollups/overview)** — los paradigmas de liquidación y los modos de secuenciador que agrupa un preset.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — la referencia del módulo de más bajo nivel.
