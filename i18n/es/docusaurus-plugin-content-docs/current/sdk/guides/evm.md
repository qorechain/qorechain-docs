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
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

También puedes pasar `rpcUrl` directamente (mutuamente excluyente con `endpoints`), una
`wsUrl` / `endpoints.evmWs` para WebSocket, un `chainId` explícito y `decimals`
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

## Precompilados

QoreChain expone precompilados invocables por contrato en direcciones fijas. El
espacio de nombres `precompiles` proporciona enlaces tipados, y las direcciones y los ABI están
exportados.

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

// Read live consensus parameters.
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers.
const score = await precompiles.aiRiskScore(client.publicClient, /* args */);
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, /* args */);

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

Los ABI de los precompilados se exportan como `IQORE_PQC_ABI`, `IQORE_AI_ABI` e
`IQORE_CONSENSUS_ABI`.

> En un nodo sin los precompilados de QoreChain, estas llamadas lanzan un error de "feature not
> present" (función no presente). Manéjalo por llamada si te diriges a nodos heterogéneos.

Consulta el [ejemplo](/sdk/examples) `evm-precompile` para una versión ejecutable.
