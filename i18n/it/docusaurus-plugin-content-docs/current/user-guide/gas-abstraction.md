---
slug: /user-guide/gas-abstraction
title: Astrazione del Gas
sidebar_label: Astrazione del Gas
sidebar_position: 7
---

# Astrazione del Gas

Questa pagina descrive la funzionalità di astrazione del gas di QoreChain, il cui design consente agli utenti di pagare le commissioni di transazione in un token non nativo accettato invece che in QOR. **Oggi non è utilizzabile su nessuna delle due reti**; questa pagina spiega il design e cosa fare invece.

:::caution Non ancora disponibile
Pagare le commissioni in un token non nativo **non** funziona oggi sulla mainnet (**`qorechain-vladi`**, release del nodo **v3.2.1**) né sulla testnet (**`qorechain-diana`**).

* Le query di astrazione del gas non sono servite sulla mainnet: `qorechaind query gasabstraction accepted-tokens` stampa il proprio testo di aiuto e la route REST `/qorechain/gasabstraction/v1/config` restituisce `Not Implemented`.
* Nessun canale IBC è aperto su nessuna delle due reti, quindi non può esistere alcun saldo `ibc/USDC` o `ibc/ATOM` con cui pagare.
* Il minimo delle commissioni di rete viene verificato in `uqor`, quindi una commissione in qualsiasi altra denominazione viene rifiutata.

Paga ogni commissione in `uqor`. Questa pagina verrà aggiornata quando un token sarà accettato su una rete live.
:::

---

## Cosa funziona oggi: pagare le commissioni in uqor

Ogni transazione paga almeno **0.1 uqor per unità di gas**. Imposta insieme il limite di gas e la commissione:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Poi firmala in modalità ibrida e trasmettila con `qorechaind tx pqc cosign`, come descritto in [Comandi di transazione](/cli-reference/transaction-commands#hybrid-signing). Vedi [Commissioni e gas](/cli-reference/transaction-commands#fees-and-gas) per i limiti suggeriti per tipo di transazione.

---

## Panoramica

L'astrazione del gas è progettata per eliminare l'obbligo di possedere QOR per pagare le commissioni di transazione. Un utente che possiede un token alternativo accettato (ad esempio una stablecoin trasferita via IBC) pagherebbe la commissione in quel token, e il protocollo convertirebbe l'importo della commissione nel suo equivalente nativo prima dell'elaborazione.

---

## Design previsto

### Token accettati

La configurazione di genesis del modulo elenca questi token e tassi di conversione definiti dal protocollo. Sono rapporti di cambio ai fini delle commissioni, non prezzi di mercato. Oggi sulle reti può esistere solo `uqor` (vedi l'avviso sopra).

| Token              | Denominazione | Tasso di Conversione |
| ------------------ | ------------- | -------------------- |
| **QOR**            | `uqor`        | 1.0 (nativo)         |
| **USDC** (via IBC) | `ibc/USDC`    | 1.0                  |
| **ATOM** (via IBC) | `ibc/ATOM`    | 10.0                 |

### Come dovrebbe funzionare

Il `GasAbstractionDecorator` di QoreChain è integrato nella pipeline di elaborazione delle transazioni. Per una transazione la cui commissione è in una denominazione non nativa:

1. **Ispezione della commissione** — il decoratore legge la denominazione della commissione.
2. **Ricerca del tasso** — se la denominazione è presente nell'elenco dei token accettati, viene ricercato il tasso di conversione corrispondente.
3. **Conversione** — la commissione viene convertita nel suo equivalente nativo in `uqor`.
4. **Elaborazione standard** — la commissione convertita passa attraverso il gestore standard di deduzione delle commissioni, quindi l'elaborazione successiva delle commissioni (distribuzione ai validatori, burning, treasury, quote degli staker e dei light node) opera sull'equivalente nativo.

---

## Interrogare la configurazione

La mainnet non serve ancora le query di astrazione del gas, e il metodo JSON-RPC `qor_getGasAbstractionConfig` non è servito su nessun endpoint pubblico (vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace)). Al momento non esiste alcun modo pubblico per leggere un elenco di token accettati live.
