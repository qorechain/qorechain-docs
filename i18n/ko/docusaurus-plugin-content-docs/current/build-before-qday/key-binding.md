---
slug: /build-before-qday/key-binding
title: "양자 내성 키가 내 계정에 연결되는 방식"
sidebar_label: "키 연결"
sidebar_position: 3
---

# 양자 내성 키가 내 계정에 연결되는 방식

이 섹션의 모든 튜토리얼은 일반 계정 키와 함께 **양자 내성 키**를 사용합니다. 이 페이지는 그 키가 어디에서 만들어지는지, 체인이 그 키가 내 계정의 것임을 어떻게 알게 되는지, 그리고 직접 확인하는 방법을 쉬운 말로 설명합니다. 읽기만 할 때는 아무것도 실행할 필요가 없습니다. [직접 확인하기](#check)의 확인 작업은 약 5분이 걸립니다.

## 그림으로 보는 핵심 개념 {#picture}

```text
복구 문구 (또는 복구 코드)
        |
        v
두 키를 함께 파생
  - 기존 방식 키 (secp256k1)
  - 양자 내성 키 (ML-DSA-87), 계정 주소에 연결
        |
        v
소유 증명과 함께 한 번 등록
        |
        v
모든 트랜잭션을 하이브리드 서명 (두 키 모두)
        |
        v
검증자가 두 서명을 모두 검증
```

## 이 페이지에서 쓰는 용어 {#words}

| 용어 | 의미 |
| --- | --- |
| 기존 방식 키 | 일반 계정 키(secp256k1)입니다. 이런 종류의 모든 블록체인에서 트랜잭션에 서명합니다. |
| ML-DSA-87 키 | 양자 내성 서명 키입니다. 미래의 양자 컴퓨터도 이 키를 깨지 못할 것으로 예상됩니다. |
| 복구 문구(니모닉) | 계정을 복원하는 12개 또는 24개의 단어입니다. |
| 복구 코드 | `QRC1`로 시작하는 한 줄입니다. 계정이 원시 개인 키에서 만들어졌을 때 양자 내성 키를 위해 복구 문구를 대신합니다. |
| 등록 | 어떤 ML-DSA-87 키가 내 계정에 속하는지 체인에 알려 주는 트랜잭션 하나입니다. |
| 소유 증명 | 등록하는 키의 비밀 절반을 실제로 가지고 있음을 보여 주는 서명입니다. |
| 하이브리드 서명 | 하나의 트랜잭션에 붙는 두 개의 서명입니다. |

## 1. 새로 만들지 않고 파생합니다 {#derive}

양자 내성 키는 무작위로 뽑아서 잃어버릴 수 있는 파일에 보관하지 않습니다. 키는 **파생**됩니다. 같은 입력이면 항상 같은 키가 나옵니다.

- **복구 문구가 있을 때.** ML-DSA-87 키는 기존 방식 키와 **같은 복구 문구**, 그리고 계정 주소로부터 만들어집니다. 기존 방식 키와 양자 내성 키가 모두 그 문구에서 다시 만들어지므로 **백업 하나로 둘 다 복원**됩니다. QoreX와 SDK의 통합 계정이 이렇게 동작합니다.
- **원시 개인 키만 있을 때.** 개인 키 하나로는 두 번째 키를 만들 수 없습니다. 이때 양자 내성 키는 `QRC1`로 시작하는 별도의 **복구 코드**로 만듭니다. 워크숍 1 프로젝트에서는 `pnpm window recovery-code`로 만들고, SDK에서는 `generatePqcRecoveryCode()`입니다.

복구 코드에 대한 세 가지 규칙입니다.

1. 개인 키와 **따로** 보관하세요. 둘이 한곳에 있으면 한 번의 도난으로 둘 다 털립니다.
2. 같은 계정에는 항상 **같은** 코드를 다시 사용하세요.
3. **다른 코드는 다른 키를 만듭니다.** 그러면 체인은 등록한 키와 맞지 않는 키를 보게 됩니다.

:::caution 복구 코드는 다시 만들 수 없습니다
잃어버린 복구 코드를 되찾을 방법은 없습니다. 만들 때 종이에 적어 두세요. 한 번 쓰고 버리는 테스트넷 계정은 예외입니다. 1분이면 새 계정을 만들 수 있습니다.
:::

## 2. 소유 증명과 함께 한 번 연결합니다 {#bind}

연결은 계정당 한 번 보내는 `MsgRegisterPQCKeyV2`라는 트랜잭션 하나입니다. 여기에는 다음이 들어 있습니다.

- ML-DSA-87 **공개 키**(2,592바이트)
- **소유 증명**: 키가 체인과 내 계정을 지목하는 짧은 텍스트에 서명합니다. 가지고 있지 않은 키는 아무도 연결할 수 없고, 다른 체인의 연결을 복사해 올 수도 없습니다.

이 메시지는 체인이 **기존 방식 서명만**으로 받아 주는 유일한 메시지입니다. 이유는 간단합니다. 이 메시지 이전에는 체인에 내 계정의 양자 내성 키 기록이 없어서, 두 번째 서명을 대조할 대상이 없기 때문입니다.

연결하는 방법입니다.

| 위치 | 방법 |
| --- | --- |
| QoreX | 첫 전송 때 자동으로 합니다. 일회성 수수료 약 0.09 QOR가 듭니다. |
| 워크숍 1과 예제 앱 | `pnpm window register` ([워크숍 1 가이드](/build-before-qday/workshop-1#step-5)의 단계 5). |
| 직접 작성한 코드 | SDK의 `ensurePqcRegistered`. |

`ensurePqcRegistered`는 다시 호출해도 안전합니다. 먼저 계정을 읽습니다. 내 키가 이미 연결되어 있으면 아무것도 보내지 않습니다. **다른** 키가 연결되어 있으면 `PqcKeyMismatchError`와 함께 멈추고 아무것도 보내지 않습니다. 두 번째 등록을 직접 보내면 체인은 이를 거부하면서도 **수수료는 가져가므로**, 확인은 이 도우미에게 맡기세요.

:::note 현재 체인이 요구하는 것
체인은 소유 증명이 있으면 항상 검사하고, 검증되지 않으면 등록을 거부합니다. SDK와 QoreX는 증명을 자동으로 붙입니다. 메인넷에서는 증명이 없는 등록도 아직 받아 줍니다. 테스트넷에서는 v3.2.8 릴리스부터 새 계정의 첫 트랜잭션이 반드시 이 등록이어야 합니다. 자세한 내용: [양자 내성 서명](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. 연결 이후에는 모두 하이브리드입니다 {#hybrid}

그 이후 모든 네이티브 트랜잭션에는 두 개의 서명이 붙습니다.

- 기존 방식의 secp256k1 서명(64바이트)
- `PQCHybridSignature`라는 확장에 담긴 ML-DSA-87 서명(4,627바이트)

검증자는 **둘 다** 검증합니다. 검증이 끝나면 체인은 상태가 `verified`인 `pqc_hybrid_verify` 이벤트를 기록합니다.

등록된 키가 없으면 트랜잭션은 `account has no PQC key and classical fallback is disabled` 오류로 거부됩니다.

EVM 레인의 트랜잭션(예: 컨트랙트 배포)에는 한 가지가 더 필요합니다. 하이브리드 서명된 메시지로 여는 EVM 승인 윈도우입니다. [EVM 윈도우 레퍼런스](/developer-guide/evm-window-reference)를 참고하세요.

## 직접 확인하기 {#check}

`curl`이 필요합니다. `jq`는 선택 사항입니다. 둘 다 [시작하기 전에](/build-before-qday/prerequisites#curl-jq)에서 다룹니다.

### 내 키가 등록되어 있나요? {#check-account}

1. `qor1...`을 내 주소로 바꾸고 실행합니다.

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

하는 일: 공개 테스트넷 서버에 내 계정의 키 기록을 요청합니다.

파라미터:

- `curl`: 웹 주소의 내용을 가져오는 프로그램입니다.
- `-s`: 조용한 모드로, 진행 표시줄을 숨기고 응답만 보여 줍니다.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: 테스트넷 REST 주소 뒤에 내 계정을 붙인 것입니다.

**이렇게 보이면 정상입니다:** 등록된 계정이라면 다음과 같은 응답이 나옵니다(자리 표시자로 보여 드립니다. 실제 응답에는 진짜 값이 들어 있습니다).

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found`는 키가 연결되어 있으면 `true`, 아니면 `false`입니다. `possession_proven`은 키가 검증된 소유 증명과 함께 등록되었을 때 `true`입니다.

### 내 트랜잭션이 하이브리드로 서명되었나요? {#check-tx}

워크숍 1, 단계 6에서 한 확인과 같습니다.

1. `<HASH>`를 내 트랜잭션의 해시로 바꾸고(`<`와 `>`는 빼고) 실행합니다.

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

하는 일: 공개 테스트넷 서버에 내 트랜잭션의 전체 기록을 요청합니다.

**이렇게 보이면 정상입니다:** 긴 텍스트 덩어리가 나옵니다. 세 가지를 찾아보세요.

1. `tx_response` 안의 `"code": 0`. 코드 0은 성공을 뜻합니다.
2. ML-DSA-87 서명을 담은 `PQCHybridSignature` 확장: 64바이트 secp256k1 서명 옆에 **4,627바이트**가 있습니다.
3. `events` 안에서 `status` 속성이 `verified`인 `pqc_hybrid_verify` 타입의 이벤트.

2. 그 이벤트만 출력하려면(`jq` 필요):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

하는 일: 같은 기록을 가져와 `jq`로 넘기고, `jq`가 검증 이벤트만 남깁니다.

**이렇게 보이면 정상입니다:** `status` 속성이 `verified`인 이벤트 하나.

## 관련 키와 변경 {#related}

- **암호화 키.** [QoreSeal](/developer-tools/qoreseal)이 계정에 데이터를 암호화해서 보낼 때 쓰는 ML-KEM-1024 키는 **별도의 레지스트리**에 있습니다. 하이브리드 서명된 트랜잭션으로 `MsgRegisterKEMKey`를 보내 공개하므로, 계정에는 이미 ML-DSA-87 키가 있어야 합니다.
- **서명 키 변경.** `MsgRotatePQCKey`는 ML-DSA-87 키를 같은 종류의 새 키로 바꿉니다. 예를 들어 유출된 키를 폐기할 때 씁니다. `MsgMigratePQCKey`는 알고리즘 사이를 옮깁니다. 둘 다 이전 키와 새 키의 서명이 필요하고, 체인은 계정이 전에 쓴 키를 거부합니다. 둘 다 메인넷과 테스트넷에서 사용할 수 있습니다. 전체 규칙: [양자 내성 서명](/developer-guide/post-quantum-signing).

## 문제 해결 {#troubleshooting}

| 보이는 증상 | 원인 | 해결 방법 |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | 계정이 아직 ML-DSA-87 키를 등록하지 않았습니다. | 먼저 등록하세요(`pnpm window register`, QoreX 첫 전송 또는 `ensurePqcRegistered`). 그런 다음 다시 보냅니다. 위의 계정 조회로 확인하세요. |
| `PqcKeyMismatchError`, 또는 `pnpm window status`의 `registered, but NOT this key` | 다른 키가 이미 연결되어 있습니다. 처음과 다른 복구 코드나 문구를 사용했습니다. | 원래의 복구 코드나 문구로 되돌리세요. 쓰고 버리는 계정이라면 새 계정으로 다시 시작하세요. |
| 이미 등록되어 있다며 등록이 거부됨 | 계정에 이미 키가 있습니다. 원시 두 번째 등록은 수수료를 가져갑니다. | 아무것도 하지 마세요. 위의 조회로 계정을 읽거나, 먼저 확인하는 `ensurePqcRegistered`를 사용하세요. |
| 복구 코드를 잃어버림 | 개인 키로는 다시 만들 수 없습니다. | 계정이 복구 문구에서 만들어졌다면 같은 문구를 사용하세요. 같은 키가 나옵니다. 그렇지 않으면 새 계정을 사용하세요. 테스트넷에서는 비용이 들지 않습니다. |
| 수수료나 잔액 메시지와 함께 등록이 실패함 | 계정의 QOR가 수수료(약 0.09 QOR)에 부족하거나, 수수료가 가스 단위당 0.1 uqor인 네트워크 최저선보다 낮습니다. | [페이셋](https://dashboard.qorechain.io/faucet)에서 QOR를 받고, 수동 등록에는 가스를 약 600,000으로 설정한 뒤 다시 시도하세요. |
| 등록했는데 `found`가 `false`임 | 잘못된 네트워크나 잘못된 주소로 조회하고 있습니다. | 테스트넷에는 `api-testnet.qore.host`를, 주소는 내 `qor1...`을 쓰고 있는지 확인하세요. 지갑이 프로젝트와 다른 네트워크를 보여 줄 수 있습니다. |
| 계정이 `found: true`로 답하는데 트랜잭션이 실패함 | 체인에 있는 키가 프로젝트가 파생하는 키와 다릅니다. | `pnpm window status`를 실행해 `.env`의 복구 코드와 비교하세요. |

## 다음 단계 {#next}

[워크숍 1 가이드](/build-before-qday/workshop-1#step-5)로 돌아가 키를 등록하거나, [개요](/build-before-qday/overview)를 읽어 보세요.
