---
slug: /rollups/why
title: Pourquoi le RDK QoreChain
sidebar_label: Pourquoi le RDK QoreChain
sidebar_position: 2
---

# Pourquoi le RDK QoreChain

La plupart des kits de développement de rollups sont des variations sur le même
thème : ils vous aident à lancer une app-chain qui se règle sur une couche de
base. Le RDK QoreChain fait cela aussi, et il ajoute trois capacités propres à
QoreChain, construites autour de la couche 1 de QoreChain plutôt que de
l'outillage :

- une couche de règlement **post-quantique**,
- des primitives consultatives d'**IA/RL on-chain** (QCAI), et
- un environnement d'exécution **triple-VM** avec des appels inter-VM.

:::caution Stade précoce : lisez la colonne Statut
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau (vérifié le 21 octobre 2026).
Le tableau ci-dessous indique ce qui fonctionne aujourd'hui ; ce que les clients
0.6.0 publiés ont changé et les limites qui subsistent sont rassemblées dans [RDK 0.6.0 : changements et limites](/rollups/deploying-a-rollup#rdk-050-limits). Si vous n'avez besoin que d'un
rollup optimiste/zk générique, n'importe quel kit fera l'affaire ; les
capacités décrites ici sont ce que le RDK ajoute par-dessus, en TypeScript,
Python, Go, Rust et Java.
:::

| Capacité | Statut | Sur quoi elle repose |
| --- | --- | --- |
| **Reçus de règlement résistants au quantique** | 🟡 Stade précoce | Les ancrages sont signés avec ML-DSA-87, le schéma post-quantique de la Main Chain ; aucun ancrage n'existe encore, de sorte que le vérificateur de la 0.6.0 (qui vérifie par rapport à la chaîne) n'a jamais été exécuté sur un véritable ancrage |
| **Copilote de rollup QCAI** | 🟡 Pas encore disponible sur les points de terminaison publics | Des services consultatifs d'IA/RL on-chain que les points de terminaison publics n'exposent pas aujourd'hui |
| **Appels inter-VM multi-VM** | 🟡 Pas encore utilisable sur les réseaux en production | Une précompilation inter-VM qui n'est pas activée, un encodeur 0.5.0 qui ne correspond pas à la disposition de la chaîne, et le téléversement QoreChain Native est fermé |

---

## 1. Reçus de règlement résistants au quantique

> 🟡 **Conception construite sur la couche de base post-quantique de QoreChain.**
> Les ancrages de règlement sont signés avec ML-DSA-87 (Dilithium-5, FIPS-204),
> le même schéma que celui utilisé par la Main Chain. Stade précoce : aucun
> ancrage n'existe encore sur l'un ou l'autre réseau.

Lorsque le créateur de votre rollup ancre un lot de règlement, l'ancrage est
signé avec une clé post-quantique enregistrée on-chain. Le RDK peut empaqueter
cet ancrage sous la forme d'un **reçu portable**, et un vérificateur relit
l'affirmation depuis un nœud QoreChain pour confirmer que le rollup, le lot,
l'ancrage et la clé du créateur correspondent tous à ce que détient la chaîne.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

`verifySettlementReceipt` vérifie par rapport à la chaîne et refuse de dire `valid`
sans `client`. Dans la 0.5.0, son contrôle sur la chaîne ne pouvait pas aboutir face
aux réseaux en service (il échouait de façon fermée au lieu de déclarer valide un
reçu authentique) ; la 0.6.0 corrige cela, mais aucun ancrage n'existe encore, il
n'a donc pas été exécuté sur un véritable ancrage. Voir [Reçus de règlement résistants au quantique](/rollups/settlement-receipts)
pour ce qu'un reçu prouve et ce qu'il ne prouve pas, ainsi que pour les limites exactes.

---

## 2. Copilote de rollup QCAI

> 🟡 **Pas encore disponible sur les points de terminaison publics.**

Le Copilote est destiné à agréger les services consultatifs du réseau (un agent
de politique de frais, des recommandations, des enquêtes de fraude) en une vue
unique, en lecture seule et en langage clair pour un rollup. Il fonctionne au
mieux (best-effort) : si un service est injoignable, il se dégrade en
avertissement au lieu d'échouer. Ces services ne sont pas exposés sur les
points de terminaison publics aujourd'hui, donc chaque section revient sous
forme d'avertissement.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

Depuis la CLI : `qorollup advise my-rollup`. Voir [Copilote QCAI](/rollups/qcai-copilot).

---

## 3. Appels inter-VM multi-VM

> 🟡 **Pas encore utilisable sur les réseaux en production** — la précompilation
> n'est pas activée et le téléversement QoreChain Native est fermé. Voir
> [Multi-VM](/rollups/multi-vm).

Le RDK inclut des utilitaires qui encodent un appel d'un contrat EVM (Solidity)
vers un contrat **QoreChain Native** via une précompilation fixe à l'adresse `0x…0901`.
Cette précompilation n'est **pas active** sur le mainnet ni sur le testnet
(voir
[Précompilations EVM : état du réseau](/developer-guide/evm-precompiles#network-status)) :
`eth_getCode` pour `0x…0901` renvoie `0x` sur les deux, et un appel de contrat
vers cette adresse réussit sans aucun effet.

L'utilitaire `encodeCrossVmCalldata` de la 0.6.0 construit les données d'appel
pour `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`, la
disposition que le nœud décode (la 0.5.0 et les versions antérieures encodaient une
forme à deux arguments avec un sélecteur différent, qui n'aurait jamais pu atteindre
la précompilation). Vous pouvez encoder le même appel vous-même, illustré ici avec
viem (`targetVM` 1 est QoreChain Native, la seule cible prise en charge) :

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = QoreChain Native
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

Ou directement depuis Solidity sur votre rollup :

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

`ok` seul ne prouve rien aujourd'hui : tant que la précompilation n'a pas de code,
l'appel renvoie un succès avec des données vides et n'exécute rien ; confirmez donc
l'effet sur le contrat cible.

Créez un projet de démarrage avec `npm create qorechain-rollup my-app -- --template multivm-rollup`.
(EVM↔QoreChain Native uniquement ; les appels inter-VM SVM sont distincts.)

---

## Tout le reste, comme attendu

Au-delà de ces capacités, le RDK fournit aussi les fonctionnalités de base :
cinq clients de langage publiés et vérifiés contre des vecteurs de référence
partagés, les cinq profils prédéfinis et la matrice de compatibilité complète,
la gestion des lots de règlement et du cycle de vie, le stockage natif de
disponibilité des données (voir sa note de statut), un auto-challenger
**watchtower** pour les rollups optimistes, et la CLI d'opérateur `qorollup`.

## Et ensuite

- [Déployer un rollup](/rollups/deploying-a-rollup) — installation par langage
  et parcours CLI jusqu'à un rollup testnet.
- [Reçus de règlement résistants au quantique](/rollups/settlement-receipts) ·
  [Copilote QCAI](/rollups/qcai-copilot) ·
  [Multi-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — les analyses approfondies.
