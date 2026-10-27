---
slug: /dashboard/trade
title: Trade (DEX)
sidebar_label: Trade (DEX)
sidebar_position: 4
---

# Trade (DEX)

La pagina **Trade** (intitolata "QoreChain DEX") è una schermata di scambio di token di test con quattro schede: **Swap**, **Pools**, **Add Liquidity** e **My Positions**. Serve a provare un flusso di swap dall'inizio alla fine con token di test, prima che esistano pool reali. Per il design dell'automated market maker nativo di QoreChain, vedi [AMM e liquidità on-chain](/architecture/amm).

:::caution Solo token di test, per ora
Tutto ciò che c'è in questa pagina gira sulla **testnet**, qualunque rete mostri l'intestazione. Sulla mainnet la pagina è comunque protetta dall'accesso e dalla presa d'atto, ma mostra `qorechain-diana` e token di testnet. Solo cinque token di test QoreSwap vengono regolati on-chain; tutto il resto qui è un'area di prova. Il modulo AMM nativo di QoreChain è attivo, ma non è ancora stato creato alcun pool su nessuna delle due reti (`GET /qorechain/amm/v1/pools` restituisce un elenco vuoto su entrambe, verificato il 27 ottobre 2026).
:::

## Innovazioni {#innovations}

- **Swap on-chain per cinque token di test.** Gli swap tra WQOR, QUSDC, QUSDT, QWETH e QWBTC vengono eseguiti sul contratto AMM QoreSwap della EVM della testnet (chain ID 9800). La quotazione proviene da `getAmountOut` del contratto.
- **Slippage imposto nella transazione.** Lo scambio avviene come un approve seguito da `swapExactTokensForTokens`, con un output minimo derivato dall'impostazione di slippage, firmato dalla chiave EVM del wallet di test. Se il prezzo si muove oltre la tua tolleranza, lo swap fa revert invece di essere eseguito a un prezzo peggiore.
- **Token di test su richiesta.** **Get test tokens** ottiene tutti e cinque i token, una volta ogni 12 ore per token.
- **Distinzione onesta tra reale e di prova.** Le altre coppie, l'elenco dei Pools, Add Liquidity e My Positions sono un'area di prova della testnet e non sono on-chain.

## Come si usa {#how-to-use}

Prerequisiti: accesso effettuato e un wallet di test (vedi [Wallet](/dashboard/wallet#testnet)). Senza di esso la pagina mostra "Wallet Required for Trading".

### Swap

1. Il banner offre **Get test tokens**; usalo per prima cosa.
2. Scegli il token con cui paghi e inserisci un importo. La coppia predefinita, da QOR a USDC, è una coppia **di prova** che non viene regolata on-chain. Scegli **WQOR** e **QUSDC** (o una qualsiasi coppia tra i cinque) per uno swap on-chain.
3. Scegli il token da ricevere; l'importo in uscita viene quotato automaticamente.
4. Facoltativamente, regola la **tolleranza allo slippage** (la pagina ha un valore predefinito).
5. Seleziona **Swap Now**, poi **Confirm Swap**. Il risultato mostra "Swap Confirmed" con **View Transaction**.

**Recent Swaps** elenca gli swap di tutti gli utenti; **Show My History** lo filtra sui tuoi.

**Esempio minimo:** sulla testnet seleziona **Get test tokens**, vendi un po' di WQOR per QUSDC, **Swap Now**, **Confirm Swap**.

:::tip Slippage
Una tolleranza più alta rende più probabile che uno swap vada a buon fine in mercati con movimenti rapidi, ma potresti ricevere un prezzo peggiore. Il valore predefinito è adatto alla maggior parte delle coppie.
:::

### Pools

Sfoglia le card dei pool per la coppia di trading e i suoi dettagli. Una casella di ricerca filtra per simbolo del token. Questi pool sono un'area di prova, non liquidità on-chain, e le cifre che riportano non sono dati di mercato.

### Add Liquidity

1. Seleziona due token da accoppiare (uno è impostato per default su QOR). Usa **Create Pool** per una nuova coppia.
2. Inserisci un importo per il primo token; il secondo si compila per corrispondere al rapporto del pool. La pagina indica un minimo per creare un pool.
3. Esamina la tua quota, poi conferma.

### My Positions

Ogni voce mostra la coppia di token, l'importo di ciascun token, la tua quota e le commissioni guadagnate. Per uscire da una posizione seleziona **Withdraw**, poi **Request Withdrawal (x%)**; dopo un periodo di attesa seleziona **Confirm Withdraw** (oppure **Cancel Withdrawal**). Non esiste un unico pulsante "Remove Liquidity".

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/trade](https://dashboard.qorechain.io/trade).
- **Account:** è richiesto l'accesso. Per fare swap serve un wallet di test. Sulla mainnet, prima che la pagina si apra, è richiesta anche la [presa d'atto](/dashboard/overview#risk-acknowledgement) una tantum.
- **Rete:** solo contenuti della testnet; l'interruttore nell'intestazione non lo cambia.
- **Costo:** gratuito. I token di test arrivano da **Get test tokens**; il wallet di test paga il gas in QOR di test dal [Faucet](/dashboard/faucet).

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Rete | Regolato on-chain? |
| --- | --- | --- | --- |
| Swap di WQOR, QUSDC, QUSDT, QWETH, QWBTC | `dashboard.qorechain.io/trade` | EVM della testnet, chain ID 9800 | Sì |
| Altre coppie, Pools, Add Liquidity, My Positions | `dashboard.qorechain.io/trade` | Testnet | No, registro di prova |
| AMM nativo | Vedi [AMM](/architecture/amm) | Entrambe le reti | Non esiste ancora alcun pool |

## Limiti e problemi noti {#limits}

- **Nessun trading su mainnet.** La pagina ignora l'interruttore di rete e mostra contenuti della testnet anche sulla mainnet.
- **Solo cinque token vengono regolati on-chain.** I token del fest dal [Faucet](/dashboard/faucet#fest-tokens) non sono in questa pagina.
- **L'AMM nativo non ha pool** su nessuna delle due reti. I pool reali verranno descritti quando esisteranno.
- **Le cifre dei pool** sono dati di prova, non dati di mercato.
- **I token della testnet non hanno valore** e non possono essere scambiati con nulla.

## Correlati

- [AMM e liquidità on-chain](/architecture/amm) - tipi di pool e curve di prezzo.
- [Wallet](/dashboard/wallet) - controlla i saldi prima e dopo uno swap.
