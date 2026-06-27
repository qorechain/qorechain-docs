---
slug: /user-guide/gas-abstraction
title: Abstractizarea gazului
sidebar_label: Abstractizarea gazului
sidebar_position: 7
---

# Abstractizarea gazului

Acest ghid descrie funcționalitatea de abstractizare a gazului din QoreChain, care le permite utilizatorilor să plătească comisioanele de tranzacție în tokeni non-nativi în loc de QOR.

:::note
Comenzile de mai jos folosesc testnet-ul **`qorechain-diana`** (EVM chain ID **9800**). Mainnet-ul (**`qorechain-vladi`**, EVM chain ID **9801**) este activ de la 7 iunie 2026, rulând versiunea de lanț **v3.1.77** — înlocuiește chain ID-ul și endpoint-urile de mainnet din pagina **Conectarea la Mainnet** când tranzacționezi pe mainnet.
:::

---

## Prezentare generală

Abstractizarea gazului elimină cerința de a deține tokeni QOR pentru a plăti comisioanele de tranzacție. Utilizatorii care dețin tokeni alternativi acceptați (cum ar fi USDC sau ATOM transferați prin IBC) pot folosi acei tokeni direct ca plată a comisionului. Protocolul convertește automat suma comisionului în echivalentul ei nativ înainte de procesare.

---

## Tokeni acceptați

Următorii tokeni sunt acceptați pentru plata comisioanelor:

| Token              | Denominare   | Rată de conversie | Exemplu de comision  |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0 (nativ)     | `--fees 500uqor`     |
| **USDC** (prin IBC) | `ibc/USDC`  | 1.0             | `--fees 500ibc/USDC` |
| **ATOM** (prin IBC) | `ibc/ATOM`  | 10.0            | `--fees 50ibc/ATOM`  |

:::note
Ratele de conversie reflectă raportul de schimb definit de protocol, nu prețurile de piață. O rată de 10.0 pentru ATOM înseamnă că 1 unitate de ibc/ATOM este echivalentă cu 10 unități de uqor în scopuri de comision.
:::

---

## Cum funcționează

`GasAbstractionDecorator` din QoreChain este integrat în pipeline-ul de procesare a tranzacțiilor. Când o tranzacție include comisioane într-o denominare non-nativă, se întâmplă următoarele:

1. **Inspectarea comisionului** — Decoratorul verifică denominarea comisionului specificată în tranzacție.
2. **Căutarea ratei** — Dacă denominarea se află în lista de tokeni acceptați, protocolul caută rata de conversie corespunzătoare.
3. **Conversie** — Suma comisionului este convertită în echivalentul ei nativ uqor folosind rata de conversie.
4. **Procesare standard** — Comisionul convertit este transmis handler-ului standard `DeductFee` pentru deducerea din contul expeditorului. Conversia este transparentă pentru restul pipeline-ului de tranzacții. Toată procesarea ulterioară a comisioanelor (distribuirea către validatori, arderea, alocarea către trezorerie, recompensele pentru stakeri și recompensele pentru nodurile light) operează pe echivalentul nativ uqor.

---

## Exemple de utilizare

### Plata comisioanelor în USDC

Trimite un transfer de tokeni cu comisioane plătite în USDC:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Deoarece USDC are o rată de conversie de 1.0, 500 ibc/USDC este echivalent cu 500 uqor.

### Plata comisioanelor în ATOM

Trimite un transfer de tokeni cu comisioane plătite în ATOM:

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Deoarece ATOM are o rată de conversie de 10.0, 50 ibc/ATOM este echivalent cu 500 uqor.

---

## Interogarea tokenilor acceptați

Obține lista tokenilor acceptați în prezent pentru abstractizarea gazului, împreună cu ratele lor de conversie:

```bash
qorechaind query gasabstraction accepted-tokens
```

**Exemplu de ieșire:**

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

## Acces prin JSON-RPC

Pentru aplicațiile care se integrează prin JSON-RPC, interoghează configurația abstractizării gazului:

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

* Abstractizarea gazului este ideală pentru utilizatorii care provin din alte ecosisteme și care s-ar putea să nu dețină încă QOR.
* Ratele de conversie sunt stabilite prin guvernanță și pot fi actualizate prin propuneri de modificare a parametrilor.
* Dacă deții mai mulți tokeni acceptați, oricare dintre ei poate fi folosit pentru comisioane la orice tip de tranzacție.
* Tokenul efectiv specificat în `--fees` este dedus din contul tău. Conversia este folosită doar pentru a valida că comisionul îndeplinește cerința minimă.

:::
