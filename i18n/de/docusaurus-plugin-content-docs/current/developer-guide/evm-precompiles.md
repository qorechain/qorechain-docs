---
slug: /developer-guide/evm-precompiles
title: EVM-Precompiles
sidebar_label: EVM-Precompiles
sidebar_position: 6
---

# EVM-Precompiles

QoreChain erweitert die QoreChain-EVM-Engine um **sechs benutzerdefinierte precompiled Contracts**, die Protokollfunktionen auf Protokollebene direkt für Solidity zugänglich machen. Diese Precompiles bieten On-Chain-Zugriff auf Post-Quanten-Kryptografie, KI-Risikobewertung, Cross-VM-Messaging und PRISM-Konsensparameter.

:::warning Nicht aktiv im Mainnet; drei aktiv im Testnet
Die sechs untenstehenden QoreChain-Precompiles sind **in den Knoten kompiliert**, aber die EVM ruft nur Adressen auf, die im Parameter `active_static_precompiles` stehen. Im **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**) ist diese Liste zum Zeitpunkt der Erstellung leer, daher ist dort **keines aktiv**. Im **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**) sind drei aktiv: PQC Verify, PQC Key Status und PRISM Consensus Params, aktiviert durch den Testnet-Governance-Vorschlag 21 (angenommen am 27. Oktober 2026). Die anderen drei sind in keinem der beiden Netzwerke aktiv. Ein Aufruf einer Adresse, die nicht in der Liste steht, **gelingt und liefert leere Daten (`0x`)**; er revertiert nicht und liefert keinen Fehler. Siehe [Netzwerkstatus](#network-status), bevor Sie sich auf eines davon verlassen.
:::

## Netzwerkstatus {#network-status}

| Precompile | Adresse | `qorechain-vladi` (Mainnet) | `qorechain-diana` (Testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Nicht aktiv | **Aktiv** (seit 27. Oktober 2026) |
| PQC Key Status | `0x…0A02` | Nicht aktiv | **Aktiv** (seit 27. Oktober 2026) |
| AI Risk Score | `0x…0B01` | Nicht aktiv | Nicht aktiv |
| AI Anomaly Check | `0x…0B02` | Nicht aktiv | Nicht aktiv |
| PRISM Consensus Params | `0x…0C01` | Nicht aktiv | **Aktiv** (seit 27. Oktober 2026) |
| CrossVM Bridge | `0x…0901` | Nicht aktiv | Nicht aktiv |

Status, wie er am 27. Oktober 2026 aus dem Live-Parameter `active_static_precompiles` gelesen wurde (das Mainnet am 30. Oktober 2026 nach v3.2.5 erneut gelesen: weiterhin leer). Es ist ein per Governance geänderter Chain-Parameter, daher ändert sich die Liste jedes Netzwerks nur, wenn ein Governance-Vorschlag angenommen wird; die Testnet-Liste wurde durch Vorschlag 21 gesetzt, und zum Zeitpunkt der Erstellung ändert kein Mainnet-Vorschlag sie. Das Release v3.2.3 (Mainnet, 20. Oktober 2026) hat die gehärteten Versionen der CrossVM Bridge und des AI-Anomaly-Precompiles hinter einem Protokoll-Feature in die Binärdatei aufgenommen, aber kein Precompile aktiviert, und v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) ändert daran nichts. Zuerst kommen die schreibgeschützten PQC- und Konsens-Precompiles, das KI-Paar, sobald ihr schreibgeschützter Festkomma-Pfad vorhanden ist, und die CrossVM Bridge zuletzt. Diese Tabelle führt nur auf, was angewendet ist: Ein Vorschlag, der sich noch in der Abstimmungsphase befindet, ist kein Status.

Prüfen Sie die aktuelle Liste selbst (eine leere Liste bedeutet: keines ist aktiv):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Schutz gegen leere Rückgabedaten {#guard}

Da eine inaktive (oder nicht zu QoreChain gehörende) Adresse Erfolg ohne Daten zurückgibt, lesen Sie die rohen Rückgabe-Bytes eines Low-Level-Aufrufs niemals, ohne ihre Länge zu prüfen. `abi.decode` und typisierte Interface-Aufrufe revertieren bei leeren Daten, was das sichere Ergebnis ist; ein selbst geschriebener Low-Level-Aufruf muss dies explizit prüfen:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

Senden Sie keinen Wert an diese Adressen. Sie sind nicht payable, und an eine inaktive Precompile-Adresse gesendeter Wert bleibt dort und kann nicht wiederhergestellt werden.

Im Testnet prüfen Sie so schnell, ob die drei aktiven Precompiles antworten (mit `cast` von Foundry; im Mainnet liefern diese Adressen stattdessen leere Daten):

```bash
RPC=https://evm-testnet.qore.host
cast call 0x0000000000000000000000000000000000000C01 "rlConsensusParams()(uint256,uint256,uint256,uint256)" --rpc-url $RPC
cast call 0x0000000000000000000000000000000000000A02 "pqcKeyStatus(address)(bool,uint8,bytes,bool)" 0x0000000000000000000000000000000000000001 --rpc-url $RPC
```

---

## Adresskarte der Precompiles

Die Gas-Angaben sind das, was der Knoten berechnet, sobald ein Precompile aktiv ist (pro Byte bedeutet pro Byte der Aufrufeingabe).

| Precompile               | Adresse                                       | Basis-Gas        | Beschreibung                                        |
| ------------------------ | ---------------------------------------------- | ----------------- | ---------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50.000 + 4/Byte | Synchrone Cross-VM-Aufrufe (EVM zu QoreChain Native)         |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25.000 + 8/Byte   | Verifiziert ML-DSA-87-Post-Quanten-Signaturen        |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2.500             | Prüft, ob ein Konto einen registrierten PQC-Schlüssel hat |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50.000            | Ruft den KI-generierten Risikoscore für Transaktionsdaten ab |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40.000            | Prüft, ob ein Transfer als anomal markiert ist       |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1.500          | Liest die aktuellen PRISM-abgestimmten Konsensparameter |

---

## Solidity-Schnittstellen

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

Ab v3.2.4 (Mainnet seit dem 23. Oktober 2026, Testnet seit dem 19. Oktober 2026) trägt die Ausgabe von `pqcKeyStatus` einen vierten Ausgabewert, `bool possessionProven`, nach `pubkey`: ob der aktuelle Schlüssel des Kontos durch einen verifizierten Besitznachweis belegt wurde (siehe [Post-Quantum-Signierung](/developer-guide/post-quantum-signing#proof-of-possession)). Er wird überall zurückgegeben, wo das Precompile aktiv ist: Im Testnet ist er live (ein Aufruf für ein Konto ohne Schlüssel liefert `false, 0, 0x, false`), im Mainnet, sobald ein Upgrade das Precompile aktiviert. Die obige Schnittstelle listet die ersten drei Ausgaben; ein Contract, der dem Schlüssel vertrauen muss, sollte auch die vierte lesen.

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

## Anwendungsbeispiele

### PQC Verify — Verifizierung einer Post-Quanten-Signatur

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

**Gaskosten:** 25.000 Basis + 8 Gas pro Byte Eingabedaten. Die Eingabe ist der ABI-kodierte Aufruf (Public Key mit 2592 Bytes, Signatur mit 4627 Bytes, die Nachricht sowie ABI-Offsets und Padding), sodass eine typische ML-DSA-87-Verifizierung ungefähr 85.000-90.000 Gas kostet.

### PQC Key Status — Prüfung der Kontoregistrierung

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Gaskosten:** 2.500 pauschal.

### AI Risk Score — Bewertung des Transaktionsrisikos

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

**Risikostufen:**

| Stufe    | Wert  |
| -------- | ----- |
| SAFE     | 0     |
| LOW      | 1     |
| MEDIUM   | 2     |
| HIGH     | 3     |
| CRITICAL | 4     |

Die Stufe stammt aus dem Schweregrad-Label der KI-Engine für die Transaktion; der Score wird in Basispunkten zurückgegeben (0 - 10000). Es gibt keine feste Zuordnung von Score-Bereichen zu Stufen, prüfen Sie daher anhand von `level` statt anhand von Score-Schwellen.

**Gaskosten:** 50.000 pauschal.

### AI Anomaly Check — Markierung verdächtiger Transfers

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

**Gaskosten:** 40.000 pauschal.

### PRISM Consensus Params — Auslesen des Konsensstatus

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

**Gaskosten:** 1.500 pauschal, zuzüglich der Zustandslesezugriffe des Aufrufs zu den Standardkosten.

:::note Was die vier Werte sind
Ab v3.2.6 (Testnet; noch nicht im Mainnet) liefert `rlConsensusParams` die vom Modul `rlconsensus` gehaltenen Werte statt fester Platzhalter: das angewendete Blockzeit-Ziel in Millisekunden, die angewendete Gaspreis-Untergrenze, die `default_validator_set_size` des Moduls und die aktuelle Epoche des Agenten. Im Testnet lieferte es am 27. Oktober 2026 `5000`, `100`, `100`, `1` (dieselben angewendeten Werte wie `GET /qorechain/rlconsensus/v1/applied_params`, siehe [REST-/gRPC-Endpunkte](/api-reference/rest-grpc-endpoints#rlconsensus-module)). Das sind die eigenen Einstellungen des Moduls, **nicht die gemessene Blockzeit** (etwa 3,1 s im Mainnet und etwa 1,3 s im Testnet), und der Agent läuft im Testnet im Beobachtungsmodus und wendet daher nichts an. Auf einem Knoten älter als v3.2.6 liefert derselbe Aufruf feste Platzhalter-Standardwerte.
:::

### CrossVM Bridge — Aufruf von QoreChain Native aus der EVM

:::warning
Das CrossVM-Bridge-Precompile ist auf keinem der beiden Netzwerke **aktiv**. Die Binärdatei enthält seit v3.2.3 eine gehärtete Version davon, die: einen `STATICCALL` verweigert; den verschachtelten Aufruf auf einem Gas-Zähler ausführt, der durch das begrenzt ist, was dem aufrufenden Frame noch bleibt, und ihn im Journal führt, sodass ein Revert im aufrufenden Contract auch die QoreChain Native-Seite rückgängig macht; nur QoreChain Native-Ziele auf der Allowlist erreicht (EVM-Ziele werden abgelehnt); und den Cross-VM-Circuit-Breaker beachtet. Bis ein per Governance genehmigtes Upgrade es aktiviert, gibt es keinen synchronen EVM-zu-QoreChain Native-Pfad; siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) für den Nachrichtenpfad `MsgCrossVMCall`, der im Mainnet derzeit selbst abgeschaltet ist.
:::

Der Knoten dekodiert die Calldata als `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (4-Byte-Selektor, dann die ABI-kodierten Argumente). Die einzige unterstützte Verwendung ist EVM zu QoreChain Native (`targetVM` = 1); die ABI kann sich vor der Aktivierung noch ändern. Der `@qorechain/rdk`-Helfer `encodeCrossVmCalldata` kodiert dieses Layout ab 0.6.0 (frühere Releases kodierten eine andere Funktion), und sein `isCrossVmPrecompileActive` liest die aktuelle Liste `active_static_precompiles`; siehe [Multi-VM](/rollups/multi-vm).

**Gaskosten:** 50.000 Basis + 4 Gas pro Byte Eingabe, zuzüglich der Ausführungskosten des Ziel-Contracts. Details siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability).

---

## Speicherorte der Schnittstellendateien

Die Solidity-Schnittstellendateien stehen im Repository für den direkten Import zur Verfügung:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Installieren Sie sie in Ihrem Hardhat- oder Foundry-Projekt:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Oder referenzieren Sie sie über den Importpfad in Ihren Solidity-Dateien:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Nächste Schritte

* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — Vollständige Dokumentation zum Cross-VM-Messaging
* [EVM-Entwicklung](/developer-guide/evm-development) — Bereitstellung von Solidity-Contracts
* [Account Abstraction](/developer-guide/account-abstraction) — Authenticators für verknüpfte Wallets und Ausgaberegeln (im Testnet aktiviert, im Mainnet deaktiviert)
