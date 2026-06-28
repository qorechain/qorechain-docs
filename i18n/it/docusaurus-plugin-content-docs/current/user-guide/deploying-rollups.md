---
slug: /user-guide/deploying-rollups
title: Deploy dei rollup
sidebar_label: Deploy dei rollup
sidebar_position: 6
---

# Deploy dei rollup

Questa guida illustra come effettuare il deploy di rollup specifici per applicazione su QoreChain utilizzando il Rollup Development Kit (RDK). L'RDK fornisce profili preimpostati per casi d'uso comuni e una personalizzazione completa per deploy avanzati.

:::caution
L'RDK e il livello di settlement dei rollup sono una capacità in continua evoluzione. Considera i parametri, i preset e la maturità delle singole funzionalità riportate di seguito come soggetti a modifiche, e convalida i deploy su **`qorechain-diana`** prima di puntare alla mainnet.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.80** — sostituisci il chain ID e gli endpoint della mainnet dalla pagina **Connessione alla Mainnet** quando effettui il deploy sulla mainnet.
:::

---

## Panoramica

L'RDK di QoreChain consente agli sviluppatori di lanciare rollup sovrani che effettuano il settlement su QoreChain. Ogni rollup è un ambiente di esecuzione indipendente con il proprio block time, macchina virtuale e modello di commissioni, pur ereditando le garanzie di sicurezza e disponibilità dei dati di QoreChain.

---

## Profili preimpostati

L'RDK include cinque profili preimpostati, ciascuno ottimizzato per una categoria comune di applicazione:

| Profilo        | Settlement (proof)  | Sequencer | DA              | Modello di gas | VM       | Caso d'uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | Applicazioni DeFi/AMM (lending, DEX, derivati) |
| **gaming**     | based               | based     | native          | flat         | custom   | Stato di gioco ad alto throughput ed esperienze in tempo reale |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA pianificato) | standard | CosmWasm | Carichi di lavoro di minting e marketplace NFT |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Deploy permissioned e di consorzio con commissioni sponsorizzate |
| **custom**     | fully parameterized | fully parameterized | fully parameterized | fully parameterized | fully parameterized | Imposta tu stesso ogni campo |

:::note
I valori per ciascun preset riportati sopra corrispondono ai default dei profili `@qorechain/rdk` distribuiti. La configurazione esatta può evolvere man mano che l'RDK matura — interroga i valori autorevoli con `qorechaind query rdk config` (o `RdkClient.params()`), e tieni presente che il settlement `based` si abbina sempre alla modalità sequencer `based`.
:::

---

## Requisiti

Prima di effettuare il deploy di un rollup, assicurati di soddisfare i seguenti requisiti:

| Requisito         | Dettagli                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Stake minimo**  | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Burn di creazione** | L'1% dell'importo in stake viene bruciato in modo permanente alla creazione del rollup |
| **Account**       | Un account QoreChain finanziato con saldo sufficiente per lo stake più le commissioni di transazione |

---

## Creazione di un rollup da un preset

Effettua il deploy di un rollup utilizzando uno dei profili preimpostati:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** Effettua il deploy di un rollup di gaming:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Creazione di un rollup personalizzato

Per il controllo completo sui parametri del rollup, usa il profilo `custom` e specifica ogni opzione:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Parametri personalizzati:**

| Parametro      | Opzioni                                       | Descrizione                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Come vengono verificate le transizioni di stato |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategia di ordinamento delle transazioni |
| `--da-backend` | `native`, `external`                          | Livello di disponibilità dei dati  |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Ambiente di esecuzione             |
| `--block-time` | Intero (millisecondi)                         | Intervallo target di produzione dei blocchi |

---

## Invio di batch

Gli operatori dei rollup inviano batch di transazioni a QoreChain per il settlement:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Gestione del ciclo di vita del rollup

Gli operatori dei rollup possono gestire il ciclo di vita dei loro deploy:

1. **Mettere in pausa un rollup** — Interrompe temporaneamente la produzione dei blocchi. Lo stato del rollup viene preservato e può essere ripreso.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Riprendere un rollup** — Riprende la produzione dei blocchi su un rollup in pausa:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Arrestare un rollup (permanente)** — Arresta in modo permanente un rollup. Questa azione è **irreversibile**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
L'arresto di un rollup è permanente. Tutto lo stato associato viene archiviato ma il rollup non può essere riavviato. Lo stake in QOR (al netto del burn di creazione) viene restituito all'operatore.
:::

---

## Interrogazione dei rollup

Ottieni i dettagli su uno specifico rollup:

```bash
qorechaind query rdk rollup <rollup_id>
```

Elenca tutti i rollup su QoreChain:

```bash
qorechaind query rdk rollups
```

**Output di esempio:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## Suggerimento di profilo assistito da QCAI

Non sei sicuro di quale profilo si adatti al tuo caso d'uso? Usa lo strumento di suggerimento assistito da QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Output di esempio:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Questo comando analizza la tua descrizione e raccomanda il profilo preimpostato più adatto insieme a una spiegazione.

---

## Suggerimenti

* Inizia con un profilo preimpostato e personalizza in seguito. I preset sono ottimizzati per i loro casi d'uso di riferimento.
* Il burn di creazione dell'1% è un costo una tantum applicato allo stake minimo al momento del deploy.
* Usa il settlement `based` se desideri la configurazione più semplice con i validatori QoreChain che gestiscono il sequencing.
* Monitora attentamente gli invii dei batch. Le interruzioni nell'invio dei batch possono attivare avvisi dalla rete.
* Il comando `suggest-profile` è un utile punto di partenza, ma valuta la raccomandazione rispetto ai tuoi requisiti specifici.
