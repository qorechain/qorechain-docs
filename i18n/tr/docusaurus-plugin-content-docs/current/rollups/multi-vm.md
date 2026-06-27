---
slug: /rollups/multi-vm
title: Çoklu-VM (VM'ler arası çağrılar)
sidebar_label: Çoklu-VM
sidebar_position: 8
---

# Çoklu-VM (VM'ler arası çağrılar)

Çoklu-VM rollup'u, özel bir **VM'ler arası ön derlemesi (precompile)** aracılığıyla
CosmWasm sözleşmelerini çağırabilen bir EVM yürütme katmanı çalıştırır. RDK, bu
çağrıları kodlamak için TypeScript araçlarını ve başlangıç noktası olarak bir iskelet
şablonu içerir.

> Bu araçlar yalnızca **EVM → CosmWasm** kapsamını içerir. SVM ayrı bir çalışma zamanıdır ve
> VM'ler arası ön derlemenin bir parçası değildir.

## Ön derleme (precompile)

VM'ler arası ön derleme sabit bir adreste sunulur:

```ts
import { CROSS_VM_PRECOMPILE } from "@qorechain/rdk";

console.log(CROSS_VM_PRECOMPILE); // 0x…0901
```

## VM'ler arası çağrı kodlama

`encodeCrossVmCalldata`, EVM sözleşmenizin bir CosmWasm sözleşmesini çağırmak için
ön derlemeye gönderdiği calldata'yı oluşturur. `functionSelector`, bir Solidity
işlev imzası için 4 baytlık seçiciyi hesaplar.

```ts
import { encodeCrossVmCalldata, functionSelector } from "@qorechain/rdk";

const calldata = encodeCrossVmCalldata({
  contract: "qor1cosmwasmcontractaddress...",
  msg: { transfer: { recipient: "qor1...", amount: "100" } },
});

const selector = functionSelector("callCosmwasm(string,bytes)");
```

## Solidity tarafı

Bir EVM sözleşmesinden, kodlanmış calldata ile ön derleme adresini çağırırsınız.
`multivm-rollup` şablonu, şu satırlar doğrultusunda bir `contracts/CrossVmCaller.sol`
parçası içerir:

```solidity
// contracts/CrossVmCaller.sol
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmwasm(bytes memory calldata_) internal returns (bytes memory) {
    (bool ok, bytes memory out) = CROSS_VM_PRECOMPILE.call(calldata_);
    require(ok, "cross-vm call failed");
    return out;
}
```

## Çoklu-VM rollup iskeleti oluşturma

Yeni bir şablon olan `multivm-rollup`, `CrossVmCaller.sol` parçası dahil olmak üzere,
CosmWasm'ı çağırmak için bağlanmış bir EVM rollup iskeleti oluşturur:

```bash
npm create qorechain-rollup my-app -- --template multivm-rollup
```

Tüm iskelet oluşturucu şablonları için [Bir Rollup Dağıtma](/rollups/deploying-a-rollup)
sayfasına bakın.
