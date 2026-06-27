---
slug: /qcaia/examples
title: QCAIA 예시
sidebar_label: 예시
sidebar_position: 4
---

# QCAIA 예시

아래는 QCAIA에게 질문하고 그것이 어떤 답변을 주는지 보여주는 몇 가지 실제 예시입니다. 질문은 Discord의 `/ask` 구문을 사용합니다. Telegram에서는 **`@QCAIA_Bot`** 또는 QoreChain을 멘션하여 동일한 내용을 질문하면 됩니다([Telegram](/qcaia/telegram) 참조).

이 답변들은 **설명용**입니다 — QoreChain의 공개 문서를 짧고 평이한 언어로 의역한 것입니다. QCAIA의 실제 표현은 달라질 수 있으며, 현재 **베타** 상태입니다.

## 예시 1 — 브리지

**질문:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA 답변:**

> QoreChain의 브리지는 QoreChain과 다른 네트워크 간에 자산을 이동할 수 있게 해줍니다. QCB 전송과 IBC를 결합하여 크로스체인 연결성을 제공하며, IBC 지원은 먼저 테스트넷에서 출시됩니다. 전체 설계는 브리지 문서를 참조하세요.

_자세히 알아보기: [Bridge Architecture](/architecture/bridge-architecture)._

## 예시 2 — PRISM

**질문:**

```
/ask What is PRISM?
```

**QCAIA 답변:**

> PRISM은 QoreChain의 강화학습 최적화 계층입니다. 조건이 변화함에 따라 성능과 효율을 위해 네트워크를 지속적으로 튜닝합니다. PRISM 문서에서 심층 분석을 읽어볼 수 있습니다.

_자세히 알아보기: [PRISM Consensus Engine](/architecture/prism-consensus-engine)._

## 예시 3 — 수수료 분배

**질문:**

```
/ask What is the QOR fee distribution?
```

**QCAIA 답변:**

> QoreChain의 거래 수수료는 여러 대상으로 분배됩니다: 37% / 30% / 20% / 10% / 3%. 이는 네트워크를 운영하는 사람들과 기능들에 가치를 분산시킵니다. 각 몫의 세부 내역은 토크노믹스 문서를 참조하세요.

## 예시 4 — 다국어 (스페인어)

QCAIA는 영어가 아닌 질문을 자동으로 번역하고, 답변한 후 회신합니다. 다음은 스페인어 예시입니다:

**질문:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA 답변:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Telegram에서도 동일하게 작동합니다 — **`@QCAIA_Bot`** 또는 QoreChain을 멘션하면서 자신의 언어로 질문을 작성하기만 하면 됩니다.

## 예시 5 — 빠른 안내

**질문:**

```
/about
```

**QCAIA 답변:**

> 저는 QoreChain AI 어시스턴트(베타)인 QCAIA입니다. Discord나 Telegram에서 QoreChain의 기술, 토크노믹스, 팀, 생태계에 대해 물어보세요. `/ask` 뒤에 질문을 입력하거나, 빠른 QOR 요약을 보려면 `/tokenomics`를 사용하세요.

---

직접 사용해 볼 준비가 되셨나요? [Discord](/qcaia/discord) 또는 [Telegram](/qcaia/telegram)에 들어가서 QCAIA에게 질문해 보세요.
