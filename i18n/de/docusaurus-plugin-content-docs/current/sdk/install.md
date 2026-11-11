---
slug: /sdk/install
title: Installation
sidebar_label: Installation
sidebar_position: 2
---

# Installation

Installieren Sie das SDK für Ihre Sprache. Der TypeScript-Kern (`@qorechain/sdk`), die
EVM- und SVM-Adapter (`@qorechain/evm`, `@qorechain/svm`), das React-Kit
(`@qorechain/react`) sowie die Clients für Python, Go, Rust und Java sind allesamt
in ihren jeweiligen Registries **veröffentlicht** und bieten vollständige Parität mit der
nativen Chain (typisierte Nachrichten, Abfragen, der Tx-Lebenszyklus, hybride PQC-Transaktionen
sowie WebSocket-Abonnements). Die aktuelle Release ist **0.13.0**, veröffentlicht am 11. November 2026
(am 11. November 2026 gegen die Registries geprüft; Java ist die Ausnahme, siehe die
Tabelle):

| Registry | Paket | Version |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.13.0 |
| PyPI | `qorechain-sdk` (Import `qorsdk`) | 0.13.0 |
| crates.io | `qorechain-sdk` (Import `qorechain`) | 0.13.0 |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-sdk/packages/go` | v0.13.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | In Veröffentlichung: Maven Central zeigt am 11. November 2026 noch 0.12.0; verwenden Sie 0.13.0, sobald es erscheint (JDK 17 oder neuer) |

Für Python, Rust, Go und Java gibt es kein 0.11.0: Die npm-Pakete hatten am
29. Oktober 2026 ein 0.11.0 (das Chain Developer Kit, siehe unten), und jede Sprache wechselte
gemeinsam von 0.10.0 auf 0.12.0. 0.13.0 folgte am 11. November 2026 in jeder Sprache.

Wählen Sie unten Ihre Sprache.

## Upgrade-Hinweise {#upgrade}

:::danger Verwenden Sie auf den Live-Netzwerken SDK 0.8.1 oder neuer
Beide öffentlichen Netzwerke verifizieren die Form der **hybriden v2-Sign-Bytes**
(domänengetaggt und an die Chain-ID gebunden) und lehnen die alte Form mit `pqc`-Code 21 ab.
Jedes SDK-Release vor **0.8.0** signiert die alte Form, und **0.8.0** sucht die Umstellung
nur unter einem der beiden Upgrade-Namen, die die Netzwerke verwendet haben (das Mainnet
hat sie als `v3.2.0` verzeichnet, das Testnet als `v3.1.98` und später `v3.2.0`), und signiert
daher auf dem Mainnet die falsche Form. Verwenden Sie in jeder Sprache **0.13.0** (oder mindestens
**0.8.1**); **0.8.2 oder neuer** wird benötigt, um ein
[EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window) zu öffnen. Hybride Builder
akzeptieren die Option `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"` fragt das
Netzwerk ab und benötigt daher den REST-Endpunkt (`rest`) auf
`qorechain-vladi` / `qorechain-diana`: Es wirft einen Fehler, statt zu raten. Siehe
[Welche Sign-Bytes-Form?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Die Form hat sich in Chain v3.2.3 oder v3.2.4 (v3.2.4 läuft im Testnet seit dem 19. Oktober 2026 und im Mainnet seit dem 23. Oktober 2026; v3.2.5 und v3.2.6 haben hier nichts geändert; das Mainnet läuft seit dem 4. November 2026 mit v3.2.6) nicht geändert: `"auto"`
wird auf beiden Netzwerken zu v2 aufgelöst, weil beide das Upgrade angewendet haben, das darauf umgestellt hat.
:::

## Was 0.13.0 ändert {#whats-new-0130}

SDK 0.13.0 (11. November 2026) ist ein Release für alle Sprachen: TypeScript, Python,
Go, Rust und Java, mit `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm` und
`create-qorechain-dapp`. Es hat eine inkompatible Änderung, am Konto-Helfer des
Seed-Pfads. Konten, die aus einer Mnemonic abgeleitet werden, sind unverändert, ebenso das
hybride Signaturformat und das Chain-Verhalten: Eine mit 0.12.0 erstellte Transaktion bleibt gültig.
(Java wird gerade veröffentlicht: Maven Central zeigte am 11. November 2026 noch 0.12.0.)

**Inkompatible Änderung.** Die Seed-Pfad-Helfer `unifiedAccountFromSeed` (TypeScript),
`unified_account_from_seed` (Python, Rust), `unified.UnifiedAccountFromSeed` (Go) und
`UnifiedAccounts.unifiedAccountFromSeed` (Java) brauchen nun genau eine von zwei Eingaben: einen
`QRC1`-Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis. Der ML-DSA-87-Schlüssel wird
aus diesem zweiten Geheimnis abgeleitet. Ruft man den Helfer ohne Option oder mit mehr als
einer auf, löst er einen Fehler aus.

Die Option `legacySeedDerivation` (Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`) ist optional zuzuschalten. Verwenden Sie sie nur, um den PQC-Schlüssel eines
vor 0.13.0 erstellten Kontos wiederherzustellen, damit Sie ihn mit `MsgRotatePQCKey` rotieren können; sie ist nicht für
neue Konten gedacht.

| Bereich | In 0.13.0 |
| --- | --- |
| Seed-Pfad-Helfer | Brauchen einen `QRC1`-Wiederherstellungscode oder ein unabhängiges 32-Byte-PQC-Geheimnis (genau eines); ohne Option oder mit mehr als einer wird ein Fehler ausgelöst. Mnemonic-Konten sind unverändert |
| `legacySeedDerivation` | Optional zuzuschalten, nur um den PQC-Schlüssel eines vor 0.13.0 erstellten Kontos wiederherzustellen, damit er mit `MsgRotatePQCKey` rotiert werden kann |
| `QRC1`-Wiederherstellungscodes | In jeder Sprache ergänzt: `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret` (snake_case in Python und Rust; in Go `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | Meldet `keyVerified` |
| Vorlagen | `pnpm window recovery-code` gibt einen neuen Code aus. Mit `PRIVATE_KEY` liest `pnpm window` `QORE_PQC_RECOVERY_CODE` und bricht mit einer Meldung ab, wenn er fehlt; mit `QORE_MNEMONIC` ändert sich nichts. Die Vorlagen Foundry und Hardhat hängen von `^0.13.0` ab |
| Sign-Bytes-Version `"auto"` | Liest zuerst die Protokollfunktion `pqc-sign-bytes-v2` aus `/qorechain/pqc/v1/protocol_features` und greift nur auf die angewendeten Upgrade-Pläne zurück, wenn dieser Lesezugriff fehlschlägt |
| `getPqcStatus` / `get_pqc_status` | Lösen einen Fehler aus, wenn die Antwort des Nodes kein Registrierungsflag enthält, statt "nicht registriert" zu melden |
| Python | Parst Transaktions-Ergebniscodes und die EVM-Fenster-Felder `found` und `live` strikt; `wait_for_tx` behandelt eine Antwort ohne `tx_response` oder `txhash` weiterhin als ausstehend |

**Migration (TypeScript).** Erzeugen Sie einmal einen Wiederherstellungscode und bewahren Sie ihn getrennt
vom Seed auf:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

Ein Konto, das seinen PQC-Schlüssel mit 0.12 oder früher registriert hat, lädt den alten Schlüssel mit
`{ legacySeedDerivation: true }` und rotiert ihn mit `rotatePqcKeyMsg`:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

Bewahren Sie den Wiederherstellungscode auf: Ein anderer Code ergibt einen anderen Schlüssel.

## Was 0.12.0 neu bringt {#whats-new-0120}

SDK 0.12.0 ist das Client-Release für die Chain **v3.2.5**, die das Mainnet bei
Höhe 3.906.833 am 29. Oktober 2026 angewendet hat (das Testnet hat sie am 26. Oktober angewendet). Das Mainnet
läuft seit dem 4. November mit v3.2.6; das Testnet lief ab dem 27. Oktober mit v3.2.6 und läuft seit dem 6. November mit v3.2.7; das
hybride Signaturformat, Adressen, Dezimalstellen und Memos haben sich nicht geändert, sodass eine
mit 0.10.0 erstellte Transaktion gültig bleibt. TypeScript, Python, Go, Rust und Java
wechseln alle auf 0.12.0, ebenso `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
und `create-qorechain-dapp`. Das Release wurde in jeder Sprache mit einer
hybriden Bank-Überweisung auf dem Testnet geprüft sowie mit einem KEM-Schlüssel, der dort registriert, zurückgelesen und
entfernt wurde, dazu Lesezugriffe auf dem Mainnet.

| Bereich | In 0.12.0 |
| --- | --- |
| Öffentliche Endpoints als Standard | Die Presets `mainnet` und `testnet` zeigen jetzt auf die öffentlichen Endpoints (REST, Konsens-RPC und EVM-JSON-RPC auf beiden, dazu der EVM-WebSocket auf dem Testnet) statt auf localhost. Ein bloßes `createClient()` spricht daher mit dem öffentlichen Testnet. Siehe [Netzwerk & Endpoints](/sdk/reference/network#public-endpoints) |
| Preset `localnet` | Die localhost-Ports, die jedes Preset vor 0.12.0 verwendete, Chain-ID `qorechain-devnet`. Wählen Sie es mit `createClient({ network: "localnet" })`, um das bisherige Verhalten beizubehalten |
| Exaktes Gas für Hybrid-Transaktionen | Auf einem Netzwerk, das v3.2.5 angewendet hat, ist die `"auto"`-Gebühr einer hybriden nativen Transaktion `ceil(simulated x 1.02) + 2000`, weil die Simulation jetzt die Post-Quanten-Verifikation selbst berechnet. Eine hybride Bank-Überweisung fordert etwa 171.600 Gas statt etwa 289.000, und die Gebühr sinkt entsprechend. Ältere Netzwerke, klassische Transaktionen und eine fehlgeschlagene Plan-Abfrage behalten die frühere Regel; ein von Ihnen übergebener Multiplikator ersetzt beide Regeln. `exactHybridGas` (und seine Entsprechungen in jeder Sprache) und, in TypeScript, `estimateGasDetails` (meldet die Simulation, das Gas-Limit und welche Regel es festgelegt hat). Java erhielt den Auto-Gas-Pfad |
| ML-KEM-1024-Schlüsselregister | Ein Konto veröffentlicht einen ML-KEM-1024-Encapsulation-Schlüssel (Algorithmus 2, 1.568 Bytes), sodass jeder an ihn verschlüsseln kann: `msg.pqc.registerKemKey` und `msg.pqc.removeKemKey` (der Schlüssel wird zuerst geprüft: Größe, jeder Koeffizient unter 3329, nicht komplett null), `validateKemPublicKey` und der Lesezugriff `fetchKemKey` auf `/qorechain/pqc/v1/kem/{address}` (bech32 oder `0x`). Beide Nachrichten brauchen die hybride Signatur. Die Route antwortet auf dem Mainnet und dem Testnet. Das SDK verschlüsselt nicht: für versiegelte Nutzlasten siehe [QoreSeal](/developer-tools/qoreseal) |
| Abstract Accounts | Lesezugriffe auf die gespeicherten Spending-Regeln eines Kontos und auf seine verknüpften Schlüssel (widerrufene eingeschlossen), `MsgUpdateConfig` (die Governance-Nachricht, die das Modul schaltet) und `authenticators_count` in der Kontoansicht |
| Prüfungen der Spending-Regeln | Regeln werden so geprüft, wie die Chain sie prüft: ein Denom `erc20/`, `erc721/` oder `erc1155/` muss eine `0x`-Contract-Adresse nennen. Die `abstractaccount`-Codes 8 (ungültige Spending-Regel) und 9 (Modul deaktiviert) werden benannt |
| Governance-Parameter | Das CrossVM-`MsgUpdateParams` (einschließlich der CosmWasm-Contracts, die der Bridge-Precompile der EVM aufrufen darf) und das Rollup-`MsgUpdateParams`, jeweils vor dem Signieren gegen die Grenzen der Chain geprüft. Der Lesezugriff auf die CrossVM-Parameter enthält `bridge_allowed_targets` |
| Upgrade-Konstante und Protos | `CHAIN_UPGRADE_V3_2_5`; Protobuf-Definitionen, synchronisiert mit Chain v3.2.5 |
| Chain Developer Kit | Aus dem nur auf npm veröffentlichten 0.11.0 und in 0.12.0 enthalten: `@qorechain/evm` exportiert die viem-Chains `qorechain` (9801) und `qorechainTestnet` (9800) sowie die Helfer für das EVM-Autorisierungsfenster (`evmWindowStatus`, `openEvmWindowMessage`, auch als `@qorechain/evm/window` ohne viem). `create-qorechain-dapp` hat die Vorlagen `foundry`, `hardhat`, `viem-wagmi` und `cosmwasm`. `@qorechain/react` hat `PqcStatusBadge` (die alten `QuantumSafeBadge`-Namen bleiben als veraltete Aliase erhalten) |
| Korrekturen | `@qorechain/svm` mit Endpoints ohne `svmRpc` verwendete localhost; jetzt meldet es, dass der Endpoint nicht konfiguriert ist. Die Python-Codegenerierung verweist Importe zwischen QoreChain-Protos in das Paket |

**Verhaltensänderung, die Sie beim Upgrade prüfen sollten.** Wenn Ihr Code sich auf den
localhost-Standard verlassen hat, wählen Sie `localnet` oder übergeben Sie `endpoints`. Die öffentlichen Testnet-Endpoints
sind pro IP ratenbegrenzt, Produktionsverkehr sollte also einen eigenen
Node betreiben oder verwenden. Kein Preset setzt auf den öffentlichen Netzwerken einen gRPC- oder einen SVM-Endpoint (SVM-Transaktionen
sind nicht offen), und das Mainnet hat keinen öffentlichen EVM-WebSocket: Code, der
einen davon braucht, schlägt mit einem Fehler fehl, der den zu übergebenden Endpoint nennt, statt auf localhost
zurückzufallen. In Rust sind die optionalen Endpoints jetzt `Option<String>`; in Python, Go
und Java ist ein nicht gesetzter Endpoint `None`, ein leerer String bzw. `null`.

Nodes melden ihre Binärversion nicht. Um ein Feature zu erkennen, fragen Sie `isUpgradeApplied`
für jeden Upgrade-Namen ab, der es mitbringt, oder lesen Sie `.version` aus
`https://download.qore.host/<net>/latest.json`.

## Was 0.10.0 hinzugefügt hat {#whats-new-0100}

SDK 0.10.0 war das Client-Release für die Chain **v3.2.4**, die das Mainnet am 23. Oktober 2026
bei Höhe 3.742.566 angewendet hat (das Testnet hat sie am 19. Oktober bei Höhe 8.337.253
angewendet). Signaturformat, Adressen, Dezimalstellen, Memos und Gebühren haben sich nicht
geändert, und eine mit 0.9.0 erstellte Transaktion bleibt gültig. Das Release wurde in jeder
Sprache mit echten Transaktionen auf dem Testnet geprüft. Es hatte keine Builder für alles,
was nach v3.2.4 eingeführt wurde; die Ergänzungen von v3.2.5 kamen mit
[0.12.0](#whats-new-0120). Das Mainnet läuft seit dem 4. November 2026 mit v3.2.6 (Höhe
4.020.000, Governance-Vorschlag 15; davor v3.2.5, ab dem 29. Oktober bei Höhe
3.906.833), und 0.10.0 funktioniert dort weiter, weil sich das Signaturformat nicht
geändert hat. Das Testnet hat v3.2.5 und v3.2.6 am 26. und 27. Oktober 2026 und v3.2.7 am 6. November angewendet (kein SDK-Release hat Builder für die Nachrichten von v3.2.7). Was 0.10.0
brachte (alles davon ist weiterhin in 0.13.0 enthalten):

| Bereich | In 0.10.0 |
| --- | --- |
| Staking-Stufen (`x/stakingtier`) | Composer `lockDelegation` (die eigenen Prüfungen der Chain: eine Laufzeit von 3, 6 oder 12 Monaten und ein positiver ganzzahliger Betrag), `unlockEarly`, `claimBonus` und `updateParams`; Lesezugriffe auf die Modulparameter, die Sperren eines Halters und den Bonus-Pool (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); die Fehlercodes des Moduls. Was das Modul tut, steht in [Staking und Delegation](/user-guide/staking-and-delegation) |
| Authenticator-Nonce | `fetchAuthNonce({ rest, address, pubkey })` liest die Sequenz, die ein verknüpfter Schlüssel als Nächstes für `MsgExecuteEVM` / `MsgExecuteCosmos` signieren muss, von `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, statt sie von Hand mitzuführen. Beide Netzwerke stellen die Route bereit; das Modul `abstractaccount` selbst ist im Mainnet abgeschaltet (im Testnet aktiviert), sodass eine Mainnet-Ausgabe abgelehnt wird, bevor eine Nonce geprüft wird |
| Schalter für Protokoll-Features | `fetchProtocolFeatures` und `isProtocolFeatureEnabled` lesen unter `/qorechain/pqc/v1/protocol_features` (beide Netzwerke stellen sie bereit), welche Konsensregeln ein Netzwerk durchsetzt, nach Namen. Ein Netzwerk unterhalb von v3.2.4 stellt die Route nicht bereit; verwenden Sie dort `isUpgradeApplied` |
| `possessionProven` | Der PQC-Status gibt an, ob der Schlüssel des Kontos mit einem Besitznachweis registriert wurde |
| `ibcTimeoutTimestamp(seconds)` | Ein absolutes IBC-Timeout in der Einheit, die `MsgTransfer` verwendet (Unix-Nanosekunden). IBC-Timeouts sind absolute Zeiten; IBC-v2-Pakete nehmen absolute Unix-Sekunden, und ein relativer Wert dort wird abgelehnt, nachdem die Gebühr berechnet wurde. Im Mainnet ist kein IBC-Kanal geöffnet (geprüft am 27. Oktober 2026) |
| Upgrade-Konstante und Protos | `CHAIN_UPGRADE_V3_2_4`; Protobuf-Definitionen, synchronisiert mit Chain v3.2.4 (neue Felder bei der Bridge-Validator-Registrierung sowie bei den Light-Node- und Rollup-Abfragen) |
| `ensurePqcRegistered` | Es verglich einen Status ohne öffentlichen Schlüssel als Übereinstimmung; jetzt liest es den Schlüssel über `rest` und vergleicht ihn. Wenn es nichts zum Lesen gibt, meldet das Ergebnis `keyVerified: false`, statt zu behaupten, der Schlüssel gehöre dem Aufrufer |
| Ablehnungen bei der Gebührensimulation | Eine Ablehnung der Chain, die nur als Text eintrifft (zum Beispiel „no bonus to claim“), wird jetzt in jeder Sprache anhand der registrierten Fehlerbeschreibungen der Chain benannt: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` und `create-qorechain-dapp` sind damit auf 0.10.0 gewechselt; beide
sind jetzt bei 0.13.0.

## Was 0.9.0 brachte {#whats-new-090}

SDK 0.9.0 war das Client-Release für die Chain-Versionen **v3.2.2** und **v3.2.3** (das Mainnet
hat sie bei den Höhen 3,556,788 und 3,662,051 angewendet; das Mainnet lief seit dem 23. Oktober 2026 (Höhe 3.742.566) mit v3.2.4 und lief ab dem 29. Oktober mit v3.2.5 und läuft seit dem 4. November 2026 mit v3.2.6, und das Testnet läuft seit dem 19. Oktober 2026 mit v3.2.4 oder neuer). Signaturformat,
Adressen, Dezimalstellen, Memos und Gebühren haben sich nicht geändert, sodass die hybride
v2-Sign-Bytes-Form, die 0.8.1 und neuer signieren, weiterhin die richtige ist.
Neu ist Folgendes:

| Bereich | In 0.9.0 (und später) |
| --- | --- |
| Hybrider `TxClient` (TypeScript) | Übergeben Sie das Schlüsselpaar des Kontos: `client.connectTx(signer, { pqcKeypair })` oder `TxClient.connect({ …, pqcKeypair, rest })`. Jede Transaktion wird dann hybrid signiert, und `fee: "auto"` simuliert die hybride Transaktion selbst; eine reine Schlüsselregistrierung bleibt klassisch (der Bootstrap-Pfad der Chain). `bankSend` sowie die Rollup-, Multilayer- und Cross-VM-Clients des SDK verwenden ihn. Ohne Schlüsselpaar ändert sich nichts |
| Wiederherstellbarer PQC-Schlüssel | `derivePqcCanonical(address, mnemonic)` und seine Entsprechungen in jeder Sprache (siehe [Hybrides Signieren](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Liest zuerst den Schlüsselstatus über REST (`rest`), verweigert die Registrierung, wenn es ihn nicht bestimmen kann, wirft `PqcKeyMismatchError`, wenn das Konto bereits einen anderen Schlüssel besitzt, und behandelt die Ablehnung „bereits registriert“ der Chain als Erfolg. Ab Chain v3.2.3 signiert und hängt es den **Besitznachweis** selbst an; vor v3.2.3 lässt es das Feld weg |
| Eingeschränkte EVM-Fenster | `openEvmWindowMsg` nimmt `nativeOnly` und `allowedTargets` entgegen (höchstens 16, keine Duplikate); `fetchEvmWindow` liest beides zurück (siehe [EVM-Leitfaden](/sdk/guides/evm#evm-window)) |
| EIP-7702-Zustimmung | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Schlüsselintegrität | Die Registrierungs-Builder lehnen `classical_only`, einen leeren Schlüssel und einen degenerierten ML-DSA-87-Schlüssel ab, was die Chain ab v3.2.3 ebenfalls tut. `signProofOfPossession` / `verifyProofOfPossession` werden exportiert; `migratePqcKeyHybrid` sendet die hybrid signierte `MsgMigratePQCKey`, die Konten mit Schlüssel ab v3.2.3 benötigen |
| Abstract-Account-Digest v2 | `evmAuthSignBytesV2` (bindet das Gas-Limit des Aufrufs) und `resolveEvmAuthDigestVersion`. Das Modul `abstractaccount` ist im Mainnet abgeschaltet (im Testnet aktiviert), dies dient im Mainnet daher nur als Referenz |
| Upgrade-Erkennung | `isUpgradeApplied`, `requireUpgradeApplied`: neue optionale Felder werden erst gesetzt, nachdem `applied_plan` das Release meldet, denn ein Node, der ein Release nicht angewendet hat, lehnt die gesamte Transaktion ab, wenn eines der neuen Felder dieses Releases gesetzt ist |
| Fehlerdekodierung | Ein Fehlschlag innerhalb eines Blocks behält seinen Codespace (zum Beispiel `pqc` 231, nicht `sdk_231`); `rate_limited` und die Delegationscodes werden dekodiert; `decodeTxError` liest das Log oder die Nachricht eines geworfenen Fehlers |
| Ausgabenregeln | `validateSpendingRules` läuft in den `MsgUpdateSpendingRules`-Buildern und lehnt eine Regel ab, die nichts begrenzt |
| Korrekturen | Die PQC-Konto-Route ist in jedem SDK die Singular-Route `/qorechain/pqc/v1/account/{address}` (und in `client.rest.getPqcAccount`, `isPqcRegistered` und `getPqcStatus`, wenn der zusammengesetzte Client übergeben wird); die exportierte `VERSION` entspricht dem Paket; vom SDK erzeugte Go- und Rust-Clients laufen in ein Timeout, statt zu hängen; die Vorlagen von `create-qorechain-dapp` hängen von dem Release ab, mit dem sie ausgeliefert werden |

Die Legacy-PQC-Ableitung für neue Schlüssel (`derivePqcLegacy`, `"bridge"`) ist
veraltet: Sie ist nicht an das Konto gebunden, sodass eine Mnemonic jedem
Konto denselben Schlüssel geben würde. Die Rotations-Helfer lehnen sie als **neuen** Schlüssel ab;
das Wiederherstellen eines bestehenden Legacy-Schlüssels oder das Wegrotieren von ihm funktioniert weiterhin.

## Versionen vor 0.9.0 {#before-090}

Wenn Sie 0.8.x einsetzen, signiert es weiterhin die Form, die beide Netzwerke verifizieren, und funktioniert auf
dem Mainnet und dem Testnet. Dies sind die Einschränkungen, die 0.9.0 beseitigt hat,
und einige davon kosten eine Gebühr, wenn man sie nicht kennt:

| Release vor 0.9.0 | Workaround |
| --- | --- |
| Keine Builder für Besitznachweis, eingeschränkte Fenster oder EIP-7702-Zustimmung | Verwenden Sie `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` und `authorize-evm-delegation` / `clear-evm-delegation` (siehe [EVM-Autorisierungsfenster](/getting-started/first-transaction#evm-window), [EIP-7702-Delegierungen](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` ohne `status` sendete die Registrierung ungeprüft und meldete Erfolg, wenn ein anderer Schlüssel registriert war | Eine zweite Registrierung für ein Konto, das bereits einen Schlüssel besitzt, wird **abgelehnt, nachdem die Gebühr abgezogen wurde**. Lesen Sie zuerst `GET /qorechain/pqc/v1/account/{address}` und übergeben Sie `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Sie riefen einen Pfad im Plural `/accounts/` oder den Namensraum `qor_` auf, die die öffentlichen Endpunkte nicht bereitstellen (HTTP 501, `-32601`). Lesen Sie die oben genannte REST-Route im Singular |
| `TxClient` / `bankSend` sowie die Rollup-, Multilayer- und Cross-VM-Clients signierten nur klassisch | Die Netzwerke lehnen das für jedes Konto mit Schlüssel ab. Senden Sie über `signAndBroadcastHybrid` |
| Fehlgeschlagene Transaktionen innerhalb eines Blocks verloren ihren Codespace | Lesen Sie die Transaktion über `GET /cosmos/tx/v1beta1/txs/{hash}` |
| Die exportierte Konstante `VERSION` von 0.8.3 meldete `0.8.0` | Lesen Sie die installierte Version aus `package.json` |
| `create-qorechain-dapp` 0.8.0 pinnte `@qorechain/sdk` / `@qorechain/evm` auf `^0.3.0` (ein Caret auf eine 0.x-Version bleibt innerhalb von 0.3) | Führen Sie nach dem Scaffolding `npm i @qorechain/sdk@latest` aus |
| `@qorechain/react` 0.8.x ließ den Status des registrierten Schlüssels auf den öffentlichen Endpunkten unlesbar | Verwenden Sie `@qorechain/react` 0.9.0 oder neuer |

:::caution Ältere Fixes
SDK **0.6.1** behob einen konsenskritischen Bug: Die Tx-Body-Extension
`/qorechain.pqc.v1.PQCHybridSignature` wurde JSON-serialisiert in
`Any.value` geschrieben und **von der Chain bei CheckTx abgelehnt**. Hybride
(PQC + klassische) Transaktionen, die mit SDK ≤ 0.6.0 erstellt wurden, werden
on-chain abgelehnt. **0.8.0** hat die Konto-Helfer für Wallet-Signaturen entfernt (siehe
[Konten & PQC-Signierung](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Das Kern-Paket:

```bash
npm i @qorechain/sdk
```

Es zielt auf Node.js 20+ und liefert ESM, CommonJS sowie Typdefinitionen. Die
Beispiele für hybride Transaktionen in dieser Dokumentation importieren außerdem `StargateClient` aus
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### EVM-Adapter

`@qorechain/evm` ist ein schlanker, typsicherer Adapter über [viem](https://viem.sh).
viem ist eine **Peer-Abhängigkeit** — installieren Sie es zusätzlich:

```bash
npm i @qorechain/evm viem
```

Veröffentlicht auf npm unter `0.13.0`. Es exportiert die viem-Chains `qorechain` (Chain-ID 9801) und `qorechainTestnet` (9800) sowie die Helfer für das [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window).

### SVM-Adapter

`@qorechain/svm` ist ein schlanker Adapter über
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), das eine
**Peer-Abhängigkeit** ist:

```bash
npm i @qorechain/svm @solana/web3.js
```

Veröffentlicht auf npm unter `0.13.0`.

### React-Kit

`@qorechain/react` ist die offizielle React-Schicht über `@qorechain/sdk` — ein
Provider, Hooks sowie die Komponenten `ConnectButton` / `PqcStatusBadge`.
`react` (>=18) ist eine Peer-Abhängigkeit:

```bash
npm i @qorechain/react
```

Veröffentlicht auf npm unter `0.13.0`; es hängt von `@qorechain/sdk` `^0.13.0` ab. Siehe den [React-Kit-Leitfaden](/sdk/guides/react).

### Scaffolder

`create-qorechain-dapp` (npm, `0.13.0`) erzeugt eine sofort lauffähige dApp:

```bash
npm create qorechain-dapp@latest my-dapp
```

Die generierten `package.json`-Dateien hängen von dem SDK-Release ab, mit dem der Scaffolder
ausgeliefert wird (`@qorechain/sdk` `^0.13.0`; die EVM-Vorlagen verwenden `@qorechain/evm` `^0.13.0`). Es hat außerdem die Vorlagen `foundry`, `hardhat`, `viem-wagmi` und `cosmwasm` für die Contract-Arbeit.
Version 0.8.0 des Scaffolders schrieb Bereiche `^0.3.0`, die bei einer 0.x-Version
innerhalb von 0.3 bleiben und für die Live-Netzwerke nicht signieren können; wenn Sie mit 0.8.0 ein Scaffolding durchgeführt haben, führen Sie
`npm i @qorechain/sdk@latest` aus. Siehe die [CLI-Referenz](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Erfordert Python 3.10+. Das Paket liefert Type Hints und einen `py.typed`-Marker.

> Die Distribution wird als `qorechain-sdk` installiert (veröffentlicht auf PyPI unter `0.13.0`),
> wird aber **als `qorsdk` importiert**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Erfordert Go 1.23+. Importieren Sie die benötigten Sub-Pakete, zum Beispiel:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Veröffentlicht als eigenständiges Go-Modul (getaggt als `packages/go/v0.13.0`). Pinnen Sie die Version
explizit: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.13.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Oder, um den Repository-Stand (Head) zu verfolgen:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Erfordert Rust 1.74+. Die Lese-Clients sind asynchron (Tokio). Die Crate wird als
`qorechain` importiert (`use qorechain;`).

> Veröffentlicht auf crates.io als `qorechain-sdk` (0.13.0); `cargo add qorechain-sdk`
> installiert das neueste Release.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.13.0</version>
</dependency>
```

Oder Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.13.0'
```

> Veröffentlicht auf Maven Central als `io.github.qorechain:qorechain-sdk`. 0.13.0 wird gerade
> veröffentlicht: Maven Central zeigte am 11. November 2026 noch 0.12.0 als neueste Version, und die
> obigen Koordinaten sind die zu verwendende Version, sobald 0.13.0 erscheint (bis dahin
> verwenden Sie 0.12.0). Es braucht JDK 17 oder neuer. Central hat keinen Build
> 0.8.0 oder 0.8.1, verwenden Sie daher auf den Live-Netzwerken 0.8.2 oder neuer. 0.9.1 war ein
> reines Java-Release, das Bouncy Castle von 1.80 auf 1.85 hob, ohne API-Änderung.

## Verwandte Pakete {#related-packages}

| Paket | Zweck | Version |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Wallet-seitige Helfer: Wallet-Erzeugung (`generateQoreWallet`), hybrides Signieren mit `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), MetaMask-Netzwerkregistrierung (`addQoreEvmToWallet`), Message-Builder für Authenticators und EVM-Fenster (sein `openEvmWindowMsg` baut nur die uneingeschränkte Form), der v2-Abstract-Account-Digest. Er hängt keinen Besitznachweis an. Peer-Abhängigkeiten: `@cosmjs/proto-signing` und `@cosmjs/stargate` `^0.32` (das SDK verwendet cosmjs 0.39, daher meldet npm bei der Installation beider in einem Projekt einen Peer-Konflikt, `ERESOLVE`; halten Sie sie in getrennten Projekten oder übergeben Sie `--legacy-peer-deps`) | 0.5.0 |
| `@qorechain/chain-bridge` | Serverseitiger Worker für Backends: leitet den PQC-Schlüssel ab, signiert hybrid und sendet (`sendTokens`, `registerPqc` und mehr). Übergeben Sie `cosmosRest`: Damit trägt eine Registrierung den Besitznachweis, sobald das Netzwerk v3.2.3 angewendet hat, und eine PQC-artige Ablehnung wird vor jeder erneuten Registrierung gegen die Chain geprüft (ein anderer registrierter Schlüssel löst `pqc_key_mismatch` aus, statt eine zweite Registrierung zu bezahlen) | 0.2.3 |
| `@qorechain/pqc` | Rein standardbasierte Primitive für ML-DSA / ML-KEM / SHAKE-256 sowie `hybridSignBytes` (siehe [Post-Quantum Signing](/developer-guide/post-quantum-signing)); auch auf PyPI, crates.io, Maven Central und dem Go-Proxy (Go `v0.2.3`) in derselben Version | 0.2.3 |
| `@qorechain/handles` | Verifizierte `@handle`-Auflösung (`HandleClient`): Sie liefern den öffentlichen Schlüssel der Registry und einen Pin-Speicher, und Sie pinnen, nachdem der Nutzer die Adresse gesehen hat; das Paket pinnt nie von selbst. Siehe [Chain Bridge und Handles](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Auf npm als veraltet markiert und nicht mehr gepflegt; verwenden Sie es nicht für neue Arbeiten. Verwenden Sie stattdessen [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (Ersatz für die QoreX-Verbindung steht in der [Übersicht der Entwickler-Tools](/developer-tools/overview#group-connect)).** Ein einziger Connector für EVM-, Cosmos- und SVM-Wallets, aufgebaut auf dem Wallet-Adapter (sein Peer-Bereich ist `@qorechain/wallet-adapter` `^0.2.1`, der 0.5.0 nicht einschließt). Er öffnet kein [EVM-Autorisierungsfenster](/sdk/guides/evm#evm-window), sodass ein EVM-Versand darüber abgelehnt wird, bis das Konto einen registrierten Schlüssel und ein offenes Fenster hat | 0.2.1 |
| `@qorechain/rdk` | Client des Rollup Development Kit (siehe [Rollups](/rollups/why)). Ab 0.7.0 hängt er von `@qorechain/sdk` `^0.10.0` und `@qorechain/evm` `^0.8.0` ab (auf npm geprüft, 4. November 2026). Ein Caret auf eine 0.x-Version bleibt innerhalb dieser Minor-Version, sodass eine App mit dem SDK 0.13.0 für das Kit eine zweite, verschachtelte SDK-0.10.x-Kopie erhält; halten Sie die beiden getrennt (übergeben Sie keinen Client von einer Kopie an die andere), bis ein Kit-Release auf 0.13 wechselt. Signiert nur hybrid, wenn Sie ein `pqcKeypair` übergeben; Lesevorgänge funktionieren ohne. Auch als `qorechain-rdk` auf PyPI, crates.io und Maven Central sowie als Go-Modul veröffentlicht (pinnen Sie `@v0.8.0`); ab 0.8.0 signieren diese vier Clients ebenfalls hybrid (frühere Versionen signierten nur klassisch; Java benötigt Java 21). Siehe [RDK 0.8.0: Änderungen und Einschränkungen](/rollups/deploying-a-rollup#rdk-050-limits) | 0.8.0 |
| `@qorechain/rdk-cli` | Die `qorollup`-Operator-CLI für das RDK. Seit 0.7.1 signieren ihre Transaktionsbefehle (`create`, `pause`, `resume`, `stop`, `withdraw`) hybrid (0.7.0 und früher signierten nur klassisch und wurden von den Netzwerken abgelehnt); von npm installiert läuft sie, und `--version` gibt die installierte Version aus (0.6.1 und früher gaben nichts aus) | 0.8.0 |
| `@qorechain/qoreseal` | QoreSeal: verschlüsselt eine Nutzlast an die ML-KEM-1024-Schlüssel, die Konten im KEM-Register veröffentlichen (SDK 0.12.0 und später registrieren und lesen die Schlüssel; QoreSeal übernimmt die Verschlüsselung). Auch auf PyPI (`qorechain-qoreseal`; Wheels für macOS und Linux, das Windows-Wheel in der nächsten Version), crates.io, Maven Central (`io.github.qorechain:qoreseal` und `qoreseal-android`; Kotlin-Nutzer brauchen Kotlin 2.3 oder neuer), dem Go-Modul-Proxy (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) und als Swift-Paket. Siehe [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: Werkzeuge für zugangsbeschränkte Real-World-Asset-Token auf der EVM Engine, mit Clients in TypeScript, Python, Java und Go sowie Solidity-Contracts (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0, mit Ausnahme der ERC-3643-Skripte und -Tests (GPL-3.0-or-later). Die nativen Module, die es beschreibt, sind ein Vorschlag und nicht gebaut. Auch `qorechain-asset-kit` auf PyPI und `io.github.qorechain:asset-kit` auf Maven Central. Siehe [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: Wallet- und Backend-Signierung sowie `inspectTransaction`, um die Post-Quanten-Ebene einer bestätigten Transaktion zu prüfen. Auch auf PyPI, crates.io und Maven Central. Siehe [QoreSign](/qoresign/overview) | 0.1.1 |
| `create-qorechain-rollup` | Scaffolder für Rollup-Starter; seine Vorlagen hängen von `@qorechain/rdk` `^0.8.0` ab und signieren hybrid, wenn sie Ihren Post-Quanten-Schlüssel aus `QORE_MNEMONIC` oder `QORE_PQC_SEED_HEX` auflösen können | 0.8.0 |

## Weiter

Fahren Sie mit dem [Schnellstart](/sdk/quickstart) fort, um sich zu verbinden und den On-Chain-Zustand zu lesen.
