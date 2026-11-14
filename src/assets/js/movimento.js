/* Movimento OFFLMTS: entrata in sequenza mentre si scorre (stile in sito.css, blocco "Movimento").
   Titoli e blocchi ricevono "visibile" quando entrano nello schermo; i figli dei blocchi partono uno dopo l'altro. */
(function () {
  var d = document.documentElement;
  window.movimentoPronto = true;
  if (!d.classList.contains("js-movimento")) return;
  var blocchi = ".servizi-griglia,.dritte-lista,.ig-strip,.canali,.chi-breve,.ascolta-griglia,.contatto-griglia";
  var passo = function (e) { return e.classList.contains("ig-strip") ? 0.06 : 0.12; };
  var o = new IntersectionObserver(function (voci) {
    voci.forEach(function (v) {
      if (!v.isIntersecting) return;
      var e = v.target;
      o.unobserve(e);
      if (e.matches(blocchi)) {
        var figli = Array.prototype.slice.call(e.children);
        figli.forEach(function (f, i) { f.style.transitionDelay = Math.min(i, 8) * passo(e) + "s"; });
        // ritardo tolto a entrata finita, così il passaggio del mouse risponde subito
        setTimeout(function () { figli.forEach(function (f) { f.style.transitionDelay = ""; }); }, 2000);
      }
      e.classList.add("visibile");
    });
  // soglia 0: un elenco più alto di molti schermi (le Dritte sul telefono) non arriverebbe mai a una quota visibile
  }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("main section:not(.eroe) .contenitore>h2,main section:not(.eroe) .contenitore>h2+p," + blocchi).forEach(function (e) { o.observe(e); });
})();
