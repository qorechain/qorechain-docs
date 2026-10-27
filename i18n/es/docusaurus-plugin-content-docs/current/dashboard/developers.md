---
slug: /dashboard/developers
title: Developers
sidebar_label: Developers
sidebar_position: 13
---

# Developers

La página **Developers** (`/developers`, barra lateral grupo **Build**, entrada **Developers**) es una página pública de herramientas para construir sobre QoreChain. No necesita cuenta. Tiene seis pestañas: **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** y **AI agents (MCP)**. Juntas te permiten encontrar e instalar el paquete adecuado, comprobar qué clave post-cuántica tiene registrada una cuenta y si su ventana de autorización EVM está abierta, hacer una simulación de una transacción firmada, practicar la firma híbrida con una clave desechable y probar una dApp contra una wallet QoreX simulada, todo en el navegador. Está pensada para desarrolladores de dApps, wallets y backends. Un **Transaction inspector** está previsto y todavía no está activo (consulta [Límites](#limits)). Para las bibliotecas en sí, consulta [Paquetes para desarrolladores](/developer-tools/overview), la [Visión General del SDK](/sdk/overview) e [Instalación](/sdk/install).

## Innovaciones {#innovations}

- **Una puerta de enlace de solo lectura a la cadena.** Las herramientas leen datos públicos de la cadena y simulan una transacción a través de una puerta de enlace de solo lectura bajo las rutas de consulta `cosmos/`, `cosmwasm/` y `qorechain/` más la llamada de simulación. Nada en la página puede transmitir una transacción. La puerta de enlace existe porque los endpoints REST de la cadena no envían cabeceras CORS de navegador.
- **Claves que nunca salen del navegador.** Las claves del signing playground y de la test wallet se generan en tu navegador y se conservan solo en memoria. Nunca se guardan ni se envían, y desaparecen al recargar. Esas dos pestañas son solo de testnet y rechazan mainnet.
- **La biblioteca de firma de producción, no una demo.** El playground usa [QoreSign](/qoresign/overview), la misma biblioteca de código abierto que usan las integraciones de producción. Produce y verifica firmas híbridas: una firma secp256k1 más una firma ML-DSA-87 sobre el mismo mensaje.
- **Un centro de paquetes generado a partir de datos probados.** La pestaña **SDKs** lista 40 paquetes a partir de un único manifiesto. Las versiones se leen en vivo de cada registro (se actualizan cada 10 minutos, y se muestra la última versión comprobada con su fecha si no se puede alcanzar un registro), y cada inicio rápido fue ejecutado por el equipo del SDK contra los registros públicos, con la salida que observaron mostrada a su lado.
- **Respuestas de la cadena, no suposiciones.** **PQ key status** lee la clave ML-DSA-87 registrada y el estado de la ventana EVM desde las propias rutas de consulta del nodo, de modo que puedes ver por qué se rechazaría una transacción EVM antes de enviarla.

## Cómo usarlo {#how-to-use}

Abre [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). La página se abre en **SDKs**. Las pestañas **PQ key status** y **Simulator** muestran un selector **Network** (Testnet o Mainnet) que es local a la página y que **por defecto está en Testnet**, sea cual sea el valor del encabezado. Es local a la página a propósito: el interruptor del encabezado recarga la página, lo que borraría las claves en memoria y la test wallet.

### SDKs {#sdks}

**Qué hace.** Lista todas las bibliotecas de QoreChain, agrupadas por producto. El manifiesto contiene 40 paquetes en TypeScript, Python, Go, Rust, Java, Kotlin y Swift: 36 estables, 1 obsoleto y 3 todavía no publicados (QoreSign para Python, el servidor MCP y la herramienta de línea de comandos `qore`). Los productos, en el orden mostrado, son: QoreChain SDK (core, hooks de React, EVM, SVM, el starter de dApps y los ports a Python, Rust, Go y Java), QoreSign, RDK (el kit de desarrollo de rollups, su herramienta de línea de comandos, el starter de rollups y los ports a Python, Rust, Go y Java), la biblioteca PQC, el wallet adapter, el chain bridge, Handles, las integraciones de QoreX, y MCP y la CLI `qore`.

**Cómo funciona.** Cada producto es una tarjeta. Si el producto se distribuye en varios lenguajes, un selector de lenguaje (pills) cambia el paquete mostrado. Cada paquete muestra:

- una pill de estado (**Stable**, **Not published yet** o **Deprecated**);
- la **última versión**, leída en vivo de su registro (npm, PyPI, crates.io, el proxy de Go, Maven Central o las versiones de GitHub) y actualizada cada 10 minutos. Si no se puede alcanzar un registro, se muestra la última versión comprobada con su fecha y una nota de que no se pudieron leer las versiones en vivo;
- **Registry**, **Source** (repositorio) y **License** (Apache-2.0), y los requisitos de ejecución;
- el comando **Install** y la línea **Import**, cada uno con un botón de copiar, además de las dependencias peer, las exportaciones por subruta, los transportes y un endpoint alojado cuando el paquete los tiene (Maven muestra un bloque de `pom.xml`);
- el **Quickstart**: una pill que dice **Tested** con la fecha, **Failed in testing** o **Not tested**, el nombre del archivo, el código con un botón de copiar, el **Observed output** y **How it was tested**. Un inicio rápido que falló queda oculto tras **Show the quickstart**, con una advertencia para leer antes los problemas conocidos;
- **Known issues** y notas, palabra por palabra del equipo del SDK.

Un paquete que no está publicado muestra "This package is not on its registry yet, so there is no install command." y ninguna línea de instalación. El paquete obsoleto (`@qorechain/connect`) queda plegado al final, en **Deprecated packages**, con sus sustitutos (los paquetes `@qorechain/qorex-*`).

**Pasos.**

1. Escribe en el cuadro de filtro ("Filter by name or language") para acotar la lista; **Clear filter** la restablece. Cuando coinciden varios productos, una fila **Jump to** enlaza con cada uno.
2. Elige el producto y luego la pill del lenguaje.
3. Comprueba la línea de versión ("latest on npm", o "checked" con una fecha) y copia el comando **Install**.
4. Copia la línea **Import** y luego el inicio rápido en el archivo indicado en **File name**, y ejecútalo.
5. Abre **Network endpoints** para copiar los ids de cadena y los endpoints públicos de testnet y mainnet. La nota que hay debajo explica las convenciones de los inicios rápidos: los ejemplos solo leen y firman con la frase de prueba pública, así que nunca financies una cuenta derivada de ella.

**Ejemplo mínimo.** Escribe `python` en el filtro, abre **QoreChain SDK**, elige la pill **Python**, copia el comando de instalación de **Install**, y luego copia el inicio rápido y ejecútalo.

**Red.** Lista estática más lecturas de registros en vivo; no se aplica ninguna elección de red.

### PQ key status {#pq-status}

**Qué hace.** Muestra la clave ML-DSA-87 que una cuenta ha registrado en la cadena y el estado de su ventana de autorización EVM, en mainnet o testnet.

**Cómo funciona.** La página analiza tu entrada, la convierte en una cuenta `qor1...` y hace dos consultas al nodo: la clave PQC registrada (a través de [QoreSign](/qoresign/overview)) y la ventana EVM de la cuenta (`GET /qorechain/pqc/v1/evm_window/{address}`). Una dirección `0x...` son los mismos 20 bytes que su forma `qor1...`, y una dirección `qorvaloper1...` se busca como la cuenta propia del operador. Los resultados pertenecen a una sola red: cambiar el selector los borra.

**Pasos.**

1. Abre la pestaña **PQ key status** y elige la red.
2. Introduce una **Account address** (`qor1...`, `0x...` o `qorvaloper1...`). La página comprueba el formato y el checksum e informa de un error tipográfico.
3. Selecciona **Check**.
4. Lee **Registered PQC key**: si hay una clave registrada, el **Algorithm** (ML-DSA-87), el **Key type** (hybrid), **Proof of possession** (con la nota de que la cadena la trata como opcional) y la **Public key** (2592 bytes, truncada, con un botón de copiar). Una cuenta sin clave dice "This account has no PQC key registered on this network."
5. Lee **EVM authorisation window**: **State** (**Open** o **Closed**), **Blocks left**, **Transactions used** (estilo "3 of 20"), **Value used**, **Opened / expiry height**, y si la ventana permite **Native QOR transfers only**, con los destinos permitidos si los hay. Una cuenta que nunca abrió una dice "No EVM authorisation window has been opened for this account."

La ventana se abre desde el carril nativo con la clave ML-DSA-87 de la cuenta y se cierra cuando se alcanza su límite de bloques o de transacciones; consulta [Ventana de autorización EVM](/developer-guide/evm-development#evm-window).

**Ejemplo mínimo.** Elige Testnet, pega la forma `0x...` de una dirección que uses con MetaMask y selecciona **Check**: si la ventana está **Closed** o no existe, una transacción EVM desde esa cuenta sería rechazada.

### Simulator {#simulator}

**Qué hace.** Hace una simulación de una transacción firmada contra la cadena e informa de lo que costaría y cambiaría. No se transmite nada.

**Cómo funciona.** La página decodifica tu entrada (base64 o hex, hasta unos 180 KB), cuenta sus firmas y la envía a la ruta de simulación del nodo. La llamada de simulación es la única ruta de escritura que permite la puerta de enlace.

**Pasos.**

1. Abre **Simulator** y elige la red.
2. Pega la transacción firmada (un `TxRaw`, en base64 o hex) en **Signed TxRaw**. La página muestra el tamaño decodificado y el número de firmas, y avisa si no hay ninguna (lo más probable es que la cadena se niegue a simular una transacción sin firmar).
3. Selecciona **Simulate**.
4. Lee **Gas used**, el **Suggested gas limit**, **Balance changes** (dirección, denominación, cambio) y los **Events** en la lista desplegable.
5. Si la cadena la rechaza, la página muestra su **Code**, **Codespace** y **Log** bajo "The chain refused the simulation".

Primero necesitas los bytes firmados: construye y firma con un SDK o `qorechaind` (consulta [Firma post-cuántica](/developer-guide/post-quantum-signing)). **Ejemplo mínimo:** firma una pequeña transferencia con el SDK en testnet, pega el `TxRaw` en base64, selecciona **Simulate** y comprueba el límite de gas sugerido antes de transmitir.

### Signing playground (solo testnet) {#signing-playground}

**Qué hace.** Te permite generar una clave híbrida desechable y firmar y verificar mensajes y solicitudes de Sign In With QoreChain en el navegador.

**Cómo funciona.** Se genera en la página una frase de 24 palabras que se conserva solo en memoria. [QoreSign](/qoresign/overview) deriva de ella una clave secp256k1 y una clave ML-DSA-87. Las firmas cubren el mismo mensaje con ambas claves, para la cadena `qorechain-diana`. Como una clave desechable no está registrada en la cadena, la verificación usa la clave pública ML-DSA-87 de esta sesión.

**Pasos.**

1. Abre **Signing playground**. Advierte: "Throwaway testnet key: never use it for real funds."
2. Selecciona **Generate throwaway key**. La página muestra la dirección `qor1...`, la clave pública secp256k1 (33 bytes) y la clave ML-DSA-87 (clave pública de 2592 bytes, clave secreta de 4896 bytes). **New key** la reemplaza.
3. **Message:** escribe texto y selecciona **Sign**; el resultado es una firma híbrida como JSON. Selecciona **Verify**: la página muestra "Valid signature", o "Invalid signature" con el código de error.
4. **Sign In With QoreChain:** selecciona **Build message** (un mensaje de inicio de sesión para este sitio con el dominio, la dirección, el id de cadena, un nonce aleatorio y las horas de emisión y de expiración), luego **Sign** y luego **Verify**. Verify lo comprueba como lo haría un servidor y lista los campos analizados. Consulta la [especificación SIWQ](/qoresign/spec/siwq-v1) y la [guía de inicio de sesión](/qoresign/guides/sign-in).

**Ejemplo mínimo.** **Generate throwaway key**, escribe `hello`, **Sign**, **Verify**: la página muestra "Valid signature".

**Red.** Solo testnet; la clave no se puede usar en mainnet y se pierde al recargar.

### QoreX test wallet (solo testnet) {#test-wallet}

**Qué hace.** Instala un simulado de la wallet QoreX en la pestaña actual para que puedas probar los flujos de conexión y firma de una dApp sin una wallet real.

**Cómo funciona.** **Start test wallet** crea una test wallet con una clave desechable (el paquete publicado `@qorechain/qorex-wallet-mock`) y la anuncia a las dApps de la página como "QoreX (mock)", mediante el descubrimiento estándar de wallets para navegadores (EIP-6963); también expone `window.qorex`. Nada se aprueba automáticamente. No transmite transacciones. Si hay una extensión QoreX real en la pestaña, el simulado la reemplaza hasta que recargues.

**Pasos.**

1. Abre **QoreX test wallet** y lee la advertencia: cada inicio genera una clave desechable de testnet en memoria; nunca envíes fondos reales a ella.
2. Selecciona **Start test wallet**. La tarjeta **Addresses** lista las direcciones QoreChain Native, EVM y SVM.
3. Conéctate desde una dApp que se ejecute en esta pestaña, o llama a `window.qorex` desde la consola del navegador.
4. Cada solicitud aparece en **Waiting for approval**; selecciona **Approve** o **Reject**. La lista **Requests** registra cada solicitud con su estado de aprobación y su resultado.
5. Selecciona **Stop (reloads the page)** para quitar el simulado.

**Ejemplo mínimo.** Inicia la test wallet, abre una dApp en la misma pestaña, elige "QoreX (mock)" en su diálogo de conexión y **Approve** la conexión.

**Red.** Solo testnet.

### AI agents (MCP) {#mcp}

**Qué hace.** Te dice si el servidor MCP de QoreChain está disponible y, cuando lo esté, cómo configurarlo en un cliente MCP.

**Cómo funciona.** Al abrir la pestaña, la página consulta el registro de paquetes en vivo. Hoy el paquete no está publicado, así que la pestaña dice **Not published** y "The QoreChain MCP server is not published yet." con una breve descripción de lo que ofrecerá. No muestra ningún comando de instalación. Cuando se publique el paquete, la pestaña mostrará su versión (**Published**) y la configuración para un cliente MCP: una configuración local (stdio) y una autoalojada (Streamable HTTP).

**Pasos.** Abre la pestaña y lee el estado. No se necesita nada más hasta que se publique el servidor. El centro de la pestaña **SDKs** muestra el mismo paquete como "Not published yet".

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), o **Developers** en el grupo **Build** de la barra lateral (y en el menú móvil).
- **Inicio de sesión:** ninguno. La página está abierta a todos.
- **Red:** **PQ key status** y **Simulator** funcionan en mainnet o testnet mediante el selector de la pestaña (por defecto testnet). **Signing playground** y **QoreX test wallet** son solo de testnet. **SDKs** y **AI agents (MCP)** no dependen de una red.
- **Wallet:** ninguna. Las herramientas generan sus propias claves desechables.
- **Coste:** gratis. No se envía nada a la cadena salvo consultas de lectura y llamadas de simulación.
- **Privacidad:** las claves desechables existen solo en la memoria de la página. No pegues una frase de recuperación real en ninguna herramienta.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Redes |
| --- | --- | --- |
| Página Developers | `dashboard.qorechain.io/developers` | Herramientas de lectura en mainnet y testnet; herramientas de firma solo en testnet |
| Biblioteca de firma | npm `@qorechain/qoresign`, código fuente `github.com/qorechain/qoresign`, consulta [QoreSign](/qoresign/overview) | n/a |
| Paquete de la test wallet | npm `@qorechain/qorex-wallet-mock`, código fuente `github.com/qorechain/qorex-integrations` | Testnet |
| Índice de paquetes | [Paquetes para desarrolladores](/developer-tools/overview) | n/a |
| Servidor MCP | `@qorechain/mcp`: todavía no publicado | n/a |

Las versiones de los paquetes cambian; consulta las actuales en la pestaña **SDKs** o en los registros.

## Límites y problemas conocidos {#limits}

- **Transaction inspector: próximamente, todavía no activo.** Previsto: pegar un hash y ver cada mensaje, el firmante, la comisión, si la firma post-cuántica se verifica contra la clave registrada del firmante, y el nivel de seguridad. Llegará con la próxima versión de QoreSign.
- **El servidor MCP no está publicado,** así que no hay nada que instalar; QoreSign para Python y la herramienta de línea de comandos `qore` tampoco están publicados todavía y no muestran comando de instalación.
- **Dos inicios rápidos están marcados como "Not tested":** QoreSign para Android (el mismo código se ejecutó solo en el artefacto JVM, no en un dispositivo) y QoreSign para Python (el paquete no está publicado). Las otras 32 entradas de inicio rápido se ejecutaron y pasaron.
- **El simulador necesita bytes firmados.** No puede firmar por ti y nunca transmite.
- **El playground y la test wallet son solo de testnet,** usan claves desechables que desaparecen al recargar y no pueden guardar ni mover fondos reales.
- **Una extensión QoreX real en la misma pestaña es reemplazada** por la test wallet hasta que recargues.
- **Las lecturas pasan por la puerta de enlace del Dashboard.** Desde tu propio código, llama directamente a los endpoints públicos: `api.qore.host` y `api-testnet.qore.host`.
