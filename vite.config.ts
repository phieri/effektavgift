/*
 * Copyright (c) 2025, Philip Eriksson
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import { defineConfig } from 'vite'
import * as path from 'path'
import * as fs from 'fs'

// Load company data
interface CompanyJSON {
  id: string;
  name: string;
}

const companiesData: CompanyJSON[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './src/companies.json'), 'utf-8')
);

export default defineConfig({
  base: '/effektavgift/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        display: path.resolve(__dirname, 'src/display.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'generate-company-pages',
      closeBundle() {
        const distDir = path.resolve(__dirname, './dist');
        const basePath = '/effektavgift';

        console.log('\nGenerating static HTML pages for companies...');

        companiesData.forEach(company => {
          const companyDir = path.join(distDir, company.id);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(companyDir)) {
            fs.mkdirSync(companyDir, { recursive: true });
          }
          
          // Generate HTML for this company
          const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="Visa om det är höglast eller låglast för effektavgift hos ${company.name}">
  <title>${company.name} - Effektavgift</title>
  <script type="module" crossorigin src="${basePath}/assets/display.js"></script>
  <link rel="stylesheet" crossorigin href="${basePath}/assets/style.css">
  <script>
    // Pass company ID to the app
    window.__COMPANY_ID__ = "${company.id}";
  </script>
</head>
<body>
  <div id="app" role="application" aria-label="Effektavgift status applikation"></div>
</body>
</html>
`;
          
          // Write index.html
          fs.writeFileSync(path.join(companyDir, 'index.html'), html);
          console.log(`  Generated ${company.id}/index.html`);
        });

        console.log(`Generated ${companiesData.length} company pages.\n`);
      }
    }
  ]
})

