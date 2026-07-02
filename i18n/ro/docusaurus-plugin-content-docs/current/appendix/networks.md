---
slug: /appendix/networks
title: Rețele
sidebar_label: Rețele
sidebar_position: 4
---

# Rețele

O referință consolidată pentru rețelele QoreChain — identificatori de lanț, chain ID-uri EVM, denominarea tokenului, prefixe de adrese, endpoint-uri publice și porturi de serviciu standard.

## Rețelele pe scurt

| | Mainnet | Testnet |
|---|---|---|
| **Stare** | Live | Testnet activ |
| **Chain ID Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **Chain ID EVM (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Live din** | 7 iunie 2026, 23:59 UTC | — |
| **Versiunea lanțului** | v3.1.82 | v3.1.82 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Preț minim al gazului** | `0.1uqor` | `0.1uqor` |
| **Ghid de conectare** | [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) | [Conectarea la Testnet](/getting-started/connecting-to-testnet) |

## Endpoint-uri publice {#public-endpoints}

Toate endpoint-urile publice sunt servite prin HTTPS.

| Serviciu | Mainnet | Testnet |
|---|---|---|
| RPC de consens | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket de consens | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (compatibil Solana, doar citire) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Explorator de blocuri | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (comutați pe Testnet) |
| Descărcări (binar / genesis / snapshot) | [download.qore.host](https://download.qore.host) | — |

:::note
Endpoint-urile SVM publice sunt **doar pentru citire** (trimiterea tranzacțiilor este dezactivată la nivelul edge); rulați propriul nod pentru scrieri SVM. Pentru sarcini intensive sau de producție, rulați propriul nod — consultați [Rularea unui nod](/developer-guide/running-a-node).
:::

## Token și adrese

| Element | Valoare |
|---|---|
| **Denom de afișare** | QOR |
| **Denom de bază** | uqor (1 QOR = 10⁶ uqor) |
| **Zecimale în funcție de interfață** | Cosmos **6** (`uqor`) · EVM **18** (stil wei; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1.000 lamports) |
| **Tip de monedă HD (BIP-44)** | `118` |
| **Prefix de cont Bech32** | `qor` (de ex. `qor1...`) |
| **Prefix de validator Bech32** | `qorvaloper` (de ex. `qorvaloper1...`) |

Cele trei interfețe expun **un singur sold nativ QOR unificat**: aceeași cheie controlează aceleași fonduri sub formele sale de adresă `qor1...` (Cosmos), `0x...` (EVM) și base58 (SVM).

## Porturi standard

Acestea sunt porturile de serviciu standard expuse de un nod QoreChain pe care îl rulați dumneavoastră.

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

- Pentru conectarea nodului, peers, genesis și snapshot-uri, urmați [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) sau [Conectarea la Testnet](/getting-started/connecting-to-testnet).
- Pentru acces programatic dintr-o aplicație, folosiți [QoreChain SDK](/sdk/overview), care rezolvă configurația rețelei pentru dumneavoastră.
- **Exploratorul de blocuri** public se află la [explore.qore.network](https://explore.qore.network); Dashboard-ul de la [dashboard.qorechain.io](https://dashboard.qorechain.io) include propria vedere de explorator, iar **Faucet-ul** de testnet este accesibil acolo (consultați [Faucet-ul din Dashboard](/dashboard/faucet)).
- Această documentație este publicată la [docs.qorechain.io](https://docs.qorechain.io).

## Adăugare în MetaMask

Pentru a adăuga o rețea QoreChain într-un portofel EVM precum MetaMask, folosiți chain ID-urile EVM de mai sus — **9801** pentru mainnet cu `https://evm.qore.host` și **9800** pentru testnet cu `https://evm-testnet.qore.host` — cu `https://explore.qore.network` ca URL al exploratorului de blocuri. Consultați [Configurarea portofelului](/getting-started/wallet-setup) pentru ghidul pas cu pas.

## Pagini conexe

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — alăturați-vă rețelei live `qorechain-vladi`.
* [Conectarea la Testnet](/getting-started/connecting-to-testnet) — alăturați-vă testnet-ului Diana.
* [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) — depuneri, retrageri și operarea nodurilor pentru integratori.
* [Parametrii lanțului](/appendix/chain-parameters) — configurația canonică a lanțului.
* [Prezentare generală SDK](/sdk/overview) — rezolvați configurația rețelei din cod.
