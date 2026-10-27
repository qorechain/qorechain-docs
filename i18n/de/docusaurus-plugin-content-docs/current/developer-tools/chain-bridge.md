---
slug: /developer-tools/chain-bridge
title: Chain-Bridge und Handles
sidebar_label: Chain-Bridge und Handles
sidebar_position: 3
---

# Chain-Bridge und Handles

Diese Seite behandelt zwei kleine serverseitige Pakete.

**`@qorechain/chain-bridge`** (0.2.3) ist eine Node.js-Bibliothek für Backends, die auf QoreChain handeln, ohne dass eine Person an der Tastatur sitzt: Sie sendet QOR, registriert den ML-DSA-87-Schlüssel eines Kontos, registriert Light Nodes, deployt Contracts und vergibt und widerruft für den Inhaber des Lizenz-Autoritätsschlüssels der Chain Lizenzen. Sie übernimmt die beiden Dinge, die ein gewöhnliches Backend nicht allein kann: die hybride ML-DSA-87-Signatur, die Transaktionen der nativen Lane benötigen, und die exakte Protobuf-Kodierung der benutzerdefinierten Nachrichten von QoreChain. Sie richtet sich an Hot-Wallet-Worker, Zahlungs- und Dashboard-Backends und ähnliche Dienste.

**`@qorechain/handles`** (0.1.0) löst einen QoreX-`@handle` in eine Adresse auf und verifiziert die Antwort kryptografisch, bevor sie zurückgegeben wird. Es richtet sich an Wallets und Dienste, die eine Person `@alice` statt einer `qor1...`-Adresse eintippen lassen.

Keines der beiden Pakete nennt in seinen Registry-Metadaten ein Quell-Repository. Den veröffentlichten Code können Sie auf npm lesen.

## Innovationen {#innovations}

### Chain-Bridge {#innovations-chain-bridge}

- **Eine Mnemonic, ein kanonischer ML-DSA-87-Schlüssel.** Der Schlüssel wird als `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` und dann per ML-DSA-87-Schlüsselerzeugung abgeleitet, dieselbe Ableitung wie beim [Wallet-Adapter](/developer-tools/wallet-adapter), beim SDK und bei QoreX, sodass der Schlüssel mit `qorechaind tx pqc recover-key` wiederhergestellt werden kann. Konten, die von älterem Tooling mit `SHAKE-256(mnemonic)` registriert wurden, behalten ihren Legacy-Schlüssel: Wird eine kanonische Signatur mit einem Verifizierungsfehler abgelehnt, versucht die Bridge es einmal mit dem Legacy-Schlüssel erneut.
- **Die Sign-Bytes-Form wird von der Chain gelesen.** Ist `cosmosRest` gesetzt, fragt die Bridge den Node nach den angewandten Upgrade-Plänen (`v3.2.0` und `v3.1.98`) und signiert die v2-Form, wenn einer davon angewandt ist, wie auf der [Wallet-Adapter-Seite](/developer-tools/wallet-adapter#innovations) beschrieben. Lehnt die Chain mit `pqc`-Code 21 ab, löst sie einmal neu auf und signiert erneut. In den Live-Netzwerken ist `cosmosRest` erforderlich; ohne es wirft ein hybrider Aufruf einen Fehler, statt zu raten.
- **Registriert den Schlüssel bei der ersten Verwendung, prüft aber zuerst die Chain.** Wenn eine hybride Transaktion wegen eines fehlenden PQC-Schlüssels abgelehnt wird, sendet die Bridge `MsgRegisterPQCKeyV2` (eine klassische Transaktion, die die Chain für eine erste Registrierung erlaubt) und versucht es erneut. Weil diese Nachricht ihre Gebühr auch dann kostet, wenn sie abgelehnt wird, liest sie zuerst `GET /qorechain/pqc/v1/account/{address}`: Hält das Konto bereits einen Schlüssel, der weder der kanonische noch der Legacy-Schlüssel Ihrer Mnemonic ist, wirft sie `pqc_key_mismatch` und sendet nichts. Mit `cosmosRest` trägt eine Registrierung außerdem den Besitznachweis, sobald das Netzwerk v3.2.3 angewandt hat (Mainnet und Testnet haben es).
- **Lizenz-Feature-IDs aus einfachen Namen.** `featureIdsFor({ type, chains })` bildet eine Produktbeschreibung auf die Feature-IDs der Chain ab (`validator_operator` plus `validator_<chain>`, `lightnode_operator`, `qcb_bridge` plus `bridge_<chain>`), normalisiert Freitext-Chain-Namen wie „Solana“ oder „BNB Chain“ und verwirft eine unbekannte Chain, statt eine ID zu bauen, die die Chain ablehnen würde. Am 27. Oktober 2026 geprüft: `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` lieferte `validator_operator`, `validator_solana`, `validator_ethereum` und verwarf `Foo`.
- **Reines JavaScript, keine nativen Add-ons.** Es ist ein ES-Modul für Node.js 18 oder neuer und läuft daher in Serverless-Workern. Neben dem Haupteinstieg exportiert es `@qorechain/chain-bridge/proto` (die Wire-Encoder) und `@qorechain/chain-bridge/features` (die Feature-Zuordnung).

### Handles {#innovations-handles}

- **Eine Auflösung wird zweimal geprüft, bevor sie zurückgegeben wird.** Der Eintrag muss die ed25519-Signatur der Registry tragen, verifiziert gegen einen öffentlichen Registry-Schlüssel, den Sie im Client festschreiben (pinnen), und die eigene secp256k1-Signatur des Eigentümers über den Claim, deren öffentlicher Schlüssel auf die `qor1`-Adresse des Eintrags hashen muss. Ein Eintrag, der eine der beiden Prüfungen nicht besteht, wird nie zurückgegeben.
- **Der Pin-Speicher gehört Ihnen.** `resolve` liefert `pin.status` als `new`, `match` oder `CHANGED`, indem es den Eintrag mit einem von Ihnen gehaltenen Pin vergleicht, und pinnt nie von selbst. Sie pinnen, nachdem der Nutzer die Adresse gesehen hat und fortgefahren ist. Der Sinn eines Pins ist es zu bemerken, dass die Registry begonnen hat, etwas anderes zu sagen; er muss daher von jemand anderem gehalten werden als der geprüften Partei, zum Beispiel auf dem Gerät des Nutzers.
- **Für ein Netzwerk werden nur vom Eigentümer signierte Adressen zurückgegeben.** `addressForNetwork(record, caip2)` liefert die `qor1`-Adresse für QoreChain-Netzwerke und die `0x`-Adresse für die Chain-IDs 9800 und 9801, wenn der Eintrag ein vereinheitlichtes Konto ist. Adressen auf anderen Chains, die die Registry lediglich bescheinigt, werden nicht zum Senden zurückgegeben.
- **Nur anzeigender Reverse-Lookup.** `reverse(address)` liefert einen Handle zur Anzeige im Verlauf. Sein Ergebnis darf nie zum Ziel eines Sendevorgangs werden.
- **Claim und Löschen verwenden getrennte Signierdomänen.** `signClaim` und `signDelete` signieren verschiedene Nachrichten, sodass eine Lösch-Signatur nicht als Claim wiederverwendet werden kann.

## Anwendung {#how-to-use}

### Chain-Bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

Es zieht `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 und ethers 6 nach sich. Es gibt dafür keinen getesteten Quickstart; das Snippet unten folgt den Typings des Pakets und dem [Leitfaden zur Börsenintegration](/developer-guide/exchange-integration#chain-bridge). Am 27. Oktober 2026 wurden der Konstruktor, `featureIdsFor` und die Liste der Methoden gegen das veröffentlichte Paket 0.2.3 geprüft; es wurde keine Transaktion gesendet.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Wichtigste Methoden:

| Methode | Was sie tut | Verwendeter Schlüssel |
|---|---|---|
| `sendTokens({ to, amountUqor })` | Bank-`MsgSend`, hybrid signiert | Signierer |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, klassisch | dieses Konto |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | Light-Node-Registrierung, hybrid signiert | Operator |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | Nachrichten des Lizenzmoduls | der Lizenz-Autoritätsschlüssel der Chain |
| `deployEvm({ bytecode, abi, args })` | ein Ethereum-artiges Deployment über `eth_sendRawTransaction` | Deployer-Schlüssel |
| `deploySvm({ bytecode })` | SVM-Programm-Deployment | Signierer |
| `createVestingAccount`, `createPeriodicVestingAccount` | Erstellung von Vesting-Konten | Signierer |
| `featureIdsFor`, `normalizeChain` | lokale Helfer | keiner |

Jeder Aufruf liefert `{ txHash, code, height, gasUsed }`, und ein hybrider Aufruf meldet zusätzlich `signBytesVersion`. Der Standard-Gaspreis ist 0,1 uqor pro Gas, die Untergrenze des Netzwerks (ein `sendTokens` mit 300.000 Gas kostet zu diesem Preis 30.000 uqor und das Standard-Gas von 6.000.000 für eine Schlüsselregistrierung 600.000 uqor, die Sie einmal pro Konto zahlen). Die EVM-Lane verwendet 18 Dezimalstellen: Der `value` von `deployEvm` ist in Wei. Setzen Sie `keyType: "eth_secp256k1"` in der Konfiguration, um mit dem vereinheitlichten eth-nativen Schlüssel (eine Identität als `qor1`, `0x` und SVM) statt mit dem Standardschlüssel vom Coin-Typ 118 zu signieren; diese Option steht im Quellcode und in der README des Wallet-Adapters, aber nicht in den Typings.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

Seine einzigen Laufzeitabhängigkeiten sind `@noble/curves`, `@noble/hashes` und `bech32`. Es gibt dafür keinen getesteten Quickstart. Das Snippet folgt der README und den Typings des Pakets; am 27. Oktober 2026 wurden `isHandleInput`, `normalizeHandle` und die Exportliste am veröffentlichten Paket 0.1.0 geprüft, und es wurde keine Registry kontaktiert.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` wirft einen Fehler, wenn der Handle unbekannt ist, die Registry nicht erreichbar ist oder die Antwort die Verifizierung nicht besteht. `isHandleInput(text)` unterscheidet einen Handle von einer Adresse (ein Handle besteht aus 3 bis 20 Zeichen aus `a-z`, `0-9` und `_` oder beginnt mit `@`; eine Zeichenkette `qor1...` oder `0x...` ist nie ein Handle). Weitere Exporte: `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. Wie QoreX Handles verwendet, siehe [An einen @handle senden](/qorex/browser-extension#handle-send) und [Konto und Dashboard](/qorex/account-and-dashboard).

## Zugang {#how-to-access}

- **Netzwerke:** Die Chain-Bridge läuft gegen das Mainnet `qorechain-vladi` oder das Testnet `qorechain-diana` mit den Endpunkten, die auf der Seite [Entwickler-Pakete](/developer-tools/overview#how-to-access) aufgeführt sind (der EVM-RPC und die Chain-ID 9800 oder 9801 für `deployEvm`).
- **Voraussetzungen der Chain-Bridge:** Node.js 18 oder neuer; ein finanziertes Konto, dessen Mnemonic Ihr Worker hält (bewahren Sie sie in einem Secrets-Manager auf); und die REST-URL des Netzwerks. Der ML-DSA-87-Schlüssel wird aus der Mnemonic abgeleitet und bei der ersten Verwendung registriert, das Konto muss also genug QOR für diese Registrierungsgebühr halten.
- **Lizenzaufrufe** gelingen nur, wenn sie mit dem Schlüssel signiert sind, mit dem die Chain als Lizenz-Autorität konfiguriert wurde. Ein externer Entwickler besitzt ihn nicht, daher sind diese Methoden für den Betreiber dieses Schlüssels gedacht. Zu Lizenzen und Light-Node-Registrierung als Nutzer siehe [Registrierung und Lizenzierung](/light-node/registration-and-licensing).
- **Voraussetzungen für Handles:** die Basis-URL der Registry und ihr öffentlicher ed25519-Schlüssel (hex), ein von Ihnen implementierter Pin-Speicher und `fetch`. Lesezugriffe brauchen kein Konto.
- **Kosten:** Beide Pakete sind kostenlos. Transaktionen der Chain-Bridge zahlen die Netzwerkgebühr.

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Link |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (veröffentlicht am 20. Oktober 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (veröffentlicht im August 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Beide stehen unter Apache-2.0 und sind nur auf npm veröffentlicht (nicht auf PyPI, crates.io, Maven Central oder dem Go-Proxy). Keines nennt in seinen Registry-Metadaten ein Quell-Repository, es gibt also keine öffentliche Quellcode-Seite zum Verlinken; der Code liegt im veröffentlichten Tarball. Zum Lesen der Live-Versionen siehe [So erhalten Sie Live-Versionen](/developer-tools/overview#live-versions).

## Einschränkungen und bekannte Probleme {#limits}

### Chain-Bridge {#limits-chain-bridge}

- **EVM-Deployments brauchen ein offenes Fenster.** `deployEvm` sendet eine Standard-Ethereum-Transaktion. Seit Chain v3.2.0 lässt die EVM-Lane eine Transaktion nur von einem Konto mit einem registrierten ML-DSA-87-Schlüssel und einem offenen EVM-Autorisierungsfenster zu, und die Bridge hat keine Methode, die eines öffnet. Öffnen Sie das Fenster mit anderem Tooling (dem [Wallet-Adapter](/developer-tools/wallet-adapter#evm-window), dem SDK oder QoreX), bevor Sie die Methode aufrufen, sonst wird die Transaktion abgelehnt (Codespace `pqc`, Code 26, 27 oder 28). Dies folgt den Chain-Regeln und dem Quellcode des Pakets; für diese Seite wurde es nicht gegen ein Live-Netzwerk ausprobiert. Die README des Pakets nennt die EVM-Lane noch ausgenommen, was veraltet ist.
- **`deploySvm`** zielt auf die SVM-Lane, die in keinem der beiden Netzwerke bisher Transaktionen akzeptiert.
- **Methoden zum Hochladen von Contracts existieren, sind aber nicht dokumentiert.** Der Quellcode hat außerdem `storeWasm`, `instantiateWasm` und `deployWasm` für QoreChain-Native-Contracts, die weder in den Typings noch in der README stehen. Der Upload ist in den Live-Netzwerken für gewöhnliche Konten nur über Governance möglich, rechnen Sie bei einem gewöhnlichen Konto also mit einer Ablehnung.
- **Der Schlüssel wird auf dem Server abgeleitet.** Die Mnemonic bleibt in Ihrem Prozess. Halten Sie sie aus Logs und Versionskontrolle heraus und verwenden Sie sie nicht als persönliche Wallet wieder.
- **Eine Registrierung ist nicht kostenlos.** Die Bridge registriert den Schlüssel bei der ersten Verwendung selbst; ein Rail, das Gelder bewegt, sollte vorab registrieren und das Ergebnis vor der ersten Auszahlung mit `GET /qorechain/pqc/v1/account/{address}` bestätigen.
- **cosmjs 0.32.** Installieren Sie es nicht neben dem SDK (cosmjs 0.39) in einem Projekt; npm meldet `ERESOLVE`.
- **Veraltete Teile der README.** Die README sagt, das Mainnet bleibe bei der ersten Sign-Bytes-Form; beide Netzwerke verifizieren v2 (siehe [Post-Quanten-Sicherheit](/architecture/post-quantum-security)).
- **Kein getesteter Quickstart, kein öffentliches Quell-Repository.**

### Handles {#limits-handles}

- **Die Adresse der Registry und ihr öffentlicher Schlüssel sind nicht veröffentlicht,** weder im Paket noch in diesem Handbuch. QoreX und das Dashboard haben sie eingebaut, ein Integrator kann das Paket also nur nutzen, wenn er diese beiden Werte erhält.
- **Handles sind keine On-Chain-Namen.** Die Registry ist ein Off-Chain-Dienst, der für QoreX betrieben wird; das Paket verifiziert ihre Antworten, kann sie aber nicht verfügbar machen. Ist die Registry nicht erreichbar, wirft `resolve` einen Fehler `NETWORK_UNAVAILABLE`, und `isReachable()` ist eine schnelle Probe, mit der eine UI Handle-Funktionen ausblenden kann.
- **Es pinnt nichts für Sie.** Wenn Sie nie `pin` aufrufen, meldet jede Auflösung `new`. Der Aufrufer ist dafür verantwortlich, Pins sicher zu speichern.
- **Zum Senden werden nur vom Eigentümer signierte Adressen verwendet.** Adressen auf anderen Chains, die die Registry bescheinigt, werden von `addressForNetwork` nicht zurückgegeben.
- **Schreibende Aufrufe brauchen mehr als das Paket.** `claim`, `deleteHandle` und `bySub` sprechen mit den Schreib-Endpunkten der Registry und brauchen eine Eigentümer-Signatur (`signClaim`, `signDelete`) oder ein Konto-Token; sie sind für Wallet-Apps gedacht.
- **Kein getesteter Quickstart, kein öffentliches Quell-Repository.**
