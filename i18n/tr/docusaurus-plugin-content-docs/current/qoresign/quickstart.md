---
slug: /qoresign/quickstart
title: QoreSign Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 2
---

# Hızlı Başlangıç

Bu bölüm, bir hesabın anahtarlarını türetmeyi, yerel hattaki bir işlemi iki anahtarla imzalayıp çevrimdışı doğrulamayı ve isteğe bağlı olarak `qorechain-diana` testnet'ine göndermeyi adım adım anlatır. Node.js 20 veya üzeri. QoreSign 0.1.1'i kapsar. 4. adımdan sonraki bölümler aynı kütüphaneyi Python ve Go'da gösterir ve işlenmiş bir işlemin nasıl geri okunacağını anlatır.

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

`deriveCanonicalPqKey`, QoreChain cüzdanlarının hesap için türettiği ML-DSA-87 anahtarının aynısını verir; dolayısıyla bu cüzdanların oluşturduğu hesaplar için zaten kayıtlı olan anahtarla eşleşir. Bkz. [Anahtar türetme](/qoresign/guides/key-derivation).

## 3. İmzalayın ve doğrulayın {#sign-and-verify}

Bir cüzdan genellikle `bodyBytes`, `authInfoBytes`, zincir kimliğini ve hesap numarasını dApp'ten alır (bir Cosmos SDK `signDirect` isteğinin `SignDoc`'u). Bu örnek için bunları `cosmjs-types` ile oluşturun:

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

Kendi testnet hesabınızı kullanın (betiklerde asla bir mainnet mnemonic'i kullanmayın). Hesabın testnet QOR'una ve kayıtlı bir ML-DSA-87 anahtarına ihtiyacı vardır; QoreChain cüzdanları bu anahtarı hesap oluşturulurken kaydeder ve [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) anahtarı QoreSign ile nasıl kaydedeceğinizi gösterir.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Hesap numarası, sıra numarası (sequence) ve ücret dahil tüm akış [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) içindedir.

## 5. Diğer diller: bir mesajı imzalayın ve doğrulayın {#other-languages}

Bu örnekler çevrimdışıdır. Her biri anahtarları herkese açık BIP-39 test ifadesinden türetir (adres `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), bir mesajı iki anahtarla imzalar ve doğrular, ardından `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified` yazdırır. Bu ifadeyi asla fonlamayın.

### Python {#python}

0.1.1 ile yeni. Python 3.9 veya üzeri; macOS ve Linux için wheel dosyaları (henüz Windows wheel'i yok).

```bash
pip install qorechain-qoresign
```

```python
import qoresign as qs

# Public BIP-39 test phrase: never send funds to it.
mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
classical = qs.derive_classical_key(mnemonic, qs.ClassicalKeyType.SECP256K1)  # m/44'/118'/0'/0/0
account = qs.address_from_public_key(classical.public_key, qs.ClassicalKeyType.SECP256K1)
pq_key = qs.derive_canonical_pq_key(mnemonic, account.bech32)

data = b"Hello from QoreSign"
sig = qs.sign_message("qorechain-diana", account.bech32, data, classical, pq_key=pq_key)
# Raises QoreSignError if either signature is invalid.
qs.verify_message("qorechain-diana", account.bech32, data, sig, pq_public_key=pq_key.public_key)
print(account.bech32, "verified")
```

Bu, macOS arm64 ve Linux aarch64 üzerinde yayımlanmış 0.1.1 wheel dosyalarıyla çalıştırıldı.

### Go {#go}

```bash
go get github.com/qorechain/qoresign/go@v0.1.1
```

```go
package main

import (
	"fmt"

	qoresign "github.com/qorechain/qoresign/go"
)

func main() {
	// Public BIP-39 test phrase: never send funds to it.
	mnemonic := "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
	classical, _ := qoresign.DeriveClassicalKey(mnemonic, qoresign.DeriveClassicalOptions{}) // m/44'/118'/0'/0/0
	account, _ := qoresign.AddressFromPublicKey(classical.PublicKey, qoresign.Secp256k1)
	pq, _ := qoresign.DeriveCanonicalPqKey(mnemonic, account.Bech32)

	data := []byte("Hello from QoreSign")
	sig, _ := qoresign.SignMessage(qoresign.SignMessageArgs{ChainID: "qorechain-diana",
		Signer: account.Bech32, Data: data, ClassicalKey: classical, PqKey: &pq})
	// Returns an error if either signature is invalid.
	err := qoresign.VerifyMessage(qoresign.VerifyMessageOptions{ChainID: "qorechain-diana",
		Signer: account.Bech32, Data: data, Signature: sig, PqPublicKey: pq.PublicKey})
	fmt.Println(account.Bech32, "verified:", err == nil)
}
```

Go örneği kısa kalması için hataları yok sayar; gerçek kodda bunları denetleyin. Rust, Swift ve Kotlin aynı akışı, kendi büyük/küçük harf düzenlerinde aynı işlev adlarıyla izler (bkz. [genel bakış](/qoresign/overview#main-api)). Kotlin ve Android yapıtları Kotlin 2.3 veya üzeri derleyiciyi gerektirir: Kotlin 2.1 kullanan bir proje bunlara karşı derlenemez.

## 6. İşlenmiş bir işlemi okuyun (işlem denetleyicisi) {#inspect}

0.1.1 ile yeni, TypeScript. Bu okur ve hiçbir şey göndermez. İşlenmiş bir işlemin nasıl korunduğunu bildirir: mesajları, imzalayanı, ücreti, klasik imzanın doğrulanıp doğrulanmadığı, ML-DSA-87 katmanının durumu ve güvenlik katmanı (`pqc`, `enrollment`, `shake` veya `classical`). Alanlar için bkz. [İşlem denetleyicisi](/qoresign/overview#inspector).

```js
// inspect.mjs
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

```bash
node inspect.mjs <txhash>
```

Yakın tarihli bir testnet işleminin hash'ini kullanın, örneğin bir musluk transferi. Bu şekilde çalıştırıldığında şunları yazdırdı: `ML-DSA-87 key registered: true`, katman `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, mesaj `/cosmos.bank.v1beta1.MsgSend` ve `EVM window: false false`. `inspectTransaction`, ağın tanımadığı bir hash için `undefined` döndürür. Testnet düğümleri geçmişi budadığı için eski testnet işlemleri kaybolmuş olabilir.

## Sonraki adımlar {#next}

- [Keplr uyumlu bir cüzdana hibrit imzalama ekleyin](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [QoreSign genel bakış](/qoresign/overview): tüm paketler, ana API, sınırlar ve güvenlik notları
