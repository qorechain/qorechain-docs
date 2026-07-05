---
slug: /developer-guide/exchange-integration
title: Borsa ve Entegratör Rehberi
sidebar_label: Borsa Entegrasyonu
sidebar_position: 11
---

# Borsa ve Entegratör Rehberi

Bir borsanın, saklama kuruluşunun veya ödeme entegratörünün QOR'u listelemek ve yatırma/çekme işlemlerini gerçekleştirmek için ihtiyaç duyduğu her şey: bir arayüz seçmek, yatırmaları güvenli şekilde tespit etmek ve çekimleri imzalamak.

:::note
Bu rehber **`qorechain-vladi`** ana ağını (zincir sürümü **v3.1.85**) hedefler. Akışın tamamını önce **`qorechain-diana`** test ağında prova edin — her iki ağın uç noktaları [Ağlar](/appendix/networks#public-endpoints) sayfasındadır. Kendi tam düğümünüzü çalıştırıyorsanız onu güncel zincir sürümünde tutun — güncel olmayan bir düğüm daha yeni işlem türlerini çözümleyemez ve senkronizasyonu durur.
:::

## Bir entegrasyon yolu seçmek {#choosing-a-path}

QoreChain, üç arayüz üzerinden sunulan **tek bir birleşik yerel QOR bakiyesine** sahip tek bir zincirdir. **Aynı özel anahtar aynı fonları kontrol eder** — Cosmos (`qor1...`), EVM (`0x...`) ve SVM (base58) adresi altında; teknoloji yığınınıza hangisi uyuyorsa o arayüzü seçin.

| | **A) Cosmos (yerel)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adres | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (aynı anahtar) |
| Ondalık basamak (yerel QOR) | **6** (`uqor`) | **18** (wei tarzı) | **9** (lamports; 1 uqor = 1.000 lamports) |
| Araçlar | Cosmos SDK / CosmJS | **Standart Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Çekim imzalama | **Hibrit PQC zorunlu** (ML-DSA-87 + secp256k1) | **Standart secp256k1 / EIP-155 — PQC yok** | Cosmos işlemi veya düğüm üzerinden gönderim ile |
| Memo / etiket desteği | **Evet** (paylaşımlı adres + memo) | Hayır (kullanıcı başına bir adres) | Hayır (kullanıcı başına bir adres) |
| Yatırma tespiti | `MsgSend` olaylarını tara | `eth_getBlockByNumber` ile blokları tara | `getBalance` / `getSignaturesForAddress` |
| En uygun olduğu durum | Cosmos-yerlisi platformlar | **Halihazırda EVM entegrasyonu olan platformlar** | Solana araçları kullanan platformlar |

**Öneri:** halihazırda EVM zincirlerini destekliyorsanız, en az çaba gerektiren entegrasyon **B Yolu (EVM)**'dir — standart Ethereum araçları kullanılır ve **çekimler için kuantum sonrası imzalama gerekmez** (EVM ante yolu muaftır). A Yolu (Cosmos), memo tabanlı paylaşımlı yatırma adresleriyle yerel rotadır. C Yolu (SVM) da tam bir yerel QOR arayüzüdür — özellikle Solana araçlarını tercih ediyorsanız onu seçin.

Üç arayüz **birbirini dışlamaz** — aynı anahtarın `0x`, `qor1` veya SVM biçimine gönderilen fonlar aynı bakiyedir.

## Düğümünüzü çalıştırma {#node}

Üretim entegrasyonları, yatırmaları üçüncü taraf bir uç noktaya değil, **kendi senkronize düğümlerine** karşı doğrulamalıdır. [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) sayfasını izleyin — önceden derlenmiş ikili paketi (SHA-256 sağlama toplamlarıyla), genesis'i, herkese açık eşleri, ücret tabanını (`0.1uqor`) ve yayımlanan zincir verisi anlık görüntüsü ile hızlı başlatmayı kapsar. Doğrulayıcı olmayan bir tam düğüm çalıştırmak için lisans gerekmez.

QoreChain **anlık kesinliğe** sahip olduğundan (reorg yok), **1 onay kesindir**; 1–2 blok beklemek rahat bir operasyonel pay sağlar.

## A Yolu — Cosmos (yerel) {#path-a-cosmos}

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

### Sahte yatırmaya karşı kontrol listesi {#anti-fake-deposit}

Bir yatırmayı **yalnızca** aşağıdakilerin **tümü** geçerliyse hesaba geçirin:

1. **`tx_response.code == 0`** — işlem başarılı olmuştur; başarısız bir işlemi asla hesaba geçirmeyin.
2. Mesaj **`/cosmos.bank.v1beta1.MsgSend`** (veya bir `MsgMultiSend` çıktısı) olmalıdır — bir sözleşme çağrısı veya başka bir modül değil.
3. **`to_address`** sizin yatırma adresinize eşit olmalı ve (paylaşımlı adres modelinde) **`memo`** kullanıcıyla eşleşmelidir.
4. **`denom == "uqor"`** olmalı ve `amount` hesaba geçirilecek değer olmalıdır (uqor → QOR için ÷ 10⁶). Diğer tüm denom'ları reddedin.
5. İşlem **kesinleşmiş bir blokta** olmalıdır (`height` mevcut ve ≤ en son kesinleşmiş yükseklik). Kesinlik anlıktır — 1 onay kesindir; pay için 1–2 blok bekleyin.
6. Tutarı **transfer olaylarından** (`coin_received` / `coin_spent`) yeniden hesaplayın ve mesaj tutarıyla karşılaştırarak doğrulayın — asla tek bir alana veya yalnızca memo'ya güvenmeyin.
7. İşlem karmasının var olduğunu `GET /cosmos/tx/v1beta1/txs/{hash}` ile **kendi** senkronize düğümünüze karşı doğrulayın.

### Çekimler — hibrit PQC imzalama {#cosmos-withdrawals}

Ana ağ, cosmos işlemlerinde **kuantum sonrası imzaları** zorunlu kılar (`allow_classical_fallback = false`): her çekim bir **hibrit imza** gerektirir — ML-DSA-87 (Dilithium-5, FIPS-204) **artı** secp256k1. Yatırmalar için buna gerek **yoktur** (yalnızca zinciri izlersiniz).

İmzalama kütüphanesi, FIPS-204 ilkelerini sağlayan `@qorechain/pqc` paketini de içeren [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm) paketidir:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

İmzalama **iki adımlı** bir akıştır (`qorechaind tx pqc cosign` komutunu yansıtır):

**Adım 1 — sıcak cüzdan başına bir kez: ML-DSA-87 anahtarını kaydedin.** Bu tek seferlik kayıt işlemi **klasik olarak imzalanır** (önyükleme muafiyeti): mesaj `/qorechain.pqc.v1.MsgRegisterPQCKeyV2`, içeriği `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. ML-DSA anahtarını, mevcut gizli bilginizden geri türetilebilir olması için deterministik şekilde türetin — örn. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, ardından `mldsa.keygen(seed)` — ve seed'i sıcak cüzdan anahtarınızın yanında saklayın.

**Adım 2 — sonrasındaki her çekim: `MsgSend`'i hibrit olarak imzalayın.** Adaptör, ML-DSA-87 imzasını normal secp256k1 `signDirect` çağrısından *önce* bir tx-body uzantısına gömer; böylece mevcut imzalayıcınız değişmeden kalır:

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

İmzalanan baytları yayınlayın:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Ardından işlem bir blokta `code == 0` ile görünene kadar `GET /cosmos/tx/v1beta1/txs/{hash}` uç noktasını sorgulayın.

Bir HSM veya başka bir dilde özel bir imzalayıcı için, bağımsız [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) FIPS-204 kütüphanelerini (npm, PyPI, crates.io, Maven Central, Go) kullanın ve aynı uzantıyı oluşturun. ML-DSA imzası **deterministik olmalıdır** (FIPS-204 §3.4) — bkz. [Deterministik imzalama](/developer-guide/post-quantum-signing#deterministic-signing); zincir hedged (rastgelelikli) imzaları reddeder.

### Sunucu tarafı alternatif: `@qorechain/chain-bridge` {#chain-bridge}

Tamamen sunucu tarafında çalışan bir sıcak cüzdan işçisi için (tarayıcı cüzdanı olmadan), **`@qorechain/chain-bridge`** (npm) tüm akışı — anahtar türetme, ilk kullanımda otomatik PQC kaydı, hibrit imzalama ve yayınlama — tek bir çağrıda toplar. Saf JavaScript'tir (yerel eklenti yoktur), sunucusuz işçiler için uygundur:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, auto-registers it if missing,
// hybrid-signs the MsgSend, and broadcasts. Amounts are in uqor (6 decimals).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

`chain-bridge` (≥0.1.1), yığının geri kalanıyla aynı kanonik, adrese bağlı PQC türetmesini kullanır — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — dolayısıyla anahtar, `qorechaind tx pqc recover-key` ile mnemonic'ten geri elde edilebilir. Daha eski araçlarla kaydedilmiş hesaplar otomatik olarak ele alınır (eski anahtar yedeği) ve [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) ile bir kez kanonik anahtara taşınabilir.

## B Yolu — EVM {#path-b-evm}

`https://evm.qore.host` (zincir kimliği **9801**) veya kendi düğümünüzün 8545 portu üzerinden standart Ethereum entegrasyonu.

* **Ondalık basamaklar:** yerel QOR, EVM hattında **18 ondalık basamaklıdır** (1 uqor = 10¹² wei). Bunu yanlış almak, yatırmaları 10¹² kat hatalı hesaba geçirir.
* **Yatırmalar:** adreslerinize gelen yerel transferler için blokları `eth_getBlockByNumber` ile tarayın; `eth_getTransactionReceipt` (`status == 0x1`) ile doğrulayın.
* **Çekimler:** standart secp256k1 / EIP-155 imzalama — EVM ante yolunda **PQC gerekmez**. Herhangi bir Ethereum imzalama yığını değişiklik olmadan çalışır.
* **Sahte yatırmaya karşı:** makbuz durumunu doğrulayın, taşınan değerin **yerel** bir transfer olduğunu (endekslemediğiniz bir ERC-20 olayı olmadığını) doğrulayın ve kendi düğümünüze karşı teyit edin.
* **Adres eşlemesi:** `0x` adresi ve `qor1` adresi aynı hesabın iki farklı kodlamasıdır — fonlar ortaktır. Bkz. [EVM Geliştirme](/developer-guide/evm-development).

## C Yolu — SVM (Solana uyumlu) {#path-c-svm}

v3.1.82 itibarıyla SVM arayüzü **yerel QOR** sunar (bkz. [SVM Arayüzünde Yerel QOR](/developer-guide/svm-development#native-qor)):

* **Bakiyeler:** `getBalance` lamports döndürür (QOR için ÷ 10⁹; 1 uqor = 1.000 lamports).
* **Yatırmalar:** `getSignaturesForAddress` bir adresin işlem geçmişini verir; System Program transferleri yerel QOR taşır.
* Herkese açık uç noktalar (`https://svm.qore.host`, `https://svm-testnet.qore.host`) **salt okunurdur**; işlemleri kendi düğümünüz üzerinden gönderin.

## Akış özeti {#flow-summary}

| İşlem | Yol | İmzalama gerekli mi? |
|---|---|---|
| **Yatırma** (kullanıcı → platform) | Adresinize gelen transferler için senkronize düğümünüzü izleyin (Cosmos'ta + memo) | Hayır — yalnızca izleme |
| **Çekim** (platform → kullanıcı) | Transferi oluşturun, çevrimdışı imzalayın, yayınlayın | Cosmos: hibrit PQC · EVM: standart secp256k1 |
| **Bakiye / süpürme** | REST / EVM / SVM bakiye sorgusu + transfer | Yalnızca süpürme için imzalayın |

## İlgili sayfalar

* [Ana Ağa Bağlanma](/getting-started/connecting-to-mainnet) — düğüm kurulumu, indirmeler, anlık görüntü
* [Düğüm Çalıştırma](/developer-guide/running-a-node) — dağıtım, budama, endeksleme
* [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) — hibrit çekimlerin arkasındaki FIPS-204 kütüphaneleri
* [Ağlar](/appendix/networks) — zincir kimlikleri, uç noktalar, arayüz başına ondalık basamaklar
