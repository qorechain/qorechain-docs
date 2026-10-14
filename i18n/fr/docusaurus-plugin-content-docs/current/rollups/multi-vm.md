---
slug: /rollups/multi-vm
title: Multi-VM (appels inter-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (appels inter-VM)

Le RDK inclut des assistants TypeScript qui encodent un appel d'un contrat EVM vers le **précompilé inter-VM** à l'adresse `0x0000000000000000000000000000000000000901`, conçu pour l'acheminer vers un contrat CosmWasm sur le runtime **QoreChain Native** (Wasm), ainsi qu'un modèle de structure (scaffold) `multivm-rollup` qui les câble. L'outillage couvre uniquement **EVM → QoreChain Native** ; la SVM est un environnement d'exécution distinct et ne fait pas partie du précompilé.

:::caution Pas encore utilisable sur les réseaux en service
Le précompilé inter-VM **n'est pas activé** sur l'un ou l'autre réseau : la liste des précompilés statiques actifs du module EVM est vide sur le mainnet et le testnet, de sorte qu'un appel à `0x…0901` renvoie des données vides et n'exécute rien. Le téléversement de contrats CosmWasm est également fermé sur les deux réseaux, et la voie de transaction SVM est désactivée sur l'ensemble du réseau. Tant que le précompilé n'est pas activé et que les téléversements CosmWasm ne sont pas rouverts, il n'y a rien à appeler. Cette page documente l'outillage pour que vous puissiez vous préparer ; ne construisez pas de flux de production dessus. Voir [Précompilés EVM : statut du réseau](/developer-guide/evm-precompiles#network-status).
:::

:::note
Depuis la version v0.4.2 du RDK, l'identifiant de l'option VM du runtime Wasm est **`native`** (QoreChain Native) ; `cosmwasm` reste un alias hérité accepté, et les deux correspondent à `cosmwasm` sur le réseau. La fonction ABI du précompilé est `executeCrossVMCall(string,bytes)`.
:::

## L'adresse du précompilé

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x0000000000000000000000000000000000000901
```

## Encoder un appel inter-VM

`encodeCrossVmCalldata` construit les calldata pour `executeCrossVMCall(string contract, bytes msg)`. `msg` est le message d'exécution du contrat, sous forme de chaîne JSON UTF-8 ou d'octets bruts.

```ts
import { encodeCrossVmCalldata } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: JSON.stringify({ transfer: { recipient: "qor1...", amount: "100" } }),
});
```

## Le côté Solidity

Depuis un contrat EVM, vous appelez l'adresse du précompilé avec l'appel encodé :

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(string,bytes)", contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Comme le précompilé est inactif, un simple `.call` vers celui-ci renvoie un succès avec des données vides ; si vous testez cela aujourd'hui, vérifiez la longueur renvoyée plutôt que de vous fier uniquement à l'indicateur `ok`.

## Générer un rollup multi-VM

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Le modèle inclut un point de départ `contracts/CrossVmCaller.sol` ; comparez-le avec l'ABI ci-dessus avant de vous y fier. Consultez [Déployer un Rollup](/rollups/deploying-a-rollup) pour tous les modèles du générateur de structure.
