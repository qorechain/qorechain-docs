---
slug: /developer-guide/building-from-source
title: Building from Source
sidebar_label: Building from Source
sidebar_position: 1
---

# Building from Source

Questa guida ti accompagna nella compilazione del binario `qorechaind` dai sorgenti, coprendo sia la build della community (open-core) sia la build proprietaria completa.

## Prerequisiti

| Dipendenza         | Versione minima           | Note                                              |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Richiesto per tutte le build                      |
| **CGO**            | Abilitato (`CGO_ENABLED=1`) | Richiesto per i bridge FFI di PQC e SVM         |
| **Toolchain Rust** | Ultima versione stabile   | Richiesto per compilare `libqorepqc` e `libqoresvm` |
| **Make**           | 3.81+                     | Automazione della build                           |
| **Git**            | 2.x                       | Checkout dei sorgenti                             |

Verifica il tuo ambiente:

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Ogni invocazione di `go build`, `go test` e `go run` **deve** avere `CGO_ENABLED=1` impostato. I moduli PQC e SVM utilizzano bridge FFI che richiedono cgo.
:::

## Librerie native

QoreChain dipende da due librerie native compilate in Rust che vengono caricate a runtime.

### libqorepqc (crittografia post-quantistica)

La libreria PQC fornisce la generazione delle chiavi, la firma e la verifica ML-DSA-87 (Dilithium-5) attraverso un'interfaccia FFI compatibile con C.

```bash
cd rust/qorepqc
cargo build --release
```

La libreria compilata viene collocata in `lib/{os}_{arch}/`:

| Piattaforma | File della libreria | Directory           |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (runtime SVM)

La libreria SVM fornisce l'ambiente di esecuzione dei programmi BPF per il modulo x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

L'output segue la stessa convenzione `lib/{os}_{arch}/` di cui sopra (`libqoresvm.dylib` su macOS, `libqoresvm.so` su Linux).

### Impostazione del percorso delle librerie

Le librerie native devono essere individuabili a runtime. Imposta la variabile d'ambiente appropriata per la tua piattaforma:

**macOS:**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux:**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Suggerimento: aggiungi l'export al profilo della tua shell (`~/.bashrc`, `~/.zshrc`) in modo che persista tra le sessioni.
:::

## Architettura open-core

QoreChain segue un modello **open-core**:

* **Build della community** — Contiene le interfacce complete dei moduli, i comandi CLI, le definizioni protobuf e i tipi di messaggio per ogni modulo di QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm, ecc.). I keeper dei moduli proprietari utilizzano **implementazioni stub** che restituiscono valori predefiniti sicuri o risposte no-op. Questo consente a strumenti, wallet e indexer di terze parti di integrarsi con tutte le API di QoreChain senza richiedere codice proprietario.
* **Build completa (proprietaria)** — Abilita le implementazioni complete dei keeper dietro il build tag `proprietary`. Questo include la vera logica di rilevamento delle anomalie tramite AI, l'ottimizzazione dei parametri di consenso PRISM, lo scoring avanzato della reputazione e tutte le funzionalità di livello produzione.

Entrambe le build producono lo stesso nome di binario `qorechaind` ed espongono comandi CLI ed endpoint gRPC/REST identici. La differenza sta nel comportamento a runtime della logica dei keeper dietro tali interfacce.

## Build della community

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Questo compila tutte le interfacce dei moduli pubblici con keeper stub per le funzionalità proprietarie. Il binario risultante è pienamente funzionale per:

* Eseguire un nodo validator
* Inviare e interrogare transazioni
* Interagire con le VM EVM, CosmWasm e SVM
* Creare integrazioni e strumenti di terze parti
* Sviluppo e test in locale

## Build completa (proprietaria)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

Il flag `-tags proprietary` attiva le implementazioni complete dei keeper, che non fanno parte dell'albero dei sorgenti pubblico.

## Esecuzione dei test

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Il flag `-count=1` disabilita la cache dei test, garantendo un'esecuzione pulita ogni volta. I test dei singoli package possono essere eseguiti con:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Esegui separatamente i test delle librerie Rust:

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Verifica della build

Dopo una build riuscita, verifica il binario:

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

Il comando `init` dovrebbe creare un file genesis e la configurazione del nodo in `~/.qorechaind/` senza errori. L'esempio sopra inizializza rispetto alla testnet **`qorechain-diana`** — per la mainnet, sostituisci `--chain-id qorechain-vladi`, la rete attiva che esegue la versione di chain **v3.1.80**.

## Build con Docker

Per le build containerizzate, è fornito un Dockerfile nella radice del repository:

```bash
docker build -t qorechaind:latest .
```

L'immagine Docker gestisce automaticamente tutta la compilazione delle librerie native e la configurazione dei percorsi. Consulta la guida [Quickstart](/getting-started/quickstart) per eseguire un nodo con Docker Compose.

## Risoluzione dei problemi

<details>

<summary>cgo: C compiler not found</summary>

Installa gli strumenti CLI di Xcode (macOS) o `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Compila prima le librerie Rust e imposta `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

Assicurati che `go.sum` sia aggiornato: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Aumenta la memoria disponibile (comune in Docker con limiti bassi)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Verifica di utilizzare `pqcrypto v0.5.0+` (ML-DSA-87: pubkey=2592, privkey=4896, sig=4627 bytes)

</details>
