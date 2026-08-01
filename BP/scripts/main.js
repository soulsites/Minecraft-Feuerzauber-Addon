import { world, system } from "@minecraft/server";

const LONG_PRESS_THRESHOLD_SECONDS = 0.5;
const FIREBALL_LAUNCH_DISTANCE = 1.5;

// Runs once, right after the script loads. If this message never shows up
// in chat, the script isn't loading at all (check: world created with
// "Beta APIs" experiment enabled, and both packs added under Behavior AND
// Resource Packs).
system.run(() => {
  world.sendMessage("§6[Feuerzauber]§r Addon geladen.");
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

function shootFireball(player) {
  const dimension = player.dimension;
  const viewDirection = player.getViewDirection();
  const headLocation = player.getHeadLocation();
  const spawnLocation = {
    x: headLocation.x + viewDirection.x * FIREBALL_LAUNCH_DISTANCE,
    y: headLocation.y + viewDirection.y * FIREBALL_LAUNCH_DISTANCE,
    z: headLocation.z + viewDirection.z * FIREBALL_LAUNCH_DISTANCE,
  };

  const fireball = dimension.spawnEntity("minecraft:fireball", spawnLocation);
  const projectileComponent = fireball.getComponent("minecraft:projectile");
  if (projectileComponent) {
    projectileComponent.owner = player;
    projectileComponent.shoot(viewDirection);
  }

  dimension.playSound("mob.ghast.fireball", player.location);
}
