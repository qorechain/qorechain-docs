---
slug: /user-guide/staking-and-delegation
title: Staking e Delega
sidebar_label: Staking e Delega
sidebar_position: 2
---

# Staking e Delega

Questa guida illustra come delegare token QOR ai validatori, ridelegare tra validatori, effettuare l'unbonding dello stake, riscuotere le ricompense e comprendere l'architettura di staking Triple-Pool di QoreChain.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è live dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** quando esegui lo staking su mainnet.
:::

## C'è un periodo di vincolo? {#lock-in-period}

**Oggi**, no — non c'è una durata da scegliere, perché qui lo staking non viene offerto in periodi fissi come spesso accade su un exchange. La delega resta attiva con le ricompense che iniziano a maturare dal blocco successivo, per tutto il tempo che desideri, finché non decidi di annullarla; non c'è nulla che scada e nulla da rinnovare. Il **periodo di unbonding di 21 giorni** citato in tutta questa guida non è un vincolo che accetti in anticipo — inizia soltanto quando *richiedi* l'unbonding, e si applica solo al QOR che stai ritirando. Spostare una delega tra validatori (ridelega) evita del tutto questa attesa, poiché lo stake non lascia mai il pool bonded. Il bonus di "fedeltà" menzionato più avanti nella [curva di bonding](#bonding-curve) è invece un effetto sul tasso di ricompensa legato a *da quanto tempo sei rimasto delegato finora* — è automatico e non prevede anch'esso alcuna durata da selezionare, cresce semplicemente più a lungo non fai l'unbonding.

Questo descrive il comportamento attuale della chain, non una garanzia permanente — un periodo minimo di staking è un parametro che la governance potrebbe introdurre in futuro, allo stesso modo in cui qualsiasi altro parametro di staking descritto in questa pagina può cambiare tramite voto. Se ciò dovesse accadere, il wallet mostrerà l'attesa risultante (l'eventuale minimo più i 21 giorni di unbonding) prima di confermare una delega, e questa pagina verrà aggiornata di conseguenza.

---

## Delegare Token

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

Sposta la tua delega da un validatore a un altro senza attendere il periodo di unbonding:

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
Non puoi ridelegare token che si trovano già in transito in una ridelega. Attendi il completamento della ridelega in corso prima di avviarne un'altra.
:::

---

## Unbonding

Ritira i token delegati da un validatore. L'unbonding richiede **21 giorni** per essere completato; durante questo periodo i token non generano ricompense e non possono essere trasferiti.

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

Al termine del periodo di unbonding di 21 giorni, i token vengono restituiti automaticamente al tuo account.

---

## Riscuotere le Ricompense

Ritira tutte le ricompense di staking accumulate da ogni validatore a cui hai delegato:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Per ritirare le ricompense da un singolo validatore:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Le ricompense di staking sono finanziate dal pool di staking di 590M QOR del protocollo secondo il piano Tokenomics v2.1, insieme alla quota destinata agli staker (10%) di ogni commissione di transazione.

---

## Classificazione Triple-Pool

QoreChain utilizza un modello di staking **Triple-Pool** che classifica i validatori in tre pool in base alla loro reputazione e ai livelli di delega. Ogni pool riceve una quota ponderata delle ricompense di blocco.

| Pool                                  | Criteri di Ammissione                                           | Peso della Ricompensa |
| -------------------------------------- | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Punteggio di reputazione >= 70° percentile **E** stake >= mediana | 40%           |
| **DPoS** (Delegated Proof of Stake)  | Delega totale >= 10.000 QOR                              | 35%           |
| **PoS** (Proof of Stake)             | Tutti i validatori rimanenti                                    | 25%           |

I validatori vengono riclassificati a ogni confine di epoca. Un validatore che costruisce una solida reputazione e accumula stake sufficiente viene promosso al pool RPoS, guadagnando la quota di ricompensa più alta.

---

## Ricompense a Curva di Bonding {#bonding-curve}

Le ricompense di staking individuali vengono calcolate utilizzando la formula a curva di bonding di QoreChain:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabile | Descrizione                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Importo della ricompensa per il periodo                                         |
| `beta`   | Tasso di ricompensa base (parametro del protocollo)                                |
| `S`      | Importo in stake                                                        |
| `alpha`  | Coefficiente di fedeltà (parametro del protocollo)                             |
| `L`      | Durata del blocco in epoche                                              |
| `Q(r)`   | Moltiplicatore di qualità derivato dal punteggio di reputazione `r` del validatore |
| `P(t)`   | Moltiplicatore di pool al tempo `t` (40%, 35% o 25% a seconda del pool)     |

Durate di blocco più lunghe e punteggi di reputazione più alti producono ricompense proporzionalmente maggiori, incentivando l'impegno a lungo termine e il buon comportamento dei validatori.

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

Interroga le tue delegazioni attuali:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Delegare a validatori nel **pool RPoS** offre le ricompense più alte grazie al peso del 40% del pool.
* Costruire la reputazione di un validatore richiede tempo. Valuta lo storico del validatore prima di delegare.
* La ridelega è istantanea ma ha restrizioni di cooldown. Pianifica le tue mosse con attenzione.
* Il periodo di unbonding di 21 giorni è una misura di sicurezza. Durante questo periodo, gli eventi di slashing possono comunque intaccare i tuoi token.

:::
