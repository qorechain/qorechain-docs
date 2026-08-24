---
slug: /user-guide/gas-abstraction
title: Astrazione del Gas
sidebar_label: Astrazione del Gas
sidebar_position: 7
---

# Astrazione del Gas

Questa guida illustra la funzionalità di astrazione del gas di QoreChain, che consente agli utenti di pagare le commissioni di transazione in token non nativi invece che in QOR.

:::note
I comandi riportati di seguito utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** quando effettui transazioni sulla mainnet.
:::

---

## Panoramica

L'astrazione del gas elimina l'obbligo di possedere token QOR per pagare le commissioni di transazione. Gli utenti che possiedono token alternativi accettati (come USDC o ATOM trasferiti via IBC) possono utilizzare direttamente tali token come pagamento della commissione. Il protocollo converte automaticamente l'importo della commissione nel suo equivalente nativo prima dell'elaborazione.

---

## Token Accettati

I seguenti token sono accettati per il pagamento delle commissioni:

| Token              | Denominazione | Tasso di Conversione | Commissione di Esempio |
| ------------------ | ------------- | --------------------- | ----------------------- |
| **QOR**            | `uqor`        | 1.0 (nativo)           | `--fees 500uqor`        |
| **USDC** (via IBC) | `ibc/USDC`    | 1.0                    | `--fees 500ibc/USDC`    |
| **ATOM** (via IBC) | `ibc/ATOM`    | 10.0                   | `--fees 50ibc/ATOM`     |

:::note
I tassi di conversione riflettono il rapporto di cambio definito dal protocollo, non i prezzi di mercato. Un tasso di 10.0 per ATOM significa che 1 unità di ibc/ATOM equivale a 10 unità di uqor ai fini del pagamento delle commissioni.
:::

---

## Come Funziona

Il `GasAbstractionDecorator` di QoreChain è integrato nella pipeline di elaborazione delle transazioni. Quando una transazione include commissioni in una denominazione non nativa, si verifica quanto segue:

1. **Ispezione della Commissione** — Il decoratore controlla la denominazione della commissione specificata nella transazione.
2. **Ricerca del Tasso** — Se la denominazione è presente nell'elenco dei token accettati, il protocollo ricerca il tasso di conversione corrispondente.
3. **Conversione** — L'importo della commissione viene convertito nel suo equivalente nativo in uqor utilizzando il tasso di conversione.
4. **Elaborazione Standard** — La commissione convertita viene passata al gestore standard `DeductFee` per la deduzione dall'account del mittente. La conversione è trasparente per il resto della pipeline di transazione. Tutta l'elaborazione successiva delle commissioni (distribuzione ai validatori, burning, allocazione al treasury, ricompense agli staker e ricompense per i light-node) opera sull'equivalente nativo in uqor.

---

## Esempi di Utilizzo

### Pagare le Commissioni in USDC

Invia un trasferimento di token con commissioni pagate in USDC:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Poiché USDC ha un tasso di conversione di 1.0, 500 ibc/USDC equivalgono a 500 uqor.

### Pagare le Commissioni in ATOM

Invia un trasferimento di token con commissioni pagate in ATOM:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Poiché ATOM ha un tasso di conversione di 10.0, 50 ibc/ATOM equivalgono a 500 uqor.

---

## Interrogare i Token Accettati

Recupera l'elenco dei token attualmente accettati per l'astrazione del gas, insieme ai relativi tassi di conversione:

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
* I tassi di conversione sono stabiliti dalla governance e possono essere aggiornati tramite proposte di modifica dei parametri.
* Se possiedi più token accettati, ognuno di essi può essere utilizzato per le commissioni su qualsiasi tipo di transazione.
* Il token effettivamente specificato in `--fees` viene dedotto dal tuo account. La conversione viene utilizzata solo per verificare che la commissione soddisfi il requisito minimo.

:::
