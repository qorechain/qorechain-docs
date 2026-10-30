---
slug: /developer-tools/mcp
title: QoreChain MCP サーバー
sidebar_label: MCP サーバー
sidebar_position: 23
---

# QoreChain MCP サーバー (`@qorechain/mcp`)

QoreChain MCP サーバーは、[Model Context Protocol](https://modelcontextprotocol.io) を通じて、AI エージェントや開発者ツールに QoreChain への読み取りアクセスを提供します。ブロック、トランザクション、アカウント、バリデーター、ステーキングティア、ハイブリッド secp256k1 + ML-DSA-87（FIPS 204）署名のステータス、EVM コントラクトの読み取り、シミュレーションと手数料の見積もり、そしてアカウント所有者が自分のウォレットで署名する未署名の送金を扱えます。MCP 対応のクライアントやエージェントを QoreChain に接続したい開発者と、出力が安定した、スクリプト化可能な読み取り専用のチェーンビューを求めるチーム向けです。

このサーバーは署名せず、鍵を保持せず、トランザクションをブロードキャストすることもありません。お使いのマシン上で stdio により動作するか、ご自身または QoreChain がホストする Streamable HTTP サーバーとして動作します。バージョンは **0.1.0**、2026年10月27日に公開され、ライセンスは Apache-2.0 です。コマンドラインの対となる [`qore`](/developer-tools/qore-cli) が、同じツールをターミナルから実行します。

## 革新点 {#innovations}

- **ラベルだけではないハイブリッド署名の検証。** `get_pq_status` はトランザクションハッシュを受け取り、本体にちょうど 1 つの `/qorechain.pqc.v1.PQCHybridSignature` レイヤーがあることを確認し、その ML-DSA-87 レイヤーを、署名者がチェーン上に登録した鍵に対して [QoreSign](/qoresign/overview) でローカルに検証します。その際、sign-bytes v1 と v2 の両方を試します。答えは `verified: true` または `false` と理由であり、トランザクションの種類からの推測ではありません。
- **実際の手数料を含む未署名の送金。** `prepare_transfer` は送信者のアカウント番号、シーケンス、公開鍵を読み取り、正しいサイズのプレースホルダー ML-DSA-87 レイヤーを付けて送金をシミュレートします。これにより、ガスには署名時にウォレットが追加するレイヤー分が含まれます。そして SignDoc、読みやすい要約、チェックを返します。足りないのは所有者の署名だけです。
- **デコードされた拒否理由付きのシミュレーション。** `simulate_tx` と `estimate_fee` は、使用ガス、推奨ガスリミット、アドレスごとの残高変化を返し、ネットワークがトランザクションを拒否する場合は、生のエラー文字列ではなくデコードされた拒否理由を返します。
- **サーバーと CLI で共通のスキーマ。** すべての `qore` コマンドは 1 つの MCP ツールを実行し、`qore --json` はそのツールが返す JSON をそのまま出力します。Python パッケージも同じツール名、入出力スキーマ、エラーコードを提供し、どちらも同じ記録済みのチェーン応答でテストされています。
- **秘密情報はマシンの外に出る前に拒否されます。** リカバリーフレーズ（BIP-39 の単語が 12 語以上連続したもの）や、32 バイトの秘密鍵そのものに見える入力は、リクエストが行われる前に `INVALID_INPUT` で拒否され、エラーはその秘密情報を漏えいしたものとして扱うようユーザーに伝えます。
- **フィールド単位で組み立てられるレスポンス。** すべての出力は、チェーンの応答の名前付きフィールドから組み立てられます。上流のエラー本文やスタックトレースがクライアントに届くことはなく、失敗は 7 つの安定したエラーコードに対応付けられます。

## 用途 {#use-cases}

1. **コーディングアシスタントにチェーンの状態を尋ねる。** 開発者が MCP 対応のエディターにサーバーを追加し、「メインネットの最新ブロックは？」や「テストネットの qor1... の残高を表示して」と尋ねます。`get_block` と `get_address_info` が、エクスプローラーのリンク付きで、公開エンドポイントから答えます。
2. **トランザクションがハイブリッド署名を持っていたかの確認。** ウォレットや SDK の開発者がトランザクションをブロードキャストした直後に、それがちょうど 1 つの ML-DSA-87 レイヤーを持ち、そのレイヤーが登録済みの鍵に対して検証に成功することを確認したい場合。`get_pq_status`（または `qore pq status <hash>`）が、署名ティアとローカルでの検証結果を報告します。
3. **ユーザーが署名するための送金を準備する。** QoreChain 上に構築されたアシスタントが、鍵に触れずにユーザーの QOR 送金を手伝う必要がある場合。`prepare_transfer` は、読みやすい要約、チェック、警告（メインネット向けの警告を含む）付きの未署名の SignDoc を返し、`estimate_fee` が手数料を示します。ユーザーは自分のウォレットで署名します。
4. **拒否されたトランザクションのデバッグ。** バックエンドチームが、ネットワークに拒否されるエンコード済みトランザクションを持っている場合。`simulate_tx` は、ガス、アドレスごとの残高変化、デコードされた拒否理由を返し、何もブロードキャストしません。
5. **スクリプトや CI ジョブからコントラクトを読み取る。** dApp チームが `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json` でトークン残高やコントラクトのビューを確認し、その JSON を `jq` で解析します。
6. **バリデーターとステーキングのダッシュボード。** アナリストが、ボンドされたバリデーターを投票力の割合とコミッション付きで一覧表示し（`get_validators`）、ステーキングティアのパラメータと 1 人の保有者のロックを読み取ります（`get_staking_tiers`）。
7. **チーム用エンドポイントの運用。** 企業が自社のリバースプロキシの背後で、API キーとレート制限を付けて `qorechain-mcp serve` を実行し、複数の社内ツールが、自社のノードを指す 1 つの MCP エンドポイントを共有します。

## 仕組み {#how-it-works}

* このサーバーは、公開されている QoreChain のエンドポイント（REST、コンセンサス RPC、EVM JSON-RPC）に対する、薄いステートレスなリーダーです。上流への呼び出しはそれぞれ 1 回のリクエストで、10 秒のタイムアウト、4 MiB のレスポンス上限があり、リトライはありません。
* レスポンスはチェーンの応答からフィールド単位で組み立てられます。上流のエラー本文、スタックトレース、ライブラリのメッセージがクライアントに届くことはなく、予期しない失敗は `INTERNAL_ERROR` になります。エラーは `isError: true` のツール結果と JSON 本文として返されます。
* ハイブリッド署名の検証は [QoreSign](/qoresign/overview) でローカルに実行されます。サーバーはトランザクションと署名者の登録済み ML-DSA-87 鍵を取得し、sign-bytes（v1 または v2）を再構築して検証します。
* シミュレーション: v3.2.5 以降のチェーンでは、シミュレーションにすでに ML-DSA-87 の検証コストが含まれており（`get_chain_info` の `exact_gas_simulation: true`）、推奨ガスリミットは正確です。それより古いチェーンではマージンが加えられます。本体に ML-DSA-87 レイヤーがない場合、`simulate_tx` は正しいサイズのプレースホルダーレイヤー（ブロードキャストされません）を追加し、ガスがウォレットの署名するトランザクションと一致するようにします（`assume_pqc_layer`、デフォルトは true）。サーバーはチェーンのバージョンを自動的に検出します。
* EVM プリコンパイル `0x...0A01`（ML-DSA-87 検証）と `0x...0A02`（鍵ステータス）はテストネットでのみ有効です。メインネットでこれらを呼び出すと、空のデータが返されます。
* 機械可読なツールスキーマは、リポジトリに `spec/tools.json` として含まれており、サーバー自身の `tools/list` の応答から生成されます。人が読むためのリファレンスは `docs/tools.md` です。

## 使い方 {#how-to-use}

npm パッケージには Node.js 20 以降、Python パッケージには Python 3.10 以降が必要です。

### npx でローカル実行する {#run-npx}

サーバーが起動することを確認してから、MCP クライアントに追加します。ローカルサーバーを起動するほとんどのクライアントは、`mcpServers` オブジェクトを持つ JSON ファイルを読み込みます（ファイル名と HTTP サーバー用のキー名はクライアントごとに異なります。お使いのクライアントのドキュメントを参照してください）。

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

クライアントを再起動すると、14 個のツールが一覧に表示されます。サーバーはクライアントと stdio で通信します。その後、たとえば次のように尋ねます。

- "What is the latest block on QoreChain mainnet?" (`get_block`)
- "Does testnet transaction F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 carry a valid ML-DSA-87 layer?" (`get_pq_status`)
- "Prepare a 1.5 QOR testnet transfer from my address to qor1... and estimate the fee." (`prepare_transfer`, `estimate_fee`)

### pip または uvx でローカル実行する {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Python パッケージは stdio のみを提供します。Streamable HTTP、API キー、レート制限には npm パッケージ（下記）を使用してください。このパッケージにはライブラリのエントリーポイント `run_tool` もあります。

### HTTP サーバーとして実行する {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

HTTP トランスポートはステートレスで、JSON で応答します。MCP リクエストには `POST /mcp`、`{"status":"ok"}` を返すヘルスチェックには `GET /healthz` を使います。オプションは次のとおりです。

| オプション | デフォルト | 意味 |
|---|---|---|
| `--port` | 8787 | TCP ポート |
| `--host` | 127.0.0.1 | バインドアドレス。`0.0.0.0` はすべてのインターフェースで待ち受けます |
| `--api-keys-file` | なし | 受け付けるキーの SHA-256 ハッシュのファイル。設定すると、リクエストに `Authorization: Bearer <key>` が必要になります |
| `--rate-limit` | 60 | API キーごと、およびクライアント IP ごとの 1 分あたりのリクエスト数。`0` でオフになります |
| `--allowed-origin` | なし | エンドポイントの呼び出しを許可するブラウザーのオリジン（繰り返し指定可）。それ以外のオリジンは HTTP 403 になります |
| `--trust-proxy` | オフ | クライアント IP を `X-Forwarded-For` から取得します。自分で管理するプロキシの背後でのみ使用してください |
| `--network` | testnet | ネットワークを指定しない呼び出しに使うネットワーク |

自分のエンドポイントを保護するには、キーを作成し、そのハッシュだけを保存して、キーをクライアントに渡します。

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` には 1 行につき 64 桁の 16 進ハッシュを 1 つ記述します（任意の `sha256:` プレフィックスも受け付けられ、`#` でコメントが始まります）。キーがない、または未知のキーの場合は、`UNAUTHORIZED` で始まるエラーメッセージとともに HTTP 401 になります。レート制限を超えると、サーバーは `Retry-After` 付きで HTTP 429 を返します。お使いのマシンの外から到達できるサーバーには、前段に TLS を置いてください。

このパッケージは、ご自身のランタイムに組み込むための `createServer`、`createHttpHandler`、`startNodeServer` もエクスポートしています。詳細は、ソースリポジトリの[セルフホスティング](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md)を参照してください。

### 設定 {#configuration}

| 設定 | 方法 | 効果 |
|---|---|---|
| 呼び出しごとのネットワーク | 任意のツールの `network` 引数: `testnet` または `mainnet` | その呼び出しで使うチェーンを選びます |
| デフォルトのネットワーク | サーバーコマンドの `--network testnet` または `--network mainnet` | 呼び出しがネットワークを指定しないときに使われるネットワーク。デフォルトは `testnet` |
| HTTP のポート、ホスト、キー、制限 | 上記の `serve` オプション | HTTP モードのみ |
| 上流のタイムアウト | リクエストごとに 10 秒で固定、レスポンス上限 4 MiB、リトライなし | 遅いエンドポイントは `UPSTREAM_UNAVAILABLE` になります |

メインネットは `qorechain-vladi`（EVM チェーン ID 9801）、テストネットは `qorechain-diana`（EVM チェーン ID 9800）です。メインネット向けに準備された送金には、追加の警告が付きます。ネットワーク用の環境変数はなく、コマンドラインフラグか呼び出しごとの引数を使います。クライアントのデフォルトをメインネットにするには、次のようにします。

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### ツール {#tools}

14 個のツールはすべて読み取り専用で、任意の `network` を受け取ります。入力と出力はサーバー自身のスキーマから生成されます。すべてのフィールドは[ツールリファレンス](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md)に記載されています。

| ツール | 返すもの |
|---|---|
| `get_chain_info` | チェーン ID、最新ブロック、最低ガス価格、sign-bytes のバージョン、プロトコル機能スイッチ、予定されている場合は保留中のアップグレード、有効な EVM プリコンパイル |
| `get_block` | 1 つのブロック（または最新のブロック）: ハッシュ、時刻、プロポーザー、トランザクション数、最大 100 件のトランザクションハッシュ |
| `get_transaction` | ネイティブハッシュまたは EVM ハッシュ（`0x` プレフィックス）によるトランザクション: ステータス、手数料、メモ、ガス、最大 50 件のメッセージ、署名者、署名ティア（`pqc`、`enrollment`、`shake`、`classical`） |
| `get_address_info` | 両方のアドレス形式（`qor1...` と `0x...`）、アカウントの状態、最大 100 件の残高、ステーク量、ML-DSA-87 鍵が登録されているか、バイトコードがデプロイされているか |
| `get_pq_status` | アドレスの場合: 登録済みの鍵、アルゴリズム、所有証明、EVM 認可ウィンドウ。トランザクションの場合: ハイブリッドレイヤーがちょうど 1 つあるか、そして検証に成功するか |
| `get_validators` | ステーク順のバリデーター（デフォルトは bonded、最大 50 件、limit は 200 まで）: ステータス、jailed フラグ、ステーク、投票力の割合、コミッション |
| `get_staking_tiers` | ステーキングティアモジュール: ロック条件とボーナス、早期アンロックのペナルティ、ボーナスプール、そして任意で 1 人の保有者のロック。チェーン v3.2.4 以降 |
| `search` | 1 つの文字列からブロック高、トランザクションハッシュ、アドレス、バリデーターを判別し、それを読み取り、同じデータを返すツールの名前を示します |
| `read_contract` | EVM の `eth_call` のみ。関数シグネチャの ABI エンコードと結果のデコードは任意 |
| `estimate_fee` | シミュレートされたガス、推奨ガスリミット、手数料（ガスリミット × 最低ガス価格）。ML-DSA-87 レイヤーを含みます |
| `simulate_tx` | エンコード済みトランザクションの、使用ガス、推奨ガスリミット、アドレスごとの残高変化、デコードされた拒否理由 |
| `prepare_transfer` | uqor の未署名 `MsgSend`: SignDoc、読みやすい要約、チェックと警告 |
| `get_token_holders` | 常に `NOT_AVAILABLE_ON_CHAIN`: 保有者の一覧にはインデクサーが必要ですが、公開エンドポイントは提供していません |
| `request_faucet` | 常に `NOT_AVAILABLE_ON_CHAIN`: テストネットの QOR はダッシュボードの[ファウセット](/dashboard/faucet)から入手します |

エラーは `isError: true` のツール結果で、JSON 本文は `{"error": {"code", "message", "details?"}}` です。コードは `NOT_FOUND`、`INVALID_INPUT`、`UPSTREAM_UNAVAILABLE`、`NOT_AVAILABLE_ON_CHAIN`、`RATE_LIMITED`、`UNAUTHORIZED`、`INTERNAL_ERROR` です。

### ライブラリとして使う {#library}

npm パッケージは、`createServer({ defaultNetwork })`（任意の MCP トランスポート向けの MCP サーバーインスタンス）、`createHttpHandler({ apiKeyHashes, rateLimitPerMinute })`（Fetch API ハンドラー、`(Request) => Promise<Response>`）、`startNodeServer(...)`（`serve` が使う Node の HTTP サーバー）をエクスポートします。共通のオプションは、`defaultNetwork`、`endpoints`（ネットワークを自分のノードに向けます）、`upstream`（`timeoutMs`、`maxResponseBytes`、`fetch`）、`onToolCall`（ツール名、ステータス、レイテンシを受け取ります）です。

Python パッケージも、`run_tool` を通じて同じように使えます。

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### ホスト型エンドポイントをターミナルからテストする {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

有効なキーがない場合、エンドポイントは `UNAUTHORIZED` で始まるメッセージを持つ JSON-RPC エラーとともに HTTP 401 を返します。

### トラブルシューティング {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: 公開エンドポイントが 10 秒以内に応答しませんでした。もう一度お試しください。
* 古いテストネットのブロックでの `NOT_FOUND`: テストネットのノードは履歴を削除しており、エラーには利用可能な最も低い高さが示されます。`get_chain_info` は `earliest_available_height` を報告します。
* クライアントにツールが一覧表示されない: ターミナルで `npx -y @qorechain/mcp --help` を実行して Node と npm が動作することを確認し、その後クライアントの MCP ログを読んでください。
* ホスト型エンドポイントでの `UNAUTHORIZED`: キーがない、誤っている、失効している、またはまだ有効になっていません（新しいキーが有効になるまで 1〜2 分かかることがあります）。

### 実行した内容 {#what-was-run}

2026年10月27日に、公開されたパッケージをレジストリからインストールし、公開テストネットとメインネットのエンドポイントに対して実行しました。

- `qorechain-mcp --version` は `0.1.0` を出力しました。stdio 経由で、`initialize` はサーバー名 `qorechain-mcp` を返し、`tools/list` は上記の 14 個のツール名を返しました。`pip install qorechain-mcp==0.1.0` はインストールに成功し、その `--version` は `0.1.0` を出力しました。
- `qorechain-mcp serve --port 18787` は、`GET /healthz` に `{"status":"ok"}` で、また `POST /mcp` 経由の `get_chain_info` の `tools/call` に応答しました。
- `get_chain_info` は、テストネットではチェーン `qorechain-diana`、EVM チェーン ID 9800、最低ガス価格 0.1 uqor、sign-bytes `v2` を返し、メインネットではチェーン `qorechain-vladi`、EVM チェーン ID 9801、sign-bytes `v2` を返しました。
- 上記のテストネットのトランザクションに対する `get_pq_status` は、ティア `pqc`、ハイブリッドレイヤーがちょうど 1 つ、sign-bytes `v2` で `verified: true` を返しました。
- テストネットでの 1.5 QOR の `prepare_transfer` は、ガスリミット 171698、手数料 17170 uqor（0.01717 QOR）の SignDoc を返し、その未署名トランザクションに対する `simulate_tx` は、送信者から手数料が引き落とされる `ok: true` を返しました。署名も送信も行っていません。

## アクセス方法 {#how-to-access}

- **ローカル（主な選択肢）。** `npx -y @qorechain/mcp` または `uvx qorechain-mcp` による stdio。アカウントも API キーも不要です。公開されている QoreChain のエンドポイントを読み取るため、外向きの HTTPS が必要です。
- **ご自身の HTTP サーバー。** 上記のとおり `qorechain-mcp serve` を使い、API キーとレート制限はご自身で設定します。
- **ホスト型エンドポイント。** `https://mcp.qorechain.io/mcp` が Streamable HTTP トランスポートを提供します。呼び出しが `"network": "mainnet"` を指定しない限り、テストネットを使用します。すべてのリクエストに、`Authorization: Bearer <key>` として送信する API キーが必要で、キーはダッシュボードから申請してください（下記参照）。キーがない場合、エンドポイントは HTTP 401（`UNAUTHORIZED`）を返し、これは2026年10月27日時点の応答でした。有効なキーはアカウントごとに 1 つで、各キーは 1 秒あたり 10 リクエスト（バースト 20）、1 日あたり 100,000 リクエストに制限されます。ほとんどの用途では、キーが不要なローカル構成のほうがシンプルです。

  キーを取得するには、[dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) にサインインし、**AI agents (MCP)** タブを開いて **API key** フォーム（名前または組織名、連絡先、想定する用途、想定するリクエスト量）に入力し、**Request API key** を押します。QoreChain チームがリクエストを承認または却下します。却下された場合はそのメモが表示され、再度申請できます。承認後に **Generate key** を押します。キーは一度だけ表示され、コピーボタンと、そのまま使える設定スニペットが付き、1〜2 分以内に有効になります。QoreChain が保持するのはフィンガープリント（ハッシュ）のみのため、紛失したキーを再表示することはできません。そのキーを失効させ（約 1 分で反映されます）、新しいキーを申請してください。[Developers ページ](/dashboard/developers#mcp)を参照してください。

キーが必要なサーバー向けの HTTP クライアント設定（正確なキー名はクライアントによって異なります）:

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

リカバリーフレーズや秘密鍵をクライアント設定に入れないでください。QoreChain のどのツールもそれらを必要としません。

サーバーは次の公開エンドポイントから読み取ります。

| | テストネット | メインネット |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| コンセンサス RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

費用: サーバーは無料です。読み取りに費用はかかりません。`prepare_transfer` が作成したトランザクションをブロードキャストする場合は、ネットワーク手数料がかかります（手数料の下限はガス 1 あたり 0.1 uqor です）。

## セキュリティに関する注意 {#security}

* **署名のコードパスは存在しません。** サーバーにも CLI にもありません。何も署名されず、鍵は保存されず、何もブロードキャストされません。
* **秘密情報は拒否されます。** リカバリーフレーズ（BIP-39 の単語が 12 語以上連続したもの）や、32 バイトの 16 進の秘密鍵そのものに見える入力は、リクエストが行われる前に `INVALID_INPUT` で拒否され、エラーはその秘密情報を漏えいしたものとして扱うようユーザーに伝えます。リカバリーフレーズや秘密鍵をクライアント設定に入れないでください。QoreChain のどのツールもそれらを必要としません。
* **上流のエラーテキストは転送されません。** レスポンスはフィールド単位で組み立てられます。
* **ログ。** HTTP ログには、JSON-RPC メソッド、ツール名、ステータス、レイテンシが含まれます。入力、出力、キー、クライアントアドレスは記録されません。
* セルフホストしたサーバーの **API キー**は SHA-256 ハッシュとして保存され、平文では保存されません。CORS はデフォルトで閉じられており、これは localhost にバインドされたサーバーを DNS リバインディングから守ることにもなります。
* **メインネットは明示的に指定する必要があり**、`prepare_transfer` はメインネットの送金に警告を追加します。
* **メモは公開され、永続的に残ります。** メモに秘密情報を入れないでください。
* **ホスト型の API キーはパスワードのように扱ってください。** 環境変数またはシークレットストアに保管し、漏えいした場合はダッシュボードから失効させてください。
* 脆弱性は、公開の issue ではなく、security@qore.network に非公開で報告してください。

## 公開場所 {#where-published}

| レジストリ | パッケージ | バージョン | 実行 | 備考 |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`。stdio と Streamable HTTP。Node.js 20 以降 |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` または `uvx qorechain-mcp` | stdio のみ。Python 3.10 以降 |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | `qore` コマンド。[QoreChain CLI](/developer-tools/qore-cli) を参照 |

ソース: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp)（公開、Apache-2.0、2026年10月27日に確認）。このリポジトリには、サーバー、CLI、Python パッケージ、ツールリファレンス、セルフホスティングの注意事項、クライアント設定の例、3 つのエージェントスキルファイルが含まれています。公開されたコンテナイメージはありません。`npx` または `pip` を使用してください。

## 制限と既知の問題 {#limits}

- **読み取り専用。** 署名のコードパス、鍵の保管、ブロードキャストはありません。`prepare_transfer` は未署名のドキュメントを返します。送金を完了するには、[QoreSign](/qoresign/overview) または QoreX ウォレットで署名して自分でブロードキャストし、その結果を `get_transaction` で読み取ります。`read_contract` は `eth_call` のみを使用し、状態を変更できません。
- **準備できるトランザクションは 1 種類。** `prepare_transfer` は、uqor のネイティブレーンの `MsgSend` を作成します。EVM、SVM、ステーキング、ガバナンス、コントラクトのトランザクションは作成しません。`estimate_fee` と `simulate_tx` は、エンコード済みのあらゆるネイティブレーンのトランザクションを受け付けます。
- **ガスの数値はネットワークではなくチェーンのバージョンに従います。** 両ネットワークとも v3.2.5 を適用済み（メインネットは2026年10月29日）のため、シミュレーションには ML-DSA-87 の検証コストが含まれ、ガスは正確です（`exact_gas_simulation` は両方で true です）。v3.2.5 より古いノードに対しては、推奨ガスリミットにマージンが加えられます。
- **テストネットの履歴は削除されます。** 古いテストネットのブロックは `NOT_FOUND` を返し、エラーには利用可能な最も低い高さが示されます（確認時点でテストネットは 8,790,799、メインネットは高さ 1 から提供）。`get_pq_status` はレイヤーを現在登録されている鍵に対して確認するため、鍵のローテーション後は、古いトランザクションは一致しなくなります。
- **EVM のポスト量子プリコンパイル。** `0x...0A01`（ML-DSA-87 検証）と `0x...0A02`（鍵ステータス）はテストネットでのみ有効です。メインネットでこれらを呼び出すと、空のデータが返されます。
- **制限。** 上流へのリクエストごとに、10 秒のタイムアウトと 4 MiB のレスポンス上限があり、リトライはありません。ブロックは最大 100 件のトランザクションハッシュ、トランザクションは最大 50 件のメッセージ、アカウントは最大 100 件の残高を一覧表示します。HTTP リクエスト本文は 512 KiB に制限されます。メモは最大 256 文字で、公開され永続的に残るため、秘密情報を入れないでください。セルフホストしたサーバーのレート制限はインスタンスごとで、メモリ内に保持されます。ロードバランサーの背後では、各インスタンスがそれぞれ別々にカウントします。
- **利用できないもの:** `get_token_holders`（公開エンドポイントにインデクサーがない）と `request_faucet`（サインインが必要なダッシュボードのファウセットを使用してください）。ホスト型エンドポイントには API キーが必要で、ダッシュボードから申請します。ローカル構成では不要です。
- **メインネットは明示的に指定します。** 呼び出しは、`"network": "mainnet"` を指定するか、サーバーを `--network mainnet` で起動しない限り、テストネットに送られます。
- **コンテナイメージは公開されていません。** サーバーは `npx` または `pip` で実行してください。
- **バージョン。** 0.1.0 は最初のリリースです。ツール名とスキーマは今後のバージョンで変更される可能性があり、リポジトリ内の生成された `spec/tools.json` が、インストールしたバージョンのリファレンスです。

## 関連ページ {#related}

* [QoreChain CLI](/developer-tools/qore-cli): 同じツール群をターミナルから。
* [QoreSign](/qoresign/overview): `get_pq_status` が使うハイブリッド検証器。
* [QoreChain SDK](/sdk/overview): このサーバーが読み取り、シミュレートするトランザクションを構築して署名します。
* [QoreX 連携](/developer-tools/qorex-integrations): `prepare_transfer` が準備したものに署名するウォレット。
* [カストディキット](/developer-tools/custody-kit): カストディアン向けの入金検出と出金検証。
* [ファウセット](/dashboard/faucet)と[ダッシュボードの Developers ページ](/dashboard/developers#mcp): テストネットの QOR と MCP API キー。
* [開発者パッケージの概要](/developer-tools/overview)。
