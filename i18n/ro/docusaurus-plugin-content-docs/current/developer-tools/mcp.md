---
slug: /developer-tools/mcp
title: Serverul MCP QoreChain
sidebar_label: Server MCP
sidebar_position: 23
---

# Serverul MCP QoreChain (`@qorechain/mcp`)

Serverul MCP QoreChain oferă agenților AI și uneltelor pentru dezvoltatori acces de citire la QoreChain prin [Model Context Protocol](https://modelcontextprotocol.io): blocuri, tranzacții, conturi, validatori, niveluri de staking, starea semnăturii hibride secp256k1 plus ML-DSA-87 (FIPS 204), citiri de contracte EVM, simulare și estimări de taxă, precum și transferuri nesemnate pe care proprietarul contului le semnează în propriul portofel. Este pentru dezvoltatorii care conectează la QoreChain un client sau un agent compatibil MCP și pentru echipele care vor o vedere asupra lanțului scriptabilă, doar în citire, cu un format de ieșire stabil.

Serverul nu semnează niciodată, nu ține chei și nu transmite nicio tranzacție în rețea. Rulează pe mașina ta prin stdio sau ca server Streamable HTTP, găzduit de tine sau de QoreChain. Versiunea **0.1.0**, publicată pe 27 octombrie 2026, Apache-2.0. Un geamăn în linie de comandă, [`qore`](/developer-tools/qore-cli), rulează aceleași unelte dintr-un terminal.

## Inovații {#innovations}

- **Verificare a semnăturii hibride, nu doar o etichetă.** `get_pq_status` primește un hash de tranzacție, confirmă că body-ul conține exact un strat `/qorechain.pqc.v1.PQCHybridSignature` și verifică local acel strat ML-DSA-87 cu [QoreSign](/qoresign/overview), față de cheia pe care semnatarul a înregistrat-o pe lanț, încercând sign-bytes v1 și v2. Răspunsul este `verified: true` sau `false` cu motivul, nu o presupunere făcută după tipul tranzacției.
- **Transferuri nesemnate care poartă taxa reală.** `prepare_transfer` citește numărul de cont, secvența și cheia publică ale expeditorului, simulează transferul cu un strat ML-DSA-87 provizoriu de mărimea corectă, astfel încât gazul include stratul pe care portofelul îl adaugă la semnare, și returnează SignDoc-ul, un rezumat lizibil și verificări. Singurul lucru care lipsește este semnătura proprietarului.
- **Simulare cu refuzuri decodate.** `simulate_tx` și `estimate_fee` returnează gazul folosit, o limită de gaz sugerată, variația soldului pe adresă și, atunci când rețeaua ar respinge tranzacția, un refuz decodat în loc de un șir de eroare brut.
- **O singură schemă pentru server și pentru CLI.** Fiecare comandă `qore` rulează o unealtă MCP, iar `qore --json` afișează exact JSON-ul pe care îl returnează unealta. Pachetul Python expune aceleași nume de unelte, aceleași scheme de intrare și ieșire și aceleași coduri de eroare; ambele sunt testate pe aceleași răspunsuri înregistrate ale lanțului.
- **Secretele sunt refuzate înainte ca ceva să iasă de pe mașină.** O intrare care arată ca o frază de recuperare (12 sau mai multe cuvinte BIP-39 consecutive) sau ca o cheie privată brută de 32 de octeți este respinsă cu `INVALID_INPUT` înainte de orice cerere, iar eroarea îi spune utilizatorului să considere acel secret expus.
- **Răspunsuri construite câmp cu câmp.** Fiecare ieșire este asamblată din câmpuri denumite ale răspunsului lanțului. Corpurile de eroare din amonte și stack trace-urile nu ajung niciodată la client; eșecurile se mapează pe șapte coduri de eroare stabile.

## Pentru ce se folosește {#use-cases}

1. **Întrebări către un asistent de programare despre starea lanțului.** Un dezvoltator adaugă serverul într-un editor compatibil MCP și întreabă "care este ultimul bloc din mainnet?" sau "arată soldurile adresei qor1... pe testnet". `get_block` și `get_address_info` răspund din endpoint-urile publice, cu linkuri către explorer.
2. **Verificarea faptului că o tranzacție a purtat semnătura hibridă.** Un dezvoltator de portofel sau de SDK tocmai a transmis o tranzacție și vrea să confirme că aceasta conține exact un strat ML-DSA-87 și că stratul se verifică față de cheia înregistrată. `get_pq_status` (sau `qore pq status <hash>`) raportează nivelul semnăturii și rezultatul verificării locale.
3. **Pregătirea unui transfer pe care utilizatorul îl semnează.** Un asistent construit pe QoreChain trebuie să ajute un utilizator să trimită QOR fără să atingă cheile. `prepare_transfer` returnează un SignDoc nesemnat, cu un rezumat lizibil, verificări și avertismente (inclusiv unul pentru mainnet), iar `estimate_fee` oferă taxa. Utilizatorul semnează în propriul portofel.
4. **Depanarea unei tranzacții refuzate.** O echipă de backend are o tranzacție codificată pe care rețeaua o respinge. `simulate_tx` returnează gazul, variațiile de sold pe adresă și un refuz decodat, și nu transmite nimic în rețea.
5. **Citirea contractelor dintr-un script sau dintr-un job de CI.** O echipă de dApp verifică un sold de token sau o vizualizare de contract cu `qore read-contract --to 0x... --function "balanceOf(address)" --arg 0x... --returns uint256 --json` și parsează JSON-ul cu `jq`.
6. **Tablouri de bord pentru validatori și staking.** Un analist listează validatorii bonded cu ponderea lor în puterea de vot și cu comisionul (`get_validators`) și citește parametrii nivelurilor de staking și blocările unui deținător (`get_staking_tiers`).
7. **Rularea unui endpoint pentru echipă.** O companie rulează `qorechain-mcp serve` în spatele propriului reverse proxy, cu chei API și limite de rată, astfel încât mai multe unelte interne să folosească același endpoint MCP, care indică propriile noduri.

## Cum funcționează {#how-it-works}

* Serverul este un cititor subțire și fără stare peste endpoint-urile publice QoreChain (REST, RPC de consens și EVM JSON-RPC). Fiecare apel în amonte este o singură cerere, cu un timeout de 10 secunde, o limită de răspuns de 4 MiB și fără reîncercări.
* Răspunsurile sunt construite câmp cu câmp din răspunsul lanțului. Corpurile de eroare din amonte, stack trace-urile și mesajele bibliotecilor nu ajung niciodată la client; un eșec neașteptat devine `INTERNAL_ERROR`. Erorile revin ca rezultat de unealtă cu `isError: true` și un corp JSON.
* Verificările semnăturii hibride rulează local cu [QoreSign](/qoresign/overview): serverul preia tranzacția și cheia ML-DSA-87 înregistrată a semnatarului, reconstruiește sign-bytes (v1 sau v2) și verifică.
* Simulare: pe un lanț la v3.2.5 sau mai nou, simularea include deja costul de verificare ML-DSA-87 (`exact_gas_simulation: true` în `get_chain_info`), deci limita de gaz sugerată este exactă; pe un lanț mai vechi se adaugă o marjă. Când un body nu are strat ML-DSA-87, `simulate_tx` adaugă un strat provizoriu de mărimea corectă (niciodată transmis în rețea), astfel încât gazul să corespundă tranzacției pe care o va semna portofelul (`assume_pqc_layer`, implicit true). Serverul detectează singur versiunea lanțului.
* Precompilările EVM `0x...0A01` (verificare ML-DSA-87) și `0x...0A02` (starea cheii) sunt active doar pe testnet; pe mainnet un apel către ele returnează date goale.
* Schemele uneltelor, în format citibil de mașini, se află în depozit ca `spec/tools.json`, generat din propriul răspuns `tools/list` al serverului. Referința destinată oamenilor este `docs/tools.md`.

## Cum se utilizează {#how-to-use}

Ai nevoie de Node.js 20 sau mai nou pentru pachetul npm, ori de Python 3.10 sau mai nou pentru pachetul Python.

### Rulează local cu npx {#run-npx}

Verifică dacă serverul pornește, apoi adaugă-l în clientul tău MCP. Majoritatea clienților care pornesc servere locale citesc un fișier JSON cu un obiect `mcpServers` (numele fișierului și numele cheilor pentru serverele HTTP diferă de la un client la altul; vezi documentația clientului tău):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

Repornește clientul. Acesta listează 14 unelte. Serverul vorbește stdio cu clientul. Apoi întreabă, de exemplu:

- "Care este ultimul bloc din mainnet-ul QoreChain?" (`get_block`)
- "Tranzacția de testnet F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 are un strat ML-DSA-87 valid?" (`get_pq_status`)
- "Pregătește un transfer de 1.5 QOR pe testnet de la adresa mea către qor1... și estimează taxa." (`prepare_transfer`, `estimate_fee`)

### Rulează local cu pip sau uvx {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Pachetul Python expune doar stdio. Pentru Streamable HTTP, chei API și limite de rată folosește pachetul npm (mai jos). Pachetul are și un punct de intrare ca bibliotecă, `run_tool`.

### Rulează-l ca server HTTP {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

Transportul HTTP este fără stare și răspunde cu JSON: `POST /mcp` pentru cererile MCP, `GET /healthz` pentru `{"status":"ok"}`. Opțiuni:

| Opțiune | Implicit | Semnificație |
|---|---|---|
| `--port` | 8787 | port TCP |
| `--host` | 127.0.0.1 | adresa de ascultare; `0.0.0.0` ascultă pe toate interfețele |
| `--api-keys-file` | niciunul | fișier cu hash-uri SHA-256 ale cheilor acceptate; când este setat, cererile au nevoie de `Authorization: Bearer <key>` |
| `--rate-limit` | 60 | cereri pe minut pe cheie API și pe IP de client; `0` îl dezactivează |
| `--allowed-origin` | niciunul | origine de browser care are voie să apeleze endpoint-ul (repetabil); celelalte origini primesc HTTP 403 |
| `--trust-proxy` | dezactivat | ia IP-ul clientului din `X-Forwarded-For`; doar în spatele unui proxy controlat de tine |
| `--network` | testnet | rețeaua pentru apelurile care nu numesc niciuna |

Ca să-ți protejezi propriul endpoint, generează o cheie, stochează doar hash-ul ei și dă cheia clientului:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` are un hash de 64 de caractere hex pe linie (un prefix opțional `sha256:` este acceptat, `#` începe un comentariu). O cheie lipsă sau necunoscută primește HTTP 401 cu un mesaj de eroare care începe cu `UNAUTHORIZED`; peste limita de rată serverul răspunde HTTP 429 cu `Retry-After`. Pune TLS în fața oricărui server care este accesibil din afara mașinii tale.

Pachetul exportă și `createServer`, `createHttpHandler` și `startNodeServer` pentru integrare în propriul tău runtime. Detalii complete: [auto-găzduire](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) în depozitul sursă.

### Configurare {#configuration}

| Setare | Cum | Efect |
|---|---|---|
| Rețea per apel | argumentul `network` al oricărei unelte: `testnet` sau `mainnet` | Alege lanțul pentru acel apel |
| Rețea implicită | `--network testnet` sau `--network mainnet` în comanda serverului | Rețeaua folosită când un apel nu numește niciuna. Implicit `testnet` |
| Port, host, chei, limite HTTP | opțiunile `serve` de mai sus | Doar în modul HTTP |
| Timeout în amonte | fix 10 secunde pe cerere, limită de răspuns 4 MiB, fără reîncercări | Endpoint-urile lente dau `UPSTREAM_UNAVAILABLE` |

Mainnet este `qorechain-vladi` (EVM chain ID 9801), iar testnet este `qorechain-diana` (EVM chain ID 9800). Un transfer pregătit pentru mainnet poartă un avertisment suplimentar. Nu există variabile de mediu pentru rețea: este fie flag-ul din linia de comandă, fie argumentul per apel. Ca să faci mainnet implicit pentru un client:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Unelte {#tools}

Toate cele 14 unelte sunt doar în citire și primesc un `network` opțional. Intrările și ieșirile lor sunt generate din schemele proprii ale serverului; [referința uneltelor](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) listează fiecare câmp.

| Unealtă | Ce returnează |
|---|---|
| `get_chain_info` | ID-urile lanțului, ultimul bloc, prețul minim al gazului, versiunea sign-bytes, comutatoarele de funcționalități ale protocolului, un upgrade în așteptare dacă este programat unul, precompilările EVM active |
| `get_block` | un bloc (sau ultimul): hash, timp, propunător, numărul de tranzacții și până la 100 de hash-uri de tranzacții |
| `get_transaction` | o tranzacție după hash nativ sau hash EVM (prefix `0x`): stare, taxă, memo, gaz, până la 50 de mesaje, semnatari și nivelul semnăturii (`pqc`, `enrollment`, `shake` sau `classical`) |
| `get_address_info` | ambele forme de adresă (`qor1...` și `0x...`), starea contului, până la 100 de solduri, suma pusă în staking, dacă o cheie ML-DSA-87 este înregistrată, dacă este implementat bytecode |
| `get_pq_status` | pentru o adresă: cheia înregistrată, algoritmul, dovada de posesie, fereastra de autorizare EVM. Pentru o tranzacție: dacă are exact un strat hibrid și dacă se verifică |
| `get_validators` | validatori după stake (implicit bonded, cel mult 50, limită până la 200): stare, indicator jailed, stake, ponderea în puterea de vot, comision |
| `get_staking_tiers` | modulul nivelurilor de staking: termenele de blocare și bonusurile, penalitatea de deblocare anticipată, fondul de bonus și, opțional, blocările unui deținător. Lanțul v3.2.4 și mai nou |
| `search` | detectează dintr-un singur șir o înălțime de bloc, un hash de tranzacție, o adresă sau un validator, îl citește și numește unealta care returnează aceleași date |
| `read_contract` | doar un `eth_call` EVM, cu codificare ABI opțională a unei semnături de funcție și decodarea rezultatului |
| `estimate_fee` | gaz simulat, limită de gaz sugerată și taxă (limita de gaz înmulțită cu prețul minim al gazului), incluzând stratul ML-DSA-87 |
| `simulate_tx` | gaz folosit, limită de gaz sugerată, variația soldului pe adresă și un refuz decodat pentru o tranzacție codificată |
| `prepare_transfer` | un `MsgSend` nesemnat de uqor: SignDoc, rezumat lizibil, verificări și avertismente |
| `get_token_holders` | întotdeauna `NOT_AVAILABLE_ON_CHAIN`: listarea deținătorilor necesită un indexer pe care endpoint-urile publice nu îl oferă |
| `request_faucet` | întotdeauna `NOT_AVAILABLE_ON_CHAIN`: QOR de testnet vine de la [Faucet](/dashboard/faucet) din dashboard |

Erorile sunt rezultate de unealtă cu `isError: true` și un corp JSON `{"error": {"code", "message", "details?"}}`. Codurile sunt `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` și `INTERNAL_ERROR`.

### Folosește-l ca bibliotecă {#library}

Pachetul npm exportă `createServer({ defaultNetwork })` (o instanță de server MCP pentru orice transport MCP), `createHttpHandler({ apiKeyHashes, rateLimitPerMinute })` (un handler Fetch API, `(Request) => Promise<Response>`) și `startNodeServer(...)` (serverul HTTP Node pe care îl folosește `serve`). Opțiunile comune sunt `defaultNetwork`, `endpoints` (indică o rețea spre propriile noduri), `upstream` (`timeoutMs`, `maxResponseBytes`, `fetch`) și `onToolCall` (primește numele uneltei, starea și latența).

Pachetul Python poate fi folosit în același fel prin `run_tool`:

```python
import anyio
from qorechain_mcp import Context, run_tool

async def main():
    out = await run_tool("get_chain_info", {"network": "mainnet"}, Context())
    print(out["latest_block"])

anyio.run(main)
```

### Testează endpoint-ul găzduit dintr-un terminal {#test-hosted}

```bash
curl -s -X POST https://mcp.qorechain.io/mcp \
  -H "Authorization: Bearer $QORECHAIN_MCP_KEY" \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Fără o cheie validă, endpoint-ul răspunde HTTP 401 cu o eroare JSON-RPC al cărei mesaj începe cu `UNAUTHORIZED`.

### Depanare {#troubleshooting}

* `UPSTREAM_UNAVAILABLE`: endpoint-ul public nu a răspuns în 10 secunde. Încearcă din nou.
* `NOT_FOUND` pe un bloc vechi de testnet: nodurile de testnet taie istoricul, iar eroarea numește cea mai mică înălțime disponibilă. `get_chain_info` raportează `earliest_available_height`.
* Nicio unealtă listată în client: rulează `npx -y @qorechain/mcp --help` într-un terminal ca să verifici că Node și npm funcționează, apoi citește jurnalul MCP al clientului.
* `UNAUTHORIZED` pe endpoint-ul găzduit: cheia lipsește, este greșită, revocată sau încă nu este activă (o cheie nouă poate dura un minut sau două).

### Ce a fost rulat {#what-was-run}

Pe 27 octombrie 2026 pachetele publicate au fost instalate din registre și rulate pe endpoint-urile publice de testnet și mainnet:

- `qorechain-mcp --version` a afișat `0.1.0`; prin stdio, `initialize` a returnat numele serverului `qorechain-mcp`, iar `tools/list` a returnat cele 14 nume de unelte de mai sus; `pip install qorechain-mcp==0.1.0` s-a instalat, iar `--version` a afișat `0.1.0`.
- `qorechain-mcp serve --port 18787` a răspuns la `GET /healthz` cu `{"status":"ok"}` și la un `tools/call` pentru `get_chain_info` prin `POST /mcp`.
- `get_chain_info` a returnat lanțul `qorechain-diana`, EVM chain ID 9800, prețul minim al gazului 0.1 uqor și sign-bytes `v2` pe testnet, și lanțul `qorechain-vladi`, EVM chain ID 9801 și sign-bytes `v2` pe mainnet.
- `get_pq_status` pe tranzacția de testnet de mai sus a returnat nivelul `pqc`, exact un strat hibrid și `verified: true` cu sign-bytes `v2`.
- `prepare_transfer` pentru 1.5 QOR pe testnet a returnat un SignDoc cu limita de gaz 171698 și taxa 17170 uqor (0.01717 QOR), iar `simulate_tx` pe tranzacția sa nesemnată a returnat `ok: true`, cu taxa debitată din contul expeditorului. Nimic nu a fost semnat sau trimis.

## Cum se accesează {#how-to-access}

- **Local (opțiunea principală).** stdio prin `npx -y @qorechain/mcp` sau `uvx qorechain-mcp`. Nu are nevoie de cont și nici de cheie API. Citește endpoint-urile publice QoreChain, deci are nevoie de HTTPS de ieșire.
- **Propriul tău server HTTP.** `qorechain-mcp serve`, ca mai sus, cu chei API și limite de rată pe care le configurezi tu.
- **Endpoint găzduit.** `https://mcp.qorechain.io/mcp` expune transportul Streamable HTTP. Folosește testnet, cu excepția cazului în care un apel numește `"network": "mainnet"`. Fiecare cerere are nevoie de o cheie API trimisă ca `Authorization: Bearer <key>`; solicită una din dashboard-ul tău (mai jos). Fără cheie, endpoint-ul răspunde HTTP 401 (`UNAUTHORIZED`), acesta fiind răspunsul din 27 octombrie 2026. Există o singură cheie activă pe cont, iar fiecare cheie este limitată la 10 cereri pe secundă (rafală de 20) și 100.000 de cereri pe zi. Pentru majoritatea utilizărilor, configurarea locală nu are nevoie de cheie și este alegerea mai simplă.

  Pentru a obține o cheie, autentifică-te la [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), deschide tab-ul **AI agents (MCP)** și completează formularul **API key** (nume sau organizație, un contact, utilizarea intenționată, volumul estimat), apoi apasă **Request API key**. Echipa QoreChain aprobă sau respinge cererea; o respingere afișează nota sa și poți face o nouă cerere. După aprobare apasă **Generate key**: cheia este afișată o singură dată, cu un buton de copiere și un fragment de configurare gata de folosit, și devine activă în decurs de un minut sau două. QoreChain păstrează doar o amprentă (un hash), așa că o cheie pierdută nu mai poate fi afișată din nou; revoc-o (intră în vigoare în aproximativ un minut) și solicită una nouă. Vezi [Pagina Developers](/dashboard/developers#mcp).

Configurare de client HTTP pentru un server care are nevoie de cheie (numele exacte ale cheilor variază de la un client la altul):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Nu pune niciodată o frază de recuperare sau o cheie privată într-o configurare de client: nicio unealtă QoreChain nu are nevoie de ele.

Serverul citește din aceste endpoint-uri publice:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consens | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Cost: serverul este gratuit. Citirile nu costă nimic. Dacă transmiți în rețea o tranzacție construită de `prepare_transfer`, se aplică taxa de rețea (pragul minim al taxei este 0.1 uqor per gaz).

## Note de securitate {#security}

* **Nu există nicio cale de cod pentru semnare** în server sau în CLI. Nimic nu este semnat, nicio cheie nu este stocată și nimic nu este transmis în rețea.
* **Secretele sunt refuzate.** O intrare care arată ca o frază de recuperare (12 sau mai multe cuvinte BIP-39 consecutive) sau ca o cheie privată hex brută de 32 de octeți este respinsă cu `INVALID_INPUT` înainte de orice cerere, iar eroarea îi spune utilizatorului să considere acel secret expus. Nu pune niciodată o frază de recuperare sau o cheie privată într-o configurare de client; nicio unealtă QoreChain nu are nevoie de ele.
* **Textul erorilor din amonte nu este niciodată redirecționat**; răspunsurile sunt construite câmp cu câmp.
* **Jurnale.** Jurnalele HTTP conțin metoda JSON-RPC, numele uneltei, starea și latența. Intrările, ieșirile, cheile și adresele clienților nu sunt înregistrate.
* **Cheile API** ale unui server auto-găzduit sunt stocate ca hash-uri SHA-256, niciodată în text clar. CORS este închis implicit, ceea ce protejează și un server legat la localhost împotriva DNS rebinding.
* **Mainnet-ul trebuie numit explicit**, iar `prepare_transfer` adaugă un avertisment pentru transferurile pe mainnet.
* **Memo-urile sunt publice și permanente.** Nu pune niciodată un secret într-un memo.
* **Tratează o cheie API găzduită ca pe o parolă.** Păstreaz-o într-o variabilă de mediu sau într-un depozit de secrete și revoc-o din dashboard dacă se scurge.
* Raportează vulnerabilitățile în privat la security@qore.network, niciodată într-un issue public.

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Rulare | Note |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio și Streamable HTTP. Node.js 20 sau mai nou |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` sau `uvx qorechain-mcp` | Doar stdio. Python 3.10 sau mai nou |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Comanda `qore`. Vezi [CLI-ul QoreChain](/developer-tools/qore-cli) |

Sursa: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (public, Apache-2.0, verificat pe 27 octombrie 2026). Depozitul conține serverul, CLI-ul, pachetul Python, referința uneltelor, note de auto-găzduire, configurări exemplu de client și trei fișiere de skill pentru agenți. Nu are o imagine de container publicată; folosește `npx` sau `pip`.

## Limite și probleme cunoscute {#limits}

- **Doar citire.** Nu există nicio cale de cod pentru semnare, nicio stocare de chei și nicio transmitere în rețea. `prepare_transfer` returnează un document nesemnat. Ca să finalizezi un transfer, semnează-l cu [QoreSign](/qoresign/overview) sau cu portofelul QoreX și transmite-l tu; apoi citește rezultatul cu `get_transaction`. `read_contract` folosește doar `eth_call` și nu poate modifica starea.
- **Se pregătește un singur tip de tranzacție.** `prepare_transfer` construiește un `MsgSend` de uqor pe traseul native. Nu construiește tranzacții EVM, SVM, de staking, de guvernanță sau de contract. `estimate_fee` și `simulate_tx` acceptă orice tranzacție codificată de pe traseul native.
- **Valorile gazului urmează versiunea lanțului, nu rețeaua.** Ambele rețele au aplicat v3.2.5 (mainnet pe 29 octombrie 2026), deci simularea include costul de verificare ML-DSA-87, iar gazul este exact (`exact_gas_simulation` este true pe ambele). Față de un nod mai vechi decât v3.2.5, limita de gaz sugerată poartă o marjă.
- **Istoricul testnet-ului este tăiat.** Un bloc vechi de testnet returnează `NOT_FOUND`, iar eroarea numește cea mai mică înălțime disponibilă (8,790,799 pe testnet la verificare; mainnet-ul a servit de la înălțimea 1). `get_pq_status` verifică un strat față de cheia înregistrată acum, deci după o rotire a cheii tranzacțiile mai vechi nu se mai potrivesc.
- **Precompilările EVM post-cuantice.** `0x...0A01` (verificare ML-DSA-87) și `0x...0A02` (starea cheii) sunt active doar pe testnet; pe mainnet un apel către ele returnează date goale.
- **Limite.** Fiecare cerere în amonte are un timeout de 10 secunde și o limită de răspuns de 4 MiB, fără reîncercări. Blocurile listează cel mult 100 de hash-uri de tranzacții, tranzacțiile cel mult 50 de mesaje, conturile cel mult 100 de solduri. Corpurile cererilor HTTP sunt limitate la 512 KiB. Un memo are cel mult 256 de caractere și este public și permanent, așa că nu pune niciodată un secret în el. Limita de rată a unui server auto-găzduit este pe instanță și ținută în memorie; în spatele unui load balancer, fiecare instanță numără separat.
- **Indisponibile:** `get_token_holders` (fără indexer pe endpoint-urile publice) și `request_faucet` (folosește faucet-ul din dashboard, care cere autentificare). Endpoint-ul găzduit are nevoie de o cheie API, solicitată din dashboard-ul tău; configurarea locală nu are nevoie de ea.
- **Mainnet-ul este explicit.** Apelurile merg pe testnet, cu excepția cazului în care numesc `"network": "mainnet"` sau serverul a fost pornit cu `--network mainnet`.
- **Nu este publicată nicio imagine de container.** Rulează serverul cu `npx` sau `pip`.
- **Versiune.** 0.1.0 este prima versiune; numele uneltelor și schemele se pot schimba în versiunile următoare, iar fișierul generat `spec/tools.json` din depozit este referința pentru versiunea pe care ai instalat-o.

## Pagini conexe {#related}

* [CLI-ul QoreChain](/developer-tools/qore-cli): aceleași unelte dintr-un terminal.
* [QoreSign](/qoresign/overview): verificatorul hibrid folosit de `get_pq_status`.
* [SDK-ul QoreChain](/sdk/overview): construiește și semnează tranzacțiile pe care acest server le citește și le simulează.
* [Integrări QoreX](/developer-tools/qorex-integrations): portofelul care semnează ce pregătește `prepare_transfer`.
* [Custody kit](/developer-tools/custody-kit): detectarea depunerilor și verificarea retragerilor pentru custozi.
* [Faucet](/dashboard/faucet) și [Pagina Developers din dashboard](/dashboard/developers#mcp): QOR de testnet și chei API MCP.
* [Prezentarea pachetelor pentru dezvoltatori](/developer-tools/overview).
