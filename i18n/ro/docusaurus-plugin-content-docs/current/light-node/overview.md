---
slug: /light-node/overview
title: Prezentare generală a nodului light
sidebar_label: Prezentare generală
sidebar_position: 1
---

# Prezentare generală a nodului light

**QoreChain Light Node** este un client mic care urmărește o rețea QoreChain fără a rula un nod complet și care se poate înregistra pe lanț ca nod light pentru a participa la **partea de 3% din recompense destinată nodurilor light**. Este pentru operatorii care vor o modalitate cu costuri reduse de a urmări lanțul și de a câștiga din acea parte, precum și pentru cei care vor doar o a doua opinie despre cel mai recent hash de bloc al lanțului, fără a avea încredere într-un singur server RPC. Este un singur binar autonom, în două ediții construite din același cod: **SX** (`lightnode-sx`, un daemon fără interfață grafică, cu linie de comandă, pentru servere) și **UX** (`lightnode-ux`, același daemon plus un tablou de bord web local pe `127.0.0.1:8420`). Este lansat sub licența Apache 2.0, iar sursa este publică la `github.com/qorechain/qorechain-lightnode`.

Rularea și sincronizarea unui nod nu necesită licență. Participarea la partea din recompense este un pas separat: necesită o licență `lightnode_operator`, miză delegată către validatori bonded și o înregistrare pe lanț (vezi [Cum accesați](#how-to-access)).

Nodul light are **propria sa linie de versiune**, separată de versiunea de lansare a lanțului. La momentul scrierii (27 octombrie 2026), canalele de lansare ale ambelor rețele conțin nodul light **3.1.12** (lanțul `v3.2.4` pe mainnet, `v3.2.6` pe testnet). Tratați cele două numere ca fiind fără legătură între ele.

## Inovații {#innovations}

Fiecare element de mai jos este un mecanism pe care îl puteți verifica în sursă sau rulând nodul.

- **Semnare hibridă nativă, fără alt software.** Nodul își construiește și își semnează singur tranzacțiile în Go pur (fără CGO, fără biblioteci native, fără `qorechaind`). Fiecare tranzacție poartă o semnătură ML-DSA-87 (FIPS 204) peste corp fără extensia PQC, plus o semnătură secp256k1 peste SignDoc al cărui corp poartă acea extensie. Versiunea formatului de semnare este citită din planurile de upgrade aplicate ale lanțului. Există versiuni pentru Linux, macOS și Windows, pe amd64 și arm64 (din 3.1.8).
- **Un singur set de cuvinte de recuperare dă ambele chei.** `keys add-operator --recover` derivă cheia contului la `m/44'/118'/0'/0/0`, aceeași cale pe care o folosesc `qorechaind` și Keplr. Pentru cheia post-cuantică, fie reconstruiește, din aceleași cuvinte, cheia pe care un portofel a înregistrat-o deja pe acel cont (derivările wallet-adapter și Dashboard, aceleași ca `qorechaind tx pqc recover-key`), fie derivă una nouă, astfel încât cuvintele restaurează și cheia nodului (din 3.1.9).
- **Înregistrarea este o singură comandă, verificată pas cu pas.** `register` verifică licența, atașează cheia post-cuantică (cu o dovadă de posesie acolo unde lanțul o suportă), delegă doar miza care lipsește dacă transmiteți `--delegate-to`, apoi înregistrează. Fiecare pas trebuie să fie într-un bloc înainte să fie trimis următorul. Miza este numărată doar pe validatorii bonded, așa cum o numără lanțul (din 3.1.10).
- **Heartbeat-urile sunt cronometrate după înregistrarea proprie a lanțului.** Daemonul trimite un heartbeat după ce au trecut 1.000 de blocuri de la `last_heartbeat` al nodului, așa cum îl are lanțul, verifică la fiecare 60 de secunde și raportează un heartbeat abia după ce acesta se află într-un bloc. O repornire nu trimite un duplicat și nici nu așteaptă un interval întreg.
- **Verificare prin coroborare a anteturilor între puncte finale.** Nodul preia aceeași înălțime de la punctul final principal și de la fiecare punct final martor configurat și stochează antetul doar dacă toate returnează același hash. Un martor aflat pe aceeași gazdă cu cel principal sau la o adresă `http://` la distanță, în text clar, este refuzat. Modul este înregistrat în jurnal pentru fiecare antet, la nivel de depanare, ca `assurance` (`trusted-single-source` sau `corroborated-across-sources`). Aceasta **nu** este verificare de consens: vezi [Limite](#limits).
- **Auto-actualizare semnată.** Începând cu nodul light 3.1.11, daemonul citește `latest.json` al rețelei sale la fiecare 6 ore. Instalează o versiune nouă doar dacă `v<version>/SHA256SUMS.sig` se verifică drept semnătură Ed25519 făcută de o cheie de lansare încorporată în binar (semnătura leagă rețeaua, versiunea și conținutul `SHA256SUMS`), binarul descărcat se potrivește cu suma sa de control semnată, iar noul binar rulează și raportează exact `v<version>`. Binarul anterior este păstrat ca `<name>.old`, iar nodul repornește pe loc (același proces pe Linux și macOS; pe Windows pornește noul binar, iar cel vechi se oprește). `[update] mode` este `auto` (implicit), `notify` sau `off`; `lightnode-sx update --check` și `lightnode-sx update` fac același lucru manual. Într-un container sau acolo unde folderul binarului nu poate fi scris, nodul doar anunță o versiune (linie de jurnal, `GET /api/update` pe API-ul local și un banner pe tabloul de bord UX).
- **Avertismente care corespund cu ce face lanțul.** Cu `[delegation] rebalance_enabled` activat (implicit), nodul avertizează când un validator căruia îi delegați este în jail, când nu este în setul activ și când miza dvs. bonded scade sub `min_delegated_stake` (1.000 QOR). În toate trei cazurile, lanțul încetează să crediteze nodul fără niciun mesaj. Un avertisment este înregistrat când apare, din oră în oră cât timp durează și o dată când dispare. Un al patrulea avertisment, scorul de reputație al unui validator delegat sub `min_reputation` (implicit `0.5`), citește `GET /qorechain/reputation/v1/validator/<valoper>`: este activ acum pe **testnet** și ajunge pe mainnet doar cu o versiune de lanț ulterioară lui v3.2.5; până când ruta este servită, nodul notează acest lucru o dată și întreabă din nou la fiecare 6 ore.

### De ce să rulați un nod light și cum se citește verificarea prin coroborare {#why-run-a-light-node}

- **Participați la partea din recompense.** Nodurile light înregistrate și active care respectă regulile de miză și de timp de funcționare sunt plătite din partea de 3% descrisă [mai jos](#the-3-light-node-reward-share).
- **Verificați prin coroborare starea lanțului care vi se arată.** Fără martor configurat, nodul înregistrează un avertisment la pornire și raportează `trusted-single-source`: un singur punct final rulat cinstit raportează aceeași valoare ca unul compromis. Adăugați un martor operat independent pentru a trece la `corroborated-across-sources`, care necesită compromiterea simultană a fiecărui punct final configurat pentru a fi păcălit. Valoarea apare pe liniile `synced header` din jurnalul de depanare (setați `log_level = "debug"`); nu este afișată în `status` sau pe tabloul de bord și nimic central nu o poate vedea, deoarece alegerile dvs. RPC sunt locale configurației dvs.
- **Urmăriți rețeaua.** Telemetria acoperă validatorii, consensul, puntea și tokenomica, reîmprospătate la intervale independente.

## Cum se folosește {#how-to-use}

Alegeți o ediție. Ambele citesc același `config.toml`, stochează datele în același director home (`~/.qorechain-lightnode`) și folosesc același keyring.

| Ediție | Binar | Construit pentru | Interfață |
| --- | --- | --- | --- |
| **SX** (Server eXperience) | `lightnode-sx` | Servere fără interfață grafică, automatizare | Daemon plus linie de comandă completă. Vezi [Ediția SX](/light-node/sx-edition). |
| **UX** (User eXperience) | `lightnode-ux` | Utilizare desktop și de operator | Aceleași comenzi plus un tablou de bord web local. Vezi [Ediția UX](/light-node/ux-edition). |

**1. Descărcați și verificați** (se arată Linux amd64; `jq` este folosit pentru a citi manifestul). Luați versiunea din manifestul rețelei țintă:

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)
F=lightnode-sx-linux-amd64          # see the artifact list in latest.json for other platforms
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -        # macOS: shasum -a 256 -c -
chmod +x $F
```

Pe Windows, comparați `certutil -hashfile lightnode-sx-windows-amd64.exe SHA256` cu valoarea din manifest. `SHA256SUMS` specific versiunii trebuie să se potrivească cu binarul specific versiunii, așa că luați-le pe amândouă din calea `v$V`.

**2. Configurați și înregistrați.** Secvența de mai jos este cea pe care o arată Dashboard; a fost rulată pe un devnet, pe testnet (repetiție la 18 octombrie 2026) și pentru primul nod de pe mainnet (20 octombrie 2026).

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

./lightnode-sx onboard                  # PQC self-test, chain RPC (see below), node key
./lightnode-sx keys add-operator --recover   # recovery words on standard input; no flag = new account, 24 words shown once
./lightnode-sx register --delegate-to qorvaloper1...   # needs the licence and QOR in the operator account
./lightnode-sx start
./lightnode-sx status
```

RPC-ul lanțului pentru `onboard` este `https://rpc.qore.host` (mainnet) sau `https://rpc-testnet.qore.host` (testnet). Pentru ediția UX folosiți `lightnode-ux` cu aceleași comenzi și deschideți `http://127.0.0.1:8420`. Detalii despre fiecare pas: [Ediția SX](/light-node/sx-edition) și [Înregistrare și licențiere](/light-node/registration-and-licensing).

**3. Păstrați-l actualizat.** Nodul light 3.1.11 și versiunile ulterioare se actualizează singure în afara containerelor (vezi elementul despre auto-actualizare de mai sus). Un nod pe 3.1.10 sau mai vechi trebuie să instaleze 3.1.12 manual o singură dată: descărcați binarul cu versiune ca mai sus și înlocuiți fișierul. Cu Docker, reconstruiți din noua etichetă sursă. Vezi [Ediția SX: actualizare](/light-node/sx-edition#updating).

## Cum accesați {#how-to-access}

| | Mainnet | Testnet |
| --- | --- | --- |
| Lanț | `qorechain-vladi` (lanț `v3.2.4`) | `qorechain-diana` (lanț `v3.2.6`) |
| RPC pentru nod | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| REST pentru interogări | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Versiunea nodului light | 3.1.12 | 3.1.12 |
| Licență | $50, cumpărată pe Dashboard; acordarea este semnată manual, în loturi | Gratuită, în regim self-service: **Nodes & Validators > Light Node**, **Request licence**; semnată automat, de obicei în câteva minute |

**Ce vă trebuie pentru înregistrare**

- Un cont ale cărui cuvinte de recuperare le dețineți (cuvintele dvs., Keplr sau o cheie `qorechaind`), de preferat dedicat nodului. Un portofel custodial din Dashboard nu poate rula un nod decât dacă îi exportați seed-ul.
- O licență `lightnode_operator` activă pe acea adresă (vezi mai jos).
- Cel puțin **1.000 QOR** delegați de la acea adresă către validatori **bonded**, numărați ca total.
- QOR în cont pentru comisionul de înregistrare de **1 QOR** și pentru comisioanele de tranzacție. Un heartbeat costă 0.25 uqor per gaz la limita implicită de 300.000 de gaz, adică 0.075 QOR ca plafon (gaz măsurat folosit: aproximativ 165.000).
- Un computer care rămâne pornit: nodul trebuie să trimită un heartbeat la fiecare 1.000 de blocuri și să mențină cel puțin 80% timp de funcționare pentru a fi plătit.

**Obținerea unei licențe.** Pe Dashboard, deschideți **Nodes & Validators** (intrarea din bara laterală care se numea înainte **Tools**; pagina se află în continuare la `/tools`), alegeți fila **Light Node** și selectați rețeaua în antet. Dashboard necesită autentificare.

- *Mainnet:* introduceți mai întâi adresa `qor1...`, alegeți rețeaua USDT și plătiți $50. Fila arată **Paid, awaiting on-chain grant** până când lanțul confirmă acordarea.
- *Testnet:* nu se vinde nimic. Introduceți adresa `qor1...` sub **Free testnet licence** și selectați **Request licence**. Există o singură cerere per cont și una per adresă. Fila arată "Granted to ..." când licența a ajuns, sau spune că acordarea nu a putut fi semnată și vă permite să cereți din nou.

Puteți verifica o licență și direct: `GET /qorechain/license/v1/check/<address>/lightnode_operator`.

### Starea programului de recompense {#reward-program-status}

:::note Înregistrarea este deschisă
Înregistrarea este deschisă pe mainnet (`qorechain-vladi`, lanțul v3.2.4) și pe testnet (`qorechain-diana`, lanțul v3.2.6). La 27 octombrie 2026 fuseseră acordate șapte licențe `lightnode_operator` pe mainnet și un nod light era înregistrat pe fiecare rețea (`total_registered` este `1` în `GET /qorechain/lightnode/v1/stats` pe ambele). Contabilitatea recompenselor este activă în ambele rețele de la upgrade-ul v3.2.0. Timpul de funcționare este numărat **de la blocul în care nodul dvs. este înregistrat**, deci rularea unui nod înainte nu aduce credit. Începând cu lanțul v3.2.4, limita per nod începe și ea de la înregistrarea proprie a nodului: prima decontare după înregistrare creditează doar ce s-a acumulat de atunci.

Manifestul de lansare (`https://download.qore.host/<net>/lightnode/latest.json`) conține semnalul oficial în câmpul `registration.open`. Pentru starea curentă interogați `GET /qorechain/license/v1/holders/lightnode_operator` și `GET /qorechain/lightnode/v1/stats` la `https://api.qore.host` (mainnet) sau `https://api-testnet.qore.host` (testnet).
:::

## Partea de 3% din recompense pentru nodurile light {#the-3-light-node-reward-share}

Distribuția taxelor QoreChain alocă o **parte fixă de 3% nodurilor light** (parametrul `reward_share`, `0.03`). Vezi [Tokenomică](/architecture/tokenomics) pentru defalcarea completă 37% / 30% / 20% / 10% / 3% (validatori, ars, trezorerie, staker-i, noduri light).

Aceste 3% reprezintă suma plătită în contul de modul al nodurilor light; nu este un drept per nod. La fiecare 100 de blocuri, lanțul creditează fiecărui nod eligibil partea sa ponderată după miză din ceea ce s-a acumulat de la decontarea anterioară, **limitată per nod**. De la lanțul v3.2.3, limita este de **2.000 QOR per nod la 30 de zile** (`max_reward_per_month_per_node`, `2000000000` uqor), proporțională cu timpul de bloc scurs de la decontarea anterioară și scalată după timpul de funcționare al nodului; aceasta este regula `lightnode-monthly-cap`. Înainte de v3.2.3 limita era exprimată per bloc (`max_reward_per_block_per_node`, `1713` uqor), valoare pe care interogarea fondului de recompense încă o raportează. Limita este un plafon, nu o sumă promisă. Tot ce rămâne necâștigat este mutat într-o rezervă pe care o poate elibera doar un vot de guvernanță, astfel încât nu se acumulează niciun fond pentru cine se înregistrează primul. Inspectați împărțirea actuală cu `GET /qorechain/lightnode/v1/reward_pool`.

Pentru a fi eligibil pentru recompense, un nod light trebuie să fie **înregistrat pe lanț, activ** (dovedind starea de funcționare prin heartbeat-uri), să dețină cel puțin miza minimă bonded și să își mențină timpul de funcționare la sau peste minim. Înregistrarea este acoperită în [Înregistrare și licențiere](/light-node/registration-and-licensing); creditarea, revendicarea și monitorizarea sunt acoperite în [Recompense și monitorizare](/light-node/rewards-and-monitoring).

## Unde este publicat {#where-published}

| Ce | Unde | Versiunea curentă |
| --- | --- | --- |
| Manifest de lansare, mainnet | `https://download.qore.host/mainnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, înregistrare deschisă) |
| Manifest de lansare, testnet | `https://download.qore.host/testnet/lightnode/latest.json` | 3.1.12 (`minCompatible` 3.1.9, înregistrare deschisă) |
| Binare | `https://download.qore.host/<net>/lightnode/v<version>/<file>` | 12 fișiere per lansare (SX și UX, Linux, macOS și Windows, amd64 și arm64) plus `SHA256SUMS` |
| Sursă și lansări | `github.com/qorechain/qorechain-lightnode` (Apache 2.0) | Lansarea `v3.1.12` (curentă) și etichetele anterioare; fiecare conține cele 12 binare, `SHA256SUMS`, `lightnode-build.json` și un APK de previzualizare pentru Android |
| Android | Atașat doar lansării GitHub | Previzualizare: urmărește lanțul, nu se înregistrează, nu câștigă recompense |
| Docker | Construit din eticheta sursă (vezi [Ediția SX: Docker](/light-node/sx-edition#docker)) | Nu este publicată nicio imagine de registru pentru descărcare anonimă |

Verificați `version` din manifestul rețelei dvs. înainte de a descărca, în loc să vă bazați pe acest tabel. Cheia de semnare a lansărilor este încorporată în binar; nu aveți nimic de instalat.

## Limite și probleme cunoscute {#limits}

- **Nu este un client light de protocol.** Nodul verifică prin coroborare hash-urile de bloc între puncte finale. Nu verifică semnăturile de commit, schimbările setului de validatori sau o perioadă de încredere, deci nu verifică consensul lanțului. `trust_period` și `max_clock_drift` din configurație sunt acceptate, dar nu sunt folosite.
- **Recompensele sunt un plafon.** Limita per nod (2.000 QOR la 30 de zile) este un maxim, iar nodul este plătit doar cu ce se acumulează în fond și doar cât timp este eligibil.
- **Un heartbeat este o semnătură de funcționare.** Dovedește că cheia operatorului a semnat la timp, nu că software-ul complet a rulat continuu.
- **Avertismentele de reputație sunt deocamdată doar pe testnet.** Mainnet nu servește încă scoruri de reputație per validator, așa că pe mainnet acea verificare nu rulează, iar nodul spune acest lucru în jurnal. Avertismentele despre jail, despre lipsa din setul activ și despre miza scăzută nu depind de ea. Versiunile de nod dinaintea lui 3.1.11 înregistrau în jurnal o verificare eșuată de reputație la fiecare cinci minute și nu avertizau niciodată despre nimic.
- **Auto-actualizarea începe de la 3.1.11.** Un nod pe 3.1.10 sau mai vechi nu se actualizează singur și are nevoie de o instalare manuală a lui 3.1.12. Într-un container sau într-un folder care nu poate fi scris, nodul doar anunță versiunile noi.
- **Nu există imagine Docker de descărcat.** Construiți din eticheta sursă; pachetele de container publicate nu sunt încă publice. Nodurile Docker nu se actualizează niciodată singure.
- **Android este o previzualizare** și nu se înregistrează și nu câștigă recompense.
- **Licențe.** Acordările pe mainnet sunt semnate manual, în loturi, deci există o așteptare între plată și înregistrare. Licența de testnet este limitată la una per cont și una per adresă.
- **Un portofel creat în Dashboard nu poate rula un nod** decât dacă îi exportați seed-ul, deoarece nodul trebuie să semneze cu chei pe care le dețineți.

## Unde să mergeți mai departe

- [Ediția SX](/light-node/sx-edition): instalați, configurați și rulați daemonul de server.
- [Ediția UX](/light-node/ux-edition): rulați ediția cu tablou de bord web.
- [Înregistrare și licențiere](/light-node/registration-and-licensing): obțineți o licență și înregistrați-vă pe lanț.
- [Recompense și monitorizare](/light-node/rewards-and-monitoring): cum este creditată și revendicată partea de 3% și cum păstrați nodul sănătos.
- [Tokenomică](/architecture/tokenomics): cum se încadrează partea de recompense pentru nodurile light în economia mai largă.
