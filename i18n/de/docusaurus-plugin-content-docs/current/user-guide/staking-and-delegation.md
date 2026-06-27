---
slug: /user-guide/staking-and-delegation
title: Staking und Delegation
sidebar_label: Staking und Delegation
sidebar_position: 2
---

# Staking und Delegation

Dieser Leitfaden behandelt, wie du QOR-Token an Validatoren delegierst, zwischen Validatoren neu delegierst, dein Stake entbindest, Belohnungen einforderst und die Triple-Pool-Staking-Architektur von QoreChain verstehst.

:::note
Die nachstehenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit Chain-Version **v3.1.77** — ersetze für das Staking im Mainnet die Mainnet-Chain-ID und die Endpunkte von der Seite **Verbindung zum Mainnet herstellen**.
:::

---

## Token delegieren

Delegiere QOR an einen Validator, um Staking-Belohnungen zu verdienen und an der Netzwerksicherheit mitzuwirken:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Delegiere 100 QOR an einen Validator:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Neu delegieren

Verschiebe deine Delegation von einem Validator zu einem anderen, ohne die Entbindungsperiode abwarten zu müssen:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
Du kannst keine Token neu delegieren, die sich bereits in einem Neudelegations-Transit befinden. Warte, bis die aktuelle Neudelegation abgeschlossen ist, bevor du eine weitere startest.
:::

---

## Entbinden

Ziehe deine delegierten Token von einem Validator zurück. Die Entbindung dauert **21 Tage**, während dieser Zeit verdienen die Token keine Belohnungen und können nicht übertragen werden.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Nach der 21-tägigen Entbindungsperiode werden die Token automatisch an dein Konto zurückgegeben.

---

## Belohnungen einfordern

Hebe alle aufgelaufenen Staking-Belohnungen von jedem Validator ab, an den du delegiert hast:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

So hebst du Belohnungen nur von einem bestimmten Validator ab:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Staking-Belohnungen werden aus dem 590-Mio.-QOR-Staking-Pool des Protokolls gemäß dem Tokenomics-v2.1-Zeitplan finanziert, zusammen mit dem Staker-Anteil (10 %) jeder Transaktionsgebühr.

---

## Triple-Pool-Klassifizierung

QoreChain verwendet ein **Triple-Pool**-Staking-Modell, das Validatoren basierend auf ihrer Reputation und ihren Delegationsniveaus in drei Pools einteilt. Jeder Pool erhält einen gewichteten Anteil an den Block-Belohnungen.

| Pool                                 | Eintrittskriterien                                          | Belohnungsgewicht |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Reputationswert >= 70. Perzentil **UND** Stake >= Median   | 40 %          |
| **DPoS** (Delegated Proof of Stake)  | Gesamtdelegation >= 10.000 QOR                              | 35 %          |
| **PoS** (Proof of Stake)             | Alle verbleibenden Validatoren                              | 25 %          |

Validatoren werden an jeder Epoch-Grenze neu klassifiziert. Ein Validator, der eine starke Reputation aufbaut und ausreichend Stake ansammelt, wird in den RPoS-Pool befördert und verdient den höchsten Belohnungsanteil.

---

## Bonding-Curve-Belohnungen

Individuelle Staking-Belohnungen werden mit der Bonding-Curve-Formel von QoreChain berechnet:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Belohnungsbetrag für den Zeitraum                                    |
| `beta`   | Basis-Belohnungsrate (Protokollparameter)                            |
| `S`      | Gestakter Betrag                                                     |
| `alpha`  | Loyalitätskoeffizient (Protokollparameter)                          |
| `L`      | Sperrdauer in Epochen                                                |
| `Q(r)`   | Qualitätsmultiplikator, abgeleitet aus dem Reputationswert `r` des Validators |
| `P(t)`   | Pool-Multiplikator zum Zeitpunkt `t` (40 %, 35 % oder 25 % je nach Pool) |

Längere Sperrdauern und höhere Reputationswerte führen zu proportional größeren Belohnungen und schaffen so Anreize für langfristiges Engagement und gutes Validator-Verhalten.

---

## Validator-Informationen abfragen

Schlage Details zu einem beliebigen Validator nach:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Beispiel:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Liste alle aktiven Validatoren auf:

```bash
qorechaind query staking validators --status bonded
```

Frage deine aktuellen Delegationen ab:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Die Delegation an Validatoren im **RPoS-Pool** bringt aufgrund der 40-%-Pool-Gewichtung die höchsten Belohnungen.
* Der Aufbau der Validator-Reputation braucht Zeit. Berücksichtige die Erfolgsbilanz des Validators, bevor du delegierst.
* Neudelegation erfolgt sofort, hat aber Abklingbeschränkungen. Plane deine Schritte sorgfältig.
* Die 21-tägige Entbindungsperiode ist eine Sicherheitsmaßnahme. Während dieser Zeit können Slashing-Ereignisse deine Token weiterhin betreffen.

:::
