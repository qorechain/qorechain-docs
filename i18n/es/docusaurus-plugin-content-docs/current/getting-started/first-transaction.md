---
slug: /getting-started/first-transaction
title: Primera transacción
sidebar_label: Primera transacción
sidebar_position: 5
---

# Primera transacción

Esta guía recorre el envío de tokens QOR, la consulta de transacciones y la interacción con QoreChain a través de sus interfaces nativa, EVM y SVM.

:::note
Los comandos a continuación usan la red de pruebas **`qorechain-diana`** (ID de cadena EVM **9800**). La red principal (**`qorechain-vladi`**, ID de cadena EVM **9801**) está activa desde el 7 de junio de 2026 — sustituye el ID de cadena y los endpoints de la red principal de la página **Conexión a la red principal** cuando transacciones en la red principal.
:::

## Comprueba tu saldo

Antes de enviar tokens, verifica el saldo de tu cuenta:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La respuesta incluye todas las denominaciones de tokens en poder de la cuenta. Los saldos de QOR se muestran en `uqor` (micro-QOR), donde **1 QOR = 1.000.000 uqor**.

## Enviar QOR

Transfiere tokens desde tu clave a otra dirección:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Esto envía **1 QOR** (1.000.000 uqor) a la dirección del destinatario, pagando una tarifa de 500 uqor.

:::caution Las transferencias en Cosmos requieren una firma híbrida PQC
En la ruta cosmos, el valor por defecto de la red es `hybrid_signature_mode = required` (versión de cadena actual **v3.1.82**). Un `tx bank send` clásico simple es **rechazado** — cada transacción de la ruta cosmos debe llevar una firma ML-DSA-87 (Dilithium-5) junto con la firma secp256k1. Genera una clave Dilithium-5 con `qorechaind tx pqc gen-key`, luego adjunta la cofirma híbrida con `qorechaind tx pqc cosign` (o construye la transacción con el `buildHybridTx` del SDK de QoreChain, usando `includePqcPublicKey` para que la clave se registre automáticamente en el primer uso). Para producir la firma híbrida fuera de la CLI, la biblioteca de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) y el SDK de QoreChain hacen el equivalente en código. Consulta [Configuración de la cartera](/getting-started/wallet-setup) para conocer el flujo híbrido completo.
:::

Se te pedirá que confirmes la transacción antes de que se difunda. Una vez confirmada, la CLI devuelve un hash de transacción.

## Consultar una transacción

Busca una transacción completada por su hash:

```bash
qorechaind query tx <txhash>
```

La salida incluye el estado de la transacción, el gas usado, la altura de bloque y todos los eventos emitidos durante la ejecución.

Para salida en JSON:

```bash
qorechaind query tx <txhash> --output json
```

## Uso de JSON-RPC (EVM)

El entorno de ejecución EVM de QoreChain expone una interfaz JSON-RPC estándar de Ethereum en el puerto `8545`.

:::note
Las transacciones EVM **no se ven afectadas** por el requisito de PQC híbrido de la ruta cosmos. Usan una ruta ante `eth_secp256k1` independiente, por lo que la firma estándar de Ethereum (MetaMask, ethers.js, etc.) funciona sin una extensión PQC.
:::

### Obtener el último número de bloque

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

### Obtener el saldo de una cuenta

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

El saldo se devuelve como un valor codificado en hex en la denominación más pequeña.

## Uso de RPC de SVM

El entorno de ejecución SVM de QoreChain expone una interfaz RPC compatible con Solana en el puerto `8899`.

### Obtener el slot actual

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Obtener el saldo de una cuenta

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

## Patrones comunes de la CLI

Al trabajar con la CLI `qorechaind`, estos flags se usan con frecuencia:

| Flag               | Descripción                   | Ejemplo                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Especifica la cadena de destino    | `--chain-id qorechain-diana`   |
| `--fees`           | Tarifa de transacción en uqor       | `--fees 500uqor`               |
| `--from`           | Nombre de la clave de firma o dirección   | `--from mykey`                 |
| `--output`         | Formato de respuesta               | `--output json`                |
| `--node`           | Endpoint RPC al que conectarse    | `--node tcp://localhost:26657` |
| `--gas`            | Límite de gas para la transacción | `--gas auto`                   |
| `--gas-adjustment` | Multiplicador del gas estimado  | `--gas-adjustment 1.3`         |
| `-y`               | Omitir el aviso de confirmación      | `-y`                           |

### Ejemplo: comando completo con todos los flags comunes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Próximos pasos

Ahora que has enviado tu primera transacción, explora más de lo que ofrece QoreChain:

* **Staking y delegación** — Haz staking de QOR y gana recompensas
* **Puenteo de activos** — Mueve activos entre cadenas
* **Desarrollo EVM** — Despliega contratos inteligentes en Solidity en QoreChain
