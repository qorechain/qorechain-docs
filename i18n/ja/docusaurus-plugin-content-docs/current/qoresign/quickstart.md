---
slug: /qoresign/quickstart
title: QoreSign クイックスタート
sidebar_label: クイックスタート
sidebar_position: 2
---

# クイックスタート

ここでは、アカウントの鍵を導出し、両方の鍵でネイティブレーンのトランザクションに
署名してオフラインで検証し、さらに必要に応じて `qorechain-diana` テストネットへ
送信するまでを説明します。Node.js 20 以降が必要です。

## 1. インストール {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. 鍵を導出する {#derive-keys}

```js
// keys.mjs
import { addressFromPublicKey, deriveCanonicalPqKey, deriveClassicalKey } from "@qorechain/qoresign";

// The public BIP-39 test phrase. Never use it for real funds.
const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

const classical = deriveClassicalKey({ mnemonic }); // m/44'/118'/0'/0/0
const { bech32 } = addressFromPublicKey(classical.publicKey, "secp256k1");
const pq = deriveCanonicalPqKey({ mnemonic, address: bech32 });

console.log(bech32, pq.publicKey.length); // qor1..., 2592
```

`deriveCanonicalPqKey` は、QoreChain ウォレットがそのアカウント用に導出するのと
同じ ML-DSA-87 鍵を返します。そのため、ウォレットが作成したアカウントにすでに
登録されている鍵と一致します。詳しくは[鍵導出](/qoresign/guides/key-derivation)を
参照してください。

## 3. 署名と検証 {#sign-and-verify}

ウォレットは通常、`bodyBytes`、`authInfoBytes`、チェーン ID、アカウント番号を
dApp から受け取ります（Cosmos SDK の `signDirect` リクエストの `SignDoc`）。
この例では、`cosmjs-types` を使ってそれらを組み立てます。

```bash
npm install cosmjs-types @cosmjs/proto-signing @cosmjs/amino
```

```js
// sign.mjs
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { encodePubkey, makeAuthInfoBytes } from "@cosmjs/proto-signing";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const classical = deriveClassicalKey({ mnemonic });
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pq = deriveCanonicalPqKey({ mnemonic, address });

const bodyBytes = TxBody.encode(
  TxBody.fromPartial({
    messages: [
      {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: MsgSend.encode({ fromAddress: address, toAddress: address, amount: [{ denom: "uqor", amount: "1" }] }).finish(),
      },
    ],
  }),
).finish();
const authInfoBytes = makeAuthInfoBytes(
  [{ pubkey: encodePubkey(encodeSecp256k1Pubkey(classical.publicKey)), sequence: 0 }],
  [{ denom: "uqor", amount: "20000" }],
  200000,
  undefined,
  undefined,
  1, // SIGN_MODE_DIRECT
);

const chainId = "qorechain-diana";
const signed = signHybrid({ chainId, accountNumber: 0, bodyBytes, authInfoBytes, classicalKey: classical, pqKey: pq });

const result = verifyHybridTx({
  txBytes: signed.txBytes,
  chainId,
  accountNumber: 0,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pq.publicKey,
});
console.log(result); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: 'v2' } }
```

```bash
node sign.mjs
```

## 4. テストネットで送信する（任意） {#send-on-testnet}

ご自身のテストネットアカウントを使用してください（スクリプトにメインネットの
ニーモニックは決して使わないでください）。アカウントにはテストネットの QOR と
登録済みの ML-DSA-87 鍵が必要です。QoreChain ウォレットはアカウント作成時に
この鍵を登録します。QoreSign での登録方法は
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
に示されています。

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

アカウント番号、シーケンス、手数料を含む完全なフローは
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
にあります。

## 次のステップ {#next}

- [Keplr 互換ウォレットにハイブリッド署名を追加する](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
