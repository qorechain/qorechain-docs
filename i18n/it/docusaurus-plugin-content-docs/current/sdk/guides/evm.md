---
slug: /sdk/guides/evm
title: Guida EVM
sidebar_label: EVM
sidebar_position: 1
---

# Guida EVM

`@qorechain/evm` è un adattatore sottile e type-safe basato su [viem](https://viem.sh) per
il motore EVM di QoreChain. Non reimplementa un client EVM — viem è una peer
dependency. Aggiunge una factory di client consapevole della catena (con auto-rilevamento
dell'EVM chain-id), helper ERC-20, wrapper per il deploy/la chiamata di contratti e binding
tipizzati per i precompilati EVM di QoreChain.

```bash
npm i @qorechain/evm viem
```

## Creare un client

`createEvmClient` restituisce un bundle di client basato su viem. Rileva automaticamente
l'EVM chain id tramite `eth_chainId` a meno che tu non passi `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Puoi anche passare direttamente `rpcUrl` (mutuamente esclusivo con `endpoints`), un
`wsUrl` / `endpoints.evmWs` per WebSocket (`wss://evm-ws-testnet.qore.host` sulla
testnet), un `chainId` esplicito e `decimals`
(predefinito a 18, la convenzione EVM per QOR — distinta dalla base Cosmos `uqor`
di 10^6).

Deriva un account di firma EVM da una chiave privata:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Helper ERC-20

Il namespace `erc20` (e le singole funzioni) incapsula le chiamate ERC-20 standard.
Le letture richiedono un public client viem; le scritture richiedono un wallet client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

L'ABI grezza è esportata come `ERC20_ABI` se preferisci chiamare viem direttamente.

## Contratti

Wrapper generici per deploy e chiamata:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Finestra di autorizzazione EVM (dalla chain v3.2.0) {#evm-window}

Dalla versione **v3.2.0** della chain (mainnet dal blocco 2,981,742, testnet dal blocco
5,920,000) la corsia EVM ammette una transazione solo da un account che abbia una
**chiave ML-DSA-87 registrata** e una **finestra di autorizzazione aperta**. Le letture
(`eth_call`, saldi, ricevute) e la stima del gas funzionano senza finestra, e wallet
e librerie come MetaMask, viem, ethers, Hardhat e Foundry firmano come prima;
ciò che cambia è che l'autorizzazione post-quantistica viaggia *prima* della
transazione, come messaggio della corsia Native firmato in modo ibrido. Le regole a livello di chain, i
limiti, le forme della CLI e i codici di rifiuto sono in
[Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

Con l'SDK **0.8.2 o successivo** puoi aprire una finestra dal codice (la **0.9.0** aggiunge
le opzioni di ambito qui sotto). La registrazione della chiave
(una sola volta) è descritta in [Firma ibrida](/sdk/guides/quantum-safe); l'esempio
seguente apre poi una finestra per un account eth-native unificato (`npm i
@cosmjs/stargate`):

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

L'apertura di una finestra fa avanzare il nonce dell'account (una sola identità: la sequence Cosmos
è il nonce EVM), quindi leggi il nonce EVM **dopo** che la finestra è aperta e firma
a quel punto la transazione EVM. `maxValue` limita il valore **più** la fee massima (gas limit
per il fee cap) di ciascuna transazione: un trasferimento di 1,000 uqor con 21,000 gas a
112.5 gwei consuma 3,363 uqor della finestra. Apri una finestra solo quando l'utente
lo richiede; non aprirne mai una automaticamente.

Quando la corsia EVM rifiuta una transazione, `classifyEvmWindowRejection(err)` te
ne indica il motivo:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` costruisce il corrispondente messaggio di chiusura, e `MAX_EVM_WINDOW_BLOCKS`
e `MAX_EVM_WINDOW_TXS` esportano i limiti.

### Limitare l'ambito di una finestra (dalla chain v3.2.3, SDK 0.9.0) {#evm-window-scope}

Una finestra può essere ristretta quando viene aperta: `nativeOnly` ammette solo
trasferimenti semplici di QOR nativo (nessun calldata, nessuna creazione di
contratti, nessun destinatario che contenga codice, nessuna autorizzazione
EIP-7702), e `allowedTargets` ammette solo transazioni il cui destinatario è uno
fino a 16 indirizzi `0x` elencati (nessun duplicato; la creazione di contratti
viene rifiutata). Entrambi sono nuovi campi del messaggio: un nodo precedente
alla v3.2.3 rifiuta l'intera transazione se uno dei due è impostato, quindi
impostali solo su una rete che ha applicato la v3.2.3 (lo hanno fatto entrambe le
reti pubbliche). `fetchEvmWindow` li legge entrambi (`nativeOnly`,
`allowedTargets`; prima della v3.2.3 risultano `false` e vuoto). Per una finestra
aperta solo per inviare QOR, preferisci `nativeOnly`.

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

### Consenso EIP-7702 (dalla chain v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

Una transazione di tipo 4 (EIP-7702) viene ammessa solo dopo che ogni account la
cui autorizzazione ha effetto ha dato un consenso post-quantistico esattamente a
quel delegato, con un `MsgAuthorizeEVMDelegation` firmato in modo ibrido. Il
consenso viene esaurito dalla transazione che installa la delega e scade dopo i
`blocks` che hai impostato (da 1 a 17,280); l'indirizzo zero come delegato
acconsente alla rimozione. L'SDK costruisce i messaggi e rilegge il consenso,
incluso il nonce che la tupla di autorizzazione deve portare:

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

`classifyEvmDelegationRejection(err)` restituisce `"no-consent"` oppure `"invalid"`
quando la corsia EVM rifiuta una delega. La query del consenso richiede la chain
v3.2.2 o successiva. Le regole a livello di chain sono in
[Deleghe EIP-7702](/architecture/post-quantum-security#eip-7702); le forme della
CLI sono `qorechaind tx pqc authorize-evm-delegation` e `clear-evm-delegation`.

Le release precedenti alla 0.9.0 costruiscono solo la finestra senza ambito (una
finestra senza ambito funziona comunque su entrambe le reti) e non hanno builder
di consenso; usa lì le forme della CLI in
[Finestra di autorizzazione EVM](/getting-started/first-transaction#evm-window).

## Precompilati

QoreChain espone precompilati richiamabili da contratto a indirizzi fissi. Il
namespace `precompiles` fornisce binding tipizzati, e gli indirizzi e le ABI sono
esportati.

> **Non attivi sulla mainnet; tre sulla testnet.** I precompilati di QoreChain sono
> compilati nel node ma nessuno è attivato sulla mainnet (`qorechain-vladi`).
> Sulla testnet (`qorechain-diana`) l'elenco `active_static_precompiles` contiene
> `0x…0A01` (verifica PQC), `0x…0A02` (stato chiave PQC) e `0x…0C01` (parametri di
> consenso), verificato il 27 ottobre 2026; la coppia AI (`0x…0B01`, `0x…0B02`) e il
> bridge cross-VM (`0x…0901`) non sono attivi su nessuna delle due reti. Una chiamata a un
> indirizzo non attivo restituisce dati vuoti, quindi quegli helper generano un errore. Vedi
> [Precompilati EVM: stato della rete](/developer-guide/evm-precompiles#network-status).

| Precompilato | Funzione | Indirizzo |
| --- | --- | --- |
| Cross-VM Bridge | (routing del bridge) | `0x0000000000000000000000000000000000000901` |
| Verifica PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Stato chiave PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Punteggio di rischio QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Controllo anomalie QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Parametri di consenso | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

Le ABI dei precompilati sono esportate come `IQORE_PQC_ABI`, `IQORE_AI_ABI` e
`IQORE_CONSENSUS_ABI`.

> Dove un precompilato non è attivo (mainnet: tutti; testnet: la coppia AI e
> il bridge cross-VM), oppure su un nodo
> privo dei precompilati di QoreChain, queste chiamate generano un errore "feature not
> present". Gestiscilo per ogni chiamata.

Vedi l'[esempio](/sdk/examples) `evm-precompile` per una versione eseguibile.
