/**
 * ============================================================================
 * MINECRAFT FEUERZAUBER ADDON - Hauptskript
 * ============================================================================
 *
 * Dieses Skript wird immer geladen, wenn die Welt mit diesem Addon startet.
 * Es registriert benutzerdefinierte Item-Komponenten und verwaltet die Logik
 * für die magische Blaze Rod.
 *
 * WICHTIG: Die Minecraft Script API ist eine experimentelle Funktion!
 * Sie müssen beim Erstellen der Welt "Beta APIs" unter den Experimenten
 * aktivieren, sonst funktioniert dieses Skript überhaupt nicht.
 * ============================================================================
 */

// Importiere die Minecraft Server API
// 'world' = die aktuelle Spielwelt (alle Spieler, Entitäten, etc.)
// 'system' = Minecraft-internes Event-System (Startup, Ticks, etc.)
import { world, system } from "@minecraft/server";

// KONSTANTEN: Das sind Werte, die wir nicht ändern wollen, während das Spiel läuft
// Sie steuern das Verhalten des Zauberstabs:

// Wie lange (in Sekunden) muss der Spieler die Taste halten, um einen Feuerball zu schießen?
// 0.5 Sekunden = halbe Sekunde. Wenn man kürzer klickt, passiert nichts.
const LONG_PRESS_THRESHOLD_SECONDS = 0.5;

// Wie weit vor dem Spieler soll der Feuerball spawnen? (in Blöcken)
// 1.5 = der Feuerball entsteht 1,5 Blöcke vor der Augenhöhe des Spielers
// Das verhindert, dass der Feuerball durch den Spieler selbst fliegt
const FIREBALL_LAUNCH_DISTANCE = 1.5;

// ============================================================================
// 1. ADDON STARTUP - Nachricht beim Laden
// ============================================================================
// Diese Funktion läuft EINMAL auf, sobald das Addon geladen ist.
// Sie ist perfekt dafür, um zu testen, ob das Skript überhaupt ausgeführt wird.
//
// Wenn du die Nachricht "[Feuerzauber] Addon geladen." NICHT im Chat siehst,
// dann funktioniert die Script API nicht und es liegt an:
// - Beta APIs nicht aktiviert
// - Packs nicht aktiviert
// - Falsche Minecraft-Version
system.run(() => {
  // Sende eine goldfarbene Nachricht an ALLE Spieler in der Welt
  // §6 = Goldfarbe, §r = Farbe zurücksetzen
  world.sendMessage("§6[Feuerzauber]§r Addon geladen.");
});

// ============================================================================
// 2. BLITZ-TEST - Ein einfacher Test mit einem normalen Stock
// ============================================================================
// Das ist ein einfacher Diagnose-Test: Wenn man einen normalen Minecraft-Stock
// nimmt und klickt, wird ein Blitz spawned.
//
// Das hilft beim Debuggen, weil dieser Test KEINE custom Komponenten braucht:
// - Wenn der Blitz erscheint → Script API funktioniert
// - Wenn nichts passiert → Script lädt nicht richtig
//
// So isolierst du Probleme: Stock = Script API OK, aber Zauberstab = Problem
// im Custom Component oder bei der Aufladedauer.
world.afterEvents.itemUse.subscribe((event) => {
  // Überprüfe, ob der Spieler EINEN NORMALEN STOCK hält
  // (nicht unser spezieller Zauberstab!)
  if (event.itemStack.typeId !== "minecraft:stick") {
    // Wenn es kein Stock ist, mache nichts und gib zurück
    return;
  }

  // Der Stock wurde geklickt - hole den Spieler, der das gemacht hat
  const player = event.source;

  // Spawne einen Blitz genau an der Position des Spielers
  // 'player.dimension' = Die aktuelle Dimension (Oberwelt, Nether, Ende, oder custom)
  // 'player.location' = X, Y, Z Koordinaten des Spielers
  player.dimension.spawnEntity("minecraft:lightning_bolt", player.location);

  // Sende eine Bestätigungsnachricht an den Chat
  world.sendMessage("§6[Feuerzauber]§r Blitz-Test ausgeloest.");
});

// ============================================================================
// 3. FEUERBALL-ZAUBERSTAB - Das Hauptfeature
// ============================================================================
// Das ist das Herzstück des Addons! Hier registrieren wir eine eigene
// Item-Komponente mit Minecraft.
//
// WARUM nicht die echte Blaze Rod? Weil Minecraft nicht erlaubt, Verhalten
// an Vanilla-Items zu hängen. Wir müssen unsere eigene Version machen:
// 'feuerzauber:blaze_rod' (sieht genau wie die echte, funktioniert aber anders)
//
// WICHTIG: Die echte Blaze Rod von Blazes funktioniert NICHT mit Feuerball!
// Du brauchst: /give @s feuerzauber:blaze_rod
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  // Registriere eine neue Custom Component
  // Der Name "feuerzauber:blaze_rod_fireball" muss genau in der .json-Datei
  // des Items stehen (siehe: BP/items/blaze_rod.json)
  itemComponentRegistry.registerCustomComponent("feuerzauber:blaze_rod_fireball", {

    // onUse() wird aufgerufen, SOBALD der Spieler die Taste drückt und hält
    // (noch NICHT losgelassen)
    onUse(event) {
      // Zeige dem Spieler in der Action Bar (über der Hotbar) einen Text
      // Das gibt visuelles Feedback, dass das Halten erkannt wird
      event.source?.onScreenDisplay.setActionBar("§6Aufladen...§r");
    },

    // onCompleteUse() wird aufgerufen, wenn der Spieler die Taste LOSLÄSST
    // event.useDuration = Wie lange wurde die Taste gedrückt? (in Sekunden)
    onCompleteUse(event) {
      // Hole den Spieler, der die Taste losgelassen hat
      const player = event.source;

      // Sicherheitscheck: Existiert der Spieler noch? (könnte disconnectet sein)
      if (!player) {
        return;
      }

      // Zeige, wie lange der Spieler die Taste gedrückt hat
      // .toFixed(2) = runde auf 2 Dezimalstellen (z.B. 1.23 statt 1.2345678)
      player.onScreenDisplay.setActionBar(
        `§6Losgelassen nach ${event.useDuration.toFixed(2)}s§r`
      );

      // WICHTIG: War die Aufladezeit zu kurz?
      // Wenn weniger als 0.5 Sekunden: Mache nichts (kein Feuerball)
      // Das verhindert Versehentliche Schüsse bei schnellen Klicks
      if (event.useDuration < LONG_PRESS_THRESHOLD_SECONDS) {
        return; // Abbruch - zu kurz gehalten
      }

      // JA! Lange genug gehalten → Schießen!
      // Rufe die shootFireball() Funktion auf (siehe unten)
      shootFireball(player);
    },
  });
});

// ============================================================================
// 4. FEUERBALL SCHIESSER - Die Magie passiert hier!
// ============================================================================
/**
 * Diese Funktion spawnt einen Feuerball und schießt ihn in die Blickrichtung
 * des Spielers. Das ist echte Minecraft-Physik!
 *
 * @param {Player} player - Der Spieler, der den Zauberstab benutzt
 */
function shootFireball(player) {
  // Hole die aktuelle Dimension (Oberwelt, Nether, Ende)
  // Wir brauchen das, um den Feuerball dort zu spawnen
  const dimension = player.dimension;

  // getViewDirection() = Ein Vektor (x, y, z), der anzeigt, wohin der Spieler schaut
  // Werte zwischen -1 und 1 pro Achse
  // Beispiel: Schaut nach rechts vorne oben = { x: 0.7, y: 0.3, z: 0.7 }
  const viewDirection = player.getViewDirection();

  // getHeadLocation() = Die Position der Augenhöhe des Spielers
  // Das ist höher als player.location (die Füße)
  const headLocation = player.getHeadLocation();

  // Berechne den Punkt, wo der Feuerball spawned
  // Wir multiplizieren die Blickrichtung mit FIREBALL_LAUNCH_DISTANCE (1.5 Blöcke)
  // Das platziert den Feuerball vor dem Spieler, nicht IN ihm
  const spawnLocation = {
    x: headLocation.x + viewDirection.x * FIREBALL_LAUNCH_DISTANCE,
    y: headLocation.y + viewDirection.y * FIREBALL_LAUNCH_DISTANCE,
    z: headLocation.z + viewDirection.z * FIREBALL_LAUNCH_DISTANCE,
  };

  // Spawne EINEN Feuerball an der berechneten Position
  // "minecraft:fireball" = Das ist die echte Minecraft Feuerball-Entität
  // (Das Gleiche, das Blazes schießen!)
  const fireball = dimension.spawnEntity("minecraft:fireball", spawnLocation);

  // WICHTIG: Der Feuerball muss "gepusht" werden, um zu fliegen
  // Andernfalls würde er einfach herunter fallen

  // Hole die Projektil-Komponente des Feuerballs
  // Jeder Feuerball hat diese Komponente - sie kontrolliert das Flug-Verhalten
  const projectileComponent = fireball.getComponent("minecraft:projectile");

  // Sicherheitscheck: Hat der Feuerball eine Projektil-Komponente?
  // (sollte normalerweise immer der Fall sein)
  if (projectileComponent) {
    // Setze den Besitzer des Feuerballs auf den Spieler
    // Das verhindert, dass der Spieler sich selbst schadet
    // und markiert den Feuerball als "gehört zu diesem Spieler"
    projectileComponent.owner = player;

    // Schieße den Feuerball in die Blickrichtung
    // Die shoot() Methode nimmt den Richtungsvektor und verschießt ihn
    projectileComponent.shoot(viewDirection);
  }

  // AUDIO-FEEDBACK: Spiele einen Sound, damit der Spieler weiß, dass es funktioniert!
  // "mob.ghast.fireball" = Der Sound, den ein Ghast beim Schießen macht
  // (Perfekt für unseren Feuerball!)
  // player.location = Spiele den Sound an der Position des Spielers
  dimension.playSound("mob.ghast.fireball", player.location);
}
