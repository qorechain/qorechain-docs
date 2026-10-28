---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kit, QoreChain üzerinde gerçek dünya varlıklarını temsil eden izinli token'ları ihraç etmek ve yönetmek için açık kaynaklı bir araç takımıdır. Durumu farklı iki bölümden oluşur. Bir bölüm, bugün QoreChain EVM Engine üzerinde çalışan EVM sözleşmeleridir: düzenlemeye tabi varlıklar için iki açık token standardının (ERC-3643 ve CMTAT) bağdaştırıcıları, kısıtlı paylara sahip kasalar (vault) ve her hamilin kayıtlı bir ML-DSA-87 anahtarına sahip olmasını zorunlu kılan QoreChain'e özgü tek bir denetim. Diğer bölüm ise yerel zincir modülleri için bir **öneridir**: uygulamaların önerilen kurallara göre tasarlanıp test edilebilmesi için dört dilde istemcilerle ve bellek içi bir sahte (mock) zincirle birlikte protobuf arayüzleri olarak yayınlanmıştır.

İhraççılar, transfer ajanları, fon yöneticileri, uyum ve hukuk ekipleri ile QoreChain testnet üzerinde düzenlemeye tabi bir token'ın prototipini yapmak isteyen entegratörler içindir. Sürüm **0.1.0**, Apache-2.0 ([Nerede yayınlanıyor](#where-published) bölümünde listelenen lisans istisnalarıyla birlikte), bakımını QoreChain Association yapar. 1.0 öncesidir ve **denetlenmemiştir**.

:::caution Nelerin canlı olduğu ve nelerin olmadığı
- **Bugün çalışan, yalnızca testnet'te:** EVM sözleşmeleri, Foundry dağıtım betikleri ve ihraççı konsolu, `qorechain-diana` üzerinde (EVM zincir kimliği 9800). Hamil kontrolü, testnet'te etkin olan ve **mainnet'te etkin olmayan** `0x0A02` adresindeki `pqcKeyStatus` precompile'ını okur.
- **Mainnet (`qorechain-vladi`, EVM zincir kimliği 9801):** hamil kontrolü **kapalı başarısızlık (fail closed)** davranır. Açıkça muaf tutulmayan her adres uygun değil sayılır; bu yüzden guard ile korunan bir token sıradan hamiller arasında hareket edemez. Dağıtım betikleri 9801 zincirinde çalışmayı reddeder.
- **Hiçbir yerde canlı olmayan bir öneri:** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` ve `x/attest` yerel modülleri hiçbir QoreChain ağında yoktur ve bunları ekleyen bir yükseltme planlanmamıştır. Bunların istemcileri yalnızca bellek içi bir sahte zincirle konuşabilir.
- **Hukuki şablonlar:** depodaki hukuki şablonlar, hukuk müşaviriyle görüşmek için hazırlanmış, incelenmemiş taslaklardır. Hukuki tavsiye değildir.
:::

## Yenilikler {#innovations}

- **Standardın kendi denetimlerinin üstünde kuantum sonrası bir hamil kontrolü.** Guard, `0x0A02` adresinde `pqcKeyStatus(address)` çağırır ve bir adresi yalnızca `registered`, algoritma kimliği 1 (ML-DSA-87) ve `possessionProven` döndürdüğünde kabul eder. Sahiplik kanıtı olmadan kaydedilmiş bir anahtar başka birine ait olabilir; bu yüzden sayılmaz. Yukarı akış standardının tüm denetimleri (kimlik kayıt defteri, claim konuları, dondurma, duraklatma, zorunlu transfer) yine geçerlidir; kontrol bunlara eklenir.
- **Sıkı çözümlemeyle kapalı başarısızlık.** Guard, precompile'ı sabit bir gaz payıyla çağırır ve yanıtı sıkı biçimde çözer. Eski üç alanlı düzendeki bir yanıt, hatalı biçimlendirilmiş bir yanıt veya hiç yanıt gelmemesi "anahtar yok" olarak ele alınır. Precompile'ın etkin olmadığı yerde, muaf olmayan her adres uygun değildir.
- **Üç bağdaştırıcının arkasında aynı guard.** `QoreChainHybridHolderRule`, bir CMTAT v3 token'ına `ruleEngine` olarak (veya bir CMTA RuleEngine içinde kural olarak) 60, 61 ve 62 kısıtlama kodlarıyla takılır; `QoreChainHybridHolderModule`, ERC-3643 modüler uyumuna tak-çalıştır modül olarak takılır; kasalar, guard dahil herhangi bir `IHolderEligibility` politikasını kabul eder.
- **Kısıtlı bir token'ı aklamayan kasa payları.** `QoreChainRwaVault` (ERC-4626) ve `QoreChainRwaAsyncVault` (ERC-7540, `FULFILLER_ROLE` sahibi bir operatör tarafından toplu işlenen talepler) her pay hareketinin alıcı tarafını kontrol eder: uygun olmayan bir alıcı için `maxDeposit` ve `maxMint` sıfır döndürür. İtfalar asla reddedilmez.
- **Yukarı akış sözleşmeleri değiştirilmeden kullanılır.** T-REX 4.1.6, ONCHAINID 2.2.1, CMTAT 3.2.0 ve OpenZeppelin kopya değil, git alt modülleridir.
- **Var olmadan önce test edilebilen bir öneri.** `ChainClient` üzerindeki her çağrı, hiçbir ağ isteği göndermeden `ChainUpgradeRequired` (kod `CHAIN_UPGRADE_REQUIRED`, ayrıca modül adı) ile başarısız olur. Bir `MockChain`, önerilen kuralları bellekte uygular ve önerilen hata kodu adını taşıyan `MockChainError` ile reddeder, örneğin `ERROR_CODE_ADDRESS_FROZEN`. Bir uygulama sahte zincire karşı yazılabilir ve gerçek istemci bağlı kalabilir; böylece eksik bir yükseltme sessizce başarısız olmak yerine açıkça bildirilir.
- **Arka ucu olmayan bir konsol.** İhraççı konsolu, kendi başına hiçbir ağ isteği yapmayan bir React sayfasıdır; üretim derlemesi `connect-src 'none'` ile bir Content-Security-Policy ayarlar ve her şey bağlı cüzdan üzerinden geçer.
- **Çevrimdışı çalışan testler.** 33 Foundry testi, precompile'ın bir test ikizini kullanarak ağ olmadan çalışır.

## Ne yapar {#what-it-does}

**Bugün QoreChain EVM üzerinde çalışanlar (testnet):**

- **`QoreChainHybridHolderGuard`.** Bir adresin sahiplik kanıtlı kayıtlı bir ML-DSA-87 anahtarına sahip olup olmadığını bildirir (`isHybridHolder`, `isEligible`, `requireHybridHolder`, `keyStatus`, `precompileActive`). Kasalar ve emanet hesapları gibi sözleşmeler için sahip tarafından yönetilen muafiyetler (`setExempt`, gerekçeli `ExemptionSet` olayı). Sahiplik iki adımda devredilir (OpenZeppelin `Ownable2Step`).
- **`QoreChainHybridHolderRule`.** Guard'a eşlenmiş bir CMTAT v3 transfer kuralı. `detectTransferRestriction`, `detectTransferRestrictionFrom` ve `messageForTransferRestriction` üzerinden 60 (gönderen), 61 (alıcı) ve 62 (harcayan) kısıtlama kodları.
- **`QoreChainHybridHolderModule`.** Guard'a eşlenmiş bir ERC-3643 (T-REX v4) modüler uyum modülü. `moduleCheck` göndereni ve alıcıyı kontrol eder. Uyum başına yapılandırma yoktur.
- **`QoreChainRwaVault` ve `QoreChainRwaAsyncVault`.** Yukarıda anlatıldı.
- **`IERC7518`.** ERC-7518 bölümleri (partitions) için uygulaması olmayan bir arayüz taslağı; ERC-165 kimliği `0x5a264a5d` bir test tarafından kontrol edilir.
- **Dağıtım betikleri (Foundry).** `script/DeployCmtat.s.sol`, `script/erc3643/DeployErc3643.s.sol` ve `script/DeployVaults.s.sol`; precompile'ın yanıt verip vermediğini ve dağıtıcının anahtar durumunu bildiren, 9801 zincirini reddeden ortak bir ön kontrolle (`script/QoreChainTestnet.sol`).
- **İhraççı konsolu** (`packages/issuer-console`). Herhangi bir EIP-6963 cüzdanına bağlanır, QoreChain Testnet'i ekler veya ona geçer, guard ile korunan bir CMTAT token'ı oluşturur (guard, kural ve token, `DeployCmtat.s.sol` içindeki gibi), mevcut CMTAT veya ERC-3643 token'larını açar, ajan eylemlerini (mint, burn, dondurma, çözme, zorunlu transfer, duraklatma, devam ettirme) çalıştırır ve zincir olaylarından oluşturulmuş hamilleri ve bir denetim günlüğünü gösterir.

**Öneri (zincirde değil):**

- `proto/` içinde `x/asset`, `x/identity`, `x/compliance`, `x/settlement` ve `x/attest` için protobuf arayüzleri ve bunların anlambilimi `docs/proposal.md` içinde.
- TypeScript, Python, Go ve Java istemcileri: üretilmiş türler, `ChainClient` ve `MockChain`.

**Depodaki başvuru belgeleri:**

- `docs/evm-adapters.md`: sözleşmeler, yukarı akış lisansları, testnet dağıtımı.
- `docs/technology-standards.md`: ağları bir ihraççının veya denetçinin görmesi gerektiği gibi anlatan bir taslak (güvenilirlik, yönetişim, yükseltme yetkisi, işlem sıralaması, gözlemlenebilirlik, olay yönetimi, anahtar yönetimi); her olgu Verified, Documented, Not measured veya Not published olarak etiketlenmiştir.
- `legal/`: görüşme için üç şablon ([Sınırlar](#limits) bölümüne bakın).

## Kullanım senaryoları {#use-cases}

1. **Bir ihraççı testnet üzerinde izinli bir token'ın prototipini yapar.** İhraççı, `DeployCmtat.s.sol` ile (veya ihraççı konsolundan) bir CMTAT token'ı ya da `DeployErc3643.s.sol` ile eksiksiz bir ERC-3643 paketi dağıtır; gerçek bir ihraca dair herhangi bir karardan önce `qorechain-diana` üzerinde dondurma, duraklatma, zorunlu transfer ve hamil kontrolünü dener.
2. **Bir fon yöneticisi abonelikleri ve itfaları kısıtlı pay kasaları üzerinden yürütür.** Yatırımcılar `QoreChainRwaAsyncVault` üzerinde para yatırma talebinde bulunur; yönetici bunları `fulfillDeposit` ve `fulfillRedeem` ile toplu işler; paylar yalnızca uygun adresler tarafından alınabilir, itfalar ise pay tutan herkese açık kalır.
3. **Bir uyum ekibi her hamil için kuantum sonrası anahtar kaydı ister.** `QoreChainHybridHolderRule` (CMTAT) veya `QoreChainHybridHolderModule` (ERC-3643) eklemek, standardın kendi kimlik ve izin listesi denetimlerinin üstünde, bir token'ın yalnızca kayıtlı ve sahiplik kanıtlı bir ML-DSA-87 anahtarına sahip adreslere basılabileceği veya aktarılabileceği anlamına gelir.
4. **Bir entegratör önerilen yerel modüllere karşı geliştirme yapar.** Bir cüzdan, kayıt defteri veya arka ofis TypeScript, Python, Go ya da Java'da `MockChain` karşısında kod yazar, olayları ve hata kodları üzerinde doğrulama yapar ve `ChainClient` bağlı kalır.
5. **Bir ürün ekibi teslimat-karşı-ödeme ve onay (attestation) akışları tasarlar.** Önerilen `x/settlement` (iki taraflı onaylı talimatlar, ya tüm bacaklar ya hiçbiri) ve `x/attest` (geçerlilik süresi ve bayatlama içeren beyanlar), hiçbirinin zincirde bulunmadığı bilinerek kullanıcı akışlarını tasarlamak için `MockChain` içinde denenebilir.
6. **Bir hukuk ekibi evrakı hukuk müşaviriyle başlatır.** İsviçre defter tabanlı menkul kıymeti, Liechtenstein TVTG token koşulları ve bir AB DLT Pilot Rejimi görevlendirmesi için şablonlar, doldurulacak bir yapı ve bir teknik eşleme bölümü sunar. İlgili yargı alanındaki nitelikli bir müşavir, herhangi bir kullanımdan önce her şeyi inceler.
7. **Bir durum tespiti (due diligence) incelemecisi ağ olgularını okur.** `docs/technology-standards.md`, canlı ağlarda nelerin kontrol edilebildiğini ve nelerin ölçülmediğini veya yayınlanmadığını kaynaklarıyla listeler.

## Nasıl çalışır {#how-it-works}

### EVM üzerindeki hamil kontrolü {#holder-check}

`0x0A02` adresindeki precompile `pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)` çağrısını yanıtlar. Guard, `registered && algorithmId == 1 && possessionProven` koşulunu arar. Bu, guard'ı kapalı başarısızlık yapar: precompile'ın etkin olmadığı yerde, açıkça muaf tutulmayan her adres uygun değildir. Precompile'ın kendisi ve ağ durumu için [EVM precompile'ları](/developer-guide/evm-precompiles) sayfasına bakın.

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

Kontrol ekleyicidir. Yukarı akış standardının tüm denetimleri yine geçerlidir: ERC-3643 kimlik kayıt defteri (ONCHAINID), claim konuları, güvenilir ihraççılar, dondurma, kısmi dondurma, duraklatma, zorunlu transfer ve kurtarma; CMTAT dondurma, kısmi dondurma, duraklatma, zorunlu transfer, belgeler ve anlık görüntüler.

### Kontrolün kapsadığı şey {#coverage}

Önemli olan alıcı tarafıdır: anahtarı olmayan bir adrese basım veya transfer reddedilir. CMTAT kuralı ayrıca göndereni ve `transferFrom` için harcayanı da kontrol eder. ERC-3643 modülü göndereni ve alıcıyı kontrol eder; ERC-3643 harcayanı uyum modüllerine iletmez, bu yüzden orada bir `transferFrom` harcayanı kontrol edilmez. Yakımlar (burn) asla reddedilmez (ERC-3643'te `burn` uyum modüllerine hiç danışmaz), böylece uygunluğunu yitirmiş bir hamilin itfası yine yapılabilir.

### Kasalar {#vaults}

Her iki kasa da her pay hareketinin alıcı tarafını kontrol eder; itfalar asla reddedilmez. ERC-7540 kasasında talepler denetleyici (controller) başına toplanır (talep kimliği 0). Yerine getirici (fulfiller), bekleyen para yatırmaları yerine getirme anında kasanın kendi varlık/pay oranıyla paylara çevirir; dış bir değerleme girdisi yoktur; denetleyiciler ardından `deposit` veya `mint` ile, ya da `redeem` veya `withdraw` ile talep eder. Kasa sözleşmesinin kendisi dayanak token'ı tutmaya izinli olmalıdır: ERC-3643 kimlik kayıt defterine veya CMTAT izin listesine kayıtlı olmalı ve guard'da muaf olmalıdır (`DeployVaults.s.sol` guard muafiyetlerini ayarlar).

### QoreChain üzerinde bir EVM işlemi göndermek {#native-prerequisites}

QoreChain üzerindeki her EVM işlemi yalnızca göndericinin şunlara sahip olması halinde kabul edilir:

1. `MsgRegisterPQCKeyV2` ve bir sahiplik kanıtıyla kaydedilmiş, kayıtlı bir ML-DSA-87 anahtarı ve
2. hibrit imzalı (secp256k1 artı ML-DSA-87) bir native ray işleminde `/qorechain.pqc.v1.MsgOpenEVMWindow` ile açılmış, açık bir EVM yetkilendirme penceresi.

Dağıtımlar için pencerenin `allowed_targets` değeri **boş** olmalıdır (hedeflerle kısıtlı bir pencere sözleşme oluşturmayı reddeder), `max_txs` en az işlem sayısı kadar, `max_value` her işlemin değeri artı azami ücretini kapsayacak kadar, `blocks` yeterince uzun (en fazla 17.280) ve `native_only` false olmalıdır. Pencereyi açmak hesap dizisini (sequence) ilerletir; bu aynı zamanda EVM nonce'udur: önce pencereyi açın, sonra betiği çalıştırın. Çağrılar ve gaz tahmini için pencere gerekmez. Arka plan: [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) ve [EVM geliştirme](/developer-guide/evm-development#evm-window).

### Öneri {#proposal}

Oluşturma anında sabitlenen veya yalnızca gevşetilebilen altı bayrak (`require_auth`, `freezable`, `pausable`, `non_transferable`, `supply_cap`, `require_hybrid_signature`); roller (ihraççı, ajanlar, denetçiler, kimlik ajanları, claim ihraççıları, onaylayıcılar); sıralı transfer kontrolleri; kaydedilmiş gerekçeyle dondurma, kısmi dondurma, geri alma (clawback) ve zorunlu transfer; claim'leri olan ama zincirde kişisel veri içermeyen kimlikler; sürümlü uyum modüllerinin bir kayıt defteri (`identity-verified`, `country-allowlist`, `country-blocklist`, `max-holders`, `max-balance`, `attestation-fresh`); onaylı uzlaşma talimatları; `FRESH`, `STALE` veya `MISSING` durumlu onaylar. Şartname, depodaki `docs/proposal.md` dosyasıdır. Metin ile sahte zincirin uyuşmadığı yerde, amaçlanan davranış metindir. Bunların hepsi bir tasarımdır: hiçbiri bir QoreChain ağında mevcut değildir.

## Nasıl kullanılır {#how-to-use}

### Kurulum {#install}

| Bölüm | Kurulum | Asgari platform |
|---|---|---|
| Solidity sözleşmeleri (GitHub'dan) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit` (etiket `v0.1.0`), veya bir Foundry bağımlılığı olarak: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry; solc 0.8.28 (T-REX ve ONCHAINID dosyaları 0.8.17 kullanır); `evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")` (Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0` (paket `assetkit`) | Go 1.23 |
| Python | PyPI'da `qorechain-asset-kit` olarak **yakında**; henüz yayınlanmadı. Bugün, bir klondan: `cd clients/python && python -m pip install .` (içe aktarma `qorechain_asset_kit`) | Python 3.10 |
| TypeScript | npm'de `@qorechain/asset-kit` olarak **yakında**; henüz yayınlanmadı. Bugün, bir klondan: `pnpm install && pnpm -r build` | Node.js 22.12 |
| İhraççı konsolu | Bir klondan: `pnpm install`, ardından `pnpm --filter @qorechain/issuer-console dev` (paket olarak yayınlanmadı) | EIP-6963 cüzdanı olan bir tarayıcı |

Depo README'si ve TypeScript istemcisi README'si, `@qorechain/asset-kit` paketini kurulmuş gibi içe aktarır. Bu, npm sürümüne kadar yalnızca bir klondan çalışır.

`forge install` ile sözleşmeler `lib/qorechain-asset-kit/contracts/` altında, kendi bağımlılıkları ise `lib/qorechain-asset-kit/contracts/lib/` altında durur. Guard'ı, CMTAT kuralını ve kasaları derleyen remapping'ler:

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### Hızlı başlangıç 1: sözleşmeleri derleyin ve test edin (çevrimdışı) {#quickstart-build}

Depo README'sinden. Ağ yok, hesap yok.

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

Gözlemlenen çıktı `33 tests passed, 0 failed, 0 skipped (33 total tests)` ile biter.

### Hızlı başlangıç 2: testnet'e karşı dağıtımın deneme çalıştırması {#quickstart-dry-run}

`--broadcast` olmadan Foundry testnet durumuna karşı simülasyon yapar ve hiçbir şey göndermez. Deneme çalıştırması için `--sender` olarak herhangi bir adres işe yarar.

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet`, `foundry.toml` içinde `https://evm-testnet.qore.host` olarak tanımlıdır. Ön kontrol zincir kimliğini (9800), `pqcKeyStatus precompile: active` bilgisini ve dağıtıcının anahtar durumunu yazdırır. Anahtarı olmayan bir adres için `Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.` satırını ekler. Ardından guard, kural ve token'ın sahip olacağı adresleri yazdırır. Aynı komut mainnet'e karşı `QoreChain mainnet: the hybrid-holder guard is testnet only` ile durur. `script/erc3643/DeployErc3643.s.sol` ve `script/DeployVaults.s.sol` aynı şekilde çalışır. İsteğe bağlı ortam değişkenleri: `CMTAT_ADMIN`, `CMTAT_NAME`, `CMTAT_SYMBOL`, `CMTAT_TOKEN_ID`, `CMTAT_TERMS_URI`, `TREX_AGENT`, `TREX_SALT`, `VAULT_ASSET`, `VAULT_GUARD`.

### Testnet'te yayınlamadan önce {#before-broadcast}

1. Kontrol ettiğiniz, biraz testnet QOR'u olan bir testnet hesabı kullanın ([Faucet](/dashboard/faucet) sayfasına bakın). Asla bir mainnet mnemonic'i kullanmayın ve örneklerde kullanılan genel test ifadesini asla fonlamayın.
2. Onun ML-DSA-87 anahtarını sahiplik kanıtıyla kaydedin ([QoreSign](/qoresign/overview) içindeki `examples/register-and-send` örneği bir tane kaydeder).
3. [Bir EVM işlemi göndermek](#native-prerequisites) bölümündeki ayarlarla, boş `allowed_targets` ile bir EVM yetkilendirme penceresi açın. [QoreChain SDK](/sdk/overview) mesajı oluşturur (TypeScript'te `pqc` mesaj grubundaki `openEvmWindow`, Python'da `qorsdk.msg.pqc.open_evm_window`) ve pencereyi geri okur (`fetchEvmWindow`, `get_evm_window`).
4. Betiği `--broadcast` ve cüzdan yapılandırmanızla çalıştırın.
5. Token'ı tutması gereken her sözleşmeyi (kasalar, emanet hesapları) `guard.setExempt` ile muaf tutun, hamilleri token'ın kendi uyumunda kaydedin ve basımdan önce her hamili `guard.isHybridHolder(address)` ile kontrol edin.

### Hızlı başlangıç 3: ihraççı konsolu (testnet) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

Bir EIP-6963 cüzdanına bağlanın, QoreChain Testnet'e geçin, ardından bir CMTAT token'ı oluşturun veya mevcut birini adresiyle açın. 9801 zincirinde konsol bir uyarı gösterir ve token oluşturmayı devre dışı bırakır. Konsol anahtar kaydetmez veya pencere açmaz; önce yukarıdaki 2. ve 3. adımları yapın.

### Hızlı başlangıç 4: MockChain ile önerilen modüllere karşı geliştirin (Python, çevrimdışı) {#quickstart-python}

Python istemcisi README'sinden. PyPI sürümüne kadar bir klondan kurun ([Kurulum](#install) bölümüne bakın).

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

Gözlemlenen çıktı: `ERROR_CODE_ADDRESS_FROZEN`. `ChainClient()` üzerindeki aynı çağrı, `module == "x/asset"` ve `code == "CHAIN_UPGRADE_REQUIRED"` ile `ChainUpgradeRequired` fırlatır.

### Hızlı başlangıç 5: Go'da aynısı (modül proxy'si v0.1.0) {#quickstart-go}

Go istemcisi README'sinden, bir `main` paketine sarılmış olarak.

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

Gözlemlenen çıktı: `mock mint error: <nil>` ardından `true x/asset`. Java istemcisi README'sinde `MockChain`, `MsgCreateAsset.newBuilder()` ve `MockChainError.code()` ile eşdeğer örnek vardır.

:::note
Depodaki Go ve TypeScript README'lerinin parçacıklarında küçük hatalar vardır; 0.1.1'de düzeltilecektir. Yukarıdaki Go örneği düzeltilmiş sürümdür.
:::

## Ana API {#main-api}

### Sözleşmeler {#api-contracts}

| Ad | Ne yapar |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | `0x0A02` üzerinde guard: `isHybridHolder`, `isEligible`, `requireHybridHolder` (`HybridKeyRequired` ile geri döner), `keyStatus`, `decodeKeyStatus`, `precompileActive`, `setExempt`, `exempt` |
| `QoreChainHybridHolderRule(guard)` | CMTAT kuralı: `detectTransferRestriction`, `detectTransferRestrictionFrom`, `canTransfer`, `canTransferFrom`, `messageForTransferRestriction`, `canReturnTransferRestrictionCode`; kodlar `CODE_FROM_NOT_HYBRID` (60), `CODE_TO_NOT_HYBRID` (61), `CODE_SPENDER_NOT_HYBRID` (62) |
| `QoreChainHybridHolderModule(guard)` | ERC-3643 modülü: `moduleCheck`, `bindCompliance`, `unbindCompliance`, `isComplianceBound`, `isPlugAndPlay`, `name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | Kısıtlı paylara sahip ERC-4626 kasası |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | ERC-7540 kasası: `requestDeposit`, `fulfillDeposit`, `requestRedeem`, `fulfillRedeem`, `pendingDepositRequest`, `claimableDepositRequest`, `pendingRedeemRequest`, `claimableRedeemRequest`, `setOperator` ve bir denetleyici ile `deposit`, `mint`, `redeem`, `withdraw`; `FULFILLER_ROLE`; önizlemeler tasarım gereği geri döner (revert) |
| `IHolderEligibility` | `isEligible(address)`: kasalar için başka bir uygunluk politikası takın |
| `IERC7518` | Bölüm arayüzü taslağı |
| `forge script script/DeployCmtat.s.sol` | Guard, kural ve CMTAT token'ı |
| `forge script script/erc3643/DeployErc3643.s.sol` | T-REX altyapısı, guard, modül ve bir token paketi |
| `forge script script/DeployVaults.s.sol` | Kısıtlı bir token üzerinde her iki kasa, guard muafiyetleriyle |

### İstemciler (öneri) {#api-clients}

TypeScript ve Java adları gösterilir; Python snake_case kullanır (`create_asset`), Go ise erişimcilerin arkasında Go yazımını kullanır (`chain.Asset().CreateAsset(ctx, msg)`).

| Ad | Ne yapar |
|---|---|
| `ChainClient` (Go `NewChainClient()`) | Her çağrı `ChainUpgradeRequired` ile başarısız olur; ağ isteği yok |
| `MockChain` (Go `NewMockChain()`) | Önerilen kurallar bellekte; reddedilenler `MockChainError` fırlatır |
| `asset` | `createAsset`, `updateFlags`, `setRole`, `proposeIssuer`, `acceptIssuer`, `authorizeHolder`, `mint`, `burn`, `transfer`, `freeze`, `freezePartial`, `pause`, `clawback`, `forceTransfer`, `setTerms`, `retire`; sorgular `asset`, `assets`, `holder`, `holders`, `roles`, `canTransfer`, `params` |
| `identity` | `registerIdentity`, `updateCountry`, `bindAddress`, `unbindAddress`, `addClaim`, `revokeClaim`, `removeIdentity`, `setClaimIssuer`; sorgular `identity`, `identityByAddress`, `claimIssuers`, `isVerified` |
| `compliance` | `registerModule`, `setModuleStatus`, `bindModule`, `unbindModule`, `migrateBinding`; sorgular `modules`, `module`, `bindings`, `check` |
| `settlement` | `createVenue`, `createInstruction`, `affirm`, `withdrawAffirmation`, `executeInstruction`, `cancelInstruction`; sorgular `instruction`, `instructionsByParty`, `venue` |
| `attest` | `setAttester`, `submit`, `revoke`; sorgular `latest`, `history`, `attesters` |
| Sahte zincir yardımcıları | `setHybridKey`, `fundBank`, `bankBalance`, `advance(blocks, seconds)`, `events(type)`, `defineModuleLogic(moduleId, fn)` (Python'da ayrıca `has_hybrid_key`, `height`, `time`) |

## Nasıl erişilir {#how-to-access}

| | Testnet `qorechain-diana` | Mainnet `qorechain-vladi` |
|---|---|---|
| EVM zincir kimliği | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| `pqcKeyStatus` precompile'ı `0x0A02` | Etkin | Etkin değil (`eth_call` boş veri döndürür); etkinleştirme bir yönetişim kararı gerektirir, alınmış bir karar yok |
| Hibrit hamil guard'ı, kuralı, modülü | Çalışır | Kapalı başarısızlık: muaf olmayan her adres uygun değildir, bu yüzden token'lar sıradan hamiller arasında hareket edemez |
| Dağıtım betikleri | Deneme çalıştırması ve yayınlama | Çalışmayı reddeder |
| İhraççı konsolu | Tam | Uyarı; token oluşturma devre dışı |
| Yerel modüller (`x/asset` ve diğerleri) | Yoktur | Yoktur |

Bir EVM işlemi gönderen her şey için gereksinimler: kayıtlı bir ML-DSA-87 anahtarı (sahiplik kanıtlı) ve açık bir EVM yetkilendirme penceresi olan bir hesap; ikisi de native rayda hibrit imzalı bir işlemle kurulur. Okumalar (`eth_call`, günlükler, gaz tahmini, deneme çalıştırmaları) ikisine de ihtiyaç duymaz. `MockChain` ve Foundry testleri hiç ağ gerektirmez. Diğer uç noktalar ve faucet: [Testnet'e bağlanma](/getting-started/connecting-to-testnet) ve [Mainnet'e bağlanma](/getting-started/connecting-to-mainnet).

Akılda tutulması gereken ağ davranışı: `PREVRANDAO` sabittir (kitin hiçbir sözleşmesi onu kullanmaz); blob işlemleri (tür 3) reddedilir, tür 0, 1, 2 ve 4 kabul edilir; EIP-7702 delegasyonları yetki sahibinin kendi kuantum sonrası onayını gerektirir (`MsgAuthorizeEVMDelegation`).

## Nerede yayınlanıyor {#where-published}

28 Ekim 2026'da canlı olarak kontrol edildi (GitHub sürümü, Maven Central ve Go proxy'si 0.1.0 sunuyor; PyPI ve npm 404 döndürüyor).

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Go modül proxy'si | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0 (etiket `clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **Yakında** (henüz PyPI'da yok) | |
| npm | `@qorechain/asset-kit` | **Yakında** (yayınlanmadı) | |
| GitHub (Solidity sözleşmeleri, ihraççı konsolu, protolar, belgeler, hukuki şablonlar) | `qorechain/qorechain-asset-kit` | sürüm v0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

Depo: https://github.com/qorechain/qorechain-asset-kit. Bakımcı: QoreChain Association.

**Lisanslar.** Kod Apache-2.0'dır; ancak ERC-3643 referans uygulamasıyla birlikte derlenen `contracts/script/erc3643/` ve `contracts/test/erc3643/` GPL-3.0-or-later lisanslıdır. `docs/` ve `legal/` içindeki belgeler Apache-2.0'dır. Bağımlılıklar kendi lisanslarını korur ve git alt modülleri olarak değiştirilmeden kullanılır: T-REX ve ONCHAINID (GPL-3.0), CMTAT (MPL-2.0), OpenZeppelin (MIT). Dağıtılmış bir ERC-3643 token'ı kendi lisansı altındaki T-REX kodudur; dağıtılmış bir CMTAT token'ı MPL-2.0 altındadır. `NOTICE` dosyası her bağımlılığı listeler.

## Sınırlar ve bilinen sorunlar {#limits}

- **Yerel modüller mevcut değildir.** `x/asset`, `x/identity`, `x/compliance`, `x/settlement` ve `x/attest` bir öneridir. Bunları ekleyen hiçbir yükseltme planlanmamıştır. `ChainClient` 0.1.0'da asla başarılı olamaz; `MockChain` bir geliştirme aracıdır, bir zincir değildir.
- **Hamil kontrolü yalnızca testnet içindir.** Mainnet'te guard kapalı başarısızlık yapar; bir mainnet dağıtımı ona güvenemez.
- **Ajan yetkileri hamil kontrolünü atlar.** Her iki standartta da bir ajanın zorunlu transferi ve cüzdan kurtarması kurala veya modüle danışmaz: CMTAT `forcedTransfer` ile ERC-3643 `forcedTransfer` ve `recoveryAddress`, token'ları anahtarı olmayan bir adrese yerleştirebilir. Ajan rollerini kimin tuttuğunu kısıtlayın.
- **ERC-3643 `transferFrom` harcayanları modül tarafından kontrol edilmez**, çünkü ERC-3643 harcayanı uyuma iletmez. CMTAT kuralı harcayanı kontrol eder.
- **Yakımlar ve itfalar açık kalır**, uygunluğunu yitirmiş hamiller için, tasarım gereği, her iki token standardında ve her iki kasada.
- **Bekleyen ERC-7540 talepleri 0.1.0'da iptal edilemez.** Bir ajan varlıkları asenkron kasadan çıkarırsa `totalAssets` sıfır okur ve eksik varlıkları gerektiren talepler, ihraççı bakiyeyi geri yükleyene kadar başarısız olur.
- **ERC-7540 kasasında dış değerleme girdisi yoktur**; dönüşüm kasanın pay başına kendi bakiyesini kullanır.
- **EVM üzerinde teslimat-karşı-ödeme ve onay yoktur.** Bunlar yalnızca önerilen `x/settlement` ve `x/attest` olarak vardır.
- **ERC-7518 bir arayüz taslağıdır**, uygulama değildir. Bölümler bugün, aynı kimlik kayıt defterini veya kuralı paylaşan sınıf ya da dilim başına bir token ile modellenebilir.
- **CMTA RuleEngine v3** hâlâ sürüm adayları olarak yayınlanıyor; kural doğrudan bir token'ın `ruleEngine`'i olarak çalışır ve her iki kural arayüzü kimliğini (`0x2497d6cb`, `0xb1a69752`) duyurur.
- **İhraççı konsolu** anahtar kaydetmez, pencere açmaz, ERC-3643 paketlerini veya kasaları dağıtmaz, CMTAT rollerini, kısmi dondurmaları, belgeleri veya anlık görüntüleri yönetmez.
- **Python ve TypeScript kayıt defterlerinde değildir.** PyPI ve npm sürümlerine kadar bir klon kullanın; bu sayfa onlar için bir kayıt defteri kurulum komutu vermez.
- **README hataları.** Depo README'lerindeki Go ve TypeScript parçacıklarında küçük hatalar vardır; 0.1.1'de düzeltilecektir. Bu sayfadaki hızlı başlangıçları kullanın.
- **Hukuki şablonlar.** `legal/` görüşme için üç taslak içerir: bir İsviçre defter tabanlı menkul kıymet (Borçlar Kanunu md. 973d ila 973i), TVTG kapsamında Liechtenstein token koşulları ("token container" yaklaşımı) ve AB DLT Pilot Rejimi (Tüzük (AB) 2022/858) kapsamında bir operatör için görevlendirme taslağı. Bir müşavir tarafından incelenmemiştir, hukuki tavsiye değildir ve herhangi bir kullanımdan önce ilgili yargı alanındaki nitelikli bir müşavir tarafından incelenmelidir. Bunları veya kiti kullanmak, belirli bir ihracın herhangi bir yasal gerekliliği karşılayıp karşılamadığı hakkında hiçbir şey söylemez. QoreChain Association hiçbir varlık için ihraççı, kayıt tutucu, saklayıcı, işlem yeri veya hukuk danışmanı olarak hareket etmez.
- **1.0 öncesi.** Önerilen protolar herhangi bir minör sürümde değişebilir.

## Güvenlik notları {#security}

- **Denetlenmemiştir.** Sözleşmeler bağımsız bir incelemeden geçmemiştir. Bir inceleme olmadan gerçek değer tutmak için kullanmayın.
- Anahtarlar sahiplerinde kalır: guard açık anahtar durumunu zincirden okur ve hiçbir zaman özel bir anahtarı ele almaz. Dağıtıcı, sahip ve ajan anahtarları, kayıtlı ML-DSA-87 anahtarlarına sahip sıradan EVM hesaplarıdır; ihraççı, guard sahibi ve ajan rollerini ayrı, iyi korunan hesaplarda tutun.
- Guard sahibi muafiyetleri denetler. Bir muafiyet, bir adresi anahtarsız uygun yapar; bunu varlığı tasarım gereği tutan sözleşmelere verin ve `ExemptionSet` olaylarını izleyin.
- Ajan rolleri hamil kontrolünü atlayabilir (zorunlu transfer, kurtarma). Bunları token'ın en hassas rolleri olarak ele alın.
- Guard kapalı başarısızlık yapar ve precompile yanıtını sıkı biçimde çözer; sahiplik kanıtı olmayan bir anahtarı asla geçerli saymaz.
- İhraççı konsolunun üretim derlemesi `connect-src 'none'` ile bir Content-Security-Policy ayarlar: sayfa kendi başına hiçbir ağ isteği yapmaz ve her şey cüzdan üzerinden geçer.
- `MockChain` mesajların imzalayıcı alanlarına güvenir (imza yoktur); bir güvenlik sınırı değildir.
- CMTAT, ERC-3643 referans uygulaması, ONCHAINID veya OpenZeppelin'deki sorunlar ayrıca bakımcılarına da iletilmelidir.
- Kitteki güvenlik açıklarını özel olarak security@qore.network adresine bildirin.

## İlgili sayfalar {#related}

- [QoreChain SDK](/sdk/overview): bir ML-DSA-87 anahtarı kaydetmek ve bir EVM yetkilendirme penceresi açmak (`openEvmWindow`, `fetchEvmWindow`, `get_evm_window`).
- [QoreSign](/qoresign/overview): anahtar kaydeden ve pencere açan native ray işlemleri için hibrit imzalama.
- [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) ve [hesaplar ve PQC imzalama](/sdk/concepts/accounts-pqc): anahtar kaydı ve hibrit imza.
- [EVM geliştirme](/developer-guide/evm-development#evm-window): EVM yetkilendirme penceresi.
- [EVM precompile'ları](/developer-guide/evm-precompiles): `0x0A01` ve `0x0A02`, yalnızca testnet'te etkin.
- [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk): Foundry, Hardhat ve viem şablonları ile pencere yardımcıları (SDK 0.11.0, yakında).
- [Saklama kiti](/developer-tools/custody-kit) ve [QoreScan](/developer-tools/qorescan): saklama kuruluşları ve kriptografi envanterleri için komşu kitler.
- [Geliştirici paketleri](/developer-tools/overview): her paket ve kayıt defteri durumu.
- Yukarı akış standartları: ERC-3643, CMTAT, ERC-4626, ERC-7540, ERC-7518.
