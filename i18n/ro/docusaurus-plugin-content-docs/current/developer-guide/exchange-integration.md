---
slug: /developer-guide/exchange-integration
title: Ghid pentru burse și integratori
sidebar_label: Integrare pentru burse
sidebar_position: 11
---

# Ghid pentru burse și integratori

Tot ce are nevoie o bursă, un custode sau un integrator de plăți pentru a lista QOR și a procesa depuneri și retrageri: alegerea unei interfețe, detectarea în siguranță a depunerilor și semnarea retragerilor.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (versiunea de lanț **v3.1.82**). Repetați mai întâi întregul flux pe testnet-ul **`qorechain-diana`** — endpoint-urile pentru ambele rețele se găsesc în [Rețele](/appendix/networks#public-endpoints).
:::

## Alegerea unei căi de integrare {#choosing-a-path}

QoreChain este un singur lanț cu **un sold nativ QOR unificat**, expus prin trei interfețe. **Aceeași cheie privată controlează aceleași fonduri** sub o adresă Cosmos (`qor1...`), una EVM (`0x...`) și una SVM (base58) — alegeți interfața care se potrivește stack-ului dvs.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresă | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aceeași cheie) |
| Zecimale (QOR nativ) | **6** (`uqor`) | **18** (stil wei) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Semnarea retragerilor | **PQC hibrid obligatoriu** (ML-DSA-87 + secp256k1) | **secp256k1 standard / EIP-155 — fără PQC** | prin tx Cosmos sau trimitere pe nod |
| Suport memo / tag | **Da** (adresă partajată + memo) | Nu (o adresă per utilizator) | Nu (o adresă per utilizator) |
| Detectarea depunerilor | scanați evenimentele `MsgSend` | scanați blocurile prin `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Ideal pentru | platforme native Cosmos | **platforme cu integrare EVM existentă** | platforme cu tooling Solana |

**Recomandare:** dacă suportați deja lanțuri EVM, **Calea B (EVM)** este integrarea cu cel mai mic efort — tooling Ethereum standard, iar **retragerile nu necesită semnare post-cuantică** (calea ante EVM este exceptată). Calea A (Cosmos) este ruta nativă, cu adrese de depunere partajate pe bază de memo. Calea C (SVM) este de asemenea o interfață completă pentru QOR nativ — alegeți-o dacă preferați în mod specific tooling-ul Solana.

Cele trei interfețe **nu se exclud reciproc** — fondurile trimise către forma `0x`, `qor1` sau SVM a aceleiași chei reprezintă același sold.

## Rularea propriului nod {#node}

Integrările de producție ar trebui să verifice depunerile pe **propriul nod sincronizat**, nu pe un endpoint terț. Urmați [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — acoperă pachetul de binare precompilate (cu sume de control SHA-256), genesis-ul, peer-ii publici, pragul minim de taxe (`0.1uqor`) și un bootstrap rapid prin snapshot-ul publicat al datelor lanțului. Nu este necesară nicio licență pentru a rula un nod complet nevalidator.

Deoarece QoreChain are **finalitate instantanee** (fără reorg-uri), **1 confirmare este finală**; așteptarea a 1–2 blocuri oferă o marjă operațională confortabilă.

## Calea A — Cosmos (nativ) {#path-a-cosmos}

URL REST de bază: `https://api.qore.host` (sau `http://localhost:1317` pe nodul dvs.).

### Monitorizarea depunerilor

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checklist anti-depuneri false {#anti-fake-deposit}

Creditați o depunere **numai** atunci când sunt îndeplinite **toate** condițiile de mai jos:

1. **`tx_response.code == 0`** — tranzacția a reușit; nu creditați niciodată o tranzacție eșuată.
2. Mesajul este **`/cosmos.bank.v1beta1.MsgSend`** (sau un output de `MsgMultiSend`) — nu un apel de contract sau un alt modul.
3. **`to_address`** este egal cu adresa dvs. de depunere, iar (în modelul cu adresă partajată) **`memo`**-ul corespunde utilizatorului.
4. **`denom == "uqor"`**, iar `amount` este valoarea creditată (uqor → ÷ 10⁶ pentru QOR). Respingeți orice alt denom.
5. Tranzacția se află într-un **bloc confirmat (committed)** (`height` prezent și ≤ ultima înălțime confirmată). Finalitatea este instantanee — 1 confirmare este finală; așteptați 1–2 blocuri pentru marjă.
6. Recalculați suma din **evenimentele de transfer** (`coin_received` / `coin_spent`) și verificați-o încrucișat cu suma din mesaj — nu vă bazați niciodată pe un singur câmp sau doar pe memo.
7. Verificați că hash-ul tranzacției există prin `GET /cosmos/tx/v1beta1/txs/{hash}` pe **propriul** nod sincronizat.

### Retrageri — semnare PQC hibridă {#cosmos-withdrawals}

Mainnet-ul impune **semnături post-cuantice** pentru tranzacțiile cosmos (`allow_classical_fallback = false`): fiecare retragere necesită o **semnătură hibridă** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Depunerile **nu** necesită acest lucru (doar monitorizați lanțul).

Biblioteca de semnare este [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), care aduce ca dependență `@qorechain/pqc` pentru primitivele FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Semnarea este un flux în **doi pași** (reflectând `qorechaind tx pqc cosign`):

**Pasul 1 — o singură dată per hot wallet: înregistrați cheia sa ML-DSA-87.** Această tranzacție unică de înregistrare este **semnată clasic** (excepție de bootstrap): mesajul `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` cu `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derivați cheia ML-DSA în mod determinist, astfel încât să fie recuperabilă din secretul existent — de ex. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, apoi `mldsa.keygen(seed)` — și stocați seed-ul alături de cheia hot wallet-ului.

**Pasul 2 — la fiecare retragere ulterioară: semnați hibrid `MsgSend`-ul.** Adapterul încorporează semnătura ML-DSA-87 într-o extensie a corpului tranzacției *înainte* de `signDirect`-ul secp256k1 obișnuit, astfel încât semnatarul dvs. existent rămâne neschimbat:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Difuzați octeții semnați:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Apoi interogați periodic `GET /cosmos/tx/v1beta1/txs/{hash}` până când tranzacția apare într-un bloc cu `code == 0`.

Pentru un HSM sau un semnatar personalizat în alt limbaj, folosiți bibliotecile FIPS-204 independente [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) și asamblați aceeași extensie. Semnătura ML-DSA **trebuie să fie deterministă** (FIPS-204 §3.4) — vezi [Semnarea deterministă](/developer-guide/post-quantum-signing#deterministic-signing); lanțul respinge semnăturile hedged.

## Calea B — EVM {#path-b-evm}

Integrare Ethereum standard pe `https://evm.qore.host` (chain ID **9801**) sau pe portul 8545 al propriului nod.

* **Zecimale:** QOR-ul nativ are **18 zecimale** pe interfața EVM (1 uqor = 10¹² wei). O greșeală aici creditează depunerile eronat cu un factor de 10¹².
* **Depuneri:** scanați blocurile cu `eth_getBlockByNumber` pentru transferuri native către adresele dvs.; confirmați cu `eth_getTransactionReceipt` (`status == 0x1`).
* **Retrageri:** semnare standard secp256k1 / EIP-155 — **nu este necesar PQC** pe calea ante EVM. Orice stack de semnare Ethereum funcționează neschimbat.
* **Anti-depuneri false:** verificați statusul din receipt, faptul că valoarea transferată este un transfer **nativ** (nu un eveniment ERC-20 pe care nu îl indexați) și confirmați pe propriul nod.
* **Maparea adreselor:** adresa `0x` și adresa `qor1` sunt două codificări ale aceluiași cont — fondurile sunt partajate. Vezi [Dezvoltare EVM](/developer-guide/evm-development).

## Calea C — SVM (compatibil Solana) {#path-c-svm}

Începând cu v3.1.82, interfața SVM servește **QOR nativ** (vezi [QOR nativ pe interfața SVM](/developer-guide/svm-development#native-qor)):

* **Solduri:** `getBalance` returnează lamports (÷ 10⁹ pentru QOR; 1 uqor = 1.000 lamports).
* **Depuneri:** `getSignaturesForAddress` oferă istoricul tranzacțiilor pentru o adresă; transferurile System Program mută QOR nativ.
* Endpoint-urile publice (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sunt **doar în citire**; trimiteți tranzacțiile prin propriul nod.

## Rezumatul fluxurilor {#flow-summary}

| Operațiune | Cale | Este necesară semnarea? |
|---|---|---|
| **Depunere** (utilizator → platformă) | Monitorizați nodul sincronizat pentru transferuri către adresa dvs. (+ memo pe Cosmos) | Nu — doar monitorizare |
| **Retragere** (platformă → utilizator) | Construiți transferul, semnați offline, difuzați | Cosmos: PQC hibrid · EVM: secp256k1 standard |
| **Sold / sweep** | Interogare de sold REST / EVM / SVM + transfer | Semnați doar pentru sweep |

## Resurse conexe

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — configurarea nodului, descărcări, snapshot
* [Rularea unui nod](/developer-guide/running-a-node) — implementare, pruning, indexare
* [Semnarea post-cuantică](/developer-guide/post-quantum-signing) — bibliotecile FIPS-204 din spatele retragerilor hibride
* [Rețele](/appendix/networks) — chain ID-uri, endpoint-uri, zecimale per interfață
