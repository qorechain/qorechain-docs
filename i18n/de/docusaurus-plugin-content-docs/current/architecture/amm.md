---
slug: /architecture/amm
title: AMM & On-Chain-Liquidität
sidebar_label: AMM & On-Chain-Liquidität
sidebar_position: 8
---

# AMM & On-Chain-Liquidität

Das `x/amm`-Modul ist QoreChains nativer, On-Chain-betriebener Automated Market Maker (AMM). Es ermöglicht jedem, Liquiditätspools zu erstellen, Liquidität bereitzustellen und direkt auf Protokollebene zwischen QoreChain-nativen Assets zu tauschen — ohne Off-Chain-Orderbuch und ohne externe Smart-Contract-DEX. Es ist die On-Chain-Settlement-Schicht hinter dem **Dashboard-Trade- / DEX**-Erlebnis.

Pools folgen vertrauten AMM-Preiskurven:

- **`constant_product`** — die `x*y=k`-Kurve (Mehrzweckpaare).
- **`stable_swap`** — eine Kurve mit geringer Slippage für eng gekoppelte Paare, abgestimmt durch einen Amplifikationskoeffizienten.

Alle Beträge verwenden QoreChains native Einheiten. Der Staking- und Gebührentoken ist **QOR**, dessen Basis-Denom **uqor** ist (1 QOR = 10^6 uqor). Pool-Teilnehmer und -Adressen verwenden das `qor`-Bech32-Präfix.

:::note
Die folgenden Befehle verwenden `qorechaind`. Hängen Sie die üblichen Transaktions-Flags (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) für Ihre Umgebung an — zum Beispiel `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` gegen das Mainnet (die Netzwerk-Gebührenuntergrenze beträgt 0,1 uqor pro Gaseinheit). Jeder `tx amm`-Befehl ist eine Transaktion auf dem Cosmos-Pfad und benötigt daher die hybride Post-Quanten-Signatur: Fügen Sie `--generate-only > tx.json` hinzu und führen Sie dann `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` aus (siehe [Erste Transaktion](/getting-started/first-transaction#send-qor)).
:::

:::caution Noch keine Pools vorhanden
Das AMM-Modul ist im Mainnet (v3.2.3) und im Testnet (v3.2.4) live, aber **es wurden noch keine Pools erstellt** (geprüft am 20. Oktober 2026: `GET /qorechain/amm/v1/pools` liefert auf beiden eine leere Liste), und die Denoms in den folgenden Beispielen (`uusdc`, `uusdt`) sind illustrativ: Solche Assets existieren heute auf den Netzwerken nicht. Solange kein Pool existiert, schlägt jeder Swap- oder Add-Liquidity-Befehl mit einem Pool-nicht-gefunden-Fehler fehl.
:::

## Modulparameter {#parameters}

Lesen Sie die Live-Werte mit `qorechaind query amm params` oder `GET /qorechain/amm/v1/params`. Mainnet und Testnet melden derzeit dieselben Werte:

| Parameter | Wert | Bedeutung |
| --- | --- | --- |
| `enabled` | `true` | Modulschalter |
| `swap_fee_bps` | `30` | Swap-Gebühr, 0,30 % des Eingabebetrags |
| `protocol_fee_bps` | `10` | Der Teil der Swap-Gebühr, der den Pool als Protokollanteil verlässt (0,10 % der Eingabe). Der Rest verbleibt im Pool für Liquiditätsanbieter |
| `pool_creation_fee` | `100000000` | 100 QOR (in uqor), zusätzlich zu den anfänglichen Einlagen erhoben und bei der Erstellung eines Pools verbrannt |
| `min_liquidity` | `1000` | Die kleinere der beiden anfänglichen Einlagen eines neuen Pools muss mindestens so viele Basiseinheiten betragen |
| `max_pools_per_creator` | `50` | Pools, die ein Konto erstellen darf |
| `max_swap_impact_bps` | `500` | Größte Preisauswirkung, die ein Swap haben darf (5 %); siehe [Swap-Regeln](#swap-rules) |
| `lp_token_decimals` | `6` | Dezimalstellen des LP-Tokens eines Pools |

## Seit v3.2.2 durchgesetzte Swap-Regeln {#swap-rules}

Die folgenden AMM-Integritätskorrekturen wurden mit v3.2.2 auf das Mainnet angewendet (Höhe 3.556.788, 16. Oktober 2026) und in v3.2.3 (Höhe 3.662.051, 20. Oktober 2026) verfeinert. Sie gelten für jeden Swap, gleich von welchem Pfad er eintrifft.

* **Beide Denominationen sind an den Pool gebunden.** Ein Swap muss die beiden Denoms des Pools benennen, auf den er zielt. Stable-Swap-Pools werden in beide Richtungen (Exact-in und Exact-out) mit der Stable-Swap-Kurve bepreist.
* **Protokollgebühr.** Der Protokollanteil der Swap-Gebühr verlässt den Pool. Wird er in QOR bezahlt, geht er an den Fee Collector und wird mit den übrigen Gebühren des Blocks aufgeteilt (siehe [Tokenomics](/architecture/tokenomics)), wobei der verbrannte Teil unter der Burn-Quelle `amm` erfasst wird; in jeder anderen Denomination geht er an den Community-Pool. Die Pool-Erstellungsgebühr wird verbrannt und unter derselben Quelle `amm` erfasst.
* **Obergrenze für die Preisauswirkung.** `max_swap_impact_bps` wird durchgesetzt: Ein Swap, dessen Preisauswirkung gegenüber dem Preis des Pools 5 % übersteigt, wird abgelehnt. Ein Swap ohne Slippage-Grenze (`min-out` von 0 bei Exact-in oder ein `max-in`, das die gesamte Eingabereserve bei Exact-out abdeckt) wird zusätzlich am Preis des Pools zu Beginn des Blocks gemessen und abgelehnt, wenn frühere Handelsgeschäfte im selben Block ihn über die Obergrenze hinaus verschoben haben. Setzen Sie bei jedem Swap ein echtes `min-out` / `max-in`.
* **Begrenzte End-of-Block-Arbeit (v3.2.3).** Am Ende jedes Blocks aktualisiert das Modul den laufenden gewichteten Durchschnittspreis von höchstens 100 Pools im Round-Robin-Verfahren. Solange es 100 Pools oder weniger gibt, wird jeder Pool in jedem Block aktualisiert; darüber hinaus wird der Durchschnitt eines Pools einmal pro Runde von `ceil(pools / 100)` Blöcken aktualisiert. Der Durchschnitt ist informativ (er wird von `pool`-Abfragen zurückgegeben) und ändert die Swap-Bepreisung nicht.

## Pools und LP-Anteile

Ein Pool hält Reserven von zwei Denoms (`token_a`, `token_b`, in sortierter Reihenfolge gespeichert) und prägt **LP-Token**, die einen proportionalen Anspruch auf diese Reserven darstellen. Jeder Pool hat eine numerische `id`, einen `type`, einen `status` (`active` oder `paused`) und seine eigene LP-Denom. Wenn Sie Liquidität hinzufügen, erhalten Sie LP-Token; wenn Sie Liquidität entfernen, verbrennen Sie diese, um Ihren Anteil an den Reserven einzulösen.

### Einen Pool erstellen

`create-pool` nimmt einen Pool-Typ und die beiden anfänglichen Einlagen (als Coins) entgegen. Setzen Sie für ein stabiles Paar den Amplifikationskoeffizienten mit `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Liquidität hinzufügen

`add-liquidity` legt beide Seiten in einen Pool ein und prägt LP-Token. Das letzte Argument ist der minimale LP-Betrag, den Sie akzeptieren — Ihr Schutz davor, dass sich das Pool-Verhältnis verschiebt, bevor Ihre Transaktion verarbeitet wird.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Liquidität entfernen

`remove-liquidity` verbrennt LP-Token und zieht Reserven ab. Die beiden `min`-Argumente legen den minimalen Betrag fest, den Sie von jeder Seite zurückerhalten.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Swaps

Der AMM unterstützt die zwei standardmäßigen Swap-Richtungen.

### Exact-in

`swap-exact-in` gibt einen festen Eingabebetrag aus und liefert so viel Ausgabe zurück, wie die Kurve ergibt, vorbehaltlich einer Mindestausgabe-Untergrenze (Slippage-Schutz).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` fordert einen festen Ausgabebetrag an und gibt so viel Eingabe aus, wie erforderlich ist, vorbehaltlich einer Maximaleingabe-Obergrenze.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

Das abschließende `min-out`- / `max-in`-Argument bei jedem Swap ist der Slippage-Schutz: Setzen Sie es aus einem frischen Angebot (siehe unten) plus Ihrer Toleranz, und die Transaktion wird rückgängig gemacht, wenn der ausgeführte Preis diese verletzen würde.

## Angebote (Preisvorschau)

Angebote sind schreibgeschützt — sie zeigen eine Vorschau eines Swaps, ohne ihn einzureichen, sodass ein Client eine erwartete Ausgabe und Gebühr anzeigen kann, bevor der Nutzer signiert. Sie sind die natürliche Grundlage für das Preisfeld einer Trade-Oberfläche.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

Die zurückgegebene `fee` ist die Swap-Gebühr, die der AMM auf den Handel anwendet. Gebühren- und Slippage-Niveaus sind pool-/parametergesteuert; verwenden Sie die Angebots-Endpunkte, um deren konkrete Auswirkung auf einen bestimmten Handel zu sehen, anstatt sie von Hand zu berechnen.

## Pools und Salden untersuchen

All dies sind schreibgeschützte Abfragen, die jeder ausführen kann.

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

`pool` gibt die Reserven des Pools, das LP-Angebot, den Typ, den Status und einen laufenden gewichteten Durchschnittspreis zurück. `lp-balance` gibt das LP-Token-`balance` zurück, das ein Konto für diesen Pool hält.

## Einen Pool pausieren und fortsetzen

Pools können von der Governance-Autorität pausiert und fortgesetzt werden. Im Mainnet sind diese beiden Nachrichten derzeit durch den Circuit Breaker abgeschaltet; im Testnet sind sie nicht abgeschaltet. Ein pausierter Pool lehnt Swaps und Liquiditätsänderungen ab, bis er fortgesetzt wird — nützlich für die Vorfallreaktion oder koordinierte Wartung.


## Befehlsübersicht

**Transaktionen** (`qorechaind tx amm …`):

| Befehl | Zweck |
| --- | --- |
| `create-pool` | Einen `constant_product`- oder `stable_swap`-Pool erstellen |
| `add-liquidity` | Reserven einzahlen und LP-Token prägen |
| `remove-liquidity` | LP-Token verbrennen und Reserven abheben |
| `swap-exact-in` | Einen festen Eingabebetrag tauschen |
| `swap-exact-out` | Auf einen festen Ausgabebetrag tauschen |
| `pause-pool` | Einen Pool pausieren (Governance-Autorität; im Mainnet abgeschaltet) |
| `resume-pool` | Einen pausierten Pool fortsetzen (Governance-Autorität; im Mainnet abgeschaltet) |

**Abfragen** (`qorechaind query amm …`):

| Befehl | Zweck |
| --- | --- |
| `params` | Modulparameter anzeigen |
| `pool` | Einen Pool nach ID anzeigen |
| `pools` | Alle Pools auflisten |
| `pool-by-denoms` | Einen Pool aus seinem Denom-Paar auflösen |
| `lp-balance` | Der LP-Saldo eines Kontos in einem Pool |
| `quote-exact-in` | Vorschau der Ausgabe für einen Swap mit fester Eingabe |
| `quote-exact-out` | Vorschau der Eingabe für einen Swap mit fester Ausgabe |

## Verwandte Themen

- Das **Dashboard-Trade / DEX** stellt diese Pools, Angebote und Swaps in einer grafischen Oberfläche für alltägliche Nutzer bereit.
- Wie QOR-Angebot, -Gebühren und -Wert durch die Chain fließen, erfahren Sie unter [Tokenomics](/architecture/tokenomics).
- Probieren Sie Swaps selbst in der [Trade / DEX](/dashboard/trade)-Oberfläche aus.
- Um Assets zunächst auf QoreChain zu bringen, siehe [Assets überbrücken](/user-guide/bridging-assets) (die Bridge ist noch nicht live).
- Pools können auch eine Preisquelle für Gebühren bei der [Gas-Abstraktion](/user-guide/gas-abstraction) sein; derzeit wird kein Token für Gebühren akzeptiert.
