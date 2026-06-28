---
slug: /cli-reference/transaction-commands
title: Comandi di transazione
sidebar_label: Comandi di transazione
sidebar_position: 2
---

# Comandi di transazione

Tutti i comandi di transazione seguono lo schema:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Imposta `--chain-id qorechain-vladi` per trasmettere verso la mainnet live (versione della chain **v3.1.80**), oppure `--chain-id qorechain-diana` per la testnet. Se omesso, il client utilizza il `chain-id` dalla tua configurazione locale.
:::

I flag comuni si applicano a ogni sottocomando `tx`:

| Flag                | Tipo   | Descrizione                                       |
| ------------------- | ------ | ------------------------------------------------- |
| `--from`            | string | Nome o indirizzo della chiave di firma            |
| `--chain-id`        | string | Identificatore della chain (predefinito: da config) |
| `--fees`            | string | Commissioni di transazione (es. `500uqor`)        |
| `--gas`             | string | Limite di gas o `auto` per la stima               |
| `--gas-adjustment`  | float  | Moltiplicatore di gas quando si usa `auto` (predefinito: 1.0) |
| `--keyring-backend` | string | Backend del keyring: `os`, `file`, `test`         |
| `--node`            | string | Endpoint RPC (predefinito: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` o `block`                         |
| `-y`                | bool   | Salta il prompt di conferma                       |

---

## bank

### send

Trasferisce token da un account a un altro.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Crea un nuovo validatore sulla rete.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Tipo   | Descrizione                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `--amount`                     | string | Importo di auto-delega (es. `1000000uqor`)   |
| `--pubkey`                     | string | Chiave pubblica di consenso del validatore (JSON) |
| `--moniker`                    | string | Nome visualizzato del validatore             |
| `--commission-rate`            | string | Tasso di commissione iniziale (es. `0.10`)   |
| `--commission-max-rate`        | string | Tasso di commissione massimo                 |
| `--commission-max-change-rate` | string | Tasso massimo di variazione giornaliera della commissione |
| `--min-self-delegation`        | string | Auto-delega minima richiesta                 |

### edit-validator

Modifica la descrizione o la commissione di un validatore esistente.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delega token a un validatore.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Sposta la delega da un validatore a un altro.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Effettua l'unbonding di token da un validatore.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Preleva tutte le ricompense di staking in sospeso.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Preleva le ricompense da un validatore specifico.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tipo | Descrizione                              |
| -------------- | ---- | ---------------------------------------- |
| `--commission` | bool | Preleva anche la commissione del validatore |

---

## gov

### submit-proposal

Invia una proposta di governance.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Il file della proposta è un documento JSON che specifica il tipo di proposta, il titolo, la descrizione ed eventuali messaggi da eseguire.

### vote

Vota su una proposta attiva.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opzioni di voto: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Aggiunge un deposito a una proposta.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Il percorso di transazione cosmos richiede per impostazione predefinita una firma ibrida (`hybrid_signature_mode = required`). I comandi `gen-key` e `cosign` producono la chiave Dilithium-5 (ML-DSA-87) e l'estensione `PQCHybridSignature` necessaria per effettuare transazioni sul percorso cosmos insieme alla firma classica secp256k1.

### gen-key

Genera una chiave post-quantum Dilithium-5 (ML-DSA-87) per la firma ibrida.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Allega una cofirma Dilithium-5 a una transazione come estensione `PQCHybridSignature`, producendo una transazione ibrida (secp256k1 + ML-DSA-87). Richiesta per le transazioni sul percorso cosmos sotto la modalità di applicazione predefinita `required`. Gli strumenti standard CosmJS / relayer devono produrre questa estensione per poter effettuare transazioni; la funzione `buildHybridTx` dell'SDK di QoreChain (con `includePqcPublicKey`) svolge la funzione equivalente.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registra una chiave pubblica post-quantum per un account.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registra una chiave PQC con metadati estesi e attestazione.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Tipo   | Descrizione                       |
| --------------- | ------ | --------------------------------- |
| `--attestation` | string | Dati di attestazione TEE (hex)    |
| `--metadata`    | string | Metadati aggiuntivi della chiave (JSON) |

### migrate-key

Migra una chiave classica esistente verso una coppia di chiavi PQC ibrida.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Blocca i token QOR in una posizione di staking di governance xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Tipo   | Descrizione                                |
| ----------------- | ------ | ------------------------------------------ |
| `--lock-duration` | string | Durata del blocco (es. `30d`, `90d`, `180d`) |

### unlock

Sblocca xQORE riportandolo a QOR. Lo sblocco anticipato può comportare penalità a seconda del livello di penalità.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Avvia un deposito tramite bridge da una chain esterna.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Tipo   | Descrizione                       |
| ------------- | ------ | --------------------------------- |
| `--recipient` | string | Indirizzo del destinatario su QoreChain |

### withdraw

Avvia un prelievo tramite bridge verso una chain esterna.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Attiva o riconfigura il bridge di una chain in un'unica transazione firmata (disponibile a partire dalla versione della chain **v3.1.80**). Richiede la chiave `bridge_admin` o una licenza `qcb_bridge` — nessuna proposta di governance o upgrade della chain. Imposta l'indirizzo del contratto, il numero di conferme, l'architettura e lo stato.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Seleziona il verifier attivo di una chain e installa la sua trust root (anch'esso protetto da `bridge_admin`).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Invia un messaggio cross-VM tra ambienti di esecuzione (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Tipo   | Descrizione                          |
| ------------- | ------ | ------------------------------------ |
| `--source-vm` | string | VM di origine: `evm`, `cosmwasm`, `svm` |
| `--gas-limit` | uint   | Limite di gas per l'esecuzione cross-VM |

### process-queue

Elabora manualmente i messaggi cross-VM in sospeso (comando operatore).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Distribuisce un programma BPF sul runtime SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Tipo   | Descrizione                  |
| -------------- | ------ | ---------------------------- |
| `--program-id` | string | ID del programma facoltativo (base58) |

### execute

Esegue un'istruzione su un programma SVM distribuito.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Tipo   | Descrizione                                         |
| ------------ | ------ | --------------------------------------------------- |
| `--accounts` | string | Pubkey degli account separate da virgola per l'istruzione |

### create-account

Crea un nuovo account SVM con spazio dati allocato.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Tipo   | Descrizione                                     |
| --------- | ------ | ----------------------------------------------- |
| `--owner` | string | Programma proprietario (base58, predefinito: system program) |

---

## multilayer

### register-sidechain

Registra un nuovo layer sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Tipo   | Descrizione                                          |
| ----------------------- | ------ | --------------------------------------------------- |
| `--block-time-ms`       | uint   | Tempo di blocco target in ms (predefinito 2000)     |
| `--domains`             | string | Domini supportati separati da virgola (predefinito `defi`) |
| `--max-tx`              | uint   | Numero massimo di transazioni per blocco (predefinito 1000) |
| `--min-validators`      | uint32 | Dimensione minima del set di validatori (predefinito 1) |
| `--settlement-interval` | uint   | Intervallo di settlement in blocchi (predefinito 100) |
| `--vm-types`            | string | Tipi di VM supportati separati da virgola (predefinito `evm`) |

### register-paychain

Registra un nuovo layer paychain per microtransazioni ad alta frequenza.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Tipo | Descrizione                                  |
| ----------------------- | ---- | -------------------------------------------- |
| `--max-tx`              | uint | Numero massimo di transazioni per blocco (predefinito 5000) |
| `--settlement-interval` | uint | Intervallo di settlement in blocchi (predefinito 50) |

### anchor-state

Invia un anchor di stato (settlement) per un layer registrato.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Instrada una transazione verso il layer ottimale.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Tipo   | Descrizione                       |
| ---------------- | ------ | --------------------------------- |
| `--target-layer` | string | Forza l'instradamento verso un layer specifico |

### update-layer-status

Aggiorna lo stato operativo di un layer (solo operatore).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valori di stato: `active`, `paused`, `draining`.

### challenge-anchor

Invia una contestazione di frode contro un anchor di stato.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Registra un nuovo rollup con il Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Tipo   | Descrizione                                          |
| ------------------- | ------ | ---------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`       |
| `--profile`         | string | Preset: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Importo di stake dell'operatore                      |
| `--da-enabled`      | bool   | Abilita la disponibilità dei dati nativa             |

### submit-batch

Invia un batch di settlement per un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Invia una contestazione di frode contro un batch di settlement (rollup ottimistici).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalizza manualmente un batch che ha superato la finestra di contestazione.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Mette in pausa un rollup (solo operatore).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Riprende un rollup in pausa (solo operatore).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Arresta definitivamente un rollup e rilascia il suo stake (solo operatore).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Anche il prelievo dei rollup e il settlement cross-layer sono esposti nel gruppo di transazioni `rdk` (per esempio, un comando `execute-withdrawal` che effettua il settlement di un prelievo provato contro un batch finalizzato). Gli argomenti e i flag esatti dipendono dal tipo di settlement del tuo rollup e dalla configurazione DA; consulta la documentazione del **Rollup Development Kit** per la superficie di comandi autorevole prima di costruire queste transazioni.
:::

---

## babylon

### submit-btc-checkpoint

Invia un checkpoint BTC per un'epoca.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Effettua il restake di BTC tramite l'integrazione Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Tipo   | Descrizione                       |
| --------------- | ------ | --------------------------------- |
| `--btc-tx-hash` | string | Hash della transazione Bitcoin come prova |

---

## abstractaccount

### create

Crea un account astratto con regole di spesa programmabili.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Tipo   | Descrizione                       |
| ------------------ | ------ | --------------------------------- |
| `--spending-rules` | string | File JSON che definisce le regole di spesa |

### update-spending-rules

Aggiorna le regole di spesa per un account astratto esistente.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM è il layer di reinforcement learning che regola i parametri di consenso. Questi comandi controllano l'agente PRISM; il nome del modulo CLI `rlconsensus` e i suoi sottocomandi sono conservati alla lettera.

### set-agent-mode

Imposta la modalità operativa dell'agente PRISM (solo governance).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valori di modalità: `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Riprende l'agente PRISM dopo l'attivazione di un circuit breaker.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Aggiorna la configurazione della policy dell'agente PRISM (solo governance).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Aggiorna la configurazione dei pesi di ricompensa per l'agente PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Tipo   | Descrizione                  |
| --------------------- | ------ | ---------------------------- |
| `--throughput-weight` | string | Peso per la ricompensa di throughput |
| `--latency-weight`    | string | Peso per la ricompensa di latenza |
| `--security-weight`   | string | Peso per la ricompensa di sicurezza |
