---
slug: /rollups/deploying-a-rollup
title: 롤업 배포하기
sidebar_label: 롤업 배포하기
sidebar_position: 3
---

# 롤업 배포하기

애플리케이션 전용 롤업은 세 가지 방법으로 설정할 수 있습니다. **대시보드**(요청 양식이며 온체인 트랜잭션이 아닙니다)를 통하거나, 체인 **CLI**(`qorechaind`, 온체인 트랜잭션에 대한 완전한 제어권 제공)를 통하거나, **TypeScript RDK**(`@qorechain/rdk`와 `create-qorechain-rollup` 스캐폴더)를 사용하는 것입니다. TypeScript RDK는 구성, 읽기를 지원하며, 포스트 퀀텀 키를 제공하면 하이브리드 서명 트랜잭션도 지원합니다([RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits) 참고). 이 페이지는 세 가지 방법 모두와 함께 오퍼레이터 라이프사이클 및 배치 명령도 다룹니다.

:::caution 초기 단계 기능
아직 두 네트워크 어디에서도 롤업이 생성된 적이 없습니다(2026년 10월 23일 확인). 아래 명령어는 **`qorechain-diana`** 테스트넷(EVM 체인 ID **9800**, 2026년 10월 19일부터 체인 버전 **v3.2.4**)을 사용합니다. 메인넷(**`qorechain-vladi`**, EVM 체인 ID **9801**, 2026년 6월 7일부터 운영 중)은 2026년 10월 23일부터 체인 버전 **v3.2.4**로 운영됩니다(거버넌스 제안 13에 따라 높이 3,742,566에서 적용). 이전 릴리스는 몇 가지 세부 사항에서 다르며, 이 페이지는 이를 "v3.2.4부터"로 표시합니다. 모든 배포는 먼저 테스트넷에서 검증하세요.
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
| **롤업 ID** | 3~64자를 사용하세요. 소문자, 숫자, `.`, `_`, `-`를 사용할 수 있으며 문자 또는 숫자로 시작해야 합니다. 체인은 v3.2.2부터 두 네트워크 모두에서 이 규칙을 강제하며(CLI도 트랜잭션을 만들기 전에 이를 검사합니다), 규칙에 맞지 않는 ID는 거부됩니다 |
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
3. **가상 머신 선택.** 온체인 레코드에는 VM 레이블이 저장됩니다. 롤업은 자체 런타임에서 오프체인으로 실행되며, 이 선택이 QoreChain 자체의 EVM, QoreChain Native 또는 SVM 레인에서 실행되는 것은 아닙니다.
   * **EVM** — 완전한 Ethereum 툴링(Hardhat, Foundry, MetaMask)을 갖춘 Solidity / Vyper 스마트 컨트랙트
   * **QoreChain Native** — 네이티브 IBC를 지원하는 Cosmos SDK 런타임(CosmWasm 런타임) 위의 Rust 스마트 컨트랙트
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
`--vm`은 롤업이 사용하는 런타임을 기록합니다. 호스트 체인은 롤업을 정산할 뿐 그 컨트랙트를 실행하지 않습니다. 호스트 체인 자체의 QoreChain Native 업로드는 현재 닫혀 있고 SVM 트랜잭션 레인은 네트워크 전체에서 비활성화되어 있습니다. 이는 오프체인 롤업의 정산에는 영향을 주지 않지만, 롤업용 컨트랙트를 해당 호스트 체인 레인에 배포할 수는 없다는 뜻입니다.
:::

`[profile]` 인자는 자동으로 적용되는 프리셋 구성을 선택합니다 — **[프리셋 프로필](/rollups/preset-profiles)** 참고. `[stake-amount]`는 `uqor` 단위의 본드이며, 생성 소각은 그 금액의 1 %입니다.

### 배포한 내용 확인

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## TypeScript RDK로 배포하기 (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit는 CLI와 동일한 온체인 `x/rdk` 모듈을 위한 두 개의 공개 npm 패키지로 제공됩니다. 어느 네트워크에도 아직 롤업이 없으므로, 이 키트의 어떤 트랜잭션 경로도 라이브 롤업에서 실행된 적이 없습니다. 트랜잭션 전송에 의존하기 전에 [RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits)을 읽어 보세요.

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.6.0`) — TypeScript SDK: 프리셋 프로필을 갖춘 구성 빌더, 롤업 및 정산-배치 라이프사이클을 위한 트랜잭션 헬퍼, 네이티브 DA, 타입이 지정된 읽기 클라이언트, 양자 내성 정산 영수증, QCAI Rollup Copilot, 크로스 VM 콜데이터 헬퍼, 워치타워. `@qorechain/sdk` `^0.9.0`과 `@qorechain/evm` `^0.8.0`에 의존합니다.
* **`create-qorechain-rollup`** (`v0.6.0`) — 프로필별로 실행 가능한 스타터 템플릿(`multivm-rollup` 템플릿 포함)을 하나씩 클론하는 스캐폴더.

이들은 npm에 게시되어 있습니다. 이 저장소는 또한 게시된 오퍼레이터 CLI인 **`@qorechain/rdk-cli`**(`qorollup`, `v0.6.0`)도 제공하며, `doctor`, `create`, `status`, `watch`, `params`, `suggest`, 라이프사이클(`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw`, `faucet` 명령과 `receipt`, `advise`, `watchtower` 명령을 포함합니다. 이 CLI의 트랜잭션 명령은 클래식 방식으로만 서명합니다(아래 제한 사항 참고).

릴리스별 주요 사항:

* **v0.4.2 — 별도 설정 없이 라이브 네트워크와 바로 작동.** `mainnet`과 `testnet` 프리셋이 이제 공개 `qore.host` 엔드포인트(`api.qore.host` / `api-testnet.qore.host`의 REST)를 기본 탑재하므로, `createRdkClient({ network })`는 수동 `endpoints` 설정 없이도 체인에 연결됩니다 — 자체 노드를 대상으로 할 때만 재정의하세요. 동일 릴리스에서 Wasm 롤업 VM 식별자의 이름을 **`native`**(QoreChain Native)로 변경했습니다. `cosmwasm`은 여전히 유효한 레거시 별칭으로 남아 있으며, 둘 다 와이어상에서는 `cosmwasm`으로 매핑됩니다 — 체인, 익스플로러, 대시보드는 변경되지 않았습니다.
* **v0.4.3 — SDK의 하이브리드 서명 인코딩 수정을 위한 의존성 업데이트.** RDK 트랜잭션 클라이언트 자체는 여전히 클래식 방식으로만 서명했습니다.
* **v0.4.4 — `@qorechain/sdk` `^0.7.0`을 추적**, 체인 **v3.1.85** 인증자 레인을 위한 SDK 릴리스입니다. RDK API 변경 사항은 없습니다.
* **v0.5.0 (2026년 10월 18일)** — 정산 영수증 검증이 체인 상태와 대조하여 이루어지며, 영수증 자체의 필드만으로 유효하다고 보고하는 일이 없습니다. TypeScript 트랜잭션 클라이언트는 `pqcKeypair`가 주어지면 하이브리드 방식으로 서명합니다. `@qorechain/sdk` `^0.8.0`에 의존합니다.
* **v0.6.0 (2026년 10월 20일의 GitHub 릴리스, 2026년 10월 23일에 모든 레지스트리에서 확인)** — 체인 v3.2.2에서 v3.2.4까지를 위한 호환성 릴리스입니다. 앵커링된 배치, 검증이 가능한 정산 영수증, 체인이 측정하는 방식대로 측정되는 챌린지 윈도우, 체인의 크로스 VM 레이아웃과 일치하는 인코더, 하이브리드 서명을 하는 템플릿, 그리고 `@qorechain/sdk` `^0.9.0`이 포함됩니다. 자세한 내용과 남은 사항은 아래에 있습니다.

**게시된 버전(2026년 10월 23일 확인).** npm `@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`: **0.6.0**(`latest`). PyPI `qorechain-rdk`: 0.6.0. crates.io `qorechain-rdk`: 0.6.0. Maven Central `io.github.qorechain:qorechain-rdk`: 0.6.0(latest 및 release). Go 모듈 `github.com/qorechain/qorechain-rdk/packages/go`: `v0.6.0`은 모듈 프록시가 제공하며 이제 `@latest`도 이 버전으로 해석되지만, `@v0.6.0`을 명시적으로 고정하는 편이 여전히 가장 명확합니다.

#### RDK 0.6.0: 변경 사항과 제한 사항 {#rdk-050-limits}

이 섹션은 게시된 0.6.0 패키지가 하는 일을 패키지 내용과 GitHub 릴리스 노트를 기준으로 확인하여 기술하고, 여전히 할 수 없는 일을 설명합니다. 이 항목들 중 어느 것도 체인의 동작이 아닙니다. "라이브에서 검증되지 않음"이라고 적힌 곳은 어느 네트워크에도 롤업이 없으므로 코드와 오프라인에서만 확인된 경로입니다.

**0.6.0의 변경 사항**(별도 표기가 없으면 TypeScript):

* **서명.** `RdkClient.connectTx(signer, { pqcKeypair, rest })`는 키페어를 전달하면 하이브리드(secp256k1 + ML-DSA-87) 방식으로 서명하며, 전달하지 않으면 클래식 방식으로만 서명하고 네트워크가 트랜잭션을 거부합니다. `signer`는 `OfflineDirectSigner`여야 하며, 수수료는 명시적이어야 합니다(`fee` 또는 연결 시의 `gasPrice`). 새 헬퍼 `resolvePqcKeypair`와 `pqcKeypairFromEnv`는 니모닉에서 표준 ML-DSA-87 키와 레거시 ML-DSA-87 키를 모두 파생하고, 계정이 온체인에 등록해 둔 쪽을 사용합니다. 계정이 다른 키를 보유한 경우에는 추측하지 않고 거부합니다. `QORE_PQC_SEED_HEX`는 원시 개인 키로 서명하는 오퍼레이터를 위해 시드를 제공합니다. 이 키트는 이제 `@qorechain/sdk` `^0.9.0`에 의존하므로, 새로 설치하면 SDK 사본이 하나(0.9.0)만 들어갑니다. 0.5.0에서는 npm이 SDK 0.8.3을 키트 아래에 중첩해 설치했습니다.
* **앵커링된 배치.** `MsgSubmitBatch`는 `anchor_signature`와 `validator_set_hash`를 담습니다. `RdkTxClient.submitBatch`는 클라이언트가 하이브리드로 서명하고, REST 엔드포인트가 있으며, **롤업의 생성자**일 때에만 앵커에 직접 서명합니다(체인은 앵커를 생성자의 등록된 키와 대조해 검사합니다). 그 밖의 모든 경우에는 이전처럼 앵커 없이 제출합니다. 앵커 없이 제출하는 대신 거부하게 하려면 `anchor: "require"`를, 서명하지 않으려면 `anchor: "off"`를, 직접 얻은 서명을 보내려면 `anchorSignature`를 전달하세요. `anchorSignBytesForBatch`는 대역 외에서 서명하는 생성자를 위해 v2 바이트를 만들며, 시퀀서가 별도인 롤업에 필요합니다. 라이브에서 검증되지 않음.
* **정산 영수증.** PQC 계정 조회는 단수형 경로 `/qorechain/pqc/v1/account/{address}`를 사용합니다(0.5.0은 네트워크가 제공하지 않는 복수형 경로를 사용했습니다). 검증은 두 가지 앵커 서명 바이트 형식을 모두 지원하며, 둘 다 시도하지 않고 앵커의 높이로 하나를 고릅니다. v3.2.2 전환 이전은 v1, 그 이후는 v2입니다. 영수증 스키마 v2는 `chainId`를 기록하며, 검증은 다른 체인의 노드에 대해 확인된 영수증을 거부하고 `signBytesVersion`과 `chainBinding` 검사를 보고합니다. 버전 1 영수증도 여전히 검증됩니다. [정산 영수증](/rollups/settlement-receipts)을 참고하세요.
* **읽기.** `getLatestBatch`는 `/qorechain/rdk/v1/latest_batch/{rollup_id}`를 호출하며(0.5.0은 체인이 제공하지 않는 형태를 호출했습니다), `listBatches`는 모든 페이지를 따라갑니다(`listBatchesPage`는 한 페이지를 읽습니다). `RollupView`는 `escrowBalance`와, 노드가 보고하는 경우 `challengeWindowSec`, `challengeBond`, `proofSystem`을 담고, `BatchView`는 `submittedTime`을 담습니다.
* **챌린지 윈도우.** `batchChallengeWindow`는 배치의 윈도우를 체인과 같은 방식으로 계산하며, 로컬 시계가 아니라 체인 팁(`getChainTip`)을 기준으로 판단합니다. 기록된 제출 시각이 있는 배치는 블록 시간의 초 단위로 계산하며(v3.2.4 규칙: 테스트넷은 높이 8,337,253부터, 메인넷은 높이 3,742,566부터 적용 중), 그렇지 않은 경우에는 제출 높이부터 센 `window / 6` 블록으로 계산합니다(업그레이드 높이 이전에 제출된 배치에 대한 규칙). `qorollup status`의 배후에 있는 상태 점검과 워치타워가 이를 사용합니다([Watchtower](/rollups/watchtower) 참고).
* **크로스 VM.** `encodeCrossVmCalldata`는 이제 노드가 디코딩하는 레이아웃인 `executeCrossVMCall(uint8,string,bytes)`를 인코딩하며 `targetVm`을 받습니다. `isCrossVmPrecompileActive`는 활성 프리컴파일의 라이브 목록을 읽습니다([멀티 VM](/rollups/multi-vm) 참고).
* **수수료를 내기 전에 확인하는 규칙.** `rollupIdError`는 구성을 검증할 때와 `createRollup`이 브로드캐스트하기 전에 ID 문법을 검사하고, `withdrawalErrors`는 `executeWithdrawal`이 브로드캐스트하기 전에 출금을 검사합니다.
* **템플릿.** 스캐폴딩된 템플릿은 `pqcKeypairFromEnv`를 통해 연결하므로 `create` 및 `submit-batch` 스크립트가 하이브리드로 서명하며, `@qorechain/rdk` `^0.6.0`에 의존합니다. `multivm-rollup` 템플릿은 프리컴파일이 라이브인지 확인하고 대상으로부터 비어 있지 않은 응답을 요구합니다.
* **Python, Go, Rust, Java.** 위의 읽기 측 수정 사항(단수형 PQC 경로, `latest_batch`, 앵커 서명 바이트 v2, 챌린지 윈도우 규칙, ID 및 출금 검사)은 나머지 네 언어의 게시된 패키지에도 포함되어 있습니다.
* **호환성을 깨는 변경.** `encodeCrossVmCalldata`는 `targetVm`을 받으며, `CROSS_VM_DEFAULT_SIGNATURE`가 변경되었습니다. `RollupHealth`와 `BatchDeadline`은 이전의 초 단위 마감 시각 대신 `challengeWindow`를 담습니다.

**0.6.0에 남아 있는 제한 사항:**

* **하이브리드로 서명하는 것은 TypeScript 클라이언트뿐입니다.** `qorollup` CLI(`create`, `pause`, `resume`, `stop`, `withdraw` 명령은 포스트 퀀텀 키 없이 연결합니다)와 **Python, Go, Rust, Java** 클라이언트는 클래식 방식으로만 서명하며, 두 네트워크 모두 네이티브 레인에서 이를 거부합니다. 이들의 README도 여전히 그렇게 안내합니다. 이들의 메시지 빌더에는 `anchor_signature`나 `validator_set_hash` 필드가 없습니다. 이들로 트랜잭션을 보내려면 체인 CLI(`--generate-only` 후 `qorechaind tx pqc cosign`)로 빌드 및 서명하거나 `pqcKeypair`와 함께 TypeScript 클라이언트를 사용하세요.
* **롤업의 하이브리드 생성은 라이브에서 실행된 적이 없습니다.** 어느 네트워크에도 롤업이 없기 때문입니다. 앵커링된 배치, 출금, 영수증 전체 흐름도 마찬가지입니다.
* **앵커링에는 생성자가 필요합니다.** 배치는 생성자의 서명이 트랜잭션에 포함된 경우에만 같은 트랜잭션에서 앵커링됩니다. 시퀀서가 다른 주소라면, 생성자가 v2 바이트에 대역 외에서 서명하고 시퀀서가 그 결과를 전송해야 합니다.
* **`0x…0901`의 크로스 VM 프리컴파일에는 코드가 없으며** 어느 네트워크에서도 활성 프리컴파일 목록에 없으므로, 컨트랙트에서의 호출은 여전히 아무 일도 하지 않습니다([멀티 VM](/rollups/multi-vm) 참고).
* **챌린지 윈도우 길이.** 이 키트는 노드가 보고하는 경우에만 롤업 자체의 윈도우를 읽습니다(패키지 문서는 이를 v3.2.4 이상으로 설명하며, 두 네트워크 모두 지금 이를 실행합니다). 그렇지 않으면 모듈의 기본 윈도우를 사용하므로, 자체 윈도우를 구성한 롤업에는 `challengeWindowSecs`를 전달하세요. 이전 헬퍼 `challengeWindowDeadline`과 `isChallengeWindowClosed`는 여전히 내보내지며 여전히 초 단위를 받으므로, 블록 높이를 넘기지 마세요.
* **데이터 가용성.** `buildDaBlob`은 SHA-256으로 해시하지만, 체인의 블롭 커밋먼트는 SHAKE-256입니다([데이터 가용성](/rollups/data-availability) 참고).

**0.6.0 이전 버전.** 0.5.0 이하는 정산 영수증, 워치타워, 크로스 VM 콜데이터에 사용해서는 안 됩니다. 0.5.0은 네트워크가 제공하지 않는 경로에서 생성자의 키를 조회했고(그래서 모든 정상 영수증에서 영수증 검증이 실패 폐쇄로 처리되었습니다), v1 앵커 메시지만 재구성했으며, 블록 높이를 타임스탬프로 읽었고(모든 배치 경과 시간과 챌린지 마감 시각이 틀렸으며, 워치타워는 모든 배치에 대해 마감 알림을 즉시 발생시켰습니다), 체인이 제공하지 않는 latest-batch 경로를 호출했고, 처음 50개의 배치만 읽었으며, 프리컴파일이 디코딩하지 않는 함수를 인코딩했고, 클래식 방식으로만 서명하는 템플릿을 제공했습니다. 0.4.x의 트랜잭션 클라이언트에는 하이브리드 서명이 없었습니다.

#### Python, Go, Rust, Java 클라이언트

TypeScript 패키지와 함께, RDK는 TypeScript와 동일한 표면을 미러링하는 완전한 **Python**, **Go**, **Rust**, **Java** 클라이언트를 제공합니다. 유효성 검사를 포함한 구성 빌더, 다섯 개의 프리셋 프로필, denom/경제/bech32 유틸리티, 바이너리-머클 및 출금 증명 헬퍼, 롤업 매니페스트, REST 및 `qor_` JSON-RPC 읽기 클라이언트, 프리플라이트/헬스 체크, 계정(니모닉 → `qor` 주소), 그리고 클래식 트랜잭션 서명 + 브로드캐스트(`SIGN_MODE_DIRECT`, 하이브리드 서명 네트워크에서는 수락되지 않음 — [RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits) 참고)까지 포함합니다. 모두 공유된 크로스 언어 골든 벡터에 대해 검증되었으며 각 레지스트리에 **게시**되어 있습니다.

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go (pin the version)
go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.0

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.6.0
```

```python
import qorrdk
```

현재 게시된 버전은 모두 **0.6.0**입니다(2026년 10월 23일 확인): Python `qorechain-rdk`(PyPI, `qorrdk`로 임포트), Go 모듈 `github.com/qorechain/qorechain-rdk/packages/go`(`v0.6.0`), Rust `qorechain-rdk`(crates.io), Java `io.github.qorechain:qorechain-rdk`(Maven Central). 이 클라이언트들은 체인 상태를 읽습니다. 네트워크가 요구하는 하이브리드 서명은 여전히 생성하지 않으며, 이들의 메시지 빌더에는 앵커 필드가 없습니다([RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits) 참고).

:::note
TypeScript RDK와 그 템플릿은 기본적으로 **`qorechain-diana`** 테스트넷을 대상으로 하며, 프리셋은 별도 설정 없이 라이브 공개 엔드포인트에 도달합니다. 버전을 고정하고 메인넷 이전에 테스트넷에서 검증하세요.
:::

### `create-qorechain-rollup`으로 프로젝트 스캐폴딩하기 {#scaffold-a-project-with-create-qorechain-rollup}

각 프로필에는 이에 대응하는 스타터 템플릿(`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`)이 있습니다. 다음 두 형식 중 하나로 스캐폴딩하세요.

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

비대화형 / CI 환경에서는 템플릿과 네트워크를 명시적으로 지정하세요.

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

스캐폴더는 문서화된 스테이크 및 생성-소각 비용과 롤업을 생성하고 상태를 읽기 위한 다음 단계를 출력합니다.

:::caution 스캐폴딩된 스크립트가 할 수 있는 것
`create-qorechain-rollup` 0.6.0의 템플릿은 `@qorechain/rdk` `^0.6.0`에 의존합니다. 이들의 `create` 및 `submit-batch` 스크립트는 `src/signer.ts`의 `connectOperator()`를 통해 연결하며, 이 함수는 `QORE_MNEMONIC`(또는 `QORE_OPERATOR_PRIVATE_KEY_HEX`로 서명하는 경우 `QORE_PQC_SEED_HEX`)에서 포스트 퀀텀 키를 확인하고, 체인과 대조하여 검사한 뒤, 하이브리드로 서명합니다. 둘 다 설정되어 있지 않으면 스크립트가 경고를 출력하고 클래식 방식으로만 서명하며, 두 네트워크 모두 이를 거부합니다. 템플릿을 통해 라이브 네트워크에서 롤업이 생성된 적은 없으므로, 이 경로는 라이브에서 검증되지 않았습니다. 스타터의 `submit-batch` 스크립트는 참고용 흐름일 뿐이며, 예시용 루트와 샘플 증명을 게시하므로 라이브 네트워크에서 배치를 확정하는 것을 기대해서는 안 됩니다.
:::

### 코드로 롤업 구성 빌드하기

프리셋으로부터 구성을 빌드하고, 체인에서 라이브 스테이크와 소각률을 읽은 다음, 생성 메시지를 만듭니다. 구성 빌더는 `validate()` / `build()`에서 정산 → 증명 호환성 매트릭스를 강제합니다. 결과 값은 위의 CLI로 제출하거나, `pqcKeypair`를 지정한 TypeScript 클라이언트로 제출하세요 — [RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits)을 참고하세요.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2).
// `params()` is a REST read of /qorechain/rdk/v1/params, served on both networks.
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

타입이 지정된 REST 클라이언트는 서명자가 필요 없으며 두 네트워크 모두에서 읽을 수 있습니다.

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);
```

배치는 `rdk.rest.getBatch(rollupId, index)` 또는 `qorechaind query rdk batch [rollup-id]`(아래)를 사용하세요. `getLatestBatch`와 `listBatches`는 0.6.0부터 체인의 `latest_batch` 경로와 배치 목록의 모든 페이지를 읽습니다([RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits) 참고).

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

롤업을 영구적으로 폐기하고 스테이크를 해제합니다. 스테이크된 QOR — 일회성 생성 소각분과, 출금이나 부정 증명 보상으로 이미 롤업의 에스크로에서 지급된 금액을 제외한 — 은 생성자에게 반환됩니다. v3.2.3부터 롤업별 에스크로 원장이 각 롤업이 아직 보유한 금액을 기록하고, `stop-rollup`은 정확히 그 잔액을 환불하며, 중단된 롤업은 더 이상 출금을 지급하지 않습니다. 1,000 QOR의 레이어 등록 스테이크는 롤업의 레이어가 폐기될 때 별도로 반환됩니다.

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

### 배치 제출 {#submit-a-batch}

롤업에 대한 정산 배치를 제출합니다. 롤업 ID, 배치 인덱스, 16진수로 인코딩된 상태 루트를 인자로 받습니다. 첫 번째 이후의 모든 배치에는 이전 배치의 상태 루트를 `--prev-state-root`로 전달하세요.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --prev-state-root <previous-state-root-hex> --tx-count 120 \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > batch.json
qorechaind tx pqc cosign batch.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

| 플래그 | 설명 |
| ---- | ----------- |
| `--prev-state-root` | 배치가 시작되는 16진수 상태 루트 (인덱스 `0` 이후의 모든 배치에 필요) |
| `--tx-count` | 배치에 포함된 롤업 트랜잭션 수 |
| `--data-hash` | DA 블롭으로 게시된 배치 데이터의 16진수 해시 (현재는 비워 두세요. 블롭을 게시할 방법이 없습니다. [데이터 가용성](/rollups/data-availability) 참고) |
| `--withdrawals-root` | 배치의 L2 → L1 출금에 대한 16진수 머클 루트 ([ZK / STARK & 출금](/rollups/zk-stark-withdrawals) 참고) |
| `--anchor-signature` | v2 앵커 서명 바이트에 대한 롤업 **생성자**의 16진수 ML-DSA-87 서명 (v3.2.2부터). 이후 배치는 같은 트랜잭션에서 `x/multilayer`에 앵커링되며, 앵커가 거부되면 배치도 거부됩니다 |
| `--validator-set-hash` | 앵커에 담기며 서명에 포함되는 16진수 검증인 세트 커밋먼트 |

`--anchor-signature` 없이는 배치가 **앵커링되지 않은 상태**로 정산됩니다. 배치를 앵커링하려면 서명할 바이트를 출력하고, 생성자의 등록된 포스트 퀀텀 키로 서명한 다음, 그 서명을 전달하세요(`--tx-count`와 `--validator-set-hash` 값은 제출하는 값과 일치해야 합니다).

```bash
qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex] \
  --chain-id qorechain-diana --tx-count 120
```

`layer-id`는 롤업의 레이어 ID입니다(RDK로 생성된 롤업의 경우 롤업 ID). TypeScript에서는 `@qorechain/rdk` 0.6.0의 `RdkTxClient.submitBatch`가 클라이언트가 하이브리드로 서명하고 롤업의 생성자일 때 앵커에 대신 서명하며, `anchorSignBytesForBatch`는 생성자에게 대역 외에서 서명할 바이트를 제공합니다([RDK 0.6.0: 변경 사항과 제한 사항](#rdk-050-limits) 참고). `zk` 롤업의 ZK `--proof`에는 현재 CLI 플래그가 없으며, resolve-challenge 메시지는 CLI 명령이 아닙니다. 클라이언트를 사용하세요. 앵커가 증명하는 것과 증명하지 않는 것은 [정산 영수증](/rollups/settlement-receipts)을 참고하세요. 어느 네트워크에도 아직 롤업, 레이어, 앵커가 존재하지 않습니다.

### 배치에 이의 제기 (옵티미스틱 롤업) {#challenge-a-batch-optimistic-rollups}

어떤 계정이든 챌린지 윈도우 안에서(메인넷에서 높이 3,742,566 이전에 제출된 배치는 기본 100,800 블록이며, v3.2.4부터 새 배치에 대해서는 블록 시간의 초 단위 윈도우: 테스트넷은 높이 8,337,253부터, 메인넷은 높이 3,742,566부터 적용 중) `submitted` 상태의 배치에 대해 본드(롤업의 `challenge_bond`이며, `nft` 및 `custom` 프리셋은 1,000 QOR)와 부정 증명을 게시하여 이의를 제기할 수 있습니다. 롤업 ID와 배치 인덱스를 인자로 받으며, `--proof`로 부정 증명(fraud proof)을 전달합니다.

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
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42

# A page of batches in index order (--limit up to 100, default 50)
qorechaind query rdk batches [rollup-id] --start 0 --limit 50
```

---

## 조회

| 명령 | 목적 |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | 특정 롤업의 세부 정보 |
| `qorechaind query rdk list-rollups` | 등록된 모든 롤업 |
| `qorechaind query rdk batch [rollup-id]` | 최신 정산 배치 (또는 `--index`) |
| `qorechaind query rdk batches [rollup-id]` | 인덱스 순서의 배치 한 페이지 (`--start`, `--limit`) |
| `qorechaind query rdk anchor-sign-bytes [layer-id] [batch-index] [state-root-hex]` | 배치의 v2 앵커 서명 바이트 (오프라인) |
| `qorechaind query rdk config` | RDK 모듈 파라미터 |
| `qorechaind query rdk suggest-profile [use-case]` | `qor_suggestRollupProfile` RPC를 가리키는 안내를 출력합니다. 공개 엔드포인트는 이를 제공하지 않으므로 [프리셋 프로필](/rollups/preset-profiles) 표에서 프로필을 선택하세요 |

---

## 다음 단계

* **[데이터 가용성](/rollups/data-availability)** — 네이티브, Celestia, 중복 DA 백엔드.
* **[ZK / STARK & 출금](/rollups/zk-stark-withdrawals)** — 증명 검증과 `execute-withdrawal`을 통한 L2 → L1 출금 흐름.
