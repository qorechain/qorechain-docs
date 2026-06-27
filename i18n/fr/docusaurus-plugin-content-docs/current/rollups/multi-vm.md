---
slug: /rollups/multi-vm
title: Multi-VM (appels inter-VM)
sidebar_label: Multi-VM
sidebar_position: 8
---

# Multi-VM (appels inter-VM)

Un rollup multi-VM exécute une couche d'exécution EVM capable d'appeler des
contrats CosmWasm via un **précompilé inter-VM** dédié. Le RDK fournit l'outillage
TypeScript pour encoder ces appels ainsi qu'un modèle de structure pour démarrer.

> Cet outillage couvre **EVM → CosmWasm** uniquement. SVM est un environnement
> d'exécution distinct et ne fait pas partie du précompilé inter-VM.

## Le précompilé

Le précompilé inter-VM est exposé à une adresse fixe :

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## Encoder un appel inter-VM

`encodeCrossVmCalldata` construit les calldata que votre contrat EVM envoie au
précompilé pour invoquer un contrat CosmWasm. `functionSelector` calcule le
sélecteur de 4 octets pour une signature de fonction Solidity.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Le côté Solidity

Depuis un contrat EVM, vous appelez l'adresse du précompilé avec les calldata
encodés. Le modèle `multivm-rollup` inclut un extrait `contracts/CrossVmCaller.sol`
de ce type :

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Générer un rollup multi-VM

Un nouveau modèle, `multivm-rollup`, génère un rollup EVM câblé pour appeler
CosmWasm, y compris l'extrait `CrossVmCaller.sol` :

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Consultez [Déployer un Rollup](/rollups/deploying-a-rollup) pour tous les modèles
du générateur de structure.
