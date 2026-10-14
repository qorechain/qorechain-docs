---
slug: /user-guide/deploying-rollups
title: Despliegue de rollups
sidebar_label: Despliegue de rollups
sidebar_position: 6
---

# Despliegue de rollups

Esta guía es una breve orientación para lanzar un rollup específico de aplicación que se liquida en QoreChain con el Rollup Development Kit (RDK). Los comandos paso a paso están en **[Desplegar un Rollup](/rollups/deploying-a-rollup)**; esta página cubre lo que necesitas antes de empezar.

:::caution Capacidad en una fase temprana
Todavía no se ha creado ningún rollup en ninguna de las dos redes. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) ejecuta la versión de cadena **v3.2.1**; la testnet (**`qorechain-diana`**, EVM chain ID **9800**) ejecuta una versión más reciente (**v3.2.2**). Valida primero en testnet.
:::

---

## Qué es un rollup aquí {#what-a-rollup-is-here}

Un rollup de QoreChain es una cadena específica de aplicación que **ejecuta fuera de la cadena** y usa QoreChain para la **liquidación**: registras el rollup on-chain, publicas lotes de raíces de estado y, opcionalmente, blobs de datos y compromisos de retirada. El registro on-chain contiene un perfil, un modo de liquidación, un modo de secuenciador, un backend de disponibilidad de datos, un modelo de gas y una etiqueta de VM; la cadena anfitriona no ejecuta las transacciones de tu rollup.

---

## Perfiles preestablecidos {#preset-profiles}

El RDK incluye cinco perfiles preestablecidos, cada uno ajustado para una categoría de aplicación común:

| Perfil         | Liquidación (prueba)  | Secuenciador | DA              | Modelo de gas | VM       | Caso de uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicado | nativo          | EIP-1559     | EVM      | Aplicaciones DeFi/AMM (préstamos, DEX, derivados) |
| **gaming**     | based               | based     | nativo          | plano        | custom   | Estado de juego de alto rendimiento y experiencias en tiempo real |
| **nft**        | optimista (fraude)  | dedicado | nativo (DA de Celestia planeado) | estándar | CosmWasm | Acuñación de NFT y cargas de trabajo de marketplace |
| **enterprise** | based               | based     | nativo          | subvencionado | EVM      | Despliegues permisionados y de consorcio con comisiones patrocinadas |
| **custom**     | valores por defecto: optimista (fraude) | dedicado | nativo | estándar | EVM | Valores iniciales por defecto; ajusta lo que el mensaje permita |

Consulta [Perfiles preestablecidos](/rollups/preset-profiles) para ver los detalles y las notas de madurez (por ejemplo, un rollup `defi` creado mediante la CLI todavía no puede finalizar lotes ZK, y el secuenciado `based` significa actualmente que el creador envía los lotes).

---

## Requisitos {#requirements}

| Requisito | Detalles |
| ----------- | ------- |
| **Stake del rollup** | Al menos 10,000 QOR (`min_stake_for_rollup`, 10,000,000,000 uqor). Consulta el valor vigente: `qorechaind query rdk config` |
| **Quema de creación** | El 1 % del stake que aportes se quema al crear el rollup; el resto se mantiene en depósito (escrow) y se devuelve cuando detienes el rollup |
| **Stake de registro de la capa** | Crear un rollup también registra una capa en el módulo multilayer, que bloquea otros 1,000 QOR del creador (se devuelven cuando se detiene el rollup). Sin ese saldo no se crea la capa y el rollup no puede anclarse |
| **Cuenta** | Una cuenta financiada con una clave poscuántica registrada (cada transacción del carril nativo se firma de forma híbrida) |

---

## Consejos {#tips}

* Empieza con un perfil preestablecido. Los preajustes fijan el modo de liquidación, el secuenciador, el backend de disponibilidad de datos y la VM; `create-rollup` solo recibe el id, el perfil, el stake y un `--vm` opcional.
* La quema de creación del 1 % se aplica al stake que aportes.
* El creador del rollup es hoy quien envía los lotes (ningún preajuste establece una dirección de secuenciador), así que mantén a salvo la clave del creador: solo el creador puede pausar, reanudar o detener el rollup.
* El asistente `suggest-profile` devuelve actualmente un valor de respaldo fijo `defi` en los endpoints públicos, así que elige a partir de la tabla de perfiles.

---

## Próximos pasos {#next-steps}

* [Desplegar un Rollup](/rollups/deploying-a-rollup) — crea, opera y detén un rollup desde la CLI o TypeScript.
* [Resumen de Rollups](/rollups/overview) — modos de liquidación, secuenciadores, sistemas de prueba.
* [Disponibilidad de datos](/rollups/data-availability) y [ZK / STARK y retiradas](/rollups/zk-stark-withdrawals).
