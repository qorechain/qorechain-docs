---
slug: /user-guide/staking-and-delegation
title: Staking și Delegare
sidebar_label: Staking și Delegare
sidebar_position: 2
---

# Staking și Delegare

Acest ghid acoperă modul de delegare a token-urilor QOR către validatori, redelegarea între validatori, debondarea stake-ului, revendicarea recompenselor și înțelegerea arhitecturii de staking Triple-Pool a QoreChain.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026, rulând versiunea de chain **v3.1.82** — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când faceți staking pe mainnet.
:::

---

## Delegarea token-urilor

Delegați QOR către un validator pentru a câștiga recompense de staking și a participa la securitatea rețelei:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Delegați 100 QOR către un validator:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Redelegarea

Mutați delegarea de la un validator la altul fără a aștepta perioada de debondare:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
Nu puteți redelega token-uri care se află deja într-un tranzit de redelegare. Așteptați finalizarea redelegării curente înainte de a iniția alta.
:::

---

## Debondarea

Retrageți token-urile delegate de la un validator. Debondarea durează **21 de zile** până la finalizare, perioadă în care token-urile nu câștigă recompense și nu pot fi transferate.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

După perioada de debondare de 21 de zile, token-urile sunt returnate automat în contul dumneavoastră.

---

## Revendicarea recompenselor

Retrageți toate recompensele de staking acumulate de la fiecare validator către care ați delegat:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Pentru a retrage recompensele doar de la un anumit validator:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Recompensele de staking sunt finanțate din pool-ul de staking de 590M QOR al protocolului, conform programului Tokenomics v2.1, alături de cota stakerilor (10%) din fiecare comision de tranzacție.

---

## Clasificarea Triple-Pool

QoreChain folosește un model de staking **Triple-Pool** care clasifică validatorii în trei pool-uri în funcție de reputația și nivelurile lor de delegare. Fiecare pool primește o cotă ponderată din recompensele de bloc.

| Pool                                 | Criterii de intrare                                          | Pondere recompensă |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Scor de reputație >= percentila 70 **ȘI** stake >= mediană  | 40%           |
| **DPoS** (Delegated Proof of Stake)  | Delegare totală >= 10.000 QOR                               | 35%           |
| **PoS** (Proof of Stake)             | Toți ceilalți validatori                                    | 25%           |

Validatorii sunt reclasificați la fiecare graniță de epocă. Un validator care își construiește o reputație solidă și acumulează stake suficient este promovat în pool-ul RPoS, câștigând cea mai mare cotă de recompensă.

---

## Recompense pe curba de bonding

Recompensele individuale de staking sunt calculate folosind formula curbei de bonding a QoreChain:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Suma recompensei pentru perioadă                                    |
| `beta`   | Rata de bază a recompensei (parametru de protocol)                   |
| `S`      | Suma pusă la stake                                                   |
| `alpha`  | Coeficient de loialitate (parametru de protocol)                     |
| `L`      | Durata blocării în epoci                                             |
| `Q(r)`   | Multiplicator de calitate derivat din scorul de reputație `r` al validatorului |
| `P(t)`   | Multiplicator de pool la momentul `t` (40%, 35% sau 25% în funcție de pool)     |

Duratele de blocare mai lungi și scorurile de reputație mai mari conduc la recompense proporțional mai mari, stimulând angajamentul pe termen lung și comportamentul corect al validatorilor.

---

## Interogarea informațiilor despre validatori

Consultați detaliile oricărui validator:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Exemplu:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Listați toți validatorii activi:

```bash
qorechaind query staking validators --status bonded
```

Interogați delegările dumneavoastră curente:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Delegarea către validatori din **pool-ul RPoS** aduce cele mai mari recompense datorită ponderii de pool de 40%.
* Construirea reputației unui validator necesită timp. Luați în considerare istoricul validatorului înainte de a delega.
* Redelegarea este instantanee, dar are restricții de cooldown. Planificați-vă mișcările cu atenție.
* Perioada de debondare de 21 de zile este o măsură de securitate. În acest timp, evenimentele de slashing vă pot afecta în continuare token-urile.

:::
