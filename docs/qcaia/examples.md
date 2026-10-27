---
slug: /qcaia/examples
title: QCAIA Examples
sidebar_label: Examples
sidebar_position: 4
---

# QCAIA Examples

Below are a few worked examples of asking QCAIA questions and the kind of answer it gives. The questions use Discord's `/ask` syntax; on Telegram you'd ask the same thing by mentioning **`@QCAIA_Bot`** or QoreChain (see [Telegram](/qcaia/telegram)).

These answers are **illustrative** — short, plain-language paraphrases of QoreChain's public documentation. QCAIA's live wording will vary, and it is in **beta**.

## Example 1 — The bridge

**You ask:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA replies:**

> QoreChain's bridge is designed to move assets between QoreChain and other networks, combining QCB transfers with IBC. It is not live yet: all chain configurations are still pending and no IBC channel to any planned counterparty is open (mainnet has none; the testnet has a single test channel). For the full design, see the bridge documentation.

_Learn more: [Bridge Architecture](/architecture/bridge-architecture)._

## Example 2 — PRISM

**You ask:**

```
/ask What is PRISM?
```

**QCAIA replies:**

> PRISM is QoreChain's reinforcement-learning optimization layer, designed to tune network parameters as conditions change. Today it runs in observation mode: it records observations but no trained policy is loaded yet. You can read the deep dive in the PRISM documentation.

_Learn more: [PRISM Consensus Engine](/architecture/prism-consensus-engine)._

## Example 3 — Fee distribution

**You ask:**

```
/ask What is the QOR fee distribution?
```

**QCAIA replies:**

> Transaction fees on QoreChain are split across several destinations: 37% / 30% / 20% / 10% / 3%. This spreads value across the people and functions that keep the network running. See the tokenomics documentation for the breakdown of each share.

## Example 4 — Multi-language (Spanish)

QCAIA automatically translates non-English questions, answers them, and replies. Here it is in Spanish:

**You ask:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA replies:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

The same works on Telegram — just write your question in your language while mentioning **`@QCAIA_Bot`** or QoreChain.

## Example 5 — Quick orientation

**You ask:**

```
/about
```

**QCAIA replies:**

> I'm QCAIA, the QoreChain AI Assistant (beta). Ask me about QoreChain's technology, tokenomics, team, and ecosystem on Discord or Telegram. Try `/ask` followed by your question, or use `/tokenomics` for a quick QOR summary.

---

Ready to try it yourself? Jump into [Discord](/qcaia/discord) or [Telegram](/qcaia/telegram) and ask QCAIA a question.
