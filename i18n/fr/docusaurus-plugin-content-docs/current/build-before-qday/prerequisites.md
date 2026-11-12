---
slug: /build-before-qday/prerequisites
title: "Avant de commencer : les outils et un portefeuille testnet"
sidebar_label: "Avant de commencer"
sidebar_position: 2
---

# Avant de commencer : les outils et un portefeuille testnet

Chaque tutoriel de cette section part d'un ordinateur où rien n'est installé. Cette page est le seul endroit où vous préparez cette installation. Faites-le une fois, puis ouvrez n'importe quel tutoriel. Chaque tutoriel renvoie ici et ne répète que les courtes commandes de vérification dont il a besoin.

**Durée :** environ 20 à 40 minutes la première fois, surtout du temps de téléchargement. Vous n'installez que les outils du tutoriel que vous voulez suivre.

:::caution Un compte testnet jetable uniquement
Tout ce qui suit s'exécute sur le **testnet** de QoreChain, où le QOR n'a aucune valeur. N'utilisez jamais votre vrai portefeuille, une vraie phrase de récupération ou de vrais fonds dans un tutoriel. Vous allez créer un nouveau compte uniquement pour cet exercice.
:::

## De quels outils chaque tutoriel a-t-il besoin ? {#which-tools}

N'installez que les lignes dont vous avez besoin. Git, un terminal et un navigateur web sont nécessaires pour tous.

| Tutoriel | Langage | Outils à installer | Portefeuille QoreX |
| --- | --- | --- | --- |
| [Guide de l'atelier 1](/build-before-qday/workshop-1) | TypeScript | Node.js, pnpm, curl, jq (facultatif) | Inutile |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | TypeScript | Git, Node.js, pnpm | Inutile |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | TypeScript | Git, Node.js, pnpm | Nécessaire, avec un compte Ethereum (coin 60) |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | TypeScript | Git, Node.js, pnpm | Nécessaire |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Rust | Git, Rust | Inutile |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Java | Git, Java 21, Maven | Inutile |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Python | Git, Python 3.10 ou plus récent | Inutile |

## Ouvrir un terminal {#terminal}

Un terminal est une fenêtre dans laquelle vous tapez des commandes. Vous y collerez les commandes de ces pages, une à la fois.

| Système | Comment l'ouvrir |
| --- | --- |
| macOS | Appuyez sur Commande et Espace, tapez `Terminal`, puis appuyez sur Retour. |
| Windows | Ouvrez le menu Démarrer, tapez `PowerShell`, ouvrez **Windows PowerShell**. Pour le tutoriel Java, il vous faut aussi **Git Bash** (il est fourni avec Git, voir plus bas) ou WSL. |
| Linux | Appuyez sur Ctrl, Alt et T, ou cherchez `Terminal` dans vos applications. |

Après avoir installé un outil, **fermez le terminal et ouvrez-en un nouveau**. Un terminal qui était ouvert pendant l'installation ne voit pas encore le nouvel outil.

## Installer les outils {#install}

Pour chaque outil, vous avez la commande d'installation ou le lien de téléchargement, puis la **commande de vérification**. Une commande de vérification demande sa version à l'outil. Si elle affiche un numéro de version égal ou supérieur à celui demandé, l'outil fonctionne.

### Gestionnaires de paquets (aides facultatives) {#package-managers}

Un gestionnaire de paquets installe d'autres programmes avec une seule commande. Vous pouvez aussi télécharger chaque outil à la main depuis son site. Les commandes ci-dessous utilisent l'aide adaptée à votre système.

| Système | Aide | Comment l'obtenir |
| --- | --- | --- |
| macOS | Homebrew | Collez cette ligne dans le terminal, puis suivez ce qu'elle affiche : `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| Windows | winget | Déjà inclus dans Windows 10 et 11. Vérifiez avec `winget --version`. |
| Linux | apt | Déjà inclus sur Ubuntu et Debian. Autres systèmes : utilisez votre propre gestionnaire de paquets (`dnf`, `pacman`). |

### Git {#git}

Git télécharge le code d'exemple depuis GitHub.

| Système | Installation |
| --- | --- |
| macOS | `xcode-select --install` (une fenêtre s'ouvre, choisissez **Installer**), ou `brew install git` |
| Windows | `winget install --id Git.Git -e`, ou téléchargement depuis [git-scm.com](https://git-scm.com/download/win) |
| Linux | `sudo apt install -y git` |

Vérifiez :

```bash
git --version
```

Vous devez voir une ligne comme `git version 2.40.0`. Toutes les versions conviennent.

### Node.js 22.13 ou plus récent {#node}

Node.js exécute les projets TypeScript. Hardhat 3, l'outil de contrats utilisé ici, refuse de démarrer avec une version de Node.js antérieure à 22.13.

| Système | Installation |
| --- | --- |
| macOS | `brew install node`, ou téléchargez l'installateur LTS depuis [nodejs.org](https://nodejs.org) |
| Windows | `winget install --id OpenJS.NodeJS.LTS -e`, ou téléchargez l'installateur LTS depuis [nodejs.org](https://nodejs.org) |
| Linux (Ubuntu, Debian) | `curl -fsSL https://deb.nodesource.com/setup_22.x \| sudo -E bash -` puis `sudo apt install -y nodejs` |

:::note Linux : n'utilisez pas le paquet apt par défaut
Sur Ubuntu et Debian, `sudo apt install nodejs` installe une ancienne version, trop basse. Utilisez la ligne NodeSource ci-dessus.
:::

Vérifiez :

```bash
node -v
```

Vous devez voir `v22.13.0` ou plus, par exemple `v22.20.0` ou `v24.1.0`. Si vous voyez un numéro plus bas, réinstallez et ouvrez un nouveau terminal.

### pnpm 9 ou plus récent {#pnpm}

pnpm installe les bibliothèques dont un projet TypeScript a besoin. Il fait le même travail que `npm`, en plus rapide.

Installez-le avec l'outil d'installation propre à Node.js, `npm`, sur tous les systèmes :

```bash
npm install -g pnpm
```

| Partie | Ce qu'elle fait |
| --- | --- |
| `npm install` | Télécharge et installe un programme. |
| `-g` | Abréviation de « global » : l'installe pour tout votre ordinateur, et non pour un seul dossier. |
| `pnpm` | Le programme à installer. |

Sur macOS et Linux, si la commande se termine par `EACCES` ou « permission denied », relancez-la sous la forme `sudo npm install -g pnpm`.

:::caution Node.js installé avec Homebrew n'inclut pas pnpm
Si un tutoriel affiche `pnpm: command not found` (ou `zsh: command not found: pnpm`), c'est que pnpm n'est pas encore installé. Lancez `npm install -g pnpm`, ouvrez un nouveau terminal et réessayez.
:::

Vérifiez :

```bash
pnpm -v
```

Vous devez voir `9.0.0` ou plus, par exemple `10.4.1`.

### curl et jq (guide de l'atelier 1 uniquement) {#curl-jq}

`curl` télécharge une adresse web depuis le terminal. Vous l'utilisez pour lire votre transaction sur le point de terminaison REST public. `jq` filtre la longue réponse pour ne vous montrer que la partie utile. `jq` est facultatif.

| Système | curl | jq |
| --- | --- | --- |
| macOS | Inclus. | `brew install jq` |
| Windows | Inclus dans Windows 10 et 11 sous le nom `curl.exe`. | `winget install --id jqlang.jq -e` |
| Linux | `sudo apt install -y curl` s'il manque | `sudo apt install -y jq` |

Vérifiez :

```bash
curl --version
jq --version
```

Vous devez voir une ligne de version pour chacun, par exemple `jq-1.7`.

:::note Windows PowerShell : tapez curl.exe
Dans PowerShell, le mot court `curl` désigne une autre commande intégrée. Tapez `curl.exe` à la place de `curl` dans toutes les commandes de ces pages. Si vous utilisez Git Bash, `curl` seul fonctionne.
:::

### Rust 1.88 ou plus récent (tutoriel Rust uniquement) {#rust}

Rust compile l'application en ligne de commande `qday-pay`. Vous l'installez avec `rustup`, l'installateur officiel de Rust. Il installe aussi `cargo`, l'outil de compilation de Rust.

| Système | Installation |
| --- | --- |
| macOS | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (appuyez sur Retour pour accepter le choix par défaut). Les outils de compilation viennent avec `xcode-select --install`. |
| Windows | Téléchargez et lancez `rustup-init.exe` depuis [rustup.rs](https://rustup.rs), ou `winget install --id Rustlang.Rustup -e`. Quand il propose les Visual Studio C++ Build Tools, acceptez : Rust en a besoin pour compiler des programmes sous Windows. |
| Linux | `sudo apt install -y build-essential curl` puis `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` (appuyez sur Retour pour accepter le choix par défaut) |

Vérifiez :

```bash
rustc --version
cargo --version
```

Vous devez voir `rustc 1.88.0` ou plus et une ligne de version de `cargo`. Si Rust est déjà installé, `rustup update` le met à jour.

### Java 21 et Maven (tutoriel Java uniquement) {#java}

L'application Tip Jar a besoin d'un JDK Java 21 ou plus récent (les outils pour compiler et exécuter du Java) et de Maven, l'outil de compilation qui télécharge les bibliothèques Java.

| Système | Installation |
| --- | --- |
| macOS | `brew install --cask temurin@21` puis `brew install maven` (ou utilisez l'installateur de [adoptium.net](https://adoptium.net)) |
| Windows | `winget install --id EclipseAdoptium.Temurin.21.JDK -e`, puis téléchargez Maven depuis [maven.apache.org/download.cgi](https://maven.apache.org/download.cgi), décompressez-le et ajoutez son dossier `bin` au `PATH`. Voie plus simple : installez WSL (voir plus bas) et suivez la ligne Linux. |
| Linux | `sudo apt install -y openjdk-21-jdk maven` |

Vérifiez :

```bash
java -version
mvn -version
```

Vous devez voir `openjdk version "21` (ou un numéro plus élevé comme 25) et `Apache Maven 3.` suivi d'une version. Si `java -version` affiche 17 ou moins, installez Java 21 et ouvrez un nouveau terminal.

### Python 3.10 ou plus récent avec venv (tutoriel Python uniquement) {#python}

Python exécute l'application Airdrop. `venv` crée un dossier privé pour ses bibliothèques, de sorte que rien d'autre sur votre ordinateur n'est touché.

| Système | Installation |
| --- | --- |
| macOS | `brew install python`, ou téléchargement depuis [python.org](https://www.python.org/downloads/) |
| Windows | `winget install --id Python.Python.3.12 -e`, ou téléchargement depuis [python.org](https://www.python.org/downloads/) en cochant **Add python.exe to PATH** dans l'installateur |
| Linux | `sudo apt install -y python3 python3-venv python3-pip` |

Vérifiez :

```bash
python3 --version
```

Vous devez voir `Python 3.10.0` ou plus. Sous Windows, tapez plutôt `python --version` (la commande est `python`, et non `python3`).

### Windows et les commandes Linux : WSL {#wsl}

La plupart des commandes des tutoriels sont identiques sur tous les systèmes. Quelques-unes utilisent des fonctions du shell Linux : `source`, `chmod`, `./tipjar` et `sleep`. Sous Windows, vous avez deux choix :

1. **Windows natif.** Utilisez PowerShell pour les tutoriels TypeScript, Rust et Python. Les tutoriels donnent la variante Windows quand elle diffère, par exemple `.venv\Scripts\activate`. Pour le tutoriel Java, utilisez **Git Bash** (installé avec Git).
2. **WSL.** Le sous-système Windows pour Linux vous donne un vrai Linux dans Windows. Ouvrez PowerShell en administrateur, lancez la commande ci-dessous, redémarrez, puis suivez les lignes **Linux** de cette page dans la fenêtre Ubuntu.

```powershell
wsl --install
```

| Partie | Ce qu'elle fait |
| --- | --- |
| `wsl` | L'outil du sous-système Windows pour Linux. |
| `--install` | Installe WSL et le système Linux Ubuntu en une seule étape. |

## Tout vérifier d'un coup {#check-all}

Lancez les commandes des outils que vous avez installés. Chacune doit afficher une version.

```bash
git --version
node -v
pnpm -v
rustc --version
java -version
mvn -version
python3 --version
```

| Vérification | Bonne réponse |
| --- | --- |
| `node -v` | `v22.13.0` ou plus |
| `pnpm -v` | `9.0.0` ou plus |
| `rustc --version` | `rustc 1.88.0` ou plus |
| `java -version` | `21` ou plus |
| `mvn -version` | `Apache Maven 3.` et une version |
| `python3 --version` | `Python 3.10.0` ou plus |

## Obtenir un portefeuille testnet {#wallet}

Il vous faut un endroit où garder du QOR de test. Certains tutoriels créent pour vous un compte jetable dans un fichier. D'autres utilisent le portefeuille **QoreX**, le portefeuille officiel de QoreChain, basculé sur le testnet. Le tableau de la section [De quels outils chaque tutoriel a-t-il besoin ?](#which-tools) indique lequel.

### QoreX sur le testnet {#qorex}

1. Installez QoreX depuis la fiche officielle : [App Store](https://apps.apple.com/us/app/qorex-wallet/id6791256626) pour iPhone, [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) pour Android, [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) pour Chrome, Brave, Edge, Arc et Opera, ou [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/). La liste complète se trouve dans la [vue d'ensemble de QoreX](/qorex/overview).
2. Créez un **nouveau** portefeuille et notez la phrase de récupération sur papier. N'importez pas une phrase qui protège de vrais fonds.
3. Basculez le portefeuille sur le testnet :
   - **Application mobile :** ouvrez **Réglages**, puis activez **Use testnet (developers)**.
   - **Extension de navigateur :** déverrouillez-la, puis touchez **7 fois le numéro de version en bas**. Une option développeur apparaît. Choisissez **Switch to testnet (diana)**.
4. Vérifiez que le badge testnet s'affiche. Le testnet s'appelle `qorechain-diana`.

**Ce que vous devez voir :** un badge testnet dans le portefeuille, et une adresse `qor1...` sur l'écran d'accueil. Les soldes du testnet n'affichent aucune valeur en dollars, et c'est normal.

### Ajouter un compte Ethereum (coin 60) {#coin-60}

Le tutoriel Guestbook utilise la voie EVM, le portefeuille a donc besoin d'un compte de type Ethereum.

1. Dans QoreX, ouvrez la liste des comptes et choisissez **Add an Ethereum account (coin 60)**.
2. Créez-en un nouveau. Ne restaurez pas une phrase qui protège de vrais fonds.
3. Sélectionnez ce compte. Il affiche une adresse `0x...`.

**Ce que vous devez voir :** un compte intitulé *Ethereum, coin 60*, avec une adresse qui commence par `0x`. Le même compte a aussi une adresse `qor1...`.

Pour en savoir plus sur les comptes : [Compte et Dashboard QoreX](/qorex/account-and-dashboard) et [Prise en main de QoreX](/qorex/getting-started).

## Obtenir du QOR de test auprès du faucet {#faucet}

Le faucet donne du QOR de test gratuit à une adresse testnet. Un nouveau compte doit en recevoir avant de pouvoir faire quoi que ce soit, car chaque transaction paie de petits frais de réseau.

1. Ouvrez [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) dans votre navigateur.
2. Connectez-vous au Dashboard QoreChain.
3. Collez votre adresse `qor1...` dans le champ d'adresse.
4. Sélectionnez **Request Tokens**.
5. Attendez l'affichage de **Tokens Sent!**.

**Ce que vous devez voir :** la carte **Tokens Sent!** avec 100 QOR, et un lien **View on Explorer**.

Le faucet verse **100 QOR une fois toutes les 24 heures par compte** et par adresse. Si vous redemandez trop tôt, il affiche **Rate Limit Reached**. Attendez la fin des 24 heures. Une seule demande suffit pour tous les tutoriels de cette page.

### Votre première transaction enregistre votre clé post-quantique {#first-tx}

Chaque compte QoreChain a deux clés : une clé classique et une clé post-quantique ML-DSA-87. La toute première transaction d'un nouveau compte **enregistre la clé ML-DSA-87 sur la chaîne**. Cela n'arrive qu'une seule fois par compte et coûte environ **0,09 QOR**. Ensuite, chaque transaction est signée avec les deux clés.

Les tutoriels exécutent cette étape pour vous avec une commande nommée `register`. Vous n'avez rien à faire maintenant. Les 100 QOR du faucet la couvrent largement.

## QOR et uqor {#units}

Vous verrez deux noms pour la même pièce. Le **QOR** est la pièce entière. L'**uqor** est le plus petit morceau.

**1 QOR = 1 000 000 uqor.**

| Vous voyez | Cela signifie |
| --- | --- |
| `1` QOR | 1 000 000 uqor |
| `0.1` QOR | 100 000 uqor |
| `0.09` QOR | 90 000 uqor |
| `0.15uqor` | Un prix de 0,15 uqor par unité de gas, utilisé quand vous payez des frais |

Les portefeuilles et la plupart des commandes utilisent le QOR. La chaîne, elle, compte en uqor. Un **mémo** est un court texte que vous joignez à une transaction, comme `Hello from the workshop`. Tout le monde peut le lire sur la chaîne : ne mettez donc jamais de secret dans un mémo.

Le **gas** mesure le travail qu'une transaction demande au réseau. Les frais sont le gas utilisé multiplié par le prix du gas. Les outils de cette section estiment le gas pour vous, vous n'avez donc rien à calculer.

## Protéger vos clés jetables {#key-hygiene}

Un tutoriel crée un secret pour votre compte testnet et le stocke sur votre ordinateur. Traitez-le avec soin, même si le QOR de test ne vaut rien, pour prendre l'habitude avant le mainnet.

1. **Où il se trouve.** Dans les tutoriels TypeScript, les secrets vont dans un fichier nommé `.env` dans le dossier du projet. Les applications Rust, Java et Python écrivent un fichier de clé avec la commande `new`, dans un dossier caché nommé `.config/qday` à l'intérieur de votre dossier personnel. Le tutoriel nomme le fichier exact.
2. **Ne le partagez jamais.** Ne le collez pas dans un chat, un e-mail, une capture d'écran ou une vidéo. Masquez le fichier quand vous partagez votre écran.
3. **Ne le versionnez jamais.** N'ajoutez pas `.env` ni un fichier de clé à Git, et ne les poussez jamais sur GitHub. Ajoutez `.env` à `.gitignore` si un projet ne l'ignore pas déjà.
4. **Testnet uniquement.** Ne réutilisez jamais une clé, une phrase de récupération ou un code de récupération du testnet sur le mainnet.
5. **Supprimez-le à la fin.** Quand vous avez terminé un tutoriel, supprimez le fichier de clé ou `.env`. Vous pouvez toujours créer un nouveau compte en une minute.

:::danger Fonds réels
Ne mettez jamais la clé, le mnémonique (phrase de récupération) ou le code de récupération d'un compte qui détient de vrais fonds dans un fichier `.env`, un fichier de clé ou une commande de cette section.
:::

## Le réseau et les points de terminaison publics {#network}

| Service | Valeur |
| --- | --- |
| Nom du testnet | `qorechain-diana` |
| ID de chaîne EVM | 9800 |
| REST (lire des données via le web) | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| JSON-RPC EVM | `https://evm-testnet.qore.host` |
| Explorateur | [explore.qore.network](https://explore.qore.network), puis passez sur **Testnet** |
| Faucet | [dashboard.qorechain.io/faucet](https://dashboard.qorechain.io/faucet) |

## Dépannage {#troubleshooting}

| Ce que vous voyez | Pourquoi | Que faire |
| --- | --- | --- |
| `pnpm: command not found` | pnpm n'est pas installé. Node.js ne l'inclut pas, y compris quand il est installé avec Homebrew. | Lancez `npm install -g pnpm`, ouvrez un nouveau terminal et lancez `pnpm -v`. |
| `node: command not found`, ou une ancienne version après l'installation | Le terminal était ouvert pendant l'installation, ou l'ancienne version passe en premier. | Fermez le terminal, ouvrez-en un nouveau, lancez `node -v`. Sous Linux, utilisez la ligne NodeSource, et non le paquet apt par défaut. |
| `ERROR: You are using Node.js ... which is not supported by Hardhat` | Node.js est plus ancien que 22.13. | Installez Node.js 22.13 ou plus récent, puis relancez `pnpm install` dans le projet. |
| `EACCES` ou permission refusée pendant `npm install -g pnpm` | Votre utilisateur ne peut pas écrire dans le dossier global. | Lancez `sudo npm install -g pnpm` sur macOS et Linux. |
| `rustc: command not found` après l'installation de Rust | Le terminal ne connaît pas encore le nouveau `PATH`. | Ouvrez un nouveau terminal. Si cela échoue encore, lancez `source "$HOME/.cargo/env"`. |
| `linker 'cc' not found` ou `link.exe not found` lors de la compilation Rust | Les outils du compilateur C manquent. | macOS : `xcode-select --install`. Linux : `sudo apt install -y build-essential`. Windows : installez les Visual Studio C++ Build Tools. |
| `java -version` affiche 17 ou moins | Une ancienne version de Java passe en premier. | Installez Java 21, ouvrez un nouveau terminal, vérifiez de nouveau. |
| PowerShell indique que l'exécution de scripts est désactivée quand vous activez le venv Python | Windows bloque les scripts par défaut. | Lancez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, répondez `Y`, puis activez de nouveau. |
| `Rate Limit Reached` sur le faucet | Le faucet paie une fois toutes les 24 heures par compte et par adresse. | Attendez la fin des 24 heures. Une seule demande suffit pour tous les tutoriels. |
| Le portefeuille n'affiche pas de badge testnet | Le portefeuille est encore sur le mainnet. | Application mobile : Réglages, puis **Use testnet (developers)**. Extension : touchez 7 fois le numéro de version, puis **Switch to testnet (diana)**. |
| `account has no PQC key and classical fallback is disabled` | Le nouveau compte n'a pas encore enregistré sa clé ML-DSA-87. | Lancez d'abord l'étape `register` du tutoriel (c'est la première transaction du compte). |
| Erreurs CORS dans la console du navigateur | Le point de terminaison REST public n'envoie pas d'en-têtes CORS, une page web ne peut donc pas l'appeler directement. | Appelez le point de terminaison via le proxy `/lcd` du projet, comme le fait le modèle. |

## Étape suivante {#next}

Choisissez un tutoriel dans la [vue d'ensemble](/build-before-qday/overview#choose) et suivez-le depuis la première commande.
