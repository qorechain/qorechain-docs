---
slug: /developer-guide/building-from-source
title: Compilazione dai sorgenti
sidebar_label: Compilazione dai sorgenti
sidebar_position: 1
---

# Compilazione dai sorgenti

Questa guida ti accompagna nella compilazione del binario `qorechaind` della community a partire dai sorgenti pubblici, e spiega a cosa serve e a cosa non serve quel binario.

:::caution Una build dai sorgenti non può unirsi alla mainnet né alla testnet
Il repository pubblico contiene le interfacce dei moduli con **keeper stub**; le implementazioni dei keeper critiche per il consenso e il firmatario post-quantistico non sono nell'albero dei sorgenti pubblico. Un binario compilato da esso non può riprodurre lo stato di consenso delle reti e non può creare la firma post-quantistica ibrida richiesta da ogni transazione della corsia Cosmos. Dalla v3.2.3 si **rifiuta anche di avviarsi** su `qorechain-vladi` o `qorechain-diana` (le riconosce dal chain id e dall'orario di genesis; un devnet locale che riutilizza un chain id pubblico con un proprio genesis non è interessato). `qorechaind start --community-unenforced-pqc` annulla il rifiuto per gli esperimenti; il nodo allora non verifica alcuna firma post-quantistica e può divergere dalla rete senza preavviso, quindi non usarlo mai per un nodo su cui fai affidamento. Per eseguire un nodo o un validator sulla mainnet o sulla testnet, installa il **binario di release** indicato nel manifest attivo (`https://download.qore.host/mainnet/latest.json` oppure `.../testnet/latest.json`); consulta [Running a Node](/developer-guide/running-a-node) e [Running a Validator](/developer-guide/running-a-validator).
:::

## Prerequisiti

| Dipendenza         | Versione minima            | Note                                                |
| ------------------ | --------------------------- | ---------------------------------------------------- |
| **Go**              | 1.26+                       | Richiesto per tutte le build                         |
| **CGO**             | Abilitato (`CGO_ENABLED=1`) | Richiesto per i bridge FFI di PQC e SVM              |
| **Make**            | 3.81+                       | Automazione della build                              |
| **Git**             | 2.x                         | Checkout dei sorgenti                                |

Verifica il tuo ambiente:

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Ogni invocazione di `go build`, `go test` e `go run` **deve** avere `CGO_ENABLED=1` impostato. Il nodo collega librerie native (il runtime QoreChain Native e, nella build di release, le librerie PQC e SVM) tramite cgo.
:::

## Librerie native

### libqorepqc e libqoresvm

Le librerie post-quantistica (`libqorepqc`) e SVM (`libqoresvm`) sono compilate da sorgenti Rust che **non fanno parte del repository pubblico** (in `qorechain-core` non esiste alcuna directory `rust/`). La build della community non ne ha bisogno. Gli archivi di release per le reti includono le librerie compilate (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) in una directory `lib/` accanto a `qorechaind`; collocale in `lib/{os}_{arch}/` oppure indica il loro percorso al loader come mostrato di seguito.

### Impostazione del percorso delle librerie

Quando usi il binario di release, le sue librerie condivise devono essere individuabili a runtime. Imposta la variabile d'ambiente appropriata per la tua piattaforma:

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
* **Build completa** — Contiene le implementazioni complete dei keeper (la reale logica dei moduli critica per il consenso e il firmatario post-quantistico). Viene distribuita come binari di release pubblicati su [download.qore.host](https://download.qore.host); non viene compilata dall'albero dei sorgenti pubblico.

Entrambe le build producono un binario con lo stesso nome, `qorechaind`, ed espongono gli stessi comandi CLI. La differenza sta nel comportamento a runtime della logica dei keeper dietro tali interfacce.

## Build della community

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Questa build compila tutte le interfacce dei moduli pubblici con keeper stub per le funzionalità proprietarie. Il binario risultante è pensato per:

* Sviluppo e test in locale (ad esempio un devnet a nodo singolo)
* Interrogare una rete (i comandi `query ...` funzionano su qualsiasi nodo)
* Creare integrazioni e strumenti di terze parti basati sulle interfacce dei moduli

Non è un modo per unirsi alla mainnet o alla testnet come validator né per effettuare transazioni: non ha un firmatario post-quantistico (`tx pqc gen-key` e `tx pqc cosign` restituiscono un errore) e i suoi keeper stub non riproducono le regole di consenso delle reti.

## Build completa (binario di release)

Le implementazioni complete dei keeper, e il firmatario dietro `tx pqc gen-key` e `tx pqc cosign`, non sono nell'albero dei sorgenti pubblico, quindi non possono essere compilate da esso. I binari pubblicati su [download.qore.host](https://download.qore.host) sono la build completa; usali per la mainnet e la testnet.

## Esecuzione dei test

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Il flag `-count=1` disabilita la cache dei test, garantendo un'esecuzione pulita ogni volta. I test dei singoli package possono essere eseguiti con:

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

I test che esercitano le librerie native o i keeper proprietari vengono compilati solo nella build completa e non fanno parte della suite pubblica.

## Verifica della build

Dopo una build riuscita, verifica il binario:

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

Il comando `init` dovrebbe creare un file genesis e la configurazione del nodo in `~/.qorechaind/` senza errori. L'esempio sopra inizializza rispetto alla testnet **`qorechain-diana`** — per la mainnet, sostituisci con `--chain-id qorechain-vladi`, la rete attiva (release del nodo **v3.2.4**).

## Build con Docker

Un Dockerfile è fornito nella radice del repository:

```bash
docker build -t qorechaind:community .
```

Compila il binario **della community** (il suo stesso commento recita "Public build — no PQC library"), quindi l'immagine è pensata per lo sviluppo locale e gli strumenti, non per seguire la mainnet o la testnet. Per eseguire un nodo di rete in Docker, incapsula invece il binario di release; consulta [Running a Node](/developer-guide/running-a-node#docker-compose).

## Risoluzione dei problemi

<details>

<summary>cgo: C compiler not found</summary>

Installa gli strumenti CLI di Xcode (macOS) oppure `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Stai collegando una build che si aspetta le librerie native. Usa la build della community (non ne ha bisogno) oppure l'archivio di release, che le include, e imposta `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` sulla sua directory `lib/`

</details>

<details>

<summary>undefined: sonic.*</summary>

Assicurati che `go.sum` sia aggiornato: `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Aumenta la memoria disponibile (situazione comune in Docker con limiti bassi)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Le dimensioni di ML-DSA-87 sono: chiave pubblica 2.592 byte, chiave segreta 4.896 byte e firma 4.627 byte. Qualsiasi altra dimensione indica un algoritmo diverso o un valore troncato.

</details>
