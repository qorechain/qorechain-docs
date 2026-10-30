---
slug: /qorel/configuration
title: Configuración de QORel
sidebar_label: Configuración
sidebar_position: 5
---

# Configuración

QORel lee un único archivo TOML (`~/.hermes/config.toml` por defecto, o la ruta indicada con `--config`). Para cualquier cadena que firma de la forma estándar, el archivo es exactamente la configuración de Hermes; la [guía de Hermes](https://hermes.informal.systems) describe cada ajuste. Esta página cubre lo que QORel añade: la entrada de cadena de QoreChain, las claves poscuánticas, los ajustes de gas y las comprobaciones que se ejecutan antes de enviar una transacción. Está dirigida a operadores que escriben o revisan una configuración de QORel.

## Innovaciones {#innovations}

- **`signing` por cadena.** `'qorechain-hybrid'` añade la firma ML-DSA-87 a cada transacción que QORel envía a esa cadena; `'standard'` (el valor por defecto) es idéntico byte a byte a Hermes. Las configuraciones mixtas funcionan: un proceso, una cadena de cada tipo.
- **Versión de los bytes de firma leída de la cadena.** Con `pqc.sign_bytes = 'auto'`, QORel lee los registros de actualizaciones aplicadas de la cadena, firma la forma correspondiente, la vuelve a leer cada minuto y tras cualquier rechazo, y nunca inventa una versión.
- **Precio del gas según el mercado de comisiones.** `dynamic_gas_price` con `backend = 'cosmos-evm-feemarket'` sigue la comisión base de QoreChain (mínimo de 0,1 uqor por unidad de gas).
- **Una configuración que rechaza combinaciones inseguras.** Las `extension_options` estáticas junto con la firma híbrida se rechazan al cargar, porque la firma poscuántica debe ser la única opción de extensión crítica.

## Cómo se usa {#how-to-use}

### La entrada de cadena de QoreChain {#chain-entry}

Esta es la entrada de testnet de la configuración de ejemplo. Sustituye las direcciones de nodo por las de tu propio nodo de testnet:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

Los ajustes específicos de QoreChain:

| Ajuste | Valor | Qué hace |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Añade la firma ML-DSA-87 (FIPS 204) a cada transacción enviada a esta cadena. Omítelo, o usa `'standard'`, en todas las demás cadenas. |
| `account_prefix` | `'qor'` | El prefijo de dirección de las cuentas de QoreChain. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | El mínimo de la comisión es 0,1 uqor por unidad de gas. |
| `gas_multiplier` | `1.1` | Multiplica el gas simulado para obtener el límite de gas. Consulta [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Lee la comisión base del mercado de comisiones de la cadena en lugar de usar solo `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (por defecto), `'v1'` o `'v2'` | `auto` lee la versión de los bytes de firma de la cadena; `v1` y `v2` fuerzan una forma concreta. Déjalo en `auto`. |
| `pqc.sign_mode` | `'hedged'` (por defecto) o `'deterministic'` | Firma ML-DSA aleatorizada o determinista. La cadena acepta ambas. |
| `pqc.include_public_key` | `false` (por defecto) | Si se incrusta la clave pública en cada extensión de firma. Esto no registra la clave; solo lo hace `keys register-pqc`. |

Los endpoints públicos de lectura de la testnet de QoreChain figuran en [Conectarse a la testnet](/getting-started/connecting-to-testnet). Un relayer también necesita gRPC, que no es público, así que ejecuta tu propio nodo para el lado de QoreChain.

### Cualquier otra cadena de Cosmos SDK {#other-chains}

Escribe la entrada como lo harías para Hermes y omite `signing`. Esta es la entrada de la testnet pública de Cosmos Hub de la configuración de ejemplo:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Estos endpoints pertenecen a un tercero, son públicos y pueden aplicar límites de peticiones. Usa tus propios nodos para un relé estable.

### Ajustes globales {#global}

La configuración de ejemplo usa estos, que son ajustes de Hermes:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` mantiene actualizados los clientes ligeros y vigila los comportamientos indebidos; `mode.packets` retransmite paquetes y despeja los pendientes cada `clear_interval` bloques y al arrancar. Los handshakes de conexión y de canal se dejan a los comandos `create`. El puerto de telemetría se describe en [Monitorización](/qorel/monitoring).

### Claves {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (o `--key-file` con un archivo de clave que contenga la mnemónica) guarda la clave secp256k1 igual que Hermes y, en una cadena híbrida, deriva la clave ML-DSA-87 de la misma mnemónica y cuenta con la derivación de cartera de QoreChain. Solo se guarda su semilla de 32 bytes, junto a la clave, como `<key name>.pqc`. No se imprime nada secreto. Consulta [Derivación de claves](/qoresign/guides/key-derivation) para ver la derivación.
- `keys register-pqc` envía `MsgRegisterPQCKeyV2` una sola vez. Es la única transacción que QoreChain acepta solo con la firma clásica, y lleva una prueba de posesión en las redes con v3.2.3 o posterior. Es idempotente y se niega a enviar cuando la cuenta ya tiene una clave distinta. Consulta [Firma poscuántica](/developer-guide/post-quantum-signing#pqc-key-registration) para saber qué comprueba la cadena.
- `keys pqc-status` muestra si la clave está registrada, si coincide con la clave local, si se demostró con una prueba de posesión y qué bytes de firma verifica la cadena. `ready_to_relay` debe ser `true`.
- Usa una cuenta de relayer dedicada con un saldo pequeño, nunca la clave de operador de un validador.
- Los archivos de clave (`<key name>.json` y `<key name>.pqc`) se escriben legibles solo por el propietario (0600). El Hermes original usaba el umask por defecto; las claves añadidas con un Hermes anterior conservan su modo antiguo, así que compruébalas con `ls -l`.

### Gas {#gas}

QoreChain cobra la comisión completa (límite de gas por precio) sin reembolso, así que mantén el multiplicador ajustado.

- En la cadena v3.2.5 y posteriores (la medición siguiente se realizó en la testnet con v3.2.6; la mainnet aplicó la v3.2.5 el 29 de octubre de 2026, pero QORel no ha hecho de relé allí), la simulación coincide con la entrega con una diferencia de unos pocos cientos de unidades de gas. La prueba de extremo a extremo local sobre una compilación de esa línea pasa con `1.05` (cada transacción de relé usó el 95 % de su límite).
- Las compilaciones anteriores subestiman en torno a un 8 a 10 % (medido en una devnet de preversión, donde `1.15` dejó un margen del 4 al 7 %). Usa `1.15` hasta que hayas medido tus propios nodos.
- `health-check` señala cualquier multiplicador inferior a `1.1` en una entrada de QoreChain como una posible configuración errónea. Es un aviso y el relé sigue funcionando. `1.1`, el valor de la configuración de ejemplo, lo mantiene limpio por aproximadamente un 5 % más de comisión que `1.05`.
- La transacción única `keys register-pqc` usa al menos `1.1`, sea cual sea el valor de la configuración.
- Cada firma híbrida añade unos 4,7 KB a la transacción y 2.000 de gas por la verificación; la simulación incluye ambos.

### Comprobaciones de seguridad antes de cada envío {#safety-checks}

Antes de cada transacción a una cadena híbrida, QORel comprueba que la clave poscuántica está cargada, registrada en la cadena e idéntica a la local, y que se conoce la versión de los bytes de firma. Si alguna comprobación falla, no envía nada (no se gasta comisión) y `health-check` informa del motivo. Un rechazo de la cadena con codespace `pqc` código 21 hace que QORel vuelva a leer la versión y el registro antes de la siguiente transacción.

### Notas para cadenas con ibc-go v10 {#ibc-go-v10}

- El middleware de comisiones ICS-29 ya no existe en ibc-go v10; las comisiones son el precio del gas, un otorgante de comisión (fee granter) y la comisión base dinámica.
- ibc-go v10 ya no incluye la cabecera en los eventos `update_client`. QORel la lee de la transacción `MsgUpdateClient`, de modo que la detección de comportamientos indebidos sigue funcionando (Hermes 1.13 estándar la desactiva en estas cadenas).

### Endpoints con límite de peticiones {#rate-limits}

Los endpoints públicos suelen responder a las ráfagas con `429 Too Many Requests`, por ejemplo justo después de arrancar el relayer. Hermes los trata como reintentables, pero sus workers de paquetes también se detienen tras `clear_interval x 5` bloques sin eventos IBC nuevos, incluso cuando la última ronda de despeje falló; un paquete que estaba pendiente en ese momento esperaba hasta el siguiente paquete del canal o hasta un reinicio. QORel mantiene activos los workers de paquetes de un canal mientras un intento de relé o de despeje ha fallado, y reintenta en cada intervalo de despeje. Solo se detienen por inactividad después de que una ronda de despeje tenga éxito. Prefiere tus propios nodos o un endpoint de pago para el relé de producción, y configura alertas sobre los paquetes pendientes ([Monitorización](/qorel/monitoring)).

## Cómo acceder {#how-to-access}

- **Dónde está el archivo.** `~/.hermes/config.toml` para una instalación con tarball o Homebrew, `/etc/qorel/config.toml` para los `.deb` y `.rpm`, y el directorio montado para el contenedor. Se puede cambiar con `--config <path>`.
- **Almacén de claves.** `key_store_folder` indica dónde se guardan las claves; por defecto es `~/.hermes/keys`, y los paquetes usan `/var/lib/qorel/keys`.
- **Requisitos previos.** Endpoints RPC, gRPC y WebSocket para cada cadena, y una cuenta de relayer con fondos en cada una.
- **Comprobar una configuración.** `qorel health-check` carga el archivo y prueba cada cadena.

## Dónde se publica {#where-published}

| Qué | Dónde |
|---|---|
| Configuración de ejemplo (testnet, QoreChain y la testnet pública de Cosmos Hub) | `packaging/config.example.toml` en [qorechain/QORel](https://github.com/qorechain/QORel); los paquetes la instalan en `/etc/qorel/config.example.toml` |
| Referencia de configuración de Hermes | [hermes.informal.systems](https://hermes.informal.systems) |

## Límites y problemas conocidos {#limits}

- **Las `extension_options` estáticas se rechazan** en una cadena con `signing = 'qorechain-hybrid'`.
- **Deja `pqc.sign_bytes` en `auto`.** Un `v1` o `v2` fijo que no coincida con lo que verifica la cadena hace que la cadena rechace todas las transacciones.
- **Modo de las claves antiguas.** Los archivos escritos por un Hermes anterior conservan sus permisos antiguos.
- **Endpoints de terceros.** Los endpoints del lado de Hub de la configuración de ejemplo no los gestiona QoreChain y pueden cambiar o aplicar límites de peticiones.
- **Solo la entrada de testnet.** La entrada de QoreChain de aquí es para `qorechain-diana`. Mainnet no está abierta para IBC.
