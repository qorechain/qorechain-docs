---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Questa pagina descrive il meccanismo di staking per la governance xQORE così com'è **progettato**, in cui i detentori di QOR bloccherebbero i propri token per ottenere un potere di governance potenziato, con un modello di rebase PvP che premia i partecipanti a lungo termine. **xQORE non può essere utilizzato oggi su nessuna delle due reti**; nulla in questa pagina è ancora qualcosa che puoi fare.

:::warning Non ancora attivo
xQORE è abilitato nel genesis ma **non è ancora utilizzabile** su mainnet (`qorechain-vladi`, release del nodo **v3.2.4**) o testnet (`qorechain-diana`, release del nodo **v3.2.4**); nessuna delle due release cambia questo stato (verificato il 23 ottobre 2026). Il nodo non ha alcun punto di ingresso di transazione, query, CLI o RPC per esso (la route REST `/qorechain/xqore/v1/params` restituisce `Not Implemented` su entrambe le reti), quindi non esistono `tx xqore lock` / `unlock`, né `query xqore ...`, né route REST di xQORE, né il metodo `qor_getXQOREPosition`; nessun QOR può essere bloccato e nessuno detiene xQORE. È previsto per una futura release della chain, che cambierà anche il modo in cui le penali di uscita vengono ridistribuite, in modo che lo sblocco resti economico indipendentemente dal numero di detentori. La release sarà indicata qui al momento del rilascio.
:::

---

## Panoramica

Nel design, bloccare QOR conia xQORE con un **rapporto 1:1**, e xQORE conta con **peso doppio** nella formula del potere di voto QDRW:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW stesso è disattivato sulle reti attive e i voti di governance vengono conteggiati solo sullo stake in bonding (vedi [Governance](/user-guide/governance#voting-power)), quindi anche una volta rilasciato xQORE non modificherà il potere di voto finché QDRW non sarà abilitato da una futura release.

---

## Piano delle penali di uscita previsto

La configurazione del genesis definisce una penale di uscita che diminuisce quanto più a lungo il QOR è rimasto bloccato:

| Durata del Lock    | Penale di Uscita |
| ------------------ | ---------------- |
| Meno di 30 giorni  | **50%**          |
| Da 30 a 90 giorni  | **35%**          |
| Da 90 a 180 giorni | **15%**          |
| Più di 180 giorni  | **0%**           |

Secondo il design, le penali **non vengono bruciate** (`penalty_burn_rate` è `0`): l'intera penale viene ridistribuita proporzionalmente ai detentori di xQORE rimanenti (il "rebase PvP"). Il meccanismo di ridistribuzione è la parte che cambierà nella release che integrerà xQORE.

---

## Cosa non è disponibile

* **Blocco e sblocco.** Non esistono comandi `tx xqore` né un tipo di transazione per bloccare o sbloccare QOR.
* **Posizioni.** Non esiste alcuna query per una posizione xQORE su nessuna interfaccia (CLI, REST o JSON-RPC), e `total_locked` e `total_xqore` sono entrambi zero.
* **Bonus di voto.** Oggi non esiste alcun bonus di voto xQORE.

Se vuoi partecipare alla governance adesso, delega QOR a un validatore (vedi [Staking e Delega](/user-guide/staking-and-delegation)) e vota sulle proposte (vedi [Governance](/user-guide/governance)).

---

## Lo staking con blocco temporale è una funzione diversa (v3.2.4) {#staking-tiers}

La release **v3.2.4**, che gira sulla testnet dal 19 ottobre 2026 e sulla mainnet dal 23 ottobre 2026 (altezza 3.742.566, proposta di governance 13), aggiunge un modulo separato, `x/stakingtier`, per lo **staking facoltativo con blocco temporale**. Non è xQORE: non conia xQORE, non modifica il potere di voto e non tocca i parametri xQORE descritti sopra. In sintesi:

* Un delegatore blocca una delega a un validatore per un termine scelto (il modulo offre 3, 6 e 12 mesi). Mentre il blocco è in corso, l'importo bloccato non può essere annullato (undelegate) né ridelegato, attraverso alcun percorso di messaggio (una transazione, authz, un contratto o la governance).
* I blocchi hanno una dimensione minima e un limite al numero che un singolo delegatore può detenere; leggili con `GET /qorechain/stakingtier/v1/params`.
* Una componente di ricompensa aggiuntiva definita dai parametri del modulo viene accreditata per epoca di inflazione e riscossa con un messaggio separato. L'entità di quella componente è un parametro del modulo e non è indicata in questa pagina.
* Un blocco può essere rilasciato in anticipo. Il rilascio anticipato fa perdere ciò che è maturato e non è stato riscosso e comporta una penale, di cui una parte viene bruciata.
* I blocchi e lo stato dell'account del modulo sono leggibili su `/qorechain/stakingtier/v1/locks/{holder}` e `/qorechain/stakingtier/v1/pool`.

Il modulo risponde su entrambe le reti, ad esempio `GET https://api.qore.host/qorechain/stakingtier/v1/params`. La normale delega è trattata in [Staking e Delega](/user-guide/staking-and-delegation).
