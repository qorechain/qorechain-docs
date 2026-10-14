---
slug: /sdk/reference/cli
title: CLI — create-qorechain-dapp
sidebar_label: CLI
sidebar_position: 2
---

# CLI: `create-qorechain-dapp`

Crea el andamiaje de una nueva dApp de QoreChain a partir de una plantilla inicial oficial.

```bash
# interactive
npm create qorechain-dapp my-dapp
# or
npx create-qorechain-dapp my-dapp

# non-interactive (CI)
npx create-qorechain-dapp my-dapp --template evm-solidity --yes --no-install
```

> Publicado en npm como `create-qorechain-dapp` (`0.8.0`). Los archivos
> `package.json` generados fijan `@qorechain/sdk` / `@qorechain/evm` en `^0.3.0`, que
> npm resuelve a una versión 0.3 que no puede firmar para las redes en vivo. Tras
> generar el andamiaje, ejecuta `npm i @qorechain/sdk@latest` (y `npm i @qorechain/evm@latest`
> para la plantilla EVM).

## Plantillas

| Plantilla | Descripción |
| --- | --- |
| `evm-solidity` | Un contrato `Counter` de Solidity + un script de despliegue/interacción con viem (`@qorechain/evm`). |
| `fullstack-web` | Una dApp Vite + React + TypeScript que lee saldos y tokenomics (`@qorechain/sdk`). |
| `rollup-app` | Una app de rollup + sidechain/paychain que usa el `RollupClient` y el asistente multilayer (`@qorechain/sdk`). |

La plantilla `fullstack-web` lee el resumen de tokenomics mediante `client.qor`, una
llamada JSON-RPC `qor_` que los endpoints públicos no sirven, por lo que en mainnet y
testnet ese panel muestra un error; la lectura del saldo funciona. Cámbiala por una lectura REST
como `client.rest.getBurnStats()` para las redes públicas.

## Opciones

| Flag | Descripción |
| --- | --- |
| `-t, --template <name>` | Plantilla a usar (`evm-solidity` \| `fullstack-web` \| `rollup-app`). |
| `--network <name>` | Preajuste de red (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Omitir los prompts y usar los valores por defecto. |
| `--no-install` | No instalar dependencias tras el andamiaje. |
| `--local` | Reescribe las dependencias `@qorechain/*` como enlaces locales `file:` al monorepo del SDK. |
| `-h, --help` | Mostrar la ayuda. |
| `-v, --version` | Imprimir la versión. |

## Desarrollo local contra el workspace

Los paquetes `@qorechain/*` están publicados en npm, así que un simple `npm install`
funciona. Usa `--local` para apuntar en su lugar el proyecto generado a los paquetes del
monorepo (compílalos primero con `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
