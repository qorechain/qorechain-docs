---
slug: /qorel/whats-new
title: QORel'de Yenilikler
sidebar_label: Yenilikler
sidebar_position: 2
---

# QORel'de Yenilikler

Bu sayfa, her QORel sürümünün neler eklediğini listeler. Hermes'ten veya önceki bir QORel sürümünden geçip geçmemeye karar veren operatörler içindir ve yalnızca bir sürümün ne yaptığını, kontrol edilebilir davranış olarak belirtir. QORel, Hermes 1.13.3 (Informal Systems, Apache-2.0) tabanına dayanır; aşağıdaki her değişiklik bu tabanın üzerindedir. Listelenmeyen her şey Hermes'teki gibi davranır.

## 0.1.0 {#v0-1-0}

İlk sürüm. Yalnızca testnet. Dosyalar [sürüm sayfasındadır](https://github.com/qorechain/QORel/releases).

### Yenilikler {#innovations}

- **QoreChain için hibrit kuantum sonrası imzalama.** Bir zincirde `signing = 'qorechain-hybrid'` ayarlayın; QORel her işlemin tek kritik uzantı seçeneği olarak ML-DSA-87 imzasını (`/qorechain.pqc.v1.PQCHybridSignature`) ekler, ardından son gövdeyi secp256k1 ile imzalar. Kuantum sonrası anahtarın imzaladığı mesaj, her iki QoreChain ağının da doğruladığı sürüm 2 sign bytes'tır. Statik `extension_options` bu modla birleştirilemez ve varsa yapılandırma reddedilir.
- **Standart imzalama değişmedi.** `signing = 'standard'` (varsayılan) ile işlem biçimi, Cosmos Hub, Osmosis ve diğer tüm Cosmos SDK zincirleri için bayt bayt Hermes'inkidir.
- **`qorel-signer` crate'i.** Kuantum sonrası ilkel (`PqSigner`, `MlDsa87Signer` ile), zincirin kuralları (`SignBytesFramer`) ve relayer'ın çağırdığı uzantı imzalayıcısı (`TxExtensionSigner`) ayrı arayüzlerdir. Gas simülasyonu ve toplu boyutlandırma aynı yoldan geçer; böylece ek yaklaşık 4,7 KB ve doğrulama gas'ı her zaman hesaba katılır.
- **`qorel keys add` kuantum sonrası anahtarı türetir.** Hibrit bir zincirde ML-DSA-87 anahtarını aynı mnemonic'ten ve hesaptan QoreChain cüzdan türetmesiyle türetir ve yalnızca 32 baytlık seed'ini, anahtarın yanında `<key name>.pqc` olarak saklar. Hiçbir gizli veri yazdırılmaz.
- **`qorel keys register-pqc`.** `MsgRegisterPQCKeyV2` işlemini bir kez gönderir; v3.2.3 veya üzerindeki ağlarda bir sahiplik kanıtıyla. İdempotenttir (aynı anahtar zaten kayıtlıysa hiçbir şey gönderilmez) ve hesabın zaten farklı bir anahtarı varsa göndermeyi reddeder. `--no-proof` yalnızca v3.2.3'ten eski ağlar için vardır.
- **`qorel keys pqc-status`.** Anahtarın kayıtlı olup olmadığını, yerel anahtarla eşleşip eşleşmediğini, sahipliğin kanıtlanıp kanıtlanmadığını, zincirin hangi sign bytes'ı doğruladığını ve `ready_to_relay` değerini yazdırır.
- **Göndermeden önce güvenlik kontrolü.** Hibrit bir zincire her işlemden önce QORel, anahtarın yüklü, kayıtlı ve yerel anahtarla aynı olduğunu ve sign-bytes sürümünün bilindiğini kontrol eder. `pqc.sign_bytes = 'auto'` ile sürümü zincirin uygulanmış yükseltme kayıtlarından okur, her dakika yeniden okur ve `pqc` codespace'i code 21 ile yapılan her reddin ardından yeniden okur. Herhangi bir hatada hiçbir şey gönderilmez ve ücret harcanmaz; `health-check` nedeni bildirir.
- **Ücret pazarı gas fiyatı.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'`, tabanı gas başına 0,1 uqor olan QoreChain temel ücretini okur.
- **ibc-go v10 zincirlerinde kötü davranış tespiti.** ibc-go v10 başlığı artık `update_client` olaylarına dahil etmediği için QORel başlığı `MsgUpdateClient` işleminden okur. Standart Hermes 1.13 bu zincirlerde tespiti kapatır.
- **Paket çalışanları hız sınırlamasından sağ çıkar.** Bir röle veya temizleme denemesi başarısız olduğu sürece çalışanlar ayakta kalır ve her temizleme aralığında yeniden dener. Hermes'te bir çalışan, son temizleme turu başarısız olsa bile yeni IBC olayı olmadan `clear_interval x 5` blok geçince de durur; bu yüzden o anda bekleyen bir paket, kanaldaki bir sonraki pakete veya bir yeniden başlatmaya kadar beklerdi.
- **Yalnızca sahibin okuyabildiği anahtar dosyaları.** Hermes anahtar dosyalarını varsayılan umask ile yazıyordu. QORel `<key name>.json` ve `<key name>.pqc` dosyalarını 0600 kipiyle yazar. Eski bir Hermes ile eklenen anahtarlar eski kiplerini korur; bunları `ls -l` ile kontrol edin.
- **Bir `qorel` ikili dosyası.** Hermes komut kümesi artı kuantum sonrası anahtar komutlarıyla tek bir ikili dosya, `qorel`. Aynı CLI'ye sahip bir `hermes` ikili dosyası da kaynak ağacından derlenir.
- **Menşei doğrulanabilir sürümler.** Linux ve macOS için tarball'lar, sertleştirilmiş bir systemd birimi içeren `.deb` ve `.rpm` paketleri, bir Homebrew formülü ve cosign ile imzalanmış çok mimarili bir container imajı. Sürüm dosyaları `SHA256SUMS` ve derleme doğrulamalarıyla birlikte gelir. Bkz. [Kurulum](/qorel/install).
- **Yerel bir devnet testi.** Depo, yerelde bir QoreChain düğümü ve bir ibc-go v10 test zinciri derleyen ve her iki yönde ICS-20 uçtan uca testi çalıştıran `scripts/qorel-devnet/` dizinini içerir: anahtar kaydı, istemci, bağlantı ve kanal oluşturma, her iki yönde transferler, aktarılan bir token'ın geri döndürülmesi, zaman aşımına uğrayan bir paketin temizlenip iade edilmesi ve QORel'in kendisinin gönderdiği bir transfer.

### Testnet'te kanıtlandı {#proven-on-the-testnet}

- QoreChain testnet'inin ilk IBC kanalı olan `qorechain-diana` üzerindeki `transfer/channel-0` ile Cosmos Hub genel testnet'indeki (zincir kimliği `provider`) `channel-600`, QORel tarafından röleleniyor. İstemciler `07-tendermint-0` ve `07-tendermint-466`, bağlantılar `connection-0` ve `connection-315`'tir.
- Transferler her iki yönde (1 QOR çıkış, 0,1 ATOM giriş, 0,4 QOR geri dönüş) ve 1 saniyelik zaman aşımına sahip bir transferin zaman aşımı mesajıyla otomatik iadesi test edildi. `qorechain-diana` üzerindeki 13 relayer işleminin tümü başarılı oldu.
- Kanalın okuma tarafı görünümü [Varlıkları Köprüleme](/user-guide/bridging-assets#ibc-test-channel) sayfasındadır.

### Bu sürümde yok {#not-in-this-release}

- IBC v2 röleleme. QORel'de henüz uygulanmadı ve bir sonraki aşamadır.
- Ethereum (Eureka) röleleme. Başlatılmadı.
- Mainnet röleleme. Henüz açık bir mainnet IBC kanalı yok.
- Bir Windows derlemesi.
- crates.io üzerinde `qorel-signer` crate'i. Yayımlama engellenmiş durumda; crate depoda `crates/qorel-signer` altında bulunuyor, bu yüzden bir git bağımlılığı kullanın.

## Yükseltme {#upgrading}

Daha önceki bir QORel sürümü yoktur. Hermes 1.13'ten QORel 0.1.0'a geçiş:

1. `qorel`'i `hermes`'in yanına veya yerine kurun ([Kurulum](/qorel/install)).
2. `config.toml` dosyanızı koruyun. `signing` ayarı olmayan zincirler standart imzalamada kalır ve eskisi gibi davranır.
3. Servis dosyalarınızdaki komutu `hermes` yerine `qorel` olarak değiştirin. Anahtar deposu klasörü (varsayılan olarak `~/.hermes/keys`) değişmez; container imajının verisini `/home/nonroot/.hermes` altına bağlamasının nedeni budur.
4. Anahtar dosyası kiplerini `ls -l` ile kontrol edin; yeni anahtarlar 0600'dür, eskiler kiplerini korur.

Depodaki `UPGRADING.md` dosyasında yer alan üst akım Hermes yükseltme notları, Hermes'in 1.6'dan eski bir sürümünden gelen herkes için geçerlidir.
