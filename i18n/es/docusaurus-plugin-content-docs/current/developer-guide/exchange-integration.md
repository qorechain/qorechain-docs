---
slug: /developer-guide/exchange-integration
title: Guía para Exchanges e Integradores
sidebar_label: Integración de Exchanges
sidebar_position: 11
---

# Guía para Exchanges e Integradores

Todo lo que un exchange, un custodio o un integrador de pagos necesita para listar QOR y procesar depósitos y retiros: elegir una interfaz, detectar depósitos de forma segura y firmar retiros.

:::note
Esta guía se centra en la mainnet **`qorechain-vladi`** (versión de la cadena **v3.1.92**). Ensaye primero el flujo completo en la testnet **`qorechain-diana`** — los endpoints de ambas redes están en [Redes](/appendix/networks#public-endpoints). Si opera su propio nodo completo, manténgalo en la versión de cadena actual — un nodo desactualizado no puede decodificar los tipos de transacción más recientes y deja de sincronizarse.
:::

## Elegir una ruta de integración {#choosing-a-path}

QoreChain es una única cadena con **un saldo nativo de QOR unificado** expuesto a través de tres interfaces. La **misma clave privada controla los mismos fondos** bajo una dirección Cosmos (`qor1...`), una EVM (`0x...`) y una SVM (base58) — elija la interfaz que mejor se adapte a su stack.

| | **A) Cosmos (nativa)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Dirección | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (misma clave) |
| Decimales (QOR nativo) | **6** (`uqor`) | **18** (estilo wei) | **9** (lamports; 1 uqor = 1,000 lamports) |
| Herramientas | Cosmos SDK / CosmJS | **Ethereum estándar** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma de retiros | **PQC híbrida obligatoria** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 estándar — sin PQC** | mediante tx Cosmos o envío en el nodo |
| Soporte de memo / tag | **Sí** (dirección compartida + memo) | No (una dirección por usuario) | No (una dirección por usuario) |
| Detección de depósitos | escanear eventos `MsgSend` | escanear bloques con `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideal para | Plataformas nativas de Cosmos | **Plataformas con integración EVM existente** | Plataformas con herramientas de Solana |

**Recomendación:** si ya soporta cadenas EVM, la **Ruta B (EVM)** es la integración de menor esfuerzo — herramientas Ethereum estándar, y **los retiros no requieren firma post-cuántica** (la ruta ante de la EVM está exenta). La Ruta A (Cosmos) es la vía nativa con direcciones de depósito compartidas basadas en memo. La Ruta C (SVM) es, sobre el papel, una interfaz completa de QOR nativo, pero **su carril de transacciones está actualmente deshabilitado en toda la red** (consulte [Ruta C](#path-c-svm)) — use la Ruta A o la Ruta B hasta que se reabra.

Las tres interfaces **no son mutuamente excluyentes** — los fondos enviados a la forma `0x`, `qor1` o SVM de la misma clave son el mismo saldo.

## Operar su nodo {#node}

Las integraciones en producción deben verificar los depósitos contra su **propio nodo sincronizado**, no contra un endpoint de terceros. Siga [Conexión a la Mainnet](/getting-started/connecting-to-mainnet) — cubre el paquete de binarios precompilados (con checksums SHA-256), el genesis, los peers públicos, el mínimo de comisión (`0.1uqor`) y un arranque rápido mediante el snapshot publicado de los datos de la cadena. No se requiere licencia para operar un nodo completo no validador.

Dado que QoreChain tiene **finalidad instantánea** (sin reorgs), **1 confirmación es final**; esperar 1–2 bloques ofrece un margen operativo cómodo.

## Ruta A — Cosmos (nativa) {#path-a-cosmos}

URL REST base: `https://api.qore.host` (o `http://localhost:1317` en su nodo).

### Vigilar los depósitos

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Lista de verificación contra depósitos falsos {#anti-fake-deposit}

Acredite un depósito **solo** cuando se cumplan **todas** las condiciones siguientes:

1. **`tx_response.code == 0`** — la transacción tuvo éxito; nunca acredite una tx fallida.
2. El mensaje es **`/cosmos.bank.v1beta1.MsgSend`** (o una salida de `MsgMultiSend`) — no una llamada a contrato ni otro módulo.
3. La **`to_address`** coincide con su dirección de depósito y (con el modelo de dirección compartida) el **`memo`** corresponde al usuario.
4. El **`denom == "uqor"`** y el `amount` es el valor a acreditar (uqor → ÷ 10⁶ para QOR). Rechace cualquier otro denom.
5. La tx está en un **bloque confirmado** (`height` presente y ≤ la última altura confirmada). La finalidad es instantánea — 1 confirmación es final; espere 1–2 bloques para tener margen.
6. Recalcule el importe a partir de los **eventos de transferencia** (`coin_received` / `coin_spent`) y contrástelo con el importe del mensaje — nunca confíe en un solo campo ni únicamente en el memo.
7. Verifique que el hash de la tx existe mediante `GET /cosmos/tx/v1beta1/txs/{hash}` contra su **propio** nodo sincronizado.

### Retiros — firma PQC híbrida {#cosmos-withdrawals}

La mainnet exige **firmas post-cuánticas** en las transacciones cosmos (`allow_classical_fallback = false`): cada retiro necesita una **firma híbrida** — ML-DSA-87 (Dilithium-5, FIPS-204) **más** secp256k1. Los depósitos **no** la necesitan (usted solo observa la cadena).

La biblioteca de firma es [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), que incorpora `@qorechain/pqc` para las primitivas FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma es un flujo de **dos pasos** (que refleja `qorechaind tx pqc cosign`):

**Paso 1 — una sola vez por hot wallet: registrar su clave ML-DSA-87.** Esta única transacción de registro se firma de forma **clásica** (exención de bootstrap): mensaje `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derive la clave ML-DSA de forma determinista para que sea recuperable a partir de su secreto existente — p. ej. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, luego `mldsa.keygen(seed)` — y guarde la seed junto a la clave de su hot wallet.

**Paso 2 — cada retiro a partir de entonces: firmar en híbrido el `MsgSend`.** El adaptador incrusta la firma ML-DSA-87 en una extensión del cuerpo de la tx *antes* del `signDirect` secp256k1 normal, de modo que su firmador existente permanece sin cambios:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Transmita los bytes firmados:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Luego consulte `GET /cosmos/tx/v1beta1/txs/{hash}` hasta que aparezca en un bloque con `code == 0`.

Para un HSM o un firmador personalizado en otro lenguaje, use las bibliotecas independientes [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 (npm, PyPI, crates.io, Maven Central, Go) y ensamble la misma extensión. La firma ML-DSA **debe ser determinista** (FIPS-204 §3.4) — consulte [Firma determinista](/developer-guide/post-quantum-signing#deterministic-signing); la cadena rechaza las firmas hedged.

### Alternativa del lado del servidor: `@qorechain/chain-bridge` {#chain-bridge}

Para un worker de hot wallet totalmente del lado del servidor (sin wallet de navegador), **`@qorechain/chain-bridge`** (npm) envuelve todo el flujo — derivación de claves, autorregistro PQC en el primer uso, firma híbrida y transmisión — en una sola llamada. Es JavaScript puro (sin complementos nativos), apto para workers serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1) usa la misma derivación PQC canónica vinculada a la dirección que el resto del stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — por lo que la clave es recuperable a partir del mnemónico con `qorechaind tx pqc recover-key`. Las cuentas registradas con herramientas más antiguas se manejan automáticamente (fallback de clave legacy) y pueden migrarse una sola vez a la clave canónica con [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Ruta B — EVM {#path-b-evm}

Integración Ethereum estándar contra `https://evm.qore.host` (chain ID **9801**) o el puerto 8545 de su propio nodo.

* **Decimales:** el QOR nativo tiene **18 decimales** en el raíl EVM (1 uqor = 10¹² wei). Equivocarse en esto acredita mal los depósitos por un factor de 10¹².
* **Depósitos:** escanee bloques con `eth_getBlockByNumber` en busca de transferencias nativas a sus direcciones; confirme con `eth_getTransactionReceipt` (`status == 0x1`).
* **Retiros:** firma secp256k1 / EIP-155 estándar — **no se requiere PQC** en la ruta ante de la EVM. Cualquier stack de firma de Ethereum funciona sin cambios.
* **Contra depósitos falsos:** verifique el estado del receipt, que el valor movido sea una transferencia **nativa** (no un evento ERC-20 que usted no indexa) y confirme contra su propio nodo.
* **Mapeo de direcciones:** la dirección `0x` y la dirección `qor1` son dos codificaciones de la misma cuenta — los fondos son compartidos. Consulte [Desarrollo EVM](/developer-guide/evm-development).

## Ruta C — SVM (compatible con Solana) {#path-c-svm}

:::caution Ruta SVM actualmente deshabilitada
El carril de ejecución SVM está **actualmente deshabilitado en toda la red para el envío de transacciones**, a partir de la versión de cadena v3.1.89 (22 de agosto) — cualquier transacción enviada a él devuelve `code 11, "SVM module is disabled"`. **No** ponga en marcha un carril de depósitos/retiros sobre la Ruta C hasta que el carril se reabra. Use en su lugar la **Ruta A (Cosmos)** o la **Ruta B (EVM)**. Los endpoints de lectura (p. ej. `getBalance`) pueden seguir respondiendo, pero no construya detección de depósitos ni flujos de retiro contra SVM mientras el envío de transacciones esté deshabilitado.
:::

A partir de la v3.1.82 la interfaz SVM sirve **QOR nativo** (consulte [QOR nativo en la interfaz SVM](/developer-guide/svm-development#native-qor)):

* **Saldos:** `getBalance` devuelve lamports (÷ 10⁹ para QOR; 1 uqor = 1,000 lamports).
* **Depósitos:** `getSignaturesForAddress` proporciona el historial de transacciones de una dirección; las transferencias del System Program mueven QOR nativo.
* Los endpoints públicos (`https://svm.qore.host`, `https://svm-testnet.qore.host`) son de **solo lectura**; envíe las transacciones a través de su propio nodo.

## Resumen del flujo {#flow-summary}

| Operación | Ruta | ¿Requiere firma? |
|---|---|---|
| **Depósito** (usuario → plataforma) | Vigile su nodo sincronizado en busca de transferencias a su dirección (+ memo en Cosmos) | No — solo monitoreo |
| **Retiro** (plataforma → usuario) | Construya la transferencia, firme offline, transmita | Cosmos: PQC híbrida · EVM: secp256k1 estándar |
| **Saldo / barrido** | Consulta de saldo REST / EVM / SVM + transferencia | Firma solo para el barrido |

## Relacionado

* [Conexión a la Mainnet](/getting-started/connecting-to-mainnet) — configuración del nodo, descargas, snapshot
* [Operar un Nodo](/developer-guide/running-a-node) — despliegue, pruning, indexado
* [Firma Post-Cuántica](/developer-guide/post-quantum-signing) — las bibliotecas FIPS-204 detrás de los retiros híbridos
* [Redes](/appendix/networks) — chain IDs, endpoints, decimales por interfaz
