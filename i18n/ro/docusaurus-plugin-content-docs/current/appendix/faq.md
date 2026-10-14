---
slug: /appendix/faq
title: Întrebări frecvente
sidebar_label: Întrebări frecvente
sidebar_position: 5
---

# Întrebări frecvente

Întrebări generale despre QoreChain, cu răspunsuri din documentație. Fiecare răspuns trimite către pagina de referință pentru detalii complete. Pentru întrebări specifice SDK-ului, vezi [Întrebări frecvente SDK](/sdk/faq).

### Este mainnet-ul live?

Da. Mainnet-ul QoreChain (lanțul `qorechain-vladi`, EVM chain ID 9801) este live din 29 iunie 2026 și rulează versiunea v3.2.1. Vezi [Rețele](/appendix/networks) și [Conectarea la mainnet](/getting-started/connecting-to-mainnet).

### Care sunt chain ID-urile și EVM chain ID-urile?

Mainnet-ul este lanțul Cosmos `qorechain-vladi` cu EVM chain ID **9801** (hex `0x2649`); testnet-ul este `qorechain-diana` cu EVM chain ID **9800** (hex `0x2648`). Vezi [Rețele](/appendix/networks) pentru tabelul complet.

### Cum sunt distribuite comisioanele de tranzacție?

Comisioanele colectate sunt împărțite **37% validatorilor, 30% arse, 20% trezoreriei comunitare, 10% stakerilor și 3% nodurilor light**. Împărțirea se aplică întregii sume din colectorul de comisioane, care include și emisia epocii. Vezi [Tokenomics](/architecture/tokenomics#fee-distribution).

### Ce este PRISM?

PRISM este stratul de optimizare prin învățare prin întărire integrat în QoreChain Consensus Engine. Observă metricile rețelei și propune ajustări deterministe ale parametrilor de consens sub controale de siguranță de tip întrerupător de circuit. Astăzi rulează în mod de observare: nu este încărcată nicio politică antrenată, așa că nu modifică niciun parametru. Vezi [PRISM Consensus Engine](/architecture/prism-consensus-engine).

### Este bridge-ul cross-chain live?

Nu. Modulul de bridge este implementat, dar toate cele 37 de configurații de lanț sunt în așteptare, nu este înregistrat niciun validator de bridge și nu există canale IBC pe niciuna dintre rețele. Este conceput în jurul a 37 de configurații de lanț și până la 8 contrapărți IBC; tratați aceste ținte ca intenție de design. Vezi [Arhitectura bridge-ului](/architecture/bridge-architecture).

### Cum conectez un portofel?

Folosiți portofelul oficial [QoreX](/qorex/overview) sau adăugați o rețea QoreChain la un portofel EVM folosind EVM chain ID-urile (9801 mainnet, 9800 testnet). Vezi [Configurarea portofelului](/getting-started/wallet-setup).

### Cum obțin tokenuri de testnet?

Folosiți faucet-ul de testnet din Dashboard. Vezi [Faucet Dashboard](/dashboard/faucet) și [Conectarea la testnet](/getting-started/connecting-to-testnet).

### Cum rulez un nod, un validator sau un nod light?

Pentru un nod complet, vezi [Rularea unui nod](/developer-guide/running-a-node). Pentru un validator, vezi [Rularea unui validator](/developer-guide/running-a-validator). Pentru un nod light, vezi [Nod light](/light-node/overview).

### Ce schemă de semnătură folosește QoreChain?

QoreChain folosește o schemă hibridă post-cuantică care combină **secp256k1 (ECDSA)** clasic cu **ML-DSA-87 (Dilithium-5)** post-cuantic. Această schemă hibridă este obligatorie implicit pe calea de tranzacții Cosmos, cu modul de aplicare controlat prin guvernanță. Pe banda EVM semnătura rămâne secp256k1, iar un cont trebuie să dețină în plus o cheie ML-DSA înregistrată și o fereastră de autorizare deschisă (v3.2.0). Vezi [Securitate post-cuantică](/architecture/post-quantum-security).

### De ce este refuzată tranzacția mea EVM cu „no open EVM authorisation window"?

Începând cu v3.2.0, banda EVM admite o tranzacție doar de la un cont care are o cheie post-cuantică înregistrată și o fereastră de autorizare deschisă. Deschide o fereastră cu o tranzacție pe banda Cosmos semnată post-cuantic, apoi reîncearcă. Vezi [Fereastra de autorizare EVM](/getting-started/first-transaction#evm-window).

### Ce timp de bloc ar trebui să mă aștept?

Aproximativ 3,2 secunde pe mainnet și aproximativ 1 secundă pe testnet (medii măsurate, octombrie 2026). Timpul de bloc este stabilit de configurația nodurilor validatorilor.

### Este xQORE disponibil?

Încă nu. Modulul de contabilitate există, dar tranzacțiile de blocare și deblocare nu sunt conectate la rețelele live. Vezi [Tokenomics](/architecture/tokenomics#x-xqore).

### Este oferta de QOR fixă?

Oferta la genesis a fost de 4.420.000.000 QOR. Emisia de staking este bătută sub un plafon cumulativ strict de 114.285.714 QOR, iar arderile elimină definitiv tokenuri. Vezi [Tokenomics](/architecture/tokenomics#supply-and-emission).

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
