// Pagina d'ascolto riservata delle basi (vetrina per un artista): un solo brano alla volta, avanzamento automatico,
// stelle da 1 a 3 salvate nel browser, invio del riepilogo via mail già compilata.
(function () {
  var righe = Array.prototype.slice.call(document.querySelectorAll(".base"));
  if (!righe.length) return;
  var CHIAVE = "basi-giovas-stelle-v1";
  var voti = {};
  try { voti = JSON.parse(localStorage.getItem(CHIAVE) || "{}") || {}; } catch (e) { voti = {}; }
  function salva() { try { localStorage.setItem(CHIAVE, JSON.stringify(voti)); } catch (e) {} }
  function tempo(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60); }

  var corrente = null;
  function ferma(r) {
    var a = r.querySelector("audio");
    a.pause();
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
      if (!r.classList.contains("suona")) avvia(r);
    });
    a.addEventListener("ended", function () {
      r.classList.remove("suona");
      barra.value = 0;
      ora.textContent = "0:00";
      if (righe[i + 1]) { avvia(righe[i + 1]); }
    });

    var stelle = Array.prototype.slice.call(r.querySelectorAll(".stella"));
    function mostra() {
      var v = voti[r.dataset.titolo] || 0;
      stelle.forEach(function (s) {
        var on = +s.dataset.v <= v;
        s.classList.toggle("on", on);
        s.setAttribute("aria-pressed", +s.dataset.v === v ? "true" : "false");
      });
    }
    stelle.forEach(function (s) {
      s.addEventListener("click", function () {
        var v = +s.dataset.v;
        if (voti[r.dataset.titolo] === v) { delete voti[r.dataset.titolo]; } else { voti[r.dataset.titolo] = v; }
        salva();
        mostra();
      });
    });
    mostra();
  });

  var stato = document.getElementById("basi-stato");
  function riepilogo() {
    var nota = (document.getElementById("basi-nota").value || "").trim();
    var righeTesto = ["Ciao Riccardo,", "ecco le basi che mi sono piaciute:", ""];
    var conVoto = 0;
    [3, 2, 1].forEach(function (n) {
      var titoli = righe.map(function (r) { return r.dataset.titolo; }).filter(function (t) { return voti[t] === n; });
      if (titoli.length) {
        conVoto += titoli.length;
        righeTesto.push(n + (n === 1 ? " stella: " : " stelle: ") + titoli.join(", "));
      }
    });
    if (!conVoto) righeTesto.push("(nessuna stella data)");
    if (nota) { righeTesto.push("", "Commento: " + nota); }
    return { testo: righeTesto.join("\n"), conVoto: conVoto, nota: nota };
  }
  document.getElementById("basi-invia").addEventListener("click", function () {
    var r = riepilogo();
    if (!r.conVoto && !r.nota) { stato.textContent = "Dai almeno una stella a una base, o scrivi un commento."; return; }
    var cfg = window.BASI_MAIL;
    location.href = "mailto:" + cfg.mail + "?subject=" + encodeURIComponent(cfg.oggetto) + "&body=" + encodeURIComponent(r.testo);
    stato.textContent = "Si apre la mail già compilata: basta premere invio. Se non si apre, usa Copia il riepilogo.";
  });
  document.getElementById("basi-copia").addEventListener("click", function () {
    var r = riepilogo();
    var cfg = window.BASI_MAIL;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(r.testo).then(function () {
        stato.textContent = "Copiato: incollalo in una mail a " + cfg.mail + ".";
      }, function () { stato.textContent = "Copia non riuscita: scrivi le basi scelte in una mail a " + cfg.mail + "."; });
    } else {
      stato.textContent = "Copia non riuscita: scrivi le basi scelte in una mail a " + cfg.mail + ".";
    }
  });
})();
