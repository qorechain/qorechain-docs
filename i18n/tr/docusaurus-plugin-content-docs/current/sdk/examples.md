---
slug: /sdk/examples
title: Örnekler
sidebar_label: Örnekler
sidebar_position: 7
---

# Örnekler

Çalıştırılabilir TypeScript örnekleri, SDK monorepo'sunun
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
dizininde bulunur — aşağıdakilerin yanı sıra `ai-preflight`,
`cross-vm-call`, `react-dapp`, `register-sidechain`, `rollup-lifecycle`,
`amm-swap`, `connect-keplr`, `evm-nft` ve `subscribe-blocks`. Her klasör,
kendi `README.md`, `.env.example` dosyaları ve tek bir `index.ts` içeren,
kendi kendine yeten bir workspace paketidir. Uç noktaları ve mnemonic'leri
makul localhost varsayılanlarıyla ortam değişkenlerinden okurlar; ağa bağımlı
olanlar, erişilebilir bir düğüm yoksa bir ipucu vererek düzgün şekilde
sonlanır.

Depo kökünden bir kez kurulum yapın, ardından herhangi bir örneği çalıştırın:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> Yalnızca test mnemonic'leri veya üretilmiş anahtarlar kullanın. Gerçek gizli bilgileri asla commit etmeyin.

Aşağıdaki kod parçaları, her örneğin `index.ts` dosyasından özetlenmiştir.
Tam ve çalıştırılabilir program için bağlantısı verilen kaynağa bakın.

## connect-and-query

Bir istemci oluşturun ve herkese açık zincir durumunu okuyun — yerel bir bank
bakiyesi ve toplu tokenomik anlık görüntüsü. Erişilebilir bir düğüm gerektirir.

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

Bir mnemonic'ten yerel (`qor1...`) bir hesap türetin ve bir QOR transferi
yayınlayın: türet → imzala → simüle et → ücreti tahmin et → `bankSend`.
Erişilebilir bir konsensüs RPC'si ile REST ve fonlanmış bir hesap gerektirir.

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

`@qorechain/svm` kullanarak QoreChain'in Solana uyumlu (SVM) çalışma zamanında
memo talimatı içeren bir SOL transferi oluşturun. İşlemi çevrimdışı oluşturur
ve yazdırır; gönderim için erişilebilir bir SVM JSON-RPC'si ve fonlanmış bir
hesap gerekir.

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

Salt okunur QoreChain precompile'larını çağırmak ve bir ERC-20 bakiyesini
okumak için `@qorechain/evm` paketini (viem üzerinde ince bir katman) kullanın.
EVM zincir kimliği `eth_chainId` aracılığıyla otomatik olarak algılanır.
Precompile'ların bulunmadığı bir düğümde bu çağrılar, her çağrı için ayrı ayrı
raporlanan "feature not present" hatası fırlatır.

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

ML-DSA-87 (Dilithium-5, FIPS 204) ile post-kuantum imzalama. **Tamamen
çevrimdışı çalışır — düğüm gerekmez.** 1. bölüm bir mesajı imzalar ve doğrular
(kurcalama kontrolüyle birlikte); 2. bölüm, hem klasik bir secp256k1 imzasını
hem de bir `PQCHybridSignature` uzantısı olarak ML-DSA-87 imzasını taşıyan
hibrit bir işlem oluşturur, ardından PQC yarısını yerel olarak doğrular.

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

Dağıtılmış bir CosmWasm sözleşmesine karşı salt okunur bir smart sorgu
çalıştırın. Erişilebilir bir konsensüs RPC'si ve dağıtılmış bir sözleşme
adresi gerektirir.

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

Tokenomik durumunu, EVM JSON-RPC uç noktası üzerinden sunulan tipli `qor_*`
JSON-RPC ad alanı (`client.qor`) aracılığıyla okuyun. Üç okuma birbirinden
bağımsızdır; bu nedenle diğerleri kullanılamıyor olsa bile her biri ayrı ayrı
raporlanır.

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

## unified-wallet

**Birleşik eth-native bir hesap** türetin (SDK 0.6.0): tek bir `eth_secp256k1`
anahtarı, ortak tek bir bakiyeyle üç QoreChain adresinin tümü olarak sunulur;
buna adres bağlantılı ML-DSA-87 anahtar çifti de eşlik eder. Tamamen
çevrimdışı çalışır.

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  unifiedAccountFromSeed,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
console.log(account.cosmos); // "qor1…"  — Native lane
console.log(account.evm);    // "0x…"    — EVM lane
console.log(account.svm);    // base58   — SVM lane (same 20 bytes)

// Decode any one encoding into all three.
const all = qoreAddresses({ evm: account.evm });

// Or derive from a raw 32-byte seed instead of a mnemonic.
const fromSeed = unifiedAccountFromSeed(seed32);
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

Native authenticator hattında, relayer tarafından gönderilen bir
`MsgExecuteCosmos` oluşturun (SDK 0.7.0, zincir v3.1.85): Phantom tarzı bir
ed25519 anahtarı, alan ayrımlı (domain-separated) kimlik doğrulama özetini
imzalar ve ortaya çıkan mesaj, bir relayer'ın yayınlamasına hazır hale gelir
(ücretleri relayer öder; harici anahtar hiçbir zaman bir ML-DSA eş-imzası
üretmez). Kuru çalıştırma — düğüm gerekmez.

```ts
import {
  buildPhantomExecuteCosmos,
  cosmosAuthSignBytes,
  qorechainRegistry,
} from "@qorechain/sdk";

// Show the exact 32-byte digest the wallet signs (byte-exact vs the chain).
const digest = cosmosAuthSignBytes({ chainId, account, pubkey, to, amount, nonce });

// Build the relayer-ready message: the Phantom wallet signs the digest.
const msg = await buildPhantomExecuteCosmos({
  wallet,                 // window.solana in a browser
  relayer,                // submits + pays fees (a DIFFERENT account)
  chainId,
  account,                // the canonical PQC-required owner
  to,
  amount: "100uqor",
  nonce,                  // the per-authenticator sequence
});

// Prove it encodes via the default registry (what the relayer broadcasts).
const bytes = qorechainRegistry().encode(msg);
```

[Kaynak](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· Ayrıntılı anlatım:
[Authenticator'lar ve yetkilendirilmiş harcama](/sdk/guides/authenticators)
