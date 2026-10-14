---
slug: /user-guide/staking-and-delegation
title: Staking und Delegation
sidebar_label: Staking und Delegation
sidebar_position: 2
---

# Staking und Delegation

Dieser Leitfaden behandelt, wie du QOR-Token an Validatoren delegierst, zwischen Validatoren neu delegierst, dein Stake entbindest, Belohnungen einforderst und verstehst, welche Teile des Staking-Designs von QoreChain heute live sind.

:::note
Die nachstehenden Befehle verwenden das **`qorechain-diana`**-Testnet (EVM-Chain-ID **9800**). Das Mainnet (**`qorechain-vladi`**, EVM-Chain-ID **9801**) ist seit dem 29. Juni 2026 auf der v3.2-Linie live (Node-Release **v3.2.1**; das Testnet läuft mit **v3.2.2**) — ersetze für das Staking im Mainnet die Mainnet-Chain-ID und die Endpunkte von der Seite **Verbindung zum Mainnet**.
:::

:::caution Mit `tx pqc cosign` signieren
Mainnet und Testnet verlangen für jede Transaktion auf der Cosmos-Lane eine hybride Post-Quanten-Signatur, daher werden die Befehle auf dieser Seite so, wie sie dastehen, nicht gebroadcastet. Hänge `--generate-only > tx.json` an einen Befehl an und führe dann `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` aus. Siehe [Hybrides Signieren](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/portfolio-and-staking) und das [Dashboard](/dashboard/staking-and-validators) übernehmen dieses Signieren für dich.
:::

## Gibt es eine Sperrfrist? {#lock-in-period}

**Heute** nicht — es gibt keine Laufzeit auszuwählen, denn Staking wird hier nicht in festen Zeiträumen angeboten, wie es an einer Börse oft üblich ist. Die Delegation bleibt aktiv, wobei ab dem nächsten Block Belohnungen fließen, so lange du möchtest, bis du dich entscheidest, sie aufzuheben; nichts läuft ab und nichts muss verlängert werden. Die **21-tägige Entbindungsperiode**, auf die in diesem Leitfaden immer wieder verwiesen wird, ist keine Sperrfrist, der du im Voraus zustimmst — sie beginnt erst, wenn du *tatsächlich* die Entbindung beantragst, und betrifft nur das QOR, das du entnimmst. Eine Delegation zwischen Validatoren zu verschieben (Neudelegation) umgeht diese Wartezeit vollständig, da der Stake den gebundenen Pool nie verlässt. Der „Treue“-Begriff in der [Bonding-Curve](#bonding-curve) weiter unten ist Teil des Designs von QoreChain, wird aber **von der Live-Chain heute nicht angewendet**; wie lange du delegiert bleibst, ändert daher deine Belohnungsrate nicht.

Dies beschreibt das aktuelle Chain-Verhalten, keine dauerhafte Garantie — eine Mindest-Staking-Dauer ist ein Parameter, den die Governance in Zukunft einführen könnte, genau wie jeder andere Staking-Parameter auf dieser Seite per Abstimmung geändert werden kann. Sollte das jemals geschehen, zeigt die Wallet die daraus resultierende Wartezeit (jedes Minimum zuzüglich der 21-tägigen Entbindung) an, bevor du eine Delegation bestätigst, und diese Seite wird entsprechend aktualisiert.

---

## Token delegieren

Delegiere QOR an einen Validator, um an der Netzwerksicherheit mitzuwirken. Delegatoren erhalten einen Anteil der Belohnungen, die der Validator verdient, abzüglich der Provision des Validators:

```bash
qorechaind tx staking delegate <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Beispiel:** Delegiere 100 QOR an einen Validator:

```bash
qorechaind tx staking delegate qorvaloper1abc...xyz 100000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Neu delegieren

Verschiebe deine Delegation von einem Validator zu einem anderen, ohne die Entbindungsperiode abwarten zu müssen:

```bash
qorechaind tx staking redelegate <source_validator> <destination_validator> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Beispiel:**

```bash
qorechaind tx staking redelegate qorvaloper1src... qorvaloper1dst... 50000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Die Neudelegation ist **weder mit einer Strafe noch mit einer eigenen Sperre verbunden** — der Stake verlässt den gebundenen Pool nie, hört nie auf, Erträge zu erwirtschaften, und wird sofort wirksam. Sie unterliegt überhaupt nicht der 21-tägigen Entbindungsperiode; diese gilt ausschließlich für `unbond`. Eine Standard-Staking-Regel gilt: Stake, den du gerade **zu** einem Validator verschoben hast, kann **von** diesem Validator erst wieder neu delegiert werden, wenn die erste Verschiebung gereift ist (21 Tage); du kannst ihn in der Zwischenzeit weiterhin mit `unbond` entbinden oder deinen übrigen Stake neu delegieren.

:::caution Die eigentliche Grenze ist eine Anzahl, keine Abklingzeit
Ein Delegator kann höchstens **7 gleichzeitig laufende Neudelegations-Einträge** für exakt dieselbe Route (Delegator, Quell-Validator, Ziel-Validator) haben — jeder Eintrag löst sich mit seiner Fälligkeit von selbst auf und gibt so einen Slot frei. Dies ist eine Obergrenze, die bei normaler Nutzung praktisch nie erreicht wird, und keine allgemeine Regel im Sinne von „warte, bevor du erneut neu delegieren kannst“.
:::

---

## Entbinden

Ziehe deine delegierten Token von einem Validator zurück. Die Entbindung dauert **21 Tage**, während dieser Zeit verdienen die Token keine Belohnungen und können nicht übertragen werden.

```bash
qorechaind tx staking unbond <validator_address> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Beispiel:**

```bash
qorechaind tx staking unbond qorvaloper1abc...xyz 25000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Nach der 21-tägigen Entbindungsperiode (1.814.400 Sekunden) werden die Token automatisch an dein Konto zurückgegeben. Ein Delegator kann pro Validator höchstens 7 gleichzeitige Entbindungs-Einträge haben.

---

## Belohnungen einfordern

Hebe alle aufgelaufenen Staking-Belohnungen von jedem Validator ab, an den du delegiert hast:

```bash
qorechaind tx distribution withdraw-all-rewards \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

So hebst du Belohnungen nur von einem bestimmten Validator ab:

```bash
qorechaind tx distribution withdraw-rewards <validator_address> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Staking-Belohnungen werden aus zwei Quellen finanziert: dem gedeckelten Emissionsbudget des Protokolls (siehe [Tokenomics](/architecture/tokenomics#staking-reward-schedule) für die aktuelle Obergrenze, gültig seit einer Governance-Änderung vom 26. August 2026) und dem Staker-Anteil jeder Transaktionsgebühr (seit dem Upgrade v3.2.0 als normale Staking-Belohnung ausgezahlt; siehe [der gestrandete Staker-Anteil](/architecture/tokenomics#stranded-and-reserve)). Die Belohnungen hängen von der Provision des Validators und der Netzwerkaktivität ab und sind nicht garantiert.

---

## Triple-Pool-Klassifizierung (Design-Status)

Das Design von QoreChain umfasst ein **Triple-Pool**-Modell, das Validatoren basierend auf ihrer Reputation und ihren Delegationsniveaus in drei Pools einteilen würde, mit einem gewichteten Anteil an den Block-Belohnungen pro Pool:

| Pool                                 | Eintrittskriterien                                          | Belohnungsgewicht im Design |
| ------------------------------------ | ----------------------------------------------------------- | ------------- |
| **RPoS** (Reputation Proof of Stake) | Reputationswert >= 70. Perzentil **UND** Stake >= Median   | 40 %          |
| **DPoS** (Delegated Proof of Stake)  | Gesamtdelegation >= 10.000 QOR                              | 35 %          |
| **PoS** (Proof of Stake)             | Alle verbleibenden Validatoren                              | 25 %          |

:::note Auf den Live-Netzwerken nicht aktiv
Die Pool-Klassifizierung, die poolgewichtete Proposer-Auswahl und die Pool-Belohnungsgewichte sind im Modul `x/qca` implementiert, und ihre Parameter liegen on-chain (`qorechaind query qca config`), aber sie sind **noch nicht in die Blockproduktion oder die Belohnungsverteilung eingebunden**. Heute rotiert der Block-Vorschlag auf die übliche Weise nach Stake, und Belohnungen werden im Verhältnis zum gebundenen Stake verteilt, abzüglich der Provision jedes Validators. Zu welchem Pool ein Validator „gehört“, ändert nichts an dem, was du erhältst.
:::

---

## Bonding-Curve-Belohnungen {#bonding-curve}

Das Design von QoreChain definiert außerdem eine Bonding-Curve-Belohnungsformel:

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Beschreibung                                                          |
| -------- | -------------------------------------------------------------------- |
| `R`      | Belohnungsbetrag für den Zeitraum                                    |
| `beta`   | Basis-Belohnungsrate (Protokollparameter)                            |
| `S`      | Gestakter Betrag                                                     |
| `alpha`  | Loyalitätskoeffizient (Protokollparameter)                          |
| `L`      | Staking-Dauer in Epochen                                             |
| `Q(r)`   | Qualitätsmultiplikator, abgeleitet aus dem Reputationswert `r` des Validators |
| `P(t)`   | Pool-Multiplikator zum Zeitpunkt `t` (40 %, 35 % oder 25 % je nach Pool) |

:::note Auf den Live-Netzwerken nicht aktiv
Die Bonding-Curve-Berechnung wird, wie die oben beschriebene Pool-Klassifizierung, **von der Live-Chain nicht aufgerufen**: Belohnungen werden nicht mit dieser Formel berechnet, und weder die Staking-Dauer noch die Reputation des Validators ändern sie heute. Die Parameter (`bonding_alpha`, `bonding_beta`) existieren on-chain, haben aber keine Wirkung.
:::

---

## Slashing und Jailing

Slashing auf QoreChain folgt dem Standard-Slashing-Modul des Cosmos SDK mit diesen Live-Parametern (`qorechaind query slashing params`):

| Ereignis             | Regel                                                                | Folge                                        |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| Ausfallzeit (Downtime) | Weniger als 5 % der letzten 10.000 Blöcke signiert (etwa 8,9 Stunden bei den rund 3,2 Sekunden langen Blöcken des Mainnets) | 600 Sekunden gejailt; 1 % des Stakes geslasht |
| Doppelsignierung (Double-signing) | Zwei verschiedene Blöcke bei derselben Höhe signiert    | 5 % des Stakes geslasht                      |

Slashing gilt für den gesamten gebundenen Stake eines Validators, sodass Delegatoren ihren anteiligen Teil tragen. Es kann auch Stake treffen, der von einem geslashten Validator bereits entbunden wird, weshalb die Entbindungsperiode eine Sicherheitsmaßnahme und nicht nur eine Wartezeit ist.

---

## Validator-Informationen abfragen

Schlage Details zu einem beliebigen Validator nach:

```bash
qorechaind query staking validator <validator_operator_address>
```

**Beispiel:**

```bash
qorechaind query staking validator qorvaloper1abc...xyz
```

Liste alle aktiven Validatoren auf:

```bash
qorechaind query staking validators --status BOND_STATUS_BONDED
```

Frage deine aktuellen Delegationen ab:

```bash
qorechaind query staking delegations <delegator_address>
```

---

:::tip

* Sieh dir Provision, Verfügbarkeit und Erfolgsbilanz eines Validators an, bevor du delegierst; der Pool oder die Reputation eines Validators ändert derzeit nichts an den Belohnungen, die du erhältst.
* Die Neudelegation wird sofort wirksam, ohne Strafe und ohne Sperre. Die Grenzen sind die Obergrenze von 7 Einträgen für gleichzeitige Neudelegationen entlang exakt derselben Route und die Regel, dass frisch neu delegierter Stake erst vom Ziel-Validator weiterbewegt werden kann, wenn er gereift ist.
* Die 21-tägige Entbindungsperiode ist eine Sicherheitsmaßnahme. Während dieser Zeit können Slashing-Ereignisse deine Token weiterhin betreffen.

:::
