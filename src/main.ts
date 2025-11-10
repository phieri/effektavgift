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

import { powerGridCompanies, PowerGridCompany, getLoadStatus, getNextTariffChange } from './tariff';

// Simple router
function getCurrentRoute(): { page: string; companyId?: string } {
  const path = window.location.pathname;
  const basePath = '/effektavgift/'; // GitHub Pages base path
  
  // Remove base path to get the route
  const route = path.startsWith(basePath) 
    ? path.slice(basePath.length) 
    : path.slice(1); // Remove leading slash
  
  // Remove trailing slash if present
  const cleanRoute = route.endsWith('/') ? route.slice(0, -1) : route;
  
  if (cleanRoute && cleanRoute !== '') {
    // Check if it's a valid company ID
    const company = powerGridCompanies.find(c => c.id === cleanRoute);
    if (company) {
      return { page: 'display', companyId: cleanRoute };
    }
    // If company not found, redirect to home page
    window.history.replaceState(null, '', basePath);
  }
  
  return { page: 'home' };
}

// Render home page with company list
function renderHomePage(app: HTMLElement) {
  const basePath = '/effektavgift/';
  
  app.innerHTML = `
    <div class="home-container">
      <a href="https://github.com/phieri/effektavgift/" rel="noopener noreferrer" class="edit-github-link" title="Redigera på GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>Redigera på GitHub</span>
      </a>
      <h1>Effektavgift</h1>
      <p class="subtitle">Välj ditt nätbolag</p>
      <ul class="company-list">
        ${powerGridCompanies.map(company => `
          <li>
            <a href="${basePath}${company.id}/" class="company-link" data-link>
              ${company.name}
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  
  // Add click handlers for internal navigation
  app.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (href) {
        window.history.pushState(null, '', href);
        router();
      }
    });
  });
}

// Render display page showing current load status
function renderDisplayPage(app: HTMLElement, company: PowerGridCompany) {
  const status = getLoadStatus(company);
  const isHighLoad = status === 'high';
  const basePath = '/effektavgift/';
  
  app.innerHTML = `
    <div class="display-container ${isHighLoad ? 'high-load' : 'low-load'}">
      <a href="${basePath}" class="back-link" data-link>← Tillbaka</a>
      <div class="status-content">
        <h1 class="company-name">${company.name}</h1>
        <div class="status-indicator">
          <div class="status-text">${isHighLoad ? 'HÖGLAST' : 'LÅGLAST'}</div>
          <div class="status-description">
            ${isHighLoad 
              ? 'Effektavgift tillämpas nu' 
              : 'Ingen effektavgift'}
          </div>
        </div>
        <div class="countdown-container">
          <div class="countdown-label">Nästa ändring om:</div>
          <div class="countdown-display"></div>
        </div>
      </div>
    </div>
  `;
  
  // Add click handler for back link
  const backLink = app.querySelector('a[data-link]');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (href) {
        window.history.pushState(null, '', href);
        router();
      }
    });
    
    // Fade out back link after 5 seconds
    let fadeOutTimer = setTimeout(() => {
      backLink.classList.add('fade-out');
    }, 5000);
    
    // Show back link on mouse movement
    const showBackLink = () => {
      backLink.classList.remove('fade-out');
      clearTimeout(fadeOutTimer);
      // Set up fade out again after 5 seconds of no movement
      fadeOutTimer = setTimeout(() => {
        backLink.classList.add('fade-out');
      }, 5000);
    };
    
    app.addEventListener('mousemove', showBackLink);
  }
  

  const updateInterval = setInterval(() => {
    const newStatus = getLoadStatus(company);
    const countdownDisplay = app.querySelector('.countdown-display');
    if (countdownDisplay) {
      const countdown = getCountdownString(company);
      countdownDisplay.textContent = countdown;
    }
    
    // If status changed, re-render the page
    if (newStatus !== status) {
      clearInterval(updateInterval);
      renderDisplayPage(app, company);
    }
  }, 56789);
  
  // Initial countdown update
  const countdownDisplay = app.querySelector('.countdown-display');
  if (countdownDisplay) {
    countdownDisplay.textContent = getCountdownString(company);
  }
}

function getCountdownString(company: PowerGridCompany): string {
  const now = new Date();
  const nextChange = getNextTariffChange(company, now);
  const diff = nextChange.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Nu';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} dag${days !== 1 ? 'ar' : ''}`);
  if (hours > 0 || days > 0) parts.push(`${hours} timm${hours !== 1 ? 'ar' : 'e'}`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes} minut${minutes !== 1 ? 'er' : ''}`);
  
  return parts.join(' ');
}

// Main router function
function router() {
  const app = document.getElementById('app');
  if (!app) return;
  
  const route = getCurrentRoute();
  
  if (route.page === 'display' && route.companyId) {
    const company = powerGridCompanies.find(c => c.id === route.companyId);
    if (company) {
      renderDisplayPage(app, company);
    } else {
      renderHomePage(app);
    }
  } else {
    renderHomePage(app);
  }
}

// Initialize app
window.addEventListener('popstate', router);
window.addEventListener('DOMContentLoaded', router);
