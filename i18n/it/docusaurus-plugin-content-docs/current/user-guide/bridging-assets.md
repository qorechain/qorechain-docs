---
slug: /user-guide/bridging-assets
title: Trasferimento di Asset tramite Bridge
sidebar_label: Trasferimento di Asset tramite Bridge
sidebar_position: 5
---

# Trasferimento di Asset tramite Bridge

Questa guida descrive come è progettato il funzionamento dello spostamento di asset tra QoreChain e altre reti blockchain. Il livello di interoperabilità di QoreChain è costruito attorno a **37 configurazioni di chain** (36 chain esterne più Injective, raggiunta tramite IBC) e fino a **8 controparti IBC** per le chain dell'ecosistema Cosmos.

:::caution Non attivo su nessuna delle due reti
Il modulo bridge è distribuito su mainnet e testnet, ma **nessuna route del bridge è attiva**: tutte le 37 configurazioni di chain sono in stato `pending` senza alcun contratto bridge impostato, non è registrato alcun validatore del bridge, non è mai stata creata alcuna operazione del bridge e non esistono canali o client IBC. Tutto ciò che segue descrive il design previsto. Non inviare asset aspettandoti che vengano trasferiti tramite bridge. Vedi [Architettura del Bridge](/architecture/bridge-architecture) per la tabella dello stato attuale.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**, versione della chain **v3.2.4**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) esegue la versione della chain **v3.2.3** fino all'altezza 3.742.566 e la **v3.2.4** da quel blocco. Sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** una volta attivata una route. Stato verificato il 20 ottobre 2026: tutte le 37 configurazioni di chain sono `pending` su entrambe le reti.
:::

---

## Panoramica delle Connessioni

QoreChain è progettata per offrire due protocolli di bridging:

| Protocollo                               | Connessioni                          | Caso d'Uso                                                                      |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| **IBC** (Inter-Blockchain Communication) | fino a 8 canali (nessuno aperto)     | Interoperabilità nativa con le chain abilitate a IBC                            |
| **QCB** (QoreChain Bridge)               | 37 configurazioni (tutte in sospeso) | Trasferimenti cross-chain con reti non-IBC tramite attestazioni protette da PQC |

Un elenco completo di ogni configurazione di chain è disponibile nella pagina **Architettura del Bridge**. Questa guida si concentra su come è progettato il funzionamento di un trasferimento tramite bridge.

---

## IBC

IBC fa parte del design (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), ma **su nessuna delle due reti esiste ancora alcun canale o client IBC**, quindi non c'è nulla da trasferire. Questa pagina elencherà i canali una volta aperti.

---

## Endpoint del Bridge QCB

Il QoreChain Bridge è progettato per connettersi a chain esterne appartenenti a più tipologie di ecosistema. Una selezione rappresentativa delle connessioni pianificate (ognuna è oggi `pending`):

| Chain     | Tipo di Chain |
| --------- | ------------- |
| Ethereum  | EVM           |
| BSC       | EVM           |
| Solana    | Solana        |
| Avalanche | EVM           |
| Polygon   | EVM           |
| Arbitrum  | EVM           |
| TON       | TON           |
| Sui       | Sui Move      |
| Optimism  | EVM           |
| Base      | EVM           |
| Aptos     | Aptos         |
| Bitcoin   | Bitcoin       |
| NEAR      | NEAR          |
| Cardano   | Cardano       |
| Polkadot  | Polkadot      |
| Tezos     | Tezos         |
| Tron      | Tron          |

Non è pubblicato alcun elenco di asset: le configurazioni di chain non contengono ancora un registro degli asset. Consulta la pagina **Architettura del Bridge** per l'elenco completo delle configurazioni di chain.

---

## Flusso di Deposito (da Chain Esterna a QoreChain)

La sequenza prevista per un deposito da una chain esterna a QoreChain:

1. **Blocco (Lock)** — Blocca i token sulla chain esterna inviandoli al contratto o all'indirizzo del bridge QCB.
2. **Attestazione** — I validatori del bridge osservano la transazione di blocco e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10** dai validatori, il bridge finalizza il deposito.
4. **Conio (Mint)** — I token wrapped equivalenti vengono coniati su QoreChain e accreditati sul tuo indirizzo `qor1...`.

Non esiste alcun comando "avvia un deposito" eseguibile dall'utente: blocchi sulla chain esterna, e le attestazioni dei validatori del bridge accreditano il tuo account. (Il comando `qorechaind tx bridge deposit` della chain accredita un deposito già attestato e richiede firme dei validatori del bridge; non è il modo in cui un utente avvia un deposito.)

---

## Flusso di Prelievo (da QoreChain a Chain Esterna)

La sequenza prevista per un prelievo da QoreChain verso una chain esterna:

1. **Bruciatura (Burn)** — Brucia i token wrapped su QoreChain.
2. **Attestazione** — I validatori del bridge osservano la bruciatura e producono attestazioni firmate con PQC.
3. **Soglia** — Una volta raccolte **7 attestazioni su 10**, il prelievo viene finalizzato.
4. **Sblocco (Unlock)** — I token originali vengono rilasciati sulla chain esterna verso l'indirizzo di destinazione specificato.

**Comando CLI** (bloccato oggi: nessuna chain è attiva, quindi la transazione verrebbe rifiutata):

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Ogni transazione della lane nativa richiede la co-firma post-quantistica ibrida e una commissione di almeno 0,1 uqor per unità di gas; vedi [Prima Transazione](/getting-started/first-transaction).

---

## Modello di Sicurezza

Il QoreChain Bridge è progettato per essere protetto da più livelli di difesa:

| Meccanismo                                    | Descrizione                                                                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-su-10**                      | Ogni operazione del bridge richiede attestazioni da almeno 7 dei 10 validatori del bridge, ciascuno utilizzando firme crittografiche post-quantistiche.                                                                      |
| **Periodo di Contestazione di 24 Ore**        | I trasferimenti che superano la soglia di trasferimento elevato (100.000 QOR) entrano in una finestra di contestazione di 24 ore durante la quale i validatori o gli osservatori possono segnalare transazioni fraudolente. |
| **Interruttori Automatici (Circuit Breaker)** | Limitatori di velocità automatici bloccano le operazioni del bridge in caso di volumi anomali o pattern sospetti. Le operazioni del bridge riprendono dopo una revisione manuale.                                            |

---

## Interrogazione dello Stato del Bridge

Leggi lo stato del bridge:

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Gli stessi dati sono disponibili via REST sotto `/qorechain/bridge/v1/` (vedi [Architettura del Bridge](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Suggerimenti

* Verifica sempre che il formato dell'indirizzo di destinazione corrisponda alla chain di destinazione (ad es. `0x...` per le chain EVM, base58 per Solana).
* I trasferimenti di importo elevato (oltre 100.000 QOR) sono progettati per attivare automaticamente il periodo di contestazione di 24 ore.
* Le commissioni del bridge vengono bruciate tramite il canale di bruciatura `bridge_fee` (vedi [Operazioni sul Token](/user-guide/token-operations)).
