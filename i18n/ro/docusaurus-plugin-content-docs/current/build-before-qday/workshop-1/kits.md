---
slug: /build-before-qday/workshop-1/kits
title: Kiturile QoreChain
sidebar_label: Kituri
sidebar_position: 10
---

# Kiturile QoreChain

Stiva QoreChain pentru dezvoltatori înseamnă paisprezece kituri. Această pagină le enumeră pe fiecare într-o linie, cu versiunea și locul unde este publicat, și se încheie cu șase idei pe care le poți construi din ele. Douăsprezece kituri sunt disponibile. Două nu sunt livrate: kitul Asset este o propunere, iar clientul ușor PQ este o specificație.

## Inovații {#innovations}

- **Semnarea hibridă ML-DSA-87 + secp256k1 este integrată în SDK, în portofele și în QoreSign**, așa că o aplicație nu trebuie să implementeze ea însăși semnarea post-cuantică.
- **O tranzacție semnată hibrid, verificată pe lanț**, este dovada comună a aplicațiilor: vezi [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) și [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **Aceeași structură în multe limbaje.** SDK-ul, QoreSign și biblioteca PQC sunt livrate în mai multe limbaje și sunt verificate cu vectori de test comuni.

## Construiește aplicații {#build-apps}

| Kit | Ce face | Versiune și registru |
| --- | --- | --- |
| [SDK-ul QoreChain](/sdk/overview) | Un singur client pentru lane-urile native, EVM și SVM, cu semnare hibridă, înregistrarea cheii PQC, ajutoare pentru fereastra EVM, niveluri de staking, tokenomică, AMM, apeluri cross-VM și rollup-uri. TypeScript, Python, Rust, Java și Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Generează un proiect funcțional cu o singură comandă, din șapte șabloane: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm și rollup-app. | 0.13.1: npm |
| [RDK, Rollup Development Kit](/rollups/overview) | Creează, lansează și operează rollup-uri specifice aplicațiilor, care se decontează pe QoreChain, cu loturi de decontare semnate, retrageri și citiri de disponibilitate a datelor. | `@qorechain/rdk` 0.8.0, cinci limbaje |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Portofele și semnare {#wallets-signing}

| Kit | Ce face | Versiune și registru |
| --- | --- | --- |
| [QoreX și qorex-integrations](/developer-tools/qorex-integrations) | Portofelul oficial ține ambele chei, semnează hibrid și arată ce semnezi. Integrările adaugă QoreX la RainbowKit și wagmi, cosmos-kit și Interchain Kit, cu tipuri, un portofel simulat și fixture-uri Playwright. Vezi și [prezentarea QoreX](/qorex/overview). | QoreX 1.2.3 (iOS, Android), extensia 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Adaugă QoreChain în portofelele pe care oamenii le folosesc deja (Keplr, Leap, Cosmostation, MetaMask, Phantom), inclusiv semnătura hibridă ML-DSA-87 pe care o cere lanțul. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Semnare hibridă pentru portofele și backenduri altele decât QoreX: derivi cheia ML-DSA, semnezi tranzacții pe lane-ul nativ cu ambele chei, verifici local semnături hibride, simulezi înainte de semnare și Sign In With QoreChain. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Primitivele post-cuantice de sub toate celelalte: ML-DSA (FIPS 204), ML-KEM (FIPS 203) și SHAKE-256, compatibile octet cu octet între limbaje și verificate cu vectori de test comuni. | `@qorechain/pqc` 0.2.3, șase limbaje |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Date și confidențialitate {#data-privacy}

| Kit | Ce face | Versiune și registru |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Criptează date către conturi QoreChain cu ML-KEM-1024 (hibrid cu X25519, implicit). Un cont își publică cheia pe lanț, iar oricine poate cripta către el. Mai mulți destinatari, chei de auditor și chei de grup rotative. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Un server Model Context Protocol și un instrument în linia de comandă care oferă instrumentelor compatibile pentru dezvoltatori acces de citire la QoreChain: blocuri, tranzacții, conturi, validatori, niveluri de staking, starea semnăturii hibride, citiri de contracte și estimări de taxe. Nu semnează, nu ține chei și nu transmite niciodată tranzacții. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infrastructură și conformitate {#infra-compliance}

| Kit | Ce face | Versiune și registru |
| --- | --- | --- |
| [QORel](/qorel/overview) | Un releu IBC, fork de Hermes, cu un strat de semnare conectabil, astfel încât să se poată releua lanțuri care cer o semnătură post-cuantică pe fiecare tranzacție. Lanțurile standard păstrează exact formatul Hermes. | 0.1.0: GitHub, imagine de container, Homebrew |
| [Kitul de custodie](/developer-tools/custody-kit) | Pentru custozi: ce cere fiecare lane, validarea adreselor, detectarea depunerilor, semnarea și verificarea retragerilor, staking și gestionarea cheii ML-DSA-87, cu vectori de test și cod de referință. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Inventariază criptografia unei implementări (configurația nodului, chei pe tip, puncte finale TLS, surse Solidity, starea lanțului) și exportă un CBOM CycloneDX 1.6, cu rezultate corelate cu Ghidul FINMA 05/2026, foaia de parcurs PQC a UE și DORA. Un ajutor de inventariere, nu o certificare. | `@qorechain/qorescan` 0.1.0 |
| [Kitul Asset](/developer-tools/asset-kit) | **Propunere, nelivrat în întregime.** Instrumente pentru active tokenizate reglementate: adaptoare ERC-3643 și CMTAT cu verificare post-cuantică a deținătorului, seifuri ERC-4626 și ERC-7540, o consolă pentru emitenți și clienți. Contractele EVM sunt disponibile; modulele native pentru active sunt o propunere. | 0.1.0 |
| [Clientul ușor PQ](/developer-tools/pq-light-client) | **Specificație, nelivrat.** Un client ușor care urmărește puncte de control semnate cu ML-DSA-87. QoreChain nu produce astăzi aceste puncte de control. Repository-ul conține specificația și verificatori de referință (Go, Rust, TypeScript), astfel încât designul să poată fi analizat. | 0.1.0 (specificație) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Șase lucruri pe care le-ai putea construi {#ideas}

| Idee | Construită din | Ce este |
| --- | --- | --- |
| Checkout rezistent cuantic | SDK, QoreX | Un buton "plătește cu QOR" pentru un magazin web, în care fiecare plată este semnată hibrid. |
| Starter pentru hackathon | create-qorechain-dapp | De la zero la un contract implementat pe testnet în zece minute, o singură comandă pentru fiecare student. |
| Sign In With QoreChain | QoreSign | Autentificare fără parolă pentru o aplicație web, cu semnătura hibridă verificată pe serverul tău. |
| Licitație cu oferte sigilate | QoreSeal | Ofertele rămân criptate până la dezvăluire. |
| Inventar de pregătire PQC | QoreScan | Un inventar criptografic și un fișier CBOM pentru o echipă fintech și auditorii ei. |
| Un releu pentru propriul tău canal | QORel | Releu între testnetul QoreChain și un alt lanț Cosmos de testnet. |

## Obține codul {#get-the-code}

Fiecare kit are propria pagină de manual, legată mai sus. Aplicațiile exemplu din acest workshop sunt în repository-ul public [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), iar pagina fiecărei aplicații le parcurge de la prima comandă până la ultima:

```sh
git clone https://github.com/qorechain/build-before-qday
```
