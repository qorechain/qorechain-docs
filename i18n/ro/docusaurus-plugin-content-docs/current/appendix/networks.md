---
slug: /appendix/networks
title: Rețele
sidebar_label: Rețele
sidebar_position: 4
---

# Rețele

O referință consolidată pentru rețelele QoreChain — identificatorii de lanț, EVM chain ID-urile, denominarea tokenului, prefixele de adresă și porturile standard de serviciu. Pentru detaliile complete de conectare a nodurilor (endpoint-uri publice, seed-uri și genesis), urmați ghidurile de conectare legate mai jos; operatorii obțin endpoint-urile publice curente, seed-urile și genesis-ul din versiunea oficială.

## Rețelele pe scurt

| | Mainnet | Testnet |
|---|---|---|
| **Stare** | Live | Testnet activ |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live din** | 7 iunie 2026, 23:59 UTC | — |
| **Versiunea lanțului** | v3.1.77 | v3.1.77 |
| **Cadru** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Ghid de conectare** | [Conectarea la mainnet](/getting-started/connecting-to-mainnet) | [Conectarea la testnet](/getting-started/connecting-to-testnet) |

## Token și adrese

| Element | Valoare |
|---|---|
| **Denominare de afișare** | QOR |
| **Denominare de bază** | uqor (1 QOR = 10⁶ uqor) |
| **Prefix Bech32 pentru cont** | `qor` (de ex. `qor1...`) |
| **Prefix Bech32 pentru validator** | `qorvaloper` (de ex. `qorvaloper1...`) |

## Porturi standard

Acestea sunt porturile standard de serviciu expuse de un nod QoreChain. Numele de host ale endpoint-urilor publice reale sunt publicate cu versiunea oficială — vezi ghidurile de conectare de mai sus.

| Serviciu | Port |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (compatibil Solana) JSON-RPC | 8899 |
| Metrici Prometheus | 26660 |

## Endpoint-uri și acces

QoreChain nu publică nume de host RPC/REST/EVM publice fixe în această referință. În schimb:

- Pentru conectarea nodurilor, seed-uri și genesis, urmați [Conectarea la mainnet](/getting-started/connecting-to-mainnet) sau [Conectarea la testnet](/getting-started/connecting-to-testnet). Operatorii obțin endpoint-urile publice curente, seed-urile și genesis-ul din versiunea oficială.
- Pentru acces programatic dintr-o aplicație, folosiți [QoreChain SDK](/sdk/overview), care rezolvă configurația de rețea pentru dumneavoastră.
- **Explorer-ul** on-chain este disponibil prin Dashboard la [dashboard.qorechain.io](https://dashboard.qorechain.io), iar **Faucet-ul** de testnet este de asemenea accesibil acolo (vezi [Faucet Dashboard](/dashboard/faucet)).
- Această documentație este publicată la [docs.qorechain.io](https://docs.qorechain.io).

## Adăugare în MetaMask

Pentru a adăuga o rețea QoreChain într-un portofel EVM precum MetaMask, folosiți EVM chain ID-urile de mai sus — **9801** pentru mainnet și **9800** pentru testnet — împreună cu endpoint-ul EVM JSON-RPC al rețelei la care vă conectați. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru parcurgerea pas cu pas.

## Resurse conexe

* [Conectarea la mainnet](/getting-started/connecting-to-mainnet) — alăturați-vă rețelei live `qorechain-vladi`.
* [Conectarea la testnet](/getting-started/connecting-to-testnet) — alăturați-vă testnet-ului Diana.
* [Parametrii lanțului](/appendix/chain-parameters) — configurația canonică a lanțului.
* [Prezentare generală SDK](/sdk/overview) — rezolvați configurația de rețea din cod.
