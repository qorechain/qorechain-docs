---
slug: /developer-guide/svm-development
title: Dezvoltare SVM
sidebar_label: Dezvoltare SVM
sidebar_position: 4
---

# Dezvoltare SVM

QoreChain include un mediu de execuție **Solana Virtual Machine (SVM)**, care permite dezvoltatorilor să implementeze și să execute programe SBF/BPF folosind uneltele Solana cu care sunt deja obișnuiți. Modulul SVM expune o interfață JSON-RPC compatibilă cu Solana pe **portul 8899**, pe care `qorechaind start` o pornește automat (vezi [Server JSON-RPC](#json-rpc-server) mai jos).

:::note
Comenzile de mai jos folosesc rețeaua mainnet **`qorechain-vladi`**, live din 7 iunie 2026, rulând versiunea de chain **v3.1.95**. Înlocuiți cu `--chain-id qorechain-diana` pentru testnet.
:::

---

:::caution Trimiterea de tranzacții SVM este momentan dezactivată
Începând cu versiunea de chain v3.1.89 (22 august), în urma unui incident, lane-ul de execuție SVM este **dezactivat la nivelul întregii rețele pentru trimiterea de tranzacții** — orice tranzacție trimisă către `x/svm` (implementare de programe, execuție de instrucțiuni, creare de conturi, transferuri) returnează `code 11, "SVM module is disabled"`. Acest lucru se aplică atât nodului propriu, cât și endpoint-urilor publice. Metodele RPC de tip citire pot răspunde în continuare, dar nu construiți și nu repetați o integrare SVM live până când lane-ul nu se redeschide — este o dezactivare la momentul compilării, nu un parametru de runtime, deci nu poate fi repornit printr-un vot de guvernanță; se așteaptă să rămână dezactivat până când un audit extern îl aprobă.
:::

## Prezentare generală

Modulul `x/svm` oferă:

* **QOR nativ ca activ SVM de prim rang** — soldul unificat al contului, vizibil în lamporți
* Implementare și execuție de programe SBF/BPF
* Creare și gestionare de conturi de date
* Un endpoint JSON-RPC compatibil cu Solana
* Corespondență bidirecțională de adrese între formatele de adrese QoreChain și Solana
* Măsurare a bugetului de calcul și economie de stocare bazată pe chirie

---

## QOR nativ pe interfața SVM {#native-qor}

Începând cu versiunea de chain **v3.1.82**, interfața SVM este o **interfață native-QOR de prim rang**, nu un sold separat de tip sandbox. Soldul unic unificat al contului — aceiași bani vizibili ca `uqor` pe interfața Cosmos și ca wei cu 18 zecimale pe EVM — apare pe partea SVM în **lamporți** (9 zecimale):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** returnează QOR-ul nativ al contului (în lamporți).
* **`getSignaturesForAddress`** returnează istoricul de tranzacții care implică o adresă — utilizabil pentru detectarea depunerilor cu uneltele standard Solana.
* **Transferurile din System Program mută QOR nativ** — o instrucțiune de transfer în stil Solana mută aceiași bani pe care i-ar muta un `MsgSend` Cosmos sau un transfer EVM.
* **Forma adresei SVM** — adresa SVM a unui cont este cei 20 de bytes ai contului, completați la dreapta până la 32 de bytes și codificați base58. Toate cele trei forme de adresă (`qor1...`, `0x...`, base58) se referă la același cont.

Endpoint-urile publice (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sunt **doar pentru citire** — trimiterea de tranzacții este dezactivată la nivelul marginii rețelei. În mod normal ați rula propriul nod (portul 8899) pentru a trimite tranzacții SVM, dar vedeți avertismentul de mai sus: lane-ul de tranzacții `x/svm` însuși este momentan dezactivat la nivelul întregii rețele, inclusiv pe propriul nod.

---

## Server JSON-RPC {#json-rpc-server}

Serverul JSON-RPC compatibil cu Solana este **pornit de `qorechaind start`** și este **activat implicit**. Este configurat printr-o secțiune `[svm-rpc]` în `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Valorile implicite sunt `enable = true` și `address = "127.0.0.1:8899"`, astfel încât un nod pornit recent servește deja interfața JSON-RPC Solana pe portul 8899 — `@solana/web3.js` se conectează la `http://127.0.0.1:8899` fără configurări suplimentare. `getVersion` raportează `1.18.0-qorechain`, iar `getBalance` / `getAccountInfo` returnează conturi SVM live, de pe chain.

| Proprietate      | Valoare                     |
| ------------- | ------------------------- |
| URL implicit   | `http://127.0.0.1:8899`   |
| Activat       | Da, implicit           |
| Pornit de    | `qorechaind start`        |
| Compatibilitate | JSON-RPC Solana (subset)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Metode suportate

| Metodă                              | Descriere                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Preia datele contului și soldul în lamporți |
| `getBalance`                        | Obține soldul contului în lamporți (QOR nativ) |
| `getSignaturesForAddress`           | Istoricul tranzacțiilor pentru o adresă        |
| `getSlot`                           | Numărul slotului curent                     |
| `getMinimumBalanceForRentExemption` | Soldul minim pentru o dimensiune de date dată     |
| `getVersion`                        | Informații despre versiunea runtime-ului SVM        |
| `getHealth`                         | Verificare de sănătate pentru endpoint-ul SVM         |

---

## Implementarea și interacțiunea cu programe

:::info
**Execuție SBF modernă.** Motorul de execuție SVM a fost modernizat pe **solana-sbpf 0.21.1**, astfel încât programele SBF compilate recent cu toolchain-ul Solana curent (**platform-tools v1.53 / agave 4.x**) atât **se implementează, cât și rulează** pe QoreChain — execuția este complet suportată, nu doar implementarea. Programele construite fie cu `cargo build-sbf --arch v0`, fie cu `--arch v3` sunt suportate.
:::

1. **Implementarea unui program SBF** — Compilați programul Solana într-un obiect partajat SBF cu platform-tools-ul curent (v1.53 / agave 4.x), apoi implementați-l pe QoreChain:

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

2. **Executarea unei instrucțiuni** — Apelați un program BPF de pe chain cu date de instrucțiune:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru           | Format            | Descriere                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Șir base58     | Adresa programului implementat |
   | `data-hex`          | Bytes codificați hex | Date de instrucțiune serializate    |

3. **Crearea unui cont de date** — Programele au adesea nevoie de conturi pentru a stoca starea. Creați unul cu o dimensiune și un proprietar specificate:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru      | Descriere                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Programul care deține acest cont (base58)        |
   | `space`        | Dimensiunea câmpului de date în bytes                    |
   | `lamports`     | Soldul inițial (trebuie să atingă minimul de scutire de chirie) |

   Interogați soldul minim scutit de chirie pentru o dimensiune dată:

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

4. **Folosind @solana/web3.js** — SDK-ul JavaScript Solana funcționează direct cu endpoint-ul SVM QoreChain:

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

## Corespondența adreselor

QoreChain menține o **corespondență bidirecțională de adrese** între adresele Bech32 native (`qor1...`) și adresele base58 în stil Solana:

| Direcție     | Exemplu                                                    |
| ------------- | ---------------------------------------------------------- |
| Nativ către SVM | `qor1abc...xyz` corespunde unei adrese base58 deterministe     |
| SVM către nativ | Adresele de program base58 corespund înapoi echivalentelor `qor1...` |

Corespondența este deterministă și gestionată de modulul `x/svm`. Ambele reprezentări se referă la același cont subiacent.

---

## Modelul de chirie

Modulul SVM folosește un **model de stocare bazat pe chirie** pentru a preveni umflarea stării:

| Parametru                  | Valoare      |
| -------------------------- | ---------- |
| Lamporți pe byte pe an | `3,480`    |
| Multiplicator de scutire de chirie  | `2.0`      |
| Frecvența colectării       | La fiecare epocă |

* Conturile cu un sold **peste** `2 * (data_size * 3480 / seconds_per_year)` lamporți sunt **scutite de chirie** și nu sunt taxate niciodată.
* Conturile **sub** pragul de scutire de chirie sunt taxate cu chirie la fiecare epocă. Dacă soldul ajunge la zero, contul este eliminat.

:::info
**Bună practică:** Alimentați întotdeauna conturile de date peste minimul de scutire de chirie pentru a evita ștergerea neașteptată a contului.
:::

---

## Bugetul de calcul

Fiecare execuție de instrucțiune este măsurată cu unități de calcul:

| Parametru                                | Valoare       |
| ---------------------------------------- | ----------- |
| Unități de calcul maxime pe instrucțiune        | `1,400,000` |
| Adâncime maximă CPI (invocare cross-program) | `4`         |
| Dimensiune maximă a programului         | `10 MB`     |
| Dimensiune maximă a datelor contului    | `10 MB`     |

Programele care depășesc bugetul de calcul sunt oprite, iar tranzacția este anulată.

---

## Rezumat parametri

| Parametru                   | Valoare        |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Port JSON-RPC               | 8899         |

---

## Interoperabilitate cross-VM

Programele SVM pot comunica cu contracte EVM și CosmWasm prin calea de mesaje cross-VM **asincronă**:

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

Mesajele sunt puse în coadă și procesate de EndBlocker. Vezi [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability) pentru detalii despre ciclul de viață al mesajelor și comportamentul de timeout.

---

## Pașii următori

* [Interoperabilitate cross-VM](/developer-guide/cross-vm-interoperability) — Comunicare între SVM, EVM și CosmWasm
* [Dezvoltare EVM](/developer-guide/evm-development) — Contracte inteligente Solidity pe QoreChain
* [Dezvoltare CosmWasm](/developer-guide/cosmwasm-development) — Contracte WebAssembly bazate pe Rust
