// Pagina d'ascolto riservata dei beat: un solo brano alla volta, avanzamento automatico al brano dopo.
// Spostare la barra di un brano fermo cambia solo la posizione: non lo fa partire.
(function () {
  var righe = Array.prototype.slice.call(document.querySelectorAll(".base"));
  if (!righe.length) return;
  function tempo(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }

  var corrente = null;
  function ferma(r) {
    r.querySelector("audio").pause();
    r.classList.remove("suona");
  }
  function avvia(r) {
    if (corrente && corrente !== r) ferma(corrente);
    righe.forEach(function (x) { x.classList.toggle("attiva", x === r); });
    corrente = r;
    var p = r.querySelector("audio").play();
    if (p && p.catch) p.catch(function () { r.classList.remove("suona"); });
    r.classList.add("suona");
  }

  righe.forEach(function (r, i) {
    var a = r.querySelector("audio");
    var barra = r.querySelector("input[type=range]");
    var ora = r.querySelector(".t-ora");
    var trascina = false;
    r.querySelector(".base-play").addEventListener("click", function () {
      if (r.classList.contains("suona")) { ferma(r); } else { avvia(r); }
    });
    a.addEventListener("timeupdate", function () {
      if (trascina) return;
      barra.value = a.currentTime;
      ora.textContent = tempo(a.currentTime);
    });
    a.addEventListener("loadedmetadata", function () {
      if (a.duration && isFinite(a.duration)) barra.max = Math.floor(a.duration);
    });
    barra.addEventListener("input", function () { trascina = true; ora.textContent = tempo(barra.value); });
    barra.addEventListener("change", function () {
      trascina = false;
      a.currentTime = +barra.value;
      ora.textContent = tempo(barra.value);
    });
    a.addEventListener("ended", function () {
      r.classList.remove("suona");
      barra.value = 0;
      ora.textContent = "0:00";
      if (righe[i + 1]) { avvia(righe[i + 1]); }
    });
  });
})();
