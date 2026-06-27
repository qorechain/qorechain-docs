---
slug: /sdk/guides/quantum-safe
title: Standardmäßig quantensicher
sidebar_label: Quantensicher
sidebar_position: 6
---

# Standardmäßig quantensicher

QoreChain behandelt Post-Quanten-Kryptografie als **erstklassiges** Signaturverfahren.
Ein Konto registriert einen **ML-DSA-87-Schlüssel (Dilithium-5, NIST FIPS 204)** on-chain,
woraufhin seine Transaktionen eine **hybride** Signatur tragen können — die übliche
klassische secp256k1-Signatur **plus** eine ML-DSA-87-Signatur. Der Ante-Handler der Chain
verifiziert beide, sodass ein quantensicheres Konto vollständig mit der klassischen
Verifikation kompatibel bleibt und gleichzeitig Schutz gegen einen künftigen quantenbasierten
Angreifer erhält.

Das SDK fasst dies in eine winzige, idempotente Oberfläche zusammen, sodass eine dApp
**standardmäßig quantensicher** wird: ein Aufruf zum PQC-Schutz.

## Status prüfen

`isPqcRegistered` / `getPqcStatus` lesen über die JSON-RPC-Methode
`qor_getPQCKeyStatus`, ob eine Adresse einen registrierten PQC-Schlüssel besitzt. Sie
akzeptieren entweder einen `QorClient` oder den zusammengesetzten Client aus `createClient`:

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Derselbe Status ist auf der EVM-Seite ebenfalls über das Precompile
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
an `0x0000000000000000000000000000000000000A02` lesbar (in `@qorechain/evm` als
`pqcKeyStatus` bereitgestellt). Die obigen Helfer bevorzugen die JSON-RPC-Methode,
die keine viem-Peer benötigt.

## Registrierung in einem Aufruf

`ensurePqcRegistered` macht ein Konto quantensicher. Es ist **idempotent**: Übergeben Sie eine
Statusquelle, und es überspringt die Registrierung, wenn der Schlüssel bereits registriert ist,
sodass es bei jedem App-Start sicher aufgerufen werden kann.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

Unter der Haube erstellt und sendet es `MsgRegisterPQCKey` mit dem Dilithium-
Public-Key des Signierers (aus `pqcKeypair`) sowie optional dem ECDSA-
Public-Key des Kontos.

## Hybrid signieren

`migrateToHybrid` stellt die Registrierung sicher und liefert einen hybriden Sendepfad zurück,
bei dem das Schlüsselpaar bereits an die vorhandenen Builder `buildHybridTx` /
`signAndBroadcastHybrid` gebunden ist:

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## Einen Schlüssel rotieren

Wenn Sie den PQC-Schlüssel rotieren müssen (Algorithmus-Upgrade oder ein kompromittierter
Schlüssel), verwenden Sie `migratePqcKey`, das `MsgMigratePQCKey` sendet und den Besitz sowohl
des alten als auch des neuen Schlüssels nachweist:

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## In der UI

Das [`@qorechain/react`](/sdk/guides/react)-Kit stellt all dies in React bereit: der
`usePqcStatus`-Hook und die `<QuantumSafeBadge/>`-Komponente zeigen einen **Quantum-safe**-
Indikator an, sobald das verbundene Konto einen registrierten PQC-Schlüssel besitzt.
