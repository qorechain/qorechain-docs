---
slug: /build-before-qday/workshop-1/apps/java-tipjar
title: App en Java, Q-Day Tip Jar
sidebar_label: Java, Tip Jar
sidebar_position: 5
---

# App en Java: Q-Day Tip Jar

El **Q-Day Tip Jar** es un pequeño programa en Java para la testnet de QoreChain (`qorechain-diana`, EVM chain ID 9800). Envía propinas con una **firma híbrida**: una firma clásica secp256k1 más una firma poscuántica ML-DSA-87 (FIPS 204). También puede vigilar una dirección "bote" (jar), como lo haría el backend de una tienda, y distinguir las propinas resistentes a la computación cuántica de las clásicas.

**Cuánto tarda:** unos 20 minutos la primera vez (10 minutos instalando herramientas, 5 de configuración y 5 enviando y comprobando).

No necesitas saber Java. Solo escribes los comandos de abajo, uno por uno, y comparas el resultado con "Qué deberías ver".

## Qué demuestra {#what-it-shows}

- **Firma híbrida ML-DSA-87 + secp256k1** desde Java con una sola llamada del SDK.
- **Una transacción firmada de forma híbrida y verificada en la cadena**: la cadena registra un evento `pqc_hybrid_verify` con `status=verified`, y la transacción lleva una firma ML-DSA-87 de 4.627 bytes.
- **Un backend que distingue las propinas resistentes a la computación cuántica de las clásicas**: `watch` etiqueta cada transferencia entrante como `QUANTUM-SAFE` o `classical only`.

Por qué importa: se espera que un ordenador cuántico futuro pueda romper una firma solo clásica. Un servicio que consulta el registro de verificación de la propia cadena puede decidir cuánta confianza dar a cada pago. Consulta [Transacciones resistentes a la computación cuántica](/sdk/guides/quantum-safe).

:::warning Solo testnet
Usa solo una cuenta de testnet desechable. Los QOR de la testnet no tienen valor. No uses en este tutorial tu wallet real, tu frase de recuperación real ni fondos reales.
:::

## Palabras que verás {#words}

| Palabra | Significado |
| --- | --- |
| Testnet | Una copia de práctica de QoreChain. Sus monedas son gratis y no valen nada. |
| QOR y uqor | Dos nombres de la misma moneda. 1 QOR = 1.000.000 uqor. La app pide QOR. Las comisiones se muestran en uqor. |
| Memo | Un texto corto adjunto a una transacción, como la nota de una transferencia bancaria. |
| Dirección | Tu número de cuenta público. En QoreChain empieza por `qor1`. Es seguro compartirla. |
| Archivo de clave | Un archivo con tu frase de recuperación secreta. No lo compartas nunca. |
| Faucet | Un sitio web que da QOR de testnet gratis. |
| Hash | El identificador único de una transacción. Sirve para buscarla. |

## Antes de empezar {#before}

Necesitas tres herramientas: **Git** (descarga el código), **Java 21 o superior** (ejecuta la app) y **Maven** (compila la app). Tras cada instalación, **cierra la terminal y abre una nueva**, y luego ejecuta el comando de comprobación.

| Herramienta | macOS | Windows | Linux (Debian o Ubuntu) | Comprobación |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew desde https://brew.sh) | https://git-scm.com/download/win (esto también te da "Git Bash") | `sudo apt install git` | `git --version` |
| Java 21+ | `brew install openjdk@21` | https://adoptium.net (elige Temurin 21, el instalador .msi) | `sudo apt install openjdk-21-jdk` | `java -version` debe decir 21 o superior |
| Maven | `brew install maven` | Descarga el zip desde https://maven.apache.org/download.cgi y sigue https://maven.apache.org/install.html | `sudo apt install maven` | `mvn -version` |

En Windows, usa **Git Bash** (se instala con Git) como terminal para este tutorial, porque el lanzador `tipjar` es un script de shell. En macOS usa Terminal. En Linux usa cualquier terminal. Si prefieres PowerShell a secas, mira la nota del paso 3.

**En macOS con Homebrew:** `brew install openjdk@21` puede decirte que lo enlaces. Si `java -version` sigue mostrando una versión antigua, ejecuta lo que Homebrew imprime bajo "For the system Java wrappers to find this JDK" y abre una terminal nueva.

## Consigue una wallet de testnet y QOR gratis {#wallet}

La app crea su propia clave desechable (paso 4 de abajo), así que no necesitas estrictamente una app de wallet para este tutorial. Sí necesitas un lugar donde conseguir QOR de testnet. Si además quieres ver tu cuenta en QoreX:

1. **App QoreX:** abre Ajustes y activa **Use testnet (developers)**.
2. **Extensión de navegador de QoreX:** desbloquéala, toca 7 veces el número de versión de la parte inferior y elige **Switch to testnet (diana)**.

Los QOR gratis salen del faucet en https://dashboard.qorechain.io/faucet. Inicias sesión, pegas la dirección y haces la solicitud. Da **100 QOR cada 24 horas por cuenta**.

La primera transacción de una cuenta nueva registra en la cadena su clave poscuántica ML-DSA-87. Es un paso único con una tarifa de unos 0,09 QOR. La app lo hace por ti con el comando `register`.

## Paso a paso {#run}

### 1. Descarga el código {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/05-java-tipjar
```

**Qué hace**

- `git clone <address>`: copia el proyecto desde GitHub a una carpeta nueva llamada `build-before-qday` en tu ordenador.
- `cd <folder>`: mueve tu terminal a la carpeta de la app en Java. Todos los comandos posteriores deben ejecutarse desde esta carpeta.

**Qué deberías ver:** líneas como `Cloning into 'build-before-qday'...` y después tu prompt en la carpeta nueva.

### 2. Compila la app {#build}

```bash
mvn -q package
```

**Qué hace:** Maven descarga el SDK de QoreChain desde Maven Central y empaqueta la app en un único archivo ejecutable, `target/tipjar.jar`.

| Parte | Significado |
| --- | --- |
| `mvn` | La herramienta de compilación Maven. |
| `package` | Compila el código y lo empaqueta en un archivo `.jar`. |
| `-q` | Modo silencioso: imprime solo los problemas. |

**Qué deberías ver:** nada durante unos segundos (unos 10 segundos la primera vez, algo más con una conexión lenta) y luego vuelve tu prompt. Comprueba que el archivo existe:

```bash
ls target/tipjar.jar
```

**Qué deberías ver:** `target/tipjar.jar`.

### 3. Haz ejecutable el lanzador y pruébalo {#launcher}

```bash
chmod +x tipjar
./tipjar
```

**Qué hace**

| Parte | Significado |
| --- | --- |
| `chmod +x tipjar` | Permite que el archivo `tipjar` se ejecute como un programa. Una descarga recién hecha no tiene este permiso. |
| `./tipjar` | Ejecuta el lanzador de esta carpeta. Arranca `java -jar target/tipjar.jar`. Sin ningún comando imprime la ayuda. |

**Qué deberías ver:** una lista de comandos: `new`, `status`, `register`, `tip`, `watch`.

:::note PowerShell a secas en Windows
Omite `chmod`. Sustituye `./tipjar` por `java -jar target/tipjar.jar` en todos los comandos de abajo.
:::

### 4. Crea tu cuenta de testnet desechable {#key}

```bash
./tipjar new
```

**Qué hace:** crea una cuenta nueva. Escribe una frase de recuperación secreta en el archivo de clave `~/.config/qday/java.env` (en tu carpeta personal, legible solo por tu usuario) e imprime únicamente la dirección pública.

| Parte | Significado |
| --- | --- |
| `new` | Crea un archivo de clave nuevo e imprime su dirección. |
| `new --force` | Reemplaza un archivo de clave existente. La clave anterior se pierde. |

**Qué deberías ver:** `new jar key`, la ruta del archivo de clave y una `address` que empieza por `qor1...`. La frase de recuperación nunca se imprime.

**Copia la dirección `qor1...`.** Si la pierdes, `./tipjar status` la imprime de nuevo. No compartas nunca el archivo de clave, no lo subas nunca a Git y no lo reutilices nunca en la mainnet. Para guardar la clave en otro lugar, define primero `TIPJAR_KEY`: `TIPJAR_KEY=/path/to/file ./tipjar status` (en PowerShell: `$env:TIPJAR_KEY="C:\path\file"`).

### 5. Consigue QOR de testnet en el faucet {#faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y pulsa el botón de solicitud.
3. Espera unos segundos y ejecuta:

```bash
./tipjar status
```

**Qué hace:** le pregunta a la testnet tu saldo y si tu clave poscuántica está registrada.

**Qué deberías ver:** `balance   100 QOR` (o la cantidad del faucet) y una línea que dice que la clave ML-DSA-87 aún no está registrada. Si el saldo es 0, espera 10 segundos y ejecútalo otra vez.

### 6. Registra tu clave poscuántica {#register}

```bash
./tipjar register
```

**Qué hace:** registra tu clave ML-DSA-87 en la cadena, una sola vez. Es seguro ejecutarlo de nuevo. Esta primera transacción se firma solo con la clave clásica, porque todavía no hay en la cadena ninguna clave poscuántica con la que firmar. Cuesta unos 0,09 QOR. Cada transacción posterior se firma de forma híbrida.

**Qué deberías ver:** un hash de transacción y un mensaje de que la clave está registrada. Ejecuta `./tipjar status` otra vez y ahora debería mostrar la clave como registrada.

**Cuánto tarda:** unos segundos (un bloque).

### 7. Crea una segunda dirección para recibir propinas {#jar}

Una propina necesita a alguien que la reciba. Crea una segunda cuenta desechable, el "bote" (jar), con su propio archivo de clave:

```bash
TIPJAR_KEY=~/.config/qday/jar.env ./tipjar new
```

**Qué hace:** la parte anterior a `./tipjar` define el archivo de clave solo para este comando (`TIPJAR_KEY`), así que la cuenta nueva no sobrescribe la primera. En PowerShell de Windows ejecuta antes `$env:TIPJAR_KEY="$HOME\.config\qday\jar.env"`, después `java -jar target/tipjar.jar new`, y restablécelo al final con `Remove-Item Env:TIPJAR_KEY`.

**Qué deberías ver:** una dirección `qor1...` nueva. Cópiala. Esta es tu **dirección del bote**. El bote no necesita ningún QOR para recibir propinas.

### 8. Envía una propina con firma híbrida {#tip}

```bash
./tipjar tip qor1...JAR_ADDRESS 1 "my first quantum-safe tip"
```

Sustituye `qor1...JAR_ADDRESS` por la dirección del bote del paso 7.

| Parte | Significado |
| --- | --- |
| `tip` | Envía una propina. |
| `qor1...JAR_ADDRESS` | Quién recibe la propina. |
| `1` | La cantidad en QOR (es decir, 1 QOR = 1.000.000 uqor). |
| `"my first quantum-safe tip"` | El memo, un texto corto adjunto a la transacción. Opcional. Mantén las comillas si tiene espacios. |

**Qué hace:** la app le pregunta a la cadena cuánto gas necesita la transacción (una ejecución de prueba), añade un 30 por ciento como margen de seguridad, firma con las dos claves, la envía, espera al bloque y después comprueba el propio registro de la cadena.

**Qué deberías ver:** el hash de la transacción, la altura del bloque y el resultado `QUANTUM-SAFE`. Si ves `CHECK FAILED`, consulta la Solución de problemas. Copia el hash.

**Cuánto tarda:** unos 10 segundos.

### 9. Vigila el bote, como lo haría el backend de una tienda {#watch}

Abre una **segunda terminal**, ve a la misma carpeta e inicia el vigilante:

```bash
cd build-before-qday/workshop-1/05-java-tipjar
./tipjar watch qor1...JAR_ADDRESS
```

Ahora vuelve a la primera terminal y envía una propina más (paso 8, con un memo nuevo).

**Qué hace:** `watch` le pregunta a la cadena cada 3 segundos por nuevas transferencias al bote y etiqueta cada una. `NO_COLOR=1 ./tipjar watch ...` desactiva los colores. Detenlo con Ctrl+C.

**Qué deberías ver:** cada propina listada con la etiqueta `QUANTUM-SAFE`. Una propina enviada sin una firma híbrida verificada mostraría `classical only`.

## Verifica la transacción tú mismo {#verify}

No tienes que fiarte de la app. Pregúntale directamente a la cadena.

**Forma 1, en el navegador.** Abre `https://explore.qore.network/tx/<HASH>` (pon tu hash en lugar de `<HASH>`) y cambia el explorador a **Testnet**. Deberías ver una transacción exitosa.

**Forma 2, un comando.** Pon tu hash en lugar de `<HASH>`:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parte | Significado |
| --- | --- |
| `curl` | Una herramienta que descarga una dirección web. Viene incluida en macOS, Windows 10+ y la mayoría de Linux. |
| `-s` | Silencioso: oculta la barra de progreso. |
| la dirección | La API REST pública de la testnet. Devuelve el registro completo de la transacción en JSON. |

**Qué deberías ver** en la salida larga (usa un visor de JSON o añade `| jq .` si instalaste jq):

- `"code": 0` significa que la transacción tuvo éxito.
- Una extensión `PQCHybridSignature` con un `pqc_signature` de **4.627 bytes** (esa es la firma ML-DSA-87).
- Un evento `pqc_hybrid_verify` con `status` igual a `verified` para tu dirección.

## Cómo funciona la prueba {#proof}

La app lee el mismo registro de `GET /cosmos/tx/v1beta1/txs/\{hash\}` y busca el evento `pqc_hybrid_verify` (`address=<signer>`, `status=verified`) y la extensión `/qorechain.pqc.v1.PQCHybridSignature` con una firma de 4.627 bytes. El vigilante hace lo mismo con cada transferencia entrante.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `./tipjar: Permission denied` | Una descarga nueva no está marcada como ejecutable. | Ejecuta `chmod +x tipjar`. |
| `build first: (cd ... && mvn -q package)` | Falta el archivo jar. | Ejecuta `mvn -q package` en esta carpeta (paso 2). |
| `mvn: command not found` o `java: command not found` | La herramienta no está instalada, o la terminal no se reabrió. | Instálala (consulta Antes de empezar), abre una terminal nueva y comprueba la versión. |
| Java dice versión 17 o inferior | Una versión antigua de Java va primero en tu ruta. | Instala Java 21, abre una terminal nueva y ejecuta `java -version` otra vez. |
| `no key file at ..., run new first` | Te saltaste el paso 4, o `TIPJAR_KEY` apunta a otro sitio. | Ejecuta `./tipjar new`. |
| `key file already exists` | Ya creaste una clave. | Consérvala, o reemplázala con `./tipjar new --force` (la clave anterior se pierde). |
| `account has no PQC key and classical fallback is disabled` | La clave poscuántica aún no está registrada. | Ejecuta primero `./tipjar register`. |
| `EVM authorisation window exhausted` | Este mensaje pertenece a las apps EVM (counter, guestbook). El Tip Jar no lo usa. | En las apps EVM, abre una ventana nueva con `pnpm window open`. |
| `HHE10402` tras abrir la ventana | Solo en las apps de Hardhat: la ventana aún no estaba activa. | En las apps de Hardhat, vuelve a ejecutar el despliegue. |
| El saldo es 0 o `not on chain yet` | Los tokens del faucet aún no han llegado. | Espera 10 segundos y ejecuta `./tipjar status`. Comprueba que pegaste la dirección correcta. |
| El faucet dice límite de solicitudes | Una solicitud cada 24 horas por cuenta. | Espera, o usa una segunda cuenta desechable. |
| `chain refused the tx` o `poll failed` | La testnet está ocupada o en actualización, o el endpoint público limita las solicitudes por dirección IP. | Espera un minuto y vuelve a ejecutar el comando. |
| `recipient must be a qor1... address` | La dirección es incorrecta o tiene espacios. | Copia de nuevo la dirección `qor1...` completa. |
| Errores de `CORS` en un navegador | Solo ocurren cuando una página web llama a la cadena directamente. Esta app no lo hace. | En una app de navegador, usa el proxy `/lcd` de la plantilla. |
| `pnpm: command not found` | pnpm no está instalado. Aquí no hace falta. | Solo para el tutorial de Hardhat: ejecuta `npm install -g pnpm`. |

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

La cuenta es una cuenta clásica de QoreChain con coin 118 (`m/44'/118'/0'/0/0`). La clave ML-DSA-87 se deriva de la misma frase de recuperación y se liga a la dirección con `Authenticator.derivePqcCanonical`. Si creas tu propia app con las ayudas basadas en semilla, el SDK 0.13.0 necesita un código de recuperación o un secreto PQC independiente de 32 bytes; consulta [Instalación del SDK](/sdk/install#whats-new-0130). No imprimas nunca un código de recuperación.

## Paquetes usados {#packages}

| Elemento | Versión |
| --- | --- |
| `io.github.qorechain:qorechain-sdk` (Maven Central) | 0.13.0 |
| `com.fasterxml.jackson.core:jackson-databind` | 2.17.2 |
| `org.codehaus.mojo:exec-maven-plugin` | 3.5.0 |
| `org.apache.maven.plugins:maven-shade-plugin` | 3.6.0 |
| Java (`maven.compiler.release`) | 21 |
| App `demo:tipjar` | 1.0.0 |

Consulta [Instalación del SDK](/sdk/install) para ver la tabla de versiones de todos los lenguajes.

## Dónde consultar cada cosa {#access}

| Qué | Dónde |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Código | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/05-java-tipjar |
