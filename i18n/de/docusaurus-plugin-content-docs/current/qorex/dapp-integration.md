---
slug: /qorex/dapp-integration
title: Eine dApp in QoreX integrieren
sidebar_label: dApp-Integration
sidebar_position: 8
---

# Eine dApp in QoreX integrieren

Dies ist der vollständige Leitfaden für Entwickler, deren Web-App mit der QoreX-Wallet arbeiten soll: wie man sie erkennt, sich verbindet, QoreChain-Transaktionen sendet, Nachrichten signiert, EVM und Solana nutzt, Ablehnungen behandelt und Links erzeugt, die QoreX öffnen. Er behandelt die QoreX-Browser-Erweiterung und den In-App-dApp-Browser der QoreX-App und sagt, wo sich die beiden unterscheiden. Die Codebeispiele wurden gegen den eigenen Code der Wallet geprüft.

## Innovationen {#innovations}

- **Die Seite hält nie den Post-Quanten-Schlüssel.** `signAndBroadcast` nimmt Ihre Nachrichten entgegen; QoreX zeigt sie dekodiert an, fügt die ML-DSA-87-Schicht hinzu, die nur die Wallet erzeugen kann, und überträgt. cosmjs, cosmos-kit und Interchain Kit funktionieren unverändert über `getOfflineSigner`, und QoreX fügt dieselbe Schicht hinzu, wenn die Transaktion keine hat.
- **Erkennung nach Fähigkeit, nicht nach Version.** `window.qorex.native.capabilities` listet auf, was ein Build kann, sodass ein Codepfad auf jedem Release funktioniert.
- **Nichts wird übernommen.** QoreX meldet sich mit EIP-6963 und dem Solana Wallet Standard, setzt nie `window.keplr` und überschreibt nie das `window.ethereum` einer anderen Wallet.
- **Nachrichtensignierung mit Post-Quanten-Hälfte.** `signArbitrary` signiert mit dem klassischen Schlüssel des Kontos (ADR-36) und mit ML-DSA-87. Ein Server prüft beide mit `@qorechain/qoresign` gegen den on-chain registrierten Schlüssel.
- **EVM auf QoreChain, dem Nutzer erklärt.** `personal_sign`, `eth_signTypedData_v4` und `eth_sendTransaction` werden auf dem Gerät dekodiert, simuliert, wo der Node es zulässt, und die Freigabe öffnet das Autorisierungsfenster je Transaktion, das die EVM-Lane von QoreChain benötigt.
- **Kein Blindsignieren und eine kurze Liste dessen, was eine Website nie verlangen kann.** Eine Nachricht, die QoreX nicht anzeigen kann, wird abgelehnt, und der Wallet vorbehaltene Nachrichten (Schlüsselverwaltung, Ausgabenregeln, Fenster, Grants) werden von jeder Website abgelehnt.
- **Links, die ein Dienst erzeugen kann.** Öffnen Sie eine Seite in der App, fordern Sie eine Zahlung an, die mit dem eigenen Schlüssel des Empfängers signiert ist, oder übergeben Sie einen Agentenvorschlag.

## Was QoreX injiziert {#injected}

Auf jeder Seite fügt QoreX ein Objekt hinzu, `window.qorex`, mit drei Providern:

| Provider | Was er ist |
|---|---|
| `window.qorex.native` | Die QoreChain-(Cosmos-)Lane. Im Keplr-Stil: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*` sowie eine `capabilities`-Liste. Er ist kein Drop-in-Ersatz für Keplr. |
| `window.qorex.evm` | Ein EIP-1193-Provider für die EVM-Lane von QoreChain (und in der Erweiterung Ethereum). Auch über EIP-6963 angekündigt. |
| `window.qorex.svm` | Ein Solana-Provider. In der Erweiterung finden Solana-dApps QoreX normalerweise stattdessen über den Wallet Standard. |

Was QoreX nicht tut:

- Es setzt nie `window.keplr`. Code, der nach Keplr sucht, findet QoreX nicht; erkennen Sie stattdessen `window.qorex`.
- Es überschreibt nie `window.ethereum`. Die Erweiterung setzt es gar nicht. Der In-App-Browser der App setzt `window.ethereum` nur, wenn keine andere Wallet es getan hat. Wählen Sie QoreX anhand seines EIP-6963-Namens, nicht anhand von `window.ethereum`.
- `signAmino` und `sendTx` existieren nicht (siehe [cosmjs](#cosmjs)).

## QoreX erkennen {#detection}

**EVM.** Lauschen Sie auf EIP-6963-Ankündigungen und wählen Sie die mit dem `rdns` `network.qore.qorex`:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**Native Lane von QoreChain.** Prüfen Sie auf `window.qorex?.native` und lesen Sie dessen Fähigkeiten. Prüfen Sie diese statt einer Versionsnummer:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Fähigkeit | Erweiterung | App |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (Methode ab 1.1.5 vorhanden) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (Verhalten ab 1.2.0) |
| `signArbitrary` | 0.4.0 | 1.2.1 (Methode ab 1.2.0 vorhanden) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | nicht in der App |

App 1.2.0 hat die Methoden, deklariert aber keine Fähigkeiten; um sie abzudecken, greifen Sie auf `typeof window.qorex?.native?.signArbitrary === "function"` zurück. `executeRequest` ist die Dashboard-Brücke, die nur für `dashboard.qorechain.io` funktioniert (siehe [Dashboard-Brücke](/qorex/browser-extension#dashboard-bridge)); andere Websites benötigen sie nicht. Die Builds 1.2.5 und 0.4.4 deklarieren dieselben Fähigkeiten wie zuvor.

**Erweiterung oder App.** Eine Seite kann nicht erfragen, mit welcher von beiden sie spricht, und sollte das auch nicht müssen. Die relevanten Unterschiede stehen in der folgenden Tabelle.

| | Erweiterung (Desktop) | App (In-App-dApp-Browser) |
|---|---|---|
| Native Lane von QoreChain | ja | ja |
| EVM-Signieren auf QoreChain | ja | ja |
| EVM auf Ethereum (`wallet_switchEthereumChain` zu `0x1`, je Website) | ja | nein, nur das aktive Netzwerk von QoreChain |
| EVM-Events (`connect`, `accountsChanged`, `chainChanged`) | alle drei | nur `connect`: Der Browser wird zum Wechsel von Konto oder Netzwerk geschlossen |
| Solana (Wallet Standard) | ja | nein, der In-App-Browser signiert keine Solana-Transaktionen |
| Dashboard-Brücke (`connectProof`, `executeRequest`) | ja, nur `dashboard.qorechain.io` | nein |
| Eine Seite aus einem Link öffnen | nicht zutreffend | `browse`-Links (siehe [Links](#links)) |

Die Nutzerseite beider finden Sie unter [Browser-Erweiterung](/qorex/browser-extension) und [dApp-Browser](/qorex/dapp-browser).

## Verbinden {#connect}

Das Verbinden benötigt eine Freigabe je Website, die nur die öffentliche Adresse preisgibt:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts` liefert eine leere Liste, bis der Nutzer die Website genehmigt hat, und öffnet nie selbst ein Fenster. `enable` und `eth_requestAccounts` öffnen die Wallet, wenn sie gesperrt ist (siehe [Gesperrte Wallet](#locked)).

Die Erweiterung löst ein Fenster-Event aus, `qorex_keystorechange`, wenn sich Konto, Wallet oder Netzwerk ändert. Freigaben werden je Wallet gespeichert, und der Nutzer kann eine Website jederzeit unter **Verbundene Websites** widerrufen.

## Eine QoreChain-Transaktion senden: `signAndBroadcast` {#sign-and-broadcast}

Jede QoreChain-Transaktion eines Kontos mit registriertem Post-Quanten-Schlüssel muss eine hybride Signatur tragen: secp256k1 **und** ML-DSA-87. Nur die Wallet hält den ML-DSA-Schlüssel, daher kann eine Seite diese Signatur nicht selbst erzeugen. Senden Sie die Nachrichten, und QoreX erledigt den Rest:

1. zeigt dem Nutzer die dekodierten Nachrichten und die Gebühr,
2. baut die Transaktion für das vom Nutzer gewählte Konto,
3. fügt die hybride Signatur hinzu (und registriert zuvor den Post-Quanten-Schlüssel des Kontos, falls dies seine erste Transaktion ist),
4. überträgt und liefert das Ergebnis.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield` sagt Ihnen, ob die ausgeführte Transaktion die hybride Schicht trägt: `shielded`, wenn ja, `downgraded`, wenn sie ohne sie ausgeführt wurde (melden Sie diesen Fall), und sonst `pending` oder `classical`.

**Regeln**

- `chainId` muss dem aktiven Netzwerk der Wallet entsprechen: `qorechain-vladi` (Mainnet) oder `qorechain-diana`, wenn der Nutzer zum Testnet gewechselt hat. Eine Abweichung wird mit einer Meldung abgelehnt, die beide nennt. **Eine dApp kann das Netzwerk nicht wechseln** (siehe [Testnet](#testnet)).
- 1 bis 32 Nachrichten pro Aufruf. Die Nachrichten-Bytes werden genau so signiert, wie Sie sie senden; die Wallet kodiert sie nicht neu.
- Ein Memo von höchstens 256 Bytes wird auf dem Freigabefenster angezeigt; Zeilenumbrüche und Steuerzeichen darin werden als ihre Codes angezeigt.
- Der Wallet vorbehaltene Nachrichten werden abgelehnt (siehe [Nachrichten, die eine Website nie anfordern kann](#wallet-only)).
- QoreX signiert keine Nachricht, die es nicht anzeigen kann. Eine solche Anfrage wird mit `QoreX cannot show what <type> does, so it will not sign it` abgelehnt, auch innerhalb von `MsgExec`. Verwenden Sie einen Nachrichtentyp, den QoreX dekodieren kann.

**Gas und Gebühr**

- Die Gebühr ist `gasLimit` mal Gaspreis des Netzwerks (QoreX folgt dem aktuellen Minimum des Netzwerks) und wird vor der Freigabe durch den Nutzer angezeigt.
- Ihr `gasLimit` wird auf 100.000 bis 5.000.000 begrenzt; ohne Wert sind es 400.000.
- Eine Transaktion, die CosmWasm- oder Cross-VM-Code ausführt, wird zuerst, vor der Freigabe, simuliert. QoreX verlangt mindestens das 1,3-Fache des simulierten Gases, bis zu 20.000.000, und ein höherer Wert Ihrer Seite wird beibehalten. Ein Aufruf, den der Vertrag ablehnen würde, wird vor der Freigabe mit der Begründung der Chain abgelehnt. Braucht der Aufruf mehr als 20.000.000, sagt QoreX das und lehnt ab.
- Eine Transaktion darf das Gaslimit je Transaktion des Netzwerks nicht überschreiten; QoreX lehnt eine darüber liegende ab, bevor etwas signiert wird.

Eine Ablehnung durch den Nutzer wirft `QoreX: signature rejected` mit Code `4001`.

## cosmjs, cosmos-kit und Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` und `getOfflineSignerAuto(chainId)` liefern einen cosmjs-`OfflineDirectSigner`, sodass `SigningStargateClient` unverändert funktioniert:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**Die von der Wallet hinzugefügte Post-Quanten-Schicht.** Trägt die Transaktion keine ML-DSA-Schicht (die eine Seite nicht erzeugen kann), fügt QoreX sie hinzu: Es simuliert die Kosten der Schicht, erhöht Gas und Gebühr in der Transaktion, signiert mit ML-DSA-87 über den Body und die erhöhten Gebührenangaben und zeigt dem Nutzer die endgültige Gebühr, bevor er freigibt. Ihre `"auto"`-Gebühr kommt daher um die Kosten der Schicht höher zurück, Zehntausende Gas. Übertragen Sie immer das zurückgegebene Dokument `signed`, nicht das gesendete. Prüfen Sie `capabilities.includes("signDirectAddsPqcLayer")`, bevor Sie sich darauf verlassen.

- Der Post-Quanten-Schlüssel des Kontos muss bereits registriert sein; er wird mit seiner ersten Transaktion aus QoreX registriert. Andernfalls schlägt der Aufruf mit Code `4100` und Grund `pqc-key-missing` fehl. Lassen Sie den Nutzer zuerst eine Transaktion aus QoreX senden oder verwenden Sie `signAndBroadcast`, das den Schlüssel selbst registriert.
- **Amino wird abgelehnt.** `signAmino` und `getOfflineSignerOnlyAmino().signAmino` werden mit Code `4200` und Grund `amino-unsupported` abgelehnt, weil Amino-JSON die hybride Signatur nicht tragen kann. Konfigurieren Sie Ihre Bibliothek für Direct-Signing.
- Aus MetaMask importierte Konten (Coin 60) signieren über `signAndBroadcast`; die Erweiterung lehnt für sie `signDirect` und damit die cosmjs-Signierer ab.
- `getKey` und `getAccounts` liefern das aktive Konto.

In einer Web-App kapseln der [Wallet-Adapter](/developer-tools/wallet-adapter) und die Pakete der [QoreX-Integrationen](/developer-tools/qorex-integrations) (RainbowKit, Interchain Kit, cosmos-kit) diese Erkennung und diese Aufrufe für Sie.

## `signDirect` {#sign-direct}

`signDirect` signiert ein von Ihrer Seite gebautes `SignDoc`. Trägt der Body bereits eine ML-DSA-Schicht, prüft QoreX sie wie die Chain gegen den registrierten Schlüssel des Kontos, bevor ein Fenster geöffnet wird. Trägt er keine, fügt QoreX sie wie oben beschrieben hinzu. Eine Schicht, die nicht zum registrierten Schlüssel passt, eine der Wallet vorbehaltene Nachricht, eine Nachricht, die QoreX nicht anzeigen kann, oder mehr als 1.000 Nachrichten werden abgelehnt, bevor eine Freigabe geöffnet wird. Für neuen Code ist `signAndBroadcast` einfacher.

## Eine Nachricht signieren: `signArbitrary` und `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

Die Signatur folgt [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1): ADR-36 mit dem klassischen Schlüssel des Kontos (secp256k1 oder eth_secp256k1 bei einem Coin-60-Konto) plus ML-DSA-87 über `"qorechain-msg-v1|" + chainId + "|" + data`. Sie trägt außerdem Keplrs Felder `pub_key` und `signature`, sodass für Keplr geschriebener Code sie lesen kann. Der Nutzer sieht die ganze Nachricht. Eine Nachricht muss 1 bis 4096 Bytes lang sein und darf nicht mit einer anderen QoreChain-Signierdomain beginnen.

**Prüfen Sie auf Ihrem Server, nie auf der Seite.** Die ML-DSA-Hälfte muss gegen den on-chain für diese Adresse registrierten Schlüssel geprüft werden, nie gegen einen vom Client gesendeten Schlüssel. Verwenden Sie [`@qorechain/qoresign`](/qoresign/overview):

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain` ruft den registrierten ML-DSA-87-Schlüssel des Signierers ab und wirft einen `QoreSignError`, wenn etwas nicht verifiziert werden kann. Ein Konto, das in diesem Netzwerk noch nie eine Transaktion gesendet hat, hat noch keinen registrierten Schlüssel und schlägt mit `KEY_NOT_REGISTERED` fehl: Bitten Sie den Nutzer, zuerst eine Transaktion aus QoreX zu senden. Setzen Sie eine einmalige Nonce und Ihre Domain in die Nachricht und prüfen Sie beide auf dem Server, damit eine Signatur nicht auf einer anderen Website wiederverwendet werden kann. Die QoreSign-Leitfäden behandeln Anmeldenachrichten ausführlicher.

## EVM-dApps {#evm}

QoreX antwortet über EIP-6963 und signiert über seinen EIP-1193-Provider `personal_sign`, `eth_signTypedData_v4` und `eth_sendTransaction` auf der EVM-Lane von QoreChain (Chain-ID **9801**, Testnet **9800**). In der Erweiterung signiert es auch auf Ethereum, nachdem die Website `wallet_switchEthereumChain` zu `0x1` aufgerufen hat (je Website). Nur lesende Methoden (`eth_call`, `eth_getBalance`, `eth_getLogs` und die anderen Standard-Lesezugriffe) gehen an den Node des gewählten Netzwerks. Jede andere Methode antwortet mit `4200`, und `wallet_switchEthereumChain` oder `wallet_addEthereumChain` zu etwas anderem als einer Chain, für die QoreX signiert, antwortet mit `4902`. Eine Website kann nicht zum anderen QoreChain-Netzwerk wechseln: Das antwortet mit `4100` und `switch the network in QoreX itself`.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Was die Freigabe dekodiert.** Jedes Fenster sagt, auf dem Gerät dekodiert, was autorisiert wird: Überweisungen, Token-Freigaben (eine unbegrenzte zeigt UNLIMITED), `setApprovalForAll`, Permit- und Permit2-Signaturen und Safe-Transaktionen (ein DELEGATECALL ist als hochriskant markiert). Ein Aufruf, den QoreX nicht dekodieren kann, wird als unbekannt und hochriskant angezeigt und braucht ein zweites Tippen. EIP-7702-Delegationen werden abgelehnt.

**Simulation.** Vor dem Signieren zeigt das Fenster, was die Transaktion am Guthaben des Nutzers ändert.

- Mit `eth_simulateV1` (Transfer-Tracing) auf dem Node zeigt es die Änderungen in QOR und Token.
- Auf einem Node ohne `eth_simulateV1`, was heute bei den EVM-Nodes von QoreChain der Fall ist, steht nur `eth_call` zur Verfügung, und das sagt, ob der Aufruf zurückgesetzt würde (revert). Ein Aufruf mit Daten zeigt dann „what it does to your tokens was not checked“, und der Nutzer braucht zum Freigeben ein zweites Tippen.
- Auch eine Transaktion, die fehlschlagen würde oder die der Node nicht simulieren kann, braucht ein zweites Tippen.
- Die Simulation geht an denselben Node, der die Transaktion erhalten würde; sonst wird nichts irgendwohin gesendet.

Gestalten Sie die Seite so, dass dieses zweite Tippen keine Überraschung ist: Erklären Sie auch in Ihrer eigenen Oberfläche, was der Aufruf tut.

**Das EVM-Autorisierungsfenster je Transaktion.** Auf QoreChain wird eine EVM-Transaktion nur innerhalb eines Autorisierungsfensters zugelassen, das mit der hybriden ML-DSA-87-Signatur des Kontos auf der nativen Lane geöffnet wurde. Deckt keines die Transaktion ab, öffnet dieselbe Freigabe eines für genau diese Transaktion:

- mit dem Wert plus der maximalen Gebühr als Limit,
- etwa zehn Minuten,
- auf die von der Transaktion aufgerufenen Verträge beschränkt, soweit das Netzwerk das unterstützt.

Die Freigabe nennt jeden Vertrag, den das Fenster zulassen würde (einschließlich Verträgen, die kürzlich eine Signatur für dieselbe Website geprüft haben), und sagt, dass es jedes offene Fenster des Nutzers ersetzt. Kann das Netzwerk ein Fenster nicht auf Verträge beschränken, fragt QoreX ein zweites Mal, nennt die Verträge und sagt, dass das Fenster jeden Vertrag zulassen würde, bevor es ein unbeschränktes öffnet; bei „Nein“ wird nichts gesendet. Das QOR-Limit deckt alle QOR ab, die das Konto verlassen, einschließlich der maximalen Gebühr, und ein Vertrag, dessen Aufruf das Fenster dem Nutzer erlaubt, kann weiterhin für das Konto handeln (Token, die er hält oder freigegeben hat, oder QOR, die andere Verträge halten). Siehe [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window).

**Ein vom Nutzer selbst geöffnetes Fenster.** Ein Fenster, das der Nutzer auf dem Fenster-Bildschirm öffnet, ist standardmäßig auf **Nur QOR-Überweisungen** gesetzt; jeden Vertrag zuzulassen ist eine eigene Wahl mit Warnung. Ein früher vom Nutzer geöffnetes Fenster deckt daher keinen Token- oder Vertragsaufruf ab. Eine dApp, die ein vorhandenes Fenster erwartet, sollte QoreX entweder das Fenster je Transaktion öffnen lassen (der einfachste und engste Weg) oder dem Nutzer sagen, **Jeder Vertrag** zu wählen, wenn er selbst eines öffnet.

**Weitere Regeln dieser Lane**

- Nur aus MetaMask importierte Konten (Coin-Typ 60) können auf der EVM-Lane von QoreChain senden. Ein anderes Konto antwortet mit `4100`, und die Meldung nennt dem Nutzer die nächsten Schritte.
- Die Precompiles für Staking, Distribution, Governance, Vesting, Bank und IBC werden abgelehnt (`4200`): Auf QoreChain laufen diese über die native Lane.
- Signaturen auf der EVM-Lane sind klassisch (secp256k1). QoreX behauptet nicht mehr.
- Typisierte Daten für eine andere als die gewählte Chain werden mit `-32602` abgelehnt.

## Solana-dApps (Erweiterung) {#solana}

Die Erweiterung registriert sich mit dem Solana Wallet Standard auf dem Solana-Mainnet (`solana:mainnet`), sodass Solana-dApps sie ohne eigenen Code finden. Funktionen: connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` und `solana:signAndSendTransaction`, für Legacy- und v0-Transaktionen. `connect({ silent: true })` wird unterstützt.

Die Freigabe dekodiert System-Überweisungen, SPL-Token- und Token-2022-Überweisungen, Freigaben, Befugnisänderungen und Kontoschließungen und zeigt den Text eines Memos. Eine Anweisung, die QoreX nicht dekodieren kann, wird auf dem Fenster als unlesbar markiert, und die Freigabe braucht ein zweites Tippen. Eine Transaktion, die die Wallet nicht als Signierer aufführt, wird abgelehnt, und `signMessage` signiert keine Bytes, die eigentlich eine Transaktion sind. Signaturen sind klassisch und als solche gekennzeichnet.

Der In-App-Browser der App signiert keine Solana-Transaktionen. Solana auf QoreChain selbst ist eine eigene Funktion in der Wallet, nur im Testnet: siehe [Funktionen nur im Testnet](/qorex/testnet-features).

## Wenn die Wallet gesperrt ist {#locked}

Ab Erweiterung 0.4.4 und Safari 1.8.2 öffnet eine Signaturanfrage, die gestellt wird, während QoreX gesperrt ist (nativ, EVM oder Solana), die Wallet auf dem Passwortbildschirm und nennt die Website. Nach dem Entsperren durch den Nutzer schließt sich das Fenster, und die Anfrage zeigt ihre eigene Freigabe. Schließt der Nutzer stattdessen das Fenster, wird die Anfrage mit Code `4001` abgelehnt. Zuvor schlug eine solche Anfrage sofort mit „wallet is locked“ fehl.

- `enable`, `getKey`, `eth_requestAccounts` und die Signiermethoden wecken die Wallet auf diese Weise.
- Lesezugriffe, die eine Seite beim Laden ausführt (`eth_accounts`, `eth_chainId`, Chain-Lesezugriffe), öffnen nie ein Fenster: `eth_accounts` liefert einfach eine leere Liste.
- Ohne Passwort wird nichts signiert, und eine wartende Anfrage wird mit „Nein“ beantwortet, wenn der Nutzer die Wallet wechselt oder erneut sperrt.

Behandeln Sie `4001` als normales Ergebnis, nicht als Fehler.

## Nachrichten, die eine Website nie anfordern kann {#wallet-only}

QoreX lehnt diese von jeder Website auf jedem Weg ab (`signAndBroadcast`, `signDirect`, ein Agentenvorschlag), weil sie dauerhafte Befugnis über das Konto übertragen. Der Nutzer erledigt sie in den eigenen Bildschirmen von QoreX:

- Verwaltung des Post-Quanten-Schlüssels: einen Schlüssel registrieren, migrieren und rotieren, den Verschlüsselungsschlüssel und die Registrierung eines PQC-Multisig;
- Authenticators und Ausgabenregeln: einen Signierschlüssel registrieren oder widerrufen, Ausgabenregeln, das Erstellen eines abstrakten Kontos;
- EVM-Fenster öffnen, schließen und löschen (und die Zustimmung zur Delegation);
- Solana-on-QoreChain-Fenster öffnen und schließen sowie die Solana-Relay-Nachricht;
- ein authz-Grant (`MsgGrant`) von `MsgGrant` oder `MsgExec`, weil ein solcher Grant den Berechtigten als das Konto handeln ließe.

Die Ablehnung gilt direkt, innerhalb von `MsgExec` in beliebiger Tiefe und als generischer Grant einer dieser Nachrichten. Der Fehler lautet `QoreX: <type> is managed by the wallet itself, not by a website`.

## Fehler und Events {#errors}

Fehler tragen einen EIP-1193-`code`:

| Code | Bedeutung |
|---|---|
| `4001` | Der Nutzer hat abgelehnt oder das Fenster geschlossen (einschließlich des Entsperrfensters). |
| `4100` | Nicht autorisiert: unbekanntes Konto, kein registrierter Post-Quanten-Schlüssel (`reason: pqc-key-missing`), ein Coin-118-Konto auf der EVM-Lane oder eine Anfrage zum Netzwerkwechsel. |
| `4200` | Nicht unterstützt: Amino (`reason: amino-unsupported`), eine EVM-Methode, die QoreX nicht signiert, eine EIP-7702-Delegation, ein nur nativ nutzbares Precompile. |
| `4901` | Falsche Solana-Chain. |
| `4902` | Unbekannte Chain. |
| `-32602` | Ungültige Parameter (zum Beispiel typisierte Daten für eine andere Chain). |

Events:

- EVM-Provider: `connect`, `accountsChanged` und `chainChanged` in der Erweiterung; in der App nur `connect`.
- Native Lane (Erweiterung): das Fenster-Event `qorex_keystorechange`, wenn sich Konto, Wallet oder Netzwerk ändert. cosmos-kit hört darauf.
- Solana Wallet Standard: `change`.

## Links, die ein Dienst erzeugen kann {#links}

Drei Links öffnen QoreX von einer anderen Seite oder App aus.

### Eine Seite in der App öffnen: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

Auf einem Telefon öffnet der Link Ihre Seite nach der üblichen biometrischen Abfrage im dApp-Browser von QoreX. Die Seite muss `https://` auf einem Domainnamen sein. QoreX lehnt den Link ab, wenn die Seite Folgendes hat:

- einen Port,
- einen Benutzernamen oder ein Passwort,
- eine IP-Adresse,
- `localhost`,
- einen Backslash oder Leerzeichen,
- mehr als 2048 Zeichen.

Der Link gibt der Seite nichts. Sie muss weiterhin um eine Verbindung bitten, und jede Signatur läuft weiterhin über das Freigabefenster. Ist keine Wallet auf dem Telefon, bleibt die App beim Onboarding. Ist QoreX nicht installiert, zeigt die https-Form eine Seite mit einem Link zum Herunterladen. Die Erweiterung hat keinen `browse`-Link.

### Eine Zahlung anfordern: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Ein Zahlungsanforderungs-Link trägt den Empfänger, den Betrag in Basiseinheiten, die Denomination, eine Anforderungs-ID und ihr Memo-Tag, eine optionale Notiz und ein @handle, das Netzwerk und eine Signatur des eigenen Kontoschlüssels des Empfängers über all das. Das QoreX des Zahlenden prüft die Signatur, dass der signierende Schlüssel die Empfängeradresse besitzt, das genaue Netzwerk und ein eventuelles @handle und zeigt dann vor dem Senden die normale Prüfansicht. Ein veränderter Betrag oder Empfänger wird erkannt, und die Anforderung wird durch Lesen der Chain als bezahlt markiert.

**Erzeugen Sie ihn mit dem eigenen Anforderungsbildschirm von QoreX** (App, **Zahlungsanforderungen**, **Neue Anforderung**) statt von Hand: Die Signatur entsteht mit dem Kontoschlüssel, den eine Seite nie besitzt. Betrachten Sie einen selbst gebauten oder veränderten Link als nicht unterstützt. Eine Web-Form des Links ist noch nicht verfügbar.

### Einen Agentenvorschlag übergeben: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Nur in der App. Der Link trägt eine Transaktion, die ein KI-Agent vorschlägt; QoreX validiert sie, simuliert sie und zeigt sie im normalen Freigabefenster. Ein Vorschlag wird nie unverändert signiert, und ein Link kann höchstens 64 KB tragen. Siehe unten das [KI-Agenten-Modell](#agents).

## KI-Agenten {#agents}

Wenn Sie einen KI-Agenten bauen, der mit einer Wallet arbeitet, lautet das Modell: Ein Agent kann lesen, was der Nutzer erlaubt, und eine Transaktion **vorschlagen**; er signiert nie. QoreX prüft und simuliert jeden Vorschlag, und der Nutzer genehmigt oder lehnt ihn in demselben Freigabefenster ab, das eine dApp-Anfrage verwendet. Ein Vorschlag mit einer der Wallet vorbehaltenen Nachricht wird abgelehnt, bevor ein Fenster geöffnet wird. In der Erweiterung erreicht ein Agent QoreX über ein noch nicht veröffentlichtes Begleitprogramm auf dem Computer des Nutzers; in der App wird ein Vorschlag eingefügt oder kommt als `qorex://propose`-Link an. Wie der Nutzer dies einschaltet und was er sieht, lesen Sie unter [Entwicklermodus: KI-Agenten](/qorex/developer-mode#ai-agents).

## Testnet {#testnet}

**Eine dApp kann das Netzwerk nicht wechseln.** Die `chainId` einer Anfrage muss zum Netzwerk der Wallet passen; eine Abweichung wird abgelehnt. Das schützt den Nutzer vor einer Seite, die ihn in ein Netzwerk bringen würde, in dem Mittel gleich aussehen, es aber nicht sind.

Um das Testnet (`qorechain-diana`, EVM-Chain-ID 9800) zu nutzen, wechselt der Nutzer es in QoreX:

- **App:** Einstellungen, dann **Testnet verwenden (Entwickler)**.
- **Erweiterung:** Entwicklermodus einschalten (siebenmal auf die Versionsnummer unten im Popup tippen), dann **Zum Testnet (diana) wechseln**. **Zurück zum Mainnet** kehrt zum Standard zurück.

Auf jedem Bildschirm erscheint dann ein TESTNET-Banner, Testnet-Guthaben zeigen keinen USD-Wert, und das Netzwerk wird ohne Neustart neu gebunden. Sagen Sie Ihren Nutzern, dass sie vor dem Öffnen Ihrer Testnet-Seite wechseln sollen. Die Wallet-Funktionen, die es nur im Testnet gibt (IBC, der QoreChain-Bridge-Bildschirm, Solana auf QoreChain), sind unter [Funktionen nur im Testnet](/qorex/testnet-features) beschrieben.

## Fehlerbehebung {#troubleshooting}

| Was Sie sehen | Warum und was zu tun ist |
|---|---|
| `window.keplr` ist undefined | Beabsichtigt. Verwenden Sie `window.qorex.native` oder eine Bibliothek mit QoreX-Connector. |
| `window.ethereum` ist nicht QoreX | Beabsichtigt. Wählen Sie die Wallet über EIP-6963 (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | Der Nutzer ist im anderen Netzwerk. Bitten Sie ihn, in QoreX zu wechseln; Sie können es nicht. |
| `4100`, `pqc-key-missing` | Das Konto hat im Netzwerk noch keinen Post-Quanten-Schlüssel. Bitten Sie den Nutzer, eine Transaktion aus QoreX zu senden, oder verwenden Sie `signAndBroadcast`. |
| `4200`, `amino-unsupported` | Ihre Bibliothek verlangt Amino. Konfigurieren Sie Direct-Signing. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Eine der Wallet vorbehaltene Nachricht. Entfernen Sie sie; der Nutzer erledigt das in QoreX. |
| `QoreX cannot show what <type> does, so it will not sign it` | Eine Nachricht, die QoreX nicht dekodieren kann. Verwenden Sie einen Typ, den es anzeigen kann. |
| `QoreX: send between 1 and 32 messages` | Teilen Sie die Anfrage auf. |
| `QoreX: the memo may be at most 256 bytes` | Kürzen Sie das Memo. |
| `QoreX: a message must be 1 to 4096 bytes` | Kürzen Sie die Nachricht, die signiert werden soll. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | Der Vertragsaufruf ist zu schwer für eine Transaktion. Teilen Sie ihn auf. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX signiert nur `personal_sign`, `eth_signTypedData_v4` und `eth_sendTransaction`. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | Nur aus MetaMask importierte Konten (Coin 60) senden auf der EVM-Lane. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Rufen Sie dafür die native Lane auf; die EVM-Precompiles werden abgelehnt. |
| Ein EVM-Aufruf verlangt immer wieder ein zweites Tippen | Der Node kann nicht prüfen, was der Aufruf mit Token macht, oder der Aufruf ist nicht dekodierbar. Erklären Sie ihn auf Ihrer Seite. |
| Ein Token-Aufruf schlägt fehl, obwohl der Nutzer ein Fenster geöffnet hat | Ein selbst geöffnetes Fenster deckt standardmäßig nur QOR-Überweisungen ab. Lassen Sie QoreX das Fenster je Transaktion öffnen oder sagen Sie dem Nutzer, Jeder Vertrag zu wählen. |
| `4001` direkt nachdem die Seite um eine Signatur bittet | Der Nutzer hat abgelehnt oder bei gesperrter Wallet das Entsperrfenster geschlossen. Bieten Sie einen neuen Versuch an. |
| `eth_accounts` liefert `[]` | Die Website ist noch nicht verbunden. Rufen Sie `eth_requestAccounts` auf. |
| Ein `browse`-Link tut nichts | Die Seitenadresse verletzt eine Regel (Port, IP, `localhost`, nicht https, mehr als 2048 Zeichen), oder das Telefon hat noch keine Wallet. |
| `KEY_NOT_REGISTERED` auf Ihrem Server | Der Signierer hat in diesem Netzwerk noch nie eine Transaktion gesendet. Bitten Sie zuerst um eine. |

Bleibt ein Problem bestehen, kann der Nutzer ein geschwärztes Anfrageprotokoll aus dem [Entwicklermodus](/qorex/developer-mode) senden, und Sie können das Testnet nutzen, um es nachzustellen.

## Wo es veröffentlicht ist {#where-published}

| Was | Wo |
|---|---|
| QoreX-Browser-Erweiterung | Chrome Web Store, Firefox Add-ons und Mac App Store (Safari). Siehe [Browser-Erweiterung](/qorex/browser-extension#install). |
| QoreX-App und ihr dApp-Browser | App Store und Google Play. Siehe [QoreX Wallet](/qorex/overview#how-to-access). |
| Prüfung von Nachrichten und Transaktionen | `@qorechain/qoresign` (TypeScript und andere Sprachen). Siehe [QoreSign](/qoresign/overview). |
| Wallet-Erkennung für Web-Apps | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| Connectoren für RainbowKit, Interchain Kit und cosmos-kit, Typen und eine Test-Wallet | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| Core-SDK zum Bauen und Senden von Transaktionen | [Developer Tools](/developer-tools/overview) |

Der QoreX-Quellcode ist nicht öffentlich. Die aktuelle Version in jedem Store steht auf der Seite [Übersicht](/qorex/overview#versions).
