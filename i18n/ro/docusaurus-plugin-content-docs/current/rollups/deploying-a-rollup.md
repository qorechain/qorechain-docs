---
slug: /rollups/deploying-a-rollup
title: Implementarea unui rollup
sidebar_label: Implementarea unui rollup
sidebar_position: 3
---

# Implementarea unui rollup

Poți implementa un rollup specific aplicației în trei moduri: prin **Dashboard** (un asistent ghidat, fără cod), prin **CLI**-ul chain-ului (`qorechaind`, control complet asupra tranzacției on-chain) sau programatic cu **RDK-ul TypeScript** (`@qorechain/rdk` plus scaffolder-ul `create-qorechain-rollup`). Această pagină acoperă toate cele trei, plus ciclul de viață al operatorului și comenzile de loturi.

:::note
Comenzile de mai jos vizează testnet-ul **`qorechain-diana`**. Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este live din 7 iunie 2026, rulând versiunea de chain **v3.1.80** — înlocuiește chain ID-ul și endpoint-urile de mainnet când implementezi pe mainnet. Validează fiecare implementare mai întâi pe testnet.
:::

---

## Cerințe

| Cerință | Detalii |
| ----------- | ------- |
| **Stake minim** | O obligațiune de stake în QOR este pusă în escrow când rollup-ul este creat |
| **Burn la creare** | O fracțiune din suma puse la stake este ars permanent la creare; restul este păstrat în escrow și returnat când rollup-ul este oprit |
| **Cont** | Un cont QoreChain finanțat cu suficient sold pentru stake plus comisioanele de tranzacție |

Interoghează parametrii live ai modulului pentru stake-ul minim curent și rata de burn înainte de implementare:

```bash
qorechaind query rdk config
```

---

## Implementare prin Dashboard (Tools → Rollups)

Dashboard-ul oferă un asistent ghidat **Deploy a Rollup** în secțiunea **Tools → Rollups**. Este cea mai rapidă cale pentru lansarea unui rollup specific aplicației fără a asambla o tranzacție manual.

### Pași

1. **Autentifică-te.** Asistentul necesită o sesiune autentificată pentru a implementa și pentru a-ți lista implementările existente.
2. **Denumește-ți rollup-ul.** Introdu un nume de rollup (2–41 de caractere: litere, cifre, spații, cratime sau underscore-uri).
3. **Alege o mașină virtuală.** QoreChain este un chain triple-VM, deci rollup-ul tău poate rula oricare dintre:
   * **EVM** — contracte Solidity / Vyper cu instrumentar Ethereum complet (Hardhat, Foundry, MetaMask)
   * **CosmWasm** — contracte inteligente Rust pe runtime-ul Cosmos SDK, cu IBC nativ
   * **SVM** — Solana Virtual Machine, pentru aplicații cu execuție paralelă și debit ridicat
4. **Alege un strat de disponibilitate a datelor.** Locul unde rollup-ul tău publică datele tranzacțiilor, astfel încât oricine să poată reconstrui starea: **QoreChain DA**, **Celestia** sau **EigenDA**. Reține că EigenDA este o opțiune la nivel de Dashboard, în timp ce backend-urile DA on-chain `x/rdk` sunt native, Celestia sau both — vezi [Disponibilitatea datelor](/rollups/data-availability).
5. **Setează un token de gas.** Token-ul folosit pentru a plăti execuția pe rollup-ul tău. Implicit este **QOR**; introdu un simbol personalizat pentru a folosi propriul token nativ.
6. **Alege un sequencer.** Cine ordonează tranzacțiile înainte de settlement: **Shared sequencer** (setul partajat QoreChain), **Dedicated (single)** (rulează propriul tău sequencer unic) sau **Decentralized** (un set de sequencer-e fără permisiuni).
7. **Alege o țintă de settlement.** Locul unde rollup-ul ancorează rădăcinile sale de stare și probele de validitate: **QoreChain mainnet** sau **Ethereum**.
8. **Implementează.** Trimite asistentul. Provizionarea este examinată de **The Qore Trust** înainte ca rollup-ul să devină live, așa că un rollup proaspăt trimis apare cu un status **provisioning** până când examinarea se finalizează.

Rollup-urile tale trimise apar în lista **Your rollups** împreună cu VM-ul, stratul DA, token-ul de gas, sequencer-ul, ținta de settlement și statusul curent.

:::note
Asistentul Dashboard prezintă alegeri prietenoase, la nivel de produs, și rutează provizionarea printr-un pipeline examinat. CLI-ul de mai jos lucrează direct cu suprafața de mesaje on-chain a modulului `x/rdk`. Cele două împărtășesc aceleași concepte de bază (VM, DA, sequencer, settlement), dar le expun la altitudini diferite.
:::

---

## Implementare prin CLI

CLI-ul creează rollup-ul direct on-chain. `create-rollup` ia trei argumente poziționale — ID-ul rollup-ului, un profil și suma de stake (în `uqor`) — plus un flag opțional `--vm`.

:::tip
Începând cu versiunea de chain **v3.1.74**, `create-rollup` **aplică automat preset-ul profilului ales** — modul de settlement, sequencer-ul, DA, modelul de gas și VM-ul sunt toate preluate din preset. Nu mai trebuie să le setezi manual (anterior mesajul codifica fix o configurație suverană). Flag-ul `--vm` are acum **valoarea implicită goală**, deci VM-ul profilului se aplică decât dacă îl suprascrii explicit.
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
| `--vm` | *(gol — folosește VM-ul profilului)* | Suprascrie tipul de VM al rollup-ului: `evm`, `cosmwasm`, `svm` sau `custom`. Lasă nesetat pentru a aplica VM-ul preset-ului. |

Argumentul `[profile]` selectează o configurație preset care este aplicată automat — vezi **[Profiluri preset](/rollups/preset-profiles)**. Argumentul `[stake-amount]` este obligațiunea în `uqor`.

### Inspectează ce ai implementat

```bash
# Query a specific rollup by ID
qorechaind query rdk rollup my-defi-rollup

# List all registered rollups
qorechaind query rdk list-rollups
```

---

## Implementare cu RDK-ul TypeScript (`@qorechain/rdk`) {#deploy-with-the-typescript-rdk-qorechainrdk}

Rollup Development Kit este livrat ca două pachete npm publice care antrenează același modul on-chain `x/rdk` ca și CLI-ul, prin RPC/REST/gRPC/JSON-RPC public și orice `OfflineSigner` cosmjs:

* **[`@qorechain/rdk`](https://github.com/qorechain/qorechain-rdk)** (`v0.4.0`) — SDK-ul TypeScript: un constructor de configurări cu profiluri preset, helper-e de tranzacții pentru ciclurile de viață ale rollup-ului și ale loturilor de settlement, DA nativ, clienți de citire tipați și adăugirile v0.4 — chitanțe de settlement quantum-safe, QCAI Rollup Copilot, helper-e de calldata cross-VM și watchtower-ul.
* **`create-qorechain-rollup`** (`v0.4.0`) — un scaffolder care clonează un șablon de start rulabil per profil (inclusiv șablonul `multivm-rollup`).

Acestea sunt publicate pe npm. Repo-ul livrează de asemenea un CLI de operator publicat, **`@qorechain/rdk-cli`** (`qorollup`, `v0.4.0`), cu comenzile `doctor`, `create`, `status`, `watch`, `params`, `suggest`, ciclu de viață (`pause`/`resume`/`stop`), `keygen`, `manifest`, `withdraw` și `faucet`, plus comenzile v0.4 `receipt`, `advise` și `watchtower`.

#### Clienți Python, Go, Rust și Java

Alături de pachetul TypeScript, RDK oferă clienți **Python**, **Go**, **Rust** și **Java** completi care reflectă suprafața TypeScript: constructorul de configurări cu validare, cele cinci profiluri preset, utilitarele denom/economics/bech32, helper-ele binary-Merkle și de probe de retragere, manifestele de rollup, clienții de citire REST și JSON-RPC `qor_`, verificările preflight/health, conturile (mnemonic → adresă `qor`) și **semnarea + difuzarea tranzacțiilor** (`SIGN_MODE_DIRECT`). Toate sunt verificate în raport cu vectori golden cross-language partajați și sunt **publicate** în registrele lor:

```bash
# Python — installs as qorechain-rdk, imports as qorrdk
pip install qorechain-rdk

# Rust
cargo add qorechain-rdk

# Go
go get github.com/qorechain/qorechain-rdk/packages/go

# Java (Maven / Gradle)
# io.github.qorechain:qorechain-rdk:0.4.0
```

```python
import qorrdk
```

Versiuni publicate curente: Python `qorechain-rdk` **0.4.0** (PyPI, import `qorrdk`), Rust `qorechain-rdk` **0.4.0** (crates.io), modulul Go `github.com/qorechain/qorechain-rdk/packages/go` și Java `io.github.qorechain:qorechain-rdk` **0.4.0** (Maven Central). Difuzarea live necesită un endpoint de nod.

:::note
RDK-ul TypeScript și șabloanele sale vizează testnet-ul **`qorechain-diana`** și sunt marcate **coming soon** pentru fluxurile complete end-to-end. Fixează versiunile și validează pe testnet.
:::

### Creează un proiect cu `create-qorechain-rollup` {#scaffold-a-project-with-create-qorechain-rollup}

Fiecare profil are un șablon de start corespunzător (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`). Creează unul cu oricare dintre forme:

```bash
npm create qorechain-rollup my-rollup
# or
npx create-qorechain-rollup my-rollup
```

Pentru utilizare non-interactivă / CI, transmite explicit șablonul și rețeaua:

```bash
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --yes
```

Scaffolder-ul afișează costul documentat de stake și de burn la creare și pașii următori pentru a-ți crea rollup-ul și a-i citi statusul.

### Creează un rollup din cod

Construiește o configurare dintr-un preset, citește stake-ul live și rata de burn de pe chain, apoi creează rollup-ul cu un client de semnare. Constructorul de configurări impune matricea de compatibilitate settlement → proof la `validate()` / `build()`.

```ts
import { createRdkClient, presets, estimateCreationCost, uqorToQor } from "@qorechain/rdk";

// A config builder pre-filled with the defi preset's defaults; override via .set({ ... }).
const config = presets.defi({ rollupId: "my-defi-rollup" }).validate();

const rdk = createRdkClient({ network: "testnet" });

// Read the live module parameters — never hardcode the stake or burn rate.
const params = await rdk.params();
const cost = estimateCreationCost({
  stakeUqor: params.minStakeForRollup,
  burnRate: params.rollupCreationBurnRate,
});
console.log(`Stake: ${uqorToQor(cost.stakeUqor)} QOR — burned: ${uqorToQor(cost.burnUqor)} QOR`);

// Connect a signing client with any cosmjs OfflineSigner.
const tx = await rdk.connectTx(signer, { gasPrice: "0.025uqor" });
const msg = config.toCreateMsg(tx.address, { stakeAmount: params.minStakeForRollup });

const res = await tx.createRollup({
  rollupId: msg.rollupId,
  profile: msg.profile,
  vmType: msg.vmType,
  stakeAmount: msg.stakeAmount,
});
console.log(`Submitted: ${res.transactionHash} (code ${res.code})`);
```

Nu ești sigur ce profil se potrivește? `rdk.suggestProfile("a lending protocol with predictable fees")` returnează o recomandare asistată de QCAI (cu un fallback documentat).

### Gestionează ciclul de viață și citește starea din cod

Clientul de semnare expune ciclul de viață complet — `pauseRollup`, `resumeRollup`, `stopRollup`, plus `submitBatch`, `challengeBatch`, `resolveChallenge` și `executeWithdrawal`. Tranzițiile ciclului de viață pot fi protejate prin transmiterea `currentStatus`.

```ts
await tx.pauseRollup({ rollupId: "my-defi-rollup", reason: "maintenance" });
await tx.resumeRollup({ rollupId: "my-defi-rollup" });
await tx.stopRollup({ rollupId: "my-defi-rollup" });
```

Citește starea cu clientul REST tipat (nu este necesar niciun signer):

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

Oprește temporar rollup-ul. Starea este păstrată, iar rollup-ul poate fi reluat. Este necesar un șir de caractere cu motivul.

```bash
qorechaind tx rdk pause-rollup [rollup-id] [reason] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Reluare

Reia un rollup pus anterior în pauză.

```bash
qorechaind tx rdk resume-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Oprire

Dezafectează permanent rollup-ul și eliberează stake-ul său. Suma de QOR pusă la stake — minus burn-ul unic de la creare — este returnată creatorului.

```bash
qorechaind tx rdk stop-rollup [rollup-id] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::danger
Oprirea unui rollup este permanentă. Rollup-ul nu poate fi repornit după ce este oprit.
:::

---

## Comenzi de operator: loturi și contestări

Operatorii de rollup trimit loturi de settlement, iar contestatarii pot disputa loturile optimiste. Aceste comenzi stau la baza stratului de settlement descris în **[Prezentarea generală a rollup-urilor](/rollups/overview)** și **[ZK / STARK și retrageri](/rollups/zk-stark-withdrawals)**.

### Trimite un lot

Trimite un lot de settlement pentru un rollup. Ia ID-ul rollup-ului, un index de lot și o rădăcină de stare codificată hex.

```bash
qorechaind tx rdk submit-batch [rollup-id] [batch-index] [state-root-hex] \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

### Contestă un lot

Contestă un lot trimis (pentru rollup-urile optimiste). Ia ID-ul rollup-ului și indexul de lot; transmite proba de fraudă cu `--proof`. Începând cu versiunea de chain **v3.1.74**, calea optimistă **submit-batch → challenge-batch** este live și funcționează end-to-end.

```bash
qorechaind tx rdk challenge-batch [rollup-id] [batch-index] \
  --proof <hex-encoded-fraud-proof> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

| Flag | Descriere |
| ---- | ----------- |
| `--proof` | Probă de fraudă codificată hex |

### Inspectează loturile

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
| `qorechaind query rdk batch [rollup-id]` | Cel mai recent lot de settlement (sau `--index`) |
| `qorechaind query rdk config` | Parametrii modulului RDK |
| `qorechaind query rdk suggest-profile [use-case]` | Recomandă un preset pentru un caz de utilizare |

---

## Pașii următori

* **[Disponibilitatea datelor](/rollups/data-availability)** — backend-urile DA native, Celestia și redundant.
* **[ZK / STARK și retrageri](/rollups/zk-stark-withdrawals)** — verificarea probelor și fluxul de retragere L2 → L1 prin `execute-withdrawal`.
