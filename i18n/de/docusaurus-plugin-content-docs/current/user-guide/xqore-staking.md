---
slug: /user-guide/xqore-staking
title: xQORE-Staking
sidebar_label: xQORE-Staking
sidebar_position: 4
---

# xQORE-Staking

Diese Seite beschreibt den **vorgesehenen** xQORE-Governance-Staking-Mechanismus, bei dem QOR-Inhaber Token für erweiterte Governance-Macht sperren würden, unterstützt durch ein PvP-Rebase-Modell, das langfristige Teilnehmer belohnt. **xQORE kann heute auf keinem der beiden Netzwerke verwendet werden**; nichts auf dieser Seite können Sie bereits tun.

:::warning Noch nicht live
xQORE ist in der Genesis aktiviert, aber **noch nicht nutzbar**, weder im Mainnet (`qorechain-vladi`, Node-Release **v3.2.5**) noch im Testnet (`qorechain-diana`, Node-Release **v3.2.6**); keines der beiden Releases ändert daran etwas (auf beiden am 23. Oktober 2026 geprüft, für das Testnet erneut am 27. Oktober 2026 und für das Mainnet nach v3.2.5 am 30. Oktober 2026). Der Node hat dafür keinen Transaktions-, Query-, CLI- oder RPC-Einstiegspunkt (die REST-Route `/qorechain/xqore/v1/params` liefert in beiden Netzwerken `Not Implemented`), daher gibt es weder `tx xqore lock` / `unlock` noch `query xqore ...`, keine xQORE-REST-Route und keine Methode `qor_getXQOREPosition`; es kann kein QOR gesperrt werden, und niemand hält xQORE. Es ist für ein künftiges Chain-Release geplant, das auch ändern wird, wie Ausstiegsstrafen umverteilt werden, sodass das Entsperren unabhängig von der Anzahl der Inhaber günstig bleibt. Das Release wird hier genannt, sobald es erscheint.
:::

---

## Überblick

Im Entwurf prägt das Sperren von QOR xQORE im Verhältnis **1:1**, und xQORE zählt in der QDRW-Stimmkraft-Formel mit **doppeltem Gewicht**:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW selbst ist auf den Live-Netzwerken abgeschaltet, und Governance-Abstimmungen werden allein anhand des gebondeten Einsatzes ausgezählt (siehe [Governance](/user-guide/governance#voting-power)); selbst wenn xQORE erscheint, ändert es die Stimmkraft daher erst, wenn QDRW durch ein künftiges Release aktiviert wird.

---

## Vorgesehener Zeitplan der Ausstiegsstrafe

Die Genesis-Konfiguration definiert eine Ausstiegsstrafe, die sinkt, je länger QOR gesperrt war:

| Sperrdauer          | Ausstiegsstrafe |
| ------------------ | ------------ |
| Weniger als 30 Tage  | **50 %**      |
| 30 bis 90 Tage       | **35 %**      |
| 90 bis 180 Tage      | **15 %**      |
| Mehr als 180 Tage    | **0 %**       |

Im Entwurf werden Strafen **nicht verbrannt** (`penalty_burn_rate` ist `0`): Die gesamte Strafe wird anteilig an die verbleibenden xQORE-Inhaber umverteilt (der „PvP-Rebase"). Der Umverteilungsmechanismus ist der Teil, der sich im Release ändern wird, das xQORE anbindet.

---

## Was nicht verfügbar ist

* **Sperren und Entsperren.** Es gibt keine `tx xqore`-Befehle und keinen Transaktionstyp zum Sperren oder Entsperren von QOR.
* **Positionen.** Es gibt auf keiner Schnittstelle (CLI, REST oder JSON-RPC) eine Abfrage für eine xQORE-Position, und `total_locked` und `total_xqore` sind beide null.
* **Stimmbonus.** Es gibt heute keinen xQORE-Stimmbonus.

Wenn Sie jetzt an der Governance teilnehmen möchten, delegieren Sie QOR an einen Validator (siehe [Staking und Delegation](/user-guide/staking-and-delegation)) und stimmen Sie über Vorschläge ab (siehe [Governance](/user-guide/governance)).

---

## Zeitgesperrtes Staking ist ein anderes Feature (v3.2.4) {#staking-tiers}

Das Release **v3.2.4**, das seit dem 19. Oktober 2026 im Testnet und seit dem 23. Oktober 2026 im Mainnet läuft (Höhe 3.742.566, Governance-Vorschlag 13; das Mainnet läuft seit dem 29. Oktober 2026 mit v3.2.5), fügt ein separates Modul hinzu, `x/stakingtier`, für **optionales zeitgesperrtes Staking**. Es ist nicht xQORE: Es prägt kein xQORE, ändert die Stimmkraft nicht und berührt die oben genannten xQORE-Parameter nicht. In Umrissen:

* Ein Delegator sperrt eine Delegation an einen Validator für eine gewählte Laufzeit (das Modul bietet 3, 6 und 12 Monate an). Solange die Sperre läuft, kann der gesperrte Betrag über keinen Nachrichtenweg entbunden oder neu delegiert werden (eine Transaktion, Authz, ein Contract oder die Governance).
* Sperren haben eine Mindestgröße und eine Begrenzung, wie viele ein Delegator halten darf; lesen Sie sie mit `GET /qorechain/stakingtier/v1/params` aus.
* Eine zusätzliche Belohnungskomponente, die durch die Parameter des Moduls definiert wird, wird pro Inflationsepoche gutgeschrieben und mit einer separaten Nachricht eingefordert. Die Höhe dieser Komponente ist ein Modulparameter und wird auf dieser Seite nicht genannt.
* Eine Sperre kann vorzeitig aufgehoben werden. Die vorzeitige Aufhebung verwirkt das, was aufgelaufen und nicht eingefordert ist, und zieht eine Strafe nach sich, von der ein Teil verbrannt wird.
* Sperren und der Zustand des Modulkontos sind unter `/qorechain/stakingtier/v1/locks/{holder}` und `/qorechain/stakingtier/v1/pool` lesbar.

Das Modul antwortet in beiden Netzwerken, zum Beispiel auf `GET https://api.qore.host/qorechain/stakingtier/v1/params`. Die gewöhnliche Delegation ist behandelt unter [Staking und Delegation](/user-guide/staking-and-delegation).
