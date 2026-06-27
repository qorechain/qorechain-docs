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
そして QoreChain の各仮想マシンの利用方法について説明します。

## QoreChain とは

QoreChain は、単一のチェーン上に 3 つのファーストクラスのスマートコントラクト
ランタイムを備えた Layer 1 ブロックチェーンです。

- **CosmWasm** — Cosmos SDK を介した Wasm スマートコントラクト。
- **QoreChain EVM Engine** — Ethereum 互換の実行環境（Solidity、viem、
  標準の JSON-RPC）。
- **SVM** — Solana スタイルの JSON-RPC を備えた Solana 互換ランタイム。

アカウント、残高、トークンは各ランタイム間で共有され、チェーンはクロスチェーン
相互運用性のために IBC をサポートしています。

### 設計から量子耐性

QoreChain は、**ML-DSA-87**（Dilithium-5、FIPS 204）に基づくポスト量子暗号
（PQC）プリミティブを提供します。従来の secp256k1 署名に加えて、チェーンは
トランザクションが従来の署名とポスト量子署名の*両方*を保持する**ハイブリッド**
署名体制をサポートしており、これにより現在の従来型検証の下で有効性を保ちつつ、
ポスト量子保護を獲得できます。

SDK は現在、ML-DSA-87 の鍵生成、署名、検証に加え、ハイブリッド
トランザクションの構成要素を公開しています。詳細は
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc) を参照してください。
ここに誇大な宣伝はありません。SDK はチェーンが実装しているプリミティブを
そのまま公開しています。

## この SDK の特徴

完全なマルチチェーン互換性に加えて、3 つの機能は**QoreChain でのみ可能**です。
これらは、他のどの Layer 1 にもないプロトコル機能の上に構築されているためです。

- **AI 事前リスクスコアリング** — ブロードキャストする前に、オンチェーン AI で
  トランザクションをスキャンします。`simulateWithRiskScore` は、決定論的な EVM
  プリコンパイルからガスとリスク/異常判定を返すため、ウォレットや dApp は署名*前*に
  警告（またはブロック）できます。[AI 事前チェック](/sdk/guides/ai-preflight) を
  参照してください。
- **統合されたクロス VM 呼び出し** — 1 つのアカウント、3 つの VM、1 つの
  トランザクション。`createCrossVMClient` は任意の VM 上のコントラクトを呼び出し、
  `callAtomic` は複数のクロス VM 呼び出しを 1 回署名するだけの単一のアトミック
  トランザクションにまとめます。[クロス VM 呼び出し](/sdk/guides/cross-vm) を
  参照してください。
- **量子耐性の DX** — 1 回の冪等な呼び出し（`ensurePqcRegistered` /
  `migrateToHybrid`）で署名者をポスト量子保護対応にし、ドロップイン可能な React
  バッジを利用できます。[量子耐性](/sdk/guides/quantum-safe) を参照してください。

新しい **`@qorechain/react`** キット（プロバイダー、フック、`ConnectButton`、
`QuantumSafeBadge`）により、量子耐性 dApp の構築がデフォルトの道筋になります。
[React キットガイド](/sdk/guides/react) を参照してください。全体的な理由については、
[なぜ QoreChain SDK か](/sdk/why) をお読みください。

## SDK ファミリー

SDK は、お好みの言語で構築できるよう、パッケージのファミリーとして提供されます。
これらは同じネットワークプリセット、導出スキーム、額面計算、読み取り
インターフェースを共有します。

| パッケージ | 言語 | インストール | ステータス |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | 公開済み（npm、v0.5.0） |
| `qorechain-sdk` | Python | `pip install qorechain-sdk`（`qorsdk` としてインポート） | 公開済み（PyPI、v0.5.0） |
| `qorechain-sdk`（Go モジュール） | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | 公開済み（Go プロキシ、v0.5.0） |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | 公開済み（crates.io、v0.5.0） |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | 公開済み（Maven Central、v0.5.0） |
| `@qorechain/evm` | TypeScript（EVM アダプター） | `npm i @qorechain/evm viem` | 公開済み（npm、v0.5.0） |
| `@qorechain/svm` | TypeScript（SVM アダプター） | `npm i @qorechain/svm @solana/web3.js` | 公開済み（npm、v0.5.0） |
| `@qorechain/react` | TypeScript（React キット） | `npm i @qorechain/react` | 公開済み（npm、v0.5.0） |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | 公開済み（npm、v0.5.0） |

> Python ディストリビューションは `qorechain-sdk` としてインストールされますが、
> **`qorsdk` としてインポート**します。すべてのクライアントは各レジストリに
> 公開されています。言語ごとのコマンドについては [インストール](/sdk/install) を
> 参照してください。

TypeScript コア（`@qorechain/sdk`）は、このドキュメントの例の基礎となります。
Python、Go、Rust、Java の各クライアントは、TypeScript と**完全なネイティブ
チェーン互換性**に達しています。すなわち、ネットワークプリセット、額面/アドレス
ユーティリティ、HD アカウント導出（ネイティブ/EVM/SVM）、PQC（ML-DSA-87）署名、
すべてのカスタムモジュールおよび標準 Cosmos モジュール向けの型付きメッセージ
コンポーザー、型付きクエリクライアント、完全なトランザクションライフサイクル
（自動ガス、エラーデコード、トランザクション追跡、ブロック/トランザクション検索）、
ハイブリッドポスト量子トランザクション、WebSocket サブスクリプションです。
これらのクライアントはすべて**公開されています**。TypeScript は npm
（`@qorechain/sdk` 0.5.0）、Python は PyPI（`qorechain-sdk` 0.5.0、`qorsdk` と
してインポート）、Go はモジュールプロキシ（`.../packages/go` 0.5.0）、Rust は
crates.io（`qorechain-sdk` 0.5.0）、Java は Maven Central
（`io.github.qorechain:qorechain-sdk` 0.5.0）に公開されています。EVM/SVM 実行
アダプター（`@qorechain/evm`、`@qorechain/svm`、いずれも 0.5.0）、
`@qorechain/react` キット（0.5.0）、`create-qorechain-dapp` スキャフォールディング
CLI は TypeScript 専用で、同様に npm に公開されています。

v0.4 リリースでは、ロールアップ出金（`MsgExecuteWithdrawal`、L2→L1 出口パス）、
`multilayer`、`rdk`、`bridge` モジュール向けの型付きクエリクライアント、ブリッジ
管理メッセージ、そして 5 つの言語すべてにわたる高レベルの
サイドチェーン/ペイチェーンおよびロールアップヘルパーが追加されました。

## 次に進む先

- [なぜ QoreChain SDK か](/sdk/why) — QoreChain に固有の 3 つの機能。
- [インストール](/sdk/install) — 言語ごとのインストール手順。
- [クイックスタート](/sdk/quickstart) — 接続、残高の読み取り、送金の送信。
- [概念: アーキテクチャ](/sdk/concepts/architecture) — トリプル VM モデル。
- [概念: アカウントと PQC 署名](/sdk/concepts/accounts-pqc) — 鍵と
  ポスト量子署名。
- [ガイド](/sdk/guides/evm) — VM ごとのハウツー。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network) — チェーン ID、ポート、トークン。
- [サンプル](/sdk/examples) — 実行可能でコピー＆ペーストできるスニペット。
- [ネットワークとエンドポイントのリファレンス](/sdk/reference/network) は [ネットワーク](/appendix/networks) でも紹介されています。
