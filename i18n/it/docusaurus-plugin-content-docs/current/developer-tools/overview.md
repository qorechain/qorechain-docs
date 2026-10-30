---
slug: /developer-tools/overview
title: Pacchetti per sviluppatori
sidebar_label: Panoramica
sidebar_position: 1
---

# Pacchetti per sviluppatori

QoreChain pubblica i propri strumenti per sviluppatori come piccoli pacchetti sui registri pubblici (npm, PyPI, crates.io, il proxy dei moduli Go, Maven Central e Swift Package Manager). Questa pagina è l'indice: a cosa serve ogni pacchetto, il suo nome esatto nel registro, il linguaggio, la versione attuale, il comando di installazione e lo stato, e dove leggere come usarlo. È pensata per gli sviluppatori che creano dApp, wallet, backend e rollup su QoreChain e vogliono scegliere il pacchetto giusto prima di leggere una guida.

Le versioni nelle tabelle sono state lette dai registri il 27 ottobre 2026. La mainnet `qorechain-vladi` esegue la v3.2.5 (applicata il 29 ottobre 2026) e la testnet `qorechain-diana` esegue la v3.2.6. Ogni pacchetto indicato come pubblicato è sotto licenza Apache-2.0.

## Innovazioni {#innovations}

- **Un unico formato di firma ibrida in ogni linguaggio.** La chain richiede una firma secp256k1 più una firma ML-DSA-87 (FIPS 204) sulle transazioni del rail Native. QoreSign riproduce i suoi vettori di test pubblicati byte per byte in TypeScript, Rust, Go, Swift, Kotlin e Python, e `qorechain-pqc` esegue un unico insieme condiviso di vettori nei suoi sei binding, quindi una chiave o una firma creata in un linguaggio viene verificata negli altri.
- **La forma dei sign-bytes è scelta dallo stato della chain, non indovinata.** L'SDK, il wallet adapter, `chain-bridge` e gli helper di rete di QoreSign chiedono al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` per entrambi i nomi di upgrade (`v3.2.0` e `v3.1.98`) e firmano la forma v2 quando una delle due altezze è maggiore di zero. Senza un endpoint REST su queste due chain generano un errore invece di indovinare. Entrambe le reti verificano oggi la v2 (verificato il 27 ottobre 2026: `v3.2.0` applicato sulla mainnet all'altezza 2.981.742 e `v3.1.98` sulla testnet all'altezza 5.746.000).
- **Quickstart che sono stati eseguiti, non solo scritti.** Per i pacchetti che ne hanno uno, l'esempio è stato eseguito il 27 ottobre 2026 dopo l'installazione dal registro pubblico. 31 voci di quickstart su 34 sono state eseguite e hanno avuto successo; il manifest registra quali tre no (vedi [Limiti](#limits)).
- **Un unico manifest dietro le tabelle.** I nomi dei pacchetti, le versioni e i comandi di installazione di questa pagina provengono da un unico manifest leggibile da macchina con un endpoint di versione live per ogni pacchetto, gli stessi dati da cui è costruito l'hub SDK della [pagina Developers della dashboard](/dashboard/developers#sdks).

## Come si usa {#how-to-use}

Scegli in base a ciò che stai costruendo.

| Vuoi | Usa | Leggi |
|---|---|---|
| Leggere lo stato della chain, derivare account, inviare transazioni firmate in modo ibrido da uno script o da una dApp | SDK QoreChain | [Panoramica dell'SDK](/sdk/overview), [Installazione](/sdk/install), [Quickstart](/sdk/quickstart) |
| Firmare nel tuo wallet o backend, verificare firme, Sign In With QoreChain | QoreSign | [Panoramica di QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart) |
| Aggiungere QoreChain a Keplr, Leap o Cosmostation, generare wallet unificati, costruire messaggi per la finestra EVM e per le chiavi collegate | Wallet adapter | [Wallet adapter](/developer-tools/wallet-adapter) |
| Eseguire un job lato server che invia QOR, registra chiavi o distribuisce contratti | Chain bridge (oppure l'SDK) | [Chain bridge e handle](/developer-tools/chain-bridge) |
| Risolvere un `@handle` in un indirizzo verificato | Handles | [Chain bridge e handle](/developer-tools/chain-bridge#handles) |
| Permettere alla tua dApp di usare il wallet QoreX, oppure testarla senza un'estensione | Integrazioni QoreX | [Integrazioni QoreX](/developer-tools/qorex-integrations), [QoreX, per gli sviluppatori](/qorex/overview#developers) |
| Creare e gestire un rollup applicativo | RDK | [Panoramica dei rollup](/rollups/overview), [Distribuire un rollup](/rollups/deploying-a-rollup) |
| Usare da sole le primitive post-quantistiche (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Firma post-quantistica](/developer-guide/post-quantum-signing) |
| Permettere a un agente AI o a uno strumento per sviluppatori di leggere la chain (blocchi, transazioni, account, stato della firma ibrida, simulazione, trasferimenti non firmati) | Server MCP di QoreChain | [Server MCP di QoreChain](/developer-tools/mcp) |
| Leggere la chain da un terminale o da uno script di shell, con output JSON | CLI `qore` | [CLI di QoreChain](/developer-tools/qore-cli) |
| Rileggere come è stata protetta una transazione confermata (messaggi, firmatario, commissione, livello ML-DSA-87, tier) | Ispettore di transazioni di QoreSign (`inspectTransaction`) | [Panoramica di QoreSign](/qoresign/overview#inspector) |
| Cifrare dati verso account QoreChain, gruppi privati o sidechain con ML-KEM-1024 | QoreSeal | [QoreSeal](/developer-tools/qoreseal) |
| Rivedere o testare il design di un light client post-quantistico (verifica dei checkpoint) | Light client PQ | [Light client PQ](/developer-tools/pq-light-client) |
| Integrare QoreChain come custode o exchange (controlli degli indirizzi, verifica dei prelievi, accredito dei depositi) | Custody kit | [Custody kit](/developer-tools/custody-kit) |
| Fare l'inventario della crittografia di un nodo, di una rete o di sorgenti Solidity come CBOM CycloneDX | QoreScan | [QoreScan](/developer-tools/qorescan) |
| Prototipare su testnet un token con permessi per asset del mondo reale (ERC-3643, CMTAT, vault con quote ristrette, controllo del detentore post-quantistico) | Asset Kit | [Asset Kit](/developer-tools/asset-kit) |
| Costruire e testare progetti Solidity o CosmWasm su QoreChain con Foundry, Hardhat o viem | Chain developer kit (SDK 0.11.0, in arrivo) | [Chain developer kit](/developer-tools/chain-dev-sdk) |

Installa un pacchetto ed esegui prima il suo quickstart sulla testnet pubblica. Le letture non richiedono né account, né chiave, né commissione.

## Come accedere {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID | 9800 | 9801 |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC di consenso | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| SVM JSON-RPC | `https://svm-testnet.qore.host` | `https://svm.qore.host` |

- **Account e chiavi:** nessuno per le letture. Per inviare ti serve un account con QOR (i QOR di testnet provengono dal [Faucet](/dashboard/faucet)) e, sul rail Native, una chiave ML-DSA-87 registrata per esso.
- **Costo:** i pacchetti sono gratuiti. Le transazioni pagano la commissione di rete; il minimo della commissione è 0.1 uqor per gas.
- **Regole di firma:** una transazione sul rail Native deve portare una firma ibrida (secp256k1 più ML-DSA-87). Una transazione EVM è accettata solo da un account con una chiave ML-DSA-87 registrata e una finestra di autorizzazione EVM aperta. Le letture SVM funzionano e le transazioni SVM non sono ancora aperte. Vedi [Account e firma PQC](/sdk/concepts/accounts-pqc).
- **Convenzioni dei quickstart:** gli esempi leggono l'account del faucet della testnet pubblica e firmano con la frase di test pubblica (`abandon` undici volte, poi `about`). Non finanziare mai un account derivato da quella frase. Nessun quickstart invia una transazione.

### La pagina sviluppatori della dashboard {#dashboard-developers}

La dashboard ha una pagina pubblica su [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Verificata il 27 ottobre 2026, ha sette schede (guida completa: [Developers](/dashboard/developers)):

- **SDKs:** l'hub SDK. Ogni pacchetto del manifest, raggruppato per prodotto, con un selettore di linguaggio, l'ultima versione letta dal vivo da ogni registro, righe di installazione e di import con pulsanti di copia, il quickstart con l'output osservato dal team SDK, i problemi noti, e gli id di chain e gli endpoint pubblici. I pacchetti non pubblicati non mostrano alcun comando di installazione.
- **Transaction inspector:** incolla un hash di transazione di 64 caratteri esadecimali su testnet o mainnet e vedi lo stato, il firmatario, la commissione, se il livello post-quantistico si verifica e il livello di sicurezza (PQC, Enrollment, SHAKE o Classical). Usa la funzione `inspectTransaction` di QoreSign 0.1.1: vedi [Ispettore di transazioni](/qoresign/overview#inspector).
- **PQ key status:** legge la chiave ML-DSA-87 che un indirizzo ha registrato sulla chain e la sua finestra di autorizzazione EVM, su testnet o mainnet.
- **Simulator:** esegue una simulazione di una transazione firmata (`TxRaw` in base64 o esadecimale) e mostra il consumo di gas e le variazioni di saldo. Non viene trasmesso nulla.
- **Signing playground:** solo testnet. Genera nel browser una chiave ibrida usa e getta, tenuta in memoria, per firmare e verificare messaggi e richieste Sign In With QoreChain.
- **QoreX test wallet:** solo testnet. Inietta nella scheda un wallet di test (`window.qorex`, annunciato tramite EIP-6963 come "QoreX (mock)") così puoi provare i flussi delle dApp.
- **AI agents (MCP):** lo stato del server MCP di QoreChain (pubblicato) e la configurazione per un client MCP: prima `npx` in locale, più un endpoint testnet ospitato che richiede una chiave API. Vedi [Server MCP di QoreChain](/developer-tools/mcp).

Lo stesso controllo dell'inspector è disponibile nel codice come funzione di libreria `inspectTransaction` in QoreSign 0.1.1 (TypeScript). Le tabelle qui sotto e l'hub SDK mostrano gli stessi dati dei pacchetti; le tabelle sono state verificate sui registri il 27 ottobre 2026.

## Dove è pubblicato {#where-published}

Ogni nome è il nome esatto nel registro. Il link sul pacchetto apre la sua pagina nel registro. "Pubblicato" significa che la versione mostrata è installabile oggi.

### SDK QoreChain {#group-sdk}

Guide: [Panoramica dell'SDK](/sdk/overview), [Installazione](/sdk/install), [Guida React](/sdk/guides/react), [Riferimento CLI](/sdk/reference/cli). Sorgente: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/sdk`](https://www.npmjs.com/package/@qorechain/sdk) | TypeScript | 0.10.0 | `npm install @qorechain/sdk` | Pubblicato |
| [`@qorechain/react`](https://www.npmjs.com/package/@qorechain/react) | TypeScript (React) | 0.10.0 | `npm install @qorechain/react @qorechain/sdk react react-dom` | Pubblicato. Provider, hook, `ConnectButton` e il badge di stato PQC (esportato come `QuantumSafeBadge` nella 0.10.0) |
| [`@qorechain/evm`](https://www.npmjs.com/package/@qorechain/evm) | TypeScript | 0.8.0 | `npm install @qorechain/evm viem` | Pubblicato |
| [`@qorechain/svm`](https://www.npmjs.com/package/@qorechain/svm) | TypeScript | 0.8.0 | `npm install @qorechain/svm @solana/web3.js` | Pubblicato. Solo letture sulle reti live |
| [`create-qorechain-dapp`](https://www.npmjs.com/package/create-qorechain-dapp) | TypeScript (CLI) | 0.10.0 | `npx create-qorechain-dapp my-dapp` | Pubblicato |
| [`qorechain-sdk`](https://pypi.org/project/qorechain-sdk/) | Python | 0.10.0 | `pip install qorechain-sdk` | Pubblicato |
| [`qorechain-sdk`](https://crates.io/crates/qorechain-sdk) | Rust | 0.10.0 | `cargo add qorechain-sdk tokio --features tokio/macros,tokio/rt-multi-thread` | Pubblicato |
| [`github.com/qorechain/qorechain-sdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go) | Go | v0.10.0 | `go get github.com/qorechain/qorechain-sdk/packages/go@latest` | Pubblicato |
| [`io.github.qorechain:qorechain-sdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk) | Java | 0.10.0 | `implementation("io.github.qorechain:qorechain-sdk:0.10.0")` | Pubblicato |

### QoreSign {#group-qoresign}

Guide: [Panoramica di QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Vettori di test](/qoresign/vectors). Sorgente: [qorechain/qoresign](https://github.com/qorechain/qoresign). La versione 0.1.1 è stata pubblicata il 27 ottobre 2026. QoreSign firma in locale; non custodisce chiavi per te e non fa firma threshold, MPC o con hardware wallet.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.1 | `npm install @qorechain/qoresign` | Pubblicato. Include `inspectTransaction` e `fetchEvmWindow` (novità della 0.1.1) |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (si importa come `qoresign`) | 0.1.1 | `cargo add qorechain-qoresign` | Pubblicato |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.1 | `go get github.com/qorechain/qoresign/go@v0.1.1` | Pubblicato |
| [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) | Python 3.9+ (si importa come `qoresign`) | 0.1.1 | `pip install qorechain-qoresign` | Pubblicato, novità della 0.1.1. Wheel per macOS (arm64, x86_64) e Linux (x86_64, aarch64); nessuna wheel per Windows per ora. Solo funzioni offline |
| `QoreSign` (pacchetto Swift) | Swift (iOS 16+, macOS 13+) | 0.1.1 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, prodotto `QoreSign` | Pubblicato come release GitHub; il framework binario viene scaricato da lì |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign:0.1.1")` | Pubblicato |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.1 | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | Pubblicato. Stessa API dell'artefatto JVM; il suo esempio è stato eseguito solo sull'artefatto JVM, non su un dispositivo Android |

Gli artefatti Kotlin e Android richiedono nel tuo progetto il compilatore Kotlin 2.3 o successivo; un progetto con Kotlin 2.1 non compila con essi.

Il pacchetto TypeScript ha un sottopercorso `@qorechain/qoresign/network`, e il modulo Go ha gli stessi helper tranne `inspectTransaction` e `fetchEvmWindow`: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (con variazioni di saldo), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (un solo fallback, poi si ferma), `verifySiwqWithChain` e `verifyMessageWithChain`. I pacchetti Rust, Swift, Kotlin e Python non hanno codice di rete.

### QoreSeal {#group-qoreseal}

Pagina: [QoreSeal](/developer-tools/qoreseal). Sorgente: [qorechain/qoreseal](https://github.com/qorechain/qoreseal). QoreSeal 0.1.0 cifra dati verso account QoreChain, gruppi privati e sidechain con ML-KEM-1024 (FIPS 203). La cifratura funziona offline; leggere dalla chain la chiave di un destinatario richiede il registro delle chiavi KEM, che è live sulla testnet e la cui route di lettura risponde sulla mainnet dalla v3.2.5 (applicata il 29 ottobre 2026; al momento della verifica non vi era ancora stata pubblicata alcuna chiave). La costruzione è in attesa di una revisione esterna prima della 1.0.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`qorechain-qoreseal`](https://crates.io/crates/qorechain-qoreseal) | Rust (si importa come `qoreseal`) | 0.1.0 | `cargo add qorechain-qoreseal` | Pubblicato |
| [`github.com/qorechain/qoreseal/go`](https://pkg.go.dev/github.com/qorechain/qoreseal/go) | Go | v0.1.0 | `go get github.com/qorechain/qoreseal/go@v0.1.0` | Pubblicato |
| [`qorechain-qoreseal`](https://pypi.org/project/qorechain-qoreseal/) | Python 3.9+ (si importa come `qoreseal`) | 0.1.0 | `pip install qorechain-qoreseal` | Pubblicato. Wheel per macOS (arm64, x86_64) e Linux (x86_64, aarch64); nessuna wheel per Windows per ora |
| `QoreSeal` (pacchetto Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoreseal", from: "0.1.0")`, prodotto `QoreSeal` | Pubblicato come release GitHub; il framework binario viene scaricato da lì |
| [`io.github.qorechain:qoreseal`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal) | Kotlin / JVM (JVM 17+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal:0.1.0")` | Pubblicato su Maven Central |
| [`io.github.qorechain:qoreseal-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoreseal-android) | Kotlin (Android API 24+, Kotlin 2.3+) | 0.1.0 | `implementation("io.github.qorechain:qoreseal-android:0.1.0")` | Pubblicato su Maven Central |
| `@qorechain/qoreseal` | TypeScript | non ancora | nessuno | **Non pubblicato** su npm (404 il 27 ottobre 2026). Il sorgente è nel repository |

### Light client PQ {#group-pq-light-client}

Pagina: [Light client PQ](/developer-tools/pq-light-client). Sorgente: [qorechain/qorechain-pq-light-client](https://github.com/qorechain/qorechain-pq-light-client). Una bozza di specifica e verificatori di riferimento per checkpoint firmati con ML-DSA-87. Non si connette né alla mainnet né alla testnet: QoreChain non produce i checkpoint che esso verifica e non è previsto alcun supporto lato chain. Funziona con insiemi di validatori simulati e vettori di test condivisi.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/pq-light-client`](https://www.npmjs.com/package/@qorechain/pq-light-client) | TypeScript | 0.1.0 | `npm install @qorechain/pq-light-client` | Pubblicato. Dipende da `@qorechain/pqc` 0.2.3 |
| [`qorechain-pq-light-client`](https://crates.io/crates/qorechain-pq-light-client) | Rust (libreria `qorechain_pq_light_client`) | 0.1.0 | `cargo add qorechain-pq-light-client` | Pubblicato |
| [`github.com/qorechain/qorechain-pq-light-client/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pq-light-client/go) | Go (pacchetto `pqlightclient`) | v0.1.0 | `go get github.com/qorechain/qorechain-pq-light-client/go@v0.1.0` | Pubblicato |

### Custody kit {#group-custody-kit}

Pagina: [Custody kit](/developer-tools/custody-kit). Sorgente: [qorechain/qorechain-custody-kit](https://github.com/qorechain/qorechain-custody-kit). Una guida all'integrazione, codice di riferimento e vettori di test per custodi ed exchange, in TypeScript, Python, Go, Rust e Java. È codice di riferimento da leggere, copiare o includere nel proprio progetto (vendor), non un insieme di pacchetti: l'unica voce di registro è il modulo Go.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| Release GitHub `v0.1.0` | TypeScript, Python, Go, Rust, Java | 0.1.0 | `git clone https://github.com/qorechain/qorechain-custody-kit`, poi compila la cartella del tuo linguaggio | Pubblicato, 27 ottobre 2026. Nessun pacchetto npm, PyPI, crates.io o Maven, per scelta |
| [`github.com/qorechain/qorechain-custody-kit/code/go`](https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go) | Go (pacchetto `custodykit`) | v0.1.0 | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` | Pubblicato |

### QoreScan {#group-qorescan}

Pagina: [QoreScan](/developer-tools/qorescan). Sorgente: [qorechain/qorescan](https://github.com/qorechain/qorescan). QoreScan Community 0.1.0 fa l'inventario della crittografia di un deployment QoreChain (la home directory di un nodo, lo stato live della rete, gli endpoint TLS e i sorgenti Solidity) e scrive un CBOM CycloneDX 1.6 e report in Markdown. È uno strumento di aiuto all'inventario, non una certificazione né un audit.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [Release GitHub `v0.1.0`](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) | Binari per macOS, Linux e Windows (amd64, arm64) | 0.1.0 | scarica e controlla con `qorescan_0.1.0_checksums.txt` | Pubblicato, 27 ottobre 2026 |
| [`@qorechain/qorescan`](https://www.npmjs.com/package/@qorechain/qorescan) | wrapper npm (Node.js 18+) | 0.1.0 | `npx @qorechain/qorescan scan ...` | Pubblicato. Scarica e controlla il binario della release al primo avvio |
| [`qorescan`](https://pypi.org/project/qorescan/) | wrapper PyPI (Python 3.9+) | 0.1.0 | `pipx run qorescan scan ...` oppure `pip install qorescan` | Pubblicato. Stesso comportamento del wrapper npm |
| [`github.com/qorechain/qorescan`](https://pkg.go.dev/github.com/qorechain/qorescan) | Go | v0.1.0 | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Pubblicato. Go 1.26 |

### Asset Kit {#group-asset-kit}

Pagina: [Asset Kit](/developer-tools/asset-kit). Sorgente: [qorechain/qorechain-asset-kit](https://github.com/qorechain/qorechain-asset-kit). QoreChain Asset Kit 0.1.0 è uno strumento open source per token con permessi che rappresentano asset del mondo reale: contratti EVM (un modulo ERC-3643, una regola CMTAT e vault con quote ristrette su un guard che richiede una chiave ML-DSA-87 registrata), script di deploy Foundry e una console dell'emittente, più client per una **proposta** di moduli nativi (`x/asset`, `x/identity`, `x/compliance`, `x/settlement`, `x/attest`) che non è pianificata e non esiste su nessuna rete. I contratti funzionano solo su testnet: il precompile `0x0A02` non è attivo sulla mainnet, dove il guard fallisce in modo chiuso (fail closed). Pre-1.0, non sottoposto ad audit; i template legali nel repository sono bozze non riviste, non consulenza legale.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [Release GitHub `v0.1.0`](https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0) | Contratti Solidity, console dell'emittente, proto, documentazione | 0.1.0 | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit`, oppure `forge install qorechain/qorechain-asset-kit@v0.1.0` | Pubblicato. I contratti e la console si usano dal repository |
| [`io.github.qorechain:asset-kit`](https://central.sonatype.com/artifact/io.github.qorechain/asset-kit) | Java 17 (client per la proposta) | 0.1.0 | `implementation("io.github.qorechain:asset-kit:0.1.0")` | Pubblicato |
| [`github.com/qorechain/qorechain-asset-kit/clients/go`](https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go) | Go (pacchetto `assetkit`, client per la proposta) | v0.1.0 | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` | Pubblicato |
| `qorechain-asset-kit` su PyPI | Python | non ancora | nessuno | In arrivo. Non su PyPI (404 il 28 ottobre 2026) |
| `@qorechain/asset-kit` su npm | TypeScript | non ancora | nessuno | In arrivo. Non pubblicato (404 il 28 ottobre 2026) |

### Chain developer kit (SDK 0.11.0) {#group-chain-dev-sdk}

Pagina: [Chain developer kit](/developer-tools/chain-dev-sdk). Sorgente: [qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk). La parte dell'SDK QoreChain 0.11.0 pensata per i team Solidity e di smart contract: definizioni di chain per viem e helper per la finestra di autorizzazione EVM in `@qorechain/evm`, quattro nuovi template di `create-qorechain-dapp` (Foundry, Hardhat 3, viem con wagmi e un token QoreChain Native), quickstart EVM e una pagina su come l'EVM di QoreChain differisce da Ethereum.

**In arrivo.** L'SDK 0.11.0 è taggato su GitHub (`v0.11.0`) e la sua release su npm è in attesa: il 27 ottobre 2026 npm serviva `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0 e `create-qorechain-dapp` 0.10.0, e `@qorechain/sdk@0.11.0` restituiva 404. Finché npm non mostra la 0.11.0, le nuove definizioni di chain, gli helper per la finestra e i template non si possono installare; i pacchetti 0.10.0 nella [tabella dell'SDK](#group-sdk) sono ciò che ottieni oggi. La 0.11.0 cambia solo i pacchetti npm: gli SDK Python, Rust, Go e Java restano alla 0.10.0.

### Rollup Development Kit (RDK) {#group-rdk}

Guide: [Panoramica dei rollup](/rollups/overview), [Distribuire un rollup](/rollups/deploying-a-rollup), [Architettura del Rollup Development Kit](/architecture/rollup-development-kit). Sorgente: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.7.0 | `npm install @qorechain/rdk` | Pubblicato. L'unico client RDK che firma in modo ibrido, e solo quando passi un `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.7.0 | `npm install -g @qorechain/rdk-cli` | Pubblicato. Dalla 0.6.2 si avvia tramite il link bin di npm (la 0.6.1 e le precedenti non stampavano nulla). I suoi comandi di transazione firmano solo in modo classico, cosa che le reti rifiutano |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.7.0 | `npx create-qorechain-rollup my-rollup` | Pubblicato |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, importa `qorrdk`) | 0.7.0 | `pip install qorechain-rdk` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.7.0 | `cargo add qorechain-rdk` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.7.0 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.7.0` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.7.0 | `implementation("io.github.qorechain:qorechain-rdk:0.7.0")` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |

### Primitive post-quantistiche (`qorechain-pqc`) {#group-pqc}

Guida: [Firma post-quantistica](/developer-guide/post-quantum-signing). Sorgente: [qorechain/qorechain-pqc](https://github.com/qorechain/qorechain-pqc). La firma ML-DSA è deterministica per impostazione predefinita in tutti i binding; la firma hedged è un'attivazione esplicita.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/pqc`](https://www.npmjs.com/package/@qorechain/pqc) | TypeScript | 0.2.3 | `npm install @qorechain/pqc` | Pubblicato |
| [`qorechain-pqc`](https://pypi.org/project/qorechain-pqc/) | Python (3.9+) | 0.2.3 | `pip install qorechain-pqc` | Pubblicato. Richiede liboqs; il primo import la compila se manca (git, CMake e un compilatore C) |
| [`qorechain-pqc`](https://crates.io/crates/qorechain-pqc) | Rust | 0.2.3 | `cargo add qorechain-pqc` | Pubblicato |
| [`github.com/qorechain/qorechain-pqc/go`](https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go) | Go | v0.2.3 | `go get github.com/qorechain/qorechain-pqc/go` | Pubblicato |
| [`io.github.qorechain:qorechain-pqc`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc) | Java | 0.2.3 | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | Pubblicato |
| Libreria C | C | 0.2.3 | compila `c/` dal repository (richiede liboqs e OpenSSL) | Solo sorgente, nessun registro di pacchetti |

### Wallet adapter {#group-wallet-adapter}

Pagina: [Wallet adapter](/developer-tools/wallet-adapter). Sorgente: [qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter) | TypeScript (modulo ES, JavaScript semplice con tipizzazioni) | 0.4.0 | `npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing` | Pubblicato. Nessun quickstart testato |

### Chain bridge {#group-chain-bridge}

Pagina: [Chain bridge e handle](/developer-tools/chain-bridge).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/chain-bridge`](https://www.npmjs.com/package/@qorechain/chain-bridge) | TypeScript (server Node.js) | 0.2.3 | `npm install @qorechain/chain-bridge` | Pubblicato. Nessun quickstart testato. Il registro non indica alcun repository sorgente |

### Handles {#group-handles}

Pagina: [Chain bridge e handle](/developer-tools/chain-bridge#handles).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/handles`](https://www.npmjs.com/package/@qorechain/handles) | TypeScript | 0.1.0 | `npm install @qorechain/handles` | Pubblicato. Verifica la risoluzione di un handle rispetto a una chiave di registro fissata (pinned). Non fissa gli indirizzi da sé: è il chiamante a fornire l'archivio dei pin e a decidere quando fissare. Nessun quickstart testato. Il registro non indica alcun repository sorgente |

### Integrazioni QoreX {#group-qorex}

Guida: [QoreX, per gli sviluppatori](/qorex/overview#developers). Sorgente: [qorechain/qorex-integrations](https://github.com/qorechain/qorex-integrations). Tutti e sei sono stati pubblicati il 27 ottobre 2026.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/qorex-types`](https://www.npmjs.com/package/@qorechain/qorex-types) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-types` | Pubblicato. Trova QoreX (EIP-6963 e il provider nativo) |
| [`@qorechain/qorex-rainbowkit`](https://www.npmjs.com/package/@qorechain/qorex-rainbowkit) | TypeScript | 0.1.0 | `npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query` | Pubblicato |
| [`@qorechain/qorex-interchain-kit`](https://www.npmjs.com/package/@qorechain/qorex-interchain-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react` | Pubblicato |
| [`@qorechain/qorex-cosmos-kit`](https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit) | TypeScript (React) | 0.1.0 | `npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react` | Pubblicato. Con `@cosmos-kit/react` 2.24 passa `throwErrors={false}`; lo snippet del README lo omette |
| [`@qorechain/qorex-wallet-mock`](https://www.npmjs.com/package/@qorechain/qorex-wallet-mock) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-wallet-mock` | Pubblicato. Un wallet di test che firma davvero sulla testnet |
| [`@qorechain/qorex-synpress`](https://www.npmjs.com/package/@qorechain/qorex-synpress) | TypeScript | 0.1.0 | `npm install -D @qorechain/qorex-synpress @playwright/test` | Pubblicato. Fixture Playwright; la modalità estensione oggi genera un errore |

### Connect (deprecato) {#group-connect}

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/connect`](https://www.npmjs.com/package/@qorechain/connect) | TypeScript | 0.2.1 | nessuno | **Deprecato e non più mantenuto.** Non usarlo per nuovi lavori. Sostituiscilo come nella tabella qui sotto |

:::caution @qorechain/connect è deprecato
`@qorechain/connect` è contrassegnato come deprecato su npm. Il suo intervallo di peer è `@qorechain/wallet-adapter` `^0.2.1`, che non include la 0.4.0, e non apre una [finestra di autorizzazione EVM](/sdk/guides/evm#evm-window), quindi un invio EVM tramite esso viene rifiutato finché l'account non ha una chiave registrata e una finestra aperta. Il repository indicato nei suoi metadati del registro non è raggiungibile pubblicamente.
:::

| Esigenza | Usa invece |
|---|---|
| Rilevare QoreX (EVM, native, Solana) | `@qorechain/qorex-types` |
| dApp EVM con RainbowKit e wagmi | `@qorechain/qorex-rainbowkit` |
| dApp Cosmos | `@qorechain/qorex-interchain-kit` (oppure `@qorechain/qorex-cosmos-kit`) |
| Firma ibrida nel tuo wallet o backend | `@qorechain/qoresign` |

### QORel, il relayer IBC {#group-qorel}

| Pacchetto | Dove | Versione | Installazione | Stato |
|---|---|---|---|---|
| QORel (`qorel`) | Release GitHub `qorel-v0.1.0`, Homebrew, container `ghcr.io/qorechain/qorel` | 0.1.0 | `brew install qorechain/tap/qorel` | Pubblicato come pre-release. Solo IBC v1; solo testnet. Vedi [QORel](/qorel/overview) |

### Server MCP e CLI {#group-mcp}

Pagine: [Server MCP di QoreChain](/developer-tools/mcp), [CLI di QoreChain](/developer-tools/qore-cli). Sorgente: [qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (pubblico). Entrambi leggono la chain e nessuno dei due firma, custodisce chiavi o trasmette. Pubblicati il 27 ottobre 2026.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | TypeScript (server Node.js, bin `qorechain-mcp`) | 0.1.0 | `npx -y @qorechain/mcp` | Pubblicato. stdio e Streamable HTTP. Un endpoint ospitato, `https://mcp.qorechain.io/mcp`, richiede una chiave API, richiesta dalla tua dashboard |
| [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | Python (3.10+) | 0.1.0 | `pip install qorechain-mcp` (oppure `uvx qorechain-mcp`) | Pubblicato. Gli stessi strumenti del pacchetto npm; solo stdio |
| [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | TypeScript (CLI `qore`) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Pubblicato. Output `--json` identico all'output degli strumenti MCP |

### Pianificati (non pubblicati) {#planned}

Questi non sono ancora sul loro registro, quindi non c'è nulla da installare e il comportamento indicato per essi non può ancora essere usato. Ciascuno ha restituito 404 (oppure non era elencato) il 27 ottobre 2026.

| Pacchetto | Uso previsto | Stato |
|---|---|---|
| `@qorechain/qoreseal` su npm | QoreSeal per TypeScript | Non pubblicato; il sorgente è nel repository |
| `qorechain-asset-kit` su PyPI, `@qorechain/asset-kit` su npm | I client dell'[Asset Kit](/developer-tools/asset-kit) per Python e TypeScript | Non pubblicati; usa un clone del repository |
| `@qorechain/sdk`, `@qorechain/evm`, `@qorechain/react`, `@qorechain/svm`, `create-qorechain-dapp` 0.11.0 su npm | Il [chain developer kit](/developer-tools/chain-dev-sdk) | Taggato su GitHub, release su npm in attesa |

## Come ottenere le versioni live {#live-versions}

Le tabelle sono un'istantanea. Per leggere tu stesso la versione attuale di un pacchetto:

| Registro | Richiesta | Campo |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` | `version` |
| PyPI | `https://pypi.org/pypi/<name>/json` | `info.version` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (invia un header `User-Agent`, altrimenti la richiesta viene rifiutata) | `crate.max_stable_version` |
| Go | `https://proxy.golang.org/<module>/@latest` | `Version` (rimuovi la `v` iniziale) |
| Maven Central | `https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml` | `<release>` |
| Swift | `https://api.github.com/repos/qorechain/qoresign/releases/latest` | `tag_name` (rimuovi la `v` iniziale); le chiamate GitHub non autenticate sono limitate a 60 all'ora per indirizzo |

Per un nome npm con scope mantieni la `@`, ad esempio `https://registry.npmjs.org/@qorechain/sdk/latest`. Un 404 significa che il pacchetto non è pubblicato. Il proxy Go può rispondere a `@latest` da una cache per un breve periodo dopo una release, quindi fissa la versione nel comando quando te ne serve una specifica (l'installazione Go dell'RDK qui sopra lo fa). Anche la pagina di ogni pacchetto nel suo registro mostra la versione e la cronologia delle release.

## Limiti e problemi noti {#limits}

- **Due reti live, versioni diverse.** La mainnet esegue la v3.2.5 (dal 29 ottobre 2026) e la testnet esegue la v3.2.6. Una funzionalità che esiste solo sulla testnet (gli elementi della v3.2.6, i precompile PQC EVM) è indicata nella sua pagina.
- **Non ancora attivi:** `@qorechain/qoreseal` su npm, l'Asset Kit su PyPI e npm (e i suoi moduli nativi, una proposta non pianificata), l'SDK 0.11.0 (il chain developer kit) su npm, le transazioni SVM e i precompile EVM sulla mainnet (sono attivi solo sulla testnet; vedi la [panoramica dell'SDK](/sdk/overview) per l'elenco rail per rail).
- **Registro di QoreSeal e light client PQ.** Cifrare verso un indirizzo letto dalla chain richiede il registro delle chiavi KEM, live sulla testnet, e la sua route di lettura risponde sulla mainnet dalla v3.2.5. Il light client PQ non si connette a nessuna delle due reti; non è previsto alcun supporto lato chain per i suoi checkpoint.
- **Kotlin 2.3 o successivo.** Gli artefatti Kotlin e Android di QoreSign e QoreSeal richiedono il compilatore Kotlin 2.3 o successivo; con Kotlin 2.1 la compilazione contro di essi fallisce.
- **Nessuna wheel per Windows.** I pacchetti Python di QoreSign e QoreSeal hanno wheel solo per macOS e Linux; le altre piattaforme compilano dalla distribuzione sorgente, che richiede Rust.
- **Esempi non eseguiti:** delle 34 voci di quickstart, 31 sono state eseguite e hanno avuto successo il 27 ottobre 2026. L'esempio Python di QoreSign è stato eseguito dopo la pubblicazione del pacchetto (macOS arm64 e Linux aarch64), e l'esempio Android di QoreSign non è stato eseguito su un dispositivo. Il wallet adapter, il chain bridge e handles non hanno un quickstart, quindi i loro esempi in questo manuale provengono dalle tipizzazioni e dal sorgente dei pacchetti e non sono stati eseguiti end to end.
- **`@qorechain/rdk-cli` prima della 0.6.2** non stampava nulla se avviato tramite il link bin di npm, e il suo `--version` stampava 0.4.1. **`@qorechain/rdk` prima della 0.7.0** costruiva prove di prelievo che non venivano mai verificate sulla chain. Usa la 0.7.0.
- **Conflitto di versione di cosmjs.** `@qorechain/wallet-adapter` e `@qorechain/chain-bridge` usano cosmjs 0.32; l'SDK usa cosmjs 0.39. Installare l'adapter accanto all'SDK nello stesso progetto fa segnalare a npm `ERESOLVE`. Tienili in progetti separati oppure passa `--legacy-peer-deps`.
- **Copia annidata dell'SDK nelle versioni RDK precedenti.** `@qorechain/rdk` 0.6.2 e precedenti dipendono da `@qorechain/sdk` `^0.9.0`, quindi un'app con l'SDK 0.10.0 otteneva una seconda copia annidata dell'SDK 0.9.x. Dalla 0.7.0 il kit dipende da `@qorechain/sdk` `^0.10.0` e condivide una sola copia.
- **Client RDK solo classici.** I client RDK Python, Rust, Go e Java firmano solo in modo classico, cosa che il rail Native rifiuta su entrambe le reti; usali per le letture, oppure usa il client TypeScript con un `pqcKeypair` per le transazioni.
- **Pacchetti senza repository sorgente pubblico.** `@qorechain/chain-bridge` e `@qorechain/handles` non indicano alcun repository sorgente nei metadati del registro. Puoi leggere il contenuto pubblicato dei pacchetti su npm.
- **Python `qorechain-pqc`** non ha la generazione di chiavi da seed nella 0.2.3 e richiede liboqs.
