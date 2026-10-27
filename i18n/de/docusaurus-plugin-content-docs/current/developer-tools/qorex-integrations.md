---
slug: /developer-tools/qorex-integrations
title: QoreX-Integrationen
sidebar_label: QoreX-Integrationen
sidebar_position: 22
---

# QoreX-Integrationen (`@qorechain/qorex-*`)

Die QoreX-Integrationen sind sechs kleine npm-Pakete für dApp-Entwickler, die möchten, dass die [QoreX-Wallet](/qorex/overview) in einem EVM-, Cosmos- oder Solana-Frontend funktioniert, und für Teams, die diese Frontends testen. Drei sind Wallet-Connectoren für beliebte Bibliotheken (RainbowKit, Interchain Kit, cosmos-kit), eines enthält die gemeinsamen Typen und Erkennungshelfer, und zwei sind Test-Tooling (eine Mock-Wallet und Playwright-Fixtures). Alle sechs haben die Version **0.1.0**, wurden am 27. Oktober 2026 veröffentlicht und stehen unter Apache-2.0.

Was sie nicht tun: Sie halten keine Schlüssel, und sie machen QoreX nicht zu mehr, als es heute ist. Lesen Sie [Einschränkungen und bekannte Probleme](#limits), bevor Sie darauf aufbauen: Die Store-Builds von QoreX, die heute live sind, unterstützen nur einen Teil dessen, womit diese Pakete verdrahtet werden können, und die Einschränkungen sind dort beschrieben.

## Innovationen {#innovations}

* **Erkennung, die nicht die falsche Wallet wählen kann.** QoreX meldet sich über EIP-6963 mit dem Reverse-DNS-Namen `network.qore.qorex` an und schreibt nie `window.ethereum`. `@qorechain/qorex-types` wählt den Provider ausschließlich über diesen Namen, und die RainbowKit-Wallet bindet den Connector an den angekündigten Provider und fällt nie auf `window.ethereum` zurück.
* **Die Wallet baut die hybride Signatur, die Seite hält nie den Post-Quanten-Schlüssel.** Die native Lane von QoreChain benötigt eine secp256k1-Signatur plus eine ML-DSA-87-Signatur (FIPS 204). Auf dem nativen Provider (`window.qorex.native`) übergibt der Aufruf `signAndBroadcast` die Nachrichten an QoreX, das die Transaktion baut, sie mit beiden Schlüsseln signiert und sie sendet. Das Ergebnis ist `txHash`, `code`, `height` und `shield`, wobei `shield` den Wert `shielded` hat, sobald die festgeschriebene Transaktion die hybride Schicht trägt.
* **Fähigkeitsprüfungen statt Versionsprüfungen.** Die Pakete lesen die Liste `capabilities` der Wallet (`hasCapability`), sodass eine Funktion wie `signAndBroadcast` erkannt und nicht anhand einer Versionsnummer geraten wird.
* **Ablehnungen sind explizit, mit stabilen Codes.** Amino-Signieren wird bewusst abgelehnt, weil Amino JSON die hybride Signatur nicht tragen kann; die Connectoren werfen `QorexIntegrationError` mit Codes wie `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` und `QOREX_NOT_SUPPORTED_YET`, und `isQorexIntegrationError(err, code)` prüft darauf.
* **Ein Test-Double, das wirklich signiert.** `@qorechain/qorex-wallet-mock` injiziert dieselben Objekte, die QoreX injiziert (`window.qorex = { evm, native, svm }`), registriert eine Solana-Wallet und signiert mit den echten Algorithmen (hybrides ML-DSA-87 über QoreSign auf der nativen Lane, secp256k1 auf EVM, ed25519 auf Solana) aus der öffentlichen Test-Mnemonic, standardmäßig im Testnet. Es meldet sich als `network.qore.qorex.mock` an, sodass Code, der QoreX strikt auswählt, es nicht mit der Wallet verwechseln kann.
* **Zwei Verhaltensprofile.** Das Profil `current` des Mocks verhält sich wie das heute live befindliche QoreX; `planned` ergänzt, was das QoreX-Team angekündigt hat, sodass Sie vorausbauen können, ohne dass der Mock etwas behauptet, was die Wallet noch nicht tut.
* **Playwright-Fixtures im Stil von Synpress v4** (`qorexMockFixtures`) injizieren den Mock vor der Navigation, sodass ein End-to-End-Test keine Browser-Erweiterung benötigt.
* **Wallet-gesteuerte Konten ohne Events.** Weil QoreX `accountsChanged` oder `chainChanged` noch nicht aussendet, hat die RainbowKit-Wallet ein optionales `pollAccountsOnFocus`, das `eth_accounts` und `eth_chainId` erneut liest, wenn die Seite den Fokus zurückerhält.

## Anwendung {#how-to-use}

Die folgenden Codeblöcke sind die Quickstarts aus dem Developer Hub. Jeder wurde mit `tsc` typgeprüft und am 27. Oktober 2026 nach der Installation aus der öffentlichen npm-Registry ausgeführt (Node 26; jsdom 30 und `react-dom/client` für Browsercode; Playwright 1.64 mit Chromium für die Fixture) und lief durch. Keiner sendet eine Transaktion oder benötigt einen finanzierten Schlüssel. Das beobachtete Ergebnis ist jeweils angegeben. Das wallet-seitige Verhalten (ein echtes QoreX in einem echten Browser) wurde für diese Seite nicht getestet.

### `@qorechain/qorex-types`: QoreX erkennen {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Beobachtet unter dem Mock: `QoreX EVM provider not announced`, danach `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. Die erste Zeile ist unter dem Mock zu erwarten, siehe [den Hinweis zu EIP-6963](#limits). Das Paket hat keine Laufzeitabhängigkeiten und exportiert außerdem das QoreX-Icon als Data-URI aus `@qorechain/qorex-types/icon`. Weitere Exporte: Provider-Typen, `isQorexInstalled`, `qorexSignAndBroadcast` und Helfer, um QoreX-EVM-Ablehnungen zu klassifizieren.

### `@qorechain/qorex-rainbowkit`: QoreX in RainbowKit und wagmi {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Beobachtet: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS` enthält die viem-Chain-Definitionen für die EVM-Lane (RPC `https://evm.qore.host` und `https://evm-testnet.qore.host`, native Währung QOR mit 18 Dezimalstellen, Explorer `https://explore.qore.network`). Die `projectId` ist eine WalletConnect-Projekt-ID, die Sie selbst bei WalletConnect anlegen. Peer-Abhängigkeiten: `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Um in der Wallet vorgenommene Konto- und Netzwerkwechsel zu erfassen, verwenden Sie `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]`.

### `@qorechain/qorex-interchain-kit`: Cosmos-dApps (für neue Projekte empfohlen) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Beobachtet: Die Komponente wurde in jsdom mit dem Chain-Registry-Eintrag des QoreChain-Testnets gemountet (`@interchain-kit/react` 0.11.1). Peer-Abhängigkeit: `@interchain-kit/core` ^0.11. Senden Sie eine QoreChain-Transaktion mit `qorexSignAndBroadcast`:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

Der Aufruf akzeptiert 1 bis 32 Nachrichten und ein Memo von bis zu 256 Byte, und QoreX bittet den Nutzer, ihn zu bestätigen. Das Snippet stammt aus der README des Pakets und wurde für diese Seite nicht ausgeführt.

### `@qorechain/qorex-cosmos-kit`: Cosmos-dApps mit cosmos-kit {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Beobachtet: gemountet in jsdom mit dem Eintrag des QoreChain-Testnets (`@cosmos-kit/react` 2.24.1). **`throwErrors={false}` ist erforderlich, damit der Code typprüft:** `@cosmos-kit/react` 2.24 typisiert `throwErrors` als Pflichteigenschaft, und das Beispiel in der README des Pakets lässt sie weg. Peer-Abhängigkeit: `@cosmos-kit/core` ^2.18.1. Die README des Pakets empfiehlt Interchain Kit für neue dApps. Es exportiert ebenfalls `qorexSignAndBroadcast`.

### `@qorechain/qorex-wallet-mock`: Test-Double für QoreX {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Beobachtet: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Die Konten werden so abgeleitet, wie QoreX sie ableitet (`m/44'/118'/0'/0/i` mit dem kanonischen ML-DSA-87-Schlüssel dieser `qor1`-Adresse, `m/44'/60'/0'/0/i` für EVM, `m/44'/501'/i'/0'` für Solana). Zu den Optionen gehören `profile`, `mnemonic`, `accountIndex`, `chainId` (Standard `qorechain-diana`), `autoApprove` und `allowMainnet`; die Seite erhält außerdem `window.__qorexMock` mit `approveNext()`, `rejectNext()`, `requests` und `switchAccount(i)`. In Playwright injizieren Sie `mock.initScript()` mit `page.addInitScript` (Node 20.16 oder neuer).

### `@qorechain/qorex-synpress`: Playwright-Fixtures {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Beobachtet: `1 passed`, gegen eine lokale Seite, deren Connect-Button `eth_requestAccounts` aufruft (Playwright 1.64, Chromium). Um die Fixtures mit Synpress zu kombinieren, installieren Sie `@synthetixio/synpress@4.1.2` und umschließen sie mit `testWithSynpress`. Die Fixture `qorex` stellt `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` und `disconnect()` bereit. Peer-Abhängigkeit: `@playwright/test` 1.48 oder neuer. Der Zustand lebt in der Seite, daher startet jede Navigation mit einem frischen Mock.

## Zugang {#how-to-access}

* **Eine QoreX-Wallet für den echten Einsatz.** Die Connectoren sprechen mit der QoreX-Browser-Erweiterung oder -App, die ein Nutzer installiert hat; siehe die Seite [QoreX-Browser-Erweiterung](/qorex/browser-extension) für Installationen und Store-Versionen. Die Test-Pakete benötigen keine Wallet.
* **Netzwerke.** Mainnet `qorechain-vladi` (EVM-Chain-ID 9801) und Testnet `qorechain-diana` (EVM-Chain-ID 9800). QoreX bedient nur diese beiden QoreChain-Chain-IDs und lehnt andere mit „QoreX: unsupported chain“ ab. Der Mock verwendet standardmäßig das Testnet und lehnt das Signieren für das Mainnet ab, sofern Sie nicht `allowMainnet: true` übergeben.
* **Schlüssel und Guthaben.** Die Pakete halten keinen Schlüssel. Der Mock verwendet die öffentliche BIP-39-Testphrase (`abandon` 11-mal wiederholt, dann `about`), die `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` ableitet; finanzieren Sie sie niemals. Für einen Test, der sendet, geben Sie dem Mock Ihre eigene Testnet-Mnemonic.
* **Weitere Konten.** RainbowKit mit WalletConnect benötigt eine WalletConnect-Projekt-ID von WalletConnect.
* **Voraussetzungen.** Node.js (das Ein-Datei-Skript des Mocks benötigt 20.16 oder neuer), eine React-App für die drei Connectoren und die unter jedem Quickstart aufgeführten Peer-Pakete. TypeScript-Nutzer erhalten die Typen aus `@qorechain/qorex-types`.
* **Kosten.** Die Pakete sind kostenlos. Eine über QoreX gesendete Transaktion zahlt die übliche Gebühr (Untergrenze 0,1 uqor pro Gas).

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Quellcode: https://github.com/qorechain/qorex-integrations (Tag `v0.1.0`, Ordner unter `packages/`; er enthält außerdem eine Demo-dApp, Beispiele und Dateien mit Chain-Registry-Einträgen). Versionen am 27. Oktober 2026 aus der npm-Registry gelesen. Sie ersetzen `@qorechain/connect`, das auf npm als veraltet markiert ist: Verwenden Sie `qorex-types`, um QoreX zu erkennen, `qorex-rainbowkit` für EVM-dApps, `qorex-interchain-kit` (oder `qorex-cosmos-kit`) für Cosmos-dApps und [QoreSign](/qoresign/overview) für hybrides Signieren in Ihrer eigenen Wallet oder Ihrem Backend.

## Einschränkungen und bekannte Probleme {#limits}

**Was die heutigen QoreX-Builds unterstützen.** Die Store-Builds, die live sind (die mobile QoreX-App 1.1.8; die Browser-Erweiterung 0.3.8, und 0.3.9 auf Firefox), unterstützen `getOfflineSigner` mit einer von der Wallet hinzugefügten ML-DSA-Schicht noch nicht und unterstützen `signArbitrary` nicht. Über cosmos-kit und Interchain Kit funktioniert das Signieren mit `getOfflineSigner` nur, wenn die Seite selbst die Post-Quanten-Schicht anhängt, was eine Seite normalerweise nicht kann, weil sie den Schlüssel nicht hält. Der unterstützte Weg, heute eine Transaktion auf der nativen Lane zu senden, ist `window.qorex.native.signAndBroadcast`, das `qorexSignAndBroadcast` umhüllt. Verstehen Sie die Connectoren mit den heutigen Store-Builds nicht als vollständige cosmos-kit- oder Interchain-Kit-Wallet, über das hinaus, was die README jedes Pakets angibt. Die Connectoren sind so geschrieben, dass ein späteres QoreX-Release die Schicht in `signDirect` ergänzen kann (angezeigt über eine Fähigkeit `signDirectAddsPqcLayer`), ohne dass sich Ihr Code ändert.

**Was QoreX heute beantwortet** (aus den READMEs der Pakete):

* **EVM:** `eth_chainId`, `eth_accounts`, `eth_requestAccounts` und `wallet_switchEthereumChain` für das in QoreX gewählte Netzwerk (eine unbekannte Chain wird mit Code 4902 abgelehnt). Signiermethoden (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) und `wallet_addEthereumChain` werden noch nicht unterstützt und mit „QoreX: EVM method ... not yet supported“ abgelehnt. Noch keine Events `accountsChanged` oder `chainChanged`. Vom QoreX-Team als geplant genannt, nicht live: Events, Fehlercodes bei jeder Ablehnung, danach die Signier- und Transaktionsmethoden.
* **EVM-Transaktionen allgemein.** Auf QoreChain wird eine EVM-Transaktion nur von einem Konto mit einem registrierten ML-DSA-87-Schlüssel und einem offenen EVM-Autorisierungsfenster akzeptiert, die beide von der nativen Lane aus eingerichtet werden (siehe [EVM-Entwicklung](/developer-guide/evm-development#evm-window)). Das geplante `eth_sendTransaction` des Mocks öffnet dieses Fenster nicht.
* **Nativ:** `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` und `experimentalSuggestChain`, nur für `qorechain-vladi` und `qorechain-diana`. Auf QoreChain setzt `signDirect` voraus, dass die hybride Schicht bereits vorhanden ist, was eine Seite nicht bauen kann; verwenden Sie daher `signAndBroadcast`. `signArbitrary`, Amino-Signieren und `sendTx` sind nicht verfügbar; in den Connectoren wirft `signArbitrary` `QOREX_NOT_SUPPORTED_YET`, und Amino wirft `QOREX_AMINO_REFUSED`.
* **Solana:** Wallet Standard auf `solana:mainnet` mit Verbinden, Trennen, Events, `signAndSendTransaction`, `signTransaction` und `signMessage`; kein `solana:signIn`. Die SVM-Lane der Chain akzeptiert noch keine Transaktionen, die Solana-Unterstützung hier betrifft also nur die Wallet-Seite.

**Beim Testen der Quickstarts gefundene Stolpersteine:**

* **cosmos-kit benötigt `throwErrors`.** Das README-Beispiel lässt `throwErrors` weg, das `@cosmos-kit/react` 2.24 in seinen Typen verlangt, sodass es wie geschrieben nicht typprüft. Übergeben Sie `throwErrors={false}` (oder Ihren eigenen Wert).
* **Striktes TypeScript und der Mock.** `window.qorex.evm.request(...)` liefert `unknown`, sodass die README-Zeile, die dessen Ergebnis destrukturiert, unter striktem TypeScript fehlschlägt. Casten Sie das Ergebnis, zum Beispiel `as string[]` für `eth_requestAccounts`.
* **Der Mock hat eine eigene EIP-6963-ID.** Er meldet sich als `network.qore.qorex.mock` an, nicht als `network.qore.qorex`. Erkennungscode, der QoreX strikt über `network.qore.qorex` auswählt (darunter `discoverQorexEip1193` in `qorex-types`), findet unter dem Mock daher bewusst keinen EVM-Provider, während `window.qorex.evm` und der native Provider vorhanden sind. Wählt Ihr Code den Provider über die Erkennung aus, lassen Sie ihn in Tests den Mock-rdns akzeptieren (exportiert als `QOREX_MOCK_RDNS`).
* **RainbowKit hält Node am Leben.** In Node startet das Bauen der RainbowKit-Konfiguration WalletConnect-Timer, und der Prozess beendet sich danach nicht von selbst. In einer Seite ist das zu erwarten. In einem Skript oder einem Test beenden Sie explizit (zum Beispiel mit `process.exit(0)`), sobald Sie gelesen haben, was Sie brauchen.
* **Der Extension-Modus von Synpress funktioniert noch nicht.** `qorexExtensionFixtures` ist der geplante Weg, die echte Erweiterung zu steuern, und wirft heute `QorexExtensionModeUnavailableError`, weil es stabile Test-Selektoren in den QoreX-Bestätigungsfenstern braucht, die noch nicht ausgeliefert wurden. Verwenden Sie den Mock-Modus.

**Unterschiede zwischen dem Mock und der Wallet:** kein Sperrbildschirm und kein Bestätigungsfenster (Bestätigungen laufen über `approveNext`, `rejectNext` oder `autoApprove`); `signDirect` meldet einen einfachen secp256k1-Schlüsseltyp; Solana `signAndSendTransaction` wird abgelehnt; Nachrichten, die mit „QoreX (mock):“ beginnen, stammen vom Mock selbst. Testergebnisse des Mocks zeigen, wie sich Ihre Seite gegen die beschriebene Schnittstelle verhält, nicht dass sich ein echter QoreX-Build genauso verhält.

**Sonstiges:** Alle sechs Pakete sind ein erstes Release (0.1.0), rechnen Sie also damit, dass ihre Schnittstellen mit QoreX wachsen. Kein getesteter Quickstart deckt `qorexSignAndBroadcast` gegen ein Live-Netzwerk oder eine echte Wallet ab.
