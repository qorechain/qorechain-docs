---
slug: /developer-tools/qoreseal
title: QoreSeal
sidebar_label: QoreSeal
sidebar_position: 30
---

# QoreSeal (`qoreseal`)

QoreSeal es una biblioteca de código abierto que cifra datos para cuentas de QoreChain con ML-KEM-1024 (FIPS 203). Una cuenta publica su clave pública ML-KEM-1024 en la cadena; cualquiera puede entonces cifrar una carga que esa cuenta, y cualquier otro destinatario que añada el remitente, puede leer. Está pensada para desarrolladores de dApps que necesitan cargas confidenciales (memos, facturas, documentos, pujas), para auditores que necesitan acceso de lectura y para operadores de grupos privados y sidechains. Compone primitivas estándar y no implementa ninguna propia. Versión **0.1.0**, Apache-2.0, mantenida por la QoreChain Association.

Dónde está a 27 de octubre de 2026: el cifrado en sí funciona sin conexión en cualquier lugar, sin red ni cuenta. Cifrar para una dirección leída de la cadena necesita el registro de claves KEM, que está **activo en la testnet** (`qorechain-diana`) y **llega a la mainnet (`qorechain-vladi`) después de la actualización v3.2.5**, sin fecha. El paquete está publicado para Rust, Go, Python, Swift, Kotlin/JVM y Android. El paquete de TypeScript `@qorechain/qoreseal` **está por llegar** y todavía no está en npm. La construcción es un borrador a la espera de una revisión externa antes de la 1.0.

QoreSeal protege el contenido de una carga, nada más. Las direcciones, el momento de las transacciones, los importes de las transferencias, los tamaños de los sobres y el número de destinatarios siguen siendo públicos en la cadena. No es una forma de hacer privadas las transacciones.

## Innovaciones {#innovations}

- **Un sobre, de 1 a 1,024 destinatarios.** La carga se cifra una sola vez con una clave de datos AES-256-GCM aleatoria; la clave de datos se envuelve por separado para cada destinatario, de modo que añadir un lector cuesta unos 1.6 KB, no otra copia de la carga.
- **Híbrido por defecto, nunca degradado en silencio.** En el modo `hybrid` cada entrada de destinatario combina una encapsulación ML-KEM-1024 con un acuerdo X25519 mediante un combinador SHA3-256, de modo que los datos siguen protegidos mientras resista cualquiera de los dos. El modo `mlkem` (solo ML-KEM-1024) debe elegirse de forma explícita; la biblioteca nunca recurre a él por su cuenta.
- **Vinculación al contexto.** Cada sobre está vinculado a un chain id y a un propósito mediante la derivación de claves (HKDF-SHA-256 con info `"qorechain-kem-v1|" + chainId + "|" + purpose`) y a datos asociados opcionales. Un sobre sellado para un propósito no se abre bajo otro.
- **Claves publicadas en la cadena, comprobadas por la cadena.** Una cuenta registra su clave ML-KEM-1024 con `MsgRegisterKEMKey`, autenticada por la firma híbrida de la transacción. `validateMlkemPublicKey` aplica las mismas comprobaciones que aplica la cadena en el registro.
- **Tarjetas de destinatario.** El registro contiene la clave ML-KEM y nada más. La clave X25519 del modo híbrido viaja en una tarjeta que la cuenta firma con la firma de mensajes de [QoreSign](/qoresign/overview) y vincula a su clave ML-KEM en la cadena. Los remitentes verifican la tarjeta contra ambas claves en la cadena, así que puede venir de cualquier canal. Una tarjeta falsificada u obsoleta a lo sumo puede reducir un sobre a la fortaleza de ML-KEM-1024, porque la parte ML-KEM siempre usa la clave que está en la cadena.
- **Claves de época para grupos privados.** `EpochKeyManager` crea una nueva clave de época en cada cambio de miembros y la sella para los miembros actuales. Un miembro eliminado conserva las claves de las épocas a las que perteneció y no puede leer las posteriores.
- **Lotes cifrados con compromisos.** El códec de lotes produce un blob cifrado con un compromiso del texto cifrado y un compromiso salado del texto en claro, listo para anclarse en QoreChain con el [RDK](/rollups/overview).
- **Los mismos bytes en todos los lenguajes.** TypeScript y Go son implementaciones nativas; Rust es el núcleo bajo Swift, Kotlin y Python. Los vectores de prueba compartidos se comprueban byte a byte en todos los lenguajes, y los errores llevan códigos estables (por ejemplo `NOT_A_RECIPIENT`, `DECRYPTION_FAILED`, `CARD_INVALID`, `RECIPIENT_NEEDS_X25519`, `UNKNOWN_EPOCH`, `MALFORMED_ENVELOPE`).

## Casos de uso {#use-cases}

1. **Una dApp cifra memos o mensajes entre usuarios.** Una dApp de chat o de pagos sella cada nota para la dirección del destinatario con `sealToAddresses` y guarda el texto `qoreseal:` en un memo, un contrato o su propia base de datos. Solo la clave del destinatario lo abre.
2. **Facturas y documentos con una clave de auditor (de lectura).** Una empresa sella una factura para el comprador, el vendedor y una clave de auditor en un solo sobre, con el número de factura como datos asociados. La clave de auditor es un par de claves QoreSeal normal guardado en la configuración; una clave por trimestre (`deriveSealKeys` con un índice nuevo) permite a la empresa entregar al auditor solo los periodos bajo revisión.
3. **Pujas selladas y commit-reveal.** Una subasta sella las pujas con la clave de la subasta usando `purpose: "bid:<auction id>"` y la dirección del pujador como datos asociados, guarda los sobres y los abre después del plazo.
4. **Consorcios o sidechains privadas.** El operador de un rollup privado usa `EpochKeyManager` para compartir una clave de época con los miembros, cifra cada lote con `PrivateBatchCodec` y ancla el blob cifrado y sus compromisos en QoreChain con el RDK.
5. **Wallets que ofrecen "recibir datos cifrados".** Una wallet deriva las claves de QoreSeal de la mnemónica de la cuenta (índice 0), publica la clave ML-KEM con un `MsgRegisterKEMKey` firmado de forma híbrida y muestra como texto plano la tarjeta de destinatario que hay que firmar.
6. **Destinatarios de recuperación o de custodia.** Un equipo de custodia o de cumplimiento añade una clave de recuperación offline a cada sobre, de modo que los datos sobreviven a la pérdida de la clave de un usuario.
7. **Backends en Python o Go.** Un servicio sella informes o exportaciones para una lista de cuentas, con compatibilidad byte a byte con todos los demás lenguajes.

## Cómo funciona {#how-it-works}

Primitivas (QoreSeal no implementa ninguna): ML-KEM-1024 (FIPS 203; clave de encapsulación de 1,568 bytes, clave de desencapsulación de 3,168 bytes, texto cifrado de 1,568 bytes), X25519 (RFC 7748), un combinador SHA3-256, HKDF-SHA-256 y AES-256-GCM (nonce de 96 bits, etiqueta de 128 bits).

**Sellado**, en resumen:

1. Se generan una sal aleatoria de 16 bytes y una clave de datos aleatoria de 32 bytes.
2. Para cada destinatario, una encapsulación ML-KEM-1024 hacia la clave del destinatario; en modo híbrido también un acuerdo X25519 efímero con la clave X25519 del destinatario, y los dos secretos se combinan con SHA3-256. Se deriva una clave de cifrado de claves con HKDF-SHA-256 (sal, info `"qorechain-kem-v1|" + chainId + "|" + purpose`) que envuelve la clave de datos con AES-256-GCM.
3. La carga se cifra una sola vez con la clave de datos, autenticando toda la cabecera y los datos asociados opcionales.

**Estructura del sobre:** magic `QSEL`, versión 1, modo, bytes de algoritmo, indicadores, sal, número de destinatarios, una entrada por destinatario (pista, texto cifrado ML-KEM, clave efímera X25519 en modo híbrido, clave de datos envuelta), nonce, texto cifrado. Tamaño: `56 + 1,664 x recipients + plaintext` bytes en modo híbrido y `56 + 1,632 x recipients + plaintext` en modo `mlkem`. Según la especificación: 1 destinatario y 1 KB de texto en claro son 2,744 bytes (híbrido); 10 destinatarios y 1 KB son 17,720 bytes.

El chain id y el propósito no se escriben en el sobre: el destinatario debe pasar los mismos valores. Un chain id, un propósito o unos datos asociados incorrectos, o cualquier cambio en los bytes, dan `DECRYPTION_FAILED`.

**Pistas.** Las pistas saladas permiten a un destinatario encontrar rápidamente su propia entrada. Con `anonymous: true` las pistas se ponen a cero y los destinatarios prueban todas las entradas.

**Forma de texto.** `envelopeToText` y `envelopeFromText` convierten desde y hacia `"qoreseal:" + base64url`.

**Qué hay en la cadena**

- El registro de claves KEM en el módulo `qorechain.pqc.v1`: `MsgRegisterKEMKey` con `sender`, `algorithm_id = 2` (ML-KEM-1024) y `public_key`, y `MsgRemoveKEMKey` con `sender`. Type URLs: `/qorechain.pqc.v1.MsgRegisterKEMKey` y `/qorechain.pqc.v1.MsgRemoveKEMKey`.
- Consulta: `GET /qorechain/pqc/v1/kem/{address}` (acepta la forma `qor1` o `0x`), que devuelve `found` y, si se encuentra, `key` con `address`, `algorithm_id`, `algorithm_name`, `public_key` y `registered_height`.
- El registro se autentica con la firma híbrida de la transacción. El remitente ya debe tener una clave ML-DSA-87 registrada, y la transacción se firma con `signHybrid` de QoreSign. Una clave por cuenta; registrar de nuevo la sustituye.
- Rechazos (codespace `pqc`): 250 registro todavía no habilitado en esta cadena, 251 clave pública KEM no válida, 252 ninguna clave KEM publicada para esta cuenta, 253 esta clave ya está publicada para esta cuenta, 254 publicar una clave KEM necesita una clave de firma poscuántica registrada. `describeKemRegistryError` los explica.
- Los sobres en sí van donde la aplicación los ponga (memos, contratos, archivos, APIs). La cadena nunca ve una clave secreta.

**Tarjeta de destinatario.** Unos 6.7 KB de JSON, en su mayor parte la firma ML-DSA-87. La cuenta firma un texto fijo (`QoreSeal recipient card v1`, chain id, dirección, SHA3-256 de la clave ML-KEM, clave X25519, hora de emisión) con la firma de mensajes de QoreSign. Registrar una nueva clave ML-KEM retira todas las tarjetas hechas para la anterior.

**Grupos privados.** Una carga de clave de época (`QSEK`, número de época, clave de 32 bytes) se sella en un sobre normal para los miembros actuales. Un blob de lote (`QSBT`, época, índice de lote, contexto como el id del rollup, nonce, texto cifrado AES-256-GCM) tiene `83 + context length + data length` bytes. Compromisos: `ciphertextCommitment = SHA3-256(blob)` y `plaintextCommitment = SHA3-256("qorechain-qoreseal-batch-v1" || commitSalt || data)`, salado para que los ajenos no puedan adivinar contenidos de baja entropía.

La especificación es `spec/qoreseal-v1.md` en el repositorio (estado: borrador, revisión en curso); los vectores compartidos son `vectors/qoreseal-v1.json`.

## Cómo usarlo {#how-to-use}

### Instalación {#install}

| Lenguaje | Instalación | Plataforma mínima |
|---|---|---|
| Rust | `cargo add qorechain-qoreseal` (nombre de la biblioteca `qoreseal`) | Rust estable |
| Go | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Go 1.25 |
| Python | `pip install qorechain-qoreseal` (importar `qoreseal`) | Python 3.9 o posterior; wheels para macOS 11+ (arm64, x86_64) y Linux manylinux2014 (x86_64, aarch64); todavía no hay wheel para Windows |
| Swift | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, producto `QoreSeal` | iOS 16, macOS 13 |
| Kotlin / JVM | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Java 17; compilador Kotlin 2.3 o posterior (la compilación falla con Kotlin 2.1) |
| Android | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | API 24; reglas keep de R8 incluidas; compilador Kotlin 2.3 o posterior |
| TypeScript | **por llegar**: `@qorechain/qoreseal` todavía no está en npm, así que no hay comando de instalación | |

El código fuente de TypeScript, sus ejemplos y los ayudantes de red están en el repositorio y se ejecutan desde allí tras `pnpm install && pnpm build`. Hasta que se publique el paquete de npm, considere el repositorio como la forma de usar TypeScript, y espere el nombre de paquete indicado arriba.

### Quickstart 1: sellar y abrir sin conexión (Python) {#quickstart-python}

Ejecutado el 27 de octubre de 2026 con el wheel 0.1.0 publicado. Sin red, sin cuenta. Dos destinatarios, datos asociados y una comprobación de que otro propósito no abre el sobre.

```python
import qoreseal as qs

alice = qs.generate_seal_keys()
bob = qs.generate_seal_keys()

envelope = qs.seal_envelope(
    "qorechain-diana", "invoice",
    [qs.recipient_of(alice), qs.recipient_of(bob)],
    b"amount due: 120 QOR",
    aad=b"invoice-42",
)
text = qs.envelope_to_text(envelope)  # "qoreseal:..."

plaintext = qs.open_envelope("qorechain-diana", "invoice", envelope, bob, aad=b"invoice-42")
assert plaintext == b"amount due: 120 QOR"
print(len(envelope), text[:20], plaintext)

# A different purpose never opens the envelope.
try:
    qs.open_envelope("qorechain-diana", "chat", envelope, bob, aad=b"invoice-42")
except qs.QoreSealError.Failure as e:
    print("other purpose:", e.code)
```

Imprimió `3403 qoreseal:UVNFTAEBAgE b'amount due: 120 QOR'` y después `other purpose: DECRYPTION_FAILED`. La longitud es 56 + 2 x 1,664 + 19 = 3,403 bytes.

### Quickstart 2: sellar y abrir sin conexión (Go) {#quickstart-go}

Ejecutado con v0.1.0 desde el proxy de módulos de Go.

```go
package main

import (
	"fmt"

	qoreseal "github.com/qorechain/qoreseal/go"
)

func main() {
	alice, _ := qoreseal.GenerateSealKeys()
	auditor, _ := qoreseal.GenerateSealKeys()

	envelope, err := qoreseal.Seal(qoreseal.SealArgs{
		ChainID:    "qorechain-diana",
		Purpose:    "invoice",
		Recipients: []qoreseal.SealRecipient{qoreseal.RecipientOf(alice), qoreseal.RecipientOf(auditor)},
		Plaintext:  []byte("120 QOR due on 2026-11-30"),
		AAD:        []byte("invoice-42"),
	})
	if err != nil {
		panic(err)
	}
	plaintext, err := qoreseal.Open(qoreseal.OpenArgs{
		ChainID: "qorechain-diana", Purpose: "invoice", Envelope: envelope, Keys: auditor, AAD: []byte("invoice-42"),
	})
	fmt.Println(len(envelope), string(plaintext), err)
}
```

Imprimió `3409 120 QOR due on 2026-11-30 <nil>`.

Rust, Swift y Kotlin usan las mismas llamadas (`seal`, `open`, `generate_seal_keys`, etcétera, con la capitalización de cada lenguaje). Sus ejemplos no se ejecutaron para esta página.

### Quickstart 3: un grupo privado con épocas (Python, sin conexión) {#quickstart-group}

Sigue el ejemplo del repositorio `examples/private-rollup`. Alice y bob empiezan en la época 1, carol se une (época 2), bob es eliminado (época 3). Bob puede leer la época 1 pero no la época 3.

```python
import qoreseal as qs

chain_id, rollup_id = "qorechain-diana", "demo-private-rollup"
purpose = f"epoch-key:{rollup_id}"
alice, bob, carol = qs.generate_seal_keys(), qs.generate_seal_keys(), qs.generate_seal_keys()

mgr = qs.EpochKeyManager(chain_id, purpose, [
    qs.GroupMember(id="alice", recipient=qs.recipient_of(alice)),
    qs.GroupMember(id="bob", recipient=qs.recipient_of(bob)),
])
bob_keys = [qs.open_epoch_key(chain_id, purpose, mgr.distribution(), bob)]  # epoch 1

b1 = mgr.seal_batch(rollup_id, 1, b'{"txs":["alice pays bob 5"]}')
mgr.add_member("carol", qs.recipient_of(carol))   # epoch 2
mgr.remove_member("bob")                          # epoch 3
b3 = mgr.seal_batch(rollup_id, 3, b'{"txs":["alice pays carol 1"]}')

print(qs.open_batch(b1.blob, bob_keys).data)      # bob read epoch 1
try:
    qs.open_batch(b3.blob, bob_keys)              # bob was removed before epoch 3
except qs.QoreSealError.Failure as e:
    print("bob, epoch 3:", e.code)
print(b3.ciphertext_commitment.hex(), b3.plaintext_commitment.hex())
```

Imprimió el lote de la época 1 de bob, después `bob, epoch 3: UNKNOWN_EPOCH`, y luego los dos compromisos (aleatorios en cada ejecución).

Para anclar un lote sellado con el [RDK](/rollups/overview), el blob cifrado es el blob nativo de disponibilidad de datos y su SHA-256 es el `data_hash` del lote (TypeScript, de la guía del repositorio; no se ejecutó para esta página):

```ts
import { buildDaBlob, submitBatchMsg } from "@qorechain/rdk";

const codec = new PrivateBatchCodec("my-rollup", mgr);
const sealed = codec.seal(batchIndex, batchBytes);
const blob = buildDaBlob({ data: sealed.blob, maxBlobSize: params.maxDaBlobSize });
const msg = submitBatchMsg({ sequencer, rollupId: "my-rollup", batchIndex, stateRoot, txCount, dataHash: blob.dataHash });
```

Consulte [Disponibilidad de datos](/rollups/data-availability) para saber cómo se publican los lotes de un rollup.

### Cifrar para una dirección en la testnet {#encrypt-to-address}

Necesita una cuenta de `qorechain-diana` que usted controle, con un poco de QOR de testnet y una clave ML-DSA-87 registrada (el ejemplo `register-and-send` de QoreSign registra una). Use una mnemónica de testnet, nunca una de la mainnet, y nunca la frase de prueba pública con fondos. Este flujo se describe a partir de la guía del repositorio y no se ejecutó para esta página.

1. Derive las claves de la mnemónica de la cuenta: `deriveSealKeys({ mnemonic })` (índice 0). La mnemónica es también su copia de seguridad.
2. Publique la clave ML-KEM-1024: `buildRegisterKemKeyMessage({ sender: address, mlkemPublicKey: sealKeys.mlkemPublicKey })`, póngala en el cuerpo de una transacción, fírmela con `signHybrid` de QoreSign, simule con `simulateTx` y envíe con `submitWithSignBytesFallback`. Si es rechazada, `describeKemRegistryError(res.codespace, res.code)` lo explica.
3. Compruébelo: `GET https://api-testnet.qore.host/qorechain/pqc/v1/kem/<address>`. Responde `{"found":false,"key":null}` para una cuenta que no ha publicado una clave.
4. Firme una tarjeta de destinatario: `signRecipientCard({ chainId: "qorechain-diana", address, keys: sealKeys, classicalKey, pqKey })`, y publíquela donde los remitentes puedan obtenerla.
5. Lado del remitente: `sealToAddresses({ rest: "https://api-testnet.qore.host", chainId: "qorechain-diana", purpose: "note", recipients: [{ address, card }], plaintext })`. Sin tarjeta, pase `mode: "mlkem"`.
6. Lado del destinatario: `open({ chainId: "qorechain-diana", purpose: "note", envelope, keys: sealKeys })`.

El flujo completo ejecutable es el ejemplo del repositorio `examples/register-and-encrypt`. Rechaza la mainnet hasta que esa red haya aplicado v3.2.5. Go ofrece el mismo lado del remitente con `network.NewClient(rest).SealToAddresses(ctx, network.SealToArgs{...})`. Rust, Swift, Kotlin y Python funcionan sin conexión: lea usted mismo `/qorechain/pqc/v1/kem/{address}` y `/qorechain/pqc/v1/account/{address}`, verifique la tarjeta (`verify_recipient_card`) y después selle.

### API principal {#api}

Los nombres están en forma TypeScript. Go usa la capitalización de Go (`Seal`, `Open`, `NewEpochKeyManager`), Rust y Python usan snake_case. En Python, Swift y Kotlin, `seal` y `open` son `seal_envelope` / `sealEnvelope` y `open_envelope` / `openEnvelope`.

| Nombre | Qué hace | Dónde |
|---|---|---|
| `generateSealKeys` | par de claves aleatorio (ML-KEM-1024 + X25519) | todos |
| `deriveSealKeys` | par de claves a partir de una mnemónica BIP-39, frase de contraseña e índice opcionales | todos |
| `sealKeysFromSeed`, `sealSeedFromMnemonic` | restaurar desde la semilla de 32 bytes; semilla desde una mnemónica | todos |
| `recipientOf` | destinatario público a partir de un par de claves | todos |
| `validateMlkemPublicKey`, `validateX25519PublicKey` | comprobaciones de entrada (la cadena aplica la misma comprobación ML-KEM) | todos |
| `seal` | cifrar para 1 a 1,024 destinatarios (`mode`, `aad`, `anonymous`) | todos |
| `open` | descifrar con un par de claves | todos |
| `parseEnvelope`, `envelopeSize` | inspeccionar un sobre; calcular su tamaño | todos |
| `envelopeToText`, `envelopeFromText` | forma de texto `qoreseal:` | todos |
| `signRecipientCard`, `verifyRecipientCard` | crear y comprobar la tarjeta de destinatario | todos |
| `recipientCardText`, `recipientCardFields`, `assembleRecipientCard` | construir una tarjeta cuando se firma en otro lugar, por ejemplo en la interfaz de una wallet | todos |
| `buildRegisterKemKeyMessage`, `buildRemoveKemKeyMessage` | mensajes del registro, que se firman de forma híbrida con QoreSign | todos |
| `describeKemRegistryError` | explica los códigos 250 a 254 del codespace `pqc` | todos |
| `EpochKeyManager` | claves de época para un grupo: `addMember`, `removeMember`, `rotate`, `distribution`, `exportKeys`, `keyFor`, `members`, `epoch` | todos |
| `sealEpochKey`, `openEpochKey` | enviar o recibir una clave de época (por ejemplo el historial para un recién llegado) | todos |
| `PrivateBatchCodec`, `sealBatch`, `openBatch`, `parseBatchHeader`, `batchSize` | lotes cifrados con compromisos | todos |
| `fetchKemKey`, `fetchMlkemPublicKey` | leer de REST la clave ML-KEM de una cuenta | TypeScript, paquete de red de Go |
| `resolveRecipient` | claves en la cadena más tarjeta, verificadas, como destinatario | TypeScript, paquete de red de Go |
| `sealToAddresses` | sellar para cuentas por dirección | TypeScript, paquete de red de Go |

Los ayudantes de red son `@qorechain/qoreseal/network` en TypeScript y `github.com/qorechain/qoreseal/go/network` en Go. También se exportan bloques de construcción de más bajo nivel (`mlkemEncapsulate`, `mlkemDecapsulate`, `x25519Agree`, `hybridSharedSecret`, `deriveKey`, `kdfInfo`, `recipientHint`). Las funciones con nombre de prueba (`sealWithEntropy`, `testing_*`) existen para reproducir los vectores de prueba y nunca deben usarse con datos reales.

Los errores de Python lanzan `QoreSealError.Failure` con un `code` estable; los errores de Go se comparan con `qoreseal.IsCode`.

## Cómo acceder {#how-to-access}

| | Mainnet `qorechain-vladi` | Testnet `qorechain-diana` |
|---|---|---|
| Registro de claves KEM | después de la actualización v3.2.5 (todavía no aplicada, sin fecha) | activo |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` (chain ID 9801) | `https://evm-testnet.qore.host` (chain ID 9800) |

El 27 de octubre de 2026 la consulta al registro de la testnet respondió `{"found":false,"key":null}` para una cuenta sin clave, y la misma consulta en la mainnet respondió "Not Implemented".

- Sellar y abrir sin conexión, incluidas las claves de auditor pasadas directamente, los grupos privados y los lotes, no necesita red ni cuenta.
- Cifrar para una dirección necesita que el destinatario haya publicado una clave ML-KEM-1024 en el registro y, para el modo híbrido, una tarjeta de destinatario.
- Publicar una clave necesita una cuenta con QOR de testnet (en la mainnet, QOR tras la actualización), una clave ML-DSA-87 registrada y QoreSign para firmar la transacción de forma híbrida. El mínimo de comisión es 0.1 uqor por gas. Obtenga QOR de testnet en el [Faucet](/dashboard/faucet).
- Hasta que la mainnet aplique v3.2.5, la consulta al registro en la mainnet no está disponible y el registro se rechaza (código 250).

## Dónde se publica {#where-published}

Comprobado el 27 de octubre de 2026 contra cada registro.

| Registro | Paquete | Versión | Enlace |
|---|---|---|---|
| crates.io | `qorechain-qoreseal` | 0.1.0 | [crates.io/crates/qorechain-qoreseal](https://crates.io/crates/qorechain-qoreseal) |
| Proxy de módulos de Go | `github.com/qorechain/qoreseal/go` | v0.1.0 (etiqueta `go/v0.1.0`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoreseal/go) |
| PyPI | `qorechain-qoreseal` | 0.1.0 (wheels para macOS arm64 y x86_64, Linux x86_64 y aarch64, más el código fuente) | [pypi.org/project/qorechain-qoreseal](https://pypi.org/project/qorechain-qoreseal/) |
| Swift Package Manager | `QoreSeal` desde `github.com/qorechain/qoreseal` | 0.1.0 (binario `QoreSealFFI.xcframework.zip` en la versión de GitHub) | [release v0.1.0](https://github.com/qorechain/qoreseal/releases/tag/v0.1.0) |
| Maven Central | `io.github.qorechain:qoreseal` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) |
| Maven Central | `io.github.qorechain:qoreseal-android` | 0.1.0 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) |
| npm | `@qorechain/qoreseal` | todavía no publicado (por llegar) | |

Los proyectos que usan cualquiera de los dos artefactos de Maven necesitan el compilador Kotlin 2.3 o posterior. El artefacto Kotlin/JVM incluye bibliotecas nativas para macOS (arm64, x86_64), Linux (x86_64, arm64) y Windows (x86_64); el artefacto de Android cubre arm64-v8a, armeabi-v7a y x86_64.

Código fuente: [github.com/qorechain/qoreseal](https://github.com/qorechain/qoreseal) (versión v0.1.0). Licencia Apache-2.0.

## Límites y problemas conocidos {#limits}

- **Lo que se protege es el contenido de la carga.** Las direcciones del remitente y del destinatario, los importes de las transferencias bancarias, el momento de las transacciones, los tamaños de los sobres y el número de destinatarios siguen siendo públicos en la cadena.
- **No son transacciones privadas.** QoreSeal no oculta quién transacciona con quién, ni cuánto.
- **Sin pruebas de conocimiento cero.** Nada demuestra nada sobre los datos cifrados; en una sidechain privada, los verificadores ajenos al grupo no pueden comprobar lo que ocurre dentro de un lote.
- **Los sobres no están firmados.** Cualquiera puede cifrar para una dirección, y cualquier destinatario de un sobre con varios destinatarios podría construir un sobre distinto para los demás. Firme el contenido o el sobre (`signMessage` de QoreSign) cuando haya que autenticar al remitente.
- **Todos los destinatarios leen toda la carga.** No hay redacción por destinatario; selle sobres separados para lectores distintos.
- **Las pistas no son anonimato.** Cualquiera que conozca la clave pública de un candidato (está en la cadena) puede comprobar si esa clave es un destinatario. `anonymous: true` pone las pistas a cero; los destinatarios prueban entonces todas las entradas.
- **Perder la clave significa perder los datos.** No hay recuperación en la cadena. Perder la semilla o la mnemónica pierde todo lo sellado para esa clave.
- **Eliminar o rotar una clave no borra ni vuelve a cifrar nada.** Los datos sellados para una clave antigua siguen siendo legibles por quien la tenga; conserve las semillas o los índices antiguos.
- **Los miembros eliminados de un grupo** conservan las claves de las épocas a las que pertenecieron. Los miembros nuevos leen desde su época de ingreso, salvo que se les selle claves anteriores.
- **El chain id y el propósito no están en el sobre;** el destinatario debe conocerlos.
- **Registro en la mainnet:** no disponible hasta que la mainnet aplique v3.2.5.
- **Previo a la 1.0, construcción pendiente de revisión externa.** Las versiones menores pueden cambiar la API. Lea la especificación antes de depender de ella.
- **Todavía no hay paquete de npm** ni wheel de Python para Windows.

## Notas de seguridad {#security}

- Las claves secretas nunca salen del dispositivo o servidor que ejecuta QoreSeal. La cadena guarda solo la clave pública ML-KEM-1024, y la tarjeta lleva la clave pública X25519.
- Haga copia de seguridad de la mnemónica de la cuenta, de una mnemónica dedicada o de la semilla de 32 bytes (`keys.seed`), cifrada en reposo. No exporte nunca la clave secreta ML-KEM por sí sola; exporte la semilla o la mnemónica.
- Rotación: pase al siguiente índice, registre la nueva clave ML-KEM, firme una nueva tarjeta. Las tarjetas antiguas dejan de verificarse automáticamente.
- Añada un destinatario de recuperación (una clave offline) a los datos que deban sobrevivir a la pérdida de la clave de un usuario. Trátelo como una clave de auditor, ya que lee todo aquello a lo que se añade.
- Para los grupos, `exportKeys()` contiene todas las claves de época. Selle esa exportación para la clave propia del operador y una clave de recuperación offline, y manténgala fuera de la máquina del secuenciador. Rote las claves de época según un calendario.
- El modo `mlkem` debe elegirse de forma explícita; el modo híbrido nunca se degrada en silencio.
- Las primitivas vienen de los bindings de [`qorechain-pqc`](/developer-tools/pqc-library) y de bibliotecas consolidadas (noble para TypeScript, crates de RustCrypto, la biblioteca estándar de Go); las firmas de cuenta vienen de [QoreSign](/qoresign/overview).
- Comunique las vulnerabilidades de forma privada a security@qore.network. Que los metadatos en la cadena sean públicos es intencionado y es un tema de documentación, no una vulnerabilidad.

## Páginas relacionadas {#related}

- [QoreSign](/qoresign/overview): firma híbrida de la transacción de registro, y firma de mensajes detrás de las tarjetas de destinatario y los sobres firmados.
- [Resumen del RDK](/rollups/overview) y [Disponibilidad de datos](/rollups/data-availability): anclaje de lotes cifrados de una sidechain privada.
- [Biblioteca PQC](/developer-tools/pqc-library): los bindings de ML-KEM-1024 bajo QoreSeal.
- [Seguridad poscuántica](/architecture/post-quantum-security) y [Firma poscuántica](/developer-guide/post-quantum-signing): cómo funcionan las cuentas y las claves en la cadena.
- [Resumen de los paquetes para desarrolladores](/developer-tools/overview).
