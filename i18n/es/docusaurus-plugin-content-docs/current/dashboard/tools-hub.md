---
slug: /dashboard/tools-hub
title: Centro de Herramientas
sidebar_label: Centro de Herramientas
sidebar_position: 11
---

# Centro de Herramientas

La página **Tools** reúne en un solo lugar las herramientas de operador y de desarrollador de QoreChain, en seis pestañas, en este orden: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** y **SDK**. La página sigue el selector de red del encabezado: las comprobaciones de la cadena, las descargas y el estado de los nodos se leen de la red que hayas seleccionado. Las licencias se venden **solo en mainnet** (consulta [Light Node](#light-node)).

Inicia sesión para usar las herramientas que registran inscripciones, envían solicitudes o cobran pagos; consulta [Iniciar sesión](/dashboard/overview#sign-in).

## Validator Program

Una visión general de solo lectura del **QoreChain Validator Program**, la vía por la que los validadores se unen a la red: lo que ofrece el programa (la concesión de operador on-chain, delegación desde stake controlado por la Association y un estipendio en QOR para operadores independientes que cumplan los niveles de servicio), lo que exige, el proceso de selección y una FAQ. Los parámetros de protocolo de esta pestaña (tiempo de unbonding, slashing, número máximo de validadores) se leen en vivo de la cadena; las reglas del programa (el auto-stake de 100,000 QOR, la banda de comisión, el estipendio) son de la Association y están marcadas como tales. Los validadores no compran ningún paquete: presentan su solicitud y pagan una **tarifa de programa de $1,000** solo una vez seleccionados.

## Solicitud de Validador {#validator-application}

Presenta tu solicitud al Validator Program:

1. **Completa la solicitud.** Nombre de la entidad, jurisdicción y correo de contacto; la **dirección de operador** (`qor1…`, la cuenta desde la que ejecutarás `create-validator`: la concesión de operador on-chain se emite a esta dirección); proveedor de hosting, región y tipo; las redes que ya operas; opcionalmente tu dirección de validador de testnet y la infraestructura pública que ofreces (RPC público, snapshots, archivo); el track (estándar, o global para las plazas reservadas); y la aceptación de los términos del programa. Presentar la solicitud es gratis.
2. **Revisión y prueba en testnet.** La solicitud se muestra como **Submitted** mientras se revisa. Las solicitudes que avanzan ejecutan un validador en la testnet diana durante una prueba de 14 días, mostrada como **Testnet trial**.
3. **Selección y tarifa del programa.** Una solicitud seleccionada muestra **Selected** con un botón **Pay $1,000**. El paso de pago funciona igual que para una licencia de light node (USDT en ERC-20, BEP-20 o TRC-20, verificado on-chain). La tarifa está ligada a la dirección de operador de tu solicitud; no se puede pagar para otra dirección. La aprobación y el pago siempre se muestran por separado: una solicitud puede estar seleccionada y aún sin pagar.
4. **La concesión de operador on-chain.** Tras el pago, la Association emite la concesión `validator_operator` on-chain a tu dirección de operador. Las concesiones se firman a mano, por lotes, por lo que no son instantáneas. La pestaña muestra **Operator grant on chain** en cuanto la cadena la tiene, e **In the active set** una vez que tu validador está bloqueado (bonded).

Desde el momento en que se recibe una solicitud, un panel **Validator Readiness** comprueba la cadena directamente para la dirección de operador: una clave poscuántica registrada, suficiente QOR disponible para el auto-stake, la concesión de operador y si el validador está bloqueado (bonded). Realiza pronto el [registro de la clave PQC](/developer-guide/running-a-validator#pqc-key-registration) en tu propio nodo: nadie registra esa clave por ti.

Las solicitudes aprobadas bajo la oferta de validadores anterior (antes de octubre de 2026) se muestran como **Earlier application**; la Association se pone en contacto directamente con esos solicitantes.

## Light Node {#light-node}

Todo lo que necesita un operador de light node, desde la licencia hasta un nodo registrado on-chain.

1. **Compra la licencia (mainnet).** Una licencia de light node cuesta **$50**, pagada en USDT en ERC-20, BEP-20 o TRC-20 y verificada on-chain. Antes de pagar, introduce la dirección `qor1…` a la que se debe conceder la licencia; usa una cuenta cuyas palabras de recuperación tengas (tus propias palabras, Keplr o `qorechaind`), idealmente una que se use solo para el nodo. Con el encabezado en **testnet** no hay nada a la venta: las licencias de light node de testnet son gratuitas y las concede el equipo de QoreChain.
2. **Espera la concesión on-chain.** Tras el pago, la licencia muestra **Paid, awaiting on-chain grant**; cambia a **Active on chain** solo cuando la cadena confirma la concesión `lightnode_operator`. Las concesiones se firman a mano, por lotes.
3. **Instala y registra el nodo.** La pestaña enumera las compilaciones publicadas para tu red con sus checksums (edición de servidor `lightnode-sx`, edición de escritorio `lightnode-ux`, en Linux, macOS y Windows) y los pasos para la versión actual: establecer una contraseña para el keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (añade la cuenta para la que es la licencia), `lightnode-sx register` (adjunta la clave poscuántica del nodo y lo registra, añadiendo `--delegate-to <qorvaloper…>` si a la dirección le falta el stake requerido), y luego `lightnode-sx start` y `lightnode-sx status`. Los pasos se muestran como vigentes solo cuando el manifiesto de versiones de la red publica una compilación que los admite, y la pestaña indica si el registro está abierto en esa red.
4. **Avisos sobre tu dirección.** La pestaña avisa cuando la dirección de la licencia es una de tus propias wallets custodiales del Dashboard (el Dashboard guarda esa clave, así que un nodo no puede firmar con ella), e indica cuando la dirección ya tiene una clave poscuántica on-chain (el nodo la reutiliza si se derivó de tus palabras de recuperación y, si no, se niega y recomienda una cuenta dedicada).
5. **Estado.** Un panel lee la cadena: los requisitos vigentes (tarifa de registro, stake delegado, tiempo de actividad, ventana de heartbeat, número máximo de light nodes) y, para una dirección, si hay un light node registrado y si informa a tiempo.

Consulta [Visión General de Light Node](/light-node/overview) y [Registro y Licencias](/light-node/registration-and-licensing).

:::note Licencias compradas antes de que la dirección fuera obligatoria
Si compraste una licencia antes de que se recogiera la dirección, la pestaña se abre con **This licence needs a QoreChain address**: introduce la dirección y selecciona **Save address**. Hasta que se guarde, la licencia no puede concederse.
:::

## Node Registration

Registra los datos de tu validador ante la Association. No crea el validador on-chain; eso lo haces desde tu propio nodo con `create-validator`.

El formulario se abre cuando la cadena muestra una concesión `validator_operator` activa para tu dirección de operador y tienes una solicitud seleccionada del Validator Program (o una licencia de validador anterior al programa). Indica tu dirección de operador de validador, un moniker, una tasa de comisión entre el 5% y el 20% y un endpoint público opcional, y luego confirma el auto-stake de 100,000 QOR, el período de unbonding de 21 días y el slashing.

Los pasos on-chain están en [Ejecutar un Validador](/developer-guide/running-a-validator): registra tu clave PQC y luego envía `create-validator` con al menos 100,000 QOR de auto-stake, co-firmado con PQC como toda transacción de QoreChain. El staking y la creación de validadores solo ocurren en el carril de transacciones nativo de QoreChain; no hay ninguna vía para registrar o bloquear un validador a través de una wallet EVM vinculada como MetaMask. Debajo del formulario, la pestaña también enumera lo que necesita un nodo completo (binario de la versión, génesis, pares), tomado del manifiesto de versiones de la red.

Consulta [Staking y Validadores](/dashboard/staking-and-validators).

## Rollups

Solicita un rollup impulsado por QoreChain. El formulario te permite nombrar el rollup e indicar la máquina virtual (EVM, CosmWasm o SVM), la capa de disponibilidad de datos, el token de gas, el modelo de secuenciador y el objetivo de settlement que quieres. Al enviarlo se registra una solicitud de aprovisionamiento que se revisa; no crea el rollup on-chain. Las opciones son más amplias de lo que el módulo de rollups on-chain admite actualmente. Para registrar tú mismo un rollup on-chain, consulta [Desplegar un Rollup](/rollups/deploying-a-rollup); para los conceptos, consulta [Visión General de Rollups](/rollups/overview).

## SDK

Un centro de inicio rápido y referencia para construir sobre QoreChain en código. La sección muestra pasos de instalación y fragmentos listos para copiar para conectar, derivar cuentas en los tres runtimes, leer el estado, enviar transferencias y firmar de forma segura frente a computación cuántica, además de una tabla de paquetes por lenguaje y enlaces al repositorio, ejemplos y explorador. Consulta [Visión General del SDK de QoreChain](/sdk/overview) e [Instalación](/sdk/install).

Para saber cómo funciona el licenciamiento en toda la red, consulta [Licenciamiento de la Cadena](/architecture/chain-licensing).
