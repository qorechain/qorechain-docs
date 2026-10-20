---
slug: /appendix/version-history
title: Sürüm Geçmişi
sidebar_label: Sürüm Geçmişi
sidebar_position: 3
---

# Sürüm Geçmişi

QoreChain için genel sürüm geçmişi. Ana ağ **`qorechain-vladi`** (EVM zincir kimliği **9801**, 7 Haziran 2026'dan beri canlı) **3.742.566** yüksekliğine kadar **v3.2.3** (yönetişimle 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulandı) sürümünü, o bloktan itibaren ise **v3.2.4** sürümünü çalıştırır (ana ağ yönetişim önerisi 13). Test ağı **`qorechain-diana`** (EVM zincir kimliği **9800**) 8.337.253 yüksekliğinden (19 Ekim 2026) beri **v3.2.4** çalıştırır.

:::note
Aşağıdaki kayıtlar üst düzey yetenek özetleridir. Daha eski `v1.x` kayıtları, ana ağdan önce gelen test ağı yayın hattının tarihsel kaydı olarak saklanmaktadır. Yayın manifesti ([Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet)) etiketlemeden ayrı olarak yükseltilir ve bir etiketin gerisinde bir süre kalabilir — taze bir kurulumun gerçekte ne indirdiğini görmek için doğrudan kontrol edin.
:::

## Ana ağ yönetişim zaman çizelgesi {#governance-timeline}

14 Ekim 2026'dan bu yana çalışan ana ağı değiştiren veya değişiklikleri zamanlayan öneriler. Yedisi de hızlandırılmış önerilerdir (bir günlük oylama süresi); 7 ila 11 numaralı öneriler, oy kullanan tüm bonded stake'in lehte oyuyla kabul edildi. Tam liste `https://api.qore.host` üzerinde `GET /cosmos/gov/v1/proposals` adresindedir.

| Öneri | Ne yapar | Oylama | Sonuç |
| --- | --- | --- | --- |
| 7 | v3.2.2'yi 3.556.788 yüksekliğinde uygular | 14–15 Ekim 2026 (21:24 UTC'de sona erer) | Kabul edildi; 16 Ekim 2026'da uygulandı |
| 8 | Işık düğümü rezervini (3.156.983,796395 QOR) vakfa aktarır | 18–19 Ekim 2026 (19:15 UTC'de sona erer) | Kabul edildi |
| 9 | Sahipsiz kalmış stake sahibi payını (6.693.045,921330 QOR) vakfa aktarır | 18–19 Ekim 2026 (19:15 UTC'de sona erer) | Kabul edildi |
| 10 | Emisyon: sabit emisyonu dönem başına 86.000 QOR'a ve kümülatif tavanı 590.000.000 QOR'a ayarlar (dönem uzunluğu değişmez; 86.000 QOR'luk ilk dönem 3.672.000 numaralı blokta başlar) | 18–19 Ekim 2026 (19:15 UTC'de sona erer) | Kabul edildi |
| 11 | v3.2.3'ü 3.662.051 yüksekliğinde uygular | 18–19 Ekim 2026 (19:15 UTC'de sona erer) | Kabul edildi; 20 Ekim 2026'da uygulandı |
| 12 | Düzeltilmiş sahipsiz stake sahibi payını (3.807.496,785528 QOR, v3.2.3 yüksekliğinde yeniden hesaplandı) vakfa aktarır | 20 Ekim 2026 20:01 UTC ile 21 Ekim 2026 20:01 UTC arası | Bu yazıldığı sırada oylama döneminde |
| 13 | v3.2.4'e 3.742.566 yüksekliğinde koordineli yükseltme (3,2 saniyelik bloklarla yaklaşık 23 Ekim 2026): isteğe bağlı zaman kilitli stake, kayıttan itibaren sayılan ışık düğümü ödül sınırı, kuantum-sonrası anahtarlar için bir sahiplik bayrağı, köprü doğrulayıcıları için sahiplik kanıtı, blok süresi cinsinden RDK itiraz penceresi ve düğüm-yerel sertleştirme | 20 Ekim 2026 21:18 UTC ile 21 Ekim 2026 21:18 UTC arası | Bu yazıldığı sırada oylama döneminde; şimdiye kadar kullanılan tüm oylar lehte; nihai sonuç için `GET /cosmos/gov/v1/proposals/13` adresine bakın |

Sürümlerin ne anlama geldiği için bkz. [Tokenomics](/architecture/tokenomics#stranded-and-reserve); nasıl oy verileceği için bkz. [Yönetişim](/user-guide/governance).

---

## v3.2.4 — Işık Düğümü Kayıt Penceresi ve İsteğe Bağlı Zaman Kilitli Stake (ana ağ için zamanlandı)

**Sürüm odağı:** Zamanlanmış bir sonraki ana ağ sürümü. Test ağı yönetişim önerisi 13 bunu **8.337.253** yüksekliğinde (19 Ekim 2026) uygulayalı beri `qorechain-diana` test ağında çalışıyor (test ağı manifestosu `minCompatible` değerini 3.2.4 olarak ayarlar). Ana ağda yönetişim önerisi 13 bunu **3.742.566** yüksekliğine zamanlar: düğümler o bloğa kadar v3.2.3'te kalır, orada durur ve v3.2.4 ile yeniden başlar; işlem imzalama değişmez. Dolayısıyla aşağıdaki her özellik şu anda test ağında canlıdır ve (öneri kabul edildiğinde) 3.742.566 yüksekliğinden itibaren `qorechain-vladi` için geçerli olur.

* **Işık düğümü kayıt penceresi.** Bir ışık düğümünün ödül sınırı, önceki yerleşim ile düğümün kendi kaydından hangisi daha geçse oradan başlar; böylece yeni bir kayıt, katılmasından önceki birikmiş bir tutarı toplamaz.
* **İsteğe bağlı zaman kilitli stake (`x/stakingtier`, yeni bir modül).** Bir delegatör, delegasyonunun bir kısmını 3, 6 veya 12 ay için kilitleyebilir; kilitli kısım delegasyondan çıkarılamaz veya yeniden delege edilemez, erken kilit açmaya ise yakılan bir ceza ile izin verilir. Asgari kilit 10 QOR'dur. Bkz. [Stake ve Delegasyon](/user-guide/staking-and-delegation#time-locked-staking).
* **Yeni emisyon modu.** `x/inflation`, `target_apy_bps` parametresiyle (test ağında `0`) üçüncü bir emisyon modu olan `target_apy`'yi kazanır. Bir ağın emisyon modunu değiştirmek ayrı bir yönetişim kararıdır; yürürlükteki mod `/qorechain/inflation/v1/params` adresinde gösterilir.
* Kuantum-sonrası hesap kayıtlarında **`possession_proven` bayrağı**; hesap anahtarları için sahiplik kanıtı isteğe bağlı kalır.
* **Köprü doğrulayıcısı sahiplik kanıtı.** Bir köprü doğrulayıcısını kaydetmek, bir sahiplik kanıtı ve başka hiçbir köprü doğrulayıcısının kullanmadığı bir anahtar gerektirir.
* **Blok süresi cinsinden RDK itiraz penceresi.** İyimser itiraz penceresi, ondan türetilen bir blok sayısı yerine blok süresi cinsinden sayılır.
* **Düğüm-yerel sertleştirme** (JSON-RPC istek sınırları, durum-senkronizasyonu parça bütçesi, anahtar kaydı ön denetimleri) ve yeni sorgular (`protocol_features`, `auth_nonce` ve `monthly_cap_active` gibi ek ışık düğümü ödül havuzu alanları).

## v3.2.3 — İkinci Ekim Güvenlik Paketi (ana ağ)

**Sürüm odağı:** İkinci Ekim sertleştirme paketi; ana ağda yönetişim önerisi 11 ile **3.662.051** yüksekliğinde (20 Ekim 2026, 16:01 UTC) uygulandı; test ağında daha önce 8.003.746 yüksekliğinde (15 Ekim) uygulanmıştı. Ana ağ manifestosu `minCompatible` değerini 3.2.3 olarak ayarlar: ana ağa katılan bir düğümün artık v3.2.3'e ihtiyacı vardır. Yükseltme, o yükseklikte 52 protokol özelliğini açar; imza biçimi, adresler, ondalık basamaklar, memolar ve ücretler değişmez.

* **Kuantum-sonrası anahtar bütünlüğü.** Zayıf, dejenere ve daha önce kullanılmış anahtarlar kayıtta reddedilir; hibrit anahtar bakımı sıkılaştırılır; kuantum-sonrası anahtar yönetimi mesajları artık authz üzerinden çalıştırılamaz; bir hesap son imzalama algoritmasını kaldıramaz. Kayıt (`MsgRegisterPQCKeyV2`, `tx pqc register-key-v2 ... --pqc-key <name>`), varsa doğrulanan **isteğe bağlı bir sahiplik kanıtı** kabul eder.
* **Kapsamlı EVM pencereleri.** `MsgOpenEVMWindow`, bir pencereyi daraltan isteğe bağlı `native_only` (yalnızca düz yerel QOR transferleri) ve `allowed_targets` (en fazla 16 alıcı) alanlarını alır. Bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window).
* RDK için **rollup teminat defteri**, precompile sertleştirmesine sahip **atomik VM'ler arası kuyruk** ve **kurallı stake yetkilendirmesi**.
* **Yalnızca kendine vesting oluşturma.** Vesting hesabı oluşturma yalnızca oluşturanın kendi hesabını fonlayabilir (üç vesting mesajı ayrıca devre kesicide kapalı kalmaya devam eder).
* **Ekonomi düzeltmeleri.** Emisyon yılı dönem uzunluğundan türetilir; AMM blok-sonu işi sınırlandırılır; yakma kayıtları budanır; kayıtlı sahipsiz stake sahibi payı yükseltme yüksekliğinde 0'dan 3.807.496,79 QOR olarak yeniden hesaplandı (bkz. [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Işık düğümü aylık sınırı.** Düğüm başına ödül sınırı artık aylık olarak belirtilir: düğüm başına 30 günde 2.000 QOR; blok süresine ve çalışma süresine göre orantılanır.
* **Yönetişimle değiştirilebilir lisans otoritesi.** Yeni bir `MsgUpdateAuthority`, yönetişimin lisansları veren otoriteyi değiştirmesine olanak tanır.
* **Genel derlemeler genel ağları reddeder.** Genel kaynak ağacından derlenmiş bir ikili dosya, canlı bir ağa yönlendirilirse durur.
* **Yeni okuma rotaları.** `x/inflation` parametreleri ve dönem kaydı, ana ağda REST üzerinden sunulur (`/qorechain/inflation/v1/params`, `/epoch_info`).

## v3.2.2 — Bağımlılık Güncellemesi ve Birinci Ekim Güvenlik Paketi (ana ağ)

**Sürüm odağı:** Ana ağda yönetişim önerisi 7 ile **3.556.788** yüksekliğinde (16 Ekim 2026, 17:59 UTC) uygulanan koordineli bir yükseltme; test ağında 6.905.034 yüksekliğinde (2 Ekim) uygulandı. İmza biçimi değişmez.

* **Bağımlılıklar.** Cosmos SDK v0.53.8, konsensüs motoru v0.38.26 ve ibc-go v10.7.
* Yükseltme yüksekliğinde **26 protokol özelliği** açılır; bunların arasında şunlar vardır: EIP-7702 delegasyonu bir kuantum-sonrası onay gerektirir (`MsgAuthorizeEVMDelegation`; `MsgClearEVMDelegation` veya `MsgCloseEVMWindow` ile temizlenir); multisig sınırları blok yürütmede uygulanır; doğrulayıcı kabulü her yolda denetlenir; AMM bütünlük denetimleri; modül hesapları EVM üzerinden sahiplenilemez; EIP-155 öncesi işlemler reddedilir; kuantum-sonrası anahtar kaydı klasik anahtarı doğrular; RDK ve çok katmanlı çıpa mesajı ikinci bir biçime (v2) geçer; ve başarısız işlem yakma kanalı uygulanır.

## v3.2.1 — Düğüm Sertleştirmesi

**Sürüm odağı:** Ana ağ için düğüm-yerel bir güvenlik sürümü (14 Ekim 2026): **yükseltme yüksekliği yok, konsensüs değişikliği yok ve yönetişim oylaması yok**. v3.2.0 üzerindeki düğümler zinciri takip etmeye devam eder.

* Genel API'nin kaynak sınırlarını sertleştirir, EVM JSON-RPC'yi ve mempool'u sınırlandırır ve terfi ettirilen EVM işlemlerini yayar (gossip).
* EVM zincir kimliğini düğüm yapılandırmasında sabitler ve Cosmos zincir kimliğiyle çapraz kontrol eder; operatörler `app.toml` içinde `evm-chain-id = 9801` ayarlamalıdır (farklı bir değer hata olarak günlüğe yazılır).
* Konsensüs motoru bağımlılığını günceller; sistem saatini NTP ile senkronize tutun (60 saniyeden fazla sapma düğümü durdurur).
* Her operatör için önerilir; ana ağ manifestosundaki `minCompatible` değeri o sırada 3.2.0'dı.

v3.2.1 düğüm düğüm uygulandı ve yükseltme yüksekliği yoktur; ana ağda v3.2.2 (16 Ekim) ve v3.2.3 (20 Ekim) tarafından geçersiz kılındı.

## v3.2.0 — EVM Yetkilendirme Penceresi ve Muhasebe Düzeltmeleri

**Sürüm odağı:** Kuantum-sonrası gerekliliğini her hatta geçerli kılmak ve iki muhasebe açığını kapatmak. Ana ağda yönetişim önerisi #6 ile **2.981.742** yüksekliğinde (25 Eylül 2026, 12:07 UTC) uygulandı; test ağında 5.920.000 yüksekliğinde uygulandı.

* **EVM yetkilendirme penceresi (EVM cüzdanları için uyumluluğu bozan değişiklik).** Bir EVM işlemi artık yalnızca kayıtlı bir ML-DSA-87 anahtarına **ve** açık bir pencereye sahip bir hesaptan kabul edilir. Pencere, bir Cosmos-hattı mesajıyla (`MsgOpenEVMWindow`, kuantum-sonrası imzalı) açılır ve blok sayısı (≤ 17.280), işlem sayısı (≤ 1.000) ve toplam değer (aktarılan değer artı her işlemin azami ücreti) ile sınırlandırılır; `MsgCloseEVMWindow` onu iptal eder. Bir pencerenin içinde standart Ethereum imzalama değişmez. 16 Eylül'den beri ana ağda devre kesici ile kapatılmış olan EVM hattı, kuralın yürürlüğe girdiği blokta yeniden açıldı. Bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window).
* **Hibrit imza v2.** Kuantum-sonrası imzalar artık alan etiketli, zincire bağlı imza baytları üzerinden atılır; ilk biçim yükseltme yüksekliğinden itibaren reddedilir. İstemciler biçimi seçmek için düğümün uygulanmış yükseltme planlarına bakar; CLI (`--sign-bytes auto`), SDK 0.8.x ve wallet-adapter 0.2.x bunu yapar. Anahtar geçişi ve köprü tanıklığı (attestation) yükleri de aynı şemaya taşındı. Bkz. [Kuantum-Sonrası Güvenlik](/architecture/post-quantum-security#sign-bytes-v2).
* **Stake sahibi payı ödendi.** Ücret bölüşümündeki %10'luk stake sahibi payı hiçbir alacağı karşılamayan bir yere yatırılıyordu; bu yükseltmeden itibaren normal bir stake ödülü olarak ödenir. Halihazırda birikmiş tutar (ana ağda 6.693.045,92 QOR) zincir üzerinde kayıtlıdır (`GET /qorechain/burn/v1/stranded_rewards`) ve yalnızca bir yönetişim oylamasıyla (`MsgReleaseStrandedRewards`) hareket ettirilebilirdi; yönetişim bunu Ekim 2026'da serbest bıraktı (bkz. [yönetişim zaman çizelgesi](#governance-timeline) ve [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).
* **Işık düğümü ödül rezervi.** Hiçbir düğümün uygun olmadığı dönemde biriken %3'lük ışık düğümü payı (ana ağda 3.156.009,33 QOR) bir rezerv olarak kaydedilir (`GET /qorechain/lightnode/v1/reward_pool`), dağıtımın dışında tutulur ve yalnızca yönetişimle hareket ettirilebilir (Ekim 2026'da serbest bırakıldı); bundan sonra dağıtım yalnızca bir önceki çalıştırmadan beri biriken tutarı öder ve düğüm başına sınırlıdır. Işık düğümü kaydı bu sürümde hâlâ kapalıydı ve o tarihten beri açıldı (bkz. [Işık Düğümü](/light-node/overview#reward-program-status)).
* **Gönderen başına işlem sınırı** artık uygulanıyor (röleler çalışabilsin diye gönderen başına 30 blokta 600 işlem).
* **Yükseltme modülü sürüm haritası** artık her modülü (48) listeliyor; bu, sonraki geçişleri etkileyecek bir açığı kapatıyor.
* Ayrıca: köprü modülü hesabı ve tanıklık yükleri sertleştirildi, önerilen bloklar doğrulanıyor, rollup yerleşimi rollup'ın sıralayıcısıyla (sequencer) sınırlandırıldı ve rollup başına teminat ile etkin bir oluşturma yakımı eklendi, çok katmanlı oluşturucu stake'i kayıtta kilitleniyor ve hizmetten çıkarmada iade ediliyor, akıllı hesap `enabled` bayrağı her yolda uygulanıyor, doğrulayıcı kabul ve vesting oluşturma yolları authz iç içe geçmesine kapatıldı.

## v3.1.96 + v3.1.97 — QoreChain Native Erişim Kilidi

**Sürüm odağı:** QoreChain Native'in üzerine inşa edildiği çalışma zamanı olan CosmWasm için endüstri genelinde yayımlanan bir güvenlik uyarısının ardından, izinsiz sözleşme kodu yükleme ve örnekleme (instantiation) kapatılıyor.

* **Sözleşme yükleme ve örnekleme artık açık izin gerektiriyor.** `code_upload_access` ve `instantiate_default_permission`, hem ana ağda hem de test ağında `Nobody` olarak ayarlandı — canlı olarak doğrulandı, bu iki etiketten hangisinin bir düğümde çalıştığından bağımsız olarak, çünkü bu yalnızca daha yeni ikili dosyaların uyguladığı bir şey değil, zincir üzerinde bir parametre. Bir sözleşme geliştiriyorsanız bunun ne anlama geldiği için bkz. [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development). Zaten örneklenmiş sözleşmeler etkilenmez — `execute` ve `query` eskisi gibi çalışır. Her iki ağda da üç QoreChain Native yükleme ve örnekleme mesajı devre kesici ile kapatılmıştır.
* Aynı uyarının sertleştirme rehberliğine uygun olarak **konum-bağımsız (PIE) yayın derlemeleri**, böylece bir istismarın tahmin etmesi gereken bellek adresi süreç başına rastgeleleştirilir. Dinamik bağlantılı ikili dosyalar yalnızca bir derleme bayrağına ihtiyaç duydu; durumu bozmadığı doğrulandı.

## v3.1.95 — Cosmos EVM Sertleştirmesi

**Sürüm odağı:** EVM bakiye muhasebesi kütüphanesine yönelik kademeli güvenlik güncellemesi.

* **Taşma sertleştirmesi** — Bir EVM bakiye-güncelleme yolu, artık aşırı bir taşma durumunda sessizce sarmalanmak yerine güvenli bir şekilde başarısız oluyor. Konsensüsü bozmayan, kademeli bir güncelleme olarak sunuldu — hiçbir yönetişim oylaması veya koordineli durdurma yüksekliği gerekmedi.

## v3.1.94 — Emisyon Tavanı ve Yönetimsel Mesaj Sertleştirmesi

**Sürüm odağı:** Stake ödülü emisyonunu gerçek ağ koşullarıyla uyumlu hale getirmek ve yetkili yönetimsel mesajlar üzerindeki yetkilendirme denetimlerini sıkılaştırmak.

* **Emisyon tavanı** — Tam bonded-stake desteğiyle kabul edilip 2.122.074 yüksekliğinde (26 Ağustos 2026) uygulanan bir yönetişim önerisi, orijinal azalan emisyon takvimini, sert ve kümülatif bir tavan altında dönem başına sabit bir tutarla değiştirdi. Orijinal takvim, çok daha olgun, tamamen bonded bir ağ için kalibre edilmişti; gerçek bonded stake'e karşı, amaçlanandan çok daha hızlı ödeme yapıyordu. Dönem başına tutar ve tavan, 19 Ekim 2026'da yönetişim önerisi 10 ile yükseltildi. Güncel rakamlar için bkz. [Tokenomics](/architecture/tokenomics#staking-reward-schedule).
* **Yönetimsel mesaj sertleştirmesi** — Bir dizi yetkili, yetki-korumalı yönetimsel mesajın imzalayanı artık mesajın kendisinde taşınan bir değere güvenmek yerine yönetişim modülünün kendi adresine karşı doğrulanıyor.
* Ayrıca, doğrudan bu sürüme güncelleme yapan herhangi bir düğüm için v3.1.92'deki düğüm devreye alma güvenilirliği düzeltmesini de taşıyor.

## v3.1.92 — Düğüm Senkronizasyon Güvenilirliği

**Sürüm odağı:** Anlık görüntülerden ve yayınlanan zincir arşivinden daha güvenilir düğüm devreye alma.

* **Anlık görüntü ve arşiv senkronizasyon düzeltmesi** — Bir durum-senkronizasyonu anlık görüntüsünden veya yayınlanan zincir arşivinden geri yükleme yapan bir düğümün, belirli geçmiş bloklardan sonra senkronizasyonu tamamlayamama sorunu giderildi. Her iki yol üzerinden devreye alma artık güvenilir şekilde tamamlanıyor.

## v3.1.90 — Işık Düğümü Çalışma Süresi Muhasebesi

**Sürüm odağı:** Işık düğümü ödül uygunluğu için ölçülen çalışma süresi artık zaman içinde tutarlı biçimde birikiyor.

* **İleriye doğru biriken çalışma süresi** — Bir ışık düğümünün ödül uygunluğu çalışma süresi, artık her kendi kaydından itibaren, o andaki geçerli kalp atışı aralığında ileriye doğru beklenen kalp atışı sayısını biriktirerek hesaplanıyor; tüm geçmişinin, o an geçerli olan aralığa göre yeniden hesaplanması yerine. Bu nedenle kalp atışı aralığındaki bir yönetişim değişikliği yalnızca bundan sonrasını etkiler ve bir düğümün geçmiş performansını asla geriye dönük olarak yeniden derecelendirmez.

## v3.1.86 — Doğrulayıcı Kurtarma Güvencesi

**Sürüm odağı:** Bir doğrulayıcı artık kesinti hapishanesinden kurtulmakta kalıcı olarak kilitli kalamaz.

* **Hapishane kilidi düzeltmesi** — Kayıtlı bir kuantum-sonrası anahtarı olmayan bir doğrulayıcı operatör hesabı, hibrit imza zorunluluğu klasik yedeği devre dışı bırakılmış şekilde zorunlu olarak ayarlansa bile, artık her zaman kesinti hapishanesinden kurtulmak için `MsgUnjail` gönderebilir. Daha önce böyle bir hesabın kurtulma yolu yoktu, çünkü hapisten çıkmak zaten gönderilmesi engellenmiş bir işlem göndermeyi gerektiriyordu.
* **Durum-senkronizasyonu anlık görüntüleri** — Anlık görüntü üretimi ağ genelinde etkinleştirildi; bu sayede yeni doğrulayıcılar ve tam düğümler, tam bir geçmiş yeniden oynatma yerine durum senkronizasyonu ile hızlıca katılabilir.

## v3.1.85 — Bağlı Cüzdanlar Üzerinden Yetkili Harcama

**Sürüm odağı:** Bağlı bir harici cüzdan anahtarı (Phantom, MetaMask) artık tek kurallı kuantum-sonrası hesaptan — en az ayrıcalık izinleri, harcama limitleri ve anında iptal altında — **harcama** yapabilir.

* **Yetkilendirici yürütme hatları** — Kayıtlı bir yetkilendiricinin, hesap sahibi mevcut olmadan kurallı hesaptan transferleri yetkilendirmesini sağlayan iki yeni mesaj: **`MsgExecuteEVM`** (hesabın `0x…` adresinden bir EVM çağrısı/transferi) ve **`MsgExecuteCosmos`** (bir Native-hattı banka gönderimi). Bir **röle (relayer)**, zarfı gönderir ve ücretini öder — kendi hibrit PQC imzası işlem gereksinimlerini karşılar — yetkilendiricinin alan-ayrımlı, tekrar-oynatmaya karşı bağlanmış imza baytları üzerindeki imzası ise yetkilendirmenin ta kendisidir. Harici anahtarın hiçbir zaman bir ML-DSA ortak imzasına ihtiyacı olmaz.
* **Yetkilendirici olarak MetaMask** — secp256k1 yetkilendiricileri artık (33 baytlık sıkıştırılmış anahtar biçimine ek olarak) **20 baytlık Ethereum adresleriyle** kaydedilebilir ve **EIP-191 `personal_sign`** ile doğrulanabilir; böylece standart bir MetaMask hesabı bağlanıp limitler dahilinde harcama yapabilir.
* **Her üç hatta da uygulama** — İzin kapsamları ve **SpendingRule** değer limitleri (işlem başına + günlük tavanlar) Native, EVM ve SVM hatlarının tümünde uygulanır; anahtar yönetimi mesajları hiçbir zaman devredilemez. Farklı hata kodları, cüzdanların doğru mesajı göstermesini sağlar: `5` harcama limiti aşıldı, `6` yetkilendirici süresi doldu, `10` izin reddedildi, `11` tekrar oynatma reddedildi.
* **İzin şeması sorgusu** — `GET /qorechain/abstractaccount/v1/permission_schema` (ayrıca gRPC/CLI üzerinden), kurallı izin taksonomisini (11 izin), mesaj→izin eşlemesini ve devredilemez mesaj listesini döndürür; böylece cüzdanlar kapsamları sabit kodlamadan doğrulayabilir.
* **Aynı algoritmalı PQC anahtar rotasyonu** — Yeni **`MsgRotatePQCKey`**, bir hesabın ML-DSA-87 anahtarını aynı algoritma içinde döndürür (eski ve yeni anahtarlarla çift imzalı); bu, eski türetilmiş anahtarların kurallı adrese bağlı türetmeye geçişini ve ele geçirilmiş bir anahtarın emekliye ayrılmasını sağlar. Yeni CLI: `tx pqc rotate-key` ve `tx pqc recover-key` (bir anımsatıcı ifadeden deterministik anahtar kurtarma).
* **Kök anahtar işlemleri etkilenmedi** — Değişiklikler eklemelidir; normal cüzdan ve borsa akışları değişmemiştir. Düğüm operatörleri, ağ yükseltme yüksekliğine kadar **v3.1.85** sürümünde olmalıdır.
* **Mevcut durum** — Akıllı hesap ve bağlı cüzdan özellikleri uygulanmıştır ancak şu anda her iki ağda da **kapalıdır** (`abstractaccount.enabled = false`); v3.2.0'dan itibaren bayrak kapalıyken her yetkilendirici yolu reddedilir. Bir bağlama akışı sunmadan önce `GET /qorechain/abstractaccount/v1/config` adresini kontrol edin.

## v3.1.84 — Yetkilendirici İzinleri ve Harcama Limitleri

**Sürüm odağı:** Yetkili harcamanın arkasındaki izin modeli.

* **Kurallı izin taksonomisi** — Başarısızlıkta-kapalı bir mesaj→izin eşlemesiyle on bir izin (`all`, `send`, `delegate`, `withdraw`, `vote`, `evm`, `wasm`, `svm`, `amm`, `ibc`, `deploy`): eşlenmemiş bir mesaj türü reddedilir ve anahtar yönetimi mesajları hiçbir zaman devredilemez.
* **SpendingRule uygulaması** — İzin verilen para birimi listeleriyle birlikte işlem başına ve gün başına (UTC) harcama tavanları, her (hesap, yetkilendirici) çifti için uygulanır ve kaydedilir.
* **SVM hattı yetkilendirmesi** — Yabancı-şemalı bir anahtar (örn. Phantom ed25519) tarafından SVM hattında yetkilendirilen eylemler, aynı merkezi yetkilendirme kapısından geçer.

## v3.1.83 — Her Üç Arayüzde Birleştirilmiş Hesap İmzalama

**Sürüm odağı:** Tek anahtar, tek hesap — Cosmos, EVM ve SVM arayüzlerinde artık yalnızca bakiye tutmakla kalmayıp **imzalayabilen** tek bir birleşik kimlik.

* **Her hatta imzalayan tek anahtar** — Eth-native olarak oluşturulmuş bir hesap (adres = secp256k1 ortak anahtarının keccak'ı), artık EVM işlemlerine ek olarak Cosmos-hattı işlemlerini de `eth_secp256k1` şemasıyla imzalar. Onun `qor1…` (Cosmos), `0x…` (EVM) ve Solana-VM (base58) biçimleri, hem **tek bir bakiye tutan** hem de **her üç hatta harcama yapan** — kuantum-sonrası hibrit (ML-DSA-87) Cosmos işlemleri dahil — tek bir 20 baytlık kimliktir.
* **Kuantum-sonrası imzalama değişmedi** — Birleşik hesap, ML-DSA-87 anahtarını hâlâ kaydeder ve zincirin gerektirdiği FIPS-204 hibrit imzayı taşır; klasik kısım coinType-118 şeması yerine `eth_secp256k1` (keccak) olur. Mevcut coinType-118 hesapları bundan etkilenmez.
* **Konsensüs-tarafsız kademeli yükseltme** — Her iki ağda da **yeniden genesis yapılmadan ve zincir durmadan** kademeli bir ikili (binary) yükseltme olarak sunuldu. Hesap bakiyeleri, geçmişi ve genesis değişmedi.
* **İstemci araçları** — `@qorechain/wallet-adapter` 0.1.5, eth-native Cosmos imzalama (`signClassicalEth` / `signHybridEth`), birleşik 3-adres üretimi ve `walletFromSeed` (herhangi 32 baytlık bir tohumdan — örn. bir Phantom imzasından — kurallı hesabı türetme) ekler; `@qorechain/chain-bridge` bir `eth_secp256k1` imzalama yolu kazanır.

:::caution Düğüm operatörleri — yükseltme gerekli
Tam düğümler **v3.1.83+** çalıştırmalıdır. v3.1.83 öncesi bir düğüm, eth-native (`eth_secp256k1`) bir işlemi çözemez ve bir blokta böyle bir işlem göründüğünde senkronizasyonu durdurur. Güncel paketi [download.qore.host](https://download.qore.host) adresinden indirin.
:::

## v3.1.82 — SVM Üzerinde Yerel QOR Canlıda + Entegratör Etkinleştirmesi

**Sürüm odağı:** Her iki ağda çalışan SVM yerel-QOR birleştirmesi, artı bir borsa veya entegratörün bağlanmak için ihtiyaç duyduğu her şey.

* **Her üç arayüzde canlı birleşik yerel-QOR bakiyesi** — SVM birleştirmesinin (v3.1.81) ana ağda ve test ağında canlı olduğu doğrulandı: aynı hesap, Cosmos'ta `uqor` (6 ondalık basamak), EVM'de wei-tarzı 18 ondalık basamak ve Solana-uyumlu arayüzde lamport (9 ondalık basamak; 1 uqor = 1.000 lamport) olarak görünen tek bir bakiye tutar.
* **Doğrulanmış genel uç noktalar** — Her iki ağda da konsensüs RPC, REST, EVM JSON-RPC ve SVM JSON-RPC için genel HTTPS uç noktaları, artı genel [blok gezgini](https://explore.qore.network). Bkz. [Ağlar](/appendix/networks).
* **İndirmeler** — Sürümlü düğüm ikili paketleri, ana ağ genesis'i ve (SHA-256 sağlama toplamlarıyla) taze zincir verisi anlık görüntüleri [download.qore.host](https://download.qore.host) adresinde yayınlandı.
* **İstemci yığını genelinde deterministik kuantum-sonrası imzalama** — `@qorechain/pqc` 0.1.1, altı dil bağlamasının tümünde ML-DSA-87'yi zincirin kabul ettiğiyle eşleşecek şekilde deterministik olarak (FIPS-204 §3.4) imzalar; `@qorechain/wallet-adapter` 0.1.2, hibrit işlem imzalama için bunun üzerine inşa edilir.
* **Entegratör kılavuzu** — Üç arayüz genelinde para yatırma, para çekme ve düğüm işlemlerini kapsayan yeni [Borsa ve Entegratör Kılavuzu](/developer-guide/exchange-integration).

## v3.1.81 — SVM Yerel-QOR Birleştirmesi

**Sürüm odağı:** Solana-uyumlu arayüzde birinci sınıf bir varlık olarak yerel QOR.

* **SVM üzerinde yerel QOR** — SVM çalışma zamanı artık hesabın yerel QOR bakiyesini, ayrı bir yalnızca-SVM bakiyesi tutmak yerine doğrudan (lamport cinsinden) yüzeye çıkarıyor. `getBalance` ve `getSignaturesForAddress`, yerel fonlar üzerinde çalışır ve Sistem Programı transferleri yerel QOR'u hareket ettirir.
* **SVM adres eşlemesi** — Bir hesabın SVM adresi, 20 baytlık hesap baytlarından (32 bayta sağdan doldurularak, base58 kodlamalı) türetilir; böylece tek bir anahtarın Cosmos, EVM ve SVM adresleri aynı fonlara işaret eder.

## v3.1.80 — Çok Katmanlı Durum-Çıpası Sorguları

**Sürüm odağı:** Rollup'lar için okunabilir, çevrimdışı doğrulanabilir yerleşim çıpaları.

* **Çıpa okuma sorguları** — `x/multilayer` sorgu servisi artık `Anchor`'ı (bir katmanın en son durum çıpası) ve `Anchors`'ı (bir katmanın çıpa geçmişi) sunuyor; böylece istemciler bir katmanın yerleşim çıpasını alıp bağımsız olarak doğrulayabilir.
* **Çok katmanlı için REST ağ geçidi** — Her çok katmanlı sorgu (`params`, `layers`, `layers/{layer_id}`, `anchor/{layer_id}`, `anchors/{layer_id}`, `routing-stats`) artık gRPC'ye ek olarak REST üzerinden de kullanılabilir.
* **Kuantuma dayanıklı yerleşim makbuzları açıldı** — Her çıpa, kurallı alanları üzerinde bir **ML-DSA-87 (Dilithium-5)** imzası taşır ve bu, Rollup Geliştirme Kiti'nin çevrimdışı yerleşim-makbuzu doğrulaması için zincir üzerindeki temeli sağlar.

## v3.1.79 — Köprü Ağları için Doğrulayıcı Otomatik Hazırlama

**Sürüm odağı:** Lisanslı doğrulayıcılar için bağlı ağlarda anahtar teslim katılım.

* **Ağ sürücüsü çerçevesi** — İlgili `validator_<chain>` (veya `qcb_bridge`) lisansına sahip bir QoreChain doğrulayıcısının, yalnızca lisans etkinleştirildikten sonra eşleşen harici ağ istemcisinin aynı düğümde QoreChain orkestrasyonu altında hazırlanmasını, yapılandırılmasını ve çalıştırılmasını sağlayan bildirim tabanlı bir sürücü çerçevesi.
* **37 köprü ağının tümü için sürücüler** — Kapsam, katılım modeline (izinsiz doğrulayıcı, sınırlı/seçilmiş/kabul, L2 tam düğüm ve doğrulama-yapmayan/güven-listeli roller) göre sınıflandırılmış, bağlı her ağı içerir. Harici ağ stake'i ve imzalama anahtarları, ağ başına operatör tarafından sağlanmaya devam eder; QoreChain çerçeveyi ve zorunlu lisans kapısını sunar.

## v3.1.78 — Devreye Almadan Önce Hazır Olma

**Sürüm odağı:** Cüzdanlar, köprüler, IBC ve lisanslama, devreye almadan sonra hiçbir yönetişime gerek kalmadan lansmanda çalışır.

* **Güvensiz-taraf devreye alma sonrası köprü etkinleştirmesi** — Bir `bridge_admin` anahtarı (veya `qcb_bridge` lisans sahibi), tek bir imzalı işlemle (`tx bridge update-chain-config` / `set-verifier-bootstrap`) bağlı herhangi bir zincirin köprüsünü etkinleştirebilir — sözleşme adresini, onay sayılarını, mimariyi, durumu, etkin doğrulayıcıyı ve doğrulayıcı güven kökünü ayarlayarak — hiçbir yönetişim önerisi veya zincir yükseltmesi olmadan.
* **Doğrulayıcı-ağ lisans kapısı** — Orkestratör artık herhangi bir harici ağ istemcisini başlatmadan önce `validator_<chain>` / `qcb_bridge` lisansını (başarısızlıkta-kapalı) uygular.
* **Cüzdan entegrasyon paketleri** — `@qorechain/wallet-adapter` ve `@qorechain/connect` npm'e yayınlandı (v0.1.0); tek çağrılık MetaMask ağ kaydı (EIP-3085, EVM rayında **18 ondalık basamaklı** yerel QOR) ve Keplr gaz-fiyatı yapılandırması ekler.
* **IBC anahtar teslim röle** — Sekiz IBC karşı tarafı için hazır-çalıştırılabilir röle yapılandırması ve kanal başlatma araçları; böylece kanallar devreye almadan sonra özel bir kurulum gerektirmeden ayağa kalkar.

## v3.1.77 — Köprü ve Yakma REST Uç Noktaları

**Sürüm odağı:** Çapraz zincir ve arz modülleri için yalnızca-okunur REST erişimi.

* **Köprü REST uç noktaları** — Köprü modülü için, köprü durumunu gRPC'ye ek olarak standart REST üzerinden de sunan yalnızca-okunur HTTP sorgu uç noktaları.
* **Yakma REST uç noktaları** — Yakma modülü için yalnızca-okunur HTTP sorgu uç noktaları; ücret dağıtımı ve arz verisini standart REST üzerinden sorgulanabilir kılıyor.

## v3.1.76 — SVM Araç Zinciri Modernizasyonu

**Sürüm odağı:** Solana Sanal Makinesi uyumluluk yenilemesi.

* **Güncel araç zinciri program desteği** — SVM yürütmesi, güncel Solana araç zinciriyle derlenmiş programların QoreChain SVM çalışma zamanında çalışacağı şekilde modernize edildi.

## v3.1.75 — Varsayılan Olarak SVM JSON-RPC

**Sürüm odağı:** Kutudan çıktığı gibi çalışan Solana-uyumlu RPC.

* **Solana-uyumlu JSON-RPC** — SVM JSON-RPC sunucusu artık varsayılan olarak etkin (port **8899**) ve düğümle birlikte otomatik olarak başlıyor; SVM araçları için Solana-uyumlu bir RPC arayüzü sağlıyor.

## v3.1.74 — Rollup Profil Ön Ayarları

**Sürüm odağı:** Rollup Geliştirme Kiti kullanılabilirliği ve yerleşim.

* **Profil ön ayarı uygulaması** — Rollup oluşturma artık seçilen profilin ön ayarını (DeFi, oyun, NFT, kurumsal veya tamamen özel) uyguluyor; böylece yeni rollup'lar kullanım durumlarına uygun makul varsayılanları devralıyor.
* **İyimser yerleşim** — İyimser yerleşim yolu (toplu gönderim ve itiraz) uçtan uca çalışır durumda.

## v3.1.73 — Kuantum-Sonrası Özet (Hash) Temeli

**Sürüm odağı:** Varsayılan kuantum-sonrası kriptografik temelin tamamlanması.

* **Varsayılan özet olarak SHAKE-256** — SHAKE-256 (SHA-3 ailesi), varsayılan uygulama özeti olarak benimsendi; bu, **ML-DSA-87 (Dilithium-5)** imzaları, **ML-KEM-1024** anahtar kapsülleme ve **SHAKE-256** özetlemeden oluşan varsayılan kuantum-sonrası temeli tamamlıyor.

## v3.1.72 — Kararlılık ve Bakım

**Sürüm odağı:** Rutin kararlılık ve derleme hattı bakımı.

* **Kararlılık iyileştirmeleri** — Dışarıdan görünür herhangi bir davranış değişikliği olmadan iç kararlılık, bağımlılık ve derleme hattı bakımı.

## v3.1.71 — PQC Hibrit İmzalar Varsayılan Olarak Zorunlu

**Sürüm odağı:** Cosmos işlem yolunda varsayılan olarak açık kuantum-sonrası güvenlik.

* **Varsayılan olarak gerekli imzalar** — Kuantum-sonrası hibrit imzalar artık Cosmos işlem yolunda varsayılan olarak zorunlu: her işlem, klasik **secp256k1** imzasının yanında bir kuantum-sonrası **ML-DSA-87 (Dilithium-5)** imzası taşır.
* **Yönetişim tarafından kontrol edilen zorunluluk** — Zorunluluk modu yönetişim tarafından kontrol edilmeye devam ediyor; varsayılan olarak **gerekli** ayarlandı.

## v3.1.70 — Üretim Sertleştirmesi

**Sürüm odağı:** Canlı ana ağ için üretim sertleştirmesi ve konsensüs optimizasyonu.

* **PRISM konsensüs optimizasyonu** — Canlı ağ koşulları altında uyarlanabilir parametre ayarlaması için PRISM pekiştirmeli öğrenme optimizasyon katmanında, devre kesici güvenlik kontrolleriyle birlikte devam eden iyileştirmeler.
* **Performans ve kararlılık** — Doğrulayıcılar ve tam düğümler genelinde verim, gecikme ve kaynak kullanımı iyileştirmeleri.
* **Operasyonel araçlar** — Ana ağ operatörleri için geliştirilmiş izleme, sorgu ve düğüm işletme ergonomisi.
* **Tokenomics v2.1 uyumu** — Ücret dağıtımı ve emisyon mekaniği, sonlu ve tavanlı emisyonlu ekonomik modelle uyumlu hale getirildi (daha sonra v3.1.94 emisyon tavanıyla yeniden düzenlendi).

## v3.0.0 — Ana Ağ Genesis'i

**Sürüm odağı:** Ana ağ lansmanı ve token üretim etkinliği.

* **Ana ağ genesis'i** — QoreChain ana ağı (`qorechain-vladi`, EVM zincir kimliği 9801), genesis'te token üretim etkinliği (TGE) ile birlikte **7 Haziran 2026**'dan beri canlıdır.
* **Beş yönlü ücret bölünmesi** — Doğrulayıcılar, yakma, hazine, stake sahipleri ve ışık düğümleri arasında protokol ücreti dağıtımı (**37 / 30 / 20 / 10 / 3**); ışık düğümleri için özel bir pay ekliyor.
* **Zincir üzerinde AMM** — Zincir üzerinde likidite havuzları ve takaslar için yerel otomatik piyasa yapıcı (AMM) modülü (`x/amm`).
* **Zincir lisanslama** — Protokol yetkilerini kaydetmek ve yönetmek için zincir üzerinde lisans modülü (`x/license`).
* **Sertleştirilmiş yerleşim paradigmaları** — RDK yerleşim modları iyimser, zk, based ve sovereign olarak kesinleşti.

## v1.4.0 — Ana Ağ Öncesi Genişleme

**Sürüm odağı:** Ana ağ öncesinde çapraz zincir kapsamı ve yayın-adayı stabilizasyonu.

* **Genişletilmiş çapraz zincir kapsamı** — Daha geniş bir harici ağ kümesine ek IBC ve köprü bağlantısı.
* **Işık düğümü katılımı** — Işık düğümleri ve ücret-payı ödülleri için temel tanıtıldı.
* **Yayın-adayı sertleştirmesi** — Ana ağ genesis'ine hazırlıkta tüm çekirdek modüller genelinde kapsamlı test, denetim ve stabilizasyon.

## v1.3.0 — Rollup Geliştirme Kiti

**Sürüm odağı:** Egemen ve paylaşılan-güvenlik rollup dağıtımları için yerel rollup altyapısı.

* **x/rdk modülü** — Dört yerleşim paradigmasıyla tam Rollup Geliştirme Kiti: iyimser, zk, based ve sovereign
* **5 ön ayarlı profil** — DeFi, oyun, NFT, kurumsal ve tamamen özel kullanım durumları için önceden yapılandırılmış rollup şablonları
* **Yerel veri kullanılabilirliği** — Blob depolama, saklama yönetimi ve budama yaşam döngüsüne sahip zincir üzerinde DA katmanı
* **EndBlocker otomatik kesinleştirme** — İtiraz penceresi sona erdiğinde, operatör müdahalesi olmadan otomatik toplu kesinleştirme
* **AI destekli profil seçimi** — Amaçlanan kullanım durumuna göre en uygun rollup yapılandırmasını öneren `suggest-profile` sorgusu
* **Çok katmanlı entegrasyon** — Rollup'lar, çok katmanlı mimaride katman olarak kaydolur ve yönlendirme, çıpalama ve itiraz mekaniğini devralır
* **Banka teminat yaşam döngüsü** — Operatör stake'i, rollup işletimi sırasında teminatta tutulur ve temiz kapanışta serbest bırakılır veya slashing'de kaybedilir

## v1.2.0 — IBC ve Köprüler

**Sürüm odağı:** Çapraz zincir bağlantısı ve gelişmiş hesap soyutlamaları.

* *(Tasarlandı; çapraz zincir katmanı hâlâ beklemede — bkz. [Köprü Mimarisi](/architecture/bridge-architecture).)* **25 çapraz zincir bağlantısı** — Harici ağlara 8 IBC kanalı ve 17 QoreChain Köprüsü (QCB) bağlantısı
* **x/babylon modülü** — Bitcoin sahiplerinin QoreChain stake güvenliğine katılmasını sağlayan BTC yeniden-stake entegrasyonu
* **x/abstractaccount modülü** — Programlanabilir harcama kuralları, oturum anahtarları ve özel kimlik doğrulama mantığına sahip akıllı hesap çerçevesi
* **x/fairblock modülü** — MEV'e dayanıklı işlem şifrelemesi için Eşik Kimlik-Tabanlı Şifreleme (tIBE)
* **x/gasabstraction modülü** — Yerel QOR, IBC-köprülenmiş USDC ve IBC-köprülenmiş ATOM'u destekleyen çoklu-token gaz ödemesi tasarımı (henüz açık bir IBC kanalı yok)
* **5 hatlı işlem önceliklendirmesi** — Blok alanı önceliklendirmesi için hat tanımları (yalnızca yapılandırma; canlı mempool tarafından uygulanmıyor)
* **IBC röle yapılandırmaları** — Desteklenen tüm IBC kanalları için önceden yapılandırılmış röle kurulumları
* **Köprüden yakmaya entegrasyon** — Köprü ücretleri, yakma modülünün ücret dağıtımı üzerinden yönlendirilir

## v1.1.0 — PQC Hibrit İmzalar

**Sürüm odağı:** Kuantum-sonrası kriptografik güvenlik ve algoritma çevikliği.

* **Çift secp256k1 (ECDSA) + ML-DSA-87 imzalar** — Her işlem, AnteHandler zincirinde doğrulanan hem klasik hem de kuantum-sonrası bir imza taşır
* **3 zorunluluk modu** — Yapılandırılabilir hibrit imza zorunluluğu: kapalı (mod 0), izin verici (mod 1, PQC isteğe bağlı), zorunlu (mod 2, PQC gerekli)
* **Anahtar kaydı** — İlk derlemeler ilk hibrit işlemde bir PQC ortak anahtarını otomatik olarak kaydediyordu; bu davranış kaldırıldı ve artık bir anahtar `MsgRegisterPQCKey` ile açıkça kaydedilir (bkz. [İlk İşlem](/getting-started/first-transaction#register-pqc-key))
* **SHAKE-256 özet temeli** — PQC ile ilgili tüm özetleme işlemleri, kuantuma dayanıklı adres türetimi için SHAKE-256 (SHA-3 ailesi) kullanır
* **TEE tanıklama arayüzleri** — PQC anahtar üretimi bütünlüğünü kanıtlamak için Güvenilir Yürütme Ortamı tanıklama desteği
* **Algoritma çevikliği çerçevesi** — Gelecekteki PQC algoritmalarının bir zincir yükseltmesi olmadan yönetişim yoluyla eklenmesine izin veren eklenebilir algoritma kaydı

## v1.0.0 — Genesis (Tokenomics Motoru)

**Sürüm odağı:** Tam tokenomics, çoklu-VM yürütme ve AI destekli operasyonlarla başlangıç protokol lansmanı.

* **x/burn modülü** — Doğrulayıcılar, yakma, hazine ve stake sahipleri arasında dört yönlü dağıtıma sahip çok kanallı ücret yakma mekanizması
* **x/xqore modülü** — Kademeli erken-kilit açma cezaları ve PvP rebase yeniden dağıtımına sahip yönetişim stake türevi
* **x/inflation modülü** — Yıllık düşüşe sahip dönem-tabanlı emisyon (v3.1.94'te, sert bir kümülatif tavan altında dönem başına sabit bir tutarla değiştirildi)
* **PRISM konsensüs katmanı** — Dinamik zincir parametre ayarlaması için pekiştirmeli öğrenme optimizasyonu (PPO), devre kesici güvenlik kontrolleriyle
* **Üçlü havuzlu CPoS** — İtibar puanlarına göre ağırlıklandırılmış RPoS, DPoS ve PoS doğrulayıcı havuzlarına sahip Bileşik Stake Kanıtı (`x/qca` içinde uygulandı; henüz blok üretimine bağlanmadı)
* **QDRW yönetişimi** — İtibar Ağırlıklı Kuadratik Delegasyon (Quadratic Delegation with Reputation Weighting) oy gücü formülü (uygulandı; canlı ağlarda devre dışı)
* **EVM + QoreChain Native + SVM çalışma zamanları** — QoreChain EVM Motoru, QoreChain Native akıllı sözleşmeleri ve Solana Sanal Makinesi olmak üzere üç eşzamanlı yürütme ortamı
* **VM'ler arası köprü** — Tek bir blok içinde EVM, QoreChain Native ve SVM çalışma zamanları arasında mesaj geçişi ve varlık transferleri
* **Kuantum-sonrası kriptografi** — Yüksek performanslı bir PQC kütüphanesi tarafından desteklenen kuantuma dayanıklı imzalama
* **QCAI** — Dolandırıcılık tespiti, ücret tahmini ve ağ optimizasyonu için isteğe bağlı bir çevrimdışı yan bileşenle birlikte zincir üzerinde sezgisel analiz
* **Konteynerleştirilmiş dağıtım** — Yan bileşen servisi ve blok indeksleyicisiyle tam çoklu-doğrulayıcı test ağı dağıtımı
* **Blok indeksleyicisi** — Geçmiş sorgulama ve analiz için kalıcı depolamaya sahip blok dinleyici
