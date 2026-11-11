---
slug: /qoresign/spec/siwq-v1
title: Sign In With QoreChain v1
sidebar_label: Sign In With QoreChain v1
sidebar_position: 2
---

# Sign In With QoreChain（SIWQ）、バージョン 1

ステータス: メッセージフォーマットのバージョン 1 について安定。ソース:
[`spec/siwq-v1.md`](https://github.com/qorechain/qoresign/blob/main/spec/siwq-v1.md)。

SIWQ により、QoreChain アカウントは、自身の鍵を制御していることをオフチェーンの
サービスに証明できます。メッセージは
[EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) と Sign In With Solana の
レイアウトに従い、QoreChain のアドレスとチェーン ID に合わせて調整されています。
署名は 2 つの部分から成ります。Keplr 互換ウォレットが `signArbitrary` で生成できる
ADR-36 secp256k1 署名と、アカウントの登録済み耐量子鍵による ML-DSA-87（FIPS 204）
署名です。

## メッセージ {#message}

```
${scheme://}${domain} wants you to sign in with your QoreChain account:
${address}

${statement}

URI: ${uri}
Version: 1
Chain ID: ${chain-id}
Nonce: ${nonce}
Issued At: ${issued-at}
Expiration Time: ${expiration-time}
Not Before: ${not-before}
Request ID: ${request-id}
Resources:
- ${resources[0]}
- ${resources[1]}
...
```

- 行は単一の `\n` で区切られ、末尾の改行はありません。
- `scheme://` は省略可能です。`domain` は、要求元サイトの RFC 3986 オーソリティ
  （ホストと、省略可能なポート）です。
- `address` は、アカウントの `qor1` bech32 形式です。
- ステートメント行は省略可能です。省略した場合、EIP-4361 と同様に、アドレスの後に
  空行が 2 行続きます。
- `Version` は `1` です。`Chain ID` は、`qorechain-vladi` のような QoreChain の
  チェーン ID です。
- `Nonce` は、サーバーが選ぶ 8 文字以上の英数字で、使い捨てです。
- タイムスタンプは、[タイムスタンプ](#timestamps)に記載された厳密な RFC 3339 文法に従います。
- `Expiration Time`、`Not Before`、`Request ID`、`Resources` は省略可能で、この順序で
  現れます。

検証者は、パースしたフィールドを再レンダリングし、バイト単位で一致しないメッセージを
拒否しなければなりません。

## 署名 {#signatures}

```json
{
  "signatureType": "ml-dsa-87-hybrid",
  "classical": { "keyType": "secp256k1", "publicKey": "<base64>", "signature": "<base64>" },
  "pq": { "algorithmId": 1, "signature": "<base64>" }
}
```

### 従来型の部分（ADR-36） {#classical-part}

アカウントの secp256k1 鍵が、キーをソートし空白を含めずにシリアライズした下記の
amino JSON 署名ドキュメントに署名します。`data` は UTF-8 メッセージの base64、
`signer` は `qor1` アドレスです。

```json
{"account_number":"0","chain_id":"","fee":{"amount":[],"gas":"0"},"memo":"","msgs":[{"type":"sign/MsgSignData","value":{"data":"...","signer":"qor1..."}}],"sequence":"0"}
```

ダイジェストは、`secp256k1` アカウントでは SHA-256、`eth_secp256k1` アカウントでは
KECCAK-256 です。署名は 64 バイトの `r || s`、low-S です。`publicKey` は 33 バイトの
圧縮鍵で、`keyType` のもとで `address` に導出される必要があります。

### 耐量子の部分 {#post-quantum-part}

```
pq.signature = ML-DSA-87.Sign(sk, UTF-8("qorechain-siwq-v1|" + message))
```

ドメインプレフィックスにより、サインイン署名がトランザクション署名として使われること
も、その逆も防がれます（[ドメイン分離](/qoresign/spec/message-signing-v1#domain-separation)
を参照）。

`pq` の部分がない場合、`signatureType` は `secp256k1` になります。検証者は、従来型
のみのアカウントを明示的に受け入れる場合を除き、そのようなサインインを拒否すべきです。

## タイムスタンプ {#timestamps}

`Issued At`、`Expiration Time`、`Not Before` は、1 つの厳密な RFC 3339 文法を使います。メッセージの作成、パース、署名、検証のすべてで同じ規則が適用されます。

- 時は 00 から 23、分と秒は 00 から 59 です。`24:00:00` とうるう秒（秒が 60）は拒否されます。
- 実在する暦の日付であること。
- 大文字の `Z`、または 00:00 から 23:59 の範囲内でコロンを付けたオフセット（コロンのないオフセットは拒否されます）。
- 区切りは `T` です。空白や小文字の `t`、`z` は使えません。

文法に合わないタイムスタンプは `SIWQ_MALFORMED` で失敗します。共有ベクターは `vectors/siwq-timestamps-v1.json` にあります。QoreSign 0.2.0 以降、`parseSiwqTimestamp`（TypeScript）と `ParseSiwqTimestamp`（Go）は、この文法に従うタイムスタンプの Unix ミリ秒を返します。

## 最大経過時間 {#max-age}

サーバーは `Expiration Time` を必須とし、発行するメッセージには必ず設定してください。`Expiration Time` のないメッセージは、`Issued At` から数えて 600 秒（10 分）を超えると `SIWQ_EXPIRED` で拒否されます。QoreSign 0.2.0 以降は、すべてのバインディングでこの経過時間を設定できます。

| バインディング | オプション |
|---|---|
| TypeScript | `maxAgeSeconds` |
| Python | `max_age_seconds` |
| Rust | `VerifySiwqArgs::max_age_seconds` |
| Go | `VerifySiwqOptions.MaxAge` |
| Swift | `maxAgeSeconds` |
| Kotlin | `maxAgeSeconds` |

0 または負の値は `INVALID_ARGUMENT` で失敗します。

## 検証 {#verification}

検証者は、次の順序で確認しなければなりません。

1. メッセージがパースでき、正規形式であること。
2. `domain` が、リクエストの送信元ドメインと等しいこと。
3. `nonce` が、サーバーがこのセッション用に発行したナンスと等しく、そのナンスが以前
   に使用されていないこと。
4. `Chain ID` が期待されるネットワークであること。
5. `Expiration Time` が未来であり、`Not Before` と `Issued At` が未来でないこと
   （わずかな時計のずれは許容）。`Expiration Time` のないメッセージは、`Issued At` から数えて 600 秒（10 分）を超えると拒否されます。検証者はこの最大経過時間を設定できます（[最大経過時間](#max-age)を参照）。
6. 従来型の公開鍵が `address` に導出され、ADR-36 署名が検証されること。
7. ML-DSA-87 署名が、クライアントから提供された鍵ではなく、`address` に対して
   **チェーン上に登録されている**公開鍵（`/qorechain/pqc/v1/account/{address}`）
   のもとで検証されること。

## テストベクター {#test-vectors}

`vectors/qoresign-v1.json` の `siwq` フィールドです。
[テストベクター](/qoresign/vectors)を参照してください。
