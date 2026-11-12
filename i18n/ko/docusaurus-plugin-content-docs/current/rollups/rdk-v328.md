---
slug: /rollups/rdk-v328
title: "v3.2.8의 RDK: 무엇이 바뀌었나"
sidebar_label: v3.2.8의 RDK
sidebar_position: 11
---

# v3.2.8의 RDK: 무엇이 바뀌었나

QoreChain 릴리스 v3.2.8은 롤업이 정산되는 방식을 바꿉니다. 이제 롤업은 데이터를 체인에 올리고, 체인이 트랜잭션 순서를 정하게 하고(기반 시퀀싱), 배치를 다시 실행하는 사기 증명으로 옵티미스틱하게 정산하고, 게시물을 구성원 집합에만 비공개로 유지하고, 임의의 32바이트 루트를 받아들이는 방식으로 Groth16 출금 루트를 바인딩할 수 있습니다. STARK 정산은 이후 릴리스까지 일시 중지됩니다. 이 페이지는 각 변경이 무엇을 하고 어떻게 사용하는지 설명합니다. `x/rdk` 모듈을 기반으로 구축하는 롤업 운영자와 개발자를 위한 내용입니다.

:::caution 당분간 테스트넷 전용
v3.2.8은 2026년 11월 12일부터 공개 테스트넷 `qorechain-diana`에서 실행되고 있습니다. 메인넷은 아직 이를 적용하지 않았으므로, 이 페이지의 모든 기능은 적용되기 전까지 메인넷에서 거부됩니다. 예시는 테스트넷 예시로 취급하세요.
:::

:::note 오늘 이를 할 수 있는 도구
* **노드 명령줄(`qorechaind`)**: 이 페이지의 모든 메시지에는 명령이 있습니다. 이것은 Linux 노드 바이너리이며 패키지된 macOS 바이너리는 없으므로, Mac에서는 Linux 호스트에서 실행하거나 REST로 체인을 읽으세요.
* **RDK 키트**: RDK 0.9.0이 v3.2.8을 지원합니다. 모든 레지스트리에 게시되어 있습니다. npm(`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI(`qorechain-rdk`), crates.io(`qorechain-rdk`), Maven(`io.github.qorechain:qorechain-rdk`), Go(`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). 릴리스 노트: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Python, Go, Rust, Java RDK 클라이언트**: 각각 버전 0.9.0이 v3.2.8을 지원합니다. 아래의 엔드 투 엔드 실행에는 TypeScript 클라이언트를 사용했습니다.
:::

## 한눈에 보는 변경 사항 {#at-a-glance}

| 영역 | v3.2.8부터의 동작 |
| --- | --- |
| 데이터 게시 | `MsgPostRollupData`는 페이로드를 트랜잭션에 담고, 롤업의 다음 인박스 시퀀스 아래에 커밋먼트를 체인에 보관합니다. |
| 기반 시퀀싱 | 체인이 롤업의 트랜잭션을 포함된 순서대로 정렬합니다. 생성 시 또는 `MsgSetRollupSequencing`을 통한 거버넌스로 설정합니다. |
| 옵티미스틱 롤업 | 새 옵티미스틱 롤업(`nft`, `custom`)은 `qledger-v1` 실행 모델로 실행되며 반드시 기반이어야 합니다. 사기 증명은 배치를 다시 실행합니다. |
| 제출자 본드 | `qledger-v1` 롤업의 배치에는 본드(`MsgBondRollupSubmitter`)가 필요합니다. 인정된 사기 증명은 절반을 소각하고 절반을 챌린저에게 지급합니다. |
| 예치 | `MsgDepositToRollup`은 `qledger-v1` 롤업의 32바이트 계정에 입금합니다. |
| 비공개 롤업 | 프라이버시 `encapsulated`로 생성된 `defi` 롤업은 구성원에게 보내는 ML-KEM-1024 봉투만 받아들입니다(`MsgSetRollupMembers`). |
| Groth16 입력 | 입력은 BLS12-381 스칼라 필드로 나눈 나머지로 읽습니다. `withdrawals_root`는 임의의 32바이트일 수 있으며 축약되어 저장됩니다. |
| STARK | STARK 키와 STARK 배치는 이후 릴리스까지 거부됩니다. |
| 보존 | 게시된 데이터의 커밋먼트는 `posted_data_retention_blocks` 동안 보관되며, `qledger-v1` 롤업에서는 체크포인트가 더 오래 보관됩니다. |

## 왜 중요한가 {#why}

v3.2.8 이전에는 롤업의 데이터가 체인에 둘 자리가 없어서, 배치를 확인하는 사람은 시퀀서의 사본을 신뢰해야 했습니다. 데이터 게시와 포함 순서 정렬은 이 신뢰를 없앱니다. 무엇이 어떤 순서로 게시되었는지 체인 자체가 기록하며, 배치는 정확히 그 범위를 소비해야 합니다. 옵티미스틱 롤업에서는 이제 챌린지가 루트만이 아니라 실행을 검사하므로, 잘못된 배치는 제출자의 본드를 잃게 합니다. 비공개 롤업은 그룹이 공개 체인에서 데이터를 공개하지 않고 공유할 수 있게 해 줍니다.

## 롤업 데이터 게시 {#posting-data}

`MsgPostRollupData`(명령 `tx rdk post-data`)는 트랜잭션에 페이로드를 담아 보냅니다. 바이트는 트랜잭션 안에 남으므로 블록에 들어 있습니다. 체인은 롤업의 다음 인박스 시퀀스(1부터 시작) 아래에 커밋먼트를 보관합니다. 데이터의 SHA-256, 크기, 게시자, 높이입니다. 또한 롤업의 인박스 어큐뮬레이터를 확장합니다.

* **게시할 수 있는 사람**: 롤업의 시퀀서(시퀀서 주소가 설정되지 않았으면 생성자). 기반 롤업에서는 누구나 가능합니다.
* **크기**: 게시당 최대 `max_posted_data_bytes`(기본 131,072바이트, 하드 상한 1 MiB), 모든 롤업을 합쳐 `max_posted_data_bytes_per_block`(기본 524,288 과금 대상 바이트).
* **수수료**: 과금 대상 바이트당 `posted_data_fee_per_byte` uqor(기본 10)이며, 게시는 최소 1 KiB로 과금됩니다. 수수료는 수수료 수집기로 가서 트랜잭션 수수료처럼 분배됩니다. 가스는 별도로 청구됩니다.
* **보존**: 커밋먼트는 `posted_data_retention_blocks`(기본 648,000) 이후 정리됩니다. 바이트는 블록 기록에 남습니다.
* **배치에서의 사용**: 기반이 아닌 네이티브 DA 롤업의 배치는 `data_hash`를 데이터의 SHA-256과 같게 하여 보존 중인 게시물을 참조할 수 있습니다.

명령줄(Linux 노드 바이너리):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

REST로 커밋먼트를 읽습니다(테스트넷에서 확인함, [확인한 경로](#checked-routes) 참조).

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

응답에는 `data_hash`, `size`, `poster`, `height`, `inbox_acc`, `expires_at_height`가 담깁니다. 게시된 적이 없거나 정리된 시퀀스는 HTTP 404를 반환합니다.

## 기반 시퀀싱 {#based-sequencing}

기반 롤업은 QoreChain에서의 포함 순서로 정렬됩니다. 각 게시물은 다음 인박스 시퀀스를 받고, 모든 배치는 인박스를 순서대로 소비합니다.

* `--sequencing based`로 롤업을 기반으로 생성하거나, 거버넌스 `MsgSetRollupSequencing`으로 기존 롤업을 전환합니다.
* 각 배치는 `inbox_end`(소비하는 마지막 게시물의 시퀀스)를 설정하고 인박스 범위 커밋먼트를 `data_hash`로 담습니다. 이는 `query rdk inbox`로 체인에 물어보세요(`range_data_hash`를 반환합니다).
* 기반 롤업은 거버넌스로만 일시 중지, 재개, 중지됩니다.

기반 롤업에서 배치를 제출할 수 있는 사람은 롤업에 따라 다릅니다.

| 롤업 | 배치를 제출하는 사람 |
| --- | --- |
| Groth16 키가 있는 zk(`defi`) | 모든 계정. 증명이 루트, 인박스 범위, 출금 루트를 바인딩합니다. |
| 기반 정산(`gaming`, `enterprise`) | 롤업의 시퀀서만. |
| `qledger-v1`이 있는 옵티미스틱(`nft`, `custom`) | 제출자 본드를 보유한 모든 계정. |

`qledger-v1`이 없는 옵티미스틱 롤업과 STARK 롤업은 이번 릴리스에서 기반이 될 수 없습니다.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

노드를 신뢰하지 않고 직접 계산하려는 증명자를 위한 어큐뮬레이터와 범위 커밋먼트는 다음과 같습니다.

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0`은 0으로 채운 32바이트이고 `lp`는 4바이트 빅엔디언 길이 접두사입니다.

## qledger-v1을 사용하는 옵티미스틱 롤업 {#qledger-v1}

v3.2.8부터 새 옵티미스틱 롤업은 실행 VM 없이 생성할 수 없습니다. `nft`와 `custom` 프리셋에는 `--sequencing based`와 함께 `--execution-vm qledger-v1`이 필요합니다. v3.2.8 이전에 생성된 옵티미스틱 롤업은 그대로입니다.

`qledger-v1`은 uqor 단위의 계정 원장(SHA-256을 쓰는 희소 머클 트리)이며 서명된 전송과 출금을 지원합니다. 계정 키는 ML-DSA-44만 사용합니다. 입력은 자체 인박스입니다.

* **사용자 게시물**: 트랜잭션 하나당 하나이며 최대 6 KiB.
* **예치**: `MsgDepositToRollup`은 32바이트 계정 id에 입금합니다. 체인이 예치를 인박스에 직접 추가합니다.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### 제출자 본드와 대기 중 배치 {#submitter-bond}

해당 롤업에 `min_submitter_bond`(기본 1,000 QOR, 1,000,000,000 uqor) 이상의 제출자 본드를 보유한 계정은 누구나 배치를 제출할 수 있습니다.

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

본드 조회는 `amount`, `last_submit_time`, `unbond_after`, `pending`을 반환합니다. `pending`은 해당 제출자의 배치 중 아직 최종 확정을 기다리는 개수입니다. 배치를 제출할 때마다 올라가고, 하나가 확정되거나 거부되면 내려갑니다. 제출자는 대기 중인 배치를 1,024개 미만으로 가질 수 있습니다. 본드는 보유자의 마지막 배치로부터 챌린지 윈도우가 완전히 지난 뒤 `unbond-submitter`로 되찾을 수 있습니다.

### 배치 규칙 {#batch-rules}

`consumed`를 다음 배치가 시작하는 인박스 위치, `head`를 마지막 게시물이라고 하겠습니다(둘 다 `query rdk inbox`에 있습니다). `inbox_end = end`인 배치는 다음이 모두 충족될 때 허용됩니다.

1. 제출자가 `min_submitter_bond` 이상을 보유하고 대기 중인 배치가 1,024개 미만입니다.
2. `consumed < end <= head`. 배치는 최소 하나의 항목을 소비합니다.
3. `end - consumed <= 64`. 배치당 최대 64개의 인박스 항목.
4. 체인이 `end`에서의 어큐뮬레이터를 여전히 만들 수 있습니다. `end`가 head이거나, 게시물 `end`의 커밋먼트가 보존되어 있습니다(`query rdk inbox <rollup> --inbox-end <end>`가 `range_data_hash`를 반환합니다).
5. head 전에서 멈추는 64개 미만 항목의 배치는 최근 20블록 안에 만들어진 게시물 바로 앞에서 멈추거나, 다음 게시물이 더 이상 보존되지 않는 체크포인트(`end`가 64의 배수)에서 멈춥니다.
6. `data_hash`는 `consumed`부터 `end`까지의 인박스 범위 커밋먼트이고, 첫 배치는 빈 원장 루트에서 시작하며, `state_root`는 32바이트입니다.

클라이언트는 다음과 같이 `end`를 고를 수 있습니다.

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

명령줄로 제출합니다.

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### 사기 증명 {#fraud-proofs}

챌린지 윈도우 동안 누구나 `qledger-v1` 사기 증명과 함께 `MsgChallengeBatch`를 보낼 수 있습니다. 증명은 배치의 입력과 그것이 건드리는 계정의 머클 증인으로 이루어집니다. 체인은 배치를 다시 실행합니다.

* 상태 루트나 출금 루트가 잘못되었으면 배치가 거부되고, 그 위에 쌓인 모든 배치도 거부됩니다. 인박스는 롤백됩니다.
* 제출자의 본드 전체가 슬래싱됩니다. **절반은 소각되고 절반은 챌린저에게 지급됩니다.** 소각된 절반은 소각 모듈에 출처 `rollup_slash`로 기록됩니다. 자신의 잘못된 배치를 직접 챌린지하는 제출자도 본드의 절반을 잃습니다.
* 잘못된 배치를 보여 주지 못하는 증명은 오류 51로 실패하며 아무것도 바꾸지 않습니다.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

RDK 0.9.0에는 증명 바이트를 만드는 `qledger-v1` 헬퍼가 있습니다.

챌린지되지 않은 배치는 챌린지 윈도우가 끝나면 스스로 확정됩니다. 출금은 확정된 배치에서만, 롤업의 예치 풀에서 지급되며 생성자의 에스크로에서는 절대 지급되지 않습니다. 풀에 예치금이 있는 동안에는 롤업을 중지할 수 없습니다(오류 54).

### 보존과 유휴 기간 {#retention}

* 게시물 커밋먼트는 `posted_data_retention_blocks` 동안 보관되고, 그 후에도 확정된 배치가 이를 포함하지 않는 동안에는 최대 4번의 보존 기간 더 보관됩니다.
* 그 이후에는 정리되지만 체크포인트는 예외입니다. 시퀀스가 64의 배수인 모든 게시물은 확정된 배치가 이를 포함하거나 롤업이 중지될 때까지 커밋먼트를 유지합니다.
* 중지된 롤업은 보존 기간이 지난 커밋먼트를 유지하지 않습니다.
* `posted_data_retention_blocks`는 적용 중인 가장 긴 챌린지 윈도우 이상이어야 하며, 블록 하나를 1초로 계산합니다(`default_challenge_window`와 중지되지 않은 모든 롤업의 윈도우). 이보다 짧게 남기거나 윈도우를 이 값 위로 올리는 파라미터 업데이트는 `invalid params`로 거부됩니다. 상한은 25,920,000입니다.
* v3.2.8 업그레이드 시점에 그 윈도우보다 낮게 저장된 값은 윈도우 값으로 올라갑니다. 기본 파라미터는 그대로 둡니다.
* **테스트넷 값**: `default_challenge_window`는 3,600초입니다(코어 기본값이자 메인넷 방식의 값은 604,800초, 즉 7일입니다). 게시된 데이터는 648,000블록, 블롭과 확정된 배치는 432,000블록 동안 보관됩니다.

긴 유휴 기간 후에 소비되지 않은 게시물이 64개를 넘고 그 커밋먼트가 정리된 경우, 제출자는 순서대로 따라잡습니다. `consumed`가 64의 배수가 아니면 다음 64의 배수까지 배치 하나, 이어서 체크포인트에서 체크포인트까지 64개짜리 전체 배치, 마지막으로 head(또는 규칙 5에 따른 보존 중인 임의의 위치)까지 배치 하나입니다. 정상 운영에서는 바뀌는 것이 없습니다. head까지 또는 최근 게시물 바로 앞까지 최대 64개 항목을 배치합니다.

## 비공개 롤업 {#private-rollups}

프라이버시 `encapsulated`로 생성된 `defi`(Groth16) 롤업은 구성원에게 보내는 ML-KEM-1024 봉투인 게시물만 받아들입니다.

봉투는 새 키로 AES-256-GCM을 사용해 데이터를 한 번 암호화하고, 그 키를 체인의 KEM 레지스트리에 있는 모든 구성원의 ML-KEM-1024 키로 캡슐화합니다. 키 커밋먼트는 모든 구성원이 같은 내용을 열도록 보장합니다. 체인은 봉투의 형식이 올바른지, 각 항목이 구성원의 현재 키를 지칭하는지 확인합니다. 복호화는 절대 하지 않습니다.

* 생성자가 `MsgSetRollupMembers`로 구성원을 설정합니다. 최대 32명이며 각자 등록된 ML-KEM-1024 키가 있어야 합니다. 변경할 때마다 새 멤버십 에포크가 시작됩니다.
* 게시물, 게시자, 시점, 크기, 구성원, 루트, 출금(수령인과 금액)은 공개로 남습니다. 게시물의 내용만 비공개입니다.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Groth16 입력과 출금 루트 {#groth16}

BLS12-381 위의 Groth16 배치(`defi` 프로필, SNARK)는 공개 입력에 대해 검증됩니다. 각 입력은 빅엔디언 정수로 읽은 32바이트 값이며 스칼라 필드 차수로 나눈 나머지로 축약됩니다.

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

출금이 바인딩되기 전에 제출된 배치에는 처음 세 입력만 있습니다. 증명자의 증인(witness)도 같은 축약된 값을 취해야 합니다.

값이 이미 `r`보다 작아야 하는지는 누가 설정하느냐에 따라 달라집니다.

| 값 | 설정하는 주체 | r보다 작아야 하는가 |
| --- | --- | --- |
| `state_root` | 증명자 | 예 |
| `prev_state_root` | 체인(가장 최근에 정산된 `state_root`), 롤업의 첫 배치는 예외 | 첫 배치만 |
| `data_hash` | 바인딩된 경우 체인(기반 롤업의 인박스 범위, 게시된 데이터 커밋먼트), 그 외에는 증명자 | 바인딩되지 않은 경우에만 |
| `withdrawals_root` | 체인(`MsgExecuteWithdrawal`이 다시 만드는 출금 트리 루트) | 아니요 |

클라이언트에 주는 의미는 다음과 같습니다.

* 출금 루트는 트리가 주는 그대로 제출하세요. 임의의 32바이트일 수 있습니다.
* 체인은 `withdrawals_root mod r`을 32바이트 빅엔디언으로 저장합니다. 배치 조회는 `withdrawals_root_reduced`가 true인 상태로 그 저장된 값을 보여 줍니다. 트리 루트의 약 55퍼센트는 `r` 이상이므로 저장된 값이 제출한 바이트와 다른 경우가 많습니다.
* `MsgExecuteWithdrawal`은 클라이언트 입장에서 바뀌지 않습니다. 리프 필드와 형제 해시를 보내세요. 체인은 루트를 다시 만들어 `rebuilt_root mod r == stored_root mod r`이면 출금을 받아들입니다.
* 루트가 `r`의 배수만큼 다른 같은 배치를 두 번 제출하면 같은 배치입니다. 첫 번째가 정산되고, 두 번째는 이미 존재하는 배치로 거부되며, 트리의 모든 출금은 저장된 루트를 기준으로 지급됩니다.
* 정산 후에는 저장된 루트를 `tree_root`가 아니라 `tree_root mod r`과 비교하세요.

축약 규칙 이전의 옵티미스틱, `qledger-v1`, Groth16 배치는 정확한 32바이트를 저장하고 비교합니다. 트리와 리프 인코딩은 [ZK / STARK 및 출금](/rollups/zk-stark-withdrawals)을 참조하세요.

## STARK 정산이 일시 중지되었습니다 {#stark}

검증기가 지원하는 유일한 STARK 명제는 두 64비트 값 사이의 반복 제곱을 증명합니다. 이는 롤업의 출금이나 데이터를 제약하지 않습니다. v3.2.8부터 STARK 키는 설정할 수 없고 STARK 롤업의 배치는 거부됩니다(오류 52). 거버넌스는 그런 롤업을 Groth16 키로 옮길 수 있습니다. STARK 정산은 실제 롤업 명제와 함께 이후 릴리스에서 돌아옵니다.

## 새 메시지 {#messages}

| 메시지 | 명령 | 보내는 주체 |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | 시퀀서, 또는 기반 롤업에서는 누구나 |
| `MsgSetRollupSequencing` | 거버넌스 제안 | 거버넌스 |
| `MsgDepositToRollup` | `tx rdk deposit` | `qledger-v1` 롤업에 대해 누구나 |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | 배치 제출자 |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | 배치 제출자 |
| `MsgSetRollupMembers` | `tx rdk set-members` | 비공개 롤업의 생성자 |
| `MsgSubmitBatch` 필드 `inbox_end` | `tx rdk submit-batch --inbox-end` | 기반 롤업 배치의 제출자 |

`create-rollup`은 `--sequencing`, `--execution-vm`, `--privacy`도 받습니다. 호환성 매트릭스는 이제 다음과 같습니다. 사기 증명을 쓰는 옵티미스틱에는 `qledger-v1`과 기반 시퀀싱이 필요하고, ZK 정산은 SNARK를 의미합니다.

## 실행 흐름: 생성, 본드, 예치, 게시, 배치, 챌린지, 확정, 출금 {#worked-flow}

:::note 2026년 11월 12일 RDK 팀이 테스트넷에서 실행
RDK 팀은 2026년 11월 12일 06:22부터 07:27 UTC까지 테스트넷 `qorechain-diana`에서 이 흐름을 처음부터 끝까지 실행했습니다. 가스당 0.15 uqor의 RDK `auto` 수수료로 RDK 0.9.0(TypeScript)만 사용해 진행했습니다. 모든 단계가 코드 0을 반환했습니다. 이 페이지의 작성자가 실행한 것은 아닙니다.
:::

| 단계 | 메시지 | 사용한 가스 / 요청한 가스 |
| --- | --- | --- |
| 0 | 새 계정의 포스트 퀀텀 키를 먼저 별도 트랜잭션으로 등록합니다(소유 증명이 있는 `MsgRegisterPQCKeyV2`). RDK 클라이언트는 이를 자동으로 수행하며, 이것이 없으면 첫 실제 트랜잭션이 pqc 코드 8로 거부됩니다 | 348,917 / 600,000 |
| 1 | `MsgCreateRollup`: 프로필 `nft`, 실행 VM `qledger-v1`, 시퀀싱 `based`, 스테이크 10,000 QOR(1% 소각) | 301,260 / 349,199 |
| 2 | `MsgBondRollupSubmitter`, 1,000 QOR | 178,059 / 263,425 |
| 3 | `MsgDepositToRollup` 두 번(3 QOR와 1 QOR, 최소는 1 QOR) | 각각 약 240,000 / 350,000 |
| 4 | `MsgPostRollupData` 두 번(서명된 qledger 전송과 서명된 qledger 출금), 그리고 게시 데이터 수수료(과금 대상 바이트당 10 uqor, 최소 1 KiB 과금) | 각각 약 328,500 / 474,000 |
| 5 | `planQledgerBatch` 후 인박스 항목 4개에 대한 `MsgSubmitBatch`(`inbox_end` 4, `data_hash`는 인박스 범위). 배치 상태 `submitted`, 본드 `pending` 1 | 712,379 / 1,011,431 |
| 6 | 사기 테스트: 게시물 하나 추가, 의도적으로 잘못된 상태 루트를 가진 배치(233,990 / 341,742), 그리고 RDK가 만든 사기 증명(4,136바이트)을 담은 `MsgChallengeBatch` | 450,186 / 644,417 |
| 7 | 배치 0이 테스트넷의 3,600초 챌린지 윈도우 후 스스로 확정됨 | 트랜잭션 없음 |
| 8 | RDK의 qledger 머클 증명으로 0.3 QOR `MsgExecuteWithdrawal` | 192,768 / 284,220 |

주목할 결과는 다음과 같습니다.

* **단계 6**: 잘못된 배치는 거부되었고, 제출자의 본드는 슬래싱되었으며(절반 소각, 절반은 챌린저에게 지급), 인박스는 롤백되었고, 앞선 정상 배치는 그대로였습니다.
* **단계 8**: 롤업의 예치 풀은 4.0 QOR에서 3.7 QOR로 줄었고, 수령인의 잔액은 0.3 QOR에서 수수료를 뺀 만큼 늘었습니다.

명령줄에는 각 단계에 해당하는 명령이 있습니다. 이 개별 명령들은 이 페이지를 위해 실행하지 않았으며 노드 CLI 정의를 따릅니다.

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

롤업의 챌린지 윈도우는 `challenge_window_sec`에 있습니다. 테스트넷에서 `default_challenge_window`는 롤업을 한 시간 안에 시험해 볼 수 있도록 의도적으로 3,600초입니다. 코어 기본값이자 메인넷 방식의 값은 604,800초(7일)입니다. 단계 5부터 8에는 원장에서 계산한 루트와 증명이 필요하며, RDK 0.9.0에는 이를 수행하는 `qledger-v1` 헬퍼가 있습니다.

## 게시된 TypeScript 키트로 체인 읽기 {#typescript}

이 조회는 0.9.0부터 v3.2.8을 지원하는 `@qorechain/rdk`의 이름을 사용합니다. 아래와 같이 `curl`로 새 필드를 직접 읽을 수도 있습니다.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

이 스니펫은 이 페이지를 위해 실행하지 않았습니다.

## 확인한 경로 {#checked-routes}

다음 읽기 전용 경로는 2026년 11월 12일 공개 테스트넷에 요청했습니다.

| 경로 | 상태 |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` 및 `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, 게시된 적이 없거나 정리된 시퀀스는 404 |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| 알 수 없는 롤업에 대한 모든 경로 | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

모듈 파라미터에 이제 `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond`, `finalized_batch_retention_blocks`가 포함됩니다. 배치 뷰에는 `inbox_start`, `inbox_end`, `withdrawals_root_reduced`가 추가되고, 롤업 뷰에는 `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch`, `deposit_pool`이 추가됩니다. 인박스 응답에는 `head_sequence`, `consumed_sequence`, `range_data_hash`가 있으며, 요청한 end의 커밋먼트를 사용할 수 없으면 `range_data_hash`는 비어 있습니다.

## 제한과 오류 {#limits}

| 제한 또는 오류 | 값 또는 의미 |
| --- | --- |
| 게시물 크기 | `max_posted_data_bytes`, 기본 131,072바이트, 상한 1 MiB |
| 블록당 게시 바이트 | `max_posted_data_bytes_per_block`, 기본 524,288 과금 대상 바이트 |
| 게시 수수료 | 기본적으로 과금 대상 바이트당 10 uqor, 최소 1 KiB 과금 |
| 게시 데이터 보존 | 기본 648,000블록, 최대 25,920,000, 초 단위 가장 긴 챌린지 윈도우보다 작을 수 없음 |
| `qledger-v1` 게시물 | 트랜잭션 하나, 최대 6 KiB |
| 배치 크기 | 인박스 항목 1개에서 64개 |
| 제출자별 대기 중 배치 | 1,024개 미만 |
| 비공개 롤업 구성원 | 최대 32명, 각자 등록된 ML-KEM-1024 키 필요 |
| 블록당, 롤업당 정산되는 배치 | `max_batches_per_block`, 기본 10(오류 40) |
| 오류 41, 44, 47 | 이 높이에서 기능이 활성화되지 않음(네트워크가 v3.2.8을 적용하지 않음) |
| 오류 42, 43 | 게시물이 너무 크거나 블록의 게시 한도에 도달함 |
| 오류 45 | 이 롤업에는 기반 시퀀싱을 사용할 수 없음 |
| 오류 46 | 배치가 롤업의 인박스와 일치하지 않음(잘못된 `inbox_end` 또는 `data_hash`) |
| 오류 48 | 유효하지 않은 실행 또는 프라이버시 모드 |
| 오류 49 | 제출자 본드 필요 |
| 오류 50 | 제출자 본드가 아직 잠겨 있음 |
| 오류 51 | 사기 증명이 배치가 유효하지 않음을 보여 주지 못함 |
| 오류 52 | STARK 정산이 일시 중지됨 |
| 오류 53 | 게시물이 롤업 구성원에게 보내는 유효한 봉투가 아님 |
| 오류 54 | 롤업에 아직 사용자 예치금이 있어 중지할 수 없음 |

## 관련 페이지 {#related}

* [롤업 개요](/rollups/overview)
* [프리셋 프로필](/rollups/preset-profiles)
* [롤업 배포하기](/rollups/deploying-a-rollup)
* [데이터 가용성](/rollups/data-availability)
* [ZK / STARK 및 출금](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
