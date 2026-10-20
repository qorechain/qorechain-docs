---
slug: /developer-guide/evm-precompiles
title: Precompilate EVM
sidebar_label: Precompilate EVM
sidebar_position: 6
---

# Precompilate EVM

QoreChain extinde motorul QoreChain EVM Engine cu **șase contracte precompilate personalizate** care expun funcționalități la nivel de protocol direct în Solidity. Aceste precompilate oferă acces on-chain la criptografie post-cuantică, scoring de risc bazat pe AI, mesagerie cross-VM și parametrii de consens PRISM.

:::warning Încă neactive pe mainnet sau testnet
Cele șase precompilate QoreChain de mai jos sunt **compilate în nod, dar încă neactivate**, nici pe mainnet-ul **`qorechain-vladi`** (ID chain EVM **9801**), nici pe testnet-ul **`qorechain-diana`** (ID chain EVM **9800**). EVM-ul execută doar adresele din parametrul `active_static_precompiles`, iar această listă este goală pe ambele rețele. Până când un upgrade al lanțului le activează, **un apel către aceste adrese reușește și întoarce date goale (`0x`)**; nu face revert și nu întoarce o eroare. Vezi [Starea rețelei](#network-status) înainte de a te baza pe oricare dintre ele.
:::

## Starea rețelei {#network-status}

| Precompilat | Adresă | `qorechain-vladi` (mainnet) | `qorechain-diana` (testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Neactiv | Neactiv |
| PQC Key Status | `0x…0A02` | Neactiv | Neactiv |
| AI Risk Score | `0x…0B01` | Neactiv | Neactiv |
| AI Anomaly Check | `0x…0B02` | Neactiv | Neactiv |
| PRISM Consensus Params | `0x…0C01` | Neactiv | Neactiv |
| CrossVM Bridge | `0x…0901` | Neactiv | Neactiv |

Activarea necesită un upgrade al lanțului și este planificată în etape: mai întâi precompilatele PQC și de consens, doar pentru citire, apoi perechea AI, odată ce calea lor de citire, în virgulă fixă, este pusă la punct, iar puntea CrossVM la final. Versiunea v3.2.3 (mainnet, 20 octombrie 2026) a introdus în binar, în spatele unei funcționalități de protocol, versiunile întărite ale punții CrossVM și ale precompilatului AI de anomalii, **dar nu a activat niciun precompilat**: lista `active_static_precompiles` este în continuare goală pe ambele rețele, iar v3.2.4 (pe testnet din 19 octombrie 2026; pe mainnet de la înălțimea 3,742,566) nu schimbă acest lucru. Acest tabel se actualizează în aceeași operațiune cu upgrade-ul care activează oricare dintre ele.

Verifică singur lista curentă (goală înseamnă că niciunul nu e activ):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Protecție împotriva datelor returnate goale {#guard}

Deoarece o adresă inactivă (sau care nu aparține QoreChain) întoarce succes fără date, nu citi niciodată octeții bruți returnați de un apel de nivel jos fără a-le verifica lungimea. `abi.decode` și apelurile prin interfețe tipate fac revert pe date goale, ceea ce este rezultatul sigur; un apel de nivel jos scris de mână trebuie să verifice explicit acest lucru:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

Nu trimite valoare către aceste adrese. Nu sunt payable, iar valoarea trimisă către o adresă de precompilat inactivă rămâne acolo, fără nicio posibilitate de recuperare.

---

## Harta adreselor precompilatelor

Cifrele de gaz sunt cele pe care nodul le taxează după ce un precompilat este activ (per octet înseamnă per octet de date de intrare ale apelului).

| Precompilat              | Adresă                                      | Gaz de bază      | Descriere                                          |
| ------------------------ | -------------------------------------------- | --------------- | --------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50.000 + 4/octet | Apeluri sincrone cross-VM (de la EVM la QoreChain Native)   |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25.000 + 8/octet | Verifică semnături post-cuantice ML-DSA-87          |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2.500           | Verifică dacă un cont are o cheie PQC înregistrată  |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50.000          | Obține scorul de risc generat de AI pentru date de tranzacție |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40.000          | Verifică dacă un transfer este marcat drept anormal |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1.500        | Citește parametrii de consens curenți, ajustați de PRISM |

---

## Interfețe Solidity

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

Începând cu v3.2.4 (testnet din 19 octombrie 2026; mainnet de la înălțimea 3,742,566), odată ce acest precompilat este activ, ieșirea lui conține o a patra valoare, `bool possessionProven`, după `pubkey`: dacă cheia curentă a contului a fost dovedită printr-o dovadă de posesie verificată (vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing#proof-of-possession)). Interfața de mai sus listează primele trei ieșiri; un contract care trebuie să aibă încredere în cheie ar trebui să citească și a patra valoare.

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

## Exemple de utilizare

### PQC Verify — Verificarea unei semnături post-cuantice

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

**Cost de gaz:** 25.000 de bază + 8 gaz per octet de date de intrare. Intrarea este apelul codificat ABI (cheia publică de 2592 octeți, semnătura de 4627 octeți, mesajul, plus offset-urile și padding-ul ABI), deci o verificare tipică ML-DSA-87 costă aproximativ 85.000-90.000 gaz.

### PQC Key Status — Verificarea înregistrării unui cont

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Cost de gaz:** 2.500, fix.

### AI Risk Score — Evaluarea riscului unei tranzacții

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

**Niveluri de risc:**

| Nivel    | Valoare |
| -------- | ------- |
| SAFE     | 0       |
| LOW      | 1       |
| MEDIUM   | 2       |
| HIGH     | 3       |
| CRITICAL | 4       |

Nivelul provine din eticheta de severitate a motorului AI pentru tranzacție; scorul este returnat în puncte de bază (0 - 10000). Nu există o corespondență fixă între intervalele de scor și niveluri, așa că condiționează pe `level`, nu pe praguri de scor.

**Cost de gaz:** 50.000, fix.

### AI Anomaly Check — Marcarea transferurilor suspecte

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

**Cost de gaz:** 40.000, fix.

### PRISM Consensus Params — Citirea stării consensului

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

**Cost de gaz:** 1.500, fix.

:::note
În build-ul curent al nodului, `rlConsensusParams` returnează valori implicite fixe, de umplutură (placeholder), nu valori live ajustate de PRISM (de exemplu, nu raportează timpul de bloc măsurat, care este de aproximativ 3,2 s pe mainnet și de aproximativ 1,0 s pe testnet). Conectarea la parametrii de consens live face parte din munca de activare.
:::

### CrossVM Bridge — Apelarea QoreChain Native din EVM

:::warning
Precompilatul CrossVM bridge **nu este activ** pe nicio rețea. Binarul, începând cu v3.2.3, conține o versiune întărită a acestuia care: refuză un `STATICCALL`; rulează apelul imbricat pe un contor de gaz limitat de ceea ce îi mai rămâne frame-ului apelant și îl jurnalizează, astfel încât un revert în contractul apelant anulează și partea QoreChain Native; ajunge doar la ținte QoreChain Native din lista permisă (țintele EVM sunt refuzate); și respectă circuit breaker-ul cross-VM. Până când o actualizare aprobată prin guvernanță îl activează, nu există o cale sincronă de la EVM la QoreChain Native; vezi [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) pentru calea de mesaj `MsgCrossVMCall`, care este ea însăși oprită pe mainnet în prezent.
:::

Nodul decodează calldata ca `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selector de 4 octeți, apoi argumentele codificate ABI). Singura utilizare acceptată este de la EVM la QoreChain Native (`targetVM` = 1); ABI-ul se mai poate schimba înainte de activare. Helper-ul `@qorechain/rdk` `encodeCrossVmCalldata` codifică acest layout începând cu 0.6.0 (versiunile anterioare codificau o altă funcție), iar `isCrossVmPrecompileActive` al său citește lista live `active_static_precompiles`; vezi [Multi-VM](/rollups/multi-vm).

**Cost de gaz:** 50.000 de bază + 4 gaz per octet de date de intrare, plus costul de execuție al contractului țintă. Vezi [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) pentru detalii.

---

## Locațiile fișierelor de interfață

Fișierele de interfață Solidity sunt disponibile în repository pentru import direct:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Instalează-le în proiectul tău Hardhat sau Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Sau referențiază-le prin calea de import în fișierele tale Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Pași următori

* [Interoperabilitate Cross-VM](/developer-guide/cross-vm-interoperability) — Documentația completă a mesageriei cross-VM
* [Dezvoltare EVM](/developer-guide/evm-development) — Implementarea contractelor Solidity
* [Abstractizarea contului](/developer-guide/account-abstraction) — Autentificatori pentru portofele conectate și reguli de cheltuire (modulul este dezactivat în prezent)
