---
slug: /qorex/send-and-receive
title: Invia e ricevi
sidebar_label: Invia e ricevi
sidebar_position: 3
---

# Invia e ricevi

La scheda Home (Wallet) è il tuo punto di partenza. Mostra un **badge di rete** (MAINNET per impostazione predefinita, oppure TESTNET se hai attivato l'interruttore per sviluppatori), il tuo **saldo totale** (tocca per nascondere/mostrare) e le azioni principali: **Send · Receive · Swap · Stake**. L'elenco dei tuoi asset mostra **QOR** (Native + post-quantistico 🛡, un unico saldo unificato tra le lane Native/EVM/SVM) e **All networks** (una vista unificata di ETH · BNB · POL · ARB).

## Invia QOR a prova di quantistica

1. Tocca **Send**.
2. Inserisci il destinatario come indirizzo `qor1…` **oppure** come **@handle**. Un handle viene risolto e verificato crittograficamente (firma del registro + firma del proprietario + pinning trust-on-first-use); se la chiave di un handle cambia silenziosamente, QoreX mostra un avviso esplicito.
3. Inserisci l'importo. L'anteprima mostra il destinatario, l'importo, la commissione e lo stato dello **Shield** — il livello di protezione post-quantistica della firma.
4. Conferma con l'approvazione **biometrica**. QoreX firma il trasferimento con la firma ibrida post-quantistica obbligatoria (ML-DSA-87 + secp256k1) e lo trasmette sulla lane Native.

Il tuo **primo** trasferimento registra automaticamente sulla catena anche la tua chiave post-quantistica — puoi vederlo in [Sicurezza e recupero](/qorex/security-and-recovery#pqc-key). Non è necessario alcun passaggio separato.

## Ricevi QOR

Tocca **Receive** per mostrare il tuo indirizzo `qor1…` come codice QR (con l'icona QoreChain incorporata) e un pulsante per copiare. Condividi uno dei due con il mittente.

## Richiedi un pagamento

Tocca **Request** (richiede l'[accesso](/qorex/account-and-dashboard#sign-in)) per creare una richiesta di pagamento — un importo più un memo facoltativo — come codice QR o link. Chiunque lo scansiona vede il trasferimento precompilato.

## Reti e token esterni

Da **All networks** (o Send-external) puoi inviare nativamente **ETH, BNB, POL, ARB e SOL**, oltre ai token **ERC-20** e **SPL** — tutti derivati dalla stessa frase di recupero (ETH usa `m/44'/60'`, SOL usa il suo percorso standard e SPL usa gli associated token account).

:::caution Le catene esterne sono solo classiche
Le altre blockchain non possono trasportare firme post-quantistiche. Quando invii su una rete esterna, QoreX lo dichiara esplicitamente (il trasferimento usa una firma classica e lo **Shield** mostra il downgrade). I tuoi **QOR** rimangono sempre sulla lane Native protetta. Gli invii esterni basati su Cosmos supportano un memo facoltativo.
:::

## Swap

La scheda **Swap** è collegata all'AMM on-chain di QoreChain ma resta disattivata — il pulsante riporta **"Swap — coming with pool liquidity"** — finché la liquidità e il feature flag remoto non la abilitano. Quando ciò accade si attiva automaticamente; **non è necessario alcun aggiornamento dell'app**.

## Passaggi successivi

- [Portfolio e staking](/qorex/portfolio-and-staking) — visualizza la tua allocazione e guadagna ricompense.
- [Sicurezza e recupero](/qorex/security-and-recovery) — proteggi e recupera il tuo wallet.
