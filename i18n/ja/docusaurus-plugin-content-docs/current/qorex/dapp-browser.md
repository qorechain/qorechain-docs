---
slug: /qorex/dapp-browser
title: dApp ブラウザ
sidebar_label: dApp ブラウザ
sidebar_position: 7
---

# dApp ブラウザ（モバイル）

QoreX にはアプリ内蔵の **dApp ブラウザ** が含まれており、ウォレットを離れることなく QoreChain アプリケーションを利用できます。すべての署名は明示的に承認されます。ほかに何もインストールせずにウェブアプリを使いたいモバイルユーザーや、モバイルウォレット内で自分のアプリをテストする開発者のためのものです。

## 革新的な仕組み {#innovations}

- **サイトごとに 1 回の承認で、いつでも取り消し可能。** オリジンごとに個別に承認します。接続済みサイトはこの端末にウォレットごとに保存され、[資産の保護状況](/qorex/security-and-recovery#protection)でいつでも取り消せます。
- **デコードされ、生体認証で保護された署名。** 各署名はそれぞれが独立した承認で、ペイロードがデコードされます。QoreX がデコードできないものは、拒否します。
- **`signAndBroadcast`。** ページがメッセージを送ると、QoreX がそれを表示し、ウォレットだけが作成できる ML-DSA-87 レイヤーを追加して、ブロードキャストします。
- **ブラウザ内での EVM 署名とメッセージ署名。** EVM の dApp は QoreChain 上でメッセージ、型付きデータ、トランザクションに署名でき、それぞれの内容は事前にデコードおよびシミュレーションされます。また、どのページも ML-DSA-87 の署名部分を併せ持つメッセージ署名を要求できます。
- **リンクからページを開く。** `browse` リンクはあなたのページを dApp ブラウザで直接開きます。スタートページはお気に入りと最近のサイトを端末上に保持します。
- **乗っ取らない検出。** QoreX は EIP-6963 で自身を通知し、他のウォレットの `window.ethereum` や `window.keplr` を上書きすることは決してありません。

## アクセス方法 {#how-to-access}

dApp ブラウザはモバイルアプリの一部です。App Store（iOS 15.1 以降）または Google Play（Android 7.0 以降）からインストールしてください。リンクは[概要](/qorex/overview#how-to-access)にあります。アカウントは不要です。デスクトップの dApp については、[ブラウザ拡張機能](/qorex/browser-extension)をご利用ください。

## dApp への接続 {#how-to-use}

Home タブから **dApp ブラウザ** を開き、アプリに移動します。dApp のアドレスを **dAppのURLを入力** ボックスに入力または貼り付けます（接続できるのは `https://` アドレスのみです）。QoreX はページに `window.qorex` としてプロバイダーを注入します - QoreChain Native プロバイダー（`signAndBroadcast`、`signDirect`、メッセージ署名を含む）、EVM プロバイダー、そして Solana プロバイダーオブジェクトです。また EIP-6963 を通じても自身を通知します。`window.ethereum` は他のウォレットが設定していない場合にのみ設定し、他のウォレットを上書きすることは決してありません。`window.keplr` エイリアスはありません。開発者の方は[dApp を QoreX と連携する](/qorex/dapp-integration)をご覧ください。

### お気に入りと最近のサイト {#favourites}

ブラウザのスタートページには、**お気に入り**と**最近**のサイト（直近 8 件）が一覧表示されます。アドレスバーの星をタップすると開いているページがお気に入りになり（もう一度タップすると解除）、ホームボタンで一覧に戻ります。**消去** は最近の一覧を空にします。[browse リンク](#browse-links)から開いたページも訪問として数えられます。どちらの一覧もこのスマートフォン内にのみ残り、ページのクエリやフラグメントを除いて保存されます。

### リンクからページを開く {#browse-links}

Web 上のリンクで dApp ブラウザのページを開けます: `https://link.qore.network/browse?url=<encoded https address>` または `qorex://browse?url=<encoded https address>`。QoreX はまず、dApp ブラウザを開くための生体認証を求めます。ドメイン名の `https://` でないアドレスや、ポート、ユーザー名、IP アドレス、`localhost` を含むアドレスは拒否します。このリンクはページに何の権限も与えません。ページは引き続き接続を求める必要があり、すべての署名は引き続き承認シートを通ります。スマートフォンにウォレットがない場合、アプリはオンボーディングのままです。[サービスが生成できるリンク](/qorex/dapp-integration#links)を参照してください。

- **接続** は**オリジンごとに 1 回の承認**で行います。承認すると、そのサイトに公開されるのはあなたの公開アドレスのみです。
- **すべての署名** はそれぞれが生体認証で保護された承認であり、ペイロードが**デコード**されるため、自分が何に署名しているのかを正確に確認できます - **ブラインド署名は一切ありません**。
- **接続は取り消すまで続きます。** 1.2.5 以降、サイトのアドレスはこの端末にウォレットごとに保存されます。接続済みサイトの確認と取り消しは[資産の保護状況](/qorex/security-and-recovery#protection)で行います。接続だけで何かが署名されることはありません。すべての署名には引き続き個別の承認が必要です。
- **ネイティブトランザクションは `signAndBroadcast` を通ります。** QoreX はすべてのメッセージ、手数料、署名アカウントを表示し、ML-DSA-87 レイヤーを追加してブロードキャストします。[承認ウィンドウに表示される内容](/qorex/security-and-recovery#approvals)を参照してください。
- **EVM の dApp** は、QoreChain 上で `personal_sign`、型付きデータ、トランザクションを要求できます。承認画面はそれらをデコードし、ネットワークが許す範囲で、トランザクションが残高にどう影響するかを表示します。QoreChain の EVM レーンでは、承認によってトランザクションに必要な短い認可ウィンドウも開かれ、許可されるすべてのコントラクトが名前で示されます。[EVM アクセスウィンドウ](/qorex/security-and-recovery#evm-window)を参照してください。このレーンで送信できるのは MetaMask からインポートしたアカウントのみです。
- **メッセージ署名:** ページはメッセージへの署名を求めることができます。署名する前に全文が表示されます。
- **ネットワーク:** ページはネットワークを切り替えられません。QoreX 自体で切り替えてください（下記の設定を参照）。ページはウォレットと同じネットワーク上にある必要があります。

## Q-Day Scanner

Home タブのクイックボタンから **Q-Day Scanner** を開くこともできます。任意の Bitcoin または Ethereum アドレスを入力すると、エクスポージャーレポートが得られます。[セキュリティとリカバリー](/qorex/security-and-recovery#q-day-scanner) を参照してください。

## 設定クイックリファレンス

**Settings** にあるその他の便利な項目:

- **Security** → [セキュリティとリカバリー](/qorex/security-and-recovery)
- **Language** - デフォルトでは端末に従います。10 言語
- **Take the tour again** - QoreX が何をするか、どこに何があるかを示す 5 枚の短いカード
- **Coins and networks** - 現在ウォレットが保有・送信できるすべてのもの
- **Wallets** - この端末上の複数のリカバリーフレーズ - [複数のウォレット](/qorex/getting-started#several-wallets)を参照
- **Your accounts** と **Your addresses** → [アカウントと Dashboard](/qorex/account-and-dashboard)
- **Claim your @handle** と **Linked account** → [アカウントと Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** - `qorechain-diana` テストネット（EVM チェーン ID 9800）に切り替えます。アプリは再起動なしでライブに再バインドします。デフォルトは常にメインネットです。テストネットの残高には USD 価値は表示されません。
- **開発者モード** - デフォルトはオフです。QoreChain 上で開発する人向けのツールを集めた「開発者」タブが追加されます。[開発者モード](/qorex/developer-mode)を参照してください。
- **Portfolio animation** - Aurora 背景を切り替えます。
- **Delete account** → [アカウントを削除する](/qorex/account-and-dashboard#delete-account)
- **Connected to** - アクティブなネットワークとそのチェーン ID を表示します。

## プラットフォーム別の注意事項

- **iOS**（iOS 15.1 以降）- Face ID（初回使用時に利用許可のプロンプトが表示されます）、Secure Enclave のボールト、システム認証シートを通じたサインイン、そしてデバイスリンクと QR スキャン用のカメラ権限。
- **Android**（Android 7.0 以降）- StrongBox Keystore を備えた BiometricPrompt、`qorex://` フロー（認証コールバック、connect、tx、link）向けに登録されたディープリンク、そしてデバイスリンク用のカメラ権限。

デスクトップの dApp については、代わりに [ブラウザ拡張機能](/qorex/browser-extension) をご利用ください。

## 公開場所 {#where-published}

dApp ブラウザは QoreX モバイルアプリ（App Store と Google Play）に同梱されています。ストアのページと現在のバージョンについては、[公開場所](/qorex/overview#where-published)を参照してください。別途ダウンロードするものではありません。

## 制限事項と既知の問題 {#limits}

- 接続できるのは `https://` アドレスのみです。
- アプリ内ブラウザは QoreChain のアクティブなネットワークでのみ署名し、EVM の `connect` イベントのみを発行します。アカウントやネットワークを切り替える際はブラウザを閉じます。Solana トランザクションには署名せず、Ethereum ネットワークもありません。
- `window.qorex.native` は Keplr スタイルですが、Keplr のドロップイン互換ではなく、`window.keplr` エイリアスもありません。Amino 署名は拒否されます。
- Q-Day Scanner、ソーシャルリカバリー、Legacy はアプリ内にあり、拡張機能にはありません。
