---
slug: /user-guide/gas-abstraction
title: Gas Soyutlama
sidebar_label: Gas Soyutlama
sidebar_position: 7
---

# Gas Soyutlama

Bu kılavuz, kullanıcıların işlem ücretlerini QOR yerine yerel olmayan tokenlarla ödemesine olanak tanıyan QoreChain'in gas soyutlama özelliğini açıklar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM chain ID **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.82** zincir sürümünü çalıştırarak yayında — mainnet üzerinde işlem yaparken **Mainnet'e Bağlanma** sayfasındaki mainnet chain ID'sini ve uç noktalarını kullanın.
:::

---

## Genel Bakış

Gas soyutlama, işlem ücretlerini ödemek için QOR token tutma gerekliliğini ortadan kaldırır. Kabul edilen alternatif tokenları (IBC ile transfer edilen USDC veya ATOM gibi) tutan kullanıcılar, bu tokenları doğrudan ücret ödemesi olarak kullanabilir. Protokol, işlemeden önce ücret tutarını otomatik olarak yerel eşdeğerine dönüştürür.

---

## Kabul Edilen Tokenlar

Aşağıdaki tokenlar ücret ödemesi için kabul edilir:

| Token              | Birim        | Dönüşüm Oranı   | Örnek Ücret          |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (yerel)     | `--fees 500uqor`     |
| **USDC** (IBC ile) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (IBC ile) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
Dönüşüm oranları, piyasa fiyatlarını değil, protokol tarafından tanımlanan değişim oranını yansıtır. ATOM için 10.0 oranı, ücret amaçları açısından 1 birim ibc/ATOM'un 10 birim uqor'a eşdeğer olduğu anlamına gelir.
:::

---

## Nasıl Çalışır

QoreChain'in `GasAbstractionDecorator`'ı işlem işleme hattına entegre edilmiştir. Bir işlem, yerel olmayan bir birimde ücret içerdiğinde aşağıdakiler gerçekleşir:

1. **Ücret İncelemesi** — Decorator, işlemde belirtilen ücret birimini kontrol eder.
2. **Oran Araması** — Birim kabul edilen tokenlar listesindeyse, protokol ilgili dönüşüm oranını arar.
3. **Dönüşüm** — Ücret tutarı, dönüşüm oranı kullanılarak yerel uqor eşdeğerine dönüştürülür.
4. **Standart İşleme** — Dönüştürülen ücret, gönderenin hesabından düşülmek üzere standart `DeductFee` işleyicisine aktarılır. Dönüşüm, işlem hattının geri kalanı için şeffaftır. Tüm alt seviye ücret işlemleri (doğrulayıcılara dağıtım, yakma, hazine tahsisi, staker ödülleri ve hafif düğüm ödülleri) yerel uqor eşdeğeri üzerinde çalışır.

---

## Kullanım Örnekleri

### Ücretleri USDC ile Ödeme

Ücretleri USDC ile ödenen bir token transferi gönderin:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

USDC'nin 1.0 dönüşüm oranı olduğundan, 500 ibc/USDC, 500 uqor'a eşdeğerdir.

### Ücretleri ATOM ile Ödeme

Ücretleri ATOM ile ödenen bir token transferi gönderin:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

ATOM'un 10.0 dönüşüm oranı olduğundan, 50 ibc/ATOM, 500 uqor'a eşdeğerdir.

---

## Kabul Edilen Tokenları Sorgulama

Gas soyutlama için şu anda kabul edilen tokenların listesini, dönüşüm oranlarıyla birlikte alın:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Örnek çıktı:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## JSON-RPC Erişimi

JSON-RPC aracılığıyla entegre olan uygulamalar için gas soyutlama yapılandırmasını sorgulayın:

```
qor_getGasAbstractionConfig
```

**İstek:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Yanıt:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* Gas soyutlama, henüz QOR tutmayabilecek, diğer ekosistemlerden katılan kullanıcılar için idealdir.
* Dönüşüm oranları yönetişim tarafından belirlenir ve parametre değişikliği teklifleri aracılığıyla güncellenebilir.
* Birden fazla kabul edilen token tutuyorsanız, herhangi bir işlem türünde ücretler için bunlardan herhangi biri kullanılabilir.
* `--fees` içinde belirtilen asıl token hesabınızdan düşülür. Dönüşüm yalnızca ücretin asgari gereksinimi karşıladığını doğrulamak için kullanılır.

:::
