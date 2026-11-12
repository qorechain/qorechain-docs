---
slug: /rollups/rdk-v328
title: "v3.2.8 Üzerinde RDK: Neler Değişti"
sidebar_label: v3.2.8 Üzerinde RDK
sidebar_position: 11
---

# v3.2.8 Üzerinde RDK: Neler Değişti

QoreChain v3.2.8 sürümü rollup'ların nasıl mutabakata vardığını değiştirir. Rollup'lar artık verilerini zincire koyabilir, işlemlerini zincire sıralatabilir (based sıralama), batch'i yeniden çalıştıran bir sahtekarlık ispatıyla iyimser (optimistic) biçimde mutabakata varabilir, gönderilerini bir üye kümesine özel tutabilir ve Groth16 para çekme köklerini herhangi bir 32 baytlık kökü kabul edecek biçimde bağlayabilir. STARK mutabakatı daha sonraki bir sürüme kadar duraklatılmıştır. Bu sayfa her değişikliğin ne yaptığını ve nasıl kullanılacağını anlatır. `x/rdk` modülü üzerinde çalışan rollup operatörleri ve geliştiricileri içindir.

:::caution Şimdilik yalnızca test ağı

v3.2.8, herkese açık `qorechain-diana` test ağında 12 Kasım 2026'dan beri çalışmaktadır. Ana ağ bunu henüz uygulamamıştır; bu yüzden bu sayfadaki her özellik orada uygulanana kadar reddedilir. Örnekleri test ağı örnekleri olarak değerlendirin.

:::

:::note Bugün hangi araçlar bunu yapabilir

* **Düğüm komut satırı (`qorechaind`)**: bu sayfadaki her mesaj için bir komut vardır. Bu Linux düğüm ikili dosyasıdır; paketlenmiş bir macOS ikili dosyası yoktur, bu yüzden bir Mac'te onu bir Linux ana makinesinde çalıştırın veya zinciri REST üzerinden okuyun.
* **RDK kiti**: RDK 0.9.0, v3.2.8'i destekler. Her kayıt defterinde yayımlanmıştır: npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) ve Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Sürüm notları: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Python, Go, Rust ve Java RDK istemcileri**: her birinin 0.9.0 sürümü v3.2.8'i destekler. Aşağıdaki uçtan uca çalıştırma TypeScript istemcisini kullandı.

:::

## Bir bakışta neler değişti {#at-a-glance}

| Alan | v3.2.8'den itibaren davranış |
| --- | --- |
| Veri gönderme | `MsgPostRollupData`, bir yükü işlemin içine koyar ve rollup'ın sıradaki gelen kutusu (inbox) sırası altında zincirde bir taahhüt tutar. |
| Based sıralama | Zincir, bir rollup'ın işlemlerini zincire dahil edilme sırasına göre sıralar. Oluşturma sırasında veya `MsgSetRollupSequencing` ile yönetişim tarafından ayarlanır. |
| Optimistic rollup'lar | Yeni optimistic rollup'lar (`nft`, `custom`) `qledger-v1` yürütme modelini çalıştırır ve based olmak zorundadır. Bir sahtekarlık ispatı batch'i yeniden yürütür. |
| Gönderici teminatı | Bir `qledger-v1` rollup'ındaki batch'ler bir teminat (`MsgBondRollupSubmitter`) gerektirir. Kabul edilen bir sahtekarlık ispatı yarısını yakar, yarısını itiraz edene öder. |
| Para yatırma | `MsgDepositToRollup`, bir `qledger-v1` rollup'ında 32 baytlık bir hesabı kredilendirir. |
| Özel rollup'lar | Gizlilik modu `encapsulated` ile oluşturulan `defi` rollup'ları, yalnızca üyelerine yönelik ML-KEM-1024 zarflarını (`MsgSetRollupMembers`) kabul eder. |
| Groth16 girdileri | Girdiler BLS12-381 skaler alanı modülünde okunur. `withdrawals_root` herhangi bir 32 bayt olabilir ve indirgenmiş olarak saklanır. |
| STARK | STARK anahtarları ve STARK batch'leri daha sonraki bir sürüme kadar reddedilir. |
| Saklama süresi | Gönderilen veri taahhütleri `posted_data_retention_blocks` kadar tutulur; `qledger-v1` rollup'larında kontrol noktaları daha uzun tutulur. |

## Neden önemli {#why}

v3.2.8'den önce bir rollup'ın verisinin zincirde yeri yoktu; bu yüzden bir batch'i kontrol eden herkes sıralayıcının kopyasına güvenmek zorundaydı. Veri göndermek ve dahil edilme sırasına göre sıralamak bu güveni ortadan kaldırır: zincirin kendisi neyin ve hangi sırayla gönderildiğini kaydeder ve bir batch tam olarak o aralığı tüketmelidir. Optimistic rollup'lar için bir itiraz artık yalnızca bir kökü değil yürütmeyi kontrol eder; bu yüzden yanlış bir batch göndericisinin teminatını kaybettirir. Özel rollup'lar bir grubun, veriyi yayımlamadan herkese açık bir zincirde paylaşmasını sağlar.

## Rollup verisi göndermek {#posting-data}

`MsgPostRollupData` (komut `tx rdk post-data`) bir yükü bir işlemin içinde gönderir. Baytlar işlemin içinde kalır, dolayısıyla blokta bulunurlar. Zincir, rollup'ın sıradaki gelen kutusu sırası altında (1'den başlayarak) bir taahhüt tutar: verinin SHA-256 değeri, boyutu, gönderen ve yükseklik. Ayrıca rollup'ın gelen kutusu biriktiricisini (accumulator) genişletir.

* **Kim gönderebilir**: rollup'ın sıralayıcısı (sıralayıcı adresi ayarlanmamışsa oluşturucusu). Based bir rollup'ta herkes.
* **Boyut**: gönderi başına en fazla `max_posted_data_bytes` (varsayılan 131.072 bayt, katı tavan 1 MiB) ve tüm rollup'lar genelinde `max_posted_data_bytes_per_block` (varsayılan 524.288 faturalanabilir bayt).
* **Ücret**: faturalanabilir bayt başına `posted_data_fee_per_byte` uqor (varsayılan 10) ve bir gönderi en az 1 KiB olarak faturalanır. Ücret ücret toplayıcıya gider ve bir işlem ücreti gibi bölüştürülür. Gaz ayrıca tahsil edilir.
* **Saklama**: taahhüt `posted_data_retention_blocks` sonra (varsayılan 648.000) budanır. Baytlar blok geçmişinde kalır.
* **Bir batch'te kullanım**: based olmayan, yerel DA'lı bir rollup'ın batch'i, `data_hash` değeri verinin SHA-256 değerine eşit olacak şekilde tutulan bir gönderiye başvurabilir.

Komut satırı (Linux düğüm ikili dosyası):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Bir taahhüdü REST üzerinden okuyun (test ağında doğrulandı, bkz. [Kontrol edilen rotalar](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

Yanıt `data_hash`, `size`, `poster`, `height`, `inbox_acc` ve `expires_at_height` alanlarını taşır. Hiç gönderilmemiş veya budanmış bir sıra HTTP 404 döndürür.

## Based sıralama {#based-sequencing}

Based bir rollup, QoreChain üzerindeki dahil edilme sırasına göre sıralanır. Her gönderi sıradaki gelen kutusu sırasını alır ve her batch gelen kutusunu sırayla tüketir.

* Bir rollup'ı `--sequencing based` ile based olarak oluşturun veya mevcut bir rollup'ı yönetişim `MsgSetRollupSequencing` ile taşıyın.
* Her batch `inbox_end` değerini (tükettiği son gönderinin sırası) belirler ve gelen kutusu aralığı taahhüdünü `data_hash` olarak taşır. Bunu zincirden `query rdk inbox` ile isteyin (`range_data_hash` döndürür).
* Based bir rollup yalnızca yönetişim tarafından duraklatılır, sürdürülür ve durdurulur.

Based bir rollup'ta batch'leri kimin gönderebileceği rollup'a bağlıdır:

| Rollup | Batch'leri kim gönderir |
| --- | --- |
| Groth16 anahtarlı zk (`defi`) | Herhangi bir hesap. İspat kökleri, gelen kutusu aralığını ve para çekme kökünü bağlar. |
| based mutabakat (`gaming`, `enterprise`) | Yalnızca rollup'ın sıralayıcısı. |
| `qledger-v1` ile optimistic (`nft`, `custom`) | Gönderici teminatı bulunduran herhangi bir hesap. |

`qledger-v1` olmayan optimistic rollup'lar ve STARK rollup'ları bu sürümde based olamaz.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

Bir düğüme güvenmeden bunları hesaplamak isteyen ispatlayıcılar için biriktirici ve aralık taahhüdü:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` 32 sıfır bayttır ve `lp` 4 baytlık big-endian uzunluk önekidir.

## qledger-v1 ile optimistic rollup'lar {#qledger-v1}

v3.2.8'den itibaren yeni bir optimistic rollup, bir yürütme VM'i olmadan oluşturulamaz. `nft` ve `custom` ön ayarları `--sequencing based` ile birlikte `--execution-vm qledger-v1` gerektirir. v3.2.8'den önce oluşturulmuş optimistic rollup'lar değişmez.

`qledger-v1`, uqor cinsinden bir hesap defteridir (SHA-256 ile seyrek bir Merkle ağacı) ve imzalı transferler ile para çekmeler içerir. Hesap anahtarları yalnızca ML-DSA-44'tür. Girdileri kendi gelen kutusudur:

* **Kullanıcı gönderileri**: her biri bir işlem, en fazla 6 KiB.
* **Para yatırmalar**: `MsgDepositToRollup`, 32 baytlık bir hesap kimliğini kredilendirir. Zincir yatırmayı gelen kutusuna kendisi ekler.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Gönderici teminatı ve bekleyenler {#submitter-bond}

Herhangi bir hesap, o rollup'ta en az `min_submitter_bond` (varsayılan 1.000 QOR, 1.000.000.000 uqor) tutarında bir gönderici teminatı tuttuğunda batch gönderebilir.

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

Teminat sorgusu `amount`, `last_submit_time`, `unbond_after` ve `pending` alanlarını döndürür. `pending`, o göndericinin kesinleşmeyi bekleyen batch'lerinin sayısıdır: gönderilen her batch ile artar, biri kesinleştiğinde veya reddedildiğinde azalır. Bir göndericinin bekleyen batch sayısı 1.024'ten az olabilir. Bir teminat, sahibinin son batch'inden tam bir itiraz penceresi sonra `unbond-submitter` ile geri alınabilir.

### Batch kuralları {#batch-rules}

`consumed`, sıradaki batch'in başladığı gelen kutusu konumu, `head` ise son gönderi olsun (ikisi de `query rdk inbox` içindedir). `inbox_end = end` olan bir batch, şunların hepsi sağlandığında kabul edilir:

1. Gönderici en az `min_submitter_bond` tutar ve bekleyen batch sayısı 1.024'ten azdır.
2. `consumed < end <= head`. Bir batch en az bir kayıt tüketir.
3. `end - consumed <= 64`. Batch başına en fazla 64 gelen kutusu kaydı.
4. Zincir, `end` konumundaki biriktiriciyi hâlâ üretebilir: `end` baştır (head) veya `end` gönderisinin taahhüdü tutulmaktadır (`query rdk inbox <rollup> --inbox-end <end>` bir `range_data_hash` döndürür).
5. Başa varmadan duran, 64'ten az kayıtlı bir batch ya son 20 blokta yapılmış bir gönderiden hemen önce durur ya da bir sonraki gönderisi artık tutulmayan bir kontrol noktasında (`end` 64'ün katıdır) durur.
6. `data_hash`, `consumed` ile `end` arasındaki gelen kutusu aralığı taahhüdüdür, ilk batch boş defter kökünden başlar ve `state_root` 32 bayttır.

Bir istemci `end` değerini şöyle seçebilir:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Komut satırıyla gönderin:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Sahtekarlık ispatları {#fraud-proofs}

İtiraz penceresi sırasında herkes bir `qledger-v1` sahtekarlık ispatıyla `MsgChallengeBatch` gönderebilir: batch'in girdileri ve dokundukları hesapların bir Merkle tanığı. Zincir batch'i yeniden yürütür.

* Durum kökü veya para çekme kökü yanlışsa batch reddedilir ve onun üzerine kurulan her batch de reddedilir. Gelen kutusu geri sarılır.
* Göndericinin teminatının tamamı kesilir. **Yarısı yakılır, yarısı itiraz edene ödenir.** Yakılan yarı, burn modülünde `rollup_slash` kaynağı altında kaydedilir. Kendi yanlış batch'ine itiraz eden bir gönderici de teminatının yarısını kaybeder.
* Yanlış bir batch göstermeyen bir ispat 51 numaralı hatayla başarısız olur ve hiçbir şeyi değiştirmez.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

RDK 0.9.0, ispat baytlarını oluşturan `qledger-v1` yardımcılarına sahiptir.

İtiraz edilmeyen batch'ler, itiraz penceresi bittiğinde kendiliğinden kesinleşir. Para çekmeler yalnızca kesinleşmiş batch'lerden, rollup'ın para yatırma havuzundan ödenir, asla oluşturucunun emanetinden değil. Havuz para yatırmalar tutarken bir rollup durdurulamaz (hata 54).

### Saklama ve boşta kalma süreleri {#retention}

* Bir gönderi taahhüdü `posted_data_retention_blocks` kadar tutulur, sonra da onu hiçbir kesinleşmiş batch kapsamadığı sürece 4 saklama süresi daha tutulur.
* Bundan sonra, bir kontrol noktası dışında budanır: sırası 64'ün katı olan her gönderi, onu kesinleşmiş bir batch kapsayana veya rollup durdurulana kadar taahhüdünü korur.
* Durdurulmuş bir rollup, saklama süresinin ötesinde hiçbir taahhüt tutmaz.
* `posted_data_retention_blocks`, yürürlükteki en uzun itiraz penceresinden, saniyede bir blok sayılarak, en az o kadar olmalıdır (`default_challenge_window` ve durdurulmamış her rollup'ın penceresi). Onu daha kısa bırakan veya bir pencereyi onun üzerine çıkaran bir parametre güncellemesi `invalid params` ile reddedilir. Üst sınır 25.920.000'dir.
* v3.2.8 yükseltmesinde, bu pencerenin altındaki saklanmış bir değer ona yükseltilir. Varsayılan parametrelere dokunulmaz.
* **Test ağı değerleri**: `default_challenge_window` 3.600 saniyedir (çekirdek varsayılanı ve ana ağ tarzı değer 604.800 saniyedir, 7 gün). Gönderilen veri 648.000 blok, blob'lar ve kesinleşmiş batch'ler 432.000 blok tutulur.

Uzun bir boşta kalma döneminden sonra, 64'ten fazla tüketilmemiş gönderi ve budanmış taahhütlerle, bir gönderici sırayla yetişir: `consumed` bir katı değilse 64'ün bir sonraki katına kadar bir batch, sonra kontrol noktasından kontrol noktasına 64'lük tam batch'ler, sonra başa (veya kural 5 uyarınca tutulan herhangi bir konuma) bir son batch. Normal işleyişte hiçbir şey değişmez: başa veya yakın zamanlı bir gönderiden hemen öncesine kadar en fazla 64 kayıtlık batch gönderin.

## Özel rollup'lar {#private-rollups}

Gizlilik modu `encapsulated` ile oluşturulan bir `defi` (Groth16) rollup'ı, yalnızca üyelerine yönelik ML-KEM-1024 zarfı olan gönderileri kabul eder.

Bir zarf, veriyi taze bir anahtarla AES-256-GCM kullanarak bir kez şifreler ve bu anahtarı, zincirin KEM kayıt defterindeki her üyenin ML-KEM-1024 anahtarına kapsüller. Bir anahtar taahhüdü, tüm üyelerin aynı içeriği açtığından emin olur. Zincir, zarfın düzgün biçimlendiğini ve her kaydın üyenin güncel anahtarını adlandırdığını kontrol eder. Asla şifre çözmez.

* Oluşturucu üyeleri `MsgSetRollupMembers` ile belirler: en fazla 32, her biri kayıtlı bir ML-KEM-1024 anahtarıyla. Her değişiklik yeni bir üyelik dönemi (epoch) başlatır.
* Gönderiler, gönderen, zamanlama, boyutlar, üyeler, kökler ve para çekmeler (alıcı ve tutar) herkese açık kalır. Yalnızca gönderi içerikleri özeldir.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Groth16 girdileri ve para çekme kökü {#groth16}

BLS12-381 üzerinde bir Groth16 batch'i (`defi` profili, SNARK) genel girdilere karşı doğrulanır; her biri big-endian tamsayı olarak okunan ve skaler alan mertebesi modülünde indirgenen 32 baytlık bir değerdir:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Para çekmeler bağlanmadan önce gönderilen bir batch yalnızca ilk üç girdiye sahiptir. İspatlayıcının tanığı aynı indirgenmiş değerleri almalıdır.

Bir değerin zaten `r` altında olması gerekip gerekmediği, onu kimin belirlediğine bağlıdır:

| Değer | Kim belirler | r altında olmalı mı |
| --- | --- | --- |
| `state_root` | ispatlayıcı | evet |
| `prev_state_root` | zincir (en son mutabık `state_root`), bir rollup'ın ilk batch'i hariç | yalnızca ilk batch |
| `data_hash` | bağlandığında zincir (based bir rollup'ın gelen kutusu aralığı, gönderilen veri taahhüdü), aksi halde ispatlayıcı | yalnızca bağlı değilken |
| `withdrawals_root` | zincir (`MsgExecuteWithdrawal` işleminin yeniden kurduğu para çekme ağacı kökü) | hayır |

Bir istemci için bunun anlamı:

* Para çekme kökünü ağacın verdiği haliyle gönderin. Herhangi bir 32 bayt olabilir.
* Zincir `withdrawals_root mod r` değerini 32 big-endian bayt olarak saklar. Batch sorgusu bu saklanan değeri `withdrawals_root_reduced` true ile gösterir. Ağaç köklerinin yaklaşık yüzde 55'i `r` değerine eşit veya üzerindedir; bu yüzden saklanan değer çoğu zaman gönderilen baytlardan farklıdır.
* `MsgExecuteWithdrawal` istemci için değişmez: yaprak alanlarını ve kardeş özetlerini gönderin. Zincir kökü yeniden kurar ve `rebuilt_root mod r == stored_root mod r` olduğunda para çekmeyi kabul eder.
* Kökleri `r` değerinin bir katı kadar farklı olan aynı batch'in iki gönderimi aynı batch'tir. İlki mutabakata varır, ikincisi zaten var olan bir batch olarak reddedilir ve ağaçtaki her para çekme saklanan köke karşı ödenir.
* Mutabakattan sonra, saklanan kökü `tree_root` ile değil `tree_root mod r` ile karşılaştırın.

İndirgeme kuralından önceki optimistic, `qledger-v1` ve Groth16 batch'leri tam 32 baytı saklar ve karşılaştırır. Ağaç ve yaprak kodlaması için bkz. [ZK / STARK ve Para Çekme İşlemleri](/rollups/zk-stark-withdrawals).

## STARK mutabakatı duraklatıldı {#stark}

Doğrulayıcının desteklediği tek STARK ifadesi, iki 64 bitlik değer arasında yinelenen kareleme (iterated squaring) kanıtlar. Bu, bir rollup'ın para çekmelerini veya verisini kısıtlamaz. v3.2.8'den itibaren bir STARK anahtarı ayarlanamaz ve bir STARK rollup'ının batch'leri reddedilir (hata 52). Yönetişim böyle bir rollup'ı bir Groth16 anahtarına taşıyabilir. STARK mutabakatı, gerçek bir rollup ifadesiyle daha sonraki bir sürümde geri döner.

## Yeni mesajlar {#messages}

| Mesaj | Komut | Kim gönderir |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | Sıralayıcı veya based bir rollup'ta herkes |
| `MsgSetRollupSequencing` | yönetişim önerisi | Yönetişim |
| `MsgDepositToRollup` | `tx rdk deposit` | Bir `qledger-v1` rollup'ı için herkes |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Bir batch göndericisi |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Bir batch göndericisi |
| `MsgSetRollupMembers` | `tx rdk set-members` | Özel bir rollup'ın oluşturucusu |
| `MsgSubmitBatch` alanı `inbox_end` | `tx rdk submit-batch --inbox-end` | Based bir rollup'ın batch göndericisi |

`create-rollup` ayrıca `--sequencing`, `--execution-vm` ve `--privacy` alır. Uyumluluk matrisi artık şöyledir: sahtekarlık ispatlı optimistic `qledger-v1` ve based sıralama gerektirir, ZK mutabakatı ise SNARK demektir.

## Çalışan akış: oluştur, teminat ver, yatır, gönder, batch, itiraz et, kesinleştir, çek {#worked-flow}

:::note RDK ekibi tarafından 12 Kasım 2026'da test ağında çalıştırıldı
RDK ekibi bu akışı 12 Kasım 2026'da 06:22 ile 07:27 UTC arasında `qorechain-diana` test ağında uçtan uca çalıştırdı. Tamamen RDK 0.9.0 (TypeScript) ile, gaz başına 0,15 uqor RDK `auto` ücretiyle yürütüldü. Her adım kod 0 döndürdü. Bu sayfanın yazarı tarafından çalıştırılmadı.
:::

| Adım | Mesaj | Kullanılan gaz / istenen gaz |
| --- | --- | --- |
| 0 | Önce yeni hesabın kuantum sonrası anahtarını kendi işleminde kaydedin (sahiplik kanıtlı `MsgRegisterPQCKeyV2`). RDK istemcileri bunu otomatik yapar; bu olmadan ilk gerçek işlem pqc kod 8 ile reddedilir | 348.917 / 600.000 |
| 1 | `MsgCreateRollup`: profil `nft`, yürütme VM'i `qledger-v1`, sıralama `based`, stake 10.000 QOR (yüzde 1 yakıldı) | 301.260 / 349.199 |
| 2 | `MsgBondRollupSubmitter`, 1.000 QOR | 178.059 / 263.425 |
| 3 | `MsgDepositToRollup` iki kez (3 QOR ve 1 QOR; asgari 1 QOR) | her biri yaklaşık 240.000 / 350.000 |
| 4 | `MsgPostRollupData` iki kez (imzalı bir qledger transferi ve imzalı bir qledger para çekmesi), artı gönderilen veri ücreti (faturalanabilir bayt başına 10 uqor, en az 1 KiB faturalanır) | her biri yaklaşık 328.500 / 474.000 |
| 5 | `planQledgerBatch`, ardından 4 gelen kutusu kaydı için `MsgSubmitBatch` (`inbox_end` 4, `data_hash` gelen kutusu aralığı). Batch durumu `submitted`, teminat `pending` 1 | 712.379 / 1.011.431 |
| 6 | Sahtekarlık testi: bir gönderi daha, ardından kasıtlı olarak yanlış bir durum köküyle bir batch (233.990 / 341.742), sonra RDK'nın oluşturduğu sahtekarlık ispatıyla (4.136 bayt) `MsgChallengeBatch` | 450.186 / 644.417 |
| 7 | Batch 0, 3.600 saniyelik test ağı itiraz penceresinden sonra kendiliğinden kesinleşti | işlem yok |
| 8 | RDK'nın qledger Merkle ispatıyla 0,3 QOR'luk `MsgExecuteWithdrawal` | 192.768 / 284.220 |

Dikkate değer sonuçlar:

* **Adım 6**: yanlış batch reddedildi, göndericinin teminatı kesildi (yarısı yakıldı, yarısı itiraz edene ödendi), gelen kutusu geri sarıldı ve önceki iyi batch'e dokunulmadı.
* **Adım 8**: rollup'ın para yatırma havuzu 4,0 QOR'dan 3,7 QOR'a indi ve alıcının bakiyesi 0,3 QOR eksi ücret kadar arttı.

Komut satırında her adımın bir karşılığı vardır. Bu tek tek komutlar bu sayfa için çalıştırılmadı ve düğüm CLI tanımlarını izler:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

Bir rollup'ın itiraz penceresi `challenge_window_sec` alanındadır. Test ağında `default_challenge_window` bilerek 3.600 saniyedir; böylece rollup'lar bir saat içinde denenebilir; çekirdek varsayılanı ve ana ağ tarzı değer 604.800 saniyedir (7 gün). 5 ile 8 arasındaki adımlar defterden hesaplanan kökler ve ispatlar gerektirir; RDK 0.9.0 bunu yapan `qledger-v1` yardımcılarına sahiptir.

## Zinciri yayımlanmış TypeScript kitiyle okumak {#typescript}

Bu okumalar, v3.2.8'i 0.9.0'dan itibaren destekleyen `@qorechain/rdk` paketindeki adları kullanır. Yeni alanları aşağıda gösterildiği gibi doğrudan `curl` ile de okuyabilirsiniz.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Bu parça bu sayfa için çalıştırılmadı.

## Kontrol edilen rotalar {#checked-routes}

Bu salt okunur rotalar 12 Kasım 2026'da herkese açık test ağından istendi.

| Rota | Durum |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` ve `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200 veya hiç gönderilmemiş ya da budanmış bir sıra için 404 |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| bilinmeyen bir rollup için herhangi bir rota | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

Modül parametreleri artık `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` ve `finalized_batch_retention_blocks` alanlarını içerir. Batch görünümü `inbox_start`, `inbox_end` ve `withdrawals_root_reduced` alanlarını, rollup görünümü ise `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` ve `deposit_pool` alanlarını ekler. Gelen kutusu yanıtı `head_sequence`, `consumed_sequence` ve istenen `end` konumundaki taahhüt kullanılamadığında boş olan `range_data_hash` alanlarına sahiptir.

## Limitler ve hatalar {#limits}

| Limit veya hata | Değer veya anlamı |
| --- | --- |
| Gönderi boyutu | `max_posted_data_bytes`, varsayılan 131.072 bayt, tavan 1 MiB |
| Blok başına gönderilen bayt | `max_posted_data_bytes_per_block`, varsayılan 524.288 faturalanabilir bayt |
| Gönderi ücreti | Varsayılan olarak faturalanabilir bayt başına 10 uqor, en az 1 KiB faturalanır |
| Gönderilen veri saklama süresi | Varsayılan 648.000 blok, en fazla 25.920.000, saniye cinsinden en uzun itiraz penceresinin asla altında değil |
| `qledger-v1` gönderisi | Bir işlem, en fazla 6 KiB |
| Batch boyutu | 1 ile 64 gelen kutusu kaydı arası |
| Gönderici başına bekleyen batch | 1.024'ten az |
| Özel rollup üyeleri | en fazla 32, her biri kayıtlı bir ML-KEM-1024 anahtarıyla |
| Blok başına, rollup başına mutabık batch | `max_batches_per_block`, varsayılan 10 (hata 40) |
| Hata 41, 44, 47 | Özellik bu yükseklikte etkin değil (ağ v3.2.8'i uygulamadı) |
| Hata 42, 43 | Gönderi çok büyük veya bloğun gönderi limitine ulaşıldı |
| Hata 45 | Based sıralama bu rollup için kullanılamaz |
| Hata 46 | Batch rollup'ın gelen kutusuyla eşleşmiyor (yanlış `inbox_end` veya `data_hash`) |
| Hata 48 | Geçersiz yürütme veya gizlilik modu |
| Hata 49 | Gönderici teminatı gerekli |
| Hata 50 | Gönderici teminatı hâlâ kilitli |
| Hata 51 | Sahtekarlık ispatı batch'in geçersiz olduğunu göstermiyor |
| Hata 52 | STARK mutabakatı duraklatıldı |
| Hata 53 | Gönderi, rollup'ın üyelerine yönelik geçerli bir zarf değil |
| Hata 54 | Rollup hâlâ kullanıcı para yatırmaları tutuyor; bu yüzden durdurulamaz |

## İlgili sayfalar {#related}

* [Rollup'lara Genel Bakış](/rollups/overview)
* [Ön Ayar Profilleri](/rollups/preset-profiles)
* [Bir Rollup Dağıtma](/rollups/deploying-a-rollup)
* [Veri Kullanılabilirliği](/rollups/data-availability)
* [ZK / STARK ve Para Çekme İşlemleri](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
