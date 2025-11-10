# Copilot Instructions for effektavgift

## Repository Summary

**effektavgift** is a Swedish web application that displays whether it's currently a high-load or low-load period for electricity grid demand charges (effektavgift) for various Swedish power grid companies. The app helps users understand when they should minimize electricity usage to avoid demand charges.

### High-Level Details
- **Type**: Single Page Application (SPA) for web browsers
- **Size**: Small codebase (~11 files, 3 source files)
- **Languages**: TypeScript (strict mode), CSS3, HTML5
- **Framework**: Vanilla JavaScript/TypeScript (no framework like React/Vue)
- **Build Tool**: Vite 7.2.2
- **Target Runtime**: Modern web browsers (ES2020)
- **Deployment**: GitHub Pages (automated via GitHub Actions)
- **Base Path**: `/effektavgift/` (GitHub Pages subdirectory)
- **Node Version**: 20.x (as specified in CI workflow)

## Build and Validation Instructions

### Prerequisites
- **Node.js**: 20.x (CI uses Node 20)
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
   - Takes ~120-150ms on typical hardware
   - Output: `dist/index.html`, `dist/assets/*.js`, `dist/assets/*.css`, `dist/404.html`
   - **Build will fail if TypeScript errors exist**

2. **Development Server**
   ```bash
   npm run dev
   ```
   - Starts Vite development server on http://localhost:5173/effektavgift/
   - Hot module replacement enabled
   - Starts in ~170ms
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
- **Do NOT forget to install dependencies first** - running `npm run build` without `npm install` or `npm ci` will fail
- The build command runs `tsc` first, then `vite build` - if TypeScript compilation fails, Vite build won't run
- The base path `/effektavgift/` is configured in `vite.config.ts` for GitHub Pages - don't modify without understanding impact

## Project Layout and Architecture

### Directory Structure
```
.
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build and deploy to GitHub Pages
├── public/
│   └── 404.html                # SPA redirect handler for GitHub Pages routing
├── src/
│   ├── main.ts                 # Entry point: routing, UI rendering, countdown logic
│   ├── tariff.ts              # Core business logic: tariff rules, holiday calculations
│   └── style.css               # All application styles
├── index.html                  # Root HTML file (entry point for Vite)
├── package.json                # Dependencies and scripts
├── package-lock.json           # Exact dependency versions (lockfileVersion: 3)
├── tsconfig.json              # TypeScript configuration (strict mode enabled)
├── vite.config.ts             # Vite configuration (base path: /effektavgift/)
└── .gitignore                  # Excludes: node_modules/, dist/, *.log, .vscode/, .DS_Store
```

### Architecture Overview

**Application Type**: Client-side SPA with client-side routing (no server-side framework)

**Key Source Files**:
1. **`src/main.ts`** (191 lines)
   - Entry point and main application logic
   - Client-side router: handles navigation between home page and display pages
   - Renders two pages: home (company list) and display (load status for selected company)
   - Real-time countdown updates (updates every 1 second)
   - GitHub Pages SPA routing support (via `getCurrentRoute()`)

2. **`src/tariff.ts`** (213 lines)
   - Core business logic for demand charge calculations
   - `PowerGridCompany` interface and `powerGridCompanies[]` array (8 Swedish companies)
   - Swedish holiday calculation (Easter, Midsummer, All Saints' Day, etc.)
   - `isHighLoadPeriod()`: determines if current time is high-load
   - `getNextTariffChange()`: calculates next status change time
   - High load rules: November-March, weekdays 07:00-21:00, excluding holidays

3. **`src/style.css`** (CSS styles for entire app)

### Configuration Files

**`tsconfig.json`**:
- Target: ES2020
- Strict mode enabled
- Module resolution: bundler mode
- Linting options: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Include: `src` directory only

**`vite.config.ts`**:
- Base path: `/effektavgift/` (critical for GitHub Pages)
- Output directory: `dist`

**`package.json`**:
- Module type: `"module"` (ES modules)
- Scripts: `dev`, `build`, `preview`
- Dev dependencies only: `@types/node`, `typescript`, `vite`

### GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

**Triggers**: Push to `main` branch

**Build Job**:
1. Checkout code
2. Setup Node 20 with npm cache
3. `npm ci` (clean install)
4. `npm run build`
5. Upload `dist/` directory as artifact

**Deploy Job**:
1. Deploy artifact to GitHub Pages

**Important**: The workflow uses `npm ci` (not `npm install`) for reproducible builds.

### Dependencies
- **No runtime dependencies** - all code is vanilla TypeScript
- **Development dependencies**:
  - `vite@7.2.2`: Build tool and dev server
  - `typescript@5.9.3`: TypeScript compiler
  - `@types/node@24.10.0`: Node.js type definitions

### Key Application Logic
- **Routing**: Custom client-side router in `main.ts`, no third-party routing library
- **Time Calculations**: All done in-browser using JavaScript `Date` objects
- **State Management**: None - app re-renders on status changes
- **Styling**: Plain CSS, no preprocessor or CSS-in-JS
- **SPA Routing on GitHub Pages**: Handled via `404.html` redirect and `sessionStorage`

### Making Changes

**When modifying tariff logic**: Edit `src/tariff.ts`
- Modify `powerGridCompanies` array to add/update companies
- Update `isHighLoadPeriod()` to change load detection rules
- Update holiday calculations in `getSwedishHolidays()`

**When modifying UI/routing**: Edit `src/main.ts`
- Update `renderHomePage()` for company list changes
- Update `renderDisplayPage()` for status display changes
- Modify `router()` for routing logic changes

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
