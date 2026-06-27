---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Resmi bir başlangıç şablonundan yeni bir QoreChain dApp'i iskeleleyin.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> npm'e `create-qorechain-dapp` (`0.3.0`) olarak yayınlandı.

## Şablonlar

| Şablon | Açıklama |
| --- | --- |
| `evm-solidity` | Bir Solidity `Counter` sözleşmesi + bir viem dağıtım/etkileşim betiği (`@qorechain/evm`). |
| `fullstack-web` | Bakiyeleri ve tokenomik verileri okuyan bir Vite + React + TypeScript dApp'i (`@qorechain/sdk`). |

## Seçenekler

| Bayrak | Açıklama |
| --- | --- |
| `-t, --template <name>` | Kullanılacak şablon (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | Ağ ön ayarı (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | İstemleri atlayın ve varsayılanları kullanın. |
| `--no-install` | İskeleleme sonrasında bağımlılıkları kurmayın. |
| `--local` | `@qorechain/*` bağımlılıklarını SDK monorepo'suna yerel `file:` bağlantıları olarak yeniden yazın. |
| `-h, --help` | Yardımı gösterin. |
| `-v, --version` | Sürümü yazdırın. |

## Çalışma alanına karşı yerel geliştirme

`@qorechain/*` paketleri npm'e yayınlanmıştır; bir kez yayınlandıktan sonra düz
bir `npm install` çalışır. Bundan önce, iskelelenen projeyi monorepo paketlerine
yönlendirmek için `--local` kullanın (önce bunları `pnpm -r build` ile derleyin):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
