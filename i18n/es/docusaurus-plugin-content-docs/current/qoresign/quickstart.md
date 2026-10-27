---
slug: /qoresign/quickstart
title: Inicio rápido de QoreSign
sidebar_label: Inicio rápido
sidebar_position: 2
---

# Inicio rápido

Este recorrido cubre cómo derivar las claves de una cuenta, firmar una
transacción del carril nativo con ambas claves y verificarla sin conexión, y
después, opcionalmente, enviarla a la testnet `qorechain-diana`. Requiere
Node.js 20 o posterior. Cubre QoreSign 0.1.1. Las secciones posteriores al paso 4 muestran la misma biblioteca en Python y Go, y cómo leer una transacción confirmada.

## 1. Instalar {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. Derivar las claves {#derive-keys}

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

`deriveCanonicalPqKey` da la misma clave ML-DSA-87 que derivan las carteras de
QoreChain para la cuenta, de modo que coincide con la clave ya registrada para
las cuentas que ellas crearon. Consulta
[Derivación de claves](/qoresign/guides/key-derivation).

## 3. Firmar y verificar {#sign-and-verify}

Normalmente una cartera recibe `bodyBytes`, `authInfoBytes`, el chain id y el
número de cuenta desde la dApp (el `SignDoc` de una solicitud `signDirect` de
Cosmos SDK). Para este ejemplo, constrúyelos con `cosmjs-types`:

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

## 4. Enviar en la testnet (opcional) {#send-on-testnet}

Usa tu propia cuenta de testnet (nunca un mnemónico de mainnet en scripts). La
cuenta necesita QOR de testnet y una clave ML-DSA-87 registrada; las carteras de
QoreChain la registran al crear la cuenta, y
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
muestra cómo registrarla con QoreSign.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

El flujo completo, con número de cuenta, secuencia y comisión, está en
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send).

## 5. Otros lenguajes: firmar y verificar un mensaje {#other-languages}

Estos ejemplos funcionan sin conexión. Cada uno deriva las claves de la frase de prueba pública de BIP-39 (dirección `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`), firma un mensaje con ambas claves y lo verifica, y después imprime `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`. No financies nunca esa frase.

### Python {#python}

Novedad de la 0.1.1. Python 3.9 o posterior; wheels para macOS y Linux (aún no hay wheel para Windows).

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

Esto se ejecutó con las wheels publicadas de la 0.1.1 en macOS arm64 y Linux aarch64.

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

El ejemplo de Go ignora los errores para ser breve; compruébalos en código real. Rust, Swift y Kotlin siguen el mismo flujo con los mismos nombres de función según la capitalización de cada lenguaje (consulta la [descripción general](/qoresign/overview#main-api)). Los artefactos de Kotlin y Android necesitan el compilador de Kotlin 2.3 o posterior: un proyecto con Kotlin 2.1 falla al compilar contra ellos.

## 6. Leer una transacción confirmada (inspector de transacciones) {#inspect}

Novedad de la 0.1.1, TypeScript. Esto lee y no envía nada. Informa de cómo se protegió una transacción confirmada: sus mensajes, firmante, comisión, si la firma clásica se verifica, el estado de la capa ML-DSA-87 y el nivel de seguridad (`pqc`, `enrollment`, `shake` o `classical`). Consulta [Inspector de transacciones](/qoresign/overview#inspector) para ver los campos.

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

Usa el hash de una transacción reciente de la testnet, por ejemplo una transferencia del faucet. Ejecutado así, imprimió `ML-DSA-87 key registered: true`, nivel `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, el mensaje `/cosmos.bank.v1beta1.MsgSend` y `EVM window: false false`. `inspectTransaction` devuelve `undefined` para un hash que la red no conoce. Las transacciones antiguas de la testnet pueden haber desaparecido porque los nodos de la testnet podan el historial.

## Siguiente {#next}

- [Añadir firma híbrida a una cartera compatible con Keplr](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [Descripción general de QoreSign](/qoresign/overview): todos los paquetes, la API principal, los límites y las notas de seguridad
