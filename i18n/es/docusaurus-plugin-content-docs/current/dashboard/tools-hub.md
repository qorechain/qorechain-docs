---
slug: /dashboard/tools-hub
title: Nodes & Validators
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators

La página **Nodes & Validators** (barra lateral grupo **Build**, dirección `/tools`; se llamaba Tools y Tools Hub antes del 27 de octubre de 2026) es la página de operador del Dashboard. Tiene cinco pestañas, en este orden: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** y **Rollups**. Está pensada para quienes quieren ejecutar un validador o un light node, o solicitar un rollup de aplicación. La pestaña SDK pasó a la página pública [Developers](/dashboard/developers), que también contiene las herramientas para constructores (estado de la clave PQC, simulador, signing playground, QoreX test wallet).

## Innovaciones {#innovations}

- **Las comprobaciones de la cadena vienen de la cadena.** El panel **Validator Readiness** comprueba cuatro cosas en la red seleccionada: una clave ML-DSA-87 registrada, QOR disponible para el auto-stake (sin contar el vesting), la concesión de operador on-chain y si el validador está bloqueado (bonded). El panel **Light node status** lee los requisitos vigentes (tarifa de registro, stake delegado, tiempo de actividad, ventana de heartbeat, número máximo de light nodes) y el estado de registro y de heartbeat de la dirección.
- **"Pagada" y "concedida on-chain" son hechos distintos.** Una licencia pagada muestra **Paid, awaiting on-chain grant** hasta que la cadena confirma la concesión, y entonces **Active on chain**. La pestaña nunca muestra una licencia como activa antes de que la cadena tenga la concesión.
- **Las reglas del protocolo y las del programa están etiquetadas por separado.** Cada fila de parámetros indica si procede del protocolo (leído de la cadena) o del programa (aplicado por la Association).
- **Una licencia de light node de testnet de autoservicio.** Introduce una dirección `qor1...` en **Free testnet licence** y selecciona **Request licence**; la concesión se firma automáticamente, normalmente en unos minutos. Las concesiones de mainnet siguen siendo manuales.
- **Los pasos del nodo siguen el manifiesto de versiones de la red.** Las descargas (edición de servidor `lightnode-sx`, edición de escritorio `lightnode-ux`, por plataforma, con checksums SHA-256), si el registro está abierto y si los pasos están vigentes provienen del manifiesto.

## Cómo usarlo {#how-to-use}

Requisito previo para todas las pestañas: iniciar sesión. Las pestañas siguen el selector de red del encabezado (las comprobaciones de la cadena, las descargas y el estado de los nodos se leen de la red seleccionada). Sin sesión, la página muestra "Authentication Required". Consulta [Iniciar sesión](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

Una visión general de solo lectura del **QoreChain Validator Program**, la vía por la que los validadores se unen a la red: lo que ofrece el programa (la concesión de operador on-chain, delegación desde stake controlado por la Association y un estipendio en QOR para operadores independientes que cumplan los niveles de servicio), lo que exige, el proceso de selección y una FAQ. Tiene los botones **Apply** y **Ask a question**. Los parámetros de protocolo (tiempo de unbonding, slashing, número máximo de validadores) se leen en vivo de la cadena; las reglas del programa (el auto-stake de 100,000 QOR, la banda de comisión, el estipendio) son de la Association y están marcadas como tales. Los validadores no compran ningún paquete: presentan su solicitud y pagan una **tarifa de programa de $1,000** solo una vez seleccionados. Para los importes del estipendio, consulta la propia pestaña.

### Validator Application {#validator-application}

1. **Completa la solicitud.** Nombre de la entidad, jurisdicción y correo de contacto; la **dirección de operador** (`qor1...`, la cuenta desde la que ejecutarás `create-validator`; la concesión de operador on-chain se emite a esta dirección); proveedor de hosting, región y tipo; las redes que ya operas; opcionalmente tu dirección de validador de testnet (`qorvaloper1...`) y la infraestructura pública que ofreces (RPC público, snapshots, archivo); el track (Standard, o Global para las plazas reservadas); y la aceptación de los términos del programa. Selecciona **Submit application**. Presentar la solicitud es gratis.
2. **Revisión y prueba en testnet.** La solicitud se muestra como **Application submitted** y, para las solicitudes que avanzan, **Testnet trial** (una prueba de 14 días ejecutando un validador en `qorechain-diana`). Una rechazada dice **Not selected**, con **Apply again**.
3. **Selección y tarifa del programa.** Una solicitud seleccionada muestra **Selected** con un botón **Pay the $1,000 programme fee**. Elige la red (USDT en ERC-20, BEP-20 o TRC-20), paga el importe exacto indicado, pega el hash de la transacción y selecciona **Verify payment**; el pago se verifica on-chain. La tarifa está ligada a la dirección de operador de tu solicitud y no se puede pagar a otra dirección. La aprobación y el pago se muestran por separado: una solicitud puede estar seleccionada y aún sin pagar. Tras el pago, la tarjeta dice "Programme fee paid".
4. **La concesión de operador on-chain.** Tras el pago, la Association emite la concesión `validator_operator` on-chain a tu dirección de operador. Las concesiones de mainnet se firman a mano, por lotes, por lo que no son instantáneas. La pestaña muestra **Operator grant on chain** en cuanto la cadena la tiene, e **In the active set** una vez que tu validador está bloqueado (bonded).
5. **Readiness.** Para las solicitudes enviadas, en prueba, seleccionadas y con concesión, el panel **Validator Readiness** (con un campo de dirección) comprueba la cadena para la dirección de operador. Realiza pronto el [registro de la clave PQC](/developer-guide/running-a-validator#pqc-key-registration) en tu propio nodo: nadie registra esa clave por ti.

Las solicitudes aprobadas bajo la oferta de validadores anterior (antes de octubre de 2026) se muestran como **Earlier application**; la Association se pone en contacto directamente con esos solicitantes.

### Light Node {#light-node}

Todo lo que necesita un operador de light node, desde la licencia hasta un nodo registrado.

1. **Compra la licencia (mainnet).** Una licencia de light node cuesta **$50**, pagada en USDT en ERC-20, BEP-20 o TRC-20 y verificada on-chain. Introduce la dirección `qor1...` a la que se debe conceder la licencia, elige la red USDT y selecciona **Buy for $50**; usa una cuenta cuyas palabras de recuperación tengas (tus propias palabras, Keplr o `qorechaind`), idealmente una que se use solo para el nodo. Tras pagar, la tarjeta dice **Payment received** y sigue la concesión on-chain. Más abajo se listan **Your past orders**.
2. **Espera la concesión on-chain.** La licencia muestra **Paid, awaiting on-chain grant** y luego **Active on chain** cuando la cadena confirma la concesión `lightnode_operator`. Las concesiones de mainnet se firman a mano, por lotes.
3. **Instala y registra el nodo.** La pestaña enumera las compilaciones publicadas para tu red con sus checksums y los pasos para la versión actual: establecer una contraseña para el keyring, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (añade la cuenta para la que es la licencia), `lightnode-sx register` (adjunta la clave post-cuántica del nodo y lo registra; añade `--delegate-to <qorvaloper...>` si a la dirección le falta el stake requerido), y luego `lightnode-sx start` y `lightnode-sx status`. Los pasos se muestran como vigentes solo cuando el manifiesto de versiones de la red publica una compilación que los admite, y la pestaña indica si el registro está abierto.
4. **Avisos sobre tu dirección.** La pestaña avisa cuando la dirección de la licencia es una de tus propias wallets custodiales del Dashboard ("This address cannot run a node": el Dashboard guarda esa clave), e indica cuando la dirección ya tiene una clave post-cuántica on-chain (el nodo la reutiliza si se derivó de tus palabras de recuperación y, si no, se niega y recomienda una cuenta dedicada).
5. **Estado.** Un panel muestra los requisitos vigentes y si hay un light node registrado que informa a tiempo. Sus estados incluyen "Registered, waiting for its first heartbeat", "Rewards accrued" y un aviso cuando el nodo se ha marcado como inactivo.

#### Licencia gratuita de testnet {#testnet-licence}

En la testnet (`qorechain-diana`) no se vende nada ("Nothing is sold on testnet") y una licencia de light node es gratuita y de autoservicio:

1. Pon el encabezado en **Testnet** y abre la pestaña **Light Node**.
2. En **Free testnet licence**, introduce tu dirección `qor1...` y selecciona **Request licence**.
3. La solicitud se muestra como "Requested for ...", y después "Granted to ... You can register your node now." Si no se pudo firmar la concesión, la pestaña lo indica y puedes volver a solicitarla.

Las concesiones se firman automáticamente, normalmente en unos minutos. Hay una solicitud por cuenta y una por dirección. **Ejemplo mínimo:** Testnet, **Light Node**, **Request licence**, espera "Granted to ...", y luego ejecuta de `lightnode-sx onboard` a `register`.

Consulta [Visión General de Light Node](/light-node/overview) y [Registro y Licencias](/light-node/registration-and-licensing).

:::note Licencias compradas antes de que la dirección fuera obligatoria
Si compraste una licencia antes de que se recogiera la dirección, la pestaña se abre con **This licence needs a QoreChain address**: introduce la dirección y selecciona **Save address**. Hasta que se guarde, la licencia no puede concederse.
:::

### Node Registration {#node-registration}

Registra los datos de tu validador ante la Association. No crea el validador on-chain; eso lo haces desde tu propio nodo con `create-validator`. La pestaña está bloqueada hasta que la concesión esté on-chain.

El formulario se abre cuando la cadena muestra una concesión `validator_operator` activa para tu dirección de operador y tienes una solicitud seleccionada del Validator Program (o una licencia de validador anterior al programa). Indica la dirección de operador, un **Moniker**, una **Commission** entre el 5% y el 20% y un endpoint opcional, marca la confirmación (el auto-stake de 100,000 QOR, el período de unbonding de 21 días y el slashing) y selecciona **Register validator**.

Los pasos on-chain están en [Ejecutar un Validador](/developer-guide/running-a-validator): registra tu clave PQC y luego envía `create-validator` con al menos 100,000 QOR de auto-stake, co-firmado con PQC como toda transacción de QoreChain. El staking y la creación de validadores solo ocurren en el carril de transacciones nativo; no hay ninguna vía para registrar o bloquear un validador a través de una wallet EVM vinculada como MetaMask. Debajo del formulario, la pestaña enumera lo que necesita un nodo completo (binario de la versión, génesis, pares), tomado del manifiesto de versiones, y puede mostrar un aviso "Joining is temporarily suspended" cuando la red no acepta nuevos validadores. Consulta [Staking y Validadores](/dashboard/staking-and-validators).

### Rollups {#rollups}

La pestaña se titula **Request a Rollup**. Completa el formulario: un nombre, la máquina virtual (EVM, QoreChain Native o SVM), la capa de disponibilidad de datos (QoreChain DA, Celestia o EigenDA), el token de gas, el secuenciador (Shared sequencer, Dedicated (single) o Decentralized) y el objetivo de settlement (QoreChain mainnet o Ethereum), y luego selecciona **Request deployment**. Esto solo registra una solicitud, que aparece listada debajo del formulario con su estado; en ese paso no se crea nada on-chain. Las opciones son más amplias de lo que el módulo de rollups on-chain admite actualmente. Para registrar tú mismo un rollup on-chain, consulta [Desplegar un Rollup](/rollups/deploying-a-rollup); para los conceptos, consulta [Visión General de Rollups](/rollups/overview).

## Cómo acceder {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), o **Nodes & Validators** en el grupo **Build** de la barra lateral.
- **Inicio de sesión:** obligatorio para toda la página, en ambas redes.
- **Red:** sigue el encabezado. La compra de la licencia de $50 es solo de mainnet; la licencia gratuita es solo de testnet.
- **Costes:** presentar la solicitud es gratis; la tarifa del programa de validadores es de $1,000 y se paga solo tras la selección; una licencia de light node de mainnet cuesta $50; la licencia de testnet es gratuita.
- **Wallet:** una cuenta cuyas palabras de recuperación tengas para el nodo; no se necesita ninguna wallet para leer las pestañas.

## Dónde está publicado {#where-published}

| Superficie | Dirección | Redes |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet y testnet, selector del encabezado |
| Descargas de nodos y checksums | La pestaña Light Node | Según el manifiesto de versiones de cada red |
| SDK y herramientas para constructores | [Developers](/dashboard/developers) | Ambas |

## Límites y problemas conocidos {#limits}

- **Las concesiones de mainnet son manuales,** se firman por lotes, así que una licencia pagada espera en "Paid, awaiting on-chain grant". Las concesiones de testnet son automáticas.
- **Una solicitud gratuita de testnet** por cuenta y por dirección.
- **Rollups es un formulario de solicitud en ambas redes;** no crea nada on-chain.
- **Unirse como validador puede estar en pausa** (el aviso "Joining is temporarily suspended").
- **Los datos de recepción de USDT y los importes de cualquier estipendio** se muestran solo dentro de las pestañas en el momento del pago o de la solicitud.

Para saber cómo funciona el licenciamiento en toda la red, consulta [Licenciamiento de la Cadena](/architecture/chain-licensing).
