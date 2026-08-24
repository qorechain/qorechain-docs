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
Imposta `--chain-id qorechain-vladi` per trasmettere sulla mainnet attiva (versione della chain **v3.1.92**), oppure `--chain-id qorechain-diana` per la testnet. Se omesso, il client usa il `chain-id` della tua configurazione locale.
:::

I flag comuni si applicano a ogni sottocomando `tx`:

| Flag                | Tipo   | Descrizione                                     |
| ------------------- | ------ | ----------------------------------------------- |
| `--from`            | string | Nome o indirizzo della chiave firmataria        |
| `--chain-id`        | string | Identificatore della chain (predefinito: dalla configurazione) |
| `--fees`            | string | Commissioni della transazione (es. `500uqor`)   |
| `--gas`             | string | Limite di gas oppure `auto` per la stima        |
| `--gas-adjustment`  | float  | Moltiplicatore del gas quando si usa `auto` (predefinito: 1.0) |
| `--keyring-backend` | string | Backend del keyring: `os`, `file`, `test`       |
| `--node`            | string | Endpoint RPC (predefinito: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async` oppure `block`                  |
| `-y`                | bool   | Salta la richiesta di conferma                  |

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

Crea un nuovo validator sulla rete.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Tipo   | Descrizione                                  |
| ------------------------------ | ------ | --------------------------------------------- |
| `--amount`                     | string | Importo di auto-delega (es. `1000000uqor`)   |
| `--pubkey`                     | string | Chiave pubblica di consenso del validator (JSON) |
| `--moniker`                    | string | Nome visualizzato del validator              |
| `--commission-rate`            | string | Aliquota di commissione iniziale (es. `0.10`) |
| `--commission-max-rate`        | string | Aliquota di commissione massima              |
| `--commission-max-change-rate` | string | Variazione giornaliera massima della commissione |
| `--min-self-delegation`        | string | Auto-delega minima richiesta                 |

### edit-validator

Modifica la descrizione o la commissione di un validator esistente.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delega token a un validator.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Sposta una delega da un validator a un altro.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Svincola token da un validator.

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

Preleva le ricompense da un validator specifico.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tipo | Descrizione                                |
| -------------- | ---- | ------------------------------------------ |
| `--commission` | bool | Preleva anche la commissione del validator |

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

Il percorso di transazione cosmos richiede per impostazione predefinita una firma ibrida (`hybrid_signature_mode = required`). I comandi `gen-key` e `cosign` producono la chiave Dilithium-5 (ML-DSA-87) e l'estensione `PQCHybridSignature` necessarie per transare sul percorso cosmos accanto alla firma classica secp256k1.

### gen-key

Genera una chiave post-quantistica Dilithium-5 (ML-DSA-87) per la firma ibrida.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Allega una cofirma Dilithium-5 a una transazione come estensione `PQCHybridSignature`, producendo una transazione ibrida (secp256k1 + ML-DSA-87). Richiesto per le transazioni sul percorso cosmos con la modalità di enforcement predefinita `required`. Gli strumenti standard CosmJS / relayer devono produrre questa estensione per poter transare; il `buildHybridTx` dell'SDK QoreChain (con `includePqcPublicKey`) fa l'equivalente.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Registra una chiave pubblica post-quantistica per un account.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Registra una chiave PQC con metadati estesi e attestazione.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Tipo   | Descrizione                             |
| --------------- | ------ | ---------------------------------------- |
| `--attestation` | string | Dati di attestazione TEE (hex)          |
| `--metadata`    | string | Metadati aggiuntivi della chiave (JSON) |

### migrate-key

Migra una chiave classica esistente a una coppia di chiavi PQC ibrida.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

Ricostruisce in modo deterministico la chiave ML-DSA-87 dell'account a partire dal suo mnemonico BIP-39 (letto da stdin) e la memorizza localmente (disponibile a partire dalla versione della chain **v3.1.85**). Usa la derivazione standard dell'ecosistema `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Tipo   | Descrizione                                              |
| -------------- | ------ | ---------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonica, predefinita) oppure `bridge` (legacy `SHAKE-256(mnemonic)`) |

### rotate-key

Ruota la chiave ML-DSA-87 dell'account **all'interno dello stesso algoritmo** (disponibile a partire dalla versione della chain **v3.1.85**) — ad es. per migrare una chiave con derivazione legacy alla derivazione canonica, o per ritirare una chiave compromessa. Legge il mnemonico da stdin, esegue la doppia firma con la chiave vecchia e quella nuova, cofirma l'envelope con la chiave vecchia e trasmette la transazione. Emette su stdout solo il JSON della transazione (le righe informative vanno su stderr), quindi si compone bene con `-o json`.

```bash
qorechaind tx pqc rotate-key [flags]
```

| Flag               | Tipo   | Descrizione                                      |
| ------------------ | ------ | -------------------------------------------------- |
| `--old-derivation` | string | Derivazione della chiave attualmente registrata (`adapter` \| `bridge`) |
| `--new-derivation` | string | Derivazione della nuova chiave (`adapter` \| `bridge`) |
| `--new-random`     | bool   | Genera invece una nuova chiave casuale           |

---

## xqore

### lock

Blocca token QOR in una posizione di staking di governance xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Tipo   | Descrizione                                |
| ----------------- | ------ | -------------------------------------------- |
| `--lock-duration` | string | Durata del blocco (es. `30d`, `90d`, `180d`) |

### unlock

Sblocca xQORE riconvertendolo in QOR. Uno sblocco anticipato può comportare penalità a seconda del livello di penalità applicabile.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Avvia un deposito bridge da una chain esterna.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Tipo   | Descrizione                    |
| ------------- | ------ | --------------------------------- |
| `--recipient` | string | Indirizzo del destinatario su QoreChain |

### withdraw

Avvia un prelievo bridge verso una chain esterna.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Attiva o riconfigura il bridge di una chain in un'unica transazione firmata (disponibile a partire dalla versione della chain **v3.1.80**). Richiede la chiave `bridge_admin` oppure una licenza `qcb_bridge` — nessuna proposta di governance né aggiornamento della chain. Imposta l'indirizzo del contratto, il numero di conferme, l'architettura e lo stato.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Seleziona il verifier attivo di una chain e installa la sua trust root (anch'esso riservato a `bridge_admin`).

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
| ------------- | ------ | -------------------------------------- |
| `--source-vm` | string | VM di origine: `evm`, `cosmwasm`, `svm`  |
| `--gas-limit` | uint   | Limite di gas per l'esecuzione cross-VM |

### process-queue

Elabora manualmente i messaggi cross-VM in sospeso (comando per operatori).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Esegue il deploy di un programma BPF nel runtime SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Tipo   | Descrizione                  |
| -------------- | ------ | --------------------------------- |
| `--program-id` | string | ID del programma opzionale (base58) |

### execute

Esegue un'istruzione su un programma SVM già deployato.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Tipo   | Descrizione                                         |
| ------------ | ------ | ------------------------------------------------------ |
| `--accounts` | string | Pubkey degli account per l'istruzione, separate da virgola |

### create-account

Crea un nuovo account SVM con spazio dati allocato.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Tipo   | Descrizione                                     |
| --------- | ------ | ---------------------------------------------------- |
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
| `--block-time-ms`       | uint   | Tempo di blocco target in ms (predefinito 2000)      |
| `--domains`             | string | Domini supportati separati da virgola (predefinito `defi`)  |
| `--max-tx`              | uint   | Numero massimo di transazioni per blocco (predefinito 1000) |
| `--min-validators`      | uint32 | Dimensione minima del set di validator (predefinito 1) |
| `--settlement-interval` | uint   | Intervallo di settlement in blocchi (predefinito 100) |
| `--vm-types`            | string | Tipi di VM supportati separati da virgola (predefinito `evm`) |

### register-paychain

Registra un nuovo layer paychain per microtransazioni ad alta frequenza.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Tipo | Descrizione                                  |
| ----------------------- | ---- | ------------------------------------------------ |
| `--max-tx`              | uint | Numero massimo di transazioni per blocco (predefinito 5000)    |
| `--settlement-interval` | uint | Intervallo di settlement in blocchi (predefinito 50)   |

### anchor-state

Invia un ancoraggio di stato (settlement) per un layer registrato.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Instrada una transazione verso il layer ottimale.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Tipo   | Descrizione                       |
| ---------------- | ------ | -------------------------------------- |
| `--target-layer` | string | Forza l'instradamento verso un layer specifico |

### update-layer-status

Aggiorna lo stato operativo di un layer (solo operatori).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valori di stato: `active`, `paused`, `draining`.

### challenge-anchor

Invia una contestazione per frode contro un ancoraggio di stato.

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
| `--stake`           | string | Importo dello stake dell'operatore                   |
| `--da-enabled`      | bool   | Abilita la data availability nativa                  |

### submit-batch

Invia un batch di settlement per un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Invia una contestazione per frode contro un batch di settlement (rollup optimistic).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalizza manualmente un batch che ha superato la finestra di contestazione.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Mette in pausa un rollup (solo operatori).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Riprende un rollup in pausa (solo operatori).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Arresta definitivamente un rollup e ne rilascia lo stake (solo operatori).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Anche il prelievo dal rollup e il settlement cross-layer sono esposti nel gruppo di transazioni `rdk` (ad esempio, un comando `execute-withdrawal` che regola un prelievo dimostrato rispetto a un batch finalizzato). Gli argomenti e i flag esatti dipendono dal tipo di settlement e dalla configurazione DA del tuo rollup; consulta la documentazione del **Rollup Development Kit** per la superficie di comando autorevole prima di costruire queste transazioni.
:::

---

## babylon

### submit-btc-checkpoint

Invia un checkpoint BTC per un'epoca.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Esegue il restaking di BTC tramite l'integrazione Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Tipo   | Descrizione                       |
| --------------- | ------ | ------------------------------------ |
| `--btc-tx-hash` | string | Hash della transazione Bitcoin come prova |

---

## abstractaccount

### create

Crea un abstract account con regole di spesa programmabili.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Tipo   | Descrizione                       |
| ------------------ | ------ | -------------------------------------- |
| `--spending-rules` | string | File JSON che definisce le regole di spesa |

### update-spending-rules

Aggiorna le regole di spesa di un abstract account esistente.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

Inoltra tramite relayer un bank send sulla corsia Native autorizzato da un authenticator, a partire da un account canonico (disponibile a partire dalla versione della chain **v3.1.85**). Il relayer (`--from`) firma e paga l'envelope; la firma della chiave collegata sui sign bytes vincolati anti-replay costituisce l'autorizzazione. Vedi [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

Inoltra tramite relayer una chiamata o un trasferimento EVM autorizzato da un authenticator, dall'indirizzo EVM dell'account canonico (disponibile a partire dalla versione della chain **v3.1.85**). Il nonce è il nonce EVM **corrente** dell'account.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM è il layer di reinforcement learning che ottimizza i parametri del consenso. Questi comandi controllano l'agente PRISM; il nome del modulo CLI `rlconsensus` e i suoi sottocomandi sono mantenuti invariati.

### set-agent-mode

Imposta la modalità operativa dell'agente PRISM (solo governance).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valori di modalità: `0` (off), `1` (observe), `2` (suggest), `3` (auto).

### resume-agent

Riattiva l'agente PRISM dopo l'intervento di un circuit breaker.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Aggiorna la configurazione della policy dell'agente PRISM (solo governance).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Aggiorna la configurazione dei pesi delle ricompense per l'agente PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Tipo   | Descrizione                  |
| --------------------- | ------ | ------------------------------- |
| `--throughput-weight` | string | Peso per la ricompensa di throughput |
| `--latency-weight`    | string | Peso per la ricompensa di latenza    |
| `--security-weight`   | string | Peso per la ricompensa di sicurezza  |
