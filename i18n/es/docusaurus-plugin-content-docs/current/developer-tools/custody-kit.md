---
slug: /developer-tools/custody-kit
title: Kit de custodia de QoreChain
sidebar_label: Kit de custodia
sidebar_position: 32
---

# Kit de custodia de QoreChain

El kit de custodia de QoreChain es una guía de integración escrita, un conjunto de vectores de prueba y código de referencia pequeño para custodios y exchanges que guardan fondos de clientes en QoreChain. Explica qué exige la red en cada carril de ejecución y muestra, en código legible, las partes de una integración que es fácil hacer mal: comprobar una dirección, decodificar y verificar una transacción firmada antes de transmitirla y decidir qué transferencias entrantes acreditar.

Está pensado para custodios, exchanges, procesadores de pagos y backends de monederos, y para los ingenieros y auditores que revisan esas integraciones. Versión **0.1.0**, publicada el 27 de octubre de 2026, Apache-2.0. Funciona con mainnet (`qorechain-vladi`) y testnet (`qorechain-diana`); las comprobaciones en vivo que lo acompañan se ejecutan contra testnet y solo leen.

**Lee esto primero: el kit es código de ejemplo, no una biblioteca.** Clonas el repositorio y lees, copias o incorporas a tu repositorio la carpeta de tu lenguaje. No existe un paquete del kit en npm, PyPI, crates.io ni Maven Central, a propósito. La única excepción en la forma es Go: la carpeta de Go es un módulo de Go con una versión etiquetada, así que `go get` puede obtenerlo, pero sigue siendo código de ejemplo sin promesa de una API estable (consulta [Qué es una biblioteca y qué es código de ejemplo](#library-vs-example)). La firma y la verificación criptográfica proceden de [QoreSign](/qoresign/overview), que es una biblioteca publicada.

## Innovaciones {#innovations}

- **Un mismo comportamiento en cinco lenguajes, demostrado por un único archivo.** TypeScript, Python, Go, Rust y Java implementan las mismas cuatro funciones con los mismos resultados y los mismos códigos de error. Cada lenguaje se ejecuta contra el archivo compartido de vectores de prueba `vectors/custody-v1.json`, de modo que un equipo que porte el kit a otro lenguaje puede demostrar que coincide.
- **Códigos de error estables para direcciones.** `validateAddress` nunca lanza una excepción. Devuelve las dos grafías de la dirección si es válida, o uno de once códigos estables (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`) para que un formulario de retiro pueda mostrar el motivo exacto.
- **Comprobación previa a la transmisión de ambas firmas.** `verifyTx` comprueba la firma secp256k1 sobre el `SignDoc`, la capa ML-DSA-87 contra una clave que le pasas y si la clave pública incluida en la transacción es la que esperas. Devuelve `{ valid, classical, signerKey, pq }` y lanza una excepción solo ante una entrada malformada, nunca ante una firma incorrecta. Un segundo proceso puede ejecutarla sobre cada retiro firmado antes de enviar nada.
- **Decisiones de depósito con motivo.** `extractDeposits` devuelve cada transferencia entrante de una transacción con un indicador `creditable` y un `reason` (`evm_failed`, `fee_refund`, `unsupported_message` o `null`). Detecta el caso que sorprende a quienes integran EVM: una ejecución EVM fallida sigue informando el código de resultado 0 a nivel nativo.
- **Un constructor de consultas que coincide con el nodo.** `buildDepositQuery` produce la ruta REST exacta, codificada en porcentaje, para las transferencias entrantes a una dirección (límite de 1 a 100, límites de altura, orden ascendente), y convierte la entrada `0x` a la forma `qor1`.
- **Guía escrita por carril.** La guía cubre el carril nativo, el carril EVM con sus ventanas de autorización, y indica que el carril SVM no está abierto a transacciones, así que no debe construirse sobre él ningún flujo de depósito ni de retiro.

## Casos de uso {#use-cases}

1. **Escáner de depósitos para un exchange.** Mantén un cursor de altura, llama a `buildDepositQuery({ address, minHeight, maxHeight })` contra tu propio nodo y luego a `extractDeposits(txResponse, address)` para acreditar `MsgSend`, `MsgMultiSend` y transferencias EVM exitosos en `uqor`. Las ejecuciones EVM fallidas, los reembolsos de gas y otros mensajes se excluyen o se marcan para revisión.
2. **Canal de retiros con un segundo aprobador.** Después de que el firmante produce un retiro con firma híbrida, un proceso independiente ejecuta `decodeTx` (destinatario, importe, comisión, memo) y `verifyTx` (ambas firmas, claves esperadas) antes de transmitir la transacción.
3. **Admisión de direcciones.** Valida cada dirección de retiro introducida por el usuario con `validateAddress`, rechaza las direcciones `qorvaloper` como destinos de pago y, opcionalmente, exige sumas de verificación EIP-55 para la entrada en hex.
4. **Planificación de HSM.** Un equipo de seguridad usa la guía de gestión de claves para elegir entre claves ML-DSA-87 generadas en el HSM y la derivación canónica basada en mnemónico, para comprobar el soporte de PKCS #11 v3.2 para la firma ML-DSA-87 pura con contexto vacío y para diseñar la rotación y las copias de seguridad.
5. **Vía de pagos EVM.** Un exchange que paga en el carril EVM registra la clave ML-DSA-87 una vez, abre una ventana de autorización acotada por lote con una transacción híbrida del carril nativo y luego firma transacciones EIP-1559 ordinarias con su infraestructura secp256k1 existente.
6. **Staking para clientes.** Un custodio que ofrece staking sigue la guía de staking (delegar, deshacer delegación, redelegar, recompensas, bloqueos del nivel de staking) y decodifica cada mensaje de staking con `decodeTx` antes de firmar.
7. **Portar a otro lenguaje, o una auditoría.** Un equipo que escribe su propia implementación la ejecuta contra `vectors/custody-v1.json` para demostrar que coincide con los resultados y los códigos de error de referencia.
8. **Ensayo antes de mainnet.** Un equipo de integración sigue el ensayo en testnet (registrar clave, envío híbrido, escaneo de depósitos, staking, ventana EVM, rotación de claves) y la lista de comprobación de integración.

## Cómo funciona {#how-it-works}

### Qué contiene el kit {#contents}

| Parte | Qué es |
|---|---|
| `docs/` | Diez páginas de guía: firma por carril, direcciones y derivación, depósitos, retiros, staking, errores, gestión de claves, entorno de pruebas, lista de comprobación de integración, preguntas frecuentes. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Código de referencia con las mismas cuatro funciones y una pequeña línea de comandos de ejemplo por lenguaje. |
| `vectors/custody-v1.json` | Vectores de prueba: una dirección válida y una inválida por cada código de error, un `MsgDelegate` con firma híbrida, un `MsgOpenEVMWindow` con firma híbrida de una cuenta eth-native, mensajes de staking y de ventana, transacciones malformadas, consultas de depósitos y casos de extracción de depósitos. Los vectores de QoreSign se reutilizan por referencia y se comprueban con SHA-256. |
| Comprobaciones en vivo | Comprobaciones de solo lectura contra testnet, activadas con `QORE_LIVE_TEST=1`: parámetros de staking, una consulta de depósitos para una transferencia reciente y la verificación de una transacción híbrida confirmada. |

### Qué es una biblioteca y qué es código de ejemplo {#library-vs-example}

| Pieza | Tipo | Dónde obtenerla |
|---|---|---|
| QoreSign (firma, verificación ML-DSA-87 y secp256k1, mensaje de registro de clave) | Biblioteca publicada | npm, PyPI, crates.io, Go, Maven Central. Consulta [QoreSign](/qoresign/overview). |
| El código del kit en TypeScript, Python, Rust y Java | Código de ejemplo, no publicado en ningún registro | Clona `qorechain/qorechain-custody-kit` y copia o incorpora la carpeta a tu repositorio. |
| El código del kit en Go (paquete `custodykit`) | Código de ejemplo. Se puede obtener como módulo de Go en una versión etiquetada, sin promesa de una API estable | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, o clona e incorpora. |
| Las páginas de guía, los vectores y la lista de comprobación | Documentación y datos | El repositorio. |

El kit no implementa ningún esquema de firma. La verificación de ML-DSA-87 y secp256k1 procede de QoreSign. El código de Python contiene un pequeño Keccak-256 usado para la suma de verificación EIP-55 y para nada más.

### Carriles {#lanes}

| Carril | Qué firma un custodio | Estado |
|---|---|---|
| Nativo (Cosmos SDK) | `SIGN_MODE_DIRECT` de secp256k1 más una capa ML-DSA-87 (FIPS 204). Una cuenta con una clave registrada no tiene vía clásica; una cuenta sin clave solo puede enviar en clásico para registrar su clave (o para liberar de la cárcel). | abierto |
| EVM | Transacciones Ethereum secp256k1 ordinarias (EIP-155 y EIP-1559), admitidas para un remitente con una clave ML-DSA-87 registrada y una ventana de autorización activa, abierta por una transacción híbrida del carril nativo: una firma ML-DSA-87 por ventana. | abierto |
| SVM | No aplicable | no abierto a transacciones |

### Transacciones híbridas del carril nativo {#hybrid}

- Una transacción híbrida es un `TxRaw` ordinario firmado dos veces por la misma cuenta. La firma ML-DSA-87 viaja en el cuerpo como la opción de extensión `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, una firma de 4,627 bytes y, opcionalmente, la clave pública de 2,592 bytes). La firma secp256k1 es la habitual de `SIGN_MODE_DIRECT` sobre el cuerpo final, con la extensión incluida.
- La firma ML-DSA-87 cubre unos sign-bytes que excluyen la extensión. Ambas redes públicas verifican los sign-bytes v2 (una cadena de dominio, el ID de cadena y luego los bytes del cuerpo y de la información de autenticación). Se aceptan tanto las firmas FIPS 204 hedged como las deterministas. El formato normativo es la [especificación de firma híbrida de QoreSign](/qoresign/spec/hybrid-signing-v1).
- Orden de las operaciones: codificar el cuerpo y la información de autenticación (comisión y gas fijados), calcular los sign-bytes v2, firmar con ML-DSA-87, añadir la extensión, firmar el `SignDoc` con secp256k1, transmitir.
- Registro de clave: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, con una prueba de posesión opcional y recomendada), firmado en clásico desde la cuenta sin clave, una vez por dirección hot. QoreSign construye el mensaje completo.
- Una transacción híbrida pesa unos 4.7 KB más que una clásica y usa más gas, así que simula siempre.

### Direcciones {#addresses}

- `qor1...` y `0x...` son dos grafías de los mismos 20 bytes. Los fondos enviados a cualquiera de las dos llegan al mismo saldo. `qorvaloper1...` es una dirección de operador de validador y nunca una dirección de pago.
- Hay dos tipos de cuenta: `secp256k1` (coin type 118, ruta `m/44'/118'/0'/0/i`) y eth-native `eth_secp256k1` (coin type 60, ruta `m/44'/60'/0'/0/i`). El mismo mnemónico da dos cuentas distintas. Las cuentas eth-native permiten que una sola clave opere tanto el carril nativo como el carril EVM.
- La clave ML-DSA-87 puede proceder de la derivación canónica (la que registran los monederos de QoreChain y el SDK, ligada a la dirección `qor1` y al mnemónico), de una derivación jerárquica en borrador o de una clave aleatoria generada en un HSM. Cualquier clave válida funciona una vez registrada. Consulta la [derivación de claves](/qoresign/guides/key-derivation).

### Depósitos {#deposits}

- QoreChain finaliza un bloque cuando se confirma. No hay reorganizaciones, así que una transacción en un bloque confirmado es final tras un bloque. Las confirmaciones adicionales son una decisión operativa.
- Los depósitos del carril nativo se encuentran con `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` construye exactamente esta ruta.
- Reglas de acreditación en `extractDeposits`: una transacción con `code != 0` no movió nada; un `transfer` sin `msg_index` es el pago de la comisión; los importes se filtran por denominación (`uqor` por defecto); las salidas de `MsgSend` y `MsgMultiSend` son acreditables; `MsgEthereumTx` es acreditable salvo que la ejecución EVM haya fallado o la transferencia sea un reembolso de gas del fee collector; cualquier otra cosa vuelve con `reason: "unsupported_message"` para revisión.

### Retiros y gas {#withdrawals}

- Comisión = ceil(límite de gas x precio del gas) en `uqor`. El precio mínimo del gas es 0.1 uqor, cobrado sobre el límite de gas.
- Toma el límite de gas de una simulación de la transacción totalmente firmada. En los nodos que han aplicado la actualización v3.2.5 (ambas redes desde el 29 de octubre de 2026) usa `ceil(gas_used x 1.02) + 2000`, porque la simulación incluye la verificación ML-DSA-87. Antes de eso usa `ceil((gas_used + 40000) x 1.4)`. Detecta cuál aplica con `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, no por fecha.
- Tras elegir el límite de gas, reconstruye `AuthInfo` y firma de nuevo: ambas firmas cubren la comisión.
- Secuencias: ejecuta una cola de firma por dirección hot, o varias direcciones hot para pagos en paralelo.

### Ventanas de autorización EVM {#evm-windows}

- Una ventana se abre con `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` de 1 a 17,280, `max_txs` de 1 a 1,000, `max_value` en `uqor` contando el valor más la comisión máxima, `native_only` opcional, `allowed_targets` opcional de hasta 16 direcciones) y se cierra con `MsgCloseEVMWindow`. El estado está en `GET /qorechain/pqc/v1/evm_window/{address}`.
- Abrir una ventana reemplaza cualquier ventana existente y avanza la secuencia de la cuenta, que es su nonce EVM: abre la ventana y luego lee el nonce.
- `eth_call` y `eth_estimateGas` no necesitan ventana.

## Cómo usarlo {#how-to-use}

### Obtener el código {#install}

El kit es código de referencia: clona el repositorio, o incorpora a tu repositorio la carpeta de tu lenguaje, en lugar de instalar un paquete.

| Lenguaje | Cómo obtenerlo | Depende de | Plataforma mínima |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, y luego `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | clona, y luego `cd code/python && pip install -r requirements-dev.txt`. Para `verify_tx` también `pip install qorechain-qoresign==0.1.1` | nada en tiempo de ejecución; `qorechain-qoresign` 0.1.1 (PyPI) para `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (paquete `custodykit`), o clona | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | clona, y luego `cd code/rust && cargo build` (no está en crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust edición 2021 |
| Java | clona, y luego `cd code/java && mvn test` (no está en Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign está publicado para todos los lenguajes que usa el kit, incluido Python. `verify_tx` en el código de Python necesita `qorechain-qoresign` 0.1.1 de PyPI (macOS y Linux). El código de TypeScript, Go, Rust y Java fija QoreSign 0.1.0, que sigue publicado junto a 0.1.1.

### Inicio rápido {#quickstart}

Red de destino: testnet (`qorechain-diana`) para todo lo que lea la cadena. La variable de entorno `QORE_REST` apunta los ejemplos y las comprobaciones en vivo a otro endpoint REST, que en producción es tu propio nodo. Las direcciones de abajo proceden de la frase de prueba pública BIP-39 y nunca deben contener fondos.

**1. Validar una dirección (Go, sin conexión).** Ejecutado el 27 de octubre de 2026 desde un clon de la etiqueta `v0.1.0`:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

Imprimió (código de salida 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

Una dirección de validador se rechaza salvo que la permitas con `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

Imprimió `"valid": false` con `"error": "KIND_NOT_ALLOWED"` y el detalle `a validator address is not accepted here`, y terminó con código 1. La batería de pruebas de Go (`go test ./...`) también pasó en el mismo checkout.

**2. Decodificar y verificar una transacción firmada antes de transmitirla.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Añade `--eth` para una cuenta eth-native. Lee el número de cuenta de `GET /cosmos/auth/v1beta1/account_info/{address}` y la clave ML-DSA-87 registrada de `GET /qorechain/pqc/v1/account/{address}`.

Lo mismo en TypeScript, desde la línea de comandos de ejemplo del kit (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Escanear depósitos (lecturas en testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Ejecutado el 27 de octubre de 2026 para la dirección de prueba pública sobre las alturas de testnet 8976000 a 8983000, devolvió una lista vacía, lo esperable para una dirección que nunca recibió nada.

TypeScript (desde `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (desde `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Los demás lenguajes.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Ejecutar los vectores y las comprobaciones en vivo.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Cada lenguaje tiene el equivalente (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Las comprobaciones en vivo no necesitan fondos. Cuando se escribió esta página solo se ejecutaron los comandos `validate` y `deposits` de Go y la batería de pruebas de Go; los demás lenguajes se describen a partir del repositorio.

### Funciones y comandos principales {#api}

| TypeScript | Go | Python y Rust | Java | Qué hace |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Devuelve `{ valid, kind, format, checksum, bech32, hex }` o `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Mensajes, memo, comisión, firmantes, capas ML-DSA-87 y el hash de la transacción. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Devuelve `{ valid, classical, signerKey, pq }`. Versión de sign-bytes v1, v2 o cualquiera. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | Ruta REST para transferencias entrantes. `event` es `transfer` (por defecto) o `coin_received`; `limit` de 1 a 100, por defecto 50; ascendente por defecto. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Entradas de depósito con `creditable` y `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Ayudantes. |

También se exportan las constantes `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` y `DEFAULT_TESTNET_REST`.

Línea de comandos de ejemplo en cada lenguaje:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Códigos de error, idénticos en todos los lenguajes:

- Kit: `MALFORMED_TX` (los bytes no son una transacción bien formada), `UNKNOWN_FIELD` (un campo que el decodificador no conoce, y que la red también rechazaría), `INVALID_ARGUMENT`.
- `validateAddress`: los once códigos listados en [Innovaciones](#innovations).

Rechazos de la cadena que un custodio encuentra con más frecuencia, como codespace y código (la tabla completa está en `docs/errors.md` del kit):

| Codespace | Códigos |
|---|---|
| `sdk` | 3 desajuste de secuencia, 4 no autorizado, 5 fondos insuficientes, 11 sin gas, 12 memo demasiado grande, 13 comisión insuficiente, 19 ya está en el mempool |
| `pqc` | 20 firma híbrida requerida, 21 falló la verificación híbrida, 7 clave ya registrada, 26 sin ventana EVM (o sin clave registrada), 27 ventana agotada o fuera de alcance, 28 parámetros de ventana inválidos |
| `stakingtier` | 13 el stake está bloqueado |

Ramifica según el codespace y el código juntos, y conserva el log en bruto.

## Cómo acceder {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| ID de cadena | `qorechain-vladi` | `qorechain-diana` |
| ID de cadena EVM | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Versión del nodo | v3.2.5 (aplicada el 29 de octubre de 2026) | v3.2.6 (v3.2.5 aplicada) |

- La denominación es `uqor` (1 QOR = 10^6 uqor; en el carril EVM 1 uqor = 10^12 wei). El precio mínimo del gas es 0.1 uqor, el periodo de unbonding es de 21 días y el límite del memo es de 256 caracteres. Estos valores se leyeron en ambas redes el 27 de octubre de 2026 y pueden cambiar por gobernanza, así que léelos de la cadena en producción.
- Los depósitos no necesitan claves ni registro. Enviar necesita una clave ML-DSA-87 registrada por dirección hot.
- Ejecuta tus propios nodos completos para producción. Los endpoints públicos tienen límite de peticiones y están pensados para desarrollo. Si un script recibe `403 Forbidden`, define una cabecera `User-Agent` explícita. Consulta [ejecutar un nodo](/developer-guide/running-a-node) y [conectarse a mainnet](/getting-started/connecting-to-mainnet).
- La testnet recibe cada versión de nodo antes que mainnet. Cambia las reglas de gas comprobando la actualización aplicada, no por fecha (ambas redes han aplicado la v3.2.5).
- Los tokens de prueba de testnet (denominaciones de bank con la forma `erc20:0x...`, un token IBC) no existen en mainnet. Acredita `uqor` en ambas redes.
- El QOR de testnet viene del faucet del panel de QoreChain y no tiene valor. Consulta [conectarse a testnet](/getting-started/connecting-to-testnet).

## Notas de seguridad {#security}

- Las dos claves de una dirección hot (secp256k1 y ML-DSA-87) firman cada transacción del carril nativo. Mantenlas dentro del mismo perímetro de custodia, bajo el mismo quórum y el mismo rastro de auditoría.
- Haz copia de seguridad de la semilla ML-DSA-87 de 32 bytes (claves de software) o usa la copia de seguridad de claves del HSM. Una cuenta con una clave registrada no tiene vía clásica, así que perder la clave ML-DSA-87 significa que la cuenta ya no puede firmar. Prueba la restauración en testnet con `verifyTx`.
- Los HSM deben soportar la firma ML-DSA-87 pura (`CKM_ML_DSA` en PKCS #11 v3.2) sobre los sign-bytes con contexto vacío. `HashML-DSA` no se acepta.
- Ejecuta `decodeTx` y `verifyTx` sobre cada transacción firmada antes de transmitirla, en un proceso que no la construyó.
- La rotación usa `MsgRotatePQCKey`: firman ambas claves, la capa propia de la transacción usa la clave actual y se rechaza la reutilización de una clave anterior. Si la clave secp256k1 queda expuesta, mueve los fondos a una dirección nueva con ambas claves nuevas y cierra cualquier ventana EVM abierta.
- Ventanas EVM: usa `native_only` o `allowed_targets`, el `max_value` y los `blocks` más pequeños que cubran el lote, y cierra la ventana después del lote. Trata `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` y `MsgAuthorizeEVMDelegation` como operaciones privilegiadas.
- No acredites nunca una transacción EVM cuyo evento `ethereum_tx` informe un fallo, aunque su resultado nativo sea `code == 0`.
- Esto es código de referencia en la versión 0.1.0. Revísalo antes de usarlo en producción. Informa de las vulnerabilidades de forma privada a security@qore.network, incluidos los errores de documentación que pudieran llevar a una acreditación errónea o a una firma no deseada.

## Dónde está publicado {#where-published}

Comprobado contra los registros el 27 de octubre de 2026.

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (los cinco lenguajes, páginas de guía, vectores) | release `v0.1.0`, publicada el 27 de octubre de 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-custody-kit/code/go` (código de ejemplo, obtenible) | v0.1.0 (etiqueta `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | no publicado: el kit es código de ejemplo para copiar o incorporar | no aplicable | no aplicable |

La release de GitHub no lleva archivos adjuntos; la release es la etiqueta del repositorio. Dependencias en las que se apoya el kit, todas publicadas: `@qorechain/qoresign` en npm (última 0.1.1, el kit fija 0.1.0), `qorechain-qoresign` en PyPI (0.1.1), `qorechain-qoresign` en crates.io (última 0.1.1, el kit fija 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 y v0.1.1) e `io.github.qorechain:qoresign` en Maven Central (0.1.0 y 0.1.1).

Licencia Apache-2.0. Mantenedor: QoreChain Association.

## Límites y problemas conocidos {#limits}

- El kit no guarda claves, no firma transacciones, no transmite ni ofrece firma con umbral o MPC. La firma la hace QoreSign o tu HSM. Hoy no existe un esquema de umbral estandarizado para ML-DSA; la guía documenta cómo combinar una clave secp256k1 con umbral con una clave ML-DSA-87 custodiada por separado.
- No afirma nada sobre los procesos internos de ningún custodio. La lista de comprobación describe solo requisitos de la red.
- `validateAddress` acepta direcciones de 20 bytes. Las direcciones más largas de cuentas de módulo y de contrato se rechazan, como debe ser para direcciones de depósito y de pago.
- `extractDeposits` acredita automáticamente `MsgSend`, `MsgMultiSend` y `MsgEthereumTx` exitosos. Otros mensajes (retiros de recompensas, llamadas a contratos, transferencias IBC) se devuelven para revisión, no se acreditan.
- `verifyTx` verifica transacciones de un solo firmante.
- El carril SVM no está abierto a transacciones. No construyas flujos de depósito ni de retiro sobre él.
- El código propio del kit es código de ejemplo en 0.1.0. Los nombres y las firmas de las funciones pueden cambiar entre versiones, y la etiqueta del módulo de Go no promete una API estable.
- Cuando se escribió esta página solo se ejecutaron los ejemplos y la batería de pruebas de Go. Las comprobaciones en vivo y las de vectores en los otros cuatro lenguajes no se volvieron a ejecutar.
- Puede que el README de Python del repositorio todavía diga que `verify_tx` lanza un error de importación hasta que `qorechain-qoresign` 0.1.1 esté en PyPI. Esa versión está publicada, así que la nota está desactualizada.
- La guía del kit cita parámetros (cifras de gas, valores del nivel de staking) leídos el 27 de octubre de 2026. Léelos de la cadena en producción.

## Páginas relacionadas {#related}

- [QoreSign](/qoresign/overview): firma híbrida, verificación, el mensaje de registro de clave y los ayudantes de gas `suggestGasLimit` y `simulateTx`.
- [QoreChain SDK](/sdk/overview): decodificación de errores con `decodeTxError`, los compositores de ventanas EVM y el clasificador de rechazos.
- [Firma poscuántica](/developer-guide/post-quantum-signing): firmas híbridas, sign-bytes v2 y registro de claves.
- [Guía para exchanges e integradores](/developer-guide/exchange-integration): elegir entre las vías nativa, EVM y SVM.
- [Precompilados EVM](/developer-guide/evm-precompiles) y el carril EVM.
- [Staking y delegación](/user-guide/staking-and-delegation).
- [Ejecutar un nodo](/developer-guide/running-a-node) y [conectarse a mainnet](/getting-started/connecting-to-mainnet).
- [Servidor MCP de QoreChain](/developer-tools/mcp): `get_pq_status` y `simulate_tx` para comprobaciones rápidas.
- [QoreScan](/developer-tools/qorescan): inventaría la criptografía de tu nodo, endpoints y cuentas.
