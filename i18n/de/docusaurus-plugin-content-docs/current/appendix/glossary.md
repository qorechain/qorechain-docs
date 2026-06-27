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

**BPF** — Berkeley Packet Filter. Das Bytecode-Format, das von der SVM-Laufzeit zur Ausführung von On-Chain-Programmen verwendet wird. Programme werden vor dem Deployment zu BPF kompiliert.

**Chain License** — Ein On-Chain-Lizenzeintrag, der vom `x/license`-Modul verwaltet wird. Chain Licenses steuern den Zugriff auf bestimmte Protokollfunktionen und ermöglichen es Betreibern, Lizenzberechtigungen On-Chain zu registrieren, zu verifizieren und zu verwalten. Siehe [Chain-Lizenzierung](/architecture/chain-licensing).

**CLFB** — Cross-Layer Fee Balancing. Ein Mechanismus innerhalb der Multilayer-Architektur, der Gebühren über Sidechains und Paychains hinweg dynamisch anpasst, um ein Gleichgewicht aufrechtzuerhalten und Überlastung auf einer einzelnen Ebene zu verhindern.

**CPI** — Cross-Program Invocation. Ein Mechanismus in der SVM-Laufzeit, der es einem bereitgestellten Programm ermöglicht, ein anderes Programm innerhalb desselben Transaktionskontexts aufzurufen.

**CPoS** — Classified Proof-of-Stake. QoreChains Konsens-Klassifizierungssystem, das Validatoren basierend auf Reputations-Scores in drei Pools (Emerald, Sapphire, Ruby) gruppiert. Jeder Pool hat unterschiedliche Gewichte im Proposer-Auswahlalgorithmus.

**DA** — Data Availability. Die Garantie, dass an die Chain veröffentlichte Transaktionsdaten von jedem Node abgerufen werden können. Das RDK-Modul bietet native DA für Rollups und speichert Blobs On-Chain mit konfigurierbaren Aufbewahrungsfristen.

**DPoS** — Delegated Proof-of-Stake. Ein Konsensmechanismus, bei dem Token-Inhaber ihren Stake an Validatoren delegieren, die in ihrem Namen Blöcke produzieren. QoreChain erweitert DPoS um eine reputationsgewichtete Klassifizierung (CPoS).

**EIP-1559** — Ethereum Improvement Proposal 1559. Ein Transaktionsgebührenmodell, das eine Basisgebühr (verbrannt) plus eine Prioritätsgebühr (an Validatoren gezahlt) verwendet. QoreChain implementiert EIP-1559-artige Gebührenmechaniken in seiner QoreChain EVM Engine.

**HCS** — Hybrid Cryptographic Signatures. QoreChains Doppelsignatursystem, bei dem Transaktionen sowohl eine klassische Signatur (secp256k1/ECDSA) als auch eine Post-Quantum-Signatur (ML-DSA-87) tragen und so kryptografische Sicherheit gegen klassische wie auch quantenbasierte Angreifer bieten.

**IBC** — Inter-Blockchain Communication. Ein Protokoll für authentifizierte Nachrichtenübermittlung zwischen unabhängigen Blockchains. QoreChain unterstützt IBC-Kanäle für Cross-Chain-Token-Transfers und Daten-Relay.

**Light Node** — Ein ressourcenschonender Node, der der Chain folgt und leichtgewichtige Abfragen bedient, ohne den vollständigen Status zu halten. Light Nodes erhalten einen dedizierten Anteil von **3%** der Protokoll-Gebührenaufteilung und belohnen damit Teilnehmer, die die Netzwerkreichweite erweitern. Siehe [Light Node](/light-node/overview).

**MEV** — Maximal Extractable Value. Der Gewinn, der durch Umordnen, Einfügen oder Zensieren von Transaktionen innerhalb eines Blocks erzielt werden kann. QoreChains FairBlock-Modul (tIBE-Verschlüsselung) und die 5-Lane-TX-Priorisierung mindern die MEV-Extraktion.

**ML-DSA-87** — Module-Lattice Digital Signature Algorithm (Sicherheitsstufe 5). Das von NIST standardisierte Post-Quantum-Verfahren für digitale Signaturen, das von QoreChain für quantenresistente Transaktionssignierung verwendet wird. Erzeugt Signaturen von 4.627 Bytes mit öffentlichen Schlüsseln von 2.592 Bytes.

**ML-KEM-1024** — Module-Lattice Key Encapsulation Mechanism (Sicherheitsstufe 5). Ein von NIST standardisiertes Post-Quantum-Schlüsselkapselungsverfahren, das in QoreChains PQC-Algorithmusregistrierung für künftige verschlüsselte Kommunikationskanäle verfügbar ist.

**MLP** — Multi-Layer Perceptron. Eine Klasse neuronaler Netze, die von QCAI für Mustererkennung bei der Betrugserkennung und Anomaliebewertung verwendet wird.

**PPO** — Proximal Policy Optimization. Ein Reinforcement-Learning-Algorithmus, der von PRISM verwendet wird, um Chain-Parameter (Blockgröße, Gas-Limits, Größe des Validator-Sets) basierend auf beobachteten Netzwerkbedingungen zu optimieren.

**PQC** — Post-Quantum Cryptography. Kryptografische Algorithmen, die so konzipiert sind, dass sie gegen Angriffe sowohl von klassischen als auch von Quantencomputern sicher sind. QoreChain implementiert PQC über sein `x/pqc`-Modul mit ML-DSA-87 als primärem Signaturverfahren.

**PRISM** — Policy-driven Reinforcement-learning for Intelligent State Machines. Die Reinforcement-Learning-Optimierungsschicht, die in die QoreChain Consensus Engine eingebettet ist (über das `x/rlconsensus`-Modul). PRISM beobachtet Netzwerkmetriken und schlägt deterministische Anpassungen der Konsensparameter unter Sicherungsschalter-Sicherheitskontrollen vor. Siehe [PRISM Consensus Engine](/architecture/prism-consensus-engine).

**PvP Rebase** — Player versus Player Rebase. Ein Mechanismus im xQORE-Modul, bei dem Strafen aus vorzeitiger Entsperrung proportional an die verbleibenden gesperrten Staker umverteilt werden und so langfristiges Engagement belohnen.

**QCAI** — QoreChain Artificial Intelligence. Der Oberbegriff für QoreChains KI-Subsystem, einschließlich der On-Chain-Heuristik-Engine (`x/ai`-Modul) und des Off-Chain-QCAI-Sidecars, der erweiterte Inferenzfähigkeiten bereitstellt.

**QCB** — QoreChain Bridge. QoreChains natives Bridge-Protokoll zur Verbindung mit Nicht-IBC-Chains (z. B. Ethereum, Bitcoin, Solana, Avalanche). QCB verwendet ein föderiertes Validator-Set für die Cross-Chain-Attestierung. Siehe [Bridge-Architektur](/architecture/bridge-architecture).

**QDRW** — QoreChain Dynamic Reward Weighting. Ein Governance-Mechanismus, der es PRISM (unter Governance-Genehmigung) ermöglicht, die Gewichte der Belohnungsverteilung über Validator-Pools hinweg dynamisch anzupassen und so auf Netzwerk-Gesundheitsmetriken hin zu optimieren.

**RDK** — Rollup Development Kit. QoreChains natives Framework zum Bereitstellen und Verwalten von Rollups mit vier Settlement-Paradigmen (optimistic, zk, based, sovereign), fünf Voreinstellungsprofilen und integrierter Datenverfügbarkeit. Siehe [Rollups-Übersicht](/rollups/overview).

**RL** — Reinforcement Learning. Ein Ansatz des maschinellen Lernens, bei dem ein Agent optimale Aktionen durch Versuch und Belohnung erlernt. PRISM verwendet RL, um Chain-Parameter innerhalb der QoreChain Consensus Engine dynamisch abzustimmen.

**RPoS** — Reputation-based Proof-of-Stake. Das übergreifende Konsensmodell, das DPoS-Delegation mit Reputationsbewertung kombiniert. Validatoren verdienen Reputation durch Verfügbarkeit, Teilnahme und Community-Beiträge, was die Häufigkeit ihrer Blockvorschläge beeinflusst.

**SHAKE-256** — Eine Hash-Funktion mit variabler Ausgabelänge aus der SHA-3-Familie. QoreChain verwendet SHAKE-256 als grundlegende Hash-Funktion für PQC-bezogene Operationen, einschließlich Schlüsselableitung und Adressberechnung.

**SNARK** — Succinct Non-interactive Argument of Knowledge. Eine Art von Zero-Knowledge-Beweis, der mit geringer Beweisgröße schnell verifiziert werden kann. Im RDK-Modul als Settlement-Paradigma für zk-Rollups unterstützt.

**STARK** — Scalable Transparent Argument of Knowledge. Ein Zero-Knowledge-Beweissystem, das kein Trusted Setup benötigt und quantenresistent ist. Im RDK als alternatives Beweissystem für zk-Rollup-Settlement verfügbar.

**SVM** — Solana Virtual Machine. Eine Hochleistungs-Ausführungsumgebung für BPF-Programme. QoreChain integriert die SVM als eine von drei unterstützten Laufzeiten neben der QoreChain EVM Engine und CosmWasm.

**TEE** — Trusted Execution Environment. Ein sicherer Bereich eines Prozessors, der sicherstellt, dass Code und Daten vor externem Zugriff geschützt sind. QoreChains PQC-Modul unterstützt TEE-Attestierung für Schlüsselerzeugungsnachweise.

**tIBE** — Threshold Identity-Based Encryption. Ein kryptografisches Verfahren, bei dem eine Nachricht nur entschlüsselt werden kann, wenn ein Schwellenwert von Parteien zusammenarbeitet. Wird vom FairBlock-Modul verwendet, um Transaktionsinhalte bis zur Block-Finalisierung zu verschlüsseln und so MEV-Extraktion zu verhindern.

**uqor** — Die Basis-Denomination des QOR-Tokens. 1 QOR = 1.000.000 uqor (10^6). Alle On-Chain-Beträge, Gebühren und Staking-Werte werden in uqor angegeben.

**xQORE** — Das Governance-Staking-Derivat von QOR. Nutzer sperren QOR, um xQORE zu erhalten, das erweiterte Governance-Stimmrechte gewährt und PvP-Rebase-Belohnungen aus Strafen für vorzeitige Entsperrung verdient. Siehe [Tokenomics](/architecture/tokenomics).
