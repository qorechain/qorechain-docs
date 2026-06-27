---
slug: /appendix/chain-parameters
title: チェーンパラメータ
sidebar_label: チェーンパラメータ
sidebar_position: 2
---

# チェーンパラメータ

QoreChain ジェネシスで設定可能なすべてのモジュールパラメータの統合リファレンスです。パラメータはモジュールごとにグループ化されており、実行時に `qorechaind query <module> params` でクエリできます。

:::note
表示されている値はデプロイ済みのジェネシスデフォルト値です。特に記載のない限り、パラメータはメインネット **`qorechain-vladi`**（EVM チェーン ID **9801**）およびテストネット **`qorechain-diana`**（EVM チェーン ID **9800**）に適用されます。
:::

---

## PQC モジュール (`x/pqc`)

| パラメータ                   | 型     | デフォルト値          | 説明                                                            |
| --------------------------- | ------ | ---------------------- | ---------------------------------------------------------------------- |
| `hybrid_signature_mode`     | uint   | `2` (required)         | 強制モード: 0=無効, 1=任意, 2=必須（現在のデフォルト） |
| `allow_classical_fallback`  | bool   | `false`                | 古典暗号のみのフォールバックは閉鎖。Cosmos トランザクションはハイブリッドである必要がある           |
| `algorithm_registry`        | array  | ML-DSA-87, ML-KEM-1024 | サイズ制約付きで登録された PQC アルゴリズム                        |
| `auto_register_enabled`     | bool   | `true`                 | 最初のハイブリッドトランザクションで PQC 鍵を自動登録                              |
| `migration_deadline_height` | uint64 | `0`                    | 古典暗号のみの鍵が拒否されるブロック高（0=無効） |
| `migration_grace_period`    | uint64 | `100000`               | 移行期限前の警告ブロック数                            |

---

## AI モジュール (`x/ai`)

| パラメータ                  | 型     | デフォルト値 | 説明                                       |
| -------------------------- | ------ | ------------- | ------------------------------------------------- |
| `anomaly_weight_volume`    | string | `0.30`        | 不正スコアリングにおけるボリューム異常の重み        |
| `anomaly_weight_velocity`  | string | `0.25`        | 不正スコアリングにおける速度異常の重み      |
| `anomaly_weight_pattern`   | string | `0.25`        | 不正スコアリングにおけるパターン異常の重み       |
| `anomaly_weight_network`   | string | `0.20`        | 不正スコアリングにおけるネットワークグラフ異常の重み |
| `fraud_threshold_low`      | string | `0.30`        | 低重大度アラートのスコアしきい値            |
| `fraud_threshold_medium`   | string | `0.55`        | 中重大度アラートのスコアしきい値         |
| `fraud_threshold_high`     | string | `0.75`        | 高重大度アラートのスコアしきい値           |
| `fraud_threshold_critical` | string | `0.90`        | 緊急重大度アラートのスコアしきい値       |
| `circuit_breaker_enabled`  | bool   | `true`        | QCAI サーキットブレーカーを有効化                      |

---

## レピュテーションモジュール (`x/reputation`)

| パラメータ      | 型     | デフォルト値 | 説明                                          |
| -------------- | ------ | ------------- | ---------------------------------------------------- |
| `alpha`        | string | `0.30`        | レピュテーション式における稼働率スコア (S\_i) の重み |
| `beta`         | string | `0.25`        | 参加スコア (P\_i) の重み                |
| `gamma`        | string | `0.25`        | コミュニティスコア (C\_i) の重み                   |
| `delta`        | string | `0.20`        | 在任期間スコア (T\_i) の重み                       |
| `decay_lambda` | string | `0.01`        | 過去スコアに対する指数的な時間減衰係数  |

レピュテーション式: `R_i = alpha * S_i + beta * P_i + gamma * C_i + delta * T_i`（エポックごとに指数的な時間減衰が適用される）。

---

## QCA モジュール (`x/qca`)

| パラメータ                      | 型     | デフォルト値 | 説明                                    |
| ------------------------------ | ------ | ------------- | ---------------------------------------------- |
| `emerald_pool_weight`          | string | `0.50`        | Emerald プールのブロック提案重み         |
| `sapphire_pool_weight`         | string | `0.30`        | Sapphire プールのブロック提案重み        |
| `ruby_pool_weight`             | string | `0.20`        | Ruby プールのブロック提案重み            |
| `emerald_min_reputation`       | string | `0.80`        | Emerald プールの最低レピュテーションスコア      |
| `sapphire_min_reputation`      | string | `0.50`        | Sapphire プールの最低レピュテーションスコア     |
| `bonding_curve_base_rate`      | string | `0.05`        | ステーキングボンディングカーブの基本レート            |
| `bonding_curve_multiplier`     | string | `1.50`        | ボンディングカーブ進行の乗数       |
| `slashing_downtime_window`     | int64  | `10000`       | ダウンタイムを評価するブロック数                      |
| `slashing_downtime_threshold`  | string | `0.05`        | スラッシング前の最低署名ブロック割合 |
| `slashing_downtime_penalty`    | string | `0.01`        | ダウンタイムに対するスラッシュ割合                   |
| `slashing_double_sign_penalty` | string | `0.05`        | 二重署名に対するスラッシュ割合              |
| `qdrw_enabled`                 | bool   | `true`        | 動的報酬重み付けを有効化                |
| `qdrw_throughput_weight`       | string | `0.40`        | スループット指標に対する QDRW 重み              |
| `qdrw_latency_weight`          | string | `0.30`        | レイテンシ指標に対する QDRW 重み                 |
| `qdrw_security_weight`         | string | `0.20`        | セキュリティ指標に対する QDRW 重み                |
| `qdrw_decentralization_weight` | string | `0.10`        | 分散化指標に対する QDRW 重み        |
| `qdrw_adjustment_cap`          | string | `0.10`        | 単一エポックあたりの最大 QDRW 調整           |
| `qdrw_adjustment_interval`     | int64  | `100`         | QDRW 調整間のブロック数                |

---

## Burn モジュール (`x/burn`)

| パラメータ           | 型     | デフォルト値 | 説明                                       |
| ------------------- | ------ | ------------- | ------------------------------------------------- |
| `burn_enabled`      | bool   | `true`        | 手数料バーンメカニズムを有効化                         |
| `validator_share`   | string | `0.37`        | ブロックバリデータに分配される手数料の割合  |
| `burn_share`        | string | `0.30`        | 恒久的にバーンされる手数料の割合               |
| `treasury_share`    | string | `0.20`        | コミュニティトレジャリーに送られる手数料の割合       |
| `staker_share`      | string | `0.10`        | デリゲーターに分配される手数料の割合       |
| `light_node_share`  | string | `0.03`        | ライトノードに分配される手数料の割合       |

各割合の合計は `1.00` でなければなりません。手数料の分配はバリデータ、バーン、トレジャリー、ステーカー、ライトノードに対して **37 / 30 / 20 / 10 / 3** です。

---

## xQORE モジュール (`x/xqore`)

| パラメータ            | 型     | デフォルト値 | 説明                                   |
| -------------------- | ------ | ------------- | --------------------------------------------- |
| `min_lock_amount`    | string | `1000000uqor` | xQORE としてロックする最低額               |
| `min_lock_duration`  | string | `7d`          | 最短ロック期間                         |
| `max_lock_duration`  | string | `365d`        | 最長ロック期間                         |
| `penalty_tier_1_pct` | string | `0.50`        | 早期アンロックペナルティ: ロック経過の 0-25%   |
| `penalty_tier_2_pct` | string | `0.30`        | 早期アンロックペナルティ: ロック経過の 25-50%  |
| `penalty_tier_3_pct` | string | `0.15`        | 早期アンロックペナルティ: ロック経過の 50-75%  |
| `penalty_tier_4_pct` | string | `0.05`        | 早期アンロックペナルティ: ロック経過の 75-100% |
| `pvp_rebase_enabled` | bool   | `true`        | PvP リベース再分配を有効化              |

---

## Inflation モジュール (`x/inflation`)

| パラメータ         | 型     | デフォルト値          | 説明                                      |
| ----------------- | ------ | ---------------------- | ------------------------------------------------ |
| `epoch_length`    | uint64 | `100`                  | インフレーションエポックあたりのブロック数                       |
| `blocks_per_year` | uint64 | `6311520`              | 年間推定ブロック数（レート計算用） |
| `initial_rate`    | string | `0.08`                 | 初期年率換算発行レートパラメータ       |
| `rate_decay`      | string | `0.05`                 | 毎年適用される減衰係数                   |
| `min_rate`        | string | `0.02`                 | 発行レートの下限パラメータ                     |
| `max_supply`      | string | `1000000000000000uqor` | 最大トークン供給上限                          |

:::note
上記の `x/inflation` パラメータはデプロイ済みのメカニズムデフォルト値です。正規の **トークノミクス v2.1** 経済モデルの下では、QoreChain は **固定供給** であり、ステーキングおよびエコシステム報酬の資金となる **有限の発行予算（590M プール）** を持ちます。`initial_rate` / `rate_decay` / `min_rate` の値は、その有限予算内で発行がどのようにスケジュールされるかを管理するメカニズムの詳細であり、総供給量に対する無制限の割合インフレーションでは **ありません**。
:::

---

## RL コンセンサスモジュール (`x/rlconsensus`)

`x/rlconsensus` モジュールは、QoreChain コンセンサスエンジンの強化学習最適化レイヤーである **PRISM** を実装します。

| パラメータ                    | 型     | デフォルト値 | 説明                                     |
| ---------------------------- | ------ | ------------- | ----------------------------------------------- |
| `observation_interval`       | uint64 | `10`          | PRISM 観測サンプル間のブロック数        |
| `agent_mode`                 | uint   | `0`           | エージェントモード: 0=オフ, 1=観測, 2=提案, 3=自動 |
| `circuit_breaker_enabled`    | bool   | `true`        | PRISM サーキットブレーカーを有効化                     |
| `circuit_breaker_max_change` | string | `0.10`        | アクションあたりの最大パラメータ変更 (10%)       |
| `circuit_breaker_cooldown`   | uint64 | `100`         | サーキットブレーカー作動後の待機ブロック数      |
| `reward_throughput_weight`   | string | `0.40`        | スループットに対する報酬重み                    |
| `reward_latency_weight`      | string | `0.30`        | レイテンシに対する報酬重み                       |
| `reward_security_weight`     | string | `0.20`        | セキュリティに対する報酬重み                      |
| `reward_stability_weight`    | string | `0.10`        | 安定性に対する報酬重み                     |
| `ppo_learning_rate`          | string | `0.0003`      | PPO 学習率                          |
| `ppo_clip_range`             | string | `0.20`        | PPO クリッピング範囲                            |

---

## Bridge モジュール (`x/bridge`)

| パラメータ                       | 型     | デフォルト値 | 説明                                     |
| ------------------------------- | ------ | ------------- | ----------------------------------------------- |
| `min_confirmations_ibc`         | uint64 | `1`           | IBC 転送の最小確認数         |
| `min_confirmations_ethereum`    | uint64 | `12`          | Ethereum ブリッジの最小確認数       |
| `min_confirmations_bitcoin`     | uint64 | `6`           | Bitcoin ブリッジの最小確認数        |
| `circuit_breaker_enabled`       | bool   | `true`        | ブリッジサーキットブレーカーを有効化                   |
| `circuit_breaker_max_daily_usd` | string | `10000000`    | 1 日あたりの最大ブリッジ量（USD 換算）    |
| `circuit_breaker_max_single_tx` | string | `1000000`     | 単一転送の最大額（USD 換算） |

---

## Multilayer モジュール (`x/multilayer`)

| パラメータ                   | 型     | デフォルト値      | 説明                                       |
| --------------------------- | ------ | ------------------ | ------------------------------------------------- |
| `max_sidechains`            | uint   | `10`               | 登録可能なサイドチェーンの最大数           |
| `max_paychains`             | uint   | `50`               | 登録可能なペイチェーンの最大数            |
| `anchor_interval_sidechain` | uint64 | `100`              | サイドチェーンの必須アンカー間隔（ブロック） |
| `anchor_interval_paychain`  | uint64 | `50`               | ペイチェーンの必須アンカー間隔（ブロック）  |
| `challenge_period`          | string | `7d`               | アンカーに対する不正チャレンジ期間          |
| `min_sidechain_stake`       | string | `1000000000uqor` | サイドチェーン登録の最低ステーク（1,000 QOR） |
| `min_paychain_stake`        | string | `100000000uqor`  | ペイチェーン登録の最低ステーク（100 QOR）    |
| `routing_threshold`         | string | `0.80`             | 自動ルーティングをトリガーする負荷しきい値       |

---

## Cross-VM モジュール (`x/crossvm`)

| パラメータ          | 型     | デフォルト値 | 説明                                    |
| ------------------ | ------ | ------------- | ---------------------------------------------- |
| `max_message_size` | uint64 | `65536`       | クロス VM メッセージの最大サイズ（バイト、64 KB） |
| `max_queue_size`   | uint   | `1000`        | クロス VM キュー内の保留メッセージの最大数 |
| `queue_timeout`    | uint64 | `100`         | 保留メッセージがタイムアウトするまでのブロック数   |

---

## SVM モジュール (`x/svm`)

| パラメータ                     | 型     | デフォルト値 | 説明                                  |
| ----------------------------- | ------ | ------------- | -------------------------------------------- |
| `max_program_size`            | uint64 | `10485760`    | プログラムバイナリの最大サイズ（バイト、10 MB） |
| `compute_budget`              | uint64 | `1400000`     | トランザクションあたりのデフォルト計算ユニット（1.4M） |
| `rent_lamports_per_byte_year` | uint64 | `3480`        | バイトあたりの年間レントコスト（lamports）        |
| `rent_exemption_threshold`    | string | `2.0`         | 免除に必要なレント年数         |
| `max_accounts_per_tx`         | uint   | `64`          | トランザクションあたりの参照可能アカウントの最大数  |

---

## RDK モジュール (`x/rdk`)

| パラメータ             | 型     | デフォルト値                      | 説明                              |
| --------------------- | ------ | ---------------------------------- | ---------------------------------------- |
| `max_rollups`         | uint   | `100`                              | 登録可能なロールアップの最大数               |
| `min_stake`           | string | `10000000000uqor`                  | オペレーターの最低ステーク（10,000 QOR）      |
| `burn_rate`           | string | `0.01`                             | バーンされるロールアップ手数料の割合（1%）    |
| `challenge_window`    | string | `7d`                               | 不正チャレンジウィンドウの期間   |
| `max_blob_size`       | uint64 | `2097152`                          | DA ブロブの最大サイズ（バイト、2 MB）     |
| `blob_retention`      | uint64 | `432000`                           | プルーニング前に DA ブロブを保持するブロック数 |
| `max_batches_pending` | uint   | `10`                               | ロールアップあたりの未確定バッチの最大数   |
| `auto_finalize`       | bool   | `true`                             | EndBlocker 自動確定を有効化      |
| `settlement_types`    | array  | optimistic, zk, based, sovereign   | 許可される決済パラダイム             |
| `preset_profiles`     | array  | defi, gaming, nft, enterprise, custom | 利用可能なロールアッププリセット              |

---

## FairBlock モジュール (`x/fairblock`)

| パラメータ            | 型     | デフォルト値 | 説明                                 |
| -------------------- | ------ | ------------- | ------------------------------------------- |
| `enabled`            | bool   | `false`       | FairBlock tIBE 暗号化を有効化            |
| `tibe_threshold`     | uint   | `2`           | 必要な復号鍵シェアの最小数      |
| `decryption_delay`   | uint64 | `1`           | 確定後、復号までのブロック数 |
| `max_encrypted_size` | uint64 | `4096`        | 暗号化ペイロードの最大サイズ（バイト）     |

---

## ガス抽象化モジュール (`x/gasabstraction`)

| パラメータ         | 型    | デフォルト値 | 説明                                           |
| ----------------- | ----- | ------------- | ----------------------------------------------------- |
| `accepted_tokens` | array | （下記参照）   | 変換レート付きでガス支払いに受け入れられるトークン |

**デフォルトで受け入れられるトークン:**

| トークンデノム | 変換レート | 説明            |
| ----------- | --------------- | ---------------------- |
| `uqor`      | `1.0`           | ネイティブ QOR トークン（1:1） |
| `ibc/USDC`  | `1.0`           | IBC ブリッジ USDC       |
| `ibc/ATOM`  | `10.0`          | IBC ブリッジ ATOM       |

変換レートは、トークン単位あたりのガスユニット数を表します。レートが高いほど、各トークン単位がより多くのガスをカバーします。
