import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "QoreChain Documentation",
  tagline: "Reference and guides for building on the QoreChain network",
  favicon: "img/icon.png",

  url: "https://docs.qorechain.io",
  baseUrl: "/",

  organizationName: "qorechain",
  projectName: "qorechain-docs",

  future: {
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
      rspackBundler: true,
      rspackPersistentCache: true,
      ssgWorkerThreads: false,
    },
  },

  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },

  themes: [
    "@docusaurus/theme-mermaid",
    [
      "@easyops-cn/docusaurus-search-local",
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: "/",
      },
    ],
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    "./plugins/llms-txt",
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: "/architecture/rl-consensus-engine",
            to: "/architecture/prism-consensus-engine",
          },
        ],
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: "QoreChain",
        src: "img/logo.png",
      },
      // No navbar links: Website/GitHub/Discord/version live in the footer, so
      // the mobile hamburger drawer shows only the doc sidebar. Search + the
      // theme toggle are added automatically.
      items: [],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Resources",
          items: [
            { label: "Website", href: "https://qorechain.io" },
            {
              label: "GitHub",
              href: "https://github.com/qorechain/qorechain-docs",
            },
            { label: "Discord", href: "https://discord.gg/qorechain" },
            { label: "Version history", to: "/appendix/version-history" },
          ],
        },
      ],
      copyright: `© QoreChain · v3.1.77<br/>QoreChain Association · CHE-484.963.998 · Rolle, Switzerland · team@qorechain.io`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        "bash",
        "json",
        "toml",
        "rust",
        "go",
        "python",
        "solidity",
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
