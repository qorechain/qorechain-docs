---
slug: /dashboard/smart-contract-creator
title: Creator de contracte inteligente
sidebar_label: Creator de contracte inteligente
sidebar_position: 6
---

# Creator de contracte inteligente

**Creatorul de contracte inteligente** generează contracte inteligente pornind de la o descriere în limbaj natural, fiind alimentat de **QCAI**. Descrie ce dorești, alege blockchain-ul țintă, iar QCAI scrie contractul pentru tine. Suportă **17 blockchain-uri** pentru instrumentele AI, astfel încât să poți viza ecosistemul pentru care construiești.

Conectarea portofelului îți permite să salvezi și să gestionezi contractele pe care le generezi — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet).

## Generează un contract

1. **Descrie contractul.** În câmpul de prompt, scrie ce ar trebui să facă contractul — de exemplu, un token cu o ofertă fixă, o colecție NFT sau un program de vesting. Cu cât ești mai specific, cu atât rezultatul este mai bun.
2. **Alege blockchain-ul.** Selectează ținta dintre blockchain-urile suportate. Limbajul contractului și categoria pentru alegerea ta sunt afișate alături de selector.
3. **Alege un tip de contract** (opțional). Alege un șablon de pornire precum un token, un NFT sau un contract de guvernanță pentru a ghida generarea.
4. **Generează.** Selectează **Generate**. Un indicator de progres afișează starea în timp ce QCAI produce contractul.

## Analizează rezultatul

Când generarea se finalizează, Panoul afișează contractul într-o vizualizare cu evidențiere de sintaxă, împreună cu detalii precum numele contractului, blockchain-ul, limbajul, dimensiunea fișierului și momentul generării. Promptul pe care l-ai folosit este afișat alături de rezultat pentru referință.

De aici poți:

- **Copia** codul contractului în clipboard.
- **Descărca** contractul ca fișier în formatul potrivit pentru blockchain-ul ales.
- **Edita** contractul pentru a-l rafina în continuare.

## Partajează și reutilizează

Fiecare contract generat are propria pagină pe care o poți deschide sau partaja. Dacă deschizi un contract pe care nu îl deții, îl poți **fork**-ui pentru a începe propria copie și a continua de acolo.

:::tip Analizează și testează întotdeauna
Codul generat de QCAI este un punct de plecare solid, nu un substitut pentru analiză. Citește contractul, testează-l pe [testnet](/getting-started/connecting-to-testnet) și rulează-l prin [Auditorul de contracte](/dashboard/contract-auditor) înainte de a implementa ceva de valoare.
:::

## Înrudite

- [Auditor de contracte](/dashboard/contract-auditor) — rulează o analiză de securitate QCAI asupra unui contract.
- [Ghidul dezvoltatorului](/developer-guide/evm-development) — implementarea contractelor în runtime-urile QoreChain.
