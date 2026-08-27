# Copilot Instructions for effektavgift

## Repository Summary

**effektavgift** is a Swedish web application that shows whether the current period is a high-load or low-load window for electricity grid demand charges (effektavgift) across several Swedish power grid companies. The app helps users avoid unnecessary demand peaks during expensive periods.

### High-Level Details
- **Type**: Single Page Application (SPA) for modern browsers
- **Size**: Small codebase; focused on a handful of source files and generated static pages
- **Languages**: TypeScript (strict mode), CSS3, HTML5
- **Framework**: Vanilla TypeScript; no framework such as React, Vue, or Svelte
- **Build Tool**: Vite 8.1.5
- **TypeScript Version**: 7.0.2
- **Target Runtime**: Modern browsers with ES2022 support
- **Deployment**: GitHub Pages through the workflow in `.github/workflows/deploy.yml`
- **Base Path**: `/effektavgift/`
- **Node Version**: 24.x (as used in CI)

## Build and Validation Instructions

### Prerequisites
- **Node.js**: 24.x is expected by CI; Node 20+ is usually sufficient for local work
- **Package Manager**: npm (package-lock.json is present)

### Installation
Always install dependencies before doing any build or TypeScript validation:
```bash
npm ci
```
If the repo has stale install state or missing dependencies, use a clean reinstall:
```bash
rm -rf node_modules dist
npm ci
```

### Build Commands (Execute in Order)

1. **TypeScript check + production build**
   ```bash
   npm run build
   ```
   - Runs `tsc && vite build`
   - `tsc` runs first and will fail on type problems before Vite starts
   - Vite outputs a production build to `dist/`
   - The build also generates static company pages under `dist/<company-id>/index.html`
   - Current builds generate only the companies that are currently active according to `effectiveDate` metadata

2. **Development server**
   ```bash
   npm run dev
   ```
   - Starts Vite on http://localhost:5173/effektavgift/
   - Hot reload is enabled
   - This does not run TypeScript checks by itself

3. **Preview of the production build**
   ```bash
   npm run preview
   ```
   - Runs the production build locally at http://localhost:4173/effektavgift/
   - Only useful after `npm run build`

4. **Fast TypeScript validation without emitting files**
   ```bash
   npx tsc --noEmit
   ```
   - Quick validation when you want to check types without rebuilding assets

### Validation Steps
- There is no linting or test harness configured for this project
- TypeScript compilation with strict settings is the primary validation signal
- The GitHub Actions workflow in `.github/workflows/deploy.yml` validates the production build on pushes to `main`

### Clean Build Process
If you encounter build issues, use the repo's clean rebuild pattern:
```bash
rm -rf node_modules dist
npm ci
npm run build
```
This is the safest reset when dependencies or generated output are stale.

### Common Pitfalls
- **Do NOT run `npm run build` before installing dependencies**. This can fail with missing TypeScript types such as:
  ```
  error TS2688: Cannot find type definition file for 'navigation-api-types'.
  ```
  Workaround: run `npm ci` first, or remove stale `node_modules` and reinstall.
- The build command runs `tsc` before Vite. A TypeScript error blocks the bundle step.
- The repo uses a GitHub Pages base path of `/effektavgift/` in `vite.config.ts`; changing it without understanding the deployment impact is risky.
- When changing `src/companies.json`, rebuild so generated static company pages reflect the new data.

## Known Issues and Workarounds

### Missing dependency/types errors
Observed error pattern:
```text
TS2688: Cannot find type definition file for 'navigation-api-types'
```
Causes:
- `node_modules` was not installed
- stale dependency state after a partial install or manual edits to the lockfile

Workaround:
```bash
rm -rf node_modules dist
npm ci
npm run build
```
This resolves the missing type definitions and ensures a clean build.

### Active company pages are filtered by date
The app intentionally only exposes companies whose `effectiveDate` has arrived or does not exist. In the current build, only active companies are generated; the raw JSON file may include more entries than the built static pages.

### Dependency audit notice
A regular `npm ci` reports one high-severity audit warning from npm. This does not currently block a local build, but it is worth reviewing before making dependency updates.

## Project Layout and Architecture

### Directory Structure
```
.
├── .github/
│   ├── workflows/
│   │   └── deploy.yml          # GitHub Pages deploy workflow
│   ├── copilot-instructions.md # This file
│   └── dependabot.yml          # Dependabot config
├── src/
│   ├── home.ts                 # Home page; company list + sorting + geolocation
│   ├── display.ts              # Display page; per-company status + countdown
│   ├── tariff.ts               # Core business logic; holiday + tariff rules
│   ├── utils.ts                # HTML escaping helper for XSS protection
│   ├── style.css               # App styling
│   └── companies.json          # Company metadata and tariff parameters
├── index.html                  # Root entry point
├── package.json                # Dependencies and scripts
├── package-lock.json           # Exact locked dependency versions
├── tsconfig.json               # Strict TypeScript config
├── vite.config.ts              # Vite config, page generation, base path
├── .gitignore                  # Ignores node_modules, dist, logs, editor junk
└── dist/                       # Generated build output; not tracked in source control
```

### Architecture Overview

**Application type**: client-side SPA with static generated display pages for each company; no client-side router.

**Key source files**:
1. **`src/home.ts`**
   - Home page entry point
   - Renders the company list and supports sorting by name or distance
   - Uses browser geolocation when available
   - Reads `window.__COMPANIES_DATA__` injected by Vite

2. **`src/display.ts`**
   - Display page entry point for an individual company
   - Shows current high-load/low-load status and countdowns
   - Supports fullscreen behavior
   - Reads `window.__COMPANY_DATA__` injected by Vite

3. **`src/tariff.ts`**
   - Core tariff logic and holiday rules
   - Includes `isHighLoadPeriod()` and `getNextTariffChange()`
   - Uses Swedish time via `Europe/Stockholm`

4. **`src/utils.ts`**
   - Utility function for escaping HTML before insertion into the DOM

5. **`src/companies.json`**
   - Company metadata including id, name, hours, months, weekdays, coordinates, and optional `effectiveDate`

6. **`src/style.css`**
   - Application styling for the home and detail pages

### Configuration Files

**`tsconfig.json`**:
- Target: ES2022
- Strict mode enabled
- Bundler-style module resolution
- `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` enabled
- Includes the `navigation-api-types` package for browser API typings

**`vite.config.ts`**:
- Sets the base path to `/effektavgift/`
- Generates static pages for each active company during the build
- Injects company data into the HTML at build time

**`package.json`**:
- Module type: `"module"`
- Scripts: `dev`, `build`, and `preview`
- Dev dependencies include Vite, TypeScript, Node typings, and `navigation-api-types`

### GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

**Triggers**: push to `main`

**Build job**:
1. Check out the repository
2. Set up Node 24 with npm cache
3. Run `npm ci`
4. Run `npm run build`
5. Upload the generated `dist` artifact

**Deploy job**:
1. Deploy the Pages artifact to GitHub Pages

**Important**: CI uses `npm ci` intentionally for reproducible installs.

### Dependencies
- No runtime dependencies; this is a client-side vanilla TypeScript app
- Main dev dependencies are Vite and TypeScript plus Node and browser typings

### Key Application Logic
- Routing is static: one HTML page per company is generated during build
- All tariff timing is calculated in-browser from JavaScript `Date` objects in Swedish local time
- State is intentionally minimal; pages update by re-rendering the current status
- Styling is plain CSS, not a CSS framework or preprocessor

### Making Changes

**When modifying tariff logic**: edit `src/tariff.ts`
- Update holiday calculations and time-window rules
- Keep Sweden-local time handling consistent
- Validate with `npx tsc --noEmit` and `npm run build`

**When adding or modifying companies**: edit `src/companies.json`
- Include required fields such as `id`, `name`, `highLoadMonths`, `highLoadHours`, `highLoadWeekdays`, and `coordinates`
- Use `effectiveDate` when a company should not yet appear in the public list
- Rebuild so generated pages match the updated data

**When modifying the home page**: edit `src/home.ts`
- Keep sorting and distance logic simple and deterministic
- Validate browser and type behavior with a rebuild

**When modifying the display page**: edit `src/display.ts`
- Preserve the current countdown and status semantics
- Rebuild after any logic or rendering change

**When modifying build-time page generation**: edit `vite.config.ts`
- Keep the GitHub Pages base path and generated company pages consistent
- Rebuild to validate the output structure

**When modifying styles**: edit `src/style.css`
- Prefer small CSS changes that match the current app patterns

### Validation Before Commit
1. Run `npx tsc --noEmit`
2. Run `npm run build`
3. Confirm the generated `dist/` output exists
4. Optionally preview locally with `npm run preview`

## Instructions for Agents

**Trust these instructions first**; only search the codebase if these instructions are incomplete or obviously stale.

**Key facts**:
- This repository is intentionally small and focused; avoid unnecessary abstraction or framework changes
- There is no test framework configured; rely on TypeScript checks and a production build for validation
- There is no lint script configured in `package.json`
- The app uses vanilla TypeScript and plain CSS; do not add a framework unless specifically requested
- All time logic is performed client-side in Swedish local time; there is no backend API
- GitHub Pages deployment is automatic on push to `main`; do not adjust workflow files unless the task explicitly requires it
- If a build fails because TypeScript cannot find `navigation-api-types`, reinstall dependencies with `npm ci` before troubleshooting deeper
