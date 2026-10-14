---
slug: /light-node/registration-and-licensing
title: 등록 및 라이선스
sidebar_label: 등록 및 라이선스
sidebar_position: 4
---

# 등록 및 라이선스

[3% 라이트 노드 보상 지분](/light-node/rewards-and-monitoring)을 받으려면 라이트 노드가 **온체인에 등록**되어 있어야 하고, 계속해서 살아있음을 증명해야 합니다. 이 페이지에서는 등록이 어떻게 이루어지는지, 노드가 어떻게 활성 상태를 증명하는지, 그리고 Dashboard를 통해 노드에 라이선스를 받고 온체인에 등록하는 방법을 다룹니다.

:::note 보상 프로그램 등록은 아직 열려 있지 않습니다
어느 네트워크에서도 `lightnode_operator` 라이선스가 부여된 적이 없고 등록된 노드도 없으므로, 오늘 현재 체인은 모든 등록을 거부합니다. 노드를 실행하고 동기화하는 데에는 라이선스가 필요하지 않습니다. 현재 상태를 확인하는 방법은 [보상 프로그램 상태](/light-node/overview#reward-program-status)를 참고하세요.
:::

## 온체인 등록

등록은 라이트 노드를 체인에 기록하여 프로토콜이 해당 노드의 존재, 타입(`sx` 또는 `ux`), 그리고 어떤 운영자 키가 이 노드를 제어하는지 알 수 있게 합니다. 등록이 완료되고 노드가 활성 상태가 되면 라이트 노드 보상 지분을 받을 자격이 생깁니다.

### 요건 {#requirements}

등록 트랜잭션이 실행될 때 체인은 다음을 모두 확인합니다.

1. 운영자 주소에 활성 `lightnode_operator` 라이선스가 있어야 합니다.
2. 같은 주소에서 검증인들에게 최소 **1,000 QOR가 본딩**되어 있어야 합니다(모든 검증인에 대한 총합). 등록하기 **전에** 위임하세요. Dashboard의 스테이킹 페이지에서, 또는 `qorechaind tx staking delegate`로 할 수 있습니다(모든 트랜잭션과 마찬가지로 양자 내성 공동서명이 필요합니다).
3. **1 QOR** 등록 수수료와 트랜잭션 수수료를 지불할 수 있는 잔액이 운영자 계정에 있어야 합니다. 데몬은 이 계정에서 하트비트마다 수수료를 지불합니다(기본값은 하트비트당 `50000uqor`, `[heartbeat] fees`).
4. 네트워크 전체에 등록된 라이트 노드가 10,000개 미만이어야 합니다.

### 등록 명령어 생성하기

등록은 **운영자 주소**에서 이루어집니다. 운영자 주소는 `qorechaind`(또는 아무 Cosmos 지갑)로 만든, 자금이 있는 `qor1…` 계정이며 보상도 이 주소로 받습니다. 노드 자체의 Dilithium-5 키에는 주소가 없으며, 이 키가 계정의 양자 내성 키가 됩니다. 이 주소를 `config.toml`에 `operator_address`로 넣고, [첫 실행](/light-node/sx-edition#first-run-onboard)에 설명된 대로 `key_name`과 `chain_id`가 설정되어 있는지 확인하세요(`onboard`는 이를 올바르게 설정해 주지 않습니다). 그런 다음 실행하세요.

```bash
lightnode-sx register
```

아무것도 출력하기 전에, 이 명령은 `operator_address`가 활성 `lightnode_operator` 라이선스를 보유하고 있는지 체인에 먼저 확인합니다. 체인은 라이선스 없는 등록을 거부하므로, 거부될 명령어를 건네주는 것은 의미가 없기 때문입니다. 라이선스가 없으면 다음 메시지와 함께 중단됩니다.

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Dashboard에서 구매한 라이선스는 별도의 단계에서 온체인으로 부여되므로, 구매 후 한동안은 `register`가 여전히 "no licence"라고 말할 수 있습니다. `lightnode-sx status`는 동일한 `Licence:` 줄을 보여주며, 부여가 완료되면 `active`로 바뀝니다. 이미 등록된 노드는 두 번 등록되지 않고 그렇게 보고됩니다.

활성 라이선스가 있으면 이 명령은 키링에서 노드 키를 읽어 와 사용자의 값으로 채워진 다음 내용을 출력합니다.

1. **한 번만**, 노드 키를 운영자 계정의 양자 내성 키로 연결하는 명령(`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`). 먼저 `lightnode-sx keys export`로 키를 `qorechaind`의 키 디렉터리로 내보낸 뒤 실행합니다. 계정에 이미 양자 내성 키가 있다면(`GET /qorechain/pqc/v1/account/<address>`가 `found: true`를 반환) 건너뛰세요. 출력된 가스 한도가 부족하면 `--gas 600000 --fees 60000uqor`로 다시 실행하세요.
2. 등록 자체: `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, 그다음 `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. 체인은 모든 트랜잭션에 양자 내성 공동서명을 요구하므로, 등록은 생성 후 공동서명하는 한 쌍의 과정입니다.

이 명령에는 두 개의 선택적 플래그가 있습니다.

- `--type` — 노드 타입, `sx` 또는 `ux` (기본값은 `sx`).
- `--version` — 등록할 노드 버전 (기본값은 바이너리 자체의 버전).

가입하려는 네트워크(테스트넷 `qorechain-diana` 또는 메인넷 `qorechain-vladi`)에서 제출하세요. 등록하려면 운영자 주소에 부여된 활성 `lightnode_operator` 라이선스가 필요하며, 그렇지 않으면 체인이 거부합니다.

:::note
`lightnode-sx register`는 등록 명령어를 검토하고 실행할 수 있도록 **출력만** 합니다 — 스스로 브로드캐스트하지 않습니다. 이를 통해 노드가 언제, 어떻게 등록되는지를 사용자가 직접 통제할 수 있습니다.
:::

## 하트비트 활성 증명

등록만으로는 자격을 유지하기에 충분하지 않습니다. 등록된 라이트 노드는 **하트비트 활성 증명(heartbeat liveness proofs)**을 지속적으로 제출하여 온라인 상태임을 증명해야 합니다. 이 하트비트는 체인이 활성 노드(보상 지분을 받을 자격이 있는 노드)와 등록만 되어 있고 오프라인인 노드를 구별하는 방법입니다.

실제로 이는 등록된 상태로 계속 실행되고(동기화된) 노드는 자격을 유지하는 반면, 오프라인 상태가 된 노드는 활성 증명 제출을 멈추고 돌아올 때까지 자격을 잃는다는 의미입니다. 따라서 데몬을 계속 실행하고 건강한 상태로 유지하는 것이 보상을 받는 데 있어 중요한 부분입니다 — 하트비트와 동기화 상태를 확인하는 방법은 [보상 및 모니터링](/light-node/rewards-and-monitoring)을 참고하세요.

### PQC 공동서명 하트비트 파이프라인 {#pqc-cosigned-heartbeat-pipeline}

QoreChain은 기본적으로 **PQC가 필수**이므로, 하트비트 활성 트랜잭션은 고전적 서명 방식만이 아니라 양자 내성(post-quantum) 공동서명 파이프라인을 통해 생성됩니다. 데몬은 서명되지 않은 하트비트를 만든 다음, 브로드캐스트 전에 **하이브리드 Dilithium-5(ML-DSA-87)** 서명으로 공동서명합니다 — 이는 체인이 모든 트랜잭션에 대해 강제하는 것과 동일한 양자 내성 방식입니다. 노드는 `interval_blocks` 창마다 하나의 하트비트를 제출하며(체인의 `heartbeat_interval` 매개변수와 일치), 블록 높이에 맞춰 속도를 조절하여 너무 이른 제출로 인한 거부를 피합니다.

온체인 하트비트는 기본적으로 켜져 있습니다. 데몬에는 다음이 필요합니다. 설정의 `operator_address`, **v3.2.0 이상**의 `qorechaind` 바이너리(`PATH`에 있거나 `[heartbeat] qorechaind_path`에 지정. 태그 `v3.1.4`로 빌드된 SX Docker 이미지에 하나 포함되어 있으며, 그보다 오래된 서명자는 체인이 거부합니다), 그리고 운영자 키와 내보낸 노드 키를 담고 있는 `qorechaind` 홈(`qorechaind_home`, 기본값 `~/.qorechaind`). 키링 암호문 두 개를 환경 변수에 넣어야 합니다. 노드 키링용 `QORE_LIGHTNODE_KEYRING_PASSPHRASE`와 `qorechaind` 키링용 `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`입니다(두 번째 것은 stdin을 통해 `qorechaind`로 전달되며, 명령줄에는 절대 놓이지 않습니다). `qorechaind`는 **Linux amd64용으로만** 배포되므로(`https://download.qore.host/mainnet/latest.json`의 `binary` 항목 참고), macOS, Windows 또는 ARM 호스트에서는 노드가 실행되고 동기화되지만 하트비트를 네이티브로 서명할 수 없습니다. 등록된 노드는 Linux amd64에서 SX 에디션을 실행하거나 amd64 호스트에서 Docker 이미지를 실행해야 합니다. 노드는 체인에 기록된 해당 노드의 `last_heartbeat`를 기준으로 속도를 조절하므로, 재시작해도 중복 전송을 하거나 한 구간 전체를 기다리지 않습니다. 노드가 등록되기 전에는 하트비트를 보내지 않으며, 대신 상태가 바뀔 때마다 한 번씩 그 이유를 로그로 남깁니다. 라이선스 없음(구매할 수 있는 위치와 함께), 또는 라이선스는 활성이지만 등록되지 않음(`lightnode-sx register` 실행) 중 하나입니다. `lightnode-sx status`는 `Signer:`, `Licence:`, `Registration:` 줄을 보여주므로 로그를 읽지 않고도 이유를 알 수 있습니다. 서명자가 없으면 노드는 계속 실행되고 동기화되지만, 체인에서 활성 상태를 유지할 수 없으며 `status`가 이를 알려줍니다.

## Dashboard를 통한 등록 및 라이선스 관리

QoreChain Dashboard의 **Tools → Light Node** 탭에서 라이선스 상태를 확인하고 노드 정보를 관리할 수 있습니다. 노드를 실행하는 것과 보상 프로그램에 가입하는 것은 서로 다른 두 가지 일이며, Dashboard는 이 둘을 분리해서 보여줍니다.

1. **소프트웨어 받기 (라이선스 불필요).** 이 탭은 선택한 네트워크의 라이트 노드 바이너리(sha256 체크섬이 포함된 `https://download.qore.host/<net>/lightnode/latest.json`과 동일한 파일)를 링크하고, 전체 QoreChain 노드를 위한 구동 팩을 보여줍니다. 라이트 노드에는 `lightnode-sx` 또는 `lightnode-ux` 바이너리와 RPC 엔드포인트만 있으면 됩니다. [SX 에디션](/light-node/sx-edition)을 따르세요.
2. **보상 프로그램 상태 확인하기.** 라이트 노드 보상 지분에 가입하는 것은 별도의, 온체인으로 게이팅된 단계입니다. 온체인에서 부여된 활성 `lightnode_operator` 라이선스, 최소 1,000 QOR 본딩(모든 검증인에 대한 총합이며 스테이킹에서 실시간으로 읽어옴), 그리고 1 QOR 등록 수수료가 필요합니다. **가입은 아직 열려 있지 않으며**([보상 프로그램 상태](/light-node/overview#reward-program-status) 참고), 라이선스를 구매해도 조기에 열리지 않습니다. 가동 시간은 노드가 온체인에 등록되는 블록부터 계산되며, 그 이전은 포함되지 않습니다.
3. **라이선스.** **Buy License**를 통해 구매한 라이선스는 먼저 저희 쪽에서 기록되며, 이를 온체인에서 인식되도록 만드는 부여(grant)는 별도의 단계입니다. 체인은 그 부여가 완료되기 전까지 등록을 거부합니다. 구매에는 라이선스를 부여받을 `qor1…` 주소가 필요하며, 체인이 확인할 때까지 **Paid — awaiting on-chain grant**로 표시됩니다. `lightnode-sx status`는 온체인 `Licence:` 줄을 보여줍니다.
4. **등록 기록.** 계정에 활성으로 기록된 라이선스가 있으면, 이 탭에는 짧은 양식(운영자 주소, 모니커, 공개 엔드포인트 URL, 스테이크 약정에 대한 동의)과 제출한 내용의 요약도 표시됩니다. 이는 Dashboard에 요청을 기록할 뿐이며, 온체인 등록 트랜잭션을 전송하지는 **않습니다**.
5. **온체인 등록.** 라이선스가 부여되고 운영자 주소에서 1,000 QOR가 본딩되면, `lightnode-sx register`와 이 명령이 출력하는 `qorechaind` 명령으로 등록하세요(위 참고).

Dashboard는 노드를 다운로드하고, 체인의 요건과 노드의 상태를 확인하고, 라이선스를 구매하는 데 유용합니다. 온체인 등록 자체는 항상 `lightnode-sx register` 트랜잭션입니다.

## 다음으로 볼 내용

- [보상 및 모니터링](/light-node/rewards-and-monitoring) — 3% 지분이 어떻게 적립되고, 청구되고, 모니터링되는지.
- [SX 에디션](/light-node/sx-edition) — `register` 명령과 전체 CLI 참조.
