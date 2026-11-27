---
slug: /build-before-qday/workshop-4
title: "Workshop 4: Geliştiriciler için rollup'lar, IBC ve QoreX"
sidebar_label: "Workshop 4"
sidebar_position: 5
date: 2026-11-27
---

# Workshop 4: Geliştiriciler için rollup'lar, IBC ve QoreX

Workshop 4 uygulamanın altına iner. Birincisi, QoreChain üzerinde mutabakata ulaşan bir **rollup** çalıştırırsınız: onu oluşturur, ondan para çeker, ne yaptığını kanıtlar, ardından bilerek hile yapar ve hilenin yakalanmasını izlersiniz. İkincisi, IBC üzerinden **Cosmos Hub testnet'ine QOR gönderip geri getirirsiniz**. Üçüncüsü, bir dApp geliştirirken **QoreX cüzdanının** size neler sunduğunu görürsünüz.

Aşağıdaki her komut ne yaptığını ve ne görmeniz gerektiğini söyler. Kod herkese açıktır: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), `workshop-4` klasörü. Buradaki her şey yalnızca testnet'lerde çalışır. Test token'larının değeri yoktur.

**Ne kadar sürer:** adımlar yaklaşık 45 dakika. Rollup'ın ayrıca bir saatlik bir itiraz penceresi vardır; bu sürede beklersiniz. Üç bölüm birbirinden bağımsızdır: 1. Bölümde beklerken 2. veya 3. Bölümü yapabilirsiniz.

## Ne geliştiriyoruz {#what-we-built}

| Bölüm | Uygulama | Neyi gösterir |
| --- | --- | --- |
| 1 | **Bir rollup** (Node.js, `@qorechain/rdk`) | Çapası ML-DSA-87 ile imzalanan batch'ler, Merkle kanıtıyla ödenen bir para çekme, herkesin kontrol edebileceği bir mutabakat makbuzu, bir watchtower'ın kanıtladığı bir sahtekârlık ve kesilen bir teminat. |
| 2 | **IBC ile gidiş dönüş** (Node.js, `@qorechain/qoresign`, cosmjs) | QOR, QoreChain relayer'ı QORel tarafından taşınarak Cosmos Hub testnet'ine gider ve geri döner. |
| 3 | **Geliştiriciler için QoreX** (bir kılavuz, yeni kod yok) | Bir dApp'in konuştuğu sağlayıcılar, entegrasyon paketleri, Geliştirici modu, istek günlüğü ve işlem denetleyici. |

Bunların ardındaki yenilikler:

- **Mutabakatı post-kuantum imzalanan bir rollup.** Oluşturucu, her dürüst batch'in durum kökünü ML-DSA-87 (NIST FIPS 204) ile imzalar ve zincir onu saklar.
- **Zincirin kendisinin kontrol ettiği sahtekârlık kanıtları.** `qledger-v1` defteriyle QoreChain, itiraz edilen bir batch'i yeniden yürütür. Kimin haklı olduğunu söylemek için kimseye güvenmek gerekmez.
- **QoreChain'den alınan sıralama.** Tabanlı sıralamada (based sequencing) rollup işlemleri QoreChain üzerindeki bir gelen kutusuna gönderilir; bu yüzden operatör onların sırasını değiştiremez ve gönderilmiş olanı dışarıda bırakamaz.
- **QoreChain tarafında hibrit imzalı IBC.** QoreChain'den çıkan transfer hem secp256k1 hem de ML-DSA-87 ile imzalanır.
- **Yaptığını gösteren bir cüzdan.** QoreX her sitenin ne istediğini kaydeder ve zincirin neyi sakladığını incelemenizi sağlar.

## Bu kılavuzda kullanılan kelimeler {#words}

| Kelime | Sade anlamı |
| --- | --- |
| Rollup | Kendi işlemlerini ana zincirin dışında çalıştıran ve ana zincire zaman zaman kısa bir özet gönderen bir sistem |
| Batch | Böyle bir özet: rollup'ın yeni durumu ve istediği para çekmeler |
| Durum kökü | Rollup'taki tüm bakiyelerin kısa bir parmak izi |
| Optimistic rollup | Batch'ler hemen kabul edilir ve yalnızca itiraz penceresi boyunca kimse yanlış olduklarını kanıtlamazsa kesinleşir |
| İtiraz penceresi | Herkesin bir batch'in yanlış olduğunu kanıtlamak için sahip olduğu süre. Testnet'te bir saattir |
| Teminat | Operatörün kilitlediği ve yalan söylerse kaybettiği para |
| Watchtower | Rollup'ın işlemlerini yeniden oynatan ve yanlış bir batch'i bildiren bir hesap |
| `qledger-v1` | Zincirin kendisinin yeniden yürütmeyi bildiği basit bir defter. İçindeki hesaplar ML-DSA-44 ile imza atar |
| Tabanlı sıralama (based sequencing) | Rollup işlemlerinin sırası operatörden değil, QoreChain üzerindeki gelen kutusundan gelir |
| Çapa | Batch'in durum kökü; rollup oluşturucusu tarafından ML-DSA-87 ile imzalanır ve zincirde saklanır |
| Merkle kanıtı | Tüm kümeyi göndermeden, bir öğenin daha büyük bir kümenin içinde olduğunu kanıtlayan birkaç hash |
| IBC | Cosmos zincirlerinin bir saklayıcı olmadan birbirleri arasında token taşıma yöntemi: her zincir diğerinin bir light client'ını çalıştırır ve kanıtları kontrol eder |
| Kanal | İki zincir arasındaki bir lane |
| Voucher | QOR'unuz QoreChain üzerinde kilitli dururken diğer zincirin oluşturduğu token |
| Escrow | Gönderilen QOR'un, voucher geri gelene kadar beklediği QoreChain hesabı |
| Relayer | İki zincir arasında paketleri ve kanıtları taşıyan bir program |

:::caution Yalnızca tek kullanımlık testnet hesapları
Betikler sizin için yeni hesaplar oluşturur. Böyle kalsın. Gerçek para tutan bir hesabın gizli kelimelerini veya anahtarını asla bir dosyaya ya da bir komuta koymayın.
:::

## Başlamadan önce {#prerequisites}

Bir terminale, **Node.js 20 veya üstüne** ve **Git**'e ihtiyacınız var: bkz. [Başlamadan önce](/build-before-qday/prerequisites). 3. Bölüm ayrıca **pnpm** ve QoreX cüzdanını ister. Node.js'i kontrol edin:

```bash
node -v
```

`v20` ya da daha yüksek bir değer yazdırmalıdır. Örnek kodu alın:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-4
```

İlk satır örnekleri `build-before-qday` adlı bir klasöre indirir. İkinci satır `workshop-4` klasörüne geçer.

Her bölüm farklı miktarda test QOR'u gerektirir:

| Bölüm | Neye ihtiyacınız var | Nereden gelir |
| --- | --- | --- |
| 1, operatör hesabı | Yaklaşık 12.010 test QOR'u: 10.000 rollup stake'i, sidechain yuvası için 1.000, 1.000 gönderici teminatı ve yatırımlar ile ücretler için birkaç tane | Faucet günde 100 QOR verir, bu yetmez. [build.qorechain.io](https://build.qorechain.io) kanallarında fest ekibinden daha büyük bir testnet tahsisi isteyin |
| 1, watchtower hesabı | Ücretler için birkaç test QOR'u | [Faucet](/dashboard/faucet) |
| 2 | Yaklaşık 2 test QOR'u ve biraz test ATOM'u | [Faucet](/dashboard/faucet). Betik, ATOM'u Cosmos Hub testnet faucet'inden ister |
| 3 | QoreX testnet hesabınızda biraz test QOR'u | [Faucet](/dashboard/faucet) |

:::tip Büyük bir tahsisiniz yok mu? 1. Bölümü yine de takip edebilirsiniz
`node rollup.mjs rollups` için hesap gerekmez ve aşağıdaki adımlar her komutun ne yaptığını gösterir.
:::

## 1. Bölüm: QoreChain üzerinde mutabakata ulaşan bir rollup {#part-1}

Kod: [workshop-4/01-rollup](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/01-rollup). Paket: `@qorechain/rdk`, Rollup Development Kit.

Küçük bir optimistic rollup'ın tüm yaşamını adım adım yaşayacaksınız: onu oluşturmak, bir stake kilitlemek, operatör teminatını yatırmak, para yatırmak, bir batch göndermek, beklemek, para çekmek, bir makbuz oluşturmak, hile yapmak ve hileyi yakalamak. Nasıl çalıştıklarını görmek için [Rollup'lar](/rollups/overview) sayfasına bakın.

### 1. Adım: kurun {#r1}

```bash
cd 01-rollup
npm install
node rollup.mjs help
```

| Bölüm | Ne yapar |
| --- | --- |
| `cd 01-rollup` | Rollup uygulamasının klasörüne geçer. |
| `npm install` | Uygulamanın kullandığı paketleri indirir. Sürümler `package.json` ve `package-lock.json` ile sabitlenmiştir. |
| `node rollup.mjs help` | Betiği çalıştırır ve tüm komutları listeler. |

**Ne görmelisiniz:** komut listesi: `init`, `rollups`, `prepare`, `status`, `withdraw`, `bond`, `receipt`, `cheat`, `watchtower`.

### 2. Adım: testnet'teki rollup'lara bakın {#r2}

```bash
node rollup.mjs rollups
```

Zinciri okur. Hesap gerekmez.

**Ne görmelisiniz:** rollup sayısını ve zincirin bugün istediği stake ile teminatı (bu kılavuz yazılırken 10.000 QOR ve 1.000 QOR) içeren bir ilk satır, ardından her rollup için bir satır: kimliği, etkin olup olmadığı, nasıl mutabakata ulaştığı (`optimistic` veya `zk`), VM türü ve oluşturulduğu blok.

**Neden:** ödeyeceğiniz tutarların betikten değil zincirden geldiğini gösterir.

### 3. Adım: iki hesap oluşturun {#r3}

```bash
node rollup.mjs init
```

İki hesap oluşturur: **operatör** ve **watchtower**. Gizli kelimeleri yalnızca sizin okuyabileceğiniz `~/.config/qday-w4/operator.json` ve `watcher.json` dosyalarına kaydedilir ve asla yazdırılmaz. Operatör dosyası ayrıca iki kullanıcının, Ana ve Ben'in, rollup anahtarları için iki rastgele seed tutar. Dosyaları başka bir yerde tutmak için `QDAY_DIR` ortam değişkenini ayarlayın.

**Ne görmelisiniz:** iki `qor1...` adresi. [Başlamadan önce](#prerequisites) bölümündeki gibi ikisine de fon yükleyin.

**Neden iki hesap:** yanlış bir batch'i bildiren, onu yayımlayan olmamalıdır.

### 4. Adım: rollup'ı oluşturun ve 0 numaralı batch'i gönderin {#r4}

```bash
node rollup.mjs prepare
```

Bu tek komut tüm kurulumu çalıştırır. Daha önce yaptıklarını `~/.config/qday-w4/rollup-state.json` içinde hatırlar; bu yüzden bir şey yarıda kalırsa yeniden çalıştırabilirsiniz.

| Ne gönderir | Ne yapar |
| --- | --- |
| `createRollup` | `qledger-v1` yürütmesi ve tabanlı sıralama ile rollup'ınızı oluşturur ve stake'i kilitler. |
| `bondRollupSubmitter` | 1.000 QOR'luk teminatı kilitler. |
| İki yatırım | Ana için 3 QOR ve Ben için 1 QOR rollup'a geçer. |
| Üç rollup işlemi | Ana, Ben'e 0,5 QOR öder; Ana 0,3 QOR çeker; Ben 0,2 QOR çeker. Her biri gönderenin ML-DSA-44 anahtarıyla imzalanır ve QoreChain üzerindeki gelen kutusuna gönderilir. |
| `submitBatch` | Betik gelen kutusunu geri okur, yeni durum kökünü ve para çekme kökünü elde etmek için onu yeniden yürütür ve 0 numaralı batch'i gönderir. RDK onun çapasını ML-DSA-87 ile imzalar. |

**Ne görmelisiniz:** her işlem için blok ve bir gezgin bağlantısı içeren bir `ok` satırı. Ardından rollup'ınızın durumu; 0 numaralı batch `submitted` olarak görünür.

### 5. Adım: bir saat bekleyin, sonra kontrol edin {#r5}

```bash
node rollup.mjs status
```

**Ne görmelisiniz:** rollup, operatörün stake'i, para çekme havuzu, teminat ve her batch. Bir saatlik itiraz penceresinden sonra 0 numaralı batch `finalized` olarak görünür.

**Neden bekleniyor:** optimistic bir rollup güvenlidir, çünkü para çıkmadan önce bir batch'in yanlış olduğunu kanıtlamak için zaman vardır.

### 6. Adım: QoreChain'e para çekin {#r6}

```bash
node rollup.mjs withdraw 0
node rollup.mjs withdraw 1
```

`0` numaralı para çekme Ana'nın 0,3 QOR'u, `1` numaralı para çekme ise Ben'in 0,2 QOR'udur. Bu demoda ikisi de operatör hesabına ödenir. Betik, para çekmenin 0 numaralı batch'in para çekme kökünde bulunduğuna dair bir Merkle kanıtı oluşturur ve zincir ödeme yapmadan önce kanıtı sakladığı köke göre kontrol eder. Ardından betik aynı para çekmeyi ikinci kez gönderir.

**Ne görmelisiniz:** kanıttaki hash sayısı, bir `ok` satırı, alıcının önceki ve sonraki bakiyesi (ücreti aynı hesap ödedi) ve ardından `REFUSED` olarak işaretlenen ikinci deneme. Bir para çekme yalnızca bir kez ödenir.

0 numaralı batch henüz kesinleşmediyse komut durur ve para çekmelerin yalnızca itiraz penceresinden sonra ödendiğini söyler.

### 7. Adım: bir mutabakat makbuzu {#r7}

```bash
node rollup.mjs receipt 0
```

0 numaralı batch'i anlatan küçük bir JSON dosyası oluşturur ve onu anahtarlarınızın yanına kaydeder. Herkes onu kontrol edebilir: kontrol her şeyi QoreChain'den yeniden okur ve dosyaya güvenmez.

| Kontrol | Neyi kanıtlar |
| --- | --- |
| `rollupLayerBinding` | Rollup, makbuzun adını verdiği katmana aittir |
| `batchStateRoot` | Zincirdeki batch tam olarak bu durum kökünü taşır |
| `anchorOnChain` | Zincirde, makbuzun her alanını içeren bir çapa vardır |
| `creatorAuthority` | İmza anahtarı makbuzdan değil zincirden okundu |
| `pqcSignature` | Çapa üzerindeki ML-DSA-87 imzası geçerlidir |
| `chainBinding` | Makbuz bu zincire aittir ve başka bir yerden alınmış bir kopya değildir |

**Ne görmelisiniz:** altı kontrolün her birinin yanında bir onay işaretiyle `VALID`. Ardından betik durum kökünün bir onaltılık basamağını değiştirir ve yeniden kontrol eder: `NOT VALID`.

**Neden işe yarar:** bir borsa, bir denetçi veya başka bir sistem, dosyayı gönderene güvenmeden bir rollup'ın durumunu doğrulayabilir.

### 8. Adım: dürüst olmayan bir operatör {#r8}

```bash
node rollup.mjs cheat
```

Ben, rollup'ın içinde Ana'ya 0,1 QOR öder; ardından operatör 1 numaralı batch'i durum kökünün bir biti bilerek ters çevrilmiş halde gönderir.

**Ne görmelisiniz:** iki `ok` satırı. İkincisi, batch'in **yanlış bir durum köküyle** yayımlandığını söyler. Zincir şimdilik onu kabul eder: yanlış olduğunun kanıtlanması için bir saat vardır ve operatörün teminatı risk altındadır.

### 9. Adım: watchtower onu yakalar {#r9}

```bash
node rollup.mjs watchtower
```

Bu komut operatör hesabını değil, watchtower hesabını kullanır.

| Adım | Ne olur |
| --- | --- |
| 1 | 1 numaralı batch'i zincirden okur. |
| 2 | Gelen kutusunun tam olarak 1 numaralı batch'in kullandığı kısmını okur ve 0 numaralı batch'ten sonraki durumdan başlayarak yeniden oynatır. Bu, dürüst kökü verir. |
| 3 | Sahtekârlık kanıtını oluşturur ve bilgisayarınızda kontrol eder. |
| 4 | `challengeBatch` gönderir. Zincir batch'i kendisi yeniden yürütür, onu reddeder ve teminatı keser: yarısı yakılır, yarısı watchtower'a gider. |

**Ne görmelisiniz:** yanlış kök ve dürüst kök, yerel kontrolün sonucu, itiraz için bir `ok` satırı, reddedildi olarak işaretlenen batch ve watchtower'ın önceki ve sonraki bakiyesi.

:::note Biri sizden hızlı davranabilir
Testnet'te zaten bağımsız watchtower'lar var. Sahtekârlığı önce onlardan biri kanıtlarsa (bu tek bir blok sürebilir), betiğiniz batch'in zaten reddedildiğini söyler ve yalnızca yerel kontrolü çalıştırır. Her iki durumda da operatör teminatı kaybeder.
:::

Yeniden hile yapmak için önce teminatı tekrar doldurun:

```bash
node rollup.mjs bond
```

### Kod nasıl düzenlenmiş {#r-code}

Her şey tek bir dosyadadır: `rollup.mjs`. Her komut, yukarıdaki adımların sırasıyla `cmds` nesnesindeki bir fonksiyondur. `connect()` fonksiyonu bir hesap dosyasını, her QoreChain işlemini iki anahtarla, secp256k1 ve ML-DSA-87 ile imzalayan bir RDK işlem istemcisine dönüştürür.

## 2. Bölüm: Cosmos Hub'a QOR gönderme ve geri getirme {#part-2}

Kod: [workshop-4/02-ibc](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/02-ibc). Paketler: `@qorechain/qoresign` ve cosmjs. Ağlar: QoreChain testnet'i `qorechain-diana` ve Cosmos Hub testnet'i `provider`.

Bu uygulama QoreChain testnet'inden Cosmos Hub testnet'ine 0,5 QOR gönderir ve geri getirir. QoreChain relayer'ı [QORel](https://github.com/qorechain/QORel), paketleri iki zincir arasında taşır. Bu kılavuz yazılırken QoreChain testnet'inde on IBC kanalı vardı: Cosmos Hub, Osmosis, Injective, Akash, Celestia, Coreum, dYdX, Fetch, Allora ve ixo. IBC yalnızca testnet'te çalışır: mainnet'te etkin değildir.

Nasıl çalışır:

1. Tek bir anahtar size iki adres verir: QoreChain'de `qor1...` ve Hub'da `cosmos1...`.
2. **Gidiş:** transfer QoreChain'de iki anahtarla imzalanır ve zincir ikisini de kontrol eder. QORel paketi ve bir kanıtı Hub'a taşır. Hub'daki QoreChain light client'ı kanıtı kontrol eder ve QOR için bir voucher oluşturur.
3. **Dönüş:** Hub'da transfer, Hub'ın olağan yöntemiyle imzalanır. QoreChain'deki Hub light client'ı kanıtı kontrol eder. Voucher yakılır ve asıl QOR serbest bırakılır.

:::info Bilmeye değer iki sınır
QoreChain'in `channel-0` kanalı, Hub'ın `channel-600` kanalıdır. Voucher'ın Hub'daki adı, `ibc/` ve ardından `transfer/channel-600/uqor` değerinin SHA-256'sıdır. Her testnet QOR kanalında, güvenlik freni olarak, 24 saatte QOR arzının en fazla %1'i karşıya geçebilir.
:::

### 1. Adım: kurun {#i1}

```bash
cd ../02-ibc
npm install
node ibc.mjs help
```

İlk satır `01-rollup` klasöründen `02-ibc` klasörüne geçer. `workshop-4` klasöründeyseniz `cd 02-ibc` kullanın.

**Ne görmelisiniz:** komut listesi: `init`, `channels`, `status`, `register`, `hub-faucet`, `send`, `back`.

### 2. Adım: tek anahtar, iki zincir {#i2}

```bash
node ibc.mjs init
```

Bir hesap oluşturur ve gizli kelimelerini yalnızca sizin okuyabileceğiniz `~/.config/qday-w4/traveler.json` dosyasına kaydeder. Asla yazdırılmazlar. `QDAY_DIR` klasörü değiştirir.

**Ne görmelisiniz:** hesabın QoreChain adresi ve Cosmos Hub adresi. `qor1...` adresini [faucet](/dashboard/faucet)'e yapıştırın.

### 3. Adım: kanalları listeleyin {#i3}

```bash
node ibc.mjs channels
```

QoreChain testnet'indeki her IBC kanalını ve diğer uçtaki zinciri okur. Hesap gerekmez.

**Ne görmelisiniz:** her kanal için durumunu (`OPEN`), diğer zincirin kimliğini ve kanalın o taraftaki adını içeren bir satır. Son satır, mainnet'te henüz kanal olmadığını gösterir.

### 4. Adım: post-kuantum anahtarınızı kaydedin ve ATOM alın {#i4}

```bash
node ibc.mjs register
node ibc.mjs hub-faucet
node ibc.mjs status
```

| Komut | Ne yapar |
| --- | --- |
| `register` | ML-DSA-87 açık anahtarınızı bir kez zincire koyar. Sonraki QoreChain işlemleri ona göre kontrol edilir. |
| `hub-faucet` | Cosmos Hub testnet'inin herkese açık faucet'inden ATOM ister; dönüş yolundaki ücretleri bu öder. |
| `status` | QoreChain'deki QOR'unuzu, Hub'daki voucher'ı ve ATOM'u ve anahtarınızın zincirde olup olmadığını gösterir. |

**Ne görmelisiniz:** `status` sonrasında QOR bakiyeniz, `ML-DSA-87 key on chain: yes` ve biraz ATOM. Bir bakiye hâlâ sıfırsa bir dakika bekleyin ve `status` komutunu yeniden çalıştırın.

### 5. Adım: gidiş {#i5}

```bash
node ibc.mjs send 0.5
```

`channel-0` üzerinde bir token transfer mesajı (`MsgTransfer`, ICS-20 standardı) oluşturur, onu QoreSign ile iki anahtarla imzalar, ardından voucher Hub'da görünene kadar bekler.

**Ne görmelisiniz:** numaralı üç satır: paket numarası, blok ve gezgin bağlantısıyla imzalanmış işlem; paketi taşıyan QORel; ve kaç saniye sürdüğü bilgisiyle voucher'ın Hub'a varışı. Her yön genellikle birkaç saniye sürer. Sizdeki süre farklı olabilir.

### 6. Adım: ve dönüş {#i6}

```bash
node ibc.mjs back
```

Her voucher'ı `channel-600` üzerinden eve gönderir. Hub işlemi, Hub'ın güncel gas fiyatıyla normal bir cosmjs istemcisi kullanılarak imzalanır. Ardından betik QOR'un geri dönmesini bekler.

**Ne görmelisiniz:** Hub işlemi, ardından Hub'da yakılan voucher ve QoreChain'de serbest bırakılan sade QOR.

### Kod nasıl düzenlenmiş {#i-code}

Her şey tek bir dosyadadır: `ibc.mjs`. `sendTx()`, QoreSign ile hibrit bir QoreChain işlemi oluşturur ve imzalar. `hubWallet()`, aynı gizli kelimeleri `cosmos` önekli bir Hub cüzdanına dönüştürür. Her komut `cmds` nesnesindeki bir fonksiyondur.

## 3. Bölüm: Geliştiriciler için QoreX {#part-3}

Kılavuz: [workshop-4/03-qorex-developer-mode](https://github.com/qorechain/build-before-qday/tree/main/workshop-4/03-qorex-developer-mode). Yeni kod yok: Workshop 1'deki [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) uygulamasını kullanırsınız.

Aşağıdaki adımlar Chrome veya Firefox'ta **QoreX 0.4.5 tarayıcı uzantısını** kullanır. Safari uzantısı daha eski bir sürümdür. QoreX uygulamasında (1.2.5, iPhone ve Android) da Geliştirici modu vardır: [Geliştirici Modu](/qorex/developer-mode) sayfasında anlatıldığı gibi **Ayarlar** bölümünden açarsınız.

### Bir dApp neyle konuşur {#providers}

QoreX web sayfalarına üç sağlayıcı ekler:

| Sağlayıcı | Ne için | Standart |
| --- | --- | --- |
| `window.ethereum` | EVM dApp'leri. QoreX kendini EIP-6963 ile de duyurur | EIP-1193 |
| `window.qorex.native` | secp256k1 ve ML-DSA-87 ile imzalanan yerel QoreChain işlemleri | QoreX API |
| `window.qorex.svm` | SVM lane'i | QoreX API |

npm üzerindeki şu paketler QoreX'i yaygın araçlara bağlar:

| Paket | Kullanım |
| --- | --- |
| `@qorechain/qorex-rainbowkit` | RainbowKit içinde QoreX (EVM) |
| `@qorechain/qorex-cosmos-kit`, `@qorechain/qorex-interchain-kit` | Cosmos Kit ve Interchain Kit içinde QoreX |
| `@qorechain/qorex-types` | `window.qorex` için TypeScript tipleri |
| `@qorechain/qorex-wallet-mock`, `@qorechain/qorex-synpress` | dApp'inizi otomatik testlerde QoreX'e karşı test edin |
| `@qorechain/sdk`, `@qorechain/wallet-adapter` | Hibrit imzalı işlemler oluşturun ve gönderin |

Ayrıntılar için [Bir dApp'i QoreX ile Entegre Edin](/qorex/dapp-integration) sayfasına bakın.

### 1. Adım: Geliştirici modunu açın {#x1}

Uzantının açılır penceresinde, ana ekranın altındaki sürüm numarasına **yedi kez** tıklayın. İçinde **Geliştirici araçları**, **Testnet'e geç (diana)** ve **Geliştirici modunu kapat** bulunan bir **Geliştirici modu** bölümü belirir. **Testnet'e geç (diana)** düğmesine tıklayın.

**Neden önce:** istek günlüğü istekleri yalnızca Geliştirici modu açıkken kaydeder.

### 2. Adım: Hybrid Inspector'ı başlatın {#x2}

`workshop-4` klasöründen:

```bash
cd ../workshop-1/03-hybrid-inspector
pnpm install
pnpm dev
```

İlk satır Workshop 1 uygulamasına geçer, `pnpm install` onun paketlerini indirir ve `pnpm dev` yerel bir web sayfası başlatır. Yazdırdığı adresi (genellikle `http://localhost:5173`) açın ve QoreX'i bağlayın.

### 3. Adım: cüzdan kilitliyken bir istek gönderin {#x3}

QoreX'te **Kilitle** düğmesine tıklayın. Inspector'da `Workshop 4` memo'suyla kendi adresinize 0,001 QOR gönderin.

**Ne görmelisiniz:** QoreX parolanızı ister ve istekte bulunan **sitenin adını söyler**. Kilidi açtıktan sonra onay ekranı tutarı, alıcıyı ve memo'yu gösterir. Onaylayın: işlem iki anahtarla imzalanır. Bunun yerine pencereyi kapatırsanız istek reddedilir.

**Neden önemli:** parolanız olmadan hiçbir şey imzalanmaz ve hangi sitenin istediğini bilirsiniz.

### 4. Adım: Geliştirici araçlarını açın {#x4}

**Geliştirici araçları** bölümünü açın ve **İşlemler** altına bakın:

- **İstek günlüğü:** her sitenin QoreX'ten ne istediği; yöntem, parametreler ve verdiğiniz yanıtla birlikte.
- **İşlem denetleyici:** **Hash or request** alanına bir işlem hash'i veya bir istek yapıştırın ve **Denetle** düğmesine tıklayın. Bir hash ile, cüzdandan çıkmadan zincirin neyi kaydettiğini görürsünüz.

Toplamda 17 geliştirici aracı vardır. [Geliştirici Modu](/qorex/developer-mode) her birini açıklar.

### QoreX 1.2.5'teki diğer yenilikler {#also-new}

- **Elle açılan bir EVM penceresi varsayılan olarak yalnızca QOR transferlerine izin verir.** Daha geniş bir kapsam seçebilirsiniz ve neye izin verdiğinizi görürsünüz.
- **PQC multisig:** üyelerinin her biri post-kuantum imza atan ortak bir hesap.
- **Anahtar rotasyonu ve onarımı:** adresinizi değiştirmeden zincirdeki ML-DSA-87 anahtarınızı değiştirin veya onarın.

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Ne yapmalı |
| --- | --- |
| `no operator account yet` | Önce `node rollup.mjs init` çalıştırın. |
| `no rollup yet` | Önce `node rollup.mjs prepare` çalıştırın. |
| `createRollup` yetersiz fon nedeniyle reddediliyor | Operatör hesabına yaklaşık 12.010 test QOR'u gerekir. Bkz. [Başlamadan önce](#prerequisites). |
| `prepare` yarıda duruyor | Yeniden çalıştırın. Daha önce yaptığı yerden devam eder. |
| `withdrawals are paid only after the challenge window` | 0 numaralı batch henüz kesinleşmedi. `node rollup.mjs status` ile kontrol edin ve daha sonra yeniden deneyin. |
| `nothing to challenge` | Önce `node rollup.mjs cheat` çalıştırın. |
| `watchtower` komutunu çalıştırdığınızda batch zaten reddedilmiş | Testnet'teki başka bir watchtower daha hızlı davrandı. Bu normaldir. |
| `no account "traveler"` | Önce `node ibc.mjs init` çalıştırın. |
| `does not exist on chain yet` | O adres için faucet'ten test QOR'u alın, sonra yeniden deneyin. |
| `nothing after 120 s` | Relayer meşgul olabilir. Bir dakika bekleyin ve `node ibc.mjs status` çalıştırın. |
| İstek günlüğü boş | dApp'i kullanmadan önce Geliştirici modunu açın. |

## Daha fazla bilgi {#learn-more}

- Fest, seviyeleri ve parkurları: [build.qorechain.io](https://build.qorechain.io).
- [Rollup'lar](/rollups/overview) ve RDK. RDK; TypeScript, Python, Rust, Go ve Java için, `qorollup` adlı bir komut satırı aracı ve bir proje şablonuyla birlikte sunulur.
- Yeni batch'leri geldikçe izlemek için RDK'daki `watchBatches` fonksiyonuna bakın: gün boyu çalışan bir watchtower için bir başlangıç noktasıdır.
- [QORel](https://github.com/qorechain/QORel) açık kaynaktır. `brew install qorechain/tap/qorel` ile kurun veya `ghcr.io/qorechain/qorel` konteynerini kullanın. Onu yalnızca kendi anahtarlarınızla çalıştırın.
- 2. Bölümde başka bir kanalı denemek için `ibc.mjs` içinde `CHANNEL`, `HUB_CHANNEL` ve diğer zincirin uç noktalarını değiştirin. `node ibc.mjs channels` onları listeler.
- QoreX'te [Geliştirici Modu](/qorex/developer-mode) ve [dApp entegrasyonu](/qorex/dapp-integration).
- Rollup'ınızın gönderdiği verileri gizli tutması gerekiyorsa [Workshop 3, QoreSeal](/build-before-qday/workshop-3#part-1).
