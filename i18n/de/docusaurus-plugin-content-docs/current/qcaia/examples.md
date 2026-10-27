---
slug: /qcaia/examples
title: QCAIA-Beispiele
sidebar_label: Beispiele
sidebar_position: 4
---

# QCAIA-Beispiele

Nachfolgend finden Sie einige ausgearbeitete Beispiele dafür, wie man QCAIA Fragen stellt und welche Art von Antwort man erhält. Die Fragen verwenden die `/ask`-Syntax von Discord; in Telegram würden Sie dieselbe Frage stellen, indem Sie **`@QCAIA_Bot`** oder QoreChain erwähnen (siehe [Telegram](/qcaia/telegram)).

Diese Antworten sind **illustrativ** — kurze, allgemeinverständliche Paraphrasen der öffentlichen Dokumentation von QoreChain. Die tatsächliche Formulierung von QCAIA variiert, und es befindet sich in der **Beta**-Phase.

## Beispiel 1 — Die Bridge

**Sie fragen:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA antwortet:**

> Die Bridge von QoreChain ist dafür ausgelegt, Assets zwischen QoreChain und anderen Netzwerken zu bewegen, und kombiniert QCB-Transfers mit IBC. Sie ist noch nicht live: Alle Chain-Konfigurationen stehen noch aus, und kein IBC-Channel zu einer geplanten Gegenpartei ist geöffnet (das Mainnet hat keinen; das Testnet hat einen einzelnen Test-Channel). Das vollständige Design finden Sie in der Bridge-Dokumentation.

_Mehr erfahren: [Bridge-Architektur](/architecture/bridge-architecture)._

## Beispiel 2 — PRISM

**Sie fragen:**

```
/ask What is PRISM?
```

**QCAIA antwortet:**

> PRISM ist die Reinforcement-Learning-Optimierungsschicht von QoreChain, die dafür ausgelegt ist, Netzwerkparameter bei sich ändernden Bedingungen abzustimmen. Heute läuft sie im Beobachtungsmodus: Sie zeichnet Beobachtungen auf, aber es ist noch keine trainierte Policy geladen. Den ausführlichen Einblick finden Sie in der PRISM-Dokumentation.

_Mehr erfahren: [PRISM-Konsens-Engine](/architecture/prism-consensus-engine)._

## Beispiel 3 — Gebührenverteilung

**Sie fragen:**

```
/ask What is the QOR fee distribution?
```

**QCAIA antwortet:**

> Transaktionsgebühren auf QoreChain werden auf mehrere Ziele aufgeteilt: 37 % / 30 % / 20 % / 10 % / 3 %. So verteilt sich der Wert auf die Menschen und Funktionen, die das Netzwerk am Laufen halten. Die Aufschlüsselung der einzelnen Anteile finden Sie in der Tokenomics-Dokumentation.

## Beispiel 4 — Mehrsprachigkeit (Spanisch)

QCAIA übersetzt nicht-englische Fragen automatisch, beantwortet sie und antwortet. Hier auf Spanisch:

**Sie fragen:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA antwortet:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Dasselbe funktioniert in Telegram — schreiben Sie Ihre Frage einfach in Ihrer Sprache und erwähnen Sie dabei **`@QCAIA_Bot`** oder QoreChain.

## Beispiel 5 — Schnelle Orientierung

**Sie fragen:**

```
/about
```

**QCAIA antwortet:**

> Ich bin QCAIA, der QoreChain-KI-Assistent (Beta). Fragen Sie mich auf Discord oder Telegram nach der Technologie, der Tokenomics, dem Team und dem Ökosystem von QoreChain. Probieren Sie `/ask` gefolgt von Ihrer Frage, oder nutzen Sie `/tokenomics` für eine schnelle QOR-Zusammenfassung.

---

Bereit, es selbst auszuprobieren? Springen Sie zu [Discord](/qcaia/discord) oder [Telegram](/qcaia/telegram) und stellen Sie QCAIA eine Frage.
