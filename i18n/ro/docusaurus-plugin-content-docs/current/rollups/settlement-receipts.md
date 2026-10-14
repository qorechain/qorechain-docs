---
slug: /rollups/settlement-receipts
title: Bonuri de decontare rezistente cuantic
sidebar_label: Bonuri de decontare
sidebar_position: 6
---

# Bonuri de decontare rezistente cuantic

Un **bon de decontare** este o înregistrare portabilă care atestă că un lot de decontare al unui rollup a fost ancorat în Main Chain sub o semnătură post-cuantică. Acesta indică rollup-ul, lotul și ancora și poartă semnătura **ML-DSA-87** (Dilithium-5, FIPS-204) a ancorei, aceeași schemă pe care o folosește Main Chain.

:::caution Fază incipientă: nu există încă ancore
Bonurile depind de ancore, iar **niciun rollup și nicio ancoră nu există încă în niciuna dintre rețele**. Pe mainnet, RDK nu scrie încă ancore: loturile de decontare sunt înregistrate, dar pasul de ancorare este omis. Tratează această pagină ca pe o descriere a designului și a componentelor de bază, nu a unui serviciu pe care te poți baza astăzi.
:::

## Un bon este o afirmație, nu o dovadă {#a-receipt-is-a-claim}

Fiecare câmp dintr-un bon este furnizat de cel care ți-l înmânează. Verificarea semnăturii față de o cheie care ți-a fost dată arată că cineva care deține acea cheie a semnat acei octeți; nu arată că QoreChain a ancorat ceva. Un verificator are, așadar, nevoie de un client conectat la un nod QoreChain în care are încredere și reia citirea afirmației din starea lanțului: rollup-ul și layer-ul său, lotul și state root-ul său, ancora și cheia post-cuantică înregistrată a creatorului.

## Ce semnează ancora {#what-the-anchor-signs}

Semnătura ancorei este realizată cu cheia ML-DSA-87 înregistrată a **creatorului rollup-ului**. Pe mainnet astăzi, mesajul semnat este

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

O versiune mai nouă a lanțului modifică mesajul semnat, așa că nu îl codifica fix în cod: citește octeții de semnare pentru rețeaua țintă. O ancoră este un obiect la nivel de layer: nu indică rollup-ul sau lotul, deci un verificator le leagă prin citiri din lanț (vezi [Arhitectura Multilayer](/architecture/multilayer-architecture#reading-anchors)).

## Citirea ancorelor {#reading-anchors}

Ancorele pot fi citite prin REST și gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` pentru cea mai recentă ancoră și `/qorechain/multilayer/v1/anchors/{layer_id}` pentru istoric), iar cheia post-cuantică înregistrată a unui cont la `/qorechain/pqc/v1/account/{address}`. Loturile unui rollup se citesc cu `qorechaind query rdk batch [rollup-id]` (rutele REST RDK nu sunt servite astăzi pe mainnet).

## Construire și verificare (TypeScript) {#build-and-verify}

```ts
import {
  createRdkClient,
  buildSettlementReceipt,
  verifySettlementReceipt,
} from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });

// Build a receipt for one batch (throws if no anchor covers the batch yet).
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 7);

// Verify it against chain state — pass a client; a receipt on its own proves nothing.
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

Transmite un `client` la fiecare verificare. Folosește ultima versiune publicată a clientului tău RDK: API-ul bonurilor și verificările sale s-au schimbat între versiuni, iar clienții Python, Go, Rust și Java expun aceeași suprafață de construire/verificare (aceștia efectuează verificarea ML-DSA-87 prin biblioteca [`qorechain-pqc`](https://github.com/qorechain)).

:::note Limitări actuale ale clientului
Clienții RDK publicați caută cheia creatorului printr-o cale pe care lanțul activ nu o servește, așa că verificarea online nu se finalizează încă pe rețelele active. Până când o versiune de client rezolvă acest lucru, folosește un bon doar ca înregistrare de verificat prin comparație cu ancora pe care o citești de pe propriul nod.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru CLI-ul complet de operator `qorollup`.
