---
slug: /qoresign/quickstart
title: Démarrage rapide de QoreSign
sidebar_label: Démarrage rapide
sidebar_position: 2
---

# Démarrage rapide

Ce guide montre comment dériver les clés d'un compte, signer une transaction de la
voie native avec les deux clés et la vérifier hors ligne, puis, en option, l'envoyer
sur le testnet `qorechain-diana`. Node.js 20 ou version ultérieure. Il couvre QoreSign 0.1.1. Les sections après l'étape 4 présentent la même bibliothèque en Python et en Go, ainsi que la relecture d'une transaction validée.

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

## 5. Autres langages : signer et vérifier un message {#other-languages}

Ces exemples fonctionnent hors ligne. Chacun dérive les clés à partir de la phrase de test publique BIP-39 (adresse `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), signe un message avec les deux clés et le vérifie, puis affiche `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. N'approvisionnez jamais cette phrase.

### Python {#python}

Nouveauté de la 0.1.1. Python 3.9 ou ultérieur ; wheels pour macOS et Linux (pas encore de wheel Windows).

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

Ceci a été exécuté avec les wheels 0.1.1 publiées, sur macOS arm64 et Linux aarch64.

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

L'exemple Go ignore les erreurs pour rester court ; vérifiez-les dans du code réel. Rust, Swift et Kotlin suivent le même flux avec les mêmes noms de fonctions, dans leur propre casse (voir la [présentation](/qoresign/overview#main-api)). Les artefacts Kotlin et Android nécessitent le compilateur Kotlin 2.3 ou ultérieur : un projet sous Kotlin 2.1 échoue à la compilation avec eux.

## 6. Lire une transaction validée (inspecteur de transactions) {#inspect}

Nouveauté de la 0.1.1, TypeScript. Ceci lit et n'envoie rien. Il indique comment une transaction validée a été protégée : ses messages, son signataire, ses frais, si la signature classique est valide, l'état de la couche ML-DSA-87 et le niveau de sécurité (`pqc`, `enrollment`, `shake` ou `classical`). Voir [Inspecteur de transactions](/qoresign/overview#inspector) pour les champs.

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

Utilisez le hash d'une transaction récente du testnet, par exemple un transfert du faucet. Exécuté ainsi, il a affiché `ML-DSA-87 key registered: true`, le niveau `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, le message `/cosmos.bank.v1beta1.MsgSend` et `EVM window: false false`. `inspectTransaction` renvoie `undefined` pour un hash que le réseau ne connaît pas. D'anciennes transactions du testnet peuvent avoir disparu, car les nœuds du testnet élaguent l'historique.

## Étapes suivantes {#next}

- [Ajouter la signature hybride à un portefeuille compatible Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [Présentation de QoreSign](/qoresign/overview) : tous les paquets, l'API principale, les limites et les notes de sécurité
