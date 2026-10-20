---
slug: /developer-guide/exchange-integration
title: Guía para Exchanges e Integradores
sidebar_label: Integración de Exchanges
sidebar_position: 11
---

# Guía para Exchanges e Integradores

Todo lo que un exchange, un custodio o un integrador de pagos necesita para listar QOR y procesar depósitos y retiros: elegir una interfaz, detectar depósitos de forma segura y firmar retiros.

:::note
Esta guía se centra en la mainnet **`qorechain-vladi`** (activa desde el 7 de junio de 2026; versión de nodo **v3.2.3**, aplicada en la altura 3,662,051 el 20 de octubre de 2026). Ensaye primero el flujo completo en la testnet **`qorechain-diana`** — ejecuta v3.2.4 desde el 19 de octubre de 2026, y la mainnet pasa de la v3.2.3 a la v3.2.4 en la altura 3,742,566 (propuesta de gobernanza 13), por lo que los cambios que se enumeran a continuación se aplican a ambas redes una vez alcanzado ese bloque (los endpoints de ambas redes están en [Redes](/appendix/networks#public-endpoints)). Si opera su propio nodo completo, manténgalo en la versión que recomienda el manifiesto de descargas y nunca por debajo de su `minCompatible` (**3.2.3** en mainnet hasta la actualización) — un nodo desactualizado no puede seguir las actualizaciones de la cadena y se detiene en la altura de la actualización; consulte [Ejecutar un nodo](/developer-guide/running-a-node#upgrades) para saber qué hacer antes de la altura 3,742,566.

**Qué cambió para los integradores en v3.2.2 y v3.2.3** (el formato de firma, las direcciones, los decimales, los memos y las comisiones no han cambiado):

* **Se rechazan las transacciones de Ethereum sin protección (anteriores a EIP-155)** en el mempool y en la ejecución de bloques (v3.2.2). La wallet de un depositante debe firmar con un chain id; todas las wallets actuales lo hacen.
* **Las cuentas de módulo no pueden reclamarse a través de la EVM** (v3.2.2); no use la dirección de una cuenta de módulo como dirección de depósito ni de retiro.
* **Las cuentas de vesting solo pueden crearse para el propio firmante** (v3.2.3), (y los tres mensajes de creación de vesting están actualmente en la lista del circuit breaker de la mainnet).
* **Los mensajes de clave PQC necesitan la firma híbrida una vez que una cuenta tiene una clave** (v3.2.3): consulte [Firma post-cuántica](/developer-guide/post-quantum-signing#key-integrity). Registre la clave de la hot wallet una sola vez, al principio.
* **Las ventanas EVM pueden acotarse** (v3.2.3): una hot wallet que solo envía QOR simple puede abrir una ventana `native_only`, consulte [Desarrollo EVM](/developer-guide/evm-development#evm-window).

**Qué cambia para los integradores en v3.2.4** (en la testnet desde el 19 de octubre de 2026; en la mainnet desde la altura 3,742,566). La firma de transacciones, las direcciones, los decimales, los memos y las comisiones no cambian, y nada cambia en cómo se detecta un depósito ni en cómo se firma y difunde un retiro:

* **Bloqueos de staking opcionales (nuevo módulo `x/stakingtier`).** Un delegador puede bloquear parte de una delegación durante 3, 6 o 12 meses (bloqueo mínimo de 10 QOR, como máximo 16 bloqueos abiertos por delegador). No ocurre nada con una cuenta que no crea un bloqueo. Mientras un bloqueo está abierto, ese importe **no puede desdelegarse ni redelegarse**, por ninguna vía (una transacción simple, `authz`, un grupo o un contrato); terminar un bloqueo antes de tiempo quema una penalización del stake bloqueado. Por tanto, un custodio que haga staking con fondos de clientes no debería bloquear la parte que pueda necesitar devolver. Lea los parámetros en `GET /qorechain/stakingtier/v1/params`.
* **Una nueva fuente de quema, `staking_tier_penalty`**, aparece en las estadísticas de quema cuando se producen desbloqueos anticipados. Los procesos de conciliación de suministro que enumeran las fuentes de quema deben aceptar un nombre de fuente desconocido.
* **Límites de JSON-RPC locales del nodo** para los nodos que ejecute usted mismo: se rechazan los cuerpos de petición de más de 256 KiB (HTTP 413), no se atienden más de 256 peticiones a la vez (HTTP 503 por encima de ese número), y se rechaza un filtro de `eth_getLogs` o `eth_newFilter` con más de 4 posiciones de topics, 1000 alternativas en una posición o 1000 direcciones. Los límites son configurables en la sección `[json-rpc]` de `app.toml` (consulte [Ejecutar un nodo](/developer-guide/running-a-node#exposing-endpoints-for-integration)). Un escáner de depósitos que consulta `eth_getLogs` con una lista larga de direcciones debería dividir la lista.
* **Un registro de clave repetido se rechaza antes de cobrarse.** Un nodo con v3.2.4 rechaza, en el momento de la difusión, un `MsgRegisterPQCKeyV2` que lleva exactamente la clave pública que la cuenta ya tiene registrada, con el error que habría devuelto la cadena (código PQC 7, la cuenta ya existe), y sin cobrar comisión. Compruebe `GET /qorechain/pqc/v1/account/{address}` antes de registrar la clave de una hot wallet, como se recomienda más abajo.
* **Indicador de posesión opcional.** El registro de la cuenta gana un campo `possession_proven` que indica si se verificó una prueba de posesión en el registro; no cambia quién puede enviar o recibir. Consulte [Firma post-cuántica](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## Elegir una ruta de integración {#choosing-a-path}

QoreChain es una única cadena con **un saldo nativo de QOR unificado** expuesto a través de tres interfaces. La **misma clave privada controla los mismos fondos** bajo una dirección Cosmos (`qor1...`), una EVM (`0x...`) y una SVM (base58) — elija la interfaz que mejor se adapte a su stack.

| | **A) Cosmos (nativa)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Dirección | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (misma clave) |
| Decimales (QOR nativo) | **6** (`uqor`) | **18** (estilo wei) | **9** (lamports; 1 uqor = 1,000 lamports) |
| Herramientas | Cosmos SDK / CosmJS | **Ethereum estándar** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Firma de retiros | **PQC híbrida obligatoria** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 estándar, pero solo dentro de una ventana de autorización PQC abierta** (clave ML-DSA registrada + una ventana abierta mediante un mensaje Cosmos con firma híbrida) | mediante tx Cosmos o envío en el nodo (carril actualmente deshabilitado) |
| Soporte de memo / tag | **Sí** (dirección compartida + memo) | No (una dirección por usuario) | No (una dirección por usuario) |
| Detección de depósitos | escanear eventos `MsgSend` | escanear bloques con `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideal para | Plataformas nativas de Cosmos | **Plataformas con integración EVM existente** | Plataformas con herramientas de Solana |

**Recomendación:** use la **Ruta A (Cosmos)** para los retiros; es la vía nativa y ofrece direcciones de depósito compartidas basadas en memo. Desde la v3.2.0 el carril EVM (Ruta B) también exige una clave ML-DSA-87 registrada y una **ventana de autorización EVM** abierta y acotada, que solo puede abrirse con un mensaje del carril Cosmos con firma híbrida, de modo que un raíl de retiros EVM necesita el mismo stack de firma post-cuántica que la Ruta A **más** la gestión de ventanas (consulte la [Ruta B](#path-b-evm) y la [ventana de autorización EVM](/developer-guide/evm-development#evm-window)). La Ruta B sigue siendo adecuada para la **detección de depósitos** con herramientas Ethereum estándar. La Ruta C (SVM) es, sobre el papel, una interfaz completa de QOR nativo, pero **su carril de transacciones está actualmente deshabilitado en toda la red** (consulte [Ruta C](#path-c-svm)) — use la Ruta A, o la Ruta B para la detección de depósitos, hasta que se reabra.

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
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

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
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La firma es un flujo de **dos pasos** (que refleja `qorechaind tx pqc cosign`):

**Paso 1 — una sola vez por hot wallet: registrar su clave ML-DSA-87.** Esta única transacción de registro se firma de forma **clásica** (exención de bootstrap, para una cuenta que aún no tiene clave; una vez que existe una clave, cualquier otro mensaje de clave debe llevar firma híbrida): mensaje `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` con `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derive la clave ML-DSA de forma determinista para que sea recuperable a partir de su secreto existente — p. ej. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, luego `mldsa.keygen(seed)` — y guarde la seed junto a la clave de su hot wallet. El registro es explícito: nada registra la clave por usted cuando aparece por primera vez una transacción híbrida, y una clave incrustada en una transacción no queda registrada. La cadena rechaza las claves `classical_only` y las claves que no ofrecen protección post-cuántica (código 230), y verifica una prueba de posesión opcional cuando se adjunta una (CLI: `register-key-v2 ... --pqc-key`; `@qorechain/sdk` 0.9.0 adjunta una por sí mismo mediante `ensurePqcRegistered` una vez que la red ha aplicado v3.2.3, y `@qorechain/wallet-adapter` 0.4.0 no la adjunta, lo cual se acepta). Fije el gas de forma explícita (la clave de 2,592 bytes necesita más que los 200,000 por defecto; use `--gas 600000` en la CLI, un límite de gas de 600,000 en código y una comisión de al menos gas × 0.1 uqor, es decir, 60,000 uqor).

**Paso 2 — cada retiro a partir de entonces: firmar en híbrido el `MsgSend`.** El adaptador incrusta la firma ML-DSA-87 en una extensión del cuerpo de la tx *antes* del `signDirect` secp256k1 normal, de modo que su firmador existente permanece sin cambios:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
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
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Luego consulte `GET /cosmos/tx/v1beta1/txs/{hash}` hasta que aparezca en un bloque con `code == 0`.

Para un HSM o un firmador personalizado en otro lenguaje, use las bibliotecas independientes [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 (npm, PyPI, crates.io, Maven Central, Go) y ensamble la misma extensión. La cadena acepta cualquier firma ML-DSA-87 válida según FIPS-204, hedged o determinista; firmar de forma determinista (FIPS-204 §3.4, el valor predeterminado de las bibliotecas) le da una firma y un hash de tx reproducibles. Consulte [Firma determinista](/developer-guide/post-quantum-signing#deterministic-signing) y [Solución de problemas del código 21](/developer-guide/post-quantum-signing#code-21) si se rechaza una transacción híbrida.

### Alternativa del lado del servidor: `@qorechain/chain-bridge` {#chain-bridge}

Para un worker de hot wallet totalmente del lado del servidor (sin wallet de navegador), **`@qorechain/chain-bridge`** (npm) envuelve todo el flujo — derivación de claves, firma híbrida y transmisión — en una sola llamada. Es JavaScript puro (sin complementos nativos), apto para workers serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Si la cuenta aún no tiene una clave registrada, la propia biblioteca envía la transacción explícita `MsgRegisterPQCKeyV2` y reintenta una vez; ese es el comportamiento de la biblioteca, no de la cadena, por lo que un raíl de hot wallet debe registrar la clave con antelación y confirmarla (`GET /qorechain/pqc/v1/account/{address}`) antes del primer retiro. Desde `chain-bridge` 0.2.3, con `cosmosRest` configurado, el registro lleva la prueba de posesión una vez que la red ha aplicado v3.2.3, y antes de cualquier nuevo registro la biblioteca consulta la cadena: si la cuenta ya tiene una clave que no es ni la canónica ni la legacy de su mnemónico, lanza `pqc_key_mismatch` y no envía nada (un registro repetido cuesta su comisión y se rechaza). `chain-bridge` (≥0.1.1) usa la misma derivación PQC canónica vinculada a la dirección que el resto del stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — por lo que la clave es recuperable a partir del mnemónico con `qorechaind tx pqc recover-key`. Las cuentas registradas con herramientas más antiguas se manejan automáticamente (fallback de clave legacy) y pueden migrarse una sola vez a la clave canónica con [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Ruta B — EVM {#path-b-evm}

Integración Ethereum estándar contra `https://evm.qore.host` (chain ID **9801**) o el puerto 8545 de su propio nodo.

* **Decimales:** el QOR nativo tiene **18 decimales** en el raíl EVM (1 uqor = 10¹² wei). Equivocarse en esto acredita mal los depósitos por un factor de 10¹².
* **Depósitos:** escanee bloques con `eth_getBlockByNumber` en busca de transferencias nativas a sus direcciones; confirme con `eth_getTransactionReceipt` (`status == 0x1`). Las propias transacciones EVM de los depositantes también están sujetas a la regla de la ventana, así que un usuario cuya cuenta no tenga una clave registrada ni una ventana abierta no puede enviar un depósito desde el carril EVM (puede usar el carril Cosmos en su lugar), y una transacción firmada sin chain id (anterior a EIP-155) se rechaza de plano. Una ventana puede acotarse (`native_only`, `allowed_targets`), de modo que un depósito admitido es siempre una transferencia nativa o una llamada que la ventana permite; aun así, lea el receipt en lugar de darlo por supuesto.
* **Retiros:** firma secp256k1 / EIP-155 estándar, **pero solo desde una cuenta con una clave ML-DSA-87 registrada y una ventana de autorización EVM abierta** (desde la v3.2.0; consulte la [ventana de autorización EVM](/developer-guide/evm-development#evm-window) y el recorrido paso a paso en [Su primera transacción](/getting-started/first-transaction#evm-window)). Una transacción fuera de una ventana se rechaza (codespace `pqc`, códigos 26, 27 o 28). La ventana debe abrirse con una transacción del carril Cosmos con firma híbrida, por lo que la Ruta B no elimina la necesidad de firma post-cuántica; dimensione `max-value` para cubrir el valor más la comisión máxima (límite de gas × comisión máxima por gas) de cada retiro que espere dentro de la ventana (para una hot wallet que solo envía QOR simple, añada `--native-only` al abrirla), y vigile `GET /qorechain/pqc/v1/evm_window/{address}` para que la hot wallet no se quede sin fondos a mitad del lote. Abrir una ventana avanza el sequence de la cuenta, que es también su nonce EVM, así que lea el nonce una vez abierta la ventana.
* **Contra depósitos falsos:** verifique el estado del receipt, que el valor movido sea una transferencia **nativa** (no un evento ERC-20 que usted no indexa) y confirme contra su propio nodo.
* **Mapeo de direcciones:** la dirección `0x` y la dirección `qor1` son dos codificaciones de la misma cuenta — los fondos son compartidos. Consulte [Desarrollo EVM](/developer-guide/evm-development).

## Ruta C — SVM (compatible con Solana) {#path-c-svm}

:::caution Ruta SVM actualmente deshabilitada
El carril de ejecución SVM está **actualmente deshabilitado en toda la red para el envío de transacciones**, a partir de la versión de cadena v3.1.89 (22 de agosto) — cualquier transacción enviada a él devuelve `code 11, "SVM module is disabled"`. **No** ponga en marcha un carril de depósitos/retiros sobre la Ruta C hasta que el carril se reabra — se trata de una deshabilitación en tiempo de compilación, no de un parámetro en tiempo de ejecución, así que no puede reactivarse mediante una votación de gobernanza; se espera que permanezca desactivado hasta que una auditoría externa lo autorice. Use en su lugar la **Ruta A (Cosmos)** o la **Ruta B (EVM)**. Los endpoints de lectura (p. ej. `getBalance`) pueden seguir respondiendo, pero no construya detección de depósitos ni flujos de retiro contra SVM mientras el envío de transacciones esté deshabilitado.
:::

A partir de la v3.1.82 la interfaz SVM sirve **QOR nativo** (consulte [QOR nativo en la interfaz SVM](/developer-guide/svm-development#native-qor)):

* **Saldos:** `getBalance` devuelve lamports (÷ 10⁹ para QOR; 1 uqor = 1,000 lamports).
* **Depósitos:** `getSignaturesForAddress` proporciona el historial de transacciones de una dirección; las transferencias del System Program mueven QOR nativo.
* Los endpoints públicos (`https://svm.qore.host`, `https://svm-testnet.qore.host`) son de **solo lectura**; envíe las transacciones a través de su propio nodo.

## Resumen del flujo {#flow-summary}

| Operación | Ruta | ¿Requiere firma? |
|---|---|---|
| **Depósito** (usuario → plataforma) | Vigile su nodo sincronizado en busca de transferencias a su dirección (+ memo en Cosmos) | No — solo monitoreo |
| **Retiro** (plataforma → usuario) | Construya la transferencia, firme offline, transmita | Cosmos: PQC híbrida · EVM: secp256k1 estándar dentro de una ventana autorizada por PQC |
| **Saldo / barrido** | Consulta de saldo REST / EVM / SVM + transferencia | Firma solo para el barrido |

## Relacionado

* [Conexión a la Mainnet](/getting-started/connecting-to-mainnet) — configuración del nodo, descargas, snapshot
* [Operar un Nodo](/developer-guide/running-a-node) — despliegue, pruning, indexado
* [Firma Post-Cuántica](/developer-guide/post-quantum-signing) — las bibliotecas FIPS-204 detrás de los retiros híbridos
* [Redes](/appendix/networks) — chain IDs, endpoints, decimales por interfaz
