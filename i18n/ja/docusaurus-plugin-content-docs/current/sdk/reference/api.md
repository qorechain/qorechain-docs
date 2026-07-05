---
slug: /sdk/reference/api
title: APIリファレンス
sidebar_label: API
sidebar_position: 3
---

# APIリファレンス

## TypeScript（`@qorechain/sdk`）

TypeScriptパッケージは公開APIサーフェス全体に完全なTSDocを同梱しており、コアパッケージには[TypeDoc](https://typedoc.org)の設定が組み込まれています。`@qorechain/sdk`のHTML版APIリファレンスを生成するには、次を実行します。

```bash
# from the monorepo root
pnpm --filter @qorechain/sdk docs:api
```

これは`packages/ts`で定義されている`docs:api`スクリプト（`typedoc`）を実行し、当該パッケージの`docs/`出力ディレクトリ配下にAPIサイトを生成します。生成された出力はコミットされません — コマンドをローカルで実行するか、独自のドキュメントパイプラインに組み込んでください。

ドキュメントサイト自体のTypeDoc設定は`docs/typedoc.json`にあります。コアパッケージのエントリポイントを指しているため、docsプロジェクト側からも再生成できます。

### 公開サーフェスの概要

`@qorechain/sdk`が意図的にサポートしているエクスポートは次のとおりです。

- **クライアント:** `createClient`、型 `QoreChainClient`、`CreateClientOptions`、
  `ConnectTxOptions`、`ClientFees`。
- **ネットワーク:** プリセット、検索／一覧ヘルパー、および設定型（networksモジュール）。
- **ユーティリティ:** `toBase` / `fromBase`（denom）、アドレスのエンコード／検証。
- **アカウント:** `generateMnemonic`、`validateMnemonic`、`deriveNativeAccount`、
  `deriveEvmAccount`、`deriveSvmAccount`、およびアカウント型。
- **統合アカウント（0.6.0）:** `deriveUnifiedAccount`、
  `unifiedAccountFromSeed`、`addressesFrom20`、`qoreAddresses`、
  `unifiedAccountFromPhantomSignature`、`connectPhantomUnified`。
- **PQC:** `generatePqcKeypair`、`pqcSign`、`pqcVerify`、長さ定数、
  アルゴリズムID／ヘルパー、`PqcSigner`、`HybridSigner`、
  `buildHybridSignatureExtension`、`HYBRID_SIG_TYPE_URL`。
- **読み取りクライアント:** `RestClient`（`getPermissionSchema`を含む）、
  `JsonRpcClient`、`QorClient`、HTTPヘルパー（`getJson`、`postJsonRpc`、
  `buildUrl`、`joinUrl`、`QoreHttpError`）。また、`amm`、`license`、
  `abstractaccount`（`permissionSchema`）を含む全モジュールの型付きクエリ
  クライアント、および`multilayer`の`Anchor`/`Anchors`ステートアンカー
  クエリ。
- **クロスVM:** `getCrossVmMessage`、`getPendingCrossVmMessages`、
  `getCrossVmParams`。
- **CosmWasm:** `createCosmWasmClient`、`connectCosmWasmSigner`、
  `queryContractSmart`、`getContractInfo`、`instantiate`、`execute`、
  `uploadCode`。
- **トランザクション:** `estimateFee`、`directSignerFromPrivateKey`、`TxClient`、
  `MSG_SEND_TYPE_URL`、ハイブリッドヘルパー（`encodeHybridExtension`、
  `attachHybridExtension`、`buildHybridTx`、`signAndBroadcastHybrid`）。
  `decodeTxError`による構造化エラーデコード（`abstractaccount`の
  コード5/6/10/11および`pqc`のコード21を含む）。
- **ethネイティブ署名（0.6.0）:** `signClassicalEth`、`signHybridEth`
  （`keccak256(SignDoc)`に対するsecp256k1、公開鍵タイプ
  `/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`、さらにML-DSA-87ハイブリッド
  拡張を付加）、`EthNativeSigner`、`accountAuthInfo`。
- **オーセンティケータレーン（0.7.0）:** メッセージコンポーザ
  `msg.abstractaccount.registerAuthenticator` / `revokeAuthenticator` /
  `executeEvm` / `executeCosmos` および `msg.pqc` ローテーション
  （`executeEvmMsg`、`executeCosmosMsg`、
  `registerEthAuthenticatorMsg`、`revokeAuthenticatorMsg`、
  `rotatePqcKeyMsg`として単体でもエクスポート）。バイト単位で正確な
  署名バイト列 `evmAuthSignBytes`、`cosmosAuthSignBytes`、
  `rotationSignBytes`。ウォレットビルダー
  `buildPhantomExecuteEvm` / `buildPhantomExecuteCosmos`（ed25519
  `signMessage`）および `buildMetaMaskExecuteEvm` / `buildMetaMaskExecuteCosmos`
  （EIP-191 `personal_sign`）。鍵ローテーション `rotatePqcKeyMsgFromMnemonic`、
  `derivePqcLegacy`。詳細は
  [オーセンティケータガイド](/sdk/guides/authenticators)を参照してください。

### `@qorechain/evm`

`createEvmClient`、`evmAccountFromPrivateKey`、`erc20`ヘルパー、コントラクトラッパー（`deployContract`、`readContract`、`writeContract`）、`precompiles`バインディング、`PRECOMPILE_ADDRESSES`、および各種ABI（`ERC20_ABI`、`IQORE_PQC_ABI`、`IQORE_AI_ABI`、`IQORE_CONSENSUS_ABI`）。

### `@qorechain/svm`

`createSvmClient`、`DEFAULT_SVM_RPC_URL`、`svmKeypairFromSecretKey`、`svmAddress`、プログラムビルダー（`createMemoInstruction`、`createTransferTokenInstruction`、`createAssociatedTokenAccountInstruction`、`getAssociatedTokenAddress`、`createInvokeInstruction`）、およびプログラムID定数。

## その他の言語

| 言語 | 生成ドキュメント | インストール |
| --- | --- | --- |
| Python | [PyPI](https://pypi.org/project/qorechain-sdk/) — 公開APIにdocstringを完備 | `pip install qorechain-sdk`（バージョン`0.7.0`、インポート名は`qorsdk`） |
| Go | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go)（godoc） | `go get github.com/qorechain/qorechain-sdk/packages/go/...`（タグ `packages/go/v0.7.0`） |
| Rust | [docs.rs](https://docs.rs/qorechain-sdk)（rustdoc） | `cargo add qorechain-sdk` — 公開済みの最新クレート（リポジトリの0.7.0、インポート名は`qorechain`） |
| Java | Maven Central のjavadoc | `io.github.qorechain:qorechain-sdk:0.7.0` |

各パッケージは同一のサーフェス（ネットワークプリセット、denom／アドレスユーティリティ、HD導出 — 統合ethネイティブアカウントを含む — PQCプリミティブとハイブリッド署名、型付きメッセージとクエリ、オーセンティケータレーン、REST + `qor_` JSON-RPC読み取りクライアント）を提供し、各言語ネイティブのドキュメントツールでレンダリングされるようソース内にインラインで文書化されています。TypeScriptのウォレットビルダー（`buildPhantom*` / `buildMetaMask*`）とブラウザウォレットアダプタはTypeScript専用です。
