---
slug: /rollups/preset-profiles
title: Profiluri presetate
sidebar_label: Profiluri presetate
sidebar_position: 2
---

# Profiluri presetate

RDK include **profiluri presetate** care oferă configurații de rollup „la cheie", optimizate pentru categorii comune de aplicații. O presetare grupează un mod de decontare, un mod de sequencer, un backend de disponibilitate a datelor și parametri de execuție, astfel încât să poți lansa un rollup fără a alege manual fiecare opțiune.

Un profil este transmis pozițional către `create-rollup`:

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Valorile per presetare de mai jos corespund valorilor implicite ale profilurilor livrate în **`@qorechain/rdk`**, care reflectă tabelul de profiluri publicat al rețelei. Acestea pot totuși evolua pe măsură ce RDK se maturizează — interoghează parametrii live ai modulului cu `qorechaind query rdk config` (sau `RdkClient.params()` din SDK) pentru configurația autoritativă și validează pe testnet-ul **`qorechain-diana`** înainte de mainnet.
:::

---

## Profilurile presetate

Fiecare presetare grupează o paradigmă de decontare (și sistemul de dovezi pe care îl necesită decontarea respectivă), un mod de sequencer, un backend de disponibilitate a datelor, un model de gas și un VM:

| Profil | Decontare (dovadă) | Sequencer | DA | Model de gas | VM | Caz de utilizare vizat |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicat | nativ | EIP-1559 | EVM | Aplicații DeFi și de tip AMM — piețe de creditare, DEX-uri și instrumente derivate, unde finalitatea rapidă și comisioanele predictibile contează |
| **`gaming`** | based | based | nativ | fix | personalizat | Stare de joc cu debit mare și latență redusă și economii in-game |
| **`nft`** | optimistic (fraud) | dedicat | nativ (Celestia DA planificat) | standard | QoreChain Native (`native`) | Emitere de NFT-uri, marketplace-uri și obiecte de colecție digitale |
| **`enterprise`** | based | based | nativ | subvenționat | EVM | Implementări cu permisiuni și de tip consorțiu, cu comisioane sponsorizate (subvenționate) |
| **`custom`** | complet parametrizabil (implicit: optimistic / fraud) | complet parametrizabil | complet parametrizabil | complet parametrizabil | complet parametrizabil (implicit: EVM) | Fiecare câmp este definit de utilizator — pornești de la zero și setezi singur fiecare opțiune |

Câteva constrângeri decurg din [matricea decontare → dovadă](/rollups/overview): decontarea `optimistic` folosește dovezi `fraud`, `zk` folosește `snark` (sau `stark`), iar `based` și `sovereign` nu au nicio dovadă asociată. Decontarea `based` se asociază întotdeauna cu modul de sequencer `based`. Presetarea `nft` se decontează nativ astăzi, cu **Celestia DA planificat**.

Începând cu RDK v0.4.2, opțiunea de VM Wasm (runtime-ul care execută contractele CosmWasm) se numește **`native`** — QoreChain Native. `cosmwasm` rămâne un alias istoric acceptat, iar ambele se mapează la `cosmwasm` pe fir, astfel încât lanțul, exploratorul și Dashboard-ul rămân neschimbate.

:::note
Configurația per presetare a fost verificată live pe versiunea de lanț **v3.1.74**, unde `create-rollup` aplică automat presetarea profilului: **`defi` = zk + EVM, `gaming` = based + VM personalizat, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (valori implicite)**. Presetarea `custom` lasă fiecare câmp deschis — valorile afișate sunt doar valorile sale implicite de pornire.
:::

Tratează cele patru presetări de domeniu ca puncte de plecare rezonabile, iar profilul **`custom`** ca opțiunea complet deschisă. Parametrii exacți grupați se pot schimba între versiuni — interoghează `rdk config` (mai jos) pentru valorile autoritative, apoi pornește de la presetarea cea mai apropiată și rafinează.

CLI-ul [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) generează scheletul unui proiect de start funcțional — câte un șablon per profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — astfel încât să treci de la un profil la cod de create/query funcțional cu o singură comandă.

---

## Obținerea unei recomandări: `suggest-profile`

Dacă nu ești sigur care presetare ți se potrivește, interogarea `suggest-profile` primește o descriere în limbaj natural a cazului tău de utilizare și returnează un profil recomandat.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Exemplu:**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

Sugestia este un punct de plecare util — analizează recomandarea în raport cu cerințele tale specifice (garanțiile de decontare, modelul de încredere al sequencer-ului, nevoile de disponibilitate a datelor și VM-ul) înainte de a te angaja la o configurație.

---

## Inspectarea configurației presetate on-chain

Deoarece detaliile presetărilor sunt rezolvate on-chain, modalitatea autoritativă de a vedea la ce se rezolvă un profil este să interoghezi modulul și rollup-ul creat:

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Acest tipar — interoghezi `config` înainte de implementare, apoi interoghezi `rollup` după — îți permite să confirmi exact ce a produs presetarea aleasă, în loc să te bazezi pe valori documentate care pot evolua.

---

## Pașii următori

* **[Implementarea unui Rollup](/rollups/deploying-a-rollup)** — creează un rollup dintr-o presetare prin Dashboard sau CLI, apoi gestionează-i ciclul de viață.
* **[Prezentare generală Rollups](/rollups/overview)** — paradigmele de decontare și modurile de sequencer pe care le grupează o presetare.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — referința de nivel inferior a modulului.
