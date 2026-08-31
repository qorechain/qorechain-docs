---
slug: /developer-guide/building-from-source
title: Compilación desde el código fuente
sidebar_label: Compilación desde el código fuente
sidebar_position: 1
---

# Compilación desde el código fuente

Esta guía te explica cómo compilar el binario `qorechaind` desde el código fuente, cubriendo tanto la compilación comunitaria (open-core) como la compilación completa propietaria.

## Requisitos previos

| Dependencia         | Versión mínima            | Notas                                              |
| ------------------ | ------------------------- | --------------------------------------------------- |
| **Go**             | 1.26+                     | Necesario para todas las compilaciones               |
| **CGO**            | Activado (`CGO_ENABLED=1`) | Necesario para los puentes FFI de PQC y SVM          |
| **Toolchain de Rust** | Última versión estable     | Necesario para compilar `libqorepqc` y `libqoresvm` |
| **Make**           | 3.81+                     | Automatización de la compilación                     |
| **Git**            | 2.x                       | Descarga del código fuente                           |

Verifica tu entorno:

```bash
go version        # go1.26.x o superior
rustc --version   # toolchain estable
cargo --version
echo $CGO_ENABLED # debe ser 1
```

:::danger
Toda invocación de `go build`, `go test` y `go run` **debe** tener `CGO_ENABLED=1` configurado. Los módulos PQC y SVM usan puentes FFI que requieren cgo.
:::

## Bibliotecas nativas

QoreChain depende de dos bibliotecas nativas compiladas en Rust que se cargan en tiempo de ejecución.

### libqorepqc (Criptografía poscuántica)

La biblioteca PQC proporciona generación de claves, firma y verificación ML-DSA-87 (Dilithium-5) a través de una interfaz FFI compatible con C.

```bash
cd rust/qorepqc
cargo build --release
```

La biblioteca compilada se coloca en `lib/{os}_{arch}/`:

| Plataforma  | Archivo de biblioteca | Directorio           |
| ----------- | ---------------------- | -------------------- |
| macOS arm64 | `libqorepqc.dylib`     | `lib/darwin_arm64/`  |
| Linux amd64 | `libqorepqc.so`        | `lib/linux_amd64/`   |
| Linux arm64 | `libqorepqc.so`        | `lib/linux_arm64/`   |

### libqoresvm (Entorno de ejecución SVM)

La biblioteca SVM proporciona el entorno de ejecución de programas BPF para el módulo x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

La salida sigue la misma convención `lib/{os}_{arch}/` descrita arriba (`libqoresvm.dylib` en macOS, `libqoresvm.so` en Linux).

### Configuración de la ruta de bibliotecas

Las bibliotecas nativas deben poder localizarse en tiempo de ejecución. Configura la variable de entorno adecuada para tu plataforma:

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
* **Compilación completa (propietaria)** — Habilita las implementaciones completas de los keepers detrás de la etiqueta de compilación `proprietary`. Esto incluye la lógica real de detección de anomalías por IA, el ajuste de parámetros de consenso PRISM, la puntuación de reputación avanzada y todas las funciones de nivel de producción.

Ambas compilaciones producen el mismo binario llamado `qorechaind` y exponen comandos de CLI y endpoints gRPC/REST idénticos. La diferencia está en el comportamiento en tiempo de ejecución de la lógica de los keepers detrás de esas interfaces.

## Compilación comunitaria

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Esto compila todas las interfaces de módulos públicos con keepers stub para las funciones propietarias. El binario resultante es completamente funcional para:

* Ejecutar un nodo validador
* Enviar y consultar transacciones
* Interactuar con las VM de EVM, CosmWasm y SVM
* Construir integraciones y herramientas de terceros
* Desarrollo y pruebas locales

## Compilación completa (propietaria)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

La bandera `-tags proprietary` activa las implementaciones completas de los keepers, que no forman parte del árbol de código fuente público.

## Ejecución de pruebas

```bash
CGO_ENABLED=1 go test ./... -count=1
```

La bandera `-count=1` desactiva la caché de pruebas, garantizando una ejecución limpia cada vez. Las pruebas de paquetes individuales se pueden ejecutar con:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Ejecuta las pruebas de las bibliotecas de Rust por separado:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Verificación de la compilación

Tras una compilación exitosa, verifica el binario:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

El comando `init` debería crear un archivo de génesis y una configuración de nodo en `~/.qorechaind/` sin errores. El ejemplo anterior se inicializa contra la testnet **`qorechain-diana`** — para mainnet, sustituye por `--chain-id qorechain-vladi`, la red en vivo que ejecuta la versión de cadena **v3.1.95**.

## Compilación con Docker

Para compilaciones en contenedores, se proporciona un Dockerfile en la raíz del repositorio:

```bash
docker build -t qorechaind:latest .
```

La imagen de Docker se encarga automáticamente de toda la compilación de bibliotecas nativas y la configuración de rutas. Consulta la guía de [Inicio rápido](/getting-started/quickstart) para ejecutar un nodo con Docker Compose.

## Solución de problemas

<details>

<summary>cgo: C compiler not found</summary>

Instala las herramientas de línea de comandos de Xcode (macOS) o `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Compila primero las bibliotecas de Rust y configura `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

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

Verifica que estás usando `pqcrypto v0.5.0+` (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
