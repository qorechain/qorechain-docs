---
slug: /light-node/ux-edition
title: Edición UX (Dashboard web)
sidebar_label: Edición UX
sidebar_position: 3
---

# Edición UX — Dashboard web

La edición **UX (User eXperience)** ejecuta el mismo daemon de nodo ligero que la edición SX, pero añade un **dashboard web integrado** para que puedas vigilar el nodo y la red en un navegador. El binario es `lightnode-ux`. Al igual que la edición SX, esta es la línea **v3.1.1** del nodo ligero (su propia versión, separada de la versión de la cadena).

La edición UX es la opción adecuada para uso de escritorio y para operadores que prefieren una interfaz visual a la línea de comandos.

## Instalación

### Compilar desde el código fuente

La edición UX requiere **Go 1.26.1** y se compila con CGO habilitado para la biblioteca nativa poscuántica:

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Esto produce `build/lightnode-ux`.

### Docker

El servicio UX se compila desde `Dockerfile.ux`:

```bash
docker compose up lightnode-ux
```

El contenedor UX persiste los datos en un volumen con nombre en `/root/.qorechain-lightnode` y lee la dirección RPC de la cadena desde la variable de entorno `QORECHAIN_RPC_ADDR`.

## Ejecución

Inicia el nodo UX:

```bash
build/lightnode-ux start
```

Esto lanza el daemon y el servidor del dashboard integrado de forma conjunta. La edición UX siempre habilita el dashboard. Al arrancar, el binario imprime la URL del dashboard.

La edición UX comparte su configuración con la edición SX: lee el mismo `config.toml` de `~/.qorechain-lightnode` y usa el mismo keyring Dilithium-5. Si aún no has configurado el nodo, ejecuta primero el asistente de SX (`lightnode-sx onboard`) para escribir la configuración e importar o generar tu clave — consulta [Edición SX](/light-node/sx-edition).

## El dashboard web en el puerto 8420

El dashboard se expone en el **puerto 8420**. Ese es el puerto que declara la imagen de Docker `lightnode-ux` (`EXPOSE 8420`) y el valor por defecto al que se enlaza el binario, por lo que al ejecutarse en Docker el dashboard se publica en `8420`:

```
http://localhost:8420
```

:::caution Comprueba el mapeo de puertos de tu compose
Algún texto en otros lugares hace referencia al puerto 8080 para el dashboard. El valor autoritativo es **8420** — es lo que la imagen realmente expone y a lo que el daemon se enlaza por defecto. Si adaptas tu propio `docker-compose.yml` o un proxy inverso, mapea a **8420**, no a 8080.
:::

## Qué muestra el dashboard

El dashboard está organizado en las siguientes vistas:

- **Overview** — altura de bloque y estado del nodo de un vistazo.
- **Validators** — el conjunto de validadores vinculados (bonded).
- **Delegation** — tus delegaciones actuales y su reparto.
- **Network** — telemetría de red en vivo y cabeceras sincronizadas recientemente.
- **Bridge** — telemetría del puente entre cadenas.
- **Tokenomics** — telemetría de la economía del token.
- **Settings** — la configuración efectiva del nodo.

La telemetría se actualiza en tiempo real, con el daemon refrescando los datos de validadores, red, puente y tokenómica en intervalos independientes (configurables bajo `[telemetry]` en `config.toml`).

### Banner de solo local

Si el nodo **no tiene configurado un endpoint RPC de cadena**, el dashboard se ejecuta en **modo solo local** y muestra un banner prominente que explica el estado: el stack PQC está verificado, pero el nodo no sincroniza ninguna cadena, por lo que la altura de bloque permanece en `0`. El banner te invita a ejecutar el asistente de incorporación en el host:

```bash
lightnode-sx onboard
```

El asistente ejecuta el autotest PQC, pide tu endpoint de cadena e importa o genera tu clave de validador. Una vez configurado un endpoint, reinicia el nodo y el dashboard comenzará a mostrar datos de cadena en vivo.

## A dónde ir después

- [Registro y licencias](/light-node/registration-and-licensing) — registra el nodo en la cadena.
- [Recompensas y monitoreo](/light-node/rewards-and-monitoring) — gana la participación del 3 % de nodos ligeros y monitorea el estado del nodo.
