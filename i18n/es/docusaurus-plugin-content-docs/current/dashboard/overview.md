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
| **[Monedero](/dashboard/wallet)** | Consulta tu saldo y tu historial y recibe QOR — con tu propio monedero (no custodio) en mainnet, o con un monedero de prueba gestionado por el panel en testnet. |
| **[Trade](/dashboard/trade)** | Intercambia tokens y aporta liquidez en el AMM on-chain. |
| **[Bridge](/dashboard/bridge)** | Mueve activos entre QoreChain y otras cadenas. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Genera contratos inteligentes con **QCAI** en 17 blockchains compatibles. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Ejecuta un análisis de seguridad con **QCAI** sobre un contrato inteligente. |
| **[Staking y Validadores](/dashboard/staking-and-validators)** | Revisa los validadores y delega tus QOR. |
| **[Faucet](/dashboard/faucet)** | Solicita tokens de prueba en testnet. |
| **[Misiones](/dashboard/quests)** | Completa tareas guiadas para aprender a usar la red. |
| **[Tools Hub](/dashboard/tools-hub)** | Accede a las herramientas de nodos, rollups, SDK y licencias. |

## Conecta tu monedero {#connect-your-wallet}

La mayoría de las acciones que modifican el estado on-chain — enviar tokens, intercambiar, hacer staking, usar el bridge — requieren un monedero conectado. La forma en que el Panel gestiona las claves depende de la red:

- **Mainnet es no custodio.** El Panel nunca guarda tus claves de mainnet. Conectas tu propio monedero — **QoreX** (el monedero oficial de QoreChain, como extensión o como app), **Keplr** o **MetaMask** — y el Panel lee tu saldo y tu historial reales desde la cadena. Cada transacción en mainnet se firma en tu propio monedero, nunca en el Panel. Enviar y hacer staking en el **raíl Native requieren QoreX**, ya que las cuentas de QoreChain firman con una firma híbrida post-cuántica que hoy solo QoreX puede generar; Keplr aún puede conectarse para consultar tu saldo en el raíl Native. **MetaMask** firma y envía de forma independiente en el **raíl EVM**.
- **Testnet es custodio.** El Panel gestiona un monedero de prueba por ti, para que puedas experimentar sin configuración alguna y sin poner en riesgo valor real.

### Conecta con QoreX (recomendado) {#connect-qorex}

QoreX es el monedero oficial de QoreChain. La tarjeta **Connect with QoreX** del Panel admite tanto la extensión de navegador como la app móvil desde el mismo punto de entrada.

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io) y asegúrate de que la cabecera muestre **Mainnet**.
2. Si es tu primera visita a una página de mainnet, lee y acepta el [reconocimiento de riesgos único](#risk-acknowledgement).
3. Selecciona **Connect Wallet** (o **Connect with QoreX** en la tarjeta del monedero).
4. Si la extensión de navegador de QoreX está instalada y se detecta en este navegador, el Panel te pregunta **"How do you want to connect?"** con dos opciones, **Browser extension** y **QoreX app**. Elige una — la elección se guarda, de modo que las visitas posteriores omiten esta pregunta (siempre hay disponible un enlace **Use a different method** si quieres cambiar más adelante). Si no se detecta ninguna extensión, el Panel va directo al flujo de la app.
   - **Browser extension**: se abre la ventana emergente propia de la extensión, mostrando `dashboard.qorechain.io` como el sitio que solicita la conexión. Revísala y apruébala — esto firma una prueba única de que eres dueño de tu dirección `qor1...` (no se mueven fondos). El emparejamiento se completa de inmediato, en la misma sesión del navegador.
   - **QoreX app**: el Panel muestra un código QR (con un enlace **Open QoreX** que abre la app directamente si estás navegando desde el mismo teléfono). Abre la app de QoreX, escanea el código QR (o toca el enlace), revisa la solicitud de emparejamiento que muestra el origen del Panel, y apruébala con tu confirmación biométrica. El Panel sondea en segundo plano y termina el emparejamiento automáticamente en cuanto apruebas.
5. Una vez aprobado, el Panel muestra tu dirección `qor1...` y desbloquea las acciones que requieren una firma.

Consulta [Monedero](/dashboard/wallet#mainnet) para ver el recorrido completo de conexión y envío según el tipo de monedero, y la página [Cuenta y Panel](/qorex/account-and-dashboard#dashboard) de la documentación de QoreX para ver el emparejamiento desde el lado del monedero.

### Conecta con Keplr o MetaMask

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io) y asegúrate de que la cabecera muestre **Mainnet**.
2. Si es tu primera visita a una página de mainnet, lee y acepta el reconocimiento de riesgos único (ver más abajo).
3. Selecciona **Connect Wallet** y elige **Keplr** o **MetaMask**.
4. Aprueba la conexión en tu monedero.

Una vez conectado, el Panel muestra tu dirección (en forma abreviada) en la cabecera. MetaMask desbloquea el envío y otras acciones firmadas directamente en el raíl EVM. Keplr desbloquea la consulta de tu saldo e historial en el raíl Native — enviar y hacer staking ahí pasan por QoreX (ver más arriba), ya que las cuentas de QoreChain firman con una firma híbrida post-cuántica. Las páginas de solo lectura, como el Explorador, funcionan sin necesidad de conectarse.

Las cuentas de QoreChain usan el prefijo bech32 `qor`, por lo que una dirección conectada tiene la forma `qor1...` — la misma cuenta también tiene una codificación EVM (`0x...`) y una SVM (base58). Las cuentas están protegidas con criptografía resistente a la computación cuántica. Consulta [Configuración del monedero](/getting-started/wallet-setup) para obtener orientación en la configuración inicial, y [Añadir QoreChain a tu monedero](/dashboard/wallet#add-network) si tu monedero aún no conoce la red.

### Reconocimiento de riesgos único {#risk-acknowledgement}

Antes de poder usar cualquier página de mainnet, el Panel te pide aceptar un aviso legal único. Este confirma que entiendes que las transacciones en mainnet mueven **fondos reales**, que el Panel es **no custodio** (solo tú controlas tus claves) y que las transacciones on-chain son **irreversibles**. Lo aceptas una sola vez; después, las páginas de mainnet se abren directamente.

## Selecciona tu red

El Panel funciona con dos redes. La cabecera muestra la red a la que estás conectado en cada momento.

| Red | Chain ID | Cuándo usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Red en vivo para valor real y uso en producción. No custodio: conectas tu propio monedero. |
| **Testnet** | `qorechain-diana` | Entorno gratuito para pruebas, con un monedero de prueba gestionado por el panel y el [Faucet](/dashboard/faucet) para obtener tokens de prueba. |

El token nativo es **QOR** (denominación base `uqor`, donde 1 QOR = 10^6 uqor). Si eres nuevo, empieza en testnet, reclama tokens del Faucet y prueba una primera transferencia antes de pasar a mainnet.

:::tip ¿Nuevo en QoreChain?
Sigue [Conexión a Testnet](/getting-started/connecting-to-testnet) y [Tu primera transacción](/getting-started/first-transaction) para ponerte manos a la obra rápidamente, y luego vuelve para explorar el resto del Panel.
:::

## Relacionado

* [Explorador](/dashboard/explorer) — navega por bloques, transacciones y cuentas.
* [Monedero](/dashboard/wallet) — gestiona cuentas y envía transacciones.
* [Trade / DEX](/dashboard/trade) — intercambia tokens contra los pools del AMM on-chain.
* [Bridge](/dashboard/bridge) — mueve activos entre cadenas.
* [Tools Hub](/dashboard/tools-hub) — licencias, faucet y utilidades para desarrolladores.
