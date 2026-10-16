// Indice delle dritte (colonna a destra, stesso script delle guide di sounddesignrv.com): evidenzia il paragrafo che si sta leggendo.
(function () {
  var nav = document.querySelector("[data-indice]");
  if (!nav || !("IntersectionObserver" in window)) return;
  var link = {};
  nav.querySelectorAll("a[href^='#']").forEach(function (a) { link[decodeURIComponent(a.hash.slice(1))] = a; });
  var titoli = Object.keys(link).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!titoli.length) return;
  var corrente = null;
  function segna(id) {
    if (id === corrente) return;
    if (corrente && link[corrente]) link[corrente].removeAttribute("aria-current");
    corrente = id;
    if (id && link[id]) link[id].setAttribute("aria-current", "true");
  }
  // Il paragrafo corrente è l'ultimo titolo passato sopra il primo terzo dello schermo
  function aggiorna() {
    var soglia = window.innerHeight / 3, id = titoli[0].id;
    for (var i = 0; i < titoli.length; i++) {
      if (titoli[i].getBoundingClientRect().top <= soglia) id = titoli[i].id; else break;
    }
    segna(id);
  }
  var attesa = false;
  window.addEventListener("scroll", function () {
    if (attesa) return;
    attesa = true;
    requestAnimationFrame(function () { attesa = false; aggiorna(); });
  }, { passive: true });
  aggiorna();
})();
