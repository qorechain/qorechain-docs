---
slug: /sdk/guides/evm
title: EVM-Leitfaden
sidebar_label: EVM
sidebar_position: 1
---

# EVM-Leitfaden

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh) für
die QoreChain EVM Engine. Er implementiert keinen EVM-Client neu — viem ist eine Peer-
Abhängigkeit. Er ergänzt eine chain-bewusste Client-Factory (mit automatischer Erkennung der
EVM-Chain-ID), ERC-20-Helfer, Wrapper zum Deployen/Aufrufen von Verträgen sowie typisierte
Bindings für QoreChains EVM-Precompiles.

```bash
npm i @qorechain/evm viem
```

## Einen Client erstellen

`createEvmClient` gibt ein Client-Bundle zurück, das von viem unterstützt wird. Es erkennt die
EVM-Chain-ID automatisch über `eth_chainId`, sofern Sie nicht `chainId` übergeben.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Sie können auch `rpcUrl` direkt übergeben (gegenseitig ausschließend mit `endpoints`), eine
`wsUrl` / `endpoints.evmWs` für WebSocket, eine explizite `chainId` sowie `decimals`
(Standardwert 18, die EVM-Konvention für QOR — abweichend von der Cosmos-Basis `uqor`
von 10^6).

Leiten Sie ein EVM-Signaturkonto aus einem privaten Schlüssel ab:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20-Helfer

Der `erc20`-Namespace (sowie die einzelnen Funktionen) kapseln standardmäßige ERC-20-Aufrufe.
Lesezugriffe benötigen einen viem-Public-Client; Schreibzugriffe einen Wallet-Client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

Die rohe ABI wird als `ERC20_ABI` exportiert, falls Sie viem lieber direkt aufrufen möchten.

## Verträge

Generische Wrapper zum Deployen und Aufrufen:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Precompiles

QoreChain stellt vertragsaufrufbare Precompiles an festen Adressen bereit. Der
`precompiles`-Namespace bietet typisierte Bindings, und die Adressen sowie ABIs werden
exportiert.

| Precompile | Funktion | Adresse |
| --- | --- | --- |
| Cross-VM Bridge | (Bridge-Routing) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

Die Precompile-ABIs werden als `IQORE_PQC_ABI`, `IQORE_AI_ABI` und
`IQORE_CONSENSUS_ABI` exportiert.

> Auf einem Node ohne die QoreChain-Precompiles werfen diese Aufrufe einen Fehler "feature not
> present". Behandeln Sie dies pro Aufruf, falls Sie heterogene Nodes ansprechen.

Eine lauffähige Version finden Sie im `evm-precompile`-[Beispiel](/sdk/examples).
