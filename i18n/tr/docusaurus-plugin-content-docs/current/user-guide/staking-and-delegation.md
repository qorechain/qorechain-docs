---
slug: /user-guide/staking-and-delegation
title: Stake Etme ve Delegasyon
sidebar_label: Stake Etme ve Delegasyon
sidebar_position: 2
---

# Stake Etme ve Delegasyon

Bu kılavuz, QOR tokenlarını doğrulayıcılara nasıl delege edeceğinizi, doğrulayıcılar arasında nasıl yeniden delege edeceğinizi (redelegate), stake'inizin bağını nasıl çözeceğinizi (unbond), ödülleri nasıl talep edeceğinizi ve QoreChain'in Triple-Pool stake etme mimarisini nasıl anlayacağınızı kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** test ağını (EVM chain ID **9800**) kullanır. Ana ağ (**`qorechain-vladi`**, EVM chain ID **9801**) 7 Haziran 2026'dan beri **v3.1.80** zincir sürümünü çalıştırarak yayında — ana ağda stake ederken **Ana Ağa Bağlanma** sayfasındaki ana ağ chain ID'sini ve uç noktalarını kullanın.
:::

---

## Token Delege Etme

Stake etme ödülleri kazanmak ve ağ güvenliğine katılmak için bir doğrulayıcıya QOR delege edin:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:** Bir doğrulayıcıya 100 QOR delege edin:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Yeniden Delege Etme

Bağ çözme süresini beklemeden delegasyonunuzu bir doğrulayıcıdan diğerine taşıyın:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

:::caution
Zaten bir yeniden delege etme aktarımında olan tokenları yeniden delege edemezsiniz. Başka bir tane başlatmadan önce mevcut yeniden delege etme işleminin tamamlanmasını bekleyin.
:::

---

## Bağ Çözme

Delege ettiğiniz tokenları bir doğrulayıcıdan geri çekin. Bağ çözme işleminin tamamlanması **21 gün** sürer ve bu süre boyunca tokenlar ödül kazanmaz ve transfer edilemez.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Örnek:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

21 günlük bağ çözme süresinden sonra, tokenlar otomatik olarak hesabınıza iade edilir.

---

## Ödülleri Talep Etme

Delege ettiğiniz her doğrulayıcıdan birikmiş tüm stake etme ödüllerini geri çekin:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Yalnızca belirli bir doğrulayıcıdan ödülleri geri çekmek için:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Stake etme ödülleri, her işlem ücretinin stake eden payı (%10) ile birlikte, Tokenomics v2.1 takvimi kapsamında protokolün 590M QOR stake etme havuzundan finanse edilir.

---

## Triple-Pool Sınıflandırması

QoreChain, doğrulayıcıları itibarlarına ve delegasyon seviyelerine göre üç havuza sınıflandıran bir **Triple-Pool** stake etme modeli kullanır. Her havuz, blok ödüllerinden ağırlıklı bir pay alır.

| Havuz                                | Giriş Kriterleri                                              | Ödül Ağırlığı |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | İtibar puanı >= 70. yüzdelik dilim **VE** stake >= medyan | 40%           |
| **DPoS** (Delegated Proof of Stake)  | Toplam delegasyon >= 10.000 QOR                              | 35%           |
| **PoS** (Proof of Stake)             | Kalan tüm doğrulayıcılar                                    | 25%           |

Doğrulayıcılar her epoch sınırında yeniden sınıflandırılır. Güçlü bir itibar oluşturan ve yeterli stake biriktiren bir doğrulayıcı, en yüksek ödül payını kazanarak RPoS havuzuna yükseltilir.

---

## Bağlanma Eğrisi Ödülleri

Bireysel stake etme ödülleri, QoreChain'in bağlanma eğrisi formülü kullanılarak hesaplanır:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Dönem için ödül miktarı                                         |
| `beta`   | Temel ödül oranı (protokol parametresi)                                |
| `S`      | Stake edilen miktar                                                        |
| `alpha`  | Sadakat katsayısı (protokol parametresi)                             |
| `L`      | Epoch cinsinden kilit süresi                                              |
| `Q(r)`   | Doğrulayıcının itibar puanından `r` türetilen kalite çarpanı |
| `P(t)`   | `t` zamanındaki havuz çarpanı (havuza bağlı olarak %40, %35 veya %25)     |

Daha uzun kilit süreleri ve daha yüksek itibar puanları orantılı olarak daha büyük ödüllerle sonuçlanır; bu, uzun vadeli bağlılığı ve iyi doğrulayıcı davranışını teşvik eder.

---

## Doğrulayıcı Bilgilerini Sorgulama

Herhangi bir doğrulayıcı hakkındaki ayrıntıları arayın:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Örnek:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Tüm aktif doğrulayıcıları listeleyin:

```bash
qorechaind query staking validators --status bonded
```

Mevcut delegasyonlarınızı sorgulayın:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* **RPoS havuzundaki** doğrulayıcılara delege etmek, %40 havuz ağırlığı nedeniyle en yüksek ödülleri sağlar.
* Doğrulayıcı itibarı oluşturmak zaman alır. Delege etmeden önce doğrulayıcının geçmiş performansını göz önünde bulundurun.
* Yeniden delege etme anlıktır ancak bekleme süresi kısıtlamaları vardır. Hamlelerinizi dikkatlice planlayın.
* 21 günlük bağ çözme süresi bir güvenlik önlemidir. Bu süre zarfında slashing olayları tokenlarınızı hâlâ etkileyebilir.

:::
