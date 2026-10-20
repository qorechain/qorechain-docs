---
slug: /light-node/registration-and-licensing
title: Registro y Licencias
sidebar_label: Registro y Licencias
sidebar_position: 4
---

# Registro y Licencias

Para participar en la [participación del 3% en recompensas de light node](/light-node/rewards-and-monitoring), un light node debe estar **registrado on-chain** y debe seguir demostrando que está activo. Esta página explica qué exige la cadena, cómo obtener una licencia, cómo se registra el propio nodo y cómo demuestra su actividad (liveness).

:::note El registro está abierto
El registro está abierto en mainnet (`qorechain-vladi`) y en testnet (`qorechain-diana`). Ejecutar y sincronizar un nodo no requiere licencia. Consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status) para saber cómo comprobar el estado actual.
:::

## Registro on-chain

El registro deja constancia de tu light node en la cadena para que el protocolo sepa que existe, de qué tipo es (`sx` o `ux`) y qué cuenta de operador lo controla. Una vez registrado y activo, el nodo pasa a ser elegible para la participación en recompensas de light node.

### Requisitos {#requirements}

La cadena comprueba todo lo siguiente cuando se ejecuta tu transacción de registro:

1. Una licencia `lightnode_operator` activa en la dirección del operador.
2. Al menos **1.000 QOR delegados** desde esa misma dirección a validadores **en bond** (tu total entre todos los validadores; las delegaciones a validadores encarcelados (jailed) o fuera de bond no cuentan).
3. Saldo en la cuenta del operador para pagar la tarifa de registro de **1 QOR** y las comisiones de transacción. El nodo también paga desde esta cuenta una comisión por cada heartbeat: con la firma nativa la comisión es de 0,25 uqor por unidad de gas, es decir, 75.000 uqor (0,075 QOR) con el `[heartbeat] gas` por defecto de 300.000, o unos 1,9 QOR al mes con unos 25 heartbeats al día.
4. Menos de 10.000 light nodes registrados en toda la red.

Tras el registro, el nodo debe enviar un heartbeat cada **1.000 bloques** (con una gracia de 100 bloques) y mantener al menos un **80% de tiempo de actividad** para cobrar. Lee los valores en vivo con `GET https://api.qore.host/qorechain/lightnode/v1/params` (testnet: `https://api-testnet.qore.host`).

### La cuenta del operador {#operator-account}

El registro se realiza desde tu **dirección de operador**: una cuenta `qor1…` ordinaria que tiene la licencia y el stake, paga las comisiones y recibe las recompensas. El nodo debe poder firmar por ella, por lo que debe ser una cuenta **cuyas palabras de recuperación tengas**: palabras que anotaste tú mismo, una cuenta de Keplr o una clave de `qorechaind` (ruta de derivación `m/44'/118'/0'/0/0`). Lo mejor es una cuenta dedicada usada solo para el nodo.

Una wallet custodial del Dashboard (una cuya semilla guarda el Dashboard por ti) no puede ejecutar un nodo a menos que primero exportes su semilla.

La clave Dilithium-5 del nodo no tiene dirección propia: en QoreChain una clave post-cuántica se asocia a una cuenta, no crea una. El nodo asocia su clave a la cuenta del operador como la clave post-cuántica de esa cuenta, salvo que la cuenta ya tenga una (consulta [Cuentas que ya tienen una clave post-cuántica](#accounts-with-a-pqc-key)).

## Obtener una licencia

### Mainnet: compra en el Dashboard

Las licencias se compran en el Dashboard de QoreChain en **Tools → Light Node**. Una licencia cuesta **50 $**, pagados en USDT en ERC-20, BEP-20 o TRC-20; el pago se verifica en su cadena. Debes introducir la dirección `qor1…` a la que se destina la licencia **antes** de pagar; usa la dirección de operador descrita arriba.

La concesión es un paso on-chain aparte, firmado a mano y enviado por lotes. Hasta que la cadena la confirma, la pestaña muestra **Paid, awaiting on-chain grant**, y el nodo sigue informando de que la dirección no tiene licencia. `lightnode-sx status` muestra una línea `Licence:` que pasa a `active` cuando llega la concesión. También puedes comprobarlo directamente:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet: bajo solicitud

En testnet no se vende nada. Las licencias de testnet son gratuitas y las concede bajo solicitud la autoridad de licencias de testnet: escribe a nodes@qorechain.io con tu dirección `qor1…` de testnet.

## Registrar el nodo

Los pasos siguientes son el flujo de configuración propio del nodo. Son los mismos para ambas ediciones: `lightnode-ux` tiene los mismos comandos que `lightnode-sx` y usa el mismo directorio home (`~/.qorechain-lightnode`). Consulta [SX Edition](/light-node/sx-edition#first-run-onboard) para los detalles de cada comando.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

La frase de contraseña protege ambas claves del keyring del nodo: la clave post-cuántica del nodo y la clave de la cuenta del operador.

### Qué hace `register`

`register` lee `operator_address` y las claves del keyring, y luego:

1. **Comprueba la licencia.** Pregunta a la cadena si `operator_address` tiene una licencia `lightnode_operator` activa. Sin ella se detiene e indica dónde conseguir una. Desde 3.1.10 el mensaje remite a **Tools → Light Node** en mainnet y, en testnet, a una licencia gratuita bajo solicitud en nodes@qorechain.io (3.1.9 todavía nombraba la antigua pestaña del Dashboard). Una licencia caducada o suspendida se notifica como tal. Un nodo que ya está registrado se notifica como tal, y no se envía nada.
2. **Asocia la clave post-cuántica**, salvo que la cuenta ya tenga una. Una cuenta sin clave post-cuántica solo puede enviar este único mensaje, firmado de forma clásica (sin la extensión híbrida); el nodo lo envía así e incluye una prueba de posesión de la clave cuando la cadena la admite.
3. **Delega el stake que falta**, solo si nombras un validador con `--delegate-to qorvaloper1...`. Sin `--delegate-to`, si la cuenta está por debajo del mínimo, se detiene e indica cuánto falta. Desde 3.1.10 solo cuenta el stake delegado a validadores **en bond**, como hace la cadena; 3.1.9 también contaba validadores encarcelados (jailed) o fuera de bond y entonces podía ser rechazado en cadena, así que delega a un validador activo si ejecutas 3.1.9.
4. **Registra el nodo** con la tarifa de 1 QOR.

Cada paso lo firma el propio nodo y se confirma en un bloque antes de enviar el siguiente. Cada transacción posterior al registro de la clave lleva la firma híbrida ML-DSA-87 + secp256k1 que exige la cadena.

El comando admite estos flags:

- `--delegate-to` — el validador `qorvaloper1…` al que delegar el stake que falta.
- `--type` — el tipo de nodo, `sx` o `ux` (por defecto, la edición del binario).
- `--version` — la versión del nodo a registrar (por defecto, la versión propia del binario).
- `--print` — imprime los comandos `qorechaind` equivalentes en lugar de firmar (ver más abajo).

La cuenta debe existir ya en la cadena (debe haber recibido fondos) antes de que `register` pueda firmar por ella.

### Cuentas que ya tienen una clave post-cuántica {#accounts-with-a-pqc-key}

Una cuenta configurada en una wallet suele tener ya una clave post-cuántica, derivada de las mismas palabras de recuperación. Según las reglas v3.2.3 de la cadena, la cadena solo acepta la clave registrada en la cuenta, y rechaza las claves de tipo `classical_only` o una clave vacía.

Desde 3.1.9, `keys add-operator --recover` gestiona esto: cuando la cuenta ya tiene una clave post-cuántica, reconstruye esa clave a partir de las palabras, usando la misma derivación que el wallet-adapter y el Dashboard (la misma que `qorechaind tx pqc recover-key`), y el nodo firma con ella. Cuando la cuenta no tiene clave, el nodo deriva una de las palabras, de modo que las palabras también restauran la clave del nodo. Si la cuenta tiene una clave post-cuántica que las palabras no pueden reproducir (una wallet que genera y guarda su propia clave), el comando se niega y recomienda una cuenta de operador dedicada.

### Alternativa: clave del operador en un keyring de `qorechaind`

Si guardas la clave de la cuenta del operador en un keyring de `qorechaind` y no quieres almacenarla en el nodo, omite el paso 3 y ejecuta:

```bash
lightnode-sx register --print
```

Realiza las mismas comprobaciones de licencia y registro e imprime, con tus valores rellenados, los comandos `qorechaind` de cada paso: exportar la clave del nodo al directorio de claves de `qorechaind` (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, un `tx staking delegate` cuando falta stake, y `tx lightnode register` como par de generar y luego `tx pqc cosign`. En esta vía el daemon también usa `qorechaind` para los heartbeats; consulta [la configuración `[heartbeat]`](/light-node/sx-edition#configure).

## Pruebas de actividad (heartbeat)

El registro por sí solo no es suficiente para mantenerse elegible. Un light node registrado debe demostrar continuamente que está en línea enviando **pruebas de actividad heartbeat**. Estos heartbeats son cómo la cadena distingue los nodos activos —elegibles para la participación en recompensas— de los nodos registrados pero fuera de línea.

En la práctica, esto significa que un nodo registrado y mantenido en ejecución (y sincronizado) conserva su elegibilidad, mientras que un nodo que se desconecta deja de demostrar actividad y pierde la elegibilidad hasta que vuelve a estar en línea. Mantener el daemon en ejecución y en buen estado es, por lo tanto, parte de ganar recompensas — consulta [Rewards and Monitoring](/light-node/rewards-and-monitoring) para saber cómo vigilar la salud del heartbeat y de la sincronización.

### Pipeline de heartbeat co-firmado con PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain **requiere PQC por defecto**, por lo que cada heartbeat lleva una **firma híbrida**: ML-DSA-87 (Dilithium-5) con la clave post-cuántica de la cuenta, y secp256k1 con la clave de la cuenta del operador. El nodo construye y firma la transacción él mismo en Linux, macOS y Windows; no se necesita `qorechaind`. Lee de la red qué versión de sign-bytes usar.

Los heartbeats on-chain están activados por defecto. El daemon envía uno cuando han pasado 1.000 bloques (`[heartbeat] interval_blocks`, que coincide con el `heartbeat_interval` de la cadena) desde el `last_heartbeat` que la propia cadena tiene para el nodo, comprobándolo cada 60 segundos, de modo que un reinicio ni envía un duplicado ni espera un intervalo completo. Cada heartbeat se notifica solo cuando ya está en un bloque.

El daemon elige su firmante al arrancar:

- **Nativo** — el keyring contiene la clave del operador (de `keys add-operator`) y coincide con `operator_address`. Este es el caso normal.
- **Alternativa `qorechaind`** — en caso contrario, si hay un binario `qorechaind` en el `PATH` o en `[heartbeat] qorechaind_path`. Usa la clave del operador del keyring de `qorechaind` (`[heartbeat] key_name`, home `qorechaind_home`, por defecto `~/.qorechaind`) y la clave del nodo exportada en `pqc/<key_name>.dilithium`. La frase de contraseña del keyring de `qorechaind` va en `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`; se pasa a `qorechaind` por stdin y nunca se pone en una línea de comandos.

Mientras el nodo no esté registrado, no envía heartbeats; en su lugar registra el motivo en el log, una vez por cambio de estado: sin licencia, o licencia activa pero sin registrar (ejecuta `register`). `lightnode-sx status` muestra las líneas `Signer:`, `Licence:` y `Registration:` para que el motivo sea visible sin leer los logs. Cuando no hay firmante, el nodo sigue funcionando y sincronizándose, pero no puede mantenerse activo en la cadena, y `status` lo indica.

## La pestaña Light Node del Dashboard

La pestaña **Tools → Light Node** del Dashboard de QoreChain reúne los pasos:

1. **Descargas.** Enlaza los binarios del light node para la red seleccionada (los mismos archivos que `https://download.qore.host/<net>/lightnode/latest.json`, con sus sumas de verificación sha256).
2. **Pasos de configuración.** Muestra los cinco pasos anteriores, ajustados a la versión del manifiesto de la versión, y si el registro está abierto, según el campo `registration` del manifiesto.
3. **Compra de la licencia** (solo mainnet). Pide la dirección de la licencia antes del pago y muestra **Paid, awaiting on-chain grant** hasta que la cadena confirma la concesión. Te avisa si la dirección que introduces es tu propia wallet custodial del Dashboard e indica, a título informativo, si la dirección ya tiene una clave post-cuántica.
4. **Estado.** Un panel de estado muestra el estado del nodo tal como se lee de la cadena.

El registro en sí es siempre la transacción enviada por `lightnode-sx register` (o `lightnode-ux register`). El Dashboard no registra nodos; su antiguo formulario de registro, que solo guardaba un registro, se ha eliminado.

## Próximos pasos

- [Rewards and Monitoring](/light-node/rewards-and-monitoring) — cómo se acredita, se reclama y se monitoriza la participación del 3%.
- [SX Edition](/light-node/sx-edition) — el comando `register` y la referencia completa de la CLI.
