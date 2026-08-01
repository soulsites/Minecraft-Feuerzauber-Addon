// Copies BP/ and RP/ into the local Minecraft Bedrock "com.mojang" development
// pack folders so the addon can be tested without manual copy/paste.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

const PACK_NAME = "FeuerzauberAddon";

function getComMojangPath() {
  const home = homedir();
  switch (platform()) {
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
    case "darwin":
      return join(
        home,
        "Library",
        "Application Support",
        "mcpelauncher",
        "games",
        "com.mojang"
      );
    default:
      return join(home, ".local", "share", "mcpelauncher", "games", "com.mojang");
  }
}

function deployPack(sourceDir, targetRoot, suffix) {
  const target = join(targetRoot, `${PACK_NAME}${suffix}`);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(sourceDir, target, { recursive: true });
  console.log(`Deployed ${sourceDir} -> ${target}`);
}

const comMojang = getComMojangPath();
if (!existsSync(comMojang)) {
  console.error(`com.mojang folder not found at: ${comMojang}`);
  console.error("Set up Minecraft Bedrock locally or adjust scripts/deploy.js.");
  process.exit(1);
}

deployPack("BP", join(comMojang, "development_behavior_packs"), "_BP");
deployPack("RP", join(comMojang, "development_resource_packs"), "_RP");
