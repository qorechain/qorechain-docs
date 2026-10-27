---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

La página **Developers** (`/developers`, barra lateral **Build**, entrada **Developers**) es una caja de herramientas pública para quienes construyen sobre QoreChain. Tiene seis pestañas: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** y **AI agents (MCP)**. Puedes comprobar qué clave post-cuántica tiene registrada una cuenta y si su ventana de autorización EVM está abierta, hacer una simulación de una transacción firmada, practicar la firma híbrida con una clave desechable y probar una dApp contra una wallet QoreX simulada, todo en el navegador y sin cuenta. Está pensada para desarrolladores de dApps, wallets y backends. Para los SDK en sí, consulta [Visión General del SDK](/sdk/overview) e [Instalación](/sdk/install).

## Innovaciones {#innovations}

- **Lee una clave PQC y una ventana EVM desde la cadena, para cualquier dirección.** La pestaña PQ key status busca la clave ML-DSA-87 que registró una cuenta y su ventana de autorización EVM a través de las propias rutas de consulta de la cadena, en mainnet o testnet. Acepta direcciones `qor1...`, `0x...` y `qorvaloper1...`.
- **Una simulación que no transmite nada.** El simulador envía una transacción firmada a la ruta de simulación de la cadena e informa del gas usado, de un límite de gas sugerido y de los cambios de saldo y los eventos que produciría la transacción. La única ruta de escritura que el Dashboard expone para esto es la de simulación.
- **Firma híbrida en el navegador, con una clave que nunca sale de él.** El signing playground genera en la página una frase desechable de 24 palabras, deriva una clave secp256k1 y una clave ML-DSA-87, y firma y verifica mensajes y solicitudes de Sign In With QoreChain con la biblioteca [QoreSign](/qoresign/overview). La clave vive solo en memoria y desaparece al recargar.
- **Un QoreX simulado para probar dApps.** La QoreX test wallet instala `window.qorex` y se anuncia mediante EIP-6963 como "QoreX (mock)" en la pestaña actual, con firma híbrida real en testnet y una aprobación o rechazo manual para cada solicitud.
- **Solo testnet por construcción.** El signing playground y la test wallet rechazan mainnet: firman únicamente para `qorechain-diana`. Las dos pestañas de solo lectura pueden apuntar a cualquiera de las redes.

## Cómo usarlo {#how-to-use}

La página se abre en la pestaña **SDKs**. Las pestañas **PQ key status** y **Simulator** muestran un selector **Network** que es local a la página y que **por defecto está en Testnet**, sea cual sea el valor del encabezado. (Se usa un selector a nivel de página para que cambiar de red no recargue la página ni borre tus claves en memoria y la test wallet.)

### PQ key status {#pq-status}

1. Abre la pestaña **PQ key status** y elige la red.
2. Introduce una **Account address** (`qor1...`, `0x...` o `qorvaloper1...`). Una dirección `0x` son los mismos 20 bytes que su forma `qor1`; una dirección `qorvaloper` se busca como la cuenta propia del operador. La página comprueba el formato y el checksum.
3. Selecciona **Check**.
4. **Registered PQC key** muestra si hay una clave registrada, su algoritmo (ML-DSA-87), el tipo de clave, **Proof of possession** (la cadena la trata como opcional) y la clave pública. Si no hay ninguna registrada, lo indica.
5. **EVM authorisation window** muestra el estado (**Open** o **Closed**), **Blocks left**, **Transactions used** (por ejemplo "3 of 20"), **Value used**, las alturas de apertura y de expiración, si la ventana es **Native QOR transfers only**, y los destinos permitidos. Si la cuenta nunca abrió una, dice "No EVM authorisation window has been opened for this account."

La ventana se abre desde el carril nativo con la clave ML-DSA-87 de la cuenta, y se cierra cuando se alcanza su límite de bloques o de transacciones; consulta [Ventana de autorización EVM](/developer-guide/evm-development#evm-window). Esta pestaña responde a la pregunta habitual "¿por qué se rechazó mi transacción EVM?" sin línea de comandos.

### Simulator {#simulator}

1. Abre la pestaña **Simulator** y elige la red.
2. Pega un **Signed TxRaw** (base64 o hex) en el cuadro. La página te indica el tamaño decodificado y el número de firmas, y avisa si no hay ninguna (lo más probable es que la cadena se niegue a simular una transacción sin firmar).
3. Selecciona **Simulate**. El resultado muestra **Gas used**, el **Suggested gas limit**, **Balance changes** (dirección, denominación, cambio) y los **Events**.
4. Si la cadena la rechaza, la página muestra su código, codespace y log.

No se transmite nada. Necesita los bytes de una transacción firmada: construye y firma primero con un SDK o `qorechaind` (consulta [Firma post-cuántica](/developer-guide/post-quantum-signing)). La entrada está limitada a aproximadamente 180 KB.

### Signing playground (solo testnet) {#signing-playground}

1. Abre la pestaña **Signing playground**. Advierte: "Throwaway testnet key: never use it for real funds."
2. Selecciona **Generate throwaway key**. La página muestra la dirección, el tamaño de la clave pública secp256k1 y los tamaños de la clave ML-DSA-87. Selecciona **New key** para otra.
3. **Message:** introduce texto y selecciona **Sign**. El texto se firma con ambas claves para la cadena `qorechain-diana`; la firma aparece como JSON.
4. **Verify:** pega una firma y la dirección del firmante y selecciona **Verify**. Informa "Valid signature" o "Invalid signature". Como una clave desechable no está registrada en la cadena, comprueba contra la dirección del firmante y la clave pública ML-DSA-87 de esta sesión.
5. **Sign In With QoreChain:** selecciona **Build message** para crear un mensaje de inicio de sesión para este sitio con un nonce aleatorio, y luego fírmalo y verifícalo como lo haría un servidor. Se muestran los campos analizados. Consulta la [especificación SIWQ](/qoresign/spec/siwq-v1) y la [guía de inicio de sesión](/qoresign/guides/sign-in).

La clave se genera en el navegador, nunca se guarda ni se envía, y no se puede recuperar. Consulta [QoreSign](/qoresign/overview) y [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1) para los formatos.

### QoreX test wallet (solo testnet) {#test-wallet}

1. Abre la pestaña **QoreX test wallet** y lee la advertencia: cada inicio genera una clave desechable de testnet en memoria; nunca envíes fondos reales a ella.
2. Selecciona **Start test wallet**. Usa el paquete publicado `@qorechain/qorex-wallet-mock`, instala el simulado en **esta pestaña** (reemplazando allí una extensión QoreX real hasta que recargues) y lista las **Addresses** que contiene: QoreChain Native, EVM y SVM.
3. Conéctate desde una dApp que se ejecute en la misma pestaña, o llama a `window.qorex` desde la consola del navegador.
4. Cada solicitud espera tu decisión en **Waiting for approval**: selecciona **Approve** o **Reject**. La lista **Requests** registra cada una con su estado de aprobación y su resultado.
5. Selecciona **Stop (reloads the page)** para quitar el simulado.

Firma solo para testnet y nunca para mainnet. Úsala para probar el flujo de conexión de una dApp antes de apuntar la dApp a un QoreX real.

### SDKs y AI agents (MCP)

- **SDKs:** la pestaña muestra actualmente un breve inicio rápido estático y una tabla de paquetes. **Está desactualizada** (todavía describe la versión 0.1.0 y dice que los paquetes no están en los registros, lo cual ya no es cierto). Usa [Instalación del SDK](/sdk/install) para los paquetes y versiones actuales. Una pestaña SDKs reconstruida, generada a partir de la lista de paquetes probada con comandos de instalación, inicios rápidos y versiones en vivo de los registros, está **próxima y todavía no activa**.
- **AI agents (MCP):** la pestaña consulta el registro npm en busca del servidor MCP de QoreChain y, mientras el paquete no esté publicado, dice **"The QoreChain MCP server is not published yet."** Todavía no hay comando de instalación. Cuando se publique el paquete, la pestaña mostrará la configuración de cliente para ejecutarlo localmente por stdio o autoalojado por Streamable HTTP.
- **Transaction inspector:** una herramienta para decodificar y explicar cualquier transacción está **próxima y todavía no activa**.

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), o **Developers** en el grupo **Build** de la barra lateral (y en el menú móvil).
- **Inicio de sesión:** ninguno. La página está abierta a todos.
- **Red:** PQ key status y Simulator: mainnet o testnet, mediante el selector de la pestaña (por defecto testnet). Signing playground y QoreX test wallet: solo testnet.
- **Wallet:** ninguna. Las herramientas generan sus propias claves desechables.
- **Coste:** gratis. No se envía nada a la cadena salvo consultas de lectura y llamadas de simulación.
- **Privacidad:** las claves desechables existen solo en la memoria de la página. No pegues una frase de recuperación real en ninguna herramienta.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Redes |
| --- | --- | --- |
| Página Developers | `dashboard.qorechain.io/developers` | Herramientas de lectura en mainnet y testnet; herramientas de firma solo en testnet |
| Biblioteca de firma | npm `@qorechain/qoresign` 0.1.0, código fuente `github.com/qorechain/qoresign`, consulta [QoreSign](/qoresign/overview) | n/a |
| Paquete de la test wallet | npm `@qorechain/qorex-wallet-mock` 0.1.0, código fuente `github.com/qorechain/qorex-integrations` | Testnet |
| Servidor MCP | `@qorechain/mcp`: todavía no publicado | n/a |

Las versiones se comprobaron en el registro npm el 27 de octubre de 2026.

## Límites y problemas conocidos {#limits}

- **Todavía no activos:** la pestaña SDKs reconstruida y el transaction inspector. El servidor MCP no está publicado, así que no hay nada que instalar.
- **La pestaña SDKs actual está obsoleta;** usa en su lugar las [páginas del SDK](/sdk/overview).
- **El simulador necesita una transacción firmada.** No puede firmar por ti y no transmite.
- **El playground y la test wallet son solo de testnet** y usan claves desechables que desaparecen al recargar. No pueden guardar ni mover fondos reales.
- **Una extensión QoreX real en la misma pestaña es reemplazada** por la test wallet hasta que recargues la página.
- **Las lecturas pasan por un proxy de solo lectura.** Los endpoints REST de la cadena no envían cabeceras CORS de navegador, así que el Dashboard retransmite las solicitudes de solo lectura bajo las rutas `cosmos/`, `cosmwasm/` y `qorechain/` y la llamada de simulación. Desde tu propio código, llama directamente a los endpoints públicos: `api.qore.host` y `api-testnet.qore.host`.
