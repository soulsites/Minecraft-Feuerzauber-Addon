# Minecraft Feuerzauber Addon

Ein Minecraft: Bedrock Edition Add-On, gebaut auf dem offiziellen Mojang
Add-On-Grundgerüst (Behavior Pack + Resource Pack + Script API).

## Projektstruktur

```
BP/                     Behavior Pack
  manifest.json
  items/blaze_rod.json  Item-Definition (Blaze Rod + Custom Component)
  scripts/main.js        Script-API Logik
RP/                     Resource Pack
  manifest.json
  texts/                 Übersetzungen (en_US, de_DE)
```

## Erstes Feature: Feuerball mit der Blaze Rod

Hält man die Blaze Rod in der Hand und klickt/tippt **länger** (mind. 0.5
Sekunden gehalten, danach loslassen), wird ein Feuerball in Blickrichtung
verschossen – genau wie bei einer Blaze. Ein kurzer Klick löst keinen
Feuerball aus.

Technisch wird das Item über eine `minecraft:custom_components`-Komponente
mit `minecraft:use_modifiers` (Aufladedauer) verknüpft. Beim Loslassen prüft
`scripts/main.js`, wie lange das Item gehalten wurde (`itemStopUse`), und
verschießt bei ausreichender Dauer eine `minecraft:small_fireball`-Entität in
Blickrichtung des Spielers – denselben Projektiltyp verwendet auch eine Blaze.

Eine kommentierte Führung durch **alle** Projektdateien steht in
[`CODE_ERKLAERT.md`](CODE_ERKLAERT.md). Die JavaScript-Dateien sind zusätzlich
direkt im Quellcode ausführlich kommentiert. JSON erlaubt keine Kommentare und
wird deshalb in der Begleitdatei Feld für Feld erklärt.

**Wichtig:** Das ist eine **eigene, custom Blaze Rod** (`feuerzauber:blaze_rod`)
– Bedrock erlaubt es nicht, Verhalten an das echte Vanilla-Item
(`minecraft:blaze_rod`) zu hängen. Sie sieht identisch aus und heißt auch
"Blaze Rod", muss aber per Befehl geholt werden (siehe unten) – eine
Blaze Rod, die man von einer Blaze erbeutet hat, funktioniert **nicht**.

## Testbefehle (im Spiel-Chat)

```
/give @s feuerzauber:blaze_rod   -> Feuerball-Zauberstab
/give @s stick                   -> einfacher Blitz-Test (siehe unten)
```

## Einfacher Test-Effekt zur Diagnose

Da der Feuerball-Effekt mehrere bewegliche Teile hat (Custom Item,
Aufladedauer, Projektil), gibt es zwei einfachere eingebaute Tests in
`scripts/main.js`, um Schritt für Schritt einzugrenzen, wo es hakt:

1. **Lädt das Script überhaupt?** Direkt nach dem Betreten der Welt
   erscheint im Chat `[Feuerzauber] Addon geladen.`. Kommt diese Nachricht
   nicht, wird das Script gar nicht ausgeführt (siehe Troubleshooting).
2. **Funktioniert ein einfacher Klick-Effekt?** Mit einem normalen
   `minecraft:stick` (Vanilla-Item, kein Custom-Component nötig) einmal
   kurz klicken/tippen löst sofort einen Blitzeinschlag aus + Chat-Nachricht.
   Das testet die Script-API unabhängig vom Custom Item / der
   Aufladelogik.

Beim Zauberstab selbst zeigt die Actionbar jetzt außerdem "Aufladen..."
während des Haltens und "Losgelassen nach X s" beim Loslassen – so sieht
man live, ob der Klick überhaupt registriert wird und wie lange gehalten
wurde, auch ohne dass am Ende ein Feuerball fliegt.

## Troubleshooting: "Es passiert nichts"

1. **Script-/Experiment-Einstellungen prüfen.** Bei älteren Bedrock-Versionen
   muss beim Welt-Erstellen unter "Experimente" unter Umständen "Beta APIs"
   aktiviert sein. Die verwendete API-Version `1.13.0` selbst gehört zum
   stabilen Track; je nach Minecraft-Version und Plattform können Custom Items
   trotzdem zusätzliche Creator-Schalter benötigen.
2. **Beide Packs aktiviert?** Behavior *und* Resource Pack müssen in den
   Welteinstellungen aktiviert sein, nicht nur eines.
3. **Falsches Item.** Siehe oben – die echte/erbeutete Blaze Rod hat
   keine Wirkung, nur die per `/give feuerzauber:blaze_rod` erzeugte.
4. Erscheint schon `[Feuerzauber] Addon geladen.` nicht im Chat, liegt es
   an 1./2. Erscheint sie, aber der Stick-Blitz-Test tut nichts, bitte
   melden – dann liegt evtl. ein API-Versionsproblem vor
   (`BP/manifest.json` → `@minecraft/server`-Version ggf. an die
   installierte Minecraft-Version anpassen).

## Lokal testen (Desktop)

1. Minecraft: Bedrock Edition (Preview empfohlen für aktuelle Script-API)
   installieren.
2. `npm run deploy` ausführen, um `BP/` und `RP/` in die lokalen
   `com.mojang`-Entwicklungsordner zu kopieren (Pfad ggf. in
   `scripts/deploy.js` anpassen).
3. In Minecraft eine Welt mit aktivierten Behavior/Resource Packs sowie
   "Beta APIs" (Experimental Features) erstellen.
4. Blaze Rod in die Hand nehmen, Rechtsklick/Touch gedrückt halten und
   wieder loslassen.

## Auf dem Smartphone testen (.mcpack / .mcaddon)

`npm run package` ausführen (benötigt `zip` unter macOS/Linux bzw.
PowerShell unter Windows). Das erzeugt in `dist/`:

- `FeuerzauberAddon.mcaddon` – enthält BP **und** RP, zum direkten Import
  (empfohlen).
- `FeuerzauberAddon_BP.mcpack` / `FeuerzauberAddon_RP.mcpack` – die Packs
  einzeln, falls `.mcaddon` mal nicht funktioniert.

Datei(en) aufs Handy übertragen (z. B. per Cloud-Speicher/AirDrop/USB) und
mit "Öffnen in Minecraft" importieren. Danach im Welt-Editor unter
Behavior-/Resource-Packs aktivieren und "Beta APIs" einschalten.

**"Import fehlgeschlagen"?** Das passiert, wenn das ganze Repo (inkl.
`README.md`, `package.json` usw.) direkt in eine Zip gepackt und in
`.mcpack` umbenannt wird. Minecraft erwartet pro `.mcpack` genau ein Pack
mit `manifest.json` direkt im Zip-Root – kein Repo-Ordner drumherum und
nicht BP+RP gemischt. `npm run package` baut die Dateien deshalb korrekt
strukturiert.

## Nächste Schritte

- Cooldown zwischen Schüssen
- Partikel-/Sound-Feedback während des Aufladens
- Eigene Texturen/Modelle statt Wiederverwendung der Vanilla-Blaze-Rod
