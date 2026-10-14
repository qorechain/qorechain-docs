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
쿼리는 `--node`가 가리키는 노드를 대상으로 실행됩니다. 실시간 데이터를 조회하려면 **`qorechain-vladi`** 메인넷 RPC 엔드포인트(예: `--node https://rpc.qore.host:443`)를 사용하고, 테스트용으로는 **`qorechain-diana`** 테스트넷 엔드포인트(`--node https://rpc-testnet.qore.host:443`)를 사용하세요. 기본값인 `tcp://localhost:26657`은 직접 운영하는 노드를 대상으로 합니다. 메인넷은 노드 릴리스 v3.2.1을, 테스트넷은 v3.2.2를 실행합니다. 테스트넷은 메인넷에 아직 없는 몇 가지 추가 경로를 제공할 수 있으므로, 테스트넷에서 동작하는 쿼리가 메인넷에서는 `Not Implemented`를 반환할 수 있습니다.
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
```

- `algorithm`은 알고리즘 이름(`dilithium5`, `mlkem1024`) 또는 숫자 ID를 받습니다.
- `migration`은 주소가 아닌 **알고리즘 ID**(예: `1`)를 받으며, 진행 중인 마이그레이션이 없으면 `No active migration`을 보고합니다.
- `evm-window`는 해당 주소에 열려 있는 EVM 레인 승인 창이 있는지, 그리고 남은 블록, 트랜잭션, 금액이 얼마인지(`found`, `live`, `remaining_blocks`, `remaining_txs`, `remaining_value`)를 보여줍니다. REST: `GET /qorechain/pqc/v1/evm_window/{address}`.

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

`stranded_rewards`는 어떤 청구권의 뒷받침도 없이 distribution 모듈에 예치된 스테이커 몫을 v3.2.0 업그레이드 시점에 기록된 대로 보고합니다(`reserved`, `released`, `snapshot_height`). 이 금액은 거버넌스 투표를 통해서만 해제할 수 있습니다.

---

## mint 및 inflation

`qorechaind query mint params|inflation|annual-provisions`는 표준 mint 모듈을 조회하며, 이 모듈의 비율은 두 네트워크 모두에서 `0`입니다. 프로토콜의 발행 일정은 보고하지 **않습니다**. `query inflation` 명령은 없습니다.

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

`reward-pool`은 모듈의 보상 잔액이 `reserved`, `outstanding`, `payable`, `distributable`로 어떻게 나뉘는지 보여줍니다.

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

`config`는 모듈 파라미터(최소 스테이크, 생성 시 소각 비율, 챌린지 윈도우, DA 한도)를 보여줍니다. `suggest-profile <use_case>`는 체인을 쿼리하지 않으며, 공개 엔드포인트가 제공하지 않는 JSON-RPC 메서드를 가리키는 안내만 출력하므로, [프리셋 프로필](/rollups/preset-profiles)에서 프로필을 선택하십시오.

---

## rlconsensus

```bash
qorechaind query rlconsensus agent-status
qorechaind query rlconsensus observation
qorechaind query rlconsensus reward
qorechaind query rlconsensus params
qorechaind query rlconsensus policy
```

---

## abstractaccount

추상 계정 모듈은 현재 두 네트워크 모두에서 꺼져 있으므로(`config.enabled`가 `false`) 이 쿼리들은 계정을 반환하지 않습니다.

```bash
qorechaind query abstractaccount config
qorechaind query abstractaccount accounts
qorechaind query abstractaccount account <address>
qorechaind query abstractaccount permission-schema
```

`auth-keygen`, `auth-sign-cosmos <chain_id> <account> <to> <amount> <nonce>`, `auth-sign-evm <chain_id> <account> <to_0x> <value_wei> <data_hex> <nonce>`는 인증자 서명을 오프라인으로 생성합니다. 인증자 시드는 절대 인자로 전달하지 않습니다. 시드는 `--seed-file <file>`(표준 입력은 `-`), `QORE_AUTH_SEED` 환경 변수 또는 에코 없는 프롬프트에서 읽으며, `auth-keygen`은 시드를 출력하는 대신 새 `0600` 파일(`--out`)에 기록합니다.

---

## gasabstraction

메인넷은 아직 가스 추상화 쿼리를 제공하지 않습니다(`qorechaind query gasabstraction ...`은 도움말 텍스트를 출력하고 REST 경로는 `Not Implemented`를 반환합니다). 수수료는 `uqor`로만 지불합니다. [가스 추상화](/user-guide/gas-abstraction)를 참조하십시오.

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

---

## evm, erc20, wasm

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

---

## CLI가 없는 모듈

`xqore`, `babylon`, `fairblock`에는 트랜잭션 또는 쿼리 명령이 없습니다. 현재 CLI나 어떤 공개 API에서도 사용할 수 없습니다.
