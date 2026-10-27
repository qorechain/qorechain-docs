---
slug: /qoresign/quickstart
title: Avvio rapido di QoreSign
sidebar_label: Avvio rapido
sidebar_position: 2
---

# Avvio rapido

Questa guida mostra come derivare le chiavi di un account, firmare una
transazione sulla corsia Native con entrambe le chiavi e verificarla, offline,
quindi, facoltativamente, inviarla alla testnet `qorechain-diana`. Richiede
Node.js 20 o successivo. Riguarda QoreSign 0.1.1. Le sezioni dopo il passo 4 mostrano la stessa libreria in Python e Go, e come rileggere una transazione confermata.

## 1. Installazione {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Derivare le chiavi {#derive-keys}

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

`deriveCanonicalPqKey` restituisce la stessa chiave ML-DSA-87 che i wallet
QoreChain derivano per l'account, quindi coincide con la chiave già registrata
per gli account da essi creati. Vedi
[Derivazione delle chiavi](/qoresign/guides/key-derivation).

## 3. Firmare e verificare {#sign-and-verify}

Un wallet riceve normalmente dalla dApp `bodyBytes`, `authInfoBytes`, il chain id
e il numero di account (il `SignDoc` di una richiesta `signDirect` del Cosmos
SDK). Per questo esempio, costruiscili con `cosmjs-types`:

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

## 4. Inviare sulla testnet (facoltativo) {#send-on-testnet}

Usa un tuo account testnet (mai una mnemonica mainnet negli script). L'account
ha bisogno di QOR testnet e di una chiave ML-DSA-87 registrata; i wallet
QoreChain la registrano alla creazione dell'account, e
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
mostra come registrarla con QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Il flusso completo, comprensivo di numero di account, sequence e commissione, si
trova in
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## 5. Altri linguaggi: firmare e verificare un messaggio {#other-languages}

Questi esempi sono offline. Ognuno deriva le chiavi dalla frase di test pubblica BIP-39 (indirizzo `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), firma un messaggio con entrambe le chiavi e lo verifica, poi stampa `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. Non finanziare mai quella frase.

### Python {#python}

Novità della 0.1.1. Python 3.9 o successivo; wheel per macOS e Linux (nessuna wheel per Windows per ora).

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

L'esempio è stato eseguito con le wheel 0.1.1 pubblicate su macOS arm64 e Linux aarch64.

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

L'esempio Go ignora gli errori per restare breve; controllali nel codice reale. Rust, Swift e Kotlin seguono lo stesso flusso con gli stessi nomi di funzione nella propria convenzione di maiuscole/minuscole (vedi la [panoramica](/qoresign/overview#main-api)). Gli artefatti Kotlin e Android richiedono il compilatore Kotlin 2.3 o successivo: un progetto con Kotlin 2.1 non compila rispetto a essi.

## 6. Leggere una transazione confermata (ispettore delle transazioni) {#inspect}

Novità della 0.1.1, TypeScript. Legge soltanto e non invia nulla. Riporta come è stata protetta una transazione confermata: i suoi messaggi, il firmatario, la commissione, se la firma classica è valida, lo stato del livello ML-DSA-87 e il livello di sicurezza (`pqc`, `enrollment`, `shake` o `classical`). Per i campi vedi [Ispettore delle transazioni](/qoresign/overview#inspector).

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

Usa l'hash di una recente transazione della testnet, per esempio un trasferimento del faucet. Eseguito così, ha stampato `ML-DSA-87 key registered: true`, tier `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, il messaggio `/cosmos.bank.v1beta1.MsgSend` e `EVM window: false false`. `inspectTransaction` restituisce `undefined` per un hash che la rete non conosce. Le vecchie transazioni della testnet potrebbero non esserci più perché i nodi della testnet eliminano la cronologia.

## Passi successivi {#next}

- [Aggiungere la firma ibrida a un wallet compatibile con Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [Panoramica di QoreSign](/qoresign/overview): tutti i pacchetti, l'API principale, limiti e note di sicurezza
