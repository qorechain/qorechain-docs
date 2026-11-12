---
slug: /sdk/install
title: 설치
sidebar_label: 설치
sidebar_position: 2
---

# 설치

사용하는 언어에 맞는 SDK를 설치하세요. TypeScript 코어(`@qorechain/sdk`),
EVM 및 SVM 어댑터(`@qorechain/evm`, `@qorechain/svm`), React 키트
(`@qorechain/react`), 그리고 Python, Go, Rust, Java 클라이언트는 모두
완전한 네이티브 체인 패리티(타입드 메시지, 쿼리, tx 라이프사이클, 하이브리드
PQC 트랜잭션, WebSocket 구독)를 갖춘 채 각 레지스트리에 **게시**되어 있습니다.
현재 릴리스는 **0.13.0**이며 2026년 11월 11일에 게시되었습니다
(2026년 11월 11일에 각 레지스트리에서 확인했습니다. Java는 예외이며 표를 참고하세요).

| 레지스트리 | 패키지 | 버전 |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.13.0 (`create-qorechain-dapp`: 0.13.1, SDK 0.13.0 위에 얹은 템플릿 전용 패치) |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.13.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.13.0 |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-sdk/packages/go` | v0.13.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | Published (Maven Central, v0.13.0; JDK 17 이상, 2026년 11월 11일 확인) |

Python, Rust, Go, Java에는 0.11.0이 없습니다. npm 패키지에는 2026년 10월 29일에
0.11.0이 있었고(체인 개발자 키트, 아래 참조) 모든 언어가 0.10.0에서 0.12.0으로
함께 올라갔습니다. 0.13.0이 2026년 11월 11일에 모든 언어에서 뒤를 이었습니다.

아래에서 언어를 선택하세요.

## 업그레이드 안내 {#upgrade}

:::danger 라이브 네트워크에서는 SDK 0.8.1 이상을 사용하세요
두 공개 네트워크 모두 **v2 하이브리드 sign-bytes** 형태(도메인 태그가 붙고 체인 id에
바인딩됨)를 검증하며, 이전 형태는 `pqc` 코드 21로 거부합니다. **0.8.0** 이전의
모든 SDK 릴리스는 이전 형태로 서명하며, **0.8.0**은 네트워크가 사용한 두 가지
업그레이드 이름 중 하나로만 전환 시점을 찾기 때문에(메인넷은 이를 `v3.2.0`으로,
테스트넷은 `v3.1.98`과 이후 `v3.2.0`으로 기록했습니다) 메인넷에서 잘못된 형태로
서명합니다. 모든 언어에서 **0.13.0**(최소한 **0.8.1**)을 사용하세요. [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를
열려면 **0.8.2 이상**이 필요합니다. 하이브리드 빌더는 `signBytesVersion` 옵션
(`"auto"` | `"v1"` | `"v2"`)을 받습니다. `"auto"`는 네트워크에 문의하므로
`qorechain-vladi` / `qorechain-diana`에서 REST 엔드포인트(`rest`)가 필요하며,
추측하는 대신 예외를 던집니다.
[어떤 sign-bytes 형태인가?](/sdk/concepts/accounts-pqc#sign-bytes-versions)를
참조하세요.
이 형태는 체인 v3.2.3과 v3.2.4(v3.2.4는 테스트넷에서 2026년 10월 19일부터, 메인넷에서 2026년 10월 23일부터 실행 중이며, v3.2.5와 v3.2.6은 여기에 변경을 주지 않았고, 메인넷은 2026년 11월 4일부터 v3.2.6을 실행 중)에서 바뀌지 않았습니다. `"auto"`는
두 네트워크 모두에서 v2로 결정되는데, 두 네트워크 모두 v2로 전환한 업그레이드를 적용했기 때문입니다.
:::

## 0.13.0의 변경 사항 {#whats-new-0130}

SDK 0.13.0(2026년 11월 11일)은 모든 언어를 위한 하나의 릴리스입니다. TypeScript, Python,
Go, Rust, Java와 함께 `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`,
`create-qorechain-dapp`이 포함됩니다. 호환성을 깨는 변경이 하나 있으며, 시드 경로
계정 헬퍼에 대한 것입니다. 니모닉에서 파생한 계정은 달라지지 않으며, 하이브리드
서명 형식과 체인 동작도 그대로이므로 0.12.0으로 만든 트랜잭션은 계속 유효합니다.
(Java는 Maven Central에 0.13.0으로 게시되어 있습니다. 2026년 11월 11일 확인.)

**호환성을 깨는 변경.** 시드 경로 헬퍼 `unifiedAccountFromSeed`(TypeScript),
`unified_account_from_seed`(Python, Rust), `unified.UnifiedAccountFromSeed`(Go),
`UnifiedAccounts.unifiedAccountFromSeed`(Java)에는 이제 두 입력 중 정확히 하나가
필요합니다. `QRC1` 복구 코드 또는 독립적인 32바이트 PQC 비밀입니다. ML-DSA-87 키는
이 두 번째 비밀에서 파생됩니다. 옵션 없이 호출하거나 둘 이상을 주면 오류가 발생합니다.

옵션 `legacySeedDerivation`(Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`)은 선택 사항입니다. 0.13.0 이전에 만든 계정의 PQC 키를
복구해 `MsgRotatePQCKey`로 로테이션하려는 경우에만 사용하세요. 새 계정용이 아닙니다.

| 영역 | 0.13.0에서 |
| --- | --- |
| 시드 경로 헬퍼 | `QRC1` 복구 코드 또는 독립적인 32바이트 PQC 비밀(정확히 하나)이 필요하며, 옵션이 없거나 둘 이상이면 오류가 발생합니다. 니모닉 계정은 달라지지 않습니다 |
| `legacySeedDerivation` | 선택 사항이며, 0.13.0 이전에 만든 계정의 PQC 키를 복구해 `MsgRotatePQCKey`로 로테이션할 때만 사용합니다 |
| `QRC1` 복구 코드 | 모든 언어에 추가됨: `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret`(Python과 Rust는 snake_case, Go는 `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | `keyVerified`를 보고합니다 |
| 템플릿 | `pnpm window recovery-code`가 새 코드를 출력합니다. `PRIVATE_KEY`를 쓰면 `pnpm window`가 `QORE_PQC_RECOVERY_CODE`를 읽고 없으면 메시지를 출력하고 중단하며, `QORE_MNEMONIC`을 쓰면 달라지는 것이 없습니다. Foundry와 Hardhat 템플릿은 `^0.13.0`에 의존합니다 |
| sign-bytes 버전 `"auto"` | 먼저 `/qorechain/pqc/v1/protocol_features`에서 `pqc-sign-bytes-v2` 프로토콜 기능을 읽고, 그 읽기가 실패할 때만 적용된 업그레이드 계획으로 되돌아갑니다 |
| `getPqcStatus` / `get_pqc_status` | 노드의 응답에 등록 플래그가 없으면 "등록되지 않음"으로 보고하는 대신 오류를 발생시킵니다 |
| Python | 트랜잭션 결과 코드와 EVM 윈도우의 `found`, `live` 필드를 엄격하게 파싱하며, `wait_for_tx`는 `tx_response` 또는 `txhash`가 없는 응답을 아직 대기 중인 것으로 취급합니다 |

**언어별 시드 경로 옵션**. 세 가지 중 정확히 하나를 전달하세요.

| 언어 | 호출 | 복구 코드 | 독립적인 32바이트 비밀 | 이전 키(복구 전용) |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (`"QRC1-..."` 문자열) | `{ pqcSecret }` (`seed32`와 독립적인 32바이트 `Uint8Array`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Python 옵션은 키워드 전용입니다. `pqcSecret`은 `pqcRecoveryCodeFromSecret(secret32)`로 그 비밀에서 만든 복구 코드와 같은 키를 줍니다. TypeScript에는 `pqcKeyFromRecoveryCode(code, qor1)`도 있습니다.

**마이그레이션(TypeScript).** 복구 코드를 한 번 만들어 시드와 따로 보관하세요.

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

PQC 키를 0.12 이하로 등록한 계정은 `{ legacySeedDerivation: true }`로 이전 키를 불러와
`rotatePqcKeyMsg`로 로테이션합니다.

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

복구 코드를 보관하세요. 코드가 다르면 키도 다릅니다.

## 0.12.0에서 추가된 것 {#whats-new-0120}

SDK 0.12.0은 메인넷이 2026년 10월 29일 높이 3,906,833에서 적용한 체인 **v3.2.5**를
위한 클라이언트 릴리스입니다(테스트넷은 10월 26일에 적용했습니다). 메인넷은
11월 4일부터 v3.2.6을 실행 중이고, 테스트넷은 10월 27일부터 v3.2.6을, 11월 6일부터 12일까지 v3.2.7을, 11월 12일부터 v3.2.8을 실행 중이며,
하이브리드 서명 형식, 주소, 소수 자릿수, 메모는 바뀌지 않았으므로 0.10.0으로 만든
트랜잭션은 계속 유효합니다. TypeScript, Python, Go, Rust, Java는
모두 `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`,
`create-qorechain-dapp`과 함께 0.12.0으로 올라갑니다. 이 릴리스는 모든 언어에서
테스트넷의 하이브리드 뱅크 전송으로, 그리고 테스트넷에서 KEM 키를 등록하고
다시 읽고 제거하는 것으로, 그리고 메인넷 조회로 확인했습니다.

| 영역 | 0.12.0에서 |
| --- | --- |
| 기본값이 공개 엔드포인트 | `mainnet`과 `testnet` 프리셋이 이제 localhost 대신 공개 엔드포인트(두 네트워크 모두 REST, 컨센서스 RPC, EVM JSON-RPC, 테스트넷은 EVM WebSocket도)를 가리킵니다. 따라서 인자 없는 `createClient()`는 공개 테스트넷과 통신합니다. [네트워크 및 엔드포인트](/sdk/reference/network#public-endpoints)를 참조하세요 |
| `localnet` 프리셋 | 0.12.0 이전에 모든 프리셋이 사용하던 localhost 포트, 체인 ID `qorechain-devnet`. 이전 동작을 유지하려면 `createClient({ network: "localnet" })`으로 선택하세요 |
| 하이브리드 트랜잭션의 정확한 가스 | v3.2.5를 적용한 네트워크에서 하이브리드 네이티브 트랜잭션의 `"auto"` 수수료는 `ceil(simulated x 1.02) + 2000`이며, 시뮬레이션이 이제 포스트 양자 검증 자체를 부과하기 때문입니다. 하이브리드 뱅크 전송은 약 289,000 대신 약 171,600 가스를 요청하며 수수료도 그에 따라 줄어듭니다. 이전 네트워크, 클래식 트랜잭션, 실패한 플랜 조회는 이전 규칙을 유지하며, 직접 전달한 배수는 두 규칙 모두를 대체합니다. `exactHybridGas`(및 모든 언어의 대응 항목)와 TypeScript의 `estimateGasDetails`(시뮬레이션, 가스 한도, 어느 규칙이 설정했는지를 보고). Java에 자동 가스 경로가 추가되었습니다 |
| ML-KEM-1024 키 레지스트리 | 계정이 ML-KEM-1024 캡슐화 키 하나(알고리즘 2, 1,568바이트)를 게시하면 누구든 그 키로 암호화할 수 있습니다. `msg.pqc.registerKemKey`와 `msg.pqc.removeKemKey`(키를 먼저 확인합니다: 크기, 모든 계수가 3329 미만, 전부 0이 아님), `validateKemPublicKey`, 그리고 `/qorechain/pqc/v1/kem/{address}`(bech32 또는 `0x`)를 읽는 `fetchKemKey`. 두 메시지 모두 하이브리드 서명이 필요합니다. 이 경로는 메인넷과 테스트넷에서 응답합니다. SDK는 암호화하지 않습니다. 봉인된 페이로드는 [QoreSeal](/developer-tools/qoreseal)을 참조하세요 |
| 어카운트 추상화 | 계정의 저장된 지출 규칙과 연결된 키(해지된 키 포함)에 대한 조회, `MsgUpdateConfig`(모듈을 켜고 끄는 거버넌스 메시지), 계정 뷰의 `authenticators_count` |
| 지출 규칙 확인 | 규칙은 체인이 확인하는 방식 그대로 확인됩니다. `erc20/`, `erc721/` 또는 `erc1155/` denom은 `0x` 컨트랙트 주소를 지정해야 합니다. `abstractaccount` 코드 8(잘못된 지출 규칙)과 9(모듈 비활성화)에 이름이 붙어 있습니다 |
| 거버넌스 파라미터 | 크로스 VM `MsgUpdateParams`(EVM 브리지 프리컴파일이 호출할 수 있는 CosmWasm 컨트랙트 포함)와 롤업 `MsgUpdateParams`로, 각각 서명 전에 체인의 한도에 대해 확인됩니다. 크로스 VM 파라미터 조회는 `bridge_allowed_targets`를 담고 있습니다 |
| 업그레이드 상수와 proto | `CHAIN_UPGRADE_V3_2_5`. 체인 v3.2.5와 동기화된 protobuf 정의 |
| 체인 개발자 키트 | npm 전용 0.11.0부터 0.12.0에 포함: `@qorechain/evm`은 viem 체인 `qorechain`(9801)과 `qorechainTestnet`(9800), 그리고 EVM 인가 윈도우 헬퍼(`evmWindowStatus`, `openEvmWindowMessage`, viem 없이 쓰는 `@qorechain/evm/window`로도)를 내보냅니다. `create-qorechain-dapp`에는 `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` 템플릿이 있습니다. `@qorechain/react`에는 `PqcStatusBadge`가 있습니다(기존 `QuantumSafeBadge` 이름은 더 이상 사용되지 않는 별칭으로 유지됩니다) |
| 수정 | `svmRpc` 없이 엔드포인트를 받은 `@qorechain/svm`이 localhost를 사용했는데, 이제 엔드포인트가 구성되지 않았다고 알려 줍니다. Python 코드 생성이 QoreChain proto 사이의 import를 패키지 안으로 지정합니다 |

**업그레이드할 때 확인해야 할 동작 변경.** 코드가 localhost 기본값에 의존했다면
`localnet`을 선택하거나 `endpoints`를 전달하세요. 공개 테스트넷
엔드포인트는 IP별로 속도가 제한되므로, 프로덕션 트래픽은 자체
노드를 운영하거나 사용해야 합니다. 어떤 프리셋도 공개 네트워크에서 gRPC나 SVM 엔드포인트를 설정하지 않으며
(SVM 트랜잭션은 열려 있지 않습니다), 메인넷에는 공개 EVM WebSocket이 없습니다. 이들 중 하나가
필요한 코드는 localhost로 폴백하는 대신, 전달해야 할 엔드포인트를 알려 주는 오류와 함께
실패합니다. Rust에서 선택적 엔드포인트는 이제 `Option<String>`이며, Python, Go,
Java에서 설정되지 않은 엔드포인트는 각각 `None`, 빈 문자열, `null`입니다.

노드는 바이너리 버전을 보고하지 않습니다. 기능을 감지하려면 그것을 도입하는
모든 업그레이드 이름에 대해 `isUpgradeApplied`를 사용하거나,
`https://download.qore.host/<net>/latest.json`에서 `.version`을 읽으세요.

## 0.10.0에서 추가되었던 것 {#whats-new-0100}

SDK 0.10.0은 메인넷이 2026년 10월 23일 높이 3,742,566에서 적용한 체인 **v3.2.4**를
위한 클라이언트 릴리스입니다(테스트넷은 10월 19일 높이 8,337,253에서 적용했습니다).
서명 형식, 주소, 소수 자릿수, 메모, 수수료는 바뀌지 않았으며, 0.9.0으로 만든
트랜잭션은 계속 유효합니다. 이 릴리스는 모든 언어에서 테스트넷의 실제 트랜잭션으로
확인했습니다. v3.2.4 이후에 도입된 것에 대한 빌더는 없었으며, v3.2.5에서 추가된 것은
[0.12.0](#whats-new-0120)과 함께 들어왔습니다. 메인넷은 2026년 11월 4일부터 v3.2.6을 실행 중이며(높이
4,020,000, 거버넌스 제안 15. 그 앞의 v3.2.5는 10월 29일 높이
3,906,833부터) 서명 형식이 바뀌지 않았으므로 0.10.0은 그곳에서 계속 동작합니다. 테스트넷은 v3.2.5와
v3.2.6을 2026년 10월 26일과 27일에, v3.2.7을 11월 6일에, v3.2.8을 11월 12일에 적용했습니다(어느 SDK 릴리스에도 v3.2.7 메시지용 빌더는 없습니다). 0.10.0이
가져온 것은 다음과 같습니다(모두 0.13.0에도 그대로 있습니다).

| 영역 | 0.10.0에서 |
| --- | --- |
| 스테이킹 티어(`x/stakingtier`) | 컴포저 `lockDelegation`(체인 자체의 검사: 3, 6 또는 12개월의 기간과 양의 정수 금액), `unlockEarly`, `claimBonus`, `updateParams`. 모듈 파라미터, 보유자의 락, 보너스 풀에 대한 읽기(`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`). 모듈의 오류 코드. 모듈이 하는 일은 [스테이킹과 위임](/user-guide/staking-and-delegation)에 설명되어 있습니다 |
| 인증자 논스 | `fetchAuthNonce({ rest, address, pubkey })`는 연결된 키가 `MsgExecuteEVM` / `MsgExecuteCosmos`에 대해 다음에 서명해야 하는 시퀀스를 직접 추적하는 대신 `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`에서 읽습니다. 두 네트워크 모두 이 경로를 제공합니다. `abstractaccount` 모듈 자체는 메인넷에서 꺼져 있으므로(테스트넷에서는 켜져 있음) 메인넷 지출은 논스를 확인하기 전에 거부됩니다 |
| 프로토콜 기능 스위치 | `fetchProtocolFeatures`와 `isProtocolFeatureEnabled`는 네트워크가 어떤 컨센서스 규칙을 강제하는지를 이름으로 `/qorechain/pqc/v1/protocol_features`에서 읽습니다(두 네트워크 모두 제공). v3.2.4 미만의 네트워크는 이 경로를 제공하지 않으므로 그곳에서는 `isUpgradeApplied`를 사용하세요 |
| `possessionProven` | PQC 상태가 계정의 키가 소유 증명과 함께 등록되었는지를 알려 줍니다 |
| `ibcTimeoutTimestamp(seconds)` | `MsgTransfer`가 받는 단위(Unix 나노초)의 절대 IBC 타임아웃. IBC 타임아웃은 절대 시각이며, IBC v2 패킷은 절대 Unix 초를 받고 거기에 상대값을 쓰면 수수료가 부과된 뒤에 거부됩니다. 메인넷에는 열린 IBC 채널이 없습니다(2026년 10월 27일 확인) |
| 업그레이드 상수와 proto | `CHAIN_UPGRADE_V3_2_4`. 체인 v3.2.4와 동기화된 protobuf 정의(브리지 검증자 등록, 라이트 노드, 롤업 쿼리의 새 필드) |
| `ensurePqcRegistered` | 공개 키가 없는 상태를 일치하는 것으로 비교했습니다. 이제 `rest`로 키를 읽어 비교합니다. 읽을 곳이 없으면 키가 호출자의 것이라고 주장하는 대신 결과가 `keyVerified: false`를 보고합니다 |
| 수수료 시뮬레이션 중의 거부 | 텍스트로만 도착하는 체인 거부(예: "no bonus to claim")를 이제 모든 언어에서 체인에 등록된 오류 설명으로 명명합니다. `decodeTxError`(TypeScript), `SimulationRefusedError`(Python), `tx.DecodeRefusalText`(Go), `tx::decode_refusal_text`(Rust), `TxError.decode`(Java) |

`@qorechain/react`와 `create-qorechain-dapp`도 함께 0.10.0으로 올라갔으며, 둘 다
지금은 0.13.0입니다.

## 0.9.0에서 추가되었던 것 {#whats-new-090}

SDK 0.9.0은 체인 **v3.2.2**와 **v3.2.3**을 위한 클라이언트 릴리스였습니다(메인넷은
이를 높이 3,556,788과 3,662,051에서 적용했으며, 메인넷은 2026년 10월 23일(높이 3,742,566)부터 v3.2.4를 실행했고 10월 29일부터 v3.2.5를 실행했으며 2026년 11월 4일부터 v3.2.6을 실행 중이고, 테스트넷은 2026년 10월 19일부터 v3.2.4 이상을 실행합니다).
서명 형식, 주소, 소수 자릿수, 메모, 수수료는 바뀌지 않았으므로, 0.8.1 이상이
서명하는 v2 하이브리드 sign-bytes 형태가 여전히 올바른 형태입니다.
새로 추가된 내용은 다음과 같습니다.

| 영역 | 0.9.0(및 이후)에서 |
| --- | --- |
| 하이브리드 `TxClient` (TypeScript) | 계정의 키페어를 전달합니다: `client.connectTx(signer, { pqcKeypair })` 또는 `TxClient.connect({ …, pqcKeypair, rest })`. 그러면 모든 트랜잭션이 하이브리드로 서명되고 `fee: "auto"`는 하이브리드 트랜잭션 자체를 시뮬레이션합니다. 단독 키 등록은 클래식으로 유지됩니다(체인의 부트스트랩 경로). `bankSend`와 SDK의 롤업, 멀티레이어, 크로스 VM 클라이언트가 이를 사용합니다. 키페어가 없으면 아무것도 바뀌지 않습니다 |
| 복구 가능한 PQC 키 | `derivePqcCanonical(address, mnemonic)`과 모든 언어의 대응 함수([하이브리드 서명](/sdk/guides/quantum-safe#canonical-derivation) 참조) |
| `ensurePqcRegistered` | 먼저 REST(`rest`)로 키 상태를 읽고, 판단할 수 없으면 등록을 거부하며, 계정에 이미 다른 키가 있으면 `PqcKeyMismatchError`를 던지고, 체인의 "이미 등록됨" 거부는 성공으로 처리합니다. 체인 v3.2.3부터는 **소유 증명**을 스스로 서명해 첨부하며, v3.2.3 이전에는 해당 필드를 비워 둡니다 |
| 범위가 제한된 EVM 윈도우 | `openEvmWindowMsg`가 `nativeOnly`와 `allowedTargets`(최대 16개, 중복 불가)를 받고, `fetchEvmWindow`가 둘 다 다시 읽습니다([EVM 가이드](/sdk/guides/evm#evm-window) 참조) |
| EIP-7702 동의 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| 키 무결성 | 등록 빌더는 `classical_only`, 빈 키, 퇴화된 ML-DSA-87 키를 거부하며, 체인도 v3.2.3부터 이를 거부합니다. `signProofOfPossession` / `verifyProofOfPossession`이 내보내지고, `migratePqcKeyHybrid`는 키가 있는 계정이 v3.2.3부터 필요로 하는 하이브리드 서명된 `MsgMigratePQCKey`를 전송합니다 |
| 추상 계정 다이제스트 v2 | `evmAuthSignBytesV2`(호출의 가스 한도를 바인딩)와 `resolveEvmAuthDigestVersion`. `abstractaccount` 모듈은 메인넷에서 꺼져 있으므로(테스트넷에서는 켜져 있음) 메인넷에서는 참고용입니다 |
| 업그레이드 감지 | `isUpgradeApplied`, `requireUpgradeApplied`: 새 선택 필드는 `applied_plan`이 해당 릴리스를 보고한 뒤에만 설정됩니다. 릴리스를 적용하지 않은 노드는 그 릴리스의 새 필드가 하나라도 설정되면 트랜잭션 전체를 거부하기 때문입니다 |
| 오류 디코딩 | 블록 안에서 실패한 경우 codespace가 유지됩니다(예: `sdk_231`이 아닌 `pqc` 231). `rate_limited`와 위임 코드가 디코딩되고, `decodeTxError`는 던져진 오류의 로그 또는 메시지를 읽습니다 |
| 지출 규칙 | `validateSpendingRules`가 `MsgUpdateSpendingRules` 빌더에서 실행되며 아무것도 제한하지 않는 규칙을 거부합니다 |
| 수정 사항 | PQC 계정 경로는 모든 SDK에서(그리고 합성된 클라이언트를 사용할 때의 `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus`에서도) 단수형 `/qorechain/pqc/v1/account/{address}`입니다. 내보낸 `VERSION`이 패키지와 일치합니다. SDK가 만든 Go 및 Rust 클라이언트는 멈추는 대신 타임아웃됩니다. `create-qorechain-dapp` 템플릿은 함께 제공되는 릴리스에 의존합니다 |

새 키에 대한 레거시 PQC 파생(`derivePqcLegacy`, `"bridge"`)은 더 이상 권장되지
않습니다. 이 파생은 계정에 바인딩되지 않아, 하나의 니모닉이 모든 계정에 같은
키를 주게 되기 때문입니다. 로테이션 헬퍼는 이를 **새** 키로 사용하는 것을
거부하며, 기존 레거시 키를 복구하거나 그 키에서 로테이션해 벗어나는 것은
여전히 동작합니다.

## 0.9.0 이전 버전 {#before-090}

0.8.x를 사용 중이라면, 이 버전은 여전히 두 네트워크가 검증하는 형태로 서명하며
메인넷과 테스트넷에서 동작합니다. 다음은 0.9.0이 없앤
제약이며, 알지 못하면 수수료가 드는 경우도 있습니다.

| 0.9.0 이전 릴리스 | 우회 방법 |
| --- | --- |
| 소유 증명, 범위가 제한된 윈도우, EIP-7702 동의 빌더 없음 | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets`, `authorize-evm-delegation` / `clear-evm-delegation`을 사용하세요([EVM 승인 윈도우](/getting-started/first-transaction#evm-window), [EIP-7702 위임](/architecture/post-quantum-security#eip-7702) 참조) |
| `status` 없는 `ensurePqcRegistered`는 확인 없이 등록을 브로드캐스트했고, 다른 키가 등록되어 있어도 성공으로 보고했음 | 이미 키가 있는 계정에 대한 두 번째 등록은 **수수료가 차감된 뒤에** 거부됩니다. 먼저 `GET /qorechain/pqc/v1/account/{address}`를 읽고 `status: { registered: found }`를 전달하세요 |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | 복수형 `/accounts/` 경로 또는 공개 엔드포인트가 제공하지 않는 `qor_` 네임스페이스(HTTP 501, `-32601`)를 호출했습니다. 위의 단수형 REST 경로를 읽으세요 |
| `TxClient` / `bankSend`와 롤업, 멀티레이어, 크로스 VM 클라이언트는 클래식 전용으로 서명했음 | 네트워크는 키가 있는 계정에 대해 이를 거부합니다. `signAndBroadcastHybrid`로 전송하세요 |
| 블록 안에서 실패한 트랜잭션이 codespace를 잃음 | `GET /cosmos/tx/v1beta1/txs/{hash}`에서 트랜잭션을 읽으세요 |
| 0.8.3의 내보낸 `VERSION` 상수가 `0.8.0`으로 보고됨 | 설치된 버전은 `package.json`에서 읽으세요 |
| `create-qorechain-dapp` 0.8.0은 `@qorechain/sdk` / `@qorechain/evm`을 `^0.3.0`으로 고정함(0.x 버전의 캐럿은 0.3 안에 머뭅니다) | 스캐폴딩 후 `npm i @qorechain/sdk@latest`를 실행하세요 |
| `@qorechain/react` 0.8.x는 공개 엔드포인트에서 등록된 키의 상태를 읽을 수 없게 두었음 | `@qorechain/react` 0.9.0 이상을 사용하세요 |

:::caution 이전 수정 사항
SDK **0.6.1**은 컨센서스에 치명적인 버그를 수정했습니다:
`/qorechain.pqc.v1.PQCHybridSignature` tx 본문 확장이
`Any.value`에 JSON으로 직렬화되어 **CheckTx 단계에서 체인에 의해 거부**되었습니다.
SDK ≤ 0.6.0으로 생성한 하이브리드(PQC + 클래식) 트랜잭션은 온체인에서 거부됩니다.
**0.8.0**에서는 지갑 서명 계정 헬퍼가 제거되었습니다
([계정 및 PQC 서명](/sdk/concepts/accounts-pqc#phantom) 참조).
:::

## TypeScript

코어 패키지:

```bash
npm i @qorechain/sdk
```

Node.js 20+를 대상으로 하며 ESM, CommonJS, 타입 정의를 함께 제공합니다. 이 문서의
하이브리드 트랜잭션 샘플은 `@cosmjs/stargate`에서 `StargateClient`도 임포트합니다
(`npm i @cosmjs/stargate`).

### EVM 어댑터

`@qorechain/evm`은 [viem](https://viem.sh) 위에 얇게 얹은 타입 안전 어댑터입니다.
viem은 **피어 의존성**이므로 함께 설치하세요:

```bash
npm i @qorechain/evm viem
```

npm에 `0.13.0`으로 게시되어 있습니다. viem 체인 `qorechain`(체인 ID 9801)과 `qorechainTestnet`(9800), 그리고 [EVM 인가 윈도우](/sdk/guides/evm#evm-window) 헬퍼를 내보냅니다.

### SVM 어댑터

`@qorechain/svm`은 **피어 의존성**인
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) 위에 얇게 얹은
어댑터입니다:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm에 `0.8.0`으로 게시되어 있습니다.

### React 키트

`@qorechain/react`는 `@qorechain/sdk` 위에 얹은 공식 React 레이어입니다.
프로바이더, 훅, 그리고 `ConnectButton` / `PqcStatusBadge` 컴포넌트를 제공합니다.
`react`(>=18)는 피어 의존성입니다:

```bash
npm i @qorechain/react
```

npm에 `0.13.0`으로 게시되어 있으며 `@qorechain/sdk` `^0.13.0`에 의존합니다. [React 키트 가이드](/sdk/guides/react)를
참고하세요.

### 스캐폴더

`create-qorechain-dapp`(npm, `0.13.1`)은 바로 실행할 수 있는 dApp을 스캐폴딩합니다:

```bash
npm create qorechain-dapp@latest my-dapp
```

생성된 `package.json` 파일은 스캐폴더와 함께 제공되는 SDK 릴리스에 의존합니다
(`@qorechain/sdk` `^0.13.0`. EVM 템플릿은 `@qorechain/evm` `^0.13.0`을 사용합니다). 0.13.1은 템플릿만 바꿉니다. [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131)를 참고하세요. 컨트랙트 작업을 위한 `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` 템플릿도 있습니다.
스캐폴더 0.8.0 버전은 `^0.3.0` 범위를 기록했는데, 0.x 버전에서 이 범위는
0.3 안에 머물러 라이브 네트워크에 서명할 수 없습니다. 0.8.0으로 스캐폴딩했다면
`npm i @qorechain/sdk@latest`를 실행하세요. [CLI 레퍼런스](/sdk/reference/cli)를
참고하세요.

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+가 필요합니다. 이 패키지는 타입 힌트와 `py.typed` 마커를 제공합니다.

> 배포판은 `qorechain-sdk`로 설치되지만(PyPI에 `0.13.0`으로 게시됨)
> **`qorsdk`로 임포트**합니다:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+가 필요합니다. 필요한 하위 패키지를 임포트하세요. 예를 들면:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

독립형 Go 모듈로 게시되어 있습니다(태그: `packages/go/v0.13.0`). 버전을 명시적으로
고정하세요: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`.

## Rust

```bash
cargo add qorechain-sdk
```

또는 저장소의 최신 헤드를 추적하려면:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+가 필요합니다. 읽기 클라이언트는 비동기(Tokio)입니다. 이 크레이트는
`qorechain`으로 임포트합니다(`use qorechain;`).

> crates.io에 `qorechain-sdk`(0.13.0)로 게시되어 있습니다. `cargo add qorechain-sdk`는
> 최신 릴리스를 설치합니다.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.13.0</version>
</dependency>
```

또는 Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.13.0'
```

> Maven Central에 `io.github.qorechain:qorechain-sdk`로 게시되어 있습니다.
> 0.13.0은 Maven Central에 게시되어 있습니다(2026년 11월 11일 확인).
> JDK 17 이상이 필요합니다. Central에는 0.8.0
> 또는 0.8.1 빌드가 없으므로, 라이브 네트워크에서는 0.8.2 이상을 사용하세요.
> 0.9.1은 Bouncy Castle을 1.80에서 1.85로 올린 Java 전용
> 릴리스였으며 API 변경은 없었습니다.

## 관련 패키지 {#related-packages}

| 패키지 | 용도 | 버전 |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | 지갑 측 헬퍼: 지갑 생성(`generateQoreWallet`), `eth_secp256k1` 하이브리드 서명(`signHybridEth`, `QoreChainSigner`), MetaMask 네트워크 등록(`addQoreEvmToWallet`), 인증자 및 EVM 윈도우 메시지 빌더(`openEvmWindowMsg`는 범위 제한이 없는 형태만 만듭니다), v2 추상 계정 다이제스트. 소유 증명은 첨부하지 않습니다. 피어 의존성: `@cosmjs/proto-signing` 및 `@cosmjs/stargate` `^0.32`(SDK는 cosmjs 0.39를 사용하므로 한 프로젝트에 둘 다 설치하면 npm이 피어 충돌 `ERESOLVE`를 보고합니다. 별도 프로젝트에 두거나 `--legacy-peer-deps`를 전달하세요) | 0.5.0 |
| `@qorechain/chain-bridge` | 백엔드용 서버 측 워커: PQC 키를 파생하고, 하이브리드 서명 후 브로드캐스트합니다(`sendTokens`, `registerPqc` 등). `cosmosRest`를 전달하세요. 전달하면 네트워크가 v3.2.3을 적용한 뒤 등록에 소유 증명이 포함되고, PQC로 보이는 거부는 재등록 전에 체인과 대조해 확인합니다(다른 키가 등록되어 있으면 두 번째 등록 비용을 내는 대신 `pqc_key_mismatch`를 발생시킵니다) | 0.2.3 |
| `@qorechain/pqc` | 표준 전용 ML-DSA / ML-KEM / SHAKE-256 프리미티브와 `hybridSignBytes`([포스트 양자 서명](/developer-guide/post-quantum-signing) 참조). PyPI, crates.io, Maven Central, Go 프록시(Go `v0.2.3`)에도 같은 버전으로 있습니다 | 0.2.3 |
| `@qorechain/handles` | 검증된 `@handle` 해석(`HandleClient`): 레지스트리의 공개 키와 고정(pin) 저장소를 직접 제공하고, 사용자가 주소를 확인한 뒤에 고정합니다. 이 패키지는 스스로 고정하지 않습니다. [체인 브리지와 handle](/developer-tools/chain-bridge#handles)을 참조하세요 | 0.1.0 |
| `@qorechain/connect` | **npm에서 더 이상 사용되지 않으며(deprecated) 유지보수도 중단되었습니다. 새 작업에는 사용하지 마세요. 대신 [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter)를 사용하세요(QoreX 연결의 대체 수단은 [개발자 도구 개요](/developer-tools/overview#group-connect)에 있습니다).** 지갑 어댑터 위에 구축된, EVM, Cosmos, SVM 지갑을 위한 단일 커넥터(피어 범위는 `@qorechain/wallet-adapter` `^0.2.1`이며 0.5.0은 포함하지 않습니다). [EVM 인증 윈도우](/sdk/guides/evm#evm-window)를 열지 않으므로, 이를 통한 EVM 전송은 계정에 등록된 키와 열린 윈도우가 생길 때까지 거부됩니다 | 0.2.1 |
| `@qorechain/rdk` | 롤업 개발 키트(Rollup Development Kit) 클라이언트([롤업](/rollups/why) 참조). 0.7.0부터 `@qorechain/sdk` `^0.10.0`과 `@qorechain/evm` `^0.8.0`에 의존합니다(2026년 11월 4일 npm에서 확인). 0.x 버전의 캐럿은 해당 마이너 안에 머무르므로, SDK 0.13.0을 사용하는 앱은 키트를 위해 중첩된 두 번째 SDK 0.10.x 사본을 받습니다. 키트 릴리스가 0.13으로 올라갈 때까지 둘을 분리해 두세요(한 사본의 클라이언트를 다른 사본에 전달하지 마세요). `pqcKeypair`를 전달할 때만 하이브리드로 서명하며, 읽기는 없어도 동작합니다. PyPI, crates.io, Maven Central에는 `qorechain-rdk`로, Go 모듈로도 게시되어 있습니다(`@v0.8.0`으로 고정하세요). 0.8.0부터 이 네 클라이언트도 하이브리드로 서명합니다(이전 버전은 클래식 전용으로 서명했으며, Java는 Java 21이 필요합니다). [RDK 0.8.0: 변경 사항과 한계](/rollups/deploying-a-rollup#rdk-050-limits)를 참조하세요 | 0.8.0 |
| `@qorechain/rdk-cli` | RDK용 `qorollup` 운영자 CLI. 0.7.1부터 트랜잭션 명령(`create`, `pause`, `resume`, `stop`, `withdraw`)은 하이브리드로 서명합니다(0.7.0 이하는 클래식 전용으로 서명했으며 네트워크가 이를 거부했습니다). npm에서 설치하면 실행되며 `--version`이 설치된 버전을 출력합니다(0.6.1 이하는 아무것도 출력하지 않았습니다) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal: 계정이 KEM 레지스트리에 게시한 ML-KEM-1024 키로 페이로드를 암호화합니다(SDK 0.12.0 이상은 키를 등록하고 읽으며, 암호화는 QoreSeal이 합니다). PyPI(`qorechain-qoreseal`, macOS와 Linux 휠이며 Windows 휠은 다음 버전), crates.io, Maven Central(`io.github.qorechain:qoreseal`과 `qoreseal-android`, Kotlin 사용자는 Kotlin 2.3 이상 필요), Go 모듈 프록시(`github.com/qorechain/qoreseal/go`, Go `v0.1.0`)에도 있고 Swift 패키지로도 제공됩니다. [QoreSeal](/developer-tools/qoreseal)을 참조하세요 | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: EVM 엔진에서 허가형 실물 자산 토큰을 위한 도구로, TypeScript, Python, Java, Go 클라이언트와 Solidity 컨트랙트를 제공합니다(`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0이며, ERC-3643 스크립트와 테스트는 GPL-3.0-or-later입니다. 설명된 네이티브 모듈은 제안일 뿐 구축되지 않았습니다. PyPI의 `qorechain-asset-kit`과 Maven Central의 `io.github.qorechain:asset-kit`에도 있습니다. [Asset Kit](/developer-tools/asset-kit)을 참조하세요 | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: 지갑 및 백엔드 서명, 그리고 커밋된 트랜잭션의 포스트 양자 계층을 확인하는 `inspectTransaction`. PyPI, crates.io, Maven Central에도 있습니다. [QoreSign](/qoresign/overview)을 참조하세요 | 0.2.0 |
| `create-qorechain-rollup` | 롤업 스타터 스캐폴더. 템플릿은 `@qorechain/rdk` `^0.8.0`에 의존하며, `QORE_MNEMONIC` 또는 `QORE_PQC_SEED_HEX`에서 포스트 양자 키를 확보할 수 있으면 하이브리드로 서명합니다 | 0.8.0 |

## 다음

연결하고 온체인 상태를 읽으려면 [Quickstart](/sdk/quickstart)로 이어서 진행하세요.
