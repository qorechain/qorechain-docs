---
slug: /qcaia/examples
title: Esempi di QCAIA
sidebar_label: Esempi
sidebar_position: 4
---

# Esempi di QCAIA

Di seguito trovi alcuni esempi pratici di domande poste a QCAIA e del tipo di risposta che fornisce. Le domande usano la sintassi `/ask` di Discord; su Telegram porresti la stessa domanda menzionando **`@QCAIA_Bot`** o QoreChain (vedi [Telegram](/qcaia/telegram)).

Queste risposte sono **illustrative** — brevi parafrasi in linguaggio semplice della documentazione pubblica di QoreChain. Il testo effettivo di QCAIA varierà, ed è in **beta**.

## Esempio 1 — Il bridge

**Tu chiedi:**

```
/ask How does QoreChain's bridge work?
```

**QCAIA risponde:**

> Il bridge di QoreChain è progettato per spostare asset tra QoreChain e altre reti, combinando i trasferimenti QCB con IBC. Non è ancora attivo: tutte le configurazioni delle chain sono ancora in sospeso e nessun canale IBC verso una controparte pianificata è aperto (la mainnet non ne ha; la testnet ha un solo canale di test). Per il design completo, consulta la documentazione del bridge.

_Scopri di più: [Architettura del Bridge](/architecture/bridge-architecture)._

## Esempio 2 — PRISM

**Tu chiedi:**

```
/ask What is PRISM?
```

**QCAIA risponde:**

> PRISM è il livello di ottimizzazione tramite apprendimento per rinforzo di QoreChain, progettato per regolare i parametri della rete al variare delle condizioni. Oggi funziona in modalità di osservazione: registra osservazioni, ma non è ancora caricata alcuna policy addestrata. Puoi leggere l'approfondimento nella documentazione di PRISM.

_Scopri di più: [Motore di Consenso PRISM](/architecture/prism-consensus-engine)._

## Esempio 3 — Distribuzione delle commissioni

**Tu chiedi:**

```
/ask What is the QOR fee distribution?
```

**QCAIA risponde:**

> Le commissioni di transazione su QoreChain sono ripartite tra diverse destinazioni: 37% / 30% / 20% / 10% / 3%. Questo distribuisce il valore tra le persone e le funzioni che mantengono in funzione la rete. Consulta la documentazione sulla tokenomics per il dettaglio di ciascuna quota.

## Esempio 4 — Multilingua (spagnolo)

QCAIA traduce automaticamente le domande non in inglese, vi risponde e replica. Eccolo in spagnolo:

**Tu chiedi:**

```
/ask ¿Qué es QoreChain?
```

**QCAIA risponde:**

> QoreChain es una blockchain de capa 1 con seguridad post-cuántica, un motor de IA (QCAI) y el motor de consenso PRISM. Está diseñada para ser rápida, segura y preparada para el futuro.

Lo stesso funziona su Telegram — scrivi semplicemente la tua domanda nella tua lingua menzionando **`@QCAIA_Bot`** o QoreChain.

## Esempio 5 — Orientamento rapido

**Tu chiedi:**

```
/about
```

**QCAIA risponde:**

> Sono QCAIA, l'Assistente AI di QoreChain (beta). Chiedimi della tecnologia, della tokenomics, del team e dell'ecosistema di QoreChain su Discord o Telegram. Prova `/ask` seguito dalla tua domanda, oppure usa `/tokenomics` per un rapido riepilogo di QOR.

---

Pronto a provarlo tu stesso? Entra su [Discord](/qcaia/discord) o [Telegram](/qcaia/telegram) e poni una domanda a QCAIA.
