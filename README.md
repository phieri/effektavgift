# effektavgift

En webbapplikation som visar om det är höglast eller låglast för effektavgift hos olika elnätsbolag i Sverige.

## Om Effektavgift

Kravet på att alla elnätsbolag ska införa effektavgifter stoppades 2026. Enskilda elnätsbolag kan fortfarande ha egna effektavgifter och bestämmer själva villkoren och tiderna. Regeringen har gett Energimarknadsinspektionen i uppdrag att ta fram ett förslag till en ny utformning. [Läs regeringens besked](https://www.regeringen.se/pressmeddelanden/2026/03/krav-pa-inforande-av-effektavgifter-stoppas/).

Appen visar höglast- och låglasttider enligt de uppgifter som finns för respektive elnätsbolag i appen. Uppgifterna kan vara inaktuella och är inte en beräkning av din kostnad. Kontrollera alltid ditt elnätsbolags aktuella villkor.

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
