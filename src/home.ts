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

import { PowerGridCompanyJSON, parseCompaniesData, PowerGridCompany, calculateDistance } from './tariff';
import { escapeHtml } from './utils';
import './style.css';

// Get companies data from global variable set in HTML
declare global {
  interface Window {
    __COMPANIES_DATA__?: PowerGridCompanyJSON[];
  }
}

// User's location for distance calculation
let userLocation: { lat: number; lng: number } | null = null;

// Current sort mode
type SortMode = 'name' | 'distance';
let currentSortMode: SortMode = 'name';

// Sort companies based on the selected mode
function sortCompanies(companies: PowerGridCompany[], mode: SortMode): PowerGridCompany[] {
  const sorted = [...companies];
  
  if (mode === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  } else if (mode === 'distance' && userLocation) {
    const location = userLocation; // Capture in local const for TypeScript
    sorted.sort((a, b) => {
      const distA = calculateDistance(
        location.lat,
        location.lng,
        a.coordinates.lat,
        a.coordinates.lng
      );
      const distB = calculateDistance(
        location.lat,
        location.lng,
        b.coordinates.lat,
        b.coordinates.lng
      );
      return distA - distB;
    });
  }
  
  return sorted;
}

// Geolocation configuration constants
const GEOLOCATION_TIMEOUT_MS = 5000;
const GEOLOCATION_MAX_AGE_MS = 0;
const ERROR_MESSAGE_DURATION_MS = 5000;

// Get user's location using Geolocation API
function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS
      }
    );
  });
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
  const sortedCompanies = sortCompanies(companies, currentSortMode);

  const basePath = '/effektavgift';
  
  // Distance sort option - only enabled if we have user location
  const distanceSortDisabled = !userLocation;
  const distanceSortOption = distanceSortDisabled
    ? '<option value="distance" disabled>Avstånd (kräver platsåtkomst)</option>'
    : '<option value="distance">Avstånd</option>';
  
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
        <div class="sort-selector">
          <label for="sort-select">Sortera efter:</label>
          <select id="sort-select" aria-label="Välj sorteringsordning">
            <option value="name" ${currentSortMode === 'name' ? 'selected' : ''}>Namn</option>
            ${distanceSortOption}
          </select>
        </div>
        <nav aria-label="Lista över nätbolag">
          <ul class="company-list">
            ${sortedCompanies.map(company => {
              const escapedName = escapeHtml(company.name);
              let distanceText = '';
              if (currentSortMode === 'distance' && userLocation) {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  company.coordinates.lat,
                  company.coordinates.lng
                );
                distanceText = ` <span class="distance-info">(${Math.round(distance)} km)</span>`;
              }
              return `
              <li>
                <a href="${basePath}/${company.id}/" class="company-link" aria-label="Visa effektavgiftsstatus för ${escapedName}">
                  ${escapedName}${distanceText}
                </a>
              </li>
            `;}).join('')}
          </ul>
        </nav>
      </main>
    </div>
  `;
  
  // Add event listener to sort selector
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const newMode = (e.target as HTMLSelectElement).value as SortMode;
      if (newMode === 'distance' && !userLocation) {
        // Request location permission
        getUserLocation()
          .then((location) => {
            userLocation = location;
            currentSortMode = newMode;
            renderHomePage();
          })
          .catch((error) => {
            console.error('Failed to get user location:', error);
            // Show error in UI instead of using alert
            const sortSelector = document.querySelector('.sort-selector');
            if (sortSelector) {
              const errorMsg = document.createElement('div');
              errorMsg.textContent = 'Kunde inte hämta din plats. Kontrollera att du har tillåtit platsåtkomst.';
              errorMsg.style.color = '#e74c3c';
              errorMsg.style.fontSize = '0.9rem';
              errorMsg.style.marginTop = '0.5rem';
              sortSelector.appendChild(errorMsg);
              setTimeout(() => errorMsg.remove(), ERROR_MESSAGE_DURATION_MS);
            }
            // Reset to name sort (just update the select value, don't re-render)
            currentSortMode = 'name';
            if (sortSelect) {
              sortSelect.value = 'name';
            }
          });
      } else {
        currentSortMode = newMode;
        renderHomePage();
      }
    });
  }
}

// Initialize home page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderHomePage);
} else {
  renderHomePage();
}
