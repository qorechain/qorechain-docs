---
slug: /qoresign/guides/evm-quantum-ready
title: "Portofele EVM: fereastra de autorizare"
sidebar_label: Fereastra de autorizare EVM
sidebar_position: 3
---

# Portofele EVM: fereastra de autorizare

Tranzacțiile Ethereum nu au un câmp în care să circule o a doua semnătură, iar
rețeaua aplică setarea PQC la nivelul întregului lanț, nu per lane. Așadar, o
tranzacție trimisă pe lane-ul EVM al QoreChain este semnată doar cu secp256k1,
iar QoreSign nu oferă o semnătură EVM hibridă (`assertHybridLane("evm")`
aruncă `LANE_NOT_AVAILABLE`).

În schimb, rețeaua admite o tranzacție EVM numai dacă expeditorul ei are o cheie
ML-DSA-87 înregistrată și o **fereastră de autorizare EVM** activă care o
acoperă. Fereastra este deschisă de pe lane-ul nativ printr-o tranzacție
semnată hibrid, astfel încât cheia post-cuantică autorizează în avans activitatea
EVM. Tranzacția EVM în sine este semnată doar cu secp256k1. Ambele rețele
publice aplică această regulă (funcționalitatea de protocol
`evm-pqc-authorisation-window`, care poate fi citită cu `fetchProtocolFeatures`
din [SDK-ul QoreChain](/sdk/overview) sau la
`/qorechain/pqc/v1/protocol_features`).

## Pașii pentru un cont EVM {#steps}

1. Înregistrați pe lane-ul nativ o cheie ML-DSA-87 pentru cont
   (`buildRegisterPqKeyMessage`, vezi
   [Înregistrare](/qoresign/spec/hybrid-signing-v1#registration)). Pentru un cont
   `eth_secp256k1`, aceiași 20 de octeți de adresă au o formă `qor1`; folosiți-o
   ca `sender`.
2. Deschideți o fereastră printr-o tranzacție de pe lane-ul nativ semnată
   hibrid: o înălțime de expirare, un număr maxim de tranzacții EVM, o valoare
   maximă și, opțional, contractele pe care le poate apela. SDK-ul QoreChain are
   compozitori pentru mesajele ferestrei.
3. Trimiteți tranzacții EVM din orice portofel EIP-1193 cât timp fereastra este
   deschisă. În afara unei ferestre sau peste limitele ei, rețeaua le refuză,
   deci cheia secp256k1 singură nu poate muta valoare pe lane-ul EVM.

Când rețeaua va adăuga PQC per lane pentru lane-ul EVM, QoreSign va adăuga un
mod EVM hibrid într-o versiune minoră nouă.

## MetaMask și alte portofele EIP-1193 {#eip-1193-wallets}

MetaMask și alte portofele EIP-1193 nu pot adăuga o semnătură ML-DSA-87 la
`eth_sendTransaction`; pentru ele, fereastra, deschisă dintr-un portofel care
deține cheia ML-DSA-87, este calea disponibilă.
