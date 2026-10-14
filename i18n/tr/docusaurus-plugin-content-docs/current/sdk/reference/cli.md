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

> npm'e `create-qorechain-dapp` (`0.8.0`) olarak yayınlandı. Oluşturulan
> `package.json` dosyaları `@qorechain/sdk` / `@qorechain/evm` paketlerini `^0.3.0`
> sürümüne sabitler; npm bunu canlı ağlar için imzalayamayan bir 0.3 sürümüne çözer.
> İskeleleme sonrasında `npm i @qorechain/sdk@latest` komutunu çalıştırın (EVM şablonu
> için ayrıca `npm i @qorechain/evm@latest`).

## Şablonlar

| Şablon | Açıklama |
| --- | --- |
| `evm-solidity` | Bir Solidity `Counter` sözleşmesi + bir viem dağıtım/etkileşim betiği (`@qorechain/evm`). |
| `fullstack-web` | Bakiyeleri ve tokenomik verileri okuyan bir Vite + React + TypeScript dApp'i (`@qorechain/sdk`). |
| `rollup-app` | `RollupClient` ve multilayer yardımcısını kullanan bir rollup + sidechain/paychain uygulaması (`@qorechain/sdk`). |

`fullstack-web` şablonu, tokenomik genel bakışını `client.qor` üzerinden okur; bu, genel uç
noktaların sunmadığı bir `qor_` JSON-RPC çağrısıdır, bu yüzden mainnet ve testnet üzerinde bu
panel bir hata gösterir; bakiye okuması çalışır. Genel ağlar için bunu
`client.rest.getBurnStats()` gibi bir REST okumasına çevirin.

## Seçenekler

| Bayrak | Açıklama |
| --- | --- |
| `-t, --template <name>` | Kullanılacak şablon (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Ağ ön ayarı (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | İstemleri atlayın ve varsayılanları kullanın. |
| `--no-install` | İskeleleme sonrasında bağımlılıkları kurmayın. |
| `--local` | `@qorechain/*` bağımlılıklarını SDK monorepo'suna yerel `file:` bağlantıları olarak yeniden yazın. |
| `-h, --help` | Yardımı gösterin. |
| `-v, --version` | Sürümü yazdırın. |

## Çalışma alanına karşı yerel geliştirme

`@qorechain/*` paketleri npm'e yayınlanmıştır, bu yüzden düz bir `npm install` çalışır.
İskelelenen projeyi bunun yerine monorepo paketlerine yönlendirmek için `--local` kullanın
(önce bunları `pnpm -r build` ile derleyin):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
