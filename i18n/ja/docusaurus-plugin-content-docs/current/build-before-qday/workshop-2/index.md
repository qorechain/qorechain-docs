---
slug: /build-before-qday/workshop-2
title: "ワークショップ2: ポスト量子鍵でお金を守る"
sidebar_label: "ワークショップ2"
sidebar_position: 3
date: 2026-11-18
---

# ワークショップ2: ポスト量子鍵でお金を守る

ワークショップ1では、2つの鍵で署名したトランザクションを1つ送りました。ワークショップ2では、そのポスト量子鍵を使って**お金を守ります**。最初は、ポスト量子鍵が署名したときだけ支払うスマートコントラクト、次に、支出の上限をチェーンが強制する AI エージェント、最後に、各トランザクションがどのように守られていたかをチェーンに尋ねる方法です。

セキュリティの専門家である必要はありません。以下のすべてのコマンドについて、何をするのか、何が表示されるはずなのかを説明します。3つのサンプルアプリは公開されています: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) の `workshop-2` フォルダーです。

**所要時間:** Vault に約40分、エージェントに約25分、チェーンへの質問に約10分です。各パートはどの順番でも進められますが、パートごとに専用のテストアカウントが必要です。

## 作るもの {#what-we-built}

| パート | アプリ | 示すこと |
| --- | --- | --- |
| 1 | **QDayVault**（Solidity と TypeScript） | ML-DSA-87 署名があるときだけ支払う Vault。署名は `pqcVerify` precompile がチェーン上で検証します。盗まれた Ethereum 形式の鍵だけでは、お金を取り出せません。 |
| 2 | **支払い代行エージェント**（Node.js） | 専用の鍵を持つエージェント。上限はチェーンが強制します: 送金のみ、1回の支払いは 1 QOR まで、1日 3 QOR まで、有効期間は24時間。 |
| 3 | **チェーンに尋ねる**（MCP と `qore-cli`） | 読み取り専用の質問: このトランザクションはポスト量子署名されていたか、このアカウントの鍵の状態はどうなっているか。 |

これらの背後にある革新的な点:

- **コントラクトの中でのポスト量子検証。** チェーンには、固定アドレスに組み込みのコントラクト（precompile）があり、ML-DSA-87 署名を検証し、アカウントの登録済みの鍵を報告します。Solidity のコードからは、ほかのコントラクトと同じように呼び出せます。
- **チェーン上にある上限。** エージェントの権限と支出ルールはアカウントの一部なので、バグや盗まれたサーバーがあっても、上限を外すことはできません。
- **正直なラベル。** どのトランザクションにポスト量子署名が付いていて、どれに付いていなかったかを、チェーンが教えてくれます。

## このガイドで使う用語 {#words}

| 用語 | やさしい意味 |
| --- | --- |
| Precompile | 固定アドレスにある組み込みのコントラクトで、チェーンがネイティブに実行します。`pqcVerify` は `0x0000000000000000000000000000000000000a01`、`pqcKeyStatus` は `0x0000000000000000000000000000000000000a02` にあります。アドレスは小文字で書いてください。Solidity コンパイラは、大文字と小文字が混在した書き方を拒否します |
| ML-DSA-87 | QoreChain が使うポスト量子の署名方式（NIST FIPS 204） |
| EVM ウィンドウ | アカウントから Ethereum 形式のトランザクションを送るための、短く限定された許可。開くには両方の鍵で署名したトランザクションが必要なので、Ethereum の鍵だけでは決して開けません |
| ガーディアン | Vault からの出金のたびに、そのポスト量子鍵で署名しなければならないアカウント |
| オーセンティケーター | チェーンが強制するルール付きで、あなたのアカウントにリンクされた鍵。パート2のエージェントが使います |
| 使い捨てアカウント | この練習のために作った鍵で、テスト用の QOR だけを入れておくもの |

:::caution 使い捨てのテストネットアカウントのみ
このワークショップのために作った鍵を使い、価値のないテスト用 QOR だけを入れてください。本物のお金が入っているアカウントの鍵やリカバリーコードを、`.env` ファイルやコマンドに入れてはいけません。
:::

## 始める前に {#prerequisites}

[始める前に](/build-before-qday/prerequisites)にあるツール（ターミナル、Node.js 22 以降、Git）と、Web ブラウザーが必要です。Node.js を確認します:

```bash
node -v
```

`v22` かそれ以上が表示されるはずです。パート1では **pnpm** と **Foundry** も必要です:

```bash
npm install -g pnpm
```

Vault が使うパッケージツール pnpm をインストールします。`pnpm -v` で確認してください。

Foundry は、Solidity のコンパイル、テスト、デプロイを行います。[getfoundry.sh](https://getfoundry.sh) からインストールしてください。ページにお使いのシステム向けのコマンドが1つ載っているので、そのあとで次を実行します:

```bash
foundryup
```

Foundry のツールをダウンロードします。`forge --version` と `cast --version` で確認してください。

サンプルコードを入手します:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

1行目は、サンプルを `build-before-qday` という名前のフォルダーにダウンロードします。2行目は、3つのアプリが入っている `workshop-2` フォルダーに移動します。

テスト用 QOR は、ダッシュボードの[フォーセット](/dashboard/faucet)を使います。3つのアプリはすべて、QoreChain テストネット `qorechain-diana` でのみ動作します。

## パート1: QDayVault、鍵が漏れても耐える Vault {#part-1}

コード: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault)。通常のウォレットの鍵（MetaMask が使う secp256k1 鍵）は、いつか量子コンピューターに破られる可能性があります。この Vault は、その種類の鍵が盗まれても足りないように作られています。**ガーディアン**がポスト量子鍵で出金に署名したときだけお金が出ていき、コントラクト自身がその署名をチェーン上で検証します。署名済みの出金は誰が送信しても構いません。大切なのは署名であって、送信者ではありません。

```bash
cd 01-qday-vault
```

Vault のフォルダーに移動します。

### コントラクトの仕組み {#vault-how}

`src/QDayVault.sol` を開きます。重要な関数は `withdraw` です:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **ガーディアンの鍵をチェーンから読み取る。** 鍵は 2,592 バイトあるので、コントラクトには保存しません。ガーディアンがチェーン上で鍵をローテーションすると、Vault もそれに従います。
2. **証明されていない鍵を拒否する。** 「証明済み」とは、アカウントが鍵を登録したときに所有の証明に署名したという意味です。このチェックがないと、誰かが自分のものではない鍵を登録できてしまいます。
3. **正確なメッセージに対する署名を検証する。** メッセージには、固定のタグ、チェーン ID、Vault のアドレス、受取人、金額、ナンスが結び付けられています。そのため、署名が使えるのは、1つの出金、1つの Vault、1つのチェーンで、1回だけです。
4. **お金を送る前にナンスを上げる。** 同じ署名を2回使うことはできません。また、外部呼び出しの前に状態を変更するので、リエントランシーを防げます。
5. **送金が成功したことを確認する。** 失敗した場合は、トランザクション全体が取り消されます。

### ステップ1: テストを実行する（アカウント不要） {#vault-tests}

```bash
pnpm install
```

`package.json` にある JavaScript パッケージ（QoreChain SDK、viem、tsx）をダウンロードします。

```bash
pnpm forge-std
```

Foundry の標準ライブラリ `forge-std` を `lib/` にダウンロードします。テストとデプロイスクリプトがこれをインポートします。実行は一度だけです。

```bash
forge test
```

コントラクトをコンパイルし、`test/QDayVault.t.sol` の8つのテストを実行します。`8 passed; 0 failed` と表示されるはずです。ローカルのテストチェーンには QoreChain の precompile がないので、テストでは `vm.etch` を使って、2つの precompile アドレスに小さな代役のコントラクトを置きます。確認するのはロジックです: 正しい署名なら支払われ、不正な署名は拒否され、署名は1回しか使えず、証明されていない鍵は拒否されます。本物の precompile は、次のステップで動きます。

### ステップ2: テストネット専用のアカウントを作る {#vault-account}

```bash
cast wallet new
```

新しいアドレスと秘密鍵を表示します。テストネット専用で使ってください。

macOS と Linux では:

```bash
cp .env.example .env
```

Windows の PowerShell では `Copy-Item .env.example .env` を使います。これで、あなた専用の設定ファイルができます。`.env` は Git に無視されるので、コミットされることはありません。`.env` を開き、`PRIVATE_KEY` に `cast wallet new` で出た秘密鍵を設定します。

```bash
pnpm window recovery-code
```

`QRC1-` で始まるリカバリーコードを表示します。ポスト量子鍵は、このコードから作られます。`.env` に `QORE_PQC_RECOVERY_CODE` として入れ、コピーを、秘密鍵とは別の安全な場所に保管してください。必ず同じコードを使い続けてください。コードが違えば、ポスト量子鍵も別のものになります。

### ステップ3: アカウントに入金する {#vault-fund}

```bash
pnpm window status
```

あなたのアカウントを `0x...` と `qor1...` の2つの形で表示します。同じアカウントです。`qor1...` アドレスを[フォーセット](/dashboard/faucet)に貼り付けてください。

### ステップ4: ポスト量子鍵を登録する（一度だけ） {#vault-register}

```bash
pnpm window register
```

ML-DSA-87 公開鍵を、所有の証明とともにチェーンに登録します。アカウントごとに1回行います。そのあとは、`pnpm window status` に `PQC key: registered` と表示されます。これは、従来型の鍵だけでチェーンが受け付ける唯一のトランザクションです。チェーンがまだあなたのポスト量子鍵を知らないからです。登録が実際に何を結び付けるのかは、[耐量子鍵がアカウントに結び付けられる仕組み](/build-before-qday/key-binding)を参照してください。

### ステップ5: 範囲を絞った EVM ウィンドウを開く {#vault-window}

```bash
pnpm window:scoped
```

両方の鍵で署名したトランザクションを送り、**600 ブロック（約15分）、3 件のトランザクション、価値と手数料を合わせて 2 QOR** の EVM ウィンドウを開きます。デプロイと出金1回には十分で、それ以上はありません。ウィンドウが開いている間に従来型の鍵が漏れても、被害はその予算が上限です。ウィンドウが終われば、Ethereum 形式のレーンはまた閉じます。

次のステップの前に、**約10秒待ってください**。ウィンドウを開いたことでアカウントのナンスが1つ使われ、次のブロックがそれを先に取り込む必要があります。

### ステップ6: Vault をデプロイする {#vault-deploy}

```bash
pnpm deploy:testnet
```

Foundry スクリプト `script/QDayVault.s.sol` を実行します。1 QOR を入金した状態で Vault をデプロイし、**あなた**をガーディアンにします。出力から `QDayVault 0x...` を探してください。Foundry の出力にある「ETH」は QOR のことです。

```bash
pnpm vault status
```

Vault のアドレス、残高（1 QOR）、ガーディアン（あなた）、ナンス（0）を表示します。

### ステップ7: 攻撃をシミュレーションする {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

あなたの従来型の鍵は持っているが、ポスト量子鍵は持っていない攻撃者を演じます。ランダムな ML-DSA-87 鍵で出金に署名し、何が起きるかをチェーンに尋ねます。`BLOCKED by the vault: BadPqcSignature` と表示されるはずです。これはシミュレーションにすぎないので、費用はかからず、ウィンドウも消費しません。受取人はどのアドレスでも構いません。

### ステップ8: 本物の出金 {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

**あなたの** ML-DSA-87 鍵で出金に署名し（メッセージは 157 バイト、署名は 4,627 バイト）、送信します。Vault は `pqcVerify` で署名を検証し、支払います。`WITHDRAWN tx 0x...` とエクスプローラーのリンクが表示されるはずです。

```bash
pnpm window status
```

ウィンドウの残りを表示します: トランザクション1件。ちょうど、あなたが与えた予算どおりです。

### うまくいかないとき {#vault-troubleshooting}

| 表示される内容 | 意味 | 対処 |
| --- | --- | --- |
| デプロイまたは出金で `REFUSED: Missing or invalid parameters` | 有効な EVM ウィンドウがない: 期限が切れたか、使い切った | `pnpm window status` を実行し、次に `pnpm window:scoped` を実行して、10秒待ってからもう一度試す |
| `does not exist on chain yet` | アカウントにまだ QOR がない | フォーセットを使う（ステップ3） |
| `PQC key: not registered` | ステップ4を飛ばした | `pnpm window register` を実行する |
| `GuardianKeyNotRegistered` | ガーディアンがチェーン上に ML-DSA-87 鍵を持っていない | 登録する（ステップ4） |
| `No vault yet` | このフォルダーから何もデプロイされていない | ステップ6を行うか、`.env` に `VAULT_ADDRESS` を設定する |

### デプロイの前にコントラクトを監査する {#vault-audit}

`audit/` フォルダーには、実際のバグを含むコントラクトの最初のドラフトと、修正版が入っています。ダッシュボードの[コントラクト監査](/dashboard/contract-auditor)を使った2段階の流れを示します: ドラフトを監査し、すべての指摘をテスト付きで修正し、最終版のコントラクトを監査して、両方のレポートを保管します。自動監査は、メインネットの前に行う人による監査の代わりにはなりません。Solidity では、量子対応の評価は「Not scored」と表示されますが、これは想定どおりです。EVM では、ポスト量子の検証は precompile を通じてチェーンが行うからです。フォルダー内の `audit/README.md` と、precompile のアドレスとガスについては [EVM Precompile](/developer-guide/evm-precompiles) のページを参照してください。

## パート2: チェーンが上限を強制する、支払い代行エージェント {#part-2}

コード: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent)。ボットに秘密鍵を渡すと、支出の上限はボット自身のコードの中にあることになります。バグが1つ、プロンプトインジェクションが1つ、あるいは盗まれたサーバーが1つあれば、上限はなくなります。QoreChain では、上限は**チェーン上**にあります。エージェントは専用の鍵を持ち、それがあなたのアカウントにリンクされ、チェーンが支払いのたびにルールを確認します。

1つ上のフォルダーに戻り、エージェントのフォルダーに入ります:

```bash
cd ../02-pq-agent
```

### 3つの鍵、3つの役割 {#agent-keys}

| 鍵 | 誰が持つか | できること |
| --- | --- | --- |
| **オーナー** | あなた | あなたのアカウントで、両方の鍵で署名します。お金を持ち、エージェントをリンクし、ルールを書きます |
| **エージェント鍵** | エージェント | ed25519 鍵。ルールの範囲内でのみ、オーナーのアカウントからの支出を依頼できます。お金は持ちません |
| **ガスウォレット** | エージェント | エージェントのリクエストを送信し、手数料を払う、別の小さなアカウント。オーナーのお金は決して持ちません |

この例のルール: エージェントは **QOR の送金だけ**ができ、**1回の支払いは最大 1 QOR**、**1日最大 3 QOR**で、リンクは**24時間後に失効**します。`agent.mjs` を開いて `pay` コマンドを見てください。上限チェックはどこにもありません。エージェントはただ支払おうとするだけです。これから目にする上限は、すべてチェーンによるものです。

### ステップ1: インストールして鍵を作る {#agent-keys-create}

```bash
npm install
```

`package.json` にあるパッケージをダウンロードします: QoreChain SDK、CosmJS、そして ed25519 鍵用の `@noble/curves` です。

```bash
node agent.mjs init
```

エージェントの ed25519 鍵とガスウォレットを作成し、あなただけが読める `~/.config/qday/agent.env` に保存します。ガスウォレットの `qor1...` アドレスを表示します。

```bash
node agent.mjs owner-init
```

テストネット用の使い捨てのオーナーアカウントを作成し、`~/.config/qday/owner.env` に保存します。すでに持っているアカウントを使う場合は、代わりにそのファイルに `QORE_MNEMONIC="..."` を入れてください。鍵があなたのコンピューターの外に出ることはなく、表示されることもなく、リポジトリに入れるべきものでもありません。

```bash
node agent.mjs whoami
```

3つのアドレス（オーナー、エージェント鍵、ガスウォレット）を表示します。

### ステップ2: オーナーとガスウォレットに入金する {#agent-fund}

それぞれの `qor1...` アドレスを[フォーセット](/dashboard/faucet)に貼り付けます。オーナーには支払い用に数 QOR、ガスウォレットには手数料用に約 3 QOR が必要です。

```bash
node agent.mjs balance
```

両方に QOR があることを確認します。

### ステップ3: ポスト量子鍵を登録する（一度だけ） {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

それぞれのアカウントが、ML-DSA-87 公開鍵を所有の証明とともにチェーンに登録します。以後、両方とも、すべてのトランザクションに2つの鍵で署名します。

### ステップ4: 上限を付けてエージェントをリンクする {#agent-link}

```bash
node agent.mjs link 1 3
```

オーナーが、両方の鍵で署名した**1つの**トランザクションを送ります。これは、エージェントの ed25519 鍵をオーナーのアカウントにリンクし（エージェント鍵が同意の証明に署名するので、自分のものではない鍵を誰もリンクできません）、1つの権限（`send`）を与え、支出ルール（1回の支払い 1 QOR、1日 3 QOR、`uqor` のみ）を書き込み、24時間の有効期限を設定します。時間数を変えたい場合は、3つ目の数字を加えてください（最大30日）。`agent linked` と `hybrid ML-DSA-87: verified` と表示されるはずです。

```bash
node agent.mjs rules
```

チェーンが何を強制しているかを読み戻します: ルール、権限、有効期限、エージェントがこれまでに行った支払いの回数。リンクの仕組みについては、[オーセンティケーター](/sdk/guides/authenticators)を参照してください。

### ステップ5: エージェントに支払いを任せる {#agent-run}

```bash
node agent.mjs run bills.json
```

エージェントが、`bills.json` にある5件の請求（合計 8.2 QOR）の支払いを試みます。それぞれについて、ed25519 鍵でリクエストに署名し、ガスウォレットが送信します。次のように表示されるはずです:

| 請求 | 金額 | 結果 | 理由 |
| --- | --- | --- | --- |
| サーバーホスティング | 0.8 | PAID | |
| ドメイン更新 | 0.5 | PAID | |
| 差出人不明の請求書 | 5 | REFUSED BY THE CHAIN | 1回の支払い上限 1 QOR を超過 |
| API クレジット | 1 | PAID | |
| モニタリング | 0.9 | REFUSED BY THE CHAIN | 1日の上限 3 QOR を超過: 2.3 使用済み、残り 0.7 |

拒否はチェーンによるもので、エージェントのコードによるものではありません。エクスプローラーで1つ注意点があります: 拒否された支払いも、コード 0 のトランザクションとして表示されます。トランザクション自体はブロックに受け付けられましたが、その中の支払いが拒否されたのです。`agent.mjs` は中の支払いの結果を読み取っていて、それが表示されます。

### ステップ6: エージェントを取り消す {#agent-revoke}

```bash
node agent.mjs revoke
```

オーナーの1つのトランザクションで、エージェント鍵が無効になります。

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

もう一度、支払いを試みます。`REFUSED BY THE CHAIN: linked key is unbound or revoked` と表示されるはずです。つまり、エージェントが侵害されても、失うのは最大でも1日の上限分で、1つのトランザクションでそれを止められます。

デモをもう一度実行するには、`~/.config/qday/agent.env` を別の場所に移動し（ガスウォレットの QOR を先に移したあとで）、`node agent.mjs init` をもう一度実行します。

すべてのコマンド: `init`、`owner-init`、`whoami`、`register owner|gas`、`link <perTxQOR> <dailyQOR> [hours]`、`rules`、`pay <to> <QOR> [memo]`、`run <bills.json>`、`revoke`、`balance`。環境変数で `QORE_REST`、`QORE_RPC`（ご自身のノード）、`QDAY_DIR`（鍵ファイルの置き場所）を変更できます。

## パート3: MCP と qore-cli でチェーンに尋ねる {#part-3}

コード: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp)。MCP（Model Context Protocol）は、コーディングアシスタントやその他の AI ツールが外部のツールを使うための標準的な方法です。QoreChain の MCP サーバー `@qorechain/mcp` は、チェーンへの**読み取りアクセス**を与えます: ブロック、トランザクション、アカウント、アカウントのポスト量子鍵の状態、手数料の見積もり、シミュレーション。ツールは14個あります。**署名せず、鍵を持たず、ブロードキャストもしません**。送金を頼むと、未署名のドキュメントが返ってくるので、それをご自身のウォレットで署名します。

### MCP クライアントに追加する {#mcp-config}

どの MCP クライアントでも使えます。多くは、次のような設定を使います:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` は、初回にサーバーをダウンロードして起動します。クライアントはそのツールを一覧表示します。たとえば `get_pq_status`、`get_transaction`、`get_address_info`、`read_contract`、`estimate_fee`、`simulate_tx`、`prepare_transfer` です。

### ターミナルから同じ質問をする {#mcp-cli}

`qore-cli` を使えば、AI クライアントなしで同じ答えが得られます。作ったものについて、3つの質問をしてみましょう:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

エージェントの支払いは、ポスト量子署名されていましたか。期待される結果: `tier: pqc`、`verified: true`。これはネイティブのトランザクションで、両方の鍵で署名され、チェーンに検証されています。

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

では、Vault の出金は。期待される結果: `tier: classical`、`reason: evm_lane`。これは正直な答えです: Ethereum 形式のトランザクションには、ポスト量子署名が付きません。それらを守っているのは EVM ウィンドウと、ここでは、ML-DSA-87 署名を自分で検証する Vault コントラクトです。

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

では、アカウントは。期待される結果: `registered: true`、`possession_proven: true`、そして EVM ウィンドウとその残り。

### ビジュアルなクライアント（任意） {#mcp-inspector}

AI アシスタントなしで、ツールをクリックしながら試すには:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

次に **Connect**、**Tools**、**List Tools** の順に選び、`get_pq_status` を選んで、`target` にアドレスかハッシュを入れ、**Run Tool** を選びます。

## 手に入ったもの {#done}

ポスト量子署名があるときだけ支払うコントラクト、チェーンが上限を強制するエージェント、そして、あらゆるトランザクションがどのように守られていたかを確認するツール。どれでも、あなたの提出物の土台として使えます。レベルとルールについては、[Build Before Q-Day](/build-before-qday/overview) を参照してください。
