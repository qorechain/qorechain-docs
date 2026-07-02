---
slug: /user-guide/xqore-staking
title: xQORE-Staking
sidebar_label: xQORE-Staking
sidebar_position: 4
---

# xQORE-Staking

Dieser Leitfaden behandelt den xQORE-Governance-Staking-Mechanismus, der es QOR-Inhabern ermöglicht, ihre Token für erweiterte Governance-Macht zu sperren – mit einem PvP-Rebase-Modell, das langfristige Teilnehmer belohnt.

:::note
Die nachstehenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 7. Juni 2026 live und läuft mit Chain-Version **v3.1.82** — ersetze für das Staking im Mainnet die Mainnet-Chain-ID und die Endpunkte von der Seite **Verbindung zum Mainnet herstellen**.
:::

---

## Überblick

xQORE ist der Governance-Staking-Token von QoreChain. Wenn du QOR sperrst, erhältst du xQORE im **Verhältnis 1:1**. Das Halten von xQORE bietet einen erheblichen Vorteil in der Governance: xQORE-Token zählen mit **doppeltem Gewicht** in der QDRW-Stimmrechtsformel (siehe [Governance](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Das bedeutet, dass das Sperren von QOR in xQORE seine Governance-Wirkung gegenüber regulärem Staking allein effektiv verdoppelt.

---

## QOR für xQORE sperren

Sperre QOR-Token, um xQORE im Verhältnis 1:1 zu prägen:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Sperre 1.000 QOR:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Nach dieser Transaktion hält dein Konto 1.000.000.000 uxqore (1.000 xQORE).

---

## xQORE entsperren

Verbrenne xQORE, um QOR zurückzuerhalten. Je nachdem, wie lange die Token gesperrt waren, kann eine **Ausstiegsstrafe** anfallen:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** Entsperre 500 xQORE:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Zeitplan der Ausstiegsstrafe

Eine vorzeitige Abhebung aus xQORE zieht eine Strafe nach sich. Je länger du hältst, desto geringer die Strafe:

| Sperrdauer         | Ausstiegsstrafe |
| ------------------ | ------------ |
| Weniger als 30 Tage | **50 %**     |
| 30 bis 90 Tage     | **35 %**     |
| 90 bis 180 Tage    | **15 %**     |
| Mehr als 180 Tage  | **0 %**      |

**Beispiel:** Wenn du 1.000 QOR gesperrt hast und nach 45 Tagen entsperrst, erhältst du 650 QOR (35 % Strafe angewendet). Die verbleibenden 350 QOR werden über den PvP-Rebase-Mechanismus an andere xQORE-Inhaber umverteilt.

---

## PvP-Rebase-Mechanismus

Bei vorzeitigen Ausstiegen erhobene Strafen werden **nicht verbrannt**. Stattdessen werden sie anteilig an alle verbleibenden xQORE-Inhaber umverteilt. Dadurch entsteht eine „Player vs Player“-Dynamik, bei der geduldige Inhaber von der Ungeduld anderer profitieren.

So funktioniert es:

1. Ein Nutzer entsperrt xQORE vor der 180-tägigen Null-Strafen-Schwelle.
2. Die Ausstiegsstrafe wird von seinen zurückgegebenen QOR abgezogen.
3. Der Strafbetrag wird anteilig auf alle verbleibenden xQORE-Positionen verteilt.
4. Die einforderbaren QOR pro xQORE jedes verbleibenden Inhabers erhöhen sich.

Dieser Mechanismus schafft Anreize für langfristiges Governance-Engagement und belohnt Inhaber, die ihre Positionen halten.

---

## Deine Position abfragen

Prüfe deine aktuelle xQORE-Position, die Sperrdauer und die anwendbare Ausstiegsstrafe:

```bash
qorechaind query xqore position <address>
```

**Beispiel:**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Beispielausgabe:**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## JSON-RPC-Zugriff

Für Anwendungen, die über JSON-RPC mit QoreChain integriert sind, kann die xQORE-Position folgendermaßen abgefragt werden:

```
qor_getXQOREPosition
```

**Anfrage:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Antwort:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## Tipps

* Sperre QOR rechtzeitig vor wichtigen Governance-Abstimmungen in xQORE, um deine Stimmkraft zu maximieren.
* Die 180-Tage-Schwelle für strafenfreie Ausstiege belohnt geduldige Governance-Teilnehmer.
* Beobachte die PvP-Rebase-Zuwächse. Wenn andere vorzeitig aussteigen, gewinnt deine Position an Wert.
* xQORE ist nicht übertragbar. Es kann nur durch das Sperren von QOR geprägt und durch Entsperren verbrannt werden.
* Berücksichtige die Ausstiegsstrafe sorgfältig, bevor du sperrst. Kurzfristige Sperren tragen erhebliche Strafen.
