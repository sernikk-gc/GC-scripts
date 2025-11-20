# GC Drafts

Userscript for [geocaching.com](https://www.geocaching.com) Drafts page.  
Adds a Project-GC challenge checker button next to drafts whose cache name contains "challenge".

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open this link in your browser: https://github.com/sernikk-gc/GC-scripts/raw/refs/heads/main/GC%20Drafts%20-%20PGC%20Checker.user.js
3. Tampermonkey should prompt you to install the script.

## Features

- Works on: `https://www.geocaching.com/account/drafts*`
- Detects caches with "challenge" in the title (case-insensitive).
- Adds a “PGC” exclamation icon next to the draft.
- Opens `https://project-gc.com/Challenges/<GC_CODE>` in a new tab.

