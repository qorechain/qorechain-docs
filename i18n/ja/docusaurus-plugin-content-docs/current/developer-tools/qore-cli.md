---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`、コマンド `qore`)

`qore` は、ターミナルから QoreChain を読み取ります。コードを書かずに、トランザクションの照会、そのポスト量子署名が検証に成功するかの確認、アカウントやバリデーターセットの読み取り、トランザクションのシミュレーション、未署名の送金の準備を行いたい開発者、オペレーター、スクリプト向けです。すべてのコマンドは [QoreChain MCP サーバー](/developer-tools/mcp)のツールを 1 つ実行し、`--json` はそのツールが返す JSON をそのまま出力するため、スクリプトと AI エージェントは同じデータを見ることになります。

署名やブロードキャストは一切行われず、CLI は鍵を保持しません。バージョンは **0.1.0**、2026年10月27日に公開され、ライセンスは Apache-2.0、Node.js 20 以降が必要です。

## 革新点 {#innovations}

- **MCP ツールの出力と同一の JSON。** `qore <command> --json` は、対応する MCP ツールが返すものと同じフィールド名を持つ同じオブジェクトを出力します。`--json` なしでは、同じオブジェクトが読みやすいテキストとして出力されます。一方に対して書いたスクリプトは、もう一方でも動作します。
- **ターミナルからのポスト量子ステータス。** `qore pq status <txhash>` は、トランザクションにハイブリッドレイヤーがちょうど 1 つあるか、そして ML-DSA-87（FIPS 204）署名が、署名者がチェーン上に登録した鍵に対して、sign-bytes v1 と v2 で検証に成功するかを報告します。`qore pq status <address>` は、登録済みの鍵、その種類、所有証明、EVM 認可ウィンドウを報告します。
- **鍵が不要な送金のパイプライン。** `prepare-transfer --json` が未署名の送金を書き出し、`simulate` がそのファイルを受け付けるため、シェルスクリプトから送金の作成、チェック、価格見積もりができます。署名の手順は、ウォレットまたは [QoreSign](/qoresign/overview) に残されます。
- **安定した終了コード。** 0 は成功、1 は `NOT_FOUND` や `INVALID_INPUT` のような安定したコードを持つツールエラー、2 は使い方のエラーであるため、スクリプトは結果で分岐できます。

## 用途 {#use-cases}

1. **トランザクションがハイブリッド署名を持っていたかの確認。** ブロードキャストの直後に、`qore pq status <hash>` が署名ティアと、ML-DSA-87 レイヤーが署名者の登録済みの鍵に対して検証に成功するかを報告します。
2. **ターミナルからチェーンの状態を調べる。** `qore block`、`qore account <address>`、`qore validators`、`qore search <query>` は、エクスプローラーを開いたりコードを書いたりせずに、ちょっとした疑問に答えます。
3. **署名する前に送金の費用を見積もり、確認する。** `prepare-transfer` が未署名の送金を書き出し、`simulate` がガス、残高変化、デコードされた拒否理由を示し、`estimate-fee` が推奨手数料を示します。署名はご自身のウォレットまたは [QoreSign](/qoresign/overview) で行います。
4. **スクリプトや CI ジョブからコントラクトを読み取る。** `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json | jq` で、トークン残高やコントラクトのビューを確認し、結果を解析します。
5. **シェルスクリプトと監視。** `--json` の出力と安定した終了コード（0、1、2）により、スクリプトは結果で分岐できます。同じ JSON を [MCP サーバー](/developer-tools/mcp)も返すため、AI クライアントとスクリプトは同じデータを見ます。

## 仕組み {#how-it-works}

すべての `qore` コマンドは、MCP サーバーの共有コアのツールを 1 つ、ご自身のプロセス内で、選択したネットワークの公開 REST、RPC、EVM JSON-RPC エンドポイントに対して実行します。レスポンスはチェーンの応答からフィールド単位で組み立てられ、上流のエラーテキストが出力されることはなく、失敗は 7 つの安定したエラーコード（`NOT_FOUND`、`INVALID_INPUT`、`UPSTREAM_UNAVAILABLE`、`NOT_AVAILABLE_ON_CHAIN`、`RATE_LIMITED`、`UNAUTHORIZED`、`INTERNAL_ERROR`）のいずれかに対応付けられます。上流へのリクエストごとに、10 秒のタイムアウト（`--timeout` で変更可能）、4 MiB のレスポンス上限があり、リトライはありません。ハイブリッド署名の検証は [QoreSign](/qoresign/overview) でローカルに実行されます。署名も送信も行われません。各ツールの詳細は [MCP サーバーのページ](/developer-tools/mcp#how-it-works)にあります。

## 使い方 {#how-to-use}

インストールせずに実行するか、一度インストールします。

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

コマンドは読み取り専用で、デフォルトはテストネットです。

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

金額は `1.5` または `1.5 QOR`（QOR、小数点以下 6 桁まで）、もしくは `1500000uqor` です。アドレスは `qor1...` または `0x...` が使えます。

### アカウントとトランザクションを確認するスクリプト {#script}

リポジトリには、これを行う完全なスクリプト（`examples/cli/pq-check.sh`）があります。その中核部分は次のとおりです。

```bash
net=testnet
qore() { npx -y @qorechain/qore-cli "$@" --network "$net" --json; }

qore account "$addr" | jq '{exists, balances: [.balances[] | {denom, amount, display}], pq_key_registered}'
qore pq status "$addr" | jq '.address_status | {registered, algorithm, key_type, possession_proven, evm_window: .evm_window.live}'
qore pq status "$tx" | jq '.transaction_status | {tier, has_exactly_one_pqc_layer, signer, verified: .verification.verified, reason: .verification.reason}'

# An unsigned transfer to yourself, then its fee (nothing is signed or sent).
qore prepare-transfer --from "$addr" --to "$addr" --amount 0.000001 > transfer.json
qore simulate transfer.json | jq '{ok, gas_used, suggested_gas_limit, refusal}'
```

`qore block --network mainnet --json` の例（2026年10月27日）:

```json
{
  "network": "mainnet",
  "height": "3858155",
  "hash": "1DA8CA5049ACF8844A3B775E2E138B2B118EDC1FC8C1F3602369B0C18D0B90C2",
  "time": "2026-10-27T21:32:48.831948088Z",
  "chain_id": "qorechain-vladi",
  "proposer_address": "B1CDC8C45DA1FFF9BA5A01320F16FC7460E90B8F",
  "tx_count": 0,
  "tx_hashes": [],
  "tx_hashes_truncated": false,
  "explorer_url": "https://explore.qore.network/block/3858155"
}
```

### コマンド {#commands}

| コマンド | MCP ツール | 内容 |
|---|---|---|
| `chain`, `features` | `get_chain_info` | チェーン ID、最新ブロック、最低ガス価格、sign-bytes のバージョン、プロトコル機能スイッチ、有効な EVM プリコンパイル |
| `block [height]` | `get_block` | 1 つのブロック。デフォルトは最新 |
| `tx get <hash>` | `get_transaction` | ネイティブまたは EVM ハッシュによるトランザクション: ステータス、手数料、メッセージ、署名者、署名ティア |
| `account <address>` | `get_address_info` | 残高、アカウントの状態、ステーク量、両方のアドレス形式 |
| `pq status <address\|txhash>` | `get_pq_status` | アドレスの ML-DSA-87 鍵ステータス、またはトランザクションのハイブリッドレイヤーの確認 |
| `validators [--status S] [--limit N]` | `get_validators` | ステーク順のバリデーター。ステータスは `bonded`（デフォルト）、`unbonding`、`unbonded`、`all` で、limit は 200 まで |
| `staking-tiers [--holder A]` | `get_staking_tiers` | ステーキングティアのパラメータとプール、および 1 人の保有者のロック（チェーン v3.2.4 以降） |
| `search <query>` | `search` | ブロック高、ハッシュ、アドレス、バリデーターを判別して読み取ります |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | EVM の `eth_call` のみ。エンコードとデコードは任意 |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | エンコード済みトランザクションの、ガス、残高変化、デコードされた拒否理由 |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | 推奨ガスリミットと手数料。ML-DSA-87 レイヤーを含みます |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | ウォレットで署名するための未署名の送金 |

グローバルオプション: `--network testnet|mainnet`（デフォルトは `testnet`）、`--json`、`--timeout <ms>`（上流のタイムアウト、デフォルトは 10000）、`--help`、`--version`。ツールのスキーマは [MCP ツールリファレンス](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md)にあります。

### 実行した内容 {#what-was-run}

2026年10月27日に、`@qorechain/qore-cli` 0.1.0 と `@qorechain/mcp` 0.1.0 を npm から空のプロジェクトにインストールし、公開エンドポイントに対して次の読み取り専用コマンドを実行しました。

- `qore --version` は `0.1.0` を出力し、`qore --help` は上記のコマンドを一覧表示しました。
- `qore chain`（テストネット）は、チェーン `qorechain-diana`、EVM チェーン ID 9800、最低ガス価格 0.1、sign-bytes `v2` を出力しました。`qore chain --network mainnet` は、チェーン `qorechain-vladi`、EVM チェーン ID 9801、sign-bytes `v2` を出力しました。
- `qore block`、`qore validators --limit 3 --json`、`qore staking-tiers --json`、`qore search 8981000`、`qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08`、`qore read-contract --to 0x...0a02 --function "x()"` は、それぞれのデータを返しました。
- `qore pq status F642F59F...2152` は、ティア `pqc`、`has_exactly_one_pqc_layer: true`、sign-bytes `v2` での `verified: true` を出力しました。
- `qore prepare-transfer --from A --to A --amount 1.5 --json` は、未署名の送金（ガスリミット 171698、手数料 17170 uqor）を書き出し、そのファイルに対する `qore simulate` は `ok: true` を返し、`qore estimate-fee` は一致する手数料を返しました。送信者と受信者が同じアドレスだったため、ツールは警告を追加しました。署名も送信も行っていません。
- `qore tx get zzz` は `error [INVALID_INPUT]` を出力して 1 で終了し、`qore bogus` は 2 で終了しました。

## アクセス方法 {#how-to-access}

- **ネットワーク。** テストネット `qorechain-diana`（デフォルト）と、`--network mainnet` によるメインネット `qorechain-vladi`。
- **エンドポイント。** CLI は公開されている REST、RPC、EVM JSON-RPC のエンドポイントを読み取ります。テストネットでは `https://api-testnet.qore.host`、`https://rpc-testnet.qore.host`、`https://evm-testnet.qore.host`、メインネットでは `https://api.qore.host`、`https://rpc.qore.host`、`https://evm.qore.host` です。
- **アカウントと鍵。** 不要です。サインイン、API キー、設定ファイルはありません。ホスト型 MCP エンドポイントのキーは CLI には適用されません。
- **前提条件。** Node.js 20 以降と、外向きの HTTPS。
- **費用。** 無料です。準備した送金を送信するには、ご自身のウォレットからネットワーク手数料（下限はガス 1 あたり 0.1 uqor）を支払います。CLI はその手順を行いません。

## セキュリティに関する注意 {#security}

* **署名のコードパスはありません。** CLI は鍵を保持せず、何も署名せず、何もブロードキャストしません。`prepare-transfer` は未署名のドキュメントを返します。
* **秘密情報は拒否されます。** リカバリーフレーズ（BIP-39 の単語が 12 語以上連続したもの）や、32 バイトの秘密鍵そのものに見える入力は、リクエストが行われる前に `INVALID_INPUT` で拒否されます。それでも、コマンドラインには入れないでください。シェルの履歴に残りますし、エラーはその秘密情報を漏えいしたものとして扱うよう伝えます。
* **マシンの外に出るのは公開データだけです。** 渡したアドレス、ハッシュ、エンコード済みトランザクションが、公開されている QoreChain のエンドポイントに送信されます。
* **メインネットは明示的に指定します。** `--network mainnet` を渡さない限り、呼び出しはテストネットに送られ、メインネット向けに準備された送金には警告が付きます。
* **メモは公開され、永続的に残ります。** `--memo` に秘密情報を入れないでください。
* 脆弱性は、公開の issue ではなく、security@qore.network に非公開で報告してください。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | インストール | 備考 |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`。Node.js 20 以降 |

ソース: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp)、フォルダー `packages/cli`（公開、Apache-2.0、2026年10月27日に確認）。CLI の Python 版や Rust 版はありません。サーバー自体も PyPI に [`qorechain-mcp`](/developer-tools/mcp#where-published) として公開されています。

## 制限と既知の問題 {#limits}

- **読み取り専用。** 署名やブロードキャストを行うコマンドはありません。`prepare-transfer` は uqor のネイティブレーンの `MsgSend` のみを作成し、EVM、SVM、ステーキング、ガバナンス、コントラクトのトランザクションは準備しません。`simulate` と `estimate-fee` は、エンコード済みのあらゆるネイティブレーンのトランザクションを受け付けます。
- **ファウセットとトークン保有者の一覧はありません。** この 2 つの MCP ツールには CLI コマンドがありません。テストネットの QOR は[ファウセット](/dashboard/faucet)から入手します。
- **テストネットの履歴は削除されます。** 古いテストネットのブロックやトランザクションは、利用可能な最も低い高さとともに `NOT_FOUND` を返します。メインネットは、確認時点で高さ 1 から提供されていました。
- **ガスの数値はチェーンバージョンに従います。** 両ネットワークとも v3.2.5 を適用済みのため、シミュレーションには ML-DSA-87 の検証コストが含まれます。それより古いノードに対しては、推奨ガスリミットにマージンが加えられます。
- **出力の制限。** ブロックあたり最大 100 件のトランザクションハッシュ、トランザクションあたり 50 件のメッセージ、アカウントあたり 100 件の残高、1 回の呼び出しあたり 200 件のバリデーター。各リクエストには、デフォルトで 10 秒のタイムアウト、4 MiB のレスポンス上限があり、リトライはありません。
- **秘密情報は拒否されます。** リカバリーフレーズや秘密鍵そのものに見える入力は、`INVALID_INPUT` で拒否されます。シェルの履歴に残るため、コマンドラインに入れないでください。
- **EVM のポスト量子プリコンパイル** `0x...0A01` と `0x...0A02` は、テストネットでのみ有効です。
- **最初のリリース。** 0.1.0: コマンド名とオプションは今後のバージョンで変更される可能性があります。スクリプトには `--json` と終了コードを使用し、バージョンを固定してください。

## 関連ページ {#related}

* [QoreChain MCP サーバー](/developer-tools/mcp): AI クライアント向けの同じツール群。ホスト型エンドポイントがあります。
* [QoreSign](/qoresign/overview): `prepare-transfer` が書き出した送金に署名します。
* [SDK CLI リファレンス](/sdk/reference/cli): SDK 独自のコマンドラインです。
* [ファウセット](/dashboard/faucet): テストネットの QOR。
* [開発者パッケージの概要](/developer-tools/overview)。
