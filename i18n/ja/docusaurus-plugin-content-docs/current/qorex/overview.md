---
slug: /qorex/overview
title: QoreX ウォレット
sidebar_label: 概要
sidebar_position: 1
---

# QoreX ウォレット

**QoreX** は、量子耐性を備えた Layer 1（メインネット `qorechain-vladi`）である **QoreChain** の公式 **ノンカストディアル** ウォレットです。秘密鍵は生成も保管も **お使いのデバイス上でのみ** 行われます。QoreChain Association があなたの資金にアクセスすることは決してなく、アプリは **一切のデータを収集しません**。Native レーン上のすべての QOR 送金には **ハイブリッド耐量子署名**（ML-DSA-87、NIST FIPS-204、secp256k1 と組み合わせ）が付与されるため、あなたの資金は古典的な攻撃者と量子攻撃者の双方から保護されます。

QoreX は連携して動作する 2 つの部分で構成されています。

- **モバイルアプリ**（iOS & Android）— フル機能のウォレット：作成／復元、量子耐性 QOR の送受信、外部ネットワーク、ステーキング、ポートフォリオ、リカバリー、そしてアプリ内 dApp ブラウザ。
- **ブラウザ拡張機能**（Chrome & Firefox。Safari は対応予定）— デスクトップ向けの dApp コネクタ：ウェブサイトがあなたのウォレットを検出できるようにし、すべてのリクエストを明示的な承認に変えます。

## プラットフォーム対応状況

| 機能 | iOS/Android アプリ | Chrome/Firefox 拡張機能 |
|---|---|---|
| ウォレットの作成／復元／リンク | ✅ | —（アプリとペアリング） |
| QOR の送受信（耐量子） | ✅ | dApp 署名経由 |
| 外部ネットワーク（ETH / BNB / POL / ARB / SOL + トークン） | ✅ | ✅（ポップアップから送信） |
| ステーキング、ポートフォリオ、Q-Day Scanner、リカバリー、Legacy | ✅ | — |
| dApp 接続 | ✅（アプリ内ブラウザ） | ✅（あらゆるウェブサイト） |
| アカウント（@handle、支払いリクエスト、Dashboard リンク） | ✅ | — |

## QoreX が他と違う理由

- **デフォルトで量子耐性** — Native レーンの QOR 送金には常に ML-DSA-87 + secp256k1 のハイブリッド署名が付与されます。古典的なもの（外部チェーン）はすべて明確にラベル付けされ、決して無言で処理されることはありません。
- **真のノンカストディアル** — 鍵はデバイス上で生成され、ハードウェアバックのボールト（iOS では Secure Enclave、Android では StrongBox）または暗号化ボールト（拡張機能）に保管されます。鍵がデバイスから外に出ることはありません。
- **データ収集なし** — いずれの QoreX アプリにも分析、トラッキング、広告はありません。任意のアカウントサインインによって便利機能が追加されますが（[アカウント & Dashboard](/qorex/account-and-dashboard) を参照）、ウォレットがそれに依存することは決してありません。
- **統一された単一残高** — あなたの QOR は Native、EVM、SVM の各レーンをまたぐ 1 つの残高であり、QoreX はそれを単一の数値として表示します。
- **複数のリカバリー経路** — 24-word のリカバリーフレーズ（常時）、ガーディアンと 48-hour タイムロックを用いた任意のソーシャルリカバリー、任意の Legacy による相続、そして便利なマルチデバイスリンク。

## はじめに

- QoreX は初めてですか？ まずは [Getting Started](/qorex/getting-started) でウォレットを作成または復元しましょう。
- 次に、量子耐性 QOR の [送受信](/qorex/send-and-receive) を学びましょう。
- [Security & Recovery](/qorex/security-and-recovery) でセーフティネットを設定しましょう。
- デスクトップでは、[ブラウザ拡張機能](/qorex/browser-extension) をインストールしましょう。

:::note ダウンロード
iOS および Android 向けの QoreX は App Store と Google Play で、ブラウザ拡張機能は Chrome Web Store と Firefox Add-ons で公開されています。最新のダウンロードリンクは [qorechain.io](https://qorechain.io) でご確認ください。QoreX は必ず公式ストアの掲載ページからのみインストールしてください。
:::
