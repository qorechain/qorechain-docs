---
slug: /rollups/settlement-receipts
title: 양자 안전 정산 영수증
sidebar_label: 정산 영수증
sidebar_position: 6
---

# 양자 안전 정산 영수증

**정산 영수증(settlement receipt)**은 롤업의 정산 배치가 포스트 양자 서명 아래 메인 체인에 앵커링되었음을 나타내는 휴대 가능한 기록입니다. 롤업, 배치, 앵커를 명시하며, 메인 체인이 사용하는 것과 동일한 방식인 앵커의 **ML-DSA-87**(Dilithium-5, FIPS-204) 서명을 담고 있습니다.

:::caution 초기 단계: 아직 앵커가 존재하지 않음
영수증은 앵커에 의존하며, **어느 네트워크에도 아직 롤업이나 앵커가 존재하지 않습니다**(2026년 10월 23일 확인). 두 네트워크에서 라이브인 v3.2.2부터는 `anchor_signature`와 함께 제출된 배치가 같은 트랜잭션 안에서 `x/multilayer`에 앵커링되며, 이 필드 없이 제출된 배치는 앵커 없이 정산됩니다. TypeScript RDK(0.6.0)는 트랜잭션 클라이언트가 하이브리드로 서명하고 롤업의 생성자일 때 이 필드를 보내며, 그렇지 않으면 앵커 없이 제출합니다. Python, Go, Rust, Java 클라이언트는 클래식 전용으로 서명하며 이 필드를 구성하지 않습니다. 이 중 어느 것도 라이브 롤업에서 실행된 적이 없습니다. 이 페이지는 현재 신뢰할 수 있는 서비스가 아니라 설계와 구성 요소에 대한 설명으로 받아들이세요.
:::

## 영수증은 증거가 아니라 주장입니다 {#a-receipt-is-a-claim}

영수증의 모든 필드는 그것을 건네주는 사람이 제공합니다. 받은 키로 서명을 확인하면 그 키를 가진 누군가가 해당 바이트에 서명했음을 알 수 있을 뿐, QoreChain이 무언가를 앵커링했음을 보여주지는 않습니다. 따라서 검증자는 신뢰하는 QoreChain 노드에 연결된 클라이언트가 필요하며, 체인 상태에서 주장을 다시 읽어야 합니다: 롤업과 그 레이어, 배치와 그 상태 루트, 앵커, 그리고 생성자의 등록된 포스트 양자 키입니다.

## 앵커가 서명하는 대상 {#what-the-anchor-signs}

앵커의 서명은 **롤업 생성자**의 등록된 ML-DSA-87 키로 이루어집니다. 서명되는 메시지는 앵커가 제출되는 높이에 따라 달라집니다. **v3.2.2부터(메인넷 높이 3,556,788, 테스트넷 높이 6,905,034) v2 메시지가 사용됩니다**: 도메인 태그, 체인 id, 그리고 길이 접두사가 붙은 `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, 트랜잭션 수, 압축된 상태 증명으로 구성됩니다(정확한 레이아웃은 [앵커 읽기](/architecture/multilayer-architecture#reading-anchors)에 있습니다). 체인은 해당 높이부터 v1 앵커(`layer_id || layer_height || state_root || validator_set_hash`, 체인 id 없음)를 허용하지 않습니다. 어느 형식도 하드코딩하지 마세요: 대상 네트워크의 서명 바이트를 읽으세요. RDK는 `anchorSignBytesForBatch`로 v2 바이트를 구성하고(두 형식 모두는 `anchorSignBytesV1` / `anchorSignBytesV2`로), CLI는 이를 출력합니다. 예를 들어 `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`를 사용할 수 있습니다.

앵커는 레이어 수준의 객체입니다: 롤업이나 배치를 명시하지 않으므로, 검증자는 체인 읽기를 통해 이를 바인딩합니다([멀티레이어 아키텍처](/architecture/multilayer-architecture#reading-anchors) 참조).

## 앵커 읽기 {#reading-anchors}

앵커는 REST와 gRPC로 읽을 수 있으며(최신 앵커는 `/qorechain/multilayer/v1/anchor/{layer_id}`, 히스토리는 `/qorechain/multilayer/v1/anchors/{layer_id}`), 계정의 등록된 포스트 양자 키는 `/qorechain/pqc/v1/account/{address}`(단수형 `account`)에서 읽을 수 있습니다. 롤업의 배치는 두 네트워크가 모두 제공하는 RDK REST 경로(`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`)로 읽거나, `qorechaind query rdk batch [rollup-id]`로 읽습니다.

## 빌드 및 검증 (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

모든 검증에 `client`를 전달하세요. 영수증 API와 그 검사 방식은 릴리스 간에 변경되었으므로 0.6.0 이상을 사용하세요. 0.5.0은 체인 검사를 완료할 수 없었습니다(아래 참조). Python, Go, Rust, Java 클라이언트도 동일한 빌드/검증 인터페이스를 제공하며, 이들의 0.6.0 릴리스는 동일한 단수형 키 조회 경로와 앵커 메시지에 대한 동일한 높이 기반 선택을 사용합니다.

### 0.6.0이 검증하는 것 {#what-060-verifies}

`verifySettlementReceipt`는 영수증만으로는 절대 `valid`를 보고하지 않습니다. `client`가 없으면 결과는 `mode: "signature-only"`, `valid: false`입니다. `client`가 있으면 체인을 다시 읽고 각 검사를 별도로 보고합니다.

* `rollupLayerBinding`: 체인이 해당 롤업이 영수증의 레이어에 속한다고 확인합니다.
* `batchStateRoot`: 체인의 배치가 영수증의 상태 루트를 담고 있습니다.
* `anchorOnChain`: 해당 상태 루트, 높이, 서명을 가진 앵커가 체인에 존재합니다.
* `creatorAuthority`: 서명 키를 영수증에서 가져온 것이 아니라 체인(`/qorechain/pqc/v1/account/{address}`)에서 읽었습니다.
* `pqcSignature`: ML-DSA-87 서명이 표준 앵커 메시지에 대해 검증됩니다.
* `chainBinding`: 영수증이 실제로 조회한 체인을 명시합니다.

앵커 메시지는 앵커가 기록된 높이에 따라 선택되며(v3.2.2 전환 이전은 v1, 전환부터는 v2), 두 가지를 모두 시도하는 일은 없습니다. v1 서명에는 체인 id가 없어 모든 체인에서 검증될 수 있기 때문입니다. 패키지에는 메인넷(3,556,788)과 테스트넷(6,905,034)의 전환 높이가 들어 있습니다. 결과는 사용한 형식을 `signBytesVersion`으로 보고합니다. 영수증 스키마 v2는 `chainId`를 기록하며, 버전 1 영수증에는 이것이 없으므로 앵커가 조회한 체인에서 발견되었다는 이유만으로 `chainBinding`을 통과합니다. 검증은 다른 체인의 노드에 대해 확인되는 영수증을 거부합니다.

어느 네트워크에도 앵커가 없으므로, 이는 패키지 코드와 오프라인에 대해서만 확인되었으며 실제 앵커에 대해서는 확인되지 않았습니다. `buildSettlementReceipt`는 앵커가 해당 배치를 포괄할 때만 동작합니다.

:::note 0.6.0 이전 릴리스
0.5.0의 `verifySettlementReceipt`는 라이브 네트워크에 대해 실패 시 닫힘(fail-closed) 방식으로 동작했으며, 그 이유는 두 가지이고 둘 다 체인이 아니라 클라이언트에 있었습니다. 포스트 양자 계정 경로의 복수형 `accounts` 형식을 통해 생성자의 키를 조회했는데 네트워크는 이 경로를 제공하지 않으며(HTTP 501), v1 메시지만 재구성했는데 체인은 v3.2.2부터 앵커에 대해 이를 더 이상 허용하지 않습니다. 따라서 정상적인 영수증은 검증될 수 없었고 위조된 영수증은 여전히 거부되었습니다. 0.6.0 이상을 사용하세요.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

전체 `qorollup` 운영자 CLI는 [롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
