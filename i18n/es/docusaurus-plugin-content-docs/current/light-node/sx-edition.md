---
slug: /light-node/sx-edition
title: Edición SX (daemon de servidor)
sidebar_label: Edición SX
sidebar_position: 2
---

# Edición SX — Daemon de servidor

La edición **SX (Server eXperience)** es el nodo ligero sin interfaz: un daemon más una CLI de gestión completa, diseñada para servidores y automatización. El binario es `lightnode-sx`. Esta es la línea **v3.1.1** del nodo ligero (su propia versión, separada de la versión de la cadena).

## Instalación

Puedes compilar el binario desde el código fuente o ejecutarlo con Docker.

### Compilar desde el código fuente

El nodo ligero requiere **Go 1.26.1** y se compila con CGO habilitado, porque la criptografía poscuántica usa una biblioteca nativa (`libqorepqc`).

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Esto produce `build/lightnode-sx`. Ejecútalo directamente o cópialo en tu `PATH`.

### Docker

Se proporciona una configuración de Docker. El servicio SX se compila desde `Dockerfile.sx`:

```bash
docker compose up lightnode-sx
```

El contenedor SX persiste sus datos en un volumen con nombre montado en `/root/.qorechain-lightnode` y lee la dirección RPC de la cadena desde la variable de entorno `QORECHAIN_RPC_ADDR`.

## Configuración

El nodo ligero lee un archivo de configuración TOML. Por defecto, busca `config.toml` en el directorio home (`~/.qorechain-lightnode/config.toml`). Normalmente no escribes este archivo a mano — el [asistente `onboard`](#first-run-onboard) lo crea por ti — pero es útil entender las opciones.

Dos flags persistentes se aplican a cada comando:

- `--config <path>` — apunta a un archivo de configuración en una ubicación no predeterminada.
- `--home <dir>` — sobrescribe el directorio home usado para datos y claves (por defecto `~/.qorechain-lightnode`).

Las opciones de configuración más relevantes, a nivel de uso:

| Opción | Qué controla |
| --- | --- |
| `chain_id` | El identificador de la red (por ejemplo `qorechain-diana` en testnet, `qorechain-vladi` en mainnet). |
| `rpc_addr` | El endpoint RPC de la cadena al que se conecta el daemon. Déjalo vacío para ejecutar en **modo solo local**. |
| `primary_addr` / `witness_addrs` | Los endpoints RPC primario y testigo usados por el cliente ligero con salto (skipping). |
| `trust_period` / `max_clock_drift` | Ventana de confianza del cliente ligero (por ejemplo `168h`) y desviación de reloj permitida. |
| `data_dir` | Dónde almacena el nodo su base de datos y cabeceras. |
| `keyring_backend` / `key_name` | Backend del keyring (`file` u `os`) y el nombre de la clave de operador. |
| `[delegation]` | Auto-compounding activado/desactivado, intervalo de composición, recompensa mínima a reclamar, conjunto de validadores, pesos de reparto, rebalanceo y reputación mínima. |
| `[telemetry]` | Si la telemetría está habilitada y los intervalos de actualización para validadores, red, puente y tokenómica. |
| `log_level` / `log_format` | Nivel de detalle del registro (`debug`, `info`, `warn`, `error`) y formato (`text` o `json`). |

Los valores por defecto de delegación habilitan el auto-compounding en un intervalo de `1h` y el rebalanceo según reputación — consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring) para ver qué hacen.

## Primera ejecución: `onboard` {#first-run-onboard}

En el primer lanzamiento, `start` se detendrá y te dirigirá al asistente de incorporación si aún no existe un archivo de configuración. Ejecuta el asistente:

```bash
build/lightnode-sx onboard
```

`onboard` te guía a través de la configuración en cuatro pasos:

1. **Autotest PQC** — ejecuta el roundtrip completo de Dilithium-5 (las mismas comprobaciones que [`selftest`](#verify-the-pqc-stack-selftest)). Si el stack PQC falla, el asistente se niega a continuar.
2. **Endpoint RPC de la cadena** — pega la URL RPC de tu QoreChain, o déjala en blanco para ejecutar en **modo solo local** mientras no se necesite una conexión a la cadena. Si proporcionas una URL, el asistente prueba la accesibilidad en vivo.
3. **Clave privada del validador** — pega una clave privada Dilithium-5 codificada en hexadecimal, o escribe `g` (o `generate`) para acuñar un nuevo par de claves en este nodo.
4. **Guardar** — escribe `config.toml` y almacena la clave en el keyring.

:::note Modo solo local
Si dejas el endpoint en blanco, el daemon arranca en modo solo local: el stack PQC se ejercita por completo, pero el nodo no sincroniza ninguna cadena. Vuelve a ejecutar `onboard` una vez que tu endpoint de cadena esté listo para apuntar el nodo hacia él.
:::

`onboard` siempre sobrescribe la configuración activa. Usa `--config` para escribir en una ruta no predeterminada, o `--non-interactive` para fallar rápido en lugar de preguntar (útil en CI).

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

## Comandos de gestión

La CLI de SX incluye comandos para inspeccionar el estado del nodo y gestionar claves:

| Comando | Propósito |
| --- | --- |
| `status` | Muestra el estado de sincronización del nodo y del cliente ligero (ID de cadena, última altura, estado de puesta al día). |
| `keys create <name>` | Crea una nueva clave Dilithium-5. |
| `keys list` | Lista las claves del keyring. |
| `keys import <name> <hex-privkey>` | Importa una clave privada codificada en hexadecimal. |
| `keys export <name>` | Exporta una clave privada en hexadecimal. |
| `register` | Imprime el comando de registro en la cadena para este nodo — consulta [Registro y licencias](/light-node/registration-and-licensing). |
| `validators` | Lista los validadores vinculados (bonded). |
| `delegation` | Muestra las delegaciones actuales desde la base de datos local. |
| `rewards` | Muestra las recompensas de staking pendientes. |
| `network` | Muestra la telemetría de red (cabeceras sincronizadas recientes) desde la base de datos local. |
| `version` | Imprime la versión del binario. |

Para detalles de staking, recompensas y monitoreo, consulta [Recompensas y monitoreo](/light-node/rewards-and-monitoring). Para registrarte en la cadena, consulta [Registro y licencias](/light-node/registration-and-licensing).
