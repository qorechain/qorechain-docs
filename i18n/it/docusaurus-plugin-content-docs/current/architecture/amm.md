---
slug: /architecture/amm
title: AMM e liquidità on-chain
sidebar_label: AMM e liquidità on-chain
sidebar_position: 8
---

# AMM e liquidità on-chain

Il modulo `x/amm` è il market maker automatizzato (AMM) nativo e on-chain di QoreChain. Consente a chiunque di creare pool di liquidità, fornire liquidità ed effettuare swap tra asset nativi di QoreChain direttamente a livello di protocollo — senza order book off-chain e senza alcun DEX a smart contract esterno. È il livello di regolamento on-chain dietro l'esperienza **Dashboard Trade / DEX**.

I pool seguono curve di pricing AMM familiari:

- **`constant_product`** — la curva `x*y=k` (coppie generiche).
- **`stable_swap`** — una curva a basso slippage per coppie strettamente ancorate, regolata da un coefficiente di amplificazione.

Tutti gli importi utilizzano le unità native di QoreChain. Il token di staking e commissioni è **QOR**, il cui denom base è **uqor** (1 QOR = 10^6 uqor). I partecipanti ai pool e gli indirizzi utilizzano il prefisso bech32 `qor`.

:::note
I comandi seguenti utilizzano `qorechaind`. Aggiungi i consueti flag di transazione (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) per il tuo ambiente — ad esempio `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` per la mainnet (il floor delle commissioni di rete è 0,1 uqor per unità di gas). Ogni comando `tx amm` è una transazione della corsia Cosmos, quindi richiede la firma post-quantistica ibrida: aggiungi `--generate-only > tx.json`, poi esegui `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` (vedi [First Transaction](/getting-started/first-transaction#send-qor)).
:::

:::caution Nessun pool esiste ancora
Il modulo AMM è attivo sulla mainnet (v3.2.4) e sulla testnet (v3.2.6), ma **non è stato ancora creato alcun pool** (verificato il 27 ottobre 2026: `GET /qorechain/amm/v1/pools` restituisce un elenco vuoto su entrambe), e i denom negli esempi seguenti (`uusdc`, `uusdt`) sono illustrativi: oggi sulle reti non esiste alcun asset di questo tipo. Finché non esiste un pool, ogni comando di swap o di aggiunta di liquidità fallisce con un errore di pool non trovato.
:::

## Parametri del modulo {#parameters}

Leggi i valori correnti con `qorechaind query amm params` o `GET /qorechain/amm/v1/params`. Mainnet e testnet riportano attualmente gli stessi valori:

| Parametro | Valore | Significato |
| --- | --- | --- |
| `enabled` | `true` | Interruttore del modulo |
| `swap_fee_bps` | `30` | Commissione di swap, lo 0,30 % dell'importo in input |
| `protocol_fee_bps` | `10` | La parte della commissione di swap che lascia il pool come quota del protocollo (0,10 % dell'input). Il resto rimane nel pool per i fornitori di liquidità |
| `pool_creation_fee` | `100000000` | 100 QOR (in uqor), addebitati in aggiunta ai depositi iniziali e bruciati alla creazione di un pool |
| `min_liquidity` | `1000` | Il più piccolo dei due depositi iniziali di un nuovo pool deve essere di almeno questo numero di unità base |
| `max_pools_per_creator` | `50` | Pool che un singolo account può creare |
| `max_swap_impact_bps` | `500` | Massimo impatto sul prezzo che uno swap può avere (5 %); vedi [Regole degli swap](#swap-rules) |
| `lp_token_decimals` | `6` | Decimali di visualizzazione delle quote LP di un pool (solo estetico: le quote LP sono voci di registro, non token) |

## Regole degli swap applicate dalla v3.2.2 {#swap-rules}

Le correzioni di integrità dell'AMM riportate di seguito sono state applicate alla mainnet con la v3.2.2 (altezza 3.556.788, 16 ottobre 2026) e perfezionate nella v3.2.3 (altezza 3.662.051, 20 ottobre 2026). Si applicano a ogni swap, qualunque sia la corsia da cui arriva.

* **Entrambe le denominazioni sono vincolate al pool.** Uno swap deve indicare i due denom del pool a cui è destinato. I pool stable-swap sono prezzati con la curva stable-swap in entrambe le direzioni (exact-in ed exact-out).
* **Commissione di protocollo.** La quota di protocollo della commissione di swap lascia il pool. Quando è pagata in QOR va al fee collector ed è ripartita con le altre commissioni del blocco (vedi [Tokenomics](/architecture/tokenomics)), con la parte bruciata registrata sotto la fonte di burn `amm`; in qualsiasi altra denominazione va alla community pool. La commissione di creazione del pool viene bruciata e registrata sotto la stessa fonte `amm`.
* **Tetto all'impatto sul prezzo.** `max_swap_impact_bps` è applicato: uno swap il cui impatto sul prezzo rispetto al prezzo del pool supera il 5 % viene rifiutato. Uno swap che non imposta alcun limite di slippage (`min-out` pari a 0 su exact-in, oppure un `max-in` che copre l'intera riserva di input su exact-out) viene inoltre misurato rispetto al prezzo del pool all'inizio del blocco e viene rifiutato se operazioni precedenti nello stesso blocco lo hanno spostato oltre il tetto. Imposta un vero `min-out` / `max-in` su ogni swap.
* **Lavoro di fine blocco limitato (v3.2.3).** Alla fine di ogni blocco il modulo aggiorna il prezzo medio ponderato corrente di al massimo 100 pool, a rotazione. Finché i pool sono 100 o meno, ogni pool viene aggiornato a ogni blocco; oltre, la media di un pool si aggiorna una volta per ciclo di `ceil(pools / 100)` blocchi. La media è informativa (è restituita dalle query `pool`) e non modifica il pricing degli swap.

## Pool e quote LP

Un pool detiene le riserve di due denom (`token_a`, `token_b`, memorizzati in ordine ordinato) e registra **quote LP** che rappresentano una rivendicazione proporzionale su tali riserve. Ogni pool ha un `id` numerico, un `type` e uno `status` (`active` o `paused`). Quando aggiungi liquidità il saldo delle tue quote LP in quel pool aumenta; quando rimuovi liquidità diminuisce e ricevi la tua quota delle riserve.

:::note Le quote LP non sono token
Le quote LP sono voci nel registro del modulo AMM, tenute per pool e per account (la chiave interna è `amm-lp/<pool id>`). **Non sono bank coin né token ERC-20, non compaiono nel tuo saldo bank e non possono essere trasferite, inviate a un altro account né scambiate**. Leggi la tua quota con la query `lp-balance` o con la route `/lp/{address}` qui sotto.
:::

### Creare un pool

`create-pool` accetta un tipo di pool e i due depositi iniziali (come coin). Per una coppia stable, imposta il coefficiente di amplificazione con `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Aggiungere liquidità

`add-liquidity` deposita entrambi i lati in un pool e accredita il saldo delle tue quote LP. L'argomento finale è la quantità minima di quote LP che accetterai — la tua protezione contro lo spostamento del rapporto del pool prima che la tua transazione venga registrata.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Rimuovere liquidità

`remove-liquidity` addebita quote LP dal tuo saldo e preleva le riserve. I due argomenti `min` impostano la quantità minima di ciascun lato che accetterai di ricevere indietro.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Swap

L'AMM supporta le due direzioni di swap standard.

### Exact-in

`swap-exact-in` spende un importo di input fisso e restituisce qualunque output produca la curva, soggetto a un limite minimo di output (protezione dallo slippage).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` richiede un importo di output fisso e spende qualunque input sia necessario, soggetto a un tetto massimo di input.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

L'argomento finale `min-out` / `max-in` di ogni swap è la protezione dallo slippage: impostalo a partire da un preventivo aggiornato (sotto) più la tua tolleranza, e la transazione viene annullata se il prezzo eseguito lo violasse.

## Preventivi (anteprima del prezzo)

I preventivi sono di sola lettura — visualizzano un'anteprima di uno swap senza inviarlo, in modo che un client possa mostrare l'output e la commissione previsti prima che l'utente firmi. Sono il supporto naturale per il campo del prezzo di una UI di Trade.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

La `fee` restituita è la commissione di swap che l'AMM applica all'operazione. I livelli di commissione e slippage dipendono dal pool/dai parametri; usa gli endpoint di preventivo per vedere il loro effetto concreto su una data operazione invece di calcolarli manualmente.

## Ispezione di pool e saldi

Tutte queste sono query di sola lettura che chiunque può eseguire.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool` restituisce le riserve del pool, l'offerta di LP, il tipo, lo stato e un prezzo medio ponderato corrente. `lp-balance` restituisce il `balance` di quote LP che un account detiene per quel pool.

### Route REST {#rest-routes}

Le stesse letture sono servite via REST **sia** sulla mainnet (`https://api.qore.host`) **sia** sulla testnet (`https://api-testnet.qore.host`); sono state verificate su entrambe il 27 ottobre 2026:

| Route | Restituisce |
| --- | --- |
| `GET /qorechain/amm/v1/params` | Parametri del modulo |
| `GET /qorechain/amm/v1/pools` | Ogni pool (un elenco vuoto finché non ne esiste alcuno) |
| `GET /qorechain/amm/v1/pools/{pool_id}` | Un pool (`404` se sconosciuto) |
| `GET /qorechain/amm/v1/pools/{pool_id}/lp/{address}` | Il saldo LP di un indirizzo nel pool (`{address}` è un indirizzo bech32 `qor1...`) |
| `GET /qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Il pool per una coppia di denom (`404` se assente) |
| `GET /qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=` | Output e fee per un input esatto |
| `GET /qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Input e fee per un output esatto |

Un preventivo su un pool che non esiste risponde con un errore di pool non trovato.

### Token Fest della testnet {#fest-tokens}

La governance della testnet ha registrato tre contratti ERC-20 di test, **fUSD** (6 decimali), **fETH** (18) e **fBTC** (8), in modo che esistano come bank coin con le denominazioni sensibili alle maiuscole `erc20:<EIP-55 contract address>` (elencate nella pagina [Faucet](/dashboard/faucet#fest-tokens)). I detentori ottengono il bank coin con `MsgConvertERC20` (il mittente deve essere un indirizzo bech32 `qor1...`) e possono creare un pool contro `uqor` con il consueto comando `create-pool` e la fee di creazione di 100 QOR. Sono token di test solo testnet e senza valore, e non esiste ancora alcun pool per essi (verificato il 27 ottobre 2026). La mainnet non ha tali token.

## Mettere in pausa e riprendere un pool

I pool possono essere messi in pausa e ripresi dall'autorità di governance. Sulla mainnet questi due messaggi sono attualmente disattivati dal circuit breaker; sulla testnet non sono disattivati. Un pool in pausa rifiuta swap e modifiche di liquidità finché non viene ripreso — utile per la risposta agli incidenti o per la manutenzione coordinata.


## Riepilogo dei comandi

**Transazioni** (`qorechaind tx amm …`):

| Comando | Scopo |
| --- | --- |
| `create-pool` | Crea un pool `constant_product` o `stable_swap` |
| `add-liquidity` | Deposita riserve e accredita quote LP |
| `remove-liquidity` | Addebita quote LP e preleva riserve |
| `swap-exact-in` | Swap di un importo di input fisso |
| `swap-exact-out` | Swap verso un importo di output fisso |
| `pause-pool` | Mette in pausa un pool (autorità di governance; disattivato sulla mainnet) |
| `resume-pool` | Riprende un pool in pausa (autorità di governance; disattivato sulla mainnet) |

**Query** (`qorechaind query amm …`):

| Comando | Scopo |
| --- | --- |
| `params` | Mostra i parametri del modulo |
| `pool` | Mostra un pool tramite ID |
| `pools` | Elenca tutti i pool |
| `pool-by-denoms` | Risolve un pool dalla sua coppia di denom |
| `lp-balance` | Il saldo LP di un account in un pool |
| `quote-exact-in` | Anteprima dell'output per uno swap a input fisso |
| `quote-exact-out` | Anteprima dell'input per uno swap a output fisso |

## Correlati

- La **Dashboard Trade / DEX** espone questi pool, preventivi e swap in un'interfaccia grafica per gli utenti di tutti i giorni.
- Per capire come l'offerta di QOR, le commissioni e il valore fluiscono attraverso la chain, vedi [Tokenomics](/architecture/tokenomics).
- Prova tu stesso gli swap nell'interfaccia [Trade / DEX](/dashboard/trade).
- Per portare prima gli asset su QoreChain, vedi [Bridging degli asset](/user-guide/bridging-assets) (il bridge non è ancora attivo).
- I pool possono anche essere una fonte di prezzo per le commissioni per la [Gas Abstraction](/user-guide/gas-abstraction); oggi nessun token è accettato per le commissioni.
