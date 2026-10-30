---
slug: /dashboard/overview
title: Visión general del Panel y primeros pasos
sidebar_label: Visión general y primeros pasos
sidebar_position: 1
---

# Visión general del Panel y primeros pasos

El Panel de QoreChain en **[dashboard.qorechain.io](https://dashboard.qorechain.io)** es la aplicación web oficial para usar QoreChain desde un navegador. Una sola cuenta y un único selector de red te dan el explorador, una vista de monedero, un faucet de testnet, una pantalla de intercambio con tokens de prueba, misiones, herramientas de contratos con IA, herramientas de nodos y validadores, y una página para desarrolladores. Es para quien quiere probar la red sin instalar nada, y para quienes construyen y necesitan comprobaciones rápidas mientras desarrollan. No se instala nada: se ejecuta en tu navegador.

Esta sección es una guía práctica para el usuario: qué hace cada página, cómo abrirla y cuáles son sus límites.

## Innovaciones {#innovations}

- **Un selector fija la red para todas las páginas.** El control **Testnet / Mainnet** de la cabecera guarda tu elección en el navegador y recarga la página, de modo que el servidor y el navegador leen la misma red. Mainnet es la red predeterminada.
- **Mainnet es no custodio.** El Panel nunca guarda claves de mainnet y nunca firma una transacción de mainnet. Solo envía a QoreX los parámetros de un envío o de una acción de staking, y QoreX reconstruye, muestra, firma (firma híbrida ML-DSA-87) y difunde la transacción. El Panel solo conoce el hash de la transacción.
- **Las vistas de mainnet requieren una cuenta; testnet es abierta.** En mainnet, las estadísticas de inicio, el Monedero, Trade y la vista general del Explorador comprueban el acceso en el servidor. Un visitante sin sesión ve "Sign in to view mainnet".
- **Un reconocimiento de fondos reales, una vez por navegador.** Antes de la primera vista de mainnet del Monedero, de Trade, de la vista general del Explorador o de las estadísticas de inicio, una tarjeta titulada "You're entering QoreChain Mainnet" enumera cuatro puntos: el Panel es no custodio, las transacciones son definitivas e irreversibles, existe riesgo de pérdida total y nada de lo que aquí aparece es asesoramiento financiero, y los QOR de testnet nunca son intercambiables. La aceptación se guarda en tu navegador, no en tu cuenta.
- **Una cuenta, tres codificaciones.** La misma cuenta se muestra como dirección `qor1...`, dirección `0x...` y dirección base58 de SVM, y el Panel lee el saldo y el historial una sola vez, a través de `qor1...`.

## Cómo usarlo {#how-to-use}

### La estructura

**Cabecera.** El selector de red y, a continuación, **Sign In** o un menú de perfil (Profile, Edit Profile, Theme, Language, Rewards, Referral, Docs, Log out).

**Barra lateral de escritorio, en orden:**

| Entrada | Página | Qué es |
| --- | --- | --- |
| **Discover** | `/` | Inicio: botones principales **Create Smart Contract** y **Explore Network**, contadores de "Dashboard Overview", listas de contratos creados, últimas auditorías públicas y principales colaboradores, y un "Developer Toolkit" con **Start Generating**, **New Audit** y **Claim Tokens**. |
| **Public Sale** | `/public-sale` | Los participantes existentes ven su asignación, el calendario de vesting y el reclamo. |
| **Wallet** | [Monedero](/dashboard/wallet) | Saldo, historial, recepción y (en mainnet) envío y staking a través de QoreX. |
| **Faucet** | [Faucet](/dashboard/faucet) | Tokens de testnet gratuitos. |
| **Explorer** | [Explorador](/dashboard/explorer) | Bloques, transacciones, direcciones y validadores. |
| **Trade** | [Trade](/dashboard/trade) | Pantalla de intercambio con tokens de prueba. |
| Grupo **Earn** | [Misiones](/dashboard/quests) | Quests, Leaderboard, Badges. |
| **Games** | [Misiones](/dashboard/quests#games) | El QoreChain Arcade. |
| Grupo **Build** | [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Nodes & Validators](/dashboard/tools-hub) (`/tools`), [Developers](/dashboard/developers) | Herramientas de contratos, la página del operador (cinco pestañas: Validator Program, Validator Application, Light Node, Node Registration, Rollups) y la página pública para desarrolladores (siete pestañas: SDKs, Transaction inspector, PQ key status, Simulator, Signing playground, QoreX test wallet, AI agents (MCP)). La entrada Nodes & Validators antes se llamaba "Tools"; su pestaña SDK pasó a Developers. |
| **FAQ** | `/faq` | Ayuda dentro de la app. Partes de ella están desactualizadas; este manual es la referencia. |

La página [Validadores](/dashboard/validators) (`/validators`) no tiene enlace en la barra lateral; ábrela por su dirección.

**Móvil.** Una barra inferior (Discover, Wallet, Faucet, y después Explorer, Trade, Quests) más un menú desplegable central con el resto.

### Inicia sesión {#sign-in}

El Panel tiene dos capas: una **cuenta del Panel** con la que inicias sesión y el **monedero** que le conectas. Navegar nunca requiere un monedero.

- **Se te redirige al inicio de sesión antes de que cargue la página:** Profile, [Monedero](/dashboard/wallet), Rewards, Referral, [Misiones](/dashboard/quests), [Trade](/dashboard/trade), [Faucet](/dashboard/faucet), Connection, Contracts, Public Sale, y cada página de contrato guardado `/smart-contract-creator/<id>`.
- **Muestra una pantalla "Authentication Required" cuando no has iniciado sesión:** [Nodes & Validators](/dashboard/tools-hub), [Validadores](/dashboard/validators), FAQ, [AI Audit](/dashboard/contract-auditor), Badges, Leaderboard y Games.
- **Abierto sin cuenta:** la página de inicio Discover, las páginas de detalle del [Explorador](/dashboard/explorer) (transacción, bloque, dirección, validadores) en ambas redes, la vista general del Explorador en testnet, la página de inicio del [Smart Contract Creator](/dashboard/smart-contract-creator) (una generación gratuita), la lista de auditorías en `/audits` y los informes de auditoría públicos, y la página [Developers](/dashboard/developers).
- **Mainnet sin haber iniciado sesión:** las páginas que muestran datos de mainnet (contadores de inicio, Monedero, Trade, la vista general del Explorador) muestran "Sign in to view mainnet" y un botón **Sign In**.

### Selecciona tu red {#select-network}

La cabecera muestra la red en la que estás y te permite cambiar. La elección se recuerda en tu navegador.

| Red | Chain ID | Cuándo usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Red en vivo (en funcionamiento desde el 7 de junio de 2026, con la versión de cadena v3.2.5 desde el 29 de octubre de 2026) para valor real. No custodio: conectas tu propio monedero. |
| **Testnet** | `qorechain-diana` | Entorno gratuito (con la versión de cadena v3.2.6 desde el 27 de octubre de 2026) con un monedero de prueba gestionado por el Panel y el [Faucet](/dashboard/faucet). |

El token nativo es **QOR** (denominación base `uqor`, 1 QOR = 10^6 uqor). Si eres nuevo, empieza en testnet, reclama tokens del Faucet y prueba una primera transferencia antes de pasar a mainnet.

Algunas páginas ignoran el selector: el Faucet siempre paga en testnet, [Trade](/dashboard/trade) siempre muestra contenido de testnet, y Quests, Badges, Leaderboard, Games, Public Sale y FAQ no dependen de la red.

### Conecta tu monedero {#connect-your-wallet}

- **Mainnet es no custodio.** Conecta **QoreX** (el monedero oficial de QoreChain, extensión o app), **Keplr** o **MetaMask**. Enviar y hacer staking en el raíl Native requieren QoreX, porque las cuentas de QoreChain firman con una firma híbrida que hoy solo QoreX genera. Keplr se conecta para consultar y recibir en el raíl Native. MetaMask se conecta en el raíl EVM; enviar desde ahí requiere además la clave ML-DSA-87 de la cuenta y una ventana EVM abierta, que se abre desde QoreX (consulta [Enviar con MetaMask](/dashboard/wallet#send-metamask)).
- **Testnet es custodio.** El Panel gestiona un monedero de prueba por ti, así que no hay nada que instalar ni valor real en riesgo.

#### Conecta con QoreX (recomendado) {#connect-qorex}

1. Abre [dashboard.qorechain.io](https://dashboard.qorechain.io) y asegúrate de que la cabecera muestre **Mainnet**.
2. Si es tu primera visita a una página de mainnet en este navegador, acepta el [reconocimiento de riesgos único](#risk-acknowledgement).
3. Abre **Wallet** (debes haber iniciado sesión) y selecciona **Connect with QoreX** en la tarjeta **QoreX wallet**.
4. Si se detecta la extensión de navegador de QoreX y no hay ningún método guardado, el Panel pregunta "How do you want to connect?" con **Browser extension** y **QoreX app**. La elección se guarda. Si no se detecta ninguna extensión, pasa directamente al flujo de la app.
   - **Browser extension:** la ventana emergente de la extensión muestra `dashboard.qorechain.io` como el sitio que lo solicita. Apruébalo; esto firma una prueba única de que eres dueño de tu dirección `qor1...`. No se mueven fondos.
   - **QoreX app:** el Panel muestra un código QR y **Open QoreX**. Escanéalo o tócalo, revisa la solicitud de emparejamiento en QoreX y apruébala con tu biometría. El Panel sondea ("Waiting for approval in QoreX...") y termina por sí solo.
   - Un enlace **Use a different method** aparece solo mientras hay un emparejamiento pendiente.
5. Una vez aprobado, el Panel muestra tu dirección `qor1...` y desbloquea las acciones que requieren una firma.

Consulta [Monedero](/dashboard/wallet#mainnet) para ver el recorrido completo de conexión y envío, y la página [Cuenta y Panel](/qorex/account-and-dashboard#dashboard) de la documentación de QoreX para ver el mismo emparejamiento desde el lado del monedero.

#### Conecta con Keplr o MetaMask

1. Con la cabecera en **Mainnet** y el reconocimiento aceptado, abre **Wallet**.
2. En **or connect another wallet**, selecciona **Connect Keplr** o **Connect MetaMask**.
3. Aprueba la conexión en tu monedero. Si tu monedero aún no conoce QoreChain, consulta [Añadir QoreChain a tu monedero](/dashboard/wallet#add-network).

Una vez conectado, la página Monedero muestra tu dirección con su saldo e historial. Consulta [Configuración del monedero](/getting-started/wallet-setup) para obtener orientación en la configuración inicial.

### Reconocimiento de riesgos único {#risk-acknowledgement}

La tarjeta de reconocimiento aparece antes de la primera vista de mainnet de **Wallet**, **Trade**, la **vista general del Explorador** o las **estadísticas de inicio** en un navegador. No se exige en todas las páginas de mainnet: las páginas de detalle del Explorador, el Creator y las demás páginas se abren sin ella. Acéptala una vez por navegador; si borras los datos del navegador, volverá a aparecer.

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io](https://dashboard.qorechain.io), en cualquier navegador actual. Sin instalación.
- **Cuenta:** inicio de sesión por correo electrónico o con un proveedor de identidad compatible en la página de inicio de sesión. Las páginas que la necesitan se indican en [Inicia sesión](#sign-in).
- **Redes:** mainnet `qorechain-vladi` y testnet `qorechain-diana`, con el selector de la cabecera. Mainnet es la red predeterminada.
- **Monedero:** ninguno para navegar. QoreX para enviar y hacer staking en mainnet, Keplr o MetaMask para consultar y recibir. En testnet el Panel crea un monedero de prueba por ti.
- **Coste:** el Panel es gratuito. Las acciones on-chain pagan la comisión de red (mínimo de 0.1 uqor por gas). Algunos elementos de pago se describen en sus propias páginas (la licencia de nodo ligero y la tarifa del programa de validadores en [Nodes & Validators](/dashboard/tools-hub)).
- **Acceso anticipado:** ninguna restricción hoy. Las páginas de mainnet solo necesitan iniciar sesión (donde se indica arriba) y el reconocimiento único.

## Dónde se publica {#where-published}

| Superficie | Dirección | Redes | Inicio de sesión |
| --- | --- | --- | --- |
| Panel | [dashboard.qorechain.io](https://dashboard.qorechain.io) | Mainnet y testnet | Según la página, consulta [Inicia sesión](#sign-in) |
| Explorador independiente | [explore.qore.network](https://explore.qore.network) (una app aparte, consulta [Explorador](/dashboard/explorer#standalone-explorer)) | Mainnet y testnet | Ninguno |
| Endpoints públicos | `rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`, con variantes `*-testnet` | Mainnet y testnet | Ninguno |

Páginas de esta sección: [Explorador](/dashboard/explorer), [Monedero](/dashboard/wallet), [Trade](/dashboard/trade), [Bridge](/dashboard/bridge), [Smart Contract Creator](/dashboard/smart-contract-creator), [Contract Auditor](/dashboard/contract-auditor), [Staking y Validadores](/dashboard/staking-and-validators), [Validadores](/dashboard/validators), [Faucet](/dashboard/faucet), [Misiones, Insignias, Clasificación y Juegos](/dashboard/quests), [Nodes & Validators](/dashboard/tools-hub) y [Developers](/dashboard/developers).

## Límites y problemas conocidos {#limits}

- **No hay pantalla de Bridge.** Consulta [Bridge](/dashboard/bridge).
- **Trade no sigue el selector de red.** Muestra contenido de testnet incluso con la cabecera en Mainnet. Consulta [Trade](/dashboard/trade).
- **La FAQ de la app es una página de ayuda breve.** Donde difiera de este manual, sigue este manual.
- **Restricciones de mainnet.** El staking, el envío y los despliegues de contratos en mainnet se describen en cada página; varios flujos (despliegues Native o SVM, redelegación, staking con bloqueo temporal) no se ofrecen en el Panel.
- **Testnet no tiene valor real.** Nunca envíes QOR reales a una dirección de testnet: los formatos son idénticos. Consulta [Monedero](/dashboard/wallet#testnet).

:::tip ¿Nuevo en QoreChain?
Sigue [Conexión a Testnet](/getting-started/connecting-to-testnet) y [Tu primera transacción](/getting-started/first-transaction) para ponerte manos a la obra rápidamente, y luego vuelve para explorar el resto del Panel.
:::
