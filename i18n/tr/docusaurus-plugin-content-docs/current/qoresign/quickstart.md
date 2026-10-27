---
slug: /qoresign/quickstart
title: QoreSign Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 2
---

# Hızlı Başlangıç

Bu bölüm, bir hesabın anahtarlarını türetmeyi, yerel hattaki bir işlemi iki
anahtarla imzalayıp çevrimdışı doğrulamayı ve isteğe bağlı olarak
`qorechain-diana` testnet'ine göndermeyi adım adım anlatır. Node.js 20 veya üzeri.

## 1. Kurulum {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Anahtarları türetin {#derive-keys}

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

`deriveCanonicalPqKey`, QoreChain cüzdanlarının hesap için türettiği ML-DSA-87
anahtarının aynısını verir; dolayısıyla bu cüzdanların oluşturduğu hesaplar için
zaten kayıtlı olan anahtarla eşleşir. Bkz. [Anahtar türetme](/qoresign/guides/key-derivation).

## 3. İmzalayın ve doğrulayın {#sign-and-verify}

Bir cüzdan genellikle `bodyBytes`, `authInfoBytes`, zincir kimliğini ve hesap
numarasını dApp'ten alır (bir Cosmos SDK `signDirect` isteğinin `SignDoc`'u).
Bu örnek için bunları `cosmjs-types` ile oluşturun:

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

## 4. Testnet'te gönderin (isteğe bağlı) {#send-on-testnet}

Kendi testnet hesabınızı kullanın (betiklerde asla bir mainnet mnemonic'i
kullanmayın). Hesabın testnet QOR'una ve kayıtlı bir ML-DSA-87 anahtarına
ihtiyacı vardır; QoreChain cüzdanları bu anahtarı hesap oluşturulurken kaydeder
ve
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
anahtarı QoreSign ile nasıl kaydedeceğinizi gösterir.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Hesap numarası, sıra numarası (sequence) ve ücret dahil tüm akış
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
içindedir.

## Sonraki adımlar {#next}

- [Keplr uyumlu bir cüzdana hibrit imzalama ekleyin](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
