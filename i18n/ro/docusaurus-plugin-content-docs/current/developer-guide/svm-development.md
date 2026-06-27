---
slug: /developer-guide/svm-development
title: Dezvoltare SVM
sidebar_label: Dezvoltare SVM
sidebar_position: 4
---

# Dezvoltare SVM

QoreChain include un mediu de execuție **Solana Virtual Machine (SVM)**, care permite dezvoltatorilor să implementeze și să execute programe SBF/BPF folosind instrumentarul familiar Solana. Modulul SVM expune o interfață JSON-RPC compatibilă cu Solana pe **portul 8899**, pe care `qorechaind start` o lansează automat (vezi [Serverul JSON-RPC](#json-rpc-server) mai jos).

:::note
Comenzile de mai jos folosesc rețeaua principală **`qorechain-vladi`**, activă din 7 iunie 2026 și rulând versiunea de chain **v3.1.77**. Înlocuiți cu `--chain-id qorechain-diana` pentru rețeaua de test.
:::

---

## Prezentare generală

Modulul `x/svm` oferă:

* Implementarea și execuția programelor SBF/BPF
* Crearea și gestionarea conturilor de date
* Un punct final JSON-RPC compatibil cu Solana
* Maparea bidirecțională a adreselor între formatele de adrese QoreChain și Solana
* Contorizarea bugetului de calcul și economia de stocare bazată pe chirie

---

## Serverul JSON-RPC {#json-rpc-server}

Serverul JSON-RPC compatibil cu Solana este **pornit de `qorechaind start`** și este **activat în mod implicit**. El se configurează printr-o secțiune `[svm-rpc]` din `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Valorile implicite sunt `enable = true` și `address = "127.0.0.1:8899"`, astfel încât un nod proaspăt pornit servește deja interfața JSON-RPC Solana pe portul 8899 — `@solana/web3.js` se conectează la `http://127.0.0.1:8899` fără configurare suplimentară. `getVersion` raportează `1.18.0-qorechain`, iar `getBalance` / `getAccountInfo` returnează conturile SVM active de pe chain.

| Proprietate   | Valoare                   |
| ------------- | ------------------------- |
| URL implicit  | `http://127.0.0.1:8899`   |
| Activat       | Da, în mod implicit       |
| Pornit de     | `qorechaind start`        |
| Compatibilitate | Solana JSON-RPC (subset)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Metode acceptate

| Metodă                              | Descriere                                  |
| ----------------------------------- | ------------------------------------------ |
| `getAccountInfo`                    | Recuperează datele contului și soldul în lamporți |
| `getBalance`                        | Obține soldul contului în lamporți         |
| `getSlot`                           | Numărul slotului curent                    |
| `getMinimumBalanceForRentExemption` | Soldul minim pentru o anumită dimensiune de date |
| `getVersion`                        | Informații despre versiunea runtime-ului SVM |
| `getHealth`                         | Verificarea stării punctului final SVM     |

---

## Implementarea programelor și interacțiunea cu acestea

:::info
**Execuție SBF modernă.** Motorul de execuție SVM a fost modernizat pe baza **solana-sbpf 0.21.1**, astfel încât programele SBF proaspăt compilate cu instrumentarul Solana actual (**platform-tools v1.53 / agave 4.x**) atât **se implementează, cât și rulează** pe QoreChain — execuția este pe deplin acceptată, nu doar implementarea. Sunt acceptate programele construite cu `cargo build-sbf --arch v0` sau `--arch v3`.
:::

1. **Implementați un program SBF** — Compilați programul Solana într-un obiect partajat SBF cu platform-tools actual (v1.53 / agave 4.x), apoi implementați-l pe QoreChain:

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

   Răspunsul tranzacției include **ID-ul programului** în format base58.

2. **Executați o instrucțiune** — Apelați un program BPF de pe chain cu date de instrucțiune:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru           | Format            | Descriere                      |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Șir base58        | Adresa programului implementat |
   | `data-hex`          | Octeți codați hex | Datele de instrucțiune serializate |

3. **Creați un cont de date** — Programele au adesea nevoie de conturi pentru a stoca starea. Creați unul cu o dimensiune și un proprietar specificate:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru      | Descriere                                          |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Programul care deține acest cont (base58)          |
   | `space`        | Dimensiunea câmpului de date în octeți             |
   | `lamports`     | Soldul inițial (trebuie să atingă minimul de scutire de chirie) |

   Interogați soldul minim scutit de chirie pentru o anumită dimensiune:

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

4. **Utilizarea @solana/web3.js** — SDK-ul JavaScript Solana funcționează direct cu punctul final SVM al QoreChain:

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

## Maparea adreselor

QoreChain menține o **mapare bidirecțională a adreselor** între adresele native Bech32 (`qor1...`) și adresele în stil Solana în format base58:

| Direcție      | Exemplu                                                    |
| ------------- | ---------------------------------------------------------- |
| Nativ către SVM | `qor1abc...xyz` se mapează la o adresă base58 deterministă |
| SVM către nativ | Adresele de program base58 se mapează înapoi la echivalentele `qor1...` |

Maparea este deterministă și este gestionată de modulul `x/svm`. Ambele reprezentări se referă la același cont de bază.

---

## Modelul de chirie

Modulul SVM utilizează un **model de stocare bazat pe chirie** pentru a preveni umflarea stării:

| Parametru                  | Valoare    |
| -------------------------- | ---------- |
| Lamporți per octet per an  | `3,480`    |
| Multiplicator de scutire de chirie | `2.0`      |
| Frecvența colectării       | Fiecare epocă |

* Conturile cu un sold **peste** `2 * (data_size * 3480 / seconds_per_year)` în lamporți sunt **scutite de chirie** și nu sunt taxate niciodată.
* Conturile **sub** pragul de scutire de chirie sunt taxate cu chirie în fiecare epocă. Dacă soldul ajunge la zero, contul este eliminat.

:::info
**Bună practică:** Finanțați întotdeauna conturile de date peste minimul de scutire de chirie pentru a evita ștergerea neașteptată a contului.
:::

---

## Bugetul de calcul

Fiecare execuție de instrucțiune este contorizată cu unități de calcul:

| Parametru                                | Valoare     |
| ---------------------------------------- | ----------- |
| Maxim de unități de calcul per instrucțiune | `1,400,000` |
| Adâncimea maximă CPI (invocare între programe) | `4`         |
| Dimensiunea maximă a programului         | `10 MB`     |
| Dimensiunea maximă a datelor contului    | `10 MB`     |

Programele care depășesc bugetul de calcul sunt oprite, iar tranzacția este anulată.

---

## Rezumatul parametrilor

| Parametru                   | Valoare      |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Portul JSON-RPC             | 8899         |

---

## Interoperabilitate între VM-uri

Programele SVM pot comunica cu contractele EVM și CosmWasm prin calea **asincronă** de mesaje între VM-uri:

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

Mesajele sunt puse în coadă și procesate de EndBlocker. Vezi [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) pentru detalii despre ciclul de viață al mesajelor și comportamentul la expirare.

---

## Pașii următori

* [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability) — Comunicarea între SVM, EVM și CosmWasm
* [Dezvoltare EVM](/developer-guide/evm-development) — Contracte inteligente Solidity pe QoreChain
* [Dezvoltare CosmWasm](/developer-guide/cosmwasm-development) — Contracte WebAssembly bazate pe Rust
