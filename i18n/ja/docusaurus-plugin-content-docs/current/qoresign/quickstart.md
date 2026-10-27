---
slug: /qoresign/quickstart
title: QoreSign クイックスタート
sidebar_label: クイックスタート
sidebar_position: 2
---

# クイックスタート

ここでは、アカウントの鍵を導出し、両方の鍵でネイティブレーンのトランザクションに署名してオフラインで検証し、さらに必要に応じて `qorechain-diana` テストネットへ送信するまでを説明します。Node.js 20 以降が必要です。対象は QoreSign 0.1.1 です。ステップ 4 以降のセクションでは、同じライブラリを Python と Go で使う方法と、コミット済みトランザクションの読み戻し方を示します。

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

`deriveCanonicalPqKey` は、QoreChain ウォレットがそのアカウント用に導出するのと同じ ML-DSA-87 鍵を返します。そのため、ウォレットが作成したアカウントにすでに登録されている鍵と一致します。詳しくは[鍵導出](/qoresign/guides/key-derivation)を参照してください。

## 3. 署名と検証 {#sign-and-verify}

ウォレットは通常、`bodyBytes`、`authInfoBytes`、チェーン ID、アカウント番号を dApp から受け取ります（Cosmos SDK の `signDirect` リクエストの `SignDoc`）。この例では、`cosmjs-types` を使ってそれらを組み立てます。

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

ご自身のテストネットアカウントを使用してください（スクリプトにメインネットのニーモニックは決して使わないでください）。アカウントにはテストネットの QOR と登録済みの ML-DSA-87 鍵が必要です。QoreChain ウォレットはアカウント作成時にこの鍵を登録します。QoreSign での登録方法は [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) に示されています。

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

アカウント番号、シーケンス、手数料を含む完全なフローは [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send) にあります。

## 5. 他の言語: メッセージに署名して検証する {#other-languages}

これらの例はオフラインで動作します。いずれも公開されている BIP-39 のテストフレーズ（アドレス `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`）から鍵を導出し、両方の鍵でメッセージに署名して検証し、`qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified` を出力します。このフレーズには決して入金しないでください。

### Python {#python}

0.1.1 の新機能です。Python 3.9 以降。macOS と Linux 用のホイールがあります（Windows 用ホイールはまだありません）。

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

これは、公開済みの 0.1.1 ホイールを使って macOS arm64 と Linux aarch64 で実行したものです。

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

Go の例は短くするためにエラーを無視しています。実際のコードでは確認してください。Rust、Swift、Kotlin も、それぞれの大文字小文字規則で同じ関数名を使い、同じ流れになります（[概要](/qoresign/overview#main-api)を参照）。Kotlin と Android のアーティファクトには Kotlin 2.3 以降のコンパイラが必要です。Kotlin 2.1 のプロジェクトでは、これらに対してコンパイルが失敗します。

## 6. コミット済みトランザクションを読む（トランザクションインスペクター） {#inspect}

0.1.1 の新機能、TypeScript 用です。読み取りのみで、何も送信しません。コミット済みトランザクションがどのように保護されていたかを報告します。メッセージ、署名者、手数料、従来型署名が検証できるか、ML-DSA-87 レイヤーの状態、セキュリティティア（`pqc`、`enrollment`、`shake`、`classical`）です。フィールドについては[トランザクションインスペクター](/qoresign/overview#inspector)を参照してください。

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

最近のテストネットトランザクション（たとえばフォーセットの送金）のハッシュを使ってください。その方法で実行したところ、`ML-DSA-87 key registered: true`、ティア `pqc`、`pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`、メッセージ `/cosmos.bank.v1beta1.MsgSend`、`EVM window: false false` が出力されました。`inspectTransaction` は、ネットワークが知らないハッシュに対して `undefined` を返します。テストネットのノードは履歴を削除するため、古いテストネットのトランザクションは見つからない場合があります。

## 次のステップ {#next}

- [Keplr 互換ウォレットにハイブリッド署名を追加する](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [QoreSign の概要](/qoresign/overview): すべてのパッケージ、主な API、制限、セキュリティに関する注意
