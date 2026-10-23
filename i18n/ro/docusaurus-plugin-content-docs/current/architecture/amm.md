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
Comenzile de mai jos folosesc `qorechaind`. Adăugați flag-urile uzuale de tranzacție (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) pentru mediul dumneavoastră — de exemplu `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` pe mainnet (pragul minim de taxă al rețelei este 0,1 uqor per unitate de gas). Fiecare comandă `tx amm` este o tranzacție pe lane-ul Cosmos, deci necesită semnătura hibridă post-cuantică: adăugați `--generate-only > tx.json`, apoi rulați `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` (vedeți [First Transaction](/getting-started/first-transaction#send-qor)).
:::

:::caution Nu există încă pool-uri
Modulul AMM este activ pe mainnet și pe testnet (ambele v3.2.4), dar **nu a fost creat încă niciun pool** (verificat pe 23 octombrie 2026: `GET /qorechain/amm/v1/pools` returnează o listă goală pe ambele), iar denom-urile din exemplele de mai jos (`uusdc`, `uusdt`) sunt ilustrative: astăzi nu există astfel de active pe rețele. Până când există un pool, orice comandă de schimb sau de adăugare de lichiditate eșuează cu o eroare de tip pool negăsit.
:::

## Parametrii modulului {#parameters}

Citiți valorile curente cu `qorechaind query amm params` sau `GET /qorechain/amm/v1/params`. Mainnet și testnet raportează în prezent aceleași valori:

| Parametru | Valoare | Semnificație |
| --- | --- | --- |
| `enabled` | `true` | Comutatorul modulului |
| `swap_fee_bps` | `30` | Taxa de schimb, 0,30 % din suma de intrare |
| `protocol_fee_bps` | `10` | Partea din taxa de schimb care părăsește pool-ul ca cotă a protocolului (0,10 % din intrare). Restul rămâne în pool pentru furnizorii de lichiditate |
| `pool_creation_fee` | `100000000` | 100 QOR (în uqor), percepuți peste depozitele inițiale și arși la crearea unui pool |
| `min_liquidity` | `1000` | Cel mai mic dintre cele două depozite inițiale ale unui pool nou trebuie să fie de cel puțin atâtea unități de bază |
| `max_pools_per_creator` | `50` | Pool-uri pe care le poate crea un cont |
| `max_swap_impact_bps` | `500` | Cel mai mare impact asupra prețului pe care îl poate avea un schimb (5 %); vedeți [Regulile de schimb](#swap-rules) |
| `lp_token_decimals` | `6` | Zecimalele token-ului LP al unui pool |

## Regulile de schimb aplicate începând cu v3.2.2 {#swap-rules}

Corecțiile de integritate AMM de mai jos au fost aplicate pe mainnet cu v3.2.2 (înălțimea 3.556.788, 16 octombrie 2026) și rafinate în v3.2.3 (înălțimea 3.662.051, 20 octombrie 2026). Se aplică fiecărui schimb, indiferent de lane-ul din care sosește.

* **Ambele denominări sunt legate de pool.** Un schimb trebuie să numească cele două denom-uri ale pool-ului vizat. Pool-urile stable-swap sunt evaluate cu curba stable-swap în ambele direcții (exact-in și exact-out).
* **Taxa de protocol.** Cota de protocol din taxa de schimb părăsește pool-ul. Când este plătită în QOR, ajunge la colectorul de taxe și este împărțită cu celelalte taxe ale blocului (vedeți [Tokenomics](/architecture/tokenomics)), iar partea arsă este înregistrată sub sursa de ardere `amm`; în orice altă denominare ajunge în community pool. Taxa de creare a pool-ului este arsă și înregistrată sub aceeași sursă `amm`.
* **Plafonul impactului asupra prețului.** `max_swap_impact_bps` este aplicat: un schimb al cărui impact asupra prețului pool-ului depășește 5 % este refuzat. Un schimb care nu stabilește nicio limită de alunecare (`min-out` de 0 la exact-in, sau un `max-in` care acoperă întreaga rezervă de intrare la exact-out) este măsurat suplimentar față de prețul pool-ului de la începutul blocului și este refuzat dacă tranzacțiile anterioare din același bloc l-au mutat peste plafon. Setați un `min-out` / `max-in` real la fiecare schimb.
* **Muncă limitată la sfârșit de bloc (v3.2.3).** La sfârșitul fiecărui bloc, modulul reîmprospătează prețul mediu ponderat curent al cel mult 100 de pool-uri, în rotație (round-robin). Cât timp există 100 de pool-uri sau mai puține, fiecare pool este reîmprospătat în fiecare bloc; peste acest număr, media unui pool se actualizează o dată la fiecare rundă de `ceil(pools / 100)` blocuri. Media este informativă (este returnată de interogările `pool`) și nu modifică prețul schimburilor.

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

Pool-urile pot fi suspendate și reluate de către autoritatea de guvernanță. Pe mainnet, aceste două mesaje sunt în prezent dezactivate de întrerupătorul de circuit (circuit breaker); pe testnet nu sunt dezactivate. Un pool suspendat respinge schimburile și modificările de lichiditate până când este reluat — util pentru răspunsul la incidente sau pentru mentenanță coordonată.


## Rezumatul comenzilor

**Tranzacții** (`qorechaind tx amm …`):

| Comandă | Scop |
| --- | --- |
| `create-pool` | Creează un pool `constant_product` sau `stable_swap` |
| `add-liquidity` | Depune rezerve și emite token-uri LP |
| `remove-liquidity` | Arde token-uri LP și retrage rezerve |
| `swap-exact-in` | Schimbă o sumă de intrare fixă |
| `swap-exact-out` | Schimbă către o sumă de ieșire fixă |
| `pause-pool` | Suspendă un pool (autoritate de guvernanță; dezactivat pe mainnet) |
| `resume-pool` | Reia un pool suspendat (autoritate de guvernanță; dezactivat pe mainnet) |

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
- Pentru a aduce mai întâi active pe QoreChain, vedeți [Transferul de active prin punte](/user-guide/bridging-assets) (bridge-ul nu este încă activ).
- Pool-urile pot fi, de asemenea, o sursă de preț pentru taxe în [Abstractizarea gazului](/user-guide/gas-abstraction); în prezent nu este acceptat niciun token pentru taxe.
