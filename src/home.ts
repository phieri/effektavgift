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

import { PowerGridCompanyJSON, parseCompaniesData } from './tariff';
import { escapeHtml } from './utils';
import './style.css';

// Get companies data from global variable set in HTML
declare global {
  interface Window {
    __COMPANIES_DATA__?: PowerGridCompanyJSON[];
  }
}

// Render home page with company list
function renderHomePage() {
  const app = document.getElementById('app');
  if (!app) return;

  // Get and parse companies data
  const companiesDataJson = window.__COMPANIES_DATA__;
  if (!companiesDataJson) {
    console.error('No companies data provided');
    return;
  }
  
  const companies = parseCompaniesData(companiesDataJson);

  const basePath = '/effektavgift';
  
  app.innerHTML = `
    <div class="home-container">
      <a href="https://github.com/phieri/effektavgift/" rel="noopener noreferrer" class="edit-github-link" title="Redigera på GitHub" aria-label="Redigera applikationen på GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>Redigera på GitHub</span>
      </a>
      <main>
        <h1>Effektavgift</h1>
        <p class="subtitle">Välj ditt nätbolag</p>
        <nav aria-label="Lista över nätbolag">
          <ul class="company-list">
            ${companies.map(company => {
              const escapedName = escapeHtml(company.name);
              return `
              <li>
                <a href="${basePath}/${company.id}/" class="company-link" aria-label="Visa effektavgiftsstatus för ${escapedName}">
                  ${escapedName}
                </a>
              </li>
            `;}).join('')}
          </ul>
        </nav>
      </main>
    </div>
  `;
}

// Initialize home page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderHomePage);
} else {
  renderHomePage();
}
