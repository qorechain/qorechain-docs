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
* **Precompile-ul EVM sincron nu este activ pe mainnet** și este **activ pe testnet**, cu o listă de permisiuni de contracte QoreChain Native revizuite (citit la 7 noiembrie 2026; un apel doar pentru citire prin el a fost rulat după upgrade-ul v3.2.7, vezi mai jos). O versiune întărită se află în binar începând cu v3.2.3. (Pe 27 octombrie 2026, guvernanța testnet-ului a activat alte trei precompile-uri, PQC Verify, PQC Key Status și PRISM Consensus Params, iar puntea CrossVM s-a alăturat listei testnet-ului până la 4 noiembrie; mainnet-ul nu are niciunul activ.)

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
| **Sincronă**     | EVM către QoreChain Native | Aceeași tranzacție | Precompile la `0x0000...0901` (activ pe testnet, nu pe mainnet; vezi mai jos) |
| **Mesaj, implicit** | Orice VM către orice altă VM | Aceeași tranzacție | `MsgCrossVMCall`; apelul se execută imediat, iar un eșec anulează întreaga tranzacție |
| **Mesaj, în coadă** | Orice VM către orice altă VM | Blocul următor (sau mai târziu) | `MsgCrossVMCall` cu `async` setat; mesajul așteaptă în coadă |

---

## Calea sincronă (EVM către QoreChain Native) {#synchronous-path-evm-to-qorechain-native}

Calea sincronă folosește un **precompile** EVM la adresa `0x0000000000000000000000000000000000000901`. Este conceput pentru a permite contractelor Solidity să apeleze contracte QoreChain Native și să primească un răspuns în cadrul aceleiași tranzacții.

:::warning Inactiv pe mainnet; activ pe testnet, cu listă de permisiuni
Precompile-ul punții CrossVM **nu este activ** pe `qorechain-vladi`: un apel către `0x…0901` acolo reușește și returnează date goale. Pe `qorechain-diana`, lista `active_static_precompiles` conține `0x…0901` (citit la 7 noiembrie 2026); un `eth_call` doar pentru citire prin el a fost rulat pe 7 noiembrie 2026, după upgrade-ul v3.2.7 (rezultatele mai jos). Binarul v3.2.3 conține o versiune întărită (refuză un `STATICCALL`, contorizează apelul său imbricat din gazul frame-ului apelant și îl jurnalizează astfel încât un revert EVM să anuleze și partea QoreChain Native, ajunge doar la ținte QoreChain Native din lista permisă și respectă circuit breaker-ul cross-VM), dar rulează abia acolo unde o propunere aprobată prin guvernanță l-a adăugat în lista activă (până acum testnet-ul, nu mainnet-ul). Pe mainnet, precompile-ul și apelurile cross-VM rămân dezactivate, chiar și după un upgrade la v3.2.7 (care nu are încă o dată), până la o decizie separată de guvernanță. Exemplul de mai jos este structura pe care o decodifică nodul; nu poate rula pe mainnet până când precompile-ul nu este activ. Pe testnet poate fi apelat, în limitele listei de permisiuni (secțiunea următoare). Vezi [Precompilate EVM: starea rețelelor](/developer-guide/evm-precompiles#network-status).
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

Aceasta este structura pe care o decodifică nodul; este aceeași structură pe care o construiește encoderul `@qorechain/rdk`, iar contractul de mai sus corespunde șablonului de pornire din [Multi-VM](/rollups/multi-vm). Fondurile nu pot fi atașate prin precompile (calea prin mesajul `MsgCrossVMCall` acceptă `--funds`). Exemplul nu poate face nimic pe mainnet astăzi, deoarece precompile-ul nu este activ acolo. Pe testnet funcționează în limitele listei de permisiuni descrise în continuare; contractul de exemplu în sine nu a fost implementat pentru această pagină, apelul de mai jos a fost făcut direct cu `eth_call`.

Acolo unde este activ, precompile-ul execută imediat contractul QoreChain Native și returnează rezultatul. (Helperul `encodeCrossVmCalldata` din `@qorechain/rdk`, disponibil din 0.6.0 și în curentul 0.8.0, construiește calldata; vezi [Multi-VM](/rollups/multi-vm).) Cost de gaz: **50.000 de bază + 4 per octet de intrare + costul execuției**.

### Comportamentul pe testnet (lista de permisiuni, verificat la 7 noiembrie 2026) {#testnet-allowlist}

Pe `qorechain-diana` (versiunea de nod v3.2.7 din 6 noiembrie 2026), precompile-ul ajunge doar la contractele QoreChain Native din lista de permisiuni a punții. `GET /qorechain/crossvm/v1/params` le listează în `bridge_allowed_targets` (trei intrări la 7 noiembrie 2026, scrise `cosmwasm:qor1...`), alături de `enabled` `true`, `max_message_size` 65536, `max_queue_size` 1000 și `queue_timeout_blocks` 100. Două cereri `eth_call` doar pentru citire către `0x…0901`, cu `executeCrossVMCall(1, target, 0x7b7d)`, au fost rulate pe 7 noiembrie 2026:

* **Țintă în afara listei de permisiuni:** se anulează cu `cross-VM bridge call refused: target cosmwasm:qor1... is not allowlisted`.
* **Țintă din lista de permisiuni:** apelul ajunge la contract (nodul raportează eroarea proprie a contractului pentru mesajul gol `{}`: `Error parsing into type cw20::msg::Cw20ExecuteMsg`). Asta arată că ruta funcționează; pentru această pagină nu a fost trimisă nicio tranzacție cross-VM care schimbă starea prin precompile.

Pe mainnet, precompile-ul (`0x…0901`) și apelurile cross-VM rămân **dezactivate** (circuit breaker) chiar și după upgrade-ul v3.2.7, până la o decizie separată de guvernanță.

### Ce schimbă v3.2.7 pentru apelurile cross-VM (deocamdată doar pe testnet) {#v327}

Acestea se aplică pe testnet din 6 noiembrie 2026 și **nu sunt încă pe mainnet** (upgrade-ul nu are dată):

* Un apel care eșuează în VM-ul țintă eșuează acum curat: este eșecul acelui apel, iar coada continuă cu mesajul următor.
* Țintele malformate sunt refuzate la momentul trimiterii, cu codul 5 în codespace-ul `crossvm`.
* Un apel cross-VM nu mai poate viza o adresă de precompile EVM.

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

### Apeluri asincrone către CosmWasm (v3.2.8) {#async-calls}

Începând cu release-ul v3.2.8 (doar pe testnet până la un upgrade ulterior de mainnet), un apel asincron către CosmWasm este plătit în avans și pus în coadă cu limite:

| Câmp `MsgCrossVMCall` | Semnificație |
| --------------------- | ------------ |
| `async_gas_limit` (8)  | Unitățile de gas de contract pe care le rezervați pentru apelul din coadă (implicit 500.000) |
| `async_max_factor` (9) | Cel mai mare factor de congestie pe care îl acceptați pentru el (implicit 4x); apelul este refuzat dacă factorul în vigoare este mai mare |

- **Escrow.** Expeditorul plătește în avans unități de gas x factor x preț de gas într-un cont escrow. La valorile implicite, aceasta înseamnă 500.000 x 4 x 0,1 uqor, aproximativ 0,2 QOR. Ce nu folosește apelul este returnat când rulează.
- **Taxa pentru locul în coadă.** Punerea unui apel în coadă plătește și o mică taxă de loc.
- **Cel mult 100 de apeluri în așteptare per expeditor.** Un apel suplimentar este refuzat până când unul se termină sau expiră.
- **Apelurile eșuate sunt taxate.** Un apel care eșuează plătește totuși munca efectuată.
- **Apeluri grele:** măriți `async_gas_limit` și `async_max_factor` pentru contractele care încarcă cod mare; un contract de dimensiunea unui cw721 nu încape în valorile implicite la primul său apel dintr-un bloc.

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

# List pending messages (from v3.2.8 one page of at most 100; follow the next key for more)
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

**Atomicitate:** Apelurile sincrone (EVM către QoreChain Native prin precompile) sunt concepute să fie atomice, astfel încât, dacă oricare parte este anulată (revert), întreaga tranzacție este anulată. Precompile-ul întărit jurnalizează apelul imbricat, astfel încât un revert în contractul apelant anulează și partea QoreChain Native; este activ doar pe testnet. Apelurile asincrone **nu sunt atomice** între blocuri; proiectează-ți contractele astfel încât să gestioneze cu eleganță stările `Failed` și `Timed Out`.

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
