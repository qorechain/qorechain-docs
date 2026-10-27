---
slug: /qoresign/quickstart
title: Démarrage rapide de QoreSign
sidebar_label: Démarrage rapide
sidebar_position: 2
---

# Démarrage rapide

Ce guide montre comment dériver les clés d'un compte, signer une transaction de la
voie native avec les deux clés et la vérifier hors ligne, puis, en option, l'envoyer
sur le testnet `qorechain-diana`. Node.js 20 ou version ultérieure.

## 1. Installer {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Dériver les clés {#derive-keys}

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

`deriveCanonicalPqKey` fournit la même clé ML-DSA-87 que celle que dérivent les
portefeuilles QoreChain pour le compte ; elle correspond donc à la clé déjà
enregistrée pour les comptes qu'ils ont créés. Voir
[Dérivation de clés](/qoresign/guides/key-derivation).

## 3. Signer et vérifier {#sign-and-verify}

Un portefeuille reçoit normalement `bodyBytes`, `authInfoBytes`, l'identifiant de
chaîne et le numéro de compte de la part de la dApp (le `SignDoc` d'une requête
`signDirect` du Cosmos SDK). Pour cet exemple, construisez-les avec
`cosmjs-types` :

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

## 4. Envoyer sur le testnet (facultatif) {#send-on-testnet}

Utilisez votre propre compte de testnet (jamais une phrase mnémonique du mainnet
dans des scripts). Le compte a besoin de QOR de testnet et d'une clé ML-DSA-87
enregistrée ; les portefeuilles QoreChain l'enregistrent à la création du compte,
et
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
montre comment l'enregistrer avec QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Le flux complet, avec le numéro de compte, le numéro de séquence et les frais, se
trouve dans
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## Étapes suivantes {#next}

- [Ajouter la signature hybride à un portefeuille compatible Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
