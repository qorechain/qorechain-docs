---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

El Q-Day Guestbook es un libro de visitas en la cadena, en la testnet EVM de QoreChain. Cualquiera puede firmarlo una vez por dirección con un mensaje de hasta 140 caracteres. Tiene dos partes:

- **`contracts-app/`**: un contrato Solidity y un proyecto de Hardhat. Lo despliegas y puedes firmar desde la terminal.
- **`web/`**: una página web que se abre en tu navegador, conecta la wallet QoreX, muestra la ventana EVM de la cuenta y lista las últimas firmas en vivo.

Esta guía está escrita para principiantes. Cada comando se explica y cada paso termina con lo que deberías ver.

**Cuánto tarda:** unos 35 minutos la primera vez: 20 para la parte del contrato y 15 para la página web.

## Qué demuestra {#shows}

- **Una dApp de navegador que firma de forma híbrida sin que lo note.** La página es una aplicación ordinaria de wagmi y RainbowKit. QoreX añade la mitad poscuántica (ML-DSA-87) de la firma, de modo que la misma transacción queda protegida por la clave clásica (secp256k1) y por una clave poscuántica.
- **La ventana EVM es visible en la interfaz.** La página lee la ventana de la cuenta desde la cadena y muestra si está activa y cuántos bloques y transacciones quedan.
- **Rechazos legibles.** Cuando la cadena rechaza una escritura, la página asigna el error a una de cuatro causas (sin clave registrada, sin ventana, ventana agotada, parámetros no válidos) y muestra la solución.
- **Firmas híbridas verificadas en la cadena.** Cada firma que escribes es una transacción que la cadena aceptó solo después de comprobar ambas firmas.

## Antes de empezar {#prerequisites}

Esta guía usa una cuenta de testnet desechable para la parte de la terminal. Nunca uses una wallet real ni fondos reales. El QOR de testnet no tiene valor.

Necesitas una terminal. En macOS abre **Terminal**. En Windows abre **PowerShell** (o **Git Bash**, que viene con Git). En Linux abre cualquier terminal. Instala estas tres herramientas. Si el comando de comprobación ya muestra una versión adecuada, sáltate la instalación.

### Node.js 22 o posterior

Node.js ejecuta JavaScript en tu ordenador. Hardhat 3 necesita Node.js 22 o posterior.

| Sistema | Instalación | Comprobación |
| --- | --- | --- |
| macOS | `brew install node` (necesita [Homebrew](https://brew.sh)), o descarga desde https://nodejs.org | `node --version` |
| Windows | `winget install OpenJS.NodeJS.LTS`, o descarga desde https://nodejs.org | `node --version` |
| Linux | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \| bash`, abre una terminal nueva y luego `nvm install 22` | `node --version` |

Qué deberías ver: un número que empieza por `v22` o superior. En Windows, cierra y vuelve a abrir PowerShell después de instalar.

### pnpm

pnpm descarga las librerías que necesita un proyecto. Node.js no lo incluye, así que instálalo tú, en todos los sistemas.

```sh
npm install -g pnpm
```

| Parte | Significado |
| --- | --- |
| `npm` | La herramienta que viene con Node.js. Instala otras herramientas. |
| `install` | Descargar e instalar. |
| `-g` | Global: instalar para todo el ordenador, no solo para una carpeta. |
| `pnpm` | La herramienta que se instala. |

Compruébalo con `pnpm --version`. Deberías ver un número como `9.12.0` (9 o superior). Si alguna vez ves `pnpm: command not found`, ejecuta el comando de instalación de arriba y abre una terminal nueva. Si macOS o Linux dice `EACCES: permission denied`, usa `sudo npm install -g pnpm`.

### Git

| Sistema | Instalación | Comprobación |
| --- | --- | --- |
| macOS | `xcode-select --install` o `brew install git` | `git --version` |
| Windows | `winget install Git.Git`, o descarga desde https://git-scm.com | `git --version` |
| Linux | `sudo apt install git` (Debian, Ubuntu) o `sudo dnf install git` (Fedora) | `git --version` |

Qué deberías ver: `git version 2.` y un número.

## Wallets de testnet {#wallet}

Esta guía usa dos cuentas, y son distintas a propósito:

1. **Una cuenta de archivo de claves** para la parte de la terminal (pasos 3 a 6). La guía te la crea. Despliega el contrato.
2. **Una cuenta de QoreX** para la página web (pasos 8 y 9). La página web firma con ella.

**QoreX en testnet.** [QoreX](/qorex/overview) es la wallet de QoreChain. Para la página web usas la extensión de navegador (consulta [Integraciones de QoreX](/developer-tools/qorex-integrations)). Instálala en el navegador que vayas a usar y luego:

- **Extensión de navegador QoreX:** desbloquéala, toca 7 veces el número de versión en la parte inferior y elige **Switch to testnet (diana)**.
- **App QoreX en tu móvil:** Ajustes y luego **Use testnet (developers)**.
- Para el carril EVM elige **Add an Ethereum account (coin 60)**. La página web necesita una cuenta coin 60.

**El faucet** da QOR de testnet gratis: https://dashboard.qorechain.io/faucet. Inicia sesión, pega una dirección y solicítalo. Recibes 100 QOR cada 24 horas por cuenta.

**Sobre las cantidades.** QOR es la moneda. `uqor` es su pieza más pequeña: 1 QOR = 1.000.000 uqor. La primera transacción de una cuenta nueva registra su clave poscuántica, con una comisión única de unos 0,09 QOR.

## Parte 1: el contrato {#contract}

### 1. Obtén el código {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

**Qué hace**

- `git clone <dirección>` descarga el proyecto desde GitHub en una carpeta nueva `build-before-qday`.
- `cd <carpeta>` mueve tu terminal al proyecto Guestbook. Tiene dos carpetas, `contracts-app` y `web`, que configuras por separado.

**Qué deberías ver:** `Cloning into 'build-before-qday'...`. **Cuánto tarda:** unos segundos.

### 2. Instala las librerías y prueba {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

**Qué hace**

- `cd contracts-app` entra en la carpeta del contrato.
- `pnpm install` descarga las librerías que figuran en `package.json` (Hardhat y el SDK de QoreChain).
- `pnpm test` ejecuta las comprobaciones del contrato en una cadena falsa dentro de tu ordenador. No necesita clave ni cuenta en la red. La primera ejecución descarga el compilador de Solidity.

**Qué deberías ver:** una lista de paquetes, `Done in` unos segundos, y luego `QDayGuestbook` con tres marcas de verificación y `3 passing`. **Cuánto tarda:** alrededor de un minuto.

### 3. Crea el archivo de claves {#step-account}

El proyecto lee sus secretos de un archivo llamado `.env`. Créalo a partir de la plantilla.

macOS, Linux, Git Bash:

```sh
cp .env.example .env
```

Windows PowerShell:

```sh
copy .env.example .env
```

**Qué hace**

- `cp` (o `copy`) copia la plantilla `.env.example` a un archivo nuevo `.env`.

El archivo `.env` es tu **archivo de claves**. Vive solo en la carpeta `contracts-app`. **No lo compartas nunca, no lo subas nunca a Git y no reutilices nunca estas claves para una wallet real.** El proyecto ya ignora `.env` en Git. Ábrelo en cualquier editor de texto (`open -e .env` en macOS, `notepad .env` en Windows, `nano .env` en Linux) y rellena dos valores.

**a. Una clave privada desechable.**

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

**Qué hace**

- `node -e "..."` ejecuta una línea de JavaScript. La línea crea 32 bytes aleatorios y los muestra en hexadecimal con `0x` delante. Eso es una clave privada.

**Qué deberías ver:** una línea, `0x` y después 64 letras y dígitos. Cópiala en `.env` como `PRIVATE_KEY=0x...`, sustituyendo el marcador de posición lleno de ceros.

**b. Un código de recuperación poscuántico.**

```sh
pnpm window recovery-code
```

**Qué hace**

- `pnpm window` ejecuta el script auxiliar `scripts/window.ts`. La palabra que sigue es el comando.
- `recovery-code` muestra un código aleatorio nuevo a partir del cual se crea la clave ML-DSA-87 de la cuenta.

**Qué deberías ver:** una línea que empieza por `QRC1-`. Cópiala en `.env` como `QORE_PQC_RECOVERY_CODE=QRC1-...`. Conserva el mismo código para esta cuenta: un código nuevo da una clave poscuántica distinta.

Deja `QORE_MNEMONIC` vacío (un mnemónico es una frase de 12 o 24 palabras que puede sustituir a los dos valores anteriores; usa uno u otro, no ambos) y mantén `QORE_NETWORK=testnet`, que le dice al auxiliar que use la red de prueba. Tu `.env` se ve así (se muestran marcadores de posición):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

Guarda el archivo.

### 4. Da fondos a la cuenta {#step-faucet}

```sh
pnpm window status
```

**Qué hace**

- Muestra tu cuenta, si su clave poscuántica está registrada y si tiene una ventana EVM.

**Qué deberías ver:** `account:  0x...  (qor1...)`, y luego `PQC key:  not registered` y `window:   none`. Copia la dirección `qor1...`. Después:

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Asegúrate de que la página está en **Testnet**.
3. Pega la dirección `qor1...` y solicita el QOR (100 QOR una vez cada 24 horas por cuenta).
4. Espera unos 10 segundos. Si buscas tu dirección en https://explore.qore.network (Testnet), verás el saldo.

### 5. Registra la clave, abre la ventana, despliega {#step-window}

```sh
pnpm window register
```

**Qué hace**

- Envía tu clave pública ML-DSA-87 a la cadena, una vez por cuenta. Es el único mensaje que la cadena acepta sin firma poscuántica, porque todavía no hay una clave en la cadena con la que comprobarla. Cuesta unos 0,09 QOR.

**Qué deberías ver:** `registered: ` y un hash de transacción.

```sh
pnpm window open
```

**Qué hace**

- Envía una transacción, firmada con ambas claves (híbrida), que abre una ventana de autorización EVM. Mientras está activa, tus transacciones EVM ordinarias están permitidas. Por defecto dura 600 bloques y permite 5 transacciones.

**Qué deberías ver:** `opened: ` y un hash de transacción, y luego `window: 600 blocks, 5 txs, ...`. **Copia este hash** para el último paso.

```sh
sleep 10
```

**Qué hace**

- Espera 10 segundos (también funciona en PowerShell y Git Bash). Al abrir la ventana cambia el contador de transacciones de la cuenta, y el siguiente comando debe ver el valor nuevo.

```sh
pnpm deploy:testnet
```

**Qué hace**

- Ejecuta Hardhat Ignition, la herramienta que despliega contratos, con el módulo `QDayGuestbook` en la red `qorechainTestnet` (chain id 9800, la testnet de QoreChain).
- Te pide confirmación. Escribe `y` y pulsa Intro.

**Qué deberías ver:** una línea que termina con `QDayGuestbookModule#QDayGuestbook` y la dirección de tu contrato `0x...`. **Copia esta dirección**: la página web la necesita. **Cuánto tarda:** unos 30 segundos.

### 6. Firma desde la terminal {#step-cli}

```sh
pnpm sign "Hello from my terminal"
pnpm sign --read
```

**Qué hace**

- `pnpm sign "<mensaje>"` escribe una entrada en el libro de visitas. El texto entre comillas es tu mensaje, de hasta 140 caracteres.
- `pnpm sign --read` solo lee: lista las últimas entradas y no envía nada.

**Qué deberías ver:** tras el primer comando `tx: 0x...` y `status: success in block ...`. Tras el segundo, `guestbook 0x...: 1 signatures` y tu mensaje con la hora y tu dirección.

Cada dirección puede firmar una vez. Un segundo `pnpm sign` desde la misma cuenta lo rechaza el contrato con `AlreadySigned`.

## Parte 2: la página web {#web}

### 7. Instala y configura la página {#step-web}

Abre una segunda ventana de terminal en la misma carpeta del proyecto, o vuelve atrás con `cd ..`. Después:

```sh
cd web
pnpm install
```

**Qué hace**

- Entra en la carpeta web y descarga sus librerías (React, wagmi, RainbowKit, Vite).

**Qué deberías ver:** una lista de paquetes y `Done in` unos segundos.

Crea el archivo de ajustes de la página. macOS, Linux, Git Bash: `cp .env.example .env`. Windows PowerShell: `copy .env.example .env`. Abre `web/.env` en un editor y pon la dirección del contrato que copiaste en el paso 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Deja `VITE_WALLETCONNECT_PROJECT_ID` vacío. Solo hace falta si añades una wallet WalletConnect a `src/wagmi.ts`.

### 8. Arranca la página y conecta QoreX {#step-run}

```sh
pnpm dev
```

**Qué hace**

- Arranca un pequeño servidor web en tu propio ordenador (Vite). La página está en `http://localhost:5174`. El servidor también reenvía las peticiones que empiezan por `/lcd` al servidor REST público de la testnet. El navegador no puede llamar a ese servidor directamente (no envía cabeceras CORS), así que este proxy lo hace por la página.
- El comando sigue en ejecución. Deja esta terminal abierta. Pulsa `Ctrl+C` para detenerlo más tarde. Si cambias `web/.env`, detenlo y vuelve a arrancarlo.

**Qué deberías ver:** `VITE ... ready` y `Local: http://localhost:5174/`.

Ahora, en el navegador donde está instalado QoreX:

1. Abre http://localhost:5174 .
2. Asegúrate de que QoreX está desbloqueado y cambiado a testnet (consulta "Wallets de testnet" arriba), con una cuenta coin 60 que tenga QOR del faucet. Usa la forma `qor1...` de su dirección en la página del faucet si QoreX muestra ambas formas.
3. En la página, en la tarjeta 1, elige **Connect QoreX** (el botón de conectar). Si QoreX no aparece el primero, elígelo en la lista de wallets.
4. QoreX abre una ventana que pide conectarse. Apruébalo.

**Qué deberías ver:** la tarjeta 1 muestra tu cuenta `0x...`, la cadena `qorechain-diana EVM (9800)`, tu saldo y la ventana EVM: `no window open` para una cuenta nueva. La tarjeta 3 muestra `On chain now: 1 signatures` y la entrada que escribiste en el paso 6. Si la línea de la cadena dice `wrong chain`, cambia QoreX a testnet.

### 9. Firma desde QoreX {#step-sign}

1. En la tarjeta 2, escribe un mensaje (hasta 140 caracteres). La página muestra cuántos has usado.
2. Elige **Sign**.
3. QoreX abre su aprobación. Si tu cuenta aún no tiene clave poscuántica ni ventana, QoreX te ofrece registrar la clave (una comisión única de unos 0,09 QOR) y abrir la ventana EVM en la misma aprobación. Acepta.
4. Aprueba en QoreX. El botón dice `Approve in QoreX...` mientras espera.

**Qué deberías ver:** una línea `tx 0x...` con un enlace al explorador, primero `waiting for the block...` y luego `success in block ...`. La tarjeta 1 ahora muestra la ventana EVM como `live` con los bloques y las transacciones que quedan. La tarjeta 3 añade tu mensaje arriba, la más reciente primero. Lista hasta 20 entradas y se actualiza cada pocos segundos. Si lo intentas de nuevo desde la misma dirección, la tarjeta 2 dice `This address has already signed.`

### 10. Verifica en la cadena {#step-explorer}

Usa el hash de `pnpm window open` (paso 5). Para la página, QoreX también abre la ventana en su propia transacción: consulta el historial en QoreX o busca tu dirección en el explorador.

**a. Con la petición web simple.** Sustituye `<HASH>` por el hash (quita los signos `<` y `>`).

```sh
curl https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

**Qué hace**

- `curl <dirección>` pide a un servidor público de QoreChain el registro de esa transacción y lo muestra. En Windows PowerShell escribe `curl.exe` en lugar de `curl`.

**Qué deberías ver en la respuesta larga:**

- `"code": 0`, que significa que la transacción tuvo éxito.
- Una extensión de tipo `PQCHybridSignature` con la firma ML-DSA-87, de 4.627 bytes.
- Un evento `pqc_hybrid_verify` con `status` igual a `verified`.

**b. Con el explorador.** Abre https://explore.qore.network, cambia el selector de red a **Testnet** y busca el hash de la transacción (del paso 5, 6 o 9), la dirección de tu cuenta o la dirección del `QDayGuestbook`. La transacción de la ventana muestra una firma poscuántica que la cadena verificó.

## Qué deberías ver al final {#result}

- `pnpm test` en `contracts-app` muestra `3 passing`.
- `pnpm window status` muestra `PQC key:  registered` y `window:   live` con los bloques, las transacciones y el valor que quedan.
- `pnpm deploy:testnet` muestra la dirección del `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` muestra el hash de la transacción y `status: success in block ...`.
- La página muestra tu cuenta, `qorechain-diana EVM (9800)`, tu saldo y la ventana como `live`. Tras **Sign** y tu aprobación ves un enlace a la transacción y `success in block ...`.
- La lista de abajo muestra el número de firmas y las últimas entradas, la más reciente primero.
- La comprobación con `curl` muestra `"code": 0`, la extensión `PQCHybridSignature` y `pqc_hybrid_verify` con `status` `verified`.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `pnpm: command not found` | pnpm no está instalado. Node.js no lo incluye. | Ejecuta `npm install -g pnpm` y abre una terminal nueva. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js es demasiado antiguo. | Instala Node.js 22 o posterior. |
| `node: .env: not found` | No hay un archivo `.env` en esta carpeta. | Haz el paso 3 en `contracts-app` y ejecuta los comandos desde esa carpeta. |
| `Set QORE_MNEMONIC, or PRIVATE_KEY ...` o `Set QORE_PQC_RECOVERY_CODE ...` | Un valor de `.env` está vacío, es un marcador de posición o tiene un error de escritura. | Rellena ambos valores como en el paso 3 y guarda. |
| `... does not exist on chain yet: send it some QOR first` | La cuenta aún no tiene QOR. | Usa el faucet (paso 4) y espera 10 segundos. |
| El faucet dice que alcanzaste el límite | Una solicitud cada 24 horas por cuenta. | Espera y vuelve a intentarlo. |
| `account has no PQC key and classical fallback is disabled` | Se envió una transacción antes de registrar la clave. | Ejecuta `pnpm window register` y luego `pnpm window open`. En QoreX, aprueba el registro que se ofrece con tu primer envío. |
| `EVM authorisation window exhausted` o `open an EVM window first` | La ventana se quedó sin bloques o transacciones, o nunca se abrió. | Ejecuta `pnpm window open` (terminal) y espera 10 segundos. En la página, aprueba la ventana nueva cuando QoreX la ofrezca. |
| `HHE10402` después de abrir la ventana | El despliegue se ejecutó antes de que se actualizara el contador de transacciones de la cuenta. | Espera 10 segundos y ejecuta `pnpm deploy:testnet` otra vez. |
| `refused: ... (AlreadySigned)` | Esta dirección ya ha firmado. | Cada dirección firma una vez. Usa otra cuenta. |
| `refused: ... (BadLength)` | El mensaje está vacío o tiene más de 140 caracteres. | Usa de 1 a 140 caracteres. |
| `Deploy first (pnpm deploy:testnet) or set GUESTBOOK_ADDRESS` | `pnpm sign` no encuentra el contrato. | Termina el paso 5 en `contracts-app`. |
| La página no muestra entradas y el botón **Sign** está en gris | `VITE_GUESTBOOK_ADDRESS` está vacío en `web/.env`. | Pega la dirección del paso 5, y luego detén (`Ctrl+C`) y reinicia `pnpm dev`. |
| La página dice `wrong chain` | QoreX no está en la testnet. | Cambia QoreX a testnet (diana), consulta "Wallets de testnet". |
| QoreX no aparece al elegir conectar | La página se abrió en un navegador sin la extensión QoreX, o la extensión está bloqueada. | Abre http://localhost:5174 en el navegador con QoreX y desbloquéalo. |
| El puerto 5174 ya está en uso | Otro programa lo usa. | Ciérralo, o usa la otra dirección que muestra Vite. |
| `could not read` junto a la ventana EVM, o errores CORS en la consola del navegador | La página llamó directamente al servidor REST, y este no envía cabeceras CORS. | Llama a REST solo a través del proxy `/lcd` del servidor de desarrollo, como hace este proyecto. Arranca la página con `pnpm dev`. |

## El código {#code}

El contrato guarda las entradas en un array y permite una firma por dirección:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX es la primera wallet de la lista de conectores (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

La página muestra la ventana y explica los rechazos (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Paquetes usados {#packages}

Contratos (`contracts-app/`):

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Script auxiliar de la ventana, firma híbrida |
| `@qorechain/evm` | ^0.13.0 | Definiciones de cadena, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Difundir el mensaje de la ventana |
| `hardhat` | ^3.21.1 | Compilar, probar, desplegar con Ignition |
| `viem` | ^2.47.6 | Cliente de Ethereum |
| `tsx` | ^4.19.0 | Ejecutar los scripts de TypeScript |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Página web (`web/`):

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definiciones de cadena, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX como wallet de RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Botón de conectar |
| `wagmi` | ^2.19.5 | Hooks de React para lecturas y escrituras |
| `viem` | ^2.53.1 | Cliente de Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Obtención de datos para la ventana y las lecturas de la cadena |
| `react`, `react-dom` | ^18.3.1 | Interfaz |
| `vite` | ^5.4.0 | Servidor de desarrollo |
| `@vitejs/plugin-react` | ^4.3.0 | Soporte de React para Vite |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Fuente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
