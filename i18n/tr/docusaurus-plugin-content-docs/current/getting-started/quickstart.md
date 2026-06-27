---
slug: /getting-started/quickstart
title: Hızlı Başlangıç
sidebar_label: Hızlı Başlangıç
sidebar_position: 1
---

# Hızlı Başlangıç

Dakikalar içinde bir QoreChain düğümü çalıştırın. En hızlı kurulum için Docker Compose'u seçin veya tam kontrol için kaynaktan derleyin.

---

## Docker Compose (Önerilen)

Tüm servisleri önceden yapılandırılmış şekilde tam bir QoreChain ortamı çalıştırmanın en basit yolu.

```bash
git clone https://github.com/qorechain/qorechain-core.git
cd qorechain-core
docker compose up -d
```

Bu, aşağıdaki servisleri başlatır:

| Servis             | Portlar                                                                 | Açıklama                                       |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------------- |
| **qorechain-node** | `26657` (RPC), `1317` (REST), `9090` (gRPC), `8545` (EVM), `8899` (SVM) | Çok VM desteğine sahip tam blok zinciri düğümü |
| **ai-sidecar**     | `50051`                                                                 | QCAI anomali tespiti ve risk puanlama motoru   |
| **indexer**        | --                                                                      | Geçmiş sorgular için blok dizinleyici          |
| **postgres**       | `5432`                                                                  | Dizinleyici için veritabanı arka ucu           |
| **prometheus**     | `9091`                                                                  | Metrik toplama                                 |
| **grafana**        | `3001`                                                                  | İzleme panoları                                |

Tüm konteynerler sağlıklı duruma geldiğinde, düğümünüz ağ ile senkronize olmaya başlar.

---

## Kaynaktan Derleme

### Ön Koşullar

* CGO etkin **Go 1.26+**
* **Rust araç zinciri** (PQC kriptografisi ve SVM çalışma zamanı kütüphanelerini derlemek için)
* **Git**

### İkili Dosyayı Derleme

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

### Düğümü Başlatma

```bash
./qorechaind init my-node --chain-id qorechain-diana
```

Bu, `~/.qorechaind/` altında varsayılan yapılandırma ve veri dizinlerini oluşturur.

### Düğümü Çalıştırma

```bash
./qorechaind start
```

Düğüm varsayılan ayarlarla başlar. Uygun genesis ve eş yapılandırmasıyla canlı ağa katılmak için [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) bölümüne bakın.

:::note
Bu sayfadaki örnekler **`qorechain-diana`** test ağını (EVM zincir kimliği **9800**) hedefler. Ana ağ (**`qorechain-vladi`**, EVM zincir kimliği **9801**) 7 Haziran 2026'dan beri canlıdır ve kendine ait özel bir **Ana Ağa Bağlanma** sayfasına sahiptir.
:::

---

## Kurulumu Doğrulama

Düğümünüzün doğru çalıştığını teyit edin:

```bash
# Check the binary version
./qorechaind version
```

```bash
# Query the node status via RPC
curl localhost:26657/status
```

Başarılı bir yanıt, düğümün `moniker`, `network` (değeri `qorechain-diana` olmalı) ve geçerli blok yüksekliğini içerir.

---

## Sonraki Adımlar

* [Test Ağına Bağlanma](/getting-started/connecting-to-testnet) — Canlı Diana test ağına katılın
* [Cüzdan Kurulumu](/getting-started/wallet-setup) — Zincirle etkileşim için bir cüzdan yapılandırın
* [İlk İşleminiz](/getting-started/first-transaction) — İlk QOR transferinizi gönderin
* [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) — Canlı Vladi ana ağına katılın
* [SDK Genel Bakış](/sdk/overview) — Koddan QoreChain üzerinde uygulama geliştirin
