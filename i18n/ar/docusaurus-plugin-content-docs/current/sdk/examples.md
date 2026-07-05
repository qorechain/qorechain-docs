---
slug: /sdk/examples
title: أمثلة
sidebar_label: أمثلة
sidebar_position: 7
---

# أمثلة

توجد أمثلة TypeScript القابلة للتشغيل في دليل
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
ضمن مستودع SDK الأحادي (monorepo) — الأمثلة أدناه بالإضافة إلى `ai-preflight`
و`cross-vm-call` و`react-dapp` و`register-sidechain` و`rollup-lifecycle`
و`amm-swap` و`connect-keplr` و`evm-nft` و`subscribe-blocks`. كل مجلد هو
حزمة مساحة عمل قائمة بذاتها
لها ملف `README.md` الخاص بها، و`.env.example`، وملف `index.ts` واحد. تقرأ هذه الأمثلة
نقاط النهاية والعبارات الاستذكارية (mnemonics) من متغيرات البيئة مع قيم افتراضية معقولة على localhost،
وتلك المعتمدة على الشبكة تفشل بسلاسة مع تلميح عندما لا تتوفر عقدة
يمكن الوصول إليها.

من جذر المستودع، ثبّت مرة واحدة، ثم شغّل أي مثال:

```bash
pnpm install
pnpm --filter @qorechain/example-pqc-hybrid-sign start
```

> استخدم فقط العبارات الاستذكارية الاختبارية أو المفاتيح المولّدة. لا تُودِع أبدًا أسرارًا حقيقية.

المقتطفات أدناه مكثّفة من ملف `index.ts` الخاص بكل مثال. راجع
المصدر المرتبط للحصول على البرنامج الكامل القابل للتشغيل.

## connect-and-query

أنشئ عميلاً واقرأ حالة السلسلة العامة — رصيدًا مصرفيًا أصليًا (native) ولقطة
اقتصاد الرمز (tokenomics) المجمّعة. يتطلب عقدة يمكن الوصول إليها.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/connect-and-query)

## send-qor

اشتق حسابًا أصليًا (`qor1...`) من عبارة استذكارية وابثّ تحويل QOR:
اشتقاق ← توقيع ← محاكاة ← تقدير الرسوم ← `bankSend`. يتطلب
RPC إجماع يمكن الوصول إليه بالإضافة إلى REST وحساب مموَّل.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/send-qor)

## svm-transfer

ابنِ تحويل SOL مع تعليمة مذكرة (memo) على بيئة تشغيل QoreChain المتوافقة مع
Solana ‏(SVM)، باستخدام `@qorechain/svm`. يبني المعاملة ويطبعها
دون اتصال؛ أما الإرسال فيتطلب SVM JSON-RPC يمكن الوصول إليه وحسابًا مموَّلًا.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/svm-transfer)

## evm-precompile

استخدم `@qorechain/evm` (طبقة رقيقة فوق viem) لاستدعاء تجميعات QoreChain المسبقة
(precompiles) الخاصة بالقراءة فقط وقراءة رصيد ERC-20. يتم اكتشاف معرّف سلسلة EVM تلقائيًا عبر
`eth_chainId`. على عقدة لا تحتوي على التجميعات المسبقة، ترمي تلك الاستدعاءات الخطأ "feature not
present"، ويتم الإبلاغ عنه لكل استدعاء على حدة.

```ts
import { createEvmClient, precompiles, erc20 } from "@qorechain/evm";

const client = await createEvmClient({ endpoints: { evmRpc } });
console.log(`evm chain id: ${await client.getChainId()}`);

const params = await precompiles.rlConsensusParams(client.publicClient);
const status = await precompiles.pqcKeyStatus(client.publicClient, account);
const bal = await erc20.balanceOf(client.publicClient, token, account);
```

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/evm-precompile)

## pqc-hybrid-sign

التوقيع ما بعد الكمومي باستخدام ML-DSA-87 ‏(Dilithium-5، FIPS 204). **يعمل بالكامل
دون اتصال — لا يتطلب أي عقدة.** الجزء الأول يوقّع رسالة ويتحقق منها (مع فحص
للتلاعب)؛ والجزء الثاني يبني معاملة هجينة تحمل توقيع secp256k1 كلاسيكيًا
وتوقيع ML-DSA-87 معًا كامتداد `PQCHybridSignature`، ثم
يتحقق محليًا من الشق الخاص بـ PQC.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/pqc-hybrid-sign)

## cosmwasm-query

نفّذ استعلامًا ذكيًا للقراءة فقط على عقد CosmWasm منشور. يتطلب
RPC إجماع يمكن الوصول إليه وعنوان عقد منشور.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/cosmwasm-query)

## read-tokenomics

اقرأ حالة اقتصاد الرمز عبر مساحة أسماء JSON-RPC المصنّفة الأنواع `qor_*`
(`client.qor`)، والمقدَّمة عبر نقطة نهاية EVM JSON-RPC. عمليات القراءة الثلاث
مستقلة، لذا يتم الإبلاغ عن كل واحدة حتى لو كانت الأخريات غير متاحة.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/read-tokenomics)

## unified-wallet

اشتق **حسابًا موحّدًا أصلي الإيثيريوم (eth-native)** ‏(SDK 0.6.0): مفتاح `eth_secp256k1` واحد
يُعرض بجميع عناوين QoreChain الثلاثة مع رصيد واحد مشترك، بالإضافة إلى
زوج مفاتيح ML-DSA-87 المرتبط بالعنوان. يعمل بالكامل دون اتصال.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/unified-wallet)

## authenticator-spend

ابنِ رسالة `MsgExecuteCosmos` تُقدَّم عبر مُرحِّل (relayer) على مسار المصادِقات الأصلي
(SDK 0.7.0، السلسلة v3.1.85): يوقّع مفتاح ed25519 على نمط Phantom
ملخّص المصادقة المفصول بالنطاق (domain-separated)، وتصبح الرسالة الناتجة جاهزة كي يبثّها
المُرحِّل (المُرحِّل يدفع الرسوم؛ ولا يُنتج المفتاح الخارجي أبدًا توقيعًا مشتركًا
بـ ML-DSA). تشغيل تجريبي جاف — لا يتطلب أي عقدة.

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

[المصدر](https://github.com/qorechain/qorechain-sdk/tree/main/examples/authenticator-spend)
· الشرح الكامل:
[المصادِقات والإنفاق المفوَّض](/sdk/guides/authenticators)
