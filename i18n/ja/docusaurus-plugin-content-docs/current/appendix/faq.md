---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# よくある質問

QoreChain に関する一般的な質問にドキュメントから回答します。各回答は、詳細を網羅した正式なページにリンクしています。SDK 固有の質問については、[SDK FAQ](/sdk/faq) を参照してください。

### メインネットは稼働していますか？

はい。QoreChain メインネット（チェーン `qorechain-vladi`、EVM チェーン ID 9801）は 2026 年 6 月 7 日から稼働しており、リリース v3.2.4 を実行しています（ガバナンス提案 13 により、2026 年 10 月 23 日にブロック高 3,742,566 で適用。ガバナンス提案 14 はブロック高 3,906,833 で v3.2.5 を適用する予定で、執筆時点では投票期間中でした）。テストネット `qorechain-diana` は v3.2.6 を実行しています（2026 年 10 月 27 日にブロック高 8,970,638 で適用）。[ネットワーク](/appendix/networks) および [メインネットへの接続](/getting-started/connecting-to-mainnet) を参照してください。

### チェーン ID と EVM チェーン ID は何ですか？

メインネットは Cosmos チェーン `qorechain-vladi` で、EVM チェーン ID は **9801**（16 進数 `0x2649`）です。テストネットは `qorechain-diana` で、EVM チェーン ID は **9800**（16 進数 `0x2648`）です。完全な表については [ネットワーク](/appendix/networks) を参照してください。

### トランザクション手数料はどのように分配されますか？

徴収された手数料は **37% がバリデータ、30% がバーン、20% がコミュニティトレジャリー、10% がステーカー、3% がライトノード** に分配されます。この分配は、エポック発行分を含め、フィーコレクターにあるすべてに適用されます。[トークノミクス](/architecture/tokenomics#fee-distribution) を参照してください。

### PRISM とは何ですか？

PRISM は、QoreChain コンセンサスエンジンに組み込まれた強化学習最適化レイヤーです。ネットワーク指標を観測し、サーキットブレーカーの安全制御の下で決定論的なコンセンサスパラメータ調整を提案します。現在は観測モードで動作しており、訓練済みのポリシーは読み込まれていないため、パラメータは一切変更されません。[PRISM コンセンサスエンジン](/architecture/prism-consensus-engine) を参照してください。

### クロスチェーンブリッジは稼働していますか？

いいえ。ブリッジモジュールはデプロイされていますが、37 のチェーン構成はすべて保留中で、ブリッジバリデータは登録されておらず、メインネットには IBC チャネルが存在しません（テストネットには、IBC のテスト用に開かれたテストチェーンへの ICS-20 転送チャネルが 1 つだけあり、計画された相手先へのチャネルはありません）。37 のチェーン構成と最大 8 つの IBC カウンターパーティを中心に設計されていますが、これらの目標値は設計意図として扱ってください。[ブリッジアーキテクチャ](/architecture/bridge-architecture) を参照してください。

### ウォレットを接続するにはどうすればよいですか？

公式の [QoreX](/qorex/overview) ウォレットを使用するか、EVM チェーン ID（メインネット 9801、テストネット 9800）を使用して EVM ウォレットに QoreChain ネットワークを追加します。[ウォレットのセットアップ](/getting-started/wallet-setup) を参照してください。

### テストネットトークンを取得するにはどうすればよいですか？

ダッシュボードのテストネットフォーセットを使用します。[ダッシュボードフォーセット](/dashboard/faucet) および [テストネットへの接続](/getting-started/connecting-to-testnet) を参照してください。

### fUSD、fETH、fBTC とは何ですか？

ビルダーフェスト用に作成された、テストネット限定のテストトークン（FestUSD、FestETH、FestBTC。小数桁数はそれぞれ 6、18、8）です。価値はなく、メインネットには存在せず、大文字小文字を区別するデノミネーション `erc20:<contract address>` のバンクコインとして保持されます。テストネットのフォーセットは、QOR のクレームと一緒にこれらを送ることができます。[Fest テストトークン](/dashboard/faucet#fest-tokens) を参照してください。

### ノード、バリデータ、またはライトノードを実行するにはどうすればよいですか？

フルノードについては [ノードの実行](/developer-guide/running-a-node) を参照してください。バリデータについては [バリデータの実行](/developer-guide/running-a-validator) を参照してください。ライトノードについては [ライトノード](/light-node/overview) を参照してください。ライトノード報酬プログラムの登録は受付中で、ライセンスによる制限があります。2026 年 10 月 27 日には、各ネットワークでライトノードが 1 つずつ登録されました（[ステータス](/light-node/overview#reward-program-status)）。

### QoreChain はどの署名方式を使用していますか？

QoreChain は、古典的な **secp256k1 (ECDSA)** とポスト量子の **ML-DSA-87 (Dilithium-5)** を組み合わせたポスト量子ハイブリッド方式を使用します。このハイブリッド方式は Cosmos トランザクションパスでデフォルトで必須であり、強制モードはガバナンスによって制御されます。EVM レーンでは署名は secp256k1 のままで、アカウントはさらに、登録済みの ML-DSA 鍵と開いている承認ウィンドウを保持している必要があります（v3.2.0 以降）。[ポスト量子セキュリティ](/architecture/post-quantum-security) を参照してください。

### EVM トランザクションが「no open EVM authorisation window」で拒否されるのはなぜですか？

v3.2.0 以降、EVM レーンは、登録済みのポスト量子鍵と開いている承認ウィンドウを持つアカウントからのトランザクションのみを受け付けます。ハイブリッド ML-DSA-87 署名（FIPS 204）付きの Cosmos レーントランザクションでウィンドウを開いてから、再試行してください。[EVM 承認ウィンドウ](/getting-started/first-transaction#evm-window) を参照してください。

### メインネットには何人のバリデータがいますか？

2026 年 10 月 27 日時点で、ボンドされているバリデータは 8 人で、ボンドされている QOR は約 6,030 万 QOR です（アクティブセットは最大 100 まで保持できます）。テストネットには 4 人います。稼働中のセットは `https://api.qore.host` の `GET /cosmos/staking/v1beta1/validators` で確認できます。

### ブロック時間はどれくらいを想定すればよいですか？

メインネットでは約 3.1 秒、テストネットでは約 1.3 秒です（実測平均、2026 年 10 月 27 日）。ブロック時間は、バリデータのノード設定によって決まります。

### xQORE は利用できますか？

まだです。会計モジュールは存在しますが、ロックおよびアンロックのトランザクションは稼働中のネットワークには接続されていません。[トークノミクス](/architecture/tokenomics#x-xqore) を参照してください。

### QOR の供給量は固定ですか？

ジェネシス時の供給量は 4,420,000,000 QOR でした。ステーキング発行は累計上限 590,000,000 QOR の下でミントされ（ガバナンス提案 10 以降、1 エポックあたり 86,000 QOR、2026 年 10 月）、バーンによってトークンは恒久的に除去されます。[トークノミクス](/architecture/tokenomics#supply-and-emission) を参照してください。

### ロールアップを構築するにはどうすればよいですか？

QoreChain Rollup Development Kit を使用します。[ロールアップ](/rollups/overview) および [Rollup Development Kit](/architecture/rollup-development-kit) アーキテクチャリファレンスを参照してください。

### dApp を構築するにはどうすればよいですか？

QoreChain の EVM、SVM、QoreChain Native 実行環境全体でアプリケーションを構築するためのパブリック SDK である [QoreChain SDK](/sdk/overview) を使用します。

### 質問はどこでできますか？

QCAIA コミュニティボットが Discord（[discord.gg/qorechain](https://discord.gg/qorechain)）および Telegram（[t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)）で質問に回答します。[QCAIA コミュニティボット](/qcaia/overview) を参照してください。

## 関連項目

* [ネットワーク](/appendix/networks) — チェーン ID、ポート、エンドポイントのリファレンス。
* [QoreChain とは](/introduction/what-is-qorechain) — プラットフォームの概要。
* [QCAIA コミュニティボット](/qcaia/overview) — Discord と Telegram で質問する。
