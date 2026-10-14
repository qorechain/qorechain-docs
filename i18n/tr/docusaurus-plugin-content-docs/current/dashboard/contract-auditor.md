---
slug: /dashboard/contract-auditor
title: Sözleşme Denetleyicisi
sidebar_label: Sözleşme Denetleyicisi
sidebar_position: 7
---

# Sözleşme Denetleyicisi

**Sözleşme Denetleyicisi**, bir akıllı sözleşmenin yapay zeka destekli güvenlik analizini çalıştırır ve **QCAI** tarafından desteklenir. Bir sözleşme gönderin; QCAI onu güvenlik açıklarına karşı inceler, genel bir risk seviyesi ile güvenlik puanı atar ve önerilen bir düzeltmeyle birlikte her bulguyu açıklar. [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) gibi, Denetleyici de yapay zeka araçları için **17 blok zincirinde** çalışır.

## Bir denetim çalıştırma

1. Oturum açın, **AI Audit** öğesini açın ve sözleşmenizi **Contract Source Code** alanına yapıştırın. İsteğe bağlı olarak **Blockchain** (varsayılan **Auto-detect from code**) ve bir **Name** ayarlayın.
2. **Run Security Audit** öğesini seçin. QCAI sözleşmeyi inceler ve bir rapor üretir; **Export PDF** onu kaydeder.

## Raporu okuma

Bir denetim raporu kendi sayfasında açılır ve şunları içerir:

- **Risk seviyesi** — hızlı tarama için renk kodlu, genel bir derecelendirme (örneğin kritik, yüksek, orta veya düşük).
- **Güvenlik puanı** — 0 ile 100 arasında genel bir puan.
- **Önem derecesi dağılımı** — her önem derecesine (kritik, yüksek, orta, düşük ve bilgilendirici) kaç bulgunun düştüğü.
- **Özet** — sözleşmenin güvenlik durumuna ilişkin kısa bir genel bakış.

### Bulgular

Her bulgu; önem derecesini, bir başlığı, kodda atıfta bulunduğu konumu, sorunun bir açıklamasını ve önerilen bir düzeltmeyi listeler. Bir sözleşmenin belirli bir seviyede sorunu olmadığında rapor bunu belirtir.

Uygun olduğunda rapor, genel öneriler, gas optimizasyonları, en iyi uygulamalar ve sözleşmenin halihazırda doğru yaptığı olumlu yönler için de bölümler içerir.

## Geçmiş denetimleri inceleme

Denetimler listesi, önceki raporlarınızı bir tabloda sözleşme adı, blok zinciri, risk seviyesi, güvenlik puanı ve her birinin ne zaman oluşturulduğuyla birlikte gösterir. Bir arama kutusu, sözleşme adına veya blok zincirine göre filtreler. Tam raporu yeniden açmak için herhangi bir satırı seçin. Raporlar **varsayılan olarak özeldir**; size ait bir raporda, üstteki bir anahtar "This report is private" yazar — raporu herkese açık yapmak için açın; böylece bağlantıya sahip herkes onu okuyabilir (adınız ve IP'niz asla gösterilmez); tekrar özel yapmak için kapatın.

:::tip Dağıtmadan önce denetleyin
Bir denetimi, dağıtımdan önceki son adım olarak çalıştırın ve herhangi bir değişiklikten sonra yeniden çalıştırın. Bulguları otomatik bir garanti olarak değil, doğrulanacak bir rehber olarak değerlendirin — raporu [testnet](/getting-started/connecting-to-testnet) üzerindeki kendi testlerinizle birleştirin.
:::

## İlgili

- [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) — QCAI ile sözleşme üretin.
- [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) — QoreChain'in hesapları ve imzaları nasıl güvence altına aldığı.
