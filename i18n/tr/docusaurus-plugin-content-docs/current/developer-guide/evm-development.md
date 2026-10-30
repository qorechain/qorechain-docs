---
slug: /developer-guide/evm-development
title: EVM Geliştirme
sidebar_label: EVM Geliştirme
sidebar_position: 2
---

# EVM Geliştirme

QoreChain, QoreChain EVM Motoru üzerinde tam EVM uyumlu bir yürütme ortamı çalıştırır ve bu sayede tanıdık araçları kullanarak Solidity akıllı sözleşmelerini dağıtmanıza ve onlarla etkileşime geçmenize olanak tanır. EVM modülü, standart Ethereum geliştirme iş akışlarını destekleyen bir JSON-RPC arayüzünü **8545 portunda** (WebSocket için **8546** portunda) sunar.

:::note
Aşağıdaki örnekler, 7 Haziran 2026'dan beri canlı olan ve **v3.2.5** düğüm sürümünü çalıştıran (yönetişim önerisi 14 ile 29 Ekim 2026'da 3.906.833 yüksekliğinde uygulandı; v3.2.4, 23 Ekim 2026'da 3.742.566 yüksekliğinde ve v3.2.3, 20 Ekim 2026'da 3.662.051 yüksekliğinde uygulanmıştı) **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedef almaktadır. **`qorechain-diana`** test ağı **v3.2.6** çalıştırır (v3.2.4: 19 Ekim 2026'da 8.337.253 yüksekliğinden beri, v3.2.5: 26 Ekim'de 8.890.800 yüksekliğinde, v3.2.6: 27 Ekim'de 8.970.638 yüksekliğinde); orada EVM zincir kimliği **9800**'ü kullanın. Bu sayfa ağlar arasında farklılık gösteren bir şeyi (testnet precompile'ları, Fest test token'ları) anlattığında bunu belirtir. Kod örnekleri, kendi çalıştırdığınız bir düğüm için `http://localhost:8545` adresini kullanır; herkese açık ana ağ uç noktası `https://evm.qore.host`, test ağı uç noktası ise `https://evm-testnet.qore.host` adresidir.
:::

:::caution Bir EVM işlemi, kayıtlı bir PQC anahtarı ve açık bir yetkilendirme penceresi gerektirir
v3.2.0 yükseltmesinden itibaren (ana ağ yüksekliği 2.981.742, test ağı yüksekliği 5.920.000) EVM şeridi (lane), bir işlemi yalnızca **(1) kayıtlı bir ML-DSA-87 kuantum-sonrası anahtarına** ve **(2) o işlem için hâlâ yer bulunan açık bir EVM yetkilendirme penceresine** sahip bir hesaptan kabul eder. Sıradan araçlarla (MetaMask, ethers.js, Hardhat, Foundry) imzalarsınız, ancak kayıtlı bir anahtar ve açık bir pencere olmadan `eth_sendRawTransaction` reddedilir (codespace `pqc`, kod 26, 27 veya 28). Okumalar, `eth_call` ve gas tahmini bunların hiçbirine ihtiyaç duymaz. Aşağıdaki [EVM yetkilendirme penceresi](#evm-window) bölümüne ve [İlk İşleminiz](/getting-started/first-transaction#evm-window) sayfasındaki adım adım anlatıma bakın.

v3.2.2'den beri ana ağda iki kural daha geçerlidir: **korumasız (EIP-155 öncesi) işlemler reddedilir**, hem düğümün mempool'unda hem de blok yürütmede; bu yüzden bir zincir kimliğiyle imzalayın (günümüzün tüm cüzdanları ve kütüphaneleri bunu yapar); ve **modül hesapları EVM üzerinden sahiplenilemez**.
:::

---

## JSON-RPC Uç Noktası

| Özellik               | Değer                                      |
| ---------------------- | ------------------------------------------ |
| Varsayılan URL          | `http://localhost:8545`                    |
| WebSocket URL           | `ws://localhost:8546`                      |
| Desteklenen ad alanları | `eth_`, `web3_`, `net_`, `txpool_`          |
| Zincir kimliği (ana ağ) | `9801` (`qorechain-vladi`)                 |
| Zincir kimliği (test ağı) | `9800` (`qorechain-diana`)               |
| Para birimi sembolü     | `QOR`                                      |

QoreChain'e özgü okumalar REST üzerinden (`api.qore.host`) sunulur; [aşağıda](#custom-qor_-namespace) açıklanan `qor_` JSON-RPC ad alanı, herkese açık uç noktalarda ve varsayılan düğüm yapılandırmasında **etkin değildir**. Yeni başlatılmış bir düğümün varsayılan `api` listesi (v3.2.3 ve sonrası) `eth,net,web3`'tür; `txpool` isteğe bağlıdır, çünkü düğümün bekleyen işlemlerini yayınlar.

v3.2.4 düğüm sürümünden itibaren (mainnet'te 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri) bir düğüm kendi JSON-RPC sunucusunu sınırlar: 256 KiB'tan büyük istek gövdeleri reddedilir (HTTP 413), aynı anda en fazla 256 istek sunulur (bunun ötesinde HTTP 503) ve 4'ten fazla topic konumu, tek bir konumda 1000 alternatif veya 1000 adres içeren bir `eth_getLogs` ya da `eth_newFilter` filtresi reddedilir. Sınırlar, `app.toml` dosyasının `[json-rpc]` bölümündeki düğüm-yerel ayarlardır; bkz. [Düğüm Çalıştırma](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Cüzdan Yapılandırması (MetaMask)

QoreChain'i MetaMask'e özel bir ağ olarak ekleyin:

| Alan                | Ana Ağ Değeri              | Test Ağı Değeri         |
| ------------------- | -------------------------- | ------------------------ |
| Ağ Adı               | QoreChain (qorechain-vladi) | QoreChain Diana         |
| RPC URL              | `https://evm.qore.host`    | `https://evm-testnet.qore.host` |
| Zincir Kimliği       | `9801`                     | `9800`                   |
| Para Birimi Sembolü  | `QOR`                      | `QOR`                    |
| Blok Gezgini URL'si  | `https://explore.qore.network` | *(isteğe bağlı)* |

MetaMask'ten göndermek ayrıca hesapta kayıtlı bir PQC anahtarı ve açık bir [EVM yetkilendirme penceresi](#evm-window) gerektirir.

---

## Hardhat

Hardhat'i kurun ve `hardhat.config.js` dosyanızı yapılandırın:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Bir sözleşmeyi dağıtın (dağıtımı yapan hesabın kayıtlı bir PQC anahtarına ve açık bir [yetkilendirme penceresine](#evm-window) ihtiyacı vardır; bir dağıtım, pencerede tek bir EVM işlemi olarak sayılır):

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

QoreChain EVM'ye karşı testleri çalıştırın:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Foundry ile bir sözleşme oluşturun ve dağıtın:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Gas Modeli

QoreChain, EVM işlemleri için **EIP-1559 dinamik taban ücreti** modelini kullanır:

* Taban ücret, kullanım oranına göre blok başına ayarlanır
* Kullanıcılar `maxFeePerGas` ve `maxPriorityFeePerGas` değerlerini belirleyebilir
* Öncelik ücretleri blok önerene gider

### Birim Köprüsü

Yerel QOR token'ının **6 ondalık basamağı** vardır (`uqor`), EVM ise **18 ondalık basamak** bekler. `x/precisebank` modülü bu dönüşümü sorunsuz şekilde yönetir:

| Bağlam        | Birim  | Ondalık | Örnek                   |
| ------------- | ------ | ------- | ------------------------ |
| Yerel zincir  | `uqor` | 6       | `1000000 uqor = 1 QOR`  |
| EVM           | wei    | 18      | `1e18 wei = 1 QOR`      |

Bu dönüşüm şeffaftır — `eth_getBalance` ile bir bakiyeyi kontrol ettiğinizde yanıt 18 ondalıklı wei cinsinden gelir. Aynı hesap yerel banka modülü üzerinden sorgulandığında bakiye 6 ondalıklı `uqor` cinsinden görünür.

---

## ERC-20 Token Çiftleri {#erc20-token-pairs}

`x/erc20` modülü, yerel Cosmos SDK birimleri ile ERC-20 sözleşmeleri arasında **token çiftleri** sağlar:

* Yerel token'lar EVM sözleşmeleri içinde ERC-20 olarak kullanılabilir
* EVM üzerinde dağıtılan ERC-20 token'ları yerel birimlere dönüştürülebilir
* Dönüşüm çift yönlüdür ve protokol seviyesinde gerçekleştirilir

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Bunlar Cosmos şeridi işlemleridir: canlı ağlarda ayrıca hibrit kuantum-sonrası ortak imza (cosign) da gerekir (`--generate-only` ile oluşturun, ardından `qorechaind tx pqc cosign` çalıştırın; bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)). Yukarıdaki düz `convert-erc20` komutu, CLI göndericiyi `0x` olarak yazdığı için v3.2.6 düğüm sürümünde reddedilir; çalışan biçim için bkz. [İki biçim arasında dönüştürme](#fest-convert). Token çiftleri izinli bir politika altında kaydedilir (bunları yönetişim kaydeder). Yazım sırasında ana ağda hiçbiri yoktur; testnet'te [bir sonraki bölümdeki](#fest-tokens) Fest test token'ları vardır.

## Fest test token'ları ve ERC20 dönüştürme {#fest-tokens}

:::note Yalnızca testnet, değeri yok
Bu bölümdeki token'lar yalnızca `qorechain-diana` testnet'inde (EVM zincir kimliği 9800) vardır. Bunlar geliştiriciler için test token'larıdır ve hiçbir değeri yoktur. Mainnet'te hiçbir ERC-20 token çifti yoktur (27 Ekim 2026'da kontrol edildi), dolayısıyla aşağıdaki birimlerin hiçbiri orada bulunmaz.
:::

27 Ekim 2026'da testnet yönetişimi (öneri 26) üç ERC-20 sözleşmesini token çifti olarak kaydetti. Bunlar, geliştiricilere bir [AMM havuzunda](/api-reference/rest-grpc-endpoints#amm-module) QOR ile eşleştirebilecekleri ikinci bir token verir:

| Token | ERC-20 sözleşmesi (EIP-55) | Ondalık | Bank birimi |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **Bank birimi, iki nokta üst üste ile `erc20:<address>` biçimindedir ve adres, gösterilen tam EIP-55 karışık harf yazımında olmalıdır.** Birimler büyük/küçük harf duyarlıdır: `erc20:0x97143b771d34...` (küçük harf) farklı bir dizedir ve bunun için yapılan sorgu `404` yanıtı verir. Birimi, üç token'ı `symbol` (`fUSD`, `fETH`, `fBTC`), `display` adı (`FestUSD`, `FestETH`, `FestBTC`) ve ondalıklarıyla listeleyen `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` yanıtından kopyalayın.
* **Musluk bank coin'leri öder.** Bir Fest token'ını EVM'den (MetaMask, Solidity) kullanmak için önce bank coin'ini `MsgConvertCoin` ile ERC-20 biçimine dönüştürün; bir ERC-20 bakiyesini bank biçimine geri koymak için (örneğin AMM'de eşleştirmek üzere) `MsgConvertERC20` kullanın. İkisi de aşağıda anlatılmıştır.
* **Token'lar iki biçimde bulunur.** Bir ERC-20 bakiyesi, EVM JSON-RPC üzerinden sözleşmenin `balanceOf` fonksiyonuyla okunur; dönüştürülmüş bakiye ise `GET /cosmos/bank/v1beta1/balances/{address}` ile okunan bir bank coin'idir. AMM'de yalnızca bank coin biçimi eşleştirilebilir. Dönüştürme değeri iki biçim arasında taşır; yaratmaz.
* **Tutarlar token'ın kendi ondalıklarını kullanır** (fUSD, fETH ve fBTC için sırasıyla 6, 18 ve 8), `uqor`'un 6 ondalığını değil.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### İki biçim arasında dönüştürme {#fest-convert}

Her iki dönüştürme mesajı da Cosmos şeridi işlemleridir: kayıtlı kuantum-sonrası anahtarınızı ve hibrit ortak imzayı (cosign) her diğer yerel işlem gibi gerektirirler (oluşturun, ardından `qorechaind tx pqc cosign`; bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)). Ücretler en az gas × 0,1 uqor olmalıdır.

:::note Nelerin çalıştırıldığı
Bu sayfadaki REST okumaları (`token_pairs`, `denoms_metadata`) 27 Ekim 2026'da testnet'e karşı çalıştırıldı. Aşağıdaki iki dönüştürme komutu bu sayfa için uçtan uca **çalıştırılmadı**: mesaj biçimleri ve gönderici kuralı, v3.2.6 düğüm kaynağından ve zincir ekibinin başvuru belgesinden gelir. Bunları belgelenmiş biçim olarak değerlendirin ve önce küçük bir tutarla doğrulayın.
:::

**Bank coin'inden ERC-20'ye: `MsgConvertCoin`.** `coin`, tam ve büyük/küçük harf duyarlı bank birimidir (`erc20:<EIP-55 address>`), `sender` sizin `qor1...` adresinizdir (imzalayan), `receiver` ise ERC-20'yi tutacak `0x...` adresidir. Yaklaşık 432.000 gas kullanır; 600.000 gas sınırı belirleyin.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20'den bank coin'ine: `MsgConvertERC20`.** Bunun `sender` alanı da hesabın `qor1...` bech32 adresi olmalıdır. Bir `0x` göndericisi `decoding bech32 failed` ile reddedilir. v3.2.6 düğüm sürümünde `qorechaind tx erc20 convert-erc20` CLI komutu ([ERC-20 Token Çiftleri](#erc20-token-pairs) bölümündeki düz örnek) göndericiyi `0x` biçiminde yazar ve bu nedenle reddedilir: onu kullanmayın. Mesajı, yukarıdakiyle aynı şekilde, göndericisi `qor1` adresi olacak biçimde kendiniz oluşturun:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Burada `receiver`, bank coin'ini alan `qor1...` hesabıdır (modül, bank coin'ine dönüştürmenin alıcısı için bech32 biçimini kabul eder). Tutar, token'ın kendi taban birimlerindedir (6, 18 veya 8 ondalık). `MsgConvertCoin` için birimi yalnızca `denoms_metadata` yanıtından kopyalayın; küçük harfli biçim `token pair not found` ile reddedilir.

---

## PQC ve EVM Uyumluluğu

EVM işlemleri **klasik ECDSA (secp256k1)** ile imzalanır; bu nedenle MetaMask, Hardhat, Foundry, ethers.js ve diğer standart araçlar bunları değişiklik yapılmadan oluşturur ve imzalar. **v3.2.0** ile değişen şey *kabul (admission)* kuralıdır: bir işlem, yalnızca göndericisi kayıtlı bir kuantum-sonrası anahtara ve etkin bir yetkilendirme penceresine sahipse kabul edilir (sonraki bölüm). Bir anahtar kaydetmek ve pencere açmak Cosmos şeridi işlemleridir ve hibrit (ML-DSA-87 + secp256k1) imza gerektirir.

Sözleşmeler içinde kuantum-sonrası güvenlik için:

* **PQC Verify precompile'ı** (`0x0000...0A01`), Solidity'den zincir üzerinde ML-DSA-87 imzalarını doğrular. **Test ağında etkindir** (27 Ekim 2026'da kabul edilen yönetişim önerisi 21 ile etkinleştirildi) ve yazım sırasında ana ağda **etkin değildir**. Bkz. [EVM Precompile'ları: Ağ durumu](/developer-guide/evm-precompiles#network-status).
* EVM'den QoreChain Native veya SVM'ye giden **VM'ler arası mesajlar** Cosmos şeridi işlemleridir ve diğerleri gibi hibrit imza taşır; mevcut kullanılabilirlikleri için bkz. [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability).

---

## EVM yetkilendirme penceresi {#evm-window}

Kuantum-sonrası bir imza, bir Ethereum işlemiyle *birlikte* gidemez (MetaMask gibi cüzdanlar ikinci bir imza ekleyemez); bu yüzden işlemden *önce* gider. Hesap, Cosmos şeridi mesajı `MsgOpenEVMWindow` ile sınırlı bir pencere açar; ardından EVM şeridi yalnızca etkin bir pencerenin kapsadığı işlemleri kabul eder. Çalınmış klasik bir anahtar tek başına pencere açamaz, dolayısıyla yalnızca zaten açık olan bir pencerenin izin verdiği kadarını taşıyabilir.

| Sınır       | Aralık             | Anlamı |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17.280         | Pencerenin ne kadar açık kalacağı; pencereyi açan bloktan itibaren blok sayısıyla ölçülür |
| `max-txs`   | 1 – 1.000          | Kaç EVM işlemini kabul edeceği |
| `max-value` | 0'ın üzerinde, `uqor` cinsinden | Kabul ettiği toplam çıkış: aktarılan değer **artı** her işlemin ödeyebileceği azami ücret (gas limiti × gas başına azami ücret), `uqor`'a çevrilip yukarı yuvarlanır |

Hangi sınır önce tükenirse pencereyi o kapatır. Üç sınır da zorunludur; bir pencere açmak mevcut pencerenin yerini alır; kabul edilip sonra başarısız olan bir işlem yine de yuvasını ve değer bütçesini kullanır; sözleşme dağıtımları diğer işlemler gibi sayılır. `blocks` bir süre değil, blok sayısıdır: 17.280 blok ana ağda yaklaşık 15 saat (blok başına yaklaşık 3,1 sn), test ağında ise yaklaşık 6 saattir (27 Ekim 2026'da blok başına yaklaşık 1,3 sn; test ağı blok süresi değişir).

**Değer sınırı yalnızca yerel QOR'u sayar.** Bir token transferi, bir onay (approval) veya başka herhangi bir sözleşme çağrısı sıfır değer taşır; bu nedenle `max-value` karşısında sayılmaz (yalnızca azami ücreti sayılır). Bunları da sınırlamak için pencerenin **kapsamını (scope)** daraltın (ana ağ v3.2.3 ve sonrası):

| Kapsam seçeneği (CLI bayrağı) | Mesaj alanı | Pencerenin kabul ettiği |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Yalnızca yerel QOR'un düz transferleri: calldata yok, sözleşme oluşturma yok, kod taşıyan alıcı yok, EIP-7702 yetkilendirmesi yok |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Yalnızca alıcısı listelenen 20 baytlık adreslerden biri olan işlemler; sözleşme oluşturma reddedilir |

Kapsamsız açılmış bir pencere tam olarak eskisi gibi davranır. Kapsam dışındaki bir işlem 27 koduyla reddedilir (mesaj, pencerenin "bu işlemi kabul etmediğini" söyler). `GET /qorechain/pqc/v1/evm_window/{address}` ve `qorechaind query pqc evm-window`, `native_only` ve `allowed_targets` değerlerini raporlar; `pqc_evm_window_opened` olayı da bunlar ayarlıysa taşır.

**Adımlar** (tam anlatım [İlk İşleminiz](/getting-started/first-transaction#evm-window) sayfasındadır):

1. ML-DSA-87 anahtarınızı bir kez kaydedin (`tx pqc register-key-v2` veya `register-key`, `--gas 600000 --fees 60000uqor` ile; bu tek işlem hibrit gereksiniminden muaftır, böylece yeni bir hesap kendini başlatabilir). Bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Bir pencere açın. Bu bir Cosmos şeridi işlemidir; bu yüzden imzasız üretin ve ML-DSA anahtarınızla ortak imzalayın (`max-value`, `uqor` veya `qor` kabul eder; `1000qor` 1.000 QOR'dur):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Geriye ne kaldığını kontrol edin: `qorechaind query pqc evm-window <address>` veya `GET /qorechain/pqc/v1/evm_window/{address}` (pencere yoksa `found: false` yanıtı verir).
4. EVM işlemlerinizi normal şekilde gönderin. Bir pencere açmak bir Cosmos şeridi işlemidir ve hesabın sıra numarasını (sequence) ilerletir; bu aynı zamanda hesabın EVM nonce'udur, bu yüzden nonce'u pencere açıldıktan **sonra** okuyun ve imzayı o zaman atın.

Bir pencereyi erkenden `qorechaind tx pqc close-evm-window` ile kapatın (aynı `--generate-only` ve `cosign` düzeni), örneğin klasik anahtarın açığa çıktığından şüphelenirseniz: pencerenin hâlâ kabul edeceği her şey bir sonraki bloktan itibaren reddedilir.

### EIP-7702 delegasyonları {#eip-7702}

Hesabınızın bir EIP-7702 delegasyonu (type-4 işlem), v3.2.2'den beri yalnızca hesabınızın kendi kuantum-sonrası onayıyla yürürlüğe girer. Önce onayı, hibrit imzalı Cosmos şeridi mesajı `MsgAuthorizeEVMDelegation` ile kaydedin (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); tek kullanımlıktır, verilen blok sayısından sonra sona erer ve `close-evm-window` ile iptal edilir. Delege edilmiş bir hesaptan çıkan değer, **o** hesabın kendi penceresine yüklenir, başarısız bir type-4 işlem uyguladığı yetkilendirmeleri korur ve `qorechaind tx pqc clear-evm-delegation` bir delegasyonu kaldırır. Reddedilen bir delegasyon 60 ila 63 kodlarıyla yanıt verir. Onayı `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` ile okuyun.

| Ret (codespace `pqc`) | Anlamı |
| ------------------------- | ------- |
| code 26 | Gönderici için açık pencere yok veya göndericinin kayıtlı bir PQC anahtarı yok |
| code 27 | Pencerenin süresi dolmuş veya tükenmiş (mesaj hangi sınırın aşıldığını gösterir) ya da işlem pencerenin kapsamı dışında |
| code 28 | Pencere açılırken geçersiz sınırlar veya o anda kayıtlı anahtar yok |

TypeScript SDK ile (0.8.2 ve sonrası): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` ve `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). SDK 0.9.0, `openEvmWindowMsg`'ye kapsam seçeneklerini (`nativeOnly`, `allowedTargets`) ve EIP-7702 onay oluşturucularını (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`) ekler; 0.9.0 öncesi sürümler yalnızca kapsamsız pencereyi oluşturur, bu yüzden geri kalanı için `qorechaind` kullanın (bkz. [SDK EVM kılavuzu](/sdk/guides/evm#evm-window-scope)).

---

## Özel `qor_` Ad Alanı {#custom-qor_-namespace}

QoreChain, zincire özgü sorgular için JSON-RPC'yi bir `qor_` ad alanıyla genişletir:

:::warning Henüz sunulmuyor
Yayımlanmış hiçbir düğüm sürümü henüz `qor_` ad alanını sunmuyor: herkese açık uç noktalardaki `rpc_modules` yalnızca `eth`, `net`, `rpc`, `txpool` ve `web3`'ü listeler ve aşağıdaki her yöntem; ana ağda, test ağında ve varsayılan yapılandırmayla (`eth`, `net`, `web3`) kendi çalıştırdığınız düğümlerde `-32601` (yöntem bulunamadı) döndürür. Durum ve REST alternatifleri için (örneğin PQC anahtar durumu için `GET /qorechain/pqc/v1/account/{address}`) bkz. [`qor_` ad alanı](/api-reference/json-rpc-qor_-namespace).
:::

| Yöntem                       | Açıklama                                                          |
| ----------------------------- | ------------------------------------------------------------------ |
| `qor_getPQCKeyStatus`         | Bir hesabın kayıtlı bir PQC genel anahtarı olup olmadığını kontrol eder |
| `qor_getAIStats`              | Yapay zeka motoru istatistiklerini alır (anomali sayıları, risk dağılımı) |
| `qor_getCrossVMMessage`       | Bir VM'ler arası mesajın durumunu kimliğine göre sorgular          |
| `qor_getPoolClassification`   | Doğrulayıcı havuzu sınıflandırmasını alır (RPoS/DPoS/PoS)          |
| `qor_getReputationScore`      | Bir doğrulayıcının itibar puanını sorgular                          |
| `qor_getAbstractAccount`      | Soyut hesap yapılandırmasını alır                                   |

`curl` ile örnek:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Sonraki Adımlar

* [EVM Precompile'ları](/developer-guide/evm-precompiles) — QoreChain precompile arayüzleri için başvuru (testnet'te üçü etkin, mainnet'te hiçbiri etkin değil)
* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — VM'ler arası çağrılar ve mevcut kullanılabilirlikleri
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Bağlı cüzdan doğrulayıcıları ve harcama kuralları (testnet'te etkin, mainnet'te devre dışı)
