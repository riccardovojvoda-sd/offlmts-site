# Messa online di offlmts.com su GitHub Pages

Stato al 2026-09-15: il sito nuovo e' costruito e gia' pubblicato su GitHub Pages col nome
`www.offlmts.com`. Manca solo che il dominio punti li'. Stessa procedura gia' fatta per
sounddesignrv.com (guida completa in `sounddesignrv-site/MESSA-ONLINE.md`): qui solo le
differenze. I passi a mano sono tuoi (Squarespace e Infomaniak vogliono il tuo login).

Ordine: prima il DNS (il sito nuovo va online in un'ora), poi il trasferimento del dominio
a Infomaniak, **da ordinare entro meta' ottobre 2026**: il dominio scade su Squarespace
l'08/11/2026 e il trasferimento vuole margine.

---

## Passo 1. DNS su Squarespace: far puntare offlmts.com a GitHub (10 minuti)

1. https://account.squarespace.com/domains > `offlmts.com` > **Impostazioni DNS**.
2. **Elimina** i record predefiniti di Squarespace: i 4 `A` con host `@` (198.185.159.144,
   198.185.159.145, 198.49.23.144, 198.49.23.145) e il `CNAME` con host `www` verso
   `ext-sq.squarespace.com`. Se non si lasciano cancellare, prima scollega il dominio dal
   sito OFFLMTS (Impostazioni > Domini > offlmts.com > Scollega): il sito Squarespace resta
   in piedi sul suo indirizzo `.squarespace.com`.
3. **Lascia** eventuali `TXT` di verifica (`google-site-verification=...`).
4. **Aggiungi**:

```
A      @    185.199.108.153
A      @    185.199.109.153
A      @    185.199.110.153
A      @    185.199.111.153
AAAA   @    2606:50c0:8000::153
AAAA   @    2606:50c0:8001::153
AAAA   @    2606:50c0:8002::153
AAAA   @    2606:50c0:8003::153
CNAME  www  riccardovojvoda-sd.github.io
```

5. Salva e scrivimi "DNS offlmts fatto": da li' faccio io (propagazione, certificato HTTPS di
   GitHub, "Enforce HTTPS", verifica dei redirect dai vecchi indirizzi).

## Passo 2. Trasferire offlmts.com a Infomaniak (entro meta' ottobre)

Identico a sounddesignrv.com, passo 2 della sua guida: sblocco + codice di trasferimento su
Squarespace (in 1Password, voce "offlmts.com dominio"), ordine su
https://www.infomaniak.com/it/domini/trasferimento-nome-dominio con "Usa i DNS di
Infomaniak", clic sulla mail di conferma. Poi ti ripasso i 9 record qui sopra da incollare
nella zona DNS di Infomaniak.

Con il dominio su Infomaniak arriva anche il Mail Starter gratuito: una casella
`info@offlmts.com` o `studio@offlmts.com` al posto della gmail, se la vuoi. Non e'
obbligatoria: il sito oggi usa `offlmtsrecordingstudio@gmail.com` e funziona.

## Passo 3. Chiudere Squarespace (dopo una settimana di sito nuovo funzionante)

1. Sito OFFLMTS su Squarespace: Impostazioni > Fatturazione > **disattiva il rinnovo**.
   La data di scadenza del sito la leggi li' (non la conosco): segnamela.
2. Non cancellare il sito prima della scadenza: costa zero e serve come riferimento.
   L'archivio completo del vecchio sito e' comunque in `offlmts-site/materiali/` (Dropbox).

---

## Cose fatte da me il 15/09/2026

- Repo **pubblico** `riccardovojvoda-sd/offlmts-site` (obbligatorio per GitHub Pages gratis),
  commit con l'indirizzo anonimo GitHub. Nel repo NON ci sono `materiali/` (archivio del
  vecchio sito, con la pagina Tariffe) ne' `testi/` (i testi approvati): restano solo in
  Dropbox.
- GitHub Pages attivo con sorgente "GitHub Actions", dominio custom `www.offlmts.com`.
  Workflow `deploy.yml`: build Eleventy + controlli + deploy. Ogni push su `main` pubblica.
- Redirect dai vecchi URL: `/about` > `/chi-sono/`, `/tariffe` > `/servizi/`, `/cart` > `/`,
  `/contact` > `/contatti/`, `/servizi/#istruzioni` > `/prepara-il-materiale/`. I post delle
  Dritte tengono gli stessi indirizzi di prima. Le pagine `/dritte/tag/...` non esistono piu'.
- Anteprima locale: `npm run dev` nella cartella del sito, poi http://localhost:8091/.
