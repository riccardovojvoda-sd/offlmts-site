// Articoli correlati in fondo a un articolo (dal 24/09/2026).
// Punteggio: +2 per ogni `argomento` in comune, +1 per ogni `per_chi` in comune, +1 se stessa `categoria`.
// A parità di punteggio vince il più recente. Se i correlati veri sono meno di `n`, si completa con i più recenti:
// ne escono sempre `n` (se esistono abbastanza articoli), mai l'articolo stesso.
function correlati(lista, url, n = 3, dati) {
  const tutti = (lista || []).filter((p) => p.url && p.url !== url);
  const io = dati ? null : (lista || []).find((p) => p.url === url);
  const d = dati || (io ? io.data : {});
  const comuni = (a, b) => (a || []).filter((x) => (b || []).includes(x)).length;
  const punti = (p) =>
    2 * comuni(d.argomento, p.data.argomento) + comuni(d.per_chi, p.data.per_chi) + (d.categoria && d.categoria === p.data.categoria ? 1 : 0);
  return tutti
    .map((p) => ({ p, s: punti(p) }))
    .sort((a, b) => b.s - a.s || b.p.date - a.p.date)
    .slice(0, n)
    .map((x) => x.p);
}
module.exports = { correlati };
