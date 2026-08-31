---
slug: /getting-started/first-transaction
title: Primera Transacción
sidebar_label: Primera Transacción
sidebar_position: 5
---

# Primera Transacción

Esta guía explica cómo enviar tokens QOR, consultar transacciones e interactuar con QoreChain a través de sus interfaces nativa, EVM y SVM.

:::note
Los comandos siguientes usan la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) está en vivo desde el 7 de junio de 2026 — sustituye el chain ID y los endpoints de mainnet indicados en la página **Conexión a Mainnet** al operar en mainnet.
:::

## Consultar tu Saldo

Antes de enviar tokens, verifica el saldo de tu cuenta:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La respuesta incluye todas las denominaciones de tokens que posee la cuenta. Los saldos de QOR se muestran en `uqor` (micro-QOR), donde **1 QOR = 1.000.000 uqor**.

## Enviar QOR

Transfiere tokens desde tu clave a otra dirección:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Esto envía **1 QOR** (1.000.000 uqor) a la dirección de destino, pagando una comisión de 500 uqor.

:::caution Las transferencias en Cosmos requieren una firma híbrida PQC
En la vía cosmos, el valor por defecto de la red es `hybrid_signature_mode = required` (versión actual de la cadena **v3.1.95**). Un `tx bank send` clásico sin más es **rechazado** — toda transacción de la vía cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma secp256k1. Genera una clave Dilithium-5 con `qorechaind tx pqc gen-key`, y luego adjunta la cofirma híbrida con `qorechaind tx pqc cosign` (o construye la transacción con `buildHybridTx` del SDK de QoreChain, usando `includePqcPublicKey` para que la clave se registre automáticamente en el primer uso). Para producir la firma híbrida fuera de la CLI, la librería de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) y el SDK de QoreChain hacen lo equivalente en código. Consulta [Configuración de la Wallet](/getting-started/wallet-setup) para ver el flujo híbrido completo.
:::

Se te pedirá que confirmes la transacción antes de que sea difundida. Una vez confirmada, la CLI devuelve un hash de transacción.

## Consultar una Transacción

Busca una transacción completada por su hash:

```bash
qorechaind query tx <txhash>
```

La salida incluye el estado de la transacción, el gas consumido, la altura del bloque y todos los eventos emitidos durante la ejecución.

Para obtener la salida en JSON:

```bash
qorechaind query tx <txhash> --output json
```

## Usando JSON-RPC (EVM)

El entorno de ejecución EVM de QoreChain expone una interfaz JSON-RPC estándar de Ethereum en el puerto `8545`.

:::note
Las transacciones EVM **no se ven afectadas** por el requisito de PQC híbrido de la vía cosmos. Usan una vía ante separada `eth_secp256k1`, por lo que la firma estándar de Ethereum (MetaMask, ethers.js, etc.) funciona sin necesidad de una extensión PQC.
:::

### Obtener el Número del Último Bloque

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Consultar el Saldo de una Cuenta

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

El saldo se devuelve como un valor en hexadecimal en la denominación más pequeña.

## Usando SVM RPC

El entorno de ejecución SVM de QoreChain expone una interfaz RPC compatible con Solana en el puerto `8899`.

### Obtener el Slot Actual

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Consultar el Saldo de una Cuenta

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Patrones Comunes de la CLI

Al trabajar con la CLI `qorechaind`, estas flags se usan con frecuencia:

| Flag                | Descripción                          | Ejemplo                        |
| ------------------- | ------------------------------------- | ------------------------------ |
| `--chain-id`        | Especifica la cadena de destino       | `--chain-id qorechain-diana`   |
| `--fees`            | Comisión de la transacción en uqor    | `--fees 500uqor`               |
| `--from`            | Nombre de la clave o dirección firmante | `--from mykey`                 |
| `--output`          | Formato de la respuesta               | `--output json`                |
| `--node`            | Endpoint RPC al que conectarse        | `--node tcp://localhost:26657` |
| `--gas`             | Límite de gas para la transacción     | `--gas auto`                   |
| `--gas-adjustment`  | Multiplicador para el gas estimado    | `--gas-adjustment 1.3`         |
| `-y`                | Omite el aviso de confirmación        | `-y`                           |

### Ejemplo: Comando Completo con Todas las Flags Comunes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Próximos Pasos

Ahora que has enviado tu primera transacción, explora más de lo que ofrece QoreChain:

* **Staking y Delegación** — Haz staking de QOR y gana recompensas
* **Puente de Activos** — Mueve activos entre cadenas
* **Desarrollo EVM** — Despliega contratos inteligentes en Solidity en QoreChain
