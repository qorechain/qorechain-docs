---
slug: /developer-tools/qore-cli
title: CLI-ul QoreChain (qore)
sidebar_label: CLI QoreChain
sidebar_position: 24
---

# CLI-ul QoreChain (`@qorechain/qore-cli`, comanda `qore`)

`qore` citește QoreChain din terminal. Este pentru dezvoltatori, operatori și scripturi care vor să caute o tranzacție, să verifice dacă semnătura ei post-cuantică se validează, să citească un cont sau setul de validatori, să simuleze o tranzacție ori să pregătească un transfer nesemnat, fără să scrie cod. Fiecare comandă rulează o unealtă a [serverului MCP QoreChain](/developer-tools/mcp), iar `--json` afișează exact JSON-ul pe care îl returnează unealta, astfel încât un script și un agent AI văd aceleași date.

Nimic nu este semnat sau transmis în rețea vreodată, iar CLI-ul nu ține chei. Versiunea **0.1.0**, publicată pe 27 octombrie 2026, Apache-2.0, Node.js 20 sau mai nou.

## Inovații {#innovations}

- **JSON identic cu ieșirea uneltei MCP.** `qore <command> --json` afișează același obiect, cu aceleași nume de câmpuri, pe care îl returnează unealta MCP corespunzătoare. Fără `--json` același obiect este afișat ca text lizibil. Un script scris pentru una funcționează și cu cealaltă.
- **Starea post-cuantică din terminal.** `qore pq status <txhash>` raportează dacă tranzacția poartă exact un strat hibrid și dacă semnătura ML-DSA-87 (FIPS 204) se verifică față de cheia pe care semnatarul a înregistrat-o pe lanț, pentru sign-bytes v1 și v2. `qore pq status <address>` raportează cheia înregistrată, tipul ei, dovada de posesie și fereastra de autorizare EVM.
- **O conductă pentru un transfer care nu are nevoie de cheie.** `prepare-transfer --json` scrie un transfer nesemnat, iar `simulate` acceptă acel fișier, astfel încât poți construi, verifica și evalua costul unui transfer dintr-un script shell. Pasul de semnare rămâne în portofelul tău sau în [QoreSign](/qoresign/overview).
- **Coduri de ieșire stabile.** 0 înseamnă succes, 1 este o eroare de unealtă care poartă un cod stabil precum `NOT_FOUND` sau `INVALID_INPUT`, iar 2 este o eroare de utilizare, astfel încât un script poate ramifica în funcție de rezultat.

## Cum se utilizează {#how-to-use}

Rulează-l fără instalare sau instalează-l o singură dată:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Comenzile sunt doar în citire și folosesc implicit testnet:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Sumele sunt `1.5` sau `1.5 QOR` (QOR, până la 6 zecimale) ori `1500000uqor`. Adresele pot fi `qor1...` sau `0x...`.

### Comenzi {#commands}

| Comandă | Unealtă MCP | Ce face |
|---|---|---|
| `chain`, `features` | `get_chain_info` | ID-urile lanțului, ultimul bloc, prețul minim al gazului, versiunea sign-bytes, comutatoarele de funcționalități ale protocolului, precompilările EVM active |
| `block [height]` | `get_block` | un bloc, implicit ultimul |
| `tx get <hash>` | `get_transaction` | o tranzacție după hash nativ sau EVM: stare, taxă, mesaje, semnatari, nivelul semnăturii |
| `account <address>` | `get_address_info` | solduri, starea contului, suma pusă în staking, ambele forme de adresă |
| `pq status <address\|txhash>` | `get_pq_status` | starea cheii ML-DSA-87 pentru o adresă sau verificarea stratului hibrid pentru o tranzacție |
| `validators [--status S] [--limit N]` | `get_validators` | validatori după stake; statusul este `bonded` (implicit), `unbonding`, `unbonded` sau `all`; limită până la 200 |
| `staking-tiers [--holder A]` | `get_staking_tiers` | parametrii și fondul nivelurilor de staking, plus blocările unui deținător (lanțul v3.2.4 și mai nou) |
| `search <query>` | `search` | detectează o înălțime, un hash, o adresă sau un validator și îl citește |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | doar un `eth_call` EVM, cu codificare și decodare opționale |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | gaz, variații de sold și un refuz decodat pentru o tranzacție codificată |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | limită de gaz sugerată și taxă, incluzând stratul ML-DSA-87 |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | un transfer nesemnat pe care portofelul tău îl semnează |

Opțiuni globale: `--network testnet|mainnet` (implicit `testnet`), `--json`, `--timeout <ms>` (timeout în amonte, implicit 10000), `--help` și `--version`. Schemele uneltelor sunt în [referința uneltelor MCP](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md).

### Ce a fost rulat {#what-was-run}

Pe 27 octombrie 2026 `@qorechain/qore-cli` 0.1.0 și `@qorechain/mcp` 0.1.0 au fost instalate din npm într-un proiect gol și aceste comenzi doar în citire au fost rulate pe endpoint-urile publice:

- `qore --version` a afișat `0.1.0`, iar `qore --help` a listat comenzile de mai sus.
- `qore chain` (testnet) a afișat lanțul `qorechain-diana`, EVM chain ID 9800, prețul minim al gazului 0.1 și sign-bytes `v2`; `qore chain --network mainnet` a afișat lanțul `qorechain-vladi`, EVM chain ID 9801 și sign-bytes `v2`.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` și `qore read-contract --to 0x...0a02 --function "x()"` au returnat datele lor.
- `qore pq status F642F59F...2152` a afișat nivelul `pqc`, `has_exactly_one_pqc_layer: true` și `verified: true` cu sign-bytes `v2`.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` a scris un transfer nesemnat (limită de gaz 171698, taxă 17170 uqor), `qore simulate` pe acel fișier a returnat `ok: true`, iar `qore estimate-fee` a returnat o taxă identică. Expeditorul și destinatarul erau aceeași adresă, așa că unealta a adăugat un avertisment, iar nimic nu a fost semnat sau trimis.
- `qore tx get zzz` a afișat `error [INVALID_INPUT]` și a ieșit cu 1; `qore bogus` a ieșit cu 2.

## Cum se accesează {#how-to-access}

- **Rețele.** Testnet `qorechain-diana` (implicit) și mainnet `qorechain-vladi` cu `--network mainnet`.
- **Endpoint-uri.** CLI-ul citește endpoint-urile publice REST, RPC și EVM JSON-RPC: `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` și `https://evm-testnet.qore.host` pe testnet, iar `https://api.qore.host`, `https://rpc.qore.host` și `https://evm.qore.host` pe mainnet.
- **Cont și chei.** Niciunul. Nu există autentificare, cheie API sau fișier de configurare; cheia endpoint-ului MCP găzduit nu se aplică CLI-ului.
- **Cerințe.** Node.js 20 sau mai nou și HTTPS de ieșire.
- **Cost.** Gratuit. Ca să trimiți transferul pe care l-ai pregătit, plătești taxa de rețea (prag minim 0.1 uqor per gaz) din propriul portofel; CLI-ul nu face acel pas.

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Instalare | Note |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 sau mai nou |

Sursa: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), folderul `packages/cli` (public, Apache-2.0, verificat pe 27 octombrie 2026). Nu există o variantă Python sau Rust a CLI-ului; serverul în sine este disponibil și pe PyPI ca [`qorechain-mcp`](/developer-tools/mcp#where-published).

## Limite și probleme cunoscute {#limits}

- **Doar citire.** Nicio comandă nu semnează și nu transmite în rețea. `prepare-transfer` construiește doar un `MsgSend` de uqor pe traseul native; nu pregătește tranzacții EVM, SVM, de staking, de guvernanță sau de contract. `simulate` și `estimate-fee` acceptă orice tranzacție codificată de pe traseul native.
- **Fără faucet și fără listare a deținătorilor de token.** Aceste două unelte MCP nu au comandă CLI. QOR de testnet vine de la [Faucet](/dashboard/faucet).
- **Istoricul testnet-ului este tăiat.** Un bloc sau o tranzacție veche de testnet returnează `NOT_FOUND` împreună cu cea mai mică înălțime disponibilă; mainnet-ul a servit de la înălțimea 1 la verificare.
- **Valorile gazului diferă în funcție de rețea.** Simularea pe testnet include deja costul de verificare ML-DSA-87; simularea pe mainnet nu îl include, așa că limita de gaz sugerată poartă o marjă.
- **Limite de ieșire.** Cel mult 100 de hash-uri de tranzacții pe bloc, 50 de mesaje pe tranzacție, 100 de solduri pe cont, 200 de validatori pe apel. Fiecare cerere are un timeout implicit de 10 secunde, o limită de răspuns de 4 MiB și nicio reîncercare.
- **Secretele sunt refuzate.** O intrare care arată ca o frază de recuperare sau ca o cheie privată brută este respinsă cu `INVALID_INPUT`. Nu pune una într-o linie de comandă: istoricul shell-ului o păstrează.
- **Precompilările EVM post-cuantice** `0x...0A01` și `0x...0A02` sunt active doar pe testnet.
- **Prima versiune.** 0.1.0: numele comenzilor și opțiunile se pot schimba în versiunile următoare. Folosește `--json` și codurile de ieșire pentru scripturi și fixează versiunea.

Pagini conexe: [Serverul MCP QoreChain](/developer-tools/mcp), [Prezentarea pachetelor pentru dezvoltatori](/developer-tools/overview), [Referința CLI a SDK-ului](/sdk/reference/cli), [Faucet](/dashboard/faucet).
