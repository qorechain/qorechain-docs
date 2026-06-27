---
slug: /sdk/examples
title: أمثلة
sidebar_label: أمثلة
sidebar_position: 7
---

# أمثلة

توجد سبعة أمثلة TypeScript قابلة للتشغيل في دليل
[`examples/`](https://github.com/qorechain/qorechain-sdk/tree/main/examples)
ضمن مستودع SDK الأحادي (monorepo). كل مجلد هو حزمة مساحة عمل قائمة بذاتها
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

أنشئ عميلًا واقرأ حالة السلسلة العامة — رصيد bank أصلي ولقطة
التوكينوميكس المجمّعة. يتطلب عقدة يمكن الوصول إليها.

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

اشتقّ حسابًا أصليًا (`qor1...`) من عبارة استذكارية وبثّ تحويل QOR:
اشتقاق → توقيع → محاكاة → تقدير الرسوم → `bankSend`. يتطلب
RPC إجماع يمكن الوصول إليه بالإضافة إلى REST وحساب مموّل.

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

أنشئ تحويل SOL مع تعليمة memo على بيئة تشغيل QoreChain المتوافقة مع Solana
(SVM)، باستخدام `@qorechain/svm`. يبني المعاملة ويطبعها
دون اتصال؛ يتطلب الإرسال JSON-RPC من نوع SVM يمكن الوصول إليه وحسابًا ممولًا.

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

استخدم `@qorechain/evm` (طبقة رقيقة فوق viem) لاستدعاء precompiles
للقراءة فقط في QoreChain وقراءة رصيد ERC-20. يُكتشف معرّف سلسلة EVM تلقائيًا عبر
`eth_chainId`. على عقدة بدون precompiles، تُطلق تلك الاستدعاءات "feature not
present"، ويُبلَّغ عنها لكل استدعاء على حدة.

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

التوقيع ما بعد الكمومي باستخدام ML-DSA-87 (Dilithium-5، FIPS 204). **يعمل بالكامل
دون اتصال — لا حاجة لعقدة.** الجزء 1 يوقّع رسالة ويتحقق منها (مع فحص للعبث)؛
الجزء 2 يبني معاملة هجينة تحمل توقيع secp256k1 الكلاسيكي
وتوقيع ML-DSA-87 معًا كامتداد `PQCHybridSignature`، ثم
يتحقق من النصف PQC محليًا.

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

شغّل استعلامًا ذكيًا للقراءة فقط على عقد CosmWasm منشور. يتطلب
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

اقرأ حالة التوكينوميكس عبر مساحة الأسماء المُنمَّطة `qor_*` في JSON-RPC
(`client.qor`)، المقدَّمة عبر نقطة نهاية EVM JSON-RPC. القراءات الثلاث
مستقلة، لذا يُبلَّغ عن كل منها حتى وإن كانت الأخرى غير متوفرة.

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
