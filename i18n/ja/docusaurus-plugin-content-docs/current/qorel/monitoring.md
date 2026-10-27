---
slug: /qorel/monitoring
title: QORel のモニタリング
sidebar_label: モニタリング
sidebar_position: 7
---

# モニタリング

リレイヤーが静かに止まると、パケットが保留されたままになるため、監視が必要です。このページでは、QORel が提供するもの（Prometheus テレメトリ、オプションの REST エンドポイント、ログ、コマンド）と、アラートを設定すべき項目を一覧にします。重要なチャネルのリレイヤーを運用するオペレーター向けです。

## 特長 {#innovations}

- **スクリプトで確認できるポスト量子鍵のチェック。** `qorel keys pqc-status` は JSON オブジェクトを出力し、その `ready_to_relay` フィールドは、鍵がチェーンに登録され、ローカルの鍵と一致している場合にのみ `true` になります。このフィールドにアラートを設定しておけば、リレイヤーが拒否される前に、鍵の欠落や変更を検知できます。
- **リレーを黙って止めない失敗処理。** リレーまたはクリアリングの試行が失敗しても、パケットワーカーは動き続け、クリアインターバルごとに再試行します。そのため、短時間のレート制限は、チャネルの停止ではなく、ログ内の警告として現れます。
- **理由を示す送信前チェック。** 送信前チェックがトランザクションを拒否した場合（鍵が未登録、鍵の不一致、sign-bytes バージョン不明）、何も送信されず、その理由がログに記録され、`qorel health-check` に表示されます。

## 使い方 {#how-to-use}

### テレメトリ {#telemetry}

設定で有効にします。

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

メトリクスは Prometheus 形式で `http://127.0.0.1:3001/metrics` に公開されます。これらは Hermes のメトリクスで、Prometheus ではカウンターに `_total` サフィックスが付いて表示されます。グラフ化する価値のある項目は次のとおりです。

| メトリクス | 理由 |
|---|---|
| `workers` | タイプ別の実行中ワーカー数。減少した場合、ワーカーが停止したことを意味します。 |
| `backlog_size`、`backlog_oldest_sequence` | チャネルで待機中のパケットと、まだ待機中の最も古いシーケンス。 |
| `wallet_balance` | 各チェーンでのリレイヤーの残高。 |
| `receive_packets_confirmed`、`acknowledgment_packets_confirmed`、`timeout_packets_confirmed` | リレーされたパケット。バックログが増えているのに横ばいなら、停滞しています。 |
| `client_updates_submitted`、`client_misbehaviours_submitted` | ライトクライアントの維持と、不正行為の報告。 |
| `broadcast_errors`、`simulate_errors` | 拒否された、またはシミュレーションに失敗したトランザクション。 |
| `ws_reconnect` | WebSocket の再接続。連続して多い場合は、エンドポイントが不安定であることを示します。 |
| `tx_latency_submitted`、`tx_latency_confirmed` | トランザクションにかかる時間。 |

Hermes は、全メトリクスを[テレメトリガイド](https://hermes.informal.systems/documentation/telemetry/operators.html)に記載しています。サンプル設定ではリスナーは `127.0.0.1` にあります。Prometheus のスクレイパーを同じホストに置くか、意図的に `host` を変更してください。

### アラートを設定する項目 {#alerts}

| 項目 | 確認先 |
|---|---|
| プロセスが稼働中 | テレメトリエンドポイントが応答する |
| チャネル上の保留中のパケットと acknowledgement | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| 各チェーンでのリレイヤーの残高 | `qorel keys balance --chain <id>`、または `wallet_balance` |
| ポスト量子鍵の状態 | `qorel keys pqc-status` が `ready_to_relay: true` を報告する |
| クライアントの鮮度 | QORel はクライアントを信頼期間の 3 分の 1 で更新します。クライアントが信頼期間の約半分の間更新されていない場合にアラート |
| エラー | `broadcast_errors` と `simulate_errors` の増加 |

cron や監視エージェントに適した、鍵の状態を確認する簡単なチェック:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

鍵の準備ができていない場合は、ゼロ以外の終了コードで終了します。

### ログ {#logs}

`[global]` の `log_level = 'info'` がデフォルトです。systemd パッケージでは、ログはジャーナルに出力されます。

```bash
journalctl -u qorel -f
```

QORel がチェーンから sign-bytes バージョンを読み取り、それが変わったときに、`post-quantum sign bytes` で始まるログ行が出力されます。エンドポイントからの `429` 応答に関する警告は、そのエンドポイントがレート制限をかけていることを意味します。QORel は再試行します。

### REST エンドポイント {#rest}

オプションの REST サーバー（設定の `[rest]`、サンプルではポート 3000、デフォルトでは無効）は、確認用にリレイヤーの状態を公開します。`127.0.0.1` にバインドしたままにしてください。

### 手動でのチェック {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## アクセス方法 {#how-to-access}

- テレメトリと REST はリレイヤーのホスト上に限定されます。自分で公開しない限り、どちらも公開ネットワークには出ません。
- `qorel` コマンドは、リレイヤーと同じ設定ファイルを読み込みます。
- QoreChain テストネットの公開 REST エンドポイント（`https://api-testnet.qore.host`）では、チャネルとトークントレースの状態を確認できます。[テストネットへの接続](/getting-started/connecting-to-testnet)を参照してください。

## 公開場所 {#where-published}

モニタリングは `qorel` バイナリの一部であり、別途インストールするものはありません。ソースと Hermes のテレメトリガイド: [qorechain/QORel](https://github.com/qorechain/QORel)、[hermes.informal.systems](https://hermes.informal.systems)。

## 制限と既知の問題 {#limits}

- **ホスト型ダッシュボードはありません。** QORel はダッシュボードやアラートルールを提供しません。上記のメトリクスから構築してください。
- **メトリクス名は Hermes のものです。** QORel 0.1.0 はポスト量子関連のメトリクスを追加しません。その状態には `keys pqc-status` を使用してください。
- **公開エンドポイントでのレート制限は通常のことです。** 単発の `429` 警告ではなく、バックログが続く場合にアラートを設定してください。
- **テストネットのみ。** ここにあるものは、メインネットのチャネルに対して実行されたことはありません。
