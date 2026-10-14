---
slug: /user-guide/deploying-rollups
title: Implementarea Rollup-urilor
sidebar_label: Implementarea Rollup-urilor
sidebar_position: 6
---

# Implementarea Rollup-urilor

Acest ghid este o scurtă orientare pentru lansarea unui rollup specific unei aplicații, care se decontează pe QoreChain, folosind Rollup Development Kit (RDK). Comenzile pas cu pas se găsesc în **[Implementarea unui Rollup](/rollups/deploying-a-rollup)**; această pagină acoperă ce ai nevoie înainte de a începe.

:::caution Capabilitate în stadiu incipient
Până acum nu a fost creat niciun rollup pe niciuna dintre rețele. Mainnet-ul (**`qorechain-vladi`**, chain ID EVM **9801**) rulează versiunea de chain **v3.2.1**; testnet-ul (**`qorechain-diana`**, chain ID EVM **9800**) rulează o versiune mai nouă (**v3.2.2**). Validează mai întâi pe testnet.
:::

---

## Ce este un rollup aici {#what-a-rollup-is-here}

Un rollup QoreChain este un chain specific unei aplicații care **se execută off-chain** și folosește QoreChain pentru **decontare**: înregistrezi rollup-ul on-chain, postezi loturi de state root și (opțional) postezi blob-uri de date și angajamente de retragere. Înregistrarea on-chain conține un profil, un mod de decontare, un mod de sequencer, un backend de disponibilitate a datelor, un model de gas și o etichetă de VM; chain-ul gazdă nu execută tranzacțiile rollup-ului tău.

---

## Profiluri predefinite {#preset-profiles}

RDK vine cu cinci profiluri predefinite, fiecare ajustat pentru o categorie comună de aplicații:

| Profil         | Decontare (proof)   | Sequencer | DA              | Model de gas | VM       | Caz de utilizare vizat |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | Aplicații DeFi/AMM (lending, DEX-uri, derivate) |
| **gaming**     | based               | based     | native          | flat         | custom   | Stare de joc cu debit ridicat și experiențe în timp real |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planificat) | standard | CosmWasm | Sarcini de mint și marketplace pentru NFT-uri |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Implementări permisionate și de consorțiu cu taxe sponsorizate |
| **custom**     | valori implicite: optimistic (fraud) | dedicated | native | standard | EVM | Valori implicite de pornire; ajustează ce permite mesajul |

Vezi [Profiluri predefinite](/rollups/preset-profiles) pentru detalii și note despre maturitate (de exemplu, un rollup `defi` creat prin CLI nu poate încă finaliza loturi ZK, iar secvențierea `based` înseamnă în prezent că cel care l-a creat face trimiterea).

---

## Cerințe {#requirements}

| Cerință | Detalii |
| ----------- | ------- |
| **Stake pentru rollup** | Cel puțin 10.000 QOR (`min_stake_for_rollup`, 10.000.000.000 uqor). Citește valoarea curentă: `qorechaind query rdk config` |
| **Ardere la creare** | 1 % din stake-ul pe care îl furnizezi este ars la creare; restul este depus în escrow și returnat când oprești rollup-ul |
| **Stake pentru înregistrarea layer-ului** | Crearea unui rollup înregistrează și un layer în modulul multilayer, ceea ce blochează încă 1.000 QOR de la cel care îl creează (returnați când rollup-ul este oprit). Fără acest sold, layer-ul nu este creat, iar rollup-ul nu poate fi ancorat |
| **Cont** | Un cont alimentat cu fonduri, cu o cheie post-cuantică înregistrată (fiecare tranzacție pe lane-ul nativ este semnată hibrid) |

---

## Sfaturi {#tips}

* Începe cu un profil predefinit. Profilurile predefinite setează modul de decontare, sequencer-ul, backend-ul de disponibilitate a datelor și VM-ul; `create-rollup` primește doar id-ul, profilul, stake-ul și un `--vm` opțional.
* Arderea de 1 % la creare se aplică stake-ului pe care îl furnizezi.
* Cel care creează rollup-ul este în prezent cel care trimite loturile (niciun profil predefinit nu setează o adresă de sequencer), așa că păstrează cheia creatorului în siguranță: doar creatorul poate pune pe pauză, relua sau opri rollup-ul.
* Ajutorul `suggest-profile` returnează în prezent o variantă de rezervă fixă `defi` pe endpoint-urile publice, așa că alege din tabelul de profiluri.

---

## Pașii următori {#next-steps}

* [Implementarea unui Rollup](/rollups/deploying-a-rollup) — creează, operează și oprește un rollup din CLI sau din TypeScript.
* [Prezentare generală a Rollup-urilor](/rollups/overview) — moduri de decontare, sequencer-e, sisteme de dovezi.
* [Disponibilitatea datelor](/rollups/data-availability) și [ZK / STARK și retrageri](/rollups/zk-stark-withdrawals).
