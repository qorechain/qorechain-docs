---
slug: /dashboard/developers
title: 開発者
sidebar_label: 開発者
sidebar_position: 13
---

# 開発者

**Developers** ページ(`/developers`、サイドバーの **Build** グループ内の **Developers** 項目)は、QoreChain 上で構築する人のための公開ツールボックスです。**SDKs**、**PQ key status**、**Simulator**、**Signing playground**、**QoreX test wallet**、**AI agents (MCP)** の6つのタブがあります。アカウントが登録したポスト量子鍵と、その EVM 認可ウィンドウが開いているかどうかを確認したり、署名済みトランザクションをドライランしたり、使い捨ての鍵でハイブリッド署名を練習したり、モックの QoreX ウォレットを相手に dApp を動作確認したりできます。これらはすべてブラウザ上で、アカウントなしで行えます。dApp、ウォレット、バックエンドの開発者向けです。SDK そのものについては [SDK 概要](/sdk/overview)と[インストール](/sdk/install)を参照してください。

## イノベーション {#innovations}

- **任意のアドレスについて、PQC 鍵と EVM ウィンドウをチェーンから読み取ります。** PQ key status タブは、アカウントが登録した ML-DSA-87 鍵とその EVM 認可ウィンドウを、チェーン自身のクエリルートを通じて、メインネットまたはテストネットで調べます。`qor1...`、`0x...`、`qorvaloper1...` のアドレスに対応しています。
- **何もブロードキャストしないドライラン。** Simulator は署名済みトランザクションをチェーンの simulate ルートに送信し、使用ガス、推奨ガスリミット、そのトランザクションが生じさせる残高の変化とイベントを報告します。Dashboard がこの目的のために公開している書き込み系ルートは simulate のみです。
- **鍵がブラウザの外に出ない、ブラウザ内でのハイブリッド署名。** Signing playground は、ページ内で使い捨ての24語のフレーズを生成し、secp256k1 鍵と ML-DSA-87 鍵を導出して、[QoreSign](/qoresign/overview) ライブラリでメッセージと Sign In With QoreChain リクエストの署名と検証を行います。鍵はメモリ上にのみ存在し、再読み込みすると消えます。
- **dApp のテスト用のモック QoreX。** QoreX test wallet は `window.qorex` をインストールし、現在のタブで EIP-6963 を通じて「QoreX (mock)」として自身を通知します。テストネットでは実際のハイブリッド署名を行い、すべてのリクエストを手動で承認または拒否します。
- **構造上、テストネット専用。** Signing playground と test wallet はメインネットを拒否します。署名するのは `qorechain-diana` のみです。読み取り専用の2つのタブは、どちらのネットワークも指定できます。

## 使い方 {#how-to-use}

ページは **SDKs** タブで開きます。**PQ key status** タブと **Simulator** タブには、ヘッダーの設定にかかわらず、ページ内だけで有効で**デフォルトが Testnet** の **Network** トグルが表示されます。(ネットワークを切り替えてもページが再読み込みされ、メモリ上の鍵や test wallet が消えてしまうことがないよう、ページ単位のトグルを使用しています。)

### PQ key status {#pq-status}

1. **PQ key status** タブを開き、ネットワークを選びます。
2. **Account address**(`qor1...`、`0x...`、または `qorvaloper1...`)を入力します。`0x` アドレスは、その `qor1` 形式と同じ20バイトです。`qorvaloper` アドレスは、運用者自身のアカウントとして調べられます。ページは形式とチェックサムを確認します。
3. **Check** を選択します。
4. **Registered PQC key** には、鍵が登録されているかどうか、そのアルゴリズム(ML-DSA-87)、鍵タイプ、**Proof of possession**(チェーンはこれを任意として扱います)、公開鍵が表示されます。登録されていない場合は、その旨が表示されます。
5. **EVM authorisation window** には、状態(**Open** または **Closed**)、**Blocks left**、**Transactions used**(例: 「3 of 20」)、**Value used**、開かれた高さと期限切れの高さ、ウィンドウが **Native QOR transfers only** かどうか、許可された宛先が表示されます。アカウントがウィンドウを一度も開いていない場合は、「No EVM authorisation window has been opened for this account.」と表示されます。

ウィンドウはネイティブレーンからアカウントの ML-DSA-87 鍵で開かれ、ブロック数の上限またはトランザクション数の上限に達すると閉じます。[EVM 認可ウィンドウ](/developer-guide/evm-development#evm-window)を参照してください。このタブは、「なぜ自分の EVM トランザクションが拒否されたのか」というよくある疑問に、コマンドラインなしで答えます。

### Simulator {#simulator}

1. **Simulator** タブを開き、ネットワークを選びます。
2. **Signed TxRaw**(base64 または hex)をボックスに貼り付けます。ページは、デコードされたサイズと署名の数を表示し、署名が1つもない場合は警告します(チェーンは、署名のないトランザクションのシミュレーションをおそらく拒否します)。
3. **Simulate** を選択します。結果には、**Gas used**、**Suggested gas limit**、**Balance changes**(アドレス、デノミネーション、変化量)、**Events** が表示されます。
4. チェーンが拒否した場合、ページはそのコード、codespace、ログを表示します。

何もブロードキャストされません。署名済みのトランザクションバイトが必要です。先に SDK または `qorechaind` で構築して署名してください([ポスト量子署名](/developer-guide/post-quantum-signing)を参照)。入力はおよそ 180 KB に制限されています。

### Signing playground(テストネット専用) {#signing-playground}

1. **Signing playground** タブを開きます。「Throwaway testnet key: never use it for real funds.」という警告が表示されます。
2. **Generate throwaway key** を選択します。ページには、アドレス、secp256k1 公開鍵のサイズ、ML-DSA-87 鍵のサイズが表示されます。別の鍵にするには **New key** を選択します。
3. **Message:** テキストを入力して **Sign** を選択します。テキストはチェーン `qorechain-diana` 向けに両方の鍵で署名され、署名は JSON として表示されます。
4. **Verify:** 署名と署名者のアドレスを貼り付けて **Verify** を選択します。「Valid signature」または「Invalid signature」と報告されます。使い捨ての鍵はチェーンに登録されていないため、署名者のアドレスとこのセッションの ML-DSA-87 公開鍵に対して検証します。
5. **Sign In With QoreChain:** **Build message** を選択すると、ランダムなノンスを持つこのサイト向けのサインインメッセージが作成され、サーバーが行うのと同じ方法で署名と検証を行います。解析されたフィールドが表示されます。[SIWQ 仕様](/qoresign/spec/siwq-v1)と[サインインガイド](/qoresign/guides/sign-in)を参照してください。

鍵はブラウザ内で生成され、保存も送信もされず、復元することはできません。フォーマットについては [QoreSign](/qoresign/overview) と [Hybrid signing v1](/qoresign/spec/hybrid-signing-v1) を参照してください。

### QoreX test wallet(テストネット専用) {#test-wallet}

1. **QoreX test wallet** タブを開き、警告を読みます。起動のたびに、使い捨てのテストネット鍵がメモリ上に生成されます。実際の資金をそこに送らないでください。
2. **Start test wallet** を選択します。公開されている `@qorechain/qorex-wallet-mock` パッケージを使用し、モックを**このタブ**にインストールして(再読み込みするまで、そこにある本物の QoreX 拡張機能を置き換えます)、保持している **Addresses**(QoreChain Native、EVM、SVM)を一覧表示します。
3. 同じタブで動作している dApp から接続するか、ブラウザのコンソールから `window.qorex` を呼び出します。
4. すべてのリクエストは **Waiting for approval** の下であなたの操作を待ちます。**Approve** または **Reject** を選択します。**Requests** リストには、それぞれの承認状態と結果が記録されます。
5. モックを削除するには、**Stop (reloads the page)** を選択します。

署名するのはテストネットのみで、メインネットでは決して署名しません。dApp を本物の QoreX に向ける前に、dApp の接続フローを試すために使用してください。

### SDKs と AI agents (MCP)

- **SDKs:** このタブには現在、短い静的なクイックスタートとパッケージの表が表示されています。**内容は古くなっています**(バージョン 0.1.0 のままで、パッケージがレジストリにないと記載されていますが、これはもう正しくありません)。現行のパッケージとバージョンについては [SDK インストール](/sdk/install)を使用してください。テスト済みのパッケージ一覧から、インストールコマンド、クイックスタート、レジストリのライブバージョンを生成して再構築した SDKs タブは、**近日公開予定で、まだ稼働していません**。
- **AI agents (MCP):** このタブは npm レジストリで QoreChain MCP サーバーを確認し、パッケージが公開されていない間は **「The QoreChain MCP server is not published yet.」** と表示します。インストールコマンドはまだありません。パッケージが公開されると、このタブには、stdio 経由でローカルに、または Streamable HTTP 経由でセルフホストして実行するためのクライアント設定が表示されます。
- **Transaction inspector:** 任意のトランザクションをデコードして説明するツールは、**近日公開予定で、まだ稼働していません**。

## アクセス方法 {#how-to-access}

- **URL:** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers)、またはサイドバーの **Build** グループ内(およびモバイルメニュー)の **Developers**。
- **サインイン:** 不要です。このページは誰にでも開かれています。
- **ネットワーク:** PQ key status と Simulator: メインネットまたはテストネット(タブ上のトグルで切り替え、デフォルトはテストネット)。Signing playground と QoreX test wallet: テストネットのみ。
- **ウォレット:** 不要です。ツールは自前の使い捨ての鍵を生成します。
- **費用:** 無料です。読み取りクエリと simulate 呼び出し以外は、チェーンに何も送信されません。
- **プライバシー:** 使い捨ての鍵は、ページのメモリ上にのみ存在します。本物のリカバリーフレーズをどのツールにも貼り付けないでください。

## 公開場所 {#where-published}

| サーフェス | アドレス | ネットワーク |
| --- | --- | --- |
| Developers ページ | `dashboard.qorechain.io/developers` | メインネットとテストネットの読み取りツール、テストネット専用の署名ツール |
| 署名ライブラリ | npm `@qorechain/qoresign` 0.1.0、ソース `github.com/qorechain/qoresign`、[QoreSign](/qoresign/overview) を参照 | 該当なし |
| テストウォレットパッケージ | npm `@qorechain/qorex-wallet-mock` 0.1.0、ソース `github.com/qorechain/qorex-integrations` | テストネット |
| MCP サーバー | `@qorechain/mcp`: まだ公開されていません | 該当なし |

バージョンは 2026年10月27日に npm レジストリで確認しました。

## 制限事項と既知の問題 {#limits}

- **まだ稼働していないもの:** 再構築された SDKs タブとトランザクションインスペクター。MCP サーバーは公開されていないため、インストールするものはありません。
- **現在の SDKs タブは古くなっています。** 代わりに [SDK のページ](/sdk/overview)を使用してください。
- **Simulator には署名済みのトランザクションが必要です。** 代わりに署名することはできず、ブロードキャストもしません。
- **Playground と test wallet はテストネット専用**で、再読み込みすると消える使い捨ての鍵を使用します。実際の資金を保持したり移動したりすることはできません。
- **同じタブにある本物の QoreX 拡張機能は、** ページを再読み込みするまで test wallet に置き換えられます。
- **読み取りは読み取り専用のプロキシを経由します。** チェーンの REST エンドポイントはブラウザの CORS ヘッダーを送信しないため、Dashboard は `cosmos/`、`cosmwasm/`、`qorechain/` パス配下の読み取り専用リクエストと simulate 呼び出しを中継します。ご自身のコードからは、公開エンドポイントを直接呼び出してください: `api.qore.host` と `api-testnet.qore.host`。
