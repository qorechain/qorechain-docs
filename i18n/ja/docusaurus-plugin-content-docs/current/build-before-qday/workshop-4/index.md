---
slug: /build-before-qday/workshop-4
title: "ワークショップ4: ロールアップ、IBC、開発者向け QoreX"
sidebar_label: "ワークショップ4"
sidebar_position: 5
date: 2026-11-27
---

# ワークショップ4: ロールアップ、IBC、開発者向け QoreX

ワークショップ4では、アプリケーションより下の層に進みます。1つ目に、QoreChain に決済する<strong>ロールアップ</strong>を動かします。作成し、そこから出金し、それが何をしたかを証明してから、わざと不正をして、不正が見つかる様子を確認します。2つ目に、IBC で <strong>QOR を Cosmos Hub テストネットに送り、戻します</strong>。3つ目に、dApp を開発するときに <strong>QoreX ウォレット</strong>が何を提供してくれるかを確認します。

以下のすべてのコマンドについて、何をするのか、何が表示されるはずなのかを説明します。コードは公開されています: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) の `workshop-4` フォルダーです。ここで行うことはすべて、テストネット上でのみ動作します。テストトークンに価値はありません。

<strong>所要時間:</strong> ステップの作業は約45分です。さらにロールアップには1時間のチャレンジウィンドウがあり、その間は待ちます。3つのパートは独立しているので、パート1で待っている間にパート2やパート3を進められます。

## 作るもの {#what-we-built}

| パート | アプリ | 示すこと |
| --- | --- | --- |
| 1 | <strong>ロールアップ</strong>（Node.js、`@qorechain/rdk`） | アンカーが ML-DSA-87 で署名されたバッチ、Merkle 証明で支払われる出金、誰でも確認できる決済レシート、ウォッチタワーが証明する不正、そしてスラッシュされるボンド。 |
| 2 | <strong>IBC の往復</strong>（Node.js、`@qorechain/qoresign`、cosmjs） | QOR が Cosmos Hub テストネットに行って戻ります。運ぶのは QoreChain のリレイヤー QORel です。 |
| 3 | <strong>開発者向け QoreX</strong>（ガイドのみ、新しいコードはなし） | dApp がやり取りするプロバイダー、連携用パッケージ、開発者モード、リクエストログ、トランザクションインスペクター。 |

これらの背後にある革新的な点:

- <strong>決済がポスト量子で署名されるロールアップ。</strong> 作成者は、正直な各バッチのステートルートに ML-DSA-87（NIST FIPS 204）で署名し、チェーンがそれを保存します。
- <strong>チェーン自身が検証する不正証明。</strong> `qledger-v1` 台帳を使うと、QoreChain は異議を申し立てられたバッチを再実行します。どちらが正しかったかを判断するために、誰かを信頼する必要はありません。
- <strong>順序は QoreChain から。</strong> based シーケンシングでは、ロールアップのトランザクションは QoreChain 上のインボックスに投稿されるため、オペレーターは順序を入れ替えたり、投稿されたものを除外したりできません。
- <strong>QoreChain 側がハイブリッド署名の IBC。</strong> QoreChain から出る送金は、secp256k1 と ML-DSA-87 の両方で署名されます。
- <strong>何をしたかを見せるウォレット。</strong> QoreX は各サイトが何を要求したかを記録し、チェーンに保存された内容を調べられるようにします。

## このガイドで使う用語 {#words}

| 用語 | やさしい意味 |
| --- | --- |
| ロールアップ | 独自のトランザクションをメインチェーンの外で実行し、ときどき短い要約をメインチェーンに送る仕組み |
| バッチ | その要約の1つ。ロールアップの新しい状態と、要求する出金が含まれます |
| ステートルート | ロールアップ内のすべての残高を表す短い指紋 |
| オプティミスティックロールアップ | バッチはすぐに受け付けられ、チャレンジウィンドウの間に誰も誤りを証明しなければ確定します |
| チャレンジウィンドウ | 誰でもバッチの誤りを証明できる期間。テストネットでは1時間です |
| ボンド | オペレーターがロックし、嘘をつくと失うお金 |
| ウォッチタワー | ロールアップのトランザクションを再実行し、誤ったバッチを報告するアカウント |
| `qledger-v1` | チェーン自身が再実行できるシンプルな台帳。中のアカウントは ML-DSA-44 で署名します |
| based シーケンシング | ロールアップのトランザクションの順序は、オペレーターではなく QoreChain 上のインボックスで決まります |
| アンカー | バッチのステートルート。ロールアップの作成者が ML-DSA-87 で署名し、チェーン上に保存されます |
| Merkle 証明 | 全体を送らずに、ある項目がより大きな集合に含まれることを証明する数個のハッシュ |
| IBC | Cosmos 系チェーンがカストディアンなしでトークンを移動し合う方法。各チェーンが相手のライトクライアントを動かし、証明を検証します |
| チャネル | 2つのチェーンの間の通り道 |
| バウチャー | あなたの QOR が QoreChain 上にロックされている間、相手のチェーンが作るトークン |
| エスクロー | 送られた QOR が、バウチャーが戻るまで待つ QoreChain 上のアカウント |
| リレイヤー | 2つのチェーンの間でパケットと証明を運ぶプログラム |

:::caution 使い捨てのテストネットアカウントだけを使う
スクリプトが新しいアカウントを作ります。そのまま使ってください。本物のお金が入っているアカウントのシークレットワードや鍵を、ファイルやコマンドに入れることは決してしないでください。
:::

## 始める前に {#prerequisites}

ターミナル、<strong>Node.js 20 以降</strong>、<strong>Git</strong> が必要です。[始める前に](/build-before-qday/prerequisites)を参照してください。パート3には、さらに <strong>pnpm</strong> と QoreX ウォレットが必要です。Node.js を確認します。

```bash
node -v
```

`v20` 以上が表示されるはずです。サンプルコードを取得します。

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

1行目は、サンプルを `build-before-qday` という名前のフォルダーにダウンロードします。2行目は `workshop-4` フォルダーに移動します。

必要なテスト用 QOR の量はパートごとに異なります。

| パート | 必要なもの | 入手先 |
| --- | --- | --- |
| 1、オペレーターのアカウント | テスト用 QOR 約12,010: ロールアップのステーク 10,000、サイドチェーンの枠に 1,000、送信者のボンド 1,000、入金と手数料に少し | フォーセットで受け取れるのは1日 100 QOR で、足りません。[build.qorechain.io](https://build.qorechain.io) のチャンネルでフェストのチームに、より多いテストネットグラントを依頼してください |
| 1、ウォッチタワーのアカウント | 手数料用のテスト用 QOR を少し | [フォーセット](/dashboard/faucet) |
| 2 | テスト用 QOR 約2と、テスト用 ATOM を少し | [フォーセット](/dashboard/faucet)。ATOM はスクリプトが Cosmos Hub テストネットのフォーセットに要求します |
| 3 | QoreX のテストネットアカウントにテスト用 QOR を少し | [フォーセット](/dashboard/faucet) |

:::tip 大きなグラントがなくても、パート1は読み進められます
`node rollup.mjs rollups` にアカウントは不要で、以下のステップは各コマンドが何をするかを示しています。
:::

## パート1: QoreChain に決済するロールアップ {#part-1}

コード: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup)。パッケージ: `@qorechain/rdk`（Rollup Development Kit）。

小さなオプティミスティックロールアップの一生をひととおり体験します。作成する、ステークをロックする、オペレーターのボンドを積む、入金する、バッチを送信する、待つ、出金する、レシートを作る、不正をする、そして不正を捕まえます。仕組みは[ロールアップ](/rollups/overview)を参照してください。

### ステップ1: インストール {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| 部分 | 何をするか |
| --- | --- |
| `cd 01-rollup` | ロールアップアプリのフォルダーに移動します。 |
| `npm install` | アプリが使うパッケージをダウンロードします。バージョンは `package.json` と `package-lock.json` で固定されています。 |
| `node rollup.mjs help` | スクリプトを実行し、すべてのコマンドを一覧表示します。 |

<strong>表示されるはずのもの:</strong> コマンドの一覧: `init`、`rollups`、`prepare`、`status`、`withdraw`、`bond`、`receipt`、`cheat`、`watchtower`。

### ステップ2: テストネット上のロールアップを見る {#r2}

```bash
node rollup.mjs rollups
```

チェーンを読み取ります。アカウントは不要です。

<strong>表示されるはずのもの:</strong> 1行目に、ロールアップの数と、チェーンが現在要求するステークとボンド（このガイドの執筆時点では 10,000 QOR と 1,000 QOR）。続いてロールアップごとに1行で、id、有効かどうか、決済方式（`optimistic` または `zk`）、VM の種類、作成されたブロックが表示されます。

<strong>理由:</strong> あなたが支払う数字は、スクリプトではなくチェーンから来ることがわかります。

### ステップ3: アカウントを2つ作る {#r3}

```bash
node rollup.mjs init
```

<strong>オペレーター</strong>と<strong>ウォッチタワー</strong>の2つのアカウントを作ります。シークレットワードは `~/.config/qday-w4/operator.json` と `watcher.json` に、あなただけが読める形で保存され、画面に表示されることはありません。オペレーターのファイルには、Ana と Ben という2人のユーザーのロールアップ鍵のためのランダムなシードも2つ入っています。ファイルを別の場所に置きたい場合は、環境変数 `QDAY_DIR` を設定します。

<strong>表示されるはずのもの:</strong> 2つの `qor1...` アドレス。[始める前に](#prerequisites)のとおり、両方に資金を入れてください。

<strong>アカウントが2つ必要な理由:</strong> 誤ったバッチを報告する人は、それを公開した人であってはなりません。

### ステップ4: ロールアップを作成してバッチ 0 を送信する {#r4}

```bash
node rollup.mjs prepare
```

この1つのコマンドでセットアップ全体を実行します。済んだ内容は `~/.config/qday-w4/rollup-state.json` に記録されるので、途中で止まった場合はもう一度実行できます。

| 送るもの | 何をするか |
| --- | --- |
| `createRollup` | `qledger-v1` 実行と based シーケンシングのロールアップを作成し、ステークをロックします。 |
| `bondRollupSubmitter` | 1,000 QOR のボンドをロックします。 |
| 2件の入金 | Ana の 3 QOR と Ben の 1 QOR がロールアップに移ります。 |
| 3件のロールアップトランザクション | Ana が Ben に 0.5 QOR を支払い、Ana が 0.3 QOR を出金し、Ben が 0.2 QOR を出金します。それぞれ送信者の ML-DSA-44 鍵で署名され、QoreChain 上のインボックスに投稿されます。 |
| `submitBatch` | スクリプトがインボックスを読み戻し、再実行して新しいステートルートと出金ルートを求め、バッチ 0 を送ります。RDK がそのアンカーに ML-DSA-87 で署名します。 |

<strong>表示されるはずのもの:</strong> トランザクションごとに1行の `ok` と、ブロックとエクスプローラーのリンク。続いてあなたのロールアップの状態が表示され、バッチ 0 は `submitted` になっています。

### ステップ5: 1時間待ってから確認する {#r5}

```bash
node rollup.mjs status
```

<strong>表示されるはずのもの:</strong> ロールアップ、オペレーターのステーク、出金プール、ボンド、各バッチ。1時間のチャレンジウィンドウが過ぎると、バッチ 0 は `finalized` と表示されます。

<strong>待つ理由:</strong> オプティミスティックロールアップが安全なのは、お金が出ていく前にバッチの誤りを証明する時間があるからです。

### ステップ6: QoreChain に出金する {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

出金 `0` は Ana の 0.3 QOR、出金 `1` は Ben の 0.2 QOR です。このデモでは、どちらもオペレーターのアカウントに支払われます。スクリプトは、その出金がバッチ 0 の出金ルートに含まれることを示す Merkle 証明を作り、チェーンは支払う前に、保存したルートと照らして検証します。その後、スクリプトは同じ出金をもう一度送ります。

<strong>表示されるはずのもの:</strong> 証明に含まれるハッシュの数、`ok` の行、支払い前後の受取人の残高（同じアカウントが手数料を支払っています）、そして `REFUSED` と表示される2回目の試行。1つの出金が支払われるのは1回だけです。

バッチ 0 がまだ確定していない場合、コマンドは停止し、出金はチャレンジウィンドウの後にのみ支払われると表示します。

### ステップ7: 決済レシート {#r7}

```bash
node rollup.mjs receipt 0
```

バッチ 0 を説明する小さな JSON ファイルを作り、鍵の隣に保存します。誰でも確認できます。この確認はすべてを QoreChain から読み直し、ファイルを信用しません。

| チェック | 何を証明するか |
| --- | --- |
| `rollupLayerBinding` | ロールアップが、レシートに記されたレイヤーに属していること |
| `batchStateRoot` | チェーン上のバッチが、まさにこのステートルートを持っていること |
| `anchorOnChain` | レシートのすべてのフィールドを持つアンカーがチェーン上に存在すること |
| `creatorAuthority` | 署名鍵がレシートからではなく、チェーンから読み取られたこと |
| `pqcSignature` | アンカーに対する ML-DSA-87 署名が有効であること |
| `chainBinding` | レシートがこのチェーンのもので、別の場所からのコピーではないこと |

<strong>表示されるはずのもの:</strong> `VALID` と、6つのチェックそれぞれの横のチェックマーク。続いてスクリプトがステートルートの16進数を1桁変えて、もう一度確認します: `NOT VALID`。

<strong>役立つ理由:</strong> 取引所、監査人、別のシステムは、ファイルを送ってきた相手を信頼せずに、ロールアップの状態を検証できます。

### ステップ8: 不正なオペレーター {#r8}

```bash
node rollup.mjs cheat
```

Ben がロールアップ内で Ana に 0.1 QOR を支払い、その後オペレーターが、ステートルートの1ビットをわざと反転させたバッチ 1 を送信します。

<strong>表示されるはずのもの:</strong> 2行の `ok`。2行目には、バッチが<strong>誤ったステートルート</strong>で公開されたと表示されます。チェーンはいったんこれを受け付けます。誤りを証明する期間は1時間で、オペレーターのボンドがかかっています。

### ステップ9: ウォッチタワーが見つける {#r9}

```bash
node rollup.mjs watchtower
```

このコマンドは、オペレーターではなくウォッチタワーのアカウントを使います。

| ステップ | 起こること |
| --- | --- |
| 1 | チェーンからバッチ 1 を読み取ります。 |
| 2 | インボックスのうちバッチ 1 が使った部分を正確に読み取り、バッチ 0 の後の状態から再実行します。これで正直なルートが得られます。 |
| 3 | 不正証明を作り、あなたのコンピューター上で検証します。 |
| 4 | `challengeBatch` を送ります。チェーンは自分でバッチを再実行して却下し、ボンドをスラッシュします。半分はバーンされ、半分はウォッチタワーに渡ります。 |

<strong>表示されるはずのもの:</strong> 誤ったルートと正直なルート、ローカル確認の結果、チャレンジの `ok` の行、却下と表示されたバッチ、そして前後のウォッチタワーの残高。

:::note ほかの誰かのほうが早い場合があります
テストネットには、すでに独立したウォッチタワーがあります。そのいずれかが先に不正を証明すると（1ブロックで済むこともあります）、あなたのスクリプトはバッチがすでに却下されたと表示し、ローカル確認だけを実行します。どちらの場合も、オペレーターはボンドを失います。
:::

もう一度不正をするには、先にボンドを積み直します。

```bash
node rollup.mjs bond
```

### コードの構成 {#r-code}

すべては1つのファイル `rollup.mjs` にあります。各コマンドは `cmds` オブジェクト内の1つの関数で、上のステップの順に並んでいます。`connect()` 関数は、アカウントファイルを RDK のトランザクションクライアントに変換します。このクライアントは、QoreChain の各トランザクションに secp256k1 と ML-DSA-87 の両方の鍵で署名します。

## パート2: QOR を Cosmos Hub に送って戻す {#part-2}

コード: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc)。パッケージ: `@qorechain/qoresign` と cosmjs。ネットワーク: QoreChain テストネット `qorechain-diana` と Cosmos Hub テストネット `provider`。

このアプリは、0.5 QOR を QoreChain テストネットから Cosmos Hub テストネットに送り、戻します。2つのチェーンの間のパケットは、QoreChain のリレイヤー [QORel](https://github.com/qorechain/QORel) が運びます。このガイドの執筆時点で、QoreChain テストネットには10本の IBC チャネルがありました: Cosmos Hub、Osmosis、Injective、Akash、Celestia、Coreum、dYdX、Fetch、Allora、ixo。IBC が動くのはテストネットだけで、メインネットではまだ稼働していません。

仕組み:

1. 1つの鍵から2つのアドレスが得られます。QoreChain の `qor1...` と Hub の `cosmos1...` です。
2. <strong>行き:</strong> 送金は QoreChain 上で両方の鍵で署名され、チェーンは両方を検証します。QORel がパケットと証明を Hub に運びます。Hub 上の QoreChain のライトクライアントが証明を検証し、QOR のバウチャーを作ります。
3. <strong>帰り:</strong> Hub 上では、送金は Hub の通常の方法で署名されます。QoreChain 上の Hub のライトクライアントが証明を検証します。バウチャーはバーンされ、元の QOR が解放されます。

:::info 知っておきたい2つの制限
QoreChain の `channel-0` は、Hub の `channel-600` です。Hub 上のバウチャーの名前は、`ibc/` の後に `transfer/channel-600/uqor` の SHA-256 が続きます。テストネットの各 QOR チャネルでは、安全のためのブレーキとして、24時間に通過できるのは QOR 供給量の最大 1% です。
:::

### ステップ1: インストール {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

1行目は `01-rollup` から `02-ibc` に移動します。`workshop-4` フォルダーにいる場合は、`cd 02-ibc` を使います。

<strong>表示されるはずのもの:</strong> コマンドの一覧: `init`、`channels`、`status`、`register`、`hub-faucet`、`send`、`back`。

### ステップ2: 1つの鍵、2つのチェーン {#i2}

```bash
node ibc.mjs init
```

アカウントを作り、そのシークレットワードを `~/.config/qday-w4/traveler.json` に、あなただけが読める形で保存します。画面に表示されることはありません。フォルダーは `QDAY_DIR` で変更できます。

<strong>表示されるはずのもの:</strong> アカウントの QoreChain アドレスと Cosmos Hub アドレス。`qor1...` アドレスを[フォーセット](/dashboard/faucet)に貼り付けます。

### ステップ3: チャネルを一覧表示する {#i3}

```bash
node ibc.mjs channels
```

QoreChain テストネット上のすべての IBC チャネルと、その相手側のチェーンを読み取ります。アカウントは不要です。

<strong>表示されるはずのもの:</strong> チャネルごとに1行で、状態（`OPEN`）、相手チェーンの id、相手側でのチャネル名が表示されます。最後の行は、メインネットにはまだチャネルがないことを示します。

### ステップ4: ポスト量子鍵を登録して ATOM を入手する {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| コマンド | 何をするか |
| --- | --- |
| `register` | あなたの ML-DSA-87 公開鍵を一度だけチェーンに登録します。以後の QoreChain トランザクションは、この鍵で検証されます。 |
| `hub-faucet` | Cosmos Hub テストネットの公開フォーセットに ATOM を要求します。ATOM は帰りの手数料の支払いに使います。 |
| `status` | QoreChain 上の QOR、Hub 上のバウチャーと ATOM、鍵がチェーン上にあるかどうかを表示します。 |

<strong>表示されるはずのもの:</strong> `status` の後に、QOR の残高、`ML-DSA-87 key on chain: yes`、いくらかの ATOM。残高がまだゼロの場合は、1分待ってから `status` をもう一度実行してください。

### ステップ5: 行き {#i5}

```bash
node ibc.mjs send 0.5
```

`channel-0` のトークン送金メッセージ（`MsgTransfer`、ICS-20 標準）を組み立て、QoreSign を使って両方の鍵で署名してから、バウチャーが Hub に現れるまで待ちます。

<strong>表示されるはずのもの:</strong> 番号付きの3行: パケット番号、ブロック、エクスプローラーのリンクが付いた署名済みトランザクション。パケットを運ぶ QORel。そして、かかった秒数とともに、バウチャーの Hub への到着。片道は通常数秒です。あなたの場合の時間は異なることがあります。

### ステップ6: そして帰り {#i6}

```bash
node ibc.mjs back
```

すべてのバウチャーを `channel-600` で送り返します。Hub のトランザクションは、通常の cosmjs クライアントで、Hub の現在のガス価格を使って署名されます。その後、スクリプトは QOR が戻るのを待ちます。

<strong>表示されるはずのもの:</strong> Hub のトランザクション、続いて Hub 上でのバウチャーのバーンと、QoreChain 上で解放される通常の QOR。

### コードの構成 {#i-code}

すべては1つのファイル `ibc.mjs` にあります。`sendTx()` は、QoreSign を使って QoreChain のハイブリッドトランザクションを組み立てて署名します。`hubWallet()` は、同じシークレットワードを接頭辞 `cosmos` の Hub ウォレットに変換します。各コマンドは `cmds` オブジェクト内の1つの関数です。

## パート3: 開発者向け QoreX {#part-3}

ガイド: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode)。新しいコードはありません。ワークショップ1の [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) を使います。

以下のステップでは、Chrome または Firefox の <strong>QoreX 0.4.5 ブラウザ拡張機能</strong>を使います。Safari 拡張機能はそれより前のバージョンです。QoreX アプリ（1.2.5、iPhone と Android）にも開発者モードがあります。[開発者モード](/qorex/developer-mode)の説明のとおり、<strong>設定</strong>でオンにします。

### dApp がやり取りする相手 {#providers}

QoreX は、ウェブページに3つのプロバイダーを追加します。

| プロバイダー | 用途 | 標準 |
| --- | --- | --- |
| `window.ethereum` | EVM の dApp。QoreX は EIP-6963 でも自身を通知します | EIP-1193 |
| `window.qorex.native` | secp256k1 と ML-DSA-87 で署名する、QoreChain Native のトランザクション | QoreX API |
| `window.qorex.svm` | SVM レーン | QoreX API |

次の npm パッケージは、QoreX を一般的なツールにつなぎます。

| パッケージ | 用途 |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | RainbowKit で QoreX を使う（EVM） |
| `@qorechain/qorex-cosmos-kit`、`@qorechain/qorex-interchain-kit` | Cosmos Kit と Interchain Kit で QoreX を使う |
| `@qorechain/qorex-types` | `window.qorex` の TypeScript 型 |
| `@qorechain/qorex-wallet-mock`、`@qorechain/qorex-synpress` | 自動テストで dApp を QoreX に対してテストする |
| `@qorechain/sdk`、`@qorechain/wallet-adapter` | ハイブリッド署名のトランザクションを組み立てて送る |

詳しくは [dApp を QoreX と連携する](/qorex/dapp-integration)を参照してください。

### ステップ1: 開発者モードをオンにする {#x1}

拡張機能のポップアップで、ホーム画面の下部にあるバージョン番号を<strong>7回</strong>クリックします。<strong>開発者モード</strong>のセクションが現れ、<strong>開発者ツール</strong>、<strong>テストネット（diana）に切り替え</strong>、<strong>開発者モードをオフにする</strong>があります。<strong>テストネット（diana）に切り替え</strong>をクリックします。

<strong>最初に行う理由:</strong> リクエストログは、開発者モードがオンの間だけリクエストを記録します。

### ステップ2: Hybrid Inspector を起動する {#x2}

`workshop-4` フォルダーから実行します。

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

1行目はワークショップ1のアプリに移動し、`pnpm install` はそのパッケージをダウンロードし、`pnpm dev` はローカルのウェブページを起動します。表示されたアドレス（通常は `http://localhost:5173`）を開き、QoreX を接続します。

### ステップ3: ウォレットがロックされた状態でリクエストを送る {#x3}

QoreX で<strong>ロック</strong>をクリックします。Inspector で、メモ `Workshop 4` を付けて、0.001 QOR を自分のアドレスに送ります。

<strong>表示されるはずのもの:</strong> QoreX がパスワードを求め、要求している<strong>サイトの名前を示します</strong>。ロックを解除すると、承認画面に金額、受取人、メモが表示されます。承認すると、トランザクションは両方の鍵で署名されます。代わりにウィンドウを閉じると、リクエストは拒否されます。

<strong>重要な理由:</strong> パスワードなしには何も署名されず、どのサイトが要求しているかがわかります。

### ステップ4: 開発者ツールを開く {#x4}

<strong>開発者ツール</strong>を開き、<strong>トランザクション</strong>の下を見ます。

- <strong>リクエストログ:</strong> 各サイトが QoreX に何を要求したか。メソッド、パラメーター、あなたの回答が表示されます。
- <strong>トランザクションインスペクター:</strong> トランザクションハッシュかリクエストを <strong>Hash or request</strong> に貼り付けて、<strong>検査</strong>をクリックします。ハッシュの場合は、ウォレットを離れずに、チェーンが記録した内容を確認できます。

開発者ツールは全部で17個あります。それぞれの説明は[開発者モード](/qorex/developer-mode)にあります。

### QoreX 1.2.5 のその他の新機能 {#also-new}

- <strong>手動で開く EVM ウィンドウは、デフォルトで QOR の送金のみを許可します。</strong> より広い範囲も選べて、何を許可するのかが表示されます。
- <strong>PQC マルチシグ:</strong> 各メンバーがポスト量子で署名する共有アカウント。
- <strong>鍵のローテーションと修復:</strong> アドレスを変えずに、チェーン上の ML-DSA-87 鍵を置き換えたり修復したりできます。

## トラブルシューティング {#troubleshooting}

| 表示される内容 | すること |
| --- | --- |
| `no operator account yet` | 先に `node rollup.mjs init` を実行してください。 |
| `no rollup yet` | 先に `node rollup.mjs prepare` を実行してください。 |
| 資金不足で `createRollup` が拒否される | オペレーターのアカウントには、テスト用 QOR が約12,010必要です。[始める前に](#prerequisites)を参照してください。 |
| `prepare` が途中で止まる | もう一度実行してください。済んだところから続けます。 |
| `withdrawals are paid only after the challenge window` | バッチ 0 はまだ確定していません。`node rollup.mjs status` で確認し、後でもう一度試してください。 |
| `nothing to challenge` | 先に `node rollup.mjs cheat` を実行してください。 |
| `watchtower` を実行すると、バッチがすでに却下されている | テストネット上の別のウォッチタワーのほうが早かったということです。これは正常です。 |
| `no account "traveler"` | 先に `node ibc.mjs init` を実行してください。 |
| `does not exist on chain yet` | そのアドレス用にフォーセットでテスト用 QOR を入手してから、もう一度試してください。 |
| `nothing after 120 s` | リレイヤーが混み合っている可能性があります。1分待ってから `node ibc.mjs status` を実行してください。 |
| リクエストログが空 | dApp を使う前に、開発者モードをオンにしてください。 |

## 詳しく知る {#learn-more}

- フェスト、そのレベルとトラック: [build.qorechain.io](https://build.qorechain.io)。
- [ロールアップ](/rollups/overview)と RDK。RDK は TypeScript、Python、Rust、Go、Java で利用でき、コマンドラインツール `qorollup` とプロジェクトテンプレートが付いています。
- 新しいバッチを到着のたびに追うには、RDK の `watchBatches` を見てください。一日中動くウォッチタワーの出発点になります。
- [QORel](https://github.com/qorechain/QORel) はオープンソースです。`brew install qorechain/tap/qorel` でインストールするか、コンテナ `ghcr.io/qorechain/qorel` を使います。必ず自分の鍵だけで実行してください。
- パート2で別のチャネルを試すには、`ibc.mjs` の `CHANNEL`、`HUB_CHANNEL`、相手チェーンのエンドポイントを変更します。チャネルは `node ibc.mjs channels` で一覧表示できます。
- QoreX の[開発者モード](/qorex/developer-mode)と [dApp 連携](/qorex/dapp-integration)。
- ロールアップが投稿するデータを非公開に保つ必要がある場合は、[ワークショップ3、QoreSeal](/build-before-qday/workshop-3#part-1)。
