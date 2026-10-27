---
slug: /dashboard/quests
title: Görevler
sidebar_label: Görevler
sidebar_position: 10
---

# Görevler

**Görevler**, siz tamamlarken QoreChain'i kullanmanızda size rehberlik eden adım adım yapılan işlerdir. Bir görev, cüzdanınıza para yüklemek, bir transfer yapmak veya bir hesabı bağlamak gibi bir veya daha fazla adımı bir araya getirir ve tamamladığınızda sizi ödüllendirir. Bu sayfa ayrıca kenar çubuğundaki **Earn** grubunun diğer sayfalarını ve oyun salonunu kapsar: **Leaderboard**, **Badges** ve **Games**. Hepsi, ağı uygulamalı olarak öğrenmek ve ilerleme biriktirmek isteyen topluluk üyeleri içindir.

## Yenilikler {#innovations}

- **Kendi beyanı değil, doğrulanmış tamamlama.** Bir görev, denetimi geçtiğinde sayılır. Eigenstate 2, her görevde denetim türünü belirtir: **bağlı hesap**, **bağlı cüzdan**, **kanıt bağlantısı**, **ekip incelemesi** veya **sınav**.
- **Sosyal görevler yalnızca doğrulanmış hesaplar için sayılır.** X, Telegram veya Discord içeren bir görev (ve Eigenstate 2 bağlı hesap denetimlerinde ayrıca YouTube ve GitHub) yalnızca hesabı **Profile**'ınızda bağladığınızda ve bağlantı doğrulandığında sayılır. O zamana kadar sayfa, bir **Go to Profile** bağlantısıyla birlikte *Connect Social Accounts* gösterir.
- **Ön koşullar uygulanır.** Kilitli bir görev önce neyi bitirmeniz gerektiğini söyler ("Complete "..." first").
- **Net durumlar.** Started, Pending Verification, Pending Review, Failed ve Completed; böylece bir insan incelemesi bekleyen görev başarısız gibi gösterilmez.
- **Tek sayfada iki sezon.** **Eigenstate 1** ve **Eigenstate 2** sekmelerinin kendi görev kümeleri ve kategorileri vardır.

## Nasıl kullanılır {#how-to-use}

### Görevlere göz atın

**Quests** sayfasını açın (kenar çubuğu **Earn**). Bir özet, kaç görevin mevcut olduğunu, kaçının devam ettiğini ve kaçının tamamlandığını gösterir. **Kategori sekmeleri** listeyi filtreler:

- Eigenstate 1: Onboarding, Trading, Social, Community, Learning, Daily ve Weekly.
- Eigenstate 2: Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain ve Other.

Boş bir kategori "No quests in this category yet." metnini gösterir. Her görev kartı bir simge, başlık ve kısa açıklama, bir **zorluk** rozeti, tahmini bir süre, **ödül** (QOR olarak veya özdeğer puanı, λ, olarak) ve bir durum (tamamlandı, devam ediyor, başlatıldı veya kilitli) gösterir.

### Bir Eigenstate 1 görevini tamamlayın

1. Bir görevi açın ve **Start Quest** öğesini seçin (sonrasında **Continue Quest**).
2. Görevler üzerinde çalışın. Bir görev, **Go to Action** (ilgili Panel sayfasına gitmek için) ve **Complete** (bir adımı doğrulanabilmesi için onaylamak için) seçeneklerini sunar.
3. Bir ilerleme çubuğu, tamamlanan görevleri takip eder.
4. Tüm görevler bittiğinde, görevi doğrulamak ve ödülünü almak için **Check Completion** öğesini seçin.

Günlük ve haftalık görevler bir programa göre sıfırlanır; ayrıntı sayfası sıfırlama sıklığını ve serinizi gösterir. [Musluk](/dashboard/faucet) üzerinden yapılan bir talep, musluk görevlerine sayılır.

### Bir Eigenstate 2 görevini tamamlayın

1. Görevi açın ve denetim türünü okuyun.
2. Görevin sunduğu düğmeyi kullanın. Hangisinin görüneceği denetim türüne ve mevcut duruma bağlıdır: **Verify**, **Submit**, **Resubmit**, **Retry verification** veya **Re-check status**.
3. Durumun Started, Pending Verification veya Pending Review aşamalarından geçip Completed (ya da Failed) olmasını izleyin.

### Leaderboard {#leaderboard}

`/leaderboard`, kişileri özdeğer puanlarına (λ) göre sıralar; ilk üç, topluluk istatistikleri ve bir arama kutusu içerir. Zincir dışı bir sıralamadır.

### Badges {#badges}

`/badges`, 12 rozet serisinden oluşan bir katalogdur. **Check Badges**, ilerlemenizi yeniden değerlendirir. Bir **Badge Widget**, bir rozeti başka bir yerde göstermeniz için **Copy Code** ile bir iframe, BBCode veya Markdown parçacığı verir. Köprü canlı olmadığı halde listede bir Bridge serisi görünür.

### Games {#games}

`/games`, 12 oyunlu **QoreChain Arcade**'dir: Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze ve Wave Coder. Bir karttaki **Play Now** öğesini seçin; skorunuz (Photons, γ) oyun bittiğinde gönderilir. Skorlar zincir dışında tutulur.

## Nasıl erişilir {#how-to-access}

- **URL'ler:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Oturum açma:** hepsi için gereklidir. Oturumunuz kapalıyken `/quests` sizi oturum açmaya yönlendirir; Leaderboard, Badges ve Games bir "Authentication Required" ekranı gösterir.
- **Ağ:** hiçbiri ağ anahtarını izlemez.
- **Cüzdan:** hiçbiri için gerekmez, ancak işlem içeren görevler için fonlanmış bir testnet cüzdanı gerekir (bkz. [Cüzdan](/dashboard/wallet#testnet) ve [Musluk](/dashboard/faucet)); sosyal görevler bağlı hesaplar gerektirir.
- **Maliyet:** ücretsiz.

## Nerede yayımlanır {#where-published}

| Sayfa | Adres | Hesap |
| --- | --- | --- |
| Görevler (Eigenstate 1 ve 2) | `dashboard.qorechain.io/quests` | Oturum açma |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Oturum açma |
| Badges | `dashboard.qorechain.io/badges` | Oturum açma |
| Games | `dashboard.qorechain.io/games` | Oturum açma |

## Sınırlar ve bilinen sorunlar {#limits}

- **Görev kümeleri değişir.** Bir sezonun sekmesi, görevleri etkin olmadığında boş olabilir veya daha az görev gösterebilir; güncel liste için bu sayfaya güvenmek yerine sekmeye bakın.
- **Buradaki her şey zincir dışıdır:** puanlar, sıralamalar, rozetler ve oyun skorları QoreChain'de değil, Panel tarafından kaydedilir. Arcade alt başlığındaki "on-chain" sözcüğü skorları tanımlamaz.
- **Ödül tutarları** her görevde gösterilir ve değişebilir.
- **Oturum açma** ve sosyal görevler için doğrulanmış bağlı hesaplar gereklidir.
- **Public Sale** (`/public-sale`), mevcut katılımcılar için ayrı bir sayfadır (tahsis, vesting zaman çizelgesi, talep); önceki tüm turlar kapalıdır ve burada daha fazla açıklanmaz.
- **FAQ** (`/faq`), içeriği bu kılavuzun gerisinde kalan uygulama içi bir yardım sayfasıdır.

## İlgili

- [Genel Bakış ve Başlangıç](/dashboard/overview) - görevlere başlamadan önce oturum açın ve cüzdanınızı bağlayın.
- [Musluk](/dashboard/faucet) - işlem içeren görevler için bir testnet cüzdanına para yükleyin.
