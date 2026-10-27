---
slug: /developer-tools/wallet-adapter
title: Wallet-Adapter
sidebar_label: Wallet-Adapter
sidebar_position: 2
---

# Wallet-Adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` fügt QoreChain zu Cosmos-Wallets hinzu, die `signDirect` bereitstellen (Keplr, Leap, Cosmostation), und baut die Transaktionen, die die Chain verlangt: Eine Transaktion auf der nativen Lane muss neben der klassischen secp256k1-Signatur des Kontos eine ML-DSA-87-Signatur (FIPS 204) tragen, und eine Standard-Wallet kann die ML-DSA-87-Signatur nicht erzeugen. Der Adapter erzeugt sie, legt sie in den Transaktions-Body und bittet dann die unveränderte Wallet um eine gewöhnliche Signatur. Er richtet sich an dApp- und Wallet-Entwickler sowie an Tool-Entwickler, die in JavaScript vereinheitlichte QoreChain-Wallets, Nachrichten für das EVM-Autorisierungsfenster oder Nachrichten für verknüpfte Schlüssel (Authenticators) benötigen. Die aktuelle Version ist 0.4.0.

Wenn Sie nur möchten, dass eine dApp eine Transaktion aus der QoreX-Wallet eines Nutzers sendet, ist der kürzeste Weg [`qorexSignAndBroadcast`](#qorex) in diesem Paket oder die QoreX-Pakete im Index [Entwickler-Pakete](/developer-tools/overview#group-qorex). Wenn Sie eine Wallet schreiben und eine vollständige Signierbibliothek in fünf Sprachen möchten, lesen Sie zuerst [QoreSign](/qoresign/overview).

## Innovationen {#innovations}

- **Die Wallet signiert einen gewöhnlichen Body.** Der Adapter baut den Body ohne die Erweiterung, signiert die ML-DSA-87-Schicht über die Sign-Bytes, legt sie als Extension-Option `/qorechain.pqc.v1.PQCHybridSignature` (Algorithmus-ID 1) in den Body und ruft erst dann `wallet.signDirect` für das fertige `SignDoc` auf. Die Wallet erzeugt eine Standard-Signatur im Modus `SIGN_MODE_DIRECT` und braucht keinen QoreChain-spezifischen Code. Das Ergebnis sind die üblichen `TxRaw`-Bytes.
- **Auswahl der Sign-Bytes pro Netzwerk.** Der ML-DSA-87-Schlüssel signiert eine von zwei Byte-Formen, und ein Netzwerk verifiziert zu jeder Höhe genau eine. Mit `signBytesVersion: "auto"` (der Standard) fragt der Signierer den Node mit `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` nach `v3.2.0` und dann nach `v3.1.98`, signiert die v2-Form (Domain-Tag `qorechain-pqc-hybrid-v2` plus Chain-ID), wenn eine der beiden Höhen über null liegt, speichert die Antwort 60 Sekunden pro REST-URL und Chain-ID im Cache und wirft einen Fehler, statt zu raten, wenn er nicht fragen kann. Am 27. Oktober 2026 gegen die Live-Nodes geprüft: Mainnet und Testnet lösen beide zu `v2` auf, und ein Aufruf für `qorechain-vladi` ohne `rest` wirft einen Fehler. `refreshSignBytesVersion()` umgeht den Cache, und `isHybridSignBytesRejection()` erkennt die Ablehnung mit `pqc`-Code 21, sodass ein Aufrufer neu auflösen und einmal wiederholen kann, wenn ein Netzwerk ein Upgrade erhält, während eine Wallet geöffnet ist.
- **Ein ML-DSA-87-Schlüssel pro Mnemonic, von allen Tools gemeinsam genutzt.** `walletFromMnemonic` leitet den Schlüssel als `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` ab und speist ihn in die ML-DSA-87-Schlüsselerzeugung ein. Er ist an die Kontoadresse gebunden und ist dieselbe Ableitung, die das SDK, `@qorechain/chain-bridge`, QoreX und der Befehl `qorechaind tx pqc recover-key` verwenden, sodass eine Mnemonic einen Schlüssel ergibt, egal welches Tool signiert. Siehe [Deterministische Schlüsselableitung und Wiederherstellung](/developer-guide/post-quantum-signing#key-derivation).
- **Ein Konto, drei Adressformen, ein Signierschlüssel.** `generateQoreWallet` und `walletFromMnemonic` liefern die Formen `qor1`, `0x` (EIP-55) und SVM-base58 derselben 20-Byte-Identität zusammen mit dem ML-DSA-87-Schlüsselpaar. `signClassicalEth` und `signHybridEth` signieren Transaktionen der Cosmos-Lane mit diesem eth-nativen Schlüssel (`eth_secp256k1`), sodass derselbe Schlüssel auch anderswo EVM-Transaktionen signiert.
- **PQC-Wiederherstellungscodes.** `generatePqcRecoveryCode` liefert ein zufälliges 256-Bit-Geheimnis im Format `QRC1-` plus Crockford-base32 mit einer 24-Bit-Prüfsumme. `pqcKeyFromRecoveryCode(code, address)` leitet daraus den ML-DSA-87-Schlüssel ab, gebunden an die Adresse. Ein falsch getipptes Zeichen wird mit einer Meldung abgelehnt, statt stillschweigend einen Schlüssel abzuleiten, der zu nichts passt, und der Code ist bewusst keine Seed-Phrase.
- **QoreX als Signierer.** `qorexSignAndBroadcast` sendet protobuf-kodierte Nachrichten (1 bis 32 pro Aufruf, Memo bis 256 Bytes, Gas-Limit 100.000 bis 5.000.000) an die QoreX-Wallet des Nutzers, die sie dekodiert anzeigt, die ML-DSA-87-Schicht hinzufügt, die nur die Wallet erzeugen kann, signiert und sendet. Der Adapter prüft die Grenzen lokal und lehnt PQC-Schlüsselverwaltungsnachrichten ab (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), auch innerhalb eines authz-`MsgExec` in beliebiger Tiefe. Ein `MsgExec`, den er nicht dekodieren kann, wird abgelehnt.
- **Bausteine für das EVM-Autorisierungsfenster, nie ein automatisches.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` und `isEvmWindowRejection` decken das Fenster ab, das vor einem EVM-Senden geöffnet sein muss. Jede Grenze (`blocks` 1 bis 17.280, `maxTxs` 1 bis 1.000, `maxValue` über null) ist Pflicht und wird clientseitig ohne Standardwert geprüft, die Statusfelder des Fensters sind BigInt, und das Paket öffnet nie von selbst ein Fenster: Der Nutzer soll einen ausdrücklichen Autorisierungsschritt sehen.
- **Nachrichten für verknüpfte Schlüssel (Authenticators) mit chain-genauen Digests.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` und `buildMetaMaskExecuteCosmos` bauen die Nachrichten, mit denen ein Phantom- oder MetaMask-Schlüssel unter einem Berechtigungssatz und einer Ausgaberegel von einem QoreChain-Konto ausgeben kann. `evmAuthSignBytesV2` ist der Digest ab Chain v3.2.3, der zusätzlich das Gas-Limit des Aufrufs bindet (es muss ungleich null sein). Die Nonce ist die Authenticator-Sequenz des verknüpften Schlüssels, nicht die EVM-Nonce des Kontos. Siehe [Authenticators und delegiertes Ausgeben](/sdk/guides/authenticators).
- **Sichere Schlüsselrotation.** `rotateFromLegacyWalletKey` baut eine `MsgRotatePQCKey` weg von einem Schlüssel, der mit der zurückgezogenen Ableitung aus der Wallet-Signatur erzeugt wurde, und lehnt ab, sofern der neu abgeleitete Schlüssel nicht dem registrierten entspricht. `rotatePqcKeyMsgFromMnemonic` verschiebt einen Legacy-Schlüssel `SHAKE-256(mnemonic)` auf den kanonischen, an die Adresse gebundenen Schlüssel und lehnt die Legacy-Ableitung als neuen Schlüssel ab.

## Anwendung {#how-to-use}

Installieren Sie den Adapter mit den beiden cosmjs-Peers (Version 0.32):

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

Das Paket ist ein ES-Modul aus reinem JavaScript mit TypeScript-Typings. Das Manifest enthält dafür keinen getesteten Quickstart. Die folgenden Snippets stammen aus den Typings und dem Quellcode des Pakets; am 27. Oktober 2026 wurden die Wallet-Erzeugung, der Sign-Bytes-Resolver, das Lesen des Status des EVM-Fensters, `openEvmWindowMsg` und der Fehler der zurückgezogenen Funktion gegen das veröffentlichte Paket 0.4.0 und die Live-REST-Endpunkte von Testnet und Mainnet ausgeführt, und die 102 eigenen Tests des Pakets bestehen. Die Signier- und QoreX-Snippets wurden nicht Ende-zu-Ende ausgeführt.

### Eine vereinheitlichte Wallet erzeugen {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` baut dieselbe Wallet aus 32 geheimen Bytes: Der Seed wird zum secp256k1-Privatschlüssel, er muss also aus einer sicheren Zufallsquelle oder einer Schlüsselableitungsfunktion über Material stammen, das nur der Nutzer besitzt. Leiten Sie ihn niemals aus einer Signatur ab, die eine Website von einer Wallet anfordern kann.

### Die Chain in den Wallets des Nutzers registrieren {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` verwendet Coin-Typ 118, das bech32-Präfix `qor`, die Denom `uqor` mit 6 Dezimalstellen und eine Gaspreis-Staffel von 0,1, 0,15 und 0,25 uqor pro Gas, was die Gebührenuntergrenze von 0,1 uqor pro Gas einhält. `addQoreEvmToWallet` benötigt `rpcUrl`.

### Eine hybride Transaktion mit einer Cosmos-Wallet signieren {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

Das sollten Sie wissen:

- Der Adapter signiert; Sie senden. Er baut nicht die Nachricht zur Schlüsselregistrierung. Registrieren Sie den ML-DSA-87-Schlüssel des Kontos einmal mit [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), dem SDK oder der CLI (siehe [Ihren Schlüssel registrieren](/developer-guide/post-quantum-signing#pqc-key-registration)); diese erste Transaktion darf klassisch signiert sein.
- Eine Webseite, die den ML-DSA-87-Schlüssel des Kontos hält, ist ein Entwurf, den man vermeiden sollte. `derivePqcKeyFromWallet`, das den Schlüssel früher aus einer Wallet-Signatur ableitete, wurde in 0.3.0 zurückgezogen und wirft immer einen Fehler. Eine dApp sollte Nachrichten an QoreX senden (unten) und die Wallet signieren lassen.
- Wenn ein Senden mit `pqc`-Code 21 abgelehnt wird und Sie `"auto"` verwendet haben, rufen Sie `adapter.refreshSignBytesVersion()` auf und signieren Sie noch einmal; wiederholen Sie nicht, wenn Sie ein ausdrückliches `"v1"` oder `"v2"` übergeben haben. Siehe [Fehlerbehebung für Code 21](/developer-guide/post-quantum-signing#code-21).

### Über QoreX senden {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` sind Protobuf-Bytes (ein `Uint8Array`, ein Zahlen-Array oder base64), die exakt so signiert werden, wie sie übergeben werden. Eine dApp kann das Netzwerk der Wallet nicht wechseln. Erforderlich ist die QoreX-Erweiterung 0.3.5 oder die App 1.1.5 oder neuer; testen Sie mit `hasQorexSignAndBroadcast()` statt mit einer Versionsprüfung. Der Vertrag auf Protokollebene steht in [QoreX-Browser-Erweiterung](/qorex/browser-extension#sign-and-broadcast).

### Eine EVM-Fensternachricht bauen {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

Die Reihenfolge ist wichtig: Öffnen Sie das Fenster, lesen Sie dann die EVM-Nonce, und signieren Sie dann die EVM-Transaktion, denn das Öffnen eines Fensters erhöht die Sequenz des Kontos, die zugleich seine EVM-Nonce ist. `openEvmWindowMsg` baut nur die uneingegrenzte Form des Fensters; ein eingegrenztes Fenster (`native_only`, `allowed_targets`) benötigt das SDK. Hintergrund: [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window) und [Ihre erste Transaktion](/getting-started/first-transaction#evm-window).

### Weitere Einstiegspunkte

| Aufgabe | Funktionen |
|---|---|
| Einen PQC-Schlüssel wiederherstellen oder rotieren | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Mit dem eth-nativen Schlüssel signieren | `signClassicalEth` (die klassische Schlüsselregistrierung), `signHybridEth` |
| Sign-Bytes-Helfer | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Mit einem externen Schlüssel verknüpfen und ausgeben | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, die Funktionen `buildPhantom*` und `buildMetaMask*` |

## Zugang {#how-to-access}

- **Netzwerke:** Mainnet `qorechain-vladi` und Testnet `qorechain-diana`. Übergeben Sie `chainId` und die passende `rest`-URL ([Endpunkte](/developer-tools/overview#how-to-access)).
- **Wallets:** Keplr ist die Wallet, die der QoreSign-Leitfaden und die Beispiele verwenden ([Keplr-kompatible Wallets](/qoresign/guides/keplr-compatible-wallets)). Leap und Cosmostation stellen dieselbe `signDirect`-Schnittstelle bereit, und das Paket ist für jede solche Wallet geschrieben; für diese Seite wurde es nicht gegen sie geprüft. MetaMask nutzt die EVM-Lane, nicht den Signierer des Adapters, und braucht für jedes Senden ein offenes EVM-Fenster ([Entwickler-Pakete](/developer-tools/overview#how-to-access)). Phantom wird als Authenticator verknüpft.
- **Konto und Schlüssel:** ein mit QOR für die Gebühr finanziertes Konto, und der ML-DSA-87-Schlüssel des Kontos, der vor der ersten hybriden Transaktion on-chain registriert sein muss.
- **Voraussetzungen:** Node.js mit ES-Modulen oder ein Bundler für den Browser. Peer-Abhängigkeiten `@cosmjs/stargate` und `@cosmjs/proto-signing` `^0.32`. Laufzeitabhängigkeiten: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` und `@cosmjs/encoding` `^0.32`.
- **Kosten:** Das Paket ist kostenlos; Transaktionen zahlen die Netzwerkgebühr von 0,1 uqor pro Gas oder mehr. Eine Schlüsselregistrierung verwendet ein großes Gas-Limit, weil der öffentliche ML-DSA-87-Schlüssel 2.592 Bytes groß ist.

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Link |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (veröffentlicht am 20. Oktober 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Quellcode: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (öffentlich, Tag `v0.4.0`, Apache-2.0). Es ist nicht auf PyPI, crates.io, Maven Central oder dem Go-Proxy veröffentlicht. Verwandt: [Entwickler-Pakete](/developer-tools/overview), [QoreSign](/qoresign/overview), [Post-Quanten-Signierung](/developer-guide/post-quantum-signing), [Börsenintegration](/developer-guide/exchange-integration).

## Einschränkungen und bekannte Probleme {#limits}

- **Es signiert; es sendet nicht, registriert keine Schlüssel und öffnet keine Fenster.** Es gibt keine Funktion, die den ML-DSA-87-Schlüssel registriert, und nichts öffnet für Sie ein EVM-Fenster.
- **Kein Besitznachweis.** Eine Schlüsselregistrierung, die mit Tooling erfolgt, das nur dieses Paket verwendet, trägt keinen. Die Chain akzeptiert sie dennoch und verifiziert den Nachweis, wenn einer vorhanden ist ([Besitznachweis](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` ist zurückgezogen** (0.3.0) und wirft immer einen Fehler. Konten, die damit einen Schlüssel registriert haben, sollten ihn mit `rotateFromLegacyWalletKey` rotieren.
- **Nur uneingegrenzte Fenster.** `openEvmWindowMsg` hat keine Scope-Felder.
- **`qoreChainInfo` verwendet standardmäßig das Testnet.** Übergeben Sie für das Mainnet immer `chainId`.
- **Authenticator-Nonces.** Bisher stellt keine Abfrage die Authenticator-Sequenz des verknüpften Schlüssels bereit, Sie müssen sie also selbst nachführen; die Chain antwortet mit `abstractaccount` Code 11, wenn der Wert falsch ist. Das Authenticator-Modul ist im Testnet aktiviert und im Mainnet abgeschaltet (siehe die [SDK-Übersicht](/sdk/overview)).
- **cosmjs-0.32-Peers.** Das SDK verwendet cosmjs 0.39; beide in einem Projekt zu installieren ergibt einen `ERESOLVE`-Fehler, halten Sie sie also getrennt oder übergeben Sie `--legacy-peer-deps`.
- **Nicht aus der README des Pakets kopieren.** Sie behauptet noch, das Mainnet verifiziere die erste Sign-Bytes-Form und ein MetaMask-Senden brauche keinen weiteren Schritt. Beides ist veraltet: Beide Netzwerke verifizieren v2, und ein EVM-Senden braucht einen registrierten Schlüssel und ein offenes Fenster.
- **Kein getesteter Quickstart** ist für dieses Paket verzeichnet, und der QoreX-Weg setzt eine installierte Wallet voraus, sodass er nicht in einem Skript laufen kann.
