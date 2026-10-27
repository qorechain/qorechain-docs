---
slug: /developer-tools/overview
title: Pacchetti per sviluppatori
sidebar_label: Panoramica
sidebar_position: 1
---

# Pacchetti per sviluppatori

QoreChain pubblica i propri strumenti per sviluppatori come piccoli pacchetti sui registri pubblici (npm, PyPI, crates.io, il proxy dei moduli Go, Maven Central e Swift Package Manager). Questa pagina è l'indice: a cosa serve ogni pacchetto, il suo nome esatto nel registro, il linguaggio, la versione attuale, il comando di installazione e lo stato, e dove leggere come usarlo. È pensata per gli sviluppatori che creano dApp, wallet, backend e rollup su QoreChain e vogliono scegliere il pacchetto giusto prima di leggere una guida.

Le versioni nelle tabelle sono state lette dai registri il 27 ottobre 2026. La mainnet `qorechain-vladi` esegue la v3.2.4 e la testnet `qorechain-diana` esegue la v3.2.6. Ogni pacchetto indicato come pubblicato è sotto licenza Apache-2.0.

## Innovazioni {#innovations}

- **Un unico formato di firma ibrida in ogni linguaggio.** La chain richiede una firma secp256k1 più una firma ML-DSA-87 (FIPS 204) sulle transazioni del rail Native. QoreSign riproduce i suoi vettori di test pubblicati byte per byte in TypeScript, Rust, Go, Swift e Kotlin, e `qorechain-pqc` esegue un unico insieme condiviso di vettori nei suoi sei binding, quindi una chiave o una firma creata in un linguaggio viene verificata negli altri.
- **La forma dei sign-bytes è scelta dallo stato della chain, non indovinata.** L'SDK, il wallet adapter, `chain-bridge` e gli helper di rete di QoreSign chiedono al nodo `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` per entrambi i nomi di upgrade (`v3.2.0` e `v3.1.98`) e firmano la forma v2 quando una delle due altezze è maggiore di zero. Senza un endpoint REST su queste due chain generano un errore invece di indovinare. Entrambe le reti verificano oggi la v2 (verificato il 27 ottobre 2026: `v3.2.0` applicato sulla mainnet all'altezza 2.981.742 e `v3.1.98` sulla testnet all'altezza 5.746.000).
- **Quickstart che sono stati eseguiti, non solo scritti.** Per i pacchetti che ne hanno uno, l'esempio è stato eseguito il 27 ottobre 2026 dopo l'installazione dal registro pubblico. 31 voci di quickstart su 34 sono state eseguite e hanno avuto successo; il manifest registra quali tre no (vedi [Limiti](#limits)).
- **Un unico manifest dietro le tabelle.** I nomi dei pacchetti, le versioni e i comandi di installazione di questa pagina provengono da un unico manifest leggibile da macchina con un endpoint di versione live per ogni pacchetto, gli stessi dati da cui viene costruito l'hub sviluppatori della dashboard.

## Come si usa {#how-to-use}

Scegli in base a ciò che stai costruendo.

| Vuoi | Usa | Leggi |
|---|---|---|
| Leggere lo stato della chain, derivare account, inviare transazioni firmate in modo ibrido da uno script o da una dApp | SDK QoreChain | [Panoramica dell'SDK](/sdk/overview), [Installazione](/sdk/install), [Quickstart](/sdk/quickstart) |
| Firmare nel tuo wallet o backend, verificare firme, Sign In With QoreChain | QoreSign | [Panoramica di QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart) |
| Aggiungere QoreChain a Keplr, Leap o Cosmostation, generare wallet unificati, costruire messaggi per la finestra EVM e per le chiavi collegate | Wallet adapter | [Wallet adapter](/developer-tools/wallet-adapter) |
| Eseguire un job lato server che invia QOR, registra chiavi o distribuisce contratti | Chain bridge (oppure l'SDK) | [Chain bridge e handle](/developer-tools/chain-bridge) |
| Risolvere un `@handle` in un indirizzo verificato | Handles | [Chain bridge e handle](/developer-tools/chain-bridge#handles) |
| Permettere alla tua dApp di usare il wallet QoreX | Integrazioni QoreX | [QoreX, per gli sviluppatori](/qorex/overview#developers) |
| Creare e gestire un rollup applicativo | RDK | [Panoramica dei rollup](/rollups/overview), [Distribuire un rollup](/rollups/deploying-a-rollup) |
| Usare da sole le primitive post-quantistiche (ML-DSA, ML-KEM, SHAKE-256) | `qorechain-pqc` | [Firma post-quantistica](/developer-guide/post-quantum-signing) |

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

La dashboard ha una pagina pubblica su [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). Verificata il 27 ottobre 2026, ha queste schede:

- **PQ key status:** legge la chiave ML-DSA-87 che un indirizzo ha registrato sulla chain e la sua finestra di autorizzazione EVM, su testnet o mainnet.
- **Simulator:** esegue una simulazione di una transazione firmata (`TxRaw` in base64 o esadecimale) e mostra il consumo di gas e le variazioni di saldo. Non viene trasmesso nulla.
- **Signing playground:** solo testnet. Genera nel browser una chiave ibrida usa e getta, tenuta in memoria, per firmare e verificare messaggi e richieste Sign In With QoreChain.
- **QoreX test wallet:** solo testnet. Inietta nella scheda un wallet di test (`window.qorex`, annunciato tramite EIP-6963 come "QoreX (mock)") così puoi provare i flussi delle dApp.
- **AI agents (MCP):** una pagina per il server MCP, che non è ancora pubblicato (vedi [Pianificati](#planned)).

L'hub SDK che elenca ogni pacchetto dal manifest, con le versioni live, e l'ispettore di transazioni **non sono ancora attivi**. La scheda **SDKs** di quella pagina mostra ancora un testo più vecchio, quindi non usarla per versioni o comandi di installazione; usa le tabelle qui sotto, che sono state verificate sui registri.

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

Guide: [Panoramica di QoreSign](/qoresign/overview), [Quickstart](/qoresign/quickstart), [Vettori di test](/qoresign/vectors). Sorgente: [qorechain/qoresign](https://github.com/qorechain/qoresign). QoreSign firma in locale; non custodisce chiavi per te e non fa firma threshold, MPC o con hardware wallet.

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | TypeScript | 0.1.0 | `npm install @qorechain/qoresign` | Pubblicato |
| [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) | Rust (si importa come `qoresign`) | 0.1.0 | `cargo add qorechain-qoresign` | Pubblicato |
| [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | Go | v0.1.0 | `go get github.com/qorechain/qoresign/go` | Pubblicato |
| `QoreSign` (pacchetto Swift) | Swift (iOS 16+, macOS 13+) | 0.1.0 | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.0")`, prodotto `QoreSign` | Pubblicato come release GitHub; il framework binario viene scaricato da lì |
| [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | Kotlin / JVM (JVM 17+) | 0.1.0 | `implementation("io.github.qorechain:qoresign:0.1.0")` | Pubblicato |
| [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | Kotlin (Android API 24+) | 0.1.0 | `implementation("io.github.qorechain:qoresign-android:0.1.0")` | Pubblicato. Stessa API dell'artefatto JVM; il suo esempio è stato eseguito solo sull'artefatto JVM, non su un dispositivo Android |
| `qorechain-qoresign` (PyPI) | Python | non ancora | nessuno | **Non pubblicato.** Il progetto PyPI ha restituito 404 il 27 ottobre 2026. Previsto per la 0.1.1 |

Il pacchetto TypeScript ha un sottopercorso `@qorechain/qoresign/network`, e il modulo Go ha gli stessi helper: `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx` (con variazioni di saldo), `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback` (un solo fallback, poi si ferma), `verifySiwqWithChain` e `verifyMessageWithChain`. La crate Rust non ha codice di rete.

### Rollup Development Kit (RDK) {#group-rdk}

Guide: [Panoramica dei rollup](/rollups/overview), [Distribuire un rollup](/rollups/deploying-a-rollup), [Architettura del Rollup Development Kit](/architecture/rollup-development-kit). Sorgente: [qorechain/qorechain-rdk](https://github.com/qorechain/qorechain-rdk).

| Pacchetto | Linguaggio | Versione | Installazione | Stato |
|---|---|---|---|---|
| [`@qorechain/rdk`](https://www.npmjs.com/package/@qorechain/rdk) | TypeScript | 0.6.2 | `npm install @qorechain/rdk` | Pubblicato. L'unico client RDK che firma in modo ibrido, e solo quando passi un `pqcKeypair` |
| [`@qorechain/rdk-cli`](https://www.npmjs.com/package/@qorechain/rdk-cli) | TypeScript (CLI `qorollup`) | 0.6.2 | `npm install -g @qorechain/rdk-cli` | Pubblicato. La 0.6.2 corregge il problema di avvio della 0.6.1 tramite il link bin di npm. I suoi comandi di transazione firmano solo in modo classico, cosa che le reti rifiutano |
| [`create-qorechain-rollup`](https://www.npmjs.com/package/create-qorechain-rollup) | TypeScript (CLI) | 0.6.2 | `npx create-qorechain-rollup my-rollup` | Pubblicato |
| [`qorechain-rdk`](https://pypi.org/project/qorechain-rdk/) | Python (3.10+, importa `qorrdk`) | 0.6.2 | `pip install qorechain-rdk` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`qorechain-rdk`](https://crates.io/crates/qorechain-rdk) | Rust | 0.6.2 | `cargo add qorechain-rdk` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`github.com/qorechain/qorechain-rdk/packages/go`](https://pkg.go.dev/github.com/qorechain/qorechain-rdk/packages/go) | Go | v0.6.2 | `go get github.com/qorechain/qorechain-rdk/packages/go@v0.6.2` | Pubblicato. Le letture funzionano; le transazioni firmano solo in modo classico |
| [`io.github.qorechain:qorechain-rdk`](https://central.sonatype.com/artifact/io.github.qorechain/qorechain-rdk) | Java (JDK 17+) | 0.6.1 | `implementation("io.github.qorechain:qorechain-rdk:0.6.1")` | Pubblicato alla 0.6.1; la 0.6.2 non era su Maven Central il 27 ottobre 2026. Le letture funzionano; le transazioni firmano solo in modo classico |

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

### Pianificati (non pubblicati) {#planned}

Questi nomi sono riservati a strumenti che non sono ancora su un registro. Ciascuno ha restituito 404 sul proprio registro il 27 ottobre 2026, quindi non c'è nulla da installare e il comportamento indicato non può ancora essere usato.

| Pacchetto | Uso previsto | Stato |
|---|---|---|
| `@qorechain/mcp` | Un server Model Context Protocol con accesso in lettura a QoreChain (blocchi, transazioni, account, validatori, livelli di staking, stato della firma ibrida, simulazione, trasferimenti non firmati). Non firmerebbe né trasmetterebbe mai. È pianificato anche un endpoint ospitato | Non pubblicato. Il repository sorgente non è pubblico. L'endpoint ospitato non è attivo |
| `@qorechain/qore-cli` (comando `qore`) | Letture da riga di comando con output JSON stabile sugli stessi dati | Non pubblicato |
| `qorechain-qoresign` su PyPI | QoreSign per Python | Non pubblicato (previsto per la 0.1.1) |

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

- **Due reti live, versioni diverse.** La mainnet esegue la v3.2.4 e la testnet esegue la v3.2.6. Una funzionalità che esiste solo sulla testnet è indicata nella sua pagina. Non dare per scontato il comportamento della v3.2.5 sulla mainnet.
- **Non ancora attivi:** l'hub SDK e l'ispettore di transazioni nella pagina sviluppatori della dashboard, il server MCP e la CLI `qore`, QoreSign per Python, le transazioni SVM e i precompile EVM sulla mainnet (vedi la [panoramica dell'SDK](/sdk/overview) per l'elenco rail per rail).
- **Esempi non eseguiti:** delle 34 voci di quickstart, 31 sono state eseguite e hanno avuto successo il 27 ottobre 2026. L'esempio Python di QoreSign non è stato eseguito (il pacchetto non è pubblicato) e l'esempio Android di QoreSign non è stato eseguito su un dispositivo. Il wallet adapter, il chain bridge e handles non hanno un quickstart, quindi i loro esempi in questo manuale provengono dalle tipizzazioni e dal sorgente dei pacchetti e non sono stati eseguiti end to end.
- **`@qorechain/rdk-cli` prima della 0.6.2** non stampava nulla se avviato tramite il link bin di npm, e il suo `--version` stampava 0.4.1. Usa la 0.6.2.
- **Conflitto di versione di cosmjs.** `@qorechain/wallet-adapter` e `@qorechain/chain-bridge` usano cosmjs 0.32; l'SDK usa cosmjs 0.39. Installare l'adapter accanto all'SDK nello stesso progetto fa segnalare a npm `ERESOLVE`. Tienili in progetti separati oppure passa `--legacy-peer-deps`.
- **Copia annidata dell'SDK nell'RDK.** `@qorechain/rdk` 0.6.2 dipende da `@qorechain/sdk` `^0.9.0`; un caret su una versione 0.x resta dentro la 0.9, quindi un'app con l'SDK 0.10.0 ottiene una seconda copia annidata dell'SDK 0.9.x.
- **Client RDK solo classici.** I client RDK Python, Rust, Go e Java firmano solo in modo classico, cosa che il rail Native rifiuta su entrambe le reti; usali per le letture, oppure usa il client TypeScript con un `pqcKeypair` per le transazioni.
- **Pacchetti senza repository sorgente pubblico.** `@qorechain/chain-bridge` e `@qorechain/handles` non indicano alcun repository sorgente nei metadati del registro. Puoi leggere il contenuto pubblicato dei pacchetti su npm.
- **Python `qorechain-pqc`** non ha la generazione di chiavi da seed nella 0.2.3 e richiede liboqs.
