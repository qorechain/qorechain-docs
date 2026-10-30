---
slug: /user-guide/gas-abstraction
title: Gas Soyutlama
sidebar_label: Gas Soyutlama
sidebar_position: 7
---

# Gas Soyutlama

Gas soyutlama, bir kullanıcının işlem ücretini QOR yerine kabul edilen yerel olmayan bir tokenla ödemesine olanak tanır. Ücret dönüştürme kodu zincirin bir parçasıdır, ancak **bugün hiçbir ağda yerel olmayan hiçbir token kabul edilmemektedir**; bu nedenle her ücret QOR ile ödenir. Bu sayfa nelerin canlı olduğunu, dönüştürmenin inşa edildiği şekliyle nasıl çalıştığını ve bunun yerine ne yapacağınızı açıklar.

:::caution Henüz kullanılamıyor: her ücreti uqor ile ödeyin
Ana ağda (**`qorechain-vladi`**) ve test ağında (**`qorechain-diana`**), sırasıyla düğüm sürümü **v3.2.5** ve **v3.2.6** üzerinde (mainnet v3.2.5 yükseltmesinden sonra 30 Ekim 2026'da, testnet 27 Ekim 2026'da yeniden kontrol edildi):

* Canlı kabul edilen token listesi **yalnızca `uqor`** içerir. Ücret dönüştürme v3.2.2 ile açıldı, ancak başka hiçbir şey listelenmemiştir, blok başına dönüştürme sınırı `0`'dır (dönüştürme kapalı) ve dönüştürme float'ında bakiye yoktur. Başka herhangi bir birimde ödenen bir ücret, simülasyonda olduğu gibi gerçek bir işlemde de "denom not accepted for fee payment" hatasıyla reddedilir.
* Ana ağda IBC kanalı yoktur ve testnet'in tek test kanalı hiçbir `ibc/…` tokenını kabul edilen bir ücret tokenı yapmaz (liste yalnızca `uqor`'dur); bu nedenle `uqor`'dan başka ödeme yapılabilecek bir şey yoktur.

Her ücreti `uqor` ile ödeyin. Canlı bir ağda bir token kabul edildiğinde bu sayfa güncellenecektir.
:::

---

## Bugün çalışan: ücretleri uqor ile ödeyin

Her işlem gas birimi başına en az **0.1 uqor** öder. Gas limitini ve ücreti birlikte ayarlayın:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Ardından [İşlem Komutları](/cli-reference/transaction-commands#hybrid-signing) bölümünde açıklandığı gibi `qorechaind tx pqc cosign` ile hibrit imzalayıp yayınlayın. İşlem türü başına önerilen limitler için bkz. [Ücretler ve gas](/cli-reference/transaction-commands#fees-and-gas).

---

## Canlı yapılandırma {#live-configuration}

Modül yapılandırmasını REST ve gRPC üzerinden sunar. Bunlar, her iki ağdaki 27 Ekim 2026 tarihli değerlerdir:

| Alan | Değer | Anlamı |
| --- | --- | --- |
| `enabled` | `true` | Modül anahtarı |
| `native_denom` | `uqor` | Her ücretin nihayetinde ödendiği birim |
| `accepted_tokens` | yalnızca `uqor` | Ücret ödeyebilen tokenlar. `uqor` için fiyat kaynağı gerekmez |
| `premium_bps` | `300` | Float'ın fiyat riskini karşılamak için elinde tuttuğu, dönüştürülmüş bir ücretin değerinin payı (%3) |
| `max_tip_multiplier` | `3` | Dönüştürülmüş bir ücret, gas'ı için asgari ücretin bu katını aşamaz; `0` sınır olmaması anlamına gelir |
| `float_min` | `0` | Float'ın her zaman ayrı tuttuğu yerel bakiye |
| `block_conversion_cap` | `0` | Float'ın blok başına ödeyebileceği azami tutar; `0` dönüştürmenin kapalı olduğu anlamına gelir |

Bu sayfanın önceki sürümleri, sabit oranlı `ibc/USDC` ve `ibc/ATOM` yer tutucu girdilerini gösteriyordu. Bunlar canlı listede yoktur.

Kendiniz okuyun:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate`; `rate`, `effective_rate` (prim düşülmüş oran), `price_source` değerlerini ve tokenın bu yükseklikte `usable` olup olmadığını, değilse bir `reason` ile birlikte bildirir. `float`, float'ın adresini ve bakiyelerini ve geçerli bloğun `block_cap` karşısındaki kullanımını bildirir. `qor_getGasAbstractionConfig` JSON-RPC yöntemi hiçbir genel uç noktada sunulmaz (bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace)); REST veya gRPC kullanın.

---

## Dönüştürme nasıl çalışır (inşa edildiği şekliyle) {#how-it-works}

v3.2.2'den beri ücret decorator'ı her işlemi iki yoldan birine yönlendirir:

* `uqor` cinsinden veya birden fazla birimde bir ücret, değişmeden **yerel yoldan** geçer.
* **Tam olarak bir** yerel olmayan birimde bir ücret, **dönüştürme yolundan** geçer.

Dönüştürme yolunda:

1. **Kabul edildi mi?** Birim kabul edilen token listesinde olmalı ve bir fiyat kaynağına sahip olmalıdır, aksi halde işlem reddedilir.
2. **Fiyat.** Tokenın fiyatı iki kaynaktan birinden gelir: belirtilen bir blok yüksekliğinde süresi dolan, yönetişimle belirlenmiş statik bir oran veya tokenı QOR ile eşleştiren [AMM](/architecture/amm) havuzunun zaman ağırlıklı ortalama fiyatı. Bir havuz fiyatı yalnızca havuz aktifse, QOR tarafında yapılandırılmış asgari likiditeyi tutuyorsa ve anlık fiyatı ortalamasından yapılandırılmış sapma içindeyse kullanılır.
3. **Değer.** Ücretin yerel değeri, token tutarının fiyatla çarpımından primin düşülmesiyle bulunur.
4. **Yerel ücretle aynı kurallar.** Yerel asgari ücret ve dinamik ücret kuralları bu yerel değere uygulanır; bu nedenle dönüştürülmüş bir ücret, bir QOR ücretinin aşması gerekeni tam olarak aşmalıdır (taban olarak gas birimi başına 0.1 uqor) ve `max_tip_multiplier` ile sınırlıdır.
5. **Uzlaştırma.** Ödeyenin tokenları gas soyutlama modülünün **float**'ına gider ve float, yerel değeri `uqor` olarak ücret toplayıcıya öder. Ücret toplayıcının sonrasındaki her şey (yakma, doğrulayıcı, staker, hazine ve hafif düğüm payları) bu nedenle yalnızca `uqor` görür.

Dönüştürme üç şekilde sınırlıdır: işlem başına (`max_tip_multiplier`), blok başına (`block_conversion_cap`) ve float'ın her zaman ayrı tuttuğu bakiye ile (`float_min`). Her ret simülasyon sırasında da gerçekleşir, bu nedenle gas tahmini gerçek işlemin başarısız olacağı şekilde başarısız olur.

### Bir tokenın kabul edilmesini sağlama

* **Yönetişim**, yapılandırmayı `MsgUpdateConfig` ile değiştirir (yetki: yönetişim modülü hesabı). Gerçek bir `ibc/<hash>` ücret tokenı ve havuzu ya da statik oranı bu şekilde eklenir ve dönüştürme açılır.
* **Float**, olağan bank gönderimlerini reddeden bir modül hesabıdır. `MsgFundFloat` ile (`qorechaind tx gasabstraction fund-float <amount>uqor`), örneğin bu amaçla topluluk havuzu harcaması almış bir hesap tarafından fonlanır.

Ana ağda bunlardan herhangi birini yapmak için bir öneri yapılmamıştır ve bir öneri geçene kadar liste yalnızca `uqor` olarak kalır.
