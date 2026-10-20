---
slug: /sdk/overview
title: QoreChain SDK の概要
sidebar_label: 概要
sidebar_position: 1
---

# QoreChain SDK

QoreChain SDK は、量子耐性を備えたトリプル VM の Layer 1 ネットワークである
**QoreChain** 上で分散型アプリケーションを構築するための、公式の多言語対応
開発者キットです。

このドキュメントでは、SDK のインストール方法、ネットワークへの接続、
オンチェーン状態の読み取り、アカウントの導出、トランザクションの署名と送信、
そして QoreChain の各仮想マシンの扱い方を説明します。

## QoreChain とは？

QoreChain は、単一のチェーン上に 3 つのファーストクラスなスマートコントラクト
ランタイムを備えた Layer 1 ブロックチェーンです。

- **QoreChain Native** — Cosmos SDK による Wasm スマートコントラクト（CosmWasm ランタイム）。
- **QoreChain EVM Engine** — Ethereum 互換の実行環境（Solidity、viem、
  標準 JSON-RPC）。
- **SVM** — Solana スタイルの JSON-RPC を備えた Solana 互換ランタイム。

アカウント、残高、トークンはランタイム間で共有され、チェーンにはクロスチェーン
相互運用性のための IBC モジュールが含まれています（メインネットでもテストネットでも、
IBC チャネルはまだ開かれていません）。

:::note 現在ライブネットワークで動作するもの（メインネット v3.2.3、高さ 3,742,566 以降は v3.2.4。テストネット v3.2.4）
**動作するもの:** すべてのレーンでの読み取り、ハイブリッド署名されたネイティブトランザクション、統合
アカウント、[認可ウィンドウ](/sdk/guides/evm#evm-window)内での EVM トランザクション、
SVM の読み取り。
**まだ利用できないもの:** EVM プリコンパイル（無効）、`qor_` JSON-RPC 名前空間、SVM トランザクション、メインネットでのクロス VM 呼び出し（`MsgCrossVMCall` は
サーキットブレーカーによって停止されています）、通常のアカウントによる QoreChain Native のアップロードとインスタンス化、
オーセンティケーター／抽象アカウントのフロー（モジュールは停止中）、xQORE、
ガスアブストラクション。各ガイドでは、該当する箇所で改めて注意点を示しています。

公開されている SDK（0.9.0、2026年10月21日）は、両ネットワークが検証する形式
（チェーンの状態から解決される v2 ハイブリッド sign-bytes）で署名します。署名形式、
アドレス、小数桁数、メモ、手数料は v3.2.3 でも v3.2.4 でも変わっていません（メインネットは高さ 3,742,566 から v3.2.4 を実行します）。
後続のポスト量子ルールに対するクライアント側（鍵登録時の所有証明、スコープ付き EVM ウィンドウ、
EIP-7702 の同意メッセージ）に対応していますが、0.9.0 より前のバージョンは
対応していません。[0.9.0 より前のバージョン](/sdk/install#before-090)を参照してください。
:::

### 設計段階からの量子耐性

QoreChain は、**ML-DSA-87**（Dilithium-5、FIPS 204）に基づくポスト量子暗号
（PQC）プリミティブを提供します。従来の secp256k1 署名に加えて、チェーンは
1 つのトランザクションが従来型署名とポスト量子署名の*両方*を持つ
**ハイブリッド**署名方式をサポートしており、現時点では従来型の検証で有効性を
保ちながら、ポスト量子的な保護も同時に得られます。

SDK は現在、ML-DSA-87 の鍵生成、署名、検証に加え、ハイブリッドトランザク
ションの構成要素を提供しています。ライブネットワークでは、ネイティブパスの
トランザクションはハイブリッド署名**されていなければならず**、アカウントの
ML-DSA-87 鍵を事前に登録しておく必要があります。詳細は
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。
ここにマーケティング上の誇張はありません — SDK はチェーンが実装している
プリミティブをそのまま公開しています。

## この SDK が他と違う点

完全なマルチチェーン同等性に加えて、3 つの機能は **QoreChain でのみ実現可能**
です。これらは、他のどの Layer 1 にも存在しないプロトコル機能の上に構築されて
いるためです。

- **AI プリフライトリスクスコアリング** — ブロードキャストの前に、オンチェーン
  AI でトランザクションをスキャンします。`simulateWithRiskScore` は、決定論的な
  EVM プリコンパイルによるリスク／異常判定とガスの両方を返すため、ウォレットや
  dApp は署名の*前*に警告（またはブロック）できます。プリコンパイルはメインネットでも
  テストネットでもまだ有効ではありません。
  [AI プリフライト](/sdk/guides/ai-preflight) を参照してください。
- **統合クロス VM 呼び出し** — 1 つのアカウント、3 つの VM、1 つのトランザク
  ション。`createCrossVMClient` は任意の VM 上のコントラクトを呼び出し、
  `callAtomic` は複数のクロス VM 呼び出しを一度の署名で 1 つのアトミックな
  トランザクションにまとめます。
  [クロス VM 呼び出し](/sdk/guides/cross-vm) を参照してください。
- **量子耐性の開発者体験（DX）** — 冪等な 1 回の呼び出し
  （`ensurePqcRegistered` / `migrateToHybrid`）でサイナーをポスト量子保護に
  でき、そのまま使える React バッジも付属します。
  [量子耐性](/sdk/guides/quantum-safe) を参照してください。

さらに、0.6.0 と 0.7.0 では 2 つのチェーンレベルの機能が追加されました
（後者はライブネットワークではまだ使用できません。以下を参照）。

- **統合 eth ネイティブアカウント** — 1 つの `eth_secp256k1` 鍵が 1 つの
  20 バイトのアイデンティティとなり、`qor1…`、`0x…`、SVM の base58 アドレス
  として表現され、すべてが 1 つの残高を共有します。
  [統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照して
  ください。
- **オーセンティケーターレーン** — Phantom または MetaMask の鍵を、PQC 必須の
  正規アカウントにリンクし、最小権限・支出制限付き・取り消し可能な条件のもと、
  リレイヤー経由で支出できるようにします。その背後にある
  `abstractaccount` モジュールは、現在どちらのネットワークでも停止されています。
  [オーセンティケーターと委任支出](/sdk/guides/authenticators) を参照して
  ください。

新しい **`@qorechain/react`** キット（プロバイダー、フック、`ConnectButton`、
`QuantumSafeBadge`）により、量子耐性 dApp の構築が標準の開発パスになります —
[React キットガイド](/sdk/guides/react) を参照してください。全体像については
[QoreChain SDK を選ぶ理由](/sdk/why) をお読みください。

## SDK ファミリー

SDK は、好みの言語で開発できるようにパッケージファミリーとして提供されます。
これらは同じネットワークプリセット、導出スキーム、デノミネーション計算、
読み取りインターフェースを共有しています。

| パッケージ | 言語 | インストール | ステータス |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | 公開済み（npm、v0.9.0） |
| `qorechain-sdk` | Python | `pip install qorechain-sdk`（インポートは `qorsdk`） | 公開済み（PyPI、v0.9.0） |
| `qorechain-sdk`（Go モジュール） | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | 公開済み（Go proxy、タグ `packages/go/v0.9.0`） |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk`（インポートは `qorechain`） | 公開済み（crates.io、v0.9.0） |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.9.1` | 公開済み（Maven Central、v0.9.1。他の言語は 0.9.0） |
| `@qorechain/evm` | TypeScript（EVM アダプター） | `npm i @qorechain/evm viem` | 公開済み（npm、v0.8.0） |
| `@qorechain/svm` | TypeScript（SVM アダプター） | `npm i @qorechain/svm @solana/web3.js` | 公開済み（npm、v0.8.0） |
| `@qorechain/react` | TypeScript（React キット） | `npm i @qorechain/react` | 公開済み（npm、v0.9.0） |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | 公開済み（npm、v0.9.0） |

> Python ディストリビューションは `qorechain-sdk` としてインストールされますが、
> **インポート名は `qorsdk`** です。すべてのクライアントは各レジストリに公開
> されています — 言語ごとのコマンドは [インストール](/sdk/install) を参照して
> ください。

このドキュメントの例は TypeScript コア（`@qorechain/sdk`）を基準にしています。
Python、Go、Rust、Java の各クライアントは、TypeScript との**完全なネイティブ
チェーン同等性**を実現しています。すなわち、ネットワークプリセット、denom／
アドレスユーティリティ、HD アカウント導出（native/EVM/SVM）、PQC（ML-DSA-87）
署名、すべてのカスタムモジュールおよび標準 Cosmos モジュールに対応した型付き
メッセージコンポーザー、型付きクエリクライアント、完全なトランザクション
ライフサイクル（自動ガス、エラーデコード、tx 追跡、ブロック／tx 検索）、
ハイブリッドポスト量子トランザクション、そして WebSocket サブスクリプション
です。これらのクライアントはすべて**公開済み**です。TypeScript は npm
（`@qorechain/sdk` 0.9.0）、Python は PyPI（`qorechain-sdk` 0.9.0、インポート
は `qorsdk`）、Go はモジュールプロキシ（タグ `packages/go/v0.9.0`）、Rust は
crates.io（`qorechain-sdk` 0.9.0）、Java は Maven
Central（`io.github.qorechain:qorechain-sdk` 0.9.1。Java 専用のアップデートで、他のクライアントは 0.9.0）に公開されています。
EVM/SVM 実行アダプター（`@qorechain/evm`、`@qorechain/svm`、いずれも 0.8.0）、
`@qorechain/react` キット（0.9.0）、および `create-qorechain-dapp`
スキャフォールディング CLI（0.9.0）は TypeScript 専用で、同様に npm に公開
されています。関連パッケージについては
[インストール](/sdk/install#related-packages) を参照してください。

## 0.6、0.7、0.8、0.9 の新機能

**0.6.0 — 統合 eth ネイティブアカウント（チェーン v3.1.83）。** 1 つの
`eth_secp256k1` 鍵が 1 つの 20 バイトのアイデンティティとなり、3 つすべての
アドレスエンコーディングとして表現され、すべてのレーンで 1 つの利用可能残高を
共有します。

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

同じ鍵によるネイティブレーンの署名は `signClassicalEth` / `signHybridEth` で、
Phantom や MetaMask の鍵はオーセンティケーターとしてアカウントにリンクします
（Phantom 署名からの導出は 0.8.0 で削除されました）。従来のコインタイプ 118 の `deriveNativeAccount` は
変更ありません。
[統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照して
ください。

**0.6.1 — コンセンサスに関わる重要な修正。** `PQCHybridSignature` tx-body
拡張は protobuf エンコードになりました（以前は JSON エンコードで、CheckTx で
拒否されていました）。SDK 0.6.0 以前で構築されたハイブリッドトランザクションは
**オンチェーンで拒否されます** — アップグレードしてください。

**0.7.0 — オーセンティケーターレーン（チェーン v3.1.85）。** その背後にある
`abstractaccount` モジュールは、現在どちらのネットワークでも停止されています
（[オーセンティケーターガイド](/sdk/guides/authenticators) を参照）。リンクされた
Phantom（ed25519）または MetaMask（secp256k1、20 バイトアドレス指定）の鍵が、
最小権限・支出制限付き・取り消し可能な条件のもと、リレイヤーを通じて PQC 必須
の正規アカウントから支出できます。すなわち、`MsgExecuteEVM` /
`MsgExecuteCosmos` / `MsgRotatePQCKey` コンポーザー、バイト単位で正確な
`evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes` ヘルパー、
`permissionSchema` クエリ、デコード済みエラーコード、そして TypeScript
ウォレットビルダー（`buildPhantomExecuteCosmos`、`buildMetaMaskExecuteEvm`
など）が提供されます。コピー＆ペースト可能な例を含む完全なウォークスルーは、
[オーセンティケーターと委任支出](/sdk/guides/authenticators) を参照して
ください。

**0.8.0 – 0.8.3 — v2 ハイブリッド sign-bytes と EVM 認可ウィンドウ（チェーン
v3.2.0）。** ハイブリッドトランザクションのポスト量子側の署名は、対象ネットワークが
検証する形式（v1 または v2、`signBytesVersion: "auto" | "v1" | "v2"`）で署名される
ようになりました。両方の公開ネットワークは v2 であるため、メインネットで
トランザクションを実行するには SDK **0.8.1 以降**が必要です（0.9.0 を使用してください）。**0.8.2** は、EVM レーンの
[認可ウィンドウ](/sdk/guides/evm#evm-window)向けに `openEvmWindowMsg`、`closeEvmWindowMsg`、
`fetchEvmWindow`、`classifyEvmWindowRejection` を追加します。
**0.8.0** は、ウォレット署名によるアカウントヘルパー（`connectPhantomUnified` と
`unifiedAccountFromPhantomSignature`、0.8.0 で削除）を削除し、すべての言語で厳格な ML-DSA-87
サイズチェックを適用し、クロス VM 呼び出しに `async` フラグと呼び出し先データの返却を追加します。
**0.8.3** は、tx 検索、React フックの競合状態、Python の
`migrate_to_hybrid` のシーケンス処理、およびアドレス形式に依存しない正規の PQC
導出（`derivePqcCanonical`、`canonicalAccount`）を修正します。
[アップグレードノート](/sdk/install#upgrade) を参照してください。

**0.9.0 — チェーン v3.2.2 および v3.2.3 に対するクライアントサポート。** アカウントの鍵ペアを渡すと、
TypeScript の `TxClient` はハイブリッド署名を行うため
（`client.connectTx(signer, { pqcKeypair })`）、`bankSend` や SDK のロールアップ、
マルチレイヤー、クロス VM の各クライアントが公開ネットワークで動作します。`ensurePqcRegistered` は、
まず REST で登録済みの鍵を確認し、別の鍵を 2 つ目として登録することを拒否し、
ネットワークが v3.2.3 を適用した後は所有証明を自動的に添付します。新しいビルダーが、スコープ付き EVM ウィンドウ（`nativeOnly`、`allowedTargets`）と
EIP-7702 の同意メッセージに対応し、`derivePqcCanonical(address, mnemonic)` は、
すべての言語でニーモニックから復元できる鍵を提供します。PQC アカウントのルートは
単数形の `/qorechain/pqc/v1/account/{address}` で、ブロック内での失敗はコードスペースを保持し、
`create-qorechain-dapp` は現行の SDK でスキャフォールドします。
[0.9.0 の新機能](/sdk/install#whats-new-090)を参照してください。

## 次に読むもの

- [QoreChain SDK を選ぶ理由](/sdk/why) — QoreChain 固有の 5 つの機能。
- [インストール](/sdk/install) — 言語ごとのインストール手順。
- [クイックスタート](/sdk/quickstart) — 接続、残高の読み取り、送金の実行。
- [概念: アーキテクチャ](/sdk/concepts/architecture) — トリプル VM モデル。
- [概念: アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — 鍵と
  ポスト量子署名。
- [ガイド](/sdk/guides/evm) — VM ごとのハウツー。
- [オーセンティケーターと委任支出](/sdk/guides/authenticators) — リレイヤー
  経由で支出するリンク済みの Phantom/MetaMask 鍵。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network) — チェーン ID、ポート、トークン。
- [サンプル](/sdk/examples) — 実行可能でコピー＆ペースト可能なスニペット。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network) は [ネットワーク](/appendix/networks) にも掲載されています。
