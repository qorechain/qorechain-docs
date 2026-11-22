---
slug: /developer-guide/svm-testnet-v329
title: "SVM pe testnet: implementează programe și trimite tranzacții Solana (v3.2.9)"
sidebar_label: SVM Testnet (v3.2.9)
sidebar_position: 11
---

# SVM pe testnet: implementează programe și trimite tranzacții Solana (v3.2.9)

Versiunea **v3.2.9** permite liniei de comandă Solana standard să comunice cu QoreChain. Poți rula `solana transfer`, `solana program deploy`, `anchor deploy` și un script web3.js pe testnet, iar lanțul verifică el însuși fiecare semnătură Solana. O cheie Solana nu poate atinge de una singură contul tău QoreChain: mai întâi deschizi o mică **fereastră de autorizare** limitată, printr-o tranzacție semnată cu **cheia ta post-cuantică**, iar fereastra este acceptată doar dacă cheia Solana dovedește, cu propria semnătură, că o deții. Când fereastra se încheie, cheia este din nou un cont Solana obișnuit.

Această pagină duce un dezvoltator de la o mașină goală până la un program implementat și apelat pe testnet: ce este nou, uneltele, construirea manuală a dovezii cheii, deschiderea și închiderea ferestrei, alimentarea unei chei de implementare, implementarea cu `solana` sau `anchor`, apelarea programului, citirea rezultatului și un tabel cu textele reale ale erorilor.

:::note Doar testnet, verificat la 22 noiembrie 2026
Tot ce este aici rulează pe testnet-ul **`qorechain-diana`**, care rulează v3.2.9 din 20 noiembrie 2026 (propunerea de guvernanță 39, înălțimea 10.424.000). Lane-ul compatibil Solana (SVM) este deschis acolo din propunerea de guvernanță 37. **Nimic din toate acestea nu funcționează pe mainnet:** lane-ul SVM este oprit pe `qorechain-vladi`, apelurile între VM-uri rămân în pauză, iar încărcarea contractelor CosmWasm rămâne doar prin guvernanță. Construiește doar pe testnet. QOR de test nu are valoare. Folosește chei de unică folosință.

Apelurile de citire, oferta de comision, ruta nonce-ului și exemplul de dovadă a cheii de pe această pagină au fost rulate pe testnet-ul live la 22 noiembrie 2026. Fluxul complet (fereastră, alimentare, implementare, apel, upgrade, închidere) a fost rulat înainte de lansare pe o rețea locală de test, cu `solana-cli` 4.0.2 și `anchor-cli` 1.2.2 nemodificate. Vezi [Ce a fost verificat](#tested) pentru împărțirea exactă.
:::

:::caution Gateway-ul public nu retransmite încă tranzacții
La 22 noiembrie 2026, `https://svm-testnet.qore.host` a răspuns la fiecare `sendTransaction` bine format cu `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)`. Citirile funcționează, ofertele de comision funcționează, scrierile sunt refuzate până când operatorii acelui gateway setează un cont de relayer. Pașii până la fereastră inclusiv nu au nevoie de gateway. Pentru pașii care trimit, vezi [Trimiterea fără gateway-ul public](#relay) și verifică din nou endpoint-ul înainte să începi: rulează comanda din [Pasul 1](#step-config) și apoi un `solana transfer`, ca în [Pasul 6](#step-fund).
:::

## Ce este nou în v3.2.9 pentru SVM {#whats-new}

* **Tranzacții Solana pe lanț.** O tranzacție semnată de un portofel sau de o unealtă Solana este transportată, octet cu octet, în mesajul Native `MsgSolanaTransaction`. Lanțul verifică fiecare semnătură ed25519, blockhash-ul recent și plătitorul de comision, execută instrucțiunile în ordine ca un singur pas atomic și refuză o semnătură pe care a mai văzut-o. Mesajul rulează doar ca mesaj de nivel superior al propriei tranzacții de transport: este refuzat sub authz și când un contract îl trimite.
* **Un gateway care retransmite în loc să execute.** Metoda JSON-RPC Solana `sendTransaction` a nodului nu mai execută nimic pe nod. Decodează tranzacția, o simulează pe o copie aruncată a stării și o dă unui cont relayer, care semnează tranzacția de transport cu ambele chei și o trimite în mempool. Doar ce trece printr-un bloc schimbă starea. Relayer-ul nu primește nicio autoritate asupra tranzacției tale, pentru că semnăturile tale ed25519 sunt verificate pe lanț.
* **O fereastră de autorizare post-cuantică pentru chei Solana.** `MsgOpenSVMWindow` numește o cheie ed25519 și o limitează prin blocuri, număr de tranzacții și valoare în QOR, opțional restrânsă la programe listate. Cât timp fereastra este deschisă, tranzacțiile semnate de acea cheie acționează pentru contul tău. Deschiderea ei cere **semnătura ta ML-DSA-87**, deci o cheie Solana scursă nu poate deschide niciodată una singură.
* **O dovadă a cheii.** Deschiderea unei ferestre cere `svm_key_proof` (câmpul 7): o semnătură Ed25519 de 64 de octeți, făcută chiar de cheia Solana, peste un text scurt care numește lanțul, contul tău și cheia. O cheie publică este publică, deci dovada arată că cel care deschide fereastra deține cheia.
* **O dovadă deschide o singură fereastră.** Textul poartă un contor (nonce-ul) care crește cu fiecare fereastră deschisă pentru acea cheie, așa că o dovadă veche nu poate fi reluată.
* **Un loader de programe.** Loader-ul upgradeable este disponibil, deci `solana program deploy`, `write-buffer`, `extend`, `set-upgrade-authority`, `close` și `anchor deploy` funcționează, iar programele pot fi actualizate de autoritatea lor și închise pentru a recupera chiria.
* **Comisioane pe care le înțeleg uneltele Solana.** `getFeeForMessage` și `simulateTransaction` raportează comisionul real, deci verificările implicite de comision din `solana` și web3.js sunt corecte fără indicatori suplimentari. Când o tranzacție este prea ieftină, eroarea poartă prețul exact de setat.
* **Bugete pentru grant-urile authz.** `MsgExecuteProgram`, `MsgCreateAccount` și `MsgDeployProgram` trimise în numele tău de altcineva sub un grant authz rulează doar în interiorul unei ferestre și al bugetului ei separat „în numele altuia”.

### Calea tranzacției {#path}

```text
solana CLI / web3.js / anchor
        |  sendTransaction (signed wire transaction)
        v
SVM gateway on a node: decode, verify, simulate on a copy, check the price
        |  relayer signs MsgSolanaTransaction with the classical key and ML-DSA-87
        v
mempool, then a block: ante checks every Solana signature, blockhash, fee payer, window
        v
instructions run in order; they all succeed or none does
```

Comisionul Solana ajunge la relayer, deci acesta nu pierde niciodată bani. Fiecare răspuns al gateway-ului este final: un bloc este comis o singură dată, deci `processed`, `confirmed` și `finalized` returnează aceleași date.

### Fereastra: ce limitează {#window}

| Limită | Ce înseamnă | Interval |
| ----- | ------------- | ----- |
| Blocuri | Fereastra expiră după atâtea blocuri. Un bloc durează aproximativ 1,4 secunde pe testnet (verificat la 22 noiembrie 2026), deci 3.600 de blocuri înseamnă aproximativ 85 de minute | 1 până la 17.280 |
| Tranzacții | Fiecare tranzacție Solana admisă se numără ca una, chiar dacă apoi eșuează | 1 până la 1.000 |
| Valoare | Se numără fiecare scădere a QOR-ului nativ al contului cauzată de tranzacțiile admise, comisioanele incluse. O tranzacție care ar depăși valoarea este refuzată și se anulează. Valoarea se dă în uqor sau QOR, de exemplu `25qor` | mai mare ca 0 |
| Programe (opțional) | Fiecare instrucțiune a unei tranzacții admise trebuie să apeleze unul dintre programele listate | până la 16 |

Reguli care decurg din design:

* Fereastra este deschisă și închisă doar de **propria ta semnătură post-cuantică**, ca mesaj de nivel superior. Este refuzată sub authz, group sau un contract.
* Ai nevoie de o **cheie post-cuantică înregistrată** înainte să poți deschide o fereastră.
* **O cheie Solana autorizează un singur cont la un moment dat.** Deschiderea din nou a unei ferestre o înlocuiește pe cea veche și eliberează cheia ei.
* **Schimbarea sau migrarea cheii tale post-cuantice încheie fereastra.**
* Pe lângă soldul nativ, limita de valoare numără și QOR-ul pe care semnătura ta îl controlează în altă parte: conturi derivate din al tău cu un seed, conturi de token pe care le poți închide, tabele de căutare și conturi de loader pentru care ești autoritatea. Cheltuite sau date altcuiva, ele se numără. O cheie de fereastră nu poate scoate niciodată adresa proprie a contului tău din starea portofelului.
* Citirea `getBalance` sau `getAccountInfo` pentru cheia ferestrei arată soldul tău nativ cât timp fereastra este deschisă.

### Limitele cunoscute ale ferestrei {#window-limits}

Citește-le înainte să deschizi o fereastră pentru un portofel care ține tokenuri.

* **Sumele de tokenuri nu se numără în limita de valoare.** Limita numără doar QOR nativ. Cu domeniul implicit (fără listă de programe), cheia Solana poate transfera și arde tokenurile SPL ale contului și poate emite cu o autoritate de emitere pe care o deține contul, doar contra comisionului tranzacției.
* **Domeniul implicit refuză grant-urile de durată.** O cheie care acționează printr-o fereastră cu domeniu implicit nu poate aproba un delegat, nu poate schimba proprietarul sau autoritatea de închidere a unui cont de token și nu poate schimba autoritatea de emitere sau de înghețare a unui mint. Aceasta include un cont de token sau un mint creat în aceeași tranzacție. Acestea cer propria ta semnătură post-cuantică sau o fereastră a cărei listă de programe numește programul de token.
* **Plata unui co-semnatar se numără în fereastră.** Dacă o altă cheie semnează aceeași tranzacție Solana și plătește ceva în ea, acea plată se numără și ea în limita ta de valoare. Lasă un sponsor să plătească într-o tranzacție separată sau deschide o fereastră a cărei limită de valoare acoperă tot ce mută tranzacția.
* **Grant-urile făcute sub un domeniu explicit de token supraviețuiesc ferestrei.** Dacă lista de programe numește programul de token, delegările și schimbările de autoritate făcute prin fereastră rămân în vigoare după ce fereastra se închide, expiră sau cheia ta post-cuantică este rotită. Revocă-le cu propria ta semnătură.
* **Pentru a exclude complet acțiunile cu tokenuri,** deschide fereastra cu o listă de programe care nu numește programul de token.

### Comisioane {#fees}

| Element | Valoare (testnet, 22 noiembrie 2026) |
| ---- | --------------------------------- |
| Comision de bază per semnătură | 0,045 QOR (45.000 uqor, 45.000.000 lamports). Este prețul a 450.000 de gaz la prețul minim al gazului al lanțului, de 0,1 uqor per gaz, și îl raportează `getFeeForMessage` |
| Unități pe ecran | `solana` etichetează sumele **SOL**. Pe QoreChain 1 „SOL” este 1 QOR, pentru că 1 uqor înseamnă 1.000 de lamports, iar 1 QOR înseamnă 1.000.000 de uqor. Citește „0.045 SOL” ca 0,045 QOR |
| Comision de prioritate | Doar când tranzacția are nevoie de mai mult gaz decât plătește comisionul de bază. Este prețul ComputeBudget înmulțit cu limita de unități |
| O implementare | Un comision de bază per tranzacție de scriere, plus chirie care se întoarce când închizi programul |

Ce plătești este plafonat de ce ai semnat: plătești costul tranzacției de transport, cel puțin comisionul de bază și cel mult comisionul pe care l-a promis propria ta semnătură. Un relayer nu te poate face să plătești mai mult.

Când o tranzacție plătește mai puțin decât costă transportorul ei, gateway-ul o refuză cu codul `-32002` și îți spune remedierea exactă. Aceleași numere sunt în `data` a erorii:

```json
{
  "code": -32002,
  "message": "Transaction simulation failed: insufficient priority fee: the transaction pays 45000000 lamports, its carrier costs ... uqor ... set ComputeBudget SetComputeUnitPrice to <price> micro-lamports per compute unit, which covers it for a compute unit limit of <limit> or more ...",
  "data": {
    "computeUnitPrice": 0,
    "computeUnitLimit": 0,
    "transactionComputeUnitLimit": 0,
    "carrierFeeLamports": 0,
    "feeLamports": 0
  }
}
```

Zerourile reprezintă numerele tranzacției tale. Setează `SetComputeUnitPrice` la `data.computeUnitPrice` și o limită de unități de cel puțin `data.computeUnitLimit`; un micro-lamport mai puțin este refuzat din nou. Cu `solana program deploy` folosește `--with-compute-unit-price <data.computeUnitPrice>`. În rulările dinaintea lansării, fiecare pas al unei implementări, actualizări, extinderi, închideri și schimbări de autoritate obișnuite a încăput în comisionul de bază, deci întâlnești această eroare mai ales cu un `--max-len` neobișnuit de mare.

### Bugete „în numele altuia” {#on-behalf}

Un grantee authz care trimite `MsgExecuteProgram`, `MsgCreateAccount` sau `MsgDeployProgram` în numele tău acționează doar în interiorul ferestrei tale și al **bugetului ei separat în numele altuia**: `on_behalf_max_txs` și `on_behalf_max_value`. Limitele proprii ale cheii și bugetul în numele altuia nu se pot epuiza reciproc. Fără buget în numele altuia (implicit), astfel de grant-uri sunt refuzate și nu se mișcă nimic. Un `MsgExecuteProgram` învelit într-o execuție authz cu contul însuși ca grantee se numără și el ca trimis în numele tău, deci trimite-ți propriile mesaje SVM ca mesaje de nivel superior.

Fiecare execuție sau implementare imbricată face, de asemenea, ca contul tău să plătească comisionul fix SVM, `max(1, compute_budget_max / 1000)` uqor, adică 1.400 uqor la valoarea live a parametrului de 1.400.000. Acest comision se numără în limita de valoare în numele altuia. Setează `--on-behalf-max-value` la cel puțin `on_behalf_max_txs` înmulțit cu comisionul fix, plus valoarea pe care grantee-ul trebuie să o mute. O valoare 0 refuză orice execuție în numele altuia.

### Loader-ul {#loader}

| Rulezi | Ce face pe lanț |
| ------- | --------------------- |
| `solana program deploy x.so` | Scrie programul într-un buffer prin multe tranzacții mici, apoi îl implementează. Id-ul programului este cel din `--program-id` sau unul nou |
| `solana program deploy --program-id <id> x.so` pentru un program existent | Îl actualizează. Doar autoritatea de upgrade poate face asta |
| `solana program write-buffer` / `show --buffers` / `close <buffer>` | Scrie, listează și închide un buffer fără a implementa |
| `solana program extend <id> <bytes>` | Mărește zona de date a programului |
| `solana program set-upgrade-authority <id> --new-upgrade-authority <key>` | Predă upgrade-urile altei chei. `--final` face programul permanent |
| `solana program close <id>` | Închide programul și returnează chiria |
| `anchor deploy` | Face același lucru cu programul construit de Anchor |

Un program poate avea până la 10 MiB (`max_program_size` live). Programele se apelează între ele până la 4 niveluri adâncime (`max_cpi`). Bugetul de calcul implicit este de până la 1.400.000 de unități per instrucțiune.

## Cuvinte folosite în acest ghid {#words}

| Cuvânt | Sens simplu |
| ---- | ------------- |
| SVM | Mașina virtuală compatibilă Solana din QoreChain. Rulează aceleași programe compilate (SBF) ca Solana |
| Lamport | Cea mai mică unitate din uneltele Solana. 1 uqor înseamnă 1.000 de lamports, iar 1 QOR înseamnă 1.000.000.000 de lamports |
| Fereastră | O permisiune scurtă și limitată pentru ca o cheie Solana să acționeze pentru contul tău. Deschiderea ei cere o tranzacție semnată cu cheia ta post-cuantică |
| Dovada cheii | Propria semnătură a cheii Solana peste un text scurt. Dovedește că deții cheia pe care o numești |
| Nonce | Un contor per cheie Solana, crescut de fiecare fereastră deschisă cu o dovadă. Următoarea dovadă trebuie să semneze valoarea curentă |
| Transportor | Tranzacția Native care poartă o tranzacție Solana printr-un bloc |
| Relayer | Contul care semnează și trimite transportorul. Comisionul Solana îl rambursează |
| Blockhash | Hash-ul recent de bloc pe care se construiește o tranzacție Solana. Este valid 150 de sloturi, aproximativ 3,5 minute aici |

## Înainte să începi {#prerequisites}

Ai nevoie de un terminal pe macOS sau Linux, de aproximativ 10 QOR de test și de aceste unelte (versiunile din coloana din dreapta sunt cele folosite pentru această pagină):

| Unealtă | Pentru ce | Versiune folosită |
| ---- | -------- | ------------ |
| Linia de comandă Solana (Agave) | `solana`, `solana-keygen` | `solana-cli` 4.0.2 |
| Rust și `cargo build-sbf` | Construiește un program | `cargo-build-sbf` 4.0.0, platform tools v1.53, `rustc` 1.89 |
| Anchor (opțional) | `anchor build`, `anchor deploy` | `anchor-cli` 1.2.2 |
| Node.js 18 sau mai nou | Scriptul dovezii cheii și scriptul de apel | orice LTS curent |
| `@solana/web3.js` 1.x | Apelează programul | 1.99 |
| `qorechaind` v3.2.9 | Înregistrează cheia post-cuantică, deschide și închide fereastra | binarul de lansare, vezi mai jos |

Verifică ce ai:

```bash
solana --version
cargo build-sbf --version
anchor --version
node -v
```

**Despre `qorechaind`.** Deschiderea unei ferestre este un mesaj Native care cere semnătura ta ML-DSA-87, iar comanda `tx pqc open-svm-window` face parte din v3.2.9. La 22 noiembrie 2026, manifestul de lansare al testnet-ului (`https://download.qore.host/testnet/latest.json`) încă enumera versiunea 3.2.8, deci bundle-ul v3.2.9 este cel numit în textul propunerii de guvernanță 39 (`GET https://api-testnet.qore.host/cosmos/gov/v1/proposals/39`). Binarul de lansare este construit pentru Linux; nu există un binar macOS împachetat. Un helper SDK pentru fereastră nu este încă publicat. Tot restul din acest ghid nu are nevoie de un nod.

Mai ai nevoie de un cont QoreChain cu QOR de test (ia-l de la [faucet](/dashboard/faucet)) și de o cheie post-cuantică înregistrată. Dacă nu ai făcut asta, urmează mai întâi [Înregistrarea cheii](/developer-guide/post-quantum-signing#pqc-key-registration). Comenzile de mai jos numesc cheia contului `mykey` și cheia lui post-cuantică `mykey-mldsa`.

:::caution Doar chei de testnet de unică folosință
Cele două perechi de chei Solana pe care le creezi mai jos sunt fișiere cu chei secrete în ele. Nu folosi niciodată o pereche de chei care ține fonduri reale pe altă rețea și nu lipi niciodată o cheie secretă într-o comandă, într-un chat sau într-un depozit de cod.
:::

## Pas cu pas {#steps}

Creează un singur folder de lucru și o configurație Solana separată, ca setările tale `solana` obișnuite să nu fie atinse:

```bash
mkdir -p ~/qore-svm && cd ~/qore-svm
alias qsol='solana -C ~/qore-svm/solana-config.yml'
```

Alias-ul rulează `solana` cu propriul fișier de configurare. Rămâi în același terminal sau repetă alias-ul într-unul nou.

### Pasul 1: Îndreaptă uneltele Solana spre testnet {#step-config}

```bash
qsol config set --url https://svm-testnet.qore.host
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
qsol epoch-info
```

Prima linie salvează adresa RPC în `solana-config.yml`. A doua cere nodului versiunea. Ar trebui să vezi `solana-core` `1.18.0-qorechain`, chain id-ul `qorechain-diana` și hash-ul genesis `6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj` (HTTP 200). A treia afișează slotul curent, care este egal cu înălțimea blocului (aproximativ 10,57 milioane la 22 noiembrie 2026).

Parametrii lane-ului decid ce încape. Citește-i o dată:

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Ar trebui să vezi `"enabled":true` și limitele testnet-ului live: `max_program_size` 10.485.760, `compute_budget_max` 1.400.000, `lamports_per_byte` 3.480, `max_cpi` 4. Dacă `enabled` este `false`, lane-ul este închis și nimic de mai jos nu poate funcționa.

Endpoint-ul public nu servește websocket (o actualizare websocket a primit HTTP 405 la 22 noiembrie 2026), deci dă `--use-rpc` comenzilor care confirmă o tranzacție (`solana program deploy`, `write-buffer`) și lasă unealta să interogheze prin HTTP simplu. Anchor îl acceptă după o liniuță dublă.

### Pasul 2: Creează două perechi de chei Solana {#step-keys}

```bash
solana-keygen new --no-bip39-passphrase --outfile window.json
solana-keygen new --no-bip39-passphrase --outfile deployer.json
solana-keygen pubkey window.json
solana-keygen pubkey deployer.json
```

Primele două comenzi scriu fiecare un fișier de pereche de chei (un array JSON de 64 de numere: seed-ul secret de 32 de octeți, apoi cheia publică). Ultimele două afișează cheile publice ca text base58. Ar trebui să vezi două adrese diferite, de 32 până la 44 de caractere. Numește-le `WINDOW_PUBKEY` și `DEPLOYER_PUBKEY`.

De ce două chei. **Cheia ferestrei** va acționa o scurtă perioadă pentru contul tău Native. Ea nu ține nimic; cheltuiește QOR-ul tău în interiorul ferestrei. **Cheia de implementare** este o cheie Solana obișnuită. O alimentezi din fereastră, iar de acolo înainte ea implementează, actualizează și deține programul fără nicio fereastră. Nu folosi cheia ferestrei ca autoritate de upgrade: programul înregistrează contul tău Native ca autoritate, iar `solana` refuză un upgrade semnat de o cheie care nu este autoritatea înregistrată.

Setează cheia de implementare ca semnatar implicit al configurației tale Solana:

```bash
qsol config set --keypair ~/qore-svm/deployer.json
```

### Pasul 3: Înregistrează-ți cheia post-cuantică {#step-pqc}

Sari peste acest pas dacă `qorechaind query pqc account <your qor address>` arată deja o cheie. Altfel, pe o mașină cu `qorechaind` de lansare:

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc gen-key mykey-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mykey-mldsa \
  --from mykey --chain-id $QCHAIN --node $QNODE --gas 600000 --fees 60000uqor -y
qorechaind query pqc account <your qor address> --node $QNODE
```

`gen-key` creează cheia ML-DSA-87 și își afișează cheia publică în hex. `register-key-v2` o pune pe contul tău, cu o dovadă de posesie. Interogarea ar trebui să arate cheia înregistrată. Aceasta este singura tranzacție pe care un cont nou o poate semna doar cu cheia clasică. Explicația completă, inclusiv cum faci backup cheii, este în [Semnarea post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration).

### Pasul 4: Construiește dovada cheii {#step-proof}

Dovada este o semnătură Ed25519 a cheii ferestrei peste acest text exact, codat UTF-8, fără spații și fără newline la final:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>
```

Pentru o cheie care a deschis înainte una sau mai multe ferestre, nonce-ul `N` urmează după încă un `|`:

```text
qorechain-svm-window-key-v1|<chain-id>|<your qor address>|<WINDOW_PUBKEY>|<N>
```

`N` este numărul de ferestre deja deschise cu o dovadă pentru acea cheie, scris zecimal, fără semn și fără zerouri la început. Pentru o cheie nouă, `N` este 0 și nu există sufix. Semnătura este Ed25519 simplu (RFC 8032): fără prehash, fără context și fără antetul de mesaj off-chain Solana, deci un portofel trebuie să semneze octeții UTF-8 expuși.

Nu construi textul de mână. Cere-l lanțului:

```bash
curl -s "https://api-testnet.qore.host/qorechain/pqc/v1/svm_window_key_proof/<WINDOW_PUBKEY>?sender=<your qor address>"
```

Răspunsul conține nonce-ul și textul exact:

```json
{"svm_pubkey":"9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","nonce":"0","key_proof_required":true,"sign_bytes":"qorechain-svm-window-key-v1|qorechain-diana|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj","chain_id":"qorechain-diana"}
```

Acesta este răspunsul live din 22 noiembrie 2026 pentru o adresă exemplu. Semnează `sign_bytes` cu cheia ferestrei. Scriptul de mai jos face ambii pași, folosind doar Node.js (salvează-l ca `keyproof.mjs`):

```js
// node keyproof.mjs <solana-keypair.json> <your qor address>
import { readFileSync } from "node:fs";
import { createPrivateKey, sign } from "node:crypto";

const REST = "https://api-testnet.qore.host";
const [keypairPath, sender] = process.argv.slice(2);

// A solana-cli keypair file: JSON array of 64 bytes, the 32-byte seed first, then the public key.
const bytes = Uint8Array.from(JSON.parse(readFileSync(keypairPath, "utf8")));
const seed = bytes.slice(0, 32);

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
const pubkey = base58(bytes.slice(32));

// The chain knows its id and the key's nonce, so it gives the exact text.
const url = `${REST}/qorechain/pqc/v1/svm_window_key_proof/${pubkey}?sender=${sender}`;
const info = await (await fetch(url)).json();
console.log("nonce:", info.nonce);
console.log("text to sign:", info.sign_bytes);

// Pure Ed25519 over the UTF-8 bytes of the text.
const pkcs8 = Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]);
const key = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" });
const proof = sign(null, Buffer.from(info.sign_bytes, "utf8"), key);
console.log("svm_key_proof (hex):", proof.toString("hex"));
```

```bash
node keyproof.mjs window.json <your qor address>
```

Ar trebui să vezi `nonce: 0`, textul și un șir hex de 128 de caractere. Păstrează șirul hex. Este valid pentru **o singură fereastră** și doar pentru acest expeditor, această cheie și acest lanț.

**Verifică-ți codul cu un exemplu publicat.** Chain id `qorechain-diana`, expeditor `qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d` (20 de octeți de `0x11`), nonce 0:

| Câmp | Valoare |
| ----- | ----- |
| Cheie publică (base58) | `9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Cheie publică (hex) | `79b5562e8fe654f94078b112e8a98ba7901f853ae695bed7e0e3910bad049664` |
| Mesaj (131 de octeți) | `qorechain-svm-window-key-v1\|qorechain-diana\|qor1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg34kqp8d\|9C6hybhQ6Aycep9jaUnP6uL9ZYvDjUp1aSkFWPUFJtpj` |
| Semnătură (hex) | `786b449dcd4b85c2225819c9ac993fbe97a2cfdce7f9ffba07e6895fad0b9b8d3a0634aae5b21d28d366590b3858c7085c8c856a90770fd919ee1bff728b0801` |

Cu nonce 1, mesajul are 133 de octeți și se termină în `|1`. Scriptul de mai sus a reprodus această semnătură la 22 noiembrie 2026 de la cheia corespunzătoare. Dacă codul tău produce alți octeți pentru aceleași intrări, cauzele obișnuite sunt un newline la final, un prehash, antetul off-chain Solana sau un nonce cu valoare greșită.

Nu trebuie să rulezi scriptul: comanda din pasul următor poate semna singură cu fișierul de pereche de chei (`--svm-keypair`). Folosește scriptul când cheia se află în altă parte, de exemplu într-un portofel care poate semna un mesaj simplu, și dă rezultatul lui cu `--svm-key-proof`.

### Pasul 5: Deschide fereastra {#step-open}

Construiește tranzacția, apoi adaugă semnătura post-cuantică. Acest exemplu deschide o fereastră de 3.600 de blocuri (aproximativ 85 de minute), până la 10 tranzacții și 10 QOR în total (valoare plus comisioane), limitată la programul System (transferuri) și la loader (implementări):

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana
SYS=11111111111111111111111111111111
LOADER=BPFLoaderUpgradeab1e11111111111111111111111

qorechaind tx pqc open-svm-window <WINDOW_PUBKEY> 3600 10 10qor \
  --allowed-programs $SYS,$LOADER \
  --svm-keypair ~/qore-svm/window.json \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-open.json

qorechaind tx pqc cosign window-open.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Prima comandă construiește `window-open.json`. Argumentele poziționale sunt cheia publică Solana, numărul de blocuri, numărul de tranzacții și valoarea. Ea citește nonce-ul din lanț și semnează dovada cheii cu `window.json`. A doua comandă adaugă semnătura ta ML-DSA-87 și trimite tranzacția. Ar trebui să vezi un hash de tranzacție și codul 0.

Pentru a folosi dovada din script, înlocuiește `--svm-keypair ...` cu `--svm-key-proof <hex from Step 4>`. Dacă nu dai niciunul dintre indicatori, comanda refuză și afișează textul exact de semnat. Dacă cheia a deschis ferestre înainte, comanda citește singură nonce-ul; cu `--svm-key-proof` îl poți fixa cu `--svm-key-nonce <N>`.

Citește fereastra înapoi:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/svm_window/<your qor address>
qorechaind query pqc svm-window <your qor address> --node $QNODE
```

Ar trebui să vezi `"found":true` și `"live":true`, cu `max_txs`, `used_txs`, `max_value`, `used_value`, `remaining_blocks`, `remaining_txs`, `remaining_value`, `allowed_programs` și `key_proven` `true`. O poți citi și după cheia Solana: `GET /qorechain/pqc/v1/svm_window_by_key/<WINDOW_PUBKEY>`. Câmpurile `key_proof_required`, `key_usable` și `key_proof_nonce` (următoarea valoare de semnat) sunt și ele acolo.

Lista de programe numește programul System și loader-ul pentru că aceasta este combinația testată. În acest ghid, cheia ferestrei doar transferă, iar cheia de implementare implementează. Dacă vreodată lași cheia ferestrei să plătească direct o implementare, lista trebuie să numească ambele programe.

### Pasul 6: Alimentează cheia de implementare {#step-fund}

Cât timp fereastra este deschisă, cheia ferestrei cheltuiește QOR-ul tău. Trimite 5 QOR către cheia de implementare:

```bash
qsol balance <WINDOW_PUBKEY>
qsol transfer <DEPLOYER_PUBKEY> 5 --keypair ~/qore-svm/window.json --allow-unfunded-recipient
qsol balance <DEPLOYER_PUBKEY>
```

Prima linie arată soldul tău Native așa cum îl vede cheia ferestrei (în „SOL”, citește QOR). A doua trimite 5 QOR; indicatorul `--keypair` face din cheia ferestrei semnatarul pentru această singură comandă, iar `--allow-unfunded-recipient` este necesar pentru că cheia de implementare nu ține încă nimic. A treia ar trebui să arate `5 SOL`, adică 5 QOR. Transferul costă contul tău 5,045 QOR în total: cei 5 QOR plus comisionul de bază de 0,045 QOR, iar contoarele ferestrei (`used_txs` 1, `used_value` 5.045.000) o arată.

Dacă este refuzat cu `this node relays no Solana transactions`, vezi [Trimiterea fără gateway-ul public](#relay).

### Pasul 7: Construiește un program mic {#step-build}

```bash
cargo init --lib hello
cd hello
```

Înlocuiește `Cargo.toml` cu:

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.2"
```

Înlocuiește `src/lib.rs` cu:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    msg!("hello from QoreChain, {} data bytes", data.len());
    Ok(())
}
```

```bash
cargo build-sbf
ls -l target/deploy
```

Aceasta compilează programul pentru SBF. Ar trebui să vezi `hello.so` (aproximativ 19 KB) și `hello-keypair.json`, cheia a cărei adresă devine id-ul programului. Avertismentele compilatorului despre `unexpected cfg` sunt inofensive. Programul scrie o linie de log și nu face nimic altceva.

### Pasul 8: Implementează {#step-deploy}

```bash
qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc
```

Aceasta scrie programul în aproximativ 20 de tranzacții mici și apoi îl implementează. `solana` estimează mai întâi costul și îți verifică soldul: pentru build-ul de 18.896 de octeți a afișat o cheltuială de 0,133 QOR (chirie) și un comision de 1,035 QOR la 22 noiembrie 2026, adică 23 de tranzacții la 0,045 QOR. Ar trebui să închei cu `Program Id: <address>`. Verifică:

```bash
qsol program show <program id>
```

Ar trebui să vezi id-ul programului, loader-ul (`BPFLoaderUpgradeab1e11111111111111111111111`), o adresă ProgramData, **autoritatea** (cheia ta de implementare), slotul implementării și lungimea datelor. Dacă ai început implementarea și se oprește la jumătate, `solana` afișează o frază de recuperare de 12 cuvinte pentru cheia temporară a buffer-ului. Păstrează-o până se termină implementarea: cu ea reiei același buffer dând perechea de chei recuperată următorului `program deploy` sau `write-buffer`, și poți închide buffer-ul ca să-i recuperezi chiria.

Pentru un program construit cu Anchor, adaugă `--skip-feature-verify` la `solana program deploy`, ca în rulările dinaintea lansării.

#### Cu Anchor {#anchor}

```bash
anchor init counter
cd counter
anchor build
anchor deploy --provider.cluster https://svm-testnet.qore.host \
  --provider.wallet ~/qore-svm/deployer.json -- --use-rpc
```

`anchor build` compilează programul șablon, iar `anchor deploy` îl implementează la id-ul de program din `declare_id!`. Un program șablon are aproximativ 130 KB, adică aproximativ 130 de tranzacții de scriere la 0,045 QOR, deci alimentează mai întâi cheia de implementare cu cel puțin 10 QOR. În rularea dinaintea lansării, un program de 128 KB a costat aproximativ 6,8 QOR, în cea mai mare parte comisioanele de scriere, cu chiria întorcându-se la închidere. Un al doilea `anchor deploy` după o schimbare de cod actualizează programul. Anchor sare peste încărcarea IDL pentru o adresă locală; încărcarea IDL pe testnet nu a fost testată.

### Pasul 9: Apelează programul {#step-call}

`solana` nu poate apela un program arbitrar, așa că folosește un script scurt web3.js. Într-un folder gol:

```bash
npm init -y
npm install @solana/web3.js@1
```

Salvează ca `call.cjs`:

```js
// node call.cjs <payer keypair.json> <program id> [data as text]
const fs = require("fs");
const { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } = require("@solana/web3.js");

const RPC = "https://svm-testnet.qore.host";
const [payerPath, programId, text = "hi"] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(payerPath, "utf8"))));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const conn = new Connection(RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(
    new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: Buffer.from(text) }),
  );
  tx.sign(payer);

  const signature = await conn.sendRawTransaction(tx.serialize()); // preflight runs on the gateway
  console.log("signature:", signature);

  // The public endpoint serves no websocket, so poll instead of confirmTransaction.
  for (;;) {
    const { value } = await conn.getSignatureStatuses([signature]);
    if (value[0]) { console.log("status:", value[0].confirmationStatus, "err:", JSON.stringify(value[0].err)); break; }
    if ((await conn.getBlockHeight()) > lastValidBlockHeight) throw new Error("blockhash expired, build and send again");
    await sleep(1500);
  }
  const t = await conn.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  console.log("fee (lamports):", t.meta.fee);
  console.log((t.meta.logMessages || []).join("\n"));
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
```

```bash
node call.cjs ~/qore-svm/deployer.json <program id> "hello"
```

Scriptul construiește o instrucțiune pentru programul tău, o semnează cu cheia de implementare, o trimite, interoghează până când semnătura are un status și afișează logul programului. Plătitorul de comision este cheia de implementare, deci nu este nevoie de nicio fereastră. Ar trebui să vezi o semnătură, `status: finalized err: null`, `fee (lamports): 45000000` și loguri ca acestea (forma vine din rularea dinaintea lansării; mesajul este al programului tău):

```text
Program <program id> invoke [1]
Program log: hello from QoreChain, 5 data bytes
Program <program id> consumed ... compute units
Program <program id> success
```

### Pasul 10: Citește rezultatul {#step-read}

| Vrei | Comandă sau apel |
| -------- | --------------- |
| Statusul unei tranzacții | `qsol confirm -v <signature>` sau `getSignatureStatuses` |
| Logurile, comisionul și schimbările de sold | `getTransaction` cu `maxSupportedTransactionVersion: 0` (scriptul de mai sus) |
| Programul și autoritatea lui | `qsol program show <program id>` |
| Toate programele cheii de implementare | `qsol program show --programs` |
| Un cont de date | `qsol account <address>` sau `getAccountInfo` |
| Fereastra ta, după cont sau după cheie | `GET /qorechain/pqc/v1/svm_window/<address>` și `.../svm_window_by_key/<pubkey>` |

O tranzacție care eșuează într-un bloc (de exemplu pentru că ai sărit peste preflight-ul gateway-ului cu `--skip-preflight`) își păstrează totuși semnătura și își plătește comisionul, iar efectele ei sunt anulate. În rularea dinaintea lansării, un transfer peste limita de valoare a ferestrei, trimis cu `--skip-preflight`, a ajuns în bloc și a eșuat cu `Error processing Instruction 0: generic instruction error`, iar transferul a fost anulat. Fără `--skip-preflight` este refuzat mai devreme, la gateway, cu `-32002 ... SVM authorisation window exhausted`.

### Pasul 11: Actualizează, predă, extinde și închide {#step-admin}

Toate acestea folosesc cheia de implementare ca semnatar și nu au nevoie de fereastră.

| Sarcină | Comandă |
| ---- | ------- |
| Actualizare după o schimbare de cod | `qsol program deploy target/deploy/hello.so --program-id target/deploy/hello-keypair.json --use-rpc` |
| Mărește zona de date cu N octeți | `qsol program extend <program id> N` |
| Predă upgrade-urile altei chei | `qsol program set-upgrade-authority <program id> --new-upgrade-authority <new.json>` |
| Fă programul permanent | `qsol program set-upgrade-authority <program id> --final` |
| Scrie un buffer fără a implementa, listează buffer-ele | `qsol program write-buffer x.so --use-rpc`, apoi `qsol program show --buffers` |
| Închide un buffer sau închide programul și ia chiria înapoi | `qsol program close <buffer or program id>` (un program cere și `--bypass-warning`) |

Un upgrade făcut de orice cheie care nu este autoritatea este refuzat. După `set-upgrade-authority`, vechea autoritate este refuzată, iar cea nouă poate actualiza. După `--final`, un upgrade este refuzat cu un mesaj că programul nu mai este upgradeable. Un program închis nu mai poate fi apelat, iar `program show` spune că a fost închis.

### Pasul 12: Închide fereastra {#step-close}

Poți închide o fereastră când ai terminat și trebuie s-o închizi imediat dacă crezi că cheia Solana a fost expusă. Tot ce mai admitea fereastra este refuzat din blocul următor:

```bash
qorechaind tx pqc close-svm-window --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window-close.json
qorechaind tx pqc cosign window-close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Citește fereastra din nou: nu ar trebui să mai fie activă, iar `qsol balance <WINDOW_PUBKEY>` ar trebui să arate din nou 0. Cheia ferestrei nu îți mai poate muta QOR-ul. Cheia de implementare, programul și fondurile create prin fereastră rămân ale tale.

Pentru a deschide o fereastră nouă pentru aceeași cheie, rulează din nou Pasul 4: nonce-ul este acum mai mare, iar o dovadă făcută pentru fereastra veche este refuzată cu `expected_nonce`.

## Trimiterea fără gateway-ul public {#relay}

Gateway-ul public de la `svm-testnet.qore.host` a refuzat să retransmită la 22 noiembrie 2026 (vezi caseta de la începutul paginii). Există două moduri de a trimite până când retransmite.

**O singură tranzacție prin linia de comandă.** Orice cont nativ care ține QOR și are o cheie post-cuantică înregistrată poate transporta o tranzacție Solana pe care ai semnat-o. Construiește și semnează mai întâi tranzacția Solana, de exemplu cu web3.js, și afișează-o în base64 (`tx.serialize().toString("base64")`). O tranzacție este valabilă aproximativ 3,5 minute de la blockhash-ul pe care îl folosește. Apoi:

```bash
qorechaind tx svm solana-tx <base64 transaction> --from mykey \
  --chain-id $QCHAIN --node $QNODE --gas <GAS> --fees <FEES>uqor --generate-only > relay.json
qorechaind tx pqc cosign relay.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Alege `--gas` și `--fees` dintr-o rulare de probă: rulează mai întâi `tx pqc cosign` cu `--dry-run` (afișează o estimare de gaz și nu trimite nimic), apoi folosește estimarea plus 30% ca `<GAS>` și o taxă de cel puțin `<GAS>` ori 0,1 uqor ca `<FEES>`. Un transfer simplu are nevoie de aproximativ 300.000 până la 400.000 de gaz, iar un deploy sau o propunere care conține cod are nevoie de mult mai mult.

Măsurat pe testnet: un transfer simplu relayat astfel a folosit 327.570 de gaz, deci folosește `--gas 400000 --fees 40000uqor`; cu 300.000 rămâi fără gaz. Plătitorul este taxat și cu taxa Solana pe care a semnat-o (45.000.000 lamports, 0,045 QOR).

Contul din `--from` este relayer-ul. El semnează transportorul și îi plătește gazul, iar plătitorul de comision Solana îl rambursează. Relayer-ul nu primește nicio autoritate asupra tranzacției Solana. Comisionul transportorului trebuie acoperit de ce plătește tranzacția Solana: 45.000 uqor pentru o semnătură. Este practic pentru un transfer sau un apel, nu pentru o implementare cu multe tranzacții de scriere. Această cale nu a fost rulată pe testnet-ul live pentru această pagină.

**Propriul tău gateway.** Un nod care urmează testnet-ul și rulează binarul v3.2.9 servește JSON-RPC Solana pe portul 8899 și retransmite când secțiunea `[svm-rpc]` din `app.toml` numește un relayer: `relayer-key` (un cont alimentat din keyring-ul nodului sau mai multe, separate prin virgulă), `relayer-pqc-key` (cheile lor ML-DSA-87 din folderul `pqc` al nodului) și `relayer-keyring-backend`. Cu `relayer-key` gol, `sendTransaction` este refuzat, ca pe endpoint-ul public astăzi. Lasă `relayer-fee` gol: relayer-ul stabilește atunci prețul fiecărui transportor din ce plătește tranzacția Solana, deci nu pierde niciodată bani. Copiază întregul folder `lib/` din bundle-ul de lansare. Această configurare nu a fost rulată pentru această pagină; vezi [Rularea unui nod](/developer-guide/running-a-node) pentru nodul însuși.

## Limite de luat în calcul {#limits}

* **Cota de retransmitere.** O tranzacție Solana trimisă printr-un gateway se numără pentru plătitorul ei de comision: 600 per 30 de blocuri la valoarea implicită, ceea ce este sub un minut. O implementare mare de la o singură cheie o poate depăși (un program de 1 MB înseamnă aproximativ 1.100 de scrieri). Scrierile refuzate nu costă nimic. Scrie mai întâi buffer-ul cu `qsol program write-buffer`, așteaptă un minut și rulează din nou cu același buffer dacă se oprește, apoi implementează din buffer cu `--buffer`, sau plătește scrierile buffer-ului și implementarea de la plătitori de comision diferiți.
* **Partajarea echitabilă a gateway-ului.** Un gateway păstrează o parte din capacitate pentru clienții care au trimis puține tranzacții și împarte restul în mod egal între rețelele de clienți active. Dacă ești refuzat cu un mesaj de partajare echitabilă (codul `-32005`), așteaptă un minut sau folosește alt gateway.
* **Tranzacția trebuie să ajungă în bloc înainte să expire blockhash-ul ei** (150 de sloturi). `solana` retrimite pentru tine; un script ar trebui să facă la fel.
* **O tranzacție are cel mult 1.232 de octeți, cu cel mult 64 de conturi,** ca în Solana. Mesajele legacy și cele de versiune 0 sunt acceptate.
* **Programe și conturi:** 10 MiB fiecare; stivă de 32 KiB și heap de 256 KiB per cadru.
* **Limitele de custodie** din [Lane-ul SVM (v3.2.8)](/developer-guide/svm-lane-v328#custody) se aplică în continuare: un depozit poate fi refuzat cu `svm custody cap exceeded` (codul 23) când fondul SVM este la plafon.
* **Nume în lista ferestrei.** `--allowed-programs` primește id-uri de program base58, cel mult 16, fiecare o singură dată. Un domeniu se aplică instrucțiunilor de nivel superior ale tranzacției: un program listat care apelează alte programe poartă semnătura ta mai departe, deci listează doar programe în care ai încredere în întregime.
* **Adrese.** Un mesaj nou din v3.2.9 refuză o adresă bech32 care nu este în forma ei canonică cu litere mici. Trimite forma pe care o produce `toBech32`.

## Depanare {#troubleshooting}

Textele marcate „live” au fost văzute pe testnet-ul live la 22 noiembrie 2026. Celelalte sunt mesajele proprii ale lanțului și ale gateway-ului, așa cum au apărut în rulările dinaintea lansării.

| Ce vezi | Ce înseamnă | Ce faci |
| ------------ | ------------- | ---------- |
| `this node relays no Solana transactions ([svm-rpc] relayer-key is not set)` (cod JSON-RPC `-32603`, live) | Gateway-ul nu are cont de relayer | Folosește [propriul gateway sau retransmiterea din linia de comandă](#relay) sau așteaptă operatorii |
| `Error: Account <key> has insufficient funds for spend (X SOL) + fee (Y SOL)` (live, de la `solana`) | Cheia nu ține nimic. Citește SOL ca QOR | Deschide fereastra și alimentează cheia sau deschide fereastra și folosește cheia ferestrei ca semnatar |
| Simularea `InsufficientFundsForFee`, log `fee payer ... has no account: insufficient fee` (live) | Aceeași cauză, văzută dintr-o simulare | Aceeași remediere |
| `invalid solana transaction: no signatures`, `truncated: need 2 bytes at 1` (cod `-32602`, live) | Octeții nu sunt o tranzacție Solana semnată | Trimite tranzacția completă semnată, în base64 sau base58 |
| HTTP 405 la o actualizare websocket (live) | Endpoint-ul public nu servește websocket | Adaugă `--use-rpc` la `solana program deploy` și `write-buffer`; în scripturi interoghează cu `getSignatureStatuses` |
| `-32002 ... insufficient priority fee ...` | Tranzacția plătește mai puțin decât costă transportorul ei | Setează prețul și limita de unități ComputeBudget din `data` a erorii; vezi [Comisioane](#fees) |
| `-32002 ... SVM authorisation window exhausted` | Fereastra a rămas fără blocuri, tranzacții sau valoare, sau tranzacția ar depăși valoarea | Citește fereastra, deschide una nouă cu valoare mai mare sau mai multe tranzacții |
| `no open SVM authorisation window` (codespace `pqc`, cod 341) | Cheia nu are fereastră activă | Deschide una (Pasul 5) |
| Deschidere refuzată cu codul 343 și `expected_nonce=<N>` | Dovada a fost semnată peste alt nonce, de exemplu o dovadă veche | Citește din nou ruta nonce-ului (Pasul 4), semnează din nou |
| `the key proof does not verify for <key>, sender <qor address>, chain <id>` (CLI) | Semnătura nu se potrivește cu textul | Semnează exact `sign_bytes` de pe ruta nonce-ului, cu cheia și expeditorul corecți |
| `--svm-keypair holds the key X, not Y` (CLI) | Fișierul de pereche de chei nu este cheia pe care ai numit-o | Folosește perechea de chei care se potrivește cu cheia base58 |
| `the window needs the proof that you hold the Solana key` (CLI) | Nu ai dat nici `--svm-keypair`, nici `--svm-key-proof` | Dă unul dintre ele; mesajul afișează textul de semnat |
| `blocks must be between 1 and 17280`, `max_txs must be between 1 and 1000`, `max_value must be positive`, `allowed_programs lists N programs, the maximum is 16` | O limită a ferestrei este în afara intervalului | Folosește valori din tabelul de la [Fereastra](#window) |
| `svm_pubkey ... is not a valid ed25519 public key` sau `... is a native account address, not an ed25519 key` | Cheia este o adresă de program sau una dintre adresele tale QoreChain | Folosește o pereche de chei creată cu `solana-keygen` |
| `sender sol:<payer> has sent 600 transactions in the last 30 blocks` | Cota de retransmitere a unui plătitor de comision | Așteaptă un minut, reia cu același buffer; vezi [Limite](#limits) |
| `-32005` cu `fair share of the relayer quota` | Gateway-ul își împarte capacitatea | Reîncearcă după un minut |
| `-32020 node is starting, no committed state` | Nodul nu are încă stare | Reîncearcă în câteva secunde |
| `node busy: the carrier could not be measured now, retry` | Gateway-ul nu a putut stabili prețul transportorului în acest moment | Reîncearcă |
| `Transaction simulation failed: Blockhash not found` | Blockhash-ul este mai vechi de 150 de sloturi sau necunoscut | Ia un blockhash proaspăt, semnează și trimite din nou |
| `Transaction simulation failed: This transaction has already been processed` | Aceeași tranzacție semnată a fost văzută înainte | Verifică `getSignatureStatuses`; nu o trimite din nou |
| O tranzacție Solana este refuzată cu `cannot approve a delegate`, `cannot hand over the ownership`, `cannot hand over the close authority` sau `cannot change the mint or freeze authority`, cu `the grant would outlive the window` | O fereastră cu domeniu implicit refuză grant-urile de durată pentru tokenuri | Semnează această acțiune cu propria cheie post-cuantică pe lane-ul Native sau deschide o fereastră a cărei listă de programe numește programul de token (vezi [Limitele cunoscute](#window-limits)) |
| `SVM module is disabled` (cod 11) | Lane-ul este închis. Aceasta este starea de pe mainnet | Folosește testnet-ul |
| `svm custody cap exceeded` (cod 23) | Fondul SVM este la plafon | Reîncearcă mai târziu sau cu o sumă mai mică |
| `solana program deploy` pentru un program construit cu Anchor este refuzat de client din cauza feature-urilor programului | Unealta verifică feature-urile ELF | Adaugă `--skip-feature-verify` |
| Un upgrade făcut de cheia ferestrei este refuzat de `solana` | Autoritatea înregistrată este contul tău Native, nu cheia | Implementează cu o cheie de implementare separată, ca în acest ghid |
| Deschiderea sau închiderea ferestrei refuzată sub authz, group sau un contract | Ferestrele se deschid și se închid doar prin propria ta semnătură | Trimite mesajul ca mesaj de nivel superior din contul tău |

## Ce a fost verificat {#tested}

| Verificare | Unde și când | Rezultat |
| ----- | -------------- | ------ |
| `GET /qorechain/svm/v1/params` și `/cluster_info` | testnet live, 22 noiembrie 2026 | `enabled` și `execution_enabled` ambele `true` |
| `getHealth`, `getVersion`, `getGenesisHash`, `getLatestBlockhash` (base58), `getMinimumBalanceForRentExemption(1024)` | testnet live, 22 noiembrie 2026 | `ok`; `1.18.0-qorechain`; hash-ul genesis de mai sus; blockhash base58 de 44 de caractere; 8.017.920 de lamports |
| `getFeeForMessage` și `simulateTransaction` pentru un transfer cu o semnătură | testnet live, 22 noiembrie 2026 | comision 45.000.000 de lamports (0,045 QOR); un plătitor nealimentat dă `InsufficientFundsForFee` |
| Ruta nonce-ului dovezii cheii și rutele ferestrei | testnet live, 22 noiembrie 2026 | nonce 0, `sign_bytes` ca în Pasul 4; `found` `false` pentru o adresă fără fereastră |
| Scriptul dovezii cheii din Pasul 4 față de exemplul publicat | ruta testnet-ului live, 22 noiembrie 2026 | semnătură identică cu tabelul |
| Construirea programului cu `cargo build-sbf` (4.0.0, platform tools v1.53) | mașină locală, 22 noiembrie 2026 | `hello.so` de 18.896 de octeți |
| Estimarea costului `solana program deploy` de la o cheie nealimentată | testnet live, 22 noiembrie 2026 | refuzat de client, cu cheltuială 0,133 QOR și comision 1,035 QOR |
| `sendTransaction` pentru un transfer bine format | testnet live, 22 noiembrie 2026 | refuzat: `this node relays no Solana transactions` |
| Actualizare websocket pe endpoint-ul public | testnet live, 22 noiembrie 2026 | HTTP 405 |
| Deschidere fereastră, `solana transfer` de la cheia ferestrei, implementare, apel, upgrade, setare autoritate, extindere, închidere, `anchor deploy` și upgrade | rețea locală de test înainte de lansare, `solana-cli` 4.0.2, `anchor-cli` 1.2.2, `@solana/web3.js` 1.99 | reușit |
| Aceiași pași pe testnet-ul live | nerulat: gateway-ul public nu a retransmis nimic la 22 noiembrie 2026, iar pentru această pagină nu s-a cheltuit QOR de test | nerulat |

## Mainnet {#mainnet}

Mainnet rulează o versiune fără nimic din toate acestea: lane-ul SVM este oprit acolo, endpoint-urile lui SVM publice sunt doar pentru citire, apelurile între VM-uri rămân în pauză, iar încărcarea contractelor rămâne doar prin guvernanță. Nu deschide ferestre, nu implementa și nu trimite tranzacții Solana pe mainnet; planifică doar pe testnet.

## Vezi și {#see-also}

* [Lane-ul SVM (v3.2.8)](/developer-guide/svm-lane-v328): starea lane-ului, chiria, limitele de custodie și cheia post-cuantică a unui portofel SVM.
* [Dezvoltare SVM](/developer-guide/svm-development): privire de ansamblu asupra lane-ului și serverul JSON-RPC.
* [JSON-RPC compatibil Solana](/api-reference/json-rpc-solana-compatible): lista metodelor.
* [Semnarea post-cuantică](/developer-guide/post-quantum-signing): înregistrarea și folosirea cheii tale ML-DSA-87.
* [Referință pentru fereastra de autorizare EVM](/developer-guide/evm-window-reference): aceeași idee pentru chei de tip Ethereum.
* [Interoperabilitate între VM-uri](/developer-guide/cross-vm-interoperability): apeluri între SVM, EVM și QoreChain Native.
* [Istoricul versiunilor](/appendix/version-history#v329): ce a schimbat v3.2.9.
