---
slug: /user-guide/governance
title: Governance
sidebar_label: Governance
sidebar_position: 3
---

# Governance

Questa guida illustra come funziona la governance on-chain su QoreChain: come vengono conteggiati i voti, come presentare proposte e come votare.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la release **v3.2.3** fino all'altezza 3.742.566 e la **v3.2.4** da quel blocco; la testnet esegue la **v3.2.4** dal 19 ottobre 2026 — sostituisci il chain ID e gli endpoint della mainnet dalla pagina **Connessione alla Mainnet** quando partecipi alla governance sulla mainnet.
:::

:::caution Firma con `tx pqc cosign`
Mainnet e testnet richiedono una firma post-quantistica ibrida su ogni transazione della corsia Cosmos, quindi i comandi di questa pagina non vengono trasmessi così come sono scritti. Aggiungi `--generate-only > tx.json` a un comando, poi esegui `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vedi [Firma ibrida](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Potere di voto {#voting-power}

Le proposte vengono conteggiate sullo **stake bonded**: ogni QOR che hai delegato a un validatore bonded conta come un'unità di potere di voto, senza alcun moltiplicatore. Se non voti di persona, la tua delega segue il voto del tuo validatore; esprimere il tuo voto sostituisce quello per il tuo stake. Una proposta viene approvata quando valgono tutte le seguenti condizioni:

| Regola    | Valore attuale | Significato                                                                   |
| --------- | -------------- | ----------------------------------------------------------------------------- |
| Quorum    | 33.4%          | Quota dello stake bonded che deve votare                                      |
| Soglia    | 50%            | Quota di "yes" tra i voti non di astensione necessaria per l'approvazione     |
| Veto      | 33.4%          | Se "no with veto" raggiunge questa quota, la proposta viene respinta e il suo deposito viene bruciato |

Questi valori sono stati letti dalla mainnet il 20 ottobre 2026 (e sono gli stessi sulla testnet); confermali con `qorechaind query gov params`, perché la governance può modificarli.

:::note QDRW è progettato ma non è attivo
Il design di QoreChain include una formula di potere di voto **Quadratic Delegation-Reputation Weighted (QDRW)**, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, che attenuerebbe gli stake di grandi dimensioni e peserebbe la reputazione. È implementata nel modulo `x/qca` ma è **disattivata** su entrambe le reti (`qdrw_enabled` è `false` in `qorechaind query qca config`) e non fa parte del conteggio di governance, quindi oggi non influisce su nessun voto. Anche xQORE non è attivo (vedi [Staking di xQORE](/user-guide/xqore-staking)).
:::

---

## Presentazione di una proposta

Qualsiasi detentore di QOR può presentare una proposta di governance. È richiesto un deposito minimo affinché la proposta entri nel periodo di voto.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**File di proposta di esempio** (`proposal.json`). Una proposta è un elenco di messaggi che il modulo di governance esegue se viene approvata, più un titolo, un riepilogo e un deposito. Questa porta il numero massimo di validatori da 100 a 150; `authority` è l'account del modulo di governance (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` sostituisce l'intero insieme di parametri, quindi copia i valori attuali da `qorechaind query staking params` e modifica solo il campo che intendi cambiare. Una proposta di solo testo (di segnalazione) usa `"messages": []`. `qorechaind tx gov draft-proposal` genera uno scheletro.

---

## Voto sulle proposte

Una volta che una proposta entra nel periodo di voto, qualsiasi staker può esprimere un voto:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
  --gas 400000 --fees 40000uqor
```

---

## Tipi di proposta

Una proposta contiene zero o più messaggi che vengono eseguiti se viene approvata. Casi comuni:

| Tipo                 | Descrizione                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | Una proposta di segnalazione senza messaggi e senza esecuzione automatica on-chain. Usata per verificare il sentiment della community. |
| **Parameter change** | Un messaggio `MsgUpdateParams` di un modulo, inviato dall'account del modulo di governance. Sostituisce l'intero insieme di parametri di quel modulo. |
| **Software upgrade** | Un messaggio `MsgSoftwareUpgrade` che pianifica un upgrade coordinato della chain a una specifica altezza di blocco. |
| **Community spend**  | Un messaggio `MsgCommunityPoolSpend` che invia fondi dal community pool a un indirizzo destinatario. |
| **Expedited**        | Imposta `"expedited": true` per un periodo di voto più breve, con un deposito e una soglia di approvazione più alti (vedi sotto). |

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

| Parametro            | Descrizione                                                      | Valore attuale (20 ott 2026) |
| -------------------- | ---------------------------------------------------------------- | ---------------------------- |
| `min_deposit`        | Deposito minimo richiesto affinché una proposta entri in votazione | 10 QOR (`10000000uqor`)      |
| `max_deposit_period` | Finestra temporale per raggiungere il deposito minimo           | 2 giorni                     |
| `voting_period`      | Durata del periodo di voto una volta che una proposta è attiva  | 2 giorni                     |
| `quorum`             | Partecipazione minima richiesta per un voto valido              | 0.334                        |
| `threshold`          | Percentuale minima di "yes" per l'approvazione (escluse le astensioni) | 0.5                   |
| `veto_threshold`     | Percentuale minima di "no with veto" per respingere e bruciare il deposito | 0.334             |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Periodo di voto, soglia di approvazione e deposito per le proposte expedited | 1 giorno / 0.667 / 50 QOR |

---

## La governance sulla mainnet finora {#mainnet-history}

La governance della mainnet è stata usata per modifiche ai parametri, decisioni sui circuit breaker, upgrade coordinati e, da ottobre 2026, per rilasciare importi che la chain aveva registrato all'upgrade v3.2.0. Le proposte da 7 a 11 sono state approvate sulla mainnet a ottobre 2026, mentre le proposte 12 (un ulteriore rilascio) e 13 (l'upgrade v3.2.4 all'altezza 3.742.566) erano nei rispettivi periodi di votazione al momento della stesura; l'elenco e gli esiti sono in [Cronologia delle Versioni](/appendix/version-history#governance-timeline), e ogni proposta può essere letta in tempo reale a `GET /cosmos/gov/v1/proposals`.

---

:::tip

* Vota prima della fine del periodo di voto; il tuo voto viene conteggiato solo se viene espresso mentre la proposta è nel periodo di voto.
* Usa `no_with_veto` con attenzione. Se la soglia di veto viene raggiunta, il deposito della proposta viene bruciato.
* Le proposte che non raggiungono il deposito minimo entro il periodo di deposito vengono rimosse automaticamente.

:::
