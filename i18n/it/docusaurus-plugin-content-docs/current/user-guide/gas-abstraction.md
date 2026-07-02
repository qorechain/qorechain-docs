---
slug: /user-guide/gas-abstraction
title: Astrazione del gas
sidebar_label: Astrazione del gas
sidebar_position: 7
---

# Astrazione del gas

Questa guida illustra la funzionalità di astrazione del gas di QoreChain, che consente agli utenti di pagare le commissioni di transazione in token non nativi invece che in QOR.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.82** — sostituisci il chain ID e gli endpoint della mainnet dalla pagina **Connessione alla Mainnet** quando effettui transazioni sulla mainnet.
:::

---

## Panoramica

L'astrazione del gas elimina il requisito di possedere token QOR per pagare le commissioni di transazione. Gli utenti che possiedono token alternativi accettati (come USDC o ATOM trasferiti tramite IBC) possono utilizzare tali token direttamente come pagamento delle commissioni. Il protocollo converte automaticamente l'importo della commissione nel suo equivalente nativo prima dell'elaborazione.

---

## Token accettati

I seguenti token sono accettati per il pagamento delle commissioni:

| Token              | Denominazione | Tasso di conversione | Commissione di esempio |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (nativo)    | `--fees 500uqor`     |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
I tassi di conversione riflettono il rapporto di cambio definito dal protocollo, non i prezzi di mercato. Un tasso di 10.0 per ATOM significa che 1 unità di ibc/ATOM equivale a 10 unità di uqor ai fini delle commissioni.
:::

---

## Come funziona

Il `GasAbstractionDecorator` di QoreChain è integrato nella pipeline di elaborazione delle transazioni. Quando una transazione include commissioni in una denominazione non nativa, si verifica quanto segue:

1. **Ispezione della commissione** — Il decorator verifica la denominazione della commissione specificata nella transazione.
2. **Ricerca del tasso** — Se la denominazione è presente nell'elenco dei token accettati, il protocollo cerca il tasso di conversione corrispondente.
3. **Conversione** — L'importo della commissione viene convertito nel suo equivalente nativo in uqor utilizzando il tasso di conversione.
4. **Elaborazione standard** — La commissione convertita viene passata all'handler standard `DeductFee` per la detrazione dall'account del mittente. La conversione è trasparente per il resto della pipeline di transazione. Tutta l'elaborazione successiva delle commissioni (distribuzione ai validatori, burning, allocazione alla tesoreria, ricompense per gli staker e ricompense per i light node) opera sull'equivalente nativo in uqor.

---

## Esempi di utilizzo

### Pagare le commissioni in USDC

Invia un trasferimento di token con commissioni pagate in USDC:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Poiché USDC ha un tasso di conversione di 1.0, 500 ibc/USDC equivalgono a 500 uqor.

### Pagare le commissioni in ATOM

Invia un trasferimento di token con commissioni pagate in ATOM:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Poiché ATOM ha un tasso di conversione di 10.0, 50 ibc/ATOM equivalgono a 500 uqor.

---

## Interrogazione dei token accettati

Recupera l'elenco dei token attualmente accettati per l'astrazione del gas, insieme ai loro tassi di conversione:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Output di esempio:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## Accesso JSON-RPC

Per le applicazioni che si integrano tramite JSON-RPC, interroga la configurazione dell'astrazione del gas:

```
qor_getGasAbstractionConfig
```

**Richiesta:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Risposta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* L'astrazione del gas è ideale per gli utenti che arrivano da altri ecosistemi e che potrebbero non possedere ancora QOR.
* I tassi di conversione sono impostati dalla governance e possono essere aggiornati tramite proposte di modifica dei parametri.
* Se possiedi più token accettati, uno qualsiasi di essi può essere utilizzato per le commissioni su qualsiasi tipo di transazione.
* Il token effettivo specificato in `--fees` viene detratto dal tuo account. La conversione viene utilizzata solo per verificare che la commissione soddisfi il requisito minimo.

:::
