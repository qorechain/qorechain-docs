---
slug: /rollups/deploying-a-rollup
title: 롤업 배포하기
sidebar_label: 롤업 배포하기
sidebar_position: 3
---

# 롤업 배포하기

애플리케이션 전용 롤업은 세 가지 방법으로 배포할 수 있습니다. **대시보드**(가이드형 노코드 마법사)를 통하거나, 체인 **CLI**(`qorechaind`, 온체인 트랜잭션에 대한 완전한 제어권 제공)를 통하거나, 또는 **TypeScript RDK**(`@qorechain/rdk`와 `create-qorechain-rollup` 스캐폴더)를 사용해 프로그래밍 방식으로 배포하는 것입니다. 이 페이지는 세 가지 방법 모두와 함께 오퍼레이터 라이프사이클 및 배치 명령도 다룹니다.

:::note
아래 명령어는 **`qorechain-diana`** 테스트넷을 대상으로 합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 2026년 6월 7일부터 체인 버전 **v3.1.92**로 운영되며 라이브 상태입니다 — 메인넷에 배포할 때는 메인넷 체인 ID와 엔드포인트로 대체하세요. 모든 배포는 먼저 테스트넷에서 검증하시기 바랍니다.
:::

---

## 요구 사항

| 요구 사항 | 세부 내용 |
| ----------- | ------- |
| **최소 스테이크** | 롤업 생성 시 QOR로 된 스테이크 본드가 에스크로에 예치됩니다 |
| **생성 소각** | 스테이크된 금액의 일부가 생성 시 영구적으로 소각되며, 나머지는 에스크로에 보관되어 롤업이 중단될 때 반환됩니다 |
| **계정** | 스테이크와 트랜잭션 수수료를 충당할 만큼 잔액이 충분한, 자금이 지원된 QoreChain 계정 |

배포하기 전에 현재의 최소 스테이크와 소각률을 알기 위해 라이브 모듈 파라미터를 조회하세요.

```bash
qorechaind query rdk config
```

---

## 대시보드를 통한 배포 (도구 → 롤업)

대시보드는 **도구 → 롤업** 메뉴 아래에 가이드형 **롤업 배포** 마법사를 제공합니다. 트랜잭션을 직접 조립하지 않고 앱 전용 롤업을 가장 빠르게 실행할 수 있는 방법입니다.

### 단계

1. **로그인.** 마법사를 통해 배포하고 기존 배포 목록을 조회하려면 인증된 세션이 필요합니다.
2. **롤업 이름 지정.** 롤업 이름을 입력합니다 (2~41자: 문자, 숫자, 공백, 하이픈 또는 밑줄).
3. **가상 머신 선택.** QoreChain은 트리플 VM 체인이므로 롤업은 다음 중 하나로 실행할 수 있습니다.
   * **EVM** — 완전한 Ethereum 툴링(Hardhat, Foundry, MetaMask)을 갖춘 Solidity / Vyper 스마트 컨트랙트
   * **CosmWasm** — 네이티브 IBC를 지원하는 Cosmos SDK 런타임 위의 Rust 스마트 컨트랙트
   * **SVM** — 병렬 실행, 고처리량 애플리케이션을 위한 Solana Virtual Machine
4. **데이터 가용성 레이어 선택.** 누구나 상태를 재구성할 수 있도록 롤업이 트랜잭션 데이터를 게시하는 위치입니다: **QoreChain DA**, **Celestia**, 또는 **EigenDA**. EigenDA는 대시보드 레벨의 옵션이며, 온체인 `x/rdk` DA 백엔드는 네이티브, Celestia, 또는 둘 다라는 점에 유의하세요 — [데이터 가용성](/rollups/data-availability) 참고.
5. **가스 토큰 설정.** 롤업에서 실행 비용을 지불하는 데 사용되는 토큰입니다. 기본값은 **QOR**이며, 사용자 지정 심볼을 입력해 자체 네이티브 토큰을 사용할 수 있습니다.
6. **시퀀서 선택.** 정산 전에 트랜잭션 순서를 정하는 주체입니다: **공유 시퀀서**(QoreChain 공유 세트), **전용(단일)**(자체 단일 시퀀서 운영), 또는 **탈중앙화**(퍼미션리스 시퀀서 세트).
7. **정산 대상 선택.** 롤업이 상태 루트와 유효성 증명을 앵커링하는 위치입니다: **QoreChain 메인넷** 또는 **Ethereum**.
8. **배포.** 마법사를 제출합니다. 프로비저닝은 **The Qore Trust**의 검토를 거친 뒤 롤업이 라이브 상태가 되므로, 방금 제출한 롤업은 검토가 완료될 때까지 **provisioning** 상태로 표시됩니다.

제출한 롤업은 **내 롤업** 목록에 VM, DA 레이어, 가스 토큰, 시퀀서, 정산 대상, 현재 상태와 함께 표시됩니다.

:::note
대시보드 마법사는 친숙한 제품 수준의 선택지를 제시하며 검토를 거치는 파이프라인을 통해 프로비저닝을 진행합니다. 아래의 CLI는 `x/rdk` 모듈의 온체인 메시지 표면에 직접 작용합니다. 두 방식은 동일한 기본 개념(VM, DA, 시퀀서, 정산)을 공유하지만 서로 다른 고도에서 이를 노출합니다.
:::

---

## CLI를 통한 배포

CLI는 롤업을 온체인에 직접 생성합니다. `create-rollup`은 세 개의 위치 인자 — 롤업 ID, 프로필, 스테이크 금액(`uqor` 단위) — 와 선택적 `--vm` 플래그를 받습니다.

:::tip
체인 버전 **v3.1.74**부터 `create-rollup`은 **선택한 프로필의 프리셋을 자동으로 적용**합니다 — 정산 모드, 시퀀서, DA, 가스 모델, VM이 모두 프리셋에서 가져와집니다. 더 이상 이를 수동으로 설정할 필요가 없습니다 (이전에는 메시지가 소버린 구성을 하드코딩했습니다). `--vm` 플래그는 이제 **기본값이 비어 있음**으로 바뀌었으므로, 명시적으로 재정의하지 않는 한 프로필의 VM이 적용됩니다.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**예시** — `defi` 프리셋으로 롤업 생성 (정산, 시퀀서, DA, VM이 모두 프리셋에서 가져와지며, `defi`는 EVM 위의 zk 정산으로 결정됩니다):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**플래그:**

| 플래그 | 기본값 | 설명 |
| ---- | ------- | ----------- |
| `--vm` | *(비어 있음 — 프리셋의 VM 사용)* | 롤업 VM 유형을 재정의합니다: `evm`, `cosmwasm`, `svm`, 또는 `custom`. 프리셋의 VM을 적용하려면 설정하지 않은 채로 두세요. (RDK 클라이언트에서 Wasm 런타임은 **`native`** VM 유형 — QoreChain Native — 이며, `cosmwasm`은 레거시 별칭으로 유지됩니다. `cosmwasm`은 이 체인 레벨 플래그가 받는 온와이어 값입니다.) |

`[profile]` 인자는 자동으로 적용되는 프리셋 구성을 선택합니다 — **[프리셋 프로필](/rollups/preset-profiles)** 참고. `[stake-amount]`는 `uqor` 단위의 본드입니다.

### 배포한 내용 확인

```bash
# ID로 특정 롤업 조회
qorechaind query rdk rollup my-defi-rollup

# 등록된 모든 롤업 목록
qorechaind query rdk list-rollups
```

---

## TypeScript RDK로 배포하기 (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit는 CLI와 동일한 온체인 `x/rdk` 모듈을 공개 RPC/REST/gRPC/JSON-RPC 및 임의의 cosmjs `OfflineSigner`를 통해 구동하는 두 개의 공개 npm 패키지로 제공됩니다.

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — TypeScript SDK: 프리셋 프로필을 갖춘 구성 빌더, 롤업 및 정산-배치 라이프사이클을 위한 트랜잭션 헬퍼, 네이티브 DA, 타입이 지정된 읽기 클라이언트, 그리고 v0.4 추가 사항 — 양자 내성 정산 영수증, QCAI Rollup Copilot, 크로스 VM 콜데이터 헬퍼, 워치타워.
* **`create-qorechain-rollup`** (`v0.4.4`) — 프로필별로 실행 가능한 스타터 템플릿(`multivm-rollup` 템플릿 포함)을 하나씩 클론하는 스캐폴더.

이들은 npm에 게시되어 있습니다. 이 저장소는 또한 게시된 오퍼레이터 CLI인 **`@qorechain/rdk-cli`**(`qorollup`, `v0.4.4`)도 제공하며, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, 라이프사이클(`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, `faucet` 명령과 v0.4의 `receipt`, `advise`, `watchtower` 명령을 포함합니다.

v0.4.0 초기 릴리스 이후의 주요 사항:

* **v0.4.2 — 별도 설정 없이 라이브 네트워크와 바로 작동.** `mainnet`과 `testnet` 프리셋이 이제 공개 `qore.host` 엔드포인트(`api.qore.host` / `api-testnet.qore.host`의 REST)를 기본 탑재하므로, `createRdkClient({ network })`는 수동 `endpoints` 설정 없이도 체인에 연결됩니다 — 자체 노드를 대상으로 할 때만 재정의하세요. 동일 릴리스에서 Wasm 롤업 VM 식별자의 이름을 **`native`**(QoreChain Native)로 변경했습니다. `cosmwasm`은 여전히 유효한 레거시 별칭으로 남아 있으며, 둘 다 와이어상에서는 `cosmwasm`으로 매핑됩니다 — 체인, 익스플로러, 대시보드는 변경되지 않았습니다.
* **v0.4.3 — 하이브리드 서명 인코딩 수정**, TypeScript 서명 경로에 대한 것입니다 (아래 주의 사항 참고).
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`을 추적**, 체인 **v3.1.85** 인증자 레인을 위한 SDK 릴리스로, 이 기능들이 SDK를 통해 RDK의 TypeScript 사용자에게 직접 도달합니다. RDK API 변경 사항은 없습니다.

:::caution
**TypeScript 사용자는 RDK ≥ 0.4.3을 사용해야 합니다.** 이전 릴리스는 하이브리드 PQC 트랜잭션 확장을 잘못 인코딩하여 체인이 모든 하이브리드 서명 트랜잭션을 거부했습니다. v0.4.3(`@qorechain/sdk` ≥ 0.6.1을 통해)이 이 인코딩 문제를 수정합니다. TypeScript 하이브리드 서명 경로만 영향을 받았습니다 — Python, Go, Rust, Java 클라이언트는 클래식 방식으로만 서명하므로 전혀 영향을 받지 않았습니다.
:::

#### Python, Go, Rust, Java 클라이언트

TypeScript 패키지와 함께, RDK는 TypeScript와 동일한 표면을 미러링하는 완전한 **Python**, **Go**, **Rust**, **Java** 클라이언트를 제공합니다. 유효성 검사를 포함한 구성 빌더, 다섯 개의 프리셋 프로필, denom/경제/bech32 유틸리티, 바이너리-머클 및 출금 증명 헬퍼, 롤업 매니페스트, REST 및 `qor_` JSON-RPC 읽기 클라이언트, 프리플라이트/헬스 체크, 계정(니모닉 → `qor` 주소), 그리고 **트랜잭션 서명 + 브로드캐스트**(`SIGN_MODE_DIRECT`)까지 포함합니다. 모두 공유된 크로스 언어 골든 벡터에 대해 검증되었으며 각 레지스트리에 **게시**되어 있습니다.

```bash
# Python — qorechain-rdk로 설치되며, qorrdk로 임포트됩니다
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

현재 게시된 버전: Python `qorechain-rdk` **0.4.4**(PyPI, `qorrdk`로 임포트), Rust `qorechain-rdk`(crates.io — 최신 게시 릴리스를 설치하거나 저장소에서 빌드), Go 모듈 `github.com/qorechain/qorechain-rdk/packages/go`(**v0.4.4**), Java `io.github.qorechain:qorechain-rdk` **0.4.4**(Maven Central). 라이브 브로드캐스트에는 노드 엔드포인트가 필요합니다.

:::note
TypeScript RDK와 그 템플릿은 기본적으로 **`qorechain-diana`** 테스트넷을 대상으로 하며, v0.4.2부터는 프리셋이 별도 설정 없이 라이브 공개 엔드포인트에 도달합니다. 버전을 고정하고 메인넷 이전에 테스트넷에서 검증하세요.
:::

### `create-qorechain-rollup`으로 프로젝트 스캐폴딩하기 {#scaffold-a-project-with-create-qorechain-rollup}

각 프로필에는 이에 대응하는 스타터 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`)이 있습니다. 다음 두 형식 중 하나로 스캐폴딩하세요.

```bash
npm create qorechain-rollup my-rollup
# 또는
npx create-qorechain-rollup my-rollup
```

비대화형 / CI 환경에서는 템플릿과 네트워크를 명시적으로 지정하세요.

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

스캐폴더는 문서화된 스테이크 및 생성-소각 비용과 롤업을 생성하고 상태를 읽기 위한 다음 단계를 출력합니다.

### 코드로 롤업 생성하기

프리셋으로부터 구성을 빌드하고, 체인에서 라이브 스테이크와 소각률을 읽은 다음, 서명 클라이언트로 롤업을 생성합니다. 구성 빌더는 `validate()` / `build()`에서 정산 → 증명 호환성 매트릭스를 강제합니다.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// defi 프리셋의 기본값으로 미리 채워진 구성 빌더. .set({ ... })로 재정의합니다.
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// 공개 qore.host 엔드포인트가 프리셋에 내장되어 있습니다 (RDK ≥ 0.4.2) —
// 수동 `endpoints` 구성이 필요 없습니다. 자체 노드를 대상으로 할 때만 재정의하세요.
const rdk = createRdkClient({ network: "testnet" });

// 라이브 모듈 파라미터를 읽습니다 — 스테이크나 소각률을 하드코딩하지 마세요.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// 임의의 cosmjs OfflineSigner로 서명 클라이언트를 연결합니다.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // 체인은 0.1uqor/gas의 최소 수수료를 강제합니다
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

어떤 프로필이 맞는지 확실하지 않으신가요? `rdk.suggestProfile("a lending protocol with predictable fees")`는 QCAI 기반 추천을 반환합니다 (문서화된 폴백 포함).

### 코드에서 라이프사이클 관리 및 상태 읽기

서명 클라이언트는 전체 라이프사이클 — `pauseRollup`, `resumeRollup`, `stopRollup`, 그리고 `submitBatch`, `challengeBatch`, `resolveChallenge`, `executeWithdrawal`을 노출합니다. `currentStatus`를 전달하여 라이프사이클 전환을 보호할 수 있습니다.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

타입이 지정된 REST 클라이언트로 서명자 없이 상태를 읽습니다.

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## 라이프사이클 관리

롤업은 `pending`, `active`, `paused`, `stopped` 상태를 거쳐 이동합니다. 생성자는 다음 명령으로 전환을 관리합니다.

### 일시 중지

롤업을 일시적으로 중단합니다. 상태는 보존되며 롤업을 다시 시작할 수 있습니다. 사유 문자열이 필요합니다.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 재개

이전에 일시 중지된 롤업을 재개합니다.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 중단

롤업을 영구적으로 폐기하고 스테이크를 해제합니다. 스테이크된 QOR — 일회성 생성 소각분을 제외한 — 은 생성자에게 반환됩니다.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
롤업 중단은 영구적입니다. 중단된 롤업은 다시 시작할 수 없습니다.
:::

---

## 오퍼레이터 명령: 배치와 챌린지

롤업 오퍼레이터는 정산 배치를 제출하며, 챌린저는 옵티미스틱 배치에 이의를 제기할 수 있습니다. 이 명령들은 **[롤업 개요](/rollups/overview)**와 **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)**에서 설명하는 정산 레이어를 뒷받침합니다.

### 배치 제출

롤업에 대한 정산 배치를 제출합니다. 롤업 ID, 배치 인덱스, 16진수로 인코딩된 상태 루트를 인자로 받습니다.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### 배치에 이의 제기

제출된 배치에 이의를 제기합니다 (옵티미스틱 롤업의 경우). 롤업 ID와 배치 인덱스를 인자로 받으며, `--proof`로 부정 증명(fraud proof)을 전달합니다. 체인 버전 **v3.1.74**부터 옵티미스틱 **submit-batch → challenge-batch** 경로가 라이브 상태로 엔드투엔드로 작동합니다.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| 플래그 | 설명 |
| ---- | ----------- |
| `--proof` | 16진수로 인코딩된 부정 증명 |

### 배치 조회

```bash
# 롤업의 최신 배치
qorechaind query rdk batch [rollup-id]

# 인덱스로 특정 배치 조회
qorechaind query rdk batch [rollup-id] --index 42
```

---

## 조회

| 명령 | 목적 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 특정 롤업의 세부 정보 |
| `qorechaind query rdk list-rollups` | 등록된 모든 롤업 |
| `qorechaind query rdk batch [rollup-id]` | 최신 정산 배치 (또는 `--index`) |
| `qorechaind query rdk config` | RDK 모듈 파라미터 |
| `qorechaind query rdk suggest-profile [use-case]` | 사용 사례에 맞는 프리셋 추천 |

---

## 다음 단계

* **[데이터 가용성](/rollups/data-availability)** — 네이티브, Celestia, 중복 DA 백엔드.
* **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)** — 증명 검증과 `execute-withdrawal`을 통한 L2 → L1 출금 흐름.
