---
slug: /getting-started/first-transaction
title: Primera Transacción
sidebar_label: Primera Transacción
sidebar_position: 5
---

# Primera Transacción

Esta guía explica cómo enviar tokens QOR, consultar transacciones e interactuar con QoreChain a través de sus interfaces nativa, EVM y SVM.

:::note
Los comandos siguientes usan la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) está en vivo desde el 7 de junio de 2026 y ejecuta la versión v3.2.4 desde el 23 de octubre de 2026 (la testnet ejecuta v3.2.6 desde el 27 de octubre de 2026) — sustituye el chain ID y los endpoints de mainnet indicados en la página **Conexión a Mainnet** al operar en mainnet.
:::

## Consultar tu Saldo

Antes de enviar tokens, verifica el saldo de tu cuenta:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La respuesta incluye todas las denominaciones de tokens que posee la cuenta. Los saldos de QOR se muestran en `uqor` (micro-QOR), donde **1 QOR = 1.000.000 uqor**.

## Enviar QOR {#send-qor}

Una cuenta de QoreChain envía por la vía Cosmos con una **firma híbrida**: la firma clásica secp256k1 más una firma ML-DSA-87 (Dilithium-5). Un simple `qorechaind tx bank send ... -y` es rechazado, así que la transferencia se construye sin firmar y después se cofirma. Necesitas tener una clave post-cuántica registrada en tu cuenta una sola vez (consulta [Registra tu clave post-cuántica](#register-pqc-key) más abajo) y el binario oficial de `qorechaind` de [download.qore.host](https://download.qore.host) (un binario compilado a partir del árbol de código público no puede crear ni aplicar una firma Dilithium).

```bash
# 1. Build the unsigned transaction (the fee is fixed here, because cosign signs the fee in this file)
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > tx.json

# 2. Add the ML-DSA-87 signature and broadcast
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Esto envía **1 QOR** (1.000.000 uqor) a la dirección de destino y paga una comisión de 40.000 uqor (0,04 QOR). El mínimo de la red es de **0,1 uqor por unidad de gas**, de modo que la comisión debe ser al menos el límite de gas multiplicado por 0,1: `--gas 400000` requiere `--fees 40000uqor` o más. Una transferencia con firma híbrida suele usar entre 160.000 y 240.000 de gas porque la firma añade unos 4,7 KB a la transacción. `cosign` pregunta al nodo qué forma de bytes firmados verifica la red, por lo que el mismo comando funciona en ambas redes.

### Registra tu clave post-cuántica {#register-pqc-key}

Una clave post-cuántica se **registra de forma explícita**, una vez por cuenta. La cadena no la registra por ti en tu primera transacción. La propia transacción de registro (y la migración de clave) puede firmarse solo con la clave clásica para que una cuenta recién creada pueda arrancar:

```bash
# generate the ML-DSA-87 key (stored under ~/.qorechaind/pqc/mypqc.dilithium, mode 0600, not encrypted)
qorechaind tx pqc gen-key mypqc

# register the printed public key for your account
qorechaind tx pqc register-key <public_key_hex> hybrid --from mykey \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Desde v3.2.3 la cadena también acepta una **prueba de posesión** opcional con el registro, y rechaza claves débiles, degeneradas o ya utilizadas. Para adjuntar una, registra con `register-key-v2` e indica tu clave local:

```bash
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --gas 600000 --fees 60000uqor
```

Haz una copia de seguridad del archivo de clave PQC con el mismo cuidado que tu frase de recuperación; puede volver a derivarse de la frase con `qorechaind tx pqc recover-key`. [QoreX](/qorex/overview) y el SDK de QoreChain realizan el registro de la clave por ti. Consulta [Configuración de la Wallet](/getting-started/wallet-setup) para ver el flujo híbrido completo.

:::caution Las transferencias en Cosmos requieren una firma híbrida PQC
En la vía Cosmos la configuración de la red es `hybrid_signature_mode = required` (las redes en vivo ejecutan la línea v3.2). Una transacción solo clásica es **rechazada**. Para producir la firma híbrida fuera de la CLI, la librería de código abierto [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) y el SDK de QoreChain hacen lo equivalente en código.
:::

Una vez aceptada la transacción cofirmada, la CLI devuelve un hash de transacción.

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

:::caution Las transacciones EVM necesitan una ventana de autorización
La firma estándar de Ethereum (MetaMask, ethers.js, ...) sigue funcionando sin modificaciones, pero desde v3.2.0 la vía EVM solo admite una transacción de una cuenta que tenga una **clave post-cuántica registrada** y una **ventana de autorización EVM abierta**. Abre una primero (es una transacción de la vía Cosmos, firmada con tu clave ML-DSA) — consulta [Ventana de autorización EVM](#evm-window) más abajo. Sin ella el nodo responde `no open EVM authorisation window`. Leer el estado (`eth_blockNumber`, `eth_getBalance`, `eth_call`, `eth_estimateGas`) no necesita ventana.
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

### Ventana de autorización EVM {#evm-window}

Desde la versión de cadena **v3.2.0** (altura de mainnet 2.981.742, 25 de septiembre de 2026; altura de testnet 5.920.000) la vía EVM solo admite una transacción de una cuenta que

1. tenga una **clave post-cuántica registrada** (ML-DSA-87), y
2. tenga una **ventana de autorización EVM abierta** con espacio todavía para la transacción.

Todo lo demás de la vía EVM permanece igual: sigues firmando con MetaMask, ethers.js, Hardhat o Foundry, y `eth_estimateGas` y otras simulaciones funcionan sin ventana. Los despliegues de contratos cuentan como cualquier otra transacción EVM, así que se necesita una ventana antes de desplegar.

**¿Por qué una ventana?** Una wallet estándar firma una única firma secp256k1 sobre una transacción de Ethereum y no ofrece a las aplicaciones ninguna forma de adjuntar una segunda firma, post-cuántica. Por eso la autorización post-cuántica viaja *por delante* de la transacción: abres una ventana acotada con una transacción normal de la vía Cosmos, que sí lleva tu firma ML-DSA, y la vía EVM admite entonces las transacciones cubiertas por ella. Una clave clásica por sí sola nunca puede abrir una ventana, de modo que una clave clásica robada solo puede gastar lo que permita una ventana ya abierta. Funciona como una aprobación ERC-20: autorizas una cantidad acotada durante un tiempo acotado y luego operas con normalidad.

**Qué acota una ventana.** Se aplican tres límites a la vez; el primero que se agote cierra la ventana.

| Límite | Significado | Rango permitido |
| --- | --- | --- |
| `blocks` | Cuánto tiempo permanece abierta la ventana, contado desde el bloque que la abre | 1 – 17.280 |
| `max-txs` | Cuántas transacciones EVM admite | 1 – 1.000 |
| `max-value` | Salida total que admite, en uqor: valor transferido **más** la comisión máxima que podría pagar cada transacción (límite de gas × tope de comisión), redondeado hacia arriba | mayor que 0 |

* 17.280 bloques son unas 15 horas en mainnet (unos 3,2 s por bloque) y unas 6 horas en la testnet (aproximadamente 1,3 s por bloque).
* Una transacción que se admite y luego falla consume igualmente su hueco y su presupuesto de valor.
* Abrir una nueva ventana **reemplaza** a la anterior; el consumo vuelve a empezar desde cero.
* La CLI acepta `max-value` en `uqor` o `qor` (`1000qor` = 1.000.000.000 uqor).
* El límite de valor cuenta solo QOR nativo: una transferencia de tokens, una aprobación o cualquier otra llamada a un contrato lleva valor cero. Para acotar también esas, restringe el alcance de la ventana (más abajo).

**Paso 1 — registra tu clave post-cuántica** (una vez): consulta [Registra tu clave post-cuántica](#register-pqc-key) más arriba.

**Paso 2 — abre una ventana.** Abrir una ventana es una transacción de la vía Cosmos, así que se genera sin firmar y después se cofirma:

```bash
# at most 1000 QOR in total, at most 20 transactions, for 7,200 blocks (about 6.4 hours on mainnet)
qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Restringir el alcance (v3.2.3 y posteriores).** Dos flags opcionales restringen lo que admite una ventana abierta: `--native-only` admite únicamente transferencias simples de QOR nativo (sin calldata, sin creación de contratos, sin destinatario que lleve código), y `--allowed-targets 0xAAA...,0xBBB...` admite solo transacciones hacia esos destinatarios (como máximo 16; la creación de contratos queda entonces rechazada). Por ejemplo:

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > window.json
```

En mainnet, abrir una ventana ha usado unos 180.000 de gas. En [QoreX](/qorex/security-and-recovery#evm-window) el mismo paso es **Ajustes → Seguridad → Ventana de acceso EVM** (app) o el botón **Ventana de acceso EVM** (extensión). Abrir la ventana avanza el nonce de tu cuenta, así que ábrela **antes** de preparar la transacción EVM en tu wallet.

**Paso 3 — comprueba lo que queda:**

```bash
qorechaind query pqc evm-window qor1youraddress...
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/qor1youraddress...
```

La respuesta REST nunca falla para una dirección sin ventana; devuelve `found: false`. Los campos son `found`, `live`, `opened_height`, `expiry_height`, `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs` y `remaining_value` (enteros en uqor, devueltos como cadenas). En mainnet usa `https://api.qore.host`.

**Paso 4 — usa la vía EVM con normalidad.** Envía desde MetaMask o tus herramientas como de costumbre. Cada transacción consume un hueco de transacción y (valor + comisión máxima) de la ventana.

**Cerrar una ventana antes de tiempo.** Si sospechas que tu clave clásica está comprometida, cierra la ventana; lo que aún admitiera se rechaza a partir del siguiente bloque. Cerrarla también revoca cualquier consentimiento de delegación EIP-7702 pendiente (desde v3.2.2; una transacción de tipo 4 que cambia el código de una cuenta solo se admite tras un consentimiento post-cuántico `authorize-evm-delegation`):

```bash
qorechaind tx pqc close-evm-window --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > close.json
qorechaind tx pqc cosign close.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**Errores**

| Lo que ves | Significado | Qué hacer |
| --- | --- | --- |
| `no open EVM authorisation window; open one with MsgOpenEVMWindow ...` (módulo `pqc`, código 26) | No hay ventana para esta cuenta | Paso 2 |
| `... has no registered post-quantum key; the EVM lane requires one` (código 26 en la vía EVM; código 28 si intentas abrir una ventana) | No hay clave ML-DSA registrada | Paso 1 |
| `the EVM authorisation window for ... does not admit this transaction (remaining: ...)` (código 27) | Caducada o agotada; el mensaje indica qué límite | Abre una nueva ventana |
| `invalid EVM authorisation window` (código 28) | Límites fuera de rango (`blocks` 1–17.280, `max-txs` 1–1.000, `max-value` > 0) | Corrige los argumentos |

Desde código, el SDK de QoreChain y `@qorechain/wallet-adapter` pueden componer los mensajes de apertura y cierre y leer el estado de la ventana; consulta la [documentación del SDK](/sdk/overview).

La ventana se aplica solo a la vía EVM. Las transacciones de la vía Cosmos ya llevan la firma híbrida en cada transacción, y si nunca abres una ventana tus transacciones EVM se rechazan mientras que nada más cambia.

## Usando SVM RPC

El entorno de ejecución SVM de QoreChain expone una interfaz RPC compatible con Solana en el puerto `8899`. El carril de transacciones SVM está actualmente deshabilitado en toda la red, así que estos métodos de lectura son la parte que puedes usar hoy.

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
| `--fees`            | Comisión de la transacción en uqor (límite de gas × al menos 0,1) | `--fees 40000uqor` |
| `--from`            | Nombre de la clave o dirección firmante | `--from mykey`                 |
| `--output`          | Formato de la respuesta               | `--output json`                |
| `--node`            | Endpoint RPC al que conectarse        | `--node tcp://localhost:26657` |
| `--gas`             | Límite de gas para la transacción     | `--gas 400000` (o `--gas auto`) |
| `--gas-adjustment`  | Multiplicador para el gas estimado    | `--gas-adjustment 1.5`         |
| `--gas-prices`      | Precio del gas en lugar de `--fees`   | `--gas-prices 0.1uqor`         |
| `--generate-only`   | Imprime la transacción sin firmar (necesario antes de `tx pqc cosign`) | `--generate-only` |
| `-y`                | Omite el aviso de confirmación        | `-y`                           |

### Ejemplo: Comando Completo con Todas las Flags Comunes

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --node tcp://localhost:26657 \
  --output json \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

## Próximos Pasos

Ahora que has enviado tu primera transacción, explora más de lo que ofrece QoreChain:

* **Staking y Delegación** — Haz staking de QOR para ayudar a asegurar la red y recibe recompensas de staking
* **Puente de Activos** — Mueve activos entre cadenas
* **Desarrollo EVM** — Despliega contratos inteligentes en Solidity en QoreChain
