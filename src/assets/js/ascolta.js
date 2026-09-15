// Player Spotify caricato solo al clic (niente cookie di terze parti finche' non lo chiedi).
(function () {
  var b = document.getElementById("ascolta-avvia");
  if (!b) return;
  b.addEventListener("click", function () {
    var c = b.parentNode;
    var f = document.createElement("iframe");
    f.src = c.getAttribute("data-embed");
    f.title = "Playlist OFFLMTS su Spotify";
    f.width = "100%";
    f.height = "352";
    f.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    f.setAttribute("loading", "lazy");
    f.style.border = "0";
    f.style.borderRadius = "12px";
    c.replaceChild(f, b);
  });
})();
