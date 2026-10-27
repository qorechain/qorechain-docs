---
slug: /user-guide/token-operations
title: Operazioni sui Token
sidebar_label: Operazioni sui Token
sidebar_position: 1
---

# Operazioni sui Token

Questa guida illustra il token QOR, come inviare e ricevere token, interrogare i saldi e comprendere il modello di distribuzione delle commissioni su QoreChain.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la release **v3.2.4** dal 23 ottobre 2026; la testnet esegue la **v3.2.6** (dal 27 ottobre 2026) — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connecting to Mainnet** quando effettui transazioni sulla mainnet.
:::

:::caution Firma con `tx pqc cosign`
Mainnet e testnet richiedono una firma post-quantistica ibrida su ogni transazione della lane Cosmos, quindi i comandi di questa pagina non vengono trasmessi così come sono scritti. Aggiungi `--generate-only > tx.json` a un comando, poi esegui `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vedi [Firma ibrida](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) e la [Dashboard](/dashboard/overview) eseguono questa firma al posto tuo.
:::

## Informazioni sul Token

| Proprietà                    | Valore                         |
| ----------------------------- | ----------------------------- |
| **Denominazione visualizzata** | QOR                           |
| **Denominazione di base**      | uqor                          |
| **Conversione**                | 1 QOR = 1.000.000 uqor (10^6) |
| **Chain ID**                   | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Prefisso Bech32**            | `qor` (es. `qor1abc...xyz`) |

Tutti gli importi on-chain sono denominati in **uqor**. Quando si inviano transazioni, specificare sempre gli importi in uqor.

## Invio di Token

Per trasferire token QOR da un account a un altro:

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Esempio:** invia 5 QOR (5.000.000 uqor) a un altro indirizzo:

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

È possibile utilizzare anche il nome di una chiave al posto di un indirizzo grezzo per il mittente:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

## Interrogazione dei Saldi

Verifica il saldo di un account:

```bash
qorechaind query bank balances <address>
```

**Esempio:**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Output di esempio:**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Questo indica che l'account detiene 15 QOR (15.000.000 uqor).

## Struttura delle Commissioni

Le commissioni di transazione su QoreChain vengono distribuite tra cinque destinazioni per allineare gli incentivi della rete:

| Destinazione     | Quota | Finalità                                                         |
| ---------------- | ----- | --------------------------------------------------------------- |
| **Validatori**    | 37%   | Ricompensa i produttori di blocchi e mette in sicurezza la rete |
| **Bruciati**      | 30%   | Rimossi permanentemente dalla supply |
| **Tesoreria**     | 20%   | Finanzia lo sviluppo del protocollo e le grant per l'ecosistema |
| **Staker**        | 10%   | Distribuiti proporzionalmente a tutti i delegatori              |
| **Light Node**    | 3%    | Ricompense dei light node (vedi la nota sotto) |

La ripartizione si applica a tutto ciò che entra nel fee collector, che contiene le commissioni di transazione e l'emissione di staking coniata a ogni epoca. La quota dei light node si accumula nel pool di ricompense dei light node; la registrazione è aperta e vincolata a una licenza; il 27 ottobre 2026 è stato registrato un light node su ciascuna rete (vedi [Light Node](/light-node/overview#reward-program-status)). Dall'aggiornamento v3.2.0 la quota degli staker viene pagata come una normale ricompensa di staking (vedi [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Canali di Burn

Il modulo di burn di QoreChain definisce 12 sorgenti di burn. I QOR bruciati attraverso una qualsiasi di esse vengono rimossi permanentemente dalla circolazione. Sulla mainnet finora solo i canali delle gas fee e delle transazioni fallite hanno registrato burn; gli altri sono definiti ma non hanno registrato nulla. Dalla v3.2.4 (testnet dal 19 ottobre 2026, mainnet dal 23 ottobre 2026) esiste una tredicesima sorgente, `staking_tier_penalty`, per il modulo opzionale di staking con blocco temporale.

| Canale                | Descrizione                                                         |
| --------------------- | -------------------------------------------------------------------- |
| `gas_fee`              | Il 30% di tutte le gas fee viene bruciato          |
| `contract_create`      | Commissione fissa di 100 QOR bruciata per ogni creazione di contratto (inattivo: il caricamento di QoreChain Native è chiuso) |
| `ai_service`           | Il 50% delle commissioni dei servizi AI viene bruciato (inattivo: le commissioni dei servizi AI non sono live) |
| `bridge_fee`           | Il 100% delle commissioni del bridge viene bruciato (inattivo: il bridge non è live) |
| `treasury_buyback`     | Buyback-and-burn periodico dalla tesoreria |
| `failed_tx`            | Il 10% del gas delle transazioni fallite; applicato dalla chain dalla v3.2.2 |
| `xqore_penalty`        | Penali di uscita anticipata xQORE instradate nel burn (xQORE non è live) |
| `auto_buyback`         | Burn automatizzati a livello di protocollo (inattivo) |
| `tge`                  | Riservato; il burn del TGE è avvenuto prima del genesis e questo canale non registra nulla |
| `rollup_create`        | L'1% dello stake di creazione del rollup viene bruciato |
| `milestone`            | Burn programmati a numeri cumulativi fissi di transazioni (nessuno ancora attivato) |
| `amm`                  | Riservato alle commissioni di protocollo dell'AMM (nessuna registrata) |

Il modulo di burn non ha una query CLI; leggi il burn cumulativo per sorgente da REST:

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

La risposta elenca `total_burned` e `burns_by_source` (in uqor). La supply totale attuale si ottiene con `qorechaind query bank total-supply-of uqor`.

## Suggerimenti

:::caution
Verifica sempre due volte gli indirizzi dei destinatari prima di inviare token. Le transazioni su QoreChain sono irreversibili.
:::

:::tip

* Usa il flag `--dry-run` per simulare una transazione senza trasmetterla.
* Imposta `--gas` esplicitamente (400.000 bastano per un trasferimento con firma ibrida).
* Il minimo delle commissioni è **0,1 uqor per unità di gas**, quindi un limite di gas di 400.000 richiede almeno **40.000 uqor**.

:::
