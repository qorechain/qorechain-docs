---
slug: /developer-guide/exchange-integration
title: Borsa ve Entegratör Rehberi
sidebar_label: Borsa Entegrasyonu
sidebar_position: 11
---

# Borsa ve Entegratör Rehberi

Bir borsanın, saklama kuruluşunun (custodian) veya ödeme entegratörünün QOR'u listelemek ve para yatırma/çekme işlemlerini gerçekleştirmek için ihtiyaç duyacağı her şey: bir arayüz seçmek, yatırmaları güvenli şekilde tespit etmek ve çekim işlemlerini imzalamak.

:::note
Bu rehber **`qorechain-vladi`** mainnet'ini hedefler (29 Haziran 2026'dan beri yayında; düğüm sürümü **v3.2.1**, v3.2.0 yükseltmesinin konsensüs kurallarıyla). Önce tüm akışı **`qorechain-diana`** testnet'inde (v3.2.2) prova edin — her iki ağın uç noktaları da [Ağlar](/appendix/networks#public-endpoints) sayfasındadır. Kendi tam düğümünüzü (full node) çalıştırıyorsanız, onu indirme manifestosunun önerdiği sürümde tutun ve asla manifestodaki `minCompatible` değerinin altına düşürmeyin (yeni bir mainnet düğümü v3.2.0 veya daha yenisini gerektirir) — güncel olmayan bir düğüm zincirin yükseltmelerini takip edemez ve senkronizasyonu durur.
:::

## Entegrasyon yolu seçme {#choosing-a-path}

QoreChain, üç arayüz üzerinden sunulan **tek bir birleşik native-QOR bakiyesine** sahip tek bir zincirdir. **Aynı özel anahtar aynı fonları kontrol eder** — bir Cosmos (`qor1...`), bir EVM (`0x...`) ve bir SVM (base58) adresi altında — yığınınıza uyan arayüzü seçin.

| | **A) Cosmos (native)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adres | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aynı anahtar) |
| Ondalık basamak (native QOR) | **6** (`uqor`) | **18** (wei tarzı) | **9** (lamport; 1 uqor = 1.000 lamport) |
| Araçlar | Cosmos SDK / CosmJS | **Standart Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Çekim imzalama | **Hibrit PQC gerekli** (ML-DSA-87 + secp256k1) | **Standart secp256k1 / EIP-155, ancak yalnızca açık bir PQC yetkilendirme penceresinin içinde** (kayıtlı bir ML-DSA anahtarı + hibrit imzalı bir Cosmos mesajıyla açılmış bir pencere) | Cosmos tx veya düğüm üzerinde gönderim ile (hat şu anda devre dışı) |
| Not / etiket desteği | **Evet** (paylaşılan adres + memo) | Hayır (kullanıcı başına bir adres) | Hayır (kullanıcı başına bir adres) |
| Yatırım tespiti | `MsgSend` olaylarını tarama | `eth_getBlockByNumber` ile blokları tarama | `getBalance` / `getSignaturesForAddress` |
| En uygun olduğu durum | Cosmos-native platformlar | **Mevcut EVM entegrasyonu olan platformlar** | Solana araç zinciri kullanan platformlar |

**Öneri:** çekimler için **Yol A'yı (Cosmos)** kullanın; native rota budur ve memo tabanlı paylaşılan yatırım adreslerine sahiptir. v3.2.0'dan beri EVM hattı (Yol B) de kayıtlı bir ML-DSA-87 anahtarı ve yalnızca hibrit imzalı bir Cosmos hattı mesajıyla açılabilen, sınırlı ve açık bir **EVM yetkilendirme penceresi** gerektirir; dolayısıyla bir EVM çekim hattı, Yol A ile aynı kuantum-sonrası imzalama yığınına **ek olarak** pencere yönetimine ihtiyaç duyar (bkz. [Yol B](#path-b-evm) ve [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window)). Yol B, standart Ethereum araçlarıyla **yatırım tespiti** için hâlâ uygundur. Yol C (SVM), kağıt üzerinde tam bir native-QOR arayüzüdür, ancak **işlem hattı şu anda ağ genelinde devre dışıdır** (bkz. [Yol C](#path-c-svm)) — yeniden açılana kadar Yol A'yı veya yatırım tespiti için Yol B'yi kullanın.

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
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

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
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

İmzalama **iki adımlı** bir akıştır (`qorechaind tx pqc cosign` ile aynı mantık):

**Adım 1 — sıcak cüzdan başına tek seferlik: ML-DSA-87 anahtarını kaydedin.** Bu tek seferlik kayıt işlemi **klasik-imzalıdır** (önyükleme muafiyeti): mesaj `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`, içeriği `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. ML-DSA anahtarını mevcut sırrınızdan geri kurtarılabilir olacak şekilde deterministik olarak türetin — örn. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, ardından `mldsa.keygen(seed)` — ve tohumu (seed) sıcak cüzdan anahtarınızın yanında saklayın. Kayıt açıktır (explicit): ilk hibrit işlem göründüğünde anahtarı sizin yerinize hiçbir şey kaydetmez ve bir işlemin içine gömülü bir anahtar kayıtlı değildir. Gas'i açıkça ayarlayın (2.592 baytlık anahtar varsayılan 200.000'den fazlasına ihtiyaç duyar; CLI'da `--gas 600000`, kodda 600.000 gas limiti ve en az gas × 0.1 uqor, yani 60.000 uqor ücret kullanın).

**Adım 2 — bundan sonraki her çekim: `MsgSend`'i hibrit-imzalayın.** Adaptör, ML-DSA-87 imzasını normal secp256k1 `signDirect`'ten *önce* bir işlem gövdesi (tx-body) uzantısına gömer, böylece mevcut imzalayıcınız değişmeden kalır:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
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
# 0 => accepted into the mempool
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Ardından `GET /cosmos/tx/v1beta1/txs/{hash}` üzerinden `code == 0` ile bir blokta görünene kadar sorgulayın (poll).

Bir HSM veya başka bir dilde özel bir imzalayıcı için, bağımsız [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 kütüphanelerini (npm, PyPI, crates.io, Maven Central, Go) kullanın ve aynı uzantıyı oluşturun. Zincir, hedged veya deterministik, FIPS-204'e uygun her geçerli ML-DSA-87 imzasını kabul eder; deterministik imzalama (FIPS-204 §3.4, kütüphanelerin varsayılanı) size yeniden üretilebilir bir imza ve tx hash'i verir. Bkz. [Deterministik imzalama](/developer-guide/post-quantum-signing#deterministic-signing); hibrit bir işlem reddedilirse [Kod 21 sorun giderme](/developer-guide/post-quantum-signing#code-21) bölümüne bakın.

### Sunucu tarafı alternatif: `@qorechain/chain-bridge` {#chain-bridge}

Tamamen sunucu tarafında çalışan bir sıcak cüzdan işçisi (worker) için (tarayıcı cüzdanı dahil değil), **`@qorechain/chain-bridge`** (npm) tüm akışı — anahtar türetme, hibrit imzalama ve yayımlama — tek bir çağrıda sarmalar. Saf JavaScript'tir (native eklenti yoktur), sunucusuz (serverless) işçiler için uygundur:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Hesabın henüz kayıtlı bir anahtarı yoksa, kütüphanenin kendisi açık `MsgRegisterPQCKeyV2` işlemini gönderir ve bir kez yeniden dener; bu, zincirin değil kütüphanenin davranışıdır, bu nedenle bir sıcak cüzdan hattı anahtarı önceden kaydetmeli ve ilk çekimden önce onaylamalıdır (`GET /qorechain/pqc/v1/account/{address}`). `chain-bridge` (≥0.1.1), yığının geri kalanıyla aynı kanonik adres-bağlı PQC türetimini kullanır — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — bu yüzden anahtar, mnemonic'ten `qorechaind tx pqc recover-key` ile kurtarılabilir. Daha eski araçlarla kaydedilmiş hesaplar otomatik olarak yönetilir (eski-anahtar yedeği), ve [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) ile bir kereliğine kanonik anahtara geçirilebilir.

## Yol B — EVM {#path-b-evm}

`https://evm.qore.host` (zincir kimliği **9801**) veya kendi düğümünüzün 8545 portuna karşı standart Ethereum entegrasyonu.

* **Ondalık basamaklar:** native QOR, EVM hattında **18 ondalık basamaklıdır** (1 uqor = 10¹² wei). Bunu yanlış almak, yatırmaları 10¹² kat yanlış hesaba geçirir.
* **Yatırmalar:** adreslerinize native transferler için `eth_getBlockByNumber` ile blokları tarayın; `eth_getTransactionReceipt` (`status == 0x1`) ile doğrulayın. Para yatıranların kendi EVM işlemleri de pencere kuralına tabidir; bu nedenle hesabında kayıtlı anahtar veya açık pencere bulunmayan bir kullanıcı EVM hattından yatırım gönderemez (bunun yerine Cosmos hattını kullanabilir).
* **Çekimler:** standart secp256k1 / EIP-155 imzalama, **ancak yalnızca kayıtlı bir ML-DSA-87 anahtarı ve açık bir EVM yetkilendirme penceresi olan bir hesaptan** (v3.2.0'dan beri; bkz. [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window) ve [İlk İşleminiz](/getting-started/first-transaction#evm-window) içindeki adım adım anlatım). Pencere dışındaki bir işlem reddedilir (codespace `pqc`, kod 26, 27 veya 28). Pencere, hibrit imzalı bir Cosmos hattı işlemiyle açılmalıdır; dolayısıyla Yol B, kuantum-sonrası imzalama ihtiyacını ortadan kaldırmaz. `max-value` değerini, pencere içinde beklediğiniz her çekimin değerini artı azami ücretini (gas limiti × gas başına azami ücret) karşılayacak şekilde boyutlandırın ve sıcak cüzdanın bir toplu işlemin ortasında tükenmemesi için `GET /qorechain/pqc/v1/evm_window/{address}` adresini izleyin. Bir pencere açmak hesabın sequence değerini (aynı zamanda EVM nonce'udur) ilerletir; bu yüzden nonce'u pencere açıldıktan sonra okuyun.
* **Sahte-yatırım karşıtı:** makbuz (receipt) durumunu, hareket eden değerin indekslemediğiniz bir ERC-20 olayı değil **native** bir transfer olduğunu doğrulayın ve kendi düğümünüze karşı teyit edin.
* **Adres eşleme:** `0x` adresi ve `qor1` adresi aynı hesabın iki kodlamasıdır — fonlar paylaşılır. Bkz. [EVM Geliştirme](/developer-guide/evm-development).

## Yol C — SVM (Solana uyumlu) {#path-c-svm}

:::caution SVM hattı şu anda devre dışı
SVM işlem hattı, zincir sürümü v3.1.89 (22 Ağustos) itibarıyla işlem gönderimi için **şu anda ağ genelinde devre dışıdır** — ona gönderilen herhangi bir işlem `code 11, "SVM module is disabled"` döndürür. Hat yeniden açılana kadar Yol C üzerinde bir yatırım/çekim hattı **kurmayın** — bu, çalışma zamanı parametresi değil derleme zamanı devre dışı bırakmasıdır, bu nedenle bir yönetişim oylamasıyla yeniden açılamaz; bir dış denetim onaylayana kadar kapalı kalması beklenmektedir. Bunun yerine **Yol A'yı (Cosmos)** veya **Yol B'yi (EVM)** kullanın. Okuma uç noktaları (örn. `getBalance`) hâlâ yanıt verebilir, ancak işlem gönderimi devre dışıyken SVM'e karşı yatırım tespiti veya çekim akışları kurmayın.
:::

v3.1.82 itibarıyla SVM arayüzü **native QOR**'a hizmet eder (bkz. [SVM Arayüzünde Native QOR](/developer-guide/svm-development#native-qor)):

* **Bakiyeler:** `getBalance`, lamport döndürür (QOR için ÷ 10⁹; 1 uqor = 1.000 lamport).
* **Yatırmalar:** `getSignaturesForAddress`, bir adres için işlem geçmişini verir; System Program transferleri native QOR'u hareket ettirir.
* Herkese açık uç noktalar (`https://svm.qore.host`, `https://svm-testnet.qore.host`) **yalnızca okumaya** açıktır; işlemleri kendi düğümünüz üzerinden gönderin.

## Akış özeti {#flow-summary}

| İşlem | Yol | İmzalama gerekli mi? |
|---|---|---|
| **Yatırım** (kullanıcı → platform) | Adresinize gelen transferler için senkronize düğümünüzü izleyin (+ Cosmos'ta memo) | Hayır — yalnızca izleme |
| **Çekim** (platform → kullanıcı) | Transferi oluşturun, çevrimdışı imzalayın, yayımlayın | Cosmos: hibrit PQC · EVM: PQC ile yetkilendirilmiş bir pencerenin içinde standart secp256k1 |
| **Bakiye / süpürme (sweep)** | REST / EVM / SVM bakiye sorgusu + transfer | Yalnızca süpürme için imzalayın |

## İlgili sayfalar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — düğüm kurulumu, indirmeler, anlık görüntü
* [Bir Düğüm Çalıştırma](/developer-guide/running-a-node) — dağıtım, budama (pruning), indeksleme
* [Kuantum-Sonrası İmzalama](/developer-guide/post-quantum-signing) — hibrit çekimlerin arkasındaki FIPS-204 kütüphaneleri
* [Ağlar](/appendix/networks) — arayüz başına zincir kimlikleri, uç noktalar, ondalık basamaklar
