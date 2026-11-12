---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

El Q-Day Guestbook es un libro de visitas en la cadena, en la testnet EVM de QoreChain. Cualquiera puede firmarlo una vez por dirección con un mensaje de hasta 140 caracteres. Tiene dos partes: un contrato Solidity con un proyecto de Hardhat (`contracts-app/`) y una página web en React (`web/`) que conecta la wallet QoreX, muestra la ventana EVM de la cuenta y lista las últimas firmas en directo.

## Qué demuestra {#shows}

- **Una dApp de navegador que firma de forma híbrida sin saberlo.** La página es una aplicación corriente de wagmi y RainbowKit. QoreX añade la mitad ML-DSA-87 de la firma, de modo que la misma transacción queda protegida por secp256k1 y por una clave poscuántica.
- **La ventana EVM es visible en la interfaz.** La página lee de la cadena la ventana de la cuenta y muestra si está activa y cuántos bloques y transacciones quedan.
- **Rechazos legibles.** Cuando la cadena rechaza una escritura, `classifyEvmWindowRejection` asigna el error a una de cuatro causas (sin clave registrada, sin ventana, ventana agotada, parámetros no válidos) y la página muestra la solución.
- **Firmas híbridas verificadas en la cadena.** Cada firma que escribes es una transacción que la cadena aceptó solo después de comprobar ambas firmas (ML-DSA-87 y secp256k1).

## Antes de empezar {#prerequisites}

Necesitas una terminal en macOS, Linux o Windows con WSL o Git Bash, y estas herramientas:

| Herramienta | Versión necesaria | Comprobación |
| --- | --- | --- |
| Git | cualquier versión reciente | `git --version` |
| Node.js | 20.12 o posterior (se recomienda 22 LTS) | `node --version` |
| pnpm | 9 o posterior | `pnpm --version` |

Instala Node.js desde https://nodejs.org. Si `pnpm --version` falla, instala pnpm con `npm install -g pnpm` (o `corepack enable`) y vuelve a comprobar.

También necesitas una cuenta gratuita en el [panel de QoreChain](https://dashboard.qorechain.io) para el faucet y, para la parte del navegador, la wallet QoreX (la extensión para un navegador de escritorio, o la aplicación). Consulta [Integraciones de QoreX](/developer-tools/qorex-integrations) y el [resumen de QoreX](/qorex/overview). En los pasos del contrato nunca usas una wallet real: usas una cuenta de testnet desechable. Los QOR de testnet no tienen valor.

## Paso a paso {#steps}

### 1. Obtén el código {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

El proyecto tiene dos carpetas que configuras por separado.

### 2. Contratos: instala y prueba {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

Deberías ver `3 passing` para las pruebas de `QDayGuestbook`. Se ejecutan en una cadena local simulada y no necesitan ninguna clave.

### 3. Contratos: crea el archivo de claves de la testnet {#step-account}

```sh
cp .env.example .env
```

El archivo `.env` guarda una clave desechable, así que nunca lo subas a git y nunca reutilices la clave en ningún sitio real. Abre `.env` en cualquier editor y rellena dos valores.

**a. Una clave privada desechable.** Genera una clave aleatoria de 32 bytes:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copia el valor `0x...` que se imprime en `.env` como `PRIVATE_KEY=0x...`, sustituyendo el marcador de posición formado solo por ceros.

**b. Un código de recuperación poscuántico.** La clave ML-DSA-87 de la cuenta se deriva de un código de recuperación independiente. Crea uno:

```sh
pnpm window recovery-code
```

Copia la línea `QRC1-...` que se imprime en `.env` como `QORE_PQC_RECOVERY_CODE=QRC1-...`. Reutiliza siempre el mismo código: un código nuevo da a la cuenta una clave ML-DSA-87 distinta.

Deja `QORE_MNEMONIC` vacío y mantén `QORE_NETWORK=testnet`. Tu `.env` queda así (se muestran marcadores de posición):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Contratos: da fondos a la cuenta {#step-faucet}

```sh
pnpm window status
```

La primera línea muestra tu cuenta como `0x...` y su forma `qor1...`. Copia la dirección `qor1...` y después:

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega la dirección `qor1...` y solicita los QOR (100 QOR una vez cada 24 horas).
3. Espera unos segundos y ejecuta `pnpm window status` de nuevo.

### 5. Contratos: registra la clave, abre la ventana y despliega {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet` imprime la dirección del `QDayGuestbook` desplegado (`0x...`). Cópiala. El registro es el único mensaje que la cadena acepta firmado de forma clásica, porque aún no hay en la cadena ninguna clave contra la que comprobarlo. La apertura de la ventana se firma de forma híbrida; guarda el hash de transacción que imprime.

### 6. Contratos: firma desde la línea de comandos {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Cada dirección puede firmar una vez, así que un segundo `pnpm sign` desde la misma cuenta es rechazado por el contrato.

### 7. Página web: instala y configura {#step-web}

Abre una segunda terminal en la misma carpeta del proyecto (o vuelve a ella con `cd ..`) y después:

```sh
cd web
pnpm install
cp .env.example .env
```

Abre `web/.env` y pon la dirección que copiaste en el paso 5:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

Deja `VITE_WALLETCONNECT_PROJECT_ID` vacío: solo hace falta si añades a `src/wagmi.ts` una wallet basada en WalletConnect.

### 8. Página web: ejecútala {#step-run}

```sh
pnpm dev
```

Abre http://localhost:5174 en el navegador donde tengas instalado QoreX. La página lee la cadena a través del RPC de EVM. Lee la ventana EVM por REST a través del proxy `/lcd` de Vite, porque el endpoint REST público no envía cabeceras CORS. La lista de firmas de la parte inferior ya muestra la entrada que escribiste en el paso 6.

### 9. Firma desde QoreX {#step-sign}

1. Instala QoreX y cámbialo a la testnet. Consulta [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes#step-testnet) para ver cómo se hace el cambio.
2. En QoreX usa una cuenta coin-60 (Ethereum) con una clave ML-DSA-87 registrada, y dale fondos desde el [faucet](/dashboard/faucet) (pega su dirección después de iniciar sesión).
3. En la página, elige **Connect QoreX**, escribe un mensaje y elige **Sign**. Si no hay ninguna ventana abierta, QoreX te ofrece abrir la ventana EVM dentro de su aprobación.
4. Aprueba en QoreX.

### 10. Búscalo en el explorador {#step-explorer}

Abre https://explore.qore.network y cambia el selector de red a **Testnet**. Busca el hash de transacción del paso 6 o 9, el hash de `pnpm window open` o la dirección del `QDayGuestbook`. La transacción de la ventana muestra una firma poscuántica que la cadena verificó.

## Qué deberías ver {#result}

- `pnpm test` en `contracts-app` imprime `3 passing`.
- `pnpm window status` imprime `PQC key: registered` y `window: live` con los bloques y transacciones que quedan.
- `pnpm deploy:testnet` imprime la dirección del `QDayGuestbook` (`0x...`).
- `pnpm sign "..."` imprime el hash de la transacción y `status: success in block ...`.
- En la página, el paso 1 muestra tu cuenta `0x...`, la cadena `qorechain-diana EVM (9800)`, tu saldo y la ventana EVM como `live` con los bloques y transacciones que quedan.
- Después de elegir **Sign** y aprobar en QoreX, aparece un enlace de la transacción al explorador y, después, `success in block ...`.
- La lista de la parte inferior muestra el número de firmas en la cadena y las últimas entradas (hasta 20), las más nuevas primero, actualizadas cada pocos segundos.
- Un segundo intento desde la misma dirección indica que esa dirección ya ha firmado.

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
| `@cosmjs/stargate` | ^0.39.0 | Difusión del mensaje de la ventana |
| `hardhat` | ^3.21.1 | Compilar, probar, desplegar con Ignition |
| `viem` | ^2.47.6 | Cliente de Ethereum |
| `tsx` | ^4.19.0 | Ejecutar los scripts de TypeScript |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Página web (`web/`):

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Definiciones de cadena, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX como wallet de RainbowKit |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Botón de conexión |
| `wagmi` | ^2.19.5 | Hooks de React para lecturas y escrituras |
| `viem` | ^2.53.1 | Cliente de Ethereum |
| `@tanstack/react-query` | ^5.59.0 | Obtención de datos para la ventana y las lecturas de la cadena |
| `react`, `react-dom` | ^18.3.1 | Interfaz |
| `vite` | ^5.4.0 | Servidor de desarrollo |
| `@vitejs/plugin-react` | ^4.3.0 | Soporte de React para Vite |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Código fuente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
