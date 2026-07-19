---
slug: /qorex/dapp-browser
title: dApp ブラウザ
sidebar_label: dApp ブラウザ
sidebar_position: 7
---

# dApp ブラウザ（モバイル）

QoreX にはアプリ内蔵の **dApp ブラウザ** が含まれており、ウォレットを離れることなく QoreChain アプリケーションを利用できます。すべての署名は明示的に承認されます。

## dApp への接続

Home タブから **dApp ブラウザ** を開き、アプリに移動します。QoreX はページにプロバイダーを注入します — QoreChain 接続プロバイダー、読み取り専用の EVM プロバイダー、そして他の本物のウォレットを**決して乗っ取らない**丁寧な `keplr` / `ethereum` エイリアスです。

- **接続** は**オリジンごとに 1 回の承認**で行います。承認すると、そのサイトに公開されるのはあなたの公開アドレスのみです。
- **すべての署名** はそれぞれが生体認証で保護された承認であり、ペイロードが**デコード**されるため、自分が何に署名しているのかを正確に確認できます — **ブラインド署名は一切ありません**。
- **ブラウザを閉じるとすべての権限が失われます** — 接続はセッション単位のスコープです。

## Q-Day Scanner

Home タブのクイックボタンから **Q-Day Scanner** を開くこともできます。任意のアドレスを入力すると、その量子露出レポートが得られます — どの資金が古典鍵のみに置かれ、どの資金がすでにポスト量子で保護されているかがわかります。[セキュリティとリカバリー](/qorex/security-and-recovery#q-day-scanner) を参照してください。

## 設定クイックリファレンス

**Settings** にあるその他の便利なコントロール:

- **Security dashboard** → [セキュリティとリカバリー](/qorex/security-and-recovery)
- **Your addresses** と **Linked account** → [アカウントと Dashboard](/qorex/account-and-dashboard)
- **Use testnet (developers)** — `qorechain-diana` テストネット（EVM チェーン ID 9800）に切り替えます。アプリは再起動なしでライブに再バインドします。デフォルトは常にメインネットです。
- **Portfolio animation** — Aurora 背景を切り替えます。
- **Network status** — アクティブなエンドポイントとともに "Connected to …" を表示します。

## プラットフォーム別の注意事項

- **iOS** — Face ID（初回使用時に利用許可のプロンプトが表示されます）、Secure Enclave のボールト、システム認証シートを通じたサインイン、そしてデバイスリンクと QR スキャン用のカメラ権限。
- **Android** — StrongBox Keystore を備えた BiometricPrompt、`qorex://` フロー（認証コールバック、connect、tx、link）向けに登録されたディープリンク、そしてデバイスリンク用のカメラ権限。

デスクトップの dApp については、代わりに [ブラウザ拡張機能](/qorex/browser-extension) をご利用ください。
