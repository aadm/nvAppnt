# nvAppnt

Barebones mobile-friendly web app (or [PWA](https://en.wikipedia.org/wiki/Progressive_web_app)) for browsing and editing text notes stored in a GitHub repository.

Inspired by nvAlt and the lack of open-source alternatives, coded by aadm with MiMo V2.5 Free in OpenCode.

Launch it here: [`https://aadm.github.io/nvAppnt/`](`https://aadm.github.io/nvAppnt/`)

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
- Content search (searches inside note text, indexed client-side via Git blobs API)
- Markdown rendering with image support (works with private repos via authenticated Git Blobs API)
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

1. Create a new repository on GitHub (e.g., `nvAppnt`)
2. Push these files to it
3. Go to Settings > Pages
4. Set Source to "Deploy from a branch"
5. Select branch: `main`, folder: `/ (root)`
6. Save

The app will be at: `https://aadm.github.io/nvAppnt/`

Or:

```bash
gh auth login

# Create repo and push in one go
cd ~/nvAppnt
git init
git add .
git commit -m "nvAppnt initial commit"
gh repo create nvAppnt --public --source=. --push
```

Then enable GitHub Pages:

```bash
gh api repos/aadm/notes-viewer/pages -X PUT -f build_type=legacy -f source.branch=main -f source.path=/
```


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
| Get blob content    | `GET /repos/{owner}/{repo}/git/blobs/{sha}`        | Used for content search indexing |

### Content Search

Content search does not use GitHub's `/search/code` endpoint (its index lags for private
repos and returned inconsistent results). Instead, the app fetches the raw content of every
`.md`/`.markdown`/`.txt` file via the Git Blobs API and searches client-side.

- Content is cached in memory keyed by blob **sha**, so it stays valid across tree refreshes
  and only re-fetches files whose content actually changed.
- The first content search after opening the app triggers an indexing pass (parallel fetches,
  8 at a time); a progress indicator shows while this runs. Subsequent searches are instant.
- Matches show a highlighted snippet of surrounding text.
- The cache is cleared on logout.


### Image Resolution

Images in markdown use relative paths (e.g., `img/photo.png`). Since notes are usually kept in a
**private** repo, a plain `<img src="https://raw.githubusercontent.com/...">` does not work: that's
an unauthenticated browser request, and GitHub's raw content CDN returns 404 for private repos
regardless of whether the file actually exists.

Instead, relative image paths are resolved against the file's directory to a repo-relative path,
looked up in the already-loaded Git tree to find the blob sha, then fetched through the
authenticated **Git Blobs API** (`GET /repos/{owner}/{repo}/git/blobs/{sha}`) and converted to a
`blob:` object URL:

1. Renderer emits `<img data-gh-path="{repo-relative-path}" class="img-loading">` as a placeholder.
2. After the HTML is inserted into the DOM, `resolveGithubImages()` scans for these placeholders,
   fetches each blob's base64 content, decodes it into a `Blob`, and swaps in an object URL.
3. Object URLs are cached in memory keyed by blob sha and revoked on logout.

Absolute `http(s)://` and `data:` image URLs are left untouched and rendered directly (no auth
needed for external images).

### State Management

All state is in a single `state` object. Key fields:

- `browsePath` - current directory being browsed (separate from `currentPath` which tracks the open file)
- `commitDates` - map of file path to last commit date
- `showDotfiles` / `showDirs` - filter toggles persisted to localStorage
- `hidePrefix` - hides numerical filename prefixes (e.g., `202608051608_`) for cleaner display
- `hideMetadata` - hides Size and Updated columns for compact view on small screens
- `searchMode` - `filename` or `content`, toggled via the search box button
- `contentCache` - map of blob sha to decoded file content, used for content search indexing

## File Structure

```
notes-viewer/
  index.html      # Main app (all HTML/CSS/JS in one file)
  manifest.json   # PWA manifest
  sw.js           # Service worker for offline caching
  icons/          # App icons (192x192 and 512x512 PNG)
  README.md       # This file
```


