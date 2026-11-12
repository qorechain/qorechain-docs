---
slug: /build-before-qday/workshop-1
title: "Taller 1: Tu primera transacción con firma híbrida"
sidebar_label: "Taller 1"
sidebar_position: 2
date: 2026-11-12
---

# Taller 1: Tu primera transacción con firma híbrida

Esta guía te lleva desde un ordenador sin nada instalado hasta una transacción firmada con dos claves a la vez y verificada por la testnet de QoreChain. Todo se ejecuta en tu propio entorno, con una cuenta de testnet desechable.

## Qué construimos {#what-we-built}

Un proyecto completo de Solidity generado con un solo comando, probado, desplegado en la testnet de QoreChain y, después, una transacción firmada con **dos claves a la vez** y comprobada por la cadena.

Qué demuestra:

- **Firma híbrida.** La transacción lleva una firma clásica secp256k1 y una firma poscuántica ML-DSA-87 (NIST FIPS 204).
- **Una transacción con firma híbrida verificada en la cadena.** Los validadores verifican ambas firmas. Lees la prueba desde el endpoint REST público (la extensión `PQCHybridSignature` y el evento `pqc_hybrid_verify`) y en el explorador.
- **La ventana de autorización EVM.** Una transacción de Ethereum no puede llevar una firma poscuántica, así que en QoreChain registras una sola vez tu clave ML-DSA-87 y abres una ventana corta, con un mensaje de firma híbrida, durante la cual se admiten tus transacciones EVM normales. Consulta [Despliega en 5 minutos](/getting-started/deploy-in-5-minutes) para ver la idea en detalle.

Es exactamente lo que pide el nivel Quantum Pass.

## Requisitos previos {#prerequisites}

Necesitas un ordenador con macOS, Linux o Windows (con WSL), una terminal y un navegador web. Instala primero estas herramientas y comprueba cada versión:

| Herramienta | Versión | Comprobación | Instalación |
| --- | --- | --- | --- |
| Node.js | 22 o posterior (Hardhat 3 lo exige) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 o posterior | `pnpm -v` | `npm install -g pnpm` (o `corepack enable`) |
| curl | cualquiera | `curl --version` | incluido en macOS y Linux |
| jq (opcional) | cualquiera | `jq --version` | [jqlang.org](https://jqlang.org), solo se usa para filtrar la salida en el paso 6 |

También necesitas una cuenta en el panel de QoreChain para usar el faucet (paso 4).

La red y los endpoints públicos que se usan en esta guía:

| Servicio | URL |
| --- | --- |
| Testnet | `qorechain-diana`, ID de cadena EVM 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| JSON-RPC de EVM | `https://evm-testnet.qore.host` |
| Explorador | `https://explore.qore.network` (cambia a Testnet) |
| Faucet | `https://dashboard.qorechain.io/faucet` (requiere iniciar sesión) |

:::caution Solo claves de testnet desechables
Usa claves creadas para este ejercicio, que solo contengan QOR de prueba. Nunca pongas en `.env` la clave ni el código de recuperación de una cuenta que tenga fondos reales, y nunca subas `.env` a git.
:::

## Pasos {#steps}

### Paso 1: Comprueba tus herramientas {#step-1}

1. Abre una terminal.
2. Ejecuta las comprobaciones de la tabla anterior:

```bash
node -v
pnpm -v
```

`node -v` debe mostrar `v22` o superior. Si no es así, instala una versión más reciente de Node.js antes de continuar.

### Paso 2: Genera el proyecto y ejecuta las pruebas {#step-2}

1. Crea el proyecto en una carpeta nueva. El comando `npx` descarga el generador, así que necesita acceso a internet:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Entra en la carpeta y ejecuta las pruebas. Se ejecutan en una cadena local simulada y no envían nada:

```bash
cd qday-demo
pnpm test
```

Deberías ver `Done! Created qday-demo` y, después, `2 passing` de las pruebas.

3. Echa un vistazo a lo que has obtenido: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (el auxiliar de la ventana de autorización) y `hardhat.config.ts` con la red `qorechainTestnet` (ID de cadena 9800). Más sobre las plantillas: [Generadores y CLI](/developer-tools/scaffolders-and-cli) y [Kit de desarrollo de la cadena](/developer-tools/chain-dev-sdk).

### Paso 3: Crea una cuenta de testnet desechable {#step-3}

La cuenta necesita dos secretos: una clave privada al estilo Ethereum y un **código de recuperación** (empieza por `QRC1`) del que se deriva la clave poscuántica ML-DSA-87. El comando siguiente genera ambos con bibliotecas que el proyecto ya instaló y los escribe directamente en un archivo `.env` nuevo, de modo que no se imprime nada en pantalla ni se pega en ningún sitio. Ejecútalo desde dentro de la carpeta `qday-demo`:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

Muestra `.env written`. Notas:

- El comando sustituye el `.env` de ejemplo que creó el generador. Ejecútalo una sola vez. Una nueva ejecución crea una cuenta distinta y una clave poscuántica distinta.
- Deja `.env` tal como está: la misma clave privada y el mismo código de recuperación te dan siempre la misma cuenta. Si pierdes el archivo, empieza de nuevo con una cuenta nueva.
- ¿Prefieres una frase mnemotécnica? Pon `QORE_MNEMONIC="your twelve words"` en `.env` en lugar de las dos líneas anteriores. Con una frase mnemotécnica, ambas claves salen de la misma frase y no hace falta código de recuperación. Usa una frase creada solo para este ejercicio.

Ahora pídele al proyecto la dirección de tu cuenta nueva:

```bash
pnpm window status
```

Deberías ver tres líneas:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

Copia la dirección `qor1...`. Es la que le das al faucet.

### Paso 4: Consigue QOR de testnet en el faucet {#step-4}

1. Abre el [faucet](https://dashboard.qorechain.io/faucet) en tu navegador e inicia sesión.
2. Pega tu dirección `qor1...` (o elige **Use my address** si el panel la conoce).
3. Selecciona **Request Tokens**. La tarjeta muestra **Tokens Sent!** con 100 QOR, además de los tokens de prueba del fest, y un enlace **View on Explorer**.

El faucet paga una vez cada 24 horas por cuenta y por dirección. Las cantidades exactas están en [Faucet](/dashboard/faucet). De vuelta en la terminal, comprueba que la cuenta ya existe en la cadena:

```bash
pnpm window status
```

Ahora la salida responde en lugar de fallar con "does not exist on chain yet".

### Paso 5: Registra tu clave, abre la ventana y despliega {#step-5}

1. Registra tu clave ML-DSA-87. Es un paso único por cuenta, firmado con la clave clásica, como exige la cadena para el registro:

```bash
pnpm window register
```

Muestra `registered: <HASH>`.

2. Abre la ventana de autorización. Esta es en sí misma una transacción de **firma híbrida**:

```bash
pnpm window open
```

Muestra `opened: <HASH>`, y después una línea como `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)`. Anota el hash de `opened:`: lo verificarás en el paso 6.

3. Espera unos 10 segundos. La ventana hizo avanzar el nonce de la cuenta y Hardhat espera confirmaciones.
4. Compila y despliega el contrato:

```bash
pnpm build
pnpm deploy:testnet
```

Responde `y` a "Confirm deploy to network qorechainTestnet (9800)?". Deberías ver `CounterModule#Counter - 0x...`.

### Paso 6: Verifica la firma híbrida en la cadena {#step-6}

La transacción `opened:` del paso 5 se firmó con ambas claves. Sustituye `<HASH>` por ese hash y léela desde el endpoint REST público:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Busca:

1. `tx_response.code` igual a `0`.
2. En el cuerpo de la transacción, la extensión `PQCHybridSignature` con la firma ML-DSA-87: **4.627 bytes**, junto a la firma secp256k1 de 64 bytes.
3. En `tx_response.events`, el evento `pqc_hybrid_verify` con el atributo `status` igual a `verified`. Para imprimir solo ese evento (requiere `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Después míralo en el explorador:

1. Abre [explore.qore.network](https://explore.qore.network).
2. Cambia el selector de red a **Testnet**.
3. Busca el hash. La página de la transacción muestra la seguridad de la firma como resistente a la computación cuántica, verificada en la cadena, con el algoritmo ML-DSA-87 (FIPS 204).

Esa es la prueba: los validadores comprobaron ambas firmas.

## Qué deberías ver {#what-you-should-see}

| Dónde | Qué |
| --- | --- |
| Tras el paso 2 | `Done! Created qday-demo` y `2 passing` |
| Tras el paso 3 | `.env written`, y después una línea `account:` con tus direcciones `0x...` y `qor1...` |
| Tras el paso 4 | **Tokens Sent!** en el faucet y una cuenta existente en `pnpm window status` |
| Tras el paso 5 | `registered: <HASH>`, `opened: <HASH>` y después `CounterModule#Counter - 0x...` |
| Tras el paso 6 | `code` 0, una firma ML-DSA-87 de 4.627 bytes y `pqc_hybrid_verify` con `status` `verified`, en la salida REST y en el explorador en Testnet |

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

El generador también instala el toolbox de Hardhat y los plugins Ignition y keystore que figuran en el `package.json` generado.

## Solución de problemas {#troubleshooting}

| Qué ves | Por qué | Qué hacer |
| --- | --- | --- |
| `HHE10402` o "wait for confirmations" justo después de abrir la ventana | Abrir la ventana hizo avanzar el nonce de la cuenta | Ejecuta `pnpm deploy:testnet` de nuevo |
| "EVM authorisation window exhausted" o "no window" | La ventana se quedó sin transacciones o bloques, o está limitada a otro contrato (una ventana limitada a otro contrato bloquea un despliegue) | Ejecuta `pnpm window open` para abrir una ventana nueva, espera unos 10 segundos y despliega de nuevo |
| "account has no PQC key and classical fallback is disabled" | La cuenta no ha registrado una clave ML-DSA-87 | Ejecuta primero `pnpm window register` y después abre la ventana |
| "does not exist on chain yet" | La cuenta aún no tiene QOR | Consigue QOR en el faucet (paso 4) |
| "Rate Limit Reached" en el faucet, o ningún token tras 30 segundos | Solo se permite un reclamo cada 24 horas por cuenta y por dirección, y las solicitudes se atienden de una en una | Espera unos segundos y reintenta, o espera a que termine el tiempo de espera |
| `pnpm window` se detiene con un mensaje sobre un código de recuperación que falta | `.env` tiene `PRIVATE_KEY` pero no `QORE_PQC_RECOVERY_CODE` | Repite el paso 3, o usa `QORE_MNEMONIC` |
| Hardhat se niega a arrancar | Tu Node.js es anterior a la versión 22 | Instala Node.js 22 o posterior y ejecuta `pnpm install` de nuevo |

## Las aplicaciones de ejemplo {#example-apps}

El mismo flujo, desde varios lenguajes y interfaces. Todas firman de forma híbrida. Todas están en el repositorio público [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), carpeta `workshop-1`. Obtenlo con:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

La página de cada aplicación es una guía completa de principio a fin.

| Aplicación | Lenguaje | Página |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Los kits que hay detrás de estas aplicaciones están en [Kits](/build-before-qday/workshop-1/kits). Para usar la wallet QoreX con una dApp de navegador, consulta [QoreX](/qorex/overview).
