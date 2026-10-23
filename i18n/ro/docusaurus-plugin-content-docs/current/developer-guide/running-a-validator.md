---
slug: /developer-guide/running-a-validator
title: Rularea unui Validator
sidebar_label: Rularea unui Validator
sidebar_position: 9
---

# Rularea unui Validator

Acest ghid acoperă modul de creare a unui validator pe rețeaua QoreChain, înțelegerea designului de clasificare pe pool-uri, înregistrarea unei chei PQC pentru securitate rezistentă la calculatoarele cuantice și monitorizarea nodului tău.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (chain ID EVM **9801**), activ din 7 iunie 2026, care rulează versiunea de nod **v3.2.4** (aplicată prin propunerea de guvernanță 13 la înălțimea 3.742.566, pe 23 octombrie 2026, după v3.2.3 la înălțimea 3.662.051, pe 20 octombrie 2026). Un validator trebuie să ruleze binarul v3.2.4; consultați [Rularea unui nod: Upgrade-uri](/developer-guide/running-a-node#upgrades). Testnet-ul **`qorechain-diana`** (chain ID EVM **9800**, care rulează v3.2.4 din 19 octombrie 2026) este recomandat pentru a-ți repeta configurația înainte de a trece pe rețeaua live. Înlocuiește `--chain-id` cu valoarea corespunzătoare rețelei tale țintă. Timpii de bloc diferă: aproximativ 3,2 s pe mainnet și aproximativ 1,0 s pe testnet, așa că convertește numărul de blocuri în timp separat pentru fiecare rețea.
:::

:::caution Folosește binarul de release, nu un build din sursă
Un validator trebuie să ruleze **`qorechaind` de release** indicat în manifestul live (`https://download.qore.host/mainnet/latest.json`; vezi [Rularea unui Nod](/developer-guide/running-a-node#fetch-the-manifest)). Un binar construit din sursa publică are keeper-i stub și nu are semnatar post-cuantic: nu poate reproduce starea de consens a rețelei și nu poate crea semnătura hibridă de care au nevoie `create-validator` și orice altă tranzacție de pe lane-ul Cosmos (vezi [Construirea din Sursă](/developer-guide/building-from-source)). Începând cu v3.2.3, un binar construit din sursa publică refuză cu totul să pornească pe o rețea publică. Un nod de mainnet nou are nevoie de v3.2.0 sau mai nou; ține ceasul sistemului sincronizat prin NTP, deoarece începând cu v3.2.1 nodul se oprește dacă ceasul lui deviază cu mai mult de 60 de secunde.
:::

:::note Care părți ale acestei pagini sunt active
Producerea de blocuri folosește rotația standard de validatori ponderată după stake, iar slashing-ul și guvernanța folosesc modulele standard Cosmos SDK, cu parametrii afișați mai jos. Logica Triple-Pool CPoS (clasificarea pe pool-uri, selecția propunătorului ponderată pe pool-uri, curba de bonding și slashing-ul progresiv) este implementată în modulul `x/qca`, iar parametrii ei sunt on-chain, dar **nu este încă conectată la producerea de blocuri, la recompense sau la slashing**. Secțiunile despre aceste subiecte descriu designul; nu planifica în funcție de apartenența la un pool sau de reputație, care nu îți modifică astăzi cota de propuneri de bloc sau recompensele.
:::

---

## Cerințe preliminare

* Un nod `qorechaind` de release complet sincronizat (vezi [Conectarea la Mainnet](/getting-started/connecting-to-mainnet), sau [Conectarea la Testnet](/getting-started/connecting-to-testnet) pentru a repeta configurația)
* O **cheie PQC ML-DSA-87 înregistrată** pe contul operatorului (vezi [Înregistrarea Cheii PQC](#pqc-key-registration)) — `create-validator` are nevoie de semnătura hibridă
* Un cont alimentat cu cel puțin **100.000 QOR** (100.000.000.000 uqor) pentru auto-delegarea inițială — acest minim este impus on-chain, iar `create-validator` este respins sub acest prag
* O **acordare `validator_operator`** activă pe adresa ta de operator, emisă prin [Validator Program](/dashboard/tools-hub#validator-application) (aplici, ești selectat, plătești taxa de program de $1,000); vezi nota de mai jos. Fără ea, `create-validator` eșuează cu `ErrUnauthorized`, indiferent cât de mult QOR auto-bondezi
* Familiaritate cu modelul [Staking și Delegare](/user-guide/staking-and-delegation)

---

## Crearea unui Validator

### Acordarea de operator: `validator_operator` {#validator-license-gate}

`create-validator` este condiționat de două verificări independente, ambele impuse on-chain, și ai nevoie de amândouă — un auto-bond mare, de unul singur, nu este suficient:

1. **Auto-bond minim de 100.000 QOR.**
2. **O acordare `validator_operator` activă** pe contul care trimite tranzacția.

Acordarea este emisă on-chain de QoreChain Association prin **Validator Program**: aplici în [Tools Hub](/dashboard/tools-hub#validator-application), rulezi un validator pe testnet-ul diana pentru perioada de probă de 14 zile și, odată selectat, plătești **taxa de program de $1,000**; acordarea este apoi semnată în loturi pentru adresa de operator din aplicația ta. Verifică-o pe a ta cu `GET /qorechain/license/v1/check/{grantee}/validator_operator`. Câmpul `expires_at` al unei licențe este o **înălțime de bloc**, nu o dată sau o durată — `0` înseamnă fără expirare. Dacă lipsește sau a expirat, `create-validator` eșuează cu `ErrUnauthorized`, indiferent cât de mult auto-bondezi; acesta este cel mai frecvent motiv pentru care o încercare bine finanțată eșuează și pare inexplicabilă. Această poartă există special pentru că lane-ul de execuție EVM nu o poate vedea sau impune (un singur decorator ante acolo ar ocoli-o complet) — este unul dintre motivele pentru care staking-ul și validarea rămân exclusiv pe lane-ul Nativ.

Creează un fișier `validator.json` (forma bazată pe flag-uri a fost eliminată în SDK-ul actual):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Apoi generează și semnează tranzacția (are nevoie de semnătura hibridă, ca orice tranzacție de pe lane-ul Cosmos; vezi [Comenzi de Tranzacție](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Pragul minim de taxe al rețelei este de **0,1 uqor per unitate de gas**, deci o limită de gas de 600.000 necesită cel puțin 60.000 uqor.

| Câmp `validator.json`          | Descriere                                                |
| ------------------------------- | --------------------------------------------------------- |
| `amount`                       | Suma auto-delegată — **minimum 100.000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Cheia publică de consens a validatorului (ed25519)         |
| `moniker`                      | Numele lizibil al validatorului tău                        |
| `commission-rate`              | Rata de comision inițială (ex., 0.10 = 10%)                |
| `commission-max-rate`          | Rata maximă de comision (imuabilă după creare)              |
| `commission-max-change-rate`   | Rata maximă de schimbare zilnică a comisionului             |
| `min-self-delegation`          | Numărul minim de token-uri pe care operatorul trebuie să le auto-delege |

După confirmarea tranzacției, verifică validatorul tău:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Clasificarea pe Pool-uri

:::note Design, încă neactiv în producerea de blocuri
Clasificarea pe pool-uri de mai jos este designul `x/qca`. Parametrii ei sunt on-chain (`qorechaind query qca config`), dar propunătorii de blocuri nu sunt încă aleși după pool, iar pool-urile nu modifică încă recompensele sau slashing-ul.
:::

Modulul `x/qca` (Quantum Consensus Allocation) al QoreChain definește un **sistem de clasificare pe trei pool-uri**. La fiecare **1.000 de blocuri** (aproximativ 54 de minute la blocurile de 3,2 s ale mainnet-ului), validatorii urmează să fie reclasificați într-unul dintre cele trei pool-uri, în funcție de reputația și stake-ul lor:

| Pool                                  | Criteriu                                                     | Alocare de blocuri |
| -------------------------------------- | ------------------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake)   | Reputație >= percentila 70 ȘI stake >= mediana                | 40% din blocuri      |
| **DPoS** (Delegated Proof-of-Stake)    | Delegare totală >= 10.000 QOR                                  | 35% din blocuri      |
| **PoS** (Proof-of-Stake)               | Toți ceilalți validatori activi                                | 25% din blocuri      |

În design, propunătorii de blocuri din cadrul fiecărui pool sunt selectați prin selecție ponderată aleatorie, proporțională cu stake-ul lor efectiv, astfel încât atât validatorii cu reputație ridicată, cât și cei cu delegare ridicată primesc o reprezentare corectă, permițând în același timp validatorilor mai mici să participe.

### Interogarea Configurației Pool-urilor

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Prin JSON-RPC:

> **Încă nu este servit:** nicio versiune de nod lansată nu servește namespace-ul JSON-RPC `qor_`, așa că acest apel returnează `-32601` (method not found) pe toate endpoint-urile publice astăzi. Vezi [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

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

:::note Design, încă neactiv
Curba de bonding este implementată în `x/qca`, dar nu este încă conectată la distribuirea recompenselor; recompensele de staking urmează astăzi modulul standard de distribuție. Formula de mai jos este designul.
:::

Recompensa de staking pentru un validator este concepută să fie determinată de o curbă de bonding care încorporează mai mulți factori:

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

* **Bonusul pentru durata loialității:** designul adaugă un termen logaritmic pentru timpul de staking continuu.
* **Factorul de calitate al reputației:** Variază de la 0.75 (reputație slabă) la 1.25 (reputație excelentă). Ponderile formulei de reputație sunt on-chain (`qorechaind query reputation params`).
* **Multiplicatorul fazei protocolului:** Se ajustează pe măsură ce rețeaua se maturizează prin diferite faze (bootstrap, creștere, maturitate).

---

## Slashing {#slashing}

Penalizările de bază pentru încălcări, interogabile live și valabile la momentul redactării:

```bash
qorechaind query slashing params
```

| Parametru | Valoare |
| --- | --- |
| Fereastra de blocuri semnate | 10.000 de blocuri (aproximativ 8,9 ore pe mainnet la 3,2 s per bloc; mai puțin pe testnet) |
| Minim semnat per fereastră | 5% (`min_signed_per_window` = 0.05): un validator este băgat la închisoare (jailed) când semnează **mai puțin de 5%** din ultimele 10.000 de blocuri, adică atunci când ratează mai mult de 95% |
| Durata de închisoare (jail) pentru downtime | 600 de secunde (10 minute) |
| Fracțiunea de slash pentru downtime | 1% din stake |
| Fracțiunea de slash pentru double-sign | 5% din stake |

Băgarea la închisoare (jailing) este un timeout fix de 10 minute cu o penalizare fixă. Unbonding-ul durează 21 de zile (1.814.400 s), setul activ conține cel mult 100 de validatori (`max_validators`), iar fiecare delegator poate avea cel mult 7 intrări de unbonding (`max_entries`). Modelul progresiv de mai jos este un design separat, care ar adăuga peste acestea consecințe suplimentare, escaladate, pentru încălcările repetate; nu este încă conectat.

## Slashing Progresiv

:::note Design, încă neactiv
Slashing-ul progresiv este implementat în `x/qca`, dar nu este conectat la slashing: penalizările în vigoare sunt valorile standard `x/slashing` din tabelul de mai sus. Parametrii de mai jos reprezintă designul (`qorechaind query qca config`).
:::

Designul de slashing progresiv escaladează penalizările pentru cei care încalcă regulile în mod repetat, permițând în același timp validatorilor să își revină în timp:

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

3. **Numărul efectiv scade în timp.** Numărul efectiv scade cu un timp de înjumătățire de 100.000 de blocuri (aproximativ 3,7 zile la blocurile de 3,2 s ale mainnet-ului), permițând validatorilor să își revină după o perioadă de comportament corect.

4. **Evenimente singulare versus încălcări repetate.** Un singur eveniment accidental de downtime are ca rezultat o penalizare minoră, în timp ce încălcările repetate declanșează consecințe cu creștere exponențială.

---

## Înregistrarea Cheii PQC {#pqc-key-registration}

Înregistrează-ți **cheia publică post-cuantică (PQC)** — ML-DSA-87 — **înainte** de a rula `create-validator`, și cât mai devreme: panoul [Validator Readiness](/dashboard/tools-hub#validator-application) o verifică din momentul în care aplici. Acest lucru **nu este opțional și nu este automat**: chain-ul impune o semnătură hibridă PQC pe fiecare tranzacție de pe lane-ul Cosmos, `MsgCreateValidator` nu se numără printre tipurile de mesaje exceptate, iar niciun cont nu își înregistrează cheia automat: înregistrarea este o tranzacție explicită pe care fiecare cont (inclusiv operatorii de validatori) trebuie să o trimită el însuși, din timp. Generează mai întâi cheia:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` atașează o **dovadă de posesie** (proof of possession): cheia semnează `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)`, iar chain-ul o verifică, astfel încât nimeni nu poate înregistra o cheie publică a cărei jumătăți private nu o deține. În v3.2.3 este opțională și recomandată. Începând cu v3.2.4 (mainnet din 23 octombrie 2026, testnet din 19 octombrie 2026), înregistrarea contului raportează și dacă o dovadă a fost verificată (`possession_proven`, în `GET /qorechain/pqc/v1/account/{address}`).

:::note Ce a schimbat v3.2.3 la înregistrarea cheilor
* Un cont **fără** cheie înregistrată poate trimite doar înregistrarea însăși: orice altă tranzacție care poartă o extensie de semnătură hibridă este refuzată. Înregistrează mai întâi cheia, apoi semnează tot restul cu `tx pqc cosign`.
* Cheile `classical_only`, goale și degenerate sunt refuzate la înregistrare.
* Odată ce un cont deține o cheie, întreținerea ulterioară a cheii (rotație, migrare, reînregistrare) trebuie să fie ea însăși semnată hibrid și nu poate fi trimisă prin `authz`.
* `tx pqc gen-key` nu suprascrie niciodată un fișier de cheie existent.
:::

| Parametru      | Descriere                                              |
| -------------- | --------------------------------------------------------- |
| `dilithium5`   | Algoritm (ML-DSA-87)                                       |
| `<pubkey-hex>` | Cheie publică ML-DSA-87 de 2592 de bytes, codificată hex   |
| `hybrid`       | Tipul cheii (hybrid = atât clasic, cât și PQC)             |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` este forma legacy echivalentă pentru Dilithium-5.)

:::caution Setează `--gas` explicit
Cheia publică ML-DSA-87 are 2.592 de bytes, iar scrierea ei on-chain poate depăși limita implicită de gas de 200.000 (înregistrările pe mainnet au folosit între 220.000 și 350.000 de gas). Fără `--gas 600000` (sau mai mult), tranzacția poate eșua cu o eroare opacă `out of gas`. Taxa trebuie să fie cel puțin limita de gas înmulțită cu 0,1 uqor, deci `--gas 600000` necesită `--fees 60000uqor` sau mai mult.
:::

Verifică înregistrarea:

```bash
qorechaind query pqc account <account-address>
```

Fișierul de cheie din `~/.qorechaind/pqc/` este cheia de semnare post-cuantică a contului: fă-i backup ca la mnemonic și ține-l, pe cât posibil, departe de mașina care rulează cheia de consens. Vezi [Semnarea Post-Cuantică](/developer-guide/post-quantum-signing#pqc-key-registration) pentru recuperare și rotație.

---

## Monitorizare

### Metrici Prometheus

QoreChain expune metrici Prometheus pe portul **26660**:

```
http://localhost:26660/metrics
```

Activează endpoint-ul cu `prometheus = true` în secțiunea `[instrumentation]` din `config.toml`. Nodul expune metricile standard ale motorului de consens (înălțimea blocului, rundele de consens, setul de validatori, peer-i, mempool); vezi ce servește nodul tău cu `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`. Sănătatea semnării per validator se citește cel mai fiabil chiar din chain (vezi Verificările de sănătate de mai jos), deoarece evidența proprie a chain-ului este cea care decide închisoarea (jailing).

### Interogarea Parametrilor de Reputație

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Prin JSON-RPC:

> **Încă nu este servit:** nicio versiune de nod lansată nu servește namespace-ul JSON-RPC `qor_`, așa că acest apel returnează `-32601` (method not found) pe toate endpoint-urile publice astăzi. Vezi [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

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
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Bune Practici Operaționale

1. **Folosește o arhitectură cu noduri sentinel (sentry node).** Rulează-ți validatorul în spatele nodurilor sentinel pentru a-l proteja de atacurile DDoS. Expune public doar nodurile sentinel.

2. **Configurează alertare.** Configurează alerte pentru blocuri ratate, uptime scăzut și reporniri neașteptate. Câteva blocuri ratate sunt normale; ratările susținute vor declanșa slashing.

3. **Menține un uptime ridicat.** Downtime-ul susținut duce la băgarea validatorului la închisoare (mai puțin de 5% din ultimele 10.000 de blocuri semnate) și la slashing; vezi [Slashing](#slashing).

4. **Menține software-ul actualizat.** Urmărește lansările QoreChain și aplică actualizările prompt. Coordonează-te cu comunitatea de validatori pentru upgrade-urile de chain.

5. **Asigură-ți cheile.** Folosește un modul de securitate hardware (HSM) sau un semnatar la distanță (remote signer) pentru cheia de consens a validatorului. Nu stoca niciodată cheile pe același sistem cu nodul.

6. **Înregistrează mai întâi o cheie PQC.** Contul operatorului are nevoie de o cheie ML-DSA-87 înregistrată înainte de a putea crea un validator sau de a trimite orice altă tranzacție pe lane-ul Cosmos.

7. **Ține ceasul sincronizat.** Rulează un client NTP; începând cu v3.2.1 nodul se oprește dacă ceasul lui deviază cu mai mult de 60 de secunde.

---

## Referință Comenzi Validator

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Pragul minim de taxe al rețelei este de 0,1 uqor per unitate de gas. Un cont de operator care **nu** are o cheie PQC înregistrată poate totuși trimite `unjail` în mod clasic; odată ce o cheie este înregistrată, fiecare tranzacție (inclusiv unjail) are nevoie de semnătura hibridă.

---

## Validarea Rețelelor Conectate {#connected-networks}

:::caution Nicio rețea conectată nu este activă încă
Modulul bridge este implementat pe mainnet și pe testnet, dar **nicio rută bridge nu este activă**: toate cele 37 de configurații de chain au statusul `pending`, nu este înregistrat niciun validator bridge, nicio operațiune bridge nu a fost creată vreodată și nu există canale IBC. Framework-ul de mai jos descrie designul; astăzi nu există nimic de validat pe o rețea conectată.
:::

Designul (începând cu versiunea de chain **v3.1.80**) permite unui validator QoreChain să ajute și la validarea rețelelor conectate prin [bridge](/architecture/bridge-architecture). Este **condiționat de licență și opțional**:

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

* [Rularea unui Nod](/developer-guide/running-a-node) — Instalează binarul de release, state sync și setările nodului
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementează contracte inteligente pe QoreChain
* [Semnarea Post-Cuantică](/developer-guide/post-quantum-signing) — Înregistrarea cheii, recuperare și rotație
