---
slug: /qcaia/examples
title: Exemple QCAIA
sidebar_label: Exemple
sidebar_position: 4
---

# Exemple QCAIA

Mai jos sunt câteva exemple concrete de întrebări adresate QCAIA și tipul de răspuns pe care îl oferă. Întrebările folosesc sintaxa `/ask` de pe Discord; pe Telegram ai pune aceeași întrebare menționând **`@QCAIA_Bot`** sau QoreChain (vezi [Telegram](/qcaia/telegram)).

Aceste răspunsuri sunt **ilustrative** — parafrazări scurte, în limbaj simplu, ale documentației publice a QoreChain. Formularea reală a QCAIA va varia, iar bot-ul este în **beta**.

## Exemplul 1 — Bridge-ul

**Tu întrebi:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA răspunde:**

> Bridge-ul QoreChain este conceput să mute active între QoreChain și alte rețele, combinând transferurile QCB cu IBC. Nu este încă live: toate configurațiile de lanț sunt încă în așteptare și niciun canal IBC către vreo contraparte planificată nu este deschis (mainnet-ul nu are niciunul; testnet-ul are un singur canal de test). Pentru designul complet, vezi documentația bridge-ului.

_Află mai multe: [Arhitectura bridge-ului](/architecture/bridge-architecture)._

## Exemplul 2 — PRISM

**Tu întrebi:**

```
/ask What is PRISM?
```

**QCAIA răspunde:**

> PRISM este stratul de optimizare prin învățare prin întărire al QoreChain, conceput să regleze parametrii rețelei pe măsură ce condițiile se schimbă. Astăzi rulează în mod de observare: înregistrează observații, dar nu este încărcată încă nicio politică antrenată. Poți citi analiza aprofundată în documentația PRISM.

_Află mai multe: [Motorul de consens PRISM](/architecture/prism-consensus-engine)._

## Exemplul 3 — Distribuția comisioanelor

**Tu întrebi:**

```
/ask What is the QOR fee distribution?
```

**QCAIA răspunde:**

> Comisioanele de tranzacție de pe QoreChain sunt împărțite între mai multe destinații: 37% / 30% / 20% / 10% / 3%. Aceasta distribuie valoarea între oamenii și funcțiile care mențin rețeaua în funcțiune. Vezi documentația tokenomics pentru detalierea fiecărei cote.

## Exemplul 4 — Multi-limbă (spaniolă)

QCAIA traduce automat întrebările care nu sunt în engleză, le răspunde și răspunde înapoi. Iată cum arată în spaniolă:

**Tu întrebi:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA răspunde:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Același lucru funcționează și pe Telegram — pur și simplu scrie-ți întrebarea în limba ta în timp ce menționezi **`@QCAIA_Bot`** sau QoreChain.

## Exemplul 5 — Orientare rapidă

**Tu întrebi:**

```
/about
```

**QCAIA răspunde:**

> Sunt QCAIA, asistentul AI al QoreChain (beta). Întreabă-mă despre tehnologia, tokenomics, echipa și ecosistemul QoreChain pe Discord sau Telegram. Încearcă `/ask` urmat de întrebarea ta sau folosește `/tokenomics` pentru un rezumat rapid al QOR.

---

Ești gata să încerci tu însuți? Intră pe [Discord](/qcaia/discord) sau [Telegram](/qcaia/telegram) și adresează-i o întrebare QCAIA.
