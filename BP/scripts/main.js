// `world` gibt uns Zugriff auf Ereignisse und Dimensionen der Spielwelt.
// `system` stellt unter anderem den aktuellen Spiel-Tick und verzögerte Aufrufe bereit.
import { world, system } from "@minecraft/server";

// Alle festen Werte stehen am Anfang, damit man die Zauberbalance leicht ändern kann.
const BLAZE_ROD_ID = "feuerzauber:blaze_rod";
const TICKS_PER_SECOND = 20;
const ITEM_USE_DURATION_SECONDS = 5;
const LONG_PRESS_THRESHOLD_SECONDS = 0.5;
const FIREBALL_LAUNCH_DISTANCE = 1.5;
const FIREBALL_SPEED = 1.3;

// Bedrock misst Item-Nutzungszeiten in Ticks. Bei normalen 20 TPS entsprechen
// 5 Sekunden also 100 Ticks und 0,5 Sekunden 10 Ticks.
const ITEM_USE_DURATION_TICKS = ITEM_USE_DURATION_SECONDS * TICKS_PER_SECOND;
const LONG_PRESS_THRESHOLD_TICKS =
  LONG_PRESS_THRESHOLD_SECONDS * TICKS_PER_SECOND;

// Script-APIs dürfen in der allerersten Ladephase noch nicht jede Weltfunktion
// aufrufen. `system.run` verschiebt die Nachricht deshalb sicher um einen Tick.
// Fehlt sie im Spiel, wurde das Behavior-Pack-Script gar nicht geladen.
system.run(() => {
  world.sendMessage("§6[Feuerzauber]§r Addon geladen.");
});

// Diagnose-Hilfe: Ein normaler Vanilla-Stock benötigt kein Custom Item.
// Wenn Rechtsklick damit einen Blitz erzeugt, funktionieren Script API und Pack;
// dann liegt ein verbleibender Fehler speziell an der Custom Blaze Rod.
world.afterEvents.itemUse.subscribe((event) => {
  // Andere benutzte Items interessieren diesen Test nicht.
  if (event.itemStack.typeId !== "minecraft:stick") {
    return;
  }

  // `event.source` ist der Spieler, der das Item benutzt hat.
  const player = event.source;
  player.dimension.spawnEntity("minecraft:lightning_bolt", player.location);
  world.sendMessage("§6[Feuerzauber]§r Blitz-Test ausgelöst.");
});

// JSON verweist auf diese eigene Komponente. Eigene Komponenten müssen während
// `startup` registriert werden, bevor Minecraft die Item-Dateien fertig lädt.
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "feuerzauber:blaze_rod_fireball",
    {
      // `onUse` meldet den Beginn des Aufladens. Geschossen wird hier noch nicht,
      // weil ein kurzer Klick laut Spielidee keinen Feuerball auslösen soll.
      onUse(event) {
        event.source?.onScreenDisplay.setActionBar("§6Aufladen...§r");
      },
    }
  );
});

// WICHTIGER BUGFIX:
// `onCompleteUse` bedeutet nicht "der Spieler hat losgelassen", sondern
// "die komplette use_duration ist abgelaufen". `itemStopUse` wird dagegen
// sowohl beim Loslassen als auch am Ende des vollständigen Aufladens ausgelöst.
world.afterEvents.itemStopUse.subscribe((event) => {
  // Bei einem Dimensionswechsel kann itemStack laut API undefiniert sein.
  // Optional Chaining verhindert dann einen Scriptfehler.
  if (event.itemStack?.typeId !== BLAZE_ROD_ID) {
    return;
  }

  // Die API liefert die *verbleibende* Zeit in Ticks. Deshalb ziehen wir sie
  // von der konfigurierten Gesamtdauer ab, um die gehaltene Zeit zu erhalten.
  const heldTicks = Math.max(0, ITEM_USE_DURATION_TICKS - event.useDuration);
  const heldSeconds = heldTicks / TICKS_PER_SECOND;
  const player = event.source;

  player.onScreenDisplay.setActionBar(
    `§6Losgelassen nach ${heldSeconds.toFixed(2)} s§r`
  );

  // Unter 0,5 Sekunden war es nur ein kurzer Klick.
  if (heldTicks < LONG_PRESS_THRESHOLD_TICKS) {
    return;
  }

  shootFireball(player);
});

/**
 * Erzeugt einen kleinen Blaze-Feuerball vor dem Kopf des Spielers und schießt
 * ihn exakt in dessen Blickrichtung.
 *
 * @param {import("@minecraft/server").Player} player der zaubernde Spieler
 */
function shootFireball(player) {
  const dimension = player.dimension;

  // `getViewDirection` liefert einen normierten Richtungsvektor (Länge 1).
  // Beispiel beim Blick nach Osten: ungefähr { x: 1, y: 0, z: 0 }.
  const viewDirection = player.getViewDirection();
  const headLocation = player.getHeadLocation();

  // Direkt im Kopf würde das Projektil eventuell mit dem Spieler kollidieren.
  // Darum verschieben wir den Spawnpunkt 1,5 Blöcke nach vorne.
  const spawnLocation = {
    x: headLocation.x + viewDirection.x * FIREBALL_LAUNCH_DISTANCE,
    y: headLocation.y + viewDirection.y * FIREBALL_LAUNCH_DISTANCE,
    z: headLocation.z + viewDirection.z * FIREBALL_LAUNCH_DISTANCE,
  };

  // Blazes verwenden `small_fireball`; `fireball` wäre der große Ghast-Schuss.
  const fireball = dimension.spawnEntity(
    "minecraft:small_fireball",
    spawnLocation
  );
  const projectileComponent = fireball.getComponent("minecraft:projectile");

  // Vanilla small_fireball besitzt diese Komponente. Die Prüfung hält das
  // Script trotzdem stabil, falls Mojang die Entity-Definition einmal ändert.
  if (projectileComponent) {
    // Der Besitzer zählt bei Schaden als Angreifer und wird nicht sofort vom
    // eigenen Projektil getroffen.
    projectileComponent.owner = player;

    // `shoot` erwartet Geschwindigkeit, nicht nur Richtung. Daher skalieren wir
    // jede Achse des Richtungsvektors mit der gewünschten Geschwindigkeit.
    projectileComponent.shoot({
      x: viewDirection.x * FIREBALL_SPEED,
      y: viewDirection.y * FIREBALL_SPEED,
      z: viewDirection.z * FIREBALL_SPEED,
    });
  }

  // Akustisches Feedback am Standort des Spielers.
  dimension.playSound("mob.ghast.fireball", player.location);
}
