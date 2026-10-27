---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community ist ein Kommandozeilenwerkzeug, das die Kryptografie einer QoreChain-Bereitstellung inventarisiert und das Ergebnis als CycloneDX-1.6-CBOM (kryptografische Stückliste, cryptographic bill of materials) schreibt. Es liest ein Node-Home-Verzeichnis, den Live-Zustand des Netzwerks, TLS-Endpunkte und Solidity-Quellen und hält jeden gefundenen Algorithmus, jedes Protokoll, Zertifikat und jeden Schlüssel fest, mit der Datei und Zeile oder dem Endpunkt, an dem er gefunden wurde.

Es richtet sich an Validator- und Node-Betreiber, Compliance- und Risikoteams, Auditoren, die ein Nachweispaket vorbereiten, und Solidity-Teams, die wissen wollen, von welchen Signaturverfahren ihre Verträge abhängen. Aus dem CBOM schreibt es Markdown-Berichte, die auf FINMA Guidance 05/2026, die Post-Quanten-Roadmap der EU NIS Cooperation Group und die DORA-RTS zum IKT-Risikomanagement (Artikel 6) abgebildet sind, mit einem Status pro Algorithmus gegenüber FIPS 203, 204 und 205 und NIST IR 8547.

Version **0.1.0**, veröffentlicht am 27. Oktober 2026, Apache-2.0. Es liest Mainnet (`qorechain-vladi`) und Testnet (`qorechain-diana`) über deren öffentliche REST-Endpunkte oder jeden REST-Endpunkt, auf den Sie es richten.

QoreScan ist ein Hilfsmittel zur Inventarisierung. Es ist weder eine Zertifizierung noch ein Audit oder ein Rechtsgutachten, und es stellt die Konformität mit keiner Vorschrift und keinem Standard fest. Was der Scan nicht feststellen kann, bleibt als "To be completed" stehen.

## Innovationen {#innovations}

- **Ein CBOM in einem Standardformat.** Jeder Fund ist eine CycloneDX-1.6-Komponente `cryptographic-asset` mit `cryptoProperties` (Asset-Typ, Primitiv, Parametersatz, Kurve, klassisches Sicherheitsniveau, NIST-Quantensicherheitskategorie, OID) und `evidence.occurrences` (Datei und Zeile oder Endpunkt). Zertifikate verweisen auf ihren Signaturalgorithmus und öffentlichen Schlüssel, Protokolle auf die Algorithmen, die sie verwenden, Bibliotheken auf die Algorithmen, die sie bereitstellen. Jedes in den Tests des Projekts geschriebene CBOM wird gegen das offizielle JSON-Schema von CycloneDX 1.6 validiert, und jede verwendete `bom-ref` wird auf ihre Definition geprüft, sodass sich die Ausgabe in jedem CycloneDX-1.6-Konsumenten laden lässt.
- **Chain-bewusste Quellen.** Neben Dateien und TLS liest es QoreChain selbst: die PQC-Parameter, PQC-bezogene Protokollschalter, die Konsensschlüsseltypen des aktiven Validator-Sets und die aktiven EVM-Precompiles sowie für jedes von Ihnen benannte Konto, ob es einen registrierten PQC-Schlüssel hat, dessen Algorithmus, dessen Schlüsseltyp (hybrid, nur PQC, nur klassisch) und die Größe des öffentlichen Schlüssels.
- **Hybrider Schlüsselaustausch ist sichtbar.** Ein TLS-Handshake pro Endpunkt hält Version, Cipher Suite, Schlüsselaustauschgruppe (einschließlich hybrider ML-KEM-Gruppen wie `X25519MLKEM768`), ALPN, SNI und jedes vom Server gesendete Zertifikat fest.
- **Werte privater Schlüssel werden nie gelesen.** Schlüsseldateien werden in Strukturen dekodiert, die kein Feld für den privaten Schlüssel haben, sodass diese Bytes weder dekodiert noch gespeichert, protokolliert oder geschrieben werden. Ein Test schlägt fehl, wenn diese Strukturen ein Feld bekommen, das private Daten tragen könnte, und ein weiterer Test scannt ein Node-Home mit frisch erzeugten Schlüsseln und prüft, dass keine Kodierung davon in einer Ausgabe auftaucht.
- **Jeder Algorithmus erhält eine Klassifizierung und einen Übergangsstatus.** `post-quantum`, `hybrid`, `quantum-vulnerable` oder `symmetric`, mit seiner NIST-Quantensicherheitskategorie, wo eine definiert ist, und seinem Status gegenüber FIPS 203, 204, 205 und dem Zeitplan von NIST IR 8547.
- **Reproduzierbare Ausgabe.** Der Zeitstempel des CBOM ist die aktuelle Zeit oder `SOURCE_DATE_EPOCH`, wenn gesetzt. Die Seriennummer wird aus dem Inhalt abgeleitet, sodass dieselbe Eingabe zur selben Zeit dasselbe Dokument ergibt.
- **Wrapper, die prüfen, was sie ausführen.** Die Pakete für npm und PyPI laden bei Bedarf das Release-Binary für Ihre Plattform herunter und vergleichen dessen SHA-256 mit den im Paket mitgelieferten Digests. Sie lehnen ein nicht passendes Binary ab, sowohl nach dem Download als auch bei jedem späteren Lauf der zwischengespeicherten Kopie. Bei `npm install` läuft kein Install-Skript.
- **Kein Drittanbieter-Code im Binary.** Das Binary `qorescan` nutzt für das Scannen die Go-Standardbibliothek (der JSON-Schema-Validator wird von seinen Tests verwendet). Es verwendet keinen Code aus den PQCA-CBOMkit-Projekten; seine Ausgabe lässt sich im CBOMkit-Viewer laden.

## Anwendungsfälle {#use-cases}

1. **Compliance-Team erstellt ein CBOM für eine Aufsichtsbehörde.** Ein Schweizer Finanzinstitut, das einen QoreChain-Node betreibt, muss ein Inventar der kryptografischen Verfahren über seine IKT-Systeme hinweg vorlegen, einschließlich Distributed-Ledger-Technologie (FINMA Guidance 05/2026, Abschnitt 3.2). Es führt `qorescan scan --node-home ... --network mainnet` aus, hängt das CBOM und `qorescan report --framework finma` an seine Risikoanalyse an und ergänzt die organisatorischen Abschnitte von Hand.
2. **Validator prüft den eigenen Node.** Ein Betreiber will bestätigen, welchen Konsensschlüsseltyp der Validator verwendet, ob die Schlüsseldateien für andere Nutzer lesbar sind, ob RPC- oder EVM-JSON-RPC-Listener ohne TLS erreichbar sind und ob ein Remote-Signer konfiguriert ist. `qorescan scan --node-home ~/.qorechain` hält all das fest, ohne die Werte der privaten Schlüssel zu öffnen.
3. **Konten prüfen, bevor man sich auf sie verlässt.** Ein Custody-Desk oder ein Börsenintegrationsteam will wissen, ob Treasury- oder Hot-Wallet-Adressen einen registrierten ML-DSA-87-Schlüssel haben und ob er hybrid ist. `qorescan scan --network mainnet --address qor1... --address qor1...` schreibt den PQC-Schlüsselstatus jedes Kontos ins CBOM. Siehe das [Custody-Kit](/developer-tools/custody-kit).
4. **Solidity-Team portiert Verträge.** Ein Team, das Verträge von Ethereum umzieht, will eine Liste aller Stellen, die von `ecrecover`, OpenZeppelin `ECDSA`, P-256 oder RSA abhängen, und aller Stellen, die bereits die PQC-Precompiles von QoreChain aufrufen. `qorescan solidity ./contracts` listet jede Verwendung mit Datei und Zeile auf.
5. **Prüfung von Endpunkten.** Ein Plattformteam will wissen, ob seine öffentlichen RPC-, REST- oder Wallet-API-Endpunkte mit modernen Clients einen hybriden Post-Quanten-Schlüsselaustausch aushandeln. `qorescan tls api.example.org:443` hält die ausgehandelte Gruppe, die Cipher Suite und die Zertifikatskette fest.
6. **CI-Gate bei jedem Pull Request.** Ein dApp-Repository fügt die QoreScan-GitHub-Action hinzu, sodass jede Änderung ein frisches CBOM und einen DORA- oder FINMA-Bericht als Build-Artefakte erzeugt und Reviewer sehen, wann ein neues Signaturverfahren oder ein neuer Hash in den Code gelangt.
7. **Due Diligence bei Dienstleistern.** Ein regulierter Betrieb sendet die Ausgabe von `qorescan template questionnaire` an einen Dienstleister, vorausgefüllt mit dem, was der Scan der Endpunkte dieses Dienstleisters bereits zeigt, sodass der Dienstleister nur die offenen Punkte beantwortet.
8. **EU-Einrichtungen bereiten sich auf die NIS-Roadmap und DORA vor.** Eine Einrichtung nutzt `qorescan report --framework nis` und `--framework dora`, um zu zeigen, wo ihr Inventar in den Schritt der Verwaltung kryptografischer Assets und in Artikel 6 der DORA-RTS einfließt.

## Funktionsweise {#how-it-works}

### Quellen {#sources}

- **Node-Home** (`--node-home DIR`). Liest `config/config.toml`, `config/app.toml`, `config/genesis.json`, `priv_validator_key.json`, `node_key.json` und alle Zertifikatsdateien, die sie nennen. Es hält den P2P-Transport und seine Algorithmen fest, die TLS-Zertifikate von RPC und EVM-JSON-RPC, Listener auf Nicht-Loopback-Adressen ohne TLS, einen Remote-Signer, die Schlüsseltypen und öffentlichen Schlüssel von Validator und Node, die Dateiberechtigungen der Schlüssel, die Parameter des Moduls `pqc` aus dem Genesis, die On-Chain-Algorithmen-Registry im Genesis und die Konsensschlüsseltypen der Validatoren.
- **Netzwerk** (`--network mainnet|testnet` oder `--rest URL`). Liest PQC-bezogene Protokollschalter, `pqc`-Parameter, die Konsensschlüsseltypen des aktiven Validator-Sets und die aktiven EVM-Precompiles über REST.
- **Konten** (`--address ADDR`, wiederholbar). Liest den registrierten PQC-Schlüssel jedes Kontos über REST.
- **TLS** (`--tls HOST:PORT`, wiederholbar). Ein Handshake pro Endpunkt.
- **Solidity** (`--solidity PATH`, wiederholbar). Textbasierte Erkennung von `ecrecover`, Aufrufen der Precompiles ecrecover (`0x01`), pqcVerify (`0x0A01`), pqcKeyStatus (`0x0A02`) und P-256 (`0x100`), `keccak256`, `sha256`, `ripemd160` sowie Importen der Signaturbibliotheken von OpenZeppelin, Solady und `IQorePQC.sol`. Die Precompiles pqcVerify und pqcKeyStatus sind nur im Testnet aktiv; im Mainnet ist keines aktiv. Siehe [EVM-Precompiles](/developer-guide/evm-precompiles).

### Netzwerkzugriffe {#network-reads}

Jede Anfrage an das Netzwerk ist ein HTTP GET. Gelesen werden die Route für die Node-Info, `/qorechain/pqc/v1/protocol_features`, `/qorechain/pqc/v1/params`, die Route für das neueste Validator-Set, `/cosmos/evm/vm/v1/params` und `/qorechain/pqc/v1/account/{address}`. Eine Route, die ein Node nicht bedient, wird zu einem Hinweis im CBOM, nicht zu einem Fehler.

### Klassifizierung {#classification}

ML-KEM (FIPS 203), ML-DSA (FIPS 204), SLH-DSA (FIPS 205) und LMS/XMSS sind `post-quantum`. Ein klassischer Schlüsselaustausch kombiniert mit ML-KEM ist `hybrid`. RSA, ECDSA, EdDSA, Diffie-Hellman über endliche Körper und elliptische Kurven sowie paarungsbasierte Signaturen sind `quantum-vulnerable`, mit dem Zeitplan von NIST IR 8547 "deprecated after 2030, disallowed after 2035". Blockchiffren, AEADs, Hashes, XOFs und KDFs sind `symmetric`. QoreScan wendet den Zeitplan von IR 8547 auf jede Kurve der Familien ECDSA, EdDSA und ECDH an, einschließlich secp256k1 und X25519, weil die Quantenexposition dieselbe ist. Dies sind Inventar-Klassifizierungen, keine Aussagen über eine NIST-Zulassung.

### Ausgabe {#output}

QoreScan fügt einige `qorescan:*`-Eigenschaften hinzu (Klassifizierung, Übergang nach NIST IR 8547, Standard, Quelle) und hält gescannte Fakten, Hinweise und eine Disclaimer-Eigenschaft in den Metadaten des CBOM fest. Evidence-Pfade sind relativ zum gescannten Verzeichnis.

Ein Bericht enthält die Tabelle der Framework-Zuordnung, eine Zusammenfassung nach Klassifizierung, jeden Algorithmus mit seiner NIST-Kategorie, seinem Status gegenüber FIPS 203, 204, 205 und NIST IR 8547 und seiner Evidence, dann Protokolle, Zertifikate, Schlüssel, Bibliotheken, gescannte Fakten, Scan-Hinweise und die zitierten Quellen. Organisatorische Punkte lauten "To be completed".

### Framework-Zuordnung {#frameworks}

| Framework | Quelle | Wo das Inventar als Eingabe dient |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 "Quantum computing", 9. Juli 2026, Abschnitt 3 | 3.2 Inventar (das CBOM); 3.3 kritische Daten (Schlüsselaustausch der gescannten Transporte, hybrider Signaturmodus der nativen Lane); 3.4 Krypto-Agilität (Algorithmen-Registry, Migrationsphase, Protokollschalter); 3.5 Dienstleister (Zertifikatsaussteller, der Fragebogen). 3.1 Strategie ist organisatorisch. |
| `nis` | NIS Cooperation Group, "A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography", Teil 1, v1.1, 11. Juni 2025 | Verwaltung kryptografischer Assets (das CBOM); die Meilensteine 2030 und 2035 (die Liste der quantum-vulnerable Algorithmen); Agilität. |
| `dora` | Delegierte Verordnung (EU) 2024/1774 der Kommission, Artikel 6 | 6(2)(a) und (c) Transportaufzeichnungen und Listener ohne TLS; 6(2)(d) Schlüsselaufzeichnungen (Typen und öffentliche Schlüssel); 6(3) jeder Algorithmus gegenüber FIPS und NIST IR 8547; 6(4) Registry, Migrationsphase, Schalter. 6(1) und 6(5) sind organisatorisch. |

## Anwendung {#how-to-use}

### Installation {#install}

| Kanal | Installationsbefehl | Mindestplattform |
|---|---|---|
| Release-Binary | `qorescan_0.1.0_<os>_<arch>` (oder das `.tar.gz` bzw. `.zip`; Windows-Binaries enden auf `.exe`) vom [GitHub-Release](https://github.com/qorechain/qorescan/releases/tag/v0.1.0) herunterladen und gegen `qorescan_0.1.0_checksums.txt` prüfen | macOS, Linux oder Windows auf amd64 oder arm64 |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 oder höher |
| PyPI | `pipx run qorescan scan ...` (oder `pip install qorescan`) | Python 3.9 oder höher |
| Docker | `docker build -t qorescan .` aus dem Repository (es wird kein fertiges Image veröffentlicht) | Docker; das Image ist distroless und läuft als Nutzer 65532 |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | GitHub-gehosteter oder selbst gehosteter Runner; die Action baut QoreScan mit `actions/setup-go` aus ihrem eigenen Quellcode |

Umgebungsvariablen für beide Wrapper:

| Variable | Wirkung |
|---|---|
| `QORESCAN_CACHE_DIR` | Wo das Binary zwischengespeichert wird (Standard: das Cache-Verzeichnis des Nutzers). |
| `QORESCAN_DOWNLOAD_BASE` | Von einem Mirror statt von GitHub herunterladen. Die Digest-Prüfung gilt weiterhin. |

### Quickstart {#quickstart}

QoreScan sendet GET-Anfragen und einen TLS-Handshake pro Endpunkt, signiert nichts und braucht keinen Schlüssel. Die folgenden Befehle wurden am 27. Oktober 2026 gegen das öffentliche Testnet ausgeführt, mit einem aus dem Quellcode von v0.1.0 gebauten Binary.

**1. Den Testnet-Zustand, ein Konto, das TLS des öffentlichen Testnet-REST-Endpunkts und einen Ordner mit Solidity-Quellen scannen:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

Es endete mit Exit-Code 0. Das CBOM hielt unter anderem fest: die Chain-ID `qorechain-diana`, den hybriden Signaturmodus der nativen Lane `required`, den hybriden PQC-Schlüssel des Kontos (das Testnet-Faucet-Konto), die Ed25519-Konsensschlüssel des Validator-Sets, TLS 1.3 mit der hybriden Gruppe `X25519MLKEM768` und die in den Solidity-Quellen gefundenen Algorithmen.

Ein zweiter Lauf nur der Netzwerk- und TLS-Teile, der beim Schreiben dieser Seite gemacht wurde, ergab ein CBOM mit 21 Komponenten, darunter ML-DSA-87, `X25519MLKEM768`, ein TLS-1.3-Protokolleintrag für `api-testnet.qore.host:443`, dessen Zertifikatskette und die Ed25519-Schlüssel des Validator-Sets.

**2. Einen FINMA-Bericht aus dem CBOM schreiben:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

Der Bericht beginnt mit dem Disclaimer, dann folgt die Zuordnungstabelle (Abschnitte 3.1 bis 3.5), eine Zusammenfassung nach Klassifizierung und eine Zeile pro Algorithmus mit seinem Status nach FIPS und NIST IR 8547 und seiner Evidence. Der Scan einer einzelnen Solidity-Datei, die `ecrecover` verwendet, ergab ein CycloneDX-1.6-CBOM mit einer Komponente (`ECDSA secp256k1`) und denselben Berichtskopf. Ein unbekannter Framework-Name endet mit Exit-Code 2 und einer Meldung, die `finma`, `nis` und `dora` auflistet.

**3. Den Fragebogen für Dienstleister und die Agilitätserklärung vorausfüllen:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. Den eigenen Node scannen.** Lesezugriff auf das Node-Home genügt:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Mit Docker binden Sie das Node-Home schreibgeschützt ein, damit der Container es nicht ändern kann:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. Über die Wrapper sind die Befehle dieselben:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. In GitHub Actions.** Pinnen Sie die Action und jede andere Action per Commit:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Eingaben der Action: `node-home`, `network`, `rest`, `addresses`, `tls`, `solidity` (Listen, getrennt durch Leerzeichen oder Zeilenumbrüche), `out` (Standard `qorescan.cbom.json`) und `framework`. Ausgaben: `cbom` und `report`. Die Action baut QoreScan aus ihrem eigenen Quellcode beim gepinnten Commit, es wird also kein Binary heruntergeladen.

Was für diese Seite ausgeführt wurde: der Testnet-Scan, der Solidity-Scan, der FINMA-Bericht und der Fehler bei unbekanntem Framework, mit einem aus dem Quellcode von v0.1.0 gebauten Binary. Die veröffentlichten Binaries, die Wrapper für npm und PyPI (über das Lesen ihres Paketinhalts und der Registry-Einträge hinaus), das Docker-Image und die GitHub Action wurden nicht ausgeführt.

### Befehle und Flags {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

Flags dürfen vor oder nach den Positionsargumenten stehen. `--out -` (der Standard) schreibt auf die Standardausgabe. `qorescan <command> -h` gibt die Flags eines Befehls aus.

| Befehl | Flag | Was es leistet |
|---|---|---|
| `scan` | `--node-home DIR` | Node-Home-Verzeichnis (das, welches `config/` enthält). |
| `scan` | `--network mainnet\|testnet` | Live-Zustand von `https://api.qore.host` oder `https://api-testnet.qore.host` lesen. |
| `scan` | `--rest URL` | Stattdessen einen beliebigen REST-Endpunkt verwenden, zum Beispiel Ihren eigenen Node (`http://127.0.0.1:1317`) oder ein Relay, das GET-Anfragen weiterleitet. Überschreibt `--network`. |
| `scan` | `--address ADDR` | Konto, dessen PQC-Schlüsselstatus gelesen wird. Wiederholbar. Braucht `--network` oder `--rest`. |
| `scan` | `--tls HOST:PORT` | TLS-Endpunkt für den Handshake. Wiederholbar. Port 443, wenn weggelassen. |
| `scan` | `--solidity PATH` | Verzeichnis oder `.sol`-Datei. Wiederholbar. |
| `scan`, `solidity` | `--include-deps` | Scannt auch `node_modules`, `lib`, `out`, `cache`, `artifacts` und `typechain-types`, die standardmäßig übersprungen werden. |
| `scan` | `--name NAME` | Name der gescannten Bereitstellung in den Metadaten des CBOM. |
| `scan` | `--timeout D` | Netzwerk-Timeout pro Anfrage (Standard `20s`). |
| `tls` | `--servername NAME` | SNI-Servername (Standard: der Host). |
| `tls` | `--timeout D` | Handshake-Timeout (Standard `15s`). |
| alle Scans | `--verbose` | Jede gelesene Datei und jede Anfrage auf der Standardfehlerausgabe protokollieren. |
| alle | `--out FILE` | Ausgabedatei, `-` für die Standardausgabe. |
| `report` | `--framework finma\|nis\|dora` | Das Framework, auf das abgebildet wird. Erforderlich. |
| `report`, `template` | `--cbom FILE` | Das zu lesende CBOM, `-` für die Standardeingabe. Erforderlich. |
| `template` | `agility` oder `questionnaire` | Welche Vorlage geschrieben wird. |

Weitere Befehle: `qorescan tls` ist ein eigenständiger TLS-Scan, `qorescan solidity` ein eigenständiger Solidity-Scan, `qorescan template agility` schreibt eine aus den gescannten Fakten vorausgefüllte Krypto-Agilitätserklärung, `qorescan template questionnaire` schreibt einen Fragebogen für Dienstleister mit fünf Fragen, der den fünf Maßnahmen aus Abschnitt 3 der FINMA Guidance 05/2026 folgt, und `qorescan report` akzeptiert auch ein von einem anderen Werkzeug geschriebenes CycloneDX-1.6-CBOM (die Klassifizierung richtet sich dann nach dem Algorithmusnamen).

Exit-Codes: `0` Erfolg, `1` ein Scan- oder E/A-Fehler, `2` ein Nutzungsfehler.

## Zugriff {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain-ID | `qorechain-vladi` | `qorechain-diana` |
| Von `--network` verwendetes REST | `https://api.qore.host` | `https://api-testnet.qore.host` |

- Es werden weder Schlüssel noch Konto oder Guthaben gebraucht. QoreScan signiert oder sendet nie eine Transaktion und schreibt nichts außer der von Ihnen benannten Ausgabedatei.
- Nicht jeder Node bedient alle Routen. Am 27. Oktober 2026 bediente der öffentliche Mainnet-REST-Endpunkt `/qorechain/pqc/v1/params` nicht; der Scan hält dann einen Hinweis fest und läuft weiter. Richten Sie `--rest` auf Ihren eigenen Node, um ein vollständigeres Bild zu erhalten.
- Die On-Chain-Algorithmen-Registry wird nicht über REST bereitgestellt. QoreScan liest sie aus `genesis.json`, wenn ein Node-Home gescannt wird.
- Der Scan spiegelt die Chain-Version des Nodes wider, den er liest. Protokollschalter und aktive Precompiles unterscheiden sich zwischen Mainnet und Testnet; das CBOM hält fest, was der abgefragte Node meldet.
- Wenn Ihr Rechner die öffentlichen Endpunkte nicht erreicht, nutzen Sie `--rest` mit einem Node, den Sie betreiben, oder mit einem Relay, das GET-Anfragen weiterleitet.
- Abhängigkeiten: Die Wrapper für npm und PyPI verwenden nur die eingebauten Module ihrer Sprache.

## Sicherheitshinweise {#security}

- **Werte privater Schlüssel werden nie gelesen.** Aus `priv_validator_key.json` nimmt QoreScan die Adresse, den öffentlichen Schlüssel und die Namen der Schlüsseltypen. Aus `node_key.json` nimmt es allein den Schlüsseltyp; die Node-ID wird nicht abgeleitet, weil dafür der private Schlüssel nötig wäre. Der rohe Dateipuffer wird nach dem Dekodieren überschrieben, und Dekodierfehler, die Eingaben zitieren könnten, werden nie zurückgegeben.
- Keyring-Verzeichnisse (`keyring-*`) und die durch `tls_key_file` und `tls.key-path` benannten Schlüsseldateien werden nicht geöffnet. QoreScan hält nur fest, dass sie existieren oder konfiguriert sind. Weitere PEM-Blöcke in einer Zertifikatsdatei werden übersprungen, ohne dekodiert zu werden.
- Jede Netzwerkanfrage ist ein HTTP GET. Es wird nichts geschrieben außer der Ausgabedatei.
- Die Wrapper für npm und PyPI prüfen vor jedem Lauf den SHA-256 des Binarys und lehnen eine Abweichung ab, auch bei Verwendung eines Mirrors. Für Release 0.1.0 stimmen die Digests im npm-Paket mit der Checksummen-Datei des Releases überein.
- Das Docker-Image ist distroless und läuft als Nicht-Root-Nutzer. Binden Sie das Node-Home mit `:ro` ein.
- Melden Sie Schwachstellen vertraulich an security@qore.network.

## Wo es veröffentlicht ist {#where-published}

Die Versionen wurden am 27. Oktober 2026 aus jeder Registry gelesen.

| Registry | Paket | Version | Link |
|---|---|---|---|
| GitHub-Release | `qorechain/qorescan` | v0.1.0 (veröffentlicht am 27. Oktober 2026), Binaries für darwin, linux und windows auf amd64 und arm64, dazu `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan` (Befehl `qorescan`) | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan` (Python 3.9 oder höher) | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go-Modulproxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

Quellcode: https://github.com/qorechain/qorescan (Apache-2.0, Copyright 2026 QoreChain Association). Es gibt kein Paket auf crates.io oder Maven und kein fertiges Docker-Image; bauen Sie das Image aus dem Repository. Das Repository dokumentiert jedes Flag in `docs/usage.md`, was gelesen und was nie gelesen wird in `docs/scanned-data.md`, die Framework-Zuordnung und ihre Quellen in `docs/frameworks.md` und die Grenzen in `docs/limitations.md`.

## Grenzen und bekannte Probleme {#limits}

- **Ein Hilfsmittel zur Inventarisierung.** Es zertifiziert nicht, prüft nicht und gibt keine Rechtsberatung, und seine Berichte stellen die Konformität mit keiner Vorschrift und keinem Standard fest. Organisatorische Maßnahmen (Strategie, Roadmap, Datenklassifizierung, Zuständigkeiten) bleiben als "To be completed" stehen.
- **Umfang.** QoreScan scannt nur die Quellen, auf die Sie es richten. Gespeicherte Daten, Backups, HSMs, Schlüsselverwaltungssysteme, Konfiguration von Betriebssystem und Bibliotheken, Wallets, Bridges und Off-Chain-Dienste liegen außerhalb des Scans, es sei denn, Sie fügen deren TLS-Endpunkte mit `--tls` hinzu. Bridges werden nicht gescannt.
- **Live-Zustand.** Die Algorithmen-Registry stammt aus `genesis.json` und spiegelt das Netzwerk im Genesis wider, nicht spätere Governance-Änderungen. Die Konsensschlüssel der Validatoren werden für das neueste Validator-Set gelesen.
- **TLS.** Ein Handshake mit den Standardpräferenzen des Go-Clients zeigt, was der Server mit einem modernen Client aushandelt, nicht jede Version, Suite oder Gruppe, die er akzeptiert. Ein Endpunkt hinter einem Load Balancer kann bei einer anderen Verbindung anders antworten.
- **Remote-Signer.** Ist `priv_validator_laddr` gesetzt, liegt der Validator-Schlüssel anderswo, und sein Typ ist aus dem Node-Home nicht sichtbar.
- **Solidity.** Die Erkennung ist textbasiert. Sie löst keine Importe auf, folgt keiner Vererbung und berechnet keine Adressen zur Laufzeit. Eine zur Laufzeit zusammengesetzte Precompile-Adresse wird übersehen, und eine wie ein Muster benannte Variable kann gemeldet werden. Abhängigkeiten werden übersprungen, außer Sie übergeben `--include-deps`.
- **CBOMs anderer Werkzeuge.** Berichte klassifizieren CBOMs anderer Werkzeuge allein nach dem Algorithmusnamen.
- **Daten.** NIST-Kategorien und Übergänge nach IR 8547 sind den zitierten Dokumenten mit Stand Oktober 2026 entnommen. Anwendungsspezifische Vorgaben können frühere Termine setzen.
- **Versionszeichenfolge.** Ein ohne Versions-Flag aus dem Quellcode gebautes Binary gibt `qorescan dev` aus. Verwenden Sie das Release-Binary oder die Go-Installation der getaggten Version, wenn die Version festgehalten werden soll.

## Verwandte Seiten {#related}

- [Post-Quanten-Signierung](/developer-guide/post-quantum-signing): hybrides secp256k1 plus ML-DSA-87 auf der nativen Lane und das EVM-Autorisierungsfenster.
- [Custody-Kit](/developer-tools/custody-kit): Integrationsanleitung und Referenzcode für Verwahrer und Börsen.
- [QoreSign](/qoresign/overview): Bibliotheken zum hybriden Signieren und Prüfen.
- [Einen Node betreiben](/developer-guide/running-a-node) und [einen Validator betreiben](/developer-guide/running-a-validator): Aufbau des Node-Home, Remote-Signer und Schlüsseldateien.
- [EVM-Precompiles](/developer-guide/evm-precompiles): die PQC-Precompiles `0x0A01` und `0x0A02`.
- [Post-Quanten-Bibliothek (qorechain-pqc)](/developer-tools/pqc-library): ML-DSA-87 in sechs Sprachen.
- [Mit dem Mainnet verbinden](/getting-started/connecting-to-mainnet) und [mit dem Testnet verbinden](/getting-started/connecting-to-testnet): öffentliche Endpunkte.
