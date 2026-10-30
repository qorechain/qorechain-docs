---
slug: /sdk/concepts/accounts-pqc
title: Hesaplar ve PQC İmzalama
sidebar_label: Hesaplar ve PQC
sidebar_position: 2
---

# Hesaplar ve PQC imzalama

QoreChain hesapları tek bir BIP-39 anımsatıcı ifadesinden (mnemonic) türetilir.
Her ikisi de tam olarak desteklenen iki hesap modeli vardır:

- **Hat başına HD türetme (eski/varsayılan)** — aynı anımsatıcı ifade, bağımsız
  türetme yolları üzerinden bir native (coin type 118), bir EVM (coin type 60)
  ve bir SVM (coin type 501) hesabı üretir. Üç anahtar, üç adres.
- **Birleşik eth-native hesaplar** (SDK 0.6.0, zincir v3.1.83) — TEK bir
  `eth_secp256k1` anahtarı, üç adres kodlamasının tümüyle gösterilen TEK bir
  20 baytlık kimliktir ve tek bir ortak bakiyeye sahiptir. Bkz.
  [Birleşik hesaplar](#unified-accounts).

## HD türetme (eski/varsayılan, coin type 118)

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

Anımsatıcı ifade, herhangi bir anahtar türetilmeden önce doğrulanır (kelimeler
**ve** sağlama toplamı); böylece bir yazım hatası, sessizce yanlış bir hesap
üretmek yerine hata fırlatır. `validateMnemonic(mnemonic)` ile açıkça
doğrulama yapabilirsiniz.

### Türetme şemaları

| Tür | Eğri | Yol | Adres |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | `ripemd160(sha256(pubkey))` değerinin bech32 `qor` kodlaması |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | 32 baytlık genel anahtarın base58 kodlaması |

Ek hesaplar türetmek için bir hesap indeksi geçirin. TypeScript'te:

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

Python/Go/Rust'ta indeks konumsal bir argümandır
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Bilinen-yanıt notu

Türetme şemaları deterministiktir ve dört SDK'nın tamamında bilinen-yanıt
(known-answer) testleriyle kapsanır; bu nedenle aynı anımsatıcı ifade
TypeScript, Python, Go ve Rust'ta birebir aynı adresleri üretir. Bu sayede bir
dilde türetip başka bir dilde doğrulama yapabilirsiniz.

> Bu hat başına türetme (coin type 118'de `deriveNativeAccount`, artı
> `deriveEvmAccount` / `deriveSvmAccount`) **eski/varsayılan** modeldir ve
> desteklenmeye devam eder, değişmemiştir. Aşağıdaki birleşik hesaplar ek,
> isteğe bağlı (opt-in) bir kimlik modelidir.

## Birleşik hesaplar (eth-native) {#unified-accounts}

SDK **0.6.0** sürümünden (zincir v3.1.83) itibaren
`deriveUnifiedAccount(mnemonic, index = 0)`, Ethereum HD yolu
`m/44'/60'/0'/0/{index}` üzerinde TEK bir `eth_secp256k1` anahtarı türetir;
bu anahtarın 20 adres baytı (`keccak256(pubkey)[12:]`), üç farklı şekilde
gösterilen AYNI kimliktir:

| Hat | Kodlama |
| --- | --- |
| Native | `qor` önekiyle bech32 (`qor1…`) |
| EVM | `0x` + EIP-55 karışık büyük/küçük harf sağlama toplamlı onaltılık |
| SVM | 20 baytın sağdan 12 sıfır baytla doldurulmuş halinin (32 bayt) base58 kodlaması |

Üç adresten **herhangi birine** yapılan yatırma işlemi **tek** bir bakiyeye
düşer ve bu tek anahtar her hatta imzalayıcıdır (EVM hattında bir
[yetkilendirme penceresi](/sdk/guides/evm#evm-window) içinde; SVM işlem hattı
şu anda ağ genelinde devre dışıdır, dolayısıyla SVM bugün salt okunurdur):

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` aynı işlemi ham 32 baytlık bir secp256k1 özel
anahtarından yapar.

### PQC tohum türetmesi

Hesabın ML-DSA-87 anahtar çifti deterministik olarak ve **adrese bağlı**
şekilde türetilir:

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

dolayısıyla `{ address, mnemonic }` çiftinden kurtarılabilir ve QoreChain'in
tüm dil SDK'larında birebir aynıdır. (`unifiedAccountFromSeed` için anımsatıcı
ifade yuvası `"seed:" + hex(seed32)` değeridir.) SDK 0.8.3 sürümünden itibaren
`derivePqcCanonical(account, mnemonic)` önce `account` değerini küçük harfli
`qor1…` biçimine (`canonicalAccount`) çözer; böylece büyük harfli bir bech32
veya aynı hesabın `0x` biçimi de aynı anahtarı üretir. Her dilde aynı işlev
vardır (Python `derive_pqc_canonical`, Go `authenticator.DerivePQCCanonical`,
Rust `try_derive_pqc_canonical`, Java `Authenticator.derivePqcCanonical`; bkz.
[Hibrit imzalama kılavuzundaki tablo](/sdk/guides/quantum-safe#canonical-derivation)),
ve aynı `{ address, mnemonic }` hepsinde aynı anahtarı verir (Ekim 2026'da
TypeScript, Python, Go ve Rust için doğrulandı).

### Native hatta eth anahtarıyla gönderim

Birleşik bir hesap, Native yolu işlemlerini `eth_secp256k1` şemasıyla imzalar:
klasik imza, SignDoc baytlarının **keccak256** özeti üzerinde secp256k1'dir
(sha256 değil) ve `SignerInfo` genel anahtarı
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey` tür URL'sini kullanır. Hibrit yol
(`signHybridEth` veya varsayılan `signMode: "hybrid"` ile `EthNativeSigner`)
ayrıca ML-DSA-87 `PQCHybridSignature` uzantısını ekler; bu, canlı ağlarda
zorunludur.

İlk hibrit gönderimden önce iki şey gerekir. Birincisi, hesabın ML-DSA-87
anahtarı (bir kez) **kaydedilmiş** olmalıdır. Kayıt, klasik imzalı ve hibrit
kuraldan muaf tek işlemdir: onu `signMode: "classical"` ile imzalayın. Hesabın
`publicKey` değeri `0x` onaltılık bir dizgedir; `ecdsaPubkey` için onu bayta
çözün. İkincisi, imzalayıcının ağın hangi
[imza baytı biçimini](#sign-bytes-versions) doğruladığını ağa sorabilmesi için
imzalayıcıya `rest` verin (`qorechain-vladi` ve `qorechain-diana` üzerinde tahmin
etmek yerine hata fırlatır). SDK 0.8.1 veya sonrası (sahiplik kanıtı yardımcıları
için 0.9.0) ve `npm i @cosmjs/stargate` gerekir:

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

Daha alt düzey denetim için `signHybridEth(params)` / `signClassicalEth(params)`
birleştirilmiş `TxRaw` baytlarını ve imzalama çıktılarını döndürür;
`accountAuthInfo(baseAccount)` ise zincir üstü genel anahtarı `eth_secp256k1`
tür URL'sini kullanan bir protobuf `BaseAccount` değerinden `account_number` /
`sequence` alanlarını okur (bir REST JSON hesabının alanlarının önce
eşlenmesi gerekir; yukarıdaki `authInfo` bunu yapar).

:::caution Hibrit işlemler için SDK 0.6.1+ sürümüne yükseltin
SDK **0.6.1**, konsensüs açısından kritik bir kodlama hatasını düzeltti:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body uzantısı `Any.value` içine
JSON olarak serileştiriliyordu ve zincir **bu işlemleri CheckTx aşamasında
reddediyordu** (bir tx ayrıştırma hatası). Artık beş dilin tamamında protobuf
ile kodlanmaktadır (uzantı değeri `0x08` ile başlar). SDK ≤ 0.6.0 ile
oluşturulan her hibrit işlem — eth-native hat dahil — zincir üzerinde
reddedilir: 0.6.1 veya sonrasına yükseltin.
:::

### Phantom ve diğer harici cüzdanlar {#phantom}

:::danger SDK 0.8.0'da kaldırıldı
SDK 0.6.0 ile 0.7.0 arası `connectPhantomUnified()` ve `unifiedAccountFromPhantomSignature()` işlevlerini içeriyordu (0.8.0'da kaldırıldı; Python ve Rust'ta `unified_account_from_phantom_signature`, Go'da `unified.UnifiedAccountFromPhantomSignature`, Java'da `UnifiedAccounts.unifiedAccountFromPhantomSignature`). Bu işlevler bir hesabın harcama anahtarını, sabit `QoreChain unified account derivation v1` mesajı ve ardından cüzdanın base58 açık anahtarı üzerindeki Phantom imzasından türetiyordu.
ed25519 imzası deterministiktir ve herhangi bir web sitesi cüzdandan aynı mesajı imzalamasını isteyebilir; bu nedenle imzayı bir kez bile elde eden herkes hesabın secp256k1 ve ML-DSA anahtarlarını yeniden oluşturabilir. Her iki işlev artık hata fırlatır.

Bu yolla bir hesap oluşturduysanız, onu şimdiden ele geçirilmiş sayın: bir mnemonic ile yeni bir hesap oluşturun, fonları oraya taşıyın ve ardından Phantom'u yeni hesaba authenticator olarak bağlayın (aşağıya bakın). Eski hesap onarılamaz, çünkü adresi açığa çıkmış anahtara bağlıdır ve PQC anahtar rotasyonu yalnızca kuantum sonrası yarıyı değiştirir. SDK 0.8.2 veya üstünü kullanın.
:::

Bir Phantom (veya MetaMask) anahtarının bir hesaptan harcama yapabilmesi için **authenticator şeritlerini** kullanın: cüzdan anahtarını `MsgRegisterAuthenticator` ile kaydedin, ardından bir izin ve bir `SpendingRule` altında `MsgExecuteCosmos` / `MsgExecuteEVM` üzerinden kanonik PQC hesabından harcayın. Hesap, mnemonic'ten türetilen kendi anahtarlarını korur ve cüzdan anahtarı her an iptal edilebilir. Bkz. [Authenticator'lar ve devredilmiş harcama](/sdk/guides/authenticators). `abstractaccount` modülünün bu şeritleri sağladığını ve mainnet'te kapalı olduğunu unutmayın (`GET /qorechain/abstractaccount/v1/config` `enabled: false` gösterir; testnet'te etkindir); bu nedenle bir cüzdan anahtarı mainnet'te henüz bağlanamaz. O zamana kadar yeni mnemonic hesabını doğrudan kullanın.

## Kuantum sonrası kriptografi (PQC)

QoreChain, **ML-DSA-87** (Dilithium-5, FIPS 204) imzalarını destekler. SDK bu
temel işlevleri doğrudan sunar.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Dışa aktarılan uzunluk sabitleri (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) arabellek boyutlarını doğrulamanıza olanak tanır.

> Altta, PQC temel işlevleri [**qorechain-pqc**](/developer-guide/post-quantum-signing) kütüphanesinden gelir — denetlenmiş FIPS-204/203/202 uygulamalarını altı dilde (JavaScript/TypeScript, Rust, Go, C, Python, Java) tek tutarlı bir API arkasında saran, açık kaynaklı ve yalnızca standartlara dayalı kütüphane. SDK dışında ham temel işlevlere veya `hybridSignBytes` çerçevelemesine ihtiyaç duyduğunuzda doğrudan ona başvurun.

### Takılabilir imzalayıcılar

Bileşim (composition) için SDK; bir `Signer` soyutlaması, `PqcSigner` ve
`HybridSigner` uygulamaları ile bir `SignatureMode` türü (`"classical" | "pqc" |
"hybrid"`) sağlar. PQC imzalamayı temel işlevleri doğrudan çağırmak yerine kendi
akışınıza takmak istediğinizde bunları kullanın.

## Hibrit imzalama {#hybrid-signing}

**Hibrit** bir işlem hem klasik bir secp256k1 imzası hem de bir ML-DSA-87
imzası taşır; böylece klasik doğrulama altında geçerli kalırken kuantum
sonrası koruma kazanır. Kuantum sonrası kısım, işlem üzerinde bir
`PQCHybridSignature` uzantısı olarak taşınır.

:::caution Native yolda hibrit imzalama zorunludur
Zincir sürümü **v3.2.0** itibarıyla (mainnet v3.2.5, testnet v3.2.6 çalıştırır) ağ
varsayılanı `hybrid_signature_mode = required` ve
`allow_classical_fallback = false` şeklindedir. `buildHybridTx` /
`signAndBroadcastHybrid` üzerinden (`rest` geçirerek) hibrit imzalama — veya
birleşik eth-native hesaplar için `signHybridEth` / `EthNativeSigner` —
Native-yol işlemleri için **zorunludur**; yalnızca-klasik Native işlemler
zincir üzerinde reddedilir. EVM işlemleri ayrı bir hattır, ancak v3.2.0'dan
itibaren yalnızca kayıtlı bir ML-DSA-87 anahtarı olan ve açık bir
[yetkilendirme penceresi](/sdk/guides/evm#evm-window) bulunan bir hesaptan kabul
edilir.
:::

:::caution SDK ≤ 0.6.0 hibrit işlemleri reddedilir
0.6.1 sürümü, `PQCHybridSignature` uzantısının kodlamasını düzeltti
(JSON → protobuf, konsensüs açısından kritik). SDK 0.6.0 veya öncesiyle
oluşturulan hibrit işlemler, CheckTx aşamasında bir tx ayrıştırma hatasıyla
başarısız olur — 0.6.1+ sürümüne yükseltin.
:::

Coin type 118 hesabı için uçtan uca oluşturucu `signAndBroadcastHybrid`
işlevidir (yayınlamadan oluşturmak için `buildHybridTx`). Klasik imzalayıcıya,
hesabın ML-DSA-87 anahtar çiftine, hesap numarasına ve sequence değerine ve
`rest` adresine ihtiyaç duyar.
TypeScript'te coin type 118 hesabı için en kısa yol hibrit `TxClient`'tır
(SDK 0.9.0): bağlanırken anahtar çiftini geçin; her işlem hibrit imzalanır ve
`fee: "auto"` hibrit işlemin kendisini simüle eder (yalnızca kayıt klasik kalır):

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

Ücret, hesap numarası ve sequence üzerinde açık denetim için
`signAndBroadcastHybrid` kullanın (SDK 0.8.1 veya sonrası, `npm i @cosmjs/stargate`):

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### Zincir üstü ön koşul

Bir hibrit işlemin PQC doğrulamasından geçebilmesi için, imzalayanın PQC genel
anahtarı `MsgRegisterPQCKeyV2` ile (klasik imzalı, henüz anahtarı olmayan bir
hesap için hibrit kuraldan muaf) **kaydedilmiş** olmalıdır. SDK'nın
`ensurePqcRegistered` / `buildRegisterPqcKeyMsg` işlevleri, `qorechaind tx pqc
register-key` veya bir QoreChain cüzdanı bunu yapar. `includePqcPublicKey: true`
yalnızca anahtarı uzantıya gömer; anahtarı **kaydetmez** ve zincir bir anahtarı
ilk kullanımda kaydetmez. v3.2.3'ten beri zincir zayıf, dejenere ve yeniden
kullanılmış anahtarları reddeder ve isteğe bağlı bir sahiplik kanıtını (proof of
possession) kabul eder (bkz.
[Anahtar bütünlüğü kuralları](/architecture/post-quantum-security#key-integrity)).
SDK 0.9.0'da `ensurePqcRegistered`, ağ v3.2.3'ü uyguladıktan sonra kanıtı kendisi
ekler; `signProofOfPossession` / `verifyProofOfPossession` ise elle oluşturulan
kayıtlar için dışa aktarılır; 0.8.x oluşturucuları kanıtsız kaydeder, buna izin
verilir.

### Hangi imza baytı biçimi? {#sign-bytes-versions}

Bir hibrit işlemin ML-DSA-87 yarısı iki bayt biçiminden biri üzerinden
imzalanır ve bir ağ, herhangi bir yükseklikte bunlardan yalnızca birini
doğrular:

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0`, PQC uzantısı olmayan işlem gövdesi, `A` ise `AuthInfo` baytlarıdır.
`qorechain-vladi` ve `qorechain-diana` ikisi de **v2**'yi doğrular. Geçiş,
mainnet'te `v3.2.0`, testnet'te ise `v3.1.98` (ardından `v3.2.0`) yükseltme adı
altında kaydedildi; bu nedenle bir istemci **her iki** ad için de
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` adresini sorgulamalı ve
yüksekliklerden biri sıfırın üzerindeyse v2'yi kullanmalıdır. SDK bunu sizin
yerinize yapar: her hibrit oluşturucu `signBytesVersion` alır (varsayılan
`"auto"`, ya da `"v1"` / `"v2"`) ve bu iki zincirde `"auto"` ağın REST URL'sine
(`rest`) ihtiyaç duyar: tahmin etmek yerine hata fırlatır. Üst düzey yollar,
zincir imzayı `pqc` kodu 21 ile reddettiğinde yeniden çözümler ve bir kez
yeniden dener. Birim testlerinde, testin canlı bir düğüme bağımlı olmaması için
`signBytesVersion` değerini açıkça geçirin. Ayrıca bkz.
[Kod 21 sorun giderme](/developer-guide/post-quantum-signing#code-21).

### Hibrit işlem sözleşmesi (üst düzey)

İşlem, standart imza baytları (PQC uzantısını **hariç tutar**) üzerinden
klasik olarak imzalanır ve ML-DSA-87 imzası hesaplanıp `PQCHybridSignature`
uzantısı olarak eklenir. Klasik imza baytları uzantıyı hariç tuttuğundan,
doğrulayıcı PQC kısmını anlasın ya da anlamasın klasik imza geçerli kalır.
Alt düzey yardımcılar (`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) ve uçtan uca
oluşturucular (`buildHybridTx`, `signAndBroadcastHybrid`) ileri düzey kullanım
için dışa aktarılmıştır.

> Hibrit işlem gönderimi, canlı ağdaki cosmos işlemleri için zorunlu yoldur.
> Yerel imzalama/doğrulama temel işlevleri ve işlem oluşturma yardımcıları
> bugün kullanılabilir durumdadır.

## PQC anahtar rotasyonu

SDK 0.7.0 sürümünden itibaren bir hesap, ML-DSA-87 anahtarını **aynı
algoritmanın** yeni bir anahtarıyla döndürebilir — eski bir
`shake256(mnemonic)` anahtarını kanonik olarak adrese bağlı
`shake256("qorechain:pqc:v1|addr|mnemonic")` anahtarına taşıyarak — bunun için
`rotatePqcKeyMsgFromMnemonic` kullanılır (her iki anahtar da rotasyon
baytlarını çift imzalar). Tam bir örnek için Kimlik Doğrulayıcılar
kılavuzundaki [Anahtar rotasyonu](/sdk/guides/authenticators#key-rotation)
bölümüne bakın.

## Algoritma tanımlayıcıları

SDK, protokol düzeyindeki çalışmalar için algoritma kimliklerini ve
yardımcılarını dışa aktarır: `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)` ve `isSignatureAlgorithm(id)`.
