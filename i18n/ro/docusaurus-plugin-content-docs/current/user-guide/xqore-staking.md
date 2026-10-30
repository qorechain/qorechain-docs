---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Această pagină descrie mecanismul de staking de guvernanță xQORE **așa cum a fost proiectat**, în care deținătorii de QOR și-ar bloca token-urile pentru o putere de guvernanță sporită, cu un model de rebase PvP care recompensează participanții pe termen lung. **xQORE nu poate fi folosit astăzi pe niciuna dintre rețele**; nimic din această pagină nu este încă ceva ce poți face.

:::warning Încă nelansat
xQORE este activat în geneză, dar **încă nu poate fi folosit** pe mainnet (`qorechain-vladi`, versiunea de nod **v3.2.5**) sau pe testnet (`qorechain-diana`, versiunea de nod **v3.2.6**); niciuna dintre versiuni nu schimbă acest lucru (verificat la 23 octombrie 2026 pe ambele și din nou la 27 octombrie 2026 pentru testnet și la 30 octombrie 2026 pentru mainnet, după v3.2.5). Nodul nu are niciun punct de intrare de tranzacție, query, CLI sau RPC pentru el (ruta REST `/qorechain/xqore/v1/params` returnează `Not Implemented` pe ambele rețele), deci nu există `tx xqore lock` / `unlock`, nici `query xqore ...`, nicio rută REST xQORE și nicio metodă `qor_getXQOREPosition`, niciun QOR nu poate fi blocat, iar nimeni nu deține xQORE. Este planificat pentru o versiune viitoare a lanțului, care va schimba și modul în care sunt redistribuite penalizările de ieșire, astfel încât deblocarea să rămână ieftină indiferent câți deținători există. Versiunea va fi menționată aici la lansare.
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

---

## Stakingul cu blocare în timp este o funcționalitate diferită (v3.2.4) {#staking-tiers}

Versiunea **v3.2.4**, care rulează pe testnet din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026 (înălțimea 3,742,566, propunerea de guvernanță 13; mainnet rulează v3.2.5 din 29 octombrie 2026), adaugă un modul separat, `x/stakingtier`, pentru **staking opțional cu blocare în timp**. Nu este xQORE: nu emite xQORE, nu schimbă puterea de vot și nu atinge parametrii xQORE de mai sus. Pe scurt:

* Un delegator blochează o delegare către un validator pentru un termen ales (modulul oferă 3, 6 și 12 luni). Cât timp blocarea este în curs, suma blocată nu poate fi dedelegată sau redelegată, prin nicio cale de mesaj (o tranzacție, authz, un contract sau guvernanța).
* Blocările au o dimensiune minimă și o limită privind câte poate deține un delegator; citiți-le de la `GET /qorechain/stakingtier/v1/params`.
* O componentă suplimentară de recompensă, definită de parametrii modulului, este creditată pe epocă de inflație și revendicată cu un mesaj separat. Mărimea acelei componente este un parametru al modulului și nu este indicată pe această pagină.
* O blocare poate fi eliberată anticipat. Eliberarea anticipată pierde ce s-a acumulat și nu a fost revendicat și implică o penalizare, din care o parte este arsă.
* Blocările și starea contului de modul pot fi citite la `/qorechain/stakingtier/v1/locks/{holder}` și `/qorechain/stakingtier/v1/pool`.

Modulul răspunde pe ambele rețele, de exemplu `GET https://api.qore.host/qorechain/stakingtier/v1/params`. Delegarea obișnuită este tratată în [Staking și delegare](/user-guide/staking-and-delegation).
