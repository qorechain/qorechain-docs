---
slug: /dashboard/overview
title: Panoramica della Dashboard e Guida introduttiva
sidebar_label: Panoramica e Guida introduttiva
sidebar_position: 1
---

# Panoramica della Dashboard e Guida introduttiva

La Dashboard di QoreChain all'indirizzo **[dashboard.qorechain.io](https://dashboard.qorechain.io)** è l'applicazione web ufficiale per usare QoreChain dal tuo browser. Da un unico posto puoi esplorare la chain, gestire un wallet, scambiare token, spostare asset tra chain, generare e auditare smart contract, fare staking verso i validatori, richiedere token di testnet, completare quest e accedere agli strumenti della rete.

Tutto in questa sezione è una guida pratica per l'utente: cosa fa ogni pagina e come usarla. Non è richiesta alcuna installazione — la Dashboard funziona interamente nel tuo browser.

## Cosa puoi fare

| Area | A cosa serve |
| --- | --- |
| **[Explorer](/dashboard/explorer)** | Esplora blocchi, transazioni, indirizzi e validatori. |
| **[Wallet](/dashboard/wallet)** | Visualizza i saldi, invia e ricevi QOR e gestisci i tuoi indirizzi. |
| **[Trade](/dashboard/trade)** | Scambia token e fornisci liquidità sull'AMM on-chain. |
| **[Bridge](/dashboard/bridge)** | Sposta asset tra QoreChain e altre chain. |
| **[Smart Contract Creator](/dashboard/smart-contract-creator)** | Genera smart contract con **QCAI** su 17 blockchain supportate. |
| **[Contract Auditor](/dashboard/contract-auditor)** | Esegui un'analisi di sicurezza **QCAI** su uno smart contract. |
| **[Staking & Validators](/dashboard/staking-and-validators)** | Esamina i validatori e delega i tuoi QOR. |
| **[Faucet](/dashboard/faucet)** | Richiedi token di test sulla testnet. |
| **[Quests](/dashboard/quests)** | Completa attività guidate per imparare a usare la rete. |
| **[Tools Hub](/dashboard/tools-hub)** | Accedi agli strumenti per nodi, rollup, SDK e licenze. |

## Connetti il tuo wallet {#connect-your-wallet}

La maggior parte delle azioni che modificano lo stato on-chain — invio di token, swap, staking, bridging — richiede un wallet connesso.

1. Apri [dashboard.qorechain.io](https://dashboard.qorechain.io).
2. Seleziona **Connect Wallet**.
3. Approva la connessione nel tuo wallet.

Una volta connesso, la Dashboard mostra il tuo indirizzo (in forma abbreviata) nell'intestazione e sblocca le azioni che richiedono una firma. Le pagine in sola lettura come l'Explorer funzionano senza connessione.

Gli account QoreChain usano il prefisso bech32 `qor`, quindi un indirizzo connesso ha la forma `qor1...`. Gli account sono protetti con crittografia quantum-safe. Consulta [Wallet Setup](/getting-started/wallet-setup) per le indicazioni sulla configurazione iniziale.

## Seleziona la tua rete

La Dashboard funziona con due reti. L'intestazione mostra la rete a cui sei attualmente connesso.

| Rete | Chain ID | Quando usarla |
| --- | --- | --- |
| **Mainnet** | `qorechain-vladi` | Rete live per valore reale e uso in produzione. |
| **Testnet** | `qorechain-diana` | Ambiente gratuito per i test, con il [Faucet](/dashboard/faucet) per i token di test. |

Il token nativo è **QOR** (denominazione base `uqor`, dove 1 QOR = 10^6 uqor). Se sei alle prime armi, inizia sulla testnet, richiedi token dal Faucet e prova un primo trasferimento prima di passare alla mainnet.

:::tip Nuovo su QoreChain?
Segui [Connecting to Testnet](/getting-started/connecting-to-testnet) e [Your First Transaction](/getting-started/first-transaction) per metterti subito alla prova, poi torna a esplorare il resto della Dashboard.
:::

## Correlati

* [Explorer](/dashboard/explorer) — esplora blocchi, transazioni e account.
* [Wallet](/dashboard/wallet) — gestisci gli account e invia transazioni.
* [Trade / DEX](/dashboard/trade) — scambia token sui pool AMM on-chain.
* [Bridge](/dashboard/bridge) — sposta asset tra chain.
* [Tools Hub](/dashboard/tools-hub) — licenze, faucet e utility per sviluppatori.
