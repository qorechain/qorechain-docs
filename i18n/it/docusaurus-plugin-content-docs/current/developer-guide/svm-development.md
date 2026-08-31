---
slug: /developer-guide/svm-development
title: Sviluppo SVM
sidebar_label: Sviluppo SVM
sidebar_position: 4
---

# Sviluppo SVM

QoreChain include un ambiente di esecuzione **Solana Virtual Machine (SVM)**, che consente agli sviluppatori di distribuire ed eseguire programmi SBF/BPF utilizzando gli strumenti Solana con cui hanno già familiarità. Il modulo SVM espone un'interfaccia JSON-RPC compatibile con Solana sulla **porta 8899**, che `qorechaind start` avvia automaticamente (vedi [JSON-RPC Server](#json-rpc-server) qui sotto).

:::note
I comandi seguenti utilizzano la mainnet **`qorechain-vladi`**, attiva dal 7 giugno 2026 e in esecuzione sulla versione della chain **v3.1.95**. Sostituisci con `--chain-id qorechain-diana` per la testnet.
:::

---

:::caution L'invio di transazioni SVM è attualmente disabilitato
A partire dalla versione della chain v3.1.89 (22 agosto), in seguito a un incidente, la lane di esecuzione SVM è **disabilitata a livello di rete per l'invio di transazioni** — qualsiasi transazione inviata a `x/svm` (distribuzione di programmi, esecuzione di istruzioni, creazione di account, trasferimenti) restituisce `code 11, "SVM module is disabled"`. Questo vale sia per il tuo nodo personale sia per gli endpoint pubblici. I metodi RPC di sola lettura possono ancora rispondere, ma non costruire né provare un'integrazione SVM live finché la lane non viene riaperta — si tratta di una disabilitazione a livello di compilazione, non di un parametro a runtime, quindi non può essere riattivata con un voto di governance; si prevede che rimarrà disattivata finché un audit esterno non la autorizzi.
:::

## Panoramica

Il modulo `x/svm` fornisce:

* **QOR nativo come asset SVM di prima classe** — il saldo unificato dell'account, visibile in lamport
* Distribuzione ed esecuzione di programmi SBF/BPF
* Creazione e gestione di data account
* Un endpoint JSON-RPC compatibile con Solana
* Mappatura bidirezionale degli indirizzi tra i formati QoreChain e Solana
* Misurazione del compute budget ed economia dello storage basata sulla rent

---

## QOR nativo sull'interfaccia SVM {#native-qor}

A partire dalla versione della chain **v3.1.82**, l'interfaccia SVM è un'**interfaccia nativa in QOR di prima classe**, non un saldo separato in un sandbox. L'unico saldo unificato dell'account — gli stessi fondi visibili come `uqor` sull'interfaccia Cosmos e come wei a 18 decimali sull'EVM — appare sul lato SVM in **lamport** (9 decimali):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** restituiscono il QOR nativo dell'account (in lamport).
* **`getSignaturesForAddress`** restituisce la cronologia delle transazioni che riguardano un indirizzo — utilizzabile per il rilevamento dei depositi con gli strumenti Solana standard.
* **I trasferimenti del System Program spostano QOR nativo** — un'istruzione di trasferimento in stile Solana sposta gli stessi fondi che sposterebbe un `MsgSend` Cosmos o un trasferimento EVM.
* **Forma dell'indirizzo SVM** — l'indirizzo SVM di un account sono i suoi 20 byte dell'account allineati a destra fino a 32 byte e codificati in base58. Tutte e tre le forme di indirizzo (`qor1...`, `0x...`, base58) fanno riferimento allo stesso account.

Gli endpoint pubblici (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sono **di sola lettura** — l'invio di transazioni è disabilitato a livello di edge. Normalmente dovresti eseguire il tuo nodo (porta 8899) per inviare transazioni SVM, ma vedi l'avviso sopra: la lane di transazione `x/svm` stessa è attualmente disabilitata a livello di rete, incluso sul tuo stesso nodo.

---

## JSON-RPC Server {#json-rpc-server}

Il server JSON-RPC compatibile con Solana viene **avviato da `qorechaind start`** ed è **abilitato di default**. Viene configurato tramite una sezione `[svm-rpc]` in `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

I valori predefiniti sono `enable = true` e `address = "127.0.0.1:8899"`, quindi un nodo appena avviato serve già l'interfaccia JSON-RPC Solana sulla porta 8899 — `@solana/web3.js` si connette a `http://127.0.0.1:8899` senza configurazioni aggiuntive. `getVersion` riporta `1.18.0-qorechain`, e `getBalance` / `getAccountInfo` restituiscono account SVM on-chain live.

| Proprietà      | Valore                     |
| ------------- | ------------------------- |
| URL predefinito   | `http://127.0.0.1:8899`   |
| Abilitato       | Sì, di default           |
| Avviato da    | `qorechaind start`        |
| Compatibilità | Solana JSON-RPC (subset)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Metodi supportati

| Metodo                              | Descrizione                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Recupera i dati dell'account e il saldo in lamport |
| `getBalance`                        | Ottiene il saldo dell'account in lamport (QOR nativo) |
| `getSignaturesForAddress`           | Cronologia delle transazioni per un indirizzo        |
| `getSlot`                           | Numero dello slot corrente                |
| `getMinimumBalanceForRentExemption` | Saldo minimo per una data dimensione dei dati     |
| `getVersion`                        | Informazioni sulla versione del runtime SVM        |
| `getHealth`                         | Controllo dello stato dell'endpoint SVM         |

---

## Distribuzione e interazione con i programmi

:::info
**Esecuzione SBF moderna.** Il motore di esecuzione SVM è stato modernizzato su **solana-sbpf 0.21.1**, quindi i programmi SBF compilati di recente con l'attuale toolchain Solana (**platform-tools v1.53 / agave 4.x**) vengono sia **distribuiti che eseguiti** su QoreChain — l'esecuzione è pienamente supportata, non solo la distribuzione. I programmi compilati con `cargo build-sbf --arch v0` o `--arch v3` sono entrambi supportati.
:::

1. **Distribuire un programma SBF** — Compila il tuo programma Solana in un shared object SBF con l'attuale platform-tools (v1.53 / agave 4.x), quindi distribuiscilo su QoreChain:

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

   | Parametro           | Formato            | Descrizione                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Stringa base58     | L'indirizzo del programma distribuito |
   | `data-hex`          | Byte codificati in hex | Dati dell'istruzione serializzati    |

3. **Creare un data account** — I programmi spesso hanno bisogno di account per memorizzare lo stato. Creane uno con una dimensione e un owner specificati:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametro      | Descrizione                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Il programma proprietario di questo account (base58)        |
   | `space`        | Dimensione del campo dati in byte                    |
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

QoreChain mantiene una **mappatura bidirezionale degli indirizzi** tra gli indirizzi Bech32 nativi (`qor1...`) e gli indirizzi base58 in stile Solana:

| Direzione     | Esempio                                                    |
| ------------- | ---------------------------------------------------------- |
| Da nativo a SVM | `qor1abc...xyz` viene mappato su un indirizzo base58 deterministico     |
| Da SVM a nativo | Gli indirizzi di programma base58 vengono mappati sugli equivalenti `qor1...` |

La mappatura è deterministica ed è gestita dal modulo `x/svm`. Entrambe le rappresentazioni fanno riferimento allo stesso account sottostante.

---

## Modello di rent

Il modulo SVM utilizza un **modello di storage basato sulla rent** per prevenire il bloat dello stato:

| Parametro                  | Valore      |
| -------------------------- | ---------- |
| Lamport per byte all'anno | `3,480`    |
| Moltiplicatore di esenzione dalla rent  | `2.0`      |
| Frequenza di riscossione       | Ogni epoch |

* Gli account con un saldo **superiore** a `2 * (data_size * 3480 / seconds_per_year)` in lamport sono **esenti dalla rent** e non vengono mai addebitati.
* Gli account **al di sotto** della soglia di esenzione dalla rent vengono addebitati a ogni epoch. Se il saldo raggiunge lo zero, l'account viene eliminato.

:::info
**Best practice:** finanzia sempre i data account al di sopra del minimo di esenzione dalla rent per evitare l'eliminazione imprevista dell'account.
:::

---

## Compute Budget

Ogni esecuzione di istruzione viene misurata con unità di calcolo:

| Parametro                                | Valore       |
| ---------------------------------------- | ----------- |
| Massimo di unità di calcolo per istruzione        | `1,400,000` |
| Profondità massima di CPI (cross-program invocation) | `4`         |
| Dimensione massima del programma         | `10 MB`     |
| Dimensione massima dei dati dell'account    | `10 MB`     |

I programmi che superano il compute budget vengono interrotti e la transazione viene annullata.

---

## Riepilogo dei parametri

| Parametro                   | Valore        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Porta JSON-RPC               | 8899         |

---

## Interoperabilità Cross-VM

I programmi SVM possono comunicare con i contratti EVM e CosmWasm tramite il percorso di messaggistica cross-VM **asincrono**:

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

I messaggi vengono accodati ed elaborati dall'EndBlocker. Vedi [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) per i dettagli sul ciclo di vita dei messaggi e sul comportamento in caso di timeout.

---

## Prossimi passi

* [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) — Comunicazione tra SVM, EVM e CosmWasm
* [Sviluppo EVM](/developer-guide/evm-development) — Smart contract Solidity su QoreChain
* [Sviluppo CosmWasm](/developer-guide/cosmwasm-development) — Contratti WebAssembly basati su Rust
