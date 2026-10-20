---
slug: /light-node/registration-and-licensing
title: Înregistrare și licențiere
sidebar_label: Înregistrare și licențiere
sidebar_position: 4
---

# Înregistrare și licențiere

Pentru a câștiga [cota de recompensă de 3% pentru nodurile light](/light-node/rewards-and-monitoring), un nod light trebuie să fie **înregistrat on-chain** și trebuie să continue să demonstreze că este activ. Această pagină descrie ce cere chain-ul, cum obții o licență, cum se înregistrează nodul singur și cum demonstrează că este viu (liveness).

:::note Înregistrarea este deschisă
Înregistrarea este deschisă pe mainnet (`qorechain-vladi`) și pe testnet (`qorechain-diana`). Rularea și sincronizarea unui nod nu necesită licență. Vezi [Starea programului de recompense](/light-node/overview#reward-program-status) pentru cum verifici starea curentă.
:::

## Înregistrarea on-chain

Înregistrarea înscrie nodul tău light pe chain, astfel încât protocolul să știe că există, ce tip este (`sx` sau `ux`) și ce cont de operator îl controlează. Odată înregistrat și activ, nodul devine eligibil pentru cota de recompensă pentru nodurile light.

### Cerințe {#requirements}

Chain-ul verifică toate acestea atunci când se execută tranzacția ta de înregistrare:

1. O licență `lightnode_operator` activă pe adresa operatorului.
2. Cel puțin **1.000 QOR delegați** de la aceeași adresă către validatori **bonded** (totalul tău pe oricâți validatori; delegările către validatori în jail sau unbonded nu se iau în calcul).
3. Un sold în contul operatorului pentru a plăti taxa de înregistrare de **1 QOR** și taxele de tranzacție. Nodul plătește din acest cont și o taxă pentru fiecare heartbeat: cu semnarea nativă, taxa este de 0,25 uqor per unitate de gas, adică 75.000 uqor (0,075 QOR) la valoarea implicită `[heartbeat] gas` de 300.000, adică aproximativ 1,9 QOR pe lună la circa 25 de heartbeat-uri pe zi.
4. Mai puțin de 10.000 de noduri light înregistrate la nivelul întregii rețele.

După înregistrare, nodul trebuie să trimită un heartbeat la fiecare **1.000 de blocuri** (cu o toleranță de 100 de blocuri) și să păstreze un uptime de cel puțin **80%** pentru a fi plătit. Citește valorile curente cu `GET https://api.qore.host/qorechain/lightnode/v1/params` (testnet: `https://api-testnet.qore.host`).

### Contul operatorului {#operator-account}

Înregistrarea se face de la **adresa ta de operator**: un cont `qor1…` obișnuit care deține licența și stake-ul, plătește taxele și primește recompensele. Nodul trebuie să poată semna pentru el, deci trebuie să fie un cont **ale cărui cuvinte de recuperare le deții**: cuvinte pe care le-ai notat tu, un cont din Keplr sau o cheie `qorechaind` (calea de derivare `m/44'/118'/0'/0/0`). Cea mai bună alegere este un cont dedicat, folosit doar pentru nod.

Un portofel custodial din Dashboard (unul al cărui seed este păstrat de Dashboard pentru tine) nu poate rula un nod decât dacă îi exporți mai întâi seed-ul.

Cheia Dilithium-5 a nodului nu are o adresă proprie: pe QoreChain, o cheie post-cuantică se atașează unui cont, nu creează unul. Nodul își atașează cheia la contul operatorului ca cheie post-cuantică a acelui cont, cu excepția cazului în care contul are deja una (vezi [Conturi care au deja o cheie post-cuantică](#accounts-with-a-pqc-key)).

## Obținerea unei licențe

### Mainnet: cumpărare din Dashboard

Licențele se cumpără din QoreChain Dashboard, la **Tools → Light Node**. O licență costă **50 $**, plătiți în USDT pe ERC-20, BEP-20 sau TRC-20; plata este verificată pe chain-ul respectiv. Trebuie să introduci adresa `qor1…` pentru care este licența **înainte** de a plăti; folosește adresa de operator descrisă mai sus.

Acordarea este un pas on-chain separat, semnat manual și trimis în loturi. Până când chain-ul o confirmă, tab-ul afișează **Paid, awaiting on-chain grant**, iar nodul raportează în continuare că adresa nu are licență. `lightnode-sx status` afișează o linie `Licence:` care trece pe `active` când acordarea ajunge. O poți verifica și direct:

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet: la cerere

Pe testnet nu se vinde nimic. Licențele de testnet sunt gratuite și sunt acordate la cerere de autoritatea de licențiere a testnet-ului: scrie la nodes@qorechain.io cu adresa ta `qor1…` de testnet.

## Înregistrarea nodului

Pașii de mai jos sunt fluxul de configurare al nodului însuși. Sunt aceiași pentru ambele ediții: `lightnode-ux` are aceleași comenzi ca `lightnode-sx` și folosește același director home (`~/.qorechain-lightnode`). Vezi [Ediția SX](/light-node/sx-edition#first-run-onboard) pentru detalii despre fiecare comandă.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

Parola protejează ambele chei din keyring-ul nodului: cheia post-cuantică a nodului și cheia contului de operator.

### Ce face `register`

`register` citește `operator_address` și cheile din keyring, apoi:

1. **Verifică licența.** Întreabă chain-ul dacă `operator_address` deține o licență `lightnode_operator` activă. Fără una, se oprește și spune de unde se poate obține. Din 3.1.10, mesajul trimite la **Tools → Light Node** pe mainnet și, pe testnet, la o licență gratuită la cerere la nodes@qorechain.io (3.1.9 încă numea vechiul tab din Dashboard). O licență expirată sau suspendată este raportată ca atare. Un nod deja înregistrat este raportat ca atare și nu se trimite nimic.
2. **Atașează cheia post-cuantică**, cu excepția cazului în care contul are deja una. Un cont fără cheie post-cuantică poate trimite doar acest mesaj, semnat clasic (fără extensia hibridă); nodul îl trimite astfel și include o dovadă de posesie a cheii acolo unde chain-ul o suportă.
3. **Delegă stake-ul lipsă**, doar dacă numești un validator cu `--delegate-to qorvaloper1...`. Fără `--delegate-to`, dacă contul este sub minim, se oprește și spune cât lipsește. Din 3.1.10 ia în calcul doar stake-ul delegat către validatori **bonded**, la fel ca chain-ul; 3.1.9 lua în calcul și validatorii în jail sau unbonded și putea fi apoi refuzat on-chain, așa că deleagă către un validator activ dacă rulezi 3.1.9.
4. **Înregistrează nodul** cu taxa de 1 QOR.

Fiecare pas este semnat de nodul însuși și confirmat într-un bloc înainte ca următorul să fie trimis. Fiecare tranzacție de după înregistrarea cheii poartă semnătura hibridă ML-DSA-87 + secp256k1 cerută de chain.

Comanda acceptă aceste flag-uri:

- `--delegate-to` — validatorul `qorvaloper1…` către care se delegă stake-ul lipsă.
- `--type` — tipul nodului, `sx` sau `ux` (implicit ediția binarului).
- `--version` — versiunea nodului de înregistrat (implicit versiunea proprie a binarului).
- `--print` — afișează comenzile `qorechaind` echivalente în loc să semneze (vezi mai jos).

Contul trebuie să existe deja pe chain (trebuie să fi primit fonduri) înainte ca `register` să poată semna pentru el.

### Conturi care au deja o cheie post-cuantică {#accounts-with-a-pqc-key}

Un cont configurat într-un portofel are adesea deja o cheie post-cuantică, derivată din aceleași cuvinte de recuperare. Conform regulilor chain-ului v3.2.3, chain-ul acceptă doar cheia înregistrată pe cont și refuză cheile de tip `classical_only` sau o cheie goală.

Începând cu 3.1.9, `keys add-operator --recover` gestionează această situație: când contul are deja o cheie post-cuantică, reconstruiește acea cheie din cuvinte, folosind aceeași derivare ca wallet-adapter și Dashboard-ul (aceeași ca `qorechaind tx pqc recover-key`), iar nodul semnează cu ea. Când contul nu are cheie, nodul derivă una din cuvinte, astfel încât cuvintele restaurează și cheia nodului. Dacă contul are o cheie post-cuantică pe care cuvintele nu o pot reproduce (un portofel care își generează și își păstrează propria cheie), comanda refuză și recomandă un cont de operator dedicat.

### Alternativă: cheia operatorului într-un keyring `qorechaind`

Dacă păstrezi cheia contului de operator într-un keyring `qorechaind` și nu vrei să o stochezi în nod, sari peste pasul 3 și rulează:

```bash
lightnode-sx register --print
```

Rulează aceleași verificări de licență și de înregistrare și afișează, completate cu valorile tale, comenzile `qorechaind` pentru fiecare pas: exportarea cheii nodului în directorul de chei al `qorechaind` (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, un `tx staking delegate` când stake-ul nu ajunge și `tx lightnode register` ca pereche generare-apoi-`tx pqc cosign`. Pe această cale, daemon-ul folosește `qorechaind` și pentru heartbeat-uri; vezi [setările `[heartbeat]`](/light-node/sx-edition#configure).

## Dovezi de liveness prin heartbeat

Doar înregistrarea nu este suficientă pentru a rămâne eligibil. Un nod light înregistrat trebuie să demonstreze continuu că este online prin trimiterea de **dovezi de liveness prin heartbeat**. Aceste heartbeat-uri sunt modul în care chain-ul distinge nodurile active — care sunt eligibile pentru cota de recompensă — de nodurile înregistrate, dar offline.

În practică, asta înseamnă că un nod care este înregistrat și menținut în funcțiune (și sincronizat) își păstrează eligibilitatea, în timp ce un nod care iese offline încetează să mai demonstreze liveness și își pierde eligibilitatea până când revine. Menținerea daemon-ului în funcțiune și sănătos face, prin urmare, parte din câștigarea recompenselor — vezi [Recompense și monitorizare](/light-node/rewards-and-monitoring) pentru cum să urmărești sănătatea heartbeat-ului și a sincronizării.

### Pipeline-ul de heartbeat co-semnat PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain este **PQC obligatoriu în mod implicit**, așa că fiecare heartbeat poartă o **semnătură hibridă**: ML-DSA-87 (Dilithium-5) cu cheia post-cuantică a contului și secp256k1 cu cheia contului de operator. Nodul construiește și semnează singur tranzacția pe Linux, macOS și Windows; `qorechaind` nu este necesar. Citește din rețea ce versiune de sign-bytes să folosească.

Heartbeat-urile on-chain sunt activate implicit. Daemon-ul trimite unul când au trecut 1.000 de blocuri (`[heartbeat] interval_blocks`, corespunzând `heartbeat_interval` al chain-ului) de la `last_heartbeat` înregistrat de chain pentru nod, verificând la fiecare 60 de secunde, așa că o repornire nici nu trimite un duplicat, nici nu așteaptă un interval întreg. Fiecare heartbeat este raportat doar după ce a intrat într-un bloc.

Daemon-ul își alege semnatarul la pornire:

- **Nativ** — keyring-ul conține cheia operatorului (din `keys add-operator`) și aceasta corespunde cu `operator_address`. Acesta este cazul normal.
- **Alternativa `qorechaind`** — altfel, dacă un binar `qorechaind` se află în `PATH` sau la `[heartbeat] qorechaind_path`. Folosește cheia operatorului din keyring-ul `qorechaind` (`[heartbeat] key_name`, home `qorechaind_home`, implicit `~/.qorechaind`) și cheia exportată a nodului din `pqc/<key_name>.dilithium`. Parola keyring-ului `qorechaind` se pune în `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE`; este transmisă către `qorechaind` pe stdin, niciodată plasată pe linia de comandă.

Până când nodul este înregistrat, nu trimite heartbeat-uri; în schimb loghează motivul, o dată la fiecare schimbare de stare: lipsa licenței sau licență activă, dar nod neînregistrat (rulează `register`). `lightnode-sx status` afișează liniile `Signer:`, `Licence:` și `Registration:`, astfel încât motivul să fie vizibil fără a citi log-urile. Când nu există semnatar, nodul rulează și se sincronizează în continuare, dar nu poate rămâne activ pe chain, iar `status` spune acest lucru.

## Tab-ul Light Node din Dashboard

Tab-ul **Tools → Light Node** din QoreChain Dashboard reunește pașii:

1. **Descărcări.** Oferă linkuri către binarele nodului light pentru rețeaua selectată (aceleași fișiere ca `https://download.qore.host/<net>/lightnode/latest.json`, cu sumele lor de control sha256).
2. **Pașii de configurare.** Afișează cei cinci pași de mai sus, potriviți cu versiunea din manifestul de lansare, și dacă înregistrarea este deschisă, citit din câmpul `registration` al manifestului.
3. **Cumpărarea licenței** (doar pe mainnet). Preia adresa licenței înainte de plată și afișează **Paid, awaiting on-chain grant** până când chain-ul confirmă acordarea. Te avertizează dacă adresa introdusă este propriul tău portofel custodial din Dashboard și menționează, cu titlu informativ, dacă adresa are deja o cheie post-cuantică.
4. **Stare.** Un panou de stare afișează starea nodului așa cum este citită de pe chain.

Înregistrarea propriu-zisă este întotdeauna tranzacția trimisă de `lightnode-sx register` (sau `lightnode-ux register`). Dashboard-ul nu înregistrează noduri; vechiul său formular de înregistrare, care doar stoca o înregistrare în evidență, a fost eliminat.

## Unde să mergi mai departe

- [Recompense și monitorizare](/light-node/rewards-and-monitoring) — cum se creditează, se revendică și se monitorizează cota de 3%.
- [Ediția SX](/light-node/sx-edition) — comanda `register` și referința CLI completă.
