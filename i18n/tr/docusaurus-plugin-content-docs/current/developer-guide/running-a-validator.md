---
slug: /developer-guide/running-a-validator
title: Doğrulayıcı Çalıştırma
sidebar_label: Doğrulayıcı Çalıştırma
sidebar_position: 9
---

# Doğrulayıcı Çalıştırma

Bu kılavuz, QoreChain ağında bir doğrulayıcı (validator) oluşturmayı, havuz sınıflandırma tasarımını anlamayı, bir PQC anahtarı (hibrit ML-DSA-87 imzaları, FIPS 204) kaydetmeyi ve düğümünüzü izlemeyi kapsar.

:::note
Bu kılavuz **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedefler; 7 Haziran 2026'dan beri canlı olup **v3.2.5** düğüm sürümünü çalıştırır (yönetişim önerisi 14 ile 29 Ekim 2026'da 3.906.833 yüksekliğinde uygulandı; ondan önce v3.2.4, 23 Ekim 2026'da 3.742.566 yüksekliğinde ve v3.2.3, 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulanmıştı). Bir doğrulayıcının v3.2.5 ikili dosyasını çalıştırması gerekir (manifestteki `minCompatible` değeri 3.2.5'tir); hâlâ v3.2.4 üzerinde olan bir düğüm 3.906.833 yüksekliğinde durur ve v3.2.5 paketine ihtiyaç duyar (bkz. [Düğüm Çalıştırma: Yükseltmeler](/developer-guide/running-a-node#upgrades)). **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) v3.2.6 çalıştırır (26 Ekim'de v3.2.5'ten sonra 27 Ekim 2026'da uygulandı) ve canlıya geçmeden önce kurulumunuzu prova etmek için önerilir. Hedef ağınız için uygun `--chain-id` değerini kullanın. Blok süreleri farklıdır: ana ağda yaklaşık 3,1 sn (27 Ekim 2026'da son 1.000 blok 52 dakika 21 saniye sürdü), test ağında yaklaşık 1,3 sn; ikisi de değişir, bu nedenle blok sayılarını her ağ için ayrı ayrı süreye çevirin.
:::

:::caution Kaynak derlemesi değil, yayın (release) ikili dosyasını kullanın
Bir doğrulayıcı, canlı manifestte (`https://download.qore.host/mainnet/latest.json`; bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node#fetch-the-manifest)) belirtilen **yayın sürümü `qorechaind`** dosyasını çalıştırmalıdır. Herkese açık kaynaktan derlenen bir ikili dosyada stub keeper'lar bulunur ve post-kuantum imzalayıcı yoktur: ağın konsensüs durumunu yeniden üretemez ve `create-validator` ile diğer tüm Cosmos yolu işlemlerinin gerektirdiği hibrit imzayı oluşturamaz (bkz. [Kaynaktan Derleme](/developer-guide/building-from-source)). v3.2.3'ten itibaren herkese açık kaynaktan derlenen bir ikili dosya, herkese açık bir ağda hiç başlamayı reddeder. Yeni bir ana ağ düğümü v3.2.0 veya üstünü gerektirir; sistem saatini NTP ile senkronize tutun, çünkü v3.2.1'den itibaren düğüm, saati 60 saniyeden fazla saptığında durur.
:::

:::note Bu sayfanın hangi bölümleri canlı
Blok üretimi standart, stake ağırlıklı doğrulayıcı rotasyonunu kullanır; slashing ve yönetişim ise aşağıda gösterilen parametrelerle standart Cosmos SDK modüllerini kullanır. Triple-Pool CPoS mantığı (havuz sınıflandırması, havuz ağırlıklı blok önereni seçimi, bonding eğrisi ve kademeli slashing) `x/qca` modülünde uygulanmıştır ve parametreleri zincir üzerindedir, ancak **henüz blok üretimine, ödüllere veya slashing'e bağlı değildir**. Bu konulardaki bölümler tasarımı anlatır; bugün havuz üyeliğinin veya itibarın blok önerme payınızı ya da ödüllerinizi değiştireceğini varsayarak plan yapmayın.
:::

---

## Ön Koşullar

* Tam olarak senkronize edilmiş bir yayın sürümü `qorechaind` düğümü (bkz. [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) veya prova için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet))
* Operatör hesabında **kayıtlı bir ML-DSA-87 PQC anahtarı** (bkz. [PQC Anahtar Kaydı](#pqc-key-registration)) — `create-validator` hibrit imzayı gerektirir
* İlk öz-delegasyon için en az **100.000 QOR** (100.000.000.000 uqor) bakiyeli, fonlanmış bir hesap — bu minimum zincir üzerinde zorunlu kılınır ve bunun altında `create-validator` reddedilir
* Operatör adresinizde, Dashboard'un **Nodes & Validators** sayfasındaki [Validator Program](/dashboard/tools-hub#validator-application) aracılığıyla verilen (başvurun, seçilin, 1.000 $ program ücretini ödeyin) etkin bir **`validator_operator` yetkisi (grant)**; aşağıdaki nota bakın. Bu yetki olmadan, ne kadar QOR öz-bağlarsanız bağlayın, `create-validator` `ErrUnauthorized` hatasıyla başarısız olur
* [Staking ve Delegasyon](/user-guide/staking-and-delegation) modeline aşinalık

---

## Ağa Katılma {#joining}

**Katılmanın varsayılan yolu olarak state sync kullanın.** Blokları yeniden oynatmak yerine, genesis'ten itibaren her bloğu yeniden oynatmak yerine, eşlerden yakın tarihli bir uygulama durumunu getirir. Anlık görüntü (snapshot) indirmesi yalnızca bir yedektir: ana ağ manifestindeki anlık görüntü hâlâ 21 Ağustos 2026 arşividir (yükseklik 1.966.629, yaklaşık 27 GB); birkaç yükseltmeden öncedir ve ardından yaklaşık iki aylık bloğu yeniden oynatır, test ağı ise hiç anlık görüntü yayımlamaz.

1. Manifestin belirttiği yayın sürümü `qorechaind` dosyasını kurun (bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node#fetch-the-manifest)), `qorechaind init <moniker> --chain-id qorechain-vladi` komutunu çalıştırın, ardından orada anlatıldığı gibi manifestin genesis, peers ve seeds değerlerini yerine koyun ve `app.toml` içinde `minimum-gas-prices = "0.1uqor"` ayarlayın.
2. Güven noktasını manifestten alın ve `config.toml` içindeki `[statesync]` bölümünü yazın:

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. İsteğe bağlı olarak diski küçük tutun (bkz. [Donanım](#hardware)): `app.toml` içinde `pruning = "custom"` değerini `pruning-keep-recent = "100000"` ve `pruning-interval = "10"` ile birlikte ayarlayın ve `config.toml` içinde `[tx_index]` altında `indexer = "null"` ayarlayın (bir doğrulayıcı işlem sorgusu sunmaz; sorguladığınız bir düğümde `null` kullanmayın).
4. `qorechaind start --minimum-gas-prices=0.1uqor` ile başlatın ve `catching_up` değeri `false` olana kadar bekleyin.

:::warning State sync iki farklı RPC sunucusu gerektirir
State sync, güven noktasını **iki** RPC sunucusuna karşı çapraz kontrol eder. Manifestin `stateSync.rpcServers` listesi `https://rpc.qore.host` adresini **iki kez** verir (test ağı manifesti de `https://rpc-testnet.qore.host` adresini iki kez verir). İki özdeş giriş sayıyı karşılar ancak çapraz kontrolü boşa çıkarır, çünkü iki yanıt da tek bir sunucudan gelir. Kendi çalıştırdığınız veya bağımsız olarak güvendiğiniz ikinci bir RPC ekleyin ve başlamadan önce güven özetini (hash) ikinci bir kaynağa karşı kontrol edin; örneğin `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash` çıktısı `$TRUST_HASH` değerine eşit olmalıdır. Manifestteki güven noktası saatlik yenilenir, bu nedenle eskiyse yeniden alın.
:::

Sistem saatini NTP ile senkronize tutun: v3.2.1'den itibaren düğüm, saati 60 saniyeden fazla saptığında durur.

---

## Ağ Parametreleri {#parameters}

Bu değerler 27 Ekim 2026'da ana ağ REST API'sinden okunmuştur (`qorechain-vladi`, o sırada v3.2.4 üzerindeydi; v3.2.5, 29 Ekim 2026'dan beri çalışıyor). Güvenmeden önce bunları canlı okuyun: `qorechaind query staking params`, `qorechaind query slashing params` veya `GET /cosmos/staking/v1beta1/params` ve `GET /cosmos/slashing/v1beta1/params`.

| Öğe | Değer |
| --- | --- |
| Aktif küme boyutu (`max_validators`) | 100 (bugün 8 doğrulayıcı bonded durumda, hiçbiri hapiste değil) |
| Unbonding süresi | 1.814.400 sn (21 gün); delegatör başına en fazla 7 unbonding kaydı (`max_entries`) |
| Minimum komisyon oranı (`min_commission_rate`) | 0 (kendi oranınızı seçersiniz, `commission-max-rate` değerinize kadar) |
| İmzalanan blok penceresi | 10.000 blok (`signed_blocks_window`) |
| Pencere başına gereken minimum imza | 0,05; yani bir doğrulayıcı pencerenin %5'inden azını imzaladığında hapse atılır |
| Çevrimdışı kalma hapsi / slashing | 600 sn hapis, stake'in %1'i slash edilir |
| Çifte imza slashing'i | Stake'in %5'i |
| Doğrulayıcı oluşturmak için öz-bağlama tabanı | **100.000 QOR** (`100000000000uqor`), zincir üzerinde zorunlu; bunun altında `create-validator` 18 koduyla başarısız olur |
| Operatör yetkisi | Gönderen hesapta etkin bir `validator_operator` yetkisi gerekir; olmadan `create-validator` `ErrUnauthorized` ile başarısız olur |
| Ücret tabanı | Gas başına 0,1 uqor |

**İşlem sırası.** Bunları şu sırayla yapın: (1) hesabın PQC anahtarını kaydedin, (2) `validator_operator` yetkisini edinin, (3) `create-validator` işlemini `--generate-only` ile oluşturun ve `tx pqc cosign` ile imzalayın. Anahtar önce gelir, çünkü kayıtlı anahtarı olmayan bir hesap yalnızca kaydın kendisini gönderebilir (bkz. [PQC Anahtar Kaydı](#pqc-key-registration)) ve yetki, `create-validator` çalıştığında kontrol edilir. Ayrıntılar [Doğrulayıcı Oluşturma](#validator-license-gate) ve [PQC Anahtar Kaydı](#pqc-key-registration) bölümlerindedir.

:::caution `min-self-delegation`, 100.000 QOR tabanı değildir
Genesis doğrulayıcıları zincir üzerinde `min_self_delegation` = `1` (1 uqor) gösterir. Bu taban **değildir**: genesis işlemleri ondan muaftı. `validator.json` içindeki `min-self-delegation` alanı, en az o kadarını öz-bağlı tutma konusundaki kendi taahhüdünüzdür ve 100.000 QOR tabanıyla ilgisizdir; taban, doğrulayıcıyı oluştururken öz-delege ettiğiniz `amount` değerine uygulanır.
:::

---

## Donanım {#hardware}

Çalışan ana ağ doğrulayıcılarında ölçülmüştür (27 Ekim 2026): normal yükte yaklaşık 3,2 ila 3,5 GB RAM ve %10'un altında CPU. Bir doğrulayıcı 3 ila 4 vCPU, 8 ila 16 GB RAM ve NVMe depolamayla rahatça çalışır. Tek çekirdek hızı çekirdek sayısından daha önemlidir: ML-DSA-87 imzalarını doğrulamak bir işlemi kontrol etme işinin yaklaşık yarısıdır ve yük altında zirve yapar.

| Öğe | Önerilen doğrulayıcı profili |
| --- | --- |
| CPU | 4 vCPU, yüksek saat hızı |
| RAM | 16 GB |
| Disk | 100 GB veya daha fazla, NVMe |
| Saat | NTP ile senkronize (yukarıdaki 60 saniye kuralı) |
| Ağ | Dünyaya yalnızca P2P `26656` açık; RPC, REST ve EVM localhost'a bağlı |

Disk kullanımı nasıl katıldığınıza bağlıdır. `pruning = "custom"` (keep-recent 100000) ve `indexer = "null"` ile state sync yoluyla katılan bir doğrulayıcı iki ay sonra yaklaşık 10 GB tutar. Genesis'ten beri çalışan ve varsayılan pruning kullanan bir düğüm dört ay sonra yaklaşık 100 ila 130 GB tutar. [Düğüm Çalıştırma](/developer-guide/running-a-node#recommended-hardware) sayfasında RPC düğümleri için önerilen 500 GB veya daha fazlası, bir doğrulayıcı için cömerttir.

---

## Ağ Nasıl Yönetiliyor {#network-organisation}

27 Ekim 2026'da ağın, birkaç ülkede ve birden fazla barındırma sağlayıcısında 8 aktif doğrulayıcısı vardır. Herkese açık uç noktalar (`rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`) bir uç ağın (edge network) arkasındaki özel, doğrulayıcı olmayan düğümler tarafından sunulur, asla doğrulayıcılar tarafından değil ve doğrulayıcıların IP adresleri DNS'te yayımlanmaz. Oy gücü bonded stake'i izler: minimum öz-bağlamayla başlayan yeni bir doğrulayıcı gücün küçük bir payıyla başlar ve delegasyonlar geldikçe büyür.

---

## Doğrulayıcı Oluşturma

### Operatör yetkisi: `validator_operator` {#validator-license-gate}

`create-validator`, ikisi de zincir üzerinde uygulanan iki bağımsız kontrolle kısıtlanır ve ikisine de ihtiyacınız vardır — yalnızca büyük bir öz-bağlama yeterli değildir:

1. **Minimum 100.000 QOR öz-bağlama.**
2. İşlemi gönderen hesapta **etkin bir `validator_operator` yetkisi**.

Yetki, zincir üzerinde QoreChain Association tarafından **Validator Program** aracılığıyla verilir: Dashboard'un **Nodes & Validators** sayfasından ([Tools Hub](/dashboard/tools-hub#validator-application)) başvurun, 14 günlük deneme için diana test ağında bir doğrulayıcı çalıştırın ve seçildikten sonra **1.000 $ program ücretini** ödeyin; yetki ardından başvurunuzdaki operatör adresi için toplu halde imzalanır. Kendi yetkinizi `GET /qorechain/license/v1/check/{grantee}/validator_operator` ile kontrol edin. Bir lisansın `expires_at` değeri bir **tarih veya süre değil, bir blok yüksekliğidir** — `0` süresiz geçerlilik anlamına gelir. Yetki eksik veya süresi dolmuşsa, ne kadar öz-bağlama yaparsanız yapın `create-validator` `ErrUnauthorized` hatasıyla başarısız olur; iyi fonlanmış bir denemenin açıklanamaz görünüp başarısız olmasının en yaygın tek nedeni budur. Bu kontrol, özellikle EVM yürütme yolunun bunu görüp uygulayamaması nedeniyle vardır (oradaki tek bir ante dekoratörü bunu tamamen atlar) — staking ve doğrulamanın yalnızca Native yolunda kalmasının nedenlerinden biri de budur.

Bir `validator.json` dosyası oluşturun (bayrak tabanlı biçim mevcut SDK'dan kaldırılmıştır):

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Ardından işlemi oluşturup imzalayın (her Cosmos yolu işlemi gibi hibrit imza gerektirir; bkz. [İşlem Komutları](/cli-reference/transaction-commands#hybrid-signing)):

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Ağ ücret tabanı **gas birimi başına 0,1 uqor**'dur; dolayısıyla 600.000 gas limiti en az 60.000 uqor gerektirir.

| `validator.json` alanı         | Açıklama                                              |
| ------------------------------ | ------------------------------------------------------ |
| `amount`                       | Öz-delegasyon miktarı — **minimum 100.000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Doğrulayıcı konsensüs açık anahtarı (ed25519)          |
| `moniker`                      | Doğrulayıcınız için okunabilir ad                       |
| `commission-rate`              | Başlangıç komisyon oranı (ör. 0.10 = %10)              |
| `commission-max-rate`          | Maksimum komisyon oranı (oluşturulduktan sonra değişmez) |
| `commission-max-change-rate`   | Maksimum günlük komisyon değişim oranı                 |
| `min-self-delegation`          | En az bu kadarını öz-bağlı tutma konusundaki kendi taahhüdünüz (uqor cinsinden). 100.000 QOR'luk zincir üzerindeki taban **değildir**; taban `amount` değerine uygulanır |

İşlem onaylandıktan sonra doğrulayıcınızı doğrulayın:

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Havuz Sınıflandırması

:::note Tasarım; blok üretiminde henüz etkin değil
Aşağıdaki havuz sınıflandırması `x/qca` tasarımıdır. Parametreleri zincir üzerindedir (`qorechaind query qca config`), ancak blok önerenler henüz havuza göre seçilmez ve havuzlar ödülleri veya slashing'i henüz değiştirmez.
:::

QoreChain'in `x/qca` (Quantum Consensus Allocation) modülü bir **üç havuzlu sınıflandırma sistemi** tanımlar. Her **1.000 blokta bir** (ana ağın 3,1 sn'lik bloklarında yaklaşık 52 dakika), doğrulayıcıların itibarlarına ve stake'lerine göre üç havuzdan birine yeniden sınıflandırılması amaçlanır:

| Havuz                                 | Kriter                                              | Blok Tahsisi |
| -------------------------------------- | ---------------------------------------------------- | ------------ |
| **RPoS** (Reputation Proof-of-Stake)   | İtibar >= 70. yüzdelik dilim VE stake >= medyan       | Blokların %40'ı |
| **DPoS** (Delegated Proof-of-Stake)    | Toplam delegasyon >= 10.000 QOR                       | Blokların %35'i |
| **PoS** (Proof-of-Stake)               | Kalan tüm aktif doğrulayıcılar                        | Blokların %25'i |

Tasarımda, her havuz içindeki blok önerenler etkin stake'leri ile orantılı ağırlıklı rastgele seçimle belirlenir; böylece hem yüksek itibarlı hem de yüksek delegasyonlu doğrulayıcılar adil temsil edilirken, daha küçük doğrulayıcılar da katılabilir.

### Havuz Yapılandırmasını Sorgulama

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

JSON-RPC üzerinden:

> **Henüz sunulmuyor:** yayımlanmış hiçbir düğüm sürümü `qor_` JSON-RPC ad alanını sunmaz; bu nedenle bu çağrı bugün tüm herkese açık uç noktalarda `-32601` (method not found) döndürür. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Bağlanma Eğrisi (Bonding Curve)

:::note Tasarım; henüz etkin değil
Bağlanma eğrisi `x/qca` içinde uygulanmıştır ancak henüz ödül dağıtımına bağlı değildir; staking ödülleri bugün standart distribution modülünü izler. Aşağıdaki formül tasarımdır.
:::

Bir doğrulayıcının staking ödülünün, birden fazla faktörü birleştiren bir bağlanma eğrisi ile belirlenmesi tasarlanmıştır:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                        |
| -------- | ----------------------------------------------------------------- |
| `R`      | Ödül miktarı                                                       |
| `beta`   | Temel ödül oranı                                                   |
| `S`      | Etkin stake                                                        |
| `alpha`  | Sadakat ölçekleme sabiti                                           |
| `L`      | Sadakat süresi (kesintisiz staking süresi)                         |
| `Q(r)`   | İtibar kalite faktörü, aralık \[0.75 - 1.25]                       |
| `P(t)`   | Protokol aşaması çarpanı (ağ yaşam döngüsü boyunca ayarlanır)      |

**Önemli çıkarımlar:**

* **Sadakat süresi bonusu:** Tasarım, kesintisiz staking süresi için logaritmik bir terim ekler.
* **İtibar kalite faktörü:** 0.75 (zayıf itibar) ile 1.25 (mükemmel itibar) arasında değişir. İtibar formülü ağırlıkları zincir üzerindedir (`qorechaind query reputation params`).
* **Protokol aşaması çarpanı:** Ağ farklı aşamalardan (başlangıç, büyüme, olgunluk) geçerek olgunlaştıkça ayarlanır.

---

## Slashing {#slashing}

Bu yazının hazırlandığı sırada geçerli olan ve canlı olarak sorgulanabilen temel ihlal cezaları:

```bash
qorechaind query slashing params
```

| Parametre | Değer |
| --- | --- |
| İmzalanan blok penceresi | 10.000 blok (ana ağda blok başına 3,1 sn ile yaklaşık 8,7 saat; test ağında daha kısa) |
| Pencere başına gereken minimum imza | %5 (`min_signed_per_window` = 0.05): bir doğrulayıcı, son 10.000 bloğun **%5'inden azını** imzaladığında, yani %95'ten fazlasını kaçırdığında hapse atılır |
| Çevrimdışı kalma hapis süresi | 600 saniye (10 dakika) |
| Çevrimdışı kalma slashing oranı | Stake'in %1'i |
| Çifte imza slashing oranı | Stake'in %5'i |

Hapse atılma, sabit cezalı sabit 10 dakikalık bir zaman aşımıdır. Unbonding 21 gün (1.814.400 sn) sürer, aktif küme en fazla 100 doğrulayıcı barındırır (`max_validators`) ve her delegatörün en fazla 7 unbonding kaydı olabilir (`max_entries`). Aşağıdaki kademeli model ayrı bir tasarımdır; tekrarlayan ihlallerin üzerine ek, artan sonuçlar katmanlayacaktır ve henüz bağlı değildir.

## Kademeli Slashing

:::note Tasarım; henüz etkin değil
Kademeli slashing `x/qca` içinde uygulanmıştır ancak slashing'e bağlı değildir: yürürlükteki cezalar yukarıdaki tablodaki standart `x/slashing` değerleridir. Aşağıdaki parametreler tasarımdır (`qorechaind query qca config`).
:::

Kademeli slashing tasarımı, tekrarlayan ihlallerde cezaları kademeli olarak artırır, ancak doğrulayıcıların zamanla toparlanmasına da izin verir:

```
penalty = base_rate * escalation^effective_count * severity
```

| Parametre                       | Değer            |
| --------------------------------- | ----------------- |
| Olay başına maksimum ceza         | Stake'in %33'ü    |
| Yarı ömür (decay half-life)       | 100.000 blok       |
| Çevrimdışı kalma önem derecesi    | 1.0                |
| Çifte imza önem derecesi          | 2.0                |
| Hafif istemci saldırısı önem derecesi | 3.0            |

1. **Her ihlal, etkin sayacı artırır.** Her ihlal (çevrimdışı kalma, çifte imza vb.) doğrulayıcının etkin sayacını artırır ve bu da gelecekteki cezaları etkiler.

2. **Ceza üstel olarak artar.** Ceza, yukarıdaki formüle göre etkin sayaca bağlı olarak artar; bu nedenle tekrar eden ihlaller çok daha büyük cezalarla karşılaşır.

3. **Etkin sayaç zamanla azalır.** Etkin sayaç, 100.000 bloklık bir yarı ömürle azalır (ana ağın 3,1 sn'lik bloklarında yaklaşık 3,6 gün), bu da doğrulayıcıların iyi davranış süresinin ardından toparlanmasına imkân tanır.

4. **Tekil olaylar ile tekrarlayan ihlaller.** Kazara oluşan tek bir çevrimdışı kalma olayı küçük bir cezayla sonuçlanırken, tekrarlayan ihlaller üstel olarak artan sonuçlar doğurur.

---

## PQC Anahtar Kaydı {#pqc-key-registration}

**Post-kuantum kriptografik (PQC) açık anahtarınızı** (ML-DSA-87) `create-validator` komutunu çalıştırmadan **önce** ve mümkün olduğunca erken kaydedin: [Doğrulayıcı Hazırlığı](/dashboard/tools-hub#validator-application) paneli, başvurduğunuz andan itibaren bunu kontrol eder. Bu **isteğe bağlı değildir ve otomatik gerçekleşmez**: zincir, her Cosmos yolu işleminde hibrit bir PQC imzası zorunlu kılar, `MsgCreateValidator` muaf tutulan mesaj türlerinden biri değildir ve hiçbir hesap anahtarını otomatik olarak kaydetmez: kayıt, her hesabın (doğrulayıcı operatörleri dahil) önceden kendisinin göndermesi gereken açık bir işlemdir. Önce anahtarı oluşturun:

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` bir **sahiplik kanıtı** (proof of possession) ekler: anahtar `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` değerini imzalar ve zincir bunu doğrular; böylece hiç kimse özel yarısına sahip olmadığı bir açık anahtarı kaydedemez. v3.2.3'te isteğe bağlıdır ve önerilir. v3.2.4'ten itibaren (ana ağda 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri) hesap kaydı ayrıca bir kanıtın doğrulanıp doğrulanmadığını da bildirir (`possession_proven`, `GET /qorechain/pqc/v1/account/{address}` içinde).

:::note v3.2.3'ün anahtar kaydında değiştirdikleri
* Kayıtlı anahtarı **olmayan** bir hesap yalnızca kaydın kendisini gönderebilir: hibrit imza uzantısı taşıyan diğer tüm işlemler reddedilir. Önce kaydolun, ardından diğer her şeyi `tx pqc cosign` ile imzalayın.
* `classical_only`, boş ve dejenere anahtarlar kayıt sırasında reddedilir.
* Bir hesap bir anahtara sahip olduktan sonra, sonraki anahtar bakımı (rotasyon, geçiş, yeniden kayıt) kendisi de hibrit imzalı olmalıdır ve `authz` üzerinden gönderilemez.
* `tx pqc gen-key` mevcut bir anahtar dosyasının üzerine asla yazmaz.
:::

| Parametre      | Açıklama                                              |
| -------------- | -------------------------------------------------------- |
| `dilithium5`   | Algoritma (ML-DSA-87)                                     |
| `<pubkey-hex>` | Hex kodlamasında 2592 bayt uzunluğunda ML-DSA-87 açık anahtarı |
| `hybrid`       | Anahtar türü (hybrid = hem klasik hem PQC)                |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid`, Dilithium-5 için eşdeğer eski biçimdir.)

:::caution `--gas` değerini açıkça belirtin
ML-DSA-87 açık anahtarı 2.592 bayt uzunluğundadır ve bunu zincir üzerine yazmak varsayılan 200.000 gas limitini aşabilir (ana ağdaki kayıtlar 220.000 ile 350.000 arasında gas kullanmıştır). `--gas 600000` (veya daha yüksek) belirtilmeden işlem, belirsiz bir `out of gas` hatasıyla başarısız olabilir. Ücret en az gas limitinin 0,1 uqor ile çarpımı kadar olmalıdır; dolayısıyla `--gas 600000` için `--fees 60000uqor` veya daha fazlası gerekir.
:::

Kaydı doğrulayın:

```bash
qorechaind query pqc account <account-address>
```

`~/.qorechaind/pqc/` altındaki anahtar dosyası, hesabın post-kuantum imzalama anahtarıdır: onu anımsatıcı (mnemonic) gibi yedekleyin ve mümkün olduğunca konsensüs anahtarını çalıştıran makineden uzak tutun. Kurtarma ve rotasyon için bkz. [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration).

---

## İzleme

### Prometheus Metrikleri

QoreChain, **26660** portunda Prometheus metrikleri sunar:

```
http://localhost:26660/metrics
```

Uç noktayı, `config.toml` dosyasındaki `[instrumentation]` bölümünde `prometheus = true` ayarlayarak etkinleştirin. Düğüm, konsensüs motorunun standart metriklerini (blok yüksekliği, konsensüs turları, doğrulayıcı kümesi, eşler, mempool) sunar; düğümünüzün neleri sunduğunu `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'` ile listeleyin. Doğrulayıcı başına imzalama sağlığı en güvenilir şekilde zincirin kendisinden okunur (aşağıdaki Sağlık Kontrollerine bakın); çünkü hapse atmaya karar veren, zincirin kendi kaydıdır.

### İtibar Parametrelerini Sorgulama

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

JSON-RPC üzerinden:

> **Henüz sunulmuyor:** yayımlanmış hiçbir düğüm sürümü `qor_` JSON-RPC ad alanını sunmaz; bu nedenle bu çağrı bugün tüm herkese açık uç noktalarda `-32601` (method not found) döndürür. Bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Sağlık Kontrolleri

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Operasyonel En İyi Uygulamalar

1. **Sentry düğüm mimarisi kullanın.** Doğrulayıcınızı DDoS saldırılarından korumak için sentry düğümlerinin arkasında çalıştırın. Yalnızca sentry düğümlerini genel ağa açık tutun.

2. **Uyarı sistemi kurun.** Kaçırılan bloklar, düşük çalışma süresi ve beklenmedik yeniden başlatmalar için uyarılar yapılandırın. Birkaç kaçırılan blok normaldir; sürekli kaçırmalar slashing tetikler.

3. **Yüksek çalışma süresini koruyun.** Sürekli kesinti, doğrulayıcının hapse atılmasına (son 10.000 bloğun %5'inden azının imzalanması) ve slashing'e yol açar; bkz. [Slashing](#slashing).

4. **Yazılımı güncel tutun.** QoreChain sürümlerini takip edin ve güncellemeleri hızlıca uygulayın. Zincir yükseltmeleri için doğrulayıcı topluluğuyla koordinasyon sağlayın.

5. **Anahtarlarınızı güvende tutun.** Doğrulayıcı konsensüs anahtarını (`priv_validator_key.json`) koruyun ve yedeklerini çevrimdışı tutun; bir uzak imzalayıcı değerlendirin. Uzak imzalama (`priv_validator_laddr`) `qorechaind` yayın ikili dosyasıyla doğrulanmamıştır ve post-kuantum modül konsensüs anahtarı türünü (ed25519) değiştirmez; bu nedenle herhangi bir imzalayıcı kurulumuna güvenmeden önce test ağında deneyin. Operatör hesabının anahtarlarını ve PQC anahtar dosyasını mümkün olduğunca doğrulayıcıyı çalıştıran makineden uzak tutun.

6. **Önce bir PQC anahtarı kaydedin.** Operatör hesabının, bir doğrulayıcı oluşturabilmesi veya başka herhangi bir Cosmos yolu işlemi gönderebilmesi için kayıtlı bir ML-DSA-87 anahtarına ihtiyacı vardır.

7. **Saati senkronize tutun.** Bir NTP istemcisi çalıştırın; v3.2.1'den itibaren düğüm, saati 60 saniyeden fazla saptığında durur.

---

## Doğrulayıcı Komutları Referansı

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Ağ ücret tabanı gas birimi başına 0,1 uqor'dur. Kayıtlı PQC anahtarı **olmayan** bir operatör hesabı `unjail` işlemini yine klasik yöntemle gönderebilir; bir anahtar kaydedildikten sonra ise her işlem (unjail dahil) hibrit imza gerektirir.

---

## Bağlı Ağları Doğrulama {#connected-networks}

:::caution Henüz etkin bir bağlı ağ yok
Köprü modülü ana ağda ve test ağında dağıtılmıştır, ancak **hiçbir köprü rotası etkin değildir**: 37 zincir yapılandırmasının tamamı `pending` durumundadır, kayıtlı köprü doğrulayıcısı yoktur, hiçbir köprü işlemi hiç oluşturulmamıştır ve ana ağda hiçbir IBC kanalı açık değildir (test ağında bir transfer kanalı vardır, ancak bu bir köprü rotası değildir). Aşağıdaki çerçeve tasarımı anlatır; bugün bağlı bir ağda doğrulanacak bir şey yoktur.
:::

Tasarım (**v3.1.80** zincir sürümünden beri), bir QoreChain doğrulayıcısının [köprü](/architecture/bridge-architecture) aracılığıyla bağlanan ağların doğrulanmasına da yardımcı olmasına olanak tanır. Bu, **lisansa bağlı ve isteğe bağlı (opt-in)** bir işlevdir:

1. **Lisansa sahip olun.** Doğrulayıcının, hedef ağ için etkin bir `validator_<chain>` (veya `qcb_bridge`) lisansına sahip olması gerekir. Orkestratör, bu lisans olmadan harici bir istemciyi başlatmayı reddeder (fail-closed).
2. **Etkinleştirme istemciyi otomatik olarak sağlar.** Lisans etkinleştirildiğinde QoreChain, ilgili ağın istemcisini düğümünüzde sağlar — sabitlenmiş istemciyi indirir, yapılandırmasını oluşturur ve QoreChain'in orkestrasyonu altında çalıştırır. Etkinleştirme öncesinde hiçbir şey indirilmez.
3. **Ağın anahtarlarını ve stake'ini siz sağlayın.** Harici ağın doğrulayıcı/stake ve imzalama anahtarları ağ başına **operatör tarafından sağlanır**; QoreChain, sürücü çerçevesini ve zorunlu lisans kontrolünü sunar, harici zincirdeki stake'inizi değil.

**37 köprü ağının** tümü için sürücüler mevcuttur; bir doğrulayıcının nasıl katılabileceğine göre sınıflandırılır:

| Sınıf | Katılım | Örnekler |
| ----- | ------------- | -------- |
| İzinsiz (permissionless) doğrulayıcı | Stake yapıp çalıştırma | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Sınırlı / seçilmiş / kabul temelli | Bir sınıra veya seçime tabi stake | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| L2 tam düğüm | Tam düğüm çalıştırma (staking yok) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Staking yapmayan / güven listesi | Staking yapmadan gözlemleme / katılım | Bitcoin, Filecoin, XRPL, Stellar |

:::note
İstemci sürüm sabitlemeleri en iyi çaba (best-effort) esasına dayanır; üretim ortamında etkinleştirmeden önce hedef ağınız için üst akış (upstream) istemci sürümünü doğrulayın.
:::

## Sonraki Adımlar

* [Düğüm Çalıştırma](/developer-guide/running-a-node) — Yayın ikili dosyasını kurun, state sync ve düğüm ayarları
* [EVM Geliştirme](/developer-guide/evm-development) — QoreChain üzerinde akıllı sözleşmeler dağıtın
* [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing) — Anahtar kaydı, kurtarma ve rotasyon
