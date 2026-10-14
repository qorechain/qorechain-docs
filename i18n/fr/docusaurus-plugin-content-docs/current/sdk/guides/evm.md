---
slug: /sdk/guides/evm
title: Guide EVM
sidebar_label: EVM
sidebar_position: 1
---

# Guide EVM

`@qorechain/evm` est un adaptateur fin et fortement typé au-dessus de [viem](https://viem.sh) pour
le moteur EVM de QoreChain. Il ne réimplémente pas un client EVM — viem est une dépendance
pair (peer dependency). Il ajoute une fabrique de client consciente de la chaîne (avec
détection automatique de l'identifiant de chaîne EVM), des assistants ERC-20, des wrappers de
déploiement/appel de contrats, et des liaisons typées pour les précompilés EVM de QoreChain.

```bash
npm i @qorechain/evm viem
```

## Créer un client

`createEvmClient` renvoie un ensemble de clients reposant sur viem. Il détecte automatiquement
l'identifiant de chaîne EVM via `eth_chainId` sauf si vous passez `chainId`.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Vous pouvez aussi passer directement `rpcUrl` (mutuellement exclusif avec `endpoints`), un
`wsUrl` / `endpoints.evmWs` pour le WebSocket (`wss://evm-ws-testnet.qore.host` sur le
testnet), un `chainId` explicite, et `decimals`
(par défaut 18, la convention EVM pour QOR — distincte de la base Cosmos `uqor`
de 10^6).

Dérivez un compte de signature EVM à partir d'une clé privée :

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## Assistants ERC-20

L'espace de noms `erc20` (ainsi que les fonctions individuelles) encapsule les appels ERC-20 standard.
Les lectures prennent un client public viem ; les écritures prennent un client wallet.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

L'ABI brut est exporté sous le nom `ERC20_ABI` si vous préférez appeler viem directement.

## Contrats

Wrappers génériques de déploiement et d'appel :

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## Fenêtre d'autorisation EVM (chaîne v3.2.0) {#evm-window}

Depuis la version **v3.2.0** de la chaîne (mainnet à partir du bloc 2,981,742, testnet à partir du bloc
5,920,000), la voie EVM n'admet une transaction que si elle provient d'un compte disposant d'une
**clé ML-DSA-87 enregistrée** et d'une **fenêtre d'autorisation ouverte**. Les lectures
(`eth_call`, soldes, reçus) et l'estimation du gas fonctionnent sans fenêtre, et les wallets
et bibliothèques tels que MetaMask, viem, ethers, Hardhat et Foundry signent comme avant ;
ce qui change, c'est que l'autorisation post-quantique voyage *avant* la
transaction, sous la forme d'un message de la voie Native signé de manière hybride. Les règles au niveau de la chaîne, les
bornes, les formes de la CLI et les codes de refus se trouvent dans
[Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).

Avec le SDK **0.8.2 ou ultérieur**, vous pouvez ouvrir une fenêtre depuis le code. L'enregistrement de la clé
(une seule fois) est décrit dans [Quantum-safe](/sdk/guides/quantum-safe) ; l'exemple
ci-dessous ouvre ensuite une fenêtre pour un compte eth-natif unifié (`npm i @cosmjs/stargate`) :

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

L'ouverture d'une fenêtre fait avancer le nonce du compte (une seule identité : la séquence Cosmos
est le nonce EVM) ; lisez donc le nonce EVM **après** l'ouverture de la fenêtre et signez
alors la transaction EVM. `maxValue` borne la valeur **plus** les frais maximaux (limite de gas
multipliée par le plafond de frais) de chaque transaction : un transfert de 1,000 uqor avec 21,000 gas à
112.5 gwei consomme 3,363 uqor de la fenêtre. N'ouvrez une fenêtre que lorsque l'utilisateur
le demande ; n'en ouvrez jamais automatiquement.

Lorsque la voie EVM refuse une transaction, `classifyEvmWindowRejection(err)` vous
indique pourquoi :

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` construit le message de fermeture correspondant, et `MAX_EVM_WINDOW_BLOCKS`
ainsi que `MAX_EVM_WINDOW_TXS` exportent les bornes.

## Précompilés

QoreChain expose des précompilés appelables par contrat à des adresses fixes. L'espace de noms
`precompiles` fournit des liaisons typées, et les adresses ainsi que les ABI sont
exportés.

> **Pas encore actifs.** Les précompilés QoreChain sont compilés dans le nœud mais
> pas encore activés sur le mainnet (`qorechain-vladi`) ni sur le testnet
> (`qorechain-diana`) : un appel renvoie des données vides, de sorte que ces assistants lèvent
> aussi une erreur sur les réseaux publics aujourd'hui. Voir
> [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).

| Précompilé | Fonction | Adresse |
| --- | --- | --- |
| Pont inter-VM | (routage du pont) | `0x0000000000000000000000000000000000000901` |
| Vérification PQC | `pqcVerify` | `0x0000000000000000000000000000000000000A01` |
| Statut de clé PQC | `pqcKeyStatus` | `0x0000000000000000000000000000000000000A02` |
| Score de risque QCAI | `aiRiskScore` | `0x0000000000000000000000000000000000000B01` |
| Vérification d'anomalie QCAI | `aiAnomalyCheck` | `0x0000000000000000000000000000000000000B02` |
| Paramètres de consensus | `rlConsensusParams` | `0x0000000000000000000000000000000000000C01` |

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

Les ABI des précompilés sont exportés sous les noms `IQORE_PQC_ABI`, `IQORE_AI_ABI`, et
`IQORE_CONSENSUS_ABI`.

> Lorsqu'un précompilé n'est pas actif (aujourd'hui : tous les réseaux publics), ou sur un nœud
> sans les précompilés QoreChain, ces appels lèvent une erreur « feature not present ».
> Gérez cela appel par appel.

Voir l'[exemple](/sdk/examples) `evm-precompile` pour une version exécutable.
