---
slug: /cli-reference/query-commands
title: クエリコマンド
sidebar_label: クエリコマンド
sidebar_position: 3
---

# クエリコマンド

すべてのクエリコマンドは次のパターンに従います。

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
クエリは `--node` が指す先のノードに対して実行されます。ライブデータには **`qorechain-vladi`** メインネットの RPC エンドポイント(例: `--node https://rpc.qore.host:443`)を、テストには **`qorechain-diana`** テストネットのエンドポイント(`--node https://rpc-testnet.qore.host:443`)を使用してください。デフォルトの `tcp://localhost:26657` は、自分で運用しているノードを指します。メインネットは 2026年10月23日からノードリリース v3.2.4 で動作しています(ガバナンス提案 13 により高さ 3,742,566 で適用)。テストネットは 2026年10月19日から v3.2.4 で動作しています。v3.2.4 リリースでは、ルートやコマンドがいくつか追加されます(以下では **v3.2.4** と明記)。これらは両ネットワークで動作し、それより古いリリースのままのノードは `Not Implemented` で応答します。このページのコマンドは、`https://rpc.qore.host:443` に対して実行した v3.2.3 リリースバイナリで確認しており、v3.2.4 のルートは 2026年10月23日に REST で確認しました。
:::

すべての `query` サブコマンドに共通のフラグがあります。

| フラグ       | 型   | 説明                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC エンドポイント(デフォルト: `tcp://localhost:26657`) |
| `--output` | string | 出力フォーマット: `json` または `text`                 |
| `--height` | int    | 特定のブロック高でステートをクエリ          |

すべてのモジュールに CLI クエリがあるわけではありません。コマンドがない場合は、REST エンドポイント(`https://api.qore.host/...`)を使用してください。[REST API](/api-reference/rest-grpc-endpoints)を参照してください。

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(`query bank total` は存在しません。)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status` には列挙型の完全な名前を指定します。`BOND_STATUS_BONDED`、`BOND_STATUS_UNBONDING`、または `BOND_STATUS_UNBONDED` です(`--status bonded` は拒否されます)。

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status` は `deposit-period`、`voting-period`、`passed`、`rejected`、`failed` を受け付けます。その他のフィルタ: `--voter`、`--depositor`。

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm` にはアルゴリズム名(`dilithium5`、`mlkem1024`)または数値 ID を指定します。
- `migration` にはアドレスではなく**アルゴリズム ID**(例: `1`)を指定し、実行中の移行がない場合は `No active migration` を返します。
- `account` は登録済みの鍵を報告します。鍵、`key_type`、`algorithm_name` のほかに、レコードには `classical_key_source`(`stored`、`auth_account`、または `none`: クラシカル公開鍵の取得元)があります。v3.2.4 以降(メインネットでは 2026年10月23日から、テストネットでは 2026年10月19日から)は `possession_proven` も含まれ、鍵が検証済みの所有証明とともに登録された場合は `true` になります。
- `evm-window` は、そのアドレスに EVM レーンの承認ウィンドウが開いているかどうか、および残りのブロック数、トランザクション数、価値を示します(`found`、`live`、`remaining_blocks`、`remaining_txs`、`remaining_value`)。さらにウィンドウの適用範囲(`native_only`、`allowed_targets`。メインネット v3.2.3 以降)も示します。REST: `GET /qorechain/pqc/v1/evm_window/{address}`。
- `evm-delegation-consent` は、そのアドレスの EIP-7702 委任の同意(`found`、`live`、`delegate`、`granted_height`、`expiry_height`)、現在の委任、およびその EVM ナンスを示します。REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`。
- `params` と `hybrid-mode` は `hybrid_signature_mode`(`2` = 両ネットワークで必須)と `allow_classical_fallback`(`false`)を報告します。

---

## burn

burn モジュールには CLI クエリがありません。REST を使用してください。

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards` は、どの請求の裏付けもないままディストリビューションモジュールに入金されたステーカー取り分を報告します(`reserved`、`released`、`snapshot_height`)。これはガバナンス投票によってのみ解放できます。この準備金は v3.2.0 アップグレード時に最初に記録され、v3.2.3 アップグレードのブロック高で再計算されたため、他所で引用されている数値ではなく、ライブの値を読み取ってください。

`stats` は累積バーン量を発生源別に分けて示します。その中の `failed_tx` は、v3.2.2 アップグレード以降、ゼロ以外の値になっています。

---

## mint と inflation

`qorechaind query mint params|inflation|annual-provisions` は標準の mint モジュールを読み取ります。このレートは両ネットワークで `0` であり、プロトコルの発行スケジュールは**報告しません**。`query inflation` コマンドは存在しません。プロトコル独自の発行設定と進捗は、v3.2.2 以降 REST で提供されています。

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

メインネットでは、これらは `emission_mode: "fixed"`、43,200 ブロックのエポックごとに 86,000 QOR の固定発行、累積上限 590,000,000 QOR を報告します(ガバナンス提案 10、2026年10月19日に可決。新しい発行量での最初のエポックはブロック 3,672,000 から開始)。金額の単位は `uqor` です。テストネットは引き続き、それとは異なる独自の値を報告します。v3.2.4 リリースでは発行モードがさらに追加されます(両ネットワークで利用可能)が、ネットワークがそのモードに切り替わるのは各ネットワーク自身のガバナンス投票によってのみであるため、そのような投票が可決されるまでメインネットは `fixed` のままです。

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation と qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

バリデータごとのレピュテーションクエリやプール分類クエリはありません。

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool` は、モジュールの報酬残高が `reserved`、`outstanding`、`payable`、`distributable` にどのように分かれるかと、ノードごとの上限を示します。上限は `max_reward_per_block_per_node` と、v3.2.3 以降は `max_reward_per_month_per_node`(2,000 QOR。ブロック時間とアップタイムに応じて按分)です。v3.2.4 以降(メインネットでは 2026年10月23日から、テストネットでは 2026年10月19日から)は、`monthly_cap_active`、`last_distribution_time`、`last_distribution_height` も報告します。

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check` は、被付与者がその機能のライセンスを保有していない場合、`NotFound` エラーを返します。

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config` は、モジュールのパラメータ(最小ステーク、作成時のバーン率、チャレンジウィンドウ、DA の上限)を表示します。`anchor-sign-bytes` は、ロールアップ作成者が `tx rdk submit-batch --anchor-signature` のために署名する v2 のアンカー署名バイト列を 16 進数で出力します。同じクエリは v3.2.2 以降、`/qorechain/rdk/v1/...` 配下の REST でも提供されています([REST / gRPC エンドポイント](/api-reference/rest-grpc-endpoints#rdk-module)を参照)。`suggest-profile <use_case>` はチェーンに問い合わせません。パブリックエンドポイントが提供していない JSON-RPC メソッドへの案内を表示するだけなので、[プリセットプロファイル](/rollups/preset-profiles)からプロファイルを選んでください。

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

アブストラクトアカウントモジュールは現在、両ネットワークで無効になっています(`config.enabled` は `false`)。そのため、これらのクエリはアカウントを返しません。

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`、`auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>`、`auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>` は、オーセンティケーターの署名をオフラインで構築します。オーセンティケーターのシードが引数になることはありません。シードは `--seed-file <file>`(標準入力の場合は `-`)、環境変数 `QORE_AUTH_SEED`、またはエコーなしのプロンプトから読み取られ、`auth-keygen` はシードを表示する代わりに新しい `0600` ファイル(`--out`)に書き込みます。

---

## gasabstraction

ガスアブストラクションのクエリは、v3.2.2 以降、両ネットワークで提供されています。

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

受け入れトークンのリストには、両ネットワークともネイティブの `uqor` だけが含まれるため、手数料は `uqor` で支払われ、変換は行われません。他にどのトークンを受け入れるかはガバナンスが決定します。REST: `/qorechain/gasabstraction/v1/config`、`/conversion_rate?denom=`、`/float`。[ガスアブストラクション](/user-guide/gas-abstraction)を参照してください。

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

執筆時点では、どちらのネットワークにもプールは存在しません。

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

ステーキングティアモジュールは **v3.2.4** リリースの一部です。テストネットでは 2026年10月19日から稼働しており、メインネットでは 2026年10月23日から（高さ 3,742,566、ガバナンス提案 13）稼働しています。それより古いリリースのノードは、これらのクエリに `Not Implemented` で応答します。REST: `/qorechain/stakingtier/v1/params`、`/locks/{holder}`、`/pool`。[トランザクションコマンド](/cli-reference/transaction-commands#stakingtier)を参照してください。

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>` は、アップグレードがいつ有効になったかを読み取る方法です。メインネットでは `v3.2.2` がブロック高 3,556,788 で、`v3.2.3` がブロック高 3,662,051 で、`v3.2.4` がブロック高 3,742,566 で適用されました。テストネットでは `v3.2.2` が 6,905,034、`v3.2.3` が 8,003,746、`v3.2.4` が 8,337,253 で適用されています(`0` は未適用を意味します)。メインネットのサーキットブレーカーリスト(`disabled-list`)には現在、ベスティングアカウント作成メッセージ、QoreChain Native の store と instantiate、AMM プールの一時停止と再開、クロス VM 呼び出し、マルチレイヤーのレイヤーステータス更新、PQC アルゴリズムの非推奨化と無効化、PRISM コンセンサスのガバナンスメッセージが含まれています。テストネットのリストには QoreChain Native の 3 つのメッセージだけが含まれています。

---

## evm, erc20, wasm

`wasm` コマンドは QoreChain Native、すなわち QoreChain が CosmWasm スマートコントラクトランタイムに付けている名称を読み取ります。コマンド名とモジュール名は `wasm` という表記のままです。

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

---

## CLI のないモジュール

`xqore`、`babylon`、`fairblock` には、トランザクションコマンドもクエリコマンドもありません。現時点では、CLI からも公開 API からも利用できません。
