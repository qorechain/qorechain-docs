---
slug: /developer-guide/governance-proposals-contracts
title: "컨트랙트를 위한 거버넌스 제안: 네이티브 코드 업로드와 크로스 VM 접근 열기 (테스트넷)"
sidebar_label: 컨트랙트 제안
sidebar_position: 12
---

# 컨트랙트를 위한 거버넌스 제안: 네이티브 코드 업로드와 크로스 VM 접근 열기 (테스트넷)

QoreChain 테스트넷 `qorechain-diana`에서는 일반 트랜잭션으로 QoreChain Native(CosmWasm) 컨트랙트를 업로드할 수 없으며, 거버넌스가 허용하기 전에는 어떤 EVM 컨트랙트도 브리지를 통해 Native 컨트랙트를 호출할 수 없습니다. 둘 다 **거버넌스 제안**을 거칩니다. 제안은 컴파일된 코드를 저장하고, 선택적으로 컨트랙트를 만들며, 업로드한 **정확한 코드에 고정된(pinned)** 상태로 컨트랙트를 크로스 VM 허용 목록에 추가합니다. 이 페이지는 빌더가 이런 제안을 준비하고, 제출하고, 지켜보고, 검증한 다음, 승인된 컨트랙트를 Solidity에서 호출하는 방법을 보여 줍니다.

이 페이지는 **2026년 11월 22일**의 실제 테스트넷(체인 `qorechain-diana`, 11월 20일부터 체인 v3.2.9)을 기준으로 확인했습니다. 체인 위의 예시는 실제 제안입니다. 40번(`qday-receipts` 컨트랙트, 코드 865), 23번, 27번, 34번(저장된 코드), 19번과 20번(인스턴스화 규칙), 32번(허용 목록)입니다. `qorechaind` 명령줄은 기존 CLI 레퍼런스와 체인의 제안 JSON을 바탕으로 작성했으며, 이 페이지를 위해 바이너리 자체를 실행하지는 않았습니다. 플래그가 다르면 사용하는 컴퓨터에서 `qorechaind tx gov submit-proposal --help`를 한 번 실행해 보세요.

:::note 테스트넷 전용
이 단계는 테스트넷을 설명합니다. 메인넷에는 열린 크로스 VM 브리지가 없고, 그곳의 코드 업로드도 거버넌스 전용입니다. 테스트 QOR에는 가치가 없으니 테스트 계정만 사용하세요.
:::

## 왜 거버넌스를 거치는가 {#why}

* **계정에는 업로드가 닫혀 있습니다.** `code_upload_access`는 `Nobody`이며 `MsgStoreCode`는 서킷 브레이커 목록에 있습니다. 거버넌스 제안은 브레이커를 열고, 거버넌스 계정으로서 코드를 저장하고, 같은 제안 안에서 다시 닫으므로 투표 사이에 문이 열린 채로 남지 않습니다.
* **인스턴스화는 열려 있습니다.** `instantiate_default_permission`은 제안 19 이후 `Everybody`이므로, 거버넌스가 코드를 저장하고 나면 저장된 코드에 더 엄격한 권한이 없는 한 누구나(사용자 포함) 그 코드로 컨트랙트를 만들 수 있습니다.
* **브리지는 승인된 컨트랙트에만 닿습니다.** `0x0901` 브리지는 `bridge_allowed_targets`에 있는 대상만 호출할 수 있습니다. 각 대상은 코드 id와 코드 이력의 길이에 고정되므로, 컨트랙트를 다른 코드로 마이그레이션하면서 승인을 유지할 수 없습니다.
* **원자적입니다.** 제안의 메시지는 함께 실행됩니다. 하나가 실패하면(예: 체인이 거부하는 코드) 아무것도 적용되지 않으며 브레이커가 열린 채로 남지 않습니다.

## 필요한 것 {#needs}

| 항목 | 구하는 방법 |
| --- | --- |
| `qorechaind` 바이너리(Linux) | [download.qore.host](https://download.qore.host)의 릴리스. 공개 소스 트리의 바이너리는 체인이 요구하는 하이브리드 서명을 만들 수 없습니다. |
| 포스트 퀀텀 키가 등록된 테스트넷 계정 | [하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing)을 참조하세요. |
| 보증금과 수수료를 위한 테스트 QOR | 테스트넷 페이시. 일반 제안에는 10 QOR, 신속 제안에는 50 QOR가 필요합니다(아래 표). |
| 다른 모든 사람과 같은 방식으로 컨트랙트를 빌드하기 위한 Docker | [Docker](https://docs.docker.com/get-docker/). |

## 1단계: 컨트랙트를 빌드하고 체크섬 기록 {#build}

누구나 소스를 다시 빌드해 같은 바이트를 얻을 수 있도록 CosmWasm optimizer로 빌드하세요. Workshop 3 컨트랙트는 Apple Silicon에서 arm64 이미지로 빌드했습니다(x86 컴퓨터는 기본 `optimizer` 이미지를 사용합니다. 두 이미지의 체크섬은 다르므로, 제안 요약에 어느 쪽을 썼는지 밝히세요).

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

컨트랙트마다 한 줄씩, 64자 16진수 체크섬과 파일 이름이 보여야 합니다. 예를 들면 `6ebfc32f...5c43c  qday_receipts.wasm`입니다. 이 체크섬은 **압축하지 않은 wasm 파일의 SHA-256**이며, 체인이 사용자의 코드에 대해 보여 주는 `data_hash`입니다. 복사해 두세요. 투표자가 확인할 수 있도록 제안 요약에 들어갑니다.

보증금을 쓰기 전에, [가스와 업로드 한도](/developer-guide/cosmwasm-development#gas-and-limits)의 한도에 대해 코드를 확인하세요. 함수는 최대 4,096개, 컴파일 크기는 최대 32 MiB, 부동소수점 명령은 없어야 합니다.

## 2단계: 제안을 위해 코드 인코딩 {#encode}

제안은 wasm을 JSON 안에 base64로 담습니다. 먼저 압축하세요(체인은 gzip을 받아들이며 제안 40이 사용한 것입니다. 그 코드는 `H4sI`로 시작합니다).

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

바이트 단위 크기가 보여야 합니다. `qday-receipts` 코드는 gzip의 base64로 약 99,000자입니다. 명령에 붙여 넣기에는 너무 길므로 파일에 보관하세요.

## 3단계: 제안 작성 {#write}

제안은 `messages`, `metadata`, `deposit`, `title`, `summary`, `expedited`를 가진 JSON 파일입니다. 아래 모든 메시지의 `authority`와 `sender`는 **거버넌스 모듈 계정**입니다. 이 페이지에서 복사하지 말고 직접 읽으세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

`"name":"gov"`인 계정이 보여야 하며, 그 `address`는 `qor1`로 시작합니다. 아래에서는 이를 `<GOV_ADDRESS>`라고 부릅니다. 2026년 11월 22일에는 `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3`였습니다.

### 제안 A: 코드를 저장하고 컨트랙트 만들기 {#proposal-a}

허용 목록 메시지를 뺀 제안 40의 형태입니다. 순서가 중요합니다. 브레이커를 열고, 저장하고, 브레이커를 닫은 다음, 인스턴스화합니다.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

자리 표시자를 채우는 방법:

| 자리 표시자 | 구하는 방법 |
| --- | --- |
| `<NEXT_CODE_ID>` | 마지막 코드 id에 1을 더한 값. 마지막 id는 `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"`로 읽으세요. 2026년 11월 22일에 마지막은 865였고 다음은 866이었습니다. 다른 사람의 제안이 먼저 코드를 저장하면 사용자의 코드는 더 나중의 id를 받고 인스턴스화 메시지가 실패하여 제안 전체가 취소됩니다(잃는 것은 기다린 시간뿐입니다). |
| `<BASE64_SALT>` | 짧은 텍스트를 base64로 인코딩한 값: `printf 'my-contract-v1' \| base64`. 컨트랙트 주소를 예측 가능하게 만듭니다. 제안 40은 솔트 `qday-receipts-w3`를 사용했습니다. |
| `msg` | 컨트랙트의 `instantiate`가 기대하는 JSON. 필드가 없는 컨트랙트는 `{}`입니다. |
| `admin` | 빈 문자열은 관리자가 없다는 뜻이며, 아무도 컨트랙트를 마이그레이션할 수 없습니다. 브리지가 호출할 컨트랙트에는 이를 권장합니다([고정](#pins) 참조). |
| `instantiate_permission` | `Everybody`, 또는 인스턴스화할 수 있는 사람을 제한하는 `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }`(제안 34가 테스트 컨트랙트에 이렇게 했습니다). |

제안 안에서 꼭 인스턴스화할 필요는 없습니다. 마지막 메시지를 빼면 코드만 저장하며, 나중에 일반 트랜잭션(`tx wasm instantiate`, [컨트랙트 수명 주기](/developer-guide/cosmwasm-development) 참조)으로 인스턴스화합니다. 제안 23번과 27번은 이렇게 코드를 저장했습니다.

### 제안 B: 컨트랙트를 크로스 VM 허용 목록에 넣기 {#proposal-b}

제안 A가 통과한 뒤, 컨트랙트 주소를 찾고 실시간 크로스 VM 파라미터를 읽으세요.

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

`qor1...` 컨트랙트 주소, **하나**의 항목(`INIT`, 사용자의 코드 id)만 있는 이력, 그리고 파라미터 집합이 보여야 합니다. 크로스 VM 모듈의 `MsgUpdateParams`는 **파라미터 집합 전체를 대체**하므로, 실시간 응답의 모든 필드를 복사하고 두 가지만 바꾸세요. `bridge_allowed_targets`에 대상을 추가하고 `bridge_target_pins`에 그 고정을 추가합니다.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

위의 숫자는 2026년 11월 22일에 읽은 값이므로, 이 값이 아니라 직접 실시간으로 읽은 값을 사용하세요. 제안 40은 실시간 응답에도 나타나는 필드인 `wasm_congestion_factor_micro`를 생략했습니다. 실시간 응답과 제안 40의 템플릿을 따르고, 투표 후 결과를 [크로스 VM 레퍼런스](/developer-guide/cross-vm-reference#params)의 표와 비교하세요.

### 고정: `code_id`와 `history_len`의 의미 {#pins}

| 필드 | 의미 |
| --- | --- |
| `target` | `cosmwasm:` 뒤에 컨트랙트 주소를 `bridge_allowed_targets`와 정확히 같게 쓴 값. |
| `code_id` | 브리지가 컨트랙트를 호출하려면 컨트랙트가 실행해야 하는 코드. |
| `history_len` | 고정할 때 컨트랙트의 코드 이력에 있는 항목 수. 새 인스턴스는 1입니다. 한 번 마이그레이션한 컨트랙트는 2입니다(테스트넷 허용 목록에 그런 컨트랙트가 하나 있습니다). 이후의 마이그레이션은 길이를 바꾸므로 고정이 더 이상 일치하지 않고 브리지가 호출을 거부합니다. |

거버넌스가 아닌 다른 관리자가 있는 허용 목록 컨트랙트는 그 관리자가 마이그레이션할 수 있으므로 반드시 고정해야 합니다. 가장 단순하고 안전한 설계는 제안 40이 한 방식, 즉 관리자 없음과 고정입니다.

### 하나의 제안으로 둘 다 하기 {#one-proposal}

제안 40은 모든 것을 하나의 제안으로 했습니다. 코드를 저장하고, 솔트로 인스턴스화하고, 그 솔트가 만드는 주소를 고정했습니다. 이를 위해서는 다음 코드 id와 앞으로 생길 컨트랙트 주소를 미리 알아야 하므로 틀리기 쉽습니다. 제안 두 개는 투표가 한 번 더 필요하고 몇 시간이 더 걸리므로, 주소를 이미 파생했다면 몰라도 가급적 두 개를 사용하세요.

## 4단계: 보증금, 투표 기간, 임계값 {#params}

제출하기 전에 실시간 규칙을 읽으세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| 규칙 | 일반 제안 | 신속 제안(`"expedited": true`) |
| --- | --- | --- |
| 최소 보증금 | 10 QOR(`10000000uqor`) | 50 QOR(`50000000uqor`) |
| 보증금 기간(최소액에 도달하기까지) | 172,800초(2일) | 172,800초(2일) |
| 투표 기간 | 14,400초(4시간) | 3,600초(1시간) |
| 정족수 | 본딩된 지분의 33.4% | 본딩된 지분의 33.4% |
| 찬성 임계값 | 투표된 표의 50% | 투표된 표의 66.7% |
| 거부권 임계값 | 33.4% | 33.4% |
| 최소 초기 보증금 | 없음 | 없음 |

2026년 11월 22일에 읽은 값입니다. 같은 응답에서 더 알 수 있는 것: 임계값을 넘는 "거부권 반대" 표는 보증금을 소각하고(`burn_vote_veto`가 `true`), 정족수에 미달한 제안은 소각하지 않으며, 집계에 실패한 신속 제안은 이미 던져진 표와 함께 일반 제안으로 이어집니다. 지금까지 테스트넷 팀이 컨트랙트를 위해 제출한 모든 제안은 신속 제안이었습니다. 빌더의 제안은 보통 일반 제안으로 두는 것이 좋습니다(10 QOR 보증금과 4시간 투표가 계획하기 더 쉽습니다).

## 5단계: 제출 {#submit}

Cosmos 레인의 모든 트랜잭션은 하이브리드 서명을 가져야 하므로, 트랜잭션을 먼저 만든 다음 포스트 퀀텀 키로 서명합니다. 제안이 크므로(코드가 안에 들어 있습니다) 가스에 여유를 주세요. 수수료 하한은 가스 단위당 0.1 uqor이고 트랜잭션 1바이트는 10 가스입니다.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

`--gas`와 `--fees`는 드라이 런으로 정하세요. 먼저 `tx pqc cosign`을 `--dry-run`과 함께 실행해(가스 추정치를 출력하고 아무것도 전송하지 않습니다) 추정치에 30%를 더한 값을 `<GAS>`로, `<GAS>`에 0.1 uqor를 곱한 금액 이상을 `<FEES>`로 사용합니다. 단순 전송은 대략 30만~40만 가스가 필요하고, 배포나 코드를 담은 제안은 훨씬 더 많이 필요합니다.

테스트넷 실측: 압축된 코드 약 99 KB(JSON 102.6 KB)를 담은 제안은 14,961,429 가스를 사용했습니다. 제안 JSON 바이트당 약 150 가스로 계산하세요. 100 KB 제안이면 최소 `--gas 20000000 --fees 2000000uqor`를 쓰세요. 투표는 약 153,400 가스를 사용했으며 `--gas 300000 --fees 30000uqor`를 쓰면 됩니다. 코드는 투표가 끝날 때 저장되며 제출자에게 추가 비용은 없습니다.

`--generate-only`는 서명되지 않은 트랜잭션을 씁니다. `tx pqc cosign`은 두 서명을 모두 추가하고 브로드캐스트합니다. 배경은 [하이브리드 서명](/cli-reference/transaction-commands#hybrid-signing)과 [gov 명령](/cli-reference/transaction-commands#submit-proposal)에 있습니다. 트랜잭션 해시와 코드 0이 보여야 합니다. 가스 부족 오류가 보이면 `--gas`와 그에 맞는 `--fees`를 올리세요(수수료는 최소 가스에 0.1 uqor를 곱한 값이어야 합니다).

제안 id를 찾으세요. 트랜잭션 이벤트의 숫자이기도 합니다.

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

제목과 `PROPOSAL_STATUS_VOTING_PERIOD` 상태가 보여야 합니다(첨부한 보증금이 최소액에 도달했습니다). 보증금이 더 적으면 상태는 `PROPOSAL_STATUS_DEPOSIT_PERIOD`이며, 누구나 보충할 수 있습니다.

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## 6단계: 투표 {#vote}

스테이커는 누구나 보유한 지분으로 투표할 수 있습니다. 빌더 지갑 하나로는 33.4% 정족수에 도달할 수 없으므로, 테스트넷 검증인과 위임자에게 제안을 알리고(그들이 읽는 것은 제안 요약입니다) 투표를 요청하세요. 투표는 다른 트랜잭션과 같은 하이브리드 서명 트랜잭션입니다.

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

옵션은 `yes`, `no`, `abstain`, `no_with_veto`입니다([거버넌스](/user-guide/governance) 참조). 집계와 시간을 지켜보세요.

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

투표가 끝나면 상태는 `PROPOSAL_STATUS_PASSED`(메시지가 실행됨), `PROPOSAL_STATUS_REJECTED`, 또는 `PROPOSAL_STATUS_FAILED`가 됩니다. **Failed**는 투표는 통과했지만 메시지 하나가 실행되지 못했다는 뜻이며, 이 경우 어떤 메시지도 적용되지 않습니다. `failed_reason`이 이유를 알려 줍니다. 예를 들어 제안 40은 제출 한 시간 뒤 `PASSED`를 보였습니다.

## 7단계: 체인에서 코드 검증 {#verify}

체인이 보유한 코드를 빌드한 체크섬과 비교하세요. 체인은 `data_hash`를 대문자로 보고하고 `sha256sum`은 소문자로 출력합니다.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

두 줄에서 같은 64자가 보여야 합니다. 더 강한 확인으로, 체인이 실제로 보유한 바이트를 해시하세요.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

코드 865에 대해 `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c`가 출력되었으며, 이는 Workshop 3 소스의 optimizer 빌드와 같은 체크섬입니다. 그다음 컨트랙트와, 제안 B 이후에는 허용 목록을 확인하세요.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

첫 응답에서 `code_id`가 사용자의 것이고 `admin`이 비어 있어야 하며, 두 번째 응답에서 `cosmwasm:qor1...` 대상과 그 고정(`code_id`, `"1"`인 `history_len`)이 보여야 합니다. 2026년 11월 22일에 목록에는 대상이 네 개 있었고, 네 번째는 `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8`의 `qday-receipts`로, 코드 865에 고정되어 있었습니다.

## 8단계: EVM 컨트랙트에서 호출 {#call}

EVM은 `0x0000000000000000000000000000000000000901`의 브리지를 `executeCrossVMCall(uint8,string,bytes)`로 호출합니다. 대상 VM `1`(Native), 문자열로서의 컨트랙트 주소, 바이트로서의 JSON 메시지입니다. Native 쪽은 호출하는 EVM 컨트랙트 자신의 `qor1...` 계정을 발신자로 보며, 어느 한쪽에서 되돌리면 양쪽이 모두 취소됩니다.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

두 가지 조건이 적용되며, 둘 다 [크로스 VM 레퍼런스](/developer-guide/cross-vm-reference#evm-to-wasm)에 설명되어 있습니다. 대상이 허용 목록에 있어야 하고(그리고 여전히 고정된 코드를 실행해야 하며), 트랜잭션을 보내는 계정에 `allowed_targets`가 `0x...0901`을 나열한 열린 [EVM 인가 윈도우](/developer-guide/evm-window-reference)가 있어야 합니다. Solidity 상점과 `qday-receipts` 컨트랙트를 사용한 완전하고 테스트된 예시는 [Workshop 3](/build-before-qday/workshop-3#part-2)을 따르세요.

## 문제 해결 {#troubleshooting}

| 보이는 내용 | 가능한 원인과 해결 |
| --- | --- |
| `tx wasm store`가 실패하거나 반영되지 않음 | 예상된 동작입니다. 테스트넷에서 계정은 업로드할 수 없으며, 서킷 브레이커와 `code_upload_access`가 모두 막습니다. 제안을 사용하세요. |
| 제안 상태가 `PROPOSAL_STATUS_FAILED` | 투표는 통과했지만 메시지 하나가 실패해서 아무것도 적용되지 않았습니다. `GET /cosmos/gov/v1/proposals/<id>`의 `failed_reason`을 읽으세요. 인스턴스화 메시지의 잘못된 `code_id`가 흔한 원인입니다. |
| `PROPOSAL_STATUS_REJECTED` | 찬성 표가 부족하거나 정족수가 없습니다. 더 명확한 요약으로 다시 제출하거나 검증인에게 투표를 요청하세요. |
| 상태가 `PROPOSAL_STATUS_DEPOSIT_PERIOD`에 머묾 | 총 보증금이 최소액보다 적습니다(일반 10 QOR, 신속 50 QOR). 2일 안에 `tx gov deposit`으로 더 추가하세요. |
| `pqc` 영역의 코드 20으로 제출 실패 | 트랜잭션에 하이브리드 서명이 없었습니다. `--generate-only`와 `tx pqc cosign`을 사용하세요. |
| 가스 부족으로 제출 실패 | 제안이 큽니다. `--gas`를 올리고 수수료는 최소 가스에 0.1 uqor를 곱한 값으로 유지하세요. |
| 체크섬이 `data_hash`와 다름 | 다른 종류의 컴퓨터나 다른 optimizer 버전에서 빌드했습니다. 제안 요약에 명시된 이미지로 다시 빌드하세요(arm64와 x86 이미지는 다른 바이트를 만듭니다). |
| `cross-VM bridge call refused: target ... is not allowlisted`와 함께 EVM 호출이 되돌려짐 | 컨트랙트가 `bridge_allowed_targets`에 없거나, 고정된 이후 코드가 바뀌었습니다. 실시간 파라미터를 사용자의 고정과 비교하세요. |
| EVM 호출이 브리지에 닿기 전에 거부됨 | `0x0901`을 나열한 열린 EVM 윈도우가 없습니다. 먼저 하나 여세요. |
| `MsgCrossVMCall`이 거부됨 | 호출이 서킷 브레이커 목록에서 일시 중지되었을 수 있습니다. `GET /cosmos/circuit/v1/disable_list`를 읽으세요. |
| 제안 B가 실패함 | 파라미터 집합이 불완전하거나 고정이 틀렸습니다. 실시간 응답의 모든 필드가 있는지, `history_len`이 이력 항목 수와 같은지 확인하세요. |

## 관련 페이지 {#related}

* 투표, 보증금, 제안 유형은 [거버넌스](/user-guide/governance)를 참조하세요.
* 컨트랙트 수명 주기와 쿼리는 [QoreChain Native 개발](/developer-guide/cosmwasm-development)을 참조하세요.
* `gov`와 `pqc cosign`의 정확한 플래그는 [트랜잭션 명령](/cli-reference/transaction-commands#submit-proposal)을 참조하세요.
* 파라미터, 큐, 호출 예시는 [크로스 VM 레퍼런스](/developer-guide/cross-vm-reference)를 참조하세요.
* 실제 크로스 VM 예시는 [Workshop 3](/build-before-qday/workshop-3)을 참조하세요.
