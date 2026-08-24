# Notes Viewer

A minimal, mobile-first [PWA](https://en.wikipedia.org/wiki/Progressive_web_app) for browsing and searching markdown notes stored in a GitHub repository.

Barebones mobile-friendly web app for browsing and editing text notes stored in a GitHub repository.

Inspired by nvAlt and the lack of open-source alternatives, coded by aadm with MiMo V2.5 Free in OpenCode.

Still to do:

- [ ] add content search

## Table of Contents

- [Features](#features)
- [Design Specifications](#design-specifications)
- [Setup](#setup)
- [Mobile Usage](#mobile-usage)
- [How It Works](#how-it-works)
- [File Structure](#file-structure)
- [Customization](#customization)

## Features

- File browsing with folder navigation
- Filename search (instant, client-side filtering)
- Content search (GitHub code search API)
- Markdown rendering with image support (relative paths resolved to raw GitHub URLs)
- Basic editor with save (creates Git commits via GitHub API)
- Light/dark theme toggle
- Sort files by name, size, or last updated
- Toggle visibility of dotfiles, subfolders, and numerical filename prefixes
- Toggle size/date columns for compact view on small screens
- Installable as a PWA on mobile and desktop
- Works offline (static assets cached by service worker)
- About dialog with app information

## Design Specifications

### Typography

- **UI font:** Inter (weights 400, 500, 600, 700)
- **Monospace font:** JetBrains Mono (weights 400, 500)
- **Icon set:** Google Material Symbols Outlined (variable font, 20px default)
- **Fallback stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Mono fallback:** `'SF Mono', Monaco, Consolas, monospace`

### Color Palette

#### Dark Theme (default)

| Token             | Value       | Usage                        |
| ----------------- | ----------- | ---------------------------- |
| `--bg`            | `#0d1117`   | Page background              |
| `--bg-secondary`  | `#161b22`   | Cards, header, inputs        |
| `--bg-tertiary`   | `#21262d`   | Hover states                 |
| `--border`        | `#30363d`   | Borders, dividers            |
| `--text`          | `#e6edf3`   | Primary text                 |
| `--text-secondary`| `#8b949e`   | Secondary text, labels       |
| `--accent`        | `#58a6ff`   | Links, active states, icons  |
| `--accent-hover`  | `#79c0ff`   | Link hover                   |
| `--accent-glow`   | `rgba(88,166,255,0.15)` | Focus rings, highlights |
| `--danger`        | `#f85149`   | Errors, destructive actions  |
| `--success`       | `#3fb950`   | Save button, confirmations   |
| `--code-bg`       | `#161b22`   | Code blocks, inline code     |

#### Light Theme

| Token             | Value       | Usage                        |
| ----------------- | ----------- | ---------------------------- |
| `--bg`            | `#eeeae2`   | Page background (warm gray)  |
| `--bg-secondary`  | `#f7f5f0`   | Cards, header, inputs        |
| `--bg-tertiary`   | `#e4e0d8`   | Hover states                 |
| `--border`        | `#cdc8be`   | Borders, dividers            |
| `--text`          | `#2c2920`   | Primary text                 |
| `--text-secondary`| `#6b6560`   | Secondary text, labels       |
| `--accent`        | `#0969da`   | Links, active states, icons  |
| `--accent-hover`  | `#0550ae`   | Link hover                   |
| `--accent-glow`   | `rgba(9,105,218,0.1)` | Focus rings, highlights |
| `--danger`        | `#d1242f`   | Errors, destructive actions  |
| `--success`       | `#1a7f37`   | Save button, confirmations   |
| `--code-bg`       | `#ddd8ce`   | Code blocks, inline code     |

### Spacing and Borders

- **Border radius:** `12px` (cards, modals), `8px` (inputs, buttons, small elements)
- **Safe area inset:** Respected for iPhone notch (bottom)
- **Header:** Sticky with blur backdrop in dark mode

### Components

- **File list:** Table layout with Name, Size, Updated columns. Column headers are sortable. Size/Updated columns can be hidden for compact view.
- **Inline code:** JetBrains Mono font with `--code-bg` background, no border
- **Code blocks:** `--code-bg` background with 1px border (same variable as inline code for consistency)
- **Buttons:** Material Symbols icons, 34x34px, rounded
- **Search input:** Focus ring uses `--accent-glow`, clear (X) button positioned inside the input field

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Notes Viewer"
4. Select scope: `repo` (full control of private repositories)
5. Generate and copy the token

### 2. Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g., `notes-viewer`)
2. Push these files to it
3. Go to Settings > Pages
4. Set Source to "Deploy from a branch"
5. Select branch: `main`, folder: `/ (root)`
6. Save

Your app will be at: `https://yourusername.github.io/notes-viewer/`

### 3. Run Locally (for development)

```bash
cd notes-viewer
python3 -m http.server 8080
# Open http://localhost:8080
```

## Mobile Usage

### Installing as a PWA on iPhone

1. Open the app URL in Safari
2. Enter your GitHub username, repo name, and token
3. Tap "Connect"
4. Tap the Share button (square with arrow) at the bottom
5. Scroll down and tap "Add to Home Screen"
6. The app now appears on your home screen with its own icon

### What Gets Saved

When you install and use the app, the following data is stored **locally in your browser** (never sent to any server except GitHub):

- **GitHub token** - stored in `localStorage`, used only for GitHub API calls
- **Repository name and owner** - so you don't need to re-enter them
- **Theme preference** (light/dark)
- **Filter preferences** (show/hide dotfiles, folders, prefix toggle, columns toggle)

The token persists across sessions. You only need to enter it once. If you clear browser data or use a different device, you'll need to re-enter it.

### Offline Behavior

- Static assets (HTML, CSS, JS, fonts) are cached by the service worker
- The file tree is fetched fresh from GitHub each time you open the app
- You need an internet connection to browse files, search, or edit
- The app shell loads instantly from cache

## How It Works

### Architecture

- **Single HTML file** (`index.html`) - all HTML, CSS, and JavaScript inline
- **No build step** - vanilla JS, no frameworks, no npm
- **GitHub API** - all data comes from GitHub's REST API
- **PWA** - installable, cached static assets

### API Calls

| Operation           | Endpoint                                           | Notes                          |
| ------------------- | -------------------------------------------------- | ------------------------------ |
| Get repo info       | `GET /repos/{owner}/{repo}`                        | Gets default branch            |
| Get file tree       | `GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1` | All files at once |
| Get file content    | `GET /repos/{owner}/{repo}/contents/{path}`        | Returns base64 content         |
| Save file           | `PUT /repos/{owner}/{repo}/contents/{path}`        | Creates a commit               |
| Get commit history  | `GET /repos/{owner}/{repo}/commits?per_page=100`   | For "Updated" column           |
| Search code         | `GET /search/code?q={query}+repo:{owner}/{repo}`  | Requires `repo` scope          |

### Image Resolution

Images in markdown use relative paths (e.g., `img/photo.png`). The app resolves these to raw GitHub URLs:

```
https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{dir}/{image-path}
```

### State Management

All state is in a single `state` object. Key fields:

- `browsePath` - current directory being browsed (separate from `currentPath` which tracks the open file)
- `commitDates` - map of file path to last commit date
- `showDotfiles` / `showDirs` - filter toggles persisted to localStorage
- `hidePrefix` - hides numerical filename prefixes (e.g., `202608051608_`) for cleaner display
- `hideMetadata` - hides Size and Updated columns for compact view on small screens

## File Structure

```
notes-viewer/
  index.html      # Main app (all HTML/CSS/JS in one file)
  manifest.json   # PWA manifest
  sw.js           # Service worker for offline caching
  icons/          # App icons (192x192 and 512x512 PNG)
  README.md       # This file
```

## Customization

### Changing the Info Text

Edit the `showInfo()` function in `index.html`. Search for:

```javascript
function showInfo() {
```

The HTML inside the modal template can be modified directly.

### Changing Default Repository

Pre-fill the login form by setting values in the DOM or modifying the `handleLogin()` function.

### Adding Features

The app is intentionally minimal. If you need additional features, the single-file architecture makes it straightforward to modify.
