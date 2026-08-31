---
slug: /developer-guide/exchange-integration
title: Borsa ve Entegratör Rehberi
sidebar_label: Borsa Entegrasyonu
sidebar_position: 11
---

# Borsa ve Entegratör Rehberi

Bir borsanın, saklama kuruluşunun (custodian) veya ödeme entegratörünün QOR'u listelemek ve para yatırma/çekme işlemlerini gerçekleştirmek için ihtiyaç duyacağı her şey: bir arayüz seçmek, yatırmaları güvenli şekilde tespit etmek ve çekim işlemlerini imzalamak.

:::note
Bu rehber **`qorechain-vladi`** mainnet'ini (zincir sürümü **v3.1.95**) hedefler. Önce tüm akışı **`qorechain-diana`** testnet'inde prova edin — her iki ağın uç noktaları da [Ağlar](/appendix/networks#public-endpoints) sayfasındadır. Kendi tam düğümünüzü (full node) çalıştırıyorsanız, onu güncel zincir sürümünde tutun — güncel olmayan bir düğüm daha yeni işlem türlerini çözemez ve senkronizasyonu durur.
:::

## Entegrasyon yolu seçme {#choosing-a-path}

QoreChain, üç arayüz üzerinden sunulan **tek bir birleşik native-QOR bakiyesine** sahip tek bir zincirdir. **Aynı özel anahtar aynı fonları kontrol eder** — bir Cosmos (`qor1...`), bir EVM (`0x...`) ve bir SVM (base58) adresi altında — yığınınıza uyan arayüzü seçin.

| | **A) Cosmos (native)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adres | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aynı anahtar) |
| Ondalık basamak (native QOR) | **6** (`uqor`) | **18** (wei tarzı) | **9** (lamport; 1 uqor = 1.000 lamport) |
| Araçlar | Cosmos SDK / CosmJS | **Standart Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Çekim imzalama | **Hibrit PQC gerekli** (ML-DSA-87 + secp256k1) | **Standart secp256k1 / EIP-155 — PQC yok** | Cosmos tx veya düğüm üzerinde gönderim ile |
| Not / etiket desteği | **Evet** (paylaşılan adres + memo) | Hayır (kullanıcı başına bir adres) | Hayır (kullanıcı başına bir adres) |
| Yatırım tespiti | `MsgSend` olaylarını tarama | `eth_getBlockByNumber` ile blokları tarama | `getBalance` / `getSignaturesForAddress` |
| En uygun olduğu durum | Cosmos-native platformlar | **Mevcut EVM entegrasyonu olan platformlar** | Solana araç zinciri kullanan platformlar |

**Öneri:** EVM zincirlerini zaten destekliyorsanız, **Yol B (EVM)** en az efor gerektiren entegrasyondur — standart Ethereum araçları kullanılır ve **çekimler kuantum-sonrası imzalama gerektirmez** (EVM ante yolu bundan muaftır). Yol A (Cosmos), memo tabanlı paylaşılan yatırım adresleriyle native rotadır. Yol C (SVM), kağıt üzerinde tam bir native-QOR arayüzüdür, ancak **işlem hattı şu anda ağ genelinde devre dışıdır** (bkz. [Yol C](#path-c-svm)) — yeniden açılana kadar Yol A veya Yol B kullanın.

Üç arayüz de **birbirini dışlamaz** — aynı anahtarın `0x`, `qor1` veya SVM formuna gönderilen fonlar aynı bakiyedir.

## Düğümünüzü çalıştırma {#node}

Üretim entegrasyonları, yatırmaları üçüncü taraf bir uç nokta yerine **kendi senkronize düğümlerine** karşı doğrulamalıdır. [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) sayfasını takip edin — burada önceden derlenmiş ikili paket (SHA-256 sağlama toplamlarıyla), genesis, herkese açık eşler (peers), işlem ücreti tabanı (`0.1uqor`) ve yayımlanan zincir verisi anlık görüntüsü (snapshot) üzerinden hızlı önyükleme anlatılır. Doğrulama yapmayan (non-validating) tam bir düğüm çalıştırmak için lisans gerekmez.

QoreChain **anlık kesinliğe** (instant finality) sahip olduğundan (yeniden düzenleme/reorg yoktur), **1 onay kesindir**; 1-2 blok beklemek rahat bir operasyonel marj sağlar.

## Yol A — Cosmos (native) {#path-a-cosmos}

Temel REST URL'si: `https://api.qore.host` (veya kendi düğümünüzde `http://localhost:1317`).

### Yatırmaları izleme

```bash
# en son yükseklik
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# bir yükseklikteki tüm işlemler (yatırım tarama)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# bir adrese gelen transferler
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# bakiye (uqor — QOR için 1e6'ya bölün)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Sahte-yatırım karşıtı kontrol listesi {#anti-fake-deposit}

Bir yatırımı **yalnızca** aşağıdakilerin **tümü** sağlandığında hesaba geçirin:

1. **`tx_response.code == 0`** — işlem başarılı oldu; başarısız bir işlemi asla hesaba geçirmeyin.
2. Mesaj **`/cosmos.bank.v1beta1.MsgSend`**'dir (veya bir `MsgMultiSend` çıktısıdır) — bir kontrat çağrısı veya başka bir modül değildir.
3. **`to_address`** sizin yatırım adresinize eşittir ve (paylaşılan-adres modelinde) **`memo`** kullanıcıyla eşleşir.
4. **`denom == "uqor"`**'dur ve `amount` hesaba geçirilen değerdir (uqor → QOR için ÷ 10⁶). Başka herhangi bir denom'u reddedin.
5. İşlem **onaylanmış bir blok** içindedir (`height` mevcuttur ve en son onaylanmış yüksekliğe ≤'dir). Kesinlik anlıktır — 1 onay kesindir; marj için 1-2 blok bekleyin.
6. Tutarı **transfer olaylarından** (`coin_received` / `coin_spent`) yeniden hesaplayın ve bunu mesaj tutarına karşı çapraz kontrol edin — asla tek bir alana veya yalnızca memo'ya güvenmeyin.
7. İşlem hash'inin kendi senkronize düğümünüze karşı `GET /cosmos/tx/v1beta1/txs/{hash}` üzerinden var olduğunu doğrulayın.

### Çekimler — hibrit PQC imzalama {#cosmos-withdrawals}

Mainnet, cosmos işlemlerinde **kuantum-sonrası imzaları** zorunlu kılar (`allow_classical_fallback = false`): her çekim bir **hibrit imza** gerektirir — ML-DSA-87 (Dilithium-5, FIPS-204) **artı** secp256k1. Yatırımlar buna ihtiyaç duymaz (yalnızca zinciri izlersiniz).

İmzalama kütüphanesi [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm)'dir; bu da FIPS-204 ilkelleri için `@qorechain/pqc`'yi çeker:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# cosmjs-types'ı 0.9.x'e sabitleyin — 0.10, adaptörün kullandığı alt yol (subpath) importlarını bozar
```

İmzalama **iki adımlı** bir akıştır (`qorechaind tx pqc cosign` ile aynı mantık):

**Adım 1 — sıcak cüzdan başına tek seferlik: ML-DSA-87 anahtarını kaydedin.** Bu tek seferlik kayıt işlemi **klasik-imzalıdır** (önyükleme muafiyeti): mesaj `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`, içeriği `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. ML-DSA anahtarını mevcut sırrınızdan geri kurtarılabilir olacak şekilde deterministik olarak türetin — örn. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, ardından `mldsa.keygen(seed)` — ve tohumu (seed) sıcak cüzdan anahtarınızın yanında saklayın.

**Adım 2 — bundan sonraki her çekim: `MsgSend`'i hibrit-imzalayın.** Adaptör, ML-DSA-87 imzasını normal secp256k1 `signDirect`'ten *önce* bir işlem gövdesi (tx-body) uzantısına gömer, böylece mevcut imzalayıcınız değişmeden kalır:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = mldsa.keygen(seed)'den gelen { publicKey, secretKey }
// accountNumber + sequence, auth sorgusundan
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

İmzalanmış baytları yayımlayın (broadcast):

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => mempool'a kabul edildi
# code 8 "classical fallback not allowed" => bu hesap için adım 1 henüz yapılmadı
```

Ardından `GET /cosmos/tx/v1beta1/txs/{hash}` üzerinden `code == 0` ile bir blokta görünene kadar sorgulayın (poll).

Bir HSM veya başka bir dilde özel bir imzalayıcı için, bağımsız [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 kütüphanelerini (npm, PyPI, crates.io, Maven Central, Go) kullanın ve aynı uzantıyı oluşturun. ML-DSA imzası **deterministik olmalıdır** (FIPS-204 §3.4) — bkz. [Deterministik imzalama](/developer-guide/post-quantum-signing#deterministic-signing); zincir, hedge'lenmiş (hedged) imzaları reddeder.

### Sunucu tarafı alternatif: `@qorechain/chain-bridge` {#chain-bridge}

Tamamen sunucu tarafında çalışan bir sıcak cüzdan işçisi (worker) için (tarayıcı cüzdanı dahil değil), **`@qorechain/chain-bridge`** (npm) tüm akışı — anahtar türetme, ilk kullanımda otomatik PQC kaydı, hibrit imzalama ve yayımlama — tek bir çağrıda sarmalar. Saf JavaScript'tir (native eklenti yoktur), sunucusuz (serverless) işçiler için uygundur:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // veya kendi düğümünüz
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // gizli anahtar yöneticinizden
});

// Tek çağrı: kanonik ML-DSA-87 anahtarını türetir, eksikse otomatik kaydeder,
// MsgSend'i hibrit-imzalar ve yayımlar. Tutarlar uqor cinsindendir (6 ondalık).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1), yığının geri kalanıyla aynı kanonik adres-bağlı PQC türetimini kullanır — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — bu yüzden anahtar, mnemonic'ten `qorechaind tx pqc recover-key` ile kurtarılabilir. Daha eski araçlarla kaydedilmiş hesaplar otomatik olarak yönetilir (eski-anahtar yedeği), ve [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) ile bir kereliğine kanonik anahtara geçirilebilir.

## Yol B — EVM {#path-b-evm}

`https://evm.qore.host` (zincir kimliği **9801**) veya kendi düğümünüzün 8545 portuna karşı standart Ethereum entegrasyonu.

* **Ondalık basamaklar:** native QOR, EVM hattında **18 ondalık basamaklıdır** (1 uqor = 10¹² wei). Bunu yanlış almak, yatırmaları 10¹² kat yanlış hesaba geçirir.
* **Yatırmalar:** adreslerinize native transferler için `eth_getBlockByNumber` ile blokları tarayın; `eth_getTransactionReceipt` (`status == 0x1`) ile doğrulayın.
* **Çekimler:** standart secp256k1 / EIP-155 imzalama — EVM ante yolunda **PQC gerekmez**. Herhangi bir Ethereum imzalama yığını değişmeden çalışır.
* **Sahte-yatırım karşıtı:** makbuz (receipt) durumunu, hareket eden değerin indekslemediğiniz bir ERC-20 olayı değil **native** bir transfer olduğunu doğrulayın ve kendi düğümünüze karşı teyit edin.
* **Adres eşleme:** `0x` adresi ve `qor1` adresi aynı hesabın iki kodlamasıdır — fonlar paylaşılır. Bkz. [EVM Geliştirme](/developer-guide/evm-development).

## Yol C — SVM (Solana uyumlu) {#path-c-svm}

:::caution SVM hattı şu anda devre dışı
SVM işlem hattı, zincir sürümü v3.1.89 (22 Ağustos) itibarıyla işlem gönderimi için **şu anda ağ genelinde devre dışıdır** — ona gönderilen herhangi bir işlem `code 11, "SVM module is disabled"` döndürür. Hat yeniden açılana kadar Yol C üzerinde bir yatırım/çekim hattı **kurmayın**. Bunun yerine **Yol A'yı (Cosmos)** veya **Yol B'yi (EVM)** kullanın. Okuma uç noktaları (örn. `getBalance`) hâlâ yanıt verebilir, ancak işlem gönderimi devre dışıyken SVM'e karşı yatırım tespiti veya çekim akışları kurmayın.
:::

v3.1.82 itibarıyla SVM arayüzü **native QOR**'a hizmet eder (bkz. [SVM Arayüzünde Native QOR](/developer-guide/svm-development#native-qor)):

* **Bakiyeler:** `getBalance`, lamport döndürür (QOR için ÷ 10⁹; 1 uqor = 1.000 lamport).
* **Yatırmalar:** `getSignaturesForAddress`, bir adres için işlem geçmişini verir; System Program transferleri native QOR'u hareket ettirir.
* Herkese açık uç noktalar (`https://svm.qore.host`, `https://svm-testnet.qore.host`) **yalnızca okumaya** açıktır; işlemleri kendi düğümünüz üzerinden gönderin.

## Akış özeti {#flow-summary}

| İşlem | Yol | İmzalama gerekli mi? |
|---|---|---|
| **Yatırım** (kullanıcı → platform) | Adresinize gelen transferler için senkronize düğümünüzü izleyin (+ Cosmos'ta memo) | Hayır — yalnızca izleme |
| **Çekim** (platform → kullanıcı) | Transferi oluşturun, çevrimdışı imzalayın, yayımlayın | Cosmos: hibrit PQC · EVM: standart secp256k1 |
| **Bakiye / süpürme (sweep)** | REST / EVM / SVM bakiye sorgusu + transfer | Yalnızca süpürme için imzalayın |

## İlgili sayfalar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — düğüm kurulumu, indirmeler, anlık görüntü
* [Bir Düğüm Çalıştırma](/developer-guide/running-a-node) — dağıtım, budama (pruning), indeksleme
* [Kuantum-Sonrası İmzalama](/developer-guide/post-quantum-signing) — hibrit çekimlerin arkasındaki FIPS-204 kütüphaneleri
* [Ağlar](/appendix/networks) — arayüz başına zincir kimlikleri, uç noktalar, ondalık basamaklar
