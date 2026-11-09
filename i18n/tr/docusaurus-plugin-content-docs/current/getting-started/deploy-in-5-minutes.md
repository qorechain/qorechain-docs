---
slug: /getting-started/deploy-in-5-minutes
title: QoreChain'de 5 Dakikada Dağıtım
sidebar_label: 5 Dakikada Dağıtım
sidebar_position: 6
---

# QoreChain'de 5 Dakikada Dağıtım

Bu sayfa, QoreChain'i daha önce hiç kullanmamış bir Solidity geliştiricisi içindir. Foundry veya Hardhat'i ve MetaMask için kullandığınız aynı kurtarma ifadesini olduğu gibi kullanmaya devam edersiniz. Tek yeni şey kısa bir **yetkilendirme penceresidir**: QoreChain her hesabı bir kuantum sonrası anahtarla korur, bir Ethereum işlemi böyle bir anahtarı taşıyamaz; bu yüzden önce sınırlı bir pencere açarsınız ve pencere açıkken normal EVM işlemleriniz kabul edilir. Aşağıdaki adımlar, hiçbir şeyin gerçek paraya mal olmadığı **test ağını** (`qorechain-diana`, EVM zincir kimliği 9800) kullanır.

:::note
Bu yol test ağında denendi: QoreX'te bir pencere açıldı, ardından aynı kurtarma ifadesinden Foundry `cast` ile bir sözleşme oluşturuldu ve çağrıldı. `forge create` ve Hardhat aynı türden bir EVM işlemi gönderir, ancak o denemenin parçası değildi. `qorechaind` komut satırından açılan bir pencere de doğrulanmıştır; bkz. [Alternatif: komut satırı](#cli).
:::

## Neye ihtiyacınız var {#what-you-need}

- Dağıtım yapmak istediğiniz hesabın kurtarma ifadesi. QoreX ham bir özel anahtarı içe aktaramaz. Yalnızca bir özel anahtarınız varsa bunun yerine [komut satırını](#cli) kullanın.
- QoreChain cüzdanı [QoreX](/qorex/overview) (uygulama veya tarayıcı eklentisi).
- Önceden kurulu Foundry veya Hardhat.

## 1. QoreX'e bir coin-60 hesabı ekleyin {#step-import}

QoreX hesapları varsayılan olarak coin türü 118'i kullanır ve coin-118 hesabında açılan bir pencere EVM araçları için işe yaramaz. Bir **Ethereum hesabına (coin 60)** ihtiyacınız var. QoreX'te **Hesaplarınız** bölümünü açın ve **Ethereum hesabı ekle (coin 60)** düğmesine dokunun. QoreX bu hesabı, cüzdanın **kendi kurtarma ifadesinden** `m/44'/60'` Ethereum yoluyla türetir. Onun `0x…` adresi, MetaMask veya Foundry'deki adresle yalnızca onlar da aynı ifadeyi kullandığında aynıdır (Foundry için türetme yolu `m/44'/60'/0'/0/0`, dizin 0). MetaMask hesabınız farklı bir ifadeden geliyorsa QoreX farklı bir adres gösterir ve orada açılan bir pencere dağıtımda kullandığınız anahtarı kapsamaz. `0x…` adresi, QoreChain'deki bir `qor1…` adresiyle aynı anahtardır.

Hesabın kendi adresi vardır; bu yüzden sonraki adımlardan önce onu fonlayın ve QoreX'te seçin. Bkz. [MetaMask'ten veya Dashboard'dan bir ifadeyi geri yükleyin](/qorex/getting-started#restore-dashboard).

:::caution Üretim ifadesini asla geliştirme araçlarına yapıştırmayın
Test için oluşturulmuş, yalnızca test QOR'u olan bir kurtarma ifadesi kullanın. Gerçek fon tutan bir hesabın ifadesini Foundry'ye, Hardhat'e veya bir betiğe yazmayın.
:::

## 2. QoreX'i test ağına geçirin {#step-testnet}

- **Uygulama:** Ayarlar → **Test ağını kullan (geliştiriciler)**.
- **Tarayıcı eklentisi:** eklentinin kilidini açın, alttaki sürüm numarasına yedi kez dokunun, ardından **Test ağına geç (diana)** seçeneğini seçin.

Ana ekrandaki ağ rozeti TESTNET olarak değişir.

## 3. Test ağı QOR'u alın {#step-faucet}

`0x…` veya `qor1…` adresiniz için [Dashboard Faucet](/dashboard/faucet) üzerinden test ağı QOR'u isteyin. Adresin her iki biçiminde de bakiye aynıdır.

## 4. QoreX'te EVM penceresini açın {#step-window}

- **Eklenti ve uygulama:** ana açılır pencerede veya Ana ekranda **MetaMask on QoreChain** başlıklı kart (**0x** işaretiyle). Bu, **EVM erişim penceresi** ekranını açar.
- **Uygulama:** ayrıca Ayarlar → Güvenlik → **EVM erişim penceresi**.

Bu hesabın henüz kuantum sonrası anahtarı yoksa QoreX bu adımda onu sizin yerinize kaydeder. Kayıt hesap başına bir kez 0.09 QOR tutar ve pencere işlemi bunun üstüne kendi ağ ücretini öder. Ardından üç sınır seçersiniz:

| Alan | Aralık | QoreX varsayılanı |
|---|---|---|
| Blok (pencerenin ne kadar açık kalacağı) | 1 – 17,280 | 300 |
| En fazla işlem | 1 – 1,000 | 5 |
| Harcama sınırı, QOR cinsinden | 0'dan büyük | 1 |

Harcama sınırı, her işlemin değerini **artı azami ücretini** (gaz limiti çarpı ücret üst sınırı) sayar; yalnızca aktardığı tutarı değil. Bir sözleşme dağıtımı hiç QOR taşımaz ama yine de azami ücretini sayar: Hardhat'in gönderdiği 3,000,000 gazlık bir dağıtım yaklaşık 0.64 QOR sayılır.

Bir dağıtım oturumu için varsayılanlar çok küçüktür. Makul bir seçim 3,000 blok (test ağında yaklaşık bir saat), 20 işlem ve 10 QOR sınırıdır. Bunları oturumunuzun izin verdiği kadar küçük tutun ve işiniz bitince pencereyi kapatın.

:::caution Önce pencereyi açın
Pencere açmak hesap nonce'unu ilerletir. Dağıtımdan **önce** açın: daha önce imzalanmış bir işlem "nonce too low" ile reddedilir.
:::

## 5. Foundry veya Hardhat ile dağıtın {#step-deploy}

**Aynı fonlu coin-60 hesabının** anahtarını kullanın. QoreX bir Foundry imzalayıcısı olarak çalışamaz, bu yüzden Foundry'ye veya Hardhat'e aynı kurtarma ifadesinden gelen anahtarı verin; örneğin Foundry'de 0 dizini ile `--mnemonic`. Ağ ayarları:

| Ayar | Değer |
|---|---|
| RPC URL | `https://evm-testnet.qore.host` |
| Zincir kimliği | `9800` |
| Para birimi | QOR, 18 ondalık |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Gönderdiğiniz her işlem (dağıtım veya çağrı) pencerenin işlemlerinden birini kullanır. Okumalar (`cast call`, view fonksiyonları, gaz tahmini) pencere gerektirmez ve pencereden hiçbir şey tüketmez.

## Pencereyi kontrol edin ve süre dolumunu yönetin {#check-and-expiry}

Bir pencerenin **süresi dolar**: blokları, işlemleri veya harcama sınırı tükendiğinde EVM hattı bir sonraki işleminizi `no open EVM authorisation window` veya `EVM authorisation window exhausted` ile reddeder. QoreX'te yeni bir tane açın; yeni pencere eskisinin yerini alır.

Durumunu görmek için [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) adresindeki **PQ key status** sekmesini ([Geliştiriciler](/dashboard/developers) sayfasına bakın) veya REST yolunu kullanın:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`remaining_blocks`, `remaining_txs` ve `remaining_value` (`uqor` cinsinden) ile birlikte `live: true` penceresinin açık olduğu anlamına gelir.

## Alternatif: komut satırı {#cli}

`qorechaind` sürüm ikili dosyasıyla QoreX olmadan ham bir özel anahtarı içe aktarabilir, onun kuantum sonrası anahtarını kaydedebilir ve pencereyi açabilirsiniz. Bu, yalnızca bir özel anahtarı olan geliştirici için izlenecek yoldur. `gen-key` ve `cosign` topluluk derlemesinde yoktur; bu yüzden sürüm ikili dosyası gerekir. Pencere kuralları, [EVM Geliştirme](/developer-guide/evm-development) sayfasının [EVM yetkilendirme penceresi](/developer-guide/evm-development#evm-window) bölümündedir. Bu şekilde açılan bir pencere ve ardından `cast` ile gönderilen bir işlem test ağında doğrulanmıştır.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Bir dağıtım penceresini `--native-only` veya `--allowed-targets` ile daraltmayın: ikisi de sözleşme oluşturmayı reddeder. Bunlar, sözleşme var olduktan sonraki oturumlar içindir.

## Test ağında ne farklı {#diana-notes}

- **CosmWasm** test ağında yalnızca yönetişimle onaylanmış kodları kabul eder; bu yüzden orada kendi sözleşmenizi yükleyemezsiniz. Açık yol Solidity'dir.
- **SVM** kullanılamaz.
- Ana ağ aynı şekilde çalışır; zincir kimliği 9801 ve `https://evm.qore.host` kullanılır, ancak test ağıyla başlayın.

## Yaygın hatalar {#errors}

| Mesaj | Neden | Çözüm |
|---|---|---|
| `account ... has no registered post-quantum key` | hesabın ML-DSA-87 anahtarı yok | QoreX'te bir pencere açın (anahtarı kaydeder) veya komut satırından kaydedin |
| `no open EVM authorisation window` | pencere yok veya süresi doldu | bir pencere açın |
| `EVM authorisation window exhausted` | işlemler veya harcama sınırı tükendi | daha büyük sınırlarla yeni bir pencere açın |
| `nonce too low` | pencere, siz imzaladıktan sonra açıldı | önce pencereyi açın, sonra gönderin |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | zincir kimliği olmadan imzalanmış bir işlem | ağ yapılandırmanızda `chainId` değerini ayarlayın |

Sıradaki: [EVM Geliştirme](/developer-guide/evm-development), [QoreX güvenliği ve kurtarma](/qorex/security-and-recovery#evm-window), [Geliştiriciler](/dashboard/developers).
