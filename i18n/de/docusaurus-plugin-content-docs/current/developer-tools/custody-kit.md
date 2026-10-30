---
slug: /developer-tools/custody-kit
title: QoreChain Custody Kit
sidebar_label: Custody Kit
sidebar_position: 32
---

# QoreChain Custody Kit

Das QoreChain Custody Kit ist ein schriftlicher Integrationsleitfaden, ein Satz von Testvektoren und kleiner Referenzcode für Verwahrer und Börsen, die Kundengelder auf QoreChain halten. Es erklärt, was das Netzwerk auf jeder Ausführungs-Lane verlangt, und zeigt in lesbarem Code die Teile einer Integration, bei denen man leicht Fehler macht: eine Adresse prüfen, eine signierte Transaktion vor dem Senden dekodieren und verifizieren und entscheiden, welche eingehenden Überweisungen gutgeschrieben werden.

Es richtet sich an Verwahrer, Börsen, Zahlungsdienstleister und Wallet-Backends sowie an die Ingenieure und Prüfer, die diese Integrationen begutachten. Version **0.1.0**, veröffentlicht am 27. Oktober 2026, Apache-2.0. Es funktioniert gegen das Mainnet (`qorechain-vladi`) und das Testnet (`qorechain-diana`); die mitgelieferten Live-Prüfungen laufen gegen das Testnet und lesen nur.

**Zuerst lesen: Das Kit ist Beispielcode, keine Bibliothek.** Sie klonen das Repository und lesen, kopieren oder vendoren den Ordner für Ihre Sprache. Es gibt bewusst kein npm-, PyPI-, crates.io- oder Maven-Central-Paket des Kits. Die eine Ausnahme in der Form ist Go: Der Go-Ordner ist ein Go-Modul mit getaggter Version, sodass `go get` es abrufen kann, aber es bleibt Beispielcode ohne Zusage einer stabilen API (siehe [Was eine Bibliothek ist und was Beispielcode](#library-vs-example)). Das Signieren und die kryptografische Verifikation kommen von [QoreSign](/qoresign/overview), einer veröffentlichten Bibliothek.

## Innovationen {#innovations}

- **Ein Verhalten in fünf Sprachen, durch eine Datei belegt.** TypeScript, Python, Go, Rust und Java implementieren dieselben vier Funktionen mit denselben Ergebnissen und denselben Fehlercodes. Jede Sprache läuft gegen die gemeinsame Testvektordatei `vectors/custody-v1.json`, sodass ein Team, das das Kit in eine andere Sprache portiert, nachweisen kann, dass es übereinstimmt.
- **Stabile Fehlercodes für Adressen.** `validateAddress` wirft nie. Es liefert bei Erfolg die beiden Schreibweisen der Adresse oder einen von elf stabilen Codes (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`), sodass ein Auszahlungsformular den genauen Grund anzeigen kann.
- **Prüfung beider Signaturen vor dem Senden.** `verifyTx` prüft die secp256k1-Signatur über das `SignDoc`, die ML-DSA-87-Schicht gegen einen von Ihnen übergebenen Schlüssel und ob der öffentliche Schlüssel in der Transaktion der erwartete ist. Es liefert `{ valid, classical, signerKey, pq }` und wirft nur bei fehlerhafter Eingabe, nie bei einer ungültigen Signatur. Ein zweiter Prozess kann es für jede signierte Auszahlung ausführen, bevor irgendetwas gesendet wird.
- **Einzahlungsentscheidungen mit Begründung.** `extractDeposits` liefert jede eingehende Überweisung einer Transaktion mit einem Flag `creditable` und einem `reason` (`evm_failed`, `fee_refund`, `unsupported_message` oder `null`). Es erfasst den Fall, der EVM-Integratoren überrascht: Eine fehlgeschlagene EVM-Ausführung meldet auf nativer Ebene trotzdem den Ergebniscode 0.
- **Ein Query-Builder, der zum Node passt.** `buildDepositQuery` erzeugt den exakten prozentkodierten REST-Pfad für eingehende Überweisungen an eine Adresse (Limit 1 bis 100, Höhengrenzen, aufsteigende Reihenfolge) und wandelt `0x`-Eingaben in die Form `qor1` um.
- **Anleitung pro Lane.** Der Leitfaden behandelt die native Lane, die EVM-Lane mit ihren Autorisierungsfenstern und stellt klar, dass die SVM-Lane für Transaktionen nicht offen ist, sodass darauf kein Einzahlungs- oder Auszahlungsablauf gebaut werden sollte.

## Anwendungsfälle {#use-cases}

1. **Einzahlungs-Scanner für eine Börse.** Führen Sie einen Höhen-Cursor, rufen Sie `buildDepositQuery({ address, minHeight, maxHeight })` gegen Ihren eigenen Node auf und dann `extractDeposits(txResponse, address)`, um erfolgreiche `MsgSend`, `MsgMultiSend` und EVM-Überweisungen in `uqor` gutzuschreiben. Fehlgeschlagene EVM-Ausführungen, Gas-Erstattungen und andere Nachrichten werden ausgeschlossen oder zur Prüfung markiert.
2. **Auszahlungspipeline mit einem zweiten Freigeber.** Nachdem der Signierer eine hybrid signierte Auszahlung erzeugt hat, führt ein unabhängiger Prozess `decodeTx` (Empfänger, Betrag, Gebühr, Memo) und `verifyTx` (beide Signaturen, erwartete Schlüssel) aus, bevor die Transaktion gesendet wird.
3. **Adresseingabe.** Prüfen Sie jede vom Nutzer angegebene Auszahlungsadresse mit `validateAddress`, lehnen Sie `qorvaloper`-Adressen als Zahlungsziele ab und verlangen Sie bei Hex-Eingaben optional EIP-55-Prüfsummen.
4. **HSM-Planung.** Ein Sicherheitsteam nutzt den Leitfaden zur Schlüsselverwaltung, um zwischen im HSM erzeugten ML-DSA-87-Schlüsseln und der mnemonischen kanonischen Ableitung zu wählen, die PKCS-#11-v3.2-Unterstützung für reines ML-DSA-87-Signieren mit leerem Kontext zu prüfen und Rotation und Backups zu entwerfen.
5. **EVM-Auszahlungsweg.** Eine Börse, die auf der EVM-Lane auszahlt, registriert den ML-DSA-87-Schlüssel einmal, öffnet pro Batch mit einer hybriden Transaktion der nativen Lane ein begrenztes Autorisierungsfenster und signiert dann gewöhnliche EIP-1559-Transaktionen mit ihrem bestehenden secp256k1-Stack.
6. **Staking für Kunden.** Ein Verwahrer, der Staking anbietet, folgt dem Staking-Leitfaden (delegieren, Delegation aufheben, umdelegieren, Belohnungen, Sperren der Staking-Stufe) und dekodiert jede Staking-Nachricht vor dem Signieren mit `decodeTx`.
7. **Portierung in eine andere Sprache oder ein Audit.** Ein Team, das eine eigene Implementierung schreibt, lässt sie gegen `vectors/custody-v1.json` laufen, um zu zeigen, dass sie mit den Referenzergebnissen und Fehlercodes übereinstimmt.
8. **Probelauf vor dem Mainnet.** Ein Integrationsteam folgt dem Testnet-Probelauf (Schlüssel registrieren, hybrider Versand, Einzahlungsscan, Staking, EVM-Fenster, Schlüsselrotation) und der Integrations-Checkliste.

## So funktioniert es {#how-it-works}

### Was das Kit enthält {#contents}

| Teil | Was es ist |
|---|---|
| `docs/` | Zehn Leitfadenseiten: Signieren pro Lane, Adressen und Ableitung, Einzahlungen, Auszahlungen, Staking, Fehler, Schlüsselverwaltung, Testumgebung, Integrations-Checkliste, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Referenzcode mit denselben vier Funktionen und einer kleinen Beispiel-Kommandozeile pro Sprache. |
| `vectors/custody-v1.json` | Testvektoren: eine gültige und eine ungültige Adresse pro Fehlercode, eine hybrid signierte `MsgDelegate`, eine hybrid signierte `MsgOpenEVMWindow` von einem eth-nativen Konto, Staking- und Fenster-Nachrichten, fehlerhafte Transaktionen, Einzahlungsabfragen und Fälle der Einzahlungsextraktion. Die QoreSign-Vektoren werden per Verweis wiederverwendet und per SHA-256 geprüft. |
| Live-Prüfungen | Nur lesende Prüfungen gegen das Testnet, eingeschaltet mit `QORE_LIVE_TEST=1`: Staking-Parameter, eine Einzahlungsabfrage für eine aktuelle Überweisung und die Verifikation einer bestätigten hybriden Transaktion. |

### Was eine Bibliothek ist und was Beispielcode {#library-vs-example}

| Baustein | Art | Wo man ihn bekommt |
|---|---|---|
| QoreSign (Signieren, ML-DSA-87- und secp256k1-Verifikation, Nachricht zur Schlüsselregistrierung) | Veröffentlichte Bibliothek | npm, PyPI, crates.io, Go, Maven Central. Siehe [QoreSign](/qoresign/overview). |
| Der Code des Kits in TypeScript, Python, Rust und Java | Beispielcode, in keiner Registry veröffentlicht | `qorechain/qorechain-custody-kit` klonen und den Ordner kopieren oder vendoren. |
| Der Code des Kits in Go (Paket `custodykit`) | Beispielcode. Als Go-Modul in einer getaggten Version abrufbar, ohne Zusage einer stabilen API | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, oder klonen und vendoren. |
| Die Leitfadenseiten, Vektoren und die Checkliste | Dokumentation und Daten | Das Repository. |

Das Kit implementiert kein Signaturverfahren. Die Verifikation von ML-DSA-87 und secp256k1 kommt von QoreSign. Der Python-Code enthält ein kleines Keccak-256, das für die EIP-55-Prüfsumme verwendet wird und für nichts sonst.

### Lanes {#lanes}

| Lane | Was ein Verwahrer signiert | Status |
|---|---|---|
| Native (Cosmos SDK) | secp256k1 `SIGN_MODE_DIRECT` plus eine ML-DSA-87-Schicht (FIPS 204). Ein Konto mit registriertem Schlüssel hat keinen klassischen Pfad; ein Konto ohne Schlüssel kann nur klassisch senden, um seinen Schlüssel zu registrieren (oder um zu unjailen). | offen |
| EVM | Gewöhnliche Ethereum-Transaktionen mit secp256k1 (EIP-155 und EIP-1559), zugelassen für einen Absender mit registriertem ML-DSA-87-Schlüssel und einem aktiven Autorisierungsfenster, das durch eine hybride Transaktion der nativen Lane geöffnet wird: eine ML-DSA-87-Signatur pro Fenster. | offen |
| SVM | Nicht anwendbar | für Transaktionen nicht offen |

### Hybride Transaktionen der nativen Lane {#hybrid}

- Eine hybride Transaktion ist ein gewöhnliches `TxRaw`, das vom selben Konto zweimal signiert wird. Die ML-DSA-87-Signatur reist im Body als Erweiterungsoption `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, eine Signatur von 4.627 Byte, optional der öffentliche Schlüssel von 2.592 Byte). Die secp256k1-Signatur ist die übliche `SIGN_MODE_DIRECT`-Signatur über den endgültigen Body, Erweiterung eingeschlossen.
- Die ML-DSA-87-Signatur deckt Sign-Bytes ab, die die Erweiterung ausschließen. Beide öffentlichen Netzwerke verifizieren Sign-Bytes v2 (ein Domain-String, die Chain-ID, dann die Bytes von Body und Auth-Info). Hedged und deterministische FIPS-204-Signaturen werden beide akzeptiert. Das normative Format ist die [QoreSign-Spezifikation für hybrides Signieren](/qoresign/spec/hybrid-signing-v1).
- Reihenfolge der Schritte: Body und Auth-Info kodieren (Gebühr und Gas festgelegt), die v2-Sign-Bytes berechnen, mit ML-DSA-87 signieren, die Erweiterung anhängen, das `SignDoc` mit secp256k1 signieren, senden.
- Schlüsselregistrierung: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, mit einem optionalen und empfohlenen Besitznachweis), klassisch vom Konto ohne Schlüssel signiert, einmal pro Hot-Adresse. QoreSign baut die ganze Nachricht.
- Eine hybride Transaktion ist etwa 4,7 KB größer als eine klassische und verbraucht mehr Gas, simulieren Sie daher immer.

### Adressen {#addresses}

- `qor1...` und `0x...` sind zwei Schreibweisen derselben 20 Byte. Gelder, die an eine von beiden gesendet werden, kommen auf demselben Guthaben an. `qorvaloper1...` ist eine Validator-Operator-Adresse und nie eine Zahlungsadresse.
- Es gibt zwei Kontoarten: `secp256k1` (Coin-Typ 118, Pfad `m/44'/118'/0'/0/i`) und eth-natives `eth_secp256k1` (Coin-Typ 60, Pfad `m/44'/60'/0'/0/i`). Dieselbe Mnemonic ergibt zwei verschiedene Konten. Eth-native Konten lassen einen Schlüssel sowohl die native Lane als auch die EVM-Lane bedienen.
- Der ML-DSA-87-Schlüssel kann aus der kanonischen Ableitung stammen (was QoreChain-Wallets und das SDK registrieren, gebunden an die Adresse `qor1` und die Mnemonic), aus einer hierarchischen Entwurfsableitung oder aus einem zufälligen, in einem HSM erzeugten Schlüssel. Jeder gültige Schlüssel funktioniert, sobald er registriert ist. Siehe [Schlüsselableitung](/qoresign/guides/key-derivation).

### Einzahlungen {#deposits}

- QoreChain finalisiert einen Block, wenn er committet wird. Es gibt keine Reorganisationen, eine Transaktion in einem committeten Block ist also nach einem Block final. Zusätzliche Bestätigungen sind eine betriebliche Entscheidung.
- Einzahlungen der nativen Lane werden gefunden mit `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` baut genau diesen Pfad.
- Gutschriftsregeln in `extractDeposits`: Eine Transaktion mit `code != 0` hat nichts bewegt; ein `transfer` ohne `msg_index` ist die Gebührenzahlung; Beträge werden nach Denom gefiltert (standardmäßig `uqor`); Ausgaben von `MsgSend` und `MsgMultiSend` sind gutschreibbar; `MsgEthereumTx` ist gutschreibbar, außer die EVM-Ausführung ist fehlgeschlagen oder die Überweisung ist eine Gas-Erstattung vom Fee-Collector; alles andere kommt mit `reason: "unsupported_message"` zur Prüfung zurück.

### Auszahlungen und Gas {#withdrawals}

- Gebühr = ceil(Gaslimit x Gaspreis) in `uqor`. Der Mindest-Gaspreis beträgt 0,1 uqor, berechnet auf das Gaslimit.
- Nehmen Sie das Gaslimit aus einer Simulation der vollständig signierten Transaktion. Verwenden Sie auf Nodes, die das Upgrade v3.2.5 angewendet haben (beide Netzwerke seit dem 29. Oktober 2026), `ceil(gas_used x 1.02) + 2000`, weil die Simulation die ML-DSA-87-Verifikation einschließt. Davor verwenden Sie `ceil((gas_used + 40000) x 1.4)`. Welche Regel gilt, erkennen Sie mit `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, nicht nach Datum.
- Bauen Sie nach der Wahl des Gaslimits `AuthInfo` neu und signieren Sie erneut: Beide Signaturen decken die Gebühr ab.
- Sequenzen: Betreiben Sie eine Signierer-Warteschlange pro Hot-Adresse oder mehrere Hot-Adressen für parallele Auszahlungen.

### EVM-Autorisierungsfenster {#evm-windows}

- Ein Fenster wird mit `/qorechain.pqc.v1.MsgOpenEVMWindow` geöffnet (`blocks` 1 bis 17.280, `max_txs` 1 bis 1.000, `max_value` in `uqor` als Wert plus maximale Gebühr, optional `native_only`, optional `allowed_targets` mit bis zu 16 Adressen) und mit `MsgCloseEVMWindow` geschlossen. Den Zustand liefert `GET /qorechain/pqc/v1/evm_window/{address}`.
- Das Öffnen eines Fensters ersetzt ein bestehendes Fenster und erhöht die Sequenz des Kontos, die zugleich seine EVM-Nonce ist: Öffnen Sie das Fenster, lesen Sie dann die Nonce.
- `eth_call` und `eth_estimateGas` brauchen kein Fenster.

## So verwenden Sie es {#how-to-use}

### Den Code beschaffen {#install}

Das Kit ist Referenzcode: Klonen Sie das Repository oder vendoren Sie den Ordner für Ihre Sprache, statt ein Paket zu installieren.

| Sprache | Beschaffen | Hängt ab von | Mindestplattform |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, dann `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | klonen, dann `cd code/python && pip install -r requirements-dev.txt`. Für `verify_tx` zusätzlich `pip install qorechain-qoresign==0.1.1` | zur Laufzeit nichts; `qorechain-qoresign` 0.1.1 (PyPI) für `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (Paket `custodykit`), oder klonen | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | klonen, dann `cd code/rust && cargo build` (nicht auf crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust-Edition 2021 |
| Java | klonen, dann `cd code/java && mvn test` (nicht auf Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign ist für jede vom Kit genutzte Sprache veröffentlicht, auch für Python. `verify_tx` im Python-Code benötigt `qorechain-qoresign` 0.1.1 von PyPI (macOS und Linux). Der Code für TypeScript, Go, Rust und Java pinnt QoreSign 0.1.0, das neben 0.1.1 weiterhin veröffentlicht ist.

### Quickstart {#quickstart}

Zielnetzwerk: Testnet (`qorechain-diana`) für alles, was die Chain liest. Die Umgebungsvariable `QORE_REST` richtet die Beispiele und die Live-Prüfungen auf einen anderen REST-Endpunkt, in der Produktion Ihr eigener Node. Die folgenden Adressen stammen aus der öffentlichen BIP-39-Testphrase und dürfen nie Gelder halten.

**1. Eine Adresse prüfen (Go, offline).** Am 27. Oktober 2026 aus einem Klon des Tags `v0.1.0` ausgeführt:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

Es gab aus (Exit-Code 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

Eine Validator-Adresse wird abgelehnt, es sei denn, Sie erlauben sie mit `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

Es gab `"valid": false` mit `"error": "KIND_NOT_ALLOWED"` und dem Detail `a validator address is not accepted here` aus und endete mit Exit-Code 1. Auch die Go-Testsuite (`go test ./...`) bestand im selben Checkout.

**2. Eine signierte Transaktion vor dem Senden dekodieren und verifizieren.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Fügen Sie `--eth` für ein eth-natives Konto hinzu. Lesen Sie die Kontonummer aus `GET /cosmos/auth/v1beta1/account_info/{address}` und den registrierten ML-DSA-87-Schlüssel aus `GET /qorechain/pqc/v1/account/{address}`.

Dasselbe in TypeScript, aus der Beispiel-Kommandozeile des Kits (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Einzahlungen scannen (Lesezugriffe im Testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Am 27. Oktober 2026 für die öffentliche Testadresse über die Testnet-Höhen 8976000 bis 8983000 ausgeführt, lieferte es eine leere Liste, was bei einer Adresse, die nie etwas erhalten hat, zu erwarten ist.

TypeScript (aus `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (aus `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Die anderen Sprachen.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Die Vektoren und die Live-Prüfungen ausführen.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Jede Sprache hat das Äquivalent (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Live-Prüfungen brauchen keine Gelder. Beim Schreiben dieser Seite wurden nur die Go-Befehle `validate` und `deposits` sowie die Go-Testsuite ausgeführt; die anderen Sprachen sind aus dem Repository beschrieben.

### Hauptfunktionen und Befehle {#api}

| TypeScript | Go | Python und Rust | Java | Was es tut |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Liefert `{ valid, kind, format, checksum, bech32, hex }` oder `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Nachrichten, Memo, Gebühr, Signierer, ML-DSA-87-Schichten und den Transaktions-Hash. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Liefert `{ valid, classical, signerKey, pq }`. Sign-Bytes-Version v1, v2 oder beide. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | REST-Pfad für eingehende Überweisungen. `event` ist `transfer` (Standard) oder `coin_received`; `limit` 1 bis 100, Standard 50; standardmäßig aufsteigend. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Einzahlungseinträge mit `creditable` und `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Helfer. |

Ebenfalls exportiert: die Konstanten `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` und `DEFAULT_TESTNET_REST`.

Beispiel-Kommandozeile in jeder Sprache:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Fehlercodes, in jeder Sprache identisch:

- Kit: `MALFORMED_TX` (die Bytes sind keine wohlgeformte Transaktion), `UNKNOWN_FIELD` (ein Feld, das der Decoder nicht kennt und das das Netzwerk ebenfalls ablehnen würde), `INVALID_ARGUMENT`.
- `validateAddress`: die elf Codes, die unter [Innovationen](#innovations) aufgeführt sind.

Chain-Ablehnungen, denen ein Verwahrer am häufigsten begegnet, als Codespace und Code (die vollständige Tabelle steht in der `docs/errors.md` des Kits):

| Codespace | Codes |
|---|---|
| `sdk` | 3 Sequenz stimmt nicht, 4 nicht autorisiert, 5 unzureichendes Guthaben, 11 kein Gas mehr, 12 Memo zu groß, 13 unzureichende Gebühr, 19 bereits im Mempool |
| `pqc` | 20 hybride Signatur erforderlich, 21 hybride Verifikation fehlgeschlagen, 7 Schlüssel bereits registriert, 26 kein EVM-Fenster (oder kein registrierter Schlüssel), 27 Fenster erschöpft oder außerhalb des Geltungsbereichs, 28 ungültige Fensterparameter |
| `stakingtier` | 13 Stake ist gesperrt |

Verzweigen Sie auf Codespace und Code zusammen und bewahren Sie das Roh-Log auf.

## So greifen Sie darauf zu {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain-ID | `qorechain-vladi` | `qorechain-diana` |
| EVM-Chain-ID | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Node-Release | v3.2.5 (angewendet am 29. Oktober 2026) | v3.2.6 (v3.2.5 angewendet) |

- Die Denomination ist `uqor` (1 QOR = 10^6 uqor; auf der EVM-Lane 1 uqor = 10^12 wei). Der Mindest-Gaspreis beträgt 0,1 uqor, die Unbonding-Frist 21 Tage und das Memo-Limit 256 Zeichen. Diese Werte wurden am 27. Oktober 2026 aus beiden Netzwerken gelesen und können sich per Governance ändern, lesen Sie sie in der Produktion daher von der Chain.
- Einzahlungen brauchen weder Schlüssel noch Registrierung. Zum Senden ist pro Hot-Adresse ein registrierter ML-DSA-87-Schlüssel nötig.
- Betreiben Sie für die Produktion eigene Full Nodes. Die öffentlichen Endpunkte sind ratenbegrenzt und für die Entwicklung gedacht. Bekommt ein Skript `403 Forbidden`, setzen Sie einen expliziten `User-Agent`-Header. Siehe [Einen Node betreiben](/developer-guide/running-a-node) und [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet).
- Das Testnet erhält jedes Node-Release vor dem Mainnet. Schalten Sie die Gas-Regeln durch Prüfen des angewendeten Upgrades um, nicht nach Datum.
- Test-Token im Testnet (Bank-Denoms der Form `erc20:0x...`, ein IBC-Token) gibt es im Mainnet nicht. Schreiben Sie in beiden Netzwerken `uqor` gut.
- Test-QOR im Testnet kommt vom Faucet des QoreChain-Dashboards und hat keinen Wert. Siehe [Mit dem Testnet verbinden](/getting-started/connecting-to-testnet).

## Sicherheitshinweise {#security}

- Beide Schlüssel einer Hot-Adresse (secp256k1 und ML-DSA-87) signieren jede Transaktion der nativen Lane. Halten Sie sie im selben Verwahrungsbereich, unter demselben Quorum und derselben Audit-Spur.
- Sichern Sie den 32-Byte-Seed des ML-DSA-87-Schlüssels (Software-Schlüssel) oder nutzen Sie das Schlüssel-Backup des HSM. Ein Konto mit registriertem Schlüssel hat keinen klassischen Pfad, der Verlust des ML-DSA-87-Schlüssels bedeutet also, dass das Konto nicht mehr signieren kann. Testen Sie die Wiederherstellung im Testnet mit `verifyTx`.
- HSMs müssen reines ML-DSA-87-Signieren (`CKM_ML_DSA` in PKCS #11 v3.2) über die Sign-Bytes mit leerem Kontext unterstützen. `HashML-DSA` wird nicht akzeptiert.
- Führen Sie `decodeTx` und `verifyTx` für jede signierte Transaktion vor dem Senden aus, in einem Prozess, der sie nicht gebaut hat.
- Die Rotation verwendet `MsgRotatePQCKey`: Beide Schlüssel signieren, die eigene Schicht der Transaktion nutzt den aktuellen Schlüssel, und die Wiederverwendung eines früheren Schlüssels wird abgelehnt. Ist der secp256k1-Schlüssel offengelegt, verschieben Sie die Gelder auf eine neue Adresse mit zwei frischen Schlüsseln und schließen Sie jedes offene EVM-Fenster.
- EVM-Fenster: Verwenden Sie `native_only` oder `allowed_targets`, das kleinste `max_value` und die kleinste Zahl `blocks`, die den Batch abdecken, und schließen Sie das Fenster nach dem Batch. Behandeln Sie `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` und `MsgAuthorizeEVMDelegation` als privilegierte Operationen.
- Schreiben Sie nie eine EVM-Transaktion gut, deren Ereignis `ethereum_tx` einen Fehler meldet, auch wenn ihr natives Ergebnis `code == 0` ist.
- Dies ist Referenzcode in Version 0.1.0. Prüfen Sie ihn, bevor Sie ihn in der Produktion einsetzen. Melden Sie Schwachstellen vertraulich an security@qore.network, auch Dokumentationsfehler, die zu einer falschen Gutschrift oder einer unbeabsichtigten Signatur führen könnten.

## Wo es veröffentlicht ist {#where-published}

Am 27. Oktober 2026 gegen die Registries geprüft.

| Registry | Paket | Version | Link |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (alle fünf Sprachen, Leitfadenseiten, Vektoren) | Release `v0.1.0`, veröffentlicht am 27. Oktober 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-custody-kit/code/go` (Beispielcode, abrufbar) | v0.1.0 (Tag `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | nicht veröffentlicht: Das Kit ist Beispielcode zum Kopieren oder Vendoren | nicht anwendbar | nicht anwendbar |

Das GitHub-Release trägt keine angehängten Dateien; das Release ist der Tag des Repositorys. Abhängigkeiten, auf denen das Kit aufbaut, alle veröffentlicht: `@qorechain/qoresign` auf npm (aktuell 0.1.1, das Kit pinnt 0.1.0), `qorechain-qoresign` auf PyPI (0.1.1), `qorechain-qoresign` auf crates.io (aktuell 0.1.1, das Kit pinnt 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 und v0.1.1) und `io.github.qorechain:qoresign` auf Maven Central (0.1.0 und 0.1.1).

Lizenz Apache-2.0. Maintainer: QoreChain Association.

## Grenzen und bekannte Probleme {#limits}

- Das Kit hält keine Schlüssel, signiert keine Transaktionen, sendet nicht und bietet kein Threshold- oder MPC-Signieren. Das Signieren übernimmt QoreSign oder Ihr HSM. Es gibt heute kein standardisiertes Threshold-Verfahren für ML-DSA; der Leitfaden dokumentiert, wie sich ein Threshold-secp256k1-Schlüssel mit einem getrennt gehaltenen ML-DSA-87-Schlüssel kombinieren lässt.
- Es trifft keine Aussage über interne Prozesse irgendeines Verwahrers. Die Checkliste beschreibt nur Anforderungen des Netzwerks.
- `validateAddress` akzeptiert 20-Byte-Adressen. Längere Modul- und Contract-Kontoadressen werden abgelehnt, wie es für Einzahlungs- und Auszahlungsadressen sein sollte.
- `extractDeposits` schreibt `MsgSend`, `MsgMultiSend` und erfolgreiche `MsgEthereumTx` automatisch gut. Andere Nachrichten (Belohnungsauszahlungen, Contract-Aufrufe, IBC-Transfers) werden zur Prüfung zurückgegeben, nicht gutgeschrieben.
- `verifyTx` verifiziert Transaktionen mit einem einzigen Signierer.
- Die SVM-Lane ist für Transaktionen nicht offen. Bauen Sie darauf keine Einzahlungs- oder Auszahlungsabläufe.
- Der eigene Code des Kits ist Beispielcode in Version 0.1.0. Funktionsnamen und Signaturen können sich zwischen Versionen ändern, und der Tag des Go-Moduls sagt keine stabile API zu.
- Beim Schreiben dieser Seite wurden nur die Go-Beispiele und die Go-Testsuite ausgeführt. Die Live-Prüfungen und die Vektorprüfungen in den anderen vier Sprachen wurden nicht erneut ausgeführt.
- Das Python-README des Repositorys kann noch sagen, dass `verify_tx` einen Importfehler auslöst, bis `qorechain-qoresign` 0.1.1 auf PyPI liegt. Diese Version ist veröffentlicht, der Hinweis ist also veraltet.
- Der Leitfaden des Kits nennt Parameter (Gas-Werte, Werte der Staking-Stufe), die am 27. Oktober 2026 gelesen wurden. Lesen Sie sie in der Produktion von der Chain.

## Verwandte Seiten {#related}

- [QoreSign](/qoresign/overview): hybrides Signieren, Verifikation, die Nachricht zur Schlüsselregistrierung und die Gas-Helfer `suggestGasLimit` und `simulateTx`.
- [QoreChain SDK](/sdk/overview): Fehlerdekodierung mit `decodeTxError`, die Composer für EVM-Fenster und der Klassifizierer für Ablehnungen.
- [Post-Quantum-Signierung](/developer-guide/post-quantum-signing): hybride Signaturen, Sign-Bytes v2 und Schlüsselregistrierung.
- [Leitfaden für Börsen und Integratoren](/developer-guide/exchange-integration): Wahl zwischen dem nativen, dem EVM- und dem SVM-Pfad.
- [EVM-Precompiles](/developer-guide/evm-precompiles) und die EVM-Lane.
- [Staking und Delegation](/user-guide/staking-and-delegation).
- [Einen Node betreiben](/developer-guide/running-a-node) und [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet).
- [QoreChain-MCP-Server](/developer-tools/mcp): `get_pq_status` und `simulate_tx` für schnelle Prüfungen.
- [QoreScan](/developer-tools/qorescan): die Kryptografie Ihres Nodes, Ihrer Endpunkte und Konten inventarisieren.
