---
slug: /dashboard/tools-hub
title: Centro de Herramientas
sidebar_label: Centro de Herramientas
sidebar_position: 11
---

# Centro de Herramientas

La página **Tools** reúne en un solo lugar las herramientas de operador y de desarrollador de QoreChain, organizadas en siete pestañas, en este orden: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** y **SDK**. La pestaña **Information** es una visión general de solo lectura de los programas de validadores y de light nodes: las tres formas de participar (validador de génesis, light node, delegador), los niveles de licencia, nociones básicas de staking y slashing, requisitos de hardware, quién opera el programa y una FAQ. Las demás pestañas se resumen a continuación con un enlace a la documentación completa. La página Tools sigue el selector de red del encabezado, porque las compilaciones publicadas pueden diferir entre redes.

Inicia sesión para usar las herramientas que registran inscripciones o envían solicitudes; consulta [Iniciar sesión](/dashboard/overview#sign-in).

## Light Node

Ejecutar un light node y unirse a su programa de recompensas son dos cosas distintas, y la pestaña Light Node las mantiene separadas en lugar de presentar un único flujo de inscripción:

1. **Consigue el software — funciona hoy.** No se necesita licencia, ni verificación on-chain, ni aprobación; esto se muestra primero sin importar tu estado de licencia. La pestaña lee el manifiesto en vivo de la red y te da comandos listos para copiar para un nodo completo de QoreChain (descargar y verificar el binario, inicializar el nodo con el génesis, apuntarlo a los pares de la red y sincronizar por estado en lugar de sincronizar desde el génesis). Un light node en sí solo necesita el binario `lightnode-sx` o `lightnode-ux`; consulta [Visión General de Light Node](/light-node/overview). Debajo de los comandos, **Download the light node** enumera las compilaciones publicadas con sus checksums sha256: una **Desktop edition** (incluye el panel web) y una **Server edition** (sin interfaz, línea de comandos) para seis plataformas; comprueba el archivo contra su checksum antes de ejecutarlo. Si no hay ninguna compilación publicada para la red seleccionada, el panel lo indica.
2. **Verifica los requisitos de la cadena — Light node status.** Este panel lee los parámetros en vivo de la cadena (son parámetros de gobernanza y pueden cambiar sin que se edite esta página): el stake delegado requerido — tu total en todos los validadores a los que delegas, no por validador (actualmente 1,000 QOR) —, la tarifa de registro (actualmente 1 QOR), el tiempo de actividad necesario para recibir recompensas, con qué frecuencia se espera un heartbeat (y la tolerancia permitida) y el número máximo de light nodes. Opcionalmente puedes introducir una dirección de operador para ver si hay un light node registrado en ella, si informa a tiempo y sus recompensas acumuladas.
3. **La inscripción en las recompensas todavía no está abierta.** Unirse al reparto de recompensas del light node requiere una licencia `lightnode_operator` activa concedida on-chain, el stake delegado mínimo y la tarifa de registro. La inscripción en sí no está abierta (consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status)), y comprar una licencia no la abre antes de tiempo, así que hoy no hay nada que inscribir; mientras tanto, ejecuta y sincroniza tu nodo. El tiempo de actividad se cuenta desde el bloque en que tu nodo se registra on-chain, no antes.
4. **Registro del formulario.** Si tu cuenta tiene una licencia registrada como activa, esta pestaña también muestra un formulario breve — dirección de operador (`qor1…`), moniker, URL del endpoint público y una confirmación del compromiso de stake — y después un resumen de lo que enviaste. Ese formulario registra tu solicitud de registro con The Qore Trust en el Dashboard; **no** envía la transacción de registro on-chain y no consulta la cadena. El registro on-chain se realiza desde el propio nodo con `lightnode-sx register` (consulta [Registro y Licencias](/light-node/registration-and-licensing)) y solo tiene éxito cuando la cadena muestra una concesión activa, el stake ya está bloqueado desde tu dirección de operador y la inscripción está abierta.

Para el panorama completo, consulta [Visión General de Light Node](/light-node/overview) y [Registro y Licencias](/light-node/registration-and-licensing).

## Node Registration

La pestaña Node Registration registra un validador con The Qore Trust en el Dashboard. No crea por sí misma el validador on-chain; eso se hace desde tu propio nodo (pasos 1 y 5 a continuación). Requisitos previos y pasos:

1. **Registra tu clave PQC primero — desde la CLI, en tu propio nodo validador.** Un validador debe ejecutar él mismo el registro de la clave PQC — no ocurre automáticamente — antes de solicitar o usar una licencia y antes de crear el validador. Consulta [Ejecutar un Validador](/developer-guide/running-a-validator#pqc-key-registration) para el comando de la CLI.
2. **Confirma que estás licenciado.** El formulario necesita una licencia de validador registrada como activa en tu cuenta. Es la **cadena** la que decide si `create-validator` se acepta, y exige la concesión de operador on-chain: una licencia comprada mediante **Buy License** se registra en nuestro lado, y la concesión on-chain es un paso manual separado que viene después. Consulta **Validator Readiness** (en la pestaña Validator Application) para ver qué reconoce actualmente la cadena. Si aún no estás licenciado, esta pestaña enlaza a **Buy License** — las licencias de validador requieren primero una [Solicitud de Validador](#validator-application) aprobada.
3. **Completa el formulario de registro.** Indica tu dirección de validador o clave pública de consenso, un moniker, una tasa de comisión (dentro del rango permitido por tu licencia) y un endpoint público opcional. Si tus licencias incluyen cadenas cross-network, selecciona a cuáles de ellas dará servicio este validador.
4. **Confirma el requisito de auto-stake.** El piso de auto-stake del validador es un valor fijo de 100,000 QOR — una constante a nivel de protocolo, no un ajuste configurable — sujeto a un período de unbonding, con penalización por downtime o double-signing. Confírmalo y luego envía para registrarte.
5. **Sincroniza y crea el validador.** Registrarte aquí guarda tu validador; tú mismo debes llevar tu nodo hasta el punto actual de la cadena y enviar `create-validator`, co-firmado de forma híbrida con PQC como toda transacción de QoreChain — la clave del paso 1 es lo que hace válida esa firma.
6. **Confirma y bloquea el stake.** Un panel de resumen muestra el registro (moniker, dirección de validador, comisión, intención de auto-stake, cadenas cross-network, estado) y te pide bloquear tu auto-stake para entrar al conjunto de validadores activos. El bloqueo en sí se hace en tu nodo con la transacción co-firmada poscuántica, no en el Dashboard.

El staking y la creación de validadores solo ocurren en el carril de transacciones nativo de QoreChain — no hay ninguna vía para registrar o bloquear un validador a través de una wallet EVM vinculada como MetaMask.

Consulta [Ejecutar un Validador](/developer-guide/running-a-validator) y [Staking y Validadores](/dashboard/staking-and-validators).

## Rollups

Solicita un rollup impulsado por QoreChain. El formulario te permite nombrar el rollup e indicar la máquina virtual (EVM, CosmWasm o SVM), la capa de disponibilidad de datos, el token de gas, el modelo de secuenciador y el objetivo de settlement que quieres. Al enviarlo se registra una solicitud de aprovisionamiento que The Qore Trust revisa; no crea el rollup on-chain. Las opciones son más amplias de lo que el módulo de rollups on-chain admite actualmente. Para registrar tú mismo un rollup on-chain, consulta [Desplegar un Rollup](/rollups/deploying-a-rollup); para los conceptos, consulta [Visión General de Rollups](/rollups/overview).

## SDK

Un centro de inicio rápido y referencia para construir sobre QoreChain en código. La sección muestra pasos de instalación y fragmentos listos para copiar para conectar, derivar cuentas en los tres runtimes, leer el estado, enviar transferencias y firmar de forma segura frente a computación cuántica, además de una tabla de paquetes por lenguaje y enlaces al repositorio, ejemplos y explorador. Consulta [Visión General del SDK de QoreChain](/sdk/overview) e [Instalación](/sdk/install).

## Solicitud de Validador {#validator-application}

Postúlate para convertirte en Validador de Génesis:

1. **Ingresa los datos de tu entidad.** Nombre legal de la entidad, país/jurisdicción y un correo de contacto.
2. **Elige el nivel deseado.** Selecciona del catálogo de niveles de validador (cada nivel enumera su número de plazas y su conjunto de funciones) — este es el nivel que pretendes licenciar una vez aprobado, no una compra todavía.
3. **Describe tu infraestructura.** Tu región de infraestructura y los detalles de hardware/centro de datos.
4. **Explica tu motivación.** Una breve declaración sobre la experiencia de tu equipo en validadores/infraestructura y por qué quieres operar un Validador de Génesis de QoreChain.
5. **Confirma el cumplimiento normativo y envía.** Confirma que se requiere verificación KYC/AML de la entidad solicitante y de sus beneficiarios finales antes de que se conceda una licencia, y luego envía.
6. **Sigue el estado de tu solicitud.** La pestaña muestra tu solicitud como en revisión, aprobada o no aprobada con un motivo (con la opción de revisar y reenviar). Una vez que tu solicitud está pendiente o aprobada, un panel en vivo de **Validator Readiness** verifica tres cosas directamente contra la cadena, no contra lo que has comprado: el registro de tu clave PQC, tu auto-bond (un valor fijo de 100,000 QOR — solo saldo disponible para gastar, los fondos en vesting no cuentan) y si tu licencia de operador realmente se ha concedido on-chain y es válida en este momento (no suspendida y no vencida — las licencias caducan en una altura de bloque, y si no se puede leer la punta de la cadena, una licencia que está por caducar se reporta como *no se pudo verificar* en lugar de como válida). Cada verificación reporta uno de tres estados — cumplido, aún no cumplido, o *no se pudo verificar* cuando no se puede contactar la cadena — y una lectura fallida nunca se muestra como "no tienes esto", ya que eso te enviaría a rehacer algo que ya tienes. Una vez aprobado, puedes proceder a **Buy License** para adquirir una licencia de validador.

Consulta [Ejecutar un Validador](/developer-guide/running-a-validator).

## Buy License

Adquiere las licencias necesarias para operar infraestructura de red:

1. **Ingresa la dirección a licenciar.** El campo **QoreChain address** de la parte superior es obligatorio en cada compra: escribe la dirección `qor1…` a la que se debe conceder la licencia on-chain. Usa una dirección que controles y que vayas a conservar — la concesión queda vinculada a ella, y cambiarla después requiere soporte. No se puede pedir una licencia sin ella.
2. **Elige una red de pago.** En **Pay with USDT on:** selecciona ERC-20, BEP-20 o TRC-20.
3. **Elige qué comprar.** Una licencia de light node está disponible para cualquiera. Las licencias de validador (en todo el catálogo de niveles) se desbloquean solo cuando tu [Solicitud de Validador](#validator-application) está aprobada. Los complementos cross-network extienden una licencia de validador a cadenas adicionales, con precio por cadena por año — selecciona las cadenas que quieras y luego compra.
4. **Completa el pago.** Cada compra te lleva a un paso de pago que confirma el monto y la red, y verifica el pago on-chain antes de que la licencia se registre como pagada.
5. **Espera la concesión on-chain y luego regístrate.** Tras el pago, la licencia muestra **Paid — awaiting on-chain grant**. Las concesiones se emiten a mano, por lotes, por lo que no son instantáneas. El estado cambia a **Active** solo después de que la propia cadena confirme la concesión. El registro en la cadena verifica la cadena, no nuestros registros, así que registrarte antes de que la concesión se produzca será rechazado. Cuando la insignia muestre **Active**, vuelve a **Light Node** o **Node Registration** para el registro correspondiente.

:::note Licencias compradas antes de que la dirección fuera obligatoria
Si compraste una licencia antes de que se recogiera la dirección, la pestaña Buy License se abre con **This licence needs a QoreChain address** — introduce la dirección y selecciona **Save address**. Hasta que se guarde, la licencia no puede concederse.
:::

Para saber cómo funciona el licenciamiento en toda la red, consulta [Licenciamiento de la Cadena](/architecture/chain-licensing).
