---
slug: /developer-guide/running-a-validator
title: Eseguire un validatore
sidebar_label: Eseguire un validatore
sidebar_position: 9
---

# Eseguire un validatore

Questa guida copre come creare un validatore sulla rete QoreChain, comprendere il sistema di classificazione dei pool, registrare una chiave PQC per una sicurezza resistente ai computer quantistici e monitorare il tuo nodo.

:::note
Questa guida è rivolta alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**), attiva dal 7 giugno 2026 ed eseguita sulla versione di chain **v3.1.77**. La testnet **`qorechain-diana`** (EVM chain ID **9800**) è consigliata per provare la tua configurazione prima del go-live. Sostituisci il `--chain-id` appropriato per la tua rete di destinazione.
:::

---

## Prerequisiti

* Un nodo `qorechaind` completamente sincronizzato (vedi [Connecting to Testnet](/getting-started/connecting-to-testnet))
* Un account finanziato con almeno **1.000 QOR** (1.000.000.000 uqor) per l'auto-delega iniziale
* Familiarità con il modello di [Staking and Delegation](/user-guide/staking-and-delegation)

---

## Creare un validatore

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parametro                      | Descrizione                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Importo dell'auto-delega (stake minimo)            |
| `--pubkey`                     | Chiave pubblica di consenso del validatore (ed25519) |
| `--moniker`                    | Nome leggibile per il tuo validatore               |
| `--commission-rate`            | Tasso di commissione iniziale (es. 0.10 = 10%)     |
| `--commission-max-rate`        | Tasso di commissione massimo (immutabile dopo la creazione) |
| `--commission-max-change-rate` | Tasso massimo di variazione giornaliera della commissione |
| `--min-self-delegation`        | Token minimi che l'operatore deve auto-delegare    |

Dopo la conferma della transazione, verifica il tuo validatore:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classificazione dei pool

QoreChain usa un **sistema di classificazione a tre pool** gestito dal modulo `x/qca` (Quantum Consensus Allocation). Ogni **1.000 blocchi**, i validatori vengono riclassificati in uno dei tre pool in base alla loro reputazione e al loro stake:

| Pool                                 | Criteri                                           | Allocazione blocchi |
| ------------------------------------ | ------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputazione >= 70° percentile E stake >= mediana  | 40% dei blocchi     |
| **DPoS** (Delegated Proof-of-Stake)  | Delega totale >= 10.000 QOR                        | 35% dei blocchi     |
| **PoS** (Proof-of-Stake)             | Tutti i restanti validatori attivi                | 25% dei blocchi     |

All'interno di ciascun pool, i proponenti dei blocchi vengono selezionati tramite **selezione casuale ponderata** proporzionale al loro stake effettivo. La classificazione garantisce che sia i validatori ad alta reputazione sia quelli ad alta delega ricevano una rappresentanza equa, pur consentendo ai validatori più piccoli di partecipare.

### Interrogare la classificazione del tuo pool

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Tramite JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Curva di bonding

La ricompensa di staking per un validatore è determinata da una curva di bonding che incorpora più fattori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                |
| --------- | ---------------------------------------------------------- |
| `R`       | Importo della ricompensa                                   |
| `beta`    | Tasso base di ricompensa                                   |
| `S`       | Stake effettivo                                            |
| `alpha`   | Costante di scaling della fedeltà                          |
| `L`       | Durata della fedeltà (tempo di staking continuo)           |
| `Q(r)`    | Fattore di qualità della reputazione, intervallo \[0.75 - 1.25] |
| `P(t)`    | Moltiplicatore di fase del protocollo (si adatta lungo il ciclo di vita della rete) |

**Punti chiave:**

* **Bonus per durata della fedeltà:** I validatori che fanno staking in modo continuo ricevono ricompense crescenti tramite il termine logaritmico di fedeltà. Questo incentiva l'impegno a lungo termine.
* **Fattore di qualità della reputazione:** Varia da 0,75 (reputazione scarsa) a 1,25 (reputazione eccellente). La reputazione è calcolata da uptime, proposte riuscite, partecipazione alla community e qualità della validazione delle transazioni.
* **Moltiplicatore di fase del protocollo:** Si adatta man mano che la rete matura attraverso diverse fasi (bootstrap, crescita, maturità).

---

## Slashing progressivo

QoreChain usa un modello di **slashing progressivo** che intensifica le penalità per i recidivi consentendo al contempo ai validatori di recuperare nel tempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametro                       | Valore         |
| ------------------------------- | -------------- |
| Penalità massima per evento     | 33% dello stake |
| Emivita di decadimento          | 100.000 blocchi |
| Severità per downtime           | 1.0            |
| Severità per doppia firma       | 2.0            |
| Severità per attacco light client | 3.0          |

1. **Ogni infrazione incrementa l'effective count.** Ogni infrazione (downtime, doppia firma, ecc.) aumenta l'effective count del validatore, che influisce sulle penalità future.

2. **La penalità cresce esponenzialmente.** La penalità si intensifica in base all'effective count usando la formula sopra, così i recidivi affrontano penalità molto più grandi.

3. **L'effective count decade nel tempo.** L'effective count decade con un'emivita di 100.000 blocchi (\~7 giorni con blocchi da 6s), consentendo ai validatori di recuperare dopo un periodo di buon comportamento.

4. **Eventi singoli vs infrazioni ripetute.** Un singolo evento accidentale di downtime comporta una penalità minore, mentre infrazioni ripetute innescano conseguenze esponenzialmente crescenti.

---

## Registrazione della chiave PQC

I validatori possono opzionalmente registrare una **chiave pubblica crittografica post-quantistica (PQC)** usando l'algoritmo ML-DSA-87. Questo fornisce una sicurezza resistente ai computer quantistici per l'identità del validatore e può essere usato per la firma ibrida.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametro      | Descrizione                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | Chiave pubblica ML-DSA-87 da 2592 byte in codifica hex |
| `hybrid`       | Modalità di registrazione (hybrid = classica + PQC) |

Verifica la registrazione:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Raccomandazione:** La registrazione della chiave PQC è opzionale ma fortemente consigliata per i validatori che operano sulla mainnet. Fornisce una difesa lungimirante contro le minacce dell'informatica quantistica.
:::

---

## Monitoraggio

### Metriche Prometheus

QoreChain espone le metriche Prometheus sulla porta **26660**:

```
http://localhost:26660/metrics
```

Metriche chiave da monitorare:

| Metrica                         | Descrizione                                     |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Totale dei blocchi mancati dal tuo validatore   |
| `qorechain_validator_uptime`    | Percentuale di uptime sugli ultimi N blocchi    |
| `qorechain_reputation_score`    | Punteggio di reputazione corrente               |
| `qorechain_pool_classification` | Assegnazione corrente del pool (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Blocchi firmati consecutivamente                |
| `consensus_height`              | Altezza corrente del blocco                     |
| `consensus_rounds`              | Round di consenso per l'altezza corrente        |

### Interrogare il punteggio di reputazione

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Tramite JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Controlli di salute

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Migliori pratiche operative

1. **Usa un'architettura con nodi sentinella.** Esegui il tuo validatore dietro nodi sentinella per proteggerlo dagli attacchi DDoS. Esponi alla rete pubblica solo i nodi sentinella.

2. **Configura gli avvisi.** Configura allarmi per blocchi mancati, basso uptime e riavvii imprevisti. Qualche blocco mancato è normale; mancanze prolungate innescheranno lo slashing.

3. **Mantieni un uptime elevato.** Il sistema di reputazione premia un uptime costante. Un downtime prolungato degrada il tuo fattore di qualità della reputazione, riducendo le ricompense.

4. **Mantieni il software aggiornato.** Segui le release di QoreChain e applica gli aggiornamenti tempestivamente. Coordinati con la community dei validatori per gli upgrade della chain.

5. **Proteggi le tue chiavi.** Usa un modulo di sicurezza hardware (HSM) o un remote signer per la chiave di consenso del validatore. Non memorizzare mai le chiavi sulla stessa macchina del nodo.

6. **Registra una chiave PQC.** Rendi il tuo validatore a prova di futuro contro le minacce quantistiche registrando una chiave ML-DSA-87.

7. **Monitora il tuo pool.** Tieni traccia della classificazione del tuo pool ogni 1.000 blocchi. Migliorare la tua reputazione può spostarti da PoS a RPoS, aumentando significativamente le opportunità di proposta dei blocchi.

---

## Riferimento ai comandi del validatore

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Prossimi passi

* [Building from Source](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* [EVM Development](/developer-guide/evm-development) — Distribuisci smart contract su QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Account programmabili per le operazioni del tuo validatore
