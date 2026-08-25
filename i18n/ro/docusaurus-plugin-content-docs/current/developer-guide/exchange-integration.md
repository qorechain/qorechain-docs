---
slug: /developer-guide/exchange-integration
title: Ghid pentru Exchange-uri și Integratori
sidebar_label: Integrare Exchange
sidebar_position: 11
---

# Ghid pentru Exchange-uri și Integratori

Tot ce are nevoie un exchange, un custode sau un integrator de plăți pentru a lista QOR și a procesa depuneri și retrageri: alegerea unei interfețe, detectarea sigură a depunerilor și semnarea retragerilor.

:::note
Acest ghid vizează mainnet-ul **`qorechain-vladi`** (versiune chain **v3.1.92**). Repetați întregul flux mai întâi pe testnet-ul **`qorechain-diana`** — endpoint-urile pentru ambele rețele se află în [Rețele](/appendix/networks#public-endpoints). Dacă rulați propriul full node, mențineți-l la versiunea curentă a chain-ului — un nod învechit nu poate decoda tipurile de tranzacții mai noi și se oprește din sincronizare.
:::

## Alegerea unei căi de integrare {#choosing-a-path}

QoreChain este un singur chain cu **un singur sold nativ QOR unificat**, expus prin trei interfețe. **Aceeași cheie privată controlează aceleași fonduri** printr-o adresă Cosmos (`qor1...`), o adresă EVM (`0x...`) și o adresă SVM (base58) — alegeți interfața care se potrivește stack-ului vostru.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresă | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aceeași cheie) |
| Zecimale (QOR nativ) | **6** (`uqor`) | **18** (stil wei) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Tooling | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Semnare retrageri | **PQC hibrid obligatoriu** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 standard — fără PQC** | prin tx Cosmos sau submisie pe nod |
| Suport memo / tag | **Da** (adresă partajată + memo) | Nu (o adresă per utilizator) | Nu (o adresă per utilizator) |
| Detectare depuneri | scanare evenimente `MsgSend` | scanare blocuri via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Recomandat pentru | Platforme native Cosmos | **Platforme cu integrare EVM existentă** | Platforme cu tooling Solana |

**Recomandare:** dacă susțineți deja chain-uri EVM, **Calea B (EVM)** este integrarea cu cel mai puțin efort — tooling Ethereum standard, iar **retragerile nu necesită semnare post-cuantică** (calea ante EVM este exceptată). Calea A (Cosmos) este ruta nativă, cu adrese de depunere partajate bazate pe memo. Calea C (SVM) este, pe hârtie, o interfață nativă QOR completă, dar **lane-ul său de tranzacții este momentan dezactivat la nivel de întreagă rețea** (vezi [Calea C](#path-c-svm)) — folosiți Calea A sau Calea B până la redeschidere.

Cele trei interfețe **nu se exclud reciproc** — fondurile trimise către forma `0x`, `qor1` sau SVM a aceleiași chei reprezintă același sold.

## Rularea nodului vostru {#node}

Integrările de producție ar trebui să verifice depunerile față de **propriul nod sincronizat**, nu față de un endpoint terț. Urmați [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — acolo găsiți pachetul binar preconstruit (cu sume de control SHA-256), genesis-ul, peer-ii publici, pragul minim de taxă (`0.1uqor`) și un bootstrap rapid via snapshot-ul publicat al datelor chain-ului. Nu este necesară nicio licență pentru a rula un full node nevalidator.

Deoarece QoreChain are **finalitate instantanee** (fără reorganizări), **1 confirmare este finală**; așteptarea a 1–2 blocuri oferă o marjă operațională confortabilă.

## Calea A — Cosmos (nativ) {#path-a-cosmos}

URL de bază REST: `https://api.qore.host` (sau `http://localhost:1317` pe nodul vostru).

### Urmărirea depunerilor

```bash
# ultima înălțime (height)
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# toate tx-urile dintr-un height (scanare depuneri)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# transferuri primite către o adresă
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# sold (uqor — împărțiți la 1e6 pentru QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checklist anti-depunere-falsă {#anti-fake-deposit}

Creditați o depunere **doar** când **toate** condițiile de mai jos sunt îndeplinite:

1. **`tx_response.code == 0`** — tranzacția a reușit; nu creditați niciodată un tx eșuat.
2. Mesajul este **`/cosmos.bank.v1beta1.MsgSend`** (sau un output de `MsgMultiSend`) — nu un apel de contract sau alt modul.
3. **`to_address`** este egal cu adresa voastră de depunere, iar (în modelul de adresă partajată) **`memo`**-ul corespunde utilizatorului.
4. **`denom == "uqor"`**, iar `amount` este valoarea creditată (uqor → ÷ 10⁶ pentru QOR). Respingeți orice alt denom.
5. Tranzacția se află într-un **bloc confirmat (committed)** (`height` prezent și ≤ ultima înălțime confirmată). Finalitatea este instantanee — 1 confirmare este finală; așteptați 1–2 blocuri pentru marjă.
6. Recalculați suma din **evenimentele de transfer** (`coin_received` / `coin_spent`) și verificați-o încrucișat față de suma din mesaj — nu aveți încredere niciodată doar într-un singur câmp sau doar în memo.
7. Verificați că hash-ul tranzacției există via `GET /cosmos/tx/v1beta1/txs/{hash}` față de **propriul vostru** nod sincronizat.

### Retrageri — semnare PQC hibridă {#cosmos-withdrawals}

Mainnet-ul impune **semnături post-cuantice** pe tranzacțiile cosmos (`allow_classical_fallback = false`): fiecare retragere are nevoie de o **semnătură hibridă** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Depunerile **nu** necesită acest lucru (doar urmăriți chain-ul).

Biblioteca de semnare este [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), care aduce `@qorechain/pqc` pentru primitivele FIPS-204:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# fixați cosmjs-types la 0.9.x — 0.10 strică importurile de subpath folosite de adapter
```

Semnarea este un flux în **doi pași** (oglindind `qorechaind tx pqc cosign`):

**Pasul 1 — o singură dată per hot wallet: înregistrați cheia sa ML-DSA-87.** Această tranzacție de înregistrare unică este **semnată clasic** (excepție de bootstrap): mesajul `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` cu `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Derivați cheia ML-DSA determinist, astfel încât să poată fi recuperată din secretul vostru existent — de exemplu `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, apoi `mldsa.keygen(seed)` — și stocați seed-ul alături de cheia hot wallet-ului.

**Pasul 2 — pentru fiecare retragere ulterioară: semnați hibrid `MsgSend`-ul.** Adapterul încorporează semnătura ML-DSA-87 într-o extensie de tx-body *înainte* de `signDirect`-ul obișnuit secp256k1, astfel încât signer-ul vostru existent rămâne neschimbat:

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

Difuzați (broadcast) bytes-ii semnați:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Apoi interogați periodic `GET /cosmos/tx/v1beta1/txs/{hash}` până apare într-un bloc cu `code == 0`.

Pentru un HSM sau un signer custom în alt limbaj, folosiți bibliotecile FIPS-204 de sine stătătoare [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) și asamblați aceeași extensie. Semnătura ML-DSA **trebuie să fie deterministă** (FIPS-204 §3.4) — vezi [Semnare deterministă](/developer-guide/post-quantum-signing#deterministic-signing); chain-ul respinge semnăturile hedged.

### Alternativă server-side: `@qorechain/chain-bridge` {#chain-bridge}

Pentru un worker hot-wallet complet server-side (fără niciun wallet de browser implicat), **`@qorechain/chain-bridge`** (npm) încapsulează întregul flux — derivarea cheii, auto-înregistrarea PQC la prima utilizare, semnarea hibridă și broadcast-ul — într-un singur apel. Este JavaScript pur (fără addon-uri native), potrivit pentru worker-e serverless:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1) folosește aceeași derivare PQC canonică legată de adresă ca restul stack-ului — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — astfel încât cheia poate fi recuperată din mnemonic cu `qorechaind tx pqc recover-key`. Conturile înregistrate cu tooling mai vechi sunt gestionate automat (fallback pe cheia legacy) și pot fi migrate o singură dată la cheia canonică cu [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Calea B — EVM {#path-b-evm}

Integrare Ethereum standard față de `https://evm.qore.host` (chain ID **9801**) sau portul 8545 al propriului vostru nod.

* **Zecimale:** QOR nativ are **18 zecimale** pe rail-ul EVM (1 uqor = 10¹² wei). Greșirea acestei conversii duce la creditarea eronată a depunerilor cu un factor de 10¹².
* **Depuneri:** scanați blocurile cu `eth_getBlockByNumber` pentru transferuri native către adresele voastre; confirmați cu `eth_getTransactionReceipt` (`status == 0x1`).
* **Retrageri:** semnare standard secp256k1 / EIP-155 — **fără PQC necesar** pe calea ante EVM. Orice stack de semnare Ethereum funcționează neschimbat.
* **Anti-depunere-falsă:** verificați statusul receipt-ului, că valoarea mutată este un transfer **nativ** (nu un eveniment ERC-20 pe care nu îl indexați), și confirmați față de propriul vostru nod.
* **Maparea adreselor:** adresa `0x` și adresa `qor1` sunt două codificări ale aceluiași cont — fondurile sunt partajate. Vezi [Dezvoltare EVM](/developer-guide/evm-development).

## Calea C — SVM (compatibil Solana) {#path-c-svm}

:::caution Lane-ul SVM este momentan dezactivat
Lane-ul de execuție SVM este **momentan dezactivat la nivel de întreagă rețea pentru submisia de tranzacții**, începând cu versiunea chain v3.1.89 (22 august) — orice tranzacție trimisă către el returnează `code 11, "SVM module is disabled"`. **Nu** construiți un rail de depunere/retragere pe Calea C până când lane-ul se redeschide — aceasta este o dezactivare la compilare, nu un parametru runtime, deci nu poate fi reactivată printr-un vot de guvernanță; se așteaptă să rămână dezactivată până când un audit extern o validează. Folosiți în schimb **Calea A (Cosmos)** sau **Calea B (EVM)**. Endpoint-urile de citire (de exemplu `getBalance`) pot continua să răspundă, dar nu construiți detectare de depuneri sau fluxuri de retragere pe SVM cât timp submisia de tranzacții este dezactivată.
:::

Începând cu v3.1.82, interfața SVM servește **QOR nativ** (vezi [QOR nativ pe interfața SVM](/developer-guide/svm-development#native-qor)):

* **Solduri:** `getBalance` returnează lamports (÷ 10⁹ pentru QOR; 1 uqor = 1.000 lamports).
* **Depuneri:** `getSignaturesForAddress` oferă istoricul de tranzacții pentru o adresă; transferurile System Program mută QOR nativ.
* Endpoint-urile publice (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sunt **doar pentru citire**; trimiteți tranzacțiile prin propriul vostru nod.

## Rezumatul fluxului {#flow-summary}

| Operațiune | Cale | Necesită semnare? |
|---|---|---|
| **Depunere** (utilizator → platformă) | Urmăriți propriul nod sincronizat pentru transferuri către adresa voastră (+ memo pe Cosmos) | Nu — doar monitorizare |
| **Retragere** (platformă → utilizator) | Construiți transferul, semnați offline, difuzați (broadcast) | Cosmos: PQC hibrid · EVM: secp256k1 standard |
| **Sold / sweep** | Interogare sold REST / EVM / SVM + transfer | Semnare doar pentru sweep |

## Related

* [Conectarea la Mainnet](/getting-started/connecting-to-mainnet) — configurare nod, descărcări, snapshot
* [Rularea unui Nod](/developer-guide/running-a-node) — deployment, pruning, indexare
* [Semnare Post-Cuantică](/developer-guide/post-quantum-signing) — bibliotecile FIPS-204 din spatele retragerilor hibride
* [Rețele](/appendix/networks) — chain ID-uri, endpoint-uri, zecimale per interfață
