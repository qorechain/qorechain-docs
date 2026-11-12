---
slug: /developer-guide/node-operators-v328
title: "Düğüm Operatörleri: v3.2.8 Kontrol Listesi"
sidebar_label: Düğüm Operatörleri v3.2.8
sidebar_position: 11
---

# Düğüm Operatörleri: v3.2.8 Kontrol Listesi

**v3.2.8** sürümü, 12 Kasım 2026'dan beri (yükseklik 9,929,500) `qorechain-diana` test ağında çalışmaktadır. Ana ağ `qorechain-vladi` 12 Kasım 2026'dan beri v3.2.7 çalıştırır (yükseklik 4,164,600, yönetişim önerisi 16) ve v3.2.8'i uygulamamıştır; bu nedenle bu sayfadaki hiçbir şey bugün bir ana ağ düğümü için geçerli değildir.

Bu sayfa, bir düğüm operatörünün v3.2.8 için neyi kontrol edip değiştireceğinin kısa listesidir: paketteki paylaşımlı kütüphaneler, sözleşme çalışma zamanı ayarları, yeni `app.toml` varsayılanları, yeni bir REST rotası ve hâlâ v3.2.7 üzerinde olan bir düğümü yükseltme adımları. Tam düğüm kılavuzu için bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node).

**Neden önemli.** v3.2.8, akıllı sözleşmeleri yeni bir sözleşme çalışma zamanı kütüphanesi üzerinde çalıştırır ve bir sözleşme çağrısının kullandığı belleği ve kod yüklemeyi ücretlendirir. Eski kütüphane klasörünü koruyan veya çok az sözleşme belleğiyle çalışan bir düğüm başlamaz ya da geride kalır. Kontrol listesinin geri kalanı küçük yapılandırma işleridir.

## 1. `lib/` klasörünün tamamını kopyalayın {#lib-folder}

Sürüm paketi, `qorechaind` dosyasını ve dört paylaşımlı kütüphane içeren bir `lib/` klasörünü barındırır:

| Kütüphane | Rol |
| --- | --- |
| `libqorepqc.so` | Kuantum sonrası imza doğrulaması |
| `libqoresvm.so` | SVM çalışma zamanı |
| `libwasmvm.x86_64.so` | Yukarı akış sözleşme çalışma zamanı kütüphanesi |
| `libwasmvmqore_v1.x86_64.so` | v3.2.8 ile yeni: QoreChain sözleşme çalışma zamanı kütüphanesi |

Tek tek dosyaları değil, **klasörün tamamını** kopyalayın. Bir Dockerfile'daki `COPY lib/ ...` satırı veya çıplak sunucudaki `cp -r lib/* ...` komutu, sonraki bir sürüm kütüphane eklediğinde de çalışmaya devam eder; adlandırılmış dosyalardan oluşan bir liste çalışmaz.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Yükleyiciyi kopyaladığınız klasöre yönlendirin (zaten kullandığınız `LD_LIBRARY_PATH` veya `ld.so.conf.d` girdisi) ve yeniden başlatın. Yukarıdaki komutlar bir kalıptır; kendi kurulumunuzun yollarını kullanın.

## 2. Sözleşme bellek önbelleği: en az 256 MiB {#memory-cache}

Sözleşme çalışma zamanı, derlenmiş sözleşmeleri bellekte tutar. `app.toml` içinde `[wasm]` bölümündeki `memory_cache_size` ayarı **256 MiB veya daha fazla** olmalıdır:

```toml
[wasm]
memory_cache_size = 256
```

256'nın altındaki bir değer, düğüm başlarken 256'ya yükseltilir ve düğüm bir uyarı kaydeder. Küçük makinelerde ek bellek için plan yapın.

## 3. Sözleşme dizini artık `<home>/wasm` {#wasm-directory}

Derlenmiş sözleşme kodu artık `<home>/wasm` içinde bulunur; burada `<home>`, düğümü başlattığınız dizindir (`--home`). Sözleşme kodu hâlâ eski konumda olan bir düğüm onu kullanmaya devam eder ve bir uyarı kaydeder. Klasörü uygun bir zamanda taşıyabilirsiniz; önce düğümü durdurun.

## 4. Yeni `app.toml` varsayılanları {#app-toml-defaults}

v3.2.8 ile başlatılan bir düğüm bu varsayılanları yazar. Mevcut `app.toml` dosyaları **yeniden yazılmaz**; bu yüzden yükseltilmiş bir düğüm, siz değiştirene kadar eski değerlerini korur.

| Ayar | Yeni varsayılan | Ne yapar |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Bu düğümde simüle edilen işlemler için gaz limiti. Cüzdanlar ve SDK'lar göndermeden önce simüle eder; yüksek limit büyük sözleşme çağrılarının simüle edilmesini sağlar |
| JSON-RPC `api` ad alanları | `eth,net,web3` | `txpool` ad alanı varsayılan olarak sunulmaz, çünkü düğümün bekleyen işlemlerini yayınlar. `txpool` değerini yalnızca ihtiyacınız varsa kendiniz ekleyin |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Sorgu gaz limiti {#query-gas-limit}

Sözleşme sorguları, `app.toml` dosyasının `[wasm]` bölümünün denetlediği düğüm-yerel bir gaz limiti altında çalışır. Zincir ekibi, doğrulayıcılarda bunu `0` (limitsiz) yapmanızı önerir:

```toml
[wasm]
query_gas_limit = 0
```

Bu ayar yalnızca kendi düğümünüzün sözleşme sorgularına verdiği yanıtı değiştirir; hiçbir bloğun içermesi gerekeni değiştirmez. Bu, zincir ekibinin doğrulayıcılar için önerisidir; herkese açık sorgu sunan bir düğüm sonlu bir limiti tercih edebilir.

## 6. Yeni rota: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8, SVM modülü parametreleri için salt okunur bir rota ekler. v3.2.8 üzerindeki düğümler (test ağı) bunu sunar; sürümün uygulanmadığı ana ağda HTTP `501` yanıtı verir.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

12 Kasım 2026'da test ağından gelen yanıt:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Alan | Anlamı |
| --- | --- |
| `enabled` | SVM işlem hattının açık olup olmadığı. Yükseltmeden beri test ağında `false`; bu yüzden yönetişim yeniden açana kadar SVM yazmaları reddedilir |
| `max_program_size`, `max_account_data_size` | Bayt cinsinden boyut limitleri (her biri 10,485,760) |
| `compute_budget_max` | Bir işlemin isteyebileceği en büyük hesaplama bütçesi (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Depolama fiyatı girdileri |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Slot numaralandırma kayması, varsayılan imza şeması ve programlar arası çağrı derinliği limiti |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Bir SVM hesabının tutabileceği yerel QOR üzerindeki limitler, uqor cinsinden |

Bir SVM gönderme düğmesi göstermeden önce `enabled` değerini okuyun; bkz. [SVM Geliştirme](/developer-guide/svm-development). `GET /qorechain/svm/v1/cluster_info` rotası ayrı bir rotadır ve küme kimliğini döndürür.

## 7. Manifesti kontrol edin {#manifest}

Manifest, hangi ikili dosyanın kurulacağı konusunda gerçeğin kaynağıdır:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

12 Kasım 2026'da `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` ve ikili dosya olarak `qorechaind-v3.2.8-b3-linux-amd64.tar.gz` yanıtını verdi. `binary.url` değerine güvenmeden önce `version` değerinin `minCompatible` değerine eşit olduğunu kontrol edin ve arşivi aynı dosyadaki `sha256` ile doğrulayın. Ana ağ manifesti `https://download.qore.host/mainnet/latest.json` adresindedir ve bir ana ağ yükseltmesi duyurulana kadar v3.2.6'yı belirtir.

## 8. Hâlâ v3.2.7 üzerinde olan bir düğümü yükseltin {#upgrade-from-v327}

Test ağı yükseltme yüksekliği geçti; bu yüzden hâlâ v3.2.7 üzerinde olan bir düğüm 9,929,500 yüksekliğinde `UPGRADE "v3.2.8" NEEDED` ile durur. Durumu korunur ve yeniden eşitlenmesi gerekmez.

1. Manifestte adı geçen arşivi indirin ve SHA-256 değerini doğrulayın.
2. Düğümü durdurun.
3. `qorechaind` dosyasını değiştirin ve `lib/` klasörünün tamamını kopyalayın ([adım 1](#lib-folder)).
4. `[wasm] memory_cache_size` değerini kontrol edin ([adım 2](#memory-cache)); `simulation_gas_limit`, JSON-RPC ad alanları ve `query_gas_limit` hakkında karar verin ([adım 4 ve 5](#app-toml-defaults)).
5. Düğümü başlatın ve günlüğü izleyin. Bunları değiştirmediyseniz sözleşme dizini veya bellek önbelleği hakkında bir uyarı beklenir.
6. Zinciri takip ettiğini doğrulayın:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Test ağına yeni katılan bir düğüm doğrudan v3.2.8 ikili dosyasıyla başlar; durum eşitleme ve eşler için bkz. [Test Ağına Bağlanma](/getting-started/connecting-to-testnet), yükseltme geçmişi için [Düğüm Çalıştırma](/developer-guide/running-a-node#upgrades).

## Sınırlar ve hatalar

| Ne görürsünüz | Anlamı | Ne yapmalı |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` ve düğüm 9,929,500 yüksekliğinde durur | Düğüm hâlâ v3.2.7 ikili dosyasında | Bölüm 8 |
| Eksik bir paylaşımlı kütüphane hakkında başlatma hatası | `lib/` bütün olarak kopyalanmadı veya yükleyici ona işaret etmiyor | Bölüm 1 |
| `memory_cache_size` değerinin yükseltildiğine dair uyarı | Yapılandırılan değer 256 MiB'ın altında | 256 veya daha fazlasını ayarlayın |
| Sözleşme dizini hakkında uyarı | Sözleşme kodu hâlâ eski konumda | Uygun bir zamanda `<home>/wasm` içine taşıyın |
| `/qorechain/svm/v1/params` rotasından `501` | Düğüm v3.2.8 üzerinde değil (ana ağ v3.2.7 çalıştırır) | Ana ağda beklenen durum |

## İlgili sayfalar

* [Düğüm Çalıştırma](/developer-guide/running-a-node), [v3.2.8'de sözleşme çalışma zamanı](/developer-guide/running-a-node#v328-node) dahil
* [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator)
* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet)
* [REST ve gRPC uç noktaları](/api-reference/rest-grpc-endpoints)
