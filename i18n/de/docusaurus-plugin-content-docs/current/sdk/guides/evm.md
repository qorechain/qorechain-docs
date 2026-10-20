---
slug: /sdk/guides/evm
title: EVM-Leitfaden
sidebar_label: EVM
sidebar_position: 1
---

# EVM-Leitfaden

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh) für
die QoreChain EVM Engine. Er implementiert keinen EVM-Client neu — viem ist eine Peer-
Abhängigkeit. Er ergänzt eine chain-bewusste Client-Factory (mit automatischer Erkennung der
EVM-Chain-ID), ERC-20-Helfer, Wrapper zum Deployen/Aufrufen von Verträgen sowie typisierte
Bindings für QoreChains EVM-Precompiles.

```bash
npm i @qorechain/evm viem
```

## Einen Client erstellen

`createEvmClient` gibt ein Client-Bundle zurück, das von viem unterstützt wird. Es erkennt die
EVM-Chain-ID automatisch über `eth_chainId`, sofern Sie nicht `chainId` übergeben.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Sie können auch `rpcUrl` direkt übergeben (gegenseitig ausschließend mit `endpoints`), eine
`wsUrl` / `endpoints.evmWs` für WebSocket (`wss://evm-ws-testnet.qore.host` im
Testnet), eine explizite `chainId` sowie `decimals`
(Standardwert 18, die EVM-Konvention für QOR — abweichend von der Cosmos-Basis `uqor`
von 10^6).

Leiten Sie ein EVM-Signaturkonto aus einem privaten Schlüssel ab:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20-Helfer

Der `erc20`-Namespace (sowie die einzelnen Funktionen) kapseln standardmäßige ERC-20-Aufrufe.
Lesezugriffe benötigen einen viem-Public-Client; Schreibzugriffe einen Wallet-Client.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

Die rohe ABI wird als `ERC20_ABI` exportiert, falls Sie viem lieber direkt aufrufen möchten.

## Verträge

Generische Wrapper zum Deployen und Aufrufen:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## EVM-Autorisierungsfenster (seit Chain v3.2.0) {#evm-window}

Seit Chain-Version **v3.2.0** (Mainnet ab Block 2.981.742, Testnet ab Block
5.920.000) lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das einen
**registrierten ML-DSA-87-Schlüssel** und ein **offenes Autorisierungsfenster** hat. Lesezugriffe
(`eth_call`, Guthaben, Receipts) und Gasschätzung funktionieren ohne beides, und Wallets
und Bibliotheken wie MetaMask, viem, ethers, Hardhat und Foundry signieren wie bisher;
neu ist, dass die Post-Quantum-Autorisierung der Transaktion *vorausgeht*, und zwar als
hybrid-signierte Native-Lane-Nachricht. Die Regeln auf Chain-Ebene, die Grenzwerte, die CLI-Formen und die Ablehnungscodes stehen unter
[EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window).

Mit SDK **0.8.2 oder neuer** können Sie ein Fenster aus Code heraus öffnen (**0.9.0** ergänzt die
unten beschriebenen Scope-Optionen). Das (einmalige)
Registrieren des Schlüssels ist unter [Quantensicher](/sdk/guides/quantum-safe) beschrieben; das
folgende Beispiel öffnet dann ein Fenster für ein vereinheitlichtes eth-natives Konto (`npm i @cosmjs/stargate`):

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

Das Öffnen eines Fensters erhöht die Nonce des Kontos (eine Identität: die Cosmos-Sequence
ist die EVM-Nonce). Lesen Sie die EVM-Nonce daher **nach** dem Öffnen des Fensters und signieren Sie
die EVM-Transaktion erst dann. `maxValue` begrenzt den Wert **plus** die maximale Gebühr (Gaslimit
mal Fee-Cap) jeder Transaktion: Ein Transfer von 1.000 uqor mit 21.000 Gas bei
112,5 gwei verbraucht 3.363 uqor des Fensters. Öffnen Sie ein Fenster nur, wenn der Nutzer
es verlangt; öffnen Sie nie automatisch eines.

Wenn die EVM-Lane eine Transaktion ablehnt, sagt Ihnen `classifyEvmWindowRejection(err)`
warum:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` baut die passende Schließen-Nachricht, und `MAX_EVM_WINDOW_BLOCKS`
sowie `MAX_EVM_WINDOW_TXS` exportieren die Grenzwerte.

### Ein Fenster einschränken (seit Chain v3.2.3, SDK 0.9.0) {#evm-window-scope}

Ein Fenster kann beim Öffnen eingeschränkt werden: `nativeOnly` lässt nur einfache Transfers
von nativem QOR zu (keine Calldata, keine Vertragserstellung, keinen Empfänger, der Code trägt,
keine EIP-7702-Autorisierung), und `allowedTargets` lässt nur Transaktionen zu, deren
Empfänger eine von bis zu 16 aufgelisteten `0x`-Adressen ist (keine Duplikate; die Vertragserstellung
wird abgelehnt). Beides sind neue Nachrichtenfelder: Ein Node unterhalb von v3.2.3 lehnt die gesamte
Transaktion ab, wenn eines davon gesetzt ist; setzen Sie sie daher nur in einem Netzwerk, das
v3.2.3 angewendet hat (beide öffentlichen Netzwerke haben das). `fetchEvmWindow` liest beide zurück (`nativeOnly`,
`allowedTargets`; vor v3.2.3 lesen sie sich als `false` und leer). Für ein Fenster, das
nur zum Senden von QOR geöffnet wird, bevorzugen Sie `nativeOnly`.

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

### EIP-7702-Einwilligung (seit Chain v3.2.2, SDK 0.9.0) {#evm-delegation-consent}

Eine Typ-4-Transaktion (EIP-7702) wird erst zugelassen, nachdem jedes Konto, dessen
Autorisierung wirksam wird, mit einer hybrid-signierten `MsgAuthorizeEVMDelegation` eine
Post-Quanten-Einwilligung genau für diesen Delegate erteilt hat. Die Einwilligung wird von
der Transaktion verbraucht, die die Delegation installiert, und läuft nach den von Ihnen
festgelegten `blocks` ab (1 bis 17.280); die Nulladresse als Delegate willigt in das Löschen ein. Das SDK
baut die Nachrichten und liest die Einwilligung zurück, einschließlich der Nonce, die das
Autorisierungs-Tupel tragen muss:

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

`classifyEvmDelegationRejection(err)` liefert `"no-consent"` oder `"invalid"`, wenn die
EVM-Lane eine Delegation ablehnt. Die Einwilligungsabfrage erfordert Chain v3.2.2 oder neuer. Die
Regeln auf Chain-Ebene stehen unter
[EIP-7702-Delegationen](/architecture/post-quantum-security#eip-7702); die CLI-Formen
lauten `qorechaind tx pqc authorize-evm-delegation` und `clear-evm-delegation`.

Releases vor 0.9.0 bauen nur das Fenster ohne Scope (ein Fenster ohne Scope funktioniert
weiterhin auf beiden Netzwerken) und haben keine Einwilligungs-Builder; verwenden Sie dort die CLI-Formen unter
[EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window).

## Precompiles

QoreChain definiert vertragsaufrufbare Precompiles an festen Adressen. Der
`precompiles`-Namespace bietet typisierte Bindings, und die Adressen sowie ABIs werden
exportiert.

> **Noch nicht aktiv.** Die QoreChain-Precompiles sind in den Node einkompiliert,
> aber weder im Mainnet (`qorechain-vladi`) noch im Testnet
> (`qorechain-diana`) aktiviert: Ein Aufruf liefert leere Daten zurück, sodass diese Helfer
> heute auch auf den öffentlichen Netzwerken Fehler werfen. Siehe
> [EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).

| Precompile | Funktion | Adresse |
| --- | --- | --- |
| Cross-VM Bridge | (Bridge-Routing) | `0x0000000000000000000000000000000000000901` |
| PQC verify | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| PQC key status | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| QCAI risk score | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| QCAI anomaly check | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Consensus params | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

```ts
import { precompiles, PRECOMPILE_ADDRESSES } from "@qorechain/evm";

// Read consensus parameters (once 0x…0C01 is active).
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

Die Precompile-ABIs werden als `IQORE_PQC_ABI`, `IQORE_AI_ABI` und
`IQORE_CONSENSUS_ABI` exportiert.

> Wo ein Precompile nicht aktiv ist (heute: jedes öffentliche Netzwerk) oder auf einem Node
> ohne die QoreChain-Precompiles, werfen diese Aufrufe einen Fehler "feature not
> present". Behandeln Sie dies pro Aufruf.

Eine lauffähige Version finden Sie im `evm-precompile`-[Beispiel](/sdk/examples).
