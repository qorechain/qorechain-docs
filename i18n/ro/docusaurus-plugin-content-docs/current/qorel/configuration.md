---
slug: /qorel/configuration
title: Configurarea QORel
sidebar_label: Configurare
sidebar_position: 5
---

# Configurare

QORel citește un singur fișier TOML (implicit `~/.hermes/config.toml`, sau calea dată cu `--config`). Pentru orice lanț care semnează în modul standard, fișierul este exact configurația Hermes; [ghidul Hermes](https://hermes.informal.systems) descrie fiecare setare. Această pagină acoperă ce adaugă QORel: intrarea pentru lanțul QoreChain, cheile post-cuantice, setările de gas și verificările care rulează înainte de trimiterea unei tranzacții. Este destinată operatorilor care scriu sau revizuiesc o configurație QORel.

## Inovații {#innovations}

- **`signing` per lanț.** `'qorechain-hybrid'` adaugă semnătura ML-DSA-87 la fiecare tranzacție pe care QORel o trimite către acel lanț; `'standard'` (implicit) este identic octet cu octet cu Hermes. Configurațiile mixte funcționează: un singur proces, câte un lanț din fiecare tip.
- **Versiunea octeților de semnat citită din lanț.** Cu `pqc.sign_bytes = 'auto'`, QORel citește înregistrările de upgrade aplicate ale lanțului, semnează forma corespunzătoare, o recitește în fiecare minut și după orice refuz, și nu inventează niciodată o versiune.
- **Prețul de gas din piața de taxe.** `dynamic_gas_price` cu `backend = 'cosmos-evm-feemarket'` urmărește taxa de bază a QoreChain (minim 0.1 uqor per gas).
- **O configurație care refuză combinațiile nesigure.** `extension_options` statice împreună cu semnarea hibridă sunt refuzate la încărcare, deoarece semnătura post-cuantică trebuie să fie singura opțiune de extensie critică.

## Cum se folosește {#how-to-use}

### Intrarea pentru lanțul QoreChain {#chain-entry}

Aceasta este intrarea de testnet din configurația exemplu. Înlocuiți adresele nodului cu ale propriului dumneavoastră nod de testnet:

```toml
[[chains]]
id = 'qorechain-diana'
type = 'CosmosSdk'
rpc_addr = 'http://YOUR-QORECHAIN-NODE:26657'
grpc_addr = 'http://YOUR-QORECHAIN-NODE:9090'
event_source = { mode = 'push', url = 'ws://YOUR-QORECHAIN-NODE:26657/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'qor'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000

# The QoreChain-specific part:
signing = 'qorechain-hybrid'
gas_price = { price = 0.1, denom = 'uqor' }
gas_multiplier = 1.1
dynamic_gas_price = { enabled = true, multiplier = 1.0, max = 10.0, backend = 'cosmos-evm-feemarket' }
# optional, defaults shown:
# pqc = { sign_bytes = 'auto', sign_mode = 'hedged', include_public_key = false }

clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
# Relay only the channels you operate.
packet_filter = { policy = 'allow', list = [['transfer', 'channel-0']] }
```

Setările specifice QoreChain:

| Setare | Valoare | Ce face |
|---|---|---|
| `signing` | `'qorechain-hybrid'` | Adaugă semnătura ML-DSA-87 (FIPS 204) la fiecare tranzacție trimisă către acest lanț. Omiteți-o, sau folosiți `'standard'`, pentru orice alt lanț. |
| `account_prefix` | `'qor'` | Prefixul de adresă al conturilor QoreChain. |
| `gas_price` | `{ price = 0.1, denom = 'uqor' }` | Taxa minimă este 0.1 uqor per gas. |
| `gas_multiplier` | `1.1` | Înmulțește gas-ul simulat pentru a obține limita de gas. Vezi [Gas](#gas). |
| `dynamic_gas_price.backend` | `'cosmos-evm-feemarket'` | Citește taxa de bază din piața de taxe a lanțului, în loc să folosească doar `gas_price`. |
| `pqc.sign_bytes` | `'auto'` (implicit), `'v1'` sau `'v2'` | `auto` citește versiunea octeților de semnat din lanț; `v1` și `v2` forțează o singură formă. Păstrați `auto`. |
| `pqc.sign_mode` | `'hedged'` (implicit) sau `'deterministic'` | Semnare ML-DSA randomizată sau deterministă. Lanțul le acceptă pe ambele. |
| `pqc.include_public_key` | `false` (implicit) | Dacă se încorporează cheia publică în fiecare extensie de semnătură. Aceasta nu înregistrează cheia; doar `keys register-pqc` o face. |

Endpoint-urile publice ale testnet-ului QoreChain pentru citire sunt listate la [Conectarea la Testnet](/getting-started/connecting-to-testnet). Un relayer are nevoie și de gRPC, care nu este public, deci rulați propriul nod pentru partea QoreChain.

### Orice alt lanț Cosmos SDK {#other-chains}

Scrieți intrarea ca pentru Hermes și lăsați `signing` deoparte. Aceasta este intrarea testnet-ului public Cosmos Hub din configurația exemplu:

```toml
[[chains]]
id = 'provider'
type = 'CosmosSdk'
rpc_addr = 'https://rpc.provider-sentry-01.hub-testnet.polypore.xyz'
grpc_addr = 'https://grpc.provider-sentry-01.hub-testnet.polypore.xyz:443'
event_source = { mode = 'push', url = 'wss://rpc.provider-sentry-01.hub-testnet.polypore.xyz/websocket', batch_delay = '500ms' }
rpc_timeout = '15s'
account_prefix = 'cosmos'
key_name = 'relayer'
key_store_folder = '/var/lib/qorel/keys'
store_prefix = 'ibc'
default_gas = 400000
max_gas = 6000000
gas_price = { price = 0.005, denom = 'uatom' }
gas_multiplier = 1.3
dynamic_gas_price = { enabled = true, multiplier = 1.1, max = 0.1, backend = 'skip-feemarket' }
clock_drift = '5s'
trust_threshold = '2/3'
memo_prefix = 'relayed by QORel'
packet_filter = { policy = 'allow', list = [['transfer', 'channel-600']] }
```

Aceste endpoint-uri aparțin unui terț, sunt publice și pot limita rata cererilor. Folosiți propriile noduri pentru un relay constant.

### Setări globale {#global}

Configurația exemplu folosește următoarele, care sunt setări Hermes:

```toml
[global]
log_level = 'info'

[mode.clients]
enabled = true
refresh = true
misbehaviour = true

[mode.connections]
enabled = false

[mode.channels]
enabled = false

[mode.packets]
enabled = true
clear_interval = 50
clear_on_start = true
tx_confirmation = true

[rest]
enabled = false
host = '127.0.0.1'
port = 3000

[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

`mode.clients` păstrează clienții light actualizați și urmărește comportamentele necorespunzătoare (misbehaviour); `mode.packets` transmite pachetele și le golește pe cele în așteptare la fiecare `clear_interval` blocuri și la pornire. Handshake-urile de conexiune și de canal sunt lăsate în seama comenzilor `create`. Portul de telemetrie este descris la [Monitorizare](/qorel/monitoring).

### Chei {#keys}

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana
```

- `keys add` (sau `--key-file` cu un fișier de chei care conține mnemonicul) stochează cheia secp256k1 ca Hermes și, pe un lanț hibrid, derivă cheia ML-DSA-87 din același mnemonic și cont, cu derivarea de portofel QoreChain. Doar seed-ul ei de 32 de octeți este stocat, lângă cheie, ca `<key name>.pqc`. Nu se afișează nimic secret. Vezi [Derivarea cheilor](/qoresign/guides/key-derivation) pentru derivare.
- `keys register-pqc` trimite `MsgRegisterPQCKeyV2` o singură dată. Este singura tranzacție pe care QoreChain o acceptă doar cu semnătura clasică și poartă o dovadă de posesie pe rețelele de la v3.2.3 încolo. Este idempotentă și refuză să trimită când contul are deja o cheie diferită. Vezi [Semnarea post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration) pentru ce verifică lanțul.
- `keys pqc-status` arată dacă cheia este înregistrată, se potrivește cu cheia locală, a fost dovedită printr-o dovadă de posesie și ce octeți de semnat verifică lanțul. `ready_to_relay` trebuie să fie `true`.
- Folosiți un cont de relayer dedicat, cu un sold mic, niciodată cheia operatorului unui validator.
- Fișierele de chei (`<key name>.json` și `<key name>.pqc`) sunt scrise cu drept de citire doar pentru proprietar (0600). Hermes din amonte folosea umask-ul implicit; cheile adăugate cu un Hermes mai vechi își păstrează modul vechi, deci verificați-le cu `ls -l`.

### Gas {#gas}

QoreChain percepe întreaga taxă (limita de gas înmulțită cu prețul) fără rambursare, deci păstrați multiplicatorul strâns.

- Pe lanțul v3.2.5 și mai nou (măsurătoarea de mai jos a fost făcută pe testnet la v3.2.6; mainnet-ul a aplicat v3.2.5 pe 29 octombrie 2026, dar QORel nu a transmis acolo), simularea corespunde livrării cu o diferență de câteva sute de unități de gas. Testul end-to-end local pe un build al acestei linii trece cu `1.05` (fiecare tranzacție de relay a folosit 95% din limita ei).
- Build-urile anterioare raportează cu aproximativ 8 până la 10% mai puțin (măsurat pe un devnet de pre-lansare, unde `1.15` a lăsat o marjă de 4 până la 7%). Folosiți `1.15` până când vă măsurați propriile noduri.
- `health-check` raportează orice multiplicator sub `1.1` pe o intrare QoreChain ca o posibilă configurare greșită. Este un avertisment și relay-ul funcționează în continuare. `1.1`, valoarea din configurația exemplu, îl menține curat pentru o taxă cu aproximativ 5% mai mare decât `1.05`.
- Tranzacția unică `keys register-pqc` folosește cel puțin `1.1`, indiferent ce spune configurația.
- Fiecare semnătură hibridă adaugă aproximativ 4.7 KB tranzacției și 2,000 de unități de gas pentru verificare; simularea le include pe amândouă.

### Verificări de siguranță înainte de fiecare trimitere {#safety-checks}

Înainte de fiecare tranzacție către un lanț hibrid, QORel verifică dacă cheia post-cuantică este încărcată, înregistrată în lanț și identică cu cea locală, și dacă versiunea octeților de semnat este cunoscută. Dacă oricare verificare eșuează, nu trimite nimic (nu se cheltuiește nicio taxă) și `health-check` raportează motivul. Un refuz al lanțului cu codespace `pqc` code 21 face ca QORel să recitească versiunea și înregistrarea înainte de tranzacția următoare.

### Note pentru lanțurile ibc-go v10 {#ibc-go-v10}

- Middleware-ul de taxe ICS-29 nu mai există în ibc-go v10; taxele sunt prețul de gas, un fee granter și taxa de bază dinamică.
- ibc-go v10 nu mai pune header-ul în evenimentele `update_client`. QORel îl citește în schimb din tranzacția `MsgUpdateClient`, astfel încât detectarea comportamentelor necorespunzătoare continuă să funcționeze (Hermes 1.13 standard o dezactivează pe aceste lanțuri).

### Endpoint-uri cu limitare de rată {#rate-limits}

Endpoint-urile publice răspund adesea la rafale cu `429 Too Many Requests`, de exemplu imediat după pornirea relayer-ului. Hermes le tratează ca reîncercabile, dar worker-ii lui de pachete se opresc și după `clear_interval x 5` blocuri fără evenimente IBC noi, chiar dacă ultima rundă de golire a eșuat; un pachet aflat în așteptare în acel moment aștepta până la următorul pachet de pe canal sau până la o repornire. QORel ține activi worker-ii de pachete ai unui canal cât timp o încercare de relay sau de golire a eșuat și reîncearcă la fiecare interval de golire. Aceștia se opresc din inactivitate doar după ce o rundă de golire reușește. Preferați propriile noduri sau un endpoint plătit pentru relay în producție și configurați alerte pentru pachetele în așteptare ([Monitorizare](/qorel/monitoring)).

## Cum se accesează {#how-to-access}

- **Unde se află fișierul.** `~/.hermes/config.toml` pentru o instalare din arhivă tarball sau Homebrew, `/etc/qorel/config.toml` pentru `.deb` și `.rpm`, și directorul montat pentru container. Suprascrieți cu `--config <path>`.
- **Depozitul de chei.** `key_store_folder` stabilește unde sunt păstrate cheile; implicit este `~/.hermes/keys`, iar pachetele folosesc `/var/lib/qorel/keys`.
- **Cerințe prealabile.** Endpoint-uri RPC, gRPC și WebSocket pentru fiecare lanț și un cont de relayer alimentat pe fiecare.
- **Verificarea unei configurații.** `qorel health-check` încarcă fișierul și testează fiecare lanț.

## Unde este publicat {#where-published}

| Ce | Unde |
|---|---|
| Configurație exemplu (testnet, QoreChain și testnet-ul public Cosmos Hub) | `packaging/config.example.toml` în [qorechain/QORel](https://github.com/qorechain/QORel); instalat la `/etc/qorel/config.example.toml` de către pachete |
| Referința de configurare Hermes | [hermes.informal.systems](https://hermes.informal.systems) |

## Limite și probleme cunoscute {#limits}

- **`extension_options` statice sunt refuzate** pe un lanț cu `signing = 'qorechain-hybrid'`.
- **Păstrați `pqc.sign_bytes` pe `auto`.** Un `v1` sau `v2` fix care nu corespunde cu ce verifică lanțul face ca lanțul să refuze fiecare tranzacție.
- **Modul cheilor mai vechi.** Fișierele scrise de un Hermes mai vechi își păstrează permisiunile vechi.
- **Endpoint-uri ale terților.** Endpoint-urile din partea Hub din configurația exemplu nu sunt administrate de QoreChain și se pot schimba sau pot limita rata cererilor.
- **Doar intrarea de testnet.** Intrarea QoreChain de aici este pentru `qorechain-diana`. Mainnet-ul nu este deschis pentru IBC.
