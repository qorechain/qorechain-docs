---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Der Q-Day Counter ist das kleinste nützliche QoreChain-EVM-Projekt: ein Solidity-Contract, der eine Zahl speichert, ein Hardhat-Projekt, das ihn auf dem Testnet `qorechain-diana` bereitstellt, und ein kurzes Skript, das ihn liest und hochzählt. Es ist die Vorlage `hardhat` von `create-qorechain-dapp`, ergänzt um ein kleines Skript `interact`.

## Was es zeigt {#shows}

- **Hybride Signierung gehört zum Bereitstellungspfad.** Vor jeder EVM-Transaktion, auch vor dem Bereitstellen eines Contracts, braucht das Konto einen registrierten ML-DSA-87-Schlüssel und ein aktives EVM-Autorisierungsfenster. Das Fenster wird durch eine Nachricht der Native Lane geöffnet, die sowohl mit secp256k1 als auch mit ML-DSA-87 signiert ist (hybrid), und die Chain verifiziert beide Signaturen.
- **Eine hybrid signierte Transaktion, On-Chain verifiziert.** Der Schritt `pnpm window open` sendet diese Transaktion. Sie können sie im Explorer nachschlagen und das eigene Urteil der Chain sehen.
- **Ihre gewohnten EVM-Werkzeuge funktionieren weiter.** Hardhat, Ignition und viem senden gewöhnliche Ethereum-Transaktionen. Der Post-Quanten-Schutz sitzt im Fenster, sodass ein gestohlener secp256k1-Schlüssel allein nicht vom Konto ausgeben kann.

Ein Quantencomputer, der groß genug ist, um secp256k1 zu brechen, würde Angreifern erlauben, klassische Signaturen zu fälschen. QoreChain verlangt für das Konto eine zweite Post-Quanten-Signatur (ML-DSA-87, FIPS 204). Der Counter zeigt den ganzen Entwickler-Kreislauf mit eingeschalteter Regel: Schlüssel registrieren, Fenster öffnen, bereitstellen, aufrufen, lesen.

## Bevor Sie anfangen {#prerequisites}

Sie brauchen ein Terminal unter macOS, Linux oder Windows mit WSL oder Git Bash und diese Werkzeuge:

| Werkzeug | Benötigte Version | Prüfen mit |
| --- | --- | --- |
| Git | jede aktuelle Version | `git --version` |
| Node.js | 20.12 oder neuer (22 LTS empfohlen) | `node --version` |
| pnpm | 9 oder neuer | `pnpm --version` |

Installieren Sie Node.js von https://nodejs.org. Wenn `pnpm --version` fehlschlägt, installieren Sie pnpm mit `npm install -g pnpm` (oder `corepack enable`) und prüfen Sie erneut.

Außerdem brauchen Sie ein kostenloses Konto im [QoreChain-Dashboard](https://dashboard.qorechain.io), um den Faucet zu nutzen. In dieser Anleitung verwenden Sie nie eine echte Wallet: Alles Folgende nutzt ein Wegwerf-Testnet-Konto, und Test-QOR hat keinen Wert.

## Schritt für Schritt {#steps}

### 1. Den Code holen {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Die Abhängigkeiten installieren {#step-install}

```sh
pnpm install
```

### 3. Tests und Build ausführen {#step-test}

Die Tests laufen auf einer lokalen simulierten Chain. Sie brauchen weder einen Schlüssel noch ein Netzwerkkonto.

```sh
pnpm test
pnpm build
```

Sie sollten `2 passing` für die `Counter`-Tests sehen.

### 4. Die Testnet-Schlüsseldatei erstellen {#step-account}

Erstellen Sie die Einstellungsdatei aus der Vorlage:

```sh
cp .env.example .env
```

Die Datei `.env` enthält einen Wegwerf-Schlüssel. Committen Sie sie deshalb nie und verwenden Sie den Schlüssel nirgendwo sonst. Öffnen Sie `.env` in einem beliebigen Editor. Sie tragen zwei Werte ein.

**a. Ein privater Wegwerf-Schlüssel.** Erzeugen Sie einen zufälligen 32-Byte-Schlüssel:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Kopieren Sie den ausgegebenen Wert `0x...` als `PRIVATE_KEY=0x...` in `.env` und ersetzen Sie damit den Platzhalter aus lauter Nullen.

**b. Ein Post-Quanten-Wiederherstellungscode.** Der ML-DSA-87-Schlüssel des Kontos wird aus einem separaten Wiederherstellungscode abgeleitet. Erzeugen Sie einen:

```sh
pnpm window recovery-code
```

Kopieren Sie die ausgegebene Zeile `QRC1-...` als `QORE_PQC_RECOVERY_CODE=QRC1-...` in `.env`. Bewahren Sie diesen Code zusammen mit dem privaten Schlüssel auf und verwenden Sie immer denselben: Ein neuer Code gibt dem Konto einen anderen ML-DSA-87-Schlüssel.

Lassen Sie `QORE_MNEMONIC` leer und behalten Sie `QORE_NETWORK=testnet`. Ihre `.env` sieht jetzt so aus (Platzhalter dargestellt):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Ihre Kontoadresse anzeigen {#step-address}

```sh
pnpm window status
```

Die erste Zeile gibt Ihr Konto als `0x...` und in seiner Form `qor1...` aus. Zu diesem Zeitpunkt steht dort auch, dass der Schlüssel nicht registriert ist und kein Fenster existiert. Kopieren Sie die Adresse `qor1...`.

### 6. Test-QOR vom Faucet holen {#step-faucet}

1. Öffnen Sie https://dashboard.qorechain.io/faucet und melden Sie sich an.
2. Fügen Sie Ihre Adresse `qor1...` ein und fordern Sie das QOR an (100 QOR einmal alle 24 Stunden).
3. Warten Sie ein paar Sekunden und führen Sie dann `pnpm window status` erneut aus. Das Konto existiert jetzt on-chain.

### 7. Schlüssel registrieren und Fenster öffnen {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

Die Registrierung ist die einzige Nachricht, die die Chain klassisch signiert akzeptiert, weil noch kein Schlüssel on-chain ist, gegen den geprüft werden könnte. Das Öffnen des Fensters ist hybrid signiert. Behalten Sie den Transaktions-Hash, den `window open` ausgibt; Sie schlagen ihn im letzten Schritt nach.

### 8. Den Contract bereitstellen {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

Der Befehl gibt die Adresse des bereitgestellten `Counter` aus (`0x...`).

### 9. Lesen und hochzählen {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Im Explorer nachschlagen {#step-explorer}

1. Öffnen Sie https://explore.qore.network und schalten Sie die Netzwerkauswahl auf **Testnet**.
2. Suchen Sie nach dem Hash, den `pnpm window open` ausgegeben hat. Die Transaktion zeigt eine Post-Quanten-Signatur, die die Chain verifiziert hat.
3. Suchen Sie nach dem Hash der Transaktion `increment`, den `pnpm interact` ausgegeben hat, oder nach der `Counter`-Adresse aus Schritt 8, um den Contract-Aufruf zu sehen.

Der [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) zeigt dieselbe Art von Nachweis Byte für Byte.

## Was Sie sehen sollten {#result}

- `pnpm test` gibt `2 passing` aus.
- `pnpm window status` gibt das Konto aus (`0x...` mit seiner Form `qor1...`), `PQC key: registered` und `window: live` mit den verbleibenden Blöcken, Transaktionen und dem verbleibenden Wert.
- `pnpm deploy:testnet` gibt die Adresse des bereitgestellten `Counter` aus (`0x...`).
- `pnpm interact` gibt die Counter-Adresse aus, `count`, den Transaktions-Hash von `increment`, `status: success` mit der Blocknummer, den neuen `count` und einen Link zur Transaktion im Explorer.
- Im Explorer (Testnet) ist die Transaktion `window open` als mit beiden Signaturen verifiziert markiert.

Wenn ein Schritt fehlschlägt, führen Sie zuerst `pnpm window status` aus: Es sagt Ihnen, ob der Schlüssel oder das Fenster fehlt. Wird eine Transaktion abgelehnt, nachdem das Fenster aufgebraucht ist, öffnen Sie mit `pnpm window open` ein neues.

## Der Code {#code}

Der Contract (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

Der hybrid signierte Teil von `scripts/window.ts` (die Fensternachricht und der Signer):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc` ist das vereinheitlichte Konto, das aus Ihrem Schlüsselmaterial abgeleitet wird, und `net` ist der Netzwerkeintrag für `QORE_NETWORK` (Standard `testnet`, Chain-ID `qorechain-diana`). Die Gebühr, die das Skript verwendet, beträgt 100000 `uqor` bei einem Gas-Limit von 800000, weil hybride Transaktionen groß sind. Die Fenstergröße lässt sich in `.env` ändern mit `QORE_WINDOW_BLOCKS` (Standard 600), `QORE_WINDOW_TXS` (Standard 5) und `QORE_WINDOW_MAX_UQOR`.

## Verwendete Pakete {#packages}

| Paket | Version | Verwendet für |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hybride Signierung, PQC-Schlüsselregistrierung, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM-Fenster-Helfer (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Senden der Transaktion der Native Lane |
| `hardhat` | ^3.21.1 | Kompilieren, Testen, Ignition-Bereitstellung |
| `viem` | ^2.47.6 | Lesen und Schreiben des Contracts |
| `tsx` | ^4.19.0 | Ausführen der TypeScript-Skripte |
| `typescript` | ^5.6.3 | Typprüfung |

Sie können dasselbe Projekt selbst per Scaffolding erzeugen mit `npx create-qorechain-dapp my-app -t hardhat --network testnet`. Siehe [Scaffolder und CLI](/developer-tools/scaffolders-and-cli) und [SDK installieren](/sdk/install).

## Netzwerkdetails {#networks}

| Eintrag | Wert |
| --- | --- |
| Netzwerk | Testnet `qorechain-diana` |
| EVM-Chain-ID | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM-RPC | `https://evm-testnet.qore.host` |

Quelle: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
