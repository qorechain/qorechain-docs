---
slug: /qoresign/guides/keplr-compatible-wallets
title: Keplr 互換ウォレットにハイブリッド署名を追加する
sidebar_label: Keplr 互換ウォレット
sidebar_position: 1
---

# Keplr 互換ウォレットにハイブリッド署名を追加する

QoreChain のネイティブレーンは、登録済みの ML-DSA-87 鍵を持つアカウントからの
トランザクションを、その鍵の署名も含まれていない限り拒否します。Keplr 互換
ウォレット（Keplr、Leap、Cosmostation など、`signDirect` を実装するもの）は
secp256k1 の部分を生成しますが、ML-DSA-87 の部分は耐量子鍵を保持する側が
用意する必要があります。

追加する方法は 2 つあります。

## オプション A: ウォレットが両方の鍵を保持する（QoreSign） {#option-a}

ウォレットは secp256k1 鍵と並べて ML-DSA-87 鍵を導出し、署名の前にそのレイヤーを
追加します。

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

ユーザーの安全を守るためのルール:

- 署名の前に、`bodyBytes` / `authInfoBytes` に含まれるメッセージと手数料をユーザー
  に表示してください。これは他の `signDirect` リクエストと同じです。ML-DSA-87 署名
  は手数料もカバーします。
- dApp がすでに PQC レイヤーを含むボディを送ってきた場合は、従来型の署名を追加する
  前に `assertPqLayerMatchesRegisteredKey`（`@qorechain/qoresign/network` 由来）で
  検証してください。検証に通らないレイヤーは何も保護しません。
- 鍵はアカウントごとに一度だけ、`classicalOnly` モードで署名した
  `buildRegisterPqKeyMessage` によって登録します
  （[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  と[登録](/qoresign/spec/hybrid-signing-v1#registration)を参照）。
- ブロードキャスト後は、コミットされたトランザクションを読み戻して
  `evaluateLayerState` を呼び出してください。`downgraded` は、レイヤーがチェーンに
  到達しなかったことを意味します。

## オプション B: dApp が耐量子鍵を保持する（`@qorechain/wallet-adapter`） {#option-b}

ウォレットを変更できない場合、dApp は
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter)
を使用できます。これはボディに ML-DSA-87 レイヤーを追加したうえで、変更されていない
ウォレットに通常の `signDirect` 署名を求めます。この場合、耐量子鍵はウォレットでは
なく、dApp またはコンパニオン署名者側に置かれます。QoreSign とアダプターは、同じ鍵
に対して同一のバイト列を生成します。

## Keplr へのチェーン登録 {#chain-registration}

公開されているチェーンディスクリプターを使い、`experimentalSuggestChain` でチェーンを
提案します。チェーン ID は `qorechain-vladi`（メインネット）と `qorechain-diana`
（テストネット）、bech32 プレフィックスは `qor`、コインタイプは `118`、手数料デノム
は `uqor`（小数 6 桁）、最低ガス価格は `0.1` です。公開エンドポイント:
`https://rpc.qore.host` と `https://api.qore.host`（メインネット）、
`https://rpc-testnet.qore.host` と `https://api-testnet.qore.host`（テストネット）。
