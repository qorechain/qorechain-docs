---
slug: /qoresign/guides/keplr-compatible-wallets
title: Hybrides Signieren in eine Keplr-kompatible Wallet einbauen
sidebar_label: Keplr-kompatible Wallets
sidebar_position: 1
---

# Hybrides Signieren in eine Keplr-kompatible Wallet einbauen

Die native Lane von QoreChain lehnt eine Transaktion von einem Konto mit
registriertem ML-DSA-87-Schlüssel ab, wenn die Transaktion nicht auch die
Signatur dieses Schlüssels trägt. Eine Keplr-kompatible Wallet (Keplr, Leap,
Cosmostation und andere, die `signDirect` implementieren) erzeugt den
secp256k1-Teil; der ML-DSA-87-Teil muss von demjenigen kommen, der den
Post-Quanten-Schlüssel hält.

Es gibt zwei Wege, ihn hinzuzufügen.

## Option A: Die Wallet hält beide Schlüssel (QoreSign) {#option-a}

Die Wallet leitet den ML-DSA-87-Schlüssel neben dem secp256k1-Schlüssel ab und
fügt die Schicht hinzu, bevor sie signiert.

```ts
import { deriveCanonicalPqKey, signPqLayer } from "@qorechain/qoresign";

// at account creation or import, from the same mnemonic and address
const pqKey = deriveCanonicalPqKey({ mnemonic, address });

// inside signDirect(signerAddress, signDoc):
const { bodyBytes } = signPqLayer({
  chainId: signDoc.chainId,
  bodyBytes: signDoc.bodyBytes,
  authInfoBytes: signDoc.authInfoBytes,
  pqKey,
});
const finalDoc = { ...signDoc, bodyBytes }; // sign this with the secp256k1 key, as for any Cosmos SDK chain
```

Regeln, die den Nutzer schützen:

- Zeigen Sie dem Nutzer vor dem Signieren die Nachrichten und die Gebühr aus
  `bodyBytes` / `authInfoBytes` an, genau wie bei jeder `signDirect`-Anfrage. Die
  ML-DSA-87-Signatur deckt die Gebühr ab.
- Wenn eine dApp einen Body sendet, der bereits eine PQC-Schicht trägt, prüfen
  Sie ihn mit `assertPqLayerMatchesRegisteredKey` (aus
  `@qorechain/qoresign/network`), bevor Sie Ihre klassische Signatur
  hinzufügen; eine Schicht, die sich nicht verifizieren lässt, schützt nichts.
- Registrieren Sie den Schlüssel einmal pro Konto mit
  `buildRegisterPqKeyMessage`, signiert im Modus `classicalOnly` (siehe
  [`examples/register-and-send`](https://github.com/qorechain/qoresign/tree/main/examples/register-and-send)
  und [Registrierung](/qoresign/spec/hybrid-signing-v1#registration)).
- Lesen Sie nach dem Broadcast die committete Transaktion zurück und rufen Sie
  `evaluateLayerState` auf; `downgraded` bedeutet, dass die Schicht die Chain
  nicht erreicht hat.

## Option B: Die dApp hält den Post-Quanten-Schlüssel (`@qorechain/wallet-adapter`) {#option-b}

Wenn sich die Wallet nicht ändern lässt, kann eine dApp
[`@qorechain/wallet-adapter`](https://www.npmjs.com/package/@qorechain/wallet-adapter)
verwenden: Er fügt dem Body die ML-DSA-87-Schicht hinzu und bittet dann die
unveränderte Wallet um eine gewöhnliche `signDirect`-Signatur. Der
Post-Quanten-Schlüssel liegt dann bei der dApp oder einem Begleit-Signer, nicht
in der Wallet. QoreSign und der Adapter erzeugen für dieselben Schlüssel
dieselben Bytes.

## Chain-Registrierung für Keplr {#chain-registration}

Schlagen Sie die Chain mit `experimentalSuggestChain` anhand der veröffentlichten
Chain-Deskriptoren vor: Chain-IDs `qorechain-vladi` (Mainnet) und
`qorechain-diana` (Testnet), Bech32-Präfix `qor`, Coin-Type `118`, Gebühren-Denom
`uqor` mit 6 Dezimalstellen und ein minimaler Gaspreis von `0.1`. Öffentliche
Endpunkte: `https://rpc.qore.host` und `https://api.qore.host` (Mainnet),
`https://rpc-testnet.qore.host` und `https://api-testnet.qore.host` (Testnet).
