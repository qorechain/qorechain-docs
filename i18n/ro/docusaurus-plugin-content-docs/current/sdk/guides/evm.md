---
slug: /sdk/guides/evm
title: Ghid EVM
sidebar_label: EVM
sidebar_position: 1
---

# Ghid EVM

`@qorechain/evm` este un adaptor subțire, type-safe peste [viem](https://viem.sh) pentru
motorul EVM al QoreChain. Nu reimplementează un client EVM — viem este o dependență
peer. Adaugă o fabrică de clienți conștientă de lanț (cu auto-detectare a chain-id-ului
EVM), helpere ERC-20, wrappere pentru deploy/apel de contracte și legături tipizate
pentru precompilele EVM ale QoreChain.

```bash
npm i @qorechain/evm viem
```

## Crearea unui client

`createEvmClient` returnează un pachet de client susținut de viem. Detectează automat
chain-id-ul EVM prin `eth_chainId`, cu excepția cazului în care transmiți `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Poți de asemenea să transmiți direct `rpcUrl` (mutual exclusiv cu `endpoints`), un
`wsUrl` / `endpoints.evmWs` pentru WebSocket (`wss://evm-ws-testnet.qore.host` pe
testnet), un `chainId` explicit și `decimals`
(implicit 18, convenția EVM pentru QOR — distinctă de baza Cosmos `uqor`
de 10^6).

Derivă un cont de semnare EVM dintr-o cheie privată:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Helpere ERC-20

Spațiul de nume `erc20` (și funcțiile individuale) împachetează apelurile ERC-20 standard.
Citirile primesc un public client viem; scrierile primesc un wallet client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

ABI-ul brut este exportat ca `ERC20_ABI` dacă preferi să apelezi viem direct.

## Contracte

Wrappere generice pentru deploy și apel:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Fereastra de autorizare EVM (lanț v3.2.0) {#evm-window}

Începând cu versiunea de lanț **v3.2.0** (mainnet de la blocul 2,981,742, testnet de la
blocul 5,920,000), banda EVM admite o tranzacție doar de la un cont care are o
**cheie ML-DSA-87 înregistrată** și o **fereastră de autorizare deschisă**. Citirile
(`eth_call`, solduri, chitanțe) și estimarea gazului funcționează fără una, iar
portofelele și bibliotecile precum MetaMask, viem, ethers, Hardhat și Foundry semnează
ca până acum; ceea ce se schimbă este că autorizarea post-cuantică călătorește *înaintea*
tranzacției, ca mesaj de bandă Native semnat hibrid. Regulile la nivel de lanț, limitele,
formele CLI și codurile de refuz se găsesc în
[Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).

Cu SDK **0.8.2 sau mai nou** poți deschide o fereastră din cod (**0.9.0** adaugă
opțiunile de domeniu de mai jos). Înregistrarea cheii
(o singură dată) este descrisă în [Quantum-safe](/sdk/guides/quantum-safe); exemplul
de mai jos deschide apoi o fereastră pentru un cont eth-native unificat (`npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  openEvmWindowMsg,
  fetchEvmWindow,
  classifyEvmWindowRejection,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account, { rest: REST }); // hybrid: the window needs the ML-DSA key

const { account: base } = await client.rest.get<{
  account: { account_number: string; sequence: string };
}>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);

const open = openEvmWindowMsg({
  sender: account.cosmos,
  blocks: 7200,         // 1 … 17,280 blocks (a block count, not a duration)
  maxTxs: 20,           // 1 … 1,000 transactions
  maxValue: "1000000000", // uqor: transferred value PLUS the maximum fee of each transaction
});

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-vladi",
  accountNumber: BigInt(base.account_number),
  sequence: BigInt(base.sequence),
  messages: [open],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
});

const w = await fetchEvmWindow({ rest: REST, address: account.cosmos });
console.log(w.live); // true while the window admits at least one more transaction
```

Deschiderea unei ferestre avansează nonce-ul contului (o singură identitate: secvența
Cosmos este nonce-ul EVM), așa că citește nonce-ul EVM **după** ce fereastra este
deschisă și abia apoi semnează tranzacția EVM. `maxValue` limitează valoarea **plus**
taxa maximă (limita de gaz înmulțită cu plafonul taxei) a fiecărei tranzacții: un
transfer de 1,000 uqor cu 21,000 de gaz la 112.5 gwei consumă 3,363 uqor din fereastră.
Deschide o fereastră doar când utilizatorul o cere; nu deschide niciodată una automat.

Când banda EVM refuză o tranzacție, `classifyEvmWindowRejection(err)` îți spune
de ce:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` construiește mesajul de închidere corespunzător, iar
`MAX_EVM_WINDOW_BLOCKS` și `MAX_EVM_WINDOW_TXS` exportă limitele.

### Domeniul unei ferestre (lanț v3.2.3, SDK 0.9.0) {#evm-window-scope}

O fereastră poate fi restrânsă la deschidere: `nativeOnly` admite doar transferuri
simple de QOR nativ (fără calldata, fără creare de contract, fără destinatar care
poartă cod, fără autorizare EIP-7702), iar `allowedTargets` admite doar tranzacții al
căror destinatar este una dintre cel mult 16 adrese `0x` listate (fără duplicate;
crearea de contract este refuzată). Ambele sunt câmpuri noi de mesaj: un nod sub v3.2.3
refuză întreaga tranzacție când oricare dintre ele este setat, așa că setează-le doar pe
o rețea care a aplicat v3.2.3 (ambele rețele publice au aplicat-o). `fetchEvmWindow` le
citește înapoi pe ambele (`nativeOnly`, `allowedTargets`; înainte de v3.2.3 se citesc
`false` și gol). Pentru o fereastră deschisă doar pentru a trimite QOR, preferă
`nativeOnly`.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on-chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "1000000000", // uqor: value PLUS the maximum fee of each transaction
      nativeOnly: true,
      // or: allowedTargets: ["0x…", "0x…"],
    }),
  ],
  "auto",
);
```

### Consimțământul EIP-7702 (lanț v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

O tranzacție de tip 4 (EIP-7702) este admisă doar după ce fiecare cont a cărui
autorizare intră în vigoare a dat un consimțământ post-cuantic exact pentru acel
delegat, printr-un `MsgAuthorizeEVMDelegation` semnat hibrid. Consimțământul este
consumat de tranzacția care instalează delegarea și expiră după `blocks` pe care îl
setezi (1 până la 17,280); adresa zero ca delegat consimte la ștergere. SDK-ul
construiește mesajele și citește înapoi consimțământul, inclusiv nonce-ul pe care
trebuie să-l poarte tuplul de autorizare:

```ts
import {
  authorizeEvmDelegationMsg,
  clearEvmDelegationMsg,
  fetchEvmDelegationConsent,
  evmDelegationTupleNonce,
} from "@qorechain/sdk";

// 1) Consent to one delegate (hybrid-signed Native-lane message, `tx` as above).
await tx.signAndBroadcast(
  [authorizeEvmDelegationMsg({ sender: account.address, delegate: "0xDelegate…", blocks: 600 })],
  "auto",
);

// 2) Read the consent: the tuple's nonce is the account's EVM nonce for a
//    sponsored transaction, and that nonce + 1 when the account sends it itself.
const consent = await fetchEvmDelegationConsent({ rest: "https://api.qore.host", address: account.address });
const tupleNonce = evmDelegationTupleNonce(consent, /* sponsored */ true);

// 3) Sign the authorisation tuple with `tupleNonce` and send the type-4
//    transaction (the sender still needs an open window; a sponsor pays from its own).

// Remove an installed delegation directly, without any EVM transaction:
// await tx.signAndBroadcast([clearEvmDelegationMsg(account.address)], "auto");
```

`classifyEvmDelegationRejection(err)` returnează `"no-consent"` sau `"invalid"` când
banda EVM refuză o delegare. Interogarea consimțământului necesită lanț v3.2.2 sau mai
nou. Regulile la nivel de lanț se găsesc în
[Delegări EIP-7702](/architecture/post-quantum-security#eip-7702); formele CLI sunt
`qorechaind tx pqc authorize-evm-delegation` și `clear-evm-delegation`.

Versiunile anterioare lui 0.9.0 construiesc doar fereastra fără domeniu (o fereastră
fără domeniu funcționează în continuare pe ambele rețele) și nu au constructori de
consimțământ; folosește acolo formele CLI din
[Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).

## Precompile

QoreChain definește precompile apelabile din contracte la adrese fixe. Spațiul de nume
`precompiles` oferă legături tipizate, iar adresele și ABI-urile sunt
exportate.

> **Inactive pe mainnet; trei pe testnet.** Precompilele QoreChain sunt compilate
> în nod, dar niciuna nu este activată pe mainnet (`qorechain-vladi`). Pe testnet
> (`qorechain-diana`), lista `active_static_precompiles` conține `0x…0A01`
> (verificare PQC), `0x…0A02` (starea cheii PQC) și `0x…0C01` (parametrii de
> consens), verificat la 27 octombrie 2026; perechea AI (`0x…0B01`, `0x…0B02`) și
> puntea cross-VM (`0x…0901`) nu sunt active pe niciuna dintre rețele. Un apel către
> o adresă inactivă returnează date goale, deci acele helpere aruncă eroare. Vezi
> [Precompile EVM: Starea rețelei](/developer-guide/evm-precompiles#network-status).

| Precompilă | Funcție | Adresă |
| --- | --- | --- |
| Cross-VM Bridge | (rutare bridge) | `0x0000000000000000000000000000000000000901` |
| Verificare PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Stare cheie PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Scor de risc QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Verificare anomalii QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Parametri de consens | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (0x…0C01 is active on the testnet, not on mainnet).
const params = await precompiles.rlConsensusParams(client.publicClient);

// Check whether an address has a registered PQC key.
const status = await precompiles.pqcKeyStatus(client.publicClient, account);

// QCAI helpers: raw calldata for the risk score, an args object for the anomaly check.
const score = await precompiles.aiRiskScore(client.publicClient, "0xa9059cbb...");
const anomaly = await precompiles.aiAnomalyCheck(client.publicClient, {
  sender: account,
  amount: 1_000_000_000_000_000_000n, // 1 QOR in wei
});

console.log(PRECOMPILE_ADDRESSES.crossVmBridge);
```

ABI-urile precompilelor sunt exportate ca `IQORE_PQC_ABI`, `IQORE_AI_ABI` și
`IQORE_CONSENSUS_ABI`.

> Acolo unde o precompilă nu este activă (mainnet: toate; testnet: perechea AI și
> puntea cross-VM), sau pe un
> nod fără precompilele QoreChain, aceste apeluri aruncă o eroare „feature not
> present”. Tratează acest lucru per apel.

Vezi [exemplul](/sdk/examples) `evm-precompile` pentru o versiune executabilă.
