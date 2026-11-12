---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

El Q-Day Counter es el proyecto EVM de QoreChain más pequeño que sirve de algo. Es un contrato Solidity que guarda un número, un proyecto de Hardhat que lo pone en la testnet `qorechain-diana` y un script corto que lee el número y le suma uno.

Esta guía está escrita para principiantes. No necesitas saber Solidity ni herramientas de blockchain. Cada comando se explica, y cada paso termina con lo que deberías ver.

**Cuánto tarda:** unos 25 minutos la primera vez, casi todo instalando herramientas y esperando al faucet.

## Qué demuestra {#shows}

- **La firma híbrida forma parte del camino de despliegue.** Antes de cualquier transacción EVM, incluido el despliegue de un contrato, la cuenta necesita una clave poscuántica registrada (ML-DSA-87) y una ventana de autorización EVM activa. La ventana se abre con una transacción firmada dos veces, con la clave clásica (secp256k1) y con la clave poscuántica. Eso es una firma híbrida. La cadena comprueba ambas.
- **Una transacción con firma híbrida que puedes verificar.** El paso `pnpm window open` envía esa transacción. Puedes buscarla en el explorador y ver el veredicto de la propia cadena.
- **Tus herramientas EVM habituales siguen funcionando.** Hardhat y viem envían transacciones ordinarias de Ethereum. La protección poscuántica está en la ventana, así que una clave secp256k1 robada, por sí sola, no puede gastar de la cuenta.

Un ordenador cuántico lo bastante grande para romper secp256k1 podría falsificar firmas clásicas. QoreChain exige una segunda firma (ML-DSA-87, estándar FIPS 204) que un ordenador así no puede falsificar. El Counter muestra todo el ciclo del desarrollador con esa regla activada: registrar la clave, abrir una ventana, desplegar, llamar, leer.

## Antes de empezar {#prerequisites}

Esta guía usa una cuenta de testnet desechable. Nunca uses una wallet real ni fondos reales. El QOR de testnet no tiene valor.

Necesitas una terminal. En macOS abre **Terminal**. En Windows abre **PowerShell** (o **Git Bash**, que viene con Git). En Linux abre cualquier terminal. Luego instala estas tres herramientas. Si el comando de comprobación ya muestra una versión adecuada, sáltate la instalación.

### Node.js 22 o posterior

Node.js ejecuta JavaScript en tu ordenador. Hardhat 3 necesita Node.js 22 o posterior.

| Sistema | Instalación | Comprobación |
| --- | --- | --- |
| macOS | `brew install node` (necesita [Homebrew](https://brew.sh)), o descarga desde https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, o descarga desde https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, abre una terminal nueva y luego `nvm install 22` | `node --version` |

Qué deberías ver: un número que empieza por `v22` o superior, como `v22.12.0`. En Windows, cierra y vuelve a abrir PowerShell después de instalar.

### pnpm

pnpm descarga las librerías que necesita un proyecto. No viene con la instalación de Node.js, así que lo añades tú, en todos los sistemas.

```sh
npm install -g pnpm
```

| Parte | Significado |
| --- | --- |
| `npm` | La herramienta que viene con Node.js. Instala otras herramientas. |
| `install` | Descargar e instalar. |
| `-g` | Global: instalar para todo el ordenador, no solo para una carpeta. |
| `pnpm` | La herramienta que se instala. |

Compruébalo con `pnpm --version`. Deberías ver un número como `9.12.0` (9 o superior). Si alguna vez ves `pnpm: command not found`, te saltaste este paso: ejecuta el comando de instalación de arriba y abre una terminal nueva.

Si Linux o macOS dice `EACCES: permission denied`, ejecuta `sudo npm install -g pnpm` en su lugar.

### Git

Git descarga el proyecto desde GitHub.

| Sistema | Instalación | Comprobación |
| --- | --- | --- |
| macOS | `xcode-select --install` o `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, o descarga desde https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) o `sudo dnf install git` (Fedora) | `git --version` |

Qué deberías ver: `git version 2.` y un número.

## Una wallet de testnet {#wallet}

Necesitas una cuenta de testnet con un poco de QOR. Esta guía te crea una en los pasos siguientes (un archivo de claves). No necesitas QoreX para el Counter. Si más adelante quieres ver la misma cuenta en una wallet, usa [QoreX](/qorex/overview) en testnet:

- **App QoreX:** Ajustes y luego **Use testnet (developers)**.
- **Extensión de navegador QoreX:** desbloquéala, toca 7 veces el número de versión en la parte inferior y elige **Switch to testnet (diana)**.
- Para el carril EVM, elige **Add an Ethereum account (coin 60)**.

El faucet da QOR de testnet gratis: https://dashboard.qorechain.io/faucet. Inicias sesión, pegas una dirección y lo solicitas. Recibes 100 QOR cada 24 horas por cuenta.

**Sobre las cantidades.** QOR es la moneda. `uqor` es su pieza más pequeña: 1 QOR = 1.000.000 uqor. Las comisiones de la cadena se muestran en `uqor`. La primera transacción de una cuenta nueva registra su clave poscuántica, lo que cuesta una comisión única de unos 0,09 QOR.

## Paso a paso {#steps}

### 1. Obtén el código {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

**Qué hace**

- `git clone <dirección>` descarga una copia del proyecto desde GitHub en una carpeta nueva llamada `build-before-qday`.
- `cd <carpeta>` mueve tu terminal a la carpeta del proyecto Counter. Todos los comandos siguientes se ejecutan desde aquí.

**Qué deberías ver:** `Cloning into 'build-before-qday'...` y después tu prompt en la carpeta nueva. **Cuánto tarda:** unos segundos.

Opcional: si prefieres construir el proyecto desde cero, como en el taller en vivo, consulta [Construye el mismo proyecto desde cero](#scaffold) al final de los pasos.

### 2. Instala las librerías {#step-install}

```sh
pnpm install
```

**Qué hace**

- `pnpm install` lee la lista de librerías de `package.json` y las descarga en una carpeta `node_modules` (Hardhat, el SDK de QoreChain y más).

**Qué deberías ver:** una lista de paquetes con signos `+` y `Done in` unos segundos. **Cuánto tarda:** menos de un minuto.

### 3. Ejecuta las pruebas y la compilación {#step-test}

```sh
pnpm test
```

**Qué hace**

- `pnpm test` ejecuta las comprobaciones del proyecto en una cadena falsa dentro de tu ordenador. No necesita clave, ni red, ni QOR. La primera ejecución también descarga el compilador de Solidity, así que necesita internet.

**Qué deberías ver:** `Counter`, dos líneas con una marca de verificación (`starts at the constructor value`, `increments and emits CountChanged`) y `2 passing`.

```sh
pnpm build
```

**Qué hace**

- `pnpm build` convierte el contrato Solidity en código máquina (lo compila). Después de `pnpm test` muestra `No contracts to compile`, lo cual está bien: la prueba ya lo compiló.

### 4. Crea el archivo de ajustes {#step-account}

El proyecto lee tus secretos de un archivo llamado `.env`. Créalo a partir de la plantilla.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Qué hace**

- `cp` (o `copy`) copia el archivo de plantilla `.env.example` a un archivo nuevo `.env`.

El archivo `.env` es tu **archivo de claves**. Vive solo en la carpeta de este proyecto. Contiene una clave desechable. **No lo compartas nunca, no lo subas nunca a Git y no reutilices nunca estas claves para una wallet real.** El proyecto ya ignora `.env` en Git. Ábrelo en cualquier editor de texto (`open -e .env` en macOS, `notepad .env` en Windows, `nano .env` en Linux). Vas a rellenar dos valores.

**a. Una clave privada desechable.** Genera una aleatoria:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Qué hace**

- `node -e "..."` ejecuta una línea de JavaScript.
- La línea crea 32 bytes aleatorios y los muestra en hexadecimal con `0x` delante. Eso es una clave privada.

**Qué deberías ver:** una línea, `0x` seguido de 64 letras y dígitos. Cópiala en `.env` como `PRIVATE_KEY=0x...`, sustituyendo el marcador de posición lleno de ceros.

**b. Un código de recuperación poscuántico.** La clave ML-DSA-87 de la cuenta se crea a partir de un segundo secreto, el código de recuperación.

```sh
pnpm window recovery-code
```

**Qué hace**

- `pnpm window` ejecuta el script auxiliar `scripts/window.ts`. La palabra que sigue es el comando.
- `recovery-code` muestra un código de recuperación aleatorio nuevo.

**Qué deberías ver:** una línea que empieza por `QRC1-`, y después un breve recordatorio. Copia la línea `QRC1-...` en `.env` como `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conserva el mismo código para esta cuenta: un código nuevo da a la cuenta una clave poscuántica distinta.

Deja `QORE_MNEMONIC` vacío. (Un mnemónico es una frase de 12 o 24 palabras que puede sustituir a los dos valores anteriores. Usa uno u otro, no ambos.) Mantén `QORE_NETWORK=testnet`, que le dice al auxiliar que hable con la red de prueba. Tu `.env` se ve así, con marcadores de posición:

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Guarda el archivo.

### 5. Muestra la dirección de tu cuenta {#step-address}

```sh
pnpm window status
```

**Qué hace**

- `status` muestra tu cuenta, si su clave poscuántica está registrada y si tienes una ventana EVM.

**Qué deberías ver:** tres líneas. La primera es `account:  0x...  (qor1...)`. Tu cuenta tiene dos direcciones: `0x...` para la EVM y `qor1...` para el carril nativo. Pertenecen a la misma cuenta. Las otras dos líneas dicen `PQC key:  not registered` y `window:   none`. Es normal: la cuenta es nueva. Copia la dirección `qor1...` de la primera línea.

### 6. Consigue QOR de testnet en el faucet {#step-faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Asegúrate de que la página está en **Testnet**.
3. Pega tu dirección `qor1...` y solicita el QOR. Recibes 100 QOR una vez cada 24 horas por cuenta.
4. Espera unos 10 segundos y ejecuta `pnpm window status` otra vez.

**Qué deberías ver:** las mismas tres líneas que antes: la clave sigue como `not registered` y no hay ventana. La cuenta ya tiene QOR. Si quieres una prueba, abre https://explore.qore.network (Testnet) y busca tu dirección `qor1...`.

### 7. Registra la clave y abre la ventana {#step-window}

```sh
pnpm window register
```

**Qué hace**

- `register` envía a la cadena la clave pública ML-DSA-87 de la cuenta. Lo haces una vez por cuenta. Es el único mensaje que la cadena acepta sin firma poscuántica, porque todavía no hay una clave en la cadena con la que comprobarla. Cuesta unos 0,09 QOR.

**Qué deberías ver:** `registered: ` seguido de un hash de transacción (64 caracteres).

```sh
pnpm window open
```

**Qué hace**

- `open` envía una transacción, firmada con ambas claves (híbrida), que abre una ventana de autorización EVM. Mientras la ventana está activa, tus transacciones EVM ordinarias están permitidas. Por defecto dura 600 bloques y permite 5 transacciones. Puedes cambiarlo con `QORE_WINDOW_BLOCKS` y `QORE_WINDOW_TXS` en `.env`.

**Qué deberías ver:** `opened: ` seguido de un hash de transacción, y luego `window: 600 blocks, 5 txs, ... uqor (value plus fees)`. **Copia este hash.** Lo comprobarás en el paso 10.

Ahora espera unos 10 segundos. Al abrir la ventana cambia el contador de transacciones de la cuenta, y el siguiente comando debe ver el valor nuevo.

```sh
sleep 10
pnpm window status
```

**Qué hace**

- `sleep 10` espera 10 segundos (también funciona en PowerShell y Git Bash).
- `status` muestra el resultado.

**Qué deberías ver:** `PQC key:  registered` y `window:   live; ... blocks, ... txs, ... uqor left`.

### 8. Despliega el contrato {#step-deploy}

```sh
pnpm deploy:testnet
```

**Qué hace**

- Ejecuta Hardhat Ignition, la herramienta que despliega contratos, con el módulo `Counter` en la red `qorechainTestnet` (chain id 9800, la testnet de QoreChain).
- Te pide confirmación. Escribe `y` y pulsa Intro.

**Qué deberías ver:** una pregunta de confirmación sobre desplegar en `qorechainTestnet` (9800), y después de tu `y` una línea que termina con `CounterModule#Counter` y la dirección de tu contrato `0x...`. Esa es la dirección de tu contrato. **Cuánto tarda:** unos 30 segundos.

### 9. Lee e incrementa {#step-interact}

```sh
pnpm interact
```

**Qué hace**

- Lee el número guardado, llama a `increment()` (suma uno) y lo vuelve a leer. La llamada usa una de las 5 transacciones de tu ventana.

**Qué deberías ver:** `Counter 0x... on qorechain-diana EVM (9800)`, `count: 0`, `increment tx: 0x...`, `status: success in block ...`, `count: 1` y un enlace al explorador.

```sh
pnpm interact --read
```

**Qué hace**

- `--read` significa solo lectura: muestra el número y no envía nada.

**Qué deberías ver:** la dirección del Counter y `count: 1`.

### 10. Verifica la transacción híbrida {#step-explorer}

La transacción de `pnpm window open` es tu prueba de que la cadena comprobó una firma poscuántica. Compruébalo de dos maneras.

**a. Con la petición web simple.** Sustituye `<HASH>` por el hash del paso 7. Quita los signos `<` y `>`.

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Qué hace**

- `curl <dirección>` pide a un servidor público de QoreChain el registro de esa transacción y lo muestra. En Windows PowerShell, escribe `curl.exe` en lugar de `curl`.
- `api-testnet.qore.host` es el servidor público de la testnet. `<HASH>` es la transacción que quieres consultar.

**Qué deberías ver en la respuesta larga:**

- `"code": 0`, que significa que la transacción tuvo éxito.
- Una extensión de tipo `PQCHybridSignature` que contiene la firma ML-DSA-87, de 4.627 bytes.
- Un evento `pqc_hybrid_verify` con el atributo `status` igual a `verified`.

**b. Con el explorador.**

1. Abre https://explore.qore.network y cambia el selector de red a **Testnet**.
2. Busca el hash de `pnpm window open`. La página muestra una firma poscuántica que la cadena verificó.
3. Busca el hash de `increment tx` del paso 9, o la dirección de tu Counter, para ver la llamada al contrato.

El [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) muestra el mismo tipo de prueba byte a byte.

## Construye el mismo proyecto desde cero {#scaffold}

El taller en vivo empieza desde una carpeta vacía. Este comando crea el mismo proyecto de Hardhat (sin el script `interact`, que solo tiene la copia descargada). Ejecútalo en una carpeta donde guardes proyectos, en lugar del paso 1.

```sh
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
cd qday-demo
```

| Parte | Significado |
| --- | --- |
| `npx` | Ejecuta una herramienta directamente desde internet, sin instalarla. |
| `create-qorechain-dapp@latest` | El creador de proyectos de QoreChain, en su versión más reciente. |
| `qday-demo` | El nombre de la carpeta nueva. |
| `-t hardhat` | Qué plantilla de proyecto usar: un proyecto de Hardhat 3 con un contrato, pruebas y el auxiliar de ventana. |
| `--network testnet` | Con qué red de QoreChain habla el proyecto: la red de prueba, no la real. |
| `--package-manager pnpm` | Qué herramienta instala las librerías. |

**Qué deberías ver:** una lista de paquetes instalados y después `Done! Created qday-demo`. Las librerías ya están instaladas y ya existe un archivo `.env`, así que puedes saltarte el paso 2 y la copia del paso 4. Continúa con `pnpm test` (paso 3), luego 4a y 4b (rellenar el `.env`) y los pasos 5 a 8. **Cuánto tarda:** unos 30 segundos.

## Qué deberías ver al final {#result}

- `pnpm test` muestra `2 passing`.
- `pnpm window status` muestra `PQC key:  registered` y `window:   live` con los bloques, las transacciones y el valor que quedan.
- `pnpm deploy:testnet` muestra la dirección del `Counter` desplegado (`0x...`).
- `pnpm interact` muestra `count` pasando de 0 a 1, `status: success` y un enlace al explorador.
- La comprobación con `curl` muestra `"code": 0`, la extensión `PQCHybridSignature` y el evento `pqc_hybrid_verify` con `status` `verified`. El explorador (Testnet) marca la misma transacción como verificada.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `pnpm: command not found` | pnpm no está instalado. Node.js no lo incluye. | Ejecuta `npm install -g pnpm` y abre una terminal nueva. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js es demasiado antiguo. | Instala Node.js 22 o posterior y comprueba `node --version`. |
| `node: .env: not found` | No hay un archivo `.env` en esta carpeta. | Haz el paso 4 y ejecuta el comando desde la carpeta del proyecto. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY as 0x followed by 64 hex characters, in .env` | Falta el archivo `.env`, o `PRIVATE_KEY` sigue siendo el marcador de posición o tiene un error de escritura. | Repite el paso 4. Guarda el archivo. Ejecuta el comando desde la carpeta del proyecto. |
| `Set QORE_PQC_RECOVERY_CODE in .env` o `not a valid QRC1 recovery code` | El código de recuperación está vacío o tiene un error de escritura. | Ejecuta `pnpm window recovery-code` y pega la línea `QRC1-...` completa. |
| `... does not exist on chain yet: send it some QOR first` (en `register` o `open`) | La cuenta aún no tiene QOR. | Solicita QOR al faucet (paso 6) y espera 10 segundos. |
| El faucet dice que alcanzaste el límite | Una solicitud cada 24 horas por cuenta. | Espera y vuelve a intentarlo. O usa una segunda cuenta desechable. |
| `account has no PQC key and classical fallback is disabled` | Enviaste una transacción antes de registrar la clave. | Ejecuta `pnpm window register` y luego `pnpm window open`. |
| `EVM authorisation window exhausted` (o la pista `open an EVM window first`) | La ventana se quedó sin bloques o transacciones, o nunca se abrió. | Ejecuta `pnpm window open`, espera 10 segundos y vuelve a intentarlo. |
| `HHE10402` después de abrir la ventana | El despliegue se ejecutó antes de que se actualizara el contador de transacciones de la cuenta. | Espera 10 segundos y ejecuta `pnpm deploy:testnet` otra vez. |
| `Deploy first (pnpm deploy:testnet) or set COUNTER_ADDRESS` | `pnpm interact` no encuentra el contrato. | Termina el paso 8 en esta carpeta. |
| `PQC key: registered, but NOT this key` | El código de recuperación de `.env` difiere del usado en el registro. | Vuelve a poner el código de recuperación original. Un código distinto crea una clave distinta. |
| Errores CORS en una aplicación de navegador | El servidor REST público no envía cabeceras CORS, así que un navegador lo bloquea. | Usa el proxy `/lcd` de la plantilla, como hace la [página web del Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook). |

## El código {#code}

El contrato (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

La parte con firma híbrida de `scripts/window.ts` (el mensaje de la ventana y el firmante):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` es la cuenta creada a partir de tu material de claves, y `net` es el registro de red para `QORE_NETWORK` (por defecto `testnet`, chain id `qorechain-diana`). La comisión que usa el script es de 100000 `uqor` (0,1 QOR) con un límite de gas de 800000, porque las transacciones híbridas son grandes.

## Paquetes usados {#packages}

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Firma híbrida, registro de la clave PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Auxiliares de la ventana EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Difundir la transacción del carril nativo |
| `hardhat` | ^3.21.1 | Compilar, probar, desplegar con Ignition |
| `viem` | ^2.47.6 | Leer y escribir el contrato |
| `tsx` | ^4.19.0 | Ejecutar los scripts de TypeScript |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Consulta [Generadores y CLI](/developer-tools/scaffolders-and-cli) e [Instalar el SDK](/sdk/install).

## Datos de red {#networks}

| Elemento | Valor |
| --- | --- |
| Red | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Fuente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
