---
slug: /developer-guide/exchange-integration
title: Borsa ve Entegratör Rehberi
sidebar_label: Borsa Entegrasyonu
sidebar_position: 11
---

# Borsa ve Entegratör Rehberi

Bir borsanın, saklama kuruluşunun (custodian) veya ödeme entegratörünün QOR'u listelemek, para yatırma ve çekme işlemlerini gerçekleştirmek için ihtiyaç duyduğu her şey: bir arayüz seçmek, yatırılan tutarları güvenli biçimde tespit etmek ve çekim işlemlerini imzalamak.

:::note
Bu rehber **`qorechain-vladi`** ana ağını (zincir sürümü **v3.1.82**) hedefler. Akışın tamamını önce **`qorechain-diana`** test ağında prova edin — her iki ağın uç noktaları [Ağlar](/appendix/networks#public-endpoints) sayfasındadır.
:::

## Entegrasyon yolu seçimi {#choosing-a-path}

QoreChain, üç arayüz üzerinden sunulan **tek bir birleşik yerel QOR bakiyesine** sahip tek bir zincirdir. **Aynı özel anahtar, aynı fonları** bir Cosmos (`qor1...`), bir EVM (`0x...`) ve bir SVM (base58) adresi altında kontrol eder — yığınınıza (stack) hangisi uyuyorsa onu seçin.

| | **A) Cosmos (yerel)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adres | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aynı anahtar) |
| Ondalık basamak (yerel QOR) | **6** (`uqor`) | **18** (wei tarzı) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Araçlar | Cosmos SDK / CosmJS | **Standart Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Çekim imzalama | **Hibrit PQC zorunlu** (ML-DSA-87 + secp256k1) | **Standart secp256k1 / EIP-155 — PQC yok** | Cosmos tx'i ile veya düğüm üzerinde gönderim |
| Memo / etiket desteği | **Evet** (paylaşılan adres + memo) | Hayır (kullanıcı başına bir adres) | Hayır (kullanıcı başına bir adres) |
| Yatırma tespiti | `MsgSend` olaylarını tara | `eth_getBlockByNumber` ile blokları tara | `getBalance` / `getSignaturesForAddress` |
| En uygun olduğu senaryo | Cosmos yerlisi platformlar | **Mevcut EVM entegrasyonu olan platformlar** | Solana araçları kullanan platformlar |

**Öneri:** halihazırda EVM zincirlerini destekliyorsanız, en az emek gerektiren entegrasyon **Yol B (EVM)**'dir — standart Ethereum araçları kullanılır ve **çekim işlemleri post-kuantum imzalama gerektirmez** (EVM ante yolu muaftır). Yol A (Cosmos), memo tabanlı paylaşılan yatırma adresleriyle yerel rotadır. Yol C (SVM) de tam teşekküllü bir yerel QOR arayüzüdür — özellikle Solana araçlarını tercih ediyorsanız onu seçin.

Üç arayüz **birbirini dışlamaz** — aynı anahtarın `0x`, `qor1` veya SVM biçimine gönderilen fonlar aynı bakiyedir.

## Kendi düğümünüzü çalıştırma {#node}

Üretim ortamındaki entegrasyonlar, yatırılan tutarları üçüncü taraf bir uç noktaya değil, **kendi senkronize düğümlerine** karşı doğrulamalıdır. [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) sayfasını izleyin — önceden derlenmiş ikili (binary) paketini (SHA-256 sağlama toplamlarıyla birlikte), genesis dosyasını, herkese açık eşleri (peer), ücret tabanını (`0.1uqor`) ve yayımlanan zincir verisi anlık görüntüsü (snapshot) ile hızlı bir başlangıcı kapsar. Doğrulayıcı olmayan bir tam düğüm çalıştırmak için lisans gerekmez.

QoreChain **anında kesinliğe** (finality) sahip olduğundan (reorg yoktur), **1 onay nihaidir**; 1–2 blok beklemek rahat bir operasyonel pay sağlar.

## Yol A — Cosmos (yerel) {#path-a-cosmos}

Temel REST URL'si: `https://api.qore.host` (veya kendi düğümünüzde `http://localhost:1317`).

### Yatırmaları izleme

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Sahte yatırmalara karşı kontrol listesi {#anti-fake-deposit}

Bir yatırmayı **yalnızca** aşağıdakilerin **tümü** sağlandığında hesaba geçirin:

1. **`tx_response.code == 0`** — işlem başarılı olmuştur; başarısız bir tx'i asla hesaba geçirmeyin.
2. Mesaj **`/cosmos.bank.v1beta1.MsgSend`** olmalıdır (veya bir `MsgMultiSend` çıktısı) — bir sözleşme çağrısı ya da başka bir modül değil.
3. **`to_address`** sizin yatırma adresinize eşit olmalı ve (paylaşılan adres modelinde) **`memo`** kullanıcıyla eşleşmelidir.
4. **`denom == "uqor"`** olmalı ve `amount` hesaba geçirilecek değer olmalıdır (uqor → QOR için ÷ 10⁶). Diğer tüm denom'ları reddedin.
5. Tx **kesinleşmiş (committed) bir blokta** olmalıdır (`height` mevcut ve en son kesinleşen yükseklikten ≤). Kesinlik anındadır — 1 onay nihaidir; pay bırakmak için 1–2 blok bekleyin.
6. Tutarı **transfer olaylarından** (`coin_received` / `coin_spent`) yeniden hesaplayın ve mesajdaki tutarla çapraz kontrol edin — asla tek bir alana veya yalnızca memo'ya güvenmeyin.
7. Tx hash'inin var olduğunu, **kendi** senkronize düğümünüze karşı `GET /cosmos/tx/v1beta1/txs/{hash}` ile doğrulayın.

### Çekimler — hibrit PQC imzalama {#cosmos-withdrawals}

Mainnet, cosmos işlemlerinde **post-kuantum imzaları** zorunlu kılar (`allow_classical_fallback = false`): her çekim işlemi bir **hibrit imza** gerektirir — ML-DSA-87 (Dilithium-5, FIPS-204) **artı** secp256k1. Yatırmalar bunu **gerektirmez** (yalnızca zinciri izlersiniz).

İmzalama kütüphanesi [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm) olup, FIPS-204 ilkelleri (primitives) için `@qorechain/pqc` paketini de getirir:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

İmzalama **iki adımlı** bir akıştır (`qorechaind tx pqc cosign` komutunu yansıtır):

**Adım 1 — sıcak cüzdan (hot wallet) başına bir kez: ML-DSA-87 anahtarını kaydedin.** Bu tek seferlik kayıt işlemi **klasik imzalıdır** (bootstrap muafiyeti): mesaj `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`, içeriği `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. ML-DSA anahtarını, mevcut gizli değerinizden geri kurtarılabilir olması için deterministik biçimde türetin — örn. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, ardından `mldsa.keygen(seed)` — ve seed'i sıcak cüzdan anahtarınızla birlikte saklayın.

**Adım 2 — bundan sonraki her çekim: `MsgSend`'i hibrit imzalayın.** Adaptör, ML-DSA-87 imzasını normal secp256k1 `signDirect` işleminden *önce* bir tx-body uzantısının içine gömer; böylece mevcut imzalayıcınız değişmeden kalır:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

İmzalı baytları yayınlayın (broadcast):

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Ardından, işlem `code == 0` ile bir blokta görünene kadar `GET /cosmos/tx/v1beta1/txs/{hash}` uç noktasını sorgulayın.

Bir HSM veya başka bir dildeki özel bir imzalayıcı için, bağımsız [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 kütüphanelerini (npm, PyPI, crates.io, Maven Central, Go) kullanın ve aynı uzantıyı oluşturun. ML-DSA imzası **deterministik olmalıdır** (FIPS-204 §3.4) — bkz. [Deterministik imzalama](/developer-guide/post-quantum-signing#deterministic-signing); zincir, hedged imzaları reddeder.

## Yol B — EVM {#path-b-evm}

`https://evm.qore.host` (zincir kimliği **9801**) veya kendi düğümünüzün 8545 portu üzerinden standart Ethereum entegrasyonu.

* **Ondalık basamaklar:** EVM rayında yerel QOR **18 ondalık basamaklıdır** (1 uqor = 10¹² wei). Bunu yanlış almak, yatırmaları 10¹² kat hatalı hesaba geçirir.
* **Yatırmalar:** adreslerinize yapılan yerel transferler için `eth_getBlockByNumber` ile blokları tarayın; `eth_getTransactionReceipt` (`status == 0x1`) ile doğrulayın.
* **Çekimler:** standart secp256k1 / EIP-155 imzalama — EVM ante yolunda **PQC gerekmez**. Herhangi bir Ethereum imzalama yığını değişiklik olmadan çalışır.
* **Sahte yatırmalara karşı:** makbuz (receipt) durumunu, taşınan değerin (indekslemediğiniz bir ERC-20 olayı değil) **yerel** bir transfer olduğunu doğrulayın ve kendi düğümünüzle teyit edin.
* **Adres eşlemesi:** `0x` adresi ile `qor1` adresi aynı hesabın iki kodlamasıdır — fonlar ortaktır. Bkz. [EVM Geliştirme](/developer-guide/evm-development).

## Yol C — SVM (Solana uyumlu) {#path-c-svm}

v3.1.82 itibarıyla SVM arayüzü **yerel QOR** sunar (bkz. [SVM Arayüzünde Yerel QOR](/developer-guide/svm-development#native-qor)):

* **Bakiyeler:** `getBalance` lamports döndürür (QOR için ÷ 10⁹; 1 uqor = 1.000 lamports).
* **Yatırmalar:** `getSignaturesForAddress` bir adresin işlem geçmişini verir; System Program transferleri yerel QOR taşır.
* Herkese açık uç noktalar (`https://svm.qore.host`, `https://svm-testnet.qore.host`) **salt okunurdur**; işlemleri kendi düğümünüz üzerinden gönderin.

## Akış özeti {#flow-summary}

| İşlem | Yol | İmza gerekli mi? |
|---|---|---|
| **Yatırma** (kullanıcı → platform) | Senkronize düğümünüzde adresinize yapılan transferleri izleyin (Cosmos'ta + memo) | Hayır — yalnızca izleme |
| **Çekim** (platform → kullanıcı) | Transferi oluşturun, çevrimdışı imzalayın, yayınlayın | Cosmos: hibrit PQC · EVM: standart secp256k1 |
| **Bakiye / süpürme (sweep)** | REST / EVM / SVM bakiye sorgusu + transfer | Yalnızca süpürme için imzalayın |

## İlgili sayfalar

* [Mainnet'e Bağlanma](/getting-started/connecting-to-mainnet) — düğüm kurulumu, indirmeler, snapshot
* [Düğüm Çalıştırma](/developer-guide/running-a-node) — dağıtım, budama (pruning), indeksleme
* [Post-Kuantum İmzalama](/developer-guide/post-quantum-signing) — hibrit çekimlerin arkasındaki FIPS-204 kütüphaneleri
* [Ağlar](/appendix/networks) — zincir kimlikleri, uç noktalar, arayüz başına ondalık basamaklar
