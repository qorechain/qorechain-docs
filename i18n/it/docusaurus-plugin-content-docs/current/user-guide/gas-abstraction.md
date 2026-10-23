---
slug: /user-guide/gas-abstraction
title: Astrazione del Gas
sidebar_label: Astrazione del Gas
sidebar_position: 7
---

# Astrazione del Gas

L'astrazione del gas consente a un utente di pagare la commissione di una transazione in un token non nativo accettato invece che in QOR. Il codice di conversione delle commissioni fa parte della chain, ma **oggi su nessuna delle due reti è accettato alcun token non nativo**, quindi ogni commissione viene pagata in QOR. Questa pagina spiega cosa è attivo, come funziona la conversione così come è stata realizzata e cosa fare invece.

:::caution Non ancora utilizzabile: paga ogni commissione in uqor
Sulla mainnet (**`qorechain-vladi`**) e sulla testnet (**`qorechain-diana`**), entrambe sulla release del nodo **v3.2.4**, verificato il 23 ottobre 2026:

* L'elenco attivo dei token accettati contiene **solo `uqor`**. La conversione delle commissioni è stata attivata con la v3.2.2, ma nient'altro è elencato, il limite di conversione per blocco è `0` (conversione disattivata) e il float di conversione non detiene alcun saldo. Una commissione pagata in qualsiasi altra denominazione viene rifiutata con un errore "denom not accepted for fee payment", sia in simulazione sia in una transazione reale.
* Nessun canale o client IBC esiste su nessuna delle due reti, quindi non può esistere alcun saldo `ibc/…` con cui pagare.

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

## La configurazione attiva {#live-configuration}

Il modulo serve la propria configurazione via REST e gRPC. Questi sono i valori su entrambe le reti al 23 ottobre 2026:

| Campo | Valore | Significato |
| --- | --- | --- |
| `enabled` | `true` | Interruttore del modulo |
| `native_denom` | `uqor` | La denominazione in cui ogni commissione viene infine pagata |
| `accepted_tokens` | solo `uqor` | Token che possono pagare una commissione. `uqor` non richiede alcuna fonte di prezzo |
| `premium_bps` | `300` | La quota del valore di una commissione convertita che il float trattiene per coprire il proprio rischio di prezzo (3 %) |
| `max_tip_multiplier` | `3` | Una commissione convertita non può superare questo multiplo della commissione minima per il suo gas; `0` significherebbe nessun limite |
| `float_min` | `0` | Il saldo nativo che il float tiene sempre da parte |
| `block_conversion_cap` | `0` | Il massimo che il float paga per blocco; `0` significa che la conversione è disattivata |

Le versioni precedenti di questa pagina mostravano voci segnaposto `ibc/USDC` e `ibc/ATOM` con tassi fissi. Non sono nell'elenco attivo.

Leggila tu stesso:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` riporta `rate`, `effective_rate` (il tasso meno il premio), `price_source` e se il token è `usable` a questa altezza, con un `reason` quando non lo è. `float` riporta l'indirizzo e i saldi del float e l'uso del blocco corrente rispetto a `block_cap`. Il metodo JSON-RPC `qor_getGasAbstractionConfig` non è servito su nessun endpoint pubblico (vedi [il namespace `qor_`](/api-reference/json-rpc-qor_-namespace)); usa REST o gRPC.

---

## Come funziona la conversione (così come è stata realizzata) {#how-it-works}

Dalla v3.2.2 il decoratore delle commissioni instrada ogni transazione lungo uno di due percorsi:

* Una commissione in `uqor`, o in più di una denominazione, segue il **percorso nativo**, invariato.
* Una commissione in **esattamente una** denominazione non nativa segue il **percorso di conversione**.

Sul percorso di conversione:

1. **Accettata?** La denominazione deve essere nell'elenco dei token accettati e avere una fonte di prezzo, altrimenti la transazione viene rifiutata.
2. **Prezzo.** Il prezzo del token proviene da una di due fonti: un tasso statico impostato dalla governance che scade a un'altezza di blocco indicata, oppure il prezzo medio ponderato nel tempo del pool [AMM](/architecture/amm) che abbina il token a QOR. Un prezzo del pool viene usato solo se il pool è attivo, detiene almeno la liquidità minima configurata sul lato QOR, e il suo prezzo spot rientra nello scostamento configurato rispetto alla sua media.
3. **Valore.** Il valore nativo della commissione è l'importo del token moltiplicato per il prezzo, meno il premio.
4. **Stesse regole di una commissione nativa.** Le regole sulla commissione minima nativa e sulla commissione dinamica vengono applicate a quel valore nativo, quindi una commissione convertita deve superare esattamente ciò che deve superare una commissione in QOR (0.1 uqor per unità di gas come soglia minima), ed è limitata da `max_tip_multiplier`.
5. **Regolamento.** I token del pagatore vanno al **float** del modulo di astrazione del gas, e il float paga il valore nativo in `uqor` al fee collector. Tutto ciò che sta a valle del fee collector (burning, quote di validatori, staker, treasury e light node) vede quindi sempre e solo `uqor`.

La conversione è limitata in tre modi: per transazione (`max_tip_multiplier`), per blocco (`block_conversion_cap`) e dal saldo che il float tiene sempre da parte (`float_min`). Ogni rifiuto avviene anche durante la simulazione, quindi la stima del gas fallisce nello stesso modo in cui fallirebbe la transazione reale.

### Come far accettare un token

* La **governance** sostituisce la configurazione con `MsgUpdateConfig` (autorità: l'account del modulo di governance). È così che verrebbero aggiunti un vero token di commissione `ibc/<hash>` e il suo pool o tasso statico, e aperta la conversione.
* Il **float** è un account di modulo che rifiuta i normali invii bancari. Viene finanziato con `MsgFundFloat` (`qorechaind tx gasabstraction fund-float <amount>uqor`), ad esempio da un account che ha ricevuto una spesa dalla community pool a questo scopo.

Nessuna proposta per fare l'una o l'altra cosa è stata presentata sulla mainnet, e l'elenco resta solo `uqor` finché una non passa.
