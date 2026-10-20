---
slug: /rollups/settlement-receipts
title: 양자 안전 정산 영수증
sidebar_label: 정산 영수증
sidebar_position: 6
---

# 양자 안전 정산 영수증

**정산 영수증(settlement receipt)**은 롤업의 정산 배치가 포스트 양자 서명 아래 메인 체인에 앵커링되었음을 나타내는 휴대 가능한 기록입니다. 롤업, 배치, 앵커를 명시하며, 메인 체인이 사용하는 것과 동일한 방식인 앵커의 **ML-DSA-87**(Dilithium-5, FIPS-204) 서명을 담고 있습니다.

:::caution 초기 단계: 아직 앵커가 존재하지 않음
영수증은 앵커에 의존하며, **어느 네트워크에도 아직 롤업이나 앵커가 존재하지 않습니다**(2026년 10월 20일 확인). 두 네트워크에서 라이브인 v3.2.2부터는 `anchor_signature`와 함께 제출된 배치가 같은 트랜잭션 안에서 `x/multilayer`에 앵커링되며, 이 필드 없이 제출된 배치는 앵커 없이 정산됩니다. 릴리스된 RDK 클라이언트(0.5.0)는 이 필드를 보내지 않으므로, 이들이 제출하는 배치는 앵커링되지 않습니다. 이 페이지는 현재 신뢰할 수 있는 서비스가 아니라 설계와 구성 요소에 대한 설명으로 받아들이세요.
:::

## 영수증은 증거가 아니라 주장입니다 {#a-receipt-is-a-claim}

영수증의 모든 필드는 그것을 건네주는 사람이 제공합니다. 받은 키로 서명을 확인하면 그 키를 가진 누군가가 해당 바이트에 서명했음을 알 수 있을 뿐, QoreChain이 무언가를 앵커링했음을 보여주지는 않습니다. 따라서 검증자는 신뢰하는 QoreChain 노드에 연결된 클라이언트가 필요하며, 체인 상태에서 주장을 다시 읽어야 합니다: 롤업과 그 레이어, 배치와 그 상태 루트, 앵커, 그리고 생성자의 등록된 포스트 양자 키입니다.

## 앵커가 서명하는 대상 {#what-the-anchor-signs}

앵커의 서명은 **롤업 생성자**의 등록된 ML-DSA-87 키로 이루어집니다. 서명되는 메시지는 앵커가 제출되는 높이에 따라 달라집니다. **v3.2.2부터(메인넷 높이 3,556,788, 테스트넷 높이 6,905,034) v2 메시지가 사용됩니다**: 도메인 태그, 체인 id, 그리고 길이 접두사가 붙은 `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, 트랜잭션 수, 압축된 상태 증명으로 구성됩니다(정확한 레이아웃은 [앵커 읽기](/architecture/multilayer-architecture#reading-anchors)에 있습니다). 체인은 해당 높이부터 v1 앵커(`layer_id || layer_height || state_root || validator_set_hash`, 체인 id 없음)를 허용하지 않습니다. 어느 형식도 하드코딩하지 마세요: 대상 네트워크의 서명 바이트를 읽으세요. 예를 들어 `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`를 사용할 수 있습니다.

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

모든 검증에 `client`를 전달하세요. 영수증 API와 그 검사 방식은 릴리스 간에 변경되었으므로, 체인에 대해 검증하는 릴리스(0.5.0 이상)를 사용하세요. Python, Go, Rust, Java 클라이언트도 동일한 빌드/검증 인터페이스를 제공합니다(Go와 Rust 클라이언트는 아래 제한 사항과 동일한 복수형 키 조회 경로를 사용합니다).

:::caution 현재 클라이언트의 제한 사항 (RDK 0.5.0)
0.5.0의 `verifySettlementReceipt`는 영수증만으로는 절대 `valid`를 보고하지 않으며(`client`가 없으면 결과는 `mode: "signature-only"`, `valid: false`입니다), 체인 검사는 아직 라이브 네트워크에 대해 완료되지 않습니다. 그 이유는 두 가지이며, 둘 다 체인이 아니라 클라이언트에 있습니다:

* 포스트 양자 계정 경로의 복수형 `accounts` 형식을 통해 생성자의 키를 조회하는데, 네트워크는 이 경로를 제공하지 않습니다(HTTP 501, 동작하는 경로는 단수형 `account`입니다). 따라서 `client`를 사용해도 생성자의 포스트 양자 키를 확인할 수 없다는 사유와 함께 결과는 `valid: false`가 됩니다. 그리고
* 서명된 메시지를 v1 레이아웃으로 재구성하는데, 체인은 v3.2.2부터 앵커에 대해 이 레이아웃을 더 이상 허용하지 않으므로, 키를 가지고 있더라도 정상적인 v2 서명을 검증할 수 없습니다.

`buildSettlementReceipt`는 앵커가 해당 배치를 포괄할 때만 동작하는데, 아직 앵커가 없습니다. 영수증은 자신의 노드에서 읽은 앵커 및 생성자의 키와, 대상 네트워크의 v2 서명 바이트를 이용해 교차 확인하기 위한 기록으로만 사용하세요.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

전체 `qorollup` 운영자 CLI는 [롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
