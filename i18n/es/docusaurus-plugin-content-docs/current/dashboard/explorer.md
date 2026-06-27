---
slug: /dashboard/explorer
title: Explorador
sidebar_label: Explorador
sidebar_position: 2
---

# Explorador

El **Explorador** es la ventana del Panel hacia la cadena. Úsalo para consultar bloques, transacciones, direcciones y validadores, y para observar la actividad de la red en tiempo real. El Explorador es de solo lectura: no se necesita conectar un monedero para navegar por él.

## La página de visión general

Abre el **Explorador** desde el Panel para ver una instantánea en vivo de la red:

- **Estado de la red** — ID de cadena, estado actual e indicador de seguridad cuántica.
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

## Detalles del bloque

Una página de bloque muestra su altura, marca de tiempo, proponente, hash, recuento de transacciones, gas utilizado y la lista de transacciones que contiene, junto con información de consenso y de la firma poscuántica. Los controles de anterior y siguiente te permiten recorrer la cadena bloque a bloque.

## Detalles de la dirección

Una página de dirección muestra la dirección con un código QR escaneable, su saldo de QOR, el recuento de transacciones y los totales de transferencias entrantes y salientes. Debajo se encuentra el historial completo de transacciones de la dirección — transferencias, swaps, reclamaciones del grifo y más — cada una con su cantidad, hora y estado. Puedes copiar la dirección, descargar su código QR y abrir cualquier transacción para ver sus detalles.

## Validadores {#validators}

La vista de validadores enumera los validadores de la red con tarjetas de resumen del número de validadores activos, el total de QOR vinculado y la salud del consenso. La tabla muestra el rango de cada validador, el alias (moniker), el poder de voto, la comisión y el estado (por ejemplo activo o encarcelado/jailed), además de un indicador poscuántico. Un cuadro de búsqueda filtra por nombre o dirección del validador. Para delegar a un validador, consulta [Staking y Validadores](/dashboard/staking-and-validators).
