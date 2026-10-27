---
slug: /qoresign/guides/key-derivation
title: 鍵導出
sidebar_label: 鍵導出
sidebar_position: 4
---

# 鍵導出

QoreSign は、BIP-39 ニーモニックから ML-DSA-87 鍵を得る方法を 2 つ提供します。
完全な定義: [ML-DSA-87 鍵導出](/qoresign/spec/hd-derivation-draft)。

| | `deriveCanonicalPqKey` | `deriveHdPqKey`（ドラフト） |
|---|---|---|
| 入力 | ニーモニック + アカウントアドレス | ニーモニック（またはシード）+ ハードンドパス |
| アドレスへの紐付け | あり | なし |
| QoreChain ウォレットと同じ鍵 | はい | いいえ |
| チェーン上での登録の要否 | 未登録の場合のみ | 常に必要 |
| 安定性 | 安定 | 確定までに変更される可能性あり |

アドレスに依存しない耐量子鍵を 1 つのシードから複数必要とする場合を除き、
[正規導出](/qoresign/spec/hd-derivation-draft#canonical-derivation)を使用して
ください（[階層ドラフト](/qoresign/spec/hd-derivation-draft#hierarchical-derivation)）。

## ニーモニックの形式 {#mnemonic-form}

ニーモニックは正規形式（小文字の単語、単一のスペース）である必要があります。
QoreSign は、他の表記を正規化せずに拒否します。フレーズは導出の入力の一部であり、
表記が異なると別の鍵になってしまうためです。

## ニーモニックを持たないウォレット {#without-mnemonic}

ニーモニックを持たないウォレット（たとえば、ハードウェアに鍵が保管されている場合）
は、正規導出を使用できません。そのようなウォレットは、
`pqKeyFromSeed(randomBytes(32))` でランダムな ML-DSA-87 鍵を生成するか、HD ドラフト
を使用して、その鍵を登録できます。
