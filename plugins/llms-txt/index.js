// Custom Docusaurus plugin: generates an `llms.txt` index and a per-page `.md`
// for every doc page of the DEFAULT (released) docs version.
//
// Behaviour (preserves the machine-readable pattern of the old GitBook site):
//   - build/llms.txt        a markdown index of every default-version page URL,
//                           grouped by sidebar section, with absolute URLs.
//   - build/<slug>.md       the source markdown for the page served at /<slug>,
//                           so any page URL + ".md" resolves.
//
// The default version's source markdown lives in versioned_docs/version-<v>/.
// Every doc carries an explicit `slug:` in frontmatter, so the slug -> file
// mapping is deterministic. Grouping/ordering follows sidebars.ts.

const fs = require("fs");
const path = require("path");

// Section labels keyed by the first path segment of a slug. Mirrors the
// category labels in sidebars.ts so the index reads the same as the site nav.
const SECTION_LABELS = {
  introduction: "Introduction",
  "getting-started": "Getting Started",
  "user-guide": "User Guide",
  "developer-guide": "Developer Guide",
  architecture: "Architecture",
  rollups: "Rollups",
  "light-node": "Light Node",
  sdk: "QoreChain SDK",
  dashboard: "Dashboard",
  qcaia: "QCAIA Community Bot",
  "api-reference": "API Reference",
  "cli-reference": "CLI Reference",
  appendix: "Appendix",
};

// Display order of sections in llms.txt (matches sidebars.ts top-to-bottom).
const SECTION_ORDER = [
  "introduction",
  "getting-started",
  "user-guide",
  "developer-guide",
  "architecture",
  "rollups",
  "light-node",
  "sdk",
  "dashboard",
  "qcaia",
  "api-reference",
  "cli-reference",
  "appendix",
];

// Minimal frontmatter parser: pulls the leading --- ... --- block and returns
// { data, body }. Avoids adding a gray-matter dependency.
function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw };
  const fmBlock = raw.slice(3, end).trim();
  // Body starts after the closing --- line.
  const afterClose = raw.indexOf("\n", end + 1);
  const body = afterClose === -1 ? "" : raw.slice(afterClose + 1);
  const data = {};
  for (const line of fmBlock.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    // Strip surrounding quotes.
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[m[1]] = val;
  }
  return { data, body };
}

// Recursively collect *.md / *.mdx files under dir.
function collectMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectMarkdownFiles(full));
    } else if (/\.mdx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

module.exports = function llmsTxtPlugin(context) {
  return {
    name: "llms-txt-plugin",

    async postBuild({ siteConfig, outDir }) {
      const siteUrl = (siteConfig.url || "").replace(/\/$/, "");
      // Single-version site: the current docs source lives in docs/.
      const defaultVersion = "3.1.80";
      const versionedDir = path.join(context.siteDir, "docs");

      const files = collectMarkdownFiles(versionedDir);

      // Build page records: { slug, title, section, body }.
      const pages = [];
      for (const file of files) {
        const raw = fs.readFileSync(file, "utf8");
        const { data, body } = parseFrontmatter(raw);
        let slug = data.slug;
        if (!slug) {
          // Derive slug from path relative to the versioned dir.
          const rel = path
            .relative(versionedDir, file)
            .replace(/\.mdx?$/, "");
          slug = "/" + rel;
        }
        // Normalise: ensure leading slash, drop trailing slash.
        if (!slug.startsWith("/")) slug = "/" + slug;
        slug = slug.replace(/\/$/, "");
        // The home page (slug "/" -> "") is the index; skip from per-section
        // listing but still emit its .md.
        const section = slug === "" ? "_home" : slug.split("/")[1];
        const title =
          data.title ||
          data.sidebar_label ||
          slug.split("/").filter(Boolean).pop() ||
          "Home";
        const position =
          data.sidebar_position !== undefined
            ? Number(data.sidebar_position)
            : Number.POSITIVE_INFINITY;
        pages.push({ slug, title, section, position, body, raw });
      }

      // ---- Emit per-page .md files ----
      let mdCount = 0;
      for (const page of pages) {
        // slug "" => /index.md ; slug "/a/b" => /a/b.md
        const relTarget =
          page.slug === "" ? "index.md" : page.slug.replace(/^\//, "") + ".md";
        const target = path.join(outDir, relTarget);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        // Write a faithful markdown file: a single H1 title + the body.
        const heading = `# ${page.title}\n\n`;
        const bodyTrimmed = page.body.replace(/^\s+/, "");
        // Avoid a duplicate H1 if the body already opens with one.
        const content = /^#\s/.test(bodyTrimmed)
          ? page.body
          : heading + page.body;
        fs.writeFileSync(target, content, "utf8");
        mdCount += 1;
      }

      // ---- Emit llms.txt index ----
      const bySection = {};
      for (const page of pages) {
        if (page.section === "_home" || page.section === undefined) continue;
        (bySection[page.section] ||= []).push(page);
      }

      // Order pages within each section by sidebar_position, then title.
      for (const section of Object.keys(bySection)) {
        bySection[section].sort(
          (a, b) => a.position - b.position || a.title.localeCompare(b.title),
        );
      }

      const lines = [];
      lines.push("# QoreChain Documentation");
      lines.push("");
      lines.push(
        "Machine-readable index of the QoreChain documentation. Each entry links " +
          "to a page; append `.md` to any page URL to fetch its markdown source.",
      );
      lines.push("");
      lines.push(`> Version: v${defaultVersion}`);
      lines.push("");

      const orderedSections = [
        ...SECTION_ORDER.filter((s) => bySection[s]),
        ...Object.keys(bySection).filter((s) => !SECTION_ORDER.includes(s)),
      ];

      for (const section of orderedSections) {
        const label = SECTION_LABELS[section] || section;
        lines.push(`## ${label}`);
        lines.push("");
        for (const page of bySection[section]) {
          const url = `${siteUrl}${page.slug}`;
          lines.push(`- [${page.title}](${url})`);
        }
        lines.push("");
      }

      fs.writeFileSync(
        path.join(outDir, "llms.txt"),
        lines.join("\n").trimEnd() + "\n",
        "utf8",
      );

      console.log(
        `[llms-txt-plugin] wrote llms.txt and ${mdCount} per-page .md files ` +
          `for version ${defaultVersion}`,
      );
    },
  };
};
