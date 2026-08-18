---
slug: /qorex/overview
title: QoreX Wallet
sidebar_label: 概要
sidebar_position: 1
---

# QoreX Wallet

**QoreX** は、量子安全なレイヤー1である **QoreChain**（メインネット `qorechain-vladi`）の公式 **ノンカストディアル** ウォレットです。秘密鍵は **お使いのデバイス上でのみ** 生成・保管され、QoreChain Association があなたの資金にアクセスすることは一切なく、アプリは **データを収集しません**。Native レーンでのすべての QOR 送金には **ハイブリッド耐量子署名**（ML-DSA-87、NIST FIPS-204、secp256k1 と組み合わせ）が付与されるため、資金は古典的な攻撃者と量子攻撃者の両方から保護されます。

QoreX は連携して動作する 2 つの要素で構成されています。

- **ブラウザー拡張機能** — デスクトップ向けウォレットで、**Chrome、Firefox、Safari（macOS）で公開・提供中** です。単体で使えるウォレット（作成／インポート、QOR の保有と送金）であると同時に、あらゆるウェブサイトが QoreX を検出し、すべてのリクエストを明示的な承認へと変えるためのコネクターでもあります。[ブラウザー拡張機能](/qorex/browser-extension) を参照してください。
- **モバイルアプリ**（Android および iOS）— フル機能のウォレットです。作成／復元、量子安全な QOR の送受信、外部ネットワーク、ステーキング、ポートフォリオ、リカバリー、そしてアプリ内 dApp ブラウザーを備えています。Android は **Google Play で提供中**、iOS は TestFlight で提供しています（以下の提供状況を参照）。

## プラットフォーム別の提供状況

| 機能 | モバイルアプリ（Android および iOS） | ブラウザー拡張機能 |
|---|---|---|
| ウォレットの作成／インポート | ✅ | ✅（単体で利用可能） |
| QOR の送受信（耐量子） | ✅ | ✅（ポップアップから） |
| 外部ネットワーク（Ethereum、BNB Chain、Polygon、Arbitrum、Solana、Cosmos Hub、Osmosis、Celestia とトークン） | ✅ | ✅（ポップアップから送信） |
| ステーキング、ポートフォリオ、Q-Day Scanner、リカバリー、Legacy | ✅ | — |
| dApp 接続 | ✅（アプリ内ブラウザー） | ✅（あらゆるウェブサイト） |
| アカウント（@handle、支払いリクエスト） | ✅ | — |
| 複数デバイスの連携 | ✅ | — |
| Dashboard とのペアリング | ✅ | ✅（接続 + 提案された送金、v0.1.5） |

## QoreX が他と違う理由

- **標準で量子安全** — Native レーンの QOR 送金には常に ML-DSA-87 + secp256k1 のハイブリッド署名が付与されます。古典的な署名になるもの（外部チェーン）は明確に表示され、黙って処理されることはありません。
- **真のノンカストディアル** — 鍵はデバイス上で生成され、ハードウェアで保護された保管領域（iOS では Secure Enclave、Android では StrongBox）または暗号化された保管領域（拡張機能）に保存されます。鍵がデバイスから出ることはありません。
- **データ収集なし** — QoreX のいずれのアプリにも、解析、トラッキング、広告はありません。任意のアカウントサインインを行うと便利な機能が追加されますが（[アカウントと Dashboard](/qorex/account-and-dashboard) を参照）、ウォレットがそれに依存することはありません。
- **統合された 1 つの残高** — あなたの QOR は Native、EVM、SVM の各レーンをまたいで 1 つの残高となり、QoreX はそれを単一の数値として表示します。
- **複数のリカバリー手段** — 24 語のリカバリーフレーズ（常に利用可能）、ガーディアンと 48 時間のタイムロックを用いた任意のソーシャルリカバリー、任意の Legacy 相続機能、そして便利な複数デバイス連携。

## はじめる

- QoreX を初めて使いますか？ まずは [はじめに](/qorex/getting-started) でウォレットを作成または復元しましょう。
- 次に、量子安全な QOR の [送受信](/qorex/send-and-receive) を学びましょう。
- [セキュリティとリカバリー](/qorex/security-and-recovery) で安全網を設定しましょう。
- デスクトップでは [ブラウザー拡張機能](/qorex/browser-extension) をインストールしてください。

:::note ダウンロードと提供状況
- **ブラウザー拡張機能** — 公開・提供中です。[Chrome Web Store、Firefox Add-ons、または Mac App Store（Safari）](/qorex/browser-extension#install) からインストールしてください。
- **Android アプリ** — Google Play で提供中: https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS アプリ** — 試用をご希望の場合は **TestFlight** 経由でテスト版をご利用いただけます。App Store 版は現在審査中です。最新の招待リンクは [qorechain.io](https://qorechain.io) で確認できます。

QoreX は公式ストアの掲載ページからのみインストールしてください。
:::
