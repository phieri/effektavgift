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

import { powerGridCompanies, PowerGridCompany, getLoadStatus, getNextTariffChange, isEffektavgiftInEffect, formatEffectiveDate } from './tariff';
import { escapeHtml } from './utils';
import './style.css';

// Get company ID from global variable set in HTML
declare global {
  interface Window {
    __COMPANY_ID__?: string;
  }
}

// Render display page showing current load status
function renderDisplayPage(company: PowerGridCompany) {
  const app = document.getElementById('app');
  if (!app) return;

  const status = getLoadStatus(company);
  const isHighLoad = status === 'high';
  const basePath = '/effektavgift';
  const effektavgiftInEffect = isEffektavgiftInEffect(company);
  const escapedCompanyName = escapeHtml(company.name);
  
  // Generate notice HTML if effektavgift is not yet in effect
  const noticeHtml = !effektavgiftInEffect && company.effectiveDate
    ? `<div class="not-in-effect-notice" role="alert">
        <span class="notice-icon">⚠️</span>
        <span class="notice-text">Effektavgift kan börja gälla för ${escapedCompanyName} från ${formatEffectiveDate(company.effectiveDate)}. Kontakta ditt nätbolag för mer information.</span>
      </div>`
    : '';
  
  app.innerHTML = `
    <div class="display-container" role="main">
      <a href="${basePath}/" class="back-link" aria-label="Tillbaka till listan över nätbolag">← Tillbaka</a>
      <button class="fullscreen-link" id="fullscreen-btn" aria-label="Aktivera fullskärmsläge">Fullskärm</button>
      <div class="wake-lock-status" id="wake-lock-status" aria-live="polite"></div>
      <div class="status-content">
        <h1 class="company-name">${escapedCompanyName}</h1>
        ${noticeHtml}
        <div class="status-indicator" role="status" aria-live="polite" aria-atomic="true">
          <div class="status-text ${isHighLoad ? 'high-load' : 'low-load'}" aria-label="Nuvarande status: ${isHighLoad ? 'höglast' : 'låglast'}">${isHighLoad ? 'HÖGLAST' : 'LÅGLAST'}</div>
          <div class="status-description">
            ${isHighLoad 
              ? 'Effektavgift tillämpas nu' 
              : 'Ingen effektavgift'}
          </div>
        </div>
        <div class="countdown-container">
          <div class="countdown-label" id="countdown-label">Nästa ändring om:</div>
          <div class="countdown-display" role="timer" aria-live="off" aria-labelledby="countdown-label"></div>
        </div>
      </div>
    </div>
  `;
  
  // Add fade out functionality
  const backLink = app.querySelector('.back-link');
  const fullscreenBtn = app.querySelector('#fullscreen-btn') as HTMLButtonElement;
  const wakeLockStatusElement = app.querySelector('#wake-lock-status');
  
  if (backLink) {
    // Fade out buttons and wake lock status after 5 seconds
    let fadeOutTimer = setTimeout(() => {
      backLink.classList.add('fade-out');
      if (fullscreenBtn) fullscreenBtn.classList.add('fade-out');
      if (wakeLockStatusElement) wakeLockStatusElement.classList.add('fade-out');
    }, 5000);
    
    // Show buttons and wake lock status on mouse movement
    const showButtons = () => {
      backLink.classList.remove('fade-out');
      if (fullscreenBtn) fullscreenBtn.classList.remove('fade-out');
      if (wakeLockStatusElement) wakeLockStatusElement.classList.remove('fade-out');
      clearTimeout(fadeOutTimer);
      // Set up fade out again after 5 seconds of no movement
      fadeOutTimer = setTimeout(() => {
        backLink.classList.add('fade-out');
        if (fullscreenBtn) fullscreenBtn.classList.add('fade-out');
        if (wakeLockStatusElement) wakeLockStatusElement.classList.add('fade-out');
      }, 5000);
    };
    
    app.addEventListener('mousemove', showButtons);
  }
  
  // Add fullscreen functionality with wake lock
  if (fullscreenBtn) {
    let wakeLock: WakeLockSentinel | null = null;
    const wakeLockStatus = app.querySelector('#wake-lock-status');
    
    const clearWakeLockStatus = () => {
      if (wakeLockStatus) {
        wakeLockStatus.textContent = '';
        wakeLockStatus.classList.remove('active');
      }
    };
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && navigator.wakeLock?.request) {
          wakeLock = await navigator.wakeLock.request('screen');
          if (wakeLockStatus) {
            wakeLockStatus.textContent = 'Skärmen hålls aktiv';
            wakeLockStatus.classList.add('active');
          }
          
          // Listen for wake lock release
          wakeLock.addEventListener('release', () => {
            clearWakeLockStatus();
            wakeLock = null;
          });
        }
      } catch (err) {
        console.error('Wake Lock request failed:', err);
      }
    };
    
    const releaseWakeLock = async () => {
      if (wakeLock) {
        try {
          await wakeLock.release();
        } catch (err) {
          console.error('Wake Lock release failed:', err);
        }
      }
      clearWakeLockStatus();
    };
    
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Update button text and wake lock based on fullscreen state
    const updateFullscreenButtonText = () => {
      if (document.fullscreenElement) {
        fullscreenBtn.textContent = 'Avsluta fullskärm';
        fullscreenBtn.setAttribute('aria-label', 'Avsluta fullskärmsläge');
        requestWakeLock();
      } else {
        fullscreenBtn.textContent = 'Fullskärm';
        fullscreenBtn.setAttribute('aria-label', 'Aktivera fullskärmsläge');
        releaseWakeLock();
      }
    };
    
    document.addEventListener('fullscreenchange', updateFullscreenButtonText);
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
      renderDisplayPage(company);
    }
  }, 34567);
  
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

// Initialize display page
function initDisplayPage() {
  const companyId = window.__COMPANY_ID__;
  if (!companyId) {
    console.error('No company ID provided');
    return;
  }
  
  const company = powerGridCompanies.find(c => c.id === companyId);
  if (!company) {
    console.error(`Company not found: ${companyId}`);
    return;
  }
  
  renderDisplayPage(company);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDisplayPage);
} else {
  initDisplayPage();
}
