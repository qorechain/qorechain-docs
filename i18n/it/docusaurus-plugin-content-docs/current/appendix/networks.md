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
| **Attiva dal** | 7 giugno 2026 | 1 luglio 2026 (in continuo da allora; nessun reset) |
| **Versione della chain** | v3.2.5 (applicata all'altezza 3.906.833, 29 ottobre 2026, proposta di governance 14). La v3.2.4 è stata applicata all'altezza 3.742.566 il 23 ottobre 2026 e la v3.2.3 all'altezza 3.662.051 il 20 ottobre 2026 | v3.2.6 (applicata all'altezza 8.970.638, 27 ottobre 2026; la v3.2.5 è stata applicata all'altezza 8.890.800 il 26 ottobre e la v3.2.4 all'altezza 8.337.253 il 19 ottobre) |
| **Tempo di blocco (media misurata)** | circa 3,1 s | circa 1,3 s |
| **Manifest di rilascio** | [download.qore.host/mainnet/latest.json](https://download.qore.host/mainnet/latest.json) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |
| **Framework** | Cosmos SDK v0.53 | Cosmos SDK v0.53 |
| **Prezzo minimo del gas** | `0.1uqor` | `0.1uqor` |
| **Token di test** | Nessuno | Token Fest fUSD, fETH e fBTC (senza valore; vedi [Faucet](/dashboard/faucet#fest-tokens)) |
| **Guida alla connessione** | [Connessione alla Mainnet](/getting-started/connecting-to-mainnet) | [Connessione alla Testnet](/getting-started/connecting-to-testnet) |

Entrambi i manifest sono la fonte di verità per la release che un nodo nuovo deve eseguire. Entrambe le reti ricevono upgrade coordinati tramite la governance, quindi ogni manifest riporta l'`upgradeHeight` della propria release corrente e un `minCompatible` uguale a quella release (3.2.5 sulla mainnet, verificato il 30 ottobre 2026, e 3.2.6 sulla testnet, verificato il 27 ottobre 2026). La testnet riceve ogni release per prima: la mainnet esegue la v3.2.5 dal 29 ottobre 2026 (altezza 3.906.833, proposta di governance 14), quindi un nodo che si unisce alla mainnet deve continuare a seguire il proprio manifest. Non copiate mai un binario da una rete all'altra.

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
| Download (binario / genesis / snapshot) | [download.qore.host](https://download.qore.host) | [download.qore.host/testnet/latest.json](https://download.qore.host/testnet/latest.json) |

:::note
Gli endpoint SVM pubblici sono in **sola lettura** (l'invio di transazioni è disabilitato a livello di edge); esegui il tuo nodo per le scritture SVM. Per carichi di lavoro intensivi o di produzione, esegui il tuo nodo — vedi [Eseguire un nodo](/developer-guide/running-a-node). Non esistono né un endpoint gRPC pubblico né un WebSocket EVM pubblico sulla mainnet. Sugli endpoint EVM pubblici, `eth_getLogs` accetta al massimo 10.000 blocchi per query e `txpool_content` è disabilitato (un nodo self-hosted serve il namespace completo); vedi [Namespace eth_](/api-reference/json-rpc-eth_-namespace).
:::

:::tip
Se uno script riceve `403 Forbidden` da un endpoint pubblico, imposta un header `User-Agent` esplicito (l'agent `urllib` predefinito di Python è bloccato; i client `requests`, `curl`, Node e Go funzionano così come sono).
:::

:::caution Lane delle transazioni SVM attualmente disabilitata
Oltre al fatto che gli endpoint pubblici sono in sola lettura, la lane di esecuzione SVM è **attualmente disabilitata a livello di rete per l'invio di transazioni** (a partire dalla versione della chain v3.1.89, 22 agosto) — questo include l'invio tramite il tuo stesso nodo, non solo gli endpoint pubblici `svm.qore.host` / `svm-testnet.qore.host`. Vedi [Sviluppo SVM](/developer-guide/svm-development) per i dettagli. Usa le interfacce Cosmos o EVM finché la lane non riapre.
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
