---
slug: /dashboard/explorer
title: Explorador
sidebar_label: Explorador
sidebar_position: 2
---

# Explorador

El **Explorador** es la ventana del Panel hacia la cadena. Úsalo para consultar bloques, transacciones, direcciones y validadores, y para observar la actividad de la red en tiempo real. El Explorador es de solo lectura: no se necesita conectar un monedero para navegar por él. Dentro del Panel, ver mainnet requiere haber iniciado sesión; un explorador público aparte, que no necesita cuenta, está disponible en [explore.qore.network](https://explore.qore.network) (es otra aplicación, con su propio selector Mainnet/Testnet).

## La página de visión general

Abre el **Explorador** desde el Panel para ver una instantánea en vivo de la red:

- **Estado de la red** — ID de cadena, estado actual y un chip de estado de seguridad.
- **Actividad de bloques** — la última altura de bloque, el tiempo medio de bloque y los bloques producidos hoy.
- **Suministro** — total de QOR vinculado (bonded), la proporción vinculada y el suministro circulante.
- **Estadísticas destacadas** — total de transacciones, validadores activos y totales, y total de direcciones.
- **Últimos bloques** — una lista en vivo con la altura de cada bloque, la hora, el recuento de transacciones y el proponente.
- **Últimas transacciones** — una lista en vivo con el hash de cada transacción, el tipo, el bloque, la cantidad y el remitente.

Haz clic en cualquier fila de bloque o transacción para abrir su página de detalle. Un control de actualización en cada lista trae las entradas más recientes.

## Búsqueda

El cuadro de búsqueda en la parte superior del Explorador acepta cualquiera de los siguientes elementos y te dirige automáticamente a la página correcta:

- Una **dirección** (`qor1...`)
- Un **hash de transacción**
- Una **altura de bloque** (un número)

## Detalles de la transacción

Una página de transacción muestra su hash, estado, cantidad, remitente y destinatario (ambos en los que se puede hacer clic), comisión, altura de bloque, tipo de transacción y memo si está presente. Puedes copiar el hash y alternar una vista en bruto de la transacción completa para una inspección más detallada.

La página también muestra qué protegió la transacción, y solo hace una afirmación que la cadena respalda:

* **PQC Verified.** Una transacción del carril Native muestra esta tarjeta solo cuando tuvo éxito **y** la propia cadena verificó su firma híbrida, incluida la parte ML-DSA-87 (la cadena registra un evento de verificación para ella). Una transacción fallida, o una sin firma híbrida verificada, muestra en su lugar seguridad estándar; el Explorador no da por supuesto que una firma sea poscuántica.
* **Authorised by a PQC window.** Una transacción enviada desde un monedero EVM lleva una firma secp256k1 ordinaria, por lo que nunca se etiqueta como «PQC Verified». Si el remitente tenía una [ventana de autorización EVM](/developer-guide/evm-development#evm-window) abierta cuando la envió, la página indica que fue **authorised by a PQC window** y muestra un enlace **Window opened by** hacia la transacción firmada de forma poscuántica que abrió la ventana. Esto se aplica desde las alturas de activación de la función de ventanas (testnet 5,920,000; mainnet 2,981,742).

Estas etiquetas son propias del Explorador del Panel en dashboard.qorechain.io/explorer. El explorador aparte en explore.qore.network es otra aplicación y no aplica estas reglas.

## Detalles del bloque

Una página de bloque muestra su altura, marca de tiempo, proponente, hash, recuento de transacciones, gas utilizado y la lista de transacciones que contiene, junto con su recuento de firmas. Los bloques no llevan ninguna etiqueta poscuántica: los firman las claves de consenso de los validadores, y la protección poscuántica se muestra por transacción, no por bloque. Los controles de anterior y siguiente te permiten recorrer la cadena bloque a bloque.

## Detalles de la dirección

Una dirección de QoreChain es una sola cuenta con tres codificaciones — Native (`qor1...`), EVM (`0x...`) y SVM (base58) — y la página de la dirección fusiona la actividad de las tres vías en una vista única de esa misma identidad.

La página muestra la dirección con un código QR escaneable, su saldo de QOR, el recuento de transacciones y los totales de transferencias entrantes y salientes. Debajo se encuentra el historial combinado de transacciones de la dirección a través de las vías Native, EVM y SVM — transferencias, despliegues de contratos, registros de claves PQC, swaps, reclamaciones del grifo y más — cada una con su cantidad, hora y estado. Puedes copiar la dirección, descargar su código QR y abrir cualquier transacción para ver sus detalles.

## Validadores {#validators}

La vista de validadores enumera los validadores de la red con tarjetas de resumen del número de validadores activos, el total de QOR vinculado y la salud del consenso. La tabla muestra el rango de cada validador, el alias (moniker), el poder de voto, la comisión y el estado (por ejemplo activo o encarcelado/jailed), además de un indicador poscuántico. Un cuadro de búsqueda filtra por nombre o dirección del validador. Para delegar a un validador, consulta [Staking y Validadores](/dashboard/staking-and-validators).

:::note La lista de validadores del propio Panel puede mostrar el conjunto de la otra red
Usa [explore.qore.network](https://explore.qore.network) para obtener la lista de validadores autorizada de cada red.
:::

## Explorador independiente {#standalone-explorer}

El mismo Explorador se sirve sin el Panel en [explore.qore.network](https://explore.qore.network): anónimo, solo explorador, con enlaces cortos como `/tx/…`, `/block/…`, `/address/…` y `/validators`. Se abre en mainnet por defecto.
