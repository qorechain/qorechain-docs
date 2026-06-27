---
slug: /architecture/amm
title: AMM și lichiditate on-chain
sidebar_label: AMM și lichiditate on-chain
sidebar_position: 8
---

# AMM și lichiditate on-chain

Modulul `x/amm` este market maker-ul automatizat (AMM) nativ, on-chain, al QoreChain. Permite oricui să creeze pool-uri de lichiditate, să furnizeze lichiditate și să schimbe între active native QoreChain direct la nivel de protocol — fără registru de ordine off-chain și fără un DEX bazat pe contracte inteligente externe. Este stratul de decontare on-chain din spatele experienței **Trade / DEX din Dashboard**.

Pool-urile urmează curbe de prețuri AMM familiare:

- **`constant_product`** — curba `x*y=k` (perechi de uz general).
- **`stable_swap`** — o curbă cu alunecare redusă pentru perechi strâns ancorate, ajustată printr-un coeficient de amplificare.

Toate sumele folosesc unitățile native ale QoreChain. Token-ul de staking și de taxe este **QOR**, al cărui denom de bază este **uqor** (1 QOR = 10^6 uqor). Participanții la pool și adresele folosesc prefixul bech32 `qor`.

:::note
Comenzile de mai jos folosesc `qorechaind`. Adăugați flag-urile uzuale de tranzacție (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) pentru mediul dumneavoastră — de exemplu `--chain-id qorechain-vladi` pe mainnet.
:::

## Pool-uri și cote LP

Un pool deține rezerve de două denom-uri (`token_a`, `token_b`, stocate în ordine sortată) și emite **token-uri LP** care reprezintă o creanță proporțională asupra acelor rezerve. Fiecare pool are un `id` numeric, un `type`, un `status` (`active` sau `paused`) și propriul denom LP. Când adăugați lichiditate primiți token-uri LP; când eliminați lichiditate le ardeți pentru a vă răscumpăra cota din rezerve.

### Crearea unui pool

`create-pool` primește un tip de pool și cele două depozite inițiale (sub formă de monede). Pentru o pereche stabilă, setați coeficientul de amplificare cu `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Adăugarea de lichiditate

`add-liquidity` depune ambele părți într-un pool și emite token-uri LP. Argumentul final este suma minimă de LP pe care o veți accepta — protecția dumneavoastră împotriva modificării raportului pool-ului înainte ca tranzacția să fie procesată.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Eliminarea de lichiditate

`remove-liquidity` arde token-uri LP și retrage rezerve. Cele două argumente `min` setează suma minimă din fiecare parte pe care o veți accepta înapoi.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Schimburi

AMM-ul suportă cele două direcții standard de schimb.

### Exact-in

`swap-exact-in` cheltuiește o sumă de intrare fixă și returnează oricât output produce curba, supus unui prag minim de ieșire (protecție la alunecare).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` solicită o sumă de ieșire fixă și cheltuiește oricât input este necesar, supus unui plafon maxim de intrare.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

Argumentul final `min-out` / `max-in` de la fiecare schimb este garanția împotriva alunecării: setați-l pe baza unei cotații proaspete (mai jos) plus toleranța dumneavoastră, iar tranzacția se anulează dacă prețul executat l-ar încălca.

## Cotații (previzualizare preț)

Cotațiile sunt doar pentru citire — previzualizează un schimb fără a-l trimite, astfel încât un client poate afișa un output și o taxă așteptate înainte ca utilizatorul să semneze. Sunt suportul natural pentru câmpul de preț al unei interfețe Trade.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

`fee`-ul returnat este taxa de schimb pe care AMM-ul o aplică tranzacției. Nivelurile de taxe și alunecare sunt determinate de pool/parametri; folosiți endpoint-urile de cotație pentru a vedea efectul lor concret asupra oricărei tranzacții date, în loc să le calculați manual.

## Inspectarea pool-urilor și a soldurilor

Toate acestea sunt interogări doar pentru citire pe care oricine le poate rula.

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

`pool` returnează rezervele pool-ului, oferta de LP, tipul, statusul și un preț mediu ponderat curent. `lp-balance` returnează `balance`-ul de token-uri LP pe care un cont îl deține pentru acel pool.

## Suspendarea și reluarea unui pool

Pool-urile pot fi suspendate și reluate de către autoritatea pool-ului (adresa transmisă prin `--from`). Un pool suspendat respinge schimburile și modificările de lichiditate până când este reluat — util pentru răspunsul la incidente sau pentru mentenanță coordonată.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## Rezumatul comenzilor

**Tranzacții** (`qorechaind tx amm …`):

| Comandă | Scop |
| --- | --- |
| `create-pool` | Creează un pool `constant_product` sau `stable_swap` |
| `add-liquidity` | Depune rezerve și emite token-uri LP |
| `remove-liquidity` | Arde token-uri LP și retrage rezerve |
| `swap-exact-in` | Schimbă o sumă de intrare fixă |
| `swap-exact-out` | Schimbă către o sumă de ieșire fixă |
| `pause-pool` | Suspendă un pool (autoritate) |
| `resume-pool` | Reia un pool suspendat (autoritate) |

**Interogări** (`qorechaind query amm …`):

| Comandă | Scop |
| --- | --- |
| `params` | Afișează parametrii modulului |
| `pool` | Afișează un pool după ID |
| `pools` | Listează toate pool-urile |
| `pool-by-denoms` | Rezolvă un pool din perechea sa de denom-uri |
| `lp-balance` | Soldul LP al unui cont într-un pool |
| `quote-exact-in` | Previzualizează output-ul pentru un schimb cu intrare fixă |
| `quote-exact-out` | Previzualizează input-ul pentru un schimb cu ieșire fixă |

## Conexe

- **Trade / DEX din Dashboard** expune aceste pool-uri, cotații și schimburi într-o interfață grafică pentru utilizatorii de zi cu zi.
- Pentru modul în care oferta de QOR, taxele și valoarea circulă prin lanț, vedeți [Tokenomics](/architecture/tokenomics).
- Încercați singur schimburile în interfața [Trade / DEX](/dashboard/trade).
- Pentru a aduce mai întâi active pe QoreChain, vedeți [Transferul de active prin punte](/user-guide/bridging-assets).
