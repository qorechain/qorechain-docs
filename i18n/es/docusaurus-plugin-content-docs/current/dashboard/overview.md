---
slug: /dashboard/overview
title: Visión general del Panel y primeros pasos
sidebar_label: Visión general y primeros pasos
sidebar_position: 1
---

# Visión general del Panel y primeros pasos

El Panel de QoreChain en **[dashboard.qorechain.io](https://dashboard.qorechain.io)** es la aplicación web oficial para usar QoreChain desde tu navegador. Desde un único lugar puedes explorar la cadena, gestionar un monedero, intercambiar tokens, generar y auditar contratos inteligentes, hacer staking a validadores, reclamar tokens de testnet, completar misiones y acceder a las herramientas de la red.

Todo lo que hay en esta sección es una guía práctica para el usuario: qué hace cada página y cómo usarla. No se requiere instalación: el Panel se ejecuta por completo en tu navegador.

## Qué puedes hacer

| Área | Para qué sirve |
| --- | --- |
| **[Explorador](/dashboard/explorer)** | Navega por bloques, transacciones, direcciones y validadores. |
| **[Monedero](/dashboard/wallet)** | Consulta tu saldo y tu historial y recibe QOR — con tu propio monedero (no custodio) en mainnet, o con un monedero de prueba gestionado por el panel en testnet. |
| **[Trade](/dashboard/trade)** | Intercambia tokens y aporta liquidez en el AMM on-chain. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Genera contratos inteligentes con **QCAI** en 17 blockchains compatibles. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Ejecuta un análisis de seguridad con **QCAI** sobre un contrato inteligente. |
| **[Staking y Validadores](/dashboard/staking-and-validators)** | Revisa los validadores y delega tus QOR. |
| **[Faucet](/dashboard/faucet)** | Solicita tokens de prueba en testnet. |
| **[Misiones](/dashboard/quests)** | Completa tareas guiadas para aprender a usar la red. |
| **[Tools Hub](/dashboard/tools-hub)** | Herramientas para operadores y desarrolladores en seis pestañas: Validator Program, Validator Application, Light Node, Node Registration, Rollups y SDK. |

## Inicia sesión {#sign-in}

El Panel tiene dos capas: una **cuenta del Panel** con la que inicias sesión y el **monedero** que le conectas. La mayoría de las páginas necesitan primero la cuenta:

- **Páginas que requieren haber iniciado sesión:** [Monedero](/dashboard/wallet), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), [Misiones](/dashboard/quests), tus contratos guardados en el [Smart Contract Creator](/dashboard/smart-contract-creator) y tu perfil. Si abres una de ellas sin haber iniciado sesión, se te lleva a la página de inicio de sesión.
- **Ver mainnet sin haber iniciado sesión:** en las páginas que muestran datos de mainnet, incluido el Explorador dentro del Panel, un visitante sin sesión ve "Sign in to view mainnet" y un botón **Sign in**. El mismo Explorador también se sirve sin ninguna cuenta en [explore.qore.network](https://explore.qore.network).
- **Abierto sin cuenta:** la página de inicio del [Smart Contract Creator](/dashboard/smart-contract-creator) (ofrece una generación gratuita) y el [Tools Hub](/dashboard/tools-hub). Ejecutar una auditoría de contrato requiere una cuenta.

Navegar por el Panel nunca requiere un monedero; conectar uno es un paso aparte, descrito a continuación.

## Conecta tu monedero {#connect-your-wallet}

La mayoría de las acciones que modifican el estado on-chain — enviar tokens, intercambiar, hacer staking — requieren un monedero conectado. La forma en que el Panel gestiona las claves depende de la red:

- **Mainnet es no custodio.** El Panel nunca guarda tus claves de mainnet. Conectas tu propio monedero — **QoreX** (el monedero oficial de QoreChain, como extensión o como app), **Keplr** o **MetaMask** — y el Panel lee tu saldo y tu historial reales desde la cadena. Cada transacción en mainnet se firma en tu propio monedero, nunca en el Panel. Enviar y hacer staking en el **raíl Native requieren QoreX**, ya que las cuentas de QoreChain firman con una firma híbrida post-cuántica que hoy solo QoreX puede generar; Keplr aún puede conectarse para consultar tu saldo en el raíl Native. **MetaMask** se conecta en el **raíl EVM**; enviar desde ahí requiere además la clave post-cuántica de la cuenta y una ventana de autorización EVM abierta, que se abre desde QoreX en la cuenta de estilo Ethereum (coin 60) que comparte la clave de MetaMask (consulta [Enviar con MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet es custodio.** El Panel gestiona un monedero de prueba por ti, para que puedas experimentar sin configuración alguna y sin poner en riesgo valor real.

### Conecta con QoreX (recomendado) {#connect-qorex}

QoreX es el monedero oficial de QoreChain. La tarjeta **Connect with QoreX** del Panel admite tanto la extensión de navegador como la app móvil desde el mismo punto de entrada.

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io) y asegúrate de que la cabecera muestre **Mainnet**.
2. Si es tu primera visita a una página de mainnet, lee y acepta el [reconocimiento de riesgos único](#risk-acknowledgement).
3. Abre **Wallet** en la barra lateral (debes haber iniciado sesión) y selecciona **Connect with QoreX** en la tarjeta **QoreX wallet**.
4. Si la extensión de navegador de QoreX está instalada y se detecta en este navegador, el Panel te pregunta **"How do you want to connect?"** con dos opciones, **Browser extension** y **QoreX app**. Elige una — la elección se guarda, de modo que las visitas posteriores omiten esta pregunta (siempre hay disponible un enlace **Use a different method** si quieres cambiar más adelante). Si no se detecta ninguna extensión, el Panel va directo al flujo de la app.
   - **Browser extension**: se abre la ventana emergente propia de la extensión, mostrando `dashboard.qorechain.io` como el sitio que solicita la conexión. Revísala y apruébala — esto firma una prueba única de que eres dueño de tu dirección `qor1...` (no se mueven fondos). El emparejamiento se completa de inmediato, en la misma sesión del navegador.
   - **QoreX app**: el Panel muestra un código QR (con un enlace **Open QoreX** que abre la app directamente si estás navegando desde el mismo teléfono). Abre la app de QoreX, escanea el código QR (o toca el enlace), revisa la solicitud de emparejamiento que muestra el origen del Panel, y apruébala con tu confirmación biométrica. El Panel sondea en segundo plano y termina el emparejamiento automáticamente en cuanto apruebas.
5. Una vez aprobado, el Panel muestra tu dirección `qor1...` y desbloquea las acciones que requieren una firma.

Consulta [Monedero](/dashboard/wallet#mainnet) para ver el recorrido completo de conexión y envío según el tipo de monedero, y la página [Cuenta y Panel](/qorex/account-and-dashboard#dashboard) de la documentación de QoreX para ver el emparejamiento desde el lado del monedero.

### Conecta con Keplr o MetaMask

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io) y asegúrate de que la cabecera muestre **Mainnet**.
2. Si es tu primera visita a una página de mainnet, lee y acepta el reconocimiento de riesgos único (ver más abajo).
3. Abre **Wallet** en la barra lateral y, en **or connect another wallet**, selecciona **Connect Keplr** o **Connect MetaMask**.
4. Aprueba la conexión en tu monedero.

Una vez conectado, la página Monedero muestra tu dirección (en forma abreviada) con su saldo e historial. MetaMask te permite recibir en el raíl EVM y enviar desde ahí una vez que hay una ventana EVM abierta (consulta [Enviar con MetaMask](/dashboard/wallet#send-metamask)). Keplr desbloquea la consulta de tu saldo e historial en el raíl Native — enviar y hacer staking ahí pasan por QoreX (ver más arriba), ya que las cuentas de QoreChain firman con una firma híbrida post-cuántica. Las páginas de solo lectura, como el Explorador, funcionan sin necesidad de conectarse.

Las cuentas de QoreChain usan el prefijo bech32 `qor`, por lo que una dirección conectada tiene la forma `qor1...` — la misma cuenta también tiene una codificación EVM (`0x...`) y una SVM (base58). Las cuentas están protegidas con criptografía resistente a la computación cuántica. Consulta [Configuración del monedero](/getting-started/wallet-setup) para obtener orientación en la configuración inicial, y [Añadir QoreChain a tu monedero](/dashboard/wallet#add-network) si tu monedero aún no conoce la red.

### Reconocimiento de riesgos único {#risk-acknowledgement}

Antes de poder usar cualquier página de mainnet, el Panel te pide aceptar un aviso legal único. Este confirma que entiendes que las transacciones en mainnet mueven **fondos reales**, que el Panel es **no custodio** (solo tú controlas tus claves) y que las transacciones on-chain son **irreversibles**. Lo aceptas una sola vez; después, las páginas de mainnet se abren directamente.

## Selecciona tu red

El Panel funciona con dos redes. La cabecera muestra la red a la que estás conectado en cada momento y te permite cambiar; se abre en **Mainnet** por defecto, y tu elección se recuerda en tu navegador.

| Red | Chain ID | Cuándo usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Red en vivo (en funcionamiento desde el 7 de junio de 2026, con la versión de cadena v3.2.3) para valor real y uso en producción. No custodio: conectas tu propio monedero. |
| **Testnet** | `qorechain-diana` | Entorno gratuito para pruebas (con la versión de cadena v3.2.4, una versión solo de testnet), con un monedero de prueba gestionado por el panel y el [Faucet](/dashboard/faucet) para obtener tokens de prueba. |

El token nativo es **QOR** (denominación base `uqor`, donde 1 QOR = 10^6 uqor). Si eres nuevo, empieza en testnet, reclama tokens del Faucet y prueba una primera transferencia antes de pasar a mainnet.

:::tip ¿Nuevo en QoreChain?
Sigue [Conexión a Testnet](/getting-started/connecting-to-testnet) y [Tu primera transacción](/getting-started/first-transaction) para ponerte manos a la obra rápidamente, y luego vuelve para explorar el resto del Panel.
:::

## Relacionado

* [Explorador](/dashboard/explorer) — navega por bloques, transacciones y cuentas.
* [Monedero](/dashboard/wallet) — gestiona cuentas y envía transacciones.
* [Trade / DEX](/dashboard/trade) — intercambia tokens contra los pools del AMM on-chain.
* [Tools Hub](/dashboard/tools-hub) — Validator Program, Validator Application, Light Node, Node Registration, Rollups y SDK.
* [Faucet](/dashboard/faucet) — tokens de prueba en testnet.
