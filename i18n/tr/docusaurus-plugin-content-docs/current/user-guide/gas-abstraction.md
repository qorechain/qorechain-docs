---
slug: /user-guide/gas-abstraction
title: Gas Soyutlama
sidebar_label: Gas Soyutlama
sidebar_position: 7
---

# Gas Soyutlama

Bu sayfa, tasarımı kullanıcıların işlem ücretlerini QOR yerine kabul edilen yerel olmayan bir tokenla ödemesine olanak tanıyan QoreChain'in gas soyutlama özelliğini açıklar. **Bugün hiçbir ağda kullanılamaz**; bu sayfa tasarımı ve bunun yerine ne yapacağınızı açıklar.

:::caution Henüz kullanılamıyor
Ücretleri yerel olmayan bir tokenla ödemek bugün ana ağda (**`qorechain-vladi`**, düğüm sürümü **v3.2.1**) veya test ağında (**`qorechain-diana`**) **çalışmaz**.

* Gas soyutlama sorguları ana ağda sunulmaz: `qorechaind query gasabstraction accepted-tokens` yardım metnini yazdırır ve `/qorechain/gasabstraction/v1/config` REST yolu `Not Implemented` döndürür.
* Hiçbir ağda açık bir IBC kanalı yoktur; bu nedenle ödeme yapılabilecek bir `ibc/USDC` veya `ibc/ATOM` bakiyesi var olamaz.
* Ağ ücret tabanı `uqor` cinsinden kontrol edilir; bu nedenle başka bir birimdeki ücret reddedilir.

Her ücreti `uqor` ile ödeyin. Canlı bir ağda bir token kabul edildiğinde bu sayfa güncellenecektir.
:::

---

## Bugün çalışan: ücretleri uqor ile ödeyin

Her işlem gas birimi başına en az **0,1 uqor** öder. Gas limitini ve ücreti birlikte ayarlayın:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Ardından [İşlem Komutları](/cli-reference/transaction-commands#hybrid-signing) bölümünde açıklandığı gibi `qorechaind tx pqc cosign` ile hibrit imzalayıp yayınlayın. İşlem türü başına önerilen limitler için bkz. [Ücretler ve gas](/cli-reference/transaction-commands#fees-and-gas).

---

## Genel Bakış

Gas soyutlama, işlem ücretlerini ödemek için QOR tutma gerekliliğini ortadan kaldırmak üzere tasarlanmıştır. Kabul edilen alternatif bir token tutan kullanıcı (örneğin IBC ile transfer edilen bir stablecoin), ücreti o tokenla öder ve protokol, işlemeden önce ücret tutarını yerel eşdeğerine dönüştürür.

---

## Hedeflenen tasarım

### Kabul Edilen Tokenlar

Modülün genesis yapılandırması bu tokenları ve protokol tarafından tanımlanan dönüşüm oranlarını listeler. Bunlar ücret amaçlı değişim oranlarıdır, piyasa fiyatları değildir. Bugün ağlarda yalnızca `uqor` var olabilir (yukarıdaki bildirime bakın).

| Token              | Birim        | Dönüşüm Oranı   |
| ------------------ | ------------ | --------------- |
| **QOR**            | `uqor`       | 1.0 (yerel)     |
| **USDC** (IBC ile) | `ibc/USDC`   | 1.0             |
| **ATOM** (IBC ile) | `ibc/ATOM`   | 10.0            |

### Nasıl çalışması amaçlanıyor

QoreChain'in `GasAbstractionDecorator`'ı işlem işleme hattında yer alır. Ücreti yerel olmayan bir birimde olan bir işlem için:

1. **Ücret İncelemesi** — decorator ücret birimini okur.
2. **Oran Araması** — birim kabul edilen tokenlar listesindeyse, ilgili dönüşüm oranı aranır.
3. **Dönüşüm** — ücret, yerel `uqor` eşdeğerine dönüştürülür.
4. **Standart İşleme** — dönüştürülen ücret standart ücret kesinti işleyicisinden geçer; böylece alt seviye ücret işlemleri (doğrulayıcılara dağıtım, yakma, hazine, staker ve hafif düğüm payları) yerel eşdeğer üzerinde çalışır.

---

## Yapılandırmayı sorgulama

Ana ağ henüz gas soyutlama sorgularını sunmaz ve `qor_getGasAbstractionConfig` JSON-RPC yöntemi hiçbir genel uç noktada sunulmaz (bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace)). Şu anda canlı bir kabul edilen token listesini okumanın genel bir yolu yoktur.
