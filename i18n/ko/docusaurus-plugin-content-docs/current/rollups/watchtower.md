---
slug: /rollups/watchtower
title: Watchtower
sidebar_label: Watchtower
sidebar_position: 9
---

# Watchtower

Watchtower는 옵티미스틱 롤업을 위한 자동 챌린저 프레임워크입니다. 롤업의
정산 배치를 추적하고, 각 새 배치와 해당 챌린지 윈도우 마감 시각을 알려주며,
**여러분**의 유효성 술어가 배치를 거부할 때 이를 `onInvalid` 콜백으로 전달하여
챌린지를 연결할 수 있게 합니다.

이 프레임워크는 감시하고 *언제* 행동할지 결정합니다. **유효성 검사는 여러분이
제공합니다.** Watchtower는 배치가 부정하다고 스스로 판단하지 않습니다 —
`validate` 함수를 호출하고 여러분이 반환한 값에 따라 행동할 뿐입니다.

:::caution 초기 단계: 아직 감시할 대상이 없음
Watchtower는 RDK REST 클라이언트를 통해 배치를 읽으며, `/qorechain/rdk/v1/…` 경로는 두 네트워크 모두에서 제공됩니다. 어느 네트워크에서도 롤업이 생성된 적이 없으므로(2026년 10월 27일 확인) 아직 감시할 대상이 없으며 Watchtower가 실제 배치를 상대로 실행된 적도 없습니다. `@qorechain/rdk` 0.5.0에서는 마감 로직이 잘못되어 있었고(블록 높이를 Unix 타임스탬프로 읽어서 `onDeadline`이 배치가 처음 감지되는 즉시 발생했습니다) 첫 페이지의 50개 배치만 읽었습니다. **0.6.0이 둘 다 수정했습니다**(아래 참조). 현재 릴리스인 0.6.1을 사용하세요.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.6.1: changes and limits" in Deploying a Rollup). Without it the
// transaction is classical-only and refused.
declare const tx: {
  challengeBatch(input: { rollupId: string; batchIndex: number; proof: string }): Promise<unknown>;
};

const watcher = watchBatches(rdk, "my-rollup", {
  onBatch: (batch) => {
    console.log("new batch", batch.batchIndex);
  },

  // Your validity predicate. Return false to flag the batch as invalid.
  validate: async (batch) => {
    return await isBatchValid(batch); // your logic
  },

  // Called when validate() returns false — wire it to a challenge.
  onInvalid: async ({ batch }) => {
    await tx.challengeBatch({
      rollupId: "my-rollup",
      batchIndex: batch.batchIndex,
      proof: myFraudProofHex, // hex fraud proof
    });
  },

  // Called once per batch when its challenge window is still open and close to
  // closing: within `deadlineWarnSecs` seconds (time-based window) or
  // `deadlineWarnBlocks` blocks (block-count window). `window` says which rule
  // applies and what is left.
  onDeadline: ({ batch, window }) => {
    console.warn("challenge window closing for batch", batch.batchIndex, window);
  },
});

// Later:
watcher.stop();
```

프레임워크가 알려주는 것:

- `onBatch`를 통한 **새 배치**,
- `onDeadline`을 통한 **챌린지 윈도우 마감**, 그리고
- `onInvalid`를 통한 **무효 배치** (여러분의 `validate`가 `false`를 반환한 경우).

0.6.0부터(그리고 0.6.1에서도) 롤업의 배치 목록을 모든 페이지에 걸쳐 따라가고, 마감이 다가오면 배치를 다시 판단하며(각 배치를 처음 볼 때 한 번만 판단하는 대신, 윈도우가 아직 열려 있는 가장 오래된 배치부터 앞으로 계속 폴링합니다), 각 윈도우를 로컬 시계가 아닌 체인 팁(`getChainTip`, 노드의 상태)을 기준으로 측정합니다. 이미 `finalized`된 배치는 검증하거나 경고하지 않습니다.

`onInvalid`를 챌린지에 연결하면 Watchtower가 완전한 자동 챌린저로
바뀝니다. 설정하지 않은 채 두면 관찰 전용 모드로 실행됩니다.

:::note 챌린지 윈도우
체인은 배치의 윈도우를 두 가지 방식 중 하나로 측정하며, (Watchtower와 `qorollup status`의 배후에 있는 상태 점검이 사용하는) `batchChallengeWindow`가 어느 쪽인지 보고합니다. **블록 수 윈도우, 높이 3,742,566 이전에 제출된 배치에 대한 메인넷의 규칙(v3.2.3 및 이전):** 윈도우는 롤업에 설정된 초를 블록당 6초로 고정 환산한 값으로, 기본값 604,800의 경우 **100,800 블록**이며 배치의 `submitted_at` 높이부터 셉니다. 실제 시간은 블록 시간을 따르므로 메인넷의 ≈3.2초 블록에서는 "7일"보다 짧습니다. 패키지는 `open`과 `finalizable`을 따로 보고하는데, 패키지가 구현하는 규칙에서는 한 블록이 둘 다에 해당하기 때문입니다(`height - submitted_at <= window`인 동안 챌린지는 열려 있는 것으로 치고, `height - submitted_at >= window`부터 확정 가능합니다). **시간 기반 윈도우, v3.2.4부터(테스트넷은 높이 8,337,253부터, 메인넷은 높이 3,742,566부터 적용 중):** 업그레이드 높이부터 제출된 배치는 자신의 블록 시간을 기록하며, 그 윈도우는 해당 초 수만큼의 블록 시간입니다. Watchtower는 노드가 롤업 고유의 윈도우를 보고하면 그것을 사용하고(패키지는 이를 v3.2.4 이후로 문서화합니다), 그렇지 않으면 모듈의 기본 윈도우로 대체하므로, 자체 윈도우를 설정한 롤업에는 `challengeWindowSecs`를 전달하세요. 챌린지를 게시하려면 롤업의 챌린지 본드(`nft` 및 `custom` 프리셋의 경우 1,000 QOR)도 필요합니다. 모듈의 기본 윈도우는 메인넷에서 604,800초이고 테스트넷에서 3,600초(1시간)이므로(2026년 10월 27일 `GET /qorechain/rdk/v1/params`에서 읽음), 같은 롤업 구성이라도 테스트넷에서는 윈도우가 훨씬 짧습니다.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`는 명령줄에서 프레임워크를 실행하며, Ctrl-C를 누를 때까지 새 배치와
챌린지 윈도우 마감을 출력합니다. 전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
