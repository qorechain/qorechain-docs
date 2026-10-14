---
slug: /light-node/registration-and-licensing
title: Registro y Licencias
sidebar_label: Registro y Licencias
sidebar_position: 4
---

# Registro y Licencias

Para ganar la [participación del 3% en recompensas de light node](/light-node/rewards-and-monitoring), un light node debe estar **registrado on-chain** y debe seguir demostrando que está activo. Esta página explica cómo funciona el registro, cómo el nodo demuestra su actividad (liveness) y cómo licenciar un nodo a través del Dashboard y registrarlo on-chain.

:::note El registro en el programa de recompensas aún no está abierto
No se ha concedido ninguna licencia `lightnode_operator` en ninguna de las dos redes y no hay ningún nodo registrado, por lo que la cadena rechaza hoy todos los registros. Ejecutar y sincronizar un nodo no requiere licencia. Consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status) para saber cómo comprobar el estado actual.
:::

## Registro on-chain

El registro deja constancia de tu light node en la cadena para que el protocolo sepa que existe, de qué tipo es (`sx` o `ux`) y qué clave de operador lo controla. Una vez registrado y activo, el nodo pasa a ser elegible para la participación en recompensas de light node.

### Requisitos {#requirements}

La cadena comprueba todo lo siguiente cuando se ejecuta tu transacción de registro:

1. Una licencia `lightnode_operator` activa en la dirección del operador.
2. Al menos **1.000 QOR en bond** a validadores desde esa misma dirección (tu total entre todos los validadores). Delega **antes** de registrarte: desde la página de staking del Dashboard o con `qorechaind tx staking delegate` (y la co-firma post-cuántica, como en cualquier transacción).
3. Saldo en la cuenta del operador para pagar la tarifa de registro de **1 QOR** y las comisiones de transacción. El daemon paga una comisión por cada heartbeat desde esta cuenta (por defecto `50000uqor` por heartbeat, `[heartbeat] fees`).
4. Menos de 10.000 light nodes registrados en toda la red.

### Generación de los comandos de registro

El registro se realiza desde tu **dirección de operador**: una cuenta `qor1…` con fondos creada con `qorechaind` (o con cualquier wallet de Cosmos), que también recibe las recompensas. La propia clave Dilithium-5 del nodo no tiene dirección; pasa a ser la clave post-cuántica de la cuenta. Pon la dirección en `config.toml` como `operator_address` y asegúrate de que `key_name` y `chain_id` estén configurados como se describe en [Primera ejecución](/light-node/sx-edition#first-run-onboard) (`onboard` no los configura correctamente por ti). Después ejecuta:

```bash
lightnode-sx register
```

Antes de imprimir nada, el comando pregunta a la cadena si `operator_address` tiene una licencia `lightnode_operator` activa. Lo hace porque la cadena rechaza un registro sin ella y no tiene sentido darte comandos que serían rechazados. Sin licencia se detiene con:

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Una licencia comprada en el Dashboard se concede on-chain en un paso aparte, por lo que `register` puede seguir diciendo "no licence" durante un tiempo después de la compra; `lightnode-sx status` muestra la misma línea `Licence:` y pasa a `active` cuando llega la concesión. Un nodo que ya está registrado se notifica como tal en lugar de registrarse dos veces.

Con una licencia activa, el comando lee la clave del nodo desde el keyring e imprime, con tus valores rellenados:

1. **Solo una vez**, el comando que asocia la clave del nodo a la cuenta del operador como su clave post-cuántica (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), tras exportar la clave al directorio de claves de `qorechaind` con `lightnode-sx keys export`. Omítelo si la cuenta ya tiene una clave post-cuántica (`GET /qorechain/pqc/v1/account/<address>` responde `found: true`). Si el límite de gas impreso se agota, repítelo con `--gas 600000 --fees 60000uqor`.
2. El registro en sí: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, y luego `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. La cadena exige la co-firma post-cuántica en cada transacción, por lo que el registro es un par de generar y co-firmar.

El comando admite dos flags opcionales:

- `--type` — el tipo de nodo, `sx` o `ux` (por defecto `sx`).
- `--version` — la versión del nodo a registrar (por defecto, la versión propia del binario).

Envíalo en la red a la que te estás uniendo (testnet `qorechain-diana` o mainnet `qorechain-vladi`). El registro requiere una licencia `lightnode_operator` activa concedida en la dirección del operador; de lo contrario, la cadena lo rechaza.

:::note
`lightnode-sx register` **imprime** los comandos para que los revises y los ejecutes tú mismo — no los transmite por sí solo. Esto te mantiene en control de cuándo y cómo se registra el nodo.
:::

## Pruebas de actividad (heartbeat)

El registro por sí solo no es suficiente para mantenerse elegible. Un light node registrado debe demostrar continuamente que está en línea enviando **pruebas de actividad heartbeat**. Estos heartbeats son cómo la cadena distingue los nodos activos —elegibles para la participación en recompensas— de los nodos registrados pero fuera de línea.

En la práctica, esto significa que un nodo registrado y mantenido en ejecución (y sincronizado) conserva su elegibilidad, mientras que un nodo que se desconecta deja de demostrar actividad y pierde la elegibilidad hasta que vuelve a estar en línea. Mantener el daemon en ejecución y en buen estado es, por lo tanto, parte de ganar recompensas — consulta [Rewards and Monitoring](/light-node/rewards-and-monitoring) para saber cómo vigilar la salud del heartbeat y de la sincronización.

### Pipeline de heartbeat co-firmado con PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain **requiere PQC por defecto**, por lo que la transacción de prueba de actividad heartbeat se genera mediante un pipeline co-firmado post-cuántico en lugar de una firma puramente clásica. El daemon construye el heartbeat sin firmar y luego lo co-firma con una firma híbrida **Dilithium-5 (ML-DSA-87)** antes de transmitirlo — la misma postura post-cuántica que la cadena exige para cada transacción. El nodo envía un heartbeat por cada ventana de `interval_blocks` (que coincide con el parámetro `heartbeat_interval` de la cadena), ritmando su envío según la altura de bloque para evitar rechazos por envío anticipado.

Los heartbeats on-chain están activados por defecto. El daemon necesita: `operator_address` en la configuración; un binario `qorechaind` **v3.2.0 o posterior** (en el `PATH` o en `[heartbeat] qorechaind_path`; la imagen Docker de SX construida a partir de la etiqueta `v3.1.4` incluye uno — la cadena rechaza a los firmantes más antiguos); y el directorio home de `qorechaind` que contiene la clave del operador y la clave del nodo exportada (`qorechaind_home`, por defecto `~/.qorechaind`). Dos frases de contraseña del keyring deben estar en el entorno: `QORE_LIGHTNODE_KEYRING_PASSPHRASE` para el keyring del nodo y `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` para el keyring de `qorechaind` (la segunda se envía a `qorechaind` por stdin y nunca se pone en una línea de comandos). `qorechaind` se publica **solo para Linux amd64** (consulta la entrada `binary` de `https://download.qore.host/mainnet/latest.json`), por lo que en hosts macOS, Windows o ARM el nodo funciona y se sincroniza, pero no puede firmar heartbeats de forma nativa; un nodo registrado debería ejecutar la edición SX en Linux amd64, o la imagen Docker en un host amd64. Marca su propio ritmo según el `last_heartbeat` que la cadena tiene para el nodo, de modo que un reinicio ni envía un duplicado ni espera un intervalo completo. Mientras el nodo no esté registrado, no envía heartbeats; en su lugar registra el motivo en el log, una vez por cambio de estado: sin licencia (con dónde comprar una) o licencia activa pero sin registrar (ejecuta `lightnode-sx register`). `lightnode-sx status` muestra las líneas `Signer:`, `Licence:` y `Registration:` para que el motivo sea visible sin leer los logs. Cuando falta el firmante, el nodo sigue funcionando y sincronizándose; simplemente no puede mantenerse activo en la cadena, y `status` lo indica.

## Registro y licencias a través del Dashboard

Puedes comprobar tu estado de licencia y mantener los datos de tu nodo en la pestaña **Tools → Light Node** del Dashboard de QoreChain. Ejecutar el nodo y unirse a su programa de recompensas son dos cosas distintas, y el Dashboard las mantiene separadas:

1. **Consigue el software (no hace falta licencia).** La pestaña enlaza los binarios del light node para la red seleccionada (los mismos archivos que `https://download.qore.host/<net>/lightnode/latest.json`, con sus sumas de verificación sha256) y muestra un paquete de puesta en marcha para un nodo completo de QoreChain. Un light node solo necesita el binario `lightnode-sx` o `lightnode-ux` y un endpoint RPC; sigue [SX Edition](/light-node/sx-edition).
2. **Comprueba el estado de tu programa de recompensas.** Unirse a la participación en recompensas de light node es un paso separado, condicionado on-chain: una licencia `lightnode_operator` activa concedida on-chain, al menos 1.000 QOR en bond (tu total entre todos los validadores, leído en vivo desde el staking) y una tarifa de registro de 1 QOR. **La inscripción todavía no está abierta** (consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status)), y comprar una licencia no la abre antes de tiempo. El tiempo de actividad se cuenta desde el bloque en que tu nodo se registra on-chain, no antes.
3. **Licencia.** Una licencia comprada mediante **Buy License** se registra primero en nuestro sistema; la concesión que la hace reconocida on-chain es un paso aparte, y la cadena rechaza un registro hasta que esa concesión llega. La compra requiere la dirección `qor1…` a la que se concederá la licencia y muestra **Paid — awaiting on-chain grant** hasta que la cadena lo confirma. `lightnode-sx status` muestra la línea `Licence:` on-chain.
4. **Registro de alta.** Si tu cuenta tiene una licencia registrada como activa, la pestaña también muestra un breve formulario (dirección de operador, moniker, URL del endpoint público y una confirmación del compromiso de stake) seguido de un resumen de lo que enviaste. Esto registra tu solicitud en el Dashboard; **no** envía la transacción de registro on-chain.
5. **Regístrate on-chain.** Una vez concedida la licencia y con 1.000 QOR en bond desde tu dirección de operador, regístrate con `lightnode-sx register` y los comandos `qorechaind` que imprime (ver arriba).

El Dashboard es útil para descargar el nodo, comprobar los requisitos de la cadena y la salud de tu nodo, y comprar una licencia. El registro on-chain en sí es siempre la transacción `lightnode-sx register`.

## Próximos pasos

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — cómo se acredita, se reclama y se monitoriza la participación del 3%.
- [SX Edition](/light-node/sx-edition) — el comando `register` y la referencia completa de la CLI.
