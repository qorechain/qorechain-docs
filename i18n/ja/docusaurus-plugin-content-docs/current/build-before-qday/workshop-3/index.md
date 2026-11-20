---
slug: /build-before-qday/workshop-3
title: "ワークショップ3: 暗号化アプリとクロス VM"
sidebar_label: "ワークショップ3"
sidebar_position: 4
date: 2026-11-20
---

# ワークショップ3: 暗号化アプリとクロス VM

ワークショップ2では、ポスト量子鍵でお金を守りました。ワークショップ3では、同じチェーンで新しいことを2つ行います。1つ目は、**QoreChain のアドレスあてにメッセージを暗号化**し、そのアドレスの持ち主だけがポスト量子暗号で読めるようにします。2つ目は、**EVM** 上の1つのトランザクションが **QoreChain Native** 上のコントラクトに書き込み、両側が一緒に変わるか、まったく変わらないかのどちらかになるようにします。

暗号の専門家である必要はありません。以下のすべてのコマンドについて、何をするのか、何が表示されるはずなのかを説明します。2つのサンプルアプリは公開されています: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) の `workshop-3` フォルダーです。どちらも QoreChain テストネット `qorechain-diana` でのみ動作します。テスト用 QOR に価値はありません。

**所要時間:** QoreSeal に約30分、クロス VM チェックアウトに約40分です。2つのパートは独立しており、それぞれ専用のテストアカウントが必要です。

## 作るもの {#what-we-built}

| パート | アプリ | 示すこと |
| --- | --- | --- |
| 1 | **QoreSeal**（Node.js） | `qor1...` アドレスあてに ML-KEM-1024 でメッセージを暗号化し、開き、部外者には開けないこと、改ざんが検出されること、そして古いメールを失わずに鍵をローテーションできることを確認します。 |
| 2 | **CrossVmCheckout**（Solidity と Rust） | EVM コントラクトからの1回の呼び出しが、同じトランザクションの中で Native コントラクトにレシートを書き込みます。どちらかの側が失敗すると、両側が取り消されます。 |

これらの背後にある革新的な点:

- **アドレスあての暗号化。** どのアカウントも、ポスト量子の暗号鍵をチェーン上に公開できます。公開の電話帳のようなものです。誰かにメッセージを書くには、そのアドレスだけがあれば十分です。
- **鍵とアカウントを結び付けるカード。** アカウントは、2つの署名鍵の両方で小さな受信者カードに署名します。そのため、偽の暗号鍵を間に滑り込ませることは誰にもできません。
- **ハイブリッド暗号化。** ML-KEM-1024（NIST FIPS 203）を、従来型の X25519 鍵と組み合わせます。どちらか一方が破られていない限り、メッセージは秘密のままです。
- **クロス VM のアトミック性。** EVM と QoreChain Native は、1つの状態と1つのブロックを共有します。両者をまたぐ呼び出しも同じトランザクションの一部なので、中途半端な状態の後片付けは必要ありません。
- **ガバナンスが承認した到達範囲。** ブリッジが呼び出せるのは、ガバナンスが承認した Native コントラクトだけで、各承認はコントラクトのコードに固定されています。

## このガイドで使う用語 {#words}

| 用語 | やさしい意味 |
| --- | --- |
| ML-KEM-1024 | ポスト量子の鍵交換方式（NIST FIPS 203）。ここでは、メッセージごとの秘密鍵を取り決めるために使います |
| X25519 | 従来型の鍵交換方式。ML-KEM と組み合わせることで、どちらかが破られても封筒が守られます |
| ML-DSA-87 | ポスト量子の署名方式（NIST FIPS 204）。すべてのネイティブトランザクションは、これと従来型の secp256k1 鍵の両方で署名されます |
| 受信者カード | アカウントの暗号鍵をそのアカウントに結び付ける、署名付きの小さなメモ |
| 封筒 | 封をしたメッセージ。好きな方法で送れるテキストファイルとして保存されます |
| Native | QoreChain Native。コントラクトを Rust で書く CosmWasm のレーン |
| ブリッジ precompile | `0x0000000000000000000000000000000000000901` にある組み込みのコントラクトで、EVM コントラクトから Native コントラクトを呼び出せるようにします |
| 許可リスト | ブリッジが到達してよいとガバナンスが承認した Native コントラクトの一覧 |
| EVM ウィンドウ | アカウントから Ethereum 形式のトランザクションを送るための、短く限定された許可。開くには両方の鍵で署名したトランザクションが必要です |

:::caution 使い捨てのテストネットアカウントだけを使う
このワークショップのために作った、価値のないテスト用 QOR だけが入った鍵を使ってください。本物のお金が入っているアカウントのシークレットワードや鍵を、ファイルやコマンドに入れることは決してしないでください。
:::

## 始める前に {#prerequisites}

[始める前に](/build-before-qday/prerequisites)にあるツール（ターミナル、Node.js、Git）と、フォーセット用のブラウザーが必要です。パート1には Node.js 20 以降が必要です。パート2には、さらに **pnpm** と **Foundry** が必要で、Rust は任意です。Node.js を確認します。

```bash
node -v
```

`v20` 以上が表示されるはずです。パート2のために、残りをインストールします。

```bash
npm install -g pnpm
```

パート2が使うパッケージツール pnpm をインストールします。`pnpm -v` で確認してください。Foundry は Solidity のコンパイル、テスト、デプロイを行います。[getfoundry.sh](https://getfoundry.sh) からインストールし、`foundryup` を実行します。`forge --version` と `cast --version` で確認してください。

サンプルコードを取得します。

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

1行目は、サンプルを `build-before-qday` という名前のフォルダーにダウンロードします。2行目は、2つのアプリが入っている `workshop-3` フォルダーに移動します。

テスト用 QOR は、ダッシュボードの[フォーセット](/dashboard/faucet)から入手します。

## パート1: QoreSeal、アドレスあての暗号化 {#part-1}

コード: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal)。パッケージ: `@qorechain/qoreseal` と `@qorechain/qoresign`。

誰かにプライベートなメッセージを送りたいのに、相手について知っているのはアドレスだけです。このアプリは、その方法を示します。

1. Alice が自分の鍵をチェーンに登録します。
2. 誰でも、Alice のアドレスから Alice の暗号鍵を調べられます。
3. メッセージを Alice あてに封印します。Alice は開けます。**Eve は開けません。**
4. 封筒の1ビットを変えると、**もう開かなくなります**。
5. 1つのメッセージを Alice **と** Bob の両方あてに封印します。それぞれが自分の鍵で開けます。
6. Alice が鍵を**ローテーション**します。古いカードは拒否され、新しいメッセージは新しい鍵を使い、古いメッセージは引き続き開けます。

暗号化はあなたのコンピューター上で行われます。チェーンがメッセージを見ることはなく、見るのは公開鍵だけです。

```bash
cd 01-qoreseal
```

QoreSeal のフォルダーに移動します。

### ステップ1: インストール {#seal-install}

```bash
npm install
```

`package-lock.json` にあるとおりの正確なバージョンのパッケージをダウンロードします。QoreSeal、QoreSign（ハイブリッド署名ツール）、そしてトランザクションを組み立てるいくつかの cosmjs ヘルパーです。

```bash
node seal.mjs help
```

すべてのコマンドを一覧表示します。

### ステップ2: テストネットアカウントを3つ作る {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

各コマンドは新しいアカウントを作り、そのシークレットワードを `~/.config/qday-w3/<name>.json` に、あなただけが読める形で保存します。秘密は何も表示されません。ファイルを別の場所に置きたい場合は、`QDAY_DIR` を設定します。各コマンドは、そのアカウントの `qor1...` アドレスを表示します。

### ステップ3: Alice に資金を入れる {#seal-fund-alice}

Alice の `qor1...` アドレスを[フォーセット](/dashboard/faucet)に貼り付け、次のコマンドで確認します。

```bash
node seal.mjs whoami
```

各アカウントのアドレス、残高、鍵がすでにチェーン上にあるかどうかを表示します。この時点では、答えは `no` です。

### ステップ4: Alice が鍵を登録する {#seal-register}

```bash
node seal.mjs register alice
```

2つのトランザクションが送られます。

1. **ML-DSA-87 署名鍵**と、Alice がそれを所有している証明。チェーンはまだ Alice のポスト量子鍵を知らないため、従来型の鍵だけで署名されたトランザクションとして受け付けられるのは、これだけです。
2. **ML-KEM-1024 暗号鍵**（1,568 バイト）。両方の鍵で署名されます。これ以降、誰でもチェーンから読み取れます。

そのあと、Alice の**受信者カード**に署名し、`cards/alice.json` として保存します。実際のアプリでは、カードをアドレスのそばに公開します。たとえば、プロフィールページ、コントラクト、API の裏側などです。

### ステップ5: Bob と Eve に QOR を分け、Bob を登録する {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Alice から Bob と Eve に、テスト用 QOR を 3 ずつ送ります。登録後のすべてのトランザクションと同様に、**両方の**鍵で署名され、チェーンは両方を確認します。だから Alice が最初に登録するのです。チェーン上に ML-DSA-87 鍵がないアカウントは、それを登録することしかできず、ほかのトランザクションは拒否されます。

```bash
node seal.mjs register bob
```

ステップ9で1つのメッセージを2人に送るために、Bob が必要です。Eve は未登録のままです。Eve は、Alice のメールを読もうとする部外者です。

### ステップ6: 送信者になったつもりで Alice を調べる {#seal-lookup}

```bash
node seal.mjs lookup alice
```

公開 REST API の `GET /qorechain/pqc/v1/kem/<address>` を読み取ります。アルゴリズム（`ML-KEM-1024`）、1,568 バイトの公開鍵、そして登録されたブロックが表示されます。そのあと、カードを、その鍵と、チェーン上にある Alice の ML-DSA-87 鍵に照らして確認します。`card valid` と表示されるはずです。どのアドレスでも同じことができます: `node seal.mjs lookup qor1...`。

### ステップ7: Alice あてにメッセージを封印して開く {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

チェーンから Alice の鍵を読み取り、カードを確認し、メッセージを封印します。41文字のメッセージは約 1,760 バイトになり、その大部分はポスト量子の鍵素材です。封筒は `inbox/` に保存されます。

```bash
node seal.mjs open alice
```

`OPENED by alice with encryption key #0` と、メッセージが表示されます。

```bash
node seal.mjs open eve
```

`CANNOT OPEN: eve holds none of the keys this envelope was sealed to` と表示されます。Eve はファイルを持っていますが、Alice の鍵は持っていません。

### ステップ8: 改ざんする {#seal-tamper}

```bash
node seal.mjs tamper alice
```

封筒の1ビットを反転させて、開こうとします。`REFUSED` と `DECRYPTION_FAILED` が表示されるはずです。封筒は認証されているので、どんな変更も検出され、封印されたメッセージを誰も書き換えられません。

### ステップ9: 1つのメッセージ、2人の受信者 {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

1つの封筒が、両方のアドレスあてに封印されています。それぞれが自分の鍵で開けます。Eve は依然として開けません。

### ステップ10: Alice の鍵をローテーションする {#seal-rotate}

```bash
node seal.mjs rotate alice
```

同じシークレットワードから Alice の**次の**暗号鍵（番号1）を導出し、チェーンに登録します。古い鍵は**置き換えられます**。そのあと、**古い**カードをチェーンに照らして確認すると、`refused: the card names a different ML-KEM-1024 key than the registered one` と表示されるはずです。カードを確認する送信者は、もう古い鍵あてに封印できません。新しいカードが署名されます。

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

ローテーション前に封印された**最初の**封筒を開きます: `OPENED by alice with encryption key #0 (an older key)`。古い鍵は保存されていませんでした。シークレットワードから再び導出されるので、ローテーションしても古いメールから締め出されることはありません。

```bash
node seal.mjs inspect
```

秘密を使わずに、封筒の中身を表示します。バージョン、用途、受信者、サイズです。

### コードの仕組み {#seal-code}

すべて `seal.mjs` の中にあります。重要な QoreSeal の呼び出しは次のとおりです。

| 呼び出し | 何をするか |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | シークレットワードから導出した、番号 `index` の暗号鍵 |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | 鍵をチェーンに載せる `MsgRegisterKEMKey` メッセージ |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | アカウントの2つの署名鍵の両方で署名されたカード |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | カードがチェーン上の鍵と一致しない限り、例外を投げる |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | 各鍵をチェーンから読み取り、各カードを確認し、封印する |
| `open({ chainId, purpose, envelope, keys })` | 封筒を開く。開けなければ例外を投げる |
| `envelopeToText` と `envelopeFromText` | 封筒をテキストファイルにする、およびその逆 |

`purpose`（ここでは `qday-note`）は、封印される内容の一部です。あるアプリのために作られた封筒を、別のアプリから来たものとして開くことはできません。

### うまくいかないとき（QoreSeal） {#seal-trouble}

| 表示される内容 | すること |
| --- | --- |
| `does not exist on chain yet: fund ... first` | アカウントに QOR がありません。フォーセットか `fund` を使ってください |
| `no ML-KEM key registered for this address` | 先にそのアカウントで `register` を実行してください |
| `hybrid mode needs the recipient card` | `cards/<name>.json` ファイルがありません。`register <name>` を実行すると、カードが再び書き込まれます |
| `no envelope yet` | 先に `send` を実行してください |
| `account has no PQC key and classical fallback is disabled` | そのアカウントはまだ登録していません。そこから `fund` する前に `register <name>` を実行してください |
| トランザクションでの `refused: ...` | メッセージを読んでください。たいていは QOR が足りないか、公開テストネット API がレート制限をかけています。数秒待ってください |

`~/.config/qday-w3/` のファイルにはシークレットワードが入っています。コミットしたり共有したりせず、メインネットで再利用することも決してしないでください。`cards/` と `inbox/` フォルダーはローカルのもので、`.gitignore` に記載されています。

## パート2: CrossVmCheckout、2つの VM をまたぐ1つのトランザクション {#part-2}

コード: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm)。言語: EVM 側は Solidity と TypeScript、Native 側は Rust。

QoreChain は、同じチェーン上で複数の仮想マシンを動かします。**EVM**（Solidity、MetaMask 形式）と **QoreChain Native**（Rust の CosmWasm コントラクト）です。両者は1つの状態と1つのブロックを共有します。このアプリは小さなお店です。

- **`CrossVmCheckout`**（Solidity、EVM）は注文を数えます。
- **`qday-receipts`**（Rust、Native）はレシート帳を管理します。
- `checkout("coffee for the team")` を1回呼び出すと、**同じトランザクションの中で**両方が行われます。EVM 側で注文数が増え、Native 側でレシートが書き込まれます。

ポイントは**アトミック性**です。両側が一緒に変わるか、どちらも変わらないかのどちらかです。

| コマンド | 何が起こるか | 結果 |
| --- | --- | --- |
| `checkout` | EVM で注文 +1、Native でレシート +1 | 両方が変わる |
| `undo` | Native のレシートが書き込まれ、**そのあと** EVM 側が巻き戻る | どちらも変わらない: レシートも取り消される |
| `native-fails` | 注文が数えられ、**そのあと** Native コントラクトが拒否する | どちらも変わらない: 注文も取り消される |
| `outside` | ガバナンスが承認していない Native コントラクトの呼び出しをブリッジに依頼する | チェーンに拒否される |

メインネットでは、現時点でクロス VM 呼び出しは一時停止されているため、このパートはテストネットでのみ動作します。

### ブリッジと許可リスト {#bridge}

EVM は、`0x0000000000000000000000000000000000000901` にあるブリッジ precompile を通じて Native に到達します。次のように呼び出します。

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| 引数 | 意味 |
| --- | --- |
| `targetVM` | Native は `1` |
| `targetContract` | Native コントラクトの `qor1...` アドレス |
| `payload` | Native コントラクトへの JSON メッセージ |

ブリッジが到達できるのは、**ガバナンス**が承認した Native コントラクトだけです。一覧は crossvm パラメーター（`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`）で公開されており、各エントリーはコントラクトのコードに固定されています。そのため、承認されたコントラクトを、あとから別のコードに差し替えることはできません。

呼び出す Native コントラクト `qday-receipts` は、テストネットの許可リストに入っています（ガバナンス提案 40、コード ID 865）。

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

管理者はいないので、誰も変更できません。**どのビルダーも、クロス VM トラックのために、自分のコントラクトからこれを呼び出せます。** Native 側では、呼び出しの送信者はあなたのウォレットではなく、あなたの EVM コントラクト自身の `qor1...` アカウントです。そのため、すべてのレシートに、どのコントラクトが書き込んだかが表示されます。

### EVM コントラクトの仕組み {#xvm-how}

`evm/src/CrossVmCheckout.sol` を開きます。

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **メモを確認する。** メモは JSON 文字列の中に入るので、`"` と `\` を含まない、表示可能な1文字から140文字でなければなりません。そうでないと、細工されたメモによって、Native コントラクトが受け取るメッセージが書き換えられてしまう可能性があります。
2. **注文を数える。** 通常の EVM の状態変更です。
3. **ブリッジを呼ぶ。** Native コントラクトは、このトランザクションの中でその場で実行されます。
4. **ブリッジの呼び出しが失敗したら、巻き戻す。** Native の失敗は EVM の revert になり、トランザクション全体が取り消されます。
5. **返答がないのは、ブリッジがないということ。** precompile が有効でないチェーンでは、そのアドレスへの呼び出しは空のデータで「成功」します。それを成功ではなく、エラーとして扱ってください。
6. **返答をデコードする。** ブリッジは、Native の返答を ABI エンコードされた `bytes` として返します。コードは生のバイト列も受け付けます。
7. **`failAfter`** は、Native の呼び出しが成功したあとで巻き戻します。Native 側で書き込まれたレシートも取り消されることを示します。

通常の `call` を使い、`staticcall` や view 関数は使わないでください。Native 側が状態を書き込む可能性があるため、ブリッジは静的な呼び出しを拒否します。

以下のコマンドは、特に断りがない限り、すべて `evm` フォルダーで実行します。

```bash
cd ../02-cross-vm/evm
```

まだ `01-qoreseal` にいる場合、これでクロス VM アプリの EVM フォルダーに移動します。

### ステップ1: テストを実行する（アカウント不要） {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` は JavaScript パッケージをダウンロードします。`pnpm forge-std` は、Foundry の標準ライブラリを `lib/` に1回だけダウンロードします。`forge test` は、`test/CrossVmCheckout.t.sol` の5つのテストを実行します。`5 passed; 0 failed` と表示されるはずです。

Foundry のローカル EVM には QoreChain のブリッジがないので、テストでは `vm.etch` を使って、小さな偽のブリッジを `0x...0901` に置きます。テストは、送られる JSON メッセージそのもの、`failAfter` がすべてを巻き戻すこと、Native の失敗が EVM 側を巻き戻すこと、メモで JSON を注入できないこと、そして有効でないブリッジがエラーになることを確認します。本物のブリッジは、次のステップで動きます。

### ステップ2: ポスト量子鍵を持つアカウント {#xvm-account}

ワークショップ2を行った場合は、そこから `.env` をコピーし（同じアカウントで、鍵はすでに登録済み）、`.env.example` にある `RECEIPTS_CONTRACT` の行を追加します。そうでない場合は、次のようにします。

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` は使い捨てのアカウントを作ります。その秘密鍵を、`PRIVATE_KEY` として `.env` に入れてください。**テストネット専用です。**

```bash
pnpm window recovery-code
```

`QRC1-...` コードを表示します。それを `QORE_PQC_RECOVERY_CODE` として `.env` に入れ、秘密鍵とは別の場所にコピーを保管してください。あなたの ML-DSA-87 鍵は、このコードから導出されます。

```bash
pnpm window status
```

あなたの `qor1...` アドレスを表示します。それを[フォーセット](/dashboard/faucet)に貼り付けてから、次を実行します。

```bash
pnpm window register
```

あなたの ML-DSA-87 鍵を、アカウントごとに1回だけチェーンに載せます。`pnpm window status` が `PQC key: registered` と表示するようになります。

### ステップ3: 範囲を絞った EVM ウィンドウを開く {#xvm-window}

```bash
pnpm window:scoped
```

**1,200 ブロック（約28分）、6トランザクション、3 QOR** の送金額と手数料までの範囲で、ウィンドウを開きます。デプロイと3つのデモトランザクションには十分で、それ以上はありません。あなたのウォレットが**あなた自身のコントラクト**を呼び出し、そのコントラクトが自分自身の身元でブリッジを呼び出すので、ウィンドウは、あなたのコントラクトへの呼び出しを通せば足ります。

ウィンドウのトランザクションがブロックに入るよう、次のステップの前に**約10秒待ってください**。

### ステップ4: お店をデプロイする {#xvm-deploy}

```bash
pnpm deploy:testnet
```

`RECEIPTS_CONTRACT` を指す `CrossVmCheckout` をデプロイします。`CrossVmCheckout 0x...` という行を探してください。Foundry の出力にある「ETH」は、QOR のことです。

```bash
pnpm xvm status
```

両側の状態を表示します。あなたの EVM コントラクトの `orders` と、`qday-receipts` のレシート数、そして最新の3件のレシートです。ほかのビルダーも同じレシート帳に書き込むので、その数はおそらくゼロではありません。大事なのは、それが**どう変わるか**です。

### ステップ5: チェーンが承認していないコントラクト {#xvm-outside}

```bash
pnpm xvm outside
```

許可リストに**入っていない**本物の Native コントラクトへの、直接のブリッジ呼び出しをシミュレートします。`REFUSED by the bridge: ... is not allowlisted` と表示されるはずです。これは無料で、ウィンドウのトランザクションを消費しません。

### ステップ6: 1つのトランザクション、2つの VM {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

`before`、トランザクション（`SUCCESS`）、そして `after` が表示されます。orders +1 **かつ** receipts +1 で、あなたのメモが入った新しいレシートが、あなたのコントラクトの `qor1...` アドレスを `from` として表示されます。そのあと `both sides changed, in the same transaction` と表示されます。

### ステップ7: Native の呼び出しのあとで EVM 側が失敗する {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Native のレシートが書き込まれ、そのあと EVM 側が巻き戻ります。トランザクションは `REVERTED` としてマイニングされ、`before` と `after` は同一です: `nothing changed on either side`。Native 側に書き込まれたレシートも消えています。

### ステップ8: Native 側が拒否する {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

注文は EVM 側で数えられ、そのあと `qday-receipts` が `{"fail":{}}` で拒否します。トランザクションは `REVERTED` になり、数字は同一です。EVM の注文も取り消されています。

各トランザクションには、エクスプローラーへのリンクがあります。ネットワークセレクターを **Testnet** にして、[ダッシュボードのエクスプローラー](/dashboard/explorer)で開いてください。

### うまくいかないとき（クロス VM） {#xvm-trouble}

| 表示される内容 | 意味 | すること |
| --- | --- | --- |
| デプロイやトランザクションでの `Missing or invalid parameters` | 有効な EVM ウィンドウがありません | `pnpm window status` を実行し、次に `pnpm window:scoped` を実行して、10秒待ち、もう一度試してください |
| `No shop yet` | このフォルダーからは何もデプロイされていません | ステップ4を行うか、`.env` に `SHOP_ADDRESS` を設定してください |
| `not allowlisted` を伴う `BridgeCallFailed` | 対象がガバナンスに承認されていません | 上のアドレスの `qday-receipts` を使ってください |
| `BridgeNotActive` | そのネットワークでは、ブリッジ precompile が有効ではありません | テストネットを使ってください |
| `BadNote` | メモが空、長すぎる、または `"` か `\` を含んでいます | 140文字までのふつうのテキストを使ってください |

### Native 側 {#native-side}

`native/` フォルダーには、`qday-receipts`（CosmWasm 2、Rust）の完全なソースが入っています。

| メッセージ | 何をするか |
| --- | --- |
| `{"record":{"note":"..."}}` | レシートを追加する: ID、送信者、メモ、ブロック高 |
| `{"fail":{}}` | 常に拒否する。アトミック性を示すためのもの |
| `{"count":{}}`（クエリ） | レシートの数 |
| `{"receipt":{"id":1}}`（クエリ） | 1件のレシート |
| `{"latest":{"limit":3}}`（クエリ） | 最新のレシートを新しい順に、最大20件 |

そのテストを実行します（Rust が必要です）。

```bash
cd ../native
cargo test
```

3つのテストが通るはずです。テストネットへの Native コントラクトのアップロードはガバナンスを通すので、これをデプロイする必要はありません。すでに稼働しています。

チェーン上のコードがこのソースだと確かめるには、CosmWasm optimizer でビルドして、チェックサムを比べます。チェーン上のコードは Apple Silicon の Mac で arm64 イメージを使ってビルドされたので、同じものを使ってください。x86 イメージでは、異なるチェックサムになります。

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

チェックサムは `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` になるはずで、これはチェーンがコード 865 について示す `data_hash` と同じです。

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

レシート帳は、アカウントなしで、どこからでも読めます。

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### ファイル {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## 詳しく知る {#learn-more}

- フェスト、Encrypted Apps と Cross-VM のトラック、バウンティ: [build.qorechain.io](https://build.qorechain.io)。
- npm の QoreSeal: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal)。
- [EVM precompile](/developer-guide/evm-precompiles)と[クロス VM リファレンス](/developer-guide/cross-vm-reference)。
- EVM ウィンドウと Vault については、[ワークショップ2](/build-before-qday/workshop-2)。
