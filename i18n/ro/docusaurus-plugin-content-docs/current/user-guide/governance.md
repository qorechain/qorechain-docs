---
slug: /user-guide/governance
title: Guvernanță
sidebar_label: Guvernanță
sidebar_position: 3
---

# Guvernanță

Acest ghid descrie cum funcționează guvernanța on-chain pe QoreChain, inclusiv sistemul de vot Quadratic Delegation-Reputation Weighted (QDRW), cum să trimiți propuneri și cum să votezi.

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ de la 7 iunie 2026, rulând versiunea de lanț **v3.1.82** — înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** când participi la guvernanță pe mainnet.
:::

---

## Puterea de vot: formula QDRW

QoreChain folosește formula **Quadratic Delegation-Reputation Weighted (QDRW)** pentru a calcula puterea de vot. Acest sistem previne dominația balenelor, recompensând în același timp participanții care au obținut scoruri de reputație ridicate și care s-au angajat în guvernanță prin staking xQORE.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variabilă                 | Descriere                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Puterea de vot efectivă                                                                                                         |
| `staked`                  | Totalul tokenilor QOR puse în stake de către votant                                                                             |
| `xQORE`                   | Cantitatea de tokeni de guvernanță xQORE deținuți (vezi [Staking xQORE](/user-guide/xqore-staking))                            |
| `r`                       | Scorul de reputație al votantului, normalizat la \[0, 1]                                                                        |
| `ReputationMultiplier(r)` | Funcție sigmoidă care mapează reputația la un multiplicator în intervalul \[0.5, 2.0]                                          |

### Proprietăți cheie

* **Amortizare cuadratică:** Un deținător cu un stake de 100x față de alt votant câștigă doar \~10x putere de vot, nu 100x. Acest lucru asigură că influența în guvernanță crește sub-liniar cu averea.
* **Bonus xQORE:** Tokenii xQORE contează cu **greutate 2x** în interiorul rădăcinii pătrate, oferind un avantaj semnificativ participanților angajați în guvernanță.
* **Multiplicator de reputație:** Mapează scorul de reputație al votantului de la \[0, 1] la un multiplicator în \[0.5, 2.0] folosind o curbă sigmoidă. Participanții cu reputație ridicată își pot dubla puterea de vot efectivă, în timp ce participanții cu reputație scăzută își văd influența înjumătățită.

---

## Trimiterea unei propuneri

Orice deținător de QOR poate trimite o propunere de guvernanță. Este necesar un depozit minim pentru ca propunerea să intre în perioada de vot.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu de fișier de propunere** (`proposal.json`):

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Votarea propunerilor

Odată ce o propunere intră în perioada de vot, orice staker poate vota:

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Opțiuni de vot:**

| Opțiune        | Descriere                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Susține propunerea                                                                                     |
| `no`           | Se opune propunerii                                                                                      |
| `abstain`      | Recunoaște propunerea fără a lua o poziție                                                       |
| `no_with_veto` | Se opune propunerii și semnalează că nu ar fi trebuit trimisă (arde depozitul dacă pragul este atins) |

**Exemplu:**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Tipuri de propuneri

QoreChain suportă următoarele tipuri de propuneri de guvernanță:

| Tip                  | Descriere                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Text**             | O propunere de semnalizare fără execuție automată on-chain. Folosită pentru verificări de opinie a comunității. |
| **Modificare de parametru** | Modifică unul sau mai mulți parametri de protocol on-chain (de exemplu, numărul maxim de validatori, rata de emisie).        |
| **Actualizare software** | Programează o actualizare coordonată a lanțului la o anumită înălțime de bloc.                              |
| **Cheltuială comunitară**  | Solicită fonduri din trezoreria comunității pentru o adresă de destinatar specificată.                   |

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

| Parametru            | Descriere                                                        |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Depozitul minim necesar pentru ca o propunere să intre la vot   |
| `max_deposit_period` | Fereastra de timp pentru atingerea depozitului minim            |
| `voting_period`      | Durata perioadei de vot odată ce o propunere este activă        |
| `quorum`             | Participarea minimă necesară pentru un vot valid                |
| `threshold`          | Procentul minim de „yes" pentru a trece (excluzând abținerile)  |
| `veto_threshold`     | Procentul minim de „no with veto" pentru a respinge și arde depozitul |

---

:::tip

* Construiește-ți reputația înainte de voturile majore de guvernanță pentru a maximiza multiplicatorul puterii tale de vot.
* Blochează QOR în xQORE pentru un bonus de greutate 2x în guvernanță în interiorul formulei QDRW.
* Folosește `no_with_veto` cu grijă. Dacă pragul de veto este atins, depozitul propunerii este ars.
* Propunerile care nu ating depozitul minim în perioada de depozit sunt eliminate automat.

:::
