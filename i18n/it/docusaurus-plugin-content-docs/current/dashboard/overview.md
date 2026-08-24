---
slug: /dashboard/overview
title: Panoramica della Dashboard e Guida introduttiva
sidebar_label: Panoramica e Guida introduttiva
sidebar_position: 1
---

# Panoramica della Dashboard e Guida introduttiva

La Dashboard di QoreChain all'indirizzo **[dashboard.qorechain.io](https://dashboard.qorechain.io)** è l'applicazione web ufficiale per usare QoreChain dal tuo browser. Da un unico posto puoi esplorare la chain, gestire un wallet, scambiare token, spostare asset tra chain diverse, generare e verificare smart contract, fare staking verso i validatori, richiedere token di testnet, completare quest e accedere agli strumenti della rete.

Tutto in questa sezione è una guida pratica per l'utente: cosa fa ogni pagina e come usarla. Non è richiesta alcuna installazione — la Dashboard funziona interamente nel tuo browser.

## Cosa puoi fare

| Area | A cosa serve |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Naviga tra blocchi, transazioni, indirizzi e validatori. |
| **[Wallet](/dashboard/wallet)** | Visualizza il tuo saldo e la cronologia e ricevi QOR — con il tuo wallet personale (non-custodial) su mainnet, oppure con un wallet di test gestito dalla dashboard su testnet. |
| **[Trade](/dashboard/trade)** | Scambia token e fornisci liquidità sull'AMM on-chain. |
| **[Bridge](/dashboard/bridge)** | Sposta asset tra QoreChain e altre chain. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Genera smart contract con **QCAI** su 17 blockchain supportate. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Esegui un'analisi di sicurezza **QCAI** su uno smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Esamina i validatori e delega i tuoi QOR. |
| **[Faucet](/dashboard/faucet)** | Richiedi token di test su testnet. |
| **[Quests](/dashboard/quests)** | Completa attività guidate per imparare a conoscere la rete. |
| **[Tools Hub](/dashboard/tools-hub)** | Accedi agli strumenti per nodi, rollup, SDK e licenze. |

## Collega il tuo wallet {#connect-your-wallet}

La maggior parte delle azioni che modificano lo stato on-chain — inviare token, fare swap, staking, bridging — richiede un wallet collegato. Il modo in cui la Dashboard gestisce le chiavi dipende dalla rete:

- **La mainnet è non-custodial.** La Dashboard non detiene mai le tue chiavi di mainnet. Colleghi il tuo wallet personale — **QoreX** (il wallet ufficiale di QoreChain, estensione o app), **Keplr** o **MetaMask** — e la Dashboard legge il tuo saldo reale e la tua cronologia dalla chain. Ogni transazione su mainnet viene firmata nel tuo wallet, mai dalla Dashboard. L'invio e lo staking sul **rail Native richiedono QoreX**, poiché gli account QoreChain firmano con una firma ibrida post-quantistica che oggi solo QoreX è in grado di produrre; Keplr può comunque collegarsi per visualizzare il tuo saldo sul rail Native. **MetaMask** firma e invia in modo indipendente sul **rail EVM**.
- **La testnet è custodial.** La Dashboard gestisce per te un wallet di test, così puoi sperimentare senza alcuna configurazione e senza mettere a rischio valore reale.

### Collegati con QoreX (consigliato) {#connect-qorex}

QoreX è il wallet ufficiale di QoreChain. La card **Connect with QoreX** della Dashboard supporta sia l'estensione del browser sia l'app mobile dallo stesso punto di ingresso.

1. Apri [dashboard.qorechain.io](https://dashboard.qorechain.io) e assicurati che l'intestazione mostri **Mainnet**.
2. Se è la tua prima visita a una pagina di mainnet, leggi e accetta la [presa d'atto del rischio una tantum](#risk-acknowledgement).
3. Seleziona **Connect Wallet** (oppure **Connect with QoreX** sulla card del wallet).
4. Se l'estensione browser di QoreX è installata e viene rilevata in questo browser, la Dashboard chiede **"How do you want to connect?"** con due opzioni, **Browser extension** e **QoreX app**. Scegline una — la scelta viene salvata, quindi le visite successive non mostreranno più questo prompt (è sempre disponibile un link **Use a different method** se vuoi cambiare metodo in seguito). Se non viene rilevata alcuna estensione, la Dashboard passa direttamente al flusso dell'app.
   - **Browser extension**: si apre il popup dell'estensione, che mostra `dashboard.qorechain.io` come sito che richiede la connessione. Esaminalo e approvalo — questo firma una prova una tantum che possiedi il tuo indirizzo `qor1...` (nessun fondo viene spostato). L'associazione si completa immediatamente, nella stessa sessione del browser.
   - **QoreX app**: la Dashboard mostra un codice QR (con un link **Open QoreX** che apre l'app direttamente se stai navigando dallo stesso telefono). Apri l'app QoreX, scansiona il codice QR (oppure tocca il link), esamina la richiesta di associazione che mostra l'origine della Dashboard e approvala con la tua conferma biometrica. La Dashboard esegue polling in background e completa automaticamente l'associazione non appena approvi.
5. Una volta approvato, la Dashboard mostra il tuo indirizzo `qor1...` e sblocca le azioni che richiedono una firma.

Consulta [Wallet](/dashboard/wallet#mainnet) per la procedura completa di collegamento e invio per ciascun tipo di wallet, e la pagina [Account & Dashboard](/qorex/account-and-dashboard#dashboard) della documentazione di QoreX per la visuale lato wallet dello stesso abbinamento.

### Collegati con Keplr o MetaMask

1. Apri [dashboard.qorechain.io](https://dashboard.qorechain.io) e assicurati che l'intestazione mostri **Mainnet**.
2. Se è la tua prima visita a una pagina di mainnet, leggi e accetta la presa d'atto del rischio una tantum (vedi sotto).
3. Seleziona **Connect Wallet** e scegli **Keplr** o **MetaMask**.
4. Approva la connessione nel tuo wallet.

Una volta collegato, la Dashboard mostra il tuo indirizzo (in forma abbreviata) nell'intestazione. MetaMask sblocca l'invio e le altre azioni firmate direttamente sul rail EVM. Keplr sblocca la visualizzazione del tuo saldo e della cronologia sul rail Native — l'invio e lo staking su quel rail passano attraverso QoreX (vedi sopra), poiché gli account QoreChain firmano con una firma ibrida post-quantistica. Le pagine di sola lettura come l'Explorer funzionano senza alcuna connessione.

Gli account QoreChain usano il prefisso bech32 `qor`, quindi un indirizzo collegato appare come `qor1...` — lo stesso account ha anche una codifica EVM (`0x...`) e una SVM (base58). Gli account sono protetti da crittografia resistente ai computer quantistici. Consulta [Wallet Setup](/getting-started/wallet-setup) per le indicazioni sulla configurazione iniziale, e [Aggiungi QoreChain al tuo wallet](/dashboard/wallet#add-network) se il tuo wallet non conosce ancora la rete.

### Presa d'atto del rischio una tantum {#risk-acknowledgement}

Prima di poter usare qualsiasi pagina di mainnet, la Dashboard ti chiede di accettare un'avvertenza una tantum. Con essa confermi di aver compreso che le transazioni su mainnet muovono **fondi reali**, che la Dashboard è **non-custodial** (solo tu controlli le tue chiavi) e che le transazioni on-chain sono **irreversibili**. La accetti una sola volta; da quel momento le pagine di mainnet si aprono direttamente.

## Seleziona la tua rete

La Dashboard funziona con due reti. L'intestazione mostra la rete a cui sei attualmente connesso.

| Rete | Chain ID | Quando usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rete live per valore reale e uso in produzione. Non-custodial: colleghi il tuo wallet personale. |
| **Testnet** | `qorechain-diana` | Ambiente gratuito per i test, con un wallet di test gestito dalla dashboard e il [Faucet](/dashboard/faucet) per i token di test. |

Il token nativo è **QOR** (denominazione base `uqor`, dove 1 QOR = 10^6 uqor). Se sei alle prime armi, inizia su testnet, richiedi token dal Faucet e prova un primo trasferimento prima di passare a mainnet.

:::tip Nuovo su QoreChain?
Segui [Connecting to Testnet](/getting-started/connecting-to-testnet) e [Your First Transaction](/getting-started/first-transaction) per fare pratica rapidamente, poi torna qui per esplorare il resto della Dashboard.
:::

## Correlati

* [Explorer](/dashboard/explorer) — naviga tra blocchi, transazioni e account.
* [Wallet](/dashboard/wallet) — gestisci gli account e invia transazioni.
* [Trade / DEX](/dashboard/trade) — scambia token contro i pool AMM on-chain.
* [Bridge](/dashboard/bridge) — sposta asset tra chain diverse.
* [Tools Hub](/dashboard/tools-hub) — licenze, faucet e utility per sviluppatori.
