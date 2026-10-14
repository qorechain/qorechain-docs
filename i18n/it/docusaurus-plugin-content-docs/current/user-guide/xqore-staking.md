---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Questa pagina descrive il meccanismo di staking per la governance xQORE così com'è **progettato**, in cui i detentori di QOR bloccherebbero i propri token per ottenere un potere di governance potenziato, con un modello di rebase PvP che premia i partecipanti a lungo termine. **xQORE non può essere utilizzato oggi su nessuna delle due reti**; nulla in questa pagina è ancora qualcosa che puoi fare.

:::warning Non ancora attivo
xQORE è abilitato nel genesis ma **non è ancora utilizzabile** su mainnet (`qorechain-vladi`, release del nodo **v3.2.1**) o testnet (`qorechain-diana`). Il nodo non ha alcun punto di ingresso di transazione, query, CLI o RPC per esso, quindi non esistono `tx xqore lock` / `unlock`, né `query xqore ...`, né route REST di xQORE, né il metodo `qor_getXQOREPosition`; nessun QOR può essere bloccato e nessuno detiene xQORE. È previsto per una futura release della chain, che cambierà anche il modo in cui le penali di uscita vengono ridistribuite, in modo che lo sblocco resti economico indipendentemente dal numero di detentori. La release sarà indicata qui al momento del rilascio.
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

| Durata del Lock      | Penale di Uscita |
| ------------------ | ------------ |
| Meno di 30 giorni  | **50%**      |
| Da 30 a 90 giorni      | **35%**      |
| Da 90 a 180 giorni     | **15%**      |
| Più di 180 giorni | **0%**       |

Secondo il design, le penali **non vengono bruciate** (`penalty_burn_rate` è `0`): l'intera penale viene ridistribuita proporzionalmente ai detentori di xQORE rimanenti (il "rebase PvP"). Il meccanismo di ridistribuzione è la parte che cambierà nella release che integrerà xQORE.

---

## Cosa non è disponibile

* **Blocco e sblocco.** Non esistono comandi `tx xqore` né un tipo di transazione per bloccare o sbloccare QOR.
* **Posizioni.** Non esiste alcuna query per una posizione xQORE su nessuna interfaccia (CLI, REST o JSON-RPC), e `total_locked` e `total_xqore` sono entrambi zero.
* **Bonus di voto.** Oggi non esiste alcun bonus di voto xQORE.

Se vuoi partecipare alla governance adesso, delega QOR a un validatore (vedi [Staking e Delega](/user-guide/staking-and-delegation)) e vota sulle proposte (vedi [Governance](/user-guide/governance)).
