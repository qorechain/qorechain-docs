---
slug: /developer-guide/running-a-validator
title: Rularea unui Validator
sidebar_label: Rularea unui Validator
sidebar_position: 9
---

# Rularea unui Validator

Acest ghid acoperă modul de creare a unui validator pe rețeaua QoreChain, înțelegerea sistemului de clasificare pe pool-uri, înregistrarea unei chei PQC pentru securitate rezistentă la calculatoarele cuantice și monitorizarea nodului tău.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (chain ID EVM **9801**), activ din 7 iunie 2026, care rulează versiunea de chain **v3.1.92**. Testnet-ul **`qorechain-diana`** (chain ID EVM **9800**) este recomandat pentru a-ți repeta configurația înainte de a trece pe rețeaua live. Înlocuiește `--chain-id` cu valoarea corespunzătoare rețelei tale țintă.
:::

---

## Cerințe preliminare

* Un nod `qorechaind` complet sincronizat (vezi [Conectarea la Testnet](/getting-started/connecting-to-testnet))
* Un cont alimentat cu cel puțin **1.000 QOR** (1.000.000.000 uqor) pentru auto-delegarea inițială
* Familiaritate cu modelul [Staking și Delegare](/user-guide/staking-and-delegation)

---

## Crearea unui Validator

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

| Parametru                      | Descriere                                                |
| ------------------------------ | --------------------------------------------------------- |
| `--amount`                     | Suma auto-delegată (stake minim)                          |
| `--pubkey`                     | Cheia publică de consens a validatorului (ed25519)         |
| `--moniker`                    | Numele lizibil al validatorului tău                        |
| `--commission-rate`            | Rata de comision inițială (ex., 0.10 = 10%)                |
| `--commission-max-rate`        | Rata maximă de comision (imuabilă după creare)              |
| `--commission-max-change-rate` | Rata maximă de schimbare zilnică a comisionului             |
| `--min-self-delegation`        | Numărul minim de token-uri pe care operatorul trebuie să le auto-delege |

După confirmarea tranzacției, verifică validatorul tău:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificarea pe Pool-uri

QoreChain folosește un **sistem de clasificare pe trei pool-uri**, gestionat de modulul `x/qca` (Quantum Consensus Allocation). La fiecare **1.000 de blocuri**, validatorii sunt reclasificați într-unul dintre cele trei pool-uri, în funcție de reputația și stake-ul lor:

| Pool                                  | Criteriu                                                     | Alocare de blocuri |
| -------------------------------------- | ------------------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake)   | Reputație >= percentila 70 ȘI stake >= mediana                | 40% din blocuri      |
| **DPoS** (Delegated Proof-of-Stake)    | Delegare totală >= 10.000 QOR                                  | 35% din blocuri      |
| **PoS** (Proof-of-Stake)               | Toți ceilalți validatori activi                                | 25% din blocuri      |

În cadrul fiecărui pool, propunătorii de blocuri sunt selectați prin **selecție ponderată aleatorie**, proporțională cu stake-ul lor efectiv. Clasificarea asigură că atât validatorii cu reputație ridicată, cât și cei cu delegare ridicată primesc o reprezentare corectă, permițând în același timp validatorilor mai mici să participe.

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

## Curba de Bonding

Recompensa de staking pentru un validator este determinată de o curbă de bonding care încorporează mai mulți factori:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                    |
| --------- | -------------------------------------------------------------- |
| `R`       | Suma recompensei                                                |
| `beta`    | Rata de bază a recompensei                                      |
| `S`       | Stake efectiv                                                   |
| `alpha`   | Constanta de scalare a loialității                               |
| `L`       | Durata loialității (timpul de staking continuu)                  |
| `Q(r)`    | Factorul de calitate al reputației, interval \[0.75 - 1.25]      |
| `P(t)`    | Multiplicatorul fazei protocolului (se ajustează pe parcursul ciclului de viață al rețelei) |

**Concluzii-cheie:**

* **Bonusul pentru durata loialității:** Validatorii care fac staking continuu primesc recompense în creștere prin termenul logaritmic de loialitate. Acest lucru încurajează angajamentul pe termen lung.
* **Factorul de calitate al reputației:** Variază de la 0.75 (reputație slabă) la 1.25 (reputație excelentă). Reputația este calculată din uptime, propuneri reușite, participare comunitară și calitatea validării tranzacțiilor.
* **Multiplicatorul fazei protocolului:** Se ajustează pe măsură ce rețeaua se maturizează prin diferite faze (bootstrap, creștere, maturitate).

---

## Slashing

Penalizările de bază pentru încălcări, interogabile live și valabile la momentul redactării:

```bash
qorechaind query slashing params
```

| Parametru | Valoare |
| --- | --- |
| Fereastra de blocuri semnate | 10.000 de blocuri (aproximativ 6 ore pentru a se acumula) |
| Minim semnat per fereastră | 95% (sub acest prag validatorul este băgat la închisoare/jailed) |
| Durata de închisoare (jail) pentru downtime | 600 de secunde (10 minute) |
| Fracțiunea de slash pentru downtime | 1% din stake |
| Fracțiunea de slash pentru double-sign | 5% din stake |

Băgarea la închisoare (jailing) este un timeout fix de 10 minute cu o penalizare fixă — este separată de modelul progresiv de mai jos, care adaugă consecințe suplimentare, escaladate, peste încălcările repetate, pe un orizont de timp mai lung.

## Slashing Progresiv

QoreChain folosește un model de **slashing progresiv**, care escaladează penalizările pentru cei care încalcă regulile în mod repetat, permițând în același timp validatorilor să își revină în timp:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametru                       | Valoare        |
| --------------------------------- | -------------- |
| Penalizare maximă per eveniment   | 33% din stake  |
| Timp de înjumătățire (decay)      | 100.000 blocuri |
| Severitate downtime                | 1.0            |
| Severitate double-sign              | 2.0            |
| Severitate atac light client        | 3.0            |

1. **Fiecare încălcare incrementează numărul efectiv.** Fiecare încălcare (downtime, double-signing etc.) crește numărul efectiv al validatorului, ceea ce afectează penalizările viitoare.

2. **Penalizarea escaladează exponențial.** Penalizarea escaladează în funcție de numărul efectiv, conform formulei de mai sus, astfel încât cei care încalcă regulile în mod repetat se confruntă cu penalizări mult mai mari.

3. **Numărul efectiv scade în timp.** Numărul efectiv scade cu un timp de înjumătățire de 100.000 de blocuri (\~7 zile la blocuri de 6s), permițând validatorilor să își revină după o perioadă de comportament corect.

4. **Evenimente singulare versus încălcări repetate.** Un singur eveniment accidental de downtime are ca rezultat o penalizare minoră, în timp ce încălcările repetate declanșează consecințe cu creștere exponențială.

---

## Înregistrarea Cheii PQC {#pqc-key-registration}

Înregistrează-ți **cheia publică post-cuantică (PQC)** — ML-DSA-87 — **înainte** de a solicita o licență de validator sau de a rula `create-validator`. Acest lucru **nu este opțional și nu este automat**: chain-ul impune o semnătură hibridă PQC pe fiecare tranzacție de pe calea cosmos, `MsgCreateValidator` nu se numără printre tipurile de mesaje exceptate, iar — spre deosebire de un cont obișnuit, care își înregistrează cheia automat la prima tranzacție — un validator trebuie să ruleze el însuși această comandă, pe propriul nod, din timp.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas 600000 \
  -y
```

| Parametru      | Descriere                                              |
| -------------- | --------------------------------------------------------- |
| `<pubkey-hex>` | Cheie publică ML-DSA-87 de 2592 de bytes, codificată hex   |
| `hybrid`       | Modul de înregistrare (hybrid = atât clasic, cât și PQC)   |

:::caution Setează `--gas` explicit
Cheia publică ML-DSA-87 are 2.592 de bytes, iar scrierea ei pe chain depășește limita implicită de gas de 200.000. Fără `--gas 600000` (sau mai mult), tranzacția eșuează cu o eroare opacă `out of gas in location: WritePerByte`.
:::

Verifică înregistrarea:

```bash
qorechaind query pqc key <account-address>
```

---

## Monitorizare

### Metrici Prometheus

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Metrici-cheie de monitorizat:

| Metrică                          | Descriere                                                |
| --------------------------------- | ------------------------------------------------------------ |
| `qorechain_missed_blocks_total`   | Numărul total de blocuri ratate de validatorul tău            |
| `qorechain_validator_uptime`      | Procentul de uptime pe ultimele N blocuri                     |
| `qorechain_reputation_score`      | Scorul de reputație curent                                    |
| `qorechain_pool_classification`   | Alocarea curentă de pool (0=PoS, 1=DPoS, 2=RPoS)               |
| `qorechain_consecutive_signed`    | Blocuri consecutive semnate                                    |
| `consensus_height`                | Înălțimea curentă a blocului                                    |
| `consensus_rounds`                | Rundele de consens pentru înălțimea curentă                     |

### Interogarea Scorului de Reputație

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

### Verificări de sănătate (Health Checks)

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Bune Practici Operaționale

1. **Folosește o arhitectură cu noduri sentinel (sentry node).** Rulează-ți validatorul în spatele nodurilor sentinel pentru a-l proteja de atacurile DDoS. Expune public doar nodurile sentinel.

2. **Configurează alertare.** Configurează alerte pentru blocuri ratate, uptime scăzut și repornirii neașteptate. Câteva blocuri ratate sunt normale; ratările susținute vor declanșa slashing.

3. **Menține un uptime ridicat.** Sistemul de reputație recompensează uptime-ul constant. Downtime-ul prelungit degradează factorul tău de calitate al reputației, reducând recompensele.

4. **Menține software-ul actualizat.** Urmărește lansările QoreChain și aplică actualizările prompt. Coordonează-te cu comunitatea de validatori pentru upgrade-urile de chain.

5. **Asigură-ți cheile.** Folosește un modul de securitate hardware (HSM) sau un semnatar la distanță (remote signer) pentru cheia de consens a validatorului. Nu stoca niciodată cheile pe același sistem cu nodul.

6. **Înregistrează o cheie PQC.** Protejează-ți validatorul pe termen lung împotriva amenințărilor cuantice prin înregistrarea unei chei ML-DSA-87.

7. **Monitorizează-ți pool-ul.** Urmărește-ți clasificarea de pool la fiecare 1.000 de blocuri. Îmbunătățirea reputației te poate muta din PoS în RPoS, mărind semnificativ oportunitățile de propunere de blocuri.

---

## Referință Comenzi Validator

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

## Validarea Rețelelor Conectate {#connected-networks}

Începând cu versiunea de chain **v3.1.80**, un validator QoreChain poate ajuta și la validarea rețelelor conectate prin [bridge](/architecture/bridge-architecture). Acest lucru este **condiționat de licență și opțional**:

1. **Deții licența.** Validatorul trebuie să dețină o licență activă `validator_<chain>` (sau `qcb_bridge`) pentru rețeaua țintă. Orchestratorul refuză să pornească un client extern fără aceasta (fail-closed).
2. **Activarea provizionează automat clientul.** Când licența este activată, QoreChain provizionează clientul rețelei corespunzătoare pe nodul tău — descărcând clientul fixat (pinned), generând configurația acestuia și rulându-l sub orchestrarea QoreChain. Nimic nu este descărcat înainte de activare.
3. **Furnizează cheile și stake-ul rețelei respective.** Cheile de validator/stake și cheile de semnare ale rețelei externe sunt **furnizate de operator** pentru fiecare rețea; QoreChain oferă framework-ul de driver și poarta de licență impusă (enforced), nu stake-ul tău pe chain-ul extern.

Există drivere pentru toate cele **37 de rețele bridge**, clasificate în funcție de modul în care poate participa un validator:

| Clasă | Participare | Exemple |
| ----- | ------------ | -------- |
| Validator fără permisiune (permissionless) | Face stake și rulează | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonat / ales / cu admitere | Face stake, condiționat de un plafon sau de o alegere | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nod complet L2 | Rulează un nod complet (fără staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Fără staking / listă de încredere | Observă / participă fără staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Fixările (pin-urile) de versiune ale clienților sunt best-effort; verifică lansarea clientului upstream pentru rețeaua ta țintă înainte de o activare în producție.
:::

## Pașii Următori

* [Construirea din Sursă](/developer-guide/building-from-source) — Construiește binarul `qorechaind`
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementează contracte inteligente pe QoreChain
* [Abstractizarea Contului](/developer-guide/account-abstraction) — Conturi programabile pentru operațiunile validatorului tău

