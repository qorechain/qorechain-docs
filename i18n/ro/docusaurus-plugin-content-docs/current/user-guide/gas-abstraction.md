---
slug: /user-guide/gas-abstraction
title: Abstractizare Gas
sidebar_label: Abstractizare Gas
sidebar_position: 7
---

# Abstractizare Gas

Această pagină descrie funcția de abstractizare a gazului din QoreChain, a cărei concepție le permite utilizatorilor să plătească taxele de tranzacție într-un token non-nativ acceptat, în loc de QOR. **Nu poate fi folosită astăzi în niciuna dintre rețele**; această pagină explică designul și ce faceți în schimb.

:::caution Încă indisponibil
Plata taxelor într-un token non-nativ **nu** funcționează astăzi pe rețeaua principală (**`qorechain-vladi`**, versiunea de nod **v3.2.1**) și nici pe rețeaua de test (**`qorechain-diana`**).

* Interogările de abstractizare a gazului nu sunt servite pe rețeaua principală: `qorechaind query gasabstraction accepted-tokens` afișează textul de ajutor, iar ruta REST `/qorechain/gasabstraction/v1/config` returnează `Not Implemented`.
* Niciun canal IBC nu este deschis în vreuna dintre rețele, deci nu poate exista niciun sold `ibc/USDC` sau `ibc/ATOM` cu care să se plătească.
* Pragul minim al taxei de rețea este verificat în `uqor`, deci o taxă în orice altă denominare este respinsă.

Plătiți fiecare taxă în `uqor`. Această pagină va fi actualizată atunci când un token este acceptat pe o rețea activă.
:::

---

## Ce funcționează astăzi: plătiți taxele în uqor

Fiecare tranzacție plătește cel puțin **0,1 uqor per unitate de gaz**. Setați limita de gaz și taxa împreună:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Apoi semnați-o hibrid și transmiteți-o cu `qorechaind tx pqc cosign`, așa cum este descris în [Comenzi de tranzacție](/cli-reference/transaction-commands#hybrid-signing). Vezi [Taxe și gas](/cli-reference/transaction-commands#fees-and-gas) pentru limitele sugerate per tip de tranzacție.

---

## Prezentare generală

Abstractizarea gazului este concepută pentru a elimina cerința de a deține QOR pentru plata taxelor de tranzacție. Un utilizator care deține un token alternativ acceptat (de exemplu un stablecoin transferat prin IBC) ar plăti taxa în acel token, iar protocolul ar converti suma taxei în echivalentul său nativ înainte de procesare.

---

## Designul vizat

### Tokenuri acceptate

Configurația de geneză a modulului listează aceste tokenuri și ratele de conversie definite de protocol. Acestea sunt rapoarte de schimb în scopul taxelor, nu prețuri de piață. Astăzi pot exista în rețele doar `uqor` (vezi anunțul de mai sus).

| Token              | Denominare   | Rată de conversie |
| ------------------ | ------------ | ----------------- |
| **QOR**            | `uqor`       | 1.0 (nativă)      |
| **USDC** (prin IBC) | `ibc/USDC`   | 1.0               |
| **ATOM** (prin IBC) | `ibc/ATOM`   | 10.0              |

### Cum este menit să funcționeze

`GasAbstractionDecorator` din QoreChain este integrat în fluxul de procesare a tranzacțiilor. Pentru o tranzacție a cărei taxă este într-o denominare non-nativă:

1. **Verificarea taxei** — decoratorul citește denominarea taxei.
2. **Căutarea ratei** — dacă denominarea se află în lista tokenurilor acceptate, se caută rata de conversie corespunzătoare.
3. **Conversia** — taxa este convertită în echivalentul său nativ în `uqor`.
4. **Procesarea standard** — taxa convertită trece prin handler-ul standard de deducere a taxei, astfel încât procesarea ulterioară a taxei (distribuirea către validatori, arderea, trezoreria, părțile stakerilor și ale nodurilor light) operează pe echivalentul nativ.

---

## Interogarea configurației

Rețeaua principală nu servește încă interogările de abstractizare a gazului, iar metoda JSON-RPC `qor_getGasAbstractionConfig` nu este servită pe niciun punct de acces public (vezi [spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace)). În prezent nu există nicio modalitate publică de a citi o listă activă de tokenuri acceptate.
