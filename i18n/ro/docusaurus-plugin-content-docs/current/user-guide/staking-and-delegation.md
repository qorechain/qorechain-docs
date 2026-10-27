---
slug: /user-guide/staking-and-delegation
title: Staking și Delegare
sidebar_label: Staking și Delegare
sidebar_position: 2
---

# Staking și Delegare

Acest ghid acoperă modul de delegare a token-urilor QOR către validatori, redelegarea între validatori, debondarea stake-ului, revendicarea recompenselor și înțelegerea părților din designul de staking al QoreChain care sunt active astăzi.

:::note
Comenzile de mai jos folosesc rețeaua de test **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ din 7 iunie 2026 și rulează versiunea **v3.2.4** (aplicată pe 23 octombrie 2026); testnet-ul rulează v3.2.6 (din 27 octombrie 2026). Înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când faceți staking pe mainnet.
:::

:::caution Semnați cu `tx pqc cosign`
Mainnet-ul și testnet-ul cer o semnătură post-cuantică hibridă pe fiecare tranzacție din banda Cosmos, așa că comenzile de pe această pagină nu se difuzează așa cum sunt scrise. Adăugați `--generate-only > tx.json` la o comandă, apoi rulați `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Vezi [Semnarea hibridă](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) și [Dashboard-ul](/dashboard/staking-and-validators) fac această semnare pentru dumneavoastră.
:::

## Există o perioadă de blocare? {#lock-in-period}

**Pentru delegarea obișnuită**, nu — nu există un termen de ales, pentru că staking-ul nu se vinde în durate fixe aici, așa cum se întâmplă adesea pe un exchange. Delegarea rămâne activă, cu recompense care curg din blocul următor, atât timp cât doriți, până când alegeți să anulați delegarea (undelegate); nimic nu expiră și nimic nu trebuie reînnoit. **Perioada de debondare de 21 de zile** la care se face referire pe tot parcursul acestui ghid nu este o blocare pe care o acceptați din start — ea începe doar din momentul în care *cereți* anularea delegării și se aplică doar la QOR-ul pe care îl retrageți. Mutarea unei delegări între validatori (redelegate) evită complet această așteptare, deoarece stake-ul nu părăsește niciodată pool-ul bonded. Termenul de „loialitate" din [curba de bonding](#bonding-curve) de mai jos face parte din designul QoreChain, dar **nu este aplicat de chain-ul live astăzi**, deci cât timp rămâneți delegat nu modifică rata dumneavoastră de recompensă. O formă opțională de staking, cu blocare în timp, este disponibilă pe mainnet din v3.2.4 (23 octombrie 2026) și pe testnet din 19 octombrie 2026; primiți o blocare doar dacă o creați. Vezi [Staking cu blocare în timp (v3.2.4)](#time-locked-staking).

Aceasta descrie comportamentul actual al mainnet-ului, nu o garanție permanentă — o perioadă minimă de staking este un parametru pe care guvernanța l-ar putea introduce pe viitor, la fel cum orice alt parametru de staking de pe această pagină poate fi modificat prin vot. Dacă se va întâmpla vreodată acest lucru, portofelul va afișa așteptarea rezultată (orice minim plus debondarea de 21 de zile) înainte de a confirma o delegare, iar această pagină va fi actualizată în consecință.

---

## Delegarea token-urilor

Delegați QOR către un validator pentru a participa la securitatea rețelei. Delegatorii primesc o parte din recompensele pe care le câștigă validatorul, minus comisionul validatorului:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemplu:** Delegați 100 QOR către un validator:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Redelegarea

Mutați delegarea de la un validator la altul fără a aștepta perioada de debondare:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemplu:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Redelegarea nu are **nicio penalizare și nicio blocare proprie** — stake-ul nu părăsește niciodată pool-ul bonded, nu încetează niciodată să câștige recompense și are efect imediat. Nu este supusă deloc perioadei de debondare de 21 de zile; aceasta se aplică doar la `unbond`. Se aplică o regulă standard de staking: stake-ul pe care tocmai l-ați mutat **către** un validator nu poate fi redelegat din nou **de la** acel validator până când prima mutare nu a ajuns la maturitate (21 de zile); între timp îl puteți totuși debonda (`unbond`) sau puteți redelega restul stake-ului dumneavoastră.

:::caution Limita reală este un număr, nu un cooldown
Un delegator poate avea cel mult **7 înregistrări de redelegare simultane în curs** pentru exact aceeași rută (delegator, validator sursă, validator destinație) — fiecare înregistrare se finalizează pe cont propriu pe măsură ce ajunge la maturitate, eliberând un loc. Aceasta este un plafon pe care utilizarea normală practic nu îl atinge niciodată, nu o regulă generală de tipul „așteptați înainte de a redelega din nou".
:::

---

## Debondarea

Retrageți token-urile delegate de la un validator. Debondarea durează **21 de zile** până la finalizare, perioadă în care token-urile nu câștigă recompense și nu pot fi transferate.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemplu:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

După perioada de debondare de 21 de zile (1,814,400 de secunde), token-urile sunt returnate automat în contul dumneavoastră. Un delegator poate avea cel mult 7 înregistrări de debondare simultane per validator.

---

## Revendicarea recompenselor

Retrageți toate recompensele de staking acumulate de la fiecare validator către care ați delegat:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Pentru a retrage recompensele doar de la un anumit validator:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Recompensele de staking sunt finanțate din două surse: bugetul de emisie plafonat al protocolului (consultați [Tokenomics](/architecture/tokenomics#staking-reward-schedule) pentru suma actuală per epocă și pentru plafon, ambele stabilite prin guvernanță — cel mai recent prin propunerea 10 din 19 octombrie 2026) și cota stakerilor din fiecare comision de tranzacție (plătită ca recompensă obișnuită de staking de la upgrade-ul v3.2.0; vedeți [cota blocată a stakerilor](/architecture/tokenomics#stranded-and-reserve)). Recompensele depind de comisionul validatorului și de activitatea rețelei și nu sunt garantate.

---

## Staking cu blocare în timp (v3.2.4) {#time-locked-staking}

:::note Când se aplică
Versiunea v3.2.4 adaugă un modul opțional de staking cu blocare în timp, `x/stakingtier`. Este activ pe **testnet-ul `qorechain-diana`** din 19 octombrie 2026 și pe **mainnet** din 23 octombrie 2026 (aplicat la înălțimea 3.742.566 prin propunerea de guvernanță 13). Blocarea este disponibilă ca opțiune, iar delegarea obișnuită rămâne fără blocare (vezi [mai sus](#lock-in-period)). Mecanismul de mai jos a fost verificat față de parametrii live ai mainnet-ului și ai testnet-ului pe 23 octombrie 2026.
:::

Un delegator poate angaja o parte dintr-o delegare existentă către un validator pentru un termen fix de 3, 6 sau 12 luni. Termenele și sumele sunt parametri ai chain-ului; citiți-i pe cei actuali de la `GET /qorechain/stakingtier/v1/params`, nu de pe această pagină.

* **Blocarea este opțională.** Delegarea, redelegarea și debondarea obișnuite funcționează exact așa cum este descris pe această pagină. Doar suma blocată este restricționată: cât timp o blocare este deschisă, suma nu poate fi dedelegată sau redelegată, iar acest lucru este valabil pentru orice rută (tranzacție, authz, group, contract, guvernanță).
* **Blocare minimă** de 10 QOR și cel mult 16 blocări deschise per delegator.
* **Deblocarea anticipată** este permisă: încheie blocarea, pierde orice recompensă de blocare care nu a fost plătită și arde o penalizare luată din suma blocată (5% în parametrii actuali, înregistrată la sursa de ardere `staking_tier_penalty`); restul rămâne delegat și deblocat.
* **Slashing-ul** se aplică unei delegări blocate ca oricărei alteia; blocarea se micșorează odată cu delegarea.
* **Revendicarea.** O blocare câștigă o componentă suplimentară de recompensă pe epocă, stabilită de parametrii modulului; aceasta este plătită atunci când o revendicați, nu automat. Această pagină nu citează rate: citiți `params` pentru setările live.
* **La expirare**, blocarea este eliberată, iar delegarea continuă ca una obișnuită.

Comenzile sunt disponibile prin linia de comandă și prin rutele REST `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}` și `/pool`; suma este un număr întreg de `uqor` (1 QOR = 1.000.000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

ID-ul de chain de mai sus este cel al testnet-ului; folosiți `qorechain-vladi` pe mainnet. Ca în restul acestei pagini, semnați fiecare tranzacție generată cu `tx pqc cosign`.

---

## Clasificarea Triple-Pool (starea designului)

Designul QoreChain include un model **Triple-Pool** care ar clasifica validatorii în trei pool-uri în funcție de reputație și de nivelul de delegare, cu o cotă ponderată din recompensele de bloc pentru fiecare pool:

| Pool                                 | Criterii de intrare                                              | Pondere de recompensă în design |
| ------------------------------------ | ----------------------------------------------------------- | -------------------- |
| **RPoS** (Reputation Proof of Stake) | Scor de reputație >= percentila 70 **ȘI** stake >= mediană | 40%                  |
| **DPoS** (Delegated Proof of Stake)  | Delegare totală >= 10,000 QOR                              | 35%                  |
| **PoS** (Proof of Stake)             | Toți ceilalți validatori                                    | 25%                  |

:::note Neactiv pe rețelele live
Clasificarea pe pool-uri, selecția propunătorului ponderată pe pool-uri și ponderile de recompensă ale pool-urilor sunt implementate în modulul `x/qca`, iar parametrii lor se află on-chain (`qorechaind query qca config`), dar **nu sunt încă conectate la producția de blocuri sau la distribuirea recompenselor**. Astăzi propunerea de blocuri se rotește după stake în modul standard, iar recompensele sunt împărțite proporțional cu stake-ul bonded, minus comisionul fiecărui validator. Pool-ul căruia îi „aparține" un validator nu modifică ceea ce primiți.
:::

---

## Recompense pe curba de bonding {#bonding-curve}

Designul QoreChain definește, de asemenea, o formulă de recompensă pe curba de bonding:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variabilă | Descriere                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Suma recompensei pentru perioadă                                    |
| `beta`   | Rata de bază a recompensei (parametru de protocol)                   |
| `S`      | Suma pusă la stake                                                   |
| `alpha`  | Coeficient de loialitate (parametru de protocol)                     |
| `L`      | Durata staking-ului în epoci                                         |
| `Q(r)`   | Multiplicator de calitate derivat din scorul de reputație `r` al validatorului |
| `P(t)`   | Multiplicator de pool la momentul `t` (40%, 35% sau 25% în funcție de pool) |

:::note Neactiv pe rețelele live
Calculul pe curba de bonding, ca și clasificarea pe pool-uri de mai sus, **nu este apelat de chain-ul live**: recompensele nu sunt calculate cu această formulă, iar nici durata staking-ului, nici reputația validatorului nu le modifică astăzi. Parametrii (`bonding_alpha`, `bonding_beta`) există on-chain, dar nu au niciun efect.
:::

---

## Slashing și jailing

Slashing-ul pe QoreChain urmează modulul standard de slashing din Cosmos SDK, cu acești parametri live (`qorechaind query slashing params`):

| Eveniment            | Regulă                                                               | Consecință                                   |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Nefuncționare (downtime) | Semnarea a mai puțin de 5% din ultimele 10,000 de blocuri (aproximativ 8,9 ore la blocurile de aproximativ 3,2 secunde ale mainnet-ului) | Jailed pentru 600 de secunde; 1% din stake este tăiat (slashed) |
| Semnare dublă (double-signing) | Semnarea a două blocuri diferite la aceeași înălțime         | 5% din stake este tăiat (slashed)            |

Slashing-ul se aplică întregului stake bonded al unui validator, astfel încât delegatorii suportă partea lor proporțională. Poate afecta și stake-ul care se află deja în debondare de la un validator penalizat, motiv pentru care perioada de debondare este o măsură de securitate, nu doar un timp de așteptare.

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
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Interogați delegările dumneavoastră curente:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Verificați comisionul, uptime-ul și istoricul unui validator înainte de a delega; pool-ul sau reputația unui validator nu modifică în prezent recompensele pe care le primiți.
* Redelegarea are efect imediat, fără penalizare și fără blocare. Limitele sunt plafonul de 7 înregistrări pentru redelegările simultane pe exact aceeași rută și regula conform căreia stake-ul redelegat recent nu poate fi mutat mai departe de la validatorul destinație până când nu ajunge la maturitate.
* Perioada de debondare de 21 de zile este o măsură de securitate. În acest timp, evenimentele de slashing vă pot afecta în continuare token-urile.

:::
