---
slug: /rollups/rdk-v328
title: "RDK pe v3.2.8: ce s-a schimbat"
sidebar_label: RDK pe v3.2.8
sidebar_position: 11
---

# RDK pe v3.2.8: ce s-a schimbat

Versiunea QoreChain v3.2.8 schimbă felul în care se decontează rollup-urile. Rollup-urile își pot acum pune datele pe lanț, pot lăsa lanțul să le ordoneze tranzacțiile (secvențiere bazată, based sequencing), se pot deconta optimist cu o dovadă de fraudă care reexecută batch-ul, își pot ține postările private pentru un set de membri și pot lega rădăcini de retragere Groth16 într-un mod care acceptă orice rădăcină de 32 de octeți. Decontarea STARK este în pauză până la o versiune ulterioară. Această pagină descrie ce face fiecare schimbare și cum se folosește. Este pentru operatorii și dezvoltatorii de rollup-uri care construiesc pe modulul `x/rdk`.

:::caution Deocamdată doar testnet

v3.2.8 rulează pe testnet-ul public `qorechain-diana` din 12 noiembrie 2026. Mainnet-ul nu a aplicat-o încă, deci fiecare funcție de pe această pagină este refuzată acolo până când o face. Tratează exemplele ca exemple de testnet.

:::

:::note Ce unelte pot face asta astăzi

* **Linia de comandă a nodului (`qorechaind`)**: fiecare mesaj de pe această pagină are o comandă. Este binarul de nod pentru Linux; nu există un binar macOS împachetat, deci pe un Mac rulează-l pe o gazdă Linux sau citește lanțul prin REST.
* **Kitul RDK**: RDK 0.9.0 suportă v3.2.8. Este publicat pe toate registrele: npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) și Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Note de versiune: https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Clienții RDK pentru Python, Go, Rust și Java**: versiunea 0.9.0 a fiecăruia suportă v3.2.8. Rularea cap-coadă de mai jos a folosit clientul TypeScript.

:::

## Ce s-a schimbat dintr-o privire {#at-a-glance}

| Zonă | Comportament din v3.2.8 |
| --- | --- |
| Postarea datelor | `MsgPostRollupData` pune un payload într-o tranzacție și păstrează pe lanț un angajament sub următoarea secvență de inbox a rollup-ului. |
| Secvențiere bazată | Lanțul ordonează tranzacțiile unui rollup după includerea lor. Se setează la creare sau prin guvernanță cu `MsgSetRollupSequencing`. |
| Rollup-uri optimiste | Rollup-urile optimiste noi (`nft`, `custom`) rulează modelul de execuție `qledger-v1` și trebuie să fie bazate. O dovadă de fraudă reexecută batch-ul. |
| Garanția submitter-ului | Batch-urile unui rollup `qledger-v1` au nevoie de o garanție (`MsgBondRollupSubmitter`). O dovadă de fraudă confirmată arde jumătate și plătește jumătate contestatarului. |
| Depozite | `MsgDepositToRollup` creditează un cont de 32 de octeți pe un rollup `qledger-v1`. |
| Rollup-uri private | Rollup-urile `defi` create cu confidențialitatea `encapsulated` acceptă doar plicuri ML-KEM-1024 către membrii lor (`MsgSetRollupMembers`). |
| Intrări Groth16 | Intrările sunt citite modulo câmpul scalar BLS12-381. `withdrawals_root` poate fi orice 32 de octeți și este stocat redus. |
| STARK | Cheile STARK și batch-urile STARK sunt refuzate până la o versiune ulterioară. |
| Retenție | Angajamentele datelor postate sunt păstrate `posted_data_retention_blocks`, cu puncte de control păstrate mai mult pe rollup-urile `qledger-v1`. |

## De ce contează {#why}

Înainte de v3.2.8, datele unui rollup nu aveau loc pe lanț, deci oricine verifica un batch trebuia să se încreadă în copia secvențiatorului. Postarea datelor și ordonarea după includere elimină această încredere: lanțul însuși înregistrează ce s-a postat și în ce ordine, iar un batch trebuie să consume exact acel interval. Pentru rollup-urile optimiste, o contestare verifică acum execuția, nu doar o rădăcină, deci un batch greșit îi costă submitter-ului garanția. Rollup-urile private permit unui grup să partajeze date pe un lanț public fără să le publice.

## Postarea datelor rollup-ului {#posting-data}

`MsgPostRollupData` (comanda `tx rdk post-data`) trimite un payload într-o tranzacție. Octeții rămân în tranzacție, deci sunt în bloc. Lanțul păstrează un angajament sub următoarea secvență de inbox a rollup-ului (începând de la 1): SHA-256 al datelor, dimensiunea lor, cel care postează și înălțimea. De asemenea, extinde acumulatorul de inbox al rollup-ului.

* **Cine poate posta**: secvențiatorul rollup-ului (creatorul său când nu este setată nicio adresă de secvențiator). Pe un rollup bazat, oricine.
* **Dimensiune**: cel mult `max_posted_data_bytes` per postare (implicit 131.072 de octeți, plafon strict 1 MiB) și `max_posted_data_bytes_per_block` pentru toate rollup-urile la un loc (implicit 524.288 de octeți facturabili).
* **Taxă**: `posted_data_fee_per_byte` uqor per octet facturabil (implicit 10), iar o postare este facturată la minimum 1 KiB. Taxa merge la fee collector și este împărțită ca un comision de tranzacție. Gazul se taxează în plus.
* **Retenție**: angajamentul este eliminat după `posted_data_retention_blocks` (implicit 648.000). Octeții rămân în istoricul blocurilor.
* **Folosirea într-un batch**: un batch al unui rollup cu DA nativ care nu este bazat poate referi o postare păstrată cu `data_hash` egal cu SHA-256 al datelor.

Linia de comandă (binar de nod pentru Linux):

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Citește un angajament prin REST (verificat pe testnet, vezi [Rute verificate](#checked-routes)):

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

Răspunsul conține `data_hash`, `size`, `poster`, `height`, `inbox_acc` și `expires_at_height`. O secvență care nu a fost niciodată postată sau a fost eliminată returnează HTTP 404.

## Secvențiere bazată {#based-sequencing}

Un rollup bazat este ordonat după includerea pe QoreChain. Fiecare postare primește următoarea secvență de inbox, iar fiecare batch consumă inbox-ul în ordine.

* Creează un rollup ca bazat cu `--sequencing based`, sau mută un rollup existent cu `MsgSetRollupSequencing` prin guvernanță.
* Fiecare batch setează `inbox_end` (secvența ultimei postări pe care o consumă) și poartă angajamentul intervalului de inbox ca `data_hash`. Cere-l lanțului cu `query rdk inbox` (returnează `range_data_hash`).
* Un rollup bazat este pus în pauză, reluat și oprit doar prin guvernanță.

Cine poate trimite batch-uri pe un rollup bazat depinde de rollup:

| Rollup | Cine trimite batch-uri |
| --- | --- |
| zk cu cheie Groth16 (`defi`) | Orice cont. Dovada leagă rădăcinile, intervalul de inbox și rădăcina retragerilor. |
| decontare bazată (`gaming`, `enterprise`) | Doar secvențiatorul rollup-ului. |
| optimist cu `qledger-v1` (`nft`, `custom`) | Orice cont care deține o garanție de submitter. |

Rollup-urile optimiste fără `qledger-v1` și rollup-urile STARK nu pot fi bazate în această versiune.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

Acumulatorul și angajamentul intervalului, pentru provers care vor să le calculeze fără să se încreadă într-un nod:

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` înseamnă 32 de octeți zero, iar `lp` este un prefix de lungime de 4 octeți big-endian.

## Rollup-uri optimiste cu qledger-v1 {#qledger-v1}

Din v3.2.8, un rollup optimist nou nu poate fi creat fără o VM de execuție. Presetările `nft` și `custom` au nevoie de `--execution-vm qledger-v1` împreună cu `--sequencing based`. Rollup-urile optimiste create înainte de v3.2.8 rămân neschimbate.

`qledger-v1` este un registru de conturi în uqor (un arbore Merkle rar cu SHA-256) cu transferuri și retrageri semnate. Cheile de cont sunt doar ML-DSA-44. Intrările sale sunt inbox-ul lui:

* **Postări de utilizator**: câte o tranzacție, cel mult 6 KiB.
* **Depozite**: `MsgDepositToRollup` creditează un id de cont de 32 de octeți. Lanțul adaugă singur depozitul în inbox.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Garanția submitter-ului și batch-urile în așteptare {#submitter-bond}

Orice cont poate trimite batch-uri după ce deține pe acel rollup o garanție de submitter de cel puțin `min_submitter_bond` (implicit 1.000 QOR, 1.000.000.000 uqor).

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

Interogarea garanției returnează `amount`, `last_submit_time`, `unbond_after` și `pending`. `pending` este numărul de batch-uri ale acelui submitter care încă așteaptă finalitatea: crește la fiecare batch trimis și scade când unul este finalizat sau respins. Un submitter poate avea mai puțin de 1.024 de batch-uri în așteptare. O garanție poate fi retrasă cu `unbond-submitter` la o fereastră de contestare întreagă după ultimul batch al deținătorului.

### Reguli pentru batch-uri {#batch-rules}

Fie `consumed` poziția din inbox de la care pornește următorul batch și `head` ultima postare (ambele în `query rdk inbox`). Un batch cu `inbox_end = end` este admis când toate acestea sunt adevărate:

1. Submitter-ul deține cel puțin `min_submitter_bond` și are mai puțin de 1.024 de batch-uri în așteptare.
2. `consumed < end <= head`. Un batch consumă cel puțin o intrare.
3. `end - consumed <= 64`. Cel mult 64 de intrări de inbox per batch.
4. Lanțul poate încă produce acumulatorul la `end`: `end` este head-ul, sau angajamentul postării `end` este păstrat (`query rdk inbox <rollup> --inbox-end <end>` returnează un `range_data_hash`).
5. Un batch de mai puțin de 64 de intrări care se oprește înainte de head se oprește fie chiar înaintea unei postări făcute în ultimele 20 de blocuri, fie la un punct de control (`end` este multiplu de 64) a cărui postare următoare nu mai este păstrată.
6. `data_hash` este angajamentul intervalului de inbox de la `consumed` la `end`, primul batch pornește de la rădăcina goală a registrului, iar `state_root` are 32 de octeți.

Un client poate alege `end` astfel:

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Trimite cu linia de comandă:

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Dovezi de fraudă {#fraud-proofs}

În timpul ferestrei de contestare, oricine poate trimite `MsgChallengeBatch` cu o dovadă de fraudă `qledger-v1`: intrările batch-ului și un martor Merkle al conturilor pe care le ating. Lanțul reexecută batch-ul.

* Dacă rădăcina de stare sau rădăcina retragerilor este greșită, batch-ul este respins, la fel ca fiecare batch construit pe el. Inbox-ul face rollback.
* Întreaga garanție a submitter-ului este tăiată (slash). **Jumătate este arsă și jumătate este plătită contestatarului.** Jumătatea arsă este înregistrată în modulul burn sub sursa `rollup_slash`. Un submitter care își contestă propriul batch greșit pierde totuși jumătate din garanție.
* O dovadă care nu arată un batch greșit eșuează cu eroarea 51 și nu schimbă nimic.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

RDK 0.9.0 are helperii `qledger-v1` care construiesc octeții dovezii.

Batch-urile necontestate se finalizează singure când se încheie fereastra de contestare. Retragerile sunt plătite doar din batch-uri finalizate, din fondul de depozite al rollup-ului, niciodată din escrow-ul creatorului. Un rollup nu poate fi oprit cât timp fondul conține depozite (eroarea 54).

### Retenție și perioade de inactivitate {#retention}

* Un angajament de postare este păstrat `posted_data_retention_blocks`, apoi, cât timp niciun batch finalizat nu îl acoperă, până la încă 4 perioade de retenție.
* După aceea este eliminat, cu excepția unui punct de control: fiecare postare a cărei secvență este multiplu de 64 își păstrează angajamentul până când îl acoperă un batch finalizat sau până când rollup-ul este oprit.
* Un rollup oprit nu păstrează niciun angajament peste perioada sa de retenție.
* `posted_data_retention_blocks` trebuie să fie cel puțin cât cea mai lungă fereastră de contestare în vigoare, numărată ca un bloc pe secundă (`default_challenge_window` și fereastra fiecărui rollup care nu este oprit). O actualizare de parametri care o lasă mai scurtă, sau care ridică o fereastră peste ea, este refuzată cu `invalid params`. Limita superioară este 25.920.000.
* La upgrade-ul v3.2.8, o valoare stocată sub acea fereastră este ridicată până la ea. Parametrii impliciți sunt lăsați așa cum sunt.
* **Valori de testnet**: `default_challenge_window` este 3.600 de secunde (valoarea implicită din core și cea în stil mainnet este 604.800 de secunde, 7 zile). Datele postate sunt păstrate 648.000 de blocuri, iar blob-urile și batch-urile finalizate 432.000 de blocuri.

După o perioadă lungă de inactivitate, cu mai mult de 64 de postări neconsumate și angajamentele lor eliminate, un submitter se pune la zi în ordine: un batch până la următorul multiplu de 64 dacă `consumed` nu este unul, apoi batch-uri complete de 64 de la un punct de control la următorul, apoi un ultim batch până la head (sau până la orice poziție păstrată conform regulii 5). În funcționarea normală nu se schimbă nimic: fă batch-uri de până la 64 de intrări, până la head sau chiar înaintea unei postări recente.

## Rollup-uri private {#private-rollups}

Un rollup `defi` (Groth16) creat cu confidențialitatea `encapsulated` acceptă doar postări care sunt plicuri ML-KEM-1024 către membrii săi.

Un plic criptează datele o singură dată cu AES-256-GCM sub o cheie proaspătă și încapsulează acea cheie către cheia ML-KEM-1024 a fiecărui membru din registrul KEM al lanțului. Un angajament al cheii se asigură că toți membrii deschid același conținut. Lanțul verifică dacă plicul este bine format și dacă fiecare intrare numește cheia curentă a membrului. Nu decriptează niciodată.

* Creatorul setează membrii cu `MsgSetRollupMembers`: cel mult 32, fiecare cu o cheie ML-KEM-1024 înregistrată. Fiecare schimbare începe o nouă epocă de membri.
* Postările, cel care postează, momentul, dimensiunile, membrii, rădăcinile și retragerile (destinatar și sumă) rămân publice. Doar conținutul postărilor este privat.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Intrările Groth16 și rădăcina retragerilor {#groth16}

Un batch Groth16 peste BLS12-381 (profilul `defi`, SNARK) este verificat față de intrări publice, fiecare o valoare de 32 de octeți citită ca întreg big-endian și redusă modulo ordinul câmpului scalar:

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Un batch trimis înainte ca retragerile să fie legate are doar primele trei intrări. Martorul prover-ului trebuie să ia aceleași valori reduse.

Dacă o valoare trebuie să fie deja sub `r` depinde de cine o setează:

| Valoare | Cine o setează | Trebuie să fie sub r |
| --- | --- | --- |
| `state_root` | prover-ul | da |
| `prev_state_root` | lanțul (ultimul `state_root` decontat), cu excepția primului batch al unui rollup | doar primul batch |
| `data_hash` | lanțul când este legat (intervalul de inbox al unui rollup bazat, un angajament de date postate), altfel prover-ul | doar când nu este legat |
| `withdrawals_root` | lanțul (rădăcina arborelui de retrageri pe care o reconstruiește `MsgExecuteWithdrawal`) | nu |

Ce înseamnă asta pentru un client:

* Trimite rădăcina retragerilor așa cum o dă arborele. Poate fi orice 32 de octeți.
* Lanțul stochează `withdrawals_root mod r` ca 32 de octeți big-endian. Interogarea batch-ului arată acea valoare stocată, cu `withdrawals_root_reduced` true. Circa 55 la sută dintre rădăcinile de arbore sunt egale sau peste `r`, deci valoarea stocată diferă adesea de octeții trimiși.
* `MsgExecuteWithdrawal` nu se schimbă pentru client: trimite câmpurile frunzei și hash-urile frăților. Lanțul reconstruiește rădăcina și acceptă retragerea când `rebuilt_root mod r == stored_root mod r`.
* Două trimiteri ale aceluiași batch ale căror rădăcini diferă cu un multiplu de `r` sunt același batch. Prima se decontează, a doua este refuzată ca un batch care există deja, iar fiecare retragere din arbore este plătită față de rădăcina stocată.
* După decontare, compară rădăcina stocată cu `tree_root mod r`, nu cu `tree_root`.

Batch-urile optimiste, `qledger-v1` și Groth16 de dinainte de regula de reducere stochează și compară exact cei 32 de octeți. Pentru codificarea arborelui și a frunzelor, vezi [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals).

## Decontarea STARK este în pauză {#stark}

Singura afirmație STARK pe care o suportă verificatorul dovedește ridicarea la pătrat iterată între două valori pe 64 de biți. Asta nu constrânge retragerile sau datele unui rollup. Din v3.2.8 nu se poate seta o cheie STARK, iar batch-urile unui rollup STARK sunt refuzate (eroarea 52). Guvernanța poate muta un astfel de rollup pe o cheie Groth16. Decontarea STARK revine într-o versiune ulterioară, cu o afirmație reală despre rollup.

## Mesaje noi {#messages}

| Mesaj | Comandă | Cine îl trimite |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | Secvențiatorul, sau oricine pe un rollup bazat |
| `MsgSetRollupSequencing` | propunere de guvernanță | Guvernanța |
| `MsgDepositToRollup` | `tx rdk deposit` | Oricine, pentru un rollup `qledger-v1` |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Un submitter de batch-uri |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Un submitter de batch-uri |
| `MsgSetRollupMembers` | `tx rdk set-members` | Creatorul unui rollup privat |
| Câmpul `inbox_end` din `MsgSubmitBatch` | `tx rdk submit-batch --inbox-end` | Submitter-ul unui batch de rollup bazat |

`create-rollup` primește și `--sequencing`, `--execution-vm` și `--privacy`. Matricea de compatibilitate este acum: optimist cu dovezi de fraudă are nevoie de `qledger-v1` și secvențiere bazată, iar decontarea ZK înseamnă SNARK.

## Flux lucrat: creare, garanție, depozit, postare, batch, contestare, finalizare, retragere {#worked-flow}

:::note Rulat pe testnet de echipa RDK, 12 noiembrie 2026
Echipa RDK a rulat acest flux cap-coadă pe testnet-ul `qorechain-diana` la 12 noiembrie 2026, între 06:22 și 07:27 UTC. A fost condus în întregime prin RDK 0.9.0 (TypeScript), cu comisionul `auto` al RDK la 0,15 uqor per gaz. Fiecare pas a returnat cod 0. Nu a fost rulat de autorul acestei pagini.
:::

| Pas | Mesaj | Gaz folosit / gaz cerut |
| --- | --- | --- |
| 0 | Înregistrează mai întâi cheia post-cuantică a contului nou, într-o tranzacție separată (`MsgRegisterPQCKeyV2` cu dovada deținerii). Clienții RDK fac asta automat; fără ea, prima tranzacție reală este refuzată cu pqc cod 8 | 348.917 / 600.000 |
| 1 | `MsgCreateRollup`: profil `nft`, VM de execuție `qledger-v1`, secvențiere `based`, miză 10.000 QOR (1% ars) | 301.260 / 349.199 |
| 2 | `MsgBondRollupSubmitter`, 1.000 QOR | 178.059 / 263.425 |
| 3 | `MsgDepositToRollup` de două ori (3 QOR și 1 QOR; minimul este 1 QOR) | circa 240.000 / 350.000 fiecare |
| 4 | `MsgPostRollupData` de două ori (un transfer qledger semnat și o retragere qledger semnată), plus taxa pentru datele postate (10 uqor per octet facturabil, minimum 1 KiB facturat) | circa 328.500 / 474.000 fiecare |
| 5 | `planQledgerBatch`, apoi `MsgSubmitBatch` pentru 4 intrări de inbox (`inbox_end` 4, `data_hash` intervalul de inbox). Stare batch `submitted`, garanție `pending` 1 | 712.379 / 1.011.431 |
| 6 | Test de fraudă: încă o postare, apoi un batch cu o rădăcină de stare greșită intenționat (233.990 / 341.742), apoi `MsgChallengeBatch` cu dovada de fraudă construită de RDK (4.136 de octeți) | 450.186 / 644.417 |
| 7 | Batch-ul 0 s-a finalizat singur după fereastra de contestare de 3.600 de secunde a testnet-ului | nicio tranzacție |
| 8 | `MsgExecuteWithdrawal` de 0,3 QOR cu dovada Merkle qledger a RDK | 192.768 / 284.220 |

Rezultate demne de reținut:

* **Pasul 6**: batch-ul greșit a fost respins, garanția submitter-ului a fost tăiată (jumătate arsă, jumătate plătită contestatarului), inbox-ul a făcut rollback, iar batch-ul bun anterior a rămas neatins.
* **Pasul 8**: fondul de depozite al rollup-ului a scăzut de la 4,0 la 3,7 QOR, iar soldul destinatarului a crescut cu 0,3 QOR minus comisionul.

Linia de comandă are un echivalent pentru fiecare pas. Aceste comenzi individuale nu au fost rulate pentru această pagină și urmează definițiile CLI-ului de nod:

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

Fereastra de contestare a unui rollup este în `challenge_window_sec`. Pe testnet, `default_challenge_window` este intenționat 3.600 de secunde, ca rollup-urile să poată fi exersate într-o oră; valoarea implicită din core și cea în stil mainnet este 604.800 de secunde (7 zile). Pașii 5 până la 8 au nevoie de rădăcini și dovezi calculate din registru; RDK 0.9.0 are helperii `qledger-v1` care fac asta.

## Citirea lanțului cu kitul TypeScript publicat {#typescript}

Aceste citiri folosesc nume din `@qorechain/rdk`, care suportă v3.2.8 începând cu 0.9.0. Poți citi câmpurile noi și direct cu `curl`, așa cum se arată mai jos.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Acest fragment nu a fost executat pentru această pagină.

## Rute verificate {#checked-routes}

Aceste rute doar pentru citire au fost cerute de pe testnet-ul public la 12 noiembrie 2026.

| Rută | Stare |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` și `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, sau 404 pentru o secvență niciodată postată sau eliminată |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| orice rută pentru un rollup necunoscut | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

Parametrii modulului includ acum `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` și `finalized_batch_retention_blocks`. Vizualizarea batch-ului adaugă `inbox_start`, `inbox_end` și `withdrawals_root_reduced`, iar vizualizarea rollup-ului adaugă `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` și `deposit_pool`. Răspunsul inbox are `head_sequence`, `consumed_sequence` și `range_data_hash`, care este gol când angajamentul la end-ul cerut nu este disponibil.

## Limite și erori {#limits}

| Limită sau eroare | Valoare sau semnificație |
| --- | --- |
| Dimensiunea postării | `max_posted_data_bytes`, implicit 131.072 de octeți, plafon 1 MiB |
| Octeți postați per bloc | `max_posted_data_bytes_per_block`, implicit 524.288 de octeți facturabili |
| Taxa de postare | 10 uqor per octet facturabil implicit, minimum 1 KiB facturat |
| Retenția datelor postate | 648.000 de blocuri implicit, cel mult 25.920.000, niciodată sub cea mai lungă fereastră de contestare în secunde |
| Postare `qledger-v1` | O tranzacție, cel mult 6 KiB |
| Dimensiunea batch-ului | De la 1 la 64 de intrări de inbox |
| Batch-uri în așteptare per submitter | mai puțin de 1.024 |
| Membri ai unui rollup privat | cel mult 32, fiecare cu o cheie ML-KEM-1024 înregistrată |
| Batch-uri decontate per bloc, per rollup | `max_batches_per_block`, implicit 10 (eroarea 40) |
| Eroarea 41, 44, 47 | Funcția nu este activată la această înălțime (rețeaua nu a aplicat v3.2.8) |
| Eroarea 42, 43 | Postare prea mare, sau limita de postări a blocului a fost atinsă |
| Eroarea 45 | Secvențierea bazată nu este disponibilă pentru acest rollup |
| Eroarea 46 | Batch-ul nu se potrivește cu inbox-ul rollup-ului (`inbox_end` sau `data_hash` greșit) |
| Eroarea 48 | Mod de execuție sau de confidențialitate invalid |
| Eroarea 49 | Garanția submitter-ului este necesară |
| Eroarea 50 | Garanția submitter-ului este încă blocată |
| Eroarea 51 | Dovada de fraudă nu arată batch-ul ca invalid |
| Eroarea 52 | Decontarea STARK este în pauză |
| Eroarea 53 | Postarea nu este un plic valid către membrii rollup-ului |
| Eroarea 54 | Rollup-ul încă deține depozite de utilizatori, deci nu poate fi oprit |

## Pagini conexe {#related}

* [Prezentare generală a rollup-urilor](/rollups/overview)
* [Profiluri presetate](/rollups/preset-profiles)
* [Implementarea unui rollup](/rollups/deploying-a-rollup)
* [Disponibilitatea datelor](/rollups/data-availability)
* [ZK / STARK & Withdrawals](/rollups/zk-stark-withdrawals)
* [Watchtower](/rollups/watchtower)
