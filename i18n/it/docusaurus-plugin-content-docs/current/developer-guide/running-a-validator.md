---
slug: /developer-guide/running-a-validator
title: Gestire un Validatore
sidebar_label: Gestire un Validatore
sidebar_position: 9
---

# Gestire un Validatore

Questa guida illustra come creare un validatore sulla rete QoreChain, comprendere il sistema di classificazione dei pool, registrare una chiave PQC per la sicurezza resistente ai computer quantistici e monitorare il proprio nodo.

:::note
Questa guida è rivolta alla mainnet **`qorechain-vladi`** (EVM chain ID **9801**), attiva dal 7 giugno 2026 ed eseguita con la versione di catena **v3.1.80**. La testnet **`qorechain-diana`** (EVM chain ID **9800**) è consigliata per provare la configurazione prima del passaggio in produzione. Sostituisci il valore `--chain-id` appropriato per la tua rete di destinazione.
:::

---

## Prerequisiti

* Un nodo `qorechaind` completamente sincronizzato (vedi [Connessione alla Testnet](/getting-started/connecting-to-testnet))
* Un account con fondi e almeno **1.000 QOR** (1.000.000.000 uqor) per l'auto-delega iniziale
* Familiarità con il modello di [Staking e Delega](/user-guide/staking-and-delegation)

---

## Creazione di un Validatore

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
| `--commission-max-rate`        | Tasso massimo di commissione (immutabile dopo la creazione) |
| `--commission-max-change-rate` | Tasso massimo di variazione giornaliera della commissione |
| `--min-self-delegation`        | Token minimi che l'operatore deve auto-delegare    |

Dopo la conferma della transazione, verifica il tuo validatore:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classificazione dei Pool

QoreChain utilizza un **sistema di classificazione a tre pool** gestito dal modulo `x/qca` (Quantum Consensus Allocation). Ogni **1.000 blocchi**, i validatori vengono riclassificati in uno dei tre pool in base alla loro reputazione e al loro stake:

| Pool                                 | Criteri                                           | Allocazione Blocchi |
| ------------------------------------ | ------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputazione >= 70° percentile E stake >= mediana  | 40% dei blocchi     |
| **DPoS** (Delegated Proof-of-Stake)  | Delega totale >= 10.000 QOR                        | 35% dei blocchi     |
| **PoS** (Proof-of-Stake)             | Tutti i restanti validatori attivi                | 25% dei blocchi     |

All'interno di ciascun pool, i proponenti dei blocchi vengono selezionati tramite **selezione casuale ponderata** proporzionale al loro stake effettivo. La classificazione garantisce che sia i validatori ad alta reputazione sia quelli ad alta delega ricevano una rappresentanza equa, consentendo comunque ai validatori più piccoli di partecipare.

### Interrogare la Tua Classificazione di Pool

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

## Curva di Bonding

La ricompensa di staking per un validatore è determinata da una curva di bonding che incorpora molteplici fattori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                |
| --------- | ---------------------------------------------------------- |
| `R`       | Importo della ricompensa                                   |
| `beta`    | Tasso di ricompensa base                                   |
| `S`       | Stake effettivo                                            |
| `alpha`   | Costante di scala della fedeltà                            |
| `L`       | Durata della fedeltà (tempo di staking continuo)           |
| `Q(r)`    | Fattore di qualità della reputazione, intervallo \[0.75 - 1.25] |
| `P(t)`    | Moltiplicatore di fase del protocollo (si adatta nel ciclo di vita della rete) |

**Punti chiave:**

* **Bonus per durata della fedeltà:** I validatori che effettuano staking in modo continuo ricevono ricompense crescenti tramite il termine logaritmico di fedeltà. Questo incentiva l'impegno a lungo termine.
* **Fattore di qualità della reputazione:** Varia da 0.75 (reputazione scarsa) a 1.25 (reputazione eccellente). La reputazione è calcolata in base a uptime, proposte riuscite, partecipazione alla community e qualità della validazione delle transazioni.
* **Moltiplicatore di fase del protocollo:** Si adatta man mano che la rete matura attraverso le diverse fasi (bootstrap, crescita, maturità).

---

## Slashing Progressivo

QoreChain utilizza un modello di **slashing progressivo** che aumenta le penalità per i recidivi, consentendo al contempo ai validatori di recuperare nel tempo:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametro                          | Valore         |
| ---------------------------------- | -------------- |
| Penalità massima per evento        | 33% dello stake |
| Emivita di decadimento             | 100.000 blocchi |
| Gravità del downtime               | 1.0            |
| Gravità della doppia firma         | 2.0            |
| Gravità dell'attacco al light client | 3.0          |

1. **Ogni infrazione incrementa l'effective count.** Ogni infrazione (downtime, doppia firma, ecc.) aumenta l'effective count del validatore, che influisce sulle penalità future.

2. **La penalità aumenta esponenzialmente.** La penalità aumenta in base all'effective count utilizzando la formula sopra, quindi i recidivi affrontano penalità molto più elevate.

3. **L'effective count decade nel tempo.** L'effective count decade con un'emivita di 100.000 blocchi (\~7 giorni con blocchi da 6s), permettendo ai validatori di recuperare dopo un periodo di buon comportamento.

4. **Eventi singoli vs infrazioni ripetute.** Un singolo evento accidentale di downtime comporta una penalità minore, mentre infrazioni ripetute innescano conseguenze che crescono esponenzialmente.

---

## Registrazione della Chiave PQC

I validatori possono opzionalmente registrare una **chiave pubblica crittografica post-quantistica (PQC)** utilizzando l'algoritmo ML-DSA-87. Questo fornisce una sicurezza resistente ai computer quantistici per l'identità del validatore e può essere utilizzato per la firma ibrida.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametro      | Descrizione                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | Chiave pubblica ML-DSA-87 da 2592 byte in codifica hex |
| `hybrid`       | Modalità di registrazione (hybrid = sia classica + PQC) |

Verifica la registrazione:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Raccomandazione:** La registrazione della chiave PQC è opzionale ma fortemente consigliata per i validatori operanti sulla mainnet. Fornisce una difesa lungimirante contro le minacce del calcolo quantistico.
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
| `qorechain_missed_blocks_total` | Totale dei blocchi persi dal tuo validatore     |
| `qorechain_validator_uptime`    | Percentuale di uptime negli ultimi N blocchi    |
| `qorechain_reputation_score`    | Punteggio di reputazione attuale                |
| `qorechain_pool_classification` | Assegnazione di pool attuale (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Blocchi firmati consecutivamente                |
| `consensus_height`              | Altezza del blocco attuale                      |
| `consensus_rounds`              | Round di consenso per l'altezza attuale         |

### Interrogare il Punteggio di Reputazione

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

## Migliori Pratiche Operative

1. **Usa un'architettura sentry node.** Esegui il tuo validatore dietro nodi sentry per proteggerlo dagli attacchi DDoS. Esponi alla rete pubblica solo i nodi sentry.

2. **Configura gli avvisi.** Configura avvisi per blocchi persi, uptime basso e riavvii imprevisti. Alcuni blocchi persi sono normali; perdite prolungate innescheranno lo slashing.

3. **Mantieni un uptime elevato.** Il sistema di reputazione premia un uptime costante. Un downtime prolungato degrada il tuo fattore di qualità della reputazione, riducendo le ricompense.

4. **Mantieni il software aggiornato.** Tieni traccia delle release di QoreChain e applica gli aggiornamenti tempestivamente. Coordinati con la community dei validatori per gli upgrade della catena.

5. **Proteggi le tue chiavi.** Usa un modulo di sicurezza hardware (HSM) o un firmatario remoto per la chiave di consenso del validatore. Non memorizzare mai le chiavi sulla stessa macchina del nodo.

6. **Registra una chiave PQC.** Rendi il tuo validatore a prova di futuro contro le minacce quantistiche registrando una chiave ML-DSA-87.

7. **Monitora il tuo pool.** Tieni traccia della tua classificazione di pool ogni 1.000 blocchi. Migliorare la tua reputazione può spostarti da PoS a RPoS, aumentando significativamente le opportunità di proposta dei blocchi.

---

## Riferimento dei Comandi del Validatore

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

## Validazione delle Reti Connesse {#connected-networks}

A partire dalla versione di catena **v3.1.80**, un validatore QoreChain può anche contribuire a validare le reti connesse tramite il [bridge](/architecture/bridge-architecture). Questa funzionalità è **vincolata a licenza e opt-in**:

1. **Possedere la licenza.** Il validatore deve possedere una licenza `validator_<chain>` (o `qcb_bridge`) attiva per la rete di destinazione. L'orchestratore rifiuta di avviare un client esterno senza di essa (fail-closed).
2. **L'attivazione effettua l'auto-provisioning del client.** Quando la licenza viene attivata, QoreChain effettua il provisioning del client della rete corrispondente sul tuo nodo — scaricando il client bloccato, generando la sua configurazione ed eseguendolo sotto l'orchestrazione di QoreChain. Nulla viene scaricato prima dell'attivazione.
3. **Fornire le chiavi e lo stake della rete.** Il validatore/stake e le chiavi di firma della rete esterna sono **forniti dall'operatore** per ciascuna rete; QoreChain fornisce il framework dei driver e il gate di licenza applicato, non il tuo stake sulla catena esterna.

Esistono driver per tutte le **37 reti bridge**, classificate in base a come un validatore può partecipare:

| Classe | Partecipazione | Esempi |
| ------ | -------------- | ------ |
| Validatore permissionless | Effettua staking ed esegui | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Limitato / eletto / ammissione | Effettua staking, soggetto a un limite o a un'elezione | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Full-node L2 | Esegui un full node (senza staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Non-staking / trust-list | Osserva / partecipa senza staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
I version pin dei client sono best-effort; verifica la release upstream del client per la tua rete di destinazione prima di un'attivazione in produzione.
:::

## Prossimi Passi

* [Compilazione dal Sorgente](/developer-guide/building-from-source) — Compila il binario `qorechaind`
* [Sviluppo EVM](/developer-guide/evm-development) — Distribuisci smart contract su QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Account programmabili per le operazioni del tuo validatore
