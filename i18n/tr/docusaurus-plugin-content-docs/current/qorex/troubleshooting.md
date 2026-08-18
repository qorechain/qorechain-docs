---
slug: /qorex/troubleshooting
title: QoreX Sorun Giderme
sidebar_label: Sorun Giderme
sidebar_position: 9
---

# Sorun Giderme

QoreX uygulaması ve eklentisi için sık sorulan sorular ve hızlı çözümler.

| Belirti | Neden / çözüm |
|---|---|
| İlk kurulumda **"Önce cihazınızı güvenceye alın"** | Sistem ayarlarınızda Face ID / bir parmak izi **veya bir ekran kilidi (PIN / desen)** kurun, ardından geri dönün. Bir cüzdan yalnızca güçlü bir kilit açma faktörüne sahip bir cihazda oluşturulabilir. Android'de, tek başına 2D yüz kilidi *zayıf* bir biyometriktir — asıl niteliği sağlayan, arkasındaki PIN'dir. |
| **Oturum açma sayfası kapandı** / "Bu oturum açma denemesinin süresi doldu" | Önceki bir deneme yarıda bırakılmış — yeniden oturum açmaya dokunmanız yeterli. |
| Google / Kontrol Paneli ile oturum açtıktan sonra **"Geçiş anahtarı ekle" seçeneği yok** | Beklenen durum: geçiş anahtarları yalnızca e-posta koduyla oluşturulan hesaplara eklenir ([Hesap ve Kontrol Paneli](/qorex/account-and-dashboard#sign-in) sayfasındaki nota bakın). |
| **"Kullanıcı adları yakında geliyor"** | @handle kayıt defterine geçici olarak ulaşılamıyor. Cüzdanınız etkilenmez; kayıt defteri geri geldiğinde kullanıcı adları otomatik olarak devreye girer. |
| Cihaz bağlama sırasında **"Yanlış kod veya hasarlı QR"** | 10 karakterli kodu yeniden kontrol edin (alfabe benzer görünenleri atlar: 0/O/1/I/L yoktur) ve tekrar tarayın. Her iki öğe de tek kullanımlıktır. |
| **Kamera ekranı izin gerektiğini söylüyor** | iOS: Ayarlar → QoreX → Kamera. Android: Uygulama bilgisi → İzinler → Kamera. |
| **Eklenti: ilk açılışta cüzdan yok** | Eklenti **bağımsız** bir cüzdandır — açılır pencereyi açın ve **Cüzdan oluştur** ya da **Cüzdan içe aktar** seçeneğini seçin. Mobil uygulamayı gerektirmez. |
| **Salt okunur bir adresten gönderim reddedildi** | O adres başka bir cüzdana aittir (etiket hangisi olduğunu gösterir). QoreX yalnızca kendi türetilmiş hesapları için imzalayabilir — sahibi olan cüzdandan gönderin. |
| **Testnet rozeti görünüyor** | Ayarlar → **"Testnet kullan (geliştiriciler)"** açık. Mainnet'e dönmek için kapatın. |
| **Takas düğmesi devre dışı** | Şimdilik beklenen durum — havuz likiditesi mevcut olduğunda Takas otomatik olarak açılır; herhangi bir uygulama güncellemesi gerekmez. |

## Hâlâ takıldınız mı?

- Koruyucular ve cihaz bağlama için [Güvenlik ve Kurtarma](/qorex/security-and-recovery) sayfasını inceleyin.
- QoreChain'in kendisiyle ilgili sorular için [ana dokümantasyona](/introduction/what-is-qorechain) veya [qorechain.io](https://qorechain.io) üzerinde bağlantısı verilen topluluk kanallarına bakın.
