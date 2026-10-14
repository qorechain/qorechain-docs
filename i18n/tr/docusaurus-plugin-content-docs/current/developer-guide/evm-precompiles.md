---
slug: /developer-guide/evm-precompiles
title: EVM Ön Derlemeleri
sidebar_label: EVM Ön Derlemeleri
sidebar_position: 6
---

# EVM Ön Derlemeleri

QoreChain, QoreChain EVM Engine'i protokol düzeyindeki özellikleri doğrudan Solidity'ye sunan **altı özel ön derlenmiş contract** ile genişletir. Bu ön derlemeler; kuantum sonrası kriptografiye, AI risk puanlamasına, VM'ler arası mesajlaşmaya ve PRISM konsensüs parametrelerine zincir üzerinde erişim sağlar.

:::warning Ana ağda ve test ağında henüz etkin değil
Aşağıdaki altı QoreChain ön derlemesi **düğüme derlenmiştir ancak henüz etkinleştirilmemiştir**; bu hem **`qorechain-vladi`** ana ağı (EVM zincir kimliği **9801**) hem de **`qorechain-diana`** test ağı (EVM zincir kimliği **9800**) için geçerlidir. EVM yalnızca `active_static_precompiles` parametresinde listelenen adresleri çalıştırır ve bu liste her iki ağda da boştur. Bir zincir yükseltmesi bunları etkinleştirene kadar, bu adreslere yapılan bir çağrı **başarılı olur ve boş veri (`0x`) döndürür**; geri alınmaz (revert) ve hata döndürmez. Herhangi birine güvenmeden önce [Ağ durumu](#network-status) bölümüne bakın.
:::

## Ağ durumu {#network-status}

| Ön derleme | Adres | `qorechain-vladi` (ana ağ) | `qorechain-diana` (test ağı) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Etkin değil | Etkin değil |
| PQC Key Status | `0x…0A02` | Etkin değil | Etkin değil |
| AI Risk Score | `0x…0B01` | Etkin değil | Etkin değil |
| AI Anomaly Check | `0x…0B02` | Etkin değil | Etkin değil |
| PRISM Consensus Params | `0x…0C01` | Etkin değil | Etkin değil |
| CrossVM Bridge | `0x…0901` | Etkin değil | Etkin değil |

Etkinleştirme bir zincir yükseltmesi gerektirir ve aşamalı olarak planlanmıştır: önce salt okunur PQC ve konsensüs ön derlemeleri, salt okunur sabit noktalı yolları hazır olduğunda AI çifti ve CrossVM köprüsü ise yalnızca journaling, değer kontrolleri ve VM'ler arası devre kesiciyle yeniden inşa edildikten sonra. Bu tablo, herhangi birini etkinleştiren yükseltmeyle aynı işlemde güncellenir.

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

---

## Ön Derleme Adres Haritası

Gaz rakamları, bir ön derleme etkin olduktan sonra düğümün tahsil ettiği değerlerdir (bayt başına, çağrı girişinin bayt başına anlamına gelir).

| Ön Derleme              | Adres                                      | Temel Gaz        | Açıklama                                      |
| ----------------------- | -------------------------------------------- | --------------- | ------------------------------------------------ |
| **CrossVM Bridge**      | `0x0000000000000000000000000000000000000901` | 50,000 + 4/byte | Senkron VM'ler arası çağrılar (EVM'den CosmWasm'a)     |
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

**Gaz maliyeti:** 1,500 sabit.

:::note
Mevcut düğüm derlemesinde `rlConsensusParams`, canlı PRISM ile ayarlanmış değerler değil, sabit yer tutucu varsayılanlar döndürür (örneğin ölçülen blok süresini bildirmez; bu süre ana ağda yaklaşık 3,2 sn, test ağında yaklaşık 1,0 sn'dir). Bunu canlı konsensüs parametrelerine bağlamak etkinleştirme çalışmasının bir parçasıdır.
:::

### CrossVM Bridge — EVM'den CosmWasm Çağırma

:::warning
CrossVM köprü ön derlemesi mevcut haliyle **etkinleştirilmeyecektir**. Çağıran sözleşmedeki bir revert'in CosmWasm tarafını da geri alması, değer transferlerinin reddedilmesi, EVM'den EVM'ye yeniden girişin (re-entry) engellenmesi ve VM'ler arası devre kesicinin uygulanması için yeniden inşa edilmektedir. O zamana kadar senkron bir EVM'den CosmWasm'a yol yoktur; bugün mainnet'te kendisi de kapalı olan `MsgCrossVMCall` mesaj yolu için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) bölümüne bakın.
:::

Düğüm, calldata'yı `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` olarak çözümler (4 baytlık seçici, ardından ABI ile kodlanmış argümanlar). Belgelenen kullanım EVM'den CosmWasm'adır; ABI yeniden inşayla değişebilir.

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
* [Hesap Soyutlaması](/developer-guide/account-abstraction) — Bağlı cüzdan yetkilendiricileri ve harcama kuralları (modül şu anda devre dışı)
