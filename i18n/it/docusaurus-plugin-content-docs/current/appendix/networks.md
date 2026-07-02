---
slug: /appendix/networks
title: Reti
sidebar_label: Reti
sidebar_position: 4
---

# Reti

Un riferimento consolidato per le reti QoreChain — identificatori di chain, chain ID EVM, denominazione del token, prefissi degli indirizzi, endpoint pubblici e porte di servizio standard.

## Le reti in sintesi

| | Mainnet | Testnet |
|---|---|---|
| **Stato** | Attiva | Testnet attiva |
| **Chain ID Cosmos** | `qorechain-vladi` | `qorechain-diana` |
| **Chain ID EVM (EIP-155)** | **9801** (esadecimale `0x2649`) | **9800** (esadecimale `0x2648`) |
| **Attiva dal** | 7 giugno 2026, 23:59 UTC | — |
| **Versione della chain** | v3.1.82 | v3.1.82 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Prezzo minimo del gas** | `0.1uqor` | `0.1uqor` |
| **Guida alla connessione** | [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) | [Connessione alla Testnet](/getting-started/connecting-to-testnet) |

## Endpoint pubblici {#public-endpoints}

Tutti gli endpoint pubblici sono serviti tramite HTTPS.

| Servizio | Mainnet | Testnet |
|---|---|---|
| RPC di consenso | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| WebSocket di consenso | `wss://rpc.qore.host/websocket` | `wss://rpc-testnet.qore.host/websocket` |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| JSON-RPC EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| WebSocket EVM | — | `wss://evm-ws-testnet.qore.host` |
| JSON-RPC SVM (compatibile Solana, sola lettura) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |
| Esploratore di blocchi | [explore.qore.network](https://explore.qore.network) | [explore.qore.network](https://explore.qore.network) (passare a Testnet) |
| Download (binario / genesis / snapshot) | [download.qore.host](https://download.qore.host) | — |

:::note
Gli endpoint SVM pubblici sono in **sola lettura** (l'invio di transazioni è disabilitato a livello di edge); esegui il tuo nodo per le scritture SVM. Per carichi di lavoro intensivi o di produzione, esegui il tuo nodo — vedi [Eseguire un nodo](/developer-guide/running-a-node).
:::

## Token e indirizzi

| Voce | Valore |
|---|---|
| **Denominazione di visualizzazione** | QOR |
| **Denominazione base** | uqor (1 QOR = 10⁶ uqor) |
| **Decimali per interfaccia** | Cosmos **6** (`uqor`) · EVM **18** (in stile wei; 1 uqor = 10¹² wei) · SVM **9** (lamports; 1 uqor = 1.000 lamports) |
| **Coin type HD (BIP-44)** | `118` |
| **Prefisso Bech32 degli account** | `qor` (es. `qor1...`) |
| **Prefisso Bech32 dei validatori** | `qorvaloper` (es. `qorvaloper1...`) |

Le tre interfacce espongono **un unico saldo QOR nativo unificato**: la stessa chiave controlla gli stessi fondi nelle sue forme di indirizzo `qor1...` (Cosmos), `0x...` (EVM) e base58 (SVM).

## Porte standard

Queste sono le porte di servizio standard esposte da un nodo QoreChain che esegui tu stesso.

| Servizio | Porta |
|---|---|
| RPC Cosmos | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| JSON-RPC EVM | 8545 |
| JSON-RPC EVM (WebSocket) | 8546 |
| JSON-RPC SVM (compatibile Solana) | 8899 |
| Metriche Prometheus | 26660 |

## Endpoint e accesso

- Per la connessione del nodo, i peer, il genesis e gli snapshot, segui [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) o [Connessione alla Testnet](/getting-started/connecting-to-testnet).
- Per l'accesso programmatico da un'applicazione, usa il [QoreChain SDK](/sdk/overview), che risolve automaticamente la configurazione di rete.
- L'**esploratore di blocchi** pubblico è disponibile su [explore.qore.network](https://explore.qore.network); la Dashboard su [dashboard.qorechain.io](https://dashboard.qorechain.io) include la propria vista esploratore, e il **Faucet** della testnet è raggiungibile da lì (vedi [Faucet della Dashboard](/dashboard/faucet)).
- Questa documentazione è pubblicata su [docs.qorechain.io](https://docs.qorechain.io).

## Aggiungere a MetaMask

Per aggiungere una rete QoreChain a un portafoglio EVM come MetaMask, usa i chain ID EVM indicati sopra — **9801** per la mainnet con `https://evm.qore.host` e **9800** per la testnet con `https://evm-testnet.qore.host` — con `https://explore.qore.network` come URL dell'esploratore di blocchi. Vedi [Configurazione del portafoglio](/getting-started/wallet-setup) per la procedura passo passo.

## Correlati

* [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) — unisciti alla rete live `qorechain-vladi`.
* [Connessione alla Testnet](/getting-started/connecting-to-testnet) — unisciti alla testnet Diana.
* [Guida per exchange e integratori](/developer-guide/exchange-integration) — depositi, prelievi e operazioni del nodo per gli integratori.
* [Parametri della chain](/appendix/chain-parameters) — configurazione canonica della chain.
* [Panoramica dell'SDK](/sdk/overview) — risolvi la configurazione di rete dal codice.
