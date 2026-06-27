---
slug: /light-node/registration-and-licensing
title: Registro y licencias
sidebar_label: Registro y licencias
sidebar_position: 4
---

# Registro y licencias

Para ganar la [participación del 3 % de recompensa para nodos ligeros](/light-node/rewards-and-monitoring), un nodo ligero debe estar **registrado en la cadena** y debe seguir demostrando que está activo. Esta página explica cómo funciona el registro, cómo el nodo demuestra su actividad (liveness) y cómo registrar y licenciar un nodo a través del Dashboard.

## Registro en la cadena

El registro inscribe tu nodo ligero en la cadena para que el protocolo sepa que existe, de qué tipo es (`sx` o `ux`) y qué clave de operador lo controla. Una vez registrado y activo, el nodo pasa a ser elegible para la participación de recompensa de nodos ligeros.

### Generar el comando de registro

La edición SX puede imprimir el comando exacto de la cadena para registrar este nodo. Ejecuta:

```bash
lightnode-sx register
```

Esto lee tu clave de operador del keyring e imprime una transacción de `qorechaind` lista para ejecutar, junto con la dirección de tu operador, el tipo de nodo y la versión. El comando admite dos flags opcionales:

- `--type` — el tipo de nodo, `sx` o `ux` (por defecto `sx`).
- `--version` — la versión del nodo a registrar (por defecto la versión del propio binario).

El comando impreso registra el nodo bajo el módulo `x/lightnode` en la cadena. Envíalo con una cuenta de operador con fondos en la red a la que te unes (testnet `qorechain-diana` o mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **imprime** la transacción de registro para que la revises y la envíes — no la difunde por sí mismo. Esto te mantiene en control de cuándo y cómo se registra el nodo.
:::

## Pruebas de actividad por heartbeat

El registro por sí solo no basta para mantener la elegibilidad. Un nodo ligero registrado debe demostrar continuamente que está en línea enviando **pruebas de actividad por heartbeat**. Estos heartbeats son la forma en que la cadena distingue los nodos activos — que son elegibles para la participación de recompensa — de los nodos registrados pero desconectados.

En la práctica, esto significa que un nodo registrado y mantenido en funcionamiento (y sincronizado) conserva su elegibilidad, mientras que un nodo que se desconecta deja de demostrar actividad y pierde la elegibilidad hasta que vuelve. Por lo tanto, mantener el daemon en funcionamiento y en buen estado forma parte de ganar recompensas — consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring) para ver cómo vigilar el estado del heartbeat y de la sincronización.

### Canal de heartbeat cofirmado con PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain es **PQC-required por defecto**, por lo que la transacción de actividad por heartbeat se produce mediante un canal cofirmado poscuántico en lugar de una firma exclusivamente clásica. El daemon construye el heartbeat sin firmar y luego lo cofirma con una firma **híbrida Dilithium-5 (ML-DSA-87)** antes de difundirlo — la misma postura poscuántica que la cadena impone para cada transacción. El nodo envía un heartbeat por ventana de `interval_blocks` (coincidiendo con el parámetro `heartbeat_interval` de la cadena), regulándose a sí mismo por altura de bloque para evitar rechazos por envío anticipado.

Los heartbeats en la cadena son opcionales en el daemon: habilita la sección `[heartbeat]` en la configuración del nodo (`enabled = true`) y apunta `qorechaind_path` a un binario `qorechaind`, que realiza el flujo de generar-y-cofirmar. Cuando esto no está configurado, el nodo funciona sin enviar heartbeats en la cadena y el operador puede enviar la prueba de actividad manualmente con los comandos de cadena impresos.

## Registro y licencias a través del Dashboard

También puedes registrar un nodo y obtener una licencia a través del Dashboard de QoreChain, que ofrece un flujo guiado en lugar de construir comandos de cadena a mano.

- Registra tu nodo desde **Tools → Node Registration**.
- Obtén o renueva una licencia desde **Tools → Buy License**.

El flujo del Dashboard te guía para asociar tu clave de operador, elegir el tipo de nodo y la red, y completar el registro en la cadena. Úsalo si prefieres una interfaz a la CLI, o para gestionar las licencias junto con el registro en un solo lugar.

## A dónde ir después

- [Recompensas y monitoreo](/light-node/rewards-and-monitoring) — cómo se gana, se compone y se monitorea la participación del 3 %.
- [Edición SX](/light-node/sx-edition) — el comando `register` y la referencia completa de la CLI.
