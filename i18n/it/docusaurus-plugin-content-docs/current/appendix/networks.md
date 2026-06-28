---
slug: /appendix/networks
title: Reti
sidebar_label: Reti
sidebar_position: 4
---

# Reti

Un riferimento consolidato per le reti di QoreChain — identificatori di chain, EVM chain ID, denominazione del token, prefissi degli indirizzi e porte di servizio standard. Per i dettagli completi di connessione dei nodi (endpoint pubblici, seed e genesis), segui le guide di connessione collegate di seguito; gli operatori ottengono gli endpoint pubblici, i seed e il genesis correnti dalla release ufficiale.

## Reti a colpo d'occhio

| | Mainnet | Testnet |
|---|---|---|
| **Stato** | Attiva | Testnet attiva |
| **Cosmos chain ID** | `qorechain-vladi` | `qorechain-diana` |
| **EVM chain ID (EIP-155)** | **9801** (esadecimale `0x2649`) | **9800** (esadecimale `0x2648`) |
| **Attiva dal** | 7 giugno 2026, 23:59 UTC | — |
| **Versione della chain** | v3.1.80 | v3.1.80 |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Guida di connessione** | [Connessione alla mainnet](/getting-started/connecting-to-mainnet) | [Connessione alla testnet](/getting-started/connecting-to-testnet) |

## Token e indirizzi

| Elemento | Valore |
|---|---|
| **Denom di visualizzazione** | QOR |
| **Denom base** | uqor (1 QOR = 10⁶ uqor) |
| **Prefisso Bech32 account** | `qor` (ad es. `qor1...`) |
| **Prefisso Bech32 validatore** | `qorvaloper` (ad es. `qorvaloper1...`) |

## Porte standard

Queste sono le porte di servizio standard esposte da un nodo QoreChain. Gli hostname effettivi degli endpoint pubblici sono pubblicati con la release ufficiale — vedi le guide di connessione sopra.

| Servizio | Porta |
|---|---|
| Cosmos RPC | 26657 |
| P2P | 26656 |
| REST / API | 1317 |
| gRPC | 9090 |
| EVM JSON-RPC | 8545 |
| EVM JSON-RPC (WebSocket) | 8546 |
| SVM (compatibile Solana) JSON-RPC | 8899 |
| Metriche Prometheus | 26660 |

## Endpoint e accesso

QoreChain non pubblica hostname pubblici fissi RPC/REST/EVM in questo riferimento. Invece:

- Per la connessione dei nodi, i seed e il genesis, segui [Connessione alla mainnet](/getting-started/connecting-to-mainnet) o [Connessione alla testnet](/getting-started/connecting-to-testnet). Gli operatori ottengono gli endpoint pubblici, i seed e il genesis correnti dalla release ufficiale.
- Per l'accesso programmatico da un'applicazione, usa l'[SDK di QoreChain](/sdk/overview), che risolve la configurazione di rete per te.
- L'**Explorer** on-chain è disponibile tramite la Dashboard su [dashboard.qorechain.io](https://dashboard.qorechain.io), e il **Faucet** di testnet è anch'esso raggiungibile lì (vedi [Faucet della Dashboard](/dashboard/faucet)).
- Questa documentazione è pubblicata su [docs.qorechain.io](https://docs.qorechain.io).

## Aggiungere a MetaMask

Per aggiungere una rete QoreChain a un wallet EVM come MetaMask, usa gli EVM chain ID sopra — **9801** per la mainnet e **9800** per la testnet — insieme all'endpoint EVM JSON-RPC della rete a cui ti stai connettendo. Vedi [Configurazione del wallet](/getting-started/wallet-setup) per la procedura passo passo.

## Correlati

* [Connessione alla mainnet](/getting-started/connecting-to-mainnet) — unisciti alla rete attiva `qorechain-vladi`.
* [Connessione alla testnet](/getting-started/connecting-to-testnet) — unisciti alla testnet Diana.
* [Parametri della chain](/appendix/chain-parameters) — configurazione canonica della chain.
* [Panoramica dell'SDK](/sdk/overview) — risolvi la configurazione di rete dal codice.
