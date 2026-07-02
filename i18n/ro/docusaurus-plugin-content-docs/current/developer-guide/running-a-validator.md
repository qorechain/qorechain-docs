---
slug: /developer-guide/running-a-validator
title: Rularea unui validator
sidebar_label: Rularea unui validator
sidebar_position: 9
---

# Rularea unui validator

Acest ghid acoperă modul în care creezi un validator în rețeaua QoreChain, înțelegerea sistemului de clasificare pe pool-uri, înregistrarea unei chei PQC pentru securitate rezistentă la calculul cuantic și monitorizarea nodului tău.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (EVM chain ID **9801**), activ de la 7 iunie 2026, rulând versiunea de chain **v3.1.82**. Testnet-ul **`qorechain-diana`** (EVM chain ID **9800**) este recomandat pentru a-ți repeta configurarea înainte de a intra în producție. Înlocuiește `--chain-id` cu valoarea corespunzătoare rețelei tale țintă.
:::

---

## Cerințe preliminare

* Un nod `qorechaind` complet sincronizat (vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet))
* Un cont finanțat cu cel puțin **1.000 QOR** (1,000,000,000 uqor) pentru auto-delegarea inițială
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

| Parametru                      | Descriere                                                                 |
| ------------------------------ | ------------------------------------------------------------------------- |
| `--amount`                     | Suma auto-delegată (miza minimă)                                           |
| `--pubkey`                     | Cheia publică de consens a validatorului (ed25519)                         |
| `--moniker`                    | Nume lizibil pentru validatorul tău                                        |
| `--commission-rate`            | Rata inițială a comisionului (de ex., 0.10 = 10%)                          |
| `--commission-max-rate`        | Rata maximă a comisionului (imuabilă după creare)                          |
| `--commission-max-change-rate` | Rata maximă de modificare zilnică a comisionului                           |
| `--min-self-delegation`        | Numărul minim de tokenuri pe care operatorul trebuie să și le auto-delege  |

După confirmarea tranzacției, verifică-ți validatorul:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificarea pe pool-uri

QoreChain folosește un **sistem de clasificare cu trei pool-uri**, gestionat de modulul `x/qca` (Quantum Consensus Allocation). La fiecare **1.000 de blocuri**, validatorii sunt reclasificați într-unul dintre cele trei pool-uri, în funcție de reputația și miza lor:

| Pool                                 | Criterii                                          | Alocarea blocurilor |
| ------------------------------------ | ------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Reputație >= percentila 70 ȘI miză >= mediana     | 40% din blocuri     |
| **DPoS** (Delegated Proof-of-Stake)  | Delegare totală >= 10,000 QOR                     | 35% din blocuri     |
| **PoS** (Proof-of-Stake)             | Toți ceilalți validatori activi                   | 25% din blocuri     |

În cadrul fiecărui pool, propunătorii de blocuri sunt selectați prin **selecție aleatorie ponderată**, proporțional cu miza lor efectivă. Clasificarea asigură că atât validatorii cu reputație ridicată, cât și cei cu delegare ridicată primesc o reprezentare echitabilă, permițând în același timp validatorilor mai mici să participe.

### Interogarea clasificării pool-ului tău

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

Recompensa de staking a unui validator este determinată de o curbă de bonding care încorporează mai mulți factori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                                                   |
| --------- | ------------------------------------------------------------------------------------------- |
| `R`       | Suma recompensei                                                                             |
| `beta`    | Rata de bază a recompensei                                                                   |
| `S`       | Miza efectivă                                                                                |
| `alpha`   | Constanta de scalare a loialității                                                           |
| `L`       | Durata loialității (timp de staking continuu)                                                |
| `Q(r)`    | Factorul de calitate a reputației, interval \[0.75 - 1.25]                                   |
| `P(t)`    | Multiplicatorul fazei protocolului (se ajustează pe parcursul ciclului de viață al rețelei)  |

**Aspecte-cheie:**

* **Bonus pentru durata loialității:** Validatorii care fac staking continuu primesc recompense în creștere prin termenul logaritmic de loialitate. Acest lucru stimulează angajamentul pe termen lung.
* **Factorul de calitate a reputației:** Variază de la 0.75 (reputație slabă) la 1.25 (reputație excelentă). Reputația este calculată pe baza uptime-ului, a propunerilor reușite, a participării în comunitate și a calității validării tranzacțiilor.
* **Multiplicatorul fazei protocolului:** Se ajustează pe măsură ce rețeaua se maturizează, trecând prin faze diferite (bootstrap, creștere, maturitate).

---

## Slashing progresiv

QoreChain folosește un model de **slashing progresiv** care escaladează penalitățile pentru recidiviști, permițând în același timp validatorilor să se recupereze în timp:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametru                                     | Valoare         |
| --------------------------------------------- | --------------- |
| Penalitatea maximă per eveniment              | 33% din miză    |
| Timpul de înjumătățire al decăderii           | 100,000 blocuri |
| Severitatea indisponibilității (downtime)     | 1.0             |
| Severitatea semnării duble                    | 2.0             |
| Severitatea atacului asupra light client-ului | 3.0             |

1. **Fiecare abatere incrementează contorul efectiv.** Fiecare abatere (indisponibilitate, semnare dublă etc.) crește contorul efectiv al validatorului, ceea ce afectează penalitățile viitoare.

2. **Penalitatea escaladează exponențial.** Penalitatea escaladează pe baza contorului efectiv, folosind formula de mai sus, astfel încât recidiviștii se confruntă cu penalități mult mai mari.

3. **Contorul efectiv scade în timp.** Contorul efectiv decade cu un timp de înjumătățire de 100,000 de blocuri (\~7 zile la blocuri de 6s), permițând validatorilor să se recupereze după o perioadă de comportament corect.

4. **Evenimente singulare vs. abateri repetate.** Un singur eveniment accidental de indisponibilitate duce la o penalitate minoră, în timp ce abaterile repetate declanșează consecințe care cresc exponențial.

---

## Înregistrarea cheii PQC

Validatorii pot înregistra opțional o **cheie publică criptografică post-cuantică (PQC)** folosind algoritmul ML-DSA-87. Aceasta oferă securitate rezistentă la calculul cuantic pentru identitatea validatorului și poate fi folosită pentru semnare hibridă.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Parametru      | Descriere                                                 |
| -------------- | --------------------------------------------------------- |
| `<pubkey-hex>` | Cheia publică ML-DSA-87 de 2592 de octeți, codificată hex  |
| `hybrid`       | Modul de înregistrare (hybrid = atât clasic, cât și PQC)   |

Verifică înregistrarea:

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

Metrici-cheie de monitorizat:

| Metrică                         | Descriere                                              |
| ------------------------------- | ------------------------------------------------------ |
| `qorechain_missed_blocks_total` | Totalul blocurilor ratate de validatorul tău           |
| `qorechain_validator_uptime`    | Procentul de uptime pe ultimele N blocuri              |
| `qorechain_reputation_score`    | Scorul actual de reputație                             |
| `qorechain_pool_classification` | Pool-ul atribuit curent (0=PoS, 1=DPoS, 2=RPoS)        |
| `qorechain_consecutive_signed`  | Blocuri semnate consecutiv                             |
| `consensus_height`              | Înălțimea curentă a blocului                           |
| `consensus_rounds`              | Rundele de consens pentru înălțimea curentă            |

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

1. **Folosește o arhitectură cu noduri sentry.** Rulează-ți validatorul în spatele unor noduri sentry pentru a-l proteja de atacuri DDoS. Expune doar nodurile sentry către rețeaua publică.

2. **Configurează alerte.** Configurează alerte pentru blocuri ratate, uptime scăzut și reporniri neașteptate. Câteva blocuri ratate sunt normale; ratările susținute vor declanșa slashing.

3. **Menține un uptime ridicat.** Sistemul de reputație recompensează uptime-ul constant. Indisponibilitatea prelungită degradează factorul de calitate a reputației, reducând recompensele.

4. **Menține software-ul actualizat.** Urmărește lansările QoreChain și aplică actualizările prompt. Coordonează-te cu comunitatea de validatori pentru upgrade-urile chain-ului.

5. **Securizează-ți cheile.** Folosește un modul hardware de securitate (HSM) sau un semnatar la distanță (remote signer) pentru cheia de consens a validatorului. Nu stoca niciodată cheile pe aceeași mașină cu nodul.

6. **Înregistrează o cheie PQC.** Pregătește-ți validatorul pentru viitor împotriva amenințărilor cuantice prin înregistrarea unei chei ML-DSA-87.

7. **Monitorizează-ți pool-ul.** Urmărește-ți clasificarea pool-ului la fiecare 1.000 de blocuri. Îmbunătățirea reputației te poate muta din PoS în RPoS, crescând semnificativ oportunitățile de a propune blocuri.

---

## Referință de comenzi pentru validatori

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

Începând cu versiunea de chain **v3.1.80**, un validator QoreChain poate ajuta și la validarea rețelelor conectate prin [bridge](/architecture/bridge-architecture). Acest lucru este **condiționat de licență și opțional (opt-in)**:

1. **Deține licența.** Validatorul trebuie să dețină o licență activă `validator_<chain>` (sau `qcb_bridge`) pentru rețeaua țintă. Orchestratorul refuză să pornească un client extern fără ea (fail-closed).
2. **Activarea provisionează automat clientul.** Când licența este activată, QoreChain provisionează pe nodul tău clientul rețelei corespunzătoare — descărcând clientul fixat (pinned), generându-i configurația și rulându-l sub orchestrarea QoreChain. Nimic nu este descărcat înainte de activare.
3. **Furnizează cheile și miza rețelei respective.** Cheile de validator/miză și de semnare ale rețelei externe sunt **furnizate de operator** pentru fiecare rețea; QoreChain livrează framework-ul de drivere și poarta de licență impusă, nu miza ta de pe chain-ul extern.

Există drivere pentru toate cele **37 de rețele bridge**, clasificate după modul în care un validator poate participa:

| Clasă | Participare | Exemple |
| ----- | ----------- | ------- |
| Validator permissionless | Faci staking și rulezi | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonat / ales / cu admitere | Staking, sub rezerva unui plafon sau a unei alegeri | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Full-node L2 | Rulezi un nod complet (fără staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Fără staking / listă de încredere | Observi / participi fără staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Fixările de versiune ale clienților (version pins) sunt de tip best-effort; verifică lansarea clientului upstream pentru rețeaua ta țintă înainte de o activare în producție.
:::

## Pașii următori

* [Compilarea din sursă](/developer-guide/building-from-source) — Compilează binarul `qorechaind`
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementează contracte inteligente pe QoreChain
* [Abstractizarea conturilor](/developer-guide/account-abstraction) — Conturi programabile pentru operațiunile validatorului tău
