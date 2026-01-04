# Copilot Instructions for effektavgift

## Repository Summary

**effektavgift** is a Swedish web application that displays whether it's currently a high-load or low-load period for electricity grid demand charges (effektavgift) for various Swedish power grid companies. The app helps users understand when they should minimize electricity usage to avoid demand charges.

### High-Level Details
- **Type**: Single Page Application (SPA) for web browsers
- **Size**: Small codebase (~13 files, 6 source files: home.ts, display.ts, tariff.ts, utils.ts, style.css, companies.json)
- **Languages**: TypeScript (strict mode), CSS3, HTML5
- **Framework**: Vanilla JavaScript/TypeScript (no framework like React/Vue)
- **Build Tool**: Vite 7.3.0
- **Target Runtime**: Modern web browsers (ES2022)
- **Deployment**: GitHub Pages (automated via GitHub Actions)
- **Base Path**: `/effektavgift/` (GitHub Pages subdirectory)
- **Node Version**: 24.x (as specified in CI workflow - line 27 of deploy.yml)

## Build and Validation Instructions

### Prerequisites
- **Node.js**: 24.x (CI uses Node 24, but Node 20+ will work)
- **Package Manager**: npm (uses package-lock.json v3)

### Installation
**ALWAYS run one of these commands first before any other build step:**
```bash
npm ci          # Use in CI or for clean installs (faster, respects lock file exactly)
npm install     # Use for development (updates lock file if needed)
```

### Build Commands (Execute in Order)

1. **TypeScript Compilation + Production Build**
   ```bash
   npm run build
   ```
   - Runs `tsc && vite build`
   - TypeScript compiler runs first (with strict mode enabled)
   - Vite builds for production into `dist/` directory
   - Takes ~1.9 seconds on typical hardware (includes TypeScript check + Vite build)
   - Output: `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`, plus 18 company-specific HTML pages
   - **Build will fail if TypeScript errors exist**
   - Generates individual HTML pages for each company in `dist/<company-id>/index.html`

2. **Development Server**
   ```bash
   npm run dev
   ```
   - Starts Vite development server on http://localhost:5173/effektavgift/
   - Hot module replacement enabled
   - Starts quickly (under 1 second)
   - Does NOT type-check on startup (use tsc for that)

3. **Preview Production Build**
   ```bash
   npm run preview
   ```
   - Previews the production build locally
   - Runs on http://localhost:4173/effektavgift/
   - Must run `npm run build` first

4. **TypeScript Type Checking (No Build)**
   ```bash
   npx tsc --noEmit
   ```
   - Validates TypeScript without generating output
   - Runs quickly (~1-2 seconds)
   - **Use this for fast validation during development**

### Validation Steps
- **No linting or testing configured** - there are no `npm test` or `npm run lint` commands
- TypeScript compilation with strict mode is the primary validation
- GitHub Actions workflow validates the build on push to `main` branch

### Clean Build Process
If you encounter any build issues, perform a clean build:
```bash
rm -rf node_modules dist
npm ci
npm run build
```
This sequence always works and takes ~1-2 seconds total.

### Common Pitfalls
- **Do NOT forget to install dependencies first** - running `npm run build` without `npm install` or `npm ci` will fail with:
  ```
  error TS2688: Cannot find type definition file for 'navigation-api-types'.
  ```
  This happens because TypeScript can't find the type definitions declared in tsconfig.json.
- The build command runs `tsc` first, then `vite build` - if TypeScript compilation fails, Vite build won't run
- The base path `/effektavgift/` is configured in `vite.config.ts` for GitHub Pages - don't modify without understanding impact
- When adding new companies to `companies.json`, you MUST rebuild to generate their static pages

## Project Layout and Architecture

### Directory Structure
```
.
├── .github/
│   ├── workflows/
│   │   └── deploy.yml          # GitHub Actions: build and deploy to GitHub Pages
│   ├── copilot-instructions.md # This file
│   └── dependabot.yml          # Dependabot configuration
├── src/
│   ├── home.ts                 # Home page: company list with sorting and geolocation
│   ├── display.ts              # Display page: shows load status for selected company
│   ├── tariff.ts               # Core business logic: tariff rules, holiday calculations
│   ├── utils.ts                # Utility functions (HTML escaping for XSS prevention)
│   ├── style.css               # All application styles
│   └── companies.json          # Company data (18 Swedish power grid companies)
├── index.html                  # Root HTML file (entry point for Vite)
├── package.json                # Dependencies and scripts
├── package-lock.json           # Exact dependency versions (lockfileVersion: 3)
├── tsconfig.json               # TypeScript configuration (strict mode enabled)
├── vite.config.ts              # Vite configuration (base path: /effektavgift/)
└── .gitignore                  # Excludes: node_modules/, dist/, *.log, .vscode/, .DS_Store, tmp/
```

### Architecture Overview

**Application Type**: Client-side SPA with static pre-generated pages for each company (no client-side routing)

**Key Source Files**:
1. **`src/home.ts`** (208 lines)
   - Home page entry point
   - Renders company list with sorting options (by name or distance)
   - Geolocation support to show nearest companies
   - Reads company data from `window.__COMPANIES_DATA__` (injected by Vite)

2. **`src/display.ts`** (236 lines)
   - Display page entry point for individual companies
   - Shows current load status (high/low) with real-time countdown
   - Fullscreen mode support
   - Reads company data from `window.__COMPANY_DATA__` (injected by Vite)
   - Updates every 1 second

3. **`src/tariff.ts`** (302 lines)
   - Core business logic for demand charge calculations
   - `PowerGridCompany` interface and `PowerGridCompanyJSON` interface
   - Swedish holiday calculation (Easter, Midsummer, All Saints' Day, etc.)
   - `isHighLoadPeriod()`: determines if current time is high-load
   - `getNextTariffChange()`: calculates next status change time
   - High load rules: typically November-March, weekdays 07:00-21:00, excluding holidays
   - All time calculations use Swedish time (Europe/Stockholm timezone)

4. **`src/utils.ts`** (27 lines)
   - Utility function `escapeHtml()` for XSS prevention
   - Used to sanitize company names before rendering in HTML

5. **`src/companies.json`** (161 lines)
   - Data for 18 Swedish power grid companies
   - Includes: id, name, high load months/hours/weekdays, effective date, coordinates

6. **`src/style.css`** (545 lines - CSS styles for entire app)

### Configuration Files

**`tsconfig.json`**:
- Target: ES2022 (not ES2020)
- Strict mode enabled
- Module resolution: bundler mode
- Linting options: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Include: `src` directory only
- Types: includes `navigation-api-types` for Navigation API support

**`vite.config.ts`**:
- Base path: `/effektavgift/` (critical for GitHub Pages)
- Output directory: `dist`
- Custom plugins:
  1. `inject-companies-data`: Injects company data into main index.html
  2. `generate-company-pages`: Generates static HTML pages for each company after build
- Multiple entry points: `index.html` (main), `src/display.ts` (display page)
- Reads `src/companies.json` at build time to generate pages

**`package.json`**:
- Module type: `"module"` (ES modules)
- Scripts: `dev`, `build`, `preview`
- Dev dependencies only:
  - `vite@^7.3.0`: Build tool and dev server
  - `typescript@^5.9.3`: TypeScript compiler
  - `@types/node@^25.0.3`: Node.js type definitions
  - `navigation-api-types@^0.6.1`: Navigation API types

### GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

**Triggers**: Push to `main` branch

**Build Job**:
1. Checkout code
2. Setup Node 24 with npm cache
3. `npm ci` (clean install)
4. `npm run build`
5. Upload `dist/` directory as artifact

**Deploy Job**:
1. Deploy artifact to GitHub Pages

**Important**: The workflow uses `npm ci` (not `npm install`) for reproducible builds.

### Dependencies
- **No runtime dependencies** - all code is vanilla TypeScript
- **Development dependencies**:
  - `vite@^7.3.0`: Build tool and dev server
  - `typescript@^5.9.3`: TypeScript compiler
  - `@types/node@^25.0.3`: Node.js type definitions
  - `navigation-api-types@^0.6.1`: Navigation API types

### Key Application Logic
- **Routing**: Static HTML pages pre-generated for each company (no client-side routing)
- **Time Calculations**: All done in-browser using JavaScript `Date` objects, converted to Swedish time (Europe/Stockholm)
- **State Management**: None - app re-renders on status changes
- **Styling**: Plain CSS, no preprocessor or CSS-in-JS
- **Data Injection**: Company data injected into HTML at build time via Vite plugins
- **Build-Time Page Generation**: Vite plugin generates one HTML page per company in `dist/<company-id>/index.html`

### Making Changes

**When modifying tariff logic**: Edit `src/tariff.ts`
- Modify holiday calculation functions to add/update holidays
- Update `isHighLoadPeriod()` to change load detection rules
- Update time zone handling (all time calculations use Swedish time via `toSwedishTime()`)

**When adding/modifying companies**: Edit `src/companies.json`
- Add new company entries with required fields: id, name, highLoadMonths, highLoadHours, highLoadWeekdays, coordinates
- Optional: effectiveDate (ISO date string) if effektavgift is not yet in effect
- After adding, rebuild to generate new company pages

**When modifying home page**: Edit `src/home.ts`
- Update company list rendering
- Modify sorting logic (by name or distance)
- Update geolocation handling

**When modifying display pages**: Edit `src/display.ts`
- Update status display (high/low load visualization)
- Modify countdown timer logic
- Update fullscreen mode behavior

**When modifying build-time page generation**: Edit `vite.config.ts`
- Update `generate-company-pages` plugin to change HTML template
- Modify `inject-companies-data` plugin to change data injection

**When modifying styles**: Edit `src/style.css`

**After changes**:
1. Run `npx tsc --noEmit` to validate TypeScript (fast)
2. Run `npm run build` to create production build
3. Run `npm run preview` to test the production build locally
4. Test at http://localhost:4173/effektavgift/

### Validation Before Commit
1. Ensure TypeScript compiles: `npx tsc --noEmit`
2. Ensure production build succeeds: `npm run build`
3. Verify output in `dist/` directory exists
4. If possible, test locally with `npm run preview`

## Instructions for Agents

**Trust these instructions first** - only search the codebase if information here is incomplete or appears incorrect. This will save significant exploration time.

**Key Facts**:
- This is a small, focused application - avoid over-engineering solutions
- No testing framework exists - don't try to run tests
- No linting is configured - rely on TypeScript strict mode for code quality
- The app uses vanilla TypeScript - don't suggest adding frameworks like React
- All times are calculated client-side - no backend or API calls
- GitHub Pages deployment is automatic on push to `main` - don't modify `.github/workflows/deploy.yml` unless specifically requested
