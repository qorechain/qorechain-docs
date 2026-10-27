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

## EVM yetkilendirme penceresi (zincir v3.2.0'dan beri) {#evm-window}

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

SDK **0.8.2 veya daha yenisiyle** koddan bir pencere açabilirsiniz (**0.9.0**, aşağıdaki
kapsam seçeneklerini ekler). Anahtarın kaydedilmesi (bir kez)
[Kuantuma dayanıklı](/sdk/guides/quantum-safe) sayfasında
açıklanmıştır; aşağıdaki örnek bundan sonra birleşik bir eth-native hesap için bir
pencere açar (`npm i
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

### Bir pencerenin kapsamını daraltın (zincir v3.2.3'ten beri, SDK 0.9.0) {#evm-window-scope}

Bir pencere açılırken daraltılabilir: `nativeOnly`, yalnızca yerel QOR'un düz
transferlerini kabul eder (calldata yok, sözleşme oluşturma yok, kod taşıyan alıcı yok,
EIP-7702 yetkilendirmesi yok); `allowedTargets` ise yalnızca alıcısı listelenmiş en
fazla 16 `0x` adresinden biri olan işlemleri kabul eder (yinelenen adres olmaz;
sözleşme oluşturma reddedilir). İkisi de yeni mesaj alanlarıdır: v3.2.3'ün altındaki
bir düğüm, ikisinden biri ayarlandığında işlemin tamamını reddeder; bu yüzden bunları
yalnızca v3.2.3'ü uygulamış bir ağda ayarlayın (her iki genel ağ da uygulamıştır).
`fetchEvmWindow` ikisini de geri okur (`nativeOnly`, `allowedTargets`; v3.2.3'ten
önce `false` ve boş okunurlar). Yalnızca QOR göndermek için açılan bir pencerede
`nativeOnly` tercih edin.

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

### EIP-7702 onayı (zincir v3.2.2'den beri, SDK 0.9.0) {#evm-delegation-consent}

Bir tip-4 (EIP-7702) işlemi, ancak yetkilendirmesi yürürlüğe giren her hesap, hibrit
imzalı bir `MsgAuthorizeEVMDelegation` ile tam olarak o delegeye kuantum sonrası bir
onay verdikten sonra kabul edilir. Onay, delegasyonu kuran işlem tarafından tüketilir
ve belirlediğiniz `blocks` (1 ila 17,280) sonrasında sona erer; delege olarak sıfır
adres, temizlemeye onay verir. SDK mesajları oluşturur ve onayı, yetkilendirme
demetinin taşıması gereken nonce dahil, geri okur:

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

`classifyEvmDelegationRejection(err)`, EVM şeridi bir delegasyonu reddettiğinde
`"no-consent"` veya `"invalid"` döndürür. Onay sorgusu zincir v3.2.2 veya daha yenisini
gerektirir. Zincir düzeyindeki kurallar
[EIP-7702 delegasyonları](/architecture/post-quantum-security#eip-7702) sayfasındadır;
CLI biçimleri `qorechaind tx pqc authorize-evm-delegation` ve `clear-evm-delegation`'dır.

0.9.0 öncesi sürümler yalnızca kapsamsız pencereyi oluşturur (kapsamsız bir pencere
her iki ağda da hâlâ çalışır) ve onay oluşturucularına sahip değildir; orada
[EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window)
sayfasındaki CLI biçimlerini kullanın.

## Ön derlemeler

QoreChain, sabit adreslerde sözleşmeden çağrılabilir ön derlemeler tanımlar. `precompiles`
ad alanı tipli bağlamalar sağlar ve adresler ile ABI'ler dışa aktarılır.

> **Mainnet'te etkin değil; testnet'te üçü etkin.** QoreChain ön derlemeleri düğüme
> derlenmiştir ancak hiçbiri mainnet'te (`qorechain-vladi`) etkinleştirilmemiştir.
> Testnet'te (`qorechain-diana`) `active_static_precompiles` listesi
> `0x…0A01` (PQC verify), `0x…0A02` (PQC key status) ve `0x…0C01` (consensus
> params) adreslerini içerir (27 Ekim 2026'da kontrol edildi); AI çifti (`0x…0B01`, `0x…0B02`)
> ve cross-VM köprüsü (`0x…0901`) her iki ağda da etkin değildir. Etkin olmayan bir
> adrese yapılan çağrı boş veri döndürür, bu nedenle bu yardımcılar hata fırlatır. Bkz.
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

Ön derleme ABI'leri `IQORE_PQC_ABI`, `IQORE_AI_ABI` ve
`IQORE_CONSENSUS_ABI` olarak dışa aktarılır.

> Bir ön derlemenin etkin olmadığı yerlerde (mainnet: hepsi; testnet: AI çifti ve
> cross-VM köprüsü) veya
> QoreChain ön derlemeleri olmayan bir düğümde, bu çağrılar bir "feature not
> present" hatası fırlatır. Bunu çağrı başına ele alın.

Çalıştırılabilir bir sürüm için `evm-precompile` [örneğine](/sdk/examples) bakın.
