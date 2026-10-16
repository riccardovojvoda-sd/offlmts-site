// Player Spotify: si carica da solo per chi ha accettato i cookie nel banner (chiave "consenso-analytics" = "si",
// o evento "consenso-si" al clic su Accetto); per gli altri resta il pulsante, e carica solo al clic.
// Vale per ogni pulsante .ascolta-avvia: la sezione Ascolta (352 px) e la colonna delle dritte (data-altezza 80, minimo).
(function () {
  function carica(b) {
    var c = b.parentNode;
    if (!c) return;
    var f = document.createElement("iframe");
    f.src = c.getAttribute("data-embed");
    f.title = "Playlist OFFLMTS su Spotify";
    f.width = "100%";
    f.height = c.getAttribute("data-altezza") || "352";
    f.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    f.setAttribute("loading", "lazy");
    f.style.border = "0";
    f.style.borderRadius = "12px";
    c.replaceChild(f, b);
  }
  function caricaTutti() {
    document.querySelectorAll(".ascolta-avvia").forEach(carica);
  }
  document.querySelectorAll(".ascolta-avvia").forEach(function (b) {
    b.addEventListener("click", function () { carica(b); });
  });
  // Solo con il consenso dato sul banner che nomina Spotify (consenso-versione "2", vedi parti/analytics.njk)
  var consenso = null, versione = null;
  try { consenso = localStorage.getItem("consenso-analytics"); versione = localStorage.getItem("consenso-versione"); } catch (e) {}
  if (consenso === "si" && versione === "2") caricaTutti();
  document.addEventListener("consenso-si", caricaTutti);
})();
