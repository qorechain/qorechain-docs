---
slug: /qorex/send-and-receive
title: Invia e ricevi
sidebar_label: Invia e ricevi
sidebar_position: 3
---

# Invia e ricevi

La scheda Home (Wallet) è il tuo punto di partenza. Mostra un **badge di rete** (MAINNET per impostazione predefinita, oppure TESTNET se hai attivato l'opzione per sviluppatori), il tuo **saldo totale** (tocca per nascondere/mostrare) e le azioni principali: **Send · Receive · Swap · Stake**. La tua lista asset mostra **QOR** (Native + post-quantistico 🛡, un saldo unificato tra le lane Native/EVM/SVM) e **All networks** (una vista unificata su ETH, BNB, POL, ARB e le altre [reti esterne](#external-networks-tokens) supportate da QoreX).

## Invia QOR quantum-safe

1. Tocca **Send**.
2. Inserisci il destinatario come indirizzo `qor1…` **oppure** come **@handle**. Un handle viene risolto e verificato crittograficamente (firma del registro + firma del proprietario + pinning trust-on-first-use); se la chiave di un handle cambia silenziosamente, QoreX mostra un avviso esplicito.
3. Inserisci l'importo. L'anteprima mostra il destinatario, l'importo, la commissione e lo stato **Shield** — il livello di protezione post-quantistica della firma.
4. Conferma con l'approvazione **biometrica**. QoreX firma il trasferimento con la firma ibrida post-quantistica obbligatoria (ML-DSA-87 + secp256k1) e lo trasmette sulla lane Native.

Il tuo **primo** trasferimento registra automaticamente anche la tua chiave post-quantistica on-chain — puoi vederlo in [Sicurezza e recupero](/qorex/security-and-recovery#pqc-key). Non è necessario alcun passaggio separato.

### Inviare a un @handle, passo dopo passo {#handle-send}

1. Apri **Send** e digita `@` seguito dall'handle (ad esempio `@liviu`) nel campo destinatario al posto di un indirizzo.
2. QoreX cerca l'handle e ti mostra l'**indirizzo `qor1…` risolto** prima che tu confermi qualsiasi cosa.
3. Controlla l'indirizzo risolto, inserisci l'importo e conferma come al solito.

QoreX accetta solo una risoluzione che superi **entrambi** i controlli che esegue: un'attestazione del registro verificata rispetto a una chiave di fiducia fissata nell'app, e la firma del proprietario dell'handle stesso sulla dichiarazione. Il mancato superamento di uno dei due controlli genera un errore, senza ricadere su un indirizzo non verificato. La prima volta che paghi un determinato handle, QoreX memorizza l'indirizzo a cui è stato risolto; se l'indirizzo di quell'handle dovesse mai cambiare, QoreX si ferma prima di firmare e mostra l'indirizzo vecchio e quello nuovo affiancati, così puoi decidere se procedere. Questa memoria è **per dispositivo** — pagare lo stesso handle per la prima volta da un altro telefono o da un'installazione nuova lo mostra come nuovo anche lì, il che è previsto e non un errore. L'estensione del browser risolve e paga gli handle allo stesso modo (la sua memoria è **per browser**, quindi un browser o un computer diverso lo vede come nuovo) — vedi [Inviare a un @handle](/qorex/browser-extension#handle-send).

### Invio di QOR in vesting (bloccati) {#vesting}

Se parte del tuo saldo è ancora in **vesting** — ad esempio un'allocazione TGE non ancora rilasciata — il tuo totale viene suddiviso in **disponibile ora** e **ancora bloccato**. Puoi inviare solo la parte disponibile; QoreX rifiuta autonomamente un tentativo di spesa eccessiva, invece di lasciare che sia la rete a rifiutarlo dopo aver comunque addebitato una commissione. La parte bloccata diventa spendibile gradualmente man mano che il piano di vesting la sblocca. Questa suddivisione è mostrata ovunque compaia il tuo saldo — Home, Send e i dettagli dell'asset.

## Ricevi QOR

Tocca **Receive** per mostrare il tuo indirizzo `qor1…` come codice QR (con l'icona QoreChain incorporata) e un pulsante di copia. Condividi l'uno o l'altro con chi ti invia i fondi.

:::note Ricevere per la prima volta un asset di una rete esterna
La schermata **Receive** mostra solo una rete su cui hai già un saldo — quindi se non hai mai avuto ETH, lì non c'è ancora alcuna opzione ETH da scegliere. Il tuo indirizzo EVM esiste fin dal momento in cui esiste il tuo wallet (è derivato dalla stessa recovery phrase) ed è lo stesso indirizzo su Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet e Avalanche — trovalo e copialo da **Settings → Addresses** e condividi quello. Una volta arrivato un trasferimento, quella rete comparirà d'ora in poi in Receive.
:::

## Richiedi un pagamento

Tocca **Request** (richiede l'[accesso](/qorex/account-and-dashboard#sign-in)) per creare una richiesta di pagamento — un importo più una nota facoltativa — come codice QR o link. Chiunque lo scansioni vede il trasferimento precompilato.

## Reti e token esterni {#external-networks-tokens}

Da **All networks** (o Send-external) puoi inviare in modo nativo **ETH, BNB, POL, AVAX e SOL**, oltre a ETH su **Arbitrum, Base e OP Mainnet**, e **ATOM, OSMO e TIA** su Cosmos, oltre a token **ERC-20**, **SPL** e **IBC** — USDC e USDT sulle chain EVM e su Solana, DAI su Ethereum e Noble USDC via IBC — tutti derivati dalla stessa recovery phrase (ETH usa `m/44'/60'`, SOL usa il suo percorso standard e SPL usa gli associated token account).

:::caution Le chain esterne sono solo classiche
Le altre blockchain non possono portare firme post-quantistiche. Quando invii su una rete esterna, QoreX lo dichiara esplicitamente (il trasferimento usa una firma classica e lo **Shield** mostra il downgrade). Il tuo **QOR** resta sempre sulla lane Native protetta. Gli invii esterni basati su Cosmos supportano una nota facoltativa.
:::

## Swap

La scheda **Swap** è collegata all'AMM on-chain di QoreChain ma resta disabilitata — il pulsante mostra **"Swap — coming with pool liquidity"** — finché la liquidità e il feature flag remoto non la attivano. Quando ciò accade si attiva automaticamente; **non è necessario alcun aggiornamento dell'app**.

:::note iOS
La scheda Swap non compare affatto nella build dell'App Store — Apple considera uno scambio di token in-app un servizio regolamentato. Swap resta disponibile (una volta abilitato) su Android e nell'estensione del browser.
:::

## Prossimi passi

- [Portafoglio e staking](/qorex/portfolio-and-staking) — visualizza la tua allocazione e guadagna ricompense.
- [Sicurezza e recupero](/qorex/security-and-recovery) — proteggi e recupera il tuo wallet.
