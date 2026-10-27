---
slug: /dashboard/validators
title: Validatori
sidebar_label: Validatori
sidebar_position: 12
---

# Validatori

Pagina **Validators** listează validatorii rețelei selectate, cu carduri rezumative, o casetă de căutare și, pentru fiecare validator, rangul, puterea de vot, comisionul, statusul și o cifră de randament variabil citită din lanț. Este un instrument de comparare doar pentru citire, destinat celor care decid unde să delege. Nu are buton de delegare: staking-ul se face pe pagina Wallet, vezi [Staking și validatori](/dashboard/staking-and-validators).

## Inovații {#innovations}

- **Lista urmează rețeaua selectată.** Pagina cere setul rețelei alese în antet, așa că cei care privesc mainnet-ul văd validatorii de mainnet, iar cei care privesc testnet-ul îi văd pe cei de testnet.
- **Randament citit din lanț, cu limitele lui alăturate.** Coloana APY este rata de bază a nivelului de staking al lanțului, înmulțită cu (1 minus comisionul validatorului). Este afișată cu un asterisc și nota „variable, not guaranteed, lock bonuses not included”. Cifra este o citire în timp real a unei rate variabile de protocol, nu o promisiune și nu o prognoză.
- **„From fees” după plafonul de emisie.** O rețea care a depășit plafonul de emisie afișează **From fees** în loc de un procent, pentru că nu se mai creează QOR nou, iar staking-ul câștigă atunci doar din comisioanele de tranzacție. Pe testnet, coloana scrie în prezent **From fees**. O valoare necunoscută afișează o liniuță, niciodată 0.00%.
- **Rang după puterea de vot.** Rangul se calculează din puterea de vot, deci rangul 1 este validatorul cu cel mai mult stake.
- **Cifre reale, lipsuri arătate cinstit.** Comisionul este comisionul real al validatorului, iar un validator închis (jailed) este afișat ca **Jailed**. Regiunea, blocurile propuse, versiunea software și ultima apariție sunt afișate doar când rețeaua le raportează, ceea ce în prezent nu se întâmplă; un uptime necunoscut scrie **N/A**, nu 0%.

## Cum se folosește {#how-to-use}

1. Autentifică-te și deschide pagina după adresa ei, `dashboard.qorechain.io/validators`. Nu există link în bara laterală.
2. Alege rețeaua în antet (**Mainnet** sau **Testnet**); pagina se reîncarcă cu validatorii acelei rețele.
3. Citește cardurile rezumative: **Active Validators**, **Total Bonded**, **Avg Commission** și **Avg Uptime**.
4. Caută cu caseta „Search by moniker or address”.
5. Citește fiecare rând: rangul și moniker-ul cu adresa (și un buton de copiere), **Voting power** (stake-ul și cota din total), **Commission**, **APY** și **Status** (active, jailed sau inactive), apoi uptime-ul și eventualele detalii opționale.
6. Pentru a delega, mergi la tab-ul **Stake / Delegate** al paginii Wallet ([Delegate](/dashboard/staking-and-validators#delegate)). Pentru a vedea un validator mai în detaliu, deschide pagina lui de adresă în [Explorer](/dashboard/explorer#validators).

:::caution Citește nota despre APY
Procentul depinde de o rată de protocol care se poate schimba și de comisionul validatorului. Bonusurile de blocare din modulul opțional de staking cu blocare în timp nu sunt incluse. Nu îl trata ca pe un venit garantat.
:::

## Cum se accesează {#how-to-access}

- **URL:** [dashboard.qorechain.io/validators](https://dashboard.qorechain.io/validators). Poate fi deschisă doar după adresă; bara laterală nu o listează.
- **Autentificare:** necesară. Fără autentificare, pagina afișează „Authentication Required”.
- **Rețea:** urmează comutatorul din antet.
- **Portofel:** nu este nevoie de niciunul pentru a citi pagina.
- **Cost:** gratuit.

## Unde este publicat {#where-published}

| Suprafață | Adresă | Rețele | Autentificare |
| --- | --- | --- | --- |
| Pagina Validators | `dashboard.qorechain.io/validators` | Mainnet și testnet, comutator în antet | Necesară |
| Tabelul de validatori din Explorer | `dashboard.qorechain.io/explorer/validators` | Mainnet și testnet | Nu este necesară |
| Date din lanț | `GET /cosmos/staking/v1beta1/validators` pe `api.qore.host` și `api-testnet.qore.host` | Mainnet și testnet | Niciuna |

## Limite și probleme cunoscute {#limits}

- **Pagina este doar pentru citire** și nu are link în bara laterală.
- **APY este variabil și negarantat.** Exclude bonusurile de blocare și afișează **From fees** acolo unde plafonul de emisie a fost atins.
- **Mai puține câmpuri de date decât un dashboard de nod:** regiunea, blocurile propuse, versiunea software și ultima apariție sunt afișate doar când sunt disponibile, iar uptime-ul poate scrie N/A.
- **Validatorii jailed** apar ca jailed și nu sunt oferiți în panoul Delegate.
- **Datele sunt păstrate în cache o scurtă perioadă** (aproximativ 30 de secunde), așa că o modificare din lanț poate dura puțin până apare.
