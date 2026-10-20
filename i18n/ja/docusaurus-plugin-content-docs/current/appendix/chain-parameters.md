---
slug: /appendix/chain-parameters
title: チェーンパラメータ
sidebar_label: チェーンパラメータ
sidebar_position: 2
---

# チェーンパラメータ

QoreChain ネットワークのモジュールパラメータを、モジュールごとにまとめた統合リファレンスです。モジュールに params クエリがある場合、パラメータは `qorechaind query <module> params` で取得できます（`pqc`、`amm`、`crossvm`、`lightnode`、`multilayer`、`reputation`、`rlconsensus`。`ai`、`qca`、`rdk`、`bridge`、`abstractaccount`、`gasabstraction` は `config` を使用し、`gasabstraction` はテストネットでのみクエリ可能です）。REST では、[REST / gRPC リファレンス](/api-reference/rest-grpc-endpoints)に記載されたルートに限り取得できます。`x/inflation` のパラメータも、v3.2.3 以降、メインネットで REST から提供されています（`/qorechain/inflation/v1/params`）。`ai`、`qca`、`reputation`、`crossvm`、`rlconsensus`、`fairblock`、`xqore` では REST を利用できません。

:::note
表示されている値は 2026 年 10 月 20 日にメインネット **`qorechain-vladi`**（EVM チェーン ID **9801**、リリース **v3.2.3**）からライブで読み取ったものです（ガバナンス提案によって変更された場合を除き、ジェネシス値です。変更されたものは明記しています）。特に記載のない限り、テストネット **`qorechain-diana`**（EVM チェーン ID **9800**、リリース **v3.2.4**、2026 年 10 月 19 日から）でも同一です。メインネットが v3.2.4 アップグレード（高さ 3,742,566）を適用するまで存在する差異は[v3.2.4 アップグレードまでの差異](#testnet-differences)にまとめています。ブロック数で示した期間は、計測されたメインネットのブロック時間（約 3.2 秒）で換算しています（テストネットは約 1 秒ごとに 1 ブロックを生成します）。
:::

---

## PQC モジュール (`x/pqc`)

| パラメータ                  | 値                         | 説明                                                                     |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------ |
| `pqc_primary`              | `true`                     | ポスト量子署名が主たる方式                                               |
| `allow_classical_fallback` | `false`                    | 古典暗号のみのフォールバックは閉鎖。Cosmos レーンのトランザクションはハイブリッドである必要がある |
| `min_security_level`       | `5`                        | 登録されるアルゴリズムの最低 NIST セキュリティレベル                     |
| `default_migration_blocks` | `1,000,000`                | ガバナンスで開始されるアルゴリズム移行のデフォルト期間（≈3.2 秒のブロックで約 37 日） |
| `default_signature_algo`   | `1`                        | Dilithium-5 / ML-DSA-87                                                  |
| `hybrid_signature_mode`    | `2`（必須）                | 強制モード: 0=無効, 1=任意, 2=必須                                       |

アルゴリズムレジストリ（id 1 `dilithium5`、id 2 `mlkem1024`）はパラメータではなくチェーンの状態です。鍵は `MsgRegisterPQCKey` または `MsgRegisterPQCKeyV2` で明示的に登録します。自動登録はありません。v3.2.3 以降、チェーンは脆弱な公開鍵、縮退した公開鍵、すでに使用されている公開鍵を拒否し、`MsgRegisterPQCKeyV2` は任意の所有証明（`tx pqc register-key-v2 ... --pqc-key <name>`）を受け付け、存在する場合はチェーンが検証します。

### EVM 認可ウィンドウの上限 {#evm-window-limits}

[EVM 認可ウィンドウ](/getting-started/first-transaction#evm-window)の境界は、モジュールパラメータではなくプロトコル定数です。

| 境界 | 値 |
| ----- | ----- |
| `blocks` の最大値 | 17,280（≈3.2 秒のブロックで約 15 時間） |
| `max_txs` の最大値 | 1,000 |
| `max_value` | 0 より大きいこと（uqor。送金額に各トランザクションの最大手数料を加えた額） |
| `allowed_targets` の最大数 | 受取アドレス 16 件（任意のスコープ、v3.2.3） |

v3.2.3 以降、ウィンドウは `native_only`（通常のネイティブ QOR 送金のみ）で絞り込むこともできます。

---

## AI モジュール (`x/ai`)

モジュールの設定（`qorechaind query ai config`）:

| パラメータ           | 値                     | 説明                                                                        |
| ------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `anomaly_threshold` | `0.7`                  | アンテハンドラーがトランザクションをフラグ付けする異常スコアのしきい値     |
| `routing_strategy`  | `reputation_weighted`  | ルーティング戦略                                                            |
| `risk_threshold`    | `0.8`                  | リスクスコアのしきい値                                                      |
| `max_tx_per_minute` | `600`                  | Cosmos レーンにおける送信者ごとのトランザクション上限。30 ブロックのウィンドウで集計（≈3.2 秒のブロックで約 96 秒。名称は歴史的なもの）。v3.2.0 以降で適用。デフォルトは 10 |

[AI エンジン](/architecture/ai-engine)のページで説明している不正スコアリングの重みと重大度しきい値は、検出器の定数であり、モジュールパラメータではありません。

---

## レピュテーションモジュール (`x/reputation`)

| パラメータ   | 値     | 説明                                                 |
| ----------- | ------ | ---------------------------------------------------- |
| `alpha`     | `0.30` | レピュテーション式における稼働率スコア (S\_i) の重み |
| `beta`      | `0.35` | 参加スコア (P\_i) の重み                             |
| `gamma`     | `0.20` | コミュニティスコア (C\_i) の重み                     |
| `delta`     | `0.15` | 在任期間スコア (T\_i) の重み                         |
| `lambda`    | `1000` | 過去スコアに対する時間減衰のスケール                 |
| `min_score` | `0.10` | レピュテーションスコアの下限                         |

レピュテーション式: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`（過去スコアには時間減衰が適用される）。

---

## QCA モジュール (`x/qca`)

:::note 実装済み、未稼働
トリプルプール CPoS のロジックは `x/qca` に実装されており、これらのパラメータもオンチェーンにありますが、**ブロック生成、報酬、スラッシング、ガバナンスの集計にはまだ接続されていません**。実際に有効なスラッシングは標準の `x/slashing` モジュールのものです（[ステーキング、スラッシング、ガバナンス、手数料、EVM](#core-modules)を参照）。[コンセンサスメカニズム](/architecture/consensus-mechanism)を参照してください。
:::

設定（`qorechaind query qca config`）:

| パラメータ                       | 値                  | 説明                                                  |
| ------------------------------- | ------------------- | ----------------------------------------------------- |
| `use_reputation_weighting`      | `true`              | レピュテーション重み付けのジェネシス設定              |
| `min_reputation_score`          | `0.1`               | 最低レピュテーションスコア                            |
| `pool_classification_interval`  | `1000` ブロック     | プール分類の間隔（ブロック数）                        |
| `pool_weight_rpos`              | `0.40`              | RPoS プールの提案重み                                 |
| `pool_weight_dpos`              | `0.35`              | DPoS プールの提案重み                                 |
| `pool_min_delegation_dpos`      | `10,000,000,000 uqor` | DPoS プールの最低デリゲーション（10,000 QOR）       |
| `pool_rep_percentile_rpos`      | `70`                | RPoS プールのレピュテーションパーセンタイル           |
| `bonding_alpha`                 | `0.1`               | ボンディングカーブのパラメータ                        |
| `bonding_beta`                  | `1.0`               | ボンディングカーブのパラメータ                        |
| `bonding_phase_multiplier`      | `1.5`               | ボンディングカーブのフェーズ乗数                      |
| `slashing_base_rate`            | `0.01`              | 累進スラッシングの基本レート                          |
| `slashing_escalation_factor`    | `1.5`               | 累進スラッシングのエスカレーション係数                |
| `slashing_max_penalty`          | `0.33`              | 累進スラッシングの最大ペナルティ                      |
| `slashing_decay_halflife`       | `100,000` ブロック  | 累進スラッシングの減衰半減期                          |
| `qdrw_enabled`                  | `false`             | QDRW 集計は無効                                       |
| `qdrw_xqore_multiplier`         | `2.0`               | QDRW 式における xQORE の重み                          |
| `qdrw_rep_min_multiplier`       | `0.5`               | レピュテーション乗数の下限                            |
| `qdrw_rep_max_multiplier`       | `2.0`               | レピュテーション乗数の上限                            |

---

## Burn モジュール (`x/burn`)

| パラメータ              | 値                           | 説明                                                  |
| ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `gas_burn_rate`        | `0.30`                       | フィーコレクターからバーンされる割合                  |
| `contract_create_fee`  | `100,000,000 uqor` (100 QOR) | コントラクト作成時の定額バーン手数料                  |
| `ai_service_burn_rate` | `0.50`                       | AI サービス手数料のうちバーンされる割合               |
| `bridge_burn_rate`     | `1.00`                       | ブリッジ手数料のうちバーンされる割合                  |
| `failed_tx_burn_rate`  | `0.10`                       | 失敗したトランザクションのガスのうちバーンされる割合（v3.2.2 以降、チェーンが適用） |
| `validator_share`      | `0.37`                       | バリデータに分配される割合                            |
| `treasury_share`       | `0.20`                       | トレジャリーに送られる割合                            |
| `staker_share`         | `0.10`                       | ステーカーに分配される割合                            |
| `light_node_share`     | `0.03`                       | ライトノードに分配される割合                          |
| `enabled`              | `true`                       | モジュール有効化フラグ                                |

手数料の分配はバリデータ、バーン、トレジャリー、ステーカー、ライトノードに対して **37 / 30 / 20 / 10 / 3** で、各割合の合計は `1.00` でなければなりません。`milestone_burn_schedule` も存在します。[トークノミクス](/architecture/tokenomics)を参照してください。

---

## xQORE モジュール (`x/xqore`)

:::caution オンチェーンではまだ利用不可
xQORE モジュールのアカウンティングは存在しますが、ロックおよびアンロックのトランザクション、クエリ、CLI コマンドは**まだ稼働中のネットワークに接続されていません**。現時点では QOR をロックできず、xQORE も発行されていません。以下の値はジェネシス設定です。
:::

| パラメータ                 | 値                     | 説明                                                 |
| ------------------------- | ---------------------- | ---------------------------------------------------- |
| `governance_multiplier`   | `2.0`                  | xQORE 保有者の投票力乗数                             |
| `min_lock_amount`         | `1,000,000 uqor`       | ロックの最低額（1 QOR）                              |
| `penalty_burn_rate`       | `0.0`                  | 早期退出ペナルティのうちバーンされる割合（すべて再分配される） |
| `rebase_interval`         | `100` ブロック         | PvP リベースイベントの間隔（ブロック数）             |
| `enabled`                 | `true`                 | モジュール有効化フラグ                               |

退出ペナルティ: 50 %（ロック期間が 30 日未満）、35 %（30〜90 日）、15 %（90〜180 日）、0 %（180 日超）。ロック乗数: ロック期間 0 / 90 / 180 / 365 / 730 日に対して 1.0 / 1.2 / 1.4 / 1.7 / 2.0。

---

## Inflation モジュール (`x/inflation`)

| パラメータ              | 値                      | 説明                                                  |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| `emission_mode`        | `fixed`                 | `schedule`（レガシー）または `fixed`（v3.1.94 以降）  |
| `fixed_epoch_emission` | `86,000,000,000 uqor` (86,000 QOR) | fixed モードでエポックごとにミントされる量（2026 年 10 月 19 日のガバナンス提案 10 より前は 16,239 QOR） |
| `max_total_emission`   | `590,000,000,000,000 uqor` (590,000,000 QOR) | 累積の絶対上限（提案 10 より前は 114,285,714 QOR） |
| `epoch_length`         | `43,200` ブロック       | エポックあたりのブロック数（≈3.2 秒のブロックで約 38.6 時間） |
| `schedule`             | 17.5 %, 11 %, 7 %, 7 %, 2 % | レガシーの年次レート。fixed モードでは未使用      |
| `enabled`              | `true`                  | モジュール有効化フラグ                                |

このモジュールは、上限に達するまでこの発行量をフィーコレクターにミントします。86,000 QOR での最初のエポックはブロック 3,672,000 から始まります。2026 年 10 月 20 日（エポック 84）時点で、105,248,896.21 QOR がミントされ、上限までの残りは 484,751,103.79 QOR でした（`GET /qorechain/inflation/v1/epoch_info`）。[トークノミクス](/architecture/tokenomics#supply-and-emission)を参照してください。

---

## RL コンセンサスモジュール (`x/rlconsensus`)

`x/rlconsensus` モジュールは、強化学習による最適化レイヤーである **PRISM** を実装します。両ネットワークとも観測モードで、ポリシーの重みがロードされていないため、何も調整しません。PRISM の 4 つの制御メッセージは、メインネットではサーキットブレーカーによって無効化されています（[サーキットブレーカーの状況](#circuit-breaker)を参照）。

| パラメータ                        | 値             | 説明                                                          |
| -------------------------------- | -------------- | ------------------------------------------------------------- |
| `enabled`                        | `true`         | モジュール有効化フラグ                                        |
| `observation_interval`           | `10`           | PRISM 観測サンプル間のブロック数                              |
| `agent_mode`                     | `1` (conservative) | エージェントモード: 0=shadow, 1=conservative, 2=autonomous, 3=paused |
| `max_change_conservative`        | `0.10`         | conservative モードでのアクションあたりの最大パラメータ変更   |
| `max_change_autonomous`          | `0.25`         | autonomous モードでのアクションあたりの最大パラメータ変更     |
| `circuit_breaker_window`         | `50`           | サーキットブレーカーのウィンドウ                              |
| `circuit_breaker_threshold`      | `0.50`         | サーキットブレーカーのしきい値                                |
| `reward_weight_throughput`       | `0.30`         | スループットに対する報酬重み                                  |
| `reward_weight_finality`         | `0.25`         | ファイナリティに対する報酬重み                                |
| `reward_weight_decentralization` | `0.20`         | 分散化に対する報酬重み                                        |
| `reward_weight_mev`              | `0.15`         | MEV に対する報酬重み                                          |
| `reward_weight_failed_txs`       | `0.10`         | 失敗したトランザクションに対する報酬重み                      |
| `default_block_time_ms`          | `5000`         | 観測ベースラインにおけるデフォルトのブロック時間（実際のブロック時間ではない） |
| `default_base_gas_price`         | `100`          | 観測ベースラインにおけるデフォルトの基本ガス価格              |
| `default_validator_set_size`     | `100`          | 観測ベースラインにおけるデフォルトのバリデータセットサイズ    |

---

## Bridge モジュール (`x/bridge`)

:::caution 未稼働
37 件のチェーン設定はすべて `pending` ステータスで、ブリッジバリデータは登録されておらず、ブリッジ操作は作成されておらず、どちらのネットワークでも IBC チャネルは開かれていません。[ブリッジアーキテクチャ](/architecture/bridge-architecture)を参照してください。
:::

`GET /qorechain/bridge/v1/config`:

| パラメータ                  | 値                          | 説明                                              |
| -------------------------- | --------------------------- | ------------------------------------------------- |
| `min_validators`           | `10`                        | アテステーションセットに必要なバリデータ数        |
| `attestation_threshold`    | `7`                         | 必要なアテステーション数                          |
| `challenge_period_secs`    | `86400`                     | チャレンジ期間（24 時間）                         |
| `large_transfer_threshold` | `100,000,000,000 uqor` (100,000 QOR) | この額を超える転送はチャレンジ期間の経過を待つ |
| `enabled`                  | `true`                      | モジュール有効化フラグ                            |

チェーンごとの設定（`min_confirmations`、`max_single_transfer`、`daily_limit`）は、モジュールパラメータではなく各チェーン設定に含まれます。

---

## Multilayer モジュール (`x/multilayer`)

| パラメータ                      | 値               | 説明                                              |
| ------------------------------ | ---------------- | ------------------------------------------------- |
| `max_sidechains`               | `10`             | 登録可能なサイドチェーンの最大数                  |
| `max_paychains`                | `50`             | 登録可能なペイチェーンの最大数                    |
| `min_anchor_interval`          | `100`            | 最小アンカー間隔（ブロック）                      |
| `max_anchor_interval`          | `1000`           | 最大アンカー間隔（ブロック）                      |
| `default_challenge_period`     | `86400` s        | デフォルトのチャレンジ期間（1 日）                |
| `min_sidechain_stake`          | `1,000,000,000`  | サイドチェーン登録の最低ステーク（1,000 QOR）     |
| `min_paychain_stake`           | `100,000,000`    | ペイチェーン登録の最低ステーク（100 QOR）         |
| `routing_enabled`              | `true`           | クロスレイヤールーティングが有効                  |
| `routing_confidence_threshold` | `0.6`            | 自動ルーティングの信頼度しきい値                  |
| `cross_layer_fee_bundling`     | `true`           | 1 回の手数料支払いで複数のレイヤーをカバーできる  |

---

## Cross-VM モジュール (`x/crossvm`)

| パラメータ             | 値      | 説明                                           |
| --------------------- | ------- | ---------------------------------------------- |
| `max_message_size`    | `65536` | クロス VM メッセージの最大サイズ（バイト、64 KB） |
| `max_queue_size`      | `1000`  | クロス VM キュー内の保留メッセージの最大数     |
| `queue_timeout_blocks`| `100`   | 保留メッセージがタイムアウトするまでのブロック数 |
| `enabled`             | `true`  | モジュール有効化フラグ                         |

`MsgCrossVMCall` は、メインネットではサーキットブレーカーによって無効化されています（テストネットでは有効）。

---

## SVM モジュール (`x/svm`)

ジェネシス値:

| パラメータ               | 値           | 説明                                         |
| ----------------------- | ------------ | -------------------------------------------- |
| `max_program_size`      | `10485760`   | プログラムバイナリの最大サイズ（バイト、10 MB） |
| `max_account_data_size` | `10485760`   | アカウントデータの最大サイズ（バイト、10 MB） |
| `compute_budget_max`    | `1400000`    | トランザクションあたりの最大計算ユニット（1.4M） |
| `lamports_per_byte`     | `3480`       | バイトあたりのレントコスト（lamports）       |
| `rent_exemption_multi`  | `2.0`        | 免除に必要なレント年数                       |
| `enabled`               | `true`       | モジュール有効化フラグ                       |
| `svm_slot_offset`       | `0`          | スロットオフセット                           |
| `default_sig_scheme`    | `0`          | デフォルトの署名方式                         |
| `max_cpi`               | `4`          | クロスプログラム呼び出しの最大深度           |

SVM トランザクションレーンはネットワーク全体で無効化されています（[ネットワーク](/appendix/networks)を参照）。

---

## RDK モジュール (`x/rdk`)

`qorechaind query rdk config`:

| パラメータ                   | 値                   | 説明                                          |
| --------------------------- | -------------------- | --------------------------------------------- |
| `max_rollups`               | `100`                | 登録可能なロールアップの最大数                |
| `min_stake_for_rollup`      | `10,000,000,000 uqor`| オペレーターの最低ステーク（10,000 QOR）      |
| `rollup_creation_burn_rate` | `0.01`               | 作成ステークのうちバーンされる割合（1%）      |
| `default_challenge_window`  | `604,800` s          | デフォルトのチャレンジウィンドウ（7 日）      |
| `max_da_blob_size`          | `2,097,152`          | DA ブロブの最大サイズ（バイト、2 MB）         |
| `blob_retention_blocks`     | `432,000`            | DA ブロブを保持するブロック数（≈3.2 秒のブロックで約 16 日） |
| `max_batches_per_block`     | `10`                 | 1 ブロックで処理されるバッチの最大数          |

どちらのネットワークでも、ロールアップはまだ作成されていません。

---

## FairBlock モジュール (`x/fairblock`)

ジェネシス値（このモジュールにはクエリサービスがないため、ライブで再読み取りできません）:

| パラメータ            | 値      | 説明                                        |
| -------------------- | ------- | ------------------------------------------- |
| `enabled`            | `false` | FairBlock tIBE 暗号化は無効                 |
| `tibe_threshold`     | `5`     | 必要な復号鍵シェアの最小数                  |
| `decryption_delay`   | `3`     | 確定後、復号までのブロック数                |
| `max_encrypted_size` | `65536` | 暗号化ペイロードの最大サイズ（バイト）      |

---

## ガス抽象化モジュール (`x/gasabstraction`)

ジェネシス設定（`enabled = true`、`native_denom = uqor`）:

| トークンデノム | 変換レート      | 説明                   |
| ------------- | --------------- | ---------------------- |
| `uqor`        | `1.0`           | ネイティブ QOR トークン（1:1） |
| `ibc/USDC`    | `1.0`           | IBC ブリッジ USDC      |
| `ibc/ATOM`    | `10.0`          | IBC ブリッジ ATOM      |

変換レートは、そのトークンで支払われた手数料を換算する際に使われるレートです。

:::note IBC チャネルは開かれていません
どちらのネットワークでも IBC チャネルは開かれていないため、`ibc/USDC` や `ibc/ATOM` はまだ存在し得ません。手数料は `uqor` で支払われます。
:::

---

## ライトノードモジュール (`x/lightnode`)

| パラメータ                | 値                 | 説明                                                 |
| ------------------------ | ------------------ | ---------------------------------------------------- |
| `registration_fee`       | `1,000,000 uqor` (1 QOR) | ライトノード登録の手数料                       |
| `heartbeat_interval`     | `1000` ブロック    | 必須ハートビートの間隔（≈3.2 秒のブロックで約 54 分） |
| `min_delegated_stake`    | `1,000,000,000 uqor` (1,000 QOR) | オペレーターがデリゲートする最低ステーク |
| `reward_share`           | `0.03`             | ライトノード向けに確保されるフィーコレクターの割合   |
| `min_uptime_for_rewards` | `0.80`             | 報酬の受給資格に必要な最低稼働率                     |
| `max_light_nodes`        | `10,000`           | 登録可能なライトノードの最大数                       |
| `heartbeat_grace_period` | `100` ブロック     | ハートビートが遅れた場合の猶予期間                   |

報酬のアカウンティングは稼働しています。`GET /qorechain/lightnode/v1/reward_pool` は、プール（`balance`、`reserved`、`outstanding`、`payable`、`distributable`）とノードごとの報酬上限を報告します。v3.2.3 以降、この上限は `max_reward_per_month_per_node`、つまり**ノードあたり 30 日で 2,000 QOR（`2000000000` uqor）**で、ブロック時間に応じて按分され、ノードの稼働率でスケーリングされます。従来のブロックごとの値（`max_reward_per_block_per_node`、`1713` uqor）も引き続き報告されます。2026 年 10 月 20 日時点で、プールは 487.2318 QOR のリザーブを保有しており、未払いはありませんでした。登録は受付中でライセンスによる制限があります。メインネットでは 6 件の `lightnode_operator` ライセンスが付与されていますが、登録済みのライトノードはまだありません（`GET /qorechain/license/v1/holders/lightnode_operator`、`GET /qorechain/lightnode/v1/stats`）。[ライトノード](/light-node/overview#reward-program-status)と[トークノミクス](/architecture/tokenomics#stranded-and-reserve)を参照してください。

---

## AMM モジュール (`x/amm`)

| パラメータ               | 値                            | 説明                                |
| ----------------------- | ----------------------------- | ----------------------------------- |
| `swap_fee_bps`          | `30`                          | スワップ手数料（0.30%）             |
| `protocol_fee_bps`      | `10`                          | プロトコル手数料の割合（0.10%）     |
| `min_liquidity`         | `1000`                        | 最小流動性                          |
| `max_pools_per_creator` | `50`                          | 作成者あたりの最大プール数          |
| `lp_token_decimals`     | `6`                           | LP トークンの小数桁数               |
| `pool_creation_fee`     | `100,000,000 uqor` (100 QOR)  | プール作成の手数料                  |
| `max_swap_impact_bps`   | `500`                         | スワップの最大価格インパクト（5%）  |
| `enabled`               | `true`                        | モジュール有効化フラグ              |

メインネットでもテストネットでも、プールはまだ存在せず、`MsgPausePool` / `MsgResumePool` はメインネットで無効化されています。

---

## スマートアカウント (`x/abstractaccount`)

:::caution 両ネットワークで無効
`enabled` は `false` です。無効の間は、オーセンティケーターの登録、オーセンティケーター経由の実行、スマートアカウントの作成はすべて拒否されます。これらの機能を前提に構築する前に、`GET /qorechain/abstractaccount/v1/config` を確認してください。
:::

| パラメータ             | 値       | 説明                             |
| --------------------- | -------- | -------------------------------- |
| `enabled`             | `false`  | モジュール有効化フラグ           |
| `max_session_keys`    | `10`     | アカウントあたりのセッションキーの最大数 |
| `max_spending_rules`  | `5`      | 支出ルールの最大数               |
| `default_session_ttl` | `86400` s| セッションキーのデフォルトの有効期間 |

---

## ステーキング、スラッシング、ガバナンス、手数料、EVM {#core-modules}

標準の Cosmos SDK モジュールと EVM モジュールで、2026 年 10 月 20 日にライブで読み取った値です（特に記載のない限り両ネットワークで同一。10 月 14 日の読み取り以降変更なし）。

| モジュール | パラメータ | 値 |
| --- | --- | --- |
| ステーキング | `unbonding_time` | 1,814,400 s（21 日） |
| | `max_validators` | 100 |
| | `max_entries` | 7 |
| | `historical_entries` | 10,000 |
| | `bond_denom` | `uqor` |
| | `min_commission_rate` | 0 |
| スラッシング | `signed_blocks_window` | 10,000 ブロック（≈3.2 秒のブロックで約 8.9 時間） |
| | `min_signed_per_window` | 5 %（ウィンドウの 5 % 未満しか署名しないバリデータはジェイルされる） |
| | `downtime_jail_duration` | 600 s |
| | `slash_fraction_downtime` | 1 % |
| | `slash_fraction_double_sign` | 5 % |
| ガバナンス | `min_deposit` | 10,000,000 uqor（10 QOR） |
| | `max_deposit_period` / `voting_period` | それぞれ 172,800 s（2 日） |
| | `quorum` / `threshold` / `veto_threshold` | 0.334 / 0.5 / 0.334 |
| | `expedited_voting_period` / `expedited_min_deposit` / `expedited_threshold` | 86,400 s / 50 QOR / 0.667 |
| | `burn_vote_veto` | `true` |
| ディストリビューション | `community_tax` | 0.02 |
| フィーマーケット | `min_gas_price` | ガスあたり 0.1 uqor |
| | `base_fee_change_denominator` / `elasticity_multiplier` | 8 / 2 |
| | `no_base_fee` | `false` |
| EVM | `evm_denom` / `extended_denom` | `uqor` / `aqor`（18 桁） |
| | コントラクトの作成 / 呼び出しアクセス | パーミッションレス |
| | `active_static_precompiles` | 空（有効な EVM プリコンパイルはなし） |
| | `history_serve_window` | 8,192 |
| ERC-20 | `enable_erc20` / `permissionless_registration` | `true` / `false` |
| QoreChain Native | `code_upload_access` / `instantiate_default_permission` | `Nobody` / `Nobody` |

---

## サーキットブレーカーの状況 {#circuit-breaker}

チェーンは、ファウンデーション運用アカウントとガバナンスが制御する Cosmos SDK のサーキットブレーカーを使って、個別のメッセージタイプを無効化できます。無効化されたメッセージタイプは、すべてのレーンでアンテハンドラーにより拒否されます。最新のリストは `GET /cosmos/circuit/v1/disable_list` にあります。

**メインネット（2026 年 10 月 20 日、16 件、10 月 14 日以降変更なし）:** ベスティングアカウントの作成（`MsgCreateVestingAccount`、`MsgCreatePermanentLockedAccount`、`MsgCreatePeriodicVestingAccount`）、QoreChain Native の `MsgStoreCode`、`MsgInstantiateContract`、`MsgInstantiateContract2`、AMM の `MsgPausePool`、`MsgResumePool`、`crossvm.MsgCrossVMCall`、`multilayer.MsgUpdateLayerStatus`、`pqc.MsgDeprecateAlgorithm`、`pqc.MsgDisableAlgorithm`、そして PRISM の 4 つの制御メッセージ（`MsgSetAgentMode`、`MsgUpdatePolicy`、`MsgUpdateRewardWeights`、`MsgResumeAgent`）。EVM レーン（`MsgEthereumTx`）は**開放**されています。9 月 16 日から 25 日まで無効化されていましたが、v3.2.0 アップグレードで再開されました。

**テストネット（2026 年 10 月 20 日）:** QoreChain Native の 3 つのメッセージのみ。

標準の bank、staking、governance、distribution、authz、`x/pqc` 登録メッセージをすべて含め、それ以外のメッセージタイプはすべて有効です。このリストはガバナンスによって制御され、変更される可能性があるため、必ずクエリして確認してください。

---

## v3.2.4 アップグレードまでの差異 {#testnet-differences}

テストネット `qorechain-diana` は高さ 8,337,253（2026 年 10 月 19 日）から v3.2.4 を実行しています。メインネットは高さ 3,742,566 までは v3.2.3、そのブロックからは v3.2.4 を実行します（ガバナンス提案 13）。それ以降は、以下の v3.2.4 の行は両ネットワークに適用され、ネットワーク固有の値だけが異なるままになります。2026 年 10 月 20 日時点で、テストネットは次の点がメインネットと異なります。

| 領域 | 現在のテストネット、およびメインネットの高さ 3,742,566 以降 |
| ---- | ------- |
| モジュール | 48 ではなく 49：任意の時間ロック付きステーキングモジュール `x/stakingtier`（`GET /qorechain/stakingtier/v1/params`、最小ロック 10 QOR）。[ステーキングと委任](/user-guide/staking-and-delegation#time-locked-staking)を参照。 |
| `x/inflation` | 3 つ目の `emission_mode` である `target_apy`。`target_apy_bps` パラメータはテストネットでは `0` です。どのモードを有効にするかは、各ネットワークで別個のガバナンス上の決定です。 |
| `x/burn` | 13 番目の記録対象ソース `staking_tier_penalty`。 |
| `x/lightnode` 報酬プール | 追加のレポート項目（`monthly_cap_active`、`last_distribution_time`、`last_distribution_height`）。ノードの報酬上限は、そのノード自身の登録時点から始まります。 |
| `x/pqc` | PQC アカウントの `possession_proven` フラグ。所有証明は、アカウント鍵では引き続き任意で、ブリッジバリデータ鍵では必須です。 |
| `x/rdk` | オプティミスティックのチャレンジウィンドウはブロック時間で数えられます。 |
| クエリ | 新しい `protocol_features` と `auth_nonce` のクエリ。 |

これらの値はテストネット固有であり、アップグレード後も異なるままです。

| 領域 | テストネット |
| ---- | ------- |
| `x/inflation` の値 | 以前の発行値（エポックあたり 16,239 QOR、上限 114,285,714 QOR、すでに到達済み）。メインネットはガバナンス提案 10 で設定された値を使用します。 |
| サーキットブレーカー | QoreChain Native の 3 つのメッセージのみ（上記参照）。 |

ここに記載のないパラメータはすべて、両ネットワークで同一です。
