// Configurazione Eleventy per offlmts.com
// Sorgenti in src/, output in _site/. Immagini responsive con @11ty/eleventy-img.
// Stessa ricetta di sounddesignrv-site, senza le lingue.
const path = require("path");
const Image = require("@11ty/eleventy-img");
const { minify } = require("html-minifier-terser");
const { pubblicato } = require("./lib/articoli");

const LARGHEZZE = [480, 800, 1200, 1600];

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/font": "assets/font" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img/logo-offlmts.png": "assets/img/logo-offlmts.png" });
  // Immagini dentro i post (prodotti, screenshot): copiate tali e quali, sono già piccole
  eleventyConfig.addPassthroughCopy({ "src/assets/img/dritte": "assets/img/dritte" });
  eleventyConfig.addPassthroughCopy({ "src/assets/file": "file" });
  eleventyConfig.addPassthroughCopy({ "src/radice": "." });
  eleventyConfig.addWatchTarget("src/_includes/css");
  eleventyConfig.addWatchTarget("lib");

  // Post delle Dritte, dal più recente
  // Bozze (`bozza: true`, anteprima in /anteprima/<slug>/) e date future restano fuori: vedi lib/articoli.js
  eleventyConfig.addCollection("dritte", (api) =>
    api.getFilteredByTag("dritte").filter(pubblicato).sort((a, b) => b.date - a.date)
  );
  // Versioni inglesi degli articoli: /en/tips/<slug>/, elenco in /en/tips/. Coppia IT/EN dichiarata nel front matter (`coppia`) e legata con hreflang.
  eleventyConfig.addCollection("tips", (api) =>
    api.getFilteredByTag("tips").filter(pubblicato).sort((a, b) => b.date - a.date)
  );

  // Shortcode immagine responsive: {% img "studio/regia-hero.jpg", "alt", "(min-width: 60em) 50vw, 100vw", "lazy" %}
  eleventyConfig.addAsyncShortcode("img", async function (src, alt, sizes = "100vw", loading = "lazy", classe = "") {
    const sorgente = path.join("src/assets/img", src);
    const metadata = await Image(sorgente, {
      widths: LARGHEZZE,
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/assets/img/r/",
      urlPath: "/assets/img/r/",
      filenameFormat: (id, s, width, format) =>
        `${path.basename(s, path.extname(s))}-${width}.${format}`,
      sharpJpegOptions: { quality: 78, mozjpeg: true },
      sharpWebpOptions: { quality: 76 },
      sharpAvifOptions: { quality: 52 },
    });
    return Image.generateHTML(metadata, {
      alt,
      sizes,
      loading,
      decoding: "async",
      class: classe || undefined,
      fetchpriority: loading === "eager" ? "high" : undefined,
    });
  });

  // Solo l'URL della versione jpeg (og:image, JSON-LD)
  eleventyConfig.addAsyncShortcode("imgUrl", async function (src, width = 1200) {
    const metadata = await Image(path.join("src/assets/img", src), {
      widths: [width],
      formats: ["jpeg"],
      outputDir: "_site/assets/img/r/",
      urlPath: "/assets/img/r/",
      filenameFormat: (id, s, w, format) => `${path.basename(s, path.extname(s))}-${w}.${format}`,
      sharpJpegOptions: { quality: 80, mozjpeg: true },
    });
    return metadata.jpeg[0].url;
  });

  const md = require("markdown-it")({ html: true, typographer: false });
  eleventyConfig.addFilter("md", (testo) => md.render(String(testo || "").trim()));
  eleventyConfig.addFilter("mdInline", (testo) => md.renderInline(String(testo || "").trim()));
  eleventyConfig.addFilter("testoPiano", (html) =>
    String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
  );
  eleventyConfig.addFilter("anno", () => new Date().getFullYear());
  eleventyConfig.addFilter("dataIso", (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10));
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  eleventyConfig.addFilter("dataIt", (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return `${x.getUTCDate()} ${MESI[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("dataEn", (d) => {
    const x = d instanceof Date ? d : new Date(d);
    return x.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("correlati", require("./lib/correlati").correlati);
  eleventyConfig.addFilter("primi", (arr, n) => (arr || []).slice(0, n));

  // Tutti i link verso altri siti si aprono in una nuova scheda.
  eleventyConfig.addTransform("link-esterni", function (contenuto) {
    if (!(this.page.outputPath || "").endsWith(".html")) return contenuto;
    return contenuto.replace(/<a\s[^>]*href="https?:\/\/[^"]*"[^>]*>/g, (tag) => {
      if (/href="https?:\/\/(www\.)?offlmts\.com/.test(tag) || /\starget=/.test(tag)) return tag;
      if (/\srel="/.test(tag)) {
        tag = tag.replace(/\srel="([^"]*)"/, (m, r) => ` rel="${/\bnoopener\b/.test(r) ? r : r + " noopener"}"`);
      } else {
        tag = tag.replace(/^<a\s/, '<a rel="noopener" ');
      }
      return tag.replace(/^<a\s/, '<a target="_blank" ');
    });
  });

  // Anteprima locale (npm run dev, o ANTEPRIMA=1 npm run build): la CSP non forza https, altrimenti
  // dal telefono su http://<ip-del-mac>:8091 immagini e font vengono chiesti in https e falliscono.
  eleventyConfig.addGlobalData("anteprima", () => process.env.ELEVENTY_RUN_MODE === "serve" || process.env.ANTEPRIMA === "1");

  eleventyConfig.addTransform("minifica", async function (contenuto) {
    if (process.env.ELEVENTY_RUN_MODE !== "build" || process.env.NO_MINIFY) return contenuto;
    if (!(this.page.outputPath || "").endsWith(".html")) return contenuto;
    return minify(contenuto, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      conservativeCollapse: true,
    });
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
