// ==UserScript==
// @name         GC Drafts - PGC Checker
// @namespace    https://github.com/sernikk-gc/gcscripts
// @version      1.2.0
// @description  Dodaje link do Project-GC Challenge Checker przy szkicach typu challenge na stronie Drafts geocaching.com.
// @author       sernikk (+GPT)
// @match        https://www.geocaching.com/account/drafts*
// @run-at       document-end
// @grant        none
// @downloadURL  https://github.com/sernikk-gc/GC-scripts/raw/refs/heads/main/GC%20Drafts%20-%20PGC%20Checker.user.js
// @updateURL    https://github.com/sernikk-gc/GC-scripts/raw/refs/heads/main/GC%20Drafts%20-%20PGC%20Checker.user.js
// ==/UserScript==

(function () {
  'use strict';

  const CHECKER_BASE = 'https://project-gc.com/Challenges/';

  // Dodaj prosty CSS dla ikonki
  function injectStyles() {
    if (document.getElementById('gc-challenge-checker-style')) return;
    const style = document.createElement('style');
    style.id = 'gc-challenge-checker-style';
    style.textContent = `
      .challenge-checker-link {
        margin-right: 3rem; /* ok. 80 px przy 16px font-size, ale responsywnie */
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }
      .challenge-checker-link .icon {
        display: block;
      }
      .challenge-checker-link .pgc-label {
        font-size: 9px;
        line-height: 1;
        margin-top: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  // Sprawdza, czy nazwa cache zawiera "challenge"
  function isChallengeCache(titleEl) {
    if (!titleEl) return false;
    const name = (titleEl.textContent || '').toLowerCase();
    return name.includes('challenge');
  }

  // Pobiera kod GC z linku compose
  function getGcCode(draftContentEl) {
    if (!draftContentEl) return null;

    const link = draftContentEl.querySelector(
      'a[href*="/account/drafts/home/compose"]'
    );
    if (!link) return null;

    try {
      const url = new URL(link.href, window.location.origin);
      return url.searchParams.get('gc');
    } catch (e) {
      return null;
    }
  }

  // Dodaje przycisk checkera do pojedynczego draftu
  function addCheckerButtonToDraft(draftContentEl) {
    if (!draftContentEl) return;

    // zabezpieczenie przed wielokrotną obróbką
    if (draftContentEl.dataset.challengeCheckerProcessed === '1') return;
    draftContentEl.dataset.challengeCheckerProcessed = '1';

    const titleEl = draftContentEl.querySelector('h2.title');
    if (!isChallengeCache(titleEl)) {
      return; // nazwa nie zawiera "challenge" – nic nie robimy
    }

    const gcCode = getGcCode(draftContentEl);
    if (!gcCode) return;

    const root = draftContentEl.parentElement;
    if (!root) return;

    const actions = root.querySelector('.draft-actions');
    if (!actions) return;

    // Sprawdź, czy już nie dodaliśmy przycisku
    if (actions.querySelector('.challenge-checker-link')) return;

    const checkerUrl = CHECKER_BASE + encodeURIComponent(gcCode);

    const link = document.createElement('a');
    link.href = checkerUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'btn-icon challenge-checker-link';
    link.title = 'Project-GC challenge checker';

    // Ikona wykrzyknika w kółku + napis "PGC" pod spodem
    link.innerHTML = `
      <svg class="icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2"></circle>
        <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2"></line>
        <circle cx="12" cy="17" r="1.5" fill="currentColor"></circle>
      </svg>
      <span class="pgc-label" aria-hidden="true">PGC</span>
      <span class="visuallyhidden">Challenge checker</span>
    `;

    // Wstawiamy przed przyciskiem Delete, żeby wyglądało naturalnie
    const deleteBtn = actions.querySelector('.js-delete');
    if (deleteBtn) {
      actions.insertBefore(link, deleteBtn);
    } else {
      actions.appendChild(link);
    }
  }

  // Przeskanuj wszystkie aktualnie widoczne drafty
  function scanAllDrafts() {
    const drafts = document.querySelectorAll('#draftList .draft-content');
    drafts.forEach(addCheckerButtonToDraft);
  }

  // Obserwuje #draftList (doładowywane szkice)
  function initDraftsObserver() {
    const list = document.querySelector('#draftList');
    if (!list) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches('.draft-content')) {
            addCheckerButtonToDraft(node);
          } else if (node.querySelectorAll) {
            const innerDrafts = node.querySelectorAll('.draft-content');
            innerDrafts.forEach(addCheckerButtonToDraft);
          }
        });
      }
    });

    observer.observe(list, { childList: true, subtree: true });
  }

  // Czekamy aż pojawi się #draftList (bo to jest renderowane JS-em)
  function waitForDraftListAndStart() {
    const existing = document.querySelector('#draftList');
    if (existing) {
      injectStyles();
      scanAllDrafts();
      initDraftsObserver();
      return;
    }

    const bodyObserver = new MutationObserver(() => {
      const listNow = document.querySelector('#draftList');
      if (listNow) {
        bodyObserver.disconnect();
        injectStyles();
        scanAllDrafts();
        initDraftsObserver();
      }
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDraftListAndStart);
  } else {
    waitForDraftListAndStart();
  }
})();
