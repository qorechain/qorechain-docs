---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

El Q-Day Counter es el proyecto EVM de QoreChain más pequeño que resulta útil: un contrato Solidity que guarda un número, un proyecto de Hardhat que lo despliega en la testnet `qorechain-diana` y un script corto que lo lee y lo incrementa. Es la plantilla `hardhat` de `create-qorechain-dapp`, con un pequeño script `interact` añadido.

## Qué demuestra {#shows}

- **La firma híbrida forma parte de la ruta de despliegue.** Antes de cualquier transacción EVM, incluido el despliegue de un contrato, la cuenta necesita una clave ML-DSA-87 registrada y una ventana de autorización EVM activa. La ventana se abre con un mensaje del carril nativo firmado con secp256k1 y ML-DSA-87 (híbrido), y la cadena verifica ambas firmas.
- **Una transacción con firma híbrida, verificada en la cadena.** El paso `pnpm window open` envía esa transacción. Puedes buscarla en el explorador y ver el veredicto de la propia cadena.
- **Tus herramientas EVM habituales siguen funcionando.** Hardhat, Ignition y viem envían transacciones de Ethereum corrientes. La protección poscuántica está en la ventana, de modo que una clave secp256k1 robada por sí sola no puede gastar desde la cuenta.

Un ordenador cuántico lo bastante grande para romper secp256k1 permitiría a un atacante falsificar firmas clásicas. QoreChain exige una segunda firma poscuántica (ML-DSA-87, FIPS 204) en la cuenta. El Counter muestra todo el ciclo del desarrollador con esa regla activada: registrar la clave, abrir una ventana, desplegar, llamar, leer.

## Antes de empezar {#prerequisites}

Necesitas una terminal en macOS, Linux o Windows con WSL o Git Bash, y estas herramientas:

| Herramienta | Versión necesaria | Comprobación |
| --- | --- | --- |
| Git | cualquier versión reciente | `git --version` |
| Node.js | 20.12 o posterior (se recomienda 22 LTS) | `node --version` |
| pnpm | 9 o posterior | `pnpm --version` |

Instala Node.js desde https://nodejs.org. Si `pnpm --version` falla, instala pnpm con `npm install -g pnpm` (o `corepack enable`) y vuelve a comprobar.

También necesitas una cuenta gratuita en el [panel de QoreChain](https://dashboard.qorechain.io) para usar el faucet. En esta guía nunca usas una wallet real: todo lo que sigue usa una cuenta de testnet desechable, y los QOR de testnet no tienen valor.

## Paso a paso {#steps}

### 1. Obtén el código {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Instala las dependencias {#step-install}

```sh
pnpm install
```

### 3. Ejecuta las pruebas y la compilación {#step-test}

Las pruebas se ejecutan en una cadena local simulada. No necesitan ninguna clave ni cuenta en la red.

```sh
pnpm test
pnpm build
```

Deberías ver `2 passing` para las pruebas de `Counter`.

### 4. Crea el archivo de claves de la testnet {#step-account}

Crea el archivo de configuración a partir de la plantilla:

```sh
cp .env.example .env
```

El archivo `.env` guarda una clave desechable, así que nunca lo subas a git y nunca reutilices la clave en ningún sitio real. Abre `.env` en cualquier editor. Rellenarás dos valores.

**a. Una clave privada desechable.** Genera una clave aleatoria de 32 bytes:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Copia el valor `0x...` que se imprime en `.env` como `PRIVATE_KEY=0x...`, sustituyendo el marcador de posición formado solo por ceros.

**b. Un código de recuperación poscuántico.** La clave ML-DSA-87 de la cuenta se deriva de un código de recuperación independiente. Crea uno:

```sh
pnpm window recovery-code
```

Copia la línea `QRC1-...` que se imprime en `.env` como `QORE_PQC_RECOVERY_CODE=QRC1-...`. Guarda este código junto con la clave privada y reutiliza siempre el mismo: un código nuevo da a la cuenta una clave ML-DSA-87 distinta.

Deja `QORE_MNEMONIC` vacío y mantén `QORE_NETWORK=testnet`. Tu `.env` queda así (se muestran marcadores de posición):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Muestra la dirección de tu cuenta {#step-address}

```sh
pnpm window status
```

La primera línea muestra tu cuenta como `0x...` y su forma `qor1...`. En este punto también indica que la clave no está registrada y que no existe ninguna ventana. Copia la dirección `qor1...`.

### 6. Consigue QOR de testnet en el faucet {#step-faucet}

1. Abre https://dashboard.qorechain.io/faucet e inicia sesión.
2. Pega tu dirección `qor1...` y solicita los QOR (100 QOR una vez cada 24 horas).
3. Espera unos segundos y ejecuta `pnpm window status` de nuevo. La cuenta ya existe en la cadena.

### 7. Registra la clave y abre la ventana {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

El registro es el único mensaje que la cadena acepta firmado de forma clásica, porque aún no hay en la cadena ninguna clave contra la que comprobarlo. La apertura de la ventana se firma de forma híbrida. Guarda el hash de transacción que imprime `window open`; lo buscarás en el último paso.

### 8. Despliega el contrato {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

El comando imprime la dirección del `Counter` desplegado (`0x...`).

### 9. Lee e incrementa {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Búscalo en el explorador {#step-explorer}

1. Abre https://explore.qore.network y cambia el selector de red a **Testnet**.
2. Busca el hash que imprimió `pnpm window open`. La transacción muestra una firma poscuántica que la cadena verificó.
3. Busca el hash de la transacción `increment` que imprimió `pnpm interact`, o la dirección del `Counter` del paso 8, para ver la llamada al contrato.

El [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) muestra el mismo tipo de prueba byte a byte.

## Qué deberías ver {#result}

- `pnpm test` imprime `2 passing`.
- `pnpm window status` imprime la cuenta (`0x...` con su forma `qor1...`), `PQC key: registered` y `window: live` con los bloques, las transacciones y el valor que quedan.
- `pnpm deploy:testnet` imprime la dirección del `Counter` desplegado (`0x...`).
- `pnpm interact` imprime la dirección del Counter, `count`, el hash de la transacción `increment`, `status: success` con el número de bloque, el nuevo `count` y un enlace a la transacción en el explorador.
- En el explorador (Testnet), la transacción `window open` aparece marcada como verificada con ambas firmas.

Si un paso falla, ejecuta primero `pnpm window status`: te dice si falta la clave o la ventana. Si una transacción es rechazada después de agotar la ventana, abre una nueva con `pnpm window open`.

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

La parte de `scripts/window.ts` con firma híbrida (el mensaje de la ventana y el firmante):

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

`acc` es la cuenta unificada derivada de tu material de claves, y `net` es el registro de red de `QORE_NETWORK` (por defecto `testnet`, ID de cadena `qorechain-diana`). La comisión que usa el script es de 100000 `uqor` con un límite de gas de 800000, porque las transacciones híbridas son grandes. El tamaño de la ventana se puede cambiar en `.env` con `QORE_WINDOW_BLOCKS` (por defecto 600), `QORE_WINDOW_TXS` (por defecto 5) y `QORE_WINDOW_MAX_UQOR`.

## Paquetes usados {#packages}

| Paquete | Versión | Para qué se usa |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Firma híbrida, registro de claves PQC, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | Auxiliares de la ventana EVM (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Difusión de la transacción del carril nativo |
| `hardhat` | ^3.21.1 | Compilar, probar, desplegar con Ignition |
| `viem` | ^2.47.6 | Leer y escribir el contrato |
| `tsx` | ^4.19.0 | Ejecutar los scripts de TypeScript |
| `typescript` | ^5.6.3 | Comprobación de tipos |

Puedes generar el mismo proyecto tú mismo con `npx create-qorechain-dapp my-app -t hardhat --network testnet`. Consulta [Generadores y CLI](/developer-tools/scaffolders-and-cli) e [Instalar el SDK](/sdk/install).

## Datos de la red {#networks}

| Elemento | Valor |
| --- | --- |
| Red | testnet `qorechain-diana` |
| ID de cadena EVM | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| RPC de EVM | `https://evm-testnet.qore.host` |

Código fuente: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
