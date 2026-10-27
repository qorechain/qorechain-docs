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

`isPqcRegistered` / `getPqcStatus`는 주소에 등록된 PQC 키가 있는지를 읽습니다.
`createClient`로 구성한 클라이언트가 주어지면 REST(`GET /qorechain/pqc/v1/account/{address}`,
모든 공개 엔드포인트가 제공)로 읽고, 단독 `QorClient`가 주어지면 `qor_getPQCKeyStatus`
JSON-RPC 메서드를 사용하는데, **공개 엔드포인트는 이를 제공하지 않으므로**
([`qor_` 네임스페이스](/api-reference/json-rpc-qor_-namespace) 참조), `*.qore.host`에
대해서는 구성된 클라이언트를 전달하세요. 0.9.0 이전 릴리스는 항상 `qor_` 메서드를
사용했고 JSON-RPC 오류 `-32601`로 실패했으므로, 그 경우에는 REST 경로를 직접
읽으세요.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

경로는 `GET /qorechain/pqc/v1/account/{address}`입니다(단수형 `account`). 등록된
주소에는 `{"found": true, "account": {…}}`를, 그렇지 않은 경우에는
`{"found": false, "account": null}`을 응답합니다. `client.rest.getPqcAccount(address)`는
이 본문을 반환하고, `fetchPqcStatus({ rest, address })`는 이를 위의 상태로 변환합니다.
읽을 수 없는 응답(HTTP 오류, 전송 실패)은 한 번 재시도한 뒤 예외로 던져지며,
"등록되지 않음"으로 해석되는 일은 없습니다. 0.8.x에서 `getPqcAccount`는 체인이
제공하지 않는 복수형 `/accounts/` 경로를 호출했습니다.

동일한 상태는 EVM 측에서도
`0x0000000000000000000000000000000000000A02`에 있는
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
프리컴파일(`@qorechain/evm`에서 `pqcKeyStatus`로 노출됨)이 활성화되면 읽을 수
있습니다. 이 프리컴파일은 메인넷에서 활성화되어 있지 않으며, 테스트넷에서는 활성으로 나열되어 있습니다(2026년 10월 27일 확인;
[네트워크 상태](/developer-guide/evm-precompiles#network-status) 참조).

## 한 번의 호출로 등록 {#register-in-one-call}

`ensurePqcRegistered`는 계정을 양자 안전하게 만듭니다. 서명자의 ML-DSA-87 공개
키를 담아 `MsgRegisterPQCKeyV2`를 빌드하고 브로드캐스트합니다. **멱등적**입니다.
먼저 계정의 상태를 읽고(`rest`를 전달하면 REST로), 계정이 이미 이 키쌍의 키를
보유하고 있으면 등록을 건너뛰므로, 앱이 시작될 때마다 호출해도 안전합니다. 계정이
*다른* 키를 보유하고 있으면 `PqcKeyMismatchError`를 던지고 아무것도 보내지
않습니다. 여러분의 키쌍으로 서명한 모든 하이브리드 트랜잭션이 거부될 것이기
때문입니다. 확인 없이 등록하는 일은 절대 없습니다. 상태를 읽을 수 없으면 예외를
던집니다(키가 없다는 것을 알고 있는 계정에 대해서만 `force: true`를 전달하세요).

등록은 클래식 서명으로 이루어지며 하이브리드 요구 사항에서 면제되므로, 새 계정이
첫 키를 부트스트랩할 수 있습니다. v3.2.3부터 이 면제는 키가 없는 계정에만
적용됩니다(이미 키를 보유한 계정은 등록 또는 마이그레이션에 하이브리드 서명을
해야 하며, 체인은 약하거나 퇴화한 키, 재사용된 키를 거부합니다). 네트워크가
v3.2.3을 적용하면 이 헬퍼는 새 키로 선택적 **소유 증명**에 서명하여 첨부합니다
(체인 ID는 `chainId` 또는 노드에서 읽으며, v3.2.3을 적용하지 않은 네트워크에서는
이전 노드가 이를 거부하므로 해당 필드를 생략합니다). 이는 CosmJS 서명자, 즉
coin-type-118 계정(`deriveNativeAccount`)을 통해 서명합니다. 통합 eth-native 계정의
경우 등록을 `EthNativeSigner`와 `signMode: "classical"`로 서명하세요
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

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### 복구할 수 있는 키 {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)`은 계정의 주소와 니모닉으로부터 ML-DSA-87
키를 파생하므로, 분실한 기기를 복구할 수 있고 모든 언어와 지갑이 동일한 키를
파생합니다(니모닉 하나, 계정당 키 하나). 먼저 주소를 소문자 `qor1…` 형태로
정규화하므로, 통합 계정의 `0x` 형태도 같은 키를 생성합니다. 대응하는 함수는
다음과 같습니다:

| 언어 | 함수 | 게시됨 |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (`Result` 반환) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

레거시 파생(`derivePqcLegacy`, `"bridge"`)은 계정에 바인딩되지 않으며 새 키에는
더 이상 사용되지 않습니다(deprecated). 회전 헬퍼는 이를 새 키로 받지 않습니다
([키 회전](#rotate-a-key) 참조).

Python에서의 등록(0.9.0. 상태 읽기는 REST로 이루어지며, 호출은 다른 키가 등록되어
있으면 두 번째 등록 비용을 지불하는 대신 `PqcKeyMismatchError`를 발생시킵니다):

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Go(`pqcdx.Signer.RestURL`), Rust(`pqc_dx` `rest_url`), Java(`signer.restUrl`)
헬퍼는 동일한 REST 경로에서 상태를 읽고 소유 증명도 같은 방식으로 첨부합니다.

다른 SDK들은 하이브리드 트랜잭션 빌더(Python과 Rust의 `build_hybrid_tx`, Go의
`tx.BuildHybridMessages`, Java의 `PqcDx.HybridSendPath`)를 통해 하이브리드로
서명합니다. 여러분을 대신해 하이브리드로 서명해 주는 것은 TypeScript의
`TxClient`뿐입니다.

:::warning 항상 먼저 확인하게 하세요
체인은 같은 키의 두 번째 등록을 **수수료를 차감한 뒤에** 거부합니다. 따라서
`ensurePqcRegistered`는 먼저 REST(`/qorechain/pqc/v1/account/{address}`)로 상태를
읽고, 판단할 수 없을 때는 등록을 거부합니다. `rest`(또는 `qor_*`를 제공하는 노드를
위한 `statusSource`, 미리 읽어 둔 `status`)를 전달하세요. `force: true`는 확인을
건너뜁니다. 0.8.x에서는 이 헬퍼에 REST 폴백이 없었고, 직접 `status`를 전달하지
않으면 확인 없이 등록을 브로드캐스트했습니다.
:::

## 하이브리드 서명

클라이언트에 `pqcKeypair`가 있으면 `tx.bankSend(...)`와
`tx.signAndBroadcast([messages], "auto")`는 하이브리드로 서명합니다(`fee: "auto"`
경로는 하이브리드 트랜잭션을 시뮬레이션하고 포스트 양자 검증에 드는 가스를 더합니다).
하이브리드 서명은 네트워크가 검증하는 sign-bytes 형태에 대해 계산됩니다
([어떤 sign-bytes 형태인가?](/sdk/concepts/accounts-pqc#sign-bytes-versions) 참조).
클라이언트는 REST 엔드포인트를 통해 네트워크에 이를 질의합니다.

`migrateToHybrid`는 등록을 보장하고, 키쌍이 하위 수준의 `buildHybridTx` /
`signAndBroadcastHybrid` 빌더에 미리 바인딩된 하이브리드 전송 경로를
반환합니다. 수수료, 계정 번호, 시퀀스를 직접 관리할 때 사용합니다. SDK가
sign-bytes 형태를 확인할 수 있도록 `rest`를 전달하세요:

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
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

## 키 회전 {#rotate-a-key}

계정의 ML-DSA-87 키를 **같은** 알고리즘의 다른 키로 교체하려면(예: 레거시
`shake256(mnemonic)` 키를 주소에 바인딩된 정식 키로 옮기거나, 손상된 키를 폐기하는
경우), `rotatePqcKeyMsgFromMnemonic`으로 `MsgRotatePQCKey`를 빌드하세요. 두 키가
모두 이 메시지에 이중 서명합니다. 전체 예제는
[키 회전](/sdk/guides/authenticators#key-rotation)을 참조하세요.

`migratePqcKeyHybrid`는 이전 방식의 `MsgMigratePQCKey`를 브로드캐스트하며, 이는
계정을 **알고리즘** 간에 옮기고, v3.2.3부터 체인이 키를 보유한 계정에 요구하는
하이브리드 서명을 사용합니다. `pqcKeypair`는 **현재** 등록된 키(교체되어 나가는
키)이며, 호출자는 두 개의 소유권 서명(이전 키의 `oldSignature`, 새 키의
`newSignature`)을 제공해야 합니다. 클래식 `migratePqcKey`는 더 이상 사용되지
않습니다(deprecated). v3.2.3 노드는 키를 보유한 계정의 클래식 마이그레이션을
거부합니다.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## UI에서

[`@qorechain/react`](/sdk/guides/react) 키트는 이 모든 것을 React에서 노출합니다.
`usePqcStatus` 훅과 `<QuantumSafeBadge/>` 컴포넌트는 연결된 계정에 등록된 PQC
키가 있을 때마다 **양자 안전** 표시를 보여줍니다. 둘 다 구성된 클라이언트와 함께
`getPqcStatus`를 통해 상태를 읽으므로, `@qorechain/react` 0.9.0부터는 REST로
읽어 공개 엔드포인트에서도 동작하며, 0.8.x는 그곳에서 키를 확인할 수 없었습니다.
