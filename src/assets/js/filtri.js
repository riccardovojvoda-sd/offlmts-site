// Filtri delle liste di articoli: per chi, argomento, ricerca nel titolo e nel riassunto. Stato nell'URL (?chi=&argomento=&q=) così i filtri si linkano.
(function () {
  var form = document.querySelector("[data-filtri]");
  var lista = document.querySelector("[data-lista]");
  if (!form || !lista) return;
  var voci = Array.prototype.slice.call(lista.querySelectorAll("li"));
  var cerca = form.querySelector("input[name=q]");
  var conta = form.querySelector("[data-conta]");
  var vuoto = form.querySelector("[data-vuoto]");
  var azzera = form.querySelector("[data-azzera]");
  var stato = { chi: "", argomento: "", q: "" };

  function applica() {
    var q = stato.q.trim().toLowerCase();
    var n = 0;
    voci.forEach(function (li) {
      var ok = (!stato.chi || (" " + li.dataset.chi + " ").indexOf(" " + stato.chi + " ") >= 0) &&
               (!stato.argomento || (" " + li.dataset.argomento + " ").indexOf(" " + stato.argomento + " ") >= 0) &&
               (!q || li.dataset.testo.indexOf(q) >= 0);
      li.hidden = !ok;
      if (ok) n++;
    });
    form.querySelectorAll("[data-gruppo]").forEach(function (g) {
      var v = stato[g.dataset.gruppo];
      g.querySelectorAll(".chip").forEach(function (b) { b.classList.toggle("attivo", b.dataset.v === v); b.setAttribute("aria-pressed", b.dataset.v === v); });
    });
    conta.textContent = n === 1 ? conta.dataset.uno : conta.dataset.molti.replace("{n}", n);
    vuoto.hidden = n > 0;
    var attivi = stato.chi || stato.argomento || q;
    azzera.hidden = !attivi;
    var p = new URLSearchParams();
    if (stato.chi) p.set("chi", stato.chi);
    if (stato.argomento) p.set("argomento", stato.argomento);
    if (q) p.set("q", stato.q.trim());
    var url = location.pathname + (p.toString() ? "?" + p.toString() : "");
    history.replaceState(null, "", url);
  }

  form.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    stato[b.closest("[data-gruppo]").dataset.gruppo] = b.dataset.v;
    applica();
  });
  cerca.addEventListener("input", function () { stato.q = cerca.value; applica(); });
  azzera.addEventListener("click", function () { stato = { chi: "", argomento: "", q: "" }; cerca.value = ""; applica(); });

  var iniziale = new URLSearchParams(location.search);
  stato.chi = iniziale.get("chi") || "";
  stato.argomento = iniziale.get("argomento") || "";
  stato.q = iniziale.get("q") || "";
  cerca.value = stato.q;
  applica();
})();
