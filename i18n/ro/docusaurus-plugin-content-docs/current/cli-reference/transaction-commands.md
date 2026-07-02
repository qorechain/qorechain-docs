---
slug: /cli-reference/transaction-commands
title: Comenzi de tranzacții
sidebar_label: Comenzi de tranzacții
sidebar_position: 2
---

# Comenzi de tranzacții

Toate comenzile de tranzacții urmează modelul:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Setați `--chain-id qorechain-vladi` pentru a difuza tranzacții către mainnet-ul live (versiunea lanțului **v3.1.82**) sau `--chain-id qorechain-diana` pentru testnet. Dacă este omis, clientul folosește `chain-id`-ul din configurația locală.
:::

Flagurile comune se aplică fiecărei subcomenzi `tx`:

| Flag                | Tip    | Descriere                                                     |
| ------------------- | ------ | ------------------------------------------------------------- |
| `--from`            | string | Numele sau adresa cheii de semnare                             |
| `--chain-id`        | string | Identificatorul lanțului (implicit: din configurație)          |
| `--fees`            | string | Taxele tranzacției (de ex., `500uqor`)                         |
| `--gas`             | string | Limita de gas sau `auto` pentru estimare                       |
| `--gas-adjustment`  | float  | Multiplicator de gas când se folosește `auto` (implicit: 1.0)  |
| `--keyring-backend` | string | Backend-ul keyring-ului: `os`, `file`, `test`                  |
| `--node`            | string | Endpoint RPC (implicit: `tcp://localhost:26657`)               |
| `--broadcast-mode`  | string | `sync`, `async` sau `block`                                    |
| `-y`                | bool   | Omite promptul de confirmare                                   |

---

## bank

### send

Transferă tokenuri de la un cont la altul.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Creează un validator nou în rețea.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Tip    | Descriere                                        |
| ------------------------------ | ------ | ------------------------------------------------ |
| `--amount`                     | string | Suma de auto-delegare (de ex., `1000000uqor`)    |
| `--pubkey`                     | string | Cheia publică de consens a validatorului (JSON)  |
| `--moniker`                    | string | Numele afișat al validatorului                   |
| `--commission-rate`            | string | Rata inițială a comisionului (de ex., `0.10`)    |
| `--commission-max-rate`        | string | Rata maximă a comisionului                       |
| `--commission-max-change-rate` | string | Rata maximă de modificare zilnică a comisionului |
| `--min-self-delegation`        | string | Auto-delegarea minimă necesară                   |

### edit-validator

Editează descrierea sau comisionul unui validator existent.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Deleagă tokenuri către un validator.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Mută delegarea de la un validator la altul.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Retrage (unbond) tokenuri de la un validator.

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

---

## distribution

### withdraw-all-rewards

Retrage toate recompensele de staking în așteptare.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retrage recompensele de la un anumit validator.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tip  | Descriere                           |
| -------------- | ---- | ----------------------------------- |
| `--commission` | bool | Retrage și comisionul validatorului |

---

## gov

### submit-proposal

Trimite o propunere de guvernanță.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Fișierul propunerii este un document JSON care specifică tipul propunerii, titlul, descrierea și mesajele de executat.

### vote

Votează asupra unei propuneri active.

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Opțiuni de vot: `yes`, `no`, `abstain`, `no_with_veto`.

### deposit

Adaugă un depozit la o propunere.

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc

Calea de tranzacții cosmos necesită implicit o semnătură hibridă (`hybrid_signature_mode = required`). Comenzile `gen-key` și `cosign` produc cheia Dilithium-5 (ML-DSA-87) și extensia `PQCHybridSignature` necesare pentru a tranzacționa pe calea cosmos, alături de semnătura clasică secp256k1.

### gen-key

Generează o cheie post-cuantică Dilithium-5 (ML-DSA-87) pentru semnare hibridă.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Atașează o cosemnătură Dilithium-5 unei tranzacții ca extensie `PQCHybridSignature`, producând o tranzacție hibridă (secp256k1 + ML-DSA-87). Necesară pentru tranzacțiile pe calea cosmos sub modul de aplicare implicit `required`. Uneltele standard CosmJS / relayer trebuie să producă această extensie pentru a putea tranzacționa; `buildHybridTx` din SDK-ul QoreChain (cu `includePqcPublicKey`) face echivalentul.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> [flags]
```

### register-key

Înregistrează o cheie publică post-cuantică pentru un cont.

```bash
qorechaind tx pqc register-key <algorithm> <pubkey_hex> [flags]
```

### register-key-v2

Înregistrează o cheie PQC cu metadate extinse și atestare.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> [flags]
```

| Flag            | Tip    | Descriere                              |
| --------------- | ------ | -------------------------------------- |
| `--attestation` | string | Date de atestare TEE (hex)             |
| `--metadata`    | string | Metadate suplimentare ale cheii (JSON) |

### migrate-key

Migrează o cheie clasică existentă către o pereche de chei PQC hibridă.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

---

## xqore

### lock

Blochează tokenuri QOR într-o poziție de staking de guvernanță xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Tip    | Descriere                                        |
| ----------------- | ------ | ------------------------------------------------ |
| `--lock-duration` | string | Durata de blocare (de ex., `30d`, `90d`, `180d`) |

### unlock

Deblochează xQORE înapoi în QOR. Deblocarea anticipată poate atrage penalități în funcție de nivelul de penalizare.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Inițiază un depozit prin bridge dintr-un lanț extern.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Tip    | Descriere                          |
| ------------- | ------ | ---------------------------------- |
| `--recipient` | string | Adresa destinatarului pe QoreChain |

### withdraw

Inițiază o retragere prin bridge către un lanț extern.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Activează sau reconfigurează bridge-ul unui lanț într-o singură tranzacție semnată (disponibil începând cu versiunea lanțului **v3.1.80**). Necesită cheia `bridge_admin` sau o licență `qcb_bridge` — fără propunere de guvernanță sau upgrade al lanțului. Setează adresa contractului, numărul de confirmări, arhitectura și starea.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Selectează verificatorul activ al unui lanț și instalează rădăcina sa de încredere (de asemenea restricționat la `bridge_admin`).

```bash
qorechaind tx bridge set-verifier-bootstrap <chain_id> <verifier> [flags] --from bridge-admin
```

---

## crossvm

### call

Trimite un mesaj cross-VM între medii de execuție (EVM, CosmWasm, SVM).

```bash
qorechaind tx crossvm call <target_vm> <contract_address> <payload_hex> [flags]
```

| Flag          | Tip    | Descriere                              |
| ------------- | ------ | -------------------------------------- |
| `--source-vm` | string | VM-ul sursă: `evm`, `cosmwasm`, `svm`  |
| `--gas-limit` | uint   | Limita de gas pentru execuția cross-VM |

### process-queue

Procesează manual mesajele cross-VM în așteptare (comandă de operator).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Implementează un program BPF în runtime-ul SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Tip    | Descriere                       |
| -------------- | ------ | ------------------------------- |
| `--program-id` | string | ID de program opțional (base58) |

### execute

Execută o instrucțiune pe un program SVM implementat.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Tip    | Descriere                                                       |
| ------------ | ------ | --------------------------------------------------------------- |
| `--accounts` | string | Chei publice de cont pentru instrucțiune, separate prin virgulă |

### create-account

Creează un cont SVM nou cu spațiu de date alocat.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Tip    | Descriere                                                    |
| --------- | ------ | ------------------------------------------------------------ |
| `--owner` | string | Programul proprietar (base58, implicit: programul de sistem) |

---

## multilayer

### register-sidechain

Înregistrează un nou layer de tip sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Tip    | Descriere                                                      |
| ----------------------- | ------ | -------------------------------------------------------------- |
| `--block-time-ms`       | uint   | Timpul-țintă al blocului în ms (implicit 2000)                 |
| `--domains`             | string | Domenii suportate, separate prin virgulă (implicit `defi`)     |
| `--max-tx`              | uint   | Numărul maxim de tranzacții per bloc (implicit 1000)           |
| `--min-validators`      | uint32 | Dimensiunea minimă a setului de validatori (implicit 1)        |
| `--settlement-interval` | uint   | Intervalul de decontare în blocuri (implicit 100)              |
| `--vm-types`            | string | Tipuri de VM suportate, separate prin virgulă (implicit `evm`) |

### register-paychain

Înregistrează un nou layer de tip paychain pentru microtranzacții de înaltă frecvență.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Tip  | Descriere                                            |
| ----------------------- | ---- | ---------------------------------------------------- |
| `--max-tx`              | uint | Numărul maxim de tranzacții per bloc (implicit 5000) |
| `--settlement-interval` | uint | Intervalul de decontare în blocuri (implicit 50)     |

### anchor-state

Trimite o ancoră de stare (decontare) pentru un layer înregistrat.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Rutează o tranzacție către layerul optim.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Tip    | Descriere                              |
| ---------------- | ------ | -------------------------------------- |
| `--target-layer` | string | Forțează rutarea către un anumit layer |

### update-layer-status

Actualizează starea operațională a unui layer (doar pentru operatori).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valori de stare: `active`, `paused`, `draining`.

### challenge-anchor

Trimite o contestație de fraudă împotriva unei ancore de stare.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Înregistrează un rollup nou cu Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Tip    | Descriere                                                  |
| ------------------- | ------ | ---------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`             |
| `--profile`         | string | Presetare: `defi`, `gaming`, `nft`, `enterprise`, `custom` |
| `--stake`           | string | Suma stake-ului operatorului                               |
| `--da-enabled`      | bool   | Activează disponibilitatea nativă a datelor                |

### submit-batch

Trimite un lot de decontare pentru un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Trimite o contestație de fraudă împotriva unui lot de decontare (rollup-uri optimiste).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalizează manual un lot care a depășit fereastra de contestare.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pune pe pauză un rollup (doar pentru operatori).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reia un rollup pus pe pauză (doar pentru operatori).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Oprește definitiv un rollup și eliberează stake-ul acestuia (doar pentru operatori).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Retragerea din rollup și decontarea cross-layer sunt de asemenea expuse în grupul de tranzacții `rdk` (de exemplu, o comandă `execute-withdrawal` care decontează o retragere dovedită împotriva unui lot finalizat). Argumentele și flagurile exacte depind de tipul de decontare și de configurația DA a rollup-ului dumneavoastră; consultați documentația **Rollup Development Kit** pentru suprafața de comenzi autoritativă înainte de a construi aceste tranzacții.
:::

---

## babylon

### submit-btc-checkpoint

Trimite un checkpoint BTC pentru o epocă.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restake-uiește BTC prin integrarea Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Tip    | Descriere                             |
| --------------- | ------ | ------------------------------------- |
| `--btc-tx-hash` | string | Hash-ul tranzacției Bitcoin ca dovadă |

---

## abstractaccount

### create

Creează un cont abstract cu reguli de cheltuire programabile.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Tip    | Descriere                                        |
| ------------------ | ------ | ------------------------------------------------ |
| `--spending-rules` | string | Fișier JSON care definește regulile de cheltuire |

### update-spending-rules

Actualizează regulile de cheltuire pentru un cont abstract existent.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

---

## rlconsensus

PRISM este stratul de învățare prin întărire (reinforcement learning) care reglează parametrii de consens. Aceste comenzi controlează agentul PRISM; numele modulului CLI `rlconsensus` și subcomenzile sale sunt păstrate ca atare.

### set-agent-mode

Setează modul operațional al agentului PRISM (doar prin guvernanță).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valori de mod: `0` (oprit), `1` (observare), `2` (sugerare), `3` (automat).

### resume-agent

Reia agentul PRISM după declanșarea unui circuit breaker.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Actualizează configurația politicii agentului PRISM (doar prin guvernanță).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Actualizează configurația ponderilor de recompensă pentru agentul PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Tip    | Descriere                                |
| --------------------- | ------ | ---------------------------------------- |
| `--throughput-weight` | string | Ponderea pentru recompensa de throughput |
| `--latency-weight`    | string | Ponderea pentru recompensa de latență    |
| `--security-weight`   | string | Ponderea pentru recompensa de securitate |
