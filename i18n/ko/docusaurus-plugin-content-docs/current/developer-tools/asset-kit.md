---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kit는 QoreChain에서 실물 자산을 나타내는 허가형 토큰을 발행하고 관리하기 위한 오픈 소스 도구입니다. 상태가 서로 다른 두 부분으로 이루어져 있습니다. 한 부분은 지금 QoreChain EVM Engine에서 실행되는 EVM 컨트랙트 모음입니다. 규제 자산을 위한 두 개의 개방형 토큰 표준(ERC-3643과 CMTAT)용 어댑터, 지분이 제한된 볼트, 그리고 모든 보유자가 등록된 ML-DSA-87 키를 가지도록 요구하는 QoreChain 고유의 통제 하나가 포함됩니다. 다른 부분은 네이티브 체인 모듈에 대한 **제안**입니다. 애플리케이션을 제안된 규칙에 맞춰 설계하고 테스트할 수 있도록 protobuf 인터페이스, 네 가지 언어의 클라이언트, 인메모리 목(mock)으로 공개되어 있습니다.

발행자, 명의개서 대리인, 펀드 관리자, 컴플라이언스 및 법무 팀, 그리고 QoreChain 테스트넷에서 규제 토큰을 프로토타입으로 만들려는 통합 개발자를 위한 도구입니다. 버전은 **0.1.0**, Apache-2.0([게시 위치](#where-published)에 나열된 라이선스 예외 제외)이며 QoreChain Association이 유지보수합니다. 1.0 이전 버전이며 **감사를 받지 않았습니다**.

:::caution 라이브인 것과 아닌 것
- **오늘 동작하는 것(테스트넷 전용):** `qorechain-diana`(EVM 체인 ID 9800)에서의 EVM 컨트랙트, Foundry 배포 스크립트, 발행자 콘솔. 보유자 검사는 `0x0A02`의 `pqcKeyStatus` 프리컴파일을 읽으며, 이 프리컴파일은 테스트넷에서 활성이고 **메인넷에서는 활성이 아닙니다**.
- **메인넷(`qorechain-vladi`, EVM 체인 ID 9801):** 보유자 검사는 **fail closed**로 동작합니다. 명시적으로 면제되지 않은 모든 주소는 자격 없음으로 처리되므로, 가드로 보호되는 토큰은 일반 보유자 사이에서 이동할 수 없습니다. 배포 스크립트는 체인 9801에서 실행을 거부합니다.
- **어디에서도 라이브가 아닌 제안:** 네이티브 모듈 `x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`는 어떤 QoreChain 네트워크에도 존재하지 않으며, 이를 추가하는 업그레이드도 예정되어 있지 않습니다. 이 모듈들의 클라이언트는 인메모리 목과만 통신할 수 있습니다.
- 저장소의 **법률 템플릿**은 법률 전문가와 논의하기 위한, 검토되지 않은 초안입니다. 법률 자문이 아닙니다.
:::

## 혁신 {#innovations}

- **표준 자체의 통제 위에 더해지는 포스트 퀀텀 보유자 검사.** 가드는 `0x0A02`의 `pqcKeyStatus(address)`를 읽고, 이 호출이 `registered`, 알고리즘 id 1(ML-DSA-87), `possessionProven`을 반환할 때에만 주소를 받아들입니다. 소유 증명 없이 등록된 키는 다른 사람의 것일 수 있으므로 인정되지 않습니다. 업스트림 표준의 모든 통제(신원 레지스트리, 클레임 토픽, 동결, 일시 중지, 강제 이전)는 그대로 적용되며, 이 검사는 그 위에 추가됩니다.
- **엄격한 디코딩을 갖춘 fail closed.** 가드는 고정된 가스 한도로 프리컴파일을 호출하고 응답을 엄격하게 디코딩합니다. 이전의 세 필드 레이아웃으로 된 응답, 형식이 잘못된 응답, 또는 응답이 없는 경우는 "키 없음"으로 처리됩니다. 프리컴파일이 활성이 아닌 곳에서는 면제되지 않은 모든 주소가 자격 없음입니다.
- **세 어댑터 뒤의 같은 가드.** `QoreChainHybridHolderRule`은 제한 코드 60, 61, 62와 함께 CMTAT v3 토큰의 `ruleEngine`(또는 CMTA RuleEngine 안의 규칙)으로 연결됩니다. `QoreChainHybridHolderModule`은 ERC-3643 모듈형 컴플라이언스에 플러그 앤 플레이 모듈로 연결됩니다. 볼트는 가드를 포함한 모든 `IHolderEligibility` 정책을 받습니다.
- **제한된 토큰을 세탁할 수 없는 볼트 지분.** `QoreChainRwaVault`(ERC-4626)와 `QoreChainRwaAsyncVault`(ERC-7540, `FULFILLER_ROLE`을 가진 운영자가 요청을 일괄 정산)는 모든 지분 이동의 수신 측을 검사합니다. 자격 없는 수신자에 대해 `maxDeposit`과 `maxMint`는 0을 반환합니다. 상환은 거부되지 않습니다.
- **수정 없이 사용하는 업스트림 컨트랙트.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0, OpenZeppelin은 복사본이 아니라 git 서브모듈입니다.
- **존재하기 전에 테스트할 수 있는 제안.** `ChainClient`의 모든 호출은 네트워크 요청을 보내지 않고 `ChainUpgradeRequired`(코드 `CHAIN_UPGRADE_REQUIRED`와 모듈 이름)로 실패합니다. `MockChain`은 제안된 규칙을 메모리에서 구현하며, 제안된 오류 코드 이름(예: `ERROR_CODE_ADDRESS_FROZEN`)을 담은 `MockChainError`로 거부합니다. 애플리케이션은 목을 대상으로 작성하면서 실제 클라이언트를 연결해 둘 수 있으므로, 업그레이드가 없을 때 조용히 실패하지 않고 명확하게 보고됩니다.
- **백엔드가 없는 콘솔.** 발행자 콘솔은 자체적으로 네트워크 요청을 보내지 않는 React 페이지입니다. 프로덕션 빌드는 `connect-src 'none'`인 Content-Security-Policy를 설정하며, 모든 것은 연결된 지갑을 통해 처리됩니다.
- **오프라인으로 실행되는 테스트.** 33개의 Foundry 테스트는 프리컴파일의 테스트 더블을 사용해 네트워크 없이 실행됩니다.

## 기능 {#what-it-does}

**QoreChain EVM(테스트넷)에서 오늘 동작하는 것:**

- **`QoreChainHybridHolderGuard`.** 주소가 소유 증명이 있는 등록된 ML-DSA-87 키를 가지고 있는지 알려줍니다(`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). 볼트와 에스크로 같은 컨트랙트를 위한 소유자 관리 면제(`setExempt`, 사유가 포함된 이벤트 `ExemptionSet`). 소유권은 두 단계로 이전됩니다(OpenZeppelin `Ownable2Step`).
- **`QoreChainHybridHolderRule`.** 가드에 매핑된 CMTAT v3 이전 규칙. `detectTransferRestriction`, `detectTransferRestrictionFrom`, `messageForTransferRestriction`을 통한 제한 코드 60(송신자), 61(수신자), 62(지출자).
- **`QoreChainHybridHolderModule`.** 가드에 매핑된 ERC-3643(T-REX v4) 모듈형 컴플라이언스 모듈. `moduleCheck`가 송신자와 수신자를 검사합니다. 컴플라이언스별 구성은 없습니다.
- **`QoreChainRwaVault`와 `QoreChainRwaAsyncVault`.** 위에서 설명했습니다.
- **`IERC7518`.** ERC-7518 파티션을 위한 인터페이스 스케치이며 구현은 없습니다. ERC-165 id `0x5a264a5d`는 테스트로 확인됩니다.
- **배포 스크립트(Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol`, `script/DeployVaults.s.sol`. 프리컴파일이 응답하는지와 배포자의 키 상태를 보고하고 체인 9801을 거부하는 공통 사전 점검(`script/QoreChainTestnet.sol`)을 사용합니다.
- **발행자 콘솔**(`packages/issuer-console`). 모든 EIP-6963 지갑에 연결하고, QoreChain Testnet을 추가하거나 전환하며, 가드로 보호되는 CMTAT 토큰을 생성하고(`DeployCmtat.s.sol`과 같이 가드, 규칙, 토큰), 기존 CMTAT 또는 ERC-3643 토큰을 열고, 에이전트 작업(발행, 소각, 동결, 동결 해제, 강제 이전, 일시 중지, 일시 중지 해제)을 실행하며, 체인 이벤트로 만든 보유자 목록과 감사 로그를 보여줍니다.

**제안(체인에 없음):**

- `proto/`의 `x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`용 protobuf 인터페이스와 `docs/proposal.md`의 해당 의미 규정.
- TypeScript, Python, Go, Java 클라이언트: 생성된 타입, `ChainClient`, `MockChain`.

**저장소의 참고 문서:**

- `docs/evm-adapters.md`: 컨트랙트, 업스트림 라이선스, 테스트넷 배포.
- `docs/technology-standards.md`: 발행자나 감사인이 확인해야 할 방식으로 네트워크를 설명하는 초안(신뢰성, 거버넌스, 업그레이드 권한, 트랜잭션 순서, 관측 가능성, 사고 처리, 키 관리). 각 사실에는 Verified, Documented, Not measured, Not published 중 하나가 표시되어 있습니다.
- `legal/`: 논의를 위한 템플릿 세 개([제한 사항](#limits) 참조).

## 사용 사례 {#use-cases}

1. **발행자가 테스트넷에서 허가형 토큰을 프로토타입으로 만듭니다.** 발행자는 `DeployCmtat.s.sol`(또는 발행자 콘솔)로 CMTAT 토큰을, `DeployErc3643.s.sol`로 전체 ERC-3643 스위트를 배포하고, 실제 발행을 결정하기 전에 `qorechain-diana`에서 동결, 일시 중지, 강제 이전, 보유자 검사를 시험합니다.
2. **펀드 관리자가 지분 제한 볼트로 청약과 상환을 처리합니다.** 투자자는 `QoreChainRwaAsyncVault`에 입금을 요청하고, 관리자는 `fulfillDeposit`과 `fulfillRedeem`으로 일괄 처리합니다. 지분은 자격 있는 주소만 받을 수 있고, 상환은 지분을 가진 모든 사람에게 열려 있습니다.
3. **컴플라이언스 팀이 모든 보유자에게 포스트 퀀텀 키 등록을 요구합니다.** `QoreChainHybridHolderRule`(CMTAT) 또는 `QoreChainHybridHolderModule`(ERC-3643)을 추가하면, 표준 자체의 신원 및 허용 목록 통제에 더해, 소유 증명이 된 등록 ML-DSA-87 키를 가진 주소에만 토큰을 발행하거나 이전할 수 있습니다.
4. **통합 개발자가 제안된 네이티브 모듈에 맞춰 개발합니다.** 지갑, 레지스트리, 백오피스는 TypeScript, Python, Go, Java의 `MockChain`을 대상으로 코드를 작성하고, 그 이벤트와 오류 코드를 검증하며, `ChainClient`를 연결해 둡니다.
5. **제품 팀이 대금 동시 결제(delivery-versus-payment)와 증명 흐름을 설계합니다.** 제안된 `x/settlement`(양측 확인이 있는 지시, 모든 레그 또는 전무)와 `x/attest`(유효 기간과 만료 상태가 있는 진술)는 `MockChain`에서 사용자 흐름 설계를 위해 시험해 볼 수 있으며, 둘 다 체인에 존재하지 않음을 전제로 합니다.
6. **법무 팀이 법률 전문가와 서류 작업을 시작합니다.** 스위스 원장 기반 증권, 리히텐슈타인 TVTG 토큰 약관, EU DLT 파일럿 체제 계약 개요용 템플릿은 구조와 채워 넣을 기술 매핑 섹션을 제공합니다. 해당 관할의 자격 있는 법률 전문가가 사용 전에 모든 것을 검토합니다.
7. **실사 검토자가 네트워크 사실을 읽습니다.** `docs/technology-standards.md`는 라이브 네트워크에서 무엇을 확인할 수 있고 무엇이 측정되지 않았거나 공개되지 않았는지를 출처와 함께 나열합니다.

## 작동 방식 {#how-it-works}

### EVM에서의 보유자 검사 {#holder-check}

`0x0A02`의 프리컴파일은 `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`에 응답합니다. 가드는 `registered && algorithmId == 1 && possessionProven`을 요구합니다. 이로 인해 가드는 fail closed로 동작합니다. 프리컴파일이 활성이 아닌 곳에서는 명시적으로 면제되지 않은 모든 주소가 자격 없음입니다. 프리컴파일 자체와 네트워크 상태는 [EVM 프리컴파일](/developer-guide/evm-precompiles)을 참조하세요.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

이 검사는 추가적입니다. 업스트림 표준의 모든 통제는 그대로 적용됩니다. ERC-3643의 신원 레지스트리(ONCHAINID), 클레임 토픽, 신뢰 발행자, 동결, 부분 동결, 일시 중지, 강제 이전, 복구와 CMTAT의 동결, 부분 동결, 일시 중지, 강제 이전, 문서, 스냅샷이 그렇습니다.

### 검사가 다루는 범위 {#coverage}

중요한 것은 수신입니다. 키가 없는 주소로의 발행이나 이전은 거부됩니다. CMTAT 규칙은 송신자도 검사하며, `transferFrom`에서는 지출자도 검사합니다. ERC-3643 모듈은 송신자와 수신자를 검사합니다. ERC-3643은 지출자를 컴플라이언스 모듈에 전달하지 않으므로, 거기서는 `transferFrom` 지출자가 검사되지 않습니다. 소각은 거부되지 않으므로(ERC-3643에서 `burn`은 컴플라이언스 모듈을 전혀 참조하지 않습니다), 자격을 잃은 보유자도 여전히 상환받을 수 있습니다.

### 볼트 {#vaults}

두 볼트 모두 모든 지분 이동의 수신 측을 검사하며, 상환은 거부되지 않습니다. ERC-7540 볼트에서 요청은 컨트롤러별(요청 id 0)로 집계됩니다. 이행자는 대기 중인 입금을 이행 시점의 볼트 자체 자산 대비 지분 비율로 지분으로 전환하며, 외부 평가 입력은 없습니다. 이후 컨트롤러는 `deposit` 또는 `mint`, 혹은 `redeem` 또는 `withdraw`로 청구합니다. 볼트 컨트랙트 자체는 기초 토큰을 보유할 수 있어야 합니다. ERC-3643 신원 레지스트리 또는 CMTAT 허용 목록에 등록되어 있어야 하고, 가드에서 면제되어야 합니다(`DeployVaults.s.sol`이 가드 면제를 설정합니다).

### QoreChain에서 EVM 트랜잭션 보내기 {#native-prerequisites}

QoreChain의 모든 EVM 트랜잭션은 송신자가 다음을 갖춘 경우에만 허용됩니다.

1. `MsgRegisterPQCKeyV2`와 소유 증명으로 등록된 ML-DSA-87 키, 그리고
2. 하이브리드 서명(secp256k1 더하기 ML-DSA-87)된 네이티브 레인 트랜잭션 안의 `/qorechain.pqc.v1.MsgOpenEVMWindow`로 열린 EVM 인가 윈도우.

배포에서는 윈도우의 `allowed_targets`가 **비어 있어야** 하고(대상이 제한된 윈도우는 컨트랙트 생성을 거부합니다), `max_txs`는 트랜잭션 수 이상, `max_value`는 모든 트랜잭션의 value와 최대 수수료를 합한 값을 포괄해야 하며, `blocks`는 충분히 길어야 하고(최대 17,280), `native_only`는 false여야 합니다. 윈도우를 여는 일은 계정 시퀀스를 증가시키며, 이는 EVM nonce이기도 합니다. 먼저 윈도우를 열고 나서 스크립트를 실행하세요. 호출과 가스 추정에는 윈도우가 필요하지 않습니다. 배경: [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)과 [EVM 개발](/developer-guide/evm-development#evm-window).

### 제안 {#proposal}

생성 시 고정되거나 완화만 가능한 여섯 가지 플래그(`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`). 역할(발행자, 에이전트, 감사인, 신원 에이전트, 클레임 발행자, 증명자). 순서가 있는 이전 검사. 기록된 사유와 함께하는 동결, 부분 동결, 환수, 강제 이전. 클레임은 있지만 개인 정보는 체인에 없는 신원. 버전이 있는 컴플라이언스 모듈 레지스트리(`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`). 확인이 있는 결제 지시. `FRESH`, `STALE`, `MISSING` 상태를 가진 증명. 명세는 저장소의 `docs/proposal.md`입니다. 텍스트와 목이 서로 다른 경우, 의도된 동작은 텍스트입니다. 이 모든 것은 설계일 뿐이며, 어느 것도 QoreChain 네트워크에 존재하지 않습니다.

## 사용 방법 {#how-to-use}

### 설치 {#install}

| 부분 | 설치 | 최소 플랫폼 |
|---|---|---|
| Solidity 컨트랙트(GitHub) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (태그 `v0.1.0`), 또는 Foundry 의존성으로: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (T-REX와 ONCHAINID 파일은 0.8.17 사용); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (패키지 `assetkit`) | Go 1.23 |
| Python | PyPI에 `qorechain-asset-kit`으로 **출시 예정**이며 아직 게시되지 않았습니다. 지금은 복제본에서: `cd clients/python && python -m pip install .` (import `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | npm에 `@qorechain/asset-kit`으로 **출시 예정**이며 아직 게시되지 않았습니다. 지금은 복제본에서: `pnpm install && pnpm -r build` | Node.js 22.12 |
| 발행자 콘솔 | 복제본에서: `pnpm install` 후 `pnpm --filter @qorechain/issuer-console dev` (패키지로 게시되지 않음) | EIP-6963 지갑이 있는 브라우저 |

저장소 README와 TypeScript 클라이언트 README는 `@qorechain/asset-kit`이 설치된 것처럼 import합니다. 이는 npm 릴리스 전까지 복제본에서만 동작합니다.

`forge install`을 사용하면 컨트랙트는 `lib/qorechain-asset-kit/contracts/` 아래에, 그 자체의 의존성은 `lib/qorechain-asset-kit/contracts/lib/` 아래에 놓입니다. 가드, CMTAT 규칙, 볼트를 컴파일하는 리매핑은 다음과 같습니다.

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### 퀵스타트 1: 컨트랙트 빌드 및 테스트(오프라인) {#quickstart-build}

저장소 README에서 가져왔습니다. 네트워크도 계정도 필요 없습니다.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

관찰된 출력은 `33 tests passed, 0 failed, 0 skipped (33 total tests)`로 끝납니다.

### 퀵스타트 2: 테스트넷에 대한 배포 드라이 런 {#quickstart-dry-run}

`--broadcast` 없이 Foundry는 테스트넷 상태를 대상으로 시뮬레이션하고 아무것도 보내지 않습니다. 드라이 런에서는 어떤 주소든 `--sender`로 쓸 수 있습니다.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet`은 `foundry.toml`에 `https://evm-testnet.qore.host`로 정의되어 있습니다. 사전 점검은 체인 ID(9800), `pqcKeyStatus precompile: active`, 배포자의 키 상태를 출력합니다. 키가 없는 주소에는 `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.`를 추가로 출력합니다. 그런 다음 가드, 규칙, 토큰이 가지게 될 주소를 출력합니다. 같은 명령을 메인넷에 대해 실행하면 `QoreChain mainnet: the hybrid-holder guard is testnet only`와 함께 중단됩니다. `script/erc3643/DeployErc3643.s.sol`과 `script/DeployVaults.s.sol`도 같은 방식으로 실행됩니다. 선택적 환경 변수: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### 테스트넷에서 브로드캐스트하기 전에 {#before-broadcast}

1. 직접 관리하는 테스트넷 계정과 약간의 테스트넷 QOR을 사용하세요([Faucet](/dashboard/faucet) 참조). 메인넷 니모닉은 절대 사용하지 말고, 예제에서 쓰는 공개 테스트 구문에는 절대 자금을 넣지 마세요.
2. 해당 계정의 ML-DSA-87 키를 소유 증명과 함께 등록하세요([QoreSign](/qoresign/overview)의 `examples/register-and-send` 예제가 하나를 등록합니다).
3. [EVM 트랜잭션 보내기](#native-prerequisites)의 설정으로, 비어 있는 `allowed_targets`와 함께 EVM 인가 윈도우를 여세요. [QoreChain SDK](/sdk/overview)가 메시지를 구성하고(TypeScript에서는 `pqc` 메시지 그룹의 `openEvmWindow`, Python에서는 `qorsdk.msg.pqc.open_evm_window`) 윈도우를 다시 읽습니다(`fetchEvmWindow`, `get_evm_window`).
4. `--broadcast`와 지갑 구성을 사용해 스크립트를 실행하세요.
5. 토큰을 보유해야 하는 모든 컨트랙트(볼트, 에스크로)를 `guard.setExempt`로 면제하고, 토큰 자체의 컴플라이언스에 보유자를 등록하며, 발행 전에 `guard.isHybridHolder(address)`로 각 보유자를 확인하세요.

### 퀵스타트 3: 발행자 콘솔(테스트넷) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

EIP-6963 지갑을 연결하고 QoreChain Testnet으로 전환한 다음, CMTAT 토큰을 생성하거나 주소로 기존 토큰을 여세요. 체인 9801에서는 콘솔이 경고를 표시하고 토큰 생성을 비활성화합니다. 콘솔은 키를 등록하거나 윈도우를 열지 않으므로, 위의 2단계와 3단계를 먼저 수행하세요.

### 퀵스타트 4: MockChain으로 제안된 모듈에 맞춰 개발(Python, 오프라인) {#quickstart-python}

Python 클라이언트 README에서 가져왔습니다. PyPI 릴리스 전까지는 복제본에서 설치하세요([설치](#install) 참조).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

관찰된 출력: `ERROR_CODE_ADDRESS_FROZEN`. `ChainClient()`에 대한 같은 호출은 `module == "x/asset"`, `code == "CHAIN_UPGRADE_REQUIRED"`와 함께 `ChainUpgradeRequired`를 발생시킵니다.

### 퀵스타트 5: Go에서의 동일한 예제(모듈 프록시 v0.1.0) {#quickstart-go}

Go 클라이언트 README에서 가져와 `main` 패키지로 감쌌습니다.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

관찰된 출력: `mock mint error: <nil>` 다음에 `true x/asset`. Java 클라이언트 README에는 `MockChain`, `MsgCreateAsset.newBuilder()`, `MockChainError.code()`를 사용하는 동등한 예제가 있습니다.

:::note
저장소의 Go 및 TypeScript README에는 스니펫에 작은 오류가 있으며 0.1.1에서 수정될 예정입니다. 위의 Go 예제는 수정된 버전입니다.
:::

## 주요 API {#main-api}

### 컨트랙트 {#api-contracts}

| 이름 | 기능 |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | `0x0A02`에 대한 가드: `isHybridHolder`, `isEligible`, `requireHybridHolder` (`HybridKeyRequired`로 revert), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | CMTAT 규칙: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; 코드 `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | ERC-3643 모듈: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | 지분이 제한된 ERC-4626 볼트 |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | ERC-7540 볼트: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator`, 그리고 컨트롤러를 지정하는 `deposit`, `mint`, `redeem`, `withdraw`; `FULFILLER_ROLE`; 미리보기는 설계상 revert |
| `IHolderEligibility` | `isEligible(address)`: 볼트에 다른 자격 정책을 연결 |
| `IERC7518` | 파티션 인터페이스 스케치 |
| `forge script script/DeployCmtat.s.sol` | 가드, 규칙, CMTAT 토큰 |
| `forge script script/erc3643/DeployErc3643.s.sol` | T-REX 인프라, 가드, 모듈, 토큰 스위트 하나 |
| `forge script script/DeployVaults.s.sol` | 제한된 토큰 위의 두 볼트와 가드 면제 |

### 클라이언트(제안) {#api-clients}

TypeScript와 Java 이름을 표시했습니다. Python은 snake_case(`create_asset`)를 사용하고, Go는 접근자 뒤에서 Go 표기를 사용합니다(`chain.Asset().CreateAsset(ctx, msg)`).

| 이름 | 기능 |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | 모든 호출이 `ChainUpgradeRequired`로 실패하며 네트워크 요청 없음 |
| `MockChain` (Go `NewMockChain()`) | 제안된 규칙을 메모리에서 구현하며, 거부 시 `MockChainError`를 던짐 |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; 쿼리 `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; 쿼리 `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; 쿼리 `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; 쿼리 `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; 쿼리 `latest`, `history`, `attesters` |
| 목 헬퍼 | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python은 `has_hybrid_key`, `height`, `time`도 제공) |

## 접근 방법 {#how-to-access}

| | 테스트넷 `qorechain-diana` | 메인넷 `qorechain-vladi` |
|---|---|---|
| EVM 체인 ID | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| `pqcKeyStatus` 프리컴파일 `0x0A02` | 활성 | 활성 아님(`eth_call`이 빈 데이터를 반환). 활성화하려면 거버넌스 결정이 필요하며, 아직 내려지지 않음 |
| 하이브리드 보유자 가드, 규칙, 모듈 | 동작 | Fail closed: 면제되지 않은 모든 주소가 자격 없음이므로, 토큰이 일반 보유자 사이에서 이동할 수 없음 |
| 배포 스크립트 | 드라이 런 및 브로드캐스트 | 실행 거부 |
| 발행자 콘솔 | 전체 | 경고. 토큰 생성 비활성화 |
| 네이티브 모듈(`x/asset` 등) | 존재하지 않음 | 존재하지 않음 |

EVM 트랜잭션을 보내는 모든 작업의 요구 사항: 등록된 ML-DSA-87 키(소유 증명 포함)가 있는 계정과 열려 있는 EVM 인가 윈도우이며, 둘 다 네이티브 레인에서 하이브리드 서명된 트랜잭션으로 설정합니다. 읽기(`eth_call`, 로그, 가스 추정, 드라이 런)에는 둘 다 필요하지 않습니다. `MockChain`과 Foundry 테스트에는 네트워크가 전혀 필요 없습니다. 다른 엔드포인트와 faucet은 [테스트넷 연결](/getting-started/connecting-to-testnet)과 [메인넷 연결](/getting-started/connecting-to-mainnet)을 참조하세요.

염두에 둘 네트워크 동작: `PREVRANDAO`는 상수입니다(키트의 어떤 컨트랙트도 사용하지 않습니다). 블롭 트랜잭션(타입 3)은 거부되며 타입 0, 1, 2, 4는 허용됩니다. EIP-7702 위임에는 권한 계정 본인의 포스트 퀀텀 동의(`MsgAuthorizeEVMDelegation`)가 필요합니다.

## 게시 위치 {#where-published}

2026년 10월 28일에 라이브로 확인했습니다(GitHub 릴리스, Maven Central, Go 프록시는 0.1.0을 제공하며 PyPI와 npm은 404를 반환합니다).

| 레지스트리 | 패키지 | 버전 | 링크 |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Go 모듈 프록시 | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (태그 `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **출시 예정** (아직 PyPI에 없음) | |
| npm | `@qorechain/asset-kit` | **출시 예정** (게시되지 않음) | |
| GitHub (Solidity 컨트랙트, 발행자 콘솔, protos, 문서, 법률 템플릿) | `qorechain/qorechain-asset-kit` | 릴리스 v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

저장소: https://github.com/qorechain/qorechain-asset-kit. 유지보수: QoreChain Association.

**라이선스.** 코드는 Apache-2.0이지만, ERC-3643 참조 구현과 함께 컴파일되는 `contracts/script/erc3643/`와 `contracts/test/erc3643/`는 GPL-3.0-or-later입니다. `docs/`와 `legal/`의 문서는 Apache-2.0입니다. 의존성은 각자의 라이선스를 유지하며 git 서브모듈로 수정 없이 사용됩니다. T-REX와 ONCHAINID(GPL-3.0), CMTAT(MPL-2.0), OpenZeppelin(MIT)입니다. 배포된 ERC-3643 토큰은 해당 라이선스에 따른 T-REX 코드이고, 배포된 CMTAT 토큰은 MPL-2.0에 따릅니다. `NOTICE` 파일에 모든 의존성이 나열되어 있습니다.

## 제한 사항 및 알려진 문제 {#limits}

- **네이티브 모듈은 존재하지 않습니다.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`는 제안입니다. 이를 추가하는 업그레이드는 예정되어 있지 않습니다. 0.1.0에서 `ChainClient`는 절대 성공할 수 없으며, `MockChain`은 체인이 아니라 개발 도구입니다.
- **보유자 검사는 테스트넷 전용입니다.** 메인넷에서 가드는 fail closed로 동작하므로, 메인넷 배포는 이에 의존할 수 없습니다.
- **에이전트 권한은 보유자 검사를 우회합니다.** 두 표준 모두에서 에이전트의 강제 이전과 지갑 복구는 규칙이나 모듈을 참조하지 않습니다. CMTAT `forcedTransfer`와 ERC-3643 `forcedTransfer`, `recoveryAddress`는 키가 없는 주소에 토큰을 놓을 수 있습니다. 에이전트 역할을 가진 주체를 제한하세요.
- **ERC-3643 `transferFrom` 지출자는 모듈이 검사하지 않습니다.** ERC-3643이 지출자를 컴플라이언스에 전달하지 않기 때문입니다. CMTAT 규칙은 지출자를 검사합니다.
- **소각과 상환은 열려 있습니다.** 두 토큰 표준과 두 볼트 모두에서 설계상 자격을 잃은 보유자에게도 열려 있습니다.
- **대기 중인 ERC-7540 요청은 취소할 수 없습니다**(0.1.0). 에이전트가 비동기 볼트에서 자산을 옮기면 `totalAssets`가 0으로 읽히고, 없어진 자산이 필요한 청구는 발행자가 잔액을 복원할 때까지 실패합니다.
- **ERC-7540 볼트에는 외부 평가 입력이 없습니다.** 전환은 볼트 자체의 지분당 잔액을 사용합니다.
- **EVM에는 대금 동시 결제와 증명이 없습니다.** 이들은 제안된 `x/settlement`와 `x/attest`로만 존재합니다.
- **ERC-7518은 인터페이스 스케치**이며 구현이 아닙니다. 파티션은 지금도 하나의 신원 레지스트리나 규칙을 공유하는 등급 또는 트랑슈별 토큰 하나로 모델링할 수 있습니다.
- **CMTA RuleEngine v3**는 여전히 릴리스 후보로 게시되어 있습니다. 규칙은 토큰의 `ruleEngine`으로 직접 동작하며 두 규칙 인터페이스 id(`0x2497d6cb`, `0xb1a69752`)를 모두 알립니다.
- **발행자 콘솔**은 키 등록, 윈도우 열기, ERC-3643 스위트나 볼트 배포, CMTAT 역할, 부분 동결, 문서, 스냅샷 관리를 하지 않습니다.
- **Python과 TypeScript는 레지스트리에 없습니다.** PyPI와 npm 릴리스 전까지는 복제본을 사용하세요. 이 페이지는 이들에 대한 레지스트리 설치 명령을 제공하지 않습니다.
- **README 오류.** 저장소 README의 Go 및 TypeScript 스니펫에는 0.1.1에서 수정될 작은 오류가 있습니다. 이 페이지의 퀵스타트를 사용하세요.
- **법률 템플릿.** `legal/`에는 논의를 위한 초안 세 개가 있습니다. 스위스 원장 기반 증권(채무법 제973d조부터 제973i조), TVTG에 따른 리히텐슈타인 토큰 약관("token container" 방식), EU DLT 파일럿 체제(규정 (EU) 2022/858)에 따른 운영자 계약 개요입니다. 이들은 법률 전문가의 검토를 받지 않았고 법률 자문이 아니며, 사용하기 전에 해당 관할의 자격 있는 법률 전문가가 반드시 검토해야 합니다. 이를 사용하는 것이나 키트를 사용하는 것은 특정 발행이 어떤 법적 요건을 충족하는지에 대해 아무것도 말해 주지 않습니다. QoreChain Association은 어떤 자산에 대해서도 발행자, 등록 기관, 수탁자, 거래 장소, 법률 자문가로서 행동하지 않습니다.
- **1.0 이전.** 제안된 protos는 어떤 마이너 버전에서도 바뀔 수 있습니다.

## 보안 참고 사항 {#security}

- **감사를 받지 않았습니다.** 컨트랙트는 독립적인 검토를 받은 적이 없습니다. 검토 없이 실제 가치를 보관하는 데 사용하지 마세요.
- 키는 소유자에게 남아 있습니다. 가드는 체인에서 공개 키 상태를 읽을 뿐 개인 키를 다루지 않습니다. 배포자, 소유자, 에이전트 키는 등록된 ML-DSA-87 키를 가진 일반 EVM 계정입니다. 발행자, 가드 소유자, 에이전트 역할은 서로 다르고 잘 보호된 계정에 두세요.
- 가드 소유자가 면제를 통제합니다. 면제는 키 없이도 주소를 자격 있게 만듭니다. 설계상 자산을 보유하는 컨트랙트에 부여하고, `ExemptionSet` 이벤트를 지켜보세요.
- 에이전트 역할은 보유자 검사를 우회할 수 있습니다(강제 이전, 복구). 이를 토큰에서 가장 민감한 역할로 취급하세요.
- 가드는 fail closed로 동작하고 프리컴파일 응답을 엄격하게 디코딩하며, 소유 증명이 없는 키를 유효하다고 보지 않습니다.
- 발행자 콘솔의 프로덕션 빌드는 `connect-src 'none'`인 Content-Security-Policy를 설정합니다. 페이지는 자체적으로 네트워크 요청을 보내지 않으며, 모든 것은 지갑을 통해 처리됩니다.
- `MockChain`은 메시지의 서명자 필드를 신뢰합니다(서명이 없습니다). 보안 경계가 아닙니다.
- CMTAT, ERC-3643 참조 구현, ONCHAINID, OpenZeppelin의 문제는 해당 유지보수자에게도 전달해야 합니다.
- 키트의 취약점은 security@qore.network로 비공개로 신고하세요.

## 관련 페이지 {#related}

- [QoreChain SDK](/sdk/overview): ML-DSA-87 키 등록과 EVM 인가 윈도우 열기(`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): 키를 등록하고 윈도우를 여는 네이티브 레인 트랜잭션을 위한 하이브리드 서명.
- [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)과 [계정과 PQC 서명](/sdk/concepts/accounts-pqc): 키 등록과 하이브리드 서명.
- [EVM 개발](/developer-guide/evm-development#evm-window): EVM 인가 윈도우.
- [EVM 프리컴파일](/developer-guide/evm-precompiles): `0x0A01`과 `0x0A02`, 테스트넷에서만 활성.
- [체인 개발자 키트](/developer-tools/chain-dev-sdk): Foundry, Hardhat, viem 템플릿과 윈도우 헬퍼(SDK 0.11.0, 출시 예정).
- [커스터디 키트](/developer-tools/custody-kit)와 [QoreScan](/developer-tools/qorescan): 수탁 기관 및 암호화 자산 목록화를 위한 인접 키트.
- [개발자 패키지](/developer-tools/overview): 모든 패키지와 레지스트리 상태.
- 업스트림 표준: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
