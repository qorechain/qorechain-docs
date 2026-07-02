---
slug: /rollups/deploying-a-rollup
title: 롤업 배포하기
sidebar_label: 롤업 배포하기
sidebar_position: 3
---

# 롤업 배포하기

애플리케이션별 롤업은 세 가지 방법으로 배포할 수 있습니다: **대시보드**를 통해(가이드형 노코드 마법사), 체인 **CLI**를 통해(`qorechaind`, 온체인 트랜잭션에 대한 완전한 제어), 또는 **TypeScript RDK**(`@qorechain/rdk`와 `create-qorechain-rollup` 스캐폴더)로 프로그래밍 방식으로. 이 페이지에서는 세 가지 모두와, 운영자 라이프사이클 및 배치 명령어를 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷을 대상으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.1.82**을 실행하며 2026년 6월 7일부터 운영 중입니다 — 메인넷에 배포할 때는 메인넷 체인 ID와 엔드포인트로 대체하세요. 모든 배포는 먼저 테스트넷에서 검증하세요.
:::

---

## 요구 사항

| 요구 사항 | 세부 내용 |
| ----------- | ------- |
| **최소 스테이크** | 롤업 생성 시 QOR로 된 스테이크 본드가 에스크로에 예치됩니다 |
| **생성 소각** | 스테이크 금액의 일부가 생성 시 영구적으로 소각됩니다. 나머지는 에스크로에 보유되며 롤업이 중지될 때 반환됩니다 |
| **계정** | 스테이크와 거래 수수료를 충당할 충분한 잔액이 있는 자금이 채워진 QoreChain 계정 |

배포하기 전에 현재 최소 스테이크와 소각률을 위해 실시간 모듈 파라미터를 조회하세요:

```bash
qorechaind query rdk config
```

---

## 대시보드를 통한 배포 (Tools → Rollups)

대시보드는 **Tools → Rollups** 아래에 가이드형 **Deploy a Rollup** 마법사를 제공합니다. 트랜잭션을 손으로 조립하지 않고 앱별 롤업을 출시하는 가장 빠른 경로입니다.

### 단계

1. **로그인.** 마법사는 배포하고 기존 배포를 나열하기 위해 인증된 세션이 필요합니다.
2. **롤업 이름 지정.** 롤업 이름을 입력합니다(2~41자: 문자, 숫자, 공백, 하이픈 또는 밑줄).
3. **가상 머신 선택.** QoreChain은 트리플 VM 체인이므로, 롤업은 다음 중 어느 것이든 실행할 수 있습니다:
   * **EVM** — 완전한 Ethereum 도구(Hardhat, Foundry, MetaMask)를 갖춘 Solidity / Vyper 컨트랙트
   * **CosmWasm** — 네이티브 IBC를 갖춘 Cosmos SDK 런타임 상의 Rust 스마트 컨트랙트
   * **SVM** — 병렬 실행, 고처리량 앱을 위한 Solana Virtual Machine
4. **데이터 가용성 계층 선택.** 누구나 상태를 재구성할 수 있도록 롤업이 거래 데이터를 게시하는 곳: **QoreChain DA**, **Celestia**, 또는 **EigenDA**. EigenDA는 대시보드 수준의 옵션인 반면, 온체인 `x/rdk` DA 백엔드는 native, Celestia, 또는 both입니다 — [데이터 가용성](/rollups/data-availability)을 참조하세요.
5. **가스 토큰 설정.** 롤업에서 실행 비용을 지불하는 데 사용되는 토큰. 기본값은 **QOR**입니다. 자체 네이티브 토큰을 사용하려면 사용자 정의 심볼을 입력하세요.
6. **시퀀서 선택.** 정산 전에 누가 거래를 정렬하는가: **공유 시퀀서**(QoreChain 공유 집합), **전용(단일)**(자체 단일 시퀀서 실행), 또는 **탈중앙화**(권한이 필요 없는 시퀀서 집합).
7. **정산 대상 선택.** 롤업이 상태 루트와 유효성 증명을 고정하는 곳: **QoreChain 메인넷** 또는 **Ethereum**.
8. **배포.** 마법사를 제출합니다. 프로비저닝은 롤업이 가동되기 전에 **The Qore Trust**가 검토하므로, 갓 제출된 롤업은 검토가 완료될 때까지 **provisioning** 상태로 표시됩니다.

제출한 롤업은 **Your rollups** 목록에 VM, DA 계층, 가스 토큰, 시퀀서, 정산 대상, 현재 상태와 함께 표시됩니다.

:::note
대시보드 마법사는 친숙한 제품 수준의 선택지를 제시하고 검토된 파이프라인을 통해 프로비저닝을 라우팅합니다. 아래의 CLI는 `x/rdk` 모듈의 온체인 메시지 표면에 직접 작동합니다. 두 가지는 동일한 기본 개념(VM, DA, 시퀀서, 정산)을 공유하지만 서로 다른 추상화 수준에서 노출합니다.
:::

---

## CLI를 통한 배포

CLI는 롤업을 온체인에 직접 생성합니다. `create-rollup`은 세 개의 위치 인수 — 롤업 ID, 프로파일, 스테이크 금액(`uqor` 단위) — 와 선택적 `--vm` 플래그를 받습니다.

:::tip
체인 버전 **v3.1.74**부터 `create-rollup`은 **선택한 프로파일의 프리셋을 자동으로 적용**합니다 — 정산 모드, 시퀀서, DA, 가스 모델, VM이 모두 프리셋에서 가져와집니다. 더 이상 손으로 설정할 필요가 없습니다(이전에는 메시지가 소버린 구성을 하드코딩했습니다). `--vm` 플래그는 이제 **기본적으로 비어 있으므로**, 명시적으로 재정의하지 않는 한 프로파일의 VM이 적용됩니다.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시** — `defi` 프리셋으로 롤업 생성(정산, 시퀀서, DA, VM이 모두 프리셋에서 가져와짐. `defi`는 EVM 상의 zk 정산으로 해석됨):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**플래그:**

| 플래그 | 기본값 | 설명 |
| ---- | ------- | ----------- |
| `--vm` | *(비어 있음 — 프로파일의 VM 사용)* | 롤업 VM 유형 재정의: `evm`, `cosmwasm`, `svm`, 또는 `custom`. 프리셋의 VM을 적용하려면 설정하지 않은 채로 두세요. |

`[profile]` 인수는 자동으로 적용되는 프리셋 구성을 선택합니다 — **[프리셋 프로파일](/rollups/preset-profiles)**을 참조하세요. `[stake-amount]`는 `uqor` 단위의 본드입니다.

### 배포한 것 검사하기

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK로 배포하기 (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit는 CLI와 동일한 온체인 `x/rdk` 모듈을 공개 RPC/REST/gRPC/JSON-RPC와 모든 cosmjs `OfflineSigner`를 통해 구동하는 두 개의 공개 npm 패키지로 제공됩니다:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — TypeScript SDK: 프리셋 프로파일을 갖춘 구성 빌더, 롤업 및 정산 배치 라이프사이클을 위한 트랜잭션 헬퍼, native DA, 타입이 지정된 읽기 클라이언트, 그리고 v0.4 추가 사항 — 양자내성 정산 영수증, QCAI Rollup Copilot, 크로스 VM 콜데이터 헬퍼, 워치타워.
* **`create-qorechain-rollup`** (`v0.4.0`) — 프로파일별로 실행 가능한 스타터 템플릿 하나를 복제하는 스캐폴더(`multivm-rollup` 템플릿 포함).

이들은 npm에 게시되어 있습니다. 리포지토리는 또한 게시된 운영자 CLI인 **`@qorechain/rdk-cli`**(`qorollup`, `v0.4.0`)도 제공하며, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, 라이프사이클(`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, `faucet` 명령어와 더불어 v0.4의 `receipt`, `advise`, `watchtower` 명령어를 포함합니다.

#### Python, Go, Rust, Java 클라이언트

TypeScript 패키지와 함께, RDK는 TypeScript 표면을 미러링하는 완전한 **Python**, **Go**, **Rust**, **Java** 클라이언트를 제공합니다: 검증 기능이 있는 구성 빌더, 다섯 가지 프리셋 프로파일, denom/이코노믹스/bech32 유틸리티, binary-Merkle 및 출금 증명 헬퍼, 롤업 매니페스트, REST 및 `qor_` JSON-RPC 읽기 클라이언트, 사전 점검/상태 점검, 계정(니모닉 → `qor` 주소), 그리고 **트랜잭션 서명 + 브로드캐스트**(`SIGN_MODE_DIRECT`). 모두 공유된 크로스 언어 골든 벡터에 대해 검증되었으며 각자의 레지스트리에 **게시**되어 있습니다:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

현재 게시된 버전: Python `qorechain-rdk` **0.4.0**(PyPI, 임포트 `qorrdk`), Rust `qorechain-rdk` **0.4.0**(crates.io), Go 모듈 `github.com/qorechain/qorechain-rdk/packages/go`, Java `io.github.qorechain:qorechain-rdk` **0.4.0**(Maven Central). 라이브 브로드캐스트에는 노드 엔드포인트가 필요합니다.

:::note
TypeScript RDK와 그 템플릿은 **`qorechain-diana`** 테스트넷을 대상으로 하며, 완전한 엔드투엔드 흐름은 **곧 출시 예정**으로 표시되어 있습니다. 버전을 고정하고 테스트넷에서 검증하세요.
:::

### `create-qorechain-rollup`으로 프로젝트 스캐폴딩하기 {#scaffold-a-project-with-create-qorechain-rollup}

각 프로파일에는 일치하는 스타터 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`)이 있습니다. 다음 두 형식 중 하나로 스캐폴딩하세요:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

비대화형 / CI 사용 시에는 템플릿과 네트워크를 명시적으로 전달하세요:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

스캐폴더는 문서화된 스테이크 및 생성 소각 비용과, 롤업을 생성하고 그 상태를 읽는 다음 단계를 출력합니다.

### 코드로 롤업 생성하기

프리셋에서 구성을 빌드하고, 체인에서 실시간 스테이크와 소각률을 읽은 다음, 서명 클라이언트로 롤업을 생성합니다. 구성 빌더는 `validate()` / `build()` 시점에 정산 → 증명 호환성 매트릭스를 강제합니다.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

어떤 프로파일이 맞을지 확신이 서지 않나요? `rdk.suggestProfile("a lending protocol with predictable fees")`는 QCAI 지원 추천(문서화된 폴백 포함)을 반환합니다.

### 코드로 라이프사이클 관리 및 상태 읽기

서명 클라이언트는 전체 라이프사이클을 노출합니다 — `pauseRollup`, `resumeRollup`, `stopRollup`, 그리고 `submitBatch`, `challengeBatch`, `resolveChallenge`, `executeWithdrawal`. 라이프사이클 전환은 `currentStatus`를 전달하여 가드할 수 있습니다.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

타입이 지정된 REST 클라이언트로 상태를 읽으세요(서명자 불필요):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## 라이프사이클 관리

롤업은 `pending`, `active`, `paused`, `stopped` 상태를 거쳐 이동합니다. 생성자는 다음 명령어로 전환을 관리합니다.

### 일시 중지(Pause)

롤업을 일시적으로 정지합니다. 상태는 보존되며 롤업을 재개할 수 있습니다. 사유 문자열이 필요합니다.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 재개(Resume)

이전에 일시 중지된 롤업을 재개합니다.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 중지(Stop)

롤업을 영구적으로 해체하고 그 스테이크를 해제합니다. 스테이크된 QOR는 — 일회성 생성 소각을 제외하고 — 생성자에게 반환됩니다.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
롤업을 중지하는 것은 영구적입니다. 롤업은 중지된 후에는 다시 시작할 수 없습니다.
:::

---

## 운영자 명령어: 배치와 챌린지

롤업 운영자는 정산 배치를 제출하고, 챌린저는 옵티미스틱 배치에 이의를 제기할 수 있습니다. 이 명령어들은 **[롤업 개요](/rollups/overview)**와 **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)**에 설명된 정산 계층을 뒷받침합니다.

### 배치 제출하기

롤업에 대한 정산 배치를 제출합니다. 롤업 ID, 배치 인덱스, 16진수로 인코딩된 상태 루트를 받습니다.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 배치 챌린지하기

제출된 배치에 이의를 제기합니다(옵티미스틱 롤업용). 롤업 ID와 배치 인덱스를 받습니다. `--proof`로 사기 증명을 전달하세요. 체인 버전 **v3.1.74**부터 옵티미스틱 **submit-batch → challenge-batch** 경로가 엔드투엔드로 가동되어 작동합니다.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| 플래그 | 설명 |
| ---- | ----------- |
| `--proof` | 16진수로 인코딩된 사기 증명 |

### 배치 검사하기

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## 조회하기

| 명령어 | 목적 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 특정 롤업의 세부 정보 |
| `qorechaind query rdk list-rollups` | 등록된 모든 롤업 |
| `qorechaind query rdk batch [rollup-id]` | 최신 정산 배치(또는 `--index`) |
| `qorechaind query rdk config` | RDK 모듈 파라미터 |
| `qorechaind query rdk suggest-profile [use-case]` | 유스케이스에 맞는 프리셋 추천 |

---

## 다음 단계

* **[데이터 가용성](/rollups/data-availability)** — native, Celestia, 중복 DA 백엔드.
* **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)** — 증명 검증과 `execute-withdrawal`을 통한 L2 → L1 출금 흐름.
