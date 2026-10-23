---
slug: /introduction/architecture-overview
title: Mimari Genel Bakış
sidebar_label: Mimari Genel Bakış
sidebar_position: 2
---

# Mimari Genel Bakış

QoreChain; üç ana süreçten — zincir düğümü, AI sidecar ve blok dizinleyici (indexer) — oluşan, bir Postgres veritabanıyla desteklenen ve Prometheus ile Grafana aracılığıyla izlenen modüler bir blok zinciri düğümüdür. Ana ağ (`qorechain-vladi`, EVM chain ID **9801**), **v3.2.4** sürümü üzerinde (3.742.566 yüksekliğinde, 23 Ekim 2026'da uygulandı) 7 Haziran 2026'dan beri yayında; paralel bir test ağı (`qorechain-diana`, EVM chain ID **9800**, 19 Ekim 2026'dan beri v3.2.4 çalıştırıyor) da çalışmaktadır. Zincir, Cosmos SDK v0.53 üzerine kuruludur. Aşağıdaki şema, üst düzey bileşen yerleşimini göstermektedir.

Aşağıdaki işlem yaşam döngüsü, gönderilen bir işlemin düğüm boyunca nasıl aktığını özetler — AnteHandler dekoratör zincirinden (güvenlik ve ücret kontrolleri) VM yürütmesine ve zincir üzerinde nihai uzlaşıya kadar:

```mermaid
flowchart LR
    Tx[Submitted transaction] --> Lane{Lane}
    Lane -->|Cosmos lane| Ante[AnteHandler chain]
    Lane -->|EVM lane| EAnte[EVM checks]
    EAnte --> Win[Registered PQC key +<br/>EVM authorisation window]
    Win --> Router
    Ante --> PQC[PQC signature verify]
    PQC --> AI[AI anomaly detection]
    AI --> Fair[FairBlock MEV protection]
    Fair --> Fee[Fee deduction & gas abstraction]
    Fee --> Router{VM router}
    Router -->|Solidity| EVM[EVM]
    Router -->|Wasm| Wasm[QoreChain Native]
    Router -->|BPF| SVM[SVM]
    EVM --> Commit[Block commit & indexing]
    Wasm --> Commit
    SVM --> Commit
```

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            QoreChain Node                                  │
│                                                                            │
│  ┌──────────────────── Virtual Machines ──────────────────────┐           │
│  │  ┌───────┐    ┌──────────┐    ┌───────┐                   │           │
│  │  │  EVM  │    │QoreChain │    │  SVM  │                   │           │
│  │  │(Sol.) │◄──►│ Native   │◄──►│ (BPF) │                   │           │
│  │  └───┬───┘    └────┬─────┘    └───┬───┘                   │           │
│  │      └─────────┬───┘──────────────┘                       │           │
│  │           x/crossvm (bridge)                               │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌────────────────────── Tokenomics ─────────────────────────┐           │
│  │  ┌──────┐   ┌───────┐   ┌───────────┐                    │           │
│  │  │x/burn│   │x/xqore│   │x/inflation│                    │           │
│  │  │12 src│   │lock/  │   │capped     │                    │           │
│  │  │37/30/│   │unlock │   │emission   │                    │           │
│  │  │20/10/│   │PvP    │   │emission   │                    │           │
│  │  │3     │   │       │   │590M cap   │                    │           │
│  │  └──────┘   └───────┘   └───────────┘                    │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────── IBC / Bridges ────────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │x/bridge  │  │x/babylon │  │x/abstract │  │x/gas     │ │           │
│  │  │37 QCB    │  │BTC re-   │  │ account   │  │abstract. │ │           │
│  │  │configs   │  │staking   │  │session key│  │multi-tok │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  QCB Bridge     Babylon IBC   ERC-4337-like   ibc/USDC    │           │
│  │  PQC-signed     BTC finality  social recov.   ibc/ATOM    │           │
│  │  36 ext chains  checkpoint    spending rules  fee convert  │           │
│  │  ┌──────────┐                                              │           │
│  │  │x/fair    │  Lane config (not enforced): PQC|MEV|AI|... │           │
│  │  │ block    │  tIBE encrypted mempool framework           │           │
│  │  └──────────┘                                              │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──── Rollup Development Kit ───────────────────────────────┐           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │           │
│  │  │ x/rdk    │  │Settlement│  │ DA Router │  │ Profiles │ │           │
│  │  │ 4 modes: │  │Optimistic│  │ Native    │  │ defi     │ │           │
│  │  │ opt/zk/  │  │ZK/Based/ │  │ Celestia* │  │ gaming   │ │           │
│  │  │ based/   │  │Sovereign │  │ Both      │  │ nft      │ │           │
│  │  │ sovereign│  │          │  │           │  │ social/  │ │           │
│  │  │          │  │          │  │           │  │ general  │ │           │
│  │  └────┬─────┘  └────┬─────┘  └───────────┘  └──────────┘ │           │
│  │  Bank escrow    Auto-finalize  SHAKE-256 commit AI-assisted │           │
│  │  Burn on create EndBlocker     Blob pruning    PRISM sugg. │           │
│  │  → x/multilayer (RegisterSidechain + AnchorState)          │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  ┌──────────────┐ ┌──────┐ ┌────────────┐ ┌─────┐                       │
│  │x/rlconsensus │ │ x/ai │ │x/reputation│ │x/qca│                       │
│  │  PRISM (RL)  │ │      │ │            │ │     │                       │
│  └──────┬───────┘ └──┬───┘ └────┬──────┘ └──┬──┘                       │
│   PPO MLP         AI Engine   Scoring    CPoS Pools                      │
│   Obs/Action      Fraud Det.  Decay      Bonding                         │
│   Circuit Brk     Fee Opt.    Sigmoid    Slashing                        │
│   Rollup Adv.     TEE/FL                 QDRW Gov                        │
│                                                                            │
│  ┌──────┐ ┌──────────┐                                                   │
│  │x/pqc │ │ x/multi  │                                                   │
│  └──┬───┘ └────┬─────┘                                                   │
│  Dilithium    Layer Router                                                │
│  ML-KEM       Sidechains                                                  │
│  Hybrid Sig   + Rollups                                                   │
│  SHAKE-256                                                                │
│                                                                            │
│  ┌──────┐ ┌───────┐                                                      │
│  │x/svm │ │x/cross│                                                      │
│  └──┬───┘ └───┬───┘                                                      │
│  BPF Exec   CrossVM Msg                                                   │
└────────┬──────┬───────────────────────────────────────┬───────────────────┘
         │      │                                       │
   ┌─────┴─────┐│                              ┌───────┴──────┐
   │libqorepqc ││                              │  Indexer     │
   │(Rust PQC) ││                              │  (Postgres)  │
   └───────────┘│                              └──────────────┘
   ┌───────────┐│  ┌──────────┐
   │libqoresvm ││  │AI Sidecar│
   │(Rust BPF) │└──│ (gRPC)   │
   └───────────┘   └──────────┘
```

## Düğüm Bileşenleri

QoreChain, her biri kendi Go modülüne ve ikili dosyasına sahip üç işbirlikçi süreç olarak çalışır:

| Bileşen            | Açıklama                                                                                                                                                                                                                                                                                                                            | Konum                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| **qorechain-node** | Çekirdek blok zinciri düğümü. QoreChain Uzlaşı Motorunu (Consensus Engine) çalıştırır, tüm özel modülleri yürütür, üç VM çalışma zamanını da yönetir ve RPC, REST, gRPC ile JSON-RPC uç noktalarını sunar.                                                                                                                            | `qorechain-core/`         |
| **ai-sidecar**     | QCAI Backend tarafından desteklenen gelişmiş AI çıkarımı (inference) yetenekleri sağlayan bir gRPC hizmeti. Sidecar; doğal dil analizi ve karmaşık örüntü tanıma gibi, zincir üzerindeki RL aracısının kapsamını aşan çıkarım isteklerini işler. Düğümle 50051 portu üzerinden gRPC ile iletişim kurar. | `qorechain-core/sidecar/` |
| **block-indexer**  | Düğümün RPC uç noktasından yeni bloklara ve işlemlere abone olan, olayları (events) ayrıştıran ve gezginler (explorers) ile API'ler tarafından hızlı sorgulama için yapılandırılmış verileri bir Postgres veritabanına yazan bir WebSocket dinleyicisidir.                                                                          | `qorechain-core/indexer/` |

## Portlar

| Port  | Protokol       | Hizmet                                                                            |
| ----- | -------------- | --------------------------------------------------------------------------------- |
| 26657 | HTTP/WebSocket | QoreChain Uzlaşı Motoru RPC (bloklar, işlemler, uzlaşı durumu)                     |
| 1317  | HTTP           | REST API (sorgu uç noktaları, işlem yayını)                                        |
| 9090  | gRPC           | gRPC sorgu ve işlem uç noktaları                                                   |
| 8545  | HTTP           | EVM JSON-RPC (`eth_`, `web3_`, `net_`, `txpool_` ad alanları)                     |
| 8546  | WebSocket      | EVM JSON-RPC (WebSocket abonelikleri)                                             |
| 8899  | HTTP           | SVM JSON-RPC (Solana uyumlu: `getAccountInfo`, `getBalance`, `getSlot`, vb.)       |
| 50051 | gRPC           | AI Sidecar (düğümden gelen çıkarım istekleri)                                      |
| 5432  | TCP            | Postgres (blok dizinleyici depolaması)                                            |
| 26660 | HTTP           | Düğüm Prometheus metrik uç noktası                                                 |
| 9091  | HTTP           | Prometheus sunucusu (Docker Compose yığınındaki ana makine portu)                  |
| 3001  | HTTP           | Grafana panoları (Docker Compose yığınındaki ana makine portu; kapsayıcı portu 3000) |

## Modül Haritası

QoreChain, işleve göre gruplandırılmış olarak **48 genesis modülü kaydeder; bunların 20'si QoreChain'e özgüdür**:

**Güvenlik**

* `x/pqc` — Kuantum sonrası kriptografi: Dilithium-5, ML-KEM-1024, hibrit secp256k1 (ECDSA) + ML-DSA-87, SHAKE-256, algoritma çevikliği

**AI ve Makine Öğrenmesi**

* `x/ai` — İşlem yönlendirme, anomali tespiti, dolandırıcılık tespiti, ücret optimizasyonu, TEE doğrulaması (attestation), federe öğrenme
* `x/reputation` — Zamansal sönümlemeli çok faktörlü doğrulayıcı itibar puanlaması
* `x/rlconsensus` — Zincir üzeri RL aracısı (PPO MLP), uzlaşı ayarı tasarımı, devre kesici, rollup danışmanlığı — PRISM optimizasyon katmanı (canlı ağlarda yalnızca gözlem: hiçbir politika yüklü değil)

**Uzlaşı**

* `x/qca` — Üçlü Havuz Bileşik PoS (RPoS/DPoS/PoS) tasarımı, özel bağ eğrisi (bonding curve), kademeli kesinti (slashing), QDRW yönetişimi — uygulanmış durumda ancak blok üretimine, ödüllere, kesintiye (slashing) veya yönetişim sayımına henüz bağlanmamıştır

**Sanal Makineler**

* `x/vm` — VM yönlendirme ve yaşam döngüsü yönetimi
* `x/svm` — SVM çalışma zamanı: BPF dağıtımı/yürütmesi, kira toplama, Solana uyumlu RPC
* `x/crossvm` — VM'ler arası iletişim: EVM-QoreChain Native precompile + SVM asenkron olayları

**Tokenomik ve Likidite**

* `x/burn` — 12 yakım kaynağı (v3.2.4'ten itibaren 13), EndBlocker ücret dağıtımı (37/30/20/10/3 bölüşümü)
* `x/xqore` — Yönetişimle güçlendirilmiş stake tasarımı: kilitle/aç, kademeli çıkış cezaları, PvP yeniden tabanlama (rebase) (yalnızca muhasebe; kilitleme ve açma işlemleri canlı ağlara henüz bağlanmamıştır)
* `x/inflation` — Sınırlı emisyon: sabit bir katı kümülatif üst sınıra (590,000,000 QOR) ulaşılana kadar her dönemde (epoch) basılan sabit bir miktar
* `x/amm` — Zincir üzeri likidite / otomatik piyasa yapıcı

**Köprüler ve Birlikte Çalışabilirlik**

* `x/bridge` — Her büyük zincir türü genelinde 37 zincir yapılandırması (36 harici zincir artı IBC üzerinden Injective), PQC imzalı doğrulamalar (attestations), devre kesiciler (tüm yapılandırmalar `pending` durumunda; canlı değil)
* `x/babylon` — Babylon Protocol aracılığıyla BTC yeniden stake etme (restaking), dönem (epoch) kontrol noktaları (tasarım aşaması; hiçbir işlem etkinleştirilmemiş)
* `x/multilayer` — Yan zincir/ödeme zinciri/rollup katman yönetimi, durum sabitleme (state anchoring)

**Yönetişim ve Lisanslama Uzantıları**

* `x/abstractaccount` — Akıllı hesaplar: çoklu imza (multisig), sosyal kurtarma, oturum anahtarları, harcama kuralları (her iki ağda da kapalı: `enabled = false`)
* `x/fairblock` — MEV koruması: eşikli IBE şifreli mempool çerçevesi (her iki ağda da devre dışı)
* `x/gasabstraction` — Çoklu token gaz ödemesi tasarımı: ibc/USDC, ibc/ATOM ücret dönüşümü (henüz açık bir IBC kanalı yok, bu yüzden ücretler QOR ile ödenir)
* `x/license` — Zincir lisanslama

**Rollup'lar**

* `x/rdk` — Rollup Development Kit: 4 uzlaşı modu (optimistic, zk, based, sovereign), hazır profiller, yerel DA, banka emaneti (escrow)

## AnteHandler Zinciri

Her işlem, yürütmeden önce bir dekoratör zincirinden geçer; herhangi bir dekoratör işlemi reddedebilir. İki zincir vardır.

**Cosmos şeridi (lane)** (sırayla): `RejectMessages` (bu şeritte `MsgEthereumTx` yok) → `AuthzLimiter` (authz içinde EVM veya vesting oluşturma mesajı yok, v3.2.3'ten itibaren de kuantum sonrası anahtar yönetimi mesajı yok) → `SetUpContext` → mempool ve multisig derinliği korumaları → QoreChain Native simülasyon gazı, işlem sayacı, gaz kaydı ve sözleşme dekoratörleri → `CircuitBreaker` → uzantı seçeneği kontrolü → `ValidateBasic` → `TxTimeout` → `Memo` → doğrulayıcı lisans geçidi (`MsgCreateValidator`) → `PQCVerify` → `PQCHybridVerify` → `PQCReplayGuard` → `AIAnomaly` (gönderen başına hız sınırını içerir) → `FairBlock` → `SVMComputeBudget` → `SVMDeductFee` → `MinGasPrice` → `ConsumeTxSize` → `GasAbstraction` → `DeductFee` → `SetPubKey` → `ValidateSigCount` → `SigGasConsume` → `SigVerify` → `IncrementSequence` → yakım işlem sayacı → IBC gereksiz aktarım kontrolü → talep edilen gaz takibi.

**EVM şeridi (lane)** (Ethereum uzantı seçeneğini taşıyan işlemler): `CircuitBreaker` → EVM mono dekoratörü (imza, nonce, ücret ve bakiye kontrolleri) → `EVMWindowDecorator` (kayıtlı kuantum sonrası anahtar ve canlı bir yetkilendirme penceresi; bkz. [EVM yetkilendirme penceresi](/getting-started/first-transaction#evm-window)).

Cosmos şeridindeki anahtar dekoratörler:

1. **PQCVerify** — Modül `x/pqc`. PQC işaretli işlemlerdeki Dilithium-5 imzalarını doğrular.
2. **PQCHybridVerify** — Modül `x/pqc`. İkili secp256k1 (ECDSA) + ML-DSA-87 hibrit imzalarını doğrular.
3. **AIAnomaly** — Modül `x/ai`. İzolasyon ormanı anomali tespiti ve risk puanlaması çalıştırır ve gönderen başına işlem sınırını uygular.
4. **FairBlock** — Modül `x/fairblock`. MEV koruması için tIBE şifreli işlemleri işler (canlı ağlarda devre dışı).
5. **SVMComputeBudget** — Modül `x/svm`. SVM programları için hesaplama birimlerini doğrular ve tahsis eder.
6. **SVMDeductFee** — Modül `x/svm`. SVM'ye özgü yürütme ücretlerini düşer.
7. **GasAbstraction** — Modül `x/gasabstraction`. Düşmeden önce yerel olmayan ücret tokenlarını dönüştürür (ücretler şu anda QOR ile ödenir).

## Docker Compose Yığını

Tam geliştirme yığını, paylaşılan bir köprü ağında (`qorechain-net`) altı hizmetli bir Docker Compose dağıtımı olarak çalışır:

| Hizmet           | İmaj                       | Amaç                                                |
| ---------------- | -------------------------- | --------------------------------------------------- |
| `qorechain-node` | `qorechain-core:latest` (Dockerfile'dan yerel olarak derlenir; yayımlanmış bir düğüm imajı yoktur) | Tüm modüller, VM'ler ve RPC uç noktalarıyla zincir düğümü |
| `ai-sidecar`     | `ghcr.io/qorechain/ai-sidecar:latest` | AI çıkarım hizmeti (gRPC + QCAI Backend)            |
| `block-indexer`  | `ghcr.io/qorechain/block-indexer:latest` | Blok/işlem dizinleyici (WebSocket + Postgres)       |
| `postgres`       | `postgres:16-alpine`       | Blok dizinleyici için veritabanı                    |
| `prometheus`     | `prom/prometheus:v3.10.0`  | Metrik toplama ve depolama                          |
| `grafana`        | `grafana/grafana:12.4.1`   | İzleme panoları ve uyarı verme                      |

Tam yığını başlatın:

```bash
docker compose up -d
```

İlk başlatmadan önce `.env.example` dosyasını `.env` olarak, `.env.sidecar.example` dosyasını `.env.sidecar` olarak kopyalayın ve `GRAFANA_PASSWORD` değerini ayarlayın (Compose, bu değer olmadan başlamayı reddeder).

Tüm kalıcı veriler adlandırılmış Docker birimlerinde saklanır: `node-data`, `postgres-data`, `prometheus-data` ve `grafana-data`.

## İlgili

* [Çok Katmanlı Mimari](/architecture/multilayer-architecture) — yan zincir kaydı ve durum sabitleme.
* [Uzlaşı Mekanizması](/architecture/consensus-mechanism) — blok üretimi, kesinlik ve kesinti (slashing).
* [PRISM Uzlaşı Motoru](/architecture/prism-consensus-engine) — AI güdümlü parametre optimizasyonu.
* [Kuantum Sonrası Güvenlik](/architecture/post-quantum-security) — yığın genelinde Dilithium-5 imzaları.
