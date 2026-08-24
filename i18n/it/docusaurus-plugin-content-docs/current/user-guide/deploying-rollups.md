---
slug: /user-guide/deploying-rollups
title: Distribuzione dei Rollup
sidebar_label: Distribuzione dei Rollup
sidebar_position: 6
---

# Distribuzione dei Rollup

Questa guida spiega come distribuire rollup specifici per applicazione su QoreChain utilizzando il Rollup Development Kit (RDK). L'RDK fornisce profili preimpostati per i casi d'uso più comuni e una personalizzazione completa per le distribuzioni avanzate.

:::caution
L'RDK e il livello di settlement dei rollup sono una funzionalità in evoluzione attiva. Considera i parametri, i preset e la maturità delle singole funzionalità descritte di seguito come soggetti a modifiche, e convalida le distribuzioni su **`qorechain-diana`** prima di puntare alla mainnet.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connecting to Mainnet** quando distribuisci su mainnet.
:::

---

## Panoramica

L'RDK di QoreChain consente agli sviluppatori di lanciare rollup sovrani che effettuano il settlement su QoreChain. Ogni rollup è un ambiente di esecuzione indipendente con il proprio tempo di blocco, la propria macchina virtuale e il proprio modello di commissioni, pur ereditando le garanzie di sicurezza e disponibilità dei dati di QoreChain.

---

## Profili Preimpostati

L'RDK viene fornito con cinque profili preimpostati, ciascuno ottimizzato per una categoria applicativa comune:

| Profilo        | Settlement (proof)  | Sequencer | DA              | Modello gas    | VM       | Caso d'uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | Applicazioni DeFi/AMM (lending, DEX, derivati) |
| **gaming**     | based               | based     | native          | flat         | custom   | Stato di gioco ad alto throughput ed esperienze in tempo reale |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA pianificato) | standard | CosmWasm | Minting NFT e workload di marketplace |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Distribuzioni permissioned e consortium con commissioni sponsorizzate |
| **custom**     | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | completamente parametrizzato | Imposta tu stesso ogni campo |

:::note
I valori per singolo preset riportati sopra corrispondono ai default del profilo `@qorechain/rdk` distribuito. La configurazione esatta può evolvere man mano che l'RDK matura — interroga i valori autorevoli con `qorechaind query rdk config` (o `RdkClient.params()`), e nota che il settlement `based` è sempre abbinato alla modalità sequencer `based`.
:::

---

## Requisiti

Prima di distribuire un rollup, assicurati di soddisfare i seguenti requisiti:

| Requisito          | Dettagli                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Stake Minimo** | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Burn di Creazione** | l'1% dell'importo in stake viene bruciato permanentemente alla creazione del rollup                       |
| **Account**       | Un account QoreChain finanziato con saldo sufficiente per lo stake più le commissioni di transazione |

---

## Creazione di un Rollup da un Preset

Distribuisci un rollup utilizzando uno dei profili preimpostati:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** Distribuisci un rollup di gaming:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Creazione di un Rollup Personalizzato

Per un controllo completo sui parametri del rollup, usa il profilo `custom` e specifica ogni opzione:

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
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategia di ordinamento delle transazioni      |
| `--da-backend` | `native`, `external`                          | Livello di disponibilità dei dati            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Ambiente di esecuzione              |
| `--block-time` | Intero (millisecondi)                        | Intervallo target di produzione dei blocchi   |

---

## Invio dei Batch

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

## Gestione del Ciclo di Vita del Rollup

Gli operatori dei rollup possono gestire il ciclo di vita delle proprie distribuzioni:

1. **Mettere in Pausa un Rollup** — Interrompe temporaneamente la produzione di blocchi. Lo stato del rollup viene preservato e può essere ripreso.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Riprendere un Rollup** — Riprende la produzione di blocchi su un rollup in pausa:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Arrestare un Rollup (Permanente)** — Arresta permanentemente un rollup. Questa azione è **irreversibile**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
L'arresto di un rollup è permanente. Tutto lo stato associato viene archiviato ma il rollup non può essere riavviato. Il QOR in stake (al netto del burn di creazione) viene restituito all'operatore.
:::

---

## Interrogazione dei Rollup

Ottieni i dettagli di un rollup specifico:

```bash
qorechaind query rdk rollup <rollup_id>
```

Elenca tutti i rollup su QoreChain:

```bash
qorechaind query rdk rollups
```

**Esempio di output:**

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

## Suggerimento del Profilo Assistito da QCAI

Non sei sicuro di quale profilo si adatti al tuo caso d'uso? Usa lo strumento di suggerimento assistito da QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Esempio di output:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Questo comando analizza la tua descrizione e consiglia il profilo preimpostato più adatto insieme a una spiegazione.

---

## Suggerimenti

* Inizia con un profilo preimpostato e personalizza in seguito. I preset sono ottimizzati per i loro casi d'uso target.
* Il burn di creazione dell'1% è un costo una tantum applicato allo stake minimo al momento della distribuzione.
* Usa il settlement `based` se vuoi la configurazione più semplice, con i validatori di QoreChain che gestiscono il sequencing.
* Monitora attentamente gli invii dei batch. Le interruzioni nell'invio dei batch possono attivare avvisi da parte della rete.
* Il comando `suggest-profile` è un utile punto di partenza, ma verifica il suggerimento rispetto ai tuoi requisiti specifici.
