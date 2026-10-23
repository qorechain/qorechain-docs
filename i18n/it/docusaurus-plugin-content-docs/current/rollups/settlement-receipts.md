---
slug: /rollups/settlement-receipts
title: Ricevute di settlement quantum-safe
sidebar_label: Ricevute di Settlement
sidebar_position: 6
---

# Ricevute di settlement quantum-safe

Una **ricevuta di settlement** è un record portabile che attesta che un batch di settlement di un rollup è stato ancorato alla Main Chain sotto una firma post-quantum. Indica il rollup, il batch e l'anchor, e porta la firma **ML-DSA-87** (Dilithium-5, FIPS-204) dell'anchor, lo stesso schema utilizzato dalla Main Chain.

:::caution Fase iniziale: non esiste ancora alcun anchor
Le ricevute dipendono dagli anchor, e **nessun rollup né anchor esiste ancora su nessuna delle due reti** (verificato il 23 ottobre 2026). Dalla v3.2.2 (attiva su entrambe le reti) un batch sottomesso con un `anchor_signature` viene ancorato in `x/multilayer` nella stessa transazione; un batch sottomesso senza di esso viene regolato senza anchor. L'RDK TypeScript (0.6.0) invia quel campo quando il suo client di transazione firma in modalità hybrid ed è il creatore del rollup, e sottomette senza anchor in caso contrario; i client Python, Go, Rust e Java firmano solo in modalità classica e non costruiscono il campo. Nulla di tutto ciò è stato messo alla prova su un rollup live. Considera questa pagina come una descrizione del design e dei componenti di base, non di un servizio su cui puoi fare affidamento oggi.
:::

## Una ricevuta è un'affermazione, non una prova {#a-receipt-is-a-claim}

Ogni campo di una ricevuta è fornito da chi te la consegna. Verificare la firma rispetto a una chiave che ti è stata data dimostra che qualcuno in possesso di quella chiave ha firmato quei byte; non dimostra che QoreChain abbia ancorato qualcosa. Un verificatore ha quindi bisogno di un client connesso a un nodo QoreChain di cui si fida e rilegge l'affermazione dallo stato della chain: il rollup e il suo layer, il batch e la sua state root, l'anchor e la chiave post-quantum registrata del creatore.

## Cosa firma l'anchor {#what-the-anchor-signs}

La firma dell'anchor è prodotta dalla chiave ML-DSA-87 registrata del **creatore del rollup**. Il messaggio firmato dipende dall'altezza a cui l'anchor viene sottomesso. **Dalla v3.2.2 (altezza mainnet 3.556.788, altezza testnet 6.905.034) è il messaggio v2**: un domain tag, il chain id, e `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, il numero di transazioni e la state proof compressa, ciascuno con prefisso di lunghezza (il layout esatto è in [Lettura degli anchor](/architecture/multilayer-architecture#reading-anchors)). Da quell'altezza in poi la chain non accetta un anchor v1 (`layer_id || layer_height || state_root || validator_set_hash`, senza chain id). Non codificare in modo fisso nessuna delle due forme: leggi i sign bytes per la rete che stai prendendo di mira. L'RDK costruisce i byte v2 con `anchorSignBytesForBatch` (ed entrambe le forme con `anchorSignBytesV1` / `anchorSignBytesV2`), e la CLI li stampa, ad esempio con `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

Un anchor è un oggetto a livello di layer: non indica né il rollup né il batch, quindi un verificatore li collega tramite letture della chain (vedi [Architettura Multilayer](/architecture/multilayer-architecture#reading-anchors)).

## Lettura degli anchor {#reading-anchors}

Gli anchor sono leggibili via REST e gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` per l'ultimo anchor e `/qorechain/multilayer/v1/anchors/{layer_id}` per la cronologia), e la chiave post-quantum registrata di un account a `/qorechain/pqc/v1/account/{address}` (`account` al singolare). I batch di un rollup si leggono tramite le route REST dell'RDK (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), che entrambe le reti servono, oppure con `qorechaind query rdk batch [rollup-id]`.

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

Passa un `client` per ogni verifica. L'API delle ricevute e i suoi controlli sono cambiati tra una release e l'altra, quindi usa la 0.6.0 o successiva: la 0.5.0 non riusciva a completare il controllo sulla chain (vedi sotto). I client Python, Go, Rust e Java espongono la stessa interfaccia di costruzione/verifica; le loro release 0.6.0 usano la stessa route singolare di ricerca della chiave e la stessa scelta del messaggio di anchor in base all'altezza.

### Cosa verifica la 0.6.0 {#what-060-verifies}

`verifySettlementReceipt` non segnala mai `valid` a partire dalla sola ricevuta: senza un `client` il risultato è `mode: "signature-only"` e `valid: false`. Con un `client` rilegge la chain e riporta ogni controllo separatamente:

* `rollupLayerBinding`: la chain dice che il rollup appartiene al layer della ricevuta;
* `batchStateRoot`: il batch della chain porta la state root della ricevuta;
* `anchorOnChain`: sulla chain esiste un anchor con quella state root, quell'altezza e quella firma;
* `creatorAuthority`: la chiave di firma è stata letta dalla chain (`/qorechain/pqc/v1/account/{address}`), non presa dalla ricevuta;
* `pqcSignature`: la firma ML-DSA-87 si verifica sul messaggio canonico dell'anchor;
* `chainBinding`: la ricevuta nomina la chain che è stata effettivamente interrogata.

Il messaggio dell'anchor viene scelto in base all'altezza a cui l'anchor è stato registrato (v1 sotto il passaggio della v3.2.2, v2 da esso in poi), mai provando entrambi, perché una firma v1 non porta alcun chain id e si verificherebbe su ogni chain. Il pacchetto porta l'altezza di passaggio per la mainnet (3.556.788) e la testnet (6.905.034). Il risultato riporta la forma usata come `signBytesVersion`. Lo schema di ricevuta v2 registra `chainId`; una ricevuta versione 1 non ne porta alcuno, quindi supera `chainBinding` solo perché il suo anchor è stato trovato sulla chain che hai interrogato. La verifica rifiuta una ricevuta controllata rispetto a un nodo di un'altra chain.

Su nessuna delle due reti esiste un anchor, quindi questo è stato verificato solo rispetto al codice del pacchetto e offline, non rispetto a un anchor reale. `buildSettlementReceipt` funziona solo quando un anchor copre il batch.

:::note Release precedenti alla 0.6.0
In 0.5.0 `verifySettlementReceipt` falliva in modo chiuso (fail-closed) sulle reti live, per due ragioni che stavano nel client, non nella chain: cercava la chiave del creatore attraverso una forma plurale `accounts` della route dell'account post-quantum, che le reti non servono (HTTP 501), e ricostruiva solo il messaggio v1, che la chain non accetta più per gli anchor dalla v3.2.2. Una ricevuta genuina quindi non poteva essere verificata, e una contraffatta veniva comunque rifiutata. Usa la 0.6.0 o successiva.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Vedi [Deploy di un Rollup](/rollups/deploying-a-rollup) per la CLI operatore `qorollup` completa.
