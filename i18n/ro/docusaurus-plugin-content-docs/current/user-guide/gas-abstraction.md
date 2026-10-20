---
slug: /user-guide/gas-abstraction
title: Abstractizare Gas
sidebar_label: Abstractizare Gas
sidebar_position: 7
---

# Abstractizare Gas

Abstractizarea gazului îi permite unui utilizator să plătească o taxă de tranzacție într-un token non-nativ acceptat, în loc de QOR. Codul de conversie a taxelor face parte din lanț, dar **astăzi nu este acceptat niciun token non-nativ în niciuna dintre rețele**, deci fiecare taxă se plătește în QOR. Această pagină explică ce este activ, cum funcționează conversia așa cum a fost construită și ce faceți în schimb.

:::caution Încă indisponibil: plătiți fiecare taxă în uqor
Pe mainnet (**`qorechain-vladi`**, versiunea de nod **v3.2.3**, v3.2.4 de la înălțimea 3.742.566) și pe testnet (**`qorechain-diana`**, versiunea de nod **v3.2.4**), verificat la 20 octombrie 2026:

* Lista activă a tokenurilor acceptate conține **doar `uqor`**. Conversia taxelor a fost activată cu v3.2.2, dar nimic altceva nu este listat, plafonul de conversie per bloc este `0` (conversie oprită), iar float-ul de conversie nu deține niciun sold. O taxă plătită în orice altă denominare este refuzată cu o eroare „denom not accepted for fee payment”, atât în simulare, cât și într-o tranzacție reală.
* Niciun canal sau client IBC nu există în vreuna dintre rețele, deci nu poate exista niciun sold `ibc/…` cu care să se plătească.

Plătiți fiecare taxă în `uqor`. Această pagină va fi actualizată atunci când un token este acceptat pe o rețea activă.
:::

---

## Ce funcționează astăzi: plătiți taxele în uqor

Fiecare tranzacție plătește cel puțin **0.1 uqor per unitate de gaz**. Setați limita de gaz și taxa împreună:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Apoi semnați-o hibrid și transmiteți-o cu `qorechaind tx pqc cosign`, așa cum este descris în [Comenzi de tranzacție](/cli-reference/transaction-commands#hybrid-signing). Vezi [Taxe și gas](/cli-reference/transaction-commands#fees-and-gas) pentru limitele sugerate per tip de tranzacție.

---

## Configurația activă {#live-configuration}

Modulul își servește configurația prin REST și gRPC. Acestea sunt valorile de pe ambele rețele la 20 octombrie 2026:

| Câmp | Valoare | Semnificație |
| --- | --- | --- |
| `enabled` | `true` | Comutatorul modulului |
| `native_denom` | `uqor` | Denominarea în care se plătește în final fiecare taxă |
| `accepted_tokens` | doar `uqor` | Tokenurile care pot plăti o taxă. `uqor` nu are nevoie de o sursă de preț |
| `premium_bps` | `300` | Partea din valoarea unei taxe convertite pe care float-ul o păstrează pentru a-și acoperi riscul de preț (3 %) |
| `max_tip_multiplier` | `3` | O taxă convertită nu poate depăși acest multiplu al taxei minime pentru gazul său; `0` ar însemna fără limită |
| `float_min` | `0` | Soldul nativ pe care float-ul îl păstrează mereu în rezervă |
| `block_conversion_cap` | `0` | Cel mult cât plătește float-ul per bloc; `0` înseamnă că conversia este oprită |

Versiunile anterioare ale acestei pagini arătau intrări de substituție `ibc/USDC` și `ibc/ATOM` cu rate fixe. Ele nu se află în lista activă.

Citiți-o singuri:

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` raportează `rate`, `effective_rate` (rata minus prima), `price_source` și dacă tokenul este `usable` la această înălțime, cu un `reason` atunci când nu este. `float` raportează adresa și soldurile float-ului și utilizarea blocului curent față de `block_cap`. Metoda JSON-RPC `qor_getGasAbstractionConfig` nu este servită pe niciun punct de acces public (vezi [spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace)); folosiți REST sau gRPC.

---

## Cum funcționează conversia (așa cum a fost construită) {#how-it-works}

Începând cu v3.2.2, decoratorul de taxe direcționează fiecare tranzacție pe una dintre două căi:

* O taxă în `uqor`, sau în mai multe denominări, urmează **calea nativă**, neschimbată.
* O taxă în **exact o** denominare non-nativă urmează **calea de conversie**.

Pe calea de conversie:

1. **Acceptat?** Denominarea trebuie să se afle în lista tokenurilor acceptate și să aibă o sursă de preț, altfel tranzacția este refuzată.
2. **Preț.** Prețul tokenului provine dintr-una din două surse: o rată statică stabilită prin guvernanță, care expiră la o înălțime de bloc declarată, sau prețul mediu ponderat în timp al pool-ului [AMM](/architecture/amm) care asociază tokenul cu QOR. Un preț din pool este folosit doar dacă pool-ul este activ, deține cel puțin lichiditatea minimă configurată pe partea QOR, iar prețul său spot se află în abaterea configurată față de media sa.
3. **Valoare.** Valoarea nativă a taxei este suma în token înmulțită cu prețul, minus prima.
4. **Aceleași reguli ca la o taxă nativă.** Regulile taxei minime native și ale taxei dinamice se aplică acelei valori native, deci o taxă convertită trebuie să îndeplinească exact ce trebuie să îndeplinească o taxă în QOR (0.1 uqor per unitate de gaz ca prag minim) și este limitată de `max_tip_multiplier`.
5. **Decontare.** Tokenurile plătitorului merg către **float**-ul modulului de abstractizare a gazului, iar float-ul plătește valoarea nativă în `uqor` colectorului de taxe. Tot ce se află în aval de colectorul de taxe (arderea și părțile validatorilor, stakerilor, trezoreriei și nodurilor light) vede astfel doar `uqor`.

Conversia este limitată în trei moduri: per tranzacție (`max_tip_multiplier`), per bloc (`block_conversion_cap`) și prin soldul pe care float-ul îl păstrează mereu (`float_min`). Fiecare refuz are loc și în timpul simulării, așa că estimarea gazului eșuează la fel ca tranzacția reală.

### Obținerea acceptării unui token

* **Guvernanța** înlocuiește configurația cu `MsgUpdateConfig` (autoritate: contul de modul al guvernanței). Așa ar fi adăugat un token de taxă real `ibc/<hash>` și pool-ul sau rata sa statică și ar fi deschisă conversia.
* **Float-ul** este un cont de modul care refuză transferurile bancare obișnuite. Este alimentat cu `MsgFundFloat` (`qorechaind tx gasabstraction fund-float <amount>uqor`), de exemplu de un cont care a primit o cheltuială din community pool în acest scop.

Nicio propunere pentru niciuna dintre cele două nu a fost făcută pe mainnet, iar lista rămâne doar `uqor` până când una este adoptată.
