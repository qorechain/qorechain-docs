---
slug: /qorex/troubleshooting
title: QoreX Sorun Giderme
sidebar_label: Sorun Giderme
sidebar_position: 9
---

# Sorun Giderme

QoreX uygulaması ve uzantısı için sık sorulan sorular ve hızlı çözümler.

| Belirti | Neden / çözüm |
|---|---|
| Katılım sırasında **"Önce cihazınızı güvenceye alın"** | Sistem ayarlarınızda Face ID / bir parmak izi **veya bir ekran kilidi (PIN / desen)** ayarlayın, ardından geri dönün. Bir cüzdan yalnızca güçlü bir kilit açma faktörüne sahip bir cihazda oluşturulabilir. Android'de, tek başına 2D yüz kilidi *zayıf* bir biyometriktir — nitelik kazandıran şey onun arkasındaki PIN'dir. |
| **Oturum açma sayfası kapandı** / "Bu oturum açma denemesinin süresi doldu" | Önceki bir deneme yarıda kaldı — yalnızca tekrar oturum açmaya dokunun. |
| Google / Dashboard ile oturum açtıktan sonra **"Geçiş anahtarı ekle"** yok | Beklenen durum: geçiş anahtarları yalnızca e-posta kodu hesaplarına eklenir ([Hesap ve Dashboard](/qorex/account-and-dashboard#sign-in) sayfasındaki nota bakın). |
| **"Kullanıcı adları yakında"** | @handle kayıt defterine geçici olarak ulaşılamıyor. Cüzdanınız bundan etkilenmez; kayıt defteri geri döndüğünde kullanıcı adları otomatik olarak etkinleşir. |
| Cihaz bağlama sırasında **"Yanlış kod veya hasarlı QR"** | 10 karakterlik kodu yeniden kontrol edin (alfabe birbirine benzeyenleri atlar: 0/O/1/I/L yoktur) ve yeniden tarayın. Her iki öğe de tek kullanımlıktır. |
| **Kamera ekranı izin gerektiğini söylüyor** | iOS: Ayarlar → QoreX → Kamera. Android: Uygulama bilgisi → İzinler → Kamera. |
| **Uzantı: "Henüz cüzdan yok"** | Uzantı, QoreX mobil uygulamasında oluşturulan bir cüzdanla eşleşir — önce orada bir tane oluşturun. |
| **Salt okunur bir adresten gönderim reddedildi** | O adres başka bir cüzdana aittir (etiket hangisi olduğunu gösterir). QoreX yalnızca kendi türetilmiş hesapları için imzalayabilir — sahibi olan cüzdandan gönderin. |
| **Testnet rozeti görünüyor** | Ayarlar → **"Testnet kullan (geliştiriciler)"** açık. Ana ağa dönmek için kapatın. |
| **Takas düğmesi devre dışı** | Şimdilik beklenen durum — havuz likiditesi mevcut olduğunda Takas otomatik olarak açılır; uygulama güncellemesi gerekmez. |

## Hâlâ takıldınız mı?

- Koruyucular ve cihaz bağlama için [Güvenlik ve Kurtarma](/qorex/security-and-recovery) sayfasını inceleyin.
- QoreChain'in kendisiyle ilgili sorular için [ana belgelere](/introduction/what-is-qorechain) veya [qorechain.io](https://qorechain.io) sitesinde bağlantısı verilen topluluk kanallarına bakın.
