import { system } from "@minecraft/server";

const LONG_PRESS_THRESHOLD_SECONDS = 0.5;
const FIREBALL_LAUNCH_DISTANCE = 1.5;

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("feuerzauber:blaze_rod_fireball", {
    onCompleteUse(event) {
      const player = event.source;
      if (!player || event.useDuration < LONG_PRESS_THRESHOLD_SECONDS) {
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
