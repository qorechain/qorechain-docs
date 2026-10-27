---
slug: /user-guide/deploying-rollups
title: Implementarea Rollup-urilor
sidebar_label: Implementarea Rollup-urilor
sidebar_position: 6
---

# Implementarea Rollup-urilor

Acest ghid este o scurtă orientare pentru lansarea unui rollup specific unei aplicații, care se decontează pe QoreChain, folosind Rollup Development Kit (RDK). Comenzile pas cu pas se găsesc în **[Implementarea unui Rollup](/rollups/deploying-a-rollup)**; această pagină acoperă ce ai nevoie înainte de a începe.

:::caution Capabilitate în stadiu incipient
Până acum nu a fost creat niciun rollup pe niciuna dintre rețele (verificat la 27 octombrie 2026). Mainnet-ul (**`qorechain-vladi`**, chain ID EVM **9801**) rulează versiunea de chain **v3.2.4** din 23 octombrie 2026; testnet-ul (**`qorechain-diana`**, chain ID EVM **9800**) rulează v3.2.6 (din 27 octombrie 2026), iar fereastra sa de contestare implicită este de 1 oră, nu de 7 zile. Validează mai întâi pe testnet; comportamentul ferestrei de contestare este descris în [Rollup Development Kit](/architecture/rollup-development-kit#optimistic-settlement)).
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
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA planificat) | standard | QoreChain Native | Sarcini de mint și marketplace pentru NFT-uri |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Implementări permisionate și de consorțiu cu taxe sponsorizate |
| **custom**     | valori implicite: optimistic (fraud) | dedicated | native | standard | EVM | Valori implicite de pornire; ajustează ce permite mesajul |

Vezi [Profiluri predefinite](/rollups/preset-profiles) pentru detalii și note despre maturitate (de exemplu, decontarea ZK, deci și profilul `defi`, nu poate fi folosită încă în niciuna dintre rețele, iar secvențierea `based` înseamnă în prezent că cel care l-a creat face trimiterea).

---

## Cerințe {#requirements}

| Cerință | Detalii |
| ----------- | ------- |
| **Stake pentru rollup** | Cel puțin 10.000 QOR (`min_stake_for_rollup`, 10.000.000.000 uqor). Citește valoarea curentă: `qorechaind query rdk config` |
| **Ardere la creare** | 1 % din stake-ul pe care îl furnizezi este ars la creare; restul este depus în escrow într-un registru per rollup. Când oprești rollup-ul, primești înapoi ce a rămas în el (retragerile și recompensele pentru fraud-proof plătite din el reduc rambursarea) |
| **Id de rollup** | 3 până la 64 de caractere: litere mici, cifre, `.`, `_` și `-`, începând cu o literă sau o cifră. Un id care încalcă aceste reguli este refuzat după ce ai plătit comisionul, așa că verifică-l mai întâi (RDK-ul TypeScript 0.6.0 îl verifică înainte de a difuza) |
| **Stake pentru înregistrarea layer-ului** | Crearea unui rollup înregistrează și un layer în modulul multilayer, ceea ce blochează încă 1.000 QOR de la cel care îl creează (returnați când rollup-ul este oprit). Fără acest sold, layer-ul nu este creat, iar rollup-ul nu poate fi ancorat |
| **Cont** | Un cont alimentat cu fonduri, cu o cheie post-cuantică înregistrată (fiecare tranzacție pe lane-ul nativ este semnată hibrid) |

---

## Sfaturi {#tips}

* Începe cu un profil predefinit. Profilurile predefinite setează modul de decontare, sequencer-ul, backend-ul de disponibilitate a datelor și VM-ul; `create-rollup` primește doar id-ul, profilul, stake-ul și un `--vm` opțional.
* Arderea de 1 % la creare se aplică stake-ului pe care îl furnizezi.
* Loturile se decontează fără ancoră, cu excepția cazului în care trimiți odată cu ele semnătura post-cuantică a creatorului (`--anchor-signature` la `tx rdk submit-batch`, disponibil începând cu v3.2.2). Vezi [State Anchoring](/architecture/rollup-development-kit#state-anchoring).
* Retragerile către L1 (`tx rdk execute-withdrawal`) sunt plătite din registrul de escrow al rollup-ului tău și funcționează pe mainnet începând cu v3.2.3; necesită un lot finalizat cu o rădăcină a retragerilor și folosesc doar `uqor`.
* Cel care creează rollup-ul este în prezent cel care trimite loturile (niciun profil predefinit nu setează o adresă de sequencer), așa că păstrează cheia creatorului în siguranță: doar creatorul poate pune pe pauză, relua sau opri rollup-ul.
* RDK este publicat în cinci limbaje (versiunea 0.7.0 pe npm, PyPI, crates.io, Maven Central și proxy-ul de module Go; verificat la 27 octombrie 2026), dar doar clientul TypeScript semnează tranzacții hibride, și doar când îi dai perechea ta de chei post-cuantice; CLI-ul `qorollup` și clienții Python, Go, Rust și Java semnează doar clasic, ceea ce ambele rețele refuză. Vezi [Modificările și limitele RDK](/rollups/deploying-a-rollup#rdk-050-limits).
* Ajutorul `suggest-profile` returnează în prezent o variantă de rezervă fixă `defi` pe endpoint-urile publice, așa că alege din tabelul de profiluri.

---

## Pașii următori {#next-steps}

* [Implementarea unui Rollup](/rollups/deploying-a-rollup) — creează, operează și oprește un rollup din CLI sau din TypeScript.
* [Prezentare generală a Rollup-urilor](/rollups/overview) — moduri de decontare, sequencer-e, sisteme de dovezi.
* [Disponibilitatea datelor](/rollups/data-availability) și [ZK / STARK și retrageri](/rollups/zk-stark-withdrawals).
