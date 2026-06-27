---
slug: /sdk/examples
title: サンプル
sidebar_label: サンプル
sidebar_position: 7
---

# サンプル

実行可能な 7 つの TypeScript サンプルが、SDK モノレポの
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
ディレクトリにあります。各フォルダは独立したワークスペースパッケージであり、
それぞれ独自の `README.md`、`.env.example`、そして単一の `index.ts` を備えています。これらは
環境変数からエンドポイントとニーモニックを読み取り、妥当な localhost のデフォルト値を持ちます。
また、ネットワークに依存するものは、到達可能なノードが存在しない場合にヒントを添えて
正常に失敗します。

リポジトリのルートから一度インストールすれば、任意のサンプルを実行できます。

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> テスト用のニーモニックまたは生成した鍵のみを使用してください。本物のシークレットを決してコミットしないでください。

以下のスニペットは、各サンプルの `index.ts` を凝縮したものです。完全で実行可能なプログラムについては、
リンク先のソースを参照してください。

## connect-and-query

クライアントを作成し、公開されているチェーンの状態を読み取ります。ネイティブの bank 残高と、
集約されたトークノミクスのスナップショットを取得します。到達可能なノードが必要です。

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    rest: process.env.QORE_REST_URL ?? "http://localhost:1317",
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const balances = await client.rest.getAllBalances(address);
const overview = await client.qor.getTokenomicsOverview();
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

ニーモニックからネイティブ（`qor1...`）アカウントを導出し、QOR 送金をブロードキャストします。
derive → sign → simulate → estimate fee → `bankSend` の流れです。到達可能なコンセンサス RPC、
REST、そして資金を持つアカウントが必要です。

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, prefix);

const amount = [{ denom: baseDenom, amount: toBase("1.5") }]; // "1500000" uqor

const tx = await client.connectTx(signer);
const gasEstimate = await tx.simulate(messages);
const fee = await client.fees.estimate("normal");
const result = await tx.bankSend(recipient, amount, { fee });
console.log(result.transactionHash);
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

`@qorechain/svm` を使って、QoreChain の Solana 互換（SVM）ランタイム上で memo 命令付きの
SOL 送金を構築します。トランザクションをオフラインで構築して出力します。送信するには、
到達可能な SVM JSON-RPC と資金を持つアカウントが必要です。

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

`@qorechain/evm`（viem の薄いラッパー層）を使って、読み取り専用の QoreChain プリコンパイルを
呼び出し、ERC-20 残高を読み取ります。EVM のチェーン ID は `eth_chainId` によって自動検出されます。
プリコンパイルを持たないノードでは、これらの呼び出しは「feature not present」をスローし、
呼び出しごとに報告されます。

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

ML-DSA-87（Dilithium-5、FIPS 204）によるポスト量子署名です。**完全にオフラインで動作し、
ノードは不要です。** パート 1 ではメッセージに署名して検証します（改ざんチェック付き）。
パート 2 では、古典的な secp256k1 署名と ML-DSA-87 署名の両方を `PQCHybridSignature` 拡張として
保持するハイブリッドトランザクションを構築し、その後 PQC 部分をローカルで検証します。

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  buildHybridTx,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("QoreChain is quantum-safe");
const signature = pqcSign(keypair.secretKey, message);
const valid = pqcVerify(keypair.publicKey, message, signature);

const built = await buildHybridTx({
  registry,
  signer,
  pqcKeypair,
  messages,
  fee: { amount: [{ denom: "uqor", amount: "5000" }], gas: "200000" },
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  includePqcPublicKey: true, // embed the key for auto-registration on first use
});
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

デプロイ済みの CosmWasm コントラクトに対して、読み取り専用のスマートクエリを実行します。
到達可能なコンセンサス RPC とデプロイ済みのコントラクトアドレスが必要です。

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: process.env.QORE_RPC_URL ?? "http://localhost:26657" },
});

const cw = await client.cosmwasm(); // read-only, memoized on the client
const info = await getContractInfo(cw, contract);
const result = await queryContractSmart(cw, contract, { token_info: {} });
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

EVM JSON-RPC エンドポイント経由で提供される、型付きの `qor_*` JSON-RPC 名前空間
（`client.qor`）を通じてトークノミクスの状態を読み取ります。3 つの読み取りは
互いに独立しているため、他が利用できなくてもそれぞれが報告されます。

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
