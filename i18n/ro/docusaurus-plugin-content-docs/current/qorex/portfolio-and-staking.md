---
slug: /qorex/portfolio-and-staking
title: Portofoliu și Staking
sidebar_label: Portofoliu și Staking
sidebar_position: 4
---

# Portofoliu și Staking

## Portofoliu

Vizualizarea **Portfolio** (protejată biometric prima dată când o deschizi în fiecare sesiune) afișează un **inel de alocare** — QOR-ul tău unificat pe cele trei benzi ale sale (Native, EVM, SVM) — cu o legendă sub inel, plus câte un rând pentru fiecare activ. Procentele apar odată ce fluxul de prețuri este activ.

Atinge orice activ pentru a deschide **Asset detail**, care afișează:

- **Balance history** — o tendință reală construită din transferurile tale on-chain.
- **Recent activity** — rânduri de tranzacții cu căutare inversă **@handle**, astfel încât contrapărțile apar după nume acolo unde este posibil.

## Staking și Earn

Punerea la staking a QOR ajută la securizarea QoreChain și îți aduce recompense. Toate operațiunile de staking sunt tranzacții reale on-chain care poartă semnătura ta post-cuantică.

### Pune la staking cu un validator

1. Deschide **Stake**.
2. Alege un validator din listă (încărcată live din lanț).
3. Introdu o sumă și **delegă** cu confirmare biometrică.
4. Revendică recompensele din același ecran ori de câte ori se acumulează.

:::note Nicio perioadă de blocare astăzi — așteptarea este doar la ieșire
Nu există un termen fix de ales, pentru că momentan nu există unul: delegarea rămâne activă, cu recompense care curg din blocul următor, până când ceri să anulezi delegarea — nu există o expirare de reînnoit și nicio durată minimă de staking. Singura perioadă de așteptare este la ieșire: odată ce anulezi delegarea, acel QOR intră într-o perioadă de unbonding de 21 de zile, timp în care nu produce recompense și nu poate fi mutat, înainte de a reveni în soldul tău disponibil. Mutarea unei delegări către un alt validator (redelegare) evită complet această așteptare. Aceasta descrie comportamentul actual al lanțului, nu o garanție permanentă — vezi [Există o perioadă de blocare?](/user-guide/staking-and-delegation#lock-in-period) pentru mai multe detalii.
:::

:::note Acest ecran nu are încă propriul buton Undelegate
Acest ecran Stake acoperă doar delegarea și revendicarea recompenselor. Pentru a anula delegarea direct dintr-un ecran QoreX, folosește [ecranul Stake al extensiei de browser](/qorex/browser-extension#stake) — sau anulează delegarea prin [Dashboard](/dashboard/staking-and-validators#delegate), care trimite cererea către orice QoreX ai conectat, inclusiv aplicația, pentru ca tu să o aprobi.
:::

### Earn

Vizualizarea **Earn** rezumă pozițiile tale active și randamentul într-un singur loc.

## Pașii următori

- [Trimite și Primește](/qorex/send-and-receive) — mută QOR și active externe.
- [Securitate și Recuperare](/qorex/security-and-recovery) — gardieni, moștenire Legacy și asocierea dispozitivelor.
