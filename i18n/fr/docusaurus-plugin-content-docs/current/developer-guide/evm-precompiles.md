---
slug: /developer-guide/evm-precompiles
title: Précompilés EVM
sidebar_label: Précompilés EVM
sidebar_position: 6
---

# Précompilés EVM

QoreChain étend le QoreChain EVM Engine avec **six contrats précompilés personnalisés** qui exposent des fonctionnalités au niveau du protocole directement à Solidity. Ces précompilés fournissent un accès on-chain à la cryptographie post-quantique, au scoring de risque par IA, à la messagerie inter-VM et aux paramètres du consensus PRISM.

:::warning Pas encore actifs sur le mainnet ni sur le testnet
Les six précompilés QoreChain ci-dessous sont **compilés dans le nœud mais pas encore activés**, ni sur le mainnet **`qorechain-vladi`** (chain ID EVM **9801**) ni sur le testnet **`qorechain-diana`** (chain ID EVM **9800**). L'EVM n'exécute que les adresses listées dans le paramètre `active_static_precompiles`, et cette liste est vide sur les deux réseaux. Tant qu'une mise à niveau de la chaîne ne les active pas, **un appel à ces adresses réussit et renvoie des données vides (`0x`)** ; il ne revert pas et ne renvoie pas d'erreur. Consultez l'[État du réseau](#network-status) avant de vous appuyer sur l'un d'eux.
:::

## État du réseau {#network-status}

| Précompilé | Adresse | `qorechain-vladi` (mainnet) | `qorechain-diana` (testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Non actif | Non actif |
| PQC Key Status | `0x…0A02` | Non actif | Non actif |
| AI Risk Score | `0x…0B01` | Non actif | Non actif |
| AI Anomaly Check | `0x…0B02` | Non actif | Non actif |
| PRISM Consensus Params | `0x…0C01` | Non actif | Non actif |
| CrossVM Bridge | `0x…0901` | Non actif | Non actif |

L'activation nécessite une mise à niveau de la chaîne et se fera par étapes : d'abord les précompilés PQC et de consensus en lecture seule, puis la paire IA une fois que leur chemin en lecture seule à virgule fixe sera en place, et le CrossVM bridge en dernier. La version v3.2.3 (mainnet, 20 octobre 2026) a intégré au binaire, derrière une fonctionnalité de protocole, les versions renforcées du CrossVM bridge et du précompilé AI anomaly, **mais elle n'a activé aucun précompilé** : la liste `active_static_precompiles` est toujours vide sur les deux réseaux, et la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026) n'y change rien. Ce tableau est mis à jour dans la même opération que la mise à niveau qui en active un quelconque.

Vérifiez vous-même la liste actuelle (une liste vide signifie qu'aucun n'est actif) :

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Se prémunir contre les données de retour vides {#guard}

Comme une adresse inactive (ou non QoreChain) renvoie un succès sans données, ne lisez jamais les octets bruts renvoyés par un appel de bas niveau sans vérifier leur longueur. `abi.decode` et les appels d'interface typés revert sur des données vides, ce qui est le résultat sûr ; un appel de bas niveau écrit à la main doit la vérifier explicitement :

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

N'envoyez pas de valeur à ces adresses. Elles ne sont pas payable, et la valeur envoyée à l'adresse d'un précompilé inactif y reste sans aucun moyen de la récupérer.

---

## Carte des adresses des précompilés

Les chiffres de gas correspondent à ce que le nœud facture une fois qu'un précompilé est actif (par octet signifie par octet de données d'entrée de l'appel).

| Précompilé               | Adresse                                      | Gas de base      | Description                                              |
| ------------------------ | --------------------------------------------- | --------------- | --------------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50 000 + 4/octet | Appels synchrones inter-VM (EVM vers QoreChain Native)             |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25 000 + 8/octet | Vérifie les signatures post-quantiques ML-DSA-87           |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2 500           | Vérifie si un compte possède une clé PQC enregistrée       |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50 000          | Récupère le score de risque généré par IA pour une transaction |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40 000          | Vérifie si un transfert est signalé comme anormal           |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1 500        | Lit les paramètres de consensus actuels réglés par PRISM    |

---

## Interfaces Solidity

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

À partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), une fois ce précompilé actif, sa sortie comporte une quatrième valeur, `bool possessionProven`, après `pubkey` : elle indique si la clé actuelle du compte a été prouvée par une preuve de possession vérifiée (voir [Signature post-quantique](/developer-guide/post-quantum-signing#proof-of-possession)). L'interface ci-dessus liste les trois premières sorties ; un contrat qui doit se fier à la clé devrait lire aussi la quatrième.

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

## Exemples d'utilisation

### PQC Verify — Vérifier une signature post-quantique

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

**Coût en gas :** 25 000 de base + 8 gas par octet de données en entrée. L'entrée est l'appel encodé en ABI (clé publique de 2592 octets, signature de 4627 octets, le message, plus les offsets et le bourrage ABI), donc une vérification ML-DSA-87 typique coûte environ 85 000 à 90 000 gas.

### PQC Key Status — Vérifier l'enregistrement d'un compte

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Coût en gas :** 2 500 forfaitaire.

### AI Risk Score — Évaluer le risque d'une transaction

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

**Niveaux de risque :**

| Niveau   | Valeur |
| -------- | ------ |
| SAFE     | 0      |
| LOW      | 1      |
| MEDIUM   | 2      |
| HIGH     | 3      |
| CRITICAL | 4      |

Le niveau provient du libellé de gravité attribué à la transaction par le moteur d'IA ; le score est renvoyé en points de base (0 - 10000). Il n'existe pas de correspondance fixe entre les plages de score et les niveaux : appuyez-vous donc sur `level` plutôt que sur des seuils de score.

**Coût en gas :** 50 000 forfaitaire.

### AI Anomaly Check — Signaler les transferts suspects

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

**Coût en gas :** 40 000 forfaitaire.

### PRISM Consensus Params — Lire l'état du consensus

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

**Coût en gas :** 1 500 forfaitaire.

:::note
Dans la version actuelle du nœud, `rlConsensusParams` renvoie des valeurs par défaut fixes servant d'espace réservé, et non des valeurs réglées en direct par PRISM (par exemple, il ne rapporte pas le temps de bloc mesuré, qui est d'environ 3,2 s sur le mainnet et d'environ 1,0 s sur le testnet). Le raccorder aux paramètres de consensus en direct fait partie du travail d'activation.
:::

### CrossVM Bridge — Appeler QoreChain Native depuis l'EVM

:::warning
Le précompilé CrossVM bridge n'est **pas actif** sur l'un ni l'autre réseau. Le binaire en embarque, depuis la v3.2.3, une version renforcée qui : refuse un `STATICCALL` ; exécute l'appel imbriqué sur un compteur de gas borné par ce qu'il reste au cadre appelant et le consigne dans le journal, de sorte qu'un revert dans le contrat appelant annule aussi le côté QoreChain Native ; n'atteint que des cibles QoreChain Native figurant sur une liste d'autorisation (les cibles EVM sont refusées) ; et respecte le circuit breaker inter-VM. Tant qu'une mise à niveau approuvée par la gouvernance ne l'active pas, il n'existe aucun chemin synchrone de l'EVM vers QoreChain Native ; voir [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour le chemin de message `MsgCrossVMCall`, lui-même désactivé sur le mainnet aujourd'hui.
:::

Le nœud décode les calldata comme `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (sélecteur de 4 octets, puis les arguments encodés en ABI). Le seul usage pris en charge est de l'EVM vers QoreChain Native (`targetVM` = 1) ; l'ABI peut encore changer avant l'activation. L'assistant `encodeCrossVmCalldata` de `@qorechain/rdk` encode cette disposition à partir de la 0.6.0 (les versions antérieures encodaient une autre fonction), et son `isCrossVmPrecompileActive` lit la liste `active_static_precompiles` en direct ; voir [Multi-VM](/rollups/multi-vm).

**Coût en gas :** 50 000 de base + 4 gas par octet d'entrée, plus le coût d'exécution du contrat cible. Voir [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour plus de détails.

---

## Emplacement des fichiers d'interface

Les fichiers d'interface Solidity sont disponibles dans le dépôt pour une importation directe :

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Installez-les dans votre projet Hardhat ou Foundry :

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Ou référencez-les via un chemin d'import dans vos fichiers Solidity :

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Documentation complète sur la messagerie inter-VM
* [Développement EVM](/developer-guide/evm-development) — Déployer des contrats Solidity
* [Abstraction de compte](/developer-guide/account-abstraction) — Authentificateurs de portefeuilles liés et règles de dépense (module actuellement désactivé)
