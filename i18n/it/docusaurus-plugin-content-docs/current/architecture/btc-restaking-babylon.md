---
slug: /architecture/btc-restaking-babylon
title: BTC Restaking (Babylon)
sidebar_label: BTC Restaking (Babylon)
sidebar_position: 11
---

# BTC Restaking (Babylon)

Il modulo `x/babylon` integra QoreChain con il Babylon Protocol per ereditare le garanzie di finalità basate sulla proof-of-work di Bitcoin. Attraverso il restaking di BTC, QoreChain acquisisce un livello di finalità secondario supportato dall'hashrate di Bitcoin — senza richiedere alcuna modifica al protocollo Bitcoin stesso.

## Panoramica

Il Babylon Protocol consente alle chain proof-of-stake di sfruttare la sicurezza di Bitcoin attraverso un meccanismo di timestamping e checkpointing. L'integrazione di QoreChain funziona come segue:

1. Gli **staker di BTC** bloccano Bitcoin in transazioni di staking Babylon e registrano le loro posizioni su QoreChain.
2. I **checkpoint delle epoche** di QoreChain vengono periodicamente inoltrati a Babylon, che li registra con timestamp su Bitcoin.
3. **Ereditarietà della finalità**: Una volta che un'epoca di QoreChain è inserita in un checkpoint su Bitcoin, lo stato coperto da quell'epoca eredita le garanzie di finalità basate sulla proof-of-work di Bitcoin.

Questo fornisce una difesa contro attacchi long-range ed equivocazione che è ancorata all'hashrate accumulato di Bitcoin anziché fare affidamento esclusivamente sul set di validatori di QoreChain.

## Posizioni di staking BTC

Gli utenti possono registrare posizioni di staking BTC su QoreChain inviando una transazione `MsgBTCRestake` che fa riferimento a una transazione di staking Bitcoin.

### Requisiti di registrazione

| Parametro                | Valore                        | Descrizione                                       |
| ------------------------ | ----------------------------- | ------------------------------------------------- |
| **Stake minimo**         | 100.000 satoshi (0,001 BTC)   | BTC minimo richiesto per posizione di staking     |
| **Periodo di unbonding** | 144 blocchi BTC (\~1 giorno)  | Periodo di attesa prima che i BTC in staking possano essere prelevati |
| **Intervallo di checkpoint** | Ogni 10 epoche di QoreChain | Frequenza con cui lo stato viene inserito in checkpoint su Babylon |

### Struttura della posizione di staking

Ogni posizione di staking BTC traccia il seguente stato on-chain:

| Campo              | Descrizione                                                     |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | Indirizzo QoreChain dello staker (`qor1...`)                    |
| `btc_tx_hash`      | Hash della transazione Bitcoin della transazione di staking     |
| `amount_satoshis`  | Quantità di BTC in staking in satoshi                           |
| `status`           | Stato del ciclo di vita della posizione: `active`, `unbonding` o `withdrawn` |
| `staked_at`        | Timestamp della registrazione della posizione                  |
| `unbonding_height` | Altezza del blocco in cui è stato avviato l'unbonding (se applicabile) |
| `validator_addr`   | Indirizzo del validatore QoreChain a cui è delegato questo stake |

### Flusso di registrazione

1. **Crea la transazione di staking BTC** — Sulla rete Bitcoin, crea la transazione di staking BTC.
2. **Invia MsgBTCRestake su QoreChain** — Su QoreChain, invia `MsgBTCRestake` con `btc_tx_hash`, `amount` e `validator`.
3. **Posizione registrata** — La posizione viene registrata on-chain come "active".

## Checkpoint delle epoche

I root di stato delle epoche di QoreChain vengono periodicamente inseriti in checkpoint su Bitcoin attraverso la chain di relay Babylon.

### Flusso di checkpoint

1. **Invia il checkpoint** — Un validatore QoreChain invia `MsgSubmitBTCCheckpoint` contenente il numero dell'epoca, l'hash del blocco BTC, l'altezza del blocco BTC e il root di stato di QoreChain.
2. **Relay IBC** — I dati del checkpoint vengono inoltrati alla chain Babylon tramite IBC.
3. **Timestamping su Bitcoin** — Babylon include il checkpoint in una transazione Bitcoin, ancorando lo stato di QoreChain alla blockchain di Bitcoin.
4. **Conferma** — Una volta confermata la transazione Bitcoin, la finalità ritorna attraverso Babylon a QoreChain.
5. **Finalizzazione** — Lo stato del checkpoint passa da `pending` a `confirmed` a `finalized`.

### Struttura del checkpoint

| Campo              | Descrizione                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | Numero dell'epoca di QoreChain in fase di checkpoint     |
| `btc_block_hash`   | Hash del blocco Bitcoin contenente il checkpoint         |
| `btc_block_height` | Altezza del blocco Bitcoin                               |
| `state_root`       | Root di stato di QoreChain al confine dell'epoca         |
| `submitted_at`     | Timestamp dell'invio del checkpoint                      |
| `status`           | Stato del checkpoint: `pending`, `confirmed` o `finalized` |

### Snapshot delle epoche

A ogni confine di checkpoint, uno snapshot dell'epoca cattura lo stato aggregato della rete:

| Campo              | Descrizione                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Totale BTC in staking su tutte le posizioni (satoshi) |
| `active_positions` | Numero di posizioni di staking attive            |
| `validator_count`  | Numero di validatori con deleghe supportate da BTC |
| `block_height`     | Altezza del blocco di QoreChain allo snapshot    |

## Livello di finalità secondario

L'integrazione con Babylon fornisce una **garanzia di finalità secondaria** che integra la finalità di consenso nativa di QoreChain:

| Livello di finalità | Fonte                       | Velocità     | Sicurezza                               |
| ------------------- | --------------------------- | ------------ | --------------------------------------- |
| **Primario**        | Motore di Consenso QoreChain | \~5 secondi  | Supportato da stake QOR + firme PQC     |
| **Secondario**      | Babylon + Bitcoin           | \~60 minuti  | Supportato dall'hashrate cumulativo di Bitcoin |

Il livello secondario è particolarmente prezioso per:

* **Prevenzione degli attacchi long-range**: Anche se un attaccante accumulasse uno stake significativo in QOR, non potrebbe riscrivere la storia che è stata inserita in checkpoint su Bitcoin.
* **Sicurezza del bridge cross-chain**: Le operazioni del bridge che coinvolgono valori elevati possono attendere la finalità a livello Bitcoin prima di rilasciare i fondi.
* **Fiducia istituzionale**: Il timestamp Bitcoin fornisce una prova verificabile in modo indipendente della storia dello stato di QoreChain.

## Configurazione

| Parametro             | Predefinito      | Descrizione                               |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | Interruttore principale per le funzionalità di restaking BTC |
| `min_stake_amount`    | 100.000 satoshi  | BTC minimo per posizione di staking       |
| `unbonding_period`    | 144 blocchi BTC  | Durata dell'unbonding denominata in BTC   |
| `checkpoint_interval` | 10 epoche        | Epoche tra i checkpoint Babylon           |
| `babylon_chain_id`    | `bbn-1`          | Chain ID della rete Babylon connessa      |

## Eventi

Il modulo emette i seguenti eventi on-chain:

| Tipo di evento           | Attributi                                | Descrizione                                    |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Nuova posizione di staking BTC registrata      |
| `btc_unbond`             | staker, amount                           | Posizione di staking BTC entrata in unbonding  |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Checkpoint dell'epoca inviato a Babylon        |
| `babylon_epoch_complete` | epoch                                    | Epoca Babylon finalizzata con timestamp Bitcoin |

## Endpoint API

### REST

| Metodo | Endpoint                         | Descrizione                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Ottiene le posizioni di staking BTC per un indirizzo |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Ottiene i dati del checkpoint per un'epoca specifica |
| GET    | `/babylon/v1/params`             | Ottiene i parametri di configurazione del modulo |

### JSON-RPC

| Metodo                      | Parametri          | Descrizione                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Restituisce la posizione di staking BTC per il dato indirizzo QoreChain |

## Comandi CLI

### Comandi di query

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### Comandi di transazione

```bash
# Register a BTC restaking position
qorechaind tx babylon restake \
  --btc-tx-hash <hash> \
  --amount-satoshis <amount> \
  --validator <qorvaloper1...> \
  --from <key-name>

# Submit a BTC checkpoint
qorechaind tx babylon submit-checkpoint \
  --epoch <epoch-number> \
  --btc-block-hash <hash> \
  --btc-block-height <height> \
  --state-root <root> \
  --from <key-name>
```
