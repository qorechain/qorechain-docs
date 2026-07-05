---
slug: /dashboard/overview
title: Prezentare generală Dashboard și primii pași
sidebar_label: Prezentare generală și primii pași
sidebar_position: 1
---

# Prezentare generală Dashboard și primii pași

Dashboard-ul QoreChain de la **[dashboard.qorechain.io](https://dashboard.qorechain.io)** este aplicația web oficială pentru a folosi QoreChain din browser. Dintr-un singur loc poți explora lanțul, gestiona un portofel, face swap de tokenuri, muta active între lanțuri, genera și audita contracte inteligente, face staking către validatori, revendica tokenuri de testnet, finaliza quest-uri și accesa instrumentele rețelei.

Tot ce se află în această secțiune este un ghid practic pentru utilizator: ce face fiecare pagină și cum să o folosești. Nu este necesară nicio instalare — Dashboard-ul rulează integral în browserul tău.

## Ce poți face

| Zonă | La ce folosește |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Răsfoiește blocuri, tranzacții, adrese și validatori. |
| **[Wallet](/dashboard/wallet)** | Vizualizează-ți soldul și istoricul și primește QOR — cu propriul tău portofel (non-custodial) pe mainnet sau cu un portofel de test gestionat de dashboard pe testnet. |
| **[Trade](/dashboard/trade)** | Fă swap de tokenuri și furnizează lichiditate pe AMM-ul on-chain. |
| **[Bridge](/dashboard/bridge)** | Mută active între QoreChain și alte lanțuri. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Generează contracte inteligente cu **QCAI** pe 17 blockchain-uri suportate. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Rulează o analiză de securitate **QCAI** asupra unui contract inteligent. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Analizează validatorii și deleagă-ți QOR. |
| **[Faucet](/dashboard/faucet)** | Solicită tokenuri de test pe testnet. |
| **[Quests](/dashboard/quests)** | Finalizează sarcini ghidate pentru a învăța rețeaua. |
| **[Tools Hub](/dashboard/tools-hub)** | Accesează instrumentele pentru noduri, rollup-uri, SDK și licențiere. |

## Conectează-ți portofelul {#connect-your-wallet}

Majoritatea acțiunilor care modifică starea on-chain — trimiterea de tokenuri, swap-ul, staking-ul, transferul prin bridge — necesită un portofel conectat. Modul în care Dashboard-ul gestionează cheile depinde de rețea:

- **Mainnet-ul este non-custodial.** Dashboard-ul nu deține niciodată cheile tale de mainnet. Îți conectezi propriul portofel — **Keplr** pentru linia Native sau **MetaMask** pentru linia EVM — iar Dashboard-ul îți citește soldul și istoricul reale direct de pe lanț. Fiecare tranzacție de mainnet este semnată în propriul tău portofel, niciodată de către Dashboard.
- **Testnet-ul este custodial.** Dashboard-ul gestionează un portofel de test pentru tine, astfel încât să poți experimenta fără nicio configurare și fără nicio valoare reală pusă în risc.

Pentru a te conecta pe mainnet:

1. Deschide [dashboard.qorechain.io](https://dashboard.qorechain.io) și asigură-te că antetul afișează **Mainnet**.
2. Dacă aceasta este prima ta vizită pe o pagină de mainnet, citește și acceptă declarația unică de asumare a riscurilor (vezi mai jos).
3. Selectează **Connect Wallet** și alege **Keplr** (linia Native) sau **MetaMask** (linia EVM).
4. Aprobă conexiunea în portofelul tău.

Odată conectat, Dashboard-ul îți afișează adresa (în formă prescurtată) în antet și deblochează acțiunile care necesită o semnătură. Paginile doar-citire, cum ar fi Explorer-ul, funcționează fără conectare.

Conturile QoreChain folosesc prefixul bech32 `qor`, așa că o adresă conectată arată ca `qor1...` — același cont are și o codificare EVM (`0x...`) și una SVM (base58). Conturile sunt protejate cu criptografie rezistentă la atacuri cuantice. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru îndrumări la prima configurare și [Adaugă QoreChain în portofelul tău](/dashboard/wallet#add-network) dacă portofelul tău nu cunoaște încă rețeaua.

### Declarația unică de asumare a riscurilor {#risk-acknowledgement}

Înainte de a putea folosi orice pagină de mainnet, Dashboard-ul îți cere să accepți o declarație unică de exonerare. Aceasta confirmă că înțelegi că tranzacțiile de mainnet mută **fonduri reale**, că Dashboard-ul este **non-custodial** (doar tu îți controlezi cheile) și că tranzacțiile on-chain sunt **ireversibile**. O accepți o singură dată; după aceea, paginile de mainnet se deschid direct.

## Selectează-ți rețeaua

Dashboard-ul funcționează cu două rețele. Antetul afișează rețeaua la care ești conectat în acel moment.

| Rețea | Chain ID | Când să o folosești |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rețeaua live pentru valoare reală și utilizare în producție. Non-custodial: îți conectezi propriul portofel. |
| **Testnet** | `qorechain-diana` | Mediu gratuit pentru testare, cu un portofel de test gestionat de dashboard și cu [Faucet](/dashboard/faucet) pentru tokenuri de test. |

Tokenul nativ este **QOR** (denominarea de bază `uqor`, unde 1 QOR = 10^6 uqor). Dacă ești la început, pornește pe testnet, revendică tokenuri de la Faucet și încearcă un prim transfer înainte de a trece pe mainnet.

:::tip Nou pe QoreChain?
Urmează [Conectarea la Testnet](/getting-started/connecting-to-testnet) și [Prima ta tranzacție](/getting-started/first-transaction) pentru a trece rapid la practică, apoi revino ca să explorezi restul Dashboard-ului.
:::

## Pagini conexe

* [Explorer](/dashboard/explorer) — răsfoiește blocuri, tranzacții și conturi.
* [Wallet](/dashboard/wallet) — gestionează conturi și trimite tranzacții.
* [Trade / DEX](/dashboard/trade) — fă swap de tokenuri contra pool-urilor AMM on-chain.
* [Bridge](/dashboard/bridge) — mută active între lanțuri.
* [Tools Hub](/dashboard/tools-hub) — licențe, faucet și utilitare pentru dezvoltatori.
