---
slug: /rollups/deploying-a-rollup
title: 롤업 배포하기
sidebar_label: 롤업 배포하기
sidebar_position: 3
---

# 롤업 배포하기

애플리케이션 전용 롤업은 세 가지 방법으로 설정할 수 있습니다. **대시보드**(요청 양식이며 온체인 트랜잭션이 아닙니다)를 통하거나, 체인 **CLI**(`qorechaind`, 온체인 트랜잭션에 대한 완전한 제어권 제공)를 통하거나, **TypeScript RDK**(`@qorechain/rdk`와 `create-qorechain-rollup` 스캐폴더)를 사용하는 것입니다. TypeScript RDK는 현재 구성과 읽기를 지원합니다. 이 페이지는 세 가지 방법 모두와 함께 오퍼레이터 라이프사이클 및 배치 명령도 다룹니다.

:::caution 초기 단계 기능
아직 두 네트워크 어디에서도 롤업이 생성된 적이 없습니다. 아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 체인 버전 **v3.2.2**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**)은 체인 버전 **v3.2.1**로 운영됩니다. 이 페이지는 메인넷의 동작을 설명하며, 테스트넷의 더 최신 릴리스는 세부 사항이 다를 수 있습니다. 모든 배포는 먼저 테스트넷에서 검증하세요.
:::

:::note 수수료와 서명
네트워크는 최소 가스 가격 `0.1uqor`를 강제하므로 단순한 `--fees 500uqor`는 거부되며, 모든 네이티브 레인 트랜잭션에는 하이브리드 포스트 퀀텀 공동 서명이 필요합니다. 따라서 이 페이지의 CLI 예시는 `--generate-only`로 트랜잭션을 만든 뒤 `qorechaind tx pqc cosign`으로 공동 서명하며, 이 명령이 서명과 브로드캐스트를 수행합니다 (키는 `qorechaind tx pqc gen-key`로 한 번 생성하고, `qorechaind tx pqc register-key`로 온체인에 한 번 등록하거나, 이를 대신 처리해 주는 QoreX 또는 SDK를 사용하세요). 수수료는 서명되지 않은 파일이 생성될 때 고정되므로 가스 한도와 수수료를 함께 설정하세요. 수수료는 가스 한도 × 0.1 uqor 이상이어야 합니다. 아래의 가스 한도는 참고용이므로, 의존하기 전에 시뮬레이션하세요. [첫 트랜잭션](/getting-started/first-transaction)과 [포스트 퀀텀 서명](/developer-guide/post-quantum-signing)을 참고하세요.
:::

---

## 요구 사항

| 요구 사항 | 세부 내용 |
| ----------- | ------- |
| **최소 스테이크** | 최소 10,000 QOR(`min_stake_for_rollup`)이며, 스테이크는 롤업 생성 시 에스크로에 예치됩니다 |
| **생성 소각** | 공급한 스테이크의 1 %가 생성 시 영구적으로 소각됩니다 (소각을 적용할 수 없는 생성은 거부됩니다). 나머지는 에스크로에 보관되어 롤업이 중단될 때 반환됩니다 |
| **레이어 등록 스테이크** | 생성 시 멀티레이어 모듈에 롤업의 레이어도 함께 등록되며, 이때 생성자로부터 **1,000 QOR**(`min_sidechain_stake`)가 추가로 잠기고 중단 시 레이어가 폐기될 때 반환됩니다. 레이어를 등록할 수 없는 경우(잔액 부족 또는 멀티레이어 사이드체인 한도 10개 도달) 롤업은 생성되지만 레이어가 없으므로 배치를 앵커링할 수 없습니다 |
| **롤업 ID** | 3~64자를 사용하세요. 소문자, 숫자, `.`, `_`, `-`를 사용할 수 있으며 문자 또는 숫자로 시작해야 합니다. 최신 체인 릴리스는 이 규칙을 강제하므로 처음부터 따르세요 |
| **계정** | 포스트 퀀텀 키가 등록되어 있고, 스테이크, 레이어 스테이크, 트랜잭션 수수료를 충당할 만큼 잔액이 충분한, 자금이 지원된 QoreChain 계정 |

배포하기 전에 현재의 최소 스테이크와 소각률을 알기 위해 라이브 모듈 파라미터를 조회하세요.

```bash
qorechaind query rdk config
```

---

## 대시보드를 통한 배포 (도구 → 롤업)

대시보드는 **도구 → 롤업** 메뉴 아래에 **롤업 배포** 양식을 제공합니다. 이것은 **요청 양식**입니다. 제출하면 계정에 대한 프로비저닝 요청이 기록되어 **The Qore Trust**의 검토를 받으며, 새 요청은 **provisioning** 상태로 표시됩니다. 온체인 `create-rollup` 트랜잭션을 브로드캐스트하지는 **않습니다**. 롤업을 온체인에 등록하려면 아래의 CLI를 사용하세요.

### 단계

1. **로그인.** 요청을 제출하고 기존 요청 목록을 조회하려면 양식에 인증된 세션이 필요합니다.
2. **롤업 이름 지정.** 롤업 이름을 입력합니다 (2~41자: 문자, 숫자, 공백, 하이픈 또는 밑줄).
3. **가상 머신 선택.** 온체인 레코드에는 VM 레이블이 저장됩니다. 롤업은 자체 런타임에서 오프체인으로 실행되며, 이 선택이 QoreChain 자체의 EVM, CosmWasm 또는 SVM 레인에서 실행되는 것은 아닙니다.
   * **EVM** — 완전한 Ethereum 툴링(Hardhat, Foundry, MetaMask)을 갖춘 Solidity / Vyper 스마트 컨트랙트
   * **CosmWasm** — 네이티브 IBC를 지원하는 Cosmos SDK 런타임 위의 Rust 스마트 컨트랙트
   * **SVM** — 병렬 실행, 고처리량 애플리케이션을 위한 Solana Virtual Machine
4. **데이터 가용성 레이어 선택.** 누구나 상태를 재구성할 수 있도록 롤업이 트랜잭션 데이터를 게시하는 위치입니다: **QoreChain DA**, **Celestia**, 또는 **EigenDA**. EigenDA는 대시보드 레벨의 옵션이며, 온체인 `x/rdk` DA 백엔드는 네이티브, Celestia, 또는 둘 다라는 점에 유의하세요 — [데이터 가용성](/rollups/data-availability) 참고.
5. **가스 토큰 설정.** 롤업에서 실행 비용을 지불하는 데 사용되는 토큰입니다. 기본값은 **QOR**이며, 사용자 지정 심볼을 입력해 자체 네이티브 토큰을 사용할 수 있습니다.
6. **시퀀서 선택.** 정산 전에 트랜잭션 순서를 정하는 주체입니다: **공유 시퀀서**(QoreChain 공유 세트), **전용(단일)**(자체 단일 시퀀서 운영), 또는 **탈중앙화**(퍼미션리스 시퀀서 세트).
7. **정산 대상 선택.** 롤업이 상태 루트와 유효성 증명을 앵커링하는 위치입니다: **QoreChain 메인넷** 또는 **Ethereum**.
8. **요청 제출.** 프로비저닝은 **The Qore Trust**가 검토하므로, 방금 제출한 요청은 검토가 완료될 때까지 **provisioning** 상태로 표시됩니다.

제출한 요청은 **내 롤업** 목록에 VM, DA 레이어, 가스 토큰, 시퀀서, 정산 대상, 현재 상태와 함께 표시됩니다.

:::note
양식의 옵션(가상 머신, 데이터 가용성 레이어, 가스 토큰, 시퀀서, 정산 대상)은 사용자가 요청하는 내용을 설명하는 것이며, 온체인 `x/rdk` 모듈이 현재 지원하는 범위보다 넓습니다. 온체인에서 데이터 가용성은 `native`이고(Celestia는 활성화되지 않음), 시퀀싱은 롤업 생성자 또는 구성된 시퀀서 주소가 담당합니다. [데이터 가용성](/rollups/data-availability)을 참고하세요.
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
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json
```

**예시** — `defi` 프리셋으로 롤업 생성 (정산, 시퀀서, DA, VM이 모두 프리셋에서 가져와지며, `defi`는 EVM 위의 zk 정산으로 결정됩니다). 서명되지 않은 트랜잭션을 만든 다음, 포스트 퀀텀 공동 서명을 붙여 브로드캐스트합니다.

```bash
# 1. Build the unsigned transaction (10,000 QOR stake)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 600000 --fees 60000uqor \
  --generate-only > create-rollup.json

# 2. Cosign with your post-quantum key and broadcast
qorechaind tx pqc cosign create-rollup.json \
  --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

`defi`와 같은 ZK 프로필은 생성 시 허용되지만, 이 방식으로 생성된 롤업은 검증 키를 갖지 않으므로 ZK 배치를 아직 확정할 수 없습니다 ([ZK / STARK & 출금](/rollups/zk-stark-withdrawals) 참고).

**플래그:**

| 플래그 | 기본값 | 설명 |
| ---- | ------- | ----------- |
| `--vm` | *(비어 있음 — 프로필의 VM 사용)* | 롤업 VM 유형을 재정의합니다: `evm`, `cosmwasm`, `svm`, 또는 `custom`. 프리셋의 VM을 적용하려면 설정하지 않은 채로 두세요. (RDK 클라이언트에서 Wasm 런타임은 **`native`** VM 유형 — QoreChain Native — 이며, `cosmwasm`은 레거시 별칭으로 유지됩니다. `cosmwasm`은 이 체인 레벨 플래그가 받는 온와이어 값입니다.) |

:::note VM 레이블은 메타데이터입니다
`--vm`은 롤업이 사용하는 런타임을 기록합니다. 호스트 체인은 롤업을 정산할 뿐 그 컨트랙트를 실행하지 않습니다. 호스트 체인 자체의 CosmWasm 업로드는 현재 닫혀 있고 SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있습니다. 이는 오프체인 롤업의 정산에는 영향을 주지 않지만, 롤업용 컨트랙트를 해당 호스트 체인 레인에 배포할 수는 없다는 뜻입니다.
:::

`[profile]` 인자는 자동으로 적용되는 프리셋 구성을 선택합니다 — **[프리셋 프로필](/rollups/preset-profiles)** 참고. `[stake-amount]`는 `uqor` 단위의 본드이며, 생성 소각은 그 금액의 1 %입니다.

### 배포한 내용 확인

```bash
# ID로 특정 롤업 조회
qorechaind query rdk rollup my-defi-rollup

# 등록된 모든 롤업 목록
qorechaind query rdk list-rollups
```

---

## TypeScript RDK로 배포하기 (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit는 CLI와 동일한 온체인 `x/rdk` 모듈을 위한 두 개의 공개 npm 패키지로 제공됩니다. 현재로서는 구성을 빌드하고 검증하거나 상태를 읽는 데 가장 유용합니다. 트랜잭션 전송에 의존하기 전에 아래의 서명 관련 주의 사항을 확인하세요.

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — TypeScript SDK: 프리셋 프로필을 갖춘 구성 빌더, 롤업 및 정산-배치 라이프사이클을 위한 트랜잭션 헬퍼, 네이티브 DA, 타입이 지정된 읽기 클라이언트, 그리고 v0.4 추가 사항 — 양자 내성 정산 영수증, QCAI Rollup Copilot, 크로스 VM 콜데이터 헬퍼, 워치타워.
* **`create-qorechain-rollup`** (`v0.4.4`) — 프로필별로 실행 가능한 스타터 템플릿(`multivm-rollup` 템플릿 포함)을 하나씩 클론하는 스캐폴더.

이들은 npm에 게시되어 있습니다. 이 저장소는 또한 게시된 오퍼레이터 CLI인 **`@qorechain/rdk-cli`**(`qorollup`, `v0.4.4`)도 제공하며, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, 라이프사이클(`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, `faucet` 명령과 v0.4의 `receipt`, `advise`, `watchtower` 명령을 포함합니다.

v0.4.0 초기 릴리스 이후의 주요 사항:

* **v0.4.2 — 별도 설정 없이 라이브 네트워크와 바로 작동.** `mainnet`과 `testnet` 프리셋이 이제 공개 `qore.host` 엔드포인트(`api.qore.host` / `api-testnet.qore.host`의 REST)를 기본 탑재하므로, `createRdkClient({ network })`는 수동 `endpoints` 설정 없이도 체인에 연결됩니다 — 자체 노드를 대상으로 할 때만 재정의하세요. 동일 릴리스에서 Wasm 롤업 VM 식별자의 이름을 **`native`**(QoreChain Native)로 변경했습니다. `cosmwasm`은 여전히 유효한 레거시 별칭으로 남아 있으며, 둘 다 와이어상에서는 `cosmwasm`으로 매핑됩니다 — 체인, 익스플로러, 대시보드는 변경되지 않았습니다.
* **v0.4.3 — SDK의 하이브리드 서명 인코딩 수정을 위한 의존성 업데이트.** RDK 트랜잭션 클라이언트 자체는 여전히 클래식 방식으로만 서명합니다 (아래 주의 사항 참고).
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`을 추적**, 체인 **v3.1.85** 인증자 레인을 위한 SDK 릴리스로, 이 기능들이 SDK를 통해 RDK의 TypeScript 사용자에게 직접 도달합니다. RDK API 변경 사항은 없습니다.

:::caution 게시된 클라이언트로 서명하기
두 네트워크 모두 모든 네이티브 레인 트랜잭션에 하이브리드(secp256k1 + ML-DSA-87) 서명을 요구합니다. 현재 게시된 npm 패키지(`@qorechain/rdk` 0.4.4)는 클래식 방식 전용 클라이언트로 서명하므로 체인 상태를 **읽을** 수는 있지만 트랜잭션이 수락되도록 할 수는 없습니다. 현재 트랜잭션은 CLI(`--generate-only` 후 `qorechaind tx pqc cosign`)로 빌드 및 서명하거나 [`@qorechain/sdk`](/sdk/overview)의 하이브리드 서명을 사용하세요. Python, Go, Rust, Java RDK 클라이언트도 클래식 방식으로만 서명하므로 이 네트워크에서 **트랜잭션에는 적합하지 않습니다**. 설치하는 버전을 확인하세요. RDK 클라이언트에 하이브리드 서명을 추가하는 릴리스는 이곳에 안내됩니다.
:::

:::note 읽기에는 RDK REST 경로가 필요합니다
TypeScript 읽기 헬퍼(`rdk.params()`, `rdk.rest.getRollup()`)는 `/qorechain/rdk/v1/…` REST 경로를 호출하는데, 공개 메인넷 엔드포인트는 현재 이 경로를 제공하지 않습니다. 메인넷에서는 `qorechaind query rdk …`(gRPC)를 사용하세요.
:::

#### Python, Go, Rust, Java 클라이언트

TypeScript 패키지와 함께, RDK는 TypeScript와 동일한 표면을 미러링하는 완전한 **Python**, **Go**, **Rust**, **Java** 클라이언트를 제공합니다. 유효성 검사를 포함한 구성 빌더, 다섯 개의 프리셋 프로필, denom/경제/bech32 유틸리티, 바이너리-머클 및 출금 증명 헬퍼, 롤업 매니페스트, REST 및 `qor_` JSON-RPC 읽기 클라이언트, 프리플라이트/헬스 체크, 계정(니모닉 → `qor` 주소), 그리고 클래식 트랜잭션 서명 + 브로드캐스트(`SIGN_MODE_DIRECT`, 하이브리드 서명 네트워크에서는 수락되지 않음 — 위의 주의 사항 참고)까지 포함합니다. 모두 공유된 크로스 언어 골든 벡터에 대해 검증되었으며 각 레지스트리에 **게시**되어 있습니다.

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

현재 게시된 버전: Python `qorechain-rdk` **0.5.0**(PyPI, `qorrdk`로 임포트), Go 모듈 `github.com/qorechain/qorechain-rdk/packages/go`(**v0.5.0**), Rust `qorechain-rdk` **0.4.4**(crates.io), Java `io.github.qorechain:qorechain-rdk` **0.4.4**(Maven Central). 이 클라이언트들은 체인 상태를 읽습니다. 네트워크가 요구하는 하이브리드 서명은 생성하지 않습니다 (위의 주의 사항 참고).

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

:::caution 템플릿이 설치하는 RDK 버전 확인
템플릿은 현재 `@qorechain/rdk`를 0.2 시리즈로 고정하고 있습니다. 스캐폴딩 후 `npm install @qorechain/rdk@latest`를 실행하여 공개 `qore.host` 엔드포인트 프리셋과 최신 읽기 클라이언트를 사용하세요. 스타터의 `submit-batch` 스크립트는 참고용 흐름일 뿐이며, 예시용 루트와 샘플 증명을 게시하므로 라이브 네트워크에서 배치를 확정하는 것을 기대해서는 안 됩니다.
:::

### 코드로 롤업 구성 빌드하기

프리셋으로부터 구성을 빌드하고, 체인에서 라이브 스테이크와 소각률을 읽은 다음, 생성 메시지를 만듭니다. 구성 빌더는 `validate()` / `build()`에서 정산 → 증명 호환성 매트릭스를 강제합니다. 결과 값은 위의 CLI(또는 하이브리드 서명이 가능한 클라이언트)로 제출하세요 — 서명 관련 주의 사항을 참고하세요.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read: it works where the RDK REST routes are served and
// is refused (HTTP 501) on mainnet today — use `qorechaind query rdk config` there.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// The values to pass to `qorechaind tx rdk create-rollup`.
const msg = config.toCreateMsg("<your qor address>", { stakeAmount: params.minStakeForRollup });
console.log(msg.rollupId, msg.profile, msg.vmType, msg.stakeAmount);
```

어떤 프로필이 맞는지 확실하지 않으신가요? `rdk.suggestProfile(...)`은 QCAI 기반 추천을 반환하도록 되어 있지만, 현재 공개 엔드포인트에서는 항상 `defi` 폴백(`source: "fallback"`)을 반환하므로 [프로필 표](/rollups/preset-profiles)에서 선택하세요.

### 코드에서 상태 읽기

타입이 지정된 REST 클라이언트는 서명자가 필요 없으며, RDK REST 경로가 제공되는 곳(현재 메인넷은 제외)에서 작동합니다.

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

배치는 `qorechaind query rdk batch [rollup-id]`(아래)를 사용하세요.

---

## 라이프사이클 관리

롤업은 `pending`, `active`, `paused`, `stopped` 상태를 거쳐 이동하며, 새 롤업은 즉시 `active`로 시작합니다. 롤업을 일시 중지, 재개 또는 중단할 수 있는 것은 생성자뿐입니다 (체인 버전 v3.2.0부터 강제됨). 아래 각 명령은 생성과 동일한 2단계 패턴을 따릅니다. 서명되지 않은 트랜잭션을 생성한 다음 공동 서명합니다.

### 일시 중지

롤업을 일시적으로 중단합니다. 상태는 보존되며 롤업을 다시 시작할 수 있습니다. 사유 문자열이 필요합니다.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > pause.json
qorechaind tx pqc cosign pause.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### 재개

이전에 일시 중지된 롤업을 재개합니다.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > resume.json
qorechaind tx pqc cosign resume.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

### 중단

롤업을 영구적으로 폐기하고 스테이크를 해제합니다. 스테이크된 QOR — 일회성 생성 소각분을 제외한 — 은 생성자에게 반환됩니다. 1,000 QOR의 레이어 등록 스테이크는 롤업의 레이어가 폐기될 때 별도로 반환됩니다.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > stop.json
qorechaind tx pqc cosign stop.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

:::danger
롤업 중단은 영구적입니다. 중단된 롤업은 다시 시작할 수 없습니다.
:::

---

## 오퍼레이터 명령: 배치와 챌린지

롤업 오퍼레이터는 정산 배치를 제출하며, 챌린저는 옵티미스틱 배치에 이의를 제기할 수 있습니다. 이 명령들은 **[롤업 개요](/rollups/overview)**와 **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)**에서 설명하는 정산 레이어를 뒷받침합니다.

### 누가 어떤 순서로 제출할 수 있는가

* **롤업에 구성된 시퀀서 주소만 — 구성된 주소가 없으면(모든 프리셋의 경우) 생성자가 — 배치를 제출할 수 있습니다.** 베이스드 및 공유 시퀀싱은 아직 제안자 세트나 로스터를 허용하지 않습니다. 현재는 레이블일 뿐이며 생성자가 제출합니다.
* 배치는 체인을 이룹니다. 첫 번째 배치의 인덱스는 `0`이며, 이후 배치는 다음 인덱스를 사용하고 이전 배치의 상태 루트를 `prev_state_root`로 담아야 합니다.
* `native` 또는 `both` 롤업에서 데이터 해시를 담은 배치는 일치하는 블롭이 이미 저장되어 있지 않으면 거부됩니다 ([데이터 가용성](/rollups/data-availability) 참고). 데이터 해시가 없는 배치는 검사하지 않습니다.
* `zk` 롤업은 증명을 첨부해야 하며, 그 증명이 검증을 통과해야 합니다 ([ZK / STARK & 출금](/rollups/zk-stark-withdrawals) 참고).

### 배치 제출

롤업에 대한 정산 배치를 제출합니다. 롤업 ID, 배치 인덱스, 16진수로 인코딩된 상태 루트를 인자로 받습니다.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

CLI 명령은 이 세 개의 위치 인자만 받으므로 **배치 0**만 제출할 수 있습니다. 이후 배치는 `prev_state_root`(그리고 사용하는 경우 `data_hash`, `withdrawals_root`, `tx_count`)를 설정할 수 있는 클라이언트가 필요합니다. 롤업의 배치는 정산되지만 현재 메인넷에서는 `x/multilayer`에 **앵커링되지 않습니다** ([Rollup Development Kit](/architecture/rollup-development-kit#state-anchoring) 참고).

### 배치에 이의 제기 (옵티미스틱 롤업) {#challenge-a-batch-optimistic-rollups}

어떤 계정이든 챌린지 윈도우 안에서 `submitted` 상태의 배치에 대해 본드(롤업의 `challenge_bond`이며, `nft` 및 `custom` 프리셋은 1,000 QOR)와 부정 증명을 게시하여 이의를 제기할 수 있습니다. 롤업 ID와 배치 인덱스를 인자로 받으며, `--proof`로 부정 증명(fraud proof)을 전달합니다.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > challenge.json
qorechaind tx pqc cosign challenge.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| 플래그 | 설명 |
| ---- | ----------- |
| `--proof` | 16진수로 인코딩된 부정 증명 |

챌린지는 배치를 **동결**(`challenged`)시켜 확정될 수 없게 합니다. 그런 다음 롤업 **생성자**가 resolve-challenge 메시지로 이를 해결합니다 (CLI 명령으로는 제공되지 않으므로 클라이언트를 사용하세요). 체인은 저장된 증명을 검증하여 결과를 스스로 결정합니다. 부정이 인정되면 배치는 `rejected`가 되고, 본드는 반환되며, 챌린저는 롤업의 스테이크에서 본드와 같은 금액을 추가로 지급받습니다. 기각되면 본드는 생성자에게 돌아가고 배치는 `submitted`로 되돌아갑니다.

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
| `qorechaind query rdk suggest-profile [use-case]` | `qor_suggestRollupProfile` RPC를 가리키는 안내를 출력합니다. 공개 엔드포인트는 이를 제공하지 않으므로 [프리셋 프로필](/rollups/preset-profiles) 표에서 프로필을 선택하세요 |

---

## 다음 단계

* **[데이터 가용성](/rollups/data-availability)** — 네이티브, Celestia, 중복 DA 백엔드.
* **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)** — 증명 검증과 `execute-withdrawal`을 통한 L2 → L1 출금 흐름.
