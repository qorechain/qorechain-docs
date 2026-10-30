---
slug: /cli-reference/query-commands
title: 쿼리 명령어
sidebar_label: 쿼리 명령어
sidebar_position: 3
---

# 쿼리 명령어

모든 쿼리 명령어는 다음 패턴을 따릅니다.

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
쿼리는 `--node`가 가리키는 노드를 대상으로 실행됩니다. 실시간 데이터를 조회하려면 **`qorechain-vladi`** 메인넷 RPC 엔드포인트(예: `--node https://rpc.qore.host:443`)를 사용하고, 테스트용으로는 **`qorechain-diana`** 테스트넷 엔드포인트(`--node https://rpc-testnet.qore.host:443`)를 사용하세요. 기본값인 `tcp://localhost:26657`은 직접 운영하는 노드를 대상으로 합니다. 메인넷은 2026년 10월 29일부터 노드 릴리스 v3.2.5를 실행하며(거버넌스 제안 14에 따라 높이 3,906,833에서 적용. v3.2.4는 2026년 10월 23일 높이 3,742,566에서 적용되었습니다). 테스트넷은 v3.2.6을 실행합니다(v3.2.4는 2026년 10월 19일부터, v3.2.5는 10월 26일부터, v3.2.6은 10월 27일부터). v3.2.4 릴리스는 몇 가지 경로와 명령어를 추가하며(아래에 **v3.2.4**로 표시), 이는 두 네트워크 모두에서 동작하고, 이전 릴리스의 노드는 이에 `Not Implemented`로 응답합니다. v3.2.6 릴리스는 명령어 두 개를 추가합니다(**v3.2.6**으로 표시, 메인넷이 적용하기 전까지는 테스트넷 전용). 이 페이지의 명령어는 `https://rpc.qore.host:443`을 대상으로 실행한 v3.2.3 릴리스 바이너리를 기준으로 확인했으며, v3.2.4 경로는 2026년 10월 23일에 REST로 확인했고 v3.2.6 명령어는 v3.2.6 소스를 기준으로 확인했습니다.
:::

공통 플래그는 모든 `query` 하위 명령어에 적용됩니다.

| 플래그       | 유형   | 설명                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | RPC 엔드포인트 (기본값: `tcp://localhost:26657`) |
| `--output` | string | 출력 형식: `json` 또는 `text`                 |
| `--height` | int    | 특정 블록 높이의 상태를 쿼리          |

모든 모듈에 CLI 쿼리가 있는 것은 아닙니다. 명령어가 없는 경우 REST 엔드포인트(`https://api.qore.host/...`)를 사용하세요. [REST API](/api-reference/rest-grpc-endpoints)를 참조하십시오.

---

## bank

```bash
qorechaind query bank balances <address>
qorechaind query bank total-supply
qorechaind query bank total-supply-of uqor
qorechaind query bank spendable-balances <address>
```

(`query bank total`은 없습니다.)

---

## staking

```bash
qorechaind query staking validator <validator_address>
qorechaind query staking validators
qorechaind query staking validators --status BOND_STATUS_BONDED
qorechaind query staking delegation <delegator_address> <validator_address>
qorechaind query staking delegations <delegator_address>
qorechaind query staking delegations-to <validator_address>
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
qorechaind query staking unbonding-delegations <delegator_address>
qorechaind query staking redelegation <delegator_address> <src_validator> <dst_validator>
qorechaind query staking params
qorechaind query staking pool
```

`--status`는 전체 열거형 이름(`BOND_STATUS_BONDED`, `BOND_STATUS_UNBONDING` 또는 `BOND_STATUS_UNBONDED`)을 받습니다(`--status bonded`는 거부됩니다).

---

## distribution

```bash
qorechaind query distribution rewards <delegator_address>
qorechaind query distribution commission <validator_address>
qorechaind query distribution validator-outstanding-rewards <validator_address>
qorechaind query distribution community-pool
qorechaind query distribution params
```

---

## gov

```bash
qorechaind query gov proposals
qorechaind query gov proposals --proposal-status voting-period
qorechaind query gov proposal <proposal_id>
qorechaind query gov votes <proposal_id>
qorechaind query gov vote <proposal_id> <voter_address>
qorechaind query gov tally <proposal_id>
qorechaind query gov params
```

`--proposal-status`는 `deposit-period`, `voting-period`, `passed`, `rejected` 또는 `failed`를 받습니다. 기타 필터: `--voter`, `--depositor`.

---

## tx

```bash
qorechaind query tx <txhash>
qorechaind query txs --query "message.sender='<address>'"
```

---

## pqc

```bash
qorechaind query pqc account <address>
qorechaind query pqc algorithms
qorechaind query pqc algorithm dilithium5
qorechaind query pqc stats
qorechaind query pqc params
qorechaind query pqc migration <algorithm_id>
qorechaind query pqc hybrid-mode
qorechaind query pqc evm-window <address>
qorechaind query pqc evm-delegation-consent <address>
```

- `algorithm`은 알고리즘 이름(`dilithium5`, `mlkem1024`) 또는 숫자 ID를 받습니다.
- `migration`은 주소가 아닌 **알고리즘 ID**(예: `1`)를 받으며, 진행 중인 마이그레이션이 없으면 `No active migration`을 보고합니다.
- `account`는 등록된 키를 보고합니다. 키, `key_type`, `algorithm_name` 외에도 레코드에는 `classical_key_source`(`stored`, `auth_account` 또는 `none`: 클래식 공개 키의 출처)가 있습니다. v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) `possession_proven`도 포함되며, 키가 검증된 소유 증명과 함께 등록된 경우 `true`입니다.
- `evm-window`는 해당 주소에 열려 있는 EVM 레인 승인 창이 있는지, 그리고 남은 블록, 트랜잭션, 금액이 얼마인지(`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`)와 함께 창의 범위(`native_only`, `allowed_targets`; 메인넷 v3.2.3부터)를 보여줍니다. REST: `GET /qorechain/pqc/v1/evm_window/{address}`.
- `evm-delegation-consent`는 해당 주소의 EIP-7702 위임 동의(`found`, `live`, `delegate`, `granted_height`, `expiry_height`), 현재 위임 및 EVM 논스를 보여줍니다. REST: `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.
- `params`와 `hybrid-mode`는 `hybrid_signature_mode`(`2` = 두 네트워크 모두에서 필수)와 `allow_classical_fallback`(`false`)을 보고합니다.

---

## burn

burn 모듈에는 CLI 쿼리가 없습니다. REST를 사용하십시오.

```bash
curl -s https://api.qore.host/qorechain/burn/v1/params
curl -s https://api.qore.host/qorechain/burn/v1/stats
curl -s https://api.qore.host/qorechain/burn/v1/records
curl -s https://api.qore.host/qorechain/burn/v1/milestone
curl -s https://api.qore.host/qorechain/burn/v1/stranded_rewards
```

`stranded_rewards`는 어떤 청구권의 뒷받침도 없이 distribution 모듈에 예치된 스테이커 몫을 보고합니다(`reserved`, `released`, `snapshot_height`). 이 금액은 거버넌스 투표를 통해서만 해제할 수 있습니다. 이 예비금은 v3.2.0 업그레이드 시점에 처음 기록되었고 v3.2.3 업그레이드 높이에서 다시 계산되었으므로, 다른 곳에 인용된 수치가 아니라 실시간 값을 확인하십시오.

`stats`는 누적 소각량을 출처별로 나누어 보여주며, 여기에는 v3.2.2 업그레이드 이후 0이 아닌 값을 보이는 `failed_tx`가 포함됩니다.

---

## mint 및 inflation

`qorechaind query mint params|inflation|annual-provisions`는 표준 mint 모듈을 조회하며, 이 모듈의 비율은 두 네트워크 모두에서 `0`입니다. 프로토콜의 발행 일정은 보고하지 **않습니다**. `query inflation` CLI 명령은 없습니다. 프로토콜 자체의 발행 설정과 진행 상황은 v3.2.2부터 REST로 제공됩니다.

```bash
curl -s https://api.qore.host/qorechain/inflation/v1/params       # emission_mode, fixed_epoch_emission, max_total_emission, epoch_length
curl -s https://api.qore.host/qorechain/inflation/v1/epoch_info   # current_epoch, next_epoch_height, total_minted, remaining_emission
```

메인넷에서는 `emission_mode: "fixed"`, 43,200블록으로 이루어진 에포크당 86,000 QOR의 고정 발행량, 누적 상한 590,000,000 QOR이 보고됩니다(거버넌스 제안 10, 2026년 10월 19일 통과. 새 발행량이 적용되는 첫 에포크는 블록 3,672,000에서 시작). 금액은 `uqor` 단위입니다. 테스트넷은 자체적인 다른 값을 보고합니다. 테스트넷은 v3.2.4가 추가한 발행 모드(`target_apy`)로 자체 거버넌스(제안 14, 2026년 10월 20일 통과)를 통해 전환했습니다. 네트워크는 자체 거버넌스 투표를 통해서만 모드를 전환하므로, 그러한 투표가 통과될 때까지 메인넷은 `fixed`를 유지합니다(2026년 10월 27일 확인).

---

## ai

```bash
qorechaind query ai config
qorechaind query ai stats
```

---

## reputation 및 qca

```bash
qorechaind query reputation params
qorechaind query qca config
```

검증자별 평판 쿼리나 풀 분류 쿼리는 없습니다.

`query reputation params`(REST `GET /qorechain/reputation/v1/params`)는 테스트넷에서만 응답합니다. 메인넷에서는 이 라우트가 `Not Implemented`로 응답하므로(2026년 10월 30일 확인, v3.2.5 이후), 이후 체인 릴리스와 함께 메인넷에서 시작됩니다.

---

## lightnode

```bash
qorechaind query lightnode params
qorechaind query lightnode stats
qorechaind query lightnode light-nodes
qorechaind query lightnode light-node <operator_address>
qorechaind query lightnode rewards <operator_address>
qorechaind query lightnode reward-pool
```

`reward-pool`은 모듈의 보상 잔액이 `reserved`, `outstanding`, `payable`, `distributable`로 어떻게 나뉘는지와 노드별 한도인 `max_reward_per_block_per_node`, 그리고 v3.2.3부터 `max_reward_per_month_per_node`(2,000 QOR, 블록 시간과 가동률에 비례하여 배분)를 보여줍니다. v3.2.4부터(메인넷은 2026년 10월 23일부터, 테스트넷은 2026년 10월 19일부터) `monthly_cap_active`, `last_distribution_time`, `last_distribution_height`도 보고합니다.

---

## license

```bash
qorechaind query license check <grantee_address> <feature_id>
qorechaind query license holders <feature_id>
qorechaind query license list <grantee_address>
```

`check`는 수혜자가 해당 기능에 대한 라이선스를 보유하고 있지 않으면 `NotFound` 오류를 반환합니다.

---

## bridge

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain <chain_id>
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation <operation_id>
```

---

## crossvm

```bash
qorechaind query crossvm message <message_id>
qorechaind query crossvm pending
qorechaind query crossvm params
```

---

## svm

```bash
qorechaind query svm account <base58_address>
qorechaind query svm program <base58_address>
qorechaind query svm params
qorechaind query svm slot
```

---

## multilayer

```bash
qorechaind query multilayer layer <layer_id>
qorechaind query multilayer layers
qorechaind query multilayer routing-stats
qorechaind query multilayer params
```

---

## rdk

```bash
qorechaind query rdk config
qorechaind query rdk rollup <rollup_id>
qorechaind query rdk list-rollups
qorechaind query rdk batch <rollup_id>            # latest batch
qorechaind query rdk batch <rollup_id> --index 42 # a specific batch
```

```bash
qorechaind query rdk batches <rollup_id> [--start 0] [--limit 100]   # batches in index order
qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>
```

`config`는 모듈 파라미터(최소 스테이크, 생성 시 소각 비율, 챌린지 윈도우, DA 한도)를 보여줍니다. `anchor-sign-bytes`는 롤업 생성자가 `tx rdk submit-batch --anchor-signature`를 위해 서명하는 v2 앵커 서명 바이트를 16진수로 출력합니다. 동일한 쿼리는 v3.2.2부터 `/qorechain/rdk/v1/...` 아래의 REST로도 제공됩니다([REST / gRPC 엔드포인트](/api-reference/rest-grpc-endpoints#rdk-module) 참조). `suggest-profile <use_case>`는 체인을 쿼리하지 않으며, 공개 엔드포인트가 제공하지 않는 JSON-RPC 메서드를 가리키는 안내만 출력하므로, [프리셋 프로필](/rollups/preset-profiles)에서 프로필을 선택하십시오.

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
qorechaind query rlconsensus applied-params   # v3.2.6 (testnet)
qorechaind query rlconsensus last-action      # v3.2.6 (testnet)
```

`agent-status`는 에이전트의 모드, 에포크, 스텝 수를 보고하고, `policy`는 저장된 정책의 에포크와 가중치 개수를 보고합니다(가중치 자체는 아님). **v3.2.6(메인넷이 해당 릴리스를 적용하기 전까지는 테스트넷 전용):** `applied-params`는 에이전트가 적용된 것으로 보유한 값(블록 시간, 가스 가격 하한, 풀 가중치)을 출력하고, `last-action`은 에이전트가 마지막 스텝에서 제안한 행동을 출력합니다. 이 행동은 아무것도 적용되지 않는 섀도 모드를 포함한 모든 모드에서 기록됩니다. 이 모든 것은 테스트넷에서 REST로도 제공됩니다([RL 합의 모듈](/api-reference/rest-grpc-endpoints#rlconsensus-module) 참조). 메인넷 노드에 대해서는 메인넷이 해당 릴리스를 적용하기 전까지 두 새 명령어가 `Not Implemented`로 응답합니다.

---

## abstractaccount

추상 계정 모듈은 메인넷에서는 꺼져 있고(`config.enabled`가 `false`이므로 메인넷에서는 이 쿼리들이 계정을 반환하지 않습니다), 테스트넷에서는 거버넌스에 의해 켜져 있습니다(`config.enabled`가 `true`, 2026년 10월 27일 확인).

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>`, `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>`는 인증자 서명을 오프라인으로 생성합니다. 인증자 시드는 절대 인자로 전달하지 않습니다. 시드는 `--seed-file <file>`(표준 입력은 `-`), `QORE_AUTH_SEED` 환경 변수 또는 에코 없는 프롬프트에서 읽으며, `auth-keygen`은 시드를 출력하는 대신 새 `0600` 파일(`--out`)에 기록합니다.

---

## gasabstraction

가스 추상화 쿼리는 v3.2.2부터 두 네트워크 모두에서 제공됩니다.

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate <denom>   # what one unit of a fee token is worth in uqor, and whether it can pay fees
qorechaind query gasabstraction float                     # the conversion float's balances and this block's usage
```

허용 토큰 목록에는 두 네트워크 모두 네이티브 `uqor`만 들어 있으므로, 수수료는 `uqor`로 지불되고 변환은 일어나지 않습니다. 어떤 다른 토큰을 허용할지는 거버넌스가 결정합니다. REST: `/qorechain/gasabstraction/v1/config`, `/conversion_rate?denom=`, `/float`. [가스 추상화](/user-guide/gas-abstraction)를 참조하십시오.

---

## amm

```bash
qorechaind query amm params
qorechaind query amm pools
qorechaind query amm pool <pool_id>
qorechaind query amm pool-by-denoms <denom_a> <denom_b>
qorechaind query amm lp-balance <pool_id> <address>
qorechaind query amm quote-exact-in <pool_id> <denom_in> <amount_in>
qorechaind query amm quote-exact-out <pool_id> <denom_out> <amount_out>
```

이 문서를 작성하는 시점에는 어느 네트워크에도 풀이 존재하지 않습니다. 테스트넷에서는 세 개의 페스트 테스트 토큰을 풀의 두 번째 denom으로 사용할 수 있습니다([테스트넷 테스트 토큰](/api-reference/rest-grpc-endpoints#fest-tokens) 참조).

---

## stakingtier (v3.2.4)

```bash
qorechaind query stakingtier params
qorechaind query stakingtier locks <holder_address>
qorechaind query stakingtier pool
```

스테이킹 티어 모듈은 **v3.2.4** 릴리스의 일부입니다. 테스트넷에서는 2026년 10월 19일부터, 메인넷에서는 2026년 10월 23일(높이 3,742,566, 거버넌스 제안 13)부터 실행되고 있습니다. 이전 릴리스의 노드는 이 쿼리에 `Not Implemented`로 응답합니다. REST: `/qorechain/stakingtier/v1/params`, `/locks/{holder}`, `/pool`. [트랜잭션 명령어](/cli-reference/transaction-commands#stakingtier)를 참조하십시오.

---

## circuit, feemarket, upgrade

```bash
qorechaind query circuit disabled-list        # message types switched off network-wide
qorechaind query feemarket params
qorechaind query feemarket base-fee
qorechaind query upgrade plan
qorechaind query upgrade applied <upgrade_name>
qorechaind query upgrade module-versions
```

`query upgrade applied <name>`은 업그레이드가 언제 적용되었는지 확인하는 방법입니다. 메인넷에서는 `v3.2.2`가 높이 3,556,788에, `v3.2.3`이 높이 3,662,051에, `v3.2.4`가 높이 3,742,566에, `v3.2.5`가 높이 3,906,833에 적용되었고, 테스트넷에서는 `v3.2.2`가 6,905,034에, `v3.2.3`이 8,003,746에, `v3.2.4`가 8,337,253에, `v3.2.5`가 8,890,800에, `v3.2.6`이 8,970,638에 적용되었습니다(`0`은 적용되지 않았음을 의미하며, 메인넷의 `v3.2.6`은 이 글을 쓰는 시점에 `0`입니다). 메인넷의 서킷 브레이커 목록(`disabled-list`)에는 현재 베스팅 계정 생성 메시지, QoreChain Native 저장 및 인스턴스화, AMM 풀 일시 중지 및 재개, 크로스 VM 호출, 멀티레이어 레이어 상태 업데이트, PQC 알고리즘 사용 중단 및 비활성화, PRISM 합의 거버넌스 메시지가 들어 있으며, 테스트넷의 목록에는 QoreChain Native `MsgStoreCode` 메시지만 들어 있습니다(2026년 10월 27일 확인, 인스턴스화는 테스트넷 거버넌스가 허용했습니다).

---

## evm, erc20, wasm

`wasm` 명령어는 QoreChain Native를 조회합니다. QoreChain Native는 QoreChain이 CosmWasm 스마트 컨트랙트 런타임을 부르는 이름이며, 명령어와 모듈 이름은 `wasm` 표기를 유지합니다.

```bash
qorechaind query evm params
qorechaind query evm balance-bank <0x_address> uqor
qorechaind query erc20 token-pairs
qorechaind query wasm params
qorechaind query wasm list-code
qorechaind query wasm list-contract-by-code <code_id>
qorechaind query wasm contract <contract_address>
qorechaind query wasm contract-state smart <contract_address> '<json_query>'
```

`query erc20 token-pairs`는 메인넷에서는 비어 있고, 테스트넷에서는 세 개의 페스트 테스트 토큰(fUSD, fETH, fBTC)과 하나의 IBC 토큰을 나열합니다. 이들의 뱅크 denom은 `erc20:`에 EIP-55 컨트랙트 주소를 붙인 형태이며 대소문자를 구분합니다. [테스트넷 페스트 테스트 토큰](/developer-guide/evm-development#fest-tokens)을 참조하세요. 테스트넷에서 `query wasm params`는 `code_upload_access`가 `Nobody`, `instantiate_default_permission`이 `Everybody`로 표시되고, 메인넷에서는 둘 다 `Nobody`입니다([QoreChain Native 개발](/developer-guide/cosmwasm-development) 참조).

---

## CLI가 없는 모듈

`xqore`, `babylon`, `fairblock`에는 트랜잭션 또는 쿼리 명령이 없습니다. 현재 CLI나 어떤 공개 API에서도 사용할 수 없습니다.
