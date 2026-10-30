---
slug: /developer-guide/exchange-integration
title: Exchange- & Integrator-Leitfaden
sidebar_label: Exchange-Integration
sidebar_position: 11
---

# Exchange- & Integrator-Leitfaden

Alles, was eine Börse, ein Verwahrer oder ein Zahlungsintegrator benötigt, um QOR zu listen und Einzahlungen sowie Auszahlungen zu verarbeiten: die Wahl einer Schnittstelle, das sichere Erkennen von Einzahlungen und das Signieren von Auszahlungen.

:::note
Dieser Leitfaden richtet sich an das **`qorechain-vladi`**-Mainnet (live seit dem 7. Juni 2026; Node-Release **v3.2.5** zum Zeitpunkt der Erstellung, angewendet auf Höhe 3.906.833 am 29. Oktober 2026 durch Governance-Vorschlag 14, nach v3.2.4 auf Höhe 3.742.566 am 23. Oktober 2026 und v3.2.3 auf Höhe 3.662.051 am 20. Oktober 2026). Üben Sie den gesamten Ablauf zunächst im **`qorechain-diana`**-Testnet. Es läuft mit **v3.2.6** (v3.2.5 wurde am 26. Oktober 2026 angewendet, v3.2.6 am 27. Oktober) und läuft seit dem 19. Oktober 2026 mit v3.2.4, sodass die unten aufgeführten Änderungen von v3.2.2 bis v3.2.4 für beide Netzwerke gelten (die Endpunkte für beide Netzwerke finden Sie unter [Networks](/appendix/networks#public-endpoints)). Wenn Sie einen eigenen Full Node betreiben, halten Sie ihn auf dem Release, das das Download-Manifest empfiehlt, und niemals unterhalb dessen `minCompatible` (**3.2.5** im Mainnet, **3.2.6** im Testnet zum Zeitpunkt der Erstellung): ein veralteter Node kann den Upgrades der Chain nicht folgen und stoppt auf der Upgrade-Höhe; siehe [Running a Node](/developer-guide/running-a-node#upgrades).

**Was sich für Integratoren in v3.2.2 und v3.2.3 geändert hat** (Signaturformat, Adressen, Dezimalstellen, Memos und Gebühren sind alle unverändert):

* **Ungeschützte (Pre-EIP-155-)Ethereum-Transaktionen werden abgelehnt**, sowohl im Mempool als auch bei der Blockausführung (v3.2.2). Die Wallet eines Einzahlers muss mit einer Chain-ID signieren; jede aktuelle Wallet tut das.
* **Modulkonten können nicht über die EVM beansprucht werden** (v3.2.2); verwenden Sie die Adresse eines Modulkontos nicht als Einzahlungs- oder Auszahlungsadresse.
* **Vesting-Konten können nur für den Signierer selbst erstellt werden** (v3.2.3); die drei Nachrichten zur Erstellung von Vesting-Konten stehen außerdem derzeit auf der Circuit-Breaker-Liste des Mainnets.
* **PQC-Schlüsselnachrichten benötigen die Hybrid-Signatur, sobald ein Konto einen Schlüssel hat** (v3.2.3): siehe [Post-Quantum Signing](/developer-guide/post-quantum-signing#key-integrity). Registrieren Sie den Schlüssel der Hot Wallet einmalig und früh.
* **EVM-Fenster können eingegrenzt werden** (v3.2.3): Eine Hot Wallet, die nur einfaches QOR sendet, kann ein `native_only`-Fenster öffnen, siehe [EVM Development](/developer-guide/evm-development#evm-window).

**Was sich für Integratoren in v3.2.4 ändert** (im Testnet seit dem 19. Oktober 2026 und im Mainnet seit dem 23. Oktober 2026). Transaktionssignierung, Adressen, Dezimalstellen, Memos und Gebühren sind unverändert, und nichts daran, wie eine Einzahlung erkannt oder eine Auszahlung signiert und gesendet wird, ändert sich:

* **Optionale Staking-Sperren (neues Modul `x/stakingtier`).** Ein Delegator kann einen Teil einer Delegation für 3, 6 oder 12 Monate sperren (Mindestsperre 10 QOR, höchstens 16 offene Sperren pro Delegator). Bei einem Konto, das keine Sperre anlegt, passiert nichts. Solange eine Sperre offen ist, kann dieser Betrag **weder undelegiert noch redelegiert werden**, auf keinem Weg (eine einfache Transaktion, `authz`, eine Gruppe oder ein Contract); wird eine Sperre vorzeitig beendet, wird eine Strafe vom gesperrten Stake verbrannt. Ein Verwahrer, der Kundengelder staked, sollte daher den Teil nicht sperren, den er möglicherweise zurückgeben muss. Lesen Sie die Parameter unter `GET /qorechain/stakingtier/v1/params`.
* **Eine neue Burn-Quelle, `staking_tier_penalty`**, erscheint in den Burn-Statistiken, sobald vorzeitige Entsperrungen stattfinden. Abgleichsjobs für das Angebot, die Burn-Quellen aufzählen, sollten einen unbekannten Quellnamen akzeptieren.
* **Node-lokale JSON-RPC-Limits** für Nodes, die Sie selbst betreiben: Request-Bodys über 256 KiB werden abgelehnt (HTTP 413), es werden höchstens 256 Requests gleichzeitig bedient (darüber hinaus HTTP 503), und ein `eth_getLogs`- oder `eth_newFilter`-Filter mit mehr als 4 Topic-Positionen, 1000 Alternativen in einer Position oder 1000 Adressen wird abgelehnt. Die Limits sind im Abschnitt `[json-rpc]` der `app.toml` konfigurierbar (siehe [Running a Node](/developer-guide/running-a-node#exposing-endpoints-for-integration)). Ein Einzahlungs-Scanner, der `eth_getLogs` mit einer langen Adressliste abfragt, sollte die Liste aufteilen.
* **Eine wiederholte Schlüsselregistrierung wird abgelehnt, bevor sie bezahlt wird.** Ein Node mit v3.2.4 lehnt zum Broadcast-Zeitpunkt eine `MsgRegisterPQCKeyV2` ab, die exakt den öffentlichen Schlüssel trägt, den das Konto bereits registriert hat, mit dem Fehler, den die Chain zurückgegeben hätte (PQC-Code 7, Konto existiert bereits), und ohne eine Gebühr zu berechnen. Prüfen Sie `GET /qorechain/pqc/v1/account/{address}`, bevor Sie den Schlüssel einer Hot Wallet registrieren, wie weiter unten empfohlen.
* **Optionales Besitz-Flag.** Der Kontoeintrag erhält ein Feld `possession_proven`, das angibt, ob bei der Registrierung ein Besitznachweis verifiziert wurde; es ändert nichts daran, wer senden oder empfangen darf. Siehe [Post-Quantum Signing](/developer-guide/post-quantum-signing#proof-of-possession).

**Nur Testnet: weitere Denominationen auf `qorechain-diana` (v3.2.6).** Das Testnet hält mehr als `uqor`: drei Test-Token (fUSD, fETH, fBTC), die als ERC-20-Token-Paare registriert sind und als Bank-Denoms mit dem Namen `erc20:<EIP-55 0x address>` bereitgestellt werden, sowie einen IBC-Token. Es sind Test-Token ohne Wert, und das Mainnet hat keinen davon (sein Bank-Angebot besteht nur aus `uqor`). Wenn Sie einen Einzahlungs-Scanner im Testnet üben, behandeln Sie die Denom als Teil des Schlüssels und halten Sie die unten stehende Regel ein: nur `uqor` gutschreiben und jede andere Denom ablehnen. Die `erc20:`-Denom ist **groß-/kleinschreibungsabhängig** (die Kleinschreibung der Adresse ist eine andere, unbekannte Denom), und die Umwandlung eines ERC-20-Guthabens in einen Bank-Coin mit `MsgConvertERC20` benötigt den Absender als `qor1`-Bech32-Adresse. Details und die drei Contract-Adressen: [EVM Development](/developer-guide/evm-development#fest-tokens).
:::

## Wahl des Integrationspfads {#choosing-a-path}

QoreChain ist eine einzige Chain mit **einem einheitlichen nativen QOR-Guthaben**, das über drei Schnittstellen zugänglich ist. **Derselbe private Schlüssel kontrolliert dieselben Mittel** unter einer Cosmos-Adresse (`qor1...`), einer EVM-Adresse (`0x...`) und einer SVM-Adresse (base58) — wählen Sie die Schnittstelle, die zu Ihrem Stack passt.

| | **A) Cosmos (nativ)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (gleicher Schlüssel) |
| Dezimalstellen (natives QOR) | **6** (`uqor`) | **18** (im Wei-Stil) | **9** (Lamports; 1 uqor = 1,000 Lamports) |
| Tooling | Cosmos SDK / CosmJS | **Standard-Ethereum** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Auszahlungssignierung | **Hybrid-PQC erforderlich** (ML-DSA-87 + secp256k1) | **Standard-secp256k1 / EIP-155, aber nur innerhalb eines offenen PQC-Autorisierungsfensters** (registrierter ML-DSA-Schlüssel + ein Fenster, das durch eine hybrid signierte Cosmos-Message geöffnet wird) | über Cosmos-Tx oder On-Node-Einreichung (Lane derzeit deaktiviert) |
| Memo-/Tag-Unterstützung | **Ja** (gemeinsame Adresse + Memo) | Nein (eine Adresse pro Nutzer) | Nein (eine Adresse pro Nutzer) |
| Einzahlungserkennung | `MsgSend`-Events scannen | Blöcke per `eth_getBlockByNumber` scannen | `getBalance` / `getSignaturesForAddress` |
| Am besten geeignet für | Cosmos-native Plattformen | **Plattformen mit bestehender EVM-Integration** | Plattformen mit Solana-Tooling |

**Empfehlung:** Verwenden Sie **Pfad A (Cosmos)** für Auszahlungen; er ist der native Weg und bietet memo-basierte gemeinsame Einzahlungsadressen. Seit v3.2.0 erfordert auch die EVM-Lane (Pfad B) einen registrierten ML-DSA-87-Schlüssel und ein offenes, begrenztes **EVM-Autorisierungsfenster**, das nur mit einer hybrid signierten Message der Cosmos-Lane geöffnet werden kann. Eine EVM-Auszahlungsschiene benötigt daher denselben Post-Quanten-Signing-Stack wie Pfad A **plus** Fensterverwaltung (siehe [Pfad B](#path-b-evm) und das [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window)). Für die **Einzahlungserkennung** mit Standard-Ethereum-Tooling bleibt Pfad B gut geeignet. Pfad C (SVM) ist auf dem Papier eine vollständige native-QOR-Schnittstelle, aber **seine Transaktions-Lane ist derzeit netzwerkweit deaktiviert** (siehe [Pfad C](#path-c-svm)) — verwenden Sie bis zur Wiedereröffnung Pfad A oder, für die Einzahlungserkennung, Pfad B.

Die drei Schnittstellen schließen sich **nicht gegenseitig aus** — Mittel, die an die `0x`-, `qor1`- oder SVM-Form desselben Schlüssels gesendet werden, sind dasselbe Guthaben.

## Betrieb des eigenen Node {#node}

Produktions-Integrationen sollten Einzahlungen gegen ihren **eigenen synchronisierten Node** verifizieren, nicht gegen einen Drittanbieter-Endpunkt. Folgen Sie [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — dort werden das vorgefertigte Binary-Bundle (mit SHA-256-Prüfsummen), das Genesis, die öffentlichen Peers, die Gebührenuntergrenze (`0.1uqor`) und ein schneller Bootstrap über den veröffentlichten Chain-Data-Snapshot behandelt. Für den Betrieb eines nicht validierenden Full Node ist keine Lizenz erforderlich.

Da QoreChain **sofortige Finalität** besitzt (keine Reorgs), ist **1 Bestätigung final**; das Abwarten von 1–2 Blöcken bietet einen komfortablen operativen Spielraum.

## Pfad A — Cosmos (nativ) {#path-a-cosmos}

Basis-REST-URL: `https://api.qore.host` (oder `http://localhost:1317` auf Ihrem Node).

### Einzahlungen überwachen

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Checkliste gegen gefälschte Einzahlungen {#anti-fake-deposit}

Buchen Sie eine Einzahlung **nur** gut, wenn **alle** der folgenden Bedingungen erfüllt sind:

1. **`tx_response.code == 0`** — die Transaktion war erfolgreich; buchen Sie niemals eine fehlgeschlagene Tx gut.
2. Die Message ist **`/cosmos.bank.v1beta1.MsgSend`** (oder ein `MsgMultiSend`-Output) — kein Contract-Aufruf und kein anderes Modul.
3. Die **`to_address`** entspricht Ihrer Einzahlungsadresse, und (beim Modell der gemeinsamen Adresse) stimmt das **`memo`** mit dem Nutzer überein.
4. Das **`denom == "uqor"`** und der `amount` ist der gutgeschriebene Wert (uqor → ÷ 10⁶ für QOR). Lehnen Sie jede andere Denom ab, auch eine `erc20:...`- oder `ibc/...`-Denom (das Testnet führt solche Denoms; das Mainnet führt heute keine, aber die Regel darf nicht davon abhängen).
5. Die Tx befindet sich in einem **committeten Block** (`height` vorhanden und ≤ der aktuellsten committeten Höhe). Die Finalität ist sofort — 1 Bestätigung ist final; warten Sie 1–2 Blöcke für zusätzlichen Spielraum.
6. Berechnen Sie den Betrag anhand der **Transfer-Events** (`coin_received` / `coin_spent`) neu und gleichen Sie ihn mit dem Message-Betrag ab — verlassen Sie sich niemals allein auf ein einzelnes Feld oder das Memo.
7. Überprüfen Sie über `GET /cosmos/tx/v1beta1/txs/{hash}` gegen Ihren **eigenen** synchronisierten Node, dass der Tx-Hash existiert.

### Auszahlungen — Hybrid-PQC-Signierung {#cosmos-withdrawals}

Das Mainnet erzwingt **Post-Quanten-Signaturen** bei Cosmos-Transaktionen (`allow_classical_fallback = false`): Jede Auszahlung benötigt eine **Hybrid-Signatur** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Einzahlungen benötigen dies **nicht** (Sie beobachten die Chain nur).

Die Signierbibliothek ist [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), die für die FIPS-204-Primitive `@qorechain/pqc` einbindet:

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

Die Signierung erfolgt in einem **zweistufigen** Ablauf (analog zu `qorechaind tx pqc cosign`):

**Schritt 1 — einmalig pro Hot Wallet: den ML-DSA-87-Schlüssel registrieren.** Diese einzelne Registrierungstransaktion wird **klassisch signiert** (Bootstrap-Ausnahme, für ein Konto, das noch keinen Schlüssel hat; sobald ein Schlüssel existiert, muss jede weitere Schlüsselnachricht hybrid signiert werden): Message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` mit `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Leiten Sie den ML-DSA-Schlüssel deterministisch ab, damit er aus Ihrem vorhandenen Secret wiederherstellbar ist — z. B. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, dann `mldsa.keygen(seed)` — und speichern Sie den Seed zusammen mit Ihrem Hot-Wallet-Schlüssel. Die Registrierung erfolgt explizit: Nichts registriert den Schlüssel für Sie, wenn erstmals eine Hybrid-Transaktion auftaucht, und ein in eine Transaktion eingebetteter Schlüssel ist nicht registriert. Die Chain lehnt `classical_only`-Schlüssel und Schlüssel ab, die keinen Post-Quanten-Schutz bieten (Code 230), und verifiziert einen optionalen Besitznachweis (Proof of Possession), wenn Sie einen anhängen (CLI: `register-key-v2 ... --pqc-key`; `@qorechain/sdk` 0.9.0 hängt von selbst einen an, und zwar über `ensurePqcRegistered`, sobald das Netzwerk v3.2.3 angewendet hat; `@qorechain/wallet-adapter` 0.4.0 tut das nicht, was akzeptiert wird). Setzen Sie das Gas explizit (der 2,592 Byte große Schlüssel benötigt mehr als die voreingestellten 200,000; verwenden Sie `--gas 600000` in der CLI, ein Gas-Limit von 600,000 im Code und eine Gebühr von mindestens Gas × 0.1 uqor, also 60,000 uqor).

**Schritt 2 — bei jeder weiteren Auszahlung: die `MsgSend` hybrid signieren.** Der Adapter bettet die ML-DSA-87-Signatur *vor* dem normalen secp256k1-`signDirect` in eine Tx-Body-Extension ein, sodass Ihr vorhandener Signer unverändert bleibt:

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Übertragen Sie die signierten Bytes:

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Fragen Sie anschließend per Polling `GET /cosmos/tx/v1beta1/txs/{hash}` ab, bis sie mit `code == 0` in einem Block erscheint.

Für ein HSM oder einen eigenen Signer in einer anderen Sprache verwenden Sie die eigenständigen [**`qorechain-pqc`**](/developer-guide/post-quantum-signing)-FIPS-204-Bibliotheken (npm, PyPI, crates.io, Maven Central, Go) und bauen Sie dieselbe Extension zusammen. Die Chain akzeptiert jede gültige FIPS-204-ML-DSA-87-Signatur, ob hedged oder deterministisch; deterministisches Signieren (FIPS-204 §3.4, der Standard der Bibliotheken) liefert eine reproduzierbare Signatur und einen reproduzierbaren Tx-Hash. Siehe [Deterministic signing](/developer-guide/post-quantum-signing#deterministic-signing) und [Fehlerbehebung für Code 21](/developer-guide/post-quantum-signing#code-21), falls eine hybride Transaktion abgelehnt wird.

### Serverseitige Alternative: `@qorechain/chain-bridge` {#chain-bridge}

Für einen vollständig serverseitigen Hot-Wallet-Worker (ohne Browser-Wallet) fasst **`@qorechain/chain-bridge`** (npm) den gesamten Ablauf — Schlüsselableitung, Hybrid-Signierung und Broadcast — in einem einzigen Aufruf zusammen. Es ist reines JavaScript (keine nativen Addons) und eignet sich für serverlose Worker:

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Hat das Konto noch keinen registrierten Schlüssel, sendet die Bibliothek selbst die explizite `MsgRegisterPQCKeyV2`-Transaktion und versucht es einmal erneut; das ist das Verhalten der Bibliothek, nicht der Chain. Eine Hot-Wallet-Schiene sollte den Schlüssel daher vorab registrieren und vor der ersten Auszahlung bestätigen (`GET /qorechain/pqc/v1/account/{address}`). Ab `chain-bridge` 0.2.3 trägt die Registrierung, wenn `cosmosRest` gesetzt ist, den Besitznachweis, sobald das Netzwerk v3.2.3 angewendet hat; und vor jeder erneuten Registrierung liest die Bibliothek die Chain: Hält das Konto bereits einen Schlüssel, der weder der kanonische noch der Legacy-Schlüssel Ihrer Mnemonic ist, wirft sie `pqc_key_mismatch` und sendet nichts (eine wiederholte Registrierung kostet ihre Gebühr und wird abgelehnt). `chain-bridge` (≥0.1.1) verwendet dieselbe kanonische, adressgebundene PQC-Ableitung wie der Rest des Stacks — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — sodass der Schlüssel mit `qorechaind tx pqc recover-key` aus der Mnemonic wiederhergestellt werden kann. Konten, die mit älterem Tooling registriert wurden, werden automatisch behandelt (Legacy-Key-Fallback) und können einmalig mit [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation) auf den kanonischen Schlüssel migriert werden.

## Pfad B — EVM {#path-b-evm}

Standard-Ethereum-Integration gegen `https://evm.qore.host` (Chain-ID **9801**) oder den Port 8545 Ihres eigenen Node.

* **Dezimalstellen:** Natives QOR hat auf der EVM-Schiene **18 Dezimalstellen** (1 uqor = 10¹² Wei). Ein Fehler hier führt zu einer um den Faktor 10¹² falschen Gutschrift von Einzahlungen.
* **Einzahlungen:** Scannen Sie Blöcke mit `eth_getBlockByNumber` nach nativen Transfers an Ihre Adressen; bestätigen Sie mit `eth_getTransactionReceipt` (`status == 0x1`). Auch die eigenen EVM-Transaktionen der Einzahler unterliegen der Fensterregel; ein Nutzer, dessen Konto weder einen registrierten Schlüssel noch ein offenes Fenster hat, kann daher keine Einzahlung aus der EVM-Lane senden (er kann stattdessen die Cosmos-Lane nutzen), und eine ohne Chain-ID signierte Transaktion (Pre-EIP-155) wird grundsätzlich abgelehnt. Ein Fenster kann eingegrenzt sein (`native_only`, `allowed_targets`), sodass eine zugelassene Einzahlung stets ein nativer Transfer oder ein vom Fenster erlaubter Aufruf ist; lesen Sie dennoch den Receipt, statt es anzunehmen.
* **Auszahlungen:** Standard-secp256k1-/EIP-155-Signierung, **aber nur von einem Konto mit registriertem ML-DSA-87-Schlüssel und offenem EVM-Autorisierungsfenster** (seit v3.2.0; siehe [EVM-Autorisierungsfenster](/developer-guide/evm-development#evm-window) und die Schritt-für-Schritt-Anleitung in [Ihre erste Transaktion](/getting-started/first-transaction#evm-window)). Eine Transaktion außerhalb eines Fensters wird abgelehnt (Codespace `pqc`, Codes 26, 27 oder 28). Das Fenster muss mit einer hybrid signierten Transaktion der Cosmos-Lane geöffnet werden, Pfad B beseitigt die Notwendigkeit der Post-Quanten-Signierung also nicht; dimensionieren Sie `max-value` so, dass es den Wert plus die maximale Gebühr (Gas-Limit × maximale Gebühr pro Gas) jeder Auszahlung abdeckt, die Sie innerhalb des Fensters erwarten (für eine Hot Wallet, die nur einfaches QOR sendet, fügen Sie beim Öffnen `--native-only` hinzu), und beobachten Sie `GET /qorechain/pqc/v1/evm_window/{address}`, damit die Hot Wallet mitten im Batch nicht leerläuft. Das Öffnen eines Fensters erhöht die Sequenznummer des Kontos, die zugleich seine EVM-Nonce ist; lesen Sie die Nonce daher erst, nachdem das Fenster offen ist.
* **Schutz vor gefälschten Einzahlungen:** Überprüfen Sie den Receipt-Status, dass es sich beim übertragenen Wert um einen **nativen** Transfer handelt (nicht um ein ERC-20-Event, das Sie nicht indexieren), und bestätigen Sie dies gegen Ihren eigenen Node.
* **Adresszuordnung:** Die `0x`-Adresse und die `qor1`-Adresse sind zwei Kodierungen desselben Kontos — die Mittel werden gemeinsam genutzt. Siehe [EVM Development](/developer-guide/evm-development).

## Pfad C — SVM (Solana-kompatibel) {#path-c-svm}

:::caution SVM-Lane derzeit deaktiviert
Die SVM-Ausführungs-Lane ist **derzeit netzwerkweit für die Transaktionseinreichung deaktiviert**, seit Chain-Version v3.1.89 (22. August) — jede Transaktion dorthin liefert `code 11, "SVM module is disabled"` zurück. Bauen Sie **keine** Einzahlungs-/Auszahlungsschiene auf Pfad C auf, bevor die Lane wieder geöffnet wird — dies ist eine zur Kompilierzeit festgelegte Deaktivierung, kein Laufzeitparameter, sie kann also nicht per Governance-Abstimmung wieder aktiviert werden; es wird erwartet, dass sie deaktiviert bleibt, bis ein externes Audit sie freigibt. Verwenden Sie stattdessen **Pfad A (Cosmos)** oder **Pfad B (EVM)**. Lesende Endpunkte (z. B. `getBalance`) antworten unter Umständen weiterhin, aber bauen Sie keine Einzahlungserkennung oder Auszahlungsabläufe gegen SVM, solange die Transaktionseinreichung deaktiviert ist.
:::

Seit v3.1.82 stellt die SVM-Schnittstelle **natives QOR** bereit (siehe [Native QOR on the SVM Interface](/developer-guide/svm-development#native-qor)):

* **Guthaben:** `getBalance` liefert Lamports zurück (÷ 10⁹ für QOR; 1 uqor = 1,000 Lamports).
* **Einzahlungen:** `getSignaturesForAddress` liefert die Transaktionshistorie für eine Adresse; System-Program-Transfers bewegen natives QOR.
* Öffentliche Endpunkte (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sind **nur lesend**; reichen Sie Transaktionen über Ihren eigenen Node ein.

## Ablaufübersicht {#flow-summary}

| Vorgang | Pfad | Signierung erforderlich? |
|---|---|---|
| **Einzahlung** (Nutzer → Plattform) | Beobachten Sie Ihren synchronisierten Node auf Transfers an Ihre Adresse (+ Memo bei Cosmos) | Nein — nur Überwachung |
| **Auszahlung** (Plattform → Nutzer) | Transfer erstellen, offline signieren, übertragen | Cosmos: Hybrid-PQC · EVM: Standard-secp256k1 innerhalb eines PQC-autorisierten Fensters |
| **Guthaben / Sweep** | REST-/EVM-/SVM-Guthabenabfrage + Transfer | Nur für den Sweep signieren |

## Weiterführende Links

* [Connecting to Mainnet](/getting-started/connecting-to-mainnet) — Node-Setup, Downloads, Snapshot
* [Running a Node](/developer-guide/running-a-node) — Deployment, Pruning, Indexing
* [Post-Quantum Signing](/developer-guide/post-quantum-signing) — die FIPS-204-Bibliotheken hinter Hybrid-Auszahlungen
* [Networks](/appendix/networks) — Chain-IDs, Endpunkte, Dezimalstellen pro Schnittstelle
