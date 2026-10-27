---
slug: /developer-tools/chain-bridge
title: Chain Bridge ve Handle'lar
sidebar_label: Chain bridge ve handle'lar
sidebar_position: 3
---

# Chain bridge ve handle'lar

Bu sayfa iki küçük sunucu tarafı paketini kapsar.

**`@qorechain/chain-bridge`** (0.2.3), klavye başında kimse olmadan QoreChain üzerinde işlem yapan arka uçlar için bir Node.js kütüphanesidir: QOR gönderir, bir hesabın ML-DSA-87 anahtarını kaydeder, hafif düğümleri kaydeder, sözleşmeleri dağıtır ve zincirin lisans yetkilisi anahtarının sahibi için lisans verir ve iptal eder. Sade bir arka ucun tek başına yapamadığı iki şeyi üstlenir: native ray işlemlerinin ihtiyaç duyduğu ML-DSA-87 hibrit imzası ve QoreChain'in özel mesajlarının tam protobuf kodlaması. Sıcak cüzdan işçileri, ödeme ve dashboard arka uçları ve benzeri hizmetler içindir.

**`@qorechain/handles`** (0.1.0), bir QoreX `@handle`'ını bir adrese çözümler ve yanıtı döndürmeden önce kriptografik olarak doğrular. Bir kişinin `qor1...` adresi yerine `@alice` yazmasına izin veren cüzdanlar ve hizmetler içindir.

Her iki paket de kayıt defteri meta verilerinde bir kaynak depo listelemez. Yayımlanmış kodu npm üzerinde okuyabilirsiniz.

## Yenilikler {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **Bir mnemonic, bir kanonik ML-DSA-87 anahtarı.** Anahtar `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` olarak türetilir ve ardından ML-DSA-87 anahtar üretimine verilir; bu, [cüzdan adaptörü](/developer-tools/wallet-adapter), SDK ve QoreX ile aynı türetmedir, böylece anahtar `qorechaind tx pqc recover-key` ile kurtarılabilir. Eski araçlarla `SHAKE-256(mnemonic)` ile kaydedilmiş hesaplar eski anahtarlarını korur: kanonik bir imza doğrulama hatasıyla reddedildiğinde bridge eski anahtarla bir kez yeniden dener.
- **Sign-bytes biçimi zincirden okunur.** `cosmosRest` ayarlandığında bridge düğümden uygulanmış yükseltme planlarını (`v3.2.0` ve `v3.1.98`) sorar ve biri uygulanmışsa v2 biçimini imzalar; [cüzdan adaptörü sayfasında](/developer-tools/wallet-adapter#innovations) anlatıldığı gibi. Zincir `pqc` kod 21 ile reddederse bir kez yeniden çözümler ve tekrar imzalar. Canlı ağlarda `cosmosRest` gereklidir; onsuz bir hibrit çağrı tahmin etmek yerine hata fırlatır.
- **Anahtarı ilk kullanımda kaydeder, ama önce zinciri denetler.** Bir hibrit işlem eksik bir PQC anahtarı nedeniyle reddedildiğinde bridge `MsgRegisterPQCKeyV2` gönderir (zincirin ilk kayıt için izin verdiği klasik bir işlem) ve yeniden dener. Bu mesaj reddedilse bile ücretini ödettiği için, önce `GET /qorechain/pqc/v1/account/{address}` isteğini okur: hesap, mnemonic'inizin ne kanonik ne de eski anahtarı olan bir anahtar tutuyorsa `pqc_key_mismatch` fırlatır ve hiçbir şey göndermez. `cosmosRest` ile bir kayıt, ağ v3.2.3'ü uyguladıktan sonra sahiplik kanıtını da taşır (ana ağ ve test ağı ikisi de uyguladı).
- **Düz adlardan lisans özellik kimlikleri.** `featureIdsFor({ type, chains })`, bir ürün tanımını zincirin özellik kimliklerine (`validator_operator` artı `validator_<chain>`, `lightnode_operator`, `qcb_bridge` artı `bridge_<chain>`) eşler, "Solana" veya "BNB Chain" gibi serbest metin zincir adlarını normalleştirir ve zincirin reddedeceği bir kimlik oluşturmak yerine bilinmeyen bir zinciri düşürür. 27 Ekim 2026'da kontrol edildi: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` `validator_operator`, `validator_solana`, `validator_ethereum` döndürdü ve `Foo`'yu düşürdü.
- **Saf JavaScript, yerel eklenti yok.** Node.js 18 veya üstü için bir ES modülüdür, bu yüzden sunucusuz işçilerde çalışır. Ana girişin yanı sıra `@qorechain/chain-bridge/proto` (tel kodlayıcıları) ve `@qorechain/chain-bridge/features` (özellik eşlemesi) dışa aktarır.

### Handle'lar {#innovations-handles}

- **Bir çözümleme döndürülmeden önce iki kez denetlenir.** Kayıt, istemcide sabitlediğiniz bir kayıt defteri açık anahtarına karşı doğrulanan kayıt defterinin ed25519 imzasını ve sahibin talep üzerindeki kendi secp256k1 imzasını taşımalıdır; bu imzanın açık anahtarı kaydın `qor1` adresine özetlenmelidir. İki denetimden birinde başarısız olan bir kayıt asla döndürülmez.
- **Pin deposu sizindir.** `resolve`, kaydı elinizdeki bir pin ile karşılaştırarak `pin.status` değerini `new`, `match` veya `CHANGED` olarak döndürür ve kendi kendine asla pinlemez. Kullanıcı adresi gördükten ve devam ettikten sonra siz pinlersiniz. Bir pinin amacı, kayıt defterinin farklı bir şey söylemeye başladığını fark etmektir; bu yüzden denetlenen taraf dışında biri tarafından, örneğin kullanıcının cihazında tutulmalıdır.
- **Bir ağ için yalnızca sahibin imzaladığı adresler döndürülür.** `addressForNetwork(record, caip2)`, QoreChain ağları için `qor1` adresini ve kayıt birleşik bir hesapsa 9800 ve 9801 zincir kimlikleri için `0x` adresini döndürür. Kayıt defterinin yalnızca onayladığı diğer zincirlerdeki adresler gönderim için döndürülmez.
- **Yalnızca görüntüleme amaçlı ters arama.** `reverse(address)`, geçmişte göstermek için bir handle döndürür. Sonucu asla bir gönderimin hedefi olmamalıdır.
- **Claim ve delete ayrı imzalama alanları kullanır.** `signClaim` ve `signDelete` farklı mesajlar imzalar; böylece bir delete imzası bir claim olarak yeniden oynatılamaz.

## Nasıl kullanılır {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

`@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 ve ethers 6 paketlerini çeker. Bunun için test edilmiş bir hızlı başlangıç yoktur; aşağıdaki kod parçası paket tiplerini ve [Borsa entegrasyonu kılavuzunu](/developer-guide/exchange-integration#chain-bridge) izler. 27 Ekim 2026'da yapıcı, `featureIdsFor` ve yöntem listesi yayımlanmış 0.2.3 paketine karşı denetlendi; hiçbir işlem gönderilmedi.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Ana yöntemler:

| Yöntem | Ne yapar | Kullanılan anahtar |
|---|---|---|
| `sendTokens({ to, amountUqor })` | bank `MsgSend`, hibrit imzalı | imzalayıcı |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, klasik | o hesap |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | hafif düğüm kaydı, hibrit imzalı | operatör |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | lisans modülü mesajları | zincirin lisans yetkilisi anahtarı |
| `deployEvm({ bytecode, abi, args })` | `eth_sendRawTransaction` üzerinden Ethereum tarzı bir dağıtım | dağıtıcı anahtarı |
| `deploySvm({ bytecode })` | SVM programı dağıtımı | imzalayıcı |
| `createVestingAccount`, `createPeriodicVestingAccount` | vesting hesabı oluşturma | imzalayıcı |
| `featureIdsFor`, `normalizeChain` | yerel yardımcılar | yok |

Her çağrı `{ txHash, code, height, gasUsed }` döndürür ve bir hibrit çağrı ayrıca `signBytesVersion` bildirir. Varsayılan gas fiyatı gas başına 0,1 uqor'dur ve bu ağ tabanıdır (bu fiyattan 300.000 gas'lık bir `sendTokens` 30.000 uqor, bir anahtar kaydı için 6.000.000 gas varsayılanı ise hesap başına bir kez ödediğiniz 600.000 uqor tutar). EVM rayı 18 ondalık kullanır: `deployEvm` içindeki `value` wei cinsindendir. Varsayılan coin tipi 118 anahtarı yerine birleşik eth-native anahtarla (`qor1`, `0x` ve SVM olarak tek kimlik) imzalamak için yapılandırmada `keyType: "eth_secp256k1"` ayarlayın; bu seçenek kaynakta ve cüzdan adaptörü README'sinde vardır ancak tiplerde yoktur.

### Handle'lar {#handles}

```bash
npm install @qorechain/handles
```

Tek çalışma zamanı bağımlılıkları `@noble/curves`, `@noble/hashes` ve `bech32`'dir. Bunun için test edilmiş bir hızlı başlangıç yoktur. Kod parçası paket README'sini ve tiplerini izler; 27 Ekim 2026'da `isHandleInput`, `normalizeHandle` ve dışa aktarma listesi yayımlanmış 0.1.0 paketinde denetlendi ve hiçbir kayıt defteriyle iletişime geçilmedi.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve`, handle bilinmiyorsa, kayıt defterine ulaşılamıyorsa veya yanıt doğrulamada başarısız olursa hata fırlatır. `isHandleInput(text)` bir handle'ı bir adresten ayırır (bir handle, `a-z`, `0-9` ve `_` karakterlerinden oluşan 3 ila 20 karakterdir ya da `@` ile başlar; bir `qor1...` veya `0x...` dizesi asla handle değildir). Diğer dışa aktarmalar: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. QoreX'in handle'ları nasıl kullandığı için bkz. [Bir @handle'a gönder](/qorex/browser-extension#handle-send) ve [Hesap ve Dashboard](/qorex/account-and-dashboard).

## Nasıl erişilir {#how-to-access}

- **Ağlar:** chain bridge, ana ağ `qorechain-vladi` veya test ağı `qorechain-diana` üzerinde, [Geliştirici paketleri](/developer-tools/overview#how-to-access) sayfasında listelenen uç noktalarla çalışır (`deployEvm` için EVM RPC'si ve 9800 veya 9801 zincir kimliği).
- **Chain bridge ön koşulları:** Node.js 18 veya üstü; işçinizin mnemonic'ini tuttuğu fonlanmış bir hesap (onu bir gizli bilgi yöneticisinde tutun); ve ağın REST URL'si. ML-DSA-87 anahtarı mnemonic'ten türetilir ve ilk kullanımda kaydedilir, bu yüzden hesapta o kayıt ücreti için yeterli QOR bulunmalıdır.
- **Lisans çağrıları** yalnızca zincirin lisans yetkilisi olarak yapılandırıldığı anahtarla imzalandıklarında başarılı olur. Dışarıdan bir geliştirici ona sahip değildir, bu yüzden bu yöntemler o anahtarın operatörü içindir. Kullanıcı olarak lisanslar ve hafif düğüm kaydı için bkz. [Kayıt ve lisanslama](/light-node/registration-and-licensing).
- **Handle ön koşulları:** kayıt defterinin temel URL'si ve ed25519 açık anahtarı (hex), uyguladığınız bir pin deposu ve `fetch`. Okumalar hesap gerektirmez.
- **Maliyet:** her iki paket de ücretsizdir. Chain bridge işlemleri ağ ücretini öder.

## Nerede yayımlanır {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (20 Ekim 2026'da yayımlandı) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (Ağustos 2026'da yayımlandı) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

İkisi de Apache-2.0'dır ve yalnızca npm'de yayımlanmıştır (PyPI, crates.io, Maven Central veya Go proxy'sinde değil). Hiçbiri kayıt defteri meta verilerinde bir kaynak depo listelemez, bu yüzden bağlantı verilecek herkese açık bir kaynak sayfası yoktur; kod yayımlanmış tarball'dadır. Canlı sürümleri okumak için bkz. [Canlı sürümler nasıl alınır](/developer-tools/overview#live-versions).

## Sınırlar ve bilinen sorunlar {#limits}

### Chain bridge {#limits-chain-bridge}

- **EVM dağıtımları açık bir pencere gerektirir.** `deployEvm` standart bir Ethereum işlemi gönderir. Zincir v3.2.0'dan beri EVM rayı bir işlemi yalnızca kayıtlı bir ML-DSA-87 anahtarı ve açık bir EVM yetkilendirme penceresi olan bir hesaptan kabul eder ve bridge'de pencere açan bir yöntem yoktur. Onu çağırmadan önce pencereyi başka araçlarla açın ([cüzdan adaptörü](/developer-tools/wallet-adapter#evm-window), SDK veya QoreX); aksi halde işlem reddedilir (codespace `pqc`, kod 26, 27 veya 28). Bu, zincir kurallarını ve paket kaynağını izler; bu sayfa için canlı bir ağda denenmedi. Paket README'si EVM rayını hâlâ muaf diye adlandırıyor, bu güncel değildir.
- **`deploySvm`**, şu an her iki ağda da işlem kabul etmeyen SVM rayını hedefler.
- **Sözleşme yükleme yöntemleri vardır ama belgelenmemiştir.** Kaynakta ayrıca QoreChain Native sözleşmeleri için `storeWasm`, `instantiateWasm` ve `deployWasm` vardır; bunlar tiplerde veya README'de yoktur. Yükleme, canlı ağlarda sıradan hesaplar için yalnızca yönetişimle yapılabilir, bu yüzden sıradan bir hesap için ret bekleyin.
- **Anahtar sunucuda türetilir.** Mnemonic sizin işleminizde kalır. Onu günlüklerden ve kaynak denetiminden uzak tutun ve kişisel bir cüzdan olarak yeniden kullanmayın.
- **Bir kayıt ücretsiz değildir.** Bridge anahtarı ilk kullanımda kendisi kaydeder; para taşıyan bir hat önceden kayıt yapmalı ve ilk çekimden önce sonucu `GET /qorechain/pqc/v1/account/{address}` ile doğrulamalıdır.
- **cosmjs 0.32.** Onu aynı projede SDK'nın (cosmjs 0.39) yanına kurmayın; npm `ERESOLVE` bildirir.
- **README'nin eskimiş kısımları.** README, ana ağın ilk sign-bytes biçiminde kaldığını söylüyor; her iki ağ da v2'yi doğrular ([Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) sayfasına bakın).
- **Test edilmiş hızlı başlangıç yok, herkese açık kaynak deposu yok.**

### Handle'lar {#limits-handles}

- **Kayıt defteri adresi ve açık anahtarı** pakette veya bu kılavuzda yayımlanmaz. QoreX ve dashboard bunları yerleşik olarak taşır; bu yüzden bir entegratör paketi yalnızca bu iki değer kendisine verilirse kullanabilir.
- **Handle'lar zincir üzerindeki adlar değildir.** Kayıt defteri, QoreX için işletilen zincir dışı bir hizmettir; paket yanıtlarını doğrular ama onu erişilebilir kılamaz. Kayıt defterine ulaşılamazsa `resolve` bir `NETWORK_UNAVAILABLE` hatası fırlatır ve `isReachable()`, bir arayüzün handle özelliklerini gizlemek için kullanabileceği hızlı bir yoklamadır.
- **Sizin yerinize hiçbir şeyi pinlemez.** Hiç `pin` çağırmazsanız her çözümleme `new` bildirir. Pinleri güvenle saklamak çağıran tarafın sorumluluğundadır.
- **Gönderim için yalnızca sahibin imzaladığı adresler kullanılır.** Kayıt defterinin onayladığı diğer zincirlerdeki adresler `addressForNetwork` tarafından döndürülmez.
- **Yazma çağrıları paketten fazlasını gerektirir.** `claim`, `deleteHandle` ve `bySub` kayıt defterinin yazma uç noktalarıyla konuşur ve bir sahip imzası (`signClaim`, `signDelete`) veya bir hesap belirteci gerektirir; cüzdan uygulamaları için tasarlanmıştır.
- **Test edilmiş hızlı başlangıç yok, herkese açık kaynak deposu yok.**
