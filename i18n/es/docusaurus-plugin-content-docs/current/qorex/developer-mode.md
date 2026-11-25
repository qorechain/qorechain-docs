---
slug: /qorex/developer-mode
title: Modo desarrollador
sidebar_label: Modo desarrollador
sidebar_position: 9
---

# Modo desarrollador

El modo desarrollador es un interruptor en **Ajustes** de QoreX. Está **desactivado por defecto**. Mientras está activado, QoreX muestra un conjunto de herramientas para quienes construyen sobre **QORE**CHAIN: inspectores que leen la red, un lugar para simular y decodificar transacciones, herramientas de contratos y rollups, firma offline y una forma de revisar las transacciones que proponen agentes de IA.

El modo desarrollador no cambia ninguna regla de firma. Todo lo que firma sigue mostrándote qué firma y espera tu aprobación, exactamente como antes.

## Innovaciones {#innovations}

- **Cada herramienta es primero de lectura o de revisión.** Los inspectores solo leen. Las herramientas que pueden firmar muestran una revisión decodificada y esperan tu aprobación.
- **Cifras exactas de la red.** Los inspectores muestran lo que informa la propia cadena: su versión, sus funciones, las claves registradas de tu cuenta, tu ventana EVM.
- **Errores en lenguaje claro.** El decodificador de errores convierte un error de red en bruto en una frase y dice qué hacer a continuación.
- **Los agentes de IA proponen, tú decides.** Un agente puede leer lo que permitas y proponer una transacción. QoreX la comprueba y la simula, y tú la apruebas o la rechazas en la ventana de aprobación normal. Ningún agente puede firmar.

## Cómo activarlo {#how-to-use}

- **App móvil (iPhone y Android):** abre **Ajustes** y activa **Modo desarrollador**. En la barra inferior aparece una pestaña **Desarrollo** con un icono de código (`</>`). Ábrela para ver las herramientas. Al desactivar de nuevo el ajuste, la pestaña se oculta.
- **Extensión de navegador:** en el popup, toca siete veces el número de versión en la parte inferior. En el popup aparece una sección **Modo desarrollador**, con un botón **Herramientas de desarrollo**. El botón abre una página con los mismos grupos que la pestaña de la app. La misma sección tiene **Desactivar el modo desarrollador**.

La misma sección contiene el selector de red. En la app es **Usar testnet (desarrolladores)** en Ajustes, y en la extensión, **Cambiar a testnet (diana)**. Consulta [Funciones de testnet](/qorex/testnet-features) para ver lo que solo existe en la testnet.

Las herramientas son las mismas en la app y en la extensión, salvo cuando una herramienta indica lo contrario. Se agrupan como sigue.

## Inspeccionar {#inspect}

Solo lectura, en mainnet y testnet. Nada en estas pantallas firma ni envía.

### Inspector de red y capacidades

Muestra en qué red estás y qué admite: el chain id, la versión del nodo, el último bloque, la última actualización que ha aplicado y la que esté programada, las funciones de protocolo que informa la cadena (activadas, preparadas o no activadas), el chain id del carril EVM, si el carril SVM ejecuta o está cerrado, los parámetros entre VM y poscuánticos, y cuántos canales IBC y rutas de bridge enumera la red. Una segunda parte, **Esta billetera**, muestra tu versión de QoreX, la compilación (app o extensión) y los métodos de firma y el modo de simulación que usa esta compilación.

Cómo usarlo: abre **Inspector de red y capacidades**. Toca **Actualizar** para volver a leer. Usa **Copiar** junto a un valor para copiarlo.

### Inspector de cuenta

Muestra la cuenta activa: si es una cuenta Cosmos (coin 118) o una cuenta unificada (coin 60), su ranura y sus índices de derivación, sus direcciones en cada carril (`qor1...` nativo, `0x...` EVM, clave SVM) y las claves públicas. Solo se muestra información pública; nada secreto sale de la bóveda.

Cómo usarlo: abre **Inspector de cuenta** y toca **Mostrar direcciones y claves públicas** (QoreX puede pedirte que desbloquees).

### Inspector PQC

Muestra la clave ML-DSA-87 registrada en la cadena para tu cuenta: el algoritmo, la altura en que se registró, el SHA-256 de la clave pública, su tamaño, si las reglas de la cadena todavía la aceptan y su prueba de posesión. Después puede comparar esa clave con la de este dispositivo y decir si coinciden (clave canónica, una derivación anterior o una rotación numerada). También tiene una tabla **Qué protege una operación**: para un envío nativo, una transacción EVM, una transacción SVM, un envío IBC y un envío en una cadena externa, qué firma es poscuántica y cuál es clásica.

Cómo usarlo: abre **Inspector PQC** para leer la clave en la cadena y toca **Comparar con la clave de este dispositivo** para ejecutar la comparación. Si la cadena rechaza la clave registrada, la pantalla dice que hay que registrarla de nuevo.

### Inspector de ventana EVM

Muestra si hay una ventana EVM activa para tu cuenta, las alturas y horas aproximadas en que se abrió y caduca, cuántas transacciones y cuánto valor se han usado y quedan, y qué permite (solo transferencias de QOR, o llamadas y transferencias; los destinatarios y contratos permitidos). Abrir y cerrar una ventana se hace en la pantalla de la ventana EVM, no aquí. Consulta [Seguridad y recuperación](/qorex/security-and-recovery#evm-window).

Cómo usarlo: abre **Inspector de ventana EVM**. Si dice que una ventana "no se pudo leer", eso no es lo mismo que no tener ninguna.

## Transacciones {#transactions}

Mainnet y testnet, salvo que una herramienta indique lo contrario.

### Inspector de transacciones

Pega un hash de transacción (de QoreChain, o EVM con `0x`) o una solicitud en bruto: un JSON de SignDoc, un TxRaw en base64, un JSON de transacción EVM o una solicitud de dApp. QoreX decodifica cada mensaje, muestra quién firma, quién recibe, los fondos que se mueven, la comisión, el memo y los permisos solicitados, y dice si la firma poscuántica va adjunta. Para una transacción que ya está en la red también muestra el resultado, el gas usado y los eventos. Un tipo de mensaje que QoreX no puede leer se muestra como desconocido con sus bytes en bruto; QoreX no adivina. Las solicitudes se leen en tu dispositivo y nunca se envían.

Cómo usarlo: abre **Inspector de transacciones**, pega y toca **Inspeccionar**.

### Banco de simulación

Pega mensajes de QoreChain en JSON, o una transacción EVM, y QoreX pregunta a la red qué haría. No se firma ni se envía nada. Ves si tendría éxito, el gas que usaría y la comisión, la comisión única de registro de la clave poscuántica si corresponde, los cambios de activos en tu cuenta y una lista de lo que la simulación no puede mostrar (por ejemplo, el estado propio de un contrato, o pasos entre VM que se ejecutan en un bloque posterior). El **Decodificador de errores** integrado traduce los errores de red a lenguaje claro, con una sugerencia sobre qué hacer: pega un registro en bruto, un JSON de resultado o un mensaje de error y toca **Decodificar**.

Cómo usarlo: abre **Banco de simulación**, elige **Mensajes de QoreChain** o **Transacción EVM**, pega y toca **Simular**.

### Comisiones y patrocinio

Muestra el precio mínimo de gas de la cadena, lo que QoreX paga por gas, el coste de las acciones habituales (enviar, hacer staking, abrir una ventana EVM, envío IBC), si la próxima transacción también paga el registro único de la clave, y las asignaciones de comisiones que has recibido y concedido, con un veredicto para cada una: si pagaría, o por qué se rechaza (caducada, agotada, tipo de mensaje incorrecto). QoreX paga sus propias comisiones y nunca designa por sí mismo a un pagador de comisiones.

Cómo usarlo: abre **Comisiones y patrocinio**; lee al abrirse.

### Espacio de trabajo de testnet

Herramientas para construir en la testnet, que nunca tocan mainnet:

- **Cuentas solo para testnet.** Una cuenta creada a partir de tu frase de recuperación que QoreX nunca permite firmar en mainnet y que oculta mientras mainnet está activa. Toca **Crear una cuenta solo para testnet**.
- **Faucet.** Copia tu dirección de testnet y toca **Abrir el faucet de testnet**. El faucet está en el dashboard y para usarlo inicias sesión allí. Consulta [Funciones de testnet](/qorex/testnet-features#get-test-qor).
- **Restablecer conexiones.** **Restablecer todas las conexiones** desconecta todos los sitios, rechaza todas las solicitudes que aún esperan y olvida los contratos para los que los sitios te hicieron firmar recientemente. Tócalo dos veces para confirmar.

Disponibilidad: la pantalla se abre en ambas redes; las cuentas solo para testnet y el faucet son para la testnet.

### Registro de solicitudes

Enumera lo que pidieron los sitios, lo que decidiste y lo que respondió la red. Se guarda solo en tu dispositivo, y solo mientras el modo desarrollador está activado, durante un máximo de 500 entradas y 7 días. Nunca registra tu frase de recuperación, claves ni contraseñas, ni lo que se firmó (solo su tipo y un hash). Puedes conservarlo después de cerrar el navegador, borrarlo o **Exportar un archivo de depuración** para adjuntarlo a un informe de error; antes de escribir el archivo se comprueba que no contenga frases ni claves.

Cómo usarlo: abre **Registro de solicitudes**. Activa primero el modo desarrollador; si no, no se registra nada.

## Contratos y rollups {#contracts}

### Interacción con contratos

Llama a contratos EVM, CosmWasm (QoreChain Native) y SVM con tu propia cuenta. Las lecturas son gratuitas; todo lo que cambia el estado pasa por la misma aprobación que una solicitud de dApp, que lo simula y añade la firma poscuántica.

Cómo usarlo:

1. Abre **Interacción con contratos** y elige el **Contract type** (tipo de contrato).
2. EVM: introduce la dirección del contrato y carga su **ABI (JSON)**. Cada función se convierte en un formulario tipado, etiquetado como de lectura, de escritura o pagable. QoreX rechaza un valor para una función que no puede recibir QOR.
3. CosmWasm: introduce la dirección del contrato, carga opcionalmente un esquema de `cosmwasm-schema`, escribe el **Message (JSON)** y, si hace falta, los fondos (escritos como `1000uqor`). Usa **Query** para leer, o **Review execute** para ver exactamente lo que se firmará.
4. SVM (solo testnet): introduce el id del programa y carga un **Anchor IDL (JSON)**. QoreX firma la transacción de Solana con tu propia clave de Solana y la retransmite con tu cuenta de QoreChain.
5. Toca **Simular** para ver qué dice la red que haría la llamada, luego **Review and sign** (o **Continue to approval**) y aprueba en la ventana de aprobación.

Puedes guardar contratos por red, exportarlos como archivo e importarlos de nuevo. Un panel **Contract info** muestra el id de código, el creador, la etiqueta y el administrador de un contrato CosmWasm.

### Aprobación de despliegues

Aprueba un despliegue que preparó tu herramienta de línea de comandos, tu IDE o tu agente. QoreX calcula por sí mismo el hash del código, decodifica los argumentos del constructor y comprueba quién puede actualizar el contrato antes de que se firme nada. Lo rechaza si el hash declarado por la herramienta no coincide con los bytes. Advierte de patrones de proxy actualizable, de una autoridad de administración o actualización que no sea tu cuenta, y de un contrato sin administrador que nunca podrá migrarse. Admite despliegues de contratos EVM y contratos CosmWasm instanciados a partir de un código ya almacenado. QoreX no sube código CosmWasm, y el despliegue de programas SVM no se admite en esta versión. Las subidas de código en una red que las tramita por gobernanza no se pueden firmar desde una wallet.

Cómo usarlo: abre **Aprobación de despliegues**, pega el JSON de la solicitud de despliegue de tu herramienta (toca **Show the format** para verlo), toca **Comprobar**, lee la revisión y luego **Approve and sign**.

### Perfiles de rollup y appchain

Añade un rollup o una appchain construidos con el QoreChain RDK. QoreX consulta en vivo a su nodo antes de guardar el perfil y muestra cada comprobación: chain id de REST y RPC, prefijo de dirección, chain id EVM y el rollup en QoreChain. Un perfil puede liquidar en mainnet o en testnet. Mientras un perfil está activo, cada pantalla de revisión pregunta qué red firma, y se rechaza firmar para un nodo que no confirma su chain id.

Cómo usarlo: abre **Perfiles de rollup y appchain**, toca **Añadir un perfil**, rellena el nombre, el chain id y los endpoints y luego **Comprobar y añadir**. Usa **Activar** o **Dejar de usar** para cambiar, y **Comprobar de nuevo** en cualquier momento.

## Otras máquinas virtuales {#other-vms}

### Solana en QoreChain (solo testnet)

El carril SVM de la **testnet** de QoreChain: ventanas SVM y retransmisión de una transacción de Solana firmada. Esta herramienta solo se muestra mientras la testnet está activa; en mainnet el carril SVM no está abierto y nada de esto se puede usar. Los detalles y los pasos están en [Funciones de testnet](/qorex/testnet-features#solana-on-qorechain).

### Llamada entre VM

Compón una llamada desde tu cuenta a un contrato en otro carril de ejecución de la propia QoreChain (EVM, CosmWasm o SVM). Nada sale de QoreChain: esto no es un bridge a otra cadena. El formulario pide el carril de destino, el contrato o programa, la carga útil y, solo para CosmWasm, los QOR que se adjuntan.

Eliges **Cuándo se ejecuta**, y QoreX lo dice con claridad:

- **Ahora, dentro de esta transacción (atómica):** ocurre todo o nada.
- **En cola para un bloque posterior (no atómica):** se ejecuta en un bloque posterior. Si falla o agota el tiempo, lo que hizo esta transacción se mantiene.

Cómo usarlo: abre **Llamada entre VM**, rellena el formulario, toca **Simular** para ver los pasos y la comisión y luego **Firmar y enviar**. QoreX solo firma llamadas que ha simulado. Si la red tiene desactivadas las llamadas entre VM, la pantalla lo dice y no ofrece nada para firmar. Hoy en mainnet las llamadas entre VM están cerradas, así que espera ver ese mensaje allí.

### Seguir una llamada entre VM

Pega el hash de una transacción (de QoreChain, o `0x` para EVM) y QoreX lee sus tramos entre VM. Un tramo en cola se muestra como pendiente, ejecutado, fallido o con el tiempo agotado. Los tramos de una transacción EVM se ejecutaron dentro de la propia transacción y se leen de su resultado. La red elimina al cabo de un tiempo los registros en cola ya finalizados, y el seguimiento lo indica cuando el registro ya no está.

Cómo usarlo: abre **Seguir una llamada entre VM**, pega el hash y toca **Seguir**.

## Firma y agentes {#signing-and-agents}

### Permisos y sesiones

Enumera todo lo que tu cuenta ha permitido hacer a otras direcciones, con los límites que la propia cadena hace cumplir, y te permite revocar cada elemento: **Autorizaciones**, **Asignaciones de comisiones**, **Claves vinculadas** y **Ventanas de acceso**. Cada uno muestra lo que puede hacer, su límite y cuándo caduca (o que nunca caduca). **Revocar** envía la transacción de revocación; **Cerrar ventana** cierra una ventana EVM.

También puedes dar a una app o a otra dirección una sesión limitada con **Nueva sesión**: llamar solo a los contratos enumerados, enviar hasta una cantidad fijada, hacer staking con los validadores elegidos, o votar y reclamar recompensas, durante un número de días, pagando opcionalmente sus comisiones hasta un límite. Una **Vista previa** dice exactamente qué podrá hacer el beneficiario y enumera por separado lo que la cadena no hace cumplir, sobre lo cual QoreX te preguntará cada vez.

### Espacio de trabajo offline y multifirma {#multisig}

Prepara cualquier transacción como un archivo en el formato de línea de comandos de la cadena, comprueba cada firma de un archivo multifirma, o firma en un dispositivo y difunde desde otro.

- **Firma offline:** prepara una transacción en un dispositivo conectado (parte de una plantilla como Send, Delegate o Call a contract, o pega los mensajes), lleva el archivo o el código QR al QoreX que tiene la clave, revísalo, **Firmar** y luego **Enviar a la red** desde cualquiera de los dos dispositivos.
- **Comprobar firmas:** abre la transacción y los archivos de firma que haya. Para cada miembro de la multifirma, QoreX muestra si tiene registrada una clave poscuántica y si la ronda 1 (poscuántica) y la ronda 2 (clásica) son válidas, obsoletas, no válidas o faltan, y qué ronda sigue faltando.

La revisión siempre muestra el memo y cada moneda de comisión, y QoreX firma solo los bytes que revisaste. Rechaza una comisión en una moneda distinta de QOR, una comisión muy por encima del precio de gas alto de la red y una comisión pagada o concedida por otra cuenta. Si el archivo cambia después de tu revisión, debes abrirlo y revisarlo de nuevo. QoreX no difundirá una transacción sin su firma ML-DSA-87.

## Agentes de IA {#ai-agents}

Los agentes de IA (tu propio asistente de IA o una herramienta que ejecutes) pueden leer las cuentas que elijas y **proponer** una transacción. No pueden firmar. El modelo es este:

1. Tú decides qué cuentas puede ver un agente y para cuáles puede proponer. Puedes pausar o revocar un agente en cualquier momento, y la lista **Actividad** muestra lo que hizo.
2. QoreX comprueba cada propuesta y la simula en la red. Una propuesta que QoreX no puede leer, o que según la red fallaría, no se te muestra.
3. Ves la propuesta en la ventana de aprobación normal, marcada como propuesta por un agente de IA y no por un sitio web, y la apruebas o la rechazas. No se firma nada hasta que apruebes.

QoreX nunca firma los tipos de solicitud que ningún tercero puede pedir, los proponga quien los proponga. Un límite de propuestas por hora detiene las avalanchas, y solo espera una propuesta a la vez.

Cómo usarlo:

- **App móvil:** activa el modo desarrollador, abre **Agentes de IA** y pega el JSON de la propuesta de tu agente y toca **Revisar propuesta**, o abre un enlace `qorex://propose`. QoreX no puede comprobar quién escribió una propuesta pegada o un enlace, y lo dice. Revísala y apruébala o recházala.
- **Extensión de navegador (Chrome, Edge, Brave, Firefox):** un agente se conecta a través de un programa complementario en tu ordenador que usa el Model Context Protocol. Ese programa todavía no se ha publicado, así que el lado de la extensión aún no puede usarlo el público. Cuando se publique, activas **Permitir conexiones de agentes de IA en este ordenador**, emparejas el agente con un código de un solo uso que caduca en 5 minutos y eliges sus cuentas.
- **Safari:** no disponible. Safari no puede conectar QoreX con programas de tu ordenador.

## Límites {#limits}

- El modo desarrollador es para quienes construyen. Si solo envías, recibes y haces staking, no lo necesitas.
- Una herramienta que depende de la red (los inspectores, el simulador, los seguimientos) dice "no se pudo leer" cuando no se puede contactar con la red. Eso no es lo mismo que no haya nada.
- Las herramientas SVM y el compositor entre VM dependen de lo que permita la red. Hoy en mainnet las llamadas SVM y entre VM están cerradas.
- En la extensión de navegador hay que tocar el número de versión para mostrar el interruptor; la app lo tiene en Ajustes.
