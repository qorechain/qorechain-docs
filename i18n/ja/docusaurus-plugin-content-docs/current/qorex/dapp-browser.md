---
slug: /qorex/dapp-browser
title: dApp ブラウザ
sidebar_label: dApp ブラウザ
sidebar_position: 7
---

# dApp ブラウザ（モバイル）

QoreX にはアプリ内蔵の **dApp ブラウザ** が含まれており、ウォレットを離れることなく QoreChain アプリケーションを利用できます。すべての署名は明示的に承認されます。ほかに何もインストールせずにウェブアプリを使いたいモバイルユーザーや、モバイルウォレット内で自分のアプリをテストする開発者のためのものです。

## 革新的な仕組み {#innovations}

- **セッション単位の接続。** オリジンごとに 1 回の承認で、すべての接続はブラウザを閉じると終了します。
- **デコードされ、生体認証で保護された署名。** 各署名はそれぞれが独立した承認で、ペイロードがデコードされます。QoreX がデコードできないものは、拒否します。
- **`signAndBroadcast`。** ページがメッセージを送ると、QoreX がそれを表示し、ウォレットだけが作成できる ML-DSA-87 レイヤーを追加して、ブロードキャストします。
- **乗っ取らない検出。** QoreX は EIP-6963 で自身を通知し、他のウォレットの `window.ethereum` や `window.keplr` を上書きすることは決してありません。

## アクセス方法 {#how-to-access}

dApp ブラウザはモバイルアプリの一部です。App Store（iOS 15.1 以降）または Google Play（Android 7.0 以降）からインストールしてください。リンクは[概要](/qorex/overview#how-to-access)にあります。アカウントは不要です。デスクトップの dApp については、[ブラウザ拡張機能](/qorex/browser-extension)をご利用ください。

## dApp への接続 {#how-to-use}

Home タブから **dApp ブラウザ** を開き、アプリに移動します。dApp のアドレスを **Enter a dApp URL** ボックスに入力または貼り付けます（接続できるのは `https://` アドレスのみです）。QoreX はページに `window.qorex` としてプロバイダーを注入します - QoreChain Native プロバイダー（`signAndBroadcast` を含む）、読み取り専用の EVM プロバイダー（アカウントとチェーンのクエリのみ）、そして Solana プロバイダーです。また EIP-6963 を通じても自身を通知します。`window.ethereum` は他のウォレットが設定していない場合にのみ設定し、他のウォレットを上書きすることは決してありません。`window.keplr` エイリアスはありません。

- **接続** は**オリジンごとに 1 回の承認**で行います。承認すると、そのサイトに公開されるのはあなたの公開アドレスのみです。
- **すべての署名** はそれぞれが生体認証で保護された承認であり、ペイロードが**デコード**されるため、自分が何に署名しているのかを正確に確認できます - **ブラインド署名は一切ありません**。
- **ブラウザを閉じるとすべての権限が失われます** - 接続はセッション単位のスコープです。
- **ネイティブトランザクションは `signAndBroadcast` を通ります。** QoreX はすべてのメッセージ、手数料、署名アカウントを表示し、ML-DSA-87 レイヤーを追加してブロードキャストします。ここでの EVM プロバイダーはアカウントとチェーンのクエリにのみ応答し、EVM トランザクションの署名や送信は行いません。[承認ウィンドウに表示される内容](/qorex/security-and-recovery#approvals)を参照してください。

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
- ここでの EVM プロバイダーはアカウントとチェーンのクエリにのみ応答し、EVM トランザクションやメッセージの署名や送信は行いません。`signArbitrary`（メッセージ署名）はサポートされていません。
- `window.qorex.native` は Keplr スタイルですが、Keplr のドロップイン互換ではなく、`window.keplr` エイリアスもありません。
- 接続は永続しません。ブラウザを閉じると終了します。
- Q-Day Scanner、ソーシャルリカバリー、Legacy はアプリ内にあり、拡張機能にはありません。
