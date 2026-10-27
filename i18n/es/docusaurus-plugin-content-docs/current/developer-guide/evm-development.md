---
slug: /developer-guide/evm-development
title: Desarrollo EVM
sidebar_label: Desarrollo EVM
sidebar_position: 2
---

# Desarrollo EVM

QoreChain ejecuta un entorno de ejecución totalmente compatible con EVM sobre el QoreChain EVM Engine, lo que te permite desplegar e interactuar con contratos inteligentes en Solidity usando herramientas conocidas. El módulo EVM expone una interfaz JSON-RPC en el **puerto 8545** (WebSocket en el **8546**) que admite los flujos de trabajo estándar de desarrollo de Ethereum.

:::note
Los ejemplos siguientes apuntan a la mainnet **`qorechain-vladi`** (EVM chain ID **9801**), activa desde el 7 de junio de 2026, que en el momento de redactar esto ejecuta la versión de nodo **v3.2.4** (aplicada por la propuesta de gobernanza 13 en la altura 3,742,566 el 23 de octubre de 2026; la v3.2.3 se había aplicado en la altura 3,662,051 el 20 de octubre de 2026; la propuesta de gobernanza 14 de la mainnet aplicaría la v3.2.5 en la altura 3,906,833, y lo que cambia esa versión se documentará cuando se aplique). La testnet **`qorechain-diana`** ejecuta la **v3.2.6** (v3.2.4 desde la altura 8,337,253 el 19 de octubre de 2026, v3.2.5 en la altura 8,890,800 el 26 de octubre, v3.2.6 en la altura 8,970,638 el 27 de octubre); usa allí el EVM chain ID **9800**. Donde esta página describe algo que difiere entre las redes (los precompilados de la testnet, los tokens de prueba Fest), lo indica. Los ejemplos de código usan `http://localhost:8545` para un nodo que ejecutas tú mismo; el endpoint público de mainnet es `https://evm.qore.host` y el de testnet es `https://evm-testnet.qore.host`.
:::

:::caution Una transacción EVM necesita una clave PQC registrada y una ventana de autorización abierta
Desde la actualización v3.2.0 (altura 2,981,742 en mainnet, altura 5,920,000 en testnet), el carril EVM admite una transacción solo de una cuenta que tenga **(1) una clave poscuántica ML-DSA-87 registrada** y **(2) una ventana de autorización EVM abierta** que aún tenga espacio para ella. Firmas con herramientas habituales (MetaMask, ethers.js, Hardhat, Foundry), pero sin una clave registrada y una ventana abierta `eth_sendRawTransaction` es rechazada (codespace `pqc`, códigos 26, 27 o 28). Las lecturas, `eth_call` y la estimación de gas no necesitan ninguna de las dos cosas. Consulta [Ventana de autorización EVM](#evm-window) más abajo y la guía paso a paso en [Tu primera transacción](/getting-started/first-transaction#evm-window).

Desde v3.2.2 se aplican dos reglas más en mainnet: **se rechazan las transacciones sin protección (anteriores a EIP-155)**, tanto en el mempool del nodo como en la ejecución de bloques, así que firma con un chain id (todas las carteras y bibliotecas actuales lo hacen); y **las cuentas de módulo no pueden reclamarse a través del EVM**.
:::

---

## Endpoint JSON-RPC

| Propiedad             | Valor                                      |
| -------------------- | ------------------------------------------ |
| URL por defecto       | `http://localhost:8545`                    |
| URL de WebSocket      | `ws://localhost:8546`                      |
| Espacios de nombres admitidos | `eth_`, `web3_`, `net_`, `txpool_` |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Símbolo de la moneda      | `QOR`                                      |

Las lecturas específicas de QoreChain se sirven por REST (`api.qore.host`); el espacio de nombres JSON-RPC `qor_` descrito [más abajo](#custom-qor_-namespace) **no está habilitado** en los endpoints públicos ni en la configuración predeterminada del nodo. La lista `api` predeterminada de un nodo recién inicializado (v3.2.3 y posteriores) es `eth,net,web3`; `txpool` es opcional, porque publica las transacciones pendientes del nodo.

Desde la versión de nodo v3.2.4 (mainnet desde el 23 de octubre de 2026, testnet desde el 19 de octubre de 2026), un nodo acota su propio servidor JSON-RPC: se rechazan los cuerpos de solicitud de más de 256 KiB (HTTP 413), no se atienden más de 256 solicitudes a la vez (HTTP 503 por encima de ese límite), y se rechaza un filtro de `eth_getLogs` o `eth_newFilter` con más de 4 posiciones de topics, 1000 alternativas en una posición o 1000 direcciones. Los límites son ajustes locales del nodo en la sección `[json-rpc]` de `app.toml`; consulta [Operar un Nodo](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Configuración de la cartera (MetaMask)

Añade QoreChain como red personalizada en MetaMask:

| Campo              | Valor de mainnet             | Valor de testnet           |
| ------------------ | ------------------------- | ----------------------- |
| Nombre de la red       | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL de RPC            | `https://evm.qore.host`   | `https://evm-testnet.qore.host` |
| Chain ID           | `9801`                    | `9800`                  |
| Símbolo de la moneda    | `QOR`                     | `QOR`                   |
| URL del explorador de bloques | `https://explore.qore.network` | *(opcional)* |

Enviar desde MetaMask requiere además una clave PQC registrada y una [ventana de autorización EVM](#evm-window) abierta en la cuenta.

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

Despliega un contrato (la cuenta que despliega necesita una clave PQC registrada y una [ventana de autorización](#evm-window) abierta; un despliegue cuenta como una transacción EVM dentro de la ventana):

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

## Pares de tokens ERC-20 {#erc20-token-pairs}

El módulo `x/erc20` proporciona **pares de tokens** entre denominaciones nativas de Cosmos SDK y contratos ERC-20:

* Los tokens nativos pueden usarse dentro de contratos EVM como ERC-20
* Los tokens ERC-20 desplegados en el EVM pueden convertirse a denominaciones nativas
* La conversión es bidireccional y se gestiona a nivel de protocolo

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Estas son transacciones del carril Cosmos: en las redes en vivo también necesitan la cofirma híbrida poscuántica (constrúyelas con `--generate-only` y luego `qorechaind tx pqc cosign`; consulta [Firma poscuántica](/developer-guide/post-quantum-signing)). El comando simple `convert-erc20` anterior se rechaza en la versión de nodo v3.2.6 porque la CLI escribe un remitente `0x`; consulta [Convertir entre las dos formas](#fest-convert) para la forma que funciona. Los pares de tokens se registran bajo una política con permisos (los registra la gobernanza). En el momento de redactar esto no existe ninguno en mainnet; la testnet tiene los tokens de prueba Fest en [la sección siguiente](#fest-tokens).

## Tokens de prueba Fest y conversión ERC20 {#fest-tokens}

:::note Solo testnet, sin valor
Los tokens de esta sección existen solo en la testnet `qorechain-diana` (EVM chain ID 9800). Son tokens de prueba para builders y no tienen valor. La mainnet no tiene ningún par de tokens ERC-20 (comprobado el 27 de octubre de 2026), así que ninguna de las denominaciones siguientes existe allí.
:::

El 27 de octubre de 2026 la gobernanza de la testnet (propuesta 26) registró tres contratos ERC-20 como pares de tokens. Dan a los builders un segundo token para emparejar con QOR en un [pool AMM](/api-reference/rest-grpc-endpoints#amm-module):

| Token | Contrato ERC-20 (EIP-55) | Decimales | Denominación bank |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **La denominación bank es `erc20:<address>` con dos puntos, y la dirección debe estar en la grafía exacta EIP-55 con mayúsculas y minúsculas que se muestra.** Las denominaciones distinguen mayúsculas de minúsculas: `erc20:0x97143b771d34...` (en minúsculas) es una cadena distinta, y una consulta por ella responde `404`. Copia la denominación de `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, que lista los tres tokens con su `symbol` (`fUSD`, `fETH`, `fBTC`), su nombre `display` (`FestUSD`, `FestETH`, `FestBTC`) y sus decimales.
* **El faucet paga monedas bank.** Para usar un token Fest desde EVM (MetaMask, Solidity), convierte primero la moneda bank a su forma ERC-20 con `MsgConvertCoin`; para devolver un saldo ERC-20 a la forma bank (por ejemplo para emparejarlo en el AMM), usa `MsgConvertERC20`. Ambos se describen a continuación.
* **Los tokens existen en dos formas.** Un saldo ERC-20 se lee con el `balanceOf` del contrato por JSON-RPC de EVM; el saldo convertido es una moneda bank, que se lee con `GET /cosmos/bank/v1beta1/balances/{address}`. Solo la forma de moneda bank puede emparejarse en el AMM. Convertir mueve valor entre las dos formas; no lo crea.
* **Los importes usan los decimales propios del token** (6, 18 y 8 para fUSD, fETH y fBTC), no los 6 decimales de `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Convertir entre las dos formas {#fest-convert}

Ambos mensajes de conversión son transacciones del carril Cosmos: necesitan tu clave poscuántica registrada y la cofirma híbrida, como cualquier otra transacción nativa (constrúyela y luego `qorechaind tx pqc cosign`; consulta [Firma poscuántica](/developer-guide/post-quantum-signing)). Las comisiones deben ser al menos gas × 0.1 uqor.

:::note Qué se ha ejecutado
Las lecturas REST de esta página (`token_pairs`, `denoms_metadata`) se ejecutaron contra la testnet el 27 de octubre de 2026. Los dos comandos de conversión que siguen **no** se ejecutaron de extremo a extremo para esta página: la forma de sus mensajes y la regla del remitente proceden del código fuente del nodo v3.2.6 y de la referencia del equipo de la cadena. Trátalos como la forma documentada y confírmalos primero con una cantidad pequeña.
:::

**Moneda bank a ERC-20: `MsgConvertCoin`.** El `coin` es la denominación bank exacta, que distingue mayúsculas de minúsculas (`erc20:<EIP-55 address>`), el `sender` es tu dirección `qor1...` (quien firma) y el `receiver` es una dirección `0x...` que mantendrá el ERC-20. Usa unos 432,000 de gas; fija un límite de gas de 600,000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20 a moneda bank: `MsgConvertERC20`.** Su campo `sender` también debe ser la dirección bech32 `qor1...` de la cuenta. Un remitente `0x` se rechaza con `decoding bech32 failed`. En la versión de nodo v3.2.6 el comando de la CLI `qorechaind tx erc20 convert-erc20` (el ejemplo simple de [Pares de tokens ERC-20](#erc20-token-pairs)) escribe el remitente en forma `0x`, por lo que se rechaza por ese motivo: no lo uses. Construye el mensaje tú mismo con la dirección `qor1` como remitente, del mismo modo que arriba:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Aquí `receiver` es la cuenta `qor1...` que recibe la moneda bank (el módulo acepta la forma bech32 para el receptor de una conversión a moneda bank). El importe está en las unidades base propias del token (6, 18 u 8 decimales). Copia la denominación para `MsgConvertCoin` solo de `denoms_metadata`; la forma en minúsculas se rechaza con `token pair not found`.

---

## PQC y compatibilidad con EVM

Las transacciones EVM se firman con **ECDSA clásico (secp256k1)**, de modo que MetaMask, Hardhat, Foundry, ethers.js y otras herramientas estándar las construyen y firman sin modificaciones. Lo que cambió en la **v3.2.0** es la *admisión*: una transacción solo se acepta si su remitente tiene una clave poscuántica registrada y una ventana de autorización vigente (siguiente sección). Registrar una clave y abrir una ventana son transacciones del carril Cosmos y necesitan la firma híbrida (ML-DSA-87 + secp256k1).

Para seguridad poscuántica dentro de los contratos:

* El **precompilado PQC Verify** (`0x0000...0A01`) verifica firmas ML-DSA-87 en cadena desde Solidity. Está **activo en la testnet** (activado por la propuesta de gobernanza 21, aprobada el 27 de octubre de 2026) y **no está activo en mainnet** en el momento de redactar esto. Consulta [Precompilados EVM: estado de la red](/developer-guide/evm-precompiles#network-status).
* Los **mensajes entre VM** desde el EVM hacia QoreChain Native o SVM son transacciones del carril Cosmos y llevan la firma híbrida como cualquier otra; consulta [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) para ver su disponibilidad actual.

---

## Ventana de autorización EVM {#evm-window}

Una firma poscuántica no puede viajar *con* una transacción de Ethereum (carteras como MetaMask no pueden adjuntar una segunda firma), así que viaja *antes* que ella. La cuenta abre una ventana acotada con el mensaje del carril Cosmos `MsgOpenEVMWindow`; el carril EVM admite entonces solo las transacciones cubiertas por una ventana vigente. Una clave clásica robada por sí sola no puede abrir una ventana, de modo que solo puede mover lo que permita una ventana ya abierta.

| Límite      | Rango              | Significado |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Cuánto tiempo permanece abierta la ventana, contado en bloques desde el bloque que la abre |
| `max-txs`   | 1 – 1,000          | Cuántas transacciones EVM admite |
| `max-value` | mayor que 0, en `uqor` | Salida total que admite: el valor transferido **más** la comisión máxima que podría pagar cada transacción (límite de gas × comisión máxima por gas), convertido a `uqor` y redondeado hacia arriba |

El límite que se agote primero cierra la ventana. Los tres límites son obligatorios; abrir una ventana sustituye a la existente; una transacción que se admite y luego falla consume igualmente su hueco y su presupuesto de valor; los despliegues de contratos cuentan como cualquier otra transacción. `blocks` es un número de bloques, no una duración: 17,280 bloques son unas 15 horas en mainnet (unos 3.2 s por bloque) y unas 6 horas en testnet (unos 1.3 s por bloque el 27 de octubre de 2026; el tiempo de bloque de la testnet varía).

**El límite de valor cuenta solo QOR nativo.** Una transferencia de tokens, una aprobación o cualquier otra llamada a un contrato lleva valor cero, así que no se cuenta contra `max-value` (solo su comisión máxima). Para acotar también esas operaciones, restringe el **alcance** de la ventana (mainnet v3.2.3 y posteriores):

| Opción de alcance (flag de la CLI) | Campo del mensaje | Qué admite la ventana |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Solo transferencias simples de QOR nativo: sin calldata, sin creación de contratos, sin destinatario que contenga código, sin autorización EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Solo transacciones cuyo destinatario sea una de las direcciones de 20 bytes listadas; se rechaza la creación de contratos |

Una ventana abierta sin alcance se comporta exactamente como antes. Una transacción fuera del alcance se rechaza con el código 27 (el mensaje dice que la ventana "does not admit this transaction"). `GET /qorechain/pqc/v1/evm_window/{address}` y `qorechaind query pqc evm-window` reportan `native_only` y `allowed_targets`, y el evento `pqc_evm_window_opened` los incluye cuando están establecidos.

**Pasos** (el recorrido completo está en [Tu primera transacción](/getting-started/first-transaction#evm-window)):

1. Registra tu clave ML-DSA-87 una sola vez (`tx pqc register-key-v2` o `register-key`, con `--gas 600000 --fees 60000uqor`; esta única transacción está exenta del requisito híbrido, de modo que una cuenta nueva puede arrancar). Consulta [Firma poscuántica](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Abre una ventana. Es una transacción del carril Cosmos, así que produce la transacción sin firmar y cofírmala con tu clave ML-DSA (`max-value` acepta `uqor` o `qor`; `1000qor` son 1,000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Comprueba lo que queda: `qorechaind query pqc evm-window <address>` o `GET /qorechain/pqc/v1/evm_window/{address}` (responde `found: false` cuando no hay ninguna).
4. Envía tus transacciones EVM con normalidad. Abrir una ventana es una transacción del carril Cosmos y avanza el número de secuencia de la cuenta, que es también su nonce EVM, así que lee el nonce **después** de que la ventana esté abierta y firma entonces.

Cierra una ventana antes de tiempo con `qorechaind tx pqc close-evm-window` (mismo patrón de `--generate-only` y `cosign`), por ejemplo si sospechas que la clave clásica está expuesta: lo que la ventana aún admitía se rechaza a partir del siguiente bloque.

### Delegaciones EIP-7702 {#eip-7702}

Desde v3.2.2, una delegación EIP-7702 de tu cuenta (una transacción de tipo 4) solo surte efecto con el consentimiento poscuántico de tu propia cuenta. Registra primero el consentimiento con el mensaje del carril Cosmos `MsgAuthorizeEVMDelegation`, firmado de forma híbrida (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); es de un solo uso, caduca tras el número de bloques indicado y lo revoca `close-evm-window`. El valor que sale de una cuenta delegada se carga a la ventana de **esa** cuenta, una transacción de tipo 4 fallida conserva las autorizaciones que aplicó, y `qorechaind tx pqc clear-evm-delegation` elimina una delegación. Una delegación rechazada responde con los códigos 60 a 63. Lee el consentimiento con `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Rechazo (codespace `pqc`) | Significado |
| ------------------------- | ------- |
| código 26 | No hay ventana abierta para el remitente, o el remitente no tiene clave PQC registrada |
| código 27 | La ventana ha caducado o se ha agotado (el mensaje indica qué límite), o la transacción está fuera del alcance de la ventana |
| código 28 | Límites de ventana no válidos al abrirla, o no hay clave registrada en ese momento |

Con el SDK de TypeScript (0.8.2 y posteriores): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` y `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). El SDK 0.9.0 añade las opciones de alcance (`nativeOnly`, `allowedTargets`) a `openEvmWindowMsg` y los constructores del consentimiento EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); las versiones anteriores a la 0.9.0 construyen solo la ventana sin alcance, así que usa `qorechaind` para el resto (consulta la [guía EVM del SDK](/sdk/guides/evm#evm-window-scope)).

---

## Espacio de nombres personalizado `qor_` {#custom-qor_-namespace}

QoreChain amplía el JSON-RPC con un espacio de nombres `qor_` para consultas específicas de la cadena:

:::warning Todavía no se sirve
Ninguna compilación publicada del nodo sirve aún el espacio de nombres `qor_`: `rpc_modules` en los endpoints públicos lista solo `eth`, `net`, `rpc`, `txpool` y `web3`, y todos los métodos siguientes devuelven `-32601` (método no encontrado) en mainnet, testnet y nodos propios con la configuración predeterminada (`eth`, `net`, `web3`). Consulta [el espacio de nombres `qor_`](/api-reference/json-rpc-qor_-namespace) para ver el estado y las alternativas REST (por ejemplo `GET /qorechain/pqc/v1/account/{address}` para el estado de la clave PQC).
:::

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

* [Precompilados EVM](/developer-guide/evm-precompiles) — Referencia de las interfaces de precompilados de QoreChain (tres activas en la testnet, ninguna en mainnet)
* [Interoperabilidad entre VM](/developer-guide/cross-vm-interoperability) — Llamadas entre VM y su disponibilidad actual
* [Abstracción de cuentas](/developer-guide/account-abstraction) — Autenticadores de carteras vinculadas y reglas de gasto (activado en la testnet, desactivado en mainnet)
