---
slug: /rollups/multi-vm
title: Multi-VM (appels inter-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (appels inter-VM)

Le RDK inclut des assistants TypeScript qui encodent un appel d'un contrat EVM vers le **précompilé inter-VM** à l'adresse `0x0000000000000000000000000000000000000901`, conçu pour l'acheminer vers un contrat CosmWasm sur le runtime **QoreChain Native** (Wasm), ainsi qu'un modèle de structure (scaffold) `multivm-rollup` qui les câble. L'outillage couvre uniquement **EVM → QoreChain Native** ; la SVM est un environnement d'exécution distinct et ne fait pas partie du précompilé.

:::caution Pas encore utilisable sur les réseaux en service
Le précompilé inter-VM **n'est pas activé** sur l'un ou l'autre réseau : la liste des précompilés statiques actifs du module EVM est vide sur le mainnet et le testnet, `eth_getCode` pour `0x…0901` renvoie `0x`, et un appel vers cette adresse réussit avec des données vides et n'exécute rien. Le téléversement de contrats CosmWasm est également fermé sur les deux réseaux, et la voie de transaction SVM est désactivée sur l'ensemble du réseau. Tant que le précompilé n'est pas activé et que les téléversements CosmWasm ne sont pas rouverts, il n'y a rien à appeler. Cette page documente l'outillage pour que vous puissiez vous préparer ; ne construisez pas de flux de production dessus. Voir [Précompilés EVM : statut du réseau](/developer-guide/evm-precompiles#network-status).
:::

:::caution L'encodeur 0.5.0 ne correspond pas à la disposition de la chaîne
`encodeCrossVmCalldata` dans `@qorechain/rdk` 0.5.0 (ainsi que le point de départ `CrossVmCaller.sol` du modèle `multivm-rollup`) utilise la fonction `executeCrossVMCall(string,bytes)`. Le nœud décode `executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)` (sélecteur de 4 octets, puis les arguments encodés en ABI ; `targetVM` 1 correspond à CosmWasm, la seule cible prise en charge), et l'ABI peut encore changer avant l'activation. Les calldata produits par l'assistant ne sont donc pas décodés par le nœud, même une fois le précompilé en place. Les sections ci-dessous présentent la disposition du nœud.
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
    1, // CosmWasm
    "qor1cosmwasmcontractaddress...",
    toHex(new TextEncoder().encode(JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }))),
  ],
});
```

`encodeCrossVmCalldata({ contract, msg })` de `@qorechain/rdk` construit à la place la forme `(string,bytes)`, que le nœud ne lit pas (voir l'avertissement ci-dessus).

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

Comme le précompilé est inactif, un simple `.call` vers celui-ci renvoie un **succès avec des données vides et ne fait rien** ; l'indicateur `ok` ne vous dit pas que l'appel a pris effet. Si vous testez cela aujourd'hui, confirmez l'effet sur le contrat cible.

## Générer un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Le modèle inclut un point de départ `contracts/CrossVmCaller.sol` ; comparez-le avec la disposition du nœud ci-dessus avant de vous y fier. Consultez [Déployer un Rollup](/rollups/deploying-a-rollup) pour tous les modèles du générateur de structure.
