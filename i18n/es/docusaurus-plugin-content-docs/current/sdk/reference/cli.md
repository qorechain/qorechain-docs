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

> Publicado en npm como `create-qorechain-dapp` (`0.3.0`).

## Plantillas

| Plantilla | Descripción |
| --- | --- |
| `evm-solidity` | Un contrato `Counter` de Solidity + un script de despliegue/interacción con viem (`@qorechain/evm`). |
| `fullstack-web` | Una dApp Vite + React + TypeScript que lee saldos y tokenomics (`@qorechain/sdk`). |

## Opciones

| Flag | Descripción |
| --- | --- |
| `-t, --template <name>` | Plantilla a usar (`evm-solidity` \| `fullstack-web`). |
| `--network <name>` | Preajuste de red (`testnet` \| `mainnet`). |
| `--package-manager <pm>` | `pnpm` \| `npm` \| `yarn`. |
| `-y, --yes` | Omitir los prompts y usar los valores por defecto. |
| `--no-install` | No instalar dependencias tras el andamiaje. |
| `--local` | Reescribe las dependencias `@qorechain/*` como enlaces locales `file:` al monorepo del SDK. |
| `-h, --help` | Mostrar la ayuda. |
| `-v, --version` | Imprimir la versión. |

## Desarrollo local contra el workspace

Los paquetes `@qorechain/*` están publicados en npm; una vez publicados, un simple
`npm install` funciona. Antes de eso, usa `--local` para apuntar el proyecto generado
a los paquetes del monorepo (compílalos primero con `pnpm -r build`):

```bash
npx create-qorechain-dapp my-dapp --template fullstack-web --local
```
