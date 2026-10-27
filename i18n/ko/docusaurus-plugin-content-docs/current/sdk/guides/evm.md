---
slug: /sdk/guides/evm
title: EVM 가이드
sidebar_label: EVM
sidebar_position: 1
---

# EVM 가이드

`@qorechain/evm`은 QoreChain EVM 엔진을 위한 [viem](https://viem.sh) 위에 얇게 얹은
타입 안전 어댑터입니다. EVM 클라이언트를 다시 구현하지는 않으며, viem이 피어
의존성입니다. 이 패키지는 체인을 인식하는 클라이언트 팩토리(EVM chain-id
자동 감지 포함), ERC-20 헬퍼, 컨트랙트 배포/호출 래퍼, 그리고 QoreChain EVM
프리컴파일을 위한 타입드 바인딩을 추가합니다.

```bash
npm i @qorechain/evm viem
```

## 클라이언트 생성

`createEvmClient`는 viem을 기반으로 하는 클라이언트 번들을 반환합니다. `chainId`를
전달하지 않으면 `eth_chainId`를 통해 EVM chain id를 자동으로 감지합니다.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

`rpcUrl`을 직접 전달할 수도 있고(`endpoints`와 상호 배타적), WebSocket용
`wsUrl` / `endpoints.evmWs`(테스트넷에서는 `wss://evm-ws-testnet.qore.host`),
명시적인 `chainId`, 그리고 `decimals`
(기본값 18, QOR의 EVM 관례이며 Cosmos `uqor`의 10^6 기준 단위와는 구분됨)를
전달할 수 있습니다.

개인 키에서 EVM 서명 계정을 파생합니다:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 헬퍼

`erc20` 네임스페이스(및 개별 함수)는 표준 ERC-20 호출을 래핑합니다.
읽기는 viem 퍼블릭 클라이언트를 받고, 쓰기는 월렛 클라이언트를 받습니다.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

viem을 직접 호출하는 편을 선호한다면 원시 ABI가 `ERC20_ABI`로 내보내집니다.

## 컨트랙트

범용 배포 및 호출 래퍼:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## EVM 인가 윈도우 (체인 v3.2.0) {#evm-window}

체인 버전 **v3.2.0**부터(메인넷은 블록 2,981,742부터, 테스트넷은 블록
5,920,000부터) EVM 레인은 **등록된 ML-DSA-87 키**와 **열려 있는 인가 윈도우**를
가진 계정의 트랜잭션만 받아들입니다. 읽기(`eth_call`, 잔액, 영수증)와 가스 추정은
윈도우 없이도 동작하며, MetaMask, viem, ethers, Hardhat, Foundry 같은 지갑과
라이브러리는 이전과 똑같이 서명합니다. 달라지는 점은 포스트 양자 인가가
트랜잭션보다 *앞서* 하이브리드 서명된 Native 레인 메시지로 전달된다는
것입니다. 체인 수준 규칙, 한도, CLI 형식, 거부 코드는
[EVM 인가 윈도우](/getting-started/first-transaction#evm-window)에 있습니다.

SDK **0.8.2 이상**에서는 코드로 윈도우를 열 수 있습니다(**0.9.0**은 아래의
범위 옵션을 추가합니다). 키 등록(1회)은
[양자 내성](/sdk/guides/quantum-safe)에 설명되어 있으며, 아래 예제는 그 다음에
통합 eth-네이티브 계정을 위한 윈도우를 엽니다(`npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  openEvmWindowMsg,
  fetchEvmWindow,
  classifyEvmWindowRejection,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account, { rest: REST }); // hybrid: the window needs the ML-DSA key

const { account: base } = await client.rest.get<{
  account: { account_number: string; sequence: string };
}>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);

const open = openEvmWindowMsg({
  sender: account.cosmos,
  blocks: 7200,         // 1 … 17,280 blocks (a block count, not a duration)
  maxTxs: 20,           // 1 … 1,000 transactions
  maxValue: "1000000000", // uqor: transferred value PLUS the maximum fee of each transaction
});

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-vladi",
  accountNumber: BigInt(base.account_number),
  sequence: BigInt(base.sequence),
  messages: [open],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
});

const w = await fetchEvmWindow({ rest: REST, address: account.cosmos });
console.log(w.live); // true while the window admits at least one more transaction
```

윈도우를 열면 계정의 nonce가 증가하므로(하나의 아이덴티티: Cosmos 시퀀스가
곧 EVM nonce입니다), 윈도우가 열린 **후에** EVM nonce를 읽고 그때 EVM
트랜잭션에 서명하세요. `maxValue`는 각 트랜잭션의 값 **더하기** 최대 수수료(가스
한도 곱하기 수수료 상한)를 제한합니다. 21,000 가스, 112.5 gwei로 1,000 uqor를
전송하면 윈도우에서 3,363 uqor가 소비됩니다. 윈도우는 사용자가 요청할 때만
여세요. 자동으로 열어서는 안 됩니다.

EVM 레인이 트랜잭션을 거부하면 `classifyEvmWindowRejection(err)`이
이유를 알려 줍니다:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg`는 대응하는 종료 메시지를 만들며, `MAX_EVM_WINDOW_BLOCKS`와
`MAX_EVM_WINDOW_TXS`는 한도를 내보냅니다.

### 윈도우 범위 지정 (체인 v3.2.3, SDK 0.9.0) {#evm-window-scope}

윈도우는 열 때 범위를 좁힐 수 있습니다. `nativeOnly`는 네이티브 QOR의 일반
전송만 허용하며(calldata 없음, 컨트랙트 생성 없음, 코드를 가진 수신자 없음,
EIP-7702 인가 없음), `allowedTargets`는 수신자가 나열된 최대 16개의 `0x` 주소
중 하나인 트랜잭션만 허용합니다(중복 불가, 컨트랙트 생성은 거부됨). 둘 다 새
메시지 필드입니다. v3.2.3 미만의 노드는 둘 중 하나라도 설정되면 트랜잭션 전체를
거부하므로, v3.2.3을 적용한 네트워크에서만 설정하세요(두 공개 네트워크 모두
적용했습니다). `fetchEvmWindow`는 두 값을 다시 읽어 옵니다(`nativeOnly`,
`allowedTargets`. v3.2.3 이전에는 `false`와 빈 값으로 읽힙니다). QOR 전송만을
위해 여는 윈도우에는 `nativeOnly`를 사용하세요.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on-chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "1000000000", // uqor: value PLUS the maximum fee of each transaction
      nativeOnly: true,
      // or: allowedTargets: ["0x…", "0x…"],
    }),
  ],
  "auto",
);
```

### EIP-7702 동의 (체인 v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

타입 4(EIP-7702) 트랜잭션은 인가가 효력을 발휘하는 모든 계정이 정확히 그 위임
대상에게 하이브리드 서명된 `MsgAuthorizeEVMDelegation`으로 포스트 양자 동의를
한 뒤에야 허용됩니다. 동의는 위임을 설치하는 트랜잭션에서 소진되며, 설정한
`blocks`(1~17,280)가 지나면 만료됩니다. 위임 대상으로 영 주소를 지정하면 해제에
동의하는 것입니다. SDK는 메시지를 만들고 동의를 다시 읽어 옵니다. 여기에는
인가 튜플이 담아야 하는 nonce도 포함됩니다:

```ts
import {
  authorizeEvmDelegationMsg,
  clearEvmDelegationMsg,
  fetchEvmDelegationConsent,
  evmDelegationTupleNonce,
} from "@qorechain/sdk";

// 1) Consent to one delegate (hybrid-signed Native-lane message, `tx` as above).
await tx.signAndBroadcast(
  [authorizeEvmDelegationMsg({ sender: account.address, delegate: "0xDelegate…", blocks: 600 })],
  "auto",
);

// 2) Read the consent: the tuple's nonce is the account's EVM nonce for a
//    sponsored transaction, and that nonce + 1 when the account sends it itself.
const consent = await fetchEvmDelegationConsent({ rest: "https://api.qore.host", address: account.address });
const tupleNonce = evmDelegationTupleNonce(consent, /* sponsored */ true);

// 3) Sign the authorisation tuple with `tupleNonce` and send the type-4
//    transaction (the sender still needs an open window; a sponsor pays from its own).

// Remove an installed delegation directly, without any EVM transaction:
// await tx.signAndBroadcast([clearEvmDelegationMsg(account.address)], "auto");
```

`classifyEvmDelegationRejection(err)`는 EVM 레인이 위임을 거부할 때 `"no-consent"`
또는 `"invalid"`를 반환합니다. 동의 쿼리에는 체인 v3.2.2 이상이 필요합니다. 체인
수준 규칙은 [EIP-7702 위임](/architecture/post-quantum-security#eip-7702)에
있으며, CLI 형식은 `qorechaind tx pqc authorize-evm-delegation`과
`clear-evm-delegation`입니다.

0.9.0 이전 릴리스는 범위가 없는 윈도우만 만들 수 있고(범위 없는 윈도우는 두
네트워크 모두에서 여전히 동작합니다) 동의 빌더가 없으므로, 그 경우에는
[EVM 인가 윈도우](/getting-started/first-transaction#evm-window)의 CLI 형식을
사용하세요.

## 프리컴파일

QoreChain은 고정된 주소에서 컨트랙트로 호출 가능한 프리컴파일을 정의합니다.
`precompiles` 네임스페이스가 타입드 바인딩을 제공하며, 주소와 ABI도
내보내집니다.

> **메인넷에서는 활성화되지 않았고, 테스트넷에서는 세 개가 활성화되어 있습니다.**
> QoreChain 프리컴파일은 노드에 컴파일되어 있지만 메인넷(`qorechain-vladi`)에서는
> 어느 것도 활성화되지 않았습니다. 테스트넷(`qorechain-diana`)에서는
> `active_static_precompiles` 목록에 `0x…0A01`(PQC 검증), `0x…0A02`(PQC 키 상태),
> `0x…0C01`(합의 파라미터)이 들어 있으며(2026년 10월 27일 확인), AI 쌍(`0x…0B01`,
> `0x…0B02`)과 크로스 VM 브리지(`0x…0901`)는 어느 네트워크에서도 활성화되지
> 않았습니다. 비활성 주소에 대한 호출은 빈 데이터를 반환하므로 해당 헬퍼들은
> 오류를 던집니다.
> [EVM 프리컴파일: 네트워크 상태](/developer-guide/evm-precompiles#network-status)를
> 참고하세요.

| 프리컴파일 | 함수 | 주소 |
| --- | --- | --- |
| Cross-VM Bridge | (브리지 라우팅) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (0x…0C01 is active on the testnet, not on mainnet).
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers: raw calldata for the risk score, an args object for the anomaly check.
const score = await precompiles.aiRiskScore(client.publicClient, "0xa9059cbb...");
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, {
  sender: account,
  amount: 1_000_000_000_000_000_000n, // 1 QOR in wei
});

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

프리컴파일 ABI는 `IQORE_PQC_ABI`, `IQORE_AI_ABI`, `IQORE_CONSENSUS_ABI`로
내보내집니다.

> 프리컴파일이 활성화되지 않은 곳(메인넷: 전부, 테스트넷: AI 쌍과
> 크로스 VM 브리지)이나
> QoreChain 프리컴파일이 없는 노드에서는 이러한 호출이 "feature not
> present" 오류를 던집니다. 호출별로 이를 처리하세요.

실행 가능한 버전은 `evm-precompile` [예제](/sdk/examples)를 참고하세요.
