---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Acest ghid acoperă mecanismul de staking de guvernanță xQORE, care le permite deținătorilor de QOR să își blocheze token-urile pentru o putere de guvernanță sporită, cu un model de rebase PvP care recompensează participanții pe termen lung.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026, rulând versiunea de chain **v3.1.77** — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când faceți staking pe mainnet.
:::

---

## Prezentare generală

xQORE este token-ul de staking de guvernanță al QoreChain. Când blocați QOR, primiți xQORE la un **raport de 1:1**. Deținerea de xQORE oferă un avantaj semnificativ în guvernanță: token-urile xQORE contează la **dublu de greutate** în formula puterii de vot QDRW (vezi [Guvernanță](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Aceasta înseamnă că blocarea QOR în xQORE dublează efectiv impactul său în guvernanță în comparație cu staking-ul obișnuit singur.

---

## Blocarea QOR pentru xQORE

Blocați token-uri QOR pentru a emite xQORE la un raport de 1:1:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Blocați 1.000 QOR:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

După această tranzacție, contul dumneavoastră va deține 1.000.000.000 uxqore (1.000 xQORE).

---

## Deblocarea xQORE

Ardeți xQORE pentru a primi înapoi QOR. O **penalizare de ieșire** poate fi aplicată în funcție de cât timp au fost blocate token-urile:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Deblocați 500 xQORE:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Programul penalizărilor de ieșire

Retragerea anticipată din xQORE atrage o penalizare. Cu cât dețineți mai mult timp, cu atât penalizarea este mai mică:

| Durata blocării    | Penalizare de ieșire |
| ------------------ | ------------ |
| Mai puțin de 30 de zile | **50%**      |
| 30 până la 90 de zile   | **35%**      |
| 90 până la 180 de zile  | **15%**      |
| Mai mult de 180 de zile | **0%**       |

**Exemplu:** Dacă ați blocat 1.000 QOR și deblocați după 45 de zile, primiți 650 QOR (penalizare de 35% aplicată). Cei 350 QOR rămași sunt redistribuiți altor deținători de xQORE prin mecanismul de rebase PvP.

---

## Mecanismul de rebase PvP

Penalizările colectate din ieșirile anticipate **nu sunt arse**. În schimb, ele sunt redistribuite proporțional tuturor deținătorilor de xQORE rămași. Aceasta creează o dinamică „Player vs Player” în care deținătorii răbdători beneficiază de nerăbdarea altora.

Cum funcționează:

1. Un utilizator deblochează xQORE înainte de pragul de zero penalizare de 180 de zile.
2. Penalizarea de ieșire este dedusă din QOR-ul returnat.
3. Suma penalizării este distribuită proporțional pe toate pozițiile xQORE rămase.
4. QOR-ul revendicabil per xQORE al fiecărui deținător rămas crește.

Acest mecanism stimulează angajamentul de guvernanță pe termen lung și recompensează deținătorii care își mențin pozițiile.

---

## Interogarea poziției dumneavoastră

Verificați poziția dumneavoastră curentă xQORE, durata blocării și penalizarea de ieșire aplicabilă:

```bash
qorechaind query xqore position <address>
```

**Exemplu:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Exemplu de rezultat:**

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

## Acces JSON-RPC

Pentru aplicațiile care se integrează cu QoreChain prin JSON-RPC, poziția xQORE poate fi interogată folosind:

```
qor_getXQOREPosition
```

**Cerere:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Răspuns:**

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

## Sfaturi

* Blocați QOR în xQORE cu mult timp înainte de voturile importante de guvernanță pentru a vă maximiza puterea de vot.
* Pragul de 180 de zile pentru ieșirile fără penalizare recompensează participanții răbdători la guvernanță.
* Monitorizați acumulările de rebase PvP. Pe măsură ce alții ies anticipat, poziția dumneavoastră crește în valoare.
* xQORE este netransferabil. Poate fi emis doar prin blocarea QOR și ars prin deblocare.
* Luați în considerare cu atenție penalizarea de ieșire înainte de a bloca. Blocările pe termen scurt atrag penalizări semnificative.
