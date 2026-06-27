---
slug: /user-guide/staking-and-delegation
title: Staking e Delega
sidebar_label: Staking e Delega
sidebar_position: 2
---

# Staking e Delega

Questa guida illustra come delegare token QOR ai validatori, ridelegare tra validatori, svincolare il proprio stake, riscuotere le ricompense e comprendere l'architettura di staking Triple-Pool di QoreChain.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione di chain **v3.1.77** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** quando fai staking sulla mainnet.
:::

---

## Delegare i Token

Delega QOR a un validatore per guadagnare ricompense di staking e partecipare alla sicurezza della rete:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:** Delega 100 QOR a un validatore:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Ridelegare

Sposta la tua delega da un validatore a un altro senza attendere il periodo di svincolo:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
Non puoi ridelegare token che sono già in transito di ridelega. Attendi il completamento della ridelega corrente prima di avviarne un'altra.
:::

---

## Svincolo (Unbonding)

Ritira i tuoi token delegati da un validatore. Lo svincolo richiede **21 giorni** per essere completato, periodo durante il quale i token non generano ricompense e non possono essere trasferiti.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Esempio:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Trascorso il periodo di svincolo di 21 giorni, i token vengono restituiti automaticamente al tuo account.

---

## Riscuotere le Ricompense

Ritira tutte le ricompense di staking accumulate da ogni validatore a cui hai delegato:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Per ritirare le ricompense solo da uno specifico validatore:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Le ricompense di staking sono finanziate dal pool di staking di 590M QOR del protocollo secondo il piano Tokenomics v2.1, insieme alla quota degli staker (10%) di ogni commissione di transazione.

---

## Classificazione Triple-Pool

QoreChain utilizza un modello di staking **Triple-Pool** che classifica i validatori in tre pool in base alla loro reputazione e ai livelli di delega. Ogni pool riceve una quota ponderata delle ricompense di blocco.

| Pool                                 | Criteri di Ingresso                                          | Peso Ricompensa |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Punteggio di reputazione >= 70° percentile **E** stake >= mediana | 40%           |
| **DPoS** (Delegated Proof of Stake)  | Delega totale >= 10.000 QOR                              | 35%           |
| **PoS** (Proof of Stake)             | Tutti i restanti validatori                                    | 25%           |

I validatori vengono riclassificati a ogni confine di epoca. Un validatore che costruisce una solida reputazione e accumula uno stake sufficiente viene promosso al pool RPoS, guadagnando la quota di ricompensa più alta.

---

## Ricompense con Curva di Bonding

Le ricompense individuali di staking sono calcolate utilizzando la formula della curva di bonding di QoreChain:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Importo della ricompensa per il periodo                                         |
| `beta`   | Tasso di ricompensa di base (parametro del protocollo)                                |
| `S`      | Importo in stake                                                        |
| `alpha`  | Coefficiente di fedeltà (parametro del protocollo)                             |
| `L`      | Durata del lock in epoche                                              |
| `Q(r)`   | Moltiplicatore di qualità derivato dal punteggio di reputazione del validatore `r` |
| `P(t)`   | Moltiplicatore del pool al tempo `t` (40%, 35% o 25% a seconda del pool)     |

Durate di lock più lunghe e punteggi di reputazione più alti generano ricompense proporzionalmente maggiori, incentivando l'impegno a lungo termine e il buon comportamento dei validatori.

---

## Interrogare le Informazioni sui Validatori

Consulta i dettagli di qualsiasi validatore:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Esempio:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Elenca tutti i validatori attivi:

```bash
qorechaind query staking validators --status bonded
```

Interroga le tue deleghe correnti:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Delegare a validatori nel **pool RPoS** offre le ricompense più alte grazie al peso del pool del 40%.
* Costruire la reputazione di un validatore richiede tempo. Considera il track record del validatore prima di delegare.
* La ridelega è istantanea ma presenta restrizioni di cooldown. Pianifica con attenzione le tue mosse.
* Il periodo di svincolo di 21 giorni è una misura di sicurezza. Durante questo periodo, gli eventi di slashing possono comunque influire sui tuoi token.

:::
