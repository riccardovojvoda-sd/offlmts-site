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
- `src/_data/sito.json`: nome, contatti, indirizzo, profili social, link di trasferimento file, `ga4` (ID di Google Analytics).
- Google Analytics: account "OFFLMTS Recording Studio" sull'account Google dello studio (offlmtsrecordingstudio@gmail.com), proprietà `offlmts.com` (558024955), ID `G-KEK9FJ30P3`, conservazione dati 14 mesi, condivisione dati con Google spenta (solo assistenza tecnica). Parte solo dopo "Accetto" nel banner. Per provarlo NON usare Brave (gli Shields bloccano GA) né un browser headless con user agent di default (filtrato come bot).
- `src/_data/instagram.json`: i post Instagram mostrati nella strip della home (`url`, `copertina` in `src/assets/img/instagram/`, `didascalia`). Vuoto = la sezione non compare. Si aggiorna a mano quando Riccardo pubblica un post.
- `src/_data/reindirizzi.json`: vecchi URL Squarespace (`/about`, `/tariffe`, `/cart`, `/contact`) che rimandano alle pagine nuove, e indirizzi corti da usare sui social (es. `/distrokid` per la dritta DistroKid).
- `src/privacy.njk` e `src/en/privacy.njk`: informativa privacy e cookie (hosting GitHub Pages, Google Analytics solo col consenso, modulo drumkit Brevo, contatti, player Spotify). Linkata dal piè e dal banner cookie. Se si aggiunge un servizio che tratta dati, aggiornarla.
- `instagram-caroselli/<dritta>/`: caroselli Instagram tratti dalle dritte (HTML con font e colori del sito, `rendi-carosello.py` lo trasforma in PNG 1080x1350 con Playwright).
- Tema chiaro "Carta" opzionale (scelto l'8/10/2026): il sito parte SEMPRE scuro, anche se il sistema è in chiaro. Il chiaro si attiva solo col pulsante sole/luna (in basso a destra, sopra il torna-su, `assets/js/tema.js`), la scelta resta in localStorage `tema` = `chiaro`; tornando allo scuro la chiave viene tolta. Classe `chiaro` su `<html>`, messa dallo script in testa a `layouts/base.njk` (niente lampo). Regole in fondo a `css/sito.css`: fondo crema `#F5EFE4`, testo `#1C1814`, oro e verde più scuri per il testo (`#8F5718`, `#1D6B60`), bottoni nell'oro del logo, logo in nero (`filter:brightness(0)`), foto della home scura col testo bianco sul desktop.
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
