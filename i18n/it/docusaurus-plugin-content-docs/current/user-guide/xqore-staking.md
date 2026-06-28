---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Questa guida illustra il meccanismo di staking per la governance xQORE, che consente ai detentori di QOR di bloccare i propri token per ottenere un potere di governance potenziato, con un modello di rebase PvP che premia i partecipanti a lungo termine.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione di chain **v3.1.80** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** quando fai staking sulla mainnet.
:::

---

## Panoramica

xQORE è il token di staking per la governance di QoreChain. Quando blocchi QOR, ricevi xQORE con un **rapporto 1:1**. Detenere xQORE offre un vantaggio significativo nella governance: i token xQORE contano con **peso doppio** nella formula del potere di voto QDRW (vedi [Governance](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Ciò significa che bloccare QOR in xQORE raddoppia di fatto il suo impatto sulla governance rispetto al solo staking ordinario.

---

## Bloccare QOR per xQORE

Blocca i token QOR per coniare xQORE con un rapporto 1:1:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** Blocca 1.000 QOR:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Dopo questa transazione, il tuo account deterrà 1.000.000.000 uxqore (1.000 xQORE).

---

## Sbloccare xQORE

Brucia xQORE per riottenere QOR. Può applicarsi una **penale di uscita** a seconda di quanto a lungo i token sono stati bloccati:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** Sblocca 500 xQORE:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Piano delle Penali di Uscita

Il ritiro anticipato da xQORE comporta una penale. Più a lungo mantieni la posizione, più bassa è la penale:

| Durata del Lock      | Penale di Uscita |
| ------------------ | ------------ |
| Meno di 30 giorni  | **50%**      |
| Da 30 a 90 giorni      | **35%**      |
| Da 90 a 180 giorni     | **15%**      |
| Più di 180 giorni | **0%**       |

**Esempio:** Se hai bloccato 1.000 QOR e sblocchi dopo 45 giorni, ricevi 650 QOR (penale del 35% applicata). I restanti 350 QOR vengono ridistribuiti agli altri detentori di xQORE attraverso il meccanismo di rebase PvP.

---

## Meccanismo di Rebase PvP

Le penali raccolte dalle uscite anticipate **non vengono bruciate**. Vengono invece ridistribuite proporzionalmente a tutti i detentori di xQORE rimanenti. Questo crea una dinamica "Player vs Player" in cui i detentori pazienti traggono vantaggio dall'impazienza degli altri.

Come funziona:

1. Un utente sblocca xQORE prima della soglia di penale zero a 180 giorni.
2. La penale di uscita viene detratta dai QOR restituiti.
3. L'importo della penale viene distribuito proporzionalmente su tutte le posizioni xQORE rimanenti.
4. I QOR riscuotibili per ogni xQORE di ciascun detentore rimanente aumentano.

Questo meccanismo incentiva l'impegno a lungo termine nella governance e premia i detentori che mantengono le proprie posizioni.

---

## Interrogare la Tua Posizione

Verifica la tua posizione xQORE corrente, la durata del lock e la penale di uscita applicabile:

```bash
qorechaind query xqore position <address>
```

**Esempio:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Output di esempio:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## Accesso JSON-RPC

Per le applicazioni che si integrano con QoreChain tramite JSON-RPC, la posizione xQORE può essere interrogata utilizzando:

```
qor_getXQOREPosition
```

**Richiesta:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Risposta:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## Suggerimenti

* Blocca QOR in xQORE con largo anticipo rispetto a votazioni di governance importanti per massimizzare il tuo potere di voto.
* La soglia di 180 giorni per uscite senza penale premia i partecipanti pazienti alla governance.
* Monitora gli accrediti del rebase PvP. Man mano che altri escono anticipatamente, la tua posizione cresce di valore.
* xQORE non è trasferibile. Può essere coniato solo bloccando QOR e bruciato solo sbloccandolo.
* Considera attentamente la penale di uscita prima di bloccare. I lock a breve termine comportano penali significative.
