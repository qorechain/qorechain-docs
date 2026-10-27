---
slug: /developer-guide/evm-precompiles
title: EVM Ön Derlemeleri
sidebar_label: EVM Ön Derlemeleri
sidebar_position: 6
---

# EVM Ön Derlemeleri

QoreChain, QoreChain EVM Engine'i protokol düzeyindeki özellikleri doğrudan Solidity'ye sunan **altı özel ön derlenmiş contract** ile genişletir. Bu ön derlemeler; kuantum sonrası kriptografiye, AI risk puanlamasına, VM'ler arası mesajlaşmaya ve PRISM konsensüs parametrelerine zincir üzerinde erişim sağlar.

:::warning Ana ağda etkin değil; test ağında üçü etkin
Aşağıdaki altı QoreChain ön derlemesi **düğüme derlenmiştir**, ancak EVM yalnızca `active_static_precompiles` parametresinde listelenen adresleri çalıştırır. **`qorechain-vladi`** ana ağında (EVM zincir kimliği **9801**) bu liste yazım sırasında boştur, dolayısıyla orada **hiçbiri etkin değildir**. **`qorechain-diana`** test ağında (EVM zincir kimliği **9800**) üçü etkindir: PQC Verify, PQC Key Status ve PRISM Consensus Params; bunlar test ağı yönetişim önerisi 21 ile etkinleştirildi (27 Ekim 2026'da geçti). Diğer üçü her iki ağda da etkin değildir. Listede olmayan bir adrese yapılan çağrı **başarılı olur ve boş veri (`0x`) döndürür**; geri alınmaz (revert) ve hata döndürmez. Herhangi birine güvenmeden önce [Ağ durumu](#network-status) bölümüne bakın.
:::

## Ağ durumu {#network-status}

| Ön derleme | Adres | `qorechain-vladi` (ana ağ) | `qorechain-diana` (test ağı) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Etkin değil | **Etkin** (27 Ekim 2026'dan beri) |
| PQC Key Status | `0x…0A02` | Etkin değil | **Etkin** (27 Ekim 2026'dan beri) |
| AI Risk Score | `0x…0B01` | Etkin değil | Etkin değil |
| AI Anomaly Check | `0x…0B02` | Etkin değil | Etkin değil |
| PRISM Consensus Params | `0x…0C01` | Etkin değil | **Etkin** (27 Ekim 2026'dan beri) |
| CrossVM Bridge | `0x…0901` | Etkin değil | Etkin değil |

Durum, 27 Ekim 2026'da canlı `active_static_precompiles` parametresinden okunduğu gibidir. Bu, yönetişimle değiştirilen bir zincir parametresidir; dolayısıyla her ağın listesi yalnızca bir yönetişim önerisi geçtiğinde değişir: test ağı listesi öneri 21 ile belirlendi ve yazım sırasında hiçbir ana ağ önerisi onu değiştirmiyor. v3.2.3 sürümü (ana ağ, 20 Ekim 2026), CrossVM köprüsünün ve AI anomali ön derlemesinin güçlendirilmiş sürümlerini bir protokol özelliğinin arkasında ikili dosyaya koydu, ancak hiçbir ön derlemeyi etkinleştirmedi ve v3.2.4 (ana ağda 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri) bunu değiştirmez. Önce salt okunur PQC ve konsensüs ön derlemeleri gelir, salt okunur sabit noktalı yolları hazır olduğunda AI çifti ve en son CrossVM köprüsü. Bu tablo yalnızca uygulanmış olanı listeler: hâlâ oylama döneminde olan bir öneri bir durum değildir.

Güncel listeyi kendiniz kontrol edin (boşsa hiçbiri etkin değildir):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Boş dönüş verisine karşı koruma {#guard}

Etkin olmayan (veya QoreChain'e ait olmayan) bir adres veri olmadan başarı döndürdüğü için, düşük seviyeli bir çağrının ham dönüş baytlarını uzunluklarını kontrol etmeden asla okumayın. `abi.decode` ve tipli arayüz çağrıları boş veride revert eder, bu da güvenli sonuçtur; elle yazılmış düşük seviyeli bir çağrı bunu açıkça kontrol etmelidir:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

Bu adreslere değer göndermeyin. Bunlar payable değildir ve etkin olmayan bir ön derleme adresine gönderilen değer orada kalır ve geri alınmasının bir yolu yoktur.

Test ağında, etkin üç ön derlemenin yanıt verdiğini hızlıca denetlemek için (Foundry'nin `cast` aracıyla; ana ağda bu adresler bunun yerine boş veri döndürür):

```bash
RPC=https://evm-testnet.qore.host
cast call 0x0000000000000000000000000000000000000C01 "rlConsensusParams()(uint256,uint256,uint256,uint256)" --rpc-url $RPC
cast call 0x0000000000000000000000000000000000000A02 "pqcKeyStatus(address)(bool,uint8,bytes,bool)" 0x0000000000000000000000000000000000000001 --rpc-url $RPC
```

---

## Ön Derleme Adres Haritası

Gaz rakamları, bir ön derleme etkin olduktan sonra düğümün tahsil ettiği değerlerdir (bayt başına, çağrı girişinin bayt başına anlamına gelir).

| Ön Derleme              | Adres                                      | Temel Gaz        | Açıklama                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | Senkron VM'ler arası çağrılar (EVM'den QoreChain Native'a)     |
| **PQC Verify**          | `0x0000000000000000000000000000000000000A01` | 25,000 + 8/byte | ML-DSA-87 kuantum sonrası imzalarını doğrular         |
| **PQC Key Status**      | `0x0000000000000000000000000000000000000A02` | 2,500           | Bir hesabın kayıtlı bir PQC anahtarı olup olmadığını kontrol eder     |
| **AI Risk Score**       | `0x0000000000000000000000000000000000000B01` | 50,000          | İşlem verileri için AI tarafından oluşturulan risk puanını alır |
| **AI Anomaly Check**    | `0x0000000000000000000000000000000000000B02` | 40,000          | Bir transferin anormal olarak işaretlenip işaretlenmediğini kontrol eder      |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1,500        | Mevcut PRISM ile ayarlanmış konsensüs parametrelerini okur    |

---

## Solidity Arayüzleri

### IQorePQC.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQorePQC {
    /// @notice Verify an ML-DSA-87 (Dilithium-5) signature
    /// @param pubkey The 2592-byte ML-DSA-87 public key
    /// @param signature The 4627-byte ML-DSA-87 signature
    /// @param message The original message bytes
    /// @return valid True if the signature is valid
    function pqcVerify(
        bytes calldata pubkey,
        bytes calldata signature,
        bytes calldata message
    ) external view returns (bool valid);

    /// @notice Check if an account has a registered PQC public key
    /// @param account The Ethereum-style address to check
    /// @return registered True if a PQC key is registered
    /// @return algorithmId The PQC algorithm identifier (1 = ML-DSA-87)
    /// @return pubkey The registered public key bytes (empty if not registered)
    function pqcKeyStatus(address account)
        external
        view
        returns (bool registered, uint8 algorithmId, bytes memory pubkey);
}
```

v3.2.4'ten itibaren (ana ağda 23 Ekim 2026'dan beri, test ağında 19 Ekim 2026'dan beri), `pqcKeyStatus` çıktısı `pubkey` değerinden sonra dördüncü bir değer taşır, `bool possessionProven`: hesabın geçerli anahtarının doğrulanmış bir sahiplik kanıtıyla kanıtlanıp kanıtlanmadığı (bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing#proof-of-possession)). Ön derlemenin etkin olduğu her yerde döndürülür: test ağında canlıdır (anahtarı olmayan bir hesap için yapılan çağrı `false, 0, 0x, false` döndürür), ana ağda ise bir yükseltme ön derlemeyi etkinleştirdiğinde. Yukarıdaki arayüz ilk üç çıktıyı listeler; anahtara güvenmesi gereken bir sözleşme dördüncüyü de okumalıdır.

### IQoreAI.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQoreAI {
    /// @notice Get the AI-generated risk score for transaction data
    /// @param txData The transaction data to evaluate
    /// @return score Risk score in basis points (0-10000)
    /// @return level Risk level: 0=SAFE, 1=LOW, 2=MEDIUM, 3=HIGH, 4=CRITICAL
    function aiRiskScore(bytes calldata txData)
        external
        view
        returns (uint256 score, uint8 level);

    /// @notice Check if a transfer is flagged as anomalous
    /// @param sender The sender address
    /// @param amount The transfer amount in wei
    /// @return anomalyScore The anomaly score (higher = more anomalous)
    /// @return flagged True if the transfer exceeds the anomaly threshold
    function aiAnomalyCheck(address sender, uint256 amount)
        external
        view
        returns (uint256 anomalyScore, bool flagged);
}
```

### IQoreConsensus.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQoreConsensus {
    /// @notice Get current PRISM-tuned consensus parameters
    /// @return blockTime Current target block time in milliseconds
    /// @return baseGasPrice Current base gas price in wei
    /// @return validatorSetSize Current active validator set size
    /// @return epoch Current PRISM epoch number
    function rlConsensusParams()
        external
        view
        returns (
            uint256 blockTime,
            uint256 baseGasPrice,
            uint256 validatorSetSize,
            uint256 epoch
        );
}
```

---

## Kullanım Örnekleri

### PQC Verify — Kuantum Sonrası Bir İmzayı Doğrulama

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IQorePQC.sol";

contract PQCVerifier {
    IQorePQC constant PQC = IQorePQC(0x0000000000000000000000000000000000000A01);

    /// @notice Verify a PQC signature and revert if invalid
    function verifyOrRevert(
        bytes calldata pubkey,
        bytes calldata signature,
        bytes calldata message
    ) external view {
        bool valid = PQC.pqcVerify(pubkey, signature, message);
        require(valid, "PQC signature verification failed");
    }
}
```

**Gaz maliyeti:** 25,000 temel + giriş verisinin baytı başına 8 gaz. Giriş, ABI ile kodlanmış çağrıdır (2592 baytlık açık anahtar, 4627 baytlık imza, mesaj, artı ABI ofsetleri ve dolgu), bu nedenle tipik bir ML-DSA-87 doğrulaması yaklaşık 85,000-90,000 gaza mal olur.

### PQC Key Status — Hesap Kaydını Kontrol Etme

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Gaz maliyeti:** 2,500 sabit.

### AI Risk Score — İşlem Riskini Değerlendirme

```solidity
import "./interfaces/IQoreAI.sol";

contract RiskGate {
    IQoreAI constant AI = IQoreAI(0x0000000000000000000000000000000000000B01);

    uint8 constant MAX_ALLOWED_RISK = 2; // Allow up to MEDIUM

    function executeIfSafe(bytes calldata txData) external {
        (uint256 score, uint8 level) = AI.aiRiskScore(txData);
        require(level <= MAX_ALLOWED_RISK, "Risk level too high");

        // Proceed with execution...
    }
}
```

**Risk seviyeleri:**

| Seviye    | Değer |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

Seviye, AI motorunun işlem için verdiği önem derecesi etiketinden gelir; puan baz puan (basis points) cinsinden döndürülür (0 - 10000). Puan aralıklarından seviyelere sabit bir eşleme yoktur, bu yüzden puan eşikleri yerine `level` üzerinden kapı koyun.

**Gaz maliyeti:** 50,000 sabit.

### AI Anomaly Check — Şüpheli Transferleri İşaretleme

```solidity
contract AnomalyGuard {
    IQoreAI constant AI = IQoreAI(0x0000000000000000000000000000000000000B02);

    function safeTransfer(address sender, uint256 amount) external view {
        (uint256 anomalyScore, bool flagged) = AI.aiAnomalyCheck(sender, amount);

        if (flagged) {
            revert("Transfer flagged as anomalous");
        }
    }
}
```

**Gaz maliyeti:** 40,000 sabit.

### PRISM Consensus Params — Konsensüs Durumunu Okuma

```solidity
contract ConsensusReader {
    IQoreConsensus constant RL = IQoreConsensus(
        0x0000000000000000000000000000000000000C01
    );

    function getBlockTime() external view returns (uint256) {
        (uint256 blockTime, , , ) = RL.rlConsensusParams();
        return blockTime;
    }

    function getCurrentEpoch() external view returns (uint256) {
        (, , , uint256 epoch) = RL.rlConsensusParams();
        return epoch;
    }
}
```

**Gaz maliyeti:** 1,500 sabit, artı çağrının yaptığı durum okumaları standart maliyetle.

:::note Dört değerin anlamı
v3.2.6'dan itibaren (test ağı; henüz ana ağda değil) `rlConsensusParams`, sabit yer tutucular yerine `rlconsensus` modülünün tuttuğu değerleri döndürür: uygulanan blok süresi hedefi (milisaniye), uygulanan gaz fiyatı tabanı, modülün `default_validator_set_size` değeri ve ajanın geçerli epoch'u. Test ağında 27 Ekim 2026'da `5000`, `100`, `100`, `1` döndürdü (`GET /qorechain/rlconsensus/v1/applied_params` ile aynı uygulanan değerler, bkz. [REST / gRPC Uç Noktaları](/api-reference/rest-grpc-endpoints#rlconsensus-module)). Bunlar modülün kendi ayarlarıdır, **ölçülen blok süresi değildir** (ana ağda yaklaşık 3,1 sn, test ağında yaklaşık 1,3 sn) ve ajan test ağında gölge modunda çalışır, dolayısıyla hiçbir şey uygulamaz. v3.2.6'dan eski bir düğümde aynı çağrı sabit yer tutucu varsayılanlar döndürür.
:::

### CrossVM Bridge — EVM'den QoreChain Native Çağırma

:::warning
CrossVM köprü ön derlemesi her iki ağda da **etkin değildir**. v3.2.3'ten beri ikili dosya, onun güçlendirilmiş bir sürümünü taşır: `STATICCALL` çağrısını reddeder; iç içe çağrıyı, çağıran çerçevede kalan gazla sınırlı bir gaz sayacında çalıştırır ve günlüğe kaydeder, böylece çağıran sözleşmedeki bir revert QoreChain Native tarafını da geri alır; yalnızca izin listesindeki QoreChain Native hedeflerine ulaşır (EVM hedefleri reddedilir); ve VM'ler arası devre kesiciye uyar. Yönetişim onaylı bir yükseltme onu etkinleştirene kadar senkron bir EVM'den QoreChain Native'a yol yoktur; bugün ana ağda kendisi de kapalı olan `MsgCrossVMCall` mesaj yolu için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) bölümüne bakın.
:::

Düğüm, calldata'yı `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` olarak çözümler (4 baytlık seçici, ardından ABI ile kodlanmış argümanlar). Desteklenen tek kullanım EVM'den QoreChain Native'adır (`targetVM` = 1); ABI etkinleştirmeden önce yine de değişebilir. `@qorechain/rdk` yardımcısı `encodeCrossVmCalldata` bu düzeni 0.6.0'dan itibaren kodlar (önceki sürümler farklı bir fonksiyonu kodluyordu) ve `isCrossVmPrecompileActive` canlı `active_static_precompiles` listesini okur; bkz. [Multi-VM](/rollups/multi-vm).

**Gaz maliyeti:** 50,000 temel + giriş baytı başına 4 gaz, artı hedef sözleşme yürütme maliyeti. Ayrıntılar için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) bölümüne bakın.

---

## Arayüz Dosyası Konumları

Solidity arayüz dosyaları, doğrudan içe aktarma için depoda mevcuttur:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Bunları Hardhat veya Foundry projenize kurun:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Veya bunlara Solidity dosyalarınızda içe aktarma yolu aracılığıyla başvurun:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Sonraki Adımlar

* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — Tam VM'ler arası mesajlaşma belgeleri
* [EVM Geliştirme](/developer-guide/evm-development) — Solidity sözleşmelerini dağıtma
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Bağlı cüzdan yetkilendiricileri ve harcama kuralları (test ağında etkin, ana ağda devre dışı)
