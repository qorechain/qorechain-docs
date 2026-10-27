---
slug: /qoresign/guides/evm-quantum-ready
title: "Wallet EVM: finestra di autorizzazione"
sidebar_label: Finestra di autorizzazione EVM
sidebar_position: 3
---

# Wallet EVM: finestra di autorizzazione

Le transazioni Ethereum non hanno alcun campo in cui possa viaggiare una seconda
firma, e la rete applica la propria impostazione PQC a livello di chain intera e
non per singola corsia. Perciò una transazione inviata sulla corsia EVM di
QoreChain è firmata solo con secp256k1, e QoreSign non offre una firma EVM
ibrida (`assertHybridLane("evm")` genera `LANE_NOT_AVAILABLE`).

La rete ammette invece una transazione EVM solo se il suo mittente ha una chiave
ML-DSA-87 registrata e una **finestra di autorizzazione EVM** attiva che la
copra. La finestra viene aperta dalla corsia nativa con una transazione firmata
in modo ibrido, così la chiave post-quantistica autorizza in anticipo l'attività
EVM. La transazione EVM stessa è firmata solo con secp256k1.
Entrambe le reti pubbliche applicano questa regola (funzionalità di protocollo
`evm-pqc-authorisation-window`, leggibile con `fetchProtocolFeatures` nel
[QoreChain SDK](/sdk/overview) oppure su `/qorechain/pqc/v1/protocol_features`).

## Passaggi per un account EVM {#steps}

1. Registra una chiave ML-DSA-87 per l'account sulla corsia nativa
   (`buildRegisterPqKeyMessage`, vedi
   [Registrazione](/qoresign/spec/hybrid-signing-v1#registration)). Per un
   account `eth_secp256k1` gli stessi 20 byte di indirizzo hanno una forma
   `qor1`; usala come `sender`.
2. Apri una finestra con una transazione sulla corsia nativa firmata in modo
   ibrido: un'altezza di scadenza, un numero massimo di transazioni EVM, un
   valore massimo e, facoltativamente, i contratti che può chiamare. Il
   QoreChain SDK dispone di composer per i messaggi della finestra.
3. Invia transazioni EVM da qualsiasi wallet EIP-1193 mentre la finestra è
   aperta. Fuori da una finestra, o oltre i suoi limiti, la rete le rifiuta,
   quindi la sola chiave secp256k1 non può muovere valore sulla corsia EVM.

Quando la rete aggiungerà il PQC per singola corsia anche per la corsia EVM,
QoreSign introdurrà una modalità EVM ibrida in una nuova versione minore.

## MetaMask e altri wallet EIP-1193 {#eip-1193-wallets}

MetaMask e gli altri wallet EIP-1193 non possono aggiungere una firma ML-DSA-87 a
`eth_sendTransaction`; per loro la finestra, aperta da un wallet che detiene la
chiave ML-DSA-87, è il percorso disponibile.
