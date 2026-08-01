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
`scripts/main.js`, wie lange das Item gehalten wurde (`onCompleteUse`), und
verschießt bei ausreichender Dauer eine `minecraft:fireball`-Entität in
Blickrichtung des Spielers.

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
