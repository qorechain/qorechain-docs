---
slug: /cli-reference/transaction-commands
title: 트랜잭션 명령어
sidebar_label: 트랜잭션 명령어
sidebar_position: 2
---

# 트랜잭션 명령어

모든 트랜잭션 명령어는 다음 패턴을 따릅니다:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
라이브 메인넷에 브로드캐스트하려면 `--chain-id qorechain-vladi`를, 테스트넷에는 `--chain-id qorechain-diana`를 설정하세요. 두 네트워크 모두 v3.2 라인을 실행합니다(메인넷 노드 릴리스 **v3.2.1**, 테스트넷 **v3.2.2**; 현재 릴리스는 [download.qore.host](https://download.qore.host)의 `latest.json`에서 확인하세요). `--chain-id`를 생략하면 클라이언트는 로컬 클라이언트 설정의 `chain-id`를 사용합니다.
:::

공통 플래그는 모든 `tx` 하위 명령어에 적용됩니다:

| 플래그              | 타입   | 설명                                                           |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | 서명 키의 이름 또는 주소                                       |
| `--chain-id`        | string | 체인 식별자 (기본값: 클라이언트 설정에서 가져옴)               |
| `--fees`            | string | 트랜잭션 수수료 (예: `40000uqor`)                              |
| `--gas-prices`      | string | `--fees` 대신 사용하는 가스 가격 (예: `0.1uqor`)               |
| `--gas`             | string | 가스 한도 또는 추정을 위한 `auto` (기본값 `200000`)            |
| `--gas-adjustment`  | float  | `auto` 추정치에 적용되는 배수 (기본값 `1`)                     |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` 또는 `memory`          |
| `--node`            | string | RPC 엔드포인트 (기본값 `tcp://localhost:26657`)                |
| `--broadcast-mode`  | string | `sync` 또는 `async`                                            |
| `--generate-only`   | bool   | 서명하지 않고 서명되지 않은 트랜잭션을 출력                    |
| `-y`                | bool   | 확인 프롬프트 건너뛰기                                         |

---

## 수수료와 가스 {#fees-and-gas}

네트워크 수수료 하한은 **가스 단위당 0.1 uqor**입니다(`query feemarket params`가 `min_gas_price`를 보여 줍니다. 부하가 걸리면 실제 기본 수수료가 하한 위로 오를 수 있으며, `query feemarket base-fee`를 참조하세요). `fee >= gas limit x gas price`를 충족하지 않으면 트랜잭션이 거부되므로, `--fees 500uqor`는 가스 한도가 5,000 이하일 때만 동작하며 실제 트랜잭션에서는 실패합니다.

| 트랜잭션                                      | 권장 `--gas`      | 대응하는 `--fees` |
| --------------------------------------------- | ----------------- | ----------------- |
| 하이브리드 서명 전송, 위임, 투표, 클레임      | `400000`          | `40000uqor`       |
| PQC 키 등록                                   | `600000`          | `60000uqor`       |
| `lightnode register`                          | `300000`          | `30000uqor`       |

하이브리드 서명은 트랜잭션에 약 4.7 KB를 추가하며 이는 바이트당 10 가스로 과금되므로, 기본값 `--gas 200000`으로는 충분하지 않을 때가 있습니다. 메인넷에서 하이브리드 서명 전송은 대략 160,000에서 240,000 가스를 사용했습니다. 항상 `--fees`(또는 `--gas-prices`)와 함께 `--gas`를 명시적으로 설정하세요.

---

## Cosmos 경로에서는 하이브리드 서명이 필수입니다 {#hybrid-signing}

`hybrid_signature_mode`는 두 네트워크 모두에서 `required`입니다(`qorechaind query pqc hybrid-mode`). 모든 Cosmos 경로 트랜잭션은 secp256k1 서명과 함께 ML-DSA-87(Dilithium-5) 서명을 포함해야 하며, 일반적인 `tx bank send ... -y`는 거부됩니다. 예외는 PQC 키 등록 및 마이그레이션(새 계정이 첫 키를 등록할 수 있도록)과, 등록된 PQC 키가 없는 계정의 `tx slashing unjail`뿐입니다.

따라서 이 페이지의 `pqc register-key`, `pqc register-key-v2`, `pqc migrate-key`를 제외한 모든 명령어는 두 단계로 실행합니다. 먼저 `--generate-only`로 트랜잭션을 만들고, 그다음 `tx pqc cosign`으로 서명하고 브로드캐스트합니다:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

키 이름 `mypqc`는 `tx pqc gen-key`로 생성되어 계정에 등록된 키입니다([pqc](#pqc) 참조). 이 작업에는 [download.qore.host](https://download.qore.host)의 공식 릴리스 바이너리를 사용하세요. 공개 소스 트리에서 빌드한 바이너리는 Dilithium 서명을 생성하거나 적용할 수 없습니다(`gen-key`와 `cosign`이 전체 빌드가 필요하다고 보고합니다). [QoreX](/qorex/overview)와 SDK는 동일한 서명을 대신 수행합니다.

---

## bank

### send

한 계정에서 다른 계정으로 토큰을 전송합니다.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

예시: `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json` 실행 후, 위에 표시된 대로 `tx pqc cosign`을 실행합니다. 1 QOR = 1,000,000 uqor.

---

## staking

### create-validator

JSON 파일로 검증인을 생성합니다(플래그 기반 형식은 제거되었습니다). 메인넷에서는 활성 `validator_operator` 라이선스와 등록된 PQC 키도 필요합니다. [검증인 운영](/developer-guide/running-a-validator)을 참조하세요.

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json`:

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

기존 검증인의 설명 또는 수수료를 수정합니다.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

플래그: `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. 생략한 필드는 변경되지 않습니다.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

진행 중인 언본딩 항목을 취소합니다.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

감금(jail) 기간이 끝난 후 감금된 검증인을 활성 세트로 복귀시킵니다.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

대기 중인 모든 스테이킹 보상을 인출합니다.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

한 검증인으로부터 보상을 인출합니다.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| 플래그         | 타입 | 설명                                                     |
| -------------- | ---- | -------------------------------------------------------- |
| `--commission` | bool | 검증인 수수료도 함께 인출 (검증인 운영자 주소)           |

---

## gov

### submit-proposal

`messages`, `metadata`, `deposit`, `title`, `summary`와 선택적으로 `expedited`를 포함하는 JSON 파일로 거버넌스 제안을 제출합니다. `qorechaind tx gov draft-proposal`로 뼈대를 생성할 수 있습니다.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

투표 옵션: `yes`, `no`, `abstain`, `no_with_veto`. 표를 나누려면 `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4`를 사용하세요.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Dilithium-5(ML-DSA-87) 키를 생성하여 `<home>/pqc/<name>.dilithium`에 저장합니다(모드 `0600`, **암호화되지 않음**). 공개 키를 hex로 출력합니다.

```bash
qorechaind tx pqc gen-key <name>
```

### register-key

계정에 PQC 공개 키를 등록합니다(레거시 명령어: 알고리즘은 Dilithium-5). 클래식 키만으로 서명하며, 이것이 부트스트랩 예외입니다.

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type`은 `hybrid`(권장), `pqc_only` 또는 `classical_only`입니다. 2,592바이트 공개 키 때문에 등록은 전송보다 비용이 많이 들며, 그래서 더 큰 가스 한도가 필요합니다.

### register-key-v2

알고리즘을 명시적으로 선택하여 키를 등록합니다.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm`은 `dilithium5`(또는 `1`) 또는 `mlkem1024`(또는 `2`)입니다.

### cosign

서명되지 않은 트랜잭션에 PQC 키와 계정의 클래식 키로 서명한 뒤 브로드캐스트합니다.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| 플래그         | 설명                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | `gen-key` 또는 `recover-key`로 생성한 키의 이름                                                   |
| `--sign-bytes` | `auto`(기본값: 체인에 어떤 sign-bytes 형식이 적용되는지 질의), `v1` 또는 `v2`                     |
| `--generate-only` / `--offline` | 서명된 트랜잭션을 브로드캐스트하는 대신 JSON으로 출력합니다. 나중에 `tx broadcast`로 제출하며, `--offline`은 `--account-number`, `--sequence`, `--sign-bytes v1\|v2`도 필요합니다 |
| `--dry-run`    | 시뮬레이션하고 가스 추정치를 출력                                                                 |

두 네트워크 모두 하이브리드 검증을 v2 sign-bytes로 옮기는 업그레이드를 적용했으며, v1 형식은 거부됩니다.

### migrate-key

계정의 PQC 키를 한 알고리즘에서 다른 알고리즘으로 마이그레이션합니다. 현재 알고리즘에 대한 마이그레이션이 활성 상태여야 하며(거버넌스에 의해 시작됨), 두 키 모두 마이그레이션 바이트에 서명합니다.

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> [flags]
```

### recover-key

계정의 BIP-39 니모닉(stdin에서 읽음)으로부터 ML-DSA-87 키를 재구성하여 로컬에 저장합니다. `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`을 사용합니다.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| 플래그         | 타입   | 설명                                                                       |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter`(표준, 기본값) 또는 `bridge`(레거시 `SHAKE-256(mnemonic)`)        |

### rotate-key

계정의 ML-DSA-87 키를 동일한 알고리즘 내에서 교체합니다. stdin에서 니모닉을 읽고, 이전 키와 새 키로 이중 서명한 뒤, 이전 키로 공동 서명하고 브로드캐스트합니다.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| 플래그             | 타입   | 설명                                                                                 |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | 현재 등록된 키의 파생 방식: `bridge`(기본값) 또는 `adapter`                          |
| `--new-derivation` | string | 새 키의 파생 방식: `adapter`(기본값) 또는 `bridge`                                   |
| `--new-random`     | bool   | 새로운 무작위 키로 교체합니다. `--new-key-out`이 필요합니다                          |
| `--new-key-out`    | string | 무엇이든 전송되기 전에 새 개인 키를 `<home>/pqc/<name>.dilithium`으로 저장           |
| `--sign-bytes`     | string | `auto`(기본값), `v1` 또는 `v2`                                                       |

### open-evm-window

EVM 경로는 등록된 PQC 키를 보유**하고** 열려 있는 승인 윈도우가 있는 계정의 트랜잭션만 허용합니다. 윈도우는 Cosmos 경로 메시지로 열기 때문에, 이더리움 지갑이 생성할 수 없는 PQC 서명을 포함합니다. 윈도우가 열려 있는 동안에는 일반 MetaMask 트랜잭션이 그대로 동작합니다.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| 인자        | 한도                 | 의미                                                                                          |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 ~ 17,280           | 윈도우를 연 블록부터 계산하여 윈도우가 열려 있는 기간                                         |
| `max-txs`   | 1 ~ 1,000            | 허용할 EVM 트랜잭션 수                                                                        |
| `max-value` | 양수                 | 허용되는 총량. 전송 금액 **그리고** 각 트랜잭션이 지불할 수 있는 최대 수수료를 합산합니다. `uqor` 또는 `qor` 단위 (예: `1000qor`) |

윈도우를 열면 기존 윈도우가 대체됩니다. `qorechaind query pqc evm-window <address>`로 확인하세요.

### close-evm-window

예를 들어 클래식 키가 유출되었다고 의심될 때 윈도우를 즉시 닫습니다.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type`은 `sx` 또는 `ux`입니다. 등록에는 활성 `lightnode_operator` 라이선스가 필요하며, 라이트 노드 보상 프로그램 등록은 **아직 열리지 않았습니다**. 기타 명령어: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`. [라이트 노드](/light-node/overview)를 참조하세요.

---

## bridge

브리지는 프로덕션 단계가 아닙니다. 두 네트워크 모두에서 구성된 모든 체인이 `pending` 상태이며 등록된 브리지 검증인이 없습니다(`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

소스 체인에서 브리지된 자산을 적립합니다. 검증인 서명(`--validator-sigs`, `--pqc-commitment`)을 포함하며, 최종 사용자가 입금을 시작하는 방법이 아니라 브리지 운영자 메시지입니다.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### update-chain-config / set-verifier-bootstrap

관리용입니다(`bridge_admin` 또는 `qcb_bridge` 라이선스).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
```

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

첫 번째 `transfer`는 하위 명령어이고 두 번째는 소스 포트입니다. 이 글을 쓰는 시점에 두 네트워크 모두 열려 있는 IBC 채널이 없습니다(`query ibc channel channels`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile`은 `defi`, `gaming`, `nft`, `enterprise` 또는 `custom`이며, `stake_amount`는 uqor 단위입니다(현재 최소값은 `query rdk config`에 있습니다). 프로필 프리셋이 정산, 시퀀서, DA 및 가스 모델을 제공하며, 명령줄에서는 VM만 재정의할 수 있습니다. `finalize-batch` 명령어는 없습니다.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status`는 `proposed`, `active`, `suspended` 또는 `decommissioned`입니다. `update-layer-status`는 메인넷에서 서킷 브레이커에 의해 비활성화되어 있습니다(아래 참조).

---

## 현재 비활성화되었거나 사용할 수 없는 메시지 {#disabled-messages}

일부 명령어는 바이너리에 존재하지만 라이브 네트워크에서는 성공할 수 없습니다:

| 명령어                                                    | 사유                                                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | 업로드 및 인스턴스화 권한이 두 네트워크 모두에서 `Nobody`이며, 해당 메시지 타입은 서킷 브레이커 목록에도 올라 있습니다 |
| `tx crossvm call`                                         | 메인넷에서 서킷 브레이커에 의해 비활성화됨                                                     |
| `tx svm deploy-program`, `execute`, `create-account`      | SVM 트랜잭션 경로가 네트워크 전체에서 비활성화됨                                               |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | 추상 계정 모듈이 꺼져 있음 (`query abstractaccount config`가 `enabled: false`를 표시) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | 거버넌스 권한 메시지. 메인넷 서킷 브레이커 목록에도 올라 있음                                  |
| `tx license *`                                            | 권한 전용 (라이선스는 네트워크의 라이선스 권한자가 부여)                                       |

현재 목록은 `qorechaind query circuit disabled-list`로 확인할 수 있습니다.
