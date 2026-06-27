---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# よくある質問

QoreChain に関する一般的な質問にドキュメントから回答します。各回答は、詳細を網羅した正式なページにリンクしています。SDK 固有の質問については、[SDK FAQ](/sdk/faq) を参照してください。

### メインネットは稼働していますか？

はい。QoreChain メインネット（チェーン `qorechain-vladi`、EVM チェーン ID 9801）は 2026 年 6 月 7 日から稼働しています。[ネットワーク](/appendix/networks) および [メインネットへの接続](/getting-started/connecting-to-mainnet) を参照してください。

### チェーン ID と EVM チェーン ID は何ですか？

メインネットは Cosmos チェーン `qorechain-vladi` で、EVM チェーン ID は **9801**（16 進数 `0x2649`）です。テストネットは `qorechain-diana` で、EVM チェーン ID は **9800**（16 進数 `0x2648`）です。完全な表については [ネットワーク](/appendix/networks) を参照してください。

### トランザクション手数料はどのように分配されますか？

徴収された手数料は **37% がバリデータ、30% がバーン、20% がコミュニティトレジャリー、10% がステーカー、3% がライトノード** に分配されます。[トークノミクス](/architecture/tokenomics) を参照してください。

### PRISM とは何ですか？

PRISM は、QoreChain コンセンサスエンジンに組み込まれた強化学習最適化レイヤーです。ネットワーク指標を観測し、サーキットブレーカーの安全制御の下で決定論的なコンセンサスパラメータ調整を提案します。[PRISM コンセンサスエンジン](/architecture/prism-consensus-engine) を参照してください。

### クロスチェーンブリッジは稼働していますか？

クロスチェーンブリッジは現在テストネットで保留中であり、まだ本番システムではありません。37 の QCB チェーン構成と 8 つの IBC チャネルを中心に設計されていますが、これらの目標値はライブメインネットの保証ではなく設計意図として扱ってください。[ブリッジアーキテクチャ](/architecture/bridge-architecture) を参照してください。

### ウォレットを接続するにはどうすればよいですか？

ウォレットをセットアップし、EVM チェーン ID（メインネット 9801、テストネット 9800）を使用して QoreChain ネットワークを追加します。[ウォレットのセットアップ](/getting-started/wallet-setup) を参照してください。

### テストネットトークンを取得するにはどうすればよいですか？

ダッシュボードのテストネットフォーセットを使用します。[ダッシュボードフォーセット](/dashboard/faucet) および [テストネットへの接続](/getting-started/connecting-to-testnet) を参照してください。

### ノード、バリデータ、またはライトノードを実行するにはどうすればよいですか？

フルノードについては [ノードの実行](/developer-guide/running-a-node) を参照してください。バリデータについては [バリデータの実行](/developer-guide/running-a-validator) を参照してください。ライトノードについては [ライトノード](/light-node/overview) を参照してください。

### QoreChain はどの署名方式を使用していますか？

QoreChain は、古典的な **secp256k1 (ECDSA)** とポスト量子の **ML-DSA-87 (Dilithium-5)** を組み合わせたポスト量子ハイブリッド方式を使用します。このハイブリッド方式は Cosmos トランザクションパスでデフォルトで必須であり、強制モードはガバナンスによって制御されます。[ポスト量子セキュリティ](/architecture/post-quantum-security) を参照してください。

### ロールアップを構築するにはどうすればよいですか？

QoreChain Rollup Development Kit を使用します。[ロールアップ](/rollups/overview) および [Rollup Development Kit](/architecture/rollup-development-kit) アーキテクチャリファレンスを参照してください。

### dApp を構築するにはどうすればよいですか？

QoreChain の EVM、SVM、CosmWasm 実行環境全体でアプリケーションを構築するためのパブリック SDK である [QoreChain SDK](/sdk/overview) を使用します。

### 質問はどこでできますか？

QCAIA コミュニティボットが Discord（[discord.gg/qorechain](https://discord.gg/qorechain)）および Telegram（[t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)）で質問に回答します。[QCAIA コミュニティボット](/qcaia/overview) を参照してください。

## 関連項目

* [ネットワーク](/appendix/networks) — チェーン ID、ポート、エンドポイントのリファレンス。
* [QoreChain とは](/introduction/what-is-qorechain) — プラットフォームの概要。
* [QCAIA コミュニティボット](/qcaia/overview) — Discord と Telegram で質問する。
