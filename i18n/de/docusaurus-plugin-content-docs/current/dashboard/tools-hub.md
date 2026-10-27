---
slug: /dashboard/tools-hub
title: Nodes & Validators
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators

Die Seite **Nodes & Validators** (Seitenleistengruppe **Build**, Adresse `/tools`; sie hieß vor dem 27. Oktober 2026 Tools und Tools Hub) ist die Betreiberseite des Dashboards. Sie hat fünf Tabs, in dieser Reihenfolge: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration** und **Rollups**. Sie richtet sich an Personen, die einen Validator oder einen Light Node betreiben oder ein Anwendungs-Rollup anfragen möchten. Der SDK-Tab ist auf die öffentliche Seite [Developers](/dashboard/developers) umgezogen, die auch die Builder-Tools enthält (PQC-Schlüsselstatus, Simulator, Signing playground, QoreX test wallet).

## Innovationen {#innovations}

- **Chain-Prüfungen kommen von der Chain.** Das Panel **Validator Readiness** prüft im ausgewählten Netzwerk vier Dinge: einen registrierten ML-DSA-87-Schlüssel, verfügbare QOR für den Self-Stake (Vesting ausgenommen), die On-Chain-Betreibervergabe und ob der Validator gebunden ist. Das Panel **Light node status** liest die geltenden Anforderungen (Registrierungsgebühr, delegierter Stake, Uptime, Heartbeat-Fenster, maximale Anzahl an Light Nodes) sowie den Registrierungs- und Heartbeat-Zustand der Adresse.
- **„Bezahlt“ und „on-chain vergeben“ sind getrennte Tatsachen.** Eine bezahlte Lizenz zeigt **Paid, awaiting on-chain grant**, bis die Chain die Vergabe bestätigt, danach **Active on chain**. Der Tab zeigt eine Lizenz nie als aktiv an, bevor die Chain die Vergabe hat.
- **Protokollregeln und Programmregeln sind getrennt gekennzeichnet.** Jede Parameterzeile sagt, ob sie vom Protokoll stammt (von der Chain gelesen) oder vom Programm (von der Association angewendet).
- **Eine Testnet-Light-Node-Lizenz im Selbstbedienungsverfahren.** Gib unter **Free testnet licence** eine `qor1...`-Adresse ein und wähle **Request licence**; die Vergabe wird automatisch signiert, normalerweise innerhalb weniger Minuten. Mainnet-Vergaben bleiben manuell.
- **Die Node-Schritte folgen dem Release-Manifest des Netzwerks.** Downloads (Server-Edition `lightnode-sx`, Desktop-Edition `lightnode-ux`, je Plattform, mit SHA-256-Prüfsummen), ob die Registrierung geöffnet ist und ob die Schritte aktuell sind, stammen alle aus dem Manifest.

## Anleitung {#how-to-use}

Voraussetzung für jeden Tab: angemeldet sein. Die Tabs folgen dem Netzwerkschalter in der Kopfzeile (Chain-Prüfungen, Downloads und Node-Status werden aus dem ausgewählten Netzwerk gelesen). Abgemeldet zeigt die Seite „Authentication Required“. Siehe [Anmelden](/dashboard/overview#sign-in).

### Validator Program {#validator-program}

Ein schreibgeschützter Überblick über das **QoreChain Validator Program**, den Weg, auf dem Validatoren dem Netzwerk beitreten: was das Programm bietet (die On-Chain-Betreibervergabe, Delegation aus von der Association kontrolliertem Stake und ein QOR-Stipendium für unabhängige Betreiber, die die Service-Levels erfüllen), was es verlangt, das Auswahlverfahren und ein FAQ. Er hat die Schaltflächen **Apply** und **Ask a question**. Protokollparameter (Unbonding-Zeit, Slashing, maximale Anzahl an Validatoren) werden live von der Chain gelesen; Programmregeln (der Self-Stake von 100.000 QOR, die Provisionsspanne, das Stipendium) stammen von der Association und sind als solche gekennzeichnet. Validatoren kaufen kein Paket: Sie bewerben sich und zahlen eine **Programmgebühr von 1.000 $** erst, wenn sie ausgewählt wurden. Zu den Stipendienbeträgen siehe den Tab selbst.

### Validator Application {#validator-application}

1. **Fülle die Bewerbung aus.** Name der juristischen Person, Rechtsraum und Kontakt-E-Mail; die **Betreiberadresse** (`qor1...`, das Konto, von dem aus du `create-validator` ausführen wirst; die On-Chain-Betreibervergabe wird an diese Adresse ausgestellt); Hosting-Anbieter, Region und Art; die Netzwerke, die du bereits betreibst; optional deine Testnet-Validatoradresse (`qorvaloper1...`) und die öffentliche Infrastruktur, die du anbietest (öffentlicher RPC, Snapshots, Archiv); den Track (Standard, oder Global für die reservierten Plätze); und die Annahme der Programmbedingungen. Wähle **Submit application**. Die Bewerbung ist kostenlos.
2. **Prüfung und Testnet-Probephase.** Die Bewerbung wird als **Application submitted** angezeigt, dann, für Bewerbungen, die weiterkommen, als **Testnet trial** (eine 14-tägige Probephase, in der ein Validator auf `qorechain-diana` betrieben wird). Eine abgelehnte zeigt **Not selected**, mit **Apply again**.
3. **Auswahl und Programmgebühr.** Eine ausgewählte Bewerbung zeigt **Selected** mit einer Schaltfläche **Pay the $1,000 programme fee**. Wähle das Netzwerk (USDT auf ERC-20, BEP-20 oder TRC-20), zahle den genau angezeigten Betrag, füge den Transaktions-Hash ein und wähle **Verify payment**; die Zahlung wird on-chain verifiziert. Die Gebühr ist an die Betreiberadresse in deiner Bewerbung gebunden und kann nicht für eine andere Adresse bezahlt werden. Genehmigung und Zahlung werden getrennt angezeigt: Eine Bewerbung kann ausgewählt und trotzdem unbezahlt sein. Nach der Zahlung zeigt die Karte „Programme fee paid“.
4. **Die On-Chain-Betreibervergabe.** Nach der Zahlung stellt die Association die `validator_operator`-Vergabe on-chain für deine Betreiberadresse aus. Mainnet-Vergaben werden von Hand in Stapeln signiert, sind also nicht sofort verfügbar. Der Tab zeigt **Operator grant on chain**, sobald die Chain sie hat, und **In the active set**, sobald dein Validator gebunden ist.
5. **Readiness.** Für eingereichte, im Testnet-Test befindliche, ausgewählte und vergebene Bewerbungen prüft das Panel **Validator Readiness** (mit einem Adressfeld) die Chain für die Betreiberadresse. Führe die [PQC-Schlüsselregistrierung](/developer-guide/running-a-validator#pqc-key-registration) frühzeitig auf deinem eigenen Node durch: Niemand registriert diesen Schlüssel für dich.

Bewerbungen, die unter dem früheren Validator-Angebot (vor Oktober 2026) genehmigt wurden, werden als **Earlier application** angezeigt; die Association kontaktiert diese Bewerber direkt.

### Light Node {#light-node}

Alles, was ein Light-Node-Betreiber braucht, von der Lizenz bis zu einem registrierten Node.

1. **Kaufe die Lizenz (Mainnet).** Eine Light-Node-Lizenz kostet **50 $**, zahlbar in USDT auf ERC-20, BEP-20 oder TRC-20 und on-chain verifiziert. Gib die `qor1...`-Adresse ein, der die Lizenz zugeteilt werden soll, wähle das USDT-Netzwerk und wähle **Buy for $50**; verwende ein Konto, dessen Wiederherstellungswörter du besitzt (deine eigenen Wörter, Keplr oder `qorechaind`), idealerweise eines, das nur für den Node genutzt wird. Nach der Zahlung zeigt die Karte **Payment received**, und die On-Chain-Vergabe folgt. **Your past orders** werden darunter aufgelistet.
2. **Warte auf die On-Chain-Vergabe.** Die Lizenz zeigt **Paid, awaiting on-chain grant**, dann **Active on chain**, wenn die Chain die `lightnode_operator`-Vergabe bestätigt. Mainnet-Vergaben werden von Hand in Stapeln signiert.
3. **Installiere und registriere den Node.** Der Tab listet die veröffentlichten Builds für dein Netzwerk mit ihren Prüfsummen auf sowie die Schritte für das aktuelle Release: eine Keyring-Passphrase festlegen, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (fügt das Konto hinzu, für das die Lizenz gilt), `lightnode-sx register` (hängt den Post-Quantum-Schlüssel des Nodes an und registriert ihn; füge `--delegate-to <qorvaloper...>` hinzu, wenn der Adresse der erforderliche Stake fehlt), dann `lightnode-sx start` und `lightnode-sx status`. Die Schritte werden nur dann als aktuell angezeigt, wenn das Release-Manifest des Netzwerks einen Build veröffentlicht, der sie unterstützt, und der Tab gibt an, ob die Registrierung geöffnet ist.
4. **Hinweise zu deiner Adresse.** Der Tab warnt, wenn die Lizenzadresse eine deiner eigenen verwahrten (custodial) Dashboard-Wallets ist („This address cannot run a node“: Das Dashboard hält diesen Schlüssel), und weist darauf hin, wenn die Adresse bereits einen Post-Quantum-Schlüssel on-chain hat (der Node verwendet ihn wieder, wenn er aus deinen Wiederherstellungswörtern abgeleitet wurde, und verweigert andernfalls den Start und empfiehlt ein eigenes Konto).
5. **Status.** Ein Panel zeigt die geltenden Anforderungen und ob ein Light Node registriert ist und rechtzeitig meldet. Zu seinen Zuständen gehören „Registered, waiting for its first heartbeat“, „Rewards accrued“ und ein Hinweis, wenn der Node als inaktiv markiert wurde.

#### Kostenlose Testnet-Lizenz {#testnet-licence}

Im Testnet (`qorechain-diana`) wird nichts verkauft („Nothing is sold on testnet“), und eine Light-Node-Lizenz ist kostenlos und im Selbstbedienungsverfahren erhältlich:

1. Stelle die Kopfzeile auf **Testnet** und öffne den Tab **Light Node**.
2. Gib unter **Free testnet licence** deine `qor1...`-Adresse ein und wähle **Request licence**.
3. Die Anfrage wird als „Requested for ...“ angezeigt, danach als „Granted to ... You can register your node now.“ Konnte die Vergabe nicht signiert werden, weist der Tab darauf hin, und du kannst die Anfrage erneut stellen.

Vergaben werden automatisch signiert, normalerweise innerhalb weniger Minuten. Pro Konto und pro Adresse ist eine Anfrage möglich. **Minimales Beispiel:** Testnet, **Light Node**, **Request licence**, auf „Granted to ...“ warten, dann `lightnode-sx onboard` bis `register` ausführen.

Siehe [Light Node Overview](/light-node/overview) und [Registration & Licensing](/light-node/registration-and-licensing).

:::note Lizenzen, die gekauft wurden, bevor die Adresse erforderlich war
Wenn du eine Lizenz gekauft hast, bevor die Adresse erfasst wurde, öffnet sich der Tab mit **This licence needs a QoreChain address**: Gib die Adresse ein und wähle **Save address**. Solange sie nicht gespeichert ist, kann die Lizenz nicht vergeben werden.
:::

### Node Registration {#node-registration}

Erfasst die Daten deines Validators bei der Association. Der Validator wird dadurch nicht on-chain erstellt; das tust du von deinem eigenen Node aus mit `create-validator`. Der Tab ist gesperrt, bis die Vergabe on-chain ist.

Das Formular öffnet sich, sobald die Chain eine aktive `validator_operator`-Vergabe für deine Betreiberadresse zeigt und du eine ausgewählte Bewerbung für das Validator Program hast (oder eine Validator-Lizenz aus der Zeit vor dem Programm). Gib die Betreiberadresse, einen **Moniker**, eine **Commission** zwischen 5% und 20% und optional einen Endpunkt an, setze den Haken bei der Bestätigung (der Self-Stake von 100.000 QOR, die Unbonding-Frist von 21 Tagen und das Slashing) und wähle **Register validator**.

Die On-Chain-Schritte stehen in [Running a Validator](/developer-guide/running-a-validator): Registriere deinen PQC-Schlüssel und sende dann `create-validator` mit mindestens 100.000 QOR Self-Stake ab, PQC-mitsigniert wie jede QoreChain-Transaktion. Staking und Validator-Erstellung finden ausschließlich auf der nativen Transaktions-Lane statt; es gibt keinen Weg, einen Validator über eine verknüpfte EVM-Wallet wie MetaMask zu registrieren oder zu binden. Unter dem Formular listet der Tab auf, was ein Full Node braucht (Release-Binärdatei, Genesis, Peers), entnommen aus dem Release-Manifest, und zeigt möglicherweise ein Banner „Joining is temporarily suspended“, wenn das Netzwerk keine neuen Validatoren aufnimmt. Siehe [Staking & Validators](/dashboard/staking-and-validators).

### Rollups {#rollups}

Der Tab heißt **Request a Rollup**. Fülle das Formular aus: ein Name, die virtuelle Maschine (EVM, QoreChain Native oder SVM), die Data-Availability-Schicht (QoreChain DA, Celestia oder EigenDA), das Gas-Token, der Sequencer (Shared sequencer, Dedicated (single) oder Decentralized) und das Settlement-Ziel (QoreChain mainnet oder Ethereum), und wähle dann **Request deployment**. Das erfasst nur eine Anfrage, die unter dem Formular mit ihrem Status aufgelistet wird; in diesem Schritt wird nichts on-chain erstellt. Die Optionen sind breiter als das, was das On-Chain-Rollup-Modul derzeit unterstützt. Um ein Rollup selbst on-chain zu registrieren, siehe [Deploying a Rollup](/rollups/deploying-a-rollup); zu den Konzepten siehe [Rollups Overview](/rollups/overview).

## Zugang {#how-to-access}

- **URL:** [dashboard.qorechain.io/tools](https://dashboard.qorechain.io/tools), oder **Nodes & Validators** in der Seitenleistengruppe **Build**.
- **Anmeldung:** für die gesamte Seite erforderlich, auf beiden Netzwerken.
- **Netzwerk:** der Kopfzeile folgen. Der Kauf der 50-$-Lizenz ist nur im Mainnet möglich; die kostenlose Lizenz nur im Testnet.
- **Kosten:** Die Bewerbung ist kostenlos; die Programmgebühr für Validatoren beträgt 1.000 $ und wird erst nach der Auswahl bezahlt; eine Mainnet-Light-Node-Lizenz kostet 50 $; die Testnet-Lizenz ist kostenlos.
- **Wallet:** ein Konto, dessen Wiederherstellungswörter du für den Node besitzt; zum Lesen der Tabs ist keine Wallet nötig.

## Wo es veröffentlicht ist {#where-published}

| Oberfläche | Adresse | Netzwerke |
| --- | --- | --- |
| Nodes & Validators | `dashboard.qorechain.io/tools` | Mainnet und Testnet, Schalter in der Kopfzeile |
| Node-Downloads und Prüfsummen | Der Tab Light Node | Je Release-Manifest des Netzwerks |
| SDK- und Builder-Tools | [Developers](/dashboard/developers) | Beide |

## Grenzen und bekannte Probleme {#limits}

- **Mainnet-Vergaben sind manuell,** werden in Stapeln signiert, sodass eine bezahlte Lizenz in „Paid, awaiting on-chain grant“ wartet. Testnet-Vergaben sind automatisch.
- **Eine kostenlose Testnet-Anfrage** pro Konto und pro Adresse.
- **Rollups ist auf beiden Netzwerken ein Anfrageformular;** es erstellt nichts on-chain.
- **Der Beitritt als Validator kann pausiert sein** (das Banner „Joining is temporarily suspended“).
- **Die USDT-Empfangsdaten und etwaige Stipendienbeträge** werden nur innerhalb der Tabs zum Zeitpunkt der Zahlung oder Bewerbung angezeigt.

Dazu, wie die Lizenzierung netzwerkweit funktioniert, siehe [Chain Licensing](/architecture/chain-licensing).
