// Baut importierbare .mcpack- und .mcaddon-Dateien aus BP/ und RP/.
//
// Häufige Ursache für "Import fehlgeschlagen": Das ganze Repository wird als
// .mcpack verpackt. Ein .mcpack darf aber nur EIN Pack enthalten und dessen
// manifest.json muss direkt an der Wurzel des ZIP-Archivs liegen.
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// ES-Module besitzen kein eingebautes `__dirname`; diese beiden Aufrufe bauen
// es aus der URL der aktuell ausgeführten Datei nach.
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PACK_NAME = "FeuerzauberAddon";

// Erstellt ein ZIP-kompatibles Minecraft-Paket. Windows bringt PowerShell mit,
// macOS/Linux normalerweise das Kommandozeilenprogramm `zip`.
function zip(sourceDir, outFile, entryNames) {
  // Ein vorhandenes Archiv wird entfernt, sonst könnte `zip` alte Einträge behalten.
  rmSync(outFile, { force: true });
  if (platform() === "win32") {
    // Jeder Eintrag wird einzeln quotiert, damit Leerzeichen im Pfad funktionieren.
    const psCommand = `Compress-Archive -Path ${entryNames
      .map((n) => `'${join(sourceDir, n)}'`)
      .join(",")} -DestinationPath '${outFile}'`;
    execFileSync("powershell", ["-NoProfile", "-Command", psCommand]);
  } else {
    // `cwd` sorgt dafür, dass nur relative Namen im Archiv landen.
    execFileSync("zip", ["-r", outFile, ...entryNames], { cwd: sourceDir });
  }
}

// `dist` wird für reproduzierbare Pakete bei jedem Lauf neu aufgebaut.
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Einzelne .mcpack-Dateien: Der PUNKT bedeutet "Inhalt dieses Ordners".
// Dadurch liegt manifest.json direkt im Archiv-Root.
zip(join(ROOT, "BP"), join(DIST, `${PACK_NAME}_BP.mcpack`), ["."]);
zip(join(ROOT, "RP"), join(DIST, `${PACK_NAME}_RP.mcpack`), ["."]);

// Kombiniertes .mcaddon: Hier müssen BP/ und RP/ selbst im Archiv liegen.
zip(ROOT, join(DIST, `${PACK_NAME}.mcaddon`), ["BP", "RP"]);

// Diese Ausgabe zeigt, wo die fertigen, importierbaren Dateien liegen.
console.log(`Packages written to ${DIST}`);
console.log("- Import the .mcaddon (recommended) or the two .mcpack files.");
