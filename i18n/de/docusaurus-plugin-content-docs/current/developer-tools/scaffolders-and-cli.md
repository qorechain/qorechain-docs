---
slug: /developer-tools/scaffolders-and-cli
title: Projekt-Scaffolder und die qorollup-CLI
sidebar_label: Scaffolder und CLI
sidebar_position: 21
---

# Projekt-Scaffolder und die `qorollup`-CLI

Drei Kommandozeilen-Werkzeuge bringen ein QoreChain-Projekt aus dem Nichts zu einem typisierten, baubaren Ausgangspunkt. Sie richten sich an Anwendungsentwickler (dApps) und Rollup-Betreiber, die in Node.js arbeiten:

* **`create-qorechain-dapp`** (0.12.0) erzeugt per Scaffolding eine dApp aus einer von sieben Vorlagen, aufbauend auf dem [QoreChain SDK](/sdk/overview). Vier der sieben (`foundry`, `hardhat`, `viem-wagmi`, `cosmwasm`) gehören zum [Chain Developer Kit](/developer-tools/chain-dev-sdk).
* **`create-qorechain-rollup`** (0.8.0) erzeugt per Scaffolding ein Rollup-Projekt aus einer von sechs Vorlagen, aufbauend auf dem TypeScript-[Rollup Development Kit](/rollups/overview).
* **`qorollup`**, der Befehl des Pakets `@qorechain/rdk-cli` (0.8.0), ist die Betreiber-Kommandozeile: Preflight-Prüfungen, Erstellen und Überwachen eines Rollups, Lesen der Live-Parameter.

Die Seite gibt die veröffentlichten Pakete so wieder, wie sie am 27. Oktober 2026 aus npm installiert wurden, und `create-qorechain-dapp` 0.12.0, wie es am 4. November 2026 installiert wurde. Die konzeptionellen Anleitungen sind [Ein Rollup bereitstellen](/rollups/deploying-a-rollup) und die [SDK-CLI-Referenz](/sdk/reference/cli).

## Innovationen {#innovations}

* **Nicht-interaktives Scaffolding für CI.** Jede Abfrage hat ein Flag: `--template`, `--network`, `--package-manager`, `--yes` (Standardwerte akzeptieren) und `--no-install`. Eine Pipeline kann ein Projekt mit einem Befehl und ohne Terminal erzeugen und bauen.
* **Die Vorlagen sind an die aktuellen Pakete gepinnt.** Die dApp-Vorlagen hängen von `@qorechain/sdk` `^0.12.0` ab (die EVM-Vorlagen zusätzlich von `@qorechain/evm` `^0.12.0`) und die Rollup-Vorlagen von `@qorechain/rdk` `^0.8.0`. Ein früherer Scaffolder (0.8.0) schrieb Bereiche, die zu einem SDK aufgelöst wurden, das für die Live-Netzwerke nicht signieren konnte; mit dem aktuellen passiert das nicht.
* **Rollup-Vorlagen kodieren pro Anwendungsfall eine gültige Konfiguration.** Jede Rollup-Vorlage setzt eine Kombination aus Settlement, Sequencer, Data Availability, Gas und VM, die die Kompatibilitätsmatrix des RDK akzeptiert, und der Scaffolder gibt den aktuellen Stake und den Burn bei der Erstellung aus, bevor Sie etwas erstellen.
* **Ein Preflight-Befehl, der benennt, was fehlt.** `qorollup doctor` (und `npm run doctor` innerhalb einer Rollup-Vorlage) prüft, ob der REST-Endpunkt antwortet, ob die Modulparameter gelesen werden können, ob der Endpunkt das Netzwerk ist, das Sie angefordert haben, und ob ein Signer konfiguriert ist, und gibt pro Prüfung eine Zeile aus. Innerhalb einer Vorlage validiert er außerdem die Rollup-Konfiguration gegen die Kompatibilitätsmatrix.
* **Hybride Signierung in die Vorlagen eingebunden.** Die Rollup-Vorlagen verbinden sich über eine kleine `signer.ts`, die den ML-DSA-87-Schlüssel des Kontos aus Ihrer Mnemonic ableitet (oder einen Seed bei einem rohen privaten Schlüssel übernimmt) und hybrid signiert, was die Netzwerke auf der Native-Lane verlangen. Die dApp-Vorlage `rollup-app` tut dasselbe und läuft als Trockenlauf, sofern Sie nicht `QORE_BROADCAST=1` setzen.
* **Trockenläufe.** `qorollup create ... --dry-run` validiert die Konfiguration, gibt den Stake und den Burn aus und nennt, dass es `MsgCreateRollup` einreichen würde, ohne zu senden.
* **Maschinenlesbare Ausgabe.** `qorollup ... --json` gibt JSON für Skripte aus.

## So nutzen Sie es {#how-to-use}

### Eine dApp per Scaffolding erzeugen {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Vorlage | Was sie erzeugt | Skripte |
| --- | --- | --- |
| `evm-solidity` | Ein Solidity-`Counter`-Contract mit vorkompiliertem Artefakt und ein viem-Skript, das ihn bereitstellt und mit `@qorechain/evm` aufruft. Dateien: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | Eine Vite-, React- und TypeScript-Seite, die mit `@qorechain/sdk` die Guthaben einer Adresse (und eine Tokenomics-Übersicht) liest. Dateien: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Ein Node-Skript, das `createRollupClient` und `createMultilayerClient` des SDK verwendet, um Nachrichten für Rollups und Sidechains oder Paychains zu bauen. Dateien: `src/index.ts` und die übliche Konfiguration. Standardmäßig ein Trockenlauf. | `start`, `typecheck` |
| `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | Die Vorlagen des Chain Developer Kit: ein Foundry-Projekt, ein Hardhat-3- und viem-Projekt (beide mit einem `pnpm window`-Helfer für das EVM-Autorisierungsfenster), eine wagmi- und RainbowKit-dApp mit der QoreX-Wallet und ein CW20-Token auf QoreChain Native. Details, Skripte und Grenzen: [Chain Developer Kit](/developer-tools/chain-dev-sdk#templates). | siehe diese Seite |

| Flag | Bedeutung |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app`, `foundry`, `hardhat`, `viem-wagmi` oder `cosmwasm` |
| `--network <name>` | `testnet` oder `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` oder `yarn` |
| `-y, --yes` | Abfragen überspringen und Standardwerte verwenden |
| `--no-install` | Abhängigkeiten nicht installieren |
| `--local` | `@qorechain/*`-Abhängigkeiten im SDK-Monorepo auf lokale Links umschreiben (für SDK-Mitwirkende) |
| `-h, --help`, `-v, --version` | Hilfe, Version |

Getestetes Beispiel (aus dem Entwicklerhub; am 27. Oktober 2026 in einem leeren Verzeichnis ausgeführt, mit `npx` aus der öffentlichen npm-Registry): Es erzeugt die Web-Vorlage und baut sie. Beobachtet: `Done! Created my-dapp` und ein erfolgreiches `vite build`. Der Build gibt eine Warnung zur Bundle-Größe aus, die harmlos ist.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Bevor Sie die Web-App ausführen, öffnen Sie die erzeugte `.env`: Sie verweist auf `http://localhost:1317` und `http://localhost:8545`, setzen Sie also `VITE_QORE_REST_URL` auf `https://api-testnet.qore.host` (oder `https://api.qore.host` für das Mainnet) und `VITE_QORE_EVM_RPC_URL` auf `https://evm-testnet.qore.host` (oder `https://evm.qore.host`).

### Ein Rollup-Projekt per Scaffolding erzeugen {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Vorlage | Profil | Settlement / Sequencer / DA / Gas / VM | Zusätzliche Dateien |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | ein Referenz-Prover (`src/prover.ts`) und eine Demo-Schaltung unter `circuits/` |
| `gaming-rollup` | gaming | based, based, native, flat gas, custom VM | keine |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, mit einem Challenge-Ablauf | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, subsidized gas, EVM | keine |
| `custom-rollup` | custom | vollständig parametrisiert, jedes Feld dokumentiert | keine |
| `multivm-rollup` | multivm | ein EVM-Rollup, das QoreChain-Native-Contracts über den Cross-VM-Precompile aufruft | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Jede Vorlage enthält `rollup.config.ts` (die Konfiguration), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` und `.env.example`, eine README und eine `.github/workflows/deploy.yml`. Skripte: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. Die voreingestellten Profile werden unter [Voreingestellte Profile](/rollups/preset-profiles) erläutert.

Die Optionen sind dieselben wie beim dApp-Scaffolder, mit den sechs oben genannten Vorlagennamen. Die Vorlage `multivm-rollup` wird von `--help` aufgeführt, aber nicht in der README des Pakets, die fünf aufführt.

Getestetes Beispiel (Entwicklerhub, 27. Oktober 2026, `npx` aus npm in einem leeren Verzeichnis). Beobachtet: `Created my-rollup (defi-rollup template)` und ein bestandenes `tsc --noEmit`. Dasselbe Scaffolding und `npm run typecheck` wurden am selben Tag mit 0.6.2 wiederholt, mit demselben Ergebnis.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

Nächste Schritte, wie der Scaffolder sie ausgibt: `npm install`, den Operator-Schlüssel in `.env` eintragen, `npm run doctor`, `npm run create`, `npm run query-status`. Die erzeugte `.env` enthält bereits die öffentlichen Testnet-Endpunkte (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) und leere Schlüsselfelder: `QORE_MNEMONIC` oder `QORE_OPERATOR_PRIVATE_KEY_HEX` (mit `QORE_PQC_SEED_HEX` für den Post-Quanten-Seed). Committen Sie diese Datei niemals.

### Die `qorollup`-CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # gibt die installierte Version aus (aktuell ist 0.8.0)
qorollup doctor --network testnet
```

Sie können sie auch ohne Installation ausführen: `npx @qorechain/rdk-cli doctor`.

| Befehl | Was er tut |
| --- | --- |
| `doctor` | Preflight: Endpunkte, Modulparameter, Netzwerkabgleich, Signer, Guthaben, Konfiguration |
| `params` | die Live-Modulparameter ausgeben |
| `create --rollup-id <id>` | ein Rollup erstellen (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | Status und Gesundheit, oder eine Live-Ansicht (`--interval <ms>`) |
| `advise <id>` | Empfehlung vom QCAI Copilot (siehe [QCAI Copilot](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | ein Profil für einen Anwendungsfall vorschlagen |
| `receipt <id> <batch>` | einen Settlement-Beleg bauen (`--verify`, `--out <file>`), siehe [Settlement-Belege](/rollups/settlement-receipts) |
| `watchtower <id>` | Challenger-Framework für Optimistic Rollups, siehe [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | Lebenszyklus-Übergänge (nur der Ersteller) |
| `keygen` | einen Operator-Schlüssel erzeugen (Mnemonic und Adresse) |
| `manifest export`, `manifest import` | ein Rollup-Manifest exportieren oder importieren |
| `withdraw --file <json>` | eine Auszahlung zusammenstellen und einreichen (`--dry-run`) |
| `faucet <address>` | Testnet-Mittel anfordern (braucht `QORE_FAUCET_URL`) |

Globale Flags: `--network testnet|mainnet` (Standard testnet), `--rest`, `--rpc`, `--evm-rpc` (Endpunkt-Überschreibungen, oder `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` oder `--key` (oder `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Führen Sie ihn vor allem aus, was eine Transaktion sendet. Am 27. Oktober 2026 mit 0.6.2 und ohne gesetzten Signer im Testnet beobachtete Ausgabe (das Mainnet gab dasselbe aus, mit `qorechain-vladi` und `https://api.qore.host`; das Werkzeug gibt lange Striche aus, hier als Bindestriche dargestellt):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

Eine Zeile, die mit `!` beginnt, ist eine Warnung und lässt den Lauf nicht fehlschlagen; ein fehlender Signer ist nur dann ein Problem, wenn Sie ein Rollup erstellen oder betreiben möchten. Der Befehl endet mit 0, wenn keine Prüfung fehlschlägt.

**Getestetes Beispiel.** Aus dem Entwicklerhub: die Live-Modulparameter ohne Schlüssel lesen. Es schlug mit 0.6.1 fehl (der Befehl gab nichts aus und endete mit 0) und wurde mit 0.6.2 erneut ausgeführt:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

Beobachtet mit 0.6.2 über `npx`, über eine globale Installation und über den lokalen Link `node_modules/.bin/qorollup` (und mit 0.7.0 über den lokalen Link, wo `qorollup --version` 0.7.0 ausgab): Die Modulparameter werden ausgegeben (maximale Rollups 200, Mindest-Stake 10000 QOR, Burn bei der Erstellung 1 %, Challenge-Fenster 3600 s, maximaler Data-Availability-Blob 2.097.152 Bytes, Blob-Aufbewahrung 432.000 Blöcke, maximal 10 Batches pro Block). Ein ebenfalls beobachteter Trockenlauf einer Erstellung:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## So erhalten Sie Zugang {#how-to-access}

* **Voraussetzungen.** Node.js 20 oder neuer und ein Paketmanager. Die Scaffolder schreiben Dateien und installieren, sofern Sie nicht `--no-install` übergeben, Abhängigkeiten, benötigen also Netzwerkzugang zur npm-Registry. Die RDK-Clients für Python, Rust, Go und Java sind Bibliotheken und haben keinen Scaffolder; siehe [Ein Rollup bereitstellen](/rollups/deploying-a-rollup).
* **Netzwerke und Endpunkte.** Mainnet `qorechain-vladi` (EVM-Chain-ID 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Testnet `qorechain-diana` (Chain-ID 9800): dieselben Hosts mit `-testnet` nach dem ersten Label, zum Beispiel `https://api-testnet.qore.host`. Das Lesen von Daten, `doctor`, `params`, `suggest` und `--dry-run` brauchen kein Konto.
* **Konten und Schlüssel.** Alles, was eine Transaktion sendet, braucht ein finanziertes Operator-Konto und dessen Mnemonic oder privaten Schlüssel, bereitgestellt über Umgebungsvariablen oder Flags und niemals committet. Das Erstellen eines Rollups braucht den Mindest-Stake (10.000 QOR auf beiden Netzwerken, am 27. Oktober 2026 live gelesen), von dem 1 % bei der Erstellung verbrannt wird. `qorollup keygen` erzeugt einen neuen Schlüssel; im Testnet stammen Testmittel vom [Dashboard-Faucet](/dashboard/faucet) oder von `qorollup faucet` mit gesetzter `QORE_FAUCET_URL`.
* **Hybride Signatur.** Transaktionen der Native-Lane brauchen eine secp256k1-Signatur plus eine ML-DSA-87-Signatur. Die Vorlagen leiten den Post-Quanten-Schlüssel aus Ihrer Mnemonic ab; die Transaktionsbefehle von `qorollup` tun das nicht (siehe die Grenzen unten).
* **Kosten.** Die Werkzeuge sind kostenlos (Apache-2.0). On-chain liegt die Gebühren-Untergrenze bei 0.1 uqor pro Gas; der Rollup-Stake und der Burn oben gelten für die Erstellung.

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Link |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (Befehl `create-qorechain-dapp`) | 0.12.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (Befehl `create-qorechain-rollup`) | 0.8.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (Befehl `qorollup`) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (Bibliothek, die die Vorlagen verwenden) | 0.8.0 | https://www.npmjs.com/package/@qorechain/rdk |

Quellcode: https://github.com/qorechain/qorechain-sdk/tree/main/cli (dApp-Scaffolder), https://github.com/qorechain/qorechain-rdk/tree/main/cli (Rollup-Scaffolder) und https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). Das Release 0.8.0 des RDK ist auch auf PyPI, crates.io, Maven Central und dem Go-Modul-Proxy verfügbar (geprüft am 31. Oktober 2026). Alle stehen unter Apache-2.0.

## Grenzen und bekannte Probleme {#limits}

* **`--network mainnet` änderte die erzeugten Dateien in einem Testlauf nicht.** Am 27. Oktober 2026 wurden `fullstack-web` und `custom-rollup` mit `--network mainnet` erzeugt; die erzeugte `.env` enthielt weiterhin localhost-Endpunkte (dApp) oder `QORE_NETWORK=testnet` mit den Testnet-Endpunkten (Rollup), und die `App.tsx` der dApp erstellte einen `testnet`-Client. Am 4. November 2026 verhielt sich `create-qorechain-dapp` 0.12.0 bei `evm-solidity`, `fullstack-web` und `rollup-app` genauso. Setzen Sie das Netzwerk und die Endpunkte selbst in `.env` und, für die Web-Vorlage, in `src/App.tsx`.
* **Auf keinem der beiden Netzwerke existiert bisher ein Rollup** (geprüft am 27. Oktober 2026). Kein Transaktionspfad der Rollup-Werkzeuge wurde an einem Live-Rollup erprobt. Validieren Sie alles zuerst im Testnet und lesen Sie [RDK 0.8.0: Änderungen und Grenzen](/rollups/deploying-a-rollup#rdk-050-limits).
* **Die Vorlage `defi-rollup` kann keinen Batch abwickeln.** Das ZK-Settlement ist im Mainnet nicht nutzbar (die Schlüsselregistrierung gibt es nur im Testnet, seit Chain v3.2.7, und dort wurde noch kein ZK-Rollup ausprobiert), und ihre Demo-Schaltung könnte die Beweisprüfung der Chain ohnehin nicht bestehen. Ab 0.7.0 hält die Vorlage vor dem Senden an, sodass sie keine Gebühr mehr für einen Batch ausgibt, den die Chain immer ablehnt. Verwenden Sie eine Vorlage mit `optimistic`-Settlement, bis sich das ändert (siehe [ZK, STARK und Auszahlungen](/rollups/zk-stark-withdrawals)).
* **Die Vorlage `multivm-rollup` hängt von etwas ab, das nicht live ist.** Der Cross-VM-Precompile unter `0x0000000000000000000000000000000000000901` ist im Mainnet nicht aktiv, ein Aufruf aus einem Contract bewirkt dort also nichts; im Testnet ist er mit einer Allowlist aktiv (am 7. November 2026 wurde ein schreibgeschützter `eth_call` getestet); die Vorlage prüft das, und ihr Contract ist so geschrieben, dass er revertet, statt stillschweigend zu scheitern (siehe [Multi-VM](/rollups/multi-vm)).
* **Die Transaktionsbefehle von `qorollup` benötigen einen Post-Quanten-Schlüssel (ab 0.7.1).** `create`, `pause`, `resume`, `stop` und `withdraw` signieren hybrid (ML-DSA-87 + secp256k1), wie es beide Netzwerke verlangen, mit einem Schlüssel, der aus `--mnemonic` / `QORE_MNEMONIC` abgeleitet und mit der Chain abgeglichen wird, oder mit `--pqc-seed` / `QORE_PQC_SEED_HEX` zusammen mit `--key`; ohne einen solchen verweigert der Befehl das Senden. In 0.7.0 und früher signierten diese Befehle nur klassisch, und die Netzwerke lehnten jeden ab; aktualisieren Sie, oder verwenden Sie ein per Scaffolding erzeugtes Projekt (dessen Skripte hybrid signieren), das TypeScript-RDK mit einem `pqcKeypair` oder die Chain-CLI. Lesezugriffe, `doctor`, `params`, `receipt` und `--dry-run` brauchten nie einen Schlüssel. Live ungetestet: Es existiert kein Rollup.
* **Manche `qorollup`-Helfer haben noch nichts, mit dem sie sprechen können.** `advise` gab am 27. Oktober gegen das Testnet „advisory unavailable“ aus für die Oberflächen Gebühr, Netzwerk, Betrug und RL-Agent (der Knoten antwortete mit 501 oder „method does not exist“) und für ein Rollup, das nicht existiert. `suggest` lieferte ein Profil mit `source: fallback`, was anzeigt, dass die eingebaute Standardliste statt des Assistenzdienstes verwendet wurde. Lesen Sie die Warnungen.
* **`rollup-app` sendet nur, wenn Sie es verlangen.** Es führt standardmäßig einen Trockenlauf aus; mit `QORE_BROADCAST=1` registriert es den ML-DSA-87-Schlüssel des Kontos einmal und signiert hybrid. Seine Beispielwerte für das Rollup sind illustrativ: Nehmen Sie echte Profilnamen und den Stake aus [Voreingestellte Profile](/rollups/preset-profiles).
* **`fullstack-web` zeigt bei seiner Tokenomics-Schaltfläche einen Fehler.** Dieses Panel ruft eine JSON-RPC-Methode `qor_` auf, die die öffentlichen Endpunkte nicht bereitstellen; die Guthabenabfrage funktioniert. Ersetzen Sie sie durch einen REST-Lesezugriff wie `client.rest.getBurnStats()`.
* **`evm-solidity` braucht mehr als ein finanziertes Konto.** Das Senden einer EVM-Transaktion auf QoreChain braucht außerdem einen registrierten ML-DSA-87-Schlüssel und ein offenes EVM-Autorisierungsfenster, die von der Native-Lane aus eingerichtet werden (siehe den [EVM-Leitfaden](/developer-guide/evm-development#evm-window)). Das `deploy`-Skript der Vorlage wurde für diese Seite nicht gegen ein Live-Netzwerk ausgeführt.
* **`create-qorechain-dapp --version` gibt `0.5.1` aus**, obwohl das installierte Paket 0.12.0 ist (geprüft am 27. Oktober 2026 mit 0.10.0 und erneut am 4. November 2026 mit 0.12.0). Lesen Sie die Version aus `package.json` oder der Registry.
* **Die README-Dateien der Pakete sind veraltet.** Die README von `create-qorechain-dapp` führt zwei Vorlagen auf und die von `create-qorechain-rollup` fünf (geprüft am 27. Oktober 2026); `--help` zeigt sieben und sechs. Vertrauen Sie `--help`.
* **Versionen vor 0.6.2 funktionieren nicht aus npm.** `qorollup` 0.6.1 und früher, auf beliebige Weise über npm installiert, gab nichts aus und endete mit Code 0, und `--version` gab `0.4.1` aus. Wenn Sie bei 0.6.1 bleiben müssen, führen Sie `node node_modules/@qorechain/rdk-cli/dist/index.js <command>` aus; andernfalls aktualisieren Sie.
* **Abhängigkeitskopien (RDK 0.6.x und RDK 0.8.0 neben SDK 0.12.0).** `@qorechain/rdk` 0.6.2 und früher hängen von `@qorechain/sdk` `^0.9.0` ab, sodass ein Projekt, das zusätzlich SDK 0.10.0 installierte, eine zweite, verschachtelte SDK-0.9.x-Kopie enthielt. Ab 0.7.0 hängt das Kit von `@qorechain/sdk` `^0.10.0` ab und teilt sich eine Kopie mit einer App auf SDK 0.10.x. **Eine App auf SDK 0.12.0, die zusätzlich `@qorechain/rdk` 0.8.0 installiert, erhält weiterhin eine verschachtelte Kopie von SDK 0.10.0** (und von `@qorechain/evm` 0.8.0), weil ein Caret-Bereich auf einer 0.x-Version keine neueren Minor-Versionen übernimmt (geprüft mit `npm ls` am 4. November 2026). Halten Sie SDK-Aufrufe und RDK-Aufrufe in getrennten Modulen oder reichen Sie Objekte als reine Daten weiter, bis sich der RDK-Bereich ändert.
