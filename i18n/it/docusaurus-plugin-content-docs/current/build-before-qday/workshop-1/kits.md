---
slug: /build-before-qday/workshop-1/kits
title: I kit di QoreChain
sidebar_label: Kit
sidebar_position: 10
---

# I kit di QoreChain

Lo stack per sviluppatori di QoreChain è composto da quattordici kit. Questa pagina elenca ciascuno in una riga, con la sua versione e dove è pubblicato, e si chiude con sei idee che potresti costruire con essi. Dodici kit sono disponibili. Due non sono rilasciati: il kit Asset è una proposta e il light client PQ è una specifica.

## Innovazioni {#innovations}

- **La firma ibrida ML-DSA-87 + secp256k1 è integrata nell'SDK, nei wallet e in QoreSign**, quindi un'app non deve implementare da sola la firma post-quantistica.
- **Una transazione firmata in modo ibrido e verificata on chain** è la prova condivisa tra le app: vedi il [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), il [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) e l'[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **La stessa struttura in molti linguaggi.** L'SDK, QoreSign e la libreria PQC sono rilasciati in più linguaggi e verificati con vettori di test condivisi.

## Costruire app {#build-apps}

| Kit | Cosa fa | Versione e registro |
| --- | --- | --- |
| [SDK di QoreChain](/sdk/overview) | Un unico client per le lane native, EVM e SVM con firma ibrida, registrazione della chiave PQC, helper per la finestra EVM, livelli di staking, tokenomics, AMM, chiamate cross-VM e rollup. TypeScript, Python, Rust, Java e Go. | 0.13.0: npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Genera un progetto funzionante con un solo comando a partire da sette template: hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm e rollup-app. | 0.13.1: npm |
| [RDK, il Rollup Development Kit](/rollups/overview) | Crea, avvia e gestisci rollup specifici per applicazione che si regolano su QoreChain, con batch di settlement firmati, prelievi e letture di data availability. | `@qorechain/rdk` 0.8.0, cinque linguaggi |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Wallet e firma {#wallets-signing}

| Kit | Cosa fa | Versione e registro |
| --- | --- | --- |
| [QoreX e qorex-integrations](/developer-tools/qorex-integrations) | Il wallet ufficiale custodisce entrambe le chiavi, firma in modo ibrido e ti mostra che cosa firmi. Le integrazioni aggiungono QoreX a RainbowKit e wagmi, cosmos-kit e Interchain Kit, con tipi, un wallet finto e fixture Playwright. Vedi anche la [panoramica di QoreX](/qorex/overview). | QoreX 1.2.3 (iOS, Android), estensione 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Aggiunge QoreChain ai wallet che le persone usano già (Keplr, Leap, Cosmostation, MetaMask, Phantom), compresa la firma ibrida ML-DSA-87 che la catena richiede. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Firma ibrida per wallet e backend diversi da QoreX: deriva la chiave ML-DSA, firma le transazioni della lane nativa con entrambe le chiavi, verifica localmente le firme ibride, simula prima di firmare e Sign In With QoreChain. | 0.2.0: TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Le primitive post-quantistiche alla base di tutto il resto: ML-DSA (FIPS 204), ML-KEM (FIPS 203) e SHAKE-256, compatibili byte per byte tra i linguaggi e verificate con vettori di test condivisi. | `@qorechain/pqc` 0.2.3, sei linguaggi |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Dati e privacy {#data-privacy}

| Kit | Cosa fa | Versione e registro |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Cifra i dati verso gli account QoreChain con ML-KEM-1024 (ibrido con X25519 per impostazione predefinita). Un account pubblica la sua chiave on chain e chiunque può cifrare verso di essa. Più destinatari, chiavi per i revisori e chiavi di gruppo a rotazione. | 0.1.0: TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Un server Model Context Protocol e uno strumento a riga di comando che dà agli strumenti per sviluppatori compatibili accesso in sola lettura a QoreChain: blocchi, transazioni, account, validatori, livelli di staking, stato della firma ibrida, letture dei contratti e stime delle commissioni. Non firma mai, non custodisce mai chiavi e non trasmette mai. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infrastruttura e conformità {#infra-compliance}

| Kit | Cosa fa | Versione e registro |
| --- | --- | --- |
| [QORel](/qorel/overview) | Un relayer IBC, fork di Hermes, con un livello di signer collegabile, così si possono inoltrare i messaggi di catene che richiedono una firma post-quantistica su ogni transazione. Le catene standard mantengono l'esatto formato di Hermes. | 0.1.0: GitHub, immagine container, Homebrew |
| [Kit di custodia](/developer-tools/custody-kit) | Per i custodi: che cosa richiede ogni lane, validazione degli indirizzi, rilevamento dei depositi, firma e verifica dei prelievi, staking e gestione della chiave ML-DSA-87, con vettori di test e codice di riferimento. | 0.1.0: TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Fa l'inventario della crittografia di un deployment (configurazione dei nodi, chiavi per tipo, endpoint TLS, sorgenti Solidity, stato della catena) ed esporta un CBOM CycloneDX 1.6, con output associati a FINMA Guidance 05/2026, alla roadmap PQC dell'UE e a DORA. Uno strumento di inventario, non una certificazione. | `@qorechain/qorescan` 0.1.0 |
| [Kit Asset](/developer-tools/asset-kit) | **Proposta, non rilasciato nel suo insieme.** Strumenti per asset tokenizzati regolamentati: adattatori ERC-3643 e CMTAT con verifica post-quantistica del detentore, vault ERC-4626 e ERC-7540, una console per gli emittenti e client. I contratti EVM sono disponibili; i moduli nativi per gli asset sono una proposta. | 0.1.0 |
| [Light client PQ](/developer-tools/pq-light-client) | **Specifica, non rilasciato.** Un light client che segue checkpoint firmati con ML-DSA-87. Oggi QoreChain non produce questi checkpoint. Il repository contiene la specifica e i verificatori di riferimento (Go, Rust, TypeScript) così che il progetto possa essere esaminato. | 0.1.0 (specifica) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Sei cose che potresti costruire {#ideas}

| Idea | Costruita con | Che cos'è |
| --- | --- | --- |
| Checkout a prova di quantistico | SDK, QoreX | Un pulsante "paga con QOR" per un negozio web in cui ogni pagamento è firmato in modo ibrido. |
| Starter per hackathon | create-qorechain-dapp | Da zero a un contratto distribuito sulla testnet in dieci minuti, un comando per studente. |
| Sign In With QoreChain | QoreSign | Accesso senza password per una web app, con la firma ibrida verificata sul tuo server. |
| Asta a offerte sigillate | QoreSeal | Le offerte restano cifrate fino alla rivelazione. |
| Inventario di prontezza PQC | QoreScan | Un inventario della crittografia e un file CBOM per un team fintech e i suoi revisori. |
| Inoltra il tuo canale | QORel | Inoltra messaggi tra la testnet di QoreChain e un'altra catena testnet Cosmos. |

## Ottenere il codice {#get-the-code}

Ogni kit ha la propria pagina del manuale, linkata sopra. Le app di esempio di questo workshop sono nel repository pubblico [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), e la pagina di ogni app le percorre dal primo all'ultimo comando:

```sh
git clone https://github.com/qorechain/build-before-qday
```
