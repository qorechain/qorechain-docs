---
slug: /rollups/settlement-receipts
title: Bonuri de decontare rezistente cuantic
sidebar_label: Bonuri de decontare
sidebar_position: 6
---

# Bonuri de decontare rezistente cuantic

Un **bon de decontare** este o înregistrare portabilă care atestă că un lot de decontare al unui rollup a fost ancorat în Main Chain sub o semnătură post-cuantică. Acesta indică rollup-ul, lotul și ancora și poartă semnătura **ML-DSA-87** (Dilithium-5, FIPS-204) a ancorei, aceeași schemă pe care o folosește Main Chain.

:::caution Fază incipientă: nu există încă ancore
Bonurile depind de ancore, iar **niciun rollup și nicio ancoră nu există încă în niciuna dintre rețele** (verificat la 21 octombrie 2026). Începând cu v3.2.2 (activă pe ambele rețele), un lot trimis cu un `anchor_signature` este ancorat în `x/multilayer` în aceeași tranzacție; un lot trimis fără acesta se decontează neancorat. RDK TypeScript (0.6.0) trimite acel câmp atunci când clientul său de tranzacții semnează hibrid și este creatorul rollup-ului, iar în caz contrar trimite neancorat; clienții Python, Go, Rust și Java semnează doar clasic și nu construiesc câmpul. Nimic din toate acestea nu a fost exersat pe un rollup activ. Tratează această pagină ca pe o descriere a designului și a componentelor de bază, nu a unui serviciu pe care te poți baza astăzi.
:::

## Un bon este o afirmație, nu o dovadă {#a-receipt-is-a-claim}

Fiecare câmp dintr-un bon este furnizat de cel care ți-l înmânează. Verificarea semnăturii față de o cheie care ți-a fost dată arată că cineva care deține acea cheie a semnat acei octeți; nu arată că QoreChain a ancorat ceva. Un verificator are, așadar, nevoie de un client conectat la un nod QoreChain în care are încredere și reia citirea afirmației din starea lanțului: rollup-ul și layer-ul său, lotul și state root-ul său, ancora și cheia post-cuantică înregistrată a creatorului.

## Ce semnează ancora {#what-the-anchor-signs}

Semnătura ancorei este realizată cu cheia ML-DSA-87 înregistrată a **creatorului rollup-ului**. Mesajul semnat depinde de înălțimea la care este trimisă ancora. **Începând cu v3.2.2 (mainnet, înălțimea 3,556,788; testnet, înălțimea 6,905,034) este mesajul v2**: o etichetă de domeniu, id-ul lanțului și, prefixate cu lungimea, `layer_id`, `layer_height`, `state_root`, `validator_set_hash`, numărul de tranzacții și demonstrația de stare comprimată (structura exactă se află în [Citirea ancorelor](/architecture/multilayer-architecture#reading-anchors)). De la acea înălțime, lanțul nu mai acceptă o ancoră v1 (`layer_id || layer_height || state_root || validator_set_hash`, fără id de lanț). Nu codifica fix niciuna dintre forme: citește octeții de semnare pentru rețeaua țintă. RDK construiește octeții v2 cu `anchorSignBytesForBatch` (și ambele forme cu `anchorSignBytesV1` / `anchorSignBytesV2`), iar CLI-ul îi afișează, de exemplu cu `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>`.

O ancoră este un obiect la nivel de layer: nu indică rollup-ul sau lotul, deci un verificator le leagă prin citiri din lanț (vezi [Arhitectura Multilayer](/architecture/multilayer-architecture#reading-anchors)).

## Citirea ancorelor {#reading-anchors}

Ancorele pot fi citite prin REST și gRPC (`/qorechain/multilayer/v1/anchor/{layer_id}` pentru cea mai recentă ancoră și `/qorechain/multilayer/v1/anchors/{layer_id}` pentru istoric), iar cheia post-cuantică înregistrată a unui cont la `/qorechain/pqc/v1/account/{address}` (`account` la singular). Loturile unui rollup se citesc prin rutele REST RDK (`/qorechain/rdk/v1/batch/{rollup_id}/{batch_index}`, `/qorechain/rdk/v1/latest_batch/{rollup_id}`, `/qorechain/rdk/v1/batches/{rollup_id}`), pe care le servesc ambele rețele, sau cu `qorechaind query rdk batch [rollup-id]`.

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

Transmite un `client` la fiecare verificare. API-ul bonurilor și verificările sale s-au schimbat între versiuni, așa că folosește 0.6.0 sau mai nouă: 0.5.0 nu putea finaliza verificarea în lanț (vezi mai jos). Clienții Python, Go, Rust și Java expun aceeași suprafață de construire/verificare; versiunile lor 0.6.0 folosesc aceeași rută la singular de căutare a cheii și aceeași alegere a mesajului ancorei în funcție de înălțime.

### Ce verifică 0.6.0 {#what-060-verifies}

`verifySettlementReceipt` nu raportează niciodată `valid` doar pe baza bonului: fără un `client`, rezultatul este `mode: "signature-only"` și `valid: false`. Cu un `client`, citește din nou lanțul și raportează separat fiecare verificare:

* `rollupLayerBinding`: lanțul spune că rollup-ul aparține layer-ului din bon;
* `batchStateRoot`: lotul din lanț poartă state root-ul din bon;
* `anchorOnChain`: în lanț există o ancoră cu acel state root, acea înălțime și acea semnătură;
* `creatorAuthority`: cheia de semnare a fost citită din lanț (`/qorechain/pqc/v1/account/{address}`), nu preluată din bon;
* `pqcSignature`: semnătura ML-DSA-87 se verifică peste mesajul canonic al ancorei;
* `chainBinding`: bonul numește lanțul care a fost într-adevăr interogat.

Mesajul ancorei este ales după înălțimea la care a fost înregistrată ancora (v1 sub pragul v3.2.2, v2 de la acesta), niciodată încercându-le pe ambele, pentru că o semnătură v1 nu poartă id de lanț și s-ar verifica pe orice lanț. Pachetul conține înălțimea de comutare pentru mainnet (3,556,788) și testnet (6,905,034). Rezultatul raportează forma folosită ca `signBytesVersion`. Schema de bon v2 înregistrează `chainId`; un bon de versiunea 1 nu are niciunul, deci trece `chainBinding` doar pentru că ancora sa a fost găsită pe lanțul pe care l-ai interogat. Verificarea refuză un bon verificat față de un nod al unui alt lanț.

Nicio ancoră nu există în niciuna dintre rețele, așa că aceasta a fost verificată doar față de codul pachetului și offline, nu față de o ancoră reală. `buildSettlementReceipt` funcționează doar după ce o ancoră acoperă lotul.

:::note Versiuni anterioare lui 0.6.0
`verifySettlementReceipt` în 0.5.0 eșua închis pe rețelele active, din două motive care țineau de client, nu de lanț: căuta cheia creatorului prin forma plurală `accounts` a rutei conturilor post-cuantice, pe care rețelele nu o servesc (HTTP 501), și reconstruia doar mesajul v1, pe care lanțul nu îl mai acceptă pentru ancore de la v3.2.2. Un bon autentic nu putea, deci, să se verifice, iar unul falsificat era totuși refuzat. Folosește 0.6.0 sau mai nouă.
:::

## CLI {#cli}

```bash
qorollup receipt my-rollup 7                 # build and print
qorollup receipt my-rollup 7 --out receipt.json
```

Vezi [Implementarea unui Rollup](/rollups/deploying-a-rollup) pentru CLI-ul complet de operator `qorollup`.
