---
slug: /developer-tools/pqc-library
title: Biblioteca post-cuántica (qorechain-pqc)
sidebar_label: Biblioteca PQC
sidebar_position: 20
---

# Biblioteca post-cuántica (`qorechain-pqc`)

`qorechain-pqc` es la biblioteca de criptografía post-cuántica, basada solo en estándares, sobre la que se construyen las herramientas de QoreChain. Está pensada para desarrolladores de monederos, backends, exchanges y herramientas que necesitan crear o comprobar las claves y firmas exactas que usa la cadena, sin depender del [SDK de QoreChain](/sdk/overview) completo. Envuelve implementaciones independientes de tres estándares del NIST (ML-DSA, FIPS 204, para firmas; ML-KEM, FIPS 203, para encapsulación de claves; SHAKE-256, FIPS 202, como hash) tras una única API en TypeScript/JavaScript, Python, Rust, Go, Java y C, y añade los ayudantes que construyen los bytes que firma una transacción híbrida de QoreChain. Versión **0.2.3**, Apache-2.0, comprobada contra los registros el 27 de octubre de 2026.

Es una biblioteca de primitivas. No se comunica con la red, no guarda claves, no registra claves en la cadena ni envía transacciones. Para las reglas de la cadena sobre firmas híbridas y registro de claves, lee [Firma poscuántica](/developer-guide/post-quantum-signing) y [Seguridad Post-Cuántica](/architecture/post-quantum-security); para un cliente de firma ya hecho usa el [SDK](/sdk/overview) o [QoreSign](/qoresign/overview), que se construyen ambos sobre estas primitivas.

## Innovaciones {#innovations}

* **Un único conjunto de vectores de prueba, seis backends independientes.** El binding de JavaScript usa `@noble/post-quantum`, Rust usa los crates `fips204`, `fips203` y `sha3`, Go usa Cloudflare CIRCL, Java usa Bouncy Castle, y Python y C usan liboqs. La suite de pruebas de cada binding debe reproducir byte a byte los mismos archivos de la carpeta `vectors/` del repositorio (ML-DSA en tres niveles, ML-KEM en tres niveles, SHAKE-256), de modo que una firma hecha en un lenguaje se verifica en los demás.
* **Firma determinista por defecto.** `sign` usa la variante determinista de FIPS 204 (aleatoriedad de firma de 32 bytes a cero), de modo que la misma clave y el mismo mensaje dan una firma idéntica byte a byte en todos los bindings. Eso hace que las firmas, y los hashes de transacción que las contienen, sean reproducibles y comprobables contra los vectores.
* **Firma hedged como opción explícita que interopera.** La firma aleatorizada (hedged) está disponible como `{hedged: true}` en JavaScript, `hedged=True` en Python, `sign_hedged` en Rust, `SignHedged` en Go (añadida en la 0.2.3), `mldsaSignHedged` en Java y `qpqc_mldsa_sign_hedged` en C. Una firma hedged hecha en cualquiera de los seis lenguajes se verifica en los seis (36 de 36 combinaciones comprobadas para la 0.2.3). La cadena verifica cualquier firma ML-DSA-87 válida de FIPS 204, así que acepta ambos tipos; no se pueden distinguir sin la clave secreta.
* **Los sign-bytes híbridos de la cadena, construidos como los construye la cadena.** Todos los bindings tienen `hybridSignBytesV1`, `hybridSignBytesV2` y un despachador `hybridSignBytes(version, chainId, body, authInfo)` que exige la versión. La forma v2 es `"qorechain-pqc-hybrid-v2"`, luego el id de la cadena con una longitud big-endian de 64 bits, y luego el cuerpo de la transacción (sin la extensión PQC) y la auth info, cada uno con una longitud big-endian de 32 bits. Todos los bindings se prueban contra el archivo de respuestas conocidas de la cadena (`vectors/signbytes-kat-v3.1.98.json`). Un id de cadena vacío se rechaza en los puntos de entrada comprobados, porque unos bytes vinculados a ninguna cadena no se verifican en ninguna red.
* **La versión de sign-bytes de la red decidida por una función pura.** Una red verifica exactamente una forma a la vez, y el cambio a v2 se aplicó con dos nombres de plan (`v3.2.0` en mainnet en la altura 2,981,742 y `v3.1.98` en la testnet). `SIGN_BYTES_V2_UPGRADES` lista ambos nombres y `signBytesVersionForApplied(chainId, appliedHeights)` devuelve `v1` o `v2` a partir de las alturas aplicadas que lees del nodo. Preguntar solo por un nombre interpretaría mal una red que cambió con el otro.
* **Comprobación estricta de la entrada.** `verify` nunca lanza una excepción: una clave o firma de longitud incorrecta, o cualquier otra entrada malformada, devuelve `false`. `keygen(seed)`, `sign`, `encapsulate` y `decapsulate` lanzan un error que nombra el argumento incorrecto y su longitud esperada.
* **JavaScript puro, sin código nativo.** El paquete de npm se ejecuta en Node y en navegadores sin WebAssembly ni complementos. En un portátil con Apple silicon, en la propia medición del repositorio (0.2.3, mensaje de 1.5 KB, un núcleo), ML-DSA-87 firma en unos 8 ms en JavaScript y en unos 0.3 a 0.45 ms en los otros cinco bindings.

## Cómo usarlo {#how-to-use}

Los cinco paquetes de registro exponen las mismas operaciones: `keygen`, `keygenFromSeed` (semilla de 32 bytes), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; y los ayudantes de sign-bytes. ML-DSA-87 y ML-KEM-1024 son los valores por defecto, y las variantes específicas de cada nivel (44, 65, 87 y 512, 768, 1024) se exportan junto a ellos. ML-DSA-87 tiene una clave pública de 2,592 bytes y una firma de 4,627 bytes, que los ejemplos siguientes imprimen.

### Instalar e importar {#install}

| Lenguaje | Instalación | Importación |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 o posterior) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | compila `c/` desde el repositorio (biblioteca estática y cabecera) | `qorechain_pqc.h` |

### Firmar y verificar, en cada lenguaje {#examples}

Estos son los inicios rápidos del centro de desarrolladores. Cada uno se ejecutó sin cambios el 27 de octubre de 2026 tras instalar desde el registro público (Node 26, Python 3.12 con liboqs presente, Rust 1.95, Go 1.26, JDK 21 con Gradle 9.6) e imprimió el tamaño de la clave pública, el tamaño de la firma y el resultado de la verificación: `2592 4627 true` (Python imprime `True`). Ninguno usa la red ni una clave con fondos, y el binding de C no tiene inicio rápido.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (guárdalo como `PqcQuickstart.java`):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

La semilla fija (32 bytes, cada uno de valor 7) es solo un ejemplo. Usa una semilla aleatoria o la derivación de claves descrita en [Firma poscuántica](/developer-guide/post-quantum-signing#key-derivation) para una clave real.

### Firma hedged {#hedged}

La firma determinista es lo que hace `sign`. Para optar por la firma aleatorizada, llama a la variante explícita, por ejemplo `mldsa.sign(secretKey, message, { hedged: true })` en JavaScript o `mldsa.sign(secret_key, message, hedged=True)` en Python. Úsala solo si quieres una firma distinta cada vez; la cadena acepta ambas, y el `pqc` código 21 (`hybrid_verify_failed`) nunca lo causa elegir una u otra (consulta la [lista de solución de problemas](/developer-guide/post-quantum-signing#code-21)).

### Elegir la forma de los sign-bytes {#sign-bytes}

Pregunta al nodo qué nombres de actualización están aplicados y deja que la biblioteca decida. Esta es la forma de JavaScript del README del paquete; los demás bindings exportan los mismos nombres a su estilo.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest` es `https://api.qore.host` para mainnet (`qorechain-vladi`) o `https://api-testnet.qore.host` para la testnet (`qorechain-diana`). Hoy ambas redes verifican v2. La mayoría de las aplicaciones no necesitan hacer esto a mano: el SDK y QoreSign resuelven la forma por red.

## Cómo acceder {#how-to-access}

* **No se necesita red, cuenta ni clave para usar la biblioteca.** Funciona sin conexión. Un par de claves que crea es solo una clave; para usarla en QoreChain la cuenta debe registrar la clave pública una vez (consulta [Firma poscuántica](/developer-guide/post-quantum-signing#pqc-key-registration)), y una transacción del carril Cosmos necesita entonces la firma secp256k1 más la firma ML-DSA-87 (híbrida).
* **Redes.** Los ayudantes de sign-bytes y los vectores coinciden con mainnet `qorechain-vladi` (v3.2.5) y la testnet `qorechain-diana` (v3.2.6). Consulta [Redes](/appendix/networks) para ver los endpoints.
* **Python necesita la biblioteca compartida liboqs.** `pip install qorechain-pqc` depende de `liboqs-python`, que compila liboqs en la primera importación cuando falta; eso necesita `git`, CMake y un compilador de C en la máquina. Instala liboqs desde el gestor de paquetes de tu sistema, o compílala de antemano, en entornos restringidos. El binding de Python lee las claves del generador de números aleatorios del sistema y no tiene generación de claves a partir de semilla en la 0.2.3.
* **Go necesita Go 1.25 o posterior** (un requisito desde la 0.2.1, junto con CIRCL 1.6.5 o posterior).
* **Java** se ha ejecutado con JDK 21. La clave secreta ML-DSA del binding de Java es la semilla de 32 bytes de FIPS 204, no la clave expandida de 4,896 bytes que usan los otros bindings; cualquier otra entrada se rechaza.
* **Versión fija de Bouncy Castle en Java.** El binding de Java se construye sobre Bouncy Castle 1.85 desde la 0.2.3 (las versiones anteriores usaban versiones más antiguas con avisos publicados, ninguno en el código ML-DSA o ML-KEM al que llama el binding). Según el registro de cambios del proyecto, la 1.85 es la última versión de Bouncy Castle que aún incluye las clases `org.bouncycastle.pqc.crypto`, así que mantén tu build en la 1.85 y prueba antes de dejar que otra dependencia traiga una versión más nueva, porque las versiones posteriores ya no incluyen esas clases.
* **Coste.** Gratuita y de código abierto bajo Apache-2.0. Firmar y verificar no cuesta nada; el uso en cadena de las firmas resultantes paga la comisión habitual (mínimo 0.1 uqor por gas).

## Dónde se publica {#where-published}

| Registro | Paquete | Versión | Enlace |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (importar `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Proxy de módulos de Go | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (etiqueta `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | solo código fuente, sin registro de paquetes | etiqueta `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Código fuente: https://github.com/qorechain/qorechain-pqc (carpetas `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Todos los paquetes son Apache-2.0. Las versiones se leyeron de cada registro el 27 de octubre de 2026. La guía conceptual de la misma biblioteca, incluidas la derivación y la rotación de claves, es [Firma poscuántica](/developer-guide/post-quantum-signing); el SDK que la usa se describe en [Visión general del SDK](/sdk/overview).

## Límites y problemas conocidos {#limits}

* **Es una biblioteca de primitivas, no un monedero ni un cliente.** No registra claves, no construye transacciones, no difunde ni lee la cadena. Usa el [SDK](/sdk/overview) o [QoreSign](/qoresign/overview) para eso.
* **Python y C no pueden generar una clave a partir de una semilla.** Ambos se apoyan en liboqs, que obtiene las claves del generador de números aleatorios del sistema. Sus pruebas con vectores usan en su lugar la clave secreta expandida.
* **La clave secreta de Java es una semilla.** El código que mueve claves secretas ML-DSA entre Java y los otros bindings debe convertirlas: el valor de Java es la semilla de 32 bytes, los demás son la clave expandida de 4,896 bytes de ML-DSA-87.
* **El binding de Python necesita una cadena de herramientas de C la primera vez** si liboqs no está ya instalada. El inicio rápido de Python se ejecutó con liboqs ya presente.
* **El binding de C no tiene paquete en un registro ni inicio rápido probado.** Compílalo desde el repositorio; necesita liboqs y OpenSSL.
* **Los tamaños de clave los fija el estándar.** Una firma ML-DSA-87 ocupa 4,627 bytes y una clave pública 2,592 bytes; no existe una forma más pequeña compatible con el estándar.
* **Versiones anteriores.** Usa la 0.2.1 o posterior: la 0.2.0 introdujo el `hybridSignBytes` con reconocimiento de versión (la antigua forma de dos argumentos es ahora `hybridSignBytesV1`), y la 0.2.1 añadió ambos nombres de plan de actualización. La 0.2.2 y la 0.2.3 cambiaron la documentación y las versiones de dependencias, con una salida idéntica.
* **El uso híbrido sigue necesitando la otra mitad.** Una firma híbrida lleva también una firma secp256k1; esta biblioteca produce solo la mitad ML-DSA. Las cuentas, el registro y la ventana de autorización EVM son reglas de la cadena documentadas en [Firma poscuántica](/developer-guide/post-quantum-signing) y en la [guía de EVM](/developer-guide/evm-development#evm-window).
