---
slug: /qoresign/quickstart
title: QoreSign 빠른 시작
sidebar_label: 빠른 시작
sidebar_position: 2
---

# 빠른 시작

이 문서는 계정 키를 파생하고, 두 키로 Native 레인 트랜잭션에 서명한 뒤 오프라인으로 검증하고, 선택적으로
`qorechain-diana` 테스트넷으로 전송하는 과정을 안내합니다. Node.js 20 이상이 필요합니다. QoreSign 0.1.1을 다룹니다. 4단계 이후의 섹션에서는 같은 라이브러리를 Python과 Go에서 사용하는 방법과 커밋된 트랜잭션을 다시 읽어 오는 방법을 보여줍니다.

## 1. 설치 {#install}

```bash
mkdir qoresign-quickstart && cd qoresign-quickstart
npm init -y
npm pkg set type=module
npm install @qorechain/qoresign
```

## 2. 키 파생 {#derive-keys}

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

`deriveCanonicalPqKey`는 QoreChain 지갑이 해당 계정에 대해 파생하는 것과 동일한 ML-DSA-87 키를 반환하므로,
QoreChain 지갑이 만든 계정에 이미 등록된 키와 일치합니다.
[키 파생](/qoresign/guides/key-derivation)을 참고하세요.

## 3. 서명 및 검증 {#sign-and-verify}

지갑은 보통 dApp으로부터 `bodyBytes`, `authInfoBytes`, 체인 ID, 계정 번호를 받습니다(Cosmos SDK
`signDirect` 요청의 `SignDoc`). 이 예제에서는 `cosmjs-types`로 직접 만듭니다.

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

## 4. 테스트넷으로 전송(선택 사항) {#send-on-testnet}

본인의 테스트넷 계정을 사용하세요(스크립트에 메인넷 니모닉을 절대 사용하지 마세요). 계정에는 테스트넷 QOR와
등록된 ML-DSA-87 키가 필요합니다. QoreChain 지갑은 계정을 만들 때 키를 등록하며,
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)에서
QoreSign으로 키를 등록하는 방법을 볼 수 있습니다.

```js
import { simulateTx, submitWithSignBytesFallback } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const sim = await simulateTx({ rest, txBytes: signed.txBytes }); // throws if the network would refuse it
console.log(sim.gasUsed, sim.suggestedGasLimit, sim.balanceDeltas);
// Rebuild authInfoBytes with gas limit sim.suggestedGasLimit and fee >= 0.1 uqor per gas, sign again, then:
// await submitWithSignBytesFallback({ rest, chainId, sign: () => signedAgain.txBytes });
```

계정 번호, 시퀀스, 수수료를 포함한 전체 흐름은
[`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)에 있습니다.

## 5. 다른 언어: 메시지 서명 및 검증 {#other-languages}

이 예제들은 오프라인으로 실행됩니다. 각각 공개 BIP-39 테스트 문구(주소 `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`)에서 키를 파생하고, 두 키로 메시지에 서명한 뒤 검증하고, `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h verified`를 출력합니다. 이 문구에는 절대 자금을 보내지 마세요.

### Python {#python}

0.1.1에서 새로 추가되었습니다. Python 3.9 이상, macOS와 Linux용 wheel 제공(아직 Windows wheel 없음).

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

게시된 0.1.1 wheel로 macOS arm64와 Linux aarch64에서 실행했습니다.

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

Go 예제는 짧게 하려고 오류를 무시합니다. 실제 코드에서는 오류를 확인하세요. Rust, Swift, Kotlin도 각 언어의 표기법으로 같은 함수 이름을 사용해 같은 흐름을 따릅니다([개요](/qoresign/overview#main-api) 참조). Kotlin 및 Android 아티팩트에는 Kotlin 2.3 이상 컴파일러가 필요합니다. Kotlin 2.1을 쓰는 프로젝트는 컴파일에 실패합니다.

## 6. 커밋된 트랜잭션 읽기(트랜잭션 인스펙터) {#inspect}

0.1.1에서 새로 추가되었으며 TypeScript용입니다. 읽기만 하고 아무것도 전송하지 않습니다. 커밋된 트랜잭션이 어떻게 보호되었는지 보고합니다. 메시지, 서명자, 수수료, 클래식 서명이 검증되는지 여부, ML-DSA-87 계층의 상태, 보안 등급(`pqc`, `enrollment`, `shake` 또는 `classical`)이 그 내용입니다. 필드는 [트랜잭션 인스펙터](/qoresign/overview#inspector)를 참고하세요.

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

최근 테스트넷 트랜잭션의 해시(예: faucet 전송)를 사용하세요. 그렇게 실행하자 `ML-DSA-87 key registered: true`, 등급 `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, 메시지 `/cosmos.bank.v1beta1.MsgSend`, `EVM window: false false`가 출력되었습니다. `inspectTransaction`은 네트워크가 모르는 해시에는 `undefined`를 반환합니다. 테스트넷 노드는 기록을 정리(prune)하므로 오래된 테스트넷 트랜잭션은 없을 수 있습니다.

## 다음 단계 {#next}

- [Keplr 호환 지갑에 하이브리드 서명 추가하기](/qoresign/guides/keplr-compatible-wallets)
- [Sign In With QoreChain](/qoresign/guides/sign-in)
- [QoreSign 개요](/qoresign/overview): 모든 패키지, 주요 API, 한계와 보안 참고 사항
