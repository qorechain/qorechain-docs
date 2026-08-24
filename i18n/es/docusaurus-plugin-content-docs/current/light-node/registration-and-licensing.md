---
slug: /light-node/registration-and-licensing
title: Registro y Licencias
sidebar_label: Registro y Licencias
sidebar_position: 4
---

# Registro y Licencias

Para ganar la [participación del 3% en recompensas de light node](/light-node/rewards-and-monitoring), un light node debe estar **registrado on-chain** y debe seguir demostrando que está activo. Esta página explica cómo funciona el registro, cómo el nodo demuestra su actividad (liveness) y cómo registrar y licenciar un nodo a través del Dashboard.

## Registro on-chain

El registro deja constancia de tu light node en la cadena para que el protocolo sepa que existe, de qué tipo es (`sx` o `ux`) y qué clave de operador lo controla. Una vez registrado y activo, el nodo pasa a ser elegible para la participación en recompensas de light node.

### Generación del comando de registro

La edición SX puede imprimir el comando exacto de la cadena para registrar este nodo. Ejecuta:

```bash
lightnode-sx register
```

Esto lee tu clave de operador desde el keyring e imprime una transacción `qorechaind` lista para ejecutar, junto con tu dirección de operador, el tipo de nodo y la versión. El comando admite dos flags opcionales:

- `--type` — el tipo de nodo, `sx` o `ux` (por defecto `sx`).
- `--version` — la versión del nodo a registrar (por defecto, la versión propia del binario).

El comando impreso registra el nodo bajo el módulo `x/lightnode` on-chain. Envíalo con una cuenta de operador con fondos en la red a la que te estás uniendo (testnet `qorechain-diana` o mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **imprime** la transacción de registro para que la revises y la envíes tú mismo — no la transmite por sí sola. Esto te mantiene en control de cuándo y cómo se registra el nodo.
:::

## Pruebas de actividad (heartbeat)

El registro por sí solo no es suficiente para mantenerse elegible. Un light node registrado debe demostrar continuamente que está en línea enviando **pruebas de actividad heartbeat**. Estos heartbeats son cómo la cadena distingue los nodos activos —elegibles para la participación en recompensas— de los nodos registrados pero fuera de línea.

En la práctica, esto significa que un nodo registrado y mantenido en ejecución (y sincronizado) conserva su elegibilidad, mientras que un nodo que se desconecta deja de demostrar actividad y pierde la elegibilidad hasta que vuelve a estar en línea. Mantener el daemon en ejecución y en buen estado es, por lo tanto, parte de ganar recompensas — consulta [Rewards and Monitoring](/light-node/rewards-and-monitoring) para saber cómo vigilar la salud del heartbeat y de la sincronización.

### Pipeline de heartbeat co-firmado con PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain **requiere PQC por defecto**, por lo que la transacción de prueba de actividad heartbeat se genera mediante un pipeline co-firmado post-cuántico en lugar de una firma puramente clásica. El daemon construye el heartbeat sin firmar y luego lo co-firma con una firma híbrida **Dilithium-5 (ML-DSA-87)** antes de transmitirlo — la misma postura post-cuántica que la cadena exige para cada transacción. El nodo envía un heartbeat por cada ventana de `interval_blocks` (que coincide con el parámetro `heartbeat_interval` de la cadena), ritmando su envío según la altura de bloque para evitar rechazos por envío anticipado.

Los heartbeats on-chain son opcionales (opt-in) en el daemon: habilita la sección `[heartbeat]` en la configuración del nodo (`enabled = true`) y apunta `qorechaind_path` a un binario `qorechaind`, que ejecuta el flujo de generar-y-luego-co-firmar. Cuando esto no está configurado, el nodo funciona sin enviar heartbeats on-chain y el operador puede enviar la prueba de actividad manualmente con los comandos de cadena impresos.

## Registro y licencias a través del Dashboard

También puedes levantar un nodo y comprobar su estado de licencia a través de la página **Tools** del Dashboard de QoreChain. Ejecutar el nodo y unirse a su programa de recompensas son dos cosas distintas, y el Dashboard las mantiene separadas en lugar de presentar un único flujo de alta guiado:

1. **Levanta tu nodo (Tools → Light Node, paso 1).** Esto no requiere licencia ni ninguna comprobación on-chain, y se muestra a todos los visitantes antes que cualquier otra cosa. Lee el manifiesto de red actual en vivo y guía por la descarga y verificación del binario, la inicialización del nodo con el genesis, la configuración de `config.toml` con los peers de la red, y el state-sync en lugar de sincronizar desde el genesis.
2. **Comprueba el estado de tu programa de recompensas (Tools → Light Node).** Unirse a la participación en recompensas de light node es un paso separado, condicionado on-chain: requiere una licencia `lightnode_operator` activa concedida on-chain, un mínimo de QOR delegado —contado como tu total a través de todos los validadores a los que delegas, no por validador, y leído en vivo desde el staking en lugar de autodeclarado— y una pequeña tarifa de registro on-chain. **La inscripción todavía no está abierta**, y comprar una licencia mediante **Buy License** no la abre antes de tiempo — hoy no hay nada a lo que darse de alta. Hasta que se abra, esta pestaña muestra el requisito como un estado a comprobar, no como un formulario a enviar. Mientras tanto, ejecuta y sincroniza tu nodo; se espera que el tiempo de actividad previo a la apertura de la inscripción cuente una vez que esta se abra.
3. **Regístrate una vez que tu licencia esté concedida on-chain (Tools → Light Node).** Una licencia comprada mediante **Buy License** se registra primero en nuestro sistema; la concesión que la hace reconocida on-chain es un paso aparte, y el registro se rechaza hasta que esa concesión se materializa. Una vez hecho esto, esta pestaña sustituye el panel de estado por un formulario de registro: tu dirección de operador (`qor1…`), un moniker y una URL de endpoint público, además de una confirmación del compromiso de stake.
4. **Confirma y realiza el bond del stake.** Después de enviarlo, el Dashboard muestra un resumen de confirmación del registro (moniker, dirección de operador, endpoint, intención de stake, estado). Realiza el bond del stake confirmado desde tu dirección de operador una vez que se abra la elegibilidad.

Usa el flujo del Dashboard si prefieres una interfaz gráfica en lugar de la CLI, o para gestionar la licencia y el registro juntos en un solo lugar. El comando `lightnode-sx register` mencionado arriba sigue disponible para quien prefiera construir y revisar la transacción por sí mismo — el registro on-chain y la elegibilidad para el programa de recompensas están gobernados por la cadena de la misma manera sin importar qué camino uses.

## Próximos pasos

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — cómo se gana, se compone y se monitoriza la participación del 3%.
- [SX Edition](/light-node/sx-edition) — el comando `register` y la referencia completa de la CLI.
