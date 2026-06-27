---
slug: /developer-guide/evm-development
title: Desarrollo EVM
sidebar_label: Desarrollo EVM
sidebar_position: 2
---

# Desarrollo EVM

QoreChain ejecuta un entorno de ejecución totalmente compatible con EVM sobre el QoreChain EVM Engine, lo que te permite desplegar e interactuar con contratos inteligentes en Solidity usando herramientas conocidas. El módulo EVM expone una interfaz JSON-RPC en el **puerto 8545** (WebSocket en el **8546**) que admite los flujos de trabajo estándar de desarrollo de Ethereum.

:::note
Los ejemplos siguientes apuntan a la mainnet **`qorechain-vladi`** (EVM chain ID **9801**), activa desde el 7 de junio de 2026 ejecutando la versión de cadena **v3.1.77**. Para la testnet **`qorechain-diana`**, usa el EVM chain ID **9800**.
:::

---

## Endpoint JSON-RPC

| Propiedad             | Valor                                      |
| -------------------- | ------------------------------------------ |
| URL por defecto       | `http://localhost:8545`                    |
| URL de WebSocket      | `ws://localhost:8546`                      |
| Espacios de nombres admitidos | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Símbolo de la moneda      | `QOR`                                      |

El espacio de nombres `qor_` proporciona métodos específicos de QoreChain. Consulta [Espacio de nombres personalizado](#custom-qor_-namespace) más abajo.

---

## Configuración de la cartera (MetaMask)

Añade QoreChain como red personalizada en MetaMask:

| Campo              | Valor de mainnet             | Valor de testnet           |
| ------------------ | ------------------------- | ----------------------- |
| Nombre de la red       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL de RPC            | `http://localhost:8545`   | `http://localhost:8545` |
| Chain ID           | `9801`                    | `9800`                  |
| Símbolo de la moneda    | `QOR`                     | `QOR`                   |
| URL del explorador de bloques | *(usa el explorador oficial de mainnet)* | *(déjalo en blanco para la testnet local)* |

---

## Hardhat

Instala Hardhat y configura tu `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Despliega un contrato:

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Ejecuta pruebas contra el EVM de QoreChain:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Crea y despliega un contrato con Foundry:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modelo de gas

QoreChain utiliza un modelo de **tarifa base dinámica EIP-1559** para las transacciones EVM:

* La tarifa base se ajusta por bloque según la utilización
* Los usuarios pueden establecer `maxFeePerGas` y `maxPriorityFeePerGas`
* Las tarifas de prioridad van al proponente del bloque

### Puente de denominación

El token nativo QOR tiene **6 posiciones decimales** (`uqor`), mientras que el EVM espera **18 posiciones decimales**. El módulo `x/precisebank` gestiona la conversión de forma transparente:

| Contexto      | Denominación | Decimales | Ejemplo                |
| ------------ | ------------ | -------- | ---------------------- |
| Cadena nativa | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

Esta conversión es transparente: cuando consultas un saldo mediante `eth_getBalance`, la respuesta se expresa en wei de 18 decimales. Cuando se consulta la misma cuenta a través del módulo bank nativo, el saldo aparece en `uqor` de 6 decimales.

---

## Pares de tokens ERC-20

El módulo `x/erc20` proporciona el registro automático de **pares de tokens** entre denominaciones nativas de Cosmos SDK y contratos ERC-20:

* Los tokens nativos pueden usarse dentro de contratos EVM como ERC-20
* Los tokens ERC-20 desplegados en el EVM pueden convertirse a denominaciones nativas
* La conversión es bidireccional y se gestiona a nivel de protocolo

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC y compatibilidad con EVM

Las transacciones EVM utilizan firmas **ECDSA clásicas (secp256k1)** para una compatibilidad total con las herramientas, carteras y bibliotecas existentes de Ethereum. Esto garantiza que MetaMask, Hardhat, Foundry, ethers.js y todas las herramientas estándar de EVM funcionen sin modificaciones.

Para seguridad poscuántica dentro del EVM:

* Usa el **precompilado PQC Verify** (`0x0000...0A01`) para verificar firmas ML-DSA-87 en cadena desde Solidity. Consulta [Precompilados EVM](/developer-guide/evm-precompiles).
* Los **mensajes entre VM** desde el EVM hacia CosmWasm o SVM pueden firmarse con PQC en la capa de transacciones de Cosmos SDK.
* Las cuentas pueden registrar opcionalmente claves públicas PQC mediante `x/pqc` para seguridad híbrida.

---

## Espacio de nombres personalizado `qor_` {#custom-qor_-namespace}

QoreChain amplía el JSON-RPC con un espacio de nombres `qor_` para consultas específicas de la cadena:

| Método                      | Descripción                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Comprueba si una cuenta tiene registrada una clave pública PQC               |
| `qor_getAIStats`            | Recupera estadísticas del motor de IA (recuentos de anomalías, distribución de riesgo) |
| `qor_getCrossVMMessage`     | Consulta el estado de un mensaje entre VM por ID                  |
| `qor_getPoolClassification` | Obtiene la clasificación de pool del validador (RPoS/DPoS/PoS)                 |
| `qor_getReputationScore`    | Consulta la puntuación de reputación de un validador                       |
| `qor_getAbstractAccount`    | Recupera la configuración de cuenta abstracta                   |

Ejemplo con `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Próximos pasos

* [Precompilados EVM](/developer-guide/evm-precompiles) — Accede a funciones de PQC, IA y entre VM desde Solidity
* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) — Llama a contratos CosmWasm y SVM desde el EVM
* [Abstracción de cuentas](/developer-guide/account-abstraction) — Cuentas programables con claves de sesión
