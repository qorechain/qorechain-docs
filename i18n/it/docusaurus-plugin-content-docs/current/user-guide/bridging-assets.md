---
slug: /user-guide/bridging-assets
title: Trasferimento di Asset tramite Bridge
sidebar_label: Trasferimento di Asset tramite Bridge
sidebar_position: 5
---

# Trasferimento di Asset tramite Bridge

Questa guida descrive come è progettato il funzionamento dello spostamento di asset tra QoreChain e altre reti blockchain. Il livello di interoperabilità di QoreChain è costruito attorno a **37 configurazioni di chain** (36 chain esterne più Injective, raggiunta tramite IBC) e fino a **8 controparti IBC** per le chain dell'ecosistema Cosmos.

:::caution Non attivo su nessuna delle due reti
Il modulo bridge è distribuito su mainnet e testnet, ma **nessuna route del bridge è attiva**: tutte le 37 configurazioni di chain sono in stato `pending` senza alcun contratto bridge impostato, non è registrato alcun validatore del bridge, non è mai stata creata alcuna operazione del bridge e sulla mainnet non esiste alcun canale IBC (la testnet ha un solo canale di test ICS-20 verso una chain con ID `provider`, nessuno verso le controparti nominate sotto). Tutto ciò che segue descrive il design previsto. Non inviare asset aspettandoti che vengano trasferiti tramite bridge. Vedi [Architettura del Bridge](/architecture/bridge-architecture) per la tabella dello stato attuale.
:::

:::note
I comandi seguenti utilizzano la testnet **`qorechain-diana`** (chain ID EVM **9800**, versione della chain **v3.2.6**). La mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) esegue la versione della chain **v3.2.4** (dal 23 ottobre 2026). Sostituisci il chain ID e gli endpoint della mainnet indicati nella pagina **Connessione alla Mainnet** una volta attivata una route. Stato verificato il 27 ottobre 2026: tutte le 37 configurazioni di chain sono `pending` su entrambe le reti.
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

IBC fa parte del design (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), ma **nessuna di queste controparti è ancora connessa**: la mainnet non ha alcun canale o client IBC, e la testnet ha solo un singolo canale di test ICS-20 verso una chain con ID `provider` (verificato il 27 ottobre 2026), quindi non c'è nulla da trasferire per queste chain. Questa pagina elencherà i canali una volta aperti.

### Novità IBC sulla testnet (v3.2.6) {#ibc-testnet-v326}

Tre funzionalità IBC esistono solo sulla testnet; la mainnet non le ha (la sua route `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` risponde 501):

* **Limite di frequenza IBC.** La governance può fissare una quota per canale per i trasferimenti IBC (una percentuale intera dell'offerta per finestra di ore). **Non è automatico**: oggi non è impostato alcun limite, e un insieme vuoto significa nessun limite. Un pacchetto inoltrato viene addebitato su entrambi i canali e un rimborso restituisce la quota. È distinto dai circuit breaker del bridge descritti in [Modello di sicurezza](#security-model).
* **Inoltro dei pacchetti.** Un trasferimento in arrivo via IBC v1 può portare un memo della forma `{"forward":{"receiver":"...","port":"transfer","channel":"channel-N"}}` per essere inviato a un'altra chain, con rimborso al mittente se un salto fallisce. Non ci sono ritentativi e un salto scade per default dopo 10 minuti. Un token che all'arrivo si converte in un ERC-20 non può essere inoltrato.
* **Light client 08-wasm.** Archiviare, migrare e rimuovere il binario di un light client wasm sono operazioni riservate all'autorità, e i tipi di client consentiti contengono solo il client standard finché la governance non aggiunge `08-wasm`.

Leggi i limiti con `GET /Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` sulla testnet (`{"rate_limits":[]}` oggi).

**Quale rete ha cosa (verificato il 27 ottobre 2026).**

| | Mainnet `qorechain-vladi` (v3.2.4) | Testnet `qorechain-diana` (v3.2.6) |
|---|---|---|
| Trasferimento ICS-20 (IBC v1) | Integrato, ma nessun canale è aperto | Integrato, un canale aperto |
| Limite di frequenza IBC | Non disponibile (501) | Disponibile, nessun limite impostato |
| Inoltro dei pacchetti | Non disponibile | Disponibile (solo IBC v1) |
| Light client 08-wasm | Non disponibile | Set di messaggi presente, nessun client wasm può essere creato finché la governance non consente `08-wasm` |

### Il canale di test sulla testnet {#ibc-test-channel}

La testnet ha un canale di trasferimento aperto, `channel-0` (porta `transfer`, `connection-0`, versione `ics20-1`, unordered). La sua controparte è la testnet del Cosmos Hub (chain ID `provider`, canale `channel-600`). La testnet ha visto una sola denominazione IBC, `uatom`, in arrivo su `channel-0`; QoreChain mantiene inoltre per essa una coppia ERC-20, di proprietà del modulo. Leggi lo stato con:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Per inviare sul canale di test, costruisci il trasferimento, poi aggiungi la firma ibrida come per qualsiasi altra transazione sulla corsia nativa:

```bash
qorechaind tx ibc-transfer transfer transfer channel-0 <receiver_on_the_hub_testnet> 1000uqor \
  --from mykey --chain-id qorechain-diana --gas 400000 --fees 40000uqor --generate-only > ibc.json
qorechaind tx pqc cosign ibc.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Questo è un canale di test tra due reti di test; i token non hanno alcun valore. La consegna di un pacchetto richiede un relayer in esecuzione per il canale, e questo manuale non ne pubblica né ne promette uno, quindi un trasferimento può restare in sospeso. Non usare i comandi sopra sulla mainnet: lì non c'è alcun canale aperto e la transazione fallirebbe.

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

## Modello di Sicurezza {#security-model}

Il QoreChain Bridge è progettato per essere protetto da più livelli di difesa:

| Meccanismo                                    | Descrizione                                                                                                                                                                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-su-10**                      | Ogni operazione del bridge richiede attestazioni da almeno 7 dei 10 validatori del bridge, ciascuno utilizzando firme crittografiche post-quantistiche.                                                                      |
| **Periodo di Contestazione di 24 Ore**        | I trasferimenti che superano la soglia di trasferimento elevato (100.000 QOR) entrano in una finestra di contestazione di 24 ore durante la quale i validatori o gli osservatori possono segnalare transazioni fraudolente. |
| **Interruttori Automatici (Circuit Breaker)** | Progettati per il bridge QCB: limitatori automatici bloccano le operazioni del bridge in caso di volumi anomali o pattern sospetti, e le operazioni riprendono dopo una revisione manuale. Si applicano al bridge QCB, non all'IBC; il limite di frequenza IBC (solo testnet) è fissato dalla governance, non è automatico e oggi non ha alcun limite impostato. |

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
