---
slug: /developer-guide/running-a-node
title: Ejecutar un nodo
sidebar_label: Ejecutar un nodo
sidebar_position: 10
---

# Ejecutar un nodo

Esta guía cubre la ejecución de un despliegue de QoreChain de **solo nodo** — un nodo completo o RPC que sincroniza la cadena y expone endpoints para integración, **sin** funciones de validador. Está dirigida a exchanges (CEX), backends de wallets, indexadores e integradores que necesitan acceso fiable de lectura/escritura a la red pero no firman bloques.

:::note
Para la producción de bloques, staking, slashing y clasificación de pools, consulta en su lugar [Ejecutar un validador](/developer-guide/running-a-validator). Un despliegue de solo nodo nunca posee una clave de consenso de validador y nunca aparece en el conjunto activo.
:::

:::warning
Los binarios, el génesis y los snapshots se publican en [download.qore.host](https://download.qore.host) con checksums SHA-256. **Verifica siempre los checksums antes de instalar o extraer**, y verifica los depósitos únicamente contra tu propio nodo sincronizado.
:::

:::note Fuente de la verdad: el manifiesto en vivo
El binario actual, el génesis, los peers, las seeds y un punto de confianza para state sync se publican como un manifiesto JSON, actualizado en vivo — no fijes de forma rígida (hardcode) una versión de binario, un checksum o un nombre de archivo de snapshot en tus scripts de instalación, ya que quedan desactualizados en cuanto se publica un nuevo lanzamiento:

- Mainnet: `https://download.qore.host/mainnet/latest.json`
- Testnet: `https://download.qore.host/testnet/latest.json`

Los campos del manifiesto incluyen `binary` (url + sha256), `genesis` (url + sha256 + sizeBytes), `peers`, `seeds`, `p2pPort`, `stateSync` (un punto de confianza actualizado cada hora) y `minCompatible`. Los pasos de instalación y unión a la red que siguen obtienen este manifiesto y usan sus valores actuales.
:::

:::caution Usa el lanzamiento que indica el manifiesto: v3.2.5 en mainnet, v3.2.6 en la testnet
Un nodo que sincroniza desde el génesis o reproduce desde un snapshot atraviesa varias actualizaciones de gobernanza (consulta [Actualizaciones](#upgrades) más abajo), así que instala siempre el binario al que apunta el manifiesto: incluye todos los manejadores de actualización. En **mainnet**, `minCompatible` y `version` del manifiesto son ambos `3.2.5` (aplicada en la altura 3,906,833 el 29 de octubre de 2026, propuesta de gobernanza 14), por lo que un nodo que se une ahora necesita v3.2.5: un binario anterior se detiene en una altura de actualización que no conoce. El lanzamiento es el bundle `qorechaind-v3.2.5-b2-linux-amd64.tar.gz` (97,965,547 bytes, SHA-256 `4448db60b5ec50009f3943ca1fb5849f9a2790966b3ea433a8c3d55a85115382`, leído del manifiesto el 30 de octubre de 2026; el manifiesto en vivo es la fuente de verdad). Contiene `qorechaind` y `lib/` con `libqorepqc.so`, `libqoresvm.so` y `libwasmvm.x86_64.so`. Un nodo que siga en v3.2.4 se detiene en la altura 3,906,833 con `UPGRADE "v3.2.5" NEEDED`: instala el bundle y reinicia, y su estado se conserva. No hay programada ninguna otra actualización de mainnet (`current_plan` es `null`, comprobado el 30 de octubre de 2026); cuando el manifiesto nombre un lanzamiento más reciente, ese es el binario que hay que instalar. En la **testnet**, `minCompatible` y `version` del manifiesto son ambos `3.2.6` (`upgradeHeight` 8,970,638; v3.2.5 se aplicó en la altura 8,890,800 el 26 de octubre de 2026 y v3.2.6 el 27 de octubre de 2026), por lo que un nodo que se une a la testnet necesita el binario v3.2.6. No ejecutes un binario de testnet contra mainnet ni al revés: cada directorio lleva su propio lanzamiento (consulta [Actualizaciones](#upgrades)). El manifiesto se promueve de forma deliberada (primero testnet, mainnet después de un período de rodaje), así que comprueba su campo `"version"` frente a `minCompatible` antes de confiar en `binary.url`.

Un binario compilado a partir del código fuente público (la compilación community) se niega a arrancar en cualquiera de las dos redes públicas (v3.2.3 y posteriores): no puede verificar firmas poscuánticas y no puede reproducir fielmente los bloques de las redes. Usa solo el archivo de lanzamiento.

Dos ajustes importan desde v3.2.1: mantén el reloj del sistema sincronizado con NTP (el nodo se detiene cuando su reloj se desvía más de 60 segundos) y establece `evm-chain-id` en `app.toml` (consulta [Límites del nodo](#node-limits)).
:::

---

## Nodo vs Validador

| Aspecto               | Solo nodo (esta guía)                              | Validador                                     |
| --------------------- | --------------------------------------------------- | --------------------------------------------- |
| Clave de consenso     | Ninguna                                            | Clave de consenso ed25519 (debe protegerse)   |
| Producción de bloques | No                                                  | Sí — propone y firma bloques                  |
| Staking / slashing    | No aplica                                          | Autodelegación, riesgo de slashing            |
| Propósito principal   | Servir RPC/REST/gRPC/EVM (y SVM de solo lectura) a las integraciones | Asegurar la red (se aplican recompensas de staking) |
| Exposición pública    | Endpoints RPC/EVM normalmente expuestos            | Validador oculto detrás de nodos centinela    |

---

## Redes objetivo

| Red      | Chain ID            | EVM chain ID          | Notas                              |
| -------- | ------------------- | ---------------------- | ----------------------------------- |
| Mainnet  | `qorechain-vladi`   | `9801` (hex `0x2649`) | Principal — activa desde el 7 jun 2026; versión de nodo v3.2.5 (desde el 29 oct 2026) |
| Testnet  | `qorechain-diana`   | `9800`                 | Ensaya aquí primero tus integraciones; versión de nodo v3.2.6 (desde el 27 oct 2026) |

Sustituye el `--chain-id` apropiado para tu red objetivo a lo largo de esta guía. Los ejemplos usan mainnet por defecto.

---

## Hardware recomendado {#recommended-hardware}

| Perfil                     | CPU       | RAM   | Disco (SSD NVMe)               | Red       |
| --------------------------- | --------- | ----- | -------------------------------- | --------- |
| Nodo RPC con pruning        | 4 núcleos | 16 GB | 500 GB+                          | 100 Mbps+ |
| Nodo completo/de archivo    | 8 núcleos | 32 GB | 2 TB+ (crece con el tiempo)      | 1 Gbps    |
| Integración de exchange     | 8 núcleos | 32 GB | 2 TB+ con margen                 | 1 Gbps    |

Se recomienda encarecidamente SSD NVMe: el estado de la cadena y los almacenes EVM/SVM son intensivos en E/S. Las cifras de disco anteriores son generosas. Medido en mainnet (27 de octubre de 2026): un validador que se unió mediante state sync con `pruning = "custom"` (keep-recent 100000) e `indexer = "null"` ocupa unos 10 GB tras dos meses, y un nodo con el pruning predeterminado que funciona desde el génesis ocupa unos 100 a 130 GB tras cuatro meses. El dimensionamiento de validadores está en [Ejecutar un validador: Hardware](/developer-guide/running-a-validator#hardware). Los nodos de archivo (sin pruning, indexación completa de tx) crecen continuamente; aprovisiona disco con margen y monitorización.

---

## Despliegue

### Docker Compose

Un despliegue de solo nodo con Docker Compose. No hay ninguna imagen `qorechaind` publicada públicamente para descargar (no se publica nada bajo la organización del proyecto en Docker Hub). El `Dockerfile` del repositorio público compila el binario **community** (sin biblioteca poscuántica, keepers stub): sirve para el desarrollo local, pero no puede seguir mainnet ni testnet, y desde v3.2.3 se niega a arrancar en ellas. Para un nodo de red, compila tu propia imagen a partir del **archivo de lanzamiento** indicado en `latest.json`, etiquétala con la versión del lanzamiento (**v3.2.5** en mainnet, **v3.2.6** en la testnet, en el momento de escribir esto) y luego monta un volumen persistente para los datos de la cadena:

```bash
# Fetch and verify the release archive (see "Joining the Network" below for the manifest steps)
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
curl -fsSL "$(jq -r .binary.url latest.json)" -o qore.tgz
echo "$(jq -r .binary.sha256 latest.json)  qore.tgz" | sha256sum -c -
mkdir release && tar xzf qore.tgz -C release

cat > release/Dockerfile <<'EOF'
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates curl jq && rm -rf /var/lib/apt/lists/*
COPY qorechaind /usr/local/bin/qorechaind
COPY lib/ /opt/qorechain/lib/
ENV LD_LIBRARY_PATH=/opt/qorechain/lib
ENTRYPOINT ["qorechaind"]
EOF
docker build -t qorechain-node:v3.2.5 release/
```

El archivo contiene `qorechaind` y un directorio `lib/` con sus bibliotecas compartidas (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`); la imagen anterior es solo `linux/amd64`, igual que el archivo de lanzamiento.

```yaml
# docker-compose.yml
services:
  qorechain-node:
    image: qorechain-node:v3.2.5
    container_name: qorechain-node
    restart: unless-stopped
    command: ["start", "--home", "/root/.qorechaind"]
    volumes:
      - qorechain-data:/root/.qorechaind
    ports:
      - "26657:26657"   # RPC
      - "26656:26656"   # P2P
      - "1317:1317"     # REST
      - "9090:9090"     # gRPC
      - "8545:8545"     # EVM JSON-RPC
      - "8546:8546"     # EVM WebSocket
      - "8899:8899"     # SVM RPC (read-only: SVM transactions are disabled)
      - "26660:26660"   # Prometheus

volumes:
  qorechain-data:
```

Inicializa el directorio de datos una sola vez (por ejemplo `docker compose run --rm qorechain-node init my-node --chain-id qorechain-vladi --home /root/.qorechaind`; el génesis y la configuración de peers se cubren más abajo) y luego arranca:

```bash
docker compose up -d
docker compose logs -f qorechain-node
```

### systemd

Para una instalación en bare metal, ejecuta `qorechaind` bajo systemd:

```ini
# /etc/systemd/system/qorechaind.service
[Unit]
Description=QoreChain node
After=network-online.target
Wants=network-online.target

[Service]
User=qorechain
ExecStart=/usr/local/bin/qorechaind start --home /var/lib/qorechaind
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now qorechaind
sudo journalctl -u qorechaind -f
```

---

## Unirse a la red

### 1. Inicializar

```bash
qorechaind init my-node --chain-id qorechain-vladi
```

### 2. Obtener el manifiesto {#fetch-the-manifest}

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
# testnet: https://download.qore.host/testnet/latest.json
```

Usa este archivo como fuente para los valores de binario, génesis y peers en los pasos siguientes — comprueba `jq -r .minCompatible latest.json` y ejecuta al menos ese lanzamiento (el recomendado es `jq -r .version latest.json`).

### 3. Descargar y verificar el génesis

```bash
GENESIS_URL=$(jq -r .genesis.url latest.json)
GENESIS_SHA256=$(jq -r .genesis.sha256 latest.json)

curl -fsSL "$GENESIS_URL" -o ~/.qorechaind/config/genesis.json
echo "${GENESIS_SHA256}  $HOME/.qorechaind/config/genesis.json" | sha256sum -c -

# Cross-verify against the genesis served live by the chain:
curl -s https://rpc.qore.host/genesis | jq '.result.genesis' > /tmp/genesis-live.json
```

### 4. Configurar los peers y el suelo de comisiones

Lee los peers y las seeds actuales desde el manifiesto en lugar de fijar de forma rígida los IDs de nodo y los hosts — estos rotan:

```bash
PEERS=$(jq -r '.peers | join(",")' latest.json)
SEEDS=$(jq -r '.seeds | join(",")' latest.json)
```

Abre `~/.qorechaind/config/config.toml` y establece `persistent_peers` (y `seeds`) con esos valores:

```toml
persistent_peers = "<value of $PEERS>"
seeds = "<value of $SEEDS>"
```

Después establece el precio mínimo de gas en `~/.qorechaind/config/app.toml` (suelo de comisiones de la red: **0.1uqor**):

```toml
minimum-gas-prices = "0.1uqor"
```

`qorechaind init <moniker> --chain-id qorechain-vladi` también escribe en `app.toml` el EVM chain id de la red (consulta [Límites del nodo](#node-limits)); compruébalo en un directorio home que se inicializó hace mucho tiempo.

### 5. Comenzar la sincronización

```bash
qorechaind start --minimum-gas-prices=0.1uqor
```

---

## Arranque rápido

Sincronizar desde el génesis puede llevar mucho tiempo. Usa **state sync** como forma predeterminada de unirte; un **snapshot** es solo un recurso de respaldo (el snapshot de mainnet es del 21 de agosto de 2026 y la testnet no publica ninguno).

### State sync

State sync obtiene un snapshot reciente del estado de la aplicación desde servidores RPC de confianza en lugar de reproducir cada bloque. Configura la sección `[statesync]` en `config.toml`:

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUSTED_BLOCK_HEIGHT>
trust_hash = "<TRUSTED_BLOCK_HASH>"
trust_period = "168h0m0s"
```

Toma `trust_height` / `trust_hash` del campo `stateSync` del manifiesto. Se actualiza cada hora, por lo que es la fuente preferida:

```bash
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

:::warning Dos servidores RPC distintos
State sync contrasta el punto de confianza con **dos** servidores RPC. El campo `stateSync.rpcServers` del manifiesto lista `https://rpc.qore.host` dos veces en mainnet (y `https://rpc-testnet.qore.host` dos veces en la testnet): dos entradas idénticas cumplen el recuento pero anulan la verificación cruzada. Añade un segundo RPC que ejecutes o en el que confíes de forma independiente, y compara el hash de confianza con una segunda fuente, por ejemplo `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash`, que debe ser igual a `$TRUST_HASH`.
:::

Como alternativa o respaldo, puedes obtener tú mismo una altura y un hash de confianza desde el RPC público:

```bash
curl -s https://rpc.qore.host/block | jq -r '.result.block.header.height, .result.block_id.hash'
```

### Restauración desde snapshot

Alternativamente, descarga el snapshot publicado de los datos de la cadena, verifica su checksum y extráelo sobre tu directorio de datos. En mainnet, el objeto `snapshot` del manifiesto indica la URL, la `height` del bloque, el tamaño y el SHA-256. **La URL del snapshot del manifiesto de testnet devuelve actualmente `404` (no se publica ningún snapshot de testnet), así que usa state sync allí.** Lee `snapshot.height` antes de usar el de mainnet: es un único archivo de unos 27 GB, y uno antiguo implica una puesta al día larga. El snapshot de mainnet publicado actualmente es del 21 de agosto de 2026 (altura 1,966,629): es anterior a las alturas de actualización de v3.1.94, v3.2.0, v3.2.2, v3.2.3 y v3.2.4, así que un nodo restaurado a partir de él reproduce unos dos meses de bloques con el binario de lanzamiento que nombra el manifiesto. State sync es casi siempre la mejor opción.

```bash
SNAP_URL=$(jq -r .snapshot.url latest.json)
SNAP_SHA256=$(jq -r .snapshot.sha256 latest.json)
curl -fsSL "$SNAP_URL" -o snapshot.tar.gz
echo "${SNAP_SHA256}  snapshot.tar.gz" | sha256sum -c -

tar xzf snapshot.tar.gz -C ~/.qorechaind/
qorechaind start --minimum-gas-prices=0.1uqor
```

:::note
Los campos `snapshot.height` y `snapshot.ts` del manifiesto indican lo reciente que es el archivo, y state sync (arriba) suele ser más rápido que una descarga de 27 GB. Verifica siempre el checksum antes de extraer, y usa una versión del nodo que incluya todos los manejadores de actualización (consulta la advertencia al principio de esta página) al reproducir desde un snapshot.
:::

---

## Actualizaciones {#upgrades}

Los cambios de consenso llegan como **actualizaciones de gobernanza coordinadas**: una propuesta aprobada nombra un plan (por ejemplo `v3.2.3`) y una altura de bloque. El binario del lanzamiento incluye los manejadores de actualización; en la altura del plan todos los nodos deben estar ejecutándolo, y un nodo que siga con el binario anterior **se detiene en esa altura** (este es el comportamiento previsto del módulo de actualización). El manifiesto te indica de qué tipo es un lanzamiento: `upgradeType` es `height` para una actualización coordinada (con `upgradeHeight` establecido) y `rolling` para un lanzamiento local del nodo que puede cambiarse nodo por nodo. Instala el nuevo binario **antes** de la altura; si tu nodo se detuvo antes, cambia el binario y reinicia (consulta la nota sobre rollback en [Troubleshooting](#troubleshooting)).

| Lanzamiento | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
| ------- | ------------------------- | ------------------------- |
| v3.1.94 | altura 2,122,074 | no aplicada |
| v3.2.0 | altura 2,981,742 | altura 5,920,000 |
| v3.2.1 | local del nodo, sin altura | local del nodo |
| v3.2.2 | altura 3,556,788 (16 oct 2026) | altura 6,905,034 (2 oct 2026) |
| v3.2.3 | altura 3,662,051 (20 oct 2026, propuesta de gobernanza 11) | altura 8,003,746 (15 oct 2026) |
| v3.2.4 | altura 3,742,566 (23 oct 2026, propuesta de gobernanza 13) | altura 8,337,253 (19 oct 2026, propuesta de gobernanza 13) |
| v3.2.5 | altura 3,906,833 (29 oct 2026, propuesta de gobernanza 14) | altura 8,890,800 (26 oct 2026) |
| v3.2.6 | no aplicada | altura 8,970,638 (27 oct 2026) |

**Qué hizo el operador de un nodo para v3.2.4 (altura 3,742,566 de mainnet).** La propuesta de gobernanza 13 nombró el plan `v3.2.4` en la altura 3,742,566 (aplicada el 23 de octubre de 2026): los nodos permanecieron en v3.2.3 hasta esa altura, se detuvieron allí y se reiniciaron con v3.2.4. Para la próxima actualización coordinada los pasos son los mismos:

1. Vigila el manifiesto (`https://download.qore.host/mainnet/latest.json`): hasta que nombre el nuevo lanzamiento no hay nada que instalar, y un binario del directorio de testnet no es el lanzamiento de mainnet.
2. Cuando el manifiesto nombre el lanzamiento, descarga el archivo desde su `binary.url`, verifica el `sha256` (el texto de la propuesta también publica el sha256 del binario) y déjalo preparado **antes** de la altura. Consulta el plan pendiente (`name` y `height`) con `GET /cosmos/upgrade/v1beta1/current_plan` y la altura actual con `GET /status` en el RPC.
3. En la altura del plan, un nodo que siga con el binario antiguo **se detiene** (es el comportamiento previsto del módulo de actualización, no un fallo); un nodo que ya tenga el nuevo binario aplica el manejador de actualización y continúa. Si el tuyo se detuvo primero, cambia el binario y reinícialo. Tras la actualización, `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.4` devuelve la altura en lugar de `0` (3742566 en mainnet, 8337253 en la testnet).
4. Un nodo que se une ahora a mainnet instala el lanzamiento que nombra el manifiesto (v3.2.5 en el momento de escribir esto; comprueba `version` frente a `minCompatible`).

La firma de transacciones, las direcciones, los decimales, los memos y las comisiones no cambian con v3.2.4.

**v3.2.5 en mainnet (altura 3,906,833, 29 de octubre de 2026, propuesta de gobernanza 14).** Se aplicaron los mismos pasos: el manifiesto nombró `3.2.5` como `version` y como `minCompatible`, y un nodo que seguía en v3.2.4 se detuvo en la altura del plan con `UPGRADE "v3.2.5" NEEDED`. La solución es instalar el bundle v3.2.5 (incluye `qorechaind` y las bibliotecas compartidas de `lib/` juntos; mantenlos uno junto al otro) y reiniciar; el estado del nodo se conserva. No hay programada ninguna otra actualización de mainnet.

Lee el registro en vivo con `GET /cosmos/upgrade/v1beta1/applied_plan/<name>` (`0` = no aplicada) y cualquier plan pendiente con `GET /cosmos/upgrade/v1beta1/current_plan`. v3.2.2 actualizó el motor de consenso, el Cosmos SDK (v0.53.8) y las dependencias de IBC, y las comprobaciones de transacciones más estrictas del SDK hacen que ese lanzamiento sustituya al binario anterior en la altura de actualización en lugar de nodo por nodo. La firma de transacciones, las direcciones, los decimales, los memos y las comisiones no cambiaron en v3.2.2 ni en v3.2.3.

**State sync y el reloj.** State sync toma su punto de confianza del bloque `stateSync` del manifiesto (`trustHeight`, `trustHash`, actualizados cada hora); el servidor RPC que lista es el propio del proyecto, así que para un nodo de producción añade servidores RPC en los que confíes y comprueba el hash de confianza contra otra fuente. Mantén el reloj sincronizado con NTP: el nodo se detiene cuando se desvía más de 60 segundos de la red.

---

## Pruning e indexación

Ajusta el pruning y la indexación de transacciones según tu integración. Los exchanges que necesitan el historial completo de transacciones deben ejecutar con pruning mínimo y un indexador de transacciones habilitado.

### Pruning (`app.toml`)

```toml
# Keep recent state only — smallest disk footprint
pruning = "default"

# Keep everything — required for archive / full historical queries
# pruning = "nothing"
```

| `pruning`   | Comportamiento                                    | Caso de uso                            |
| ----------- | ---------------------------------------------------- | --------------------------------------- |
| `default`   | Mantiene el estado reciente, poda el resto        | Nodo RPC, consultas de saldo/estado    |
| `nothing`   | Mantiene todo el estado histórico                 | Nodo de archivo, historial completo    |
| `custom`    | Valores de retención/intervalo definidos por el operador | Retención ajustada              |

### Límites del nodo (`app.toml`) {#node-limits}

Desde la versión v3.2.1 del nodo, `init` escribe una sección `[qorechain]` con tres límites locales del nodo. Solo cambian lo que este nodo conserva en memoria y lo que incluye en los bloques que propone, nunca lo que un bloque debe contener para ser válido:

```toml
[qorechain]
# Maximum number of Cosmos transactions held in the app-side mempool (default 5000).
# When full, a new transaction that pays more per gas evicts the lowest-paying one; otherwise it is refused.
cosmos-mempool-max-txs = 5000

# Time the node may spend selecting transactions for a proposal before it proposes what it has ("0s" disables the budget).
prepare-proposal-budget = "1s"

# Stop after this many candidates in a row that do not fit in the remaining block space (0 disables the cap).
prepare-proposal-max-skips = 64
```

`init` también escribe el EVM chain id de la red en el ajuste `evm-chain-id` de la sección `[evm]` de `app.toml` (`9801` para `--chain-id qorechain-vladi`, `9800` para `qorechain-diana`). Un nodo cuyo `app.toml` lleve un valor distinto arranca igualmente, pero registra un error al iniciar, y su propio JSON-RPC (`eth_chainId`, firma contra ese nodo) responde con un chain id incorrecto hasta que corrijas el archivo; el consenso no se ve afectado. Los binarios anteriores escribían el valor de testnet (`9800`) con independencia de `--chain-id`, así que un nodo de mainnet inicializado hace tiempo debe revisar este ajuste. No establezcas `QORE_EVM_CHAIN_ID` en un valor distinto del de la red: un nodo así se niega a arrancar.

### Indexación de transacciones (`config.toml`)

```toml
[tx_index]
indexer = "kv"
```

Establece `indexer = "kv"` (o un indexador más rico) para que las transacciones se puedan consultar por hash y por evento — esencial para exchanges que concilian depósitos y retiros. Establece `indexer = "null"` solo si no necesitas consultas históricas de tx.

---

## Exponer endpoints para integración {#exposing-endpoints-for-integration}

Habilita y vincula en `app.toml` los servidores de API que necesitan los integradores:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"

[grpc]
enable = true
address = "0.0.0.0:9090"

[json-rpc]
enable = true
address = "0.0.0.0:8545"
ws-address = "0.0.0.0:8546"
api = "eth,net,web3,txpool"
```

**Límites de JSON-RPC en la versión de nodo v3.2.4.** Un nodo que ejecuta el binario v3.2.4 (testnet desde el 19 de octubre de 2026; mainnet desde el 23 de octubre de 2026) acota su propio servidor JSON-RPC. Son ajustes locales del nodo en la sección `[json-rpc]` de `app.toml` y no afectan al consenso: `http-body-limit` (por defecto 262144 bytes, 256 KiB; un cuerpo de petición mayor se rechaza con HTTP 413 antes de leerlo), `max-concurrent-requests` (por defecto 256; las peticiones por encima reciben HTTP 503 de inmediato) y `max-open-connections` (un valor ausente o cero ahora significa 1000, no ilimitado). Además, el argumento de filtro de `eth_getLogs` y `eth_newFilter` se rechaza cuando enumera más de 4 posiciones de topics, más de 1000 alternativas en una posición o más de 1000 direcciones. Un integrador que envíe a su propio nodo peticiones por lotes o de despliegue de contratos muy grandes debe comprobar que su petición más grande cabe en el límite del cuerpo y aumentarlo si hace falta.

Los endpoints públicos sirven los namespaces `eth_`, `net_`, `web3_` y `txpool_` (solo estado); un nodo inicializado con v3.2.3 o posterior usa por defecto `eth,net,web3` y deja fuera `txpool` (publica las transacciones pendientes del nodo), así que añádelo solo si lo necesitas. El namespace `qor_` no lo sirve ninguna compilación de nodo publicada, así que no lo añadas (consulta [el namespace `qor_`](/api-reference/json-rpc-qor_-namespace)).

Y el listener RPC en `config.toml`:

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

| Endpoint     | Puerto  | Uso                                                        |
| ------------ | ------- | ------------------------------------------------------------ |
| RPC          | `26657` | Difusión de transacciones, consulta de bloques/estado      |
| REST         | `1317`  | Consultas HTTP del estado de la cadena                     |
| gRPC         | `9090`  | Acceso programático de alto rendimiento                    |
| EVM JSON-RPC | `8545`  | Integraciones compatibles con Ethereum (chain ID `9801`)   |
| EVM WS       | `8546`  | Suscripciones a eventos EVM                                |
| SVM RPC      | `8899`  | Lecturas compatibles con Solana (las transacciones SVM están deshabilitadas) |

:::warning
Nunca expongas RPC, EVM JSON-RPC ni gRPC directamente a la internet pública sin un proxy inverso, limitación de tasa, autenticación y un firewall. Vincula a `0.0.0.0` solo detrás de una capa de ingreso controlada.
:::

---

## Salud y monitorización de la sincronización

### Estado de sincronización

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
```

* `true` — todavía sincronizando.
* `false` — completamente sincronizado y sirviendo el estado actual.

```bash
# Latest height and network
curl -s localhost:26657/status | jq '.result.sync_info.latest_block_height, .result.node_info.network'
```

El campo `network` debe reportar `qorechain-vladi` (mainnet) o `qorechain-diana` (testnet).

### Prometheus y Grafana

El nodo puede exponer métricas de Prometheus en el puerto **26660** (establece `prometheus = true` en la sección `[instrumentation]` de `config.toml`):

```
http://localhost:26660/metrics
```

Recolecta estas métricas con cualquier colector compatible con Prometheus. Si ejecutas el stack de monitorización de Docker Compose, Grafana está disponible en `http://localhost:3001` — establece tus propias credenciales en el primer inicio de sesión. Vigila el retraso en la altura de bloque, el número de peers y el uso de recursos; genera alertas cuando `catching_up` permanezca en `true` o el número de peers caiga a cero.

### Comprobación del endpoint EVM

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expect "0x2649" (9801) on mainnet
```

---

## Buenas prácticas operativas

1. **Fija la versión de la cadena.** Ejecuta el lanzamiento que recomienda el manifiesto (**v3.2.5** en mainnet y **v3.2.6** en la testnet en el momento de escribir esto), sigue los lanzamientos oficiales para las actualizaciones coordinadas y mantén el reloj del sistema sincronizado con NTP.

2. **Ejecuta nodos redundantes.** Opera al menos dos nodos detrás de un balanceador de carga para que un único reinicio o resincronización no interrumpa el tráfico de integración.

3. **Verifica el génesis y los snapshots.** Valida siempre el SHA-256 del génesis y el checksum de cualquier snapshot contra el lanzamiento oficial antes de arrancar.

4. **Protege los endpoints públicos.** Coloca RPC/EVM/gRPC detrás de un proxy inverso, limitación de tasa y un firewall. Nunca expongas a internet un RPC de escritura sin autenticación.

5. **Ajusta el pruning a la necesidad.** Usa `pruning = "nothing"` junto con `tx_index = "kv"` para exchanges que concilian el historial completo de depósitos/retiros; usa `default` para consultas ligeras.

6. **Monitoriza la sincronización de forma continua.** Genera alertas por retraso en la altura de bloque, cero peers y un nodo atascado en `catching_up`.

Un despliegue de solo nodo nunca firma. Las transacciones que tu integración difunda a través de él deben llevar ya la firma poscuántica híbrida (y, para el carril EVM, el remitente necesita una clave registrada y una ventana de autorización abierta); consulta [Integración de exchanges](/developer-guide/exchange-integration) y [Firma poscuántica](/developer-guide/post-quantum-signing).

Para observar la red sin ejecutar un nodo completo, consulta la [documentación de Light Node](/light-node/overview).

---

## Troubleshooting {#troubleshooting}

### El nodo se detiene con un error de reloj

Desde la versión v3.2.1 del nodo, el motor de consenso se detiene cuando el reloj del sistema se desvía más de 60 segundos de la red. Ejecuta un cliente NTP (`chrony` o `systemd-timesyncd`), confirma que el reloj está sincronizado con `timedatectl status` y reinicia el nodo.

### Un nodo que estaba detenido antes de la actualización no se reanuda tras cambiar el binario

Si tu nodo ya estaba detenido o atascado **antes** de que actualizaras su binario, simplemente colocar el binario nuevo y reiniciar no es suficiente — el nodo tiene resultados ABCI obsoletos en caché de la ejecución anterior y no volverá a ejecutar el bloque que causó la detención. Haz un rollback explícito antes de reiniciar:

```bash
qorechaind rollback --home <HOME>
systemctl restart <unit>
```

El comando es `qorechaind rollback` (un subcomando de nivel superior) — no existe un subcomando `comet rollback` ni un flag `--hard` para él.

### La restauración desde snapshot entra en bucle de fallos por falta de `priv_validator_state.json`

Un archivo/snapshot publicado **no** incluye `data/priv_validator_state.json`, y el nodo se niega a arrancar sin él. Si falta después de una restauración desde snapshot, créalo — pero **solo si todavía no existe**. Nunca sobrescribas uno real: en un validador, este archivo es la salvaguarda contra el doble firmado, y sobrescribirlo arriesga un doble firmado.

```bash
echo '{"height":"0","round":0,"step":0}' > <HOME>/data/priv_validator_state.json
```

---

## Próximos pasos

* [Conectarse a Mainnet](/getting-started/connecting-to-mainnet) — Génesis de mainnet, peers y detalles de conexión
* [Ejecutar un validador](/developer-guide/running-a-validator) — Añade funciones de producción de bloques
* [Compilar desde el código fuente](/developer-guide/building-from-source) — Compila el binario community de `qorechaind` para desarrollo
* [Light Node](/light-node/overview) — Cliente ligero que sigue la red sin un nodo completo
