---
slug: /rollups/data-availability
title: Disponibilitatea datelor
sidebar_label: Disponibilitatea datelor
sidebar_position: 4
---

# Disponibilitatea datelor

Disponibilitatea datelor (DA) este garanția că datele tranzacțiilor din spatele stării unui rollup sunt publicate undeva unde oricine le poate citi — astfel încât oricine să poată reconstrui și verifica independent starea rollup-ului. RDK definește trei backend-uri DA; astăzi este implementat doar `native`.

| Backend | Ce este | Stare |
| ------- | ---------- | ------ |
| **`native`** | Stocare de blob-uri on-chain în cadrul QoreChain însuși | Implementat în modul; încă nu există o modalitate publică de a posta un blob (vezi mai jos) |
| **`celestia`** | Disponibilitatea datelor prin IBC către Celestia, un strat DA modular dedicat | Neimplementat |
| **`both`** | Native și Celestia împreună, pentru redundanță | Se comportă exact ca `native` astăzi |

:::caution Capabilitate în fază incipientă
Niciun rollup nu a fost creat încă în niciuna dintre rețele (verificat la 27 octombrie 2026), iar backend-urile DA sunt implementate doar parțial. Starea fiecărui backend este indicată mai jos; validează pe testnet-ul **`qorechain-diana`** înainte de a te baza pe oricare dintre ele.
:::

---

## DA native (stocare de blob-uri on-chain)

DA native este depozitul de blob-uri on-chain din `x/rdk`: fiecare blob este indexat după ID-ul rollup-ului și indexul blob-ului, poartă un **commitment SHAKE-256** al octeților săi și este curățat după fereastra de reținere, în timp ce commitment-ul său este păstrat.

:::caution Încă nu există o modalitate publică de a posta un blob
Modulul definește stocarea, reținerea și curățarea blob-urilor, dar în versiunile actuale **nu există niciun mesaj de tranzacție pentru postarea unui blob** (mainnet v3.2.4 și testnet v3.2.6; mesajele modulului sunt verificate în sursa lanțului). Lanțul acceptă un `data_hash` nevid pe un rollup `native` sau `both` doar când un blob corespunzător este stocat on-chain, iar nimic nu poate stoca unul. Deci un lot de settlement pe un astfel de rollup **trebuie să lase `data_hash` gol**: un lot care indică un hash de date este refuzat ca date indisponibile, după ce taxa tranzacției a fost plătită.

RDK respectă această regulă începând cu **0.6.1** (și la fel 0.6.2): `SubmitBatchInput.dataHash` este opțional (omis înseamnă gol), toate cele șase șabloane de pornire îl lasă gol, `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) expune regula în toate cele cinci limbaje, iar `RdkTxClient.submitBatch` refuză un astfel de lot înainte de difuzare când poate citi rollup-ul (un client hibrid cu endpoint REST). Versiunile anterioare ale șabloanelor puneau un hash de date pe loturile lor, pe care lanțul le refuza.
:::

Concepte cheie:

* **Blob-uri.** Un blob este asociat cu un ID de rollup și un index de blob.
* **Commitment-uri.** Fiecare blob poartă un commitment SHAKE-256 de 32 de octeți al datelor sale, astfel încât un blob să poată fi verificat în raport cu ceea ce a fost comis, fără a avea încredere în cel care îl stochează. (Helperul TypeScript `buildDaBlob()` calculează în prezent hash-ul cu SHA-256, deci `dataHash` al său nu corespunde commitment-ului lanțului, iar cum nicio tranzacție nu postează un blob, oricum nu ar trebui să trimiți acel hash într-un lot pe un rollup `native` sau `both`.)
* **Namespace-uri.** Blob-urile pot purta un namespace specific rollup-ului, păstrând datele fiecărui rollup separate logic în cadrul stocării partajate.
* **Reținere și curățare.** Blob-urile native sunt reținute pentru `blob_retention_blocks` (432.000 de blocuri — aproximativ 16 zile la timpul actual de bloc al mainnet-ului de ≈3,1 s; cifra se modifică odată cu timpul de bloc) și apoi curățate pentru a menține stocarea on-chain sustenabilă. După curățare, datele brute ale blob-ului sunt eliminate, în timp ce metadatele commitment-ului sunt reținute, astfel încât commitment-ul istoric rămâne verificabil chiar dacă byte-urile nu mai sunt stocate on-chain.

Dimensiunea maximă a blob-ului și fereastra de reținere sunt guvernate de parametrii live ai modulului. Interoghează-i înainte de a proiecta în jurul oricărei limite specifice:

```bash
qorechaind query rdk config
```

Metadatele blob-ului (nu și octeții) pot fi citite prin REST la `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`, pe care îl servesc ambele rețele; acestea includ `expires_at_height`.

---

## DA Celestia (IBC către Celestia)

DA Celestia **nu este implementat**. Un rollup al cărui backend DA este `celestia` nu poate posta date (modulul întoarce o eroare). Designul planificat publică disponibilitatea datelor prin IBC către **Celestia**, o rețea DA modulară dedicată, ancorând în continuare settlement-ul pe QoreChain; pe mainnet nu este deschis niciun canal IBC, iar singurul canal deschis pe testnet (verificat la 27 octombrie 2026) este un canal de transfer de tokenuri (`ics20-1`), nu unul de disponibilitate a datelor (vezi [Arhitectura Bridge](/architecture/bridge-architecture)). Folosește `native`.

---

## Both (redundanță)

Backend-ul `both` este menit să scrie atât în **native, cât și în Celestia împreună**. Astăzi `both` se comportă exact ca `native`: este stocată doar copia native, iar jumătatea Celestia este omisă cu un avertisment în jurnal. Nu o trata ca pe două copii independente.

---

## Alegerea unui backend

| Dacă vrei... | Alege |
| -------------- | ------ |
| Cea mai simplă opțiune, complet on-chain, care moștenește securitatea QoreChain | **`native`** |
| Să descarci DA către un strat modular dedicat | **`celestia`** — neimplementat |
| Redundanță între două stocări | **`both`** — la fel ca `native` astăzi |

Pentru modul în care DA se încadrează în imaginea mai largă a settlement-ului, vezi **[Prezentarea generală a rollup-urilor](/rollups/overview)**. Pentru referința modulului de nivel inferior, vezi pagina **[Rollup Development Kit](/architecture/rollup-development-kit)**.
