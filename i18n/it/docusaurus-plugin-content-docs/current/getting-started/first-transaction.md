---
slug: /getting-started/first-transaction
title: Prima transazione
sidebar_label: Prima transazione
sidebar_position: 5
---

# Prima transazione

Questa guida illustra l'invio di token QOR, l'interrogazione delle transazioni e l'interazione con QoreChain attraverso le sue interfacce native, EVM e SVM.

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 — sostituisci il chain ID e gli endpoint della mainnet riportati nella pagina **Connessione alla mainnet** quando esegui transazioni sulla mainnet.
:::

## Verifica del saldo

Prima di inviare token, verifica il saldo del tuo account:

```bash
qorechaind query bank balances qor1youraddress... --output json
```

La risposta include tutte le denominazioni di token detenute dall'account. I saldi QOR sono visualizzati in `uqor` (micro-QOR), dove **1 QOR = 1.000.000 uqor**.

## Invio di QOR

Trasferisci token dalla tua chiave a un altro indirizzo:

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Questo invia **1 QOR** (1.000.000 uqor) all'indirizzo del destinatario, pagando una commissione di 500 uqor.

:::caution I trasferimenti cosmos richiedono una firma ibrida PQC
Sul percorso cosmos, l'impostazione predefinita della rete è `hybrid_signature_mode = required` (versione della chain corrente **v3.1.77**). Un semplice `tx bank send` classico viene **rifiutato** — ogni transazione sul percorso cosmos deve includere una firma ML-DSA-87 (Dilithium-5) insieme alla firma secp256k1. Genera una chiave Dilithium-5 con `qorechaind tx pqc gen-key`, quindi allega la cofirma ibrida con `qorechaind tx pqc cosign` (oppure costruisci la transazione con `buildHybridTx` dell'SDK QoreChain, utilizzando `includePqcPublicKey` in modo che la chiave si registri automaticamente al primo utilizzo). Per produrre la firma ibrida al di fuori della CLI, la libreria open-source [**qorechain-pqc**](/developer-guide/post-quantum-signing) (`hybridSignBytes`) e l'SDK QoreChain fanno l'equivalente nel codice. Vedi [Configurazione del wallet](/getting-started/wallet-setup) per il flusso ibrido completo.
:::

Ti verrà chiesto di confermare la transazione prima che venga trasmessa. Una volta confermata, la CLI restituisce un hash della transazione.

## Interrogazione di una transazione

Cerca una transazione completata tramite il suo hash:

```bash
qorechaind query tx <txhash>
```

L'output include lo stato della transazione, il gas utilizzato, l'altezza del blocco e tutti gli eventi emessi durante l'esecuzione.

Per l'output in JSON:

```bash
qorechaind query tx <txhash> --output json
```

## Utilizzo di JSON-RPC (EVM)

L'ambiente di esecuzione EVM di QoreChain espone un'interfaccia JSON-RPC Ethereum standard sulla porta `8545`.

:::note
Le transazioni EVM **non sono interessate** dal requisito di PQC ibrida del percorso cosmos. Utilizzano un percorso ante `eth_secp256k1` separato, quindi la firma Ethereum standard (MetaMask, ethers.js, ecc.) funziona senza un'estensione PQC.
:::

### Ottenere il numero dell'ultimo blocco

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }' | jq '.result'
```

### Ottenere il saldo di un account

```bash
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0xYourEVMAddress", "latest"],
    "id": 1
  }' | jq '.result'
```

Il saldo viene restituito come valore codificato in esadecimale nella denominazione più piccola.

## Utilizzo di SVM RPC

L'ambiente di esecuzione SVM di QoreChain espone un'interfaccia RPC compatibile con Solana sulla porta `8899`.

### Ottenere lo slot corrente

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getSlot",
    "id": 1
  }' | jq '.result'
```

### Ottenere il saldo di un account

```bash
curl -s -X POST http://localhost:8899 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "getBalance",
    "params": ["YourSVMPublicKey"],
    "id": 1
  }' | jq '.result'
```

## Pattern comuni della CLI

Quando si lavora con la CLI `qorechaind`, questi flag vengono utilizzati frequentemente:

| Flag               | Descrizione                   | Esempio                        |
| ------------------ | ----------------------------- | ------------------------------ |
| `--chain-id`       | Specifica la chain di destinazione | `--chain-id qorechain-diana` |
| `--fees`           | Commissione della transazione in uqor | `--fees 500uqor`        |
| `--from`           | Nome della chiave di firma o indirizzo | `--from mykey`         |
| `--output`         | Formato della risposta        | `--output json`                |
| `--node`           | Endpoint RPC a cui connettersi | `--node tcp://localhost:26657` |
| `--gas`            | Limite di gas per la transazione | `--gas auto`                |
| `--gas-adjustment` | Moltiplicatore per il gas stimato | `--gas-adjustment 1.3`     |
| `-y`               | Salta il prompt di conferma   | `-y`                           |

### Esempio: comando completo con tutti i flag comuni

```bash
qorechaind tx bank send mykey qor1recipient... 500000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor \
  --node tcp://localhost:26657 \
  --output json \
  -y
```

## Prossimi passi

Ora che hai inviato la tua prima transazione, esplora di più di ciò che QoreChain offre:

* **Staking e delega** — Metti in staking QOR e ottieni ricompense
* **Bridging di asset** — Sposta asset tra le chain
* **Sviluppo EVM** — Distribuisci smart contract Solidity su QoreChain
