---
slug: /rollups/deploying-a-rollup
title: Implementarea unui rollup
sidebar_label: Implementarea unui rollup
sidebar_position: 3
---

# Implementarea unui rollup

Poți implementa un rollup dedicat unei aplicații în trei moduri: prin **Dashboard** (un asistent ghidat, fără cod), prin **CLI**-ul lanțului (`qorechaind`, control complet asupra tranzacției on-chain) sau programatic cu **RDK-ul TypeScript** (`@qorechain/rdk` plus generatorul de proiecte `create-qorechain-rollup`). Această pagină le acoperă pe toate trei, plus ciclul de viață al operatorului și comenzile pentru batch-uri.

:::note
Comenzile de mai jos vizează testnet-ul **`qorechain-diana`**. Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este live din 7 iunie 2026 și rulează versiunea de lanț **v3.1.85** — înlocuiește chain ID-ul și endpoint-urile cu cele de mainnet atunci când implementezi pe mainnet. Validează fiecare implementare mai întâi pe testnet.
:::

---

## Cerințe

| Cerință | Detalii |
| ----------- | ------- |
| **Stake minim** | O garanție (stake) în QOR este pusă în escrow la crearea rollup-ului |
| **Ardere la creare** | O fracțiune din suma pusă în stake este arsă permanent la creare; restul este păstrat în escrow și returnat la oprirea rollup-ului |
| **Cont** | Un cont QoreChain finanțat, cu sold suficient pentru stake plus comisioanele de tranzacție |

Interoghează parametrii live ai modulului pentru stake-ul minim și rata de ardere curente înainte de implementare:

```bash
qorechaind query rdk config
```

---

## Implementare prin Dashboard (Tools → Rollups)

Dashboard-ul oferă un asistent ghidat **Deploy a Rollup** în secțiunea **Tools → Rollups**. Este calea cea mai rapidă pentru lansarea unui rollup dedicat unei aplicații, fără a asambla manual o tranzacție.

### Pași

1. **Autentifică-te.** Asistentul necesită o sesiune autentificată pentru a implementa și pentru a lista implementările tale existente.
2. **Denumește rollup-ul.** Introdu un nume de rollup (2–41 de caractere: litere, cifre, spații, cratime sau underscore-uri).
3. **Alege o mașină virtuală.** QoreChain este un lanț cu trei VM-uri, așa că rollup-ul tău poate rula oricare dintre:
   * **EVM** — contracte Solidity / Vyper cu toate uneltele Ethereum (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contracte inteligente în Rust pe runtime-ul Cosmos SDK, cu IBC nativ
   * **SVM** — Solana Virtual Machine, pentru aplicații cu execuție paralelă și throughput ridicat
4. **Alege un strat de disponibilitate a datelor (DA).** Locul unde rollup-ul tău publică datele tranzacțiilor, astfel încât oricine să poată reconstrui starea: **QoreChain DA**, **Celestia** sau **EigenDA**. Reține că EigenDA este o opțiune la nivelul Dashboard-ului, în timp ce backend-urile DA on-chain ale `x/rdk` sunt native, Celestia sau ambele — vezi [Disponibilitatea datelor](/rollups/data-availability).
5. **Setează un token de gas.** Token-ul folosit pentru plata execuției pe rollup-ul tău. Implicit este **QOR**; introdu un simbol personalizat pentru a folosi propriul tău token nativ.
6. **Alege un sequencer.** Cine ordonează tranzacțiile înainte de decontare: **Shared sequencer** (setul partajat QoreChain), **Dedicated (single)** (rulezi propriul sequencer unic) sau **Decentralized** (un set de sequenceri fără permisiuni).
7. **Alege o țintă de decontare.** Locul unde rollup-ul își ancorează rădăcinile de stare și dovezile de validitate: **QoreChain mainnet** sau **Ethereum**.
8. **Implementează.** Trimite formularul asistentului. Provizionarea este verificată de **The Qore Trust** înainte ca rollup-ul să devină live, așa că un rollup abia trimis apare cu statusul **provisioning** până la finalizarea verificării.

Rollup-urile trimise apar în lista **Your rollups** cu VM-ul, stratul DA, token-ul de gas, sequencer-ul, ținta de decontare și statusul curent.

:::note
Asistentul din Dashboard prezintă opțiuni prietenoase, la nivel de produs, și direcționează provizionarea printr-un pipeline verificat. CLI-ul de mai jos lucrează direct cu suprafața de mesaje on-chain a modulului `x/rdk`. Cele două împărtășesc aceleași concepte de bază (VM, DA, sequencer, decontare), dar le expun la altitudini diferite.
:::

---

## Implementare prin CLI

CLI-ul creează rollup-ul direct on-chain. `create-rollup` primește trei argumente poziționale — ID-ul rollup-ului, un profil și suma de stake (în `uqor`) — plus un flag opțional `--vm`.

:::tip
Începând cu versiunea de lanț **v3.1.74**, `create-rollup` **aplică automat presetul profilului ales** — modul de decontare, sequencer-ul, DA, modelul de gas și VM-ul sunt toate preluate din preset. Nu mai trebuie să le setezi manual (anterior, mesajul impunea o configurație suverană hardcodată). Flag-ul `--vm` are acum **valoare implicită goală**, astfel că VM-ul profilului se aplică dacă nu îl suprascrii explicit.
:::

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemplu** — creează un rollup din presetul `defi` (decontarea, sequencer-ul, DA și VM-ul vin toate din preset; `defi` se rezolvă la decontare zk pe EVM):

```bash
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Flag-uri:**

| Flag | Implicit | Descriere |
| ---- | ------- | ----------- |
| `--vm` | *(gol — folosește VM-ul profilului)* | Suprascrie tipul de VM al rollup-ului: `evm`, `cosmwasm`, `svm` sau `custom`. Lasă nesetat pentru a aplica VM-ul presetului. (În clienții RDK, runtime-ul Wasm este tipul de VM **`native`** — QoreChain Native — cu `cosmwasm` păstrat ca alias legacy; `cosmwasm` este valoarea on-wire, adică cea pe care o primește acest flag la nivel de lanț.) |

Argumentul `[profile]` selectează o configurație preset care este aplicată automat — vezi **[Profiluri preset](/rollups/preset-profiles)**. `[stake-amount]` este garanția în `uqor`.

### Inspectează ce ai implementat

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Implementare cu RDK-ul TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit este livrat ca două pachete npm publice care folosesc același modul on-chain `x/rdk` ca și CLI-ul, prin RPC/REST/gRPC/JSON-RPC public și orice `OfflineSigner` cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.4`) — SDK-ul TypeScript: un config builder cu profiluri preset, helpere de tranzacții pentru ciclurile de viață ale rollup-ului și ale batch-urilor de decontare, DA nativ, clienți de citire tipizați și adăugirile din v0.4 — chitanțe de decontare rezistente cuantic, QCAI Rollup Copilot, helpere de calldata cross-VM și watchtower-ul.
* **`create-qorechain-rollup`** (`v0.4.4`) — un generator de proiecte care clonează câte un template de pornire rulabil pentru fiecare profil (inclusiv template-ul `multivm-rollup`).

Acestea sunt publicate pe npm. Repo-ul livrează și un CLI de operator publicat, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.4`), cu comenzile `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclu de viață (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` și `faucet`, plus comenzile din v0.4 `receipt`, `advise` și `watchtower`.

Noutăți de la lansarea inițială v0.4.0:

* **v0.4.2 — funcționează direct cu rețeaua live, din start.** Preseturile `mainnet` și `testnet` includ acum endpoint-urile publice `qore.host` (REST la `api.qore.host` / `api-testnet.qore.host`), astfel că `createRdkClient({ network })` ajunge la lanț fără `endpoints` manual — suprascrie doar pentru a viza propriul tău nod. Aceeași versiune a redenumit identificatorul VM-ului de rollup Wasm în **`native`** (QoreChain Native); `cosmwasm` rămâne un alias legacy acceptat, iar ambele se mapează la `cosmwasm` on-wire — lanțul, explorer-ul și Dashboard-ul rămân neschimbate.
* **v0.4.3 — corecție de encodare a semnăturii hibride** pentru calea de semnare TypeScript (vezi avertismentul de mai jos).
* **v0.4.4 — urmărește `@qorechain/sdk` `^0.7.0`**, versiunea SDK pentru lane-urile de autentificatori din lanțul **v3.1.85**, astfel încât aceste capabilități ajung direct la utilizatorii TypeScript ai RDK-ului prin SDK. Fără schimbări de API în RDK.

:::caution
**Utilizatorii TypeScript trebuie să fie pe RDK ≥ 0.4.3.** Versiunile anterioare encodau greșit extensia de tranzacție PQC hibridă, astfel că lanțul respingea fiecare tranzacție semnată hibrid. v0.4.3 (prin `@qorechain/sdk` ≥ 0.6.1) corectează encodarea. Doar calea de semnare hibridă din TypeScript a fost afectată — clienții Python, Go, Rust și Java semnează exclusiv clasic și nu au fost niciodată afectați.
:::

#### Clienții Python, Go, Rust și Java

Pe lângă pachetul TypeScript, RDK-ul oferă clienți compleți **Python**, **Go**, **Rust** și **Java** care oglindesc suprafața TypeScript: config builder-ul cu validare, cele cinci profiluri preset, utilitare pentru denom/economie/bech32, helpere pentru Merkle binar și dovezi de retragere, manifeste de rollup, clienți de citire REST și JSON-RPC `qor_`, verificări de preflight/sănătate, conturi (mnemonic → adresă `qor`) și **semnare + difuzare de tranzacții** (`SIGN_MODE_DIRECT`). Toți sunt verificați față de vectori golden partajați între limbaje și sunt **publicați** în registrele lor:

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

Versiunile publicate curente: Python `qorechain-rdk` **0.4.4** (PyPI, import `qorrdk`), Rust `qorechain-rdk` (crates.io — instalează cea mai recentă versiune publicată sau compilează din repo), modulul Go `github.com/qorechain/qorechain-rdk/packages/go` (**v0.4.4**) și Java `io.github.qorechain:qorechain-rdk` **0.4.4** (Maven Central). Difuzarea live necesită un endpoint de nod.

:::note
RDK-ul TypeScript și template-urile sale au ca implicit testnet-ul **`qorechain-diana`**, iar de la v0.4.2 preseturile ajung la endpoint-urile publice live din start. Fixează versiunile (pin) și validează pe testnet înainte de mainnet.
:::

### Generează un proiect cu `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Fiecare profil are un template de pornire corespunzător (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Generează unul cu oricare dintre formele:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pentru utilizare non-interactivă / CI, transmite explicit template-ul și rețeaua:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Generatorul afișează costul documentat de stake și de ardere la creare, precum și pașii următori pentru a-ți crea rollup-ul și a-i citi statusul.

### Creează un rollup din cod

Construiește o configurație dintr-un preset, citește de pe lanț stake-ul live și rata de ardere, apoi creează rollup-ul cu un client de semnare. Config builder-ul impune matricea de compatibilitate decontare → dovadă la `validate()` / `build()`.

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

Clientul de semnare expune întregul ciclu de viață — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` și `executeWithdrawal`. Tranzițiile ciclului de viață pot fi protejate prin transmiterea lui `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Citește starea cu clientul REST tipizat (nu necesită semnatar):

```ts
const rollup = await rdk.rest.getRollup("my-defi-rollup");
console.log(rollup.status, rollup.settlementMode, rollup.daBackend, rollup.vmType);

const batch = await rdk.rest.getLatestBatch("my-defi-rollup");
console.log(batch.batchIndex, batch.status, batch.txCount);
```

---

## Gestionarea ciclului de viață

Un rollup trece prin stările `pending`, `active`, `paused` și `stopped`. Creatorul gestionează tranzițiile cu următoarele comenzi.

### Pauză

Oprește temporar rollup-ul. Starea este păstrată și rollup-ul poate fi reluat. Este necesar un șir cu motivul.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Reluare

Reia un rollup pus anterior pe pauză.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Oprire

Dezafectează permanent rollup-ul și eliberează stake-ul. QOR-ul pus în stake — minus arderea unică de la creare — este returnat creatorului.

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

Operatorii de rollup trimit batch-uri de decontare, iar contestatarii pot disputa batch-urile optimiste. Aceste comenzi stau la baza stratului de decontare descris în **[Prezentare generală Rollups](/rollups/overview)** și **[ZK / STARK & Retrageri](/rollups/zk-stark-withdrawals)**.

### Trimite un batch

Trimite un batch de decontare pentru un rollup. Primește ID-ul rollup-ului, un index de batch și o rădăcină de stare encodată hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contestă un batch

Contestă un batch trimis (pentru rollup-urile optimiste). Primește ID-ul rollup-ului și indexul batch-ului; transmite dovada de fraudă cu `--proof`. Începând cu versiunea de lanț **v3.1.74**, calea optimistă **submit-batch → challenge-batch** este live și funcționează cap-coadă.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descriere |
| ---- | ----------- |
| `--proof` | Dovadă de fraudă encodată hex |

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
| `qorechaind query rdk rollup [rollup-id]` | Detaliile unui rollup anume |
| `qorechaind query rdk list-rollups` | Toate rollup-urile înregistrate |
| `qorechaind query rdk batch [rollup-id]` | Cel mai recent batch de decontare (sau `--index`) |
| `qorechaind query rdk config` | Parametrii modulului RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recomandă un preset pentru un caz de utilizare |

---

## Pașii următori

* **[Disponibilitatea datelor](/rollups/data-availability)** — backend-uri DA native, Celestia și redundante.
* **[ZK / STARK & Retrageri](/rollups/zk-stark-withdrawals)** — verificarea dovezilor și fluxul de retragere L2 → L1 prin `execute-withdrawal`.
