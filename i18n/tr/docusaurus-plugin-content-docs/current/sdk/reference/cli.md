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

> npm'e `create-qorechain-dapp` (`0.13.1`, SDK 0.13.0'ın üzerine yalnızca şablonları içeren bir yama) olarak yayınlandı. Oluşturulan
> `package.json` dosyaları `@qorechain/sdk` `^0.13.0` sürümüne bağımlıdır (EVM şablonları
> ise `@qorechain/evm` `^0.13.0` sürümüne). İskeleleyicinin 0.8.0 sürümü `^0.3.0`
> aralıkları yazıyordu; npm bunu canlı ağlar için imzalayamayan bir 0.3 sürümüne çözer.
> 0.8.0 ile iskelelediyseniz `npm i @qorechain/sdk@latest` komutunu çalıştırın.

## Şablonlar

| Şablon | Açıklama |
| --- | --- |
| `evm-solidity` | Bir Solidity `Counter` sözleşmesi + bir viem dağıtım/etkileşim betiği (`@qorechain/evm`). Betiği `pnpm run deploy` ile çalıştırın (`pnpm deploy` değil, o farklı bir pnpm komutudur); `.env` dosyasını okur ve README'si dağıtımdan önce EVM penceresinin nasıl açılacağını anlatır. |
| `fullstack-web` | Bakiyeleri ve tokenomik verileri okuyan bir Vite + React + TypeScript dApp'i (`@qorechain/sdk`). Herkese açık REST CORS başlıkları göndermediği için REST bir Vite `/lcd` vekili üzerinden gider; bu yüzden tarayıcı kodu geliştirme sırasında `/lcd/...` çağırır. |
| `rollup-app` | `RollupClient` ve multilayer yardımcısını kullanan bir rollup + sidechain/paychain uygulaması (`@qorechain/sdk`). |
| `foundry` | QoreChain'in EVM Engine'i için bir Foundry projesi. `pnpm window`, bir dağıtımdan önce hesabın ML-DSA-87 anahtarını kaydeder ve [EVM yetkilendirme penceresini](/sdk/guides/evm#evm-window) açar (yalnızca npm'e çıkan 0.11.0'da eklendi). |
| `hardhat` | Hardhat 3 için aynısı; `pnpm window status`, `register` ve `open` ile. |
| `viem-wagmi` | `@qorechain/evm`'in `qorechain` ve `qorechainTestnet` zincirlerini kullanan, viem ve wagmi üzerinde bir web dApp'i. viem `~2.53.1` sürümüne sabitlenir ve REST için aynı `/lcd` vekilini kullanır. |
| `cosmwasm` | Bir QoreChain Native (Wasm) sözleşme projesi. Canlı ağlarda kod yükleme yalnızca yönetişimle yapılır; bkz. [QoreChain Native kılavuzu](/sdk/guides/cosmwasm). |

`rollup-app` şablonu (iskelelayıcı 0.10.0'dan beri) varsayılan olarak bir deneme çalıştırması yapar. `QORE_BROADCAST=1`
ile hesabın ML-DSA-87 anahtarını mnemonic'ten türetir, bir kez kaydeder ve hibrit imzalar;
önceki şablon bunu yapamıyordu. Örnek rollup değerleri (`profile: "default"`, stake) açıklayıcıdır:
yayın yapmadan önce gerçek profil adlarını ve stake'i [Ön ayarlı profiller](/rollups/preset-profiles)
sayfasından ve canlı modül parametrelerinden alın.

`fullstack-web` şablonu, tokenomik genel bakışını `client.qor` üzerinden okur; bu, genel uç
noktaların sunmadığı bir `qor_` JSON-RPC çağrısıdır, bu yüzden mainnet ve testnet üzerinde bu
panel bir hata gösterir; bakiye okuması çalışır. Genel ağlar için bunu
`client.rest.getBurnStats()` gibi bir REST okumasına çevirin.

## Seçenekler

| Bayrak | Açıklama |
| --- | --- |
| `-t, --template <name>` | Kullanılacak şablon (`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`). |
| `--network <name>` | Ağ ön ayarı (`testnet` \| `mainnet`). Seçilen ağın herkese açık uç noktalarını üretilen `.env` dosyasına yazar (0.13.1). |
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
