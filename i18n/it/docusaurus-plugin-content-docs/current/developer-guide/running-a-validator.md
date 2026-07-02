---
slug: /developer-guide/running-a-validator
title: Gestire un Validatore
sidebar_label: Gestire un Validatore
sidebar_position: 9
---

# Gestire un Validatore

Questa guida spiega come creare un validatore sulla rete QoreChain, comprendere il sistema di classificazione a pool, registrare una chiave PQC per una sicurezza resistente ai computer quantistici e monitorare il proprio nodo.

:::note
Questa guida si riferisce alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**), attiva dal 7 giugno 2026 con la versione di chain **v3.1.82**. La testnet **`qorechain-diana`** (EVM chain ID **9800**) è consigliata per provare la configurazione prima di andare in produzione. Sostituisci il `--chain-id` appropriato per la rete di destinazione.
:::

---

## Prerequisiti

* Un nodo `qorechaind` completamente sincronizzato (vedi [Connessione alla Testnet](/getting-started/connecting-to-testnet))
* Un account con fondi per almeno **1.000 QOR** (1,000,000,000 uqor) per l'auto-delega iniziale
* Familiarità con il modello di [Staking e Delega](/user-guide/staking-and-delegation)

---

## Creare un Validatore

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

| Parametro                      | Descrizione                                                |
| ------------------------------ | ---------------------------------------------------------- |
| `--amount`                     | Importo dell'auto-delega (stake minimo)                    |
| `--pubkey`                     | Chiave pubblica di consenso del validatore (ed25519)       |
| `--moniker`                    | Nome leggibile del tuo validatore                          |
| `--commission-rate`            | Tasso di commissione iniziale (es. 0.10 = 10%)             |
| `--commission-max-rate`        | Tasso di commissione massimo (immutabile dopo la creazione) |
| `--commission-max-change-rate` | Variazione massima giornaliera del tasso di commissione    |
| `--min-self-delegation`        | Token minimi che l'operatore deve auto-delegare            |

Dopo la conferma della transazione, verifica il tuo validatore:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classificazione a Pool

QoreChain utilizza un **sistema di classificazione a tre pool** gestito dal modulo `x/qca` (Quantum Consensus Allocation). Ogni **1.000 blocchi**, i validatori vengono riclassificati in uno dei tre pool in base alla loro reputazione e al loro stake:

| Pool                                 | Criteri                                                | Allocazione dei blocchi |
| ------------------------------------ | ------------------------------------------------------ | ----------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputazione >= 70° percentile E stake >= mediana       | 40% dei blocchi         |
| **DPoS** (Delegated Proof-of-Stake)  | Delega totale >= 10,000 QOR                            | 35% dei blocchi         |
| **PoS** (Proof-of-Stake)             | Tutti i restanti validatori attivi                     | 25% dei blocchi         |

All'interno di ciascun pool, i proponenti dei blocchi vengono scelti tramite **selezione casuale ponderata** proporzionale al loro stake effettivo. La classificazione garantisce che sia i validatori ad alta reputazione sia quelli con molte deleghe ricevano una rappresentanza equa, permettendo comunque ai validatori più piccoli di partecipare.

### Interrogare la Propria Classificazione di Pool

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

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

## Curva di Bonding

La ricompensa di staking di un validatore è determinata da una curva di bonding che incorpora più fattori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                     |
| --------- | --------------------------------------------------------------- |
| `R`       | Importo della ricompensa                                         |
| `beta`    | Tasso di ricompensa base                                         |
| `S`       | Stake effettivo                                                  |
| `alpha`   | Costante di scala della fedeltà                                  |
| `L`       | Durata della fedeltà (tempo di staking continuo)                 |
| `Q(r)`    | Fattore di qualità della reputazione, intervallo \[0.75 - 1.25]  |
| `P(t)`    | Moltiplicatore di fase del protocollo (si adegua lungo il ciclo di vita della rete) |

**Punti chiave:**

* **Bonus per durata della fedeltà:** i validatori che mantengono lo staking in modo continuativo ricevono ricompense crescenti grazie al termine logaritmico di fedeltà. Questo incentiva l'impegno a lungo termine.
* **Fattore di qualità della reputazione:** varia da 0.75 (reputazione scarsa) a 1.25 (reputazione eccellente). La reputazione è calcolata a partire da uptime, proposte andate a buon fine, partecipazione alla community e qualità della validazione delle transazioni.
* **Moltiplicatore di fase del protocollo:** si adegua man mano che la rete matura attraverso le diverse fasi (bootstrap, crescita, maturità).

---

## Slashing Progressivo

QoreChain utilizza un modello di **slashing progressivo** che inasprisce le sanzioni per i recidivi, consentendo al contempo ai validatori di recuperare nel tempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametro                                | Valore          |
| ---------------------------------------- | --------------- |
| Sanzione massima per evento              | 33% dello stake |
| Emivita del decadimento                  | 100,000 blocchi |
| Gravità del downtime                     | 1.0             |
| Gravità della doppia firma               | 2.0             |
| Gravità dell'attacco al light client     | 3.0             |

1. **Ogni infrazione incrementa il conteggio effettivo.** Ogni infrazione (downtime, doppia firma, ecc.) aumenta il conteggio effettivo del validatore, che influisce sulle sanzioni future.

2. **La sanzione cresce in modo esponenziale.** La sanzione cresce in base al conteggio effettivo secondo la formula sopra riportata, quindi i recidivi subiscono sanzioni molto più pesanti.

3. **Il conteggio effettivo decade nel tempo.** Il conteggio effettivo decade con un'emivita di 100,000 blocchi (\~7 giorni con blocchi da 6s), consentendo ai validatori di recuperare dopo un periodo di buona condotta.

4. **Eventi singoli vs infrazioni ripetute.** Un singolo evento accidentale di downtime comporta una sanzione lieve, mentre le infrazioni ripetute innescano conseguenze che crescono esponenzialmente.

---

## Registrazione della Chiave PQC

I validatori possono facoltativamente registrare una **chiave pubblica crittografica post-quantistica (PQC)** usando l'algoritmo ML-DSA-87. Questo fornisce una sicurezza resistente ai computer quantistici per l'identità del validatore e può essere usata per la firma ibrida.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametro      | Descrizione                                                  |
| -------------- | ------------------------------------------------------------ |
| `<pubkey-hex>` | Chiave pubblica ML-DSA-87 da 2592 byte in codifica esadecimale |
| `hybrid`       | Modalità di registrazione (hybrid = sia classica che PQC)    |

Verifica la registrazione:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Raccomandazione:** la registrazione della chiave PQC è facoltativa, ma fortemente consigliata per i validatori che operano sulla mainnet. Fornisce una difesa lungimirante contro le minacce del calcolo quantistico.
:::

---

## Monitoraggio

### Metriche Prometheus

QoreChain espone le metriche Prometheus sulla porta **26660**:

```
http://localhost:26660/metrics
```

Metriche chiave da monitorare:

| Metrica                         | Descrizione                                            |
| ------------------------------- | ------------------------------------------------------ |
| `qorechain_missed_blocks_total` | Totale dei blocchi mancati dal tuo validatore          |
| `qorechain_validator_uptime`    | Percentuale di uptime sugli ultimi N blocchi           |
| `qorechain_reputation_score`    | Punteggio di reputazione attuale                       |
| `qorechain_pool_classification` | Assegnazione attuale al pool (0=PoS, 1=DPoS, 2=RPoS)   |
| `qorechain_consecutive_signed`  | Blocchi firmati consecutivi                            |
| `consensus_height`              | Altezza del blocco attuale                             |
| `consensus_rounds`              | Round di consenso per l'altezza attuale                |

### Interrogare il Punteggio di Reputazione

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC:

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

### Controlli di Integrità

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Buone Pratiche Operative

1. **Usa un'architettura a nodi sentry.** Esegui il tuo validatore dietro nodi sentry per proteggerlo dagli attacchi DDoS. Esponi alla rete pubblica solo i nodi sentry.

2. **Configura gli avvisi.** Imposta avvisi per blocchi mancati, uptime basso e riavvii imprevisti. Qualche blocco mancato è normale; mancanze prolungate innescheranno lo slashing.

3. **Mantieni un uptime elevato.** Il sistema di reputazione premia l'uptime costante. Un downtime prolungato degrada il tuo fattore di qualità della reputazione, riducendo le ricompense.

4. **Mantieni il software aggiornato.** Segui le release di QoreChain e applica gli aggiornamenti tempestivamente. Coordinati con la community dei validatori per gli upgrade della chain.

5. **Metti al sicuro le tue chiavi.** Usa un modulo di sicurezza hardware (HSM) o un remote signer per la chiave di consenso del validatore. Non conservare mai le chiavi sulla stessa macchina del nodo.

6. **Registra una chiave PQC.** Rendi il tuo validatore a prova di futuro contro le minacce quantistiche registrando una chiave ML-DSA-87.

7. **Monitora il tuo pool.** Tieni traccia della tua classificazione di pool ogni 1.000 blocchi. Migliorare la tua reputazione può farti passare da PoS a RPoS, aumentando in modo significativo le opportunità di proporre blocchi.

---

## Riferimento dei Comandi per Validatori

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

## Validare le Reti Connesse {#connected-networks}

A partire dalla versione di chain **v3.1.80**, un validatore QoreChain può anche contribuire a validare le reti connesse tramite il [bridge](/architecture/bridge-architecture). Questa funzionalità è **soggetta a licenza e opt-in**:

1. **Possedere la licenza.** Il validatore deve possedere una licenza `validator_<chain>` (o `qcb_bridge`) attiva per la rete di destinazione. L'orchestratore si rifiuta di avviare un client esterno senza di essa (fail-closed).
2. **L'attivazione effettua il provisioning automatico del client.** Quando la licenza viene attivata, QoreChain effettua il provisioning del client della rete corrispondente sul tuo nodo — scaricando il client con versione bloccata, generandone la configurazione ed eseguendolo sotto l'orchestrazione di QoreChain. Nulla viene scaricato prima dell'attivazione.
3. **Fornire le chiavi e lo stake della rete.** Le chiavi di validazione/stake e di firma della rete esterna sono **fornite dall'operatore** per ciascuna rete; QoreChain fornisce il framework dei driver e il gate di licenza applicato, non il tuo stake sulla chain esterna.

Esistono driver per tutte le **37 reti del bridge**, classificate in base a come un validatore può partecipare:

| Classe | Partecipazione | Esempi |
| ------ | -------------- | ------ |
| Validatore permissionless | Fai staking ed esegui il nodo | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Con tetto / elezione / ammissione | Staking, soggetto a un tetto o a un'elezione | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Full-node L2 | Esegui un full node (senza staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Senza staking / trust-list | Osserva / partecipa senza staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
I pin di versione dei client sono best-effort; verifica la release upstream del client per la tua rete di destinazione prima di un'attivazione in produzione.
:::

## Prossimi Passi

* [Compilare dal Sorgente](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* [Sviluppo EVM](/developer-guide/evm-development) — Distribuisci smart contract su QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Account programmabili per le tue operazioni da validatore
