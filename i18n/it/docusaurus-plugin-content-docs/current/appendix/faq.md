---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Domande frequenti

Domande generali su QoreChain, con risposte tratte dalla documentazione. Ogni risposta rimanda alla pagina autorevole per il dettaglio completo. Per le domande specifiche sull'SDK, vedi le [FAQ dell'SDK](/sdk/faq).

### La mainnet è attiva?

Sì. La mainnet di QoreChain (chain `qorechain-vladi`, EVM chain ID 9801) è attiva dal 7 giugno 2026 ed esegue la release v3.2.4 (applicata all'altezza 3.742.566 il 23 ottobre 2026 dalla proposta di governance 13; la proposta di governance 14 applicherebbe la v3.2.5 all'altezza 3.906.833 ed era nel periodo di voto al momento della stesura); la testnet, `qorechain-diana`, esegue la v3.2.6 (applicata all'altezza 8.970.638 il 27 ottobre 2026). Vedi [Reti](/appendix/networks) e [Connessione alla mainnet](/getting-started/connecting-to-mainnet).

### Quali sono i chain ID e gli EVM chain ID?

La mainnet è la chain Cosmos `qorechain-vladi` con EVM chain ID **9801** (esadecimale `0x2649`); la testnet è `qorechain-diana` con EVM chain ID **9800** (esadecimale `0x2648`). Vedi [Reti](/appendix/networks) per la tabella completa.

### Come vengono distribuite le commissioni di transazione?

Le commissioni raccolte sono suddivise **37% ai validatori, 30% bruciato, 20% alla treasury della comunità, 10% agli staker e 3% ai light node**. La ripartizione si applica a tutto ciò che si trova nel fee collector, compresa l'emissione di epoca. Vedi [Tokenomics](/architecture/tokenomics#fee-distribution).

### Cos'è PRISM?

PRISM è il livello di ottimizzazione basato sul reinforcement learning incorporato nel Consensus Engine di QoreChain. Osserva le metriche di rete e propone aggiustamenti deterministici dei parametri di consenso sotto controlli di sicurezza con circuit breaker. Oggi funziona in modalità di osservazione: non è caricata alcuna policy addestrata, quindi non modifica alcun parametro. Vedi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Il bridge cross-chain è attivo?

No. Il modulo bridge è distribuito, ma tutte le 37 configurazioni di chain sono in sospeso, non è registrato alcun validatore del bridge e sulla mainnet non esiste alcun canale IBC (la testnet ha un solo canale di trasferimento ICS-20 verso una chain di test, aperto per i test IBC, e nessuno verso le controparti pianificate). È progettato attorno a 37 configurazioni di chain e fino a 8 controparti IBC; considera questi obiettivi come intento di progettazione. Vedi [Architettura del bridge](/architecture/bridge-architecture).

### Come collego un wallet?

Usa il wallet ufficiale [QoreX](/qorex/overview), oppure aggiungi una rete QoreChain a un wallet EVM usando gli EVM chain ID (9801 mainnet, 9800 testnet). Vedi [Configurazione del wallet](/getting-started/wallet-setup).

### Come ottengo i token di testnet?

Usa il faucet di testnet sulla Dashboard. Vedi [Faucet della Dashboard](/dashboard/faucet) e [Connessione alla testnet](/getting-started/connecting-to-testnet).

### Cosa sono fUSD, fETH e fBTC?

Token di test solo per la testnet (FestUSD, FestETH e FestBTC, con 6, 18 e 8 decimali) creati per il builder fest. Non hanno alcun valore, non esistono sulla mainnet e sono detenuti come bank coin con i denom sensibili alle maiuscole `erc20:<contract address>`. Il Faucet della testnet può inviarli insieme a un claim di QOR. Vedi [Token di test Fest](/dashboard/faucet#fest-tokens).

### Come eseguo un nodo, un validatore o un light node?

Per un nodo completo, vedi [Esecuzione di un nodo](/developer-guide/running-a-node). Per un validatore, vedi [Esecuzione di un validatore](/developer-guide/running-a-validator). Per un light node, vedi [Light Node](/light-node/overview); la registrazione al programma di ricompense dei light node è aperta e subordinata a una licenza ([stato](/light-node/overview#reward-program-status)).

### Quale schema di firma usa QoreChain?

QoreChain usa uno schema ibrido post-quantistico che combina il classico **secp256k1 (ECDSA)** con il post-quantistico **ML-DSA-87 (Dilithium-5)**. Questo schema ibrido è richiesto per impostazione predefinita sul percorso delle transazioni Cosmos, con la modalità di applicazione controllata dalla governance. Sulla lane EVM la firma resta secp256k1, e un account deve inoltre possedere una chiave ML-DSA registrata e una finestra di autorizzazione aperta (dalla v3.2.0). Vedi [Sicurezza post-quantistica](/architecture/post-quantum-security).

### Perché la mia transazione EVM viene rifiutata con «no open EVM authorisation window»?

Dalla v3.2.0 la lane EVM ammette una transazione solo da un account che abbia una chiave post-quantistica registrata e una finestra di autorizzazione aperta. Apri una finestra con una transazione della lane Cosmos firmata in modo post-quantistico, poi riprova. Vedi [Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

### Quanti validatori ha la mainnet?

Otto validatori bonded al 27 ottobre 2026, con circa 60,3 milioni di QOR in bonding (il set attivo può contenerne fino a 100). La testnet ne ha quattro. Leggi il set in tempo reale su `GET /cosmos/staking/v1beta1/validators` all'indirizzo `https://api.qore.host`.

### Quale block time devo aspettarmi?

Circa 3,2 secondi sulla mainnet e circa 1,3 secondi sulla testnet (medie misurate, 27 ottobre 2026). Il block time è determinato dalla configurazione dei nodi dei validatori.

### xQORE è disponibile?

Non ancora. Il modulo di contabilità esiste, ma le transazioni di lock e unlock non sono collegate alle reti attive. Vedi [Tokenomics](/architecture/tokenomics#x-xqore).

### L'offerta di QOR è fissa?

L'offerta alla genesi era di 4.420.000.000 QOR. L'emissione di staking viene coniata entro un limite cumulativo rigido di 590.000.000 QOR (86.000 QOR per epoca dalla proposta di governance 10, ottobre 2026), e i burn rimuovono i token in modo permanente. Vedi [Tokenomics](/architecture/tokenomics#supply-and-emission).

### Come creo un rollup?

Usa il Rollup Development Kit di QoreChain. Vedi [Rollup](/rollups/overview) e il riferimento di architettura [Rollup Development Kit](/architecture/rollup-development-kit).

### Come creo una dApp?

Usa l'[SDK di QoreChain](/sdk/overview), l'SDK pubblico per la creazione di applicazioni su QoreChain nei suoi ambienti di esecuzione EVM, SVM e QoreChain Native.

### Dove posso fare domande?

Il bot della comunità QCAIA risponde alle domande su Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) e Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Vedi [Bot della comunità QCAIA](/qcaia/overview).

## Correlati

* [Reti](/appendix/networks) — riferimento per chain ID, porte ed endpoint.
* [Cos'è QoreChain](/introduction/what-is-qorechain) — panoramica della piattaforma.
* [Bot della comunità QCAIA](/qcaia/overview) — fai domande su Discord e Telegram.
