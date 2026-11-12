---
slug: /build-before-qday/key-binding
title: Cómo se vincula tu clave poscuántica a tu cuenta
sidebar_label: Vinculación de la clave
sidebar_position: 3
---

# Cómo se vincula tu clave poscuántica a tu cuenta

Todos los tutoriales de esta sección usan una **clave poscuántica** junto a la clave normal de tu cuenta. Esta página explica, con palabras sencillas, de dónde sale esa clave, cómo averigua la cadena que pertenece a tu cuenta y cómo puedes comprobarlo tú mismo. No necesitas ejecutar nada para leerla. Las comprobaciones de [Compruébalo tú mismo](#check) tardan unos 5 minutos.

## La idea en un dibujo {#picture}

```text
frase de recuperación (o código de recuperación)
        |
        v
deriva las dos claves
  - clave clásica (secp256k1)
  - clave poscuántica (ML-DSA-87), ligada a la dirección de tu cuenta
        |
        v
registra una sola vez, con una prueba de posesión
        |
        v
cada transacción se firma de forma híbrida (las dos claves)
        |
        v
los validadores verifican las dos firmas
```

## Palabras que se usan en esta página {#words}

| Palabra | Qué significa |
| --- | --- |
| Clave clásica | La clave normal de tu cuenta (secp256k1). Firma cada transacción en todas las blockchains de este tipo. |
| Clave ML-DSA-87 | La clave de firma poscuántica. No se espera que un futuro ordenador cuántico pueda romperla. |
| Frase de recuperación (mnemónico) | Las 12 o 24 palabras que restauran una cuenta. |
| Código de recuperación | Una línea que empieza por `QRC1`. Sustituye a la frase de recuperación para la clave poscuántica cuando tu cuenta viene de una clave privada sin más. |
| Registrar | Una transacción que le dice a la cadena qué clave ML-DSA-87 pertenece a tu cuenta. |
| Prueba de posesión | Una firma que demuestra que de verdad tienes la mitad secreta de la clave que registras. |
| Firma híbrida | Las dos firmas en una misma transacción. |

## 1. Se deriva, no se genera {#derive}

La clave poscuántica no se elige al azar ni se guarda en un archivo que podrías perder. Se **deriva**: la misma entrada da siempre la misma clave.

- **Con una frase de recuperación.** La clave ML-DSA-87 sale de la **misma frase de recuperación** que la clave clásica, junto con la dirección de tu cuenta. Tanto la clave clásica como la poscuántica se reconstruyen a partir de la frase, así que **una sola copia de seguridad restaura las dos**. Es lo que hacen QoreX y la cuenta unificada del SDK.
- **Con una clave privada sin más.** Una clave privada por sí sola no puede dar una segunda clave. La clave poscuántica se crea entonces a partir de un **código de recuperación** aparte que empieza por `QRC1`. En el proyecto del Workshop 1 lo creas con `pnpm window recovery-code`. En el SDK es `generatePqcRecoveryCode()`.

Tres reglas para un código de recuperación:

1. Guárdalo **separado** de la clave privada. Si los dos están en el mismo sitio, un solo robo se lleva ambos.
2. Reutiliza siempre el **mismo** código para la misma cuenta.
3. Un **código distinto da una clave distinta**. La cadena ve entonces una clave que no coincide con la que registraste.

:::caution Un código de recuperación no se puede reconstruir
No hay forma de recuperar un código de recuperación perdido. Anótalo en papel cuando lo crees. Las cuentas de testnet desechables son la excepción: puedes crear una cuenta nueva en un minuto.
:::

## 2. Se vincula una vez, con una prueba de posesión {#bind}

Vincular es una transacción, que se envía una sola vez por cuenta y se llama `MsgRegisterPQCKeyV2`. Lleva:

- tu **clave pública** ML-DSA-87 (2.592 bytes), y
- una **prueba de posesión**: la clave firma un texto corto que nombra la cadena y tu cuenta. Nadie puede vincular una clave que no tiene, y nadie puede copiar una vinculación de otra cadena.

Es el único mensaje que la cadena acepta con **solo la firma clásica**. El motivo es simple: antes de él, la cadena no tiene ninguna clave poscuántica registrada para tu cuenta, así que no hay nada con lo que comprobar una segunda firma.

Cómo se hace:

| Dónde | Cómo |
| --- | --- |
| QoreX | Automático en tu primer envío. Cuesta una comisión única de unos 0,09 QOR. |
| Workshop 1 y las apps de ejemplo | `pnpm window register` (paso 5 de la [guía del Workshop 1](/build-before-qday/workshop-1#step-5)). |
| Tu propio código | `ensurePqcRegistered` del SDK. |

`ensurePqcRegistered` se puede volver a llamar sin riesgo. Primero lee tu cuenta. Si tu clave ya está vinculada, no envía nada. Si hay una clave **distinta** vinculada, se detiene con `PqcKeyMismatchError` y no envía nada. Si envías un segundo registro a mano, la cadena lo rechaza y **aun así cobra la comisión**, así que deja que el ayudante haga la comprobación.

:::note Qué exige la cadena hoy
La cadena comprueba una prueba de posesión siempre que haya una, y rechaza el registro si no se verifica. El SDK y QoreX adjuntan una por sí solos. En mainnet todavía se acepta un registro sin prueba. En la testnet, desde la versión v3.2.8, la primera transacción de una cuenta nueva debe ser este registro. Detalles: [Firma poscuántica](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. Tras vincular, todo es híbrido {#hybrid}

A partir de ahí, cada transacción nativa lleva dos firmas:

- la firma clásica secp256k1 (64 bytes), y
- la firma ML-DSA-87 (4.627 bytes) en una extensión llamada `PQCHybridSignature`.

Los validadores verifican **las dos**. Cuando lo hacen, la cadena registra un evento `pqc_hybrid_verify` con el estado `verified`.

Sin una clave registrada, una transacción se rechaza con `account has no PQC key and classical fallback is disabled`.

Las transacciones en el carril EVM (por ejemplo, desplegar un contrato) necesitan una cosa más: una ventana de autorización EVM, abierta con un mensaje de firma híbrida. Consulta la [referencia de la ventana EVM](/developer-guide/evm-window-reference).

## Compruébalo tú mismo {#check}

Necesitas `curl`. `jq` es opcional. Los dos se explican en [Antes de empezar](/build-before-qday/prerequisites#curl-jq).

### ¿Está registrada mi clave? {#check-account}

1. Sustituye `qor1...` por tu propia dirección y ejecuta:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Qué hace: pide al servidor público de la testnet el registro de claves de tu cuenta.

Parámetros:

- `curl`: un programa que descarga una dirección web.
- `-s`: silencioso, oculta la barra de progreso y muestra solo la respuesta.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: la dirección REST de la testnet, seguida de tu cuenta.

**Qué deberías ver:** para una cuenta registrada, una respuesta como esta (se muestran marcadores, la tuya tiene valores reales):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` es `true` cuando hay una clave vinculada y `false` cuando no. `possession_proven` es `true` cuando la clave se registró con una prueba de posesión verificada.

### ¿Se firmó mi transacción de forma híbrida? {#check-tx}

La comprobación del Workshop 1, paso 6.

1. Sustituye `<HASH>` por el hash de una transacción tuya (sin los `<` y `>`) y ejecuta:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Qué hace: pide al servidor público de la testnet el registro completo de tu transacción.

**Qué deberías ver:** un bloque largo de texto. Busca tres cosas:

1. `"code": 0` dentro de `tx_response`. El código 0 significa éxito.
2. La extensión `PQCHybridSignature`, que contiene la firma ML-DSA-87: **4.627 bytes**, junto a la firma secp256k1 de 64 bytes.
3. En `events`, un evento de tipo `pqc_hybrid_verify` con el atributo `status` igual a `verified`.

2. Para imprimir solo ese evento (necesita `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Qué hace: descarga el mismo registro y lo pasa por `jq`, que se queda solo con el evento de verificación.

**Qué deberías ver:** un evento cuyo atributo `status` es `verified`.

## Claves y cambios relacionados {#related}

- **Claves de cifrado.** Las claves ML-KEM-1024, que usa [QoreSeal](/developer-tools/qoreseal) para cifrar datos hacia una cuenta, viven en un **registro aparte**. Publicas una con `MsgRegisterKEMKey`, en una transacción de firma híbrida, así que la cuenta ya debe tener su clave ML-DSA-87.
- **Cambiar la clave de firma.** `MsgRotatePQCKey` cambia la clave ML-DSA-87 por una nueva del mismo tipo, por ejemplo para retirar una clave comprometida. `MsgMigratePQCKey` pasa de un algoritmo a otro. Las dos necesitan firmas de la clave antigua y de la nueva, y la cadena rechaza una clave que la cuenta ya usó antes. Ambas están activas en mainnet y testnet. Reglas completas: [Firma poscuántica](/developer-guide/post-quantum-signing).

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | La cuenta todavía no ha registrado su clave ML-DSA-87. | Registra primero (`pnpm window register`, el primer envío de QoreX o `ensurePqcRegistered`) y vuelve a enviar. Comprueba con la consulta de cuenta de arriba. |
| `PqcKeyMismatchError`, o `registered, but NOT this key` en `pnpm window status` | Ya hay una clave distinta vinculada. Usaste otro código o frase de recuperación que la primera vez. | Recupera el código o la frase de recuperación original. Si es una cuenta desechable, empieza de nuevo con una cuenta nueva. |
| Registro rechazado por ya estar registrado | La cuenta ya tiene una clave. Un segundo registro directo sigue cobrando la comisión. | No hagas nada. Lee la cuenta con la consulta de arriba, o usa `ensurePqcRegistered`, que comprueba primero. |
| Perdiste tu código de recuperación | No se puede reconstruir a partir de la clave privada. | Si la cuenta vino de una frase de recuperación, usa la misma frase: da la misma clave. Si no, usa una cuenta nueva. En la testnet no cuesta nada. |
| El registro falla con un mensaje de comisión o de saldo | La cuenta tiene muy poco QOR para la comisión (unos 0,09 QOR) o la comisión está por debajo del mínimo de la red, 0,1 uqor por unidad de gas. | Consigue QOR en el [faucet](https://dashboard.qorechain.io/faucet), fija el gas en unos 600.000 para un registro manual y vuelve a intentarlo. |
| `found` es `false` aunque registraste | Estás preguntando a la red equivocada o con la dirección equivocada. | Comprueba que usas `api-testnet.qore.host` para la testnet y tu propia dirección `qor1...`. Una wallet puede mostrar una red distinta a la de tu proyecto. |
| La cuenta responde `found: true` pero tus transacciones fallan | La clave en la cadena no es la que deriva tu proyecto. | Ejecuta `pnpm window status` y compara con el código de recuperación de `.env`. |

## Siguiente paso {#next}

Vuelve a la [guía del Workshop 1](/build-before-qday/workshop-1#step-5) y registra tu clave, o lee la [visión general](/build-before-qday/overview).
