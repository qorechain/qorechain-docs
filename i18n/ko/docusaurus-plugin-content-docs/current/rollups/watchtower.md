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

:::caution 초기 단계: 감시할 대상이 없으며, 0.5.0의 마감 알림은 잘못되어 있음
Watchtower는 RDK REST 클라이언트를 통해 배치를 읽으며, `/qorechain/rdk/v1/…` 경로는 두 네트워크 모두에서 제공됩니다. 어느 네트워크에서도 롤업이 생성된 적이 없으므로(2026년 10월 20일 확인) 아직 감시할 대상이 없습니다. `@qorechain/rdk` 0.5.0에서는 챌린지 윈도우 마감 로직도 신뢰할 수 없습니다. 배치의 `submittedAt`은 **블록 높이**인데, Watchtower(와 `qorollup status`의 배후에 있는 상태 점검)는 여기에 초 단위의 윈도우를 더한 뒤 그 합을 벽시계 시간과 비교하므로, `secondsRemaining`은 의미가 없으며 `onDeadline`은 배치가 처음 감지되는 즉시 발생합니다. 결정을 내릴 때 `onDeadline`이나 카운트다운을 사용하지 마세요. 마감 시각은 직접 계산하세요(아래 참고 참조). 또한 감시자는 배치의 첫 페이지(50개)만 읽습니다.
:::

## `watchBatches`

```ts
import { createRdkClient, watchBatches } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// `tx` is a signing client that produces the hybrid (post-quantum) signature
// the networks require: pass `pqcKeypair` to `RdkClient.connectTx` (see
// "RDK 0.5.0 limits" in Deploying a Rollup). Without it the transaction is
// classical-only and refused.
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

  // Called when a batch is within `deadlineWarnSecs` of its deadline. In 0.5.0 the
  // deadline mixes a block height with the wall clock, so treat this as unreliable.
  onDeadline: ({ batch, secondsRemaining }) => {
    console.warn("challenge window alert for batch", batch.batchIndex, secondsRemaining);
  },
});

// Later:
watcher.stop();
```

프레임워크가 알려주는 것:

- `onBatch`를 통한 **새 배치**,
- `onDeadline`을 통한 **챌린지 윈도우 마감**, 그리고
- `onInvalid`를 통한 **무효 배치** (여러분의 `validate`가 `false`를 반환한 경우).

`onInvalid`를 챌린지에 연결하면 Watchtower가 완전한 자동 챌린저로
바뀝니다. 설정하지 않은 채 두면 관찰 전용 모드로 실행됩니다.

:::note 챌린지 윈도우
배치의 마감 시각은 초가 아니라 블록 단위로 계산하세요. `submitted_at`(블록 높이)에 윈도우를 더하면 됩니다. **메인넷(v3.2.3)** 에서 윈도우는 기본값 604,800 "초"를 블록당 6초로 고정 환산한 **100,800 블록**입니다(실제 시간은 블록 시간을 따르므로, 메인넷의 ≈3.2초 블록에서는 "7일"보다 짧습니다). **테스트넷에서만(v3.2.4)**, 높이 8,337,253부터 제출된 배치는 블록 시간의 초 단위로 측정되는 윈도우를 갖습니다. 챌린지를 게시하려면 롤업의 챌린지 본드(`nft` 및 `custom` 프리셋의 경우 1,000 QOR)도 필요합니다.
:::

## CLI

```bash
qorollup watchtower my-rollup
```

`watchtower`는 명령줄에서 프레임워크를 실행하며, Ctrl-C를 누를 때까지 새 배치와
챌린지 윈도우 마감을 출력합니다. 전체 `qorollup` 운영자 CLI는
[롤업 배포하기](/rollups/deploying-a-rollup)를 참조하세요.
