---
slug: /appendix/networks
title: Rețele
sidebar_label: Rețele
sidebar_position: 4
---

# Rețele

O referință consolidată pentru rețelele QoreChain — identificatori de lanț, ID-uri de lanț EVM, denominarea token-ului, prefixele de adresă, punctele finale publice și porturile standard de serviciu.

## Pe scurt despre rețele

| | Mainnet | Testnet |
|---|---|---|
| **Stare** | Activă | Testnet activ |
| **ID lanț Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **ID lanț EVM (EIP-155)** | **9801** (hex `0x2649`) | **9800** (hex `0x2648`) |
| **Activă din** | 7 iunie 2026 | 1 iulie 2026 (continuu de atunci; fără reset) |
| **Versiune lanț** | v3.2.4 (aplicată la înălțimea 3.742.566, 23 octombrie 2026, propunerea de guvernanță 13). v3.2.3 a fost aplicată la înălțimea 3.662.051 pe 20 octombrie 2026 | v3.2.4 (aplicată la înălțimea 8.337.253, 19 octombrie 2026) |
| **Timp de bloc (medie măsurată)** | aproximativ 3,2 s | aproximativ 1,0 s |
| **Manifest de versiune** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Preț minim gas** | `0.1uqor` | `0.1uqor` |
| **Ghid de conectare** | [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) | [Conectarea la Testnet](/getting-started/connecting-to-testnet) |

Ambele manifeste sunt sursa de adevăr pentru versiunea pe care ar trebui să o ruleze un nod nou. Ambele rețele primesc upgrade-uri coordonate prin guvernanță, așa că fiecare manifest conține `upgradeHeight` pentru versiunea sa curentă și un `minCompatible` egal cu acea versiune (3.2.4 pe ambele rețele, verificat la 23 octombrie 2026). Testnet-ul rulează v3.2.4 din 19 octombrie 2026, iar mainnet-ul din 23 octombrie 2026.

## Puncte finale publice {#public-endpoints}

Toate punctele finale publice sunt furnizate prin HTTPS.

| Serviciu | Mainnet | Testnet |
|---|---|---|
| RPC de consens | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket de consens | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| REST Cosmos (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| WebSocket EVM | — | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC SVM (compatibil Solana, doar citire) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Explorator de blocuri | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (comută pe Testnet) |
| Descărcări (binar / genesis / instantaneu) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Punctele finale publice SVM sunt **doar pentru citire** (trimiterea tranzacțiilor este dezactivată la marginea rețelei); rulează propriul nod pentru operațiuni de scriere SVM. Pentru sarcini de lucru grele sau de producție, rulează propriul nod — vezi [Rularea unui nod](/developer-guide/running-a-node). Nu există un punct final gRPC public și nici un WebSocket EVM public pentru mainnet. Pe punctele finale publice EVM, `eth_getLogs` acceptă cel mult 10.000 de blocuri per interogare, iar `txpool_content` este dezactivat (un nod auto-găzduit servește întregul namespace); vezi [Namespace-ul eth_](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Dacă un script primește `403 Forbidden` de la un punct final public, setează explicit un header `User-Agent` (agentul implicit `urllib` din Python este blocat; clienții `requests`, `curl`, Node și Go funcționează ca atare).
:::

:::caution Lane-ul de tranzacții SVM este momentan dezactivat
Pe lângă faptul că punctele finale publice sunt doar pentru citire, lane-ul de execuție SVM este **momentan dezactivat la nivelul întregii rețele pentru trimiterea de tranzacții** (începând cu versiunea de lanț v3.1.89, 22 august) — aceasta include trimiterea prin propriul nod, nu doar prin punctele finale publice `svm.qore.host` / `svm-testnet.qore.host`. Vezi [Dezvoltare SVM](/developer-guide/svm-development) pentru detalii. Folosește interfețele Cosmos sau EVM până la redeschiderea lane-ului.
:::

## Token și adrese

| Element | Valoare |
|---|---|
| **Denominare de afișare** | QOR |
| **Denominare de bază** | uqor (1 QOR = 10⁶ uqor) |
| **Zecimale pe interfață** | Cosmos **6** (`uqor`) · EVM **18** (stil wei; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1,000 lamports) |
| **Tip de monedă HD (BIP-44)** | `118` |
| **Prefix Bech32 pentru cont** | `qor` (ex. `qor1...`) |
| **Prefix Bech32 pentru validator** | `qorvaloper` (ex. `qorvaloper1...`) |

Cele trei interfețe expun **un singur sold nativ QOR unificat**: aceeași cheie controlează aceleași fonduri sub formele de adresă `qor1...` (Cosmos), `0x...` (EVM) și base58 (SVM).

## Porturi standard

Acestea sunt porturile standard de serviciu expuse de un nod QoreChain rulat de tine.

| Serviciu | Port |
|---|---|
| RPC Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| JSON-RPC EVM | 8545 |
| JSON-RPC EVM (WebSocket) | 8546 |
| JSON-RPC SVM (compatibil Solana) | 8899 |
| Metrici Prometheus | 26660 |

## Puncte finale și acces

- Pentru conectarea nodului, peers, genesis și instantanee, urmează [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) sau [Conectarea la Testnet](/getting-started/connecting-to-testnet).
- Pentru acces programatic dintr-o aplicație, folosește [QoreChain SDK](/sdk/overview), care rezolvă configurația rețelei pentru tine.
- **Exploratorul de blocuri** public se află la [explore.qore.network](https://explore.qore.network); Dashboard-ul de la [dashboard.qorechain.io](https://dashboard.qorechain.io) include propria vizualizare de explorator, iar **Faucet**-ul de testnet este accesibil de acolo (vezi [Faucet Dashboard](/dashboard/faucet)).
- Această documentație este publicată la [docs.qorechain.io](https://docs.qorechain.io).

## Adăugare în MetaMask

Pentru a adăuga o rețea QoreChain într-un portofel EVM precum MetaMask, folosește ID-urile de lanț EVM de mai sus — **9801** pentru mainnet cu `https://evm.qore.host`, și **9800** pentru testnet cu `https://evm-testnet.qore.host` — cu `https://explore.qore.network` ca URL de explorator de blocuri. Vezi [Configurarea portofelului](/getting-started/wallet-setup) pentru ghidul pas cu pas.

## Legături conexe

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — alătură-te rețelei active `qorechain-vladi`.
* [Conectarea la Testnet](/getting-started/connecting-to-testnet) — alătură-te testnet-ului Diana.
* [Ghid pentru exchange-uri și integratori](/developer-guide/exchange-integration) — depuneri, retrageri și operațiuni de nod pentru integratori.
* [Parametrii lanțului](/appendix/chain-parameters) — configurația canonică a lanțului.
* [Prezentare generală SDK](/sdk/overview) — rezolvă configurația rețelei din cod.
