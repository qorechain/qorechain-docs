---
slug: /sdk/why
title: De ce QoreChain SDK
sidebar_label: De ce QoreChain SDK
sidebar_position: 2
---

# De ce QoreChain SDK

QoreChain SDK îți oferă tot ceea ce oferă un SDK modern multi-chain — mesaje
tipizate pentru fiecare modul, interogări tipizate, conturi pentru trei VM-uri
dintr-un singur mnemonic, auto-gas, decodarea erorilor, abonamente, portofele
și un kit React.

Dar cinci capabilități sunt **posibile doar pe QoreChain**, pentru că sunt
construite pe funcționalități de protocol pe care niciun alt Layer 1 nu le are:
AI on-chain, trei VM-uri co-rezidente cu un bridge nativ, criptografie
post-cuantică obligatorie, o singură identitate de 20 de octeți pe toate cele
trei benzi VM și cheltuieli delegate PQC-safe pentru chei de portofele externe.
Acestea sunt motivele pentru care merită să construiești aici.

---

## 1. Scorare de risc AI pre-flight

**Scanează o tranzacție cu AI on-chain înainte de a o difuza** (necesită ca
precompilările AI să fie active pe rețeaua țintă, ceea ce încă nu se întâmplă pe
rețelele publice).

QoreChain livrează analiza de risc AI sub formă de precompilări EVM. SDK-ul le
apelează pentru tine și returnează gas-ul plus un verdict de risc/anomalie
într-un singur apel — astfel încât un portofel sau un dApp poate avertiza (sau
bloca) *înainte* de semnare. Precompilările AI **nu sunt încă active** pe
mainnet sau pe testnet (vezi
[Precompilări EVM: starea rețelelor](/developer-guide/evm-precompiles#network-status)).

```ts
import { createEvmClient, simulateWithRiskScore } from "@qorechain/evm";

const { publicClient } = await createEvmClient({ endpoints: { evmRpc } });

const preflight = await simulateWithRiskScore(publicClient, {
  from: account.address,
  to: contractAddress,
  data: calldata,
  value: 0n,
});

console.log(preflight.gas);            // estimated gas
console.log(preflight.risk.level);     // on-chain risk level
console.log(preflight.anomaly.flagged);// anomalous pattern?
if (!preflight.safe) {
  // advisory verdict — set your own policy
  console.warn("Transaction flagged by on-chain AI risk scoring");
}
```

**De ce este diferit:** scorarea este concepută să ruleze *în interiorul
lanțului* ca precompilare deterministă (`aiRiskScore` la `0x…0B01`,
`aiAnomalyCheck` la `0x…0B02`), nu ca serviciu off-chain. Până când aceste
precompilări sunt activate, helperii de mai sus aruncă eroare pe rețelele
publice (`returned no data ("0x")`; cele trei precompilări active pe testnet sunt cele PQC și de consens, nu acestea). Vezi [AI pre-flight](/sdk/guides/ai-preflight).

---

## 2. Apeluri cross-VM unificate — un cont, trei VM-uri, o singură tranzacție

**Apelează un contract pe orice VM și grupează apeluri pe toate cele trei în
mod atomic.**

QoreChain rulează contracte QoreChain Native, EVM și SVM pe același lanț, cu un bridge
cross-VM nativ. SDK-ul expune o singură interfață pentru a apela oricare dintre
ele — și pentru a împacheta mai multe apeluri cross-VM într-o singură
tranzacție atomică, semnată o singură dată.

```ts
import { connectQueryClients, createCrossVMClient } from "@qorechain/sdk";

// rpcClient: a connected consensus-RPC client (the CosmJS RPC client type).
const crossVM = createCrossVMClient(tx, { query: connectQueryClients(rpcClient).crossvm });

// Call an EVM contract from a native account (payload ABI-encoded for you).
await crossVM.call({
  targetVm: "evm",
  targetContract: "0xToken…",
  evm: { abi, functionName: "transfer", args: [recipient, amount] },
});

// One signature, three VMs, atomic: EVM → SVM → QoreChain Native.
await crossVM.callAtomic([
  { targetVm: "evm", targetContract: "0x…", evm: { abi, functionName: "approve", args } },
  { targetVm: "svm", targetContract: "Prog…", svm: { data } },
  { targetVm: "cosmwasm", targetContract: "qor1…", cosmwasm: { swap: {} } },
]);
```

**De ce este diferit:** QoreChain rulează trei VM-uri co-rezidente cu un modul
de bridge nativ (`crossvm`, plus precompilarea `CrossVMBridge` odată ce este
activă; încă nu este activă pe vreuna dintre rețele), astfel încât o singură interfață SDK poate adresa toate cele trei.
Lanțurile cu un singur VM nu au nimic echivalent de încapsulat. Astăzi raza de
acțiune a unui apel este limitată de banda pe care o vizează: `MsgCrossVMCall`
este oprit pe mainnet, tranzacțiile SVM sunt dezactivate, iar încărcarea și
instanțierea QoreChain Native sunt cu permisiuni (instanțierea este deschisă pe testnet). Vezi
[Apeluri cross-VM](/sdk/guides/cross-vm).

---

## 3. Rezistent la calculul cuantic în mod implicit

**Fă un semnatar protejat post-cuantic printr-un singur apel.**

QoreChain impune semnături hibride post-cuantice (ML-DSA-87 + clasice) la
nivelul protocolului. SDK-ul reduce adoptarea lor la o singură linie de cod:
verifici, înregistrezi și migrezi la semnarea hibridă — cu un badge React care
le arată utilizatorilor că sunt protejați.

```ts
import { ensurePqcRegistered, migrateToHybrid } from "@qorechain/sdk";

// Registers the signer's ML-DSA-87 key on-chain unless the chain already has it:
// it reads the status over REST first and never registers blind.
const rest = "https://api.qore.host";
const { alreadyRegistered, txHash } = await ensurePqcRegistered(tx, { pqcKeypair, rest });

// Switch the signing path to hybrid (classical + post-quantum).
const hybrid = await migrateToHybrid(tx, { pqcKeypair, rest });
await hybrid.signAndBroadcastHybrid({
  registry, signer, messages, fee, chainId, accountNumber, sequence,
  rest: "https://api.qore.host", // resolves the v1/v2 PQC sign-bytes form
  transport,
});
```

```tsx
import { QuantumSafeBadge } from "@qorechain/react";

// Shows a "Quantum-safe" indicator when the address has a registered PQC key
// (read over REST, so it works on the public endpoints from `@qorechain/react` 0.9.0 and later).
<QuantumSafeBadge address={account.address} />
```

**De ce contează:** criptografia post-cuantică este nativă și obligatorie pe
calea Native a QoreChain, nu un experiment, iar SDK-ul reduce adoptarea ei la un
apel de înregistrare plus o cale de trimitere hibridă. Înregistrarea este
explicită: nu există auto-înregistrare la prima tranzacție. Vezi
[Quantum-safe](/sdk/guides/quantum-safe).

---

## 4. Conturi eth-native unificate — o cheie, trei adrese, un singur sold

**O cheie `eth_secp256k1` este o singură identitate de 20 de octeți pe toate
cele trei benzi.** (SDK 0.6.0, chain v3.1.83.) Banda de tranzacții SVM este
dezactivată în prezent la nivelul întregii rețele, iar banda EVM necesită o
[fereastră de autorizare](/sdk/guides/evm#evm-window); soldul comun și maparea
adreselor se mențin indiferent de aceasta.

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"  bech32 — Native lane
account.evm;    // "0x…"    EIP-55 — EVM lane
account.svm;    // base58   — SVM lane (same 20 bytes + 12 zero bytes)
// A deposit to ANY of the three lands in ONE balance,
// and the same key signs on every enabled lane (signHybridEth on the Native path).
```

**De ce este unic:** pe configurațiile multi-VM din altă parte, fiecare runtime
are propriul spațiu de conturi, iar fondurile rămân blocate pe fiecare bandă.
QoreChain redă o singură identitate de 20 de octeți în trei moduri, cu un sold
comun — un portofel nu ajunge niciodată să „aibă fonduri pe o bandă, dar nu pe
alta". Un portofel extern precum Phantom poate fi legat de această identitate ca
autentificator limitat ([Autentificatori](/sdk/guides/authenticators)). Vezi
[Conturi unificate](/sdk/concepts/accounts-pqc#unified-accounts).

---

## 5. Benzi de autentificatori — cheltuieli delegate fără a renunța la PQC

**O cheie Phantom sau MetaMask conectată cheltuiește din contul canonic cu PQC
obligatoriu, sub limite, printr-un relayer.** (SDK 0.7.0, chain v3.1.85.)

:::caution Încă indisponibil pe mainnet
Modulul `abstractaccount` este oprit pe `qorechain-vladi`
(`GET /qorechain/abstractaccount/v1/config` returnează `"enabled": false`), iar
începând cu chain v3.2.0 acest indicator este impus pe orice cale, deci pe mainnet o
cheie nu poate fi legată și benzile de mai jos nu pot fi folosite. Modulul este activat
pe testnet-ul `qorechain-diana` (verificat la 27 octombrie 2026). Vezi
[ghidul Autentificatori](/sdk/guides/authenticators).
:::

```ts
import { buildPhantomExecuteCosmos } from "@qorechain/sdk";

// The Phantom key signs a domain-separated digest; a relayer pays fees and
// broadcasts. The external key NEVER produces an ML-DSA co-signature.
const msg = await buildPhantomExecuteCosmos({
  wallet: window.solana,
  relayer: relayerAddress,
  chainId: "qorechain-vladi",
  account: canonicalAccount, // the PQC-required owner
  to: recipient,
  amount: "100uqor",
  nonce, // per-authenticator sequence
});
```

**De ce contează:** odată ce modulul este activat, fiecare cheltuială este
delimitată de o taxonomie de permisiuni on-chain, de limitele `SpendingRule` și
de o dată de expirare — privilegii minime și revocabile — în timp ce contul în
sine rămâne protejat post-cuantic. Vezi
[Autentificatori și cheltuieli delegate](/sdk/guides/authenticators).

---

## Și tot restul

Dincolo de cei cinci diferențiatori, SDK-ul acoperă întreaga suprafață a
lanțului în **TypeScript, Python, Go, Rust și Java**: composeri tipizați pentru
fiecare modul (inclusiv sidechain-uri/paychain-uri prin `multilayer` și
rollup-uri prin `rdk`), interogări tipizate, ciclul de viață al tranzacțiilor,
abonamente, portofele de browser și kitul de hook-uri
[`@qorechain/react`](/sdk/guides/react).

Ești gata să construiești? Începe cu [Quickstart](/sdk/quickstart).
