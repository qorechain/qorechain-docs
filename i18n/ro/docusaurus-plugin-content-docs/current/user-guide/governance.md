---
slug: /user-guide/governance
title: Guvernanță
sidebar_label: Guvernanță
sidebar_position: 3
---

# Guvernanță

Acest ghid descrie cum funcționează guvernanța on-chain pe QoreChain: cum sunt numărate voturile, cum să trimiți propuneri și cum să votezi.

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026 și rulează versiunea **v3.2.5** din 29 octombrie 2026 (v3.2.4 din 23 octombrie); testnet-ul rulează **v3.2.6** (din 27 octombrie 2026) — înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** când participi la guvernanță pe mainnet.
:::

:::caution Semnează cu `tx pqc cosign`
Mainnet-ul și testnet-ul cer o semnătură post-cuantică hibridă pentru fiecare tranzacție pe lane-ul Cosmos, așa că comenzile de pe această pagină nu se transmit așa cum sunt scrise. Adaugă `--generate-only > tx.json` la o comandă, apoi rulează `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vezi [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Puterea de vot {#voting-power}

Propunerile sunt numărate pe baza **stake-ului bonded**: fiecare QOR pe care l-ai delegat unui validator bonded contează ca o unitate de putere de vot, fără multiplicator. Dacă nu votezi tu însuți, delegarea ta urmează votul validatorului tău; dacă îți exprimi propriul vot, acesta îl înlocuiește pe cel al validatorului pentru stake-ul tău. O propunere trece atunci când sunt îndeplinite toate condițiile următoare:

| Regulă    | Valoare curentă | Semnificație                                                                |
| --------- | --------------- | --------------------------------------------------------------------------- |
| Cvorum    | 33.4%           | Partea din stake-ul bonded care trebuie să voteze                           |
| Prag      | 50%             | Partea de „yes" dintre voturile care nu se abțin, necesară pentru a trece   |
| Veto      | 33.4%           | Dacă „no with veto" atinge această pondere, propunerea este respinsă și depozitul ei este ars |

Aceste valori au fost citite de pe mainnet la 27 octombrie 2026. Testnet-ul are aceleași depozite, cvorum și praguri, dar perioade de vot mult mai scurte (vot 4 ore, vot accelerat 1 oră); confirmă-le cu `qorechaind query gov params`, deoarece guvernanța le poate modifica.

:::note QDRW este proiectat, dar nu este activ
Designul QoreChain include o formulă de putere de vot **Quadratic Delegation-Reputation Weighted (QDRW)**, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, care ar atenua stake-urile mari și ar pondera reputația. Este implementată în modulul `x/qca`, dar este **dezactivată** pe ambele rețele (`qdrw_enabled` este `false` în `qorechaind query qca config`) și nu face parte din numărătoarea de guvernanță, deci nu afectează niciun vot în prezent. xQORE nu este nici el activ (vezi [Staking xQORE](/user-guide/xqore-staking)).
:::

---

## Trimiterea unei propuneri

Orice deținător de QOR poate trimite o propunere de guvernanță. Este necesar un depozit minim pentru ca propunerea să intre în perioada de vot.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemplu de fișier de propunere** (`proposal.json`). O propunere este o listă de mesaje pe care modulul de guvernanță le execută dacă trece, plus un titlu, un rezumat și un depozit. Aceasta ridică numărul maxim de validatori de la 100 la 150; `authority` este contul de modul al guvernanței (`qorechaind query auth module-account gov`):

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` înlocuiește întregul set de parametri, așa că copiază valorile curente din `qorechaind query staking params` și modifică doar câmpul pe care îl vizezi. O propunere doar text (de semnalizare) folosește `"messages": []`. `qorechaind tx gov draft-proposal` generează un schelet.

---

## Votarea propunerilor

Odată ce o propunere intră în perioada de vot, orice staker poate vota:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Opțiuni de vot:**

| Opțiune        | Descriere                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Susține propunerea                                                                                       |
| `no`           | Se opune propunerii                                                                                      |
| `abstain`      | Recunoaște propunerea fără a lua o poziție                                                               |
| `no_with_veto` | Se opune propunerii și semnalează că nu ar fi trebuit trimisă (arde depozitul dacă pragul este atins)    |

**Exemplu:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Tipuri de propuneri

O propunere conține zero sau mai multe mesaje care se execută dacă trece. Cazuri frecvente:

| Tip                         | Descriere                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**                    | O propunere de semnalizare fără mesaje și fără execuție automată on-chain. Folosită pentru verificări de opinie a comunității. |
| **Modificare de parametri** | Mesajul `MsgUpdateParams` al unui modul, trimis de contul de modul al guvernanței. Înlocuiește întregul set de parametri al acelui modul. |
| **Actualizare software**    | Un mesaj `MsgSoftwareUpgrade` care programează o actualizare coordonată a lanțului la o anumită înălțime de bloc. |
| **Cheltuială comunitară**   | Un mesaj `MsgCommunityPoolSpend` care trimite fonduri din community pool către o adresă de destinatar. |
| **Expedited (accelerată)**  | Setează `"expedited": true` pentru o perioadă de vot mai scurtă, cu un depozit și un prag de trecere mai mari (vezi mai jos). Începând cu v3.2.5 (ambele rețele), o propunere accelerată care nu trece la numărare și se convertește într-o propunere obișnuită păstrează voturile deja exprimate; înainte de v3.2.5 acele voturi se pierdeau. |

---

## Interogarea propunerilor

Listează toate propunerile:

```bash
qorechaind query gov proposals
```

Interoghează o anumită propunere după ID:

```bash
qorechaind query gov proposal <proposal_id>
```

Verifică numărătoarea curentă a voturilor la o propunere:

```bash
qorechaind query gov tally <proposal_id>
```

Vezi propriul tău vot la o propunere:

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Parametri de guvernanță

Interoghează parametrii curenți de guvernanță:

```bash
qorechaind query gov params
```

Parametrii cheie includ:

| Parametru            | Descriere                                                        | Valoare mainnet (27 oct. 2026) |
| -------------------- | ---------------------------------------------------------------- | ------------------------------ |
| `min_deposit`        | Depozitul minim necesar pentru ca o propunere să intre la vot    | 10 QOR (`10000000uqor`)        |
| `max_deposit_period` | Fereastra de timp pentru atingerea depozitului minim             | 2 zile                         |
| `voting_period`      | Durata perioadei de vot odată ce o propunere este activă         | 2 zile                         |
| `quorum`             | Participarea minimă necesară pentru un vot valid                 | 0.334                          |
| `threshold`          | Procentul minim de „yes" pentru a trece (excluzând abținerile)   | 0.5                            |
| `veto_threshold`     | Procentul minim de „no with veto" pentru a respinge și arde depozitul | 0.334                     |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Perioada de vot, pragul de trecere și depozitul pentru propunerile accelerate | 1 zi / 0.667 / 50 QOR |

---

## Guvernanța pe mainnet până acum {#mainnet-history}

Guvernanța mainnet-ului a fost folosită pentru modificări de parametri, decizii privind circuit breaker-ul, upgrade-uri coordonate și, din octombrie 2026, pentru eliberarea unor sume pe care lanțul le-a înregistrat la upgrade-ul v3.2.0. Propunerile 7 până la 14 au trecut pe mainnet în octombrie 2026, inclusiv propunerea 12 (o eliberare ulterioară, aprobată la 21 octombrie), propunerea 13 (upgrade-ul v3.2.4, aplicat la înălțimea 3,742,566 pe 23 octombrie) și propunerea 14 (upgrade-ul v3.2.5, aplicat la înălțimea 3,906,833 pe 29 octombrie 2026); lista și rezultatele se află în [Istoric versiuni](/appendix/version-history#governance-timeline), iar fiecare propunere poate fi citită live la `GET /cosmos/gov/v1/proposals`.

---

:::tip

* Votează înainte de încheierea perioadei de vot; votul tău este numărat doar dacă este exprimat cât timp propunerea se află în perioada de vot.
* Folosește `no_with_veto` cu grijă. Dacă pragul de veto este atins, depozitul propunerii este ars.
* Propunerile care nu ating depozitul minim în perioada de depozit sunt eliminate automat.

:::
