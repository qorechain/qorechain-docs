---
slug: /qorel/whats-new
title: Noutăți în QORel
sidebar_label: Noutăți
sidebar_position: 2
---

# Noutăți în QORel

Această pagină listează ce adaugă fiecare versiune QORel. Este destinată operatorilor care decid dacă trec de la Hermes sau de la o versiune QORel anterioară și afirmă doar ce face o versiune, ca un comportament verificabil. QORel se bazează pe Hermes 1.13.3 (Informal Systems, Apache-2.0); fiecare modificare de mai jos este peste acea bază. Tot ce nu este listat se comportă ca în Hermes.

## 0.1.0 {#v0-1-0}

Prima versiune. Doar testnet. [Pagina de release](https://github.com/qorechain/QORel/releases) conține fișierele.

### Inovații {#innovations}

- **Semnare hibridă post-cuantică pentru QoreChain.** Setați `signing = 'qorechain-hybrid'` pe un lanț și QORel adaugă semnătura ML-DSA-87 (`/qorechain.pqc.v1.PQCHybridSignature`) ca unică opțiune de extensie critică a fiecărei tranzacții, apoi semnează corpul final cu secp256k1. Mesajul pe care îl semnează cheia post-cuantică este octeții de semnat versiunea 2, pe care îi verifică ambele rețele QoreChain. `extension_options` statice nu pot fi combinate cu acest mod, iar configurația este refuzată dacă sunt.
- **Semnarea standard este neschimbată.** Cu `signing = 'standard'` (implicit) formatul tranzacției este identic octet cu octet cu cel al Hermes, pentru Cosmos Hub, Osmosis și orice alt lanț Cosmos SDK.
- **Crate-ul `qorel-signer`.** Primitiva post-cuantică (`PqSigner`, cu `MlDsa87Signer`), regulile lanțului (`SignBytesFramer`) și semnatarul de extensie pe care îl apelează relayer-ul (`TxExtensionSigner`) sunt interfețe separate. Simularea de gas și dimensionarea loturilor trec prin aceeași cale, astfel încât cei aproximativ 4.7 KB în plus și gas-ul de verificare sunt întotdeauna numărați.
- **`qorel keys add` derivă cheia post-cuantică.** Pe un lanț hibrid derivă cheia ML-DSA-87 din același mnemonic și cont, cu derivarea de portofel QoreChain, și stochează doar seed-ul ei de 32 de octeți, lângă cheie, ca `<key name>.pqc`. Nu se afișează nimic secret.
- **`qorel keys register-pqc`.** Trimite `MsgRegisterPQCKeyV2` o singură dată, cu o dovadă de posesie pe rețelele de la v3.2.3 încolo. Este idempotentă (nu se trimite nimic dacă aceeași cheie este deja înregistrată) și refuză să trimită când contul are deja o cheie diferită. `--no-proof` există doar pentru rețele mai vechi decât v3.2.3.
- **`qorel keys pqc-status`.** Afișează dacă cheia este înregistrată, dacă se potrivește cu cheia locală, dacă posesia a fost dovedită, ce octeți de semnat verifică lanțul și `ready_to_relay`.
- **Verificare de siguranță înainte de trimitere.** Înainte de fiecare tranzacție către un lanț hibrid, QORel verifică dacă cheia este încărcată, înregistrată și identică cu cea locală, și dacă versiunea octeților de semnat este cunoscută. Cu `pqc.sign_bytes = 'auto'` citește versiunea din înregistrările de upgrade aplicate ale lanțului, o recitește în fiecare minut și după orice refuz cu codespace `pqc` code 21. La orice eșec nu se trimite nimic și nu se cheltuiește nicio taxă; `health-check` raportează motivul.
- **Prețul de gas din piața de taxe.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` citește taxa de bază a QoreChain, care are un minim de 0.1 uqor per gas.
- **Detectarea comportamentelor necorespunzătoare (misbehaviour) pe lanțurile ibc-go v10.** QORel citește header-ul din tranzacția `MsgUpdateClient` deoarece ibc-go v10 nu îl mai include în evenimentele `update_client`. Hermes 1.13 standard dezactivează detectarea pe aceste lanțuri.
- **Worker-ii de pachete supraviețuiesc limitării de rată.** Worker-ii rămân activi cât timp o încercare de relay sau de golire a eșuat și reîncearcă la fiecare interval de golire. În Hermes un worker se oprește și după `clear_interval x 5` blocuri fără evenimente IBC noi, chiar dacă ultima rundă de golire a eșuat, deci un pachet aflat în așteptare în acel moment aștepta următorul pachet de pe canal sau o repornire.
- **Fișiere de chei doar pentru proprietar.** Hermes scria fișierele de chei cu umask-ul implicit. QORel scrie `<key name>.json` și `<key name>.pqc` cu modul 0600. Cheile adăugate de un Hermes mai vechi își păstrează modul vechi; verificați-le cu `ls -l`.
- **Un binar `qorel`.** Un singur binar, `qorel`, cu setul de comenzi Hermes plus comenzile pentru chei post-cuantice. Din arborele sursă se construiește și un binar `hermes` cu aceeași interfață CLI.
- **Versiuni cu proveniență.** Arhive tarball pentru Linux și macOS, pachete `.deb` și `.rpm` cu o unitate systemd întărită, o formulă Homebrew și o imagine de container multi-arhitectură semnată cu cosign. Fișierele de release vin cu `SHA256SUMS` și atestări de build. Vezi [Instalare](/qorel/install).
- **Un test local pe devnet.** Depozitul include `scripts/qorel-devnet/`, care construiește local un nod QoreChain și un lanț de test ibc-go v10 și rulează un test end-to-end ICS-20 în ambele direcții: înregistrarea cheii, crearea clientului, a conexiunii și a canalului, transferuri în ambele sensuri, derularea unui token transferat, un pachet expirat golit și rambursat și un transfer trimis chiar de QORel.

### Testat pe testnet {#proven-on-the-testnet}

- Primul canal IBC al testnet-ului QoreChain, `transfer/channel-0` pe `qorechain-diana` către `channel-600` pe testnet-ul public Cosmos Hub (chain ID `provider`), este transmis de QORel. Clienții sunt `07-tendermint-0` și `07-tendermint-466`, conexiunile `connection-0` și `connection-315`.
- Transferurile au fost testate în ambele direcții (1 QOR trimis, 0.1 ATOM primit, 0.4 QOR returnat) și rambursarea automată a unui transfer cu timeout de 1 secundă, printr-un mesaj de timeout. Toate cele 13 tranzacții ale relayer-ului pe `qorechain-diana` au reușit.
- Vederea de citire a canalului este la [Punți pentru active](/user-guide/bridging-assets#ibc-test-channel).

### Nu este în această versiune {#not-in-this-release}

- Relay pentru IBC v2. Nu este încă implementat în QORel și este faza următoare.
- Relay pentru Ethereum (Eureka). Nu a fost început.
- Relay pe mainnet. Niciun canal IBC de mainnet nu este încă deschis.
- Un build pentru Windows.
- Crate-ul `qorel-signer` pe crates.io. Publicarea este blocată; crate-ul este în depozit la `crates/qorel-signer`, deci folosiți o dependență git.

## Actualizare {#upgrading}

Nu există o versiune QORel anterioară. Trecerea de la Hermes 1.13 la QORel 0.1.0:

1. Instalați `qorel` alături de `hermes` sau în locul lui ([Instalare](/qorel/install)).
2. Păstrați `config.toml`. Lanțurile fără `signing` rămân pe semnarea standard și se comportă ca înainte.
3. Redenumiți comanda din fișierele de serviciu din `hermes` în `qorel`. Folderul depozitului de chei (`~/.hermes/keys` implicit) este neschimbat, motiv pentru care imaginea de container își montează datele la `/home/nonroot/.hermes`.
4. Verificați modurile fișierelor de chei cu `ls -l`; cheile noi sunt 0600, cele mai vechi își păstrează modul.

Notele de upgrade Hermes din amonte din `UPGRADING.md` al depozitului se aplică oricui vine dintr-o versiune Hermes mai veche decât 1.6.
