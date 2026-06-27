---
slug: /developer-guide/svm-development
title: Sviluppo SVM
sidebar_label: Sviluppo SVM
sidebar_position: 4
---

# Sviluppo SVM

QoreChain include un ambiente di esecuzione **Solana Virtual Machine (SVM)**, che consente agli sviluppatori di distribuire ed eseguire programmi SBF/BPF utilizzando i consueti strumenti Solana. Il modulo SVM espone un'interfaccia JSON-RPC compatibile con Solana sulla **porta 8899**, che `qorechaind start` avvia automaticamente (vedi [Server JSON-RPC](#json-rpc-server) di seguito).

:::note
I comandi seguenti utilizzano la mainnet **`qorechain-vladi`**, attiva dal 7 giugno 2026 ed eseguita con la versione della chain **v3.1.77**. Sostituisci `--chain-id qorechain-diana` per la testnet.
:::

---

## Panoramica

Il modulo `x/svm` fornisce:

* Distribuzione ed esecuzione di programmi SBF/BPF
* Creazione e gestione di account dati
* Un endpoint JSON-RPC compatibile con Solana
* Mappatura bidirezionale degli indirizzi tra i formati di indirizzo QoreChain e Solana
* Misurazione del budget di calcolo ed economia dello storage basata sul rent

---

## Server JSON-RPC {#json-rpc-server}

Il server JSON-RPC compatibile con Solana viene **avviato da `qorechaind start`** ed è **abilitato per impostazione predefinita**. Viene configurato tramite una sezione `[svm-rpc]` in `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

I valori predefiniti sono `enable = true` e `address = "127.0.0.1:8899"`, quindi un nodo appena avviato serve già l'interfaccia JSON-RPC Solana sulla porta 8899 — `@solana/web3.js` si connette a `http://127.0.0.1:8899` senza alcuna configurazione aggiuntiva. `getVersion` restituisce `1.18.0-qorechain`, e `getBalance` / `getAccountInfo` restituiscono account SVM on-chain in tempo reale.

| Proprietà     | Valore                    |
| ------------- | ------------------------- |
| URL predefinito | `http://127.0.0.1:8899` |
| Abilitato     | Sì, per impostazione predefinita |
| Avviato da    | `qorechaind start`        |
| Compatibilità | Solana JSON-RPC (sottoinsieme) |
| `getVersion`  | `1.18.0-qorechain`        |

### Metodi supportati

| Metodo                              | Descrizione                                  |
| ----------------------------------- | -------------------------------------------- |
| `getAccountInfo`                    | Recupera i dati dell'account e il saldo in lamport |
| `getBalance`                        | Ottiene il saldo dell'account in lamport     |
| `getSlot`                           | Numero dello slot corrente                   |
| `getMinimumBalanceForRentExemption` | Saldo minimo per una determinata dimensione dei dati |
| `getVersion`                        | Informazioni sulla versione del runtime SVM  |
| `getHealth`                         | Controllo dello stato dell'endpoint SVM      |

---

## Distribuzione e interazione con i programmi

:::info
**Esecuzione SBF moderna.** Il motore di esecuzione SVM è stato modernizzato su **solana-sbpf 0.21.1**, quindi i programmi SBF appena compilati con l'attuale toolchain Solana (**platform-tools v1.53 / agave 4.x**) vengono sia **distribuiti che eseguiti** su QoreChain — l'esecuzione è pienamente supportata, non solo la distribuzione. Sono supportati i programmi compilati sia con `cargo build-sbf --arch v0` che con `--arch v3`.
:::

1. **Distribuire un programma SBF** — Compila il tuo programma Solana in un oggetto condiviso SBF con gli attuali platform-tools (v1.53 / agave 4.x), quindi distribuiscilo su QoreChain:

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

2. **Eseguire un'istruzione** — Chiama un programma BPF on-chain con i dati dell'istruzione:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametro           | Formato           | Descrizione                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Stringa Base58    | L'indirizzo del programma distribuito |
   | `data-hex`          | Byte codificati in esadecimale | Dati dell'istruzione serializzati |

3. **Creare un account dati** — I programmi spesso necessitano di account per memorizzare lo stato. Creane uno con una dimensione e un proprietario specificati:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametro      | Descrizione                                          |
   | -------------- | ---------------------------------------------------- |
   | `owner-base58` | Il programma che possiede questo account (base58)    |
   | `space`        | Dimensione del campo dati in byte                    |
   | `lamports`     | Saldo iniziale (deve soddisfare il minimo di esenzione dal rent) |

   Interroga il saldo minimo esente da rent per una determinata dimensione:

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

4. **Utilizzo di @solana/web3.js** — L'SDK JavaScript di Solana funziona direttamente con l'endpoint SVM di QoreChain:

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
| Da SVM a nativo | Gli indirizzi base58 dei programmi vengono rimappati agli equivalenti `qor1...` |

La mappatura è deterministica ed è gestita dal modulo `x/svm`. Entrambe le rappresentazioni si riferiscono allo stesso account sottostante.

---

## Modello di rent

Il modulo SVM utilizza un **modello di storage basato sul rent** per prevenire il sovraccarico dello stato:

| Parametro                  | Valore     |
| -------------------------- | ---------- |
| Lamport per byte all'anno  | `3,480`    |
| Moltiplicatore di esenzione dal rent | `2.0` |
| Frequenza di riscossione   | Ad ogni epoch |

* Gli account con un saldo **superiore** a `2 * (data_size * 3480 / seconds_per_year)` in lamport sono **esenti dal rent** e non vengono mai addebitati.
* Gli account **al di sotto** della soglia di esenzione dal rent vengono addebitati del rent ad ogni epoch. Se il saldo raggiunge lo zero, l'account viene eliminato.

:::info
**Buona pratica:** Finanzia sempre gli account dati al di sopra del minimo di esenzione dal rent per evitare l'eliminazione imprevista dell'account.
:::

---

## Budget di calcolo

Ogni esecuzione di istruzione viene misurata con unità di calcolo:

| Parametro                                | Valore      |
| ---------------------------------------- | ----------- |
| Unità di calcolo massime per istruzione  | `1,400,000` |
| Profondità massima CPI (cross-program invocation) | `4`  |
| Dimensione massima del programma         | `10 MB`     |
| Dimensione massima dei dati dell'account | `10 MB`     |

I programmi che superano il budget di calcolo vengono arrestati e la transazione viene annullata.

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

I programmi SVM possono comunicare con i contratti EVM e CosmWasm tramite il percorso **asincrono** dei messaggi cross-VM:

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
