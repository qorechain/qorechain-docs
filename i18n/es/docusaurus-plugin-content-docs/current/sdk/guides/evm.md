---
slug: /sdk/guides/evm
title: Guía de EVM
sidebar_label: EVM
sidebar_position: 1
---

# Guía de EVM

`@qorechain/evm` es un adaptador ligero y con tipado seguro sobre [viem](https://viem.sh) para
el motor EVM de QoreChain. No reimplementa un cliente EVM — viem es una dependencia
entre pares (peer dependency). Añade una factoría de clientes consciente de la cadena (con autodetección
del chain-id de EVM), utilidades para ERC-20, envoltorios de despliegue/llamada de contratos y
enlaces tipados para los precompilados EVM de QoreChain.

```bash
npm i @qorechain/evm viem
```

## Crear un cliente

`createEvmClient` devuelve un paquete de cliente respaldado por viem. Autodetecta el
chain id de EVM mediante `eth_chainId` salvo que pases `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

También puedes pasar `rpcUrl` directamente (mutuamente excluyente con `endpoints`), una
`wsUrl` / `endpoints.evmWs` para WebSocket (`wss://evm-ws-testnet.qore.host` en la
testnet), un `chainId` explícito y `decimals`
(por defecto 18, la convención de EVM para QOR — distinta de la base `uqor` de Cosmos
de 10^6).

Deriva una cuenta de firma EVM a partir de una clave privada:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Utilidades ERC-20

El espacio de nombres `erc20` (y las funciones individuales) envuelven las llamadas estándar de ERC-20.
Las lecturas reciben un cliente público de viem; las escrituras reciben un cliente de cartera.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

El ABI en bruto se exporta como `ERC20_ABI` si prefieres llamar a viem directamente.

## Contratos

Envoltorios genéricos de despliegue y llamada:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Ventana de autorización EVM (desde la cadena v3.2.0) {#evm-window}

Desde la versión de cadena **v3.2.0** (mainnet desde el bloque 2.981.742, testnet desde el bloque
5.920.000) el carril EVM solo admite una transacción de una cuenta que tenga una
**clave ML-DSA-87 registrada** y una **ventana de autorización abierta**. Las lecturas
(`eth_call`, saldos, recibos) y la estimación de gas funcionan sin ella, y las carteras
y bibliotecas como MetaMask, viem, ethers, Hardhat y Foundry firman como antes;
lo que cambia es que la autorización poscuántica viaja *por delante* de la
transacción, como un mensaje del carril nativo (Native) con firma híbrida. Las reglas a nivel de cadena, los límites, las formas de la CLI y los códigos de rechazo están en
[Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

Con el SDK **0.8.2 o posterior** puedes abrir una ventana desde código (la **0.9.0** añade
las opciones de alcance que se describen más abajo). El registro de la clave
(una sola vez) se describe en [Quantum-safe](/sdk/guides/quantum-safe); el ejemplo
siguiente abre entonces una ventana para una cuenta eth-nativa unificada (`npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  openEvmWindowMsg,
  fetchEvmWindow,
  classifyEvmWindowRejection,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account, { rest: REST }); // hybrid: the window needs the ML-DSA key

const { account: base } = await client.rest.get<{
  account: { account_number: string; sequence: string };
}>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);

const open = openEvmWindowMsg({
  sender: account.cosmos,
  blocks: 7200,         // 1 … 17,280 blocks (a block count, not a duration)
  maxTxs: 20,           // 1 … 1,000 transactions
  maxValue: "1000000000", // uqor: transferred value PLUS the maximum fee of each transaction
});

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-vladi",
  accountNumber: BigInt(base.account_number),
  sequence: BigInt(base.sequence),
  messages: [open],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
});

const w = await fetchEvmWindow({ rest: REST, address: account.cosmos });
console.log(w.live); // true while the window admits at least one more transaction
```

Abrir una ventana avanza el nonce de la cuenta (una sola identidad: la secuencia de Cosmos
es el nonce de EVM), así que lee el nonce de EVM **después** de abrir la ventana y firma
entonces la transacción EVM. `maxValue` limita el valor **más** la comisión máxima (límite de gas
por tope de comisión) de cada transacción: una transferencia de 1.000 uqor con 21.000 de gas a
112,5 gwei consume 3.363 uqor de la ventana. Abre una ventana solo cuando el usuario
lo pida; nunca abras una automáticamente.

Cuando el carril EVM rechaza una transacción, `classifyEvmWindowRejection(err)` te
dice por qué:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` construye el mensaje de cierre correspondiente, y `MAX_EVM_WINDOW_BLOCKS`
y `MAX_EVM_WINDOW_TXS` exportan los límites.

### Acota una ventana (desde la cadena v3.2.3, SDK 0.9.0) {#evm-window-scope}

Una ventana puede acotarse al abrirla: `nativeOnly` admite solo transferencias simples de
QOR nativo (sin calldata, sin creación de contratos, sin destinatario que contenga código,
sin autorización EIP-7702), y `allowedTargets` admite solo transacciones cuyo
destinatario sea una de hasta 16 direcciones `0x` listadas (sin duplicados; la creación
de contratos se rechaza). Ambos son campos nuevos del mensaje: un nodo anterior a v3.2.3 rechaza la transacción
completa cuando se establece cualquiera de ellos, así que establécelos solo en una red que haya aplicado
v3.2.3 (las dos redes públicas lo han hecho). `fetchEvmWindow` lee ambos de vuelta (`nativeOnly`,
`allowedTargets`; antes de v3.2.3 valen `false` y vacío). Para una ventana abierta
solo para enviar QOR, prefiere `nativeOnly`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on-chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "1000000000", // uqor: value PLUS the maximum fee of each transaction
      nativeOnly: true,
      // or: allowedTargets: ["0x…", "0x…"],
    }),
  ],
  "auto",
);
```

### Consentimiento EIP-7702 (desde la cadena v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

Una transacción de tipo 4 (EIP-7702) se admite solo después de que cada cuenta cuya
autorización surte efecto haya dado un consentimiento poscuántico exactamente para ese
delegado, con un `MsgAuthorizeEVMDelegation` con firma híbrida. El consentimiento se consume
con la transacción que instala la delegación y caduca tras los `blocks` que
establezcas (de 1 a 17.280); la dirección cero como delegado consiente en eliminarla. El SDK
construye los mensajes y lee el consentimiento de vuelta, incluido el nonce que la
tupla de autorización debe llevar:

```ts
import {
  authorizeEvmDelegationMsg,
  clearEvmDelegationMsg,
  fetchEvmDelegationConsent,
  evmDelegationTupleNonce,
} from "@qorechain/sdk";

// 1) Consent to one delegate (hybrid-signed Native-lane message, `tx` as above).
await tx.signAndBroadcast(
  [authorizeEvmDelegationMsg({ sender: account.address, delegate: "0xDelegate…", blocks: 600 })],
  "auto",
);

// 2) Read the consent: the tuple's nonce is the account's EVM nonce for a
//    sponsored transaction, and that nonce + 1 when the account sends it itself.
const consent = await fetchEvmDelegationConsent({ rest: "https://api.qore.host", address: account.address });
const tupleNonce = evmDelegationTupleNonce(consent, /* sponsored */ true);

// 3) Sign the authorisation tuple with `tupleNonce` and send the type-4
//    transaction (the sender still needs an open window; a sponsor pays from its own).

// Remove an installed delegation directly, without any EVM transaction:
// await tx.signAndBroadcast([clearEvmDelegationMsg(account.address)], "auto");
```

`classifyEvmDelegationRejection(err)` devuelve `"no-consent"` o `"invalid"` cuando el
carril EVM rechaza una delegación. La consulta del consentimiento requiere la cadena v3.2.2 o posterior. Las
reglas a nivel de cadena están en
[Delegaciones EIP-7702](/architecture/post-quantum-security#eip-7702); las formas de la CLI
son `qorechaind tx pqc authorize-evm-delegation` y `clear-evm-delegation`.

Las versiones anteriores a la 0.9.0 construyen solo la ventana sin alcance (una ventana sin
alcance sigue funcionando en ambas redes) y no tienen constructores de consentimiento; usa allí las formas de la CLI de
[Ventana de autorización EVM](/getting-started/first-transaction#evm-window).

## Precompilados

QoreChain define precompilados invocables por contrato en direcciones fijas. El
espacio de nombres `precompiles` proporciona enlaces tipados, y las direcciones y los ABI están
exportados.

> **Aún no están activos.** Los precompilados de QoreChain están compilados en el nodo
> pero todavía no activados en mainnet (`qorechain-vladi`) ni en testnet
> (`qorechain-diana`): una llamada devuelve datos vacíos, por lo que estas utilidades
> lanzan error hoy también en las redes públicas. Consulta
> [Precompilados EVM: estado de la red](/developer-guide/evm-precompiles#network-status).

| Precompilado | Función | Dirección |
| --- | --- | --- |
| Puente entre VM | (enrutamiento del puente) | `0x0000000000000000000000000000000000000901` |
| Verificación PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Estado de clave PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Puntuación de riesgo QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Comprobación de anomalías QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Parámetros de consenso | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (once 0x…0C01 is active).
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers: raw calldata for the risk score, an args object for the anomaly check.
const score = await precompiles.aiRiskScore(client.publicClient, "0xa9059cbb...");
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, {
  sender: account,
  amount: 1_000_000_000_000_000_000n, // 1 QOR in wei
});

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

Los ABI de los precompilados se exportan como `IQORE_PQC_ABI`, `IQORE_AI_ABI` e
`IQORE_CONSENSUS_ABI`.

> Donde un precompilado no está activo (hoy: todas las redes públicas), o en un nodo
> sin los precompilados de QoreChain, estas llamadas lanzan un error de "feature not
> present" (función no presente). Manéjalo por llamada.

Consulta el [ejemplo](/sdk/examples) `evm-precompile` para una versión ejecutable.
