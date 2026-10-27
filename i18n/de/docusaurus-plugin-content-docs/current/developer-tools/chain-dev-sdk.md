---
slug: /developer-tools/chain-dev-sdk
title: Chain Developer Kit
sidebar_label: Chain Developer Kit
sidebar_position: 34
---

# Chain Developer Kit (EVM- und QoreChain-Native-Vorlagen)

Das Chain Developer Kit ist der Teil des QoreChain SDK **0.11.0**, der Solidity- und Smart-Contract-Teams hilft, mit den Werkzeugen, die sie bereits nutzen, auf QoreChain zu bauen. Es ergänzt `@qorechain/evm` um viem-Chain-Definitionen und Helfer für das EVM-Autorisierungsfenster, `create-qorechain-dapp` um vier neue Projektvorlagen (Foundry, Hardhat 3, viem mit wagmi und ein QoreChain-Native-CosmWasm-Token), EVM-Quickstarts für fünf Sprachen sowie eine Referenz dazu, wie sich die QoreChain-EVM von Ethereum unterscheidet. Es richtet sich an Solidity-Teams, die Verträge von Ethereum portieren, an dApp-Frontend-Entwickler mit wagmi und RainbowKit, an CosmWasm-Entwickler und an Maintainer von EVM-Werkzeugen, die QoreChain hinzufügen möchten.

:::caution Demnächst: SDK 0.11.0 ist getaggt, aber nicht auf npm veröffentlicht
SDK 0.11.0 ist auf GitHub getaggt (`qorechain/qorechain-sdk`, Tag `v0.11.0`, 27. Oktober 2026). **Das npm-Release steht noch aus**, und am 27. Oktober 2026 fand `npm view` für Version 0.11.0 von `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` und `create-qorechain-dapp` nichts. Diese Seite nennt **keinen Installationsbefehl für 0.11.0**. Alles, was unten mit **ab 0.11.0** markiert ist, funktioniert heute nicht von npm aus. Die mit **heute live** markierten Punkte funktionieren: Sie stammen aus `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 und den Sprach-SDKs in 0.10.0. 0.11.0 ändert allein die npm-Pakete; die SDKs für Python, Rust, Go und Java bleiben bei 0.10.0.
:::

Das Kit zielt auf das Mainnet (`qorechain-vladi`, EVM-Chain-ID 9801) und das Testnet (`qorechain-diana`, EVM-Chain-ID 9800).

## Heute live und kommend in 0.11.0 {#status}

| Punkt | Status | Wo |
|---|---|---|
| Lesen mit ethers v6, web3.py, go-ethereum, alloy oder web3j gegen die öffentlichen Endpunkte | **Heute live** (kein QoreChain-Paket nötig) | [Quickstart 1](#quickstart-ethers) |
| `createEvmClient`, ERC-20-, ERC-721- und ERC-1155-Helfer, `precompiles`-Bindings, `PRECOMPILE_ADDRESSES` | **Heute live** in `@qorechain/evm` 0.8.0 | [Quickstart 2](#quickstart-evm-080) |
| Ein EVM-Autorisierungsfenster aus TypeScript öffnen und lesen, mit `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Heute live** in `@qorechain/sdk` 0.10.0 | [Quickstart 5](#quickstart-open-window) |
| Dieselben Fenster-Builder in Python, Go, Rust und Java | **Heute live** in den 0.10.0-SDKs | [Haupt-API](#main-api) |
| EIP-7702-Zustimmungshelfer `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Heute live** in `@qorechain/sdk` 0.10.0 | [Haupt-API](#main-api) |
| Der Scaffolder mit den Vorlagen `evm-solidity`, `fullstack-web`, `rollup-app` | **Heute live** in `create-qorechain-dapp` 0.10.0 | [Quickstart 6](#quickstart-scaffold-live) |
| viem-Chain-Definitionen `qorechain` und `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **Ab 0.11.0** (kommend) | [Quickstart 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, Adresskonverter, Fensterkonstanten, Subpfad `@qorechain/evm/window` | **Ab 0.11.0** (kommend) | [Quickstart 4](#quickstart-window-helpers) |
| Vorlagen `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` und der Helfer `pnpm window` | **Ab 0.11.0** (kommend) | [Vorlagen](#templates) |
| `PqcStatusBadge` in `@qorechain/react` | **Ab 0.11.0** (kommend) | [Haupt-API](#main-api) |

## Innovationen {#innovations}

- **Senden wird bewusst und mit begrenztem Fenster autorisiert.** Eine EVM-Transaktion wird nur von einem Konto zugelassen, das einen registrierten ML-DSA-87-Schlüssel und ein offenes EVM-Autorisierungsfenster hat. Das Fenster wird durch eine hybrid signierte Nachricht der nativen Lane (secp256k1 plus ML-DSA-87) geöffnet, sodass der secp256k1-Schlüssel, den eine EVM-Bibliothek hält, allein nie Ausgaben autorisieren kann. Die Ethereum-Transaktion selbst bleibt eine normale Ethereum-Transaktion.
- **Ein Fenster, das in Grenzen bemessen ist, nicht in Vertrauen.** Ein Fenster begrenzt die Anzahl der Blöcke (1 bis 17.280), die Anzahl der EVM-Transaktionen (1 bis 1.000) und eine Gesamtsumme in uqor, die den Wert plus die maximale Gebühr jeder zugelassenen Transaktion abdeckt. `nativeOnly` beschränkt es auf einfache QOR-Überweisungen, und `allowedTargets` (höchstens 16 Adressen) begrenzt die Empfänger und verweigert die Vertragserstellung.
- **Ein Konto, zwei Kodierungen.** Bei einem eth-nativen Konto sind die Adressen `0x` und `qor1...` dieselben 20 Bytes und zeigen dasselbe Guthaben, sodass ein Schlüssel auf der EVM und auf der nativen Lane funktioniert. QOR hat auf der EVM 18 Dezimalstellen und auf der nativen Lane 6 (`uqor`); 1 uqor entspricht 10^12 wei.
- **Helfer, die die Ablehnung benennen.** `classifyEvmWindowRejection` ordnet eine abgelehnte Transaktion aus einem viem- oder ethers-Fehler, einem Zustellergebnis der nativen Lane oder einem String einem von vier Gründen zu: `no-pqc-key`, `no-window`, `exhausted` oder `invalid`.
- **Fensterbemessung in uqor.** `evmWindowCost` und `weiToUqorCeil` bemessen ein Fenster aus Wert, Gas und Gebührenobergrenze und runden wei auf uqor auf, sodass die Summe den schlimmsten Fall abdeckt.
- **Keine automatische Öffnung.** Das Kit hat bewusst keinen Helfer, der vor einem Senden ein Fenster öffnet. Das Fenster existiert, damit Ausgaben bewusst autorisiert werden.
- **Kostenlose Simulation.** `eth_call` und `eth_estimateGas` funktionieren für jedes Konto ohne Fenster und ohne registrierten Schlüssel.
- **Vorlagen, die das Fenster verdrahten.** Die Vorlagen Foundry und Hardhat enthalten `pnpm window status|register|open`; es leitet den ML-DSA-87-Schlüssel aus demselben Geheimnis wie den EVM-Schlüssel ab, registriert ihn einmal und sendet die hybrid signierte Öffnungsnachricht.
- **Eine dokumentierte Kompatibilitätsoberfläche.** Eine Referenzseite (am 27. Oktober 2026 von den öffentlichen Endpunkten gelesen) listet auf, was sich von Ethereum unterscheidet: Transaktionstypen, Forks, Finalität, Gebührenfelder, JSON-RPC-Namespaces und Precompiles. Sie ist [unten](#evm-differences) zusammengefasst.

## Was das Kit enthält {#contents}

### `@qorechain/evm` {#evm-package}

**Ab 0.11.0** (neu):

- `qorechain` (9801) und `qorechainTestnet` (9800): viem-Chain-Objekte mit den öffentlichen Endpunkten, der nativen Währung QOR mit 18 Dezimalstellen und dem Explorer `https://explore.qore.network`. `QORECHAIN_CHAINS` listet beide auf (Mainnet, dann Testnet) für wagmi und RainbowKit. `QORECHAIN_REST_ENDPOINTS` ordnet jeder EVM-Chain-ID ihren REST-Endpunkt der nativen Lane zu.
- `evmWindowStatus({ rest, address })` liest das Fenster eines Kontos über REST (`/qorechain/pqc/v1/evm_window/{address}`), akzeptiert eine Adresse `qor1...` oder `0x` und antwortet `{ found: false }`, statt zu scheitern, wenn es keines gibt. `parseEvmWindow` parst die Rohantwort.
- `openEvmWindowMessage(params)` prüft die Grenzen und setzt die `MsgOpenEVMWindow` der nativen Lane als einfaches `{ typeUrl, value }`-Objekt zusammen, bereit zum Signieren mit `@qorechain/sdk`. `checkOpenEvmWindowParams` führt nur die Prüfungen aus.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress` sowie die Konstanten `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17.280), `MAX_EVM_WINDOW_TXS` (1.000) und `MAX_EVM_WINDOW_TARGETS` (16).
- Die Fensterhelfer werden auch ohne viem unter dem Subpfad `@qorechain/evm/window` veröffentlicht.

**Heute live** (0.8.0 und später): `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, die `erc20`-Helfer, ERC-721- und ERC-1155-Helfer, die `precompiles`-Bindings und `PRECOMPILE_ADDRESSES`. Siehe den [EVM-Leitfaden](/sdk/guides/evm).

### Vorlagen {#templates}

`create-qorechain-dapp` hat heute drei Vorlagen live (`evm-solidity`, `fullstack-web`, `rollup-app`; siehe [Scaffolder und CLI](/developer-tools/scaffolders-and-cli)). **Ab 0.11.0** hat es sieben. Die vier neuen:

| Vorlage | Was Sie bekommen |
|---|---|
| `foundry` | Ein Foundry-Projekt: Vertrag `Counter`, Tests, Deploy-Skript, benannte RPC-Endpunkte `qorechain` und `qorechain_testnet` sowie `pnpm window status\|register\|open`. |
| `hardhat` | Ein Hardhat-3-und-viem-Projekt: Vertrag `Counter`, Tests auf dem simulierten Netzwerk, ein Ignition-Deploy-Modul, die Netzwerke `qorechain` und `qorechainTestnet` sowie `pnpm window status\|register\|open`. |
| `viem-wagmi` | Eine dApp mit Vite, React, wagmi und RainbowKit, mit der QoreX-Wallet (`@qorechain/qorex-rainbowkit`) und den Chain-Definitionen aus `@qorechain/evm`. Sie zeigt den neuesten Block, das QOR-Guthaben und das EVM-Fenster des Kontos. |
| `cosmwasm` | Ein QoreChain-Native-CW20-Token (CosmWasm) auf Basis von `cw20-base` aus cw-plus, ein optimierter Build in Docker, ein Skript für den Governance-Upload-Vorschlag sowie Skripte zum Instanziieren und Abfragen auf dem Testnet. |

Die Vorlagen pinnen `@qorechain/evm` und `@qorechain/sdk` auf `^0.11.0`, sodass sie sich nicht von npm installieren lassen, bis 0.11.0 veröffentlicht ist.

### Leitfäden im SDK-Repository {#guides}

Das Repository (`docs/docs/guides/`, Tag `v0.11.0`) enthält `evm-quickstarts.md` (Lesezugriffe für viem, ethers v6, web3.py, go-ethereum, alloy und web3j sowie einen Abschnitt "Before you send"), `evm-differences.md` ("QoreChain EVM compared with Ethereum"), `evm.md` und `cosmwasm.md`. Dasselbe Material auf dieser Website: [EVM-Leitfaden](/sdk/guides/evm), [EVM-Entwicklung](/developer-guide/evm-development) und [QoreChain-Native-Entwicklung](/developer-guide/cosmwasm-development).

Ebenfalls im Tag: Beitragsdateien für andere Werkzeuge (viem-Chain-Definitionen, Sourcify-Chain-Einträge und eine Scaffold-ETH-2-Erweiterung) unter `contrib/` und `templates/scaffold-eth-extension/`. Es sind vorbereitete Dateien im Repository, nicht upstream eingepflegt.

## Anwendungsfälle {#use-cases}

1. **Ein Solidity-Team, das von Ethereum portiert.** Erzeugen Sie die Vorlage `foundry` (ab 0.11.0), kopieren Sie die Verträge hinein, führen Sie lokal `forge test` aus, einmal `pnpm window register` und vor jedem Deploy-Stapel `pnpm window open`. Die [Unterschiede](#evm-differences) listen auf, was zu ändern ist: keine Blob-Transaktionen, PREVRANDAO ist eine Konstante, kein `debug_*`-Tracing auf den öffentlichen Endpunkten.
2. **Ein Hardhat-3-Projekt auf dem Weg zum Testnet.** Erzeugen Sie die Vorlage `hardhat` (ab 0.11.0), behalten Sie Ihre Ignition-Module und deployen Sie mit `pnpm deploy:testnet`, nachdem Sie ein Fenster geöffnet haben.
3. **Ein dApp-Frontend auf wagmi.** Importieren Sie `QORECHAIN_CHAINS` in die wagmi-Konfiguration und in RainbowKit (ab 0.11.0), zeigen Sie das Fenster des Nutzers mit `evmWindowStatus` an und erklären Sie ein abgelehntes Senden mit `classifyEvmWindowRejection`.
4. **Ein Backend-Dienst in einer anderen Sprache.** Ein Dienst in Python, Go, Rust oder Java liest Guthaben und ruft Verträge mit web3.py, go-ethereum, alloy oder web3j wie auf Ethereum auf, **heute**. Zum Senden baut er `MsgOpenEVMWindow` mit dem QoreChain SDK 0.10.0 der jeweiligen Sprache, das live ist.
5. **Ein CosmWasm-Entwickler.** Erzeugen Sie die Vorlage `cosmwasm` (ab 0.11.0), testen Sie das CW20 mit `cargo test`, bauen Sie das optimierte Wasm, reichen Sie einen Governance-Vorschlag zum Speichern des Codes ein und instanziieren Sie ihn auf dem Testnet, sobald der Vorschlag angenommen ist.
6. **Eine Wallet- oder Custody-Integration.** Eine Integration, die Schlüssel für Nutzer hält, muss wissen, dass der secp256k1-Schlüssel allein auf der EVM-Lane nicht ausgeben kann. Sie öffnet enge Fenster (`nativeOnly` oder `allowedTargets`), signiert mit dem ML-DSA-87-Schlüssel des Kontos, **heute** mit `openEvmWindowMsg` aus `@qorechain/sdk` 0.10.0.
7. **Maintainer von EVM-Werkzeugen.** Maintainer von viem, Sourcify oder Scaffold-ETH 2 können die vorbereiteten Beitragsdateien lesen, um die Chain-IDs 9800 und 9801 hinzuzufügen.

## Funktionsweise {#how-it-works}

- **Die Autorisierungsregel.** Die Chain lässt eine EVM-Transaktion von einem Konto zu, das einen registrierten ML-DSA-87-Schlüssel und ein aktives Fenster hat, und lehnt sie sonst ab. Die Regel ist das Protokollfeature `evm-pqc-authorisation-window`, auf beiden Netzwerken aktiviert; lesen Sie es unter `/qorechain/pqc/v1/protocol_features`. Siehe [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window) und [den Leitfaden zur ersten Transaktion](/getting-started/first-transaction#evm-window).
- **Öffnen und Schließen.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) öffnet ein Fenster, hybrid signiert; das Öffnen eines Fensters ersetzt jedes frühere. `MsgCloseEVMWindow` schließt es.
- **Was ein Fenster begrenzt.** Blöcke (eine Blockanzahl, keine Dauer), EVM-Transaktionen und eine uqor-Summe, die den Wert plus die maximale Gebühr (Gaslimit mal Gebührenobergrenze) jeder zugelassenen Transaktion abdeckt. `nativeOnly` und `allowedTargets` schränken es weiter ein (siehe [Ein Fenster eingrenzen](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** Die native Sequenz und die EVM-Nonce sind derselbe Zähler. Das Öffnen eines Fensters erhöht ihn, also: Fenster öffnen, dann die Nonce lesen, dann die EVM-Transaktion signieren.
- **Der Vorlagen-Helfer.** In `foundry` und `hardhat` leitet `pnpm window` das Konto aus `PRIVATE_KEY` (oder `QORE_MNEMONIC`) ab, leitet seinen ML-DSA-87-Schlüssel aus demselben Geheimnis ab, registriert den Schlüssel einmal (`register`) und sendet `MsgOpenEVMWindow` hybrid signiert (`open`). Standardmäßig bemisst er ein Fenster von 600 Blöcken und 5 Transaktionen für Transaktionen mit bis zu 3.000.000 Gas bei einer Gebührenobergrenze von 250 gwei.
- **CosmWasm auf QoreChain Native.** Der Code-Upload läuft auf beiden Netzwerken über Governance (`code_upload_access` ist `Nobody`): Code wird durch einen Governance-Vorschlag gespeichert, der `MsgStoreCode` mit dem Governance-Modul als Absender trägt. Das Instanziieren ist auf dem Testnet für alle offen und auf dem Mainnet geschlossen (`instantiate_default_permission` ist auf dem Testnet `Everybody` und auf dem Mainnet `Nobody`, gelesen am 27. Oktober 2026). Lesen Sie beides unter `/cosmwasm/wasm/v1/codes/params`; gespeicherte Codes listen Sie unter `/cosmwasm/wasm/v1/code` auf. Das Mainnet hatte am 27. Oktober 2026 keine gespeicherten Codes.

## QoreChain-EVM im Vergleich zu Ethereum {#evm-differences}

Am 27. Oktober 2026 von den öffentlichen Endpunkten gelesen (SDK-Leitfaden `evm-differences.md`). Der Netzwerkzustand (Gebühren, Blockzeiten, aktive Precompiles) ist datiert; lesen Sie ihn live, bevor Sie sich darauf verlassen.

- **Senden.** Jede EVM-Transaktion braucht einen registrierten ML-DSA-87-Schlüssel und ein offenes Fenster für ihren Absender, ohne Ausnahmen pro Konto. Deploys, Überweisungen und Vertragsaufrufe sind alle abgedeckt. Ein Konto mit registriertem Schlüssel hat auch auf der nativen Lane keinen Pfad mit klassischer Signatur: Jede native Transaktion, die es signiert, ist hybrid.
- **Simulation.** `eth_call` und `eth_estimateGas` brauchen kein Fenster.
- **Transaktionstypen.** Die Typen 0 (Legacy), 1 (Access List), 2 (EIP-1559) und 4 (EIP-7702) werden akzeptiert. **EIP-4844-Blob-Transaktionen (Typ 3) werden abgelehnt.** Cancun-Opcodes funktionieren, aber `blobGasUsed` und `excessBlobGas` sind immer 0, `eth_blobBaseFee` existiert nicht und das Point-Evaluation-Precompile (`0x0a`) liefert einen Fehler.
- **Forks.** Bis London ab Genesis; Shanghai, Cancun und Prague sind aktiv; Osaka ist nicht aktiv.
- **PREVRANDAO (EIP-4399) ist eine Konstante** (`0xff...ff`) und der Header-`mixHash` ist null. Verwenden Sie es nie als Zufall.
- **EIP-7702** wird mit einer QoreChain-Regel akzeptiert: Jede Authority, deren Delegation wirksam würde, braucht einen registrierten PQC-Schlüssel und eine einmal verwendbare Zustimmung, aufgezeichnet mit `MsgAuthorizeEVMDelegation` (höchstens 8 Autorisierungen pro Transaktion, keine doppelte Authority). Das Fenster des Sponsors zählt nicht als Zustimmung der Authorities. `MsgClearEVMDelegation` entfernt eine Delegation. Siehe [EIP-7702-Zustimmung](/sdk/guides/evm#evm-delegation-consent).
- **Finalität.** Blöcke sind final, sobald sie committet sind: `latest`, `safe` und `finalized` liefern denselben Block, ohne Reorgs und ohne Uncles.
- **Gebühren (beide Netzwerke, 27. Oktober 2026).** `eth_gasPrice` 112,5 gwei; Base Fee 100 gwei (die Chain-Untergrenze von 0,1 uqor pro Gas); `eth_maxPriorityFeePerGas` 12,5 gwei; Header-`gasLimit` 4.294.967.295. Werkzeuge, die die Gebührenobergrenze nahe beim Doppelten der Base Fee setzen (Foundry tut das), binden bis zu etwa 200 gwei pro Gas am Fenster, während sie etwa 112,5 gwei zahlen.
- **JSON-RPC-Namespaces.** `eth`, `net`, `web3` und `txpool`. Jede Methode von `debug_*`, `personal_*`, `admin_*` und `miner_*` ist nicht verfügbar (`-32601`), ebenso `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` und `eth_config`. Werkzeuge, die Traces brauchen, funktionieren gegen die öffentlichen Endpunkte nicht.
- **Abweichendes Verhalten.** `eth_getProof` funktioniert, liefert aber die IAVL-Beweise der Chain, keine Merkle-Patricia-Beweise. `eth_getLogs` deckt höchstens 10.000 Blöcke pro Abfrage ab. `eth_subscribe` funktioniert nur über WebSocket. `eth_accounts`, `eth_sign` und `eth_sendTransaction` werden abgelehnt, weil der Node keine Konten hält: lokal signieren und `eth_sendRawTransaction` verwenden. `txpool_content` wird auf den öffentlichen Endpunkten abgelehnt; `txpool_status` funktioniert. `web3_clientVersion` ist kein verlässlicher Weg, den Node zu erkennen.
- **Guthaben.** `eth_getBalance` liefert das Bank-Guthaben in uqor mal 10^12 plus einen etwaigen Rest unterhalb von uqor.
- **Precompiles.** Die Standard-Precompiles von Ethereum antworten wie üblich. `pqcVerify` (`0x0A01`) und `pqcKeyStatus` (`0x0A02`) sind **nur auf dem Testnet aktiv**; auf dem Mainnet ist keines aktiv, und eine Aktivierung bräuchte eine Governance-Entscheidung, ohne Datum. Das Testnet listet außerdem `0x0C01` (`rlConsensusParams`). Ein Aufruf eines inaktiven Precompiles liefert leere Daten, statt zu reverten, lesen Sie daher `active_static_precompiles` unter `/cosmos/evm/vm/v1/params`, bevor Sie sich auf eines verlassen. Siehe [EVM-Precompiles](/developer-guide/evm-precompiles#network-status).
- **Werkzeuge.** QoreChain ist noch nicht in `viem/chains`: Importieren Sie die Chains aus `@qorechain/evm` (ab 0.11.0). Sourcify listet die Chain-IDs 9800 und 9801 noch nicht. Die SVM-Lane ist nicht geöffnet.

## Anwendung {#how-to-use}

Alle lesenden Snippets verwenden das öffentliche Testnet (`qorechain-diana`, EVM-Chain-ID 9800), brauchen keinen Schlüssel und senden nichts. Das Test-ERC-20 unter `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` ist ein Testnet-Token (Symbol `WQOR`, 18 Dezimalstellen); ersetzen Sie es und die Adresse durch Ihre eigenen.

### Installation pro Sprache {#install}

| Sprache oder Werkzeug | Installation | Status | Mindestplattform |
|---|---|---|---|
| TypeScript, EVM-Lesezugriffe und ERC-Helfer | `npm install @qorechain/evm viem` (löst zu 0.8.0 auf, das keine Chain-Definitionen und keine Fensterhelfer hat) | Heute live | Node.js 20 oder neuer; Peer `viem ^2` |
| TypeScript, die Fensternachricht signieren | `npm install @qorechain/sdk` (0.10.0 hat `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Heute live | Node.js 20 oder neuer |
| TypeScript, viem-Chain-Definitionen und Fensterhelfer | noch keine | **Kommend (0.11.0)** | Node.js 20 oder neuer |
| Scaffolder, Vorlagen `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Heute live (0.10.0) | Node.js 20 oder neuer |
| Scaffolder, Vorlagen `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | noch keine | **Kommend (0.11.0)** | Foundry und Node.js 20; Node.js 22 für Hardhat 3; Rust und Docker für `cosmwasm` |
| Python (EVM-Lesezugriffe) | `pip install "web3>=7,<8"`; Fensternachricht aus `qorechain-sdk` 0.10.0 | Heute live | Python 3.10 oder neuer |
| Go (EVM-Lesezugriffe) | `go get github.com/ethereum/go-ethereum@latest`; Fensternachricht aus dem QoreChain Go SDK v0.10.0 | Heute live | Go-Toolchain |
| Rust (EVM-Lesezugriffe) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }`; Fensternachricht aus dem Crate `qorechain-sdk` 0.10.0 | Heute live | Rust stable |
| Java (EVM-Lesezugriffe) | `org.web3j:core:5.0.0`; Fensternachricht aus `io.github.qorechain:qorechain-sdk:0.10.0` | Heute live | JDK 21 (das QoreChain Java SDK wird mit einer JDK-21-Toolchain gebaut) |

### Quickstart 1: Lesen mit ethers v6 (heute live) {#quickstart-ethers}

Es ist kein QoreChain-Paket nötig. Am 27. Oktober 2026 gegen das Testnet ausgeführt, gab es `chain id: 9800n`, ein Guthaben und `token: WQOR 18n` aus.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

Dasselbe Lesen in web3.py, go-ethereum, alloy und web3j steht im SDK-Leitfaden `evm-quickstarts.md` (dort als getestet mit web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 und web3j 5.0.0 auf JDK 21 angegeben; diese Seite hat sie nicht erneut ausgeführt).

### Quickstart 2: Lesen mit dem veröffentlichten `@qorechain/evm` 0.8.0 (heute live) {#quickstart-evm-080}

Getesteter Quickstart aus dem Developer Hub. Er verbindet sich, erkennt die EVM-Chain-ID automatisch und gibt das QOR-Guthaben des öffentlichen Testnet-Faucet-Kontos aus.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Quickstart 3: Lesen mit der viem-Chain-Definition (ab 0.11.0, kommend) {#quickstart-viem}

Das läuft heute nicht von npm aus, weil 0.8.0 kein `qorechainTestnet` hat. Am 27. Oktober 2026 mit der 0.11.0-Chain-Definition ausgeführt, die aus dem Repository-Quellcode (nicht von npm) geladen wurde, gab es `chain id: 9800` und den Token `WQOR` aus.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Quickstart 4: Ein Fenster prüfen und die Öffnungsnachricht zusammensetzen (ab 0.11.0, kommend) {#quickstart-window-helpers}

Aus dem README von `@qorechain/evm` beim Tag v0.11.0. Es liest und baut dann ein Nachrichtenobjekt; es signiert und sendet nicht. Für ein Konto ohne Fenster liefert `evmWindowStatus` `found: false, live: false` (am 27. Oktober 2026 auf beiden Netzwerken geprüft).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Quickstart 5: Ein Fenster aus TypeScript öffnen (heute live, SDK 0.10.0 und später) {#quickstart-open-window}

Aus dem SDK-Leitfaden `evm-quickstarts.md`, "Before you send". Dies **sendet eine Transaktion der nativen Lane**: Führen Sie es nur mit Ihrem eigenen finanzierten Testkonto aus, nie mit einer gemeinsam genutzten oder öffentlichen Phrase.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Dieses Snippet wurde für diese Seite nicht erneut ausgeführt. `maxValue: "3750000"` entspricht 5 Transaktionen zu je 3.000.000 Gas bei einer Gebührenobergrenze von 250 gwei.

### Quickstart 6: Ein Projekt mit dem live verfügbaren Scaffolder erzeugen {#quickstart-scaffold-live}

Am 27. Oktober 2026 in einem leeren Verzeichnis mit `npx` aus der öffentlichen npm-Registry getestet (0.10.0, Vorlage `fullstack-web`): Es erzeugte das Projekt, und der Build gelang.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### Die neuen Vorlagen (ab 0.11.0, kommend) {#new-templates-usage}

Sobald 0.11.0 veröffentlicht ist, akzeptiert der Scaffolder die vier neuen Vorlagennamen (siehe die Flag-Tabelle unten). Ein Projekt `foundry` baut und testet dann lokal mit `forge build` und `forge test` (ohne Netzwerk), und `pnpm window status` liest das Konto, seinen PQC-Schlüssel und sein Fenster. `pnpm window register` und `pnpm window open` senden Transaktionen der nativen Lane von Ihrem eigenen finanzierten Konto, und `forge script ... --broadcast` deployt. Legen Sie nie einen echten Schlüssel in `.env.example`, committen Sie nie `.env`, und finanzieren Sie nie die öffentliche BIP-39-Testphrase (`abandon` elfmal wiederholt, dann `about`).

## Haupt-API {#main-api}

### `@qorechain/evm` (ab 0.11.0) {#api-evm}

| Name | Was es tut |
|---|---|
| `qorechain`, `qorechainTestnet` | viem-Chain-Objekte für 9801 und 9800 mit öffentlichen Endpunkten und Explorer. |
| `QORECHAIN_CHAINS` | Beide Chains (Mainnet, dann Testnet), für wagmi oder RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | EVM-Chain-ID zu REST-URL der nativen Lane. |
| `evmWindowStatus` | Liest ein Fenster über REST: `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Parst die REST-Antwort. |
| `openEvmWindowMessage` | Prüft Grenzen und baut `MsgOpenEVMWindow` als `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | Nur die Grenzprüfungen. |
| `evmWindowCost`, `weiToUqorCeil` | Fensterbemessung in uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Erklären eine Ablehnung: `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Konvertieren zwischen `0x` und `qor1...` für dasselbe Konto. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Konstanten. |
| `@qorechain/evm/window` | Die Fensterhelfer ohne die viem-Abhängigkeit. |

`@qorechain/evm` signiert und sendet keine Transaktionen der nativen Lane; verwenden Sie dafür `@qorechain/sdk` oder die Sprach-SDKs.

### Ein Fenster in jedem SDK bauen und lesen (heute live, 0.10.0) {#api-window}

| Sprache | Ein Fenster öffnen | Ein Fenster lesen |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`); `openEvmWindowMessage` (`@qorechain/evm`, ab 0.11.0) | `fetchEvmWindow`; `evmWindowStatus` (ab 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` für `nativeOnly` oder `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

EIP-7702-Zustimmung (TypeScript, `@qorechain/sdk` 0.10.0): `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 ergänzt `PqcStatusBadge` (Standardbeschriftungen "PQC key registered" und "No PQC key").

### Flags von `create-qorechain-dapp` {#api-scaffolder}

| Flag | Was es tut |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (heute live); `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (ab 0.11.0). |
| `--network <name>` | Voreinstellung `testnet` oder `mainnet`. |
| `--package-manager <pm>` | `pnpm`, `npm` oder `yarn`. |
| `-y, --yes` | Eingabeaufforderungen überspringen und Standardwerte verwenden. |
| `--no-install` | Abhängigkeiten nicht installieren. |
| `-h, --help` / `-v, --version` | Hilfe und Version. |

### Vorlagen-Skripte (ab 0.11.0) {#api-template-scripts}

| Vorlage | Skript | Was es tut |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Zeigt das Konto, ob sein ML-DSA-87-Schlüssel registriert ist (und ob es dieser Schlüssel ist) und sein Fenster. |
| `foundry`, `hardhat` | `pnpm window register` | Registriert den ML-DSA-87-Schlüssel des Kontos, einmal pro Konto. |
| `foundry`, `hardhat` | `pnpm window open` | Öffnet ein Fenster (Standard 600 Blöcke, 5 Transaktionen). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Hardhat-Build, Tests, Ignition-Deploy auf `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Dev-Server auf `http://localhost:5173`; Produktions-Build. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Optimierter Build, Governance-Upload-Vorschlag, Instanziieren (Testnet), REST-Abfragen. |

Umgebungsvariablen der Vorlagen (in `.env`, nie committet): `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` oder `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL`; `QORE_CODE_ID` und `QORE_I_KNOW_THIS_IS_MAINNET=yes` für die CosmWasm-Skripte (das Vorschlagsskript lehnt das Mainnet ohne Letzteres ab); `VITE_WALLETCONNECT_PROJECT_ID` für eine WalletConnect-Wallet in `viem-wagmi`.

## Zugang {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Native Chain-ID | `qorechain-diana` | `qorechain-vladi` |
| EVM-Chain-ID (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| EVM-WebSocket | `wss://evm-ws-testnet.qore.host` | nicht veröffentlicht |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Consensus RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorer | `https://explore.qore.network` | `https://explore.qore.network` |

- **Lesezugriffe** brauchen nichts: kein Konto, keinen Schlüssel, kein Fenster.
- **Senden auf der EVM-Lane** braucht ein finanziertes Konto, seinen on-chain registrierten ML-DSA-87-Schlüssel (einmalig) und ein offenes Fenster. Die Schlüsselregistrierung und das Fenster sind Transaktionen der nativen Lane.
- **Kosten.** Die Gebühren-Untergrenze beträgt auf beiden Netzwerken 0,1 uqor pro Gas. Lesen ist kostenlos. Testnet-QOR gibt es über den [Faucet](/dashboard/faucet).
- **CosmWasm.** Auf keinem der Netzwerke Code-Upload ohne Governance; auf dem Mainnet kein Instanziieren ohne Governance. Das Mainnet hatte am 27. Oktober 2026 keine gespeicherten Codes.
- **Node- und Werkzeugversionen.** Siehe die Installationstabelle oben.

## Wo es veröffentlicht ist {#where-published}

Versionen am 27. Oktober 2026 live aus jeder Registry gelesen. Das GitHub-Tag `v0.11.0` existiert (27. Oktober 2026), ein GitHub-Release-Objekt dafür gibt es noch nicht (das neueste Release ist v0.10.0).

| Registry | Paket | Heute live befindliche Version | Status von 0.11.0 | Link |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **ausstehend, nicht veröffentlicht** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **ausstehend, nicht veröffentlicht** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **ausstehend, nicht veröffentlicht** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **ausstehend, nicht veröffentlicht** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (Vorlagen `evm-solidity`, `fullstack-web`, `rollup-app`) | **ausstehend, nicht veröffentlicht** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (verwendet von `viem-wagmi`) | 0.1.0 | nicht Teil von 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | nicht Teil von 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | nicht Teil von 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Go-Proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | nicht Teil von 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | nicht Teil von 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Quelle: [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), Tag `v0.11.0`; Pfade `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, gepflegt von der QoreChain Association.

## Einschränkungen und bekannte Probleme {#limits}

- **0.11.0 ist noch nicht auf npm.** Alles, was mit "ab 0.11.0" markiert ist (die viem-Chain-Definitionen, die Fensterhelfer, `@qorechain/evm/window`, die vier neuen Vorlagen, `PqcStatusBadge`), lässt sich heute nicht aus einer Registry installieren. Die neuen Vorlagen hängen von Paketen `^0.11.0` ab, sodass sich selbst ein Scaffold aus dem Repository erst nach der Veröffentlichung von npm installieren lässt. Diese Seite ändert sich, sobald npm 0.11.0 ausliefert.
- **0.11.0 ändert allein npm-Pakete.** Python, Rust, Go und Java bleiben bei 0.10.0, das die oben aufgeführten Fenster-Builder bereits enthält.
- **`@qorechain/evm` liest das Fenster und setzt die Nachricht zusammen; es signiert und sendet** Transaktionen der nativen Lane **nicht**.
- **Kein Helfer öffnet vor einem Senden automatisch ein Fenster**, aus Absicht.
- **Die QoreX-Wallet in der Vorlage `viem-wagmi`** beantwortet `eth_chainId`, `eth_accounts`, `eth_requestAccounts` und `wallet_switchEthereumChain`; ihre EVM-Signiermethoden sind noch nicht verfügbar. Nutzen Sie sie zum Verbinden und Lesen und signieren Sie mit einer injizierten EIP-1193-Wallet.
- **Der Helfer `pnpm window` der Vorlagen leitet den ML-DSA-87-Schlüssel aus demselben Geheimnis wie den EVM-Schlüssel ab.** Wurde der Schlüssel des Kontos von einer anderen Wallet registriert, öffnen Sie das Fenster stattdessen von dieser Wallet aus.
- **Auf den öffentlichen Endpunkten nicht verfügbar:** Blob-Transaktionen, Tracing und die Namespaces `debug`, `personal`, `admin` und `miner`.
- **Der CosmWasm-Upload läuft auf beiden Netzwerken über Governance**; die Vorlage `cosmwasm` kann Code nicht selbst speichern.
- **Beiträge zu anderen Werkzeugen** (viem, Sourcify, Scaffold-ETH 2) sind vorbereitete Dateien im Repository, nicht upstream eingepflegt.
- **EVM-Precompiles auf dem Mainnet:** Keines ist aktiv. `pqcVerify` (`0x0A01`) und `pqcKeyStatus` (`0x0A02`) sind nur auf dem Testnet aktiv.
- **Der Netzwerkzustand ist datiert.** Die Zahlen zu Gebühren und Blockzeiten wurden am 27. Oktober 2026 gelesen.

## Sicherheitshinweise {#security}

- Das Fensterdesign bedeutet, dass der secp256k1-Schlüssel, den eine EVM-Bibliothek hält, allein nie Ausgaben autorisieren kann: Das Öffnen eines Fensters braucht eine hybride Signatur mit dem ML-DSA-87-Schlüssel des Kontos. Halten Sie Fenster klein (`blocks`, `maxTxs`, `maxValue`) und verwenden Sie `nativeOnly` oder `allowedTargets`, wo immer möglich.
- `maxValue` enthält die maximale Gebühr jeder Transaktion; bemessen Sie es mit `evmWindowCost` und nicht allein nach dem Wert.
- Die Vorlagen lesen Schlüssel aus `.env`, das von git ignoriert wird; `.env.example` enthält Platzhalter. Hardhat-Nutzer können den Schlüssel verschlüsselt mit `npx hardhat keystore set PRIVATE_KEY` ablegen.
- Finanzieren Sie nie die öffentliche BIP-39-Testphrase (`abandon` elfmal wiederholt, dann `about`).
- Veröffentlichen Sie für einen CosmWasm-Vorschlag auf dem Mainnet den Quellcode und einen reproduzierbaren Build (der Optimizer gibt die Prüfsumme aus), damit Abstimmende die Binärdatei verifizieren können.
- Melden Sie Schwachstellen vertraulich an security@qore.network.

## Verwandte Seiten {#related}

- [Übersicht der Entwicklerpakete](/developer-tools/overview) und [Scaffolder und CLI](/developer-tools/scaffolders-and-cli) (das live verfügbare `create-qorechain-dapp` 0.10.0)
- [SDK-Übersicht](/sdk/overview), [SDK-Installation](/sdk/install) und der [EVM-Leitfaden](/sdk/guides/evm) (Fenster, eingegrenzte Fenster, EIP-7702-Zustimmung, Precompiles)
- [EVM-Entwicklung](/developer-guide/evm-development) und [EVM-Precompiles](/developer-guide/evm-precompiles#network-status)
- [QoreChain-Native-Entwicklung](/developer-guide/cosmwasm-development) (CosmWasm und Governance-Vorschläge)
- [QoreX-Integrationen](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (hybrides Signieren auf der nativen Lane)
- [QoreScan](/developer-tools/qorescan) (Inventar der Verwendung von `ecrecover` und PQC-Precompiles in Solidity-Quellen)
