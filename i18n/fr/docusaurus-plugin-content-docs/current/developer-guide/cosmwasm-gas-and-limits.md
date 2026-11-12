---
slug: /developer-guide/cosmwasm-gas-and-limits
title: Gas, tarification et limites de téléversement CosmWasm
sidebar_label: Gas et limites CosmWasm
sidebar_position: 6
---

# Gas, tarification et limites de téléversement CosmWasm

Les contrats QoreChain Native (le nom que QoreChain donne à son runtime CosmWasm) sont tarifés selon ce qu'ils coûtent à un validateur pour s'exécuter. À partir de la version **v3.2.8**, le prix d'un appel de contrat dépend de trois choses : si le code du contrat est déjà chargé en mémoire pour le bloc courant, à quel point le bloc est chargé en travail de contrats, et quelle quantité de mémoire l'appel touche. Les téléversements de code sont bornés en taille et en forme.

:::note Testnet d'abord
La v3.2.8 fonctionne sur le testnet **`qorechain-diana`** depuis le 12 novembre 2026. Le mainnet (`qorechain-vladi`) l'appliquera avec une mise à niveau de gouvernance ultérieure : les chiffres ci-dessous décrivent donc le testnet aujourd'hui et le mainnet après cette mise à niveau. Chaque commande utilise `--chain-id qorechain-diana` ; remplacez par `qorechain-vladi` une fois le mainnet mis à niveau.
:::

## Pourquoi c'est important {#why}

- Un appel de contrat qui fonctionnait hier avec une limite de gas fixe peut manquer de gas aujourd'hui, car le premier appel d'un code dans un bloc coûte plusieurs fois plus qu'une répétition. Une limite fixe est un pari qui échoue au pire moment.
- Les frais suivent la charge. Quand les blocs sont pleins d'appels de contrats, le prix de l'exécution des contrats monte, et il redescend quand ils ne le sont pas.
- Chaque bloc dispose d'une quantité limitée de travail de contrats. Un appel qui n'y tient pas échoue et paie ses frais comme toute transaction échouée.

La règle courte : **simulez, multipliez le résultat par au moins 1.3, et ne codez jamais le gas en dur pour un appel de contrat.**

## Le modèle de gas {#gas-model}

### Coût de chargement du code {#code-load}

Avant qu'un contrat s'exécute, son code compilé doit être chargé. Le premier appel d'un code dans un bloc paie ce chargement. Les appels suivants au même code dans le même bloc sont bon marché, car le code est déjà en mémoire.

| Appel | Gas approximatif |
| ---- | --------------- |
| cw20 `transfer`, premier appel du code dans un bloc (un message, gas utilisé mesuré) | 585,151 |
| cw20 `transfer`, trois appels dans une transaction, soit deux répétitions dans le même bloc (gas utilisé mesuré, total) | 646,169 |
| Le même appel unique, tel que rapporté par la simulation | 591,280 |

Ces chiffres ont été mesurés sur le testnet le 12 novembre 2026 avec le code cw20 examiné que la gouvernance a stocké (facteur de congestion 1x). Une répétition du même code dans le même bloc n'ajoute en pratique qu'environ 30,500 de gas. La simulation rapporte plus qu'une transaction n'utilise, car elle facture toujours le chargement à froid et ajoute une marge pour la congestion : trois appels simulés à 1,326,504 ont utilisé 646,169. Les chiffres dépendent du code et de l'appel ; mesurez donc votre propre contrat. Plus précisément, le chargement est facturé en totalité au premier appel d'un code dans un bloc, les huit appels suivants à ce code dans le même bloc ne paient aucun chargement, et chaque appel ultérieur dans le bloc en paie un huitième. L'ensemble des codes chargés repart vide à chaque bloc, de sorte que tous les validateurs facturent les mêmes appels. Cela s'applique à l'instanciation, à l'exécution, à la migration, et aux appels faits depuis un autre contrat ou depuis le pont cross-VM.

**Les codes épinglés évitent le coût de chargement.** La gouvernance peut épingler un code populaire pour que les validateurs le gardent chargé, et les appels à un code épinglé ne paient jamais le coût de chargement. Vérifiez quels codes sont épinglés :

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/pinned
```

### Mise en place de l'appel et mémoire {#setup}

Chaque appel paie aussi une petite charge de mise en place (un coût de base, un coût par page de 64 KiB de mémoire initiale et un coût par segment de données) et une charge pour chaque page de mémoire dont il s'agrandit. Les contrats qui gardent une mémoire réduite coûtent moins cher.

### Tarification de la congestion {#congestion}

Le gas d'exécution des contrats est multiplié par un **facteur de congestion**.

| Propriété | Valeur |
| -------- | ----- |
| Plage | De 1x à 20x par défaut |
| Plafond de gouvernance | La gouvernance peut fixer le maximum jusqu'à 100x |
| Quand il monte | Seulement quand les blocs sont pleins : après un bloc qui a utilisé plus de la moitié de son budget de contrats (la cible par défaut), le facteur monte, et il monte plus vite quand le budget a été épuisé |
| Quand il baisse | Après un bloc qui a utilisé moins que la cible |

Le facteur ne multiplie que l'exécution des contrats. Le stockage, la mise en place de l'appel et le téléversement du code ne sont pas multipliés. Le facteur valait 1x lors de la mesure des transferts ci-dessus.

Lisez les valeurs en vigueur :

```bash
qorechaind query crossvm params --node https://rpc-testnet.qore.host:443
```

Les champs à regarder sont `wasm_congestion_factor_micro` (le facteur en vigueur, en millionièmes, donc `1000000` vaut 1x), `wasm_congestion_max_factor`, `wasm_congestion_target_bps`, `max_block_wasm_gas` et `max_tx_wasm_share_bps`.

### Le budget de contrats par bloc {#budget}

Chaque bloc dispose d'un budget de travail de contrats. Les valeurs par défaut sont :

| Paramètre | Par défaut | Signification |
| --------- | ------- | ------- |
| `max_block_wasm_gas` | 3,000,000 | L'exécution de contrats que toutes les transactions ensemble peuvent utiliser dans un bloc |
| `max_tx_wasm_share_bps` | 5,000 (la moitié) | La part de ce budget qu'une transaction peut utiliser, soit 1,500,000 par défaut |
| `queue_wasm_reserve_bps` | 2,500 | Part du budget réservée aux appels cross-VM asynchrones en file d'attente |

Quand le budget refuse le travail de contrats d'une transaction, celle-ci échoue (« block wasm gas budget exhausted ») et paie ses frais comme toute transaction échouée. Réessayez au bloc suivant, qui démarre avec un budget plein. Des frais de priorité aident à passer tôt dans un bloc, avant que le budget soit dépensé. Un appel unique qui a besoin de plus que la part d'une transaction ne peut pas s'exécuter tant que la gouvernance n'a pas relevé le budget ou la part.

### Simulation et marge de sécurité {#simulation}

Une simulation **facture toujours le chargement à froid**, comme si votre appel était le premier de son code dans le bloc, et elle tarife l'exécution au facteur de congestion que le prochain bloc utilisera plus deux crans de hausse (environ 2.25x sur la partie exécution). Une estimation survit donc à quelques blocs de charge croissante. Elle n'est jamais trop basse pour un premier appel.

Pour cette raison, appliquez cette règle à chaque message de contrat :

1. Simulez la transaction.
2. Multipliez le gas simulé par **au moins 1.3**.
3. Utilisez le résultat comme limite de gas, sans dépasser le plafond de transaction.

### Plafond de transaction {#tx-cap}

Une transaction Cosmos ne peut pas fixer une limite de gas supérieure à **50,000,000**. Une transaction au-dessus du plafond est refusée avant que ses frais soient prélevés.

## Règles de téléversement {#upload}

Le téléversement de code (`MsgStoreCode`) reste **contrôlé par la gouvernance** : `code_upload_access` vaut `Nobody` sur les deux réseaux, le code est donc stocké via une proposition de gouvernance. Vérifiez-le à tout moment :

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/codes/params
```

À partir de la v3.2.8, un téléversement est vérifié dans un ordre fixe, les contrôles les moins chers en premier :

1. **Accès.** L'expéditeur doit être autorisé par la règle de téléversement. Le mempool n'admet les messages de téléversement que d'expéditeurs autorisés.
2. **Gas pour la taille déclarée, d'avance.** La transaction doit avoir assez de gas pour la taille de module qu'elle déclare, sinon elle échoue immédiatement faute de gas, avant que quoi que ce soit soit décompressé.
3. **Inspection en une passe.** Le module est décompressé une seule fois, jamais au-delà de sa taille déclarée, et inspecté par rapport aux limites ci-dessous. Un téléversement gzip doit être exactement un seul membre gzip qui se décompresse à la taille qu'il déclare.
4. **Stockage et compilation.** Le stockage est facturé à l'octet, puis le module est compilé.

Coûts de téléversement typiques : environ **9.9 millions de gas pour un cw20** et environ **22.8 millions pour un cw721**. Le téléversement le plus dense qui reste dans les limites coûte environ 32 millions, encore sous le plafond de 50,000,000.

### Limites des modules {#module-limits}

| Limite | Valeur |
| ----- | ----- |
| Fonctions | au plus 4,096 |
| Types de fonctions | au plus 512 |
| Taille compilée (estimation prudente) | au plus 32 MiB |
| Exports | au plus 128 |
| Globales | au plus 256 |
| Segments d'éléments | au plus 16, avec au plus 2,500 entrées au total |
| Segments de données | au plus 1,024 |
| Mémoire initiale | au plus 64 pages (4 MiB) |
| Sections personnalisées | au plus 128 KiB au total |
| Opérations en virgule flottante | aucune autorisée |

Les instructions en virgule flottante sont refusées parce qu'elles ne sont pas déterministes d'un matériel de validateur à l'autre. Écrivez les contrats avec les types entiers ou décimaux de `cosmwasm-std`, et vérifiez que votre build ne contient aucune instruction en virgule flottante avant de le soumettre à la gouvernance.

Les limites sont aussi vérifiées **au moment de l'appel pour un code déjà stocké** : un code stocké plus tôt qui enfreint une limite (par exemple la virgule flottante) est donc refusé quand on l'appelle. Les contrats construits à partir des modèles cw20 et cw721 standards et les contrats de version restent bien en dessous de chaque limite.

## Exemple pratique : estimer et exécuter un transfert cw20 {#worked-example}

Le message est le `transfer` cw20 standard : `{"transfer": {"recipient": "qor1...", "amount": "1000"}}`. Les exemples utilisent le testnet.

### CLI {#example-cli}

Laissez le CLI simuler avec `--gas auto`, et utilisez un ajustement de 1.3 ou plus. Construisez la transaction avec `--generate-only` et signez-la avec `tx pqc cosign`, comme dans le reste du manuel (voir [Signature hybride](/cli-reference/transaction-commands#hybrid-signing)) :

```bash
qorechaind tx wasm execute <contract-addr> \
  '{"transfer":{"recipient":"qor1recipient...","amount":"1000"}}' \
  --from mykey \
  --gas auto --gas-adjustment 1.3 --gas-prices 0.15uqor \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Le plancher du réseau est de 0.1 uqor par unité de gas ; `0.15uqor` laisse de la marge. Si votre contrat est appelé souvent dans le même bloc que d'autres utilisateurs du même code, la limite simulée couvre déjà le chargement à froid.

### TypeScript {#example-ts}

Simulez, multipliez par 1.3, vérifiez le plafond, puis envoyez via le constructeur hybride. Cela suit le [guide QoreChain Native du SDK](/sdk/guides/cosmwasm#gas), qui contient les imports complets et l'enregistrement de la clé ML-DSA-87 du compte.

```ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { checkCosmosGasLimit, COSMOS_TX_MAX_GAS } from "@qorechain/sdk";

const cwClient = await SigningCosmWasmClient.connectWithSigner(
  "https://rpc-testnet.qore.host",
  signer,
);

const msgs = [
  {
    typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
    value: MsgExecuteContract.fromPartial({
      sender,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify({ transfer: { recipient, amount: "1000" } }),
      ),
      funds: [],
    }),
  },
];

const simulatedGas = await cwClient.simulate(sender, msgs, undefined);
const gas = Math.ceil(simulatedGas * 1.3);
checkCosmosGasLimit(gas); // throws above COSMOS_TX_MAX_GAS (50,000,000)

const gasPrice = 0.15; // uqor per unit of gas
const fee = {
  amount: [{ denom: "uqor", amount: String(Math.ceil(gas * gasPrice)) }],
  gas: String(gas),
};
// Pass `fee` and `msgs` to signAndBroadcastHybrid exactly as in the SDK guide.
```

Le SDK 0.14.0 applique lui-même les mêmes règles : il refuse une limite de gas Cosmos supérieure à 50,000,000 avant la signature, donne aux transactions CosmWasm et cross-VM au moins 1.3 fois le gas simulé, et n'utilise jamais de valeur de repli fixe pour elles. `carriesWasmExecution(messages)` indique si une liste de messages nécessite du gas simulé, et `WASM_GAS_MULTIPLIER_MIN` est le minimum de 1.3. Là où un client CosmJS accepte `"auto"` comme frais, il simule pour vous.

### Testé sur le testnet {#example-tested}

Cette exécution a été faite sur `qorechain-diana` le 12 novembre 2026 (version v3.2.8) avec un compte eth-native, le SDK TypeScript 0.13.0 et le code cw20 que la gouvernance a stocké (code id 859). Elle signe la transaction, envoie les octets signés à la route REST de simulation, puis envoie la vraie transaction avec le gas simulé multiplié par 1.3.

```ts
import { Registry } from "@cosmjs/proto-signing";
import { wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { EthNativeSigner, qorechainRegistryTypes } from "@qorechain/sdk";

const registry = new Registry([...qorechainRegistryTypes, ...wasmTypes]);
const signer = new EthNativeSigner(account, { rest: REST, registry });
const signBytesVersion = await signer.resolveSignBytesVersion(CHAIN_ID);

// 1. Sign once with a generous limit, then ask the node what the call needs.
const base = { chainId: CHAIN_ID, accountNumber, sequence, messages: [msg] };
const { txRawBytes } = signer.sign({
  ...base,
  fee: { amount: [{ denom: "uqor", amount: "450000" }], gas: "3000000" },
  signBytesVersion,
});
const sim = await fetch(`${REST}/cosmos/tx/v1beta1/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tx_bytes: Buffer.from(txRawBytes).toString("base64") }),
}).then((r) => r.json());

// 2. Send it for real with the simulated gas times 1.3.
const gas = Math.ceil(Number(sim.gas_info.gas_used) * 1.3);
const res = await signer.signAndBroadcast(transport, {
  ...base,
  fee: { amount: [{ denom: "uqor", amount: String(Math.ceil(gas * 0.15)) }], gas: String(gas) },
});
```

Ce que l'exécution a affiché :

| Étape | Résultat |
| ---- | ------ |
| Instancier cw20 (code 859) : simulé, puis envoyé avec ce chiffre multiplié par 1.3 | simulé 634,956 ; limite 825,443 ; code 0, gas utilisé 629,267 |
| cw20 `transfer` : simulé | 591,280 de gas |
| Le même transfert avec une limite fixe de 400,000 | refusé : `out of gas in location: wasm code load; gasWanted: 400000, gasUsed: 564549` (les frais sont quand même prélevés) |
| Le même transfert avec simulé x 1.3 (768,664) | code 0, gas utilisé 585,151 |
| Trois transferts dans une transaction, simulé x 1.3 (1,724,456) | code 0, gas utilisé 646,169 |

Une limite fixe de 400,000 échoue au premier appel du code dans un bloc, alors que la limite simulée n'échoue pas. Les frais sont fixés sur la limite que vous demandez (0.15 uqor par unité de gas dans cette exécution) : une marge plus grande coûte donc des frais plus élevés. Utilisez 1.3, pas 5.

### Python, Go, Rust et Java {#example-other}

Chacun de ces SDK simule contre la route REST et dimensionne la limite à partir du résultat. Ils ont besoin d'une transaction entièrement assemblée (signée), car la route de simulation exige la structure de la transaction. Pour une exécution, une instanciation ou une migration CosmWasm (et un appel cross-VM), les SDK relèvent la limite à au moins 1.3 fois le gas simulé. Aucun n'offre de constructeur de message cw20 ou CosmWasm prêt à l'emploi : construisez donc le `MsgExecuteContract` avec votre bibliothèque protobuf et passez ses octets signés.

**Python** (`qorechain-sdk`, `qorsdk`) : `estimate_gas` et `auto_fee` prennent la transaction construite et appliquent le plancher de 1.3 pour les messages wasm.

```python
from qorsdk import auto_fee, estimate_gas

rest = "https://api-testnet.qore.host"
gas = estimate_gas(rest, built, gas_multiplier=1.3)   # raises above the 50,000,000 cap
fee = auto_fee(rest, built, gas_multiplier=1.3, gas_price="0.15uqor")
```

**Go** (`github.com/qorechain/qorechain-sdk/packages/go/qorechain/tx`) : `EstimateGas` renvoie le gas simulé, `WasmGasWanted` applique le plancher de 1.3, et `EstimateFee` tarife un multiplicateur que vous passez (il n'ajoute pas le plancher lui-même : passez donc 1.3 ou plus).

```go
used, err := tx.EstimateGas("https://api-testnet.qore.host", txBytes, nil)
if err != nil { return err }
gas := tx.WasmGasWanted(used, 1.3)

fee, err := tx.EstimateFee("https://api-testnet.qore.host", txBytes, 1.3, "0.15uqor", nil)
```

**Rust** (`qorechain-sdk`) : `estimate_gas_wanted` relève la limite à au moins 1.3 fois le gas simulé pour les messages wasm et cross-VM, et `estimate_fee` la tarife.

```rust
use qorechain_sdk::tx::{estimate_fee, estimate_gas_wanted};

let est = estimate_gas_wanted("https://api-testnet.qore.host", &tx_bytes, 1.3).await?;
// est.simulated, est.gas_wanted
let fee = estimate_fee("https://api-testnet.qore.host", &tx_bytes, 1.3, "0.15uqor").await?;
```

**Java** (`io.github.qorechain.tx.AutoGas`) : passez `true` pour le dernier argument quand la transaction porte des messages wasm ou cross-VM.

```java
AutoGas.Estimate est = AutoGas.estimate(
    "https://api-testnet.qore.host", txBytes, /* hybrid */ true, 1.3, null, /* wasmOrCrossVm */ true);
// est.simulatedGas, est.gasWanted
```

### Route REST de simulation {#example-rest}

`POST /cosmos/tx/v1beta1/simulate` avec le base64 d'une transaction signée renvoie `gas_info.gas_used`. Multipliez-le par 1.3 pour la limite.

```bash
curl -s -X POST https://api-testnet.qore.host/cosmos/tx/v1beta1/simulate \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64 of the signed TxRaw>"}'
```

La réponse contient `gas_info.gas_used` (une chaîne). La route n'accepte que POST : un `GET` dessus répond `501 Not Implemented`.

## Limites et erreurs {#limits-errors}

| Situation | Ce que vous voyez | Que faire |
| --------- | ------------ | ---------- |
| Limite de gas supérieure à 50,000,000 | Refusée avant que les frais soient prélevés | Baissez la limite ; répartissez le travail sur plusieurs transactions |
| Manque de gas sur un appel de contrat | La transaction échoue avec une erreur de manque de gas | Simulez et utilisez au moins 1.3 fois le résultat ; ne réutilisez jamais une valeur fixe |
| Budget de contrats du bloc épuisé | Échec mentionnant le budget de gas wasm du bloc ; frais payés | Réessayez au bloc suivant, éventuellement avec des frais de priorité |
| Un appel a besoin de plus que la part d'une transaction | Échoue à chaque fois | Demandez à la gouvernance de relever le budget ou la part, ou rendez l'appel moins coûteux |
| Téléversement par un expéditeur sans accès | Refusé à l'admission | Soumettez le code via une proposition de gouvernance |
| Téléversement sans assez de gas pour sa taille déclarée | Manque de gas immédiat | Fixez un gas qui couvre la taille déclarée (environ 9.9 millions pour un cw20) |
| Téléversement au-delà d'une limite de module | Refusé au téléversement | Réduisez les fonctions, exports, globales, segments ou la mémoire (voir le tableau ci-dessus) |
| Instructions en virgule flottante dans un module | Refusé au téléversement, et à l'appel pour un code stocké | Retirez les opérations en virgule flottante du build |
| Téléversement gzip qui n'est pas un seul membre, ou dont la taille est erronée | Refusé | Compressez le module en un seul flux gzip avec la bonne taille |

## Pages associées {#related}

- [Guide QoreChain Native (SDK) : gas des appels de contrat](/sdk/guides/cosmwasm#gas)
- [Développement QoreChain Native](/developer-guide/cosmwasm-development)
- [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability)
- [Signature hybride et `tx pqc cosign`](/cli-reference/transaction-commands#hybrid-signing)
- [Gouvernance](/user-guide/governance)
