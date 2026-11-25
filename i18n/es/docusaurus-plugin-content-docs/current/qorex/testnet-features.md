---
slug: /qorex/testnet-features
title: Funciones de testnet
sidebar_label: Funciones de testnet
sidebar_position: 10
---

# Funciones de testnet

:::caution SOLO TESTNET
Todo lo que aparece en esta página funciona **solo en la testnet de QoreChain** (`qorechain-diana`). **Nada de ello está en mainnet.** Los tokens de testnet no tienen valor. Las pantallas siguientes no aparecen en QoreX mientras estás en mainnet.
:::

QoreX tiene algunas funciones que primero se están probando en la testnet. Solo se muestran mientras la testnet está activa, y cada pantalla lo indica con un aviso **TESTNET: solo tokens de prueba, no QOR real**.

## Innovaciones {#innovations}

- **La red confirma antes de que firmes (solo testnet).** Para una transferencia a otra cadena, QoreX pide primero a la red que confirme el canal y su contraparte. Si no puede, no se envía nada.
- **Estado real de las rutas (solo testnet).** La pantalla del bridge muestra lo que la propia red dice de cada ruta y no ofrece nada que la red no ofrezca.
- **Transacciones en formato Solana en QoreChain (solo testnet).** Una ventana SVM que abres con tu firma ML-DSA-87 permite que tu propia clave de Solana actúe dentro de límites estrictos.

## Cómo llegar a la testnet en QoreX {#reach-testnet}

- **App móvil:** abre **Ajustes** y activa **Usar testnet (desarrolladores)**. La app cambia a `qorechain-diana` al instante, sin reiniciar. El valor predeterminado siempre es mainnet. Desactívalo para volver.
- **Extensión de navegador:** toca siete veces el número de versión en la parte inferior del popup para mostrar la sección **Modo desarrollador** y luego toca **Cambiar a testnet (diana)**. En la misma sección, **Volver a mainnet** te devuelve.

Mientras la testnet está activa, las pantallas exclusivas de testnet que se describen abajo aparecen en **Ajustes** de la app y en el popup de la extensión (**Enviar a otra cadena** y **Bridge**), y la herramienta **Solana en QoreChain** aparece en la pestaña Desarrollo o en la página de herramientas de desarrollo. Los saldos de testnet no muestran valor en dólares. Las dApps no pueden cambiar la red; solo tú.

## Obtener QOR de prueba {#get-test-qor}

Los QOR de testnet son gratuitos y no tienen valor. Consíguelos en el [Grifo del Dashboard](/dashboard/faucet): inicia sesión allí, copia tu dirección de testnet desde QoreX (la herramienta de desarrollo **Espacio de trabajo de testnet** tiene un botón **Copiar dirección** y un botón **Abrir el faucet de testnet**) y solicita los tokens. Consulta también [Conexión a la testnet](/getting-started/connecting-to-testnet) para conocer los endpoints públicos de testnet.

## Enviar a otra cadena (IBC) {#ibc}

**SOLO TESTNET.** Envía QOR desde la testnet de QoreChain a las testnets de **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** y **Celestia**, y tráelos de vuelta.

Lo que QoreX hace por ti:

- **Primero comprueba la ruta.** Antes de que puedas firmar, QoreX pide a la red que confirme que el canal está abierto y que sigue llevando a la cadena que elegiste. Si el canal está cerrado, ha cambiado o no se puede confirmar, QoreX lo dice y no envía nada.
- **Muestra la revisión completa.** Antes de firmar ves el remitente, el destinatario en la otra cadena, la comisión de red y los plazos.
- **Plazos.** Una transferencia de prueba a la testnet de Cosmos Hub llegó en unos 20 segundos. QoreX te indica que esperes alrededor de un minuto. Si no se entrega en 10 minutos, vuelve a ti.
- **Qué firma.** Una transferencia desde QoreChain se firma con tu clave híbrida (ML-DSA-87 y secp256k1). La vuelta se firma en la otra cadena con una clave clásica, como exige esa cadena, y la revisión lo indica: en esa cadena estas monedas están protegidas solo por una clave clásica.

### Enviar desde QoreChain {#ibc-send}

1. Activa la testnet (consulta [más arriba](#reach-testnet)), abre **Ajustes** (en la extensión: el popup) y toca **Enviar a otra cadena**.
2. Elige la **Cadena de destino** y el **Activo** (QOR, o monedas que llegaron por IBC).
3. Introduce el **Importe**. El campo **Destinatario en &#123;chain&#125;** viene rellenado con tu propia dirección en esa cadena; puedes cambiarlo. QoreX comprueba que sea una dirección válida en esa cadena.
4. Toca **Revisar**, comprueba los datos en **Comprueba antes de firmar** y luego **Firmar y enviar**.

### Traer monedas de vuelta {#ibc-back}

1. En **Enviar a otra cadena**, abre **Traer de vuelta a QoreChain** y toca **Mostrar mis saldos en &#123;chain&#125;** en la cadena que usaste.
2. Elige **Qué traer de vuelta**. La cuenta en esa cadena necesita un poco de la moneda propia de esa cadena para pagar la comisión; QoreX te avisa si falta.
3. Revisa y luego **Firmar y traer de vuelta**. Se entrega en tu propia dirección de QoreChain.

### Seguir una transferencia {#ibc-track}

**Tus transferencias** enumera cada transferencia y la sigue: esperando a la red, en camino, entregada o devuelta a ti (con el motivo, o porque agotó el tiempo). Toca **Actualizar** para volver a leer. Si todavía no se conoce el estado, QoreX dice que no está confirmada como entregada en lugar de suponerlo.

## Pantalla del bridge {#bridge}

**SOLO TESTNET.** La pantalla **Bridge** lee de la red las rutas de QoreChain Bridge y muestra el estado real de cada una: aún no abierta, en pausa, cerrada por ahora, abierta, abierta para retiros o abierta para depósitos. Una ruta se ofrece solo cuando la propia red dice que está abierta.

**Hoy todas las rutas están cerradas en la testnet, así que no se ofrece nada.** La pantalla está lista para cuando se abran las rutas. Nada de lo que hay aquí es una ruta, un activo o un importe que puedas usar ahora, y nada está en mainnet.

## Solana en QoreChain {#solana-on-qorechain}

**SOLO TESTNET.** El carril SVM ejecuta transacciones en formato Solana en QoreChain. Es una herramienta del modo desarrollador y solo se muestra mientras la testnet está activa. En mainnet el carril SVM no está abierto y nada de esto se puede usar.

Lo que hace la herramienta:

- **Muestra el carril.** Si el carril SVM está funcionando en la red, y su cluster.
- **Muestra tu ventana SVM.** Una ventana permite que las transacciones firmadas por tu clave de Solana gasten de tu cuenta sin una firma ML-DSA-87, dentro de unos límites. QoreX muestra si hay una abierta, cuántos bloques, transacciones y QOR quedan, qué clave de Solana está vinculada y qué programas admite.
- **Abre y cierra una ventana.** Abre una ventana eligiendo qué programas admite (se recomienda enumerarlos; **Cualquier programa** lleva una advertencia), cuántos bloques permanece abierta (como máximo 17,280), cuántas transacciones (como máximo 1,000) y el máximo de QOR que puede gastar. La clave de Solana en el índice 0 de tu frase de recuperación es la que queda vinculada. Abrir una ventana sustituye la que tengas. Se aplica la advertencia de la pantalla: mantenla pequeña y corta, y ciérrala cuando termines con **Cerrar la ventana**.
- **Retransmite una transacción de Solana firmada.** Pega los bytes en formato de red (base64 o base58) desde una herramienta de desarrollo y toca **Leerla**. QoreX muestra los programas y qué firmantes han firmado, y retransmite solo transacciones completamente firmadas. Tu cuenta de QoreChain firma el sobre con ML-DSA-87 y paga su comisión; no obtiene ninguna autoridad sobre la transacción de Solana.

Cómo usarla: activa la testnet y el modo desarrollador, abre **Solana en QoreChain** desde la pestaña Desarrollo (o desde la página de herramientas de desarrollo de la extensión) y usa las secciones anteriores. Las llamadas a contratos de programas SVM desde el [modo desarrollador](/qorex/developer-mode#contracts) también funcionan solo en la testnet.

Para el lado de la cadena del carril SVM, consulta [SVM en la testnet](/developer-guide/svm-testnet-v329) y [el carril SVM](/developer-guide/svm-lane-v328).

## Lo que no está en mainnet {#not-on-mainnet}

- Enviar a otras cadenas por IBC desde QoreX.
- La pantalla de QoreChain Bridge y sus rutas.
- Solana en QoreChain, incluidas las ventanas SVM y la retransmisión.

QoreX muestra estas pantallas solo en la testnet y lo indica en cada una.
