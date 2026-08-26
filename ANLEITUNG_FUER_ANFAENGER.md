# 🎮 Minecraft Addon Programmieren - Dein erster Zauberstab!
## Anfänger-Anleitung für den Feuerzauber Addon

---

## 🎯 Was machst du hier?

Du lernst, wie man **Minecraft Addons programmiert**! 

Dieses Projekt zeigt dir Schritt-für-Schritt, wie man:
- Ein neues **Item** (Blaze Rod) erschafft
- Das Item **reagiert auf Klicks** des Spielers
- Ein **Feuerball fliegt** wenn man lange drückt
- Alles zusammen in einer Welt funktioniert

### Was ist ein Addon?

Ein Addon ist wie ein **Plugin** oder eine **Mod** für Minecraft. Es ändert das Spiel, ohne den Original-Code zu zerstören.

**Beispiele für Addons:**
- Neue Items (wie unser Zauberstab)
- Neue Blöcke
- Neue Tiere
- Neue Regeln (z.B. andere Schwerkraft)

---

## 📁 Die Struktur verstehen

Jedes Minecraft Addon hat diese Ordnerstruktur:

```
Minecraft-Feuerzauber-Addon/
├── BP/                          ← BEHAVIOR PACK (Verhalten)
│   ├── manifest.json            ← Anleitung für Minecraft (WICHTIG!)
│   ├── items/
│   │   └── blaze_rod.json       ← Definition des Zauberstabs
│   └── scripts/
│       └── main.js              ← Die Logik (JavaScript Code)
│
├── RP/                          ← RESOURCE PACK (Grafik)
│   ├── manifest.json            ← Anleitung für die Grafik
│   └── texts/
│       ├── en_US.lang           ← Englische Texte
│       └── de_DE.lang           ← Deutsche Texte
│
└── README.md                    ← Dokumentation
```

### Was ist BP und RP?

| BP (Behavior Pack) | RP (Resource Pack) |
|---|---|
| Das **"Gehirn"** | Das **"Aussehen"** |
| Definiert: "Was passiert?" | Definiert: "Wie sieht es aus?" |
| JSON + JavaScript | Texturen + Sprachen |
| Items, Blöcke, Logik | Grafiken, Sounds, Namen |
| Minecraft braucht es für die Regeln | Minecraft braucht es zum Anzeigen |

**Wichtig:** Du brauchst IMMER beide! Eins ohne das andere funktioniert nicht.

---

## 🔧 So funktioniert der Zauberstab

### 1️⃣ **Die Item-Definition** (`BP/items/blaze_rod.json`)

```json
"identifier": "feuerzauber:blaze_rod"
```

Das ist der **interne Name** des Items. Format: `namespace:itemname`
- `feuerzauber` = Dein Addon (der Namespace)
- `blaze_rod` = Der Name des Items

```json
"minecraft:max_stack_size": 1
```

Der Zauberstab kann nur **1x** in einem Slot sein (nicht wie Sand, der bis 64 geht).

```json
"minecraft:use_animation": "bow"
```

Der Spieler sieht die **Bogen-Animation** wenn er drückt (genau wie mit einem Bogen).

```json
"minecraft:custom_components": ["feuerzauber:blaze_rod_fireball"]
```

**DIESE ZEILE IST WICHTIG!** Sie verbindet das Item mit dem JavaScript-Code:

```
JSON-Datei ← →  JavaScript-Code
  (blaze_rod.json)   (main.js)
  "feuerzauber:blaze_rod_fireball"
```

Wenn die Namen nicht passen → **Kein Feuerball!** 💥

### 2️⃣ **Die Logik** (`BP/scripts/main.js`)

Das ist **JavaScript** - eine Programmiersprache, die im Browser und in Minecraft läuft!

**Schritt 1: Das Custom Component registrieren**

```javascript
itemComponentRegistry.registerCustomComponent("feuerzauber:blaze_rod_fireball", {
  // Sag Minecraft: "Hey, es gibt jetzt ein neues Item-Verhalten!"
});
```

**Schritt 2: Was passiert, wenn man DRÜCKT?**

```javascript
onUse(event) {
  event.source?.onScreenDisplay.setActionBar("§6Aufladen...§r");
  // Zeige "Aufladen..." an
}
```

**Schritt 3: Was passiert, wenn man LOSLÄSST?**

```javascript
onCompleteUse(event) {
  const player = event.source;  // Wer hat losgelassen?
  
  if (event.useDuration < 0.5) {
    return; // Zu kurz! Mache nichts
  }
  
  shootFireball(player); // Feuere ab!
}
```

**Schritt 4: Der Feuerball fliegt los!**

```javascript
function shootFireball(player) {
  const viewDirection = player.getViewDirection();
  const spawnLocation = {
    x: headLocation.x + viewDirection.x * 1.5,
    y: headLocation.y + viewDirection.y * 1.5,
    z: headLocation.z + viewDirection.z * 1.5,
  };
  
  const fireball = dimension.spawnEntity("minecraft:fireball", spawnLocation);
  // Spawne einen Feuerball (genau wie von einer Blaze!)
  
  projectileComponent.shoot(viewDirection);
  // "FLIEGEN! Fliegen!" - der Feuerball fliegt los
}
```

### 3️⃣ **Die Übersetzungen** (`RP/texts/de_DE.lang` und `en_US.lang`)

```
item.feuerzauber:blaze_rod=Blaze-Rute
```

Das ist die **Übersetzung**:
- Der Code kennt nur: `item.feuerzauber:blaze_rod`
- Der Spieler sieht: `Blaze-Rute` (auf Deutsch)

Im Spiel wird dem Spieler also nicht "item.feuerzauber:blaze_rod" angezeigt, sondern "Blaze-Rute".

Wenn du die Sprache auf Englisch stellst, schaut Minecraft in `en_US.lang` und zeigt "Blaze Rod".

---

## 🚀 So testest du das Addon

### ✅ Was brauchst du?

1. **Minecraft: Bedrock Edition** (Windows 10/11, iPad, iPhone, Nintendo Switch, Android)
   - **NICHT Java Edition!** (Das ist eine andere Version mit anderen Addons)
   - **Empfohlen:** Die Preview/Beta Version (hat die neueste Script API)

2. **"Beta APIs" Experiment aktiviert**
   - Beim Erstellen einer Welt unter "Experimente" findest du das

3. **Beide Packs aktiviert:**
   - Behavior Pack (BP) ✅
   - Resource Pack (RP) ✅

### 🎮 Im Spiel testen

```
1. Neue Welt erstellen
   - Experimente: "Beta APIs" anmachen ✅
   
2. Behavior Pack "Feuerzauber Addon" aktivieren
   
3. Resource Pack "Feuerzauber Addon" aktivieren
   
4. Chat-Befehle ausführen:
   /give @s feuerzauber:blaze_rod
   
5. Item in die Hand nehmen
   
6. DRÜCKEN und HALTEN (mind. 0.5 Sekunden)
   
7. LOSLASSEN → FEUERBALL! 💥
```

### 🐛 Es funktioniert nicht? Debugging-Tipps

#### Problem 1: "Addon geladen." Nachricht kommt nicht im Chat

**Ursache:** Beta APIs nicht aktiviert oder Packs nicht hinzugefügt

**Lösung:**
- Welt löschen und neu erstellen
- Beta APIs aktivieren ✅
- Beide Packs aktivieren ✅

#### Problem 2: Addon geladen, aber kein Feuerball

**Debug mit Stock:**
```
/give @s stick
```
- Klicke mit dem Stock → Blitz erscheint?
  - JA = Script API funktioniert, aber Custom Component hat Problem
  - NEIN = Script API funktioniert nicht (Beta APIs?)

**Häufige Fehler:**
- Item-Name falsch getippt: `/give @s feuerzauber:blaze_rod` (NICHT `blaze-rod`!)
- `manifest.json` UUIDs passen nicht zusammen
- Custom Component Name stimmt nicht überein

---

## 📚 Wichtige Konzepte erklärt

### Was ist ein "Namespace"?

Ein Namespace ist wie ein **Familienname** für deine Items.

```
feuerzauber:blaze_rod
↑          ↑
Familie    Name
```

Das verhindert Konflikte:
- Dein Addon: `feuerzauber:blaze_rod`
- Anderes Addon: `magisch:blaze_rod`

Die sehen gleich aus, sind aber unterschiedliche Items!

### Was ist eine UUID?

Eine **UUID** ist eine eindeutige Nummer, die kein anderes Addon hat.

```
UUID = Universal Unique Identifier
```

Es ist wie eine **Seriennummer** für dein Addon.

```
Addon 1: c4515a08-8706-46d3-bcc0-98bfd97ff9a3
Addon 2: 3200d6f1-d6b2-46b1-beac-0dfd28a972d2
(Jede ist unterschiedlich!)
```

**Wichtig:** BP und RP des GLEICHEN Addons teilen UUIDs:
- BP manifest.json uuid: `c4515a08-8706-46d3-bcc0-98bfd97ff9a3`
- BP dependencies → RP uuid: `3200d6f1-d6b2-46b1-beac-0dfd28a972d2`
- RP manifest.json uuid: `3200d6f1-d6b2-46b1-beac-0dfd28a972d2` ← MUSS GLEICH SEIN!

### Vektoren und Richtungen

```javascript
const viewDirection = player.getViewDirection();
// viewDirection = {x: 0.7, y: 0.3, z: -0.4}
```

Das ist eine **Richtung** im 3D-Raum:
- `x` = Links/Rechts (1.0 = nach rechts, -1.0 = nach links)
- `y` = Oben/Unten (1.0 = oben, -1.0 = unten)
- `z` = Vorne/Hinten (1.0 = vorne, -1.0 = hinten)

Wenn der Spieler nach oben rechts schaut:
```
{x: 0.7, y: 0.8, z: 0.1}
```

Multiplizieren mit 1.5 verschiebt den Feuerball 1.5 Blöcke in diese Richtung:
```javascript
spawnLocation.x = headLocation.x + viewDirection.x * 1.5
// 1.5 Blöcke nach rechts vom Kopf
```

---

## 🎓 Lern-Tipps für dein Sohn

### 1. **Lese den Code langsam**

Nicht "alles verstehen", sondern:
1. Erste Zeilen lesen
2. Google, wenn du nicht weißt, was es heißt
3. Nachdenken: "Was passiert hier?"
4. Nächste Zeilen

### 2. **Experimentiere!**

```javascript
// Original:
const LONG_PRESS_THRESHOLD_SECONDS = 0.5;

// Versuch:
const LONG_PRESS_THRESHOLD_SECONDS = 0.1;  // Schneller schießen!
const LONG_PRESS_THRESHOLD_SECONDS = 2.0;  // Länger laden!
```

Ändern, speichern, testen, lernen!

### 3. **Lerne die API**

Die Minecraft Script API hat viele Funktionen:

```javascript
player.getViewDirection()    // Wohin schaut der Spieler?
player.getHeadLocation()     // Wo ist sein Kopf?
player.dimension             // In welcher Dimension?
player.onScreenDisplay       // Was anzeigen?
```

Zu jeder Funktion gibt es Dokumentation: [Learn about the Script API](https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingtutorial)

### 4. **Fehler sind OK!**

Wenn etwas nicht funktioniert:
- Das ist NORMAL
- Alle Programmierer haben Fehler
- Schreib den Fehler auf und Google ihn
- Versuche eine andere Lösung

---

## 🚀 Nächste Schritte - Ideen zum Erweitern

Wenn du das Addon verstanden hast, versuch diese Erweiterungen:

### 1. **Schnellere/Langsamere Feuerball-Geschwindigkeit**

```javascript
// In main.js, in shootFireball():
projectileComponent.shoot(viewDirection);
// Jetzt wird es schneller:
// projectileComponent.shoot({
//   x: viewDirection.x * 2,
//   y: viewDirection.y * 2,
//   z: viewDirection.z * 2
// });
```

### 2. **Cooldown - Kann man nur alle 3 Sekunden schießen?**

```javascript
let lastFireballTime = 0;

onCompleteUse(event) {
  const now = Date.now();
  if (now - lastFireballTime < 3000) { // 3000ms = 3 Sekunden
    return; // Zu schnell!
  }
  lastFireballTime = now;
  shootFireball(player);
}
```

### 3. **Anderes Item - Ein Eisspeiger?**

Kopiere `blaze_rod.json` zu `ice_wand.json`, ändere:

```json
"identifier": "feuerzauber:ice_wand",
```

In `main.js`:

```javascript
registerCustomComponent("feuerzauber:ice_wand", {
  // Spawn "minecraft:snowball" statt "minecraft:fireball"
});
```

### 4. **Licht-Effekt beim Laden**

```javascript
onUse(event) {
  const player = event.source;
  // Leuchtpartikeln um den Spieler
  player.dimension.spawnParticle("minecraft:sparkler", player.location);
}
```

### 5. **Geräusch beim Laden**

```javascript
onUse(event) {
  event.source?.dimension.playSound("block.trial_spawner.charge", 
    event.source.location);
}
```

---

## 🎮 Echtens Problem-Solving Beispiel

### Szenario: "Mein Feuerball fliegt nicht!"

**Schritt 1: Überprüfen, ob das Addon laden**
```
/give @s stick
Klick → Blitz?
```

- ✅ Blitz erscheint → Addon lädt, Problem mit Custom Component
- ❌ Kein Blitz → Addon lädt nicht

**Schritt 2: Wenn Addon lädt, aber kein Feuerball**

Öffne die Dateien und überprüfe:
- [ ] `BP/items/blaze_rod.json` Line 21: `"feuerzauber:blaze_rod_fireball"` ist korrekt?
- [ ] `BP/scripts/main.js` Line 31: Component-Name passt?
- [ ] `BP/manifest.json` Line 21: Dependencies enthalten RP UUID?
- [ ] `RP/manifest.json` Line 10: UUID gleich wie in BP dependencies?

**Schritt 3: Teste mit Console/Chat**

```
/give @s feuerzauber:blaze_rod
```

Siehst du das Item? (Es sollte aussehen wie eine Blaze Rod)

- ✅ Ja → Item funktioniert, aber Feuerball-Verhalten nicht
- ❌ Nein → Item existiert nicht (Namespace-Problem?)

**Schritt 4: Debugging-Ausgabe hinzufügen**

```javascript
onCompleteUse(event) {
  const player = event.source;
  
  // DEBUG: Schreib in den Chat
  world.sendMessage(`DEBUG: useDuration=${event.useDuration}`);
  
  if (event.useDuration < 0.5) {
    world.sendMessage("DEBUG: Zu kurz gehalten!");
    return;
  }
  
  world.sendMessage("DEBUG: Schießen!");
  shootFireball(player);
}
```

Jetzt siehst du, welcher Code-Teil funktioniert und welcher nicht!

---

## 📖 Wichtige Dateien erklärt

### `package.json`

```json
{
  "name": "minecraft-feuerzauber-addon",
  "version": "1.0.0",
  "scripts": {
    "deploy": "node scripts/deploy.js",
    "package": "node scripts/package.js"
  }
}
```

Das ist die **Projektbeschreibung**:
- `name` = Name deines Projekts
- `version` = Welche Version? (1.0.0 = Version 1.0)
- `scripts` = Befehle, die du mit `npm run` ausführen kannst

```bash
npm run deploy   # Copiert BP/ und RP/ auf deinen Computer
npm run package  # Packt alles für Handy (.mcaddon)
```

### `manifest.json` (Das Wichtigste!)

```json
{
  "format_version": 2,
  "header": { /* Addon Info */ },
  "modules": [ /* Was ist da drin? */ ],
  "dependencies": [ /* Was braucht es? */ ]
}
```

**Das ist wie eine Checkliste für Minecraft:**

Wenn Minecraft dein Addon lädt:
1. ✅ Format erkannt? (`format_version: 2`)
2. ✅ Addon-Name OK? (`header.name`)
3. ✅ Module vorhanden? (`modules`)
4. ✅ Alle Dependencies verfügbar? (`dependencies`)

Wenn EINE Sache nicht passt → **Addon lädt nicht!**

---

## 🎯 Checkliste - So überprüfst du alles

- [ ] Ich habe Minecraft Bedrock Edition
- [ ] Ich habe Beta APIs in der Welt aktiviert
- [ ] Ich habe Behavior Pack hinzugefügt
- [ ] Ich habe Resource Pack hinzugefügt
- [ ] Ich kann `/give @s stick` tippen und Blitz erscheint
- [ ] Ich kann `/give @s feuerzauber:blaze_rod` tippen
- [ ] Ich halte die Rod und die Actionbar zeigt "Aufladen..."
- [ ] Nach 0.5 Sekunden loslassen → Feuerball! 🎉

Wenn alle Punkte ✅ sind → **Das Addon funktioniert!**

---

## 🔗 Nützliche Links

- [Minecraft Script API Dokumentation](https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingtutorial)
- [Minecraft Addon Tutorial (Offiziell)](https://learn.microsoft.com/en-us/minecraft/creator/documents/introduction-to-the-minecraft-creator-portal)
- [JSON Erklärt](https://www.json.org/json-de.html)
- [JavaScript Anfänger](https://www.w3schools.com/js/)

---

## 🤔 Häufig gestellte Fragen

**F: Kann ich Java Edition Addons machen?**
A: Nein, das ist eine andere Version. Java Edition braucht "Mods" mit Forge/Fabric, nicht Addons.

**F: Wie viel Speicher verbraucht das Addon?**
A: Sehr wenig! Ein paar KB. Addons sind klein.

**F: Kann ich das Addon auf dem Server spielen?**
A: Ja! Wenn du einen Minecraft Realm oder Server mit Bedrock Edition hast, kannst du das Addon dort aktivieren.

**F: Kann ich das Addon auf dem Handy testen?**
A: Ja! Mit `npm run package` wird eine `.mcaddon` Datei erstellt. Diese kannst du aufs Handy übertragen und öffnen.

**F: Ich will ein neues Item! Wie geht das?**
A: Kopiere `BP/items/blaze_rod.json`, ändere die `identifier` und schreibe neue Logik in `main.js`.

---

## 🎉 Gratuliert!

Du weißt jetzt, wie Minecraft Addons funktionieren! 🎮

Der nächste Schritt: **Experimentieren und erweitern!**

Viel Spaß beim Programmieren! 🚀
