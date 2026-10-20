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
Valorile per presetare de mai jos corespund valorilor implicite ale profilurilor livrate în **`@qorechain/rdk`**, care reflectă tabelul de profiluri publicat al rețelei. Până acum nu a fost creat niciun rollup pe niciuna dintre rețele. Interoghează parametrii live ai modulului cu `qorechaind query rdk config` (sau `rdk.params()` din `@qorechain/rdk`, care citește `GET /qorechain/rdk/v1/params`, servit pe ambele rețele) pentru configurația autoritativă și validează pe testnet-ul **`qorechain-diana`** înainte de mainnet.
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
Configurația per presetare a fost verificată față de tabelul de profiluri al lanțului în sursa v3.2.3 (mainnet rulează v3.2.3, testnetul v3.2.4), unde `create-rollup` aplică automat presetarea profilului: **`defi` = zk + EVM, `gaming` = based + VM personalizat, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (valori implicite)**. Presetarea `custom` lasă fiecare câmp deschis — valorile afișate sunt doar valorile sale implicite de pornire.
:::

Tratează cele patru presetări de domeniu ca puncte de plecare rezonabile, iar profilul **`custom`** ca opțiunea complet deschisă. Parametrii exacți grupați se pot schimba între versiuni — interoghează `rdk config` (mai jos) pentru valorile autoritative, apoi pornește de la presetarea cea mai apropiată și rafinează.

CLI-ul [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) generează scheletul unui proiect de start funcțional — câte un șablon per profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — astfel încât să treci de la un profil la cod de create/query funcțional cu o singură comandă.

---

## Ce poartă o presetare on-chain {#what-a-preset-carries}

Unele detalii sunt ușor de presupus greșit și merită cunoscute înainte de a alege un profil:

* **`defi` nu are cheie de verificare.** Loturile ZK au nevoie de una, iar un rollup creat prin `create-rollup` nu o poartă, deci decontarea ZK nu poate fi finalizată cap-coadă astăzi (vezi [ZK / STARK și retrageri](/rollups/zk-stark-withdrawals)).
* **`nft` și `custom`** se decontează optimistic, cu o garanție de contestare de 1.000 QOR și o fereastră de contestare de 100.800 de blocuri pe mainnet (cele 604.800 de „secunde" implicite convertite la 6 secunde fixe per bloc; aproximativ 3,7 zile la blocurile actuale de ≈3,2 s ale mainnet-ului). Doar pe testnet, un lot trimis de la v3.2.4 (înălțimea 8.337.253) încolo primește în schimb o fereastră măsurată în secunde de timp de bloc.
* **`gaming` și `enterprise`** folosesc sequencing `based`, ceea ce astăzi înseamnă că loturile sunt trimise de creatorul rollup-ului.
* **Timpul de bloc și limitele de tranzacție** (de exemplu `defi` 500 ms, `gaming` 200 ms, `nft` 2.000 ms, `enterprise` și `custom` 1.000 ms) sunt stocate în înregistrarea on-chain. Ele descriu propriul lanț al rollup-ului și nu sunt impuse de lanțul gazdă.

---

## Alegerea unui profil {#getting-a-recommendation}

Interogarea `suggest-profile` și funcția ajutătoare `suggestProfile()` din RDK sunt menite să recomande o presetare pornind de la o descriere în limbaj natural. Ele se bazează pe metoda JSON-RPC `qor_suggestRollupProfile`, pe care endpoint-urile publice nu o servesc, astfel că `suggestProfile()` returnează în prezent mereu `defi` ca **alternativă de rezervă**, iar `qorechaind query rdk suggest-profile` afișează doar o trimitere către acel RPC. Alege în schimb un profil din tabelul de mai sus și analizează-l în raport cu cerințele tale (garanțiile de decontare, modelul de încredere al sequencer-ului, nevoile de disponibilitate a datelor și VM-ul).

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
