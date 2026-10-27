---
slug: /qorel/quickstart
title: Pornire rapidă QORel
sidebar_label: Pornire rapidă
sidebar_position: 4
---

# Pornire rapidă

Acest ghid parcurge relay-ul între testnet-ul QoreChain `qorechain-diana` și testnet-ul public Cosmos Hub (chain ID `provider`): instalare, configurare, adăugarea și înregistrarea cheilor, verificarea stării, pornirea relayer-ului și un prim transfer. Este destinat cuiva care nu a mai rulat un relayer. Tot ce urmează este pe testnet; tokenurile nu au valoare.

## Inovații {#innovations}

- **Starea este un singur câmp.** `qorel keys pqc-status` se încheie cu `ready_to_relay`. Dacă este `true`, cheia post-cuantică este înregistrată în lanț și se potrivește cu cheia locală, iar relayer-ul nu își va refuza propriile tranzacții din acest motiv.
- **Nu se trimite nimic când ceva nu este în regulă.** Verificarea dinaintea trimiterii oprește o tranzacție greșită înainte să ajungă în lanț, deci un pas omis nu costă nicio taxă.
- **Același flux pentru fiecare lanț.** Pașii pentru partea Cosmos Hub sunt cei proprii Hermes; doar intrarea pentru lanțul QoreChain și pasul de înregistrare sunt noi.

## Cum se folosește {#how-to-use}

### 1. Instalare {#step-install}

Instalați `qorel` prin oricare metodă de pe pagina [Instalare](/qorel/install) și verificați-l:

```bash
qorel --version
```

### 2. Obțineți configurația {#step-config}

Copiați configurația exemplu din depozit (`packaging/config.example.toml`; `.deb` și `.rpm` o pun la `/etc/qorel/config.example.toml`):

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Deschideți `~/.hermes/config.toml` și înlocuiți valorile de substituție pentru nodul QoreChain (`YOUR-QORECHAIN-NODE`) cu adresele RPC, gRPC și WebSocket ale unui nod de testnet pe care îl rulați. QoreChain nu are un endpoint gRPC public, deci aveți nevoie de propriul nod; vezi [Rularea unui nod](/developer-guide/running-a-node) și [Conectarea la Testnet](/getting-started/connecting-to-testnet). Fiecare setare este explicată la [Configurare](/qorel/configuration).

Configurația exemplu are două lanțuri: `qorechain-diana` cu `signing = 'qorechain-hybrid'` și `provider` cu semnarea standard implicită. Limitează relay-ul la `transfer/channel-0` pe QoreChain și `transfer/channel-600` pe testnet-ul Hub.

### 3. Creați și alimentați conturile de relayer {#step-accounts}

Creați un cont nou pentru relayer pe fiecare lanț. Folosiți un cont dedicat, niciodată cheia operatorului unui validator. Salvați mnemonicul fiecărui cont într-un fișier pe care îl puteți citi doar dumneavoastră:

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

Același mnemonic poate servi ambele lanțuri sau puteți folosi unul separat pentru fiecare. QORel derivă implicit cu coin type 118 (`m/44'/118'/0'/0/0`); dați `--hd-path` la `keys add` dacă contul dumneavoastră folosește o altă cale.

Adăugați cheile:

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

Pe `qorechain-diana`, `keys add` derivă și cheia ML-DSA-87 din același mnemonic și stochează seed-ul ei lângă cheie, ca `relayer.pqc`. Ștergeți fișierele cu mnemonic când ați terminat.

Apoi alimentați conturile. Afișați adresele cu `qorel keys list --chain <id>`. QOR de testnet vine de la [Faucet-ul din Dashboard](/dashboard/faucet); tokenurile de test pentru testnet-ul Hub vin de la faucet-ul public al acelei rețele. Câteva tokenuri sunt suficiente pentru taxe: minimul QoreChain este 0.1 uqor per gas, deci o tranzacție cu limita de gas implicită de 400,000 costă aproximativ 40,000 uqor la prețul minim. Verificați cu:

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Înregistrați cheia post-cuantică {#step-register}

QoreChain acceptă o tranzacție semnată hibrid doar de la un cont care și-a înregistrat cheia publică ML-DSA-87. Înregistrarea se face o singură dată:

```bash
qorel keys register-pqc --chain qorechain-diana
```

Trimite o singură tranzacție, semnată doar cu cheia clasică (singurul tip de tranzacție pe care QoreChain îl acceptă astfel), cu o dovadă de posesie. Este sigur să o rulați din nou: dacă aceeași cheie este deja înregistrată, nu trimite nimic. Dacă contul are deja înregistrată o cheie post-cuantică diferită, refuză și nu trimite nimic.

Verificați starea:

```bash
qorel keys pqc-status --chain qorechain-diana
```

Rezultatul este un obiect JSON cu câmpurile `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` și `ready_to_relay`. Continuați doar când `ready_to_relay` este `true`. Vezi [Depanare](/qorel/troubleshooting) dacă nu este.

### 5. Verificare de sănătate {#step-health}

```bash
qorel health-check
```

Verifică configurația și conexiunea la fiecare lanț și raportează un multiplicator de gas sub 1.1 pe o intrare QoreChain ca o posibilă configurare greșită (un avertisment; relay-ul funcționează în continuare).

### 6. Alegeți canalul {#step-channel}

Testnet-ul are deja un canal de transfer: `channel-0` pe `qorechain-diana`, a cărui contraparte este `channel-600` pe `provider` ([Canalul de test](/user-guide/bridging-assets#ibc-test-channel)). Pentru a-l transmite, treceți direct la pasul 7.

Pentru a crea în schimb un canal nou al dumneavoastră între cele două lanțuri:

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` creează și cei doi clienți light și conexiunea. Aceasta trimite mai multe tranzacții pe fiecare lanț. Comanda afișează identificatorii noului canal; puneți-i în `packet_filter` al ambelor intrări de lanț.

### 7. Porniți relayer-ul {#step-start}

```bash
qorel start
```

Lăsați-l să ruleze (folosiți serviciul systemd sau un container pentru un relayer de lungă durată; vezi [Rularea alături de un validator](/qorel/running-next-to-a-validator)). QORel transmite pachete, reîmprospătează clienții light și urmărește comportamentele necorespunzătoare (misbehaviour).

### 8. Trimiteți un prim transfer {#step-transfer}

Într-un al doilea terminal, trimiteți 1000 uqor de la QoreChain către testnet-ul Hub. QORel semnează și trimite singur această tranzacție, cu aceeași semnătură hibridă:

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Fără `--receiver`, tokenurile ajung la adresa proprie a relayer-ului de pe lanțul destinație. Apoi urmăriți pachetul:

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

Pachetul este listat până când relayer-ul care rulează îl livrează și confirmarea (acknowledgement) se întoarce. Pe QoreChain puteți citi și canalul și urmele de token prin REST:

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Un transfer care nu este livrat înainte de expirare este rambursat expeditorului pe lanțul sursă de către relayer. Valoarea `--timeout-seconds` de mai sus îi dă zece minute.

## Cum se accesează {#how-to-access}

- **Rețea.** Doar testnet-ul `qorechain-diana` și testnet-ul public Cosmos Hub.
- **Aveți nevoie de.** QORel, un nod de testnet QoreChain pe care îl rulați (RPC, gRPC și WebSocket), endpoint-uri accesibile pentru testnet-ul Hub, un cont de relayer alimentat pe fiecare lanț și mnemonicul fiecăruia într-un fișier.
- **Costuri.** Taxe doar în tokenuri de test: pe QoreChain, gas înmulțit cu un preț cu minim 0.1 uqor per gas, fără rambursarea gas-ului nefolosit.
- **Utilizatori de containere.** Rulați fiecare comandă de mai sus ca `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`, cu fișierele cu mnemonic în directorul montat, și `start` ca container de lungă durată ([Instalare](/qorel/install#container)).

## Unde este publicat {#where-published}

Binarul și configurația exemplu provin din [depozitul QORel](https://github.com/qorechain/QORel) (`packaging/config.example.toml`); vezi [Instalare](/qorel/install) pentru fiecare canal și [Prezentarea generală QORel](/qorel/overview#where-published) pentru versiuni.

## Limite și probleme cunoscute {#limits}

- **Doar testnet.** IBC pe mainnet nu este deschis; nu îndreptați acest flux către mainnet.
- **Aveți nevoie de propriul nod QoreChain.** Nu există un endpoint gRPC public.
- **Un canal nou costă taxe pe ambele lanțuri** și adaugă un client și o conexiune. Preferați să transmiteți `channel-0`, cu excepția cazului în care aveți nevoie de al dumneavoastră.
- **Endpoint-urile publice din partea Hub pot limita rata.** QORel continuă să reîncerce, dar pentru un relay constant folosiți propriile noduri.
- **În așteptare până la transmitere.** Dacă niciun relayer nu rulează pentru canal, un transfer rămâne în așteptare până când pornește unul sau pachetul expiră.

Următorii pași: [Configurare](/qorel/configuration), [Monitorizare](/qorel/monitoring), [Depanare](/qorel/troubleshooting).
