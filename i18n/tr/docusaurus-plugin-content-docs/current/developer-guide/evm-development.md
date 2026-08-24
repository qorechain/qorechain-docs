---
slug: /developer-guide/evm-development
title: EVM Geliştirme
sidebar_label: EVM Geliştirme
sidebar_position: 2
---

# EVM Geliştirme

QoreChain, QoreChain EVM Motoru üzerinde tam EVM uyumlu bir yürütme ortamı çalıştırır ve bu sayede tanıdık araçları kullanarak Solidity akıllı sözleşmelerini dağıtmanıza ve onlarla etkileşime geçmenize olanak tanır. EVM modülü, standart Ethereum geliştirme iş akışlarını destekleyen bir JSON-RPC arayüzünü **8545 portunda** (WebSocket için **8546** portunda) sunar.

:::note
Aşağıdaki örnekler, 7 Haziran 2026'dan beri canlı olan ve **v3.1.92** zincir sürümünü çalıştıran **`qorechain-vladi`** ana ağını (EVM zincir kimliği **9801**) hedef almaktadır. **`qorechain-diana`** test ağı için EVM zincir kimliği **9800**'ü kullanın.
:::

---

## JSON-RPC Uç Noktası

| Özellik               | Değer                                      |
| ---------------------- | ------------------------------------------ |
| Varsayılan URL          | `http://localhost:8545`                    |
| WebSocket URL           | `ws://localhost:8546`                      |
| Desteklenen ad alanları | `eth_`, `web3_`, `net_`, `txpool_`, `qor_` |
| Zincir kimliği (ana ağ) | `9801` (`qorechain-vladi`)                 |
| Zincir kimliği (test ağı) | `9800` (`qorechain-diana`)               |
| Para birimi sembolü     | `QOR`                                      |

`qor_` ad alanı, QoreChain'e özgü yöntemler sağlar. Aşağıdaki [Özel Ad Alanı](#custom-qor_-namespace) bölümüne bakın.

---

## Cüzdan Yapılandırması (MetaMask)

QoreChain'i MetaMask'e özel bir ağ olarak ekleyin:

| Alan                | Ana Ağ Değeri              | Test Ağı Değeri         |
| ------------------- | -------------------------- | ------------------------ |
| Ağ Adı               | QoreChain (qorechain-vladi) | QoreChain Diana         |
| RPC URL              | `http://localhost:8545`    | `http://localhost:8545` |
| Zincir Kimliği       | `9801`                     | `9800`                   |
| Para Birimi Sembolü  | `QOR`                      | `QOR`                    |
| Blok Gezgini URL'si  | *(resmi ana ağ gezginini kullanın)* | *(yerel test ağı için boş bırakın)* |

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

Bir sözleşmeyi dağıtın:

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

## ERC-20 Token Çiftleri

`x/erc20` modülü, yerel Cosmos SDK birimleri ile ERC-20 sözleşmeleri arasında **token çiftlerinin** otomatik olarak kaydedilmesini sağlar:

* Yerel token'lar EVM sözleşmeleri içinde ERC-20 olarak kullanılabilir
* EVM üzerinde dağıtılan ERC-20 token'ları yerel birimlere dönüştürülebilir
* Dönüşüm çift yönlüdür ve protokol seviyesinde gerçekleştirilir

```bash
# Register a new token pair (governance proposal)
qorechaind tx erc20 register-coin <denom> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey
```

---

## PQC ve EVM Uyumluluğu

EVM işlemleri, mevcut Ethereum araçları, cüzdanları ve kütüphaneleriyle tam uyumluluk için **klasik ECDSA (secp256k1)** imzalarını kullanır. Bu, MetaMask, Hardhat, Foundry, ethers.js ve tüm standart EVM araçlarının değişiklik yapılmadan çalışmasını sağlar.

EVM içinde kuantum-sonrası güvenlik için:

* Solidity'den zincir üzerinde ML-DSA-87 imzalarını doğrulamak üzere **PQC Verify precompile'ını** (`0x0000...0A01`) kullanın. Bkz. [EVM Precompile'ları](/developer-guide/evm-precompiles).
* EVM'den CosmWasm veya SVM'ye giden **VM'ler arası mesajlar**, Cosmos SDK işlem katmanında PQC ile imzalanabilir.
* Hesaplar, hibrit güvenlik için isteğe bağlı olarak `x/pqc` üzerinden PQC genel anahtarları kaydedebilir.

---

## Özel `qor_` Ad Alanı {#custom-qor_-namespace}

QoreChain, zincire özgü sorgular için JSON-RPC'yi bir `qor_` ad alanıyla genişletir:

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

* [EVM Precompile'ları](/developer-guide/evm-precompiles) — Solidity'den PQC, yapay zeka ve VM'ler arası özelliklere erişin
* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — EVM'den CosmWasm ve SVM sözleşmelerini çağırın
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Oturum anahtarlarıyla programlanabilir hesaplar
