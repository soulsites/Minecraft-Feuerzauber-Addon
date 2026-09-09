import { world, system } from "@minecraft/server";

const LONG_PRESS_THRESHOLD_SECONDS = 0.5;
const FIREBALL_LAUNCH_DISTANCE = 1.5;

// Runs once, right after the script loads. If this message never shows up
// in chat, the script isn't loading at all (check: world created with
// "Beta APIs" experiment enabled, and both packs added under Behavior AND
// Resource Packs).
system.run(() => {
  world.sendMessage("§6[Feuerzauber]§r Addon geladen.");
  world.sendMessage(
    "§6[Feuerzauber]§r Test-Schwert holen: §7/give @s feuerzauber:test_sword"
  );
  world.sendMessage(
    "§6[Feuerzauber]§r Blaue Variante (9 Schaden): §7/give @s feuerzauber:test_sword_blue"
  );
  world.sendMessage(
    "§6[Feuerzauber]§r Blaue Rüstung (stärker als Netherit): §7/give @s feuerzauber:armor_blue_helmet §7usw."
  );
  world.sendMessage(
    "§6[Feuerzauber]§r Pinke Rüstung (~Diamant): §7/give @s feuerzauber:armor_pink_helmet §7usw."
  );
});

// Simple sanity-check effect that needs no custom item at all: right-click
// with a plain vanilla stick to strike lightning at your feet. Good first
// test to confirm the Script API is running before testing the fireball
// wand below.
world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== "minecraft:stick") {
    return;
  }
  const player = event.source;
  player.dimension.spawnEntity("minecraft:lightning_bolt", player.location);
  world.sendMessage("§6[Feuerzauber]§r Blitz-Test ausgeloest.");
});

// The fireball wand. This is a CUSTOM item (feuerzauber:blaze_rod), not the
// vanilla Blaze Rod that drops from Blazes - vanilla items can't have custom
// components attached to them. Get it with: /give @s feuerzauber:blaze_rod
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("feuerzauber:blaze_rod_fireball", {
    onUse(event) {
      event.source?.onScreenDisplay.setActionBar("§6Aufladen...§r");
    },
    onCompleteUse(event) {
      const player = event.source;
      if (!player) {
        return;
      }
      player.onScreenDisplay.setActionBar(
        `§6Losgelassen nach ${event.useDuration.toFixed(2)}s§r`
      );
      if (event.useDuration < LONG_PRESS_THRESHOLD_SECONDS) {
        return;
      }
      shootFireball(player);
    },
  });
});

// Speed of the fireball in blocks/tick. shoot() takes the vector as-is, so
// the near-unit-length view direction alone barely moves the fireball -
// it needs to be scaled up for a visible, ghast-like speed.
const FIREBALL_SPEED = 1.5;

function shootFireball(player) {
  // Everything here runs from an event callback, so an exception is only
  // ever written to the content log on PC/console - on a phone there is no
  // way to see it. Catch and report to chat so testing on mobile is
  // actually possible.
  try {
    const dimension = player.dimension;
    const viewDirection = player.getViewDirection();
    const headLocation = player.getHeadLocation();
    const spawnLocation = {
      x: headLocation.x + viewDirection.x * FIREBALL_LAUNCH_DISTANCE,
      y: headLocation.y + viewDirection.y * FIREBALL_LAUNCH_DISTANCE,
      z: headLocation.z + viewDirection.z * FIREBALL_LAUNCH_DISTANCE,
    };

    // NOT "minecraft:fireball": the vanilla fireball entity has
    // is_spawnable/is_summonable set to false in its own definition, so
    // dimension.spawnEntity() silently refuses to create it (same as
    // /summon minecraft:fireball failing in vanilla). feuerzauber:fireball
    // is our own entity (BP/entities/fireball.json) that reuses the vanilla
    // look/sound but is explicitly spawnable.
    const fireball = dimension.spawnEntity("feuerzauber:fireball", spawnLocation);
    if (!fireball?.isValid) {
      world.sendMessage("§c[Feuerzauber]§r Fireball-Entity konnte nicht gespawnt werden.");
      return;
    }

    const projectileComponent = fireball.getComponent("minecraft:projectile");
    if (!projectileComponent) {
      world.sendMessage(
        "§c[Feuerzauber]§r Fireball hat keine minecraft:projectile-Komponente - Wurf abgebrochen."
      );
      return;
    }

    projectileComponent.owner = player;
    projectileComponent.shoot({
      x: viewDirection.x * FIREBALL_SPEED,
      y: viewDirection.y * FIREBALL_SPEED,
      z: viewDirection.z * FIREBALL_SPEED,
    });

    dimension.playSound("mob.ghast.fireball", player.location);
    world.sendMessage("§6[Feuerzauber]§r Feuerball abgefeuert!");
  } catch (error) {
    world.sendMessage(`§c[Feuerzauber]§r Fehler beim Feuerball-Wurf: ${error}`);
  }
}
