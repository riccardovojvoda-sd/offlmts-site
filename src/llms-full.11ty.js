// llms-full.txt: testo integrale delle Dritte (italiano) e dei Tips (inglese) in un solo file per gli agenti AI.
// Indice sintetico: /llms.txt. Gli articoli sono HTML: qui vengono ridotti a testo semplice.
const testo = (html) =>
  String(html || "")
    .replace(/<h[1-6][^>]*>/g, "\n\n### ")
    .replace(/<li[^>]*>/g, "\n- ")
    .replace(/<\/(p|ul|ol|h\d|div|table|tr)>/g, "\n")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, (m, href, t) => `${t} (${href.startsWith("/") ? "https://www.offlmts.com" + href : href})`)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const blocco = (url, a) => `---\n\n# ${a.data.titolo}\n\nFonte: ${url}${a.url}\n\n${testo(a.rawInput)}`;

class LlmsFull {
  data() {
    return { permalink: "/llms-full.txt", eleventyExcludeFromCollections: true };
  }
  render(data) {
    const url = data.sito.url;
    const dritte = (data.collections.dritte || []).map((a) => blocco(url, a)).join("\n\n");
    const tips = (data.collections.tips || []).map((a) => blocco(url, a)).join("\n\n");
    return `# OFFLMTS Recording Studio: testo integrale

> Studio di registrazione a Porcia (Pordenone, Italia), di Riccardo Vojvoda, in arte Trich. Mix, master, remaster/rebalance e registrazione vocale per artisti Urban, Hip Hop, Trap, Pop ed EDM. Contatto: ${data.sito.email}. Indice sintetico: ${url}/llms.txt

## Dritte

${dritte}

## Tips (English)

${tips}
`;
  }
}
module.exports = LlmsFull;
