---
slug: /user-guide/staking-and-delegation
title: Staking și Delegare
sidebar_label: Staking și Delegare
sidebar_position: 2
---

# Staking și Delegare

Acest ghid acoperă modul de delegare a token-urilor QOR către validatori, redelegarea între validatori, debondarea stake-ului, revendicarea recompenselor și înțelegerea arhitecturii de staking Triple-Pool a QoreChain.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026, rulând versiunea de chain **v3.1.95** — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când faceți staking pe mainnet.
:::

## Există o perioadă de blocare? {#lock-in-period}

**Astăzi**, nu — nu există un termen de ales, pentru că staking-ul nu se vinde în durate fixe aici, așa cum se întâmplă adesea pe un exchange. Delegarea rămâne activă, cu recompense care curg din blocul următor, atât timp cât doriți, până când alegeți să anulați delegarea (undelegate); nimic nu expiră și nimic nu trebuie reînnoit. **Perioada de debondare de 21 de zile** la care se face referire pe tot parcursul acestui ghid nu este o blocare pe care o acceptați din start — ea începe doar din momentul în care *cereți* anularea delegării și se aplică doar la QOR-ul pe care îl retrageți. Mutarea unei delegări între validatori (redelegate) evită complet această așteptare, deoarece stake-ul nu părăsește niciodată pool-ul bonded. Bonusul de „loialitate" menționat mai jos la [curba de bonding](#bonding-curve) este un efect asupra ratei de recompensă legat de *cât timp ați rămas delegat până acum* — este automat și nu are nici el un termen de ales, ci pur și simplu crește cu cât nu anulați delegarea mai mult timp.

Aceasta descrie comportamentul actual al chain-ului, nu o garanție permanentă — o perioadă minimă de staking este un parametru pe care guvernanța l-ar putea introduce pe viitor, la fel cum orice alt parametru de staking de pe această pagină poate fi modificat prin vot. Dacă se va întâmpla vreodată acest lucru, portofelul va afișa așteptarea rezultată (orice minim plus debondarea de 21 de zile) înainte de a confirma o delegare, iar această pagină va fi actualizată în consecință.

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

Redelegarea nu are **nicio penalizare și nicio blocare proprie** — stake-ul nu părăsește niciodată pool-ul bonded, nu încetează niciodată să câștige recompense și poate fi mutat din nou oricând. Nu este supusă deloc perioadei de debondare de 21 de zile; aceasta se aplică doar la `unbond`.

:::caution Limita reală este un număr, nu un cooldown
Un delegator poate avea cel mult **7 înregistrări de redelegare simultane în curs** pentru exact aceeași rută (delegator, validator sursă, validator destinație) — fiecare înregistrare se finalizează pe cont propriu pe măsură ce ajunge la maturitate, eliberând un loc. Aceasta este un plafon pe care utilizarea normală practic nu îl atinge niciodată, nu o regulă de tipul „așteptați înainte de a redelega din nou"; puteți redelega liber către sau de la alți validatori, sau pe aceeași rută din nou de îndată ce se eliberează un loc.
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

Recompensele de staking sunt finanțate din două surse: bugetul de emisie plafonat al protocolului (consultați [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pentru plafonul actual, în vigoare de la modificarea de guvernanță din 26 august 2026) și cota stakerilor din fiecare comision de tranzacție.

---

## Clasificarea Triple-Pool

QoreChain folosește un model de staking **Triple-Pool** care clasifică validatorii în trei pool-uri în funcție de reputația și nivelurile lor de delegare. Fiecare pool primește o cotă ponderată din recompensele de bloc.

| Pool                                 | Criterii de intrare                                              | Pondere recompensă |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Scor de reputație >= percentila 70 **ȘI** stake >= mediană | 40%           |
| **DPoS** (Delegated Proof of Stake)  | Delegare totală >= 10.000 QOR                              | 35%           |
| **PoS** (Proof of Stake)             | Toți ceilalți validatori                                    | 25%           |

Validatorii sunt reclasificați la fiecare graniță de epocă. Un validator care își construiește o reputație solidă și acumulează stake suficient este promovat în pool-ul RPoS, câștigând cea mai mare cotă de recompensă.

---

## Recompense pe curba de bonding {#bonding-curve}

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
| `P(t)`   | Multiplicator de pool la momentul `t` (40%, 35% sau 25% în funcție de pool) |

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
* Redelegarea este instantanee, fără penalizare și fără blocare — singura limită este un plafon de 7 înregistrări pentru redelegările simultane pe exact aceeași rută, plafon pe care utilizarea normală nu îl atinge.
* Perioada de debondare de 21 de zile este o măsură de securitate. În acest timp, evenimentele de slashing vă pot afecta în continuare token-urile.

:::
