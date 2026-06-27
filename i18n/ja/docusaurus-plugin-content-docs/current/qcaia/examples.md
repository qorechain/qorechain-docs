---
slug: /qcaia/examples
title: QCAIA の使用例
sidebar_label: 使用例
sidebar_position: 4
---

# QCAIA の使用例

以下は、QCAIA に質問してどのような回答が得られるかを示した実例です。質問は Discord の `/ask` 構文を使用しています。Telegram では、**`@QCAIA_Bot`** または QoreChain にメンションすることで同じ内容を質問できます（[Telegram](/qcaia/telegram) を参照）。

これらの回答は **説明用** であり、QoreChain の公開ドキュメントを平易な言葉で短く言い換えたものです。QCAIA の実際の文言は異なる場合があり、現在 **ベータ版** です。

## 例 1 — ブリッジ

**あなたの質問:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA の回答:**

> QoreChain のブリッジを使うと、QoreChain と他のネットワークの間で資産を移動できます。QCB 転送とクロスチェーン接続のための IBC を組み合わせており、IBC サポートはまずテストネットで展開されます。設計の詳細については、ブリッジのドキュメントを参照してください。

_詳しくは: [ブリッジアーキテクチャ](/architecture/bridge-architecture)。_

## 例 2 — PRISM

**あなたの質問:**

```
/ask What is PRISM?
```

**QCAIA の回答:**

> PRISM は QoreChain の強化学習による最適化レイヤーです。条件の変化に応じて、ネットワークのパフォーマンスと効率を継続的に調整します。詳細な解説は PRISM のドキュメントで読むことができます。

_詳しくは: [PRISM コンセンサスエンジン](/architecture/prism-consensus-engine)。_

## 例 3 — 手数料の分配

**あなたの質問:**

```
/ask What is the QOR fee distribution?
```

**QCAIA の回答:**

> QoreChain のトランザクション手数料は、複数の宛先に分配されます: 37% / 30% / 20% / 10% / 3%。これにより、ネットワークを稼働させ続ける人々と機能に価値が分散されます。各シェアの内訳については、トークノミクスのドキュメントを参照してください。

## 例 4 — 多言語対応（スペイン語）

QCAIA は英語以外の質問を自動的に翻訳し、回答して返信します。以下はスペイン語の例です:

**あなたの質問:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA の回答:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Telegram でも同じように動作します。**`@QCAIA_Bot`** または QoreChain にメンションしながら、あなたの言語で質問するだけです。

## 例 5 — クイックガイド

**あなたの質問:**

```
/about
```

**QCAIA の回答:**

> 私は QCAIA、QoreChain AI アシスタント（ベータ版）です。Discord または Telegram で、QoreChain の技術、トークノミクス、チーム、エコシステムについて質問してください。`/ask` の後に質問を入力するか、`/tokenomics` で QOR の簡単な概要を確認してください。

---

実際に試してみませんか？ [Discord](/qcaia/discord) または [Telegram](/qcaia/telegram) に参加して、QCAIA に質問してみましょう。
