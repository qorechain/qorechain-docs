---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community es una herramienta de línea de comandos que hace el inventario de la criptografía de un despliegue de QoreChain y escribe el resultado como un CBOM (lista de materiales criptográficos) CycloneDX 1.6. Lee el directorio home de un nodo, el estado en vivo de la red, endpoints TLS y fuentes de Solidity, y registra cada algoritmo, protocolo, certificado y clave que encuentra, con el archivo y la línea o el endpoint donde apareció.

Está pensada para operadores de validadores y de nodos, equipos de cumplimiento y de riesgos, auditores que preparan un paquete de evidencias y equipos de Solidity que quieren saber de qué esquemas de firma dependen sus contratos. A partir del CBOM genera informes en Markdown alineados con la Guidance 05/2026 de la FINMA, la hoja de ruta poscuántica del Grupo de Cooperación NIS de la UE y las RTS de DORA sobre gestión del riesgo de las TIC (artículo 6), con un estado por algoritmo frente a FIPS 203, 204 y 205 y NIST IR 8547.

Versión **0.1.0**, publicada el 27 de octubre de 2026, Apache-2.0. Lee mainnet (`qorechain-vladi`) y testnet (`qorechain-diana`) a través de sus endpoints REST públicos, o de cualquier endpoint REST que le indiques.

QoreScan es una ayuda de inventario. No es una certificación, una auditoría ni un dictamen jurídico, y no establece la conformidad con ninguna normativa ni estándar. Todo lo que el escaneo no puede establecer queda como "To be completed".

## Innovaciones {#innovations}

- **Un CBOM en un formato estándar.** Cada hallazgo es un componente `cryptographic-asset` de CycloneDX 1.6 con `cryptoProperties` (tipo de activo, primitiva, conjunto de parámetros, curva, nivel de seguridad clásico, categoría de seguridad cuántica de NIST, OID) y `evidence.occurrences` (archivo y línea, o endpoint). Los certificados se enlazan con su algoritmo de firma y su clave pública, los protocolos con los algoritmos que usan, las bibliotecas con los algoritmos que proporcionan. Cada CBOM escrito en las pruebas del proyecto se valida contra el esquema JSON oficial de CycloneDX 1.6, y se comprueba que cada `bom-ref` usado esté definido, de modo que la salida se carga en cualquier consumidor de CycloneDX 1.6.
- **Fuentes conscientes de la cadena.** Además de archivos y TLS, lee la propia QoreChain: los parámetros PQC, los interruptores de protocolo relacionados con PQC, los tipos de clave de consenso del conjunto de validadores activo y los precompiles EVM activos, y, para cada cuenta que nombres, si tiene una clave PQC registrada, su algoritmo, su tipo de clave (híbrida, solo PQC, solo clásica) y el tamaño de su clave pública.
- **El intercambio de claves híbrido es visible.** Un handshake TLS por endpoint registra la versión, la suite de cifrado, el grupo de intercambio de claves (incluidos los grupos híbridos ML-KEM como `X25519MLKEM768`), ALPN, SNI y cada certificado que envió el servidor.
- **Nunca se leen los valores de las claves privadas.** Los archivos de claves se decodifican en estructuras que no tienen campo para la clave privada, de modo que esos bytes nunca se decodifican, almacenan, registran ni escriben. Una prueba falla si esas estructuras ganan un campo capaz de contener datos privados, y otra prueba escanea un home de nodo con claves recién generadas y comprueba que ninguna codificación de ellas aparezca en ninguna salida.
- **Cada algoritmo recibe una clasificación y un estado de transición.** `post-quantum`, `hybrid`, `quantum-vulnerable` o `symmetric`, con su categoría de seguridad cuántica de NIST cuando está definida, y su estado frente a FIPS 203, 204, 205 y el calendario de NIST IR 8547.
- **Salida reproducible.** La marca de tiempo del CBOM es la hora actual, o `SOURCE_DATE_EPOCH` cuando está definida. El número de serie se deriva del contenido, así que la misma entrada a la misma hora da el mismo documento.
- **Wrappers que comprueban lo que ejecutan.** Los paquetes de npm y PyPI descargan bajo demanda el binario de la release para tu plataforma y comparan su SHA-256 con los digests incluidos dentro del paquete. Rechazan un binario que no coincida, tanto tras la descarga como en cada ejecución posterior de la copia en caché. No se ejecuta ningún script de instalación en `npm install`.
- **Sin código de terceros en el binario.** El binario `qorescan` usa la biblioteca estándar de Go para escanear (el validador del esquema JSON lo usan sus pruebas). No reutiliza código de los proyectos PQCA CBOMkit; su salida se carga en el visor de CBOMkit.

## Casos de uso {#use-cases}

1. **Un equipo de cumplimiento que produce un CBOM para un supervisor.** Una institución financiera suiza que ejecuta un nodo de QoreChain debe mostrar un inventario de los métodos criptográficos de sus sistemas de TIC, incluida la tecnología de registro distribuido (FINMA Guidance 05/2026, sección 3.2). Ejecuta `qorescan scan --node-home ... --network mainnet`, adjunta el CBOM y `qorescan report --framework finma` a su análisis de riesgos, y completa a mano las secciones organizativas.
2. **Un validador que audita su propio nodo.** Un operador quiere confirmar qué tipo de clave de consenso usa el validador, si los archivos de claves son legibles por otros usuarios, si hay listeners de RPC o de JSON-RPC de EVM expuestos sin TLS y si hay un firmante remoto configurado. `qorescan scan --node-home ~/.qorechain` registra todo esto sin abrir los valores de las claves privadas.
3. **Comprobar cuentas antes de depender de ellas.** Una mesa de custodia o un equipo de integración de un exchange quiere saber si las direcciones de tesorería o de cartera caliente tienen una clave ML-DSA-87 registrada y si es híbrida. `qorescan scan --network mainnet --address qor1... --address qor1...` escribe en el CBOM el estado de la clave PQC de cada cuenta. Consulta el [custody kit](/developer-tools/custody-kit).
4. **Un equipo de Solidity que porta contratos.** Un equipo que traslada contratos desde Ethereum quiere una lista de cada lugar que depende de `ecrecover`, de `ECDSA` de OpenZeppelin, de P-256 o de RSA, y de cada lugar que ya llama a los precompiles PQC de QoreChain. `qorescan solidity ./contracts` lista cada uso con archivo y línea.
5. **Revisión de endpoints.** Un equipo de plataforma quiere saber si sus endpoints públicos de RPC, REST o de API de cartera negocian un intercambio de claves poscuántico híbrido con clientes modernos. `qorescan tls api.example.org:443` registra el grupo negociado, la suite de cifrado y la cadena de certificados.
6. **Una puerta de CI en cada pull request.** Un repositorio de dApp añade la GitHub Action de QoreScan para que cada cambio produzca un CBOM nuevo y un informe DORA o FINMA como artefactos de la compilación, y los revisores puedan ver cuándo entra en el código un nuevo esquema de firma o de hash.
7. **Due diligence de proveedores.** Una empresa regulada envía a un proveedor de servicios la salida de `qorescan template questionnaire`, rellenada de antemano con lo que el escaneo de los endpoints de ese proveedor ya muestra, para que el proveedor responda solo a los puntos abiertos.
8. **Entidades de la UE que se preparan para la hoja de ruta NIS y DORA.** Una entidad usa `qorescan report --framework nis` y `--framework dora` para mostrar dónde su inventario alimenta el paso de gestión de activos criptográficos y el artículo 6 de las RTS de DORA.

## Cómo funciona {#how-it-works}

### Fuentes {#sources}

- **Home del nodo** (`--node-home DIR`). Lee `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` y los archivos de certificado que nombran. Registra el transporte P2P y sus algoritmos, los certificados TLS de RPC y de JSON-RPC de EVM, los listeners en direcciones no loopback sin TLS, un firmante remoto, los tipos de clave del validador y del nodo y sus claves públicas, los permisos de los archivos de claves, los parámetros del módulo `pqc` en el génesis, el registro de algoritmos on-chain en el génesis y los tipos de clave de consenso de los validadores.
- **Red** (`--network mainnet|testnet` o `--rest URL`). Lee por REST los interruptores de protocolo relacionados con PQC, los parámetros de `pqc`, los tipos de clave de consenso del conjunto de validadores activo y los precompiles EVM activos.
- **Cuentas** (`--address ADDR`, repetible). Lee por REST la clave PQC registrada de cada cuenta.
- **TLS** (`--tls HOST:PORT`, repetible). Un handshake por endpoint.
- **Solidity** (`--solidity PATH`, repetible). Detección basada en texto de `ecrecover`, de las llamadas a los precompiles ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) y P-256 (`0x100`), de `keccak256`, `sha256`, `ripemd160`, y de las importaciones de las bibliotecas de firma de OpenZeppelin, Solady e `IQorePQC.sol`. Los precompiles pqcVerify y pqcKeyStatus están activos solo en testnet; ninguno está activo en mainnet. Consulta [Precompiles EVM](/developer-guide/evm-precompiles).

### Lecturas de red {#network-reads}

Cada petición a la red es un HTTP GET. Las rutas que lee son la ruta de información del nodo, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, la ruta del último conjunto de validadores, `/cosmos/evm/vm/v1/params` y `/qorechain/pqc/v1/account/{address}`. Una ruta que un nodo no sirve se convierte en una nota en el CBOM, no en un error.

### Clasificación {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) y LMS/XMSS son `post-quantum`. Un intercambio de claves clásico combinado con ML-KEM es `hybrid`. RSA, ECDSA, EdDSA, Diffie-Hellman de campo finito y de curva elíptica y las firmas basadas en emparejamientos son `quantum-vulnerable`, con el calendario de NIST IR 8547 "deprecated after 2030, disallowed after 2035". Los cifrados de bloque, los AEAD, los hashes, las XOF y las KDF son `symmetric`. QoreScan aplica el calendario de IR 8547 a cada curva de las familias ECDSA, EdDSA y ECDH, incluidas secp256k1 y X25519, porque la exposición cuántica es la misma. Estas son clasificaciones de inventario, no afirmaciones sobre la aprobación de NIST.

### Salida {#output}

QoreScan añade unas pocas propiedades `qorescan:*` (clasificación, transición de NIST IR 8547, estándar, fuente) y registra los hechos escaneados, las notas y una propiedad de descargo de responsabilidad en los metadatos del CBOM. Las rutas de evidencia son relativas al directorio escaneado.

Un informe contiene la tabla de correspondencia con el marco, un resumen por clasificación, cada algoritmo con su categoría NIST, su estado frente a FIPS 203, 204, 205 y NIST IR 8547 y su evidencia, y después protocolos, certificados, claves, bibliotecas, hechos escaneados, notas del escaneo y las fuentes citadas. Los puntos organizativos dicen "To be completed".

### Correspondencia con los marcos {#frameworks}

| Marco | Fuente | Dónde sirve el inventario como entrada |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 9 de julio de 2026, sección 3 | 3.2 inventario (el CBOM); 3.3 datos críticos (intercambio de claves de los transportes escaneados, modo de firma híbrida del carril nativo); 3.4 agilidad criptográfica (registro de algoritmos, periodo de migración, interruptores de protocolo); 3.5 proveedores (emisores de certificados, el cuestionario). 3.1 estrategia es organizativa. |
| `nis` | NIS Cooperation Group, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Part 1, v1.1, 11 de junio de 2025 | Gestión de activos criptográficos (el CBOM); los hitos de 2030 y 2035 (la lista de algoritmos `quantum-vulnerable`); agilidad. |
| `dora` | Reglamento Delegado (UE) 2024/1774 de la Comisión, artículo 6 | 6(2)(a) y (c) registros de transporte y listeners sin TLS; 6(2)(d) registros de claves (tipos y claves públicas); 6(3) cada algoritmo frente a FIPS y NIST IR 8547; 6(4) registro, periodo de migración, interruptores. 6(1) y 6(5) son organizativos. |

## Cómo usarlo {#how-to-use}

### Instalar {#install}

| Canal | Comando de instalación | Plataforma mínima |
|---|---|---|
| Binario de la release | Descarga `qorescan_0.1.0_<os>_<arch>` (o el `.tar.gz` o `.zip`; los binarios de Windows terminan en `.exe`) de la [release de GitHub](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) y compáralo con `qorescan_0.1.0_checksums.txt` | macOS, Linux o Windows en amd64 o arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 o posterior |
| PyPI | `pipx run qorescan scan ...` (o `pip install qorescan`) | Python 3.9 o posterior |
| Docker | `docker build -t qorescan .` desde el repositorio (no se publica ninguna imagen prediseñada) | Docker; la imagen es distroless y se ejecuta como el usuario 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | Runner alojado en GitHub o autoalojado; la action compila QoreScan desde su propio código fuente con `actions/setup-go` |

Variables de entorno de ambos wrappers:

| Variable | Efecto |
|---|---|
| `QORESCAN_CACHE_DIR` | Dónde se guarda en caché el binario (por defecto: el directorio de caché del usuario). |
| `QORESCAN_DOWNLOAD_BASE` | Descarga desde un mirror en lugar de GitHub. La comprobación del digest se sigue aplicando. |

### Inicio rápido {#quickstart}

QoreScan envía peticiones GET y un handshake TLS por endpoint, no firma nada y no necesita ninguna clave. Los comandos de abajo se ejecutaron el 27 de octubre de 2026 contra la testnet pública, con un binario compilado desde el código fuente de la v0.1.0.

**1. Escanea el estado de la testnet, una cuenta, el TLS del endpoint REST público de la testnet y una carpeta de fuentes de Solidity:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

Terminó con el código 0. El CBOM registró, entre otras cosas, el chain id `qorechain-diana`, el modo de firma híbrida del carril nativo `required`, la clave PQC híbrida de la cuenta (la cuenta del faucet de la testnet), las claves de consenso Ed25519 del conjunto de validadores, TLS 1.3 con el grupo híbrido `X25519MLKEM768` y los algoritmos encontrados en las fuentes de Solidity.

Una segunda ejecución solo de las partes de red y TLS, hecha mientras se escribía esta página, produjo un CBOM de 21 componentes, entre ellos ML-DSA-87, `X25519MLKEM768`, una entrada de protocolo TLS 1.3 para `api-testnet.qore.host:443`, su cadena de certificados y las claves Ed25519 del conjunto de validadores.

**2. Escribe un informe FINMA a partir del CBOM:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

El informe se abre con el descargo de responsabilidad, después la tabla de correspondencia (secciones 3.1 a 3.5), un resumen por clasificación y una fila por algoritmo con su estado frente a FIPS y NIST IR 8547 y su evidencia. Un escaneo de un único archivo de Solidity que usa `ecrecover` produjo un CBOM CycloneDX 1.6 con un componente (`ECDSA secp256k1`) y la misma cabecera de informe. Un nombre de marco desconocido termina con el código 2 y un mensaje que lista `finma`, `nis` y `dora`.

**3. Rellena de antemano el cuestionario para proveedores y la declaración de agilidad:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Escanea tu propio nodo.** Basta con acceso de lectura al home del nodo:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Con Docker, monta el home del nodo en solo lectura para que el contenedor no pueda modificarlo:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. A través de los wrappers los comandos son los mismos:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. En GitHub Actions.** Fija la action y todas las demás actions por commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Entradas de la action: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (listas separadas por espacios o saltos de línea), `out` (por defecto `qorescan.cbom.json`) y `framework`. Salidas: `cbom` y `report`. La action compila QoreScan desde su propio código fuente en el commit fijado, así que no se descarga ningún binario.

Lo que se ejecutó para esta página: el escaneo de la testnet, el escaneo de Solidity, el informe FINMA y el error de marco desconocido, con un binario compilado desde el código fuente de la v0.1.0. No se ejecutaron los binarios publicados, los wrappers de npm y PyPI (más allá de leer el contenido de sus paquetes y sus entradas de registro), la imagen de Docker ni la GitHub Action.

### Comandos y flags {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Los flags pueden ir antes o después de los argumentos posicionales. `--out -` (el valor por defecto) escribe en la salida estándar. `qorescan <command> -h` imprime los flags de un comando.

| Comando | Flag | Qué hace |
|---|---|---|
| `scan` | `--node-home DIR` | Directorio home del nodo (el que contiene `config/`). |
| `scan` | `--network mainnet\|testnet` | Lee el estado en vivo de `https://api.qore.host` o `https://api-testnet.qore.host`. |
| `scan` | `--rest URL` | Usa en su lugar cualquier endpoint REST, por ejemplo tu propio nodo (`http://127.0.0.1:1317`) o un relay que reenvíe peticiones GET. Prevalece sobre `--network`. |
| `scan` | `--address ADDR` | Cuenta cuyo estado de clave PQC se lee. Repetible. Requiere `--network` o `--rest`. |
| `scan` | `--tls HOST:PORT` | Endpoint TLS con el que hacer el handshake. Repetible. Puerto 443 si se omite. |
| `scan` | `--solidity PATH` | Directorio o archivo `.sol`. Repetible. |
| `scan`, `solidity` | `--include-deps` | Escanea también `node_modules`, `lib`, `out`, `cache`, `artifacts` y `typechain-types`, que se omiten por defecto. |
| `scan` | `--name NAME` | Nombre del despliegue escaneado en los metadatos del CBOM. |
| `scan` | `--timeout D` | Tiempo de espera de red por petición (por defecto `20s`). |
| `tls` | `--servername NAME` | Nombre de servidor SNI (por defecto: el host). |
| `tls` | `--timeout D` | Tiempo de espera del handshake (por defecto `15s`). |
| todos los escaneos | `--verbose` | Registra en la salida de error estándar cada archivo leído y cada petición. |
| todos | `--out FILE` | Archivo de salida, `-` para la salida estándar. |
| `report` | `--framework finma\|nis\|dora` | El marco al que mapear. Obligatorio. |
| `report`, `template` | `--cbom FILE` | El CBOM que se lee, `-` para la entrada estándar. Obligatorio. |
| `template` | `agility` o `questionnaire` | Qué plantilla escribir. |

Otros comandos: `qorescan tls` es un escaneo TLS por sí solo, `qorescan solidity` es un escaneo de Solidity por sí solo, `qorescan template agility` escribe una declaración de agilidad criptográfica rellenada de antemano con los hechos escaneados, `qorescan template questionnaire` escribe un cuestionario de cinco preguntas para proveedores que sigue las cinco medidas de la sección 3 de FINMA Guidance 05/2026, y `qorescan report` también acepta un CBOM CycloneDX 1.6 escrito por otra herramienta (la clasificación entonces va por el nombre del algoritmo).

Códigos de salida: `0` éxito, `1` un error de escaneo o de E/S, `2` un error de uso.

## Cómo acceder {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| REST usado por `--network` | `https://api.qore.host` | `https://api-testnet.qore.host` |

- No se necesita ninguna clave, cuenta ni fondos. QoreScan nunca firma ni envía una transacción, y no escribe nada salvo el archivo de salida que nombres.
- No todos los nodos sirven todas las rutas. El 27 de octubre de 2026 el endpoint REST público de mainnet no servía `/qorechain/pqc/v1/params`; el escaneo registra entonces una nota y continúa. Apunta `--rest` a tu propio nodo para obtener una imagen más completa.
- El registro de algoritmos on-chain no se expone por REST. QoreScan lo lee de `genesis.json` cuando se escanea un home de nodo.
- El escaneo refleja la versión de la cadena del nodo que lee. Los interruptores de protocolo y los precompiles activos difieren entre mainnet y testnet; el CBOM registra lo que informa el nodo consultado.
- Si tu máquina no puede alcanzar los endpoints públicos, usa `--rest` con un nodo que ejecutes tú, o con un relay que reenvíe peticiones GET.
- Dependencias: los wrappers de npm y PyPI usan solo los módulos integrados de su lenguaje.

## Notas de seguridad {#security}

- **Nunca se leen los valores de las claves privadas.** De `priv_validator_key.json`, QoreScan toma la dirección, la clave pública y los nombres de los tipos de clave. De `node_key.json` toma solo el tipo de clave; el ID del nodo no se deriva, porque eso requeriría la clave privada. El búfer sin procesar del archivo se sobrescribe tras la decodificación, y los errores de decodificación, que podrían citar la entrada, nunca se devuelven.
- Los directorios de keyring (`keyring-*`) y los archivos de claves nombrados por `tls_key_file` y `tls.key-path` no se abren. QoreScan registra solo que existen o están configurados. Los demás bloques PEM de un archivo de certificado se omiten sin decodificarse.
- Cada petición a la red es un HTTP GET. No se escribe nada salvo el archivo de salida.
- Los wrappers de npm y PyPI verifican el SHA-256 del binario antes de cada ejecución y rechazan una discrepancia, también cuando se usa un mirror. Para la release 0.1.0, los digests dentro del paquete de npm coinciden con el archivo de checksums de la release.
- La imagen de Docker es distroless y se ejecuta como un usuario sin privilegios de root. Monta el home del nodo con `:ro`.
- Comunica las vulnerabilidades de forma privada a security@qore.network.

## Dónde está publicado {#where-published}

Las versiones se leyeron de cada registro el 27 de octubre de 2026.

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| Release de GitHub | `qorechain/qorescan` | v0.1.0 (publicada el 27 de octubre de 2026), binarios para darwin, linux y windows en amd64 y arm64, más `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (comando `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 o posterior) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Proxy de módulos de Go | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Código fuente: https://github.com/qorechain/qorescan (Apache-2.0, copyright 2026 QoreChain Association). No hay paquete en crates.io ni en Maven ni imagen de Docker prediseñada; compila la imagen desde el repositorio. El repositorio documenta cada flag en `docs/usage.md`, lo que se lee y lo que nunca se lee en `docs/scanned-data.md`, la correspondencia con los marcos y sus fuentes en `docs/frameworks.md`, y los límites en `docs/limitations.md`.

## Límites y problemas conocidos {#limits}

- **Una ayuda de inventario.** No certifica, no audita ni da asesoramiento jurídico, y sus informes no establecen la conformidad con ninguna normativa ni estándar. Las medidas organizativas (estrategia, hoja de ruta, clasificación de datos, responsabilidades) quedan como "To be completed".
- **Alcance.** QoreScan escanea solo las fuentes que le indiques. Los datos almacenados, las copias de seguridad, los HSM, los sistemas de gestión de claves, la configuración del sistema operativo y de las bibliotecas, las carteras, los puentes y los servicios off-chain quedan fuera del escaneo salvo que añadas sus endpoints TLS con `--tls`. No escanea puentes.
- **Estado en vivo.** El registro de algoritmos viene de `genesis.json` y refleja la red en el génesis, no los cambios posteriores de gobernanza. Las claves de consenso de los validadores se leen para el último conjunto de validadores.
- **TLS.** Un handshake con las preferencias por defecto del cliente de Go muestra lo que el servidor negocia con un cliente moderno, no todas las versiones, suites o grupos que acepta. Un endpoint detrás de un balanceador de carga puede responder de forma distinta en otra conexión.
- **Firmantes remotos.** Con `priv_validator_laddr` definido, la clave del validador vive en otro lugar y su tipo no es visible desde el home del nodo.
- **Solidity.** La detección es textual. No resuelve importaciones, no sigue la herencia ni calcula direcciones en tiempo de ejecución. Una dirección de precompile ensamblada en tiempo de ejecución se pasa por alto, y puede reportarse una variable con nombre parecido a un patrón. Las dependencias se omiten salvo que pases `--include-deps`.
- **CBOM de otras herramientas.** Los informes clasifican los CBOM de otras herramientas solo por el nombre del algoritmo.
- **Fechas.** Las categorías de NIST y las transiciones de IR 8547 se toman de los documentos citados a octubre de 2026. La guía específica de una aplicación puede fijar fechas anteriores.
- **Cadena de versión.** Un binario compilado desde el código fuente sin flag de versión imprime `qorescan dev`. Usa el binario de la release o el Go install de la versión etiquetada cuando necesites que se registre la versión.

## Páginas relacionadas {#related}

- [Firma poscuántica](/developer-guide/post-quantum-signing): secp256k1 híbrido más ML-DSA-87 en el carril nativo, y la ventana de autorización EVM.
- [Custody kit](/developer-tools/custody-kit): guía de integración y código de referencia para custodios y exchanges.
- [QoreSign](/qoresign/overview): bibliotecas de firma y verificación híbridas.
- [Ejecutar un nodo](/developer-guide/running-a-node) y [ejecutar un validador](/developer-guide/running-a-validator): disposición del home del nodo, firmantes remotos y archivos de claves.
- [Precompiles EVM](/developer-guide/evm-precompiles): los precompiles PQC `0x0A01` y `0x0A02`.
- [Biblioteca poscuántica (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 en seis lenguajes.
- [Conectarse a mainnet](/getting-started/connecting-to-mainnet) y [conectarse a testnet](/getting-started/connecting-to-testnet): endpoints públicos.
