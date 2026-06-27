---
slug: /sdk/guides/evm
title: EVM ガイド
sidebar_label: EVM
sidebar_position: 1
---

# EVM ガイド

`@qorechain/evm` は QoreChain EVM Engine 向けの、[viem](https://viem.sh) 上に構築された
薄く型安全なアダプターです。EVM クライアントを再実装するものではなく、viem はピア
依存です。チェーンを認識するクライアントファクトリ（EVM チェーン ID の
自動検出付き）、ERC-20 ヘルパー、コントラクトのデプロイ/呼び出しラッパー、QoreChain の
EVM プリコンパイル向けの型付きバインディングを追加します。

```bash
npm i @qorechain/evm viem
```

## クライアントの作成

`createEvmClient` は viem を基盤としたクライアントバンドルを返します。`chainId` を
渡さない限り、`eth_chainId` を介して EVM チェーン ID を自動検出します。

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm.testnet.example" },
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

`rpcUrl` を直接渡すこともできます（`endpoints` と相互排他）。WebSocket 用の
`wsUrl` / `endpoints.evmWs`、明示的な `chainId`、`decimals`
（デフォルトは 18。これは QOR の EVM 上の慣例であり、Cosmos の `uqor`
基本単位 10^6 とは異なります）も渡せます。

秘密鍵から EVM 署名アカウントを導出します:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 ヘルパー

`erc20` 名前空間（および個々の関数）は標準的な ERC-20 呼び出しをラップします。
読み取りは viem の public client を、書き込みは wallet client を受け取ります。

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

viem を直接呼び出したい場合のために、生の ABI が `ERC20_ABI` としてエクスポートされています。

## コントラクト

汎用のデプロイおよび呼び出しラッパー:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## プリコンパイル

QoreChain は固定アドレスでコントラクトから呼び出し可能なプリコンパイルを公開しています。
`precompiles` 名前空間が型付きバインディングを提供し、アドレスと ABI が
エクスポートされています。

| プリコンパイル | 関数 | アドレス |
| --- | --- | --- |
| Cross-VM Bridge | （ブリッジルーティング） | `0x0000000000000000000000000000000000000901` |
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

プリコンパイルの ABI は `IQORE_PQC_ABI`、`IQORE_AI_ABI`、
`IQORE_CONSENSUS_ABI` としてエクスポートされています。

> QoreChain プリコンパイルを持たないノードでは、これらの呼び出しは「feature not
> present」エラーをスローします。異種のノードを対象とする場合は、呼び出しごとに処理してください。

実行可能なバージョンについては `evm-precompile` [サンプル](/sdk/examples)を参照してください。
