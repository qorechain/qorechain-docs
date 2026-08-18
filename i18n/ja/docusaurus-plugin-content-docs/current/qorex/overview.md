---
slug: /qorex/overview
title: QoreX ウォレット
sidebar_label: 概要
sidebar_position: 1
---

# QoreX ウォレット

**QoreX** は、耐量子レイヤー1である **QoreChain**（メインネット `qorechain-vladi`）の公式 **非カストディアル** ウォレットです。秘密鍵は **お使いの端末上でのみ** 生成・保管され、QoreChain Association があなたの資産にアクセスすることは一切ありません。また、各アプリは **データを一切収集しません**。Native レーン上のすべての QOR 送金には **ハイブリッド耐量子署名**（ML-DSA-87、NIST FIPS-204、secp256k1 との組み合わせ）が付与されるため、従来型の攻撃者と量子攻撃者の双方から資産が保護されます。

QoreX は、連携して動作する2つの要素で構成されています。

- **ブラウザ拡張機能** — デスクトップ向けウォレットで、**Chrome、Firefox、Safari（macOS）で公開・提供中** です。単体で完結するウォレット（作成／インポート、QOR の保有と送金）であると同時に、あらゆるウェブサイトが QoreX を検出し、すべてのリクエストを明示的な承認に変えるためのコネクタでもあります。[ブラウザ拡張機能](/qorex/browser-extension)をご覧ください。
- **モバイルアプリ**（Android・iOS） — フル機能のウォレットです。作成／復元、耐量子 QOR の送受信、外部ネットワーク、ステーキング、ポートフォリオ、リカバリー、アプリ内 dApp ブラウザを備えています。Android は **Google Play** で、iOS は TestFlight で提供しています（提供状況は下記を参照）。

## 対応プラットフォーム

| 機能 | モバイルアプリ（Android・iOS） | ブラウザ拡張機能 |
|---|---|---|
| ウォレットの作成／インポート | ✅ | ✅（単体で利用可能） |
| QOR の送受信（耐量子） | ✅ | ✅（ポップアップから） |
| 外部ネットワーク（Ethereum、BNB Chain、Polygon、Arbitrum、Solana、Cosmos Hub、Osmosis、Celestia＋各種トークン） | ✅ | ✅（ポップアップから送金） |
| ステーキング、ポートフォリオ、Q-Day Scanner、リカバリー、Legacy | ✅ | — |
| dApp 接続 | ✅（アプリ内ブラウザ） | ✅（あらゆるウェブサイト） |
| アカウント（@handle、支払いリクエスト） | ✅ | — |
| 複数端末のリンク | ✅ | — |
| Dashboard とのペアリング | ✅ | ✅（接続＋送金提案、v0.1.5） |

## QoreX が他と違う理由

- **標準で耐量子** — Native レーンの QOR 送金には、常に ML-DSA-87 + secp256k1 のハイブリッド署名が付与されます。従来型の暗号方式が使われる場合（外部チェーン）は必ず明示され、黙って処理されることはありません。
- **真の非カストディアル** — 鍵は端末上で生成され、ハードウェアに裏付けられた保管領域（iOS の Secure Enclave、Android の StrongBox）または暗号化された保管領域（拡張機能）に保存されます。鍵が端末の外に出ることはありません。
- **データ収集なし** — QoreX の各アプリには、解析ツール、トラッキング、広告が一切ありません。任意のアカウントサインインによって便利な機能が追加されますが（[アカウントと Dashboard](/qorex/account-and-dashboard) を参照）、ウォレットがそれに依存することはありません。
- **統合された単一残高** — あなたの QOR は Native、EVM、SVM の各レーンをまたいだ1つの残高であり、QoreX はそれを単一の数値として表示します。
- **複数のリカバリー手段** — 24語のリカバリーフレーズ（常時利用可能）、ガーディアンと48時間のタイムロックを用いる任意のソーシャルリカバリー、任意の Legacy による継承、そして便利な複数端末リンクに対応しています。

## はじめる

- QoreX を初めて使う方は、[はじめに](/qorex/getting-started) からウォレットを作成または復元してください。
- 次に、耐量子 QOR の[送受信](/qorex/send-and-receive)の方法を学びましょう。
- [セキュリティとリカバリー](/qorex/security-and-recovery)で、万一に備えた保護策を設定してください。
- デスクトップでは、[ブラウザ拡張機能](/qorex/browser-extension)をインストールしてください。

:::note ダウンロードと提供状況
- **ブラウザ拡張機能** — 公開・提供中です。[Chrome Web Store、Firefox Add-ons、または Mac App Store（Safari）](/qorex/browser-extension#install)からインストールしてください。
- **Android アプリ** — Google Play で提供中: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS アプリ** — **TestFlight** 経由でテスト用に提供中: https://testflight.apple.com/join/Xa9D7vgR — App Store 版は現在審査中です。

QoreX は必ず公式ストアの掲載ページからインストールしてください。
:::
