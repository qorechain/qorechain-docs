---
slug: /user-guide/staking-and-delegation
title: Stake ve Delegasyon
sidebar_label: Stake ve Delegasyon
sidebar_position: 2
---

# Stake ve Delegasyon

Bu kılavuz, QOR token'larını doğrulayıcılara (validator) delege etme, doğrulayıcılar arasında yeniden delege etme (redelegate), stake'inizi çözme (unbond), ödülleri talep etme ve QoreChain'in Üçlü Havuz (Triple-Pool) stake mimarisini anlama konularını kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM zincir kimliği **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri **v3.1.95** zincir sürümünü çalıştırarak canlıdır — mainnet üzerinde stake yaparken zincir kimliğini ve uç noktaları **Mainnet'e Bağlanma** sayfasından alarak değiştirin.
:::

## Bağlayıcı bir süre var mı? {#lock-in-period}

**Bugün itibarıyla**, hayır — seçmeniz gereken bir vade yok, çünkü stake burada bir borsada olduğu gibi sabit sürelerle satılmıyor. Delegasyon, siz undelegate etmeyi seçene kadar bir sonraki bloktan itibaren ödüller akmaya devam ederek istediğiniz kadar aktif kalır; süresi dolan ya da yenilenmesi gereken hiçbir şey yoktur. Bu kılavuz boyunca referans verilen **21 günlük çözülme (unbonding) süresi**, önceden kabul ettiğiniz bir bağlayıcı süre değildir — yalnızca undelegate etmeyi *talep ettiğinizde* başlar ve yalnızca çıkardığınız QOR için geçerlidir. Bir delegasyonu doğrulayıcılar arasında taşımak (redelegate), stake hiçbir zaman bonded havuzdan ayrılmadığı için bu bekleme süresini tamamen atlar. Aşağıda [bonding curve](#bonding-curve) bölümünde bahsedilen "sadakat" bonusu, *şu ana kadar ne kadar süredir delege kaldığınıza* bağlı bir ödül oranı etkisidir — o da otomatiktir ve seçilecek bir vadesi yoktur, undelegate etmediğiniz sürece basitçe büyür.

Bu, mevcut zincir davranışını tanımlar, kalıcı bir garanti değildir — minimum bir stake süresi, bu sayfadaki diğer herhangi bir stake parametresinin oylamayla değişebileceği gibi, gelecekte governance tarafından getirilebilecek bir parametredir. Bu gerçekleşirse, cüzdan bir delegasyonu onaylamadan önce ortaya çıkan bekleme süresini (varsa minimum süre artı 21 günlük çözülme) gösterecek ve bu sayfa buna uygun şekilde güncellenecektir.

---

## Token Delege Etme

Stake ödülleri kazanmak ve ağ güvenliğine katılmak için QOR'u bir doğrulayıcıya delege edin:

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

## Yeniden Delege Etme (Redelegation)

Çözülme (unbonding) süresini beklemeden delegasyonunuzu bir doğrulayıcıdan diğerine taşıyın:

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

Yeniden delege etmenin **kendine ait hiçbir cezası ve hiçbir kilidi yoktur** — stake hiçbir zaman bonded havuzdan ayrılmaz, ödül kazanmayı hiç durdurmaz ve istediğiniz zaman tekrar taşınabilir. 21 günlük çözülme süresine hiç tabi değildir; bu süre yalnızca `unbond` için geçerlidir.

:::caution Gerçek sınır bir bekleme süresi değil, bir sayaçtır
Bir delegatör, tam olarak aynı (delegatör, kaynak doğrulayıcı, hedef doğrulayıcı) rotası için aynı anda en fazla **7 adet devam eden (in-flight) yeniden delegasyon kaydına** sahip olabilir — her kayıt olgunlaştıkça kendiliğinden temizlenir ve bir yer açar. Bu, normal kullanımın pratikte hiç ulaşmayacağı bir tavan sınırıdır, "tekrar yeniden delege etmeden önce bekleyin" kuralı değildir; başka doğrulayıcılara veya başka doğrulayıcılardan serbestçe yeniden delege edebilir, ya da bir yer açıldığında aynı rotayı tekrar kullanabilirsiniz.
:::

---

## Çözülme (Unbonding)

Delege edilmiş token'larınızı bir doğrulayıcıdan geri çekin. Çözülme süresi **21 gün** sürer; bu süre boyunca token'lar ödül kazanmaz ve transfer edilemez.

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

21 günlük çözülme süresinin ardından token'lar otomatik olarak hesabınıza geri döner.

---

## Ödülleri Talep Etme

Delege ettiğiniz her doğrulayıcıdan birikmiş tüm stake ödüllerini çekin:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Yalnızca belirli bir doğrulayıcıdan ödül çekmek için:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Stake ödülleri iki kaynaktan finanse edilir: protokolün sınırlandırılmış emisyon bütçesi (güncel sınır için, 26 Ağustos 2026'daki governance değişikliğinden bu yana yürürlükte olan haliyle [Tokenomics](/architecture/tokenomics#staking-reward-schedule) sayfasına bakın) ve her işlem ücretinin staker payı.

---

## Üçlü Havuz (Triple-Pool) Sınıflandırması

QoreChain, doğrulayıcıları itibar (reputation) ve delegasyon seviyelerine göre üç havuza ayıran bir **Üçlü Havuz** stake modeli kullanır. Her havuz, blok ödüllerinden ağırlıklı bir pay alır.

| Havuz                                 | Giriş Kriteri                                                | Ödül Ağırlığı |
| ------------------------------------- | ------------------------------------------------------------- | -------------- |
| **RPoS** (Reputation Proof of Stake)  | İtibar puanı >= 70. yüzdelik dilim **VE** stake >= medyan     | %40            |
| **DPoS** (Delegated Proof of Stake)   | Toplam delegasyon >= 10.000 QOR                                | %35            |
| **PoS** (Proof of Stake)              | Kalan tüm doğrulayıcılar                                       | %25            |

Doğrulayıcılar her epoch sınırında yeniden sınıflandırılır. Güçlü bir itibar oluşturan ve yeterli stake biriktiren bir doğrulayıcı, en yüksek ödül payını kazanarak RPoS havuzuna terfi ettirilir.

---

## Bonding Curve Ödülleri {#bonding-curve}

Bireysel stake ödülleri, QoreChain'in bonding curve formülü kullanılarak hesaplanır:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                              |
| -------- | ----------------------------------------------------------------------- |
| `R`      | Dönem için ödül miktarı                                                 |
| `beta`   | Temel ödül oranı (protokol parametresi)                                 |
| `S`      | Stake edilen miktar                                                     |
| `alpha`  | Sadakat katsayısı (protokol parametresi)                                |
| `L`      | Epoch cinsinden kilit süresi                                            |
| `Q(r)`   | Doğrulayıcının `r` itibar puanından türetilen kalite çarpanı            |
| `P(t)`   | `t` anındaki havuz çarpanı (havuza bağlı olarak %40, %35 veya %25)      |

Daha uzun kilit süreleri ve daha yüksek itibar puanları, orantılı olarak daha büyük ödüllerle sonuçlanır; bu da uzun vadeli taahhüdü ve iyi doğrulayıcı davranışını teşvik eder.

---

## Doğrulayıcı Bilgisi Sorgulama

Herhangi bir doğrulayıcı hakkındaki ayrıntılara bakın:

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

* **RPoS havuzundaki** doğrulayıcılara delege etmek, %40'lık havuz ağırlığı nedeniyle en yüksek ödülleri sağlar.
* Doğrulayıcı itibarının oluşması zaman alır. Delege etmeden önce doğrulayıcının geçmiş performansını göz önünde bulundurun.
* Yeniden delegasyon anındadır, cezası ve kilidi yoktur — tek sınır, normal kullanımın ulaşmayacağı, tam olarak aynı rota üzerindeki eş zamanlı yeniden delegasyonlar için 7 kayıtlık bir tavandır.
* 21 günlük çözülme süresi bir güvenlik önlemidir. Bu süre boyunca slashing (cezalandırma) olayları token'larınızı yine de etkileyebilir.

:::
