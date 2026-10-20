---
slug: /appendix/glossary
title: 用語集
sidebar_label: 用語集
sidebar_position: 1
---

# 用語集

QoreChain ドキュメント全体で使用される用語、略語、頭字語のアルファベット順リファレンスです。

---

**AMM** — Automated Market Maker（自動マーケットメーカー）。QoreChain のネイティブなオンチェーン流動性モジュール（`x/amm`）で、外部のスマートコントラクトのデプロイなしに、プロトコルレベルで定積プール、スワップ、流動性提供を直接提供します。[AMM](/architecture/amm) を参照してください。

**Authorisation window (EVM)**（EVM 認可ウィンドウ）— ポスト量子署名された Cosmos レーンのメッセージで開かれる、範囲が限定された許可（ブロック数、トランザクション数、合計価値）。v3.2.0 以降、EVM レーンのトランザクションはこの範囲内に収まる必要があります。v3.2.3 以降、ウィンドウはネイティブ送金のみ、または受取先のリストに絞り込むことができます。[EVM 認可ウィンドウ](/getting-started/first-transaction#evm-window)を参照してください。

**BPF** — Berkeley Packet Filter。SVM ランタイムがオンチェーンプログラムを実行するために使用するバイトコード形式。プログラムはデプロイ前に BPF にコンパイルされます。

**Chain License** — `x/license` モジュールによって管理されるオンチェーンライセンスレコード。チェーンライセンスは特定のプロトコル機能へのアクセスを制御し、オペレーターがライセンス権限をオンチェーンで登録、検証、管理できるようにします。[チェーンライセンス](/architecture/chain-licensing)を参照してください。

**Circuit breaker**（サーキットブレーカー）— 個々のメッセージタイプをネットワーク全体で無効化する Cosmos SDK のメカニズム。現在の一覧は `/cosmos/circuit/v1/disable_list` で照会できます。[チェーンパラメーター](/appendix/chain-parameters#circuit-breaker)を参照してください。

**CLFB** — Cross-Layer Fee Bundling（クロスレイヤー手数料バンドリング）。クロスレイヤーパス内の各レイヤーにわたる実行を、送信元レイヤーでの 1 回の手数料支払いでまかなう仕組み（`x/multilayer` の `cross_layer_fee_bundling` パラメーター）。[マルチレイヤーアーキテクチャ](/architecture/multilayer-architecture)を参照してください。

**CPI** — Cross-Program Invocation（クロスプログラム呼び出し）。SVM ランタイム内のメカニズムで、デプロイ済みのあるプログラムが同じトランザクションコンテキスト内で別のプログラムを呼び出せるようにします。

**CPoS** — Composite Proof-of-Stake（複合プルーフ・オブ・ステーク）。QoreChain のコンセンサス分類設計で、評判と委任に基づいてバリデータを 3 つのプール（RPoS、DPoS、PoS）にグループ化します。各プールはプロポーザー選択アルゴリズムで異なる重みを持ちます。`x/qca` に実装されていますが、ブロック生成ではまだ有効ではありません。

**DA** — Data Availability（データ可用性）。チェーンに公開されたトランザクションデータが任意のノードによって取得可能であることの保証。RDK モジュールはロールアップ向けにネイティブな DA を提供し、設定可能な保持期間でブロブをオンチェーンに保存します。

**DPoS** — Delegated Proof-of-Stake（委任型プルーフ・オブ・ステーク）。トークン保有者が自分のステークをバリデータに委任し、バリデータが代わりにブロックを生成するコンセンサスメカニズム。

**EIP-1559** — Ethereum Improvement Proposal 1559。基本手数料（バーンされる）と優先手数料（バリデータに支払われる）を使用するトランザクション手数料モデル。QoreChain は QoreChain EVM エンジンで EIP-1559 スタイルの手数料メカニズムを実装しています。

**HCS** — Hierarchical Commitment Schemes（階層型コミットメントスキーム）。サイドチェーン、ペイチェーン、ロールアップがそれぞれの状態ルートを定期的にメインチェーンにアンカーするメカニズム（マルチレイヤーアーキテクチャを参照）。secp256k1 + ML-DSA-87 のハイブリッド署名方式とは別物であり、本ドキュメントではそちらを*ハイブリッド署名*と呼びます。

**Hybrid sign-bytes v2**（ハイブリッド署名バイト v2）— v3.2.0 以降に ML-DSA 鍵が署名する、ドメインタグ付きでチェーンに紐づけられたバイト列。[ポスト量子セキュリティ](/architecture/post-quantum-security#sign-bytes-v2)を参照してください。

**IBC** — Inter-Blockchain Communication（ブロックチェーン間通信）。独立したブロックチェーン間で認証されたメッセージパッシングを行うプロトコル。QoreChain はクロスチェーンのトークン転送とデータリレーのために IBC チャネルをサポートします。

**Light Node**（ライトノード）— フル状態を保持せず、ブロックヘッダーを 1 つ以上の RPC エンドポイントと照合することでチェーンをフォローする、リソース軽量なクライアント。他者向けにクエリを提供することはありません。プロトコル手数料分配では、ライトノード報酬プログラム向けに **3%** のシェアが確保されています。このプログラムへの登録は受付中で、`lightnode_operator` ライセンス（50 ドル、Dashboard で購入）による制限があります。2026 年 10 月 20 日時点で、メインネットでは 6 件のライセンスが付与されており、登録済みのライトノードはまだありません。ノードの実行にライセンスは不要です。[ライトノード](/light-node/overview)とその[報酬プログラムの状況](/light-node/overview#reward-program-status)を参照してください。

**MEV** — Maximal Extractable Value（最大抽出可能価値）。ブロック内でトランザクションを並べ替え、挿入、または検閲することで得られる利益。QoreChain の FairBlock モジュール（tIBE 暗号化）は MEV 抽出を軽減するよう設計されていますが、まだ有効化されていません。

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm（モジュール格子デジタル署名アルゴリズム、セキュリティレベル 5）。QoreChain が量子耐性トランザクション署名に使用する、NIST 標準化されたポスト量子デジタル署名方式。公開鍵 2,592 バイトで、4,627 バイトの署名を生成します。

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism（モジュール格子鍵カプセル化メカニズム、セキュリティレベル 5）。将来の暗号化通信チャネル向けに QoreChain の PQC アルゴリズムレジストリで利用可能な、NIST 標準化されたポスト量子鍵カプセル化方式。

**MLP** — Multi-Layer Perceptron（多層パーセプトロン）。QCAI が不正検知と異常スコアリングにおけるパターン認識に使用するニューラルネットワークの一種。

**PPO** — Proximal Policy Optimization（近接方策最適化）。観測されたネットワーク状況に基づいてチェーンパラメータ（ブロックタイム、ガス価格、プールの重み。バリデータセットのサイズはログ出力のみ）を最適化するために PRISM が使用する強化学習アルゴリズム。ライブネットワークでは、学習済みポリシーはロードされていません。

**PQC** — Post-Quantum Cryptography（ポスト量子暗号）。古典コンピュータと量子コンピュータの両方からの攻撃に対して安全になるように設計された暗号アルゴリズム。QoreChain は `x/pqc` モジュールを通じて PQC を実装し、主要な署名方式として ML-DSA-87 を使用します。

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines。QoreChain コンセンサスエンジンに（`x/rlconsensus` モジュールを介して）組み込まれた強化学習最適化レイヤー。PRISM はネットワーク指標を観測し、サーキットブレーカー型の安全制御のもとで決定論的なコンセンサスパラメータの調整を提案するよう設計されています。現在は観測モードで動作しています。[PRISM コンセンサスエンジン](/architecture/prism-consensus-engine)を参照してください。

**Proof of possession (PoP)**（所有証明）— ポスト量子鍵が自身の登録内容に対して行う署名で、登録者が秘密鍵を保持していることを証明します。v3.2.3 以降、アカウント鍵の登録では任意です（`tx pqc register-key-v2 ... --pqc-key <name>`）。テストネット（v3.2.4）ではブリッジバリデータの鍵に必須です。

**Protocol feature**（プロトコル機能）— リリースのアップグレードハンドラーが、すべてのノードで特定のブロック高さにおいてオンにする動作スイッチ（例: `pqc-sign-bytes-v2`、`evm-pqc-authorisation-window`）。これにより、その高さより下の履歴は変更なしでリプレイされます。

**PvP Rebase** — Player versus Player Rebase（プレイヤー対プレイヤーリベース）。xQORE モジュール内のメカニズムで、早期アンロックによるペナルティが残りのロック済みステーカーに比例して再分配され、長期的なコミットメントに報います（オンチェーンにはまだ接続されていません）。

**QCAI** — QoreChain Artificial Intelligence。QoreChain の AI サブシステムの包括的な用語で、オンチェーンのヒューリスティックエンジン（`x/ai` モジュール）と、高度な推論機能を提供するオフチェーンの QCAI サイドカーを含みます。

**QCB** — QoreChain Bridge。非 IBC チェーン（例: Ethereum、Bitcoin、Solana、Avalanche）への接続のための QoreChain のネイティブブリッジプロトコル。QCB はクロスチェーン認証にバリデータ認証のしきい値（10 件中 7 件の ML-DSA-87 署名）を使用します。[ブリッジアーキテクチャ](/architecture/bridge-architecture)を参照してください。

**QDRW** — Quadratic Delegation with Reputation Weighting（評判加重を伴う二次委任）。ガバナンスの投票力の計算式（ステークの平方根に加重 xQORE を加え、評判乗数でスケーリング）。`x/qca` に実装されていますが、ライブネットワークでは無効です（`qdrw_enabled = false`）。

**RDK** — Rollup Development Kit。4 つの決済パラダイム（optimistic、zk、based、sovereign）、5 つのプリセットプロファイル、統合されたデータ可用性を備えた、ロールアップのデプロイと管理のための QoreChain ネイティブフレームワーク。[ロールアップ概要](/rollups/overview)を参照してください。

**RL** — Reinforcement Learning（強化学習）。エージェントが試行と報酬を通じて最適な行動を学習する機械学習のアプローチ。PRISM は、QoreChain コンセンサスエンジン内でチェーンパラメータを調整するために RL を使用するよう設計されています（現在は観測のみ）。

**RPoS** — Reputation Proof-of-Stake（評判型プルーフ・オブ・ステーク）。評判が 70 パーセンタイル以上で、自己ボンドステークが中央値以上のバリデータのプール。バリデータは、稼働率、参加、コミュニティへの貢献を通じて評判を獲得します。

**SHAKE-256** — SHA-3 ファミリーの可変出力長ハッシュ関数。SHAKE-256 は QoreChain のデフォルトのアプリケーションハッシュ（`qorehash` パッケージ）であり、鍵導出などの PQC 関連の操作に使用されます。

**SNARK** — Succinct Non-interactive Argument of Knowledge（簡潔な非対話型知識証明）。小さな証明サイズで高速に検証できるゼロ知識証明の一種。zk ロールアップ向けの決済パラダイムとして RDK モジュールでサポートされています。

**STARK** — Scalable Transparent Argument of Knowledge（スケーラブルで透明な知識証明）。トラステッドセットアップを必要とせず、量子耐性を持つゼロ知識証明システム。RDK における zk ロールアップ決済の代替証明システムとして利用できます。

**Stranded staker share / reward-pool reserve**（取り残されたステーカーシェア / 報酬プールのリザーブ）— v3.2.0 アップグレード時に記録された金額で、ガバナンス投票によってのみ動かせます。ガバナンスは 2026 年 10 月にこれらを解放しました（v3.2.3 の後に、取り残されたシェアの修正済みの残額が提案されました）。[トークノミクス](/architecture/tokenomics#stranded-and-reserve)を参照してください。

**SVM** — Solana Virtual Machine。BPF プログラム向けの高性能実行環境。QoreChain は、QoreChain EVM エンジンおよび CosmWasm と並ぶ、サポートされる 3 つのランタイムの 1 つとして SVM を統合しています。

**TEE** — Trusted Execution Environment（信頼実行環境）。コードとデータを外部アクセスから保護することを保証する、プロセッサ内の安全な領域。QoreChain は TEE アテステーションのインターフェース仕様を定義していますが、実装はまだ存在しません。

**tIBE** — Threshold Identity-Based Encryption（しきい値 ID ベース暗号化）。しきい値以上の関係者が協力した場合にのみメッセージを復号できる暗号方式。FairBlock モジュールがブロックのファイナライズまでトランザクション内容を暗号化し、MEV 抽出を防ぐために使用します。

**Time-locked staking**（時間ロック付きステーキング）— 委任の一部を一定期間コミットする任意の仕組みで、`x/stakingtier` モジュールが提供します。**テストネットのみ**（v3.2.4）。メインネットでは稼働していません。[ステーキングと委任](/user-guide/staking-and-delegation#time-locked-staking)を参照してください。

**uqor** — QOR トークンの基本単位。1 QOR = 1,000,000 uqor（10^6）。すべてのオンチェーンの金額、手数料、ステーキング値は uqor で表されます。

**xQORE** — QOR のガバナンスステーキングデリバティブ。ユーザーは QOR をロックして xQORE を受け取り、強化されたガバナンス投票力が付与され、早期アンロックペナルティからの PvP リベース報酬を得ます（設計上の挙動。ロックおよびアンロックのトランザクションはオンチェーンにまだ接続されていません）。[トークノミクス](/architecture/tokenomics#x-xqore)を参照してください。
