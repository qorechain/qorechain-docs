---
slug: /sdk/examples
title: 예제
sidebar_label: 예제
sidebar_position: 7
---

# 예제

실행 가능한 TypeScript 예제는 SDK 모노레포의
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
디렉터리에 있습니다 — 아래에 소개된 예제 외에도 `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft`, `subscribe-blocks`가 포함되어 있습니다.
각 폴더는 자체 `README.md`, `.env.example`, 그리고 단일 `index.ts`를 갖춘
독립적인 워크스페이스 패키지입니다. 엔드포인트와 니모닉은 환경 변수에서
읽어오며 합리적인 localhost 기본값을 제공하고, 네트워크에 의존하는 예제는
노드에 연결할 수 없을 때 힌트와 함께 정상적으로 종료됩니다.

리포지토리 루트에서 한 번만 설치한 뒤, 어떤 예제든 실행할 수 있습니다:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> 테스트용 니모닉이나 생성된 키만 사용하세요. 실제 비밀 정보를 절대 커밋하지 마세요.

아래 스니펫은 각 예제의 `index.ts`를 요약한 것입니다. 전체 실행 가능한
프로그램은 링크된 소스를 참고하세요.

## connect-and-query

클라이언트를 생성하고 공개 체인 상태 — 네이티브 bank 잔액과 전체 토크노믹스
스냅샷 — 를 읽습니다. 연결 가능한 노드가 필요합니다.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    rest: process.env.QORE_REST_URL ?? "http://localhost:1317",
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const balances = await client.rest.getAllBalances(address);
const overview = await client.qor.getTokenomicsOverview();
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

니모닉에서 네이티브(`qor1...`) 계정을 파생하고 QOR 전송을 브로드캐스트합니다:
파생 → 서명 → 시뮬레이션 → 수수료 추정 → `bankSend`. 연결 가능한 합의 RPC와
REST, 그리고 자금이 있는 계정이 필요합니다.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, prefix);

const amount = [{ denom: baseDenom, amount: toBase("1.5") }]; // "1500000" uqor

const tx = await client.connectTx(signer);
const gasEstimate = await tx.simulate(messages);
const fee = await client.fees.estimate("normal");
const result = await tx.bankSend(recipient, amount, { fee });
console.log(result.transactionHash);
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

`@qorechain/svm`을 사용하여 QoreChain의 Solana 호환(SVM) 런타임에서 메모
명령이 포함된 SOL 전송을 구성합니다. 트랜잭션을 오프라인으로 구성하고
출력하며, 전송하려면 연결 가능한 SVM JSON-RPC와 자금이 있는 계정이
필요합니다.

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

`@qorechain/evm`(viem 위의 얇은 레이어)을 사용하여 읽기 전용 QoreChain
프리컴파일을 호출하고 ERC-20 잔액을 읽습니다. EVM 체인 ID는 `eth_chainId`를
통해 자동 감지됩니다. 프리컴파일이 없는 노드에서는 해당 호출이 "feature not
present" 오류를 던지며, 호출별로 보고됩니다.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

ML-DSA-87(Dilithium-5, FIPS 204)을 사용한 포스트 양자 서명입니다. **완전히
오프라인으로 실행됩니다 — 노드가 필요 없습니다.** 1부에서는 메시지에 서명하고
검증하며(변조 검사 포함), 2부에서는 클래식 secp256k1 서명과 ML-DSA-87 서명을
`PQCHybridSignature` 확장으로 모두 담은 하이브리드 트랜잭션을 구성한 뒤 PQC
부분을 로컬에서 검증합니다.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  buildHybridTx,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("QoreChain is quantum-safe");
const signature = pqcSign(keypair.secretKey, message);
const valid = pqcVerify(keypair.publicKey, message, signature);

const built = await buildHybridTx({
  registry,
  signer,
  pqcKeypair,
  messages,
  fee: { amount: [{ denom: "uqor", amount: "5000" }], gas: "200000" },
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  includePqcPublicKey: true, // embed the key for auto-registration on first use
});
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

배포된 CosmWasm 컨트랙트에 대해 읽기 전용 스마트 쿼리를 실행합니다. 연결
가능한 합의 RPC와 배포된 컨트랙트 주소가 필요합니다.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: process.env.QORE_RPC_URL ?? "http://localhost:26657" },
});

const cw = await client.cosmwasm(); // read-only, memoized on the client
const info = await getContractInfo(cw, contract);
const result = await queryContractSmart(cw, contract, { token_info: {} });
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

EVM JSON-RPC 엔드포인트를 통해 제공되는 타입 지정 `qor_*` JSON-RPC
네임스페이스(`client.qor`)로 토크노믹스 상태를 읽습니다. 세 개의 읽기는 서로
독립적이므로, 다른 호출이 불가능하더라도 각각 개별적으로 보고됩니다.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

**통합 eth-네이티브 계정**을 파생합니다(SDK 0.6.0): 하나의 `eth_secp256k1`
키가 하나의 공유 잔액을 가진 세 가지 QoreChain 주소로 모두 렌더링되며,
주소에 바인딩된 ML-DSA-87 키페어도 함께 파생됩니다. 완전히 오프라인으로
실행됩니다.

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  unifiedAccountFromSeed,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
console.log(account.cosmos); // "qor1…"  — Native lane
console.log(account.evm);    // "0x…"    — EVM lane
console.log(account.svm);    // base58   — SVM lane (same 20 bytes)

// Decode any one encoding into all three.
const all = qoreAddresses({ evm: account.evm });

// Or derive from a raw 32-byte seed instead of a mnemonic.
const fromSeed = unifiedAccountFromSeed(seed32);
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Native 인증자(authenticator) 레인에서 릴레이어가 제출하는
`MsgExecuteCosmos`를 구성합니다(SDK 0.7.0, 체인 v3.1.85): Phantom 방식의
ed25519 키가 도메인 분리된 인증 다이제스트에 서명하고, 생성된 메시지는
릴레이어가 브로드캐스트할 수 있도록 준비됩니다(수수료는 릴레이어가 지불하며,
외부 키는 절대 ML-DSA 공동 서명을 생성하지 않습니다). 드라이 런 — 노드가
필요 없습니다.

```ts
import {
  buildPhantomExecuteCosmos,
  cosmosAuthSignBytes,
  qorechainRegistry,
} from "@qorechain/sdk";

// Show the exact 32-byte digest the wallet signs (byte-exact vs the chain).
const digest = cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce });

// Build the relayer-ready message: the Phantom wallet signs the digest.
const msg = await buildPhantomExecuteCosmos({
  wallet,                 // window.solana in a browser
  relayer,                // submits + pays fees (a DIFFERENT account)
  chainId,
  account,                // the canonical PQC-required owner
  to,
  amount: "100uqor",
  nonce,                  // the per-authenticator sequence
});

// Prove it encodes via the default registry (what the relayer broadcasts).
const bytes = qorechainRegistry().encode(msg);
```

[소스](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· 전체 가이드:
[인증자 및 위임 지출](/sdk/guides/authenticators)
