---
slug: /developer-guide/svm-development
title: Dezvoltare SVM
sidebar_label: Dezvoltare SVM
sidebar_position: 4
---

# Dezvoltare SVM

QoreChain include un mediu de execuție **Solana Virtual Machine (SVM)**, permițând dezvoltatorilor să implementeze și să execute programe SBF/BPF folosind instrumentele Solana familiare. Modulul SVM expune o interfață JSON-RPC compatibilă cu Solana pe **portul 8899**, pe care `qorechaind start` o lansează automat (vezi [Serverul JSON-RPC](#json-rpc-server) mai jos).

:::note
Comenzile de mai jos folosesc mainnet-ul **`qorechain-vladi`**, activ din 7 iunie 2026, care rulează versiunea de lanț **v3.1.82**. Înlocuiți cu `--chain-id qorechain-diana` pentru testnet.
:::

---

## Prezentare generală

Modulul `x/svm` oferă:

* **QOR nativ ca activ SVM de primă clasă** — soldul unificat al contului, vizibil în lamports
* Implementarea și execuția programelor SBF/BPF
* Crearea și gestionarea conturilor de date
* Un endpoint JSON-RPC compatibil cu Solana
* Mapare bidirecțională a adreselor între formatele de adrese QoreChain și Solana
* Contorizarea bugetului de calcul și economie de stocare bazată pe chirie (rent)

---

## QOR nativ pe interfața SVM {#native-qor}

Începând cu versiunea de lanț **v3.1.82**, interfața SVM este o **interfață nativă QOR de primă clasă**, nu un sold separat de tip sandbox. Soldul unic unificat al contului — aceleași fonduri vizibile ca `uqor` pe interfața Cosmos și ca wei cu 18 zecimale pe EVM — apare pe partea SVM în **lamports** (9 zecimale):

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** returnează QOR-ul nativ al contului (în lamports).
* **`getSignaturesForAddress`** returnează istoricul tranzacțiilor care ating o adresă — utilizabil pentru detectarea depunerilor cu instrumentele Solana standard.
* **Transferurile System Program mută QOR nativ** — o instrucțiune de transfer în stil Solana mută aceleași fonduri pe care le-ar muta un `MsgSend` Cosmos sau un transfer EVM.
* **Forma adresei SVM** — adresa SVM a unui cont este reprezentată de cei 20 de octeți ai contului completați la dreapta până la 32 de octeți și codificați în base58. Toate cele trei forme de adresă (`qor1...`, `0x...`, base58) se referă la același cont.

Endpoint-urile publice (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sunt **doar pentru citire** — trimiterea tranzacțiilor este dezactivată la margine. Rulați propriul nod (portul 8899) pentru a trimite tranzacții SVM.

---

## Serverul JSON-RPC {#json-rpc-server}

Serverul JSON-RPC compatibil cu Solana este **pornit de `qorechaind start`** și este **activat implicit**. Este configurat printr-o secțiune `[svm-rpc]` în `app.toml`:

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Valorile implicite sunt `enable = true` și `address = "127.0.0.1:8899"`, astfel încât un nod proaspăt pornit servește deja interfața Solana JSON-RPC pe portul 8899 — `@solana/web3.js` se conectează la `http://127.0.0.1:8899` fără nicio configurare suplimentară. `getVersion` raportează `1.18.0-qorechain`, iar `getBalance` / `getAccountInfo` returnează conturi SVM live de pe lanț.

| Proprietate       | Valoare                     |
| ----------------- | --------------------------- |
| URL implicit      | `http://127.0.0.1:8899`     |
| Activat           | Da, implicit                |
| Pornit de         | `qorechaind start`          |
| Compatibilitate   | Solana JSON-RPC (subset)    |
| `getVersion`      | `1.18.0-qorechain`          |

### Metode suportate

| Metodă                              | Descriere                                          |
| ----------------------------------- | -------------------------------------------------- |
| `getAccountInfo`                    | Obține datele contului și soldul în lamports       |
| `getBalance`                        | Obține soldul contului în lamports (QOR nativ)     |
| `getSignaturesForAddress`           | Istoricul tranzacțiilor pentru o adresă            |
| `getSlot`                           | Numărul slotului curent                            |
| `getMinimumBalanceForRentExemption` | Soldul minim pentru o anumită dimensiune de date   |
| `getVersion`                        | Informații despre versiunea runtime-ului SVM       |
| `getHealth`                         | Verificare de sănătate pentru endpoint-ul SVM      |

---

## Implementarea și interacțiunea cu programele

:::info
**Execuție SBF modernă.** Motorul de execuție SVM a fost modernizat pe **solana-sbpf 0.21.1**, astfel încât programele SBF proaspăt compilate cu lanțul de instrumente Solana curent (**platform-tools v1.53 / agave 4.x**) atât **se implementează, cât și rulează** pe QoreChain — execuția este complet suportată, nu doar implementarea. Programele construite fie cu `cargo build-sbf --arch v0`, fie cu `--arch v3` sunt suportate.
:::

1. **Implementați un program SBF** — Compilați programul Solana într-un obiect partajat SBF cu platform-tools curente (v1.53 / agave 4.x), apoi implementați-l pe QoreChain:

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

2. **Executați o instrucțiune** — Apelați un program BPF de pe lanț cu date de instrucțiune:

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru           | Format                  | Descriere                          |
   | ------------------- | ----------------------- | ---------------------------------- |
   | `program-id-base58` | Șir base58              | Adresa programului implementat     |
   | `data-hex`          | Octeți codificați hex   | Date de instrucțiune serializate   |

3. **Creați un cont de date** — Programele au adesea nevoie de conturi pentru a stoca starea. Creați unul cu o dimensiune și un proprietar specificate:

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Parametru      | Descriere                                                        |
   | -------------- | ---------------------------------------------------------------- |
   | `owner-base58` | Programul care deține acest cont (base58)                        |
   | `space`        | Dimensiunea câmpului de date în octeți                           |
   | `lamports`     | Soldul inițial (trebuie să atingă minimul de scutire de chirie)  |

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

4. **Folosirea @solana/web3.js** — SDK-ul JavaScript Solana funcționează direct cu endpoint-ul SVM al QoreChain:

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

QoreChain menține o **mapare bidirecțională a adreselor** între adresele native Bech32 (`qor1...`) și adresele base58 în stil Solana:

| Direcție        | Exemplu                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| Nativ către SVM | `qor1abc...xyz` se mapează la o adresă base58 deterministă                   |
| SVM către nativ | Adresele base58 ale programelor se mapează înapoi la echivalentele `qor1...` |

Maparea este deterministă și gestionată de modulul `x/svm`. Ambele reprezentări se referă la același cont subiacent.

---

## Modelul de chirie (rent)

Modulul SVM folosește un **model de stocare bazat pe chirie** pentru a preveni umflarea stării:

| Parametru                          | Valoare        |
| ---------------------------------- | -------------- |
| Lamports per octet per an          | `3,480`        |
| Multiplicator de scutire de chirie | `2.0`          |
| Frecvența colectării               | Fiecare epocă  |

* Conturile cu un sold **peste** `2 * (data_size * 3480 / seconds_per_year)` în lamports sunt **scutite de chirie** și nu sunt niciodată taxate.
* Conturile **sub** pragul de scutire de chirie sunt taxate cu chirie la fiecare epocă. Dacă soldul ajunge la zero, contul este eliminat.

:::info
**Bună practică:** Finanțați întotdeauna conturile de date peste minimul de scutire de chirie pentru a evita ștergerea neașteptată a contului.
:::

---

## Bugetul de calcul

Fiecare execuție de instrucțiune este contorizată cu unități de calcul:

| Parametru                                        | Valoare     |
| ------------------------------------------------ | ----------- |
| Unități de calcul maxime per instrucțiune        | `1,400,000` |
| Adâncime maximă CPI (invocare cross-program)     | `4`         |
| Dimensiunea maximă a programului                 | `10 MB`     |
| Dimensiunea maximă a datelor contului            | `10 MB`     |

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
| Port JSON-RPC               | 8899         |

---

## Interoperabilitate cross-VM

Programele SVM pot comunica cu contractele EVM și CosmWasm prin calea de mesaje cross-VM **asincronă**:

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

Mesajele sunt puse în coadă și procesate de EndBlocker. Vezi [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) pentru detalii despre ciclul de viață al mesajelor și comportamentul de timeout.

---

## Pașii următori

* [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) — Comunicarea între SVM, EVM și CosmWasm
* [Dezvoltare EVM](/developer-guide/evm-development) — Contracte inteligente Solidity pe QoreChain
* [Dezvoltare CosmWasm](/developer-guide/cosmwasm-development) — Contracte WebAssembly bazate pe Rust
