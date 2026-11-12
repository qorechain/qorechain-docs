---
slug: /developer-guide/evm-window-reference
title: Referenz zum EVM-Autorisierungsfenster (v3.2.8)
sidebar_label: EVM-Fenster-Referenz
sidebar_position: 7
---

# Referenz zum EVM-Autorisierungsfenster (v3.2.8)

Eine Ethereum-Transaktion trägt genau eine secp256k1-Signatur und nichts weiter, sie kann daher nicht die Post-Quanten-Signatur (ML-DSA-87) tragen, die QoreChain bei jeder anderen Transaktion verlangt. Das **EVM-Autorisierungsfenster** schließt diese Lücke. Das Konto öffnet zuerst ein begrenztes Fenster mit einer QoreChain-Native-Nachricht, die **mit** seinem Post-Quanten-Schlüssel signiert ist, und die EVM-Lane lässt die gewöhnlichen MetaMask-, ethers.js-, Hardhat- oder Foundry-Transaktionen des Kontos nur zu, solange das Fenster sie abdeckt. Diese Seite ist die vollständige Referenz dafür, wie sich ein Fenster im Release **v3.2.8** verhält.

:::note Wo v3.2.8 läuft
Das **`qorechain-diana`**-Testnet führt **v3.2.8** seit dem 12. November 2026 aus. Das **`qorechain-vladi`**-Mainnet hat es noch nicht angewendet; im Mainnet funktioniert das Fenster wie in [EVM-Entwicklung](/developer-guide/evm-development#evm-window) beschrieben, ohne die unten mit „v3.2.8" gekennzeichneten Optionen und Regeln. Ein Node unter v3.2.8 lehnt eine Fensternachricht ab, die die neuen Listen setzt.
:::

## Warum das wichtig ist {#why}

- **Ein gestohlener klassischer Schlüssel ist nur so viel wert, wie ein offenes Fenster zulässt.** Das Fenster begrenzt die Zeit (Blöcke), die Anzahl der Transaktionen, das QOR, das abfließen kann, und optional, welche Contracts das Konto berühren darf.
- **Der Post-Quanten-Schlüssel behält die Kontrolle.** Öffnen, Einengen und Schließen eines Fensters sind allesamt hybrid signierte Native-Nachrichten. Der klassische Schlüssel allein kann nie eines öffnen.
- **v3.2.8 verschärft die Standardwerte.** Standard-Precompile-Methoden sind standardmäßig gesperrt, Signaturen, die von anderen Contracts geprüft werden, brauchen die Zustimmung des Fensters, und das Ändern des Post-Quanten-Schlüssels schließt das Fenster.

Die Kurzfassung der Ergänzungen von v3.2.8 steht unter [In v3.2.8 hinzugekommene Fensteroptionen](/developer-guide/evm-development#evm-window-v328); diese Seite wiederholt sie nicht vollständig und ergänzt die Beispiele, die Feldreferenz und die Fehlertabelle. Für das erste Fenster Schritt für Schritt siehe [Ihre erste Transaktion](/getting-started/first-transaction#evm-window).

## Öffnen, schließen und lesen {#lifecycle}

| Aktion | Nachricht | CLI | REST |
| ------ | ------- | --- | ---- |
| Öffnen (ersetzt ein offenes Fenster) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | keine (eine Transaktion) |
| Sofort schließen | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | keine (eine Transaktion) |
| Lesen | keine | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Öffnen und Schließen sind Transaktionen der Native-Lane und benötigen die hybride Signatur des Kontos (klassisch plus ML-DSA-87); das Konto muss bereits einen registrierten Post-Quanten-Schlüssel besitzen, um ein Fenster zu öffnen. Das Schließen eines Fensters zieht auch eine ausstehende EIP-7702-Zustimmung zurück. Das Öffnen **erhöht die Nonce des Kontos** (die Native-Sequenz ist die EVM-Nonce); öffnen Sie also zuerst das Fenster und lesen Sie danach die EVM-Nonce.

### CLI {#cli}

Erstellen Sie die Transaktion mit `--generate-only` und fügen Sie dann die Post-Quanten-Signatur mit `tx pqc cosign` hinzu. Die Release-Binärdatei `qorechaind` enthält `gen-key` und `cosign`; ein Community-Build nicht.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Ohne Argumente verwendet die CLI Standardwerte, die für eine Deploy-Sitzung bemessen sind: 3,600 Blöcke, 10 Transaktionen und 25 QOR. Ein auf einen Token-Contract begrenztes Fenster (ersetzen Sie die Adresse durch Ihre eigene):

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x1111111111111111111111111111111111111111 \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Schließen Sie ein Fenster vorzeitig, zum Beispiel wenn Sie vermuten, dass der klassische Schlüssel offengelegt wurde. Was das Fenster noch zugelassen hätte, wird ab dem nächsten Block abgelehnt:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Das Fenster lesen:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

Sie wollen `live: true` zusammen mit `remaining_blocks`, `remaining_txs` und `remaining_value` (uqor) sehen. Die Befehlsreferenz steht unter [Transaktionsbefehle](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Ein Konto ohne Fenster antwortet mit HTTP 200 und `found: false`, die Route lässt sich also gefahrlos abfragen. Jede Zahl ist ein JSON-String. Ein gespeichertes Fenster kann abgelaufen oder erschöpft sein: `live` sagt, ob es bei der aktuellen Höhe noch mindestens eine weitere Transaktion mit Wert null zulässt.

### TypeScript {#typescript}

Die Fenster-Helfer stecken in `@qorechain/sdk` (die Signatureinrichtung steht im [SDK-EVM-Leitfaden](/sdk/guides/evm#evm-window-scope)). `openEvmWindowMsg` nimmt jedes der unten genannten Felder entgegen, `closeEvmWindowMsg` baut die Schließen-Nachricht, `fetchEvmWindow` liest das Fenster, und `classifyEvmWindowRejection` erklärt eine Ablehnung.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract (replace the address with your own).
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x1111111111111111111111111111111111111111"], // your token contract
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` prüft die Grenzen und die Listenformate, bevor etwas signiert wird, sodass ein Fehler lokal auffällt, statt eine abgelehnte Transaktion zu kosten. `MAX_EVM_WINDOW_BLOCKS` und `MAX_EVM_WINDOW_TXS` exportieren die Grenzen. Das Zurücklesen (`fetchEvmWindow`) liefert die Grenzen, die Zähler und den Geltungsbereich von v3.2.3 (`nativeOnly`, `allowedTargets`); `validators` (Contract-Adressen), `stakingValidators` (`qorvaloper1...`) und `ibcReceivers` (`"<channel>/<receiver>"`) nimmt der Builder ab SDK 0.14.0 entgegen, das die Listen von v3.2.8 trägt; das Zurücklesen liefert sie nicht, lesen Sie sie also über REST. Das obige Beispiel verwendet `stakingValidators`; es wurde nicht mit SDK 0.14.0 ausgeführt. Setzen Sie die drei Listen nur für ein Netzwerk, das v3.2.8 betreibt: Ein Node darunter lehnt eine Fensternachricht ab, die sie setzt. Bei einem hybrid signierenden `connectTx` muss der Post-Quanten-Schlüssel bereits registriert sein.

### Im Testnet getestet {#tested}

Lauf auf `qorechain-diana` am 12. November 2026 (Release v3.2.8) mit einem eth-nativen Konto, das seinen Post-Quanten-Schlüssel registriert hatte, mit SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) und hybrider Signierung. Die Fensterfelder `validators`, `staking_validators` und `ibc_receivers` waren in den Buildern des SDK 0.13.0 nicht enthalten; SDK 0.14.0 ergänzt sie in `openEvmWindowMsg`, und dieser Lauf hat sie nicht verwendet (verwenden Sie dafür mit SDK 0.13.0 die Kommandozeile).

| Schritt | Ergebnis |
| ---- | ------ |
| `GET /qorechain/pqc/v1/evm_window/{address}` vor dem Öffnen | `found: false`, `live: false` |
| Öffnen: 300 Blöcke, 5 Transaktionen, 1,000,000 uqor | Code 0, 187,282 Gas verbraucht. Zurückgelesen: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Erneut öffnen mit `nativeOnly: true` | Code 0, 187,803 Gas verbraucht. Das neue Fenster ersetzte das alte: `native_only: true`, ein neues `opened_height` |
| Schließen | Code 0, 170,468 Gas verbraucht. Zurückgelesen: `found: false` |

Mit SDK 0.14.0 war am selben Tag ein Fenster, das mit `allowedTargets` (einer zugelassenen Zieladresse), `stakingValidators` (eine Operator-Adresse eines Validators) und `ibcReceivers` (ein Paar `channel-0/...`) geöffnet wurde, mit Code 0 und 195,233 verbrauchtem Gas erfolgreich. Das REST-Zurücklesen listete `allowed_targets` und lieferte `found: true`, `live: true`; es liefert die Listen `validators`, `staking_validators` und `ibc_receivers` nicht, bewahren Sie also die Werte auf, mit denen Sie das Fenster geöffnet haben.

`fetchEvmWindow` lieferte dieselben Felder in camelCase (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Öffnen und Schließen sind hybrid signierte Cosmos-Transaktionen, sodass bei der ersten Transaktion eines Kontos zuvor dessen Schlüssel registriert sein muss.

### Python, Go, Rust und Java {#other-languages}

Jedes SDK hat einen Builder für die Nachricht und einen REST-Lesezugriff. Alle prüfen die Grenzen der Chain lokal. Ein Sprach-Builder, der die Listen von v3.2.8 setzt, braucht SDK 0.14.0 oder neuer (Java: 0.14.0 auf Maven Central); frühere Releases bauen nur die älteren Felder.

| Sprache | Öffnen (mit allen Listen) | Schließen | Lesen | EVM-Grenzen |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` mit einem `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` mit `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | noch kein Helfer; die REST-Route lesen |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x1111111111111111111111111111111111111111"],  # your token contract
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets: []string{"0x1111111111111111111111111111111111111111"}, // your token contract
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x1111111111111111111111111111111111111111".into()], // your token contract
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x1111111111111111111111111111111111111111"), // allowedTargets: your token contract
    null,                                                   // validators
    null,                                                   // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

Das SDK öffnet nie von sich aus ein Fenster. Ein Fenster autorisiert Ausgaben, daher bleibt dieser Schritt ausdrücklich und für den Nutzer sichtbar.

## Felder {#fields}

| Feld (CLI-Flag) | Grenze | Bedeutung |
| ---------------- | ----- | ------- |
| `blocks` (erstes Argument) | 1 bis 17,280 | Das Fenster lässt nach der Öffnungshöhe plus `blocks` nichts mehr zu. Das ist eine Blockanzahl, keine Dauer: bei den heutigen Blockzeiten etwa 5 Stunden im Testnet und etwa 15 Stunden im Mainnet |
| `max_txs` (zweites Argument) | 1 bis 1,000 | Wie viele EVM-Transaktionen es zulässt |
| `max_value` (drittes Argument) | positiv | Gesamt-uqor, die das Fenster das Konto verlassen lässt: übertragener Wert **plus** die maximale Gebühr (Gaslimit mal Gebührenobergrenze) jeder zugelassenen Transaktion |
| `native_only` (`--native-only`) | true oder false | Nur einfache QOR-Transfers zulassen: keine Calldata, keine Contract-Erstellung, kein Empfänger mit Code, keine EIP-7702-Autorisierung |
| `allowed_targets` (`--allowed-targets`) | höchstens 16 `0x`-Adressen, keine Duplikate | Nur Transaktionen an diese Adressen zulassen; die Contract-Erstellung wird abgelehnt |
| `validators` (`--validators`) | höchstens 16 `0x`-Adressen, keine Duplikate | Contracts, deren Prüfung der Signatur des Kontos für die eigenen Aktionen des Kontos zählt: ein Validator-Modul, das ein Wallet-Contract aufruft, oder der ERC-4337-Einstiegspunkt. v3.2.8 |
| `staking_validators` (`--staking-validators`) | höchstens 16 `qorvaloper...`-Adressen, keine Duplikate | Validatoren, an die das Konto über das Fenster delegieren oder umdelegieren darf. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | höchstens 16 Einträge der Form `<channel>/<receiver>`, jeweils höchstens 256 Zeichen, ohne Leerzeichen oder Kommas | Exakte Ziele, an die ein nativer QOR-IBC-Transfer gehen darf. Es wird byteweise verglichen; schreiben Sie `channel-0` und den kleingeschriebenen Bech32-Empfänger also genau so, wie der Transfer sie trägt. v3.2.8 |

Jede Grenze muss angegeben werden: Die Chain lehnt eine fehlende ab, statt sie mit einem Standard zu füllen (die CLI setzt die Standardwerte der Deploy-Sitzung selbst ein). Erschöpft sich eine beliebige Grenze, endet das Fenster faktisch. Ein Fenster funktioniert nur, solange der Post-Quanten-Schlüssel des Kontos nutzbar ist, das heißt nicht leer, nicht nur klassisch und nicht durch die Governance deaktiviert.

### Was ein Fenster zählt {#counting}

Bei der Annahme, bevor die Transaktion läuft, verbraucht jede EVM-Transaktion eine von `max_txs` und addiert zum verbrauchten Wert ihren übertragenen Wert plus ihre maximale Gebühr, von der 18-stelligen EVM-Einheit in uqor umgerechnet und aufgerundet. Eine Transaktion, die angenommen wird und dann zurückgesetzt wird, hat ihren Anteil trotzdem verbraucht. Nach der Ausführung wird natives QOR, das ein Precompile im Namen des Kontos bewegt hat (eine Delegation, eine Einzahlung, ein IBC-Transfer), ebenfalls dem Fenster belastet; es zählt also gegen `max_value`, obwohl der Transaktionswert null war.

Nicht gezählt werden: `eth_call`, `eth_estimateGas` und Simulationen. Token werden überhaupt nicht bepreist: Ein ERC-20-Transfer oder eine Genehmigung trägt den Wert null; begrenzen Sie diese also mit einem Geltungsbereich (`allowed_targets`). Jede Belastung löst ein Ereignis `pqc_evm_window_used` mit den Attributen `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` und `source` aus (`ante` für die Annahme, `settlement` für die Belastung nach der Ausführung), damit eine Wallet zeigen kann, was eine Transaktion verbraucht hat. Das Öffnen und Schließen lösen `pqc_evm_window_opened` und `pqc_evm_window_closed` aus.

## Standard-Precompiles über ein Fenster {#precompile-allowlist}

Für ein Konto, das ein Fenster autorisiert, wird eine Methode eines Standard-Precompiles (Staking, Distribution, ICS-20, Gov, Slashing, die ERC-20-Token-Precompiles) abgelehnt, sofern sie nicht in der Tabelle steht und das Fenster dieses Precompile in `allowed_targets` aufführt. Die Precompile-Adressen stehen unter [EVM-Precompiles](/developer-guide/evm-precompiles); die für Staking, Distribution, ICS-20 und Gov sind `0x...0800`, `0x...0801`, `0x...0802` und `0x...0805`.

| Precompile | Methode | Zugelassen, wenn |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | die Belohnungen an das Konto selbst gezahlt werden (seine Auszahlungsadresse ist seine eigene) |
| distribution | `withdrawValidatorCommission` | der Validator der eigene des Kontos ist und an das Konto selbst zahlt |
| distribution | `depositValidatorRewardsPool` | der Validator in `staking_validators` steht und jede Münze natives QOR ist |
| staking | `delegate`, `redelegate` | der Ziel-Validator in `staking_validators` steht |
| ICS-20 | `transfer` | natives QOR, über den Port `transfer`, ohne Memo, an ein Paar in `ibc_receivers` |
| ERC-20-Token-Precompiles | `transfer`, `transferFrom`, `approve` | natives QOR; ein anderer Token nur, wenn das Fenster die Adresse dieses Tokens aufführt |

Für Staking und für das Einfordern von Belohnungen verwenden Sie die nativen Cosmos-Nachrichten (QoreX oder die qorechaind-Befehle für Staking und Distribution); die Fensterfelder oben beschreiben, was die Chain akzeptiert, aber Staking aus MetaMask ist kein unterstützter Weg.

Alles andere wird über ein Fenster abgelehnt, was auch immer es aufführt: Undelegieren, einen Unbonding-Vorgang abbrechen, Abstimmen und andere Governance-Aktionen, die Auszahlungsadresse ändern, einen Validator erstellen oder bearbeiten, Unjail, den Community-Pool finanzieren. Senden Sie diese als Post-Quanten-signierte Native-Transaktionen. Wird ICS-20 ohne `ibc_receivers` aufgeführt, wird kein Transfer zugelassen, und wird das Staking-Precompile ohne `staking_validators` aufgeführt, wird keine Delegation zugelassen.

Beispiele dafür, was aufzuführen ist:

| Ziel | Fenster |
| ---- | ------ |
| Staken, Belohnungen einfordern, undelegieren, abstimmen | Verwenden Sie die nativen Cosmos-Nachrichten (QoreX Stake und Claim oder die Befehle qorechaind tx staking / distribution); verwenden Sie dafür nicht das EVM-Fenster |
| QOR hinausbrücken | `allowed_targets` mit dem ICS-20-Precompile, plus `ibc_receivers` wie `channel-0/<receiver>` |
| Einen als ERC-20-Precompile gehaltenen IBC-Token bewegen | `allowed_targets` mit der Adresse dieses Tokens |

Einen Contract aufzuführen ist die Zustimmung des Kontos zu dem, was dieser Contract mit seinen Assets tun kann: Bei einem Vault, Router oder Token, der die Token des Kontos hält, begrenzt das Fenster nicht, welche Token bewegt werden oder wohin.

## Contract-Erstellung {#contract-creation}

Das Bereitstellen eines Contracts braucht ein **unbegrenztes** Fenster. Ein Fenster mit `native_only` oder mit `allowed_targets` lehnt die Contract-Erstellung ab. Öffnen Sie für eine Deploy-Sitzung ein einfaches Fenster (die CLI-Standardwerte sind dafür bemessen), stellen Sie bereit und schließen Sie es dann. Öffnen Sie für spätere Sitzungen ein Fenster mit `--allowed-targets <contract-address>`, um es auf Aufrufe des bereitgestellten Contracts zu beschränken. Die Deploy-Anleitung mit Hardhat und Foundry steht unter [EVM-Entwicklung](/developer-guide/evm-development).

## Permits, EIP-712-Orders und Permit2 {#permits}

Ein EIP-2612-Permit, ein Permit2-Transfer, eine signierte Order oder eine Meta-Transaktion wird von einem Contract mit dem Precompile `ecrecover` geprüft. Ab v3.2.8 (beide Netzwerke, sobald ein Netzwerk es anwendet) gelingt diese Prüfung bei einem Konto mit nutzbarem Post-Quanten-Schlüssel nur, solange das eigene **aktive** Fenster des Kontos den **prüfenden Contract** zulässt, also den Token oder Permit2 selbst und nicht den Router, der den Aufruf weiterleitet.

1. Ist das Fenster begrenzt, führen Sie den prüfenden Contract in `allowed_targets` auf (`native_only` lässt keine solche Signatur zu).
2. Öffnen Sie das Fenster, **bevor** der Nutzer signiert. Ohne aktives Fenster gilt die Signatur als ungültig, und der Contract lehnt sie ab.
3. Die Signatur selbst wird dem Fenster nie belastet, weil eine Signatur nach ihrer Verwendung öffentlich ist.
4. Ein innerhalb eines Fensters erteiltes Permit oder eine Genehmigung bleibt bestehen, nachdem das Fenster geschlossen wurde. Prüfen und widerrufen Sie Genehmigungen am Ende der Sitzung.

Konten ohne Post-Quanten-Eintrag, ein delegiertes Wallet, das seine eigene Signatur prüft, und die eigene Signatur des Absenders in einem unbegrenzten Fenster werden wie bisher wiederhergestellt. Abfragen und Gasschätzungen sind nicht betroffen.

## Schlüsseländerungen und EIP-7702-Zustimmung {#key-changes}

- **Das Rotieren, Migrieren oder erneute Registrieren des Post-Quanten-Schlüssels schließt das Fenster** und löscht jede EIP-7702-Zustimmung. Öffnen Sie das Fenster danach erneut. Planen Sie das bei Hot Wallets und Börsenintegrationen ein.
- Das Fenster, die EIP-7702-Zustimmung (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) und Nachrichten zur Verwaltung abstrakter Konten müssen die **eigene, hybrid signierte Nachricht der obersten Ebene** des Kontos sein. Sie können nicht über authz (`MsgExec`) gesendet oder einem anderen Konto erteilt werden, und eine Erteilung dieser Nachrichtentypen wird abgelehnt. Bestehende Zustimmungserteilungen dieser Art wurden beim Upgrade entfernt.
- Ein delegiertes EIP-7702-Konto, das innerhalb der Transaktion eines anderen handelt, braucht in dem Moment, in dem sein Code handelt, ein eigenes aktives Fenster. Ohne eines scheitert nur dieser Aufruf, und der aufrufende Contract sieht den Fehler, sodass eine Zahlung an ein delegiertes Konto nicht mehr die gesamte Transaktion des Zahlenden zurücksetzt.

Die Zustimmung zu einer Delegation wird mit `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` erfasst und mit `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` gelesen; siehe [EIP-7702-Delegationen](/developer-guide/evm-development#eip-7702).

## Geltende Grenzen {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

Das Testnet antwortete am 12. November 2026 mit `tx_max_gas` **30000000** und `precompile_input_max_bytes` **16384**:

| Grenze | Wert | Bedeutung |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | Das meiste Gas, das eine EVM-Transaktion anfordern darf; darüber wird die Transaktion abgelehnt, bevor sie läuft. Die EVM-Läufe, die von einer Native-Nachricht gestartet werden, teilen sich dasselbe Budget |
| `precompile_input_max_bytes` | 16,384 | Die größte Eingabe, die ein geschütztes zustandsändernes Precompile akzeptiert |
| Fenster-`blocks` | 17,280 | Längstes Fenster |
| Fenster-`max_txs` | 1,000 | Meiste Transaktionen in einem Fenster |
| Listeneinträge | 16 pro Liste | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

Die Antwort enthält auch ein Objekt `limits` mit den von der Governance gesetzten Werten; lesen Sie die obersten Felder `tx_max_gas` und `precompile_input_max_bytes`, das sind die geltenden Werte. Die Route wird ab v3.2.8 bedient, das öffentliche Mainnet antwortet daher mit `501 Not Implemented`, bis es aktualisiert wird.

Ein zu einem normalen Gaspreis geöffnetes Fenster zählt trotzdem die maximale Gebühr: Ein Gaslimit von 30,000,000 bei einer Gebührenobergrenze von 100 gwei zählt für eine Transaktion 3 QOR gegen `max_value`.

## Fehler {#errors}

Ablehnungen kommen mit dem Codespace `pqc` zurück. Über EVM-JSON-RPC trifft eine Ablehnung als Broadcast-Fehler ein, der die Meldung trägt, aber keinen Codespace; gleichen Sie daher auch den Text ab (die SDK-Klassifizierer tun das).

| Code | Meldung | Ursache | Was zu tun ist |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | Kein Fenster, kein registrierter Post-Quanten-Schlüssel oder das Fenster ist abgelaufen | Zuerst einen Schlüssel registrieren, falls keiner da ist, dann ein Fenster öffnen |
| 27 | `EVM authorisation window exhausted` | Eine Grenze ist aufgebraucht, oder die Transaktion liegt außerhalb des Geltungsbereichs des Fensters (einschließlich eines Standard-Precompiles, das das Fenster nicht aufführt, oder der Contract-Erstellung unter einem begrenzten Fenster) | Ein neues Fenster mit größeren Grenzen oder dem benötigten Geltungsbereich öffnen |
| 28 | `invalid EVM authorisation window` | Eine Öffnungsanfrage außerhalb der Grenzen oder an diesem Punkt kein nutzbarer Schlüssel | `blocks`, `max_txs`, `max_value` und die Listen prüfen; den Schlüssel registrieren oder reparieren |
| 62 | `delegated account has no window covering this action` | Ein delegiertes Konto hat gehandelt, oder der Absender hat mehr bewegt, als sein Fenster abdeckt, ohne abdeckendes Fenster. Ab v3.2.8 lässt dieselbe Regel nur den fehlerhaften Aufruf scheitern | Ein Fenster für dieses Konto öffnen, das die Aktion zulässt |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Eine Methode eines Standard-Precompiles, deren Native-Nachricht abgeschaltet ist | Abwarten; am Fenster ist nichts zu ändern |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Ein wertbewegendes Precompile, das über Code erreicht wurde, für ein Konto, dessen Fenster es nicht aufführt | Das Precompile zu `allowed_targets` hinzufügen |
| nonce | `nonce too low` | Die EVM-Transaktion wurde signiert, bevor das Fenster geöffnet wurde (das Öffnen erhöht die Nonce) | Die Nonce neu lesen und erneut signieren |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | Eine ohne Chain-ID signierte Transaktion | Die Chain-ID in der Netzwerkkonfiguration des Werkzeugs setzen |

`classifyEvmWindowRejection(err)` im TypeScript-SDK liefert `"no-pqc-key"`, `"no-window"`, `"exhausted"` oder `"invalid"`; die anderen SDKs haben einen entsprechenden Klassifizierer (`describe_evm_window_error` in Python, `tx.ClassifyEVMWindowError` in Go, `classify_evm_window_error` in Rust, `EvmWindowIssue.classify` in Java).

## Was das Fenster nicht regelt {#outside}

Das Fenster regelt die EVM-Lane, also Transaktionen, die allein mit dem klassischen Schlüssel signiert sind. Folgendes wird ihm nicht belastet, weil jedes seine eigene Post-Quanten-Signatur trägt oder von einem Modul für ein Konto gestartet wird, das signiert hat:

- Native-Lane-Nachrichten, die das Konto selbst signiert: Bank-Sends, Staking, Governance und ein `MsgCrossVMCall` in die EVM, der als die eigene `0x`-Adresse des Signierenden läuft.
- Ausführungen abstrakter Konten, die durch die Authentifikatoren des Kontos autorisiert sind.
- ERC-20-Konvertierungen und IBC-Callbacks, die von Modulen ausgeführt werden.

Ein Cross-VM-Aufruf in die EVM, den der Absender nicht selbst gesendet hat (zum Beispiel unter einer authz-Erteilung), läuft unter dem Fenster des Absenders und braucht dessen Zulassung des Ziels. Die Cross-VM-Bridge `0x0901` braucht ein Fenster, das sie aufführt. Siehe [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability).

## Ablauf mit MetaMask und QoreX {#qorex-flow}

MetaMask signiert mit einem Ethereum-Schlüssel, dem Schlüssel eines **Kontos im Ethereum-Stil (Coin 60)**, und MetaMask kann keine Native-Nachricht erzeugen. QoreX ist der Ort, an dem ein solches Konto sein Fenster öffnet; die eigenen Sends von QoreX nutzen die Native-Lane und brauchen nie eines.

1. Fügen Sie in QoreX das Coin-60-Konto für Ihre MetaMask-Phrase hinzu oder stellen Sie es wieder her (siehe [Eine Phrase aus MetaMask oder dem Dashboard wiederherstellen](/qorex/getting-started#restore-dashboard)). Das Konto braucht einen registrierten ML-DSA-87-Schlüssel; Ihr erster QoreX-Transfer registriert ihn.
2. Öffnen Sie die Karte **EVM-Zugriffsfenster** (App: Einstellungen, Sicherheit, EVM-Zugriffsfenster; Erweiterung: die Schaltfläche **EVM-Zugriffsfenster** im Popup) und wählen Sie, wie viele Blöcke (bis zu 17,280), wie viele Transaktionen (bis zu 1,000) und die Ausgabenobergrenze in QOR. Die Obergrenze deckt jeden Betrag plus seine maximale Gebühr. Die Standardwerte sind 300 Blöcke, 5 Transaktionen und 1 QOR.
3. Genehmigen Sie die hybrid signierte Nachricht. Ein neues Fenster ersetzt ein offenes, und das Öffnen erhöht Ihre Nonce; senden Sie aus MetaMask also erst danach, eine zuvor vorbereitete Transaktion wird mit „nonce too low" abgelehnt.
4. Senden Sie aus MetaMask gegen die Chain-ID 9800 (Testnet) oder 9801 (Mainnet). Wenn Sie fertig sind, verwenden Sie **Fenster schließen**, das nur angeboten wird, solange ein Fenster aktiv ist.

Die QoreX-Karte setzt die drei Grenzen. Sie bietet keinen Bildschirm für die Geltungsbereichslisten (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`); ein begrenztes Fenster stammt daher von `qorechaind` oder einem SDK. Die Karte und ihre vier Zustände siehe [EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window).

## Verwandte Seiten {#related}

- [EVM-Entwicklung](/developer-guide/evm-development): die Laufzeitumgebung, Gaslimits und die [Fensteroptionen von v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [EVM-Precompiles](/developer-guide/evm-precompiles)
- [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability)
- [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)
- [SDK-EVM-Leitfaden](/sdk/guides/evm#evm-window-scope)
- [Transaktionsbefehle](/cli-reference/transaction-commands#open-evm-window) und [Abfragebefehle](/cli-reference/query-commands)
- [REST- und gRPC-Endpunkte](/api-reference/rest-grpc-endpoints)
- [Ihre erste Transaktion](/getting-started/first-transaction#evm-window)
- [QoreX: EVM-Zugriffsfenster](/qorex/security-and-recovery#evm-window)
