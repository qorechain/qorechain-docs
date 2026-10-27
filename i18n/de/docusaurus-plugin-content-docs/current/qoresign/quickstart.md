---
slug: /qoresign/quickstart
title: QoreSign Quickstart
sidebar_label: Quickstart
sidebar_position: 2
---

# Quickstart

Diese Anleitung zeigt, wie Sie die Schlüssel eines Kontos ableiten, eine
Transaktion der nativen Lane mit beiden Schlüsseln signieren und offline prüfen
und sie anschließend optional an das Testnet `qorechain-diana` senden.
Node.js 20 oder höher.

## 1. Installation {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Schlüssel ableiten {#derive-keys}

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

`deriveCanonicalPqKey` liefert denselben ML-DSA-87-Schlüssel, den QoreChain-Wallets
für das Konto ableiten. Er entspricht also dem Schlüssel, der für von ihnen
erstellte Konten bereits registriert ist. Siehe
[Schlüsselableitung](/qoresign/guides/key-derivation).

## 3. Signieren und prüfen {#sign-and-verify}

Eine Wallet erhält `bodyBytes`, `authInfoBytes`, die Chain-ID und die
Kontonummer normalerweise von der dApp (das `SignDoc` einer
`signDirect`-Anfrage des Cosmos SDK). Für dieses Beispiel bauen Sie sie mit
`cosmjs-types`:

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

## 4. Auf dem Testnet senden (optional) {#send-on-testnet}

Verwenden Sie Ihr eigenes Testnet-Konto (niemals die Mnemonic eines
Mainnet-Kontos in Skripten). Das Konto benötigt Testnet-QOR und einen
registrierten ML-DSA-87-Schlüssel; QoreChain-Wallets registrieren ihn bei der
Erstellung des Kontos, und
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
zeigt, wie Sie ihn mit QoreSign registrieren.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Den vollständigen Ablauf, einschließlich Kontonummer, Sequenz und Gebühr, finden
Sie in
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## Weiter {#next}

- [Hybrides Signieren in eine Keplr-kompatible Wallet einbauen](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
