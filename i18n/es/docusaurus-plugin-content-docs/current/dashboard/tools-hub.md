---
slug: /dashboard/tools-hub
title: Centro de Herramientas
sidebar_label: Centro de Herramientas
sidebar_position: 11
---

# Centro de Herramientas

La página **Tools** reúne en un solo lugar las herramientas de operador y de desarrollador de QoreChain, organizadas en pestañas. Desde aquí puedes registrar infraestructura, desplegar un rollup, acceder al SDK, postularte para ser validador y adquirir las licencias que estos roles requieren. Cada sección se resume a continuación con un enlace a la documentación completa.

Conecta tu wallet para usar las herramientas que registran infraestructura o envían solicitudes; consulta [Visión General y Primeros Pasos](/dashboard/overview#connect-your-wallet).

## Light Node

Ejecutar un light node y unirse a su programa de recompensas son dos cosas distintas, y la pestaña Light Node las mantiene separadas en lugar de presentar un único flujo de inscripción:

1. **Pon tu nodo en marcha — funciona hoy.** No se necesita licencia, ni verificación on-chain, ni aprobación; esto se muestra primero sin importar tu estado de licencia. Lee el manifiesto en vivo de la red y te da comandos listos para copiar con los que descargar y verificar el binario, inicializar el nodo con el génesis, apuntarlo a los pares de la red y sincronizar por estado en lugar de sincronizar desde el génesis.
2. **Verifica el estado de tu programa de recompensas.** Unirse al reparto de recompensas del light node es un paso separado, condicionado on-chain: una licencia `lightnode_operator` activa concedida on-chain, una cantidad mínima de QOR delegada — tu total en todos los validadores a los que delegas, no por validador, leído en vivo desde staking — y una pequeña tarifa de registro on-chain. **La inscripción todavía no está abierta**, y comprar una licencia no la abre antes de tiempo, así que hoy no hay nada que inscribir; esta pestaña muestra el requisito como un estado a verificar, no como un formulario a enviar, hasta que se abra.
3. **Regístrate una vez que tu licencia esté concedida on-chain.** Una licencia comprada mediante **Buy License** se registra primero en nuestro lado — la concesión on-chain es un paso separado, y el registro se rechaza hasta que esa concesión se produzca (ver la nota sobre Buy License más abajo). Una vez que se ha producido, esta pestaña reemplaza el panel de estado por un formulario de registro: tu dirección de operador (`qor1…`), un moniker y una URL de endpoint público, además de una confirmación del compromiso de stake.
4. **Confirma y bloquea el stake.** Después de enviar, un panel de resumen confirma el registro (moniker, dirección de operador, endpoint, intención de stake, estado) y te pide bloquear el stake confirmado desde tu dirección de operador una vez que la elegibilidad se abra.

Para el panorama completo, consulta [Visión General de Light Node](/light-node/overview) y [Registro y Licencias](/light-node/registration-and-licensing).

## Node Registration

La pestaña Node Registration registra un nodo validador on-chain:

1. **Registra tu clave PQC primero — desde la CLI, en tu propio nodo validador.** Esto no es automático como sí lo es para la primera transacción de una cuenta normal: un validador debe ejecutar él mismo el registro de la clave PQC, antes de solicitar o usar una licencia y antes de crear el validador. Consulta [Ejecutar un Validador](/developer-guide/running-a-validator#pqc-key-registration) para el comando de la CLI.
2. **Confirma que estás licenciado.** Se requiere una licencia de validador activa antes de poder registrarte aquí. Una licencia comprada mediante **Buy License** se registra en nuestro lado; la concesión on-chain es un paso separado, y el registro se rechaza hasta que esa concesión se produzca. Si aún no estás licenciado, esta pestaña enlaza a **Buy License** — las licencias de validador requieren primero una [Solicitud de Validador](#validator-application) aprobada.
3. **Completa el formulario de registro.** Indica tu dirección de validador o clave pública de consenso, un moniker, una tasa de comisión (dentro del rango permitido por tu licencia) y un endpoint público opcional. Si tus licencias incluyen cadenas cross-network, selecciona a cuáles de ellas dará servicio este validador.
4. **Confirma el requisito de auto-stake.** El piso de auto-stake del validador es un valor fijo de 100.000 QOR — una constante a nivel de protocolo, no un ajuste configurable — sujeto a un período de unbonding, con penalización por downtime o double-signing. Confírmalo y luego envía para registrarte.
5. **Sincroniza y crea el validador.** Registrarte aquí guarda tu validador; tú mismo debes llevar tu nodo hasta el punto actual de la cadena y enviar `create-validator`, co-firmado de forma híbrida con PQC como toda transacción de QoreChain — la clave del paso 1 es lo que hace válida esa firma.
6. **Confirma y bloquea el stake.** Un panel de resumen muestra el registro (moniker, dirección de validador, comisión, intención de auto-stake, cadenas cross-network, estado) y te pide bloquear tu auto-stake para entrar al conjunto de validadores activos.

El staking y la creación de validadores solo ocurren en el carril de transacciones nativo de QoreChain — no hay ninguna vía para registrar o bloquear un validador a través de una wallet EVM vinculada como MetaMask.

Consulta [Ejecutar un Validador](/developer-guide/running-a-validator) y [Staking y Validadores](/dashboard/staking-and-validators).

## Rollups

Despliega tu propio rollup impulsado por QoreChain. El formulario de configuración te permite nombrar el rollup y elegir su máquina virtual (EVM, CosmWasm o SVM), la capa de disponibilidad de datos, el token de gas, el modelo de secuenciador y el objetivo de settlement. Después de enviarlo, el rollup se aprovisiona tras una revisión antes de entrar en producción. Consulta [Visión General de Rollups](/rollups/overview) y [Desplegar un Rollup](/rollups/deploying-a-rollup).

## SDK

Un centro de inicio rápido y referencia para construir sobre QoreChain en código. La sección muestra pasos de instalación y fragmentos listos para copiar para conectar, derivar cuentas en los tres runtimes, leer el estado, enviar transferencias y firmar de forma segura frente a computación cuántica, además de una tabla de paquetes por lenguaje y enlaces al repositorio, ejemplos y explorador. Consulta [Visión General del SDK de QoreChain](/sdk/overview) e [Instalación](/sdk/install).

## Solicitud de Validador {#validator-application}

Postúlate para convertirte en Validador de Génesis:

1. **Ingresa los datos de tu entidad.** Nombre legal de la entidad, país/jurisdicción y un correo de contacto.
2. **Elige el nivel deseado.** Selecciona del catálogo de niveles de validador (cada nivel enumera su número de plazas y su conjunto de funciones) — este es el nivel que pretendes licenciar una vez aprobado, no una compra todavía.
3. **Describe tu infraestructura.** Tu región de infraestructura y los detalles de hardware/centro de datos.
4. **Explica tu motivación.** Una breve declaración sobre la experiencia de tu equipo en validadores/infraestructura y por qué quieres operar un Validador de Génesis de QoreChain.
5. **Confirma el cumplimiento normativo y envía.** Confirma que se requiere verificación KYC/AML de la entidad solicitante y de sus beneficiarios finales antes de que se conceda una licencia, y luego envía.
6. **Sigue el estado de tu solicitud.** La pestaña muestra tu solicitud como en revisión, aprobada o no aprobada con un motivo (con la opción de revisar y reenviar). Una vez que tu solicitud está pendiente o aprobada, un panel en vivo de **Validator Readiness** verifica tres cosas directamente contra la cadena, no contra lo que has comprado: el registro de tu clave PQC, tu auto-bond (un valor fijo de 100.000 QOR — solo saldo disponible para gastar, los fondos en vesting no cuentan) y si tu licencia de operador realmente se ha concedido on-chain. Cada verificación reporta uno de tres estados — cumplido, aún no cumplido, o *no se pudo verificar* cuando no se puede contactar la cadena — y una lectura fallida nunca se muestra como "no tienes esto", ya que eso te enviaría a rehacer algo que ya tienes. Una vez aprobado, puedes proceder a **Buy License** para adquirir una licencia de validador.

Consulta [Ejecutar un Validador](/developer-guide/running-a-validator).

## Buy License

Adquiere las licencias necesarias para operar infraestructura de red:

1. **Ingresa la dirección a licenciar.** Proporciona la dirección `qor1…` a la que se debe conceder la licencia on-chain — usa la dirección con la que realmente operarás el nodo, ya que es la que la red verifica.
2. **Elige una red de pago.** Selecciona USDT en ERC-20, BEP-20 o TRC-20.
3. **Elige qué comprar.** Una licencia de light node está disponible para cualquiera. Las licencias de validador (en todo el catálogo de niveles) se desbloquean solo cuando tu [Solicitud de Validador](#validator-application) está aprobada. Los complementos cross-network extienden una licencia de validador a cadenas adicionales, con precio por cadena por año — selecciona las cadenas que quieras y luego compra.
4. **Completa el pago.** Cada compra te lleva a un paso de pago que confirma el monto y la red, y verifica el pago on-chain antes de que la licencia se marque como activa en nuestros registros.
5. **Espera la concesión on-chain y luego regístrate.** Una licencia mostrada como activa aquí se ha registrado en nuestro lado — la concesión que la hace reconocida on-chain es un paso separado. El registro verifica la cadena, no nuestros registros, así que registrarte antes de que la concesión se produzca será rechazado. Una vez confirmada la concesión, vuelve a **Light Node** o **Node Registration** para completar el registro on-chain correspondiente.

Para saber cómo funciona el licenciamiento en toda la red, consulta [Licenciamiento de la Cadena](/architecture/chain-licensing).
