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
라이브 메인넷에 브로드캐스트하려면 `--chain-id qorechain-vladi`를, 테스트넷에는 `--chain-id qorechain-diana`를 설정하세요. 두 네트워크 모두 v3.2 라인을 실행합니다. 메인넷 노드 릴리스는 **v3.2.4**(2026년 10월 23일 거버넌스 제안 13에 의해 높이 3,742,566에서 적용됨. v3.2.3은 2026년 10월 20일 높이 3,662,051에서 적용됨. 거버넌스 제안 14가 높이 3,906,833에서 v3.2.5를 적용하게 되며 작성 시점에는 투표 기간 중), 테스트넷은 **v3.2.6**(2026년 10월 27일 높이 8,970,638에서 적용됨. 그에 앞서 v3.2.5가 10월 26일 높이 8,890,800에서, v3.2.4가 10월 19일 높이 8,337,253에서 적용됨)입니다. 현재 릴리스는 [download.qore.host](https://download.qore.host)의 `latest.json`에서 확인하세요. `--chain-id`를 생략하면 클라이언트는 로컬 클라이언트 설정의 `chain-id`를 사용합니다.

이 페이지의 명령어와 플래그는 v3.2.3 릴리스 바이너리에 v3.2.4 추가분을 더해 확인했습니다. v3.2.4부터만 존재하는 항목(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터)에는 그렇게 표시합니다. v3.2.6 소스는 새로운 `tx` 명령어를 추가하지 않습니다. 대신 테스트넷의 상태(테스트 토큰, 활성화된 추상 계정 모듈, 열린 QoreChain Native 인스턴스화)를 바꾸며, 아래 섹션에서 관련이 있는 곳에 언급합니다.
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

`hybrid_signature_mode`는 두 네트워크 모두에서 `required`입니다(`qorechaind query pqc hybrid-mode`). 모든 Cosmos 경로 트랜잭션은 secp256k1 서명과 함께 ML-DSA-87(Dilithium-5) 서명을 포함해야 하며, 일반적인 `tx bank send ... -y`는 거부됩니다(코드스페이스 `pqc`, 코드 20). 메인넷 v3.2.3 이후의 유일한 예외는 다음과 같습니다:

- 아직 키가 없는 계정의 **첫 번째** PQC 키 등록(`register-key` 또는 `register-key-v2`). 새 계정이 부트스트랩할 수 있도록 하기 위한 것입니다.
- 사용 가능한 키가 없는 계정 레코드를 `register-key-v2`로 복구하는 경우
- 등록된 PQC 키가 없는 계정의 `tx slashing unjail`

이미 PQC 키가 있는 계정은 `register-key-v2`와 `migrate-key`를 **포함한** 모든 것에 하이브리드 서명을 해야 합니다(클래식 전용 시도는 코드 234로 거부됩니다). 키가 없는 계정은 하이브리드 서명도 첨부할 수 없습니다. 검증할 대상이 없으므로 먼저 등록합니다.

따라서 첫 등록(키가 없는 계정의 `pqc register-key` / `pqc register-key-v2`)을 제외한 이 페이지의 모든 명령어는 두 단계로 실행합니다. 먼저 `--generate-only`로 트랜잭션을 만들고, 그다음 `tx pqc cosign`으로 서명하고 브로드캐스트합니다. `pqc rotate-key`는 자체적으로 공동 서명과 브로드캐스트를 수행하며, `pqc gen-key`와 `pqc recover-key`는 로컬에 키 파일만 생성합니다:

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

`gen-key`와 `recover-key`는 같은 이름의 기존 키 파일을 덮어쓰기를 거부합니다. `--force`는 이를 교체하고 이전 파일을 `<name>.dilithium.bak-<unix-time>`으로 보관합니다.

### register-key

계정에 PQC 공개 키를 등록합니다(레거시 명령어: 알고리즘은 Dilithium-5). 첫 등록은 클래식 키만으로 서명하며, 이것이 부트스트랩 예외입니다. 이미 키가 있는 계정은 하이브리드 서명을 해야 합니다(`--generate-only` 후 `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type`은 `hybrid`(권장) 또는 `pqc_only`입니다. `classical_only`는 거부됩니다(코드 230). 양자내성 키를 등록하지 않으므로 계정이 다시는 서명할 수 없게 되기 때문입니다. 2,592바이트 공개 키 때문에 등록은 전송보다 비용이 많이 들며, 그래서 더 큰 가스 한도가 필요합니다.

체인은 양자내성 보호를 제공하지 않는 키(코드 230)와 이 계정이 이전에 사용한 키(코드 232)도 거부합니다. 클래식 키가 서명자 본인의 것이 아닌 등록도 거부합니다(코드 45).

### register-key-v2

알고리즘을 명시적으로 선택하여 키를 등록하며, 선택적으로 해당 키의 비밀 값을 보유하고 있음을 증명할 수 있습니다.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm`은 `dilithium5`(또는 `1`) 또는 `mlkem1024`(또는 `2`)이고, `key_type`은 `hybrid` 또는 `pqc_only`입니다.

**소유 증명(선택 사항).** `--pqc-key <name>`(`gen-key` 또는 `recover-key`로 만든 키)을 지정하면 명령어가 소유 증명을 첨부합니다. 이는 `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`에 대한 새 키 자신의 서명입니다. 체인은 증명이 있으면 이를 검증하고, 검증에 실패하면 등록을 거부합니다(코드 231). 증명 없는 등록도 여전히 허용됩니다. 증명에는 체인, 알고리즘, 계정, 키가 명시되어 있으므로 다른 계정이나 네트워크에 대해서는 아무것도 증명하지 못합니다. 트랜잭션에 4,627바이트 서명이 하나 추가되므로 가스 한도를 `600000`으로 유지하세요. 증명은 메시지의 `proof_of_possession` 필드로 전달됩니다. TypeScript SDK 0.9.0은 네트워크가 v3.2.3을 적용한 뒤에는 `ensurePqcRegistered`를 통해 자동으로 증명을 첨부합니다. 이전 SDK 릴리스와 `@qorechain/wallet-adapter`는 첨부하지 않으므로, 이를 통한 등록에는 증명이 포함되지 않습니다(여전히 허용됨).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 계정 레코드가 증명이 검증되었는지도 `possession_proven`으로 보고합니다([REST / gRPC 엔드포인트](/api-reference/rest-grpc-endpoints#pqc-module) 참조).

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

두 네트워크 모두 하이브리드 검증을 v2 sign-bytes로 옮기는 업그레이드를 적용했으며, v1 형식은 거부됩니다. 트랜잭션에는 하이브리드 서명 확장을 하나만 포함할 수 있습니다(v3.2.3부터 둘 이상은 거부됨).

### migrate-key

계정의 PQC 키를 한 알고리즘에서 다른 알고리즘으로 마이그레이션합니다. 현재 알고리즘에 대한 마이그레이션이 활성 상태여야 하며(거버넌스에 의해 시작됨), 두 키 모두 마이그레이션 바이트에 서명하고, 트랜잭션 자체에는 계정의 하이브리드 서명이 필요합니다(`--generate-only` 후 `tx pqc cosign`). 계정이 이전에 사용한 키는 거부됩니다(코드 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
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

v3.2.3부터 교체(rotation)는 양자내성 보호를 제공하지 않는 새 키(코드 230)와 계정이 이전에 사용한 키(코드 232)를 거부합니다. 계정은 교체해 떠나온 키를 기억하므로, 교체를 재생하여 이전 키로 되돌아갈 수 없습니다.

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

**범위 지정 윈도우(메인넷 v3.2.3 이후).** 값 한도는 네이티브 QOR만 계산합니다. 토큰 전송, 승인(approval) 또는 그 밖의 컨트랙트 호출은 값이 0이므로 이 한도에 포함되지 않습니다. 선택적 플래그 두 개로 윈도우가 허용하는 범위를 좁힐 수 있습니다:

| 플래그              | 효과                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | 일반 QOR 전송만 허용: calldata 없음, 컨트랙트 생성 없음, 코드를 가진 수신자 없음, EIP-7702 승인 없음                       |
| `--allowed-targets` | 지정한 수신자(콤마로 구분한 `0x` 주소)만 허용하며, 컨트랙트 생성은 거부됨                                                  |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

두 플래그 중 어느 것도 없이 연 윈도우는 기존과 동일하게 허용합니다. 범위는 윈도우 쿼리에서 `native_only`와 `allowed_targets`로 보고됩니다.

### close-evm-window

예를 들어 클래식 키가 유출되었다고 의심될 때 윈도우를 즉시 닫습니다. 보류 중인 EIP-7702 위임 동의도 함께 철회합니다.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation and clear-evm-delegation

계정의 EIP-7702 위임은 본인의 양자내성 동의가 있어야만 효력이 발생합니다(메인넷 v3.2.2부터). `authorize-evm-delegation`은 하나의 위임 대상 주소에 대한 해당 동의를 기록하며, 1회용이고 지정한 블록 수가 지나면 만료되며 `close-evm-window`로 철회됩니다. `clear-evm-delegation`은 이미 설정된 위임을 제거합니다. 둘 다 하이브리드 서명이 필요한 Cosmos 경로 메시지입니다(`--generate-only` 후 `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

`delegate`로 영 주소(zero address)를 지정하면 위임 해제에 동의하는 것입니다. 상태는 `qorechaind query pqc evm-delegation-consent <address>`로 확인하세요.

PQC 키 메시지(`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`)는 어느 것도 `authz`를 통해 계정을 대신하여 전송할 수 없습니다(메인넷 v3.2.3 이후).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type`은 `sx` 또는 `ux`입니다. 등록에는 네트워크의 라이선스 권한자가 부여한 활성 `lightnode_operator` 라이선스가 필요합니다. 프로그램의 현재 상태는 [라이트 노드](/light-node/overview)를 참조하세요. 기타 명령어: `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

v3.2.3부터 노드가 누적할 수 있는 보상은 **월 단위**로 제한되며(`GET /qorechain/lightnode/v1/reward_pool`의 `max_reward_per_month_per_node`, 30일당 2,000 QOR), 블록 시간과 가동률에 비례하여 배분되므로 이 한도는 더 이상 블록 생성 속도에 좌우되지 않습니다. 한도는 상한일 뿐 약속된 금액이 아닙니다. v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 노드의 한도가 직전 정산 시점이 아니라 노드 자신의 등록 시점부터 시작됩니다.

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

### register-validator / attest

브리지 검증인 메시지입니다. `register-validator <pqc_pubkey_hex> <supported_chains_csv>`는 검증인을 증명(attestation) 임무에 등록하고, `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]`는 증명을 제출합니다. 두 네트워크 모두 등록된 브리지 검증인이 없습니다. v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) 브리지 검증인 등록에 소유 증명과 다른 어떤 브리지 검증인도 사용하지 않는 키도 필요합니다.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

관리용입니다(`bridge_admin` 또는 `qcb_bridge` 라이선스. 서킷 브레이커 한도는 거버넌스로도 설정할 수 있음).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

한도는 기본 단위로 표시하며 `0`은 무제한을 의미합니다. 상태가 정확히 `active`인 경로만 가치를 이동시킵니다.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

첫 번째 `transfer`는 하위 명령어이고 두 번째는 소스 포트입니다. 이 글을 쓰는 시점에 메인넷에는 열려 있는 IBC 채널이 없습니다. 테스트넷에는 열려 있는 transfer 채널이 하나(`channel-0`) 있으며, 2026년 10월 27일에 `query ibc channel channels`로 확인했습니다.

---

## amm

네이티브 AMM 메시지입니다. 이 글을 쓰는 시점에 두 네트워크 모두 풀이 존재하지 않으므로, 이 명령어들은 아직 작용할 대상이 없습니다.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

v3.2.2부터 스왑은 풀의 두 디놈을 모두 명시해야 하고, `max_swap_impact_bps`가 강제되며, 프로토콜 수수료는 소각 모듈을 통해 처리됩니다.

테스트넷에서는 풀이 `uqor`와 세 가지 Fest 테스트 토큰 중 하나를 짝지을 수 있습니다(가치 없음, 테스트넷 전용). 예치금과 스왑 금액에는 대소문자를 구분하는 뱅크 디놈 `erc20:<EIP-55 0x address>`를 사용하며, 예를 들면 `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json`입니다(이후 `tx pqc cosign`). EVM 쪽에 있는 토큰은 먼저 `MsgConvertERC20`으로 뱅크 코인으로 변환해야 하며, 이 메시지의 발신자는 `qor1` 주소입니다. 노드 릴리스 v3.2.6의 CLI 명령어 `qorechaind tx erc20 convert-erc20`는 발신자를 `0x` 주소로 기록하여 체인이 이를 거부하므로(`decoding bech32 failed`), 해당 메시지는 `qor1` 발신자로 직접 구성하십시오. 자세한 내용: [테스트넷 Fest 테스트 토큰](/developer-guide/evm-development#fest-tokens). 풀을 만들 때는 예치금에 더해 풀 생성 수수료가 듭니다(`query amm params`의 `pool_creation_fee`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

네이티브 토큰(예: `1000000uqor`)을 수수료 변환 플로트로 이동시킵니다. 이는 수수료가 허용된 다른 토큰으로 지불될 때 모듈이 검증인에게 지급하는 데 사용하는 QOR 준비금입니다. 어떤 토큰을 허용할지는 거버넌스가 결정합니다. 두 네트워크 모두 설정이 네이티브 `uqor`만 허용하므로 변환은 일어나지 않습니다. `qorechaind query gasabstraction accepted-tokens`로 확인하세요.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call`은 메인넷에서 서킷 브레이커에 의해 꺼져 있으며([아래](#disabled-messages) 참조), 테스트넷에서는 대상 레인을 사용할 수 있는 경우에만 동작합니다. 실패한 대기열 호출(`--async`)은 부작용을 남기지 않고 `Failed` 레코드만 남기며(v3.2.3부터), 파생된 소스 레인이 대상 레인과 같은 호출은 거부됩니다. [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.

---

## stakingtier (v3.2.4) {#stakingtier}

:::note v3.2.4부터 사용 가능
스테이킹 티어 모듈은 **v3.2.4** 릴리스와 함께 도입되었습니다. `qorechain-diana` 테스트넷에서는 2026년 10월 19일부터, 메인넷에서는 2026년 10월 23일(높이 3,742,566, 거버넌스 제안 13)부터 실행되고 있습니다. 이전 릴리스를 실행하는 노드에는 이 모듈이 없으며 이 명령어는 거부됩니다. 먼저 대상 노드에서 `GET /qorechain/stakingtier/v1/params`를 확인하세요.
:::

선택적인 시간 잠금 위임: 위임자는 기존 위임의 일부를 3, 6 또는 12개월 동안(최소 잠금은 10 QOR) 잠그고, 나중에 모듈이 그에 대해 적립한 보너스를 청구할 수 있습니다. 잠금은 위임 위에 얹히는 레코드이며, 위임된 자금은 검증인에게 그대로 남아 있습니다.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

잠금은 스테이킹 메시지 서버가 강제하므로 `authz`, 그룹 또는 컨트랙트를 통한 언델리게이션도 포괄합니다. 잠금을 조기에 종료하면 아직 지급되지 않은 보너스를 잃고 페널티가 소각됩니다. 최소 잠금 금액과 그 밖의 파라미터는 `GET /qorechain/stakingtier/v1/params`에 있습니다. 모든 Cosmos 경로 트랜잭션과 마찬가지로 이들은 하이브리드 공동 서명(`--generate-only` 후 `tx pqc cosign`)과 넉넉한 가스 한도(예: `--gas 900000 --fees 90000uqor`)가 필요합니다.

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile`은 `defi`, `gaming`, `nft`, `enterprise` 또는 `custom`이며, `stake_amount`는 uqor 단위입니다(현재 최소값은 `query rdk config`에 있습니다). 프로필 프리셋이 정산, 시퀀서, DA 및 가스 모델을 제공하며, 명령줄에서는 VM만 재정의할 수 있습니다. `finalize-batch` 명령어는 없습니다.

데이터 가용성이 `native`(또는 `both`)인 롤업에서는 `--data-hash`를 비워 두십시오. 어떤 트랜잭션도 데이터 가용성 블롭을 게시하지 않으며, 체인은 그런 롤업에 대해 데이터 해시를 주장하는 배치를 거부합니다(이 글을 쓰는 시점의 메인넷 릴리스인 노드 릴리스 v3.2.4의 동작입니다). 옵티미스틱 롤업의 경우 `@qorechain/rdk` 클라이언트(0.6.1)가 배치의 상태 루트를 체인의 표준 전환 루트(RDK의 `batchTransitionRoot`)로 설정합니다. [롤업](/rollups/overview)을 참조하십시오.

`--anchor-signature`는 **v2 앵커 서명 바이트**에 대한 롤업 생성자의 ML-DSA 서명이며, 이를 지정하면 배치가 멀티레이어 모듈에도 앵커링됩니다. 서명할 정확한 바이트는 `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>`로 출력하세요. 값은 `submit-batch` 플래그와 일치해야 합니다. v3.2.3부터 모듈은 **롤업별 에스크로 원장**을 유지합니다. 출금은 해당 롤업의 원장이 보유한 금액에서만 지급되며, 디놈, 양수 금액, 증명 깊이, 형제 노드 크기가 검사됩니다. 롤업을 중지하면 원장에 남은 금액만 환불되고, 중지된 롤업은 더 이상 출금을 지급하지 않습니다. 이 글을 쓰는 시점에 두 네트워크 모두 롤업이 존재하지 않습니다.

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
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | 메인넷: 업로드 및 인스턴스화 권한이 `Nobody`이며 세 메시지 타입 모두 서킷 브레이커 목록에 올라 있습니다. 테스트넷: 업로드는 `Nobody`이고 `MsgStoreCode`가 목록에 올라 있으며(코드는 거버넌스가 저장), 인스턴스화는 열려 있고(`Everybody`) 목록에 없습니다 |
| `tx crossvm call`                                         | 메인넷에서 서킷 브레이커에 의해 비활성화됨. 테스트넷에서는 활성화됨                            |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | 메인넷 서킷 브레이커 목록에 올라 있음. v3.2.3부터는 어떤 경우든 베스팅 계정을 서명자 본인에게만 만들 수 있음 |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | 거버넌스 제안 메시지(CLI 명령어 없음)이며 메인넷 서킷 브레이커 목록에 올라 있음. v3.2.3부터 거버넌스도 마지막 활성 서명 알고리즘은 제거할 수 없음 |
| `tx svm deploy-program`, `execute`, `create-account`      | SVM 트랜잭션 경로가 네트워크 전체에서 비활성화됨                                               |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | 메인넷: 추상 계정 모듈이 꺼져 있음 (`query abstractaccount config`가 `enabled: false`를 표시). 테스트넷: 거버넌스로 켜짐(`enabled: true`, 2026년 10월 27일 확인) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | 거버넌스 권한 메시지. 메인넷 서킷 브레이커 목록에도 올라 있음                                  |
| `tx license *`                                            | 권한 전용 (라이선스는 네트워크의 라이선스 권한자가 부여하며, v3.2.3부터 거버넌스가 `MsgUpdateAuthority`로 그 권한자를 교체할 수 있음) |

현재 목록은 `qorechaind query circuit disabled-list`로 확인할 수 있습니다.
