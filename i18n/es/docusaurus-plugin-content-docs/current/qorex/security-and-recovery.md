---
slug: /qorex/security-and-recovery
title: Seguridad y recuperación
sidebar_label: Seguridad y recuperación
sidebar_position: 5
---

# Seguridad y recuperación

Esta página explica cómo QoreX protege tus claves y cómo recuperas un monedero: la comprobación de protección en una sola pantalla, la clave ML-DSA-87 y su cuidado, las cuentas multifirma, la recuperación social, Legacy, la vinculación de dispositivos, la ventana de acceso EVM, lo que muestran las aprobaciones, el bloqueo automático, el Q-Day Scanner y dónde obtener ayuda. Es para todos los usuarios de QoreX; la mayoría de las herramientas de recuperación están en la aplicación móvil, y el texto indica cuándo algo difiere en la extensión de navegador o de Safari.

## Innovaciones {#innovations}

- **La protección de mi dinero.** Una pantalla que comprueba en vivo tu copia de seguridad, tus sitios conectados, los permisos que concediste en la cadena y tus aprobaciones de tokens, y te permite revocarlos. Consulta [La protección de mi dinero](#protection).
- **Cuidado de la clave poscuántica.** Rota la clave ML-DSA-87 desde tu frase de recuperación, repara un registro que ya no puede firmar y usa una multifirma poscuántica. Consulta [Rotar la clave](#pqc-rotation), [Reparar](#pqc-repair) y [Cuentas multifirma](#multisig).
- **Recuperación social con fragmentos cifrados y un kit de recuperación.** Los guardianes guardan fragmentos sellados con ML-KEM, divididos 2 de 3, y necesitan tu kit de recuperación para restaurar el monedero. Una recuperación ejecuta un bloqueo temporal de 48 horas y te avisa; puedes cancelarla, y una cancelación solo puede retrasar, nunca mover fondos.
- **Legacy.** Un interruptor de hombre muerto sobre tus guardianes, para un beneficiario que tú elijas.
- **Vinculación de dispositivos.** Un código de un solo uso y un QR, nunca en la misma pantalla. El QR por sí solo es texto cifrado tras una derivación de claves con uso intensivo de memoria.
- **Clave ML-DSA-87 determinista.** Se deriva de tu frase de recuperación (la primera clave es `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, y las claves rotadas se derivan de la misma frase), por lo que la clave no necesita una copia de seguridad aparte. Consulta [QoreSign](/qoresign/overview).
- **Acceso EVM acotado.** Una transacción EVM solo se admite mientras hay una ventana de acceso abierta, limitada por número de transacciones, valor y caducidad, y una ventana que abres tú mismo admite solo transferencias de QOR salvo que elijas otra cosa.
- **Aprobaciones que rechazan lo que no pueden leer.** Consulta [Qué muestra la ventana de aprobación](#approvals).
- **Q-Day Scanner.** Un informe de exposición para cualquier dirección de Bitcoin o Ethereum.

## Cómo usarlo y dónde encontrarlo {#how-to-use}

La mayor parte de lo que sigue está en **Ajustes → Seguridad** en la aplicación móvil; **La protección de mi dinero** y **Ayuda** están en **Ajustes**. En las extensiones de navegador y de Safari, la pantalla de inicio del popup tiene botones para la ventana de acceso EVM, los Sitios conectados, Mostrar frase de recuperación, Rotar la clave poscuántica, Cuentas multifirma, La protección de mi dinero y Ayuda, además del ajuste de bloqueo automático. La recuperación social, Legacy, la vinculación de dispositivos y el Q-Day Scanner solo existen en móvil. QoreX es gratuito y no necesita ninguna cuenta para nada de esto; consulta la [descripción general](/qorex/overview#how-to-access) para ver los enlaces de las tiendas.

La pestaña Inicio también muestra una tarjeta de **Estado de la copia de seguridad** que sigue avisando hasta que se configura la recuperación social. La tarjeta solo controla la recuperación social: no puede saber si has anotado tu frase de recuperación, así que hazlo tú mismo (consulta más abajo).

## La protección de mi dinero {#protection}

Una pantalla que responde a «¿está seguro mi dinero y quién puede actuar por mí?». App: **Ajustes → La protección de mi dinero**. Extensión y Safari: **La protección de mi dinero** en la pantalla de inicio del popup. Cada línea se comprueba al abrirla, en este dispositivo y en la red; no se da nada por supuesto. Cuando algo no se puede leer, QoreX dice *"No se pudo leer ahora. Eso no significa que no haya ninguno."*

| Línea | Qué comprueba | Qué puedes hacer |
|---|---|---|
| **Copia de seguridad verificada** y **Recuperación probada** | si has demostrado que tienes tu frase de recuperación, y cuándo | **Probar mi frase de recuperación**: escribe tres palabras de tu frase. Es un simulacro: se comparan en este dispositivo, nada de lo que escribes se guarda ni se envía, y no se restaura ni se cambia nada. Las palabras erróneas no registran nada |
| **Guardianes (recuperación social)** | si hay guardianes configurados, cuántos y cuántos se necesitan | configúralos en [Recuperación social](#social-recovery) |
| **Apps con permisos** | los sitios que pueden ver tu dirección y pedirte que firmes (en la app, los sitios del navegador de dApps integrado; en la extensión, los sitios conectados) | **Revocar** cualquier sitio |
| **Permisos concedidos en la red** | las **autorizaciones authz** permanentes y las **concesiones de comisiones (fee grants)** que tu cuenta dio a otros, leídas de la cadena, primero las ilimitadas, con sus fechas de fin | **Revocar**: QoreX muestra una revisión con la comisión de red y luego firma la eliminación con tu firma híbrida |
| **Aprobaciones de tokens ERC-20** | los gastadores autorizados a mover tus tokens en el **EVM de QoreChain** | **Revocar**, que envía `approve(spender, 0)` |

**Sobre las aprobaciones de tokens.** En la app, toca **Revisar aprobaciones de tokens**; leerlas usa la dirección de Ethereum de este monedero, para lo cual se necesita tu frase una vez. Se leen en rangos que el nodo acepta, así que la pantalla puede decir *"Aprobaciones de tokens revisadas hasta el bloque \{from\}. Puede haber otras más antiguas: abre esta pantalla otra vez para seguir revisando."* Para revocar, QoreX abre primero una **ventana EVM de una sola transacción**, firmada con tu clave poscuántica y limitada al contrato del token, y después envía la transacción EVM, firmada con tu clave clásica. Solo una cuenta de estilo Ethereum (coin 60) puede enviar en el EVM de QoreChain, así que una cuenta coin 118 no puede revocar aquí una aprobación EVM, y QoreX lo dice.

**Protección poscuántica, por canal.** La pantalla explica con claridad qué firmas protegen qué:

- **QoreChain (nativo):** cada transacción lleva dos firmas, una poscuántica (ML-DSA-87) y una clásica, y la red comprueba ambas.
- **QoreChain EVM:** las transacciones EVM se firman de forma clásica, como en cualquier wallet EVM. La red las admite solo dentro de una [ventana](#evm-window) que abriste con tu firma poscuántica, dentro de los límites que elegiste.
- **Otras redes (Ethereum, Solana, Cosmos):** solo aceptan firmas clásicas. QoreX no puede añadir allí protección poscuántica.

## Haz una copia de seguridad ahora - nadie puede recuperar un monedero perdido por ti {#back-up-now}

:::danger Lee esto antes de financiar tu monedero
QoreX es **sin custodia**: tus claves existen únicamente en tu propio dispositivo, y QoreChain Association no tiene ninguna copia de ellas, ninguna clave maestra ni ninguna forma de restablecer o restaurar tu monedero. **No existe un flujo de "olvidé mi contraseña", ni un ticket de soporte, ni una anulación por parte de atención al cliente** - si pierdes el acceso a tus claves sin tener una copia de seguridad, los fondos se pierden, de forma permanente e irreversible. Esto es así en todo monedero sin custodia, no es una limitación de QoreX, pero merece la pena decirlo con claridad.

**Haz al menos una de estas dos cosas - justo después de crear tu monedero, no más tarde:**

1. **Anota tu frase de recuperación de 24 palabras** y guárdala en algún lugar sin conexión y duradero (no una captura de pantalla, no una nota sincronizada con la nube, no un mensaje a ti mismo). Es lo único que puede restaurar tu monedero en cualquier dispositivo, en cualquier momento - en móvil, muéstrala desde **Ajustes → Seguridad → Mostrar frase de recuperación** (la aplicación **no** la muestra mientras crea el monedero, así que tienes que ir a buscarla: hazlo de inmediato); en la extensión se muestra una sola vez al crear el monedero, y en cualquier momento desde **Mostrar frase de recuperación** en la ventana emergente. Consulta [Restaurar un monedero existente](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configura la [recuperación social](#social-recovery)** con guardianes de tu confianza. Esto te permite recuperar tu monedero incluso si pierdes la frase, sin que ningún guardián por sí solo pueda acceder jamás a tus fondos.

Hacer ambas cosas es la opción más segura: la frase te protege si cambias de dispositivo o la aplicación no está disponible; los guardianes te protegen si pierdes la propia frase.

**Desinstalar la aplicación elimina tus claves de ese dispositivo.** La bóveda de la aplicación móvil y la bóveda de la extensión del navegador residen únicamente en el dispositivo que las creó. Desinstalar la aplicación, restablecer el teléfono o eliminar/borrar la extensión elimina esa copia: sin una copia de seguridad y sin un dispositivo vinculado, nadie puede recuperar tu monedero, ni siquiera QoreChain. **Quitar un monedero de un teléfono o de un navegador** (Ajustes → Monederos → *Quitar de este teléfono*, o *Quitar de este navegador* en la extensión) elimina la clave de ese monedero del dispositivo de la misma manera: tus fondos permanecen en la cadena, pero solo su frase de recuperación puede devolverlo.
:::

## Clave ML-DSA-87 {#pqc-key}

La pantalla de Seguridad muestra el estado en cadena en vivo de tu clave ML-DSA-87: **"Se registra con tu primera transferencia"** → **"Registrada en cadena ✓"**. El algoritmo es **ML-DSA-87** (determinista, híbrido con secp256k1).

Los sitios web no pueden pedirle a QoreX que registre, migre o rote tu clave ML-DSA-87. El registro se hace por sí solo con tu primera transferencia y no requiere nada de ti - desde v3.2.3 la cadena también acepta una *prueba de posesión* opcional junto con el registro, que QoreX gestiona de forma invisible en las compilaciones actuales de las tiendas. También puedes [rotar la clave](#pqc-rotation) tú mismo, o [reparar](#pqc-repair) un registro que ya no puede firmar. Consulta [Rotación de clave](/developer-guide/post-quantum-signing#key-rotation) para ver el mecanismo subyacente.

### Reparar una clave que ya no puede firmar {#pqc-repair}

En casos poco frecuentes, el registro de clave que la red guarda para tu cuenta está **vacío, es solo clásico o está degenerado**, así que no se puede enviar nada desde la cuenta. QoreX distingue los dos casos: una clave registrada por **otra billetera** se indica como tal, mientras que un registro que **ya no puede firmar** recibe una tarjeta de reparación en la pantalla de **Inicio** (app) o en la pantalla de inicio del popup (extensión y Safari).

1. Lee la tarjeta: *"La clave poscuántica de esta cuenta en la red ya no puede firmar, así que no se puede enviar nada desde ella. Registrar la clave de nuevo lo soluciona."* Muestra la comisión de red, **0.09 QOR**, y dice que si la cuenta tiene una ventana EVM, la red la cierra (abre una nueva después).
2. Toca **Registrar la clave de nuevo**.
3. Toca otra vez (*Toca de nuevo para registrar (comisión 0.09 QOR)*). En la app, confirma con biometría.

La reparación **nunca es automática**: siempre se necesitan dos toques. Solo envía el registro de la clave, firmado con tu clave clásica. Después QoreX dice *"La clave está registrada de nuevo. Esta cuenta ya puede enviar."*

### Rotar la clave poscuántica {#pqc-rotation}

**Rotar la clave poscuántica** sustituye la clave ML-DSA-87 de la cuenta en la red por la **siguiente clave derivada de tu frase de recuperación**. App: **Ajustes → Seguridad → Rotar la clave poscuántica**. Extensión y Safari: el botón **Rotar la clave poscuántica** en la pantalla de inicio del popup. Toca y vuelve a tocar para confirmar (*Toca de nuevo para rotar la clave*); la app además pide biometría. La transacción la firman la clave actual y la nueva, y la comisión de red, tomada de una simulación, se muestra en el resultado.

- **Protege frente a** una clave poscuántica filtrada.
- **No protege frente a** una frase de recuperación filtrada. Quien tenga tu frase puede derivar todas estas claves. En ese caso, mueve tus fondos a una wallet nueva con una frase nueva.
- **Las demás wallets que usan la misma frase** no pueden firmar por esta cuenta hasta que admitan claves rotadas.
- **La red cierra la ventana EVM de la cuenta.** Abre una nueva si la necesitas.
- **La restauración sigue funcionando.** QoreX recorre las claves que tu frase puede derivar hasta encontrar la que tiene la red, así que una wallet restaurada firma con la clave rotada.

La rotación nunca es automática, y los sitios web no pueden pedirla.

## Cuentas multifirma {#multisig}

Una **cuenta multifirma** necesita que firmen varios miembros. QoreX admite la multifirma poscuántica en mainnet y testnet, usando **los mismos archivos que la línea de comandos de QoreChain**, así que cada miembro puede firmar en QoreX o en la herramienta de línea de comandos. App: **Ajustes → Seguridad → Cuentas multifirma**. Extensión y Safari: **Cuentas multifirma** en la pantalla de inicio del popup.

**Crear o añadir una**

1. **Crear una multifirma:** introduce las direcciones de los miembros (`qor1...`), una por línea, el número de firmas necesarias (el umbral) y un nombre opcional, y luego **Guardar**. Cada miembro debe haber enviado al menos una transacción.
2. O **Añadir una multifirma existente:** pega la clave multifirma (la salida de `keys show <name> -p` de la línea de comandos, o una clave compartida desde QoreX). **Compartir la clave multifirma** la envía a los demás miembros.

**Comprueba su estado.** La pantalla de la cuenta muestra el saldo, si el **conjunto de miembros poscuánticos** está registrado (y su versión), si la cuenta en uso es miembro y, para cada miembro, si su clave está lista, falta, ya no puede firmar, se registró sin prueba o no se pudo comprobar. Hasta que el conjunto de miembros esté registrado, la cuenta no puede enviar.

**Firmar en dos rondas**

1. **Preparar el registro** (primero, una vez) o **Preparar un envío**. QoreX toma el gas de una simulación y crea un archivo. En la extensión y Safari el archivo se **descarga**; en la app se **comparte como texto**. Envíalo a los demás miembros.
2. **Ronda 1.** Cada miembro poscuántico abre el archivo (**Abrir archivos de miembros**), lo revisa y elige **Firmar como miembro poscuántico**. En la app, los miembros **pegan** el texto que recibieron; en la extensión abren el archivo.
3. **Combina** las firmas de los miembros.
4. **Ronda 2.** Se eligen los miembros que firman de forma clásica (exactamente el número del umbral, la misma elección para todos), y cada uno revisa y elige **Firmar de forma clásica**. Vuelve a combinar.
5. **Enviar a la red.**

Cada paso de firma muestra primero lo que estás firmando y necesita **dos toques**; la app además pide biometría. Si una transacción fuera a registrar un **autenticador**, QoreX te advierte: un autenticador puede mover los fondos de la multifirma sin las firmas de los demás miembros. Para firmar offline desde un archivo otros tipos de transacción, consulta el espacio de trabajo offline y multifirma en [Modo desarrollador](/qorex/developer-mode).

## Recuperación social {#social-recovery}

La recuperación social permite que **guardianes** de confianza te ayuden a restaurar tu monedero sin ver jamás tu frase de recuperación.

- Tu semilla se divide en **fragmentos cifrados** (sellados con ML-KEM): por defecto tres, de los cuales cualesquiera **dos** pueden ayudarte a recuperar (un esquema de umbral 2-de-3); uno solo no puede.
- Cada guardián recibe una credencial.
- **El kit de recuperación.** La copia cifrada de tu semilla es tu **kit de recuperación** (empieza por `qorexkit1:`), que guardas tú. Los guardianes por sí solos no pueden restaurar el monedero: también necesitan este kit, y el kit por sí solo no sirve sin ellos. Las configuraciones nuevas envían al servicio de recuperación solo el número de guardianes y el umbral. Consulta [Kit de recuperación](#recovery-kit).
- Una recuperación requiere que el umbral de guardianes la apruebe, luego ejecuta un **bloqueo temporal de 48 horas** y te envía una **alerta de cancelación**, para que se pueda detener un intento malicioso.

**Configúrala:** Inicio → **Configurar recuperación** (o Ajustes → Seguridad → Recuperación social) → **Crear credenciales de guardián**. QoreX crea tres credenciales - *Guardián 1*, *Guardián 2* y una *Copia de seguridad imprimible* - y cualesquiera **2 de las 3** pueden ayudarte a recuperar. Entrega una a cada persona o dispositivo de confianza y guarda la copia de seguridad imprimible en un lugar seguro. Después guarda el kit de recuperación, como se describe a continuación. El aviso de Estado de la copia de seguridad desaparece una vez completada la configuración.

### Kit de recuperación {#recovery-kit}

Al final de la configuración, QoreX muestra tu **kit de recuperación**. Usa **Copiar el kit de recuperación** o **Compartir o guardar**, y conserva una copia en un lugar que controles y **no solo en este teléfono** (un gestor de contraseñas, una nota, una copia impresa). Tienes que marcar *He guardado el kit de recuperación fuera de este teléfono* antes de que **Listo** funcione. Para recuperar, pega el **ID de recuperación o el kit de recuperación**.

Si configuraste la recuperación social con una versión anterior, QoreX puede avisarte de que en el servicio de recuperación sigue habiendo una copia cifrada de tu kit. Guarda el kit y luego elige **Eliminar la copia del relé**. Las credenciales de tus guardianes siguen funcionando. Tras la eliminación, solo tú tienes el kit.

**Aprobar la recuperación de otra persona:** si eres guardián de alguien, usa **Ayudar a recuperar** en la pestaña Inicio para aprobar su solicitud.

## Legacy Protocol {#legacy}

**Legacy Protocol** es un interruptor de hombre muerto sobre tus guardianes: tus activos pueden pasar al beneficiario que elijas si quedas ilocalizable. Es opcional y se configura desde Ajustes → Seguridad.

## Vincular un nuevo dispositivo {#link-device}

Traslada tu monedero a un segundo teléfono o tableta **sin servidor y sin escribir** las 24 palabras:

1. **Nuevo dispositivo** → incorporación → **Vincular desde otro dispositivo**. Muestra un **código de 10 caracteres** de un solo uso y abre la cámara.
2. **Dispositivo antiguo** → Ajustes → Seguridad → **Vincular un nuevo dispositivo** → escribe ese código → confirma con biometría. Aparece un **código QR** (tu semilla sellada con una clave derivada del código: scrypt N=2¹⁷ → AES-256-GCM).
3. **Nuevo dispositivo** escanea el QR → se descifra localmente → mismo monedero, mismas direcciones.

**Por qué una foto del QR no basta:** el código y el QR nunca aparecen en la misma pantalla. Una foto del QR por sí sola es texto cifrado tras una función de derivación de claves con uso intensivo de memoria, y ambos artefactos son de un solo uso y desaparecen con las pantallas. Un código incorrecto da un error limpio - solo tienes que reintentar.

:::note
La vinculación de dispositivos es una **comodidad**, no un método de recuperación. Tu frase de 24 palabras y la recuperación social son tus verdaderas redes de seguridad.
:::

## Ventana de acceso EVM {#evm-window}

Desde la cadena **v3.2.0**, una transacción en la **lane EVM** - por ejemplo, una que firmas en MetaMask contra la red EVM de QoreChain - solo se admite desde una cuenta que tenga una **clave ML-DSA-87 registrada** *y* una **ventana de autorización abierta** (un `MsgOpenEVMWindow` con firma híbrida). La propia transacción EVM lleva únicamente una firma secp256k1. El explorador etiqueta una transacción así como "Authorised by a PQC window". Abrir una ventana es un mensaje de la lane Native de QoreChain que MetaMask no puede producir, así que QoreX es el lugar donde la abres. Los envíos propios de QoreX usan la lane Native y nunca necesitan una ventana.

**Quién la necesita.** Una ventana es para las **cuentas de estilo Ethereum (coin 60)** - las cuentas que añades con *Add an Ethereum account (coin 60)* para una frase usada primero en MetaMask (consulta [Restaurar una frase desde MetaMask o el Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask firma con una clave de Ethereum, que es la clave de una cuenta coin 60; ninguna clave de MetaMask puede enviar desde una cuenta `qor1…` ordinaria de coin 118, así que una ventana abierta en una de ellas no consigue nada y solo cuesta la comisión.

Si estás en una cuenta que no puede usar una ventana, la pantalla enumera los pasos a seguir y tiene un botón a **Tus cuentas**.

Hay dos formas de que se abra una ventana: **la abres tú mismo** (a continuación), o [QoreX abre una para una sola transacción](#per-transaction-windows) cuando un sitio te pide aprobarla.

Ábrela en la aplicación en **Ajustes → Seguridad → Ventana de acceso EVM**, o con el botón **Ventana de acceso EVM** en la ventana emergente de la extensión. Primero elige **qué admite la ventana**:

- **Solo transferencias de QOR** (por defecto, recomendado): sin llamadas a contratos, sin contratos nuevos y sin destinatarios que sean contratos.
- **Cualquier contrato:** una opción aparte, con una advertencia: *"Se puede llamar a cualquier contrato. El límite cuenta solo QOR: los tokens, NFT y aprobaciones que mueva un contrato no quedan limitados por la ventana."*

Si la red no puede limitar una ventana a transferencias de QOR, QoreX lo dice y pregunta si abrirla en su lugar para cualquier contrato. No se abre nada hasta que digas que sí exactamente a eso.

Después eliges:

| Campo | Significado | Límite |
|---|---|---|
| **Duración (bloques, máx. 17280)** | cuánto tiempo permanece abierta la ventana | hasta 17,280 bloques (unas 15 horas en mainnet) |
| **Cuántas transacciones (máx. 1000)** | cuántas transacciones EVM admite | hasta 1,000 |
| **Límite de gasto, QOR** | los QOR máximos que deja salir | cuenta **todos los QOR que salen de esta cuenta, más cada comisión máxima**; los tokens no cuentan |

En esta pantalla no puedes nombrar contratos concretos; las ventanas limitadas a contratos específicos las abre QoreX para una sola transacción (más abajo). Los valores por defecto son 300 bloques (unos 16 minutos en mainnet), 5 transacciones y 1 QOR. Abrirla cuesta una comisión de red normal y se firma con la firma híbrida habitual (secp256k1 y ML-DSA-87), y una ventana nueva **sustituye** a cualquier ventana que ya esté abierta. Abrirla también avanza el nonce de tu cuenta, así que abre la ventana **primero** y luego envía desde MetaMask - una transacción preparada antes será rechazada con "nonce too low". **Cerrar la ventana** solo se ofrece mientras hay una ventana activa.

**Una ventana abierta dice exactamente qué admite:** *Admite: solo transferencias de QOR*, *Admite: cualquier contrato (los tokens no cuentan para el límite)* o *Admits: only \{targets\}* (admite solo esos destinos). En el último caso, QoreX añade que **un contrato incluido en la lista todavía puede actuar por la cuenta**, incluido mover tokens que tenga o que se le hayan aprobado, y que el límite de QOR no cubre eso.

La pantalla muestra uno de cuatro estados: *Abierta durante \{blocks\} bloques más · \{txs\} transacciones · \{value\} QOR restantes*; *No hay ninguna ventana abierta. Las transacciones de MetaMask desde esta cuenta son rechazadas.*; *Esa ventana ha caducado o se ha agotado*; o *QoreX no pudo leer la ventana desde la red* - lo que significa que QoreX no lo sabe, **no** que no tengas ninguna. Si tu cuenta todavía no tiene una clave ML-DSA-87, registra una primero (tu primera transferencia de QoreX lo hace); una ventana no ayudará antes de eso.

:::caution Mantenla pequeña y corta
Una ventana permite que transacciones normales de MetaMask muevan tu QOR **solo con una firma secp256k1**. Mantén los límites bajos - un límite de gasto pequeño, pocas transacciones, poco tiempo -, elige **Solo transferencias de QOR** salvo que necesites un contrato y cierra la ventana cuando termines. El límite cubre todos los QOR que salen de la cuenta, incluida la comisión máxima, de modo que se rechaza una transacción que superaría el límite. No cubre los tokens.
:::

### Ventanas para una sola transacción {#per-transaction-windows}

Cuando un sitio pide a QoreX que envíe una transacción EVM en QoreChain y ninguna ventana abierta la cubre, la aprobación abre una **exactamente para esa transacción**, firmada con tu clave híbrida ML-DSA-87:

- una transacción, hasta el valor **más la comisión máxima**, durante unos diez minutos;
- limitada a los contratos a los que llama, cuando la red lo admite;
- la aprobación **nombra todos los contratos** que la ventana admitiría (incluidos los contratos que recientemente te hicieron firmar un permit) y dice que **sustituye cualquier ventana que tengas abierta**;
- el límite de QOR cubre todos los QOR que salen de la cuenta, incluida la comisión máxima, y un contrato incluido en la lista todavía puede actuar por la cuenta (mover tokens que tenga o que se le hayan aprobado, o QOR en poder de otros contratos);
- si la red no acepta una ventana limitada a contratos, QoreX **pregunta una segunda vez** antes de abrir una sin ese límite. Si dices que no, no se abre nada ni se envía nada.

Una firma de datos tipados que comprueba un contrato en QoreChain (un permit) abre del mismo modo una ventana corta que incluye ese contrato. En el historial de transacciones, una transacción EVM muestra cuánto usó de la ventana. Consulta [Integración de dApps](/qorex/dapp-integration) para la vista del desarrollador. Si usas MetaMask u otro monedero EVM con una app que llama a contratos, elige **Cualquier contrato** cuando abras tú mismo la ventana. Una app que envía sus transacciones a través de QoreX no necesita ninguna ventana abierta de antemano. Igual que la ventana manual, esto se aplica a las cuentas de estilo Ethereum (coin 60).

(Enviar ETH, BNB y otros activos en *otras* redes desde QoreX es otra cosa - consulta [Redes y tokens externos](/qorex/send-and-receive#external-networks-tokens).)

## Qué muestra la ventana de aprobación {#approvals}

Cada firma que produce QoreX la apruebas tú, y la aprobación enumera exactamente lo que estás firmando. QoreX muestra:

- un título y campos etiquetados para **cada mensaje** de la solicitud, incluidos los mensajes anidados dentro de un **MsgExec** de authz y los términos de las concesiones de permisos - y **rechaza** todo lo que no pueda mostrar ("QoreX no puede leer este mensaje … Aprueba solo si confías plenamente en este sitio");
- la **comisión** (*Comisión: \{amount\} · gas \{gas\}*), quién la paga y cualquier concesión de comisión (fee grant) - si no se puede leer la comisión, QoreX lo dice y te indica que no apruebes;
- el **límite, la acción permitida y la caducidad** de las asignaciones de gasto y las concesiones authz, con *UNLIMITED* y *NEVER* escritos explícitamente; una caducidad se muestra al segundo (`YYYY-MM-DD HH:MM:SS UTC`). Lee con atención la acción permitida: una asignación de comisiones cuyos mensajes permitidos incluyen `MsgExec` (una `AllowedMsgAllowance`) cubre cualquier mensaje que el beneficiario pueda ejecutar a través de ella, y una concesión authz genérica cubre el tipo de mensaje que nombra. Un voto de gobernanza se decodifica para que veas sobre qué estás votando. Cualquier cosa ilegible, ilimitada o interminable requiere un **segundo toque** en Aprobar (*Toca de nuevo para aprobar*);
- la cuenta firmante (*Firmado por …*) cuando tienes varias;
- para una solicitud con un número muy grande de mensajes, los primeros 50 y el recuento del resto.

Para las solicitudes **EVM**, QoreX decodifica la transacción o los datos tipados (transferencia, aprobación con *UNLIMITED* escrito explícitamente, permit y otros) y trata las llamadas y los tipos desconocidos como de alto riesgo, con un segundo toque. Simula cuando la red lo permite. El nodo EVM de QoreChain solo puede comprobar que una llamada con datos no fallaría, así que la aprobación dice entonces *"Simulación: esta red solo puede comprobar que la llamada no fallaría. No se comprobó qué hace con tus tokens. Aprueba solo si confías en este sitio."* y necesita un segundo toque. Una transacción que fallaría, o que no se puede simular, también necesita un segundo toque. Las solicitudes nativas que llaman a un contrato se simulan antes de la aprobación, y una llamada que el contrato rechazaría se rechaza con el motivo de la cadena. Las pantallas de aprobación muestran el memo y permiten abrir el mensaje completo.

QoreX también **rechaza una solicitud cuyos bytes pueden leerse de dos maneras** (desde 1.1.7 / 0.3.7). Una solicitud que repite un campo que debería aparecer una sola vez - por ejemplo, una comisión o un importe duplicados - podría mostrarse de una forma y ejecutarse de otra, así que QoreX no la mostrará para su aprobación en absoluto. En el caso de los sitios web, QoreX identifica el sitio solicitante por el origen que atestigua el propio navegador, nunca por lo que la solicitud dice de sí misma.

Un cambio de monedero o de cuenta, o bloquear el monedero, responde "no" a las solicitudes en espera; un sitio puede tener una solicitud en espera, y en total pueden esperar tres. Los nombres de los campos en las ventanas de aprobación se muestran en inglés en algunas compilaciones.

### Lo que un sitio nunca puede pedir {#never-requested}

Estas acciones solo están disponibles **desde las propias pantallas de QoreX**. QoreX las rechaza desde cualquier sitio web, diga lo que diga el sitio:

- gestión de claves poscuánticas (registrar, migrar, rotar);
- autenticadores (firmantes vinculados) y reglas de gasto;
- abrir, cerrar o borrar una ventana de acceso EVM;
- mensajes de ventana y de retransmisión de Solana en QoreChain;
- un permiso (authz) que permitiría a alguien **conceder** más permisos o **ejecutar** mensajes como tu cuenta. Una autorización así permitiría al receptor actuar como tú. QoreX la rechaza directamente, envuelta dentro de `MsgExec` a cualquier profundidad o como autorización genérica.

## Direcciones parecidas {#look-alike}

Los estafadores envían importes minúsculos desde direcciones que empiezan y terminan como una que usas, esperando que copies la equivocada. QoreX compara un destinatario con las direcciones que conoces (contactos guardados, tus propias cuentas y direcciones a las que has pagado), en QoreChain y en redes externas, y señala antes de que envíes una dirección que solo **se parece** a una de ellas. El spam probable con un enlace en el memo también se oculta del Historial. Consulta [Contactos y favoritos](/qorex/send-and-receive#contacts) e [Historial](/qorex/send-and-receive#history).

## Bloqueo automático {#auto-lock}

QoreX se bloquea tras un tiempo sin uso. Elige **1, 5, 15, 30, 60 minutos o 4 horas** en **Bloquear automáticamente tras**; el valor por defecto son **15 minutos**. App: Ajustes → Seguridad; pasado el intervalo, QoreX vuelve a pedir biometría antes de mostrar nada. Extensión y Safari: el ajuste está en la pantalla de inicio del popup, junto a un botón **Bloquear**; pasado el intervalo, vuelves a introducir tu contraseña.

## Tu frase de recuperación y las herramientas de accesibilidad {#phrase-privacy}

La pantalla de la frase de recuperación pide una biometría o un PIN del dispositivo nuevos cada vez, muestra las palabras en una cuadrícula numerada de solo lectura **sin botón de copiar**, está bloqueada para las capturas de pantalla en Android y está oculta en el selector de aplicaciones. En **Android 14 y posterior**, las palabras también se ocultan a los servicios de accesibilidad que no son herramientas de accesibilidad genuinas (TalkBack y otros lectores de pantalla reales aún pueden leerlas). En versiones anteriores de Android y en iOS, las palabras se ocultan por defecto a los lectores de pantalla; si dependes de un lector de pantalla, toca el aviso de esa pantalla para permitir que las lea. Muestra la frase solo cuando nadie pueda ver tu pantalla.

## dApps conectadas {#connected-dapps}

Las conexiones de dApps son **por origen** y duran hasta que las eliminas. En la aplicación se guardan **en este dispositivo, por monedero** (solo la dirección del sitio); consúltalas y revócalas en [La protección de mi dinero](#protection). En la extensión del navegador y en Safari, abre **Sitios conectados** en la ventana emergente para ver todos los sitios que este monedero aprobó y **Revocar** cualquiera de ellos.

## Firmantes vinculados y límites de gasto {#linked-signers}

Vincular una clave externa (Phantom o MetaMask) como **firmante vinculado** con sus propios límites de gasto **todavía no está disponible dentro de QoreX** - Ajustes → Seguridad muestra la tarjeta, con la acción marcada como *próximamente*. Nada está vinculado a tu monedero a menos que lo hayas hecho tú mismo fuera de QoreX. La gestión de claves nunca puede delegarse en una clave vinculada. Para ver el modelo en cadena, consulta [Autenticadores de monederos vinculados](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

El **Q-Day Scanner** te permite introducir cualquier dirección - la tuya o la de cualquiera - y obtener un informe de exposición para cualquier dirección de Bitcoin o Ethereum. Accede a él desde los botones rápidos de la pestaña Inicio. Para comprobar una dirección de **Bitcoin**, QoreX tiene que consultar blockstream.info, un servicio gestionado por un tercero, que ve la dirección y tu dirección IP. El escáner lo nombra y solo escanea después de que aceptes.

## Ayuda y soporte {#support}

App: **Ajustes → Ayuda**. Extensión y Safari: **Ayuda** en la pantalla de inicio del popup. La pantalla enumera los **únicos canales oficiales**, con cada dirección completa a la vista para que puedas comparar:

- Comunidad de Telegram: [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord: [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Página de ayuda: [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- Correo electrónico: team@qorechain.io
- Informar de una vulnerabilidad: [https://qorechain.io/security](https://qorechain.io/security)

:::danger El equipo de QoreX nunca pide tu frase de recuperación
*"El equipo de QoreChain NUNCA te pedirá tu frase de recuperación, tu contraseña ni tus claves. Quien lo haga es un estafador."* Esto también se aplica al soporte de QoreX.
:::

La misma pantalla tiene un **resumen de diagnóstico** opcional para copiar **solo si el soporte lo pide**. Contiene la versión de la app, la red y códigos de error: sin frase, claves, direcciones ni saldos.

## Modelo de seguridad, en resumen

1. **Sin custodia** - las claves se generan en el dispositivo, residen en bóvedas respaldadas por hardware (móvil) o en una bóveda cifrada (extensión), y nunca salen.
2. **Nada sin consentimiento** - cada conexión es por origen, cada firma se aprueba individualmente (biométrica en móvil), y las cargas útiles se decodifican antes de firmar. Lo que QoreX no puede leer se rechaza, o se marca claramente y queda tras un segundo toque.
3. **Lane Native con firma híbrida.** Cada transferencia nativa de QOR se firma dos veces: con una clave clásica y con ML-DSA-87 (FIPS 204). Cualquier cosa clásica (redes externas, EVM) se etiqueta, nunca es silenciosa.
4. **Sin analíticas, sin informes de fallos y sin ningún SDK de rastreo.** Las claves, la frase de recuperación, la bóveda y las aprobaciones nunca salen del dispositivo. El inicio de sesión opcional, las notificaciones push y la recuperación social usan un servidor solo cuando los activas; la lista completa de lo que envía QoreX está en [Qué envía QoreX por la red](/qorex/overview#data-and-privacy), y la [política de privacidad de QoreChain](https://qorechain.io/privacy) la cubre.
5. **Rutas de recuperación** - frase de 24 palabras (siempre), recuperación social con guardianes + bloqueo temporal de 48h (opcional), herencia Legacy (opcional), vinculación de dispositivos (comodidad).

## Límites y problemas conocidos {#limits}

- La recuperación social, Legacy, la vinculación de dispositivos y el Q-Day Scanner solo existen en móvil.
- Rotar la clave poscuántica protege frente a una clave poscuántica filtrada, no frente a una frase de recuperación filtrada. Las demás wallets con la misma frase no pueden firmar por una cuenta rotada hasta que admitan claves rotadas.
- Los firmantes vinculados con límites de gasto todavía no están disponibles dentro de QoreX.
- La pantalla de la ventana EVM manual solo ofrece "Solo transferencias de QOR" o "Cualquier contrato". El límite en QOR de una ventana nunca limita los tokens.
- Las aprobaciones de tokens se comprueban solo en el EVM de QoreChain, y revocarlas requiere una cuenta coin 60.
- La vinculación de dispositivos es una comodidad, no un método de recuperación. Un monedero perdido sin frase anotada y sin recuperación social no puede ser recuperado por nadie.
- La ventana de aprobación muestra algunos nombres de campo en inglés en algunas compilaciones.
