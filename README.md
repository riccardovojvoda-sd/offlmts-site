# offlmts-site

Sito statico di **OFFLMTS Recording Studio** (www.offlmts.com), generato con [Eleventy 3](https://www.11ty.dev/).
Stessa ricetta di `sounddesignrv-site`, una lingua sola (italiano).

## Comandi

- `npm install` una volta.
- `npm run dev`: anteprima su http://localhost:8091/ con ricarica automatica. Dal telefono sulla stessa Wi-Fi: http://<ip-del-mac>:8091/ (`ipconfig getifaddr en0` per l'ip).
- `npm run anteprima`: come `build` ma senza `upgrade-insecure-requests` nella CSP, per servire `_site/` in http dal telefono (con `build` normale dal telefono immagini e font non caricano).
- `npm run build`: genera `_site/` (HTML minificato, immagini responsive in avif/webp/jpeg).

## Struttura

- `src/index.njk`, `servizi.njk`, `prepara-il-materiale.njk`, `dritte.njk`, `chi-sono.njk`, `contatti.njk`: le pagine.
- `src/dritte/*.html`: i post del blog "Dritte" (HTML pulito ricavato dal vecchio sito Squarespace, frontmatter con titolo, data, descrizione, copertina, tag).
- `src/_data/sito.json`: nome, contatti, indirizzo, profili social, link di trasferimento file.
- `src/_data/instagram.json`: i post Instagram mostrati nella strip della home (`url`, `copertina` in `src/assets/img/instagram/`, `didascalia`). Vuoto = la sezione non compare. Si aggiorna a mano quando Riccardo pubblica un post.
- `src/_data/reindirizzi.json`: vecchi URL Squarespace (`/about`, `/tariffe`, `/cart`, `/contact`) che rimandano alle pagine nuove.
- `src/_includes/css/sito.css`: tutto lo stile. Palette "oro, nero e verde cabina": oro del logo `#D4964B`, verde `#2E8B7D`, fondo `#0B0A09`. Titoli Space Mono, testo IBM Plex Sans, font in `src/assets/font/` (da @fontsource).
- `src/radice/`: favicon, manifest, robots, CNAME.
- `materiali/` (non nel repo): archivio completo del vecchio sito Squarespace (HTML, testi, immagini, CSS), in Dropbox.
- `testi/` (non nel repo): i testi approvati da Riccardo, pagina per pagina.

## Deploy

GitHub Pages, workflow `.github/workflows/deploy.yml`: a ogni push su `main` costruisce e pubblica. Dominio custom `www.offlmts.com` (file `CNAME`).
Niente backend: il modulo contatti del vecchio sito e' sostituito da WhatsApp, Telegram e mail.
Il player Spotify si carica solo al clic (niente cookie di terze parti prima).

## Cose da non dimenticare

- Niente prezzi sul sito (scelta di Riccardo, 15/09/2026). La vecchia pagina `/tariffe` rimanda a `/servizi/`.
- Il Drumkit Vol.1 e' gratis: oggi punta ancora al link Mediafire del vecchio post; da spostare nel repo (`src/assets/file/`) quando Riccardo passa lo ZIP.
- Nessun em dash / en dash nei testi (regola globale).

## Articoli in due lingue

- Italiano in `src/dritte/<slug>.html` (URL `/dritte/<slug>/`, elenco `/dritte/`), inglese in `src/en/tips/<slug>.html` (URL `/en/tips/<slug>/`, elenco `/en/tips/`).
- Le due versioni si legano con `coppia: <url dell'altra>` nel front matter di entrambe: il layout mette i tag `hreflang` (it, en, x-default sull'italiano), il link "English version" / "Versione italiana" e `lang` giusto sull'html.
- Prima il testo italiano approvato da Riccardo, poi la traduzione. Il menu e il pie' restano in italiano anche sulle pagine inglesi.
