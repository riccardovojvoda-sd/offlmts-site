// Uscita di riserva (regola di Riccardo del 02/10/2026).
// Gira SOLO nella build programmata dell'ora di uscita (vedi deploy.yml). Se oggi è un giorno di uscita del calendario e
// nessun articolo pronto (non in bozza, con data) ha la data di oggi, il primo articolo pronto con data futura viene
// anticipato a oggi: si riscrive la `date` nel front matter (anche delle traduzioni con la stessa `chiave`), commit + push,
// e la build che segue lo pubblica. La decisione si prende all'ora di uscita, mai prima.
// Il Piano (foglio Google) lo riallinea Claude alla sessione dopo: i commit si riconoscono dal titolo "Uscita di riserva".
//
// Uso: node scripts/uscita-di-riserva.js --cartelle src/dritte[,altre] --ora 17:00 [--prova]
//   --ora: ora UTC di uscita (offlmts 17:00, sdrv 07:00). Se la data originale è "secca" (AAAA-MM-GG) resta secca.
//   --prova: dice cosa farebbe, senza scrivere né pushare.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const arg = (nome, def) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const PROVA = process.argv.includes("--prova");
const cartelle = arg("cartelle", "").split(",").filter(Boolean);
const ora = arg("ora", "");
const oggi = arg("oggi", new Date().toISOString().slice(0, 10));   // --oggi solo per le prove

const calendario = JSON.parse(fs.readFileSync(path.join(__dirname, "calendario-uscite.json"), "utf8"));
if (!calendario.includes(oggi)) {
  console.log(`Uscita di riserva: ${oggi} non è un giorno di uscita, niente da fare.`);
  process.exit(0);
}

function leggi(file) {
  const testo = fs.readFileSync(file, "utf8");
  const m = testo.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const campo = (k) => (m[1].match(new RegExp(`^${k}:\\s*(.*)$`, "m")) || [])[1];
  const pulisci = (v) => (v || "").trim().replace(/^["']|["']$/g, "");
  return { file, testo, data: pulisci(campo("date")), bozza: pulisci(campo("bozza")) === "true",
           chiave: pulisci(campo("chiave")), indice: pulisci(campo("indice")) === "true" };
}

const articoli = cartelle.flatMap((c) => fs.readdirSync(c)
  .filter((f) => /\.(md|html)$/.test(f))
  .map((f) => leggi(path.join(c, f)))
  .filter((a) => a && a.data && !a.indice));
// la prima cartella è quella italiana: decide cosa è pronto; le altre seguono per `chiave`
const italiani = articoli.filter((a) => a.file.startsWith(cartelle[0] + path.sep));
const pronti = italiani.filter((a) => !a.bozza);
const giorno = (a) => a.data.slice(0, 10);

const diOggi = pronti.filter((a) => giorno(a) === oggi);
if (diOggi.length) {
  console.log(`Uscita di riserva: oggi esce già ${diOggi.map((a) => path.basename(a.file)).join(", ")}.`);
  process.exit(0);
}
const futuri = pronti.filter((a) => giorno(a) > oggi).sort((a, b) => a.data.localeCompare(b.data));
if (!futuri.length) {
  console.log("Uscita di riserva: l'articolo di oggi non è pronto e non c'è nessun articolo pronto da anticipare.");
  process.exit(0);
}

const scelto = futuri[0];
const gruppo = scelto.chiave ? articoli.filter((a) => a.chiave === scelto.chiave) : [scelto];
const vecchia = giorno(scelto);
for (const a of gruppo) {
  const nuova = a.data.includes("T") ? `${oggi}T${ora}:00Z` : oggi;
  const testo = a.testo.replace(/^date:.*$/m, `date: ${nuova}`);
  console.log(`${PROVA ? "[prova] " : ""}${a.file}: date ${a.data} -> ${nuova}`);
  if (!PROVA) fs.writeFileSync(a.file, testo);
}
if (PROVA) process.exit(0);

const titolo = `Uscita di riserva: ${path.basename(scelto.file).replace(/\.(md|html)$/, "")} anticipato dal ${vecchia} al ${oggi}`;
const sh = (c) => execSync(c, { stdio: "inherit" });
sh('git config user.name "uscita-di-riserva"');
sh('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
sh(`git add ${gruppo.map((a) => JSON.stringify(a.file)).join(" ")}`);
sh(`git commit -m ${JSON.stringify(titolo + "\n\nL'articolo previsto per oggi non era pronto (regola del 02/10/2026).")}`);
sh("git pull --rebase origin main && git push origin HEAD:main");
console.log(titolo);
