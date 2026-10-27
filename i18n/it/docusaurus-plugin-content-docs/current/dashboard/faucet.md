---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Il **Faucet** ti fornisce token di test gratuiti così puoi provare la Dashboard senza spendere nulla di valore. È uno strumento **solo per testnet** — usalo sulla testnet (`qorechain-diana`) per finanziare il tuo indirizzo prima di testare trasferimenti, swap, staking e deploy di contratti.

:::caution Solo testnet — nessun valore reale
Il QOR di testnet **non ha alcun valore reale**. Il Faucet non tocca mai la mainnet: non esiste un faucet per il QOR di mainnet e nulla di ciò che richiedi qui può essere trasferito sulla mainnet.
:::

## Richiedere token di test

1. Accedi, imposta la Dashboard sulla **testnet** e apri il **Faucet**.
2. Inserisci l'indirizzo da finanziare (`qor1...`). Se il tuo wallet è connesso, seleziona **Use my address** per compilarlo automaticamente. Il modulo conferma che l'indirizzo è valido prima di poter proseguire.
3. Seleziona il pulsante di richiesta. Il finanziamento viene elaborato in pochi secondi.

Quando la richiesta va a buon fine, una scheda di conferma mostra l'importo inviato e l'hash della transazione, con un pulsante di copia e un link per aprire la transazione nell'[Explorer](/dashboard/explorer). Dal 27 ottobre 2026 una richiesta può pagare anche i tre [token di test Fest](#fest-tokens); la scheda ha allora una riga **Fest tokens** che elenca ciò che è arrivato, oppure una breve nota se è passato solo il QOR.

## Limiti

Ogni indirizzo può effettuare una richiesta al Faucet una volta per ciascun periodo di cooldown. La pagina mostra l'importo esatto per richiesta e il cooldown prima di poter richiedere di nuovo. Se richiedi nuovamente troppo presto, il Faucet ti indica quando sarai di nuovo idoneo.

## Token di test Fest (fUSD, fETH, fBTC) {#fest-tokens}

Sulla testnet esistono tre token di test aggiuntivi per il builder fest: **fUSD** (FestUSD, 6 decimali), **fETH** (FestETH, 18 decimali) e **fBTC** (FestBTC, 8 decimali). Sono semplici token di test senza valore e senza alcun legame con asset reali. La governance della testnet li ha registrati nel modulo ERC-20 (proposta 26 della testnet), quindi ciascuno esiste sia come contratto ERC-20 sull'EVM della testnet sia come coin bank che i wallet e l'AMM possono detenere. Il Faucet è configurato per inviarne un po' di ciascuno con una richiesta di QOR (al momento della stesura, 27 ottobre 2026: 1.000 fUSD, 0,5 fETH e 0,02 fBTC, con lo stesso cooldown di 24 ore del QOR); la pagina mostra gli importi esatti accanto all'importo in QOR ogni volta che il Faucet li paga.

| Token | Decimali | Contratto ERC-20 sull'EVM della testnet | Denominazione bank (sensibile alle maiuscole) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

Da sapere:

- **Solo testnet.** I token non esistono sulla mainnet.
- **Copia la denominazione esattamente.** La parte dell'indirizzo è in maiuscole e minuscole miste EIP-55 e la denominazione viene confrontata distinguendo maiuscole e minuscole.
- **Vedili on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` elenca le tre denominazioni con i loro simboli e nomi di visualizzazione.
- **Conversione tra le due forme.** Spostare un saldo ERC-20 in coin bank (`MsgConvertERC20`) richiede il mittente come indirizzo bech32 `qor1...`.
- **Pool.** L'[AMM](/architecture/amm) della testnet può metterli in pool contro `uqor`; se esiste un pool lo mostra `GET /qorechain/amm/v1/pools`. Le pagine [Wallet](/dashboard/wallet) e [Trade](/dashboard/trade) non hanno una voce dedicata per essi; controlla un saldo con `GET /cosmos/bank/v1beta1/balances/{address}`.

## Cosa fare con i token di test

I token di test ti permettono di provare la rete end-to-end sulla testnet:

- Invia e ricevi nella pagina [Wallet](/dashboard/wallet).
- Prova uno [swap](/dashboard/trade) sull'AMM.
- [Delega](/dashboard/staking-and-validators) a un validatore.
- Esegui il deploy e testa i contratti prima di passare alla mainnet.

:::note Solo valore di test
I token del Faucet esistono sulla testnet e non hanno alcun valore reale. Quando sei pronto per l'uso in produzione, passa alla mainnet (`qorechain-vladi`).
:::
