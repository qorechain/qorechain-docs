---
slug: /rollups/multi-vm
title: Multi-VM (appels inter-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (appels inter-VM)

Le RDK inclut des assistants TypeScript qui encodent un appel d'un contrat EVM vers le **précompilé inter-VM** à l'adresse `0x0000000000000000000000000000000000000901`, conçu pour l'acheminer vers un contrat QoreChain Native sur le runtime **QoreChain Native** (Wasm), ainsi qu'un modèle de structure (scaffold) `multivm-rollup` qui les câble. L'outillage couvre uniquement **EVM → QoreChain Native** ; la SVM est un environnement d'exécution distinct et ne fait pas partie du précompilé.

:::caution Pas encore utilisable sur les réseaux en service
Le précompilé inter-VM **n'est pas activé** sur l'un ou l'autre réseau : la liste des précompilés statiques actifs du module EVM est vide sur le mainnet, et sur le testnet elle ne contient que `0x…0A01`, `0x…0A02` et `0x…0C01` (vérifié le 27 octobre 2026), de sorte que `0x…0901` ne figure sur aucune des deux listes ; `eth_getCode` pour `0x…0901` renvoie `0x`, et un appel vers cette adresse réussit avec des données vides et n'exécute rien. Le téléversement de contrats QoreChain Native est également fermé sur les deux réseaux, et la voie de transaction SVM est désactivée sur l'ensemble du réseau. Tant que le précompilé n'est pas activé et que les téléversements QoreChain Native ne sont pas rouverts, il n'y a rien à appeler. Cette page documente l'outillage pour que vous puissiez vous préparer ; ne construisez pas de flux de production dessus. Voir [Précompilés EVM : statut du réseau](/developer-guide/evm-precompiles#network-status).
:::

:::note L'encodeur correspond à la disposition de la chaîne depuis la 0.6.0
`encodeCrossVmCalldata` dans `@qorechain/rdk` **0.5.0 et antérieures** (ainsi que le point de départ `CrossVmCaller.sol` du modèle `multivm-rollup` de ces versions) utilisait `executeCrossVMCall(string,bytes)`, un sélecteur de fonction différent de celui que décode le nœud ; aucun appel qu'elles encodaient n'aurait donc pu atteindre le précompilé, même sur un réseau qui l'aurait activé. La **0.6.0** encode `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (sélecteur `0x3c11078c`), ce que décode le nœud (sélecteur de 4 octets, puis les arguments encodés en ABI ; `targetVM` 1 correspond à QoreChain Native, la seule cible prise en charge), et les calldata de l'assistant font l'aller-retour dans le décodeur propre à la chaîne, selon les notes de version. L'ABI peut encore changer avant l'activation.
:::

:::note
Depuis la version v0.4.2 du RDK, l'identifiant de l'option VM du runtime Wasm est **`native`** (QoreChain Native) ; `cosmwasm` reste un alias hérité accepté, et les deux correspondent à `cosmwasm` sur le réseau.
:::

## L'adresse du précompilé

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Encoder un appel inter-VM

Encodez directement la disposition du nœud. `payload` est le message d'exécution du contrat, sous forme d'octets JSON UTF-8 (exemple avec viem) :

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1, // QoreChain Native
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata` de `@qorechain/rdk` 0.6.0 et ultérieures construit pour vous les mêmes calldata :

```ts
import {
  CROSS_VM_PRECOMPILE,
  CROSS_VM_TARGET,
  encodeCrossVmCalldata,
  isCrossVmPrecompileActive,
} from "@qorechain/rdk";

// Ask the node first: today this answers `active: false` on both networks.
const status = await isCrossVmPrecompileActive("https://api.qore.host");
console.log(status.active, status.reason);

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ increment: {} }),
  targetVm: CROSS_VM_TARGET.NATIVE, // 1 = QoreChain Native (CosmWasm); the default
});
// An EVM transaction to CROSS_VM_PRECOMPILE with `data: calldata`.
```

`isCrossVmPrecompileActive(restBase)` lit le paramètre EVM `active_static_precompiles` via REST et répond `active: true` uniquement lorsque l'adresse du précompilé figure dans la liste. C'est la seule vérification fiable, et elle doit se faire hors chaîne : le précompilé renvoie la réponse brute de la cible, de sorte qu'une réponse vide ne permet pas de distinguer un précompilé inactif d'un véritable appel à un contrat qui ne renvoie rien, et un précompilé n'a pas de bytecode, qu'il soit actif ou non. Même lorsqu'il indique `active: true`, le paquet documente qu'à partir de la chaîne v3.2.3 un appel n'atteint que les cibles que la gouvernance a placées sur la liste d'autorisation (le paramètre inter-VM `bridge_allowed_targets`, chaque entrée étant de la forme `<vm>:<contract>`), et que l'EVM vers l'EVM est refusé.

## Le côté Solidity

Depuis un contrat EVM, vous appelez l'adresse du précompilé avec l'appel encodé :

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data = abi.encodeWithSignature(
        "executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_
    );
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Comme le précompilé est inactif, un simple `.call` vers celui-ci renvoie un **succès avec des données vides et ne fait rien** ; l'indicateur `ok` ne vous dit pas que l'appel a pris effet. La protection fiable côté contrat est une cible qui renvoie toujours un accusé de réception non vide, avec un `require(ret.length > 0)` après l'appel, de sorte qu'une réponse vide soit traitée comme un échec ; le modèle `multivm-rollup` (0.6.0 et 0.6.1) fait cela.

## Générer un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Le modèle `multivm-rollup` (0.6.0 et 0.6.1) inclut `src/crossvm-call.ts` (il vérifie si le précompilé est actif, puis affiche les calldata) et un `contracts/CrossVmCaller.sol` qui appelle `executeCrossVMCall(uint8,string,bytes)` et exige une réponse non vide de la cible. Il ne fait pas fonctionner un appel tant que le précompilé est inactif. Consultez [Déployer un Rollup](/rollups/deploying-a-rollup) pour tous les modèles du générateur de structure.
