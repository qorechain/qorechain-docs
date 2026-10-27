---
slug: /qoresign/spec/hybrid-signing-v1
title: ハイブリッドトランザクション署名 v1
sidebar_label: ハイブリッド署名 v1
sidebar_position: 1
---

# QoreChain のハイブリッドトランザクション署名、バージョン 1

ステータス: 安定。`qorechain-vladi`（メインネット）と `qorechain-diana`（テストネット）
のネイティブ（Cosmos SDK）レーンに適用されます。ソース:
[`spec/hybrid-signing-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/hybrid-signing-v1.md)。

## 概要 {#summary}

ハイブリッドトランザクションは、同じアカウントによって 2 回署名された通常の
Cosmos SDK `TxRaw` です。

1. ML-DSA-87（FIPS 204）署名。トランザクションボディ内に、拡張オプション
   `/qorechain.pqc.v1.PQCHybridSignature` として格納されます。
2. 最終的なボディに対する secp256k1 の `SIGN_MODE_DIRECT` 署名。
   `TxRaw.signatures` に格納されます。

ネットワークは両方を検証します。ネイティブレーンでは、ネットワークはデフォルトで
ML-DSA-87 署名を必須とします（`HybridSignatureMode = Required`、チェーン全体の
パラメータ）。アカウントの ML-DSA-87 鍵を登録・維持するメッセージなど、ごく一部の
免除メッセージを除き、これがないトランザクションは拒否されます。

## 鍵 {#keys}

| 鍵 | アルゴリズム | サイズ |
|---|---|---|
| 従来型 | secp256k1（`secp256k1` アカウント: アドレス = RIPEMD160(SHA256(圧縮鍵))、`eth_secp256k1` アカウント: アドレス = KECCAK256(非圧縮鍵) の末尾 20 バイト） | 33 バイトの圧縮公開鍵 |
| 耐量子 | ML-DSA-87、アルゴリズム ID `1` | 公開鍵 2592 バイト、署名 4627 バイト |

ハイブリッドトランザクションが検証されるようになる前に、ML-DSA-87 公開鍵を
`MsgRegisterPQCKeyV2` でアカウントに登録する必要があります（[登録](#registration)を
参照）。あるいは、トランザクションが拡張（フィールド 3）に公開鍵を埋め込んで、初回
使用時に登録することもできます。

## 拡張 {#extension}

```protobuf
package qorechain.pqc.v1;

message PQCHybridSignature {
  uint32 algorithm_id   = 1; // 1 = ML-DSA-87
  bytes  pqc_signature  = 2; // 4627 bytes
  bytes  pqc_public_key = 3; // optional, 2592 bytes
}
```

これは `TxBody.extension_options`（フィールド 1023）に `google.protobuf.Any` として
追加されます。`type_url = "/qorechain.pqc.v1.PQCHybridSignature"` で、protobuf
エンコードされたものが `value` です。ボディには、このような拡張をちょうど 1 つだけ
含める必要があります。

## Sign-bytes {#sign-bytes}

`B0` を、PQC 拡張を**含まない** `TxBody` の正規 protobuf エンコーディング（他のすべての
フィールドと拡張を、順序を保ったまま保持）、`A` をブロードキャストされるとおりの
`AuthInfo` バイト列とします。`BE32`/`BE64` はビッグエンディアンの符号なし長さです。

```
v1 = BE32(len(B0)) || B0 || BE32(len(A)) || A
v2 = "qorechain-pqc-hybrid-v2" || BE64(len(chain_id)) || chain_id || v1
```

ネットワークは、ある高さにおいてちょうど 1 つの形式を検証します。両方の公開ネット
ワークは、`v3.1.98` / `v3.2.0` アップグレード以降 `v2` を検証します（メインネット:
`v3.2.0` は高さ 2,981,742）。それ以外のネットワークは、ジェネシスから `v2` を検証
します。`v1` は、それらの高さより前に作成された署名を再現する場合にのみ必要です。
クライアントは、`/cosmos/upgrade/v1beta1/applied_plan/{v3.1.98|v3.2.0}` を読み取る
ことで、ノードがどちらの形式を検証するかを問い合わせられます。

ML-DSA-87 署名は `ML-DSA.Sign(sk, signBytes, ctx = "")` です。ネットワークは決定的
な方式とヘッジ方式の両方を受け付けます。QoreSign はデフォルトで決定的に署名する
（FIPS 204、`rnd` = 32 個のゼロバイト）ため、署名は公開されているベクターに対して
再現可能です。

## 操作の順序 {#order-of-operations}

1. `B0` と `A` をエンコードします（この時点で手数料、ガスリミット、署名者情報が確定
   します）。
2. sign-bytes と ML-DSA-87 署名を計算します。
3. 拡張を、正規のフィールド順序で `B0` に追加し（既存の `extension_options` の後、
   `non_critical_extension_options` の前）、最終的なボディ `B` を得ます。
4. `SignDoc { body_bytes = B, auth_info_bytes = A, chain_id, account_number }` に
   secp256k1 で署名します。`secp256k1` アカウントは SHA-256、`eth_secp256k1`
   アカウントは KECCAK-256 を使用し、64 バイトの `r || s`、low-S とします。
5. `TxRaw { B, A, [classical signature] }` をブロードキャストします。

従来型の署名は拡張をカバーします。ML-DSA-87 署名は、ボディの他のすべてと認証情報
（手数料を含む）をカバーします。どちらの署名も、自身には署名しません。

## 登録 {#registration}

`MsgRegisterPQCKeyV2`（型 URL `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`）:

| フィールド | 番号 | 値 |
|---|---|---|
| `sender` | 1 | `qor1` アカウント |
| `public_key` | 2 | ML-DSA-87 公開鍵 |
| `algorithm_id` | 3 | `1` |
| `ecdsa_pubkey` | 4 | アカウントの 33 バイト圧縮 secp256k1 鍵。`sender` に導出される必要があります |
| `key_type` | 5 | `hybrid` |
| `proof_of_possession` | 6 | 下記のメッセージに対する ML-DSA-87 署名 |

```
"qorechain-pqc-pop-v1|" + chain_id + "|" + algorithm_id + "|" + sender + "|" + lowercase_hex(public_key)
```

登録トランザクション自体は、従来型の鍵のみで署名されます。`t1` 部分（バイト 32 以降）
がすべてゼロの公開鍵は、その署名を偽造できるため、拒否されます。

## その他のレーン {#other-lanes}

- EVM レーン: Ethereum トランザクションには拡張用のフィールドがないため、ML-DSA-87
  署名を含みません。登録済みの ML-DSA-87 鍵を持つアカウントは、ネイティブレーンから
  期限付きの EVM 認可ウィンドウ（有効期限の高さ、最大トランザクション数、最大値）を
  開けます。
  [EVM ウォレット: 量子対応モード](/qoresign/guides/evm-quantum-ready)を参照して
  ください。
- SVM レーン: ネットワークではまだ利用できません。

## テストベクター {#test-vectors}

`vectors/qoresign-v1.json` の `hybridTx` フィールドは、ボディ、認証情報、アカウント
番号に加え、両バージョンについての期待される sign-bytes、署名、最終ボディ、`TxRaw`
を提供します。[テストベクター](/qoresign/vectors)を参照してください。
