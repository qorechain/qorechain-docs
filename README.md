# QoreChain Documentation

Source for the QoreChain documentation site at [docs.qorechain.io](https://docs.qorechain.io),
built with [Docusaurus](https://docusaurus.io/).

## Requirements

Node 20 LTS (see `.nvmrc`):

```bash
nvm use
```

## Local development

```bash
npm install
npm start
```

Starts a local dev server with live reload.

## Build

```bash
npm run build
```

Generates the static site into the `build` directory.

## Checks

```bash
npm run typecheck          # TypeScript type-check
./scripts/check.sh  # checks
```
