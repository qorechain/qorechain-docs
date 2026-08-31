---
slug: /cli-reference/transaction-commands
title: Comenzi de tranzacție
sidebar_label: Comenzi de tranzacție
sidebar_position: 2
---

# Comenzi de tranzacție

Toate comenzile de tranzacție urmează modelul:

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Setați `--chain-id qorechain-vladi` pentru a difuza tranzacția pe mainnet-ul live (versiunea de chain **v3.1.95**), sau `--chain-id qorechain-diana` pentru testnet. Dacă este omis, clientul folosește `chain-id`-ul din configurația locală.
:::

Flag-urile comune se aplică fiecărei subcomenzi `tx`:

| Flag                | Tip    | Descriere                                        |
| ------------------- | ------ | ------------------------------------------------- |
| `--from`            | string | Numele sau adresa cheii semnatare                  |
| `--chain-id`        | string | Identificatorul chain-ului (implicit: din config)  |
| `--fees`            | string | Taxele de tranzacție (ex: `500uqor`)               |
| `--gas`             | string | Limita de gas sau `auto` pentru estimare           |
| `--gas-adjustment`  | float  | Multiplicator de gas când se folosește `auto` (implicit: 1.0) |
| `--keyring-backend` | string | Backend-ul keyring: `os`, `file`, `test`           |
| `--node`            | string | Endpoint-ul RPC (implicit: `tcp://localhost:26657`) |
| `--broadcast-mode`  | string | `sync`, `async`, sau `block`                       |
| `-y`                | bool   | Sare peste promptul de confirmare                  |

---

## bank

### send

Transferă tokeni de la un cont la altul.

```bash
qorechaind tx bank send <from_address> <to_address> <amount> [flags]
```

---

## staking

### create-validator

Creează un validator nou pe rețea.

```bash
qorechaind tx staking create-validator [flags]
```

| Flag                           | Tip    | Descriere                                       |
| ------------------------------ | ------ | ------------------------------------------------- |
| `--amount`                     | string | Suma de auto-delegare (ex: `1000000uqor`)          |
| `--pubkey`                     | string | Cheia publică de consens a validatorului (JSON)    |
| `--moniker`                    | string | Numele de afișare al validatorului                 |
| `--commission-rate`            | string | Rata inițială de comision (ex: `0.10`)             |
| `--commission-max-rate`        | string | Rata maximă de comision                            |
| `--commission-max-change-rate` | string | Rata maximă de schimbare zilnică a comisionului     |
| `--min-self-delegation`        | string | Auto-delegarea minimă necesară                      |

### edit-validator

Editează descrierea sau comisionul unui validator existent.

```bash
qorechaind tx staking edit-validator [flags]
```

### delegate

Delegă tokeni unui validator.

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

Mută delegarea de la un validator la altul.

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

Retrage tokenii delegați unui validator.

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

Retrage recompensele de la un validator specific.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Flag           | Tip  | Descriere                                |
| -------------- | ---- | ------------------------------------------ |
| `--commission` | bool | Retrage și comisionul validatorului         |

---

## gov

### submit-proposal

Trimite o propunere de guvernanță.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

Fișierul propunerii este un document JSON care specifică tipul propunerii, titlul, descrierea și orice mesaje de executat.

### vote

Votează o propunere activă.

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

Calea de tranzacție cosmos necesită, implicit, o semnătură hibridă (`hybrid_signature_mode = required`). Comenzile `gen-key` și `cosign` produc cheia Dilithium-5 (ML-DSA-87) și extensia `PQCHybridSignature` necesare pentru a tranzacționa pe calea cosmos alături de semnătura clasică secp256k1.

### gen-key

Generează o cheie post-cuantică Dilithium-5 (ML-DSA-87) pentru semnare hibridă.

```bash
qorechaind tx pqc gen-key [flags]
```

### cosign

Atașează o cosemnătură Dilithium-5 unei tranzacții ca extensie `PQCHybridSignature`, producând o tranzacție hibridă (secp256k1 + ML-DSA-87). Necesară pentru tranzacțiile pe calea cosmos în modul de aplicare implicit `required`. Uneltele standard CosmJS / relayer trebuie să producă această extensie pentru a tranzacționa; `buildHybridTx` din SDK-ul QoreChain (cu `includePqcPublicKey`) face echivalentul.

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

| Flag            | Tip    | Descriere                             |
| --------------- | ------ | ---------------------------------------- |
| `--attestation` | string | Date de atestare TEE (hex)                |
| `--metadata`    | string | Metadate suplimentare ale cheii (JSON)    |

### migrate-key

Migrează o cheie clasică existentă către o pereche de chei hibride PQC.

```bash
qorechaind tx pqc migrate-key <algorithm> <pqc_pubkey_hex> [flags]
```

### recover-key

Reconstruiește determinist cheia ML-DSA-87 a contului din mnemonicul BIP-39 (citit de la stdin) și o stochează local (disponibil începând cu versiunea de chain **v3.1.85**). Folosește derivarea standard în ecosistem `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
qorechaind tx pqc recover-key <name> <address> [flags]
```

| Flag           | Tip    | Descriere                                                   |
| -------------- | ------ | -------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonic, implicit) sau `bridge` (legacy `SHAKE-256(mnemonic)`) |

### rotate-key

Rotește cheia ML-DSA-87 a contului **în cadrul aceluiași algoritm** (disponibil începând cu versiunea de chain **v3.1.85**) — de exemplu pentru a migra o cheie derivată legacy către derivarea canonică, sau pentru a retrage o cheie compromisă. Citește mnemonicul de la stdin, semnează dublu cu cheia veche și cea nouă, cosemnează plicul cu cheia veche și difuzează tranzacția. Emite pe stdout doar JSON-ul tranzacției (liniile informative merg pe stderr), astfel încât se poate combina cu `-o json`.

```bash
qorechaind tx pqc rotate-key [flags]
```

| Flag               | Tip    | Descriere                                            |
| ------------------ | ------ | -------------------------------------------------------- |
| `--old-derivation` | string | Derivarea cheii înregistrate în prezent (`adapter` \| `bridge`) |
| `--new-derivation` | string | Derivarea noii chei (`adapter` \| `bridge`)                |
| `--new-random`     | bool   | Generează în schimb o cheie aleatorie nouă                 |

---

## xqore

### lock

Blochează tokeni QOR într-o poziție de staking de guvernanță xQORE.

```bash
qorechaind tx xqore lock <amount> [flags]
```

| Flag              | Tip    | Descriere                                   |
| ----------------- | ------ | ---------------------------------------------- |
| `--lock-duration` | string | Durata blocării (ex: `30d`, `90d`, `180d`)      |

### unlock

Deblochează xQORE înapoi în QOR. Deblocarea anticipată poate atrage penalizări în funcție de nivelul de penalizare.

```bash
qorechaind tx xqore unlock <amount> [flags]
```

---

## bridge

### deposit

Inițiază un depozit prin bridge de pe un chain extern.

```bash
qorechaind tx bridge deposit <chain_id> <amount> <asset> [flags]
```

| Flag          | Tip    | Descriere                        |
| ------------- | ------ | ------------------------------------ |
| `--recipient` | string | Adresa destinatarului pe QoreChain     |

### withdraw

Inițiază o retragere prin bridge către un chain extern.

```bash
qorechaind tx bridge withdraw <chain_id> <amount> <asset> <destination_address> [flags]
```

### update-chain-config

Activează sau reconfigurează bridge-ul unui chain într-o singură tranzacție semnată (disponibil începând cu versiunea de chain **v3.1.80**). Necesită cheia `bridge_admin` sau o licență `qcb_bridge` — fără propunere de guvernanță sau upgrade de chain. Setează adresa contractului, numărul de confirmări, arhitectura și statusul.

```bash
qorechaind tx bridge update-chain-config <chain_id> [flags] --from bridge-admin
```

### set-verifier-bootstrap

Selectează verificatorul activ al unui chain și instalează rădăcina sa de încredere (de asemenea condiționată de `bridge_admin`).

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

| Flag          | Tip    | Descriere                             |
| ------------- | ------ | ----------------------------------------- |
| `--source-vm` | string | VM-ul sursă: `evm`, `cosmwasm`, `svm`       |
| `--gas-limit` | uint   | Limita de gas pentru execuția cross-VM      |

### process-queue

Procesează manual mesajele cross-VM în așteptare (comandă de operator).

```bash
qorechaind tx crossvm process-queue [flags]
```

---

## svm

### deploy-program

Publică un program BPF pe runtime-ul SVM.

```bash
qorechaind tx svm deploy-program <program_binary_path> [flags]
```

| Flag           | Tip    | Descriere                       |
| -------------- | ------ | ----------------------------------- |
| `--program-id` | string | ID-ul opțional al programului (base58) |

### execute

Execută o instrucțiune pe un program SVM publicat.

```bash
qorechaind tx svm execute <program_id> <instruction_data_hex> [flags]
```

| Flag         | Tip    | Descriere                                                |
| ------------ | ------ | ------------------------------------------------------------ |
| `--accounts` | string | Chei publice de cont separate prin virgulă pentru instrucțiune |

### create-account

Creează un cont SVM nou cu spațiu de date alocat.

```bash
qorechaind tx svm create-account <pubkey> <space> [flags]
```

| Flag      | Tip    | Descriere                                          |
| --------- | ------ | ------------------------------------------------------ |
| `--owner` | string | Programul proprietar (base58, implicit: programul de sistem) |

---

## multilayer

### register-sidechain

Înregistrează un nou strat sidechain.

```bash
qorechaind tx multilayer register-sidechain <layer-id> <description> [flags]
```

| Flag                    | Tip    | Descriere                                             |
| ----------------------- | ------ | ---------------------------------------------------------- |
| `--block-time-ms`       | uint   | Timpul țintă de bloc în ms (implicit 2000)                    |
| `--domains`             | string | Domenii suportate, separate prin virgulă (implicit `defi`)    |
| `--max-tx`              | uint   | Numărul maxim de tranzacții per bloc (implicit 1000)          |
| `--min-validators`      | uint32 | Dimensiunea minimă a setului de validatori (implicit 1)       |
| `--settlement-interval` | uint   | Intervalul de decontare în blocuri (implicit 100)              |
| `--vm-types`            | string | Tipuri de VM suportate, separate prin virgulă (implicit `evm`) |

### register-paychain

Înregistrează un nou strat paychain pentru microtranzacții de frecvență ridicată.

```bash
qorechaind tx multilayer register-paychain <layer-id> <description> [flags]
```

| Flag                    | Tip  | Descriere                                    |
| ----------------------- | ---- | ---------------------------------------------- |
| `--max-tx`              | uint | Numărul maxim de tranzacții per bloc (implicit 5000) |
| `--settlement-interval` | uint | Intervalul de decontare în blocuri (implicit 50)     |

### anchor-state

Trimite o ancoră de stare (decontare) pentru un strat înregistrat.

```bash
qorechaind tx multilayer anchor-state <layer-id> <layer-height> <state-root-hex> <pqc-agg-sig-hex> [flags]
```

### route-tx

Rutează o tranzacție către stratul optim.

```bash
qorechaind tx multilayer route-tx <tx_data_hex> [flags]
```

| Flag             | Tip    | Descriere                             |
| ---------------- | ------ | ------------------------------------------ |
| `--target-layer` | string | Forțează rutarea către un strat specific     |

### update-layer-status

Actualizează statusul operațional al unui strat (doar operator).

```bash
qorechaind tx multilayer update-layer-status <layer_id> <status> [flags]
```

Valori de status: `active`, `paused`, `draining`.

### challenge-anchor

Trimite o contestație de fraudă împotriva unei ancore de stare.

```bash
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_hash> <proof_hex> [flags]
```

---

## rdk

### create-rollup

Înregistrează un nou rollup cu Rollup Development Kit.

```bash
qorechaind tx rdk create-rollup <rollup_id> [flags]
```

| Flag                | Tip    | Descriere                                              |
| ------------------- | ------ | ----------------------------------------------------------- |
| `--settlement-type` | string | `optimistic`, `zk`, `pessimistic`, `sovereign`                |
| `--profile`         | string | Preset: `defi`, `gaming`, `nft`, `enterprise`, `custom`        |
| `--stake`           | string | Suma de stake a operatorului                                  |
| `--da-enabled`      | bool   | Activează disponibilitatea nativă a datelor                    |

### submit-batch

Trimite un batch de decontare pentru un rollup.

```bash
qorechaind tx rdk submit-batch <rollup_id> <state_root_hex> <batch_data_path> [flags]
```

### challenge-batch

Trimite o contestație de fraudă împotriva unui batch de decontare (rollup-uri optimiste).

```bash
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> <proof_hex> [flags]
```

### finalize-batch

Finalizează manual un batch care a trecut de fereastra de contestare.

```bash
qorechaind tx rdk finalize-batch <rollup_id> <batch_index> [flags]
```

### pause-rollup

Pune pauză unui rollup (doar operator).

```bash
qorechaind tx rdk pause-rollup <rollup_id> [flags]
```

### resume-rollup

Reia un rollup pus pe pauză (doar operator).

```bash
qorechaind tx rdk resume-rollup <rollup_id> [flags]
```

### stop-rollup

Oprește definitiv un rollup și eliberează stake-ul acestuia (doar operator).

```bash
qorechaind tx rdk stop-rollup <rollup_id> [flags]
```

:::note
Retragerea din rollup și decontarea cross-layer sunt de asemenea expuse sub grupul de tranzacții `rdk` (de exemplu, o comandă `execute-withdrawal` care decontează o retragere dovedită față de un batch finalizat). Argumentele și flag-urile exacte depind de tipul de decontare al rollup-ului și de configurația DA; consultați documentația **Rollup Development Kit** pentru suprafața de comandă autoritară înainte de a construi aceste tranzacții.
:::

---

## babylon

### submit-btc-checkpoint

Trimite un checkpoint BTC pentru o epocă.

```bash
qorechaind tx babylon submit-btc-checkpoint <epoch> <checkpoint_hex> [flags]
```

### btc-restake

Restake BTC prin integrarea Babylon.

```bash
qorechaind tx babylon btc-restake <amount> [flags]
```

| Flag            | Tip    | Descriere                            |
| --------------- | ------ | ---------------------------------------- |
| `--btc-tx-hash` | string | Hash-ul tranzacției Bitcoin ca dovadă       |

---

## abstractaccount

### create

Creează un cont abstract cu reguli de cheltuială programabile.

```bash
qorechaind tx abstractaccount create [flags]
```

| Flag               | Tip    | Descriere                                |
| ------------------ | ------ | -------------------------------------------- |
| `--spending-rules` | string | Fișier JSON care definește regulile de cheltuială |

### update-spending-rules

Actualizează regulile de cheltuială pentru un cont abstract existent.

```bash
qorechaind tx abstractaccount update-spending-rules <rules_file.json> [flags]
```

### execute-cosmos

Retransmite o trimitere bank pe lane-ul nativ, autorizată de un authenticator, dintr-un cont canonic (disponibil începând cu versiunea de chain **v3.1.85**). Relayer-ul (`--from`) semnează și plătește plicul; semnătura cheii legate peste sign bytes-urile legate de replay-protection reprezintă autorizarea. Vedeți [Linked Wallet Authenticators](/developer-guide/account-abstraction#authenticators).

```bash
qorechaind tx abstractaccount execute-cosmos <account> <to> <amount> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

### execute-evm

Retransmite un apel sau transfer EVM autorizat de un authenticator, de la adresa EVM a contului canonic (disponibil începând cu versiunea de chain **v3.1.85**). Nonce-ul este nonce-ul EVM **curent** al contului.

```bash
qorechaind tx abstractaccount execute-evm <account> <to> <value> <data_hex> \
  <auth_pubkey_hex> <auth_signature_hex> <nonce> --from relayer -y
```

---

## rlconsensus

PRISM este stratul de învățare prin întărire (reinforcement learning) care reglează parametrii de consens. Aceste comenzi controlează agentul PRISM; numele modulului CLI `rlconsensus` și subcomenzile sale sunt păstrate verbatim.

### set-agent-mode

Setează modul operațional al agentului PRISM (doar guvernanță).

```bash
qorechaind tx rlconsensus set-agent-mode <mode> [flags]
```

Valori de mod: `0` (oprit), `1` (observă), `2` (sugerează), `3` (automat).

### resume-agent

Reia agentul PRISM după declanșarea unui circuit breaker.

```bash
qorechaind tx rlconsensus resume-agent [flags]
```

### update-policy

Actualizează configurația politicii agentului PRISM (doar guvernanță).

```bash
qorechaind tx rlconsensus update-policy <policy_file.json> [flags]
```

### update-reward-weights

Actualizează configurația ponderilor de recompensă pentru agentul PRISM.

```bash
qorechaind tx rlconsensus update-reward-weights [flags]
```

| Flag                  | Tip    | Descriere                          |
| --------------------- | ------ | -------------------------------------- |
| `--throughput-weight` | string | Ponderea pentru recompensa de throughput |
| `--latency-weight`    | string | Ponderea pentru recompensa de latență     |
| `--security-weight`   | string | Ponderea pentru recompensa de securitate   |
