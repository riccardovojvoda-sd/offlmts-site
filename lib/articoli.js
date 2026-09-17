// Regole comuni agli articoli (Dritte / Tips):
// - `bozza: true` nel front matter: la pagina esiste solo come anteprima in /anteprima/<slug>/, noindex, fuori da elenchi e sitemap.
// - data nel futuro: la pagina NON viene costruita (permalink false). La build programmata su GitHub (ogni giorno alle 07:00 e 17:00 UTC)
//   la fa comparire da sola quando la data arriva: e' cosi' che si programmano le uscite.
// - altrimenti: pagina normale in <base><slug>/.
// Le pagine con un permalink scritto a mano (gli indici) non vengono toccate.
// Nota: eleventyExcludeFromCollections non si puo' calcolare qui (Eleventy lo legge prima), quindi elenchi, sitemap e
// filtro `traduzioni` usano `pubblicato()` per tenere fuori bozze e date future.
// Tolleranza di 3 ore: una data "secca" (es. 2026-09-24) e' mezzanotte UTC, cioe' le 2 di notte in Italia; cosi' l'articolo del giorno
// conta come pubblicato gia' dalla sera prima e nessuna build lo fa sparire. Per un'ora precisa: `date: 2026-09-24T17:00:00Z`.
const TOLLERANZA = 3 * 60 * 60 * 1000;
const nelFuturo = (data) => data.page && data.page.date && data.page.date.getTime() > Date.now() + TOLLERANZA;

function pubblicato(p) {
  // `indice: true` = la pagina elenco, che eredita il tag della cartella ma non e' un articolo
  return !!p.url && !p.data.indice && !p.data.bozza && !(p.date && p.date.getTime() > Date.now() + TOLLERANZA);
}

function datiArticoli(base, extra = {}) {
  return {
    layout: "layouts/post.njk",
    og_type: "article",
    ...extra,
    eleventyComputed: {
      permalink: (data) => {
        if (data.permalink) return data.permalink;   // permalink scritto a mano (gli indici); Eleventy passa "" quando manca
        if (data.bozza) return `/anteprima/${data.page.fileSlug}/`;
        if (nelFuturo(data)) return false;
        return `${base}${data.page.fileSlug}/`;
      },
      noindex: (data) => !!data.noindex || !!data.bozza,
      escludiDaSitemap: (data) => !!data.escludiDaSitemap || !!data.bozza,
    },
  };
}
module.exports = { datiArticoli, pubblicato };
