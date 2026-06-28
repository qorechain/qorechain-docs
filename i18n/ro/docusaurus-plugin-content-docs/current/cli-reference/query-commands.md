---
slug: /cli-reference/query-commands
title: Comenzi de interogare
sidebar_label: Comenzi de interogare
sidebar_position: 3
---

# Comenzi de interogare

Toate comenzile de interogare urmează modelul:

```bash
qorechaind query <module> <command> [args] [flags]
```

:::note
Interogările rulează față de orice nod către care indică `--node`. Folosește un endpoint RPC al mainnet-ului **`qorechain-vladi`** (versiunea de lanț **v3.1.80**) pentru date live sau un endpoint al testnet-ului **`qorechain-diana`** pentru testare. Valoarea implicită `tcp://localhost:26657` vizează un nod pe care îl rulezi tu însuți.
:::

Flag-uri comune se aplică fiecărei subcomenzi `query`:

| Flag       | Tip   | Descriere                                     |
| ---------- | ------ | ----------------------------------------------- |
| `--node`   | string | Endpoint RPC (implicit: `tcp://localhost:26657`) |
| `--output` | string | Format de ieșire: `json` sau `text`                 |
| `--height` | int    | Interoghează starea la o anumită înălțime de bloc          |

---

## bank

### balances

Interoghează toate soldurile pentru un cont.

```bash
qorechaind query bank balances <address>
```

### total

Interoghează oferta totală a tuturor tokenurilor.

```bash
qorechaind query bank total
```

---

## staking

### validator

Interoghează un singur validator după adresa de operator.

```bash
qorechaind query staking validator <validator_address>
```

### validators

Listează toți validatorii.

```bash
qorechaind query staking validators
```

### delegation

Interoghează o delegare de la un delegator către un validator.

```bash
qorechaind query staking delegation <delegator_address> <validator_address>
```

### delegations

Interoghează toate delegările pentru un delegator.

```bash
qorechaind query staking delegations <delegator_address>
```

### unbonding-delegation

Interoghează o delegare în curs de unbonding.

```bash
qorechaind query staking unbonding-delegation <delegator_address> <validator_address>
```

---

## distribution

### rewards

Interoghează toate recompensele de delegare pentru un delegator.

```bash
qorechaind query distribution rewards <delegator_address>
```

### commission

Interoghează comisionul unui validator.

```bash
qorechaind query distribution commission <validator_address>
```

---

## gov

### proposal

Interoghează o singură propunere după ID.

```bash
qorechaind query gov proposal <proposal_id>
```

### proposals

Listează toate propunerile, opțional filtrate după stare.

```bash
qorechaind query gov proposals [flags]
```

| Flag       | Tip   | Descriere                                                               |
| ---------- | ------ | ------------------------------------------------------------------------- |
| `--status` | string | Filtrează după stare: `deposit_period`, `voting_period`, `passed`, `rejected` |

### votes

Interoghează voturile pentru o propunere.

```bash
qorechaind query gov votes <proposal_id>
```

---

## pqc

### account

Interoghează starea de înregistrare a cheii PQC pentru un cont.

```bash
qorechaind query pqc account <address>
```

### algorithms

Listează toți algoritmii PQC suportați.

```bash
qorechaind query pqc algorithms
```

### algorithm

Interoghează detaliile pentru un algoritm PQC specific.

```bash
qorechaind query pqc algorithm <algorithm_name>
```

### stats

Interoghează statisticile agregate de înregistrare PQC.

```bash
qorechaind query pqc stats
```

### params

Interoghează parametrii modulului PQC.

```bash
qorechaind query pqc params
```

### migration

Interoghează starea de migrare a cheii PQC pentru un cont.

```bash
qorechaind query pqc migration <address>
```

### hybrid-mode

Interoghează modul curent de impunere a semnăturii hibride.

```bash
qorechaind query pqc hybrid-mode
```

---

## xqore

### position

Interoghează poziția de staking xQORE pentru o adresă.

```bash
qorechaind query xqore position <address>
```

### params

Interoghează parametrii modulului xQORE.

```bash
qorechaind query xqore params
```

---

## burn

### stats

Interoghează statisticile de ardere pe toate canalele.

```bash
qorechaind query burn stats
```

### params

Interoghează parametrii modulului burn.

```bash
qorechaind query burn params
```

---

## inflation

### rate

Interoghează rata de inflație anualizată curentă.

```bash
qorechaind query inflation rate
```

### epoch

Interoghează numărul epocii curente și progresul.

```bash
qorechaind query inflation epoch
```

### params

Interoghează parametrii modulului inflation.

```bash
qorechaind query inflation params
```

---

## ai

### config

Interoghează configurația modulului AI.

```bash
qorechaind query ai config
```

### stats

Interoghează statisticile agregate de procesare AI.

```bash
qorechaind query ai stats
```

### fee-estimate

Obține o estimare a taxei de gas asistată de AI.

```bash
qorechaind query ai fee-estimate [flags]
```

| Flag        | Tip   | Descriere                     |
| ----------- | ------ | ------------------------------- |
| `--tx-type` | string | Tipul de tranzacție pentru estimare |
| `--urgency` | string | `low`, `medium`, `high`         |

### investigations

Listează investigațiile active de fraudă.

```bash
qorechaind query ai investigations
```

### recommendations

Obține recomandări de optimizare a rețelei generate de AI.

```bash
qorechaind query ai recommendations
```

### circuit-breakers

Interoghează stările curente ale întrerupătoarelor de circuit (circuit breaker).

```bash
qorechaind query ai circuit-breakers
```

---

## reputation

### validators

Interoghează scorurile de reputație pentru toți validatorii.

```bash
qorechaind query reputation validators
```

### validator

Interoghează scorul de reputație pentru un validator specific.

```bash
qorechaind query reputation validator <validator_address>
```

---

## bridge

### chains

Listează toate lanțurile de bridge înregistrate.

```bash
qorechaind query bridge chains
```

### chain

Interoghează detaliile pentru un lanț punte specific.

```bash
qorechaind query bridge chain <chain_id>
```

### validators

Listează validatorii de bridge activi.

```bash
qorechaind query bridge validators
```

### operations

Listează operațiunile recente de bridge.

```bash
qorechaind query bridge operations
```

| Flag       | Tip   | Descriere                              |
| ---------- | ------ | ---------------------------------------- |
| `--status` | string | Filtru: `pending`, `completed`, `failed` |
| `--chain`  | string | Filtrează după chain ID                       |

### limits

Interoghează limitele de rată pentru un lanț punte.

```bash
qorechaind query bridge limits <chain_id>
```

### estimate

Estimează taxa de bridge și timpul de transfer.

```bash
qorechaind query bridge estimate <chain_id> <amount> <asset>
```

---

## crossvm

### message

Recuperează un mesaj cross-VM după ID.

```bash
qorechaind query crossvm message <message_id>
```

### pending

Listează mesajele cross-VM în așteptare.

```bash
qorechaind query crossvm pending
```

### params

Interoghează parametrii modulului Cross-VM.

```bash
qorechaind query crossvm params
```

---

## svm

### account

Interoghează informațiile despre un cont SVM.

```bash
qorechaind query svm account <pubkey>
```

### program

Interoghează informațiile despre un program SVM implementat.

```bash
qorechaind query svm program <program_id>
```

### params

Interoghează parametrii modulului SVM.

```bash
qorechaind query svm params
```

### slot

Interoghează numărul slotului SVM curent.

```bash
qorechaind query svm slot
```

---

## multilayer

### layer

Interoghează detaliile pentru un strat specific.

```bash
qorechaind query multilayer layer <layer_id>
```

### layers

Listează toate straturile înregistrate.

```bash
qorechaind query multilayer layers
```

### anchor

Interoghează o înregistrare de ancorare specifică.

```bash
qorechaind query multilayer anchor <anchor_id>
```

### anchors

Listează trimiterile recente de ancorare.

```bash
qorechaind query multilayer anchors [flags]
```

| Flag         | Tip   | Descriere               |
| ------------ | ------ | ------------------------- |
| `--layer-id` | string | Filtrează după ID-ul stratului        |
| `--limit`    | uint   | Numărul maxim de rezultate de returnat |

### routing-stats

Interoghează statisticile de rutare a tranzacțiilor pe straturi.

```bash
qorechaind query multilayer routing-stats
```

### simulate-route

Simulează rutarea unei tranzacții fără execuție.

```bash
qorechaind query multilayer simulate-route <tx_data_hex>
```

### params

Interoghează parametrii modulului Multilayer.

```bash
qorechaind query multilayer params
```

---

## rdk

### rollup

Interoghează detaliile pentru un rollup specific.

```bash
qorechaind query rdk rollup <rollup_id>
```

### rollups

Listează toate rollup-urile înregistrate.

```bash
qorechaind query rdk rollups
```

| Flag       | Tip   | Descriere                           |
| ---------- | ------ | ------------------------------------- |
| `--status` | string | Filtru: `active`, `paused`, `stopped` |

### batch

Interoghează un lot de decontare specific.

```bash
qorechaind query rdk batch <rollup_id> <batch_index>
```

### latest-batch

Interoghează ultimul lot pentru un rollup.

```bash
qorechaind query rdk latest-batch <rollup_id>
```

### suggest-profile

Obține o recomandare de profil de rollup asistată de AI.

```bash
qorechaind query rdk suggest-profile <use_case>
```

### blob

Interoghează un blob DA specific.

```bash
qorechaind query rdk blob <rollup_id> <blob_index>
```

### params

Interoghează parametrii modulului RDK.

```bash
qorechaind query rdk params
```

:::note
Demonstrațiile de retragere a rollup-ului și starea de decontare pot fi, de asemenea, interogate în cadrul grupului `rdk`. Subcomenzile și argumentele exacte de interogare depind de tipul de decontare al rollup-ului tău; vezi documentația **Rollup Development Kit** pentru suprafața oficială de interogare a retragerii/decontării.
:::

---

## rlconsensus

PRISM este stratul de învățare prin întărire care ajustează parametrii de consens. Numele modulului CLI `rlconsensus` și subcomenzile sale sunt păstrate verbatim.

### agent-status

Interoghează starea și modul curent al agentului PRISM.

```bash
qorechaind query rlconsensus agent-status
```

### observation

Interoghează cel mai recent vector de observație PRISM.

```bash
qorechaind query rlconsensus observation
```

### reward

Interoghează metricile cumulative de recompensă PRISM.

```bash
qorechaind query rlconsensus reward
```

### params

Interoghează parametrii modulului PRISM Consensus.

```bash
qorechaind query rlconsensus params
```

### policy

Interoghează configurația activă a politicii PRISM.

```bash
qorechaind query rlconsensus policy
```

---

## babylon

### staking

Interoghează poziția de staking BTC pentru o adresă.

```bash
qorechaind query babylon staking <address>
```

### checkpoint

Interoghează datele punctului de control (checkpoint) BTC pentru o epocă dată.

```bash
qorechaind query babylon checkpoint <epoch>
```

### params

Interoghează parametrii modulului Babylon.

```bash
qorechaind query babylon params
```

---

## abstractaccount

### account

Interoghează detaliile unui cont abstract.

```bash
qorechaind query abstractaccount account <address>
```

### params

Interoghează parametrii modulului Abstract Account.

```bash
qorechaind query abstractaccount params
```

---

## gasabstraction

### accepted-tokens

Listează tokenurile acceptate pentru plata gasului.

```bash
qorechaind query gasabstraction accepted-tokens
```

### params

Interoghează parametrii modulului Gas Abstraction.

```bash
qorechaind query gasabstraction params
```

---

## fairblock

### config

Interoghează configurația de criptare FairBlock.

```bash
qorechaind query fairblock config
```

### params

Interoghează parametrii modulului FairBlock.

```bash
qorechaind query fairblock params
```
