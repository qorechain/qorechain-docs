---
slug: /rollups/settlement-receipts
title: Ricevute di settlement quantum-safe
sidebar_label: Ricevute di Settlement
sidebar_position: 6
---

# Ricevute di settlement quantum-safe

Una **ricevuta di settlement** è un record portabile che attesta che un batch di settlement di un rollup è stato ancorato alla Main Chain sotto una firma post-quantum. Indica il rollup, il batch e l'anchor, e porta la firma **ML-DSA-87** (Dilithium-5, FIPS-204) dell'anchor, lo stesso schema utilizzato dalla Main Chain.

:::caution Fase iniziale: non esiste ancora alcun anchor
Le ricevute dipendono dagli anchor, e **nessun rollup né anchor esiste ancora su nessuna delle due reti**. Sulla mainnet l'RDK non scrive ancora anchor: i batch di settlement vengono registrati, ma il passaggio di ancoraggio viene saltato. Considera questa pagina come una descrizione del design e dei componenti di base, non di un servizio su cui puoi fare affidamento oggi.
:::

## Una ricevuta è un'affermazione, non una prova {#a-receipt-is-a-claim}

Ogni campo di una ricevuta è fornito da chi te la consegna. Verificare la firma rispetto a una chiave che ti è stata data dimostra che qualcuno in possesso di quella chiave ha firmato quei byte; non dimostra che QoreChain abbia ancorato qualcosa. Un verificatore ha quindi bisogno di un client connesso a un nodo QoreChain di cui si fida e rilegge l'affermazione dallo stato della chain: il rollup e il suo layer, il batch e la sua state root, l'anchor e la chiave post-quantum registrata del creatore.

## Cosa firma l'anchor {#what-the-anchor-signs}

La firma dell'anchor è prodotta dalla chiave ML-DSA-87 registrata del **creatore del rollup**. Sulla mainnet oggi il messaggio firmato è

```
layer_id || layer_height (8-byte big-endian) || state_root || validator_set_hash
```

Una release più recente della chain modifica il messaggio firmato, quindi non codificarlo in modo fisso: leggi i sign bytes per la rete che stai prendendo di mira. Un anchor è un oggetto a livello di layer: non indica né il rollup né il batch, quindi un verificatore li collega tramite letture della chain (vedi [Architettura Multilayer](/architecture/multilayer-architecture#reading-anchors)).

## Lettura degli anchor {#reading-anchors}

Gli anchor sono leggibili via REST e gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` per l'ultimo anchor e `/qorechain/multilayer/v1/anchors/{layer_id}` per la cronologia), e la chiave post-quantum registrata di un account a `/qorechain/pqc/v1/account/{address}`. I batch di un rollup si leggono con `qorechaind query rdk batch [rollup-id]` (le route REST dell'RDK oggi non sono servite sulla mainnet).

## Costruzione e verifica (TypeScript) {#build-and-verify}

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

Passa un `client` per ogni verifica. Usa l'ultima release pubblicata del tuo client RDK: l'API delle ricevute e i suoi controlli sono cambiati tra una release e l'altra, e i client Python, Go, Rust e Java espongono la stessa interfaccia di costruzione/verifica (eseguono la verifica ML-DSA-87 tramite la libreria [`qorechain-pqc`](https://github.com/qorechain)).

:::note Limitazioni attuali del client
I client RDK pubblicati cercano la chiave del creatore attraverso un percorso che la chain live non serve, quindi la verifica online non si completa ancora sulle reti live. Finché una release del client non risolverà il problema, usa una ricevuta solo come record da confrontare con l'anchor che leggi dal tuo nodo.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Vedi [Deploy di un Rollup](/rollups/deploying-a-rollup) per la CLI operatore `qorollup` completa.
