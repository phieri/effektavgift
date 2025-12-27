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
  highLoadMonths: number[];
  highLoadHours: { start: number; end: number };
  highLoadWeekdays: boolean;
  effectiveDate?: string;
  coordinates: { lat: number; lng: number };
}

const companiesData: CompanyJSON[] = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './src/companies.json'), 'utf-8')
);

// Helper function to escape HTML special characters for XSS prevention
// This is duplicated from src/utils.ts because vite.config.ts runs in Node context
// during build time and can't import from src/ TypeScript files
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Helper function to safely serialize JSON for injection into HTML
// Escapes special characters that could break out of script tags
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

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
      name: 'inject-companies-data',
      transformIndexHtml(html) {
        // Only transform the main index.html (home page)
        const companiesJson = safeJsonStringify(companiesData);
        return html.replace(
          '</head>',
          `  <script>
    // Inline all companies data directly in the HTML
    window.__COMPANIES_DATA__ = ${companiesJson};
  </script>
</head>`
        );
      }
    },
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
          const escapedName = escapeHtml(company.name);
          
          // Serialize company data as JSON to inline in HTML (with safe escaping)
          const companyDataJson = safeJsonStringify(company);
          
          const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="Visa om det är höglast eller låglast för effektavgift hos ${escapedName}">
  <title>${escapedName} - Effektavgift</title>
  <script type="module" crossorigin src="${basePath}/assets/display.js"></script>
  <link rel="stylesheet" crossorigin href="${basePath}/assets/style.css">
  <script>
    // Inline company data directly in the HTML
    window.__COMPANY_DATA__ = ${companyDataJson};
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

