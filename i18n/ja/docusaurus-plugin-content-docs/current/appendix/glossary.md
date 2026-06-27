---
slug: /appendix/glossary
title: 用語集
sidebar_label: 用語集
sidebar_position: 1
---

# 用語集

QoreChain ドキュメント全体で使用される用語、略語、頭字語のアルファベット順リファレンスです。

---

**AMM** — Automated Market Maker（自動マーケットメーカー）。QoreChain のネイティブなオンチェーン流動性モジュール（`x/amm`）で、外部のスマートコントラクトデプロイなしに、プロトコルレベルで直接、定数積プール、スワップ、流動性提供を提供します。[AMM](/architecture/amm) を参照してください。

**BPF** — Berkeley Packet Filter。SVM ランタイムがオンチェーンプログラムを実行するために使用するバイトコード形式。プログラムはデプロイ前に BPF にコンパイルされます。

**Chain License** — `x/license` モジュールによって管理されるオンチェーンライセンスレコード。チェーンライセンスは特定のプロトコル機能へのアクセスをゲートし、オペレーターがライセンス権限をオンチェーンで登録、検証、管理できるようにします。[チェーンライセンシング](/architecture/chain-licensing) を参照してください。

**CLFB** — Cross-Layer Fee Balancing（クロスレイヤー手数料バランシング）。マルチレイヤーアーキテクチャ内のメカニズムで、サイドチェーンとペイチェーン間の手数料を動的に調整して均衡を維持し、単一レイヤーでの混雑を防ぎます。

**CPI** — Cross-Program Invocation（クロスプログラム呼び出し）。SVM ランタイム内のメカニズムで、デプロイ済みのあるプログラムが同じトランザクションコンテキスト内で別のプログラムを呼び出せるようにします。

**CPoS** — Classified Proof-of-Stake（分類型プルーフ・オブ・ステーク）。QoreChain のコンセンサス分類システムで、レピュテーションスコアに基づいてバリデータを 3 つのプール（Emerald、Sapphire、Ruby）にグループ化します。各プールはプロポーザー選択アルゴリズムで異なる重みを持ちます。

**DA** — Data Availability（データ可用性）。チェーンに公開されたトランザクションデータが任意のノードによって取得可能であることの保証。RDK モジュールはロールアップ向けにネイティブな DA を提供し、設定可能な保持期間でブロブをオンチェーンに保存します。

**DPoS** — Delegated Proof-of-Stake（委任型プルーフ・オブ・ステーク）。トークン保有者が自分のステークをバリデータに委任し、バリデータが代わりにブロックを生成するコンセンサスメカニズム。QoreChain は DPoS をレピュテーション加重分類（CPoS）で拡張しています。

**EIP-1559** — Ethereum Improvement Proposal 1559。基本手数料（バーンされる）と優先手数料（バリデータに支払われる）を使用するトランザクション手数料モデル。QoreChain は QoreChain EVM エンジンで EIP-1559 スタイルの手数料メカニズムを実装しています。

**HCS** — Hybrid Cryptographic Signatures（ハイブリッド暗号署名）。QoreChain のデュアル署名システムで、トランザクションは古典署名（secp256k1/ECDSA）とポスト量子署名（ML-DSA-87）の両方を持ち、古典的および量子的な攻撃者の両方に対する暗号的セキュリティを提供します。

**IBC** — Inter-Blockchain Communication（ブロックチェーン間通信）。独立したブロックチェーン間で認証されたメッセージパッシングを行うプロトコル。QoreChain はクロスチェーンのトークン転送とデータリレーのために IBC チャネルをサポートしています。

**Light Node** — フル状態を保持せずにチェーンをフォローし、軽量なクエリを提供するリソース軽量ノード。ライトノードはプロトコル手数料分配の専用 **3%** シェアを受け取り、ネットワークの到達範囲を拡大する参加者に報酬を与えます。[ライトノード](/light-node/overview) を参照してください。

**MEV** — Maximal Extractable Value（最大抽出可能価値）。ブロック内でトランザクションを並べ替え、挿入、または検閲することで得られる利益。QoreChain の FairBlock モジュール（tIBE 暗号化）と 5 レーンの TX 優先順位付けは MEV の抽出を緩和します。

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm（モジュール格子デジタル署名アルゴリズム、セキュリティレベル 5）。QoreChain が量子耐性トランザクション署名に使用する、NIST 標準化されたポスト量子デジタル署名方式。署名は 4,627 バイト、公開鍵は 2,592 バイトを生成します。

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism（モジュール格子鍵カプセル化メカニズム、セキュリティレベル 5）。将来の暗号化通信チャネル向けに QoreChain の PQC アルゴリズムレジストリで利用可能な、NIST 標準化されたポスト量子鍵カプセル化方式。

**MLP** — Multi-Layer Perceptron（多層パーセプトロン）。QCAI が不正検知と異常スコアリングにおけるパターン認識に使用するニューラルネットワークの一種。

**PPO** — Proximal Policy Optimization（近接方策最適化）。観測されたネットワーク状況に基づいてチェーンパラメータ（ブロックサイズ、ガス上限、バリデータセットサイズ）を最適化するために PRISM が使用する強化学習アルゴリズム。

**PQC** — Post-Quantum Cryptography（ポスト量子暗号）。古典コンピュータと量子コンピュータの両方からの攻撃に対して安全になるように設計された暗号アルゴリズム。QoreChain は `x/pqc` モジュールを通じて、ML-DSA-87 を主要署名方式として PQC を実装しています。

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines。QoreChain コンセンサスエンジンに（`x/rlconsensus` モジュールを介して）組み込まれた強化学習最適化レイヤー。PRISM はネットワーク指標を観測し、サーキットブレーカーの安全制御の下で決定論的なコンセンサスパラメータ調整を提案します。[PRISM コンセンサスエンジン](/architecture/prism-consensus-engine) を参照してください。

**PvP Rebase** — Player versus Player Rebase（プレイヤー対プレイヤーリベース）。xQORE モジュール内のメカニズムで、早期アンロックによるペナルティが残りのロック済みステーカーに比例して再分配され、長期的なコミットメントに報酬を与えます。

**QCAI** — QoreChain Artificial Intelligence。QoreChain の AI サブシステムの包括的な用語で、オンチェーンのヒューリスティックエンジン（`x/ai` モジュール）と、高度な推論機能を提供するオフチェーンの QCAI サイドカーを含みます。

**QCB** — QoreChain Bridge。非 IBC チェーン（例: Ethereum、Bitcoin、Solana、Avalanche）への接続のための QoreChain のネイティブブリッジプロトコル。QCB はクロスチェーン認証にフェデレーテッドバリデータセットを使用します。[ブリッジアーキテクチャ](/architecture/bridge-architecture) を参照してください。

**QDRW** — QoreChain Dynamic Reward Weighting（QoreChain 動的報酬重み付け）。PRISM が（ガバナンス承認の下で）バリデータプール全体の報酬分配重みを動的に調整し、ネットワークヘルス指標を最適化できるようにするガバナンスメカニズム。

**RDK** — Rollup Development Kit。4 つの決済パラダイム（optimistic、zk、based、sovereign）、5 つのプリセットプロファイル、統合されたデータ可用性を備えた、ロールアップのデプロイと管理のための QoreChain のネイティブフレームワーク。[ロールアップ概要](/rollups/overview) を参照してください。

**RL** — Reinforcement Learning（強化学習）。エージェントが試行と報酬を通じて最適なアクションを学習する機械学習アプローチ。PRISM は RL を使用して、QoreChain コンセンサスエンジン内でチェーンパラメータを動的にチューニングします。

**RPoS** — Reputation-based Proof-of-Stake（レピュテーションベースのプルーフ・オブ・ステーク）。DPoS の委任とレピュテーションスコアリングを組み合わせた包括的なコンセンサスモデル。バリデータは稼働率、参加、コミュニティ貢献を通じてレピュテーションを獲得し、それがブロック提案頻度に影響します。

**SHAKE-256** — SHA-3 ファミリーの可変出力長ハッシュ関数。QoreChain は SHAKE-256 を、鍵導出やアドレス計算を含む PQC 関連操作の基盤的なハッシュ関数として使用します。

**SNARK** — Succinct Non-interactive Argument of Knowledge（簡潔な非対話型知識証明）。小さな証明サイズで迅速に検証できるゼロ知識証明の一種。RDK モジュールで zk ロールアップの決済パラダイムとしてサポートされています。

**STARK** — Scalable Transparent Argument of Knowledge（スケーラブルで透明な知識証明）。トラステッドセットアップを必要とせず量子耐性のあるゼロ知識証明システム。RDK の zk ロールアップ決済の代替証明システムとして利用可能です。

**SVM** — Solana Virtual Machine（Solana 仮想マシン）。BPF プログラム向けの高性能実行環境。QoreChain は SVM を、QoreChain EVM エンジンおよび CosmWasm と並ぶ 3 つのサポート対象ランタイムの 1 つとして統合しています。

**TEE** — Trusted Execution Environment（信頼実行環境）。コードとデータが外部アクセスから保護されることを保証するプロセッサの安全な領域。QoreChain の PQC モジュールは鍵生成証明のための TEE アテステーションをサポートしています。

**tIBE** — Threshold Identity-Based Encryption（しきい値 ID ベース暗号）。しきい値の数の当事者が協力したときにのみメッセージを復号できる暗号方式。FairBlock モジュールがブロック確定までトランザクション内容を暗号化し、MEV の抽出を防ぐために使用されます。

**uqor** — QOR トークンの基本デノミネーション。1 QOR = 1,000,000 uqor（10^6）。すべてのオンチェーン金額、手数料、ステーキング値は uqor で表されます。

**xQORE** — QOR のガバナンスステーキングデリバティブ。ユーザーは QOR をロックして xQORE を受け取り、これにより強化されたガバナンス投票権を得て、早期アンロックペナルティから PvP リベース報酬を獲得します。[トークノミクス](/architecture/tokenomics) を参照してください。
