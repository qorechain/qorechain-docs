---
slug: /build-before-qday/workshop-1
title: "Taller 1: Tu primera transacción con firma híbrida"
sidebar_label: "Taller 1"
sidebar_position: 2
date: 2026-11-12
---

# Taller 1: Tu primera transacción con firma híbrida

Esta guía te lleva desde un ordenador sin nada instalado hasta una transacción firmada con dos claves a la vez y verificada por la testnet de QoreChain. No necesitas ser desarrollador. Cada comando se explica con palabras sencillas, y cada paso termina con lo que deberías ver en la pantalla.

**Cuánto tarda:** unos 30 minutos la primera vez, incluida la instalación de las herramientas. Unos 10 minutos si ya las tienes instaladas.

## Qué construimos {#what-we-built}

Un proyecto completo de Solidity (un pequeño contrato inteligente) creado con un solo comando, probado, desplegado en la testnet de QoreChain y, después, una transacción firmada con **dos claves a la vez** y comprobada por la cadena.

Qué demuestra:

- **Firma híbrida.** La transacción lleva una firma clásica secp256k1 y una firma poscuántica ML-DSA-87 (NIST FIPS 204). Las dos deben ser válidas.
- **Una transacción con firma híbrida verificada en la cadena.** Los validadores verifican ambas firmas. Lees la prueba en el endpoint REST público (la extensión `PQCHybridSignature` y el evento `pqc_hybrid_verify`) y en el explorador.
- **La ventana de autorización EVM.** Una transacción de Ethereum no puede llevar una firma poscuántica. Por eso, en QoreChain registras tu clave ML-DSA-87 una sola vez y abres una ventana corta, con un mensaje de firma híbrida, durante la cual se admiten tus transacciones EVM normales. Consulta [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes) para ver la idea en detalle.

Esto es exactamente lo que pide el nivel Quantum Pass.

## Palabras usadas en esta guía {#words}

| Palabra | Significado sencillo |
| --- | --- |
| Terminal | La ventana donde escribes comandos. Terminal en macOS y Linux, PowerShell en Windows |
| Testnet | Una copia de práctica de QoreChain. Sus monedas no tienen valor |
| QOR y uqor | QOR es la moneda. uqor es su unidad más pequeña. 1 QOR = 1.000.000 uqor |
| Transacción | Una instrucción firmada que se envía a la cadena |
| Memo | Un texto breve adjunto a una transacción |
| Clave privada | Un secreto que firma por tu cuenta. Quien la tenga controla la cuenta |
| Código de recuperación | Un segundo secreto (empieza por `QRC1`) a partir del cual se crea tu clave poscuántica |
| Hash | El identificador único de una transacción. Sirve para buscarla |
| Gas y comisión | El pequeño precio, pagado en QOR, para que la cadena procese una transacción |

:::caution Solo una cuenta de testnet desechable
Usa una clave creada para este ejercicio, con QOR de prueba únicamente. Nunca uses una wallet real ni fondos reales. Nunca pongas en el archivo `.env` la clave ni el código de recuperación de una cuenta que tenga dinero real, y nunca compartas ni subas `.env` a git.
:::

## Antes de empezar {#prerequisites}

Necesitas un ordenador con macOS, Windows o Linux, una terminal y un navegador web. Para este tutorial instalas dos herramientas: **Node.js 22 o posterior** (Hardhat 3, la herramienta de proyectos que se usa aquí, necesita la versión 22) y **pnpm** (la herramienta que descarga las librerías del proyecto). Una herramienta opcional, **jq**, solo hace más legible la salida de una verificación.

Abre primero una terminal. En macOS abre **Terminal**. En Windows abre **PowerShell**. En Linux abre tu aplicación de terminal.

### Node.js 22 o posterior {#install-node}

1. Comprueba si ya lo tienes:

```bash
node -v
```

Debe mostrar `v22` o un número mayor. Si muestra `command not found` o una versión anterior, instala Node.js como se indica abajo.

2. Instálalo para tu sistema:

| Sistema | Cómo instalarlo |
| --- | --- |
| macOS | Descarga el instalador de [nodejs.org/en/download](https://nodejs.org/en/download), o ejecuta `brew install node@22` si usas Homebrew |
| Windows | Ejecuta `winget install OpenJS.NodeJS.LTS` en PowerShell, o descarga el instalador de [nodejs.org/en/download](https://nodejs.org/en/download) |
| Linux | Ejecuta `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, cierra y vuelve a abrir la terminal, y luego ejecuta `nvm install 22` |

3. Cierra la terminal, abre una nueva y ejecuta `node -v` otra vez.

**Qué deberías ver:** un número que empieza por `v22` o superior, por ejemplo `v22.12.0`.

### pnpm {#install-pnpm}

1. Comprueba si ya lo tienes:

```bash
pnpm -v
```

2. Si muestra `command not found` (o `pnpm: command not found`), instálalo:

```bash
npm install -g pnpm
```

| Parte | Significado |
| --- | --- |
| `npm` | La herramienta de paquetes que viene con Node.js |
| `install` | Descargar e instalar un programa |
| `-g` | Global: instalarlo para todo tu ordenador, no para una sola carpeta |
| `pnpm` | El programa que se instala |

Node.js instalado con Homebrew no incluye pnpm. Por eso `pnpm: command not found` es habitual en macOS: el comando anterior lo soluciona. En Linux o macOS, si ves un error de permisos, ejecuta `corepack enable` en su lugar y luego `pnpm -v` otra vez.

3. Vuelve a comprobarlo con `pnpm -v`.

**Qué deberías ver:** un número de versión, por ejemplo `9.12.0` o superior.

### jq (opcional) {#install-jq}

`jq` convierte una respuesta larga en una forma corta y legible. Se usa una sola vez, en el paso 8.

| Sistema | Instalación | Comprobación |
| --- | --- | --- |
| macOS | `brew install jq` | `jq --version` |
| Windows | `winget install jqlang.jq` | `jq --version` |
| Linux | `sudo apt install jq` (Debian y Ubuntu) | `jq --version` |

`curl`, que se usa en el paso 8, ya viene en macOS, Linux y Windows 10 o posterior. En Windows PowerShell escribe `curl.exe` en lugar de `curl`.

## Tu wallet de testnet y el faucet {#wallet}

El proyecto crea su propia cuenta desechable en el paso 3, así que no necesitas una wallet para terminar esta guía. Sí necesitas QOR de testnet en esa cuenta, y también puedes configurar la wallet QoreX en testnet para usarla con las aplicaciones de ejemplo.

**QoreX en testnet (opcional aquí, necesaria para las aplicaciones de ejemplo en el navegador):**

1. En la **app QoreX**: abre **Ajustes** y activa **Use testnet (developers)**.
2. En la **extensión de navegador QoreX**: desbloquéala, toca 7 veces el número de versión en la parte inferior y elige **Switch to testnet (diana)**.
3. Para cualquier cosa del lado de Ethereum (EVM), elige también **Add an Ethereum account (coin 60)**. Esto te da una cuenta con una dirección `0x...` que funciona con las herramientas de Ethereum.

**El faucet** es una máquina gratuita que reparte QOR de testnet. Lo usas en el paso 4:

- Dirección: [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet). Primero inicias sesión.
- Cantidad: 100 QOR, una vez cada 24 horas por cuenta.
- La primera transacción de una cuenta nueva registra su clave poscuántica ML-DSA-87. Esto cuesta una comisión única de unos 0,09 QOR, así que 100 QOR sobran.

Los datos de red usados en esta guía:

| Servicio | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (requiere iniciar sesión) |

## Pasos {#steps}

### Paso 1: Comprueba tus herramientas {#step-1}

**Cuánto tarda:** 1 minuto.

```bash
node -v
```

| Parte | Significado |
| --- | --- |
| `node` | El programa Node.js |
| `-v` | Mostrar su versión y terminar |

```bash
pnpm -v
```

| Parte | Significado |
| --- | --- |
| `pnpm` | La herramienta de paquetes |
| `-v` | Mostrar su versión y terminar |

**Qué deberías ver:** `v22` o superior para Node.js, y un número de versión para pnpm. Si no, vuelve a "Antes de empezar".

### Paso 2: Crea el proyecto y ejecuta las pruebas {#step-2}

**Cuánto tarda:** alrededor de 1 minuto. Necesita acceso a internet.

1. Crea el proyecto en una carpeta nueva. En tu terminal, ve a una carpeta donde guardes proyectos (por ejemplo, tu carpeta Documentos) y ejecuta:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

Qué hace: descarga el creador de proyectos de QoreChain y construye un proyecto ya preparado llamado `qday-demo` en una carpeta nueva.

Parámetros:

- `npx`: ejecuta un programa desde internet sin instalarlo de forma permanente.
- `create-qorechain-dapp@latest`: el creador de proyectos de QoreChain. `@latest` significa usar la versión más reciente (esta guía se comprobó con la 0.14.0).
- `qday-demo`: el nombre de la carpeta y del proyecto nuevos. Puedes elegir otro nombre.
- `-t hardhat`: `-t` significa plantilla. Elige la plantilla de Hardhat: un proyecto de contrato Solidity con pruebas.
- `--network testnet`: con qué red de QoreChain habla el proyecto. `testnet` es la red de práctica.
- `--package-manager pnpm`: qué herramienta instala las librerías que necesita el proyecto.

**Qué deberías ver:** una lista de paquetes instalados y luego `Done! Created qday-demo`. Si te pide instalar `create-qorechain-dapp`, responde `y`.

2. Entra en la carpeta del proyecto:

```bash
cd qday-demo
```

Qué hace: mueve tu terminal a la carpeta nueva. Todos los comandos siguientes se ejecutan desde aquí.

Parámetros:

- `cd`: cambiar de directorio.
- `qday-demo`: la carpeta a la que entrar.

3. Ejecuta las pruebas:

```bash
pnpm test
```

Qué hace: compila el contrato y comprueba que funciona, en una pequeña cadena simulada dentro de tu ordenador. No envía nada a la testnet real.

Parámetros:

- `pnpm`: la herramienta de paquetes.
- `test`: el nombre del script que se ejecuta (aparece en `package.json`; ejecuta `hardhat test`).

**Qué deberías ver:**

```text
  Counter
    ✔ starts at the constructor value
    ✔ increments and emits CountChanged

2 passing (2 nodejs)
```

4. Echa un vistazo a lo que has obtenido (opcional):

| Archivo | Qué es |
| --- | --- |
| `contracts/Counter.sol` | El contrato inteligente: guarda un número y puede sumarle 1 |
| `ignition/modules/Counter.ts` | La receta que despliega el contrato |
| `scripts/window.ts` | El auxiliar detrás de `pnpm window`: registra tu clave y abre la ventana de autorización |
| `hardhat.config.ts` | Ajustes, incluida la red `qorechainTestnet` (chain ID 9800) |
| `.env` | Tu archivo de ajustes secretos. Lo rellenas en el paso 3. No lo compartas nunca |

Más sobre las plantillas: [Generadores y CLI](/developer-tools/scaffolders-and-cli) y [Kit de desarrollo de la cadena](/developer-tools/chain-dev-sdk).

### Paso 3: Crea una cuenta de testnet desechable {#step-3}

**Cuánto tarda:** 3 minutos.

La cuenta necesita dos secretos: una **clave privada** de estilo Ethereum y un **código de recuperación** (empieza por `QRC1`) a partir del cual se crea la clave poscuántica ML-DSA-87. Ambos van en el archivo `.env` de la carpeta de tu proyecto. El archivo es privado en tu ordenador.

1. Crea una clave privada nueva. Primero crea un archivo pequeño llamado `make-key.mjs` dentro de la carpeta `qday-demo`, con este contenido (usa cualquier editor de texto, como el Bloc de notas, TextEdit en modo de texto plano o nano):

```js
import { generatePrivateKey } from "viem/accounts";
import { readFileSync, writeFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
writeFileSync(".env", env.replace(/^PRIVATE_KEY=.*$/m, `PRIVATE_KEY=${generatePrivateKey()}`));
console.log("New private key saved in .env");
```

Qué hace este archivo: crea una clave privada aleatoria y la escribe en tu archivo `.env`, de modo que nunca se muestra en pantalla ni se copia a mano.

2. Ejecútalo:

```bash
node make-key.mjs
```

Qué hace: ejecuta el archivo pequeño con Node.js.

Parámetros:

- `node`: el programa Node.js.
- `make-key.mjs`: el archivo que se ejecuta.

**Qué deberías ver:** `New private key saved in .env`. Ejecútalo solo una vez: una segunda ejecución crea otra cuenta distinta.

3. Crea un código de recuperación:

```bash
pnpm window recovery-code
```

Qué hace: crea un código de recuperación nuevo y lo muestra.

Parámetros:

- `pnpm window`: ejecuta el auxiliar de ventana del proyecto (`scripts/window.ts`).
- `recovery-code`: la acción: mostrar un código de recuperación nuevo.

**Qué deberías ver:** una línea larga que empieza por `QRC1`, y después una nota sobre cómo guardarlo. Copia la línea completa `QRC1...`.

4. Pon el código en `.env`. Abre el archivo en un editor:

| Sistema | Comando |
| --- | --- |
| macOS | `open -e .env` |
| Windows | `notepad .env` |
| Linux | `nano .env` |

Busca la línea `QORE_PQC_RECOVERY_CODE=` y pega el código justo después del signo igual, sin espacios y sin comillas. Guarda el archivo. El resultado se ve así (se muestran marcadores de posición, los tuyos son reales):

```text
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1...
QORE_NETWORK=testnet
```

Qué significa cada línea:

- `PRIVATE_KEY`: el secreto que firma la mitad clásica (secp256k1) de tu cuenta.
- `QORE_PQC_RECOVERY_CODE`: el secreto que crea la mitad poscuántica (ML-DSA-87).
- `QORE_NETWORK`: con qué red habla el auxiliar. `testnet` es la red de práctica.

Deja `.env` exactamente como está. La misma clave y el mismo código dan la misma cuenta cada vez. Si pierdes el archivo, empieza de nuevo con una cuenta nueva. No lo compartas nunca y no lo subas nunca a git.

¿Prefieres un mnemónico (doce palabras)? En lugar de la clave y el código, pon `QORE_MNEMONIC="your twelve words"` en `.env`. Ambas claves salen de la misma frase y no hace falta código de recuperación. Usa una frase creada solo para este ejercicio.

5. Pide al proyecto la dirección de tu cuenta nueva:

```bash
pnpm window status
```

Qué hace: lee la cadena pública y muestra tu cuenta, tu clave poscuántica y tu ventana. No cambia nada.

Parámetros:

- `pnpm window`: ejecuta el auxiliar de ventana.
- `status`: la acción: mostrar el estado actual.

**Qué deberías ver:** tres líneas (las tuyas muestran direcciones reales):

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copia la dirección `qor1...`. Es la que le das al faucet. Ambas direcciones pertenecen a la misma cuenta: `0x...` es la forma de Ethereum y `qor1...` es la forma de QoreChain.

### Paso 4: Consigue QOR de testnet en el faucet {#step-4}

**Cuánto tarda:** 2 minutos.

1. Abre el [faucet](https://dashboard.qorechain.io/faucet) en tu navegador e inicia sesión.
2. Asegúrate de que el panel está en **Testnet**.
3. Pega tu dirección `qor1...`.
4. Selecciona **Request Tokens**.

**Qué deberías ver:** una tarjeta que dice **Tokens Sent!** con 100 QOR (más algunos tokens de prueba del festival) y un enlace **View on Explorer**.

El faucet paga una vez cada 24 horas por cuenta. Las cantidades exactas están en [Faucet](/dashboard/faucet). Ahora comprueba desde tu terminal:

```bash
pnpm window status
```

**Qué deberías ver:** las mismas tres líneas que antes. Tu cuenta ya existe en la cadena y puede pagar comisiones. Sigue diciendo que la clave no está registrada. Eso viene ahora.

### Paso 5: Registra tu clave y abre la ventana {#step-5}

**Cuánto tarda:** unos 2 minutos.

1. Registra tu clave ML-DSA-87. Es un paso único por cuenta:

```bash
pnpm window register
```

Qué hace: envía una transacción que le dice a la cadena qué clave poscuántica pertenece a tu cuenta. Cuesta una comisión única de unos 0,09 QOR. La cadena acepta este mensaje firmado solo con la clave clásica, porque todavía no hay ninguna clave poscuántica registrada.

Parámetros:

- `pnpm window`: ejecuta el auxiliar de ventana.
- `register`: la acción: registrar la clave.

**Qué deberías ver:** `registered: <HASH>`. Si dice `The account already has a PQC key; nothing to do.`, no pasa nada: sigue adelante.

2. Abre la ventana de autorización:

```bash
pnpm window open
```

Qué hace: envía una transacción con **firma híbrida** (ambas claves) que abre una ventana corta durante la cual se admiten tus transacciones normales de estilo Ethereum, como el despliegue de un contrato.

Parámetros:

- `pnpm window`: ejecuta el auxiliar de ventana.
- `open`: la acción: abrir una ventana. Por defecto dura 600 bloques y permite 5 transacciones. Puedes cambiarlo con `QORE_WINDOW_BLOCKS` y `QORE_WINDOW_TXS` en `.env`.

**Qué deberías ver:** `opened: <HASH>`, y luego una línea como `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Ese último número es el límite de gasto de la ventana en uqor (3,75 QOR). Anota el hash de `opened:`: lo verificas en el paso 8.

3. Espera unos 10 segundos. Al abrir la ventana avanzó el contador de la cuenta (el nonce), y Hardhat espera a que la cadena se asiente.

### Paso 6: Compila el contrato {#step-6}

**Cuánto tarda:** unos segundos.

```bash
pnpm build
```

Qué hace: convierte el contrato Solidity en la forma que ejecuta la cadena.

Parámetros:

- `pnpm`: la herramienta de paquetes.
- `build`: el script que se ejecuta (ejecuta `hardhat build`).

**Qué deberías ver:** `Compiled 1 Solidity file` o `No contracts to compile`. Ambos están bien: la prueba del paso 2 ya lo compiló.

### Paso 7: Despliega el contrato en la testnet {#step-7}

**Cuánto tarda:** unos 30 segundos.

```bash
pnpm deploy:testnet
```

Qué hace: envía el contrato a la testnet de QoreChain con Hardhat Ignition, usando la ventana que abriste. Es una transacción EVM normal.

Parámetros:

- `pnpm`: la herramienta de paquetes.
- `deploy:testnet`: el script que se ejecuta. Ejecuta `hardhat ignition deploy ignition/modules/Counter.ts --network qorechainTestnet`: desplegar la receta `Counter.ts` en la red llamada `qorechainTestnet` (chain ID 9800).

Cuando Hardhat pregunte `Confirm deploy to network qorechainTestnet (9800)?`, escribe `y` y pulsa Intro.

**Qué deberías ver:** `[ CounterModule ] successfully deployed` y una línea `CounterModule#Counter - 0x...`. El `0x...` es la dirección de tu contrato. Si ves `HHE10402`, ejecuta el mismo comando otra vez (consulta Solución de problemas).

### Paso 8: Verifica la firma híbrida en la cadena {#step-6-verify}

**Cuánto tarda:** 3 minutos.

La transacción `opened:` del paso 5 se firmó con ambas claves. Cualquiera puede comprobarlo desde el endpoint REST público.

1. Sustituye `<HASH>` por ese hash (sin los signos `<` y `>`) y ejecuta:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Qué hace: pide al servidor público de la testnet el registro completo de tu transacción.

Parámetros:

- `curl`: un programa que obtiene una dirección web.
- `-s`: silencioso, oculta la barra de progreso y muestra solo la respuesta.
- `https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>`: la dirección REST de la testnet, seguida del hash de tu transacción.

**Qué deberías ver:** un bloque largo de texto. Busca tres cosas:

1. `"code": 0` dentro de `tx_response`. El código 0 significa éxito.
2. La extensión `PQCHybridSignature`, que contiene la firma ML-DSA-87: **4.627 bytes**, junto a la firma secp256k1 de 64 bytes.
3. En `events`, un evento de tipo `pqc_hybrid_verify` con el atributo `status` igual a `verified`.

2. Para mostrar solo ese evento (necesita `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Qué hace: obtiene el mismo registro y lo pasa por `jq`, que conserva solo el evento de verificación.

Parámetros:

- `|`: envía la salida del primer comando al segundo.
- `jq`: el programa de filtrado.
- `'.tx_response.events[] | select(.type=="pqc_hybrid_verify")'`: recorre la lista de eventos y conserva los que tienen el tipo `pqc_hybrid_verify`.

**Qué deberías ver:** un pequeño bloque de texto con `"status"` igual a `"verified"`.

3. Míralo en el explorador:
   1. Abre [explore.qore.network](https://explore.qore.network).
   2. Cambia el selector de red a **Testnet**.
   3. Busca el hash.

**Qué deberías ver:** la página de la transacción muestra la seguridad de la firma como resistente a la computación cuántica, verificada en la cadena, con el algoritmo ML-DSA-87 (FIPS 204).

Esa es la prueba: los validadores comprobaron ambas firmas. Esta es tu transacción de Quantum Pass.

## Qué deberías ver, de un vistazo {#what-you-should-see}

| Dónde | Qué |
| --- | --- |
| Después del paso 2 | `Done! Created qday-demo` y `2 passing` |
| Después del paso 3 | Una dirección `qor1...` y una dirección `0x...` de `pnpm window status`, con la clave sin registrar |
| Después del paso 4 | **Tokens Sent!** en el faucet |
| Después del paso 5 | `registered: <HASH>`, luego `opened: <HASH>` y la línea de la ventana |
| Después del paso 7 | `CounterModule#Counter - 0x...` |
| Después del paso 8 | `code` 0, una firma ML-DSA-87 de 4.627 bytes y `pqc_hybrid_verify` con `status` `verified`, en la salida REST y en el explorador en Testnet |

## Paquetes usados {#published}

Declarados en el `package.json` generado:

| Paquete | Registro | Versión |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

El generador también instala el toolbox de Hardhat y los plugins Ignition y keystore que aparecen en el `package.json` generado.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `HHE10402` o "wait for confirmations" justo después de abrir la ventana | Al abrir la ventana avanzó el nonce de la cuenta | Ejecuta `pnpm deploy:testnet` otra vez |
| "EVM authorisation window exhausted" o "no window" | La ventana se quedó sin transacciones o bloques, o está limitada a otro contrato (una ventana limitada a otro contrato bloquea un despliegue) | Ejecuta `pnpm window open` para abrir una ventana nueva, espera unos 10 segundos y vuelve a desplegar |
| "account has no PQC key and classical fallback is disabled" | La cuenta no ha registrado una clave ML-DSA-87 | Ejecuta primero `pnpm window register` y luego `pnpm window open` |
| "does not exist on chain yet" | La cuenta aún no tiene QOR | Consigue QOR en el faucet (paso 4) |
| "Rate Limit Reached" en el faucet, o sin tokens tras 30 segundos | Una solicitud cada 24 horas por cuenta y por dirección, y las solicitudes se atienden de una en una | Espera unos segundos y reintenta, o espera a que pasen las 24 horas. Solo una solicitud cada 24 horas |
| `pnpm: command not found` | pnpm no está instalado. Node.js instalado con Homebrew no lo incluye | Ejecuta `npm install -g pnpm` y abre una terminal nueva |
| `pnpm window` se detiene con un mensaje sobre un código de recuperación que falta | `.env` tiene `PRIVATE_KEY` sin `QORE_PQC_RECOVERY_CODE` | Ejecuta `pnpm window recovery-code` y pega el código en `.env` (paso 3), o usa `QORE_MNEMONIC` |
| "QORE_PQC_RECOVERY_CODE is not a valid QRC1 recovery code" | Un error de escritura, un espacio o unas comillas al pegar | Pega el código otra vez sin espacios ni comillas |
| "registered, but NOT this key" en `pnpm window status` | Antes se usó otro código de recuperación para esta cuenta | Vuelve a poner en `.env` el código de recuperación original, o empieza de nuevo con una cuenta nueva |
| Errores CORS en una aplicación de navegador | Un navegador bloquea las llamadas a una dirección de la cadena que no admite tu página | Usa la ruta de proxy `/lcd` de la plantilla para las llamadas REST desde el navegador, en lugar de llamar directamente a la dirección de la cadena |
| Hardhat se niega a arrancar | Node.js es anterior a la versión 22 | Instala Node.js 22 o posterior (consulta "Antes de empezar") y ejecuta `pnpm install` otra vez |
| `curl` muestra `tx not found` justo después del paso | El bloque aún no es definitivo | Espera 10 segundos y ejecuta el comando otra vez |
| `curl` no funciona en Windows PowerShell | Allí `curl` es un comando distinto | Escribe `curl.exe` en lugar de `curl` |

## Las aplicaciones de ejemplo {#example-apps}

El mismo flujo, desde varios lenguajes y interfaces. Todas firman de forma híbrida. Todas están en el repositorio público [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), carpeta `workshop-1`. Para obtenerlas necesitas Git (compruébalo con `git --version`; instálalo desde [git-scm.com](https://git-scm.com/downloads)) y luego ejecuta:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Qué hace: descarga una copia de todas las aplicaciones de ejemplo y entra en la carpeta `workshop-1`.

Parámetros:

- `git clone <dirección>`: copia un proyecto de internet a tu ordenador.
- `cd build-before-qday/workshop-1`: entra en la carpeta que contiene las seis aplicaciones.

Cada página de aplicación es una guía completa de principio a fin, con lo que hay que instalar y lo que cabe esperar.

| Aplicación | Lenguaje | Página |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Los kits que hay detrás de estas aplicaciones están en [Kits](/build-before-qday/workshop-1/kits). Para usar la wallet QoreX con una dApp de navegador, consulta [QoreX](/qorex/overview).
