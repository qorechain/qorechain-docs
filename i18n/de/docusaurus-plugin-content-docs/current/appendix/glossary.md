---
slug: /appendix/glossary
title: Glossar
sidebar_label: Glossar
sidebar_position: 1
---

# Glossar

Alphabetische Referenz der Begriffe, Abkürzungen und Akronyme, die in der gesamten QoreChain-Dokumentation verwendet werden.

---

**AMM** — Automated Market Maker. QoreChains natives On-Chain-Liquiditätsmodul (`x/amm`), das Constant-Product-Pools, Swaps und Liquiditätsbereitstellung direkt auf Protokollebene bereitstellt, ohne ein externes Smart-Contract-Deployment. Siehe [AMM](/architecture/amm).

**Authorisation window (EVM)** — Eine begrenzte Berechtigung (Blöcke, Transaktionsanzahl, Gesamtwert), die mit einer post-quantum-signierten Nachricht der Cosmos-Lane geöffnet wird und innerhalb der eine EVM-Lane-Transaktion seit v3.2.0 liegen muss. Ab v3.2.3 kann ein Fenster auf native Transfers oder auf eine Liste von Empfängern eingeschränkt werden. Siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window).

**BPF** — Berkeley Packet Filter. Das Bytecode-Format, das von der SVM-Laufzeit zur Ausführung von On-Chain-Programmen verwendet wird. Programme werden vor dem Deployment zu BPF kompiliert.

**Chain License** — Ein On-Chain-Lizenzeintrag, der vom `x/license`-Modul verwaltet wird. Chain Licenses steuern den Zugriff auf bestimmte Protokollfunktionen und ermöglichen es Betreibern, Lizenzberechtigungen On-Chain zu registrieren, zu verifizieren und zu verwalten. Siehe [Chain-Lizenzierung](/architecture/chain-licensing).

**Circuit breaker** — Der Cosmos-SDK-Mechanismus, der einzelne Nachrichtentypen netzwerkweit abschaltet; die aktuelle Liste ist unter `/cosmos/circuit/v1/disable_list` abfragbar. Siehe [Chain-Parameter](/appendix/chain-parameters#circuit-breaker).

**CLFB** — Cross-Layer Fee Bundling. Eine einzelne Gebührenzahlung auf der Quellebene, die die Ausführung über die Ebenen eines Cross-Layer-Pfads abdeckt (der Parameter `cross_layer_fee_bundling` von `x/multilayer`). Siehe [Multilayer-Architektur](/architecture/multilayer-architecture).

**CPI** — Cross-Program Invocation. Ein Mechanismus in der SVM-Laufzeit, der es einem bereitgestellten Programm ermöglicht, ein anderes Programm innerhalb desselben Transaktionskontexts aufzurufen.

**CPoS** — Composite Proof-of-Stake. QoreChains Konsens-Klassifizierungsdesign, das Validatoren basierend auf Reputation und Delegation in drei Pools (RPoS, DPoS, PoS) gruppiert. Jeder Pool hat unterschiedliche Gewichte im Proposer-Auswahlalgorithmus. In `x/qca` implementiert, aber in der Blockproduktion noch nicht aktiv.

**DA** — Data Availability. Die Garantie, dass an die Chain veröffentlichte Transaktionsdaten von jedem Node abgerufen werden können. Das RDK-Modul bietet native DA für Rollups und speichert Blobs On-Chain mit konfigurierbaren Aufbewahrungsfristen.

**DPoS** — Delegated Proof-of-Stake. Ein Konsensmechanismus, bei dem Token-Inhaber ihren Stake an Validatoren delegieren, die in ihrem Namen Blöcke produzieren.

**EIP-1559** — Ethereum Improvement Proposal 1559. Ein Transaktionsgebührenmodell, das eine Basisgebühr (verbrannt) plus eine Prioritätsgebühr (an Validatoren gezahlt) verwendet. QoreChain implementiert EIP-1559-artige Gebührenmechaniken in seiner QoreChain EVM Engine.

**HCS** — Hierarchical Commitment Schemes. Der Mechanismus, mit dem Sidechains, Paychains und Rollups ihre State Roots periodisch in der Hauptchain verankern (siehe Multilayer-Architektur). Nicht zu verwechseln mit dem hybriden Signaturverfahren secp256k1 + ML-DSA-87, das diese Dokumentation als *Hybridsignatur* bezeichnet.

**Hybrid sign-bytes v2** — Die domänengetaggten, chain-gebundenen Bytes, die der ML-DSA-Schlüssel ab v3.2.0 signiert. Siehe [Post-Quantum-Sicherheit](/architecture/post-quantum-security#sign-bytes-v2).

**IBC** — Inter-Blockchain Communication. Ein Protokoll für authentifizierte Nachrichtenübermittlung zwischen unabhängigen Blockchains. QoreChain unterstützt IBC-Kanäle für Cross-Chain-Token-Transfers und Daten-Relay.

**Light Node** — Ein ressourcenschonender Client, der der Chain folgt, indem er Blockheader mit einem oder mehreren RPC-Endpunkten abgleicht, ohne den vollständigen Status zu halten. Er bedient keine Abfragen für andere. Die Protokoll-Gebührenaufteilung reserviert einen Anteil von **3%** für das Light-Node-Belohnungsprogramm. Die Registrierung für das Programm ist offen und an eine `lightnode_operator`-Lizenz gebunden (50 $, im Dashboard erworben); Stand 20. Oktober 2026 waren im Mainnet sechs Lizenzen vergeben, und es hatte sich noch kein Light Node registriert. Der Betrieb eines Nodes erfordert keine Lizenz. Siehe [Light Node](/light-node/overview) und den [Status des Belohnungsprogramms](/light-node/overview#reward-program-status).

**MEV** — Maximal Extractable Value. Der Gewinn, der durch Umordnen, Einfügen oder Zensieren von Transaktionen innerhalb eines Blocks erzielt werden kann. QoreChains FairBlock-Modul (tIBE-Verschlüsselung) ist darauf ausgelegt, MEV-Extraktion zu mindern; es ist noch nicht aktiviert.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (Sicherheitsstufe 5). Das von NIST standardisierte Post-Quantum-Verfahren für digitale Signaturen, das von QoreChain für quantenresistente Transaktionssignierung verwendet wird. Erzeugt Signaturen von 4.627 Bytes mit öffentlichen Schlüsseln von 2.592 Bytes.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (Sicherheitsstufe 5). Ein von NIST standardisiertes Post-Quantum-Schlüsselkapselungsverfahren, das in QoreChains PQC-Algorithmusregistrierung für künftige verschlüsselte Kommunikationskanäle verfügbar ist.

**MLP** — Multi-Layer Perceptron. Eine Klasse neuronaler Netze, die von QCAI für Mustererkennung bei der Betrugserkennung und Anomaliebewertung verwendet wird.

**PPO** — Proximal Policy Optimization. Ein Reinforcement-Learning-Algorithmus, der von PRISM verwendet wird, um Chain-Parameter (Blockzeit, Gaspreis, Pool-Gewichte; die Größe des Validator-Sets wird nur protokolliert) basierend auf beobachteten Netzwerkbedingungen zu optimieren. Auf den Live-Netzwerken ist keine trainierte Policy geladen.

**PQC** — Post-Quantum Cryptography. Kryptografische Algorithmen, die so konzipiert sind, dass sie gegen Angriffe sowohl von klassischen als auch von Quantencomputern sicher sind. QoreChain implementiert PQC über sein `x/pqc`-Modul mit ML-DSA-87 als primärem Signaturverfahren.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Die Reinforcement-Learning-Optimierungsschicht, die in die QoreChain Consensus Engine eingebettet ist (über das `x/rlconsensus`-Modul). PRISM beobachtet Netzwerkmetriken und ist darauf ausgelegt, deterministische Anpassungen der Konsensparameter unter Sicherungsschalter-Sicherheitskontrollen vorzuschlagen; heute läuft es im Beobachtungsmodus. Siehe [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**Proof of possession (PoP)** — Eine Signatur, die ein Post-Quantum-Schlüssel über seine eigenen Registrierungsdaten erstellt und die belegt, dass der Registrierende den privaten Schlüssel besitzt. Seit v3.2.3 bei der Registrierung von Kontoschlüsseln optional (`tx pqc register-key-v2 ... --pqc-key <name>`); für Bridge-Validator-Schlüssel ab v3.2.4 erforderlich (im Testnet seit dem 19. Oktober 2026; im Mainnet ab Höhe 3.742.566).

**Protocol feature** — Ein Verhaltensschalter, den der Upgrade-Handler eines Releases bei einer Blockhöhe auf jedem Node einschaltet (zum Beispiel `pqc-sign-bytes-v2`, `evm-pqc-authorisation-window`), sodass die Historie unterhalb dieser Höhe unverändert wiedergegeben wird.

**PvP Rebase** — Player versus Player Rebase. Ein Mechanismus im xQORE-Modul, bei dem Strafen aus vorzeitiger Entsperrung proportional an die verbleibenden gesperrten Staker umverteilt werden und so langfristiges Engagement belohnen (noch nicht On-Chain angebunden).

**QCAI** — QoreChain Artificial Intelligence. Der Oberbegriff für QoreChains KI-Subsystem, einschließlich der On-Chain-Heuristik-Engine (`x/ai`-Modul) und des Off-Chain-QCAI-Sidecars, der erweiterte Inferenzfähigkeiten bereitstellt.

**QoreChain Native** — QoreChains Name für seine CosmWasm-Smart-Contract-Laufzeit: Contracts werden in Rust gegen die standardmäßigen CosmWasm-Bibliotheken geschrieben und zu WebAssembly kompiliert. Sie ist eine der drei Laufzeiten (EVM, QoreChain Native, SVM). Das normale Hochladen und Instanziieren von Contracts ist derzeit in beiden Netzwerken geschlossen (siehe [QoreChain Native-Entwicklung](/developer-guide/cosmwasm-development)).

**QCB** — QoreChain Bridge. QoreChains natives Bridge-Protokoll zur Verbindung mit Nicht-IBC-Chains (z. B. Ethereum, Bitcoin, Solana, Avalanche). QCB verwendet einen Validator-Attestierungsschwellenwert (7 von 10 ML-DSA-87-Signaturen) für die Cross-Chain-Attestierung. Siehe [Bridge-Architektur](/architecture/bridge-architecture).

**QDRW** — Quadratic Delegation with Reputation Weighting. Eine Governance-Formel für die Stimmkraft (Quadratwurzel des Stakes plus gewichtetes xQORE, skaliert mit einem Reputationsmultiplikator). In `x/qca` implementiert, aber auf den Live-Netzwerken deaktiviert (`qdrw_enabled = false`).

**RDK** — Rollup Development Kit. QoreChains natives Framework zum Bereitstellen und Verwalten von Rollups mit vier Settlement-Paradigmen (optimistic, zk, based, sovereign), fünf Voreinstellungsprofilen und integrierter Datenverfügbarkeit. Siehe [Rollups-Übersicht](/rollups/overview).

**RL** — Reinforcement Learning. Ein Ansatz des maschinellen Lernens, bei dem ein Agent optimale Aktionen durch Versuch und Belohnung erlernt. PRISM ist darauf ausgelegt, mit RL Chain-Parameter innerhalb der QoreChain Consensus Engine abzustimmen (heute nur Beobachtung).

**RPoS** — Reputation Proof-of-Stake. Der Pool für Validatoren ab dem 70. Reputations-Perzentil mit mindestens medianem selbst gebondetem Stake. Validatoren verdienen Reputation durch Verfügbarkeit, Teilnahme und Community-Beiträge.

**SHAKE-256** — Eine Hash-Funktion mit variabler Ausgabelänge aus der SHA-3-Familie. SHAKE-256 ist QoreChains standardmäßiger Anwendungs-Hash (das Paket `qorehash`) und wird für PQC-bezogene Operationen wie die Schlüsselableitung verwendet.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Eine Art von Zero-Knowledge-Beweis, der mit geringer Beweisgröße schnell verifiziert werden kann. Im RDK-Modul als Settlement-Paradigma für zk-Rollups unterstützt.

**STARK** — Scalable Transparent Argument of Knowledge. Ein Zero-Knowledge-Beweissystem, das kein Trusted Setup benötigt und quantenresistent ist. Im RDK als alternatives Beweissystem für zk-Rollup-Settlement verfügbar.

**Stranded staker share / reward-pool reserve** — Beim Upgrade auf v3.2.0 erfasste Beträge, die sich nur durch eine Governance-Abstimmung bewegen; die Governance hat sie im Oktober 2026 freigegeben (ein korrigierter Rest des Stranded Share wurde nach v3.2.3 vorgeschlagen). Siehe [Tokenomics](/architecture/tokenomics#stranded-and-reserve).

**SVM** — Solana Virtual Machine. Eine Hochleistungs-Ausführungsumgebung für BPF-Programme. QoreChain integriert die SVM als eine von drei unterstützten Laufzeiten neben der QoreChain EVM Engine und QoreChain Native.

**TEE** — Trusted Execution Environment. Ein sicherer Bereich eines Prozessors, der sicherstellt, dass Code und Daten vor externem Zugriff geschützt sind. QoreChain definiert Schnittstellenspezifikationen für die TEE-Attestierung; eine Implementierung existiert noch nicht.

**tIBE** — Threshold Identity-Based Encryption. Ein kryptografisches Verfahren, bei dem eine Nachricht nur entschlüsselt werden kann, wenn ein Schwellenwert von Parteien zusammenarbeitet. Wird vom FairBlock-Modul verwendet, um Transaktionsinhalte bis zur Block-Finalisierung zu verschlüsseln und so MEV-Extraktion zu verhindern.

**Time-locked staking** — Eine optionale Bindung eines Teils einer Delegation für eine feste Laufzeit, bereitgestellt vom Modul `x/stakingtier`. Teil von v3.2.4: im Testnet seit dem 19. Oktober 2026; im Mainnet ab Höhe 3.742.566. Siehe [Staking und Delegation](/user-guide/staking-and-delegation#time-locked-staking).

**uqor** — Die Basis-Denomination des QOR-Tokens. 1 QOR = 1.000.000 uqor (10^6). Alle On-Chain-Beträge, Gebühren und Staking-Werte werden in uqor angegeben.

**xQORE** — Das Governance-Staking-Derivat von QOR. Nutzer sperren QOR, um xQORE zu erhalten, das erweiterte Governance-Stimmrechte gewährt und PvP-Rebase-Belohnungen aus Strafen für vorzeitige Entsperrung verdient (vorgesehenes Verhalten; die Sperr- und Entsperr-Transaktionen sind noch nicht On-Chain angebunden). Siehe [Tokenomics](/architecture/tokenomics#x-xqore).
