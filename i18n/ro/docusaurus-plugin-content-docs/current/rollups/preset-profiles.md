---
slug: /rollups/preset-profiles
title: Profiluri presetate
sidebar_label: Profiluri presetate
sidebar_position: 2
---

# Profiluri presetate

RDK include **profiluri presetate** care oferă configurații de rollup la cheie, ajustate pentru categorii comune de aplicații. O presetare grupează un mod de decontare, un mod de secvențiator, un backend de disponibilitate a datelor și parametri de execuție, astfel încât poți lansa un rollup fără să alegi manual fiecare opțiune.

Un profil este transmis pozițional către `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Valorile per presetare de mai jos corespund valorilor implicite ale profilurilor **`@qorechain/rdk`** livrate, care reflectă tabelul de profiluri publicat al rețelei. Acestea pot evolua în continuare pe măsură ce RDK se maturizează — interoghează parametrii activi ai modulului cu `qorechaind query rdk config` (sau `RdkClient.params()` din SDK) pentru configurația oficială și validează pe testnet-ul **`qorechain-diana`** înainte de mainnet.
:::

---

## Profilurile presetate

Fiecare presetare grupează o paradigmă de decontare (și sistemul de dovezi pe care îl cere decontarea sa), un mod de secvențiator, un backend de disponibilitate a datelor, un model de gaz și o VM:

| Profil | Decontare (dovadă) | Secvențiator | DA | Model de gaz | VM | Caz de utilizare vizat |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Aplicații DeFi și de tip AMM — piețe de creditare, DEX-uri și derivate unde contează finalitatea rapidă și comisioanele predictibile |
| **`gaming`** | based | based | native | flat | custom | Stare de joc și economii in-game cu randament mare și latență mică |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA planificat) | standard | CosmWasm | Mintare NFT, marketplace-uri și obiecte de colecție digitale |
| **`enterprise`** | based | based | native | subsidized | EVM | Implementări permisionate și de consorțiu cu comisioane sponsorizate (subvenționate) |
| **`custom`** | complet parametrizat (implicit: optimistic / fraud) | complet parametrizat | complet parametrizat | complet parametrizat | complet parametrizat (implicit: EVM) | Fiecare câmp este definit de utilizator — pornești de la zero și setezi tu fiecare opțiune |

Câteva constrângeri decurg din [matricea decontare → dovadă](/rollups/overview): decontarea `optimistic` folosește dovezi `fraud`, `zk` folosește `snark` (sau `stark`), iar `based` și `sovereign` nu au dovadă. Decontarea `based` se asociază întotdeauna cu modul de secvențiator `based`. Presetarea `nft` se decontează nativ astăzi, cu **Celestia DA planificat**.

:::note
Configurația per presetare a fost verificată live pe lanț la versiunea **v3.1.74**, unde `create-rollup` aplică automat presetarea profilului: **`defi` = zk + EVM, `gaming` = based + custom VM, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (implicit)**. Presetarea `custom` lasă fiecare câmp deschis — valorile afișate sunt valorile sale implicite de pornire.
:::

Tratează cele patru presetări de domeniu ca puncte de plecare rezonabile și profilul **`custom`** ca opțiunea complet deschisă. Parametrii grupați exacți se pot schimba între versiuni — interoghează `rdk config` (mai jos) pentru valorile oficiale, apoi pornește de la cea mai apropiată presetare și ajustează.

CLI-ul [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) generează un proiect starter rulabil — un șablon per profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — astfel încât poți trece de la un profil la cod funcțional de creare/interogare cu o singură comandă.

---

## Obținerea unei recomandări: `suggest-profile`

Dacă nu ești sigur ce presetare se potrivește, interogarea `suggest-profile` preia o descriere în limbaj simplu a cazului tău de utilizare și returnează un profil recomandat.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Exemplu:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Sugestia este un punct de plecare util — analizează recomandarea în raport cu cerințele tale specifice (garanțiile de decontare, modelul de încredere al secvențiatorului, nevoile de disponibilitate a datelor și VM) înainte de a te angaja la o configurație.

---

## Inspectarea configurației presetate on-chain

Deoarece specificul presetărilor este rezolvat on-chain, modul oficial de a vedea la ce se rezolvă un profil este să interoghezi modulul și rollup-ul creat:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Acest tipar — interoghează `config` înainte de a face deploy, apoi interoghează `rollup` după — îți permite să confirmi exact ce a produs presetarea aleasă, în loc să te bazezi pe valori documentate care pot evolua.

---

## Pașii următori

* **[Deploying a Rollup](/rollups/deploying-a-rollup)** — creează un rollup dintr-o presetare prin Dashboard sau CLI, apoi gestionează-i ciclul de viață.
* **[Rollups Overview](/rollups/overview)** — paradigmele de decontare și modurile de secvențiator pe care le grupează o presetare.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — referința modulului la nivel mai jos.
