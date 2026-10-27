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
Node.js 20 oder höher. Sie behandelt QoreSign 0.1.1. Die Abschnitte nach Schritt 4 zeigen dieselbe Bibliothek in Python und Go und wie Sie eine bestätigte Transaktion nachlesen.

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

## 5. Andere Sprachen: eine Nachricht signieren und prüfen {#other-languages}

Diese Beispiele laufen offline. Jedes leitet die Schlüssel aus der öffentlichen BIP-39-Testphrase ab (Adresse `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), signiert eine Nachricht mit beiden Schlüsseln, prüft sie und gibt dann `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified` aus. Finanzieren Sie diese Phrase niemals.

### Python {#python}

Neu in 0.1.1. Python 3.9 oder höher; Wheels für macOS und Linux (noch kein Windows-Wheel).

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

Dies wurde mit den veröffentlichten 0.1.1-Wheels auf macOS arm64 und Linux aarch64 ausgeführt.

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

Das Go-Beispiel ignoriert Fehler, um kurz zu bleiben; prüfen Sie sie in echtem Code. Rust, Swift und Kotlin folgen demselben Ablauf mit denselben Funktionsnamen in ihrer jeweiligen Schreibweise (siehe die [Übersicht](/qoresign/overview#main-api)). Die Artefakte für Kotlin und Android brauchen den Compiler Kotlin 2.3 oder höher: Ein Projekt mit Kotlin 2.1 lässt sich dagegen nicht kompilieren.

## 6. Eine bestätigte Transaktion lesen (Transaktionsinspektor) {#inspect}

Neu in 0.1.1, TypeScript. Das liest nur und sendet nichts. Es berichtet, wie eine bestätigte Transaktion geschützt war: ihre Nachrichten, den Signierer, die Gebühr, ob die klassische Signatur gültig ist, den Zustand der ML-DSA-87-Schicht und die Sicherheitsstufe (`pqc`, `enrollment`, `shake` oder `classical`). Die Felder stehen unter [Transaktionsinspektor](/qoresign/overview#inspector).

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

Verwenden Sie den Hash einer aktuellen Testnet-Transaktion, zum Beispiel eines Faucet-Transfers. So ausgeführt gab es `ML-DSA-87 key registered: true`, Stufe `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, die Nachricht `/cosmos.bank.v1beta1.MsgSend` und `EVM window: false false` aus. `inspectTransaction` liefert `undefined` für einen dem Netzwerk unbekannten Hash. Alte Testnet-Transaktionen können fehlen, weil Testnet-Nodes ihren Verlauf bereinigen.

## Weiter {#next}

- [Hybrides Signieren in eine Keplr-kompatible Wallet einbauen](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [QoreSign-Überblick](/qoresign/overview): alle Pakete, die Haupt-API, Grenzen und Sicherheitshinweise
