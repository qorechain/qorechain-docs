---
slug: /light-node/sx-edition
title: Edición SX (daemon de servidor)
sidebar_label: Edición SX
sidebar_position: 2
---

# Edición SX — Daemon de servidor

La edición **SX (Server eXperience)** es el nodo ligero sin interfaz: un daemon más una CLI de gestión completa, diseñada para servidores y automatización. El binario es `lightnode-sx`. Esta es la línea **v3.1.3** del nodo ligero para los binarios precompilados (etiqueta de código fuente `v3.1.4` para las compilaciones con Docker), su propia versión, separada de la versión de la cadena.

## Instalación {#install}

Los binarios precompilados son la vía más sencilla — el cliente de nodo ligero se ejecuta de forma nativa en **seis plataformas sin dependencias nativas**: Linux (amd64, arm64), macOS (Intel, Apple Silicon) y Windows (amd64, arm64) — 12 binarios en total entre las ediciones SX y UX. Cada binario pesa aproximadamente 11–12 MB — descárgalo y ejecútalo, sin bibliotecas separadas que instalar.

**Verifica la suma de comprobación antes de ejecutarlo.** El manifiesto de la versión en `https://download.qore.host/<net>/lightnode/latest.json` incluye un `sha256` para cada binario, un `checksums.url` que apunta a un archivo `SHA256SUMS` de toda la versión, y el `checksums.sha256` de ese mismo archivo. Verifica lo que descargaste — esto no es una nota al pie, es la diferencia entre ejecutar el binario que realmente se compiló y ejecutar lo que sea que haya terminado en esa URL:

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

En Windows, compara la salida de `certutil -hashfile lightnode-sx-<platform>.exe SHA256` con el valor del manifiesto. Ambas redes sirven actualmente la misma compilación v3.1.3. El código fuente es público en `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

También puedes compilar el binario desde el código fuente o ejecutarlo con Docker.

### Compilar desde el código fuente

El nodo ligero requiere **Go 1.26.1**. Su criptografía poscuántica es una implementación en Go puro (sin CGO, sin biblioteca nativa), por lo que la compilación cruzada para cualquiera de las seis plataformas soportadas funciona igual que con cualquier otro binario de Go:

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Esto produce `build/lightnode-sx`. Ejecútalo directamente o cópialo en tu `PATH`. Antes de registrarte, verifica el stack de firma poscuántica con [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

No hay una imagen precompilada en un registro; la compilas desde la etiqueta del código fuente. Usa la etiqueta **`v3.1.4` o posterior**: la imagen compilada desde `v3.1.3` incluye un firmante `qorechaind` más antiguo que la cadena ahora rechaza, por lo que sus heartbeats y reclamaciones de recompensas fallan. Para actualizar una instalación existente, vuelve a compilar desde la nueva etiqueta (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`); hacer pull no sirve de nada.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Mantén `QORECHAIN_RPC_ADDR` exportada en cada comando `docker compose`: sobrescribe `rpc_addr` de la configuración, y el valor por defecto de compose apunta a `host.docker.internal:26657`. El contenedor SX persiste sus datos en un volumen con nombre montado en `/root/.qorechain-lightnode`.

La imagen también incluye un `qorechaind` publicado (v3.2.0, linux/amd64, descargado del canal de versiones en el momento de la compilación y comprobado contra un digest fijado). El daemon lo controla para firmar heartbeats y reclamaciones de recompensas, de modo que un nodo en contenedor puede mantenerse activo en la cadena sin una segunda instalación. Si una red se actualiza más adelante a una versión que rechaza el firmante incluido, apunta `[heartbeat] qorechaind_path` al `qorechaind` más reciente que figura en el manifiesto de esa red (`https://download.qore.host/<net>/latest.json`). En un host arm64 (por ejemplo Apple Silicon) la compilación no incluye firmante; compila con `DOCKER_DEFAULT_PLATFORM=linux/amd64` si necesitas uno. El firmante necesita la cartera del operador: monta tu home de `qorechaind` (el keyring que contiene la clave del operador, más la clave del nodo exportada en `pqc/<key_name>.dilithium`) en `/root/.qorechaind`; `docker-compose.yml` monta `~/.qorechaind` por defecto, o define `QORECHAIND_HOME`. Las dos frases de contraseña son las del keyring del nodo y las del keyring de `qorechaind`; la segunda se pasa a `qorechaind` por stdin y nunca aparece en una línea de comandos. Consulta [La cartera del operador](#operator-wallet).

## Configuración

El nodo ligero lee un archivo de configuración TOML. Por defecto, busca `config.toml` en el directorio home (`~/.qorechain-lightnode/config.toml`). Normalmente no escribes este archivo a mano — el [asistente `onboard`](#first-run-onboard) lo crea por ti — pero es útil entender las opciones.

Dos flags persistentes se aplican a cada comando:

- `--config <path>` — apunta a un archivo de configuración en una ubicación no predeterminada.
- `--home <dir>` — sobrescribe el directorio home usado para datos y claves (por defecto `~/.qorechain-lightnode`).

Las opciones de configuración más relevantes, a nivel de uso:

| Opción | Qué controla |
| --- | --- |
| `chain_id` | El identificador de la red (por ejemplo `qorechain-diana` en testnet, `qorechain-vladi` en mainnet). Defínelo tú mismo después de `onboard`, que deja `qorechain-diana`; lo usa el firmante. |
| `rpc_addr` | El endpoint RPC de la cadena al que se conecta el daemon. Déjalo vacío para ejecutar en **modo solo local**. |
| `primary_addr` / `witness_addrs` | El endpoint RPC primario, y los endpoints testigo contra los que se corrobora la cabecera que reporta — consulta [Por qué ejecutar un nodo ligero](/light-node/overview#why-run-a-light-node). Al menos un testigo distinto y accesible es lo que hace pasar el valor `assurance` (registrado a nivel debug) de `trusted-single-source` a `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Aceptados por compatibilidad, pero actualmente sin uso. La confianza en la cabecera proviene de la corroboración primario/testigos descrita arriba. |
| `data_dir` | Dónde almacena el nodo su base de datos y cabeceras. |
| `keyring_backend` / `key_name` | Backend del keyring (`file`, `os` o `test` solo para devnets locales) y el nombre de la clave poscuántica del nodo. El backend `file` requiere `QORE_LIGHTNODE_KEYRING_PASSPHRASE` en el entorno. |
| `operator_address` | La cuenta a la que pertenece este nodo (`qor1...`); se valida al cargar. Necesaria para `register`, `status` y los heartbeats. Consulta [La cartera del operador](#operator-wallet). |
| `api_addr` | El endpoint REST. Se deriva de `rpc_addr` cuando está vacío (el puerto 26657 pasa a 1317; los hosts `rpc.` pasan a `api.`), por lo que solo hace falta para endpoints que no siguen ninguna de las dos convenciones. |
| `[heartbeat]` | Activado por defecto. `qorechaind_path` (vacío significa `qorechaind` en el `PATH`; la imagen de Docker lo incluye), `qorechaind_home` (vacío significa `~/.qorechaind`), `key_name` (la clave de cuenta de `qorechaind`; por defecto el `key_name` de nivel superior), `interval_blocks` (haz que coincida con el `heartbeat_interval` de la cadena, 1000), `check_interval` (por defecto `60s`), `fees` (por defecto `50000uqor`) y `gas` (por defecto `300000`). |
| `[delegation]` | `auto_claim` (desactivado por defecto: reclama las recompensas acumuladas del nodo ligero hacia la cartera del operador a través del firmante; el nodo nunca vuelve a delegar desde el servidor), el intervalo de comprobación, la recompensa mínima a reclamar, `rebalance_enabled` y `min_reputation` (solo alertas de reputación — el nodo nunca mueve stake). `validators` y `split_weights` se aceptan pero actualmente no se aplican. |
| `[telemetry]` | Si la telemetría está habilitada y los intervalos de actualización para validadores, red, puente y tokenómica. |
| `log_level` / `log_format` | Nivel de detalle del registro (`debug`, `info`, `warn`, `error`) y formato (`text` o `json`). |

### Variables de entorno {#environment-variables}

| Variable | Se usa para |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Frase de contraseña del keyring del nodo (`keyring_backend = "file"`). Obligatoria; el nodo rechaza una vacía. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Frase de contraseña del keyring de `qorechaind` que contiene la clave del operador; se pasa a `qorechaind` por stdin, nunca en una línea de comandos. |
| `QORECHAIN_RPC_ADDR` | Sobrescribe `rpc_addr` (y `primary_addr` cuando era igual a `rpc_addr`). Lo define `docker-compose.yml`. |

:::note Los endpoints testigo se validan al arrancar
Un testigo en el mismo host que el primario se rechaza — un endpoint comprometido simplemente estaría de acuerdo consigo mismo, así que no corrobora nada. Un testigo en texto plano `http://` en un host remoto también se rechaza, ya que un atacante que pueda reescribir esa conexión puede responder como todos los testigos a la vez; `http://` en loopback sí es válido. Apunta los testigos a endpoints RPC en los que tengas motivos independientes para confiar.
:::

Los valores por defecto de delegación habilitan las alertas de rebalanceo según reputación y dejan `auto_claim` desactivado — consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring) para ver qué hacen.

## Primera ejecución: `onboard` {#first-run-onboard}

En el primer lanzamiento, `start` se detendrá y te dirigirá al asistente de incorporación si aún no existe un archivo de configuración. Ejecuta el asistente:

```bash
build/lightnode-sx onboard
```

`onboard` te guía a través de la configuración en cuatro pasos:

1. **Autotest PQC** — ejecuta el roundtrip completo de Dilithium-5 (las mismas comprobaciones que [`selftest`](#verify-the-pqc-stack-selftest)). Si el stack PQC falla, el asistente se niega a continuar.
2. **Endpoint RPC de la cadena** — pega la URL RPC de tu QoreChain, o déjala en blanco para ejecutar en **modo solo local** mientras no se necesite una conexión a la cadena. Si proporcionas una URL, el asistente prueba la accesibilidad en vivo.
3. **Clave del nodo** — el asistente la llama «clave privada del validador», pero es la propia clave Dilithium-5 del nodo ligero, no una clave de validador. Pega una clave privada Dilithium-5 codificada en hexadecimal, o escribe `g` (o `generate`) para acuñar un nuevo par de claves en este nodo.
4. **Guardar** — escribe `config.toml` y almacena la clave en el keyring con el nombre `validator` (o `validator-<hex>` si ese nombre ya está en uso). El keyring de tipo archivo necesita `QORE_LIGHTNODE_KEYRING_PASSPHRASE` definida en el entorno para este paso y para cada comando posterior que lo abra.

:::note Modo solo local
Si dejas el endpoint en blanco, el daemon arranca en modo solo local: el stack PQC se ejercita por completo, pero el nodo no sincroniza ninguna cadena. Vuelve a ejecutar `onboard` una vez que tu endpoint de cadena esté listo para apuntar el nodo hacia él.
:::

`onboard` siempre sobrescribe la configuración activa. Usa `--config` para escribir en una ruta no predeterminada, o `--non-interactive` para fallar rápido en lugar de preguntar (útil en CI).

:::caution Termina la configuración después de la incorporación
`onboard` no sabe a qué red te estás uniendo ni qué cuenta es la tuya. Antes de ejecutar `register` o confiar en los heartbeats, edita `config.toml`:

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` en el nivel superior es la clave poscuántica del nodo (su archivo es `pqc/<key_name>.dilithium` en el home de `qorechaind`); `[heartbeat] key_name` es la clave de cuenta de `qorechaind` que paga la comisión. Si dejas `key_name = "operator"` mientras la clave se llama `validator`, `register` se detiene con `node key "operator" not found`.
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

La clave Dilithium-5 del nodo **no** es una cartera. En QoreChain una clave poscuántica se asocia a una cuenta; no crea una. Por eso `keys list` no muestra ninguna dirección para ella. Tu **dirección de operador** es una cuenta `qor1…` ordinaria con fondos, creada con `qorechaind`, desde la cual se registra el nodo y que recibe las recompensas del nodo ligero. La clave del nodo se convierte en la clave poscuántica de esa cuenta.

Configúrala una sola vez:

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` imprime, con tus valores ya rellenados: el comando `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` que asocia la clave del nodo a la cuenta (una sola vez), y la pareja `tx lightnode register … --generate-only` más `tx pqc cosign` que registra el nodo. La cadena exige la cofirma poscuántica en cada transacción, por eso el registro son dos comandos y no uno. El registro también requiere una licencia `lightnode_operator` activa en la dirección del operador; sin ella la cadena rechaza la transacción. El registro aún no está abierto: consulta [Estado del programa de recompensas](/light-node/overview#reward-program-status).

## Comandos de gestión

La CLI de SX incluye comandos para inspeccionar el estado del nodo y gestionar claves:

| Comando | Propósito |
| --- | --- |
| `onboard` | Asistente interactivo de primera ejecución. |
| `start` | Ejecuta el daemon. |
| `selftest` | Ejecuta el autotest PQC. |
| `status` | Muestra el estado de sincronización del nodo y del cliente ligero (ID de cadena, última altura, estado de puesta al día) además de las líneas `Signer`, `Operator`, `Licence` y `Registration`. |
| `keys create <name>` | Crea una nueva clave de nodo Dilithium-5 e imprime su clave pública. |
| `keys list` | Lista las claves del keyring (nombre, tipo, dirección si existe, clave pública). |
| `keys show <name>` | Imprime el tipo de una clave y su clave pública completa. |
| `keys import <name> <hex-privkey>` | Importa una clave privada codificada en hexadecimal. |
| `keys export <name>` | Exporta una clave privada en hexadecimal (el mismo formato que `qorechaind` lee de `~/.qorechaind/pqc/`). |
| `register` | Imprime los comandos de cadena que asocian la clave del nodo a tu cuenta de operador y registran el nodo — consulta [Registro y licencias](/light-node/registration-and-licensing). |
| `validators` | Lista los validadores vinculados (bonded). |
| `delegation` | Muestra las delegaciones actuales desde la base de datos local (consulta la limitación conocida en [Recompensas y monitoreo](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Muestra las recompensas de staking pendientes (misma limitación). |
| `network` | Muestra la telemetría de red (cabeceras sincronizadas recientes) desde la base de datos local. |
| `version` | Imprime la versión del binario. |

Para detalles de staking, recompensas y monitoreo, consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring). Para registrarte en la cadena, consulta [Registro y licencias](/light-node/registration-and-licensing).
