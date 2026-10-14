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
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

`rpcUrl` を直接渡すこともできます（`endpoints` と相互排他）。WebSocket 用の
`wsUrl` / `endpoints.evmWs`（テストネットでは `wss://evm-ws-testnet.qore.host`）、明示的な `chainId`、`decimals`
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

## EVM 認可ウィンドウ（チェーン v3.2.0） {#evm-window}

チェーンバージョン **v3.2.0**（メインネットはブロック 2,981,742 から、テストネットはブロック
5,920,000 から）以降、EVM レーンは、**登録済みの ML-DSA-87 鍵**と**開いている認可
ウィンドウ**を持つアカウントからのトランザクションのみを受け入れます。読み取り
（`eth_call`、残高、レシート）とガス見積もりはウィンドウなしでも動作し、MetaMask、
viem、ethers、Hardhat、Foundry などのウォレットやライブラリはこれまでどおり署名します。
変わるのは、ポスト量子の認可がトランザクションの*前*に、ハイブリッド署名された
ネイティブレーンのメッセージとして送られる点です。チェーンレベルのルール、上限、
CLI の形式、拒否コードは
[EVM 認可ウィンドウ](/getting-started/first-transaction#evm-window)にあります。

SDK **0.8.2 以降**では、コードからウィンドウを開くことができます。鍵の登録（1 回のみ）は
[量子耐性](/sdk/guides/quantum-safe)で説明しています。以下の例では、その後に
統合 eth ネイティブアカウント用のウィンドウを開きます（`npm i @cosmjs/stargate`）:

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

ウィンドウを開くとアカウントのノンスが進みます（アイデンティティは 1 つで、Cosmos の
シーケンスが EVM のノンスです）。そのため、EVM ノンスはウィンドウが開いた**後**に読み取り、
その時点で EVM トランザクションに署名してください。`maxValue` は、各トランザクションの
値**と**最大手数料（ガスリミット × 手数料上限）の合計を制限します。21,000 ガス、
112.5 gwei での 1,000 uqor の送金は、ウィンドウから 3,363 uqor を消費します。
ウィンドウを開くのは、ユーザーが求めたときだけにしてください。自動で開いてはいけません。

EVM レーンがトランザクションを拒否した場合、`classifyEvmWindowRejection(err)` が
その理由を教えてくれます:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` は対応するクローズメッセージを構築し、`MAX_EVM_WINDOW_BLOCKS` と
`MAX_EVM_WINDOW_TXS` は上限をエクスポートします。

## プリコンパイル

QoreChain は固定アドレスでコントラクトから呼び出し可能なプリコンパイルを公開しています。
`precompiles` 名前空間が型付きバインディングを提供し、アドレスと ABI が
エクスポートされています。

> **まだ有効ではありません。** QoreChain のプリコンパイルはノードにコンパイルされて
> いますが、メインネット（`qorechain-vladi`）でもテストネット
> （`qorechain-diana`）でもまだ有効化されていません。呼び出しは空のデータを返すため、
> これらのヘルパーは現在、公開ネットワークでもスローします。
> [EVM プリコンパイル: ネットワークステータス](/developer-guide/evm-precompiles#network-status)を参照してください。

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

プリコンパイルの ABI は `IQORE_PQC_ABI`、`IQORE_AI_ABI`、
`IQORE_CONSENSUS_ABI` としてエクスポートされています。

> プリコンパイルが有効でない場合（現在はすべての公開ネットワーク）、または QoreChain
> プリコンパイルを持たないノードでは、これらの呼び出しは「feature not
> present」エラーをスローします。呼び出しごとに処理してください。

実行可能なバージョンについては `evm-precompile` [サンプル](/sdk/examples)を参照してください。
