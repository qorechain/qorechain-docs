---
slug: /sdk/guides/quantum-safe
title: 기본 적용되는 양자 안전성
sidebar_label: 양자 안전
sidebar_position: 6
---

# 기본 적용되는 양자 안전성

QoreChain은 포스트 양자 암호를 **1급(first-class)** 서명 방식으로 취급합니다.
계정은 온체인에 **ML-DSA-87 (Dilithium-5, NIST FIPS 204)** 키를 등록하며,
이후 해당 계정의 트랜잭션은 **하이브리드** 서명을 가질 수 있습니다. 즉 일반적인
클래식 secp256k1 서명 **그리고** ML-DSA-87 서명을 함께 담습니다. 체인의 ante
핸들러가 두 서명을 모두 검증하므로, 양자 안전 계정은 클래식 검증과 완전히
호환되면서도 미래의 양자 공격자에 대한 보호를 함께 얻습니다.

SDK는 이를 작고 멱등적인 표면으로 패키징하여 dApp이 **기본적으로 양자
안전**하도록 만듭니다. 즉 한 번의 호출로 PQC 보호를 받습니다. 라이브 네트워크에서
이는 Native 경로 트랜잭션에 대해 선택 사항이 아닙니다. 키는 **명시적으로**
등록해야 하며(첫 번째 트랜잭션에서의 자동 등록은 없습니다), 이후 모든 Native 경로
트랜잭션은 하이브리드 서명을 담아야 합니다.

## 상태 확인 {#check-status}

`isPqcRegistered` / `getPqcStatus`는 `qor_getPQCKeyStatus` JSON-RPC 메서드를
통해 주소에 등록된 PQC 키가 있는지를 읽습니다. 이들은 `QorClient` 또는
`createClient`로 구성한 클라이언트를 모두 받습니다. **공개 엔드포인트는 `qor_`
네임스페이스를 제공하지 않으므로**([`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace)
참조), `*.qore.host`에 대해서는 이 헬퍼들이 JSON-RPC 오류 `-32601`로 실패합니다.
대신 REST로 상태를 읽으세요:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

경로는 `GET /qorechain/pqc/v1/account/{address}`입니다(단수형 `account`). 등록된
주소에는 `{"found": true, "account": {…}}`를, 그렇지 않은 경우에는
`{"found": false, "account": null}`을 응답합니다. 이 용도로
`client.rest.getPqcAccount`를 사용하지 마세요. 이 함수는 복수형 `/accounts/` 경로를
호출하는데, 체인은 이 경로를 제공하지 않습니다.

`isPqcRegistered(client, address)`와 `getPqcStatus(client, address)`(`statusSource`
옵션 포함)는 `qor` 네임스페이스를 제공하는 노드에 대해서는 여전히 올바른 호출이며,
그 결과는 `{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`입니다.

동일한 상태는 EVM 측에서도
`0x0000000000000000000000000000000000000A02`에 있는
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
프리컴파일(`@qorechain/evm`에서 `pqcKeyStatus`로 노출됨)이 활성화되면 읽을 수
있습니다. 이 프리컴파일은 아직 메인넷이나 테스트넷에서 활성화되어 있지 않습니다
([네트워크 상태](/developer-guide/evm-precompiles#network-status) 참조). 다음 SDK
패치 릴리스는 `.rest`를 노출하는 클라이언트(예: 구성된 클라이언트)가 주어지면 위의
REST 경로로 폴백하며, 상태를 읽을 수 없을 때는 "등록되지 않음"으로 보고하는 대신
예외를 던집니다.

## 한 번의 호출로 등록

`ensurePqcRegistered`는 계정을 양자 안전하게 만듭니다. 서명자의 ML-DSA-87 공개
키와 계정의 ECDSA 공개 키를 담아 `MsgRegisterPQCKeyV2`를 빌드하고 브로드캐스트합니다.
미리 읽어 둔 `status`(또는 `statusSource`)를 전달하면 **멱등적**입니다. 키가 이미
등록되어 있을 때 등록을 건너뛰므로, 앱이 시작될 때마다 호출해도 안전합니다.

등록은 클래식 서명으로 이루어지며 하이브리드 요구 사항에서 면제되므로, 새 계정이
첫 키를 부트스트랩할 수 있습니다. 이는 CosmJS 서명자, 즉 coin-type-118 계정
(`deriveNativeAccount`)을 통해 서명합니다. 통합 eth-native 계정의 경우 등록을
`EthNativeSigner`와 `signMode: "classical"`로 서명하세요
([계정 및 PQC 서명](/sdk/concepts/accounts-pqc#hybrid-signing) 참조). 2,592바이트
키에는 약 600,000의 가스 한도가 필요하며, 네트워크의 최소 가스 가격은 가스 단위당
0.1 uqor입니다.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## 하이브리드 서명

`migrateToHybrid`는 등록을 보장하고, 키페어가 기존의 `buildHybridTx` /
`signAndBroadcastHybrid` 빌더에 미리 바인딩된 하이브리드 전송 경로를
반환합니다. SDK가 네트워크가 검증하는 하이브리드 sign-bytes 형태를 확인할 수
있도록 `rest`를 전달하세요
([어떤 sign-bytes 형태인가?](/sdk/concepts/accounts-pqc#sign-bytes-versions) 참조):

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

체인은 유효한 FIPS-204 ML-DSA-87 서명이라면 헤지(hedged) 방식이든 결정적
방식이든 모두 받아들입니다. SDK는 기본적으로(0.5.1부터) 결정적으로 서명하므로
트랜잭션은 항상 동일한 서명과 tx 해시를 가집니다. 하이브리드 tx가 `pqc` 코드 21
(`hybrid_verify_failed`)로 실패한다면, 원인은 sign-bytes 버전, 체인 id, 오래된 PQC
라이브러리, 또는 등록되지 않았거나 다른 키이며 헤지 서명 때문이 아닙니다.
[코드 21 문제 해결](/developer-guide/post-quantum-signing#code-21)을 참조하세요.

## 키 회전

계정의 ML-DSA-87 키를 **같은** 알고리즘의 다른 키로 교체하려면(예: 레거시
`shake256(mnemonic)` 키를 주소에 바인딩된 정식 키로 옮기거나, 손상된 키를 폐기하는
경우), `rotatePqcKeyMsgFromMnemonic`으로 `MsgRotatePQCKey`를 빌드하세요. 두 키가
모두 이 메시지에 이중 서명합니다. 전체 예제는
[키 회전](/sdk/guides/authenticators#key-rotation)을 참조하세요.

`migratePqcKey`는 이전 방식의 `MsgMigratePQCKey`를 브로드캐스트하며, 이는 계정을
**알고리즘** 간에 옮기고 호출자가 두 서명을 모두 제공해야 합니다:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## UI에서

[`@qorechain/react`](/sdk/guides/react) 키트는 이 모든 것을 React에서 노출합니다.
`usePqcStatus` 훅과 `<QuantumSafeBadge/>` 컴포넌트는 연결된 계정에 등록된 PQC
키가 있을 때마다 **양자 안전** 표시를 보여줍니다. 둘 다 `getPqcStatus`를 통해
상태를 읽으므로, 공개 엔드포인트(`qor_` 네임스페이스 없음)에 대해서는 현재 키를
확인할 수 없습니다. React 페이지의 라이브 네트워크 제한 사항을 참조하세요.
