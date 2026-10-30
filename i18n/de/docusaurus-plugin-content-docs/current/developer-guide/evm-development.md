---
slug: /developer-guide/evm-development
title: EVM-Entwicklung
sidebar_label: EVM-Entwicklung
sidebar_position: 2
---

# EVM-Entwicklung

QoreChain betreibt eine vollständig EVM-kompatible Ausführungsumgebung auf der QoreChain EVM Engine und ermöglicht es, Solidity-Smart-Contracts mit vertrauten Werkzeugen bereitzustellen und mit ihnen zu interagieren. Das EVM-Modul stellt eine JSON-RPC-Schnittstelle auf **Port 8545** bereit (WebSocket auf **8546**), die gängige Ethereum-Entwicklungsworkflows unterstützt.

:::note
Die folgenden Beispiele richten sich an das **`qorechain-vladi`**-Mainnet (EVM-Chain-ID **9801**), das seit dem 7. Juni 2026 live ist und zum Zeitpunkt der Erstellung das Node-Release **v3.2.5** ausführt (angewendet durch Governance-Vorschlag 14 auf Höhe 3.906.833 am 29. Oktober 2026; v3.2.4 war auf Höhe 3.742.566 am 23. Oktober 2026 und v3.2.3 auf Höhe 3.662.051 am 20. Oktober 2026 angewendet worden). Das **`qorechain-diana`**-Testnet läuft mit **v3.2.6** (v3.2.4 seit Höhe 8.337.253 am 19. Oktober 2026, v3.2.5 auf Höhe 8.890.800 am 26. Oktober, v3.2.6 auf Höhe 8.970.638 am 27. Oktober); verwenden Sie dort die EVM-Chain-ID **9800**. Wo diese Seite etwas beschreibt, das sich zwischen den Netzwerken unterscheidet (die Testnet-Precompiles, die Fest-Test-Token), sagt sie es. Die Codebeispiele verwenden `http://localhost:8545` für einen selbst betriebenen Node; der öffentliche Mainnet-Endpunkt ist `https://evm.qore.host` und der Testnet-Endpunkt ist `https://evm-testnet.qore.host`.
:::

:::caution Eine EVM-Transaktion benötigt einen registrierten PQC-Schlüssel und ein offenes Autorisierungsfenster
Seit dem Upgrade v3.2.0 (Mainnet-Höhe 2,981,742, Testnet-Höhe 5,920,000) lässt die EVM-Lane eine Transaktion nur von einem Konto zu, das **(1) einen registrierten ML-DSA-87-Post-Quanten-Schlüssel** und **(2) ein offenes EVM-Autorisierungsfenster** besitzt, in dem noch Platz für sie ist. Sie signieren mit gewöhnlichen Werkzeugen (MetaMask, ethers.js, Hardhat, Foundry), aber ohne registrierten Schlüssel und offenes Fenster wird `eth_sendRawTransaction` abgelehnt (Codespace `pqc`, Codes 26, 27 oder 28). Lesezugriffe, `eth_call` und die Gasschätzung benötigen weder das eine noch das andere. Siehe [EVM-Autorisierungsfenster](#evm-window) weiter unten und die Schritt-für-Schritt-Anleitung unter [Ihre erste Transaktion](/getting-started/first-transaction#evm-window).

Zwei weitere Regeln gelten seit v3.2.2 im Mainnet: **Ungeschützte Transaktionen (vor EIP-155) werden abgelehnt**, sowohl vom Mempool des Nodes als auch bei der Blockausführung; signieren Sie daher mit einer Chain-ID (das tun alle aktuellen Wallets und Bibliotheken); und **Modulkonten können nicht über die EVM beansprucht werden**.
:::

---

## JSON-RPC-Endpunkt

| Eigenschaft            | Wert                                       |
| ----------------------- | ------------------------------------------ |
| Standard-URL            | `http://localhost:8545`                    |
| WebSocket-URL           | `ws://localhost:8546`                      |
| Unterstützte Namespaces | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain-ID (Mainnet)      | `9801` (`qorechain-vladi`)                 |
| Chain-ID (Testnet)      | `9800` (`qorechain-diana`)                 |
| Währungssymbol          | `QOR`                                      |

QoreChain-spezifische Lesezugriffe werden über REST (`api.qore.host`) bereitgestellt; der [unten](#custom-qor_-namespace) beschriebene JSON-RPC-Namespace `qor_` ist auf den öffentlichen Endpunkten und in der Standard-Node-Konfiguration **nicht aktiviert**. Die Standardliste `api` eines frisch initialisierten Nodes (v3.2.3 und später) lautet `eth,net,web3`; `txpool` muss ausdrücklich aktiviert werden, weil es die ausstehenden Transaktionen des Nodes veröffentlicht.

Ab dem Node-Release v3.2.4 (Mainnet seit 23. Oktober 2026, Testnet seit 19. Oktober 2026) begrenzt ein Node seinen eigenen JSON-RPC-Server: Anfragekörper über 256 KiB werden abgelehnt (HTTP 413), es werden nicht mehr als 256 Anfragen gleichzeitig bedient (darüber hinaus HTTP 503), und ein `eth_getLogs`- oder `eth_newFilter`-Filter mit mehr als 4 Topic-Positionen, 1000 Alternativen in einer Position oder 1000 Adressen wird abgelehnt. Die Grenzen sind node-lokale Einstellungen im Abschnitt `[json-rpc]` der `app.toml`; siehe [Einen Node betreiben](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Wallet-Konfiguration (MetaMask)

Fügen Sie QoreChain als benutzerdefiniertes Netzwerk in MetaMask hinzu:

| Feld                | Mainnet-Wert                | Testnet-Wert             |
| -------------------- | ---------------------------- | ------------------------- |
| Netzwerkname          | QoreChain (qorechain-vladi)  | QoreChain Diana          |
| RPC-URL               | `https://evm.qore.host`      | `https://evm-testnet.qore.host` |
| Chain-ID              | `9801`                       | `9800`                    |
| Währungssymbol        | `QOR`                        | `QOR`                     |
| Block-Explorer-URL    | `https://explore.qore.network` | *(optional)* |

Das Senden aus MetaMask erfordert zusätzlich einen registrierten PQC-Schlüssel und ein offenes [EVM-Autorisierungsfenster](#evm-window) auf dem Konto.

---

## Hardhat

Installieren Sie Hardhat und konfigurieren Sie Ihre `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Einen Contract bereitstellen (das bereitstellende Konto benötigt einen registrierten PQC-Schlüssel und ein offenes [Autorisierungsfenster](#evm-window); eine Bereitstellung zählt im Fenster als eine EVM-Transaktion):

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Tests gegen die QoreChain-EVM ausführen:

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Einen Contract mit Foundry erstellen und bereitstellen:

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Gas-Modell

QoreChain verwendet für EVM-Transaktionen ein **dynamisches EIP-1559-Basisgebührenmodell**:

* Die Basisgebühr passt sich pro Block je nach Auslastung an
* Nutzer können `maxFeePerGas` und `maxPriorityFeePerGas` festlegen
* Prioritätsgebühren gehen an den Block-Proposer

### Denominierungs-Brücke

Das native QOR-Token hat **6 Dezimalstellen** (`uqor`), während die EVM **18 Dezimalstellen** erwartet. Das Modul `x/precisebank` übernimmt die nahtlose Umrechnung:

| Kontext        | Denomination | Dezimalstellen | Beispiel                |
| --------------- | ------------ | --------------- | ------------------------ |
| Native Chain     | `uqor`       | 6                | `1000000 uqor = 1 QOR`  |
| EVM              | wei          | 18               | `1e18 wei = 1 QOR`      |

Diese Umrechnung ist transparent — wenn Sie ein Guthaben über `eth_getBalance` abfragen, wird die Antwort mit 18 Dezimalstellen in wei angegeben. Wird dasselbe Konto über das native Bank-Modul abgefragt, erscheint das Guthaben mit 6 Dezimalstellen in `uqor`.

---

## ERC-20-Token-Paare {#erc20-token-pairs}

Das Modul `x/erc20` stellt **Token-Paare** zwischen nativen Cosmos-SDK-Denominationen und ERC-20-Contracts bereit:

* Native Token können innerhalb von EVM-Contracts als ERC-20-Token verwendet werden
* Auf der EVM bereitgestellte ERC-20-Token können in native Denominationen umgewandelt werden
* Die Umwandlung ist bidirektional und wird auf Protokollebene abgewickelt

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Dies sind Transaktionen der Cosmos-Lane: In den Live-Netzwerken benötigen sie ebenfalls den hybriden Post-Quanten-Cosign (mit `--generate-only` erstellen, dann `qorechaind tx pqc cosign`; siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)). Der einfache Befehl `convert-erc20` oben wird im Node-Release v3.2.6 abgelehnt, weil die CLI einen `0x`-Absender schreibt; die funktionierende Form finden Sie unter [Umwandlung zwischen den beiden Formen](#fest-convert). Token-Paare werden unter einer berechtigungsbeschränkten Richtlinie registriert (die Governance registriert sie). Im Mainnet existiert zum Zeitpunkt der Erstellung keines; das Testnet hat die Fest-Test-Token im [nächsten Abschnitt](#fest-tokens).

## Fest-Test-Token und ERC20-Umwandlung {#fest-tokens}

:::note Nur Testnet, ohne Wert
Die Token in diesem Abschnitt existieren nur im `qorechain-diana`-Testnet (EVM-Chain-ID 9800). Es sind Test-Token für Builder und haben keinen Wert. Das Mainnet hat kein ERC-20-Token-Paar (geprüft am 27. Oktober 2026), daher existiert keine der unten stehenden Denominationen dort.
:::

Am 27. Oktober 2026 hat die Testnet-Governance (Vorschlag 26) drei ERC-20-Contracts als Token-Paare registriert. Sie geben Buildern ein zweites Token, das sie in einem [AMM-Pool](/api-reference/rest-grpc-endpoints#amm-module) mit QOR paaren können:

| Token | ERC-20-Contract (EIP-55) | Dezimalstellen | Bank-Denom |
| ----- | ------------------------ | -------------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **Die Bank-Denom lautet `erc20:<address>` mit einem Doppelpunkt, und die Adresse muss in der exakt gezeigten gemischten Groß-/Kleinschreibung nach EIP-55 stehen.** Denominationen sind groß-/kleinschreibungsabhängig: `erc20:0x97143b771d34...` (kleingeschrieben) ist ein anderer String, und eine Abfrage dafür antwortet mit `404`. Kopieren Sie die Denom von `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, das die drei Token mit ihrem `symbol` (`fUSD`, `fETH`, `fBTC`), dem Anzeigenamen `display` (`FestUSD`, `FestETH`, `FestBTC`) und den Dezimalstellen auflistet.
* **Der Faucet zahlt Bank-Coins aus.** Um ein Fest-Token aus der EVM (MetaMask, Solidity) zu verwenden, wandeln Sie den Bank-Coin zuerst mit `MsgConvertCoin` in seine ERC-20-Form um; um ein ERC-20-Guthaben wieder in die Bank-Form zu bringen (zum Beispiel, um es in der AMM zu paaren), verwenden Sie `MsgConvertERC20`. Beide werden als Nächstes beschrieben.
* **Token existieren in zwei Formen.** Ein ERC-20-Guthaben wird mit `balanceOf` des Contracts über EVM-JSON-RPC gelesen; das umgewandelte Guthaben ist ein Bank-Coin, das mit `GET /cosmos/bank/v1beta1/balances/{address}` gelesen wird. Nur die Bank-Coin-Form kann in der AMM gepaart werden. Die Umwandlung verschiebt Wert zwischen den beiden Formen; sie erzeugt ihn nicht.
* **Beträge verwenden die eigenen Dezimalstellen des Tokens** (6, 18 und 8 für fUSD, fETH und fBTC), nicht die 6 Dezimalstellen von `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Umwandlung zwischen den beiden Formen {#fest-convert}

Beide Umwandlungsnachrichten sind Transaktionen der Cosmos-Lane: Sie benötigen Ihren registrierten Post-Quanten-Schlüssel und den hybriden Cosign, wie jede andere native Transaktion (erstellen, dann `qorechaind tx pqc cosign`; siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing)). Die Gebühren müssen mindestens Gas × 0.1 uqor betragen.

:::note Was ausgeführt wurde
Die REST-Lesezugriffe auf dieser Seite (`token_pairs`, `denoms_metadata`) wurden am 27. Oktober 2026 gegen das Testnet ausgeführt. Die beiden Umwandlungsbefehle unten wurden für diese Seite **nicht** Ende-zu-Ende ausgeführt: Ihre Nachrichtenformen und die Absenderregel stammen aus dem Node-Quellcode von v3.2.6 und der Referenz des Chain-Teams. Betrachten Sie sie als die dokumentierte Form und bestätigen Sie sie zunächst mit einem kleinen Betrag.
:::

**Bank-Coin zu ERC-20: `MsgConvertCoin`.** Die `coin` ist die exakte, groß-/kleinschreibungsabhängige Bank-Denom (`erc20:<EIP-55 address>`), der `sender` ist Ihre Adresse `qor1...` (der Signierer), und der `receiver` ist eine Adresse `0x...`, die das ERC-20 halten wird. Es verbraucht etwa 432,000 Gas; setzen Sie ein Gas-Limit von 600,000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20 zu Bank-Coin: `MsgConvertERC20`.** Auch ihr Feld `sender` muss die bech32-Adresse `qor1...` des Kontos sein. Ein `0x`-Absender wird mit `decoding bech32 failed` abgelehnt. Im Node-Release v3.2.6 schreibt der CLI-Befehl `qorechaind tx erc20 convert-erc20` (das einfache Beispiel unter [ERC-20-Token-Paare](#erc20-token-pairs)) den Absender in der Form `0x` und wird aus diesem Grund abgelehnt: Verwenden Sie ihn nicht. Erstellen Sie die Nachricht selbst mit der `qor1`-Adresse als Absender, auf dieselbe Weise wie oben:

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Hier ist `receiver` das Konto `qor1...`, das den Bank-Coin erhält (das Modul akzeptiert die bech32-Form für den Empfänger einer Umwandlung in einen Bank-Coin). Der Betrag steht in den Basiseinheiten des Tokens (6, 18 oder 8 Dezimalstellen). Kopieren Sie die Denom für `MsgConvertCoin` nur aus `denoms_metadata`; die kleingeschriebene Form wird mit `token pair not found` abgelehnt.

---

## PQC und EVM-Kompatibilität

EVM-Transaktionen werden mit **klassischem ECDSA (secp256k1)** signiert, sodass MetaMask, Hardhat, Foundry, ethers.js und andere Standardwerkzeuge sie ohne Änderung erstellen und signieren. Was sich in **v3.2.0** geändert hat, ist die *Zulassung*: Eine Transaktion wird nur akzeptiert, wenn ihr Absender einen registrierten Post-Quanten-Schlüssel und ein aktives Autorisierungsfenster besitzt (nächster Abschnitt). Das Registrieren eines Schlüssels und das Öffnen eines Fensters sind Transaktionen der Cosmos-Lane und benötigen die hybride Signatur (ML-DSA-87 + secp256k1).

Für Post-Quanten-Sicherheit innerhalb von Contracts:

* Das **PQC-Verify-Precompile** (`0x0000...0A01`) verifiziert ML-DSA-87-Signaturen on-chain aus Solidity heraus. Es ist **im Testnet aktiv** (aktiviert durch Governance-Vorschlag 21, angenommen am 27. Oktober 2026) und zum Zeitpunkt der Erstellung **im Mainnet nicht aktiv**. Siehe [EVM-Precompiles: Netzwerkstatus](/developer-guide/evm-precompiles#network-status).
* **Cross-VM-Nachrichten** von der EVM zu QoreChain Native oder SVM sind Transaktionen der Cosmos-Lane und tragen wie jede andere die hybride Signatur; ihre aktuelle Verfügbarkeit finden Sie unter [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability).

---

## EVM-Autorisierungsfenster {#evm-window}

Eine Post-Quanten-Signatur kann nicht *mit* einer Ethereum-Transaktion reisen (Wallets wie MetaMask können keine zweite Signatur anhängen), also reist sie *vor* ihr. Das Konto öffnet mit der Cosmos-Lane-Nachricht `MsgOpenEVMWindow` ein begrenztes Fenster; die EVM-Lane lässt dann nur Transaktionen zu, die von einem aktiven Fenster abgedeckt sind. Ein gestohlener klassischer Schlüssel allein kann kein Fenster öffnen und kann daher nur bewegen, was ein bereits geöffnetes Fenster erlaubt.

| Grenze      | Bereich            | Bedeutung |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Wie lange das Fenster offen bleibt, in Blöcken gezählt ab dem Block, der es öffnet |
| `max-txs`   | 1 – 1,000          | Wie viele EVM-Transaktionen es zulässt |
| `max-value` | über 0, in `uqor`  | Gesamter Abfluss, den es zulässt: übertragener Wert **plus** die maximale Gebühr, die jede Transaktion zahlen könnte (Gaslimit × maximale Gebühr pro Gas), in `uqor` umgerechnet und aufgerundet |

Welche Grenze zuerst aufgebraucht ist, schließt das Fenster. Die drei Grenzen sind erforderlich; das Öffnen eines Fensters ersetzt ein bestehendes; eine Transaktion, die zugelassen wird und dann fehlschlägt, verbraucht trotzdem ihren Platz und ihr Wertbudget; Contract-Bereitstellungen zählen wie jede andere Transaktion. `blocks` ist eine Blockanzahl, keine Dauer: 17,280 Blöcke entsprechen im Mainnet etwa 15 Stunden (etwa 3.1 s pro Block) und im Testnet etwa 6 Stunden (etwa 1.3 s pro Block am 27. Oktober 2026; die Testnet-Blockzeit schwankt).

**Die Wertgrenze zählt nur natives QOR.** Ein Token-Transfer, eine Genehmigung (Approval) oder jeder andere Contract-Aufruf trägt den Wert null und wird daher nicht auf `max-value` angerechnet (nur seine maximale Gebühr). Um auch diese zu begrenzen, schränken Sie den **Scope** des Fensters ein (Mainnet v3.2.3 und später):

| Scope-Option (CLI-Flag) | Nachrichtenfeld | Was das Fenster zulässt |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Nur einfache Transfers von nativem QOR: keine Calldata, keine Contract-Erstellung, kein Empfänger, der Code trägt, keine EIP-7702-Autorisierung |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Nur Transaktionen, deren Empfänger eine der aufgelisteten 20-Byte-Adressen ist; die Contract-Erstellung wird abgelehnt |

Ein ohne Scope geöffnetes Fenster verhält sich exakt wie zuvor. Eine Transaktion außerhalb des Scopes wird mit Code 27 abgelehnt (die Meldung besagt, dass das Fenster „diese Transaktion nicht zulässt“). `GET /qorechain/pqc/v1/evm_window/{address}` und `qorechaind query pqc evm-window` melden `native_only` und `allowed_targets`, und das Ereignis `pqc_evm_window_opened` trägt sie, wenn sie gesetzt sind.

**Schritte** (die vollständige Anleitung finden Sie unter [Ihre erste Transaktion](/getting-started/first-transaction#evm-window)):

1. Registrieren Sie Ihren ML-DSA-87-Schlüssel einmalig (`tx pqc register-key-v2` oder `register-key`, mit `--gas 600000 --fees 60000uqor`; diese eine Transaktion ist von der Hybrid-Anforderung ausgenommen, sodass ein neues Konto den Einstieg schafft). Siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Öffnen Sie ein Fenster. Es ist eine Transaktion der Cosmos-Lane, also erzeugen Sie sie unsigniert und cosignen Sie sie mit Ihrem ML-DSA-Schlüssel (`max-value` akzeptiert `uqor` oder `qor`; `1000qor` sind 1,000 QOR):

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Prüfen Sie, was übrig ist: `qorechaind query pqc evm-window <address>` oder `GET /qorechain/pqc/v1/evm_window/{address}` (antwortet mit `found: false`, wenn keines vorhanden ist).
4. Senden Sie Ihre EVM-Transaktionen wie gewohnt. Das Öffnen eines Fensters ist eine Transaktion der Cosmos-Lane und erhöht die Sequenz des Kontos, die zugleich seine EVM-Nonce ist; lesen Sie die Nonce daher **nach** dem Öffnen des Fensters und signieren Sie dann.

Schließen Sie ein Fenster vorzeitig mit `qorechaind tx pqc close-evm-window` (gleiches Muster mit `--generate-only` und `cosign`), zum Beispiel wenn Sie vermuten, dass der klassische Schlüssel offengelegt wurde: Was das Fenster noch zugelassen hätte, wird ab dem nächsten Block abgelehnt.

### EIP-7702-Delegationen {#eip-7702}

Eine EIP-7702-Delegation Ihres Kontos (eine Typ-4-Transaktion) wird seit v3.2.2 nur mit der eigenen Post-Quanten-Einwilligung Ihres Kontos wirksam. Erfassen Sie die Einwilligung zuerst mit der hybrid signierten Cosmos-Lane-Nachricht `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`); sie ist einmalig verwendbar, läuft nach der angegebenen Anzahl von Blöcken ab und wird durch `close-evm-window` widerrufen. Wert, der ein delegiertes Konto verlässt, wird dem Fenster **dieses** Kontos belastet, eine fehlgeschlagene Typ-4-Transaktion behält die Autorisierungen, die sie angewendet hat, und `qorechaind tx pqc clear-evm-delegation` entfernt eine Delegation. Eine abgelehnte Delegation antwortet mit den Codes 60 bis 63. Lesen Sie die Einwilligung mit `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Ablehnung (Codespace `pqc`) | Bedeutung |
| ------------------------- | ------- |
| Code 26 | Kein offenes Fenster für den Absender, oder der Absender hat keinen registrierten PQC-Schlüssel |
| Code 27 | Das Fenster ist abgelaufen oder erschöpft (die Meldung zeigt, welche Grenze), oder die Transaktion liegt außerhalb des Scopes des Fensters |
| Code 28 | Ungültige Fenstergrenzen beim Öffnen, oder zu diesem Zeitpunkt kein registrierter Schlüssel |

Mit dem TypeScript-SDK (ab 0.8.2): `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` und `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). Das SDK 0.9.0 ergänzt `openEvmWindowMsg` um die Scope-Optionen (`nativeOnly`, `allowedTargets`) und fügt die Builder für die EIP-7702-Einwilligung hinzu (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`); Releases vor 0.9.0 bauen nur das Fenster ohne Scope, nutzen Sie für den Rest daher `qorechaind` (siehe den [SDK-EVM-Leitfaden](/sdk/guides/evm#evm-window-scope)).

---

## Benutzerdefinierter `qor_`-Namespace {#custom-qor_-namespace}

QoreChain erweitert JSON-RPC um einen `qor_`-Namespace für kettenspezifische Abfragen:

:::warning Noch nicht bereitgestellt
Kein veröffentlichter Node-Build stellt den Namespace `qor_` bisher bereit: `rpc_modules` auf den öffentlichen Endpunkten listet nur `eth`, `net`, `rpc`, `txpool` und `web3`, und jede Methode unten liefert `-32601` (Methode nicht gefunden) im Mainnet, im Testnet und auf selbst betriebenen Nodes mit der Standardkonfiguration (`eth`, `net`, `web3`). Siehe [den `qor_`-Namespace](/api-reference/json-rpc-qor_-namespace) für den Status und die REST-Alternativen (zum Beispiel `GET /qorechain/pqc/v1/account/{address}` für den Status des PQC-Schlüssels).
:::

| Methode                      | Beschreibung                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Prüft, ob ein Konto einen registrierten PQC-öffentlichen Schlüssel besitzt |
| `qor_getAIStats`            | Ruft Statistiken der KI-Engine ab (Anomaliezahlen, Risikoverteilung) |
| `qor_getCrossVMMessage`     | Fragt den Status einer Cross-VM-Nachricht anhand ihrer ID ab       |
| `qor_getPoolClassification` | Ruft die Validator-Pool-Klassifizierung ab (RPoS/DPoS/PoS)         |
| `qor_getReputationScore`    | Fragt den Reputationswert eines Validators ab                     |
| `qor_getAbstractAccount`    | Ruft die Konfiguration eines abstrakten Kontos ab                 |

Beispiel mit `curl`:

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Nächste Schritte

* [EVM-Precompiles](/developer-guide/evm-precompiles) — Referenz für die Precompile-Schnittstellen von QoreChain (drei im Testnet aktiv, keine im Mainnet)
* [Cross-VM-Interoperabilität](/developer-guide/cross-vm-interoperability) — Cross-VM-Aufrufe und ihre aktuelle Verfügbarkeit
* [Kontenabstraktion](/developer-guide/account-abstraction) — Authenticators für verknüpfte Wallets und Ausgabenregeln (im Testnet aktiviert, im Mainnet deaktiviert)
