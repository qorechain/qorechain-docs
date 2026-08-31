---
slug: /user-guide/xqore-staking
title: xQORE-Staking
sidebar_label: xQORE-Staking
sidebar_position: 4
---

# xQORE-Staking

Dieser Leitfaden beschreibt den xQORE-Governance-Staking-Mechanismus, mit dem QOR-Inhaber ihre Token für erweiterte Governance-Macht sperren können, unterstützt durch ein PvP-Rebase-Modell, das langfristige Teilnehmer belohnt.

:::note
Die folgenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) läuft seit dem 7. Juni 2026 mit Chain-Version **v3.1.95** produktiv — ersetzen Sie beim Staking auf dem Mainnet die Chain-ID und die Endpunkte durch die Angaben auf der Seite **Connecting to Mainnet**.
:::

---

## Überblick

xQORE ist das Governance-Staking-Token von QoreChain. Wenn Sie QOR sperren, erhalten Sie xQORE im Verhältnis **1:1**. Der Besitz von xQORE verschafft einen erheblichen Vorteil bei der Governance: xQORE-Token zählen mit **doppeltem Gewicht** in der QDRW-Stimmkraft-Formel (siehe [Governance](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Das bedeutet, dass das Sperren von QOR zu xQORE dessen Governance-Wirkung im Vergleich zu reinem Staking effektiv verdoppelt.

---

## QOR für xQORE sperren

Sperren Sie QOR-Token, um xQORE im Verhältnis 1:1 zu prägen:

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** 1.000 QOR sperren:

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Nach dieser Transaktion hält Ihr Konto 1.000.000.000 uxqore (1.000 xQORE).

---

## xQORE entsperren

Verbrennen Sie xQORE, um QOR zurückzuerhalten. Je nachdem, wie lange die Token gesperrt waren, kann eine **Ausstiegsstrafe (Exit Penalty)** anfallen:

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Beispiel:** 500 xQORE entsperren:

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Zeitplan der Ausstiegsstrafe

Ein vorzeitiger Ausstieg aus xQORE zieht eine Strafe nach sich. Je länger Sie halten, desto niedriger die Strafe:

| Sperrdauer          | Ausstiegsstrafe |
| -------------------- | ---------------- |
| Weniger als 30 Tage  | **50 %**         |
| 30 bis 90 Tage       | **35 %**         |
| 90 bis 180 Tage      | **15 %**         |
| Mehr als 180 Tage    | **0 %**          |

**Beispiel:** Wenn Sie 1.000 QOR gesperrt haben und nach 45 Tagen entsperren, erhalten Sie 650 QOR (35 % Strafe angewendet). Die verbleibenden 350 QOR werden über den PvP-Rebase-Mechanismus an die übrigen xQORE-Inhaber umverteilt.

---

## PvP-Rebase-Mechanismus

Strafen aus vorzeitigen Ausstiegen werden **nicht verbrannt**. Stattdessen werden sie anteilig an alle verbleibenden xQORE-Inhaber umverteilt. Dadurch entsteht eine „Player vs Player"-Dynamik, bei der geduldige Halter von der Ungeduld anderer profitieren.

So funktioniert es:

1. Ein Nutzer entsperrt xQORE vor Ablauf der 180-Tage-Schwelle für Strafenfreiheit.
2. Die Ausstiegsstrafe wird vom zurückerhaltenen QOR abgezogen.
3. Der Strafbetrag wird anteilig auf alle verbleibenden xQORE-Positionen verteilt.
4. Der beanspruchbare QOR-Betrag pro xQORE steigt für jeden verbleibenden Inhaber.

Dieser Mechanismus fördert langfristiges Engagement in der Governance und belohnt Inhaber, die ihre Positionen halten.

---

## Ihre Position abfragen

Prüfen Sie Ihre aktuelle xQORE-Position, Sperrdauer und die geltende Ausstiegsstrafe:

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

Für Anwendungen, die über JSON-RPC mit QoreChain integrieren, kann die xQORE-Position abgefragt werden mit:

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

* Sperren Sie QOR rechtzeitig vor wichtigen Governance-Abstimmungen in xQORE, um Ihre Stimmkraft zu maximieren.
* Die 180-Tage-Schwelle für strafenfreie Ausstiege belohnt geduldige Governance-Teilnehmer.
* Behalten Sie die PvP-Rebase-Zuwächse im Blick. Wenn andere vorzeitig aussteigen, wächst der Wert Ihrer Position.
* xQORE ist nicht übertragbar. Es kann nur durch das Sperren von QOR geprägt und durch das Entsperren verbrannt werden.
* Überlegen Sie die Ausstiegsstrafe sorgfältig, bevor Sie sperren. Kurzfristige Sperrungen sind mit erheblichen Strafen verbunden.
