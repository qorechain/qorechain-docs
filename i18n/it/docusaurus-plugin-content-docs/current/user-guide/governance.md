---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

Questa guida illustra come funziona la governance on-chain su QoreChain, incluso il sistema di voto Quadratic Delegation-Reputation Weighted (QDRW), come presentare proposte e come votare.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.77** — sostituisci il chain ID e gli endpoint della mainnet dalla pagina **Connessione alla Mainnet** quando partecipi alla governance sulla mainnet.
:::

---

## Potere di voto: formula QDRW

QoreChain utilizza la formula **Quadratic Delegation-Reputation Weighted (QDRW)** per calcolare il potere di voto. Questo sistema previene il dominio delle whale premiando al contempo i partecipanti che hanno guadagnato punteggi di reputazione elevati e si sono impegnati nella governance tramite lo staking di xQORE.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variabile                 | Descrizione                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Potere di voto effettivo                                                                                                        |
| `staked`                  | Totale dei token QOR messi in stake dal votante                                                                                 |
| `xQORE`                   | Quantità di token di governance xQORE detenuti (vedi [Staking di xQORE](/user-guide/xqore-staking))                             |
| `r`                       | Punteggio di reputazione del votante, normalizzato a \[0, 1]                                                                    |
| `ReputationMultiplier(r)` | Funzione sigmoidea che mappa la reputazione a un moltiplicatore nell'intervallo \[0.5, 2.0]                                     |

### Proprietà principali

* **Smorzamento quadratico:** Un detentore con 100 volte lo stake di un altro votante ottiene solo \~10 volte il potere di voto, non 100 volte. Questo garantisce che l'influenza sulla governance cresca in modo sub-lineare con la ricchezza.
* **Bonus xQORE:** I token xQORE contano con **peso 2x** all'interno della radice quadrata, conferendo un vantaggio significativo ai partecipanti impegnati nella governance.
* **Moltiplicatore di reputazione:** Mappa il punteggio di reputazione del votante da \[0, 1] a un moltiplicatore in \[0.5, 2.0] utilizzando una curva sigmoidea. I partecipanti con reputazione elevata possono raddoppiare il proprio potere di voto effettivo, mentre i partecipanti con bassa reputazione vedono la propria influenza dimezzata.

---

## Presentazione di una proposta

Qualsiasi detentore di QOR può presentare una proposta di governance. È richiesto un deposito minimo affinché la proposta entri nel periodo di voto.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**File di proposta di esempio** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Voto sulle proposte

Una volta che una proposta entra nel periodo di voto, qualsiasi staker può esprimere un voto:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Opzioni di voto:**

| Opzione        | Descrizione                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Sostieni la proposta                                                                                     |
| `no`           | Ti opponi alla proposta                                                                                  |
| `abstain`      | Prendi atto della proposta senza assumere una posizione                                                  |
| `no_with_veto` | Ti opponi alla proposta e segnali che non avrebbe dovuto essere presentata (brucia il deposito se la soglia viene raggiunta) |

**Esempio:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Tipi di proposta

QoreChain supporta i seguenti tipi di proposta di governance:

| Tipo                 | Descrizione                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | Una proposta di segnalazione senza esecuzione automatica on-chain. Usata per verificare il sentiment della community. |
| **Parameter Change** | Modifica uno o più parametri di protocollo on-chain (es. numero massimo di validatori, tasso di emissione). |
| **Software Upgrade** | Pianifica un upgrade coordinato della chain a una specifica altezza di blocco.                  |
| **Community Spend**  | Richiede fondi dalla tesoreria della community per un indirizzo destinatario specificato.       |

---

## Interrogazione delle proposte

Elenca tutte le proposte:

```bash
qorechaind query gov proposals
```

Interroga una proposta specifica tramite ID:

```bash
qorechaind query gov proposal <proposal_id>
```

Verifica il conteggio attuale dei voti su una proposta:

```bash
qorechaind query gov tally <proposal_id>
```

Visualizza il tuo voto su una proposta:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Parametri di governance

Interroga i parametri di governance attuali:

```bash
qorechaind query gov params
```

I parametri principali includono:

| Parametro            | Descrizione                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Deposito minimo richiesto affinché una proposta entri in votazione |
| `max_deposit_period` | Finestra temporale per raggiungere il deposito minimo           |
| `voting_period`      | Durata del periodo di voto una volta che una proposta è attiva  |
| `quorum`             | Partecipazione minima richiesta per un voto valido              |
| `threshold`          | Percentuale minima di "yes" per l'approvazione (escluse le astensioni) |
| `veto_threshold`     | Percentuale minima di "no with veto" per respingere e bruciare il deposito |

---

:::tip

* Costruisci la tua reputazione prima dei voti di governance importanti per massimizzare il moltiplicatore del potere di voto.
* Blocca QOR in xQORE per un bonus di peso 2x nella governance all'interno della formula QDRW.
* Usa `no_with_veto` con attenzione. Se la soglia di veto viene raggiunta, il deposito della proposta viene bruciato.
* Le proposte che non raggiungono il deposito minimo entro il periodo di deposito vengono rimosse automaticamente.

:::
