---
slug: /qoresign/vectors
title: QoreSign テストベクター
sidebar_label: テストベクター
sidebar_position: 5
---

# テストベクター

[`qoresign-v1.json`](https://github.com/qorechain/qoresign/blob/main/vectors/qoresign-v1.json)
は TypeScript 実装から生成され（`pnpm build && pnpm vectors`）、TypeScript、
Rust、Go、Swift、Kotlin のテストスイートで検証されます。このファイルの変更は
ワイヤーフォーマットの変更を意味します。編集せず、新しいバージョンの新しい
ファイルを追加してください。

すべての鍵は、公開されている BIP-39 テスト用ニーモニック（`abandon ... about`）
から導出されています。これらのアカウントには決して資金を送らないでください。

## フィールド {#fields}

| フィールド | 内容 |
|---|---|
| `accounts` | `secp256k1`（`m/44'/118'/0'/0/0`）および `eth_secp256k1`（`m/44'/60'/0'/0/0`）アカウントの従来型鍵とアドレス |
| `canonical` | アドレスごとの正規 ML-DSA-87 公開鍵（[鍵導出](/qoresign/spec/hd-derivation-draft#canonical-derivation)） |
| `hd`, `hdRejected` | 階層導出ドラフト: パスごとの公開鍵と、拒否されなければならないパス（[鍵導出](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)） |
| `hybridTx` | `TxBody` と `AuthInfo`、アカウント番号、チェーン ID と、sign-bytes `v2` および `v1` についての期待される sign-bytes、ML-DSA-87 署名、最終的なボディ、secp256k1 署名、`TxRaw`（[ハイブリッド署名](/qoresign/spec/hybrid-signing-v1)） |
| `proofOfPossession` | 所有証明のメッセージと署名（[登録](/qoresign/spec/hybrid-signing-v1#registration)） |
| `registerMessage` | エンコード済みの `MsgRegisterPQCKeyV2` |
| `message` | 任意メッセージの署名: データ、ADR-36 および ML-DSA-87 の sign-bytes、署名（[メッセージ署名](/qoresign/spec/message-signing-v1)） |
| `siwq` | サインインのフィールド、レンダリングされたメッセージ、ADR-36 および ML-DSA-87 の sign-bytes、署名、および検証が成功する時刻（[Sign In With QoreChain](/qoresign/spec/siwq-v1)） |

## エンコーディング {#encoding}

すべてのバイト列は小文字の 16 進数です。ML-DSA-87 署名は決定的です
（FIPS 204、`rnd` = 32 個のゼロバイト）。secp256k1 署名は RFC 6979 と low-S を
使用します。
