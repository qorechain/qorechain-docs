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
クエリは `--node` が指す先のノードに対して実行されます。ライブデータには **`qorechain-vladi`** メインネットの RPC エンドポイント(例: `--node https://rpc.qore.host:443`)を、テストには **`qorechain-diana`** テストネットのエンドポイント(`--node https://rpc-testnet.qore.host:443`)を使用してください。デフォルトの `tcp://localhost:26657` は、自分で運用しているノードを指します。メインネットはノードリリース v3.2.1、テストネットは v3.2.2 で動作しています。テストネットでは、メインネットにまだ存在しないルートがいくつか提供されている場合があるため、テストネットで動作するクエリがメインネットでは `Not Implemented` を返すことがあります。
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
```

- `algorithm` にはアルゴリズム名(`dilithium5`、`mlkem1024`)または数値 ID を指定します。
- `migration` にはアドレスではなく**アルゴリズム ID**(例: `1`)を指定し、実行中の移行がない場合は `No active migration` を返します。
- `evm-window` は、そのアドレスに EVM レーンの承認ウィンドウが開いているかどうか、および残りのブロック数、トランザクション数、価値を示します(`found`、`live`、`remaining_blocks`、`remaining_txs`、`remaining_value`)。REST: `GET /qorechain/pqc/v1/evm_window/{address}`。

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

`stranded_rewards` は、どの請求の裏付けもないままディストリビューションモジュールに入金されたステーカー取り分を、v3.2.0 アップグレード時の記録として報告します(`reserved`、`released`、`snapshot_height`)。これはガバナンス投票によってのみ解放できます。

---

## mint と inflation

`qorechaind query mint params|inflation|annual-provisions` は標準の mint モジュールを読み取ります。このレートは両ネットワークで `0` であり、プロトコルの発行スケジュールは**報告しません**。`query inflation` コマンドは存在しません。

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

`reward-pool` は、モジュールの報酬残高が `reserved`、`outstanding`、`payable`、`distributable` にどのように分かれるかを示します。

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

`config` は、モジュールのパラメータ(最小ステーク、作成時のバーン率、チャレンジウィンドウ、DA の上限)を表示します。`suggest-profile <use_case>` はチェーンに問い合わせません。パブリックエンドポイントが提供していない JSON-RPC メソッドへの案内を表示するだけなので、[プリセットプロファイル](/rollups/preset-profiles)からプロファイルを選んでください。

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

メインネットはまだガスアブストラクションのクエリを提供していません(`qorechaind query gasabstraction ...` はヘルプテキストを表示し、REST ルートは `Not Implemented` を返します)。手数料は `uqor` のみで支払います。[ガスアブストラクション](/user-guide/gas-abstraction)を参照してください。

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

---

## evm, erc20, wasm

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
