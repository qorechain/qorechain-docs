---
slug: /sdk/examples
title: Örnekler
sidebar_label: Örnekler
sidebar_position: 7
---

# Örnekler

Çalıştırılabilir yedi TypeScript örneği, SDK monorepo'sunun
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
dizininde yer alır. Her klasör, kendi `README.md`, `.env.example` ve tek bir
`index.ts` dosyasına sahip, kendi kendine yeterli bir workspace paketidir.
Uç noktaları ve mnemonic'leri ortam değişkenlerinden, makul localhost
varsayılanlarıyla okurlar ve ağa bağımlı olanlar, ulaşılabilir bir düğüm
bulunmadığında bir ipucuyla zarif bir şekilde başarısız olur.

Depo kökünden bir kez kurun, ardından herhangi bir örneği çalıştırın:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Yalnızca test mnemonic'leri veya oluşturulmuş anahtarlar kullanın. Gerçek
> gizli bilgileri asla commit etmeyin.

Aşağıdaki kod parçacıkları, her örneğin `index.ts` dosyasından
yoğunlaştırılmıştır. Tam, çalıştırılabilir programlar için bağlantılı kaynağa
bakın.

## connect-and-query

Bir istemci oluşturun ve genel zincir durumunu okuyun — yerel bir banka bakiyesi
ve toplu tokenomics anlık görüntüsü. Ulaşılabilir bir düğüme ihtiyaç duyar.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    rest: process.env.QORE_REST_URL ?? "http://localhost:1317",
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const balances = await client.rest.getAllBalances(address);
const overview = await client.qor.getTokenomicsOverview();
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

Bir mnemonic'ten yerel bir (`qor1...`) hesap türetin ve bir QOR transferi
yayınlayın: türet → imzala → simüle et → ücret tahmin et → `bankSend`.
Ulaşılabilir bir konsensüs RPC'sinin yanı sıra REST ve fonlanmış bir hesaba
ihtiyaç duyar.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  toBase,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, prefix);

const amount = [{ denom: baseDenom, amount: toBase("1.5") }]; // "1500000" uqor

const tx = await client.connectTx(signer);
const gasEstimate = await tx.simulate(messages);
const fee = await client.fees.estimate("normal");
const result = await tx.bankSend(recipient, amount, { fee });
console.log(result.transactionHash);
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

`@qorechain/svm` kullanarak, QoreChain'in Solana uyumlu (SVM) çalışma zamanında
bir memo talimatıyla bir SOL transferi oluşturun. İşlemi çevrimdışı olarak
oluşturur ve yazdırır; göndermek için ulaşılabilir bir SVM JSON-RPC ve fonlanmış
bir hesap gerekir.

```ts
import { deriveSvmAccount } from "@qorechain/sdk";
import {
  createSvmClient,
  svmKeypairFromSecretKey,
  createMemoInstruction,
} from "@qorechain/svm";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const account = await deriveSvmAccount(mnemonic);
const keypair = svmKeypairFromSecretKey(account.secretKey);

const client = createSvmClient({ endpoints: { svmRpc } });

const lamports = Math.round(0.01 * LAMPORTS_PER_SOL);
const tx = client.buildTransferSol({ from: keypair, to: recipient, lamports });
tx.add(createMemoInstruction("hello from @qorechain/svm", [keypair.publicKey]));
// To broadcast: client.sendTransaction(tx, [keypair])
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

Salt okunur QoreChain precompile'larını çağırmak ve bir ERC-20 bakiyesini okumak
için `@qorechain/evm` (viem üzerinde ince bir katman) kullanın. EVM zincir kimliği
`eth_chainId` aracılığıyla otomatik olarak algılanır. Precompile'ları olmayan bir
düğümde bu çağrılar "feature not present" hatası fırlatır ve her çağrı için ayrı
ayrı raporlanır.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

ML-DSA-87 (Dilithium-5, FIPS 204) ile kuantum sonrası imzalama. **Tamamen
çevrimdışı çalışır — düğüm gerektirmez.** Bölüm 1 bir mesajı imzalar ve doğrular
(bir kurcalama kontrolüyle); bölüm 2, hem klasik bir secp256k1 imzasını hem de
ML-DSA-87 imzasını bir `PQCHybridSignature` uzantısı olarak taşıyan hibrit bir
işlem oluşturur, ardından PQC yarısını yerel olarak doğrular.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  buildHybridTx,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("QoreChain is quantum-safe");
const signature = pqcSign(keypair.secretKey, message);
const valid = pqcVerify(keypair.publicKey, message, signature);

const built = await buildHybridTx({
  registry,
  signer,
  pqcKeypair,
  messages,
  fee: { amount: [{ denom: "uqor", amount: "5000" }], gas: "200000" },
  chainId: "qorechain-diana",
  accountNumber: 0,
  sequence: 0,
  includePqcPublicKey: true, // embed the key for auto-registration on first use
});
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

Dağıtılmış bir CosmWasm sözleşmesine karşı salt okunur bir akıllı sorgu
çalıştırın. Ulaşılabilir bir konsensüs RPC'sine ve dağıtılmış bir sözleşme
adresine ihtiyaç duyar.

```ts
import {
  createClient,
  queryContractSmart,
  getContractInfo,
} from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: { rpc: process.env.QORE_RPC_URL ?? "http://localhost:26657" },
});

const cw = await client.cosmwasm(); // read-only, memoized on the client
const info = await getContractInfo(cw, contract);
const result = await queryContractSmart(cw, contract, { token_info: {} });
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

Tokenomics durumunu, EVM JSON-RPC uç noktası üzerinden sunulan tipli `qor_*`
JSON-RPC ad alanı (`client.qor`) aracılığıyla okuyun. Üç okuma bağımsızdır, bu
nedenle diğerleri kullanılamasa bile her biri raporlanır.

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "testnet",
  endpoints: {
    evmRpc: process.env.QORE_EVM_RPC_URL ?? "http://localhost:8545",
  },
});

const burn = await client.qor.getBurnStats();        // qor_getBurnStats
const xqore = await client.qor.getXqorePosition(address); // qor_getXQOREPosition
const inflation = await client.qor.getInflationRate(); // qor_getInflationRate
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)
