---
slug: /developer-tools/chain-dev-sdk
title: 체인 개발자 키트
sidebar_label: 체인 개발자 키트
sidebar_position: 34
---

# 체인 개발자 키트 (EVM 및 QoreChain Native 템플릿)

체인 개발자 키트는 QoreChain SDK **0.11.0**의 일부로, Solidity 및 스마트 컨트랙트 팀이 이미 사용하는 도구로 QoreChain에서 빌드할 수 있도록 돕습니다. `@qorechain/evm`에 viem 체인 정의와 EVM 인가 윈도우 헬퍼를 추가하고, `create-qorechain-dapp`에 네 가지 새 프로젝트 템플릿(Foundry, Hardhat 3, wagmi를 사용하는 viem, QoreChain Native CosmWasm 토큰)을 추가하며, 다섯 가지 언어용 EVM 퀵스타트와 QoreChain EVM이 Ethereum과 어떻게 다른지에 대한 참조를 제공합니다. Ethereum에서 컨트랙트를 이식하는 Solidity 팀, wagmi와 RainbowKit을 쓰는 dApp 프런트엔드 개발자, CosmWasm 개발자, 그리고 QoreChain을 추가하려는 EVM 도구 유지 관리자를 위한 키트입니다.

:::caution 예정: SDK 0.11.0은 태그되었지만 npm에 게시되지 않았습니다
SDK 0.11.0은 GitHub(`qorechain/qorechain-sdk`, 태그 `v0.11.0`, 2026년 10월 27일)에 태그되어 있습니다. **npm 릴리스는 보류 중**이며, 2026년 10월 27일에 `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp`의 0.11.0 버전에 대해 `npm view`를 실행했을 때 아무것도 찾을 수 없었습니다. 이 페이지는 **0.11.0에 대한 설치 명령을 제공하지 않습니다**. 아래에서 **0.11.0부터**로 표시된 모든 항목은 현재 npm에서는 동작하지 않습니다. **현재 사용 가능**으로 표시된 항목은 동작하며, `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 및 0.10.0 언어별 SDK에서 제공됩니다. 0.11.0은 npm 패키지만 변경하며, Python, Rust, Go, Java SDK는 0.10.0에 머뭅니다.
:::

이 키트는 메인넷(`qorechain-vladi`, EVM 체인 ID 9801)과 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)을 대상으로 합니다.

## 현재 사용 가능한 것과 0.11.0에서 예정된 것 {#status}

| 항목 | 상태 | 위치 |
|---|---|---|
| 공개 엔드포인트에 대해 ethers v6, web3.py, go-ethereum, alloy, web3j로 읽기 | **현재 사용 가능** (QoreChain 패키지 불필요) | [퀵스타트 1](#quickstart-ethers) |
| `createEvmClient`, ERC-20, ERC-721, ERC-1155 헬퍼, `precompiles` 바인딩, `PRECOMPILE_ADDRESSES` | `@qorechain/evm` 0.8.0에서 **현재 사용 가능** | [퀵스타트 2](#quickstart-evm-080) |
| `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`로 TypeScript에서 EVM 인가 윈도우 열기 및 읽기 | `@qorechain/sdk` 0.10.0에서 **현재 사용 가능** | [퀵스타트 5](#quickstart-open-window) |
| Python, Go, Rust, Java의 동일한 윈도우 빌더 | 0.10.0 SDK에서 **현재 사용 가능** | [주요 API](#main-api) |
| EIP-7702 동의 헬퍼 `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | `@qorechain/sdk` 0.10.0에서 **현재 사용 가능** | [주요 API](#main-api) |
| 템플릿 `evm-solidity`, `fullstack-web`, `rollup-app`을 제공하는 스캐폴더 | `create-qorechain-dapp` 0.10.0에서 **현재 사용 가능** | [퀵스타트 6](#quickstart-scaffold-live) |
| viem 체인 정의 `qorechain` 및 `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **0.11.0부터** (예정) | [퀵스타트 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, 주소 변환기, 윈도우 상수, 서브패스 `@qorechain/evm/window` | **0.11.0부터** (예정) | [퀵스타트 4](#quickstart-window-helpers) |
| 템플릿 `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` 및 `pnpm window` 헬퍼 | **0.11.0부터** (예정) | [템플릿](#templates) |
| `@qorechain/react`의 `PqcStatusBadge` | **0.11.0부터** (예정) | [주요 API](#main-api) |

## 혁신 {#innovations}

- **전송은 경계가 있는 윈도우로 의도적으로 인가됩니다.** EVM 트랜잭션은 등록된 ML-DSA-87 키와 열린 EVM 인가 윈도우가 있는 계정에서만 허용됩니다. 윈도우는 하이브리드(secp256k1 더하기 ML-DSA-87)로 서명된 네이티브 레인 메시지로 열리므로, EVM 라이브러리가 보유한 secp256k1 키만으로는 지출을 인가할 수 없습니다. Ethereum 트랜잭션 자체는 일반 Ethereum 트랜잭션 그대로입니다.
- **신뢰가 아니라 경계로 크기가 정해지는 윈도우.** 윈도우는 블록 수(1~17,280), EVM 트랜잭션 수(1~1,000), 그리고 허용된 모든 트랜잭션의 값과 최대 수수료를 합한 uqor 총액을 제한합니다. `nativeOnly`는 윈도우를 일반 QOR 전송으로 제한하고 `allowedTargets`(최대 16개 주소)는 수신자를 제한하며 컨트랙트 생성을 거부합니다.
- **하나의 계정, 두 가지 인코딩.** eth-native 계정에서는 `0x` 주소와 `qor1...` 주소가 동일한 20바이트이며 같은 잔액을 보여주므로, 하나의 키가 EVM과 네이티브 레인 모두에서 동작합니다. QOR는 EVM에서 18자리 소수, 네이티브 레인(`uqor`)에서 6자리 소수를 가지며, 1 uqor는 10^12 wei입니다.
- **거부 사유를 알려주는 헬퍼.** `classifyEvmWindowRejection`은 viem 또는 ethers 오류, 네이티브 레인 전달 결과, 또는 문자열에서 거부된 트랜잭션을 네 가지 사유 `no-pqc-key`, `no-window`, `exhausted`, `invalid` 중 하나로 분류합니다.
- **uqor 단위의 윈도우 크기 산정.** `evmWindowCost`와 `weiToUqorCeil`은 값, 가스, 수수료 상한으로 윈도우 크기를 산정하고 wei를 uqor로 올림하므로, 총액이 최악의 경우를 포함합니다.
- **자동 열기 없음.** 이 키트에는 전송 전에 윈도우를 여는 헬퍼가 의도적으로 없습니다. 윈도우는 지출이 의도적으로 인가되도록 존재합니다.
- **무료 시뮬레이션.** `eth_call`과 `eth_estimateGas`는 윈도우나 등록된 키 없이 어떤 계정에서도 동작합니다.
- **윈도우를 연결해 주는 템플릿.** Foundry 및 Hardhat 템플릿에는 `pnpm window status|register|open`이 포함되어 있으며, EVM 키와 같은 비밀에서 ML-DSA-87 키를 파생하고, 한 번 등록하며, 하이브리드 서명된 열기 메시지를 브로드캐스트합니다.
- **문서화된 호환성 표면.** 참조 페이지(2026년 10월 27일에 공개 엔드포인트에서 읽음)는 Ethereum과 다른 점(트랜잭션 유형, 포크, 파이널리티, 수수료 필드, JSON-RPC 네임스페이스, 프리컴파일)을 나열합니다. [아래](#evm-differences)에 요약되어 있습니다.

## 키트에 포함된 것 {#contents}

### `@qorechain/evm` {#evm-package}

**0.11.0부터** (신규):

- `qorechain`(9801)과 `qorechainTestnet`(9800): 공개 엔드포인트, 소수 18자리의 네이티브 통화 QOR, 탐색기 `https://explore.qore.network`를 갖춘 viem 체인 객체. `QORECHAIN_CHAINS`는 wagmi와 RainbowKit용으로 둘 다(메인넷, 그다음 테스트넷) 나열합니다. `QORECHAIN_REST_ENDPOINTS`는 각 EVM 체인 ID를 해당 네이티브 레인 REST 엔드포인트에 매핑합니다.
- `evmWindowStatus({ rest, address })`는 REST(`/qorechain/pqc/v1/evm_window/{address}`)로 계정의 윈도우를 읽고, `qor1...` 또는 `0x` 주소를 받으며, 윈도우가 없을 때 실패하는 대신 `{ found: false }`로 응답합니다. `parseEvmWindow`는 원시 응답을 파싱합니다.
- `openEvmWindowMessage(params)`는 경계를 검사하고 네이티브 레인 `MsgOpenEVMWindow`를 일반 `{ typeUrl, value }` 객체로 구성하여 `@qorechain/sdk`로 바로 서명할 수 있게 합니다. `checkOpenEvmWindowParams`는 검사만 실행합니다.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress`, 그리고 상수 `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`(17,280), `MAX_EVM_WINDOW_TXS`(1,000), `MAX_EVM_WINDOW_TARGETS`(16).
- 윈도우 헬퍼는 viem 없이도 서브패스 `@qorechain/evm/window`로 게시됩니다.

**현재 사용 가능** (0.8.0 이상): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, `erc20` 헬퍼, ERC-721 및 ERC-1155 헬퍼, `precompiles` 바인딩, `PRECOMPILE_ADDRESSES`. [EVM 가이드](/sdk/guides/evm)를 참조하세요.

### 템플릿 {#templates}

`create-qorechain-dapp`에는 현재 세 가지 템플릿(`evm-solidity`, `fullstack-web`, `rollup-app`; [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli) 참조)이 있습니다. **0.11.0부터** 일곱 가지가 됩니다. 새로운 네 가지는 다음과 같습니다:

| 템플릿 | 제공되는 것 |
|---|---|
| `foundry` | Foundry 프로젝트: `Counter` 컨트랙트, 테스트, 배포 스크립트, 이름이 지정된 RPC 엔드포인트 `qorechain`과 `qorechain_testnet`, 그리고 `pnpm window status\|register\|open`. |
| `hardhat` | Hardhat 3 및 viem 프로젝트: `Counter` 컨트랙트, 시뮬레이션 네트워크 테스트, Ignition 배포 모듈, 네트워크 `qorechain`과 `qorechainTestnet`, 그리고 `pnpm window status\|register\|open`. |
| `viem-wagmi` | QoreX 지갑(`@qorechain/qorex-rainbowkit`)과 `@qorechain/evm`의 체인 정의를 사용하는 Vite, React, wagmi, RainbowKit dApp. 최신 블록, QOR 잔액, 계정의 EVM 윈도우를 보여줍니다. |
| `cosmwasm` | cw-plus의 `cw20-base` 기반 QoreChain Native(CosmWasm) CW20 토큰, Docker의 최적화 빌드, 거버넌스 업로드 제안 스크립트, 테스트넷 인스턴스화 및 쿼리 스크립트. |

템플릿은 `@qorechain/evm`과 `@qorechain/sdk`를 `^0.11.0`으로 고정하므로, 0.11.0이 게시될 때까지 npm에서 설치되지 않습니다.

### SDK 저장소의 가이드 {#guides}

저장소(`docs/docs/guides/`, 태그 `v0.11.0`)에는 `evm-quickstarts.md`(viem, ethers v6, web3.py, go-ethereum, alloy, web3j용 읽기와 "Before you send" 섹션), `evm-differences.md`("QoreChain EVM compared with Ethereum"), `evm.md`, `cosmwasm.md`가 있습니다. 이 사이트의 같은 내용: [EVM 가이드](/sdk/guides/evm), [EVM 개발](/developer-guide/evm-development), [QoreChain Native 개발](/developer-guide/cosmwasm-development).

태그에는 다른 도구를 위한 기여 파일(viem 체인 정의, Sourcify 체인 항목, Scaffold-ETH 2 확장)도 `contrib/`와 `templates/scaffold-eth-extension/` 아래에 있습니다. 이들은 저장소에 준비된 파일이며, 업스트림에 병합되지 않았습니다.

## 사용 사례 {#use-cases}

1. **Ethereum에서 이식하는 Solidity 팀.** `foundry` 템플릿(0.11.0부터)을 스캐폴딩하고, 컨트랙트를 복사하고, 로컬에서 `forge test`를 실행하고, `pnpm window register`를 한 번 실행한 뒤 배포 배치마다 `pnpm window open`을 실행합니다. [차이점](#evm-differences)에서 무엇을 바꿔야 하는지 확인하세요: blob 트랜잭션 없음, PREVRANDAO는 상수, 공개 엔드포인트에 `debug_*` 트레이싱 없음.
2. **테스트넷으로 가는 Hardhat 3 프로젝트.** `hardhat` 템플릿(0.11.0부터)을 스캐폴딩하고, Ignition 모듈을 유지한 채 윈도우를 연 뒤 `pnpm deploy:testnet`으로 배포합니다.
3. **wagmi 기반 dApp 프런트엔드.** `QORECHAIN_CHAINS`를 wagmi 설정과 RainbowKit에 가져오고(0.11.0부터), `evmWindowStatus`로 사용자의 윈도우를 보여주며, `classifyEvmWindowRejection`으로 거부된 전송을 설명합니다.
4. **다른 언어의 백엔드 서비스.** Python, Go, Rust, Java 서비스는 Ethereum에서와 같이 web3.py, go-ethereum, alloy, web3j로 잔액을 읽고 컨트랙트를 호출할 수 있으며, **현재** 가능합니다. 전송하려면 해당 언어의 QoreChain SDK 0.10.0(현재 사용 가능)으로 `MsgOpenEVMWindow`를 구성합니다.
5. **CosmWasm 개발자.** `cosmwasm` 템플릿(0.11.0부터)을 스캐폴딩하고, `cargo test`로 CW20을 테스트하고, 최적화된 Wasm을 빌드하고, 코드를 저장하기 위한 거버넌스 제안을 제출하며, 제안이 통과하면 테스트넷에서 인스턴스화합니다.
6. **지갑 또는 커스터디 통합.** 사용자를 대신해 키를 보관하는 통합은 secp256k1 키만으로는 EVM 레인에서 지출할 수 없다는 점을 알아야 합니다. 계정의 ML-DSA-87 키로 서명한 좁은 윈도우(`nativeOnly` 또는 `allowedTargets`)를 열며, **현재** `@qorechain/sdk` 0.10.0의 `openEvmWindowMsg`로 가능합니다.
7. **EVM 도구 유지 관리자.** viem, Sourcify, Scaffold-ETH 2의 유지 관리자는 준비된 기여 파일을 읽고 체인 ID 9800과 9801을 추가할 수 있습니다.

## 작동 방식 {#how-it-works}

- **인가 규칙.** 체인은 등록된 ML-DSA-87 키와 유효한 윈도우가 있는 계정의 EVM 트랜잭션을 허용하고, 그렇지 않으면 거부합니다. 이 규칙은 두 네트워크에서 활성화된 프로토콜 기능 `evm-pqc-authorisation-window`이며, `/qorechain/pqc/v1/protocol_features`에서 읽을 수 있습니다. [EVM 인가 윈도우](/sdk/guides/evm#evm-window)와 [첫 트랜잭션 가이드](/getting-started/first-transaction#evm-window)를 참조하세요.
- **열기와 닫기.** `MsgOpenEVMWindow`(`/qorechain.pqc.v1.MsgOpenEVMWindow`)는 하이브리드 서명으로 윈도우를 열며, 윈도우를 열면 이전 윈도우가 대체됩니다. `MsgCloseEVMWindow`는 윈도우를 닫습니다.
- **윈도우가 제한하는 것.** 블록(기간이 아니라 블록 수), EVM 트랜잭션, 그리고 허용된 모든 트랜잭션의 값과 최대 수수료(가스 한도 곱하기 수수료 상한)를 합한 uqor 총액. `nativeOnly`와 `allowedTargets`가 이를 더 좁힙니다([윈도우 범위 지정](/sdk/guides/evm#evm-window-scope) 참조).
- **논스.** 네이티브 시퀀스와 EVM 논스는 같은 카운터입니다. 윈도우를 열면 카운터가 증가하므로, 윈도우를 열고, 논스를 읽고, 그다음 EVM 트랜잭션에 서명하세요.
- **템플릿 헬퍼.** `foundry`와 `hardhat`에서 `pnpm window`는 `PRIVATE_KEY`(또는 `QORE_MNEMONIC`)에서 계정을 파생하고, 같은 비밀에서 ML-DSA-87 키를 파생하며, 키를 한 번 등록(`register`)하고, 하이브리드 서명된 `MsgOpenEVMWindow`를 브로드캐스트(`open`)합니다. 기본적으로 250 gwei 수수료 상한에서 최대 3,000,000 가스의 트랜잭션 5개에 대해 600블록 윈도우를 산정합니다.
- **QoreChain Native의 CosmWasm.** 코드 업로드는 두 네트워크 모두에서 거버넌스를 통해 이루어집니다(`code_upload_access`는 `Nobody`): 코드는 거버넌스 모듈을 발신자로 하는 `MsgStoreCode`를 담은 거버넌스 제안으로 저장됩니다. 인스턴스화는 테스트넷에서는 모두에게 열려 있고 메인넷에서는 닫혀 있습니다(`instantiate_default_permission`은 테스트넷에서 `Everybody`, 메인넷에서 `Nobody`이며, 2026년 10월 27일에 읽음). 둘 다 `/cosmwasm/wasm/v1/codes/params`에서 읽고, 저장된 코드는 `/cosmwasm/wasm/v1/code`에서 나열합니다. 2026년 10월 27일 기준 메인넷에는 저장된 코드가 없었습니다.

## Ethereum과 비교한 QoreChain EVM {#evm-differences}

2026년 10월 27일에 공개 엔드포인트에서 읽었습니다(SDK 가이드 `evm-differences.md`). 네트워크 상태(수수료, 블록 시간, 활성 프리컴파일)는 날짜가 있는 값이므로, 의존하기 전에 실시간으로 읽으세요.

- **전송.** 모든 EVM 트랜잭션에는 발신자의 등록된 ML-DSA-87 키와 열린 윈도우가 필요하며, 계정별 예외는 없습니다. 배포, 전송, 컨트랙트 호출이 모두 해당됩니다. 등록된 키가 있는 계정은 네이티브 레인에서도 고전 서명 경로가 없습니다: 서명하는 모든 네이티브 트랜잭션은 하이브리드입니다.
- **시뮬레이션.** `eth_call`과 `eth_estimateGas`는 윈도우가 필요하지 않습니다.
- **트랜잭션 유형.** 유형 0(레거시), 1(액세스 리스트), 2(EIP-1559), 4(EIP-7702)가 허용됩니다. **EIP-4844 blob 트랜잭션(유형 3)은 거부됩니다.** Cancun 옵코드는 동작하지만 `blobGasUsed`와 `excessBlobGas`는 항상 0이고, `eth_blobBaseFee`는 존재하지 않으며, 포인트 평가 프리컴파일(`0x0a`)은 오류를 반환합니다.
- **포크.** 제네시스부터 London까지 적용되며, Shanghai, Cancun, Prague가 활성화되어 있고, Osaka는 활성화되어 있지 않습니다.
- **PREVRANDAO(EIP-4399)는 상수**(`0xff...ff`)이며 헤더의 `mixHash`는 0입니다. 절대 난수로 사용하지 마세요.
- **EIP-7702**는 QoreChain 규칙과 함께 허용됩니다: 위임이 효력을 가지게 되는 각 authority는 등록된 PQC 키와 `MsgAuthorizeEVMDelegation`으로 기록된 일회용 동의가 필요합니다(트랜잭션당 최대 8개 인가, authority 중복 불가). 스폰서의 윈도우는 authority의 동의로 간주되지 않습니다. `MsgClearEVMDelegation`은 위임을 제거합니다. [EIP-7702 동의](/sdk/guides/evm#evm-delegation-consent)를 참조하세요.
- **파이널리티.** 블록은 커밋되면 최종 확정됩니다: `latest`, `safe`, `finalized`는 같은 블록을 반환하며, 리오그와 엉클 블록이 없습니다.
- **수수료(두 네트워크, 2026년 10월 27일).** `eth_gasPrice` 112.5 gwei; 베이스 수수료 100 gwei(가스당 0.1 uqor라는 체인 하한); `eth_maxPriorityFeePerGas` 12.5 gwei; 헤더 `gasLimit` 4,294,967,295. 수수료 상한을 베이스 수수료의 약 두 배로 설정하는 도구(Foundry가 그렇게 합니다)는 약 112.5 gwei를 지불하면서 윈도우에는 가스당 최대 약 200 gwei를 약정합니다.
- **JSON-RPC 네임스페이스.** `eth`, `net`, `web3`, `txpool`. 모든 `debug_*`, `personal_*`, `admin_*`, `miner_*` 메서드는 사용할 수 없으며(`-32601`), `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions`, `eth_config`도 마찬가지입니다. 트레이스가 필요한 도구는 공개 엔드포인트에서 동작하지 않습니다.
- **다르게 동작하는 것.** `eth_getProof`는 동작하지만 Merkle-Patricia 증명이 아니라 체인의 IAVL 증명을 반환합니다. `eth_getLogs`는 쿼리당 최대 10,000 블록을 다룹니다. `eth_subscribe`는 WebSocket에서만 동작합니다. `eth_accounts`, `eth_sign`, `eth_sendTransaction`은 노드가 계정을 보유하지 않으므로 거부됩니다: 로컬에서 서명하고 `eth_sendRawTransaction`을 사용하세요. `txpool_content`는 공개 엔드포인트에서 거부되며, `txpool_status`는 동작합니다. `web3_clientVersion`은 노드를 감지하는 신뢰할 만한 방법이 아닙니다.
- **잔액.** `eth_getBalance`는 uqor 단위의 뱅크 잔액에 10^12를 곱하고 uqor 미만의 나머지를 더한 값을 반환합니다.
- **프리컴파일.** Ethereum의 표준 프리컴파일은 평소처럼 응답합니다. `pqcVerify`(`0x0A01`)와 `pqcKeyStatus`(`0x0A02`)는 **테스트넷에서만 활성화**되어 있으며, 메인넷에서는 어느 것도 활성화되어 있지 않고, 활성화에는 거버넌스 결정이 필요하며 날짜는 정해지지 않았습니다. 테스트넷에는 `0x0C01`(`rlConsensusParams`)도 나열되어 있습니다. 비활성 프리컴파일을 호출하면 되돌려지지 않고 빈 데이터를 반환하므로, 의존하기 전에 `/cosmos/evm/vm/v1/params`의 `active_static_precompiles`를 읽으세요. [EVM 프리컴파일](/developer-guide/evm-precompiles#network-status)을 참조하세요.
- **도구.** QoreChain은 아직 `viem/chains`에 없습니다: `@qorechain/evm`(0.11.0부터)에서 체인을 가져오세요. Sourcify는 아직 체인 ID 9800 또는 9801을 나열하지 않습니다. SVM 레인은 열려 있지 않습니다.

## 사용 방법 {#how-to-use}

읽기를 수행하는 모든 스니펫은 공개 테스트넷(`qorechain-diana`, EVM 체인 ID 9800)을 사용하며, 키가 필요 없고 아무것도 전송하지 않습니다. `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c`의 테스트 ERC-20은 테스트넷 토큰(심볼 `WQOR`, 소수 18자리)입니다. 이것과 주소를 본인의 것으로 바꾸세요.

### 언어별 설치 {#install}

| 언어 또는 도구 | 설치 | 상태 | 최소 플랫폼 |
|---|---|---|---|
| TypeScript, EVM 읽기 및 ERC 헬퍼 | `npm install @qorechain/evm viem` (0.8.0으로 해석되며, 체인 정의나 윈도우 헬퍼가 없음) | 현재 사용 가능 | Node.js 20 이상; 피어 `viem ^2` |
| TypeScript, 윈도우 메시지 서명 | `npm install @qorechain/sdk` (0.10.0에는 `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`가 있음) | 현재 사용 가능 | Node.js 20 이상 |
| TypeScript, viem 체인 정의 및 윈도우 헬퍼 | 아직 없음 | **예정 (0.11.0)** | Node.js 20 이상 |
| 스캐폴더, 템플릿 `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | 현재 사용 가능 (0.10.0) | Node.js 20 이상 |
| 스캐폴더, 템플릿 `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | 아직 없음 | **예정 (0.11.0)** | Foundry와 Node.js 20; Hardhat 3은 Node.js 22; `cosmwasm`은 Rust와 Docker |
| Python (EVM 읽기) | `pip install "web3>=7,<8"`; 윈도우 메시지는 `qorechain-sdk` 0.10.0 | 현재 사용 가능 | Python 3.10 이상 |
| Go (EVM 읽기) | `go get github.com/ethereum/go-ethereum@latest`; 윈도우 메시지는 QoreChain Go SDK v0.10.0 | 현재 사용 가능 | Go 툴체인 |
| Rust (EVM 읽기) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; 윈도우 메시지는 크레이트 `qorechain-sdk` 0.10.0 | 현재 사용 가능 | Rust stable |
| Java (EVM 읽기) | `org.web3j:core:5.0.0`; 윈도우 메시지는 `io.github.qorechain:qorechain-sdk:0.10.0` | 현재 사용 가능 | JDK 21 (QoreChain Java SDK는 JDK 21 툴체인으로 빌드됨) |

### 퀵스타트 1: ethers v6로 읽기 (현재 사용 가능) {#quickstart-ethers}

QoreChain 패키지가 필요 없습니다. 2026년 10월 27일 테스트넷에 대해 실행했을 때 `chain id: 9800n`, 잔액, `token: WQOR 18n`이 출력되었습니다.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

web3.py, go-ethereum, alloy, web3j에서의 동일한 읽기는 SDK 가이드 `evm-quickstarts.md`에 있습니다(그곳에서는 JDK 21의 web3.py 7.16, go-ethereum 1.17.10, alloy 1.8, web3j 5.0.0으로 테스트되었다고 보고하며, 이 페이지에서는 다시 실행하지 않았습니다).

### 퀵스타트 2: 게시된 `@qorechain/evm` 0.8.0으로 읽기 (현재 사용 가능) {#quickstart-evm-080}

개발자 허브의 테스트된 퀵스타트입니다. 연결하고, EVM 체인 ID를 자동 감지하며, 공개 테스트넷 파우셋 계정의 QOR 잔액을 출력합니다.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### 퀵스타트 3: viem 체인 정의로 읽기 (0.11.0부터, 예정) {#quickstart-viem}

0.8.0에는 `qorechainTestnet`이 없으므로 현재 npm에서는 실행되지 않습니다. 2026년 10월 27일에 저장소 소스(npm이 아님)에서 불러온 0.11.0 체인 정의로 실행했을 때 `chain id: 9800`과 토큰 `WQOR`가 출력되었습니다.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### 퀵스타트 4: 윈도우를 확인하고 열기 메시지 구성하기 (0.11.0부터, 예정) {#quickstart-window-helpers}

태그 v0.11.0의 `@qorechain/evm` README에서 가져왔습니다. 읽은 뒤 메시지 객체를 만들며, 서명하거나 전송하지 않습니다. 윈도우가 없는 계정에 대해 `evmWindowStatus`는 `found: false, live: false`를 반환합니다(2026년 10월 27일 두 네트워크에서 확인).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### 퀵스타트 5: TypeScript에서 윈도우 열기 (현재 사용 가능, SDK 0.10.0 이상) {#quickstart-open-window}

SDK 가이드 `evm-quickstarts.md`의 "Before you send"에서 가져왔습니다. 이것은 **네이티브 레인 트랜잭션을 전송합니다**: 자금이 있는 본인의 테스트 계정으로만 실행하고, 공유되거나 공개된 구문으로는 절대 실행하지 마세요.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

이 스니펫은 이 페이지를 위해 다시 실행하지 않았습니다. `maxValue: "3750000"`은 250 gwei 수수료 상한에서 3,000,000 가스 트랜잭션 5개에 해당합니다.

### 퀵스타트 6: 현재 사용 가능한 스캐폴더로 프로젝트 스캐폴딩 {#quickstart-scaffold-live}

2026년 10월 27일 빈 디렉터리에서 공개 npm 레지스트리의 `npx`(0.10.0, 템플릿 `fullstack-web`)로 테스트했습니다: 프로젝트가 스캐폴딩되었고 빌드가 성공했습니다.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### 새 템플릿 (0.11.0부터, 예정) {#new-templates-usage}

0.11.0이 게시되면 스캐폴더는 네 가지 새 템플릿 이름을 받아들입니다(아래 플래그 표 참조). 그러면 `foundry` 프로젝트는 `forge build`와 `forge test`로 로컬에서 빌드하고 테스트하며(네트워크 없음), `pnpm window status`는 계정, 계정의 PQC 키, 윈도우를 읽습니다. `pnpm window register`와 `pnpm window open`은 자금이 있는 본인 계정에서 네이티브 레인 트랜잭션을 브로드캐스트하고, `forge script ... --broadcast`는 배포합니다. `.env.example`에 실제 키를 넣지 말고, `.env`를 커밋하지 말며, 공개 BIP-39 테스트 구문(`abandon`을 11번 반복한 뒤 `about`)에는 절대 자금을 넣지 마세요.

## 주요 API {#main-api}

### `@qorechain/evm` (0.11.0부터) {#api-evm}

| 이름 | 기능 |
|---|---|
| `qorechain`, `qorechainTestnet` | 공개 엔드포인트와 탐색기를 갖춘 9801 및 9800용 viem 체인 객체. |
| `QORECHAIN_CHAINS` | wagmi 또는 RainbowKit용 두 체인(메인넷, 그다음 테스트넷). |
| `QORECHAIN_REST_ENDPOINTS` | EVM 체인 ID에서 네이티브 레인 REST URL로의 매핑. |
| `evmWindowStatus` | REST로 윈도우를 읽음: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | REST 응답을 파싱. |
| `openEvmWindowMessage` | 경계를 검사하고 `MsgOpenEVMWindow`를 `{ typeUrl, value }`로 구성. |
| `checkOpenEvmWindowParams` | 경계 검사만 수행. |
| `evmWindowCost`, `weiToUqorCeil` | uqor 단위의 윈도우 크기 산정. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | 거부 사유 설명: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | 같은 계정의 `0x`와 `qor1...` 사이를 변환. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | 상수. |
| `@qorechain/evm/window` | viem 의존성 없는 윈도우 헬퍼. |

`@qorechain/evm`은 네이티브 레인 트랜잭션에 서명하거나 브로드캐스트하지 않습니다. 그 용도로는 `@qorechain/sdk` 또는 언어별 SDK를 사용하세요.

### 각 SDK에서 윈도우 구성 및 읽기 (현재 사용 가능, 0.10.0) {#api-window}

| 언어 | 윈도우 열기 | 윈도우 읽기 |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, 0.11.0부터) | `fetchEvmWindow`; `evmWindowStatus` (0.11.0부터) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`nativeOnly` 또는 `allowedTargets`는 `NewOpenEVMWindowScoped`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

EIP-7702 동의(TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0은 `PqcStatusBadge`를 추가합니다(기본 레이블 "PQC key registered"와 "No PQC key").

### `create-qorechain-dapp` 플래그 {#api-scaffolder}

| 플래그 | 기능 |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app`(현재 사용 가능); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm`(0.11.0부터). |
| `--network <name>` | `testnet` 또는 `mainnet` 프리셋. |
| `--package-manager <pm>` | `pnpm`, `npm` 또는 `yarn`. |
| `-y, --yes` | 프롬프트를 건너뛰고 기본값 사용. |
| `--no-install` | 의존성을 설치하지 않음. |
| `-h, --help` / `-v, --version` | 도움말과 버전. |

### 템플릿 스크립트 (0.11.0부터) {#api-template-scripts}

| 템플릿 | 스크립트 | 기능 |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | 계정, 계정의 ML-DSA-87 키가 등록되어 있는지(그리고 이 키인지), 계정의 윈도우를 보여줍니다. |
| `foundry`, `hardhat` | `pnpm window register` | 계정의 ML-DSA-87 키를 계정당 한 번 등록합니다. |
| `foundry`, `hardhat` | `pnpm window open` | 윈도우를 엽니다(기본 600블록, 트랜잭션 5개). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Hardhat 빌드, 테스트, `qorechainTestnet`으로의 Ignition 배포. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | `http://localhost:5173`의 개발 서버; 프로덕션 빌드. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | 최적화 빌드, 거버넌스 업로드 제안, 인스턴스화(테스트넷), REST 쿼리. |

템플릿 환경 변수(`.env`에 두며 커밋하지 않음): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK`(`testnet` 또는 `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; CosmWasm 스크립트용 `QORE_CODE_ID`와 `QORE_I_KNOW_THIS_IS_MAINNET=yes`(제안 스크립트는 이것 없이는 메인넷을 거부함); `viem-wagmi`에서 WalletConnect 지갑을 쓰기 위한 `VITE_WALLETCONNECT_PROJECT_ID`.

## 접근 방법 {#how-to-access}

| | 테스트넷 | 메인넷 |
|---|---|---|
| 네이티브 체인 ID | `qorechain-diana` | `qorechain-vladi` |
| EVM 체인 ID (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM WebSocket | `wss://evm-ws-testnet.qore.host` | 게시되지 않음 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| 합의 RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| 탐색기 | `https://explore.qore.network` | `https://explore.qore.network` |

- **읽기**에는 아무것도 필요 없습니다: 계정, 키, 윈도우 모두 불필요합니다.
- **EVM 레인에서의 전송**에는 자금이 있는 계정, 체인에 (한 번) 등록된 ML-DSA-87 키, 열린 윈도우가 필요합니다. 키 등록과 윈도우는 네이티브 레인 트랜잭션입니다.
- **비용.** 수수료 하한은 두 네트워크 모두 가스당 0.1 uqor입니다. 읽기는 무료입니다. 테스트넷 QOR는 [파우셋](/dashboard/faucet)에서 받습니다.
- **CosmWasm.** 어느 네트워크에서도 거버넌스 없이 코드를 업로드할 수 없으며, 메인넷에서는 거버넌스 없이 인스턴스화할 수 없습니다. 2026년 10월 27일 기준 메인넷에는 저장된 코드가 없었습니다.
- **노드 및 도구 버전.** 위의 설치 표를 참조하세요.

## 게시 위치 {#where-published}

2026년 10월 27일에 각 레지스트리에서 실시간으로 버전을 읽었습니다. GitHub 태그 `v0.11.0`은 존재하며(2026년 10월 27일), 아직 이에 대한 GitHub 릴리스 객체는 없습니다(최신 릴리스는 v0.10.0).

| 레지스트리 | 패키지 | 현재 사용 가능한 버전 | 0.11.0 상태 | 링크 |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **보류 중, 게시되지 않음** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **보류 중, 게시되지 않음** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **보류 중, 게시되지 않음** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **보류 중, 게시되지 않음** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (템플릿 `evm-solidity`, `fullstack-web`, `rollup-app`) | **보류 중, 게시되지 않음** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (`viem-wagmi`에서 사용) | 0.1.0 | 0.11.0에 포함되지 않음 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | 0.11.0에 포함되지 않음 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | 0.11.0에 포함되지 않음 | https://crates.io/crates/qorechain-sdk |
| Go 프록시 | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | 0.11.0에 포함되지 않음 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | 0.11.0에 포함되지 않음 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

소스: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), 태그 `v0.11.0`; 경로 `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, QoreChain Association이 유지 관리합니다.

## 제한 사항 및 알려진 문제 {#limits}

- **0.11.0은 아직 npm에 없습니다.** "0.11.0부터"로 표시된 모든 것(viem 체인 정의, 윈도우 헬퍼, `@qorechain/evm/window`, 네 가지 새 템플릿, `PqcStatusBadge`)은 현재 레지스트리에서 설치할 수 없습니다. 새 템플릿은 `^0.11.0` 패키지에 의존하므로, 저장소에서 스캐폴딩하더라도 게시될 때까지 npm에서 설치되지 않습니다. npm이 0.11.0을 제공하면 이 페이지가 변경됩니다.
- **0.11.0은 npm 패키지만 변경합니다.** Python, Rust, Go, Java는 0.10.0에 머물며, 위에 나열한 윈도우 빌더는 이미 포함되어 있습니다.
- **`@qorechain/evm`은 윈도우를 읽고 메시지를 구성할 뿐이며, 네이티브 레인 트랜잭션에 서명하거나 브로드캐스트하지 않습니다.**
- **전송 전에 윈도우를 자동으로 여는 헬퍼는 없습니다.** 의도된 설계입니다.
- **`viem-wagmi` 템플릿의 QoreX 지갑**은 `eth_chainId`, `eth_accounts`, `eth_requestAccounts`, `wallet_switchEthereumChain`에 응답하며, EVM 서명 메서드는 아직 제공되지 않습니다. 연결과 읽기에 사용하고, 서명은 주입된 EIP-1193 지갑으로 하세요.
- **템플릿의 `pnpm window` 헬퍼는 EVM 키와 같은 비밀에서 ML-DSA-87 키를 파생합니다.** 계정의 키가 다른 지갑에서 등록된 경우에는 그 지갑에서 윈도우를 여세요.
- **공개 엔드포인트에서 제공되지 않는 것:** blob 트랜잭션, 트레이싱, `debug`, `personal`, `admin`, `miner` 네임스페이스.
- **CosmWasm 업로드는 두 네트워크 모두에서 거버넌스를 거칩니다**; `cosmwasm` 템플릿은 스스로 코드를 저장할 수 없습니다.
- **다른 도구(viem, Sourcify, Scaffold-ETH 2)에 대한 기여**는 저장소에 준비된 파일이며, 업스트림에 병합되지 않았습니다.
- **메인넷의 EVM 프리컴파일:** 어느 것도 활성화되어 있지 않습니다. `pqcVerify`(`0x0A01`)와 `pqcKeyStatus`(`0x0A02`)는 테스트넷에서만 활성화되어 있습니다.
- **네트워크 상태는 날짜가 있는 값입니다.** 수수료와 블록 시간 수치는 2026년 10월 27일에 읽은 것입니다.

## 보안 참고 사항 {#security}

- 윈도우 설계는 EVM 라이브러리가 보유한 secp256k1 키만으로는 지출을 인가할 수 없음을 의미합니다: 윈도우를 열려면 계정의 ML-DSA-87 키로 만든 하이브리드 서명이 필요합니다. 윈도우를 작게(`blocks`, `maxTxs`, `maxValue`) 유지하고, 가능하면 `nativeOnly` 또는 `allowedTargets`를 사용하세요.
- `maxValue`는 각 트랜잭션의 최대 수수료를 포함합니다. 값만으로 정하지 말고 `evmWindowCost`로 크기를 산정하세요.
- 템플릿은 git에서 무시되는 `.env`에서 키를 읽으며, `.env.example`에는 자리 표시자가 들어 있습니다. Hardhat 사용자는 `npx hardhat keystore set PRIVATE_KEY`로 키를 암호화하여 저장할 수 있습니다.
- 공개 BIP-39 테스트 구문(`abandon`을 11번 반복한 뒤 `about`)에는 절대 자금을 넣지 마세요.
- 메인넷 CosmWasm 제안에는 투표자가 바이너리를 검증할 수 있도록 소스와 재현 가능한 빌드(옵티마이저가 체크섬을 출력함)를 게시하세요.
- 취약점은 security@qore.network로 비공개로 신고하세요.

## 관련 페이지 {#related}

- [개발자 패키지 개요](/developer-tools/overview) 및 [스캐폴더와 CLI](/developer-tools/scaffolders-and-cli) (현재 사용 가능한 `create-qorechain-dapp` 0.10.0)
- [SDK 개요](/sdk/overview), [SDK 설치](/sdk/install), [EVM 가이드](/sdk/guides/evm) (윈도우, 범위 지정 윈도우, EIP-7702 동의, 프리컴파일)
- [EVM 개발](/developer-guide/evm-development) 및 [EVM 프리컴파일](/developer-guide/evm-precompiles#network-status)
- [QoreChain Native 개발](/developer-guide/cosmwasm-development) (CosmWasm과 거버넌스 제안)
- [QoreX 통합](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (네이티브 레인의 하이브리드 서명)
- [QoreScan](/developer-tools/qorescan) (Solidity 소스의 `ecrecover` 및 PQC 프리컴파일 사용 인벤토리)
