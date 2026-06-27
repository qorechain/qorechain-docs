---
slug: /light-node/registration-and-licensing
title: Kayıt ve Lisanslama
sidebar_label: Kayıt ve Lisanslama
sidebar_position: 4
---

# Kayıt ve Lisanslama

[%3 hafif düğüm ödül payını](/light-node/rewards-and-monitoring) kazanmak için bir hafif düğümün **zincir üzerinde kayıtlı** olması ve canlı olduğunu kanıtlamaya devam etmesi gerekir. Bu sayfa, kaydın nasıl çalıştığını, düğümün canlılığı nasıl kanıtladığını ve bir düğümü Dashboard üzerinden nasıl kaydedip lisanslayacağınızı kapsar.

## Zincir üzerinde kayıt

Kayıt, hafif düğümünüzü zincire kaydeder; böylece protokol onun var olduğunu, hangi türde olduğunu (`sx` veya `ux`) ve hangi operatör anahtarının onu kontrol ettiğini bilir. Kaydedildikten ve canlı hale geldikten sonra düğüm, hafif düğüm ödül payına hak kazanır.

### Kayıt komutunu oluşturma

SX sürümü, bu düğümü kaydetmek için tam zincir komutunu yazdırabilir. Çalıştırın:

```bash
lightnode-sx register
```

Bu, anahtarlıktan operatör anahtarınızı okur ve operatör adresiniz, düğüm türünüz ve sürümünüzle birlikte çalıştırmaya hazır bir `qorechaind` işlemi yazdırır. Komut iki isteğe bağlı bayrak alır:

- `--type` — düğüm türü, `sx` veya `ux` (varsayılan `sx`).
- `--version` — kaydedilecek düğüm sürümü (varsayılan, ikili dosyanın kendi sürümüdür).

Yazdırılan komut, düğümü zincir üzerinde `x/lightnode` modülü altında kaydeder. Katıldığınız ağda (testnet `qorechain-diana` veya mainnet `qorechain-vladi`) fonlanmış bir operatör hesabıyla gönderin.

:::note
`lightnode-sx register`, kayıt işlemini incelemeniz ve göndermeniz için **yazdırır** — kendi başına yayına almaz. Bu, düğümün ne zaman ve nasıl kaydedileceği konusunda kontrolü sizde tutar.
:::

## Kalp atışı canlılık kanıtları

Yalnızca kayıt, hak kazanma durumunu korumak için yeterli değildir. Kaydedilmiş bir hafif düğüm, **kalp atışı canlılık kanıtları** göndererek çevrimiçi olduğunu sürekli kanıtlamalıdır. Bu kalp atışları, zincirin etkin düğümleri — ödül payına hak kazananları — kayıtlı ancak çevrimdışı düğümlerden ayırt etme yöntemidir.

Uygulamada bu, kaydedilmiş ve çalışır (ve eşitlenmiş) tutulan bir düğümün hak kazanma durumunu koruduğu, çevrimdışı olan bir düğümün ise canlılığı kanıtlamayı bıraktığı ve geri dönene kadar hak kazanma durumunu kaybettiği anlamına gelir. Bu nedenle daemon'u çalışır ve sağlıklı tutmak, ödül kazanmanın bir parçasıdır — kalp atışı ve eşitleme sağlığını nasıl izleyeceğinizi öğrenmek için [Ödüller ve İzleme](/light-node/rewards-and-monitoring) bölümüne bakın.

### PQC ile birlikte imzalanmış kalp atışı işlem hattı {#pqc-cosigned-heartbeat-pipeline}

QoreChain varsayılan olarak **PQC gerektirir**, bu nedenle kalp atışı canlılık işlemi yalnızca klasik bir imza yerine kuantum sonrası birlikte imzalanmış bir işlem hattı aracılığıyla üretilir. Daemon, imzasız kalp atışını oluşturur, ardından yayına almadan önce onu **hibrit Dilithium-5 (ML-DSA-87)** imzasıyla birlikte imzalar — bu, zincirin her işlem için uyguladığı kuantum sonrası duruşun aynısıdır. Düğüm, her `interval_blocks` penceresinde bir kalp atışı gönderir (zincirin `heartbeat_interval` parametresiyle eşleşir) ve erken gönderim reddedilmelerinden kaçınmak için kendini blok yüksekliğine göre ayarlar.

Zincir üzerindeki kalp atışları daemon'da isteğe bağlıdır: düğüm yapılandırmasındaki `[heartbeat]` bölümünü etkinleştirin (`enabled = true`) ve `qorechaind_path` öğesini oluştur-ardından-birlikte-imzala akışını gerçekleştiren bir `qorechaind` ikili dosyasına yönlendirin. Bu yapılandırılmadığında, düğüm zincir üzerinde kalp atışı göndermeden çalışır ve operatör, yazdırılan zincir komutlarıyla canlılığı manuel olarak gönderebilir.

## Dashboard üzerinden kayıt ve lisanslama

Bir düğümü kaydetmek ve lisans almak için, zincir komutlarını elle oluşturmak yerine rehberli bir akış sağlayan QoreChain Dashboard'u da kullanabilirsiniz.

- Düğümünüzü **Tools → Node Registration** üzerinden kaydedin.
- **Tools → Buy License** üzerinden bir lisans alın veya yenileyin.

Dashboard akışı, operatör anahtarınızı ilişkilendirme, düğüm türü ve ağı seçme ve zincir üzerindeki kaydı tamamlama adımlarında size yol gösterir. CLI yerine bir kullanıcı arabirimini tercih ediyorsanız veya lisanslamayı kayıtla birlikte tek bir yerde yönetmek istiyorsanız bunu kullanın.

## Sonraki adımlar

- [Ödüller ve İzleme](/light-node/rewards-and-monitoring) — %3 payın nasıl kazanıldığı, bileşik hale getirildiği ve izlendiği.
- [SX Sürümü](/light-node/sx-edition) — `register` komutu ve tam CLI başvurusu.
