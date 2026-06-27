---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Il **Faucet** ti fornisce token di test gratuiti così puoi provare la Dashboard senza spendere nulla di valore. È uno strumento **solo per testnet** — usalo sulla testnet (`qorechain-diana`) per finanziare il tuo indirizzo prima di testare trasferimenti, swap, staking e deploy di contratti.

## Richiedere token di test

1. Connettiti alla **testnet** e apri il **Faucet**.
2. Inserisci l'indirizzo da finanziare (`qor1...`). Se il tuo wallet è connesso, seleziona **Use my address** per compilarlo automaticamente. Il modulo conferma che l'indirizzo è valido prima di poter proseguire.
3. Seleziona il pulsante di richiesta. Il finanziamento viene elaborato in pochi secondi.

Quando la richiesta va a buon fine, una scheda di conferma mostra l'importo inviato e l'hash della transazione, con un pulsante di copia e un link per aprire la transazione nell'[Explorer](/dashboard/explorer).

## Limiti

Ogni indirizzo può effettuare una richiesta al Faucet una volta per ciascun periodo di cooldown. La pagina mostra l'importo esatto per richiesta e il cooldown prima di poter richiedere di nuovo. Se richiedi nuovamente troppo presto, il Faucet ti indica quando sarai di nuovo idoneo.

## Cosa fare con i token di test

I token di test ti permettono di provare la rete end-to-end sulla testnet:

- Invia e ricevi nella pagina [Wallet](/dashboard/wallet).
- Prova uno [swap](/dashboard/trade) sull'AMM.
- [Delega](/dashboard/staking-and-validators) a un validatore.
- Esegui il deploy e testa i contratti prima di passare alla mainnet.

:::note Solo valore di test
I token del Faucet esistono sulla testnet e non hanno alcun valore reale. Quando sei pronto per l'uso in produzione, passa alla mainnet (`qorechain-vladi`).
:::
