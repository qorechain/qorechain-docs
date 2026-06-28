---
slug: /developer-guide/running-a-validator
title: Rularea unui validator
sidebar_label: Rularea unui validator
sidebar_position: 9
---

# Rularea unui validator

Acest ghid acoperă modul în care creezi un validator în rețeaua QoreChain, înțelegerea sistemului de clasificare pe pool-uri, înregistrarea unei chei PQC pentru securitate rezistentă la calculul cuantic și monitorizarea nodului tău.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**), activ de la 7 iunie 2026, rulând versiunea de chain **v3.1.80**. Testnet-ul **`qorechain-diana`** (EVM chain ID **9800**) este recomandat pentru a-ți repeta configurarea înainte de a intra în producție. Înlocuiește `--chain-id` cu valoarea corespunzătoare rețelei tale țintă.
:::

---

## Cerințe preliminare

* Un nod `qorechaind` complet sincronizat (vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet))
* Un cont finanțat cu cel puțin **1.000 QOR** (1.000.000.000 uqor) pentru auto-delegarea inițială
* Familiaritate cu modelul de [Staking și delegare](/user-guide/staking-and-delegation)

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
| `--amount`                     | Suma de auto-delegare (stake-ul minim)             |
| `--pubkey`                     | Cheia publică de consens a validatorului (ed25519) |
| `--moniker`                    | Nume lizibil pentru validatorul tău                |
| `--commission-rate`            | Rata inițială de comision (ex.: 0.10 = 10%)        |
| `--commission-max-rate`        | Rata maximă de comision (imuabilă după creare)     |
| `--commission-max-change-rate` | Rata maximă zilnică de modificare a comisionului   |
| `--min-self-delegation`        | Tokenii minimi pe care operatorul trebuie să îi auto-delege |

După confirmarea tranzacției, verifică validatorul:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificarea pe pool-uri

QoreChain folosește un **sistem de clasificare cu trei pool-uri** gestionat de modulul `x/qca` (Quantum Consensus Allocation). La fiecare **1.000 de blocuri**, validatorii sunt reclasificați într-unul dintre cele trei pool-uri, în funcție de reputația și stake-ul lor:

| Pool                                 | Criterii                                            | Alocare de blocuri |
| ------------------------------------ | --------------------------------------------------- | ------------------ |
| **RPoS** (Reputation Proof-of-Stake) | Reputație >= percentila 70 ȘI stake >= mediană      | 40% din blocuri    |
| **DPoS** (Delegated Proof-of-Stake)  | Delegare totală >= 10.000 QOR                        | 35% din blocuri    |
| **PoS** (Proof-of-Stake)             | Toți ceilalți validatori activi                     | 25% din blocuri    |

În cadrul fiecărui pool, propunătorii de blocuri sunt selectați folosind **selecție aleatorie ponderată**, proporțională cu stake-ul lor efectiv. Clasificarea asigură că atât validatorii cu reputație ridicată, cât și cei cu delegare ridicată primesc o reprezentare echitabilă, permițând totodată și validatorilor mai mici să participe.

### Interogarea clasificării pe pool-uri

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

## Curba de bonding

Recompensa de staking pentru un validator este determinată de o curbă de bonding care încorporează mai mulți factori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                  |
| --------- | ---------------------------------------------------------- |
| `R`       | Suma recompensei                                           |
| `beta`    | Rata de bază a recompensei                                 |
| `S`       | Stake-ul efectiv                                           |
| `alpha`   | Constanta de scalare a loialității                         |
| `L`       | Durata loialității (timp continuu de staking)             |
| `Q(r)`    | Factorul de calitate a reputației, interval \[0.75 - 1.25] |
| `P(t)`    | Multiplicatorul de fază a protocolului (se ajustează pe parcursul ciclului de viață al rețelei) |

**Concluzii esențiale:**

* **Bonus pentru durata loialității:** validatorii care fac staking continuu primesc recompense crescânde prin termenul logaritmic de loialitate. Acest lucru stimulează angajamentul pe termen lung.
* **Factorul de calitate a reputației:** variază de la 0.75 (reputație slabă) la 1.25 (reputație excelentă). Reputația este calculată pe baza disponibilității (uptime), a propunerilor reușite, a participării la comunitate și a calității validării tranzacțiilor.
* **Multiplicatorul de fază a protocolului:** se ajustează pe măsură ce rețeaua se maturizează prin faze diferite (bootstrap, creștere, maturitate).

---

## Slashing progresiv

QoreChain folosește un model de **slashing progresiv** care escaladează penalizările pentru cei care comit infracțiuni repetate, permițând totodată validatorilor să își revină în timp:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametru                           | Valoare         |
| ----------------------------------- | --------------- |
| Penalizare maximă per eveniment     | 33% din stake   |
| Timp de înjumătățire al decăderii   | 100.000 blocuri |
| Severitate downtime                 | 1.0             |
| Severitate double-sign              | 2.0             |
| Severitate atac de tip light client | 3.0             |

1. **Fiecare infracțiune incrementează numărul efectiv.** Fiecare infracțiune (downtime, double-signing etc.) crește numărul efectiv al validatorului, ceea ce afectează penalizările viitoare.

2. **Penalizarea escaladează exponențial.** Penalizarea escaladează în funcție de numărul efectiv, folosind formula de mai sus, astfel încât cei care comit infracțiuni repetate se confruntă cu penalizări mult mai mari.

3. **Numărul efectiv decade în timp.** Numărul efectiv decade cu un timp de înjumătățire de 100.000 de blocuri (\~7 zile la blocuri de 6s), permițând validatorilor să își revină după o perioadă de bună conduită.

4. **Evenimente singulare vs. infracțiuni repetate.** Un singur eveniment accidental de downtime duce la o penalizare minoră, în timp ce infracțiunile repetate declanșează consecințe care cresc exponențial.

---

## Înregistrarea cheii PQC

Validatorii pot înregistra opțional o **cheie publică criptografică post-cuantică (PQC)** folosind algoritmul ML-DSA-87. Aceasta oferă securitate rezistentă la calculul cuantic pentru identitatea validatorului și poate fi folosită pentru semnare hibridă.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametru      | Descriere                                            |
| -------------- | ---------------------------------------------------- |
| `<pubkey-hex>` | Cheie publică ML-DSA-87 de 2592 de octeți, codificată în hex |
| `hybrid`       | Mod de înregistrare (hybrid = atât clasic + PQC)     |

Verifică înregistrarea:

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recomandare:** înregistrarea cheii PQC este opțională, dar puternic recomandată pentru validatorii care operează pe mainnet. Oferă o apărare orientată spre viitor împotriva amenințărilor calculului cuantic.
:::

---

## Monitorizare

### Metrici Prometheus

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Metrici esențiale de monitorizat:

| Metrică                         | Descriere                                        |
| ------------------------------- | ------------------------------------------------ |
| `qorechain_missed_blocks_total` | Totalul blocurilor ratate de validatorul tău     |
| `qorechain_validator_uptime`    | Procentul de uptime pe ultimele N blocuri        |
| `qorechain_reputation_score`    | Scorul de reputație curent                       |
| `qorechain_pool_classification` | Atribuirea curentă pe pool (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Blocuri semnate consecutiv                       |
| `consensus_height`              | Înălțimea curentă a blocului                     |
| `consensus_rounds`              | Rundele de consens pentru înălțimea curentă      |

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

### Verificări de stare (health checks)

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

1. **Folosește o arhitectură cu noduri santinelă (sentry).** Rulează validatorul în spatele unor noduri santinelă pentru a-l proteja de atacuri DDoS. Expune doar nodurile santinelă către rețeaua publică.

2. **Configurează alertarea.** Configurează alerte pentru blocuri ratate, uptime scăzut și reporniri neașteptate. Câteva blocuri ratate sunt normale; ratările susținute vor declanșa slashing.

3. **Menține un uptime ridicat.** Sistemul de reputație recompensează un uptime constant. Downtime-ul prelungit îți degradează factorul de calitate a reputației, reducând recompensele.

4. **Menține software-ul actualizat.** Urmărește versiunile QoreChain și aplică actualizările prompt. Coordonează-te cu comunitatea de validatori pentru upgrade-urile de chain.

5. **Securizează-ți cheile.** Folosește un modul de securitate hardware (HSM) sau un remote signer pentru cheia de consens a validatorului. Nu stoca niciodată cheile pe aceeași mașină ca nodul.

6. **Înregistrează o cheie PQC.** Pregătește-ți validatorul pentru viitor împotriva amenințărilor cuantice, înregistrând o cheie ML-DSA-87.

7. **Monitorizează-ți pool-ul.** Urmărește clasificarea pe pool-uri la fiecare 1.000 de blocuri. Îmbunătățirea reputației te poate muta din PoS în RPoS, crescând semnificativ oportunitățile de propunere a blocurilor.

---

## Referință a comenzilor pentru validator

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

## Validarea rețelelor conectate {#connected-networks}

Începând cu versiunea de chain **v3.1.80**, un validator QoreChain poate, de asemenea, să ajute la validarea rețelelor conectate prin [bridge](/architecture/bridge-architecture). Acest lucru este **condiționat de licență și opțional (opt-in)**:

1. **Deține licența.** Validatorul trebuie să dețină o licență activă `validator_<chain>` (sau `qcb_bridge`) pentru rețeaua țintă. Orchestratorul refuză să pornească un client extern fără ea (fail-closed).
2. **Activarea provizionează automat clientul.** Când licența este activată, QoreChain provizionează clientul rețelei corespunzătoare pe nodul tău — descărcând clientul fixat (pinned), generând configurația acestuia și rulându-l sub orchestrarea QoreChain. Nimic nu este descărcat până la activare.
3. **Furnizează cheile și stake-ul rețelei.** Validatorul/stake-ul și cheile de semnare ale rețelei externe sunt **furnizate de operator** pentru fiecare rețea; QoreChain livrează cadrul de drivere și poarta de licență impusă, nu stake-ul tău din chain-ul extern.

Există drivere pentru toate cele **37 de rețele bridge**, clasificate în funcție de modul în care un validator poate participa:

| Clasă | Participare | Exemple |
| ----- | ----------- | ------- |
| Validator permissionless | Stake și rulare | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonat / ales / cu admitere | Stake, supus unui plafon sau unei alegeri | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nod complet L2 | Rulare a unui nod complet (fără staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Fără staking / trust-list | Observare / participare fără staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Fixările versiunilor de client sunt best-effort; verifică versiunea clientului upstream pentru rețeaua ta țintă înainte de o activare în producție.
:::

## Pașii următori

* [Construirea din sursă](/developer-guide/building-from-source) — Construiește binarul `qorechaind`
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementează contracte inteligente pe QoreChain
* [Account Abstraction](/developer-guide/account-abstraction) — Conturi programabile pentru operațiunile validatorului tău
