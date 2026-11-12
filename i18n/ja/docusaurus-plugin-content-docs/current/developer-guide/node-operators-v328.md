---
slug: /developer-guide/node-operators-v328
title: "ノード運用者向け: v3.2.8チェックリスト"
sidebar_label: ノード運用者向けv3.2.8
sidebar_position: 11
---

# ノード運用者向け: v3.2.8チェックリスト

リリース**v3.2.8**は、2026年11月12日(高さ9,929,500)からテストネット`qorechain-diana`で稼働しています。メインネット`qorechain-vladi`はv3.2.6のままで、v3.2.8の日程はまだ決まっていないため、このページの内容は現時点ではメインネットのノードには適用されません。

このページは、v3.2.8でノード運用者が確認・変更すべき事項の短いリストです。バンドルに含まれる共有ライブラリ、コントラクトランタイムの設定、`app.toml`の新しいデフォルト値、新しいREST経路1つ、そしてまだv3.2.7のノードをアップグレードする手順を扱います。ノードガイドの全体については、[ノードの運用](/developer-guide/running-a-node)を参照してください。

**なぜ重要か。** v3.2.8は、新しいコントラクトランタイムライブラリ上でスマートコントラクトを実行し、コントラクト呼び出しが使用するメモリとコードのロードに対して課金します。古いライブラリフォルダを使い続けるノードや、コントラクト用メモリが少なすぎる状態で動かすノードは、起動しないか、遅れをとります。チェックリストの残りは、小さな設定作業です。

## 1. `lib/`フォルダ全体をコピーする {#lib-folder}

リリースバンドルには、`qorechaind`と、4つの共有ライブラリを含む`lib/`フォルダが入っています。

| ライブラリ | 役割 |
| --- | --- |
| `libqorepqc.so` | ポスト量子署名の検証 |
| `libqoresvm.so` | SVMランタイム |
| `libwasmvm.x86_64.so` | アップストリームのコントラクトランタイムライブラリ |
| `libwasmvmqore_v1.x86_64.so` | v3.2.8で新規追加: QoreChainのコントラクトランタイムライブラリ |

個別のファイルではなく、**フォルダ全体**をコピーしてください。Dockerfileの`COPY lib/ ...`行や、ベアメタルホストでの`cp -r lib/* ...`は、後のリリースでライブラリが追加されても動き続けますが、ファイル名を列挙する方法では動きません。

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

ローダーが、コピー先のフォルダ(すでに使用している`LD_LIBRARY_PATH`または`ld.so.conf.d`のエントリ)を指すようにして、再起動してください。上記のコマンドは一例です。ご自身の環境のパスを使用してください。

## 2. コントラクトのメモリキャッシュ: 256 MiB以上 {#memory-cache}

コントラクトランタイムは、コンパイル済みのコントラクトをメモリに保持します。`app.toml`の`[wasm]`セクションにある`memory_cache_size`は、**256 MiB以上**でなければなりません。

```toml
[wasm]
memory_cache_size = 256
```

256未満の値は、ノードの起動時に256に引き上げられ、ノードは警告をログに出力します。小規模なマシンでは、追加のメモリを見込んでおいてください。

## 3. コントラクトのディレクトリは`<home>/wasm`になりました {#wasm-directory}

コンパイル済みのコントラクトコードは、`<home>/wasm`に置かれるようになりました。`<home>`は、ノードを起動するときのディレクトリ(`--home`)です。コントラクトコードが古い場所にあるノードは、引き続きそれを使用し、警告をログに出力します。都合のよいときにフォルダを移動できます。その際は、先にノードを停止してください。

## 4. `app.toml`の新しいデフォルト値 {#app-toml-defaults}

v3.2.8で初期化したノードは、これらのデフォルト値を書き込みます。既存の`app.toml`は**書き換えられない**ため、アップグレードしたノードは、変更するまで古い値のままです。

| 設定 | 新しいデフォルト | 内容 |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | このノードでシミュレーションされるトランザクションのガス上限。ウォレットとSDKは送信前にシミュレーションを行い、高い上限により大きなコントラクト呼び出しもシミュレーションできます |
| JSON-RPCの`api`名前空間 | `eth,net,web3` | `txpool`名前空間は、ノードの保留中トランザクションを公開してしまうため、デフォルトでは提供されません。必要な場合にのみ、ご自身で`txpool`を追加してください |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. クエリのガス上限 {#query-gas-limit}

コントラクトのクエリは、`app.toml`の`[wasm]`セクションで制御されるノードローカルのガス上限の下で実行されます。チェーンチームは、バリデーターではこれを`0`(上限なし)に設定することを推奨しています。

```toml
[wasm]
query_gas_limit = 0
```

この設定が変えるのは、ご自身のノードがコントラクトのクエリに対して返す内容だけです。ブロックに含まれなければならない内容は変わりません。これはバリデーター向けのチェーンチームの推奨であり、公開クエリを提供するノードでは、有限の上限のほうが適している場合があります。

## 6. 新しい経路: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8は、SVMモジュールのパラメーターを読み取る専用の経路を追加します。v3.2.8のノード(テストネット)で提供され、リリースが適用されていないメインネットではHTTP `501`を返します。

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

2026年11月12日のテストネットからの応答:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| フィールド | 意味 |
| --- | --- |
| `enabled` | SVMトランザクションレーンが開いているかどうか。アップグレード以降、テストネットでは`false`であり、ガバナンスが再度開くまでSVMへの書き込みは拒否されます |
| `max_program_size`, `max_account_data_size` | バイト単位のサイズ上限(それぞれ10,485,760) |
| `compute_budget_max` | トランザクションが要求できる最大のコンピュートバジェット(1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | ストレージ価格の入力値 |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | スロット番号のオフセット、デフォルトの署名スキーム、プログラム間呼び出しの深さの上限 |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | SVMアカウントが保有できるネイティブQORの上限(uqor単位) |

SVMの送信ボタンを表示する前に`enabled`を読み取ってください。[SVM開発](/developer-guide/svm-development)を参照してください。経路`GET /qorechain/svm/v1/cluster_info`は別の経路で、クラスターのIDを返します。

## 7. マニフェストを確認する {#manifest}

マニフェストは、どのバイナリをインストールするかを示す唯一の情報源です。

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

2026年11月12日には、`version`が`3.2.8`、`minCompatible`が`3.2.8`、`upgradeType`が`height`、`upgradeHeight`が`9929500`、バイナリが`qorechaind-v3.2.8-b3-linux-amd64.tar.gz`と応答しました。`binary.url`を信頼する前に、`version`が`minCompatible`と等しいことを確認し、同じファイル内の`sha256`でアーカイブを検証してください。メインネットのマニフェストは`https://download.qore.host/mainnet/latest.json`にあり、メインネットのアップグレードが告知されるまでv3.2.6を示します。

## 8. まだv3.2.7のノードをアップグレードする {#upgrade-from-v327}

テストネットのアップグレード高さはすでに過ぎているため、まだv3.2.7のノードは、高さ9,929,500で`UPGRADE "v3.2.8" NEEDED`と表示して停止します。状態は保持されており、再同期は不要です。

1. マニフェストに記載されたアーカイブをダウンロードし、SHA-256を検証します。
2. ノードを停止します。
3. `qorechaind`を置き換え、`lib/`フォルダ全体をコピーします([ステップ1](#lib-folder))。
4. `[wasm] memory_cache_size`([ステップ2](#memory-cache))を確認し、`simulation_gas_limit`、JSON-RPCの名前空間、`query_gas_limit`について決定します([ステップ4と5](#app-toml-defaults))。
5. ノードを起動し、ログを監視します。コントラクトのディレクトリまたはメモリキャッシュについての警告は、変更していなければ想定どおりです。
6. チェーンに追従していることを確認します。

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

テストネットに新しく参加するノードは、v3.2.8のバイナリから直接開始します。ステートシンクとピアについては[テストネットへの接続](/getting-started/connecting-to-testnet)を、アップグレードの履歴については[ノードの運用](/developer-guide/running-a-node#upgrades)を参照してください。

## 制限とエラー

| 表示される内容 | 意味 | 対処 |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED`が表示され、ノードが高さ9,929,500で停止する | ノードがまだv3.2.7のバイナリである | セクション8 |
| 共有ライブラリが見つからないという起動エラー | `lib/`が全体としてコピーされていないか、ローダーがそこを指していない | セクション1 |
| `memory_cache_size`が引き上げられたという警告 | 設定値が256 MiB未満である | 256以上に設定する |
| コントラクトのディレクトリについての警告 | コントラクトコードがまだ古い場所にある | 都合のよいときに`<home>/wasm`へ移動する |
| `/qorechain/svm/v1/params`からの`501` | ノードがv3.2.8ではない(現時点のメインネット) | メインネットでは想定どおり |

## 関連ページ

* [ノードの運用](/developer-guide/running-a-node)、および[v3.2.8のコントラクトランタイム](/developer-guide/running-a-node#v328-node)
* [バリデーターの運用](/developer-guide/running-a-validator)
* [テストネットへの接続](/getting-started/connecting-to-testnet)
* [RESTおよびgRPCエンドポイント](/api-reference/rest-grpc-endpoints)
