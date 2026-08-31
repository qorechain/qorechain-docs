---
slug: /qorex/portfolio-and-staking
title: Portofoliu și Staking
sidebar_label: Portofoliu și Staking
sidebar_position: 4
---

# Portofoliu și Staking

## Portofoliu

Vizualizarea **Portfolio** (protejată biometric prima dată când o deschizi în fiecare sesiune) afișează un **inel de alocare** — QOR-ul tău unificat pe cele trei benzi ale sale (Native, EVM, SVM) — cu o legendă sub inel, plus câte un rând pentru fiecare activ. Procentele apar odată ce fluxul de prețuri este activ, iar fiecare sold afișează valoarea sa estimată în USD alături de suma în QOR.

**De unde vine prețul.** QoreX îl citește de la `GET https://api.qore.network/v1/price/{symbol}` — un endpoint public al nostru, nu un apel direct către vreun exchange. Nimic de pe dispozitivul tău nu comunică cu o sursă de preț din afara infrastructurii proprii QoreChain, așa că adresa ta IP nu este niciodată expusă unei asemenea surse. Dacă un preț cu adevărat justificabil nu este disponibil, endpoint-ul răspunde cu o eroare în loc să ghicească — QoreX afișează prețul ca indisponibil, nu va afișa niciodată un zero fabricat sau o cifră veche ca și cum ar fi actuală.

Atinge orice activ pentru a deschide **Asset detail**, care afișează:

- **Balance history** — o tendință reală construită din transferurile tale on-chain.
- **Recent activity** — rânduri de tranzacții cu căutare inversă **@handle**, astfel încât contrapărțile apar după nume acolo unde este posibil. Atinge orice rând pentru a deschide detaliul complet: sumă, contraparte, bloc, hash de tranzacție și semnătură.

## Staking și Earn

Punerea la staking a QOR ajută la securizarea QoreChain și îți aduce recompense. Toate operațiunile de staking sunt tranzacții reale on-chain care poartă semnătura ta post-cuantică.

### Pune la staking cu un validator

1. Deschide **Stake**.
2. Alege un validator din listă (încărcată live din lanț, cu cel mai mic stake afișat primul, iar orice validator aflat în prezent în jail este exclus — delegarea către unul dintre aceștia nu este niciodată ce îți dorești).
3. Introdu o sumă și **delegă** cu confirmare biometrică.
4. Revendică recompensele din același ecran ori de câte ori se acumulează.

:::note Nicio perioadă de blocare astăzi — așteptarea este doar la ieșire
Nu există un termen fix de ales, pentru că momentan nu există unul: delegarea rămâne activă, cu recompense care curg din blocul următor, până când ceri să anulezi delegarea — nu există o expirare de reînnoit și nicio durată minimă de staking. Singura perioadă de așteptare este la ieșire: odată ce anulezi delegarea, acel QOR intră într-o perioadă de unbonding de 21 de zile, timp în care nu produce recompense și nu poate fi mutat, înainte de a reveni în soldul tău disponibil. Mutarea unei delegări către un alt validator (redelegare) evită complet această așteptare. Aceasta descrie comportamentul actual al lanțului, nu o garanție permanentă — vezi [Există o perioadă de blocare?](/user-guide/staking-and-delegation#lock-in-period) pentru mai multe detalii.
:::

### Mută stake-ul între validatori (redelegare) {#move-stake}

Mută QOR pe care îl ai deja la staking către un alt validator — sau împarte-l între mai mulți — fără să atingi deloc coada de unbonding de 21 de zile. Stake-ul continuă să producă recompense pe tot parcursul mutării.

1. Deschide **Stake** și atinge validatorul la care se află în prezent QOR-ul tău.
2. Alege unde ar trebui să meargă — alege o singură destinație sau mai multe deodată. Împărțirea între mai mulți validatori divide suma în mod egal, iar cifra exactă care merge către fiecare validator este afișată înainte de confirmare.
3. Confirmă cu aprobare biometrică. Fiecare destinație se mută într-o **singură tranzacție** — un singur comision, iar mutarea ajunge fie în întregime, fie deloc.

Aceasta este mutarea de făcut atunci când un validator la care ai delegat ajunge în jail sau își crește comisionul — înainte ca aceasta să existe, singura cale de ieșire era să anulezi staking-ul și să aștepți 21 de zile fără recompense; mutarea în schimb nu costă nicio așteptare și nicio recompensă pierdută.

:::caution Există o limită per pereche, iar comisionul se plătește chiar dacă o atingi
Lanțul permite cel mult **7 redelegări în desfășurare simultan pentru aceeași pereche (sursă, destinație) de validatori** — utilizarea normală nu se apropie nici pe departe de acest prag, dar QoreX verifică această limită înainte să semnezi și te avertizează dacă ai atins-o. Peste această limită, tranzacția eșuează on-chain, iar comisionul de rețea este oricum plătit, așa că nu reîncerca o mutare care a fost deja respinsă din acest motiv fără să aștepți întâi ca una existentă să se elibereze.
:::

### Anulează delegarea

1. Deschide **Stake**, atinge validatorul și alege să anulezi delegarea în loc să îți muți stake-ul.
2. Introdu suma — ecranul afișează **perioada de unbonding de 21 de zile** și **comisionul exact** pe care îl vei plăti, ambele înainte de confirmare.
3. Confirmă cu aprobare biometrică. QOR-ul încetează imediat să producă recompense și devine din nou disponibil pentru cheltuire după finalizarea perioadei de unbonding.

### Earn

Vizualizarea **Earn** rezumă pozițiile tale active și randamentul într-un singur loc.

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — mută QOR și active externe.
- [Securitate și Recuperare](/qorex/security-and-recovery) — gardieni, moștenire Legacy și asocierea dispozitivelor.
