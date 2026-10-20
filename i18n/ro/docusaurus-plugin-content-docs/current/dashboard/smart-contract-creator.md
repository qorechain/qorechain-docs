---
slug: /dashboard/smart-contract-creator
title: Creator de contracte inteligente
sidebar_label: Creator de contracte inteligente
sidebar_position: 6
---

# Creator de contracte inteligente

**Creatorul de contracte inteligente** generează contracte inteligente pornind de la o descriere în limbaj natural, fiind alimentat de **QCAI**. Descrie ce dorești, alege blockchain-ul țintă, iar QCAI scrie contractul pentru tine. Suportă **17 blockchain-uri** pentru instrumentele AI, astfel încât să poți viza ecosistemul pentru care construiești.

Îl poți încerca **fără cont**: un vizitator nou primește o generare gratuită și vede întregul contract. Pentru următoarea generare este nevoie de un cont gratuit, la fel ca pentru salvare, audit și implementare; pagina oferă **Creează un cont gratuit** după ce încercarea gratuită a fost folosită.

Autentifică-te pentru a salva și a gestiona contractele pe care le generezi — vezi [Autentificare](/dashboard/overview#sign-in).

## Generează un contract

1. **Pornește de la un exemplu sau descrie-l pe al tău.** Pagina se deschide cu „What would you like to build?”. Sub **Or start from an example:** alege **Token**, **NFT collection**, **Locked vault** sau **2-of-3 multisig** — fiecare completează o descriere completă și selectează un blockchain și un șablon potrivite — sau scrie propria descriere în **Contract Description**. Cu cât ești mai specific, cu atât rezultatul este mai bun.
2. **Alege blockchain-ul.** Folosește **Target Blockchain**. Limbajul contractului și categoria pentru alegerea ta sunt afișate alături de selector.
3. **Alege un tip de contract** (opțional). **Contract Type** oferă un șablon de pornire precum un token, un NFT sau un contract de guvernanță; lasă-l pe **Custom (describe in prompt)** pentru a te baza doar pe descrierea ta.
4. **Generează.** Selectează **Generate Smart Contract**. Un indicator de progres afișează starea în timp ce QCAI produce contractul.

## Analizează rezultatul

Când generarea se finalizează, Panoul afișează contractul într-o vizualizare cu evidențiere de sintaxă, împreună cu detalii precum numele contractului, blockchain-ul, limbajul, dimensiunea fișierului și momentul generării. Promptul pe care l-ai folosit este afișat alături de rezultat pentru referință.

De aici poți:

- **Copia** codul contractului în clipboard (**Copy Code**).
- **Exporta PDF** al contractului (**Export PDF**).
- **Descărca** contractul ca fișier (**Download File**) în formatul potrivit pentru blockchain-ul ales.
- **Edita** contractul (**Edit Contract**) pentru a-l rafina în continuare.

## Implementează contractul {#deploy}

### Pe mainnet (EVM) — implementare non-custodială {#deploy-mainnet}

Implementarea pe mainnet este non-custodială: Panoul compilează contractul și returnează date de implementare **nesemnate** — nu îți deține niciodată cheile și nu semnează niciodată în numele tău. Tu semnezi și transmiți implementarea din propriul portofel, iar Panoul înregistrează apoi contractul rezultat.

1. Deschide contractul pe care vrei să îl implementezi (un contract cu țintă EVM) și selectează **Deploy** pe **Mainnet**. Dacă aceasta este prima ta acțiune pe mainnet, acceptă [confirmarea unică a riscurilor](/dashboard/overview#risk-acknowledgement).
2. Conectează **MetaMask** dacă nu este deja conectat — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet). Începând cu chain v3.2.0, lane-ul EVM cere ca și contul să dețină o cheie post-cuantică înregistrată și o **fereastră de autorizare EVM deschisă**, care se deschide din QoreX (vezi [Trimiterea cu MetaMask](/dashboard/wallet#send-metamask)); fără una, chain-ul refuză implementarea.
3. Panoul compilează contractul și predă tranzacția de implementare nesemnată portofelului tău.
4. Analizează tranzacția în MetaMask — rețeaua, gas-ul și datele — apoi confirmă pentru a o semna și a o transmite tu însuți.
5. Odată ce implementarea este confirmată on-chain, Panoul înregistrează adresa contractului rezultat alături de contractele tale salvate.

Din Panou pot fi implementate doar contractele **EVM** (Solidity). Implementările QoreChain Native și de programe Solana nu sunt disponibile deocamdată pe niciuna dintre rețele.

### Pe testnet — un singur clic {#deploy-testnet}

Pe testnet, portofelul de test gestionat de Panou semnează și trimite o implementare EVM pentru tine cu un singur clic, astfel încât să poți itera rapid cu tokenuri de la [Faucet](/dashboard/faucet) înainte de a trece pe mainnet. Testnet-ul aplică aceeași regulă pentru lane-ul EVM ca mainnet-ul, așa că o implementare poate fi totuși refuzată dacă contul nu are o cheie post-cuantică sau o fereastră EVM deschisă.

## Partajează și reutilizează

Fiecare contract generat are propria pagină. Contractele sunt **private în mod implicit**: doar tu îl poți deschide pe al tău. Ca proprietar vei vedea un buton **Public** / **Private** pe pagina contractului; setează-l pe **Public** pentru ca oricine are linkul să poată deschide (și fork-ui) contractul, și înapoi pe **Private** pentru a-l retrage. Dacă deschizi un contract public pe care nu îl deții, îl poți **fork**-ui pentru a începe propria copie și a continua de acolo.

:::tip Analizează și testează întotdeauna
Codul generat de QCAI este un punct de plecare solid, nu un substitut pentru analiză. Citește contractul, testează-l pe [testnet](/getting-started/connecting-to-testnet) și rulează-l prin [Auditorul de contracte](/dashboard/contract-auditor) înainte de a implementa ceva de valoare.
:::

## Înrudite

- [Auditor de contracte](/dashboard/contract-auditor) — rulează o analiză de securitate QCAI asupra unui contract.
- [Ghidul dezvoltatorului](/developer-guide/evm-development) — implementarea contractelor în runtime-urile QoreChain.
