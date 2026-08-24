---
slug: /user-guide/bridging-assets
title: Trasferimento di Asset tramite Bridge
sidebar_label: Trasferimento di Asset tramite Bridge
sidebar_position: 5
---

# Trasferimento di Asset tramite Bridge

Questa guida spiega come spostare asset tra QoreChain e altre reti blockchain. Il livello di interoperabilità di QoreChain comprende **37 configurazioni QCB (QoreChain Bridge)** (incluso un loopback QoreChain) per reti eterogenee, oltre a **8 canali IBC** per le chain dell'ecosistema Cosmos.

:::caution
Il bridge cross-chain si trova attualmente in fase di **testnet / pre-produzione**. La disponibilità delle connessioni, gli asset supportati e i parametri di finalità sono soggetti a modifiche e non devono essere considerati pronti per la produzione. Verifica tutti i trasferimenti su **`qorechain-diana`** prima di farvi affidamento.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.92** — sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet**, dove il supporto al bridge è stato abilitato.
:::

---

## Panoramica delle Connessioni

QoreChain offre due protocolli di bridging:

| Protocollo                               | Connessioni        | Caso d'Uso                                                                 |
| ----------------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| **IBC** (Inter-Blockchain Communication)  | 8 canali           | Interoperabilità nativa con le chain abilitate a IBC                        |
| **QCB** (QoreChain Bridge)                | 37 configurazioni  | Trasferimenti cross-chain con reti non-IBC tramite attestazioni protette da PQC |

Un elenco completo di ogni configurazione QCB e canale IBC è disponibile nella pagina **Architettura del Bridge**. Questa guida si concentra sull'utilizzo quotidiano del bridge.

---

## Canali IBC

Le seguenti chain abilitate a IBC hanno stabilito canali con QoreChain:

| Chain                 | Canale      | Stato  |
| ---------------------- | ----------- | ------ |
| Cosmos Hub             | `channel-0` | Attivo |
| Osmosis                | `channel-1` | Attivo |
| Noble                  | `channel-2` | Attivo |
| Celestia               | `channel-3` | Attivo |
| Stride                 | `channel-4` | Attivo |
| Akash                  | `channel-5` | Attivo |
| Babylon                | `channel-6` | Attivo |
| QoreChain (loopback)   | `channel-7` | Attivo |

I trasferimenti IBC utilizzano il modulo standard `ibc-transfer`:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Endpoint del Bridge QCB

Il QoreChain Bridge si connette a chain esterne appartenenti a più tipologie di ecosistema. Una selezione rappresentativa delle reti supportate:

| Chain     | Tipo di Chain | Asset Supportati |
| --------- | ------------- | ----------------- |
| Ethereum  | EVM           | ETH, USDC, WBTC   |
| BSC       | EVM           | BNB, USDC         |
| Solana    | Solana        | SOL, USDC         |
| Avalanche | EVM           | AVAX, USDC        |
| Polygon   | EVM           | MATIC, USDC       |
| Arbitrum  | EVM           | ETH, ARB, USDC    |
| TON       | TON           | TON               |
| Sui       | Sui Move      | SUI               |
| Optimism  | EVM           | ETH, USDC, OP     |
| Base      | EVM           | ETH, USDC         |
| Aptos     | Aptos         | APT, USDC         |
| Bitcoin   | Bitcoin       | BTC               |
| NEAR      | NEAR          | NEAR, USDC        |
| Cardano   | Cardano       | ADA               |
| Polkadot  | Polkadot      | DOT               |
| Tezos     | Tezos         | XTZ               |
| Tron      | Tron          | TRX, USDT         |

Consulta la pagina **Architettura del Bridge** per l'elenco completo delle configurazioni QCB e il loro stato di rollout attuale.

---

## Flusso di Deposito (da Chain Esterna a QoreChain)

Il deposito di asset da una chain esterna a QoreChain segue questa sequenza:

1. **Blocco (Lock)** — Blocca i token sulla chain esterna inviandoli al contratto o all'indirizzo del bridge QCB.
2. **Attestazione** — I validatori del bridge osservano la transazione di blocco e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10** dai validatori, il bridge finalizza il deposito.
4. **Conio (Mint)** — I token wrapped equivalenti vengono coniati su QoreChain e accreditati sul tuo indirizzo `qor1...`.

**Comando CLI:**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Flusso di Prelievo (da QoreChain a Chain Esterna)

Il prelievo di asset da QoreChain verso una chain esterna:

1. **Bruciatura (Burn)** — Brucia i token wrapped su QoreChain.
2. **Attestazione** — I validatori del bridge osservano la bruciatura e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10**, il prelievo viene finalizzato.
4. **Sblocco (Unlock)** — I token originali vengono rilasciati sulla chain esterna verso l'indirizzo di destinazione specificato.

**Comando CLI:**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Modello di Sicurezza

Il QoreChain Bridge è protetto da più livelli di difesa:

| Meccanismo                        | Descrizione                                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Multisig PQC 7-su-10**           | Ogni operazione del bridge richiede attestazioni da almeno 7 dei 10 validatori del bridge, ciascuno utilizzando firme crittografiche post-quantistiche.            |
| **Periodo di Contestazione di 24 Ore** | I prelievi che superano una soglia configurabile entrano in una finestra di contestazione di 24 ore durante la quale i validatori o gli osservatori possono segnalare transazioni fraudolente. |
| **Interruttori Automatici (Circuit Breaker)** | Limitatori di velocità automatici bloccano le operazioni del bridge in caso di volumi anomali o pattern sospetti. Le operazioni del bridge riprendono dopo una revisione manuale. |

---

## Interrogazione dello Stato del Bridge

Verifica lo stato di un'operazione del bridge in sospeso:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Elenca tutte le connessioni attive del bridge:

```bash
qorechaind query bridge connections
```

---

## Suggerimenti

* I depositi tramite bridge tipicamente si finalizzano nel giro di pochi minuti, una volta raccolte le attestazioni richieste di 7 su 10.
* I prelievi di importo elevato attivano automaticamente il periodo di contestazione di 24 ore. Pianifica in anticipo i trasferimenti sensibili al tempo.
* Verifica sempre che il formato dell'indirizzo di destinazione corrisponda alla chain di destinazione (ad es. `0x...` per le chain EVM, base58 per Solana).
* I trasferimenti IBC sono generalmente più veloci dei trasferimenti QCB poiché utilizzano una comunicazione nativa a livello di protocollo.
* Le commissioni del bridge vengono bruciate tramite il canale di bruciatura `bridge_fee` (vedi [Operazioni sul Token](/user-guide/token-operations)).
