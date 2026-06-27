---
slug: /sdk/guides/svm
title: SVM 가이드
sidebar_label: SVM
sidebar_position: 2
---

# SVM 가이드

`@qorechain/svm`은 QoreChain의 Solana 호환 JSON-RPC를 위해
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 위에 얇게 얹은
타입 안전 어댑터입니다. `@solana/web3.js`는 피어 의존성입니다. 이 패키지는
SVM RPC 엔드포인트를 대상으로 하는 클라이언트 팩토리, 키 헬퍼, 타입드 읽기
래퍼, SOL 전송 빌드/서명/전송, 그리고 최소한의 네이티브 프로그램 명령어
빌더를 추가합니다.

```bash
npm i @qorechain/svm @solana/web3.js
```

## 클라이언트 생성

```ts
import { createSvmClient } from "@qorechain/svm";

const client = createSvmClient({
  endpoints: { svmRpc: "https://svm.testnet.example" },
});
```

`rpcUrl`이나 기존 `connection`을 전달하거나, `DEFAULT_SVM_RPC_URL`
(localhost `8899`)에 의존할 수도 있습니다.

## 키

파생된 SVM 비밀 키에서 `@solana/web3.js` `Keypair`를 재구성하거나, 주소를
출력합니다:

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import { svmKeypairFromSecretKey, svmAddress } from "@qorechain/svm";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);
console.log(svmAddress(keypair)); // base58
```

## SOL 전송

서명되지 않은 전송을 빌드한 다음 전송합니다(전송에는 도달 가능한 노드와 자금이
있는 계정이 필요합니다):

```ts
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);

// Build only (no broadcast):
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });

// Or build + sign + send + confirm in one call:
// const sig = await client.transferSol({ from: keypair, to: recipient, lamports });

// Send an arbitrary transaction:
// const sig = await client.sendTransaction(tx, [keypair]);

// Simulate without submitting:
// const sim = await client.simulateTransaction(tx);
```

## 프로그램

일반적인 네이티브 프로그램용 빌더와 범용 invoke 빌더:

```ts
import {
  createMemoInstruction,
  createTransferTokenInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInvokeInstruction,
  PROGRAM_IDS,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MEMO_PROGRAM_ID,
} from "@qorechain/svm";

// Attach a memo to a transaction.
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));

// SPL-Token transfer, ATA creation, and a generic program invoke are also
// available via the builders above.
```

실행 가능한 버전은 `svm-transfer` [예제](/sdk/examples)를 참고하세요.
