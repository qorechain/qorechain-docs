---
slug: /developer-guide/cross-vm-reference
title: 크로스 VM 호출 레퍼런스 (v3.2.8)
sidebar_label: 크로스 VM 레퍼런스
sidebar_position: 9
---

# 크로스 VM 호출 레퍼런스 (v3.2.8)

크로스 VM 호출은 한 가상 머신의 코드가 다른 가상 머신의 컨트랙트를 실행하게 하는 기능입니다. 계정이나 QoreChain Native 컨트랙트가 EVM 컨트랙트를 호출하는 경우, 계정이 QoreChain Native(CosmWasm) 컨트랙트를 호출하는 경우, Solidity 컨트랙트가 QoreChain Native 컨트랙트를 호출하는 경우 등이 있습니다. 호출 방식은 두 가지입니다. **동기(synchronous)** 호출은 사용자의 트랜잭션 안에서 실행되어 응답을 바로 돌려줍니다. **비동기(asynchronous)** 호출은 큐에 넣어 두었다가 이후 블록에서 실행됩니다.

이 페이지는 릴리스 v3.2.8의 필드, 비용, 제한을 정리한 레퍼런스이며 방향별 실행 예시를 담고 있습니다. 개념, 수명 주기, 이전 동작은 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)에, SDK 안내는 [크로스 VM 가이드](/sdk/guides/cross-vm)에 있습니다.

:::note v3.2.8이 실행되는 곳
**`qorechain-diana`** 테스트넷은 2026년 11월 12일부터 **v3.2.8**을 실행하고 있습니다. **`qorechain-vladi`** 메인넷은 아직 이를 적용하지 않았으며, 메인넷에서는 `MsgCrossVMCall`이 꺼져 있습니다. 아래에서 "v3.2.8"로 표시된 내용은 현재로서는 모두 테스트넷의 동작입니다.
:::

:::caution 호출 메시지를 지금 사용할 수 있나요?
테스트넷에서 `MsgCrossVMCall`은 업그레이드로 일시 중지되어 있었습니다. 거버넌스 제안 37이 통과되어 중지가 해제되었으므로 테스트넷에서는 호출이 열려 있습니다(2026년 11월 12일 확인: 서킷 브레이커 목록에는 `/cosmwasm.wasm.v1.MsgStoreCode`만 들어 있습니다). 메인넷에서는 계속 꺼져 있습니다. 특정 시점에 호출을 사용할 수 있는지는 모듈 파라미터(`enabled`)와 서킷 브레이커 목록 두 가지로 확인합니다. 무언가를 구축하기 전에 둘 다 확인하세요.

```bash
# Module parameters: look for "enabled": true
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params

# Circuit breaker list: the call is paused while this contains /qorechain.crossvm.v1.MsgCrossVMCall
curl -s https://api-testnet.qore.host/cosmos/circuit/v1/disable_list
```

목록 경로는 REST에서 `disable_list`로 표기합니다(`disabled_list` 표기는 `501`로 응답합니다). 노드에서 같은 일을 하는 명령줄은 `qorechaind query circuit disabled-list`입니다. 호출이 중지되면 이를 담은 트랜잭션은 거부되고, 큐에 있는 호출은 중지가 먼저 해제되지 않는 한 시간 초과가 될 때까지 대기 상태로 남습니다. 제안 37이 통과되기 전에는 목록에 `/qorechain.crossvm.v1.MsgCrossVMCall`이 들어 있었지만, 테스트넷에서는 더 이상 없습니다. 실제로 전송한 내용은 [테스트넷에서 검증한 내용](#tested)을 참조하세요.
:::

## 왜 중요한가 {#why}

- **비용을 예측할 수 있습니다.** QoreChain Native로 가는 큐 호출은 가격이 미리 표시됩니다. 컨트랙트가 사용할 수 있는 작업량과 받아들일 최대 혼잡 계수를 직접 정하고, 대금은 에스크로에 보관되며, 호출이 쓰지 않은 분량은 돌려받습니다.
- **한 계정이 다른 계정을 밀어낼 수 없습니다.** 발신자는 한 번에 큐 호출을 최대 100개까지만 가질 수 있어서 공유 큐를 계속 사용할 수 있습니다.
- **실패한 호출도 공짜가 아닙니다.** 실패한 호출도 모든 방향에서 수행한 작업의 비용을 치르므로, 실패를 잡아서 같은 가스로 다시 시도하는 방식은 통하지 않습니다.
- **EVM 쪽은 사용자의 윈도우 안에 머뭅니다.** 사용자가 직접 서명하지 않은 EVM 호출과 `0x0901`의 EVM 브리지는 열려 있는 [EVM 인가 윈도우](/developer-guide/evm-window-reference)가 있어야만 허용됩니다.

## 동기 호출과 비동기 호출 {#sync-async}

| | 동기(기본값) | 비동기(`async = true`) |
| --- | --- | --- |
| 실행 시점 | 사용자의 트랜잭션 안 | 이후 블록의 끝, 큐에서 |
| 가스 | 트랜잭션 자체의 가스 | 정해진 선불 예산([비용](#cost) 참조) |
| 응답 | 트랜잭션 응답의 `data` 필드로 반환 | 반환되지 않음. 완료된 메시지를 id로 조회 |
| 대상이 실패하면 | 트랜잭션 전체가 취소됨 | 해당 호출만 `failed`로 기록되고 트랜잭션은 유지됨 |
| 자금 | QoreChain Native 대상에는 `funds`를 첨부할 수 있음 | 동일. 자금을 전달할 수 없는 레인으로 가는 자금 첨부 비동기 호출은 제출 시점에 거부됨 |
| 적합한 용도 | 결과가 지금 필요한 모든 작업 | 보내 놓고 잊어도 되는 작업, 가스 상한을 두고 싶은 호출 |

큐에 있는 메시지는 `pending`을 거쳐 `executed`, `failed`, `timed_out` 중 하나가 됩니다. `queue_timeout_blocks`(테스트넷에서는 100) 후에 시간 초과가 됩니다. 큐는 오래된 것부터 실행되며, 블록 끝 단계에서는 블록당 최대 50개의 호출을 실행합니다.

### 누가 누구를 호출하는가, 동기 또는 비동기 {#who-calls-whom}

두 모드 중 어느 쪽을 쓸 수 있는지는 호출을 누가 보내는지에 따라 달라집니다.

| 호출자 | 대상 | 동기 | 비동기 |
| --- | --- | --- | --- |
| 계정(트랜잭션에 서명) | EVM, QoreChain Native | 예(기본값) | 예 |
| QoreChain Native 컨트랙트, `MsgCrossVMCall`을 자기 자신으로 디스패치 | EVM | 예(`async`가 false, 기본값) | 예 |
| QoreChain Native 컨트랙트, `MsgCrossVMCall`을 자기 자신으로 디스패치 | QoreChain Native | 거부됨(자기 레인) | 거부됨(자기 레인) |
| `0x0901`의 EVM 브리지가 호출한 컨트랙트(브리지 아래) | SVM | 예 | 사용하지 않음 |
| `0x0901`의 EVM 브리지가 호출한 컨트랙트(브리지 아래) | EVM | 사용하지 않음 | 예 |

`MsgCrossVMCall`을 자기 자신으로 디스패치하는 QoreChain Native 컨트랙트는 어느 모드로든 EVM을 호출할 수 있습니다. 동기(`async`가 false, 기본값)는 트랜잭션 자체의 가스로 실행되고, 응답은 `MsgCrossVMCallResponse.data`로 돌아오며, 실패하면 트랜잭션 전체가 되돌려집니다. 비동기는 호출을 큐에 넣습니다. 두 방식 모두 이전에 테스트넷에서 실행했습니다. 동기 호출은 높이 9,795,779에서, 비동기 호출은 높이 9,795,783에서 실행했습니다.

"SVM에는 동기, EVM에는 비동기"라는 표현은 `0x0901` 브리지 아래에서만 적용됩니다. EVM 브리지가 호출한 컨트랙트가 디스패치하는 것은 SVM에는 동기로, EVM에는 비동기로 갈 수 있다는 뜻입니다. 자기 자신으로 동작하는 컨트랙트에 대한 규칙이 아니며, 그 컨트랙트는 EVM에 대해 어느 모드든 사용할 수 있습니다.

## MsgCrossVMCall 필드 {#fields}

타입 URL은 `/qorechain.crossvm.v1.MsgCrossVMCall`입니다.

| 필드 | 번호 | 의미 |
| ----- | ------ | ------- |
| `sender` | 1 | 사용자의 `qor1...` 주소. 이 주소가 메시지에 서명합니다. |
| `source_vm` | 2 | 체인이 무시합니다. 체인이 호출의 출처를 직접 판단합니다. 이전 노드가 메시지를 받아들이도록 여전히 보내기는 합니다. |
| `target_vm` | 3 | `evm`, `cosmwasm`, `svm` 중 하나. 자기 레인으로의 호출은 거부됩니다. SVM 레인은 제안 37 이후 테스트넷에서 열려 있고 메인넷에서는 꺼져 있습니다. [SVM 레인](/developer-guide/svm-lane-v328)을 참조하세요. 이 페이지를 위해 SVM으로 보내는 호출은 실행하지 않았습니다. |
| `target_contract` | 4 | EVM 주소(`0x`와 16진수 40자리, 프리컴파일 주소 제외) 또는 `qor1...` 컨트랙트 주소. |
| `payload` | 5 | 호출 데이터. EVM에는 ABI 인코딩, QoreChain Native에는 UTF-8 JSON execute 메시지. 최대 `max_message_size` 바이트(65,536). |
| `funds` | 6 | 첨부할 코인(QoreChain Native 대상만). |
| `async` | 7 | `true`이면 호출을 큐에 넣고, `false`(기본값)이면 지금 실행합니다. |
| `async_gas_limit` | 8 | v3.2.8, QoreChain Native로 가는 비동기 호출에만 해당. 큐에 들어간 호출이 실행에 쓰는 컨트랙트 가스 단위. `0` 또는 미설정이면 500,000. 250,000부터 큐가 한 블록에서 실행할 수 있는 최대치(기본 예산에서 1,875,000)까지 허용됩니다. |
| `async_max_factor` | 9 | v3.2.8, QoreChain Native로 가는 비동기 호출에만 해당. 지불할 의향이 있는 최대 혼잡 계수이며 **백만분율** 단위입니다. `1000000`이 1배이고 `4000000`이 4배입니다. 유효 범위는 1,000,000부터 100,000,000(1배에서 100배)까지이며, `4` 같은 단순 배수는 아무것도 실행되기 전에 코드스페이스 `crossvm` 코드 2로 거부됩니다. `0` 또는 미설정이면 제출 시점 계수의 4배(계수가 1배일 때 4,000,000 백만분율)이며 체인 최댓값으로 제한됩니다. 현재 적용 중인 계수보다 낮은 값은 제출 시점에 거부됩니다. |

명령줄에서 새 필드 두 개는 `--async-gas-limit`(정수)와 `--async-max-factor`(`2.5` 같은 소수)입니다. 명령이 소수를 백만분율로 바꿔 줍니다. 원시 메시지, SDK, REST 또는 JSON 형식에서는 값이 항상 백만분율입니다. 2.5배는 `2500000`입니다. SDK는 배수를 백만분율로 변환하는 `CROSSVM_ASYNC_FACTOR_ONE`(1,000,000)과 전송 전에 두 값을 확인하는 `validateCrossVmAsyncGas`를 내보냅니다.

## 비용, 에스크로, 환불 {#cost}

**QoreChain Native로 가는 비동기 호출**(v3.2.8)은 다음과 같습니다.

1. **에스크로.** 선불 금액은 단위 수 곱하기 계수 곱하기 가스 가격이며, 지출되지 않고 보관됩니다. 기본값에서는 500,000 단위 x 4(백만분율로 4,000,000) x 0.1 uqor = 200,000 uqor, 즉 **0.2 QOR**입니다. 이 금액이 사용자의 잔액에서 `crossvm_async_escrow` 계정으로 이동합니다. 그만큼의 사용 가능한 uqor가 필요합니다. 잠긴 베스팅 코인, 수수료 보조(fee grant), 다른 토큰으로 낸 수수료로는 충당할 수 없으며, 그런 호출은 거부됩니다.
2. **큐 슬롯 수수료.** 모든 비동기 호출은 제출 시점에 가스로 슬롯 수수료도 냅니다. 빈 큐에서는 500,000 가스이고, 큐가 찰수록 올라가 가득 찬 큐에서는 2,000,000 가스입니다. 가스 가격 0.1 uqor 기준으로 0.05 QOR에서 0.2 QOR입니다.
3. **정산.** 호출이 끝나면 그 시점의 계수로 계산한 사용 가스가 에스크로에서 수수료로 지급되고 나머지는 사용자에게 돌아옵니다. 실패한 호출은 사용한 만큼을 냅니다. 시간 초과가 되었거나 실행되지 않은 호출은 에스크로 전액을 돌려받고, 슬롯 수수료가 처리 수수료가 됩니다. `crossvm_escrow_settled` 이벤트에 수수료와 환불액이 담깁니다.
4. **계수 대기.** 호출은 혼잡 계수가 사용자의 `async_max_factor` 이하인 동안 실행됩니다. 계수가 더 높으면 대기하고, 높은 상태가 계속되면 시간 초과가 됩니다. 기본값(제출 시점 계수의 4배, 계수가 1배일 때 백만분율로 4,000,000)에서는 계수가 4배보다 더 올라야 호출이 대기합니다.
5. **크기 제한.** 선불 금액은 50,000,000 가스를 넘을 수 없습니다. 이를 넘으면 호출이 제출 시점에 거부됩니다. 나중에 다시 시도하거나 `async_gas_limit`를 낮추세요.

**EVM으로 가는 비동기 호출**의 선불 예산은 1,000,000 가스이며 제출 시점에 청구됩니다. **동기** 호출의 비용은 트랜잭션 자체의 가스입니다. 큰 코드를 불러오는 무거운 QoreChain Native 컨트랙트는 한 블록에서의 첫 호출 때 기본값보다 높은 `async_gas_limit`와 `async_max_factor`가 필요합니다.

### 실패한 호출도 비용이 청구됩니다 {#failed-charged}

실패한 크로스 VM 호출도 수행한 작업의 비용을 냅니다. 되돌려지거나 가스가 소진된 EVM 호출은 소비한 EVM 가스를 호출자에게서 가져가고, `0x0901` 브리지를 통해 이루어진 QoreChain Native 호출이 실패하면 컨트랙트가 쓴 가스를 호출한 EVM 프레임에서 가져갑니다. 비용이 큰 호출 대상이 실패해도 살아남고 싶은 컨트랙트는 남은 가스로 재시도하지 말고 하위 호출에 가스 한도를 두어야 합니다.

## 대기 큐 {#pending}

- **발신자당 최대 100개의 대기 호출**(`max_pending_per_sender`). 그 이상의 비동기 호출은 내 호출 중 하나가 실행되거나 시간 초과가 될 때까지 `ErrQueueFull`(코드스페이스 `crossvm`, 코드 4)로 거부됩니다. 동기 호출에는 영향이 없습니다.
- **전체 큐는 최대 `max_queue_size`개의 호출**(1,000)을 담습니다.
- **대기 목록은 페이지로 나뉩니다.** 한 페이지에는 최대 100개의 메시지가 담기며, 목록의 각 페이로드는 앞쪽 **1,024바이트**로 잘립니다(`payload_hex`). 전체 페이로드를 읽으려면 id로 메시지를 가져오세요.
- **페이지 한도는 보정됩니다.** `pagination.limit`이 0이거나 100을 넘으면 조용히 100으로 보정됩니다. `limit=101` 요청은 오류가 아니라 최대 100개 항목과 함께 `200`으로 응답합니다. 더 읽으려면 응답의 `next_key`를 전달하고 비어 있을 때까지 계속하세요.

```bash
# One page of pending calls (use the next key from the response for the next page)
curl -s "https://api-testnet.qore.host/qorechain/crossvm/v1/pending?pagination.limit=100"

# A message by id, with its whole payload
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/message/<id>
```

2026년 11월 12일 테스트넷에서 확인했습니다. 대기 경로는 `{"messages":[],"count":0,"pagination":{"next_key":null,"total":"0"}}`(큐가 비어 있음)와 함께 `200`으로 응답했고, 메시지 경로는 존재하지 않는 id에 대해 `{"message":null,"found":false}`와 함께 `200`으로 응답했습니다. Linux 노드 CLI에서의 같은 조회는 다음과 같습니다.

```bash
qorechaind query crossvm pending
qorechaind query crossvm message <id>
```

:::note 노드 CLI
`qorechaind`는 Linux 노드 CLI입니다. 패키지된 macOS 바이너리는 없습니다. REST 호출은 어떤 컴퓨터에서든 동작합니다.
:::

## 모듈 파라미터 {#params}

```bash
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

2026년 11월 12일에 다음 필드와 함께 `200`으로 응답했습니다.

| 필드 | 읽은 값 | 의미 |
| ----- | ---------- | ------- |
| `enabled` | `true` | 모듈 스위치. 호출 메시지는 서킷 브레이커 목록에 자체 항목이 있습니다. |
| `max_message_size` | `65536` | 페이로드의 최대 바이트 수. |
| `max_queue_size` | `1000` | 한 번에 큐에 넣을 수 있는 최대 호출 수. |
| `queue_timeout_blocks` | `100` | 실행되지 않은 호출이 시간 초과되기까지의 블록 수. |
| `bridge_allowed_targets` | `cosmwasm:qor1...` 항목 세 개 | `0x0901` 브리지가 호출할 수 있는 QoreChain Native 컨트랙트. 비어 있으면 브리지가 닫힌 상태입니다. |
| `bridge_target_pins` | 대상마다 한 항목: `target`, `code_id`, `history_len` | 브리지가 호출하려면 허용된 각 대상이 계속 실행하고 있어야 하는 코드. |
| `max_pending_per_sender` | `100` | 한 발신자가 가질 수 있는 큐 호출 수. |
| `max_cosmos_tx_gas` | `"50000000"` | Native 트랜잭션 하나가 선언할 수 있는 최대 가스. |
| `record_retention_blocks` | `"100000"` | 끝난 큐 호출의 기록이 보관되는 기간. |
| `max_block_wasm_gas` | `"3000000"` | 한 블록이 사용할 수 있는 QoreChain Native 실행량. |
| `max_tx_wasm_share_bps` | `5000` | 트랜잭션 하나가 사용할 수 있는 해당 예산의 비율. |
| `max_block_level_wasm_gas` | `"10000000"` | 트랜잭션 밖에서 이루어지는 컨트랙트 작업의 예산. |
| `queue_wasm_reserve_bps` | `2500` | 큐 몫으로 따로 확보된 블록 예산의 비율. |
| `wasm_congestion_max_factor` | `20` | 혼잡 계수가 도달할 수 있는 최댓값. |
| `wasm_congestion_target_bps` | `5000` | 이를 넘으면 계수가 오르는 사용 비율. |
| `wasm_congestion_factor_micro` | `"1000000"` | 현재 적용 중인 계수(백만분율, `1000000`이 1배). |
| `max_block_upload_bps` | `5000` | 코드 업로드가 사용할 수 있는 예산의 비율. |
| `max_queue_timeouts_per_block` | `100` | 블록당 시간 초과 처리되는 호출 수. |

큐 호출이 지금 얼마를 선불해야 하는지는 `wasm_congestion_factor_micro`로 확인합니다. 단위 수 x 계수 x 0.1 uqor입니다.

## 방향별 예시 {#examples}

모든 예시는 모든 Native 트랜잭션과 마찬가지로 계정의 포스트 퀀텀 키로 서명합니다. [양자내성 서명](/developer-guide/post-quantum-signing)을 참조하세요. 이 페이지를 위해 실제로 전송한 것은 Native 계정에서 QoreChain Native 컨트랙트로 가는 예시뿐이며([테스트넷에서 검증한 내용](#tested) 참조), EVM 예시는 실행하지 않았고 해당 위치에 UNTESTED로 표시했습니다.

### Native 계정에서 EVM 컨트랙트로 {#native-to-evm}

**UNTESTED:** 이 페이지를 위해 이 방향은 실행하지 않았습니다.

대상은 EVM 컨트랙트이며 페이로드는 ABI 인코딩된 호출 데이터입니다. 호출은 사용자 자신의 `0x` 주소로 실행되므로 EVM 쪽에서는 사용자가 `msg.sender`로 보입니다. 명령줄(Linux 노드 CLI)에서는 먼저 만든 뒤 포스트 퀀텀 서명을 추가합니다.

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload <hex of abi.encode(selector, args)> \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json

qorechaind tx pqc cosign call.json --from mykey --pqc-key mykey-mldsa \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

게시된 SDK(0.13.0)를 사용하는 TypeScript입니다. 헬퍼가 viem으로 호출을 ABI 인코딩합니다.

```ts
import { createClient, createCrossVMClient } from "@qorechain/sdk";

const client = createClient({ network: "testnet" });
const tx = await client.connectTx(signer, { pqcKeypair }); // hybrid signing
const xvm = createCrossVMClient(tx);

const { messageId, executed, data } = await xvm.call({
  targetVm: "evm",
  targetContract: "0xYourErc20",
  evm: { abi: erc20Abi, functionName: "transfer", args: ["0xRecipient", 1n] },
});
```

Python, Go, Rust, Java는 EVM에 대한 페이로드를 원시 바이트로 받습니다(고수준 ABI 인코딩은 TypeScript에서만 제공됩니다). Python:

```python
client.call(target_vm="evm", target_contract="0xYourErc20", payload=calldata_bytes)
```

Go:

```go
res, err := c.Call(crossvm.CallOptions{
    TargetVM:       crossvm.VMTypeEVM,
    TargetContract: "0xYourErc20",
    Payload:        calldata,
})
```

Rust:

```rust
let opts = CallOptions::new(VM_TYPE_EVM, "0xYourErc20", calldata_bytes);
let resp = cross_vm.call_with_responses(&opts).await?;
```

Java:

```java
CrossVMClient.CallOptions o = new CrossVMClient.CallOptions();
o.targetVm = CrossVMClient.VMType.EVM;
o.targetContract = "0xYourErc20";
o.payload = calldata;
client.call(o);
```

발신자가 트랜잭션에 서명한 계정이 아닌 경우, 예를 들어 authz 수혜자인 경우 EVM 쪽은 부여자의 윈도우 아래에서 실행됩니다. [Authz와 윈도우](#authz)를 참조하세요.

### Native 계정에서 QoreChain Native 컨트랙트로 {#native-to-wasm}

페이로드는 컨트랙트의 JSON execute 메시지입니다. 동기 호출은 컨트랙트의 응답을 `data`로 반환합니다.

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload $(printf '%s' '{"transfer":{"recipient":"qor1...","amount":"1"}}' | xxd -p -c 0) \
  --funds 100uqor \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 600000 --fees 60000uqor --generate-only > call.json
```

명시적인 가스 허용량과 계수 상한을 지정한 큐 호출입니다(v3.2.8). 계수가 1이면 에스크로는 800,000 x 2.5 x 0.1 uqor = 200,000 uqor(0.2 QOR)입니다(명령이 `2.5`를 받아 2,500,000 백만분율로 전송합니다).

```bash
qorechaind tx crossvm call cosmwasm qor1...contract \
  --payload <hex of the execute message> --async \
  --async-gas-limit 800000 --async-max-factor 2.5 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > call.json
```

SDK 0.13.0을 사용하는 TypeScript입니다(동기, 그리고 기본 허용량의 큐 호출).

```ts
const sync = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
});

const queued = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true, // default allowance: 500,000 units, 4x factor (4,000,000 millionths)
});

// SDK 0.14.0: explicit allowance. The factor is in millionths: 6x is 6_000_000.
const tuned = await xvm.call({
  targetVm: "cosmwasm",
  targetContract: "qor1...contract",
  cosmwasm: { transfer: { recipient: "qor1...", amount: "1" } },
  async: true,
  asyncGasLimit: 800_000,
  asyncMaxFactor: 6_000_000,
});
```

Python(`async_=True`), Go(`Async: true`), Rust(`.queue(true)`), Java(`o.async = true`)도 같은 방식으로 큐에 넣습니다.

```python
client.call(target_vm="cosmwasm", target_contract="qor1...contract",
            cosmwasm={"transfer": {"recipient": "qor1...", "amount": "1"}}, async_=True)
```

:::note 새 필드 두 개에 대한 SDK 지원
SDK 0.13.0에는 `async_gas_limit`나 `async_max_factor` 옵션이 없으므로 큐 호출은 기본값을 사용합니다. SDK 0.14.0은 크로스 VM 호출에 `asyncGasLimit`와 `asyncMaxFactor`를 추가하고, `CROSSVM_ASYNC_FACTOR_ONE`(1,000,000)과 `validateCrossVmAsyncGas`를 내보내며, `buildCall` 헬퍼가 Native 계정에 대해 `sourceVm`의 기본값을 `evm`으로 설정합니다. 체인은 `source_vm`을 무시하며 메시지를 `source_vm` native로 기록했습니다.
:::

### 0x0901을 통한 EVM 컨트랙트에서 QoreChain Native 컨트랙트로 {#evm-to-wasm}

**UNTESTED:** 이 페이지를 위해 이 방향은 실행하지 않았습니다.

Solidity 컨트랙트가 `0x0000000000000000000000000000000000000901`의 브리지 프리컴파일을 호출합니다. 호출은 EVM 트랜잭션 안에서 실행되며, 호출하는 계정 또는 컨트랙트(`qor1` 주소로)가 QoreChain Native 발신자가 되고, 어디서든 되돌림이 발생하면 양쪽이 모두 취소됩니다.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function callNative(string calldata contractAddr, bytes calldata executeMsg)
        external returns (bytes memory)
    {
        // targetVM 1 is QoreChain Native; executeMsg is the JSON execute message
        (bool ok, bytes memory ret) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
        return ret;
    }
}
```

브리지 규칙은 다음과 같습니다.

- 값이 없는 일반 `CALL`만 가능하며 셀렉터는 `0x3c11078c`입니다. `STATICCALL`, `DELEGATECALL`, 대상 VM `0` 또는 `2`는 되돌려집니다.
- 대상은 `bridge_allowed_targets`에 있어야 합니다(v3.2.8부터는 고정된 코드를 여전히 실행하고 있어야 합니다). 위의 파라미터 경로로 둘 다 읽을 수 있습니다.
- **호출자에게는 `0x0901`을 나열한 윈도우가 필요합니다.** 브리지로 트랜잭션을 보내는 모든 계정은 `allowed_targets`에 `0x0000000000000000000000000000000000000901`(그리고 컨트랙트를 거쳐 호출한다면 그 컨트랙트)이 포함된 열려 있는 [EVM 인가 윈도우](/developer-guide/evm-window-reference)가 있어야 합니다. 세션에 맞는 한도로 다음과 같이 엽니다.

```bash
qorechaind tx pqc open-evm-window 600 5 10qor \
  --allowed-targets 0x0000000000000000000000000000000000000901 \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

- 실패한 호출은 `Error(string)` 사유와 함께 되돌려지며 컨트랙트가 사용한 가스에 대한 비용이 청구됩니다.

`@qorechain/rdk` 헬퍼 `encodeCrossVmCalldata({ contract, msg })`는 TypeScript에서 같은 호출 데이터를 만듭니다([멀티 VM](/rollups/multi-vm) 참조). 게시된 SDK에서 프리컴파일 주소는 `@qorechain/evm`의 `PRECOMPILE_ADDRESSES.crossVmBridge`입니다.

### QoreChain Native 컨트랙트에서 EVM 컨트랙트로 {#wasm-to-evm}

문서 작성자는 **UNTESTED**입니다. 체인 팀은 v3.2.8 이전에 두 모드 모두 테스트넷에서 실행했다고 보고합니다.

QoreChain Native 컨트랙트는 자기 자신을 발신자로 하여 `MsgCrossVMCall`을 체인 메시지로 디스패치하는 방식으로 호출합니다. 메시지의 필드는 위와 같으며, 체인은 `source_vm`이 무엇이라고 하든 컨트랙트를 CosmWasm 호출자로 취급합니다. `async`가 false(기본값)이면 호출은 동기입니다. 트랜잭션의 가스로 실행되고, 응답은 `MsgCrossVMCallResponse.data`에 담기며, 실패하면 트랜잭션 전체가 되돌려집니다. `async`가 true이면 큐에 들어갑니다. [누가 누구를 호출하는가](#who-calls-whom)를 참조하세요. 아래 예시는 호출을 큐에 넣습니다.

```json
{
  "@type": "/qorechain.crossvm.v1.MsgCrossVMCall",
  "sender": "qor1...the contract...",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234567890123456789012345678901234567890",
  "payload": "<base64 of the ABI-encoded call>",
  "async": true
}
```

의존하기 전에 알아 둘 점은 다음과 같습니다.

- EVM은 컨트랙트를 32바이트 주소의 **마지막 20바이트**로 봅니다. EVM 컨트랙트가 `msg.sender`가 일반 계정이라는 점에 의존하지 않도록 하세요.
- v3.2.8부터는 호출자가 시작할 때보다 더 많은 네이티브 QOR를 보유하게 되는 호출은 실패하며 비용이 청구됩니다. 이 방향을 염두에 둔 EVM 컨트랙트는 `msg.sender`에게 네이티브 QOR를 지급하지 말고 ERC-20 토큰이나 호출에 명시된 20바이트 계정에 지급해야 합니다.
- 자기 자신으로 동작하는 컨트랙트는 EVM 윈도우의 제한을 받지 않습니다. 계정의 authz 부여 아래에서 디스패치된 호출은 제한을 받습니다. 아래를 참조하세요.
- `0x0901` 브리지 아래에서 `MsgCrossVMCall`은 자기 자신으로 동작하는 컨트랙트에서만 받아들여지며, 그곳의 authz `MsgExec`는 다른 계정의 호출을 담을 수 없습니다.

두 모드 모두 이전에 테스트넷에서 실행했습니다(동기는 높이 9,795,779, 비동기는 높이 9,795,783). 이 메시지를 디스패치하는 컨트랙트 쪽 Rust 코드는 이 페이지를 위해 실행하지 않았습니다.

## Authz와 윈도우 {#authz}

발신자가 직접 보내지 않은 EVM으로의 크로스 VM 호출은 **발신자의** EVM 윈도우 아래에서 실행됩니다. 발신자 자신의 코드가 다른 사람의 트랜잭션에서 동작하는 것과 똑같이 취급됩니다. 실제로는 authz 부여가 사용되는 경우입니다. 다른 사람이 사용자의 `MsgCrossVMCall` 부여를 사용해 EVM을 호출하면 다음과 같이 됩니다.

- **사용자의** 윈도우가 열려 있고 그 범위가 대상을 허용하는 경우에만 호출이 허용됩니다(`allowed_targets`, `native_only`, 가치를 이동시키는 프리컴파일).
- 성공한 호출마다 윈도우의 트랜잭션 횟수가 하나씩 사용되며, 그 안에서 잃은 네이티브 가치는 윈도우의 가치 한도에 합산됩니다.
- 사용 가능한 포스트 퀀텀 키와 활성 윈도우가 없으면 호출은 거부됩니다. 비동기 호출은 제출 시점과 큐가 실행할 때 다시 한 번 거부됩니다.
- 컨트랙트나 그룹 정책에는 윈도우가 없으므로, 그런 곳에서 온 authz 부여로는 EVM으로 가는 호출을 보낼 수 없습니다.
- QoreChain Native로 가는 호출은 윈도우의 제한을 받지 않습니다. `MsgCrossVMCall`의 일반적인 authz 부여는 수혜자에게 QoreChain Native 레인에서 사용자의 신원을 부여하므로, 계정을 맡길 수 있는 상대에게만 부여하세요.

authz 부여 아래의 ERC-20 토큰 변환(`MsgConvertERC20`)도 같은 방식으로 발신자의 윈도우가 허용 여부를 결정합니다.

## 제한과 오류 {#limits}

| 상황 | 결과 |
| --------- | ------ |
| 페이로드가 `max_message_size`보다 큼 | 거부됨, 코드 8(`message payload exceeds max size`) |
| 대상 주소 형태가 해당 레인에 맞지 않음 | 제출 시점에 거부됨, 코드 5(`invalid target contract address`) |
| 대상이 프리컴파일 주소(`0x...0000`부터 `0x...ffff`) | 제출 시점에 거부됨, 코드 5 |
| 대상 VM이 자기 레인과 같음 | 거부됨 |
| 알 수 없거나 지원되지 않는 VM | 코드 7(`unsupported VM type`) |
| 한 발신자의 큐 호출이 100개 초과 | 하나가 끝나거나 시간 초과가 될 때까지 `ErrQueueFull`, 코드 4 |
| 큐가 `max_queue_size`개의 호출을 담고 있음 | `ErrQueueFull`, 코드 4 |
| `async_max_factor`가 1,000,000에서 100,000,000(백만분율) 범위 밖, 예를 들어 `6000000` 대신 `6` | 아무것도 실행되기 전에 거부됨, 코드스페이스 `crossvm` 코드 2(`async_max_factor 6 is outside 1000000..100000000 (millionths)`) |
| `async_max_factor`가 현재 적용 중인 계수보다 낮음 | 제출 시점에 거부됨 |
| `async_gas_limit`가 250,000 미만이거나 큐의 블록당 여유분 초과 | 제출 시점에 거부됨 |
| 선불 금액이 50,000,000 가스 초과 | 제출 시점에 거부됨. 나중에 다시 시도하거나 한도를 낮추세요 |
| 사용 가능한 uqor가 에스크로보다 적음 | 거부됨(베스팅 잠금 코인, 수수료 보조, 다른 토큰 수수료로는 충당 불가) |
| 호출 차례가 왔을 때 혼잡 계수가 `async_max_factor`보다 높음 | 호출이 대기하며, `queue_timeout_blocks` 후에 시간 초과가 됨 |
| 호출이 시간 초과되었거나 실행되지 않음 | 에스크로 전액 환불, 슬롯 수수료는 처리 수수료로 유지 |
| 대상이 실패함 | `failed` 기록(비동기) 또는 트랜잭션 취소(동기). 사용한 가스는 청구됨 |
| EVM에서 컨트랙트 호출자(32바이트 발신자)에게 네이티브 QOR가 반환됨 | 호출이 실패하고 비용이 청구됨 |
| `0x0901`을 나열한 윈도우 없이 `0x0901` 호출 | 거부됨 |
| `0x0901` 대상이 `bridge_allowed_targets`에 없거나 고정된 이후 코드가 바뀜 | 되돌려짐. 목록에 없는 대상이면 `cross-VM bridge call refused: target ... is not allowlisted` |
| `MsgCrossVMCall`이 서킷 브레이커 목록에 있음 | 트랜잭션 거부됨. 큐에 있는 호출은 대기 상태로 남음 |
| SVM으로의 호출 | 레인은 제안 37 이후 테스트넷에서 열려 있고 메인넷에서는 꺼져 있음. 이 페이지를 위해 SVM으로 보내는 호출은 실행하지 않음(UNTESTED) |

실패한 큐 호출에 기록되는 오류는 소스 파일 주석이 없는 일반 텍스트입니다.

## 이벤트 {#events}

| 이벤트 | 속성 | 의미 |
| ----- | ---------- | ------- |
| `crossvm_request` | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | 호출이 제출됨 |
| `crossvm_response` | `message_id`, `status`, 실패한 호출의 경우 `error` | 큐 호출이 끝남 |
| `crossvm_timeout` | `message_id` | 큐 호출이 시간 초과됨 |
| `crossvm_escrow_settled` | 수수료와 환불액 | QoreChain Native로 가는 비동기 호출의 에스크로가 지급됨 |

## 테스트넷에서 검증한 내용 {#tested}

제안 37이 통과된 후인 2026년 11월 12일 `qorechain-diana`(릴리스 v3.2.8)에서 SDK 0.14.0(`createCrossVMClient(...).buildCall`, 하이브리드 서명, eth-native 계정)으로, 코드 859에서 인스턴스화한 거버넌스 저장 cw20 컨트랙트를 대상으로 실행했습니다. 페이로드는 `{"transfer":{"recipient":<self>,"amount":"1"}}`였습니다.

| 단계 | 결과 |
| ---- | ------ |
| 서킷 브레이커 목록 읽기 | `/cosmwasm.wasm.v1.MsgStoreCode`만 있음. 호출 메시지는 중지되지 않음 |
| 동기 Native에서 QoreChain Native로의 호출 | 시뮬레이션 601,178 가스, 시뮬레이션 값 x 1.3으로 전송, 코드 0, 595,049 가스 사용 |
| 비동기 Native에서 QoreChain Native로의 호출, `asyncGasLimit` 800000, `asyncMaxFactor` 6000000 | 시뮬레이션 751,287 가스, 코드 0, 751,277 가스 사용 |
| 비동기 호출의 차감 내역(트랜잭션 이벤트) | 수수료(146,502 uqor, 한도의 0.15배)와 모듈 계정으로 보내진 680,417 uqor(관찰된 에스크로와 큐 슬롯 지급분이며 여기서는 세부 내역을 나누지 않음) |
| 비동기 호출의 이벤트 | `source_vm` native, `target_vm` cosmwasm인 `crossvm_request` |
| `GET /qorechain/crossvm/v1/message/{id}` | 상태 `executed`, `created_height`가 `executed_height`와 같음(큐 호출이 같은 블록에서 실행됨), 오류 없음 |
| 이후 `GET /qorechain/crossvm/v1/pending` | 빈 목록 |
| `async_max_factor`가 `6` | 아무것도 실행되기 전에 거부됨: 코드스페이스 `crossvm` 코드 2, `async_max_factor 6 is outside 1000000..100000000 (millionths): invalid cross-VM message` |

이 페이지를 위해 실행하지 않은 것(UNTESTED)은 `0x0901`을 통한 EVM에서 QoreChain Native로, 그리고 QoreChain Native에서 EVM으로입니다. 체인 팀은 QoreChain Native에서 EVM으로 가는 동기 및 비동기 경로가 v3.2.8 이전에 테스트넷의 높이 9,795,779와 9,795,783에서 실행되었다고 보고합니다.

## 관련 페이지 {#related}

- 개념, 수명 주기, 테스트넷 허용 목록 안내는 [크로스 VM 상호운용성](/developer-guide/cross-vm-interoperability)을 참조하세요.
- 브리지에 필요한 윈도우를 열고 범위를 지정하는 방법은 [EVM 인가 윈도우 레퍼런스](/developer-guide/evm-window-reference)를 참조하세요.
- 프리컴파일 표와 네트워크 상태는 [EVM 프리컴파일](/developer-guide/evm-precompiles)을 참조하세요.
- 컨트랙트 가스와 블록 예산은 [QoreChain Native 개발](/developer-guide/cosmwasm-development)과 [QoreChain Native 가스와 제한](/developer-guide/cosmwasm-gas-and-limits)을 참조하세요.
- 위 트랜잭션에 서명하는 방법은 [양자내성 서명](/developer-guide/post-quantum-signing)을 참조하세요.
- SDK와 RDK 헬퍼는 [크로스 VM 가이드(SDK)](/sdk/guides/cross-vm)와 [멀티 VM 롤업](/rollups/multi-vm)을 참조하세요.
