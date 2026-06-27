---
slug: /sdk/reference/api
title: API リファレンス
sidebar_label: API
sidebar_position: 3
---

# API リファレンス

## TypeScript (`@qorechain/sdk`)

TypeScript パッケージは、その公開インターフェースに完全な TSDoc を備えており、
[TypeDoc](https://typedoc.org) の設定がコアパッケージに組み込まれています。
`@qorechain/sdk` の HTML API リファレンスを生成するには:

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

これは `packages/ts` で定義された `docs:api` スクリプト（`typedoc`）を実行し、
そのパッケージの `docs/` 出力ディレクトリの下に API サイトを生成します。生成された
出力はコミットされません。コマンドをローカルで実行するか、ご自身のドキュメント
パイプラインに組み込んでください。

ドキュメントサイト自体の TypeDoc 設定は `docs/typedoc.json` にあります。これは
コアパッケージのエントリーポイントを指すため、ドキュメントプロジェクトからも
再生成できます。

### 公開インターフェースの概要

`@qorechain/sdk` の意図的にサポートされたエクスポート:

- **クライアント:** `createClient`、型 `QoreChainClient`、`CreateClientOptions`、
  `ConnectTxOptions`、`ClientFees`。
- **ネットワーク:** プリセット、ルックアップ/リストヘルパー、設定型（networks
  モジュール）。
- **ユーティリティ:** `toBase` / `fromBase`（額面）、アドレスのエンコード/検証。
- **アカウント:** `generateMnemonic`、`validateMnemonic`、`deriveNativeAccount`、
  `deriveEvmAccount`、`deriveSvmAccount`、およびアカウント型。
- **PQC:** `generatePqcKeypair`、`pqcSign`、`pqcVerify`、長さ定数、
  アルゴリズム ID/ヘルパー、`PqcSigner`、`HybridSigner`、
  `buildHybridSignatureExtension`、`HYBRID_SIG_TYPE_URL`。
- **読み取りクライアント:** `RestClient`、`JsonRpcClient`、`QorClient`、HTTP ヘルパー
  （`getJson`、`postJsonRpc`、`buildUrl`、`joinUrl`、`QoreHttpError`）。
- **クロス VM:** `getCrossVmMessage`、`getPendingCrossVmMessages`、
  `getCrossVmParams`。
- **CosmWasm:** `createCosmWasmClient`、`connectCosmWasmSigner`、
  `queryContractSmart`、`getContractInfo`、`instantiate`、`execute`、
  `uploadCode`。
- **トランザクション:** `estimateFee`、`directSignerFromPrivateKey`、`TxClient`、
  `MSG_SEND_TYPE_URL`、ハイブリッドヘルパー（`encodeHybridExtension`、
  `attachHybridExtension`、`buildHybridTx`、`signAndBroadcastHybrid`）。

### `@qorechain/evm`

`createEvmClient`、`evmAccountFromPrivateKey`、`erc20` ヘルパー、コントラクト
ラッパー（`deployContract`、`readContract`、`writeContract`）、`precompiles`
バインディング、`PRECOMPILE_ADDRESSES`、そして ABI（`ERC20_ABI`、`IQORE_PQC_ABI`、
`IQORE_AI_ABI`、`IQORE_CONSENSUS_ABI`）。

### `@qorechain/svm`

`createSvmClient`、`DEFAULT_SVM_RPC_URL`、`svmKeypairFromSecretKey`、
`svmAddress`、プログラムビルダー（`createMemoInstruction`、
`createTransferTokenInstruction`、`createAssociatedTokenAccountInstruction`、
`getAssociatedTokenAddress`、`createInvokeInstruction`）、そしてプログラム ID
定数。

## 他の言語

| 言語 | 生成されたドキュメント | インストール |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — 公開 API のドキュメント文字列 | `pip install qorechain-sdk`（`qorsdk` としてインポート） |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go)（godoc） | `go get github.com/qorechain/qorechain-sdk/packages/go/...` |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk)（rustdoc） | `cargo add qorechain-sdk` |

各パッケージは同じインターフェース（ネットワークプリセット、額面/アドレス
ユーティリティ、HD 導出、PQC プリミティブ、REST + `qor_` JSON-RPC 読み取り
クライアント）を反映しており、ソース内にインラインでドキュメント化されているため、
言語ネイティブのドキュメントツールがそれをレンダリングします。
