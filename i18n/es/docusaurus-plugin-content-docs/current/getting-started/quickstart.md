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
docker compose up -d
```

Esto inicia los siguientes servicios:

| Servicio            | Puertos                                                                   | Descripción                                  |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Nodo blockchain completo con soporte multi-VM   |
| **ai-sidecar**     | `50051`                                                                 | Motor de detección de anomalías y puntuación de riesgo de QCAI |
| **indexer**        | --                                                                      | Indexador de bloques para consultas históricas         |
| **postgres**       | `5432`                                                                  | Backend de base de datos para el indexador             |
| **prometheus**     | `9091`                                                                  | Recopilación de métricas                           |
| **grafana**        | `3001`                                                                  | Paneles de monitorización                        |

Una vez que todos los contenedores estén en buen estado, tu nodo comienza a sincronizar con la red.

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

### Inicializar el nodo

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Esto crea la configuración y los directorios de datos por defecto en `~/.qorechaind/`.

### Iniciar el nodo

```bash
./qorechaind start
```

El nodo se inicia con la configuración por defecto. Consulta [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) para unirte a la red activa con la configuración adecuada de génesis y pares.

:::note
Los ejemplos de esta página se dirigen a la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**). La red principal (**`qorechain-vladi`**, ID de cadena EVM **9801**) está activa desde el 7 de junio de 2026 y tiene su propia página dedicada **Conexión a la red principal**.
:::

---

## Verificar la instalación

Confirma que tu nodo se está ejecutando correctamente:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Una respuesta correcta incluye el `moniker` del nodo, la `network` (debería ser `qorechain-diana`) y la altura de bloque actual.

---

## Próximos pasos

* [Conexión a la red de pruebas](/getting-started/connecting-to-testnet) — Únete a la red de pruebas activa Diana
* [Configuración de la cartera](/getting-started/wallet-setup) — Configura una cartera para interactuar con la cadena
* [Tu primera transacción](/getting-started/first-transaction) — Envía tu primera transferencia de QOR
* [Conexión a la red principal](/getting-started/connecting-to-mainnet) — Únete a la red principal activa Vladi
* [Descripción general del SDK](/sdk/overview) — Crea aplicaciones contra QoreChain desde código
