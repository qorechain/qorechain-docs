---
slug: /dashboard/overview
title: Visión general del Panel y primeros pasos
sidebar_label: Visión general y primeros pasos
sidebar_position: 1
---

# Visión general del Panel y primeros pasos

El Panel de QoreChain en **[dashboard.qorechain.io](https://dashboard.qorechain.io)** es la aplicación web oficial para usar QoreChain desde tu navegador. Desde un único lugar puedes explorar la cadena, gestionar un monedero, intercambiar tokens, mover activos entre cadenas, generar y auditar contratos inteligentes, hacer staking a validadores, reclamar tokens de testnet, completar misiones y acceder a las herramientas de la red.

Todo lo que hay en esta sección es una guía práctica para el usuario: qué hace cada página y cómo usarla. No se requiere instalación: el Panel se ejecuta por completo en tu navegador.

## Qué puedes hacer

| Área | Para qué sirve |
| --- | --- |
| **[Explorador](/dashboard/explorer)** | Navega por bloques, transacciones, direcciones y validadores. |
| **[Monedero](/dashboard/wallet)** | Consulta saldos, envía y recibe QOR, y gestiona tus direcciones. |
| **[Trade](/dashboard/trade)** | Intercambia tokens y aporta liquidez en el AMM on-chain. |
| **[Puente](/dashboard/bridge)** | Mueve activos entre QoreChain y otras cadenas. |
| **[Creador de Contratos Inteligentes](/dashboard/smart-contract-creator)** | Genera contratos inteligentes con **QCAI** en 17 blockchains compatibles. |
| **[Auditor de Contratos](/dashboard/contract-auditor)** | Ejecuta un análisis de seguridad de **QCAI** sobre un contrato inteligente. |
| **[Staking y Validadores](/dashboard/staking-and-validators)** | Revisa validadores y delega tu QOR. |
| **[Grifo](/dashboard/faucet)** | Solicita tokens de prueba en testnet. |
| **[Misiones](/dashboard/quests)** | Completa tareas guiadas para aprender sobre la red. |
| **[Centro de Herramientas](/dashboard/tools-hub)** | Accede a las herramientas de nodo, rollup, SDK y licencias. |

## Conecta tu monedero {#connect-your-wallet}

La mayoría de las acciones que cambian el estado on-chain — enviar tokens, intercambiar, hacer staking, usar el puente — requieren un monedero conectado.

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Selecciona **Conectar Monedero**.
3. Aprueba la conexión en tu monedero.

Una vez conectado, el Panel muestra tu dirección (en forma abreviada) en el encabezado y desbloquea las acciones que necesitan una firma. Las páginas de solo lectura, como el Explorador, funcionan sin conectarse.

Las cuentas de QoreChain usan el prefijo bech32 `qor`, por lo que una dirección conectada se ve como `qor1...`. Las cuentas están protegidas con criptografía de seguridad cuántica. Consulta [Configuración del Monedero](/getting-started/wallet-setup) para obtener orientación sobre la configuración inicial.

## Selecciona tu red

El Panel funciona con dos redes. El encabezado muestra la red a la que estás conectado actualmente.

| Red | ID de cadena | Cuándo usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Red en vivo para valor real y uso en producción. |
| **Testnet** | `qorechain-diana` | Entorno gratuito para pruebas, con el [Grifo](/dashboard/faucet) para tokens de prueba. |

El token nativo es **QOR** (denominación base `uqor`, donde 1 QOR = 10^6 uqor). Si eres nuevo, comienza en testnet, reclama tokens del Grifo y prueba una primera transferencia antes de pasar a mainnet.

:::tip ¿Nuevo en QoreChain?
Sigue [Conexión a Testnet](/getting-started/connecting-to-testnet) y [Tu primera transacción](/getting-started/first-transaction) para empezar a practicar rápidamente, y luego vuelve para explorar el resto del Panel.
:::

## Relacionado

* [Explorador](/dashboard/explorer) — navega por bloques, transacciones y cuentas.
* [Monedero](/dashboard/wallet) — gestiona cuentas y envía transacciones.
* [Trade / DEX](/dashboard/trade) — intercambia tokens contra los pools del AMM on-chain.
* [Puente](/dashboard/bridge) — mueve activos entre cadenas.
* [Centro de Herramientas](/dashboard/tools-hub) — licencias, grifo y utilidades para desarrolladores.
