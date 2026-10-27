---
slug: /light-node/registration-and-licensing
title: 등록 및 라이선스
sidebar_label: 등록 및 라이선스
sidebar_position: 4
---

# 등록 및 라이선스

[3% 라이트 노드 보상 지분](/light-node/rewards-and-monitoring)을 받으려면 라이트 노드가 **온체인에 등록**되어 있어야 하고, 계속해서 살아있음을 증명해야 합니다. 이 페이지에서는 체인이 요구하는 사항, 라이선스를 받는 방법, 노드가 스스로 등록하는 방법, 그리고 노드가 활성 상태를 증명하는 방법을 다룹니다.

:::note 등록이 열려 있습니다
메인넷(`qorechain-vladi`)과 테스트넷(`qorechain-diana`)에서 등록이 열려 있습니다. 노드를 실행하고 동기화하는 데에는 라이선스가 필요하지 않습니다. 현재 상태를 확인하는 방법은 [보상 프로그램 상태](/light-node/overview#reward-program-status)를 참고하세요.
:::

## 온체인 등록

등록은 라이트 노드를 체인에 기록하여 프로토콜이 해당 노드의 존재, 타입(`sx` 또는 `ux`), 그리고 어떤 운영자 계정이 이 노드를 제어하는지 알 수 있게 합니다. 등록이 완료되고 노드가 활성 상태가 되면 라이트 노드 보상 지분을 받을 자격이 생깁니다.

### 요건 {#requirements}

등록 트랜잭션이 실행될 때 체인은 다음을 모두 확인합니다.

1. 운영자 주소에 활성 `lightnode_operator` 라이선스가 있어야 합니다.
2. 같은 주소에서 **본딩된** 검증인들에게 최소 **1,000 QOR가 위임**되어 있어야 합니다(모든 검증인에 대한 총합이며, 감금(jailed)되었거나 언본딩된 검증인에 대한 위임은 포함되지 않습니다).
3. **1 QOR** 등록 수수료와 트랜잭션 수수료를 지불할 수 있는 잔액이 운영자 계정에 있어야 합니다. 노드는 이 계정에서 하트비트마다 수수료도 지불합니다. 네이티브 서명의 경우 수수료는 가스 단위당 0.25 uqor이므로, 기본 `[heartbeat] gas` 300,000에서는 75,000 uqor(0.075 QOR)이며, 하루 약 25회 하트비트 기준으로 한 달에 약 1.9 QOR입니다.
4. 네트워크 전체에 등록된 라이트 노드가 10,000개 미만이어야 합니다.

등록 후 노드는 **1,000블록**마다(유예 100블록) 하트비트를 보내야 하며, 보상을 받으려면 최소 **80% 가동 시간**을 유지해야 합니다. 실시간 값은 `GET https://api.qore.host/qorechain/lightnode/v1/params`(테스트넷: `https://api-testnet.qore.host`)로 확인하세요.

### 운영자 계정 {#operator-account}

등록은 **운영자 주소**에서 이루어집니다. 운영자 주소는 라이선스와 스테이크를 보유하고, 수수료를 지불하며, 보상을 받는 일반 `qor1…` 계정입니다. 노드가 이 계정을 대신해 서명할 수 있어야 하므로, **복구 단어를 본인이 보유한** 계정이어야 합니다. 직접 적어 둔 단어, Keplr의 계정, 또는 `qorechaind` 키(파생 경로 `m/44'/118'/0'/0/0`)가 해당됩니다. 노드 전용으로만 사용하는 계정이 가장 좋은 선택입니다.

Dashboard의 수탁형 지갑(Dashboard가 대신 시드를 보관하는 지갑)은 먼저 시드를 내보내지 않는 한 노드를 실행할 수 없습니다.

노드의 Dilithium-5 키에는 자체 주소가 없습니다. QoreChain에서 포스트 양자(post-quantum) 키는 계정에 연결될 뿐, 계정을 만들지 않습니다. 노드는 계정에 이미 포스트 양자 키가 있는 경우가 아니라면([이미 포스트 양자 키가 있는 계정](#accounts-with-a-pqc-key) 참고), 자신의 키를 운영자 계정의 포스트 양자 키로 연결합니다.

## 라이선스 받기

### 메인넷: Dashboard에서 구매

라이선스는 QoreChain Dashboard의 **Nodes & Validators → Light Node**에서 구매합니다(사이드바 항목은 예전에 **Tools**라고 불렸으며, 페이지는 여전히 `/tools`에 있습니다). 이 페이지는 로그인이 필요하며, 탭은 헤더에서 선택한 네트워크를 따릅니다. 라이선스 가격은 **$50**이며, ERC-20, BEP-20 또는 TRC-20의 USDT로 지불합니다. 결제는 해당 체인에서 검증됩니다. 결제하기 **전에** 라이선스를 받을 `qor1…` 주소를 입력해야 하며, 위에서 설명한 운영자 주소를 사용하세요.

부여(grant)는 별도의 온체인 단계로, 수동으로 서명되어 일괄 전송됩니다. 체인이 이를 확인할 때까지 탭에는 **Paid, awaiting on-chain grant**가 표시되며, 노드는 해당 주소에 라이선스가 없다고 계속 보고합니다. `lightnode-sx status`는 `Licence:` 줄을 보여주며, 부여가 완료되면 `active`로 바뀝니다. 직접 확인할 수도 있습니다.

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### 테스트넷: 무료, 셀프 서비스

테스트넷에서는 아무것도 판매하지 않습니다. 테스트넷 라이선스는 무료입니다.

1. Dashboard를 열어 **Nodes & Validators → Light Node**로 이동한 다음, 헤더에서 테스트넷을 선택합니다.
2. **Free testnet licence** 아래에 노드가 서명에 사용할 `qor1…` 주소(복구 단어를 본인이 보유한 주소이며, Dashboard가 만들어 준 지갑이 아닙니다)를 입력하고 **Request licence**를 선택합니다.
3. 부여가 서명되는 동안 탭에는 "Requested for …"가 표시되고, 이후 "Granted to … You can register your node now."가 표시됩니다. 테스트넷의 부여는 자동으로 서명되며, 보통 몇 분 안에 완료됩니다. 부여를 서명하지 못한 경우 탭이 그렇게 알려 주며 다시 요청할 수 있습니다.

요청은 계정당 한 번, 주소당 한 번입니다. 메인넷의 부여는 계속 수동입니다(위 참고). 체인상의 결과는 동일합니다. `GET https://api-testnet.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator`로 확인하세요.

## 노드 등록하기

아래 단계는 노드 자체의 설정 흐름입니다. 두 에디션 모두 동일합니다. `lightnode-ux`는 `lightnode-sx`와 같은 명령을 가지고 있으며 같은 홈 디렉터리(`~/.qorechain-lightnode`)를 사용합니다. 각 명령에 대한 자세한 내용은 [SX 에디션](/light-node/sx-edition#first-run-onboard)을 참고하세요.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

암호문은 노드 키링에 있는 두 키, 즉 노드의 포스트 양자 키와 운영자 계정 키를 모두 보호합니다.

### `register`가 하는 일

`register`는 키링에서 `operator_address`와 키를 읽은 다음 다음을 수행합니다.

1. **라이선스를 확인합니다.** `operator_address`가 활성 `lightnode_operator` 라이선스를 보유하고 있는지 체인에 묻습니다. 라이선스가 없으면 중단하고 어디서 받을 수 있는지 알려줍니다. 이 메시지는 Dashboard의 Light Node 탭을 안내하며, 사이드바의 예전 이름인 **Tools → Light Node**를 사용합니다. 메인넷에서는 그곳에서 라이선스를 구매하라고 안내하고, 테스트넷에서는 테스트넷을 선택한 상태로 그곳에서 요청하라고 안내합니다(위에서 설명한 셀프 서비스 **Request licence**). 이 탭은 현재 **Nodes & Validators** 아래에 있습니다. 3.1.9는 여전히 Dashboard의 예전 탭을 언급했습니다. 만료되었거나 정지된 라이선스는 그렇게 보고됩니다. 이미 등록된 노드도 그렇게 보고되며, 아무것도 전송되지 않습니다.
2. 계정에 이미 포스트 양자 키가 있는 경우가 아니라면 **포스트 양자 키를 연결합니다**. 포스트 양자 키가 없는 계정은 이 메시지 하나만을 고전적 서명(하이브리드 확장 없이)으로 보낼 수 있습니다. 노드는 그 방식으로 이 메시지를 보내며, 체인이 지원하는 경우 키 소유 증명을 포함합니다.
3. `--delegate-to qorvaloper1...`로 검증인을 지정한 경우에만 **부족한 스테이크를 위임합니다**. `--delegate-to` 없이 계정이 최소 기준에 못 미치면, 중단하고 얼마가 부족한지 알려줍니다. 3.1.10부터는 체인과 마찬가지로 **본딩된** 검증인에게 위임된 스테이크만 계산합니다. 3.1.9는 감금(jailed)되었거나 언본딩된 검증인도 계산했기 때문에 체인에서 거부될 수 있었으므로, 3.1.9를 실행한다면 활성 검증인에게 위임하세요.
4. 1 QOR 수수료와 함께 **노드를 등록합니다**.

각 단계는 노드가 직접 서명하며, 다음 단계가 전송되기 전에 블록에서 확인됩니다. 키 등록 이후의 모든 트랜잭션은 체인이 요구하는 하이브리드 ML-DSA-87 + secp256k1 서명을 담고 있습니다.

이 명령은 다음 플래그를 받습니다.

- `--delegate-to` — 부족한 스테이크를 위임할 `qorvaloper1…` 검증인.
- `--type` — 노드 타입, `sx` 또는 `ux` (기본값은 바이너리의 에디션).
- `--version` — 등록할 노드 버전 (기본값은 바이너리 자체의 버전).
- `--print` — 서명하는 대신 동등한 `qorechaind` 명령을 출력합니다(아래 참고).

`register`가 계정을 대신해 서명하려면 계정이 이미 체인에 존재해야 합니다(자금을 받은 적이 있어야 합니다).

### 이미 포스트 양자 키가 있는 계정 {#accounts-with-a-pqc-key}

지갑에서 설정한 계정은 같은 복구 단어에서 파생된 포스트 양자 키를 이미 가지고 있는 경우가 많습니다. 체인의 v3.2.3 규칙에 따라 체인은 계정에 등록된 키만 받아들이며, `classical_only` 타입의 키나 빈 키는 거부합니다.

3.1.9부터 `keys add-operator --recover`가 이를 처리합니다. 계정에 이미 포스트 양자 키가 있으면, wallet-adapter 및 Dashboard와 같은 파생 방식(`qorechaind tx pqc recover-key`와 동일)을 사용해 단어로부터 그 키를 다시 만들고, 노드는 그 키로 서명합니다. 계정에 키가 없으면 노드가 단어로부터 키를 파생하므로, 단어로 노드의 키도 복원할 수 있습니다. 계정에 단어로 재현할 수 없는 포스트 양자 키가 있는 경우(자체 키를 생성하고 보관하는 지갑), 명령은 거부하고 전용 운영자 계정을 사용하라고 안내합니다.

### 대체 경로: `qorechaind` 키링의 운영자 키

운영자 계정 키를 `qorechaind` 키링에 보관하고 노드에 저장하고 싶지 않다면, 3단계를 건너뛰고 다음을 실행하세요.

```bash
lightnode-sx register --print
```

이 명령은 동일한 라이선스 및 등록 확인을 실행하고, 각 단계에 대한 `qorechaind` 명령을 사용자의 값으로 채워 출력합니다. 노드 키를 `qorechaind`의 키 디렉터리로 내보내기(`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, 스테이크가 부족할 때의 `tx staking delegate`, 그리고 생성 후 `tx pqc cosign`하는 한 쌍으로 이루어진 `tx lightnode register`입니다. 이 경로에서는 데몬도 하트비트에 `qorechaind`를 사용합니다. [`[heartbeat]` 설정](/light-node/sx-edition#configure)을 참고하세요.

## 하트비트 활성 증명

등록만으로는 자격을 유지하기에 충분하지 않습니다. 등록된 라이트 노드는 **하트비트 활성 증명** (heartbeat liveness proofs)을 지속적으로 제출하여 온라인 상태임을 증명해야 합니다. 이 하트비트는 체인이 활성 노드(보상 지분을 받을 자격이 있는 노드)와 등록만 되어 있고 오프라인인 노드를 구별하는 방법입니다.

실제로 이는 등록된 상태로 계속 실행되고(동기화된) 노드는 자격을 유지하는 반면, 오프라인 상태가 된 노드는 활성 증명 제출을 멈추고 돌아올 때까지 자격을 잃는다는 의미입니다. 따라서 데몬을 계속 실행하고 건강한 상태로 유지하는 것이 보상을 받는 데 있어 중요한 부분입니다 — 하트비트와 동기화 상태를 확인하는 방법은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

### PQC 공동서명 하트비트 파이프라인 {#pqc-cosigned-heartbeat-pipeline}

QoreChain은 **기본적으로 PQC가 필수**이므로, 모든 하트비트는 **하이브리드 서명**을 담고 있습니다. 계정의 포스트 양자 키로 만든 ML-DSA-87(Dilithium-5) 서명과 운영자 계정 키로 만든 secp256k1 서명입니다. 노드는 Linux, macOS, Windows에서 트랜잭션을 직접 만들고 서명하며, `qorechaind`는 필요하지 않습니다. 어떤 sign-bytes 버전을 사용할지는 네트워크에서 읽어 옵니다.

온체인 하트비트는 기본적으로 켜져 있습니다. 데몬은 체인에 기록된 해당 노드의 `last_heartbeat` 이후 1,000블록(`[heartbeat] interval_blocks`, 체인의 `heartbeat_interval`과 일치)이 지나면 하트비트를 하나 보내며, 60초마다 확인합니다. 따라서 재시작해도 중복 전송을 하거나 한 구간 전체를 기다리지 않습니다. 각 하트비트는 블록에 포함된 후에만 보고됩니다.

데몬은 시작할 때 서명자를 선택합니다.

- **네이티브** — 키링에 운영자 키(`keys add-operator`로 추가)가 있고 그것이 `operator_address`와 일치하는 경우입니다. 이것이 일반적인 경우입니다.
- **`qorechaind` 대체 경로** — 그 외의 경우, `qorechaind` 바이너리가 `PATH`에 있거나 `[heartbeat] qorechaind_path`에 지정되어 있으면 사용합니다. `qorechaind` 키링의 운영자 키(`[heartbeat] key_name`, 홈 `qorechaind_home`, 기본값 `~/.qorechaind`)와 `pqc/<key_name>.dilithium` 아래에 내보낸 노드 키를 사용합니다. `qorechaind` 키링 암호문은 `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`에 넣습니다. 이 값은 stdin을 통해 `qorechaind`로 전달되며, 명령줄에는 절대 놓이지 않습니다.

노드가 등록되기 전에는 하트비트를 보내지 않으며, 대신 상태가 바뀔 때마다 한 번씩 그 이유를 로그로 남깁니다. 라이선스 없음, 또는 라이선스는 활성이지만 등록되지 않음(`register` 실행) 중 하나입니다. `lightnode-sx status`는 `Signer:`, `Licence:`, `Registration:` 줄을 보여주므로 로그를 읽지 않고도 이유를 알 수 있습니다. 서명자가 없으면 노드는 계속 실행되고 동기화되지만, 체인에서 활성 상태를 유지할 수 없으며 `status`가 이를 알려줍니다.

## Dashboard의 Light Node 탭

QoreChain Dashboard의 **Nodes & Validators → Light Node** 탭은 이 단계들을 한곳에 모아 줍니다.

1. **다운로드.** 선택한 네트워크의 라이트 노드 바이너리(sha256 체크섬이 포함된 `https://download.qore.host/<net>/lightnode/latest.json`과 동일한 파일)를 링크합니다.
2. **설정 단계.** 릴리스 매니페스트의 버전에 맞춘 위의 다섯 단계와, 매니페스트의 `registration` 필드에서 읽은 등록 개방 여부를 보여줍니다.
3. **라이선스** (메인넷 구매, 테스트넷 무료 요청). 메인넷에서는 결제 전에 라이선스 주소를 받고, 체인이 부여를 확인할 때까지 **Paid, awaiting on-chain grant**를 표시합니다. 테스트넷에서는 **Request licence** 양식을 보여줍니다. 입력한 주소가 본인의 Dashboard 수탁형 지갑이면 경고하며, 주소에 이미 포스트 양자 키가 있으면 참고용으로 알려줍니다.
4. **상태.** 상태 패널이 체인에서 읽은 노드의 상태를 보여줍니다.

등록 자체는 항상 `lightnode-sx register`(또는 `lightnode-ux register`)가 보내는 트랜잭션입니다. Dashboard는 노드를 등록하지 않으며, 기록만 저장하던 예전 등록 양식은 제거되었습니다.

## 다음으로 볼 내용

- [보상 및 모니터링](/light-node/rewards-and-monitoring) — 3% 지분이 어떻게 적립되고, 청구되고, 모니터링되는지.
- [SX 에디션](/light-node/sx-edition) — `register` 명령과 전체 CLI 참조.
