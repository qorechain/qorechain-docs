---
slug: /rollups/settlement-receipts
title: 양자 안전 정산 영수증
sidebar_label: 정산 영수증
sidebar_position: 6
---

# 양자 안전 정산 영수증

**정산 영수증(settlement receipt)**은 롤업의 정산 배치가 포스트 양자 서명 아래 메인 체인에 앵커링되었음을 나타내는 휴대 가능한 기록입니다. 롤업, 배치, 앵커를 명시하며, 메인 체인이 사용하는 것과 동일한 방식인 앵커의 **ML-DSA-87**(Dilithium-5, FIPS-204) 서명을 담고 있습니다.

:::caution 초기 단계: 아직 앵커가 존재하지 않음
영수증은 앵커에 의존하며, **어느 네트워크에도 아직 롤업이나 앵커가 존재하지 않습니다**. 메인넷에서 RDK는 아직 앵커를 기록하지 않습니다: 정산 배치는 기록되지만 앵커링 단계는 건너뜁니다. 이 페이지는 현재 신뢰할 수 있는 서비스가 아니라 설계와 구성 요소에 대한 설명으로 받아들이세요.
:::

## 영수증은 증거가 아니라 주장입니다 {#a-receipt-is-a-claim}

영수증의 모든 필드는 그것을 건네주는 사람이 제공합니다. 받은 키로 서명을 확인하면 그 키를 가진 누군가가 해당 바이트에 서명했음을 알 수 있을 뿐, QoreChain이 무언가를 앵커링했음을 보여주지는 않습니다. 따라서 검증자는 신뢰하는 QoreChain 노드에 연결된 클라이언트가 필요하며, 체인 상태에서 주장을 다시 읽어야 합니다: 롤업과 그 레이어, 배치와 그 상태 루트, 앵커, 그리고 생성자의 등록된 포스트 양자 키입니다.

## 앵커가 서명하는 대상 {#what-the-anchor-signs}

앵커의 서명은 **롤업 생성자**의 등록된 ML-DSA-87 키로 이루어집니다. 현재 메인넷에서 서명되는 메시지는 다음과 같습니다

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

더 새로운 체인 릴리스에서는 서명 메시지가 변경되므로 하드코딩하지 마세요: 대상 네트워크의 서명 바이트를 읽으세요. 앵커는 레이어 수준의 객체입니다: 롤업이나 배치를 명시하지 않으므로, 검증자는 체인 읽기를 통해 이를 바인딩합니다([멀티레이어 아키텍처](/architecture/multilayer-architecture#reading-anchors) 참조).

## 앵커 읽기 {#reading-anchors}

앵커는 REST와 gRPC로 읽을 수 있으며(최신 앵커는 `/qorechain/multilayer/v1/anchor/{layer_id}`, 히스토리는 `/qorechain/multilayer/v1/anchors/{layer_id}`), 계정의 등록된 포스트 양자 키는 `/qorechain/pqc/v1/account/{address}`에서 읽을 수 있습니다. 롤업의 배치는 `qorechaind query rdk batch [rollup-id]`로 읽습니다(RDK REST 경로는 현재 메인넷에서 제공되지 않습니다).

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

모든 검증에 `client`를 전달하세요. 사용 중인 RDK 클라이언트의 최신 게시 릴리스를 사용하세요: 영수증 API와 그 검사 방식은 릴리스 간에 변경되었으며, Python, Go, Rust, Java 클라이언트도 동일한 빌드/검증 인터페이스를 제공합니다(이들은 [`qorechain-pqc`](https://github.com/qorechain) 라이브러리를 통해 ML-DSA-87 검증을 수행합니다).

:::note 현재 클라이언트의 제한 사항
게시된 RDK 클라이언트는 라이브 체인이 제공하지 않는 경로를 통해 생성자의 키를 조회하므로, 온라인 검증은 아직 라이브 네트워크에 대해 완료되지 않습니다. 클라이언트 릴리스에서 이 문제가 해결되기 전까지는 영수증을 자신의 노드에서 읽은 앵커와 교차 확인하기 위한 기록으로만 사용하세요.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

전체 `qorollup` 운영자 CLI는 [롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
