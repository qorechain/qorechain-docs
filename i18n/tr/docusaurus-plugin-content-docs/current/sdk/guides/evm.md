---
slug: /sdk/guides/evm
title: EVM Kılavuzu
sidebar_label: EVM
sidebar_position: 1
---

# EVM kılavuzu

`@qorechain/evm`, QoreChain EVM Engine için [viem](https://viem.sh) üzerine ince,
tip güvenli bir adaptördür. Bir EVM istemcisini yeniden uygulamaz — viem bir eş
bağımlılıktır. Zincir farkındalıklı bir istemci fabrikası (EVM zincir kimliği
otomatik algılamayla), ERC-20 yardımcıları, sözleşme dağıtım/çağrı sarmalayıcıları ve
QoreChain'in EVM ön derlemeleri için tipli bağlamalar ekler.

```bash
npm i @qorechain/evm viem
```

## Bir istemci oluşturun

`createEvmClient`, viem ile desteklenen bir istemci paketi döndürür. `chainId`
geçmediğiniz sürece EVM zincir kimliğini `eth_chainId` üzerinden otomatik algılar.

```ts
import { createEvmClient } from "@qorechain/evm";

const client = await createEvmClient({
  endpoints: { evmRpc: "https://evm-testnet.qore.host" }, // mainnet: https://evm.qore.host
});

console.log(await client.getChainId());
// client.publicClient — a viem PublicClient for reads
```

Ayrıca doğrudan bir `rpcUrl` (`endpoints` ile karşılıklı dışlayıcı), WebSocket için
bir `wsUrl` / `endpoints.evmWs` (testnet'te `wss://evm-ws-testnet.qore.host`),
açık bir `chainId` ve `decimals`
(varsayılan olarak 18, QOR için EVM kuralı — Cosmos `uqor` tabanı olan 10^6'dan
farklı) geçebilirsiniz.

Özel bir anahtardan bir EVM imzalama hesabı türetin:

```ts
import { evmAccountFromPrivateKey } from "@qorechain/evm";

const account = evmAccountFromPrivateKey("0x...");
```

## ERC-20 yardımcıları

`erc20` ad alanı (ve tek tek işlevler) standart ERC-20 çağrılarını sarar.
Okumalar bir viem genel istemcisi alır; yazmalar bir cüzdan istemcisi alır.

```ts
import { erc20 } from "@qorechain/evm";

const bal = await erc20.balanceOf(client.publicClient, token, account);
const meta = await erc20.metadata(client.publicClient, token); // Erc20Metadata
const allowed = await erc20.allowance(client.publicClient, token, owner, spender);

// writes (need a wallet client)
// await erc20.transfer(walletClient, token, to, amount);
// await erc20.approve(walletClient, token, spender, amount);
```

viem'i doğrudan çağırmayı tercih ederseniz, ham ABI `ERC20_ABI` olarak dışa aktarılır.

## Sözleşmeler

Genel dağıtım ve çağrı sarmalayıcıları:

```ts
import { deployContract, readContract, writeContract } from "@qorechain/evm";

// const address = await deployContract(walletClient, { abi, bytecode, args });
// const value = await readContract(client.publicClient, { address, abi, functionName, args });
// const hash = await writeContract(walletClient, { address, abi, functionName, args });
```

## EVM yetkilendirme penceresi (zincir v3.2.0) {#evm-window}

Zincir sürümü **v3.2.0**'dan itibaren (mainnet'te 2,981,742. bloktan, testnet'te
5,920,000. bloktan), EVM şeridi bir işlemi yalnızca **kayıtlı bir ML-DSA-87 anahtarı**
ve **açık bir yetkilendirme penceresi** olan bir hesaptan kabul eder. Okumalar
(`eth_call`, bakiyeler, makbuzlar) ve gaz tahmini bunlar olmadan da çalışır; MetaMask,
viem, ethers, Hardhat ve Foundry gibi cüzdanlar ve kitaplıklar eskisi gibi imzalar.
Değişen şey, kuantum sonrası yetkilendirmenin işlemden *önce*, hibrit imzalı bir
Native şerit mesajı olarak gönderilmesidir. Zincir düzeyindeki kurallar, sınırlar,
CLI biçimleri ve ret kodları
[EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window)
sayfasındadır.

SDK **0.8.2 veya daha yenisiyle** koddan bir pencere açabilirsiniz. Anahtarın
kaydedilmesi (bir kez) [Kuantum güvenli](/sdk/guides/quantum-safe) sayfasında
açıklanmıştır; aşağıdaki örnek bundan sonra birleşik bir eth-native hesap için bir
pencere açar (`npm i @cosmjs/stargate`):

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

Bir pencere açmak hesabın nonce değerini ilerletir (tek bir kimlik: Cosmos sequence
değeri EVM nonce'udur); bu yüzden EVM nonce'unu pencere açıldıktan **sonra** okuyun
ve EVM işlemini ancak o zaman imzalayın. `maxValue`, her işlemin değerini **artı**
azami ücretini (gaz limiti çarpı ücret üst sınırı) sınırlar: 112.5 gwei'de 21,000 gazlı
1,000 uqor'luk bir transfer pencereden 3,363 uqor tüketir. Bir pencereyi yalnızca
kullanıcı istediğinde açın; asla otomatik olarak açmayın.

EVM şeridi bir işlemi reddettiğinde, `classifyEvmWindowRejection(err)` size nedenini
söyler:

```ts
try {
  // send the EVM transaction (viem, ethers, ...)
} catch (err) {
  const why = classifyEvmWindowRejection(err);
  // "no-pqc-key" | "no-window" | "exhausted" | "invalid" | undefined
}
```

`closeEvmWindowMsg` karşılık gelen kapatma mesajını oluşturur; `MAX_EVM_WINDOW_BLOCKS`
ve `MAX_EVM_WINDOW_TXS` ise sınırları dışa aktarır.

## Ön derlemeler

QoreChain, sabit adreslerde sözleşmeden çağrılabilir ön derlemeler tanımlar. `precompiles`
ad alanı tipli bağlamalar sağlar ve adresler ile ABI'ler dışa aktarılır.

> **Henüz etkin değil.** QoreChain ön derlemeleri düğüme derlenmiştir ancak
> mainnet (`qorechain-vladi`) veya testnet (`qorechain-diana`) üzerinde henüz
> etkinleştirilmemiştir: bir çağrı boş veri döndürür, bu nedenle bu yardımcılar
> bugün herkese açık ağlarda da hata fırlatır. Bkz.
> [EVM Ön Derlemeleri: Ağ durumu](/developer-guide/evm-precompiles#network-status).

| Ön derleme | İşlev | Adres |
| --- | --- | --- |
| Cross-VM Bridge | (köprü yönlendirme) | `0x0000000000000000000000000000000000000901` |
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

Ön derleme ABI'leri `IQORE_PQC_ABI`, `IQORE_AI_ABI` ve
`IQORE_CONSENSUS_ABI` olarak dışa aktarılır.

> Bir ön derlemenin etkin olmadığı yerlerde (bugün: her herkese açık ağ) veya
> QoreChain ön derlemeleri olmayan bir düğümde, bu çağrılar bir "feature not
> present" hatası fırlatır. Bunu çağrı başına ele alın.

Çalıştırılabilir bir sürüm için `evm-precompile` [örneğine](/sdk/examples) bakın.
