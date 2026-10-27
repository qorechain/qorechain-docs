---
slug: /developer-guide/cross-vm-interoperability
title: Interoperabilitate între VM-uri
sidebar_label: Interoperabilitate între VM-uri
sidebar_position: 5
---

# Interoperabilitate între VM-uri

**Arhitectura triple-VM** a QoreChain (EVM, QoreChain Native, SVM) este concepută pentru a permite contractelor inteligente de pe orice mașină virtuală să comunice cu contracte de pe orice altă VM. Modulul `x/crossvm` oferă un mesaj de apel cu o cale în aceeași tranzacție și o cale în coadă.

:::caution Ce funcționează astăzi
Apelurile între VM-uri sunt disponibile doar în măsura în care este disponibil lane-ul lor țintă:

* `MsgCrossVMCall` este **oprit pe mainnet** de circuit breaker (`qorechaind query circuit disabled-list`); pe testnet este activat.
* **Lane-ul SVM este dezactivat** pentru tranzacții pe ambele rețele, deci un segment SVM nu poate rula.
* **Încărcarea QoreChain Native este permisionată** pe ambele rețele, iar **instanțierea este permisionată pe mainnet**, care nu are cod de contract stocat, deci nu există încă niciun contract QoreChain Native de apelat pe mainnet. Pe testnet, guvernanța a stocat câteva contracte revizuite pe care orice cont le poate instanția (vezi [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development)), deci acolo poate exista o țintă QoreChain Native.
* **Precompile-ul EVM sincron nu este activ** (vezi mai jos). O versiune întărită se află în binar începând cu v3.2.3, dar precompile-ul CrossVM nu este activat pe vreuna dintre rețele. (Pe 27 octombrie 2026, guvernanța testnet-ului a activat alte trei precompile-uri, PQC Verify, PQC Key Status și PRISM Consensus Params; mainnet-ul nu are niciunul activ. v3.2.4 nu schimbă care precompile-uri sunt active.)

Pe mainnet, rutele REST ale modulului (`/qorechain/crossvm/v1/...`) nu sunt servite de gateway-ul public (`501`); citește mesajele cu CLI-ul sau cu un client de interogare gRPC/ABCI.
:::

:::note
Endpoint-urile de mai jos folosesc implicit un nod local. Pe mainnet, folosește endpoint-urile RPC **`qorechain-vladi`** (Cosmos RPC **26657**, EVM JSON-RPC **8545**); testnet-ul este **`qorechain-diana`**.
:::

---

## Prezentare generală a arhitecturii

```
 EVM (Solidity)     QoreChain Native (Rust/Wasm)     SVM (BPF)
      |                        |                        |
      |--- sync (precompile) ->|                        |
      |                        |                        |
      |<-- async (EndBlocker) -|-- async (EndBlocker) ->|
      |                        |                        |
      |<------------ async (EndBlocker) ----------------|
```

| Cale             | Direcție        | Sincronizare     | Mecanism                        |
| ---------------- | --------------- | ---------------- | ------------------------------- |
| **Sincronă**     | EVM către QoreChain Native | Aceeași tranzacție | Precompile la `0x0000...0901` (încă inactiv, vezi mai jos) |
| **Mesaj, implicit** | Orice VM către orice altă VM | Aceeași tranzacție | `MsgCrossVMCall`; apelul se execută imediat, iar un eșec anulează întreaga tranzacție |
| **Mesaj, în coadă** | Orice VM către orice altă VM | Blocul următor (sau mai târziu) | `MsgCrossVMCall` cu `async` setat; mesajul așteaptă în coadă |

---

## Calea sincronă (EVM către QoreChain Native)

Calea sincronă folosește un **precompile** EVM la adresa `0x0000000000000000000000000000000000000901`. Este conceput pentru a permite contractelor Solidity să apeleze contracte QoreChain Native și să primească un răspuns în cadrul aceleiași tranzacții.

:::warning Inactiv pe mainnet și testnet
Precompile-ul punții CrossVM **nu este activ** pe `qorechain-vladi` și nici pe `qorechain-diana`: un apel către `0x…0901` reușește și returnează date goale. Binarul v3.2.3 conține o versiune întărită (refuză un `STATICCALL`, contorizează apelul său imbricat din gazul frame-ului apelant și îl jurnalizează astfel încât un revert EVM să anuleze și partea QoreChain Native, ajunge doar la ținte QoreChain Native din lista permisă și respectă circuit breaker-ul cross-VM), dar rulează abia după ce o actualizare aprobată prin guvernanță îl adaugă în lista activă. Exemplul de mai jos este structura pe care o decodifică nodul, dar nu poate rula până când precompile-ul nu este activ. Vezi [Precompilate EVM: starea rețelelor](/developer-guide/evm-precompiles#network-status).
:::

### Exemplu Solidity

Nodul decodifică intrarea precompile-ului ca un selector de 4 octeți urmat de argumentele codificate ABI ale `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector `0x3c11078c`). `targetVM` este `1` pentru un contract QoreChain Native (QoreChain Native este runtime-ul CosmWasm; `0` este EVM, pe care puntea întărită îl refuză ca țintă). `targetContract` este adresa bech32 a contractului ca șir, iar `payload` este mesajul de execuție al contractului ca octeți JSON UTF-8. Precompile-ul returnează octeții bruți ai răspunsului țintei.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CrossVMCaller {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;
    uint8 constant TARGET_QORECHAIN_NATIVE = 1;

    function callQoreChainNative(string calldata contractAddr, bytes calldata executeMsg)
        external
        returns (bytes memory)
    {
        bytes memory data = abi.encodeWithSignature(
            "executeCrossVMCall(uint8,string,bytes)",
            TARGET_QORECHAIN_NATIVE,
            contractAddr,
            executeMsg
        );
        (bool ok, bytes memory ret) = CROSSVM.call(data);
        require(ok, "cross-VM call failed");
        // While the precompile is not active, the call succeeds with empty data
        // and nothing executes; treat an empty reply as a failure.
        require(ret.length > 0, "cross-VM precompile not active or empty reply");
        return ret;
    }
}
```

Aceasta este structura pe care o decodifică nodul; este aceeași structură pe care o construiește encoderul `@qorechain/rdk`, iar contractul de mai sus corespunde șablonului de pornire din [Multi-VM](/rollups/multi-vm). Fondurile nu pot fi atașate prin precompile (calea prin mesajul `MsgCrossVMCall` acceptă `--funds`). Exemplul nu poate face nimic pe nicio rețea astăzi, deoarece precompile-ul nu este activ (vezi avertismentul de mai sus); ABI-ul se mai poate schimba înainte de activare.

Odată activ, precompile-ul execută imediat contractul QoreChain Native și returnează rezultatul. (Helperul `encodeCrossVmCalldata` din `@qorechain/rdk`, disponibil din 0.6.0 și în curentul 0.7.0, construiește calldata; vezi [Multi-VM](/rollups/multi-vm).) Cost de gaz: **50.000 de bază + 4 per octet de intrare + costul execuției**.

---

## Calea prin mesaj (`MsgCrossVMCall`)

Celelalte apeluri între VM-uri folosesc tranzacția `MsgCrossVMCall`. Chain-ul determină lane-ul sursă pornind de la expeditor, așa că mesajul conține doar VM-ul țintă, contractul țintă, payload-ul și fondurile opționale. Implicit, apelul se execută imediat în cadrul tranzacției, iar întreaga tranzacție este anulată dacă ținta eșuează. Cu flag-ul `async`, mesajul este pus în coadă și tratat de trecerea cozii de end-block a modulului într-un bloc ulterior (vezi ciclul de viață de mai jos). După cum s-a menționat mai sus, acest mesaj este oprit pe mainnet.

### CLI

`tx crossvm call` primește VM-ul țintă (`evm`, `cosmwasm` sau `svm`) și contractul țintă ca argumente poziționale, cu payload-ul în hex. CLI-ul nu cere VM-ul sursă: chain-ul deduce lane-ul apelantului din stare și ignoră câmpul declarat (CLI-ul completează o valoare provizorie pentru ca mesajul să treacă de propria validare):

```bash
qorechaind tx crossvm call evm 0x1234567890123456789012345678901234567890 \
  --payload 0a0b0c --from mykey --generate-only > tx.json
```

Alte flag-uri: `--funds <coins>` (doar pentru ținte QoreChain Native) și `--async` pentru a pune apelul în coadă în loc să fie executat acum. Semnează și transmite `tx.json` cu `tx pqc cosign` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)); pragul taxei este de 0.1 uqor per gaz. Un apel către propriul lane al apelantului este refuzat (începând cu v3.2.3).

:::caution Dezactivat pe mainnet
`MsgCrossVMCall` este oprit pe mainnet de circuit breaker, deci comanda nu poate reuși acolo astăzi. (Binarele de release anterioare v3.2.3 construiau și un mesaj care nu trecea de propria validare, deoarece VM-ul sursă era gol; binarul v3.2.3 corectează acest lucru.) Pe testnet mesajul este activat, dar lane-ul SVM este dezactivat, deci o țintă SVM nu poate fi atinsă; o țintă EVM, și o țintă QoreChain Native după ce acolo a fost instanțiat un contract, pot fi atinse.
:::

---

## Ciclul de viață al unui mesaj

Fiecare mesaj între VM-uri aflat în coadă trece printr-un set definit de stări:

```
Submitted --> Pending --> Executed
                |
                +--> Failed
                |
                +--> Timed Out
```

| Stare         | Descriere                                                 |
| ------------- | --------------------------------------------------------- |
| **Submitted** | Mesaj acceptat în coadă                                   |
| **Pending**   | În așteptarea execuției în următoarea trecere EndBlocker  |
| **Executed**  | Contractul țintă a fost apelat cu succes; răspuns înregistrat |
| **Failed**    | Execuția contractului țintă a fost anulată (revert); eroare înregistrată |
| **Timed Out** | Mesajul a depășit `queue_timeout_blocks` fără execuție    |

Începând cu v3.2.3, un apel din coadă care eșuează este anulat în întregime: rămâne doar înregistrarea sa `Failed`, iar fondurile atașate unui apel QoreChain Native eșuat nu mai sunt mutate în contract. Cât timp modulul este dezactivat sau `MsgCrossVMCall` este oprit de circuit breaker, coada **nu este executată**: mesajele din coadă rămân în așteptare și expiră la termenul lor, cu excepția cazului în care comutatorul este ridicat mai întâi.

---

## Parametri

| Parametru              | Valoare      | Descriere                                      |
| ---------------------- | ------------ | ---------------------------------------------- |
| `enabled`              | `true`       | Comutator la nivel de modul (mesajul de apel în sine este oprit separat pe mainnet) |
| `max_message_size`     | 65.536 octeți | Dimensiunea maximă a payload-ului per mesaj   |
| `max_queue_size`       | 1.000        | Numărul maxim de mesaje în așteptare în coadă  |
| `queue_timeout_blocks` | 100          | Blocuri înainte ca un mesaj neprocesat să expire |

---

## Evenimente

Modulul `x/crossvm` emite următoarele evenimente:

| Eveniment          | Atribute                                                            | Descriere                             |
| ------------------ | ------------------------------------------------------------------- | ------------------------------------- |
| `crossvm_request`  | `message_id`, `source_vm`, `target_vm`, `target_contract`, `sender` | Mesaj nou între VM-uri trimis         |
| `crossvm_response` | `message_id`, `status`, `result`                                    | Mesaj executat (succes sau eșec)      |
| `crossvm_timeout`  | `message_id`, `source_vm`, `target_vm`                              | Mesaj expirat fără execuție           |

Abonează-te la evenimente prin WebSocket:

```bash
wscat -c ws://localhost:26657/websocket
> {"jsonrpc":"2.0","method":"subscribe","params":["tm.event='Tx' AND crossvm_request.message_id EXISTS"],"id":1}
```

---

## Interogarea mesajelor

### CLI

```bash
# Query a specific message by ID
qorechaind query crossvm message <message-id>

# List all pending messages
qorechaind query crossvm pending

# Module parameters
qorechaind query crossvm params
```

### JSON-RPC

> **Încă nu este servit:** niciun build de nod lansat nu servește namespace-ul JSON-RPC `qor_`, deci acest apel returnează `-32601` (metodă negăsită) pe fiecare endpoint public astăzi. Vezi [namespace-ul `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getCrossVMMessage",
    "params": ["<message-id>"],
    "id": 1
  }'
```

### Formatul răspunsului

```json
{
  "message_id": "crossvm-00000042",
  "source_vm": "cosmwasm",
  "target_vm": "evm",
  "target_contract": "0x1234...abcd",
  "sender": "qor1sender...",
  "payload": "...",
  "status": "executed",
  "result": "0x...",
  "submitted_height": 12345,
  "executed_height": 12346
}
```

---

## Considerații de proiectare

**Atomicitate:** Apelurile sincrone (EVM către QoreChain Native prin precompile) sunt concepute să fie atomice, astfel încât, dacă oricare parte este anulată (revert), întreaga tranzacție este anulată. Precompile-ul actual nu garantează încă acest lucru, ceea ce este unul dintre motivele pentru care nu este activ (vezi mai sus). Apelurile asincrone **nu sunt atomice** între blocuri; proiectează-ți contractele astfel încât să gestioneze cu eleganță stările `Failed` și `Timed Out`.

**Ordonare:** Mesajele din coadă sunt procesate FIFO în cadrul fiecărei treceri EndBlocker. Nu există o ordonare garantată între diferitele VM-uri sursă.

**Codificarea payload-ului:** Formatul payload-ului depinde de VM-ul țintă:

* **Ținte EVM:** apeluri de funcții codificate ABI
* **Ținte QoreChain Native:** mesaje execute codificate JSON
* **Ținte SVM:** date de instrucțiuni BPF codificate hex

---

## Pașii următori

* [Precompile EVM](/developer-guide/evm-precompiles) — Starea precompile-ului sincron CrossVM și a celorlalte precompile-uri planificate
* [Dezvoltare EVM](/developer-guide/evm-development) — Dezvoltare Solidity pe QoreChain
* [Dezvoltare QoreChain Native](/developer-guide/cosmwasm-development) — Dezvoltare de contracte Rust/Wasm
* [Dezvoltare SVM](/developer-guide/svm-development) — Implementarea programelor BPF
