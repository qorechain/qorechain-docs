---
slug: /developer-guide/evm-precompiles
title: Precompilati EVM
sidebar_label: Precompilati EVM
sidebar_position: 6
---

# Precompilati EVM

QoreChain estende il QoreChain EVM Engine con **sei contratti precompilati personalizzati** che espongono funzionalità a livello di protocollo direttamente a Solidity. Questi precompilati forniscono accesso on-chain alla crittografia post-quantistica, al punteggio di rischio basato su AI, alla messaggistica cross-VM e ai parametri di consenso PRISM.

:::warning Non attivi sulla mainnet; tre attivi sulla testnet
I sei precompilati QoreChain qui sotto sono **compilati nel nodo**, ma la EVM esegue solo gli indirizzi elencati nel parametro `active_static_precompiles`. Sulla mainnet **`qorechain-vladi`** (EVM chain ID **9801**) quella lista al momento della stesura è vuota, quindi **nessuno è attivo lì**. Sulla testnet **`qorechain-diana`** (EVM chain ID **9800**) ne sono attivi tre: PQC Verify, PQC Key Status e PRISM Consensus Params, attivati dalla proposta di governance 21 della testnet (approvata il 27 ottobre 2026). Gli altri tre non sono attivi su nessuna delle due reti. Una chiamata a un indirizzo che non è nella lista **riesce e restituisce dati vuoti (`0x`)**; non fa revert e non restituisce errori. Consulta lo [Stato della rete](#network-status) prima di affidarti a uno qualsiasi di essi.
:::

## Stato della rete {#network-status}

| Precompilato | Indirizzo | `qorechain-vladi` (mainnet) | `qorechain-diana` (testnet) |
| --- | --- | --- | --- |
| PQC Verify | `0x…0A01` | Non attivo | **Attivo** (dal 27 ottobre 2026) |
| PQC Key Status | `0x…0A02` | Non attivo | **Attivo** (dal 27 ottobre 2026) |
| AI Risk Score | `0x…0B01` | Non attivo | Non attivo |
| AI Anomaly Check | `0x…0B02` | Non attivo | Non attivo |
| PRISM Consensus Params | `0x…0C01` | Non attivo | **Attivo** (dal 27 ottobre 2026) |
| CrossVM Bridge | `0x…0901` | Non attivo | Non attivo |

Stato letto dal parametro live `active_static_precompiles` il 27 ottobre 2026. È un parametro della chain modificato dalla governance, quindi la lista di ciascuna rete cambia solo quando passa una proposta di governance; la lista della testnet è stata impostata dalla proposta 21, e al momento della stesura nessuna proposta della mainnet la modifica. La release v3.2.3 (mainnet, 20 ottobre 2026) ha inserito nel binario, dietro una funzionalità di protocollo, le versioni rinforzate del CrossVM bridge e del precompilato AI anomaly, ma non ha attivato alcun precompilato, e la v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026) non lo cambia. Prima vengono i precompilati PQC e di consenso in sola lettura, poi la coppia AI una volta predisposto il loro percorso in sola lettura a virgola fissa, e il CrossVM bridge per ultimo. Questa tabella elenca solo ciò che è applicato: una proposta ancora nel periodo di voto non è uno stato.

Controlla tu stesso la lista attuale (vuota significa nessuno attivo):

```bash
curl -s https://api.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
curl -s https://api-testnet.qore.host/cosmos/evm/vm/v1/params | jq .params.active_static_precompiles
```

### Proteggiti dai dati di ritorno vuoti {#guard}

Poiché un indirizzo inattivo (o non QoreChain) restituisce successo senza dati, non leggere mai i byte grezzi restituiti da una chiamata di basso livello senza controllarne la lunghezza. `abi.decode` e le chiamate a interfacce tipizzate fanno revert su dati vuoti, che è l'esito sicuro; una chiamata di basso livello scritta a mano deve controllarlo esplicitamente:

```solidity
(bool ok, bytes memory ret) = address(0x0000000000000000000000000000000000000A02)
    .staticcall(abi.encodeWithSignature("pqcKeyStatus(address)", account));
require(ok && ret.length >= 96, "precompile not active");
(bool registered, uint8 algorithmId, bytes memory pubkey) = abi.decode(ret, (bool, uint8, bytes));
```

Non inviare valore a questi indirizzi. Non sono payable, e il valore inviato all'indirizzo di un precompilato inattivo vi rimane senza alcun modo di recuperarlo.

Sulla testnet, una verifica rapida che i tre precompilati attivi rispondano (con `cast` di Foundry; sulla mainnet questi indirizzi restituiscono invece dati vuoti):

```bash
RPC=https://evm-testnet.qore.host
cast call 0x0000000000000000000000000000000000000C01 "rlConsensusParams()(uint256,uint256,uint256,uint256)" --rpc-url $RPC
cast call 0x0000000000000000000000000000000000000A02 "pqcKeyStatus(address)(bool,uint8,bytes,bool)" 0x0000000000000000000000000000000000000001 --rpc-url $RPC
```

---

## Mappa degli indirizzi dei precompilati

Le cifre di gas sono quelle che il nodo addebita una volta che un precompilato è attivo (per byte significa per byte di input della chiamata).

| Precompilato             | Indirizzo                                    | Gas base         | Descrizione                                       |
| ------------------------ | --------------------------------------------- | --------------- | -------------------------------------------------- |
| **CrossVM Bridge**       | `0x0000000000000000000000000000000000000901` | 50.000 + 4/byte | Chiamate cross-VM sincrone (EVM verso QoreChain Native)    |
| **PQC Verify**           | `0x0000000000000000000000000000000000000A01` | 25.000 + 8/byte | Verifica firme post-quantistiche ML-DSA-87         |
| **PQC Key Status**       | `0x0000000000000000000000000000000000000A02` | 2.500           | Verifica se un account ha una chiave PQC registrata |
| **AI Risk Score**        | `0x0000000000000000000000000000000000000B01` | 50.000          | Ottiene il punteggio di rischio generato dall'AI per i dati di una transazione |
| **AI Anomaly Check**     | `0x0000000000000000000000000000000000000B02` | 40.000          | Verifica se un trasferimento è segnalato come anomalo |
| **PRISM Consensus Params** | `0x0000000000000000000000000000000000000C01` | 1.500        | Legge i parametri di consenso correnti ottimizzati da PRISM |

---

## Interfacce Solidity

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

Dalla v3.2.4 (mainnet dal 23 ottobre 2026, testnet dal 19 ottobre 2026), l'output di `pqcKeyStatus` contiene un quarto valore, `bool possessionProven`, dopo `pubkey`: indica se la chiave attuale dell'account è stata dimostrata da una prova di possesso verificata (vedi [Firma post-quantistica](/developer-guide/post-quantum-signing#proof-of-possession)). Viene restituito ovunque il precompilato sia attivo: sulla testnet è live (una chiamata per un account senza chiave restituisce `false, 0, 0x, false`), sulla mainnet quando un upgrade attiverà il precompilato. L'interfaccia qui sopra elenca i primi tre output; un contratto che deve fidarsi della chiave dovrebbe leggere anche il quarto.

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

## Esempi di utilizzo

### PQC Verify — Verificare una firma post-quantistica

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

**Costo in gas:** 25.000 base + 8 gas per byte di dati in input. L'input è la chiamata codificata in ABI (chiave pubblica di 2592 byte, firma di 4627 byte, il messaggio, più offset e padding ABI), quindi una tipica verifica ML-DSA-87 costa circa 85.000-90.000 gas.

### PQC Key Status — Verificare la registrazione di un account

```solidity
contract PQCChecker {
    IQorePQC constant PQC_STATUS = IQorePQC(0x0000000000000000000000000000000000000A02);

    function requirePQCKey(address account) external view {
        (bool registered, , ) = PQC_STATUS.pqcKeyStatus(account);
        require(registered, "Account must have a registered PQC key");
    }
}
```

**Costo in gas:** 2.500 fisso.

### AI Risk Score — Valutare il rischio di una transazione

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

**Livelli di rischio:**

| Livello  | Valore |
| -------- | ------ |
| SAFE     | 0      |
| LOW      | 1      |
| MEDIUM   | 2      |
| HIGH     | 3      |
| CRITICAL | 4      |

Il livello deriva dall'etichetta di gravità assegnata alla transazione dal motore AI; il punteggio viene restituito in punti base (0 - 10000). Non esiste una corrispondenza fissa tra intervalli di punteggio e livelli, quindi basa le decisioni su `level` anziché su soglie di punteggio.

**Costo in gas:** 50.000 fisso.

### AI Anomaly Check — Segnalare trasferimenti sospetti

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

**Costo in gas:** 40.000 fisso.

### PRISM Consensus Params — Leggere lo stato del consenso

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

**Costo in gas:** 1.500 fisso, più le letture di stato eseguite dalla chiamata al costo standard.

:::note Cosa sono i quattro valori
Dalla v3.2.6 (la testnet; non ancora sulla mainnet) `rlConsensusParams` restituisce i valori detenuti dal modulo `rlconsensus` invece di segnaposto fissi: il target del tempo di blocco applicato in millisecondi, il minimo del prezzo del gas applicato, il `default_validator_set_size` del modulo e l'epoca corrente dell'agente. Sulla testnet il 27 ottobre 2026 ha restituito `5000`, `100`, `100`, `1` (gli stessi valori applicati di `GET /qorechain/rlconsensus/v1/applied_params`, vedi [Endpoint REST / gRPC](/api-reference/rest-grpc-endpoints#rlconsensus-module)). Sono le impostazioni proprie del modulo, **non il tempo di blocco misurato** (circa 3,1 s sulla mainnet e circa 1,3 s sulla testnet), e l'agente sulla testnet gira in shadow mode, quindi non applica nulla. Su un nodo precedente alla v3.2.6 la stessa chiamata restituisce valori predefiniti fissi segnaposto.
:::

### CrossVM Bridge — Chiamare QoreChain Native dalla EVM

:::warning
Il precompilato CrossVM bridge **non è attivo** su nessuna delle due reti. Il binario dalla v3.2.3 ne contiene una versione rinforzata che: rifiuta una `STATICCALL`; esegue la chiamata annidata su un contatore di gas limitato a quanto resta al frame chiamante e la registra nel journal, così un revert nel contratto chiamante annulla anche il lato QoreChain Native; raggiunge solo destinazioni QoreChain Native in allowlist (le destinazioni EVM vengono rifiutate); e rispetta il circuit breaker cross-VM. Finché un upgrade approvato dalla governance non lo attiva non esiste alcun percorso sincrono da EVM a QoreChain Native; vedi [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) per il percorso del messaggio `MsgCrossVMCall`, che oggi è a sua volta disattivato su mainnet.
:::

Il nodo decodifica i calldata come `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (selettore di 4 byte, poi gli argomenti codificati in ABI). L'unico uso supportato è da EVM a QoreChain Native (`targetVM` = 1); l'ABI potrebbe ancora cambiare prima dell'attivazione. L'helper `encodeCrossVmCalldata` di `@qorechain/rdk` codifica questo layout dalla 0.6.0 (le release precedenti codificavano una funzione diversa), e il suo `isCrossVmPrecompileActive` legge l'elenco attivo `active_static_precompiles`; vedi [Multi-VM](/rollups/multi-vm).

**Costo in gas:** 50.000 base + 4 gas per byte di input, più il costo di esecuzione del contratto di destinazione. Consulta [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) per i dettagli.

---

## Posizione dei file di interfaccia

I file di interfaccia Solidity sono disponibili nel repository per l'importazione diretta:

```
contracts/
  interfaces/
    IQorePQC.sol
    IQoreAI.sol
    IQoreConsensus.sol
```

Installali nel tuo progetto Hardhat o Foundry:

```bash
# Copy interfaces to your project
cp -r contracts/interfaces/ my-project/contracts/interfaces/
```

Oppure referenziali tramite il percorso di import nei tuoi file Solidity:

```solidity
import "./interfaces/IQorePQC.sol";
import "./interfaces/IQoreAI.sol";
import "./interfaces/IQoreConsensus.sol";
```

---

## Prossimi passi

* [Interoperabilità Cross-VM](/developer-guide/cross-vm-interoperability) — Documentazione completa sulla messaggistica cross-VM
* [Sviluppo EVM](/developer-guide/evm-development) — Distribuzione di contratti Solidity
* [Account Abstraction](/developer-guide/account-abstraction) — Autenticatori di wallet collegati e regole di spesa (abilitato sulla testnet, disabilitato sulla mainnet)
