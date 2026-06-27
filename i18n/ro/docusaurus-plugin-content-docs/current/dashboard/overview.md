---
slug: /dashboard/overview
title: Prezentare generală Dashboard și primii pași
sidebar_label: Prezentare generală și primii pași
sidebar_position: 1
---

# Prezentare generală Dashboard și primii pași

Dashboard-ul QoreChain de la **[dashboard.qorechain.io](https://dashboard.qorechain.io)** este aplicația web oficială pentru a folosi QoreChain din browser. Dintr-un singur loc poți explora lanțul, gestiona un portofel, face swap de tokenuri, muta active între lanțuri, genera și audita smart contracte, face staking către validatori, revendica tokenuri de testnet, finaliza quest-uri și accesa instrumentele rețelei.

Tot ce se află în această secțiune este un ghid practic pentru utilizator: ce face fiecare pagină și cum să o folosești. Nu este necesară nicio instalare — Dashboard-ul rulează integral în browserul tău.

## Ce poți face

| Zonă | La ce folosește |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Explorează blocuri, tranzacții, adrese și validatori. |
| **[Wallet](/dashboard/wallet)** | Vizualizează solduri, trimite și primește QOR și gestionează adresele tale. |
| **[Trade](/dashboard/trade)** | Fă swap de tokenuri și furnizează lichiditate pe AMM-ul on-chain. |
| **[Bridge](/dashboard/bridge)** | Mută active între QoreChain și alte lanțuri. |
| **[Generatorul de smart contracte](/dashboard/smart-contract-creator)** | Generează smart contracte cu **QCAI** pe 17 blockchainuri acceptate. |
| **[Auditor de contracte](/dashboard/contract-auditor)** | Rulează o analiză de securitate **QCAI** pe un smart contract. |
| **[Staking și validatori](/dashboard/staking-and-validators)** | Analizează validatorii și deleagă-ți QOR-ul. |
| **[Faucet](/dashboard/faucet)** | Solicită tokenuri de test pe testnet. |
| **[Quests](/dashboard/quests)** | Finalizează sarcini ghidate pentru a învăța rețeaua. |
| **[Tools Hub](/dashboard/tools-hub)** | Accesează instrumentele de nod, rollup, SDK și licențiere. |

## Conectează-ți portofelul {#connect-your-wallet}

Majoritatea acțiunilor care modifică starea on-chain — trimiterea de tokenuri, swap, staking, bridging — necesită un portofel conectat.

1. Deschide [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Selectează **Connect Wallet**.
3. Aprobă conexiunea în portofelul tău.

Odată conectat, Dashboard-ul afișează adresa ta (în formă prescurtată) în antet și deblochează acțiunile care necesită o semnătură. Paginile doar pentru citire, precum Explorer, funcționează fără conectare.

Conturile QoreChain folosesc prefixul bech32 `qor`, așa că o adresă conectată arată ca `qor1...`. Conturile sunt protejate cu criptografie cu siguranță cuantică. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru îndrumări la prima configurare.

## Selectează-ți rețeaua

Dashboard-ul funcționează pe două rețele. Antetul afișează rețeaua la care ești conectat în prezent.

| Rețea | Chain ID | Când să o folosești |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rețeaua live pentru valoare reală și utilizare în producție. |
| **Testnet** | `qorechain-diana` | Mediu gratuit pentru testare, cu [Faucet](/dashboard/faucet) pentru tokenuri de test. |

Tokenul nativ este **QOR** (denominarea de bază `uqor`, unde 1 QOR = 10^6 uqor). Dacă ești nou, începe pe testnet, revendică tokenuri de la Faucet și încearcă un prim transfer înainte de a trece la mainnet.

:::tip Nou pe QoreChain?
Urmează [Conectarea la testnet](/getting-started/connecting-to-testnet) și [Prima ta tranzacție](/getting-started/first-transaction) pentru a deveni rapid familiarizat în practică, apoi revino pentru a explora restul Dashboard-ului.
:::

## Legături utile

* [Explorer](/dashboard/explorer) — explorează blocuri, tranzacții și conturi.
* [Wallet](/dashboard/wallet) — gestionează conturi și trimite tranzacții.
* [Trade / DEX](/dashboard/trade) — fă swap de tokenuri pe pool-urile AMM on-chain.
* [Bridge](/dashboard/bridge) — mută active între lanțuri.
* [Tools Hub](/dashboard/tools-hub) — licențe, faucet și utilitare pentru dezvoltatori.
