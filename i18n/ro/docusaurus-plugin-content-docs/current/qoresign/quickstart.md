---
slug: /qoresign/quickstart
title: Pornire rapidă QoreSign
sidebar_label: Pornire rapidă
sidebar_position: 2
---

# Pornire rapidă

Acest ghid parcurge derivarea cheilor unui cont, semnarea unei tranzacții de pe
lane-ul nativ cu ambele chei și verificarea ei, offline, apoi, opțional,
trimiterea ei pe testnetul `qorechain-diana`. Necesită Node.js 20 sau mai nou. Acoperă QoreSign 0.1.1. Secțiunile de după pasul 4 arată aceeași bibliotecă în Python și Go, precum și cum se citește înapoi o tranzacție confirmată.

## 1. Instalare {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Derivarea cheilor {#derive-keys}

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

`deriveCanonicalPqKey` produce aceeași cheie ML-DSA-87 pe care o derivează
portofelele QoreChain pentru cont, deci se potrivește cu cheia deja înregistrată
pentru conturile create de ele. Vezi [Derivarea cheilor](/qoresign/guides/key-derivation).

## 3. Semnare și verificare {#sign-and-verify}

Un portofel primește de obicei `bodyBytes`, `authInfoBytes`, id-ul lanțului și
numărul contului de la dApp (`SignDoc` al unei cereri `signDirect` din Cosmos
SDK). Pentru acest exemplu, construiți-le cu `cosmjs-types`:

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

## 4. Trimitere pe testnet (opțional) {#send-on-testnet}

Folosiți propriul cont de testnet (niciodată o mnemonică de mainnet în scripturi).
Contul are nevoie de QOR de testnet și de o cheie ML-DSA-87 înregistrată;
portofelele QoreChain o înregistrează la crearea contului, iar
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
arată cum se înregistrează cu QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

Fluxul complet, inclusiv numărul contului, secvența și taxa, se găsește în
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## 5. Alte limbaje: semnarea și verificarea unui mesaj {#other-languages}

Aceste exemple sunt offline. Fiecare derivă cheile din fraza publică de test BIP-39 (adresa `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), semnează un mesaj cu ambele chei și îl verifică, apoi afișează `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. Nu alimentați niciodată acea frază.

### Python {#python}

Nou în 0.1.1. Python 3.9 sau mai nou; wheel-uri pentru macOS și Linux (încă fără wheel pentru Windows).

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

Acest exemplu a fost rulat cu wheel-urile publicate 0.1.1 pe macOS arm64 și Linux aarch64.

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

Exemplul Go ignoră erorile ca să rămână scurt; verificați-le în codul real. Rust, Swift și Kotlin urmează același flux, cu aceleași nume de funcții în stilul propriu fiecărui limbaj (vezi [prezentarea generală](/qoresign/overview#main-api)). Artefactele Kotlin și Android au nevoie de compilatorul Kotlin 2.3 sau mai nou: un proiect pe Kotlin 2.1 nu se compilează împotriva lor.

## 6. Citirea unei tranzacții confirmate (inspectorul de tranzacții) {#inspect}

Nou în 0.1.1, TypeScript. Doar citește și nu trimite nimic. Raportează cum a fost protejată o tranzacție confirmată: mesajele, semnatarul, taxa, dacă semnătura clasică se verifică, starea stratului ML-DSA-87 și nivelul de securitate (`pqc`, `enrollment`, `shake` sau `classical`). Vezi [Inspectorul de tranzacții](/qoresign/overview#inspector) pentru câmpuri.

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

Folosiți hash-ul unei tranzacții recente de testnet, de exemplu un transfer al faucet-ului. Rulat astfel, a afișat `ML-DSA-87 key registered: true`, nivelul `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, mesajul `/cosmos.bank.v1beta1.MsgSend` și `EVM window: false false`. `inspectTransaction` returnează `undefined` pentru un hash pe care rețeaua nu-l cunoaște. Tranzacțiile vechi de pe testnet pot lipsi, deoarece nodurile de testnet elimină istoricul (pruning).

## Mai departe {#next}

- [Adăugați semnarea hibridă într-un portofel compatibil Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [Prezentare generală QoreSign](/qoresign/overview): toate pachetele, API-ul principal, limitele și notele de securitate
