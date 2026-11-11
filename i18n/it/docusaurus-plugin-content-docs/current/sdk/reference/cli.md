---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Genera una nuova dApp QoreChain a partire da un template starter ufficiale.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Pubblicato su npm come `create-qorechain-dapp` (`0.13.0`). I file
> `package.json` generati dipendono da `@qorechain/sdk` `^0.13.0` (i template EVM da
> `@qorechain/evm` `^0.13.0`). La versione 0.8.0 dello scaffolder scriveva intervalli `^0.3.0`,
> che npm risolve in una release 0.3 incapace di firmare per le reti attive; se
> hai generato lo scaffolding con la 0.8.0, esegui `npm i @qorechain/sdk@latest`.

## Template

| Template | Descrizione |
| --- | --- |
| `evm-solidity` | Un contratto Solidity `Counter` + uno script viem di deploy/interazione (`@qorechain/evm`). |
| `fullstack-web` | Una dApp Vite + React + TypeScript che legge saldi e tokenomics (`@qorechain/sdk`). |
| `rollup-app` | Un'app rollup + sidechain/paychain che usa il `RollupClient` e l'helper multilayer (`@qorechain/sdk`). |
| `foundry` | Un progetto Foundry per l'EVM Engine di QoreChain. `pnpm window` registra la chiave ML-DSA-87 dell'account e apre la [finestra di autorizzazione EVM](/sdk/guides/evm#evm-window) prima di un deploy (aggiunto nella 0.11.0 solo su npm). |
| `hardhat` | Lo stesso per Hardhat 3, con `pnpm window status`, `register` e `open`. |
| `viem-wagmi` | Una dApp web su viem e wagmi che usa le chain `qorechain` e `qorechainTestnet` di `@qorechain/evm`. |
| `cosmwasm` | Un progetto di contratto QoreChain Native (Wasm). Sulle reti live il caricamento del codice è solo tramite governance; vedi la [guida a QoreChain Native](/sdk/guides/cosmwasm). |

Il template `rollup-app` (dallo scaffolder 0.10.0) esegue per impostazione predefinita una prova a vuoto (dry run). Con
`QORE_BROADCAST=1` deriva la chiave ML-DSA-87 dell'account dal mnemonic, la registra una volta e firma
in modo ibrido, cosa che il template precedente non poteva fare. I suoi valori di esempio per il rollup
(`profile: "default"`, lo stake) sono illustrativi: prendi i nomi dei profili reali e lo
stake da [Profili preset](/rollups/preset-profiles) e dai parametri live del modulo
prima di trasmettere.

Il template `fullstack-web` legge la panoramica della tokenomics tramite `client.qor`,
una chiamata JSON-RPC `qor_` che gli endpoint pubblici non servono, quindi su mainnet e
testnet quel pannello mostra un errore; la lettura del saldo funziona. Sostituiscila con
una lettura REST come `client.rest.getBurnStats()` per le reti pubbliche.

## Opzioni

| Flag | Descrizione |
| --- | --- |
| `-t, --template <name>` | Template da usare (`evm-solidity` \| `fullstack-web` \| `rollup-app` \| `foundry` \| `hardhat` \| `viem-wagmi` \| `cosmwasm`). |
| `--network <name>` | Preset di rete (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Salta i prompt e usa i valori predefiniti. |
| `--no-install` | Non installa le dipendenze dopo lo scaffolding. |
| `--local` | Riscrive le dipendenze `@qorechain/*` come link `file:` locali nel monorepo dell'SDK. |
| `-h, --help` | Mostra l'aiuto. |
| `-v, --version` | Stampa la versione. |

## Sviluppo locale contro il workspace

I pacchetti `@qorechain/*` sono pubblicati su npm, quindi un semplice `npm install`
funziona. Usa `--local` per puntare invece il progetto generato ai pacchetti del
monorepo (compilali prima con `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
