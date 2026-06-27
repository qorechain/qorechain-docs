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
안전**하도록 만듭니다. 즉 한 번의 호출로 PQC 보호를 받습니다.

## 상태 확인

`isPqcRegistered` / `getPqcStatus`는 `qor_getPQCKeyStatus` JSON-RPC 메서드를
통해 주소에 등록된 PQC 키가 있는지를 읽습니다. 이들은 `QorClient` 또는
`createClient`로 구성한 클라이언트를 모두 받습니다:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

동일한 상태는 EVM 측에서도
`0x0000000000000000000000000000000000000A02`에 있는
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
프리컴파일(`@qorechain/evm`에서 `pqcKeyStatus`로 노출됨)을 통해 읽을 수 있습니다.
위의 헬퍼들은 viem 피어가 필요 없는 JSON-RPC 메서드를 우선합니다.

## 한 번의 호출로 등록

`ensurePqcRegistered`는 계정을 양자 안전하게 만듭니다. 이 함수는 **멱등적**입니다.
상태 소스를 전달하면 키가 이미 등록되어 있을 때 등록을 건너뛰므로, 앱이 시작될
때마다 호출해도 안전합니다.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

내부적으로는 서명자의 Dilithium 공개 키(`pqcKeypair`에서 가져옴)와 선택적으로
계정의 ECDSA 공개 키를 담아 `MsgRegisterPQCKey`를 빌드하고 브로드캐스트합니다.

## 하이브리드 서명

`migrateToHybrid`는 등록을 보장하고, 키페어가 기존의 `buildHybridTx` /
`signAndBroadcastHybrid` 빌더에 미리 바인딩된 하이브리드 전송 경로를
반환합니다:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## 키 회전

PQC 키를 회전해야 한다면(알고리즘 업그레이드 또는 손상된 키), 기존 키와 새 키
모두의 소유권을 증명하는 `MsgMigratePQCKey`를 브로드캐스트하는
`migratePqcKey`를 사용하세요:

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
키가 있을 때마다 **양자 안전** 표시를 보여줍니다.
