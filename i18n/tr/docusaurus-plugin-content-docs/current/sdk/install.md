---
slug: /sdk/install
title: Kurulum
sidebar_label: Kurulum
sidebar_position: 2
---

# Kurulum

Dilinize uygun SDK'yı kurun. TypeScript çekirdeği (`@qorechain/sdk`), EVM ve
SVM adaptörleri (`@qorechain/evm`, `@qorechain/svm`), React kiti
(`@qorechain/react`) ile Python, Go, Rust ve Java istemcilerinin tümü, yerel
zincirle tam eşdeğerlik sağlayacak şekilde (tipli mesajlar, sorgular, işlem
yaşam döngüsü, hibrit PQC işlemleri ve WebSocket abonelikleri) kendi kayıt
depolarında **yayımlanmıştır**. Güncel sürüm **0.14.0**'dır ve 12 Kasım 2026'da
yayımlanmıştır (12 Kasım 2026'da kayıt depolarına karşı kontrol edildi; Java bir istisnadır,
bkz. tablo):

| Kayıt deposu | Paket | Sürüm |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.14.0 (`create-qorechain-dapp` da; 0.13.1 şablon düzeltmelerini de taşır) |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.14.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.14.0 |
| Go modül proxy'si | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.14.0 (JDK 17 veya üzeri) |

Python, Rust, Go veya Java için 0.11.0 yoktur: npm paketlerinin 29 Ekim 2026'da bir
0.11.0 sürümü vardı (zincir geliştirici kiti, aşağıya bakın) ve her dil 0.10.0'dan
0.12.0'a birlikte geçti. 0.13.0, 11 Kasım 2026'da ve 0.14.0, 12 Kasım 2026'da her dilde onu izledi.

Aşağıdan dilinizi seçin.

## Yükseltme notları {#upgrade}

:::danger Canlı ağlarda SDK 0.8.1 veya sonrasını kullanın
Her iki genel ağ da **v2 hibrit sign-bytes** biçimini (alan etiketli ve zincir
kimliğine bağlı) doğrular ve eski biçimi `pqc` kod 21 ile reddeder. **0.8.0**'dan
önceki her SDK sürümü eski biçimi imzalar; **0.8.0** ise geçişi, ağların kullandığı
iki yükseltme adından yalnızca birinin altında arar (mainnet bunu `v3.2.0` olarak,
testnet ise `v3.1.98` ve ardından `v3.2.0` olarak kaydetti), dolayısıyla mainnet
üzerinde yanlış biçimi imzalar. Her dilde **0.14.0** (veya en azından **0.8.1**)
kullanın; bir [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmak için
**0.8.2 veya sonrası** gerekir. Hibrit oluşturucular bir `signBytesVersion`
seçeneği alır (`"auto"` | `"v1"` | `"v2"`); `"auto"` ağa sorar ve bu nedenle
`qorechain-vladi` / `qorechain-diana` üzerinde REST uç noktasına (`rest`) ihtiyaç
duyar: tahmin etmek yerine hata fırlatır. Bkz.
[Hangi sign-bytes biçimi?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Biçim, zincir v3.2.3 veya v3.2.4 ile değişmedi (v3.2.4 test ağında 19 Ekim 2026'dan beri, mainnet'te 23 Ekim 2026'dan beri çalışır; v3.2.5 ve v3.2.6 burada hiçbir şeyi değiştirmedi; mainnet 4 Kasım 2026'dan beri v3.2.6 çalıştırır): `"auto"` her
iki ağda da v2'ye çözümlenir, çünkü ikisi de v2'ye geçiren yükseltmeyi uyguladı.
:::

## 0.14.0 neyi değiştiriyor {#whats-new-0140}

SDK 0.14.0 (12 Kasım 2026), tüm diller için tek bir sürümdür: TypeScript, Python,
Go, Rust ve Java; `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm` ve
`create-qorechain-dapp` ile birlikte (0.13.1 şablon düzeltmelerini de taşır). Zincir
**v3.2.8** için istemci desteği ekler. Yeni kurallar, bir ağ v3.2.8 çalıştırdığında
geçerli olur: test ağı `qorechain-diana` 12 Kasım 2026'dan beri onu çalıştırır; ana ağ
henüz uygulamadı. Önceki ağlarda yeni alanlar isteğe bağlı kalır.

| Alan | 0.14.0'da |
| --- | --- |
| Bir anahtarı bağlama | Sahiplik kanıtı gerekir. ed25519, secp256k1 ve EIP-191 (`personal_sign`) için oluşturucular ve imzalayıcılar, zinciri, hesabı, şemayı ve anahtarı adlandıran düz metin bir bağlantı mesajını imzalar. Kayıt oluşturucuları boş bir kanıtı reddeder |
| Değer taşıyan anahtarlar | `send`, `evm`, `deploy`, `svm` veya `all` iznine sahip bir anahtar için hesabın ilk etkin harcama kuralının her denom'u sınırlaması gerekir. Bir yardımcı, harcama kuralı güncellemesini ve bağlantıyı sahibin imzaladığı tek bir işlemde bir çift olarak oluşturur ve kuralı denetler |
| Yönetişim parametreleri | crossvm, svm ve rdk `MsgUpdateParams` oluşturucuları her alanı gerektirir (zincir parametreleri bütünüyle değiştirir). Yeni yardımcılar, güncellemeyi ağdan okunan geçerli parametrelerden oluşturur. svm oluşturucusu, sert saklama tavanı 0 iken `enabled` değerini reddeder |
| VM'ler arası bekleyen çağrı sorgusu | Sayfalı sorgu artık her sayfayı döndürür |
| Yürütme sonuçları | `MsgExecuteEVM` ve `MsgExecuteCosmos`, kod 0 bir işlemin içinde `success=false` ile başarısız olabilir (nonce tüketilir). Yeni yardımcılar yanıtları ve başarısızlık nedenini çözer ve başarısız bir yürütmede hata fırlatır |
| VM'ler arası eşzamansız çağrılar | `async_gas_limit` ve `async_max_factor` alanlarını alır |
| EVM pencere kapsamı | Yeni alanlar: `validators`, `staking_validators` ve `ibc_receivers` |
| Gas | 30.000.000'un üzerindeki EVM işlemleri (`evm_limits` içinden okunur) ve 50.000.000'un üzerindeki Cosmos işlemleri imzalamadan önce reddedilir. CosmWasm ve VM'ler arası işlemler simüle edilen gazın en az 1,3 katını alır ve asla sabit bir yedek değer almaz |
| Asgari gas fiyatı | İsteğe bağlı yardımcılar ağın asgari gas fiyatını okur; varsayılan gas fiyatı değişmemiştir |
| Protolar | Beş dilin hepsinde üretilen kod v3.2.8'i izler |

Aynı değişikliğin cüzdan tarafı
[`@qorechain/wallet-adapter` 0.6.0](/developer-tools/wallet-adapter#whats-new-060) sayfasındadır.

## 0.13.0 neyi değiştiriyor {#whats-new-0130}

SDK 0.13.0 (11 Kasım 2026), tüm diller için tek bir sürümdür: TypeScript, Python,
Go, Rust ve Java; `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm` ve
`create-qorechain-dapp` ile birlikte. Seed yolu hesap yardımcısında tek bir uyumsuz
değişiklik vardır. Mnemonic'ten türetilen hesaplar değişmemiştir; hibrit imzalama
biçimi ve zincir davranışı da öyle: 0.12.0 ile oluşturulmuş bir işlem geçerli kalır.

**Uyumsuz değişiklik.** Seed yolu yardımcıları `unifiedAccountFromSeed` (TypeScript),
`unified_account_from_seed` (Python, Rust), `unified.UnifiedAccountFromSeed` (Go) ve
`UnifiedAccounts.unifiedAccountFromSeed` (Java) artık iki girdiden tam olarak birini
gerektirir: bir `QRC1` kurtarma kodu veya bağımsız 32 baytlık bir PQC sırrı. ML-DSA-87
anahtarı bu ikinci sırdan türetilir. Yardımcıyı seçenek vermeden ya da birden fazla
seçenekle çağırmak hata verir.

`legacySeedDerivation` seçeneği (Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`) isteğe bağlıdır. Onu yalnızca 0.13.0 öncesinde oluşturulmuş
bir hesabın PQC anahtarını kurtarmak için kullanın; böylece anahtarı `MsgRotatePQCKey`
ile rotasyona sokabilirsiniz; yeni hesaplar için değildir.

| Alan | 0.13.0'da |
| --- | --- |
| Seed yolu yardımcıları | Bir `QRC1` kurtarma kodu veya bağımsız 32 baytlık bir PQC sırrı gerekir (tam olarak biri); seçenek yoksa ya da birden fazlası varsa hata verir. Mnemonic hesapları değişmemiştir |
| `legacySeedDerivation` | İsteğe bağlıdır, yalnızca 0.13.0 öncesinde oluşturulmuş bir hesabın PQC anahtarını `MsgRotatePQCKey` ile rotasyona sokmak üzere kurtarmak içindir |
| `QRC1` kurtarma kodları | Her dile eklendi: `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret` (Python ve Rust'ta snake_case; Go'da `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | `keyVerified` bildirir |
| Şablonlar | `pnpm window recovery-code` yeni bir kod yazdırır. `PRIVATE_KEY` ile `pnpm window`, `QORE_PQC_RECOVERY_CODE` değerini okur ve eksikse bir mesajla durur; `QORE_MNEMONIC` ile hiçbir şey değişmez. Foundry ve Hardhat şablonları `^0.13.0` sürümüne bağımlıdır |
| Sign-bytes sürümü `"auto"` | Önce `/qorechain/pqc/v1/protocol_features` üzerinden `pqc-sign-bytes-v2` protokol özelliğini okur ve yalnızca bu okuma başarısız olursa uygulanmış yükseltme planlarına döner |
| `getPqcStatus` / `get_pqc_status` | Düğümün yanıtında kayıt bayrağı yoksa "kayıtlı değil" bildirmek yerine hata verir |
| Python | İşlem sonucu kodlarını ve EVM penceresi `found` ile `live` alanlarını katı biçimde ayrıştırır; `wait_for_tx`, `tx_response` veya `txhash` içermeyen bir yanıtı hâlâ bekleyen sayar |

**Her dilde seed yolu seçenekleri**. Üçünden tam olarak birini verin:

| Dil | Çağrı | Kurtarma kodu | Bağımsız 32 baytlık sır | Eski anahtar, yalnızca kurtarma için |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (bir `"QRC1-..."` dizesi) | `{ pqcSecret }` (`seed32`'den bağımsız, 32 baytlık bir `Uint8Array`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Python seçenekleri yalnızca anahtar sözcükle verilir. Bir `pqcSecret`, ondan `pqcRecoveryCodeFromSecret(secret32)` ile üretilen kurtarma koduyla aynı anahtarı verir. TypeScript'te ayrıca `pqcKeyFromRecoveryCode(code, qor1)` vardır.

**Geçiş (TypeScript).** Bir kurtarma kodunu bir kez oluşturun ve tohumdan ayrı saklayın:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

PQC anahtarını 0.12 veya öncesiyle kaydetmiş bir hesap, eski anahtarı
`{ legacySeedDerivation: true }` ile yükler ve `rotatePqcKeyMsg` ile rotasyona sokar:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

Kurtarma kodunu saklayın: farklı bir kod farklı bir anahtar verir.

## 0.12.0 neler ekliyor {#whats-new-0120}

SDK 0.12.0, mainnet'in 29 Ekim 2026'da 3.906.833 yüksekliğinde uyguladığı (testnet
bunu 26 Ekim'de uyguladı) zincir **v3.2.5** için istemci sürümüdür. Mainnet
4 Kasım'dan beri v3.2.6 çalıştırır; testnet 27 Ekim'den v3.2.6, 6 ile 12 Kasım arasında v3.2.7, 12 Kasım'dan beri v3.2.8 çalıştırır;
hibrit imzalama biçimi, adresler, ondalık basamaklar ve memo'lar değişmedi, dolayısıyla
0.10.0 ile oluşturulmuş bir işlem geçerli kalır. TypeScript, Python, Go, Rust ve Java
tümü `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
ve `create-qorechain-dapp` ile birlikte 0.12.0'a geçer. Sürüm, her dilde testnet
üzerinde bir hibrit bank gönderimiyle ve orada kaydedilen, geri okunan ve
kaldırılan bir KEM anahtarıyla, ayrıca mainnet üzerinde okumalarla kontrol edildi.

| Alan | 0.12.0'da |
| --- | --- |
| Varsayılan olarak herkese açık uç noktalar | `mainnet` ve `testnet` hazır ayarları artık localhost yerine herkese açık uç noktaları gösterir (her ikisinde REST, konsensüs RPC ve EVM JSON-RPC, ayrıca testnet'te EVM WebSocket). Bu yüzden çıplak bir `createClient()` herkese açık testnet ile konuşur. Bkz. [Ağ ve uç noktalar](/sdk/reference/network#public-endpoints) |
| `localnet` hazır ayarı | 0.12.0 öncesinde her hazır ayarın kullandığı localhost portları, zincir kimliği `qorechain-devnet`. Eski davranışı korumak için `createClient({ network: "localnet" })` ile seçin |
| Hibrit işlemler için kesin gas | v3.2.5'i uygulamış bir ağda, bir hibrit native işlemin `"auto"` ücreti `ceil(simulated x 1.02) + 2000` değeridir, çünkü simülasyon artık post-kuantum doğrulamasının kendisini ücretlendirir. Bir hibrit bank gönderimi yaklaşık 289.000 yerine yaklaşık 171.600 gas ister ve ücret de onunla birlikte düşer. Daha eski ağlar, klasik işlemler ve başarısız bir plan sorgusu önceki kuralı korur; geçirdiğiniz bir çarpan her iki kuralın yerine geçer. `exactHybridGas` (ve her dildeki karşılıkları) ve TypeScript'te `estimateGasDetails` (simülasyonu, gas limitini ve hangi kuralın belirlediğini bildirir). Java otomatik gas yolunu kazandı |
| ML-KEM-1024 anahtar kayıt defteri | Bir hesap, herkesin ona şifreleyebilmesi için bir ML-KEM-1024 kapsülleme anahtarı (algoritma 2, 1.568 bayt) yayımlar: `msg.pqc.registerKemKey` ve `msg.pqc.removeKemKey` (anahtar önce denetlenir: boyut, her katsayı 3329'un altında, tamamı sıfır değil), `validateKemPublicKey` ve `/qorechain/pqc/v1/kem/{address}` (bech32 veya `0x`) rotasının `fetchKemKey` okuması. Her iki mesaj da hibrit imza gerektirir. Rota mainnet'te ve testnet'te yanıt verir. SDK şifrelemez: mühürlü yükler için bkz. [QoreSeal](/developer-tools/qoreseal) |
| Abstract account'lar | Bir hesabın saklanan harcama kurallarının ve bağlı anahtarlarının (iptal edilenler dahil) okumaları, `MsgUpdateConfig` (modülü açıp kapatan yönetişim mesajı) ve hesap görünümünde `authenticators_count` |
| Harcama kuralı denetimleri | Kurallar zincirin denetlediği gibi denetlenir: bir `erc20/`, `erc721/` veya `erc1155/` denom'u bir `0x` sözleşme adresi belirtmelidir. `abstractaccount` 8 (geçersiz harcama kuralı) ve 9 (modül devre dışı) kodları adlandırılır |
| Yönetişim parametreleri | Cross-VM `MsgUpdateParams` (EVM köprü ön derlemesinin çağırabileceği CosmWasm sözleşmeleri dahil) ve rollup `MsgUpdateParams`; her biri imzalamadan önce zincirin sınırlarına karşı denetlenir. Cross-VM parametre okuması `bridge_allowed_targets` taşır |
| Yükseltme sabiti ve protobuf'lar | `CHAIN_UPGRADE_V3_2_5`; zincir v3.2.5 ile eşitlenmiş protobuf tanımları |
| Zincir geliştirici kiti | Yalnızca npm'e çıkan 0.11.0'dan itibaren ve 0.12.0'a dahil: `@qorechain/evm`, `qorechain` (9801) ve `qorechainTestnet` (9800) viem zincirlerini ve EVM yetkilendirme penceresi yardımcılarını (`evmWindowStatus`, `openEvmWindowMessage`, ayrıca viem olmadan `@qorechain/evm/window` olarak) dışa aktarır. `create-qorechain-dapp` içinde `foundry`, `hardhat`, `viem-wagmi` ve `cosmwasm` şablonları vardır. `@qorechain/react` içinde `PqcStatusBadge` vardır (eski `QuantumSafeBadge` adları kullanımdan kaldırılmış takma adlar olarak korunur) |
| Düzeltmeler | `svmRpc` olmadan uç nokta verilen `@qorechain/svm` localhost kullanıyordu; artık uç noktanın yapılandırılmadığını söyler. Python kod üretimi, QoreChain protobuf'ları arasındaki import'ları pakete yönlendirir |

**Yükseltirken denetlemeniz gereken davranış değişikliği.** Kodunuz localhost
varsayılanına dayanıyorsa, `localnet` seçin veya `endpoints` geçirin. Herkese açık testnet
uç noktaları IP başına hız sınırlıdır; bu yüzden üretim trafiği kendi
düğümünü çalıştırmalı veya kullanmalıdır. Hiçbir hazır ayar herkese açık ağlarda bir gRPC veya SVM uç noktası belirlemez (SVM
işlemleri açık değildir) ve mainnet'in herkese açık bir EVM WebSocket'i yoktur: bunlardan birine ihtiyaç duyan kod,
localhost'a geri dönmek yerine geçirilecek uç noktayı adlandıran bir hatayla başarısız olur.
Rust'ta isteğe bağlı uç noktalar artık `Option<String>`'dir; Python, Go
ve Java'da ayarlanmamış bir uç nokta sırasıyla `None`, boş bir dize ve `null`'dır.

Düğümler ikili sürümlerini bildirmez. Bir özelliği algılamak için, onu getiren her yükseltme adı için
`isUpgradeApplied` işlevine sorun veya `.version` değerini
`https://download.qore.host/<net>/latest.json` adresinden okuyun.

## 0.10.0 neler ekledi {#whats-new-0100}

SDK 0.10.0, mainnet'in 23 Ekim 2026'da 3.742.566 yüksekliğinde uyguladığı (testnet
bunu 19 Ekim'de 8.337.253 yüksekliğinde uyguladı) zincir **v3.2.4** için istemci
sürümüdür. İmzalama biçimi, adresler, ondalık basamaklar, memo'lar ve ücretler
değişmedi ve 0.9.0 ile oluşturulmuş bir işlem geçerli kalır. Sürüm, her dilde testnet
üzerinde gerçek işlemlerle kontrol edildi. v3.2.4'ten sonra getirilen hiçbir şey için
oluşturucuları yoktu; v3.2.5 ekleri [0.12.0](#whats-new-0120) ile geldi. Mainnet 4 Kasım 2026'dan beri v3.2.6 çalıştırır (yükseklik 4.020.000, yönetişim önerisi 15; öncesinde v3.2.5, 29 Ekim'den beri, yükseklik 3.906.833) ve imzalama biçimi değişmediği için 0.10.0 orada çalışmaya devam eder. Testnet v3.2.5 ve
v3.2.6'yı 26 ve 27 Ekim 2026'da, v3.2.7'yi 6 Kasım'da ve v3.2.8'i 12 Kasım'da uyguladı (hiçbir SDK sürümünde v3.2.7 mesajları için oluşturucu yoktur). 0.10.0'ın getirdikleri (hepsi hâlâ 0.14.0'da):

| Alan | 0.10.0'da |
| --- | --- |
| Stake katmanları (`x/stakingtier`) | `lockDelegation` (zincirin kendi denetimleri: 3, 6 veya 12 aylık bir süre ve pozitif bir tam miktar), `unlockEarly`, `claimBonus` ve `updateParams` oluşturucuları; modül parametreleri, bir sahibin kilitleri ve bonus havuzu için okumalar (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); modülün hata kodları. Modülün ne yaptığı [Staking ve Delegasyon](/user-guide/staking-and-delegation) sayfasında anlatılır |
| Authenticator nonce değeri | `fetchAuthNonce({ rest, address, pubkey })`, bağlı bir anahtarın `MsgExecuteEVM` / `MsgExecuteCosmos` için sıradaki imzalaması gereken sırayı elle takip etmek yerine `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` rotasından okur. Her iki ağ da rotayı sunar; `abstractaccount` modülünün kendisi mainnet'te kapalıdır (testnet'te etkindir), bu nedenle bir mainnet harcaması herhangi bir nonce denetlenmeden önce reddedilir |
| Protokol özellik anahtarları | `fetchProtocolFeatures` ve `isProtocolFeatureEnabled`, bir ağın hangi konsensüs kurallarını uyguladığını adıyla `/qorechain/pqc/v1/protocol_features` rotasından okur (her iki ağ da sunar). v3.2.4'ün altındaki bir ağ rotayı sunmaz; orada `isUpgradeApplied` kullanın |
| `possessionProven` | PQC durumu, hesabın anahtarının bir sahiplik kanıtıyla kaydedilip kaydedilmediğini söyler |
| `ibcTimeoutTimestamp(seconds)` | `MsgTransfer`'ın aldığı birimde (Unix nanosaniye) mutlak bir IBC zaman aşımı. IBC zaman aşımları mutlak zamanlardır; IBC v2 paketleri mutlak Unix saniyesi alır ve orada göreli bir değer ücret alındıktan sonra reddedilir. Mainnet'te hiçbir IBC kanalı açık değildir (27 Ekim 2026'da kontrol edildi) |
| Yükseltme sabiti ve protobuf'lar | `CHAIN_UPGRADE_V3_2_4`; zincir v3.2.4 ile eşitlenmiş protobuf tanımları (köprü doğrulayıcı kaydında, hafif düğümde ve rollup sorgularında yeni alanlar) |
| `ensurePqcRegistered` | Açık anahtarı olmayan bir durumu eşleşme sayıyordu; artık anahtarı `rest` üzerinden okur ve karşılaştırır. Okunacak bir şey yoksa sonuç, anahtarın çağıranın olduğunu iddia etmek yerine `keyVerified: false` bildirir |
| Ücret simülasyonu sırasında ret | Yalnızca metin olarak gelen bir zincir reddi (örneğin "no bonus to claim"), artık her dilde zincirin kayıtlı hata açıklamalarından adlandırılır: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` ve `create-qorechain-dapp` onunla birlikte 0.10.0'a geçti; ikisi de
artık 0.14.0'dadır.

## 0.9.0 neler ekledi {#whats-new-090}

SDK 0.9.0, zincir **v3.2.2** ve **v3.2.3** için istemci sürümüydü (mainnet
bunları 3.556.788 ve 3.662.051 yüksekliklerinde uyguladı; mainnet v3.2.4'ü 23 Ekim 2026'dan itibaren (yükseklik 3.742.566) çalıştırdı, 29 Ekim'den itibaren v3.2.5'i çalıştırdı ve 4 Kasım 2026'dan beri v3.2.6 çalıştırır, testnet ise 19 Ekim 2026'dan beri v3.2.4 veya üstünü çalıştırır). İmzalama biçimi, adresler, ondalık basamaklar, memo'lar ve ücretler
değişmedi; dolayısıyla 0.8.1 ve sonrasının imzaladığı v2 hibrit sign-bytes biçimi
hâlâ doğru olandır. Yenilikler:

| Alan | 0.9.0'da (ve sonrasında) |
| --- | --- |
| Hibrit `TxClient` (TypeScript) | Hesabın anahtar çiftini verin: `client.connectTx(signer, { pqcKeypair })` veya `TxClient.connect({ …, pqcKeypair, rest })`. Böylece her işlem hibrit imzalanır ve `fee: "auto"` hibrit işlemin kendisini simüle eder; çıplak bir anahtar kaydı klasik kalır (zincirin önyükleme yolu). `bankSend` ile SDK'nın rollup, multilayer ve cross-VM istemcileri bunu kullanır. Anahtar çifti verilmezse hiçbir şey değişmez |
| Kurtarılabilir PQC anahtarı | `derivePqcCanonical(address, mnemonic)` ve her dildeki karşılıkları (bkz. [Hibrit imzalama](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Önce anahtar durumunu REST üzerinden okur (`rest`), ayırt edemediğinde kaydetmeyi reddeder, hesap zaten farklı bir anahtar tutuyorsa `PqcKeyMismatchError` fırlatır ve zincirin "already registered" reddini başarı sayar. Zincir v3.2.3'ten itibaren **sahiplik kanıtını** kendiliğinden imzalar ve ekler; v3.2.3 öncesinde alanı boş bırakır |
| Kapsamlı EVM pencereleri | `openEvmWindowMsg`, `nativeOnly` ve `allowedTargets` alır (en fazla 16, tekrar yok); `fetchEvmWindow` ikisini de geri okur (bkz. [EVM kılavuzu](/sdk/guides/evm#evm-window)) |
| EIP-7702 onayı | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Anahtar bütünlüğü | Kayıt oluşturucuları `classical_only`'yi, boş bir anahtarı ve dejenere bir ML-DSA-87 anahtarını reddeder; zincir bunları v3.2.3'ten itibaren reddeder. `signProofOfPossession` / `verifyProofOfPossession` dışa aktarılır; `migratePqcKeyHybrid`, anahtarı olan hesapların v3.2.3'ten itibaren ihtiyaç duyduğu hibrit imzalı `MsgMigratePQCKey` mesajını gönderir |
| Abstract-account özeti v2 | `evmAuthSignBytesV2` (çağrının gas limitini bağlar) ve `resolveEvmAuthDigestVersion`. `abstractaccount` modülü mainnet'te kapalıdır (testnet'te etkindir); bu nedenle mainnet'te bu yalnızca başvuru içindir |
| Yükseltme algılama | `isUpgradeApplied`, `requireUpgradeApplied`: yeni isteğe bağlı alanlar yalnızca `applied_plan` sürümü bildirdikten sonra ayarlanır, çünkü bir sürümü uygulamamış bir düğüm, o sürümün yeni alanlarından biri ayarlandığında işlemin tamamını reddeder |
| Hata çözümleme | Bir blok içindeki başarısızlık codespace'ini korur (örneğin `sdk_231` değil `pqc` 231); `rate_limited` ve delegasyon kodları çözülür; `decodeTxError` fırlatılan bir hatanın günlüğünü veya mesajını okur |
| Harcama kuralları | `validateSpendingRules`, `MsgUpdateSpendingRules` oluşturucularında çalışır ve hiçbir şeyi sınırlamayan bir kuralı reddeder |
| Düzeltmeler | PQC hesap rotası her SDK'da tekil `/qorechain/pqc/v1/account/{address}` biçimindedir (ve birleşik istemci verildiğinde `client.rest.getPqcAccount`, `isPqcRegistered` ve `getPqcStatus` içinde de); dışa aktarılan `VERSION` paketle eşleşir; SDK'nın oluşturduğu Go ve Rust istemcileri takılı kalmak yerine zaman aşımına uğrar; `create-qorechain-dapp` şablonları birlikte geldikleri sürüme bağımlıdır |

Yeni anahtarlar için eski PQC türetmesi (`derivePqcLegacy`, `"bridge"`) kullanımdan
kaldırılmıştır: hesaba bağlı değildir; bu nedenle bir mnemonic her hesaba tek bir
anahtar verirdi. Rotasyon yardımcıları onu **yeni** anahtar olarak reddeder; mevcut
bir eski anahtarı kurtarmak veya ondan rotasyonla uzaklaşmak hâlâ çalışır.

## 0.9.0 öncesi sürümler {#before-090}

0.8.x kullanıyorsanız, her iki ağın da doğruladığı biçimi imzalamaya devam eder ve
mainnet ve testnet üzerinde çalışır. Bunlar, 0.9.0'ın kaldırdığı
sınırlardır ve bazıları bilmediğinizde ücrete mal olur:

| 0.9.0 öncesi sürüm | Geçici çözüm |
| --- | --- |
| Sahiplik kanıtı, kapsamlı pencere veya EIP-7702 onayı oluşturucuları yok | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` ve `authorize-evm-delegation` / `clear-evm-delegation` komutlarını kullanın (bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window), [EIP-7702 delegasyonları](/architecture/post-quantum-security#eip-7702)) |
| `status` verilmeden `ensurePqcRegistered` kaydı denetlemeden yayınlıyordu ve farklı bir anahtar kayıtlıyken başarı bildiriyordu | Zaten anahtarı olan bir hesap için ikinci bir kayıt **ücret alındıktan sonra** reddedilir. Önce `GET /qorechain/pqc/v1/account/{address}` adresini okuyun ve `status: { registered: found }` geçin |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Çoğul bir `/accounts/` yolunu veya herkese açık uç noktaların sunmadığı `qor_` ad alanını çağırıyorlardı (HTTP 501, `-32601`). Yukarıdaki tekil REST rotasını okuyun |
| `TxClient` / `bankSend` ile rollup, multilayer ve cross-VM istemcileri yalnızca klasik imzalıyordu | Ağlar bunu anahtarı olan her hesap için reddeder. `signAndBroadcastHybrid` üzerinden gönderin |
| Blok içinde başarısız olan işlemler codespace'ini yitiriyordu | İşlemi `GET /cosmos/tx/v1beta1/txs/{hash}` adresinden okuyun |
| 0.8.3'ün dışa aktarılan `VERSION` sabiti `0.8.0` bildiriyordu | Kurulu sürümü `package.json` içinden okuyun |
| `create-qorechain-dapp` 0.8.0, `@qorechain/sdk` / `@qorechain/evm` paketlerini `^0.3.0` sürümüne sabitliyordu (0.x sürümünde caret, 0.3 içinde kalır) | İskeleti oluşturduktan sonra `npm i @qorechain/sdk@latest` çalıştırın |
| `@qorechain/react` 0.8.x, kayıtlı anahtar durumunu herkese açık uç noktalarda okunamaz bırakıyordu | `@qorechain/react` 0.9.0 veya üstünü kullanın |

:::caution Eski düzeltmeler
SDK **0.6.1**, konsensüs açısından kritik bir hatayı düzeltti:
`/qorechain.pqc.v1.PQCHybridSignature` tx-body uzantısı `Any.value` içine
JSON olarak serileştiriliyor ve **zincir tarafından CheckTx aşamasında
reddediliyordu**. SDK ≤ 0.6.0 ile oluşturulan hibrit (PQC + klasik) işlemler
zincir üzerinde reddedilir. **0.8.0**, cüzdan imzalı hesap yardımcılarını
kaldırdı (bkz. [Hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Çekirdek paket:

```bash
npm i @qorechain/sdk
```

Node.js 20+ hedefler; ESM, CommonJS ve tip tanımlarıyla birlikte gelir. Bu
belgelerdeki hibrit işlem örnekleri ayrıca `@cosmjs/stargate` içinden
`StargateClient` içe aktarır (`npm i @cosmjs/stargate`).

### EVM adaptörü

`@qorechain/evm`, [viem](https://viem.sh) üzerine kurulu ince ve tip güvenli
bir adaptördür. viem bir **peer dependency**'dir — birlikte kurun:

```bash
npm i @qorechain/evm viem
```

npm'de `0.14.0` sürümüyle yayımlanmıştır. `qorechain` (zincir kimliği 9801) ve `qorechainTestnet` (9800) viem zincirlerini ve [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) yardımcılarını dışa aktarır.

### SVM adaptörü

`@qorechain/svm`,
[`@solana/web3.js`](https://solana.com/docs/clients/javascript) üzerine kurulu
ince bir adaptördür; `@solana/web3.js` bir **peer dependency**'dir:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm'de `0.14.0` sürümüyle yayımlanmıştır.

### React kiti

`@qorechain/react`, `@qorechain/sdk` üzerindeki resmi React katmanıdır — bir
provider, hook'lar ve `ConnectButton` / `PqcStatusBadge` bileşenlerini
içerir. `react` (>=18) bir peer dependency'dir:

```bash
npm i @qorechain/react
```

npm'de `0.14.0` sürümüyle yayımlanmıştır; `@qorechain/sdk` `^0.14.0` sürümüne
bağımlıdır. Bkz. [React kiti kılavuzu](/sdk/guides/react).

### İskelet oluşturucu

`create-qorechain-dapp` (npm, `0.14.0`), çalışmaya hazır bir dApp iskeleti
oluşturur:

```bash
npm create qorechain-dapp@latest my-dapp
```

Oluşturulan `package.json` dosyaları, iskelet oluşturucunun birlikte geldiği SDK
sürümüne bağımlıdır (`@qorechain/sdk` `^0.14.0`; EVM şablonları `@qorechain/evm`
`^0.14.0` kullanır). Sürüm 0.13.1 yalnızca şablonları değiştirdi ve 0.14.0 bu düzeltmeleri taşır; bkz. [İskele araçları ve CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131). Sözleşme çalışmaları için ayrıca `foundry`, `hardhat`, `viem-wagmi` ve `cosmwasm` şablonları vardır. İskelet oluşturucunun 0.8.0 sürümü `^0.3.0` aralıkları
yazıyordu; bir 0.x sürümünde bunlar 0.3 içinde kalır ve canlı ağlar için
imzalayamaz; 0.8.0 ile iskelet oluşturduysanız `npm i @qorechain/sdk@latest`
çalıştırın. Bkz. [CLI başvurusu](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ gerektirir. Paket, tip ipuçları ve bir `py.typed` işaretçisiyle
birlikte gelir.

> Dağıtım `qorechain-sdk` adıyla kurulur (PyPI'da `0.14.0` sürümüyle
> yayımlanmıştır) ancak **`qorsdk` adıyla içe aktarılır**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+ gerektirir. İhtiyaç duyduğunuz alt paketleri içe aktarın, örneğin:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Kendi kendine yeten bir Go modülü olarak yayımlanmıştır
(`packages/go/v0.14.0` etiketiyle). Sürümü açıkça sabitleyin:
`go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Ya da depo başını takip etmek için:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ gerektirir. Okuma istemcileri asenkrondur (Tokio). Crate,
`qorechain` adıyla içe aktarılır (`use qorechain;`).

> crates.io'da `qorechain-sdk` (0.14.0) adıyla yayımlanmıştır; `cargo add qorechain-sdk`
> en son sürümü kurar.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.14.0</version>
</dependency>
```

Ya da Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.14.0'
```

> Maven Central'da `io.github.qorechain:qorechain-sdk` adıyla yayımlanmıştır (güncel sürüm 0.14.0). JDK 17 veya üzeri gerekir.
> Central'da 0.8.0 veya 0.8.1 derlemesi yoktur; bu nedenle canlı ağlarda 0.8.2
> veya sonrasını kullanın. 0.9.1, Bouncy Castle'ı 1.80'den 1.85'e API değişikliği
> olmadan taşıyan yalnızca Java'ya özel bir sürümdü.

## İlgili paketler {#related-packages}

| Paket | Amaç | Sürüm |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Cüzdan tarafı yardımcıları: cüzdan oluşturma (`generateQoreWallet`), `eth_secp256k1` hibrit imzalama (`signHybridEth`, `QoreChainSigner`), MetaMask ağ kaydı (`addQoreEvmToWallet`), authenticator ve EVM penceresi mesaj oluşturucuları (`openEvmWindowMsg` yalnızca kapsamsız biçimi oluşturur), v2 abstract-account özeti. Sahiplik kanıtı eklemez. Peer dependency'ler: `@cosmjs/proto-signing` ve `@cosmjs/stargate` `^0.32` (SDK cosmjs 0.39 kullanır; bu nedenle ikisini aynı projeye kurmak npm'in bir peer çakışması, `ERESOLVE`, bildirmesine yol açar; onları ayrı projelerde tutun veya `--legacy-peer-deps` geçin) | 0.5.0 |
| `@qorechain/chain-bridge` | Arka uçlar için sunucu tarafı worker: PQC anahtarını türetir, hibrit imzalar ve yayınlar (`sendTokens`, `registerPqc` ve daha fazlası). `cosmosRest` geçin: bununla, ağ v3.2.3'ü uyguladıktan sonra bir kayıt sahiplik kanıtını taşır ve PQC'ye benzeyen bir ret, herhangi bir yeniden kayıttan önce zincire karşı kontrol edilir (farklı bir kayıtlı anahtar, ikinci bir kayıt için ücret ödetmek yerine `pqc_key_mismatch` hatası verir) | 0.2.3 |
| `@qorechain/pqc` | Yalnızca standartlara uygun ML-DSA / ML-KEM / SHAKE-256 ilkelleri ve `hybridSignBytes` (bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing)); ayrıca aynı sürümde PyPI, crates.io, Maven Central ve Go proxy'sinde (Go `v0.2.3`) | 0.2.3 |
| `@qorechain/handles` | Doğrulanmış `@handle` çözümlemesi (`HandleClient`): kayıt defterinin açık anahtarını ve bir sabitleme deposunu siz sağlarsınız ve kullanıcı adresi gördükten sonra siz sabitlersiniz; paket kendiliğinden hiçbir zaman sabitlemez. Bkz. [Chain bridge ve handle'lar](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **npm'de kullanımdan kaldırılmıştır ve artık bakımı yapılmamaktadır; yeni işlerde kullanmayın. Bunun yerine [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) kullanın (QoreX bağlantısı için yedekler [geliştirici araçlarına genel bakışta](/developer-tools/overview#group-connect) yer alır).** EVM, Cosmos ve SVM cüzdanları için, cüzdan adaptörü üzerine kurulu tek bir bağlayıcı (peer aralığı `@qorechain/wallet-adapter` `^0.2.1`'dir ve 0.5.0'ı içermez). Bir [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) açmaz; bu nedenle hesabın kayıtlı bir anahtarı ve açık bir penceresi olana kadar onun üzerinden yapılan bir EVM gönderimi reddedilir | 0.2.1 |
| `@qorechain/rdk` | Rollup Development Kit istemcisi (bkz. [Rollup'lar](/rollups/why)). 0.7.0'dan itibaren `@qorechain/sdk` `^0.10.0` ve `@qorechain/evm` `^0.8.0` sürümlerine bağımlıdır (4 Kasım 2026'da npm'de kontrol edildi). 0.x sürümündeki bir caret o minor içinde kalır; bu yüzden SDK 0.13.0 kullanan bir uygulama, kit için ikinci, iç içe bir SDK 0.10.x kopyası alır; bir kit sürümü 0.13'e geçene kadar ikisini birbirinden ayrı tutun (bir kopyadan diğerine istemci geçirmeyin). Yalnızca bir `pqcKeypair` verdiğinizde hibrit imzalar; okumalar onsuz çalışır. Ayrıca PyPI, crates.io ve Maven Central'da `qorechain-rdk` olarak ve bir Go modülü olarak yayımlanmıştır (`@v0.8.0` sabitleyin); 0.8.0'dan itibaren bu dört istemci de hibrit imzalar (önceki sürümler yalnızca klasik imzalıyordu; Java için Java 21 gerekir). Bkz. [RDK 0.8.0: değişiklikler ve sınırlar](/rollups/deploying-a-rollup#rdk-050-limits) | 0.9.0 |
| `@qorechain/rdk-cli` | RDK için `qorollup` operatör CLI'ı. 0.7.1'den beri işlem komutları (`create`, `pause`, `resume`, `stop`, `withdraw`) hibrit imzalar (0.7.0 ve öncesi yalnızca klasik imzalıyordu ve ağlar tarafından reddediliyordu); npm'den kurulduğunda çalışır ve `--version` kurulu sürümü yazdırır (0.6.1 ve öncesi hiçbir şey yazdırmıyordu) | 0.9.0 |
| `@qorechain/qoreseal` | QoreSeal: bir yükü, hesapların KEM kayıt defterinde yayımladığı ML-KEM-1024 anahtarlarına şifreler (SDK 0.12.0 ve sonrası anahtarları kaydeder ve okur; şifrelemeyi QoreSeal yapar). Ayrıca PyPI (`qorechain-qoreseal`; macOS ve Linux wheel'leri, Windows wheel'i sonraki sürümde), crates.io, Maven Central (`io.github.qorechain:qoreseal` ve `qoreseal-android`; Kotlin kullanıcıları Kotlin 2.3 veya üstüne ihtiyaç duyar), Go modül proxy'si (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) ve bir Swift paketi olarak da bulunur. Bkz. [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: EVM Engine üzerinde izinli gerçek dünya varlığı token'ları için araçlar; TypeScript, Python, Java ve Go istemcileri ve Solidity sözleşmeleriyle (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0; ERC-3643 betikleri ve testleri hariç (GPL-3.0-or-later). Tanımladığı native modüller bir önerisidir, yapılmamıştır. Ayrıca PyPI'da `qorechain-asset-kit` ve Maven Central'da `io.github.qorechain:asset-kit`. Bkz. [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: cüzdan ve arka uç imzalama ve işlenmiş (committed) bir işlemin post-kuantum katmanını denetlemek için `inspectTransaction`. Ayrıca PyPI, crates.io ve Maven Central'da. Bkz. [QoreSign](/qoresign/overview) | 0.2.0 |
| `create-qorechain-rollup` | Rollup başlangıç iskelet oluşturucusu; şablonları `@qorechain/rdk` `^0.9.0` sürümüne bağımlıdır ve post-kuantum anahtarınızı `QORE_MNEMONIC` veya `QORE_PQC_SEED_HEX` içinden çözümleyebildiklerinde hibrit imzalar | 0.9.0 |

## Sıradaki adım

Bağlanmak ve zincir üzerindeki durumu okumak için
[Hızlı Başlangıç](/sdk/quickstart) sayfasına geçin.
