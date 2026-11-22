---
slug: /developer-guide/governance-proposals-contracts
title: "コントラクト向けガバナンス提案: Nativeコードのアップロードとクロス VM アクセスの開放 (テストネット)"
sidebar_label: コントラクト提案
sidebar_position: 12
---

# コントラクト向けガバナンス提案: Nativeコードのアップロードとクロス VM アクセスの開放 (テストネット)

QoreChain テストネット `qorechain-diana` では、通常のトランザクションで QoreChain Native (CosmWasm) コントラクトをアップロードすることはできず、ガバナンスが認めるまで、EVM コントラクトがブリッジ経由で Native コントラクトを呼び出すこともできません。どちらも**ガバナンス提案**を通します。提案は、コンパイル済みコードを保存し、必要に応じてコントラクトを作成し、アップロードした**まさにそのコードに固定 (ピン留め)** した状態でクロス VM の許可リストに追加します。このページでは、ビルダーがそのような提案を準備し、提出し、経過を見て、検証する方法と、承認されたコントラクトを Solidity から呼び出す方法を説明します。

このページは、**2026 年 11 月 22 日**にライブのテストネット (チェーン `qorechain-diana`、チェーン v3.2.9 は 11 月 20 日から稼働) で確認されました。オンチェーンの例は実際の提案です。40 (`qday-receipts` コントラクト、コード 865)、23、27、34 (保存されたコード)、19 と 20 (インスタンス化のルール)、32 (許可リスト) です。`qorechaind` のコマンドラインは、既存の CLI リファレンスとオンチェーンの提案 JSON から書かれたもので、このページのためにバイナリ自体は実行していません。フラグが異なる場合は、お使いのマシンで `qorechaind tx gov submit-proposal --help` を一度実行してください。

:::note テストネットのみ
これらの手順はテストネットの説明です。メインネットにはオープンなクロス VM ブリッジがなく、そこでのコードのアップロードもガバナンスのみです。テスト QOR に価値はありません。テストアカウントのみを使用してください。
:::

## なぜガバナンスを通すのか {#why}

* **アカウントからのアップロードは閉じられています。** `code_upload_access` は `Nobody` で、`MsgStoreCode` はサーキットブレーカーのリストに入っています。ガバナンス提案はブレーカーを開き、ガバナンスアカウントとしてコードを保存し、同じ提案の中で再び閉じます。そのため、投票の合間にドアが開いたままになることはありません。
* **インスタンス化は開放されています。** `instantiate_default_permission` は提案 19 以降 `Everybody` なので、ガバナンスがコードを保存すれば、保存されたコードがより厳しい権限を持たない限り、誰でも (あなたも) そこからコントラクトを作成できます。
* **ブリッジが到達できるのは承認済みのコントラクトだけです。** `0x0901` ブリッジが呼び出せるのは、`bridge_allowed_targets` にあるターゲットだけです。各ターゲットは、コード ID とそのコード履歴の長さに固定されるため、コントラクトを別のコードにマイグレーションして承認を維持することはできません。
* **アトミックです。** 提案のメッセージはまとめて実行されます。1 つが失敗した場合 (たとえばチェーンが拒否するコード)、どれも適用されず、ブレーカーも開いたままにはなりません。

## 必要なもの {#needs}

| 項目 | 入手方法 |
| --- | --- |
| `qorechaind` バイナリ (Linux) | [download.qore.host](https://download.qore.host) のリリース。公開ソースツリーからのバイナリでは、チェーンが要求するハイブリッド署名を行えません。 |
| ポスト量子鍵を登録したテストネットアカウント | [ハイブリッド署名](/cli-reference/transaction-commands#hybrid-signing)を参照してください。 |
| デポジットと手数料用のテスト QOR | テストネットのファウセット。通常の提案には 10 QOR、迅速な提案には 50 QOR が必要です (下の表)。 |
| ほかの人と同じ方法でコントラクトをビルドするための Docker | [Docker](https://docs.docker.com/get-docker/)。 |

## ステップ 1: コントラクトをビルドし、チェックサムを控える {#build}

誰でもあなたのソースを再ビルドして同じバイト列を得られるように、CosmWasm オプティマイザでビルドします。Workshop 3 のコントラクトは、Apple Silicon 上で arm64 イメージを使ってビルドされました (x86 のマシンでは通常の `optimizer` イメージを使います。両者でチェックサムが異なるため、提案の概要にどちらを使ったかを書いてください)。

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

コントラクトごとに 1 行、64 文字の 16 進チェックサムとファイル名が表示されます。たとえば `6ebfc32f...5c43c  qday_receipts.wasm` です。このチェックサムは**非圧縮 wasm ファイルの SHA-256** であり、チェーンがあなたのコードについて示す `data_hash` です。控えておいてください。投票者が確認できるように、提案の概要に入れます。

デポジットを使う前に、[ガスとアップロードの制限](/developer-guide/cosmwasm-development#gas-and-limits)の制限に照らしてコードを確認してください。関数は最大 4,096 個、コンパイル後は最大 32 MiB、浮動小数点命令は不可です。

## ステップ 2: 提案用にコードをエンコードする {#encode}

提案は、wasm を base64 として JSON の中に載せます。先に圧縮してください (チェーンは gzip を受け付け、提案 40 もこれを使いました。そのコードは `H4sI` で始まります)。

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

バイト単位のサイズが表示されます。`qday-receipts` のコードは、gzip を base64 にして約 99,000 文字です。コマンドに貼り付けるには長すぎるので、ファイルに保存しておいてください。

## ステップ 3: 提案を書く {#write}

提案は、`messages`、`metadata`、`deposit`、`title`、`summary`、`expedited` を持つ JSON ファイルです。以下のすべてのメッセージの `authority` と `sender` は**ガバナンスモジュールアカウント**です。このページからコピーせず、読み取ってください。

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

`"name":"gov"` のアカウントが表示され、その `address` は `qor1` で始まります。以下ではこれを `<GOV_ADDRESS>` と呼びます。2026 年 11 月 22 日には `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3` でした。

### 提案 A: コードを保存し、コントラクトを作成する {#proposal-a}

これは、許可リストのメッセージを除いた提案 40 の形です。順序が重要です。ブレーカーを開き、保存し、ブレーカーを閉じ、それからインスタンス化します。

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

プレースホルダーの埋め方:

| プレースホルダー | 入手方法 |
| --- | --- |
| `<NEXT_CODE_ID>` | 最後のコード ID に 1 を足した値。最後のものは `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"` で読み取ります。2026 年 11 月 22 日には最後が 865 だったので、次は 866 でした。他の人の提案が先にコードを保存すると、あなたのコードにはあとの ID が付き、インスタンス化メッセージが失敗して提案全体が取り消されます (失われるのは待ち時間だけです)。 |
| `<BASE64_SALT>` | 短い任意のテキストを base64 エンコードしたもの: `printf 'my-contract-v1' \| base64`。これでコントラクトのアドレスを予測できるようになります。提案 40 ではソルト `qday-receipts-w3` を使いました。 |
| `msg` | コントラクトの `instantiate` が期待する JSON。フィールドのないコントラクトなら `{}`。 |
| `admin` | 空文字列は管理者なしを意味し、誰もコントラクトをマイグレーションできません。ブリッジが呼び出すコントラクトにはこれを推奨します ([ピン](#pins)を参照)。 |
| `instantiate_permission` | `Everybody`、またはインスタンス化できる人を制限する `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` (提案 34 はテスト用コントラクトにこれを使いました)。 |

提案の中でインスタンス化する必要はありません。最後のメッセージを外せばコードの保存のみとなり、あとで通常のトランザクション (`tx wasm instantiate`、[コントラクトのライフサイクル](/developer-guide/cosmwasm-development)を参照) でインスタンス化できます。提案 23 と 27 は、この方法でコードを保存しました。

### 提案 B: コントラクトをクロス VM の許可リストに載せる {#proposal-b}

提案 A が可決された後、コントラクトのアドレスを調べ、ライブのクロス VM パラメータを読み取ります。

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

あなたの `qor1...` のコントラクトアドレス、**1 件**のエントリ (`INIT`、あなたのコード ID) を持つ履歴、そしてパラメータセットが表示されます。クロス VM モジュールの `MsgUpdateParams` は**パラメータセット全体を置き換える**ので、ライブの回答からすべてのフィールドをコピーし、変更するのは 2 点だけにします。`bridge_allowed_targets` にあなたのターゲットを追加し、`bridge_target_pins` にそのピンを追加します。

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

上の数値は 2026 年 11 月 22 日に読み取った値です。これらではなく、ライブで読み取った値を使ってください。提案 40 は `wasm_congestion_factor_micro` を省略しましたが、これはライブの回答にも表示されるフィールドです。ライブの回答と提案 40 のテンプレートに従い、投票後に結果を[クロス VM リファレンス](/developer-guide/cross-vm-reference#params)の表と比較してください。

### ピン: `code_id` と `history_len` の意味 {#pins}

| フィールド | 意味 |
| --- | --- |
| `target` | `cosmwasm:` に続けてコントラクトのアドレス。`bridge_allowed_targets` とまったく同じ書き方にします。 |
| `code_id` | ブリッジがコントラクトを呼び出すために、コントラクトが実行していなければならないコード。 |
| `history_len` | ピン留めするときにコントラクトのコード履歴が持つエントリ数。新しいインスタンスは 1 です。1 回マイグレーションされたコントラクトは 2 です (テストネットの許可リストにはそのようなコントラクトが 1 つあります)。以後のマイグレーションは長さを変えるため、ピンが一致しなくなり、ブリッジは呼び出しを拒否します。 |

ガバナンス以外の管理者を持つ許可リスト入りのコントラクトは、その管理者がマイグレーションできてしまうため、ピン留めが必須です。最も単純で安全な設計は、提案 40 が行ったものです。管理者なしで、ピンを付けます。

### 1 つの提案で両方を行う {#one-proposal}

提案 40 は、すべてを 1 つの提案で行いました。コードを保存し、ソルトでインスタンス化し、そのソルトが生み出すアドレスをピン留めしました。これには、次のコード ID と将来のコントラクトアドレスを事前に知っておく必要があるため、間違えやすくなります。提案を 2 つに分けると投票が 1 回と数時間増えますが、アドレスをすでに導出している場合を除き、そちらをお勧めします。

## ステップ 4: デポジット、投票期間、しきい値 {#params}

提出する前に、ライブのルールを読み取ってください。

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| ルール | 通常の提案 | 迅速な提案 (`"expedited": true`) |
| --- | --- | --- |
| 最小デポジット | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| デポジット期間 (最小額に達するまで) | 172,800 秒 (2 日) | 172,800 秒 (2 日) |
| 投票期間 | 14,400 秒 (4 時間) | 3,600 秒 (1 時間) |
| 定足数 | ボンディングされたステークの 33.4% | ボンディングされたステークの 33.4% |
| 賛成のしきい値 | 投じられた票の 50% | 投じられた票の 66.7% |
| 拒否権のしきい値 | 33.4% | 33.4% |
| 最小の初期デポジット | なし | なし |

2026 年 11 月 22 日に読み取りました。同じ回答から、ほかにもわかることがあります。「拒否権付きの反対」がしきい値を超えるとデポジットはバーンされ (`burn_vote_veto` は `true`)、定足数に満たなかった提案ではバーンされず、集計に失敗した迅速な提案は、すでに投じられた票を引き継いで通常の提案として続行されます。テストネットチームがこれまでにコントラクトのために提出した提案は、すべて迅速な提案でした。ビルダーの提案は通常のままにするのが基本です (10 QOR のデポジットと 4 時間の投票のほうが、計画を立てやすくなります)。

## ステップ 5: 提出する {#submit}

Cosmos レーンのすべてのトランザクションはハイブリッド署名を持たなければならないため、まずトランザクションを構築し、次にポスト量子鍵で署名します。提案は大きい (コードが中に入っている) ので、ガスに余裕を持たせてください。手数料の下限はガス 1 単位あたり 0.1 uqor で、トランザクションの 1 バイトのコストは 10 ガスです。

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

`--gas` と `--fees` はドライランで決めます。まず `tx pqc cosign` を `--dry-run` 付きで実行し（ガスの見積もりを表示し、何も送信しません）、見積もりに30%を足した値を `<GAS>`、`<GAS>` に 0.1 uqor を掛けた額以上を `<FEES>` として使います。単純な送金はおよそ30万から40万ガス、デプロイやコードを含む提案ははるかに多く必要です。

`--generate-only` は未署名のトランザクションを書き出します。`tx pqc cosign` は両方の署名を追加してブロードキャストします。背景は[ハイブリッド署名](/cli-reference/transaction-commands#hybrid-signing)と [gov コマンド](/cli-reference/transaction-commands#submit-proposal)にあります。トランザクションハッシュとコード 0 が表示されます。ガス不足のエラーが出た場合は、`--gas` と、それに合わせた `--fees` を引き上げてください (手数料は少なくともガスの 0.1 uqor 倍が必要です)。

提案 ID を調べます。これはトランザクションのイベントにある番号でもあります。

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

あなたのタイトルと、`PROPOSAL_STATUS_VOTING_PERIOD` のステータスが表示されます (添付したデポジットが最小額に達したため)。デポジットが少ない場合のステータスは `PROPOSAL_STATUS_DEPOSIT_PERIOD` で、誰でも追加できます。

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## ステップ 6: 投票する {#vote}

ステークを持つ人は誰でも、保有するステークで投票できます。ビルダー 1 人のウォレットでは定足数 33.4% に届かないため、テストネットのバリデーターとデリゲーターにあなたの提案を知らせ (彼らが読むのは提案の概要です)、投票を依頼してください。投票は、ほかと同じようにハイブリッド署名されたトランザクションです。

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

選択肢は `yes`、`no`、`abstain`、`no_with_veto` です ([ガバナンス](/user-guide/governance)を参照)。集計と時間を確認します。

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

投票が終わると、ステータスは `PROPOSAL_STATUS_PASSED` (メッセージが実行された)、`PROPOSAL_STATUS_REJECTED`、または `PROPOSAL_STATUS_FAILED` になります。**Failed** は、投票は可決されたもののメッセージが実行できなかったことを意味し、その場合どのメッセージも適用されません。理由は `failed_reason` に示されます。たとえば提案 40 は、提出の 1 時間後に `PASSED` と表示されました。

## ステップ 7: オンチェーンのコードを検証する {#verify}

チェーンが保持しているコードを、ビルドしたチェックサムと比較します。チェーンは `data_hash` を大文字で報告し、`sha256sum` は小文字で出力します。

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

2 行とも同じ 64 文字が表示されます。より強力な確認として、チェーンが実際に保持しているバイト列をハッシュします。

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

コード 865 では `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` と出力され、Workshop 3 のソースをオプティマイザでビルドしたチェックサムと同じでした。次に、コントラクトと、提案 B の後は許可リストを確認します。

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

1 つ目の回答では `code_id` があなたのもので `admin` が空であること、2 つ目の回答ではあなたの `cosmwasm:qor1...` のターゲットと、そのピン (`code_id`、`history_len` が `"1"`) が表示されます。2026 年 11 月 22 日には、リストに 4 つのターゲットがあり、4 番目は `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8` の `qday-receipts` で、コード 865 に固定されていました。

## ステップ 8: EVM コントラクトから呼び出す {#call}

EVM は `0x0000000000000000000000000000000000000901` のブリッジを `executeCrossVMCall(uint8,string,bytes)` で呼び出します。ターゲット VM は `1` (Native)、文字列としてコントラクトのアドレス、バイト列として JSON メッセージを渡します。Native 側からは、呼び出した EVM コントラクト自身の `qor1...` アカウントが送信者に見え、どちらかの側での revert は両方を取り消します。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

2 つの条件があり、どちらも[クロス VM リファレンス](/developer-guide/cross-vm-reference#evm-to-wasm)で説明されています。ターゲットが許可リストにあること (かつ、ピン留めされたコードをまだ実行していること)、そしてトランザクションを送るアカウントが、`allowed_targets` に `0x...0901` を含む開いた [EVM 認可ウィンドウ](/developer-guide/evm-window-reference)を持っていることです。Solidity のショップと `qday-receipts` コントラクトを使った、テスト済みの完全な例については、[Workshop 3](/build-before-qday/workshop-3#part-2) に従ってください。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | 考えられる原因と対処 |
| --- | --- |
| `tx wasm store` が失敗する、または反映されない | 想定どおりです。テストネットではアカウントはアップロードできず、サーキットブレーカーと `code_upload_access` の両方がこれを阻止します。提案を使ってください。 |
| 提案のステータスが `PROPOSAL_STATUS_FAILED` | 投票は可決されたもののメッセージが失敗したため、何も適用されていません。`GET /cosmos/gov/v1/proposals/<id>` の `failed_reason` を読んでください。インスタンス化メッセージの `code_id` の誤りがよくある原因です。 |
| `PROPOSAL_STATUS_REJECTED` | 賛成票が足りないか、定足数に届いていません。より明確な概要で再提出するか、バリデーターに投票を依頼してください。 |
| ステータスが `PROPOSAL_STATUS_DEPOSIT_PERIOD` のまま | デポジットの合計が最小額 (通常 10 QOR、迅速 50 QOR) を下回っています。2 日以内に `tx gov deposit` で追加してください。 |
| 提出が `pqc` 空間のコード 20 で失敗する | トランザクションにハイブリッド署名がありませんでした。`--generate-only` と `tx pqc cosign` を使ってください。 |
| 提出がガス不足で失敗する | 提案が大きいためです。`--gas` を引き上げ、手数料は少なくともガスの 0.1 uqor 倍に保ってください。 |
| チェックサムが `data_hash` と異なる | 異なるマシンタイプまたはオプティマイザのバージョンでビルドしました。提案の概要に書かれたイメージで再ビルドしてください (arm64 と x86 のイメージではバイト列が異なります)。 |
| EVM 呼び出しが `cross-VM bridge call refused: target ... is not allowlisted` で revert する | コントラクトが `bridge_allowed_targets` にないか、ピン留めされた後でコードが変わりました。ライブのパラメータとあなたのピンを比較してください。 |
| EVM 呼び出しがブリッジに届く前に拒否される | `0x0901` を含む開いた EVM ウィンドウがありません。先に開いてください。 |
| `MsgCrossVMCall` が拒否される | 呼び出しがサーキットブレーカーのリストで一時停止されている可能性があります。`GET /cosmos/circuit/v1/disable_list` を読んでください。 |
| 提案 B が失敗する | パラメータセットが不完全か、ピンが間違っています。ライブの回答のすべてのフィールドがそろっていること、そして `history_len` が履歴のエントリ数と等しいことを確認してください。 |

## 関連ページ {#related}

* 投票、デポジット、提案タイプについては[ガバナンス](/user-guide/governance)。
* コントラクトのライフサイクルとクエリについては [QoreChain Native 開発](/developer-guide/cosmwasm-development)。
* `gov` と `pqc cosign` の正確なフラグについては[トランザクションコマンド](/cli-reference/transaction-commands#submit-proposal)。
* パラメータ、キュー、呼び出しの例については[クロス VM リファレンス](/developer-guide/cross-vm-reference)。
* クロス VM の実践例については [Workshop 3](/build-before-qday/workshop-3)。
