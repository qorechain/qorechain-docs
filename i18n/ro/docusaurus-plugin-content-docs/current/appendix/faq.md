---
slug: /appendix/faq
title: Întrebări frecvente
sidebar_label: Întrebări frecvente
sidebar_position: 5
---

# Întrebări frecvente

Întrebări generale despre QoreChain, cu răspunsuri din documentație. Fiecare răspuns trimite către pagina de referință pentru detalii complete. Pentru întrebări specifice SDK-ului, vezi [Întrebări frecvente SDK](/sdk/faq).

### Este mainnet-ul live?

Da. Mainnet-ul QoreChain (lanțul `qorechain-vladi`, EVM chain ID 9801) este live din 7 iunie 2026. Vezi [Rețele](/appendix/networks) și [Conectarea la mainnet](/getting-started/connecting-to-mainnet).

### Care sunt chain ID-urile și EVM chain ID-urile?

Mainnet-ul este lanțul Cosmos `qorechain-vladi` cu EVM chain ID **9801** (hex `0x2649`); testnet-ul este `qorechain-diana` cu EVM chain ID **9800** (hex `0x2648`). Vezi [Rețele](/appendix/networks) pentru tabelul complet.

### Cum sunt distribuite comisioanele de tranzacție?

Comisioanele colectate sunt împărțite **37% validatorilor, 30% arse, 20% trezoreriei comunitare, 10% stakerilor și 3% nodurilor light**. Vezi [Tokenomics](/architecture/tokenomics).

### Ce este PRISM?

PRISM este stratul de optimizare prin învățare prin întărire integrat în QoreChain Consensus Engine. Observă metricile rețelei și propune ajustări deterministe ale parametrilor de consens sub controale de siguranță de tip întrerupător de circuit. Vezi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Este bridge-ul cross-chain live?

Bridge-ul cross-chain se află în prezent pe testnet și este în așteptare — nu este încă un sistem de producție. Este conceput în jurul a 37 de configurații de lanț QCB și 8 canale IBC; tratați aceste ținte mai degrabă ca intenție de design decât ca garanții live de mainnet. Vezi [Arhitectura bridge-ului](/architecture/bridge-architecture).

### Cum conectez un portofel?

Configurați un portofel și adăugați o rețea QoreChain folosind EVM chain ID-urile (9801 mainnet, 9800 testnet). Vezi [Configurarea portofelului](/getting-started/wallet-setup).

### Cum obțin tokenuri de testnet?

Folosiți faucet-ul de testnet din Dashboard. Vezi [Faucet Dashboard](/dashboard/faucet) și [Conectarea la testnet](/getting-started/connecting-to-testnet).

### Cum rulez un nod, un validator sau un nod light?

Pentru un nod complet, vezi [Rularea unui nod](/developer-guide/running-a-node). Pentru un validator, vezi [Rularea unui validator](/developer-guide/running-a-validator). Pentru un nod light, vezi [Nod light](/light-node/overview).

### Ce schemă de semnătură folosește QoreChain?

QoreChain folosește o schemă hibridă post-cuantică care combină **secp256k1 (ECDSA)** clasic cu **ML-DSA-87 (Dilithium-5)** post-cuantic. Această schemă hibridă este obligatorie implicit pe calea de tranzacții Cosmos, cu modul de aplicare controlat prin guvernanță. Vezi [Securitate post-cuantică](/architecture/post-quantum-security).

### Cum construiesc un rollup?

Folosiți QoreChain Rollup Development Kit. Vezi [Rollup-uri](/rollups/overview) și referința de arhitectură [Rollup Development Kit](/architecture/rollup-development-kit).

### Cum construiesc un dApp?

Folosiți [QoreChain SDK](/sdk/overview), SDK-ul public pentru construirea de aplicații pe QoreChain în mediile sale de execuție EVM, SVM și CosmWasm.

### Unde pot pune întrebări?

Botul comunitar QCAIA răspunde la întrebări pe Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) și Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Vezi [Botul comunitar QCAIA](/qcaia/overview).

## Resurse conexe

* [Rețele](/appendix/networks) — referință pentru chain ID-uri, porturi și endpoint-uri.
* [Ce este QoreChain](/introduction/what-is-qorechain) — prezentarea generală a platformei.
* [Botul comunitar QCAIA](/qcaia/overview) — pune întrebări pe Discord și Telegram.
