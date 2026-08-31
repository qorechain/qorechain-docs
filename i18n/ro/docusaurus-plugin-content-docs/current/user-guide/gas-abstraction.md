---
slug: /user-guide/gas-abstraction
title: Abstractizare Gas
sidebar_label: Abstractizare Gas
sidebar_position: 7
---

# Abstractizare Gas

Acest ghid descrie funcția de abstractizare a gazului din QoreChain, care le permite utilizatorilor să plătească taxele de tranzacție în tokenuri non-native, în loc de QOR.

:::note
Comenzile de mai jos folosesc rețeaua de testare **`qorechain-diana`** (ID lanț EVM **9800**). Rețeaua principală (**`qorechain-vladi`**, ID lanț EVM **9801**) rulează live din 7 iunie 2026, folosind versiunea de lanț **v3.1.95** — înlocuiți ID-ul lanțului și punctele de acces (endpoints) ale rețelei principale din pagina **Connecting to Mainnet** atunci când tranzacționați pe rețeaua principală.
:::

---

## Prezentare generală

Abstractizarea gazului elimină cerința de a deține tokenuri QOR pentru plata taxelor de tranzacție. Utilizatorii care dețin tokenuri alternative acceptate (precum USDC sau ATOM transferate prin IBC) pot folosi aceste tokenuri direct pentru plata taxelor. Protocolul convertește automat suma taxei în echivalentul său nativ înainte de procesare.

---

## Tokenuri acceptate

Următoarele tokenuri sunt acceptate pentru plata taxelor:

| Token              | Denominare | Rată de conversie | Exemplu de taxă      |
| ------------------ | ---------- | ------------------ | --------------------- |
| **QOR**            | `uqor`       | 1.0 (nativă)    | `--fees 500uqor`     |
| **USDC** (prin IBC) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (prin IBC) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
Ratele de conversie reflectă raportul de schimb definit de protocol, nu prețurile de piață. O rată de 10.0 pentru ATOM înseamnă că 1 unitate de ibc/ATOM este echivalentă cu 10 unități de uqor în scopul plății taxelor.
:::

---

## Cum funcționează

`GasAbstractionDecorator` din QoreChain este integrat în fluxul de procesare a tranzacțiilor. Atunci când o tranzacție include taxe într-o denominare non-nativă, se întâmplă următoarele:

1. **Verificarea taxei** — Decoratorul verifică denominarea taxei specificată în tranzacție.
2. **Căutarea ratei** — Dacă denominarea se află în lista tokenurilor acceptate, protocolul caută rata de conversie corespunzătoare.
3. **Conversia** — Suma taxei este convertită în echivalentul său nativ în uqor, folosind rata de conversie.
4. **Procesarea standard** — Taxa convertită este transmisă către handler-ul standard `DeductFee` pentru a fi dedusă din contul expeditorului. Conversia este transparentă pentru restul fluxului de procesare a tranzacției. Toată procesarea ulterioară a taxei (distribuirea către validatori, arderea, alocarea către trezorerie, recompensele stakerilor și recompensele nodurilor ușoare) operează pe echivalentul nativ în uqor.

---

## Exemple de utilizare

### Plata taxelor în USDC

Trimiteți un transfer de tokenuri cu taxele plătite în USDC:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Deoarece USDC are o rată de conversie de 1.0, 500 ibc/USDC este echivalent cu 500 uqor.

### Plata taxelor în ATOM

Trimiteți un transfer de tokenuri cu taxele plătite în ATOM:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Deoarece ATOM are o rată de conversie de 10.0, 50 ibc/ATOM este echivalent cu 500 uqor.

---

## Interogarea tokenurilor acceptate

Recuperați lista tokenurilor acceptate în prezent pentru abstractizarea gazului, împreună cu ratele lor de conversie:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Exemplu de rezultat:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## Acces JSON-RPC

Pentru aplicațiile care se integrează prin JSON-RPC, interogați configurația abstractizării gazului:

```
qor_getGasAbstractionConfig
```

**Cerere:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Răspuns:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* Abstractizarea gazului este ideală pentru utilizatorii care se alătură din alte ecosisteme și care s-ar putea să nu dețină încă QOR.
* Ratele de conversie sunt stabilite prin guvernanță și pot fi actualizate prin propuneri de schimbare a parametrilor.
* Dacă dețineți mai multe tokenuri acceptate, oricare dintre ele poate fi folosit pentru taxe, pe orice tip de tranzacție.
* Tokenul efectiv specificat în `--fees` este dedus din contul dvs. Conversia este folosită doar pentru a valida că taxa îndeplinește cerința minimă.

:::
