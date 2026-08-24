---
slug: /rollups/deploying-a-rollup
title: Implementarea unui Rollup
sidebar_label: Implementarea unui Rollup
sidebar_position: 3
---

# Implementarea unui Rollup

Poți implementa un rollup specific aplicației în trei moduri: prin **Dashboard** (un asistent ghidat, fără cod), prin **CLI**-ul lanțului (`qorechaind`, control total asupra tranzacției on-chain) sau programatic cu **RDK-ul TypeScript** (`@qorechain/rdk` plus schela `create-qorechain-rollup`). Această pagină acoperă toate cele trei moduri, plus ciclul de viață al operatorului și comenzile de batch.

:::note
Comenzile de mai jos vizează testnetul **`qorechain-diana`**. Mainnetul (**`qorechain-vladi`**, chain ID EVM **9801**) este live din 7 iunie 2026, rulând versiunea de lanț **v3.1.92** — înlocuiește chain ID-ul și endpoint-urile cu cele de mainnet atunci când implementezi pe mainnet. Validează fiecare implementare mai întâi pe testnet.
:::

---

## Cerințe

| Cerință | Detalii |
| ----------- | ------- |
| **Stake minim** | Un depozit garantat (bond) în QOR este ținut în escrow la crearea rollup-ului |
| **Ardere la creare** | O fracțiune din suma stake-uită este arsă permanent la creare; restul rămâne în escrow și este returnat când rollup-ul este oprit |
| **Cont** | Un cont QoreChain alimentat, cu sold suficient pentru stake plus taxele de tranzacție |

Interoghează parametrii live ai modulului pentru stake-ul minim și rata de ardere curente înainte de a implementa:

```bash
qorechaind query rdk config
```

---

## Implementare prin Dashboard (Tools → Rollups)

Dashboard-ul oferă un asistent ghidat **Deploy a Rollup** sub **Tools → Rollups**. Este cea mai rapidă cale pentru a lansa un rollup specific aplicației fără a asambla manual o tranzacție.

### Pași

1. **Autentifică-te.** Asistentul necesită o sesiune autentificată pentru a implementa și pentru a lista implementările tale existente.
2. **Denumește-ți rollup-ul.** Introdu un nume pentru rollup (2–41 caractere: litere, cifre, spații, cratime sau underscore).
3. **Alege o mașină virtuală.** QoreChain este un lanț cu triplu VM, așa că rollup-ul tău poate rula oricare dintre:
   * **EVM** — contracte Solidity / Vyper cu unelte Ethereum complete (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contracte inteligente Rust pe runtime-ul Cosmos SDK, cu IBC nativ
   * **SVM** — mașina virtuală Solana, pentru aplicații cu execuție paralelă și throughput ridicat
4. **Alege un strat de disponibilitate a datelor.** Unde publică rollup-ul tău datele de tranzacție, astfel încât oricine să poată reconstrui starea: **QoreChain DA**, **Celestia** sau **EigenDA**. Reține că EigenDA este o opțiune la nivel de Dashboard, în timp ce backend-urile DA on-chain ale `x/rdk` sunt native, Celestia sau ambele — vezi [Disponibilitatea datelor](/rollups/data-availability).
5. **Setează un token de gas.** Token-ul folosit pentru a plăti execuția pe rollup-ul tău. Implicit este **QOR**; introdu un simbol personalizat pentru a folosi propriul token nativ.
6. **Alege un sequencer.** Cine ordonează tranzacțiile înainte de settlement: **Shared sequencer** (setul partajat QoreChain), **Dedicated (single)** (rulează propriul sequencer unic) sau **Decentralized** (un set de sequencer permisionless).
7. **Alege o țintă de settlement.** Unde își ancorează rollup-ul rădăcinile de stare și dovezile de validitate: **mainnet QoreChain** sau **Ethereum**.
8. **Implementează.** Trimite formularul asistentului. Provizionarea este revizuită de **The Qore Trust** înainte ca rollup-ul să devină live, așa că un rollup abia trimis apare cu statusul **provisioning** până la finalizarea revizuirii.

Rollup-urile trimise apar în lista **Your rollups** împreună cu VM-ul, stratul DA, token-ul de gas, sequencer-ul, ținta de settlement și statusul curent.

:::note
Asistentul din Dashboard prezintă alegeri prietenoase, la nivel de produs, și direcționează provizionarea printr-un flux revizuit. CLI-ul de mai jos lucrează direct cu suprafața de mesaje on-chain a modulului `x/rdk`. Cele două împărtășesc aceleași concepte de bază (VM, DA, sequencer, settlement), dar le expun la altitudini diferite.
:::

---

## Implementare prin CLI

CLI-ul creează rollup-ul direct on-chain. `create-rollup` primește trei argumente poziționale — ID-ul rollup-ului, un profil și suma de stake (în `uqor`) — plus un flag opțional `--vm`.

:::tip
Începând cu versiunea de lanț **v3.1.74**, `create-rollup` **aplică automat preset-ul profilului ales** — modul de settlement, sequencer, DA, modelul de gas și VM-ul sunt toate preluate din preset. Nu mai trebuie să le setezi manual (anterior mesajul avea hardcodată o configurație sovereign). Flag-ul `--vm` are acum **valoare implicită goală**, așa că se aplică VM-ul din preset, cu excepția cazului în care îl suprascrii explicit.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu** — creează un rollup din preset-ul `defi` (settlement, sequencer, DA și VM provin toate din preset; `defi` se rezolvă la settlement zk pe EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flag-uri:**

| Flag | Implicit | Descriere |
| ---- | ------- | ----------- |
| `--vm` | *(gol — se folosește VM-ul din preset)* | Suprascrie tipul de VM al rollup-ului: `evm`, `cosmwasm`, `svm` sau `custom`. Lasă nesetat pentru a aplica VM-ul din preset. (În clienții RDK, runtime-ul Wasm este tipul de VM **`native`** — QoreChain Native — cu `cosmwasm` păstrat ca alias legacy; `cosmwasm` este valoarea on-wire, care este cea acceptată de acest flag la nivel de lanț.) |

Argumentul `[profile]` selectează o configurație preset care se aplică automat — vezi **[Profiluri preset](/rollups/preset-profiles)**. `[stake-amount]` este garanția (bond) în `uqor`.

### Inspectează ce ai implementat

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Implementare cu RDK-ul TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit-ul este livrat ca două pachete npm publice care operează pe același modul on-chain `x/rdk` ca și CLI-ul, prin RPC/REST/gRPC/JSON-RPC public și orice `OfflineSigner` cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — SDK-ul TypeScript: un constructor de configurație cu profiluri preset, helper-e de tranzacție pentru ciclurile de viață ale rollup-ului și ale batch-urilor de settlement, DA nativ, clienți de citire tipați și noutățile din v0.4 — chitanțe de settlement quantum-safe, QCAI Rollup Copilot, helper-e de calldata cross-VM și watchtower.
* **`create-qorechain-rollup`** (`v0.4.4`) — o schelă (scaffolder) care clonează câte un șablon de pornire funcțional pentru fiecare profil (inclusiv șablonul `multivm-rollup`).

Acestea sunt publicate pe npm. Repo-ul livrează de asemenea un CLI de operator publicat, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), cu comenzile `doctor`, `create`, `status`, `watch`, `params`, `suggest`, cele de ciclu de viață (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` și `faucet`, plus comenzile `receipt`, `advise` și `watchtower` din v0.4.

Puncte importante de la lansarea inițială v0.4.0:

* **v0.4.2 — funcționează direct pe rețeaua live, fără configurare suplimentară.** Preset-urile `mainnet` și `testnet` includ acum endpoint-urile publice `qore.host` (REST la `api.qore.host` / `api-testnet.qore.host`), astfel încât `createRdkClient({ network })` ajunge la lanț fără `endpoints` setate manual — suprascrie doar dacă vrei să vizezi propriul nod. Aceeași versiune a redenumit identificatorul VM-ului rollup Wasm în **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` pe wire — lanțul, explorer-ul și Dashboard-ul rămân neschimbate.
* **v0.4.3 — remediere a codificării semnăturii hibride** pentru calea de semnare TypeScript (vezi avertismentul de mai jos).
* **v0.4.4 — urmărește `@qorechain/sdk` `^0.7.0`**, versiunea SDK pentru lane-urile de autenticator din lanțul **v3.1.85**, astfel încât aceste capabilități ajung la utilizatorii TypeScript ai RDK-ului direct prin SDK. Fără modificări în API-ul RDK.

:::caution
**Utilizatorii TypeScript trebuie să folosească RDK ≥ 0.4.3.** Versiunile anterioare codificau greșit extensia de tranzacție PQC hibridă, astfel încât lanțul respingea orice tranzacție semnată hibrid. v0.4.3 (prin `@qorechain/sdk` ≥ 0.6.1) remediază codificarea. Doar calea de semnare hibridă TypeScript a fost afectată — clienții Python, Go, Rust și Java semnează exclusiv clasic și nu au fost afectați niciodată.
:::

#### Clienții Python, Go, Rust și Java

Pe lângă pachetul TypeScript, RDK-ul oferă clienți compleți în **Python**, **Go**, **Rust** și **Java** care reflectă suprafața TypeScript: constructorul de configurație cu validare, cele cinci profiluri preset, utilitare denom/economie/bech32, helper-e Merkle binar și pentru dovezi de retragere, manifeste de rollup, clienți de citire REST și JSON-RPC `qor_`, verificări preflight/health, conturi (mnemonic → adresă `qor`) și **semnare + broadcast de tranzacții** (`SIGN_MODE_DIRECT`). Toate sunt verificate față de vectori de test comuni, cross-language, și sunt **publicate** în registrele lor:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.4
```

```python
import qorrdk
```

Versiuni curente publicate: Python `qorechain-rdk` **0.4.4** (PyPI, import `qorrdk`), Rust `qorechain-rdk` (crates.io — instalează cea mai recentă versiune publicată, sau construiește din repo), modulul Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) și Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Broadcast-ul live necesită un endpoint de nod.

:::note
RDK-ul TypeScript și șabloanele sale folosesc implicit testnetul **`qorechain-diana`**, iar din v0.4.2 preset-urile ajung la endpoint-urile publice live fără configurare suplimentară. Fixează versiunile (pin) și validează pe testnet înainte de mainnet.
:::

### Crearea unui proiect cu `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Fiecare profil are un șablon de pornire asociat (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Creează unul cu oricare dintre formele:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pentru uz non-interactiv / CI, transmite explicit șablonul și rețeaua:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Schela afișează costul documentat de stake și de ardere la creare, plus pașii următori pentru a crea rollup-ul și a-i citi statusul.

### Creează un rollup din cod

Construiește o configurație dintr-un preset, citește stake-ul și rata de ardere live de pe lanț, apoi creează rollup-ul cu un client de semnare. Constructorul de configurație aplică matricea de compatibilitate settlement → proof la `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

// The public qore.host endpoints are baked into the presets (RDK ≥ 0.4.2) —
// no manual `endpoints` config needed; override to target your own node.
const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.15uqor" }); // the chain enforces a 0.1uqor/gas fee floor
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Nu ești sigur ce profil ți se potrivește? `rdk.suggestProfile("a lending protocol with predictable fees")` returnează o recomandare asistată de QCAI (cu un fallback documentat).

### Gestionează ciclul de viață și citește starea din cod

Clientul de semnare expune întregul ciclu de viață — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` și `executeWithdrawal`. Tranzițiile de ciclu de viață pot fi protejate prin transmiterea `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Citește starea cu clientul REST tipat (fără a fi necesar un signer):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestionarea ciclului de viață

Un rollup trece prin stările `pending`, `active`, `paused` și `stopped`. Creatorul gestionează tranzițiile cu următoarele comenzi.

### Pause

Oprește temporar rollup-ul. Starea este păstrată, iar rollup-ul poate fi reluat. Este necesar un șir de caractere care să indice motivul.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Resume

Reia un rollup pus anterior în pauză.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Stop

Dezafectează permanent rollup-ul și eliberează stake-ul. QOR-ul stake-uit — minus arderea unică de la creare — este returnat creatorului.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Oprirea unui rollup este permanentă. Rollup-ul nu poate fi repornit după ce a fost oprit.
:::

---

## Comenzi de operator: batch-uri și contestații

Operatorii de rollup trimit batch-uri de settlement, iar contestatarii pot disputa batch-uri optimistice. Aceste comenzi stau la baza stratului de settlement descris în **[Prezentare generală Rollups](/rollups/overview)** și **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)**.

### Trimite un batch

Trimite un batch de settlement pentru un rollup. Primește ID-ul rollup-ului, un index de batch și o rădăcină de stare codificată hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contestă un batch

Contestă un batch trimis (pentru rollup-uri optimistice). Primește ID-ul rollup-ului și indexul batch-ului; transmite dovada de fraudă cu `--proof`. Începând cu versiunea de lanț **v3.1.74**, calea optimistică **submit-batch → challenge-batch** este live și funcțională de la un capăt la altul.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descriere |
| ---- | ----------- |
| `--proof` | Dovadă de fraudă codificată hex |

### Inspectează batch-urile

```bash
# Latest batch for a rollup
qorechaind query rdk batch [rollup-id]

# A specific batch by index
qorechaind query rdk batch [rollup-id] --index 42
```

---

## Interogare

| Comandă | Scop |
| ------- | ------- |
| `qorechaind query rdk rollup [rollup-id]` | Detaliile unui rollup specific |
| `qorechaind query rdk list-rollups` | Toate rollup-urile înregistrate |
| `qorechaind query rdk batch [rollup-id]` | Ultimul batch de settlement (sau `--index`) |
| `qorechaind query rdk config` | Parametrii modulului RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recomandă un preset pentru un caz de utilizare |

---

## Pașii următori

* **[Disponibilitatea datelor](/rollups/data-availability)** — backend-uri DA native, Celestia și redundante.
* **[ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)** — verificarea dovezilor și fluxul de retragere L2 → L1 prin `execute-withdrawal`.
