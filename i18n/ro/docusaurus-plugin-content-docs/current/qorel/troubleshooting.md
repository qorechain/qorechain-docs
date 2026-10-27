---
slug: /qorel/troubleshooting
title: Depanare și FAQ QORel
sidebar_label: Depanare
sidebar_position: 9
---

# Depanare și FAQ

Întrebări și remedii pentru rularea QORel, în ordinea în care le întâlnesc de obicei oamenii. Este destinată operatorilor al căror relayer nu pornește, refuză să trimită sau lasă pachete în așteptare. QORel este astăzi doar pentru testnet, deci fiecare răspuns presupune `qorechain-diana`.

## Inovații {#innovations}

Majoritatea problemelor pe un lanț hibrid sunt prinse înainte să se cheltuiască o taxă:

- **Verificarea dinaintea trimiterii numește problema.** Dacă cheia post-cuantică nu este încărcată, nu este înregistrată sau nu este cheia locală, ori versiunea octeților de semnat este necunoscută, QORel nu trimite nimic și spune care dintre ele este.
- **`keys pqc-status` este prima comandă de rulat.** Arată înregistrarea, potrivirea cheii, dovada de posesie, versiunea octeților de semnat pe care o verifică lanțul și `ready_to_relay`.
- **`health-check` explică configurările greșite**, inclusiv un multiplicator de gas sub 1.1 pe o intrare QoreChain.

## Cum se folosește {#how-to-use}

Rulați mai întâi acestea și comparați:

```bash
qorel --version
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

### Chei și înregistrare {#keys}

**`ready_to_relay` este `false`. Ce fac?**
Citiți celelalte câmpuri din `keys pqc-status`:
- `registered: false`: contul nu are nicio cheie post-cuantică înregistrată. Alimentați contul, apoi rulați `qorel keys register-pqc --chain qorechain-diana`.
- `registered: true` dar `matches_local_key: false`: contul are înregistrată o altă cheie decât cea pe care o deține QORel. Verificați că ați folosit mnemonicul propriu al contului și `--key-name` corect. Dacă ați re-adăugat cheia, `keys add --overwrite` reconstruiește cheia locală și seed-ul ei `<key name>.pqc` din mnemonic.
- Comanda nu reușește să încarce cheia: fișierul `<key name>.pqc` de lângă cheie lipsește sau nu poate fi citit. Rulați din nou `keys add` pentru acel lanț.

**`keys register-pqc` spune că contul are deja o cheie diferită.**
Nu a trimis nimic, intenționat. Cheia din lanț a fost înregistrată dintr-un alt mnemonic sau de o altă unealtă. Folosiți mnemonicul original sau rotiți cheia din lanț pornind de la cea veche ([Semnarea post-cuantică](/developer-guide/post-quantum-signing#key-rotation)); o cheie pe care contul a folosit-o înainte nu poate fi înregistrată din nou.

**`keys register-pqc` eșuează cu o eroare de taxă sau de sold.**
Contul are nevoie de QOR pe testnet înainte de a-și putea trimite prima tranzacție. Folosiți [Faucet-ul din Dashboard](/dashboard/faucet). Înregistrarea necesită câteva sute de mii de unități de gas; la minimul de 0.1 uqor, asta înseamnă câteva zeci de mii de uqor.

**Am nevoie de `--no-proof`?**
Doar pentru o rețea mai veche decât v3.2.3. Ambele rețele QoreChain acceptă o dovadă de posesie, iar QORel adaugă una implicit.

**Unde este stocată cheia mea post-cuantică?**
Lângă cheia secp256k1, ca `<key name>.pqc` (un seed de 32 de octeți), cu drept de citire doar pentru proprietar. Poate fi rederivată din mnemonic. Faceți backup mnemonicului, nu fișierelor.

**Fișierele mele de chei pot fi citite de alții.**
QORel scrie fișierele de chei noi cu 0600. Cheile adăugate cu un Hermes mai vechi își păstrează modul vechi; rulați `chmod 600` pe ele.

### Configurare {#config}

**Configurația este refuzată cu un mesaj despre `extension_options`.**
`extension_options` statice nu pot fi combinate cu `signing = 'qorechain-hybrid'`: semnătura post-cuantică trebuie să fie singura opțiune de extensie critică. Eliminați-le din intrarea acelui lanț.

**Spune că lanțul nu folosește `signing = "qorechain-hybrid"`.**
Comenzile pentru chei post-cuantice funcționează doar pe lanțurile cu această setare. Adăugați-o la intrarea QoreChain.

**Trebuie să setez versiunea octeților de semnat?**
Nu. `pqc.sign_bytes = 'auto'` o citește din lanț, o recitește în fiecare minut și după orice refuz. Un `v1` sau `v2` fix care nu corespunde cu lanțul face ca acesta să refuze fiecare tranzacție.

**`pqc-status` arată `sign_bytes` ca necunoscut.**
QORel nu a putut citi înregistrările de upgrade ale lanțului. Verificați că `rpc_addr` din intrarea QoreChain răspunde și indică rețeaua corectă (`qorechain-diana` pe testnet). QORel nu va semna fără o versiune cunoscută.

**Ce multiplicator de gas să folosesc?**
`1.1` este valoarea implicită din exemplu și menține `health-check` liniștit. Pe testnet (v3.2.6) o valoare mai mică, precum `1.05`, funcționează. Build-urile anterioare raportează mai puțin decât în realitate gas-ul simulat, deci folosiți `1.15` pe un nod care rulează unul. Vezi [Gas](/qorel/configuration#gas).

**`health-check` avertizează despre multiplicatorul de gas.**
Este sub 1.1 pe o intrare QoreChain. Este doar un avertisment; relay-ul funcționează. Măriți-l dacă vedeți eșecuri de tip out-of-gas.

### Trimitere și relay {#relaying}

**Lanțul refuză o tranzacție cu codespace `pqc`, code 21.**
Semnătura hibridă nu s-a verificat. QORel recitește versiunea octeților de semnat și înregistrarea înainte de tranzacția următoare și reîncearcă. Dacă se repetă: confirmați că `id` din intrarea lanțului este exact chain ID-ul (`qorechain-diana`), că cheia este cea înregistrată (`keys pqc-status`) și că nodul pe care îl folosiți rulează versiunea pe care o așteptați. [Semnarea post-cuantică](/developer-guide/post-quantum-signing#code-21) listează cauzele.

**Nu se trimite nimic și nu se cheltuiește nicio taxă, dar relayer-ul loghează o eroare.**
Este verificarea dinaintea trimiterii care își face treaba. Linia de log numește piesa lipsă: cheie neîncărcată, cheie neînregistrată, cheie diferită sau versiune necunoscută a octeților de semnat. Remediați ca mai sus.

**Erori `account sequence mismatch`.**
Două procese semnează cu aceeași cheie de relayer. Rulați un relayer per cheie; aceasta include un serviciu systemd plus un container și un al doilea pod Kubernetes.

**Văd `429 Too Many Requests` în loguri.**
Endpoint-ul limitează rata, de obicei unul public după o repornire. QORel îl tratează ca reîncercabil și ține activi worker-ii de pachete, reîncercând la fiecare interval de golire. Pentru un relay constant folosiți propriile noduri sau un endpoint plătit. Testnet-ul QoreChain nu are un endpoint gRPC public, deci partea QoreChain are oricum nevoie de nodul dumneavoastră.

**Taxe sau erori out-of-gas pe QoreChain.**
Taxa este limita de gas înmulțită cu prețul, fără rambursare, iar minimul este 0.1 uqor per gas. Verificați `gas_price`, că `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` este setat și soldul contului (`qorel keys balance --chain qorechain-diana`).

### Pachete și canale {#packets}

**Transferul meu este în așteptare și nu ajunge nimic.**
Verificați, în ordine: un relayer rulează pentru canal (procesul este pornit; telemetria răspunde); canalul este în `packet_filter` pe ambele lanțuri; relayer-ul are sold pe lanțul destinație; cheia post-cuantică este pregătită; endpoint-urile sunt accesibile. Apoi rulați `qorel query packet pending` pentru canal. Dacă niciun relayer nu rulează, pachetul așteaptă până când pornește unul sau transferul expiră.

**Ce se întâmplă dacă un transfer expiră?**
Când relayer-ul rulează, transmite timeout-ul, iar tokenurile sunt rambursate expeditorului pe lanțul sursă. Acest lucru a fost testat pe canalul de testnet.

**Pot folosi canalul de test existent sau am nevoie de al meu?**
`channel-0` al testnet-ului către `channel-600` al testnet-ului Hub este deschis ([Canalul de test](/user-guide/bridging-assets#ibc-test-channel)); rulați QORel cu acel `packet_filter` pentru a-l transmite. Creați-l pe al dumneavoastră cu `qorel create channel ... --new-client-connection` doar dacă aveți nevoie.

**`create channel` eșuează la jumătate.**
Handshake-ul înseamnă mai multe tranzacții pe ambele lanțuri. Rulați `qorel health-check`, remediați cauza, apoi rulați din nou comanda cu `--a-connection` setat la conexiunea pe care a creat-o deja, sau începeți din nou cu `--new-client-connection`.

**Funcționează Hermes standard cu QoreChain?**
Nu. QoreChain refuză o tranzacție fără semnătura ML-DSA-87, iar Hermes standard nu o adaugă. QORel este Hermes plus acea semnătură.

### General {#general}

**Poate QORel să facă relay pentru alte lanțuri decât QoreChain?**
Da. Un lanț fără `signing` folosește formatul standard de tranzacție Hermes, octet cu octet.

**Suportă mainnet?**
Încă nu. Niciun canal IBC de mainnet nu este deschis. Când se deschide IBC pe mainnet, acest manual va spune.

**Suportă IBC v2?**
Încă nu. Relay-ul pentru IBC v2 nu este implementat în QORel; este faza următoare. Relay-ul pentru Ethereum (Eureka) nu a fost început.

**Windows?**
Nu. Folosiți containerul sub WSL2.

**Unde raportez o problemă?**
Deschideți un issue pe [github.com/qorechain/QORel](https://github.com/qorechain/QORel/issues). Includeți versiunea QORel, intrarea de lanț cu datele sensibile eliminate și rezultatul `qorel keys pqc-status`; nu postați niciodată un mnemonic, un fișier de chei sau un seed `.pqc`.

## Cum se accesează {#how-to-access}

- Fiecare comandă de mai sus se rulează pe gazda relayer-ului, cu aceeași configurație ca relayer-ul.
- Starea publică cu care să comparați: REST-ul testnet-ului QoreChain la `https://api-testnet.qore.host` ([Conectarea la Testnet](/getting-started/connecting-to-testnet)) și [exploratorul de blocuri](https://explore.qore.network) (comutați pe Testnet).

## Unde este publicat {#where-published}

QORel se află în depozitul [qorechain/QORel](https://github.com/qorechain/QORel); issue-urile se deschid acolo. Ghidul Hermes din amonte, [hermes.informal.systems](https://hermes.informal.systems), acoperă setările și comenzile pe care QORel le împarte cu el.

## Limite și probleme cunoscute {#limits}

- **Doar testnet**, și o versiune 0.x.
- **Încă fără relay IBC v2** (faza următoare) și fără relay Ethereum (Eureka).
- **Endpoint-urile terților limitează rata.** Endpoint-urile din partea Hub din configurația exemplu sunt publice și nu sunt administrate de QoreChain.
- **Această pagină nu poate acoperi fiecare eroare Hermes.** Pentru erorile care nu menționează cheia post-cuantică, octeții de semnat sau QoreChain, se aplică ghidul Hermes și tracker-ul lui de issue-uri.

Vezi și: [Configurare](/qorel/configuration), [Monitorizare](/qorel/monitoring), [Semnarea din orice limbaj](/qorel/signing-from-any-language).
