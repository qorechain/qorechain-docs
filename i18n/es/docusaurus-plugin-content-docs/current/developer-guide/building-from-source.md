---
slug: /developer-guide/building-from-source
title: Compilación desde el código fuente
sidebar_label: Compilación desde el código fuente
sidebar_position: 1
---

# Compilación desde el código fuente

Esta guía te explica cómo compilar el binario comunitario `qorechaind` a partir del código fuente público, y aclara para qué sirve ese binario y para qué no.

:::caution Una compilación desde el código fuente no puede unirse a la mainnet ni a la testnet
El repositorio público contiene las interfaces de los módulos con **keepers stub**; las implementaciones de keepers críticas para el consenso y el firmante poscuántico no están en el árbol de código fuente público. Un binario compilado a partir de él no puede reproducir el estado de consenso de las redes, y no puede crear la firma híbrida poscuántica que exige toda transacción de la vía Cosmos. Desde v3.2.3 además **se niega a arrancar** en `qorechain-vladi` o `qorechain-diana` (las reconoce por el id de cadena y la hora de génesis; una devnet local que reutilice un id de cadena público con su propio génesis no se ve afectada). `qorechaind start --community-unenforced-pqc` anula esa negativa para experimentos; el nodo entonces no verifica ninguna firma poscuántica y puede divergir de la red sin previo aviso, así que nunca lo uses para un nodo del que dependas. Para ejecutar un nodo o un validador en la mainnet o la testnet, instala el **binario de la versión publicada** indicado en el manifiesto en vivo (`https://download.qore.host/mainnet/latest.json` o `.../testnet/latest.json`); consulta [Ejecutar un nodo](/developer-guide/running-a-node) y [Ejecutar un validador](/developer-guide/running-a-validator).
:::

## Requisitos previos

| Dependencia         | Versión mínima            | Notas                                              |
| ------------------ | ------------------------- | --------------------------------------------------- |
| **Go**             | 1.26+                     | Necesario para todas las compilaciones               |
| **CGO**            | Activado (`CGO_ENABLED=1`) | Necesario para los puentes FFI de PQC y SVM          |
| **Make**           | 3.81+                     | Automatización de la compilación                     |
| **Git**            | 2.x                       | Descarga del código fuente                           |

Verifica tu entorno:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Toda invocación de `go build`, `go test` y `go run` **debe** tener `CGO_ENABLED=1` configurado. El nodo enlaza bibliotecas nativas (el entorno de ejecución de CosmWasm y, en la compilación de la versión publicada, las bibliotecas PQC y SVM) mediante cgo.
:::

## Bibliotecas nativas

### libqorepqc y libqoresvm

Las bibliotecas poscuántica (`libqorepqc`) y SVM (`libqoresvm`) se compilan a partir de fuentes en Rust que **no forman parte del repositorio público** (no existe un directorio `rust/` en `qorechain-core`). La compilación comunitaria no las necesita. Los archivos de las versiones publicadas para las redes incluyen las bibliotecas compiladas (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) en un directorio `lib/` junto a `qorechaind`; colócalas en `lib/{os}_{arch}/` o indica al cargador dónde están, como se muestra a continuación.

### Configuración de la ruta de bibliotecas

Cuando usas el binario de la versión publicada, sus bibliotecas compartidas deben poder localizarse en tiempo de ejecución. Configura la variable de entorno adecuada para tu plataforma:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Consejo: agrega la exportación a tu perfil de shell (`~/.bashrc`, `~/.zshrc`) para que persista entre sesiones.
:::

## Arquitectura open-core

QoreChain sigue un modelo **open-core**:

* **Compilación comunitaria** — Contiene todas las interfaces de módulos, comandos de CLI, definiciones de protobuf y tipos de mensajes para cada módulo de QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm, etc.). Los keepers de los módulos propietarios usan **implementaciones stub** que devuelven valores predeterminados seguros o respuestas no-op. Esto permite que herramientas de terceros, wallets e indexadores se integren con todas las API de QoreChain sin necesitar código propietario.
* **Compilación completa** — Contiene las implementaciones completas de los keepers (la lógica real de los módulos, crítica para el consenso, y el firmante poscuántico). Se distribuye como los binarios de la versión publicados en [download.qore.host](https://download.qore.host); no se compila a partir del árbol de código fuente público.

Ambas compilaciones producen el mismo binario llamado `qorechaind` y exponen los mismos comandos de CLI. La diferencia está en el comportamiento en tiempo de ejecución de la lógica de los keepers detrás de esas interfaces.

## Compilación comunitaria

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Esto compila todas las interfaces de módulos públicos con keepers stub para las funciones propietarias. El binario resultante está pensado para:

* Desarrollo y pruebas locales (por ejemplo, una devnet de un solo nodo)
* Consultar una red (los comandos `query ...` funcionan contra cualquier nodo)
* Construir integraciones y herramientas de terceros sobre las interfaces de los módulos

No es una forma de unirse a la mainnet o la testnet como validador ni de transaccionar allí: no tiene firmante poscuántico (`tx pqc gen-key` y `tx pqc cosign` devuelven un error) y sus keepers stub no reproducen las reglas de consenso de las redes.

## Compilación completa (binario de la versión publicada)

Las implementaciones completas de los keepers, y el firmante que está detrás de `tx pqc gen-key` y `tx pqc cosign`, no están en el árbol de código fuente público, por lo que no pueden compilarse a partir de él. Los binarios publicados en [download.qore.host](https://download.qore.host) son la compilación completa; úsalos para la mainnet y la testnet.

## Ejecución de pruebas

```bash
CGO_ENABLED=1 go test ./... -count=1
```

La bandera `-count=1` desactiva la caché de pruebas, garantizando una ejecución limpia cada vez. Las pruebas de paquetes individuales se pueden ejecutar con:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Las pruebas que ejercitan las bibliotecas nativas o los keepers propietarios solo se compilan en la compilación completa y no forman parte de la suite pública.

## Verificación de la compilación

Tras una compilación exitosa, verifica el binario:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

El comando `init` debería crear un archivo de génesis y una configuración de nodo en `~/.qorechaind/` sin errores. El ejemplo anterior se inicializa contra la testnet **`qorechain-diana`** — para mainnet, sustituye por `--chain-id qorechain-vladi`, la red en vivo (versión de nodo **v3.2.3**).

## Compilación con Docker

Se proporciona un Dockerfile en la raíz del repositorio:

```bash
docker build -t qorechaind:community .
```

Compila el binario **comunitario** (su propio comentario dice «Public build — no PQC library»), por lo que la imagen sirve para el desarrollo local y las herramientas, no para seguir la mainnet o la testnet. Para ejecutar un nodo de red en Docker, envuelve en su lugar el binario de la versión publicada; consulta [Ejecutar un nodo](/developer-guide/running-a-node#docker-compose).

## Solución de problemas

<details>

<summary>cgo: C compiler not found</summary>

Instala las herramientas de línea de comandos de Xcode (macOS) o `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Estás enlazando una compilación que espera las bibliotecas nativas. Usa la compilación comunitaria (no las necesita) o el archivo de la versión publicada, que las incluye, y configura `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` apuntando a su directorio `lib/`

</details>

<details>

<summary>undefined: sonic.*</summary>

Asegúrate de que `go.sum` esté actualizado: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Aumenta la memoria disponible (algo común en Docker con límites bajos)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Los tamaños de ML-DSA-87 son: clave pública 2.592 bytes, clave secreta 4.896 bytes y firma 4.627 bytes. Cualquier otro tamaño indica un algoritmo distinto o un valor truncado.

</details>
