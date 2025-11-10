import { powerGridCompanies, PowerGridCompany, getLoadStatus } from './tariff';

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
  }
  
  return { page: 'home' };
}

// Render home page with company list
function renderHomePage(app: HTMLElement) {
  const basePath = '/effektavgift/';
  
  app.innerHTML = `
    <div class="home-container">
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
        <div class="time-display">${formatDateTime(new Date())}</div>
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
  }
  
  // Update time every second
  const updateInterval = setInterval(() => {
    const newStatus = getLoadStatus(company);
    const timeDisplay = app.querySelector('.time-display');
    if (timeDisplay) {
      timeDisplay.textContent = formatDateTime(new Date());
    }
    
    // If status changed, re-render the page
    if (newStatus !== status) {
      clearInterval(updateInterval);
      renderDisplayPage(app, company);
    }
  }, 1000);
}

function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return date.toLocaleDateString('sv-SE', options);
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
