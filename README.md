# effektavgift

En webbapplikation som visar om det är höglast eller låglast för effektavgift hos olika elnätsbolag i Sverige.

## Om Effektavgift

Den nya modellen för elnätsdebitering är en effektavgift som tas ut under "höglasttider". Dessa tider skiljer sig något mellan olika bolag men är vanligt helgfria vardagar kl. 07–21 under vintersäsongen november till mars. Övrig tid, det vill säga på nätter, helger, röda dagar och sommarhalvåret, betalar kunden ingen effektavgift.

## Funktioner

- **Fullskärmsläge**: Visar tydligt om det är höglast eller låglast
- **Flera nätbolag**: Välj ditt elnätsbolag från en lista
- **Automatisk uppdatering**: Statusen uppdateras automatiskt
- **Svenska helgdagar**: Tar hänsyn till röda dagar och helger

## Utveckling

```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Förhandsgranska produktionsbygget
npm run preview
```

## Deployment

Applikationen deployeras automatiskt till GitHub Pages när ändringar pushas till `main`-branchen.

## Teknik

- TypeScript
- Vite
- Vanilla JavaScript (ingen ramverk)
- CSS3

## Licens

ISC
