---
slug: /developer-guide/node-operators-v328
title: "Operatori de noduri: lista de verificare v3.2.8"
sidebar_label: Operatori de noduri v3.2.8
sidebar_position: 11
---

# Operatori de noduri: lista de verificare v3.2.8

Versiunea **v3.2.8** rulează pe testnet-ul `qorechain-diana` din 12 noiembrie 2026 (înălțimea 9,929,500). Mainnet-ul `qorechain-vladi` rulează v3.2.7 din 12 noiembrie 2026 (înălțimea 4,164,600, propunerea de guvernanță 16) și nu a aplicat v3.2.8, deci nimic din această pagină nu se aplică azi unui nod de mainnet.

Această pagină este lista scurtă a ceea ce verifică și schimbă un operator de nod pentru v3.2.8: bibliotecile partajate din pachet, setările runtime-ului de contracte, noile valori implicite din `app.toml`, o rută REST nouă și pașii pentru a actualiza un nod aflat încă pe v3.2.7. Pentru ghidul complet al nodului, vedeți [Rularea unui nod](/developer-guide/running-a-node).

**De ce contează.** v3.2.8 rulează contractele inteligente pe o nouă bibliotecă runtime de contracte și taxează memoria și încărcarea de cod pe care le folosește un apel de contract. Un nod care păstrează vechiul folder de biblioteci sau care rulează cu prea puțină memorie pentru contracte nu va porni sau va rămâne în urmă. Restul listei este muncă mică de configurare.

## 1. Copiați tot folderul `lib/` {#lib-folder}

Pachetul de release conține `qorechaind` și un folder `lib/` cu patru biblioteci partajate:

| Bibliotecă | Rol |
| --- | --- |
| `libqorepqc.so` | Verificarea semnăturilor post-cuantice |
| `libqoresvm.so` | Runtime SVM |
| `libwasmvm.x86_64.so` | Biblioteca runtime de contracte din upstream |
| `libwasmvmqore_v1.x86_64.so` | Nouă în v3.2.8: biblioteca runtime de contracte QoreChain |

Copiați **tot folderul**, nu fișiere individuale. O linie `COPY lib/ ...` într-un Dockerfile sau un `cp -r lib/* ...` pe o gazdă bare-metal continuă să funcționeze când o versiune ulterioară adaugă o bibliotecă; o listă de fișiere numite nu.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Indicați loader-ului folderul în care ați copiat (intrarea `LD_LIBRARY_PATH` sau `ld.so.conf.d` pe care o folosiți deja) și reporniți. Comenzile de mai sus sunt un tipar; folosiți căile propriei instalări.

## 2. Cache-ul de memorie pentru contracte: cel puțin 256 MiB {#memory-cache}

Runtime-ul de contracte ține contractele compilate în memorie. În `app.toml`, setarea `memory_cache_size` din secțiunea `[wasm]` trebuie să fie de **256 MiB sau mai mult**:

```toml
[wasm]
memory_cache_size = 256
```

O valoare sub 256 este ridicată la 256 când pornește nodul, iar nodul înregistrează un avertisment. Planificați memoria suplimentară pe mașinile mici.

## 3. Directorul de contracte este acum `<home>/wasm` {#wasm-directory}

Codul compilat al contractelor se află acum în `<home>/wasm`, unde `<home>` este directorul cu care porniți nodul (`--home`). Un nod al cărui cod de contracte este încă în vechea locație îl folosește în continuare și înregistrează un avertisment. Puteți muta folderul când vă este convenabil; opriți mai întâi nodul.

## 4. Noile valori implicite din `app.toml` {#app-toml-defaults}

Un nod inițializat cu v3.2.8 scrie aceste valori implicite. Fișierele `app.toml` existente **nu sunt rescrise**, deci un nod actualizat își păstrează vechile valori până le schimbați.

| Setare | Noua valoare implicită | Ce face |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Limita de gaz pentru tranzacțiile simulate pe acest nod. Portofelele și SDK-urile simulează înainte de trimitere, iar limita mare permite simularea apelurilor de contract mari |
| Spații de nume JSON-RPC `api` | `eth,net,web3` | Spațiul de nume `txpool` nu este servit implicit, deoarece publică tranzacțiile în așteptare ale nodului. Adăugați `txpool` singuri doar dacă aveți nevoie de el |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Limita de gaz pentru interogări {#query-gas-limit}

Interogările de contract rulează sub o limită de gaz locală nodului, pe care o controlează secțiunea `[wasm]` din `app.toml`. Echipa lanțului recomandă setarea ei la `0` (fără limită) pe validatori:

```toml
[wasm]
query_gas_limit = 0
```

Această setare schimbă doar ce răspunde propriul dumneavoastră nod la interogările de contract; nu schimbă ce trebuie să conțină vreun bloc. Este recomandarea echipei lanțului pentru validatori; un nod care servește interogări publice poate prefera o limită finită.

## 6. Rută nouă: `GET /qorechain/svm/v1/params` {#svm-params}

v3.2.8 adaugă o rută numai pentru citire pentru parametrii modulului SVM. Este servită de nodurile pe v3.2.8 (testnet) și răspunde HTTP `501` pe mainnet, unde release-ul nu este aplicat.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Răspunsul de pe testnet din 12 noiembrie 2026:

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Câmp | Semnificație |
| --- | --- |
| `enabled` | Dacă lane-ul de tranzacții SVM este deschis. `false` pe testnet de la upgrade, deci scrierile SVM sunt refuzate până când guvernanța îl deschide din nou |
| `max_program_size`, `max_account_data_size` | Limite de dimensiune în octeți (10,485,760 fiecare) |
| `compute_budget_max` | Cel mai mare buget de calcul pe care îl poate cere o tranzacție (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Date de intrare pentru prețul stocării |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Decalajul numerotării sloturilor, schema de semnătură implicită și limita adâncimii apelurilor între programe |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Limite pentru QOR-ul nativ pe care îl poate deține un cont SVM, în uqor |

Citiți `enabled` înainte de a afișa un buton de trimitere SVM; vedeți [Dezvoltare SVM](/developer-guide/svm-development). Ruta `GET /qorechain/svm/v1/cluster_info` este o rută separată care returnează identitatea clusterului.

## 7. Verificați manifestul {#manifest}

Manifestul este sursa de adevăr pentru ce binar se instalează:

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

Pe 12 noiembrie 2026 a răspuns cu `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` și binarul `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Verificați că `version` este egal cu `minCompatible` înainte de a vă baza pe `binary.url` și verificați arhiva față de `sha256` din același fișier. Manifestul de mainnet este la `https://download.qore.host/mainnet/latest.json` și numește v3.2.6 până când se anunță un upgrade de mainnet.

## 8. Actualizați un nod aflat încă pe v3.2.7 {#upgrade-from-v327}

Înălțimea upgrade-ului de testnet a trecut, deci un nod aflat încă pe v3.2.7 se oprește la înălțimea 9,929,500 cu `UPGRADE "v3.2.8" NEEDED`. Starea lui este păstrată și nu trebuie resincronizat.

1. Descărcați arhiva numită în manifest și verificați SHA-256.
2. Opriți nodul.
3. Înlocuiți `qorechaind` și copiați tot folderul `lib/` ([pasul 1](#lib-folder)).
4. Verificați `[wasm] memory_cache_size` ([pasul 2](#memory-cache)) și decideți asupra `simulation_gas_limit`, a spațiilor de nume JSON-RPC și a `query_gas_limit` ([pașii 4 și 5](#app-toml-defaults)).
5. Porniți nodul și urmăriți jurnalul. Un avertisment despre directorul de contracte sau despre cache-ul de memorie este de așteptat dacă nu le-ați schimbat.
6. Confirmați că urmărește lanțul:

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Un nod nou care se alătură testnet-ului pornește direct de la binarul v3.2.8; vedeți [Conectarea la Testnet](/getting-started/connecting-to-testnet) pentru state sync și peer-uri și [Rularea unui nod](/developer-guide/running-a-node#upgrades) pentru istoricul upgrade-urilor.

## Limite și erori

| Ce vedeți | Semnificație | Ce faceți |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` și nodul se oprește la înălțimea 9,929,500 | Nodul este încă pe binarul v3.2.7 | Secțiunea 8 |
| Eroare la pornire despre o bibliotecă partajată lipsă | `lib/` nu a fost copiat integral sau loader-ul nu indică spre el | Secțiunea 1 |
| Avertisment că `memory_cache_size` a fost ridicat | Valoarea configurată este sub 256 MiB | Setați 256 sau mai mult |
| Avertisment despre directorul de contracte | Codul contractelor este încă în vechea locație | Mutați-l în `<home>/wasm` când vă este convenabil |
| `501` de la `/qorechain/svm/v1/params` | Nodul nu este pe v3.2.8 (mainnet-ul rulează v3.2.7) | De așteptat pe mainnet |

## Pagini conexe

* [Rularea unui nod](/developer-guide/running-a-node), inclusiv [Runtime-ul de contracte în v3.2.8](/developer-guide/running-a-node#v328-node)
* [Rularea unui validator](/developer-guide/running-a-validator)
* [Conectarea la Testnet](/getting-started/connecting-to-testnet)
* [Endpointuri REST și gRPC](/api-reference/rest-grpc-endpoints)
