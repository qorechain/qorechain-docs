---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: Aplicación en Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# Aplicación en Java: Q-Day Tip Jar

El **Q-Day Tip Jar** es un pequeño backend en Java para la testnet de QoreChain (`qorechain-diana`, ID de cadena EVM 9800). Envía propinas con una **firma híbrida** (clásica secp256k1 más poscuántica ML-DSA-87, FIPS 204). Como ejemplo de backend de una tienda, también puede vigilar una dirección de bote y aceptar solo las propinas cuya firma de remitente la cadena haya verificado como híbrida.

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1** desde Java con una única ruta de llamadas en el SDK.
- **Una transacción con firma híbrida verificada en la cadena**: la cadena emite un evento `pqc_hybrid_verify` con `status=verified` para el firmante, y la transacción lleva una firma ML-DSA-87 de 4627 bytes.
- **Un backend que distingue las propinas resistentes a la computación cuántica de las clásicas**: `watch` etiqueta cada transferencia entrante como `QUANTUM-SAFE` o `classical only`.

Por qué importa: se espera que un futuro ordenador cuántico pueda romper una firma solo clásica. Un servicio que consulta el registro de verificación de la propia cadena puede decidir cuánta confianza dar a cada pago. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

## Paso a paso {#run}

Todo lo que sigue se ejecuta en tu propia terminal (macOS, Linux o Windows con WSL). Solo usas una cuenta de testnet desechable. Los QOR de testnet no tienen valor y aquí nunca usas una wallet real.

### 1. Instala las herramientas {#install}

Necesitas Git, un JDK 21 o posterior y Maven. Comprueba lo que tienes:

```bash
git --version
java -version      # must report 21 or later
mvn -version       # any recent Maven 3.x
```

Si falta `java` o `mvn`, o son demasiado antiguos, instálalos primero, por ejemplo con [Temurin JDK 21](https://adoptium.net) y [Apache Maven](https://maven.apache.org/install.html), o con tu gestor de paquetes (`brew install openjdk@21 maven` en macOS, `sudo apt install openjdk-21-jdk maven` en Debian o Ubuntu). Abre una terminal nueva y repite las tres comprobaciones.

### 2. Obtén el código {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

### 3. Compila la aplicación {#build}

```bash
mvn -q package
```

Maven descarga el SDK desde Maven Central y genera un único archivo ejecutable, `target/tipjar.jar`. La primera compilación tarda menos de un minuto. Después haz ejecutable el lanzador y comprueba que funciona:

```bash
chmod +x tipjar
./tipjar
```

Deberías ver la lista de comandos (`new`, `status`, `register`, `tip`, `watch`).

### 4. Crea tu cuenta de testnet desechable {#key}

```bash
./tipjar new
```

Esto genera una frase de recuperación nueva, la escribe en el archivo de claves `~/.config/qday/java.env` (legible solo por ti, modo 0600) e imprime únicamente la dirección de la cuenta, que empieza por `qor1...`. La frase nunca se imprime. No compartas este archivo, no lo subas a git y no lo reutilices en la mainnet. Para guardar la clave en otro lugar, define `TIPJAR_KEY=/path/to/file` antes de cada comando.

Copia la dirección `qor1...` de la salida. Si la pierdes, `./tipjar status` la vuelve a imprimir.

### 5. Consigue QOR de testnet en el faucet {#faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y solicita tokens. El faucet da 100 QOR cada 24 horas.
3. Comprueba que han llegado:

```bash
./tipjar status
```

El saldo debería mostrar tus QOR de testnet, y la clave poscuántica debería aparecer como aún no registrada.

### 6. Registra tu clave poscuántica {#register}

```bash
./tipjar register
```

Esto registra tu clave ML-DSA-87 en la cadena una sola vez. Es seguro ejecutarlo de nuevo. El propio mensaje de registro se firma de forma clásica por diseño, porque todavía no hay ninguna clave poscuántica con la que firmar; lleva una prueba de que posees la clave nueva. Todas las transacciones posteriores se firman de forma híbrida.

### 7. Crea una segunda dirección para recibir propinas {#jar}

Una propina necesita un destinatario. Crea una segunda cuenta desechable para el bote, con su propio archivo de claves:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

Copia su dirección `qor1...`. Esa es la dirección de tu bote.

### 8. Envía una propina con firma híbrida {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Sustituye `qor1...JAR_ADDRESS` por la dirección del bote del paso 7. `1` es la cantidad en QOR. El memo es opcional. La aplicación simula la transacción para fijar el gas, la firma con ambas claves, la difunde, espera al bloque y comprueba el registro de verificación de la cadena.

### 9. Vigila el bote, como lo haría el backend de una tienda {#watch}

Abre una segunda terminal en la misma carpeta. Inicia el vigilante sobre la dirección del bote y después envía otra propina desde la primera terminal:

```bash
./tipjar watch qor1...JAR_ADDRESS
```

El vigilante comprueba cada 3 segundos y etiqueta cada propina entrante. Deténlo con Ctrl+C. Define `NO_COLOR=1` para desactivar los colores. Los endpoints públicos de la testnet tienen un límite de peticiones por IP, así que si una llamada falla, espera un minuto y reintenta.

## Qué deberías ver {#output}

- Tras `tip`, la terminal imprime el hash de la transacción y la altura del bloque, y después el resultado de la verificación: `QUANTUM-SAFE` si la cadena verificó la firma híbrida, `CHECK FAILED` en caso contrario.
- En `watch`, cada propina aparece con la etiqueta `QUANTUM-SAFE` si la cadena verificó una firma híbrida, o `classical only` si no lo hizo.
- En el explorador: abre `https://explore.qore.network/tx/<HASH>` (usa el hash de la terminal) y cambia el explorador a **Testnet**. La transacción aparece como exitosa.

## Cómo funciona la prueba {#proof}

La aplicación lee la transacción desde el endpoint REST de la testnet (`GET /cosmos/tx/v1beta1/txs/{hash}`) y busca:

- un evento `pqc_hybrid_verify` con `address=<signer>` y `status=verified`;
- la extensión `/qorechain.pqc.v1.PQCHybridSignature` con un `pqc_signature` de 4627 bytes.

El vigilante lee exactamente eso para cada transferencia entrante.

## El código del SDK que importa {#code}

```java
PqcDx.Signer signer = new PqcDx.Signer();                  // keys, chain id, account number, sequence
signer.secp256k1PrivateKey = account.privateKey;            // classical half
signer.pqcKeypair = Authenticator.derivePqcCanonical(account.address, mnemonic); // ML-DSA-87 half
signer.chainId = "qorechain-diana";
signer.restUrl = Networks.get("testnet").endpoints.rest;    // sign-bytes version and key checks

PqcDx.HybridSendPath path = PqcDx.migrateToHybrid(signer, new Broadcaster(rpc), null, opts); // registers once
TypedMessage tip = NativeTx.bankSend(from, to, List.of(new StdFee.Coin("uqor", "500000")));
var sent = path.sendAuto(List.of(tip), "0.15uqor", 1.3);   // simulate, price, hybrid-sign, broadcast
TxTracker.waitForTx(new RestClient(rest), sent.result.transactionHash, null);
```

El gas nunca es fijo: cada transacción se simula primero y recibe el gas simulado multiplicado por 1,3, con un precio de 0,15 uqor por unidad de gas.

La cuenta es una cuenta clásica de QoreChain con coin 118 (`m/44'/118'/0'/0/0`). La clave ML-DSA-87 se deriva de la misma frase de recuperación y se vincula a la dirección con `Authenticator.derivePqcCanonical`. Si en cambio construyes tu propia aplicación sobre los auxiliares basados en semilla, el SDK 0.13.0 necesita un código de recuperación o un secreto PQC independiente de 32 bytes; consulta [Instalar el SDK](/sdk/install#whats-new-0130). No imprimas nunca un código de recuperación.

## Paquetes usados {#packages}

| Elemento | Versión |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| Aplicación `demo:tipjar` | 1.0.0 |

Consulta [Instalar el SDK](/sdk/install) para ver la tabla de versiones de todos los lenguajes.

## Dónde consultar cada cosa {#access}

| Qué | Dónde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Código | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
