---
slug: /developer-guide/running-a-validator
title: Rularea unui validator
sidebar_label: Rularea unui validator
sidebar_position: 9
---

# Rularea unui validator

Acest ghid acoperă cum să creați un validator în rețeaua QoreChain, să înțelegeți sistemul de clasificare a grupurilor, să înregistrați o cheie PQC pentru securitate rezistentă la cuantică și să vă monitorizați nodul.

:::note
Acest ghid vizează rețeaua principală (mainnet) **`qorechain-vladi`** (EVM chain ID **9801**), activă din 7 iunie 2026 rulând versiunea de lanț **v3.1.77**. Rețeaua de test (testnet) **`qorechain-diana`** (EVM chain ID **9800**) este recomandată pentru repetarea configurației înainte de a intra în producție. Substituiți `--chain-id` corespunzător pentru rețeaua dvs. țintă.
:::

---

## Cerințe prealabile

* Un nod `qorechaind` complet sincronizat (vedeți [Conectarea la testnet](/getting-started/connecting-to-testnet))
* Un cont finanțat cu cel puțin **1.000 QOR** (1.000.000.000 uqor) pentru auto-delegarea inițială
* Familiaritate cu modelul [Staking și delegare](/user-guide/staking-and-delegation)

---

## Crearea unui validator

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Parametru                      | Descriere                                          |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Suma de auto-delegare (stake minim)                |
| `--pubkey`                     | Cheia publică de consens a validatorului (ed25519) |
| `--moniker`                    | Nume lizibil de către om pentru validatorul dvs.   |
| `--commission-rate`            | Rata inițială a comisionului (de ex., 0.10 = 10%)  |
| `--commission-max-rate`        | Rata maximă a comisionului (imutabilă după creare) |
| `--commission-max-change-rate` | Rata maximă zilnică de schimbare a comisionului    |
| `--min-self-delegation`        | Numărul minim de tokenuri pe care operatorul trebuie să le auto-delege |

După confirmarea tranzacției, verificați-vă validatorul:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificarea grupurilor

QoreChain folosește un **sistem de clasificare cu trei grupuri** gestionat de modulul `x/qca` (Quantum Consensus Allocation). La fiecare **1.000 de blocuri**, validatorii sunt reclasificați într-unul dintre cele trei grupuri pe baza reputației și stake-ului lor:

| Grup                                 | Criterii                                          | Alocare de blocuri |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputație >= percentila 70 ȘI stake >= mediană    | 40% din blocuri    |
| **DPoS** (Delegated Proof-of-Stake)  | Delegare totală >= 10.000 QOR                      | 35% din blocuri    |
| **PoS** (Proof-of-Stake)             | Toți validatorii activi rămași                     | 25% din blocuri    |

În cadrul fiecărui grup, proponenții de blocuri sunt selectați folosind **selecție aleatorie ponderată** proporțională cu stake-ul lor efectiv. Clasificarea asigură că atât validatorii cu reputație înaltă, cât și cei cu delegare mare primesc o reprezentare echitabilă, permițând în același timp validatorilor mai mici să participe.

### Interogarea clasificării grupului dvs.

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Prin JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Curba de legare (bonding)

Recompensa de staking pentru un validator este determinată de o curbă de legare care încorporează mai mulți factori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                  |
| -------- | ---------------------------------------------------------- |
| `R`      | Suma recompensei                                          |
| `beta`   | Rata de bază a recompensei                                |
| `S`      | Stake-ul efectiv                                          |
| `alpha`  | Constanta de scalare a loialității                        |
| `L`      | Durata loialității (timp continuu de staking)             |
| `Q(r)`   | Factorul de calitate a reputației, interval \[0.75 - 1.25]  |
| `P(t)`   | Multiplicatorul de fază a protocolului (se ajustează pe durata de viață a rețelei) |

**Concluzii cheie:**

* **Bonus pentru durata loialității:** Validatorii care fac staking continuu primesc recompense crescânde prin termenul logaritmic de loialitate. Acest lucru stimulează angajamentul pe termen lung.
* **Factorul de calitate a reputației:** Variază de la 0.75 (reputație slabă) la 1.25 (reputație excelentă). Reputația este calculată din timpul de funcționare (uptime), propunerile reușite, participarea comunitară și calitatea validării tranzacțiilor.
* **Multiplicatorul de fază a protocolului:** Se ajustează pe măsură ce rețeaua se maturizează prin faze diferite (bootstrap, creștere, maturitate).

---

## Slashing progresiv

QoreChain folosește un model de **slashing progresiv** care escaladează penalizările pentru infractorii recidiviști, permițând în același timp validatorilor să se recupereze în timp:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametru                    | Valoare          |
| ---------------------------- | -------------- |
| Penalizare maximă per eveniment | 33% din stake   |
| Timp de înjumătățire al decăderii | 100.000 de blocuri |
| Severitate timp inactiv (downtime) | 1.0            |
| Severitate dublă semnare (double-sign) | 2.0            |
| Severitate atac asupra clientului ușor | 3.0            |

1. **Fiecare infracțiune incrementează numărul efectiv.** Fiecare infracțiune (timp inactiv, dublă semnare etc.) crește numărul efectiv al validatorului, care afectează penalizările viitoare.

2. **Penalizarea escaladează exponențial.** Penalizarea escaladează pe baza numărului efectiv folosind formula de mai sus, astfel încât infractorii recidiviști se confruntă cu penalizări mult mai mari.

3. **Numărul efectiv decade în timp.** Numărul efectiv decade cu un timp de înjumătățire de 100.000 de blocuri (\~7 zile la blocuri de 6s), permițând validatorilor să se recupereze după o perioadă de comportament bun.

4. **Evenimente unice versus infracțiuni repetate.** Un singur eveniment accidental de timp inactiv rezultă într-o penalizare minoră, în timp ce infracțiunile repetate declanșează consecințe în creștere exponențială.

---

## Înregistrarea cheii PQC

Validatorii pot înregistra opțional o **cheie publică de criptografie post-cuantică (PQC)** folosind algoritmul ML-DSA-87. Aceasta oferă securitate rezistentă la cuantică pentru identitatea validatorului și poate fi folosită pentru semnare hibridă.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametru      | Descriere                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | Cheie publică ML-DSA-87 de 2592 octeți în codificare hex |
| `hybrid`       | Modul de înregistrare (hibrid = atât clasic + PQC) |

Verificați înregistrarea:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recomandare:** Înregistrarea cheii PQC este opțională, dar puternic recomandată pentru validatorii care operează pe mainnet. Oferă o apărare orientată spre viitor împotriva amenințărilor calculului cuantic.
:::

---

## Monitorizare

### Metrici Prometheus

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Metrici cheie de monitorizat:

| Metrică                          | Descriere                                       |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Total blocuri ratate de validatorul dvs.        |
| `qorechain_validator_uptime`    | Procentul de uptime pe ultimele N blocuri       |
| `qorechain_reputation_score`    | Scorul de reputație curent                      |
| `qorechain_pool_classification` | Atribuirea curentă a grupului (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Blocuri consecutive semnate                     |
| `consensus_height`              | Înălțimea curentă a blocului                    |
| `consensus_rounds`              | Runde de consens pentru înălțimea curentă       |

### Interogarea scorului de reputație

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Prin JSON-RPC:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Verificări de sănătate

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Bune practici operaționale

1. **Folosiți o arhitectură cu noduri sentry.** Rulați validatorul în spatele nodurilor sentry pentru a-l proteja împotriva atacurilor DDoS. Expuneți doar nodurile sentry către rețeaua publică.

2. **Configurați alertarea.** Configurați alerte pentru blocuri ratate, uptime scăzut și reporniri neașteptate. Câteva blocuri ratate sunt normale; ratările susținute vor declanșa slashing.

3. **Mențineți un uptime ridicat.** Sistemul de reputație recompensează uptime-ul constant. Timpul de inactivitate prelungit degradează factorul de calitate a reputației dvs., reducând recompensele.

4. **Mențineți software-ul actualizat.** Urmăriți lansările QoreChain și aplicați actualizările prompt. Coordonați-vă cu comunitatea de validatori pentru actualizările lanțului.

5. **Securizați-vă cheile.** Folosiți un modul hardware de securitate (HSM) sau un semnatar la distanță pentru cheia de consens a validatorului. Nu stocați niciodată cheile pe aceeași mașină cu nodul.

6. **Înregistrați o cheie PQC.** Pregătiți-vă validatorul pentru viitor împotriva amenințărilor cuantice prin înregistrarea unei chei ML-DSA-87.

7. **Monitorizați-vă grupul.** Urmăriți clasificarea grupului dvs. la fiecare 1.000 de blocuri. Îmbunătățirea reputației vă poate muta din PoS în RPoS, crescând semnificativ oportunitățile de propunere a blocurilor.

---

## Referință comenzi de validator

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Pașii următori

* [Construire din sursă](/developer-guide/building-from-source) — Construiți binarul `qorechaind`
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementați contracte inteligente pe QoreChain
* [Abstractizarea conturilor](/developer-guide/account-abstraction) — Conturi programabile pentru operațiunile validatorului dvs.
