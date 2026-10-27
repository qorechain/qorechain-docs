---
slug: /qoresign/quickstart
title: QoreSign Quickstart
sidebar_label: Quickstart
sidebar_position: 2
---

# Quickstart

This walks through deriving an account's keys, signing a native-lane
transaction with both keys and verifying it, offline, then optionally sending it
to the `qorechain-diana` testnet. Node.js 20 or later. It covers QoreSign 0.1.1. The sections after step 4 show the same library in Python and Go, and how to read back a committed transaction.

## 1. Install {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Derive keys {#derive-keys}

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

`deriveCanonicalPqKey` gives the same ML-DSA-87 key QoreChain wallets derive for
the account, so it matches the key already registered for accounts they created.
See [Key derivation](/qoresign/guides/key-derivation).

## 3. Sign and verify {#sign-and-verify}

A wallet normally receives `bodyBytes`, `authInfoBytes`, the chain id and the
account number from the dApp (the `SignDoc` of a Cosmos SDK `signDirect`
request). For this example, build them with `cosmjs-types`:

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

## 4. Send on the testnet (optional) {#send-on-testnet}

Use your own testnet account (never a mainnet mnemonic in scripts). The account
needs testnet QOR and a registered ML-DSA-87 key; QoreChain wallets register it
when the account is created, and
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
shows how to register it with QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

The complete flow, including account number, sequence and fee, is in
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## 5. Other languages: sign and verify a message {#other-languages}

These examples are offline. Each derives the keys from the public BIP-39 test phrase (address `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), signs a message with both keys and verifies it, then prints `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. Never fund that phrase.

### Python {#python}

New in 0.1.1. Python 3.9 or later; wheels for macOS and Linux (no Windows wheel yet).

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

This was run against the published 0.1.1 wheels on macOS arm64 and Linux aarch64.

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

The Go example ignores errors to stay short; check them in real code. Rust, Swift and Kotlin follow the same flow with the same function names in their own casing (see the [overview](/qoresign/overview#main-api)). The Kotlin and Android artifacts need the Kotlin 2.3 or later compiler: a project on Kotlin 2.1 fails to compile against them.

## 6. Read a committed transaction (transaction inspector) {#inspect}

New in 0.1.1, TypeScript. This reads, and sends nothing. It reports how a committed transaction was protected: its messages, signer, fee, whether the classical signature verifies, the state of the ML-DSA-87 layer and the security tier (`pqc`, `enrollment`, `shake` or `classical`). See [Transaction inspector](/qoresign/overview#inspector) for the fields.

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

Use the hash of a recent testnet transaction, for example a faucet transfer. Run that way it printed `ML-DSA-87 key registered: true`, tier `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, the message `/cosmos.bank.v1beta1.MsgSend` and `EVM window: false false`. `inspectTransaction` returns `undefined` for a hash the network does not know. Old testnet transactions may be gone because testnet nodes prune history.

## Next {#next}

- [Add hybrid signing to a Keplr-compatible wallet](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [QoreSign overview](/qoresign/overview): all packages, the main API, limits and security notes
