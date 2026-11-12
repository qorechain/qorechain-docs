---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: 概要
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** は、[build.qorechain.io](https://build.qorechain.io) でオンライン開催される QoreChain の開発者フェストで、ハッシュタグは #BuildBeforeQDay です。参加者はレベルを選び、オープンソースのキットを使って QoreChain のテストネット上で構築し、公開の場で成果を発信し、審査員とコミュニティに自分のプロジェクトを発表します。フェストと並行して、毎週1回の技術ワークショップがあります。各ワークショップには、最初のコマンドから最後のコマンドまでを網羅した、このセクションのステップバイステップのガイドがあるので、開発が初めての方でも、ご自身のコンピューターで好きなペースで、すべてを進められます。サンプルアプリは、公開リポジトリ [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) にまとめられています。

## 革新的な点 {#innovations}

このセクションのどのワークショップも、QoreChain を特別なものにしている機能を中心に構成されています。

- **ハイブリッド署名。** トランザクションは2回署名されます。従来型の secp256k1 鍵で1回、耐量子の ML-DSA-87 鍵で1回です。従来型の鍵だけを盗んだ人は、2つ目の署名を作れません。
- **オンチェーンで検証される。** バリデーターが両方の署名を確認します。トランザクションには `PQCHybridSignature` 拡張が付き、チェーンはステータス `verified` の `pqc_hybrid_verify` イベントを発行します。どちらも公開 REST エンドポイントから読み取れ、結果はエクスプローラーで確認できます。
- **おなじみのツール。** Hardhat、Foundry、または使い慣れた言語をそのまま使えます。耐量子鍵と認可ウィンドウの扱いは、キットが引き受けます。

## 仕組み {#how-it-works}

1. [build.qorechain.io](https://build.qorechain.io) で**登録**します。GitHub でサインインし、レベルを選び、X と QoreX を連携します。
2. キット、毎週のワークショップ、ハック中盤のチャレンジを使って、テストネット上で**構築**します。コミットや更新は、公開フィードに表示されます。
3. 締め切りまでに、公開リポジトリ、3分以内の動画、プロジェクトが使うテストネットのアドレスを添えて**提出**します。

参加は無料です。テストネットで構築し、テスト用 QOR は[フォーセット](/dashboard/faucet)から入手します。参加資格、提出、審査の完全なルールは、フェストサイトの Rules ページにあります。賞金総額は合計 $20,000 で、2027年1月からは QOR による継続助成金もあります。内訳はフェストサイトに掲載されています。

## レベル {#levels}

登録時にレベルを選びます。あとから変更することもできます。

| レベル | 対象 |
| --- | --- |
| Quantum Pass | QoreChain や web3 が初めての方。ハイブリッド耐量子トランザクションを送信し、チェーンから読み戻す小さなアプリを作ります。 |
| Intermediate | dApp をリリースした経験がある方。QoreChain SDK と QoreX で完全なアプリケーションを作ります。 |
| Advanced | 3つのトラック: A、エージェント。B、QoreSeal による暗号化アプリケーション。C、EVM レーンと Native レーンにまたがるクロス VM アプリ。 |
| Expert | プロトコルインフラ: RDK によるロールアップ、QORel による IBC、カストディと開発者ツール。 |

Workshop 1 は、Quantum Pass レベルが求める内容そのものを扱います。ハイブリッド署名されたトランザクションを、オンチェーンで検証します。

## スケジュール {#timeline}

時刻はすべて UTC です。

| いつ | 内容 |
| --- | --- |
| 2026年11月4日 | 登録と構築の開始 |
| 毎週 | ワークショップ1回（合計4回）と、ここにあるステップバイステップのガイド |
| 2026年11月18日 | ハック中盤のチャレンジ開始 |
| 2026年12月2日 23:59 | 提出締め切り |
| 12月3日から5日 | 提出物のチェック |
| 12月6日から15日 | 審査と People's Choice 投票 |
| 12月16日 | 受賞者発表とライブデモショー |
| 12月17日から22日 | 賞金の支払い |
| 2027年1月 | 継続助成金 |

スケジュールはフェストサイトに掲載されています。

## 対象者 {#who}

ブロックチェーンや耐量子暗号の知識は必要ありません。ターミナルを開いてコマンドを貼り付けられれば、ここにあるすべてのガイドに従えます。各ガイドでは、すべてのコマンドが何をするのか、その各部分が何を意味するのかを平易な言葉で説明し、そのうえで画面に表示される内容を示します。ガイドに「コマンドに少し時間がかかることがあります」とある場合は、終わるまで待ってから次のコマンドを実行してください。

## チュートリアルを選ぶ {#choose}

まず **Workshop 1 ガイド**から始めてください。何もないコンピューターから、2つの鍵で署名されオンチェーンで確認される1つのトランザクションまでを網羅した、完全な道のりです。そのあとは、下のアプリから好きなものを選んでください。同じ考え方を、異なる言語やツールで示しています。

所要時間は、ツールをインストールしたあとの手順についてのものです。初めてツールをインストールする場合は、さらに約20分から40分かかります。[始める前に](/build-before-qday/prerequisites)を参照してください。

| チュートリアル | レベル | 言語 | 所要時間 | 最後に手に入るもの |
| --- | --- | --- | --- | --- |
| [Workshop 1 ガイド](/build-before-qday/workshop-1) | Beginner | TypeScript、Solidity | 30分 | スキャフォールド、テスト、テストネットへのデプロイまで行ったプロジェクトと、オンチェーンで検証された1つのハイブリッド署名トランザクション。 |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Beginner | TypeScript、Solidity | 25分 | ハイブリッド署名のフローで値を増やす、テストネット上のカウンターコントラクト。 |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermediate | TypeScript、Solidity、React | 45分 | あなた自身のオンチェーンのゲストブックと、QoreX ウォレットで署名する Web ページ。 |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Beginner | TypeScript、React | 25分 | QoreX から QOR を送り、2つの署名とチェーンの判定を表示する Web ページ。 |
| [Rust、qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermediate | Rust | 25分 | ハイブリッド署名で支払い、オンチェーンで検証するコマンドラインアプリ。 |
| [Java、Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermediate | Java 21 | 25分 | チップを送り、耐量子署名された支払いだけを受け付けるバックエンド。 |
| [Python、Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Beginner | Python | 20分 | 複数のアドレスに支払う1つのトランザクション。両方の鍵で署名され、オンチェーンで検証されます。 |

ここでのレベルの意味は次のとおりです。

- **Beginner:** 順番に貼り付けるだけの数個のコマンド。コードを書く必要はありません。
- **Intermediate:** 同じ流れに加えて、Web ページ、ウォレット拡張機能、まだ使ったことがないかもしれない言語のツールチェーンなど、2つ目のツールが必要です。

どのチュートリアルも同じ構成です。**始める前に**、番号付きの手順（各コマンドに、何をするかと各部分の意味を添えています）、**表示される内容**、トランザクションをオンチェーンで**確認する**方法、そして**トラブルシューティング**の表です。

## 始める前に {#before-you-start}

[始める前に: ツールとテストネットウォレット](/build-before-qday/prerequisites)を一度お読みください。次の内容を扱っています。

- macOS、Windows、Linux での Node.js、pnpm、Git、Rust、Java、Maven、Python、jq のインストールと、それぞれの確認コマンド。
- テストネットでの QoreX ウォレットの設定。
- フォーセットからのテスト用 QOR の入手（アカウントごとに24時間に 100 QOR）。
- QOR と uqor: 1 QOR は 1,000,000 uqor です。
- 使い捨てのテストネット鍵の安全な扱い方。使うのはテストアカウントだけで、本物の資金が入ったウォレットは決して使わないでください。

## どこから始めるか {#where-to-start}

1. [始める前に](/build-before-qday/prerequisites)を読み、最初のチュートリアルに必要なツールをインストールします。
2. テストネットで [Workshop 1 ガイド](/build-before-qday/workshop-1)に従います。
3. 上の表のサンプルアプリを1つ試します。
4. QoreChain にデプロイしたことがない場合は、[5分でデプロイ](/getting-started/deploy-in-5-minutes)で考え方を詳しく説明しています。アプリの土台になっているキットは、[キット](/build-before-qday/workshop-1/kits)のページにあります。

## コード {#code}

サンプルアプリはすべて、1つの公開リポジトリの `workshop-1` フォルダーにあります: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday)。どのフォルダーを開くかは、各チュートリアルに書かれています。コードは、次のコマンドで一度だけ取得します。

```bash
git clone https://github.com/qorechain/build-before-qday
```

| 部分 | 何をするか |
| --- | --- |
| `git clone` | コードリポジトリの完全なコピーを、あなたのコンピューターにダウンロードします。 |
| `https://github.com/qorechain/build-before-qday` | コピーするリポジトリのアドレスです。 |

**表示される内容:** コマンドを実行したフォルダーの中に、`build-before-qday` という新しいフォルダーができます。
