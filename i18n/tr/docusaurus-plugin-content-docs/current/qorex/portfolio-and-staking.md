---
slug: /qorex/portfolio-and-staking
title: Portföy ve Stake
sidebar_label: Portföy ve Stake
sidebar_position: 4
---

# Portföy ve Stake

## Portföy

**Portföy** görünümü (her oturumda ilk açtığınızda biyometrik olarak korumalıdır) bir **tahsis çemberi** gösterir — üç şeridinde (Native, EVM, SVM) birleştirilmiş QOR bakiyeniz — çemberin altında bir açıklama ve her varlık için bir satırla birlikte. Yüzdeler, fiyat akışı canlı olduğunda görünür.

Herhangi bir varlığa dokunarak **Varlık ayrıntısı** ekranını açın; bu ekran şunları gösterir:

- **Bakiye geçmişi** — zincir üstü transferlerinizden oluşturulan gerçek bir trend.
- **Son etkinlik** — ters **@handle** aramasıyla işlem satırları, böylece karşı taraflar mümkün olduğunda ismiyle görünür.

## Stake ve Kazanç

QOR stake etmek, QoreChain'i güvence altına almaya yardımcı olur ve size ödül kazandırır. Tüm stake işlemleri, post-kuantum imzanızı taşıyan gerçek zincir üstü işlemlerdir.

### Bir doğrulayıcı ile stake edin

1. **Stake** ekranını açın.
2. Listeden bir doğrulayıcı seçin (zincirden canlı olarak yüklenir).
3. Bir tutar girin ve biyometrik onayla **delege edin**.
4. Ödüller biriktikçe aynı ekrandan talep edin.

:::note Bugün kilitlenme süresi yok — bekleme yalnızca çıkışta
Seçilecek sabit bir süre yok, çünkü şu anda böyle bir şey yok: delegasyon, siz undelegate etmeyi talep edene kadar bir sonraki bloktan itibaren ödüller akarak aktif kalır — yenilenmesi gereken bir son kullanma tarihi ve minimum stake süresi yoktur. Tek bekleme süresi çıkışta yaşanır: undelegate ettiğinizde, o QOR harcanabilir bakiyenize dönmeden önce 21 günlük bir unbonding sürecine girer; bu süre boyunca hiçbir ödül kazanmaz ve taşınamaz. Bir delegasyonu farklı bir doğrulayıcıya taşımak (redelegate) ise bu bekleme süresini tamamen atlar. Bu, kalıcı bir garanti değil, zincirin bugünkü davranışını tanımlar — daha fazlası için [Kilitlenme süresi var mı?](/user-guide/staking-and-delegation#lock-in-period) sayfasına bakın.
:::

:::note Bu ekranda henüz kendi Undelegate düğmesi yok
Bu Stake ekranı yalnızca delegasyon ve talep işlemlerini kapsar. Bir QoreX ekranından doğrudan undelegate etmek için [tarayıcı uzantısının Stake ekranını](/qorex/browser-extension#stake) kullanın — veya isteği bağlı olduğunuz QoreX'e (uygulama dahil) onaylamanız için gönderen [Dashboard](/dashboard/staking-and-validators#delegate) üzerinden undelegate edin.
:::

### Kazanç

**Kazanç** görünümü, aktif pozisyonlarınızı ve getirinizi tek bir yerde özetler.

## Sonraki adımlar

- [Gönder ve Al](/qorex/send-and-receive) — QOR ve harici varlıkları taşıyın.
- [Güvenlik ve Kurtarma](/qorex/security-and-recovery) — koruyucular, Legacy miras ve cihaz bağlama.
