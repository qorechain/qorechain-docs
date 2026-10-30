---
slug: /getting-started/quickstart
title: Inicio rápido
sidebar_label: Inicio rápido
sidebar_position: 1
---

# Inicio rápido

Pon en marcha un nodo de QoreChain en minutos. Elige Docker Compose para la configuración más rápida, o compila desde el código fuente para un control total.

---

## Docker Compose (recomendado)

La forma más sencilla de ejecutar un entorno completo de QoreChain con todos los servicios preconfigurados.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
cp .env.example .env
cp .env.sidecar.example .env.sidecar
# edit .env and set GRAFANA_PASSWORD (Compose refuses to start without it)
docker compose up -d
```

Antes del primer arranque, copia `.env.example` a `.env` y `.env.sidecar.example` a `.env.sidecar` (como arriba) y establece `GRAFANA_PASSWORD`.

Esto inicia los siguientes servicios:

| Servicio            | Puertos                                                                   | Descripción                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` / `8546` (EVM) | Nodo blockchain completo con soporte multi-VM   |
| **ai-sidecar**     | `50051`                                                                 | Motor de detección de anomalías y puntuación de riesgo de QCAI |
| **indexer**        | --                                                                      | Indexador de bloques para consultas históricas         |
| **postgres**       | `5432`                                                                  | Backend de base de datos para el indexador             |
| **prometheus**     | `9091`                                                                  | Recopilación de métricas                           |
| **grafana**        | `3001`                                                                  | Paneles de monitorización                        |

Una vez que todos los contenedores estén en buen estado, tendrás una **cadena de desarrollo local de un solo nodo** (inicializa su propio génesis; no se une a la red principal ni a la red de pruebas). Para unirte a una red activa, sigue las páginas [Conexión a la red principal](/getting-started/connecting-to-mainnet) o [Conexión a la red de pruebas](/getting-started/connecting-to-testnet).

---

## Compilar desde el código fuente

### Requisitos previos

* **Go 1.26+** con CGO habilitado
* **Cadena de herramientas de Rust** (para compilar la criptografía PQC y las bibliotecas del runtime SVM)
* **Git**

### Compilar el binario

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

:::caution Una compilación desde el código fuente es para desarrollo local
El árbol de código fuente público compila el binario de la comunidad. Tiene el conjunto completo de comandos pero no el firmante poscuántico: `tx pqc gen-key` y `tx pqc cosign` devuelven un error ("requires the full build"), por lo que no puede crear transacciones para una red que exige firmas híbridas, y sus keepers stub no reproducen el estado de consenso de las redes. Para unirte o realizar transacciones en la red principal o en la red de pruebas, instala el binario de la versión publicada indicado en `latest.json` en [download.qore.host](https://download.qore.host).
:::

### Inicializar el nodo

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Esto crea la configuración y los directorios de datos por defecto en `~/.qorechaind/`. Iniciado por sí solo, el nodo forma una cadena local de un solo nodo; para unirte a una red activa, sigue las páginas de conexión.

### Iniciar el nodo

```bash
./qorechaind start
```

El nodo se inicia con la configuración por defecto. Consulta [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) para unirte a la red activa con la configuración adecuada de génesis y pares.

:::note
Los ejemplos de esta página se dirigen a la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**). La red principal (**`qorechain-vladi`**, ID de cadena EVM **9801**) está activa desde el 7 de junio de 2026 (versión v3.2.5 desde el 29 de octubre de 2026; la red de pruebas ejecuta v3.2.6 desde el 27 de octubre de 2026) y tiene su propia página dedicada **Conexión a la red principal**.
:::

---

## Verificar la instalación

Confirma que tu nodo se está ejecutando correctamente:

```bash
# Check that the binary runs
./qorechaind --help
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Una respuesta correcta incluye el `moniker` del nodo, la `network` (`qorechain-diana` para la cadena de desarrollo local creada arriba, o la cadena a la que te hayas unido) y la altura de bloque actual.

---

## Próximos pasos

* [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) — Únete a la red de pruebas activa Diana
* [Configuración de la cartera](/getting-started/wallet-setup) — Configura una cartera para interactuar con la cadena
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
* [Conexión a la red principal](/getting-started/connecting-to-mainnet) — Únete a la red principal activa Vladi
* [Descripción general del SDK](/sdk/overview) — Crea aplicaciones contra QoreChain desde código
