// Bottone "torna in alto": compare dopo circa una schermata di scroll, scroll dolce salvo "riduci movimento".
(function () {
  var b = document.querySelector(".in-alto");
  if (!b) return;
  var visibile = false;
  function aggiorna() {
    var v = window.scrollY > window.innerHeight * 0.8;
    if (v === visibile) return;
    visibile = v;
    if (v) { b.hidden = false; requestAnimationFrame(function () { b.classList.add("visibile"); }); }
    else { b.classList.remove("visibile"); setTimeout(function () { if (!visibile) b.hidden = true; }, 250); }
  }
  window.addEventListener("scroll", aggiorna, { passive: true });
  aggiorna();
  b.addEventListener("click", function (e) {
    e.preventDefault();
    var dolce = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: dolce ? "smooth" : "auto" });
    var s = document.querySelector(".salta");
    if (s) { s.focus({ preventScroll: true }); s.blur(); }
  });
})();
