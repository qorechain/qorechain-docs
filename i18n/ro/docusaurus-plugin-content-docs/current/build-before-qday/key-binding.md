---
slug: /build-before-qday/key-binding
title: Cum este legată cheia ta post-cuantică de contul tău
sidebar_label: Legarea cheii
sidebar_position: 3
---

# Cum este legată cheia ta post-cuantică de contul tău

Fiecare tutorial din această secțiune folosește o **cheie post-cuantică** alături de cheia obișnuită a contului tău. Pagina asta explică, pe înțelesul tuturor, de unde vine cheia, cum află lanțul că aparține contului tău și cum poți verifica singur. Nu trebuie să rulezi nimic ca s-o citești. Verificările din [Verifică singur](#check) durează circa 5 minute.

## Ideea într-o singură imagine {#picture}

```text
fraza de recuperare (sau codul de recuperare)
        |
        v
derivă ambele chei
  - cheia clasică (secp256k1)
  - cheia post-cuantică (ML-DSA-87), legată de adresa contului tău
        |
        v
înregistrează o singură dată, cu o dovadă de posesie
        |
        v
fiecare tranzacție este semnată hibrid (ambele chei)
        |
        v
validatorii verifică ambele semnături
```

## Cuvinte folosite în această pagină {#words}

| Cuvânt | Ce înseamnă |
| --- | --- |
| Cheie clasică | Cheia ta obișnuită de cont (secp256k1). Semnează fiecare tranzacție pe orice blockchain de acest fel. |
| Cheie ML-DSA-87 | Cheia de semnare post-cuantică. Nu se așteaptă ca un viitor calculator cuantic s-o spargă. |
| Frază de recuperare (mnemonic) | Cele 12 sau 24 de cuvinte care refac un cont. |
| Cod de recuperare | O linie care începe cu `QRC1`. Înlocuiește fraza de recuperare pentru cheia post-cuantică, atunci când contul tău vine dintr-o cheie privată simplă. |
| Înregistrare | O tranzacție care spune lanțului ce cheie ML-DSA-87 aparține contului tău. |
| Dovadă de posesie | O semnătură care arată că ții cu adevărat jumătatea secretă a cheii pe care o înregistrezi. |
| Semnătură hibridă | Ambele semnături pe aceeași tranzacție. |

## 1. Derivă, nu genera {#derive}

Cheia post-cuantică nu este aleasă la întâmplare și păstrată într-un fișier pe care l-ai putea pierde. Ea este **derivată**: aceeași intrare dă mereu aceeași cheie.

- **Cu o frază de recuperare.** Cheia ML-DSA-87 vine din **aceeași frază de recuperare** ca cheia clasică, împreună cu adresa contului tău. Și cheia clasică, și cea post-cuantică se refac din frază, așa că **o singură copie de rezervă le restaurează pe amândouă**. Așa fac QoreX și contul unificat din SDK.
- **Cu o cheie privată simplă.** O cheie privată singură nu poate da o a doua cheie. Cheia post-cuantică se face atunci dintr-un **cod de recuperare** separat, care începe cu `QRC1`. În proiectul Workshop 1 îl creezi cu `pnpm window recovery-code`. În SDK este `generatePqcRecoveryCode()`.

Trei reguli pentru un cod de recuperare:

1. Ține-l **separat** de cheia privată. Dacă amândouă stau în același loc, un singur furt le ia pe amândouă.
2. Refolosește mereu **același** cod pentru același cont.
3. Un **cod diferit dă o cheie diferită**. Lanțul vede atunci o cheie care nu se potrivește cu cea pe care ai înregistrat-o.

:::caution Un cod de recuperare nu poate fi refăcut
Nu există nicio cale de a recupera un cod de recuperare pierdut. Scrie-l pe hârtie când îl creezi. Conturile de testnet de unică folosință sunt excepția: poți face un cont nou într-un minut.
:::

## 2. Leagă o singură dată, cu o dovadă de posesie {#bind}

Legarea înseamnă o tranzacție, trimisă o singură dată pentru fiecare cont, numită `MsgRegisterPQCKeyV2`. Ea conține:

- **cheia publică** ML-DSA-87 (2.592 de octeți) și
- o **dovadă de posesie**: cheia semnează un text scurt care numește lanțul și contul tău. Nimeni nu poate lega o cheie pe care nu o deține și nimeni nu poate copia o legare de pe alt lanț.

Acesta este singurul mesaj pe care lanțul îl acceptă doar cu **semnătura clasică**. Motivul este simplu: înainte de el, lanțul nu are nicio cheie post-cuantică înregistrată pentru contul tău, deci nu are cu ce să verifice o a doua semnătură.

Cum o faci:

| Unde | Cum |
| --- | --- |
| QoreX | Automat, la prima ta trimitere. Costă o taxă unică de circa 0,09 QOR. |
| Workshop 1 și aplicațiile exemplu | `pnpm window register` (pasul 5 din [ghidul Workshop 1](/build-before-qday/workshop-1#step-5)). |
| Propriul tău cod | `ensurePqcRegistered` din SDK. |

`ensurePqcRegistered` poate fi apelat din nou fără risc. Citește mai întâi contul tău. Dacă cheia ta este deja legată, nu trimite nimic. Dacă este legată o cheie **diferită**, se oprește cu `PqcKeyMismatchError` și nu trimite nimic. Dacă trimiți manual o a doua înregistrare, lanțul o refuză și **tot îți ia taxa**, așa că lasă ajutorul să facă verificarea.

:::note Ce cere lanțul astăzi
Lanțul verifică o dovadă de posesie ori de câte ori există una și refuză înregistrarea dacă aceasta nu se verifică. SDK-ul și QoreX atașează una singure. Pe mainnet, o înregistrare fără dovadă este încă acceptată. Pe testnet, începând cu versiunea v3.2.8, prima tranzacție a unui cont nou trebuie să fie această înregistrare. Detalii: [Semnarea post-cuantică](/developer-guide/post-quantum-signing#proof-of-possession).
:::

## 3. După legare, totul este hibrid {#hybrid}

De atunci încolo, fiecare tranzacție nativă poartă două semnături:

- semnătura clasică secp256k1 (64 de octeți) și
- semnătura ML-DSA-87 (4.627 octeți) într-o extensie numită `PQCHybridSignature`.

Validatorii le verifică pe **amândouă**. Când o fac, lanțul înregistrează un eveniment `pqc_hybrid_verify` cu statusul `verified`.

Fără o cheie înregistrată, o tranzacție este refuzată cu `account has no PQC key and classical fallback is disabled`.

Tranzacțiile de pe banda EVM (de exemplu, implementarea unui contract) mai cer un lucru: o fereastră de autorizare EVM, deschisă printr-un mesaj semnat hibrid. Vezi [referința ferestrei EVM](/developer-guide/evm-window-reference).

## Verifică singur {#check}

Ai nevoie de `curl`. `jq` este opțional. Amândouă sunt explicate în [Înainte de a începe](/build-before-qday/prerequisites#curl-jq).

### Este cheia mea înregistrată? {#check-account}

1. Înlocuiește `qor1...` cu adresa ta și rulează:

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...
```

Ce face: cere serverului public de testnet înregistrarea cheii contului tău.

Parametri:

- `curl`: un program care aduce o adresă web.
- `-s`: silențios, așa că ascunde bara de progres și arată doar răspunsul.
- `https://api-testnet.qore.host/qorechain/pqc/v1/account/qor1...`: adresa REST de testnet, urmată de contul tău.

**Ce ar trebui să vezi:** pentru un cont înregistrat, un răspuns ca acesta (sunt afișate valori de exemplu, al tău are valori reale):

```json
{
  "found": true,
  "account": {
    "address": "qor1...",
    "public_key": "<base64 ML-DSA-87 public key>",
    "algorithm_id": 1,
    "algorithm_name": "dilithium5",
    "ecdsa_pubkey": "<your classical public key>",
    "key_type": "hybrid",
    "created_at_height": "<block height>",
    "migration_public_key": null,
    "migration_algorithm_id": 0,
    "classical_key_source": "auth_account",
    "possession_proven": true
  }
}
```

`found` este `true` când o cheie este legată și `false` când nu este. `possession_proven` este `true` când cheia a fost înregistrată cu o dovadă de posesie verificată.

### A fost tranzacția mea semnată hibrid? {#check-tx}

Verificarea din Workshop 1, pasul 6.

1. Înlocuiește `<HASH>` cu hash-ul unei tranzacții de-ale tale (fără `<` și `>`) și rulează:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Ce face: cere serverului public de testnet înregistrarea completă a tranzacției tale.

**Ce ar trebui să vezi:** un bloc lung de text. Caută trei lucruri:

1. `"code": 0` în `tx_response`. Codul 0 înseamnă succes.
2. Extensia `PQCHybridSignature`, care conține semnătura ML-DSA-87: **4.627 octeți**, lângă semnătura secp256k1 de 64 de octeți.
3. În `events`, un eveniment de tip `pqc_hybrid_verify` cu atributul `status` setat la `verified`.

2. Ca să afișezi doar acel eveniment (necesită `jq`):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ce face: aduce aceeași înregistrare și o trece prin `jq`, care păstrează doar evenimentul de verificare.

**Ce ar trebui să vezi:** un eveniment al cărui atribut `status` este `verified`.

## Chei și modificări înrudite {#related}

- **Chei de criptare.** Cheile ML-KEM-1024, folosite de [QoreSeal](/developer-tools/qoreseal) pentru a cripta date către un cont, trăiesc într-un **registru separat**. Publici una cu `MsgRegisterKEMKey`, într-o tranzacție semnată hibrid, deci contul trebuie să aibă deja cheia lui ML-DSA-87.
- **Schimbarea cheii de semnare.** `MsgRotatePQCKey` înlocuiește cheia ML-DSA-87 cu una nouă de același tip, de exemplu ca să retragi o cheie compromisă. `MsgMigratePQCKey` trece de la un algoritm la altul. Amândouă cer semnături de la cheia veche și de la cea nouă, iar lanțul refuză o cheie pe care contul a folosit-o înainte. Amândouă sunt active pe mainnet și pe testnet. Regulile complete: [Semnarea post-cuantică](/developer-guide/post-quantum-signing).

## Depanare {#troubleshooting}

| Ce vezi | De ce | Ce faci |
| --- | --- | --- |
| `account has no PQC key and classical fallback is disabled` | Contul nu și-a înregistrat încă cheia ML-DSA-87. | Înregistrează mai întâi (`pnpm window register`, prima trimitere din QoreX sau `ensurePqcRegistered`), apoi trimite din nou. Verifică cu interogarea contului de mai sus. |
| `PqcKeyMismatchError`, sau `registered, but NOT this key` în `pnpm window status` | O cheie diferită este deja legată. Ai folosit alt cod de recuperare sau altă frază decât prima dată. | Pune la loc codul de recuperare sau fraza originală. Pentru un cont de unică folosință, începe din nou cu un cont nou. |
| Înregistrare refuzată ca fiind deja făcută | Contul deține deja o cheie. O a doua înregistrare simplă tot îți ia taxa. | Nu face nimic. Citește contul cu interogarea de mai sus sau folosește `ensurePqcRegistered`, care verifică mai întâi. |
| Ți-ai pierdut codul de recuperare | Nu poate fi refăcut din cheia privată. | Dacă contul vine dintr-o frază de recuperare, folosește aceeași frază: dă aceeași cheie. Altfel, folosește un cont nou. Pe testnet nu costă nimic. |
| Înregistrarea eșuează cu un mesaj despre taxă sau sold | Contul are prea puțin QOR pentru taxă (circa 0,09 QOR) sau taxa este sub pragul rețelei de 0,1 uqor per unitate de gaz. | Ia QOR de la [faucet](https://dashboard.qorechain.io/faucet), setează gazul la circa 600.000 pentru o înregistrare manuală și încearcă din nou. |
| `found` este `false` deși te-ai înregistrat | Întrebi rețeaua greșită sau adresa greșită. | Verifică dacă folosești `api-testnet.qore.host` pentru testnet și propria ta adresă `qor1...`. Un portofel poate arăta o altă rețea decât proiectul tău. |
| Contul răspunde `found: true`, dar tranzacțiile tale eșuează | Cheia de pe lanț nu este cea pe care o derivă proiectul tău. | Rulează `pnpm window status` și compară cu codul de recuperare din `.env`. |

## Pasul următor {#next}

Întoarce-te la [ghidul Workshop 1](/build-before-qday/workshop-1#step-5) și înregistrează-ți cheia, sau citește [prezentarea](/build-before-qday/overview).
