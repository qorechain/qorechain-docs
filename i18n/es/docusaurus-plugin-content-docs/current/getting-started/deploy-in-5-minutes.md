---
slug: /getting-started/deploy-in-5-minutes
title: Despliega en QoreChain en 5 Minutos
sidebar_label: Despliega en 5 Minutos
sidebar_position: 6
---

# Despliega en QoreChain en 5 Minutos

Esta página es para un desarrollador de Solidity que nunca ha usado QoreChain. Sigues con Foundry o Hardhat y con la misma frase de recuperación que usas en MetaMask. Lo único nuevo es una breve **ventana de autorización**: QoreChain protege cada cuenta con una clave post-cuántica, una transacción de Ethereum no puede llevarla, así que primero abres una ventana acotada y tus transacciones EVM normales se admiten mientras está abierta. Los pasos siguientes usan la **testnet** (`qorechain-diana`, chain ID EVM 9800), donde nada cuesta dinero real.

:::note
Este camino se ejecutó en la testnet: se abrió una ventana en QoreX y después se creó y se llamó a un contrato con Foundry `cast` desde la misma frase de recuperación. `forge create` y Hardhat envían el mismo tipo de transacción EVM, pero no formaron parte de esa prueba. También está confirmada una ventana abierta desde la línea de comandos de `qorechaind`; consulta [Alternativa: la línea de comandos](#cli).
:::

## Lo que necesitas {#what-you-need}

- La frase de recuperación de la cuenta desde la que quieras desplegar. QoreX no puede importar una clave privada en bruto. Si solo tienes una clave privada, usa en su lugar la [línea de comandos](#cli).
- [QoreX](/qorex/overview), el monedero de QoreChain (aplicación o extensión del navegador).
- Foundry o Hardhat ya instalado.

## 1. Añade una cuenta coin 60 a QoreX {#step-import}

El carril EVM solo funciona con una clave `eth_secp256k1` (coin type 60). Una clave estándar secp256k1 de Cosmos (coin type 118, el valor por defecto de QoreX) no puede firmar para su dirección EVM, así que una ventana abierta en una cuenta coin 118 no sirve de nada para las herramientas EVM. Necesitas una **cuenta de Ethereum (coin 60)**. En QoreX abre **Your accounts** y toca **Add an Ethereum account (coin 60)**. QoreX la deriva de la **propia frase de recuperación** del monedero con la ruta de Ethereum `m/44'/60'`. Su dirección `0x…` coincide con la de MetaMask o Foundry solo cuando estos usan esa misma frase (para Foundry, ruta de derivación `m/44'/60'/0'/0/0`, índice 0). Si tu cuenta de MetaMask proviene de otra frase, QoreX muestra una dirección distinta, y una ventana abierta allí no cubre la clave con la que despliegas. La dirección `0x…` es la misma clave que una dirección `qor1…` en QoreChain.

La cuenta tiene su propia dirección, así que fóndala y selecciónala en QoreX antes de los pasos siguientes. Consulta [Restaurar una frase de MetaMask o del Dashboard](/qorex/getting-started#restore-dashboard).

:::caution Nunca pegues una frase de producción en herramientas de desarrollo
Usa una frase de recuperación creada para pruebas, solo con QOR de prueba. No escribas en Foundry, Hardhat ni en un script la frase de una cuenta que tenga fondos reales.
:::

## 2. Cambia QoreX a la testnet {#step-testnet}

- **Aplicación:** Ajustes → **Use testnet (developers)**.
- **Extensión del navegador:** desbloquéala, toca siete veces el número de versión de la parte inferior y elige **Switch to testnet (diana)**.

La insignia de red en Inicio cambia a TESTNET.

## 3. Consigue QOR de testnet {#step-faucet}

Solicita QOR de testnet para tu dirección `0x…` o `qor1…` en el [Faucet del Dashboard](/dashboard/faucet). Es el mismo saldo en ambas formas de la dirección.

## 4. Abre la ventana EVM en QoreX {#step-window}

- **Extensión y aplicación:** la tarjeta titulada **MetaMask on QoreChain** (con una marca **0x**) en la ventana emergente principal o en Inicio. Abre la pantalla **Ventana de acceso EVM**.
- **Aplicación:** también Ajustes → Seguridad → **Ventana de acceso EVM**.

Si esta cuenta aún no tiene una clave post-cuántica, QoreX la registra por ti en este paso. El registro cuesta 0,09 QOR, una sola vez por cuenta, y la transacción de la ventana paga además su propia comisión de red. Después eliges tres límites:

| Campo | Rango | Valor por defecto de QoreX |
|---|---|---|
| Bloques (cuánto tiempo permanece abierta la ventana) | 1 a 17.280 | 300 |
| Máximo de transacciones | 1 a 1.000 | 5 |
| Tope de gasto, en QOR | mayor que 0 | 1 |

El tope de gasto cuenta el valor de cada transacción **más su comisión máxima** (límite de gas por el tope de comisión), no solo lo que transfiere. Un despliegue de contrato no mueve QOR pero aun así cuenta su comisión máxima: un despliegue de 3.000.000 de gas enviado por Hardhat cuenta unos 0,64 QOR.

Para una sesión de despliegue los valores por defecto se quedan cortos. Una elección razonable es 3.000 bloques (aproximadamente una hora en la testnet), 20 transacciones y un tope de 10 QOR. Mantenlos tan pequeños como permita tu sesión y cierra la ventana cuando termines.

:::caution Abre la ventana primero
Abrir una ventana avanza el nonce de la cuenta. Ábrela **antes** de desplegar: una transacción firmada antes se rechaza con "nonce too low".
:::

## 5. Despliega con Foundry o Hardhat {#step-deploy}

Usa la clave de la **misma cuenta coin 60 con fondos**. QoreX no puede actuar como firmante de Foundry, así que dale a Foundry o a Hardhat la clave de la misma frase de recuperación, por ejemplo `--mnemonic` con el índice 0 en Foundry. La configuración de red:

| Ajuste | Valor |
|---|---|
| URL RPC | `https://evm-testnet.qore.host` |
| Chain ID | `9800` |
| Moneda | QOR, 18 decimales |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Cada transacción que envías (despliegue o llamada) usa una de las transacciones de la ventana. Las lecturas (`cast call`, funciones view, estimación de gas) no necesitan ventana y no consumen nada de ella.

## Comprueba la ventana y gestiona su caducidad {#check-and-expiry}

Una ventana **caduca**: cuando se agotan sus bloques, sus transacciones o su tope de gasto, la vía EVM rechaza tu siguiente transacción con `no open EVM authorisation window` o `EVM authorisation window exhausted`. Abre una nueva en QoreX; una ventana nueva reemplaza a la anterior.

Para ver su estado, usa la pestaña **PQ key status** de [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (consulta [Desarrolladores](/dashboard/developers)), o la ruta REST:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` con `remaining_blocks`, `remaining_txs` y `remaining_value` (en `uqor`) significa que está abierta.

## Alternativa: la línea de comandos {#cli}

Con el binario de la versión oficial de `qorechaind` puedes importar una clave privada en bruto, registrar su clave post-cuántica y abrir la ventana sin QoreX. Esta es la vía para un desarrollador que solo tiene una clave privada. `gen-key` y `cosign` no están en una compilación de la comunidad, así que esto requiere el binario de la versión oficial. Las reglas de la ventana están en la sección [Ventana de autorización EVM](/developer-guide/evm-development#evm-window) de [Desarrollo EVM](/developer-guide/evm-development). Una ventana abierta así, seguida de una transacción enviada con `cast`, está confirmada en la testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

No estreches una ventana de despliegue con `--native-only` ni con `--allowed-targets`: ambos rechazan la creación de contratos. Son para sesiones posteriores, una vez que el contrato existe.

## Qué es distinto en la testnet {#diana-notes}

- **CosmWasm** solo acepta códigos aprobados por gobernanza en la testnet, así que no puedes subir tu propio contrato allí. Solidity es el camino abierto.
- **SVM** no está disponible.
- La mainnet funciona de la misma manera con el chain ID 9801 y `https://evm.qore.host`, pero empieza en la testnet.

## Errores comunes {#errors}

| Mensaje | Causa | Solución |
|---|---|---|
| `account ... has no registered post-quantum key` | la cuenta no tiene clave ML-DSA-87 | abre una ventana en QoreX, que la registra, o regístrala desde la línea de comandos |
| `no open EVM authorisation window` | no hay ventana, o caducó | abre una ventana |
| `EVM authorisation window exhausted` | se agotaron las transacciones o el tope de gasto | abre una ventana nueva con límites mayores |
| `nonce too low` | la ventana se abrió después de que firmaras | abre primero la ventana y luego envía |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | una transacción firmada sin chain ID | define `chainId` en la configuración de tu red |

Siguiente: [Desarrollo EVM](/developer-guide/evm-development), [Seguridad y recuperación de QoreX](/qorex/security-and-recovery#evm-window), [Desarrolladores](/dashboard/developers).
