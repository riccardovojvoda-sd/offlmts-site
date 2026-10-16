// Player Spotify caricato solo al clic (niente cookie di terze parti finche' non lo chiedi).
// Vale per ogni pulsante .ascolta-avvia: la sezione Ascolta (352 px) e la colonna delle dritte (data-altezza 152, compatto).
(function () {
  document.querySelectorAll(".ascolta-avvia").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.parentNode;
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
    });
  });
})();
