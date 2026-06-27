import React, {type ReactNode} from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Translate, {translate} from "@docusaurus/Translate";
import styles from "./index.module.css";

type Feature = {
  title: string;
  desc: string;
  href: string;
  icon: ReactNode;
};

const icon = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

function useFeatures(): Feature[] {
  return [
    {
      title: translate({
        id: "home.feature.pqc.title",
        message: "Post-Quantum Security",
      }),
      desc: translate({
        id: "home.feature.pqc.desc",
        message:
          "ML-DSA-87 (Dilithium-5) and ML-KEM-1024 at genesis, with hybrid secp256k1 + ML-DSA-87 signatures and governance-controlled enforcement.",
      }),
      href: "/architecture/post-quantum-security",
      icon: icon(<><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>),
    },
    {
      title: translate({
        id: "home.feature.tripleVm.title",
        message: "Triple-VM Runtime",
      }),
      desc: translate({
        id: "home.feature.tripleVm.desc",
        message:
          "EVM, CosmWasm, and SVM execute on a single chain, with cross-VM messaging between all three runtimes.",
      }),
      href: "/developer-guide/cross-vm-interoperability",
      icon: icon(<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 16l9 5 9-5" /></>),
    },
    {
      title: translate({
        id: "home.feature.prism.title",
        message: "PRISM Consensus",
      }),
      desc: translate({
        id: "home.feature.prism.desc",
        message:
          "A reinforcement-learning optimization layer tunes consensus parameters on the QoreChain Consensus Engine with deterministic, on-chain inference.",
      }),
      href: "/architecture/prism-consensus-engine",
      icon: icon(<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h6v6H9z" /><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" /></>),
    },
    {
      title: translate({
        id: "home.feature.bridge.title",
        message: "Cross-Chain Bridge",
      }),
      desc: translate({
        id: "home.feature.bridge.desc",
        message:
          "37 QCB chain configurations plus 8 IBC channels, with PQC-signed validator attestations. Currently in testnet.",
      }),
      href: "/architecture/bridge-architecture",
      icon: icon(<><path d="M4 12a4 4 0 014-4h2M20 12a4 4 0 01-4 4h-2" /><path d="M9 12h6" /><path d="M14 8h2a4 4 0 010 8M10 16H8a4 4 0 010-8" /></>),
    },
    {
      title: translate({
        id: "home.feature.rdk.title",
        message: "Rollup Development Kit",
      }),
      desc: translate({
        id: "home.feature.rdk.desc",
        message:
          "Deploy application-specific rollups with four settlement paradigms and five preset profiles, via the @qorechain/rdk SDK or the CLI.",
      }),
      href: "/rollups/overview",
      icon: icon(<><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v6l9 4 9-4V7" /><path d="M12 11v10" /></>),
    },
    {
      title: translate({
        id: "home.feature.dapps.title",
        message: "Build dApps",
      }),
      desc: translate({
        id: "home.feature.dapps.desc",
        message:
          "The TypeScript SDK connects to mainnet over RPC, REST, gRPC, and JSON-RPC across EVM, CosmWasm, and SVM accounts.",
      }),
      href: "/sdk/overview",
      icon: icon(<><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 7l-2 10" /></>),
    },
  ];
}

const arrow = (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor"
       strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function PathCol({title, lede, links}: {title: string; lede: string; links: [string, string][]}) {
  return (
    <div className={styles.pathCol}>
      <h3>{title}</h3>
      <p>{lede}</p>
      <ul>
        {links.map(([label, href]) => (
          <li key={href}>
            <Link to={href}>{label}<span>{arrow}</span></Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home(): ReactNode {
  const features = useFeatures();
  return (
    <Layout
      title={translate({
        id: "home.meta.title",
        message: "QoreChain Documentation",
      })}
      description={translate({
        id: "home.meta.description",
        message:
          "QoreChain is a quantum-safe, AI-native Layer 1 blockchain with post-quantum cryptography at genesis, a triple-VM runtime, and PRISM consensus optimization.",
      })}>
      <main className={styles.page}>
        {/* Hero */}
        <header className={styles.hero}>
          <span className={`${styles.eyebrow} ${styles.reveal}`}>
            <span className={styles.pulse} />{" "}
            <Translate id="home.hero.eyebrow">Mainnet live</Translate> · v3.1.77
          </span>
          <h1 className={`${styles.title} ${styles.reveal}`} style={{animationDelay: "0.06s"}}>
            <Translate
              id="home.hero.title"
              values={{
                highlight: (
                  <span className={styles.grad}>
                    <Translate id="home.hero.title.highlight">quantum-safe</Translate>
                  </span>
                ),
              }}>
              {"The {highlight} Layer 1 for the next decade"}
            </Translate>
          </h1>
          <p className={`${styles.subtitle} ${styles.reveal}`} style={{animationDelay: "0.12s"}}>
            <Translate id="home.hero.subtitle">
              {"QoreChain pairs post-quantum cryptography at genesis with a triple-VM runtime — EVM, CosmWasm, and SVM — and AI-optimized consensus. Built on Cosmos SDK v0.53."}
            </Translate>
          </p>
          <div className={`${styles.ctaRow} ${styles.reveal}`} style={{animationDelay: "0.18s"}}>
            <Link className={styles.btnPrimary} to="/getting-started/quickstart">
              <Translate id="home.hero.cta.primary">Get started</Translate> {arrow}
            </Link>
            <Link className={styles.btnGhost} to="/introduction/what-is-qorechain">
              <Translate id="home.hero.cta.secondary">What is QoreChain?</Translate>
            </Link>
          </div>
          <div className={`${styles.chips} ${styles.reveal}`} style={{animationDelay: "0.24s"}}>
            <span><Translate id="home.chip.mainnet">mainnet</Translate> <b>qorechain-vladi</b></span>
            <span><Translate id="home.chip.evmChainId">EVM chain id</Translate> <b>9801</b></span>
            <span><Translate id="home.chip.token">token</Translate> <b>QOR / uqor</b></span>
            <span><Translate id="home.chip.framework">framework</Translate> <b>Cosmos SDK v0.53</b></span>
          </div>
        </header>

        {/* Features */}
        <section className={`${styles.section} ${styles.container}`}>
          <p className={styles.kicker}>
            <Translate id="home.features.kicker">Architecture</Translate>
          </p>
          <h2 className={styles.sectionTitle}>
            <Translate id="home.features.title">Engineered against classical and quantum adversaries</Translate>
          </h2>
          <p className={styles.sectionLede}>
            <Translate id="home.features.lede">
              {"A general-purpose Layer 1 that keeps the developer experience of existing tooling while adding quantum resistance, multi-VM execution, and on-chain consensus optimization."}
            </Translate>
          </p>
          <div className={styles.grid}>
            {features.map((f) => (
              <Link key={f.href} to={f.href} className={styles.card}>
                <div className={styles.cardIcon}>{f.icon}</div>
                <h3 className={styles.cardTitle}>
                  {f.title}<span className={styles.cardArrow}>{arrow}</span>
                </h3>
                <p className={styles.cardDesc}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Paths */}
        <section className={`${styles.section} ${styles.container}`}>
          <p className={styles.kicker}>
            <Translate id="home.paths.kicker">Start exploring</Translate>
          </p>
          <h2 className={styles.sectionTitle}>
            <Translate id="home.paths.title">Pick your path</Translate>
          </h2>
          <div className={styles.paths}>
            <PathCol
              title={translate({id: "home.path.use.title", message: "Use the network"})}
              lede={translate({
                id: "home.path.use.lede",
                message: "Hold QOR, stake, govern, and move assets.",
              })}
              links={[
                [translate({id: "home.path.use.wallet", message: "Set up a wallet"}), "/getting-started/wallet-setup"],
                [translate({id: "home.path.use.stake", message: "Stake & delegate"}), "/user-guide/staking-and-delegation"],
                [translate({id: "home.path.use.bridge", message: "Bridge assets"}), "/user-guide/bridging-assets"],
                [translate({id: "home.path.use.dashboard", message: "Use the Dashboard"}), "/dashboard/overview"],
              ]}
            />
            <PathCol
              title={translate({id: "home.path.build.title", message: "Build on QoreChain"})}
              lede={translate({
                id: "home.path.build.lede",
                message: "Ship contracts, dApps, and rollups.",
              })}
              links={[
                [translate({id: "home.path.build.quickstart", message: "Developer quickstart"}), "/getting-started/quickstart"],
                [translate({id: "home.path.build.evm", message: "EVM development"}), "/developer-guide/evm-development"],
                [translate({id: "home.path.build.sdk", message: "QoreChain SDK"}), "/sdk/overview"],
                [translate({id: "home.path.build.rollup", message: "Deploy a rollup"}), "/rollups/overview"],
              ]}
            />
            <PathCol
              title={translate({id: "home.path.run.title", message: "Run infrastructure"})}
              lede={translate({
                id: "home.path.run.lede",
                message: "Operate nodes, validators, and light nodes.",
              })}
              links={[
                [translate({id: "home.path.run.mainnet", message: "Connect to mainnet"}), "/getting-started/connecting-to-mainnet"],
                [translate({id: "home.path.run.node", message: "Run a node"}), "/developer-guide/running-a-node"],
                [translate({id: "home.path.run.validator", message: "Run a validator"}), "/developer-guide/running-a-validator"],
                [translate({id: "home.path.run.lightnode", message: "Run a light node"}), "/light-node/overview"],
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className={styles.cta}>
          <h2><Translate id="home.cta.title">Start building on QoreChain</Translate></h2>
          <p>
            <Translate id="home.cta.lede">
              {"From your first transaction to a production rollup — the docs cover the whole path."}
            </Translate>
          </p>
          <Link className={styles.btnPrimary} to="/getting-started/quickstart">
            <Translate id="home.cta.button">Read the quickstart</Translate> {arrow}
          </Link>
        </section>
      </main>
    </Layout>
  );
}
