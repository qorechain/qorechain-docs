---
slug: /dashboard/staking-and-validators
title: Staking și validatori
sidebar_label: Staking și validatori
sidebar_position: 8
---

# Staking și validatori

Pagina **Validatori** îți permite să analizezi validatorii rețelei și să faci staking cu QOR delegându-le. Delegarea ajută la securizarea rețelei și aduce recompense de staking. Pentru conceptele din spatele delegării și recompenselor, vezi [Staking și delegare](/user-guide/staking-and-delegation).

Conectează-ți portofelul pentru a face staking — vezi [Prezentare generală și primii pași](/dashboard/overview#connect-your-wallet).

## Analizează validatorii

Pagina se deschide cu carduri de rezumat pentru numărul de validatori activi, totalul de QOR în staking (bonded), comisionul mediu și disponibilitatea medie (uptime). Sub acestea se află lista de validatori. Fiecare validator afișează:

- Un **rang** și **monikerul** (numele) validatorului, cu adresa sa și un buton de copiere.
- **Puterea de vot** — miza în staking (bonded) a validatorului și ponderea sa din total.
- **Comisionul** — procentul pe care validatorul îl reține din recompense.
- **APY** — estimarea randamentului anual pentru delegare.
- **Statusul** — de exemplu activ sau penalizat (jailed).
- Detalii operaționale precum regiunea, disponibilitatea (uptime), blocurile propuse, versiunea software și ultima activitate.

O casetă de căutare filtrează lista după numele sau adresa validatorului.

## Alege un validator

Când alegi un validator căruia să-i delegi, ia în considerare:

- **Comisionul** — o rată mai mică îți lasă mai multe recompense, dar operatorii sustenabili au nevoie de o cotă rezonabilă.
- **Disponibilitatea și statusul** — preferă validatorii activi cu disponibilitate (uptime) ridicată; un validator penalizat (jailed) nu câștigă.
- **Puterea de vot** — distribuirea mizei între mai mulți validatori sprijină descentralizarea.

## Deleagă, redeleagă și revendică

Cu un portofel conectat, poți:

- **Delega** QOR unui validator pentru a începe să câștigi recompense.
- **Redelega** miza ta de la un validator la altul.
- **Anula delegarea (undelegate)** pentru a începe retragerea mizei tale.
- **Revendica recompensele** acumulate din delegările tale.

:::note Perioadă de deblocare (unbonding)
QOR a cărui delegare a fost anulată trece printr-o perioadă de deblocare (unbonding) înainte de a redeveni cheltuibil, perioadă în care nu generează recompense. Vezi [Staking și delegare](/user-guide/staking-and-delegation) pentru detalii.
:::

## Înrudite

- [Staking și delegare](/user-guide/staking-and-delegation) — conceptele complete de staking.
- [Validatori în Explorer](/dashboard/explorer#validators) — răsfoiește validatorii fără un portofel.
- [Centrul de instrumente](/dashboard/tools-hub) — aplică pentru a-ți rula propriul validator.
