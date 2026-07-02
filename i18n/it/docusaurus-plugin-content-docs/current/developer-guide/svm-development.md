---
slug: /developer-guide/svm-development
title: Sviluppo SVM
sidebar_label: Sviluppo SVM
sidebar_position: 4
---

# Sviluppo SVM

QoreChain include un ambiente di esecuzione **Solana Virtual Machine (SVM)**, che consente agli sviluppatori di distribuire ed eseguire programmi SBF/BPF utilizzando i familiari strumenti di Solana. Il modulo SVM espone un'interfaccia JSON-RPC compatibile con Solana sulla **porta 8899**, che `qorechaind start` avvia automaticamente (vedi [Server JSON-RPC](#json-rpc-server) più sotto).

:::note
I comandi seguenti utilizzano la mainnet **`qorechain-vladi`**, attiva dal 7 giugno 2026 con la versione di chain **v3.1.82**. Sostituisci con `--chain-id qorechain-diana` per la testnet.
:::

---

## Panoramica

Il modulo `x/svm` fornisce:

* **QOR nativo come asset SVM di prima classe** — il saldo unificato dell'account, visibile in lamports
* Distribuzione ed esecuzione di programmi SBF/BPF
* Creazione e gestione di account dati
* Un endpoint JSON-RPC compatibile con Solana
* Mappatura bidirezionale degli indirizzi tra i formati di indirizzo QoreChain e Solana
* Misurazione del compute budget ed economia dello storage basata sulla rent

---

## QOR nativo sull'interfaccia SVM {#native-qor}

A partire dalla versione di chain **v3.1.82**, l'interfaccia SVM è un'**interfaccia QOR-nativa di prima classe**, non un saldo sandbox separato. L'unico saldo unificato dell'account — gli stessi fondi visibili come `uqor` sull'interfaccia Cosmos e come wei a 18 decimali sull'EVM — appare sul lato SVM in **lamports** (9 decimali):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** restituiscono il QOR nativo dell'account (in lamports).
* **`getSignaturesForAddress`** restituisce la cronologia delle transazioni che toccano un indirizzo — utilizzabile per il rilevamento dei depositi con gli strumenti Solana standard.
* **I trasferimenti del System Program muovono QOR nativo** — un'istruzione di trasferimento in stile Solana muove gli stessi fondi che muoverebbero un `MsgSend` Cosmos o un trasferimento EVM.
* **Forma dell'indirizzo SVM** — l'indirizzo SVM di un account è costituito dai suoi 20 byte di account riempiti a destra fino a 32 byte e codificati in base58. Tutte e tre le forme di indirizzo (`qor1...`, `0x...`, base58) fanno riferimento allo stesso account.

Gli endpoint pubblici (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sono **in sola lettura** — l'invio di transazioni è disabilitato all'edge. Esegui il tuo nodo (porta 8899) per inviare transazioni SVM.

---

## Server JSON-RPC {#json-rpc-server}

Il server JSON-RPC compatibile con Solana viene **avviato da `qorechaind start`** ed è **abilitato per impostazione predefinita**. Si configura tramite una sezione `[svm-rpc]` in `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

I valori predefiniti sono `enable = true` e `address = "127.0.0.1:8899"`, quindi un nodo appena avviato serve già l'interfaccia JSON-RPC di Solana sulla porta 8899 — `@solana/web3.js` si connette a `http://127.0.0.1:8899` senza alcuna configurazione aggiuntiva. `getVersion` riporta `1.18.0-qorechain`, e `getBalance` / `getAccountInfo` restituiscono account SVM on-chain in tempo reale.

| Proprietà     | Valore                    |
| ------------- | ------------------------- |
| URL predefinito | `http://127.0.0.1:8899` |
| Abilitato     | Sì, per impostazione predefinita |
| Avviato da    | `qorechaind start`        |
| Compatibilità | Solana JSON-RPC (sottoinsieme) |
| `getVersion`  | `1.18.0-qorechain`        |

### Metodi supportati

| Metodo                              | Descrizione                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Recupera i dati dell'account e il saldo in lamports |
| `getBalance`                        | Ottiene il saldo dell'account in lamports (QOR nativo) |
| `getSignaturesForAddress`           | Cronologia delle transazioni per un indirizzo |
| `getSlot`                           | Numero di slot corrente                   |
| `getMinimumBalanceForRentExemption` | Saldo minimo per una data dimensione dei dati |
| `getVersion`                        | Informazioni sulla versione del runtime SVM |
| `getHealth`                         | Controllo di integrità per l'endpoint SVM |

---

## Distribuire e interagire con i programmi

:::info
**Esecuzione SBF moderna.** Il motore di esecuzione SVM è stato modernizzato su **solana-sbpf 0.21.1**, quindi i programmi SBF appena compilati con la toolchain Solana corrente (**platform-tools v1.53 / agave 4.x**) vengono sia **distribuiti che eseguiti** su QoreChain — l'esecuzione è pienamente supportata, non solo la distribuzione. Sono supportati i programmi compilati sia con `cargo build-sbf --arch v0` che con `--arch v3`.
:::

1. **Distribuire un programma SBF** — Compila il tuo programma Solana in un oggetto condiviso SBF con i platform-tools correnti (v1.53 / agave 4.x), quindi distribuiscilo su QoreChain:

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   La risposta della transazione include il **program ID** in formato base58.

2. **Eseguire un'istruzione** — Chiama un programma BPF on-chain con dati di istruzione:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametro           | Formato           | Descrizione                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Stringa base58    | L'indirizzo del programma distribuito |
   | `data-hex`          | Byte codificati in esadecimale | Dati di istruzione serializzati |

3. **Creare un account dati** — I programmi spesso hanno bisogno di account per memorizzare lo stato. Creane uno con una dimensione e un proprietario specificati:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametro      | Descrizione                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Il programma proprietario di questo account (base58) |
   | `space`        | Dimensione del campo dati in byte                  |
   | `lamports`     | Saldo iniziale (deve soddisfare il minimo di esenzione dalla rent) |

   Interroga il saldo minimo esente da rent per una data dimensione:

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **Utilizzare @solana/web3.js** — L'SDK JavaScript di Solana funziona direttamente con l'endpoint SVM di QoreChain:

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## Mappatura degli indirizzi

QoreChain mantiene una **mappatura bidirezionale degli indirizzi** tra indirizzi Bech32 nativi (`qor1...`) e indirizzi base58 in stile Solana:

| Direzione     | Esempio                                                    |
| ------------- | ---------------------------------------------------------- |
| Da nativo a SVM | `qor1abc...xyz` viene mappato a un indirizzo base58 deterministico |
| Da SVM a nativo | Gli indirizzi base58 dei programmi vengono mappati agli equivalenti `qor1...` |

La mappatura è deterministica ed è gestita dal modulo `x/svm`. Entrambe le rappresentazioni fanno riferimento allo stesso account sottostante.

---

## Modello di rent

Il modulo SVM utilizza un **modello di storage basato sulla rent** per prevenire il rigonfiamento dello stato:

| Parametro                  | Valore     |
| -------------------------- | ---------- |
| Lamports per byte all'anno | `3,480`    |
| Moltiplicatore di esenzione dalla rent | `2.0` |
| Frequenza di riscossione   | Ogni epoca |

* Gli account con un saldo **superiore** a `2 * (data_size * 3480 / seconds_per_year)` in lamports sono **esenti da rent** e non vengono mai addebitati.
* Agli account **al di sotto** della soglia di esenzione dalla rent viene addebitata la rent a ogni epoca. Se il saldo raggiunge lo zero, l'account viene eliminato.

:::info
**Buona pratica:** finanzia sempre gli account dati al di sopra del minimo di esenzione dalla rent per evitare l'eliminazione imprevista dell'account.
:::

---

## Compute Budget

Ogni esecuzione di istruzione è misurata con unità di calcolo:

| Parametro                                | Valore      |
| ---------------------------------------- | ----------- |
| Unità di calcolo massime per istruzione  | `1,400,000` |
| Profondità massima CPI (invocazione cross-programma) | `4` |
| Dimensione massima del programma         | `10 MB`     |
| Dimensione massima dei dati dell'account | `10 MB`     |

I programmi che superano il compute budget vengono interrotti e la transazione viene annullata.

---

## Riepilogo dei parametri

| Parametro                   | Valore       |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Porta JSON-RPC              | 8899         |

---

## Interoperabilità cross-VM

I programmi SVM possono comunicare con i contratti EVM e CosmWasm attraverso il percorso di messaggi cross-VM **asincrono**:

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

I messaggi vengono accodati ed elaborati dall'EndBlocker. Vedi [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) per i dettagli sul ciclo di vita dei messaggi e sul comportamento dei timeout.

---

## Prossimi passi

* [Interoperabilità cross-VM](/developer-guide/cross-vm-interoperability) — Comunicazione tra SVM, EVM e CosmWasm
* [Sviluppo EVM](/developer-guide/evm-development) — Smart contract Solidity su QoreChain
* [Sviluppo CosmWasm](/developer-guide/cosmwasm-development) — Contratti WebAssembly basati su Rust
