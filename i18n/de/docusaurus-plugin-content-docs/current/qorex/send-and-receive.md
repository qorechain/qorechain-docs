---
slug: /qorex/send-and-receive
title: Senden & Empfangen
sidebar_label: Senden & Empfangen
sidebar_position: 3
---

# Senden & Empfangen

Diese Seite behandelt das Senden und Empfangen von QOR, das Bezahlen eines @Handles, das Halten von Assets in anderen Netzwerken und die Extras auf dem Home-Bildschirm. Sie ist für alle gedacht, die die mobile QoreX-App nutzen (die Erweiterung hat dieselben Bildschirme zum Senden und Empfangen, siehe [Browser-Erweiterung](/qorex/browser-extension)).

Der Tab Home (Wallet) ist Ihr Ausgangspunkt. Er zeigt ein **Netzwerk-Badge** (standardmäßig MAINNET, oder TESTNET, wenn Sie den Entwickler-Schalter aktiviert haben), Ihr **Gesamtguthaben** (zum Ein-/Ausblenden antippen) und die Hauptaktionen: **Senden · Empfangen · Swap · Staken** (**Swap** wird unter iOS nicht angezeigt). Ihre Asset-Liste zeigt **QOR** (ein einheitliches Guthaben über die Native-, EVM- und SVM-Lanes hinweg, gesendet auf der hybrid-signierten Native-Lane) und **Alle Netzwerke** (eine einheitliche Ansicht über ETH, BNB, POL, ARB und die weiteren [externen Netzwerke](#external-networks-tokens), die QoreX unterstützt).

## QOR auf der hybrid-signierten Native-Lane senden

1. Tippen Sie auf **Senden**.
2. Geben Sie den Empfänger als `qor1…`-Adresse **oder** als **@Handle** ein. Ein Handle wird aufgelöst und kryptografisch verifiziert (Registry-Signatur + Besitzer-Signatur + Trust-on-First-Use-Pinning); sollte sich der Schlüssel eines Handles jemals stillschweigend ändern, zeigt QoreX eine ausdrückliche Warnung an.
3. Geben Sie den Betrag ein. Die Vorschau zeigt Empfänger, Betrag, die **Netzwerkgebühr** und den Signaturstatus (ob die Überweisung die ML-DSA-87-Ebene trägt).
4. Bestätigen Sie mit **biometrischer** Freigabe. Jede native QOR-Überweisung wird doppelt signiert: mit einem klassischen Schlüssel und mit ML-DSA-87 (FIPS 204). QoreX signiert mit dieser obligatorischen hybriden Signatur und überträgt auf der Native-Lane. Nach dem Broadcast prüft es, ob die bestätigte Transaktion die ML-DSA-87-Ebene trägt, und warnt Sie, wenn nicht.

Auf dem ersten Bildschirm können Sie im Schnellausfüll-Feld (**Ask QoreX**) eine einfache Anfrage wie „send 50 QOR to @maria“ eintippen, und das Formular wird für Sie ausgefüllt. Es ist ein einfacher Textleser, der **vollständig auf Ihrem Gerät** läuft - nichts, was Sie dort eintippen, wird irgendwohin gesendet, und es ist kein KI-Assistent (QoreX hat keinen). Sie prüfen weiterhin alles und bestätigen wie gewohnt per Biometrie; kann es nicht lesen, was Sie eingetippt haben, sagt es das, und Sie füllen das Formular von Hand aus. Letzte Empfänger erscheinen als Chips.

QoreChain registriert Ihren ML-DSA-87-Schlüssel nicht von selbst. QoreX erledigt das für Sie im Rahmen Ihrer **ersten** Überweisung (eine kleine einmalige Netzwerkgebühr), und den Status sehen Sie unter [Sicherheit & Wiederherstellung](/qorex/security-and-recovery#pqc-key). In QoreX ist kein separater Schritt nötig.

### Senden an ein @Handle, Schritt für Schritt {#handle-send}

1. Öffnen Sie **Senden** und geben Sie im Empfängerfeld statt einer Adresse `@` gefolgt vom Handle ein (zum Beispiel `@liviu`).
2. QoreX schlägt das Handle nach und zeigt Ihnen die **aufgelöste `qor1…`-Adresse**, bevor Sie irgendetwas bestätigen. (Das Beanspruchen Ihres eigenen Handles erfordert ein angemeldetes Konto und erfolgt in der App - siehe [@Handle](/qorex/account-and-dashboard#handle).)
3. Überprüfen Sie die aufgelöste Adresse, geben Sie den Betrag ein und bestätigen Sie wie gewohnt.

QoreX akzeptiert eine Auflösung nur, wenn sie **beide** durchgeführten Prüfungen besteht: eine Registry-Attestierung, die gegen einen in der App fest hinterlegten Trust-Key verifiziert wird, und die eigene Signatur des Handle-Besitzers über den Anspruch. Scheitert eine der beiden Prüfungen, wirft QoreX einen Fehler, statt auf eine unverifizierte Adresse zurückzufallen. Beim ersten Mal, dass Sie an ein bestimmtes Handle zahlen, merkt sich QoreX die aufgelöste Adresse; sollte sich die Adresse dieses Handles jemals ändern, stoppt QoreX vor dem Signieren und zeigt Ihnen die alte und die neue Adresse nebeneinander, damit Sie entscheiden können, ob Sie fortfahren möchten. Dieses Gedächtnis gilt **pro Gerät** - zahlen Sie erstmals an dasselbe Handle von einem anderen Telefon oder einer frischen Installation aus, erscheint es auch dort als neu, was erwartet ist und kein Fehler. Die Browser-Erweiterung löst Handles auf und bezahlt sie auf dieselbe Weise (ihr Gedächtnis gilt **pro Browser**, sodass ein anderer Browser oder Computer es als neu ansieht) - siehe [Senden an ein @Handle](/qorex/browser-extension#handle-send).

### Vesting-(gesperrtes) QOR senden {#vesting}

Wenn ein Teil Ihres Guthabens noch **vestet** - zum Beispiel eine noch nicht freigegebene TGE-Zuteilung -, wird Ihr Gesamtbetrag aufgeteilt in **jetzt verfügbar** und **noch gesperrt**. Sie können nur den verfügbaren Anteil senden; QoreX weist einen Überausgabe-Versuch selbst zurück, statt das Netzwerk diesen erst nach Abzug einer Gebühr ablehnen zu lassen. Der gesperrte Anteil wird schrittweise ausgabefähig, sobald der Vesting-Zeitplan ihn freigibt. Diese Aufteilung wird überall dort angezeigt, wo Ihr Guthaben erscheint - Home, Senden und Asset-Detail.

## Empfangen {#receive}

Tippen Sie auf **Empfangen**. Zuerst ist QoreChain ausgewählt - Ihre `qor1…`-Adresse (und Ihr @Handle, falls Sie eines haben) als QR-Code mit dem QoreChain-Icon, dazu **Kopieren** und **Teilen**. Alles, was dorthin gesendet wird, kommt auf der Native-Lane an, wo jede Überweisung eine klassische und eine ML-DSA-87-Signatur trägt.

Um auf einem anderen Netzwerk zu empfangen, verwenden Sie oben die **Netzwerk**-Auswahl: Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis und Celestia zeigen jeweils **ihre eigene Adresse** und die Warnung *„Send only \{coin\} or tokens on \{network\} to this address. Coins sent from another network can be lost.“* Alle EVM-Netzwerke teilen sich eine `0x…`-Adresse. Ihre EVM- und Solana-Adressen werden aus Ihrer Wiederherstellungsphrase abgeleitet, daher verlangt QoreX eine biometrische Bestätigung (**Show the address**), bevor es sie zeigt. Andere Netzwerke können keine ML-DSA-87-Signaturen tragen. Siehe [Externe Netzwerke](#external-networks-tokens).

In der Browser-Erweiterung hat **Empfangen** dieselbe Netzwerk-Auswahl.

## Coins und Tokens {#coins-and-tokens}

Ein Coin ohne Zeile hat keine Adresse, auf der er empfangen werden könnte. Um einen Coin oder Token im **Portfolio** zu sehen, *bevor* Sie welche halten, öffnen Sie Portfolio → **+ Coin or token** und schalten Sie ihn ein (in der Erweiterung: **Coins and tokens**). Ein auf null angepinnter Coin öffnet beim Antippen **Empfangen** auf seinem Netzwerk. Einstellungen → **Coins and networks** listet alles auf, was die Wallet heute halten kann.

**Token per Contract hinzufügen** (nur EVM-Netzwerke):

1. Portfolio → **+ Coin or token** → **Add a token by contract** (Erweiterung: **Coins and tokens** → *Add a token by contract*).
2. Wählen Sie das **Network**, fügen Sie die **Contract address (0x…)** ein und tippen Sie auf **Check contract**.
3. QoreX liest Symbol und Dezimalstellen aus dem Contract selbst und zeigt *„The contract says: \{symbol\} · \{decimals\} decimals“*. Jeder kann einen Token erstellen und ihm einen beliebigen Namen geben - QoreX bürgt nicht dafür, stellen Sie also sicher, dass es der gemeinte Contract ist.
4. Tippen Sie auf **Add \{symbol\}**. Er wird mit *Added by you* gekennzeichnet und kann wie die mitgelieferten Tokens gesendet werden. Entfernen Sie ihn jederzeit.

QoreX lehnt ab: einen Token, der bereits mitgeliefert wird, einen, den Sie schon hinzugefügt haben, ein Nicht-EVM-Netzwerk, eine ungültige Adresse, einen Contract, der nicht als Token antwortet, und einen Contract, der den Namen eines Tokens verwendet, den QoreX auf diesem Netzwerk bereits mitliefert (eine wahrscheinliche Kopie).

## Eine Zahlung anfordern

Tippen Sie auf **Request** (erfordert [Anmeldung](/qorex/account-and-dashboard#sign-in)), um eine Zahlungsanfrage - einen Betrag plus ein optionales Memo - als QR-Code oder Link zu erstellen. Wer sie scannt, sieht die vorausgefüllte Überweisung.

## Externe Netzwerke & Tokens {#external-networks-tokens}

Über **Alle Netzwerke** (oder Send-external) können Sie **ETH, BNB, POL, AVAX und SOL** nativ senden, außerdem ETH auf **Arbitrum, Base und OP Mainnet** sowie **ATOM, OSMO und TIA** auf Cosmos, dazu **ERC-20**-, **SPL**- und **IBC**-Tokens - USDC und USDT über die EVM-Chains und Solana hinweg, DAI auf Ethereum sowie Noble USDC über IBC - alle abgeleitet aus derselben Wiederherstellungsphrase (ETH verwendet `m/44'/60'`, SOL verwendet seinen Standardpfad, und SPL verwendet Associated Token Accounts).

:::caution Externe Chains sind ausschließlich klassisch
Andere Blockchains können keine ML-DSA-87-Signaturen tragen. Wenn Sie auf einem externen Netzwerk senden, weist QoreX ausdrücklich darauf hin (die Überweisung verwendet eine klassische Signatur, und die Signaturzeile kennzeichnet sie als klassisch). Ihr **QOR** bleibt auf der hybrid-signierten Native-Lane. Cosmos-basierte externe Sendungen unterstützen ein optionales Memo. Bei EVM-Netzwerken zeigt QoreX vor der Bestätigung außerdem die **maximale Netzwerkgebühr** an - „Network fee: at most \{fee\}. Check it before you confirm.“ - und signiert mit genau diesem Wert.
:::

## Swap

Der Tab **Swap** ist an QoreChains On-Chain-AMM angebunden, bleibt aber deaktiviert - die Schaltfläche zeigt **„Swap - coming with pool liquidity“** -, bis Liquidität und das Remote-Feature-Flag ihn aktivieren. Sobald das geschieht, leuchtet er automatisch auf; **es ist kein App-Update erforderlich**.

:::note iOS
Der Swap-Tab erscheint im App-Store-Build überhaupt nicht - Apple behandelt einen In-App-Token-Tausch als regulierten Dienst. Swap bleibt (sobald aktiviert) nur unter Android verfügbar. Die Browser-Erweiterung hat keinen Swap-Bildschirm.
:::

## Extras auf dem Home-Bildschirm {#home-extras}

- **Home-Bildschirm-Widget** (Android und iPhone) - fügen Sie **QoreX** über die Widget-Auswahl Ihres Telefons hinzu. Es zeigt Ihr QOR-Guthaben für das verwendete Konto, zeigt Punkte statt des Betrags, solange der Privatsphäre-Modus aktiv ist, aktualisiert sich etwa alle 30 Minuten selbst und öffnet beim Antippen die App. Das Widget stellt keine eigene Anfrage an QoreChain-Server: Die App übergibt ihm auf dem Gerät Ihre Adresse, Ihr Guthaben und Ihre Privatsphäre-Einstellung, und das Widget liest das Guthaben vom öffentlichen QoreChain-REST-Endpunkt (der nur Ihre öffentliche Adresse sieht). Jeder, der Ihren Home-Bildschirm sehen kann, kann das Widget sehen. Schalten Sie daher den Privatsphäre-Modus ein (Guthaben antippen), falls das eine Rolle spielt.
- **Push-Benachrichtigungen** (mobil, Mainnet) - die Glocke unter Home → **Notifications** hat einen Schalter **Push notifications**: *„Get a notification when QOR arrives, even with the app closed. Our server watches only your public addresses; Apple and Google see no amount or address.“* Der Benachrichtigungstext lautet nur „QOR received“. Push ist **ausgeschaltet, bis Sie es einschalten**. Ist es eingeschaltet, speichert der Server Ihr Geräte-Token und die öffentlichen `qor1…`-Adressen der verwendeten Wallet (bis zu 10); schalten Sie den Schalter aus, wird Ihr Gerät vom Server entfernt, und ein Gerät, von dem der Server 90 Tage lang nichts gehört hat, wird vergessen. Siehe [Was QoreX über das Netzwerk sendet](/qorex/overview#data-and-privacy). Sind Benachrichtigungen für QoreX in den Einstellungen Ihres Telefons ausgeschaltet, schalten Sie sie zuerst dort ein. Die Zustellung wurde unter Android Ende-zu-Ende getestet; unter dem iPhone behandeln Sie sie als Best-Effort und prüfen Sie weiterhin die Liste **Notifications** in der App.
- **Suche und Tour** - siehe [Orientierung](/qorex/getting-started#find-your-way).

## Nächste Schritte

- [Portfolio & Staking](/qorex/portfolio-and-staking) - sehen Sie Ihre Zuteilung und verdienen Sie Rewards.
- [Sicherheit & Wiederherstellung](/qorex/security-and-recovery) - schützen und stellen Sie Ihre Wallet wieder her.

## Grenzen und bekannte Probleme {#limits}

- Überweisungen in externen Netzwerken (EVM, Solana, Cosmos) sind ausschließlich klassisch. SVM- und EVM-Überweisungen werden nicht von der Hybrid-Signatur abgedeckt.
- Swap ist nicht verfügbar: Er ist abgeschaltet, bis Pool-Liquidität vorhanden ist, und wird unter iOS nicht angezeigt.
- Das Beanspruchen eines @Handles erfordert ein angemeldetes Konto und erfolgt in der mobilen App. Konten im Ethereum-Stil (Coin 60) haben kein Handle. Ist der Handle-Dienst nicht erreichbar, können Sie weiterhin per `qor1…`-Adresse bezahlen.
- Zahlungsanfragen erfordern eine Anmeldung und gibt es nur mobil.
- Push-Benachrichtigungen gibt es nur im Mainnet, und unter iPhone nur als Best Effort.
- Vesting-QOR kann keine Gebühren bezahlen; nur der verfügbare Anteil kann gesendet werden.
