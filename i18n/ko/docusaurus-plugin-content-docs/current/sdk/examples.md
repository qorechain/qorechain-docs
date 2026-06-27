---
slug: /sdk/examples
title: 예제
sidebar_label: 예제
sidebar_position: 7
---

# 예제

실행 가능한 일곱 개의 TypeScript 예제가 SDK 모노레포의
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
디렉터리에 들어 있습니다. 각 폴더는 자체적인 `README.md`, `.env.example`, 그리고 단일
`index.ts`를 갖춘 독립적인 워크스페이스 패키지입니다. 이들은 적절한 localhost 기본값과 함께
환경 변수에서 엔드포인트와 니모닉을 읽어 들이며, 네트워크에 의존하는 예제는 도달 가능한 노드가
없을 때 힌트와 함께 우아하게 실패합니다.

레포 루트에서 한 번 설치한 다음, 원하는 예제를 실행하세요:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> 테스트용 니모닉이나 생성된 키만 사용하세요. 실제 시크릿은 절대 커밋하지 마세요.

아래 스니펫은 각 예제의 `index.ts`에서 요약한 것입니다. 완전하고 실행 가능한 프로그램은
링크된 소스를 참고하세요.

## connect-and-query

클라이언트를 생성하고 공개 체인 상태 — 네이티브 bank 잔액과 집계된 토크노믹스 스냅샷 — 를
읽습니다. 도달 가능한 노드가 필요합니다.

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
파생 → 서명 → 시뮬레이션 → 수수료 추정 → `bankSend`. 도달 가능한 합의 RPC와
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

`@qorechain/svm`을 사용하여 QoreChain의 Solana 호환(SVM) 런타임에서 memo 명령어가 포함된
SOL 전송을 구성합니다. 트랜잭션을 오프라인으로 빌드하고 출력하며, 전송하려면 도달 가능한
SVM JSON-RPC와 자금이 있는 계정이 필요합니다.

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

`@qorechain/evm`(viem 위에 얇게 얹은 레이어)을 사용하여 읽기 전용 QoreChain 프리컴파일을
호출하고 ERC-20 잔액을 읽습니다. EVM 체인 ID는 `eth_chainId`를 통해 자동으로 감지됩니다.
프리컴파일이 없는 노드에서는 해당 호출이 "feature not present"를 던지며, 호출별로
보고됩니다.

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

ML-DSA-87(Dilithium-5, FIPS 204)을 사용한 포스트 양자 서명입니다. **완전히 오프라인으로
실행되며 — 노드가 필요 없습니다.** 1부에서는 메시지를 서명하고 검증합니다(변조 검사 포함).
2부에서는 고전적인 secp256k1 서명과 ML-DSA-87 서명을 모두 `PQCHybridSignature` 확장으로
담은 하이브리드 트랜잭션을 빌드한 다음, PQC 절반을 로컬에서 검증합니다.

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

배포된 CosmWasm 컨트랙트에 대해 읽기 전용 스마트 쿼리를 실행합니다. 도달 가능한 합의 RPC와
배포된 컨트랙트 주소가 필요합니다.

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

EVM JSON-RPC 엔드포인트를 통해 제공되는 타입이 지정된 `qor_*` JSON-RPC 네임스페이스
(`client.qor`)를 통해 토크노믹스 상태를 읽습니다. 세 가지 읽기는 서로 독립적이므로, 다른 것이
사용 불가능하더라도 각각 보고됩니다.

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
