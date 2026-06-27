---
slug: /architecture/btc-restaking-babylon
title: Restaking BTC (Babylon)
sidebar_label: Restaking BTC (Babylon)
sidebar_position: 11
---

# Restaking BTC (Babylon)

Modulul `x/babylon` integrează QoreChain cu Babylon Protocol pentru a moșteni garanțiile de finalitate proof-of-work ale Bitcoin. Prin restaking BTC, QoreChain câștigă un strat secundar de finalitate susținut de hashrate-ul Bitcoin — fără a necesita vreo modificare a protocolului Bitcoin însuși.

## Prezentare generală

Babylon Protocol permite lanțurilor proof-of-stake să valorifice securitatea Bitcoin printr-un mecanism de timestamping și checkpointing. Integrarea QoreChain funcționează astfel:

1. **Staker-ii BTC** blochează Bitcoin în tranzacții de staking Babylon și își înregistrează pozițiile pe QoreChain.
2. **Checkpoint-urile de epocă** de la QoreChain sunt releate periodic către Babylon, care le marchează temporal pe Bitcoin.
3. **Moștenirea finalității**: Odată ce o epocă QoreChain este marcată ca checkpoint pe Bitcoin, starea acoperită de acea epocă moștenește garanțiile de finalitate proof-of-work ale Bitcoin.

Acest lucru oferă o apărare împotriva atacurilor pe rază lungă și a echivocării, ancorată în hashrate-ul acumulat al Bitcoin, în loc să se bazeze exclusiv pe setul de validatori propriu al QoreChain.

## Poziții de staking BTC

Utilizatorii pot înregistra poziții de staking BTC pe QoreChain trimițând o tranzacție `MsgBTCRestake` care referențiază o tranzacție de staking Bitcoin.

### Cerințe de înregistrare

| Parametru               | Valoare                        | Descriere                                       |
| ----------------------- | ---------------------------- | ------------------------------------------------- |
| **Staking minim**       | 100.000 de satoshi (0,001 BTC) | BTC minim necesar per poziție de staking         |
| **Perioadă de deblocare (unbonding)**    | 144 de blocuri BTC (\~1 zi)     | Perioadă de așteptare înainte ca BTC-ul stakuit să poată fi retras |
| **Interval de checkpoint** | La fiecare 10 epoci QoreChain    | Cât de des starea este marcată ca checkpoint către Babylon        |

### Structura poziției de staking

Fiecare poziție de staking BTC urmărește următoarea stare on-chain:

| Câmp              | Descriere                                                     |
| ------------------ | --------------------------------------------------------------- |
| `staker_address`   | Adresa QoreChain a staker-ului (`qor1...`)                     |
| `btc_tx_hash`      | Hash-ul tranzacției Bitcoin a tranzacției de staking             |
| `amount_satoshis`  | Cantitatea de BTC stakuită în satoshi                                |
| `status`           | Starea ciclului de viață al poziției: `active`, `unbonding` sau `withdrawn` |
| `staked_at`        | Marca temporală a înregistrării poziției                            |
| `unbonding_height` | Înălțimea blocului la care a fost inițiată deblocarea (dacă este cazul)   |
| `validator_addr`   | Adresa de validator QoreChain către care este delegat acest stake          |

### Fluxul de înregistrare

1. **Creați tranzacția de staking BTC** — Pe rețeaua Bitcoin, creați tranzacția de staking BTC.
2. **Trimiteți MsgBTCRestake pe QoreChain** — Pe QoreChain, trimiteți `MsgBTCRestake` cu `btc_tx_hash`, `amount` și `validator`.
3. **Poziție înregistrată** — Poziția este înregistrată on-chain ca „active".

## Checkpoint-uri de epocă

Rădăcinile de stare ale epocilor QoreChain sunt marcate periodic ca checkpoint către Bitcoin prin lanțul de releu Babylon.

### Fluxul de checkpoint

1. **Trimiteți checkpoint** — Un validator QoreChain trimite `MsgSubmitBTCCheckpoint` conținând numărul epocii, hash-ul blocului BTC, înălțimea blocului BTC și rădăcina de stare QoreChain.
2. **Releu IBC** — Datele de checkpoint sunt releate către lanțul Babylon via IBC.
3. **Timestamping pe Bitcoin** — Babylon include checkpoint-ul într-o tranzacție Bitcoin, ancorând starea QoreChain la blockchain-ul Bitcoin.
4. **Confirmare** — Odată ce tranzacția Bitcoin este confirmată, finalitatea curge înapoi prin Babylon către QoreChain.
5. **Finalizare** — Statusul checkpoint-ului trece de la `pending` la `confirmed` la `finalized`.

### Structura checkpoint-ului

| Câmp              | Descriere                                              |
| ------------------ | -------------------------------------------------------- |
| `epoch_num`        | Numărul epocii QoreChain marcate ca checkpoint                |
| `btc_block_hash`   | Hash-ul blocului Bitcoin care conține checkpoint-ul             |
| `btc_block_height` | Înălțimea blocului Bitcoin                                     |
| `state_root`       | Rădăcina de stare QoreChain la limita epocii               |
| `submitted_at`     | Marca temporală a trimiterii checkpoint-ului                       |
| `status`           | Starea checkpoint-ului: `pending`, `confirmed` sau `finalized` |

### Instantanee de epocă

La fiecare limită de checkpoint, un instantaneu de epocă captează starea agregată a rețelei:

| Câmp              | Descriere                                      |
| ------------------ | ------------------------------------------------ |
| `total_staked`     | Total BTC stakuit pe toate pozițiile (satoshi) |
| `active_positions` | Numărul de poziții de staking active               |
| `validator_count`  | Numărul de validatori cu delegări susținute de BTC |
| `block_height`     | Înălțimea blocului QoreChain la instantaneu               |

## Strat secundar de finalitate

Integrarea Babylon oferă o **garanție secundară de finalitate** care completează finalitatea de consens nativă a QoreChain:

| Strat de finalitate | Sursă                     | Viteză        | Securitate                                |
| -------------- | -------------------------- | ------------ | --------------------------------------- |
| **Primar**    | Motorul de consens QoreChain | \~5 secunde  | Susținut de stake QOR + semnături PQC    |
| **Secundar**  | Babylon + Bitcoin          | \~60 de minute | Susținut de hashrate-ul cumulativ al Bitcoin |

Stratul secundar este deosebit de valoros pentru:

* **Prevenirea atacurilor pe rază lungă**: Chiar dacă un atacator acumulează un stake QOR semnificativ, nu poate rescrie istoricul care a fost marcat ca checkpoint pe Bitcoin.
* **Securitatea punții cross-chain**: Operațiunile de punte care implică valori mari pot aștepta finalitatea la nivel Bitcoin înainte de a elibera fondurile.
* **Încredere instituțională**: Marca temporală Bitcoin oferă o dovadă verificabilă independent a istoricului de stare al QoreChain.

## Configurație

| Parametru             | Implicit          | Descriere                               |
| --------------------- | ---------------- | ----------------------------------------- |
| `enabled`             | `false`          | Comutator principal pentru funcțiile de restaking BTC  |
| `min_stake_amount`    | 100.000 de satoshi | BTC minim per poziție de staking          |
| `unbonding_period`    | 144 de blocuri BTC   | Durata de deblocare denominată în BTC        |
| `checkpoint_interval` | 10 epoci        | Epoci între checkpoint-urile Babylon        |
| `babylon_chain_id`    | `bbn-1`          | Chain ID-ul rețelei Babylon conectate |

## Evenimente

Modulul emite următoarele evenimente on-chain:

| Tip de eveniment               | Atribute                               | Descriere                                    |
| ------------------------ | ---------------------------------------- | ---------------------------------------------- |
| `btc_restake`            | staker, btc\_tx\_hash, amount, validator | Poziție nouă de staking BTC înregistrată            |
| `btc_unbond`             | staker, amount                           | Poziție de staking BTC intrată în deblocare         |
| `btc_checkpoint`         | epoch, checkpoint\_id                    | Checkpoint de epocă trimis către Babylon          |
| `babylon_epoch_complete` | epoch                                    | Epocă Babylon finalizată cu marcă temporală Bitcoin |

## Endpoint-uri API

### REST

| Metodă | Endpoint                         | Descriere                              |
| ------ | -------------------------------- | ---------------------------------------- |
| GET    | `/babylon/v1/staking/{address}`  | Obține pozițiile de staking BTC pentru o adresă |
| GET    | `/babylon/v1/checkpoint/{epoch}` | Obține datele de checkpoint pentru o epocă specifică |
| GET    | `/babylon/v1/params`             | Obține parametrii de configurare ai modulului      |

### JSON-RPC

| Metodă                      | Parametri         | Descriere                                                      |
| --------------------------- | ------------------ | ---------------------------------------------------------------- |
| `qor_getBTCStakingPosition` | `address` (string) | Returnează poziția de staking BTC pentru adresa QoreChain dată |

## Comenzi CLI

### Comenzi de interogare

```bash
# Query BTC restaking configuration
qorechaind query babylon config

# Query a staking position by address
qorechaind query babylon position <staker-address>
```

### Comenzi de tranzacție

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
