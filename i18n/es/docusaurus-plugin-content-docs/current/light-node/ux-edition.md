---
slug: /light-node/ux-edition
title: Edición UX (Panel Web)
sidebar_label: Edición UX
sidebar_position: 3
---

# Edición UX — Panel Web

La edición **UX (User eXperience)** ejecuta el mismo daemon de light node que la edición SX, pero añade un **panel web integrado** para que puedas observar el nodo y la red desde un navegador. El binario es `lightnode-ux`. Al igual que la edición SX, esta pertenece a la línea **v3.1.3** del light node (su propia versión, independiente de la versión de la cadena).

La edición UX es la opción adecuada para uso en escritorio y para operadores que prefieren una interfaz visual en lugar de la línea de comandos.

## Instalación

Los binarios precompilados se ejecutan de forma nativa en **seis plataformas sin dependencias nativas** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) y Windows (amd64, arm64) — cada uno con un tamaño aproximado de 11–12 MB. Verifica el checksum de la descarga contra el manifiesto antes de ejecutarlo — consulta [Edición SX](/light-node/sx-edition#install) para saber cómo.

### Compilar desde el código fuente

La edición UX requiere **Go 1.26.1**. Su criptografía poscuántica es una implementación en Go puro (sin CGO, sin biblioteca nativa):

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Esto genera `build/lightnode-ux`.

### Docker

El servicio UX se compila a partir de `Dockerfile.ux` en el repositorio de código fuente (`github.com/qorechain/qorechain-lightnode`, etiqueta `v3.1.4` o posterior). El contenedor necesita un `config.toml` en su volumen de datos antes de poder iniciarse; el asistente de configuración reside en el binario SX, así que crea primero la configuración con la edición SX (consulta [Edición SX](/light-node/sx-edition#first-run-onboard)) y cópiala al volumen. Dentro de un contenedor el panel debe escuchar en todas las interfaces del contenedor, así que establece esto en esa configuración y publica el puerto únicamente en el loopback del host:

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
QORECHAIN_RPC_ADDR=https://rpc.qore.host docker compose up lightnode-ux
```

El contenedor UX conserva los datos en un volumen con nombre en `/root/.qorechain-lightnode` y lee la dirección del RPC de la cadena desde la variable de entorno `QORECHAIN_RPC_ADDR`. La imagen UX no incluye el firmante `qorechaind`, por lo que un contenedor UX no puede enviar heartbeats en la cadena; ejecuta un nodo registrado con la edición SX.

## Ejecución

Inicia el nodo UX:

```bash
build/lightnode-ux start
```

Esto inicia el daemon y el servidor del panel integrado juntos. La edición UX siempre habilita el panel. Al iniciar, el binario imprime la URL del panel.

La edición UX comparte su configuración con la edición SX: lee el mismo `config.toml` desde `~/.qorechain-lightnode` y usa el mismo llavero Dilithium-5. Si aún no has configurado el nodo, ejecuta primero el asistente de SX (`lightnode-sx onboard`) para escribir la configuración e importar o generar tu clave — consulta [Edición SX](/light-node/sx-edition). El binario UX solo tiene los comandos `start` y `version`; usa `lightnode-sx` para `register`, `status` y `keys`. El daemon de la edición UX envía heartbeats del mismo modo que la edición SX cuando hay un firmante `qorechaind` disponible.

## El panel web en el puerto 8420

El panel se expone en el **puerto 8420**. Ese es el puerto que declara la imagen Docker de `lightnode-ux` (`EXPOSE 8420`) y el predeterminado al que se vincula el binario, por lo que al ejecutarse en Docker el panel se publica en el **8420**:

```
http://localhost:8420
```

:::caution Verifica el mapeo de puertos de tu compose
En otras partes del texto se menciona por error el puerto 8080 para el panel. El valor autorizado es **8420** — es el que la imagen realmente expone y al que el daemon se vincula por defecto. Si adaptas tu propio `docker-compose.yml` o un proxy inverso, mapea al **8420**, no al 8080.
:::

:::caution Ninguna ruta del panel autentica
Nada de lo que hay detrás del puerto 8420 tiene inicio de sesión ni control de acceso — cualquiera que pueda alcanzarlo puede leer tu configuración, delegaciones y recompensas; nunca se sirve ninguna clave privada. El binario ahora **usa por defecto solo loopback** (`127.0.0.1:8420`) en lugar de todas las interfaces, y muestra una advertencia al iniciar si lo has configurado para escuchar de forma más amplia — pero la advertencia no es un rechazo, y no añade autenticación. Si amplías deliberadamente el enlace (por ejemplo, para alcanzarlo desde otra máquina, o porque estás publicando el puerto desde Docker), colócalo detrás de un proxy inverso que exija autenticación en lugar de exponerlo directamente. La conexión de telemetría por WebSocket también verifica el `Origin` del navegador, ya que un enlace de red amplio por sí solo no impide que otra página abierta en el mismo navegador se conecte.
:::

## Qué muestra el panel

El panel está organizado en las siguientes vistas:

- **Overview** — altura de bloque y estado del nodo de un vistazo.
- **Validators** — el conjunto de validadores en bonding.
- **Delegation** — las delegaciones reflejadas desde tu cuenta de operador (consulta la limitación conocida en [Recompensas y monitoreo](/light-node/rewards-and-monitoring#how-rewards-work)).
- **Network** — telemetría de red en vivo y encabezados sincronizados recientemente.
- **Bridge** — telemetría del puente entre cadenas.
- **Tokenomics** — telemetría de economía del token.
- **Settings** — la configuración efectiva del nodo.

La telemetría se actualiza en tiempo real; el daemon refresca los datos de validadores, red, puente y tokenomics en intervalos independientes (configurables en `[telemetry]` dentro de `config.toml`).

### Aviso de modo local

Si el nodo **no tiene un endpoint RPC de cadena configurado**, el panel se ejecuta en **modo local únicamente** y muestra un aviso destacado que explica la situación: la pila PQC está verificada, pero el nodo no está sincronizando ninguna cadena, por lo que la altura de bloque permanece en `0`. El aviso te indica que ejecutes el asistente de incorporación en el host:

```bash
lightnode-sx onboard
```

El asistente ejecuta la autoprueba de PQC, solicita tu endpoint de cadena e importa o genera la clave de tu nodo. Una vez configurado un endpoint, reinicia el nodo y el panel comenzará a mostrar datos de la cadena en vivo.

## Próximos pasos

- [Registro y licencias](/light-node/registration-and-licensing) — registra el nodo en la cadena.
- [Recompensas y monitoreo](/light-node/rewards-and-monitoring) — cómo se acredita y se reclama la participación del 3% del light node, y cómo monitorear la salud del nodo.
