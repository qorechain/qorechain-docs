---
slug: /rollups/data-availability
title: Disponibilitatea datelor
sidebar_label: Disponibilitatea datelor
sidebar_position: 4
---

# Disponibilitatea datelor

Disponibilitatea datelor (DA) este garanția că datele tranzacțiilor din spatele stării unui rollup sunt publicate undeva unde oricine le poate citi — astfel încât oricine să poată reconstrui și verifica independent starea rollup-ului. RDK acceptă trei backend-uri DA.

| Backend | Ce este |
| ------- | ---------- |
| **`native`** | Stocare de blob-uri on-chain în cadrul QoreChain însuși |
| **`celestia`** | Disponibilitatea datelor prin IBC către Celestia, un strat DA modular dedicat |
| **`both`** | Native și Celestia împreună, pentru redundanță |

:::caution
Backend-urile de disponibilitate a datelor fac parte din RDK aflat în dezvoltare activă. Tratează notele de maturitate de mai jos ca intenție de proiectare și validează pe testnet-ul **`qorechain-diana`** înainte de a te baza pe un backend în producție.
:::

---

## DA native (stocare de blob-uri on-chain)

DA native stochează datele tranzacțiilor rollup-ului ca **blob-uri** direct pe QoreChain. Fiecare blob este comis și adresabil, astfel încât datele din spatele unui lot de settlement să poată fi recuperate și verificate on-chain.

Concepte cheie:

* **Blob-uri.** Datele tranzacțiilor rollup-ului sunt publicate ca blob-uri de disponibilitate a datelor, fiecare asociat cu un ID de rollup și un index de blob.
* **Commitment-uri.** Fiecare blob poartă un commitment (un hash al datelor blob-ului), astfel încât un blob să poată fi verificat în raport cu ceea ce a fost comis, fără a avea încredere în cel care îl stochează.
* **Namespace-uri.** Blob-urile pot purta un namespace specific rollup-ului, păstrând datele fiecărui rollup separate logic în cadrul stocării partajate.
* **Reținere și curățare.** Blob-urile native sunt reținute pentru o fereastră limitată și apoi curățate pentru a menține stocarea on-chain sustenabilă. După curățare, datele brute ale blob-ului sunt eliminate, în timp ce metadatele commitment-ului sunt reținute, astfel încât commitment-ul istoric rămâne verificabil chiar dacă byte-urile nu mai sunt stocate on-chain.

Dimensiunea maximă exactă a blob-ului și fereastra de reținere sunt guvernate de parametrii live ai modulului. Interoghează-i înainte de a proiecta în jurul oricărei limite specifice:

```bash
qorechaind query rdk config
```

DA native este cea mai simplă opțiune — păstrează totul în interiorul QoreChain, moștenind securitatea și criptografia post-cuantică a chain-ului gazdă, cu prețul consumului de stocare al chain-ului gazdă.

---

## DA Celestia (IBC către Celestia)

Backend-ul `celestia` publică disponibilitatea datelor prin IBC către **Celestia**, o rețea DA modulară dedicată. Acest lucru descarcă stocarea blob-urilor de pe QoreChain către un strat DA construit special, în timp ce ancorează în continuare settlement-ul pe QoreChain.

:::note
DA Celestia este o integrare în curs de maturizare. În versiunea actuală ar trebui tratată ca neîntărită încă pentru producție — validează comportamentul pe testnet și preferă `native` sau `both` acolo unde ai nevoie astăzi de o garanție de settlement.
:::

---

## Both (redundanță)

Backend-ul `both` scrie atât în **native, cât și în Celestia împreună**, oferind redundanță între o stocare on-chain și un strat DA modular extern. Alege `both` când vrei cea mai largă suprafață de disponibilitate și ești dispus să plătești pentru stocarea datelor în două locuri.

Deoarece calea Celestia este încă în curs de maturizare, tratează `both` ca native-cu-redundanță-în-curs, mai degrabă decât ca o garanție că două copii pe deplin independente sunt settled astăzi. Confirmă comportamentul curent pe testnet.

---

## Alegerea unui backend

| Dacă vrei... | Alege |
| -------------- | ------ |
| Cea mai simplă opțiune, complet on-chain, care moștenește securitatea QoreChain | **`native`** |
| Să descarci DA către un strat modular dedicat (în curs de maturizare) | **`celestia`** |
| Suprafață maximă de disponibilitate cu redundanță (în curs de maturizare) | **`both`** |

Pentru modul în care DA se încadrează în imaginea mai largă a settlement-ului, vezi **[Prezentarea generală a rollup-urilor](/rollups/overview)**. Pentru referința modulului de nivel inferior, vezi pagina **[Rollup Development Kit](/architecture/rollup-development-kit)**.
