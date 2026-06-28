---
slug: /user-guide/bridging-assets
title: Bridging degli asset
sidebar_label: Bridging degli asset
sidebar_position: 5
---

# Bridging degli asset

Questa guida illustra come spostare asset tra QoreChain e altre reti blockchain. Il livello di interoperabilità di QoreChain comprende **37 configurazioni QCB (QoreChain Bridge)** (incluso un loopback QoreChain) per reti eterogenee più **8 canali IBC** per le chain dell'ecosistema Cosmos.

:::caution
Il bridge cross-chain è attualmente in fase di **testnet / pre-produzione**. La disponibilità delle connessioni, gli asset supportati e i parametri di finalità sono soggetti a modifiche e non devono essere considerati pronti per la produzione. Convalida tutti i trasferimenti su **`qorechain-diana`** prima di farvi affidamento.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (EVM chain ID **9800**). La mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) è attiva dal 7 giugno 2026 ed esegue la versione della chain **v3.1.80** — sostituisci il chain ID e gli endpoint della mainnet dalla pagina **Connessione alla Mainnet** dove il supporto al bridge è stato abilitato.
:::

---

## Panoramica delle connessioni

QoreChain fornisce due protocolli di bridging:

| Protocollo                               | Connessioni        | Caso d'uso                                                                |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 canali           | Interoperabilità nativa con chain abilitate IBC                          |
| **QCB** (QoreChain Bridge)               | 37 configurazioni  | Trasferimenti cross-chain con reti non IBC tramite attestazioni protette da PQC |

Un'enumerazione completa di ogni configurazione QCB e canale IBC si trova nella pagina **Architettura del Bridge**. Questa guida si concentra sull'utilizzo quotidiano del bridging.

---

## Canali IBC

Le seguenti chain abilitate IBC hanno stabilito canali con QoreChain:

| Chain                | Canale      | Stato  |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Attivo |
| Osmosis              | `channel-1` | Attivo |
| Noble                | `channel-2` | Attivo |
| Celestia             | `channel-3` | Attivo |
| Stride               | `channel-4` | Attivo |
| Akash                | `channel-5` | Attivo |
| Babylon              | `channel-6` | Attivo |
| QoreChain (loopback) | `channel-7` | Attivo |

I trasferimenti IBC utilizzano il modulo standard `ibc-transfer`:

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Endpoint del Bridge QCB

Il QoreChain Bridge si connette a chain esterne che spaziano su molteplici tipi di ecosistema. Una selezione rappresentativa delle reti supportate:

| Chain     | Tipo di chain | Asset supportati |
| --------- | ------------- | ---------------- |
| Ethereum  | EVM           | ETH, USDC, WBTC  |
| BSC       | EVM           | BNB, USDC        |
| Solana    | Solana        | SOL, USDC        |
| Avalanche | EVM           | AVAX, USDC       |
| Polygon   | EVM           | MATIC, USDC      |
| Arbitrum  | EVM           | ETH, ARB, USDC   |
| TON       | TON           | TON              |
| Sui       | Sui Move      | SUI              |
| Optimism  | EVM           | ETH, USDC, OP    |
| Base      | EVM           | ETH, USDC        |
| Aptos     | Aptos         | APT, USDC        |
| Bitcoin   | Bitcoin       | BTC              |
| NEAR      | NEAR          | NEAR, USDC       |
| Cardano   | Cardano       | ADA              |
| Polkadot  | Polkadot      | DOT              |
| Tezos     | Tezos         | XTZ              |
| Tron      | Tron          | TRX, USDT        |

Consulta la pagina **Architettura del Bridge** per l'elenco completo delle configurazioni QCB e il loro stato di rollout attuale.

---

## Flusso di deposito (da chain esterna a QoreChain)

Il deposito di asset da una chain esterna in QoreChain segue questa sequenza:

1. **Lock** — Blocca i token sulla chain esterna inviandoli al contratto o all'indirizzo del bridge QCB.
2. **Attestazione** — I validatori del bridge osservano la transazione di lock e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10** dei validatori, il bridge finalizza il deposito.
4. **Mint** — I token wrapped equivalenti vengono coniati su QoreChain e accreditati al tuo indirizzo `qor1...`.

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

## Flusso di prelievo (da QoreChain a chain esterna)

Prelievo di asset da QoreChain verso una chain esterna:

1. **Burn** — Brucia i token wrapped su QoreChain.
2. **Attestazione** — I validatori del bridge osservano il burn e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10**, il prelievo viene finalizzato.
4. **Unlock** — I token originali vengono rilasciati sulla chain esterna all'indirizzo di destinazione specificato.

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

## Modello di sicurezza

Il QoreChain Bridge è protetto da molteplici livelli di difesa:

| Meccanismo                    | Descrizione                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-su-10**      | Ogni operazione del bridge richiede attestazioni da almeno 7 dei 10 validatori del bridge, ciascuno con firme crittografiche post-quantistiche.     |
| **Periodo di sfida di 24 ore** | I prelievi che superano una soglia configurabile entrano in una finestra di sfida di 24 ore durante la quale validatori o watcher possono segnalare transazioni fraudolente. |
| **Circuit breaker**           | Limitatori di velocità automatici interrompono le operazioni del bridge se vengono rilevati volumi anomali o pattern sospetti. Le operazioni del bridge riprendono dopo una revisione manuale. |

---

## Interrogazione dello stato del Bridge

Verifica lo stato di un'operazione di bridge in sospeso:

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Elenca tutte le connessioni del bridge attive:

```bash
qorechaind query bridge connections
```

---

## Suggerimenti

* I depositi del bridge si finalizzano in genere entro pochi minuti una volta raccolte le 7-su-10 attestazioni richieste.
* I prelievi di grandi dimensioni attivano automaticamente il periodo di sfida di 24 ore. Pianifica in anticipo per i trasferimenti urgenti.
* Verifica sempre che il formato dell'indirizzo di destinazione corrisponda alla chain di destinazione (es. `0x...` per le chain EVM, base58 per Solana).
* I trasferimenti IBC sono generalmente più veloci dei trasferimenti QCB poiché utilizzano una comunicazione nativa a livello di protocollo.
* Le commissioni del bridge vengono bruciate tramite il canale di burn `bridge_fee` (vedi [Operazioni sui token](/user-guide/token-operations)).
