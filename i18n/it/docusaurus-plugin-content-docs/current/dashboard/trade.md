---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La pagina **Trade** è l'exchange decentralizzato della Dashboard. Ti consente di scambiare token e fornire liquidità direttamente sull'automated market maker (AMM) nativo on-chain di QoreChain — senza order book off-chain e senza alcuno smart contract esterno richiesto. Gli swap e le azioni di liquidità vengono regolati a livello di protocollo. Per il design alla base, vedi [AMM e liquidità on-chain](/architecture/amm).

Collega il tuo wallet per fare trading — vedi [Panoramica e primi passi](/dashboard/overview#connect-your-wallet).

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

Sfoglia i pool di liquidità disponibili. Ogni card di pool mostra la coppia di trading, la liquidità totale, il volume delle 24 ore, l'APR e il numero di provider. Una casella di ricerca filtra i pool per simbolo del token.

## Add Liquidity

Fornisci liquidità per guadagnare una quota delle commissioni di swap:

1. Seleziona i due token da accoppiare (uno è impostato per default su QOR).
2. Inserisci un importo per il primo token — il secondo importo si compila automaticamente per corrispondere al rapporto attuale del pool.
3. Esamina la tua quota prevista del pool, quindi seleziona **Add Liquidity** e conferma.

Ricevi token liquidity provider (LP) che rappresentano la tua posizione.

## My Positions

Visualizza le posizioni di liquidità che detieni. Ogni voce mostra la coppia di token, l'importo in ciascun token, la tua quota del pool, le commissioni guadagnate e l'APR. Seleziona **Remove Liquidity** su una posizione per visualizzare in anteprima i token che riceveresti e prelevare la tua quota.

## Correlati

- [AMM e liquidità on-chain](/architecture/amm) — tipi di pool e curve di prezzo.
- [Wallet](/dashboard/wallet) — controlla i saldi prima e dopo uno swap.
