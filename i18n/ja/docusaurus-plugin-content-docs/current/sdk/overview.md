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

- **CosmWasm** — Cosmos SDK による Wasm スマートコントラクト。
- **QoreChain EVM Engine** — Ethereum 互換の実行環境（Solidity、viem、
  標準 JSON-RPC）。
- **SVM** — Solana スタイルの JSON-RPC を備えた Solana 互換ランタイム。

アカウント、残高、トークンはランタイム間で共有され、チェーンはクロスチェーン
相互運用性のために IBC をサポートしています。

### 設計段階からの量子耐性

QoreChain は、**ML-DSA-87**（Dilithium-5、FIPS 204）に基づくポスト量子暗号
（PQC）プリミティブを提供します。従来の secp256k1 署名に加えて、チェーンは
1 つのトランザクションが従来型署名とポスト量子署名の*両方*を持つ
**ハイブリッド**署名方式をサポートしており、現時点では従来型の検証で有効性を
保ちながら、ポスト量子的な保護も同時に得られます。

SDK は現在、ML-DSA-87 の鍵生成、署名、検証に加え、ハイブリッドトランザク
ションの構成要素を提供しています。詳細は
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
  dApp は署名の*前*に警告（またはブロック）できます。
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

さらに、0.6.0 と 0.7.0 では 2 つのチェーンレベルの機能が追加されました。

- **統合 eth ネイティブアカウント** — 1 つの `eth_secp256k1` 鍵が 1 つの
  20 バイトのアイデンティティとなり、`qor1…`、`0x…`、SVM の base58 アドレス
  として表現され、すべてが 1 つの残高を共有します。
  [統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照して
  ください。
- **オーセンティケーターレーン** — Phantom または MetaMask の鍵を、PQC 必須の
  正規アカウントにリンクし、最小権限・支出制限付き・取り消し可能な条件のもと、
  リレイヤー経由で支出できるようにします。
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
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | 公開済み（npm、v0.7.0） |
| `qorechain-sdk` | Python | `pip install qorechain-sdk`（インポートは `qorsdk`） | 公開済み（PyPI、v0.7.0） |
| `qorechain-sdk`（Go モジュール） | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | 公開済み（Go proxy、タグ `packages/go/v0.7.0`） |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk`（インポートは `qorechain`） | 公開済み（crates.io、最新公開版。0.7.0 はリポジトリから） |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | 公開済み（Maven Central、v0.7.0） |
| `@qorechain/evm` | TypeScript（EVM アダプター） | `npm i @qorechain/evm viem` | 公開済み（npm、v0.7.0） |
| `@qorechain/svm` | TypeScript（SVM アダプター） | `npm i @qorechain/svm @solana/web3.js` | 公開済み（npm、v0.7.0） |
| `@qorechain/react` | TypeScript（React キット） | `npm i @qorechain/react` | 公開済み（npm、v0.7.0） |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | 公開済み（npm、v0.7.0） |

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
（`@qorechain/sdk` 0.7.0）、Python は PyPI（`qorechain-sdk` 0.7.0、インポート
は `qorsdk`）、Go はモジュールプロキシ（タグ `packages/go/v0.7.0`）、Rust は
crates.io（`qorechain-sdk`、最新公開版 — 0.7.0 のクレート公開は保留中のため、
crates.io またはリポジトリからインストールしてください）、Java は Maven
Central（`io.github.qorechain:qorechain-sdk` 0.7.0）に公開されています。
EVM/SVM 実行アダプター（`@qorechain/evm`、`@qorechain/svm`、いずれも 0.7.0）、
`@qorechain/react` キット（0.7.0）、および `create-qorechain-dapp`
スキャフォールディング CLI（0.7.0）は TypeScript 専用で、同様に npm に公開
されています。

## 0.6 と 0.7 の新機能

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
`connectPhantomUnified` は決定論的な Phantom 署名からノンカストディアルな統合
アカウントを導出します。従来のコインタイプ 118 の `deriveNativeAccount` は
変更ありません。
[統合アカウント](/sdk/concepts/accounts-pqc#unified-accounts) を参照して
ください。

**0.6.1 — コンセンサスに関わる重要な修正。** `PQCHybridSignature` tx-body
拡張は protobuf エンコードになりました（以前は JSON エンコードで、CheckTx で
拒否されていました）。SDK 0.6.0 以前で構築されたハイブリッドトランザクションは
**オンチェーンで拒否されます** — アップグレードしてください。

**0.7.0 — オーセンティケーターレーン（チェーン v3.1.85）。** リンクされた
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
