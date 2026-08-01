// Builds importable .mcpack / .mcaddon files from BP/ and RP/.
//
// Common import error ("Import fehlgeschlagen") happens when the whole repo
// (BP/, RP/, README.md, package.json, ...) is zipped as one file and renamed
// to .mcpack: Minecraft expects exactly ONE pack's manifest.json at the ZIP
// ROOT per .mcpack, and a .mcaddon must contain the pack folders directly at
// its root (not nested inside a repo folder).
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const PACK_NAME = "FeuerzauberAddon";

function zip(sourceDir, outFile, entryNames) {
  rmSync(outFile, { force: true });
  if (platform() === "win32") {
    const psCommand = `Compress-Archive -Path ${entryNames
      .map((n) => `'${join(sourceDir, n)}'`)
      .join(",")} -DestinationPath '${outFile}'`;
    execFileSync("powershell", ["-NoProfile", "-Command", psCommand]);
  } else {
    execFileSync("zip", ["-r", outFile, ...entryNames], { cwd: sourceDir });
  }
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Single-pack .mcpack files: zip the *contents* of BP/RP so manifest.json is
// at the archive root.
zip(join(ROOT, "BP"), join(DIST, `${PACK_NAME}_BP.mcpack`), ["."]);
zip(join(ROOT, "RP"), join(DIST, `${PACK_NAME}_RP.mcpack`), ["."]);

// Combined .mcaddon: BP/ and RP/ folders directly at the archive root.
zip(ROOT, join(DIST, `${PACK_NAME}.mcaddon`), ["BP", "RP"]);

console.log(`Packages written to ${DIST}`);
console.log("- Import the .mcaddon (recommended) or the two .mcpack files.");
