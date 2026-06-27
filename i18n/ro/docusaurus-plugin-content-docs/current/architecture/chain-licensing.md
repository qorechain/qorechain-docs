---
slug: /architecture/chain-licensing
title: Licențierea lanțului
sidebar_label: Licențierea lanțului
sidebar_position: 9
---

# Licențierea lanțului

Modulul `x/license` oferă **licențierea de capabilități** on-chain. Anumite capabilități restricționate pe QoreChain — cel mai notabil funcțiile de punte și de validator per lanț — necesită ca acel cont care acționează să dețină o licență validă pentru acea capabilitate. O licență este pur și simplu o înregistrare on-chain care autorizează un deținător specific (**grantee-ul**) să folosească o anumită **funcție** restricționată.

Licențierea menține aceste capabilități verificabile și auto-descriptive: orice integrator, explorator sau portofel poate întreba lanțul dacă un anumit cont este autorizat pentru o anumită funcție, fără nicio căutare off-chain necesară.

## Ce reprezintă o licență

Fiecare licență este o înregistrare indexată după o pereche `(grantee, feature_id)`:

- **`grantee`** — contul `qor` pe care licența îl autorizează.
- **`feature_id`** — capabilitatea restricționată pe care o deblochează. ID-urile de funcție sunt identificatori de tip șir stabili; capabilitățile de punte și de validator sunt denumite per lanț țintă (de exemplu `bridge_ethereum`, `validator_solana`), alături de funcții-umbrelă precum funcțiile de protocol-punte și de operator de nod/validator.
- **`granted_at`** / **`expires_at`** — înălțimea blocului la care licența a fost acordată și înălțimea blocului la care expiră (o valoare de `0` înseamnă că nu expiră).
- **`granted_by`** — autoritatea care a emis licența.

O capabilitate restricționată în spatele unei funcții verifică pur și simplu, la momentul execuției, dacă contul care acționează deține o licență **activă** pentru acea funcție.

## Ciclul de viață al licenței

O licență trece printr-un set mic de stări:

| Stare | Semnificație |
| --- | --- |
| **Acordată / Activă** | Licența există și autorizează grantee-ul. Este considerată activă atâta timp cât nu este suspendată și nu este expirată. |
| **Suspendată** | Dezactivată temporar. Înregistrarea încă există, dar capabilitatea restricționată este refuzată până când licența este reluată. |
| **Revocată** | Eliminată permanent. Grantee-ul nu mai deține deloc licența. |

O licență încetează de asemenea să fie activă odată ce înălțimea sa `expires_at` este depășită, chiar dacă nu a fost niciodată suspendată sau revocată.

## Cine poate modifica licențele

Acordarea, revocarea, suspendarea și reluarea licențelor sunt **operațiuni de autoritate** — sunt efectuate de autoritatea de guvernanță a lanțului, nu de utilizatori arbitrari. Aceste tranzacții există ca parte a suprafeței de comenzi a modulului, dar un utilizator obișnuit nu le apelează direct; ciclul de viață este administrat on-chain de autoritate.

Pentru a **obține** o licență, integratorii parcurg **Dashboard-ul (Tools → Buy License)**, care gestionează fluxul de cerere; autoritatea înregistrează apoi acordarea on-chain.

Tranzacțiile restricționate la autoritate sunt:

```bash
# Grant a license for a feature to a grantee (authority signs)
qorechaind tx license grant qor1grantee... bridge_ethereum \
  --expires-at 0 --from qor1authority... --chain-id qorechain-vladi

# Suspend / resume a license
qorechaind tx license suspend qor1grantee... bridge_ethereum --from qor1authority...
qorechaind tx license resume  qor1grantee... bridge_ethereum --from qor1authority...

# Revoke a license permanently
qorechaind tx license revoke qor1grantee... bridge_ethereum --from qor1authority...
```

## Verificarea și validarea unei licențe

Comenzile de interogare sunt deschise oricui. Sunt partea modulului pe care integratorii o folosesc zi de zi — pentru a confirma că un cont este autorizat înainte de a se baza pe o capabilitate restricționată, sau pentru a afișa statusul licenței într-un portofel sau explorator.

### Verificarea unei singure licențe

`check` raportează dacă un anumit grantee deține o anumită funcție și dacă acea licență este în prezent **activă**. Acesta este apelul canonic „este acest cont autorizat să facă X".

```bash
qorechaind query license check qor1grantee... bridge_ethereum
# -> returns the license record and an `active` flag (true / false)
```

Răspunsul include detaliile licenței și un câmp boolean `active` care ține deja cont de suspendare și expirare — astfel încât un `true` înseamnă că grantee-ul poate folosi funcția restricționată chiar acum.

### Listarea licențelor unui grantee

`list` returnează fiecare licență deținută de un cont, pe toate funcțiile.

```bash
qorechaind query license list qor1grantee...
```

### Listarea deținătorilor unei funcții

`holders` returnează fiecare cont care deține o licență pentru o anumită funcție — util pentru a enumera, să zicem, cine este autorizat pentru o anumită capabilitate de punte sau de validator.

```bash
qorechaind query license holders bridge_ethereum
```

## Rezumatul comenzilor

**Tranzacții** (`qorechaind tx license …`) — restricționate la autoritate / guvernanță:

| Comandă | Scop |
| --- | --- |
| `grant` | Autorizează un grantee pentru o funcție |
| `revoke` | Elimină permanent o licență |
| `suspend` | Dezactivează temporar o licență |
| `resume` | Reactivează o licență suspendată |

**Interogări** (`qorechaind query license …`) — deschise oricui:

| Comandă | Scop |
| --- | --- |
| `check` | Verifică o licență `(grantee, feature)` și starea sa activă |
| `list` | Listează toate licențele deținute de un grantee |
| `holders` | Listează toți grantee-ii care dețin o anumită funcție |

## Conexe

- Licențele pentru funcțiile de punte și de validator susțin capabilitățile descrise în [Arhitectura punții](/architecture/bridge-architecture).
- Licențele sunt obținute prin **Dashboard (Tools → Buy License)**.
- Nodurile ușoare obțin o licență în timpul [Înregistrării și licențierii](/light-node/registration-and-licensing).
- Cumpărați și gestionați licențe din [Hub-ul de instrumente](/dashboard/tools-hub).
