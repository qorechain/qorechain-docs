---
slug: /user-guide/staking-and-delegation
title: Stake ve Delegasyon
sidebar_label: Stake ve Delegasyon
sidebar_position: 2
---

# Stake ve Delegasyon

Bu kılavuz, QOR token'larını doğrulayıcılara (validator) delege etme, doğrulayıcılar arasında yeniden delege etme (redelegate), stake'inizi çözme (unbond), ödülleri talep etme ve QoreChain'in stake tasarımının hangi bölümlerinin bugün canlı olduğunu anlama konularını kapsar.

:::note
Aşağıdaki komutlar **`qorechain-diana`** testnet'ini (EVM zincir kimliği **9800**) kullanır. Mainnet (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri canlıdır ve **v3.2.4** sürümünü çalıştırır (23 Ekim 2026'da uygulandı); testnet v3.2.6 çalıştırır (27 Ekim 2026'dan beri). Mainnet üzerinde stake yaparken zincir kimliğini ve uç noktaları **Mainnet'e Bağlanma** sayfasından alarak değiştirin.
:::

:::caution `tx pqc cosign` ile imzalayın
Mainnet ve testnet, her Cosmos şeridi işleminde hibrit post-kuantum imza gerektirir; bu nedenle bu sayfadaki komutlar yazıldığı haliyle yayınlanmaz. Bir komuta `--generate-only > tx.json` ekleyin, ardından `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` komutunu çalıştırın. Bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) ve [Panel](/dashboard/staking-and-validators) bu imzalamayı sizin için yapar.
:::

## Bağlayıcı bir süre var mı? {#lock-in-period}

**Olağan delegasyon için**, hayır — seçmeniz gereken bir vade yok, çünkü stake burada bir borsada sıklıkla olduğu gibi sabit sürelerle satılmıyor. Delegasyon, siz undelegate etmeyi seçene kadar bir sonraki bloktan itibaren ödüller akmaya devam ederek istediğiniz kadar aktif kalır; süresi dolan ya da yenilenmesi gereken hiçbir şey yoktur. Bu kılavuz boyunca referans verilen **21 günlük çözülme (unbonding) süresi**, önceden kabul ettiğiniz bir bağlayıcı süre değildir — yalnızca undelegate etmeyi *talep ettiğinizde* başlar ve yalnızca çıkardığınız QOR için geçerlidir. Bir delegasyonu doğrulayıcılar arasında taşımak (redelegate), stake hiçbir zaman bonded havuzdan ayrılmadığı için bu bekleme süresini tamamen atlar. Aşağıdaki [bonding curve](#bonding-curve) bölümündeki "sadakat" terimi QoreChain'in tasarımının bir parçasıdır, ancak **bugün canlı zincir tarafından uygulanmaz**; dolayısıyla ne kadar süre delege kaldığınız ödül oranınızı değiştirmez. İsteğe bağlı, zamana kilitli bir stake biçimi v3.2.4'ten beri (23 Ekim 2026) mainnet'te ve 19 Ekim 2026'dan beri testnet'te mevcuttur; kilit yalnızca siz oluşturursanız olur. Bkz. [Zamana kilitli stake (v3.2.4)](#time-locked-staking).

Bu, mevcut mainnet davranışını tanımlar, kalıcı bir garanti değildir — minimum bir stake süresi, bu sayfadaki diğer herhangi bir stake parametresinin oylamayla değişebileceği gibi, gelecekte governance tarafından getirilebilecek bir parametredir. Bu gerçekleşirse, cüzdan bir delegasyonu onaylamadan önce ortaya çıkan bekleme süresini (varsa minimum süre artı 21 günlük çözülme) gösterecek ve bu sayfa buna uygun şekilde güncellenecektir.

---

## Token Delege Etme

Ağ güvenliğine katılmak için QOR'u bir doğrulayıcıya delege edin. Delegatörler, doğrulayıcının kazandığı ödüllerden, doğrulayıcının komisyonu düşüldükten sonra bir pay alır:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Örnek:** Bir doğrulayıcıya 100 QOR delege edin:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Yeniden Delege Etme (Redelegation)

Çözülme (unbonding) süresini beklemeden delegasyonunuzu bir doğrulayıcıdan diğerine taşıyın:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Örnek:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Yeniden delege etmenin **kendine ait hiçbir cezası ve hiçbir kilidi yoktur** — stake hiçbir zaman bonded havuzdan ayrılmaz, ödül kazanmayı hiç durdurmaz ve hemen geçerli olur. 21 günlük çözülme süresine hiç tabi değildir; bu süre yalnızca `unbond` için geçerlidir. Standart bir stake kuralı geçerlidir: bir doğrulayıcıya **taşıdığınız** stake, ilk taşıma olgunlaşana (21 gün) kadar o doğrulayıcıdan **tekrar** yeniden delege edilemez; bu arada onu yine `unbond` edebilir veya diğer stake'inizi yeniden delege edebilirsiniz.

:::caution Gerçek sınır bir bekleme süresi değil, bir sayaçtır
Bir delegatör, tam olarak aynı (delegatör, kaynak doğrulayıcı, hedef doğrulayıcı) rotası için aynı anda en fazla **7 adet devam eden (in-flight) yeniden delegasyon kaydına** sahip olabilir — her kayıt olgunlaştıkça kendiliğinden temizlenir ve bir yer açar. Bu, normal kullanımın pratikte hiç ulaşmayacağı bir tavan sınırıdır, genel bir "tekrar yeniden delege etmeden önce bekleyin" kuralı değildir.
:::

---

## Çözülme (Unbonding)

Delege edilmiş token'larınızı bir doğrulayıcıdan geri çekin. Çözülme süresi **21 gün** sürer; bu süre boyunca token'lar ödül kazanmaz ve transfer edilemez.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Örnek:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

21 günlük çözülme süresinin (1,814,400 saniye) ardından token'lar otomatik olarak hesabınıza geri döner. Bir delegatör, doğrulayıcı başına aynı anda en fazla 7 çözülme kaydına sahip olabilir.

---

## Ödülleri Talep Etme

Delege ettiğiniz her doğrulayıcıdan birikmiş tüm stake ödüllerini çekin:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Yalnızca belirli bir doğrulayıcıdan ödül çekmek için:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Stake ödülleri iki kaynaktan finanse edilir: protokolün sınırlandırılmış emisyon bütçesi (dönem başına güncel miktar ve sınır için [Tokenomics](/architecture/tokenomics#staking-reward-schedule) sayfasına bakın; ikisi de governance tarafından belirlenir — en son 19 Ekim 2026'daki 10 numaralı öneri) ve her işlem ücretinin staker payı (v3.2.0 yükseltmesinden bu yana normal bir stake ödülü olarak dağıtılır; bkz. [sıkışıp kalan staker payı](/architecture/tokenomics#stranded-and-reserve)). Ödüller doğrulayıcının komisyonuna ve ağ etkinliğine bağlıdır ve garanti edilmez.

---

## Zamana kilitli stake (v3.2.4) {#time-locked-staking}

:::note Bu ne zaman geçerli olur
v3.2.4 sürümü, isteğe bağlı bir zamana kilitli stake modülü olan `x/stakingtier`'ı ekler. **`qorechain-diana` testnet'inde** 19 Ekim 2026'dan beri, **mainnet'te** ise 23 Ekim 2026'dan beri canlıdır (yönetişim önerisi 13 ile 3,742,566 yüksekliğinde uygulandı). Kilitleme bir seçenek olarak sunulur ve olağan delegasyon kilitsiz kalır (bkz. [yukarıda](#lock-in-period)). Aşağıdaki mekanizma, 23 Ekim 2026'da canlı mainnet ve testnet parametrelerine karşı kontrol edilmiştir.
:::

Bir delegatör, bir doğrulayıcıya yaptığı mevcut bir delegasyonun bir kısmını 3, 6 veya 12 aylık sabit bir vade için taahhüt edebilir. Vadeler ve tutarlar zincir parametreleridir; güncel olanları bu sayfadan değil `GET /qorechain/stakingtier/v1/params` adresinden okuyun.

* **Kilitleme isteğe bağlıdır.** Olağan delegasyon, yeniden delegasyon ve çözülme bu sayfada açıklandığı gibi aynen çalışır. Yalnızca kilitli tutar kısıtlanır: bir kilit açıkken, o tutar undelegate edilemez veya yeniden delege edilemez ve bu her yol için geçerlidir (işlem, authz, group, sözleşme, governance).
* **Asgari kilit** 10 QOR'dur ve delegatör başına en fazla 16 açık kilit olabilir.
* **Erken kilit açma** serbesttir: kilidi sonlandırır, ödenmemiş kilit ödülünün tamamını kaybettirir ve kilitli tutardan alınan bir cezayı yakar (güncel parametrelerde %5, `staking_tier_penalty` yakım kaynağı altında kaydedilir); geri kalanı delege edilmiş ve kilitsiz kalır.
* **Slashing**, kilitli bir delegasyona da diğerleri gibi uygulanır; kilit delegasyonla birlikte küçülür.
* **Talep etme.** Bir kilit, modül parametreleriyle belirlenen, dönem başına ek bir ödül bileşeni kazanır; otomatik olarak değil, siz talep ettiğinizde ödenir. Bu sayfa oranları belirtmez: canlı ayarlar için `params` değerini okuyun.
* **Süre sonunda** kilit serbest bırakılır ve delegasyon olağan bir delegasyon olarak devam eder.

Komutlara komut satırı ve `GET /qorechain/stakingtier/v1/params`, `/locks/{holder}` ve `/pool` REST rotaları üzerinden erişilebilir; tutar, tam sayı cinsinden `uqor` miktarıdır (1 QOR = 1.000.000 uqor).

```bash
qorechaind tx stakingtier lock <validator_address> <amount_in_uqor> <months> --from mykey \
  --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier unlock-early <lock_id> --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind tx stakingtier claim --from mykey --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor --generate-only > tx.json
qorechaind query stakingtier locks <holder_address>
```

Yukarıdaki zincir kimliği testnet'e aittir; mainnet'te `qorechain-vladi` kullanın. Bu sayfanın geri kalanında olduğu gibi, oluşturulan her işlemi `tx pqc cosign` ile imzalayın.

---

## Üçlü Havuz (Triple-Pool) Sınıflandırması (tasarım durumu)

QoreChain'in tasarımı, doğrulayıcıları itibar (reputation) ve delegasyon seviyesine göre üç havuza ayıracak ve her havuza blok ödüllerinden ağırlıklı bir pay verecek bir **Üçlü Havuz (Triple-Pool)** modeli içerir:

| Havuz                                 | Giriş Kriteri                                                | Tasarım Ödül Ağırlığı |
| ------------------------------------- | ------------------------------------------------------------- | ---------------------- |
| **RPoS** (Reputation Proof of Stake)  | İtibar puanı >= 70. yüzdelik dilim **VE** stake >= medyan     | %40                    |
| **DPoS** (Delegated Proof of Stake)   | Toplam delegasyon >= 10,000 QOR                                | %35                    |
| **PoS** (Proof of Stake)              | Kalan tüm doğrulayıcılar                                       | %25                    |

:::note Canlı ağlarda etkin değil
Havuz sınıflandırması, havuz ağırlıklı blok önerici seçimi ve havuz ödül ağırlıkları `x/qca` modülünde uygulanmıştır ve parametreleri zincir üzerindedir (`qorechaind query qca config`), ancak **henüz blok üretimine veya ödül dağıtımına bağlanmamıştır**. Bugün blok önerisi standart biçimde stake'e göre döner ve ödüller, her doğrulayıcının komisyonu düşüldükten sonra bonded stake ile orantılı olarak paylaşılır. Bir doğrulayıcının hangi havuza "ait" olduğu, aldığınız ödülü değiştirmez.
:::

---

## Bonding Curve Ödülleri {#bonding-curve}

QoreChain'in tasarımı ayrıca bir bonding curve ödül formülü tanımlar:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Değişken | Açıklama                                                              |
| -------- | ----------------------------------------------------------------------- |
| `R`      | Dönem için ödül miktarı                                                 |
| `beta`   | Temel ödül oranı (protokol parametresi)                                 |
| `S`      | Stake edilen miktar                                                     |
| `alpha`  | Sadakat katsayısı (protokol parametresi)                                |
| `L`      | Epoch cinsinden stake süresi                                            |
| `Q(r)`   | Doğrulayıcının `r` itibar puanından türetilen kalite çarpanı            |
| `P(t)`   | `t` anındaki havuz çarpanı (havuza bağlı olarak %40, %35 veya %25)      |

:::note Canlı ağlarda etkin değil
Bonding curve hesaplaması, yukarıdaki havuz sınıflandırması gibi, **canlı zincir tarafından çağrılmaz**: ödüller bu formülle hesaplanmaz ve bugün ne stake süresi ne de doğrulayıcı itibarı onları değiştirir. Parametreler (`bonding_alpha`, `bonding_beta`) zincir üzerinde bulunur ancak hiçbir etkisi yoktur.
:::

---

## Slashing ve Jailing

QoreChain'de slashing, şu canlı parametrelerle (`qorechaind query slashing params`) standart Cosmos SDK slashing modülünü izler:

| Olay                 | Kural                                                                | Sonuç                                        |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Kesinti (downtime)   | Son 10,000 bloğun %5'inden azını imzalama (mainnet'in yaklaşık 3.2 saniyelik bloklarında yaklaşık 8.9 saat) | 600 saniye jail; stake'in %1'i slash edilir |
| Çifte imza (double-signing) | Aynı yükseklikte iki farklı bloğu imzalama                    | Stake'in %5'i slash edilir                   |

Slashing, bir doğrulayıcının toplam bonded stake'ine uygulanır; bu nedenle delegatörler kendi orantılı paylarını üstlenir. Slash edilen bir doğrulayıcıdan zaten çözülmekte olan stake'e de ulaşabilir; çözülme süresinin yalnızca bir bekleme süresi değil, bir güvenlik önlemi olmasının nedeni budur.

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
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Mevcut delegasyonlarınızı sorgulayın:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Delege etmeden önce bir doğrulayıcının komisyonuna, çalışma süresine (uptime) ve geçmişine bakın; bir doğrulayıcının havuzu veya itibarı şu anda aldığınız ödülleri değiştirmez.
* Yeniden delegasyon hemen geçerli olur, cezası ve kilidi yoktur. Sınırlar, tam olarak aynı rota üzerindeki eş zamanlı yeniden delegasyonlar için 7 kayıtlık tavan ile yeni yeniden delege edilen stake'in olgunlaşana kadar hedef doğrulayıcıdan başka yere taşınamayacağı kuralıdır.
* 21 günlük çözülme süresi bir güvenlik önlemidir. Bu süre boyunca slashing (cezalandırma) olayları token'larınızı yine de etkileyebilir.

:::
