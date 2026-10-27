---
slug: /dashboard/contract-auditor
title: Sözleşme Denetleyicisi
sidebar_label: Sözleşme Denetleyicisi
sidebar_position: 7
---

# Sözleşme Denetleyicisi

**Sözleşme Denetleyicisi** (kenar çubuğunda **Build** altında, öğe adı **AI Audit**), yapıştırılan sözleşme kaynağının güvenlik incelemesini QoreChain'in yapay zeka asistanı **QCAIA** ile çalıştırır ve bir puan, bir risk seviyesi ve önerilen düzeltmelerle birlikte bulgular döndürür. Bir sözleşmeyi test edip dağıtmadan önce hızlı bir ikinci bakış isteyen geliştiriciler içindir. Resmi bir denetim değildir ve insan incelemesinin yerini tutmaz.

## Yenilikler {#innovations}

- **Blok zincirinin otomatik algılanması.** Varsayılan "Auto-detect from code" seçeneğidir; bunun yerine 17 ekosistemden birini seçebilirsiniz.
- **Ayrı bir kuantum sonrası hazırlık yüzdesi**, 0 ile 100 arasındaki Security Score'un yanında verilir; güvenlik puanına katılmaması için ayrı olarak raporlanır.
- **Her UTC gününde ücretsiz bir denetim.** Her UTC gününün ilk denetimi ücretsizdir. Bundan sonra testnet'te her denetim, "Audit Cost" değerini gösteren bir "Confirm Security Audit" iletişim kutusunun ardından test QOR ile ödenir; mainnet'te ek denetimler bir sonraki UTC gününü bekler.
- **Raporlar varsayılan olarak özeldir.** Görünürlüğü sahibi değiştirir; herkese açık bir rapor sahibinin adını veya IP'sini asla göstermez.
- **Yalnızca etiketler değil, düzeltmeli bulgular.** Her bulgunun bir önem derecesi, konumu, açıklaması ve önerilen düzeltmesi vardır; tam rapor ayrıca öneriler, gas optimizasyonları, en iyi uygulamalar ve olumlu yönler ekler.

## Nasıl kullanılır {#how-to-use}

### Bir denetim çalıştırma

1. Oturum açın (gereklidir) ve **AI Audit** öğesini açın.
2. **Blockchain** (varsayılan "Auto-detect from code"), **Name (Optional)** ve **Contract Source Code** alanlarını doldurun.
3. **Run Security Audit** öğesini seçin, ardından "Confirm Security Audit" iletişim kutusunu onaylayın.
4. **Security Report** aynı sayfada satır içinde görünür. **Export PDF** onu kaydeder.

**Asgari örnek:** bir ERC-20 yapıştırın, otomatik algılamayı bırakın, **Run Security Audit**, Confirm, **Export PDF**.

### Raporu okuma

Satır içi rapor şunları gösterir:

- renk kodlu **Risk Level**;
- 0 ile 100 arasında **Security Score** ve kuantum sonrası hazırlık yüzdesi;
- bir **Executive Summary**;
- **Vulnerabilities Found (N Issues)**; önem dereceleri Critical, High, Medium, Low ve Info'dur. Temiz bir sonuç "No vulnerabilities detected" yazar.

Her bulgu önem derecesini, başlığı, koddaki konumu, bir açıklamayı ve önerilen bir düzeltmeyi listeler.

Tam rapor sayfası `/audits/<id>`, önem derecesi dağılımını, **Recommendations**, **Gas optimizations**, **Best practices**, **Positive aspects** bölümlerini ve sahibi için görünürlük anahtarını ekler.

### Geçmiş denetimler ve paylaşım

- Kendi raporlarınız **Profile > Audited** altındadır.
- `/audits` adresindeki **All Security Audits** listesi (ana sayfadan bağlantılıdır), tüm kullanıcıların en son denetimlerini sözleşme adı, blok zinciri, risk seviyesi, puan ve tarihle bir tabloda gösterir. Bir arama kutusu ada, blok zincirine veya risk seviyesine göre filtreler. Bir satır yalnızca rapor herkese açıksa veya size aitse açılır.
- Size ait bir raporda, üstteki bir anahtar "This report is private" yazar. Raporu herkese açık yapmak için açın; böylece bağlantıya sahip herkes onu okuyabilir (adınız ve IP'niz asla gösterilmez); tekrar özel yapmak için kapatın.

:::tip Dağıtmadan önce denetleyin
Bir denetimi, dağıtımdan önceki son adım olarak çalıştırın ve herhangi bir değişiklikten sonra yeniden çalıştırın. Bulguları bir garanti olarak değil, doğrulanacak bir rehber olarak değerlendirin ve raporu [testnet](/getting-started/connecting-to-testnet) üzerindeki kendi testlerinizle birleştirin.
:::

## Nasıl erişilir {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit) veya ana sayfadaki **New Audit**.
- **Hesap:** bir denetim çalıştırmak için oturum açmak gereklidir. `/audits` listesi ve `/audits/<id>` adresindeki herkese açık raporlar hesap olmadan açılır.
- **Ağlar:** her ikisinde de çalışır. Günlük ücretsiz kuralı aynıdır; ücretli ek denetimler yalnızca testnet'te vardır.
- **Maliyet:** her UTC gününün ilk denetimi ücretsizdir; testnet'teki ek denetimler test QOR'a mal olur; mainnet'teki ek denetimler ertesi günü bekler.

## Nerede yayımlanır {#where-published}

| Yüzey | Adres | Hesap |
| --- | --- | --- |
| Denetim çalıştırma | `dashboard.qorechain.io/audit` | Oturum açmak gerekli |
| All Security Audits | `dashboard.qorechain.io/audits` | Yok |
| Bir rapor | `dashboard.qorechain.io/audits/<id>` | Herkese açıksa yok; aksi halde sahibi |

## Sınırlar ve bilinen sorunlar {#limits}

- Yalnızca yapıştırdığınız kaynağı inceler; derleme, test veya çalışma zamanı analizi yoktur. Bulgular eksik veya yanlış olabilir.
- Özel bir rapor, bağlantıyla bile sahibinden başkası tarafından açılamaz.

## İlgili

- [Akıllı Sözleşme Oluşturucu](/dashboard/smart-contract-creator) - QCAIA ile sözleşme üretin.
- [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) - QoreChain'in hesapları ve imzaları nasıl güvence altına aldığı.
