// Dieses Script kopiert BP/ und RP/ in Minecraft Bedrocks lokale
// Entwicklungsordner. So genügt `npm run deploy` für einen neuen Teststand.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

// Beide Zielordner beginnen mit demselben gut erkennbaren Namen.
const PACK_NAME = "FeuerzauberAddon";

// Ermittelt den üblichen `com.mojang`-Pfad des aktuellen Betriebssystems.
function getComMojangPath() {
  // `homedir()` funktioniert auch dann, wenn das Projekt nicht im Benutzerordner liegt.
  const home = homedir();
  switch (platform()) {
    // Offizielle Minecraft-for-Windows-Installation.
    case "win32":
      return join(
        home,
        "AppData",
        "Local",
        "Packages",
        "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
        "LocalState",
        "games",
        "com.mojang"
      );
    // Bedrock läuft auf macOS nicht offiziell; dieser Pfad gehört zum Launcher.
    case "darwin":
      return join(
        home,
        "Library",
        "Application Support",
        "mcpelauncher",
        "games",
        "com.mojang"
      );
    // Linux und alle übrigen Systeme nutzen den üblichen Launcher-Pfad.
    default:
      return join(home, ".local", "share", "mcpelauncher", "games", "com.mojang");
  }
}

// Kopiert genau ein Pack. Der alte Zielordner wird entfernt, damit gelöschte
// Quelldateien nicht als veraltete Reste im Minecraft-Ordner liegen bleiben.
function deployPack(sourceDir, targetRoot, suffix) {
  const target = join(targetRoot, `${PACK_NAME}${suffix}`);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(sourceDir, target, { recursive: true });
  console.log(`Deployed ${sourceDir} -> ${target}`);
}

// Ohne installierten/initialisierten Launcher existiert `com.mojang` noch nicht.
const comMojang = getComMojangPath();
if (!existsSync(comMojang)) {
  console.error(`com.mojang folder not found at: ${comMojang}`);
  console.error("Set up Minecraft Bedrock locally or adjust scripts/deploy.js.");
  process.exit(1);
}

// Behavior Pack und Resource Pack gehören in verschiedene Entwicklungsordner.
deployPack("BP", join(comMojang, "development_behavior_packs"), "_BP");
deployPack("RP", join(comMojang, "development_resource_packs"), "_RP");
