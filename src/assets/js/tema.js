// Pulsante sole/luna: alterna scuro e chiaro su tutto il sito. Senza una scelta salvata il sito è scuro (non segue il sistema).
// La classe "chiaro" su <html> la mette già lo script in testa a base.njk, così non c'è il lampo scuro al caricamento.
(function () {
  var b = document.querySelector(".interruttore-tema");
  var h = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  function applica(chiaro) {
    h.classList.toggle("chiaro", chiaro);
    if (meta) meta.setAttribute("content", chiaro ? "#F5EFE4" : "#0B0A09");
    if (b) b.setAttribute("aria-pressed", chiaro ? "true" : "false");
  }
  applica(h.classList.contains("chiaro"));
  if (!b) return;
  b.addEventListener("click", function () {
    var chiaro = !h.classList.contains("chiaro");
    applica(chiaro);
    try { if (chiaro) localStorage.setItem("tema", "chiaro"); else localStorage.removeItem("tema"); } catch (e) {}
  });
})();
