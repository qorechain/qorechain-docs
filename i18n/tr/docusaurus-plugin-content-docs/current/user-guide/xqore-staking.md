---
slug: /user-guide/xqore-staking
title: xQORE Stake Etme
sidebar_label: xQORE Stake Etme
sidebar_position: 4
---

# xQORE Stake Etme

Bu sayfa, QOR sahiplerinin tokenlarını gelişmiş yönetişim gücü için kilitleyeceği ve uzun vadeli katılımcıları ödüllendiren bir PvP rebase modeline sahip, **tasarlanmış** xQORE yönetişim stake etme mekanizmasını açıklar. **xQORE bugün hiçbir ağda kullanılamaz**; bu sayfadaki hiçbir şey henüz yapabileceğiniz bir şey değildir.

:::warning Henüz canlı değil
xQORE genesis'te etkindir ancak ana ağda (`qorechain-vladi`, düğüm sürümü **v3.2.1**) ve test ağında (`qorechain-diana`) **henüz kullanılamaz**. Düğümde bunun için işlem, sorgu, CLI veya RPC giriş noktası yoktur; bu yüzden `tx xqore lock` / `unlock` yoktur, `query xqore ...` yoktur, xQORE REST rotası yoktur ve `qor_getXQOREPosition` yöntemi yoktur, hiçbir QOR kilitlenemez ve kimse xQORE tutmaz. Gelecekteki bir zincir sürümü için planlanmıştır; bu sürüm aynı zamanda çıkış cezalarının nasıl yeniden dağıtıldığını da değiştirecek, böylece kaç sahip olursa olsun kilit açma ucuz kalacaktır. Sürüm çıktığında burada belirtilecektir.
:::

---

## Genel Bakış

Tasarımda, QOR kilitlemek **1:1 oranında** xQORE basar ve xQORE, QDRW oy gücü formülünde **çift ağırlıkla** sayılır:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW'nin kendisi canlı ağlarda kapalıdır ve yönetişim oyları yalnızca bağlı stake üzerinden sayılır (bkz. [Yönetişim](/user-guide/governance#voting-power)); bu yüzden xQORE yayınlansa bile, QDRW gelecekteki bir sürümle etkinleştirilene kadar oy gücünü değiştirmeyecektir.

---

## Tasarlanan çıkış cezası takvimi

Genesis yapılandırması, QOR ne kadar uzun süre kilitli kaldıysa o kadar azalan bir çıkış cezası tanımlar:

| Kilit Süresi      | Çıkış Cezası |
| ------------------ | ------------ |
| 30 günden az  | **50%**      |
| 30 ila 90 gün      | **35%**      |
| 90 ila 180 gün     | **15%**      |
| 180 günden fazla | **0%**       |

Tasarıma göre cezalar **yakılmaz** (`penalty_burn_rate` değeri `0`'dır): cezanın tamamı kalan xQORE sahiplerine orantılı olarak yeniden dağıtılır ("PvP rebase"). Yeniden dağıtım mekanizması, xQORE'u devreye alan sürümde değişecek olan kısımdır.

---

## Kullanılamayanlar

* **Kilitleme ve kilit açma.** QOR'u kilitlemek veya kilidini açmak için `tx xqore` komutları ve bir işlem türü yoktur.
* **Pozisyonlar.** Hiçbir arayüzde (CLI, REST veya JSON-RPC) bir xQORE pozisyonu için sorgu yoktur ve `total_locked` ile `total_xqore` ikisi de sıfırdır.
* **Oy bonusu.** Bugün bir xQORE oy bonusu yoktur.

Şimdi yönetişime katılmak istiyorsanız, QOR'u bir doğrulayıcıya yetkilendirin (bkz. [Stake Etme ve Yetkilendirme](/user-guide/staking-and-delegation)) ve tekliflere oy verin (bkz. [Yönetişim](/user-guide/governance)).
