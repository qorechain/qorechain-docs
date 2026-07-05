---
slug: /sdk/examples
title: サンプル
sidebar_label: サンプル
sidebar_position: 7
---

# サンプル

実行可能な TypeScript サンプルは、SDK モノレポの
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
ディレクトリにあります。以下で紹介するものに加えて、`ai-preflight`、
`cross-vm-call`、`react-dapp`、`register-sidechain`、`rollup-lifecycle`、
`amm-swap`、`connect-keplr`、`evm-nft`、`subscribe-blocks` も含まれています。各フォルダは
自己完結型のワークスペースパッケージで、
それぞれに `README.md`、`.env.example`、および単一の `index.ts` が用意されています。エンドポイントと
ニーモニックは環境変数から読み込まれ、妥当な localhost のデフォルト値が設定されており、
ネットワークに依存するサンプルは、ノードに到達できない場合にヒントを表示して
適切に失敗するようになっています。

リポジトリのルートで一度インストールすれば、任意のサンプルを実行できます:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> テスト用のニーモニックまたは生成した鍵のみを使用してください。実際のシークレットは絶対にコミットしないでください。

以下のスニペットは各サンプルの `index.ts` を要約したものです。完全に実行可能なプログラムについては、
リンク先のソースを参照してください。

## connect-and-query

クライアントを作成し、公開されているチェーン状態 — ネイティブのバンク残高と
トークノミクスの集計スナップショット — を読み取ります。到達可能なノードが必要です。

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

ニーモニックからネイティブ（`qor1...`）アカウントを導出し、QOR の送金を
ブロードキャストします: 導出 → 署名 → シミュレーション → 手数料見積もり → `bankSend`。
到達可能なコンセンサス RPC と REST、および資金のあるアカウントが必要です。

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

`@qorechain/svm` を使って、QoreChain の Solana 互換（SVM）ランタイム上で
メモ命令付きの SOL 送金を構築します。トランザクションの構築と表示は
オフラインで行われます。送信には到達可能な SVM JSON-RPC と資金のあるアカウントが必要です。

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

`@qorechain/evm`（viem の薄いラッパー）を使って、読み取り専用の QoreChain
プリコンパイルを呼び出し、ERC-20 残高を読み取ります。EVM チェーン ID は
`eth_chainId` で自動検出されます。プリコンパイルのないノードでは、該当する呼び出しは
"feature not present" をスローし、呼び出しごとに報告されます。

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

ML-DSA-87（Dilithium-5、FIPS 204）によるポスト量子署名。**完全に
オフラインで動作 — ノードは不要です。** パート 1 では、メッセージの署名と検証（改ざん
チェック付き）を行います。パート 2 では、古典的な secp256k1 署名と ML-DSA-87 署名の両方を
`PQCHybridSignature` 拡張として含むハイブリッドトランザクションを構築し、
PQC 側をローカルで検証します。

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

デプロイ済みの CosmWasm コントラクトに対して読み取り専用のスマートクエリを実行します。
到達可能なコンセンサス RPC と、デプロイ済みのコントラクトアドレスが必要です。

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

型付きの `qor_*` JSON-RPC 名前空間（`client.qor`）を通じてトークノミクスの状態を
読み取ります。これは EVM JSON-RPC エンドポイント経由で提供されます。3 つの読み取りは
互いに独立しているため、他が利用できない場合でもそれぞれ個別に報告されます。

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

## unified-wallet

**統合 eth ネイティブアカウント**を導出します（SDK 0.6.0）: 1 つの `eth_secp256k1` 鍵が、
1 つの共有残高を持つ QoreChain の 3 つのアドレスすべてとして表現され、さらに
アドレスに紐付いた ML-DSA-87 鍵ペアも導出されます。完全にオフラインで動作します。

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  unifiedAccountFromSeed,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
console.log(account.cosmos); // "qor1…"  — Native lane
console.log(account.evm);    // "0x…"    — EVM lane
console.log(account.svm);    // base58   — SVM lane (same 20 bytes)

// Decode any one encoding into all three.
const all = qoreAddresses({ evm: account.evm });

// Or derive from a raw 32-byte seed instead of a mnemonic.
const fromSeed = unifiedAccountFromSeed(seed32);
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Native オーセンティケーターレーン上で、リレイヤーが送信する `MsgExecuteCosmos` を
構築します（SDK 0.7.0、チェーン v3.1.85）: Phantom 形式の ed25519 鍵が
ドメイン分離された認証ダイジェストに署名し、生成されたメッセージはリレイヤーが
ブロードキャストできる状態になります（手数料はリレイヤーが支払い、外部鍵が ML-DSA の
共同署名を生成することはありません）。ドライラン — ノードは不要です。

```ts
import {
  buildPhantomExecuteCosmos,
  cosmosAuthSignBytes,
  qorechainRegistry,
} from "@qorechain/sdk";

// Show the exact 32-byte digest the wallet signs (byte-exact vs the chain).
const digest = cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce });

// Build the relayer-ready message: the Phantom wallet signs the digest.
const msg = await buildPhantomExecuteCosmos({
  wallet,                 // window.solana in a browser
  relayer,                // submits + pays fees (a DIFFERENT account)
  chainId,
  account,                // the canonical PQC-required owner
  to,
  amount: "100uqor",
  nonce,                  // the per-authenticator sequence
});

// Prove it encodes via the default registry (what the relayer broadcasts).
const bytes = qorechainRegistry().encode(msg);
```

[ソース](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· 完全なウォークスルー:
[オーセンティケーターと委任支出](/sdk/guides/authenticators)
