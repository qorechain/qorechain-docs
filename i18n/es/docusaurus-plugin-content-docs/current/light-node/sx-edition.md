---
slug: /light-node/sx-edition
title: Edición SX (daemon de servidor)
sidebar_label: Edición SX
sidebar_position: 2
---

# Edición SX — Daemon de servidor

La edición **SX (Server eXperience)** es el nodo ligero sin interfaz: un daemon más una CLI de gestión completa, diseñada para servidores y automatización. El binario es `lightnode-sx`. Esta página describe el nodo ligero **3.1.9** (etiqueta de código fuente `v3.1.9`), que tiene su propia línea de versiones, separada de la versión de la cadena.

## Instalación {#install}

Los binarios precompilados son la vía más sencilla — el cliente de nodo ligero se ejecuta de forma nativa en **seis plataformas sin dependencias nativas**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) y Windows (amd64, arm64) — 12 binarios en total entre las ediciones SX y UX. Cada binario pesa aproximadamente 13 MB — descárgalo y ejecútalo, sin bibliotecas separadas que instalar. El nodo firma sus propias transacciones en todas estas plataformas, así que no se necesita nada más (en particular, ningún `qorechaind`) para registrar y ejecutar un nodo.

**Verifica la suma de comprobación antes de ejecutarlo.** El manifiesto de la versión en `https://download.qore.host/<net>/lightnode/latest.json` incluye un `sha256` para cada binario, un `checksums.url` que apunta a un archivo `SHA256SUMS` de toda la versión, y el `checksums.sha256` de ese mismo archivo. Verifica lo que descargaste — esto no es una nota al pie, es la diferencia entre ejecutar el binario que realmente se compiló y ejecutar lo que sea que haya terminado en esa URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

En Windows, compara la salida de `certutil -hashfile lightnode-sx-<platform>.exe SHA256` con el valor del manifiesto. Ambas redes sirven la misma compilación 3.1.9, y ambos manifiestos la exigen (`minCompatible: 3.1.9`). El código fuente es público en `github.com/qorechain/qorechain-lightnode` (Apache 2.0). Se adjunta a la versión de GitHub una compilación para Android como vista previa; no se registra ni gana recompensas.

También puedes compilar el binario desde el código fuente o ejecutarlo con Docker.

### Compilar desde el código fuente

El nodo ligero requiere **Go 1.26.1**. Su criptografía poscuántica es una implementación en Go puro (sin CGO, sin biblioteca nativa), por lo que la compilación cruzada para cualquiera de las seis plataformas soportadas funciona igual que con cualquier otro binario de Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Compila desde la etiqueta de la versión (`git checkout v3.1.9`). Esto produce `build/lightnode-sx`. Ejecútalo directamente o cópialo en tu `PATH`. Antes de registrarte, verifica el stack de firma poscuántica con [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

No hay una imagen precompilada en un registro; la compilas desde la etiqueta del código fuente. Usa la etiqueta **`v3.1.9`**. Para actualizar una instalación existente, vuelve a compilar desde la nueva etiqueta (`git fetch --tags && git checkout v3.1.9 && docker compose build --no-cache lightnode-sx`); un simple `docker compose up` o `restart` reutiliza la imagen antigua. Las claves, la configuración y el volumen de datos se conservan.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.9

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Mantén `QORECHAIN_RPC_ADDR` exportada en cada comando `docker compose`: sobrescribe `rpc_addr` de la configuración, y el valor por defecto de compose apunta a `host.docker.internal:26657`. El contenedor SX persiste sus datos, incluido el keyring, en un volumen con nombre montado en `/root/.qorechain-lightnode`.

El nodo firma de forma nativa dentro del contenedor, así que no se necesita nada más. La imagen SX sigue incluyendo además un `qorechaind` publicado (v3.2.0, solo linux/amd64, comprobado contra un digest fijado) para la [alternativa `qorechaind`](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline): `docker-compose.yml` monta `~/.qorechaind` (o `QORECHAIND_HOME`) en `/root/.qorechaind` y pasa `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` para esa vía. Un nodo cuya clave del operador está en su propio keyring no usa ninguna de las dos cosas.

## Configuración {#configure}

El nodo ligero lee un archivo de configuración TOML. Por defecto, busca `config.toml` en el directorio home (`~/.qorechain-lightnode/config.toml`). Normalmente no escribes este archivo a mano — el [asistente `onboard`](#first-run-onboard) lo crea por ti — pero es útil entender las opciones.

Dos flags persistentes se aplican a cada comando:

- `--config <path>` — apunta a un archivo de configuración en una ubicación no predeterminada.
- `--home <dir>` — sobrescribe el directorio home usado para datos y claves (por defecto `~/.qorechain-lightnode`).

Las opciones de configuración más relevantes, a nivel de uso:

| Opción | Qué controla |
| --- | --- |
| `chain_id` | El identificador de la red (`qorechain-vladi` en mainnet, `qorechain-diana` en testnet). `onboard` lo lee del endpoint RPC; si no se pudo alcanzar el endpoint durante `onboard`, queda el valor por defecto `qorechain-diana` y debes definirlo tú mismo. Las transacciones se firman para esta cadena. |
| `rpc_addr` | El endpoint RPC de la cadena al que se conecta el daemon. Déjalo vacío para ejecutar en **modo solo local**. |
| `primary_addr` / `witness_addrs` | El endpoint RPC primario, y los endpoints testigo contra los que se corrobora la cabecera que reporta — consulta [Por qué ejecutar un nodo ligero](/light-node/overview#why-run-a-light-node). Al menos un testigo distinto y accesible es lo que hace pasar el valor `assurance` (registrado a nivel debug) de `trusted-single-source` a `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Aceptados por compatibilidad, pero actualmente sin uso. La confianza en la cabecera proviene de la corroboración primario/testigos descrita arriba. |
| `data_dir` | Dónde almacena el nodo su base de datos y cabeceras. |
| `keyring_backend` / `key_name` | Backend del keyring (`file`, `os` o `test` solo para devnets locales) y el nombre de la clave poscuántica con la que firma el nodo. `onboard` establece `key_name` en la clave que crea (`validator`); `keys add-operator` lo cambia a `operator-pqc` cuando deriva o recupera la clave a partir de las palabras de la cuenta. El backend `file` requiere `QORE_LIGHTNODE_KEYRING_PASSPHRASE` en el entorno. |
| `operator_address` | La cuenta a la que pertenece este nodo (`qor1...`); se valida al cargar. `keys add-operator` la rellena. Necesaria para `register`, `status` y los heartbeats. Consulta [La cartera del operador](#operator-wallet). |
| `api_addr` | El endpoint REST. Se deriva de `rpc_addr` cuando está vacío (el puerto 26657 pasa a 1317; los hosts `rpc.` pasan a `api.`), por lo que solo hace falta para endpoints que no siguen ninguna de las dos convenciones. |
| `[heartbeat]` | Activado por defecto (`enabled`). `interval_blocks` (haz que coincida con el `heartbeat_interval` de la cadena, 1000), `check_interval` (por defecto `60s`) y `gas` (por defecto `300000`; con la firma nativa la comisión es de 0,25 uqor por unidad de gas, es decir, 75.000 uqor). Solo los usa la alternativa `qorechaind`: `fees` (por defecto `50000uqor`), `qorechaind_path` (vacío significa `qorechaind` en el `PATH`), `qorechaind_home` (vacío significa `~/.qorechaind`), `keyring_backend` y `key_name` (la clave de `qorechaind` que contiene la cuenta del operador; por defecto el `key_name` de nivel superior). |
| `[delegation]` | `auto_claim` (desactivado por defecto: reclama las recompensas acumuladas del nodo ligero hacia la cuenta del operador a través del firmante; el nodo nunca vuelve a delegar desde el servidor), el intervalo de comprobación, la recompensa mínima a reclamar, `rebalance_enabled` y `min_reputation` (solo alertas de reputación — el nodo nunca mueve stake). `validators` y `split_weights` se aceptan, pero actualmente no se aplican. |
| `[telemetry]` | Si la telemetría está habilitada y los intervalos de actualización para validadores, red, puente y tokenómica. |
| `[dashboard]` | La API local del panel. La edición UX siempre la sirve; la edición SX solo con `enabled = true`. `bind_addr` (por defecto `127.0.0.1:8420`) y `token` (si se define, cada ruta `/api` y `/ws` exigen `Authorization: Bearer <token>`). Consulta [Edición UX](/light-node/ux-edition). |
| `log_level` / `log_format` | Nivel de detalle del registro (`debug`, `info`, `warn`, `error`) y formato (`text` o `json`). Son claves de nivel superior: colócalas antes de la primera `[table]`. |

### Variables de entorno {#environment-variables}

| Variable | Se usa para |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Frase de contraseña del keyring del nodo (`keyring_backend = "file"`), que contiene la clave poscuántica del nodo y la clave de la cuenta del operador. Obligatoria para cada comando que abre el keyring y para `start`; el nodo rechaza una vacía. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Solo para la alternativa `qorechaind`: frase de contraseña del keyring de `qorechaind` que contiene la clave del operador; se pasa a `qorechaind` por stdin, nunca en una línea de comandos. |
| `QORECHAIN_RPC_ADDR` | Sobrescribe `rpc_addr` (y `primary_addr` cuando era igual a `rpc_addr`). Lo define `docker-compose.yml`. |

:::note Los endpoints testigo se validan al arrancar
Un testigo en el mismo host que el primario se rechaza — un endpoint comprometido simplemente estaría de acuerdo consigo mismo, así que no corrobora nada. Un testigo en texto plano `http://` en un host remoto también se rechaza, ya que un atacante que pueda reescribir esa conexión puede responder como todos los testigos a la vez; `http://` en loopback sí es válido. Apunta los testigos a endpoints RPC en los que tengas motivos independientes para confiar.
:::

Los valores por defecto de delegación habilitan las alertas de rebalanceo según reputación y dejan `auto_claim` desactivado — consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring) para ver qué hacen.

## Primera ejecución: `onboard` {#first-run-onboard}

En el primer lanzamiento, `start` se detendrá y te dirigirá al asistente de incorporación si aún no existe un archivo de configuración. Define primero la frase de contraseña del keyring — `onboard` se niega a arrancar sin ella, para no generar nunca una clave que no pueda almacenar — y luego ejecuta el asistente:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` te guía a través de la configuración en cuatro pasos:

1. **Autotest PQC** — ejecuta el roundtrip completo de Dilithium-5 (las mismas comprobaciones que [`selftest`](#verify-the-pqc-stack-selftest)). Si el stack PQC falla, el asistente se niega a continuar.
2. **Endpoint RPC de la cadena** — pega la URL RPC de tu QoreChain (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`), o déjala en blanco para ejecutar en **modo solo local**. Si proporcionas una URL, el asistente la prueba en vivo y lee de ella el ID de la cadena.
3. **Clave del nodo** — el asistente la llama «clave privada del validador», pero es la propia clave Dilithium-5 del nodo ligero, no una clave de validador. Pega una clave privada Dilithium-5 codificada en hexadecimal, o escribe `g` (o `generate`) para acuñar un nuevo par de claves en este nodo.
4. **Guardar** — escribe `config.toml` (con el endpoint y el ID de la cadena) y almacena la clave en el keyring con el nombre `validator` (o `validator-<hex>` si ese nombre ya está en uso), estableciendo `key_name` en ella.

:::note Modo solo local
Si dejas el endpoint en blanco, el daemon arranca en modo solo local: el stack PQC se ejercita por completo, pero el nodo no sincroniza ninguna cadena. Vuelve a ejecutar `onboard` una vez que tu endpoint de cadena esté listo para apuntar el nodo hacia él.
:::

`onboard` siempre sobrescribe la configuración activa. Usa `--config` para escribir en una ruta no predeterminada, o `--non-interactive` para fallar rápido en lugar de preguntar (útil en CI).

:::caution Siguiente paso: la cuenta del operador
`onboard` no sabe qué cuenta es la tuya. Antes de ejecutar `register`, añade la cuenta del operador con [`keys add-operator`](#operator-wallet). Rellena `operator_address` por ti. Si no se pudo alcanzar el endpoint durante `onboard`, comprueba también que `chain_id` en `config.toml` sea `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).
:::

## Ejecución: `start`

Una vez que la incorporación ha escrito una configuración, inicia el daemon:

```bash
build/lightnode-sx start
```

El daemon sincroniza cabeceras, rastrea delegaciones y sirve telemetría hasta que se interrumpe. Si quieres iniciar intencionadamente sin un archivo de configuración (solo local, sin RPC de cadena), pasa `--skip-onboarding-check`.

## Verificar el stack PQC: `selftest` {#verify-the-pqc-stack-selftest}

En cualquier momento puedes confirmar que el stack poscuántico es funcional:

```bash
lightnode-sx selftest
```

`selftest` ejecuta cinco comprobaciones contra Dilithium-5 (ML-DSA-87) y se completa en menos de un segundo:

1. **Keygen** — genera un nuevo par de claves.
2. **Firma** — firma un mensaje de prueba.
3. **Verificación (firma válida)** — confirma que la firma se verifica con la clave pública correspondiente.
4. **Rechazo de firma manipulada** — invierte un byte de la firma; la verificación debe rechazarla.
5. **Rechazo de mensaje manipulado** — invierte un byte del mensaje; la verificación debe rechazarlo.

Si alguna comprobación falla, el binario sale con código distinto de cero y salida de diagnóstico. Esta es la misma prueba que el asistente de incorporación ejecuta como su primer paso, y resulta práctica para la verificación previa al despliegue y los diagnósticos de soporte.

## La cartera del operador {#operator-wallet}

La clave Dilithium-5 del nodo **no** es una cartera. En QoreChain una clave poscuántica se asocia a una cuenta; no crea una. Por eso `keys list` no muestra ninguna dirección para ella. Tu **dirección de operador** es una cuenta `qor1…` ordinaria que tiene la licencia y el stake, paga las comisiones y recibe las recompensas del nodo ligero. Debe ser una cuenta cuyas palabras de recuperación tengas (tus propias palabras, Keplr o `qorechaind`); lo mejor es una cuenta dedicada. Una cartera custodial del Dashboard no puede ejecutar un nodo a menos que exportes su semilla. Consulta [La cuenta del operador](/light-node/registration-and-licensing#operator-account).

Guarda la clave de la cuenta del operador en el keyring del nodo:

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator`:

- deriva la clave de la cuenta a partir de las palabras exactamente como lo hacen `qorechaind` y Keplr (`m/44'/118'/0'/0/0`), la almacena en el keyring como `operator` y escribe la cuenta en `operator_address` de `config.toml`. Si `operator_address` ya apunta a otra cuenta, se niega;
- elige la clave poscuántica con la que firma el nodo, la almacena como `operator-pqc` y establece `key_name` en ella. Si la cuenta ya tiene una clave poscuántica — normalmente registrada por una cartera a partir de las mismas palabras —, esa clave se reconstruye a partir de las palabras (las derivaciones del wallet-adapter y del Dashboard, las mismas que `qorechaind tx pqc recover-key`). Si la cuenta no tiene ninguna, se deriva una clave de las palabras, de modo que las palabras también restauran la clave del nodo. Si la clave registrada de la cuenta ya es la clave actual del nodo, se conserva esa clave. Si la clave de la cuenta no se puede reproducir a partir de las palabras, el comando se niega y recomienda una cuenta dedicada;
- sin `--recover`, crea una cuenta nueva y muestra sus 24 palabras una sola vez. Anótalas; son la única copia de seguridad. Aporta fondos a la cuenta y compra la licencia para su dirección antes de registrarte.

La frase de contraseña del keyring (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) protege esta clave además de la clave del nodo. Después, regístrate:

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` comprueba la licencia, asocia la clave poscuántica salvo que la cuenta ya la tenga, delega el stake que falta solo si nombras un validador con `--delegate-to`, y registra el nodo; cada paso se confirma en un bloque antes del siguiente. Consulta [Registro y licencias](/light-node/registration-and-licensing) para los detalles y para la alternativa `register --print` destinada a los operadores que guardan la clave de la cuenta en un keyring de `qorechaind`.

## Comandos de gestión

La CLI de SX incluye comandos para inspeccionar el estado del nodo y gestionar claves. Desde 3.1.7 el binario UX (`lightnode-ux`) tiene los mismos comandos.

| Comando | Propósito |
| --- | --- |
| `onboard` | Asistente interactivo de primera ejecución. |
| `start` | Ejecuta el daemon. |
| `selftest` | Ejecuta el autotest PQC. |
| `status` | Muestra el estado de sincronización del nodo y del cliente ligero (ID de cadena, última altura, estado de puesta al día) además de las líneas `Signer` (nativo o `qorechaind`), `Operator`, `Licence` y `Registration`. |
| `keys create <name>` | Crea una nueva clave de nodo Dilithium-5 e imprime su clave pública. |
| `keys list` | Lista las claves del keyring (nombre, tipo, dirección si existe, clave pública). |
| `keys show <name>` | Imprime el tipo de una clave y su clave pública completa. |
| `keys import <name> <hex-privkey>` | Importa una clave privada codificada en hexadecimal. |
| `keys export <name> [--out <file>]` | Exporta una clave privada en hexadecimal. `--out` escribe el archivo que lee `qorechaind --pqc-key` (sin salto de línea final, modo 0600). |
| `keys add-operator [--recover]` | Guarda la clave de la cuenta del operador (nueva, o recuperada a partir de sus palabras por la entrada estándar) y elige la clave poscuántica; rellena `operator_address`. Consulta [La cartera del operador](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Registra el nodo en la cadena: clave poscuántica, stake que falta y registro, cada uno confirmado en un bloque. `--print` imprime en su lugar los comandos `qorechaind` — consulta [Registro y licencias](/light-node/registration-and-licensing). |
| `validators` | Lista los validadores vinculados (bonded). |
| `delegation` | Muestra las delegaciones de la cuenta del operador, tal como el daemon en ejecución las refleja en la base de datos local. |
| `rewards` | Muestra las recompensas de staking pendientes de la cuenta del operador (no las recompensas del nodo ligero; consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Muestra la telemetría de red (cabeceras sincronizadas recientes) desde la base de datos local. |
| `version` | Imprime la versión del binario. |

Para detalles de staking, recompensas y monitoreo, consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring). Para registrarte en la cadena, consulta [Registro y licencias](/light-node/registration-and-licensing).
