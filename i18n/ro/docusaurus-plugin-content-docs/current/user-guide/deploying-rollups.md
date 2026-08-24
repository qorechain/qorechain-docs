---
slug: /user-guide/deploying-rollups
title: Implementarea Rollup-urilor
sidebar_label: Implementarea Rollup-urilor
sidebar_position: 6
---

# Implementarea Rollup-urilor

Acest ghid acoperă modul de implementare a rollup-urilor specifice aplicațiilor pe QoreChain folosind Rollup Development Kit (RDK). RDK oferă profiluri predefinite pentru cazurile de utilizare comune și personalizare completă pentru implementările avansate.

:::caution
RDK și stratul de decontare (settlement) al rollup-urilor reprezintă o capabilitate în evoluție activă. Tratați parametrii, profilurile predefinite și maturitatea funcțiilor individuale de mai jos ca fiind supuse schimbării și validați implementările pe **`qorechain-diana`** înainte de a viza mainnet-ul.
:::

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (chain ID EVM **9800**). Mainnet-ul (**`qorechain-vladi`**, chain ID EVM **9801**) este live din 7 iunie 2026, rulând versiunea de chain **v3.1.92** — înlocuiți chain ID-ul și endpoint-urile de mainnet din pagina **Connecting to Mainnet** atunci când implementați pe mainnet.
:::

---

## Prezentare generală

RDK-ul QoreChain permite dezvoltatorilor să lanseze rollup-uri suverane care se decontează pe QoreChain. Fiecare rollup este un mediu de execuție independent, cu propriul timp de bloc, mașină virtuală și model de taxe, moștenind în același timp garanțiile de securitate și disponibilitate a datelor ale QoreChain.

---

## Profiluri predefinite

RDK vine cu cinci profiluri predefinite, fiecare ajustat pentru o categorie comună de aplicații:

| Profil         | Decontare (proof)   | Sequencer | DA              | Model de gas | VM       | Caz de utilizare vizat |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | Aplicații DeFi/AMM (lending, DEX-uri, derivate) |
| **gaming**     | based               | based     | native          | flat         | custom   | Stare de joc cu debit ridicat și experiențe în timp real |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planificat) | standard | CosmWasm | Sarcini de mint și marketplace pentru NFT-uri |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Implementări permisionate și de consorțiu cu taxe sponsorizate |
| **custom**     | complet parametrizat | complet parametrizat | complet parametrizat | complet parametrizat | complet parametrizat | Setați fiecare câmp singur |

:::note
Valorile per-profil de mai sus corespund valorilor implicite din profilurile pachetului `@qorechain/rdk` livrat. Configurația exactă poate evolua pe măsură ce RDK se maturizează — interogați valorile autoritare cu `qorechaind query rdk config` (sau `RdkClient.params()`) și rețineți că decontarea `based` este întotdeauna asociată cu modul sequencer `based`.
:::

---

## Cerințe

Înainte de a implementa un rollup, asigurați-vă că îndepliniți următoarele cerințe:

| Cerință              | Detalii                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Miză minimă** | 10.000 QOR (10.000.000.000 uqor)                                                       |
| **Ardere la creare** | 1% din suma stakuită este arsă permanent la crearea rollup-ului                    |
| **Cont**       | Un cont QoreChain alimentat, cu sold suficient pentru miză plus taxele de tranzacție |

---

## Crearea unui rollup dintr-un profil predefinit

Implementați un rollup folosind unul dintre profilurile predefinite:

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu:** Implementarea unui rollup de gaming:

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

Pentru control complet asupra parametrilor rollup-ului, folosiți profilul `custom` și specificați fiecare opțiune:

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

| Parametru      | Opțiuni                                       | Descriere                        |
| -------------- | --------------------------------------------- | ---------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Modul în care sunt verificate tranzițiile de stare |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Strategia de ordonare a tranzacțiilor      |
| `--da-backend` | `native`, `external`                          | Stratul de disponibilitate a datelor            |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Mediul de execuție              |
| `--block-time` | Număr întreg (milisecunde)                        | Intervalul țintă de producere a blocurilor   |

---

## Trimiterea batch-urilor

Operatorii de rollup trimit batch-uri de tranzacții către QoreChain pentru decontare:

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

1. **Pausarea unui rollup** — Oprește temporar producerea de blocuri. Starea rollup-ului este păstrată și poate fi reluată.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Reluarea unui rollup** — Reia producerea de blocuri pe un rollup pausat:

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Oprirea unui rollup (permanentă)** — Oprește permanent un rollup. Această acțiune este **ireversibilă**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
Oprirea unui rollup este permanentă. Toată starea asociată este arhivată, dar rollup-ul nu poate fi repornit. QOR stakuit (minus arderea la creare) este returnat operatorului.
:::

---

## Interogarea rollup-urilor

Obțineți detalii despre un rollup specific:

```bash
qorechaind query rdk rollup <rollup_id>
```

Listați toate rollup-urile de pe QoreChain:

```bash
qorechaind query rdk rollups
```

**Exemplu de rezultat:**

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

Nu sunteți sigur care profil se potrivește cazului dumneavoastră de utilizare? Folosiți instrumentul de sugestie asistat de QCAI:

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Exemplu de rezultat:**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Această comandă analizează descrierea dumneavoastră și recomandă cel mai potrivit profil predefinit, împreună cu o explicație.

---

## Sfaturi

* Începeți cu un profil predefinit și personalizați ulterior. Profilurile predefinite sunt optimizate pentru cazurile lor de utilizare țintă.
* Arderea de 1% la creare este un cost unic aplicat mizei minime la momentul implementării.
* Folosiți decontarea `based` dacă doriți cea mai simplă configurare, cu validatorii QoreChain gestionând secvențierea.
* Monitorizați îndeaproape trimiterile de batch-uri. Întreruperile în trimiterea batch-urilor pot declanșa alerte din partea rețelei.
* Comanda `suggest-profile` este un punct de plecare util, dar verificați recomandarea în raport cu cerințele dumneavoastră specifice.
