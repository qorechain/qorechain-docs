---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La pagina **Trade** è la schermata di scambio di token della Dashboard: scambia un token con un altro e fornisci liquidità a un pool, senza order book off-chain. Per il design dell'automated market maker (AMM) nativo di QoreChain, vedi [AMM e liquidità on-chain](/architecture/amm).

:::caution Solo token di test, per ora
I pool e i token di questa pagina sono token di test: gli swap vengono eseguiti su un contratto di swap distribuito sulla EVM della testnet, e la pagina ha un pulsante **Get test tokens** per ottenerli. Non considerare nulla di ciò che è mostrato qui come liquidità di valore reale né come prezzo di mercato. Il modulo AMM nativo di QoreChain è attivo, ma non è ancora stato creato alcun pool su nessuna delle due reti. Questa pagina verrà aggiornata quando saranno disponibili pool reali.
:::

Fare trading richiede un account con accesso effettuato e un wallet — vedi [Accedi](/dashboard/overview#sign-in) e [Collega il tuo wallet](/dashboard/overview#connect-your-wallet).

La pagina ha quattro schede: **Swap**, **Pools**, **Add Liquidity** e **My Positions**.

## Swap

Scambia un token con un altro:

1. Scegli il token con cui stai pagando e inserisci un importo.
2. Scegli il token che desideri ricevere — l'importo in uscita viene quotato automaticamente.
3. Facoltativamente, regola la tua **tolleranza allo slippage** (la massima variazione di prezzo che accetterai; valore predefinito 0,5%).
4. Seleziona **Swap** e conferma.

Un pannello della cronologia degli swap elenca i tuoi swap passati con i token, gli importi, il tasso, l'ora e lo stato.

:::tip Slippage
Una tolleranza allo slippage più alta rende più probabile che uno swap vada a buon fine in mercati con movimenti rapidi, ma potresti ricevere un prezzo meno favorevole. Il valore predefinito è adatto alla maggior parte delle coppie.
:::

## Pools

Sfoglia i pool di liquidità disponibili. Ogni card di pool mostra la coppia di trading, la liquidità totale, il volume delle 24 ore e il numero di provider. Una casella di ricerca filtra i pool per simbolo del token.

## Add Liquidity

Fornisci liquidità a un pool e ricevi una quota delle sue commissioni di swap:

1. Seleziona i due token da accoppiare (uno è impostato per default su QOR).
2. Inserisci un importo per il primo token — il secondo importo si compila automaticamente per corrispondere al rapporto attuale del pool.
3. Esamina la tua quota prevista del pool, quindi seleziona **Add Liquidity** e conferma.

Ricevi token liquidity provider (LP) che rappresentano la tua posizione.

## My Positions

Visualizza le posizioni di liquidità che detieni. Ogni voce mostra la coppia di token, l'importo in ciascun token, la tua quota del pool e le commissioni guadagnate. Seleziona **Remove Liquidity** su una posizione per visualizzare in anteprima i token che riceveresti e prelevare la tua quota.

## Correlati

- [AMM e liquidità on-chain](/architecture/amm) — tipi di pool e curve di prezzo.
- [Wallet](/dashboard/wallet) — controlla i saldi prima e dopo uno swap.
