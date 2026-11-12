---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** este festivalul pentru dezvoltatori QoreChain, desfășurat online pe [build.qorechain.io](https://build.qorechain.io), cu hashtagul #BuildBeforeQDay. Participanții aleg un nivel, construiesc pe testnetul QoreChain cu kiturile open source, își publică munca în public și își prezintă proiectul în fața unui juriu și a comunității. Pe lângă festival, există un workshop tehnic pe săptămână. Fiecare workshop are în această secțiune un ghid complet, pas cu pas, de la prima comandă până la ultima, așa că poți face totul în ritmul tău, pe propriul calculator. Aplicațiile exemplu ale fiecărui workshop sunt adunate în repository-ul public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Inovații {#innovations}

Fiecare workshop din această secțiune se construiește în jurul funcțiilor care deosebesc QoreChain:

- **Semnare hibridă.** O tranzacție este semnată de două ori: o dată cu o cheie clasică secp256k1 și o dată cu o cheie post-cuantică ML-DSA-87. Cine fură doar cheia clasică nu poate produce a doua semnătură.
- **Verificată pe lanț.** Validatorii verifică ambele semnături. Tranzacția poartă o extensie `PQCHybridSignature`, iar lanțul emite un eveniment `pqc_hybrid_verify` cu statusul `verified`. Poți citi ambele de la punctul final REST public și poți vedea rezultatul în explorer.
- **Instrumente obișnuite.** Păstrezi Hardhat, Foundry sau limbajul tău preferat. Kiturile se ocupă în locul tău de cheia post-cuantică și de fereastra de autorizare.

## Cum funcționează {#how-it-works}

1. **Înregistrează-te** pe [build.qorechain.io](https://build.qorechain.io): autentifică-te cu GitHub, alege nivelul, conectează X și QoreX.
2. **Construiește** pe testnet cu kiturile, workshopurile săptămânale și provocările din mijlocul hackathonului. Commiturile și actualizările apar în fluxul public.
3. **Trimite proiectul** înainte de termen, cu un repository public, un videoclip de cel mult 3 minute și adresa de testnet pe care o folosește proiectul tău.

Participarea este gratuită: construiești pe testnet, unde QOR de test vine de la [faucet](/dashboard/faucet). Regulile complete de eligibilitate, trimitere și jurizare se găsesc pe pagina Rules a site-ului festivalului. Fondul de premii este de 20.000 USD în total, cu granturi ulterioare în QOR din ianuarie 2027; împărțirea este pe site-ul festivalului.

## Niveluri {#levels}

Alegi un nivel la înregistrare și îl poți schimba ulterior.

| Nivel | Pentru cine este |
| --- | --- |
| Quantum Pass | Ești nou în QoreChain sau în web3. Construiești o aplicație mică care trimite o tranzacție hibridă post-cuantică și o citește înapoi de pe lanț. |
| Intermediate | Ai livrat deja un dApp. Construiești o aplicație completă cu SDK-ul QoreChain și QoreX. |
| Advanced | Trei trasee: A, agenți; B, aplicații criptate cu QoreSeal; C, aplicații cross-VM care acoperă lane-urile EVM și Native. |
| Expert | Infrastructură de protocol: rollup-uri cu RDK, IBC cu QORel, custodie și instrumente pentru dezvoltatori. |

Workshopul 1 acoperă exact ce cere nivelul Quantum Pass: o tranzacție semnată hibrid, verificată pe lanț.

## Calendar {#timeline}

Toate orele sunt în UTC.

| Când | Ce |
| --- | --- |
| 4 noiembrie 2026 | Se deschid înregistrările și construcția |
| În fiecare săptămână | Un workshop (4 în total), cu ghidul lui pas cu pas aici |
| 18 noiembrie 2026 | Încep provocările din mijlocul hackathonului |
| 2 decembrie 2026, 23:59 | Termenul limită de trimitere |
| 3 până la 5 decembrie | Verificarea proiectelor trimise |
| 6 până la 15 decembrie | Jurizare și votul publicului (People's Choice) |
| 16 decembrie | Câștigătorii și demonstrația live |
| 17 până la 22 decembrie | Plata premiilor |
| Ianuarie 2027 | Granturi ulterioare |

Programul se găsește pe site-ul festivalului.

## Workshopuri {#workshops}

| Workshop | Subiect | Ghid |
| --- | --- | --- |
| Workshop 1 | Prima ta tranzacție semnată hibrid | [Workshop 1](/build-before-qday/workshop-1) |

Fiecare ghid pornește de la zero, fără nimic instalat. Enumeră ce trebuie instalat, apoi parcurge comenzile una câte una: obții codul, instalezi, creezi o cheie doar pentru testnet, primești QOR de test de la faucet, rulezi și verifici rezultatul în explorer. Se încheie cu pachetele folosite și cu aplicațiile exemplu. Toate aplicațiile exemplu sunt în repository-ul public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## De unde începi {#where-to-start}

- Urmează [Workshop 1](/build-before-qday/workshop-1) pe testnet.
- Răsfoiește [aplicațiile exemplu](/build-before-qday/workshop-1/kits) și kiturile din spatele lor.
- Dacă nu ai implementat niciodată nimic pe QoreChain, citește mai întâi [Deploy în 5 minute](/getting-started/deploy-in-5-minutes).
