---
slug: /dashboard/tools-hub
title: Tools Hub
sidebar_label: Tools Hub
sidebar_position: 11
---

# Tools Hub

Die Seite **Tools** versammelt das Betreiber- und Entwickler-Tooling von QoreChain an einem Ort, organisiert in Tabs. Von hier aus kannst du Infrastruktur registrieren, einen Rollup bereitstellen, das SDK erreichen, dich als Validator bewerben und die Lizenzen erwerben, die diese Rollen erfordern. Jeder Abschnitt wird im Folgenden zusammengefasst, samt Verweis auf die vollständige Dokumentation.

Verbinde deine Wallet, um die Tools zu nutzen, die Infrastruktur registrieren oder Bewerbungen einreichen – siehe [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

## Light Node

Einen Light Node zu betreiben und seinem Belohnungsprogramm beizutreten sind zwei verschiedene Dinge, und der Tab Light Node hält sie getrennt, anstatt einen einzigen Anmeldeprozess anzubieten:

1. **Bring deinen Node zum Laufen – funktioniert schon heute.** Keine Lizenz, keine On-Chain-Prüfung und keine Genehmigung nötig; dies wird unabhängig von deinem Lizenzstatus zuerst angezeigt. Es liest das aktuelle Netzwerk-Manifest aus und gibt dir kopierbereite Befehle, um die Binärdatei herunterzuladen und zu verifizieren, den Node mit dem Genesis-Datensatz zu initialisieren, ihn auf die Peers des Netzwerks auszurichten und per State-Sync statt ab Genesis zu synchronisieren.
2. **Prüfe deinen Status im Belohnungsprogramm.** Der Beitritt zur Belohnungsbeteiligung für Light Nodes ist ein separater, on-chain-gesteuerter Schritt: eine aktive, on-chain vergebene `lightnode_operator`-Lizenz, ein Mindestbetrag an delegiertem QOR – dein Gesamtbetrag über alle Validatoren, an die du delegierst, nicht pro Validator, live aus dem Staking gelesen – sowie eine kleine On-Chain-Registrierungsgebühr. **Die Anmeldung ist noch nicht geöffnet**, und der Kauf einer Lizenz öffnet sie nicht vorzeitig, es gibt also heute nichts, wofür man sich anmelden könnte; dieser Tab zeigt die Voraussetzung als zu prüfenden Status an, nicht als einzureichendes Formular, bis die Anmeldung geöffnet wird.
3. **Registriere dich, sobald deine Lizenz on-chain vergeben ist.** Eine über **Buy License** gekaufte Lizenz wird zunächst auf unserer Seite erfasst – die On-Chain-Vergabe ist ein separater Schritt, und die Registrierung wird verweigert, bis diese Vergabe eingetroffen ist (siehe Hinweis zu Buy License weiter unten). Sobald sie eingetroffen ist, ersetzt dieser Tab das Statuspanel durch ein Registrierungsformular: deine Betreiberadresse (`qor1…`), einen Moniker und eine öffentliche Endpunkt-URL, dazu die Bestätigung der Stake-Verpflichtung.
4. **Bestätigen und Stake binden.** Nach dem Absenden bestätigt ein Zusammenfassungspanel die Registrierung (Moniker, Betreiberadresse, Endpunkt, Stake-Absicht, Status) und fordert dich auf, den bestätigten Stake von deiner Betreiberadresse zu binden, sobald die Berechtigung eröffnet wird.

Für das vollständige Bild siehe [Light Node Overview](/light-node/overview) und [Registration & Licensing](/light-node/registration-and-licensing).

## Node Registration

Der Tab Node Registration registriert einen Validator-Node on-chain:

1. **Registriere zuerst deinen PQC-Schlüssel – über die CLI, auf deinem eigenen Validator-Node.** Das geschieht nicht automatisch wie bei der ersten Transaktion eines gewöhnlichen Accounts: Ein Validator muss die PQC-Schlüsselregistrierung selbst durchführen, bevor er eine Lizenz beantragt oder nutzt und bevor der Validator erstellt wird. Den CLI-Befehl findest du unter [Running a Validator](/developer-guide/running-a-validator#pqc-key-registration).
2. **Bestätige, dass du lizenziert bist.** Eine aktive Validator-Lizenz ist erforderlich, bevor du dich hier registrieren kannst. Eine über **Buy License** gekaufte Lizenz wird auf unserer Seite erfasst; die On-Chain-Vergabe ist ein separater Schritt, und die Registrierung wird verweigert, bis diese Vergabe eingetroffen ist. Falls du noch nicht lizenziert bist, verlinkt dieser Tab auf **Buy License** – Validator-Lizenzen erfordern zunächst eine genehmigte [Validator Application](#validator-application).
3. **Fülle das Registrierungsformular aus.** Gib deine Validatoradresse oder deinen Consensus-Pubkey, einen Moniker, einen Provisionssatz (innerhalb des durch deine Lizenz erlaubten Bereichs) und optional einen öffentlichen Endpunkt an. Falls deine Lizenzen netzwerkübergreifende Chains einschließen, wähle aus, welche davon dieser Validator bedienen soll.
4. **Bestätige die Self-Stake-Anforderung.** Die Self-Stake-Untergrenze für Validatoren beträgt fest 100.000 QOR – eine Konstante auf Protokollebene, keine anpassbare Einstellung –, unterliegt einer Unbonding-Frist, und Downtime oder Double-Signing werden mit Slashing geahndet. Bestätige dies und sende das Formular ab, um dich zu registrieren.
5. **Synchronisieren und den Validator erstellen.** Die Registrierung hier erfasst deinen Validator; du musst deinen Node dennoch selbst auf den aktuellen Chain-Stand bringen und `create-validator` selbst absenden, hybrid PQC-mitsigniert wie jede QoreChain-Transaktion – der Schlüssel aus Schritt 1 ist es, der diese Signatur gültig macht.
6. **Bestätigen und Stake binden.** Ein Zusammenfassungspanel zeigt die Registrierung (Moniker, Validatoradresse, Provision, Self-Stake-Absicht, netzwerkübergreifende Chains, Status) und fordert dich auf, deinen Self-Stake zu binden, um in das aktive Validator-Set aufgenommen zu werden.

Staking und Validator-Erstellung finden ausschließlich auf der nativen Transaktions-Lane von QoreChain statt – es gibt keinen Weg, einen Validator über eine verknüpfte EVM-Wallet wie MetaMask zu registrieren oder zu binden.

Siehe [Running a Validator](/developer-guide/running-a-validator) und [Staking & Validators](/dashboard/staking-and-validators).

## Rollups

Stelle deinen eigenen, von QoreChain betriebenen Rollup bereit. Über das Konfigurationsformular kannst du den Rollup benennen und seine virtuelle Maschine (EVM, CosmWasm oder SVM), die Data-Availability-Schicht, das Gas-Token, das Sequencer-Modell und das Settlement-Ziel auswählen. Nach dem Absenden wird der Rollup nach einer Prüfung bereitgestellt, bevor er live geht. Siehe [Rollups Overview](/rollups/overview) und [Deploying a Rollup](/rollups/deploying-a-rollup).

## SDK

Ein Quickstart- und Referenz-Hub für das Bauen auf QoreChain im Code. Der Abschnitt zeigt Installationsschritte und kopierbereite Snippets zum Verbinden, Ableiten von Accounts über die drei Laufzeitumgebungen hinweg, Lesen des Zustands, Senden von Überweisungen und quantensicheren Signieren, dazu eine Tabelle der Sprachpakete sowie Links zum Repository, zu Beispielen und zum Explorer. Siehe [QoreChain SDK Overview](/sdk/overview) und [Install](/sdk/install).

## Validator Application {#validator-application}

Bewirb dich als Genesis Validator:

1. **Gib deine Unternehmensdaten ein.** Name der juristischen Person, Land/Rechtsraum und eine Kontakt-E-Mail-Adresse.
2. **Wähle die gewünschte Stufe.** Wähle aus dem Validator-Stufenkatalog (jede Stufe listet ihre Slot-Anzahl und ihren Funktionsumfang) – dies ist die Stufe, die du nach Genehmigung lizenzieren möchtest, noch kein Kauf.
3. **Beschreibe deine Infrastruktur.** Deine Infrastrukturregion sowie Details zu Hardware/Rechenzentrum.
4. **Erläutere deine Motivation.** Eine kurze Erklärung zur Validator-/Infrastrukturerfahrung deines Teams und dazu, warum du einen QoreChain Genesis Validator betreiben möchtest.
5. **Bestätige die Compliance-Anforderungen und sende ab.** Bestätige, dass eine KYC/AML-Prüfung der antragstellenden Entität und ihrer wirtschaftlich Berechtigten erforderlich ist, bevor eine Lizenz vergeben wird, und sende dann ab.
6. **Verfolge deinen Status.** Der Tab zeigt deine Bewerbung als in Prüfung, genehmigt oder nicht genehmigt mit Begründung an (mit der Möglichkeit zur Überarbeitung und erneuten Einreichung). Sobald deine Bewerbung anhängig oder genehmigt ist, prüft ein Live-Panel **Validator Readiness** drei Dinge direkt gegen die Chain, nicht gegen das, was du gekauft hast: deine PQC-Schlüsselregistrierung, deinen Self-Bond (fest 100.000 QOR – nur verfügbares Guthaben, Vesting-Mittel zählen nicht) und ob deine Betreiberlizenz tatsächlich on-chain vergeben wurde. Jede Prüfung meldet einen von drei Zuständen – erfüllt, noch nicht erfüllt oder *konnte nicht geprüft werden*, wenn die Chain nicht erreichbar ist – und ein fehlgeschlagener Lesevorgang wird nie als „du hast das nicht" angezeigt, da dies dich dazu verleiten würde, etwas erneut zu erledigen, das du bereits besitzt. Sobald deine Bewerbung genehmigt ist, kannst du mit **Buy License** fortfahren, um eine Validator-Lizenz zu erwerben.

Siehe [Running a Validator](/developer-guide/running-a-validator).

## Buy License

Erwirb die Lizenzen, die zum Betreiben der Netzwerkinfrastruktur erforderlich sind:

1. **Gib die zu lizenzierende Adresse ein.** Gib die `qor1…`-Adresse an, der die Lizenz on-chain zugeteilt werden soll – verwende die Adresse, mit der du den Node tatsächlich betreiben wirst, denn genau diese prüft das Netzwerk.
2. **Wähle ein Zahlungsnetzwerk.** Wähle USDT auf ERC-20, BEP-20 oder TRC-20.
3. **Wähle aus, was du kaufen möchtest.** Eine Light-Node-Lizenz steht jedem offen. Validator-Lizenzen (über den gesamten Stufenkatalog) werden erst freigeschaltet, sobald deine [Validator Application](#validator-application) genehmigt ist. Netzwerkübergreifende Add-ons erweitern eine Validator-Lizenz auf zusätzliche Chains, abgerechnet pro Chain und Jahr – wähle die gewünschten Chains aus und kaufe dann.
4. **Schließe die Zahlung ab.** Jeder Kauf führt dich in einen Zahlungsschritt, der Betrag und Netzwerk bestätigt und die Zahlung on-chain verifiziert, bevor die Lizenz in unseren Aufzeichnungen als aktiv markiert wird.
5. **Warte auf die On-Chain-Vergabe und registriere dich dann.** Eine hier als aktiv angezeigte Lizenz wurde auf unserer Seite erfasst – die Vergabe, die sie on-chain anerkennt, ist ein separater Schritt. Die Registrierung prüft die Chain, nicht unsere Aufzeichnungen; eine Registrierung vor Eintreffen der Vergabe wird daher verweigert. Sobald die Vergabe bestätigt ist, kehre zu **Light Node** oder **Node Registration** zurück, um die entsprechende On-Chain-Registrierung abzuschließen.

Dazu, wie die Lizenzierung netzwerkweit funktioniert, siehe [Chain Licensing](/architecture/chain-licensing).
