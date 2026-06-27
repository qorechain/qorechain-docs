---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Domande frequenti

Domande generali su QoreChain, con risposte tratte dalla documentazione. Ogni risposta rimanda alla pagina autorevole per il dettaglio completo. Per le domande specifiche sull'SDK, vedi le [FAQ dell'SDK](/sdk/faq).

### La mainnet è attiva?

Sì. La mainnet di QoreChain (chain `qorechain-vladi`, EVM chain ID 9801) è attiva dal 7 giugno 2026. Vedi [Reti](/appendix/networks) e [Connessione alla mainnet](/getting-started/connecting-to-mainnet).

### Quali sono i chain ID e gli EVM chain ID?

La mainnet è la chain Cosmos `qorechain-vladi` con EVM chain ID **9801** (esadecimale `0x2649`); la testnet è `qorechain-diana` con EVM chain ID **9800** (esadecimale `0x2648`). Vedi [Reti](/appendix/networks) per la tabella completa.

### Come vengono distribuite le commissioni di transazione?

Le commissioni raccolte sono suddivise **37% ai validatori, 30% bruciato, 20% alla treasury della comunità, 10% agli staker e 3% ai light node**. Vedi [Tokenomics](/architecture/tokenomics).

### Cos'è PRISM?

PRISM è il livello di ottimizzazione basato sul reinforcement learning incorporato nel Consensus Engine di QoreChain. Osserva le metriche di rete e propone aggiustamenti deterministici dei parametri di consenso sotto controlli di sicurezza con circuit breaker. Vedi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Il bridge cross-chain è attivo?

Il bridge cross-chain è attualmente in testnet e in attesa — non è ancora un sistema di produzione. È progettato attorno a 37 configurazioni di chain QCB e 8 canali IBC; considera questi obiettivi come intento di progettazione piuttosto che garanzie attive sulla mainnet. Vedi [Architettura del bridge](/architecture/bridge-architecture).

### Come collego un wallet?

Configura un wallet e aggiungi una rete QoreChain usando gli EVM chain ID (9801 mainnet, 9800 testnet). Vedi [Configurazione del wallet](/getting-started/wallet-setup).

### Come ottengo i token di testnet?

Usa il faucet di testnet sulla Dashboard. Vedi [Faucet della Dashboard](/dashboard/faucet) e [Connessione alla testnet](/getting-started/connecting-to-testnet).

### Come eseguo un nodo, un validatore o un light node?

Per un nodo completo, vedi [Esecuzione di un nodo](/developer-guide/running-a-node). Per un validatore, vedi [Esecuzione di un validatore](/developer-guide/running-a-validator). Per un light node, vedi [Light Node](/light-node/overview).

### Quale schema di firma usa QoreChain?

QoreChain usa uno schema ibrido post-quantistico che combina il classico **secp256k1 (ECDSA)** con il post-quantistico **ML-DSA-87 (Dilithium-5)**. Questo schema ibrido è richiesto per impostazione predefinita sul percorso delle transazioni Cosmos, con la modalità di applicazione controllata dalla governance. Vedi [Sicurezza post-quantistica](/architecture/post-quantum-security).

### Come creo un rollup?

Usa il Rollup Development Kit di QoreChain. Vedi [Rollup](/rollups/overview) e il riferimento di architettura [Rollup Development Kit](/architecture/rollup-development-kit).

### Come creo una dApp?

Usa l'[SDK di QoreChain](/sdk/overview), l'SDK pubblico per la creazione di applicazioni su QoreChain nei suoi ambienti di esecuzione EVM, SVM e CosmWasm.

### Dove posso fare domande?

Il bot della comunità QCAIA risponde alle domande su Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) e Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Vedi [Bot della comunità QCAIA](/qcaia/overview).

## Correlati

* [Reti](/appendix/networks) — riferimento per chain ID, porte ed endpoint.
* [Cos'è QoreChain](/introduction/what-is-qorechain) — panoramica della piattaforma.
* [Bot della comunità QCAIA](/qcaia/overview) — fai domande su Discord e Telegram.
