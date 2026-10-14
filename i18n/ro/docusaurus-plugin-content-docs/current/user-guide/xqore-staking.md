---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Această pagină descrie mecanismul de staking de guvernanță xQORE **așa cum a fost proiectat**, în care deținătorii de QOR și-ar bloca token-urile pentru o putere de guvernanță sporită, cu un model de rebase PvP care recompensează participanții pe termen lung. **xQORE nu poate fi folosit astăzi pe niciuna dintre rețele**; nimic din această pagină nu este încă ceva ce poți face.

:::warning Încă nelansat
xQORE este activat în geneză, dar **încă nu poate fi folosit** pe mainnet (`qorechain-vladi`, versiunea de nod **v3.2.1**) sau pe testnet (`qorechain-diana`). Nodul nu are niciun punct de intrare de tranzacție, query, CLI sau RPC pentru el, deci nu există `tx xqore lock` / `unlock`, nici `query xqore ...`, nicio rută REST xQORE și nicio metodă `qor_getXQOREPosition`, niciun QOR nu poate fi blocat, iar nimeni nu deține xQORE. Este planificat pentru o versiune viitoare a lanțului, care va schimba și modul în care sunt redistribuite penalizările de ieșire, astfel încât deblocarea să rămână ieftină indiferent câți deținători există. Versiunea va fi menționată aici la lansare.
:::

---

## Prezentare generală

În proiect, blocarea QOR emite xQORE la un **raport de 1:1**, iar xQORE contează la **dublu de greutate** în formula puterii de vot QDRW:

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW în sine este dezactivat pe rețelele live, iar voturile de guvernanță sunt numărate doar pe baza stake-ului legat (bonded) (vezi [Guvernanță](/user-guide/governance#voting-power)), așa că, chiar și după lansarea xQORE, acesta nu va schimba puterea de vot până când QDRW nu este activat de o versiune viitoare.

---

## Programul proiectat al penalizărilor de ieșire

Configurația de geneză definește o penalizare de ieșire care scade cu cât QOR a fost blocat mai mult timp:

| Durata blocării    | Penalizare de ieșire |
| ------------------ | ------------ |
| Mai puțin de 30 de zile | **50%**      |
| 30 până la 90 de zile   | **35%**      |
| 90 până la 180 de zile  | **15%**      |
| Mai mult de 180 de zile | **0%**       |

Conform proiectului, penalizările **nu sunt arse** (`penalty_burn_rate` este `0`): întreaga penalizare este redistribuită proporțional deținătorilor de xQORE rămași („rebase-ul PvP”). Mecanismul de redistribuire este partea care se va schimba în versiunea care integrează xQORE.

---

## Ce nu este disponibil

* **Blocare și deblocare.** Nu există comenzi `tx xqore` și niciun tip de tranzacție pentru a bloca sau debloca QOR.
* **Poziții.** Nu există niciun query pentru o poziție xQORE pe vreo interfață (CLI, REST sau JSON-RPC), iar `total_locked` și `total_xqore` sunt ambele zero.
* **Bonus de vot.** Astăzi nu există niciun bonus de vot xQORE.

Dacă vrei să participi acum la guvernanță, deleagă QOR unui validator (vezi [Staking și delegare](/user-guide/staking-and-delegation)) și votează propunerile (vezi [Guvernanță](/user-guide/governance)).
