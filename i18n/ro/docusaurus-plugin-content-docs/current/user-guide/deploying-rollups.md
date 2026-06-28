---
slug: /user-guide/deploying-rollups
title: Implementarea rollup-urilor
sidebar_label: Implementarea rollup-urilor
sidebar_position: 6
---

# Implementarea rollup-urilor

Acest ghid descrie cum să implementezi rollup-uri specifice aplicațiilor pe QoreChain folosind Rollup Development Kit (RDK). RDK oferă profiluri presetate pentru cazuri de utilizare comune și personalizare completă pentru implementări avansate.

:::caution
RDK și stratul de decontare a rollup-urilor sunt o capabilitate aflată în evoluție activă. Tratează parametrii, presetările și maturitatea funcționalităților individuale de mai jos ca fiind supuse modificărilor și validează implementările pe **`qorechain-diana`** înainte de a ținti mainnet-ul.
:::

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ de la 7 iunie 2026, rulând versiunea de lanț **v3.1.80** — înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** când implementezi pe mainnet.
:::

---

## Prezentare generală

RDK-ul QoreChain permite dezvoltatorilor să lanseze rollup-uri suverane care se decontează pe QoreChain. Fiecare rollup este un mediu de execuție independent cu propriul timp de bloc, mașină virtuală și model de comision, moștenind în același timp garanțiile QoreChain privind securitatea și disponibilitatea datelor.

---

## Profiluri presetate

RDK-ul vine cu cinci profiluri presetate, fiecare reglat pentru o categorie comună de aplicații:

| Profil         | Decontare (dovadă)  | Secvențiator | DA              | Model de gaz | VM       | Caz de utilizare vizat |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicat   | nativ           | EIP-1559     | EVM      | Aplicații DeFi/AMM (împrumuturi, DEX-uri, instrumente derivate) |
| **gaming**     | based               | based     | nativ           | fix          | custom   | Stare de joc cu debit mare și experiențe în timp real |
| **nft**        | optimistic (fraudă) | dedicat   | nativ (Celestia DA planificat) | standard | CosmWasm | Sarcini de creare NFT și de tip marketplace |
| **enterprise** | based               | based     | nativ           | subvenționat | EVM      | Implementări cu permisiuni și de consorțiu cu comisioane sponsorizate |
| **custom**     | complet parametrizabil | complet parametrizabil | complet parametrizabil | complet parametrizabil | complet parametrizabil | Setezi singur fiecare câmp |

:::note
Valorile pe presetare de mai sus corespund valorilor implicite ale profilurilor livrate în `@qorechain/rdk`. Configurația exactă poate evolua pe măsură ce RDK-ul se maturizează — interoghează valorile autoritare cu `qorechaind query rdk config` (sau `RdkClient.params()`) și reține că decontarea `based` se asociază întotdeauna cu modul de secvențiator `based`.
:::

---

## Cerințe

Înainte de a implementa un rollup, asigură-te că îndeplinești următoarele cerințe:

| Cerință           | Detalii                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Stake minim**   | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Ardere la creare** | 1% din suma puse în stake este ars permanent la crearea rollup-ului                  |
| **Cont**          | Un cont QoreChain finanțat cu sold suficient pentru stake plus comisioanele de tranzacție |

---

## Crearea unui rollup dintr-o presetare

Implementează un rollup folosind unul dintre profilurile presetate:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Implementează un rollup de gaming:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Crearea unui rollup personalizat

Pentru control complet asupra parametrilor rollup-ului, folosește profilul `custom` și specifică fiecare opțiune:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Parametri personalizați:**

| Parametru      | Opțiuni                                       | Descriere                          |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Cum sunt verificate tranzițiile de stare |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategia de ordonare a tranzacțiilor |
| `--da-backend` | `native`, `external`                          | Stratul de disponibilitate a datelor |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Mediul de execuție                 |
| `--block-time` | Întreg (milisecunde)                          | Intervalul țintă de producere a blocurilor |

---

## Trimiterea loturilor

Operatorii de rollup trimit loturi de tranzacții către QoreChain pentru decontare:

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Gestionarea ciclului de viață al rollup-ului

Operatorii de rollup pot gestiona ciclul de viață al implementărilor lor:

1. **Pune un rollup pe pauză** — Oprește temporar producerea blocurilor. Starea rollup-ului este păstrată și poate fi reluată.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Reia un rollup** — Reia producerea blocurilor pe un rollup pus pe pauză:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Oprește un rollup (permanent)** — Oprește permanent un rollup. Această acțiune este **ireversibilă**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Oprirea unui rollup este permanentă. Toată starea asociată este arhivată, dar rollup-ul nu poate fi repornit. QOR-ul pus în stake (minus arderea la creare) este returnat operatorului.
:::

---

## Interogarea rollup-urilor

Obține detalii despre un anumit rollup:

```bash
qorechaind query rdk rollup <rollup_id>
```

Listează toate rollup-urile de pe QoreChain:

```bash
qorechaind query rdk rollups
```

**Exemplu de ieșire:**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## Sugestie de profil asistată de QCAI

Nu ești sigur ce profil se potrivește cazului tău de utilizare? Folosește instrumentul de sugestie asistat de QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Exemplu de ieșire:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Această comandă îți analizează descrierea și recomandă cel mai potrivit profil presetat, împreună cu o explicație.

---

## Sfaturi

* Începe cu un profil presetat și personalizează ulterior. Presetările sunt optimizate pentru cazurile lor de utilizare țintă.
* Arderea la creare de 1% este un cost unic aplicat stake-ului minim la momentul implementării.
* Folosește decontarea `based` dacă vrei cea mai simplă configurare, cu validatorii QoreChain ocupându-se de secvențiere.
* Monitorizează îndeaproape trimiterea loturilor. Lacunele în trimiterea loturilor pot declanșa alerte din partea rețelei.
* Comanda `suggest-profile` este un punct de plecare util, dar revizuiește recomandarea în raport cu cerințele tale specifice.
