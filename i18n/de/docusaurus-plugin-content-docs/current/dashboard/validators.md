---
slug: /dashboard/validators
title: Validators
sidebar_label: Validators
sidebar_position: 12
---

# Validators

Die Seite **Validators** listet die Validatoren des ausgewählten Netzwerks auf, mit Übersichtskarten, einem Suchfeld und für jeden Validator seinem Rang, seiner Voting Power, der Provision, dem Status und einer variablen Renditezahl, die von der Chain gelesen wird. Sie ist ein reines Lese- und Vergleichswerkzeug für Menschen, die entscheiden, wo sie delegieren. Sie hat keine Delegieren-Schaltfläche: Das Staking findet auf der Wallet-Seite statt, siehe [Staking & Validators](/dashboard/staking-and-validators).

## Innovationen {#innovations}

- **Die Liste folgt dem ausgewählten Netzwerk.** Die Seite fragt den Satz des in der Kopfzeile gewählten Netzwerks ab, sodass Mainnet-Betrachter die Mainnet-Validatoren und Testnet-Betrachter die Testnet-Validatoren sehen.
- **Von der Chain gelesene Rendite, mit ihren Grenzen.** Die APY-Spalte ist der Basissatz der Staking-Stufe der Chain, multipliziert mit (1 minus der Provision des Validators). Sie wird mit einem Sternchen und dem Hinweis „variable, not guaranteed, lock bonuses not included“ angezeigt. Die Zahl ist eine Live-Ablesung eines variablen Protokollsatzes, kein Versprechen und keine Prognose.
- **„From fees“ nach Erreichen der Emissionsobergrenze.** Ein Netzwerk, das seine Emissionsobergrenze erreicht hat, zeigt statt eines Prozentwerts **From fees**, weil kein neues QOR geprägt wird und Staking dann nur noch aus Transaktionsgebühren verdient. Im Testnet lautet die Spalte derzeit **From fees**. Ein unbekannter Wert zeigt einen Strich, nie 0.00%.
- **Rang nach Voting Power.** Der Rang wird aus der Voting Power berechnet, Rang 1 ist also der Validator mit dem meisten Stake.
- **Echte Werte, ehrliche Lücken.** Die Provision ist die tatsächliche Provision des Validators, und ein gejailter Validator wird als **Jailed** angezeigt. Region, vorgeschlagene Blöcke, Softwareversion und zuletzt gesehen werden nur angezeigt, wenn das Netzwerk sie meldet, was derzeit nicht der Fall ist; unbekannte Uptime lautet **N/A** statt 0%.

## Anwendung {#how-to-use}

1. Melde dich an und öffne die Seite über ihre Adresse `dashboard.qorechain.io/validators`. Es gibt keinen Seitenleisten-Link.
2. Wähle in der Kopfzeile das Netzwerk (**Mainnet** oder **Testnet**); die Seite lädt mit den Validatoren dieses Netzwerks neu.
3. Lies die Übersichtskarten: **Active Validators**, **Total Bonded**, **Avg Commission** und **Avg Uptime**.
4. Suche mit dem Feld „Search by moniker or address“.
5. Lies jede Zeile: den Rang und den Moniker mit der Adresse (und einer Kopier-Schaltfläche), **Voting power** (Stake und Anteil am Gesamtwert), **Commission**, **APY** und **Status** (aktiv, jailed oder inaktiv), dann die Uptime und eventuelle optionale Details.
6. Zum Delegieren gehst du auf den Tab **Stake / Delegate** der Wallet-Seite ([Delegieren](/dashboard/staking-and-validators#delegate)). Um einen Validator genauer anzusehen, öffne seine Adressseite im [Explorer](/dashboard/explorer#validators).

:::caution APY-Hinweis lesen
Der Prozentwert hängt von einem Protokollsatz ab, der sich ändern kann, und von der Provision des Validators. Sperr-Boni des optionalen Moduls für zeitgesperrtes Staking sind nicht enthalten. Betrachte ihn nicht als garantiertes Einkommen.
:::

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). Die Seite ist nur über die Adresse erreichbar; die Seitenleiste listet sie nicht.
- **Anmeldung:** erforderlich. Abgemeldet zeigt die Seite „Authentication Required“.
- **Netzwerk:** folgt dem Schalter in der Kopfzeile.
- **Wallet:** zum Lesen der Seite nicht nötig.
- **Kosten:** kostenlos.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerke | Anmeldung |
| --- | --- | --- | --- |
| Seite Validators | `dashboard.qorechain.io/validators` | Mainnet und Testnet, Schalter in der Kopfzeile | Erforderlich |
| Validatoren-Tabelle im Explorer | `dashboard.qorechain.io/explorer/validators` | Mainnet und Testnet | Nicht erforderlich |
| Chain-Daten | `GET /cosmos/staking/v1beta1/validators` auf `api.qore.host` und `api-testnet.qore.host` | Mainnet und Testnet | Keine |

## Grenzen und bekannte Probleme {#limits}

- **Die Seite ist nur lesend** und nicht von der Seitenleiste aus verlinkt.
- **Die APY ist variabel und nicht garantiert.** Sie schließt Sperr-Boni aus und zeigt **From fees**, wo die Emissionsobergrenze erreicht wurde.
- **Weniger Datenfelder als ein Node-Dashboard:** Region, vorgeschlagene Blöcke, Softwareversion und zuletzt gesehen werden nur angezeigt, wenn verfügbar, und die Uptime kann N/A lauten.
- **Jailed Validatoren** werden als jailed angezeigt und im Delegieren-Panel nicht angeboten.
- **Die Daten werden kurz zwischengespeichert** (etwa 30 Sekunden), daher kann eine Änderung auf der Chain einen Moment brauchen, bis sie erscheint.
