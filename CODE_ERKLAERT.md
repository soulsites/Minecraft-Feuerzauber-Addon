# Der gesamte Code erklärt

Diese Datei ist die kommentierte Landkarte des Projekts. JavaScript erlaubt
Kommentare direkt im Code; JSON und `.lang` tun das nicht. Kommentare in einer
JSON-Datei würden das Pack ungültig machen. Deshalb werden diese Dateien hier
Feld für Feld erklärt.

## Was beim Spielen passiert

1. Minecraft aktiviert das Behavior Pack (`BP`) und das Resource Pack (`RP`).
2. `BP/manifest.json` lädt `BP/scripts/main.js` und verbindet das Resource Pack.
3. Beim Start registriert das Script die Item-Komponente
   `feuerzauber:blaze_rod_fireball`.
4. `/give @s feuerzauber:blaze_rod` erzeugt das eigene Item aus
   `BP/items/blaze_rod.json`.
5. Beim Gedrückthalten zählt Minecraft die in `minecraft:use_modifiers`
   festgelegten fünf Sekunden rückwärts.
6. `itemStopUse` meldet beim Loslassen die verbleibenden Ticks. Das Script
   berechnet daraus die gehaltene Zeit.
7. Ab zehn gehaltenen Ticks (0,5 Sekunden) erzeugt `shootFireball` einen
   `minecraft:small_fireball` und gibt ihm Blickrichtung, Geschwindigkeit und
   Spieler als Besitzer.

## `BP/manifest.json` – Behavior Pack anmelden

- `format_version: 2`: Version des Manifest-Dateiformats, nicht die Spielversion.
- `header`: Metadaten, die Minecraft in der Pack-Liste anzeigt.
- `name` und `description`: sichtbarer Packname und Beschreibung.
- `uuid`: weltweit eindeutige ID des gesamten Behavior Packs. Sie darf nicht
  dieselbe sein wie eine Modul- oder Resource-Pack-UUID.
- `version: [1, 0, 1]`: eigene Packversion als `Major.Minor.Patch`. Der Patch
  wurde für den Feuerball-Fix erhöht, damit Minecraft das neue Paket beim
  Import von Version 1.0.0 unterscheiden kann.
- `min_engine_version`: älteste unterstützte Bedrock-Version.
- Erstes Element in `modules`: Das Modul vom Typ `data` lädt Item- und andere
  Behavior-Dateien.
- Zweites Element in `modules`: Das JavaScript-Modul startet bei
  `scripts/main.js`.
- Erste `dependency`: Das Script verwendet die Mojang-API
  `@minecraft/server` in Version `1.13.0`.
- Zweite `dependency`: Die UUID verweist auf `RP/manifest.json`; dadurch weiß
  Minecraft, welches Resource Pack zu diesem Behavior Pack gehört.

## `BP/items/blaze_rod.json` – das eigene Item

- `format_version`: Syntaxversion für diese Itemdefinition.
- `minecraft:item`: Wurzelobjekt einer Bedrock-Itemdefinition.
- `description.identifier`: Eindeutiger Name. Der Namespace `feuerzauber`
  verhindert eine Kollision mit Mojangs `minecraft:blaze_rod`.
- `menu_category`: Ordnet das Item im Kreativinventar unter Ausrüstung/Schwerter ein.
- `minecraft:max_stack_size: 1`: Es ist nur eine Rute pro Inventarplatz erlaubt.
- `minecraft:hand_equipped: true`: Darstellung wie ein Werkzeug statt wie ein
  flaches Item.
- `minecraft:icon: "blaze_rod"`: Verwendet die vorhandene Vanilla-Textur.
- `minecraft:interact_button`: Zeigt auf Touch-Geräten eine benannte
  Interaktionsschaltfläche.
- `minecraft:use_modifiers.use_duration: 5`: Aufladen dauert maximal fünf Sekunden.
- `movement_modifier: 0.35`: Währenddessen läuft der Spieler mit 35 Prozent Tempo.
- `minecraft:use_animation: "bow"`: Zeigt beim Halten die Bogen-Animation.
- `minecraft:custom_components`: Verbindet das JSON-Item mit der beim Start in
  JavaScript registrierten Komponente.

Wichtig: Das ist absichtlich **nicht** `minecraft:blaze_rod`. Vanilla-Items
können durch ein Behavior Pack nicht einfach um eigene Komponenten erweitert
werden. Deshalb funktioniert nur `/give @s feuerzauber:blaze_rod`.

## `BP/scripts/main.js` – die Spiellogik

Die Datei enthält ausführliche Kommentare direkt neben jedem Schritt. Die drei
wichtigsten API-Ideen sind:

- Events: `subscribe` registriert eine Funktion, die Minecraft später bei einem
  Ereignis aufruft.
- Vektoren: Position und Blickrichtung bestehen aus `x`, `y` und `z`.
- Komponenten: Eine Entity hat einzelne Fähigkeiten. Nur ihre
  `minecraft:projectile`-Komponente besitzt die Methode `shoot`.

Der ursprüngliche Fehler steckte in `onCompleteUse`: Dieses Event bedeutet
„die komplette Nutzungsdauer ist abgelaufen“, nicht „die Taste wurde
losgelassen“. Nun verarbeitet `itemStopUse` beide Arten, wie eine Nutzung endet.

## `RP/manifest.json` – Resource Pack anmelden

- Der `header` funktioniert wie im Behavior Pack, besitzt aber eine eigene UUID.
- Das einzige Modul hat den Typ `resources`, weil es Texte und später auch
  Texturen, Sounds oder Modelle bereitstellen kann.
- Seine Header-UUID ist dieselbe, auf die die Dependency im Behavior Pack zeigt.

## `RP/texts/*.lang` und `languages.json` – Übersetzung

- `languages.json` aktiviert Englisch (`en_US`) und Deutsch (`de_DE`).
- Der Schlüssel `item.feuerzauber:blaze_rod` wird automatisch aus der Item-ID
  abgeleitet.
- Der Text rechts vom Gleichheitszeichen ist der sichtbare Name im Spiel.
- Zeilen mit `##` sind Kommentare im `.lang`-Format.

## `package.json` – Node.js-Werkzeuge

- `name`, `version`, `description`: Metadaten für das lokale Node-Projekt.
- `private: true`: Verhindert versehentliches Veröffentlichen auf npm.
- `type: "module"`: Aktiviert `import`/`export` statt CommonJS-`require`.
- `scripts.deploy`: `npm run deploy` führt `scripts/deploy.js` aus.
- `scripts.package`: `npm run package` führt `scripts/package.js` aus.

Diese Node-Scripts laufen nur auf dem Entwicklungsrechner. Minecraft selbst
führt ausschließlich `BP/scripts/main.js` aus.

## `scripts/deploy.js` – lokal installieren

Die Kommentare stehen direkt im Script. Kurz gesagt ermittelt es je nach
Betriebssystem den `com.mojang`-Ordner, löscht dort den vorherigen Teststand und
kopiert BP/RP in die beiden Development-Pack-Ordner.

## `scripts/package.js` – Handy-Pakete bauen

Auch diese Datei ist direkt kommentiert. Sie leert `dist`, erzeugt je ein
`.mcpack` mit `manifest.json` im Archiv-Root und kombiniert anschließend BP und
RP in einem `.mcaddon`. Minecraft-Paketdateien sind technisch ZIP-Archive mit
einer vorgeschriebenen Ordnerstruktur.

## `README.md`

Die README ist keine ausgeführte Programmlogik. Sie erklärt Installation,
Testbefehle, Fehlersuche und Paketierung für Menschen.
