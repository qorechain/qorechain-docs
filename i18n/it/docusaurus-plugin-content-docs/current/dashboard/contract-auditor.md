---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Il **Contract Auditor** esegue un'analisi di sicurezza basata sull'IA di uno smart contract, alimentata da **QCAI**. Invia un contratto e QCAI lo esamina alla ricerca di vulnerabilità, assegna un livello di rischio complessivo e un punteggio di sicurezza, e spiega ogni risultato con una correzione consigliata. Come il [Smart Contract Creator](/dashboard/smart-contract-creator), l'Auditor funziona su **17 blockchain** per gli strumenti di IA.

## Eseguire un audit

1. Apri l'**Auditor** e fornisci il contratto che vuoi analizzare.
2. Avvia l'audit. QCAI esamina il contratto e produce un report.

## Leggere il report

Un report di audit si apre in una pagina dedicata e include:

- **Livello di rischio** — una valutazione complessiva (ad esempio critico, alto, medio o basso), codificata a colori per una rapida lettura.
- **Punteggio di sicurezza** — un punteggio complessivo da 0 a 100.
- **Suddivisione per gravità** — quanti risultati rientrano in ciascun livello di gravità (critico, alto, medio, basso e informativo).
- **Riepilogo** — una breve panoramica della postura di sicurezza del contratto.

### Risultati

Ogni risultato elenca la sua gravità, un titolo, la posizione nel codice a cui fa riferimento, una descrizione del problema e una correzione consigliata. Quando un contratto non presenta problemi a un determinato livello, il report lo segnala.

Dove applicabile, il report include anche sezioni per raccomandazioni generali, ottimizzazioni del gas, best practice e aspetti positivi che il contratto già gestisce correttamente.

## Esaminare gli audit precedenti

L'elenco degli audit mostra i tuoi report precedenti in una tabella con il nome del contratto, la blockchain, il livello di rischio, il punteggio di sicurezza e la data di creazione di ciascuno. Una casella di ricerca filtra per nome del contratto o blockchain. Seleziona una qualsiasi riga per riaprire il report completo e usa il link della pagina del report per condividerlo.

:::tip Esegui l'audit prima del deploy
Esegui un audit come ultimo passaggio prima del deploy e ripetilo dopo ogni modifica. Considera i risultati come una guida da verificare, non come una garanzia automatica — combina il report con i tuoi test sulla [testnet](/getting-started/connecting-to-testnet).
:::

## Correlati

- [Smart Contract Creator](/dashboard/smart-contract-creator) — genera contratti con QCAI.
- [Post-Quantum Security](/architecture/post-quantum-security) — come QoreChain protegge account e firme.
