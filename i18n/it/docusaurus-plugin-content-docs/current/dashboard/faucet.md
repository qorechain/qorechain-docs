---
slug: /dashboard/faucet
title: Faucet
sidebar_label: Faucet
sidebar_position: 9
---

# Faucet

Il **Faucet** accredita token di test gratuiti a un indirizzo testnet così puoi provare la Dashboard, i wallet e i contratti senza spendere nulla di valore. È pensato per chiunque abbia bisogno di QOR di testnet (e, durante il builder fest, di tre token di test) per testare trasferimenti, swap, strumenti di staking e deploy di contratti sulla testnet `qorechain-diana`.

:::caution Solo testnet, nessun valore reale
Il QOR di testnet **non ha alcun valore reale**. Il Faucet non tocca mai la mainnet: non esiste un faucet per il QOR di mainnet e nulla di ciò che richiedi qui può essere trasferito sulla mainnet.
:::

## Innovazioni {#innovations}

- **Una richiesta, due tipi di token.** Una richiesta paga 100 QOR e, in una transazione separata, 1.000 fUSD, 0,5 fETH e 0,02 fBTC. Se l'invio dei token fest fallisce, il QOR arriva comunque e la scheda del risultato lo indica.
- **Un doppio cooldown.** Una richiesta ogni 24 ore per account **e** per indirizzo. Lo slot viene riservato prima che venga inviato qualsiasi cosa e rilasciato se l'invio fallisce, quindi una richiesta fallita non consuma la tua giornata.
- **I token fest sono coin bank nativi.** Sono denominazioni bank `erc20:0x...` che l'AMM on-chain, gli invii bank, IBC e i contratti QoreChain Native usano così come sono. MetaMask o un DEX EVM li vedono solo dopo una conversione `MsgConvertCoin` (vedi [Token di test Fest](#fest-tokens)).
- **Nessun numero sbagliato.** Se le informazioni del Faucet non possono essere caricate, la pagina mostra «...» al posto di un importo, mai uno ipotizzato.
- **Un destinatario `0x` viene pagato sul suo gemello `qor1`.** Un indirizzo `0x` corrisponde agli stessi 20 byte della sua forma `qor1`, quindi il servizio paga lo stesso account. Il modulo della Dashboard accetta però solo `qor1...`.

## Come si usa {#how-to-use}

1. **Accedi.** Se non hai effettuato l'accesso, la pagina mostra "Sign in to access the faucet."
2. Apri **Faucet**. In **Request Tokens**, sotto **Wallet Address**, usa "Select a wallet" o **Use my address ->** per compilare uno dei tuoi wallet della Dashboard, oppure digita un indirizzo `qor1...`.
3. La riga informativa riporta "You can request 100 QOR once every 24 hours" più gli importi del fest.
4. Seleziona **Request Tokens**.
5. In caso di successo la scheda mostra **Tokens Sent!** con l'importo, una riga **Fest tokens** (ciò che è arrivato, oppure una breve nota se è passato solo il QOR), l'hash della transazione con un pulsante di copia e **View on Explorer**.
6. Se richiedi di nuovo troppo presto compaiono "Rate Limit Reached" e "Rate limited for another HH:MM".

Il controllo dell'indirizzo nel modulo è leggero: cerca il prefisso `qor` e una lunghezza di almeno 10 caratteri, e rifiuta l'input `0x...`. Controlla tu stesso l'indirizzo prima di inviare.

Una richiesta al faucet conta anche per le [quest](/dashboard/quests) del faucet.

**Esempio minimo:** accedi, apri Faucet, seleziona **Use my address ->**, seleziona **Request Tokens**, poi **View on Explorer** con l'intestazione impostata su Testnet.

### Token di test Fest (fUSD, fETH, fBTC) {#fest-tokens}

Sulla testnet esistono tre token di test aggiuntivi per il builder fest: **fUSD** (FestUSD, 6 decimali), **fETH** (FestETH, 18 decimali) e **fBTC** (FestBTC, 8 decimali). Non hanno alcun valore e nessun legame con asset reali. La governance della testnet li ha registrati nel modulo ERC-20 (proposta 26 della testnet), quindi ciascuno esiste sia come contratto ERC-20 sull'EVM della testnet sia come coin bank che i wallet e l'AMM possono detenere. Il Faucet è configurato per inviarne un po' di ciascuno con una richiesta di QOR (al momento della stesura, 27 ottobre 2026: 1.000 fUSD, 0,5 fETH e 0,02 fBTC, con lo stesso cooldown di 24 ore); la pagina mostra gli importi esatti accanto all'importo in QOR ogni volta che li paga. I token fest arrivano in una transazione separata; il suo hash non è mostrato sulla scheda.

| Token | Decimali | Contratto ERC-20 sull'EVM della testnet | Denominazione bank (sensibile alle maiuscole) |
| --- | --- | --- | --- |
| fUSD | 6 | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH | 18 | `0x02292293c13880a26242690eb70a0e42B8E91c28` | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC | 8 | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

- **Solo testnet.** I token non esistono sulla mainnet.
- **Copia la denominazione esattamente.** La parte dell'indirizzo è in maiuscole e minuscole miste EIP-55 e la denominazione viene confrontata distinguendo maiuscole e minuscole.
- **Vedili on-chain.** `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` elenca le tre denominazioni con i loro simboli e nomi di visualizzazione.
- **Usarli da MetaMask o da un DEX EVM.** Il Faucet paga coin bank. Per detenerne uno come ERC-20 per MetaMask o un DEX EVM, convertilo con `MsgConvertCoin` (mittente il tuo indirizzo `qor1...`, destinatario un indirizzo `0x...` e l'esatta denominazione in maiuscole e minuscole miste). Per riportarlo indietro si usa `MsgConvertERC20`. Passaggi e cifre del gas sono in [Sviluppo EVM](/developer-guide/evm-development#fest-tokens). Una guida dedicata alla conversione, passo per passo, è prevista e non ancora pubblicata.
- **Pool.** L'[AMM](/architecture/amm) della testnet può metterli in pool contro `uqor`; se esiste un pool lo mostra `GET /qorechain/amm/v1/pools`. La scheda Tokens del [Wallet](/dashboard/wallet) e [Trade](/dashboard/trade) non hanno una voce per essi; controlla un saldo con `GET /cosmos/bank/v1beta1/balances/{address}`.

### Cosa fare con i token di test

- Invia e ricevi nella pagina [Wallet](/dashboard/wallet).
- Prova uno [swap](/dashboard/trade) con i token di test QoreSwap.
- Esegui il deploy e testa i contratti dallo [Smart Contract Creator](/dashboard/smart-contract-creator) prima di passare alla mainnet.
- Testa la configurazione di un nodo o di un validator sulla testnet con gli strumenti di [Nodi e validator](/dashboard/tools-hub).

## Come accedere {#how-to-access}

- **URL:** [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet).
- **Account:** è richiesto l'accesso. Non serve alcuna connessione del wallet; puoi incollare qualsiasi indirizzo `qor1...`.
- **Rete:** il Faucet **paga sempre sulla testnet** `qorechain-diana`, qualunque cosa indichi l'intestazione. Non devi portare l'intestazione su testnet per fare la richiesta. Portala su testnet solo perché **View on Explorer** apra la rete giusta; con l'intestazione su mainnet quel link mostra "Transaction Not Found".
- **Costo:** gratuito.

## Dove è pubblicato {#where-published}

| Superficie | Indirizzo | Rete | Account |
| --- | --- | --- | --- |
| Pagina Faucet | `dashboard.qorechain.io/faucet` | Solo testnet `qorechain-diana` | Accesso richiesto |
| Metadati dei token fest | `api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` | Testnet | Nessuno |

## Limiti e problemi noti {#limits}

- **100 QOR una volta ogni 24 ore**, per account e per indirizzo. I token fest seguono lo stesso cooldown.
- **Nessun faucet per la mainnet.** Il QOR di testnet non è mai scambiabile con QOR di mainnet.
- **Il modulo rifiuta gli indirizzi `0x`** e fa solo un controllo leggero di `qor`.
- **L'invio dei token fest può fallire da solo;** il QOR viene comunque pagato e la scheda lo indica. Attendi il cooldown o controlla il saldo prima di riprovare.
- **I token fest non compaiono** nella scheda Tokens del Wallet.
