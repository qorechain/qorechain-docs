---
slug: /light-node/ux-edition
title: Edición UX (Panel Web)
sidebar_label: Edición UX
sidebar_position: 3
---

# Edición UX — Panel Web

La edición **UX (User eXperience)** ejecuta el mismo daemon de light node que la edición SX, pero añade un **panel web integrado** para que puedas observar el nodo y la red desde un navegador. El binario es `lightnode-ux`. Al igual que la de la edición SX, esta página describe el light node **3.1.10** (su propia línea de versiones, independiente de la versión de la cadena).

La edición UX es la opción adecuada para uso en escritorio y para operadores que prefieren una interfaz visual en lugar de la línea de comandos.

## Instalación

Los binarios precompilados se ejecutan de forma nativa en **seis plataformas sin dependencias nativas** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) y Windows (amd64, arm64) — cada uno con un tamaño aproximado de 13 MB. Verifica el checksum de la descarga contra el manifiesto antes de ejecutarlo — consulta [Edición SX](/light-node/sx-edition#install) para saber cómo.

### Compilar desde el código fuente

La edición UX requiere **Go 1.26.1**. Su criptografía poscuántica es una implementación en Go puro (sin CGO, sin biblioteca nativa):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Compila desde la etiqueta de la versión (`git checkout v3.1.10`). Esto genera `build/lightnode-ux`.

### Docker

El servicio UX se compila a partir de `Dockerfile.ux` en el repositorio de código fuente (`github.com/qorechain/qorechain-lightnode`, etiqueta `v3.1.10`). El contenedor necesita un `config.toml` en su volumen de datos antes de poder iniciarse. El binario UX tiene los comandos de configuración, así que puedes crearlo en el volumen:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

Dentro de un contenedor el panel debe escuchar en todas las interfaces del contenedor, así que establece esto en esa configuración (`/root/.qorechain-lightnode/config.toml` en el volumen) y publica el puerto únicamente en el loopback del host. El `docker-compose.yml` incluido publica `8420:8420`, que es accesible desde otras máquinas; cámbialo:

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

El contenedor UX conserva los datos, incluido el llavero, en un volumen con nombre en `/root/.qorechain-lightnode` y lee la dirección del RPC de la cadena desde la variable de entorno `QORECHAIN_RPC_ADDR`. El nodo firma sus propias transacciones, por lo que un contenedor UX puede registrarse y enviar heartbeats igual que la edición SX. La imagen UX no incluye `qorechaind`, por lo que la alternativa `qorechaind` no está disponible en ella.

## Ejecución

Inicia el nodo UX:

```bash
build/lightnode-ux start
```

Esto inicia el daemon y el servidor del panel integrado juntos. La edición UX siempre habilita el panel. Al iniciar, el binario imprime la URL del panel.

La edición UX comparte su configuración con la edición SX: lee el mismo `config.toml` desde `~/.qorechain-lightnode`, usa el mismo llavero y tiene los mismos comandos (`onboard`, `keys`, `register`, `status`, `selftest` y el resto). La configuración inicial son los mismos cinco pasos, con `lightnode-ux` en lugar de `lightnode-sx`:

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Consulta [Edición SX](/light-node/sx-edition#first-run-onboard) para saber qué hace cada comando y [Registro y licencias](/light-node/registration-and-licensing) para los requisitos. El daemon de la edición UX firma y envía heartbeats del mismo modo que la edición SX, en Linux, macOS y Windows. Cuando `register` se ejecuta desde el binario UX, el nodo se registra con el tipo `ux`.

## El panel web en el puerto 8420

El panel se expone en el **puerto 8420**. Ese es el puerto que declara la imagen Docker de `lightnode-ux` (`EXPOSE 8420`) y el predeterminado al que se vincula el binario, por lo que al ejecutarse en Docker el panel se publica en el `8420`:

```
http://localhost:8420
```

:::caution Verifica el mapeo de puertos de tu compose
En otras partes del texto se menciona el puerto 8080 para el panel. El valor autorizado es **8420** — es el que la imagen realmente expone y al que el daemon se vincula por defecto. Si adaptas tu propio `docker-compose.yml` o un proxy inverso, mapea al **8420**, no al 8080.
:::

:::caution Protege el panel
El panel no tiene inicio de sesión. Salvo que definas `[dashboard] token`, cualquiera que pueda alcanzar el puerto 8420 puede leer tu configuración, delegaciones y recompensas; nunca se sirve ninguna clave privada. Con un token definido, cada ruta `/api` y la conexión `/ws` exigen `Authorization: Bearer <token>` (el token que QoreX envía cuando se empareja con el nodo); sobre `http` sin cifrar, ese token atraviesa la red en claro. El binario ahora **usa por defecto solo loopback** (`127.0.0.1:8420`) en lugar de todas las interfaces, y muestra una advertencia al iniciar si lo has configurado para escuchar de forma más amplia — pero la advertencia no es un rechazo. Si amplías deliberadamente el enlace (por ejemplo, para alcanzarlo desde otra máquina, o porque estás publicando el puerto desde Docker), define un token y colócalo detrás de https (un proxy inverso o un túnel SSH) en lugar de exponerlo directamente. La conexión de telemetría por WebSocket también verifica el `Origin` del navegador, ya que un enlace de red amplio por sí solo no impide que otra página abierta en el mismo navegador se conecte.
:::

## Qué muestra el panel

El panel está organizado en las siguientes vistas:

- **Overview** — altura de bloque y estado del nodo de un vistazo.
- **Validators** — el conjunto de validadores en bonding.
- **Delegation** — las delegaciones reflejadas desde tu cuenta de operador (`operator_address`).
- **Network** — telemetría de red en vivo y encabezados sincronizados recientemente.
- **Bridge** — telemetría del puente entre cadenas.
- **Tokenomics** — telemetría de economía del token.
- **Settings** — la configuración efectiva del nodo.

La telemetría se actualiza en tiempo real; el daemon refresca los datos de validadores, red, puente y tokenomics en intervalos independientes (configurables en `[telemetry]` dentro de `config.toml`).

### Aviso de modo local

Si el nodo **no tiene un endpoint RPC de cadena configurado**, el panel se ejecuta en **modo local únicamente** y muestra un aviso destacado que explica la situación: la pila PQC está verificada, pero el nodo no está sincronizando ninguna cadena, por lo que la altura de bloque permanece en `0`. El aviso te indica que ejecutes el asistente de incorporación en el host (nombra `lightnode-sx`; `lightnode-ux onboard` hace lo mismo):

```bash
lightnode-sx onboard
```

El asistente ejecuta la autoprueba de PQC, solicita tu endpoint de cadena e importa o genera la clave de tu nodo. Una vez configurado un endpoint, reinicia el nodo y el panel comenzará a mostrar datos de la cadena en vivo.

## Próximos pasos

- [Registro y licencias](/light-node/registration-and-licensing) — registra el nodo en la cadena.
- [Recompensas y monitoreo](/light-node/rewards-and-monitoring) — cómo se acredita y se reclama la participación del 3% del light node, y cómo monitorear la salud del nodo.
