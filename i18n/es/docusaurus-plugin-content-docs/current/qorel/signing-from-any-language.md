---
slug: /qorel/signing-from-any-language
title: Firmar transacciones de QoreChain desde cualquier lenguaje
sidebar_label: Firmar desde cualquier lenguaje
sidebar_position: 8
---

# Firmar transacciones de QoreChain desde cualquier lenguaje

QORel firma en Rust con el crate `qorel-signer`. Otros relayers, bots y herramientas pueden producir la misma firma híbrida poscuántica en otros lenguajes con el SDK de QoreChain y las bibliotecas poscuánticas. Esta página expone el contrato que todos siguen y lista la biblioteca que usar para Rust, TypeScript, Go, Python y Java. Está dirigida a desarrolladores que construyen un relayer, un bot o un backend que envía transacciones a QoreChain.

## Innovaciones {#innovations}

- **Un contrato, un conjunto de vectores de prueba.** Cada lenguaje construye los mismos bytes de firma y la misma extensión. El repositorio de QORel publica vectores reconstruidos byte a byte a partir de transacciones que la cadena aceptó, de modo que puedes comprobar una implementación antes de que toque una red.
- **La extensión es la única adición.** La firma poscuántica viaja en una opción de extensión del cuerpo de la transacción; los mensajes, las comisiones y la firma clásica conservan su forma habitual.
- **El punto de enganche es estrecho.** La firma se añade cuando la información de autenticación (auth info) es definitiva y antes de construir el documento de firma clásico. Un relayer necesita un cambio en ese punto, no una reescritura.
- **La misma clave en todas partes.** La clave ML-DSA-87 se deriva de la mnemónica de la cuenta con la derivación de cartera de QoreChain, de modo que cualquier cartera o relayer que importe la mnemónica obtiene la misma clave poscuántica.

## Cómo se usa {#how-to-use}

### El contrato {#contract}

QoreChain acepta una transacción del carril nativo solo si lleva ambas firmas:

- **La firma clásica secp256k1**, en la forma habitual `SIGN_MODE_DIRECT`. Cubre el cuerpo final, extensión incluida.
- **Una firma ML-DSA-87 (FIPS 204)** en una opción de extensión del cuerpo, de tipo `/qorechain.pqc.v1.PQCHybridSignature`, con `algorithm_id = 1`, `pqc_signature` (4.627 bytes) y un `pqc_public_key` opcional (2.592 bytes). Debe ser la única opción de extensión crítica (en `extension_options`) de la transacción.

La firma ML-DSA cubre los bytes de firma (versión 2, vigente en ambas redes):

```
"qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id
                          || BE32(len(B0)) || B0
                          || BE32(len(A))  || A
```

- `B0` es el `TxBody` sin la extensión PQC, recodificado de forma canónica.
- `A` son los bytes de `AuthInfo`, sin cambios.

Orden de las operaciones:

1. Construye el cuerpo y la información de autenticación.
2. Firma los bytes de firma con ML-DSA-87.
3. Añade la extensión al cuerpo.
4. Firma el cuerpo final con secp256k1.
5. Difunde.

Reglas fáciles de equivocar:

- `B0` debe ser canónico, porque la cadena lo vuelve a derivar decodificando el cuerpo, descartando la opción híbrida y recodificando. No envíes cuerpos con sus propias opciones de extensión, el indicador `unordered`, campos desconocidos o una codificación no canónica.
- Un rechazo con codespace `pqc` código 21 significa que la firma híbrida no se verificó. Vuelve a leer la versión de los bytes de firma y el registro de la cuenta antes de reintentar; consulta [Firma poscuántica](/developer-guide/post-quantum-signing#code-21).
- Gas: la verificación cuesta 2.000 de gas por firmante con clave, más el coste por tamaño de unos 4,7 KB de extensión. Simula por la misma ruta para que se cuenten ambos.

### Registrar y derivar la clave {#keys}

La cuenta registra su clave pública ML-DSA una vez con `MsgRegisterPQCKeyV2`, incluyendo una prueba de posesión. Es la única transacción que QoreChain acepta solo con la firma clásica. Consulta [Firma poscuántica](/developer-guide/post-quantum-signing#pqc-key-registration).

La clave ML-DSA se deriva de la misma mnemónica que la cuenta:

```
seed = SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)[:32]
```

y después `ML-DSA-87.KeyGen_internal(seed)`. Los secretos se ponen a cero en memoria y nunca se imprimen. La misma derivación se describe en [Derivación de claves](/qoresign/guides/key-derivation).

### La capa de firmantes en QORel {#signer-layer}

El crate `qorel-signer` divide el trabajo en tres interfaces:

- `PqSigner`: una primitiva poscuántica (`algorithm_id`, `public_key`, `sign`). Se proporciona `MlDsa87Signer`, con firma hedged por defecto y firma determinista para los vectores de prueba; cada firma se verifica antes de usarla.
- `SignBytesFramer`: las reglas de una cadena (`check_body`, `frame`, `pack`).
- `TxExtensionSigner`: lo que invoca el relayer. `PqExtensionSigner` combina una primitiva y un framer.

El relayer construye una transacción en este orden: codifica el cuerpo sin ninguna extensión de cofirmante (`B0`); codifica la información de autenticación final (`A`); pide al cofirmante las opciones de extensión que añadir; recodifica el cuerpo con ellas; produce la firma clásica sobre el documento de firma del cuerpo final. Para usar el crate desde Rust, depende de él desde el repositorio (no está en crates.io):

```toml
[dependencies]
qorel-signer = { git = "https://github.com/qorechain/QORel", tag = "qorel-v0.1.0" }
```

Una llamada completa, que construye el firmante híbrido para una cadena y le pide las opciones de extensión, está en `crates/qorel-signer/README.md` del repositorio. El crate trabaja con bytes protobuf en bruto, rechaza los cuerpos que la cadena rechazaría (una opción de extensión crítica ya existente, `unordered`, campos desconocidos), nunca recurre a los bytes de firma v1 en las redes de QoreChain antes de conocer la versión, verifica cada firma que produce, y pone a cero los secretos en memoria y los oculta en la salida de `Debug`. Sus pruebas reconstruyen, byte a byte, transacciones que el ante handler de la cadena aceptó. Consulta también [qorel-signer en la descripción general](/qorel/overview#qorel-signer).

Una cadena que necesita una firma adicional distinta implementa un framer, y una nueva primitiva si el algoritmo es diferente; nada más cambia en el relayer.

### Bibliotecas {#libraries}

| Lenguaje | Paquete | Firma híbrida |
|---|---|---|
| Rust | `qorechain-sdk` (crates.io), o `qorel-signer` del [repositorio de QORel](https://github.com/qorechain/QORel) (`crates/qorel-signer`) | `qorel_signer::qorechain::qorechain_hybrid_signer` con `PqExtensionSigner`; `qorechain::tx::build_hybrid_tx` |
| TypeScript y JavaScript | `npm install @qorechain/sdk` | `TxClient` firma de forma híbrida con un `pqcKeypair`; `ensurePqcRegistered` |
| Go | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | `qorechain/tx` (construcción y firma híbridas), `qorechain/signbytes`, `qorechain/pqcdx` |
| Python | `pip install qorechain-sdk` | `build_hybrid_tx`, `build_hybrid_signature_extension` |
| Java y Kotlin | `io.github.qorechain:qorechain-sdk` (Maven Central) | `PqcDx` (registro, ruta de envío híbrida) y el constructor de transacciones híbridas |
| C y otros | [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) | Bindings de generación de claves, firma y verificación de ML-DSA-87; enmarca los bytes de firma como se indica arriba |

Consulta [Paquetes para desarrolladores](/developer-tools/overview) para ver la versión actual de cada paquete y [QoreSign](/qoresign/overview) para firmar en una cartera o un backend. Los clientes solo clásicos de algunos paquetes no pueden enviar transacciones del carril nativo; revisa la página del paquete antes de usar uno para escribir.

### Vectores de prueba {#test-vectors}

`crates/qorel-signer/tests/vectors/` en el repositorio de QORel contiene:

- un archivo de respuestas conocidas de bytes de firma;
- vectores de transacciones de relé: el cuerpo sin la extensión, los bytes de firma, los bytes de la extensión y la transacción firmada completa, reconstruidos byte a byte a partir de transacciones que la cadena aceptó;
- el vector de derivación de claves entre SDKs.

Ejecútalos en tu lenguaje antes de enviar nada a una red real. Los vectores de QoreSign están en [Vectores de prueba](/qoresign/vectors).

### Añadir la firma poscuántica a otro relayer {#other-relayers}

El punto de enganche es «cuando la información de autenticación es definitiva y antes de construir el documento de firma clásico». Conecta ahí la extensión:

- En los relayers basados en Hermes, es `crates/relayer/src/chain/cosmos/encode.rs::sign_tx`. El cambio de QORel ahí es genérico: cualquier `TxExtensionSigner` puede añadir opciones de extensión.
- En los relayers de Go construidos sobre el paquete `client/tx` de Cosmos SDK, envuelve el `TxBuilder` antes de `SetSignatures`.

## Cómo acceder {#how-to-access}

- **Red.** El contrato es el mismo en ambas redes de QoreChain; el propio QORel se ha probado solo en la testnet.
- **Clave y cuenta.** Una cuenta con fondos y una clave ML-DSA-87 registrada; el QOR de testnet se obtiene en el [Faucet del panel](/dashboard/faucet).
- **Coste.** Las bibliotecas son gratuitas (Apache-2.0). Las transacciones pagan gas con un mínimo de 0,1 uqor por unidad de gas.

## Dónde se publica {#where-published}

| Paquete | Registro | Código fuente |
|---|---|---|
| `qorel-signer` | En el repositorio (`crates/qorel-signer`); no está en crates.io, usa la dependencia de git de arriba | [qorechain/QORel](https://github.com/qorechain/QORel) |
| `qorechain-sdk`, `@qorechain/sdk`, módulo de Go, artefacto de Maven | crates.io, npm, Go proxy, Maven Central, PyPI | [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk) |
| `qorechain-pqc` | npm, PyPI, crates.io, Go, Maven | [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc) |

## Límites y problemas conocidos {#limits}

- **Solo ML-DSA-87 (id de algoritmo 1).** Es el único algoritmo con el que firman QORel y las bibliotecas anteriores.
- **Versión de los bytes de firma.** Esta página documenta la versión 2, que verifican ambas redes. Aun así, una herramienta debe leer la versión de la cadena (los registros de actualizaciones aplicadas) en lugar de suponerla; QORel lo hace.
- **La firma es local.** Ninguna de estas bibliotecas custodia una clave por ti ni firma a través de una cartera de hardware.
- **Aquí no se repiten ejemplos por lenguaje.** Usa el inicio rápido de cada paquete; este manual no afirma que cada lenguaje se haya ejecutado contra los vectores de prueba de QORel.
