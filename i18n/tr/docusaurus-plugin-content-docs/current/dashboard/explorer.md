---
slug: /dashboard/explorer
title: Gezgin
sidebar_label: Gezgin
sidebar_position: 2
---

# Gezgin

**Gezgin**, Panel'in zincire açılan penceresidir. Blokları, işlemleri, adresleri ve doğrulayıcıları aramak ve ağ etkinliğini gerçek zamanlı izlemek için kullanın. Gezgin salt okunurdur — göz atmak için cüzdan bağlantısı gerekmez.

## Genel bakış sayfası

Ağın canlı bir anlık görüntüsünü görmek için Panel'den **Gezgin**'i açın:

- **Ağ durumu** — zincir kimliği, mevcut durum ve kuantum güvenli göstergesi.
- **Blok etkinliği** — en son blok yüksekliği, ortalama blok süresi ve bugün üretilen bloklar.
- **Arz** — toplam bağlı QOR, bağlı oran ve dolaşımdaki arz.
- **Öne çıkan istatistikler** — toplam işlemler, aktif ve toplam doğrulayıcılar ve toplam adresler.
- **En son bloklar** — her bloğun yüksekliği, süresi, işlem sayısı ve önericisini içeren canlı bir liste.
- **En son işlemler** — her işlemin karması, türü, bloğu, tutarı ve göndericisini içeren canlı bir liste.

Detay sayfasını açmak için herhangi bir blok veya işlem satırına tıklayın. Her listedeki bir yenileme kontrolü, en yeni girişleri getirir.

## Arama

Gezgin'in üst kısmındaki arama kutusu aşağıdakilerden herhangi birini kabul eder ve sizi otomatik olarak doğru sayfaya yönlendirir:

- Bir **adres** (`qor1...`)
- Bir **işlem karması**
- Bir **blok yüksekliği** (bir sayı)

## İşlem detayları

Bir işlem sayfası; karmasını, durumunu, tutarını, göndericisini ve alıcısını (ikisi de tıklanabilir), ücretini, blok yüksekliğini, işlem türünü ve varsa notu gösterir. Karmayı kopyalayabilir ve daha derin inceleme için tüm işlemin ham görünümünü açıp kapatabilirsiniz.

## Blok detayları

Bir blok sayfası; yüksekliğini, zaman damgasını, önericisini, karmasını, işlem sayısını, kullanılan gas'ı ve içerdiği işlemler listesini, mutabakat ve kuantum sonrası imza bilgileriyle birlikte gösterir. Önceki ve sonraki kontrolleri, zinciri blok blok ilerlemenizi sağlar.

## Adres detayları

Bir adres sayfası; adresi taranabilir bir QR koduyla, QOR bakiyesini, işlem sayısını ve gelen ile giden transferlerin toplamlarını gösterir. Bunun altında adresin tüm işlem geçmişi yer alır — transferler, takaslar, musluk talepleri ve daha fazlası — her biri tutarı, süresi ve durumuyla birlikte. Adresi kopyalayabilir, QR kodunu indirebilir ve detaylar için herhangi bir işlemi açabilirsiniz.

## Doğrulayıcılar {#validators}

Doğrulayıcılar görünümü, ağın doğrulayıcılarını; aktif doğrulayıcı sayısı, toplam bağlı QOR ve mutabakat sağlığı için özet kartlarıyla listeler. Tablo, her doğrulayıcının sırasını, takma adını, oy gücünü, komisyonunu ve durumunu (örneğin aktif veya hapsedilmiş) ve ayrıca bir kuantum sonrası göstergeyi gösterir. Bir arama kutusu, doğrulayıcı adına veya adresine göre filtreler. Bir doğrulayıcıya yetki vermek için bkz. [Stake Etme ve Doğrulayıcılar](/dashboard/staking-and-validators).
