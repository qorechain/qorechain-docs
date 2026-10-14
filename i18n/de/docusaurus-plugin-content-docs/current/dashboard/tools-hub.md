---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

Die Seite **Tools** versammelt das Betreiber- und Entwickler-Tooling von QoreChain an einem Ort, organisiert in sieben Tabs, in dieser Reihenfolge: **Information**, **Validator Application**, **Buy License**, **Light Node**, **Node Registration**, **Rollups** und **SDK**. Der Tab **Information** ist ein schreibgeschützter Überblick über die Validator- und Light-Node-Programme — die drei Wege zur Teilnahme (Genesis Validator, Light Node, Delegator), Lizenzstufen, Grundlagen zu Staking und Slashing, Hardwareanforderungen, wer das Programm betreibt, und ein FAQ. Die übrigen Tabs werden im Folgenden zusammengefasst, samt Verweis auf die vollständige Dokumentation. Die Tools-Seite folgt dem Netzwerkschalter in der Kopfzeile, weil veröffentlichte Builds sich zwischen den Netzwerken unterscheiden können.

Melde dich an, um die Tools zu nutzen, die Registrierungen erfassen oder Bewerbungen einreichen – siehe [Anmelden](/dashboard/overview#sign-in).

## Light Node

Einen Light Node zu betreiben und seinem Belohnungsprogramm beizutreten sind zwei verschiedene Dinge, und der Tab Light Node hält sie getrennt, anstatt einen einzigen Anmeldeprozess anzubieten:

1. **Hol dir die Software – funktioniert schon heute.** Keine Lizenz, keine On-Chain-Prüfung und keine Genehmigung nötig; dies wird unabhängig von deinem Lizenzstatus zuerst angezeigt. Der Tab liest das aktuelle Netzwerk-Manifest aus und gibt dir kopierbereite Befehle für einen vollständigen QoreChain-Node (die Binärdatei herunterladen und verifizieren, den Node mit dem Genesis-Datensatz initialisieren, ihn auf die Peers des Netzwerks ausrichten und per State-Sync statt ab Genesis synchronisieren). Ein Light Node selbst braucht nur die Binärdatei `lightnode-sx` oder `lightnode-ux` – siehe [Light Node Overview](/light-node/overview). Unter den Befehlen listet **Download the light node** die veröffentlichten Builds mit ihren sha256-Prüfsummen auf – eine **Desktop edition** (enthält das Web-Dashboard) und eine **Server edition** (headless, Kommandozeile) für sechs Plattformen; prüfe die Datei vor dem Ausführen gegen ihre Prüfsumme. Ist für das gewählte Netzwerk kein Build veröffentlicht, weist das Panel darauf hin.
2. **Prüfe die Anforderungen der Chain – Light node status.** Dieses Panel liest die Live-Parameter der Chain (es sind Governance-Parameter und können sich ändern, ohne dass diese Seite bearbeitet wird): den erforderlichen delegierten Stake – dein Gesamtbetrag über alle Validatoren, an die du delegierst, nicht pro Validator (derzeit 1,000 QOR) –, die Registrierungsgebühr (derzeit 1 QOR), die für Belohnungen nötige Uptime, wie oft ein Heartbeat erwartet wird (und die erlaubte Toleranz) sowie die maximale Anzahl von Light Nodes. Optional kannst du eine Betreiberadresse eingeben, um zu sehen, ob ein Light Node darauf registriert ist, ob er rechtzeitig meldet und welche Belohnungen aufgelaufen sind.
3. **Die Anmeldung für Belohnungen ist noch nicht geöffnet.** Der Beitritt zum Belohnungsanteil für Light Nodes erfordert eine aktive, on-chain vergebene `lightnode_operator`-Lizenz, den minimalen delegierten Stake und die Registrierungsgebühr. Die Anmeldung selbst ist nicht geöffnet (siehe [Status des Belohnungsprogramms](/light-node/overview#reward-program-status)), und der Kauf einer Lizenz öffnet sie nicht vorzeitig, es gibt also heute nichts, wofür man sich anmelden könnte; betreibe und synchronisiere deinen Node in der Zwischenzeit. Die Uptime wird ab dem Block gezählt, in dem sich dein Node on-chain registriert, nicht früher.
4. **Registrierungsdatensatz.** Wenn dein Konto eine Lizenz hält, die als aktiv erfasst ist, zeigt dieser Tab zusätzlich ein kurzes Formular – Betreiberadresse (`qor1…`), Moniker, öffentliche Endpunkt-URL und eine Bestätigung der Stake-Verpflichtung – und danach eine Zusammenfassung dessen, was du eingereicht hast. Dieses Formular erfasst deine Registrierungsanfrage beim The Qore Trust im Dashboard; es sendet **nicht** die On-Chain-Registrierungstransaktion und prüft die Chain nicht. Die On-Chain-Registrierung erfolgt vom Node selbst mit `lightnode-sx register` (siehe [Registration & Licensing](/light-node/registration-and-licensing)) und gelingt erst, wenn die Chain eine aktive Vergabe zeigt, der Stake bereits von deiner Betreiberadresse gebunden ist und die Anmeldung geöffnet ist.

Für das vollständige Bild siehe [Light Node Overview](/light-node/overview) und [Registration & Licensing](/light-node/registration-and-licensing).

## Node Registration

Der Tab Node Registration erfasst eine Validator-Registrierung beim The Qore Trust im Dashboard. Er erstellt den Validator nicht selbst on-chain; das geschieht von deinem eigenen Node aus (Schritte 1 und 5 unten). Voraussetzungen und Schritte:

1. **Registriere zuerst deinen PQC-Schlüssel – über die CLI, auf deinem eigenen Validator-Node.** Ein Validator muss die PQC-Schlüsselregistrierung selbst durchführen – sie geschieht nicht automatisch –, bevor er eine Lizenz beantragt oder nutzt und bevor der Validator erstellt wird. Den CLI-Befehl findest du unter [Running a Validator](/developer-guide/running-a-validator#pqc-key-registration).
2. **Bestätige, dass du lizenziert bist.** Das Formular braucht eine Validator-Lizenz, die in deinem Konto als aktiv erfasst ist. Die **Chain** entscheidet, ob `create-validator` akzeptiert wird, und sie verlangt die Betreiber-Vergabe on-chain: Eine über **Buy License** gekaufte Lizenz wird auf unserer Seite erfasst, und die On-Chain-Vergabe ist ein separater, manueller Schritt, der danach folgt. Prüfe **Validator Readiness** (im Tab Validator Application), um zu sehen, was die Chain aktuell anerkennt. Falls du noch nicht lizenziert bist, verlinkt dieser Tab auf **Buy License** – Validator-Lizenzen erfordern zunächst eine genehmigte [Validator Application](#validator-application).
3. **Fülle das Registrierungsformular aus.** Gib deine Validatoradresse oder deinen Consensus-Pubkey, einen Moniker, einen Provisionssatz (innerhalb des durch deine Lizenz erlaubten Bereichs) und optional einen öffentlichen Endpunkt an. Falls deine Lizenzen netzwerkübergreifende Chains einschließen, wähle aus, welche davon dieser Validator bedienen soll.
4. **Bestätige die Self-Stake-Anforderung.** Die Self-Stake-Untergrenze für Validatoren beträgt fest 100,000 QOR – eine Konstante auf Protokollebene, keine anpassbare Einstellung –, unterliegt einer Unbonding-Frist, und Downtime oder Double-Signing werden mit Slashing geahndet. Bestätige dies und sende das Formular ab, um dich zu registrieren.
5. **Synchronisieren und den Validator erstellen.** Die Registrierung hier erfasst deinen Validator; du musst deinen Node dennoch selbst auf den aktuellen Chain-Stand bringen und `create-validator` selbst absenden, hybrid PQC-mitsigniert wie jede QoreChain-Transaktion – der Schlüssel aus Schritt 1 ist es, der diese Signatur gültig macht.
6. **Bestätigen und Stake binden.** Ein Zusammenfassungspanel zeigt die Registrierung (Moniker, Validatoradresse, Provision, Self-Stake-Absicht, netzwerkübergreifende Chains, Status) und fordert dich auf, deinen Self-Stake zu binden, um in das aktive Validator-Set aufgenommen zu werden. Das Binden selbst geschieht auf deinem Node mit der post-quanten-mitsignierten Transaktion, nicht im Dashboard.

Staking und Validator-Erstellung finden ausschließlich auf der nativen Transaktions-Lane von QoreChain statt – es gibt keinen Weg, einen Validator über eine verknüpfte EVM-Wallet wie MetaMask zu registrieren oder zu binden.

Siehe [Running a Validator](/developer-guide/running-a-validator) und [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Fordere einen von QoreChain betriebenen Rollup an. Über das Formular kannst du den Rollup benennen und die gewünschte virtuelle Maschine (EVM, CosmWasm oder SVM), Data-Availability-Schicht, das Gas-Token, das Sequencer-Modell und das Settlement-Ziel angeben. Das Absenden erfasst eine Bereitstellungsanfrage, die The Qore Trust prüft; es erstellt den Rollup nicht on-chain. Die Optionen sind breiter als das, was das On-Chain-Rollup-Modul derzeit unterstützt. Um einen Rollup selbst on-chain zu registrieren, siehe [Deploying a Rollup](/rollups/deploying-a-rollup); zu den Konzepten siehe [Rollups Overview](/rollups/overview).

## SDK

Ein Quickstart- und Referenz-Hub für das Bauen auf QoreChain im Code. Der Abschnitt zeigt Installationsschritte und kopierbereite Snippets zum Verbinden, Ableiten von Accounts über die drei Laufzeitumgebungen hinweg, Lesen des Zustands, Senden von Überweisungen und quantensicheren Signieren, dazu eine Tabelle der Sprachpakete sowie Links zum Repository, zu Beispielen und zum Explorer. Siehe [QoreChain SDK Overview](/sdk/overview) und [Install](/sdk/install).

## Validator Application {#validator-application}

Bewirb dich als Genesis Validator:

1. **Gib deine Unternehmensdaten ein.** Name der juristischen Person, Land/Rechtsraum und eine Kontakt-E-Mail-Adresse.
2. **Wähle die gewünschte Stufe.** Wähle aus dem Validator-Stufenkatalog (jede Stufe listet ihre Slot-Anzahl und ihren Funktionsumfang) – dies ist die Stufe, die du nach Genehmigung lizenzieren möchtest, noch kein Kauf.
3. **Beschreibe deine Infrastruktur.** Deine Infrastrukturregion sowie Details zu Hardware/Rechenzentrum.
4. **Erläutere deine Motivation.** Eine kurze Erklärung zur Validator-/Infrastrukturerfahrung deines Teams und dazu, warum du einen QoreChain Genesis Validator betreiben möchtest.
5. **Bestätige die Compliance-Anforderungen und sende ab.** Bestätige, dass eine KYC/AML-Prüfung der antragstellenden Entität und ihrer wirtschaftlich Berechtigten erforderlich ist, bevor eine Lizenz vergeben wird, und sende dann ab.
6. **Verfolge deinen Status.** Der Tab zeigt deine Bewerbung als in Prüfung, genehmigt oder nicht genehmigt mit Begründung an (mit der Möglichkeit zur Überarbeitung und erneuten Einreichung). Sobald deine Bewerbung anhängig oder genehmigt ist, prüft ein Live-Panel **Validator Readiness** drei Dinge direkt gegen die Chain, nicht gegen das, was du gekauft hast: deine PQC-Schlüsselregistrierung, deinen Self-Bond (fest 100,000 QOR – nur verfügbares Guthaben, Vesting-Mittel zählen nicht) und ob deine Betreiberlizenz tatsächlich on-chain vergeben wurde und derzeit gültig ist (nicht ausgesetzt und nicht abgelaufen – Lizenzen laufen bei einer Blockhöhe ab, und wenn die Chain-Spitze nicht gelesen werden kann, wird eine ablaufende Lizenz als *konnte nicht geprüft werden* statt als gültig gemeldet). Jede Prüfung meldet einen von drei Zuständen – erfüllt, noch nicht erfüllt oder *konnte nicht geprüft werden*, wenn die Chain nicht erreichbar ist – und ein fehlgeschlagener Lesevorgang wird nie als „du hast das nicht" angezeigt, da dies dich dazu verleiten würde, etwas erneut zu erledigen, das du bereits besitzt. Sobald deine Bewerbung genehmigt ist, kannst du mit **Buy License** fortfahren, um eine Validator-Lizenz zu erwerben.

Siehe [Running a Validator](/developer-guide/running-a-validator).

## Buy License

Erwirb die Lizenzen, die zum Betreiben der Netzwerkinfrastruktur erforderlich sind:

1. **Gib die zu lizenzierende Adresse ein.** Das Feld **QoreChain address** oben ist für jeden Kauf erforderlich: Gib die `qor1…`-Adresse ein, der die Lizenz on-chain zugeteilt werden soll. Verwende eine Adresse, die du kontrollierst und behalten wirst – die Vergabe ist an sie gebunden, und eine spätere Änderung erfordert den Support. Ohne sie kann keine Lizenz bestellt werden.
2. **Wähle ein Zahlungsnetzwerk.** Wähle unter **Pay with USDT on:** ERC-20, BEP-20 oder TRC-20.
3. **Wähle aus, was du kaufen möchtest.** Eine Light-Node-Lizenz steht jedem offen. Validator-Lizenzen (über den gesamten Stufenkatalog) werden erst freigeschaltet, sobald deine [Validator Application](#validator-application) genehmigt ist. Netzwerkübergreifende Add-ons erweitern eine Validator-Lizenz auf zusätzliche Chains, abgerechnet pro Chain und Jahr – wähle die gewünschten Chains aus und kaufe dann.
4. **Schließe die Zahlung ab.** Jeder Kauf führt dich in einen Zahlungsschritt, der Betrag und Netzwerk bestätigt und die Zahlung on-chain verifiziert, bevor die Lizenz als bezahlt erfasst wird.
5. **Warte auf die On-Chain-Vergabe und registriere dich dann.** Nach der Zahlung zeigt die Lizenz **Paid — awaiting on-chain grant**. Vergaben werden von Hand in Stapeln ausgestellt, sind also nicht sofort verfügbar. Der Status wechselt erst dann auf **Active**, wenn die Chain selbst die Vergabe bestätigt. Die Registrierung auf der Chain prüft die Chain, nicht unsere Aufzeichnungen; eine Registrierung vor Eintreffen der Vergabe wird daher verweigert. Sobald das Badge **Active** anzeigt, kehre zu **Light Node** oder **Node Registration** für die entsprechende Registrierung zurück.

:::note Lizenzen, die gekauft wurden, bevor die Adresse erforderlich war
Wenn du eine Lizenz gekauft hast, bevor die Adresse erfasst wurde, öffnet sich der Tab Buy License mit **This licence needs a QoreChain address** – gib die Adresse ein und wähle **Save address**. Solange sie nicht gespeichert ist, kann die Lizenz nicht vergeben werden.
:::

Dazu, wie die Lizenzierung netzwerkweit funktioniert, siehe [Chain Licensing](/architecture/chain-licensing).
