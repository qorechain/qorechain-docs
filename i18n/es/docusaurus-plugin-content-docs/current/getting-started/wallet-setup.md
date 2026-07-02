---
slug: /getting-started/wallet-setup
title: Configuración de Billetera
sidebar_label: Configuración de Billetera
sidebar_position: 2
---

# Configuración de Billetera

QoreChain admite múltiples tipos de billeteras en sus entornos de ejecución nativo, EVM y SVM. Elige la billetera que se ajuste a tu caso de uso.

:::note
Los valores a continuación cubren tanto la mainnet **`qorechain-vladi`** (chain ID EVM **9801**, en vivo desde el 7 de junio de 2026) como la testnet **`qorechain-diana`** (chain ID EVM **9800**). Los endpoints públicos de ambas redes están listados en [Redes](/appendix/networks#public-endpoints).
:::

## Billetera Keplr

Keplr es la billetera recomendada para transacciones nativas de QoreChain, staking y gobernanza.

### Agregar QoreChain como Cadena Personalizada

Abre Keplr y navega a **Settings > Add Custom Chain**, luego introduce:

| Campo                  | Mainnet                    | Testnet                          |
| ---------------------- | -------------------------- | -------------------------------- |
| Nombre de la cadena    | `QoreChain`                | `QoreChain Diana Testnet`        |
| Chain ID               | `qorechain-vladi`          | `qorechain-diana`                |
| URL RPC                | `https://rpc.qore.host`    | `https://rpc-testnet.qore.host`  |
| URL REST               | `https://api.qore.host`    | `https://api-testnet.qore.host`  |
| Prefijo Bech32         | `qor`                      | `qor`                            |
| Denominación de moneda | `QOR`                      | `QOR`                            |
| Denominación mínima    | `uqor`                     | `uqor`                           |
| Decimales              | `6`                        | `6`                              |
| Coin Type (BIP-44)     | `118`                      | `118`                            |

Después de agregar la cadena, Keplr genera una dirección `qor1...` para tu cuenta.

:::caution Precio mínimo de gas
El precio mínimo de gas de la red es **0.1uqor**. Si configuras los niveles de precio de gas de Keplr (p. ej. mediante `suggestChain`), usa valores **iguales o superiores a 0.1** (bajo/medio/alto sugeridos: `0.1 / 0.15 / 0.25`) — las transacciones firmadas por debajo del mínimo son rechazadas.
:::

## MetaMask (EVM)

MetaMask permite interactuar con el entorno de ejecución EVM de QoreChain — desplegar contratos Solidity, gestionar tokens ERC-20 y usar las herramientas habituales de Ethereum.

### Agregar QoreChain como Red Personalizada

Abre MetaMask y navega a **Settings > Networks > Add Network**, luego introduce:

| Campo                       | Mainnet                   | Testnet                          |
| --------------------------- | ------------------------- | -------------------------------- |
| Nombre de la red            | `QoreChain`               | `QoreChain Diana Testnet`        |
| URL RPC                     | `https://evm.qore.host`   | `https://evm-testnet.qore.host`  |
| Chain ID                    | `9801`                    | `9800`                           |
| Símbolo de moneda           | `QOR`                     | `QOR`                            |
| URL del explorador de bloques | `https://explore.qore.network` | `https://explore.qore.network` |

El QOR nativo tiene **18 decimales** en la interfaz EVM (estilo wei). Una vez conectado, puedes usar MetaMask para firmar transacciones EVM, interactuar con contratos inteligentes desplegados y gestionar tokens ERC-20 en QoreChain.

### Registro de red en una sola llamada

Para dApps, los paquetes **`@qorechain/wallet-adapter`** y **`@qorechain/connect`** (publicados en npm) registran QoreChain en la billetera del usuario en una sola llamada — solicitando a MetaMask agregar la red mediante EIP-3085 (con el QOR nativo de **18 decimales** correcto en el rail EVM) y configurando los niveles de precio de gas de Keplr:

```bash
npm install @qorechain/wallet-adapter @qorechain/connect
```

```ts
import { addQoreEvmToWallet } from "@qorechain/wallet-adapter";

await addQoreEvmToWallet(); // prompts MetaMask with QoreChain's EVM network params
```

## Billeteras Solana (SVM)

El entorno de ejecución SVM de QoreChain es compatible con las herramientas estándar de Solana, y el **saldo de QOR nativo de la cuenta es visible directamente en la interfaz SVM** (en lamports, 9 decimales; 1 uqor = 1,000 lamports). Conecta cualquier billetera o biblioteca compatible con Solana.

### Usando @solana/web3.js

```javascript
import { Connection } from "@solana/web3.js";

// Public read-only endpoint (or http://localhost:8899 on your own node)
const connection = new Connection("https://svm.qore.host");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
```

Los endpoints SVM públicos son de **solo lectura**; el envío de transacciones requiere tu propio nodo. Consulta [Desarrollo SVM](/developer-guide/svm-development) para más detalles.

## Billeteras con PQC (Obligatorio en la Ruta Cosmos)

QoreChain requiere criptografía post-cuántica (PQC) híbrida en la ruta de transacciones cosmos. A partir de la versión actual de la cadena (**v3.1.82**), el valor por defecto de la red es `hybrid_signature_mode = required` con `allow_classical_fallback = false` — por lo que **toda transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto a la firma secp256k1 (ECDSA) estándar**. Las transacciones cosmos solo clásicas provenientes de una cuenta PQC son rechazadas.

:::caution Las transacciones cosmos requieren la extensión PQC híbrida
Enviar una transacción clásica simple en la ruta cosmos será rechazado. Debes adjuntar la firma Dilithium-5 como una extensión de transacción `PQCHybridSignature`. Las herramientas estándar de CosmJS / Keplr no producen esta extensión por sí solas — usa el comando CLI `qorechaind tx pqc cosign`, la firma híbrida del SDK de QoreChain (ver más abajo) o, para construirla tú mismo en código, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`). Las únicas exenciones son los gentxs de génesis y las transacciones de registro/migración de claves PQC.
:::

### Cómo Funciona

Las billeteras adjuntan una firma PQC ML-DSA-87 como extensión de transacción junto a la firma secp256k1 (ECDSA) estándar. La firma clásica se calcula sobre bytes de firma que excluyen la extensión, por lo que sigue siendo válida para la verificación clásica mientras la firma PQC proporciona resistencia cuántica.

### Generar una Clave Dilithium-5

Genera una clave post-cuántica para la firma híbrida:

```bash
qorechaind tx pqc gen-key
```

### Registro Automático

Cuando incluyes una clave pública PQC en tu primera transacción, QoreChain la registra automáticamente en la cadena. No se necesita un paso de registro separado. (Las transacciones de registro/migración de claves PQC están a su vez exentas del requisito híbrido, por lo que una cuenta puede inicializar su primera clave.)

### Firma Híbrida con el SDK

El SDK de QoreChain produce transacciones cosmos conformes mediante `buildHybridTx` con `includePqcPublicKey: true`, que adjunta la extensión Dilithium-5 e incorpora la clave pública para el registro automático. Consulta [Cuentas del SDK y firma PQC](/sdk/concepts/accounts-pqc).

### Modos PQC

Los tres modos de aplicación siguen estando controlados por gobernanza; el **valor por defecto actual de la red es Required**:

| Modo                       | Descripción                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Disabled**               | La verificación PQC está desactivada. Solo firmas estándar.                       |
| **Optional**               | Las transacciones pueden incluir firmas PQC. Si están presentes, se verifican.    |
| **Required** (por defecto) | Todas las transacciones de la ruta cosmos deben incluir una firma PQC válida.     |

El modo activo se configura a nivel de cadena y puede actualizarse mediante gobernanza.

:::note EVM / MetaMask no se ve afectado
El flujo de MetaMask (EVM) descrito arriba **no** se ve afectado por el requisito híbrido. Las transacciones EVM usan una ruta ante `eth_secp256k1` separada y nunca necesitan la extensión PQC.
:::

## Billetera CLI

El binario `qorechaind` incluye un sistema integrado de gestión de claves para uso desde la línea de comandos.

### Crear una Nueva Clave

```bash
qorechaind keys add mykey
```

Esto genera un nuevo par de claves y muestra la frase mnemónica. **Guarda la frase mnemónica de forma segura** — es la única manera de recuperar esta clave.

### Ver Tu Dirección

```bash
qorechaind keys show mykey -a
```

Esto muestra tu dirección bech32 `qor1...`.

### Listar Todas las Claves

```bash
qorechaind keys list
```

### Importar una Clave Existente

```bash
qorechaind keys add mykey --recover
```

Se te pedirá que introduzcas tu frase mnemónica.

## Próximos Pasos

* [Tu Primera Transacción](/getting-started/first-transaction) — Envía tokens QOR usando tu nueva billetera
* [Conexión a la Testnet](/getting-started/connecting-to-testnet) — Únete a la testnet Diana en vivo
