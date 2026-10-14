---
slug: /user-guide/deploying-rollups
title: Distribuzione dei Rollup
sidebar_label: Distribuzione dei Rollup
sidebar_position: 6
---

# Distribuzione dei Rollup

Questa guida è una breve introduzione al lancio di un rollup specifico per applicazione che effettua il settlement su QoreChain con il Rollup Development Kit (RDK). I comandi passo passo si trovano in **[Distribuire un Rollup](/rollups/deploying-a-rollup)**; questa pagina copre ciò di cui hai bisogno prima di iniziare.

:::caution Funzionalità in fase iniziale
Nessun rollup è stato ancora creato su nessuna delle due reti. La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) esegue la versione della chain **v3.2.1**; la testnet (**`qorechain-diana`**, EVM chain ID **9800**) esegue una release più recente (**v3.2.2**). Convalida prima sulla testnet.
:::

---

## Cos'è un rollup qui {#what-a-rollup-is-here}

Un rollup QoreChain è una chain specifica per applicazione che **esegue off-chain** e usa QoreChain per il **settlement**: registri il rollup on-chain, pubblichi batch di state root e (facoltativamente) blob di dati e commitment di prelievo. Il record on-chain riporta un profilo, una modalità di settlement, una modalità di sequencer, un backend di disponibilità dei dati, un modello gas e un'etichetta VM; la chain host non esegue le transazioni del tuo rollup.

---

## Profili Preimpostati {#preset-profiles}

L'RDK viene fornito con cinque profili preimpostati, ciascuno ottimizzato per una categoria applicativa comune:

| Profilo        | Settlement (proof)  | Sequencer | DA              | Modello gas    | VM       | Caso d'uso previsto |
| -------------- | ------------------- | --------- | --------------- | ------------ | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dedicated | native          | EIP-1559     | EVM      | Applicazioni DeFi/AMM (lending, DEX, derivati) |
| **gaming**     | based               | based     | native          | flat         | custom   | Stato di gioco ad alto throughput ed esperienze in tempo reale |
| **nft**        | optimistic (fraud)  | dedicated | native (Celestia DA pianificato) | standard | CosmWasm | Minting NFT e workload di marketplace |
| **enterprise** | based               | based     | native          | subsidized   | EVM      | Distribuzioni permissioned e consortium con commissioni sponsorizzate |
| **custom**     | default: optimistic (fraud) | dedicated | native | standard | EVM | Default di partenza; modifica ciò che il messaggio consente |

Vedi [Profili Preimpostati](/rollups/preset-profiles) per i dettagli e le note sulla maturità (ad esempio, un rollup `defi` creato tramite la CLI non può ancora finalizzare batch ZK, e il sequencing `based` al momento significa che l'invio è a carico del creatore).

---

## Requisiti {#requirements}

| Requisito | Dettagli |
| ----------- | ------- |
| **Stake del rollup** | Almeno 10.000 QOR (`min_stake_for_rollup`, 10.000.000.000 uqor). Leggi il valore corrente: `qorechaind query rdk config` |
| **Burn di creazione** | L'1 % dello stake che fornisci viene bruciato alla creazione; il resto viene messo in escrow e restituito quando fermi il rollup |
| **Stake di registrazione del layer** | La creazione di un rollup registra anche un layer presso il modulo multilayer, che blocca ulteriori 1.000 QOR del creatore (restituiti quando il rollup viene fermato). Senza quel saldo il layer non viene creato e il rollup non può essere ancorato |
| **Account** | Un account finanziato con una chiave post-quantum registrata (ogni transazione sulla lane nativa è firmata in modo ibrido) |

---

## Suggerimenti {#tips}

* Inizia con un profilo preimpostato. I preset impostano la modalità di settlement, il sequencer, il backend di disponibilità dei dati e la VM; `create-rollup` accetta solo l'id, il profilo, lo stake e un `--vm` facoltativo.
* Il burn di creazione dell'1 % si applica allo stake che fornisci.
* Oggi il creatore del rollup è chi invia i batch (nessun preset imposta un indirizzo di sequencer), quindi custodisci al sicuro la chiave del creatore: solo il creatore può mettere in pausa, riprendere o fermare il rollup.
* L'helper `suggest-profile` al momento restituisce un fallback fisso `defi` sugli endpoint pubblici, quindi scegli dalla tabella dei profili.

---

## Prossimi passi {#next-steps}

* [Distribuire un Rollup](/rollups/deploying-a-rollup) — crea, gestisci e ferma un rollup dalla CLI o da TypeScript.
* [Panoramica dei Rollup](/rollups/overview) — modalità di settlement, sequencer, sistemi di proof.
* [Disponibilità dei Dati](/rollups/data-availability) e [ZK / STARK e Prelievi](/rollups/zk-stark-withdrawals).
