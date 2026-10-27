---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Nodes & Validators
sidebar_position: 11
---

# Nodes & Validators (Tools Hub)

Die Seite **Nodes & Validators** versammelt das Betreiber- und Builder-Tooling von QoreChain an einem Ort, in sechs Tabs, in dieser Reihenfolge: **Validator Program**, **Validator Application**, **Light Node**, **Node Registration**, **Rollups** und **SDK**. Die Seite folgt dem Netzwerkschalter in der Kopfzeile: Chain-Prüfungen, Downloads und Node-Status werden aus dem Netzwerk gelesen, das du ausgewählt hast. Lizenzen werden **nur im Mainnet** verkauft; im Testnet forderst du eine kostenlose an (siehe [Light Node](#light-node)).

In der Seitenleiste des Dashboards heißt der Eintrag **Nodes & Validators** (er hieß früher Tools; die Adresse lautet weiterhin `/tools`). Tools für Builder, etwa der Status des PQC-Schlüssels, ein Transaktionssimulator und ein Signing-Playground, befinden sich auf der separaten öffentlichen Seite [Developers](/dashboard/developers).

Die gesamte Seite erfordert ein angemeldetes Konto, auf beiden Netzwerken; abgemeldet siehst du einen Bildschirm „Authentication Required“. Siehe [Anmelden](/dashboard/overview#sign-in).

## Validator Program

Ein schreibgeschützter Überblick über das **QoreChain Validator Program**, den Weg, auf dem Validatoren dem Netzwerk beitreten: was das Programm bietet (die On-Chain-Betreibervergabe, Delegation aus von der Association kontrolliertem Stake und ein QOR-Stipendium für unabhängige Betreiber, die die Service-Levels erfüllen), was es verlangt, das Auswahlverfahren und ein FAQ. Protokollparameter auf diesem Tab (Unbonding-Zeit, Slashing, maximale Anzahl an Validatoren) werden live von der Chain gelesen; Programmregeln (der Self-Stake von 100.000 QOR, die Provisionsspanne, das Stipendium) stammen von der Association und sind als solche gekennzeichnet. Validatoren kaufen kein Paket: Sie bewerben sich und zahlen eine **Programmgebühr von 1.000 $** erst, wenn sie ausgewählt wurden.

## Validator Application {#validator-application}

Bewirb dich für das Validator Program:

1. **Fülle die Bewerbung aus.** Name der juristischen Person, Rechtsraum und Kontakt-E-Mail; die **Betreiberadresse** (`qor1…`, das Konto, von dem aus du `create-validator` ausführen wirst: Die On-Chain-Betreibervergabe wird an diese Adresse ausgestellt); Hosting-Anbieter, Region und Art; die Netzwerke, die du bereits betreibst; optional deine Testnet-Validatoradresse und die öffentliche Infrastruktur, die du anbietest (öffentlicher RPC, Snapshots, Archiv); den Track (Standard, oder Global für die reservierten Plätze); und die Annahme der Programmbedingungen. Die Bewerbung ist kostenlos.
2. **Prüfung und Testnet-Probephase.** Während der Prüfung wird die Bewerbung als **Submitted** angezeigt. Bewerbungen, die weiterkommen, betreiben für eine 14-tägige Probephase einen Validator im diana-Testnet, angezeigt als **Testnet trial**.
3. **Auswahl und Programmgebühr.** Eine ausgewählte Bewerbung zeigt **Selected** mit einer Schaltfläche **Pay the $1,000 programme fee**. Der Zahlungsschritt funktioniert wie bei einer Light-Node-Lizenz: Wähle das Netzwerk (USDT auf ERC-20, BEP-20 oder TRC-20), zahle den genau angezeigten Betrag, füge den Transaktions-Hash ein und wähle **Verify payment**; die Zahlung wird dann on-chain verifiziert. Die Gebühr ist an die Betreiberadresse in deiner Bewerbung gebunden; sie kann nicht für eine andere Adresse bezahlt werden. Genehmigung und Zahlung werden immer getrennt angezeigt: Eine Bewerbung kann ausgewählt und trotzdem unbezahlt sein.
4. **Die On-Chain-Betreibervergabe.** Nach der Zahlung stellt die Association die `validator_operator`-Vergabe on-chain für deine Betreiberadresse aus. Mainnet-Vergaben werden von Hand in Stapeln signiert, sind also nicht sofort verfügbar. Der Tab zeigt **Operator grant on chain**, sobald die Chain sie hat, und **In the active set**, sobald dein Validator gebunden ist.

Für eingereichte, im Testnet-Test befindliche, ausgewählte und vergebene Bewerbungen prüft ein Panel **Validator Readiness** (mit einem Adressfeld, das dem Netzwerk in der Kopfzeile folgt) die Chain direkt für die Betreiberadresse: einen registrierten Post-Quantum-Schlüssel, genügend verfügbare QOR für den Self-Stake, die Betreibervergabe und ob der Validator gebunden ist. Führe die [PQC-Schlüsselregistrierung](/developer-guide/running-a-validator#pqc-key-registration) frühzeitig auf deinem eigenen Node durch: Niemand registriert diesen Schlüssel für dich.

Bewerbungen, die unter dem früheren Validator-Angebot (vor Oktober 2026) genehmigt wurden, werden als **Earlier application** angezeigt; die Association kontaktiert diese Bewerber direkt.

## Light Node {#light-node}

Alles, was ein Light-Node-Betreiber braucht, von der Lizenz bis zu einem on-chain registrierten Node.

1. **Kaufe die Lizenz (Mainnet).** Eine Light-Node-Lizenz kostet **50 $**, zahlbar in USDT auf ERC-20, BEP-20 oder TRC-20 und on-chain verifiziert. Gib vor der Zahlung die `qor1…`-Adresse ein, der die Lizenz zugeteilt werden soll; verwende ein Konto, dessen Wiederherstellungswörter du besitzt (deine eigenen Wörter, Keplr oder `qorechaind`), idealerweise eines, das nur für den Node genutzt wird. Ist die Kopfzeile auf **testnet** gestellt, wird nichts verkauft: Der Tab zeigt „Nothing is sold on testnet“ und bietet stattdessen eine kostenlose Selbstbedienungslizenz an (siehe [Kostenlose Testnet-Lizenz](#testnet-licence)).
2. **Warte auf die On-Chain-Vergabe.** Nach der Zahlung zeigt die Lizenz **Paid, awaiting on-chain grant**; sie wechselt erst dann auf **Active on chain**, wenn die Chain die `lightnode_operator`-Vergabe bestätigt. Mainnet-Vergaben werden von Hand in Stapeln signiert. „Bezahlt“ und „on-chain vergeben“ sind getrennte Tatsachen: Der Tab zeigt eine Lizenz nie als aktiv an, bevor die Chain die Vergabe hat.
3. **Installiere und registriere den Node.** Der Tab listet die veröffentlichten Builds für dein Netzwerk mit ihren Prüfsummen auf (Server-Edition `lightnode-sx`, Desktop-Edition `lightnode-ux`, für Linux, macOS und Windows) sowie die Schritte für das aktuelle Release: eine Keyring-Passphrase festlegen, `lightnode-sx onboard`, `lightnode-sx keys add-operator --recover` (fügt das Konto hinzu, für das die Lizenz gilt), `lightnode-sx register` (hängt den Post-Quantum-Schlüssel des Nodes an und registriert ihn; füge `--delegate-to <qorvaloper…>` hinzu, wenn der Adresse der erforderliche Stake fehlt), dann `lightnode-sx start` und `lightnode-sx status`. Die Schritte werden nur dann als aktuell angezeigt, wenn das Release-Manifest des Netzwerks einen Build veröffentlicht, der sie unterstützt, und der Tab gibt an, ob die Registrierung in diesem Netzwerk geöffnet ist.
4. **Hinweise zu deiner Adresse.** Der Tab warnt, wenn die Lizenzadresse eine deiner eigenen verwahrten (custodial) Dashboard-Wallets ist (das Dashboard hält diesen Schlüssel, ein Node kann damit also nicht signieren), und weist darauf hin, wenn die Adresse bereits einen Post-Quantum-Schlüssel on-chain hat (der Node verwendet ihn wieder, wenn er aus deinen Wiederherstellungswörtern abgeleitet wurde, und verweigert andernfalls den Start und empfiehlt ein eigenes Konto).
5. **Status.** Ein Panel liest die Chain: die geltenden Anforderungen (Registrierungsgebühr, delegierter Stake, Uptime, Heartbeat-Fenster, maximale Anzahl an Light Nodes) und, für eine Adresse, ob ein Light Node registriert ist und rechtzeitig meldet. Zu seinen Zuständen gehören „Registered, waiting for its first heartbeat“, „Rewards accrued“ und ein Hinweis, wenn der Node als inaktiv markiert wurde.

### Kostenlose Testnet-Lizenz {#testnet-licence}

Im Testnet (`qorechain-diana`) ist eine Light-Node-Lizenz kostenlos und im Selbstbedienungsverfahren erhältlich. Ist die Kopfzeile auf das Testnet gestellt, öffne den Tab **Light Node**, gib deine `qor1…`-Adresse unter **Free testnet licence** ein und wähle **Request licence**. Die Anfrage wird als „Requested for …“ angezeigt, danach als „Granted to … You can register your node now.“; konnte die Vergabe nicht signiert werden, weist der Tab darauf hin, und du kannst die Anfrage erneut stellen. Vergaben werden automatisch signiert, normalerweise innerhalb weniger Minuten. Pro Konto und pro Adresse ist eine Anfrage möglich. Die Mainnet-Lizenz ist anders: Sie wird für 50 $ gekauft, und ihre Vergabe erfolgt von Hand in Stapeln.

Siehe [Light Node Overview](/light-node/overview) und [Registration & Licensing](/light-node/registration-and-licensing).

:::note Lizenzen, die gekauft wurden, bevor die Adresse erforderlich war
Wenn du eine Lizenz gekauft hast, bevor die Adresse erfasst wurde, öffnet sich der Tab mit **This licence needs a QoreChain address**: Gib die Adresse ein und wähle **Save address**. Solange sie nicht gespeichert ist, kann die Lizenz nicht vergeben werden.
:::

## Node Registration

Erfasst die Daten deines Validators bei der Association. Der Validator wird dadurch nicht on-chain erstellt; das tust du von deinem eigenen Node aus mit `create-validator`.

Das Formular öffnet sich, sobald die Chain eine aktive `validator_operator`-Vergabe für deine Betreiberadresse zeigt und du eine ausgewählte Bewerbung für das Validator Program hast (oder eine Validator-Lizenz aus der Zeit vor dem Programm). Gib deine Validator-Betreiberadresse, einen Moniker, einen Provisionssatz zwischen 5% und 20% und optional einen öffentlichen Endpunkt an, und bestätige dann den Self-Stake von 100.000 QOR, die Unbonding-Frist von 21 Tagen und das Slashing.

Die On-Chain-Schritte stehen in [Running a Validator](/developer-guide/running-a-validator): Registriere deinen PQC-Schlüssel und sende dann `create-validator` mit mindestens 100.000 QOR Self-Stake ab, PQC-mitsigniert wie jede QoreChain-Transaktion. Staking und Validator-Erstellung finden ausschließlich auf der nativen Transaktions-Lane von QoreChain statt; es gibt keinen Weg, einen Validator über eine verknüpfte EVM-Wallet wie MetaMask zu registrieren oder zu binden. Unter dem Formular listet der Tab außerdem auf, was ein Full Node braucht (Release-Binärdatei, Genesis, Peers), entnommen aus dem Release-Manifest des Netzwerks, und zeigt möglicherweise ein Banner „Joining is temporarily suspended“, wenn das Netzwerk keine neuen Validatoren aufnimmt.

Siehe [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Fordere ein von QoreChain betriebenes Rollup an (das Formular heißt **Deploy a Rollup**). Darin kannst du das Rollup benennen und die gewünschte virtuelle Maschine (EVM, QoreChain Native oder SVM), Data-Availability-Schicht, das Gas-Token, das Sequencer-Modell und das Settlement-Ziel angeben. Die Auswahl von **Deploy rollup** erfasst nur eine Bereitstellungsanfrage, die unter dem Formular mit ihrem Status aufgelistet wird; es erstellt das Rollup nicht on-chain. Die Optionen sind breiter als das, was das On-Chain-Rollup-Modul derzeit unterstützt. Um ein Rollup selbst on-chain zu registrieren, siehe [Deploying a Rollup](/rollups/deploying-a-rollup); zu den Konzepten siehe [Rollups Overview](/rollups/overview).

## SDK

Ein statischer Hub mit Installationsschritten, Snippets und Links zum Bauen auf QoreChain im Code (Verbinden, Ableiten von Accounts, Lesen des Zustands, Senden von Überweisungen, Signieren mit einer hybriden ML-DSA-87-Signatur (FIPS 204)). Sein Inhalt wird nicht im Gleichschritt mit den SDK-Releases gepflegt; entnimm Versionen und Installationsbefehle daher stattdessen [Install](/sdk/install) und der [QoreChain SDK Overview](/sdk/overview).

Dazu, wie die Lizenzierung netzwerkweit funktioniert, siehe [Chain Licensing](/architecture/chain-licensing).
